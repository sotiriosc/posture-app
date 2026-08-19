import { createHash } from "node:crypto";
import {
  buildOwnerActiveProgramPointer,
  buildOwnerDeliveryAuditEvent,
  buildOwnerProgramApplication,
  buildOwnerProgramApproval,
  buildOwnerProgramEnvelope,
  buildInitialOwnerCalibrationCycle,
  deriveOwnerApplicationId,
  deriveOwnerPreviewStaleness,
  evaluateOwnerProfileReadiness,
  resolveOwnerProgramClassification,
  type ControlledOwnerV2ProgramApplication,
  type ControlledOwnerV2ProgramApproval,
  type OwnerDeliveryMode,
  type OwnerProgramClassification,
  type OwnerTrainingSafetyState,
  type OwnerV2ProductProgramEnvelope,
} from "@praxis/training-engine-v2";
import type { OwnerDeliveryRepository, OwnerEnrollmentProfileRepository, OwnerIdempotencyRecord } from "./contracts";
import type { ControlledOwnerRequestGateResult } from "./gate";

export interface OwnerCurrentApplicationContext {
  readonly currentProductRevisionId: string;
  readonly currentLegacyProgramRevisionId: string | null;
  readonly currentEquipmentSourceRevision: string;
  readonly currentSafetyState: OwnerTrainingSafetyState;
  readonly currentEngineVersion: string;
  readonly currentPolicyVersions: readonly string[];
  readonly activeLegacySession: boolean;
  readonly activeV2Session: boolean;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export interface ApproveControlledOwnerPreviewResult {
  readonly status: "approved" | "exact_retry" | "denied" | "not_found" | "stale" | "conflict";
  readonly approval: ControlledOwnerV2ProgramApproval | null;
  readonly reasonCodes: readonly string[];
  readonly applicationCount: 0;
}

export async function approveControlledOwnerGetStrongerPreview(input: {
  readonly previewId: string;
  readonly previewFingerprint: string;
  readonly explicitConfirmation: boolean;
  readonly approvalClassification?: OwnerProgramClassification;
  readonly csrfVerified: boolean;
  readonly idempotencyKey: string;
  readonly approvedAt: string;
  readonly gate: () => Promise<ControlledOwnerRequestGateResult>;
  readonly enrollmentProfiles: OwnerEnrollmentProfileRepository;
  readonly delivery: OwnerDeliveryRepository;
  readonly loadCurrentContext: (userId: string) => Promise<OwnerCurrentApplicationContext>;
}): Promise<ApproveControlledOwnerPreviewResult> {
  const finish = (status: ApproveControlledOwnerPreviewResult["status"],
    approval: ControlledOwnerV2ProgramApproval | null, reasons: readonly string[]) => Object.freeze({
      status, approval, reasonCodes: Object.freeze([...reasons]), applicationCount: 0 as const });
  if (!input.csrfVerified || !input.explicitConfirmation || !input.idempotencyKey.trim()) {
    return finish("denied", null, [!input.csrfVerified ? "OWNER_CSRF_REQUIRED" :
      !input.explicitConfirmation ? "OWNER_EXPLICIT_CONFIRMATION_REQUIRED" : "OWNER_IDEMPOTENCY_KEY_REQUIRED"]);
  }
  const gate = await input.gate();
  if (!gate.allowed || gate.mode !== "apply" || !gate.userId) return finish("denied", null, [gate.reasonCode]);
  const [preview, enrollment, profile, context] = await Promise.all([
    input.delivery.readPreviewExact(gate.userId, input.previewId),
    input.enrollmentProfiles.readCurrentEnrollment(gate.userId),
    input.enrollmentProfiles.readCurrentProfile(gate.userId),
    input.loadCurrentContext(gate.userId),
  ]);
  if (!preview || !profile) return finish("not_found", null, ["OWNER_EXACT_PREVIEW_AND_PROFILE_REQUIRED"]);
  const profileReadiness = evaluateOwnerProfileReadiness(profile);
  if (!profileReadiness.approvalAllowed) return finish("denied", null, profileReadiness.reasonCodes);
  const previewClassification = resolveOwnerProgramClassification(preview);
  const approvalClassification = input.approvalClassification ?? "ordinary_program";
  const expectedReadiness = previewClassification === "initial_calibration" ?
    "ready_for_initial_calibration_approval" : "ready_for_approval";
  if (previewClassification !== approvalClassification) {
    return finish("denied", null, ["OWNER_APPROVAL_CLASSIFICATION_MISMATCH"]);
  }
  if (preview.previewFingerprint !== input.previewFingerprint || preview.readinessStatus !== expectedReadiness ||
      enrollment?.state !== "active" || enrollment.permission !== "apply_allowed") {
    return finish("denied", null, ["OWNER_PREVIEW_NOT_APPROVABLE"]);
  }
  if (context.activeLegacySession || context.activeV2Session) {
    return finish("conflict", null, ["OWNER_ACTIVE_SESSION_CONFLICT"]);
  }
  const stale = deriveOwnerPreviewStaleness({ preview, currentProfileRevisionId: profile.revisionId,
    currentProductRevisionId: context.currentProductRevisionId,
    currentLegacyProgramRevisionId: context.currentLegacyProgramRevisionId,
    currentEngineVersion: context.currentEngineVersion,
    currentPolicyVersions: context.currentPolicyVersions,
    currentEquipmentSourceRevision: context.currentEquipmentSourceRevision,
    previewEquipmentSourceRevision: profile.equipmentCapabilitySnapshot.sourceRevision,
    currentSafetyState: context.currentSafetyState, deliveryMode: gate.mode });
  if (stale.length) return finish("stale", null, stale);
  const requestFingerprint = digest({ userId: gate.userId, previewId: preview.previewId,
    previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, approvalClassification });
  const priorIdempotency = await input.delivery.readIdempotency(gate.userId, "approve", input.idempotencyKey);
  if (priorIdempotency) {
    if (priorIdempotency.requestFingerprint !== requestFingerprint) {
      return finish("conflict", null, ["OWNER_APPROVAL_IDEMPOTENCY_CONFLICT"]);
    }
    const response = priorIdempotency.responsePayload as { readonly approvalId?: unknown } | null;
    const priorApproval = typeof response?.approvalId === "string"
      ? await input.delivery.readApprovalExact(gate.userId, response.approvalId) : null;
    return priorApproval ? finish("exact_retry", priorApproval, []) :
      finish("conflict", null, ["OWNER_APPROVAL_IDEMPOTENCY_REPLAY_INCOMPLETE"]);
  }
  const approval = buildOwnerProgramApproval({ userId: gate.userId, previewId: preview.previewId,
    previewFingerprint: preview.previewFingerprint, profileRevisionId: preview.profileRevisionId,
    sourceProductRevisionId: preview.sourceProductRevisionId, engineVersion: preview.engineVersion,
    policyVersions: preview.policyVersions, explicitConfirmation: true,
    programClassification: approvalClassification, approvedAt: input.approvedAt });
  const record: OwnerIdempotencyRecord = Object.freeze({ userId: gate.userId, action: "approve",
    idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ approvalId: approval.approvalId }), createdAt: input.approvedAt,
    completedAt: input.approvedAt });
  const written = await input.delivery.appendApprovalIdempotent(approval, record);
  return written === "conflict" ? finish("conflict", null, ["OWNER_APPROVAL_CONFLICT"])
    : finish(written === "exact_retry" ? "exact_retry" : "approved", approval, []);
}

export interface ApplyControlledOwnerApprovalResult {
  readonly status: "applied" | "exact_retry" | "denied" | "not_found" | "stale" | "conflict";
  readonly application: ControlledOwnerV2ProgramApplication | null;
  readonly envelope: OwnerV2ProductProgramEnvelope | null;
  readonly reasonCodes: readonly string[];
}

export async function applyControlledOwnerGetStrongerApproval(input: {
  readonly approvalId: string;
  readonly idempotencyKey: string;
  readonly csrfVerified: boolean;
  readonly appliedAt: string;
  readonly gate: () => Promise<ControlledOwnerRequestGateResult>;
  readonly enrollmentProfiles: OwnerEnrollmentProfileRepository;
  readonly delivery: OwnerDeliveryRepository;
  readonly loadCurrentContext: (userId: string) => Promise<OwnerCurrentApplicationContext>;
}): Promise<ApplyControlledOwnerApprovalResult> {
  const finish = (status: ApplyControlledOwnerApprovalResult["status"],
    application: ControlledOwnerV2ProgramApplication | null, envelope: OwnerV2ProductProgramEnvelope | null,
    reasons: readonly string[]) => Object.freeze({ status, application, envelope,
      reasonCodes: Object.freeze([...reasons]) });
  if (!input.csrfVerified || !input.idempotencyKey.trim()) return finish("denied", null, null,
    [input.csrfVerified ? "OWNER_IDEMPOTENCY_KEY_REQUIRED" : "OWNER_CSRF_REQUIRED"]);
  const gate = await input.gate();
  if (!gate.allowed || gate.mode !== "apply" || !gate.userId) return finish("denied", null, null, [gate.reasonCode]);
  const approval = await input.delivery.readApprovalExact(gate.userId, input.approvalId);
  if (!approval) return finish("not_found", null, null, ["OWNER_EXACT_APPROVAL_REQUIRED"]);
  const [preview, enrollment, profile, context, priorPointer] = await Promise.all([
    input.delivery.readPreviewExact(gate.userId, approval.previewId),
    input.enrollmentProfiles.readCurrentEnrollment(gate.userId),
    input.enrollmentProfiles.readCurrentProfile(gate.userId),
    input.loadCurrentContext(gate.userId),
    input.delivery.readActivePointer(gate.userId),
  ]);
  if (!preview || !profile) return finish("not_found", null, null, ["OWNER_EXACT_PREVIEW_AND_PROFILE_REQUIRED"]);
  const profileReadiness = evaluateOwnerProfileReadiness(profile);
  if (!profileReadiness.approvalAllowed) return finish("denied", null, null, profileReadiness.reasonCodes);
  const previewClassification = resolveOwnerProgramClassification(preview);
  const approvalClassification = resolveOwnerProgramClassification(approval);
  const expectedReadiness = previewClassification === "initial_calibration" ?
    "ready_for_initial_calibration_approval" : "ready_for_approval";
  if (enrollment?.state !== "active" || enrollment.permission !== "apply_allowed" ||
      approval.previewFingerprint !== preview.previewFingerprint ||
      approvalClassification !== previewClassification || preview.readinessStatus !== expectedReadiness) {
    return finish("denied", null, null, ["OWNER_APPLICATION_PRECONDITION_FAILED"]);
  }
  if (context.activeLegacySession || context.activeV2Session) {
    return finish("conflict", null, null, ["OWNER_ACTIVE_SESSION_CONFLICT"]);
  }
  const stale = deriveOwnerPreviewStaleness({ preview, currentProfileRevisionId: profile.revisionId,
    currentProductRevisionId: context.currentProductRevisionId,
    currentLegacyProgramRevisionId: context.currentLegacyProgramRevisionId,
    currentEngineVersion: context.currentEngineVersion, currentPolicyVersions: context.currentPolicyVersions,
    currentEquipmentSourceRevision: context.currentEquipmentSourceRevision,
    previewEquipmentSourceRevision: profile.equipmentCapabilitySnapshot.sourceRevision,
    currentSafetyState: context.currentSafetyState, deliveryMode: gate.mode });
  if (stale.length) return finish("stale", null, null, stale);
  const requestFingerprint = digest({ userId: gate.userId, approvalId: approval.approvalId,
    previewFingerprint: preview.previewFingerprint, programClassification: previewClassification });
  const priorIdempotency = await input.delivery.readIdempotency(gate.userId, "apply", input.idempotencyKey);
  if (priorIdempotency) {
    if (priorIdempotency.requestFingerprint !== requestFingerprint) {
      return finish("conflict", null, null, ["OWNER_APPLICATION_IDEMPOTENCY_CONFLICT"]);
    }
    const response = priorIdempotency.responsePayload as {
      readonly applicationId?: unknown;
      readonly envelopeId?: unknown;
      readonly envelopeRevisionId?: unknown;
    } | null;
    const priorApplication = typeof response?.applicationId === "string"
      ? await input.delivery.readApplicationExact(gate.userId, response.applicationId) : null;
    const priorEnvelope = typeof response?.envelopeId === "string" && typeof response.envelopeRevisionId === "string"
      ? await input.delivery.readEnvelopeExact(gate.userId, response.envelopeId, response.envelopeRevisionId) : null;
    return priorApplication && priorEnvelope ? finish("exact_retry", priorApplication, priorEnvelope, []) :
      finish("conflict", null, null, ["OWNER_APPLICATION_IDEMPOTENCY_REPLAY_INCOMPLETE"]);
  }
  const priorRevision = priorPointer?.revision ?? 0;
  const applicationId = deriveOwnerApplicationId({ userId: gate.userId, approvalId: approval.approvalId,
    previewId: preview.previewId, priorPointerRevision: priorRevision, appliedAt: input.appliedAt });
  const projectionAssignments = preview.productProjection.sessions.flatMap((session) => session.exerciseAssignments);
  const envelope = buildOwnerProgramEnvelope({ userId: gate.userId, previewId: preview.previewId,
    previewFingerprint: preview.previewFingerprint, approvalId: approval.approvalId, applicationId,
    profileRevisionId: preview.profileRevisionId, sourceProductSnapshotId: preview.sourceProductSnapshotId,
    sourceProductRevisionId: preview.sourceProductRevisionId,
    legacyFallbackReference: context.currentLegacyProgramRevisionId,
    engineVersion: preview.engineVersion, policyVersions: preview.policyVersions,
    programSnapshot: preview.completeProgramSnapshot, productProjection: preview.productProjection,
    assignmentIds: projectionAssignments.map((entry) => entry.assignmentId),
    sourceEventIds: projectionAssignments.flatMap((entry) => entry.sourceEventId ? [entry.sourceEventId] : []),
    prescriptionRevisionIds: projectionAssignments.flatMap((entry) =>
      entry.prescriptionRevisionId ? [entry.prescriptionRevisionId] : []),
    weekObjectiveIds: preview.productProjection.weekObjectiveIds,
    practiceModeReferences: ["full", "lighter", "recovery"],
    programClassification: previewClassification,
    calibrationPlan: preview.calibrationPlan ?? null,
    createdAt: input.appliedAt });
  const application = buildOwnerProgramApplication({ userId: gate.userId, approvalId: approval.approvalId,
    previewId: preview.previewId, envelopeId: envelope.envelopeId,
    envelopeRevisionId: envelope.envelopeRevisionId, priorPointerRevision: priorRevision,
    appliedAt: input.appliedAt });
  if (application.applicationId !== applicationId) return finish("conflict", null, null,
    ["OWNER_APPLICATION_IDENTITY_CONFLICT"]);
  const pointer = buildOwnerActiveProgramPointer({ userId: gate.userId, mode: "v2_owner",
    activeApplicationId: application.applicationId,
    legacyFallbackReference: context.currentLegacyProgramRevisionId, revision: priorRevision + 1,
    updatedAt: input.appliedAt,
    provenance: { source: "server_runtime", sourceRefs: [approval.approvalId, application.applicationId] } });
  const auditEvent = buildOwnerDeliveryAuditEvent({ userId: gate.userId,
    action: "owner_v2_program_applied", targetId: application.applicationId, occurredAt: input.appliedAt,
    metadata: Object.freeze({ previewId: preview.previewId, approvalId: approval.approvalId,
      pointerRevision: pointer.revision, legacyPreserved: true }) });
  const idempotency: OwnerIdempotencyRecord = Object.freeze({ userId: gate.userId, action: "apply",
    idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ applicationId: application.applicationId,
      envelopeId: envelope.envelopeId, envelopeRevisionId: envelope.envelopeRevisionId,
      pointerRevision: pointer.revision }),
    createdAt: input.appliedAt, completedAt: input.appliedAt });
  const calibrationCycleRevision = previewClassification === "initial_calibration"
    ? buildInitialOwnerCalibrationCycle({ userId: gate.userId,
      enrollmentRevisionId: enrollment.revisionId, preview, envelope, createdAt: input.appliedAt })
    : null;
  const written = await input.delivery.applyApprovedProgram({ preview, approval, application, envelope,
    pointer, auditEvent, idempotency, expectedPointerRevision: priorRevision, calibrationCycleRevision });
  return written.status === "conflict" ? finish("conflict", null, null, ["OWNER_APPLICATION_TRANSACTION_CONFLICT"])
    : finish(written.status, written.application, written.envelope, []);
}

export function effectiveOwnerProgramMode(input: { readonly deliveryMode: OwnerDeliveryMode;
  readonly pointerMode: "legacy" | "v2_owner" | null }): "legacy" | "v2_owner" {
  return input.deliveryMode === "off" ? "legacy" : input.pointerMode ?? "legacy";
}
