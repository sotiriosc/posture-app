import { createHash } from "node:crypto";
import {
  buildOwnerGenerationCommand,
  buildOwnerProgramPreview,
  evaluateOwnerProfileReadiness,
  runControlledOwnerProductionPipeline,
  stableId,
  uniqueSorted,
  type ControlledOwnerV2ProgramPreview,
  type OwnerDeliveryMode,
  type OwnerPainContext,
  type ProposedOwnerImportFact,
  type TrainingSafetyState,
} from "@praxis/training-engine-v2";
import { mapProductAssessmentReportToV2 } from "../productAssessmentAdapter";
import type { OwnerDeliveryRepository, OwnerEnrollmentProfileRepository, OwnerProductImportAdapter } from "./contracts";
import type { ControlledOwnerRequestGateResult } from "./gate";
import { normalizeProposedOwnerPainRegionFact } from "./productImport";

export interface OwnerGenerationSourceContext {
  readonly sourceProductSnapshotId: string;
  readonly sourceProductRevisionId: string;
  readonly activeLegacyProgramRevisionId: string | null;
  readonly assessmentReport?: Record<string, unknown> | null;
}

export function buildControlledOwnerAssessmentHandoff(input: {
  readonly profileAssessmentReferences: readonly string[];
  readonly profilePainContext: OwnerPainContext;
  readonly proposedProductFacts: readonly ProposedOwnerImportFact[];
  readonly assessmentReport: Record<string, unknown> | null;
  readonly sourceProductRevisionId: string;
  readonly evaluationTime: string;
}) {
  const mapped = mapProductAssessmentReportToV2({ assessment: input.assessmentReport,
    sourceRevision: input.sourceProductRevisionId });
  const confirmed = new Set(input.profileAssessmentReferences);
  const referenceFor = (observationId: string) => `assessment:observation:${observationId}`;
  const confirmedTrace = mapped.mappingTrace.filter((entry) => confirmed.has(referenceFor(entry.sourceObservationId)));
  const confirmedSignalIds = new Set(confirmedTrace.map((entry) => entry.signalId));
  const mappedReferences = new Set(mapped.mappingTrace.map((entry) => referenceFor(entry.sourceObservationId)));
  const painFacts = input.proposedProductFacts.filter((fact) => fact.field === "pain_region");
  const normalizedPainFacts = painFacts.map(normalizeProposedOwnerPainRegionFact);
  const expectedPainFactIds = uniqueSorted(painFacts.map((fact) => fact.factId));
  const confirmedPainFactIds = uniqueSorted(input.profilePainContext.sourceFactIds ?? []);
  const canonicalPainRegionIds = uniqueSorted(normalizedPainFacts.flatMap((fact) => fact ? [fact.regionId] : []));
  const painOwnedObservations = mapped.unresolvedObservations.filter((entry) =>
    entry.reason === "pain_owned_by_pain_state");
  const painOwnershipPresent = painFacts.length > 0 || painOwnedObservations.length > 0 ||
    confirmedPainFactIds.length > 0;
  const painOwnershipReasonCodes = uniqueSorted([
    ...(normalizedPainFacts.some((fact) => fact === null) ? ["OWNER_PAIN_FACT_UNSUPPORTED"] : []),
    ...(painFacts.length > 0 && !input.profilePainContext.sourceRevision
      ? ["OWNER_PAIN_FACT_PROVENANCE_REQUIRED"] : []),
    ...(painFacts.some((fact) => fact.sourceRevision !== input.sourceProductRevisionId) ||
      input.profilePainContext.sourceRevision &&
      input.profilePainContext.sourceRevision !== input.sourceProductRevisionId
      ? ["OWNER_PAIN_FACT_SOURCE_STALE"] : []),
    ...(JSON.stringify(confirmedPainFactIds) !== JSON.stringify(expectedPainFactIds)
      ? ["OWNER_PAIN_FACT_CONFIRMATION_REQUIRED"] : []),
    ...(canonicalPainRegionIds.some((regionId) => !input.profilePainContext.regionIds.includes(regionId))
      ? ["OWNER_PAIN_FACT_CANONICAL_TRANSFER_INCOMPLETE"] : []),
    ...(painOwnedObservations.length > 0 && painFacts.length === 0
      ? ["OWNER_PAIN_FACT_MISSING_FOR_PAIN_OBSERVATION"] : []),
  ]);
  const painTransferComplete = painOwnershipPresent && input.profilePainContext.confirmed &&
    input.profilePainContext.sourceRevision === input.sourceProductRevisionId &&
    painFacts.every((fact) => fact.sourceRevision === input.sourceProductRevisionId) &&
    normalizedPainFacts.every((fact) => fact !== null) &&
    JSON.stringify(confirmedPainFactIds) === JSON.stringify(expectedPainFactIds) &&
    canonicalPainRegionIds.every((regionId) => input.profilePainContext.regionIds.includes(regionId)) &&
    (painOwnedObservations.length === 0 || painFacts.length > 0);
  const effectiveUnresolved = mapped.unresolvedObservations.filter((entry) =>
    entry.reason !== "pain_owned_by_pain_state" || !painTransferComplete);
  const unresolvedReferences = new Set(effectiveUnresolved.flatMap((entry) =>
    entry.sourceObservationId && confirmed.has(referenceFor(entry.sourceObservationId))
      ? [referenceFor(entry.sourceObservationId)] : []));
  for (const reference of confirmed) {
    if (!mappedReferences.has(reference) && !unresolvedReferences.has(reference)) unresolvedReferences.add(reference);
  }
  if (painTransferComplete) {
    for (const entry of painOwnedObservations) {
      if (entry.sourceObservationId) unresolvedReferences.delete(referenceFor(entry.sourceObservationId));
    }
  }
  const painSafetyReviewRequired = painOwnershipPresent && !painTransferComplete;
  const trainingSafety: TrainingSafetyState = painSafetyReviewRequired ? Object.freeze({
    signals: Object.freeze([Object.freeze({
      signalId: stableId("owner-pain-handoff-safety", {
        sourceProductRevisionId: input.sourceProductRevisionId,
        expectedPainFactIds,
        confirmedPainFactIds,
        painOwnedSourceRefs: painOwnedObservations.map((entry) => entry.sourceRef),
      }),
      requestedReviewLevel: "review_required_before_ordinary_training" as const,
      authority: Object.freeze({
        source: "upstream_safety_system" as const,
        sourceRef: `controlled-owner-pain-handoff:${input.sourceProductRevisionId}`,
        evidenceBasis: Object.freeze(uniqueSorted([
          `product-revision:${input.sourceProductRevisionId}`,
          ...painFacts.map((fact) => `product-pain-fact:${fact.factId}`),
          ...confirmedPainFactIds.map((factId) => `profile-pain-fact:${factId}`),
          ...painOwnedObservations.map((entry) => entry.sourceRef),
        ])),
        reportedBy: "controlled_owner_product_import",
        reportedAt: input.evaluationTime,
      }),
      resolution: Object.freeze({ state: "unresolved" as const }),
      notes: Object.freeze(["Typed Product pain information requires explicit owner confirmation and canonical transfer."]),
    })]),
  }) : Object.freeze({ signals: Object.freeze([]) });
  const effectiveMappingStatus = mapped.status === "mapped_with_unresolved_observations" &&
    effectiveUnresolved.length === 0 ? "mapped" : mapped.status;
  return Object.freeze({
    assessment: Object.freeze({
      signals: Object.freeze(mapped.assessment.signals.filter((signal) => confirmedSignalIds.has(signal.id))),
      historicalWeaknesses: Object.freeze([]),
    }),
    sourceProductRevisionId: input.sourceProductRevisionId,
    confirmedAssessmentReferences: Object.freeze([...confirmed].sort()),
    mappingTraceRefs: Object.freeze(confirmedTrace.map((entry) => entry.sourceRef).sort()),
    unresolvedConfirmedReferences: Object.freeze([...unresolvedReferences].sort()),
    mappingStatus: effectiveMappingStatus,
    trainingSafety,
    painOwnership: Object.freeze({
      status: painTransferComplete ? "transferred" as const : painSafetyReviewRequired ? "review_required" as const :
        "not_present" as const,
      expectedPainFactIds: Object.freeze(expectedPainFactIds),
      confirmedPainFactIds: Object.freeze(confirmedPainFactIds),
      canonicalPainRegionIds: Object.freeze(canonicalPainRegionIds),
      reasonCodes: Object.freeze(painOwnershipReasonCodes),
      resolvedAssessmentReferences: Object.freeze(painTransferComplete ? painOwnedObservations.flatMap((entry) =>
        entry.sourceObservationId ? [referenceFor(entry.sourceObservationId)] : []).sort() : []),
      sourceRefs: Object.freeze(uniqueSorted([
        ...painFacts.map((fact) => `product-pain-fact:${fact.factId}`),
        ...painOwnedObservations.map((entry) => entry.sourceRef),
      ])),
    }),
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
    profilePainContext: profile.painContext,
    proposedProductFacts,
    assessmentReport: source.assessmentReport ?? null,
    sourceProductRevisionId: source.sourceProductRevisionId,
    evaluationTime: input.evaluationTime,
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
