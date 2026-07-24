"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useUserPlan } from "@/hooks/useUserPlan";
import { performLogout } from "@/components/authActions";

// Operator-facing routes must never render consumer-plan chrome (the Pro/Free
// chip). On these paths we keep the log-out control but drop the plan chip.
const OPERATOR_ROUTE_PREFIXES = [
  "/pilot",
  "/enterprise",
  "/gym-demo",
  "/gym-admin",
  "/settings",
  "/admin",
];

export default function AuthControls() {
  const pathname = usePathname();
  const { authEnabled, authenticated, isPro, loading } = useUserPlan();

  const isOperatorRoute = OPERATOR_ROUTE_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  const logout = async () => {
    // Phase 6f, Commit 1 (SR-6f) — route through the shared performLogout
    // so this device's non-photo local state is reconciled before the next
    // sign-in, same as consumer (Phase 6e).
    await performLogout();
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
      {isOperatorRoute ? null : (
        <span className="ui-chip">{isPro ? "Pro" : "Free"}</span>
      )}
      <Button type="button" variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
