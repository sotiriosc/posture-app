import type {
  CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE,
  ControlledProductShadowComparisonV1_1,
  ControlledProductShadowGoalRealizationMappingBundleV1,
  ControlledProductShadowRunV1_1,
  ProductShadowOutcomeGoal,
  GoalRealizationContractReference,
} from "@praxis/training-engine-v2";
import type { ExerciseLog, LogPrefs, Program, SessionRecord } from "../types";
import type { TrainingSnapshot } from "../trainingStateModel";

export const PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE = Object.freeze({
  contractId: "PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_SHADOW_EXERCISE_IDENTITY_REGISTRY_V2_REFERENCE = Object.freeze({
  contractId: "PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP",
  contractVersion: "2.0.0",
} as const);

export interface ProductGoalRealizationFixtureExtensions {
  readonly reference: typeof PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE;
  readonly source: "versioned_test_or_replay_fixture";
  readonly secondaryOutcome?: ProductShadowOutcomeGoal | null;
  readonly purposeBundle?: {
    readonly required: readonly string[];
    readonly preferred: readonly string[];
    readonly optional: readonly string[];
  } | null;
  readonly fitnessFocus?: "mixed_general_fitness" | "local_muscular_endurance" |
    "systemic_conditioning" | null;
  readonly sessionMinutes?: number | null;
  readonly equipmentDetails?: readonly {
    readonly productLabel: "none" | "dumbbells" | "bands" | "gym";
    readonly implementReference: string;
    readonly capabilities: readonly string[];
    readonly loadMinimum: number | null;
    readonly loadMaximum: number | null;
    readonly loadIncrement: number | null;
    readonly unit: "kg" | "lb" | "band_level" | "not_applicable" | null;
  }[];
  readonly reviewedExerciseAliases?: readonly {
    readonly productExerciseId: string;
    readonly v2ExerciseId: string;
  }[];
}

export interface ProductGoalRealizationMappingInput {
  readonly athleteId: string;
  readonly questionnaire: Record<string, unknown> | null;
  readonly assessment: Record<string, unknown> | null;
  readonly preferences: LogPrefs | null;
  readonly programs: readonly Program[];
  readonly sessions: readonly SessionRecord[];
  readonly exerciseLogs: readonly ExerciseLog[];
  readonly activeProgramId: string | null;
  readonly productStateRevision: string;
  readonly evaluationTime: string;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}

export interface ControlledProductShadowGoalRealizationProfileV1 {
  readonly profileId: "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4";
  readonly reference: GoalRealizationContractReference;
  readonly mappingContractReferences: readonly GoalRealizationContractReference[];
  readonly goalPlanningBriefPolicyReference: GoalRealizationContractReference;
  readonly b1B4References: readonly GoalRealizationContractReference[];
  readonly pipelineProfileReference: typeof CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE;
  readonly comparisonReference: typeof CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE;
  readonly runReference: typeof CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE;
  readonly defaultSelected: false;
  readonly productAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY";
  readonly activationState: "NOT_ACTIVATED";
  readonly counterfactualOnly: true;
  readonly provenance: readonly string[];
}

export const PRODUCT_SHADOW_B1_B4_STAGE_ORDER = Object.freeze([
  "week_source", "weekly_intent", "week_allocation", "planning_context",
  "session_intent", "candidate_intelligence", "session_composer", "prescription",
  "final_sequence", "gate_13", "phase_snapshot", "longitudinal", "application_orchestration",
] as const);
export type ProductShadowB1B4Stage = typeof PRODUCT_SHADOW_B1_B4_STAGE_ORDER[number];

export interface ProductShadowB1B4StageResult {
  readonly status: "complete" | "incomplete_product_input" | "incomplete_policy" |
    "incomplete_mapping" | "search_inconclusive" | "blocked_training_safety" | "not_applicable";
  readonly artifactReference: { readonly artifactType: string; readonly artifactRevisionId: string;
    readonly contractReference: GoalRealizationContractReference; readonly counterfactualOnly: true } | null;
  readonly unresolvedRequirements: readonly string[];
}

export interface ProductShadowB1B4StagePort {
  readonly stage: ProductShadowB1B4Stage;
  readonly contractReference: GoalRealizationContractReference;
  readonly evaluate: (input: {
    readonly athleteId: string;
    readonly mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
    readonly priorArtifacts: readonly NonNullable<ProductShadowB1B4StageResult["artifactReference"]>[];
    readonly evaluationTime: string;
  }) => ProductShadowB1B4StageResult | Promise<ProductShadowB1B4StageResult>;
}

export interface ProductShadowB1B4PipelineResult {
  readonly status: "shadow_program_complete" | "shadow_program_complete_with_self_selected_calibration" |
    "shadow_program_incomplete_product_input" | "shadow_program_incomplete_policy" |
    "shadow_program_incomplete_mapping" | "shadow_search_inconclusive" |
    "shadow_blocked_training_safety";
  readonly completedStages: readonly ProductShadowB1B4Stage[];
  readonly artifacts: readonly NonNullable<ProductShadowB1B4StageResult["artifactReference"]>[];
  readonly unresolvedRequirements: readonly string[];
  readonly firstStoppedStage: ProductShadowB1B4Stage | null;
  readonly gate13Status: "passed" | "failed" | "incomplete" | "not_evaluated";
  readonly longitudinalStatus: "restricted" | "not_applicable" | "not_evaluated";
  readonly orchestrationStatus: "not_applicable" | "not_evaluated";
  readonly deliveredToUser: false;
  readonly performed: false;
  readonly productMutationApplied: false;
  readonly applicationApplied: false;
}

export interface ControlledProductShadowB1B4PipelinePort {
  readonly profileReference: typeof CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4_REFERENCE;
  readonly stageReferences: readonly GoalRealizationContractReference[];
  readonly evaluate: (input: { readonly athleteId: string;
    readonly mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
    readonly evaluationTime: string }) => Promise<ProductShadowB1B4PipelineResult>;
}

export interface ControlledProductShadowGoalRealizationRepository {
  readonly append: (run: ControlledProductShadowRunV1_1) => Promise<void>;
  readonly read: (athleteId: string, runRevisionId: string) => Promise<ControlledProductShadowRunV1_1 | null>;
}

export interface ControlledProductShadowGoalRealizationServiceDependencies {
  readonly profile: ControlledProductShadowGoalRealizationProfileV1;
  readonly loadProductSnapshot: (athleteId: string) => Promise<TrainingSnapshot>;
  readonly resolveActiveProgramId: (snapshot: TrainingSnapshot) => string | null;
  readonly mappingBuilder: (input: ProductGoalRealizationMappingInput) =>
    ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly pipeline: ControlledProductShadowB1B4PipelinePort;
  readonly repository: ControlledProductShadowGoalRealizationRepository;
}

export interface ControlledProductShadowGoalRealizationServiceResult {
  readonly status: ProductShadowB1B4PipelineResult["status"] | "shadow_source_conflict";
  readonly runRevisionId: string | null;
  readonly mappingReadiness: string | null;
  readonly clientArtifactCount: 0;
  readonly productMutationCount: 0;
  readonly applicationCount: 0;
}

export interface ControlledProductShadowGoalRealizationReplayResult {
  readonly status: "exact_version_replay_ready";
  readonly runRevisionId: string;
  readonly comparisonRevisionId: string | null;
  readonly requiredVersions: readonly string[];
  readonly latestVersionFallbackCount: 0;
  readonly productMutationCount: 0;
  readonly applicationCount: 0;
  readonly performedCount: 0;
  readonly fingerprint: string;
}

export type ProductGoalRealizationComparisonBuilder = (input: {
  readonly mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly pipelineResult: ProductShadowB1B4PipelineResult;
  readonly historicalMappingSummary: { readonly goalStatus: string; readonly primaryGoal: string | null;
    readonly trainingIntentStatus: string; readonly equipmentStatus: string;
    readonly legacyProgramAvailable: boolean };
}) => ControlledProductShadowComparisonV1_1;
