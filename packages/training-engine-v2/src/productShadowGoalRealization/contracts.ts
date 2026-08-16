import type { ProgrammingContextMode, TrainingOutcomeGoal } from "../domain/sessionPlanningDirective";
import type { PrescriptionLocalPurpose } from "../prescription/purposeResolution";

export interface GoalRealizationContractReference {
  readonly contractId: string;
  readonly contractVersion: string;
}

export const CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING_V2_REFERENCE = Object.freeze({
  contractId: "PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING",
  contractVersion: "2.0.0",
} as const);

export const PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE = Object.freeze({
  contractId: "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE = Object.freeze({
  contractId: "PRODUCT_TRAINING_MODE_SHADOW_MAPPING",
  contractVersion: "2.0.0",
} as const);

export const PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING_REFERENCE = Object.freeze({
  contractId: "PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE = Object.freeze({
  contractId: "PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING_REFERENCE = Object.freeze({
  contractId: "PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING_REFERENCE = Object.freeze({
  contractId: "PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION_REFERENCE = Object.freeze({
  contractId: "PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE = Object.freeze({
  contractId: "PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_RUN",
  contractVersion: "1.1.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_COMPARISON",
  contractVersion: "1.1.0",
} as const);

export const PRODUCT_SHADOW_GOAL_LABELS = Object.freeze([
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
  "Get stronger",
  "Build muscle",
  "Improve fitness and stamina",
  "Improve posture and movement",
  "Improve athletic performance",
] as const);
export type ProductShadowGoalLabel = typeof PRODUCT_SHADOW_GOAL_LABELS[number];

export const PRODUCT_SHADOW_CURRENT_GOAL_LABELS = Object.freeze([
  "Improve posture", "Reduce pain", "Athletic performance", "General fitness",
] as const);

export const PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS = Object.freeze([
  "Get stronger", "Build muscle", "Improve fitness and stamina",
  "Improve posture and movement", "Improve athletic performance",
] as const);

export type ProductShadowOutcomeGoal = TrainingOutcomeGoal;
export type ProductShadowTrainingMode = "develop" | "maintain" | "return_or_rebuild";

export interface ProductGoalShadowMappingV2 {
  readonly reference: typeof PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING_V2_REFERENCE;
  readonly sourceLabel: string | null;
  readonly sourceVocabulary: "current_product" | "approved_future_fixture" | "unknown";
  readonly primaryOutcome: ProductShadowOutcomeGoal | null;
  readonly secondaryOutcome: ProductShadowOutcomeGoal | null;
  readonly goalRelationships: readonly ("primary" | "secondary")[];
  readonly programmingContexts: readonly ProgrammingContextMode[];
  readonly planningBriefFamily: "strength_development" | "hypertrophy_development" |
    "movement_quality_development" | "general_fitness" | null;
  readonly status: "mapped" | "follow_up_required" | "mapping_required" | "conflict";
  readonly followUpRequirements: readonly string[];
  readonly unsupportedScope: readonly string[];
  readonly goalCreatesExercises: false;
  readonly goalCreatesNumericDose: false;
}

export interface ProductGoalArchitectureShadowPlanningBrief {
  readonly policyReference: typeof PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE;
  readonly sourceProductLabel: string | null;
  readonly primaryOutcome: ProductShadowOutcomeGoal;
  readonly secondaryOutcome: ProductShadowOutcomeGoal | null;
  readonly goalRelationships: readonly { readonly outcome: ProductShadowOutcomeGoal;
    readonly relationship: "primary" | "secondary" }[];
  readonly programmingContexts: readonly ProgrammingContextMode[];
  readonly trainingMode: ProductShadowTrainingMode;
  readonly requiredPurposeFamilies: readonly PrescriptionLocalPurpose[];
  readonly preferredPurposeFamilies: readonly PrescriptionLocalPurpose[];
  readonly optionalPurposeFamilies: readonly PrescriptionLocalPurpose[];
  readonly followUpRequirements: readonly string[];
  readonly unsupportedScope: readonly string[];
  readonly sourceFacts: readonly string[];
  readonly provenance: readonly string[];
  readonly exerciseCreationCount: 0;
  readonly numericDoseCreationCount: 0;
  readonly applied: false;
}

export interface ProductTrainingModeShadowMappingV2 {
  readonly reference: typeof PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE;
  readonly sourceIntent: string | null;
  readonly mode: ProductShadowTrainingMode | null;
  readonly programmingContexts: readonly ProgrammingContextMode[];
  readonly status: "mapped" | "policy_required" | "mapping_required";
  readonly reasonCodes: readonly string[];
  readonly diagnosticInferenceCount: 0;
}

export interface ProductPainContextShadowMapping {
  readonly regions: readonly string[];
  readonly source: "structured_product_questionnaire";
  readonly severity: null;
  readonly laterality: null;
  readonly movementIntolerance: null;
  readonly diagnosis: null;
  readonly primaryOutcomeCreated: false;
  readonly materialSafetyBlockCreated: false;
}

export interface ProductExperienceRealizationShadowMapping {
  readonly reference: typeof PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING_REFERENCE;
  readonly sourceExperience: string | null;
  readonly coarseExperience: "beginner" | "intermediate" | "advanced" | null;
  readonly trainingYears: null;
  readonly recentConsistency: null;
  readonly exactExerciseFamiliarity: null;
  readonly exactLoadAuthority: false;
  readonly status: "coarse_experience_only" | "mapping_required";
  readonly explicitUnknowns: readonly string[];
}

export interface ProductLegacyHistoryAuthorityProjection {
  readonly reference: typeof PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION_REFERENCE;
  readonly activeLegacyProgramId: string | null;
  readonly programCount: number;
  readonly sessionRecordCount: number;
  readonly exerciseLogCount: number;
  readonly canonicalIdentityExposureIds: readonly string[];
  readonly unresolvedIdentityIds: readonly string[];
  readonly authority: "restricted_identity_and_continuity_context_only";
  readonly continuityContext: "LEGACY_DELIVERED_PROGRAM_CONTINUITY_CONTEXT" | "none";
  readonly athleteAuthoredProgrammingCount: 0;
  readonly exactRealizationFamiliarityCount: 0;
  readonly completedV2PerformanceCount: 0;
  readonly progressionAuthorityCount: 0;
  readonly missingLineage: readonly string[];
}

export interface ProductPreferenceContinuityShadowMapping {
  readonly reference: typeof PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING_REFERENCE;
  readonly strongPreferredExerciseIds: readonly string[];
  readonly explicitPreferenceBlockedExerciseIds: readonly string[];
  readonly easyChallengeFeedbackExerciseIds: readonly string[];
  readonly painMarkedContextExerciseIds: readonly string[];
  readonly substitutions: readonly { readonly sourceExerciseId: string;
    readonly targetExerciseId: string }[];
  readonly permanentFeedbackBlockCount: 0;
  readonly progressionAuthorityCount: 0;
  readonly globalSubstitutionAuthorityCount: 0;
}

export interface ProductEquipmentCapabilityShadowMapping {
  readonly reference: typeof PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE;
  readonly selectedLabels: readonly string[];
  readonly knownPresence: readonly string[];
  readonly knownCapabilities: readonly string[];
  readonly explicitUnknowns: readonly string[];
  readonly exactCapabilitySource: "current_product" | "versioned_test_or_replay_fixture" | "none";
  readonly status: "presence_only" | "exact_capability_available" | "mapping_required" | "conflict";
  readonly universalGymCapabilityInferenceCount: 0;
  readonly legacyProgramEquipmentInferenceCount: 0;
}

export interface ProductEquipmentLoadRealizationShadowMapping {
  readonly reference: typeof PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE;
  readonly exactRealizationAvailable: boolean;
  readonly selfSelectedCalibrationAvailable: boolean;
  readonly implementReferences: readonly string[];
  readonly loadMinimum: number | null;
  readonly loadMaximum: number | null;
  readonly loadIncrement: number | null;
  readonly unit: "kg" | "lb" | "band_level" | "not_applicable" | null;
  readonly exactUnknowns: readonly string[];
  readonly guessedLoadCount: 0;
  readonly progressionAuthorityCount: 0;
}

export interface ProductAvailabilityHorizonShadowMapping {
  readonly reference: typeof PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING_REFERENCE;
  readonly opportunityCount: 3 | 4 | 5 | null;
  readonly opportunities: readonly { readonly opportunityId: string; readonly order: number;
    readonly minutes: number | null; readonly date: null; readonly weekday: null }[];
  readonly minutesSource: "versioned_test_or_replay_fixture" | "unknown";
  readonly status: "ordered_opportunities" | "ordered_opportunities_with_minutes" | "mapping_required";
  readonly calendarReadCount: 0;
  readonly inventedMinutesCount: 0;
}

export interface ProductAssessmentShadowMapping {
  readonly signals: readonly { readonly signalId: string; readonly confidence: number | null;
    readonly region: string | null; readonly action: string | null; readonly reviewState: string | null }[];
  readonly proseConsumptionCount: 0;
  readonly genericCorrectiveCircuitCount: 0;
}

export interface ProductExerciseIdentityShadowMapping {
  readonly registryReference: GoalRealizationContractReference;
  readonly entries: readonly { readonly productExerciseId: string; readonly v2ExerciseId: string | null;
    readonly classification: "exact_same_canonical_id" | "explicit_reviewed_alias" |
      "legacy_only_no_v2_identity" | "ambiguous_requires_review" }[];
  readonly fuzzyMatchCount: 0;
}

export const PRODUCT_SHADOW_MAPPING_READINESS_STATES = Object.freeze([
  "complete_for_shadow_planning",
  "complete_with_self_selected_calibration",
  "primary_outcome_follow_up_required",
  "purpose_bundle_follow_up_required",
  "training_mode_policy_required",
  "experience_context_incomplete",
  "equipment_capability_incomplete",
  "equipment_realization_incomplete",
  "availability_incomplete",
  "exercise_mapping_incomplete",
  "legacy_history_restricted",
  "unsupported_scope",
  "mapping_conflict",
] as const);
export type ProductShadowMappingReadinessState = typeof PRODUCT_SHADOW_MAPPING_READINESS_STATES[number];

export interface ProductShadowMappingReadinessTraceEntry {
  readonly order: number;
  readonly boundary: string;
  readonly state: ProductShadowMappingReadinessState;
  readonly material: boolean;
  readonly reasonCodes: readonly string[];
}

export interface ProductShadowMappingReadiness {
  readonly primaryState: ProductShadowMappingReadinessState;
  readonly trace: readonly ProductShadowMappingReadinessTraceEntry[];
  readonly unresolvedRequirements: readonly string[];
  readonly downstreamRescueAcceptedCount: 0;
}

export interface ControlledProductShadowGoalRealizationMappingBundleV1 {
  readonly bundleReference: typeof PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE;
  readonly mappingProfileReference: GoalRealizationContractReference;
  readonly goalMapping: ProductGoalShadowMappingV2;
  readonly planningBrief: ProductGoalArchitectureShadowPlanningBrief | null;
  readonly trainingModeMapping: ProductTrainingModeShadowMappingV2;
  readonly painContextMapping: ProductPainContextShadowMapping;
  readonly experienceMapping: ProductExperienceRealizationShadowMapping;
  readonly legacyHistoryProjection: ProductLegacyHistoryAuthorityProjection;
  readonly equipmentCapabilityMapping: ProductEquipmentCapabilityShadowMapping;
  readonly equipmentLoadRealizationMapping: ProductEquipmentLoadRealizationShadowMapping;
  readonly availabilityMapping: ProductAvailabilityHorizonShadowMapping;
  readonly assessmentMapping: ProductAssessmentShadowMapping;
  readonly preferenceContinuityMapping: ProductPreferenceContinuityShadowMapping;
  readonly exerciseIdentityMapping: ProductExerciseIdentityShadowMapping;
  readonly readiness: ProductShadowMappingReadiness;
  readonly mappingFingerprint: string;
  readonly sourceFactReferences: readonly string[];
  readonly unresolvedRequirements: readonly string[];
  readonly counterfactualOnly: true;
  readonly provenance: readonly string[];
  readonly rawProductPayloadIncluded: false;
}

export const PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER = Object.freeze([
  "product_source_contract", "primary_goal", "secondary_goal", "programming_context",
  "training_mode", "planning_brief", "experience_familiarity", "equipment", "availability",
  "exercise_identity", "weekly_responsibility", "session_purpose_needs", "assignment",
  "prescription_realization", "sequence_duration", "gate_13", "labels_prose",
] as const);
export type ProductShadowGoalRealizationDifferenceDimension =
  typeof PRODUCT_SHADOW_GOAL_REALIZATION_FIRST_DIFFERENCE_ORDER[number];

export interface ControlledProductShadowComparisonV1_1 {
  readonly comparisonReference: typeof CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE;
  readonly comparisonId: string;
  readonly historicalMappingReference: "CONTROLLED_PRODUCT_SHADOW_RUN@1.0.0";
  readonly goalRealizationMappingFingerprint: string;
  readonly dimensions: readonly { readonly dimension: ProductShadowGoalRealizationDifferenceDimension;
    readonly state: "same" | "different" | "unresolved" | "not_comparable";
    readonly reasonCodes: readonly string[] }[];
  readonly firstMeaningfulDifference: ProductShadowGoalRealizationDifferenceDimension | null;
  readonly unresolvedRequirements: readonly string[];
  readonly legacyProgramStructuralComparison: "available" | "unavailable" | "partial";
  readonly weightedBetterScore: null;
  readonly outcomeSuperiorityClaimed: false;
  readonly noRescueAccepted: true;
  readonly counterfactualOnly: true;
  readonly fingerprint: string;
}

export interface ControlledProductShadowRunV1_1 {
  readonly runReference: typeof CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE;
  readonly runId: string;
  readonly runRevisionId: string;
  readonly athleteId: string;
  readonly appSurface: "consumer" | "gyms";
  readonly sourceTriggerRevisionId: string;
  readonly sourceSnapshotRevision: string;
  readonly productStateRevision: string;
  readonly mappingProfileReference: GoalRealizationContractReference;
  readonly mappingContractReferences: readonly GoalRealizationContractReference[];
  readonly pipelineProfileReference: typeof CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE;
  readonly stageContractReferences: readonly GoalRealizationContractReference[];
  readonly planningBriefPolicyReference: typeof PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE;
  readonly b1B4References: readonly GoalRealizationContractReference[];
  readonly comparisonReference: typeof CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE;
  readonly mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly comparison: ControlledProductShadowComparisonV1_1 | null;
  readonly pipelineStatus: string;
  readonly unresolvedRequirements: readonly string[];
  readonly evaluationTime: string;
  readonly counterfactualOnly: true;
  readonly deliveredToUser: false;
  readonly performed: false;
  readonly productMutationApplied: false;
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}

export const CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STATUS =
  "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_IMPLEMENTED_DEFAULT_OFF" as const;
export const CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CLASSIFICATION =
  "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_READY_FOR_GOAL_SPECIFIC_SHADOW_EVIDENCE_AUTHORIZATION" as const;
export const CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_NEXT_DEPENDENCY =
  "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_AUTHORIZATION" as const;
