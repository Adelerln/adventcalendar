import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function resolveAppHost() {
  const candidates = [
    process.env.NEXT_PUBLIC_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const cleaned = candidate.trim().split(/\s+/)[0];
    try {
      const url = cleaned.startsWith("http") ? new URL(cleaned) : new URL(`https://${cleaned}`);
      return url.origin;
    } catch {
      const withoutTrailingSlash = cleaned.replace(/\/+$/, "");
      if (withoutTrailingSlash) return withoutTrailingSlash;
    }
  }

  return "http://localhost:3000";
}

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

type BaseCheckoutParams = {
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  promotionCodeId?: string;
};

type AmountCheckoutParams = BaseCheckoutParams & {
  amountCents: number;
  planLabel: string;
  buyerId?: string;
  projectId?: string;
};

type ProductCheckoutParams = BaseCheckoutParams & {
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  productId?: string;
  calendarId?: string;
  inlineAmountCents?: number;
  productName?: string;
};

export async function createCheckoutSession(params: AmountCheckoutParams | ProductCheckoutParams) {
  const stripe = getStripeClient();
  const host = resolveAppHost();

  const successUrl = params.successUrl ?? `${host}/dashboard`;
  const cancelUrl = params.cancelUrl ?? `${host}/dashboard`;

  const metadata: Record<string, string> = { ...(params.metadata ?? {}) };

  if ("amountCents" in params) {
    if (params.buyerId) metadata.buyer_id = params.buyerId;
    if (params.projectId) metadata.project_id = params.projectId;

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
      metadata: Object.keys(metadata).length ? metadata : undefined,
      discounts: "promotionCodeId" in params && params.promotionCodeId ? [{ promotion_code: params.promotionCodeId }] : undefined
    });
  }

  if (params.calendarId) {
    metadata.calendar_id = params.calendarId;
  }

  const inlineAmount =
    typeof params.inlineAmountCents === "number" && params.inlineAmountCents > 0 ? params.inlineAmountCents : null;

  if (!inlineAmount && !params.productId) {
    throw new Error("Stripe price ID or inline amount is required to start checkout");
  }

  return stripe.checkout.sessions.create({
    mode: params.mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        ...(inlineAmount
          ? {
              price_data: {
                currency: params.currency ?? "eur",
                product_data: {
                  name: params.productName ?? "Calendrier de l'Avent"
                },
                unit_amount: inlineAmount
              }
            }
          : { price: params.productId }),
        quantity: 1
      }
    ],
    metadata: Object.keys(metadata).length ? metadata : undefined,
    discounts: "promotionCodeId" in params && params.promotionCodeId ? [{ promotion_code: params.promotionCodeId }] : undefined
  });
}

export function constructStripeEvent(payload: Buffer | string, signature: string, webhookSecret: string) {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { resolveAppHost };
