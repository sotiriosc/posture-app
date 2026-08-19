import { createHash } from "node:crypto";
import {
  buildOwnerDeliveryAuditEvent,
  reviseOwnerCalibrationCycleFromEvidence,
  validateOwnerCalibrationRecoveryObservation,
  type OwnerCalibrationRecoveryObservation,
} from "@praxis/training-engine-v2";
import type { OutcomeSourcePersistencePort } from "../outcomeSourcePersistence";
import type { OwnerDeliveryRepository, OwnerIdempotencyRecord } from "./contracts";
import { persistControlledOwnerCalibrationRecovery } from "./outcomeService";

export async function recordControlledOwnerCalibrationRecovery(input: {
  readonly userId: string;
  readonly cycleId: string;
  readonly observation: OwnerCalibrationRecoveryObservation;
  readonly idempotencyKey: string;
  readonly recordedAt: string;
  readonly delivery: OwnerDeliveryRepository;
  readonly outcomeRepository: OutcomeSourcePersistencePort;
}) {
  const finish = (status: "recorded" | "exact_retry" | "not_found" | "invalid" | "conflict",
    cycle: Awaited<ReturnType<OwnerDeliveryRepository["readCalibrationCycleCurrent"]>>,
    reasonCodes: readonly string[]) => Object.freeze({ status, cycle,
      reasonCodes: Object.freeze([...reasonCodes]), automaticApplicationCount: 0 as const });
  if (!input.idempotencyKey.trim()) return finish("invalid", null, ["OWNER_IDEMPOTENCY_KEY_REQUIRED"]);
  const cycle = await input.delivery.readCalibrationCycleCurrent(input.userId, input.cycleId);
  if (!cycle) return finish("not_found", null, ["OWNER_CALIBRATION_CYCLE_NOT_FOUND"]);
  const reasons = validateOwnerCalibrationRecoveryObservation({ observation: input.observation, cycle });
  if (reasons.length) return finish("invalid", cycle, reasons);
  if (!cycle.evidenceSufficiency.completedSessionIds.includes(input.observation.sessionId)) {
    return finish("invalid", cycle, ["OWNER_CALIBRATION_RECOVERY_REQUIRES_COMPLETED_SESSION"]);
  }
  const requestFingerprint = createHash("sha256").update(JSON.stringify({ cycleId: cycle.cycleId,
    observation: input.observation })).digest("hex");
  const prior = await input.delivery.readIdempotency(input.userId, "recovery", input.idempotencyKey);
  if (prior) {
    if (prior.requestFingerprint !== requestFingerprint) {
      return finish("conflict", cycle, ["OWNER_CALIBRATION_RECOVERY_IDEMPOTENCY_CONFLICT"]);
    }
    const response = prior.responsePayload as { readonly cycleRevisionId?: unknown } | null;
    const current = await input.delivery.readCalibrationCycleCurrent(input.userId, input.cycleId);
    return current && current.cycleRevisionId === response?.cycleRevisionId ? finish("exact_retry", current, []) :
      finish("conflict", current, ["OWNER_CALIBRATION_RECOVERY_REPLAY_INCOMPLETE"]);
  }
  const existingRecords = await input.outcomeRepository.readActiveSourceRecords(input.userId, input.recordedAt);
  if (existingRecords.some((record) => record.sourceCategory === "recovery_readiness" &&
      record.targetIds.includes(cycle.cycleId) && record.targetIds.includes(input.observation.sessionId))) {
    return finish("invalid", cycle, ["OWNER_CALIBRATION_RECOVERY_ALREADY_RECORDED_USE_CORRECTION"]);
  }
  const outcome = await persistControlledOwnerCalibrationRecovery({ userId: input.userId, cycle,
    observation: input.observation, repository: input.outcomeRepository, operationTime: input.recordedAt });
  const records = await input.outcomeRepository.readActiveSourceRecords(input.userId, input.recordedAt);
  const revision = reviseOwnerCalibrationCycleFromEvidence({ prior: cycle, records, createdAt: input.recordedAt });
  if (await input.delivery.appendCalibrationCycleRevision(revision) === "conflict") {
    return finish("conflict", cycle, ["OWNER_CALIBRATION_CYCLE_REVISION_CONFLICT"]);
  }
  const idempotency: OwnerIdempotencyRecord = Object.freeze({ userId: input.userId, action: "recovery",
    idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ cycleRevisionId: revision.cycleRevisionId,
      sourceRecordRevisionId: outcome.sourceRecordRevisionId }),
    createdAt: input.recordedAt, completedAt: input.recordedAt });
  if (await input.delivery.appendIdempotency(idempotency) === "conflict") {
    return finish("conflict", cycle, ["OWNER_CALIBRATION_RECOVERY_IDEMPOTENCY_CONFLICT"]);
  }
  const audit = buildOwnerDeliveryAuditEvent({ userId: input.userId,
    action: "calibration_recovery_observation", targetId: revision.cycleId, occurredAt: input.recordedAt,
    metadata: Object.freeze({ sessionId: input.observation.sessionId,
      readiness: input.observation.readiness, cycleState: revision.state,
      automaticApplicationCount: 0, automaticProgressionCount: 0 }) });
  if (await input.delivery.appendAuditEvent(audit) === "conflict") {
    throw new Error("OWNER_CALIBRATION_RECOVERY_AUDIT_CONFLICT");
  }
  return finish("recorded", revision, []);
}
