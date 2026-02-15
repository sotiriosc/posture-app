import Link from "next/link";
import ReadinessIndicator from "@/components/dashboard/ReadinessIndicator";
import ProgressBar from "@/components/ui/ProgressBar";
import { primaryActionBtn } from "@/components/ui/buttonStyles";

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
  phaseGoal: string;
  encouragement?: string | null;
  metricChips: string[];
  ctaLabel: "Start Today's Session" | "Continue Session";
  ctaHref: string;
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
  phaseGoal,
  encouragement,
  metricChips,
  ctaLabel,
  ctaHref,
}: DashboardHeroProps) {
  return (
    <section className="ui-card p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{phaseName}</h1>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm lg:hidden">
            <ReadinessIndicator score={readinessScore} />
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

        <div className="flex w-full flex-col gap-3 lg:min-w-[240px] lg:max-w-[320px] lg:basis-[30%]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm lg:block">
            <ReadinessIndicator score={readinessScore} />
          </div>
          <Link
            href={ctaHref}
            className={`${primaryActionBtn} mt-1 h-12 w-full justify-between gap-3 px-5 text-sm lg:min-w-[240px]`}
          >
            <span>{ctaLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
