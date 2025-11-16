"use client";

import type { PlanKey } from "@/lib/plan-theme";
import { PLAN_APPEARANCE, DEFAULT_PLAN } from "@/lib/plan-theme";

const STEPS = [
  { id: 1, label: "Forfait choisi" },
  { id: 2, label: "Compte créé" },
  { id: 3, label: "Calendrier personnalisé" },
  { id: 4, label: "Infos receveur" },
  { id: 5, label: "Paiement Stripe" }
] as const;

type Props = {
  plan?: PlanKey | null;
  currentStep: number;
  className?: string;
};

export default function ParcoursBanner({ plan = DEFAULT_PLAN, currentStep, className }: Props) {
  const key = plan ?? DEFAULT_PLAN;
  const theme = PLAN_APPEARANCE[key];
  const highlightBg = plan === "plan_premium" ? "bg-[#fbeedc]" : "bg-[#f0f2f6]";
  const highlightText = plan === "plan_premium" ? "text-[#8a613c]" : "text-[#4d5663]";

  return (
    <div className={`rounded-2xl border-2 ${theme.border} bg-white px-6 py-5 shadow-sm ${className ?? ""}`}>
      <p className={`text-sm uppercase tracking-[0.3em] font-semibold mb-3 ${theme.accentText}`}>Parcours</p>
      <ol className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#6f7782]">
        {STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          return (
            <li
              key={step.id}
              className={`px-3 py-1 rounded-full border ${theme.border} ${
                isCurrent ? `${highlightBg} ${highlightText}` : "bg-white/30"
              }`}
            >
              <span className="mr-1">{step.id}.</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
