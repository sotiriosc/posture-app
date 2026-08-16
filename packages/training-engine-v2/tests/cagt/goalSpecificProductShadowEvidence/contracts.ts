import type { ProductShadowB1B4Stage } from
  "../../../../engine/src/controlledProductShadowGoalRealization/contracts";

export const GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE",
  contractVersion: "1.0.0",
} as const);

export const PRODUCT_INPUT_NECESSITY_MATRIX_REFERENCE = Object.freeze({
  contractId: "PRODUCT_INPUT_NECESSITY_MATRIX",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RESULT_REFERENCE = Object.freeze({
  contractId: "GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RESULT",
  contractVersion: "1.0.0",
} as const);

export const GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME =
  "2026-08-16T04:30:00-04:00" as const;

export type GoalSpecificTerminalClass =
  | "complete"
  | "calibration_complete"
  | "honest_incomplete_product_input"
  | "honest_incomplete_policy"
  | "honest_incomplete_mapping"
  | "search_inconclusive"
  | "safety_blocked";

export type GoalSpecificFactMateriality = "material" | "inert";

export type GoalSpecificResponseStage =
  | "fixture_contract"
  | "product_mapping"
  | "planning_brief"
  | "weekly_intent"
  | "week_allocation"
  | "session_intent"
  | "candidate_intelligence"
  | "session_composer"
  | "prescription"
  | "final_sequence"
  | "gate_13"
  | "gate_14";

export interface GoalSpecificProductShadowScenarioContract {
  readonly reference: typeof GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE;
  readonly scenarioId: string;
  readonly fixtureId: string;
  readonly athleteShellId: string;
  readonly productSourceRevision: string;
  readonly mappingProfileVersion: "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING@1.0.0";
  readonly pipelineProfileVersion: "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4@1.0.0";
  readonly changedFactPaths: readonly string[];
  readonly unchangedFactPaths: readonly string[];
  readonly factOwner: string;
  readonly materiality: GoalSpecificFactMateriality;
  readonly earliestPermittedResponseStage: GoalSpecificResponseStage;
  readonly latestRequiredResponseStage: GoalSpecificResponseStage;
  readonly invariantStages: readonly GoalSpecificResponseStage[];
  readonly permittedDifferenceDimensions: readonly string[];
  readonly permittedConvergenceReasons: readonly string[];
  readonly expectedTerminalClass: GoalSpecificTerminalClass;
  readonly noRescueRequired: true;
  readonly sourceProvenance: "synthetic_product_shaped_fixture" | "sanitized_repository_fixture";
  readonly evaluationTime: typeof GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME;
}

export interface GoalSpecificProductShadowCausalPairContract {
  readonly reference: typeof GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE;
  readonly pairId: string;
  readonly baselineScenarioId: string;
  readonly counterfactualScenarioId: string;
  readonly changedFactPath: string;
  readonly rightfulOwner: string;
  readonly materiality: GoalSpecificFactMateriality;
  readonly earliestResponseStage: GoalSpecificResponseStage;
  readonly latestResponseStage: GoalSpecificResponseStage;
  readonly invariantDimensions: readonly string[];
  readonly permittedDifferenceDimensions: readonly string[];
  readonly frameworkSamenessExpected: boolean;
  readonly assignmentSamenessPermitted: boolean;
  readonly exerciseSamenessPermitted: boolean;
  readonly prescriptionSamenessPermitted: boolean;
  readonly justifiedConvergencePermitted: boolean;
  readonly convergenceReason: string | null;
  readonly firstMaterialDifferenceExpectation: GoalSpecificResponseStage | "none";
  readonly persistenceExpectation: "through_gate_13" | "through_gate_14" | "not_required";
  readonly noRescueRequired: true;
}

export interface GoalSpecificArtifactReference {
  readonly artifactType: string;
  readonly artifactId: string;
  readonly artifactRevisionId: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly athleteId: string;
  readonly scenarioId: string;
  readonly stage: ProductShadowB1B4Stage | "mapping" | "gate_14" | "evidence";
  readonly sourceLineage: readonly string[];
  readonly counterfactualOnly: true;
}

export interface GoalSpecificStoredArtifact<T = unknown> extends GoalSpecificArtifactReference {
  readonly payload: T;
  readonly fingerprint: string;
}

export interface GoalSpecificStageAuthenticityEntry {
  readonly stage: ProductShadowB1B4Stage;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly productionKernel: string;
  readonly sourceAdapter: string;
  readonly inputArtifactTypes: readonly string[];
  readonly outputArtifactType: string;
  readonly genuineExecution: boolean;
  readonly fixtureOnly: boolean;
  readonly scriptedStatus: false;
  readonly countsAsEvidence: boolean;
  readonly unresolvedOwner: string | null;
  readonly fingerprint: string;
}

export type ProductInputNecessityClassification =
  | "already_present_and_sufficient"
  | "present_but_coarse"
  | "required_for_primary_goal_mapping"
  | "required_for_purpose_bundle"
  | "required_for_week_allocation"
  | "required_for_session_feasibility"
  | "required_for_exercise_legality"
  | "required_for_exact_realization"
  | "calibration_can_substitute"
  | "required_only_for_longitudinal_adaptation"
  | "optional_personalization"
  | "deferred_policy_required"
  | "not_needed_for_initial_program"
  | "prohibited_inference";

export interface ProductInputNecessityRow {
  readonly fact: string;
  readonly classifications: readonly ProductInputNecessityClassification[];
  readonly affectedGoals: readonly string[];
  readonly earliestBlockerStage: GoalSpecificResponseStage | "longitudinal" | null;
  readonly calibrationCanSubstitute: boolean;
  readonly belongsInChunkE: boolean;
  readonly canWaitUntilLater: boolean;
  readonly separatePolicyRequired: boolean;
  readonly finding: string;
}

export interface GoalSpecificEvidenceRunSummary {
  readonly reference: typeof GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE;
  readonly runId: string;
  readonly scenarioId: string;
  readonly mappingFingerprint: string;
  readonly terminalClass: GoalSpecificTerminalClass;
  readonly pipelineStatus: string;
  readonly completedStages: readonly ProductShadowB1B4Stage[];
  readonly firstStoppedStage: ProductShadowB1B4Stage | null;
  readonly artifactReferences: readonly GoalSpecificArtifactReference[];
  readonly fullProgramSnapshotId: string | null;
  readonly gate13Status: string;
  readonly phaseStatus: "planned_truth_only" | "not_constructed";
  readonly longitudinalStatus: "restricted_insufficient_evidence" | "not_evaluated";
  readonly orchestrationStatus: "no_action_no_application" | "not_evaluated";
  readonly deliveredToUser: false;
  readonly performed: false;
  readonly productMutationApplied: false;
  readonly applicationApplied: false;
  readonly outcomeSuperiorityClaimed: false;
  readonly fingerprint: string;
}

export const GOAL_SPECIFIC_EVIDENCE_CONTRACTS = Object.freeze([
  GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_REFERENCE,
  GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE,
  GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE,
  GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE,
  GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE_REFERENCE,
  PRODUCT_INPUT_NECESSITY_MATRIX_REFERENCE,
  GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RESULT_REFERENCE,
]);

export function validateGoalSpecificScenarioContract(
  contract: GoalSpecificProductShadowScenarioContract,
): readonly string[] {
  const failures: string[] = [];
  if (contract.reference.contractId !== GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE.contractId ||
      contract.reference.contractVersion !== GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE.contractVersion) {
    failures.push("GOAL_SPECIFIC_SCENARIO_CONTRACT_REFERENCE_INVALID");
  }
  if (!contract.scenarioId || !contract.fixtureId || !contract.athleteShellId ||
      !contract.productSourceRevision || !contract.evaluationTime) {
    failures.push("GOAL_SPECIFIC_SCENARIO_IDENTITY_REQUIRED");
  }
  if (contract.changedFactPaths.length === 0 || contract.unchangedFactPaths.length === 0 ||
      !contract.factOwner || contract.permittedConvergenceReasons.length === 0) {
    failures.push("GOAL_SPECIFIC_SCENARIO_CAUSAL_DECLARATION_REQUIRED");
  }
  if (contract.noRescueRequired !== true ||
      contract.mappingProfileVersion !== "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING@1.0.0" ||
      contract.pipelineProfileVersion !== "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4@1.0.0") {
    failures.push("GOAL_SPECIFIC_SCENARIO_AUTHORITY_BOUNDARY_INVALID");
  }
  return Object.freeze(failures);
}

export function validateGoalSpecificCausalPairContract(
  contract: GoalSpecificProductShadowCausalPairContract,
): readonly string[] {
  const failures: string[] = [];
  if (contract.reference.contractId !== GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE.contractId ||
      contract.reference.contractVersion !== GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE.contractVersion) {
    failures.push("GOAL_SPECIFIC_PAIR_CONTRACT_REFERENCE_INVALID");
  }
  if (!contract.pairId || !contract.baselineScenarioId || !contract.counterfactualScenarioId ||
      contract.baselineScenarioId === contract.counterfactualScenarioId || !contract.changedFactPath ||
      !contract.rightfulOwner) {
    failures.push("GOAL_SPECIFIC_PAIR_IDENTITY_REQUIRED");
  }
  if (contract.justifiedConvergencePermitted !== (contract.convergenceReason !== null)) {
    failures.push("GOAL_SPECIFIC_PAIR_CONVERGENCE_DECLARATION_INVALID");
  }
  if (contract.noRescueRequired !== true) failures.push("GOAL_SPECIFIC_PAIR_NO_RESCUE_REQUIRED");
  return Object.freeze(failures);
}
