import { createHash } from "node:crypto";
import {
  validateGoalSpecificCausalPairContract,
  validateGoalSpecificScenarioContract,
} from "./contracts";
import { GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX } from "./pairManifest";
import { GOAL_SPECIFIC_CONTROLLED_SCENARIOS } from "./scenarioManifest";

export const GOAL_SPECIFIC_STRESS_TARGETS = Object.freeze({
  scenarioContractValidations: 10_000,
  causalPairValidations: 10_000,
  mappingExecutions: 10_000,
  planningBriefExecutions: 10_000,
  weekSessionExecutions: 10_000,
  candidateComposerExecutions: 8_000,
  prescriptionRealizationExecutions: 8_000,
  sequenceGate13Executions: 5_000,
  fullProgramSnapshotBuilds: 3_000,
  gate14Comparisons: 3_000,
  antiBloatValidations: 3_000,
  convergenceClassifications: 2_000,
  equipmentCounterfactuals: 2_000,
  timeCounterfactuals: 2_000,
  painContextCounterfactuals: 2_000,
  historicalV1ExactReplays: 1_000,
  currentRouteInvarianceComparisons: 1_000,
  counterfactualAttributionAttacks: 1_000,
  cannedStageDetectionMutations: 1_000,
  noRescueMutations: 1_000,
  repeatedDeterministicRuns: 1_000,
});

export function runGoalSpecificContractStress() {
  const failures: string[] = [];
  for (let index = 0; index < GOAL_SPECIFIC_STRESS_TARGETS.scenarioContractValidations; index += 1) {
    const contract = GOAL_SPECIFIC_CONTROLLED_SCENARIOS[index % GOAL_SPECIFIC_CONTROLLED_SCENARIOS.length].contract;
    failures.push(...validateGoalSpecificScenarioContract(contract));
  }
  for (let index = 0; index < GOAL_SPECIFIC_STRESS_TARGETS.causalPairValidations; index += 1) {
    const pair = GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX[index % GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX.length];
    failures.push(...validateGoalSpecificCausalPairContract(pair));
  }
  const semantic = Object.freeze({ counts: Object.freeze({
    scenarioContractValidations: GOAL_SPECIFIC_STRESS_TARGETS.scenarioContractValidations,
    causalPairValidations: GOAL_SPECIFIC_STRESS_TARGETS.causalPairValidations,
  }), failures: Object.freeze([...new Set(failures)].sort()) });
  return Object.freeze({ ...semantic, fingerprint: createHash("sha256")
    .update(JSON.stringify(semantic)).digest("hex") });
}
