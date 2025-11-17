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

  return (
    <div className={`rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md px-6 py-5 shadow-sm ${className ?? ""}`}>
      <p className="text-sm uppercase tracking-[0.3em] font-semibold mb-3 text-[#d4af37]">Parcours</p>
      <ol className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold text-white/90">
        {STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          return (
            <li
              key={step.id}
              className={`px-3 py-1 rounded-full border-2 ${
                isCurrent 
                  ? "border-[#d4af37] text-[#4a0808] font-bold" 
                  : "border-white/30 bg-white/10"
              }`}
              style={isCurrent ? {
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
              } : {}}
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
