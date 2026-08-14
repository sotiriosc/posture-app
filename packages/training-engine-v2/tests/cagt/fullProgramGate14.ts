import {
  CAGT_GATE_ORDER,
  type CagtClassification,
  type CagtGateId,
} from "./contracts";
import { fixtureDifferencePaths, semanticallyEqual } from "./diff";
import { alignFullPrescribedPrograms } from "./fullProgramAlignment";
import {
  FULL_PROGRAM_GATE_14_SUBGATES,
  FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
  type FullPrescribedProgramCagtResult,
  type FullPrescribedProgramCounterfactualContract,
  type FullPrescribedProgramSnapshot,
  type FullProgramCollisionClassification,
  type FullProgramGate14Classification,
  type FullProgramGate14DifferenceDimension,
  type FullProgramGate14Subgate,
  type FullProgramGate14SubgateTrace,
} from "./fullProgramContracts";
import {
  buildFullProgramSignatureFamily,
  diffFullProgramSignatures,
} from "./fullProgramSignatures";
import {
  type CagtEffectiveAuthorityRegistry,
  validateEffectiveAuthorityRegistryV2,
} from "./effectiveAuthorityRegistryV2";
import { validateFullPrescribedProgramSnapshot } from "../helpers/fullPrescribedProgramPipeline";

const FRAMEWORK_DIMENSIONS: readonly FullProgramGate14DifferenceDimension[] = Object.freeze([
  "program_horizon_structure", "prescribed_session_count", "broad_session_framework",
  "dominant_session_distribution", "section_occupancy_pattern",
]);
const RESPONSIBILITY_DIMENSIONS: readonly FullProgramGate14DifferenceDimension[] = Object.freeze([
  "final_weekly_objectives", "objective_priority_distribution", "objective_prescribed_frequency",
  "objective_execution_feasibility", "objective_realization_status", "unsupported_policy_state",
  "session_responsibility_distribution", "session_need_distribution", "selected_assignment_distribution",
  "exercise_identity_distribution", "anchor_distribution", "shared_coverage_distribution",
  "warmup_dependency_distribution", "activation_dependency_distribution", "main_work_distribution",
  "accessory_distribution", "cooldown_distribution",
]);
const PRESCRIPTION_DIMENSIONS: readonly FullProgramGate14DifferenceDimension[] = Object.freeze([
  "source_event_distribution", "dose_block_distribution", "preparatory_block_distribution",
  "developmental_block_distribution", "technique_block_distribution", "recovery_block_distribution",
  "dose_mode_distribution", "sets_distribution", "reps_distribution", "load_distribution", "effort_distribution",
  "range_distribution", "support_distribution", "side_distribution", "tempo_distribution", "rest_distribution",
  "duration_distribution", "primary_muscle_distribution", "key_secondary_distribution", "direct_action_distribution",
  "movement_role_distribution", "capacity_lane_distribution", "assessment_lane_distribution", "recovery_lane_distribution",
]);
export interface RunFullPrescribedProgramGate14Input {
  readonly authorityRegistry: CagtEffectiveAuthorityRegistry;
  readonly contract: FullPrescribedProgramCounterfactualContract;
  readonly baselineSnapshot: FullPrescribedProgramSnapshot;
  readonly counterfactualSnapshot: FullPrescribedProgramSnapshot;
  readonly baselineFacts: unknown;
  readonly counterfactualFacts: unknown;
  readonly observedNonmaterialDimensions?: readonly FullProgramGate14DifferenceDimension[];
  readonly earlierAdaptationDimensions?: readonly FullProgramGate14DifferenceDimension[];
  readonly runShadowDiagnosticsAfterFailure?: boolean;
}

function gateIndex(gate: CagtGateId | null): number {
  return gate === null ? Number.MAX_SAFE_INTEGER : CAGT_GATE_ORDER.indexOf(gate);
}

function relationshipResult(changed: readonly FullProgramGate14DifferenceDimension[], group: readonly FullProgramGate14DifferenceDimension[]) {
  return changed.some((dimension) => group.includes(dimension)) ? "different" as const : "same" as const;
}

function broadClassification(classification: FullProgramGate14Classification): CagtClassification {
  if (classification === "PROGRAM_EXPECTED_CONVERGENCE") return "EXPECTED_CONVERGENCE";
  if (classification === "PROGRAM_JUSTIFIED_CONVERGENCE") return "JUSTIFIED_CONVERGENCE";
  if (classification === "PROGRAM_MATERIAL_ADAPTATION_PRESERVED") return "MATERIAL_ADAPTATION";
  if (classification === "PROGRAM_OPTIONAL_VARIATION") return "OPTIONAL_VARIATION";
  if (classification === "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15" ||
      classification === "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16") return "DIFFERENCE_DEFERRED_TO_LATER_OWNER";
  if (classification === "PROGRAM_COSMETIC_ONLY_DIFFERENCE") return "TRACE_ONLY_DIFFERENCE_NOT_SUFFICIENT";
  if (classification === "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT" ||
      classification === "MATERIAL_ADAPTATION_ERASED_DOWNSTREAM") return "UNRESPONSIVE_TO_MATERIAL_INPUT";
  if (classification === "PROGRAM_OVER_ADAPTATION") return "OVER_ADAPTATION";
  if (classification === "PROGRAM_WRONG_LAYER_EFFECT" || classification === "PROGRAM_ALIGNMENT_AMBIGUOUS") {
    return "WRONG_LAYER_EFFECT";
  }
  if (classification === "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY") return "DOWNSTREAM_RESCUE_REJECTED";
  return "SUSPICIOUS_CONVERGENCE";
}

function validateContractAndFixture(input: RunFullPrescribedProgramGate14Input): readonly string[] {
  const reasons: string[] = [];
  const { contract } = input;
  if (!semanticallyEqual(contract.gate14Contract, FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE)) {
    reasons.push("FULL_PROGRAM_GATE_14_CONTRACT_UNSUPPORTED");
  }
  if (!semanticallyEqual(contract.authorityRegistryReference, input.authorityRegistry.reference)) {
    reasons.push("FULL_PROGRAM_AUTHORITY_REGISTRY_REFERENCE_MISMATCH");
  }
  if (contract.baselineSnapshotId !== input.baselineSnapshot.snapshotId ||
      contract.counterfactualSnapshotId !== input.counterfactualSnapshot.snapshotId) {
    reasons.push("FULL_PROGRAM_COUNTERFACTUAL_SNAPSHOT_ID_MISMATCH");
  }
  const actualPaths = fixtureDifferencePaths(input.baselineFacts, input.counterfactualFacts);
  if (!semanticallyEqual(actualPaths, [...contract.changedFactPaths].sort())) {
    reasons.push("FULL_PROGRAM_COUNTERFACTUAL_CHANGED_PATHS_INVALID");
  }
  if (contract.changedFactPaths.length === 0 || contract.changedFactIds.length === 0) {
    reasons.push("FULL_PROGRAM_COUNTERFACTUAL_CHANGED_FACT_REQUIRED");
  }
  if (contract.permittedDifferenceDimensions.some((dimension) =>
    contract.prohibitedDifferenceDimensions.includes(dimension))) {
    reasons.push("FULL_PROGRAM_COUNTERFACTUAL_DIMENSION_CONFLICT");
  }
  if (contract.downstreamRescueProhibited !== true) reasons.push("FULL_PROGRAM_DOWNSTREAM_RESCUE_MUST_BE_PROHIBITED");
  return Object.freeze([...new Set(reasons)].sort());
}

function collisionClassifications(input: {
  readonly frameworkSame: boolean;
  readonly adaptiveSame: boolean;
  readonly classification: FullProgramGate14Classification;
}): readonly FullProgramCollisionClassification[] {
  const values: FullProgramCollisionClassification[] = [];
  if (input.frameworkSame) values.push("EXPECTED_SHARED_FRAMEWORK");
  if (input.adaptiveSame && input.classification === "PROGRAM_EXPECTED_CONVERGENCE") {
    values.push("EXPECTED_SEMANTIC_CONVERGENCE");
  } else if (input.adaptiveSame && input.classification === "PROGRAM_JUSTIFIED_CONVERGENCE") {
    values.push("JUSTIFIED_SHARED_SOLUTION");
  } else if (input.adaptiveSame && input.classification === "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT") {
    values.push("SUSPICIOUS_ADAPTIVE_COLLISION");
  } else if (input.frameworkSame && !input.adaptiveSame) {
    values.push("PRODUCTIVE_STABILITY");
  }
  return Object.freeze(values.length > 0 ? values : ["UNKNOWN_REQUIRES_REVIEW"]);
}

function buildSubgateTrace(input: {
  readonly failureSubgate: FullProgramGate14Subgate | null;
  readonly upstreamFailure: boolean;
  readonly shadow: boolean;
  readonly failureReasons: readonly string[];
}): readonly FullProgramGate14SubgateTrace[] {
  const failureIndex = input.failureSubgate === null ? -1 : FULL_PROGRAM_GATE_14_SUBGATES.indexOf(input.failureSubgate);
  return Object.freeze(FULL_PROGRAM_GATE_14_SUBGATES.map((subgate, index) => {
    if (failureIndex < 0 || index < failureIndex) return Object.freeze({ subgate, state: "PASS" as const, scored: true,
      reasonCodes: Object.freeze(["GATE_14_SUBGATE_PASSED"]) });
    if (index === failureIndex) {
      return Object.freeze({ subgate, state: input.upstreamFailure ? "NOT_REACHED" as const : "FAIL_STOP" as const,
        scored: !input.upstreamFailure, reasonCodes: input.failureReasons });
    }
    return Object.freeze({ subgate, state: input.shadow ? "SHADOW_DIAGNOSTIC_ONLY" as const : "NOT_REACHED" as const,
      scored: false, reasonCodes: Object.freeze([input.shadow ? "INVALID_UPSTREAM_CONTEXT" : "EARLIER_SUBGATE_FAILED"]) });
  }));
}

export function runFullPrescribedProgramGate14(
  input: RunFullPrescribedProgramGate14Input,
): FullPrescribedProgramCagtResult {
  const registryReasons = validateEffectiveAuthorityRegistryV2(input.authorityRegistry);
  const fixtureReasons = [...registryReasons, ...validateContractAndFixture(input)];
  const baselineSnapshotReasons = validateFullPrescribedProgramSnapshot(input.baselineSnapshot);
  const counterfactualSnapshotReasons = validateFullPrescribedProgramSnapshot(input.counterfactualSnapshot);
  const baselineSignatures = buildFullProgramSignatureFamily(input.baselineSnapshot);
  const counterfactualSignatures = buildFullProgramSignatureFamily(input.counterfactualSnapshot);
  const structuredDifferences = diffFullProgramSignatures(baselineSignatures, counterfactualSignatures,
    input.observedNonmaterialDimensions);
  const changedDimensions = structuredDifferences.map((difference) => difference.dimension);
  const materialDimensions = structuredDifferences.filter((difference) => difference.material)
    .map((difference) => difference.dimension);
  const frameworkRelationshipResult = relationshipResult(changedDimensions, FRAMEWORK_DIMENSIONS);
  const adaptiveContentRelationshipResult = materialDimensions.length > 0 ? "different" as const : "same" as const;
  const upstreamFailure = [...input.baselineSnapshot.upstreamGateResults, ...input.counterfactualSnapshot.upstreamGateResults]
    .find((result) => result.state === "FAIL_STOP") ?? null;
  const alignmentResult = alignFullPrescribedPrograms({ baseline: input.baselineSnapshot,
    counterfactual: input.counterfactualSnapshot, contract: input.contract });
  const firstAnyDifference = structuredDifferences.length === 0 ? null : [...structuredDifferences]
    .sort((left, right) => gateIndex(left.earliestOwnerGate) - gateIndex(right.earliestOwnerGate))[0].earliestOwnerGate;
  const firstMaterialDifference = structuredDifferences.filter((difference) => difference.material)
    .sort((left, right) => gateIndex(left.earliestOwnerGate) - gateIndex(right.earliestOwnerGate))[0]?.earliestOwnerGate ?? null;
  const firstMaterialDimensions = firstMaterialDifference === null ? [] : structuredDifferences
    .filter((difference) => difference.material && difference.earliestOwnerGate === firstMaterialDifference)
    .map((difference) => difference.dimension);
  const permitted = new Set(input.contract.permittedDifferenceDimensions);
  const prohibited = materialDimensions.filter((dimension) => input.contract.prohibitedDifferenceDimensions.includes(dimension));
  const unrelated = materialDimensions.filter((dimension) => !permitted.has(dimension) &&
    !input.contract.finalProgramDimensionsAllowedToConverge.includes(dimension));
  const tooEarly = structuredDifferences.filter((difference) => difference.material &&
    input.contract.earliestPermittedResponseGate !== null &&
    gateIndex(difference.earliestOwnerGate) < gateIndex(input.contract.earliestPermittedResponseGate));
  const preservedRequiredDimensions = input.contract.finalProgramDimensionsMustPreserveEarlierAdaptation
    .filter((dimension) => materialDimensions.includes(dimension));
  const missingPersistence = input.contract.finalProgramDimensionsMustPreserveEarlierAdaptation
    .filter((dimension) => !materialDimensions.includes(dimension));
  const earlierAdaptation = input.earlierAdaptationDimensions ?? [];
  const responseErased = input.contract.finalAdaptationPersistenceRequired && missingPersistence.some((dimension) =>
    earlierAdaptation.includes(dimension));
  const convergenceReason = input.contract.justifiedConvergenceReason &&
    input.contract.acceptableStructuredConvergenceReasons.includes(input.contract.justifiedConvergenceReason)
    ? input.contract.justifiedConvergenceReason : null;
  const onlyNonmaterial = structuredDifferences.length > 0 && materialDimensions.length === 0;

  let finalClassification: FullProgramGate14Classification;
  let firstFailingSubgate: FullProgramGate14Subgate | null = null;
  let failureReasons: readonly string[] = Object.freeze([]);
  if (fixtureReasons.length > 0) {
    finalClassification = "PROGRAM_COMPARISON_INCONCLUSIVE";
    firstFailingSubgate = "14.0_pair_and_contract_truth";
    failureReasons = fixtureReasons;
  } else if (upstreamFailure) {
    finalClassification = "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY";
    firstFailingSubgate = "14.1_upstream_scored_path_validity";
    failureReasons = Object.freeze([`UPSTREAM_GATE_FAILED:${upstreamFailure.gate}`]);
  } else if (baselineSnapshotReasons.length + counterfactualSnapshotReasons.length > 0) {
    finalClassification = "PROGRAM_SNAPSHOT_INCOMPLETE";
    firstFailingSubgate = "14.2_program_snapshot_completeness";
    failureReasons = Object.freeze([...baselineSnapshotReasons, ...counterfactualSnapshotReasons]);
  } else if (alignmentResult.status === "ambiguous_alignment" || alignmentResult.status === "invalid_alignment") {
    finalClassification = "PROGRAM_ALIGNMENT_AMBIGUOUS";
    firstFailingSubgate = "14.3_entity_alignment";
    failureReasons = alignmentResult.reasonCodes;
  } else if (input.contract.expectedFrameworkRelationship === "expected_same" && frameworkRelationshipResult === "different") {
    finalClassification = "PROGRAM_OVER_ADAPTATION";
    firstFailingSubgate = "14.4_framework_comparison";
    failureReasons = Object.freeze(["FRAMEWORK_CHANGED_WITHOUT_CAUSAL_AUTHORITY"]);
  } else if (input.contract.expectedFrameworkRelationship === "must_differ" && frameworkRelationshipResult === "same") {
    finalClassification = "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT";
    firstFailingSubgate = "14.4_framework_comparison";
    failureReasons = Object.freeze(["REQUIRED_FRAMEWORK_RESPONSE_MISSING"]);
  } else if (prohibited.length > 0 || unrelated.length > 0 || tooEarly.length > 0) {
    finalClassification = input.contract.materiality === "inert" ? "PROGRAM_OVER_ADAPTATION" : "PROGRAM_WRONG_LAYER_EFFECT";
    const offending = [...prohibited, ...unrelated, ...tooEarly.map((difference) => difference.dimension)];
    firstFailingSubgate = offending.some((dimension) => FRAMEWORK_DIMENSIONS.includes(dimension))
      ? "14.4_framework_comparison" : offending.some((dimension) => RESPONSIBILITY_DIMENSIONS.includes(dimension))
        ? "14.5_responsibility_and_session_structure_propagation"
        : offending.some((dimension) => PRESCRIPTION_DIMENSIONS.includes(dimension))
          ? "14.6_prescription_and_relationship_propagation"
          : "14.7_sequencing_duration_stress_and_spacing";
    failureReasons = Object.freeze(["PROGRAM_DIFFERENCE_OUTSIDE_CAUSAL_AUTHORITY"]);
  } else if (responseErased) {
    finalClassification = "MATERIAL_ADAPTATION_ERASED_DOWNSTREAM";
    firstFailingSubgate = "14.8_first_meaningful_difference_and_persistence";
    failureReasons = Object.freeze(["MATERIAL_ADAPTATION_ERASED_DOWNSTREAM"]);
  } else if (input.contract.materiality === "material" && onlyNonmaterial) {
    finalClassification = "PROGRAM_COSMETIC_ONLY_DIFFERENCE";
    firstFailingSubgate = "14.8_first_meaningful_difference_and_persistence";
    failureReasons = Object.freeze(["HIGHER_ORDER_PROGRAM_RESPONSE_REQUIRED"]);
  } else if (input.contract.expectedFinalProgramRelationship === "defer_gate_15") {
    finalClassification = "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15";
  } else if (input.contract.expectedFinalProgramRelationship === "defer_gate_16") {
    finalClassification = "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16";
  } else if (input.contract.materiality === "inert" && materialDimensions.length === 0) {
    finalClassification = "PROGRAM_EXPECTED_CONVERGENCE";
  } else if (materialDimensions.length === 0 && convergenceReason) {
    finalClassification = "PROGRAM_JUSTIFIED_CONVERGENCE";
  } else if (input.contract.materiality === "material" && materialDimensions.length === 0) {
    finalClassification = "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT";
    firstFailingSubgate = "14.9_final_convergence_adaptation_verdict";
    failureReasons = Object.freeze(["PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT"]);
  } else if (input.contract.expectedFinalProgramRelationship === "same" && materialDimensions.length > 0) {
    finalClassification = "PROGRAM_OVER_ADAPTATION";
    firstFailingSubgate = "14.9_final_convergence_adaptation_verdict";
    failureReasons = Object.freeze(["EXPECTED_FINAL_PROGRAM_CONVERGENCE_VIOLATED"]);
  } else {
    finalClassification = "PROGRAM_MATERIAL_ADAPTATION_PRESERVED";
  }

  const downstreamDifferenceObserved = structuredDifferences.some((difference) => difference.material);
  const subgateTrace = buildSubgateTrace({ failureSubgate: firstFailingSubgate,
    upstreamFailure: finalClassification === "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY",
    shadow: input.runShadowDiagnosticsAfterFailure ?? true, failureReasons });
  const firstFailingGate = upstreamFailure?.gate ?? (firstFailingSubgate ? "gate_14_full_prescribed_program_comparison" : null);
  const persistenceOccurred = !input.contract.finalAdaptationPersistenceRequired ||
    preservedRequiredDimensions.length === input.contract.finalProgramDimensionsMustPreserveEarlierAdaptation.length;
  const causalPropagationTrace = Object.freeze({
    changedFactIds: input.contract.changedFactIds,
    factOwner: input.contract.canonicalFactOwner,
    firstRightfulReceiver: input.contract.earliestPermittedResponseGate,
    firstMaterialResponse: firstMaterialDifference,
    downstreamDimensionsPreservingResponse: Object.freeze(preservedRequiredDimensions),
    convergedDimensions: input.contract.finalProgramDimensionsAllowedToConverge,
    structuredConvergenceReason: convergenceReason,
    finalProgramManifestation: Object.freeze(materialDimensions),
    persistenceRequired: input.contract.finalAdaptationPersistenceRequired,
    persistenceOccurred,
    unrelatedDimensionsChanged: Object.freeze([...new Set([...prohibited, ...unrelated])]),
    responseErased,
  });
  const firstMeaningfulDifference = Object.freeze({
    expectedEarliestPermittedGate: input.contract.earliestPermittedResponseGate,
    expectedLatestRequiredGate: input.contract.latestRequiredResponseGate,
    actualFirstAnyDifferenceGate: firstAnyDifference,
    actualFirstMaterialDifferenceGate: firstMaterialDifference,
    firstMaterialDimensions: Object.freeze(firstMaterialDimensions),
    firstFailingGate,
    differencePersistsToFinalProgram: materialDimensions.length > 0 && !responseErased,
    laterLayerErasedDifference: responseErased,
  });
  const frameworkSame = baselineSignatures.programFramework.fingerprint === counterfactualSignatures.programFramework.fingerprint;
  const adaptiveSame = baselineSignatures.completeAdaptiveProgram.fingerprint ===
    counterfactualSignatures.completeAdaptiveProgram.fingerprint;
  return Object.freeze({
    gate14Contract: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
    authorityRegistryReference: input.authorityRegistry.reference,
    counterfactualContractId: input.contract.id,
    baselineSnapshotId: input.baselineSnapshot.snapshotId,
    counterfactualSnapshotId: input.counterfactualSnapshot.snapshotId,
    fixtureValid: fixtureReasons.length === 0,
    upstreamGateSummary: Object.freeze([...input.baselineSnapshot.upstreamGateResults,
      ...input.counterfactualSnapshot.upstreamGateResults]),
    alignmentResult,
    baselineSignatures,
    counterfactualSignatures,
    structuredDifferences,
    frameworkRelationshipResult,
    adaptiveContentRelationshipResult,
    firstMeaningfulDifference,
    causalPropagationTrace,
    adaptationPersistenceResult: input.contract.finalAdaptationPersistenceRequired
      ? responseErased ? "erased" : "preserved" : "not_required",
    convergenceResult: finalClassification === "PROGRAM_EXPECTED_CONVERGENCE" ? "expected" :
      finalClassification === "PROGRAM_JUSTIFIED_CONVERGENCE" ? "justified" :
        materialDimensions.length === 0 ? "rejected" : "not_applicable",
    underAdaptationResult: finalClassification === "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT" ? "detected" : "not_detected",
    overAdaptationResult: finalClassification === "PROGRAM_OVER_ADAPTATION" ? "detected" : "not_detected",
    wrongLayerResult: finalClassification === "PROGRAM_WRONG_LAYER_EFFECT" ? "detected" : "not_detected",
    cosmeticDifferenceResult: finalClassification === "PROGRAM_COSMETIC_ONLY_DIFFERENCE" ? "detected" : "not_detected",
    noRescueTrace: Object.freeze({
      upstreamFailureGate: upstreamFailure?.gate ?? null,
      downstreamDifferenceObserved,
      downstreamRescueAttempted: Boolean(upstreamFailure && downstreamDifferenceObserved),
      downstreamRescueAccepted: false as const,
    }),
    collisionClassifications: collisionClassifications({ frameworkSame, adaptiveSame, classification: finalClassification }),
    observedMetrics: Object.freeze({
      materialDifferenceCount: materialDimensions.length,
      nonmaterialDifferenceCount: structuredDifferences.filter((difference) => !difference.material).length,
      alignedEntityCount: alignmentResult.entries.filter((entry) => ["exact_lineage_match",
        "explicit_cross_snapshot_mapping", "semantic_equivalent_match"].includes(entry.status)).length,
      unmatchedEntityCount: alignmentResult.unmatchedBaselineCount + alignmentResult.unmatchedCounterfactualCount,
    }),
    finalClassification,
    legacyClassification: broadClassification(finalClassification),
    firstFailingSubgate,
    subgateTrace,
    shadowDiagnostics: Object.freeze(firstFailingSubgate ? ["LATER_GATE_14_SUBGATES_UNSCORED"] : []),
    decisionTrace: Object.freeze([
      `fixture:${fixtureReasons.length === 0 ? "valid" : "invalid"}`,
      `registry:${input.authorityRegistry.reference.registryId}@${input.authorityRegistry.reference.version}`,
      `framework:${frameworkRelationshipResult}`,
      `adaptive:${adaptiveContentRelationshipResult}`,
      `first-material-gate:${firstMaterialDifference ?? "none"}`,
      `classification:${finalClassification}`,
      "raw-diversity-score:not-used",
      "expected-winner:not-provided",
    ]),
    provenance: Object.freeze(["CAGT_GATE_14_TEST_DEVELOPER_TOOLING", input.contract.source.sourceRef]),
  });
}

export function validateFullPrescribedProgramCagtResult(
  result: FullPrescribedProgramCagtResult,
): readonly string[] {
  const reasons: string[] = [];
  if (!semanticallyEqual(result.gate14Contract, FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE)) {
    reasons.push("FULL_PROGRAM_GATE_14_RESULT_CONTRACT_INVALID");
  }
  const firstFailure = result.subgateTrace.find((entry) => entry.state === "FAIL_STOP" || entry.state === "NOT_REACHED");
  if ((firstFailure?.subgate ?? null) !== result.firstFailingSubgate) reasons.push("FULL_PROGRAM_GATE_14_FIRST_FAILURE_INVALID");
  const failureIndex = result.firstFailingSubgate ? FULL_PROGRAM_GATE_14_SUBGATES.indexOf(result.firstFailingSubgate) : -1;
  if (failureIndex >= 0 && result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
    reasons.push("FULL_PROGRAM_GATE_14_DOWNSTREAM_SUBGATE_SCORED");
  }
  if (result.noRescueTrace.downstreamRescueAccepted !== false) reasons.push("FULL_PROGRAM_GATE_14_DOWNSTREAM_RESCUE_ACCEPTED");
  if (result.decisionTrace.some((entry) => entry.includes("diversity-score:used"))) {
    reasons.push("FULL_PROGRAM_RAW_DIVERSITY_USED_AS_AUTHORITY");
  }
  return Object.freeze(reasons);
}
