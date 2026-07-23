"use client";

import AnimatedCount from "@/components/progress/AnimatedCount";

type PerformanceOverviewProps = {
  consistencyPercent: number;
  consistencyFloorMet: boolean;
  sessionsThisWeek: number;
  weeklyGoalStreak: number;
  streakFloorMet: boolean;
  prescribedWorkoutsPerWeek: number;
  trendLabel: string;
  trendFloorMet: boolean;
};

/**
 * Phase 6d, Commit 4 — a fresh user's real numbers here are ~0 by
 * definition (3%, 1 session, 0-week streak, a trend label with no data
 * behind it). Showing them as if they were meaningful reads as a report
 * card grading someone for not having a history yet. Below each metric's
 * statistical floor, show `BaselineNotice` coaching copy instead of the
 * dimmed near-zero number.
 */
function BaselineNotice() {
  return (
    <p className="mt-2 text-sm leading-5 text-slate-400">
      Building your baseline. Come back after a few sessions and this screen
      starts telling your story.
    </p>
  );
}

export default function PerformanceOverview({
  consistencyPercent,
  consistencyFloorMet,
  sessionsThisWeek,
  weeklyGoalStreak,
  streakFloorMet,
  prescribedWorkoutsPerWeek,
  trendLabel,
  trendFloorMet,
}: PerformanceOverviewProps) {
  const weekLabel = weeklyGoalStreak === 1 ? "week" : "weeks";
  const trendTone =
    trendLabel === "Pattern quality improving"
      ? "text-emerald-200"
      : trendLabel === "Corrective strength trend"
        ? "text-sky-200"
        : "text-slate-200";

  const sessionsThisWeekCopy =
    sessionsThisWeek === 0
      ? "Log a session this week to get started."
      : sessionsThisWeek === 1
        ? "1 session this week — you're building."
        : sessionsThisWeek >= prescribedWorkoutsPerWeek
          ? `${sessionsThisWeek} sessions this week — right on target.`
          : `${sessionsThisWeek} sessions this week — you're building.`;

  return (
    <section className="ui-card ui-soft-surface-raised p-6">
      <div className="mb-4">
        <p className="ui-kicker">
          Performance overview
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Performance Overview
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">
            How often you did the work
          </p>
          {consistencyFloorMet ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-white">
                <AnimatedCount value={consistencyPercent} suffix="%" />
              </p>
              <p className="mt-2 text-xs text-slate-400">Since active baseline</p>
            </>
          ) : (
            <BaselineNotice />
          )}
        </article>

        {/* Sessions this week has no statistical floor — it's a count, not
            a judgment — but the copy is reframed as trajectory rather than
            a bare "Last 7-day window" label. */}
        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">
            Sessions this week
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            <AnimatedCount value={sessionsThisWeek} />
          </p>
          <p className="mt-2 text-xs text-slate-400">{sessionsThisWeekCopy}</p>
        </article>

        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">
            Consistency streak
          </p>
          {streakFloorMet ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-white">
                <AnimatedCount value={weeklyGoalStreak} />
                <span className="ml-1 text-base font-medium text-slate-300">{weekLabel}</span>
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Consecutive weeks hitting {prescribedWorkoutsPerWeek} workouts/week
              </p>
            </>
          ) : (
            <BaselineNotice />
          )}
        </article>

        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">Trend</p>
          {trendFloorMet ? (
            <>
              <p className={`mt-2 text-lg font-semibold ${trendTone}`}>{trendLabel}</p>
              <p className="mt-2 text-xs text-slate-400">
                Based on recent difficulty pattern
              </p>
            </>
          ) : (
            <BaselineNotice />
          )}
        </article>
      </div>
    </section>
  );
}
