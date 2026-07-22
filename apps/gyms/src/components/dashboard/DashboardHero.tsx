import Link from "next/link";
import Button from "@/components/ui/Button";

type DashboardHeroProps = {
  greeting: string;
  phaseName: string;
  workoutsCompletedInPhase: number;
  workoutTarget: number;
  dayTarget: number;
  weekCompletedDays: number;
  weekTargetDays: number;
  nextPhaseIndex: number;
  phaseAtMax: boolean;
  phaseGateReady: boolean;
  phaseGateActionLabel?: string | null;
  onPhaseGateAction?: (() => void) | null;
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
  workoutsCompletedInPhase,
  workoutTarget,
  dayTarget,
  weekCompletedDays,
  weekTargetDays,
  nextPhaseIndex,
  phaseAtMax,
  phaseGateReady,
  phaseGateActionLabel,
  onPhaseGateAction,
  phaseGoal,
  encouragement,
  metricChips,
  ctaLabel,
  ctaHref,
  ctaPulse = false,
}: DashboardHeroProps) {
  const phaseLine = phaseAtMax
    ? "You're in the final phase — keep building strength and clean execution."
    : phaseGateReady
    ? `You've met what's needed to move to Phase ${nextPhaseIndex}.`
    : `Phase ${nextPhaseIndex} unlocks after ${workoutTarget} sessions or ${dayTarget} days — whichever comes first. You've done ${workoutsCompletedInPhase} ${
        workoutsCompletedInPhase === 1 ? "session" : "sessions"
      } so far.`;

  return (
    <section className="praxis-panel-strong p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-300">{greeting}</p>
          <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">{phaseName}</h1>

          <div className="praxis-card mt-4 rounded-lg px-3 py-3">
            <p className="text-sm font-semibold text-white">
              This week: {weekCompletedDays} of {weekTargetDays} sessions done.
            </p>
          </div>

          {metricChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {metricChips.slice(0, 4).map((chip) => (
                <span
                  key={chip}
                  className="praxis-card-muted rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-300"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div className="praxis-card mt-4 space-y-3 rounded-lg px-3 py-3">
            <p className="text-sm text-slate-200">{phaseLine}</p>
            {phaseGateReady && phaseGateActionLabel && onPhaseGateAction ? (
              <div
                className="flex flex-col gap-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-testid="phase-ready-persistent-cta"
              >
                <p className="text-xs text-slate-200">
                  You&apos;re ready when you are — nothing is locked.
                </p>
                <Button variant="primary" onClick={onPhaseGateAction}>
                  {phaseGateActionLabel}
                </Button>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Phase goal: <span className="font-medium text-slate-200">{phaseGoal}</span>
          </p>
          {encouragement ? (
            <p className="praxis-card-muted mt-3 rounded-lg px-3 py-2 text-xs text-slate-200">
              {encouragement}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:min-w-[280px] lg:max-w-[420px] lg:basis-[35%]">
          <Link
            href={ctaHref}
            scroll
            className={`mt-1 flex h-[56px] w-full items-center justify-between gap-3 rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-5 text-base font-semibold text-white shadow-[0_16px_38px_rgba(37,99,235,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
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
