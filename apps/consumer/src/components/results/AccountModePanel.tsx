"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import type { SubscriptionPlan } from "@praxis/engine";

type AccountModePanelProps = {
  authEnabled: boolean;
  plan: SubscriptionPlan;
  currentPhaseIndex: number;
  totalCompletedWorkoutCount: number;
  resetProgressMessage: string | null;
  resetProgressConfirmOpen: boolean;
  resetProgressWorking: boolean;
  onOpenResetProgressConfirm: () => void;
  onCloseResetProgressConfirm: () => void;
  onResetCurrentProgress: () => void;
};

export default function AccountModePanel({
  authEnabled,
  plan,
  currentPhaseIndex,
  totalCompletedWorkoutCount,
  resetProgressMessage,
  resetProgressConfirmOpen,
  resetProgressWorking,
  onOpenResetProgressConfirm,
  onCloseResetProgressConfirm,
  onResetCurrentProgress,
}: AccountModePanelProps) {
  return (
    <section
      className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6"
      data-testid="account-mode-panel"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
        <div>
          <p className="ui-kicker">Billing / Account</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {authEnabled ? (plan === "pro" ? "Praxis Pro active" : "Free access") : "Local-first mode"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Manage plan status, exports, and training data without leaving the dashboard.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="ui-soft-surface rounded-lg px-3 py-3">
              <p className="text-xs text-slate-400">Plan</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {authEnabled ? (plan === "pro" ? "Pro" : "Free") : "Local"}
              </p>
            </div>
            <div className="ui-soft-surface rounded-lg px-3 py-3">
              <p className="text-xs text-slate-400">Plan</p>
              <p className="mt-1 text-sm font-semibold text-white">
                Phase {currentPhaseIndex}
              </p>
            </div>
            <div className="ui-soft-surface rounded-lg px-3 py-3">
              <p className="text-xs text-slate-400">History</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {totalCompletedWorkoutCount} workouts
              </p>
            </div>
          </div>
        </div>
        <div className="ui-soft-surface rounded-lg p-4">
          <p className="text-sm font-semibold text-white">Account actions</p>
          <div className="mt-3 flex flex-col gap-2">
            {authEnabled ? (
              <Link href="/account/billing" className="self-start">
                <Button variant="primary">
                  {plan === "pro" ? "Manage subscription" : "View Pro options"}
                </Button>
              </Link>
            ) : null}
            <Link href="/account/settings">
              <Button variant="secondary" className="h-11 w-full">
                Data and settings
              </Button>
            </Link>
            <Link href="/questionnaire">
              <Button variant="secondary" className="h-11 w-full">
                Edit movement profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="ui-soft-surface mt-4 rounded-lg p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Reset current progress</p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
              Restart the active plan from Day 1. Completed workouts and logs stay saved.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={onOpenResetProgressConfirm}
            data-testid="reset-current-progress-trigger"
          >
            Reset current progress
          </Button>
        </div>
        {resetProgressMessage ? (
          <p className="mt-3 text-xs text-slate-300" aria-live="polite">
            {resetProgressMessage}
          </p>
        ) : null}
        {resetProgressConfirmOpen ? (
          <div
            className="mt-4 rounded-lg border border-sky-300/25 bg-sky-400/10 p-4"
            data-testid="reset-current-progress-confirm"
          >
            <p className="text-sm font-semibold text-white">Start fresh week?</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              This resets the active plan baseline and current day back to Day 1.
              It does not erase completed sessions, exercise logs, saved plans, photos, or exports.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="primary"
                disabled={resetProgressWorking}
                onClick={onResetCurrentProgress}
                data-testid="reset-current-progress-confirm-button"
              >
                {resetProgressWorking ? "Resetting..." : "Start fresh week"}
              </Button>
              <Button
                variant="secondary"
                disabled={resetProgressWorking}
                onClick={onCloseResetProgressConfirm}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
