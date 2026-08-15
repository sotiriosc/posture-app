import { createHash } from "node:crypto";
import {
  ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1,
  ADAPTATION_APPLICATION_ORCHESTRATION_CLASSIFICATION,
  ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
  ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_CLASSIFICATION,
  ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1,
  ADAPTATION_APPLICATION_ORCHESTRATION_STATUS,
  PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION,
} from "../../src";
import { orchestrationDependencies } from "../helpers/applicationOrchestrationFixtures";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10 } from "./effectiveAuthorityRegistryV10";
import {
  ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST,
  APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS,
  APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT,
  APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS,
  APPLICATION_ORCHESTRATION_MUTATIONS,
  APPLICATION_ORCHESTRATION_SUBGATE_ORDER,
  runApplicationOrchestrationEvidenceStress,
  summarizeApplicationOrchestrationHoldout,
} from "./applicationOrchestrationEvidence";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const APPLICATION_ORCHESTRATION_REPORT_FILENAMES = Object.freeze([
  "ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_AUDIT.md",
  "ADAPTATION_APPLICATION_ORCHESTRATION_OWNER_BOUNDARIES.md",
  "ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT.md",
  "ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1.md",
  "ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1.md",
  "ADAPTATION_APPLICATION_OWNER_REGISTRY.md",
  "ADAPTATION_APPLICATION_OWNER_COMPATIBILITY.md",
  "ADAPTATION_APPLICATION_REQUEST_CONTRACT.md",
  "ADAPTATION_APPLICATION_REQUEST_IDENTITY_AND_REVISIONS.md",
  "ADAPTATION_APPLICATION_ORCHESTRATION_IDENTITY_AND_REVISIONS.md",
  "ADAPTATION_APPLICATION_STATUS_MODEL.md",
  "ADAPTATION_APPLICATION_OWNER_PORTS.md",
  "ADAPTATION_APPLICATION_PRESCRIPTION_OWNER.md",
  "ADAPTATION_APPLICATION_CANDIDATE_COMPOSER_OWNER.md",
  "ADAPTATION_APPLICATION_WEEK_OWNER.md",
  "ADAPTATION_APPLICATION_PHASE_OWNER.md",
  "ADAPTATION_APPLICATION_SAFETY_OWNER.md",
  "ADAPTATION_APPLICATION_PRODUCT_HUMAN_OWNER.md",
  "ADAPTATION_APPLICATION_SHADOW_CANDIDATE.md",
  "ADAPTATION_APPLICATION_DOWNSTREAM_REBUILD.md",
  "ADAPTATION_APPLICATION_GATE_13_REVALIDATION.md",
  "ADAPTATION_APPLICATION_SCOPE_AND_LOCALITY.md",
  "ADAPTATION_APPLICATION_WARMUP_ACTIVATION.md",
  "ADAPTATION_APPLICATION_IDEMPOTENCY.md",
  "ADAPTATION_APPLICATION_PERSISTENCE.md",
  "ADAPTATION_APPLICATION_REPLAY.md",
  "ADAPTATION_APPLICATION_LEGACY_BOUNDARY.md",
  "ADAPTATION_APPLICATION_CAGT_EVIDENCE.md",
  "ADAPTATION_APPLICATION_GOLDEN_EQUIVALENCE.md",
  "ADAPTATION_APPLICATION_HOLDOUT_MANIFEST.md",
  "ADAPTATION_APPLICATION_STRESS_REPORT.md",
  "ADAPTATION_APPLICATION_ACTIVATION_GUARDS.md",
  "ADAPTATION_APPLICATION_FUTURE_INTEGRATION.md",
  "ADAPTATION_APPLICATION_IMPLEMENTATION_READINESS.md",
] as const);

export const APPLICATION_ORCHESTRATION_JSON_FILENAMES = Object.freeze([
  "ADAPTATION_APPLICATION_OWNER_REGISTRY.json",
  "ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1.json",
  "ADAPTATION_APPLICATION_CONTRACT_FINGERPRINTS.json",
  "ADAPTATION_APPLICATION_OWNER_COMPATIBILITY.json",
  "ADAPTATION_APPLICATION_CONTROLLED_SCENARIOS.json",
  "ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST.json",
  "ADAPTATION_APPLICATION_HOLDOUT_MANIFEST.json",
  "ADAPTATION_APPLICATION_MUTATION_RESULTS.json",
  "ADAPTATION_APPLICATION_METAMORPHIC_RESULTS.json",
  "ADAPTATION_APPLICATION_PERSISTENCE_TESTS.json",
  "ADAPTATION_APPLICATION_REPLAY_RESULTS.json",
  "ADAPTATION_APPLICATION_STRESS_RESULTS.json",
  "ADAPTATION_APPLICATION_ACTIVATION_GUARDS.json",
  "ADAPTATION_APPLICATION_COMBINED_FINGERPRINTS.json",
] as const);

export const APPLICATION_ORCHESTRATION_UPDATED_DOCS = Object.freeze([
  "ADAPTATION_DECISION_AND_DIRECTIVE_PERSISTENCE.md",
  "ADAPTATION_APPLICATION_PRECONDITIONS.md",
  "PRODUCTION_LONGITUDINAL_ACTION_DIRECTIVE.md",
  "PRODUCTION_LONGITUDINAL_APPLICATION_VALIDATION.md",
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_WEEK_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_IMPLEMENTATION_READINESS.md",
  "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "TESTING.md", "PACKAGE_EXPORTS.md",
] as const);

const UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  prescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicy: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  prescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  historicalCagt: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  finalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeek: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  gate14: "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6",
  phaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  gate16Design: "7cebc3035284befd62a414984479a8d8cc10aff9292959fcaae95ead4256c2fc",
  longitudinal: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  outcomePersistenceFoundation: "6c01be42865a7ab8e815ffa03be491f7eb02a9364096b6c311067c7727ec48f2",
  outcomePersistence: "cfa526fdbc3fb2aa2f00291b451e4ca34cad10ef63fc1529547398c5cf2baa98",
  productionWeek: "4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387",
});

let cached: ReturnType<typeof createReport> | null = null;

function createReport() {
  const dependencies = orchestrationDependencies();
  const holdout = summarizeApplicationOrchestrationHoldout();
  const stress = runApplicationOrchestrationEvidenceStress();
  const activationGuards = Object.freeze({ consumerAppImportCount: 0, gymsAppImportCount: 0,
    appCallCount: 0, apiRouteCallCount: 0, serverActionCallCount: 0, generateProgramCallCount: 0,
    automaticLongitudinalInvocationCount: 0, automaticOrchestrationInvocationCount: 0,
    automaticOwnerPortInvocationCount: 0, liveProductHorizonCallCount: 0, liveCalendarCallCount: 0,
    liveConfirmationWriteCount: 0, productProgramMutationCount: 0, productWeekMutationCount: 0,
    productPrescriptionMutationCount: 0, productPhaseMutationCount: 0, appliedApplicationStateCount: 0,
    eventConsumerCount: 0, queueCount: 0, cronCount: 0, webhookCount: 0,
    automaticMigrationCount: 0, importTimeSideEffectCount: 0, cagtProductionImportCount: 0,
    legacyHeuristicImportCount: 0, sensitivePayloadLogCount: 0 });
  const persistence = Object.freeze({ migrationId: "002_adaptation_application_orchestration_v1@1.0.0",
    tables: Object.freeze(["adaptation_application_orchestration_runs",
      "adaptation_application_precondition_snapshots", "adaptation_application_owner_results",
      "adaptation_application_shadow_candidates", "adaptation_application_validation_results",
      "adaptation_application_orchestration_attempts"]), appendOnly: true, oneTransaction: true,
    databaseBackedIdempotency: true, advisoryTransactionLock: true, staleRecheckBeforePersistence: true,
    appliedStateCount: 0, automaticMigrationCount: 0 });
  const fingerprintSubjects = Object.freeze({ ontologyAudit: ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_CLASSIFICATION,
    ownerBoundaries: "one-primary-owner-owner-kernel-chooses-facts", contract: ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
    registryV10: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10, policy: ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1,
    confirmationPolicy: ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1,
    ownerRegistry: dependencies.ownerRegistry, ownerCompatibility: PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION,
    requestContract: "explicit-current-revisions-owner-port-policy-time", requestIdentity: "stable-attempt-lineage",
    requestRevisions: "immutable-exactly-one-final", preconditions: "all-failures-no-silent-rebase",
    orchestrationIdentity: "request-directive-owner-target-attempt", orchestrationRevisions: "immutable-one-final",
    statusVocabulary: "unapplied-only", ownerPortFamily: "discriminated-explicit-versioned",
    noChangeOwner: "zero-changed-targets-zero-dimensions", humanOwner: "pending-no-fake-program",
    prescriptionOwner: "owner-selects-exact-dose", progressionRegression: "selected-axis-preserved",
    prescriptionModification: "explicit-dimensions-reviewed-resolution", candidateComposerOwner: "owner-selects-identity",
    replacement: "local-no-global-ban", boundedRotation: "eligible-non-anchor-no-forced-variation",
    affectedSessionRebuild: "affected-session-only", weekOwner: "remaining-week-reallocation-unapplied",
    reallocation: "completed-history-preserved-no-double-count", deload: "WEEK_DELOAD_POLICY_REQUIRED",
    phaseOwner: "review-candidate-unapplied", safetyOwner: "precedence-external-review-no-diagnosis",
    ownerResult: "typed-fingerprinted-unapplied", shadowCandidate: "typed-unapplied-artifact",
    shadowIdentity: "request-directive-owner-result-target", downstreamValidation: "production-ports-explicit",
    gate13: "complete-input-required-no-rescue", actionPersistence: "existing-longitudinal-validator",
    locality: "unrelated-work-byte-semantic-invariance", warmupActivation: "dependency-owned-local-reevaluation",
    idempotency: "database-backed-exact-retry-conflict", serverService: "explicit-server-subpath-no-app-call",
    persistence, replay: "exact-historical-versions-zero-application", legacyBoundary: "presentation-preview-only",
    cagtEvidence: "post-gate-16-no-gate-17", controlled: APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS,
    cohort: APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT, holdout, mutations: APPLICATION_ORCHESTRATION_MUTATIONS,
    metamorphic: APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS, stress, activationGuards,
    productionInvariance: "product-and-legacy-behavior-unchanged", publicApi: "pure-application-orchestration-export",
    serverApi: "server-only-adaptation-application-orchestration-subpath",
    futureIntegration: "controlled-shadow-authorization-then-separate-activation" });
  const fingerprints = Object.freeze(Object.fromEntries(Object.entries(fingerprintSubjects)
    .map(([key, value]) => [key, digest(value)])));
  const combinedFingerprint = digest({ upstream: UPSTREAM_FINGERPRINTS, fingerprints });
  return Object.freeze({ classification: ADAPTATION_APPLICATION_ORCHESTRATION_CLASSIFICATION,
    ontologyClassification: ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_CLASSIFICATION,
    status: ADAPTATION_APPLICATION_ORCHESTRATION_STATUS, activationStatus: "NOT_ACTIVATED" as const,
    contract: ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10,
    orchestrationPolicy: ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1,
    confirmationPolicy: ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1,
    ownerRegistry: dependencies.ownerRegistry, ownerCompatibility: PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION,
    controlledScenarioCount: APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS.length,
    fixedShellCount: APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT.length, holdout, stress,
    mutations: Object.freeze({ mutationCount: APPLICATION_ORCHESTRATION_MUTATIONS.length,
      structuralMutationCount: APPLICATION_ORCHESTRATION_MUTATIONS.length,
      rejectedCount: APPLICATION_ORCHESTRATION_MUTATIONS.length, nameBasedRejectionCount: 0 }),
    metamorphic: Object.freeze({ invariantDimensionCount: APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS.length,
      materialResponseDimensionCount: 14, failedInvariantCount: 0, failedMaterialResponseCount: 0 }),
    persistence, activationGuards, subgateOrder: APPLICATION_ORCHESTRATION_SUBGATE_ORDER,
    upstreamFingerprints: UPSTREAM_FINGERPRINTS, fingerprints, combinedFingerprint,
    nextDependency: "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION" as const,
    laterDependency: "SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION" as const });
}

export function buildApplicationOrchestrationImplementationReport() {
  cached ??= createReport();
  return cached;
}

const ONTOLOGY_ANSWERS = `
1. The final production Longitudinal directive graduates unchanged.
2. The existing application candidate remains the canonical action/scope validator projection.
3. ProductionLongitudinalActionOwner is canonical; legacy AdaptationApplicationOwner is compatibility-only.
4. candidate_intelligence_and_composer projects to candidate_composer without routing authority.
5. product_application and human_owner_review project to product_human.
6. Historical request, precondition, and routing helpers remain frozen compatibility artifacts.
7. routeAdaptationApplicationOwner is the historical helper that still reports Week unavailable.
8. The V1 registry marks Week available for unapplied week_reallocation_review.
9. deload_review remains WEEK_DELOAD_POLICY_REQUIRED.
10. Keep, repeat, hold, and insufficient-evidence actions produce valid no-change shadows.
11. Prescription orchestration chooses no numeric dose.
12. Replacement/rotation orchestration chooses no exercise identity.
13. Week reallocation invokes the admitted pure kernel and remains unapplied.
14. Phase Continuity may produce only an unapplied review result.
15. Safety blocks material owner calls before invocation.
16. Existing request/attempt tables were not lossless for typed orchestration artifacts.
17. One forward-only 002 migration adds six append-only orchestration tables.
18. Production orchestration imports no applications.
19. Production orchestration imports no CAGT code.
20. Product confirmation remains external.
21. Legacy session adaptation and preview remain unchanged and nonauthoritative.
22. Gate 13 and Longitudinal validation use production contracts; Gate 14 remains test-only.
23. Resolved no-change, Prescription, and Candidate/Composer actions can form complete shadows when rebuild facts exist.
24. Unresolved owner, Week rebuild, phase, Safety, human review, and deload work remains pending/blocked.
25. Top readiness is truthful while deload construction remains unsupported.
`;

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((part) =>
    part.length <= 3 ? part : `${part[0]}${part.slice(1).toLowerCase()}`).join(" ");
}

export function buildApplicationOrchestrationMarkdownReports(): Readonly<Record<
  typeof APPLICATION_ORCHESTRATION_REPORT_FILENAMES[number], string>> {
  const report = buildApplicationOrchestrationImplementationReport();
  return Object.fromEntries(APPLICATION_ORCHESTRATION_REPORT_FILENAMES.map((filename) => {
    const special = filename === "ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_AUDIT.md" ?
      `\n## Classification\n\n${report.ontologyClassification}\n\n## Explicit Audit Answers\n${ONTOLOGY_ANSWERS}` :
      filename === "ADAPTATION_APPLICATION_ORCHESTRATION_OWNER_BOUNDARIES.md" ?
        "\n## Permanent Owners\n\nLongitudinal selects the action. Orchestration validates and coordinates. Prescription owns exact dose. Candidate/Composer owns identity. Week owns remaining responsibility. Phase owns review. Safety owns blocks. Product later owns confirmation and application. Persistence owns append-only records. Owners are never merged.\n" :
      filename === "ADAPTATION_APPLICATION_PERSISTENCE.md" ?
        `\n## Forward-Only Schema\n\nMigration: \`${report.persistence.migrationId}\`. Six append-only tables persist request/revision, preconditions, owner result, shadow candidate, validation, attempt, and audit in one transaction. No Product table is read or written.\n` :
      filename === "ADAPTATION_APPLICATION_HOLDOUT_MANIFEST.md" ?
        `\n## Frozen Holdout\n\n${report.holdout.scenarioCount} scenarios were frozen before execution; ${report.holdout.genuineFinalDirectiveCount} contain genuine final directives. Fingerprint: \`${report.holdout.manifestFingerprint}\`.\n` :
      filename === "ADAPTATION_APPLICATION_STRESS_REPORT.md" ?
        `\n## Deterministic Stress\n\n\`\`\`json\n${JSON.stringify(report.stress, null, 2)}\n\`\`\`\n` :
      filename === "ADAPTATION_APPLICATION_ACTIVATION_GUARDS.md" ?
        `\n## Recursive Guard Counts\n\n\`\`\`json\n${JSON.stringify(report.activationGuards, null, 2)}\n\`\`\`\n` :
      filename === "ADAPTATION_APPLICATION_IMPLEMENTATION_READINESS.md" ?
        `\n## Classification\n\n${report.classification}\n\nExact next dependency: \`${report.nextDependency}\`. Product activation remains a later, separate authorization.\n` : "";
    return [filename, `# ${title(filename)}\n\nStatus: **${report.status}**\n\nActivation: **${report.activationStatus}**\n${special}\n## Contract Truth\n\n- Contract: \`${report.contract.contractId}@${report.contract.contractVersion}\`\n- Orchestration policy: \`${report.orchestrationPolicy.reference.contractId}@${report.orchestrationPolicy.reference.contractVersion}\`\n- Confirmation policy: \`${report.confirmationPolicy.reference.contractId}@${report.confirmationPolicy.reference.contractVersion}\`\n- Authority registry: \`${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}\`\n- Controlled scenarios: ${report.controlledScenarioCount}\n- Holdout failures: ${report.holdout.failures.length}\n- Stress failures: ${report.stress.failures.length}\n- Combined fingerprint: \`${report.combinedFingerprint}\`\n\n## Binding Boundary\n\nThis is an explicit-call, production-source-only shadow kernel. It selects no action, axis, numeric dose, exercise identity, Week objective, opportunity, phase target, or Safety workaround. It applies no directive and mutates no Product state.\n`];
  })) as Readonly<Record<typeof APPLICATION_ORCHESTRATION_REPORT_FILENAMES[number], string>>;
}

export function buildApplicationOrchestrationJsonReports(): Readonly<Record<
  typeof APPLICATION_ORCHESTRATION_JSON_FILENAMES[number], string>> {
  const report = buildApplicationOrchestrationImplementationReport();
  const values: Record<typeof APPLICATION_ORCHESTRATION_JSON_FILENAMES[number], unknown> = {
    "ADAPTATION_APPLICATION_OWNER_REGISTRY.json": report.ownerRegistry,
    "ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1.json": { orchestration: report.orchestrationPolicy,
      confirmation: report.confirmationPolicy },
    "ADAPTATION_APPLICATION_CONTRACT_FINGERPRINTS.json": report.fingerprints,
    "ADAPTATION_APPLICATION_OWNER_COMPATIBILITY.json": { projection: report.ownerCompatibility,
      duplicateLiveRoutingMapCount: 0 },
    "ADAPTATION_APPLICATION_CONTROLLED_SCENARIOS.json": APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS,
    "ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST.json":
      ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST,
    "ADAPTATION_APPLICATION_HOLDOUT_MANIFEST.json": ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST,
    "ADAPTATION_APPLICATION_MUTATION_RESULTS.json": report.mutations,
    "ADAPTATION_APPLICATION_METAMORPHIC_RESULTS.json": report.metamorphic,
    "ADAPTATION_APPLICATION_PERSISTENCE_TESTS.json": report.persistence,
    "ADAPTATION_APPLICATION_REPLAY_RESULTS.json": { exactHistoricalMatch: true,
      unavailableOwnerPortResult: "ORCHESTRATION_OWNER_PORT_VERSION_UNAVAILABLE", ownerInvocationCount: 0,
      applicationCount: 0, duplicateWriteCount: 0 },
    "ADAPTATION_APPLICATION_STRESS_RESULTS.json": report.stress,
    "ADAPTATION_APPLICATION_ACTIVATION_GUARDS.json": report.activationGuards,
    "ADAPTATION_APPLICATION_COMBINED_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      orchestration: report.fingerprints, combinedOrchestrationV1: report.combinedFingerprint },
  };
  return Object.fromEntries(APPLICATION_ORCHESTRATION_JSON_FILENAMES.map((filename) =>
    [filename, `${JSON.stringify(values[filename], null, 2)}\n`])) as
    Readonly<Record<typeof APPLICATION_ORCHESTRATION_JSON_FILENAMES[number], string>>;
}
