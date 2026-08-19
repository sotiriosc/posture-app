import { createHash } from "node:crypto";
import { buildOwnerActiveProgramPointer, buildOwnerDeliveryAuditEvent } from
  "@praxis/training-engine-v2";
import type { ControlledOwnerRequestGateResult } from "./gate";
import type { OwnerDeliveryRepository, OwnerIdempotencyRecord } from "./contracts";
import { buildControlledOwnerObservabilityEvent, NOOP_CONTROLLED_OWNER_OBSERVABILITY,
  type ControlledOwnerObservability } from "./observability";

export async function rollbackControlledOwnerProgram(input: {
  readonly gate: ControlledOwnerRequestGateResult;
  readonly repository: OwnerDeliveryRepository;
  readonly applicationId: string;
  readonly expectedPointerRevision: number;
  readonly explicitConfirmation: boolean;
  readonly csrfVerified: boolean;
  readonly idempotencyKey: string;
  readonly rolledBackAt: string;
  readonly observability?: ControlledOwnerObservability;
}) {
  const observability = input.observability ?? NOOP_CONTROLLED_OWNER_OBSERVABILITY;
  if (!input.gate.allowed || input.gate.mode !== "apply" || !input.gate.userId ||
      !input.explicitConfirmation || !input.csrfVerified || !input.idempotencyKey.trim()) {
    return Object.freeze({ status: "unavailable" as const, pointer: null, auditEvent: null,
      reasonCodes: Object.freeze(["OWNER_ROLLBACK_EXPLICIT_APPLY_AUTHORIZATION_REQUIRED"]) });
  }
  const requestFingerprint = createHash("sha256").update(JSON.stringify({ userId: input.gate.userId,
    applicationId: input.applicationId, expectedPointerRevision: input.expectedPointerRevision,
    explicitConfirmation: input.explicitConfirmation })).digest("hex");
  const priorIdempotency = await input.repository.readIdempotency(input.gate.userId, "rollback",
    input.idempotencyKey);
  if (priorIdempotency) {
    const exact = priorIdempotency.requestFingerprint === requestFingerprint;
    const pointer = exact ? await input.repository.readActivePointer(input.gate.userId) : null;
    const auditEvent = exact ? (await input.repository.listAuditEvents(input.gate.userId))
      .find((event) => event.action === "rollback" && event.targetId === input.applicationId) ?? null : null;
    return Object.freeze({ status: exact && pointer ? "exact_retry" as const : "conflict" as const,
      pointer, auditEvent, reasonCodes: Object.freeze(exact ? [] : ["OWNER_ROLLBACK_IDEMPOTENCY_CONFLICT"]) });
  }
  const current = await input.repository.readActivePointer(input.gate.userId);
  if (!current || current.mode !== "v2_owner" || current.activeApplicationId !== input.applicationId ||
      current.revision !== input.expectedPointerRevision) {
    return Object.freeze({ status: "conflict" as const, pointer: current, auditEvent: null,
      reasonCodes: Object.freeze(["OWNER_ROLLBACK_ACTIVE_POINTER_CONFLICT"]) });
  }
  const pointer = buildOwnerActiveProgramPointer({ userId: input.gate.userId, mode: "legacy",
    activeApplicationId: null, legacyFallbackReference: current.legacyFallbackReference,
    revision: current.revision + 1, updatedAt: input.rolledBackAt,
    provenance: { source: "server_runtime", sourceRefs: [current.pointerFingerprint,
      input.applicationId, "owner-v2:explicit-rollback"] } });
  const auditEvent = buildOwnerDeliveryAuditEvent({ userId: input.gate.userId, action: "rollback",
    targetId: input.applicationId, occurredAt: input.rolledBackAt,
    metadata: { priorPointerRevision: current.revision, nextPointerRevision: pointer.revision,
      preservedV2Records: true, deletionCount: 0, legacyRestored: true } });
  const idempotency: OwnerIdempotencyRecord = Object.freeze({ userId: input.gate.userId,
    action: "rollback", idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ pointerRevision: pointer.revision, rollbackEventId: auditEvent.eventId }),
    createdAt: input.rolledBackAt, completedAt: input.rolledBackAt });
  const result = await input.repository.rollbackActiveProgram({ pointer, auditEvent, idempotency,
    expectedPointerRevision: input.expectedPointerRevision, expectedApplicationId: input.applicationId });
  await observability.emit(buildControlledOwnerObservabilityEvent({ name: "rollback",
    occurredAt: input.rolledBackAt, userId: input.gate.userId, recordId: auditEvent.eventId,
    contractVersion: auditEvent.contract.contractVersion, mode: input.gate.mode,
    state: result.status, reasonCodes: result.status === "conflict" ? ["OWNER_ROLLBACK_CONFLICT"] : [],
    latencyMs: null, fingerprint: auditEvent.eventFingerprint, appSurface: "owner_week" }));
  return Object.freeze({ ...result, reasonCodes: Object.freeze(result.status === "conflict" ?
    ["OWNER_ROLLBACK_TRANSACTION_CONFLICT"] : []) });
}
