import type {
  AppendSessionPracticeRevisionResult,
  PersistedSessionPracticeRevision,
  SessionPracticePersistenceRepository,
  SessionPracticePostgresQueryable,
} from "./contracts";
import { validatePersistedSessionPracticeRevision } from "./persistence";

interface PersistedRow extends Record<string, unknown> {
  readonly semantic_fingerprint: string;
  readonly revision_payload: PersistedSessionPracticeRevision;
}

async function readExact(
  queryable: SessionPracticePostgresQueryable,
  athleteId: string,
  attemptId: string,
  persistenceRevisionId: string,
): Promise<PersistedSessionPracticeRevision | null> {
  const result = await queryable.query<PersistedRow>(
    `SELECT semantic_fingerprint, revision_payload
       FROM session_practice_v2_attempt_revisions
      WHERE athlete_id = $1 AND attempt_id = $2 AND persistence_revision_id = $3`,
    [athleteId, attemptId, persistenceRevisionId],
  );
  return result.rows[0]?.revision_payload ?? null;
}

export function createSessionPracticePostgresRepository(input: {
  readonly queryable: SessionPracticePostgresQueryable;
}): SessionPracticePersistenceRepository {
  const queryable = input.queryable;
  const repository: SessionPracticePersistenceRepository = {
    appendRevision: async (revision): Promise<AppendSessionPracticeRevisionResult> => {
      const reasons = validatePersistedSessionPracticeRevision(revision);
      if (reasons.length) throw new Error(reasons.join(","));
      const priorResult = await queryable.query<PersistedRow>(
        `SELECT semantic_fingerprint, revision_payload
           FROM session_practice_v2_attempt_revisions
          WHERE athlete_id = $1 AND attempt_id = $2 AND persistence_revision_id = $3`,
        [revision.athleteId, revision.attemptId, revision.persistenceRevisionId],
      );
      const prior = priorResult.rows[0];
      if (prior) return Object.freeze({ status: prior.semantic_fingerprint === revision.semanticFingerprint ?
        "exact_retry" : "idempotency_conflict", persistenceRevisionId: revision.persistenceRevisionId,
      priorRevision: prior.revision_payload, mutationCount: 0, productWriteCount: 0 });
      if (revision.basedOnPersistenceRevisionId !== null) {
        const basedOn = await readExact(queryable, revision.athleteId, revision.attemptId,
          revision.basedOnPersistenceRevisionId);
        if (!basedOn) return Object.freeze({ status: "lineage_conflict",
          persistenceRevisionId: revision.persistenceRevisionId, priorRevision: null,
          mutationCount: 0, productWriteCount: 0 });
      }
      await queryable.query(
        `INSERT INTO session_practice_v2_attempt_revisions (
           persistence_revision_id, based_on_persistence_revision_id, athlete_id, attempt_id,
           request_id, realization_revision_id, source_session_revision_id,
           final_for_execution_revision_id, contract_id, contract_version, semantic_fingerprint,
           source_fingerprint, plan_fingerprint, revision_payload, created_at, evaluation_time,
           current_product_write_applied, product_activation_applied
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,FALSE,FALSE)`,
        [revision.persistenceRevisionId, revision.basedOnPersistenceRevisionId, revision.athleteId,
          revision.attemptId, revision.requestId, revision.realizationRevisionId,
          revision.sourceSessionRevisionId, revision.finalForExecutionRevisionId,
          revision.persistenceContract.contractId, revision.persistenceContract.contractVersion,
          revision.semanticFingerprint, revision.sourceFingerprint, revision.planFingerprint,
          JSON.stringify(revision), revision.createdAt, revision.evaluationTime],
      );
      return Object.freeze({ status: "appended", persistenceRevisionId: revision.persistenceRevisionId,
        priorRevision: null, mutationCount: 0, productWriteCount: 0 });
    },
    readExactRevision: async (athleteId, attemptId, persistenceRevisionId) =>
      readExact(queryable, athleteId, attemptId, persistenceRevisionId),
    readAttemptRevisions: async (athleteId, attemptId) => {
      const result = await queryable.query<PersistedRow>(
        `SELECT semantic_fingerprint, revision_payload
           FROM session_practice_v2_attempt_revisions
          WHERE athlete_id = $1 AND attempt_id = $2
          ORDER BY created_at ASC, persistence_revision_id ASC`,
        [athleteId, attemptId],
      );
      return Object.freeze(result.rows.map((row) => row.revision_payload));
    },
  };
  return Object.freeze(repository);
}
