import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { constructStripeEvent } from "@/lib/stripe";
import { findProjectById, updateProject } from "@/lib/projects-repository";
import { supabaseServer } from "@/lib/supabase";
import { findBuyerById } from "@/lib/buyers-store";
import { sendDailyEmail } from "@/lib/email";
import { markBuyerPaymentAsPaid } from "@/lib/buyer-payment";

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

  if (projectId) {
    const project = await findProjectById(projectId);
    if (project) {
      await updateProject(project.id, {
        payment_status: "paid",
        status: "paid",
        stripe_checkout_session_id: session.id ?? null,
        payment_amount: typeof session.amount_total === "number" ? session.amount_total / 100 : project.payment_amount
      });

      await sendPaymentEmail(project.user_id);
    } else {
      console.warn("[stripe-webhook] project not found", projectId);
    }
  }

  if (buyerId) {
    await markBuyerPaymentAsPaid({
      buyerId,
      stripeSessionId: session.id ?? "",
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null
    }).catch((error) => console.error("[stripe-webhook] markBuyerPaymentAsPaid failed", error));
  }
}

async function sendPaymentEmail(buyerId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  let email: string | null = null;
  let fullName: string | null = null;

  if (supabaseUrl && supabaseServiceRole) {
    const supabase = supabaseServer();
    const { data } = await supabase.from("buyers").select("email, full_name").eq("id", buyerId).maybeSingle();
    email = data?.email ?? null;
    fullName = data?.full_name ?? null;
  } else {
    const buyer = findBuyerById(buyerId);
    if (buyer) {
      email = buyer.email;
      fullName = buyer.full_name;
    }
  }

  if (!email) return;

  await sendDailyEmail({
    to: email,
    subject: "Paiement validé – Calendrier de l'Avent",
    previewText: "Votre paiement est confirmé",
    html: `<p>Bonjour ${fullName ?? "cher client"},</p><p>Bravo, votre paiement est confirmé. Vous pouvez retourner sur votre espace pour générer votre calendrier.</p>`
  });
}
