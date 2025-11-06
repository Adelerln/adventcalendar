import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2025-10-29.clover",
  });
  return stripeClient;
}

export async function createCheckoutSession(params: {
  mode: "payment" | "subscription";
  productId: string;
  calendarId?: string;
}) {
  // Placeholder minimal session creation: expects existing price IDs mapped elsewhere
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/(dashboard)/dashboard`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing`;

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: params.mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        price: params.productId, // to be replaced by mapping to stripe price id
        quantity: 1,
      },
    ],
    metadata: params.calendarId ? { calendarId: params.calendarId } : undefined,
  });
  return session;
}
