import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { constructStripeEvent } from "@/lib/stripe";
import { findProjectById, updateProject } from "@/lib/projects-repository";
import { supabaseServer } from "@/lib/supabase";
import { sendPaymentConfirmationEmail, sendCalendarShareEmail } from "@/lib/email";
import { markBuyerPaymentAsPaid } from "@/lib/buyer-payment";
import {
  createCalendarRecord,
  computeNextDecember1st,
  getBuyerEmail
} from "@/lib/calendar-creation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("[stripe-webhook] STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe-webhook] Signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSession(session);
  } else if (event.type === "checkout.session.async_payment_failed") {
    console.warn("[stripe-webhook] async payment failed", event.id);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const projectId = session.metadata?.project_id;
  const buyerId = session.metadata?.buyer_id;

  // Update project if exists (for backward compatibility)
  if (projectId) {
    const project = await findProjectById(projectId);
    if (project) {
      await updateProject(project.id, {
        payment_status: "paid",
        status: "paid",
        stripe_checkout_session_id: session.id ?? null,
        payment_amount: typeof session.amount_total === "number" ? session.amount_total / 100 : project.payment_amount
      });
    } else {
      console.warn("[stripe-webhook] project not found", projectId);
    }
  }

  // Update buyer payment status and send confirmation email
  if (buyerId) {
    await markBuyerPaymentAsPaid({
      buyerId,
      stripeSessionId: session.id ?? "",
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null
    }).catch((error) => console.error("[stripe-webhook] markBuyerPaymentAsPaid failed", error));

    // Send payment confirmation email to buyer
    await sendPaymentConfirmationEmail(buyerId);

    // ✨ AUTO-CREATE CALENDAR: Créer automatiquement le calendrier après paiement
    await autoCreateCalendarAfterPayment(buyerId);
  } else if (projectId) {
    // Fallback: send email using project.user_id (for old sessions without buyerId)
    const project = await findProjectById(projectId);
    if (project) {
      await sendPaymentConfirmationEmail(project.user_id);
      // Try to auto-create calendar for legacy projects
      await autoCreateCalendarAfterPayment(project.user_id);
    }
  }
}

/**
 * Crée automatiquement un calendrier après un paiement réussi
 *
 * Étapes:
 * 1. Récupère le dernier receiver créé par ce buyer
 * 2. Vérifie qu'il n'existe pas déjà un calendrier actif
 * 3. Crée le calendrier avec token + code sécurisés
 * 4. Envoie un email au buyer avec le lien de partage et le code
 *
 * @param buyerId - ID de l'acheteur qui vient de payer
 */
async function autoCreateCalendarAfterPayment(buyerId: string): Promise<void> {
  try {
    console.info("[stripe-webhook] Starting auto-calendar creation for buyer", buyerId);

    const supabase = supabaseServer();

    // 1. Récupérer le dernier receiver créé par ce buyer
    const { data: receiver, error: receiverError } = await supabase
      .from("receivers")
      .select("id, full_name, email")
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (receiverError) {
      console.error("[stripe-webhook] Error fetching receiver", receiverError);
      return;
    }

    if (!receiver) {
      console.warn("[stripe-webhook] No receiver found for buyer", buyerId);
      return;
    }

    // 2. Vérifier qu'il n'existe pas déjà un calendrier actif
    const { data: existingCalendar, error: calendarError } = await supabase
      .from("calendars")
      .select("id")
      .eq("buyer_id", buyerId)
      .eq("status", "active")
      .maybeSingle();

    if (calendarError) {
      console.error("[stripe-webhook] Error checking existing calendar", calendarError);
    }

    if (existingCalendar) {
      console.info("[stripe-webhook] Calendar already exists for buyer", {
        buyerId,
        calendarId: existingCalendar.id
      });
      return;
    }

    // 3. Créer le calendrier automatiquement
    const result = await createCalendarRecord({
      buyerId,
      recipientId: receiver.id,
      title: "Mon calendrier de l'Avent",
      startDate: computeNextDecember1st(),
      timezone: "Europe/Paris",
      delivery: "email"
    });

    console.info("[stripe-webhook] Calendar auto-created successfully", {
      buyerId,
      calendarId: result.calendarId,
      recipientId: receiver.id
    });

    // 4. Récupérer les infos du buyer pour l'email
    const buyerEmail = await getBuyerEmail(buyerId);
    if (!buyerEmail) {
      console.error("[stripe-webhook] Buyer email not found", buyerId);
      return;
    }

    const { data: buyer } = await supabase
      .from("buyers")
      .select("full_name")
      .eq("id", buyerId)
      .maybeSingle();

    // 5. Envoyer l'email avec le lien de partage + code d'accès
    try {
      await sendCalendarShareEmail({
        buyerEmail,
        buyerName: buyer?.full_name || undefined,
        recipientName: receiver.full_name,
        shareUrl: result.shareUrl,
        accessCode: result.code,
        calendarId: result.calendarId
      });

      console.info("[stripe-webhook] Share email sent successfully", {
        buyerId,
        buyerEmail,
        calendarId: result.calendarId
      });
    } catch (emailError) {
      console.error("[stripe-webhook] Failed to send share email", emailError);
      // Ne pas bloquer si l'email échoue - le buyer pourra récupérer les infos dans le dashboard
    }

    console.info("[stripe-webhook] Auto-calendar creation completed", {
      buyerId,
      calendarId: result.calendarId,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/r/[token]`, // Log sans le vrai token
      code: "[REDACTED]" // Ne jamais logger le vrai code
    });
  } catch (error) {
    console.error("[stripe-webhook] Calendar auto-creation failed", error);
    // Ne pas faire échouer le webhook entier si la création du calendrier échoue
    // Le buyer pourra toujours créer manuellement via le dashboard
  }
}
