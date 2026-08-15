import { stableId } from "@praxis/training-engine-v2";
import type { PoolClient, QueryResult } from "pg";
import type { AdaptationApplicationOrchestrationPersistencePort,
  AdaptationApplicationOrchestrationTransaction, PersistedAdaptationApplicationOrchestrationRun } from "./contracts";

interface Queryable {
  readonly query: <T extends Record<string, unknown> = Record<string, unknown>>(
    text: string, values?: readonly unknown[],
  ) => Promise<QueryResult<T>>;
}

interface OrchestrationPostgresPool extends Queryable {
  readonly connect: () => Promise<PoolClient>;
}

function client(transaction: AdaptationApplicationOrchestrationTransaction): Queryable {
  if (!transaction || typeof transaction !== "object" || !("query" in transaction)) {
    throw new Error("ADAPTATION_APPLICATION_ORCHESTRATION_TRANSACTION_REQUIRED");
  }
  return transaction as Queryable;
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

function assertUnapplied(run: PersistedAdaptationApplicationOrchestrationRun): void {
  if (run.result.applicationApplied !== false || run.result.productMutationApplied !== false ||
      (run.result.ownerResult !== null && run.result.ownerResult.applicationApplied !== false) ||
      (run.result.shadowCandidate !== null && run.result.shadowCandidate.applicationApplied !== false)) {
    throw new Error("ADAPTATION_APPLICATION_ORCHESTRATION_APPLIED_STATE_REJECTED");
  }
}

async function readRun(queryable: Queryable, athleteId: string, where: string,
  value: string): Promise<PersistedAdaptationApplicationOrchestrationRun | null> {
  const result = await queryable.query<{
    request_semantic_fingerprint: string;
    request_payload: PersistedAdaptationApplicationOrchestrationRun["input"];
    orchestration_payload: PersistedAdaptationApplicationOrchestrationRun["result"];
  }>(`SELECT request_semantic_fingerprint, request_payload, orchestration_payload
      FROM adaptation_application_orchestration_runs
      WHERE athlete_id = $1 AND ${where} = $2`, [athleteId, value]);
  const row = result.rows[0];
  if (!row) return null;
  const input = row.request_payload;
  const orchestration = row.orchestration_payload;
  const auditResult = await queryable.query<{
    audit_event_id: string; athlete_id: string; principal_id: string; entity_id: string;
    entity_revision_id: string; reason_code: string; operation_time: Date | string; provenance: readonly string[];
  }>(`SELECT audit_event_id, athlete_id, principal_id, entity_id, entity_revision_id,
        reason_code, operation_time, provenance
      FROM outcome_source_audit_events
      WHERE entity_type = 'application_orchestration' AND entity_revision_id = $1`,
    [orchestration.orchestrationRevision.orchestrationRevisionId]);
  const audit = auditResult.rows[0];
  return Object.freeze({ requestSemanticFingerprint: row.request_semantic_fingerprint, input,
    result: orchestration, auditEvent: Object.freeze({ auditEventId: audit?.audit_event_id ?? "unavailable",
      athleteId: input.request.athleteId, principalOrServiceId: input.request.authenticatedPrincipalOrServiceId,
      requestId: input.request.requestId, requestRevisionId: input.request.requestRevisionId,
      directiveRevisionId: input.request.directiveRevisionId,
      decisionRevisionId: input.request.longitudinalDecisionRevisionId,
      currentRevisions: input.request.expectedCurrentRevisions, owner: input.request.requestedOwner,
      ownerPortReference: input.request.ownerPortReference, policyReferences: Object.freeze([]),
      preconditionState: orchestration.preconditions.state,
      ownerResultFingerprint: orchestration.ownerResult?.ownerResultFingerprint ?? null,
      shadowCandidateRevisionId: orchestration.shadowCandidate?.shadowCandidateRevisionId ?? null,
      validationFingerprint: orchestration.shadowCandidate?.downstreamValidation.validationFingerprint ?? null,
      finalUnappliedStatus: orchestration.status, operationTime: input.request.evaluationTime,
      applicationApplied: false, provenance: audit?.provenance ?? Object.freeze(["postgres-replay"]) }) });
}

export function createAdaptationApplicationOrchestrationPostgresRepository(input: {
  readonly pool: OrchestrationPostgresPool;
}): AdaptationApplicationOrchestrationPersistencePort {
  const pool = input.pool;
  const repository: AdaptationApplicationOrchestrationPersistencePort = {
    transaction: async <T>(work: (transaction: AdaptationApplicationOrchestrationTransaction) => Promise<T>) => {
      const connection = await pool.connect();
      try {
        await connection.query("BEGIN");
        try {
          const value = await work(connection);
          await connection.query("COMMIT");
          return value;
        } catch (error) {
          await connection.query("ROLLBACK");
          throw error;
        }
      } finally {
        connection.release();
      }
    },
    lockIdempotencyKey: async (athleteId, idempotencyKey, transaction) => {
      await client(transaction).query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        [athleteId, idempotencyKey]);
    },
    getOrchestrationByIdempotencyKey: async (athleteId, idempotencyKey, transaction) =>
      readRun(transaction ? client(transaction) : pool, athleteId, "idempotency_key", idempotencyKey),
    persistOrchestrationRequestRevision: async (run, transaction) => {
      assertUnapplied(run);
      const request = run.input.request;
      const result = run.result;
      await client(transaction).query(
        `INSERT INTO adaptation_application_orchestration_runs (
           orchestration_revision_id, orchestration_id, orchestration_attempt_id, request_id,
           request_revision_id, based_on_request_revision_id, athlete_id, principal_id, directive_id,
           directive_revision_id, decision_id, decision_revision_id, target_id, rightful_owner,
           owner_port_reference, policy_references, idempotency_key, request_semantic_fingerprint,
           orchestration_status, persistence_state, expected_current_revisions, request_payload,
           orchestration_payload, operation_time, application_applied, product_mutation_applied, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17,$18,
           $19,$20,$21::jsonb,$22::jsonb,$23::jsonb,$24,FALSE,FALSE,$25::jsonb)`,
        [result.orchestrationRevision.orchestrationRevisionId, result.orchestrationRevision.orchestrationId,
          request.orchestrationAttemptId, request.requestId, request.requestRevisionId,
          request.basedOnRequestRevisionId, request.athleteId, request.authenticatedPrincipalOrServiceId,
          request.directiveId, request.directiveRevisionId, request.longitudinalDecisionId,
          request.longitudinalDecisionRevisionId, request.targetId, request.requestedOwner,
          json(request.ownerPortReference), json(run.auditEvent.policyReferences), request.idempotencyKey,
          run.requestSemanticFingerprint, result.status, "persisted", json(request.expectedCurrentRevisions),
          json(run.input), json(result), request.evaluationTime,
          json(["postgres-orchestration-repository:explicit-shadow-transaction"])],
      );
    },
    persistPreconditionSnapshot: async (run, transaction) => {
      const result = run.result;
      await client(transaction).query(
        `INSERT INTO adaptation_application_precondition_snapshots (
           precondition_snapshot_id, orchestration_revision_id, athlete_id, precondition_state,
           failed_preconditions, reason_codes, snapshot_payload, operation_time, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb)`,
        [stableId("adaptation-application-precondition-snapshot", result.orchestrationRevision.orchestrationRevisionId),
          result.orchestrationRevision.orchestrationRevisionId, run.input.request.athleteId,
          result.preconditions.state, result.preconditions.failedPreconditions, result.preconditions.reasonCodes,
          json({ expected: run.input.request.expectedCurrentRevisions,
            actual: run.input.preconditionSnapshot.actualCurrentRevisions, result: result.preconditions }),
          run.input.request.evaluationTime, json(["postgres-orchestration-repository:preconditions"])],
      );
    },
    persistOwnerResult: async (run, transaction) => {
      const result = run.result.ownerResult;
      if (!result) return;
      const revisionId = run.result.orchestrationRevision.orchestrationRevisionId;
      await client(transaction).query(
        `INSERT INTO adaptation_application_owner_results (
           owner_result_record_id, owner_result_fingerprint, orchestration_revision_id, athlete_id, owner_id,
           owner_contract_reference, action_value, target_id, owner_status, result_payload,
           operation_time, application_applied, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10::jsonb,$11,FALSE,$12::jsonb)`,
        [stableId("adaptation-application-owner-result-record", revisionId), result.ownerResultFingerprint,
          revisionId, run.input.request.athleteId, result.owner, json(result.ownerContract), result.action,
          result.targetId, result.status, json(result), run.input.request.evaluationTime, json(result.provenance)],
      );
    },
    persistShadowCandidate: async (run, transaction) => {
      const candidate = run.result.shadowCandidate;
      if (!candidate || !run.result.ownerResult) return;
      const revisionId = run.result.orchestrationRevision.orchestrationRevisionId;
      await client(transaction).query(
        `INSERT INTO adaptation_application_shadow_candidates (
           shadow_candidate_revision_id, shadow_candidate_id, orchestration_revision_id,
           owner_result_record_id, athlete_id, proposed_program_revision_id,
           proposed_week_plan_revision_id, proposed_phase_result_revision_id, candidate_payload,
           operation_time, application_applied, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,FALSE,$11::jsonb)`,
        [candidate.shadowCandidateRevisionId, candidate.shadowCandidateId, revisionId,
          stableId("adaptation-application-owner-result-record", revisionId), run.input.request.athleteId,
          candidate.proposedProgramSnapshot?.snapshotRevisionId ?? null,
          candidate.proposedWeekPlan?.weekPlanRevisionId ?? null,
          candidate.proposedPhaseResult?.decisionRevisionId ?? null, json(candidate),
          run.input.request.evaluationTime, json(candidate.provenance)],
      );
    },
    persistValidationResult: async (run, transaction) => {
      const candidate = run.result.shadowCandidate;
      if (!candidate) return;
      const validation = candidate.downstreamValidation;
      const revisionId = run.result.orchestrationRevision.orchestrationRevisionId;
      await client(transaction).query(
        `INSERT INTO adaptation_application_validation_results (
           validation_result_record_id, validation_fingerprint, orchestration_revision_id,
           shadow_candidate_revision_id, athlete_id, downstream_status, gate13_status,
           longitudinal_status, locality_valid, validation_payload, operation_time, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12::jsonb)`,
        [stableId("adaptation-application-validation-result-record", revisionId),
          validation.validationFingerprint, revisionId, candidate.shadowCandidateRevisionId,
          run.input.request.athleteId, validation.status, validation.gate13Status,
          run.result.longitudinalApplicationValidation?.status ?? null,
          candidate.localityTrace.reasonCodes.length === 0,
          json({ downstream: validation, longitudinal: run.result.longitudinalApplicationValidation,
            locality: candidate.localityTrace }), run.input.request.evaluationTime,
          json(["postgres-orchestration-repository:production-validation"])],
      );
    },
    persistOrchestrationRevision: async (run, transaction) => {
      const check = await client(transaction).query<{ exists: boolean }>(
        "SELECT EXISTS (SELECT 1 FROM adaptation_application_orchestration_runs WHERE orchestration_revision_id = $1) AS exists",
        [run.result.orchestrationRevision.orchestrationRevisionId]);
      if (!check.rows[0]?.exists) throw new Error("ADAPTATION_APPLICATION_ORCHESTRATION_REVISION_NOT_PERSISTED");
    },
    persistApplicationAttempt: async (run, transaction) => {
      const request = run.input.request;
      const revisionId = run.result.orchestrationRevision.orchestrationRevisionId;
      const afterReferences = [run.result.ownerResult?.ownerResultFingerprint,
        run.result.shadowCandidate?.shadowCandidateRevisionId].filter((value): value is string => Boolean(value));
      await client(transaction).query(
        `INSERT INTO adaptation_application_orchestration_attempts (
           orchestration_attempt_record_id, orchestration_revision_id, request_revision_id, athlete_id,
           principal_id, rightful_owner, result_state, before_references, proposed_after_references,
           attempt_payload, attempted_at, application_applied, provenance
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,FALSE,$12::jsonb)`,
        [stableId("adaptation-application-orchestration-attempt-record", revisionId), revisionId,
          request.requestRevisionId, request.athleteId, request.authenticatedPrincipalOrServiceId,
          request.requestedOwner, run.result.status,
          Object.values(request.expectedCurrentRevisions).filter((value): value is string => typeof value === "string"),
          afterReferences, json({ preconditions: run.result.preconditions, status: run.result.status }),
          request.evaluationTime, json(["postgres-orchestration-repository:unapplied-attempt"])],
      );
    },
    appendAuditEvent: async (run, transaction) => {
      const event = run.auditEvent;
      await client(transaction).query(
        `INSERT INTO outcome_source_audit_events (
           audit_event_id, athlete_id, principal_id, operation, entity_type, entity_id,
           entity_revision_id, before_reference, after_reference, reason_code, operation_time,
           result_state, provenance
         ) VALUES ($1,$2,$3,'adaptation_application_orchestration','application_orchestration',$4,
           $5,$6,$7,$8,$9,$10,$11::jsonb)`,
        [event.auditEventId, event.athleteId, event.principalOrServiceId,
          run.result.orchestrationRevision.orchestrationId,
          run.result.orchestrationRevision.orchestrationRevisionId,
          run.input.request.basedOnRequestRevisionId, event.shadowCandidateRevisionId,
          event.finalUnappliedStatus, event.operationTime, event.finalUnappliedStatus, json(event.provenance)],
      );
    },
    readOrchestrationRun: async (athleteId, orchestrationRevisionId) =>
      readRun(pool, athleteId, "orchestration_revision_id", orchestrationRevisionId),
    replayOrchestrationRun: async (athleteId, orchestrationRevisionId) =>
      readRun(pool, athleteId, "orchestration_revision_id", orchestrationRevisionId),
  };
  return Object.freeze(repository);
}
