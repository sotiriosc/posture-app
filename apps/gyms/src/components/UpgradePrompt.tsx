"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  FIRST_WEEK_IN_PROGRESS_COPY,
  FIRST_WEEK_UPGRADE_COPY,
} from "@/lib/freemiumAccess";
import { useUserPlan } from "@/hooks/useUserPlan";

export default function UpgradePrompt() {
  const { hasCompletedFirstWeek } = useUserPlan();
  const [message, setMessage] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutEnabled, setCheckoutEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/billing/status", {
          cache: "no-store",
          credentials: "include",
        });
        const data = (await res.json().catch(() => null)) as {
          stripeConfigured?: boolean;
        } | null;
        setCheckoutEnabled(Boolean(data?.stripeConfigured));
      } catch {
        setCheckoutEnabled(false);
      }
    })();
  }, []);

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        url?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok || !data.url) {
        setMessage(data?.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const body = hasCompletedFirstWeek
    ? FIRST_WEEK_UPGRADE_COPY
    : FIRST_WEEK_IN_PROGRESS_COPY;
  const headline = hasCompletedFirstWeek
    ? "Keep training every day"
    : "Unlock ongoing full-week access";

  return (
    <div className="ui-card ui-soft-surface-raised mt-4 rounded-lg p-4">
      <p className="ui-kicker">Praxis Pro</p>
      <p className="mt-1 text-lg font-semibold text-white">{headline}</p>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
      {checkoutEnabled ? (
        <div className="mt-4">
          <Button type="button" onClick={startCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? "Opening checkout..." : "Upgrade to Pro"}
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-2 text-xs text-slate-300">
          Card checkout is not available in this beta build yet.
        </p>
      )}
      {message ? (
        <p className="mt-2 text-xs text-slate-300">{message}</p>
      ) : null}
    </div>
  );
}
