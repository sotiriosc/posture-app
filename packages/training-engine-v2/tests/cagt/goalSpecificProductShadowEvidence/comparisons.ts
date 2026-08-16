import type { CagtGateId } from "../contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2 } from "../effectiveAuthorityRegistryV2";
import {
  FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
  FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
  type FullPrescribedProgramCounterfactualContract,
  type FullPrescribedProgramSnapshot,
  type FullProgramGate14DifferenceDimension,
} from "../fullProgramContracts";
import {
  runFullPrescribedProgramGate14,
  validateFullPrescribedProgramCagtResult,
} from "../fullProgramGate14";
import type { GoalSpecificProductShadowCausalPairContract } from "./contracts";

const STAGE_GATE: Readonly<Record<GoalSpecificProductShadowCausalPairContract["earliestResponseStage"],
CagtGateId>> = Object.freeze({
  fixture_contract: "gate_0_scenario_truth",
  product_mapping: "gate_0_scenario_truth",
  planning_brief: "gate_1_weekly_responsibility_truth",
  weekly_intent: "gate_1_weekly_responsibility_truth",
  week_allocation: "gate_2_whole_week_allocation_coverage",
  session_intent: "gate_6_session_intent_truth",
  candidate_intelligence: "gate_7_candidate_intelligence_truth",
  session_composer: "gate_8_session_composition_truth",
  prescription: "gate_9_prescription_handoff_truth",
  final_sequence: "gate_10_sequencing_duration_handoff_truth",
  gate_13: "gate_13_post_prescription_weekly_validation",
  gate_14: "gate_14_full_prescribed_program_comparison",
});

function gate14Contract(input: {
  readonly pair: GoalSpecificProductShadowCausalPairContract;
  readonly baseline: FullPrescribedProgramSnapshot;
  readonly counterfactual: FullPrescribedProgramSnapshot;
}): FullPrescribedProgramCounterfactualContract {
  const { pair, baseline, counterfactual } = input;
  const convergence = pair.justifiedConvergencePermitted ? pair.convergenceReason ?? undefined : undefined;
  const permitted = pair.materiality === "material"
    ? FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS.filter((dimension) =>
      !["program_label", "split_label", "scenario_id", "display_order", "explanation_prose",
        "report_format"].includes(dimension))
    : [];
  return Object.freeze({
    id: `goal-specific-gate14:${pair.pairId}`,
    version: "1.0.0",
    gate14Contract: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
    authorityRegistryReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.reference,
    baselineScenarioId: pair.baselineScenarioId,
    counterfactualScenarioId: pair.counterfactualScenarioId,
    baselineSnapshotId: baseline.snapshotId,
    counterfactualSnapshotId: counterfactual.snapshotId,
    changedFactPaths: Object.freeze(["declaredFact.value"]),
    changedFactIds: Object.freeze([pair.changedFactPath]),
    canonicalFactOwner: pair.rightfulOwner,
    materiality: pair.materiality,
    earliestPermittedResponseGate: STAGE_GATE[pair.earliestResponseStage],
    latestRequiredResponseGate: STAGE_GATE[pair.latestResponseStage],
    invariantGates: Object.freeze([]),
    permittedDifferenceDimensions: Object.freeze(permitted),
    prohibitedDifferenceDimensions: Object.freeze([]),
    acceptableConvergenceReasons: Object.freeze(convergence ? [convergence] : []),
    ...(convergence ? { justifiedConvergenceReason: convergence } : {}),
    expectedFrameworkRelationship: pair.frameworkSamenessExpected ? "expected_same" : "may_converge",
    expectedAdaptiveContentRelationship: pair.materiality === "material"
      ? "must_differ" : "expected_same",
    expectedWeeklyResponsibilityRelationship: pair.materiality === "material" ? "may_differ" : "same",
    expectedAllocationRelationship: pair.materiality === "material" ? "may_differ" : "same",
    expectedSessionStructureRelationship: pair.materiality === "material" ? "may_differ" : "same",
    expectedExerciseIdentityRelationship: pair.exerciseSamenessPermitted ? "may_differ" : "must_differ",
    expectedPrescriptionRelationship: pair.prescriptionSamenessPermitted ? "may_differ" : "must_differ",
    expectedSequenceRelationship: pair.materiality === "material" ? "may_differ" : "same",
    expectedFinalProgramRelationship: pair.materiality === "inert" ? "same" :
      convergence ? "may_converge" : "must_differ",
    finalProgramDimensionsMustPreserveEarlierAdaptation: Object.freeze([]),
    finalProgramDimensionsAllowedToConverge: Object.freeze(convergence
      ? [...permitted] : [] as FullProgramGate14DifferenceDimension[]),
    acceptableStructuredConvergenceReasons: Object.freeze(convergence ? [convergence] : []),
    finalAdaptationPersistenceRequired: pair.materiality === "material",
    explicitEntityMappings: Object.freeze([]),
    layerAuthorityExpectations: Object.freeze({
      gate_14_full_prescribed_program_comparison: "DESIGN_ONLY" as const,
    }),
    downstreamRescueProhibited: true,
    source: Object.freeze({ sourceType: "reviewed_test_contract" as const,
      sourceRef: `goal-specific-pair:${pair.pairId}` }),
    explanation: "Frozen Goal-specific Product Shadow Gate 14 causal comparison contract.",
  });
}

export function compareGoalSpecificFullPrograms(input: {
  readonly pair: GoalSpecificProductShadowCausalPairContract;
  readonly baseline: FullPrescribedProgramSnapshot;
  readonly counterfactual: FullPrescribedProgramSnapshot;
}) {
  const contract = gate14Contract(input);
  const result = runFullPrescribedProgramGate14({
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    contract,
    baselineSnapshot: input.baseline,
    counterfactualSnapshot: input.counterfactual,
    baselineFacts: Object.freeze({ declaredFact: Object.freeze({ value: "baseline" }) }),
    counterfactualFacts: Object.freeze({ declaredFact: Object.freeze({ value: "counterfactual" }) }),
    runShadowDiagnosticsAfterFailure: true,
  });
  return Object.freeze({ contract, result,
    validationFailures: validateFullPrescribedProgramCagtResult(result) });
}
