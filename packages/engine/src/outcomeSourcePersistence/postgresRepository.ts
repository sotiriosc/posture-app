import { createHash } from "node:crypto";
import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import {
  NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
  createOutcomeSourceRecordRevision,
  validatePersistedAdaptationApplicationAttempt,
  validateProductionAdaptationDecisionBundle,
  type NormalizedOutcomeSourceRecord,
  type OutcomeSourceDecisionUseAuthorization,
  type OutcomeSourceRecordRevision,
  type OutcomeSourceRecordRevisionLedger,
  type PersistedCompletedExposureLedgerRevision,
  type ProductionOutcomeSourceSnapshot,
} from "@praxis/training-engine-v2";
import type {
  AdaptationApplicationRequestPersistenceInput,
  OutcomeSourceAuditEvent,
  OutcomeSourcePersistencePort,
  OutcomeSourcePrincipalContext,
  OutcomeSourceSnapshotPersistenceInput,
  PersistNormalizedOutcomeSourceRevisionInput,
  PersistedOutcomeSourceIngestionResult,
} from "./contracts";
import { OutcomeSourcePersistenceError } from "./contracts";
import type { OutcomeSourceMigration } from "./migrations";
import { planOutcomeSourceMigrations } from "./migrationRunner";
import { NOOP_OUTCOME_SOURCE_OBSERVABILITY, type OutcomeSourceObservability } from "./observability";

export interface OutcomeSourcePostgresPool {
  readonly connect: () => Promise<PoolClient>;
  readonly query: <R extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) => Promise<QueryResult<R>>;
}

function deterministicId(prefix: string, value: unknown): string {
  const canonical = JSON.stringify(value, Object.keys((value ?? {}) as object).sort());
  return `${prefix}:${createHash("sha256").update(canonical).digest("hex").slice(0, 32)}`;
}

function assertScope(principal: OutcomeSourcePrincipalContext, athleteId: string): void {
  if (principal.authenticationState !== "authenticated" || principal.athleteId !== athleteId ||
      !principal.authorizedAthleteIds.includes(athleteId)) {
    throw new OutcomeSourcePersistenceError("athlete_scope_violation", { athleteId });
  }
}

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

export async function runInOutcomeSourceRepositoryTransaction<T>(pool: OutcomeSourcePostgresPool,
  work: (client: PoolClient) => Promise<T>,
  externalClient?: PoolClient): Promise<T> {
  if (externalClient) return work(externalClient);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    try {
      const value = await work(client);
      await client.query("COMMIT");
      return value;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    client.release();
  }
}

async function insertAudit(client: PoolClient, event: OutcomeSourceAuditEvent): Promise<void> {
  await client.query(
    `INSERT INTO outcome_source_audit_events (
       audit_event_id, athlete_id, principal_id, operation, entity_type, entity_id,
       entity_revision_id, before_reference, after_reference, reason_code, operation_time,
       result_state, provenance
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
    [event.auditEventId, event.athleteId, event.principalId, event.operation, event.entityType,
      event.entityId, event.entityRevisionId, event.beforeReference, event.afterReference,
      event.reasonCode, event.operationTime, event.result, json(event.provenance)],
  );
}

function authorizationRevisionId(authorization: OutcomeSourceDecisionUseAuthorization): string {
  return `${authorization.authorizationId}@${authorization.authorizationVersion}`;
}

async function insertAuthorization(
  client: PoolClient,
  authorization: OutcomeSourceDecisionUseAuthorization,
  revisionId: string,
  basedOnRevisionId: string | null,
): Promise<void> {
  const result = await client.query<{ authorization_revision_id: string }>(
    `INSERT INTO outcome_source_authorization_revisions (
       authorization_revision_id, authorization_id, authorization_version,
       based_on_authorization_revision_id, athlete_id, source_categories, permitted_purposes,
       authorization_state, effective_time, expiration_time, revocation_reference, owner_id, provenance
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)
     ON CONFLICT (authorization_revision_id) DO NOTHING
     RETURNING authorization_revision_id`,
    [revisionId, authorization.authorizationId, authorization.authorizationVersion, basedOnRevisionId,
      authorization.athleteId, authorization.sourceCategories, authorization.permittedPurposes,
      authorization.state, authorization.effectiveTime, authorization.expirationTime,
      authorization.revocationReference, authorization.owner, json(authorization.provenance)],
  );
  if (result.rowCount === 0) {
    const prior = await client.query<{ authorization_id: string; authorization_version: string;
      based_on_authorization_revision_id: string | null; athlete_id: string; source_categories: string[];
      permitted_purposes: string[]; authorization_state: string; effective_time: Date | string;
      expiration_time: Date | string | null; revocation_reference: string | null; owner_id: string;
      provenance: string[] }>(
      `SELECT authorization_id, authorization_version, based_on_authorization_revision_id, athlete_id,
         source_categories, permitted_purposes, authorization_state, effective_time, expiration_time,
         revocation_reference, owner_id, provenance
       FROM outcome_source_authorization_revisions
       WHERE authorization_revision_id = $1`, [revisionId]);
    const row = prior.rows[0];
    const same = row?.authorization_id === authorization.authorizationId &&
      row.authorization_version === authorization.authorizationVersion &&
      row.based_on_authorization_revision_id === basedOnRevisionId && row.athlete_id === authorization.athleteId &&
      json([...row.source_categories].sort()) === json([...authorization.sourceCategories].sort()) &&
      json([...row.permitted_purposes].sort()) === json([...authorization.permittedPurposes].sort()) &&
      row.authorization_state === authorization.state && iso(row.effective_time) === authorization.effectiveTime &&
      (row.expiration_time === null ? null : iso(row.expiration_time)) === authorization.expirationTime &&
      row.revocation_reference === authorization.revocationReference && row.owner_id === authorization.owner &&
      json(row.provenance) === json(authorization.provenance);
    if (!same) {
      throw new OutcomeSourcePersistenceError("revision_lineage_invalid", { entity: "authorization" });
    }
  }
}

async function reserveIdempotency(
  client: PoolClient,
  input: PersistNormalizedOutcomeSourceRevisionInput,
): Promise<PersistedOutcomeSourceIngestionResult | null> {
  const record = input.normalizedRecord;
  const sourceNativeIdentity = `${input.envelope.sourceSystem}:${input.envelope.sourceNativeRecordId}:${
    input.envelope.sourceNativeRevisionId ?? "root"}`;
  const normalizedSemanticIdentity = `${record.sourceRecordId}:${record.sourceRecordRevisionId}`;
  const inserted = await client.query(
    `INSERT INTO outcome_source_idempotency (
       athlete_id, source_system, idempotency_key, payload_checksum, source_native_identity,
       normalized_semantic_identity, envelope_id, source_record_id, source_record_revision_id,
       ingestion_result, ingestion_time
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
     ON CONFLICT (athlete_id, source_system, idempotency_key) DO NOTHING
     RETURNING idempotency_key`,
    [input.envelope.athleteId, input.envelope.sourceSystem, input.envelope.idempotencyKey,
      input.envelope.payloadChecksum, sourceNativeIdentity, normalizedSemanticIdentity,
      input.envelope.envelopeId, record.sourceRecordId, record.sourceRecordRevisionId,
      json(input.result), input.envelope.ingestionTime],
  );
  if (inserted.rowCount) return null;
  const prior = await client.query<{
    payload_checksum: string;
    source_native_identity: string;
    normalized_semantic_identity: string;
    ingestion_result: PersistedOutcomeSourceIngestionResult;
  }>(
    `SELECT payload_checksum, source_native_identity, normalized_semantic_identity, ingestion_result
     FROM outcome_source_idempotency
     WHERE athlete_id = $1 AND source_system = $2 AND idempotency_key = $3`,
    [input.envelope.athleteId, input.envelope.sourceSystem, input.envelope.idempotencyKey],
  );
  const row = prior.rows[0];
  if (!row || row.payload_checksum !== input.envelope.payloadChecksum ||
      row.source_native_identity !== sourceNativeIdentity || row.normalized_semantic_identity !== normalizedSemanticIdentity) {
    throw new OutcomeSourcePersistenceError("idempotency_payload_conflict", {
      idempotencyKey: input.envelope.idempotencyKey,
    });
  }
  return Object.freeze({ ...row.ingestion_result, status: "exact_retry_returned_prior_result",
    downstreamEvaluationCount: 0, directiveApplicationCount: 0 });
}

async function insertRawEnvelope(client: PoolClient, input: PersistNormalizedOutcomeSourceRevisionInput): Promise<void> {
  const envelope = input.envelope;
  const lineage = envelope.lineage;
  await client.query(
    `INSERT INTO outcome_source_raw_envelopes (
       envelope_id, athlete_id, authenticated_principal_id, source_category, source_system,
       source_native_record_id, source_native_revision_id, source_exposure_event_id, session_id,
       opportunity_id, reservation_id, prescription_id, prescription_revision_id, sequence_plan_id,
       sequence_revision_id, planned_block_id, performed_block_id, event_time, event_timezone, ingestion_time, payload_schema_id,
       payload_schema_version, adapter_id, adapter_version, payload_checksum, idempotency_key,
       authorization_reference, correction_reference, structured_payload, opaque_payload_reference, provenance
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29::jsonb,$30,$31::jsonb)`,
    [envelope.envelopeId, envelope.athleteId, envelope.authenticatedPrincipalId, envelope.sourceCategory,
      envelope.sourceSystem, envelope.sourceNativeRecordId, envelope.sourceNativeRevisionId,
      lineage.sourceExposureEventId, lineage.sessionId, lineage.opportunityId, lineage.reservationId,
      lineage.prescriptionId, lineage.prescriptionRevisionId, lineage.sequencePlanId, lineage.sequenceRevisionId,
      lineage.plannedBlockId, lineage.performedBlockId,
      envelope.eventTime, envelope.eventTimezone, envelope.ingestionTime, envelope.payloadSchemaId,
      envelope.payloadSchemaVersion, envelope.adapterId, envelope.adapterVersion, envelope.payloadChecksum,
      envelope.idempotencyKey, envelope.decisionUseAuthorizationReference,
      envelope.correctionOrSupersessionReference, envelope.structuredPayload === null ? null : json(envelope.structuredPayload),
      envelope.opaquePayloadReference, json(envelope.provenance)],
  );
}

async function insertRecordAndRevision(client: PoolClient, input: PersistNormalizedOutcomeSourceRevisionInput): Promise<void> {
  const record = input.normalizedRecord;
  await client.query(
    `INSERT INTO outcome_source_records (
       source_record_id, athlete_id, source_category, source_system, source_native_record_id,
       first_envelope_id, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (source_record_id) DO NOTHING`,
    [record.sourceRecordId, record.athleteId, record.sourceCategory, input.envelope.sourceSystem,
      input.envelope.sourceNativeRecordId, input.envelope.envelopeId, input.envelope.ingestionTime],
  );
  const owner = await client.query<{ athlete_id: string; source_category: string; source_system: string;
    source_native_record_id: string }>(
    `SELECT athlete_id, source_category, source_system, source_native_record_id
     FROM outcome_source_records WHERE source_record_id = $1`,
    [record.sourceRecordId],
  );
  if (owner.rows[0]?.athlete_id !== record.athleteId || owner.rows[0]?.source_category !== record.sourceCategory ||
      owner.rows[0]?.source_system !== input.envelope.sourceSystem ||
      owner.rows[0]?.source_native_record_id !== input.envelope.sourceNativeRecordId) {
    throw new OutcomeSourcePersistenceError("revision_lineage_invalid", { entity: "source_record" });
  }
  const lineage = record.lineage;
  const immutable = createOutcomeSourceRecordRevision(record).immutableContentFingerprint;
  await client.query(
    `INSERT INTO outcome_source_record_revisions (
       source_record_revision_id, source_record_id, envelope_id, based_on_revision_id, athlete_id,
       source_category, source_owner, source_authority, source_exposure_event_id, session_id,
       opportunity_id, reservation_id, prescription_id, prescription_revision_id, sequence_plan_id,
       sequence_revision_id, planned_block_id, performed_block_id, target_ids, structured_facts, explicit_unknowns, event_time, ingestion_time,
       applies_through_time, review_state, revision_state, authorization_state,
       authorization_revision_id, correction_reason, changed_structured_paths, correction_owner,
       correction_time, final_for_source_record, immutable_content_fingerprint, provenance
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35::jsonb)`,
    [record.sourceRecordRevisionId, record.sourceRecordId, input.envelope.envelopeId,
      record.basedOnRevisionId, record.athleteId, record.sourceCategory, record.sourceOwner,
      record.sourceAuthority, lineage.sourceExposureEventId, lineage.sessionId, lineage.opportunityId,
      lineage.reservationId, lineage.prescriptionId, lineage.prescriptionRevisionId, lineage.sequencePlanId,
      lineage.sequenceRevisionId, lineage.plannedBlockId, lineage.performedBlockId,
      record.targetIds, json(record.structuredFacts), record.explicitUnknowns,
      record.eventTime, record.ingestionTime, record.appliesThroughTime, record.reviewState,
      record.revisionState, record.authorizationState, input.authorizationRevisionId,
      record.correctionReason, record.changedStructuredPaths, record.correctionOwner, record.correctionTime,
      record.finalForSourceRecord, immutable, json(record.provenance)],
  );
}

async function insertCategoryProjection(client: PoolClient, input: PersistNormalizedOutcomeSourceRevisionInput): Promise<void> {
  const record = input.normalizedRecord;
  const payload = input.envelope.structuredPayload ?? {};
  if (record.sourceCategory === "exercise_performance" || record.sourceCategory === "block_performance") {
    const blocks = Array.isArray(payload.blocks) ? payload.blocks as readonly Record<string, unknown>[] : [];
    for (const block of blocks) {
      const performedBlockId = String(block.performedBlockId);
      await client.query(
        `INSERT INTO outcome_source_performance_blocks (
           performance_block_result_id, source_record_revision_id, athlete_id, source_exposure_event_id,
           planned_block_id, performed_block_id, completion_state, actual_facts, event_time, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10::jsonb)`,
        [`${record.sourceRecordRevisionId}:block:${performedBlockId}`, record.sourceRecordRevisionId,
          record.athleteId, record.lineage.sourceExposureEventId, block.plannedBlockId ?? null,
          performedBlockId, block.completionState, json(block), record.eventTime, json(record.provenance)],
      );
    }
  } else if (record.sourceCategory === "training_response" || record.sourceCategory === "pain_or_discomfort_report") {
    await client.query(
      `INSERT INTO outcome_source_response_observations (
         response_observation_id, source_record_revision_id, athlete_id, source_exposure_event_id,
         tolerance, region, side, symptom_change, onset_state, persistence_state, consequence,
         realization_context, event_time, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14::jsonb)`,
      [payload.responseObservationId, record.sourceRecordRevisionId, record.athleteId,
        record.lineage.sourceExposureEventId, payload.tolerance, payload.region, payload.side,
        payload.symptomChange, payload.onset, payload.persistence, payload.consequence,
        json({ supportKey: payload.supportKey ?? null, rangeKey: payload.rangeKey ?? null,
          loadContextKey: payload.loadContextKey ?? null }), record.eventTime, json(record.provenance)],
    );
  } else if (record.sourceCategory === "session_completion" || record.sourceCategory === "adherence") {
    await client.query(
      `INSERT INTO outcome_source_adherence_observations (
         adherence_observation_id, source_record_revision_id, athlete_id, source_exposure_event_id,
         session_id, adherence_state, event_time, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
      [`${record.sourceRecordRevisionId}:adherence`, record.sourceRecordRevisionId, record.athleteId,
        record.lineage.sourceExposureEventId, record.lineage.sessionId, payload.state,
        record.eventTime, json(record.provenance)],
    );
  } else if (record.sourceCategory === "recovery_readiness") {
    await client.query(
      `INSERT INTO outcome_source_recovery_observations (
         recovery_observation_id, source_record_revision_id, athlete_id, target_ids, readiness_state,
         scope_state, applies_through_time, event_time, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      [`${record.sourceRecordRevisionId}:recovery`, record.sourceRecordRevisionId, record.athleteId,
        record.targetIds, payload.readiness, payload.scope, payload.appliesThroughTime,
        record.eventTime, json(record.provenance)],
    );
  } else if (record.sourceCategory === "training_safety" || record.sourceCategory === "clinician_restriction") {
    await client.query(
      `INSERT INTO outcome_source_safety_restrictions (
         safety_restriction_id, source_record_revision_id, athlete_id, authority, restriction_type,
         restriction_value, permitted, effective_time, applies_through_time, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
      [`${record.sourceRecordRevisionId}:safety`, record.sourceRecordRevisionId, record.athleteId,
        record.sourceAuthority, payload.restrictionType, payload.restrictionValue, payload.permitted,
        record.eventTime, payload.effectiveThroughTime ?? null, json(record.provenance)],
    );
  } else if (record.sourceCategory === "equipment_snapshot" || record.sourceCategory === "environment_constraint") {
    await client.query(
      `INSERT INTO outcome_source_equipment_environment_snapshots (
         equipment_environment_snapshot_id, source_record_revision_id, athlete_id, source_category,
         capabilities, location_id, effective_time, applies_through_time, provenance
       ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9::jsonb)`,
      [`${record.sourceRecordRevisionId}:equipment-environment`, record.sourceRecordRevisionId,
        record.athleteId, record.sourceCategory, json(payload.capabilities), payload.locationId ?? null,
        record.eventTime, payload.effectiveThroughTime, json(record.provenance)],
    );
  } else if (record.sourceCategory === "external_training_load") {
    await client.query(
      `INSERT INTO outcome_source_external_load_observations (
         external_load_observation_id, source_record_revision_id, athlete_id, activity_type,
         duration_minutes, intensity_descriptor, explicit_regions, receiver_state, event_time, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
      [`${record.sourceRecordRevisionId}:external-load`, record.sourceRecordRevisionId, record.athleteId,
        payload.activityType, payload.durationMinutes, payload.intensityDescriptor,
        payload.explicitRegions, "EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED", record.eventTime,
        json(record.provenance)],
    );
  }
}

async function changeActivePointer(client: PoolClient, input: PersistNormalizedOutcomeSourceRevisionInput): Promise<void> {
  const record = input.normalizedRecord;
  const nextActive = record.revisionState === "active" && record.finalForSourceRecord ?
    record.sourceRecordRevisionId : null;
  const result = await client.query(
    `INSERT INTO outcome_source_active_revisions (
       source_record_id, athlete_id, active_revision_id, authorization_revision_id, changed_at,
       changed_by_principal_id, change_reason
     ) VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (source_record_id) DO UPDATE SET
       active_revision_id = EXCLUDED.active_revision_id,
       authorization_revision_id = EXCLUDED.authorization_revision_id,
       pointer_version = outcome_source_active_revisions.pointer_version + 1,
       changed_at = EXCLUDED.changed_at,
       changed_by_principal_id = EXCLUDED.changed_by_principal_id,
       change_reason = EXCLUDED.change_reason
     WHERE outcome_source_active_revisions.athlete_id = EXCLUDED.athlete_id
       AND outcome_source_active_revisions.active_revision_id IS NOT DISTINCT FROM $8
     RETURNING source_record_id`,
    [record.sourceRecordId, record.athleteId, nextActive, input.authorizationRevisionId,
      input.operationTime, input.principal.principalId, record.correctionReason ?? "ingestion",
      record.basedOnRevisionId],
  );
  if (result.rowCount !== 1) throw new OutcomeSourcePersistenceError("active_revision_conflict", {
    sourceRecordId: record.sourceRecordId,
  });
}

function recordFromRow(row: Record<string, unknown>): NormalizedOutcomeSourceRecord {
  return Object.freeze({ contractReference: NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
    sourceRecordId: String(row.source_record_id), sourceRecordRevisionId: String(row.source_record_revision_id),
    basedOnRevisionId: row.based_on_revision_id === null ? null : String(row.based_on_revision_id),
    sourceCategory: row.source_category as NormalizedOutcomeSourceRecord["sourceCategory"],
    sourceOwner: String(row.source_owner), sourceAuthority: row.source_authority as NormalizedOutcomeSourceRecord["sourceAuthority"],
    athleteId: String(row.athlete_id), targetIds: Object.freeze(row.target_ids as string[]),
    lineage: Object.freeze({ sourceExposureEventId: row.source_exposure_event_id as string | null,
      sessionId: row.session_id as string | null, opportunityId: row.opportunity_id as string | null,
      reservationId: row.reservation_id as string | null, prescriptionId: row.prescription_id as string | null,
      prescriptionRevisionId: row.prescription_revision_id as string | null,
      sequencePlanId: row.sequence_plan_id as string | null, sequenceRevisionId: row.sequence_revision_id as string | null,
      plannedBlockId: row.planned_block_id as string | null,
      performedBlockId: row.performed_block_id as string | null }),
    structuredFacts: Object.freeze(row.structured_facts as NormalizedOutcomeSourceRecord["structuredFacts"]),
    explicitUnknowns: Object.freeze(row.explicit_unknowns as string[]), eventTime: iso(row.event_time as Date | string),
    eventTimezone: String(row.event_timezone ?? "UTC"), ingestionTime: iso(row.ingestion_time as Date | string),
    appliesThroughTime: row.applies_through_time ? iso(row.applies_through_time as Date | string) : null,
    reviewState: row.review_state as NormalizedOutcomeSourceRecord["reviewState"],
    revisionState: row.revision_state as NormalizedOutcomeSourceRecord["revisionState"],
    authorizationState: row.authorization_state as NormalizedOutcomeSourceRecord["authorizationState"],
    correctionReason: row.correction_reason as string | null,
    changedStructuredPaths: Object.freeze(row.changed_structured_paths as string[]),
    correctionOwner: row.correction_owner as string | null,
    correctionTime: row.correction_time ? iso(row.correction_time as Date | string) : null,
    finalForSourceRecord: Boolean(row.final_for_source_record),
    provenance: Object.freeze(row.provenance as string[]) });
}

const REVISION_SELECT = `SELECT r.*, e.event_timezone
  FROM outcome_source_record_revisions r
  JOIN outcome_source_raw_envelopes e ON e.envelope_id = r.envelope_id`;

export function createOutcomeSourcePostgresRepository(input: {
  readonly pool: OutcomeSourcePostgresPool | Pool;
  readonly observability?: OutcomeSourceObservability;
  readonly transactionClient?: PoolClient;
}): OutcomeSourcePersistencePort {
  const pool = input.pool as OutcomeSourcePostgresPool;
  const observability = input.observability ?? NOOP_OUTCOME_SOURCE_OBSERVABILITY;

  const persistNormalizedRevision = async (
    persistenceInput: PersistNormalizedOutcomeSourceRevisionInput,
  ): Promise<PersistedOutcomeSourceIngestionResult> => {
    assertScope(persistenceInput.principal, persistenceInput.envelope.athleteId);
    if (persistenceInput.principal.principalId !== persistenceInput.envelope.authenticatedPrincipalId) {
      throw new OutcomeSourcePersistenceError("authorization_required", { principalMismatch: true });
    }
    return runInOutcomeSourceRepositoryTransaction(pool, async (client) => {
      const prior = await reserveIdempotency(client, persistenceInput);
      if (prior) {
        await observability.emit({ name: "ingestion_retried", operationTime: persistenceInput.operationTime,
          athleteId: persistenceInput.envelope.athleteId, entityId: persistenceInput.envelope.envelopeId,
          status: prior.status });
        return prior;
      }
      await insertRawEnvelope(client, persistenceInput);
      await insertAuthorization(client, persistenceInput.authorization, persistenceInput.authorizationRevisionId,
        persistenceInput.basedOnAuthorizationRevisionId);
      await insertRecordAndRevision(client, persistenceInput);
      await insertCategoryProjection(client, persistenceInput);
      await changeActivePointer(client, persistenceInput);
      await insertAudit(client, { auditEventId: deterministicId("outcome-source-audit", {
        operation: "ingestion", revisionId: persistenceInput.normalizedRecord.sourceRecordRevisionId,
      }), athleteId: persistenceInput.envelope.athleteId, principalId: persistenceInput.principal.principalId,
      operation: "source_revision_appended", entityType: "source_record_revision",
      entityId: persistenceInput.normalizedRecord.sourceRecordId,
      entityRevisionId: persistenceInput.normalizedRecord.sourceRecordRevisionId,
      beforeReference: persistenceInput.normalizedRecord.basedOnRevisionId,
      afterReference: persistenceInput.normalizedRecord.sourceRecordRevisionId,
      reasonCode: persistenceInput.normalizedRecord.correctionReason ?? "ingestion",
      operationTime: persistenceInput.operationTime, result: "succeeded",
      provenance: Object.freeze(["postgres-repository:ingestion-transaction"]) });
      await observability.emit({ name: "ingestion_accepted", operationTime: persistenceInput.operationTime,
        athleteId: persistenceInput.envelope.athleteId,
        entityId: persistenceInput.normalizedRecord.sourceRecordRevisionId, status: persistenceInput.result.status });
      return persistenceInput.result;
    }, input.transactionClient);
  };

  return Object.freeze({
    planMigrations: async (migrations: readonly OutcomeSourceMigration[], operationTime: string) => {
      const client = await pool.connect();
      try { return await planOutcomeSourceMigrations({ client, migrations, operationTime, observability }); }
      finally { client.release(); }
    },
    persistNormalizedRevision,
    appendCorrection: persistNormalizedRevision,
    appendSupersession: persistNormalizedRevision,
    appendWithdrawal: persistNormalizedRevision,
    readActiveSourceRecords: async (athleteId: string, evaluationTime: string) => {
      const result = await pool.query<Record<string, unknown>>(
        `${REVISION_SELECT}
         JOIN outcome_source_active_revisions a ON a.active_revision_id = r.source_record_revision_id
         JOIN outcome_source_authorization_revisions auth
           ON auth.authorization_revision_id = a.authorization_revision_id
         WHERE r.athlete_id = $1 AND a.athlete_id = $1
           AND r.event_time <= $2 AND (r.applies_through_time IS NULL OR r.applies_through_time >= $2)
           AND r.revision_state = 'active' AND r.final_for_source_record
           AND r.authorization_state = 'authorized' AND auth.authorization_state = 'authorized'
         ORDER BY r.event_time, r.source_record_revision_id`,
        [athleteId, evaluationTime],
      );
      return Object.freeze(result.rows.map(recordFromRow));
    },
    readRevisionLedgers: async (athleteId: string) => {
      const result = await pool.query<Record<string, unknown>>(
        `${REVISION_SELECT} WHERE r.athlete_id = $1 ORDER BY r.source_record_id, r.event_time, r.source_record_revision_id`,
        [athleteId],
      );
      const active = await pool.query<{ source_record_id: string; active_revision_id: string | null }>(
        "SELECT source_record_id, active_revision_id FROM outcome_source_active_revisions WHERE athlete_id = $1",
        [athleteId],
      );
      const activeByRecord = new Map(active.rows.map((row) => [row.source_record_id, row.active_revision_id]));
      const grouped = new Map<string, OutcomeSourceRecordRevision[]>();
      result.rows.forEach((row) => {
        const record = recordFromRow(row);
        const rows = grouped.get(record.sourceRecordId) ?? [];
        rows.push(Object.freeze({ sourceRecordId: record.sourceRecordId, revision: record,
          immutableContentFingerprint: String(row.immutable_content_fingerprint) }));
        grouped.set(record.sourceRecordId, rows);
      });
      return Object.freeze([...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))
        .map(([sourceRecordId, revisions]): OutcomeSourceRecordRevisionLedger => Object.freeze({ sourceRecordId,
          revisions: Object.freeze(revisions), activeFinalRevisionId: activeByRecord.get(sourceRecordId) ?? null,
          provenance: Object.freeze(["postgres-repository:immutable-revision-ledger"]) })));
    },
    persistSourceSnapshot: async (snapshotInput: OutcomeSourceSnapshotPersistenceInput) => {
      assertScope(snapshotInput.principal, snapshotInput.snapshot.athleteId);
      await runInOutcomeSourceRepositoryTransaction(pool, async (client) => {
        const snapshot = snapshotInput.snapshot;
        await client.query(
          `INSERT INTO outcome_source_snapshots (
             snapshot_revision_id, snapshot_id, athlete_id, evaluation_time, fingerprint, conflicts,
             unresolved_source_categories, authorization_states, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
          [snapshot.snapshotRevisionId, snapshot.snapshotId, snapshot.athleteId, snapshot.evaluationTime,
            snapshot.fingerprint, snapshot.conflicts, snapshot.unresolvedSourceCategories,
            snapshot.authorizationStates, json(snapshot.provenance)],
        );
        for (const revisionId of snapshot.activeSourceRevisionIds) {
          await client.query(
            `INSERT INTO outcome_source_snapshot_memberships (
               snapshot_revision_id, source_record_revision_id, athlete_id, membership_state, exclusion_reasons
             ) SELECT $1, source_record_revision_id, $2, 'included', ARRAY[]::TEXT[]
               FROM outcome_source_record_revisions
               WHERE source_record_revision_id = $3 AND athlete_id = $2`,
            [snapshot.snapshotRevisionId, snapshot.athleteId, revisionId],
          );
        }
        for (const excluded of snapshot.excludedRevisions) {
          await client.query(
            `INSERT INTO outcome_source_snapshot_memberships (
               snapshot_revision_id, source_record_revision_id, athlete_id, membership_state, exclusion_reasons
             ) SELECT $1, source_record_revision_id, $2, 'excluded', $4
               FROM outcome_source_record_revisions
               WHERE source_record_revision_id = $3 AND athlete_id = $2`,
            [snapshot.snapshotRevisionId, snapshot.athleteId, excluded.sourceRecordRevisionId, excluded.reasons],
          );
        }
        const membership = await client.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM outcome_source_snapshot_memberships WHERE snapshot_revision_id = $1",
          [snapshot.snapshotRevisionId],
        );
        if (Number(membership.rows[0]?.count ?? 0) !== snapshot.activeSourceRevisionIds.length +
            snapshot.excludedRevisions.length) throw new OutcomeSourcePersistenceError("snapshot_membership_invalid");
        await insertAudit(client, { auditEventId: deterministicId("outcome-source-audit", {
          operation: "snapshot", revisionId: snapshot.snapshotRevisionId }), athleteId: snapshot.athleteId,
        principalId: snapshotInput.principal.principalId, operation: "source_snapshot_persisted",
        entityType: "source_snapshot", entityId: snapshot.snapshotId,
        entityRevisionId: snapshot.snapshotRevisionId, beforeReference: null,
        afterReference: snapshot.snapshotRevisionId, reasonCode: "explicit_snapshot_persistence",
        operationTime: snapshotInput.operationTime, result: "succeeded",
        provenance: Object.freeze(["postgres-repository:snapshot-transaction"]) });
      }, input.transactionClient);
      await observability.emit({ name: "snapshot_persisted", operationTime: snapshotInput.operationTime,
        athleteId: snapshotInput.snapshot.athleteId, entityId: snapshotInput.snapshot.snapshotRevisionId,
        status: "persisted" });
    },
    readSourceSnapshot: async (athleteId: string, snapshotRevisionId: string) => {
      const header = await pool.query<Record<string, unknown>>(
        "SELECT * FROM outcome_source_snapshots WHERE athlete_id = $1 AND snapshot_revision_id = $2",
        [athleteId, snapshotRevisionId],
      );
      if (!header.rows[0]) return null;
      const memberships = await pool.query<{ source_record_revision_id: string; membership_state: string;
        exclusion_reasons: string[] }>(
        `SELECT source_record_revision_id, membership_state, exclusion_reasons
         FROM outcome_source_snapshot_memberships
         WHERE athlete_id = $1 AND snapshot_revision_id = $2 ORDER BY source_record_revision_id`,
        [athleteId, snapshotRevisionId],
      );
      const includedIds = memberships.rows.filter((row) => row.membership_state === "included")
        .map((row) => row.source_record_revision_id);
      const records = includedIds.length ? await pool.query<Record<string, unknown>>(
        `${REVISION_SELECT} WHERE r.athlete_id = $1 AND r.source_record_revision_id = ANY($2::text[])
         ORDER BY r.event_time, r.source_record_revision_id`, [athleteId, includedIds]) : { rows: [] };
      const row = header.rows[0];
      const activeRecords = Object.freeze(records.rows.map(recordFromRow));
      return Object.freeze({ contractReference: PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
        snapshotId: String(row.snapshot_id), snapshotRevisionId: String(row.snapshot_revision_id), athleteId,
        evaluationTime: iso(row.evaluation_time as Date | string), activeSourceRecords: activeRecords,
        activeSourceRevisionIds: Object.freeze(includedIds), excludedRevisions: Object.freeze(memberships.rows
          .filter((entry) => entry.membership_state === "excluded").map((entry) => Object.freeze({
            sourceRecordRevisionId: entry.source_record_revision_id,
            reasons: Object.freeze(entry.exclusion_reasons) }))),
        conflicts: Object.freeze(row.conflicts as string[]),
        unresolvedSourceCategories: Object.freeze(row.unresolved_source_categories as ProductionOutcomeSourceSnapshot["unresolvedSourceCategories"]),
        authorizationStates: Object.freeze(row.authorization_states as ProductionOutcomeSourceSnapshot["authorizationStates"]),
        sourceLineage: Object.freeze(activeRecords.map((record) => record.sourceRecordId).sort()),
        fingerprint: String(row.fingerprint), auditTrace: Object.freeze(["postgres-repository:snapshot-read"]),
        provenance: Object.freeze(row.provenance as string[]) });
    },
    persistLongitudinalDecisionBundle: async (bundleInput: Parameters<
      OutcomeSourcePersistencePort["persistLongitudinalDecisionBundle"]
    >[0]) => {
      const { principal, bundle, operationTime } = bundleInput;
      assertScope(principal, bundle.decision.athleteId);
      const reasons = validateProductionAdaptationDecisionBundle(bundle);
      if (reasons.length) throw new OutcomeSourcePersistenceError("revision_lineage_invalid", { reasons: reasons.join(",") });
      await runInOutcomeSourceRepositoryTransaction(pool, async (client) => {
        const ledger = bundle.completedLedger;
        await client.query(
          `INSERT INTO adaptation_completed_exposure_ledgers (
             ledger_revision_id, ledger_id, based_on_ledger_revision_id, athlete_id,
             source_snapshot_revision_id, evaluated_at, payload, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)`,
          [ledger.ledgerRevisionId, ledger.ledgerId, ledger.basedOnLedgerRevisionId, ledger.athleteId,
            ledger.sourceSnapshotRevisionId, ledger.evaluatedAt, json(ledger.payload), json(ledger.provenance)],
        );
        await insertLedgerEntries(client, ledger);
        const state = bundle.state;
        await client.query(
          `INSERT INTO adaptation_longitudinal_state_revisions (
             state_revision_id, state_id, based_on_state_revision_id, decision_attempt_id, athlete_id,
             target_id, source_snapshot_revision_id, program_snapshot_revision_id, phase_result_revision_id,
             evidence_window_id, policy_id, policy_version, state_value, final_for_decision_attempt,
             evaluated_at, payload, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb)`,
          [state.stateRevisionId, state.stateId, state.basedOnStateRevisionId, state.decisionAttemptId,
            state.athleteId, state.targetId, state.sourceSnapshotRevisionId, state.programSnapshotRevisionId,
            state.phaseResultRevisionId, state.evidenceWindowId, state.policyId, state.policyVersion,
            state.state, state.finalForDecisionAttempt, state.evaluatedAt, json(state), json(state.provenance)],
        );
        const decision = bundle.decision;
        await client.query(
          `INSERT INTO adaptation_longitudinal_decision_revisions (
             decision_revision_id, decision_id, based_on_decision_revision_id, decision_attempt_id,
             state_revision_id, athlete_id, target_id, source_snapshot_revision_id,
             program_snapshot_revision_id, phase_result_revision_id, evidence_window_id, policy_id,
             policy_version, action_value, application_owner, authorization_state, application_state,
             final_for_decision_attempt, evaluated_at, payload, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21::jsonb)`,
          [decision.decisionRevisionId, decision.decisionId, decision.basedOnDecisionRevisionId,
            decision.decisionAttemptId, decision.stateRevisionId, decision.athleteId, decision.targetId,
            decision.sourceSnapshotRevisionId, decision.programSnapshotRevisionId,
            decision.phaseResultRevisionId, decision.evidenceWindowId, decision.policyId,
            decision.policyVersion, decision.action, decision.applicationOwner, decision.authorizationState,
            decision.applicationState, decision.finalForDecisionAttempt, decision.evaluatedAt,
            json(decision), json(decision.provenance)],
        );
        if (bundle.directive) {
          const directive = bundle.directive;
          await client.query(
            `INSERT INTO adaptation_action_directives (
               directive_revision_id, directive_id, based_on_directive_revision_id, decision_id,
               decision_revision_id, athlete_id, target_id, target_scope, source_snapshot_revision_id,
               program_snapshot_revision_id, action_value, requested_dimensions, application_owner,
               application_state, created_at, payload, provenance
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb)`,
            [directive.directiveRevisionId, directive.directiveId, directive.basedOnDirectiveRevisionId,
              directive.decisionId, directive.decisionRevisionId, directive.athleteId, directive.targetId,
              directive.targetScope, directive.sourceSnapshotRevisionId, directive.programSnapshotRevisionId,
              directive.action, directive.requestedDimensions, directive.applicationOwner,
              directive.applicationState, directive.createdAt, json(directive), json(directive.provenance)],
          );
        }
        await insertAudit(client, { auditEventId: deterministicId("outcome-source-audit", {
          operation: "decision", revisionId: decision.decisionRevisionId }), athleteId: decision.athleteId,
        principalId: principal.principalId, operation: "longitudinal_decision_bundle_persisted",
        entityType: "longitudinal_decision", entityId: decision.decisionId,
        entityRevisionId: decision.decisionRevisionId, beforeReference: decision.basedOnDecisionRevisionId,
        afterReference: decision.decisionRevisionId, reasonCode: "explicit_decision_persistence",
        operationTime, result: "succeeded",
        provenance: Object.freeze(["postgres-repository:decision-persistence-transaction"]) });
      }, input.transactionClient);
      await observability.emit({ name: "decision_persisted", operationTime,
        athleteId: bundle.decision.athleteId, entityId: bundle.decision.decisionRevisionId, status: "persisted" });
    },
    persistApplicationRequest: async (requestInput: AdaptationApplicationRequestPersistenceInput) => {
      assertScope(requestInput.principal, requestInput.request.athleteId);
      await runInOutcomeSourceRepositoryTransaction(pool, async (client) => {
        const request = requestInput.request;
        await client.query(
          `INSERT INTO adaptation_application_requests (
             request_revision_id, request_id, athlete_id, directive_id, directive_revision_id,
             target_id, application_owner, idempotency_key, expected_current_revisions,
             confirmation_state, created_at, payload, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13::jsonb)`,
          [requestInput.requestRevisionId, request.requestId, request.athleteId, request.directiveId,
            request.directiveRevisionId, request.targetId, request.applicationOwner, request.idempotencyKey,
            json(request.expectedCurrentEntityRevisions), requestInput.confirmationState,
            request.createdAt, json(request), json(request.provenance)],
        );
        await insertAudit(client, { auditEventId: deterministicId("outcome-source-audit", {
          operation: "application-request", revisionId: requestInput.requestRevisionId }), athleteId: request.athleteId,
        principalId: requestInput.principal.principalId, operation: "application_request_persisted",
        entityType: "application_request", entityId: request.requestId,
        entityRevisionId: requestInput.requestRevisionId, beforeReference: null,
        afterReference: requestInput.requestRevisionId, reasonCode: "explicit_nonapplying_handoff",
        operationTime: requestInput.operationTime, result: "proposed",
        provenance: Object.freeze(["postgres-repository:application-handoff-transaction"]) });
      }, input.transactionClient);
      await observability.emit({ name: "application_request_persisted", operationTime: requestInput.operationTime,
        athleteId: requestInput.request.athleteId, entityId: requestInput.requestRevisionId, status: "proposed" });
    },
    persistApplicationAttempt: async (attemptInput: Parameters<
      OutcomeSourcePersistencePort["persistApplicationAttempt"]
    >[0]) => {
      const { principal, requestRevisionId, attempt, operationTime } = attemptInput;
      assertScope(principal, attempt.athleteId);
      const reasons = validatePersistedAdaptationApplicationAttempt(attempt);
      if (reasons.length) throw new OutcomeSourcePersistenceError("application_applied_rejected", {
        reasons: reasons.join(","),
      });
      await runInOutcomeSourceRepositoryTransaction(pool, async (client) => {
        await client.query(
          `INSERT INTO adaptation_application_attempts (
             attempt_id, request_revision_id, athlete_id, principal_id, rightful_owner,
             precondition_result, confirmation_state, result_state, before_references,
             after_references, rollback_reference, attempted_at, provenance
           ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
          [attempt.attemptId, requestRevisionId, attempt.athleteId, attempt.principalId,
            attempt.rightfulOwner, json(attempt.preconditionResult), attempt.confirmationState,
            attempt.result, attempt.beforeReferences, attempt.afterReferences,
            attempt.rollbackReference, attempt.attemptedAt, json(attempt.provenance)],
        );
        await insertAudit(client, { auditEventId: deterministicId("outcome-source-audit", {
          operation: "application-attempt", attemptId: attempt.attemptId }), athleteId: attempt.athleteId,
        principalId: principal.principalId, operation: "application_attempt_persisted",
        entityType: "application_attempt", entityId: attempt.attemptId, entityRevisionId: null,
        beforeReference: attempt.directiveRevisionId, afterReference: null,
        reasonCode: attempt.result, operationTime, result: attempt.result,
        provenance: Object.freeze(["postgres-repository:nonapplying-attempt-transaction"]) });
      }, input.transactionClient);
    },
    appendAuditEvent: async (event: OutcomeSourceAuditEvent) => { await pool.query(
      `INSERT INTO outcome_source_audit_events (
         audit_event_id, athlete_id, principal_id, operation, entity_type, entity_id,
         entity_revision_id, before_reference, after_reference, reason_code, operation_time,
         result_state, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
      [event.auditEventId, event.athleteId, event.principalId, event.operation, event.entityType,
        event.entityId, event.entityRevisionId, event.beforeReference, event.afterReference,
        event.reasonCode, event.operationTime, event.result, json(event.provenance)]); },
  });
}

async function insertLedgerEntries(
  client: PoolClient,
  ledger: PersistedCompletedExposureLedgerRevision,
): Promise<void> {
  const payload = ledger.payload as { readonly entries?: readonly Record<string, unknown>[] };
  const entries = payload.entries ?? [];
  if (entries.length !== ledger.entryIds.length) {
    throw new OutcomeSourcePersistenceError("revision_lineage_invalid", { entity: "completed_ledger_entries" });
  }
  for (const entry of entries) {
    await client.query(
      `INSERT INTO adaptation_completed_exposure_entries (
         ledger_revision_id, outcome_entry_id, athlete_id, source_exposure_event_id,
         original_exercise_id, realized_exercise_id, prescription_id, prescription_revision_id,
         sequence_plan_id, sequence_revision_id, block_performance_references, response_references,
         recovery_references, entry_payload
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)`,
      [ledger.ledgerRevisionId, entry.outcomeEntryId, ledger.athleteId, entry.sourceExposureEventId,
        entry.originalExerciseId, entry.realizedExerciseId, entry.prescriptionId,
        entry.finalPrescriptionRevisionId, entry.sequencePlanId, entry.finalSequenceRevisionId,
        entry.blockPerformanceReferences ?? [], entry.responseObservationIds ?? [],
        entry.recoveryEvidenceIds ?? [], json(entry)],
    );
  }
}

export const OUTCOME_SOURCE_POSTGRES_REPOSITORY_IMPORT_SIDE_EFFECT_COUNT = 0 as const;
export const OUTCOME_SOURCE_POSTGRES_REPOSITORY_AUTOMATIC_MIGRATION_COUNT = 0 as const;
export const OUTCOME_SOURCE_POSTGRES_REPOSITORY_DIRECTIVE_APPLICATION_COUNT = 0 as const;

export function outcomeSourceAuthorizationRevisionId(
  authorization: OutcomeSourceDecisionUseAuthorization,
): string {
  return authorizationRevisionId(authorization);
}
