import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBuyerSession } from "@/lib/server-session";
import { getPlanPricing } from "@/lib/plan-pricing";
import { createCheckoutSession } from "@/lib/stripe";
import { markBuyerPaymentPending } from "@/lib/buyer-payment";
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
  prompt: z.string().max(4000).nullable().optional()
});

export async function POST(req: NextRequest) {
  const session = readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const bodyResult = payloadSchema.safeParse(await req.json().catch(() => ({})));
  if (!bodyResult.success) {
    return NextResponse.json({ error: "Payload invalide", details: bodyResult.error.flatten() }, { status: 400 });
  }

  const { projectId, imageFile, prompt } = bodyResult.data;
  const pricing = getPlanPricing(session.plan);

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

  const host = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripeSession = await createCheckoutSession({
    amountCents: pricing.amountCents,
    planLabel: pricing.label,
    buyerId: session.id,
    projectId: project.id,
    successUrl: `${host}/dashboard?payment=success`,
    cancelUrl: `${host}/dashboard?payment=cancelled`
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
}
