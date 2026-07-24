"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useUserPlan } from "@/hooks/useUserPlan";
import { performLogout } from "@/components/authActions";

export default function AuthControls() {
  const { authEnabled, authenticated, isPro, loading } = useUserPlan();

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
      <Button type="button" variant="secondary" onClick={performLogout}>
        Log out
      </Button>
    </div>
  );
}
