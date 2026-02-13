"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function UpgradePrompt() {
  const [message, setMessage] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);

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
        setStripeEnabled(Boolean(data?.stripeConfigured));
      } catch {
        setStripeEnabled(false);
      }
    })();
  }, []);

  const startCheckout = async () => {
    setStripeLoading(true);
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
      setStripeLoading(false);
    }
  };

  return (
    <div className="ui-card mt-4 p-4">
      <p className="ui-title">Unlock Pro</p>
      <p className="mt-1 ui-body">
        Free plan includes dashboard and day 1 workout. Upgrade to unlock all workout days.
      </p>
      {stripeEnabled ? (
        <div className="mt-3">
          <Button type="button" onClick={startCheckout} disabled={stripeLoading}>
            {stripeLoading ? "Loading checkout..." : "Upgrade with card"}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-600">
          Billing is not configured yet. Add Stripe env vars to enable checkout.
        </p>
      )}
      {message ? (
        <p className="mt-2 text-xs text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
