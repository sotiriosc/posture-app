"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { SubscriptionPlan } from "@/lib/authTypes";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
} from "@/lib/gymSaas/demoMode";

type SessionPayload = {
  enabled?: boolean;
  authenticated: boolean;
  user?: {
    email: string;
    plan: SubscriptionPlan;
  } | null;
};

export default function AuthControls() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerDemoMode, setBuyerDemoMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      const demoCookie = document.cookie
        .split(";")
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith(`${BUYER_DEMO_COOKIE}=`));
      if (isBuyerDemoCookieValue(demoCookie?.split("=")[1])) {
        setBuyerDemoMode(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        const data = (await res.json()) as SessionPayload;
        setSession(data);
      } catch {
        setSession({ authenticated: false });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    }).catch(() => null);
    window.location.href = "/";
  };

  if (loading) return null;
  if (buyerDemoMode) return null;
  if (session?.enabled === false) return null;
  if (!session?.authenticated) {
    return (
      <Link href="/auth/login">
        <Button variant="secondary">Log in</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="ui-chip">
        {session.user?.plan === "pro" ? "Pro" : "Free"}
      </span>
      <Button type="button" variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
