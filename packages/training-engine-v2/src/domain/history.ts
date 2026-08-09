import type { MovementRole } from "./primitives";

export type ExerciseHistoryEventType =
  | "successful_completion"
  | "too_easy"
  | "appropriate_challenge"
  | "too_difficult"
  | "failed_target"
  | "pain_response"
  | "substitution"
  | "personal_block"
  | "progression_success"
  | "progression_failure"
  | "plateau";

export interface ExerciseHistoryEvent {
  readonly id: string;
  readonly exerciseId: string;
  readonly type: ExerciseHistoryEventType;
  readonly occurredAt?: string;
  readonly movementRole?: MovementRole;
  readonly notes: string;
}

export interface ExerciseHistory {
  readonly events: readonly ExerciseHistoryEvent[];
  readonly stableExerciseIds: readonly string[];
  readonly blockedExerciseIds: readonly string[];
}

export interface SessionHistory {
  readonly completedSessionIds: readonly string[];
  readonly missedSessionIds: readonly string[];
  readonly substitutedExerciseIds: readonly string[];
  readonly notes: readonly string[];
}

export interface ProgramHistory {
  readonly completedPhaseIds: readonly string[];
  readonly completedWeekIds: readonly string[];
  readonly adherenceNotes: readonly string[];
}

export interface ProgressionState {
  readonly readyToProgressExerciseIds: readonly string[];
  readonly holdExerciseIds: readonly string[];
  readonly stalledExerciseIds: readonly string[];
  readonly successfulMovementRoles: readonly MovementRole[];
}

export interface FatigueState {
  readonly overall: "low" | "moderate" | "high";
  readonly byMovementRole: Partial<Record<MovementRole, "low" | "moderate" | "high">>;
}

export interface TrainingHistory {
  readonly exerciseHistory: ExerciseHistory;
  readonly sessionHistory: SessionHistory;
  readonly programHistory: ProgramHistory;
  readonly progressionState: ProgressionState;
  readonly fatigueState: FatigueState;
}

export const EMPTY_TRAINING_HISTORY: TrainingHistory = {
  exerciseHistory: {
    events: [],
    stableExerciseIds: [],
    blockedExerciseIds: [],
  },
  sessionHistory: {
    completedSessionIds: [],
    missedSessionIds: [],
    substitutedExerciseIds: [],
    notes: [],
  },
  programHistory: {
    completedPhaseIds: [],
    completedWeekIds: [],
    adherenceNotes: [],
  },
  progressionState: {
    readyToProgressExerciseIds: [],
    holdExerciseIds: [],
    stalledExerciseIds: [],
    successfulMovementRoles: [],
  },
  fatigueState: {
    overall: "low",
    byMovementRole: {},
  },
};
