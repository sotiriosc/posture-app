import Link from "next/link";
import ReadinessIndicator from "@/components/dashboard/ReadinessIndicator";
import ProgressBar from "@/components/ui/ProgressBar";

type DashboardHeroProps = {
  greeting: string;
  phaseName: string;
  cycleCurrent: number;
  cycleTarget: number;
  weekCompletedDays: number;
  weekTargetDays: number;
  cycleProgressPercent: number;
  weekProgressPercent: number;
  readinessScore: number;
  weeklyConsistencyCount: number;
  weeklyConsistencyTarget?: number | null;
  phaseGoal: string;
  encouragement?: string | null;
  metricChips: string[];
  ctaLabel: "Start Today's Session" | "Continue Session";
  ctaHref: string;
  ctaPulse?: boolean;
};

export default function DashboardHero({
  greeting,
  phaseName,
  cycleCurrent,
  cycleTarget,
  weekCompletedDays,
  weekTargetDays,
  cycleProgressPercent,
  weekProgressPercent,
  readinessScore,
  weeklyConsistencyCount,
  weeklyConsistencyTarget,
  phaseGoal,
  encouragement,
  metricChips,
  ctaLabel,
  ctaHref,
  ctaPulse = false,
}: DashboardHeroProps) {
  const hasWeeklyTarget =
    typeof weeklyConsistencyTarget === "number" &&
    Number.isFinite(weeklyConsistencyTarget) &&
    weeklyConsistencyTarget > 0;
  const consistencyText = hasWeeklyTarget
    ? `Consistency: ${weeklyConsistencyCount}/${weeklyConsistencyTarget} this week`
    : `Consistency: ${weeklyConsistencyCount} sessions this week`;

  return (
    <section className="ui-card p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{phaseName}</h1>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm lg:hidden">
            <ReadinessIndicator score={readinessScore} />
            <p className="mt-2 text-xs font-medium text-slate-600">
              {consistencyText}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Based on your current plan week.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {metricChips.slice(0, 4).map((chip) => (
              <span
                key={chip}
                title={
                  chip.startsWith("Readiness:")
                    ? "Based on recent completion + pain signals"
                    : undefined
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-[transform,opacity] duration-200"
              >
                {chip}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Cycle {cycleCurrent} of {cycleTarget} required
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Week progress: {weekCompletedDays} / {weekTargetDays} days complete
          </p>

          <div className="mt-3 space-y-3">
            <ProgressBar
              label="Cycle progress"
              value={cycleProgressPercent}
              max={100}
              animate
              subtitle={`${Math.round(cycleProgressPercent)}% through current gate`}
            />
            <ProgressBar
              label="Week progress"
              value={weekProgressPercent}
              max={100}
              animate
              subtitle={`${weekCompletedDays}/${weekTargetDays} days completed`}
            />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Phase goal: <span className="font-medium text-slate-700">{phaseGoal}</span>
          </p>
          {encouragement ? (
            <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {encouragement}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:min-w-[280px] lg:max-w-[420px] lg:basis-[35%]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm lg:block">
            <ReadinessIndicator score={readinessScore} />
            <p className="mt-2 text-xs font-medium text-slate-600">
              {consistencyText}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Based on your current plan week.
            </p>
          </div>
          <Link
            href={ctaHref}
            className={`mt-1 flex h-[52px] w-full items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] px-5 text-base font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(37,99,235,0.35)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(37,99,235,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              ctaPulse ? "hero-cta-pulse" : ""
            }`}
          >
            <span>{ctaLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
