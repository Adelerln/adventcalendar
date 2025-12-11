export type PlanKey = "plan_essentiel" | "plan_premium";

export type PlanAppearance = {
  name: string;
  border: string;
  accentText: string;
  mutedText: string;
  priceColor: string;
  progressFill: string;
  ctaBg: string;
  ctaHover: string;
  ctaText: string;
  tile: {
    emptyBg: string;
    filledBg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    numberEmptyBg: string;
    numberEmptyText: string;
    numberFilledBg: string;
    numberFilledText: string;
    indicatorBg: string;
    indicatorText: string;
  };
};

export const PLAN_APPEARANCE: Record<PlanKey, PlanAppearance> = {
  plan_essentiel: {
    name: "Plan Essentiel",
    border: "border-[#e5e9ef]",
    accentText: "text-[#6f7782]",
    mutedText: "text-[#8d94a1]",
    priceColor: "text-[#7b828f]",
    progressFill: "bg-[#d7dde5]",
    ctaBg: "bg-[#f0f2f6]",
    ctaHover: "hover:bg-[#e2e6ee]",
    ctaText: "text-[#4d5663]",
    tile: {
      emptyBg: "from-white/20 to-white/50",
      filledBg: "from-white/60 to-white/90",
      border: "border-[#e5e9ef]",
      badgeBg: "bg-[#8d94a1]",
      badgeText: "text-white",
      numberEmptyBg: "bg-white",
      numberEmptyText: "text-[#6f7782]",
      numberFilledBg: "bg-[#8d94a1]",
      numberFilledText: "text-white",
      indicatorBg: "bg-white/85",
      indicatorText: "text-[#6f7782]"
    }
  },
  plan_premium: {
    name: "Plan Premium",
    border: "border-[#f5e6d4]",
    accentText: "text-[#c89b65]",
    mutedText: "text-[#c89b65]",
    priceColor: "text-[#c89b65]",
    progressFill: "bg-[#efd6b7]",
    ctaBg: "bg-[#fbeedc]",
    ctaHover: "hover:bg-[#f6dfc2]",
    ctaText: "text-[#624523]",
    tile: {
      emptyBg: "from-[#fff8f1]/60 to-[#fbead6]/80",
      filledBg: "from-[#f7e4c9] to-[#f3d5b2]",
      border: "border-[#f5e6d4]",
      badgeBg: "bg-[#e3c19d]",
      badgeText: "text-white",
      numberEmptyBg: "bg-white",
      numberEmptyText: "text-[#a37247]",
      numberFilledBg: "bg-[#e3c19d]",
      numberFilledText: "text-white",
      indicatorBg: "bg-white/85",
      indicatorText: "text-[#a37247]"
    }
  }
};

export const DEFAULT_PLAN: PlanKey = "plan_essentiel";

export function resolvePlanTheme(plan?: PlanKey | null) {
  if (plan === "plan_premium") return PLAN_APPEARANCE.plan_premium;
  return PLAN_APPEARANCE.plan_essentiel;
}
