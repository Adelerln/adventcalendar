import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { readBuyerSession } from "@/lib/server-session";
import { getPlanPricing } from "@/lib/plan-pricing";
import { createCheckoutSession, resolveAppHost } from "@/lib/stripe";
import { markBuyerPaymentPending, markBuyerPaymentAsPaid, markBuyerPaymentAsPaidWithCode } from "@/lib/buyer-payment";
import {
  createProjectRecord,
  findProjectById,
  updateProject,
  type ProjectRecord
} from "@/lib/projects-repository";

export const runtime = "nodejs";

const payloadSchema = z.object({
  projectId: z.string().uuid().optional(),
  imageFile: z.string().max(2048).nullable().optional(),
  prompt: z.string().max(4000).nullable().optional(),
  promoCode: z.string().max(64).optional()
});

export async function POST(req: NextRequest) {
  try {
    const session = readBuyerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const bodyResult = payloadSchema.safeParse(await req.json().catch(() => ({})));
    if (!bodyResult.success) {
      return NextResponse.json({ error: "Payload invalide", details: bodyResult.error.flatten() }, { status: 400 });
    }

    const { projectId, imageFile, prompt, promoCode } = bodyResult.data;
    const pricing = getPlanPricing(session.plan);
    const promoApplied = typeof promoCode === "string" && promoCode.trim().toUpperCase() === "X-HEC-2026";

    let project: ProjectRecord | null = null;

    if (projectId) {
      project = await findProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
      }
      if (project.user_id !== session.id) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      if (project.payment_status === "paid") {
        return NextResponse.json({ error: "Ce projet est déjà payé" }, { status: 400 });
      }
      project =
        (await updateProject(project.id, {
          plan: pricing.plan,
          payment_amount: pricing.amountCents / 100,
          status: "pending",
          payment_status: "pending",
          image_file: typeof imageFile === "undefined" ? project.image_file ?? null : imageFile,
          prompt: typeof prompt === "undefined" ? project.prompt ?? null : prompt
        })) ?? project;
    } else {
      project = await createProjectRecord({
        userId: session.id,
        plan: pricing.plan,
        paymentAmount: pricing.amountCents / 100,
        status: "pending",
        paymentStatus: "pending",
        imageFile: imageFile ?? null,
        prompt: prompt ?? null
      });
    }

    const host = resolveAppHost();

    if (promoApplied) {
      await updateProject(project.id, {
        payment_status: "paid",
        status: "paid",
        payment_amount: 0,
        stripe_checkout_session_id: null
      });

      await markBuyerPaymentAsPaidWithCode({
        buyerId: session.id
      }).catch((error) => console.error("[create-checkout-session] markBuyerPaymentAsPaidWithCode failed", error));

      return NextResponse.json({
        checkoutUrl: `${host}/dashboard?payment=success&promo=1`,
        projectId: project.id
      });
    }

    const stripeSession = await createCheckoutSession({
      amountCents: pricing.amountCents,
      planLabel: pricing.label,
      buyerId: session.id,
      projectId: project.id,
      successUrl: `${host}/dashboard?payment=success`,
      cancelUrl: `${host}/dashboard?payment=cancelled`,
      metadata: { plan: pricing.plan }
    });

    if (!stripeSession.url) {
      return NextResponse.json({ error: "Stripe n'a pas renvoyé d'URL de paiement" }, { status: 502 });
    }

    await updateProject(project.id, {
      stripe_checkout_session_id: stripeSession.id,
      payment_amount: pricing.amountCents / 100,
      status: "awaiting_payment",
      payment_status: "pending"
    });

    await markBuyerPaymentPending({
      buyerId: session.id,
      plan: pricing.plan,
      amountEuros: pricing.amountCents / 100,
      stripeSessionId: stripeSession.id
    });

    return NextResponse.json({
      checkoutUrl: stripeSession.url,
      projectId: project.id
    });
  } catch (error) {
    console.error("[create-checkout-session] failed", error);
    const { message, details } = buildStripeErrorMessage(error);
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}

function buildStripeErrorMessage(error: unknown): { message: string; details?: string } {
  const unknownMessage = "Impossible de démarrer le paiement Stripe pour le moment. Réessayez ou contactez le support.";

  if (error instanceof Stripe.errors.StripeError) {
    const code = error.code ?? error.type ?? "stripe_error";
    return {
      message: `Stripe a renvoyé une erreur (${code}). Réessayez ou contactez le support si cela persiste.`,
      details: error.message
    };
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("STRIPE_SECRET_KEY")) {
      return {
        message: "Configuration Stripe manquante côté serveur. Contactez le support.",
        details: msg
      };
    }
    if (msg.includes("Stripe price ID or inline amount is required")) {
      return {
        message: "Aucun tarif Stripe configuré pour ce plan. Contactez le support.",
        details: msg
      };
    }
    return { message: msg, details: msg };
  }

  return { message: unknownMessage };
}
