import { sameSemanticValue, type ControlledOwnerActiveProgramPointer,
  type ControlledOwnerDeliveryAuditEvent, type ControlledOwnerV2ProgramApplication,
  type ControlledOwnerV2ProgramApproval, type ControlledOwnerV2ProgramPreview,
  type OwnerV2ProductProgramEnvelope } from "@praxis/training-engine-v2";
import type { OwnerDeliveryRepository, OwnerIdempotencyRecord,
  OwnerProgramApplicationTransactionResult } from "./contracts";

const key = (...parts: readonly string[]) => parts.join(":");

export function createInMemoryOwnerDeliveryRepository(): OwnerDeliveryRepository {
  const previews = new Map<string, ControlledOwnerV2ProgramPreview>();
  const approvals = new Map<string, ControlledOwnerV2ProgramApproval>();
  const applications = new Map<string, ControlledOwnerV2ProgramApplication>();
  const envelopes = new Map<string, OwnerV2ProductProgramEnvelope>();
  const pointers = new Map<string, ControlledOwnerActiveProgramPointer>();
  const audits = new Map<string, ControlledOwnerDeliveryAuditEvent>();
  const idempotency = new Map<string, OwnerIdempotencyRecord>();
  const appendPreview = async (preview: ControlledOwnerV2ProgramPreview) => {
    const recordKey = key(preview.userId, preview.previewId);
    const prior = previews.get(recordKey);
    if (prior) return sameSemanticValue(prior, preview) ? "exact_retry" as const : "conflict" as const;
    previews.set(recordKey, preview);
    return "appended" as const;
  };

  const appendApproval = async (approval: ControlledOwnerV2ProgramApproval) => {
    const preview = previews.get(key(approval.userId, approval.previewId));
    if (!preview || preview.previewFingerprint !== approval.previewFingerprint) return "conflict" as const;
    const recordKey = key(approval.userId, approval.approvalId);
    const prior = approvals.get(recordKey);
    if (prior) return sameSemanticValue(prior, approval) ? "exact_retry" as const : "conflict" as const;
    const priorForPreview = [...approvals.values()].find((entry) => entry.userId === approval.userId &&
      entry.previewId === approval.previewId);
    if (priorForPreview) return sameSemanticValue(priorForPreview, approval) ? "exact_retry" as const : "conflict" as const;
    approvals.set(recordKey, approval);
    return "appended" as const;
  };
  const repository: OwnerDeliveryRepository = {
    appendPreview,
    appendPreviewIdempotent: async (preview, record) => {
      const idemKey = key(record.userId, record.action, record.idempotencyKey);
      const prior = idempotency.get(idemKey);
      if (prior) return prior.requestFingerprint === record.requestFingerprint ? "exact_retry" : "conflict";
      const result = await appendPreview(preview);
      if (result !== "conflict") idempotency.set(idemKey, record);
      return result;
    },
    readPreviewExact: async (userId, previewId) => previews.get(key(userId, previewId)) ?? null,
    appendApproval,
    appendApprovalIdempotent: async (approval, record) => {
      const idemKey = key(record.userId, record.action, record.idempotencyKey);
      const prior = idempotency.get(idemKey);
      if (prior) return prior.requestFingerprint === record.requestFingerprint ? "exact_retry" : "conflict";
      const result = await appendApproval(approval);
      if (result !== "conflict") idempotency.set(idemKey, record);
      return result;
    },
    readApprovalExact: async (userId, approvalId) => approvals.get(key(userId, approvalId)) ?? null,
    readApplicationExact: async (userId, applicationId) => applications.get(key(userId, applicationId)) ?? null,
    readEnvelopeExact: async (userId, envelopeId, envelopeRevisionId) =>
      envelopes.get(key(userId, envelopeId, envelopeRevisionId)) ?? null,
    readActivePointer: async (userId) => pointers.get(userId) ?? null,
    readIdempotency: async (userId, action, idempotencyKey) =>
      idempotency.get(key(userId, action, idempotencyKey)) ?? null,
    applyApprovedProgram: async (transaction): Promise<OwnerProgramApplicationTransactionResult> => {
      const idemKey = key(transaction.idempotency.userId, transaction.idempotency.action,
        transaction.idempotency.idempotencyKey);
      const priorIdempotency = idempotency.get(idemKey);
      if (priorIdempotency) {
        const exact = priorIdempotency.requestFingerprint === transaction.idempotency.requestFingerprint;
        const prior = applications.get(key(transaction.application.userId,
          transaction.application.applicationId)) ?? null;
        return Object.freeze({ status: exact && prior ? "exact_retry" : "conflict", application: prior,
          envelope: exact ? envelopes.get(key(transaction.envelope.userId, transaction.envelope.envelopeId,
            transaction.envelope.envelopeRevisionId)) ?? null : null,
          pointer: exact ? pointers.get(transaction.pointer.userId) ?? null : null });
      }
      const preview = previews.get(key(transaction.preview.userId, transaction.preview.previewId));
      const approval = approvals.get(key(transaction.approval.userId, transaction.approval.approvalId));
      const currentPointer = pointers.get(transaction.pointer.userId);
      const currentRevision = currentPointer?.revision ?? 0;
      if (!preview || !approval || preview.previewFingerprint !== transaction.preview.previewFingerprint ||
          approval.approvalFingerprint !== transaction.approval.approvalFingerprint ||
          approval.previewId !== preview.previewId || transaction.expectedPointerRevision !== currentRevision ||
          transaction.pointer.revision !== currentRevision + 1 ||
          transaction.application.userId !== preview.userId || transaction.envelope.userId !== preview.userId) {
        return Object.freeze({ status: "conflict", application: null, envelope: null, pointer: currentPointer ?? null });
      }
      const priorApplication = [...applications.values()].find((entry) => entry.userId === preview.userId &&
        entry.approvalId === approval.approvalId);
      if (priorApplication) return Object.freeze({ status: "conflict", application: priorApplication,
        envelope: null, pointer: currentPointer ?? null });
      applications.set(key(preview.userId, transaction.application.applicationId), transaction.application);
      envelopes.set(key(preview.userId, transaction.envelope.envelopeId,
        transaction.envelope.envelopeRevisionId), transaction.envelope);
      pointers.set(preview.userId, transaction.pointer);
      audits.set(key(preview.userId, transaction.auditEvent.eventId), transaction.auditEvent);
      idempotency.set(idemKey, transaction.idempotency);
      return Object.freeze({ status: "applied", application: transaction.application,
        envelope: transaction.envelope, pointer: transaction.pointer });
    },
    listAuditEvents: async (userId) => Object.freeze([...audits.values()].filter((event) =>
      event.userId === userId).sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) ||
      left.eventId.localeCompare(right.eventId))),
  };
  return Object.freeze(repository);
}
