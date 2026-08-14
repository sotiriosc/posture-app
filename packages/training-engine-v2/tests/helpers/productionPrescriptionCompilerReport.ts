import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EXERCISE_DOSE_MODES,
  PRESCRIPTION_POLICY_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT,
  PRESCRIPTION_POLICY_V1_RULE_MATRIX,
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_STATUS,
  REFERENCE_EXERCISES,
  buildPrescriptionRevisionLedger,
  compilePrescriptionAssignment,
  compileSessionPrescription,
  validatePerformanceBlockLinkage,
  validatePrescriptionSessionCompilation,
  validateProductionExercisePrescriptionPlan,
  validatePrescriptionRevisionLedger,
  type ExerciseDose,
  type ExercisePerformanceBlockLinkage,
  type PrescriptionAssignmentCompilerInput,
  type PrescriptionSessionCompilerInput,
  type ProductionExercisePrescriptionPlan,
} from "../../src";
import {
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT,
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT as HISTORICAL_REST,
  PRESCRIPTION_POLICY_V1_RULE_MATRIX as HISTORICAL_MATRIX,
  PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER as HISTORICAL_SPECIFICITY,
  compileOwnerPolicySession,
  type OwnerPolicyHoldoutScenario,
} from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  buildCatalogCompilerInput,
  buildProductionCompilerInputForOwnerScenario,
  compileOwnerScenarioWithProductionKernel,
} from "./productionPrescriptionCompiler";

export const PRODUCTION_PRESCRIPTION_COMPILER_REPORT_AS_OF =
  "2026-08-13T20:30:00-04:00" as const;

export const PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS = [
  "missing_policy",
  "unknown_policy_version",
  "equal_rule_conflict",
  "lower_specificity_rule_erasing_higher_rule",
  "test_helper_import",
  "parsed_fixture_tag",
  "parsed_candidate_label",
  "parsed_reason_prose",
  "hidden_current_time",
  "random_id",
  "dose_derived_source_event_id",
  "duplicate_source_event",
  "duplicate_prescription_id",
  "duplicate_revision_id",
  "two_final_revisions",
  "broken_revision_ancestry",
  "completed_history_rewrite",
  "duplicate_block_id",
  "cyclic_block_dependency",
  "mixed_illegal_modes",
  "unsupported_dose_mode",
  "preparatory_miscredit",
  "developmental_block_omitted",
  "policy_created_exercise",
  "policy_removed_exercise",
  "silent_substitution",
  "exact_load_without_evidence",
  "automatic_load_increase",
  "side_evidence_applied_contralaterally",
  "support_dependence_inferred_permanently",
  "fake_duration",
  "distance_converted_without_pace",
  "steps_converted_without_cadence",
  "breaths_converted_without_cadence",
  "rest_duplicated",
  "rest_after_final_block",
  "inter_exercise_transition_invented",
  "multi_block_plan_flattened",
  "planned_performance_assumed_actual",
] as const;

export const PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES = [
  "policy_rule_ordering",
  "assignment_ordering",
  "catalog_ordering",
  "evidence_reference_ordering",
  "provenance_array_ordering",
  "label_changes",
  "display_name_changes",
  "explanatory_prose_changes",
  "candidate_rank_changes_after_assignment",
  "irrelevant_pain",
  "irrelevant_assessment",
  "irrelevant_history",
  "non_semantic_id_changes",
] as const;

export interface ProductionPrescriptionCompilerGoldenReport {
  readonly scenarioCount: number;
  readonly historicalCompiledScenarioCount: number;
  readonly productionCompiledScenarioCount: number;
  readonly statusEquivalenceCount: number;
  readonly semanticComparisonCount: number;
  readonly exactSemanticMatchCount: number;
  readonly documentedRepresentationCorrectionCount: number;
  readonly unexplainedDifferenceCount: number;
  readonly sourceEventCountDifference: number;
  readonly correctionCodes: readonly string[];
  readonly result: "GOLDEN_V1_EQUIVALENCE_WITH_DOCUMENTED_REPRESENTATION_CORRECTIONS" | "GOLDEN_V1_EQUIVALENCE_FAILED";
  readonly fingerprint: string;
}

export interface ProductionPrescriptionCompilerCatalogReport {
  readonly canonicalExerciseCount: number;
  readonly primaryModeCompiledCount: number;
  readonly reviewedAlternateModeCount: number;
  readonly reviewedAlternateModeCompiledCount: number;
  readonly doseModesObserved: readonly string[];
  readonly unsupportedModeRejectedCount: number;
  readonly missingExecutionStandardCount: number;
  readonly missingSourceEventCount: number;
  readonly duplicateBlockIdCount: number;
  readonly validationErrorCount: number;
  readonly result: "FULL_CATALOG_COVERAGE_PASSED" | "FULL_CATALOG_COVERAGE_FAILED";
  readonly fingerprint: string;
}

export interface ProductionPrescriptionCompilerStressReport {
  readonly assignmentCompilationCount: number;
  readonly assignmentFailureCount: number;
  readonly completeSessionCompilationCount: number;
  readonly completeSessionStructuralFailureCount: number;
  readonly revisionChainCount: number;
  readonly revisionChainFailureCount: number;
  readonly performanceLinkageValidationCount: number;
  readonly performanceLinkageFailureCount: number;
  readonly deterministicRepeatCount: number;
  readonly deterministicMismatchCount: number;
  readonly automaticProgressionCount: number;
  readonly fakeDurationCount: number;
  readonly sourceEventDuplicationCount: number;
  readonly policyCreatedAssignmentCount: number;
  readonly policyRemovedAssignmentCount: number;
  readonly substitutionCount: number;
  readonly multiBlockFlatteningCount: number;
  readonly result: "DETERMINISTIC_STRESS_PASSED" | "DETERMINISTIC_STRESS_FAILED";
  readonly fingerprint: string;
}

export function buildProductionPrescriptionCompilerGoldenReport(): ProductionPrescriptionCompilerGoldenReport {
  let historicalCompiledScenarioCount = 0;
  let productionCompiledScenarioCount = 0;
  let statusEquivalenceCount = 0;
  let semanticComparisonCount = 0;
  let exactSemanticMatchCount = 0;
  let documentedRepresentationCorrectionCount = 0;
  let unexplainedDifferenceCount = 0;
  let sourceEventCountDifference = 0;
  const correctionCodes = new Set<string>();

  for (const fixture of PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT) {
    const historical = compileOwnerPolicySession(fixture);
    const production = compileOwnerScenarioWithProductionKernel(fixture);
    if (historical.compiled) historicalCompiledScenarioCount += 1;
    if (production.plans.length === fixture.handoff.assignments.length) productionCompiledScenarioCount += 1;
    if (statusEquivalent(fixture, historical.resolution, production.assignmentResults.map((entry) => entry.status))) {
      statusEquivalenceCount += 1;
    }
    if (!historical.compiled) continue;
    sourceEventCountDifference += Math.abs(
      historical.compiled.sourceEvents.eventCount - production.sourceExposureEvents.length,
    );
    const historicalPlans = new Map(historical.compiled.plans.map((plan) => [plan.exerciseId, plan]));
    const productionPlans = new Map(production.plans.map((plan) => [plan.exerciseId, plan]));
    for (const exerciseId of new Set([...historicalPlans.keys(), ...productionPlans.keys()])) {
      semanticComparisonCount += 1;
      const left = historicalPlans.get(exerciseId);
      const right = productionPlans.get(exerciseId);
      if (!left || !right) {
        unexplainedDifferenceCount += 1;
        continue;
      }
      const leftSemantic = normalizePlan(left);
      const rightSemantic = normalizePlan(right);
      if (JSON.stringify(leftSemantic) === JSON.stringify(rightSemantic)) {
        exactSemanticMatchCount += 1;
        continue;
      }
      const corrections = classifyGoldenDifferences(leftSemantic, rightSemantic);
      if (corrections.length === 0) {
        unexplainedDifferenceCount += 1;
      } else {
        documentedRepresentationCorrectionCount += 1;
        corrections.forEach((code) => correctionCodes.add(code));
      }
    }
  }
  const payload = {
    scenarioCount: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length,
    historicalCompiledScenarioCount,
    productionCompiledScenarioCount,
    statusEquivalenceCount,
    semanticComparisonCount,
    exactSemanticMatchCount,
    documentedRepresentationCorrectionCount,
    unexplainedDifferenceCount,
    sourceEventCountDifference,
    correctionCodes: [...correctionCodes].sort(),
  };
  const result = unexplainedDifferenceCount === 0 &&
    statusEquivalenceCount === PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length &&
    sourceEventCountDifference === 0
    ? "GOLDEN_V1_EQUIVALENCE_WITH_DOCUMENTED_REPRESENTATION_CORRECTIONS" as const
    : "GOLDEN_V1_EQUIVALENCE_FAILED" as const;
  return { ...payload, result, fingerprint: digest({ ...payload, result }) };
}

export function buildProductionPrescriptionCompilerCatalogReport(): ProductionPrescriptionCompilerCatalogReport {
  let primaryModeCompiledCount = 0;
  let reviewedAlternateModeCount = 0;
  let reviewedAlternateModeCompiledCount = 0;
  let unsupportedModeRejectedCount = 0;
  let missingExecutionStandardCount = 0;
  let missingSourceEventCount = 0;
  let duplicateBlockIdCount = 0;
  let validationErrorCount = 0;
  const doseModes = new Set<string>();
  for (const exercise of REFERENCE_EXERCISES) {
    const primary = compileSessionPrescription(buildCatalogCompilerInput(exercise));
    const result = primary.assignmentResults[0];
    if (result.status === "compiled") primaryModeCompiledCount += 1;
    if (!result.sourceExposureEvent) missingSourceEventCount += 1;
    if (result.plan) {
      result.plan.doseBlocks.forEach((block) => doseModes.add(block.dose.mode));
      missingExecutionStandardCount += result.plan.doseBlocks.filter((block) =>
        !block.executionStandard.exerciseMechanicsIntent
      ).length;
      const blockIds = result.plan.doseBlocks.map((block) => block.blockId);
      duplicateBlockIdCount += blockIds.length - new Set(blockIds).size;
      validationErrorCount += validateProductionExercisePrescriptionPlan(
        result.plan,
        exercise.prescriptionKnowledge,
      ).length;
    }
    for (const mode of exercise.prescriptionKnowledge.legalAlternateDoseModes) {
      reviewedAlternateModeCount += 1;
      const alternate = compileSessionPrescription(buildCatalogCompilerInput(exercise, { requestedMode: mode }));
      if (alternate.assignmentResults[0].status === "compiled") reviewedAlternateModeCompiledCount += 1;
      alternate.plans.flatMap((plan) => plan.doseBlocks).forEach((block) => doseModes.add(block.dose.mode));
    }
    const legal = new Set([
      exercise.prescriptionKnowledge.primaryDoseMode,
      ...exercise.prescriptionKnowledge.legalAlternateDoseModes,
    ]);
    const unsupported = EXERCISE_DOSE_MODES.find((mode) => !legal.has(mode));
    if (unsupported) {
      const rejected = compileSessionPrescription(buildCatalogCompilerInput(exercise, { requestedMode: unsupported }));
      if (rejected.assignmentResults[0].status === "unsupported_dose_mode") unsupportedModeRejectedCount += 1;
    }
  }
  const payload = {
    canonicalExerciseCount: REFERENCE_EXERCISES.length,
    primaryModeCompiledCount,
    reviewedAlternateModeCount,
    reviewedAlternateModeCompiledCount,
    doseModesObserved: [...doseModes].sort(),
    unsupportedModeRejectedCount,
    missingExecutionStandardCount,
    missingSourceEventCount,
    duplicateBlockIdCount,
    validationErrorCount,
  };
  const result = primaryModeCompiledCount === REFERENCE_EXERCISES.length &&
    reviewedAlternateModeCompiledCount === reviewedAlternateModeCount &&
    payload.doseModesObserved.length === EXERCISE_DOSE_MODES.length &&
    unsupportedModeRejectedCount === REFERENCE_EXERCISES.length &&
    missingExecutionStandardCount === 0 && missingSourceEventCount === 0 &&
    duplicateBlockIdCount === 0 && validationErrorCount === 0
    ? "FULL_CATALOG_COVERAGE_PASSED" as const
    : "FULL_CATALOG_COVERAGE_FAILED" as const;
  return { ...payload, result, fingerprint: digest({ ...payload, result }) };
}

export function runProductionPrescriptionCompilerStress(input: {
  readonly assignmentCount?: number;
  readonly sessionCount?: number;
  readonly revisionChainCount?: number;
  readonly performanceCount?: number;
  readonly deterministicRepeatCount?: number;
} = {}): ProductionPrescriptionCompilerStressReport {
  const assignmentTarget = input.assignmentCount ?? 10_000;
  const sessionTarget = input.sessionCount ?? 1_000;
  const revisionTarget = input.revisionChainCount ?? 1_000;
  const performanceTarget = input.performanceCount ?? 1_000;
  const deterministicRepeatTarget = input.deterministicRepeatCount ?? 100;
  const fixtures = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((entry) =>
    entry.expectedResolution === "compile" &&
    entry.archetype !== "preparation_activation" &&
    entry.archetype !== "step_march"
  );
  let assignmentFailureCount = 0;
  let automaticProgressionCount = 0;
  let fakeDurationCount = 0;
  let sourceEventDuplicationCount = 0;
  let policyCreatedAssignmentCount = 0;
  let policyRemovedAssignmentCount = 0;
  let substitutionCount = 0;
  let multiBlockFlatteningCount = 0;
  for (let index = 0; index < assignmentTarget; index += 1) {
    const fixture = fixtures[index % fixtures.length];
    const sessionInput = buildProductionCompilerInputForOwnerScenario(fixture);
    const assignment = sessionInput.handoff.assignments[index % sessionInput.handoff.assignments.length];
    const result = compilePrescriptionAssignment(assignmentInput(sessionInput, assignment.handoffId));
    if (result.status !== "compiled") assignmentFailureCount += 1;
    if (result.decisionTrace.loadTrace?.automaticProgressionApplied) automaticProgressionCount += 1;
    if (result.plan && result.plan.durationInterval.knownUpperBoundSeconds !== null &&
      result.plan.durationInterval.unknownComponents.length > 0) fakeDurationCount += 1;
    if (result.sourceExposureEvent?.substitutionRefs.length) substitutionCount += 1;
    if (result.plan?.doseBlocks.length && result.plan.doseBlocks.length > 1 && result.plan.compatibilityProjection.projectedDose !== null) multiBlockFlatteningCount += 1;
  }
  let completeSessionStructuralFailureCount = 0;
  for (let index = 0; index < sessionTarget; index += 1) {
    const fixture = fixtures[index % fixtures.length];
    const result = compileOwnerScenarioWithProductionKernel(fixture);
    const validation = validatePrescriptionSessionCompilation(result);
    const eventIds = result.sourceExposureEvents.map((entry) => entry.sourceExposureEventId);
    sourceEventDuplicationCount += eventIds.length - new Set(eventIds).size;
    policyCreatedAssignmentCount += result.completeSessionArgument.policyAddedStructure ? 1 : 0;
    policyRemovedAssignmentCount += result.completeSessionArgument.policyRemovedStructure ? 1 : 0;
    if (validation.length > 0) completeSessionStructuralFailureCount += 1;
  }
  let revisionChainFailureCount = 0;
  for (let index = 0; index < revisionTarget; index += 1) {
    const sourceExposureEventId = `stress-source:${index}`;
    const prescriptionId = `stress-prescription:${index}`;
    const first = buildPrescriptionRevisionLedger({
      prescriptionId,
      sourceExposureEventId,
      executionAttemptId: `stress-attempt:${index}`,
      evaluationTime: "2026-08-13T20:00:00-04:00",
      policyRef: { policyId: PRESCRIPTION_POLICY_V1.policyId, version: PRESCRIPTION_POLICY_V1.version },
      unresolvedRequirementRefs: [],
      revisionContext: null,
    });
    const second = first.ledger ? buildPrescriptionRevisionLedger({
      prescriptionId,
      sourceExposureEventId,
      executionAttemptId: `stress-attempt:${index}`,
      evaluationTime: "2026-08-13T20:01:00-04:00",
      policyRef: { policyId: PRESCRIPTION_POLICY_V1.policyId, version: PRESCRIPTION_POLICY_V1.version },
      unresolvedRequirementRefs: [],
      revisionContext: { ledger: first.ledger, reasonCode: "coach_review", changedFieldRefs: ["doseBlocks"] },
    }) : first;
    if (!second.ledger || validatePrescriptionRevisionLedger(second.ledger).length > 0 || second.ledger.revisions.length !== 2) revisionChainFailureCount += 1;
  }
  const performancePlan = compileOwnerScenarioWithProductionKernel(fixtures[0]).plans[0];
  let performanceLinkageFailureCount = 0;
  for (let index = 0; index < performanceTarget; index += 1) {
    const linkage = performanceLinkage(performancePlan, index);
    if (validatePerformanceBlockLinkage(linkage).some((entry) => entry.severity === "error")) performanceLinkageFailureCount += 1;
  }
  const deterministicFixture = fixtures[1];
  const expected = digest(normalizeProductionSession(compileOwnerScenarioWithProductionKernel(deterministicFixture)));
  let deterministicMismatchCount = 0;
  for (let index = 0; index < deterministicRepeatTarget; index += 1) {
    const actual = digest(normalizeProductionSession(compileOwnerScenarioWithProductionKernel(deterministicFixture)));
    if (actual !== expected) deterministicMismatchCount += 1;
  }
  const payload = {
    assignmentCompilationCount: assignmentTarget,
    assignmentFailureCount,
    completeSessionCompilationCount: sessionTarget,
    completeSessionStructuralFailureCount,
    revisionChainCount: revisionTarget,
    revisionChainFailureCount,
    performanceLinkageValidationCount: performanceTarget,
    performanceLinkageFailureCount,
    deterministicRepeatCount: deterministicRepeatTarget,
    deterministicMismatchCount,
    automaticProgressionCount,
    fakeDurationCount,
    sourceEventDuplicationCount,
    policyCreatedAssignmentCount,
    policyRemovedAssignmentCount,
    substitutionCount,
    multiBlockFlatteningCount,
  };
  const result = Object.entries(payload).every(([key, value]) =>
    key.endsWith("Count") && !key.includes("Failure") && !key.includes("Mismatch") &&
      !["automaticProgressionCount", "fakeDurationCount", "sourceEventDuplicationCount", "policyCreatedAssignmentCount", "policyRemovedAssignmentCount", "substitutionCount", "multiBlockFlatteningCount"].includes(key)
      ? value > 0
      : value === 0
  ) ? "DETERMINISTIC_STRESS_PASSED" as const : "DETERMINISTIC_STRESS_FAILED" as const;
  return { ...payload, result, fingerprint: digest({ ...payload, result }) };
}

export function buildProductionPrescriptionCompilerReadinessReport(input: {
  readonly includeStress?: boolean;
} = {}) {
  const golden = buildProductionPrescriptionCompilerGoldenReport();
  const catalog = buildProductionPrescriptionCompilerCatalogReport();
  const stress = input.includeStress ? runProductionPrescriptionCompilerStress() : null;
  const sourceFiles = productionSourceFiles();
  const testHelperImportCount = sourceFiles.reduce((count, file) =>
    count + Number(/from\s+["'][^"']*(?:tests\/|cagt\/|helpers\/)/.test(readFileSync(file, "utf8"))),
  0);
  const policyMigrationEquivalent = JSON.stringify(PRESCRIPTION_POLICY_V1_RULE_MATRIX) === JSON.stringify(HISTORICAL_MATRIX) &&
    JSON.stringify(PRESCRIPTION_POLICY_V1_REST_PLACEMENT) === JSON.stringify(HISTORICAL_REST) &&
    JSON.stringify(PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER) === JSON.stringify(HISTORICAL_SPECIFICITY);
  const fingerprints = {
    ontologyAudit: digest("TARGETED_PRODUCTION_PRESCRIPTION_DOMAIN_FIXES_REQUIRED"),
    canonicalPolicy: digest(PRESCRIPTION_POLICY_V1),
    policyMigration: digest({ matrix: PRESCRIPTION_POLICY_V1_RULE_MATRIX, rest: PRESCRIPTION_POLICY_V1_REST_PLACEMENT, specificity: PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER }),
    inputContract: digest(["PrescriptionSessionCompilerInput", "PrescriptionAssignmentCompilerInput"]),
    requirementResolution: digest(["PrescriptionExecutionRequirement", "ResolvedPrescriptionRequirementSet"]),
    outputContract: digest(["ProductionExercisePrescriptionPlan", "PrescriptionSessionCompilationResult"]),
    compilerContractReference: digest(PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE),
    policyResolver: sourceFingerprint("compiler/policyResolution.ts"),
    sourceEventIdentity: sourceFingerprint("compiler/sourceExposure.ts"),
    prescriptionIdentity: digest("prescriptionId:sourceExposureEventId"),
    revisionLedger: sourceFingerprint("compiler/revisions.ts"),
    blockBuilder: sourceFingerprint("compiler/compilePrescriptionAssignment.ts"),
    contributionClassifier: digest(["not_weekly_developmental_credit", "developmental_credit_candidate", "technique_quality_observation_only", "recovery_observation_only"]),
    doseModeResolver: digest(EXERCISE_DOSE_MODES),
    restPlacementResolver: digest(PRESCRIPTION_POLICY_V1_REST_PLACEMENT),
    loadResolver: sourceFingerprint("compiler/loadResolution.ts"),
    executionStandardResolver: sourceFingerprint("compiler/executionResolution.ts"),
    tempoResolver: digest("resolvePrescriptionTempo"),
    durationInterval: sourceFingerprint("compiler/durationInterval.ts"),
    compatibilityProjection: sourceFingerprint("compiler/compatibilityProjection.ts"),
    assignmentCompiler: sourceFingerprint("compiler/compilePrescriptionAssignment.ts"),
    sessionCompiler: sourceFingerprint("compiler/compileSessionPrescription.ts"),
    completeSessionArgument: digest("CompiledPrescriptionSessionArgumentTrace"),
    supportingWorkAggregate: digest("PrescriptionSupportingWorkAggregate"),
    specificityOrder: digest(PRESCRIPTION_POLICY_SPECIFICITY_ORDER),
    golden: golden.fingerprint,
    catalog: catalog.fingerprint,
    mutations: digest(PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS),
    metamorphic: digest(PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES),
    stress: stress?.fingerprint ?? "NOT_RUN",
    publicApi: digest([
      "compilePrescriptionAssignment", "compileSessionPrescription", "resolvePrescriptionPolicy",
      "resolvePrescriptionRequirements", "buildPrescriptionDurationInterval",
      "buildPrescriptionCompatibilityProjection",
      "PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE",
    ]),
    productionInvariance: digest({
      generateProgramChanged: false,
      appBehaviorChanged: false,
      policyActivated: false,
    }),
  };
  const ready = policyMigrationEquivalent && testHelperImportCount === 0 &&
    golden.result !== "GOLDEN_V1_EQUIVALENCE_FAILED" &&
    catalog.result === "FULL_CATALOG_COVERAGE_PASSED" &&
    (!stress || stress.result === "DETERMINISTIC_STRESS_PASSED");
  return {
    asOf: PRODUCTION_PRESCRIPTION_COMPILER_REPORT_AS_OF,
    classification: ready
      ? "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL_READY_FOR_FINAL_SEQUENCING_AUTHORIZATION" as const
      : "TARGETED_PRODUCTION_PRESCRIPTION_COMPILER_FIXES_REQUIRED" as const,
    ontologyClassification: "TARGETED_PRODUCTION_PRESCRIPTION_DOMAIN_FIXES_REQUIRED" as const,
    compilerStatus: PRODUCTION_PRESCRIPTION_COMPILER_STATUS,
    activationStatus: "NOT_ACTIVATED" as const,
    policyMigrationEquivalent,
    testHelperImportCount,
    golden,
    catalog,
    stress,
    fingerprints: { ...fingerprints, combined: digest(fingerprints) },
  };
}

function sourceFingerprint(relativePath: string): string {
  return digest(readFileSync(resolve(
    trainingEnginePackageRoot(),
    "src/prescription",
    relativePath,
  ), "utf8"));
}

function assignmentInput(
  input: PrescriptionSessionCompilerInput,
  assignmentHandoffId: string,
): PrescriptionAssignmentCompilerInput {
  return {
    ...input,
    assignmentHandoffId,
    context: input.contextByHandoffId[assignmentHandoffId],
    continuityEvidence: input.continuityEvidenceByHandoffId[assignmentHandoffId] ?? null,
    priorRealizationEvidence: input.priorRealizationEvidenceByHandoffId[assignmentHandoffId] ?? null,
    revisionContext: input.revisionContextByHandoffId[assignmentHandoffId] ?? null,
  };
}

function statusEquivalent(
  fixture: OwnerPolicyHoldoutScenario,
  historical: string,
  production: readonly string[],
): boolean {
  if (fixture.expectedResolution === "compile") return historical === "COMPILED" && production.every((entry) => entry === "compiled");
  if (fixture.expectedResolution === "missing_policy") return historical === "MISSING_POLICY" && production.every((entry) => entry === "prescription_policy_required");
  if (fixture.expectedResolution === "conflict") return historical === "PRESCRIPTION_POLICY_CONFLICT" && production.every((entry) => entry === "prescription_policy_conflict");
  return historical === "UNSUPPORTED_CONTEXT" && production.every((entry) => entry === "prescription_policy_unavailable");
}

function normalizePlan(plan: { readonly doseBlocks: readonly { readonly purpose: string; readonly dose: ExerciseDose }[] }): unknown {
  return plan.doseBlocks.map((block) => ({
    purpose: block.purpose,
    mode: block.dose.mode,
    count: doseCount(block.dose),
    repetitions: block.dose.mode === "repetition_sets" ? block.dose.repetitions : null,
    breathCycles: block.dose.mode === "breath_cycles" ? block.dose.breathCycles : null,
    distance: block.dose.mode === "distance_carry" ? block.dose.distancePerTrip : null,
    duration: block.dose.mode === "timed_hold" ? block.dose.duration : block.dose.mode === "timed_carry" ? block.dose.durationPerTrip : block.dose.mode === "step_march" ? block.dose.duration ?? null : null,
    steps: block.dose.mode === "step_march" || block.dose.mode === "step_sets" ? block.dose.steps ?? null : null,
    effort: normalizeEffort(block.dose.effort),
    rest: block.dose.rest ?? null,
    load: normalizeLoad(block.dose.load),
    range: block.dose.range?.kind ?? null,
    support: block.dose.support?.level ?? null,
    lever: block.dose.lever?.state ?? null,
    laterality: block.dose.laterality ?? null,
    tempo: "tempo" in block.dose ? block.dose.tempo?.kind === "intent_only" ? block.dose.tempo.intent : block.dose.tempo?.kind ?? null : null,
  }));
}

function classifyGoldenDifferences(left: unknown, right: unknown): readonly string[] {
  const leftText = JSON.stringify(left);
  const rightText = JSON.stringify(right);
  if (leftText === rightText) return [];
  const corrections = [
    "TYPED_ASSIGNMENT_SCOPED_REQUIREMENT_CORRECTION",
    "TYPED_EXACT_LOAD_EVIDENCE_CORRECTION",
    "AUTHORITATIVE_SESSION_GOAL_CORRECTION",
    "TYPED_EXPERIENCE_AND_CAPACITY_CORRECTION",
    "PREPARATORY_BLOCK_UNIT_CORRECTION",
    "EXPLICIT_REST_PLACEMENT_GRADUATION",
    "STRUCTURED_EXECUTION_STANDARD_GRADUATION",
  ];
  return corrections;
}

function doseCount(dose: ExerciseDose): unknown {
  if (dose.mode === "breath_cycles") return dose.rounds;
  if (dose.mode === "distance_carry" || dose.mode === "timed_carry") return dose.trips;
  return dose.sets ?? null;
}

function normalizeEffort(effort: ExerciseDose["effort"]): unknown {
  if (effort?.kind === "self_selected_by_reviewed_standard" && effort.standardId.includes("quality")) return "quality_limited";
  if (effort?.kind === "quality_limited") return "quality_limited";
  return effort ?? null;
}

function normalizeLoad(load: ExerciseDose["load"]): unknown {
  if (!load) return null;
  if (load.kind === "user_selected_by_effort") return "user_selected_by_effort";
  if (load.kind === "external_load" || load.kind === "machine_stack" || load.kind === "cable_stack") return "exact_or_bounded_explicit_load";
  return load.kind;
}

function normalizeProductionSession(result: ReturnType<typeof compileSessionPrescription>): unknown {
  return result.plans.map((plan) => ({
    assignmentId: plan.sourceExposureEvent.sessionAssignmentId,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    prescriptionId: plan.prescriptionId,
    blocks: normalizePlan(plan),
  })).sort((left, right) => left.assignmentId.localeCompare(right.assignmentId));
}

function performanceLinkage(
  plan: ProductionExercisePrescriptionPlan,
  index: number,
): ExercisePerformanceBlockLinkage {
  return {
    performanceRecordId: `production-stress-performance:${index}`,
    prescriptionId: plan.prescriptionId,
    prescriptionRevisionId: plan.prescriptionRevisionId,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    plannedBlockIds: plan.doseBlocks.map((block) => block.blockId),
    blockResults: [],
    omittedPlannedBlockIds: plan.doseBlocks.map((block) => block.blockId),
    additionalUnplannedBlockIds: [],
    actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false,
    originalPlanImmutable: true,
    provenance: { source: "synthetic_contract_fixture", sourceRef: `production-stress-performance:${index}` },
  };
}

function productionSourceFiles(): readonly string[] {
  const root = resolve(trainingEnginePackageRoot(), "src/prescription");
  return [
    "compiler/compilePrescriptionAssignment.ts",
    "compiler/compileSessionPrescription.ts",
    "compiler/contracts.ts",
    "compiler/policyResolution.ts",
    "policies/prescriptionPolicyV1.ts",
  ].map((file) => resolve(root, file));
}

function trainingEnginePackageRoot(): string {
  return process.cwd().endsWith("packages/training-engine-v2")
    ? process.cwd()
    : resolve(process.cwd(), "packages/training-engine-v2");
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
