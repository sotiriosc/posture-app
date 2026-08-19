import type { ControlledProductShadowComparison, ControlledProductShadowPipelineResult,
  ControlledProductShadowRunRevision } from "@praxis/training-engine-v2";
import type { TrainingSnapshot } from "../trainingStateModel";

export const PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE_REFERENCE = Object.freeze({
  contractId: "PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE",
  contractVersion: "1.0.0",
} as const);
export const PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER_REFERENCE = Object.freeze({
  contractId: "PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER",
  contractVersion: "1.0.0",
} as const);
export const PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION_REFERENCE = Object.freeze({
  contractId: "PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION",
  contractVersion: "1.0.0",
} as const);
export const PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP_REFERENCE = Object.freeze({
  contractId: "PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP",
  contractVersion: "1.0.0",
} as const);
export const CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1_INTERNAL_ALLOWLIST",
  contractVersion: "1.0.0",
} as const);
export const CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE = Object.freeze({
  contractId: "CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1",
  contractVersion: "1.0.0",
} as const);

export const CONTROLLED_PRODUCT_SHADOW_MODES = Object.freeze([
  "off", "capture_only_internal_allowlist", "evaluate_internal_allowlist", "replay_only",
] as const);
export type ControlledProductShadowMode = typeof CONTROLLED_PRODUCT_SHADOW_MODES[number];
export type ControlledProductShadowAppSurface = "consumer" | "gyms";

export const CONTROLLED_PRODUCT_SHADOW_TRIGGER_KINDS = Object.freeze([
  "product_program_changed", "product_program_progress_changed", "product_session_completed",
  "product_outcome_evidence_changed", "product_questionnaire_or_assessment_changed",
  "product_mixed_state_changed", "not_shadow_relevant",
] as const);
export type ControlledProductShadowTriggerKind = typeof CONTROLLED_PRODUCT_SHADOW_TRIGGER_KINDS[number];

export const CONTROLLED_PRODUCT_SHADOW_CHANGED_CATEGORIES = Object.freeze([
  "questionnaire", "assessment", "preferences", "program", "program_progress", "session", "exercise_log",
] as const);
export type ControlledProductShadowChangedCategory =
  typeof CONTROLLED_PRODUCT_SHADOW_CHANGED_CATEGORIES[number];

export interface ControlledProductShadowClientTrigger {
  readonly triggerContract: { readonly contractId: "CONTROLLED_PRODUCT_SHADOW_TRIGGER";
    readonly contractVersion: "1.0.0" };
  readonly triggerKind: ControlledProductShadowTriggerKind;
  readonly appSurface: ControlledProductShadowAppSurface | "server_resolved";
  readonly productPatchSemanticFingerprint: string;
  readonly changedEntityCategories: readonly ControlledProductShadowChangedCategory[];
  readonly changedEntityIds: readonly string[];
  readonly anchorProgramId: string | null;
  readonly anchorSessionId: string | null;
  readonly anchorLogIds: readonly string[];
  readonly clientOperationId: string;
  readonly clientObservedOperationalTime: string;
  readonly provenance: readonly string[];
}

export interface ControlledProductShadowTrigger extends Omit<ControlledProductShadowClientTrigger, "appSurface"> {
  readonly appSurface: ControlledProductShadowAppSurface;
  readonly triggerId: string;
  readonly triggerRevisionId: string;
  readonly athleteId: string;
  readonly idempotencyKey: string;
}

export interface ControlledProductShadowRolloutPolicy {
  readonly reference: typeof CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_REFERENCE;
  readonly mode: ControlledProductShadowMode;
  readonly allowlistedUserIds: ReadonlySet<string>;
  readonly supportedAppSurfaces: readonly ControlledProductShadowAppSurface[];
  readonly allUsersEnabled: false;
  readonly percentageRollout: null;
  readonly randomSampling: false;
  readonly anonymousEligible: false;
  readonly adminAllowlistReused: false;
  readonly legacyAdaptiveFlagReused: false;
  readonly source: "explicit_server_environment" | "explicit_test_input";
}

export interface ControlledProductShadowDataMinimizationPolicy {
  readonly reference: typeof CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE;
  readonly rawProductSnapshotPersistence: false;
  readonly emailPersistence: false;
  readonly notesPersistence: false;
  readonly photoPersistence: false;
  readonly authTokenPersistence: false;
  readonly structuredReferencesOnly: true;
}

export interface ProductSnapshotReference {
  readonly productStateRevisionFingerprint: string;
  readonly questionnaireRevisionId: string | null;
  readonly assessmentRevisionId: string | null;
  readonly preferenceRevisionId: string | null;
  readonly activeProgramId: string | null;
  readonly activeProgramRevisionId: string | null;
  readonly activeProgramResolution: "active" | "legacy" | "latest" | "none";
  readonly staleActiveProgramId: string | null;
  readonly programProgressRevisionId: string | null;
  readonly sessionRevisionIds: readonly string[];
  readonly exerciseLogRevisionIds: readonly string[];
  readonly serverRevisionReferences: readonly string[];
}

export interface ProductTrainingSnapshotShadowSource {
  readonly sourceContract: typeof PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE_REFERENCE;
  readonly sourceSnapshotId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly athleteId: string;
  readonly authenticatedProductUserReference: string;
  readonly productStateRevisionFingerprint: string;
  readonly questionnaireSourceRevision: string | null;
  readonly assessmentSourceRevision: string | null;
  readonly preferenceSourceRevision: string | null;
  readonly activeProgramIdentity: string | null;
  readonly activeProgramRevision: string | null;
  readonly programProgressIdentity: string | null;
  readonly programProgressRevision: string | null;
  readonly relevantSessionRevisions: readonly string[];
  readonly relevantExerciseLogRevisions: readonly string[];
  readonly triggerIdentity: string;
  readonly triggerRevision: string;
  readonly evaluationTime: string;
  readonly includedSourceReferences: readonly string[];
  readonly excludedSourceReferences: readonly string[];
  readonly unresolvedMappings: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductGoalMapping {
  readonly productGoal: string | null;
  readonly primaryGoal: "general_fitness" | "posture_and_movement_quality" | null;
  readonly secondaryGoals: readonly string[];
  readonly programmingContexts: readonly ("pain_aware_return")[];
  readonly status: "mapped" | "under_specified" | "mapping_required";
  readonly reasonCodes: readonly string[];
}

export interface ProductTrainingIntentMapping {
  readonly productTrainingIntent: string | null;
  readonly context: "developmental" | "pain_aware_return" | null;
  readonly status: "mapped" | "policy_required" | "mapping_required";
  readonly reasonCodes: readonly string[];
}

export interface ProductExperienceMapping {
  readonly productExperience: string | null;
  readonly v2Experience: "beginner" | "intermediate" | "advanced" | null;
  readonly status: "mapped" | "mapping_required";
}

export interface ProductEquipmentMapping {
  readonly productEquipment: readonly string[];
  readonly knownCapabilities: readonly string[];
  readonly unknownCapabilities: readonly string[];
  readonly status: "mapped" | "mapping_incomplete" | "mapping_required";
  readonly provenance: readonly string[];
}

export interface ProductPainMapping {
  readonly regions: readonly string[];
  readonly source: "structured_product_questionnaire";
  readonly diagnostic: false;
  readonly severity: null;
  readonly movementIntolerance: null;
  readonly laterality: null;
}

export interface ProductOrderedCycleHorizon {
  readonly adapter: typeof PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER_REFERENCE;
  readonly horizonId: string;
  readonly horizonRevisionId: string;
  readonly boundary: { readonly kind: "ordered_cycle"; readonly cycleRef: string;
    readonly startOrder: number; readonly endOrder: number };
  readonly opportunities: readonly { readonly opportunityId: string; readonly order: number;
    readonly confirmationState: "product_confirmed"; readonly expectedMinutes: null;
    readonly date: null; readonly weekday: null; readonly expectedEquipmentState: "mapped" | "unknown" }[];
  readonly unresolvedRequirements: readonly string[];
}

export type ProductExerciseIdentityClassification = "exact_same_canonical_id" | "explicit_reviewed_alias" |
  "explicit_variant_projection" | "legacy_only_no_v2_identity" | "ambiguous_requires_review" | "invalid";

export interface ProductExerciseIdentityMapEntry {
  readonly productExerciseId: string;
  readonly v2ExerciseId: string | null;
  readonly classification: ProductExerciseIdentityClassification;
  readonly ownerReviewed: boolean;
}

export interface ProductExerciseIdentityRegistry {
  readonly reference: typeof PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP_REFERENCE;
  readonly entries: readonly ProductExerciseIdentityMapEntry[];
}

export interface ProductLegacyProgramShadowProjection {
  readonly projectionContract: typeof PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION_REFERENCE;
  readonly programId: string;
  readonly programRevisionId: string;
  readonly phaseIndex: number | null;
  readonly cycleIndex: number | null;
  readonly weekIndex: number | null;
  readonly daysPerWeek: number;
  readonly days: readonly { readonly dayIndex: number; readonly sections: readonly { readonly section: string;
    readonly productExerciseId: string; readonly v2ExerciseId: string | null;
    readonly identityClassification: ProductExerciseIdentityClassification;
    readonly sets: number | null; readonly reps: number | string | null; readonly duration: number | string | null }[] }[];
  readonly unresolvedMappings: readonly string[];
  readonly candidateAuthority: false;
  readonly prescriptionAuthority: false;
  readonly performanceAuthority: false;
  readonly provenance: readonly string[];
}

export interface ControlledProductShadowMappingBundle {
  readonly goal: ProductGoalMapping;
  readonly trainingIntent: ProductTrainingIntentMapping;
  readonly pain: ProductPainMapping;
  readonly experience: ProductExperienceMapping;
  readonly equipment: ProductEquipmentMapping;
  readonly assessment: readonly { readonly signalId: string; readonly confidence: number | null;
    readonly region: string | null; readonly action: string | null; readonly reviewState: string | null }[];
  readonly preferences: { readonly preferredExerciseIds: readonly string[];
    readonly painMarkedExerciseIds: readonly string[]; readonly substitutionSourceIds: readonly string[];
    readonly materialExclusionAuthority: false };
  readonly horizon: ProductOrderedCycleHorizon | null;
  readonly unresolvedRequirements: readonly string[];
  readonly mappingFingerprint: string;
}

export interface ControlledProductShadowRunRecord {
  readonly requestSemanticFingerprint: string;
  readonly trigger: ControlledProductShadowTrigger;
  readonly productSnapshotReference: ProductSnapshotReference;
  readonly source: ProductTrainingSnapshotShadowSource;
  readonly mappings: ControlledProductShadowMappingBundle;
  readonly legacyProjection: ProductLegacyProgramShadowProjection | null;
  readonly pipelineResult: ControlledProductShadowPipelineResult;
  readonly comparison: ControlledProductShadowComparison | null;
  readonly runRevision: ControlledProductShadowRunRevision;
  readonly resourceTrace: { readonly snapshotBytes: number; readonly sessionsConsidered: number;
    readonly logsConsidered: number; readonly searchUnitsConsumed: number; readonly wallClockElapsedMs: number;
    readonly limitReached: boolean };
  readonly failureCodes: readonly string[];
  readonly audit: { readonly auditEventId: string; readonly operationTime: string;
    readonly resultState: string; readonly provenance: readonly string[] };
}

export interface ControlledProductShadowResourcePolicy {
  readonly acceptedTriggersPerWindow: number;
  readonly windowSeconds: number;
  readonly concurrentRunsPerAthlete: number;
  readonly maximumPendingRuns: number;
  readonly maximumProductSnapshotBytes: number;
  readonly maximumSessions: number;
  readonly maximumLogs: number;
  readonly maximumSearchUnits: number;
  readonly wallClockBudgetMs: number;
}

export interface ControlledProductShadowServiceDependencies {
  readonly policy: ControlledProductShadowRolloutPolicy;
  readonly dataMinimizationPolicy: ControlledProductShadowDataMinimizationPolicy;
  readonly resourcePolicy: ControlledProductShadowResourcePolicy;
  readonly repository: ControlledProductShadowRepository;
  readonly loadProductSnapshot: (athleteId: string) => Promise<TrainingSnapshot>;
  readonly pipeline: ControlledProductShadowV2PipelinePort;
  readonly observability: ControlledProductShadowObservabilityPort;
  readonly monotonicNowMs?: () => number;
}

export interface ControlledProductShadowServiceResult {
  readonly disposition: "noop_off" | "noop_ineligible" | "accepted" | "idempotent_prior" |
    "malformed" | "conflict" | "resource_limit" | "failed";
  readonly status: string;
  readonly runRevisionId: string | null;
  readonly clientArtifactCount: 0;
}

export interface ControlledProductShadowV2PipelinePort {
  readonly evaluate: (input: {
    readonly athleteId: string;
    readonly source: ProductTrainingSnapshotShadowSource;
    readonly mappings: ControlledProductShadowMappingBundle;
    readonly legacyProjection: ProductLegacyProgramShadowProjection | null;
    readonly evaluationTime: string;
  }) => Promise<ControlledProductShadowPipelineResult>;
}

export interface ControlledProductShadowAdmissionResult {
  readonly state: "accepted" | "exact_retry" | "idempotency_conflict" | "resource_limit";
  readonly prior: ControlledProductShadowRunRecord | null;
}

export type ControlledProductShadowTransaction = unknown;
export interface ControlledProductShadowRepository {
  readonly admitTrigger: (trigger: ControlledProductShadowTrigger, semanticFingerprint: string,
    resourcePolicy: ControlledProductShadowResourcePolicy, acceptedAt: string) =>
    Promise<ControlledProductShadowAdmissionResult>;
  readonly persistRun: (record: ControlledProductShadowRunRecord) => Promise<void>;
  readonly readRun: (athleteId: string, runRevisionId: string) => Promise<ControlledProductShadowRunRecord | null>;
  readonly readByTrigger: (athleteId: string, triggerId: string) => Promise<ControlledProductShadowRunRecord | null>;
  readonly findLatestRun: (athleteId: string, anchorProgramId: string | null) =>
    Promise<ControlledProductShadowRunRecord | null>;
  readonly eraseByAthlete: (athleteId: string, operationTime: string) => Promise<number>;
  readonly purgeBeforeTime: (cutoff: string, operationTime: string) => Promise<number>;
}

export interface ControlledProductShadowObservabilityEvent {
  readonly name: "trigger_received" | "trigger_noop_off" | "trigger_noop_ineligible" |
    "product_snapshot_loaded" | "product_snapshot_pending_sync" | "mapping_complete" | "mapping_incomplete" |
    "v2_pipeline_started" | "v2_pipeline_completed" | "v2_pipeline_incomplete" | "v2_pipeline_failed" |
    "longitudinal_not_applicable" | "orchestration_unapplied" | "comparison_complete" |
    "comparison_incomplete" | "run_persisted" | "idempotent_retry" | "superseded" |
    "resource_limit" | "cross_user_rejected" | "counterfactual_attribution_rejected";
  readonly operationTime: string;
  readonly athleteId?: string;
  readonly triggerId?: string;
  readonly runRevisionId?: string;
  readonly status: string;
  readonly reasonCodes?: readonly string[];
}

export interface ControlledProductShadowObservabilityPort {
  readonly emit: (event: ControlledProductShadowObservabilityEvent) => Promise<void> | void;
}
