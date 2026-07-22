"use client";

import { useEffect, useState } from "react";
import { derivePlanState } from "@/lib/planState";
import type { PlanState, SessionPlanPayload } from "@/lib/planState";

export type UserPlan = PlanState & { loading: boolean };

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

/** Clear the memoised session (e.g. after a plan change without a full reload). */
export function refreshUserPlan(): void {
  cachedSession = null;
}

export function useUserPlan(): UserPlan {
  const [state, setState] = useState<UserPlan>(() => ({
    ...derivePlanState(null),
    loading: true,
  }));

  useEffect(() => {
    let active = true;
    void loadSession().then((payload) => {
      if (!active) return;
      setState({ ...derivePlanState(payload), loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
