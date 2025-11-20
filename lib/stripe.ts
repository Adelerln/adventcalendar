import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  // Allow overriding API version via env, fallback to latest
  const apiVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined;
  stripeClient = new Stripe(secretKey, apiVersion ? { apiVersion } : undefined);
  return stripeClient;
}

type AmountCheckoutParams = {
  amountCents: number;
  planLabel: string;
  buyerId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
};

type ProductCheckoutParams = {
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  productId: string;
  calendarId?: string;
  successUrl?: string;
  cancelUrl?: string;
  currency?: string;
};

type CreateCheckoutSessionOptions = AmountCheckoutParams | ProductCheckoutParams;

export async function createCheckoutSession(params: CreateCheckoutSessionOptions) {
  const stripe = getStripeClient();
  const host = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const successUrl = "successUrl" in params ? params.successUrl ?? `${host}/dashboard` : `${host}/dashboard`;
  const cancelUrl = "cancelUrl" in params ? params.cancelUrl ?? `${host}/dashboard` : `${host}/dashboard`;

  if ("amountCents" in params) {
    return stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: params.currency ?? "eur",
            product_data: {
              name: params.planLabel
            },
            unit_amount: params.amountCents
          },
          quantity: 1
        }
      ],
      metadata: {
        buyer_id: params.buyerId
      }
    });
  }

  const metadata: Record<string, string> = {};
  if ("calendarId" in params && params.calendarId) {
    metadata.calendar_id = params.calendarId;
  }

  return stripe.checkout.sessions.create({
    mode: params.mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        price: params.productId,
        quantity: 1
      }
    ],
    metadata: Object.keys(metadata).length ? metadata : undefined
  });
}
