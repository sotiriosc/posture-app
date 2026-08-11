import type {
  EvidenceProvenance,
  PrescriptionSide,
  PrescriptionSideBehavior,
} from "./types";

export type SupportLevel =
  | "full"
  | "partial"
  | "light_touch"
  | "none"
  | "unknown";

export type SupportSurface =
  | "floor"
  | "wall"
  | "bench"
  | "machine"
  | "box"
  | "chair"
  | "rack"
  | "cable_or_band_anchor"
  | "other"
  | "unknown";

export interface SupportPrescription {
  readonly level: SupportLevel;
  readonly surface?: SupportSurface;
  readonly side?: PrescriptionSide;
  readonly description?: string;
}

export type LeverState =
  | "shortened_regressed"
  | "standard"
  | "lengthened_extended"
  | "unknown";

export interface VariantReference {
  readonly exerciseId: string;
  readonly variantId: string;
  readonly description: string;
}

export interface LeverPrescription {
  readonly state: LeverState;
  readonly variant?: VariantReference;
  readonly description?: string;
}

export type RangePrescription =
  | {
      readonly kind: "full_available";
      readonly description?: string;
    }
  | {
      readonly kind: "intentionally_partial";
      readonly description: string;
    }
  | {
      readonly kind: "custom_reviewed";
      readonly reviewedRangeId: string;
      readonly description: string;
    }
  | {
      readonly kind: "unknown";
      readonly description?: string;
    };

export interface TempoPrescription {
  readonly eccentricSeconds?: number;
  readonly pauseSeconds?: number;
  readonly concentricIntent:
    | "controlled"
    | "natural"
    | "explosive_intent"
    | "not_applicable"
    | "unknown";
  readonly topOrEndRangePauseSeconds?: number;
  readonly description?: string;
}

export type EffortRangeKind = "exact" | "range";

export interface NumericEffortTarget {
  readonly kind: EffortRangeKind;
  readonly value?: number;
  readonly min?: number;
  readonly max?: number;
}

export type EffortTarget =
  | { readonly kind: "rir"; readonly target: NumericEffortTarget }
  | { readonly kind: "rpe"; readonly target: NumericEffortTarget }
  | {
      readonly kind: "phase_qualitative_band";
      readonly band: "easy" | "moderate" | "hard";
    }
  | {
      readonly kind: "quality_limited";
      readonly requiredCriterionIds: readonly string[];
      readonly description: string;
    }
  | {
      readonly kind: "self_selected_by_reviewed_standard";
      readonly standardId: string;
      readonly description: string;
    }
  | { readonly kind: "unknown"; readonly description?: string };

export type ExecutionQualityDimension =
  | "position_control"
  | "movement_control"
  | "range_control"
  | "tempo_control"
  | "breathing_pressure_control"
  | "support_control"
  | "side_or_symmetry_control"
  | "gait_load_transfer_control"
  | "exercise_intent_preservation";

export type ExecutionCriterionImportance =
  | "required_for_progression"
  | "preferred"
  | "observational";

export type ExecutionCriterionSource =
  | "exercise_mechanics"
  | "assessment_priority"
  | "alignment_priority"
  | "pain_response_requirement"
  | "coach_review"
  | "athlete_report"
  | "policy";

export interface ExecutionQualityCriterion {
  readonly id: string;
  readonly dimension: ExecutionQualityDimension;
  readonly importance: ExecutionCriterionImportance;
  readonly source: ExecutionCriterionSource;
  readonly description: string;
  readonly provenance: EvidenceProvenance;
}

export interface ExecutionStandard {
  readonly alignmentPriorityIds: readonly string[];
  readonly assessmentPriorityIds: readonly string[];
  readonly painResponseRequirementIds: readonly string[];
  readonly exerciseMechanicsIntent: string;
  readonly sideBehavior?: PrescriptionSideBehavior;
  readonly criteria: readonly ExecutionQualityCriterion[];
  readonly provenance: EvidenceProvenance;
}
