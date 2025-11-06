import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export async function createCheckoutSession(params: {
  mode: "payment" | "subscription";
  productId: string;
  calendarId?: string;
}) {
  // Placeholder minimal session creation: expects existing price IDs mapped elsewhere
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/(dashboard)/dashboard`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing`;

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


