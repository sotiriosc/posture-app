"use client";

import { useEffect, useState } from "react";
import { derivePlanState } from "@/lib/planState";
import type { PlanState, SessionPlanPayload } from "@/lib/planState";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
} from "@/lib/gymSaas/demoMode";

export type UserPlan = PlanState & { loading: boolean };

/**
 * Single source of truth for subscription plan on the client (Phase 6a / SR-6a).
 *
 * Every plan-dependent surface reads from this hook so the "Pro" chip, the
 * "Plan: …" pill, the account panel, and the upgrade prompt can never disagree.
 * In buyer-demo mode the member dashboard runs without real auth, so the hook
 * forces a free, unlocked, no-chrome state before touching the session API.
 *
 * The session fetch is memoised at module scope so all consumers on a page
 * resolve to the same payload; login/logout do a full navigation which resets it.
 */
let cachedSession: Promise<SessionPlanPayload> | null = null;

function loadSession(): Promise<SessionPlanPayload> {
  if (!cachedSession) {
    cachedSession = fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => res.json() as Promise<SessionPlanPayload>)
      .catch(() => ({ enabled: false, authenticated: false, user: null }));
  }
  return cachedSession;
}

export function refreshUserPlan(): void {
  cachedSession = null;
}

function readBuyerDemoMode(): boolean {
  if (typeof document === "undefined") return false;
  const demoCookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${BUYER_DEMO_COOKIE}=`));
  return isBuyerDemoCookieValue(demoCookie?.split("=")[1]);
}

export function useUserPlan(): UserPlan {
  const [state, setState] = useState<UserPlan>(() => ({
    ...derivePlanState(null),
    loading: true,
  }));

  useEffect(() => {
    let active = true;
    // Resolve both branches through a promise so state is only ever set from an
    // async callback (never synchronously within the effect body).
    const resolved = readBuyerDemoMode()
      ? Promise.resolve(derivePlanState(null, { demoMode: true }))
      : loadSession().then((payload) => derivePlanState(payload));
    void resolved.then((next) => {
      if (!active) return;
      setState({ ...next, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
