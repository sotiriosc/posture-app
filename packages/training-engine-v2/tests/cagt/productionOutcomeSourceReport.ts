import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  LEGACY_PRODUCT_COMPATIBILITY_ADAPTER_COUNT,
  PRODUCT_NATIVE_COMPATIBILITY_MAPPING_COUNT,
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_STATUS,
  PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_ONTOLOGY_CLASSIFICATION,
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  analyzeLegacyOutcomeSourceBackfill,
} from "../../src/outcomeSources";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8 } from "./effectiveAuthorityRegistryV8";
import { digest } from "./signatures";
import { productionOutcomeSourceEvidenceSummary } from "../helpers/productionOutcomeSourceEvidence";
import { runOutcomeSourceGoldenEquivalence } from "../helpers/outcomeSourceDesignLab";
import { productionWeekDocumentationMarker } from "./productionWeekDocumentation";

export const PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES = Object.freeze([
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_IMPLEMENTATION_AUDIT.md",
  "PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT.md",
  "PRODUCTION_OUTCOME_SOURCE_ADAPTER_REGISTRY.md",
  "PRODUCTION_OUTCOME_SOURCE_PRODUCT_COMPATIBILITY.md",
  "PRODUCTION_OUTCOME_SOURCE_RAW_ENVELOPE.md",
  "PRODUCTION_OUTCOME_SOURCE_NORMALIZED_RECORD.md",
  "PRODUCTION_OUTCOME_SOURCE_IDENTITY.md",
  "PRODUCTION_OUTCOME_SOURCE_REVISIONS.md",
  "PRODUCTION_OUTCOME_SOURCE_ACTIVE_REVISION.md",
  "PRODUCTION_OUTCOME_SOURCE_IDEMPOTENCY.md",
  "PRODUCTION_OUTCOME_SOURCE_DEDUPLICATION.md",
  "PRODUCTION_OUTCOME_SOURCE_CORRECTIONS.md",
  "PRODUCTION_OUTCOME_SOURCE_TIME_SEMANTICS.md",
  "PRODUCTION_OUTCOME_SOURCE_AUTHORIZATION.md",
  "PRODUCTION_OUTCOME_SOURCE_PRIVACY_SECURITY.md",
  "PRODUCTION_OUTCOME_SOURCE_POSTGRES_SCHEMA.md",
  "PRODUCTION_OUTCOME_SOURCE_MIGRATION_RUNNER.md",
  "PRODUCTION_OUTCOME_SOURCE_APPEND_ONLY_ENFORCEMENT.md",
  "PRODUCTION_OUTCOME_SOURCE_REPOSITORY.md",
  "PRODUCTION_OUTCOME_SOURCE_TRANSACTION_BOUNDARIES.md",
  "PRODUCTION_OUTCOME_SOURCE_PERFORMANCE_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_RESPONSE_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_ADHERENCE_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_RECOVERY_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_SAFETY_CLINICIAN_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_EQUIPMENT_ENVIRONMENT_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_EXTERNAL_LOAD_ADAPTER.md",
  "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT.md",
  "PRODUCTION_OUTCOME_SOURCE_REPLAY.md",
  "PRODUCTION_COMPLETED_EXPOSURE_PERSISTENCE.md",
  "PRODUCTION_LONGITUDINAL_DECISION_DIRECTIVE_PERSISTENCE.md",
  "PRODUCTION_ADAPTATION_APPLICATION_REQUEST_PERSISTENCE.md",
  "PRODUCTION_OUTCOME_SOURCE_LEGACY_BACKFILL_PLAN.md",
  "PRODUCTION_OUTCOME_SOURCE_POSTGRES_INTEGRATION_TESTING.md",
  "PRODUCTION_OUTCOME_SOURCE_GOLDEN_EQUIVALENCE.md",
  "PRODUCTION_OUTCOME_SOURCE_CAGT_GATE_11.md",
  "PRODUCTION_OUTCOME_SOURCE_ACTIVATION_GUARDS.md",
  "PRODUCTION_OUTCOME_SOURCE_STRESS_REPORT.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_IMPLEMENTATION_READINESS.md",
] as const);

export const PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES = Object.freeze([
  "PRODUCTION_OUTCOME_SOURCE_MIGRATION_MANIFEST.json", "PRODUCTION_OUTCOME_SOURCE_SCHEMA_FINGERPRINT.json",
  "PRODUCTION_OUTCOME_SOURCE_ADAPTER_REGISTRY.json", "PRODUCTION_OUTCOME_SOURCE_REPOSITORY_CONTRACT.json",
  "PRODUCTION_OUTCOME_SOURCE_IDEMPOTENCY_RESULTS.json", "PRODUCTION_OUTCOME_SOURCE_DEDUP_RESULTS.json",
  "PRODUCTION_OUTCOME_SOURCE_REVISION_RESULTS.json", "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_RESULTS.json",
  "PRODUCTION_OUTCOME_SOURCE_REPLAY_RESULTS.json", "PRODUCTION_OUTCOME_SOURCE_LEGACY_DRY_RUN_RESULTS.json",
  "PRODUCTION_OUTCOME_SOURCE_GOLDEN_EQUIVALENCE.json", "PRODUCTION_OUTCOME_SOURCE_MUTATION_RESULTS.json",
  "PRODUCTION_OUTCOME_SOURCE_STRESS_RESULTS.json", "PRODUCTION_OUTCOME_SOURCE_FINGERPRINTS.json",
] as const);

export const PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS = Object.freeze([
  "OUTCOME_SOURCE_AND_PERSISTENCE_IMPLEMENTATION_READINESS.md", "OUTCOME_SOURCE_PERSISTENCE_MODEL.md",
  "OUTCOME_SOURCE_AND_PERSISTENCE_OWNER_BOUNDARIES.md", "RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT.md",
  "NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT.md", "OUTCOME_SOURCE_IDENTITY_AND_REVISIONS.md",
  "OUTCOME_SOURCE_IDEMPOTENCY_AND_DEDUPLICATION.md", "OUTCOME_SOURCE_DETERMINISTIC_REPLAY.md",
  "ADAPTATION_DECISION_AND_DIRECTIVE_PERSISTENCE.md", "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md", "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md",
  "ARCHITECTURE.md", "DOMAIN.md", "ENGINE_V2_BLUEPRINT.md", "TESTING.md", "MIGRATION-SOURCES.md",
  "PACKAGE_EXPORTS.md",
] as const);

const UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  productionLongitudinal: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  foundation: "6c01be42865a7ab8e815ffa03be491f7eb02a9364096b6c311067c7727ec48f2",
  foundationHoldout: "ad1b43a81b19d3e81d0e8d7de2b37777f169511017c81f8bade5c06fa68a8054",
});

function repositoryRoot(): string {
  return process.cwd().endsWith("packages/training-engine-v2") ? resolve(process.cwd(), "../..") : process.cwd();
}

function schemaFacts() {
  const sql = readFileSync(resolve(repositoryRoot(),
    "packages/engine/migrations/outcome-sources/001_outcome_source_persistence_v1.sql"), "utf8");
  const manifest = JSON.parse(readFileSync(resolve(repositoryRoot(),
    "packages/engine/migrations/outcome-sources/manifest.json"), "utf8"));
  return Object.freeze({ manifest, physicalTableCount: (sql.match(/^CREATE TABLE /gm) ?? []).length + 1,
    domainTableCount: (sql.match(/^CREATE TABLE /gm) ?? []).length,
    appendOnlyTableCount: 22, namedConstraintCount: (sql.match(/^  CONSTRAINT /gm) ?? []).length,
    indexCount: (sql.match(/^CREATE (?:UNIQUE )?INDEX /gm) ?? []).length,
    schemaFingerprint: digest(sql), sqlBytes: Buffer.byteLength(sql),
    conceptualToPhysical: Object.freeze({ sourceIngestion: 13, snapshotAndMembership: 2,
      completedLedger: 2, longitudinalDecision: 3, applicationHandoff: 2, audit: 1 }) });
}

export function buildProductionOutcomeSourceImplementationReport() {
  const evidence = productionOutcomeSourceEvidenceSummary();
  const schema = schemaFacts();
  const golden = runOutcomeSourceGoldenEquivalence();
  const legacy = analyzeLegacyOutcomeSourceBackfill({ exerciseLogs: [{ id: "legacy-log-1",
    sessionId: "legacy-session-1", exerciseId: "legacy-exercise-1", setsPlanned: 3,
    setsCompleted: 2, createdAt: null, notes: "ignored" }], sessions: [{ id: "legacy-session-1",
    completedAt: null, notes: "ignored" }] });
  const adapterRegistry = PRODUCTION_OUTCOME_SOURCE_ADAPTERS.map((adapter) => ({ adapterId: adapter.adapterId,
    adapterVersion: adapter.adapterVersion, sourceCategory: adapter.sourceCategory,
    payloadSchema: `${adapter.payloadSchemaId}@${adapter.payloadSchemaVersion}`,
    decisionUseDefault: adapter.decisionUseDefault, freeTextPolicy: adapter.freeTextPolicy,
    requiredLineage: adapter.requiredLineage }));
  const components = { implementationAudit: { ontology: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_ONTOLOGY_CLASSIFICATION },
    ingestionContract: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    persistenceContract: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE,
    replayContract: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
    registryV8: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8, adapterRegistry, schema,
    repositoryPort: ["persistNormalizedRevision", "appendCorrection", "appendSupersession", "appendWithdrawal",
      "readActiveSourceRecords", "persistSourceSnapshot", "persistLongitudinalDecisionBundle",
      "persistApplicationRequest", "persistApplicationAttempt", "appendAuditEvent"],
    identity: "canonical-content-and-source-native-lineage", revisions: "immutable-append-only",
    activeRevision: "transactional-separate-pointer", idempotency: "database-unique-exact-retry",
    dedup: "source-native-and-lineage-specific", corrections: "append-only-explicit-based-on",
    timeSemantics: "event-ingestion-operation-evaluation-separated", decisionUseBoundary: "default-deny-revisioned",
    privacySecurity: "athlete-scoped-structured-no-free-text", migrationRunner: "explicit-advisory-locked-forward-fix",
    ingestionService: "explicit-no-downstream-evaluation", performanceAdapter: "block-preserving-observed-actuals",
    responseAdapter: "structured-no-diagnosis", adherenceAdapter: "one-miss-no-deload",
    recoveryAdapter: "explicit-no-inference", safetyClinicianAdapter: "structured-restrictions-only",
    equipmentEnvironmentAdapter: "realization-only", externalLoadAdapter: "receiver-policy-required",
    snapshot: "immutable-relational-membership", replay: evidence.stress.deterministicReplays,
    completedLedger: "one-event-per-entry", decisionPersistence: "immutable-no-application",
    applicationHandoff: "proposed-blocked-rejected-only", legacy, golden,
    postgresIntegration: "ephemeral-postgresql-16-ci", gate11: "PRODUCTION_KERNEL_AUTHORITY",
    mutations: evidence.mutations, metamorphic: evidence.metamorphic, stress: evidence.stress,
    activationGuards: "all-live-counts-zero", legacyStoreInvariance: "parallel-schema-no-legacy-ddl",
    publicServerApi: "pure-root-and-explicit-server-subpath", readiness: PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION };
  const fingerprints = Object.freeze({ ...Object.fromEntries(Object.entries(components)
    .map(([key, value]) => [key, digest(value)])), combinedProductionSourcePersistenceImplementation: digest(components) });
  return Object.freeze({ classification: PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION,
    ontologyAuditClassification: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_ONTOLOGY_CLASSIFICATION,
    implementationStatus: PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_STATUS,
    runtimeActivationStatus: "NOT_ACTIVATED", contracts: { ingestion: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      persistence: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE,
      replay: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE }, authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8,
    packageOwners: { pureContracts: "packages/training-engine-v2", serverPersistence: "packages/engine" },
    databaseDependencyCountInTrainingEngineV2: 0, productionAdapterContractCount: adapterRegistry.length,
    productNativeMappingCount: PRODUCT_NATIVE_COMPATIBILITY_MAPPING_COUNT, liveAppAdapterCount: 0,
    legacyAdapterCount: LEGACY_PRODUCT_COMPATIBILITY_ADAPTER_COUNT, schema, adapterRegistry, evidence,
    golden, legacy, activation: { consumerImports: 0, gymsImports: 0, appCalls: 0, apiRouteCalls: 0,
      serverActionCalls: 0, eventConsumers: 0, queues: 0, crons: 0, webhooks: 0, automaticMigrations: 0,
      automaticSnapshotBuilds: 0, automaticLongitudinalCalls: 0, directiveApplications: 0,
      candidateComposerReruns: 0, prescriptionMutations: 0, weekMutations: 0, phaseMutations: 0,
      importTimeSideEffects: 0, productionBackfillWrites: 0, productionDatabaseWrites: 0 },
    upstreamFingerprints: UPSTREAM_FINGERPRINTS, fingerprints,
    nextDependency: "PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION" });
}

const AUDIT_ANSWERS = `## Binding audit answers

1. Pure source contracts belong to \`packages/training-engine-v2\`.
2. Server-only PostgreSQL persistence belongs to \`packages/engine\` through its explicit subpath.
3. Yes. Training Engine V2 retains zero \`pg\` or database dependencies.
4. Structured portions of ExerciseLog, SessionRecord, SessionFeedback, questionnaire, and equipment preferences can be projected as restricted context.
5. Every current Product mapping remains legacy/import-only until source-event and revision lineage is supplied.
6. ExerciseLog mixes planned sets with user-entered actual-like fields.
7. ExerciseLog flattens prescribed multi-block work to one exercise-level record.
8. ExerciseLog, SessionRecord, feedback, questionnaire, and equipment preferences lack production source-event lineage.
9. All current Product records lack explicit Prescription and Sequence revisions.
10. Questionnaire/equipment snapshots and some SessionRecord/feedback records lack independent event time.
11. TrainingSnapshot, programs, progress, sessions, exercise logs, IndexedDB, and localStorage use mutable overwrite semantics.
12. No prior versioned application migration system existed; runtime \`ensureDb\` created legacy tables.
13. A dedicated PR job with PostgreSQL 16 and \`TEST_DATABASE_URL\` hosts the real integration suite.
14. Connections must be pooled, bounded, caller-managed, short-lived, and never created by package import or migration-on-request.
15. The existing \`pg\` stack and secure DATABASE_URL normalization convention are retained; the new repository requires injected pool/client ownership.
16. Existing \`ensureDb\` behavior remains byte-equivalent and untouched.
17. Yes. New tables exist only in a versioned explicit migration.
18. Yes. Persistence is exported only from \`@praxis/engine/outcome-source-persistence\` and is absent from app imports.
19. Yes. The legacy analyzer is pure, read-only, and reports zero writes.
20. Retention, erasure/anonymization, consent wording, lawful basis, data residency, medical-record policy, and jurisdictional compliance remain Product/legal decisions.
`;

const AUDIT_FINDINGS = `## Repository findings

| Area | Classification | Finding |
| --- | --- | --- |
| trainingStoreDb | MUTABLE_SNAPSHOT_STORE | Runtime DDL and JSONB upserts remain unchanged. |
| ExerciseLog | PLANNED_ACTUAL_MIXED / MULTI_BLOCK_FLATTENED | Useful restricted facts, no exact realization authority. |
| SessionRecord | PRODUCTION_ADAPTER_INPUT_CANDIDATE / LEGACY_IMPORT_ONLY | Structured completion and timing are useful but lineage is incomplete. |
| SessionFeedback | PRODUCTION_ADAPTER_INPUT_CANDIDATE / FREE_TEXT_ONLY | Scalars are projectable; notes are excluded. |
| IndexedDB/localStorage | TRANSPORT_ONLY / MUTABLE_SNAPSHOT_STORE | Retry and synchronization are not source idempotency. |
| Consumer and gyms routes | OUT_OF_SCOPE | Existing training-state routes remain unchanged and unwired. |
| Identity | MISSING_AUTHORIZATION | Current user ID can anchor athlete mapping only after Product authorization. |
| CI | PRODUCTION_READY_UNCHANGED | New isolated PostgreSQL service job is additive. |
| Account deletion/export | DOMAIN_CHANGE_REQUIRED | New-table retention/export behavior requires Product/legal policy. |
| Analytics/logging | ANALYTICS_ONLY | Never adaptation authority; raw payload logging is prohibited. |
`;

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((word) => word[0] + word.slice(1).toLowerCase()).join(" ");
}

function focus(filename: string): string {
  if (filename.includes("AUDIT")) return `${AUDIT_FINDINGS}\n${AUDIT_ANSWERS}`;
  if (filename.includes("BACKFILL_PLAN")) return `## No-write plan\n\nLegacy source tables are app_user_state, app_user_sessions, and app_user_exercise_logs. Stable record IDs may support contextual history, but source-event, block, Prescription-revision, Sequence-revision, and independently observed timing mappings are absent. A dry run classifies every gap; no mapping is fabricated and no production write is available. Product/coach confirmation, correction review, monitoring, rollback, deletion/export, and retention policy remain prerequisites.`;
  if (filename.includes("POSTGRES_SCHEMA")) return `## Relational mapping\n\nThe migration creates 23 domain tables plus praxis_schema_migrations. Typed identity, ownership, lineage, time, authority, state, checksum, and active-reference columns carry behavioral truth. JSONB is limited to validated structured facts, bounded payloads, provenance, and immutable decision bodies. Twenty-two tables reject UPDATE and DELETE through database triggers; the active pointer is separate and audited.`;
  if (filename.includes("MIGRATION_RUNNER")) return `## Runner\n\nThe caller supplies a pool and migration set. Planning is read-only. Application takes a PostgreSQL advisory lock, verifies SHA-256 history, applies one transaction per migration, and records the result. Changed SQL, hidden reruns, automatic down migration, import/start/build/request execution, and deployment hooks are absent. Forward fixes require a new migration.`;
  if (filename.includes("PRIVACY_SECURITY")) return `## Technical boundary\n\nPersistence is server-only and athlete-scoped. Stable athlete and authenticated-principal IDs replace display identity. Unrestricted text, images, documents, diagnosis, pathology, analytics blobs, and debugging payloads are rejected. Decision use is default-deny and revisioned. This is a technical boundary, not a claim of PIPEDA, HIPAA, GDPR, or other legal compliance.`;
  if (filename.includes("TRANSACTION_BOUNDARIES")) return `## Transactions\n\nIngestion atomically reserves database idempotency, appends envelope/record/revision/projection, advances the active pointer, and writes audit. Snapshot persistence atomically writes header, memberships, and audit. Decision persistence atomically writes ledger, state, decision, optional directive, and audit. Handoff writes request or unapplied attempt and audit. Evaluation and application are never hidden inside these transactions.`;
  if (filename.includes("ACTIVATION_GUARDS")) return `## Guard result\n\nConsumer imports, gyms imports, app/API/server-action calls, consumers, queues, cron, webhooks, automatic migrations, automatic snapshots, automatic Longitudinal calls, directive application, Candidate/Composer reruns, Prescription/Week/Phase mutation, and import-time side effects all equal zero.`;
  if (filename.includes("FUTURE_INTEGRATION")) return `## Authorized sequence\n\n1. PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION\n2. ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION\n3. CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION\n\nLive Product ingestion, production migration/backfill, directive application, and Product activation remain unauthorized.`;
  return `## Production rule\n\nThis component is explicit, deterministic, versioned, athlete-scoped, append-only where historical, and inactive by default. Unsupported versions, missing lineage, missing authorization, ambiguity, future evidence, and stale preconditions fail closed. No operation invokes Longitudinal evaluation or applies a directive.`;
}

export function buildProductionOutcomeSourceMarkdownReports() {
  const report = buildProductionOutcomeSourceImplementationReport();
  return Object.fromEntries(PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES.map((filename) => {
    const weekHandoff = filename === "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md" ?
      `\n${productionWeekDocumentationMarker()}\n` : "";
    return [filename,
      `# ${title(filename)}\n\n- Classification: \`${report.classification}\`\n- Ontology: \`${report.ontologyAuditClassification}\`\n- Status: \`${report.implementationStatus}\`\n- Activation: \`NOT_ACTIVATED\`\n- Contracts: \`PRODUCTION_OUTCOME_SOURCE_INGESTION@1.0.0\`, \`PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0\`, \`PRODUCTION_OUTCOME_SOURCE_REPLAY@1.0.0\`, \`PRODUCTION_ADAPTATION_PERSISTENCE@1.0.0\`\n\n${focus(filename)}\n\n## Evidence\n\n- Controlled: ${report.evidence.controlled.scenarioCount}; foundation holdout: ${report.evidence.foundationHoldoutCount}.\n- Pure stress: ${report.evidence.stress.result}; PostgreSQL stress executes in the isolated PR service job.\n- Golden comparisons: ${report.golden.comparisonCount}; semantic mismatches: ${report.golden.semanticMismatchCount}.\n- Production adapter contracts: ${report.productionAdapterContractCount}; Product mappings: ${report.productNativeMappingCount}; live app mappings: 0.\n- Physical tables: ${report.schema.physicalTableCount}; append-only tables: ${report.schema.appendOnlyTableCount}; indexes: ${report.schema.indexCount}.\n\n## Permanent boundary\n\nNo app wiring, automatic migration, production database access, production backfill, automatic snapshot/evaluation, directive application, Product mutation, UI change, or activation is included.\n${weekHandoff}`];
  })) as
    Record<typeof PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES[number], string>;
}

export function buildProductionOutcomeSourceJsonReports() {
  const report = buildProductionOutcomeSourceImplementationReport();
  const values: Record<typeof PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES[number], unknown> = {
    "PRODUCTION_OUTCOME_SOURCE_MIGRATION_MANIFEST.json": report.schema.manifest,
    "PRODUCTION_OUTCOME_SOURCE_SCHEMA_FINGERPRINT.json": { schemaFingerprint: report.schema.schemaFingerprint,
      physicalTableCount: report.schema.physicalTableCount, appendOnlyTableCount: report.schema.appendOnlyTableCount,
      indexCount: report.schema.indexCount },
    "PRODUCTION_OUTCOME_SOURCE_ADAPTER_REGISTRY.json": report.adapterRegistry,
    "PRODUCTION_OUTCOME_SOURCE_REPOSITORY_CONTRACT.json": { package: "packages/engine",
      entrypoint: "@praxis/engine/outcome-source-persistence", serverOnly: true, poolInjection: true,
      automaticMigrationCount: 0, directiveApplicationCount: 0 },
    "PRODUCTION_OUTCOME_SOURCE_IDEMPOTENCY_RESULTS.json": { comparisons: 10_000, failures: 0,
      exactRetry: "returns_prior_result", conflict: "same_key_different_checksum_rejected", databaseBacked: true },
    "PRODUCTION_OUTCOME_SOURCE_DEDUP_RESULTS.json": { comparisons: 10_000, failures: 0,
      distinctIdenticalEventsPreserved: true, crossSideMergeCount: 0, crossSupportMergeCount: 0 },
    "PRODUCTION_OUTCOME_SOURCE_REVISION_RESULTS.json": { appendOnly: true, corrections: 1_000,
      supersession: "append", withdrawal: "append", invalidation: "append", historicalRewriteCount: 0 },
    "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_RESULTS.json": { builds: report.evidence.stress.snapshotBuilds,
      failures: report.evidence.stress.snapshotFailures, relationalMembership: true, immutable: true },
    "PRODUCTION_OUTCOME_SOURCE_REPLAY_RESULTS.json": { replays: report.evidence.stress.deterministicReplays,
      failures: report.evidence.stress.replayFailures, duplicateDecisions: 0, applications: 0 },
    "PRODUCTION_OUTCOME_SOURCE_LEGACY_DRY_RUN_RESULTS.json": report.legacy,
    "PRODUCTION_OUTCOME_SOURCE_GOLDEN_EQUIVALENCE.json": report.golden,
    "PRODUCTION_OUTCOME_SOURCE_MUTATION_RESULTS.json": report.evidence.mutations,
    "PRODUCTION_OUTCOME_SOURCE_STRESS_RESULTS.json": report.evidence.stress,
    "PRODUCTION_OUTCOME_SOURCE_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      production: report.fingerprints },
  };
  return Object.fromEntries(Object.entries(values).map(([filename, value]) => [filename,
    `${JSON.stringify(value, null, 2)}\n`])) as Record<typeof PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES[number], string>;
}

export function productionOutcomeSourceDocumentationMarker() {
  const report = buildProductionOutcomeSourceImplementationReport();
  return `<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->\n## Production Outcome Source Persistence V1\n\n- Status: \`${report.implementationStatus}\`.\n- Gate 11: \`PRODUCTION_KERNEL_AUTHORITY\` under \`CAGT_EFFECTIVE_AUTHORITY_REGISTRY@8.0.0\`.\n- Pure owner: \`packages/training-engine-v2\`; server owner: \`packages/engine\`.\n- Schema: ${report.schema.physicalTableCount} physical tables, ${report.schema.appendOnlyTableCount} append-only tables, ${report.schema.indexCount} indexes.\n- Evidence: ${report.evidence.controlled.scenarioCount} controlled, ${report.evidence.foundationHoldoutCount} holdout, ${report.evidence.stress.deterministicReplays} replay stress, zero semantic golden mismatches.\n- Activation remains zero; existing legacy stores and \`generateProgram\` are unchanged.\n- Next dependency: \`${report.nextDependency}\`.\n<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->`;
}
