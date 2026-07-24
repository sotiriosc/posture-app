"use client";

import { useEffect, useState } from "react";
import { derivePlanState } from "@/lib/planState";
import type { PlanState, SessionPlanPayload } from "@/lib/planState";
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
   * Phase 6f, Commit 3 (amended). Lets plan-dependent UI show a "reconnect
   * to restore Pro access" nudge instead of silently downgrading a paid
   * user with no explanation.
   */
  offline: boolean;
};

/**
 * Single source of truth for subscription plan on the client (Phase 6a / SR-6a).
 *
 * Every plan-dependent surface — the "Pro" chip, the "Plan: …" pill, the account
 * panel, day-locking, and the upgrade prompt — reads from this hook. The session
 * fetch is memoised at module scope so all consumers on a page resolve to the
 * exact same payload; that shared result is what guarantees they can never
 * disagree (the pre-6a bug was three independent fetches racing a server read).
 *
 * The cache lives for the life of the page load. Login and logout both do a full
 * `window.location` navigation, which resets the module and re-fetches.
 */
let cachedSession: Promise<SessionPlanPayload | null> | null = null;

function loadSession(): Promise<SessionPlanPayload | null> {
  if (!cachedSession) {
    cachedSession = fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => res.json() as Promise<SessionPlanPayload>)
      // `null` (as opposed to a fetched "signed out" payload) marks a genuine
      // network failure — the caller falls back to the local subscription
      // cache instead of assuming the user is signed out.
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

/** Clear the memoised session (e.g. after a plan change without a full reload). */
export function refreshUserPlan(): void {
  cachedSession = null;
  cachedBillingStatus = null;
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
  }));

  useEffect(() => {
    let active = true;

    void loadSession().then((payload) => {
      if (!active) return;

      if (payload === null) {
        // Genuine network failure (offline, or the auth/session API itself
        // unreachable): fall back to whatever subscription status was last
        // confirmed while online, rather than collapsing a paid user to
        // "signed out." A device that has never confirmed anything locally
        // (a guest, or one that's simply never synced) keeps today's
        // existing safe default.
        const fallback = offlineFallbackPlanState();
        setState({ ...(fallback ?? derivePlanState(null)), loading: false, offline: Boolean(fallback) });
        return;
      }

      const next = derivePlanState(payload);
      setState({ ...next, loading: false, offline: false });

      if (!next.authenticated) return;

      // Refresh the local fallback cache in the background — best-effort,
      // must never block or affect the plan determination above.
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

    return () => {
      active = false;
    };
  }, []);

  return state;
}
