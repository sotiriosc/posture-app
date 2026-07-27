"use client";

import { useCallback, useEffect, useState } from "react";
import { canAccessWorkoutToday as evaluateWorkoutAccess } from "@/lib/freemiumAccess";
import { resolveHasCompletedFirstWeek } from "@/lib/freemiumSync";
import { derivePlanState } from "@/lib/planState";
import type { PlanState, SessionPlanPayload } from "@/lib/planState";
import { SESSION_COMPLETE_EVENT } from "@/lib/sessionStore";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
} from "@/lib/gymSaas/demoMode";
import {
  deriveLocalSubscriptionStatus,
  getLocalSubscription,
  hasLocalProAccess,
  saveLocalSubscription,
} from "@/lib/subscriptionStore";

export type UserPlan = PlanState & {
  loading: boolean;
  /**
   * True when this plan state came from the local subscription cache
   * because the live session check failed (offline, or Stripe/API down) —
   * Phase 6f, Commit 3 (amended), ported from consumer. Lets plan-dependent
   * UI show a "reconnect to restore Pro access" nudge instead of silently
   * downgrading a paying operator with no explanation.
   */
  offline: boolean;
  /** Phase 6j — freemium Option B latch (persisted per userId). */
  hasCompletedFirstWeek: boolean;
  /** Phase 6j — single source for day-lock decisions. */
  canAccessWorkoutToday: (dayIndex: number) => boolean;
};

/**
 * Single source of truth for subscription plan on the client (Phase 6a / SR-6a).
 *
 * Every plan-dependent surface reads from this hook so the "Pro" chip, the
 * "Plan: …" pill, the account panel, and the upgrade prompt can never disagree.
 * In buyer-demo mode the member dashboard runs without real auth, so the hook
 * forces a free, unlocked, no-chrome state before touching the session API.
 *
 * The session fetch is memoised at module scope so all consumers on a page
 * resolve to the same payload. Soft login/signup navigations must call
 * `refreshUserPlan()` so mounted hooks re-fetch.
 */
export const USER_PLAN_REFRESH_EVENT = "praxis:user-plan-refresh";

let cachedSession: Promise<SessionPlanPayload | null> | null = null;

function loadSession(): Promise<SessionPlanPayload | null> {
  if (!cachedSession) {
    cachedSession = fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => res.json() as Promise<SessionPlanPayload>)
      // `null` marks a genuine network failure, distinct from a fetched
      // "signed out" payload — see the offline fallback below.
      .catch(() => null);
  }
  return cachedSession;
}

type BillingStatusPayload = {
  authenticated?: boolean;
  user?: {
    plan?: "free" | "pro";
    stripeCancelAtPeriodEnd?: boolean | null;
    stripeCurrentPeriodEnd?: string | null;
  } | null;
};

let cachedBillingStatus: Promise<BillingStatusPayload | null> | null = null;

function loadBillingStatus(): Promise<BillingStatusPayload | null> {
  if (!cachedBillingStatus) {
    cachedBillingStatus = fetch("/api/billing/status", {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => res.json() as Promise<BillingStatusPayload>)
      .catch(() => null);
  }
  return cachedBillingStatus;
}

export function refreshUserPlan(): void {
  cachedSession = null;
  cachedBillingStatus = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_PLAN_REFRESH_EVENT));
  }
}

function readBuyerDemoMode(): boolean {
  if (typeof document === "undefined") return false;
  const demoCookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${BUYER_DEMO_COOKIE}=`));
  return isBuyerDemoCookieValue(demoCookie?.split("=")[1]);
}

const offlineFallbackPlanState = (): (PlanState & { offline: boolean }) | null => {
  const local = getLocalSubscription();
  if (!local) return null;
  const isPro = hasLocalProAccess(local);
  return {
    plan: isPro ? "pro" : "free",
    authEnabled: true,
    authenticated: true,
    isPro,
    isFreePlan: !isPro,
    offline: true,
  };
};

export function useUserPlan(): UserPlan {
  const [state, setState] = useState<UserPlan>(() => ({
    ...derivePlanState(null),
    loading: true,
    offline: false,
    hasCompletedFirstWeek: false,
    canAccessWorkoutToday: () => true,
  }));

  const bindAccess = useCallback(
    (base: PlanState & { offline: boolean; loading: boolean }, hasCompletedFirstWeek: boolean): UserPlan => ({
      ...base,
      hasCompletedFirstWeek,
      canAccessWorkoutToday: (dayIndex: number) =>
        evaluateWorkoutAccess({
          isFreePlan: base.isFreePlan,
          hasCompletedFirstWeek,
          dayIndex,
        }),
    }),
    []
  );

  useEffect(() => {
    let active = true;
    // Resolve every branch through a promise so state is only ever set from
    // an async callback (never synchronously within the effect body).
    if (readBuyerDemoMode()) {
      void Promise.resolve(derivePlanState(null, { demoMode: true })).then((next) => {
        if (!active) return;
        setState(bindAccess({ ...next, loading: false, offline: false }, false));
      });
      return () => {
        active = false;
      };
    }

    const hydrateFreemium = async (
      base: PlanState & { offline: boolean; loading: boolean }
    ) => {
      let hasCompletedFirstWeek = false;
      try {
        hasCompletedFirstWeek = await resolveHasCompletedFirstWeek();
      } catch {
        hasCompletedFirstWeek = false;
      }
      if (!active) return;
      setState(bindAccess(base, hasCompletedFirstWeek));
    };

    const applySession = () => {
      void loadSession().then((payload) => {
        if (!active) return;

        if (payload === null) {
          const fallback = offlineFallbackPlanState();
          const base = {
            ...(fallback ?? derivePlanState(null)),
            loading: false,
            offline: Boolean(fallback),
          };
          setState(bindAccess(base, false));
          void hydrateFreemium(base);
          return;
        }

        const next = derivePlanState(payload);
        const base = { ...next, loading: false, offline: false };
        setState(bindAccess(base, false));
        void hydrateFreemium(base);

        if (!next.authenticated) return;

        void loadBillingStatus().then((billing) => {
          if (!active || !billing?.user) return;
          saveLocalSubscription(
            deriveLocalSubscriptionStatus({
              plan: billing.user.plan === "pro" ? "pro" : "free",
              stripeCancelAtPeriodEnd: billing.user.stripeCancelAtPeriodEnd,
              stripeCurrentPeriodEnd: billing.user.stripeCurrentPeriodEnd,
            })
          );
        });
      });
    };

    applySession();

    const onRefresh = () => {
      setState((prev) => ({ ...prev, loading: true }));
      applySession();
    };

    const onSessionComplete = () => {
      void resolveHasCompletedFirstWeek().then((hasCompletedFirstWeek) => {
        if (!active) return;
        setState((prev) =>
          bindAccess(
            {
              plan: prev.plan,
              authEnabled: prev.authEnabled,
              authenticated: prev.authenticated,
              isPro: prev.isPro,
              isFreePlan: prev.isFreePlan,
              loading: prev.loading,
              offline: prev.offline,
            },
            hasCompletedFirstWeek
          )
        );
      });
    };
    window.addEventListener(USER_PLAN_REFRESH_EVENT, onRefresh);
    window.addEventListener(SESSION_COMPLETE_EVENT, onSessionComplete);

    return () => {
      active = false;
      window.removeEventListener(USER_PLAN_REFRESH_EVENT, onRefresh);
      window.removeEventListener(SESSION_COMPLETE_EVENT, onSessionComplete);
    };
  }, [bindAccess]);

  return state;
}
