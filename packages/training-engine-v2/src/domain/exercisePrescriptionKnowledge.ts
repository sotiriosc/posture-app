import type { ExerciseDoseMode } from "../prescription/dose";
import type { ProgressionAxis } from "./progression";
import type { SessionSection, TrainingRole } from "./session";

export type ExercisePrescriptionReviewStatus =
  | "accepted"
  | "needs_review"
  | "unknown";

export type ExercisePrescriptionKnowledgeProvenanceSource =
  | "owner_decision"
  | "human_exercise_science_review"
  | "external_reference"
  | "legacy_reference_catalog_migration"
  | "unknown";

export interface ExercisePrescriptionKnowledgeProvenance {
  readonly source: ExercisePrescriptionKnowledgeProvenanceSource;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly reviewerId?: string;
  readonly reviewedAt?: string;
  readonly notes?: string;
}

export type ExerciseDoseModeAnnotationStatus =
  | "primary"
  | "legal_alternative"
  | "contextual"
  | "unknown";

export interface ExerciseDoseModeAnnotation {
  readonly mode: ExerciseDoseMode;
  readonly status: ExerciseDoseModeAnnotationStatus;
  readonly legalTrainingRoles?: readonly TrainingRole[];
  readonly legalSessionSections?: readonly SessionSection[];
  readonly identityPreservation: string;
  readonly reviewStatus: ExercisePrescriptionReviewStatus;
  readonly provenance: readonly ExercisePrescriptionKnowledgeProvenance[];
  readonly notes: string;
}

export type ExerciseTimingModel =
  | "dynamic_repetition"
  | "isometric_hold"
  | "breathing_cycle"
  | "locomotor_trip"
  | "stationary_march"
  | "counted_steps"
  | "mixed_contextual"
  | "unknown";

export type RepetitionTempoCapabilityStatus =
  | "applicable"
  | "not_applicable"
  | "unknown";

export interface RepetitionTempoCapability {
  readonly status: RepetitionTempoCapabilityStatus;
  readonly meaningfulPhaseTiming: boolean;
  readonly allowedKinds: readonly (
    | "repetition_phase_tempo"
    | "intent_only"
    | "not_prescribed"
    | "not_applicable"
    | "unknown"
  )[];
  readonly notes: string;
}

export type DurationCapabilityStatus =
  | "primary_duration_dose"
  | "legal_alternative_duration_dose"
  | "not_applicable"
  | "unknown";

export type DurationExposureContext =
  | "per_hold"
  | "per_trip"
  | "per_set"
  | "per_round"
  | "per_stationary_march"
  | "per_balance_exposure"
  | "unknown";

export interface DurationCapability {
  readonly status: DurationCapabilityStatus;
  readonly contexts: readonly DurationExposureContext[];
  readonly notes: string;
}

export type BreathingCadenceCapabilityStatus =
  | "optional_structured"
  | "not_applicable"
  | "unknown";

export interface BreathingCadenceCapability {
  readonly status: BreathingCadenceCapabilityStatus;
  readonly notes: string;
}

export type LocomotorCadenceCapabilityStatus =
  | "optional_structured"
  | "not_applicable"
  | "unknown";

export type LocomotorCadenceKind =
  | "gait_pace"
  | "march_cadence"
  | "step_cadence";

export interface LocomotorCadenceCapability {
  readonly status: LocomotorCadenceCapabilityStatus;
  readonly cadenceKinds: readonly LocomotorCadenceKind[];
  readonly notes: string;
}

export interface ExercisePrescriptionConstraint {
  readonly id: string;
  readonly description: string;
  readonly provenance: readonly ExercisePrescriptionKnowledgeProvenance[];
}

export interface ExercisePrescriptionKnowledgeProfile {
  readonly profileId: string;
  readonly exerciseId: string;
  readonly version: "exercise_prescription_knowledge_v1";
  readonly doseModeAnnotations: readonly ExerciseDoseModeAnnotation[];
  readonly primaryDoseMode: ExerciseDoseMode;
  readonly legalAlternateDoseModes: readonly ExerciseDoseMode[];
  readonly timingModel: ExerciseTimingModel;
  readonly repetitionTempo: RepetitionTempoCapability;
  readonly duration: DurationCapability;
  readonly breathingCadence: BreathingCadenceCapability;
  readonly locomotorCadence: LocomotorCadenceCapability;
  readonly legalTimingProgressionAxes: readonly ProgressionAxis[];
  readonly constraints: readonly ExercisePrescriptionConstraint[];
  readonly reviewStatus: ExercisePrescriptionReviewStatus;
  readonly provenance: readonly ExercisePrescriptionKnowledgeProvenance[];
  readonly unknowns: readonly string[];
  readonly identityBoundary: string;
  readonly responseSensitiveTimingModifications: readonly string[];
}
