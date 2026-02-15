import Link from "next/link";
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
  phaseGoal,
  encouragement,
  metricChips,
  ctaLabel,
  ctaHref,
}: DashboardHeroProps) {
  return (
    <section className="ui-card p-5">
      <p className="text-sm text-slate-500">{greeting}</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{phaseName}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {metricChips.slice(0, 4).map((chip) => (
          <span
            key={chip}
            title={
              chip.startsWith("Readiness:")
                ? "Based on recent completion + pain signals"
                : undefined
            }
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
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
          subtitle={`${Math.round(cycleProgressPercent)}% through current gate`}
        />
        <ProgressBar
          label="Week progress"
          value={weekProgressPercent}
          max={100}
          subtitle={`${weekCompletedDays}/${weekTargetDays} days completed`}
        />
      </div>

      <Link
        href={ctaHref}
        className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
      >
        {ctaLabel}
      </Link>

      <p className="mt-4 text-xs text-slate-500">
        Phase goal: <span className="font-medium text-slate-700">{phaseGoal}</span>
      </p>
      {encouragement ? (
        <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          {encouragement}
        </p>
      ) : null}
    </section>
  );
}
