import type { ExerciseDose } from "./dose";
import type { TempoPrescription } from "./executionStandard";
import type { EvidenceProvenance, ISODateTimeString } from "./types";

export type CompletionStatus =
  | "completed_as_planned"
  | "partially_completed"
  | "target_not_met"
  | "not_performed"
  | "substituted"
  | "unknown";

export type QualityObservationResult =
  | "met"
  | "partially_met"
  | "not_met"
  | "not_observed";

export type QualityObservationSource =
  | "self_report"
  | "coach_observation"
  | "sensor"
  | "future_vision_adapter"
  | "unknown";

export interface ExecutionQualityObservation {
  readonly criterionId: string;
  readonly result: QualityObservationResult;
  readonly source: QualityObservationSource;
  readonly provenance: EvidenceProvenance;
  readonly notes?: string;
}

export interface ExerciseSubstitutionRecord {
  readonly originalExerciseId: string;
  readonly substitutedExerciseId: string;
  readonly reason: string;
  readonly provenance: EvidenceProvenance;
}

export type ActualTempoObservation =
  | {
      readonly kind: "observed";
      readonly tempo: TempoPrescription;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "not_observed";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    };

export type ActualDurationObservation =
  | {
      readonly kind: "observed_seconds";
      readonly seconds: number;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "not_observed";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    };

export interface ExercisePerformanceTimingObservation {
  readonly actualTempo?: ActualTempoObservation;
  readonly actualDuration?: ActualDurationObservation;
  readonly timingControlObservationCriterionIds: readonly string[];
  readonly prescribedTempoAssumedActual: false;
  readonly prescribedDurationAssumedActual: false;
  readonly notes?: readonly string[];
}

export interface ExercisePerformanceRecord {
  readonly performanceRecordId: string;
  readonly prescriptionId: string;
  readonly exerciseId: string;
  readonly occurredAt: ISODateTimeString;
  readonly completionStatus: CompletionStatus;
  readonly actualDose?: ExerciseDose;
  readonly actualTiming?: ExercisePerformanceTimingObservation;
  readonly realizedStressExposureIds?: readonly string[];
  readonly qualityObservations: readonly ExecutionQualityObservation[];
  readonly unresolvedPainResponseEvidenceIds: readonly string[];
  readonly trainingResponseObservationIds: readonly string[];
  readonly recoveryEvidenceIds: readonly string[];
  readonly recoveryStatus?:
    | "recovered_as_expected"
    | "recovery_concern"
    | "insufficient_observation"
    | "unknown";
  readonly substitutions: readonly ExerciseSubstitutionRecord[];
  readonly notes: readonly string[];
  readonly provenance: EvidenceProvenance;
}
