import Link from "next/link";
import ReadinessIndicator from "@/components/dashboard/ReadinessIndicator";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";

type DashboardHeroProps = {
  greeting: string;
  phaseName: string;
  workoutsCompletedInPhase: number;
  workoutTarget: number;
  daysInPhase: number;
  dayTarget: number;
  weekCompletedDays: number;
  weekTargetDays: number;
  weekProgressPercent: number;
  phaseGateStatusLabel: "Ready to advance" | "Gate locked" | "Phase 3 active";
  phaseGateStatusDetail: string;
  phaseGateReady: boolean;
  phaseGateActionLabel?: string | null;
  onPhaseGateAction?: (() => void) | null;
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
  workoutsCompletedInPhase,
  workoutTarget,
  daysInPhase,
  dayTarget,
  weekCompletedDays,
  weekTargetDays,
  weekProgressPercent,
  phaseGateStatusLabel,
  phaseGateStatusDetail,
  phaseGateReady,
  phaseGateActionLabel,
  onPhaseGateAction,
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
    ? `Corrective consistency: ${weeklyConsistencyCount}/${weeklyConsistencyTarget} this week`
    : `Corrective consistency: ${weeklyConsistencyCount} sessions this week`;

  return (
    <section className="praxis-panel-strong p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-300">{greeting}</p>
          <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">{phaseName}</h1>
          <div className="praxis-card mt-4 rounded-lg px-3 py-3 lg:hidden">
            <ReadinessIndicator score={readinessScore} />
            <p className="mt-3 text-xs font-medium text-slate-300">
              {consistencyText}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Based on your current plan week.
            </p>
          </div>
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
          <p className="mt-3 text-sm text-slate-300">
            Week progress: {weekCompletedDays}/{weekTargetDays} days complete
          </p>

          <div className="praxis-card mt-4 space-y-3 rounded-lg px-3 py-3">
            <div>
              <p className="ui-kicker">Phase gate</p>
              <p
                className={`mt-1 text-base font-semibold ${
                  phaseGateReady ? "text-emerald-100" : "text-sky-100"
                }`}
              >
                {phaseGateStatusLabel}
              </p>
              <p className="mt-1 text-xs text-slate-300">{phaseGateStatusDetail}</p>
            </div>
            {phaseGateReady && phaseGateActionLabel && onPhaseGateAction ? (
              <div
                className="flex flex-col gap-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-testid="phase-ready-persistent-cta"
              >
                <p className="text-xs text-slate-200">
                  {phaseGateStatusDetail}
                </p>
                <Button variant="primary" onClick={onPhaseGateAction}>
                  {phaseGateActionLabel}
                </Button>
              </div>
            ) : null}
            <ProgressBar
              label="Workout gate progress"
              value={workoutsCompletedInPhase}
              max={workoutTarget}
              animate
              subtitle={`${workoutsCompletedInPhase}/${workoutTarget} workouts in phase`}
            />
            <ProgressBar
              label="Days in phase"
              value={daysInPhase}
              max={dayTarget}
              animate
              subtitle={`${daysInPhase}/${dayTarget} days in phase`}
            />
          </div>

          <div className="mt-4">
            <ProgressBar
              label="Week progress"
              value={weekProgressPercent}
              max={100}
              animate
              subtitle={`${weekCompletedDays}/${weekTargetDays} days completed`}
            />
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
          <div className="praxis-card hidden rounded-lg px-4 py-4 lg:block">
            <ReadinessIndicator score={readinessScore} />
            <p className="mt-3 text-xs font-medium text-slate-300">
              {consistencyText}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Based on your current plan week.
            </p>
          </div>
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
