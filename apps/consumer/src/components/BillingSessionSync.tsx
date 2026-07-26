"use client";

import { useEffect } from "react";

/**
 * After the billing page self-heals the DB record from Stripe during RSC
 * render, re-issue the auth cookie so middleware plan matches DB plan.
 */
export default function BillingSessionSync() {
  useEffect(() => {
    void fetch("/api/billing/refresh", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "session-only" }),
    }).catch(() => {
      // Non-blocking: page already shows reconciled DB state.
    });
  }, []);

  return null;
}
