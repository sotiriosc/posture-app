import { createHash } from "node:crypto";
import {
  buildOwnerGenerationCommand,
  buildOwnerProgramPreview,
  evaluateOwnerProfileReadiness,
  runControlledOwnerProductionPipeline,
  type ControlledOwnerV2ProgramPreview,
  type OwnerDeliveryMode,
} from "@praxis/training-engine-v2";
import { mapProductAssessmentReportToV2 } from "../productAssessmentAdapter";
import type { OwnerDeliveryRepository, OwnerEnrollmentProfileRepository, OwnerProductImportAdapter } from "./contracts";
import type { ControlledOwnerRequestGateResult } from "./gate";

export interface OwnerGenerationSourceContext {
  readonly sourceProductSnapshotId: string;
  readonly sourceProductRevisionId: string;
  readonly activeLegacyProgramRevisionId: string | null;
  readonly assessmentReport?: Record<string, unknown> | null;
}

export function buildControlledOwnerAssessmentHandoff(input: {
  readonly profileAssessmentReferences: readonly string[];
  readonly assessmentReport: Record<string, unknown> | null;
  readonly sourceProductRevisionId: string;
}) {
  const mapped = mapProductAssessmentReportToV2({ assessment: input.assessmentReport,
    sourceRevision: input.sourceProductRevisionId });
  const confirmed = new Set(input.profileAssessmentReferences);
  const referenceFor = (observationId: string) => `assessment:observation:${observationId}`;
  const confirmedTrace = mapped.mappingTrace.filter((entry) => confirmed.has(referenceFor(entry.sourceObservationId)));
  const confirmedSignalIds = new Set(confirmedTrace.map((entry) => entry.signalId));
  const mappedReferences = new Set(mapped.mappingTrace.map((entry) => referenceFor(entry.sourceObservationId)));
  const unresolvedReferences = new Set(mapped.unresolvedObservations.flatMap((entry) =>
    entry.sourceObservationId && confirmed.has(referenceFor(entry.sourceObservationId))
      ? [referenceFor(entry.sourceObservationId)] : []));
  for (const reference of confirmed) {
    if (!mappedReferences.has(reference) && !unresolvedReferences.has(reference)) unresolvedReferences.add(reference);
  }
  return Object.freeze({
    assessment: Object.freeze({
      signals: Object.freeze(mapped.assessment.signals.filter((signal) => confirmedSignalIds.has(signal.id))),
      historicalWeaknesses: Object.freeze([]),
    }),
    sourceProductRevisionId: input.sourceProductRevisionId,
    confirmedAssessmentReferences: Object.freeze([...confirmed].sort()),
    mappingTraceRefs: Object.freeze(confirmedTrace.map((entry) => entry.sourceRef).sort()),
    unresolvedConfirmedReferences: Object.freeze([...unresolvedReferences].sort()),
    mappingStatus: mapped.status,
    opaqueTextConsumed: false as const,
    diagnosticInferenceCount: 0 as const,
  });
}

export interface GenerateControlledOwnerPreviewResult {
  readonly status:
    | "generated"
    | "exact_retry"
    | "gate_denied"
    | "enrollment_required"
    | "profile_not_ready"
    | "generation_blocked"
    | "conflict";
  readonly preview: ControlledOwnerV2ProgramPreview | null;
  readonly mode: OwnerDeliveryMode;
  readonly reasonCodes: readonly string[];
  readonly productShadowCallCount: 0;
  readonly legacyGenerateProgramCallCount: 0;
}

export function resolveOwnerPreviewReadinessStatus(input: {
  readonly programSemanticCompletenessSatisfied: boolean;
  readonly profileApprovalAllowed: boolean;
}): "ready_for_approval" | "preview_only_unknown_duration" | "blocked" {
  if (!input.programSemanticCompletenessSatisfied) return "blocked";
  return input.profileApprovalAllowed ? "ready_for_approval" : "preview_only_unknown_duration";
}

export async function generateControlledOwnerGetStrongerPreview(input: {
  readonly requestedAt: string;
  readonly evaluationTime: string;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly idempotencyKey: string;
  readonly gate: () => Promise<ControlledOwnerRequestGateResult>;
  readonly enrollmentProfiles: OwnerEnrollmentProfileRepository;
  readonly delivery: OwnerDeliveryRepository;
  readonly productImport: OwnerProductImportAdapter;
  readonly loadSourceContext: (userId: string) => Promise<OwnerGenerationSourceContext>;
}): Promise<GenerateControlledOwnerPreviewResult> {
  const gate = await input.gate();
  const result = (status: GenerateControlledOwnerPreviewResult["status"],
    preview: ControlledOwnerV2ProgramPreview | null, reasonCodes: readonly string[]) => Object.freeze({
      status, preview, mode: gate.mode, reasonCodes: Object.freeze([...reasonCodes]),
      productShadowCallCount: 0 as const, legacyGenerateProgramCallCount: 0 as const });
  if (!gate.allowed || !gate.userId) return result("gate_denied", null, [gate.reasonCode]);
  if (!input.idempotencyKey.trim()) return result("conflict", null, ["OWNER_PREVIEW_IDEMPOTENCY_KEY_REQUIRED"]);
  const enrollment = await input.enrollmentProfiles.readCurrentEnrollment(gate.userId);
  if (!enrollment || enrollment.state !== "active" || !enrollment.explicitConsent) {
    return result("enrollment_required", null, ["OWNER_ACTIVE_ENROLLMENT_REQUIRED"]);
  }
  const profile = await input.enrollmentProfiles.readCurrentProfile(gate.userId);
  if (!profile) return result("profile_not_ready", null, ["OWNER_CONFIRMED_PROFILE_REQUIRED"]);
  const readiness = evaluateOwnerProfileReadiness(profile);
  if (!readiness.previewAllowed) return result("profile_not_ready", null, readiness.reasonCodes);
  const [source, proposedProductFacts] = await Promise.all([
    input.loadSourceContext(gate.userId),
    input.productImport.loadProposedFacts(gate.userId),
  ]);
  const assessmentHandoff = buildControlledOwnerAssessmentHandoff({
    profileAssessmentReferences: profile.assessmentReferences,
    assessmentReport: source.assessmentReport ?? null,
    sourceProductRevisionId: source.sourceProductRevisionId,
  });
  const command = buildOwnerGenerationCommand({ userId: gate.userId,
    enrollmentRevisionId: enrollment.revisionId, profileRevisionId: profile.revisionId,
    sourceProductSnapshotId: source.sourceProductSnapshotId,
    sourceProductRevisionId: source.sourceProductRevisionId,
    activeLegacyProgramRevisionId: source.activeLegacyProgramRevisionId,
    engineVersion: input.engineVersion, policyVersions: input.policyVersions,
    evaluationTime: input.evaluationTime, requestedAt: input.requestedAt });
  const pipeline = runControlledOwnerProductionPipeline({ command, profile, proposedProductFacts,
    assessmentHandoff });
  if (pipeline.status !== "complete" || !pipeline.projection) {
    return result("generation_blocked", null, pipeline.unresolvedFacts);
  }
  const preview = buildOwnerProgramPreview({ userId: gate.userId, generationCommandId: command.commandId,
    profileId: profile.profileId, profileRevisionId: profile.revisionId,
    sourceProductSnapshotId: source.sourceProductSnapshotId,
    sourceProductRevisionId: source.sourceProductRevisionId,
    activeLegacyProgramRevisionId: source.activeLegacyProgramRevisionId,
    engineVersion: input.engineVersion, policyVersions: input.policyVersions,
    completeProgramSnapshot: pipeline.stages, productProjection: pipeline.projection,
    unresolvedFacts: pipeline.unresolvedFacts,
    readinessStatus: resolveOwnerPreviewReadinessStatus({
      programSemanticCompletenessSatisfied: pipeline.programSemanticCompletenessSatisfied,
      profileApprovalAllowed: readiness.approvalAllowed && pipeline.approvalAllowed }),
    safetyState: profile.trainingSafety, createdAt: input.requestedAt });
  const requestFingerprint = createHash("sha256").update(JSON.stringify({ userId: gate.userId,
    enrollmentRevisionId: enrollment.revisionId, profileRevisionId: profile.revisionId,
    sourceProductRevisionId: source.sourceProductRevisionId, engineVersion: input.engineVersion,
    policyVersions: input.policyVersions })).digest("hex");
  const priorIdempotency = await input.delivery.readIdempotency(gate.userId, "preview", input.idempotencyKey);
  if (priorIdempotency) {
    if (priorIdempotency.requestFingerprint !== requestFingerprint) {
      return result("conflict", null, ["OWNER_PREVIEW_IDEMPOTENCY_CONFLICT"]);
    }
    const response = priorIdempotency.responsePayload as { readonly previewId?: unknown } | null;
    const priorPreview = typeof response?.previewId === "string"
      ? await input.delivery.readPreviewExact(gate.userId, response.previewId) : null;
    return priorPreview ? result("exact_retry", priorPreview, []) :
      result("conflict", null, ["OWNER_PREVIEW_IDEMPOTENCY_REPLAY_INCOMPLETE"]);
  }
  const appended = await input.delivery.appendPreviewIdempotent(preview, Object.freeze({ userId: gate.userId,
    action: "preview" as const, idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ previewId: preview.previewId }), createdAt: input.requestedAt,
    completedAt: input.requestedAt }));
  return appended === "conflict" ? result("conflict", null, ["OWNER_PREVIEW_PERSISTENCE_CONFLICT"])
    : result(appended === "exact_retry" ? "exact_retry" : "generated", preview, []);
}
