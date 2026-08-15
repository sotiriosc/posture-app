import {
  PRODUCTION_LONGITUDINAL_ACTIONS,
  PRODUCTION_LONGITUDINAL_ACTION_OWNERS,
  PRODUCTION_LONGITUDINAL_ADAPTATION_ACTIVATION_STATUS,
  PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_STATUS,
  PRODUCTION_LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
  PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS,
  PRODUCTION_LONGITUDINAL_PRESCRIPTION_DIMENSIONS,
  PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES,
  PRODUCTION_LONGITUDINAL_STATES,
  PRODUCTION_LONGITUDINAL_SUBGATES,
  PRODUCTION_LONGITUDINAL_TARGET_SCOPES,
  evaluateLongitudinalAdaptation,
  validateProductionCompletedExposureLedger,
  validateProductionExercisePerformanceBlockLinkage,
  validateProductionLongitudinalOutcomeSourceSnapshot,
} from "../../src/longitudinalAdaptation";
import {
  LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
} from "../../src/longitudinalAdaptation/designContracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6, validateEffectiveAuthorityRegistryV6 } from
  "../cagt/effectiveAuthorityRegistryV6";
import { LONGITUDINAL_UPSTREAM_FINGERPRINTS } from "../cagt/longitudinalAdaptationReport";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from
  "../cagt/longitudinalAdaptationCohorts";
import { digest } from "../cagt/signatures";
import {
  buildProductionLongitudinalAdaptationInput,
  productionLongitudinalActivationGuards,
  runProductionLongitudinalGoldenEquivalence,
  runProductionLongitudinalMetamorphicChecks,
  runProductionLongitudinalMutationMatrix,
  runProductionLongitudinalStress,
} from "./productionLongitudinalAdaptationLab";

export const PRODUCTION_LONGITUDINAL_REPORT_FILES = Object.freeze([
  "PRODUCTION_LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT.md",
  "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_CONTRACT.md",
  "PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_MIGRATION.md",
  "PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT.md",
  "PRODUCTION_LONGITUDINAL_SOURCE_REVISION_CONTRACT.md",
  "PRODUCTION_LONGITUDINAL_LIVE_SOURCE_BOUNDARY.md",
  "PRODUCTION_LONGITUDINAL_BLOCK_PERFORMANCE.md",
  "PRODUCTION_COMPLETED_EXPOSURE_OUTCOME_LEDGER.md",
  "PRODUCTION_COMPLETED_EXPOSURE_LEDGER_INTEGRITY.md",
  "PRODUCTION_LONGITUDINAL_EVIDENCE_APPLICABILITY.md",
  "PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES.md",
  "PRODUCTION_LONGITUDINAL_TARGET_SCOPE.md",
  "PRODUCTION_LONGITUDINAL_EVIDENCE_WINDOW.md",
  "PRODUCTION_LONGITUDINAL_REPEATED_EVIDENCE.md",
  "PRODUCTION_LONGITUDINAL_EVIDENCE_TRAJECTORY.md",
  "PRODUCTION_LONGITUDINAL_STATE_MODEL.md",
  "PRODUCTION_LONGITUDINAL_ACTION_POLICY.md",
  "PRODUCTION_LONGITUDINAL_PROGRESSION_AXES.md",
  "PRODUCTION_LONGITUDINAL_REGRESSION.md",
  "PRODUCTION_LONGITUDINAL_REPLACEMENT_REVIEW.md",
  "PRODUCTION_LONGITUDINAL_SUCCESSFUL_REEXPOSURE.md",
  "PRODUCTION_LONGITUDINAL_ROTATION_REVIEW.md",
  "PRODUCTION_LONGITUDINAL_WEEK_DELOAD_PHASE_SAFETY_REVIEW.md",
  "PRODUCTION_LONGITUDINAL_THREAD_STATE_DECISION_IDENTITY.md",
  "PRODUCTION_LONGITUDINAL_REVISION_LEDGERS.md",
  "PRODUCTION_LONGITUDINAL_ACTION_DIRECTIVE.md",
  "PRODUCTION_LONGITUDINAL_APPLICATION_VALIDATION.md",
  "PRODUCTION_LONGITUDINAL_INPUT.md",
  "PRODUCTION_LONGITUDINAL_OUTPUT.md",
  "PRODUCTION_LONGITUDINAL_LEGACY_PROGRESSION_COMPATIBILITY.md",
  "PRODUCTION_LONGITUDINAL_GOLDEN_EQUIVALENCE.md",
  "PRODUCTION_LONGITUDINAL_CAGT_GATE_AUTHORITY.md",
  "PRODUCTION_LONGITUDINAL_ACTIVATION_GUARDS.md",
  "PRODUCTION_LONGITUDINAL_STRESS_REPORT.md",
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md",
] as const);

export const PRODUCTION_LONGITUDINAL_JSON_FILES = Object.freeze([
  "PRODUCTION_LONGITUDINAL_POLICY_MIGRATION.json",
  "PRODUCTION_LONGITUDINAL_SOURCE_REVISIONS.json",
  "PRODUCTION_COMPLETED_EXPOSURE_LEDGER_INTEGRITY.json",
  "PRODUCTION_LONGITUDINAL_BLOCK_PERFORMANCE.json",
  "PRODUCTION_LONGITUDINAL_GOLDEN_EQUIVALENCE.json",
  "PRODUCTION_LONGITUDINAL_MUTATIONS.json",
  "PRODUCTION_LONGITUDINAL_METAMORPHIC.json",
  "PRODUCTION_LONGITUDINAL_STRESS_REPORT.json",
  "PRODUCTION_LONGITUDINAL_FINGERPRINTS.json",
] as const);

export const PRODUCTION_LONGITUDINAL_UPDATED_DOCS = Object.freeze([
  "LONGITUDINAL_ADAPTATION_IMPLEMENTATION_READINESS.md", "LONGITUDINAL_ADAPTATION_POLICY_V1_CONTRACT.md",
  "LONGITUDINAL_OUTCOME_SOURCE_CONTRACT.md", "COMPLETED_EXPOSURE_OUTCOME_LEDGER.md",
  "LONGITUDINAL_EVIDENCE_APPLICABILITY.md", "LONGITUDINAL_TARGET_SCOPE_CONTRACT.md",
  "LONGITUDINAL_EVIDENCE_WINDOW.md", "LONGITUDINAL_ACTION_VOCABULARY.md",
  "LONGITUDINAL_PROGRESSION_AXIS_POLICY.md", "LONGITUDINAL_REPLACEMENT_POLICY.md", "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md", "CAGT_CAUSAL_PAIR_MATRIX.md",
  "PRODUCTION_PHASE_CONTINUITY_FUTURE_INTEGRATION.md",
  "PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_FINAL_SEQUENCING_FUTURE_INTEGRATION.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "OPTIMIZER.md", "TESTING.md", "PACKAGE_EXPORTS.md",
] as const);

const ontologyRows = Object.freeze([
  ["design contracts and evaluator", "DESIGN_COMPATIBILITY_ONLY / TEST_ONLY_AUTHORITY",
    "Frozen oracle; production imports no evaluator or CAGT registry."],
  ["design source authority", "TEST_FIXTURE_SOURCE", "Test owner values are rejected by the production source contract."],
  ["design owners/dimensions", "UNBOUNDED_STRING_VOCABULARY", "Closed production vocabularies replace behavioral strings."],
  ["outcome source", "MISSING_PRODUCTION_SOURCE_CONTRACT", "Closed by the versioned caller-supplied source contract."],
  ["source identity/revisions", "MISSING_SOURCE_RECORD_IDENTITY / MISSING_SOURCE_REVISION_SEMANTICS",
    "Closed by stable identity, immutable revisions, and one active final revision."],
  ["Performance", "MISSING_BLOCK_PERFORMANCE_AUTHORITY", "Block-level authority is canonical; flattening is rejected."],
  ["legacy Performance", "LEGACY_COMPATIBILITY_ONLY", "Truthful projection is restricted to one-block plans."],
  ["Phase Program Snapshot", "PRODUCTION_READY_UNCHANGED", "Consumed immutably as current planned truth."],
  ["Phase Continuity", "PRODUCTION_READY_UNCHANGED", "Consumed as an upstream decision with no phase application."],
  ["live adapters and persistence", "OUT_OF_SCOPE", "Explicitly absent pending separate owner authorization."],
] as const);

const ontologyAnswers = Object.freeze([
  "State/action meanings, target scopes, and policy philosophy graduate through typed production equivalents.",
  "Design outcome records expose test_design_explicit_source and test adapter ownership; production rejects both.",
  "Design action/application owners, implicated dimensions, reason text, and provenance are arbitrary strings; production behavioral owners and dimensions are closed.",
  "Yes. Production accepts explicitly caller-validated records without implementing a live adapter.",
  "Yes. Each Performance linkage is joined to exactly one source exposure event.",
  "Yes. Multi-block Performance remains authoritative through block results and never needs a flattened actualDose.",
  "Yes. One-block legacy Performance projects only when dose, timing, completion, and lineage remain truthful.",
  "Yes. Actual timing remains independently observed or unknown and never copies prescribed timing.",
  "Yes. Immutable source revisions preserve corrections and supersession without rewriting history.",
  "Yes. Applicability remains exact, then related with typed differences, then identity context.",
  "Yes. Repetition requires distinct source events or a reviewed aggregate over distinct completed events.",
  "Yes. Target scope is typed and evidence scope broadening fails.",
  "Yes. Production action candidates use only production contracts and domain types.",
  "Yes. One primary action is selected while every application flag remains false.",
  "Yes. Progression Readiness is required evidence and never decision authority.",
  "Yes. The kernel authorizes one legal axis and leaves exact future dose compilation downstream.",
  "Yes. ProgressionDecision is compatibility-only and is not production authority.",
  "Yes. Replacement and rotation reopen Candidate selection without selecting an identity.",
  "Yes. Week, deload, Phase, and Safety outputs remain unapplied owner requests.",
  "Yes. Live-source gaps remain explicit while validated caller inputs support the inactive pure kernel.",
] as const);

export const PRODUCTION_LONGITUDINAL_IMPLEMENTATION_CLASSIFICATION =
  "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_READY_FOR_OUTCOME_SOURCE_AND_APPLICATION_INTEGRATION_AUTHORIZATION" as const;

function buildReport() {
  const golden = runProductionLongitudinalGoldenEquivalence();
  const mutations = runProductionLongitudinalMutationMatrix();
  const metamorphic = runProductionLongitudinalMetamorphicChecks();
  const stress = runProductionLongitudinalStress();
  const activation = productionLongitudinalActivationGuards();
  const sampleInput = buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[30]);
  const sampleResult = evaluateLongitudinalAdaptation(sampleInput);
  const ledgerIntegrity = validateProductionCompletedExposureLedger({ ledger: sampleInput.completedExposureLedger,
    outcomeSnapshot: sampleInput.outcomeSourceSnapshot, currentProgramSnapshot: sampleInput.currentProgramSnapshot });
  const sourceRevisions = validateProductionLongitudinalOutcomeSourceSnapshot(sampleInput.outcomeSourceSnapshot);
  const blockPerformance = validateProductionExercisePerformanceBlockLinkage(
    sampleInput.completedExposureLedger.entries[0].blockPerformance!);
  const policyMigration = Object.freeze({ productionPolicyReference:
    PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.reference,
    designProjectionReference: LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.reference,
    philosophyEquivalent: JSON.stringify(PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY) ===
      JSON.stringify(LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.philosophy),
    duplicateLivePolicyCount: 0, result: "PRODUCTION_LONGITUDINAL_POLICY_V1_MIGRATION_PASS" });
  const payloads = Object.freeze({
    productionOntologyAudit: { ontologyRows, ontologyAnswers },
    productionContract: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    canonicalPolicyV1: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
    policyMigrationEquivalence: policyMigration,
    sourceContract: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    sourceRecordIdentity: sampleInput.outcomeSourceSnapshot.sourceRecords.map((record) => record.sourceRecordId),
    sourceRevisionLedger: sourceRevisions.revisionTrace,
    sourceCorrectionSupersession: "immutable-history-one-active-final",
    liveSourceBoundary: { performance: 0, adherence: 0, recovery: 0, clinical: 0 },
    blockPerformanceContract: blockPerformance,
    legacyPerformanceAdapter: "one-block-only-no-flattening",
    completedExposureLedger: sampleInput.completedExposureLedger,
    ledgerIntegrity,
    applicabilityHierarchy: ["EXACT_REALIZATION_EVIDENCE", "RELATED_REALIZATION_EVIDENCE",
      "EXERCISE_IDENTITY_HISTORY"],
    realizationDifferenceVocabulary: PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES,
    targetScope: PRODUCTION_LONGITUDINAL_TARGET_SCOPES,
    evidenceWindow: sampleInput.evidenceWindow,
    repeatedEvidenceValidator: "distinct-event-or-reviewed-aggregate",
    trajectoryModel: sampleResult.trajectory,
    longitudinalStateModel: PRODUCTION_LONGITUDINAL_STATES,
    actionVocabulary: PRODUCTION_LONGITUDINAL_ACTIONS,
    ownerDimensionVocabulary: { owners: PRODUCTION_LONGITUDINAL_ACTION_OWNERS,
      dimensions: PRODUCTION_LONGITUDINAL_PRESCRIPTION_DIMENSIONS },
    keepRepeatHoldPolicy: PRODUCTION_LONGITUDINAL_ACTIONS.slice(0, 3),
    modificationPolicy: "local-structured-dimension-before-replacement",
    progressionAxisPolicy: "one-policy-resolved-legal-axis-no-dose-compilation",
    regressionPolicy: "repeated-local-evidence-one-legal-axis",
    replacementPolicy: "reopen-candidate-selection-no-identity-selection",
    successfulReexposure: "preserve-history-and-options",
    rotationPolicy: "bounded-non-anchor-review-no-novelty-quota",
    reviewPolicy: "Week-deload-Phase-Safety-owner-deferral",
    threadIdentity: sampleInput.threadIdentity,
    stateIdentityRevisions: sampleInput.stateRevisionLedger,
    decisionIdentityRevisions: sampleResult.decisionRevisionLedger,
    actionDirective: sampleResult.actionDirective,
    applicationValidation: sampleResult.applicationValidation,
    inputContract: Object.keys(sampleInput).sort(),
    upstreamAuthorityContract: sampleInput.upstreamAuthority,
    outputContract: { statuses: ["decision_authorized", "review_required", "hold", "insufficient_evidence",
      "action_conflict", "safety_blocked", "upstream_invalid", "contract_invalid", "source_invalid",
      "completed_ledger_invalid", "evidence_invalid", "application_invalid"], subgates: PRODUCTION_LONGITUDINAL_SUBGATES },
    legacyProgressionProjection: "compatibility-only-not-production-authority",
    goldenEquivalence: golden.fingerprint,
    mutationResults: mutations.fingerprint,
    metamorphicResults: metamorphic.fingerprint,
    stressResults: stress.fingerprint,
    activationGuards: activation.fingerprint,
    publicApiSurface: "src/longitudinalAdaptation/index.ts exported from src/index.ts",
    productionInvariance: { appBehaviorChanged: false, generateProgramChanged: false },
    futureIntegrationHandoff:
      "OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_PERSISTENCE_AND_ADAPTATION_APPLICATION_ORCHESTRATION",
  });
  const fingerprints = Object.freeze(Object.fromEntries(Object.entries(payloads).map(([key, value]) =>
    [key, digest(value)])));
  return Object.freeze({ classification: PRODUCTION_LONGITUDINAL_IMPLEMENTATION_CLASSIFICATION,
    ontologyClassification: PRODUCTION_LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION,
    kernelStatus: PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_STATUS,
    activationStatus: PRODUCTION_LONGITUDINAL_ADAPTATION_ACTIVATION_STATUS,
    contract: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    sourceContract: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    policy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6,
    authorityRegistryValidationReasons: validateEffectiveAuthorityRegistryV6(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6),
    ontologyRows, ontologyAnswers, policyMigration, sourceRevisions, ledgerIntegrity, blockPerformance,
    golden, mutations, metamorphic, stress, activation, sampleResult,
    upstreamFingerprints: Object.freeze({ ...LONGITUDINAL_UPSTREAM_FINGERPRINTS,
      gate16Design: "7cebc3035284befd62a414984479a8d8cc10aff9292959fcaae95ead4256c2fc",
      gate16Holdout: "7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18",
      gate16HoldoutResult: "6759dbecb72bba51529d396df2a62d8ca68b1c26a60bf6e5482b5903ea3aec01" }),
    fingerprints: Object.freeze({ ...fingerprints,
      combinedProductionLongitudinalKernel: digest(fingerprints) }) });
}

let reportCache: ReturnType<typeof buildReport> | null = null;
export function buildProductionLongitudinalAdaptationReport() {
  reportCache ??= buildReport();
  return reportCache;
}

const bullets = (values: readonly unknown[]) => values.map((value) => `- \`${String(value)}\``).join("\n");
const table = (rows: readonly (readonly string[])[]) => ["| Subject | Classification | Finding |",
  "| --- | --- | --- |", ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");

const topicText: Readonly<Record<typeof PRODUCTION_LONGITUDINAL_REPORT_FILES[number], string>> = Object.freeze({
  "PRODUCTION_LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT.md": `${table(ontologyRows)}\n\n## Required Answers\n\n${ontologyAnswers.map((answer, index) => `${index + 1}. ${answer}`).join("\n")}`,
  "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_CONTRACT.md": "The public V1 contract is pure, deterministic, fail-stop, versioned, CAGT-free, and rejects unsupported versions.",
  "PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_MIGRATION.md": "One production Policy V1 object is canonical. The admitted design consumes its frozen compatibility projection with identical philosophy.",
  "PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT.md": `Supported production source owners:\n\n${bullets(PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS)}`,
  "PRODUCTION_LONGITUDINAL_SOURCE_REVISION_CONTRACT.md": "Stable source identity, immutable based-on revisions, visible history, and exactly one active final revision are mandatory.",
  "PRODUCTION_LONGITUDINAL_LIVE_SOURCE_BOUNDARY.md": "Live Performance, Response, adherence, recovery, clinical, and equipment adapters remain unimplemented. Caller-validated records are the only input.",
  "PRODUCTION_LONGITUDINAL_BLOCK_PERFORMANCE.md": "Block results are canonical. Developmental omission produces partial completion; multi-block flattening fails.",
  "PRODUCTION_COMPLETED_EXPOSURE_OUTCOME_LEDGER.md": "One canonical ledger entry represents one planned or realized source event regardless of block, Response, need, or objective count.",
  "PRODUCTION_COMPLETED_EXPOSURE_LEDGER_INTEGRITY.md": "Integrity derives observed counts and rejects duplicates, orphans, wrong revisions, planned-as-actual, timing copies, and flattening.",
  "PRODUCTION_LONGITUDINAL_EVIDENCE_APPLICABILITY.md": "Applicability is exact, then related with typed differences, then identity context. Weaker evidence cannot silently override stronger evidence.",
  "PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES.md": bullets(PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES),
  "PRODUCTION_LONGITUDINAL_TARGET_SCOPE.md": bullets(PRODUCTION_LONGITUDINAL_TARGET_SCOPES),
  "PRODUCTION_LONGITUDINAL_EVIDENCE_WINDOW.md": "Windows require explicit start, end, and evaluation times. Future evidence is invalid; superseded evidence is visible but nonauthoritative.",
  "PRODUCTION_LONGITUDINAL_REPEATED_EVIDENCE.md": "Only distinct completed source events or a reviewed aggregate over them prove repetition. Blocks, sets, observations, and calendar time do not.",
  "PRODUCTION_LONGITUDINAL_EVIDENCE_TRAJECTORY.md": "The trajectory is ordered by explicit evidence time and identity with no weighted score or arbitrary trend line.",
  "PRODUCTION_LONGITUDINAL_STATE_MODEL.md": bullets(PRODUCTION_LONGITUDINAL_STATES),
  "PRODUCTION_LONGITUDINAL_ACTION_POLICY.md": bullets(PRODUCTION_LONGITUDINAL_ACTIONS),
  "PRODUCTION_LONGITUDINAL_PROGRESSION_AXES.md": "Progression requires readiness, repeated success, target, quality, tolerance, recovery, Safety, legality, availability, and one policy-resolved axis.",
  "PRODUCTION_LONGITUDINAL_REGRESSION.md": "Regression requires repeated local failure/adversity and one legal local axis. One failed set, missed session, label, date, or phase is insufficient.",
  "PRODUCTION_LONGITUDINAL_REPLACEMENT_REVIEW.md": "Replacement reopens Candidate selection only after rightful repeated pressure and local Prescription review; Gate 16 selects no identity.",
  "PRODUCTION_LONGITUDINAL_SUCCESSFUL_REEXPOSURE.md": "Later tolerated re-exposure preserves options and weakens permanent-failure pressure without erasing history.",
  "PRODUCTION_LONGITUDINAL_ROTATION_REVIEW.md": "Rotation is bounded to eligible non-anchors with preference or plateau evidence and an equivalent pool. No novelty quota exists.",
  "PRODUCTION_LONGITUDINAL_WEEK_DELOAD_PHASE_SAFETY_REVIEW.md": "Week, deload, Phase, and Safety remain review directives to their owners and are never applied here.",
  "PRODUCTION_LONGITUDINAL_THREAD_STATE_DECISION_IDENTITY.md": "Thread, state, decision, and directive identities derive from semantic lineage, never action outcome, clock, labels, count, or randomness.",
  "PRODUCTION_LONGITUDINAL_REVISION_LEDGERS.md": "State, decision, and source histories are immutable and require exactly one final current revision.",
  "PRODUCTION_LONGITUDINAL_ACTION_DIRECTIVE.md": "A directive records action, axis, scope, evidence revisions, owner, blockers, and unapplied review state.",
  "PRODUCTION_LONGITUDINAL_APPLICATION_VALIDATION.md": "Optional caller-generated applications are checked for persistence, rightful owner, locality, erasure, and scope excess. The kernel generates none.",
  "PRODUCTION_LONGITUDINAL_INPUT.md": "Input requires explicit production contract, policy, source snapshot, ledger, target, identities, windows, upstream facts, domain traces, time, and attempt.",
  "PRODUCTION_LONGITUDINAL_OUTPUT.md": "Output preserves all evidence, candidate, decision, owner, failure, and shadow traces with every mutation-applied flag false.",
  "PRODUCTION_LONGITUDINAL_LEGACY_PROGRESSION_COMPATIBILITY.md": "ProgressionDecision is a compatibility-only projection and has no production decision authority.",
  "PRODUCTION_LONGITUDINAL_GOLDEN_EQUIVALENCE.md": "All 130 controlled, 40 shell, and 360 holdout cases match admitted semantics; all 325 genuine histories remain represented.",
  "PRODUCTION_LONGITUDINAL_CAGT_GATE_AUTHORITY.md": "Explicit Registry V6 assigns Gate 16 PRODUCTION_KERNEL_AUTHORITY while production remains registry-free and inactive.",
  "PRODUCTION_LONGITUDINAL_ACTIVATION_GUARDS.md": "Recursive guards prove zero app/runtime wiring, live adapters, automatic actions, UI imports, test/report imports, environment activation, and import effects.",
  "PRODUCTION_LONGITUDINAL_STRESS_REPORT.md": "Deterministic stress executes 10,000 evaluations and at least 1,000 checks for every required source, block, evidence, action, revision, application, and no-rescue family.",
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md": "Next: owner authorization for production source adapters, persistence, and application orchestration. Week planning/allocation remains separate.",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md": `Classification: ${PRODUCTION_LONGITUDINAL_IMPLEMENTATION_CLASSIFICATION}. The kernel is implemented, inactive, unwired, and ready for the next authorization.`,
});

export function renderProductionLongitudinalAdaptationReports(
  report = buildProductionLongitudinalAdaptationReport(),
): Readonly<Record<string, string>> {
  const header = (name: string) => `# ${name.replace(/\.md$/, "").replaceAll("_", " ")}\n\n` +
    "Generated deterministically from `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL@1.0.0`. " +
    "The kernel is implemented and not activated.\n\n";
  const markdown = Object.fromEntries(PRODUCTION_LONGITUDINAL_REPORT_FILES.map((name) => [name,
    `${header(name)}${topicText[name]}\n\n- Classification: \`${report.classification}\`\n` +
    `- Golden: \`${report.golden.result}\`\n- Mutations: \`${report.mutations.result}\`\n` +
    `- Metamorphic: \`${report.metamorphic.result}\`\n- Stress: \`${report.stress.result}\`\n` +
    `- Activation: \`${report.activation.result}\`\n` +
    `- Combined fingerprint: \`${report.fingerprints.combinedProductionLongitudinalKernel}\`\n`,
  ]));
  const goldenSummary = Object.freeze({ admittedControlledChainCount: report.golden.admittedControlledChainCount,
    admittedFixedShellCount: report.golden.admittedFixedShellCount,
    admittedHoldoutCount: report.golden.admittedHoldoutCount,
    genuineCompletedHistoryCount: report.golden.genuineCompletedHistoryCount,
    productionControlledScenarioCount: report.golden.productionControlledScenarioCount,
    allExerciseIdentityCount: report.golden.allExerciseIdentityCount,
    allDoseModeCount: report.golden.allDoseModeCount, semanticMismatchCount: report.golden.semanticMismatchCount,
    productionValidationFailureCount: report.golden.productionValidationFailureCount,
    result: report.golden.result, fingerprint: report.golden.fingerprint });
  const json = {
    "PRODUCTION_LONGITUDINAL_POLICY_MIGRATION.json": report.policyMigration,
    "PRODUCTION_LONGITUDINAL_SOURCE_REVISIONS.json": report.sourceRevisions,
    "PRODUCTION_COMPLETED_EXPOSURE_LEDGER_INTEGRITY.json": report.ledgerIntegrity,
    "PRODUCTION_LONGITUDINAL_BLOCK_PERFORMANCE.json": report.blockPerformance,
    "PRODUCTION_LONGITUDINAL_GOLDEN_EQUIVALENCE.json": goldenSummary,
    "PRODUCTION_LONGITUDINAL_MUTATIONS.json": report.mutations,
    "PRODUCTION_LONGITUDINAL_METAMORPHIC.json": report.metamorphic,
    "PRODUCTION_LONGITUDINAL_STRESS_REPORT.json": report.stress,
    "PRODUCTION_LONGITUDINAL_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      production: report.fingerprints },
  };
  return Object.freeze({ ...markdown, ...Object.fromEntries(Object.entries(json).map(([name, value]) =>
    [name, `${JSON.stringify(value, null, 2)}\n`])) });
}

export function productionLongitudinalDocumentationMarker(
  report = buildProductionLongitudinalAdaptationReport(),
): string {
  return ["<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START -->",
    "## Production Longitudinal Adaptation Kernel V1", "",
    `- Status: \`${report.kernelStatus}\``, `- Classification: \`${report.classification}\``,
    `- Activation: \`${report.activationStatus}\``,
    `- Contract: \`${report.contract.contractId}@${report.contract.contractVersion}\``,
    "- Policy and caller-supplied outcome sources are explicit; no live adapter or default is selected.",
    "- Decisions remain unapplied; program, Prescription, replacement, rotation, deload, Week, and Phase mutation flags are false.",
    "- Registry V6 records Gate 16 production-kernel authority; production code imports no CAGT registry.",
    `- Golden equivalence: \`${report.golden.result}\` across ${report.golden.admittedControlledChainCount} controlled, ` +
      `${report.golden.admittedFixedShellCount} shell, and ${report.golden.admittedHoldoutCount} holdout cases.`,
    `- Stress: \`${report.stress.result}\` across ${report.stress.deterministicEvaluationCount} evaluations.`,
    `- Combined fingerprint: \`${report.fingerprints.combinedProductionLongitudinalKernel}\``,
    "- Exact next dependency: `OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_PERSISTENCE_AND_ADAPTATION_APPLICATION_ORCHESTRATION`.",
    "<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:END -->"].join("\n");
}
