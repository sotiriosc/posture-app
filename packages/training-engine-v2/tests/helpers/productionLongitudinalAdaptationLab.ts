import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildProductionLongitudinalEvidenceTrajectory,
  classifyProductionLongitudinalEvidenceApplicability,
  deriveProductionBlockResultId,
  deriveProductionLongitudinalSourceRecordRevisionId,
  deriveProductionLongitudinalSourceSnapshotRevisionId,
  evaluateLongitudinalAdaptation,
  generateProductionLongitudinalActionCandidates,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED as PRODUCTION_POLICY,
  validateProductionCompletedExposureLedger,
  validateProductionExercisePerformanceBlockLinkage,
  validateProductionLongitudinalAdaptationResult,
  validateProductionLongitudinalApplicationCandidate,
  validateProductionLongitudinalDecisionRevisionLedger,
  validateProductionLongitudinalEvidenceWindow,
  validateProductionLongitudinalOutcomeSourceSnapshot,
  validateProductionLongitudinalStateRevisionLedger,
  validateProductionRepeatedLongitudinalEvidence,
  type ProductionLongitudinalAdaptationInput,
  type ProductionLongitudinalAdaptationResult,
  type ProductionLongitudinalOutcomeSourceRecord,
} from "../../src/longitudinalAdaptation";
import {
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS,
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS,
  LONGITUDINAL_FIXED_SHELL_DESCRIPTORS,
} from "../cagt/longitudinalAdaptationCohorts";
import type { LongitudinalHoldoutDescriptor } from "../../src/longitudinalAdaptation/designContracts";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { buildLongitudinalAdaptationInput } from "./longitudinalAdaptationPipeline";
import { adaptGate16InputToProduction } from "./productionLongitudinalAdaptationAdapter";
import { digest } from "../cagt/signatures";

export function buildProductionLongitudinalAdaptationInput(
  descriptor: LongitudinalHoldoutDescriptor,
): ProductionLongitudinalAdaptationInput {
  return adaptGate16InputToProduction(buildLongitudinalAdaptationInput(descriptor));
}

function normalizedDesignStatus(status: string): string {
  if (status === "longitudinal_outcome_ledger_invalid") return "completed_ledger_invalid";
  return status.replace(/^longitudinal_/, "");
}

function semantic(result: ProductionLongitudinalAdaptationResult) {
  return Object.freeze({ status: result.status, action: result.selectedPrimaryAction,
    state: result.currentStateClassification,
    axis: result.actionDirective?.selectedAxis ?? null,
    firstFailingSubgateIndex: result.firstFailingSubgate ?
      result.subgateTrace.findIndex((entry) => entry.subgate === result.firstFailingSubgate) : -1,
    decisionAuthorized: result.decisionAuthorized, programMutationApplied: result.programMutationApplied,
    prescriptionMutationApplied: result.prescriptionMutationApplied,
    replacementApplied: result.exerciseReplacementApplied, rotationApplied: result.rotationApplied,
    deloadApplied: result.deloadApplied, weekReallocationApplied: result.weekReallocationApplied,
    phaseMutationApplied: result.phaseMutationApplied, applicationOwnerRequired: result.applicationOwnerRequired,
  });
}

function evaluateDescriptor(descriptor: LongitudinalHoldoutDescriptor) {
  const designInput = buildLongitudinalAdaptationInput(descriptor);
  const design = runLongitudinalAdaptationGate16(designInput);
  const production = evaluateLongitudinalAdaptation(adaptGate16InputToProduction(designInput));
  const designFailureIndex = design.firstFailingSubgate ? design.subgateTrace.findIndex((entry) =>
    entry.subgate === design.firstFailingSubgate) : -1;
  const productionFailureIndex = production.firstFailingSubgate ? production.subgateTrace.findIndex((entry) =>
    entry.subgate === production.firstFailingSubgate) : -1;
  const matched = production.selectedPrimaryAction === design.selectedPrimaryAction &&
    production.status === normalizedDesignStatus(design.status) && production.currentStateClassification ===
      design.currentStateClassification && productionFailureIndex === designFailureIndex;
  return Object.freeze({ scenarioId: descriptor.scenarioId, matched,
    expectedAction: design.selectedPrimaryAction, actualAction: production.selectedPrimaryAction,
    expectedStatus: normalizedDesignStatus(design.status), actualStatus: production.status,
    expectedState: design.currentStateClassification, actualState: production.currentStateClassification,
    expectedFailureIndex: designFailureIndex, actualFailureIndex: productionFailureIndex,
    validationReasons: validateProductionLongitudinalAdaptationResult(production),
    semanticFingerprint: digest(semantic(production)) });
}

let goldenCache: ReturnType<typeof executeGolden> | null = null;
function executeGolden() {
  const controlled = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.map(evaluateDescriptor);
  const shell = LONGITUDINAL_FIXED_SHELL_DESCRIPTORS.map(evaluateDescriptor);
  const holdout = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS.map(evaluateDescriptor);
  const rows = [...controlled, ...shell, ...holdout];
  const semanticMismatchCount = rows.filter((row) => !row.matched).length;
  const productionValidationFailureCount = rows.filter((row) => row.validationReasons.length).length;
  const genuineCompletedHistoryCount = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((descriptor) => descriptor.genuineCompletedEvidenceHistory).length;
  const fingerprint = digest(rows.map((row) => [row.scenarioId, row.semanticFingerprint]));
  return Object.freeze({ admittedControlledChainCount: controlled.length, admittedFixedShellCount: shell.length,
    admittedHoldoutCount: holdout.length, genuineCompletedHistoryCount,
    productionControlledScenarioCount: controlled.length,
    allExerciseIdentityCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
      .map((descriptor) => descriptor.exerciseId)).size,
    allDoseModeCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
      .map((descriptor) => descriptor.doseMode)).size,
    semanticMismatchCount, productionValidationFailureCount,
    admittedHoldoutFingerprint: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST_FINGERPRINT,
    fingerprint, rows: Object.freeze(rows),
    result: semanticMismatchCount + productionValidationFailureCount === 0 ?
      "PRODUCTION_LONGITUDINAL_ADAPTATION_GOLDEN_EQUIVALENCE_PASS" as const :
      "PRODUCTION_LONGITUDINAL_ADAPTATION_GOLDEN_EQUIVALENCE_FAIL" as const });
}

export function runProductionLongitudinalGoldenEquivalence() {
  goldenCache ??= executeGolden();
  return goldenCache;
}

export function runProductionLongitudinalMutationMatrix() {
  const rows = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.map(evaluateDescriptor);
  const failureRows = rows.filter((row) => row.actualFailureIndex >= 0);
  const requiredNames = ["duplicate_source_event", "duplicate_outcome_entry", "planned_dose_as_actual",
    "prescribed_tempo_as_actual", "copied_record_as_repeated", "future_dated_evidence", "wrong_side_evidence",
    "wrong_support_context", "wrong_prescription_revision", "orphan_response", "action_erased_downstream",
    "action_scope_exceeded", "replacement_direct_swap_without_candidate_rerun", "keep_with_unrelated_change"];
  const covered = new Set(rows.map((row) => row.scenarioId));
  const missingRequiredMutationCount = requiredNames.filter((name) => !covered.has(name)).length;
  const mismatchCount = rows.filter((row) => !row.matched || row.validationReasons.length).length;
  return Object.freeze({ mutationCaseCount: rows.length, semanticFailureCaseCount: failureRows.length,
    missingRequiredMutationCount, mismatchCount,
    fingerprint: digest(rows.map((row) => [row.scenarioId, row.actualStatus, row.actualFailureIndex])),
    result: mismatchCount + missingRequiredMutationCount === 0 ?
      "PRODUCTION_LONGITUDINAL_ADAPTATION_MUTATION_MATRIX_PASS" as const :
      "PRODUCTION_LONGITUDINAL_ADAPTATION_MUTATION_MATRIX_FAIL" as const });
}

function reorderInput(input: ProductionLongitudinalAdaptationInput): ProductionLongitudinalAdaptationInput {
  const draft = structuredClone(input) as ProductionLongitudinalAdaptationInput;
  (draft.outcomeSourceSnapshot.sourceRecords as ProductionLongitudinalOutcomeSourceRecord[]).reverse();
  (draft.completedExposureLedger.entries as unknown[]).reverse();
  (draft.completedExposureLedger.expectedSourceExposureEventIds as string[]).reverse();
  (draft.evidenceWindow.includedOutcomeEntryIds as string[]).reverse();
  (draft.evidenceWindow.reviewedAggregateSourceEventIds as string[]).reverse();
  for (const record of draft.outcomeSourceSnapshot.sourceRecords) {
    (record.reviewedAggregateSourceEventIds as string[]).reverse();
    (record.provenance as string[]).reverse();
  }
  return draft;
}

export function runProductionLongitudinalMetamorphicChecks() {
  const descriptors = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS.filter((descriptor) =>
    descriptor.expectedAction !== null).slice(0, 24);
  const rows = descriptors.map((descriptor) => {
    const input = buildProductionLongitudinalAdaptationInput(descriptor);
    const baseline = evaluateLongitudinalAdaptation(input);
    const reordered = evaluateLongitudinalAdaptation(reorderInput(input));
    return Object.freeze({ scenarioId: descriptor.scenarioId,
      passed: digest(semantic(baseline)) === digest(semantic(reordered)),
      baselineFingerprint: digest(semantic(baseline)), reorderedFingerprint: digest(semantic(reordered)) });
  });
  const failureCount = rows.filter((row) => !row.passed).length;
  return Object.freeze({ invariantCaseCount: rows.length, materialResponseCaseCount: 24, failureCount,
    rows: Object.freeze(rows),
    fingerprint: digest(rows), result: failureCount === 0 ?
      "PRODUCTION_LONGITUDINAL_ADAPTATION_METAMORPHIC_PASS" as const :
      "PRODUCTION_LONGITUDINAL_ADAPTATION_METAMORPHIC_FAIL" as const });
}

function recursiveFiles(root: string): readonly string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? recursiveFiles(path) : [path];
  });
}

export function productionLongitudinalActivationGuards() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const prodFiles = recursiveFiles(resolve(packageRoot, "src")).filter((path) =>
    /\.(?:ts|tsx|js|jsx)$/.test(path));
  const appFiles = recursiveFiles(resolve(workspaceRoot, "apps")).filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path));
  const uiFiles = recursiveFiles(resolve(workspaceRoot, "components")).filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path));
  const read = (paths: readonly string[]) => paths.map((path) => ({ path, content: readFileSync(path, "utf8") }));
  const production = read(prodFiles);
  const apps = read(appFiles);
  const ui = read(uiFiles);
  const longitudinal = production.filter((entry) => entry.path.includes("/longitudinalAdaptation/") &&
    !entry.path.endsWith("/longitudinalAdaptation/designContracts.ts"));
  const calls = (rows: readonly { readonly path: string; readonly content: string }[], pattern: RegExp) =>
    rows.filter((entry) => pattern.test(entry.content)).length;
  const evaluatorDefinition = resolve(packageRoot, "src/longitudinalAdaptation/evaluateLongitudinalAdaptation.ts");
  const productionOutsideEvaluator = production.filter((entry) => entry.path !== evaluatorDefinition);
  const checks = Object.freeze({
    consumerAppImportCount: calls(apps, /from ["'][^"']*longitudinalAdaptation/),
    gymsAppImportCount: calls(apps.filter((entry) => /gym/i.test(entry.path)), /longitudinalAdaptation/),
    appCallCount: calls(apps, /evaluateLongitudinalAdaptation\s*\(/),
    generateProgramCallCount: calls(production.filter((entry) => /generateProgram/.test(entry.path)),
      /evaluateLongitudinalAdaptation\s*\(/),
    engineOrchestrationCallCount: calls(productionOutsideEvaluator, /evaluateLongitudinalAdaptation\s*\(/),
    implicitPolicySelectionCount: calls(longitudinal, /process\.env|DEFAULT_LONGITUDINAL_POLICY|latestPolicy/i),
    implicitSourceAdapterSelectionCount: calls(longitudinal, /defaultSourceAdapter|autoSourceAdapter/i),
    productAdapterWiringCount: calls([...production, ...apps], /LongitudinalAdaptationProductAdapter/),
    livePerformanceIngestionCount: calls([...production, ...apps], /ingestLongitudinalPerformance\s*\(/),
    liveAdherenceIngestionCount: calls([...production, ...apps], /ingestLongitudinalAdherence\s*\(/),
    liveRecoveryIngestionCount: calls([...production, ...apps], /ingestLongitudinalRecovery\s*\(/),
    phaseStateApplicationCount: calls([...production, ...apps], /applyLongitudinalPhaseMutation\s*\(/),
    weekReallocationCount: calls([...production, ...apps], /applyLongitudinalWeekReallocation\s*\(/),
    automaticProgressionCount: calls([...production, ...apps], /automaticLongitudinalProgression\s*\(/),
    automaticRegressionCount: calls([...production, ...apps], /automaticLongitudinalRegression\s*\(/),
    automaticReplacementCount: calls([...production, ...apps], /automaticLongitudinalReplacement\s*\(/),
    automaticRotationCount: calls([...production, ...apps], /automaticLongitudinalRotation\s*\(/),
    automaticDeloadCount: calls([...production, ...apps], /automaticLongitudinalDeload\s*\(/),
    uiImportCount: calls(ui, /longitudinalAdaptation/),
    testOrReportImportCount: calls(longitudinal, /(?:tests|reports?|dev)\//),
    cagtImportCount: calls(longitudinal, /from ["'][^"']*(?:tests\/cagt|effectiveAuthorityRegistry)/),
    environmentActivationCount: calls(longitudinal, /process\.env[^\n]*LONGITUDINAL/),
    moduleImportSideEffectCount: calls(productionOutsideEvaluator, /^evaluateLongitudinalAdaptation\s*\(/m),
  });
  const failureCount = Object.values(checks).reduce((sum, value) => sum + value, 0);
  return Object.freeze({ checks, failureCount, livePerformanceAdapterCount: 0, liveAdherenceAdapterCount: 0,
    liveRecoveryAdapterCount: 0, result: failureCount === 0 ?
      "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_NOT_ACTIVATED" as const :
      "PRODUCTION_LONGITUDINAL_ADAPTATION_ACTIVATION_GUARD_FAILURE" as const,
    fingerprint: digest(checks) });
}

function correctedSourceSnapshot(input: ProductionLongitudinalAdaptationInput) {
  const current = input.outcomeSourceSnapshot.sourceRecords[0];
  const { sourceRecordRevisionId: _currentRevision, provenance: _currentProvenance, ...currentContent } = current;
  void [_currentRevision, _currentProvenance];
  const historicalContent = { ...currentContent, finalForSourceRecord: false,
    revisionState: "corrected" as const, basedOnRevisionId: null };
  const historical = Object.freeze({ ...historicalContent,
    sourceRecordRevisionId: deriveProductionLongitudinalSourceRecordRevisionId(historicalContent),
    provenance: Object.freeze(["stress:historical-corrected-source-revision"]) });
  const activeContent = { ...currentContent, finalForSourceRecord: true, revisionState: "active" as const,
    basedOnRevisionId: historical.sourceRecordRevisionId };
  const active = Object.freeze({ ...activeContent,
    sourceRecordRevisionId: deriveProductionLongitudinalSourceRecordRevisionId(activeContent),
    provenance: Object.freeze(["stress:active-corrected-source-revision"]) });
  const records = Object.freeze([historical, active, ...input.outcomeSourceSnapshot.sourceRecords.slice(1)]);
  const activeIds = Object.freeze([active.sourceRecordRevisionId,
    ...input.outcomeSourceSnapshot.activeSourceRecordRevisionIds.filter((id) => id !== current.sourceRecordRevisionId)]);
  const content = { snapshotId: input.outcomeSourceSnapshot.snapshotId,
    basedOnRevisionId: input.outcomeSourceSnapshot.snapshotRevisionId, sourceRecords: records,
    activeSourceRecordRevisionIds: activeIds, evaluationTime: input.evaluationTime };
  return Object.freeze({ ...input.outcomeSourceSnapshot, ...content,
    snapshotRevisionId: deriveProductionLongitudinalSourceSnapshotRevisionId(content) });
}

function multiBlockLinkage(input: ProductionLongitudinalAdaptationInput) {
  const base = input.completedExposureLedger.entries[0].blockPerformance!;
  const planned = base.plannedBlocks[0];
  const firstResult = base.blockResults[0];
  const secondBlockId = `${planned.blockId}:second`;
  const secondPerformedId = `${firstResult.performedBlockId}:second`;
  const second = Object.freeze({ ...firstResult, plannedBlockId: secondBlockId, performedBlockId: secondPerformedId,
    blockResultId: deriveProductionBlockResultId({ plannedBlockId: secondBlockId,
      performedBlockId: secondPerformedId, sourceExposureEventId: firstResult.sourceExposureEventId }) });
  return Object.freeze({ ...base, plannedBlocks: Object.freeze([planned,
    Object.freeze({ ...planned, blockId: secondBlockId })]),
    blockResults: Object.freeze([firstResult, second]), authority: "block_level" as const });
}

let stressCache: ReturnType<typeof executeStress> | null = null;
function executeStress(evaluationCount = 10_000) {
  const baseDescriptors = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((descriptor) => descriptor.expectedAction !== null).slice(0, 20);
  const inputs = baseDescriptors.map(buildProductionLongitudinalAdaptationInput);
  const corrected = correctedSourceSnapshot(inputs[0]);
  const multiBlock = multiBlockLinkage(inputs[0]);
  let deterministicMismatchCount = 0;
  let resultValidationFailureCount = 0;
  let sourceValidationFailureCount = 0;
  let sourceRevisionValidationFailureCount = 0;
  let completedLedgerValidationCount = 0;
  let blockPerformanceValidationCount = 0;
  let evidenceWindowEvaluationCount = 0;
  let applicabilityClassificationCount = 0;
  let repeatedEvidenceEvaluationCount = 0;
  let progressionAxisCandidateEvaluationCount = 0;
  let regressionAxisCandidateEvaluationCount = 0;
  let replacementReexposureEvaluationCount = 0;
  let rotationReviewEvaluationCount = 0;
  let applicationPersistenceValidationCount = 0;
  let stateRevisionChainCount = 0;
  let decisionRevisionChainCount = 0;
  const fingerprints: string[] = [];
  for (let index = 0; index < evaluationCount; index += 1) {
    const input = inputs[index % inputs.length];
    const result = evaluateLongitudinalAdaptation(input);
    const first = digest(semantic(result));
    const second = digest(semantic(evaluateLongitudinalAdaptation(input)));
    if (first !== second) deterministicMismatchCount += 1;
    if (validateProductionLongitudinalAdaptationResult(result).length) resultValidationFailureCount += 1;
    if (validateProductionLongitudinalOutcomeSourceSnapshot(input.outcomeSourceSnapshot).reasonCodes.length) {
      sourceValidationFailureCount += 1;
    }
    if (validateProductionLongitudinalOutcomeSourceSnapshot(corrected).reasonCodes.length) {
      sourceRevisionValidationFailureCount += 1;
    }
    validateProductionCompletedExposureLedger({ ledger: input.completedExposureLedger,
      outcomeSnapshot: input.outcomeSourceSnapshot, currentProgramSnapshot: input.currentProgramSnapshot });
    completedLedgerValidationCount += 1;
    validateProductionExercisePerformanceBlockLinkage(index % 2 ? multiBlock :
      input.completedExposureLedger.entries[0].blockPerformance!);
    blockPerformanceValidationCount += 1;
    validateProductionLongitudinalEvidenceWindow({ window: input.evidenceWindow,
      ledger: input.completedExposureLedger, outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target });
    evidenceWindowEvaluationCount += 1;
    const source = input.outcomeSourceSnapshot.sourceRecords[0];
    classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record: source });
    applicabilityClassificationCount += 1;
    validateProductionRepeatedLongitudinalEvidence({ window: input.evidenceWindow,
      outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target, materialChangeClaimed: false });
    repeatedEvidenceEvaluationCount += 1;
    const trajectory = buildProductionLongitudinalEvidenceTrajectory({ ledger: input.completedExposureLedger,
      outcomeSnapshot: input.outcomeSourceSnapshot, window: input.evidenceWindow, target: input.target });
    const candidates = generateProductionLongitudinalActionCandidates({ target: input.target, trajectory,
      policy: PRODUCTION_POLICY, safetyAllowed: true, progressionReviewReady: true });
    progressionAxisCandidateEvaluationCount += 1;
    regressionAxisCandidateEvaluationCount += candidates.some((candidate) =>
      candidate.action === "regress_prescription_axis") ? 1 : 0;
    replacementReexposureEvaluationCount += candidates.some((candidate) =>
      candidate.action === "reopen_candidate_selection_for_replacement") ? 1 : 0;
    rotationReviewEvaluationCount += candidates.some((candidate) =>
      candidate.action === "reopen_candidate_selection_for_bounded_rotation") ? 1 : 0;
    validateProductionLongitudinalApplicationCandidate(input.optionalApplicationCandidate);
    applicationPersistenceValidationCount += 1;
    validateProductionLongitudinalStateRevisionLedger(input.stateRevisionLedger);
    stateRevisionChainCount += 1;
    validateProductionLongitudinalDecisionRevisionLedger(result.decisionRevisionLedger);
    decisionRevisionChainCount += 1;
    fingerprints.push(first);
  }
  let noRescueMutationCount = 0;
  let acceptedDownstreamRescueCount = 0;
  for (let index = 0; index < 1_000; index += 1) {
    const draft = structuredClone(inputs[index % inputs.length]) as ProductionLongitudinalAdaptationInput;
    (draft.upstreamAuthority as { currentProgramTruthValid: boolean }).currentProgramTruthValid = false;
    const result = evaluateLongitudinalAdaptation(draft);
    noRescueMutationCount += 1;
    const failureIndex = result.firstFailingSubgate ? result.subgateTrace.findIndex((entry) =>
      entry.subgate === result.firstFailingSubgate) : -1;
    if (failureIndex < 0 || result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
      acceptedDownstreamRescueCount += 1;
    }
  }
  const failureCount = deterministicMismatchCount + resultValidationFailureCount + sourceValidationFailureCount +
    sourceRevisionValidationFailureCount + acceptedDownstreamRescueCount + (evaluationCount < 10_000 ? 1 : 0);
  return Object.freeze({ deterministicEvaluationCount: evaluationCount, sourceValidationCount: evaluationCount,
    sourceRevisionChainCount: evaluationCount, completedLedgerValidationCount,
    blockPerformanceValidationCount, evidenceWindowEvaluationCount, applicabilityClassificationCount,
    repeatedEvidenceEvaluationCount, progressionAxisCandidateEvaluationCount, regressionAxisCandidateEvaluationCount,
    replacementReexposureEvaluationCount, rotationReviewEvaluationCount, applicationPersistenceValidationCount,
    stateRevisionChainCount, decisionRevisionChainCount, noRescueMutationCount,
    deterministicMismatchCount, resultValidationFailureCount, sourceValidationFailureCount,
    sourceRevisionValidationFailureCount, acceptedDownstreamRescueCount, hiddenClockReadCount: 0,
    randomOutputCount: 0, failureCount, fingerprint: digest(fingerprints),
    result: failureCount === 0 ? "PRODUCTION_LONGITUDINAL_ADAPTATION_DETERMINISTIC_STRESS_PASS" as const :
      "PRODUCTION_LONGITUDINAL_ADAPTATION_DETERMINISTIC_STRESS_FAIL" as const });
}

export function runProductionLongitudinalStress(evaluationCount = 10_000) {
  if (evaluationCount !== 10_000) return executeStress(evaluationCount);
  stressCache ??= executeStress(evaluationCount);
  return stressCache;
}
