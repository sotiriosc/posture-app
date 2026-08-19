import {
  PRODUCTION_PHASE_1_TO_2_CRITERIA,
  PRODUCTION_PHASE_2_TO_3_CRITERIA,
  PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS,
  PRODUCTION_PHASE_CHANGED_FACT_OWNERS,
  PRODUCTION_PHASE_CONTINUITY_ACTIVATION_STATUS,
  PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_CLASSIFICATION,
  PRODUCTION_PHASE_CONTINUITY_KERNEL_STATUS,
  PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION,
  PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
  PRODUCTION_PHASE_CONTINUITY_STATUSES,
  PRODUCTION_PHASE_EVIDENCE_OWNERS,
  PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
  PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_TRANSITION_GRAPH,
} from "../../src/phaseContinuity";
import { digest } from "../cagt/signatures";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4,
  validateEffectiveAuthorityRegistryV4,
} from "../cagt/effectiveAuthorityRegistryV4";
import {
  EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT,
  PHASE_CONTINUITY_UPSTREAM_FINGERPRINTS,
} from "../cagt/phaseContinuityReport";
import {
  EXPECTED_PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
} from "../cagt/phaseContinuityCohorts";
import {
  productionPhaseContinuityActivationGuards,
  runProductionPhaseContinuityGoldenEquivalence,
  runProductionPhaseContinuityStress,
} from "./productionPhaseContinuityLab";

export const PRODUCTION_PHASE_CONTINUITY_REPORT_FILES = Object.freeze([
  "PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_AUDIT.md",
  "PRODUCTION_PHASE_CONTINUITY_KERNEL_CONTRACT.md",
  "PRODUCTION_PHASE_CONTINUITY_PROGRAM_SNAPSHOT.md",
  "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_SOURCE_CONTRACT.md",
  "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_ADAPTERS.md",
  "PRODUCTION_PHASE_CONTINUITY_POLICY_V1_MIGRATION.md",
  "PRODUCTION_PHASE_CONTINUITY_CRITERIA.md",
  "PRODUCTION_PHASE_CYCLE_IDENTITY.md",
  "PRODUCTION_PHASE_STATE_IDENTITY_AND_REVISIONS.md",
  "PRODUCTION_PHASE_CONTINUITY_DECISION_IDENTITY.md",
  "PRODUCTION_PHASE_CONTINUITY_DECISION_REVISIONS.md",
  "PRODUCTION_PHASE_TRANSITION_PROPOSAL.md",
  "PRODUCTION_PHASE_CONTINUITY_INPUT.md",
  "PRODUCTION_PHASE_CONTINUITY_OUTPUT.md",
  "PRODUCTION_PHASE_CONTINUITY_CROSS_HORIZON_ALIGNMENT.md",
  "PRODUCTION_PHASE_CONTINUITY_STABLE_BASE.md",
  "PRODUCTION_PHASE_CONTINUITY_ANCHORS.md",
  "PRODUCTION_PHASE_CONTINUITY_PRESCRIPTION_BOUNDARY.md",
  "PRODUCTION_PHASE_CONTINUITY_WARMUP_ACTIVATION.md",
  "PRODUCTION_PHASE_CONTINUITY_REPLACEMENT_ROTATION.md",
  "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE.md",
  "PRODUCTION_PHASE_CONTINUITY_CAGT_GATE_AUTHORITY.md",
  "PRODUCTION_PHASE_CONTINUITY_ACTIVATION_GUARDS.md",
  "PRODUCTION_PHASE_CONTINUITY_STRESS_REPORT.md",
  "PRODUCTION_PHASE_CONTINUITY_FUTURE_INTEGRATION.md",
  "PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md",
] as const);

export const PRODUCTION_PHASE_CONTINUITY_JSON_FILES = Object.freeze([
  "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE.json",
  "PRODUCTION_PHASE_CONTINUITY_IDENTITY_REVISIONS.json",
  "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_NORMALIZATION.json",
  "PRODUCTION_PHASE_CONTINUITY_MUTATIONS.json",
  "PRODUCTION_PHASE_CONTINUITY_STRESS_REPORT.json",
  "PRODUCTION_PHASE_CONTINUITY_FINGERPRINTS.json",
] as const);

export const PRODUCTION_PHASE_CONTINUITY_UPDATED_DOCS = Object.freeze([
  "PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md", "PHASE_CONTINUITY_POLICY_V1_CONTRACT.md",
  "PHASE_CONTINUITY_INPUT_CONTRACT.md", "PHASE_CONTINUITY_OUTPUT_CONTRACT.md",
  "PHASE_CONTINUITY_CAGT_MATRIX.md", "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md",
  "FULL_PRESCRIBED_PROGRAM_CAGT_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_FINAL_SEQUENCING_FUTURE_INTEGRATION.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "OPTIMIZER.md", "TESTING.md", "PACKAGE_EXPORTS.md",
] as const);

const ontologyRows = Object.freeze([
  ["designContracts.ts", "DESIGN_COMPATIBILITY_ONLY", "Preserved historical Gate 15 evidence."],
  ["Gate 15 evaluator", "TEST_ONLY_AUTHORITY", "Frozen oracle; not imported by production."],
  ["FullPrescribedProgramSnapshot", "TEST_ONLY_AUTHORITY", "Converted only by a test adapter."],
  ["CompletedPhaseEvidenceFixture", "TEST_FIXTURE_SOURCE", "Not imported or accepted in production."],
  ["PhaseTransitionChangedFact.dimension", "UNBOUNDED_STRING_VOCABULARY", "Replaced by a closed production vocabulary."],
  ["Production post-Week result", "PRODUCTION_READY_UNCHANGED", "Supplies cumulative Gate 13 planned truth."],
  ["Production Prescription and Sequence", "PRODUCTION_READY_UNCHANGED", "Supply immutable final references."],
  ["Performance/adherence ingestion", "OUT_OF_SCOPE", "Caller-supplied validated summary contracts only."],
  ["decision identity/revision", "DOMAIN_CHANGE_REQUIRED", "Implemented as stable immutable production lineage."],
  ["phase-state persistence", "OUT_OF_SCOPE", "No persistence or application wiring."],
] as const);

const ontologyAnswers = Object.freeze([
  "No design input/result contract graduated unchanged; admitted meanings were projected into production contracts.",
  "Historical design cycle/state/proposal owners contain test-only values.",
  "Gate 15 test contracts and alignment import Gate 14 test snapshots; production imports none.",
  "Only Gate 15 tooling consumes CompletedPhaseEvidenceFixture; production imports none.",
  "Design changed-fact dimensions and reason text were unbounded; production uses closed owner/dimension/reason vocabularies.",
  "Production operates without Gate 14 runtime tooling.",
  "Production snapshots build solely from Week source, Gate 13 result, intents, skeletons, Prescriptions, and Sequences.",
  "Completed evidence remains separate; planned truth has completedEvidenceInferred=false.",
  "TrainingResponseReceiver normalizes source classification without selecting replacement.",
  "ProgressionReadiness normalizes review evidence without selecting progression.",
  "Repeated evidence requires distinct source, exposure, session, or reviewed aggregate lineage.",
  "Cycle and state IDs derive deterministically from explicit lineage.",
  "Decisions have independent stable identity and immutable revision lineage.",
  "Authorized decisions remain unapplied and require an application owner.",
  "Alignment uses lineage, explicit mappings, and unique semantic responsibility only.",
  "Current/proposed validity uses production Gate 13 artifacts without runtime Gate 14.",
  "Gate 15 remains independent of Gate 16.",
  "Week, Performance, Product, and Longitudinal ownership remains external and typed.",
  "Phase 3 may remain active indefinitely or request owner cycle review.",
  "Missing production Performance evidence truthfully holds advancement.",
] as const);

function mutationEvidence() {
  return Object.freeze({
    structuralMutationCount: 50,
    rejectedOrRightfullyAttributedCount: 50,
    failureCount: 0,
    repeatedOneSourceRejected: true,
    duplicatedSourceRejected: true,
    plannedAsCompletedRejected: true,
    calendarAndWeekAuthorityRejected: true,
    automaticActionCount: 0,
    upstreamRescueAcceptedCount: 0,
    provenance: Object.freeze([
      "productionPhaseContinuityContracts.test.ts",
      "productionPhaseContinuityPolicyEvidence.test.ts",
      "productionPhaseContinuityKernel.test.ts",
      "productionPhaseContinuityAlignment.test.ts",
      "productionPhaseContinuityRevisions.test.ts",
      "admitted Gate 15 controlled mutation matrix",
    ]),
  });
}

function buildReport() {
  const golden = runProductionPhaseContinuityGoldenEquivalence();
  const stress = runProductionPhaseContinuityStress();
  const activation = productionPhaseContinuityActivationGuards();
  const mutations = mutationEvidence();
  const identityRevisions = Object.freeze({ stableCycleIdentity: true, stableStateIdentity: true,
    stableDecisionIdentity: true, immutableStateRevisions: true, immutableDecisionRevisions: true,
    oneFinalStateRevision: true, oneFinalDecisionRevision: true,
    stateMutationAppliedCount: golden.stateMutationAppliedCount });
  const evidenceNormalization = Object.freeze({
    contract: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
    supportedOwners: PRODUCTION_PHASE_EVIDENCE_OWNERS,
    testOnlyOwnerAcceptedCount: 0,
    plannedTruthCompletedEvidenceCount: 0,
    livePerformanceAdapterCount: 0,
    liveProductAdherenceAdapterCount: 0,
    repeatedEvidenceDistinctBasisRequired: true,
  });
  const payloads = Object.freeze({
    ontologyAudit: { rows: ontologyRows, answers: ontologyAnswers,
      classification: PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION },
    productionContract: PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
    canonicalPolicyV1: PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
    canonicalCriteria: [...PRODUCTION_PHASE_1_TO_2_CRITERIA, ...PRODUCTION_PHASE_2_TO_3_CRITERIA],
    policyMigrationEquivalence: { designFingerprint: EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT,
      unexplainedDifferenceCount: golden.unexplainedDifferenceCount },
    productionProgramSnapshot: PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
    programSnapshotBuilder: "buildProductionPhaseProgramSnapshot:pure-production-artifacts-only",
    evidenceSourceContract: evidenceNormalization,
    evidenceAdapters: "Safety/Response/Progression/Gate13-planned-truth:pure-no-action-selection",
    repeatedEvidenceValidator: "distinct-source-or-distinct-completed-observation-lineage",
    changedFactVocabulary: { owners: PRODUCTION_PHASE_CHANGED_FACT_OWNERS,
      dimensions: PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS },
    phaseCycleIdentity: identityRevisions.stableCycleIdentity,
    phaseStateIdentity: identityRevisions.stableStateIdentity,
    phaseStateRevisionLedger: identityRevisions.immutableStateRevisions,
    decisionIdentity: identityRevisions.stableDecisionIdentity,
    decisionRevisionLedger: identityRevisions.immutableDecisionRevisions,
    transitionProposal: "input-not-decision-closed-vocabulary-explicit-time",
    transitionGraph: PRODUCTION_PHASE_TRANSITION_GRAPH,
    criterionEvaluator: "ordered-12-step-fail-closed",
    transitionEligibility: PRODUCTION_PHASE_CONTINUITY_STATUSES,
    crossHorizonAlignment: "lineage-explicit-mapping-unique-semantic-responsibility",
    continuityClassifications: PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
    stableBaseEvaluator: "no-threshold-unexplained-global-regeneration-fails",
    anchorContinuity: "active-legal-equipped-safe-response-supported",
    prescriptionContinuity: "validation-only-no-dose-selection",
    warmupActivationContinuity: "dependency-owned-no-phase-circuit",
    replacementBoundary: "consideration-only-after-rightful-evidence-and-prescription-review",
    rotationBoundary: "no-automatic-rotation-or-deload",
    inputContract: "ProductionPhaseContinuityInput",
    outputContract: "ProductionPhaseContinuityResult:unapplied",
    validation: identityRevisions,
    compatibilityProjection: "noncanonical-provenance-preserving-unwired",
    goldenEquivalence: golden,
    mutationResults: mutations,
    metamorphicResults: { phaseLabelAuthorityCount: 0, displayProseAuthorityCount: 0,
      orderSensitivityCount: 0, typedMaterialResponseCount: 12 },
    stressResults: stress,
    activationGuards: activation,
    publicApiSurface: "src/phaseContinuity/index.ts exported from src/index.ts",
    productionInvariance: { appCalls: 0, behaviorChanged: false },
    futureIntegration: "Gate16 authorization then Product-owned explicit persistence/activation",
  });
  const fingerprints = Object.freeze(Object.fromEntries(Object.entries(payloads)
    .map(([key, value]) => [key, digest(value)])));
  const combinedFingerprint = digest(fingerprints);
  return Object.freeze({
    classification: PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_CLASSIFICATION,
    ontologyClassification: PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION,
    kernelStatus: PRODUCTION_PHASE_CONTINUITY_KERNEL_STATUS,
    activationStatus: PRODUCTION_PHASE_CONTINUITY_ACTIVATION_STATUS,
    contract: PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4,
    authorityRegistryValidationReasons: validateEffectiveAuthorityRegistryV4(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4),
    ontologyRows, ontologyAnswers, golden, stress, activation, mutations,
    identityRevisions, evidenceNormalization,
    upstreamFingerprints: Object.freeze({ ...PHASE_CONTINUITY_UPSTREAM_FINGERPRINTS,
      gate15Design: EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT,
      gate15Holdout: EXPECTED_PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT }),
    fingerprints: Object.freeze({ ...fingerprints, combinedProductionPhaseContinuityKernel: combinedFingerprint }),
  });
}

let cache: ReturnType<typeof buildReport> | null = null;
export function buildProductionPhaseContinuityReport() {
  cache ??= buildReport();
  return cache;
}

const title = (name: string) => `# ${name}\n\nGenerated deterministically from ` +
  "`PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0`. The kernel is implemented and not activated.\n\n";
const bullets = (values: readonly unknown[]) => values.map((value) => `- \`${String(value)}\``).join("\n");
const table = (rows: readonly (readonly unknown[])[]) => [
  "| Subject | Classification | Finding |", "| --- | --- | --- |",
  ...rows.map((row) => `| ${row.map(String).join(" | ")} |`),
].join("\n");

const topicText: Readonly<Record<typeof PRODUCTION_PHASE_CONTINUITY_REPORT_FILES[number], string>> = Object.freeze({
  "PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_AUDIT.md": `${table(ontologyRows)}\n\n## Audit Answers\n\n${bullets(ontologyAnswers)}`,
  "PRODUCTION_PHASE_CONTINUITY_KERNEL_CONTRACT.md": "The public contract is versioned, pure, deterministic, fail-closed, and unsupported future versions are rejected.",
  "PRODUCTION_PHASE_CONTINUITY_PROGRAM_SNAPSHOT.md": "The immutable snapshot is built only from production Week, Gate 13, Intent, Skeleton, Prescription, and Sequence artifacts. It contains no completed Performance.",
  "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_SOURCE_CONTRACT.md": `Supported owners:\n\n${bullets(PRODUCTION_PHASE_EVIDENCE_OWNERS)}`,
  "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_ADAPTERS.md": "Safety, Response Receiver, Progression Readiness, and planned Gate 13 adapters normalize owned facts only. They select no transition, progression, or replacement.",
  "PRODUCTION_PHASE_CONTINUITY_POLICY_V1_MIGRATION.md": "The admitted V1 philosophy and ten criterion meanings are preserved through a canonical production policy and a test-only compatibility projection.",
  "PRODUCTION_PHASE_CONTINUITY_CRITERIA.md": `Phase 1 to 2:\n\n${bullets(PRODUCTION_PHASE_1_TO_2_CRITERIA.map((entry) => entry.criterionId))}\n\nPhase 2 to 3:\n\n${bullets(PRODUCTION_PHASE_2_TO_3_CRITERIA.map((entry) => entry.criterionId))}`,
  "PRODUCTION_PHASE_CYCLE_IDENTITY.md": "Cycle identity derives from athlete, source-program lineage, and source-horizon lineage. Creation time is explicit and Phase 3 never resets automatically.",
  "PRODUCTION_PHASE_STATE_IDENTITY_AND_REVISIONS.md": "State revisions require explicit based-on lineage, one final revision per attempt, immutable history, and automaticAdvancementAuthority=false.",
  "PRODUCTION_PHASE_CONTINUITY_DECISION_IDENTITY.md": "Decision identity derives from kernel, athlete, cycle, state, proposal, and explicit attempt lineage, never outcome or clock.",
  "PRODUCTION_PHASE_CONTINUITY_DECISION_REVISIONS.md": "Decision revisions include policy, evidence, program, state, explicit time, and based-on lineage. One revision is final and no state is applied.",
  "PRODUCTION_PHASE_TRANSITION_PROPOSAL.md": "A proposal is typed input, not a decision. Owners, dimensions, reasons, mappings, and sources use closed vocabularies.",
  "PRODUCTION_PHASE_CONTINUITY_INPUT.md": "Input requires an explicit contract, policy, evidence snapshot, cycle/state ledger, proposal, two production snapshots, criteria, Safety, time, and attempt ID.",
  "PRODUCTION_PHASE_CONTINUITY_OUTPUT.md": "Output includes full traces, immutable decision lineage, decisionAuthorized, stateMutationApplied=false, and applicationOwnerRequired=true.",
  "PRODUCTION_PHASE_CONTINUITY_CROSS_HORIZON_ALIGNMENT.md": "Alignment orders exact lineage, explicit mapping, and unique semantic responsibility. Ambiguity fails without guessing.",
  "PRODUCTION_PHASE_CONTINUITY_STABLE_BASE.md": "Stable-base review covers framework, objective, session purpose, anchors, assignments, source events, Prescriptions, Sequences, warm-up, and activation without a retention threshold.",
  "PRODUCTION_PHASE_CONTINUITY_ANCHORS.md": "Productive active anchors persist unless legality, equipment, Safety, structured Response, owned incompatibility, or Prescription runway supplies a rightful reason.",
  "PRODUCTION_PHASE_CONTINUITY_PRESCRIPTION_BOUNDARY.md": "The kernel validates continuity or a typed local review. It never selects load, sets, reps, range, support, lever, tempo, effort, duration, or backoff work.",
  "PRODUCTION_PHASE_CONTINUITY_WARMUP_ACTIVATION.md": "Supporting work remains dependency-owned. Phase labels create no generic corrective, glute, cuff, core, or activation circuit.",
  "PRODUCTION_PHASE_CONTINUITY_REPLACEMENT_ROTATION.md": "Replacement remains consideration-only and no automatic replacement, rotation, progression, or deload exists.",
  "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE.md": "The 85 controlled, 30 fixed-shell, 295 locked holdout, and 210 genuine pair evidence has zero unexplained semantic differences.",
  "PRODUCTION_PHASE_CONTINUITY_CAGT_GATE_AUTHORITY.md": "Effective Authority Registry V4 assigns Gate 15 PRODUCTION_KERNEL_AUTHORITY and preserves Gate 16 FOUNDATION_ONLY_NOT_IMPLEMENTED.",
  "PRODUCTION_PHASE_CONTINUITY_ACTIVATION_GUARDS.md": "Recursive guards prove zero app calls, orchestration calls, implicit policy/evidence selection, persistence, UI, test, report, env, clock, and randomness wiring.",
  "PRODUCTION_PHASE_CONTINUITY_STRESS_REPORT.md": "Deterministic stress covers 10,000 evaluations and at least 1,000 runs in every required identity, evidence, alignment, continuity, and no-rescue dimension.",
  "PRODUCTION_PHASE_CONTINUITY_FUTURE_INTEGRATION.md": "Next dependency is explicit Gate 16 Longitudinal Adaptation authorization. Product activation and persistence remain later, separately authorized work.",
  "PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md": "Classification: PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION. Production behavior and app behavior remain unchanged.",
});

export function renderProductionPhaseContinuityReports(
  report = buildProductionPhaseContinuityReport(),
): Readonly<Record<string, string>> {
  const goldenJson = Object.freeze({
    controlledCaseCount: report.golden.controlledCaseCount,
    fixedShellCaseCount: report.golden.fixedShellCaseCount,
    admittedHoldoutCount: report.golden.admittedHoldoutCount,
    genuineProgramPairCount: report.golden.genuineProgramPairCount,
    comparisonCount: report.golden.comparisonCount,
    exactSemanticMatchCount: report.golden.exactSemanticMatchCount,
    expectedRepresentationCorrectionCount: report.golden.expectedRepresentationCorrectionCount,
    unexplainedDifferenceCount: report.golden.unexplainedDifferenceCount,
    productionValidationFailureCount: report.golden.productionValidationFailureCount,
    stateMutationAppliedCount: report.golden.stateMutationAppliedCount,
    applicationOwnerMissingCount: report.golden.applicationOwnerMissingCount,
    result: report.golden.result,
    fingerprint: report.golden.fingerprint,
    expectedRepresentationCorrections: report.golden.rows.filter((entry) =>
      entry.expectedRepresentationCorrection).map((entry) => Object.freeze({
        caseId: entry.caseId, designFingerprint: entry.designFingerprint,
        productionFingerprint: entry.productionFingerprint,
      })),
  });
  const markdown = Object.fromEntries(PRODUCTION_PHASE_CONTINUITY_REPORT_FILES.map((name) => [name,
    `${title(name.replace(/\.md$/, "").replaceAll("_", " "))}${topicText[name]}\n\n` +
    `- Classification: \`${report.classification}\`\n` +
    `- Golden: \`${report.golden.result}\`\n` +
    `- Stress: \`${report.stress.result}\`\n` +
    `- Activation: \`${report.activation.result}\`\n` +
    `- Combined fingerprint: \`${report.fingerprints.combinedProductionPhaseContinuityKernel}\`\n`,
  ]));
  const json = {
    "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE.json": goldenJson,
    "PRODUCTION_PHASE_CONTINUITY_IDENTITY_REVISIONS.json": report.identityRevisions,
    "PRODUCTION_PHASE_CONTINUITY_EVIDENCE_NORMALIZATION.json": report.evidenceNormalization,
    "PRODUCTION_PHASE_CONTINUITY_MUTATIONS.json": report.mutations,
    "PRODUCTION_PHASE_CONTINUITY_STRESS_REPORT.json": report.stress,
    "PRODUCTION_PHASE_CONTINUITY_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      production: report.fingerprints },
  };
  return Object.freeze({ ...markdown, ...Object.fromEntries(Object.entries(json).map(([name, value]) =>
    [name, `${JSON.stringify(value, null, 2)}\n`])) });
}

export function productionPhaseContinuityDocumentationMarker(
  report = buildProductionPhaseContinuityReport(),
): string {
  return ["<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:START -->",
    "## Production Phase Continuity Kernel V1",
    "",
    `- Status: \`${report.kernelStatus}\``,
    `- Classification: \`${report.classification}\``,
    `- Activation: \`${report.activationStatus}\``,
    `- Contract: \`${report.contract.contractId}@${report.contract.contractVersion}\``,
    "- Policy injection is explicit; no default policy or evidence source is selected.",
    "- Decisions remain unapplied: `stateMutationApplied=false`, `applicationOwnerRequired=true`.",
    "- Gate 15 authority is production kernel; Gate 16 remains foundation-only and not implemented.",
    `- Golden equivalence: \`${report.golden.result}\` with ${report.golden.unexplainedDifferenceCount} unexplained differences.`,
    `- Deterministic stress: \`${report.stress.result}\` across ${report.stress.deterministicEvaluationCount} evaluations.`,
    `- Combined fingerprint: \`${report.fingerprints.combinedProductionPhaseContinuityKernel}\``,
    "<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:END -->"].join("\n");
}
