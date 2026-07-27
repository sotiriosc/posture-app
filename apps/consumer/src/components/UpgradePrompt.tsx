"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  FIRST_WEEK_IN_PROGRESS_COPY,
  FIRST_WEEK_UPGRADE_COPY,
} from "@/lib/freemiumAccess";
import { useUserPlan } from "@/hooks/useUserPlan";
import UpgradeValueContext from "@/components/marketing/UpgradeValueContext";

type CheckoutPlan = "monthly" | "annual" | "founders";

type CheckoutPlans = {
  monthly?: boolean;
  annual?: boolean;
  founders?: boolean;
};

type PriceLabel = {
  label: string;
  detail: string;
};

type PriceLabels = Partial<Record<CheckoutPlan, PriceLabel>>;

const DEFAULT_PLAN_OPTIONS: Array<{
  id: CheckoutPlan;
  label: string;
  detail: string;
}> = [
  {
    id: "monthly",
    label: "$19.99/mo",
    detail: "Standard monthly",
  },
  {
    id: "annual",
    label: "$199.99/yr",
    detail: "Best value",
  },
  {
    id: "founders",
    label: "$12.99/mo",
    detail: "Founders",
  },
];

export default function UpgradePrompt() {
  const { hasCompletedFirstWeek } = useUserPlan();
  const [message, setMessage] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<CheckoutPlan | null>(
    null
  );
  const [checkoutEnabled, setCheckoutEnabled] = useState<boolean | null>(null);
  const [checkoutPlans, setCheckoutPlans] = useState<CheckoutPlans>({
    monthly: true,
  });
  const [priceLabels, setPriceLabels] = useState<PriceLabels>({});
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan>("monthly");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/billing/status", {
          cache: "no-store",
          credentials: "include",
        });
        const data = (await res.json().catch(() => null)) as {
          stripeConfigured?: boolean;
          checkoutPlans?: CheckoutPlans;
          priceLabels?: PriceLabels;
        } | null;
        setCheckoutEnabled(Boolean(data?.stripeConfigured));
        const plans = data?.checkoutPlans ?? { monthly: true };
        setCheckoutPlans(plans);
        setPriceLabels(data?.priceLabels ?? {});
        const preferred =
          (plans.monthly && "monthly") ||
          (plans.annual && "annual") ||
          (plans.founders && "founders") ||
          "monthly";
        setSelectedPlan(preferred);
      } catch {
        setCheckoutEnabled(false);
      }
    })();
  }, []);

  const startCheckout = async (plan: CheckoutPlan = selectedPlan) => {
    setCheckoutLoading(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
      setCheckoutLoading(null);
    }
  };

  const body = hasCompletedFirstWeek
    ? FIRST_WEEK_UPGRADE_COPY
    : FIRST_WEEK_IN_PROGRESS_COPY;
  const headline = hasCompletedFirstWeek
    ? "Keep training every day"
    : "Unlock ongoing full-week access";

  const availableOptions = DEFAULT_PLAN_OPTIONS.filter((option) =>
    Boolean(checkoutPlans[option.id])
  ).map((option) => ({
    ...option,
    label: priceLabels[option.id]?.label ?? option.label,
    detail: priceLabels[option.id]?.detail ?? option.detail,
  }));

  const planPicker =
    availableOptions.length > 1 ? (
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {availableOptions.map((option) => {
          const selected = selectedPlan === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedPlan(option.id)}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                selected
                  ? "border-sky-400/70 bg-sky-500/15 text-white"
                  : "border-slate-500/30 bg-slate-950/40 text-slate-200 hover:border-slate-400/50"
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {option.detail}
              </span>
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <>
      {/* dashboard-grid — on phone this collapses to a slim (~80px) banner so
          it stops dominating the fold; the full card below is desktop-only
          (hidden sm:block) and unchanged. */}
      <div className="ui-card ui-soft-surface-raised mt-4 rounded-lg px-4 py-3 sm:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">
            {hasCompletedFirstWeek ? "Continue past Day 1 — " : "Keep your full week — "}
            <span className="text-sky-300">Pro</span>
          </p>
          {checkoutEnabled ? (
            <Button
              type="button"
              onClick={() => void startCheckout()}
              disabled={checkoutLoading !== null}
              className="shrink-0"
            >
              {checkoutLoading ? "Opening\u2026" : "Upgrade \u2192"}
            </Button>
          ) : (
            <span className="shrink-0 text-xs text-slate-400">
              Checkout soon
            </span>
          )}
        </div>
        {checkoutEnabled ? planPicker : null}
        {message ? (
          <p className="mt-2 w-full text-xs text-slate-300">{message}</p>
        ) : null}
      </div>

      <div className="ui-card ui-soft-surface-raised mt-4 hidden rounded-lg p-4 sm:block">
        <p className="ui-kicker">Praxis Pro</p>
        <p className="mt-1 text-lg font-semibold text-white">{headline}</p>
        <p className="mt-2 text-sm text-slate-300">{body}</p>
        <UpgradeValueContext />
        {checkoutEnabled ? (
          <div className="mt-4">
            {planPicker}
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => void startCheckout()}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading
                  ? "Opening checkout..."
                  : selectedPlan === "annual"
                    ? "Upgrade — annual"
                    : selectedPlan === "founders"
                      ? "Upgrade — founders"
                      : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-2 text-xs text-slate-300">
            Card checkout is not available in this beta build yet.
          </p>
        )}
        {message ? (
          <p className="mt-2 text-xs text-slate-300">{message}</p>
        ) : null}
      </div>
    </>
  );
}
