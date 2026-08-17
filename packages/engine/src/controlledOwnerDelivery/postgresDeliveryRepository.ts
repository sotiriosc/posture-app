import type { ControlledOwnerActiveProgramPointer, ControlledOwnerDeliveryAuditEvent,
  ControlledOwnerV2ProgramApplication, ControlledOwnerV2ProgramApproval,
  ControlledOwnerV2ProgramPreview, OwnerV2ProductProgramEnvelope } from "@praxis/training-engine-v2";
import type { OwnerDeliveryRepository, OwnerIdempotencyRecord, OwnerPostgresQueryable,
  OwnerProgramApplicationTransactionResult } from "./contracts";

interface PayloadRow<T> extends Record<string, unknown> { readonly payload: T }
interface IdempotencyRow extends Record<string, unknown> {
  readonly user_id: string;
  readonly action: OwnerIdempotencyRecord["action"];
  readonly idempotency_key: string;
  readonly request_fingerprint: string;
  readonly response_payload: unknown | null;
  readonly created_at: string;
  readonly completed_at: string | null;
}

function idempotencyFromRow(row: IdempotencyRow): OwnerIdempotencyRecord {
  return Object.freeze({ userId: row.user_id, action: row.action, idempotencyKey: row.idempotency_key,
    requestFingerprint: row.request_fingerprint, responsePayload: row.response_payload,
    createdAt: row.created_at, completedAt: row.completed_at });
}

export function createOwnerDeliveryPostgresRepository(input: {
  readonly queryable: OwnerPostgresQueryable;
}): OwnerDeliveryRepository {
  const db = input.queryable;
  const repository: OwnerDeliveryRepository = {
    appendPreview: async (preview) => {
      const inserted = await db.query(`INSERT INTO owner_v2_previews
        (user_id, preview_id, preview_fingerprint, profile_revision_id, source_product_revision_id,
         readiness_status, payload, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
        ON CONFLICT (user_id, preview_id) DO NOTHING`, [preview.userId, preview.previewId,
        preview.previewFingerprint, preview.profileRevisionId, preview.sourceProductRevisionId,
        preview.readinessStatus, JSON.stringify(preview), preview.createdAt]);
      if ((inserted.rowCount ?? 0) > 0) return "appended";
      const prior = await db.query<PayloadRow<ControlledOwnerV2ProgramPreview>>(
        `SELECT payload FROM owner_v2_previews WHERE user_id = $1 AND preview_id = $2`,
        [preview.userId, preview.previewId]);
      return prior.rows[0]?.payload.previewFingerprint === preview.previewFingerprint ? "exact_retry" : "conflict";
    },
    appendPreviewIdempotent: async (preview, record) => {
      await db.query("BEGIN");
      try {
        const priorIdempotency = await db.query<IdempotencyRow>(`SELECT user_id, action, idempotency_key,
          request_fingerprint, response_payload, created_at, completed_at FROM owner_v2_idempotency
          WHERE user_id=$1 AND action=$2 AND idempotency_key=$3 FOR UPDATE`,
        [record.userId, record.action, record.idempotencyKey]);
        if (priorIdempotency.rows[0]) {
          await db.query("COMMIT");
          return priorIdempotency.rows[0].request_fingerprint === record.requestFingerprint
            ? "exact_retry" : "conflict";
        }
        const inserted = await db.query(`INSERT INTO owner_v2_previews
          (user_id,preview_id,preview_fingerprint,profile_revision_id,source_product_revision_id,
           readiness_status,payload,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
          ON CONFLICT (user_id,preview_id) DO NOTHING`, [preview.userId, preview.previewId,
          preview.previewFingerprint, preview.profileRevisionId, preview.sourceProductRevisionId,
          preview.readinessStatus, JSON.stringify(preview), preview.createdAt]);
        if ((inserted.rowCount ?? 0) !== 1) {
          const prior = await db.query<PayloadRow<ControlledOwnerV2ProgramPreview>>(
            `SELECT payload FROM owner_v2_previews WHERE user_id=$1 AND preview_id=$2`,
            [preview.userId, preview.previewId]);
          if (prior.rows[0]?.payload.previewFingerprint !== preview.previewFingerprint) {
            await db.query("ROLLBACK"); return "conflict";
          }
        }
        await db.query(`INSERT INTO owner_v2_idempotency
          (user_id,action,idempotency_key,request_fingerprint,response_payload,created_at,completed_at)
          VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`, [record.userId, record.action, record.idempotencyKey,
          record.requestFingerprint, JSON.stringify(record.responsePayload), record.createdAt, record.completedAt]);
        await db.query("COMMIT");
        return (inserted.rowCount ?? 0) === 1 ? "appended" : "exact_retry";
      } catch {
        await db.query("ROLLBACK"); return "conflict";
      }
    },
    readPreviewExact: async (userId, previewId) => (await db.query<PayloadRow<ControlledOwnerV2ProgramPreview>>(
      `SELECT payload FROM owner_v2_previews WHERE user_id = $1 AND preview_id = $2`,
      [userId, previewId])).rows[0]?.payload ?? null,
    appendApproval: async (approval) => {
      const inserted = await db.query(`INSERT INTO owner_v2_approvals
        (user_id, approval_id, preview_id, approval_fingerprint, payload, approved_at)
        SELECT $1,$2,$3,$4,$5::jsonb,$6 FROM owner_v2_previews
         WHERE user_id = $1 AND preview_id = $3 AND preview_fingerprint = $7
        ON CONFLICT (user_id, approval_id) DO NOTHING`, [approval.userId, approval.approvalId,
        approval.previewId, approval.approvalFingerprint, JSON.stringify(approval), approval.approvedAt,
        approval.previewFingerprint]);
      if ((inserted.rowCount ?? 0) > 0) return "appended";
      const prior = await db.query<PayloadRow<ControlledOwnerV2ProgramApproval>>(
        `SELECT payload FROM owner_v2_approvals WHERE user_id = $1 AND approval_id = $2`,
        [approval.userId, approval.approvalId]);
      return prior.rows[0]?.payload.approvalFingerprint === approval.approvalFingerprint ? "exact_retry" : "conflict";
    },
    appendApprovalIdempotent: async (approval, record) => {
      await db.query("BEGIN");
      try {
        const priorIdempotency = await db.query<IdempotencyRow>(`SELECT user_id, action, idempotency_key,
          request_fingerprint, response_payload, created_at, completed_at FROM owner_v2_idempotency
          WHERE user_id=$1 AND action=$2 AND idempotency_key=$3 FOR UPDATE`,
        [record.userId, record.action, record.idempotencyKey]);
        if (priorIdempotency.rows[0]) {
          await db.query("COMMIT");
          return priorIdempotency.rows[0].request_fingerprint === record.requestFingerprint
            ? "exact_retry" : "conflict";
        }
        const inserted = await db.query(`INSERT INTO owner_v2_approvals
          (user_id, approval_id, preview_id, approval_fingerprint, payload, approved_at)
          SELECT $1,$2,$3,$4,$5::jsonb,$6 FROM owner_v2_previews
           WHERE user_id=$1 AND preview_id=$3 AND preview_fingerprint=$7
          ON CONFLICT (user_id, approval_id) DO NOTHING`, [approval.userId, approval.approvalId,
          approval.previewId, approval.approvalFingerprint, JSON.stringify(approval), approval.approvedAt,
          approval.previewFingerprint]);
        if ((inserted.rowCount ?? 0) !== 1) {
          const prior = await db.query<PayloadRow<ControlledOwnerV2ProgramApproval>>(
            `SELECT payload FROM owner_v2_approvals WHERE user_id=$1 AND approval_id=$2`,
            [approval.userId, approval.approvalId]);
          if (prior.rows[0]?.payload.approvalFingerprint !== approval.approvalFingerprint) {
            await db.query("ROLLBACK");
            return "conflict";
          }
        }
        await db.query(`INSERT INTO owner_v2_idempotency
          (user_id,action,idempotency_key,request_fingerprint,response_payload,created_at,completed_at)
          VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`, [record.userId, record.action, record.idempotencyKey,
          record.requestFingerprint, JSON.stringify(record.responsePayload), record.createdAt, record.completedAt]);
        await db.query("COMMIT");
        return (inserted.rowCount ?? 0) === 1 ? "appended" : "exact_retry";
      } catch {
        await db.query("ROLLBACK");
        return "conflict";
      }
    },
    readApprovalExact: async (userId, approvalId) => (await db.query<PayloadRow<ControlledOwnerV2ProgramApproval>>(
      `SELECT payload FROM owner_v2_approvals WHERE user_id = $1 AND approval_id = $2`,
      [userId, approvalId])).rows[0]?.payload ?? null,
    readApplicationExact: async (userId, applicationId) =>
      (await db.query<PayloadRow<ControlledOwnerV2ProgramApplication>>(
        `SELECT payload FROM owner_v2_applications WHERE user_id = $1 AND application_id = $2`,
        [userId, applicationId])).rows[0]?.payload ?? null,
    readEnvelopeExact: async (userId, envelopeId, envelopeRevisionId) =>
      (await db.query<PayloadRow<OwnerV2ProductProgramEnvelope>>(
        `SELECT payload FROM owner_v2_program_envelopes
          WHERE user_id = $1 AND envelope_id = $2 AND envelope_revision_id = $3`,
        [userId, envelopeId, envelopeRevisionId])).rows[0]?.payload ?? null,
    readActivePointer: async (userId) => (await db.query<PayloadRow<ControlledOwnerActiveProgramPointer>>(
      `SELECT payload FROM owner_v2_active_program_pointers WHERE user_id = $1`, [userId])).rows[0]?.payload ?? null,
    readIdempotency: async (userId, action, idempotencyKey) => {
      const result = await db.query<IdempotencyRow>(`SELECT user_id, action, idempotency_key,
        request_fingerprint, response_payload, created_at, completed_at FROM owner_v2_idempotency
        WHERE user_id = $1 AND action = $2 AND idempotency_key = $3`, [userId, action, idempotencyKey]);
      return result.rows[0] ? idempotencyFromRow(result.rows[0]) : null;
    },
    applyApprovedProgram: async (transaction): Promise<OwnerProgramApplicationTransactionResult> => {
      await db.query("BEGIN");
      try {
        const priorIdempotency = await db.query<IdempotencyRow>(`SELECT user_id, action, idempotency_key,
          request_fingerprint, response_payload, created_at, completed_at FROM owner_v2_idempotency
          WHERE user_id = $1 AND action = $2 AND idempotency_key = $3 FOR UPDATE`,
        [transaction.idempotency.userId, transaction.idempotency.action, transaction.idempotency.idempotencyKey]);
        if (priorIdempotency.rows[0]) {
          if (priorIdempotency.rows[0].request_fingerprint !== transaction.idempotency.requestFingerprint) {
            await db.query("ROLLBACK");
            return Object.freeze({ status: "conflict", application: null, envelope: null, pointer: null });
          }
          const application = await db.query<PayloadRow<ControlledOwnerV2ProgramApplication>>(
            `SELECT payload FROM owner_v2_applications WHERE user_id = $1 AND application_id = $2`,
            [transaction.application.userId, transaction.application.applicationId]);
          const envelope = await db.query<PayloadRow<OwnerV2ProductProgramEnvelope>>(
            `SELECT payload FROM owner_v2_program_envelopes
             WHERE user_id = $1 AND envelope_id = $2 AND envelope_revision_id = $3`,
            [transaction.envelope.userId, transaction.envelope.envelopeId, transaction.envelope.envelopeRevisionId]);
          const pointer = await db.query<PayloadRow<ControlledOwnerActiveProgramPointer>>(
            `SELECT payload FROM owner_v2_active_program_pointers WHERE user_id = $1`, [transaction.pointer.userId]);
          await db.query("COMMIT");
          return Object.freeze({ status: application.rows[0] ? "exact_retry" : "conflict",
            application: application.rows[0]?.payload ?? null, envelope: envelope.rows[0]?.payload ?? null,
            pointer: pointer.rows[0]?.payload ?? null });
        }
        const preview = await db.query<PayloadRow<ControlledOwnerV2ProgramPreview>>(
          `SELECT payload FROM owner_v2_previews WHERE user_id = $1 AND preview_id = $2 FOR UPDATE`,
          [transaction.preview.userId, transaction.preview.previewId]);
        const approval = await db.query<PayloadRow<ControlledOwnerV2ProgramApproval>>(
          `SELECT payload FROM owner_v2_approvals WHERE user_id = $1 AND approval_id = $2 FOR UPDATE`,
          [transaction.approval.userId, transaction.approval.approvalId]);
        const pointer = await db.query<PayloadRow<ControlledOwnerActiveProgramPointer>>(
          `SELECT payload FROM owner_v2_active_program_pointers WHERE user_id = $1 FOR UPDATE`,
          [transaction.pointer.userId]);
        const pointerRevision = pointer.rows[0]?.payload.revision ?? 0;
        if (preview.rows[0]?.payload.previewFingerprint !== transaction.preview.previewFingerprint ||
            approval.rows[0]?.payload.approvalFingerprint !== transaction.approval.approvalFingerprint ||
            pointerRevision !== transaction.expectedPointerRevision ||
            transaction.pointer.revision !== pointerRevision + 1) {
          await db.query("ROLLBACK");
          return Object.freeze({ status: "conflict", application: null, envelope: null,
            pointer: pointer.rows[0]?.payload ?? null });
        }
        await db.query(`INSERT INTO owner_v2_idempotency
          (user_id, action, idempotency_key, request_fingerprint, response_payload, created_at, completed_at)
          VALUES ($1,$2,$3,$4,NULL,$5,NULL)`, [transaction.idempotency.userId, transaction.idempotency.action,
          transaction.idempotency.idempotencyKey, transaction.idempotency.requestFingerprint,
          transaction.idempotency.createdAt]);
        await db.query(`INSERT INTO owner_v2_program_envelopes
          (user_id,envelope_id,envelope_revision_id,envelope_fingerprint,preview_id,approval_id,payload,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`, [transaction.envelope.userId,
          transaction.envelope.envelopeId, transaction.envelope.envelopeRevisionId,
          transaction.envelope.envelopeFingerprint, transaction.envelope.previewId,
          transaction.envelope.approvalId, JSON.stringify(transaction.envelope), transaction.envelope.createdAt]);
        await db.query(`INSERT INTO owner_v2_applications
          (user_id,application_id,approval_id,preview_id,envelope_id,application_fingerprint,payload,applied_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`, [transaction.application.userId,
          transaction.application.applicationId, transaction.application.approvalId,
          transaction.application.previewId, transaction.application.envelopeId,
          transaction.application.applicationFingerprint, JSON.stringify(transaction.application),
          transaction.application.appliedAt]);
        const pointerWrite = pointer.rows[0]
          ? await db.query(`UPDATE owner_v2_active_program_pointers SET mode=$2, active_application_id=$3,
              legacy_fallback_reference=$4, revision=$5, pointer_fingerprint=$6, payload=$7::jsonb, updated_at=$8
              WHERE user_id=$1 AND revision=$9`, [transaction.pointer.userId, transaction.pointer.mode,
            transaction.pointer.activeApplicationId, transaction.pointer.legacyFallbackReference,
            transaction.pointer.revision, transaction.pointer.pointerFingerprint, JSON.stringify(transaction.pointer),
            transaction.pointer.updatedAt, transaction.expectedPointerRevision])
          : await db.query(`INSERT INTO owner_v2_active_program_pointers
              (user_id,mode,active_application_id,legacy_fallback_reference,revision,pointer_fingerprint,payload,updated_at)
              VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8) ON CONFLICT (user_id) DO NOTHING`,
            [transaction.pointer.userId, transaction.pointer.mode, transaction.pointer.activeApplicationId,
              transaction.pointer.legacyFallbackReference, transaction.pointer.revision,
              transaction.pointer.pointerFingerprint, JSON.stringify(transaction.pointer), transaction.pointer.updatedAt]);
        if ((pointerWrite.rowCount ?? 0) !== 1) throw new Error("OWNER_POINTER_CONFLICT");
        await db.query(`INSERT INTO owner_v2_delivery_audit_events
          (user_id,event_id,action,target_id,event_fingerprint,payload,occurred_at)
          VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`, [transaction.auditEvent.userId,
          transaction.auditEvent.eventId, transaction.auditEvent.action, transaction.auditEvent.targetId,
          transaction.auditEvent.eventFingerprint, JSON.stringify(transaction.auditEvent),
          transaction.auditEvent.occurredAt]);
        const response = { applicationId: transaction.application.applicationId,
          envelopeId: transaction.envelope.envelopeId,
          envelopeRevisionId: transaction.envelope.envelopeRevisionId,
          pointerRevision: transaction.pointer.revision };
        await db.query(`UPDATE owner_v2_idempotency SET response_payload=$4::jsonb, completed_at=$5
          WHERE user_id=$1 AND action=$2 AND idempotency_key=$3`, [transaction.idempotency.userId,
          transaction.idempotency.action, transaction.idempotency.idempotencyKey, JSON.stringify(response),
          transaction.idempotency.completedAt]);
        await db.query("COMMIT");
        return Object.freeze({ status: "applied", application: transaction.application,
          envelope: transaction.envelope, pointer: transaction.pointer });
      } catch {
        await db.query("ROLLBACK");
        return Object.freeze({ status: "conflict", application: null, envelope: null, pointer: null });
      }
    },
    listAuditEvents: async (userId) => Object.freeze((await db.query<PayloadRow<ControlledOwnerDeliveryAuditEvent>>(
      `SELECT payload FROM owner_v2_delivery_audit_events WHERE user_id = $1
       ORDER BY occurred_at ASC, event_id ASC`, [userId])).rows.map((row) => row.payload)),
  };
  return Object.freeze(repository);
}
