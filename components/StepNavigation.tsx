"use client";

import Link from "next/link";
import clsx from "clsx";
import type { PlanKey } from "@/lib/plan-theme";
import { PLAN_APPEARANCE } from "@/lib/plan-theme";

export type StepAction = {
  label?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

type StepNavigationProps = {
  plan: PlanKey;
  currentStep: number;
  prev?: StepAction;
  next?: StepAction;
  className?: string;
};

export default function StepNavigation({ plan, currentStep, prev, next, className }: StepNavigationProps) {
  const theme = PLAN_APPEARANCE[plan];
  const baseButton = clsx(
    "inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition-colors",
    theme.border,
    plan === "plan_premium" ? "bg-[#fff7ee] text-[#5c3b1d]" : "bg-[#f5f7fb] text-[#1f232b]",
    "hover:opacity-90"
  );

  return (
    <div
      className={clsx(
        "mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6",
        className
      )}
    >
      {renderAction(prev, baseButton, true)}
      <div className={clsx("text-[0.65rem] uppercase tracking-[0.35em] font-semibold", theme.accentText)}>
        Étape {currentStep} / 5
      </div>
      {renderAction(next, baseButton, false)}
    </div>
  );
}

function renderAction(action: StepAction | undefined, baseClass: string, isPrev: boolean) {
  if (!action) {
    return <div className="flex-1" />;
  }

  const mainText = isPrev ? "Étape précédente" : "Étape suivante";
  const content = <span>{mainText}</span>;
  const ariaLabel = action.label ? `${mainText} · ${action.label}` : mainText;

  if (action.href && !action.disabled) {
    return (
      <Link
        href={action.href}
        className={clsx(baseClass, "flex-1 sm:flex-none")}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={clsx(
        baseClass,
        "flex-1 sm:flex-none",
        action.disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {content}
    </button>
  );
}
