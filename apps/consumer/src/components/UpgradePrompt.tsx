"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function UpgradePrompt() {
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

  return (
    <>
      {/* dashboard-grid — on phone this collapses to a slim (~80px) banner so
          it stops dominating the fold; the full card below is desktop-only
          (hidden sm:block) and unchanged. */}
      <div className="ui-card ui-soft-surface-raised mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 sm:hidden">
        <p className="text-sm font-semibold text-white">
          Unlock every training day &mdash;{" "}
          <span className="text-sky-300">Pro</span>
        </p>
        {checkoutEnabled ? (
          <Button
            type="button"
            onClick={startCheckout}
            disabled={checkoutLoading}
            className="shrink-0"
          >
            {checkoutLoading ? "Opening\u2026" : "Upgrade \u2192"}
          </Button>
        ) : (
          <span className="shrink-0 text-xs text-slate-400">
            Checkout soon
          </span>
        )}
        {message ? (
          <p className="w-full text-xs text-slate-300">{message}</p>
        ) : null}
      </div>

      <div className="ui-card ui-soft-surface-raised mt-4 hidden rounded-lg p-4 sm:block">
        <p className="ui-kicker">Praxis Pro</p>
        <p className="mt-1 text-lg font-semibold text-white">Unlock the full weekly plan</p>
        <p className="mt-2 text-sm text-slate-300">
          Free access keeps Day 1 available. Pro opens every training day, deeper progress views, and full plan history.
        </p>
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
    </>
  );
}
