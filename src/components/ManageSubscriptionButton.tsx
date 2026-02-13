"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type ManageSubscriptionButtonProps = {
  showRefreshAction?: boolean;
};

export default function ManageSubscriptionButton({
  showRefreshAction = true,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/portal-session", {
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
        setMessage(data?.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mt-2">
      <Button type="button" variant="primary" onClick={openPortal} disabled={loading}>
        {loading ? "Opening..." : "Manage subscription"}
      </Button>
      {showRefreshAction ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button type="button" variant="primary" onClick={refreshStatus} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "I finished in Stripe"}
          </Button>
          <p className="text-xs text-slate-600">
            After changes in Stripe, click here to refresh this page.
          </p>
        </div>
      ) : null}
      {message ? <p className="mt-1 text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
