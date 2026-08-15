export const CONTROLLED_PRODUCT_SHADOW_INTEGRATION_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_INTEGRATION",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_TRIGGER",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_RUN",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_COMPARISON",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_STATUS =
  "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF" as const;
export const CONTROLLED_PRODUCT_SHADOW_CLASSIFICATION =
  "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION" as const;
export const CONTROLLED_PRODUCT_SHADOW_PRODUCT_AUTHORITY = "LEGACY_PRODUCT_OUTPUT_ONLY" as const;
export const CONTROLLED_PRODUCT_SHADOW_V2_APPLICATION_STATE = "NOT_ACTIVATED" as const;

export const CONTROLLED_PRODUCT_SHADOW_RUN_TYPES = Object.freeze([
  "product_program_generation_shadow",
  "product_program_regeneration_shadow",
  "product_outcome_mapping_shadow",
  "product_longitudinal_shadow",
  "product_application_orchestration_shadow",
  "combined_product_shadow",
  "mapping_audit_only",
  "replay_only",
] as const);
export type ControlledProductShadowRunType = typeof CONTROLLED_PRODUCT_SHADOW_RUN_TYPES[number];

export const CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES = Object.freeze([
  "shadow_program_complete",
  "shadow_program_complete_with_unresolved_comparison",
  "shadow_program_incomplete_product_input",
  "shadow_program_incomplete_policy",
  "shadow_program_incomplete_mapping",
  "shadow_outcome_mapping_restricted",
  "shadow_longitudinal_not_applicable",
  "shadow_longitudinal_complete_unapplied",
  "shadow_orchestration_complete_unapplied",
  "shadow_orchestration_pending_policy",
  "shadow_orchestration_pending_human_review",
  "shadow_blocked_training_safety",
  "shadow_source_pending_sync",
  "shadow_source_conflict",
  "shadow_search_inconclusive",
  "shadow_resource_limit",
  "shadow_not_eligible",
  "shadow_off",
  "shadow_idempotent_prior_result",
  "shadow_failed",
  "unsupported_shadow_contract",
  "invalid_shadow_revision_context",
] as const);
export type ControlledProductShadowRunStatus = typeof CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES[number];

export const CONTROLLED_PRODUCT_SHADOW_DIFFERENCE_CLASSES = Object.freeze([
  "expected_shared_framework",
  "justified_convergence",
  "product_input_gap",
  "product_compatibility_mapping_gap",
  "v2_supported_material_difference",
  "v2_supported_local_difference",
  "unresolved_policy_difference",
  "incomplete_comparison",
  "legacy_only_behavior",
  "wrong_layer_effect",
  "over_adaptation",
  "under_adaptation",
  "cosmetic_only",
  "unknown_requires_review",
] as const);
export type ControlledProductShadowDifferenceClass =
  typeof CONTROLLED_PRODUCT_SHADOW_DIFFERENCE_CLASSES[number];

export const CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY = Object.freeze([
  "product_input_mapping",
  "weekly_responsibility",
  "allocation_distribution",
  "session_purpose",
  "session_needs",
  "selected_assignments",
  "exercise_support_range_side",
  "source_event_block_structure",
  "prescription",
  "sequence",
  "duration_stress_spacing",
  "reps_tempo",
  "labels_prose",
] as const);
export type ControlledProductShadowFirstDifference =
  typeof CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY[number];

export interface ControlledProductShadowArtifactReference {
  readonly artifactType: string;
  readonly artifactId: string;
  readonly artifactRevisionId: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly counterfactualOnly: true;
}

export interface ControlledProductShadowComparisonDimension {
  readonly dimension: ControlledProductShadowFirstDifference;
  readonly state: "same" | "different" | "unresolved" | "not_comparable";
  readonly legacyReferences: readonly string[];
  readonly v2References: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface ControlledProductShadowComparison {
  readonly comparisonContract: typeof CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE;
  readonly comparisonId: string;
  readonly comparisonRevisionId: string;
  readonly legacyProgramRevisionId: string | null;
  readonly v2ProgramRevisionId: string | null;
  readonly dimensions: readonly ControlledProductShadowComparisonDimension[];
  readonly firstMeaningfulDifference: ControlledProductShadowFirstDifference | null;
  readonly differenceClass: ControlledProductShadowDifferenceClass;
  readonly gate14Compatibility: "compatible" | "partial" | "incompatible" | "not_evaluated";
  readonly unresolvedMappings: readonly string[];
  readonly noRescueAccepted: true;
  readonly weightedBetterScore: null;
  readonly outcomeSuperiorityClaimed: false;
  readonly provenance: readonly string[];
}

export interface ControlledProductShadowCounterfactualAttributionClaim {
  readonly deliveredLegacyProgramId: string | null;
  readonly shadowProgramId: string | null;
  readonly productPerformanceProgramId: string | null;
  readonly legacyExerciseLogPrescriptionRevisionId: string | null;
  readonly legacySessionSequenceRevisionId: string | null;
  readonly shadowSourceEventCompleted: boolean;
  readonly unmappedLegacyToleranceCreditedToShadow: boolean;
  readonly productOutcomeAuthorizesShadowAdaptation: boolean;
  readonly outcomeSuperiorityClaimed: boolean;
}

export interface ControlledProductShadowCounterfactualValidationResult {
  readonly valid: boolean;
  readonly reasonCodes: readonly string[];
  readonly fingerprint: string;
  readonly shadowPerformanceCreditCount: 0;
  readonly counterfactualOutcomeAttributionCount: 0;
}

export interface ControlledProductShadowRunRevision {
  readonly shadowContract: typeof CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE;
  readonly runId: string;
  readonly runRevisionId: string;
  readonly basedOnRunRevisionId: string | null;
  readonly finalForRunAttempt: true;
  readonly athleteId: string;
  readonly runAttemptId: string;
  readonly runType: ControlledProductShadowRunType;
  readonly status: ControlledProductShadowRunStatus;
  readonly productSnapshotRevisionId: string;
  readonly triggerRevisionId: string;
  readonly adapterReferences: readonly string[];
  readonly policyReferences: readonly string[];
  readonly artifactReferences: readonly ControlledProductShadowArtifactReference[];
  readonly comparison: ControlledProductShadowComparison | null;
  readonly evaluationTime: string;
  readonly productMutationApplied: false;
  readonly applicationApplied: false;
  readonly deliveredToUser: false;
  readonly performed: false;
  readonly provenance: readonly string[];
}

export interface ControlledProductShadowPipelineResult {
  readonly status: ControlledProductShadowRunStatus;
  readonly runType: ControlledProductShadowRunType;
  readonly artifactReferences: readonly ControlledProductShadowArtifactReference[];
  readonly unresolvedRequirements: readonly string[];
  readonly gate13Status: "passed" | "failed" | "incomplete" | "not_evaluated";
  readonly phaseStatus: "remain" | "hold" | "review" | "adjacent_transition_authorized_unapplied" | "not_evaluated";
  readonly longitudinalStatus: "complete_unapplied" | "restricted" | "not_applicable" | "not_evaluated";
  readonly orchestrationStatus: "complete_unapplied" | "pending_policy" | "pending_human_review" | "not_applicable" | "not_evaluated";
  readonly productMutationApplied: false;
  readonly applicationApplied: false;
}
