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
    trendLabel === "Capacity improving"
      ? "text-emerald-700"
      : trendLabel === "Load tolerance building"
        ? "text-blue-700"
        : "text-slate-700";

  return (
    <section className="ui-card p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Performance overview
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Performance Overview
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Consistency
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            <AnimatedCount value={consistencyPercent} suffix="%" />
          </p>
          <p className="mt-2 text-xs text-slate-500">Since active baseline</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Sessions this week
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            <AnimatedCount value={sessionsThisWeek} />
          </p>
          <p className="mt-2 text-xs text-slate-500">Last 7-day window</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Consistency streak
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            <AnimatedCount value={weeklyGoalStreak} />
            <span className="ml-1 text-base font-medium text-slate-600">{weekLabel}</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Consecutive weeks hitting {prescribedWorkoutsPerWeek} workouts/week
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Trend</p>
          <p className={`mt-2 text-lg font-semibold ${trendTone}`}>{trendLabel}</p>
          <p className="mt-2 text-xs text-slate-500">
            Based on recent difficulty pattern
          </p>
        </article>
      </div>
    </section>
  );
}
