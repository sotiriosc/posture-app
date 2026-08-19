import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE,
  type GoalSpecificEvidenceRunSummary,
  type GoalSpecificTerminalClass,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts";
import type { GoalSpecificScenarioDeclaration } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import {
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  createControlledProductShadowB1B4Pipeline,
  CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
} from "../../src/controlledProductShadowGoalRealization";
import { GoalSpecificProductShadowArtifactStore, evidenceDigest } from "./artifactStore";
import { buildGoalSpecificMappingInput } from "./currentProductFixtures";
import { createGenuineGoalSpecificStagePorts } from "./genuineStagePorts";

function terminalClass(status: string, realizationStatuses: readonly string[]): GoalSpecificTerminalClass {
  if (status === "shadow_program_incomplete_product_input") return "honest_incomplete_product_input";
  if (status === "shadow_program_incomplete_policy") return "honest_incomplete_policy";
  if (status === "shadow_program_incomplete_mapping") return "honest_incomplete_mapping";
  if (status === "shadow_search_inconclusive") return "search_inconclusive";
  if (status === "shadow_blocked_training_safety") return "safety_blocked";
  if (status === "shadow_program_complete_with_self_selected_calibration" ||
      realizationStatuses.some((value) => value.includes("calibration_required"))) {
    return "calibration_complete";
  }
  return "complete";
}

export interface GoalSpecificScenarioExecution {
  readonly declaration: GoalSpecificScenarioDeclaration;
  readonly mappingBundle: ReturnType<typeof buildControlledProductShadowGoalRealizationMappingBundleV1>;
  readonly summary: GoalSpecificEvidenceRunSummary;
  readonly state: ReturnType<typeof createGenuineGoalSpecificStagePorts>["state"] | null;
}

export async function runGoalSpecificScenario(input: {
  readonly declaration: GoalSpecificScenarioDeclaration;
  readonly store: GoalSpecificProductShadowArtifactStore;
}): Promise<GoalSpecificScenarioExecution> {
  const { declaration, store } = input;
  const mappingInput = buildGoalSpecificMappingInput(declaration.fixture);
  const mappingBundle = buildControlledProductShadowGoalRealizationMappingBundleV1(mappingInput);
  const mappingArtifact = store.put({
    artifactType: "controlled_product_shadow_goal_realization_mapping_bundle",
    artifactId: `mapping:${declaration.fixture.fixtureId}`,
    artifactRevisionId: `mapping-revision:${mappingBundle.mappingFingerprint}`,
    contractId: mappingBundle.bundleReference.contractId,
    contractVersion: mappingBundle.bundleReference.contractVersion,
    athleteId: declaration.fixture.athleteShellId,
    scenarioId: declaration.contract.scenarioId,
    stage: "mapping",
    sourceLineage: Object.freeze([declaration.fixture.productSourceRevision]),
    counterfactualOnly: true,
    payload: mappingBundle,
  });
  let pipelineStatus: string;
  let completedStages: GoalSpecificEvidenceRunSummary["completedStages"] = Object.freeze([]);
  let firstStoppedStage: GoalSpecificEvidenceRunSummary["firstStoppedStage"] = null;
  let gate13Status = "not_evaluated";
  let state: ReturnType<typeof createGenuineGoalSpecificStagePorts>["state"] | null = null;
  let terminal: GoalSpecificTerminalClass;
  if (!mappingBundle.readiness.primaryState.startsWith("complete_")) {
    pipelineStatus = mappingBundle.readiness.primaryState.includes("policy") ||
      mappingBundle.readiness.primaryState === "unsupported_scope"
      ? "shadow_program_incomplete_policy"
      : mappingBundle.readiness.primaryState.includes("mapping") ||
        mappingBundle.readiness.primaryState.includes("equipment")
        ? "shadow_program_incomplete_mapping" : "shadow_program_incomplete_product_input";
    firstStoppedStage = "week_source";
    terminal = terminalClass(pipelineStatus, []);
  } else {
    const genuine = createGenuineGoalSpecificStagePorts({ fixture: declaration.fixture,
      mappingBundle, store });
    state = genuine.state;
    const pipeline = createControlledProductShadowB1B4Pipeline({
      profile: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
      stagePorts: genuine.ports,
    });
    const result = await pipeline.evaluate({ athleteId: declaration.fixture.athleteShellId,
      mappingBundle, evaluationTime: mappingInput.evaluationTime });
    pipelineStatus = result.status;
    completedStages = result.completedStages;
    firstStoppedStage = result.firstStoppedStage;
    gate13Status = result.gate13Status;
    terminal = terminalClass(result.status, state.sessions?.flatMap((session) =>
      session.realizationResults?.map((entry) => entry.status) ?? []) ?? []);
  }
  const semantic = {
    reference: GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE,
    runId: `goal-specific-run:${declaration.contract.scenarioId}`,
    scenarioId: declaration.contract.scenarioId,
    mappingFingerprint: mappingBundle.mappingFingerprint,
    terminalClass: terminal,
    pipelineStatus,
    completedStages,
    firstStoppedStage,
    artifactReferences: store.referencesForScenario(declaration.contract.scenarioId),
    fullProgramSnapshotId: state?.fullProgramSnapshot?.snapshotId ?? null,
    gate13Status,
    phaseStatus: state?.phaseSnapshot ? "planned_truth_only" as const : "not_constructed" as const,
    longitudinalStatus: state?.phaseSnapshot
      ? "restricted_insufficient_evidence" as const : "not_evaluated" as const,
    orchestrationStatus: state?.phaseSnapshot
      ? "no_action_no_application" as const : "not_evaluated" as const,
    deliveredToUser: false as const,
    performed: false as const,
    productMutationApplied: false as const,
    applicationApplied: false as const,
    outcomeSuperiorityClaimed: false as const,
  };
  const summary = Object.freeze({ ...semantic, fingerprint: evidenceDigest(semantic) });
  store.put({
    artifactType: "goal_specific_evidence_run",
    artifactId: semantic.runId,
    artifactRevisionId: `goal-specific-run-revision:${summary.fingerprint}`,
    contractId: GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE.contractId,
    contractVersion: GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_RUN_REFERENCE.contractVersion,
    athleteId: declaration.fixture.athleteShellId,
    scenarioId: declaration.contract.scenarioId,
    stage: "evidence",
    sourceLineage: Object.freeze([mappingArtifact.artifactRevisionId]),
    counterfactualOnly: true,
    payload: summary,
  });
  return Object.freeze({ declaration, mappingBundle, summary, state });
}

export function createGoalSpecificArtifactStore(): GoalSpecificProductShadowArtifactStore {
  return new GoalSpecificProductShadowArtifactStore();
}
