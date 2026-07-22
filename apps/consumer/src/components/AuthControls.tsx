"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useUserPlan } from "@/hooks/useUserPlan";

export default function AuthControls() {
  const { authEnabled, authenticated, isPro, loading } = useUserPlan();

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    }).catch(() => null);
    window.location.href = "/";
  };

  if (loading) return null;
  if (!authEnabled) return null;
  if (!authenticated) {
    return (
      <Link href="/auth/login">
        <Button variant="secondary">Log in</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="ui-chip">{isPro ? "Pro" : "Free"}</span>
      <Button type="button" variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
