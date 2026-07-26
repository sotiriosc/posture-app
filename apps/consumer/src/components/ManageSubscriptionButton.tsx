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
    setMessage(null);
    try {
      const res = await fetch("/api/billing/refresh", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "stripe" }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setMessage(data?.error ?? "Could not refresh subscription status.");
        return;
      }
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="primary"
        onClick={openPortal}
        disabled={loading}
      >
        {loading ? "Opening..." : "Manage subscription"}
      </Button>
      {showRefreshAction ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refreshStatus()}
            disabled={refreshing}
            data-testid="billing-refresh-status"
          >
            {refreshing ? "Refreshing..." : "Refresh subscription status"}
          </Button>
          <p className="text-xs text-slate-400">
            After making changes in the secure billing portal, refresh to confirm your access.
          </p>
        </div>
      ) : null}
      {message ? <p className="mt-1 text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
