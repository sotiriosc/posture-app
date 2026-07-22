"use client";

import { useUserPlan } from "@/hooks/useUserPlan";

/**
 * The "Plan: Pro/Free" pill in the dashboard header. Reads the shared
 * `useUserPlan` source (which is buyer-demo aware) so it can never disagree
 * with the top-right chip or the upgrade prompt (Phase 6a / SR-6a).
 */
export default function PlanBadge() {
  const { authEnabled, isPro, loading } = useUserPlan();

  if (loading || !authEnabled) return null;

  return (
    <span className="rounded-lg border border-slate-400/30 bg-slate-950/45 px-3 py-1">
      Plan: {isPro ? "Pro" : "Free"}
    </span>
  );
}
