import { DEFAULT_PLAN, type PlanKey } from "./plan-theme";

/**
 * Resolve a potentially-undefined or user-provided plan string to a safe PlanKey.
 * Accepts 'plan_essentiel' | 'plan_premium' strings and falls back to DEFAULT_PLAN.
 */
export function resolveServerPlanKey(plan?: string | null): PlanKey {
  if (plan === "plan_premium") return "plan_premium";
  if (plan === "plan_essentiel") return "plan_essentiel";
  return DEFAULT_PLAN;
}
