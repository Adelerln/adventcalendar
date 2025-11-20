import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getPlanPricing } from "@/lib/plan-pricing";
import { createCheckoutSession } from "@/lib/stripe";
import { markBuyerPaymentPending } from "@/lib/buyer-payment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const pricing = getPlanPricing(session.plan);

  const host = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripeSession = await createCheckoutSession({
    amountCents: pricing.amountCents,
    planLabel: pricing.label,
    buyerId: session.id,
    successUrl: `${host}/dashboard?payment=success`,
    cancelUrl: `${host}/dashboard?payment=cancelled`
  });

  if (!stripeSession.url) {
    return NextResponse.json({ error: "Stripe n'a pas renvoyé d'URL de paiement" }, { status: 502 });
  }

  await markBuyerPaymentPending({
    buyerId: session.id,
    plan: pricing.plan,
    amountEuros: pricing.amountCents / 100,
    stripeSessionId: stripeSession.id
  });

  return NextResponse.json({
    checkoutUrl: stripeSession.url
  });
}
