import {
  MAX_PHASE_INDEX,
  decideProgramProgression,
  deriveUserTrainingState,
  type UserTrainingState,
} from "@/lib/phases";
import type { Program } from "@/lib/types";

const clampPhaseIndexToSupportedRange = (phaseIndex: number) =>
  Math.min(MAX_PHASE_INDEX, Math.max(1, Math.floor(phaseIndex)));

const derivePriorReadiness = (currentProgram: Program) =>
  currentProgram.nextWeekPlan?.summary.includes("progress") ? 0.7 : 0.55;

const repeatProgression = (message: string) =>
  ({
    status: "repeat" as const,
    message,
  });

const blockedProgression = (message: string) =>
  ({
    status: "blocked" as const,
    message,
  });

const advanceProgression = (target: ProgressionTarget) =>
  ({
    status: "advanced" as const,
    target,
  });

export type ProgressionTarget = {
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
};

export type ProgramProgressionState = {
  phaseIndex: number;
  phaseWeekIndex: number;
  totalWeekIndex: number;
  cycleIndex: number;
  priorReadiness: number;
  trainingState: UserTrainingState;
};

export type ProgressionDecision =
  | ReturnType<typeof repeatProgression>
  | ReturnType<typeof blockedProgression>
  | ReturnType<typeof advanceProgression>;

export const deriveProgramProgressionState = (params: {
  currentProgram: Program;
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  movementQuality?: number;
  confidence?: number;
  capacity?: number;
}): ProgramProgressionState => {
  const phaseIndex = clampPhaseIndexToSupportedRange(params.currentProgram.phaseIndex ?? 1);
  const phaseWeekIndex = params.currentProgram.weekIndex ?? 1;
  const totalWeekIndex =
    params.currentProgram.totalWeekIndex ?? params.currentProgram.weekIndex ?? 1;
  const cycleIndex = params.currentProgram.cycleIndex ?? 1;
  const priorReadiness = derivePriorReadiness(params.currentProgram);
  const trainingState = deriveUserTrainingState({
    phaseIndex,
    complianceRate: params.complianceRate,
    painFlag: params.painFlag,
    fatigueFlag: params.fatigueFlag,
    movementQuality: params.movementQuality,
    confidence: params.confidence,
    capacity: params.capacity,
    priorReadiness,
  });

  return {
    phaseIndex,
    phaseWeekIndex,
    totalWeekIndex,
    cycleIndex,
    priorReadiness,
    trainingState,
  };
};

export const evaluateNextPhaseProgression = (params: {
  currentProgram: Program;
  progressionState: ProgramProgressionState;
  completedSessionsCount?: number;
  completedWeeksCount?: number;
  minimumWeeksForPhaseAdvance: number;
}): ProgressionDecision => {
  const {
    currentProgram,
    progressionState,
    completedSessionsCount,
    completedWeeksCount,
    minimumWeeksForPhaseAdvance,
  } = params;

  if (progressionState.phaseIndex >= MAX_PHASE_INDEX) {
    return repeatProgression(
      `You are already in Phase ${MAX_PHASE_INDEX}. Continue progressing through cycles for variation.`
    );
  }

  if (progressionState.trainingState.painRisk >= 0.65) {
    return blockedProgression(progressionState.trainingState.reason);
  }

  if (
    progressionState.trainingState.consistency < 0.5 ||
    progressionState.trainingState.fatigueRisk >= 0.65
  ) {
    return repeatProgression(progressionState.trainingState.reason);
  }

  const weeksCompleted =
    typeof completedWeeksCount === "number"
      ? completedWeeksCount
      : Math.max(0, progressionState.totalWeekIndex - 1);
  if (weeksCompleted < minimumWeeksForPhaseAdvance) {
    return repeatProgression(
      "Complete at least 2 full weeks before advancing to the next phase."
    );
  }

  const requiredSessionsForPhase =
    currentProgram.daysPerWeek * minimumWeeksForPhaseAdvance;
  if (
    typeof completedSessionsCount === "number" &&
    completedSessionsCount < requiredSessionsForPhase
  ) {
    return repeatProgression(
      `Complete at least ${requiredSessionsForPhase} sessions before advancing to the next phase.`
    );
  }

  return advanceProgression({
    phaseIndex: clampPhaseIndexToSupportedRange(progressionState.phaseIndex + 1),
    cycleIndex: 1,
    weekIndex: 1,
    totalWeekIndex: progressionState.totalWeekIndex + 1,
  });
};

export const evaluateNextCycleProgression = (params: {
  currentProgram: Program;
  progressionState: ProgramProgressionState;
  complianceRate: number;
  completedSessionsCount?: number;
  completedWeeksCount?: number;
  minimumWeeksForPhaseAdvance: number;
}): ProgressionDecision => {
  const {
    currentProgram,
    progressionState,
    complianceRate,
    completedSessionsCount,
    completedWeeksCount,
    minimumWeeksForPhaseAdvance,
  } = params;

  const transition = decideProgramProgression({
    state: progressionState.trainingState,
    phaseIndex: progressionState.phaseIndex,
    cycleIndex: progressionState.cycleIndex,
    phaseWeekIndex: progressionState.phaseWeekIndex,
    totalWeekIndex: progressionState.totalWeekIndex,
    minimumWeeksForPhaseAdvance,
  });

  const requiredSessionsForCurrentCycle = currentProgram.daysPerWeek;
  if (
    typeof completedSessionsCount === "number" &&
    completedSessionsCount < requiredSessionsForCurrentCycle
  ) {
    return repeatProgression(
      `Complete at least ${requiredSessionsForCurrentCycle} sessions before starting the next cycle.`
    );
  }

  if (complianceRate < 0.85) {
    return repeatProgression(
      "Hit at least 85% weekly compliance before advancing cycle."
    );
  }

  if (
    transition.next &&
    transition.next.phaseIndex > progressionState.phaseIndex &&
    typeof completedWeeksCount === "number" &&
    completedWeeksCount < minimumWeeksForPhaseAdvance
  ) {
    return repeatProgression(
      "Complete at least 2 full weeks before advancing phase."
    );
  }

  if (transition.status !== "advanced" || !transition.next) {
    return {
      status: transition.status,
      message: transition.message ?? progressionState.trainingState.reason,
    };
  }

  return advanceProgression(transition.next);
};

export const resolveGeneratedProgramTransitionState = (params: {
  program: Program;
  fallbackTarget: ProgressionTarget;
}) => ({
  phaseIndex: params.program.phaseIndex ?? params.fallbackTarget.phaseIndex,
  cycleIndex: params.program.cycleIndex ?? params.fallbackTarget.cycleIndex,
  weekIndex: params.program.weekIndex ?? params.fallbackTarget.weekIndex,
});
