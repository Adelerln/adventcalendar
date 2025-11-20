import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  const apiVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined;
  stripeClient = new Stripe(secretKey, apiVersion ? { apiVersion } : undefined);
  return stripeClient;
}

type AmountCheckoutParams = {
  amountCents: number;
  currency?: string;
  planLabel: string;
  buyerId?: string;
  projectId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type ProductCheckoutParams = {
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  productId: string;
  calendarId?: string;
  successUrl?: string;
  cancelUrl?: string;
  currency?: string;
};

export async function createCheckoutSession(params: AmountCheckoutParams | ProductCheckoutParams) {
  const stripe = getStripeClient();
  const host = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const successUrl = params.successUrl ?? `${host}/dashboard`;
  const cancelUrl = params.cancelUrl ?? `${host}/dashboard`;

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
        ...(params.buyerId ? { buyer_id: params.buyerId } : {}),
        ...(params.projectId ? { project_id: params.projectId } : {})
      }
    });
  }

  const metadata: Record<string, string> = {};
  if (params.calendarId) {
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

export function constructStripeEvent(payload: Buffer | string, signature: string, webhookSecret: string) {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
