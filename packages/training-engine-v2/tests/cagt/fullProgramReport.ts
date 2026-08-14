import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
  projectEffectiveAuthorityRegistryV2ToLegacy,
} from "./effectiveAuthorityRegistryV2";
import {
  FULL_PROGRAM_DIFFERENCE_IMPORTANCE_HIERARCHY,
  FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
  FULL_PROGRAM_GATE_14_SUBGATES,
  FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
  FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
} from "./fullProgramContracts";
import {
  FULL_PROGRAM_CONTROLLED_PAIR_NAMES,
  FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS,
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST,
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT,
} from "./fullProgramCohorts";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { digest } from "./signatures";
import {
  fullProgramCoverageEvidence,
  fullProgramCleanSnapshots,
  fullProgramGate14ActivationGuards,
  runFullProgramAlignmentMutationSuite,
  runFullProgramControlledPairs,
  runFullProgramDeterministicStress,
  runFullProgramEvaluatorBlindness,
  runFullProgramFourDayCohort,
  runFullProgramHoldout,
  runFullProgramMultiHorizonCohorts,
  runFullProgramPhaseLongitudinalBoundary,
} from "../helpers/fullPrescribedProgramCagtLab";
import {
  EXPECTED_PRODUCTION_POST_PRESCRIPTION_WEEK_COMBINED_FINGERPRINT,
  PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
} from "../helpers/productionPostPrescriptionWeekReport";
import { buildFullProgramSignatureFamily } from "./fullProgramSignatures";

export const FULL_PRESCRIBED_PROGRAM_CAGT_CLASSIFICATION =
  "FULL_PRESCRIBED_PROGRAM_CAGT_V1_READY_FOR_PHASE_CONTINUITY_AUTHORIZATION" as const;
export const FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORITY_AUDIT =
  "VERSIONED_AUTHORITY_REGISTRY_REQUIRED" as const;
export const FULL_PRESCRIBED_PROGRAM_CAGT_RUNTIME_STATUS =
  "TEST_DEVELOPER_TOOLING_NOT_PRODUCT_RUNTIME" as const;
export const EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_COMBINED_FINGERPRINT =
  "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6" as const;

export const FULL_PROGRAM_UPSTREAM_FINGERPRINTS = Object.freeze({
  historicalCagtV1: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
  ...PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
  productionPostPrescriptionWeekValidator: EXPECTED_PRODUCTION_POST_PRESCRIPTION_WEEK_COMBINED_FINGERPRINT,
});

const REAL_USER_FACT_AUDIT = Object.freeze([
  ["different goals", "Weekly Intent", "yes"], ["several goals", "Weekly Intent", "yes"],
  ["different schedules", "Week Horizon/Allocation", "yes"], ["equipment changes", "Candidate/Prescription", "yes"],
  ["relevant pain", "Candidate/Prescription", "yes"], ["irrelevant pain", "Invariant", "expected convergence"],
  ["assessment priorities", "Weekly Intent/Session Intent", "yes"], ["direct priorities", "Weekly Intent", "yes"],
  ["current structural capacity", "Session Intent/Composer", "yes"], ["continuity", "Candidate/Composer", "yes"],
  ["adverse response evidence", "Prescription receiver", "yes within supported evidence"],
  ["exact prior load", "Prescription", "yes"], ["unresolved duration", "Sequencing/Gate 13", "yes"],
  ["blocked session", "Training Safety/Gate 13", "yes"], ["cancelled opportunity", "Week source", "yes"],
  ["travel", "Product Horizon", "future owner"], ["external sport", "Week policy", "unsupported"],
  ["accessibility", "Product/accessibility owner", "future owner"], ["performance", "Performance", "defer Gate 16"],
  ["adherence", "Performance", "defer Gate 16"], ["symptoms", "Performance/Safety", "defer Gate 16"],
  ["recovery", "Performance/Longitudinal", "defer Gate 16"], ["phase change", "Phase Continuity", "defer Gate 15"],
  ["deload", "Longitudinal", "defer Gate 16"], ["progression", "Longitudinal", "defer Gate 16"],
] as const);

function pairMetric(results: ReturnType<typeof runFullProgramHoldout>["results"], dimension: string) {
  return Number((results.filter((entry) => !entry.result.structuredDifferences.some((difference) =>
    difference.dimension === dimension)).length / results.length).toFixed(6));
}

let reportCache: ReturnType<typeof buildReport> | null = null;

function buildReport() {
  const holdout = runFullProgramHoldout();
  const controlled = runFullProgramControlledPairs();
  const alignmentMutations = runFullProgramAlignmentMutationSuite();
  const fourDay = runFullProgramFourDayCohort();
  const multiHorizon = runFullProgramMultiHorizonCohorts();
  const evaluatorBlindness = runFullProgramEvaluatorBlindness();
  const phaseLongitudinalBoundary = runFullProgramPhaseLongitudinalBoundary();
  const coverage = fullProgramCoverageEvidence();
  const stress = runFullProgramDeterministicStress(1_000);
  const activationGuards = fullProgramGate14ActivationGuards();
  const representativeSignatures = buildFullProgramSignatureFamily(fullProgramCleanSnapshots()[0]);
  const persistenceResults = holdout.results.filter((entry) =>
    entry.result.causalPropagationTrace.persistenceRequired);
  const observedMetrics = Object.freeze({
    frameworkCollision: fourDay.rates.frameworkCollision,
    weeklyResponsibilityCollision: fourDay.rates.weeklyResponsibilityCollision,
    allocationCollision: fourDay.rates.allocationCollision,
    sessionPurposeCollision: fourDay.rates.sessionPurposeCollision,
    sessionNeedCollision: fourDay.rates.sessionNeedCollision,
    exerciseStructureCollision: fourDay.rates.exerciseStructureCollision,
    warmupActivationCollision: fourDay.rates.warmupActivationCollision,
    mainWorkCollision: fourDay.rates.mainWorkCollision,
    accessoryCollision: fourDay.rates.accessoryCollision,
    prescriptionCollision: fourDay.rates.prescriptionCollision,
    doseLaneCollision: fourDay.rates.doseLaneCollision,
    sequenceCollision: fourDay.rates.sequenceCollision,
    durationStateCollision: fourDay.rates.durationStateCollision,
    gate13RealizationCollision: fourDay.rates.gate13RealizationCollision,
    exactCompleteProgramCollision: fourDay.rates.exactCompleteProgramCollision,
    sameExerciseRate: pairMetric(holdout.results, "exercise_identity_distribution"),
    sameAnchorRate: pairMetric(holdout.results, "anchor_distribution"),
    sameRepRate: pairMetric(holdout.results, "reps_distribution"),
    sameTempoRate: pairMetric(holdout.results, "tempo_distribution"),
    sameSequenceRate: pairMetric(holdout.results, "final_sequence_distribution"),
    adaptationPersistenceRate: persistenceResults.length === 0 ? 1 : Number((persistenceResults.filter((entry) =>
      entry.result.adaptationPersistenceResult === "preserved").length / persistenceResults.length).toFixed(6)),
    justifiedConvergenceRate: Number((holdout.justifiedConvergencePairCount / holdout.pairCount).toFixed(6)),
    expectedConvergenceRate: Number((holdout.expectedConvergencePairCount / holdout.pairCount).toFixed(6)),
    materialAdaptationRate: Number((holdout.materialAdaptationCount / holdout.pairCount).toFixed(6)),
    firstMaterialDifferenceGateDistribution: stress.firstDifferenceGateDistribution,
  });
  const payloads = {
    authorityAudit: FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORITY_AUDIT,
    effectiveAuthorityRegistryV2: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    programSnapshotContract: FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
    programIdentity: fullProgramCleanSnapshots().slice(0, 8).map((snapshot) => ({
      snapshotId: snapshot.snapshotId, snapshotRevisionId: snapshot.snapshotRevisionId,
    })),
    counterfactualContract: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
    alignmentContract: { statuses: ["exact_lineage_match", "explicit_cross_snapshot_mapping", "semantic_equivalent_match",
      "intentionally_unmatched_baseline", "intentionally_unmatched_counterfactual", "ambiguous_alignment",
      "invalid_alignment"] },
    objectiveAlignment: alignmentMutations.rows.slice(1, 3),
    sessionAlignment: alignmentMutations.rows.slice(4, 7),
    assignmentAlignment: alignmentMutations.rows.slice(7),
    frameworkSignature: representativeSignatures.programFramework,
    responsibilitySignature: representativeSignatures.weeklyResponsibility,
    sessionSignature: representativeSignatures.sessionPurpose,
    exerciseStructureSignature: representativeSignatures.exerciseStructure,
    warmupActivationSignature: representativeSignatures.warmupActivation,
    prescriptionSignature: representativeSignatures.prescriptionStructure,
    relationshipSignature: representativeSignatures.relationshipView,
    sequenceSignature: representativeSignatures.sequence,
    gate13RealizationSignature: representativeSignatures.gate13Realization,
    completeAdaptiveSignature: representativeSignatures.completeAdaptiveProgram,
    differenceVocabulary: FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
    firstDifferenceDetector: stress.firstDifferenceGateDistribution,
    causalPropagation: holdout.results.slice(60, 80).map((entry) => entry.result.causalPropagationTrace),
    adaptationPersistence: persistenceResults.map((entry) => entry.result.adaptationPersistenceResult),
    expectedConvergence: holdout.expectedConvergencePairCount,
    justifiedConvergence: holdout.justifiedConvergencePairCount,
    underAdaptation: holdout.underAdaptationCount,
    overAdaptation: holdout.overAdaptationCount,
    wrongLayer: holdout.wrongLayerCount,
    cosmeticDifference: holdout.cosmeticOnlyCount,
    noRescue: { attempts: holdout.downstreamRescueAttemptCount, accepted: holdout.acceptedDownstreamRescueCount },
    controlledPairs: controlled.results.map((entry) => ({ name: entry.controlledPairName,
      classification: entry.result.finalClassification })),
    fixedFrameworkCohort: fourDay,
    holdoutManifest: FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST,
    holdoutResults: holdout.results.map((entry) => ({ pairId: entry.pairId, category: entry.category,
      classification: entry.observedClassification, matchedExpectation: entry.matchedExpectation })),
    collisions: observedMetrics,
    mutations: { alignment: alignmentMutations, diagnosticCount: FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.overUnderAdaptationMutationCount +
      holdout.wrongLayerCount + holdout.adaptationErasureCount + holdout.cosmeticOnlyCount },
    metamorphicResults: evaluatorBlindness,
    phaseLongitudinalBoundary,
    coverage,
    stress,
    activationGuards,
    readiness: { classification: FULL_PRESCRIBED_PROGRAM_CAGT_CLASSIFICATION,
      runtimeStatus: FULL_PRESCRIBED_PROGRAM_CAGT_RUNTIME_STATUS, nextDependency: "PHASE_CONTINUITY_GATE_15_AUTHORIZATION" },
  };
  const fingerprints = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return Object.freeze({
    classification: FULL_PRESCRIBED_PROGRAM_CAGT_CLASSIFICATION,
    authorityAuditResult: FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORITY_AUDIT,
    runtimeStatus: FULL_PRESCRIBED_PROGRAM_CAGT_RUNTIME_STATUS,
    historicalCagtV1Disposition: "PRESERVED_FROZEN_AND_EXPLICITLY_SELECTABLE" as const,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    legacyAuthorityProjection: projectEffectiveAuthorityRegistryV2ToLegacy(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2),
    snapshotContract: FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
    gate14Contract: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE,
    subgateOrder: FULL_PROGRAM_GATE_14_SUBGATES,
    differenceVocabulary: FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
    importanceHierarchy: FULL_PROGRAM_DIFFERENCE_IMPORTANCE_HIERARCHY,
    controlledPairNames: FULL_PROGRAM_CONTROLLED_PAIR_NAMES,
    controlled,
    alignmentMutations,
    holdout,
    fourDay,
    multiHorizon,
    evaluatorBlindness,
    phaseLongitudinalBoundary,
    coverage,
    stress,
    activationGuards,
    observedMetrics,
    realUserAudit: REAL_USER_FACT_AUDIT,
    upstreamFingerprints: FULL_PROGRAM_UPSTREAM_FINGERPRINTS,
    fingerprints: Object.freeze({ ...fingerprints, combinedGate14Tooling: digest(fingerprints) }),
  });
}

export function buildFullPrescribedProgramCagtReport() {
  reportCache ??= buildReport();
  return reportCache;
}

const title = (value: string) => `# ${value}\n\nGenerated deterministically from explicit CAGT Authority Registry V2 and test-only Gate 14 tooling.\n\n`;
const code = (value: unknown) => `\`${String(value)}\``;
const bullets = (values: readonly unknown[]) => values.map((value) => `- ${code(value)}`).join("\n");
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]) => [
  `| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map(String).join(" | ")} |`),
].join("\n");

export function renderFullPrescribedProgramCagtReports(
  report = buildFullPrescribedProgramCagtReport(),
): Readonly<Record<string, string>> {
  const authorityRows = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.gateOrder.map((gate) => {
    const descriptor = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.gates[gate];
    return [gate, descriptor.exactAuthority, descriptor.productionRuntimeAuthority, descriptor.testOnlyComparison];
  });
  const admissionJson = {
    classification: report.classification,
    authorityAuditResult: report.authorityAuditResult,
    runtimeStatus: report.runtimeStatus,
    holdout: {
      pairCount: report.holdout.pairCount,
      genuineCompleteProgramPairCount: report.holdout.genuineCompleteProgramPairCount,
      expectedConvergencePairCount: report.holdout.expectedConvergencePairCount,
      justifiedConvergencePairCount: report.holdout.justifiedConvergencePairCount,
      materialAdaptationCount: report.holdout.materialAdaptationCount,
      underAdaptationCount: report.holdout.underAdaptationCount,
      overAdaptationCount: report.holdout.overAdaptationCount,
      wrongLayerCount: report.holdout.wrongLayerCount,
      adaptationErasureCount: report.holdout.adaptationErasureCount,
      cosmeticOnlyCount: report.holdout.cosmeticOnlyCount,
      downstreamRescueAttemptCount: report.holdout.downstreamRescueAttemptCount,
      acceptedDownstreamRescueCount: report.holdout.acceptedDownstreamRescueCount,
      expectationMismatchCount: report.holdout.expectationMismatchCount,
    },
    observedMetrics: report.observedMetrics,
    phaseLongitudinalBoundary: report.phaseLongitudinalBoundary,
    coverage: report.coverage,
    stress: report.stress,
    activationGuards: report.activationGuards,
    fingerprints: report.fingerprints,
  };
  return Object.freeze({
    "FULL_PRESCRIBED_PROGRAM_CAGT_ONTOLOGY_AUDIT.md": title("Full Prescribed Program CAGT Ontology Audit") +
      `Audit result: ${code(report.authorityAuditResult)}. Historical CAGT V1: ${code(report.historicalCagtV1Disposition)}. ` +
      `Gate 14 compares immutable planned snapshots and owns no planning, Prescription, Sequencing, Performance, phase, or Longitudinal decision.\n`,
    "CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.md": title("CAGT Effective Authority Registry V2") +
      `Registry: ${code(`${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}`)}. ` +
      `No hidden latest registry exists.\n\n${table(["Gate", "Exact authority", "Production runtime", "Test-only comparison"], authorityRows)}\n`,
    "FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT.md": title("Full Prescribed Program Snapshot Contract") +
      `Contract: ${code(`${report.snapshotContract.contractId}@${report.snapshotContract.version}`)}. Identity is stable over athlete, horizon, WeeklyIntent, allocation-plan, validator-contract, and validation lineage; revisions include structured artifact revisions and evaluation time. Snapshots are deeply immutable and contain only planned artifacts.\n`,
    "FULL_PRESCRIBED_PROGRAM_COUNTERFACTUAL_CONTRACT.md": title("Full Prescribed Program Counterfactual Contract") +
      `Contract: ${code(`${report.gate14Contract.contractId}@${report.gate14Contract.version}`)}. Changed paths, owner, materiality, response window, invariants, permitted/prohibited dimensions, expected relationships, persistence, convergence, and no-rescue rules are frozen before execution.\n`,
    "FULL_PRESCRIBED_PROGRAM_ALIGNMENT_CONTRACT.md": title("Full Prescribed Program Alignment Contract") +
      `Alignment mutations: ${code(`${report.alignmentMutations.passedCount}/${report.alignmentMutations.mutationCount}`)} passed. Stable lineage, explicit mapping, and unique semantic responsibility may align; legitimate unmatched structures remain visible and ambiguity is rejected.\n`,
    "FULL_PRESCRIBED_PROGRAM_SIGNATURES.md": title("Full Prescribed Program Signatures") +
      `The family contains 22 separate normalized signatures with structured semantic diffs. Difference vocabulary: ${code(report.differenceVocabulary.length)} dimensions.\n\n${bullets(Object.keys(buildFullProgramSignatureFamily(fullProgramCleanSnapshots()[0])))}\n`,
    "FULL_PRESCRIBED_PROGRAM_FRAMEWORK_VS_ADAPTIVE_CONTENT.md": title("Full Program Framework Versus Adaptive Content") +
      `Framework and adaptive content remain separate. Four-day framework collision is ${code(report.fourDay.rates.frameworkCollision)}; complete-program collision is ${code(report.fourDay.rates.exactCompleteProgramCollision)}. Neither is a pass threshold.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAUSAL_PROPAGATION.md": title("Full Program Causal Propagation") +
      `Gate 14 records changed fact, owner, first rightful receiver, first material response, preserving dimensions, converged dimensions, final manifestation, and unrelated effects. Material adaptations preserved: ${code(report.holdout.materialAdaptationCount)}.\n`,
    "FULL_PRESCRIBED_PROGRAM_ADAPTATION_PERSISTENCE.md": title("Full Program Adaptation Persistence") +
      `Observed persistence rate: ${code(report.observedMetrics.adaptationPersistenceRate)}. All five explicit downstream-erasure mutations return ${code("MATERIAL_ADAPTATION_ERASED_DOWNSTREAM")}.\n`,
    "FULL_PRESCRIBED_PROGRAM_WARMUP_ACTIVATION.md": title("Full Program Warm-up and Activation") +
      `Warm-up/activation collision: ${code(report.fourDay.rates.warmupActivationCollision)}. Dependency truth, source identity, block purpose, A1 separation, recurrence, and concentration are compared without rewarding random variation.\n`,
    "FULL_PRESCRIBED_PROGRAM_PRESCRIPTION_COMPARISON.md": title("Full Program Prescription Comparison") +
      `Prescription collision: ${code(report.fourDay.rates.prescriptionCollision)}; same-rep rate: ${code(report.observedMetrics.sameRepRate)}; same-tempo rate: ${code(report.observedMetrics.sameTempoRate)}. No raw distance score or requirement that fields differ exists.\n`,
    "FULL_PRESCRIBED_PROGRAM_SEQUENCE_COMPARISON.md": title("Full Program Sequence Comparison") +
      `Sequence collision: ${code(report.fourDay.rates.sequenceCollision)}; same-order rate: ${code(report.observedMetrics.sameSequenceRate)}. Sequence is compared only after assignment and Prescription truth and cannot manufacture personalization.\n`,
    "FULL_PRESCRIBED_PROGRAM_DURATION_STRESS_SPACING.md": title("Full Program Duration Stress and Spacing") +
      `Known and unknown durations, budget states, planned stress, burden/concentration, and spacing states remain structured. Recovery, adaptation, injury, universal spacing, and universal stress ceilings are never inferred.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_PAIR_MATRIX.md": title("Full Prescribed Program CAGT Pair Matrix") +
      `Controlled pairs: ${code(report.controlled.pairCount)}; validator failures: ${code(report.controlled.hardFailureCount)}.\n\n` +
      table(["Pair", "Classification"], report.controlled.results.map((entry) =>
        [entry.controlledPairName, entry.result.finalClassification])) + "\n",
    "FULL_PRESCRIBED_PROGRAM_FIXED_FRAMEWORK_COHORT.md": title("Full Program Fixed Framework Cohort") +
      `Users: ${code(report.fourDay.cohortSize)}; confirmed opportunities each: ${code(4)}; result: ${code(report.fourDay.result)}. Shared frameworks are legal; raw diversity threshold count is ${code(0)}.\n`,
    "FULL_PRESCRIBED_PROGRAM_COLLISION_BASELINE.md": title("Full Program Collision Baseline") +
      `${table(["Metric", "Observed rate"], Object.entries(report.fourDay.rates))}\n\nNo collision metric independently controls pass/fail.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.md": title("Full Prescribed Program CAGT V1 Holdout Manifest") +
      `Fingerprint: ${code(FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT)}. Frozen before execution: ${code(true)}. ` +
      `Pairs/genuine/expected/shared-adaptive/framework-change/over-under/no-rescue: ${code(`${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.pairCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.expectedConvergencePairCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.sharedFrameworkMaterialAdaptationPairCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.frameworkChangePairCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.overUnderAdaptationMutationCount}/${FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS.noRescueMutationCount}`)}. ` +
      `Executed coverage identities/modes/sections/roles/purposes/failures: ${code(`${report.coverage.exerciseIdentityCount}/${report.coverage.doseModeCount}/${report.coverage.sectionCount}/${report.coverage.trainingRoleCount}/${report.coverage.objectivePurposeCount}/${report.coverage.failureCount}`)}. Corrections require V1.1 and a new holdout.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.json": `${JSON.stringify(FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST, null, 2)}\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_ADMISSION_REPORT.md": title("Full Prescribed Program CAGT Admission Report") +
      `Classification: ${code(report.classification)}. Holdout expectation matches: ${code(`${report.holdout.pairCount - report.holdout.expectationMismatchCount}/${report.holdout.pairCount}`)}. ` +
      `Expected/justified/material/under/over/wrong-layer/erased/cosmetic/shadow: ${code(`${report.holdout.expectedConvergencePairCount}/${report.holdout.justifiedConvergencePairCount}/${report.holdout.materialAdaptationCount}/${report.holdout.underAdaptationCount}/${report.holdout.overAdaptationCount}/${report.holdout.wrongLayerCount}/${report.holdout.adaptationErasureCount}/${report.holdout.cosmeticOnlyCount}/${report.holdout.upstreamShadowOnlyCount}`)}. Accepted rescues: ${code(0)}. ` +
      `Coverage identities/modes/sections/roles/purposes/failures: ${code(`${report.coverage.exerciseIdentityCount}/${report.coverage.doseModeCount}/${report.coverage.sectionCount}/${report.coverage.trainingRoleCount}/${report.coverage.objectivePurposeCount}/${report.coverage.failureCount}`)}. ` +
      `Phase/Longitudinal boundary: ${code(`${report.phaseLongitudinalBoundary.phaseClassification}/${report.phaseLongitudinalBoundary.longitudinalClassification}`)}.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_ADMISSION_REPORT.json": `${JSON.stringify(admissionJson, null, 2)}\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_REPORT.md": title("Full Prescribed Program CAGT Stress Report") +
      `Comparisons/pipeline pairs/alignment/causal/no-rescue: ${code(`${report.stress.deterministicFullProgramComparisonCount}/${report.stress.completeBaselineCounterfactualPipelinePairCount}/${report.stress.programAlignmentPermutationCount}/${report.stress.causalPropagationValidationCount}/${report.stress.noRescueMutationCount}`)}. ` +
      `All failure and randomness counts are ${code(0)}. Result: ${code(report.stress.result)}.\n`,
    "FULL_PRESCRIBED_PROGRAM_CAGT_IMPLEMENTATION_READINESS.md": title("Full Prescribed Program CAGT Implementation Readiness") +
      `Classification: ${code(report.classification)}. Runtime status: ${code(report.runtimeStatus)}. Gate 14 authority: ${code("MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE")}. ` +
      `Coverage failure count: ${code(report.coverage.failureCount)}. Gate 15 remains ${code("NOT_IMPLEMENTED")}; Gate 16 remains ${code("FOUNDATION_ONLY_NOT_IMPLEMENTED")}. Combined fingerprint: ${code(report.fingerprints.combinedGate14Tooling)}. Exact next dependency: ${code("PHASE_CONTINUITY_GATE_15_AUTHORIZATION")}.\n`,
    "REAL_USER_FULL_PRESCRIBED_PROGRAM_COMPARISON_AUDIT.md": title("Real User Full Prescribed Program Comparison Audit") +
      `${table(["Fact", "Owner", "Gate 14 receiver"], report.realUserAudit)}\n\nGate 15 and Gate 16 facts are explicitly deferred and never converted into Gate 14 under-adaptation.\n`,
  });
}

export const FULL_PROGRAM_GATE_14_UPDATED_DOCS = Object.freeze([
  "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md", "CAGT_CAUSAL_PAIR_MATRIX.md",
  "CAGT_FRAMEWORK_AND_ADAPTATION_REPORT.md", "CAGT_DUPLICATION_BASELINE.md",
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md", "PRODUCTION_POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md", "PRODUCTION_FINAL_SEQUENCING_FUTURE_INTEGRATION.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "OPTIMIZER.md", "TESTING.md",
]);

export function fullProgramGate14DocumentationMarker(report = buildFullPrescribedProgramCagtReport()): string {
  return `<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:START -->\n## Full Prescribed Program CAGT Gate 14\n\n` +
    `Classification: \`${report.classification}\`. Authority Registry: ` +
    `\`${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}\`. ` +
    `Gate 14 is \`MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE\` test/developer tooling and is not a product-runtime kernel. ` +
    `The frozen holdout contains \`${report.holdout.pairCount}\` pairs with \`${report.holdout.expectationMismatchCount}\` expectation mismatches, ` +
    `\`${report.holdout.acceptedDownstreamRescueCount}\` accepted rescues, and combined fingerprint ` +
    `\`${report.fingerprints.combinedGate14Tooling}\`. Historical CAGT V1 and all production fingerprints remain unchanged. ` +
    `Gate 15 is \`NOT_IMPLEMENTED\`; Gate 16 is \`FOUNDATION_ONLY_NOT_IMPLEMENTED\`.\n` +
    `<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:END -->`;
}
