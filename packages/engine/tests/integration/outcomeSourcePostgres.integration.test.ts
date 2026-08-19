import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  buildVersionedProductionOutcomeSourceSnapshot,
  createProductionOutcomeSourceAdapterRegistry,
  deriveAdaptationDirectiveApplicationRequestId,
  deriveCanonicalOutcomeSourceChecksum,
  derivePersistedApplicationRequestRevisionId,
  type AdaptationDirectiveApplicationRequest,
  type OutcomeSourceDecisionUseAuthorization,
  type PersistedAdaptationApplicationAttempt,
  type ProductionAdaptationDecisionBundle,
  type ProductionRawOutcomeSourceEnvelope,
} from "@praxis/training-engine-v2";
import {
  applyOutcomeSourceMigrations,
  createOutcomeSourceIngestionService,
  createOutcomeSourcePostgresRepository,
  loadOutcomeSourceMigrations,
  type OutcomeSourcePrincipalContext,
} from "../../src/outcomeSourcePersistence";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;
const OPERATION_TIME = "2026-08-14T20:00:00.000Z";
const EVENT_TIME = "2026-08-14T15:00:00.000Z";
const INGESTION_TIME = "2026-08-14T15:05:00.000Z";
const EVALUATION_TIME = "2026-08-14T16:00:00.000Z";

function payload(index: number, load = 20) {
  return Object.freeze({ assignmentId: `assignment-${index}`, originalExerciseId: `exercise-${index}`,
    realizedExerciseId: `exercise-${index}`, blocks: Object.freeze([
      Object.freeze({ plannedBlockId: `planned-${index}-1`, performedBlockId: `performed-${index}-1`,
        completionState: "completed", actualsIndependentlyObserved: true,
        actualRepsBySet: Object.freeze([8, 8, 8]), actualSets: 3, actualLoad: load,
        loadUnit: "kg", actualDurationSeconds: 90, actualOrder: 1 }),
      Object.freeze({ plannedBlockId: `planned-${index}-2`, performedBlockId: `performed-${index}-2`,
        completionState: "partially_completed", actualsIndependentlyObserved: true,
        actualRepsBySet: Object.freeze([6, 5]), actualSets: 2, actualLoad: load,
        loadUnit: "kg", actualDurationSeconds: 60, actualOrder: 2 }),
    ]), substitutionLineage: Object.freeze([`exercise-${index}`]), explicitUnknowns: Object.freeze<string[]>([]) });
}

function envelope(index: number, options: {
  readonly sourceNativeRecordId?: string;
  readonly sourceNativeRevisionId?: string;
  readonly envelopeId?: string;
  readonly idempotencyKey?: string;
  readonly load?: number;
} = {}): ProductionRawOutcomeSourceEnvelope {
  const structuredPayload = payload(index, options.load);
  return Object.freeze({ ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    envelopeId: options.envelopeId ?? `pg-envelope-${index}`, sourceCategory: "exercise_performance",
    sourceSystem: "postgres-integration", sourceNativeRecordId: options.sourceNativeRecordId ?? `performance-${index}`,
    sourceNativeRevisionId: options.sourceNativeRevisionId ?? `performance-revision-${index}`,
    athleteId: "athlete-pg", authenticatedPrincipalId: "principal-pg", lineage: Object.freeze({
      sourceExposureEventId: `source-event-${index}`, sessionId: `session-${index}`,
      opportunityId: `opportunity-${index}`, reservationId: `reservation-${index}`,
      prescriptionId: `prescription-${index}`, prescriptionRevisionId: `prescription-revision-${index}`,
      sequencePlanId: `sequence-${index}`, sequenceRevisionId: `sequence-revision-${index}`,
      plannedBlockId: `planned-${index}-1`, performedBlockId: `performed-${index}-1` }),
    eventTime: EVENT_TIME, eventTimezone: "UTC",
    ingestionTime: INGESTION_TIME, payloadSchemaId: "production-performance-payload",
    payloadSchemaVersion: "1.0.0", adapterId: "production-exercise-performance", adapterVersion: "1.0.0",
    payloadChecksum: deriveCanonicalOutcomeSourceChecksum(structuredPayload),
    idempotencyKey: options.idempotencyKey ?? `pg-idempotency-${index}`,
    decisionUseAuthorizationReference: "pg-authorization", correctionOrSupersessionReference: null,
    structuredPayload, opaquePayloadReference: null,
    provenance: Object.freeze(["postgres-integration:structured-performance"]) });
}

const authorization: OutcomeSourceDecisionUseAuthorization = Object.freeze({ authorizationId: "pg-authorization",
  authorizationVersion: "1", athleteId: "athlete-pg",
  sourceCategories: Object.freeze(["exercise_performance"] as const),
  permittedPurposes: Object.freeze(["longitudinal_adaptation"]), state: "authorized",
  effectiveTime: "2026-01-01T00:00:00.000Z", expirationTime: null, revocationReference: null,
  owner: "integration-owner", provenance: Object.freeze(["postgres-integration:authorization"]) });
const principal: OutcomeSourcePrincipalContext = Object.freeze({ principalId: "principal-pg",
  athleteId: "athlete-pg", authorizedAthleteIds: Object.freeze(["athlete-pg"]),
  authenticationState: "authenticated" });
const registry = createProductionOutcomeSourceAdapterRegistry(PRODUCTION_OUTCOME_SOURCE_ADAPTERS);

describePostgres("real PostgreSQL outcome source persistence", () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: databaseUrl!, max: 24 }); });
  afterAll(async () => { await pool.end(); });

  it("migrates, enforces append-only truth, persists/replays, and survives concurrency stress", async () => {
    const migrations = loadOutcomeSourceMigrations();
    const concurrent = await Promise.all([
      applyOutcomeSourceMigrations({ pool, migrations, operationTime: OPERATION_TIME }),
      applyOutcomeSourceMigrations({ pool, migrations, operationTime: OPERATION_TIME }),
    ]);
    expect(concurrent.reduce((sum, result) => sum + result.appliedCount, 0)).toBe(1);
    expect((await applyOutcomeSourceMigrations({ pool, migrations, operationTime: OPERATION_TIME })).status)
      .toBe("unchanged");
    const tableCount = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM information_schema.tables
       WHERE table_schema = 'public' AND (table_name LIKE 'outcome_source_%'
         OR table_name LIKE 'adaptation_%' OR table_name = 'praxis_schema_migrations')`,
    );
    expect(Number(tableCount.rows[0]?.count)).toBe(24);

    const repository = createOutcomeSourcePostgresRepository({ pool });
    const service = createOutcomeSourceIngestionService({ repository });
    const firstInput = { principal, envelope: envelope(1), authorization, adapterRegistry: registry,
      operationTime: OPERATION_TIME };
    const first = await service.ingestOutcomeSourceEnvelope(firstInput);
    expect(first.status).toBe("ingested_new_record");
    expect((await service.ingestOutcomeSourceEnvelope(firstInput)).status).toBe("exact_retry_returned_prior_result");

    const changed = envelope(1, { idempotencyKey: firstInput.envelope.idempotencyKey, load: 21,
      envelopeId: "conflicting-envelope-1", sourceNativeRevisionId: "conflicting-revision-1" });
    expect((await service.ingestOutcomeSourceEnvelope({ ...firstInput, envelope: changed })).status)
      .toBe("idempotency_payload_conflict");

    await expect(pool.query("UPDATE outcome_source_record_revisions SET review_state = 'reviewed' WHERE source_record_revision_id = $1",
      [first.sourceRecordRevisionId])).rejects.toThrow(/OUTCOME_SOURCE_APPEND_ONLY_MUTATION_REJECTED/);
    await expect(pool.query("DELETE FROM outcome_source_raw_envelopes WHERE envelope_id = $1",
      [first.envelopeId])).rejects.toThrow(/OUTCOME_SOURCE_APPEND_ONLY_MUTATION_REJECTED/);

    const correctionEnvelope = envelope(1, { sourceNativeRecordId: "performance-1",
      sourceNativeRevisionId: "performance-revision-1-correction", envelopeId: "pg-envelope-1-correction",
      idempotencyKey: "pg-idempotency-1-correction", load: 22 });
    const correction = await service.ingestOutcomeSourceEnvelope({ principal, envelope: correctionEnvelope,
      authorization, adapterRegistry: registry, operationTime: OPERATION_TIME,
      basedOnSourceRevisionId: first.sourceRecordRevisionId,
      correction: { reason: "observed_load_corrected", owner: "integration-owner",
        changedStructuredPaths: ["blocks[0].actualLoad"], correctionTime: OPERATION_TIME,
        operation: "correction" } });
    expect(correction.status).toBe("ingested_new_revision");
    const revisionCount = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM outcome_source_record_revisions WHERE source_record_id = $1",
      [first.sourceRecordId]);
    expect(Number(revisionCount.rows[0]?.count)).toBe(2);

    const ledgers = await repository.readRevisionLedgers("athlete-pg");
    expect(ledgers[0]?.revisions[0]?.revision.lineage).toMatchObject({
      plannedBlockId: "planned-1-1", performedBlockId: "performed-1-1",
    });
    const snapshotResult = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: "pg-snapshot", athleteId: "athlete-pg", evaluationTime: EVALUATION_TIME,
      revisionLedgers: ledgers, authorizations: [authorization], unresolvedSourceCategories: [],
      provenance: ["postgres-integration:snapshot"] });
    expect(snapshotResult.reasonCodes).toEqual([]);
    await repository.persistSourceSnapshot({ principal, snapshot: snapshotResult.snapshot!, operationTime: OPERATION_TIME });
    expect((await repository.readSourceSnapshot("athlete-pg", snapshotResult.snapshot!.snapshotRevisionId))?.fingerprint)
      .toBe(snapshotResult.snapshot!.fingerprint);

    const entries = Array.from({ length: 1000 }, (_, index) => ({ outcomeEntryId: `outcome-entry-${index}`,
      sourceExposureEventId: `ledger-source-event-${index}`, originalExerciseId: `exercise-${index}`,
      realizedExerciseId: `exercise-${index}`, prescriptionId: `prescription-${index}`,
      finalPrescriptionRevisionId: `prescription-revision-${index}`, sequencePlanId: `sequence-${index}`,
      finalSequenceRevisionId: `sequence-revision-${index}`, blockPerformanceReferences: [`block-${index}`],
      responseObservationIds: [], recoveryEvidenceIds: [] }));
    const bundle: ProductionAdaptationDecisionBundle = {
      completedLedger: { persistenceContractReference: PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
        ledgerId: "ledger-1", ledgerRevisionId: "ledger-revision-1", basedOnLedgerRevisionId: null,
        athleteId: "athlete-pg", sourceSnapshotRevisionId: snapshotResult.snapshot!.snapshotRevisionId,
        entryIds: entries.map((entry) => entry.outcomeEntryId), payload: { entries },
        evaluatedAt: EVALUATION_TIME, provenance: ["postgres-integration:ledger"] },
      state: { persistenceContractReference: PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
        stateId: "state-1", stateRevisionId: "state-revision-1", basedOnStateRevisionId: null,
        decisionAttemptId: "decision-attempt-1", athleteId: "athlete-pg", targetId: "target-1",
        sourceSnapshotRevisionId: snapshotResult.snapshot!.snapshotRevisionId,
        programSnapshotRevisionId: "program-revision-1", phaseResultRevisionId: "phase-revision-1",
        evidenceWindowId: "window-1", policyId: "longitudinal-policy", policyVersion: "1.0.0",
        state: "productive_continuity", finalForDecisionAttempt: true, evaluatedAt: EVALUATION_TIME,
        provenance: ["postgres-integration:state"] },
      decision: { persistenceContractReference: PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
        decisionId: "decision-1", decisionRevisionId: "decision-revision-1", basedOnDecisionRevisionId: null,
        decisionAttemptId: "decision-attempt-1", stateRevisionId: "state-revision-1", athleteId: "athlete-pg",
        targetId: "target-1", sourceSnapshotRevisionId: snapshotResult.snapshot!.snapshotRevisionId,
        programSnapshotRevisionId: "program-revision-1", phaseResultRevisionId: "phase-revision-1",
        evidenceWindowId: "window-1", policyId: "longitudinal-policy", policyVersion: "1.0.0",
        action: "keep_current", applicationOwner: "product_human", authorizationState: "authorized",
        applicationState: "proposed", finalForDecisionAttempt: true, evaluatedAt: EVALUATION_TIME,
        provenance: ["postgres-integration:decision"] },
      directive: { persistenceContractReference: PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
        directiveId: "directive-1", directiveRevisionId: "directive-revision-1", basedOnDirectiveRevisionId: null,
        decisionId: "decision-1", decisionRevisionId: "decision-revision-1", athleteId: "athlete-pg",
        targetId: "target-1", targetScope: "exact_realization",
        sourceSnapshotRevisionId: snapshotResult.snapshot!.snapshotRevisionId,
        programSnapshotRevisionId: "program-revision-1", action: "keep_current", requestedDimensions: [],
        applicationOwner: "product_human", applicationState: "proposed", createdAt: EVALUATION_TIME,
        provenance: ["postgres-integration:directive"] },
    };
    await repository.persistLongitudinalDecisionBundle({ principal, bundle, operationTime: OPERATION_TIME });
    expect(Number((await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM adaptation_completed_exposure_entries WHERE ledger_revision_id = $1",
      [bundle.completedLedger.ledgerRevisionId])).rows[0]?.count)).toBe(1000);

    const stressBundles: ProductionAdaptationDecisionBundle[] = entries.map((entry, index) => {
      const suffix = `stress-${index}`;
      const stateRevisionId = `state-revision-${suffix}`;
      const decisionId = `decision-${suffix}`;
      const decisionRevisionId = `decision-revision-${suffix}`;
      return {
        completedLedger: { ...bundle.completedLedger, ledgerId: `ledger-${suffix}`,
          ledgerRevisionId: `ledger-revision-${suffix}`, entryIds: [entry.outcomeEntryId],
          payload: { entries: [entry] }, provenance: ["postgres-integration:stress-ledger"] },
        state: { ...bundle.state, stateId: `state-${suffix}`, stateRevisionId,
          decisionAttemptId: `decision-attempt-${suffix}`, targetId: `target-${suffix}`,
          provenance: ["postgres-integration:stress-state"] },
        decision: { ...bundle.decision, decisionId, decisionRevisionId,
          decisionAttemptId: `decision-attempt-${suffix}`, stateRevisionId, targetId: `target-${suffix}`,
          provenance: ["postgres-integration:stress-decision"] },
        directive: { ...bundle.directive!, directiveId: `directive-${suffix}`,
          directiveRevisionId: `directive-revision-${suffix}`, decisionId, decisionRevisionId,
          targetId: `target-${suffix}`, provenance: ["postgres-integration:stress-directive"] },
      };
    });
    for (let start = 0; start < stressBundles.length; start += 25) {
      await Promise.all(stressBundles.slice(start, start + 25).map((stressBundle) =>
        repository.persistLongitudinalDecisionBundle({ principal, bundle: stressBundle,
          operationTime: OPERATION_TIME })));
    }
    const persistenceStress = await pool.query<{ ledgers: string; entries: string; states: string;
      decisions: string; directives: string }>(
      `SELECT
         (SELECT COUNT(*) FROM adaptation_completed_exposure_ledgers WHERE ledger_id LIKE 'ledger-stress-%')::text AS ledgers,
         (SELECT COUNT(*) FROM adaptation_completed_exposure_entries WHERE ledger_revision_id LIKE 'ledger-revision-stress-%')::text AS entries,
         (SELECT COUNT(*) FROM adaptation_longitudinal_state_revisions WHERE state_id LIKE 'state-stress-%')::text AS states,
         (SELECT COUNT(*) FROM adaptation_longitudinal_decision_revisions WHERE decision_id LIKE 'decision-stress-%')::text AS decisions,
         (SELECT COUNT(*) FROM adaptation_action_directives WHERE directive_id LIKE 'directive-stress-%')::text AS directives`,
    );
    expect(persistenceStress.rows[0]).toEqual({ ledgers: "1000", entries: "1000", states: "1000",
      decisions: "1000", directives: "1000" });

    const requestBase = { directiveId: "directive-1", directiveRevisionId: "directive-revision-1",
      athleteId: "athlete-pg", targetId: "target-1", targetScope: "exact_realization", action: "keep_current",
      applicationOwner: "product_human" as const, expectedCurrentEntityRevisions: { program: "program-revision-1" },
      requestedAppliedDimensions: [] as string[], confirmationRequirement: "required" as const,
      policyReferences: [{ policyId: "longitudinal-policy", version: "1.0.0" }],
      idempotencyKey: "application-request-1", createdAt: OPERATION_TIME };
    const request: AdaptationDirectiveApplicationRequest = { ...requestBase,
      requestId: deriveAdaptationDirectiveApplicationRequestId(requestBase),
      provenance: ["postgres-integration:application-request"] };
    const requestRevisionId = derivePersistedApplicationRequestRevisionId(request);
    await repository.persistApplicationRequest({ principal, requestRevisionId, request,
      confirmationState: "required", operationTime: OPERATION_TIME });
    const attempts: PersistedAdaptationApplicationAttempt[] = Array.from({ length: 1000 }, (_, index) => ({
      persistenceContractReference: PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE,
      attemptId: `blocked-attempt-${index}`, requestId: request.requestId, athleteId: "athlete-pg",
      principalId: "principal-pg", directiveRevisionId: "directive-revision-1", rightfulOwner: "product_human",
      preconditionResult: { satisfied: false, reasonCodes: ["APPLICATION_PROGRAM_REVISION_STALE"] },
      confirmationState: "required", result: "blocked_stale", beforeReferences: ["program-revision-1"],
      afterReferences: [], rollbackReference: null, attemptedAt: OPERATION_TIME,
      provenance: ["postgres-integration:stale-attempt"] }));
    for (const attempt of attempts) await repository.persistApplicationAttempt({ principal, requestRevisionId,
      attempt, operationTime: OPERATION_TIME });
    expect(Number((await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM adaptation_application_attempts")).rows[0]?.count)).toBe(1000);

    let created = 0;
    let retried = 0;
    for (let start = 1000; start < 2000; start += 25) {
      const indexes = Array.from({ length: 25 }, (_, offset) => start + offset);
      const results = await Promise.all(indexes.flatMap((index) => {
        const call = { principal, envelope: envelope(index), authorization,
          adapterRegistry: registry, operationTime: OPERATION_TIME };
        return [service.ingestOutcomeSourceEnvelope(call), service.ingestOutcomeSourceEnvelope(call)];
      }));
      created += results.filter((result) => result.status === "ingested_new_record").length;
      retried += results.filter((result) => result.status === "exact_retry_returned_prior_result").length;
    }
    expect({ created, retried }).toEqual({ created: 1000, retried: 1000 });
    expect(Number((await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM outcome_source_performance_blocks WHERE athlete_id = 'athlete-pg'"
    )).rows[0]?.count)).toBeGreaterThanOrEqual(2002);

    const crossAthlete = await service.ingestOutcomeSourceEnvelope({ ...firstInput,
      principal: { ...principal, athleteId: "athlete-other", authorizedAthleteIds: ["athlete-other"] } });
    expect(crossAthlete.status).toBe("invalid_athlete_mapping");

    const rollbackClient = await pool.connect();
    try {
      await rollbackClient.query("BEGIN");
      await expect(rollbackClient.query(
        `INSERT INTO outcome_source_snapshot_memberships
         (snapshot_revision_id, source_record_revision_id, athlete_id, membership_state, exclusion_reasons)
         VALUES ('missing-snapshot','missing-revision','athlete-pg','included',ARRAY[]::text[])`,
      )).rejects.toThrow();
      await rollbackClient.query("ROLLBACK");
    } finally { rollbackClient.release(); }
  }, 180_000);
});
