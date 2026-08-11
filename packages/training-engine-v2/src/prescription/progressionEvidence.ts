import type { ExerciseHistoryEvent } from "../domain/history";
import type { ProgressionAxis } from "../domain/progression";
import type { ExercisePerformanceRecord } from "./performanceOutcome";
import type { ExercisePrescription } from "./prescription";

export type DoseEvidenceStatus =
  | "target_met"
  | "target_partially_met"
  | "target_not_met"
  | "unknown";

export type ExecutionQualityEvidenceStatus =
  | "all_required_criteria_met"
  | "one_or_more_required_criteria_not_met"
  | "criteria_not_sufficiently_observed";

export type PainResponseEvidenceStatus =
  | "no_unresolved_response_requirement"
  | "candidate_review_required"
  | "prescription_response_unresolved"
  | "role_substitution_unresolved"
  | "urgent_external_review_signal"
  | "unknown";

export type RecoveryEvidenceStatus =
  | "recovered_as_expected"
  | "recovery_concern"
  | "insufficient_observation"
  | "unknown";

export type ContinuityRunwayEvidenceStatus =
  | "same_exercise_remains_productive"
  | "progression_axes_remain_available"
  | "plateau_evidence"
  | "failed_progression_evidence"
  | "replacement_consideration_evidence"
  | "unknown";

export type RepeatedEvidenceStatus =
  | "isolated_success"
  | "repeated_success"
  | "insufficient_history"
  | "mixed_response";

export interface ProgressionEvidence {
  readonly prescriptionId: string;
  readonly exerciseId: string;
  readonly doseEvidence: DoseEvidenceStatus;
  readonly executionQualityEvidence: ExecutionQualityEvidenceStatus;
  readonly painResponseEvidence: PainResponseEvidenceStatus;
  readonly recoveryEvidence: RecoveryEvidenceStatus;
  readonly continuityRunwayEvidence: readonly ContinuityRunwayEvidenceStatus[];
  readonly repeatedEvidence: RepeatedEvidenceStatus;
  readonly evidenceRecordIds: readonly string[];
  readonly notes: readonly string[];
}

export type ProgressionReadinessClassification =
  | "READY_FOR_PROGRESSION_REVIEW"
  | "HOLD_CURRENT_PRESCRIPTION"
  | "REGRESSION_OR_REVIEW_REQUIRED"
  | "INSUFFICIENT_EVIDENCE";

export interface ProgressionReadinessTrace {
  readonly prescriptionId: string;
  readonly exerciseId: string;
  readonly classification: ProgressionReadinessClassification;
  readonly blockers: readonly string[];
  readonly evidence: ProgressionEvidence;
  readonly selectedAxis: null;
  readonly selectedTransition: null;
  readonly automaticProgressionDecision: false;
}

export interface ProgressionDecision {
  readonly exerciseId: string;
  readonly action:
    | "hold"
    | "progress_prescription"
    | "regress_prescription"
    | "replace_exercise"
    | "deload";
  readonly axis?: ProgressionAxis;
  readonly keepsExerciseStable: boolean;
  readonly reason: string;
  readonly requiresHumanReview: boolean;
}

export interface ProgressionModelContract {
  recommendProgression(input: {
    readonly currentPrescription: ExercisePrescription;
    readonly completedPerformance: readonly ExercisePerformanceRecord[];
    readonly readinessTrace: ProgressionReadinessTrace;
    readonly currentExerciseProgressionAxes: readonly ProgressionAxis[];
    readonly phasePreferredProgressionAxes: readonly ProgressionAxis[];
    readonly recentStructuredHistory: readonly ExerciseHistoryEvent[];
    readonly unresolvedPainResponseRequirementIds: readonly string[];
    readonly recoveryEvidenceIds: readonly string[];
  }): ProgressionDecision;
}
