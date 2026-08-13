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

export type LegacyTempoConcentricIntent =
  | "controlled"
  | "natural"
  | "explosive_intent"
  | "not_applicable"
  | "unknown";

export interface LegacyTempoPrescription {
  readonly eccentricSeconds?: number;
  readonly pauseSeconds?: number;
  readonly concentricIntent: LegacyTempoConcentricIntent;
  readonly topOrEndRangePauseSeconds?: number;
  readonly description?: string;
}

export type TempoIntent =
  | "controlled"
  | "natural"
  | "explosive_intent"
  | "maximal_intent";

export type MovementPhaseTempoTarget =
  | {
      readonly kind: "exact_seconds";
      readonly seconds: number;
    }
  | {
      readonly kind: "seconds_range";
      readonly minSeconds: number;
      readonly maxSeconds: number;
    }
  | {
      readonly kind: "intent_only";
      readonly intent: TempoIntent;
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason: string;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
    };

export type LegacyTempoMigrationStatus =
  | "LEGACY_TEMPO_INTENT_ONLY_COMPATIBLE"
  | "LEGACY_TEMPO_PHASE_INCOMPLETE"
  | "LEGACY_TEMPO_PHASE_AMBIGUOUS";

export type TempoPrescription =
  | {
      readonly kind: "repetition_phase_tempo";
      readonly eccentric: MovementPhaseTempoTarget;
      readonly lengthenedTransition: MovementPhaseTempoTarget;
      readonly concentric: MovementPhaseTempoTarget;
      readonly shortenedTransition: MovementPhaseTempoTarget;
      readonly provenance: EvidenceProvenance;
      readonly reviewedTimingStandardRef?: string;
      readonly description?: string;
    }
  | {
      readonly kind: "intent_only";
      readonly intent: TempoIntent;
      readonly provenance: EvidenceProvenance;
      readonly reviewedTimingStandardRef?: string;
      readonly description?: string;
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    }
  | {
      readonly kind: "not_applicable";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    }
  | {
      readonly kind: "legacy_compatibility";
      readonly legacy: LegacyTempoPrescription;
      readonly migrationStatus: LegacyTempoMigrationStatus;
      readonly authoritative: false;
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    };

export function adaptLegacyTempoPrescription(input: {
  readonly legacy: LegacyTempoPrescription;
  readonly provenance: EvidenceProvenance;
}): TempoPrescription {
  const hasAmbiguousPause =
    input.legacy.pauseSeconds !== undefined ||
    input.legacy.topOrEndRangePauseSeconds !== undefined;
  const hasIncompletePhaseSeconds = input.legacy.eccentricSeconds !== undefined;
  return {
    kind: "legacy_compatibility",
    legacy: input.legacy,
    migrationStatus: hasAmbiguousPause
      ? "LEGACY_TEMPO_PHASE_AMBIGUOUS"
      : hasIncompletePhaseSeconds
        ? "LEGACY_TEMPO_PHASE_INCOMPLETE"
        : "LEGACY_TEMPO_INTENT_ONLY_COMPATIBLE",
    authoritative: false,
    reason: hasAmbiguousPause
      ? "Legacy pause fields did not identify lengthened, shortened, midrange, or total pause authority."
      : "Legacy tempo was preserved for compatibility and is not future behavior authority.",
    provenance: input.provenance,
    description: input.legacy.description,
  };
}

export type BreathingCadencePhase =
  | "inhale"
  | "post_inhale_pause"
  | "exhale"
  | "post_exhale_pause";

export type CadenceTimingTarget =
  | {
      readonly kind: "exact_seconds";
      readonly seconds: number;
    }
  | {
      readonly kind: "seconds_range";
      readonly minSeconds: number;
      readonly maxSeconds: number;
    }
  | {
      readonly kind: "intent_only";
      readonly intent: "controlled" | "natural" | "self_selected_by_reviewed_standard";
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason: string;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
    };

export type BreathingCadencePrescription =
  | {
      readonly kind: "structured_breathing_cadence";
      readonly inhale: CadenceTimingTarget;
      readonly exhale: CadenceTimingTarget;
      readonly postInhalePause?: CadenceTimingTarget;
      readonly postExhalePause?: CadenceTimingTarget;
      readonly phaseSequence: readonly BreathingCadencePhase[];
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    };

export type LocomotorCadenceIntent =
  | "controlled"
  | "natural"
  | "brisk"
  | "self_selected_by_reviewed_standard";

export type LocomotorCadencePrescription =
  | {
      readonly kind: "locomotor_or_step_cadence";
      readonly intent: LocomotorCadenceIntent;
      readonly standardRef?: string;
      readonly provenance: EvidenceProvenance;
      readonly description?: string;
    }
  | {
      readonly kind: "not_prescribed";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    }
  | {
      readonly kind: "unknown";
      readonly reason: string;
      readonly provenance: EvidenceProvenance;
    };

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
