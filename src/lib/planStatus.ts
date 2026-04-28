import type { SubscriptionPlan } from "@/lib/authTypes";

export type PlanStatus = SubscriptionPlan | "unknown";

export const PRO_ACTIVE_MESSAGE =
  "Praxis Pro active — full weekly plan unlocked.";

export const normalizePlanStatus = (value: unknown): PlanStatus => {
  if (value === "pro") return "pro";
  if (value === "free") return "free";
  return "unknown";
};

export const resolvePlanStatus = (...sources: unknown[]): PlanStatus => {
  const normalized = sources.map(normalizePlanStatus);
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("free")) return "free";
  return "unknown";
};

export const isProPlan = (plan: unknown) => normalizePlanStatus(plan) === "pro";

export const isFreeAccessPlan = (params: {
  authEnabled: boolean;
  plan: unknown;
}) => params.authEnabled && !isProPlan(params.plan);

export const formatPlanLabel = (params: {
  authEnabled: boolean;
  plan: unknown;
}) => {
  if (!params.authEnabled) return "Local";
  const normalized = normalizePlanStatus(params.plan);
  if (normalized === "pro") return "Pro";
  if (normalized === "free") return "Free";
  return "Checking";
};

export const formatPlanStatusMessage = (params: {
  authEnabled: boolean;
  plan: unknown;
}) => {
  if (!params.authEnabled) return "Local-first mode";
  const normalized = normalizePlanStatus(params.plan);
  if (normalized === "pro") return PRO_ACTIVE_MESSAGE;
  if (normalized === "free") return "Free access";
  return "Checking plan status";
};
