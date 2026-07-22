import { describe, expect, it } from "vitest";
import { derivePlanState } from "../../src/planState";

/**
 * Phase 6a Commit 1 (SR-6a): every plan-dependent surface — the top-right "Pro"
 * chip, the "Plan: …" pill, the account panel, the day-lock, and the upgrade
 * prompt — derives from this one function. These assertions lock the coherence
 * contract: a given session payload yields exactly one consistent verdict.
 */
describe("derivePlanState — plan coherence", () => {
  it("pro + authenticated: pro everywhere, never free/locked", () => {
    const state = derivePlanState({
      enabled: true,
      authenticated: true,
      user: { plan: "pro" },
    });
    expect(state).toEqual({
      plan: "pro",
      authEnabled: true,
      authenticated: true,
      isPro: true,
      isFreePlan: false,
    });
  });

  it("free + authenticated: free everywhere, paywall active", () => {
    const state = derivePlanState({
      enabled: true,
      authenticated: true,
      user: { plan: "free" },
    });
    expect(state).toEqual({
      plan: "free",
      authEnabled: true,
      authenticated: true,
      isPro: false,
      isFreePlan: true,
    });
  });

  it("auth disabled (local-first): never paywalled regardless of stored plan", () => {
    const state = derivePlanState({
      enabled: false,
      authenticated: false,
      user: { plan: "free" },
    });
    expect(state.authEnabled).toBe(false);
    expect(state.isFreePlan).toBe(false);
    expect(state.isPro).toBe(false);
  });

  it("null / failed payload: safe free, no paywall", () => {
    const state = derivePlanState(null);
    expect(state).toEqual({
      plan: "free",
      authEnabled: false,
      authenticated: false,
      isPro: false,
      isFreePlan: false,
    });
  });

  it("unknown plan value falls back to free", () => {
    const state = derivePlanState({
      enabled: true,
      authenticated: true,
      user: { plan: "enterprise" as unknown as "pro" },
    });
    expect(state.plan).toBe("free");
    expect(state.isFreePlan).toBe(true);
  });

  it("demo mode forces free + unlocked even with a pro payload", () => {
    const state = derivePlanState(
      { enabled: true, authenticated: true, user: { plan: "pro" } },
      { demoMode: true }
    );
    expect(state).toEqual({
      plan: "free",
      authEnabled: false,
      authenticated: false,
      isPro: false,
      isFreePlan: false,
    });
  });
});
