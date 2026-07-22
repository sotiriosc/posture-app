import type { SubscriptionPlan } from "./authTypes";

/**
 * Shape returned by `GET /api/auth/session` (the single canonical plan source).
 * Kept intentionally loose so both apps can pass the raw JSON payload straight in.
 */
export type SessionPlanPayload = {
  enabled?: boolean;
  authenticated?: boolean;
  user?: { plan?: SubscriptionPlan | null } | null;
};

/**
 * The one derived view of a user's plan that every badge, pill, and upsell gate
 * must read from. Deriving all of these from a single function is what keeps the
 * "Pro" chip, the "Plan: …" pill, the account panel, and the upgrade prompt from
 * ever disagreeing on the same screen (Phase 6a Commit 1 / SR-6a).
 */
export type PlanState = {
  plan: SubscriptionPlan;
  authEnabled: boolean;
  authenticated: boolean;
  isPro: boolean;
  isFreePlan: boolean;
};

export type DerivePlanStateOptions = {
  /**
   * Buyer-demo mode (gyms app): the member dashboard is shown without real auth,
   * so no consumer plan chrome should render and no day should be locked.
   */
  demoMode?: boolean;
};

export function derivePlanState(
  payload: SessionPlanPayload | null | undefined,
  options: DerivePlanStateOptions = {}
): PlanState {
  if (options.demoMode) {
    return {
      plan: "free",
      authEnabled: false,
      authenticated: false,
      isPro: false,
      isFreePlan: false,
    };
  }

  const authEnabled = Boolean(payload?.enabled);
  const authenticated = Boolean(payload?.authenticated);
  const plan: SubscriptionPlan = payload?.user?.plan === "pro" ? "pro" : "free";
  const isPro = plan === "pro";

  return {
    plan,
    authEnabled,
    authenticated,
    isPro,
    // A free user only sees paywalled chrome when auth is actually configured.
    isFreePlan: authEnabled && !isPro,
  };
}
