import type { PhaseId } from "./domain/phase";

export interface SelectionDecision {
  readonly exerciseId: string;
  readonly slotId: string;
  readonly reason: string;
}

export interface ExercisePrescription {
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly sets?: number;
  readonly reps?: string;
  readonly timeSeconds?: number;
  readonly effortTarget?: string;
  readonly tempo?: string;
  readonly rangeInstruction?: string;
  readonly supportInstruction?: string;
  readonly restSeconds?: number;
  readonly rationale: string;
}

export type ProgressionAxis =
  | "load"
  | "reps"
  | "sets"
  | "range"
  | "tempo"
  | "support_reduction"
  | "stability"
  | "coordination"
  | "complexity";

export interface ProgressionDecision {
  readonly exerciseId: string;
  readonly action: "hold" | "progress_prescription" | "regress_prescription" | "replace_exercise" | "deload";
  readonly axis?: ProgressionAxis;
  readonly keepsExerciseStable: boolean;
  readonly reason: string;
  readonly requiresHumanReview: boolean;
}

export interface PrescriptionCompilerContract {
  compile(input: {
    readonly selection: SelectionDecision;
    readonly priorPrescription?: ExercisePrescription;
  }): ExercisePrescription;
}

export interface ProgressionModelContract {
  recommendProgression(input: {
    readonly prescription: ExercisePrescription;
    readonly recentHistoryEventIds: readonly string[];
  }): ProgressionDecision;
}
