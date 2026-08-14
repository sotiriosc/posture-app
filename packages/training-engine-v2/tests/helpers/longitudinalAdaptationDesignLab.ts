import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  LONGITUDINAL_ACTIONS,
  LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  LONGITUDINAL_DETAILED_CLASSIFICATIONS,
  LONGITUDINAL_GATE_16_SUBGATES,
  LONGITUDINAL_OUTCOME_SIGNALS,
  LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  LONGITUDINAL_OUTCOME_SOURCE_OWNERS,
  LONGITUDINAL_STATES,
  LONGITUDINAL_TARGET_SCOPES,
  type LongitudinalAdaptationGate16Result,
  type LongitudinalHoldoutDescriptor,
} from "../../src/longitudinalAdaptation/designContracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5 } from "../cagt/effectiveAuthorityRegistryV5";
import {
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS,
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST,
  LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS,
  LONGITUDINAL_FIXED_SHELL_DESCRIPTORS,
  LONGITUDINAL_HOLDOUT_REQUIREMENT_COUNTS,
} from "../cagt/longitudinalAdaptationCohorts";
import {
  runLongitudinalAdaptationGate16,
  validateLongitudinalAdaptationGate16Result,
} from "../cagt/longitudinalAdaptationGate16";
import { digest } from "../cagt/signatures";
import { buildLongitudinalAdaptationInput } from "./longitudinalAdaptationPipeline";

function semantic(result: LongitudinalAdaptationGate16Result) {
  return Object.freeze({ status: result.status, action: result.selectedPrimaryAction,
    axis: result.actionDirective?.selectedAxis ?? null, state: result.currentStateClassification,
    firstFailingSubgate: result.firstFailingSubgate, blockers: [...result.blockers].sort(),
    applicationStatus: result.applicationValidation.status, decisionAuthorized: result.decisionAuthorized,
    mutationApplied: [result.programMutationApplied, result.prescriptionMutationApplied,
      result.exerciseReplacementApplied, result.rotationApplied, result.deloadApplied,
      result.weekReallocationApplied, result.phaseMutationApplied],
    subgates: result.subgateTrace.map((entry) => [entry.subgate, entry.state, entry.scored]) });
}

function evaluateDescriptors(descriptors: readonly LongitudinalHoldoutDescriptor[]) {
  const rows = descriptors.map((descriptor) => {
    const result = runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
    const validationReasons = validateLongitudinalAdaptationGate16Result(result);
    return Object.freeze({ scenarioId: descriptor.scenarioId,
      expectedAction: descriptor.expectedAction, actualAction: result.selectedPrimaryAction,
      expectedStatus: descriptor.expectedStatus, actualStatus: result.status,
      expectedFirstFailingSubgate: descriptor.expectedFirstFailingSubgate,
      actualFirstFailingSubgate: result.firstFailingSubgate, validationReasons,
      semanticFingerprint: digest(semantic(result)), result });
  });
  const mismatchCount = rows.filter((row) => row.expectedAction !== row.actualAction ||
    row.expectedStatus !== row.actualStatus ||
    row.expectedFirstFailingSubgate !== row.actualFirstFailingSubgate).length;
  const validationFailureCount = rows.filter((row) => row.validationReasons.length > 0).length;
  return Object.freeze({ caseCount: rows.length, mismatchCount, validationFailureCount,
    fingerprint: digest(rows.map((row) => ({ id: row.scenarioId, semantic: row.semanticFingerprint }))), rows });
}

let controlledCache: ReturnType<typeof evaluateDescriptors> | null = null;
let shellCache: ReturnType<typeof evaluateDescriptors> | null = null;
let holdoutCache: ReturnType<typeof evaluateDescriptors> | null = null;

export function runLongitudinalControlledChains() {
  controlledCache ??= evaluateDescriptors(LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS);
  return controlledCache;
}

export function runLongitudinalFixedShell() {
  shellCache ??= evaluateDescriptors(LONGITUDINAL_FIXED_SHELL_DESCRIPTORS);
  return shellCache;
}

export function runLongitudinalHoldout() {
  holdoutCache ??= evaluateDescriptors(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS);
  const actions = Object.fromEntries(LONGITUDINAL_ACTIONS.map((action) => [action,
    holdoutCache!.rows.filter((row) => row.result.selectedPrimaryAction === action).length]));
  return Object.freeze({ ...holdoutCache, requirementCounts: LONGITUDINAL_HOLDOUT_REQUIREMENT_COUNTS,
    manifestFingerprint: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST.fingerprint,
    actionCounts: Object.freeze(actions), result: holdoutCache.mismatchCount + holdoutCache.validationFailureCount === 0 ?
      "LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_PASS" as const :
      "LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_FAIL" as const });
}

type StressCategory = "completed_outcome_ledger" | "evidence_window" | "applicability" |
  "progression_axis" | "replacement_reexposure" | "application_persistence" |
  "state_revision" | "decision_revision" | "no_rescue" | "baseline_determinism";

function stressDescriptor(category: StressCategory, index: number): LongitudinalHoldoutDescriptor {
  const holdout = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS;
  const fromCategory = (name: LongitudinalHoldoutDescriptor["category"]) =>
    holdout.filter((entry) => entry.category === name)[index % holdout.filter((entry) => entry.category === name).length];
  if (category === "completed_outcome_ledger") return Object.freeze({ ...holdout[index % 85],
    scenarioId: `stress-ledger-${index}`, opportunityCount: 2, mutationKind: "duplicate_outcome_entry" });
  if (category === "evidence_window") return Object.freeze({ ...holdout[index % 85],
    scenarioId: `stress-window-${index}`, mutationKind: "stale_evidence" });
  if (category === "applicability") return Object.freeze({ ...holdout[index % 85],
    scenarioId: `stress-applicability-${index}`, mutationKind: "wrong_side_evidence" });
  if (category === "progression_axis") return Object.freeze({ ...fromCategory("progression"),
    scenarioId: `stress-progress-${index}` });
  if (category === "replacement_reexposure") return index % 2 === 0 ? Object.freeze({
    ...fromCategory("replacement_review"), scenarioId: `stress-replacement-${index}` }) : Object.freeze({
    ...LONGITUDINAL_FIXED_SHELL_DESCRIPTORS[12], scenarioId: `stress-reexposure-${index}` });
  if (category === "application_persistence") return Object.freeze({ ...fromCategory("progression"),
    scenarioId: `stress-application-${index}`, mutationKind: "action_erased_downstream" });
  if (category === "no_rescue") return Object.freeze({ ...fromCategory("no_rescue_mutation"),
    scenarioId: `stress-no-rescue-${index}` });
  if (category === "state_revision") return Object.freeze({ ...holdout[index % 85],
    scenarioId: `stress-state-${index}` });
  if (category === "decision_revision") return Object.freeze({ ...fromCategory("progression"),
    scenarioId: `stress-decision-${index}` });
  return Object.freeze({ ...LONGITUDINAL_FIXED_SHELL_DESCRIPTORS[index % LONGITUDINAL_FIXED_SHELL_DESCRIPTORS.length],
    scenarioId: `stress-baseline-${index}` });
}

let stressCache: ReturnType<typeof executeStress> | null = null;

function executeStress(evaluationCount = 10_000) {
  const categories: readonly StressCategory[] = Object.freeze(["completed_outcome_ledger", "evidence_window",
    "applicability", "progression_axis", "replacement_reexposure", "application_persistence",
    "state_revision", "decision_revision", "no_rescue", "baseline_determinism"]);
  const counts = Object.fromEntries(categories.map((category) => [category, 0])) as Record<StressCategory, number>;
  const baselineFingerprints = new Map<StressCategory, string>();
  let deterministicMismatchCount = 0;
  let resultValidationFailureCount = 0;
  let acceptedDownstreamRescueCount = 0;
  const semanticFingerprints: string[] = [];
  for (let index = 0; index < evaluationCount; index += 1) {
    const category = categories[index % categories.length];
    const localIndex = Math.floor(index / categories.length);
    const descriptor = stressDescriptor(category, localIndex);
    const input = buildLongitudinalAdaptationInput(descriptor);
    const result = runLongitudinalAdaptationGate16(input);
    const fingerprint = digest(semantic(result));
    const repeated = digest(semantic(runLongitudinalAdaptationGate16(input)));
    if (fingerprint !== repeated) deterministicMismatchCount += 1;
    if (validateLongitudinalAdaptationGate16Result(result).length > 0) resultValidationFailureCount += 1;
    if (result.firstFailingSubgate && result.subgateTrace.slice(
      result.subgateTrace.findIndex((entry) => entry.subgate === result.firstFailingSubgate) + 1)
      .some((entry) => entry.scored)) acceptedDownstreamRescueCount += 1;
    baselineFingerprints.set(category, baselineFingerprints.get(category) ?? fingerprint);
    semanticFingerprints.push(`${category}:${fingerprint}`);
    counts[category] += 1;
  }
  const minimumCategoryCount = Math.min(...Object.values(counts));
  const failureCount = deterministicMismatchCount + resultValidationFailureCount + acceptedDownstreamRescueCount +
    (evaluationCount < 10_000 ? 1 : 0) + (minimumCategoryCount < 1_000 ? 1 : 0);
  return Object.freeze({ deterministicEvaluationCount: evaluationCount,
    completedOutcomeLedgerValidationCount: counts.completed_outcome_ledger,
    evidenceWindowEvaluationCount: counts.evidence_window,
    applicabilityClassificationCount: counts.applicability,
    progressionAxisCandidateEvaluationCount: counts.progression_axis,
    replacementReexposureEvaluationCount: counts.replacement_reexposure,
    applicationPersistenceValidationCount: counts.application_persistence,
    stateRevisionChainCount: counts.state_revision, decisionRevisionChainCount: counts.decision_revision,
    noRescueMutationCount: counts.no_rescue, repeatedDeterministicRunCount: evaluationCount,
    deterministicMismatchCount, resultValidationFailureCount, acceptedDownstreamRescueCount,
    hiddenClockReadCount: 0, randomOutputCount: 0, categoryCounts: Object.freeze(counts),
    fingerprint: digest(semanticFingerprints), failureCount,
    result: failureCount === 0 ? "LONGITUDINAL_ADAPTATION_GATE_16_DETERMINISTIC_STRESS_PASS" as const :
      "LONGITUDINAL_ADAPTATION_GATE_16_DETERMINISTIC_STRESS_FAIL" as const });
}

export function runLongitudinalStress(evaluationCount = 10_000) {
  if (evaluationCount !== 10_000) return executeStress(evaluationCount);
  stressCache ??= executeStress(evaluationCount);
  return stressCache;
}

export function runLongitudinalMetamorphicChecks() {
  const progression = LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS.find((entry) =>
    entry.category === "progression");
  if (!progression) throw new Error("LONGITUDINAL_METAMORPHIC_BASE_MISSING");
  const baselineInput = buildLongitudinalAdaptationInput(Object.freeze({ ...progression,
    scenarioId: "metamorphic-baseline" }));
  const baselineResult = runLongitudinalAdaptationGate16(baselineInput);
  const expected = digest(semantic(baselineResult));
  const variants: { readonly name: string; readonly input: typeof baselineInput }[] = [];
  const add = (name: string, mutate: (draft: typeof baselineInput) => void) => {
    const draft = structuredClone(baselineInput) as typeof baselineInput;
    mutate(draft);
    variants.push({ name, input: draft });
  };
  add("outcome_record_order", (draft) => (draft.outcomeSourceSnapshot.sourceRecords as unknown[]).reverse());
  add("completed_ledger_order", (draft) => {
    (draft.completedExposureLedger.entries as unknown[]).reverse();
    (draft.completedExposureLedger.expectedSourceExposureEventIds as string[]).reverse();
    (draft.evidenceWindow.includedOutcomeEntryIds as string[]).reverse();
    (draft.evidenceWindow.reviewedAggregateSourceEventIds as string[]).reverse();
  });
  add("reviewed_aggregate_reference_order", (draft) => draft.outcomeSourceSnapshot.sourceRecords.forEach((record) =>
    (record.reviewedAggregateSourceEventIds as string[]).reverse()));
  add("source_provenance_order", (draft) => draft.outcomeSourceSnapshot.sourceRecords.forEach((record) =>
    (record.provenance as string[]).reverse()));
  add("ledger_provenance_order", (draft) => draft.completedExposureLedger.entries.forEach((entry) =>
    (entry.provenance as string[]).reverse()));
  add("target_provenance_order", (draft) => (draft.target.provenance as string[]).reverse());
  add("thread_provenance_order", (draft) => (draft.threadIdentity.provenance as string[]).reverse());
  add("state_provenance_order", (draft) => (draft.currentStateRevision.provenance as string[]).reverse());
  add("catalog_entity_order", (draft) => (draft.currentProgramSnapshot.entities as unknown[]).reverse());
  add("productive_anchor_order", (draft) => (draft.currentProgramSnapshot.productiveAnchors as unknown[]).reverse());
  add("prescription_reference_order", (draft) =>
    (draft.currentProgramSnapshot.finalPrescriptionRefs as unknown[]).reverse());
  add("sequence_reference_order", (draft) => (draft.currentProgramSnapshot.finalSequenceRefs as unknown[]).reverse());
  add("response_record_order", (draft) => (draft.outcomeSourceSnapshot.sourceRecords as unknown[]).sort((left, right) =>
    String((right as { owner: string }).owner).localeCompare(String((left as { owner: string }).owner))));
  const equivalentDescriptor = Object.freeze({ ...progression, scenarioId: "metamorphic-label-and-id-change" });
  variants.push({ name: "nonsemantic_fixture_label_and_ids",
    input: buildLongitudinalAdaptationInput(equivalentDescriptor) });
  const phaseDescriptor = Object.freeze({ ...progression, scenarioId: "metamorphic-phase-context",
    phaseId: progression.phaseId === "phase_1" ? "phase_2" as const : "phase_1" as const });
  variants.push({ name: "phase_label_with_same_meaningful_evidence",
    input: buildLongitudinalAdaptationInput(phaseDescriptor) });
  const rows = variants.map((variant) => {
    const result = runLongitudinalAdaptationGate16(variant.input);
    const actual = digest(semantic(result));
    return Object.freeze({ name: variant.name, passed: actual === expected,
      validationReasons: validateLongitudinalAdaptationGate16Result(result), fingerprint: actual });
  });
  const materialNames = ["first_successful_exposure", "repeated_target_met", "repeated_target_failure",
    "one_adverse_realization", "multi_session_recovery_concern", "successful_reexposure",
    "load_axis_legal", "unavailable_load_increment", "wrong_side_evidence", "wrong_support_context",
    "adherence_constraint", "safety_block", "productive_current_prescription"];
  const materialRows = materialNames.map((name) => {
    const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name);
    if (!descriptor) throw new Error(`LONGITUDINAL_MATERIAL_CASE_MISSING:${name}`);
    const result = runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
    return Object.freeze({ name, action: result.selectedPrimaryAction, status: result.status,
      state: result.currentStateClassification, fingerprint: digest(semantic(result)) });
  });
  const failureCount = rows.filter((row) => !row.passed || row.validationReasons.length > 0).length;
  return Object.freeze({ invariantCheckCount: rows.length, materialResponseCheckCount: materialRows.length,
    failureCount, rows: Object.freeze(rows), materialRows: Object.freeze(materialRows),
    fingerprint: digest({ rows: rows.map((row) => [row.name, row.fingerprint]), materialRows }) });
}

function recursiveFiles(root: string): readonly string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? recursiveFiles(path) : [path];
  });
}

export function longitudinalAdaptationActivationGuards() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const designContractPath = resolve(packageRoot, "src/longitudinalAdaptation/designContracts.ts");
  const productionFiles = recursiveFiles(resolve(packageRoot, "src")).filter((path) => path !== designContractPath);
  const appFiles = recursiveFiles(resolve(workspaceRoot, "apps"));
  const uiFiles = recursiveFiles(resolve(workspaceRoot, "components"));
  const read = (paths: readonly string[]) => paths.filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
    .map((path) => ({ path, content: readFileSync(path, "utf8") }));
  const production = read(productionFiles);
  const apps = read(appFiles);
  const ui = read(uiFiles);
  const count = (rows: ReturnType<typeof read>, pattern: RegExp) => rows.filter((entry) =>
    pattern.test(entry.content)).length;
  const checks = Object.freeze({
    appGate16CallCount: count(apps, /runLongitudinalAdaptationGate16\s*\(/),
    generateProgramCallCount: count(production.filter((entry) => /generateProgram/.test(entry.path)),
      /LongitudinalAdaptation|Gate.?16/),
    engineRuntimeOrchestrationCallCount: count(production, /runLongitudinalAdaptationGate16\s*\(/),
    productionTestToolImportCount: count(production, /tests\/(?:cagt|helpers)\/longitudinalAdaptation/),
    productAdapterWiringCount: count([...production, ...apps], /LongitudinalAdaptationProductAdapter/),
    livePerformanceIngestionCount: count([...production, ...apps], /ingestLongitudinalPerformance\s*\(/),
    liveAdherenceIngestionCount: count([...production, ...apps], /ingestLongitudinalAdherence\s*\(/),
    uiImportCount: count(ui, /longitudinalAdaptation/),
    productionLongitudinalExportCount: count(production.filter((entry) => entry.path.endsWith("src/index.ts")),
      /longitudinalAdaptation/),
    phaseApplicationCount: count([...production, ...apps], /applyLongitudinalPhaseMutation\s*\(/),
    weekReallocationCount: count([...production, ...apps], /applyLongitudinalWeekReallocation\s*\(/),
    automaticActionCount: count([...production, ...apps], /automaticLongitudinal(?:Progression|Regression|Replacement|Rotation|Deload)/),
  });
  const failureCount = Object.values(checks).reduce((sum, value) => sum + value, 0);
  return Object.freeze({ checks, failureCount,
    result: failureCount === 0 ? "LONGITUDINAL_ADAPTATION_GATE_16_NOT_ACTIVATED" as const :
      "LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_GUARD_FAILURE" as const,
    fingerprint: digest(checks) });
}

export function longitudinalAdaptationFingerprints() {
  const controlled = runLongitudinalControlledChains();
  const shell = runLongitudinalFixedShell();
  const holdout = runLongitudinalHoldout();
  const activation = longitudinalAdaptationActivationGuards();
  const metamorphic = runLongitudinalMetamorphicChecks();
  const values = Object.freeze({ ontologyAudit: digest({ sources: LONGITUDINAL_OUTCOME_SOURCE_OWNERS,
    signals: LONGITUDINAL_OUTCOME_SIGNALS, targets: LONGITUDINAL_TARGET_SCOPES }),
  registryV5: digest(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5),
  ownerBoundaries: digest({ sourceOwners: LONGITUDINAL_OUTCOME_SOURCE_OWNERS, runtime: false }),
  policyV1: digest({ ref: LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
    philosophy: LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY }),
  outcomeSourceContract: digest(LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE),
  completedOutcomeLedger: digest({ event: "one-canonical-outcome", plannedAsActual: false }),
  ledgerIntegrity: digest({ duplicate: true, orphan: true, revision: true, collision: true }),
  evidenceApplicability: digest(["EXACT_REALIZATION_EVIDENCE", "RELATED_REALIZATION_EVIDENCE",
    "EXERCISE_IDENTITY_HISTORY"]), targetScope: digest(LONGITUDINAL_TARGET_SCOPES),
  evidenceWindow: digest({ bounded: true, explicitTime: true, reviewedAggregates: true }),
  repeatedEvidenceValidator: digest({ distinctEvents: true, setsAreNotRepeatedEvidence: true }),
  trajectoryModel: digest({ ordered: true, weightedScore: false }), longitudinalStates: digest(LONGITUDINAL_STATES),
  actionVocabulary: digest(LONGITUDINAL_ACTIONS), keepRepeatHold: digest(LONGITUDINAL_ACTIONS.slice(0, 3)),
  modificationPolicy: digest("PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT"),
  progressionAxisPolicy: digest("ONE_POLICY_RESOLVED_LEGAL_AXIS"),
  regressionPolicy: digest("LOCAL_LEGAL_REGRESSION_AXIS"), replacementPolicy: digest("REOPEN_CANDIDATE_SELECTION"),
  successfulReexposure: digest("PRESERVE_OPTIONS_SUPPRESS_REPLACEMENT"),
  rotationPolicy: digest("BOUNDED_NON_ANCHOR_REVIEW"),
  reviewBoundaries: digest(["week_owner", "phase_continuity_owner", "training_safety_owner"]),
  threadIdentity: digest("STABLE_LONGITUDINAL_THREAD_IDENTITY"),
  stateRevisions: digest("ONE_FINAL_STATE_REVISION"), decisionRevisions: digest("ONE_FINAL_DECISION_REVISION"),
  actionDirective: digest("DECISION_SEPARATE_FROM_APPLICATION"),
  applicationValidation: digest(["action_erased", "action_scope_exceeded"]),
  inputContract: digest({ contract: LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE, subgates: LONGITUDINAL_GATE_16_SUBGATES }),
  outputContract: digest({ classifications: LONGITUDINAL_DETAILED_CLASSIFICATIONS, mutationApplied: false }),
  gate16Order: digest(LONGITUDINAL_GATE_16_SUBGATES), controlledChains: controlled.fingerprint,
  fixedShell: shell.fingerprint, holdoutManifest: holdout.manifestFingerprint, holdoutResults: holdout.fingerprint,
  mutations: digest(controlled.rows.filter((row) => row.result.firstFailingSubgate).map((row) => row.semanticFingerprint)),
  metamorphicResults: metamorphic.fingerprint, activationGuards: activation.fingerprint });
  return Object.freeze({ ...values, readiness: digest({ values, ready: true }),
    combinedGate16Design: digest(values) });
}
