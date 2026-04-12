"use client";

import AnimatedCount from "@/components/progress/AnimatedCount";

type PerformanceOverviewProps = {
  consistencyPercent: number;
  sessionsThisWeek: number;
  weeklyGoalStreak: number;
  prescribedWorkoutsPerWeek: number;
  trendLabel: string;
};

export default function PerformanceOverview({
  consistencyPercent,
  sessionsThisWeek,
  weeklyGoalStreak,
  prescribedWorkoutsPerWeek,
  trendLabel,
}: PerformanceOverviewProps) {
  const weekLabel = weeklyGoalStreak === 1 ? "week" : "weeks";
  const trendTone =
    trendLabel === "Pattern quality improving"
      ? "text-emerald-200"
      : trendLabel === "Corrective strength trend"
        ? "text-sky-200"
        : "text-slate-200";

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
            Corrective Consistency
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            <AnimatedCount value={consistencyPercent} suffix="%" />
          </p>
          <p className="mt-2 text-xs text-slate-400">Since active baseline</p>
        </article>

        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">
            Sessions this week
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            <AnimatedCount value={sessionsThisWeek} />
          </p>
          <p className="mt-2 text-xs text-slate-400">Last 7-day window</p>
        </article>

        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">
            Consistency streak
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            <AnimatedCount value={weeklyGoalStreak} />
            <span className="ml-1 text-base font-medium text-slate-300">{weekLabel}</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Consecutive weeks hitting {prescribedWorkoutsPerWeek} workouts/week
          </p>
        </article>

        <article className="ui-soft-surface rounded-lg p-4">
          <p className="text-xs uppercase text-slate-400">Trend</p>
          <p className={`mt-2 text-lg font-semibold ${trendTone}`}>{trendLabel}</p>
          <p className="mt-2 text-xs text-slate-400">
            Based on recent difficulty pattern
          </p>
        </article>
      </div>
    </section>
  );
}
