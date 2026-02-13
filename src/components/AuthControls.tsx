"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { SubscriptionPlan } from "@/lib/authTypes";

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session");
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
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/";
  };

  if (loading) return null;
  if (session?.enabled === false) return null;
  if (!session?.authenticated) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hero-pill rounded-full px-3 py-1 text-[11px] font-semibold text-slate-100">
        {session.user?.plan === "pro" ? "Pro" : "Free"}
      </span>
      <Button type="button" variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
