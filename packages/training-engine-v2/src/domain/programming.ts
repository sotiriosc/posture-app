import type { PhaseIntent } from "./phase";
import type { BodyRegion, MovementRole, MuscleGroup, TrainingGoal } from "./primitives";
import type { SessionIntent } from "./session";

export interface WeeklyIntent {
  readonly id: string;
  readonly phaseIntent: PhaseIntent;
  readonly primaryGoal: TrainingGoal;
  readonly sessionsPerWeek: number;
  readonly movementExposure: Partial<Record<MovementRole, number>>;
  readonly muscleExposure: Partial<Record<MuscleGroup, number>>;
  readonly priorityExposure: readonly string[];
  readonly recoverySpacing: Partial<Record<MovementRole, number>>;
  readonly volumeIntent: "introductory" | "moderate" | "progressive" | "high";
  readonly phaseObjective: string;
}

export interface PlannedExercise {
  readonly exerciseId: string;
  readonly slotId: string;
}

export interface PlannedSession {
  readonly sessionIntent: SessionIntent;
  readonly plannedExercises: readonly PlannedExercise[];
}

export interface PlannedWeek {
  readonly weeklyIntent: WeeklyIntent;
  readonly sessions: readonly PlannedSession[];
}

export interface TrainingStimulusSummary {
  readonly movementExposure: Partial<Record<MovementRole, number>>;
  readonly muscleExposure: Partial<Record<MuscleGroup, number>>;
  readonly bodyRegionStress: Partial<Record<BodyRegion, number>>;
}
