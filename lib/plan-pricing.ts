import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

type PlanPricing = {
  amountCents: number;
  label: string;
};

const PLAN_PRICING: Record<PlanKey, PlanPricing> = {
  plan_essentiel: {
    amountCents: 1000,
    label: "Paiement Calendrier - Essentiel (10 €)"
  },
  plan_premium: {
    amountCents: 1500,
    label: "Paiement Calendrier - Premium (15 €)"
  }
};

export function getPlanPricing(plan?: string | null): PlanPricing & { plan: PlanKey } {
  const key = isPlanKey(plan) ? plan : DEFAULT_PLAN;
  return { plan: key, ...PLAN_PRICING[key] };
}

function isPlanKey(plan?: string | null): plan is PlanKey {
  return plan === "plan_essentiel" || plan === "plan_premium";
}
