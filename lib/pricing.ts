export const PRODUCTS = {
  calendar_one_time: {
    id: "calendar_one_time",
    type: "one_time" as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ONE_TIME || "",
  },
  pro_monthly: {
    id: "pro_monthly",
    type: "subscription" as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
  },
};


