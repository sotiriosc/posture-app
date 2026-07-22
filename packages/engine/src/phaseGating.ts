import type { ProgramProgress } from "@/lib/types";

export type PhaseGateThreshold = {
  minDays: number;
  minWorkouts: number;
};

export type PhaseGateSatisfiedBy = "workouts" | "days" | "both" | null;

export type PhaseAdvanceGateResult = {
  ok: boolean;
  reasons: string[];
  minDays: number;
  minWorkouts: number;
  workoutsCompletedInPhase: number;
  cyclesCompletedInPhase: number;
  daysSincePhaseStart: number;
  satisfiedBy: PhaseGateSatisfiedBy;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDaysPerWeek = (daysPerWeek: number | null | undefined) => {
  const parsed = Math.floor(daysPerWeek ?? 3);
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

export const getPhaseGateThreshold = (
  phaseIndex: number,
  daysPerWeek?: number | null
): PhaseGateThreshold => {
  const safeDaysPerWeek = normalizeDaysPerWeek(daysPerWeek);
  if (phaseIndex <= 1) {
    return { minDays: 30, minWorkouts: safeDaysPerWeek * 4 };
  }
  return { minDays: 60, minWorkouts: safeDaysPerWeek * 8 };
};

const safeDaysSince = (phaseStartedAt: string | null | undefined, nowIso: string) => {
  if (!phaseStartedAt) return 0;
  const now = Date.parse(nowIso);
  const startedAt = Date.parse(phaseStartedAt);
  if (Number.isNaN(now) || Number.isNaN(startedAt)) return 0;
  return Math.max(0, Math.floor((now - startedAt) / DAY_MS));
};

export const canAdvancePhase = (params: {
  phaseIndex?: number;
  phaseStartedAt?: string | null;
  cyclesCompletedInPhase?: number;
  workoutsCompletedInPhase?: number;
  daysPerWeek?: number | null;
}, nowIso = new Date().toISOString()): PhaseAdvanceGateResult => {
  const {
    phaseIndex = 1,
    phaseStartedAt = null,
    cyclesCompletedInPhase = 0,
    workoutsCompletedInPhase = 0,
    daysPerWeek = 3,
  } = params;
  const { minDays, minWorkouts } = getPhaseGateThreshold(phaseIndex, daysPerWeek);
  const safeCycles = Math.max(0, Math.floor(cyclesCompletedInPhase));
  const safeWorkouts = Math.max(0, Math.floor(workoutsCompletedInPhase));
  const daysSincePhaseStart = safeDaysSince(phaseStartedAt, nowIso);
  const workoutsSatisfied = safeWorkouts >= minWorkouts;
  const daysSatisfied = daysSincePhaseStart >= minDays;
  const satisfiedBy: PhaseGateSatisfiedBy =
    workoutsSatisfied && daysSatisfied
      ? "both"
      : workoutsSatisfied
      ? "workouts"
      : daysSatisfied
      ? "days"
      : null;
  const unmetReasons: string[] = [];

  if (!workoutsSatisfied) {
    unmetReasons.push(`Complete ${minWorkouts} workouts in this phase.`);
  }
  if (!daysSatisfied) {
    unmetReasons.push(`Spend at least ${minDays} days in this phase.`);
  }
  const reasons = satisfiedBy === null ? unmetReasons : [];

  return {
    ok: satisfiedBy !== null,
    reasons,
    minDays,
    minWorkouts,
    workoutsCompletedInPhase: safeWorkouts,
    cyclesCompletedInPhase: safeCycles,
    daysSincePhaseStart,
    satisfiedBy,
  };
};

export const skipPhase1 = (
  progress: ProgramProgress,
  nowIso = new Date().toISOString()
): ProgramProgress => {
  if ((progress.phaseIndex ?? 1) !== 1) {
    return progress;
  }
  return {
    ...progress,
    phaseIndex: 2,
    phaseStartedAt: nowIso,
    cyclesCompletedInPhase: 0,
    workoutsCompletedInPhase: 0,
    weekIndex: 0,
    countedWeekKeys: [],
    updatedAt: nowIso,
  };
};

export const formatPhaseGateReason = (result: PhaseAdvanceGateResult) => {
  if (result.satisfiedBy === "both") {
    return "You've done enough sessions and spent enough time — ready to move ahead.";
  }
  if (result.satisfiedBy === "workouts") {
    return "You've done enough sessions — ready to move ahead.";
  }
  if (result.satisfiedBy === "days") {
    return "You've spent enough time in this phase — ready to move ahead.";
  }
  return `${result.reasons.join(" ")} Either one moves you to the next phase.`;
};
