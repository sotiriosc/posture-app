"use client";

import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useUserPlan } from "@/hooks/useUserPlan";

type PlanUpsellProps = {
  showPaywallNotice: boolean;
};

/**
 * Plan-dependent chrome below the dashboard header: manage-subscription (Pro),
 * the paywall redirect notice, and the upgrade prompt (Free). All gated by the
 * shared `useUserPlan` source (buyer-demo aware) so the upsell and the badges
 * always agree (Phase 6a / SR-6a).
 */
export default function PlanUpsell({ showPaywallNotice }: PlanUpsellProps) {
  const { authEnabled, isPro, isFreePlan, offline, loading } = useUserPlan();

  if (loading || !authEnabled) return null;

  return (
    <>
      {isPro ? <ManageSubscriptionButton showRefreshAction={false} /> : null}
      {isFreePlan && offline ? (
        <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Couldn&apos;t confirm your subscription while offline. Reconnect to
          restore Pro access.
        </div>
      ) : null}
      {isFreePlan && showPaywallNotice ? (
        <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Free access includes Day 1. Praxis Pro unlocks the full weekly plan.
        </div>
      ) : null}
      {isFreePlan ? <UpgradePrompt /> : null}
    </>
  );
}
