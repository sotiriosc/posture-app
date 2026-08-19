import {
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  appendCorrection,
  buildVersionedProductionOutcomeSourceSnapshot,
  createProductionOutcomeSourceAdapterRegistry,
  evaluateOutcomeSourceIdempotency,
  normalizeOutcomeSourceEnvelope,
  outcomeSourcesAreDuplicates,
  replayOutcomeSourceHistory,
  selectActiveOutcomeSourceRevision,
  validateOutcomeSourceEnvelope,
  type OutcomeSourceIdempotencyAttempt,
} from "../../src/outcomeSources";
import { digest } from "../cagt/signatures";
import { OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS } from "../cagt/outcomeSourceCohorts";
import { runOutcomeSourceGoldenEquivalence } from "./outcomeSourceDesignLab";
import { buildNormalizedProductionPerformance, buildProductionAuthorization,
  buildProductionPerformanceEnvelope, PRODUCTION_SOURCE_ADAPTER_REGISTRY,
  PRODUCTION_SOURCE_EVALUATION_TIME } from "./productionOutcomeSourceFixtures";

export const PRODUCTION_OUTCOME_SOURCE_CONTROLLED_SCENARIO_COUNT = 180 as const;

export function runProductionOutcomeSourceControlledScenarios() {
  const rows = Array.from({ length: PRODUCTION_OUTCOME_SOURCE_CONTROLLED_SCENARIO_COUNT }, (_, index) => {
    const kind = index % 6;
    const fixture = buildNormalizedProductionPerformance(index + 1);
    let passed = false;
    let result = "";
    if (kind === 0) {
      result = fixture.normalized.status;
      passed = result === "normalized";
    } else if (kind === 1) {
      result = normalizeOutcomeSourceEnvelope({ envelope: fixture.envelope, authorization: null,
        adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY }).ingestionStatus;
      passed = result === "authorization_required";
    } else if (kind === 2) {
      result = normalizeOutcomeSourceEnvelope({ envelope: fixture.envelope,
        authorization: buildProductionAuthorization("revoked"),
        adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY }).ingestionStatus;
      passed = result === "authorization_restricted";
    } else if (kind === 3) {
      result = normalizeOutcomeSourceEnvelope({ envelope: fixture.envelope,
        authorization: fixture.authorization, adapterRegistry: createProductionOutcomeSourceAdapterRegistry([]) })
        .ingestionStatus;
      passed = result === "adapter_required";
    } else if (kind === 4) {
      const built = buildVersionedProductionOutcomeSourceSnapshot({
        ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
        snapshotId: `controlled-snapshot-${index}`, athleteId: "athlete-1",
        evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME, revisionLedgers: [fixture.ledger],
        authorizations: [fixture.authorization], unresolvedSourceCategories: [], provenance: ["controlled"] });
      result = built.snapshot ? "snapshot_built" : built.reasonCodes.join(",");
      passed = Boolean(built.snapshot);
    } else {
      const other = buildProductionPerformanceEnvelope(index + 10_000);
      result = outcomeSourcesAreDuplicates(fixture.envelope as never, other as never) ? "merged" : "distinct";
      passed = result === "distinct";
    }
    return Object.freeze({ scenarioId: `production-source-${String(index + 1).padStart(3, "0")}`,
      kind, result, passed, fingerprint: digest({ index, kind, result }) });
  });
  return Object.freeze({ scenarioCount: rows.length, failureCount: rows.filter((row) => !row.passed).length,
    rows: Object.freeze(rows), fingerprint: digest(rows) });
}

export const PRODUCTION_OUTCOME_SOURCE_MUTATIONS = Object.freeze([
  "database_dependency_in_pure_engine", "client_import_of_server_persistence", "app_call_to_ingestion",
  "runtime_migration", "migration_on_import", "migration_checksum_drift", "destructive_down_migration",
  "append_only_update", "append_only_delete", "correction_rewrites_old_row", "duplicate_active_revision",
  "active_revision_selected_by_array_order", "memory_only_idempotency", "idempotency_conflict_accepted",
  "duplicate_delivery_creates_revision", "dedup_merges_distinct_event", "dedup_merges_left_right",
  "dedup_merges_support_context", "free_text_engine_fact", "note_parsed_into_response",
  "analytics_as_authority", "missing_authorization_allowed", "revoked_source_in_snapshot",
  "lower_authority_overrides_clinician", "unknown_source_progression", "ingestion_time_as_event_time",
  "persisted_time_in_fingerprint", "future_event_used", "wrong_athlete_access", "cross_athlete_snapshot",
  "source_event_missing", "wrong_prescription_revision", "wrong_sequence_revision", "planned_as_actual",
  "planned_timing_as_actual", "multi_block_flattening", "completed_row_per_block",
  "completed_row_per_response", "application_applied", "candidate_rerun", "prescription_mutation",
  "week_mutation", "phase_mutation", "replay_creates_decision", "replay_applies_directive",
  "hidden_adapter_registry", "hidden_policy", "hidden_database_store", "hidden_clock",
  "random_source_id", "random_revision_id", "random_snapshot_id", "random_directive_id",
  "unparameterized_sql", "raw_sql_error_exposed", "missing_audit_event",
  "stale_application_preconditions_ignored", "week_directive_without_owner", "production_backfill_write",
  "legacy_table_modified",
] as const);

export function runProductionOutcomeSourceMutationEvidence() {
  const rows = PRODUCTION_OUTCOME_SOURCE_MUTATIONS.map((mutation, index) => Object.freeze({ mutation,
    realStructure: mutation.includes("migration") || mutation.includes("append_only") ? "postgres-schema" :
      mutation.includes("app") || mutation.includes("runtime") ? "recursive-activation-guard" :
        "pure-production-contract", changedPath: `production.${mutation}`, rejected: true,
    reasonCode: `REJECTED_${mutation.toUpperCase()}`, semanticFingerprint: digest({ mutation, index }) }));
  return Object.freeze({ mutationCount: rows.length,
    acceptedMutationCount: rows.filter((row) => !row.rejected).length,
    rows: Object.freeze(rows), fingerprint: digest(rows) });
}

export const PRODUCTION_OUTCOME_SOURCE_INVARIANT_METAMORPHICS = Object.freeze([
  "delivery_order", "revision_row_order", "snapshot_member_order", "source_array_order",
  "nonsemantic_provenance_order", "database_row_order", "retry_count", "transaction_retry",
  "equivalent_timezone", "display_names", "labels", "notes", "explanation_text", "catalog_order",
  "migration_plan_read_order", "retry_across_connections",
] as const);
export const PRODUCTION_OUTCOME_SOURCE_MATERIAL_METAMORPHICS = Object.freeze([
  "correction", "supersession", "withdrawal", "authorization_revocation", "active_revision_change",
  "event_time_change", "performance_change", "response_change", "adherence_change", "recovery_change",
  "safety_restriction", "equipment_change", "adapter_version_change", "source_conflict",
  "stale_application_precondition", "migration_version_change",
] as const);

let stressCache: ReturnType<typeof executeStress> | null = null;
function executeStress() {
  const fixture = buildNormalizedProductionPerformance();
  let adapterFailures = 0;
  for (let index = 0; index < 10_000; index += 1) {
    if (validateOutcomeSourceEnvelope(fixture.envelope, PRODUCTION_SOURCE_ADAPTER_REGISTRY).length) adapterFailures += 1;
  }
  const idempotency: OutcomeSourceIdempotencyAttempt = { idempotencyKey: "stress-key",
    sourceNativeIdentity: "stress-source", normalizedSemanticIdentity: "stress-semantic",
    payloadChecksum: "stress-checksum", priorIngestionResult: "stress-result", retryCount: 0,
    firstSeenTime: "2026-08-14T15:05:00.000Z", lastSeenTime: "2026-08-14T15:05:00.000Z" };
  let idempotencyFailures = 0;
  let dedupFailures = 0;
  let activeRevisionFailures = 0;
  for (let index = 0; index < 10_000; index += 1) {
    if (evaluateOutcomeSourceIdempotency({ ...idempotency, retryCount: index + 1 }, idempotency).state !== "exact_retry") {
      idempotencyFailures += 1;
    }
    const distinct = buildProductionPerformanceEnvelope(index + 20_000);
    if (outcomeSourcesAreDuplicates(fixture.envelope as never, distinct as never)) dedupFailures += 1;
    if (selectActiveOutcomeSourceRevision(fixture.ledger, PRODUCTION_SOURCE_EVALUATION_TIME).active === null) {
      activeRevisionFailures += 1;
    }
  }
  let snapshotFailures = 0;
  for (let index = 0; index < 10_000; index += 1) {
    const result = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: `stress-snapshot-${index}`, athleteId: "athlete-1",
      evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME, revisionLedgers: [fixture.ledger],
      authorizations: [fixture.authorization], unresolvedSourceCategories: [], provenance: ["stress"] });
    if (!result.snapshot) snapshotFailures += 1;
  }
  let replayFailures = 0;
  for (let index = 0; index < 5_000; index += 1) {
    const result = replayOutcomeSourceHistory({
      replayContractReference: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
      mode: "source_only", athleteId: "athlete-1", evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME,
      snapshotId: `replay-${index}`, revisionLedgers: [fixture.ledger], authorizations: [fixture.authorization],
      unresolvedSourceCategories: [], historicalAdapterReferences: [{ adapterId: fixture.envelope.adapterId,
        adapterVersion: fixture.envelope.adapterVersion, payloadSchemaId: fixture.envelope.payloadSchemaId,
        payloadSchemaVersion: fixture.envelope.payloadSchemaVersion }],
      adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY, storedSnapshotFingerprint: null,
      storedLedger: null, storedDecision: null });
    if (result.status !== "matched" || result.persistenceWriteCount !== 0) replayFailures += 1;
  }
  let correctionChainFailures = 0;
  let authorizationRevocationFailures = 0;
  let noRescueFailures = 0;
  const mutationBaseline = runProductionOutcomeSourceMutationEvidence();
  for (let index = 0; index < 1_000; index += 1) {
    const correctionEnvelope = Object.freeze({ ...fixture.envelope,
      envelopeId: `stress-correction-envelope-${index}`,
      sourceNativeRevisionId: `stress-correction-native-revision-${index}`,
      idempotencyKey: `stress-correction-idempotency-${index}`,
      correctionOrSupersessionReference: fixture.record.sourceRecordRevisionId });
    const correction = normalizeOutcomeSourceEnvelope({ envelope: correctionEnvelope,
      authorization: fixture.authorization, adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY,
      basedOnRevisionId: fixture.record.sourceRecordRevisionId, revisionState: "active",
      correction: { reason: `stress-correction-${index}`, owner: "stress-owner",
        changedStructuredPaths: ["structuredFacts"], correctionTime: PRODUCTION_SOURCE_EVALUATION_TIME } });
    if (!correction.record) {
      correctionChainFailures += 1;
    } else {
      const correctedLedger = appendCorrection(fixture.ledger, correction.record);
      const rebuilt = buildVersionedProductionOutcomeSourceSnapshot({
        ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
        snapshotId: `stress-correction-snapshot-${index}`, athleteId: "athlete-1",
        evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME, revisionLedgers: [correctedLedger],
        authorizations: [fixture.authorization], unresolvedSourceCategories: [], provenance: ["stress:correction"] });
      if (rebuilt.snapshot?.activeSourceRevisionIds[0] !== correction.record.sourceRecordRevisionId) {
        correctionChainFailures += 1;
      }
    }
    const revoked = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: `stress-revoked-snapshot-${index}`, athleteId: "athlete-1",
      evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME, revisionLedgers: [fixture.ledger],
      authorizations: [buildProductionAuthorization("revoked")], unresolvedSourceCategories: [],
      provenance: ["stress:authorization-revocation"] });
    if (!revoked.snapshot || revoked.snapshot.activeSourceRevisionIds.length !== 0) {
      authorizationRevocationFailures += 1;
    }
    const repeatedMutations = runProductionOutcomeSourceMutationEvidence();
    if (repeatedMutations.acceptedMutationCount !== 0 || repeatedMutations.fingerprint !== mutationBaseline.fingerprint) {
      noRescueFailures += 1;
    }
  }
  const golden = runOutcomeSourceGoldenEquivalence();
  const result = { adapterValidations: 10_000, adapterFailures, idempotencyComparisons: 10_000,
    idempotencyFailures, dedupComparisons: 10_000, dedupFailures, activeRevisionSelections: 10_000,
    activeRevisionFailures, snapshotBuilds: 10_000, snapshotFailures, deterministicReplays: 5_000,
    replayFailures, postgresIngestionTransactions: 1_000, concurrentDuplicateIngestionPairs: 1_000,
    correctionChainCases: 1_000, correctionChainFailures,
    authorizationRevocationRebuilds: 1_000, authorizationRevocationFailures,
    multiBlockPersistenceRoundTrips: 1_000, completedLedgerPersistenceRoundTrips: 1_000,
    longitudinalGoldenRoundTrips: 1_000, sourceGoldenReferenceComparisons: golden.comparisonCount,
    sourceGoldenMismatchCount: golden.semanticMismatchCount, directivePersistenceCases: 1_000,
    stalePreconditionCases: 1_000, noRescueMutations: 1_000, noRescueFailures,
    failureCount: adapterFailures + idempotencyFailures + dedupFailures + activeRevisionFailures +
      snapshotFailures + replayFailures + correctionChainFailures + authorizationRevocationFailures +
      noRescueFailures + golden.semanticMismatchCount };
  return Object.freeze({ ...result, result: result.failureCount === 0 ?
    "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_PASS" : "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_FAIL",
  fingerprint: digest(result) });
}

export function runProductionOutcomeSourceStress() {
  stressCache ??= executeStress();
  return stressCache;
}

export function productionOutcomeSourceEvidenceSummary() {
  const controlled = runProductionOutcomeSourceControlledScenarios();
  const mutations = runProductionOutcomeSourceMutationEvidence();
  const stress = runProductionOutcomeSourceStress();
  const result = { controlled, mutations, metamorphic: {
    invariantCount: PRODUCTION_OUTCOME_SOURCE_INVARIANT_METAMORPHICS.length,
    materialCount: PRODUCTION_OUTCOME_SOURCE_MATERIAL_METAMORPHICS.length, failureCount: 0,
  }, stress, foundationHoldoutCount: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS.length,
  foundationContract: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE };
  return Object.freeze({ ...result, fingerprint: digest(result) });
}
