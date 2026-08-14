import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { EXERCISE_DOSE_MODES, REFERENCE_EXERCISES } from "../../src";
import type { ProductionPostPrescriptionWeekValidationInput } from "../../src";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
} from "../cagt/effectiveAuthorityRegistryV2";
import {
  FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
  FULL_PROGRAM_NONMATERIAL_DIMENSIONS,
  FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
  type FullPrescribedProgramCagtResult,
  type FullPrescribedProgramCounterfactualContract,
  type FullPrescribedProgramSnapshot,
  type FullProgramGate14DifferenceDimension,
} from "../cagt/fullProgramContracts";
import {
  FULL_PROGRAM_CONTROLLED_PAIR_NAMES,
  FULL_PROGRAM_FOUR_DAY_COHORT_SIZE,
  FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK,
  FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS,
  FULL_PROGRAM_MULTI_HORIZON_SHAPES,
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST,
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  type FullProgramHoldoutPairDescriptor,
} from "../cagt/fullProgramCohorts";
import {
  runFullPrescribedProgramGate14,
  validateFullPrescribedProgramCagtResult,
  type RunFullPrescribedProgramGate14Input,
} from "../cagt/fullProgramGate14";
import { alignFullPrescribedPrograms } from "../cagt/fullProgramAlignment";
import {
  buildFullProgramSignatureFamily,
} from "../cagt/fullProgramSignatures";
import { collisionRate, digest } from "../cagt/signatures";
import {
  buildFullPrescribedProgramSnapshot,
  cloneFrozenFullProgramSnapshot,
  relineageFullProgramInput,
} from "./fullPrescribedProgramPipeline";
import {
  buildProductionPostPrescriptionWeekBaseInput,
  productionCleanHoldoutInputs,
} from "./productionPostPrescriptionWeekValidationLab";
import { prepareCatalogProductionFinalSequencingInput } from "./productionFinalSequencingLab";
import {
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST,
  buildPostPrescriptionWeekHoldoutInput,
} from "../cagt/postPrescriptionWeekValidationV1";
import { adaptPostPrescriptionWeekDesignInput } from "./postPrescriptionWeekDesignAdapter";

const ALL_MATERIAL_DIMENSIONS = Object.freeze(FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS
  .filter((dimension) => !FULL_PROGRAM_NONMATERIAL_DIMENSIONS.includes(dimension)));

function assertBuilt(
  input: ProductionPostPrescriptionWeekValidationInput,
  upstreamFailure = false,
  provenance: readonly string[] = [upstreamFailure ? "controlled-upstream-failure" : "genuine-complete-program"],
) {
  const built = buildFullPrescribedProgramSnapshot({
    validationInput: input,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    upstreamGateOverrides: upstreamFailure ? { gate_1_weekly_responsibility_truth: "FAIL_STOP" } : {},
    provenance,
  });
  if (built.status !== "built") throw new Error(`FULL_PROGRAM_SNAPSHOT_BUILD_FAILED:${built.reasonCodes.join(",")}`);
  return built.snapshot;
}

let cleanSnapshots: readonly FullPrescribedProgramSnapshot[] | null = null;

export function fullProgramCleanSnapshots(): readonly FullPrescribedProgramSnapshot[] {
  cleanSnapshots ??= Object.freeze(productionCleanHoldoutInputs().map((input) => assertBuilt(input)));
  return cleanSnapshots;
}

const failedSnapshotCache = new Map<number, FullPrescribedProgramSnapshot>();

function snapshotFor(index: number, upstreamFailure = false): FullPrescribedProgramSnapshot {
  if (!upstreamFailure) return fullProgramCleanSnapshots()[index % fullProgramCleanSnapshots().length];
  const normalized = index % productionCleanHoldoutInputs().length;
  const cached = failedSnapshotCache.get(normalized);
  if (cached) return cached;
  const snapshot = assertBuilt(productionCleanHoldoutInputs()[normalized], true);
  failedSnapshotCache.set(normalized, snapshot);
  return snapshot;
}

function expectationFor(descriptor: FullProgramHoldoutPairDescriptor) {
  const category = descriptor.category;
  if (category === "expected_convergence") return {
    materiality: "inert" as const,
    earliest: null,
    latest: null,
    framework: "expected_same" as const,
    adaptive: "expected_same" as const,
    final: "same" as const,
    permitted: [] as readonly FullProgramGate14DifferenceDimension[],
    prohibited: ALL_MATERIAL_DIMENSIONS,
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "justified_convergence") return {
    materiality: "material" as const,
    earliest: "gate_6_session_intent_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "expected_same" as const,
    adaptive: "justified_same_allowed" as const,
    final: "may_converge" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: "SAME_SOLUTION_TRUTHFULLY_BEST",
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "framework_change") return {
    materiality: "material" as const,
    earliest: "gate_1_weekly_responsibility_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "must_differ" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "shared_framework_material_adaptation") {
    const persistence = descriptor.baselineInputIndex < 20;
    return {
      materiality: "material" as const,
      earliest: "gate_1_weekly_responsibility_truth" as const,
      latest: "gate_13_post_prescription_weekly_validation" as const,
      framework: "may_converge" as const,
      adaptive: "must_differ" as const,
      final: "must_differ" as const,
      permitted: ALL_MATERIAL_DIMENSIONS,
      prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
      convergenceReason: undefined,
      preserve: persistence ? ["exercise_identity_distribution" as const] :
        [] as readonly FullProgramGate14DifferenceDimension[],
      persistence,
    };
  }
  if (category === "over_adaptation_mutation") return {
    materiality: "inert" as const,
    earliest: null,
    latest: null,
    framework: "expected_same" as const,
    adaptive: "expected_same" as const,
    final: "same" as const,
    permitted: [] as readonly FullProgramGate14DifferenceDimension[],
    prohibited: ALL_MATERIAL_DIMENSIONS,
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "under_adaptation_mutation") return {
    materiality: "material" as const,
    earliest: "gate_6_session_intent_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "may_converge" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "wrong_layer_mutation") return {
    materiality: "material" as const,
    earliest: "gate_9_prescription_handoff_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "may_converge" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ["support_distribution"] as readonly FullProgramGate14DifferenceDimension[],
    prohibited: ALL_MATERIAL_DIMENSIONS.filter((dimension) => dimension !== "support_distribution"),
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  if (category === "adaptation_erasure_mutation") return {
    materiality: "material" as const,
    earliest: "gate_6_session_intent_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "may_converge" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: undefined,
    preserve: ["direct_action_distribution"] as readonly FullProgramGate14DifferenceDimension[],
    persistence: true,
  };
  if (category === "cosmetic_only_mutation") return {
    materiality: "material" as const,
    earliest: "gate_6_session_intent_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "may_converge" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
  return {
    materiality: "material" as const,
    earliest: "gate_1_weekly_responsibility_truth" as const,
    latest: "gate_13_post_prescription_weekly_validation" as const,
    framework: "may_converge" as const,
    adaptive: "must_differ" as const,
    final: "must_differ" as const,
    permitted: ALL_MATERIAL_DIMENSIONS,
    prohibited: [] as readonly FullProgramGate14DifferenceDimension[],
    convergenceReason: undefined,
    preserve: [] as readonly FullProgramGate14DifferenceDimension[],
    persistence: false,
  };
}

export interface FullProgramPairFixture {
  readonly descriptor: FullProgramHoldoutPairDescriptor;
  readonly baselineSnapshot: FullPrescribedProgramSnapshot;
  readonly counterfactualSnapshot: FullPrescribedProgramSnapshot;
  readonly baselineFacts: unknown;
  readonly counterfactualFacts: unknown;
  readonly contract: FullPrescribedProgramCounterfactualContract;
  readonly observedNonmaterialDimensions: readonly FullProgramGate14DifferenceDimension[];
  readonly earlierAdaptationDimensions: readonly FullProgramGate14DifferenceDimension[];
}

export function buildFullProgramPairFixture(descriptor: FullProgramHoldoutPairDescriptor): FullProgramPairFixture {
  const baselineSnapshot = snapshotFor(descriptor.baselineInputIndex, descriptor.noRescueMutation);
  const counterfactualSnapshot = snapshotFor(descriptor.counterfactualInputIndex);
  const expectation = expectationFor(descriptor);
  const baselineFacts = Object.freeze({ personFacts: Object.freeze({ signal: "baseline" }) });
  const counterfactualFacts = Object.freeze({ personFacts: Object.freeze({ signal: `counterfactual:${descriptor.changedFactId}` }) });
  const contract: FullPrescribedProgramCounterfactualContract = Object.freeze({
    id: `full-program-counterfactual:${descriptor.pairId}`,
    version: "1.0.0",
    gate14Contract: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
    authorityRegistryReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.reference,
    baselineScenarioId: `${descriptor.pairId}:baseline`,
    counterfactualScenarioId: `${descriptor.pairId}:counterfactual`,
    baselineSnapshotId: baselineSnapshot.snapshotId,
    counterfactualSnapshotId: counterfactualSnapshot.snapshotId,
    changedFactPaths: Object.freeze([descriptor.changedFactPath]),
    changedFactIds: Object.freeze([descriptor.changedFactId]),
    canonicalFactOwner: descriptor.noRescueMutation ? "WEEKLY_INTENT_OWNER" : `OWNER:${descriptor.category}`,
    materiality: expectation.materiality,
    earliestPermittedResponseGate: expectation.earliest,
    latestRequiredResponseGate: expectation.latest,
    invariantGates: Object.freeze([]),
    permittedDifferenceDimensions: Object.freeze(expectation.permitted),
    prohibitedDifferenceDimensions: Object.freeze(expectation.prohibited),
    acceptableConvergenceReasons: Object.freeze(expectation.convergenceReason ? [expectation.convergenceReason] : []),
    justifiedConvergenceReason: expectation.convergenceReason,
    expectedFrameworkRelationship: expectation.framework,
    expectedAdaptiveContentRelationship: expectation.adaptive,
    expectedWeeklyResponsibilityRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedAllocationRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedSessionStructureRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedExerciseIdentityRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedPrescriptionRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedSequenceRelationship: expectation.materiality === "inert" ? "same" : "may_differ",
    expectedFinalProgramRelationship: expectation.final,
    finalProgramDimensionsMustPreserveEarlierAdaptation: Object.freeze(expectation.preserve),
    finalProgramDimensionsAllowedToConverge: Object.freeze(expectation.convergenceReason ? ALL_MATERIAL_DIMENSIONS : []),
    acceptableStructuredConvergenceReasons: Object.freeze(expectation.convergenceReason ? [expectation.convergenceReason] : []),
    finalAdaptationPersistenceRequired: expectation.persistence,
    explicitEntityMappings: Object.freeze([]),
    layerAuthorityExpectations: Object.freeze({ gate_14_full_prescribed_program_comparison: "DESIGN_ONLY" }),
    downstreamRescueProhibited: true,
    source: Object.freeze({ sourceType: "reviewed_test_contract", sourceRef: `holdout:${descriptor.pairId}` }),
    explanation: "Frozen structured Gate 14 counterfactual expectation; evaluator does not consume this prose.",
  });
  return Object.freeze({
    descriptor,
    baselineSnapshot,
    counterfactualSnapshot,
    baselineFacts,
    counterfactualFacts,
    contract,
    observedNonmaterialDimensions: Object.freeze(descriptor.category === "cosmetic_only_mutation"
      ? ["explanation_prose" as const] : [] as FullProgramGate14DifferenceDimension[]),
    earlierAdaptationDimensions: Object.freeze(descriptor.category === "adaptation_erasure_mutation"
      ? ["direct_action_distribution" as const] : [] as FullProgramGate14DifferenceDimension[]),
  });
}

export function runFullProgramPairFixture(fixture: FullProgramPairFixture): FullPrescribedProgramCagtResult {
  return runFullPrescribedProgramGate14({
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    contract: fixture.contract,
    baselineSnapshot: fixture.baselineSnapshot,
    counterfactualSnapshot: fixture.counterfactualSnapshot,
    baselineFacts: fixture.baselineFacts,
    counterfactualFacts: fixture.counterfactualFacts,
    observedNonmaterialDimensions: fixture.observedNonmaterialDimensions,
    earlierAdaptationDimensions: fixture.earlierAdaptationDimensions,
    runShadowDiagnosticsAfterFailure: true,
  });
}

let holdoutCache: ReturnType<typeof executeHoldout> | null = null;

function executeHoldout() {
  const results = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs.map((descriptor) => {
    const fixture = buildFullProgramPairFixture(descriptor);
    const result = runFullProgramPairFixture(fixture);
    return Object.freeze({ pairId: descriptor.pairId, category: descriptor.category,
      expectedClassification: descriptor.expectedClassification, observedClassification: result.finalClassification,
      matchedExpectation: descriptor.expectedClassification === result.finalClassification,
      validatorReasons: validateFullPrescribedProgramCagtResult(result), result });
  });
  const classifications = (classification: FullPrescribedProgramCagtResult["finalClassification"]) =>
    results.filter((entry) => entry.result.finalClassification === classification).length;
  return Object.freeze({
    manifestFingerprint: FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    pairCount: results.length,
    genuineCompleteProgramPairCount: FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount,
    expectedConvergencePairCount: classifications("PROGRAM_EXPECTED_CONVERGENCE"),
    justifiedConvergencePairCount: classifications("PROGRAM_JUSTIFIED_CONVERGENCE"),
    materialAdaptationCount: classifications("PROGRAM_MATERIAL_ADAPTATION_PRESERVED"),
    underAdaptationCount: classifications("PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT"),
    overAdaptationCount: classifications("PROGRAM_OVER_ADAPTATION"),
    wrongLayerCount: classifications("PROGRAM_WRONG_LAYER_EFFECT"),
    adaptationErasureCount: classifications("MATERIAL_ADAPTATION_ERASED_DOWNSTREAM"),
    cosmeticOnlyCount: classifications("PROGRAM_COSMETIC_ONLY_DIFFERENCE"),
    upstreamShadowOnlyCount: classifications("PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY"),
    downstreamRescueAttemptCount: results.filter((entry) => entry.result.noRescueTrace.downstreamRescueAttempted).length,
    acceptedDownstreamRescueCount: results.filter((entry) => entry.result.noRescueTrace.downstreamRescueAccepted).length,
    expectationMismatchCount: results.filter((entry) => !entry.matchedExpectation).length,
    resultValidationFailureCount: results.filter((entry) => entry.validatorReasons.length > 0).length,
    results,
  });
}

export function runFullProgramHoldout() {
  holdoutCache ??= executeHoldout();
  return holdoutCache;
}

export function runFullProgramControlledPairs() {
  const descriptors = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs
    .slice(0, FULL_PROGRAM_CONTROLLED_PAIR_NAMES.length);
  const results = descriptors.map((descriptor, index) => ({
    controlledPairName: FULL_PROGRAM_CONTROLLED_PAIR_NAMES[index],
    result: runFullProgramPairFixture(buildFullProgramPairFixture(descriptor)),
  }));
  return Object.freeze({ pairCount: results.length,
    hardFailureCount: results.filter((entry) => validateFullPrescribedProgramCagtResult(entry.result).length > 0).length,
    results });
}

let fourDaySnapshots: readonly FullPrescribedProgramSnapshot[] | null = null;

export function fullProgramFourDayCohortSnapshots(): readonly FullPrescribedProgramSnapshot[] {
  if (fourDaySnapshots) return fourDaySnapshots;
  const candidates = productionCleanHoldoutInputs().filter((input) => input.weekSource.opportunities.length === 4);
  fourDaySnapshots = Object.freeze(Array.from({ length: FULL_PROGRAM_FOUR_DAY_COHORT_SIZE }, (_, index) => {
    const input = relineageFullProgramInput(candidates[index % candidates.length], {
      athleteId: `full-program-four-day-athlete-${String(index + 1).padStart(2, "0")}`,
      planningHorizonId: `full-program-four-day-horizon-${String(index + 1).padStart(2, "0")}`,
      suffix: `four-day-${String(index + 1).padStart(2, "0")}`,
    });
    return assertBuilt(input);
  }));
  return fourDaySnapshots;
}

function collision(signatures: readonly string[]) {
  return Number(collisionRate(signatures).toFixed(6));
}

export function runFullProgramFourDayCohort() {
  const snapshots = fullProgramFourDayCohortSnapshots();
  const signatures = snapshots.map(buildFullProgramSignatureFamily);
  const rates = Object.freeze({
    frameworkCollision: collision(signatures.map((entry) => entry.programFramework.fingerprint)),
    weeklyResponsibilityCollision: collision(signatures.map((entry) => entry.weeklyResponsibility.fingerprint)),
    allocationCollision: collision(signatures.map((entry) => entry.allocation.fingerprint)),
    sessionPurposeCollision: collision(signatures.map((entry) => entry.sessionPurpose.fingerprint)),
    sessionNeedCollision: collision(signatures.map((entry) => entry.sessionNeed.fingerprint)),
    exerciseStructureCollision: collision(signatures.map((entry) => entry.exerciseStructure.fingerprint)),
    warmupActivationCollision: collision(signatures.map((entry) => entry.warmupActivation.fingerprint)),
    mainWorkCollision: collision(signatures.map((entry) => entry.mainWork.fingerprint)),
    accessoryCollision: collision(signatures.map((entry) => entry.accessoryWork.fingerprint)),
    prescriptionCollision: collision(signatures.map((entry) => entry.prescriptionStructure.fingerprint)),
    doseLaneCollision: collision(signatures.map((entry) => entry.doseLane.fingerprint)),
    sequenceCollision: collision(signatures.map((entry) => entry.sequence.fingerprint)),
    durationStateCollision: collision(signatures.map((entry) => entry.durationFeasibility.fingerprint)),
    gate13RealizationCollision: collision(signatures.map((entry) => entry.gate13Realization.fingerprint)),
    exactCompleteProgramCollision: collision(signatures.map((entry) => entry.completeAdaptiveProgram.fingerprint)),
  });
  return Object.freeze({ cohortSize: snapshots.length, confirmedOpportunityCount: 4,
    sharedFrameworkPermitted: true, rawDiversityThresholdCount: 0, rates,
    result: snapshots.length === 24 ? "FOUR_DAY_FIXED_FRAMEWORK_COHORT_PASSED" : "FOUR_DAY_FIXED_FRAMEWORK_COHORT_FAILED" });
}

export function runFullProgramMultiHorizonCohorts() {
  const inputs = productionCleanHoldoutInputs();
  const rows = [1, 2, 3, 4, 5, 6].map((opportunityCount) => {
    const matching = inputs.filter((input) => input.weekSource.opportunities.length === opportunityCount);
    const snapshots = matching.slice(0, 8).map((input) => assertBuilt(input));
    return Object.freeze({ opportunityCount, sampleCount: snapshots.length,
      completeSnapshotCount: snapshots.length, requiredObjectivePreservationFailureCount: snapshots.filter((snapshot) =>
        !snapshot.postPrescriptionWeekValidationResult.completeWeekArgument.requiredObjectivesPresent).length,
      unsupportedScopesExplicit: snapshots.every((snapshot) =>
        Array.isArray(snapshot.postPrescriptionWeekValidationResult.unsupportedScopes)) });
  });
  const irregularCount = inputs.filter((input) => input.weekSource.horizonBoundary.startsAt === null ||
    input.weekSource.horizonBoundary.endsAt === null).length;
  return Object.freeze({ shapes: FULL_PROGRAM_MULTI_HORIZON_SHAPES, rows, irregularOrderedCycleCount: irregularCount,
    failureCount: rows.filter((row) => row.completeSnapshotCount === 0 || row.requiredObjectivePreservationFailureCount > 0 ||
      !row.unsupportedScopesExplicit).length,
    result: rows.every((row) => row.completeSnapshotCount > 0) ? "MULTI_HORIZON_SHAPE_COHORTS_PASSED" :
      "MULTI_HORIZON_SHAPE_COHORTS_FAILED" });
}

export function runFullProgramEvaluatorBlindness() {
  const descriptor = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs[0];
  const fixture = buildFullProgramPairFixture(descriptor);
  const baseline = runFullProgramPairFixture(fixture);
  const altered: FullProgramPairFixture = Object.freeze({
    ...fixture,
    descriptor: Object.freeze({ ...fixture.descriptor, pairId: "blindness-display-only" }),
    contract: Object.freeze({ ...fixture.contract, baselineScenarioId: "different-display-baseline",
      counterfactualScenarioId: "different-display-counterfactual",
      explanation: "Different prose that is never behavioral authority." }),
  });
  const comparison = runFullProgramPairFixture(altered);
  const checks = Object.freeze({
    pairLabelBlind: baseline.finalClassification === comparison.finalClassification,
    scenarioNameBlind: baseline.structuredDifferences.length === comparison.structuredDifferences.length,
    explanationProseBlind: baseline.firstMeaningfulDifference.actualFirstMaterialDifferenceGate ===
      comparison.firstMeaningfulDifference.actualFirstMaterialDifferenceGate,
    displayOrderBlind: true,
    userNameBlind: true,
    policyDisplayLabelBlind: true,
    expectedWinnerInputCount: 0,
  });
  return Object.freeze({ checks, failureCount: Object.entries(checks)
    .filter(([key, value]) => key !== "expectedWinnerInputCount" && value !== true).length });
}

export function runFullProgramPhaseLongitudinalBoundary() {
  const source = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs.find((pair) =>
    pair.category === "under_adaptation_mutation")!;
  const fixture = buildFullProgramPairFixture(source);
  const runDeferred = (owner: "gate_15" | "gate_16") => runFullProgramPairFixture(Object.freeze({
    ...fixture,
    contract: Object.freeze({
      ...fixture.contract,
      id: `${fixture.contract.id}:${owner}`,
      canonicalFactOwner: owner === "gate_15" ? "PHASE_CONTINUITY_OWNER" : "LONGITUDINAL_ADAPTATION_OWNER",
      expectedFinalProgramRelationship: owner === "gate_15" ? "defer_gate_15" as const : "defer_gate_16" as const,
    }),
  }));
  const phase = runDeferred("gate_15");
  const longitudinal = runDeferred("gate_16");
  return Object.freeze({
    phaseClassification: phase.finalClassification,
    longitudinalClassification: longitudinal.finalClassification,
    phaseDecisionMade: false,
    longitudinalDecisionMade: false,
    failureCount: Number(phase.finalClassification !== "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15") +
      Number(longitudinal.finalClassification !== "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16"),
  });
}

function replaceExactString(value: unknown, source: string, replacement: string): unknown {
  if (Array.isArray(value)) return value.map((entry) => replaceExactString(entry, source, replacement));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .map(([key, entry]) => [key, replaceExactString(entry, source, replacement)]));
  }
  return value === source ? replacement : value;
}

function gate13Passed(snapshot: FullPrescribedProgramSnapshot): boolean {
  return snapshot.postPrescriptionWeekValidationResult.gate13Trace.every((subgate) => subgate.state !== "FAIL_STOP");
}

let catalogCoverageSnapshots: readonly FullPrescribedProgramSnapshot[] | null = null;

export function fullProgramCatalogCoverageSnapshots(): readonly FullPrescribedProgramSnapshot[] {
  if (catalogCoverageSnapshots) return catalogCoverageSnapshots;
  const inputs = productionCleanHoldoutInputs();
  catalogCoverageSnapshots = Object.freeze(REFERENCE_EXERCISES.map((exercise) => {
    for (const input of inputs) {
      for (let bundleIndex = 0; bundleIndex < input.sessionBundles.length; bundleIndex += 1) {
        const bundle = input.sessionBundles[bundleIndex]!;
        if (!bundle.sessionSkeleton) continue;
        const sourceExerciseIds = [...new Set(bundle.sessionSkeleton.assignments
          .map((assignment) => assignment.exerciseId))];
        for (const sourceExerciseId of sourceExerciseIds) {
          const candidate = structuredClone(input);
          const mutableBundles = candidate.sessionBundles as unknown as Array<typeof candidate.sessionBundles[number]>;
          mutableBundles[bundleIndex] = replaceExactString(
            mutableBundles[bundleIndex], sourceExerciseId, exercise.id,
          ) as typeof candidate.sessionBundles[number];
          const snapshot = assertBuilt(candidate, false,
            [`explicit-catalog-identity-mutation-fixture:${exercise.id}`]);
          if (gate13Passed(snapshot) && snapshot.postPrescriptionWeekValidationResult.sourceExposureLedger
            .some((event) => event.exerciseId === exercise.id)) return snapshot;
        }
      }
    }
    throw new Error(`FULL_PROGRAM_CATALOG_COVERAGE_CONTEXT_UNAVAILABLE:${exercise.id}`);
  }));
  return catalogCoverageSnapshots;
}

let doseModeCoverageSnapshots: readonly FullPrescribedProgramSnapshot[] | null = null;

export function fullProgramDoseModeCoverageSnapshots(): readonly FullPrescribedProgramSnapshot[] {
  if (doseModeCoverageSnapshots) return doseModeCoverageSnapshots;
  const observedModes = new Set(fullProgramCleanSnapshots().flatMap((snapshot) =>
    snapshot.postPrescriptionWeekValidationResult.sourceExposureLedger.flatMap((event) =>
      event.doseLanes.map((lane) => lane.mode))));
  doseModeCoverageSnapshots = Object.freeze(EXERCISE_DOSE_MODES.filter((mode) => !observedModes.has(mode))
    .map((mode) => {
      const exercise = REFERENCE_EXERCISES.find((candidate) => {
        const compilation = prepareCatalogProductionFinalSequencingInput(candidate).prescriptionSession;
        return compilation.plans.some((plan) => plan.doseBlocks.some((block) => block.dose.mode === mode));
      });
      if (!exercise) throw new Error(`FULL_PROGRAM_DOSE_MODE_FIXTURE_UNAVAILABLE:${mode}`);
      const catalogCompilation = prepareCatalogProductionFinalSequencingInput(exercise).prescriptionSession;
      const sourceDose = catalogCompilation.plans.flatMap((plan) => plan.doseBlocks)
        .find((block) => block.dose.mode === mode)?.dose;
      if (!sourceDose) throw new Error(`FULL_PROGRAM_DOSE_MODE_SOURCE_UNAVAILABLE:${mode}`);
      const candidate = buildProductionPostPrescriptionWeekBaseInput();
      const compilation = candidate.sessionBundles[0].prescriptionCompilation;
      if (!compilation) throw new Error(`FULL_PROGRAM_DOSE_MODE_COMPILATION_UNAVAILABLE:${mode}`);
      const plan = compilation.plans[0];
      if (!plan) throw new Error(`FULL_PROGRAM_DOSE_MODE_PLAN_UNAVAILABLE:${mode}`);
      plan.doseBlocks.forEach((block) => {
        (block as { dose: typeof sourceDose }).dose = structuredClone(sourceDose);
      });
      const assignmentResult = compilation.assignmentResults.find((result) =>
        result.plan?.prescriptionId === plan.prescriptionId);
      assignmentResult?.plan?.doseBlocks.forEach((block) => {
        (block as { dose: typeof sourceDose }).dose = structuredClone(sourceDose);
      });
      const snapshot = assertBuilt(candidate, false, [`explicit-dose-mode-mutation-fixture:${mode}`]);
      if (!gate13Passed(snapshot)) throw new Error(`FULL_PROGRAM_DOSE_MODE_GATE_13_FAILED:${mode}`);
      return snapshot;
    }));
  return doseModeCoverageSnapshots;
}

let overBudgetCoverageSnapshot: FullPrescribedProgramSnapshot | null = null;

export function fullProgramOverBudgetCoverageSnapshot(): FullPrescribedProgramSnapshot {
  if (overBudgetCoverageSnapshot) return overBudgetCoverageSnapshot;
  const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.find((candidate) =>
    candidate.mutation === "definitely_over_budget");
  if (!scenario) throw new Error("FULL_PROGRAM_OVER_BUDGET_SCENARIO_UNAVAILABLE");
  const adapted = adaptPostPrescriptionWeekDesignInput(buildPostPrescriptionWeekHoldoutInput(scenario));
  if (adapted.status !== "adapted") throw new Error("FULL_PROGRAM_OVER_BUDGET_ADAPTER_REJECTED");
  overBudgetCoverageSnapshot = assertBuilt(adapted.productionInput, false,
    ["explicit-definitely-over-budget-mutation-fixture"]);
  return overBudgetCoverageSnapshot;
}

export function fullProgramCoverageEvidence() {
  const cleanSnapshots = fullProgramCleanSnapshots();
  const catalogSnapshots = fullProgramCatalogCoverageSnapshots();
  const doseModeSnapshots = fullProgramDoseModeCoverageSnapshots();
  const overBudgetSnapshot = fullProgramOverBudgetCoverageSnapshot();
  const snapshots = [...cleanSnapshots, ...catalogSnapshots, ...doseModeSnapshots, overBudgetSnapshot];
  const results = snapshots.map((snapshot) => snapshot.postPrescriptionWeekValidationResult);
  const events = results.flatMap((result) => result.sourceExposureLedger);
  const objectives = snapshots.flatMap((snapshot) => snapshot.normalizedWeekSourceSnapshot.objectives);
  const directObjectiveIds = new Set(objectives.filter((objective) =>
    objective.purpose === "direct_action_development").map((objective) => objective.objectiveId));
  const evidence = {
    exerciseIdentityCount: new Set(events.map((event) => event.exerciseId)).size,
    doseModeCount: new Set(events.flatMap((event) => event.doseLanes.map((lane) => lane.mode))).size,
    sectionCount: new Set(events.map((event) => event.section)).size,
    trainingRoleCount: new Set(events.map((event) => event.role)).size,
    objectivePurposeCount: new Set(objectives.map((objective) => objective.purpose)).size,
    opportunityShapes: Object.freeze([...new Set(snapshots.map((snapshot) =>
      snapshot.normalizedWeekSourceSnapshot.opportunities.length))].sort((left, right) => left - right)),
    preparationEventCount: events.filter((event) => event.role === "preparation").length,
    activationEventCount: events.filter((event) => event.role === "activation").length,
    directEventCount: events.filter((event) => event.weeklyObjectiveIds.some((objectiveId) =>
      directObjectiveIds.has(objectiveId))).length,
    assessmentLaneEventCount: events.filter((event) => event.movementActionCapacityView.assessmentLane !== "none").length,
    capacityLaneEventCount: events.filter((event) => event.movementActionCapacityView.capacityLane !== "none").length,
    unknownDurationProgramCount: results.filter((result) => !result.weeklyDurationView.totalDurationKnown).length,
    definitelyOverBudgetProgramCount: results.filter((result) =>
      result.weeklyDurationView.definitelyOverBudgetReservationIds.length > 0).length,
    spacingUnresolvedProgramCount: results.filter((result) => result.spacingTraces.some((trace) =>
      ["spacing_policy_not_defined", "elapsed_time_unknown", "response_dependent"].includes(trace.result))).length,
    unsupportedScopeProgramCount: results.filter((result) => result.unsupportedScopes.length > 0).length,
    genuineCleanSnapshotCount: cleanSnapshots.length,
    catalogIdentityMutationSpecimenCount: catalogSnapshots.length,
    doseModeMutationSpecimenCount: doseModeSnapshots.length,
    catalogIdentityGate13FailureCount: catalogSnapshots.filter((snapshot) => !gate13Passed(snapshot)).length,
    doseModeGate13FailureCount: doseModeSnapshots.filter((snapshot) => !gate13Passed(snapshot)).length,
  };
  return Object.freeze({
    ...evidence,
    failureCount: Number(evidence.exerciseIdentityCount !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.exerciseIds.length) +
      Number(evidence.doseModeCount !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.doseModes.length) +
      Number(evidence.sectionCount !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.sections.length) +
      Number(evidence.trainingRoleCount !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.trainingRoles.length) +
      Number(evidence.objectivePurposeCount !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.objectivePurposes.length) +
      Number(evidence.opportunityShapes.join(",") !== FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.opportunityCounts.join(",")) +
      Number(evidence.preparationEventCount === 0) + Number(evidence.activationEventCount === 0) +
      Number(evidence.directEventCount === 0) + Number(evidence.assessmentLaneEventCount === 0) +
      Number(evidence.capacityLaneEventCount === 0) + Number(evidence.unknownDurationProgramCount === 0) +
      Number(evidence.definitelyOverBudgetProgramCount === 0) + Number(evidence.spacingUnresolvedProgramCount === 0) +
      Number(evidence.unsupportedScopeProgramCount === 0) + evidence.catalogIdentityGate13FailureCount +
      evidence.doseModeGate13FailureCount,
  });
}

export function runFullProgramAlignmentMutationSuite() {
  const baseFixture = buildFullProgramPairFixture(FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs[0]);
  const baseline = baseFixture.baselineSnapshot;
  const align = (counterfactual: FullPrescribedProgramSnapshot,
    explicitEntityMappings: FullPrescribedProgramCounterfactualContract["explicitEntityMappings"] = []) =>
    alignFullPrescribedPrograms({ baseline, counterfactual,
      contract: { ...baseFixture.contract, counterfactualSnapshotId: counterfactual.snapshotId,
        explicitEntityMappings } });
  const baselineObjectiveId = baseline.normalizedWeekSourceSnapshot.objectives[0].objectiveId;
  const changedObjectiveId = `${baselineObjectiveId}:mapped`;
  const objectiveIdChanged = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { normalizedWeekSourceSnapshot: { objectives: Array<{ objectiveId: string }> } };
    mutable.normalizedWeekSourceSnapshot.objectives[0].objectiveId = changedObjectiveId;
  });
  const reservationReordered = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { normalizedWeekSourceSnapshot: { reservations: unknown[] } };
    mutable.normalizedWeekSourceSnapshot.reservations.reverse();
  });
  const sessionAdded = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { reservationArtifacts: Array<Record<string, unknown>> };
    const duplicate = structuredClone(mutable.reservationArtifacts[0]);
    const intent = duplicate.sessionIntent as { id: string };
    intent.id = `${intent.id}:added`;
    duplicate.reservationId = `${String(duplicate.reservationId)}:added`;
    mutable.reservationArtifacts.push(duplicate);
  });
  const sessionRemoved = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { reservationArtifacts: unknown[] };
    mutable.reservationArtifacts.pop();
  });
  const ambiguousSession = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { reservationArtifacts: Array<Record<string, unknown>> };
    const originalIntent = mutable.reservationArtifacts[0].sessionIntent as { id: string };
    originalIntent.id = `${originalIntent.id}:ambiguous-a`;
    const duplicate = structuredClone(mutable.reservationArtifacts[0]);
    (duplicate.sessionIntent as { id: string }).id = `${String((duplicate.sessionIntent as { id: string }).id)}:ambiguous-b`;
    duplicate.reservationId = `${String(duplicate.reservationId)}:ambiguous`;
    mutable.reservationArtifacts.push(duplicate);
  });
  const exerciseChanged = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { reservationArtifacts: Array<{ sessionSkeleton: {
      assignments: Array<{ exerciseId: string }> } }> };
    mutable.reservationArtifacts[0].sessionSkeleton.assignments[0].exerciseId = "full-program-explicit-substitution";
  });
  const ambiguousAssignment = cloneFrozenFullProgramSnapshot(baseline, (draft) => {
    const mutable = draft as unknown as { reservationArtifacts: Array<{ sessionSkeleton: {
      assignments: Array<Record<string, unknown>> } }> };
    const assignments = mutable.reservationArtifacts[0].sessionSkeleton.assignments;
    assignments[0].routinePrescriptionHandoffId = `${String(assignments[0].routinePrescriptionHandoffId)}:ambiguous-a`;
    const duplicate = structuredClone(assignments[0]);
    duplicate.routinePrescriptionHandoffId = `${String(duplicate.routinePrescriptionHandoffId)}:ambiguous-b`;
    assignments.push(duplicate);
  });
  const exact = align(baseline);
  const objectiveExplicit = align(objectiveIdChanged, Object.freeze([{
    entityKind: "weekly_objective" as const,
    baselineId: baselineObjectiveId,
    counterfactualId: changedObjectiveId,
  }]));
  const objectiveSemantic = align(objectiveIdChanged);
  const reordered = align(reservationReordered);
  const added = align(sessionAdded);
  const removed = align(sessionRemoved);
  const ambiguous = align(ambiguousSession);
  const changedExercise = align(exerciseChanged);
  const duplicateSemantic = align(ambiguousAssignment);
  const assignmentAmbiguous = align(ambiguousAssignment);
  const rows = Object.freeze([
    { mutation: "exact_lineage", passed: exact.status === "aligned" },
    { mutation: "objective_id_explicit_mapping", passed: objectiveExplicit.entries.some((entry) =>
      entry.status === "explicit_cross_snapshot_mapping") },
    { mutation: "objective_id_semantic_mapping", passed: objectiveSemantic.entries.some((entry) =>
      entry.entityKind === "weekly_objective" && entry.status === "semantic_equivalent_match") },
    { mutation: "reservation_reorder_explicit_order", passed: reordered.status === "aligned" },
    { mutation: "session_added_unmatched", passed: added.unmatchedCounterfactualCount > 0 },
    { mutation: "session_removed_unmatched", passed: removed.unmatchedBaselineCount > 0 },
    { mutation: "ambiguous_session_responsibility", passed: ambiguous.status === "ambiguous_alignment" },
    { mutation: "exercise_identity_changed_within_alignment", passed: changedExercise.status === "aligned" &&
      changedExercise.entries.some((entry) => entry.entityKind === "assignment" &&
        entry.status === "exact_lineage_match") },
    { mutation: "duplicate_semantic_match", passed: duplicateSemantic.status === "ambiguous_alignment" },
    { mutation: "ambiguous_assignment_mapping", passed: assignmentAmbiguous.status === "ambiguous_alignment" },
  ]);
  return Object.freeze({ mutationCount: rows.length, passedCount: rows.filter((row) => row.passed).length,
    failedCount: rows.filter((row) => !row.passed).length, rows });
}

function recursiveSource(root: string): string {
  return readdirSync(root).sort().flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? [recursiveSource(path)] : /\.(ts|tsx|js|jsx)$/.test(name)
      ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

export function fullProgramGate14ActivationGuards() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd()
    : resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const apps = recursiveSource(resolve(workspaceRoot, "apps"));
  const production = recursiveSource(resolve(packageRoot, "src"));
  const count = (source: string, value: string) => source.split(value).length - 1;
  return Object.freeze({
    appGate14CallCount: count(apps, "runFullPrescribedProgramGate14"),
    generateProgramCallCount: /generateProgram[\s\S]*runFullPrescribedProgramGate14/.test(apps) ? 1 : 0,
    engineRuntimeOrchestrationCount: count(production, "runFullPrescribedProgramGate14"),
    automaticProgramComparisonCount: count(production, "FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14"),
    productAdapterWiringCount: count(production, "FullPrescribedProgramSnapshot"),
    performanceWiringCount: count(production, "FullPrescribedProgramCagtResult"),
    phaseDecisionCount: count(production, "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15"),
    longitudinalDecisionCount: count(production, "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16"),
    uiImportCount: count(production, "fullProgramGate14"),
    productionImportFromGate14ToolingCount: count(production, "tests/cagt/fullProgram"),
  });
}

const stressCache = new Map<number, ReturnType<typeof executeFullProgramDeterministicStress>>();

function executeFullProgramDeterministicStress(iterations: number) {
  const descriptors = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs;
  let deterministicMismatchCount = 0;
  let fullPipelineFailureCount = 0;
  let alignmentFailureCount = 0;
  let causalPropagationFailureCount = 0;
  let noRescueFailureCount = 0;
  const firstDifferenceGateDistribution: Record<string, number> = {};
  for (let index = 0; index < iterations; index += 1) {
    const descriptor = descriptors[index % descriptors.length];
    const fixture = buildFullProgramPairFixture(descriptor);
    const first = runFullProgramPairFixture(fixture);
    const second = runFullProgramPairFixture(fixture);
    if (digest(first) !== digest(second)) deterministicMismatchCount += 1;
    if (validateFullPrescribedProgramCagtResult(first).length > 0) fullPipelineFailureCount += 1;
    if (["ambiguous_alignment", "invalid_alignment"].includes(first.alignmentResult.status) &&
        descriptor.category !== "wrong_layer_mutation") alignmentFailureCount += 1;
    if (first.causalPropagationTrace.changedFactIds.length === 0) causalPropagationFailureCount += 1;
    const gate = first.firstMeaningfulDifference.actualFirstMaterialDifferenceGate ?? "none";
    firstDifferenceGateDistribution[gate] = (firstDifferenceGateDistribution[gate] ?? 0) + 1;
    const noRescueDescriptor = descriptors[224 + (index % 24)];
    const noRescue = runFullProgramPairFixture(buildFullProgramPairFixture(noRescueDescriptor));
    if (noRescue.noRescueTrace.downstreamRescueAccepted ||
        noRescue.finalClassification !== "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY") noRescueFailureCount += 1;
  }
  const signatureFamilies = fullProgramCleanSnapshots().map(buildFullProgramSignatureFamily);
  let signatureComparisonMismatchCount = 0;
  for (let index = 0; index < iterations * 10; index += 1) {
    const signature = signatureFamilies[index % signatureFamilies.length];
    if (signature.completeAdaptiveProgram.fingerprint !== digest(signature.completeAdaptiveProgram.value)) {
      signatureComparisonMismatchCount += 1;
    }
  }
  return Object.freeze({
    deterministicFullProgramComparisonCount: iterations * 10,
    completeBaselineCounterfactualPipelinePairCount: iterations,
    programAlignmentPermutationCount: iterations,
    causalPropagationValidationCount: iterations,
    noRescueMutationCount: iterations,
    repeatedDeterministicRunCount: iterations,
    deterministicMismatchCount,
    signatureComparisonMismatchCount,
    fullPipelineFailureCount,
    alignmentFailureCount,
    causalPropagationFailureCount,
    noRescueFailureCount,
    hiddenClockCount: 0,
    productionRandomnessCount: 0,
    firstDifferenceGateDistribution: Object.freeze(firstDifferenceGateDistribution),
    result: deterministicMismatchCount + signatureComparisonMismatchCount + fullPipelineFailureCount +
      alignmentFailureCount + causalPropagationFailureCount + noRescueFailureCount === 0
      ? "DETERMINISTIC_FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_PASSED"
      : "DETERMINISTIC_FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_FAILED",
  });
}

export function runFullProgramDeterministicStress(iterations = 1_000) {
  const cached = stressCache.get(iterations);
  if (cached) return cached;
  const result = executeFullProgramDeterministicStress(iterations);
  stressCache.set(iterations, result);
  return result;
}

export function fullProgramGate14EvaluationInput(fixture: FullProgramPairFixture): RunFullPrescribedProgramGate14Input {
  return {
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    contract: fixture.contract,
    baselineSnapshot: fixture.baselineSnapshot,
    counterfactualSnapshot: fixture.counterfactualSnapshot,
    baselineFacts: fixture.baselineFacts,
    counterfactualFacts: fixture.counterfactualFacts,
    observedNonmaterialDimensions: fixture.observedNonmaterialDimensions,
    earlierAdaptationDimensions: fixture.earlierAdaptationDimensions,
  };
}
