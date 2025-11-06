export const PRODUCTS = {
  // Anciens produits (gardés pour compatibilité)
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
  
  // Nouveaux produits - Plans 2025
  plan_essentiel: {
    id: "plan_essentiel",
    name: "Plan Essentiel",
    type: "one_time" as const,
    price: 1000, // 10.00 EUR en centimes
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL || "",
    features: ["photos", "messages", "dessins"],
    description: "24 photos + 24 messages + dessins personnalisés"
  },
  plan_premium: {
    id: "plan_premium",
    name: "Plan Premium",
    type: "one_time" as const,
    price: 1500, // 15.00 EUR en centimes
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || "",
    features: ["photos", "messages", "dessins", "musique"],
    description: "24 photos + 24 messages + dessins + 24 musiques personnalisées"
  },
};


