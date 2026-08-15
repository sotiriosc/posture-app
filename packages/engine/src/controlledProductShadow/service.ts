import { CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE, deriveControlledProductShadowRunId,
  deriveControlledProductShadowRunRevisionId, validateControlledProductShadowCounterfactualAttribution,
  validateControlledProductShadowRunRevision, type ControlledProductShadowPipelineResult,
  type ControlledProductShadowRunRevision } from "@praxis/training-engine-v2";
import { resolveActiveProgramFromList, stableTrainingStringify } from "../trainingStateModel";
import { compareLegacyProductWithV2Shadow } from "./comparison";
import { CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE,
  type ControlledProductShadowClientTrigger, type ControlledProductShadowMappingBundle,
  type ControlledProductShadowRunRecord, type ControlledProductShadowServiceDependencies,
  type ControlledProductShadowServiceResult } from "./contracts";
import { controlledProductShadowTriggerSemanticFingerprint, createControlledProductShadowTrigger,
  validateControlledProductShadowClientTrigger } from "./identities";
import { collectProductExerciseIds, buildControlledProductShadowMappingBundle,
  createProductExerciseIdentityRegistry } from "./mappings";
import { projectLegacyProgramForControlledShadow } from "./legacyProgramProjection";
import { sanitizeControlledProductShadowObservabilityEvent } from "./observability";
import { buildProductSnapshotReference, buildProductTrainingSnapshotShadowSource,
  verifyControlledProductShadowTriggerReferences } from "./productSnapshotAdapter";
import { controlledProductShadowEligibility } from "./rolloutConfig";

const noop = (disposition: ControlledProductShadowServiceResult["disposition"], status: string):
ControlledProductShadowServiceResult => Object.freeze({ disposition, status, runRevisionId: null,
  clientArtifactCount: 0 });

function nonEvaluatedPipeline(status: ControlledProductShadowPipelineResult["status"],
  unresolved: readonly string[]): ControlledProductShadowPipelineResult {
  return Object.freeze({ status, runType: "mapping_audit_only", artifactReferences: Object.freeze([]),
    unresolvedRequirements: Object.freeze([...new Set(unresolved)].sort()), gate13Status: "not_evaluated",
    phaseStatus: "not_evaluated", longitudinalStatus: "not_evaluated", orchestrationStatus: "not_evaluated",
    productMutationApplied: false, applicationApplied: false });
}

function runRevision(input: {
  readonly trigger: ReturnType<typeof createControlledProductShadowTrigger>;
  readonly sourceRevisionId: string;
  readonly pipeline: ControlledProductShadowPipelineResult;
  readonly comparison: ReturnType<typeof compareLegacyProductWithV2Shadow> | null;
  readonly evaluationTime: string;
  readonly basedOnRunRevisionId: string | null;
}): ControlledProductShadowRunRevision {
  const runId = deriveControlledProductShadowRunId({ contract: CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE,
    athleteId: input.trigger.athleteId, productStateLineage: input.sourceRevisionId,
    triggerFamily: input.trigger.triggerKind, anchorEntityId: input.trigger.anchorProgramId ??
      input.trigger.anchorSessionId, runAttemptId: input.trigger.clientOperationId });
  const semantic = Object.freeze({ shadowContract: CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE, runId,
    basedOnRunRevisionId: input.basedOnRunRevisionId, finalForRunAttempt: true as const,
    athleteId: input.trigger.athleteId, runAttemptId: input.trigger.clientOperationId,
    runType: input.pipeline.runType, status: input.pipeline.status,
    productSnapshotRevisionId: input.sourceRevisionId, triggerRevisionId: input.trigger.triggerRevisionId,
    adapterReferences: Object.freeze(["PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE@1.0.0",
      "PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER@1.0.0", "PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION@1.0.0",
      "PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP@1.0.0"]),
    policyReferences: Object.freeze(["CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1_INTERNAL_ALLOWLIST@1.0.0",
      "CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1@1.0.0"]),
    artifactReferences: input.pipeline.artifactReferences, comparison: input.comparison,
    evaluationTime: input.evaluationTime, productMutationApplied: false as const,
    applicationApplied: false as const, deliveredToUser: false as const, performed: false as const });
  return Object.freeze({ ...semantic, runRevisionId: deriveControlledProductShadowRunRevisionId(semantic),
    provenance: Object.freeze(["controlled-product-shadow:counterfactual-only",
      "legacy-product-output:sole-user-authority"]) });
}

export function createControlledProductShadowService(
  dependencies: ControlledProductShadowServiceDependencies,
) {
  if (dependencies.dataMinimizationPolicy.reference.contractId !==
      CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REFERENCE.contractId ||
      !dependencies.dataMinimizationPolicy.structuredReferencesOnly) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_REQUIRED");
  }
  const emit = async (event: Parameters<typeof sanitizeControlledProductShadowObservabilityEvent>[0]) => {
    try {
      await dependencies.observability.emit(sanitizeControlledProductShadowObservabilityEvent(event));
    } catch {
      // Observability is explicitly best-effort and cannot alter shadow or Product behavior.
    }
  };
  return Object.freeze({ run: async (input: { readonly clientTrigger: ControlledProductShadowClientTrigger;
    readonly authenticatedUserId: string | null; readonly appSurface: "consumer" | "gyms";
    readonly evaluationTime: string }): Promise<ControlledProductShadowServiceResult> => {
    await emit({ name: "trigger_received", operationTime: input.evaluationTime,
      athleteId: input.authenticatedUserId ?? undefined, status: "received" });
    const eligibility = controlledProductShadowEligibility({ policy: dependencies.policy,
      authenticatedUserId: input.authenticatedUserId, appSurface: input.appSurface });
    if (eligibility === "off") {
      await emit({ name: "trigger_noop_off", operationTime: input.evaluationTime, status: "shadow_off" });
      return noop("noop_off", "shadow_off");
    }
    if (eligibility === "ineligible" || !input.authenticatedUserId) {
      await emit({ name: "trigger_noop_ineligible", operationTime: input.evaluationTime,
        status: "shadow_not_eligible" });
      return noop("noop_ineligible", "shadow_not_eligible");
    }
    const triggerReasons = validateControlledProductShadowClientTrigger(input.clientTrigger);
    if (triggerReasons.length) return noop("malformed", triggerReasons[0]!);
    const trigger = createControlledProductShadowTrigger({ clientTrigger: input.clientTrigger,
      athleteId: input.authenticatedUserId, appSurface: input.appSurface });
    const triggerFingerprint = controlledProductShadowTriggerSemanticFingerprint(trigger);
    const admission = await dependencies.repository.admitTrigger(trigger, triggerFingerprint,
      dependencies.resourcePolicy, input.evaluationTime);
    if (admission.state === "idempotency_conflict") return noop("conflict", "shadow_idempotency_conflict");
    if (admission.state === "resource_limit") {
      await emit({ name: "resource_limit", operationTime: input.evaluationTime, athleteId: trigger.athleteId,
        triggerId: trigger.triggerId, status: "shadow_resource_limit" });
      return noop("resource_limit", "shadow_resource_limit");
    }
    if (admission.state === "exact_retry") {
      await emit({ name: "idempotent_retry", operationTime: input.evaluationTime, athleteId: trigger.athleteId,
        triggerId: trigger.triggerId, status: "shadow_idempotent_prior_result" });
      return Object.freeze({ disposition: "idempotent_prior", status: "shadow_idempotent_prior_result",
        runRevisionId: admission.prior?.runRevision.runRevisionId ?? null, clientArtifactCount: 0 });
    }

    const monotonicNowMs = dependencies.monotonicNowMs ?? Date.now;
    const evaluationStartedAtMs = monotonicNowMs();
    const snapshot = await dependencies.loadProductSnapshot(trigger.athleteId);
    const snapshotBytes = stableTrainingStringify(snapshot).length;
    if (snapshotBytes > dependencies.resourcePolicy.maximumProductSnapshotBytes ||
        (snapshot.sessions?.length ?? 0) > dependencies.resourcePolicy.maximumSessions ||
        (snapshot.exerciseLogs?.length ?? 0) > dependencies.resourcePolicy.maximumLogs) {
      await emit({ name: "resource_limit", operationTime: input.evaluationTime, athleteId: trigger.athleteId,
        triggerId: trigger.triggerId, status: "shadow_resource_limit" });
      return noop("resource_limit", "shadow_resource_limit");
    }
    const reference = buildProductSnapshotReference(snapshot);
    const settlement = verifyControlledProductShadowTriggerReferences({ trigger, snapshot, reference });
    await emit({ name: settlement === "product_snapshot_current" ? "product_snapshot_loaded" :
      "product_snapshot_pending_sync", operationTime: input.evaluationTime, athleteId: trigger.athleteId,
      triggerId: trigger.triggerId, status: settlement });
    const questionnaire = snapshot.questionnaire && typeof snapshot.questionnaire === "object" ?
      snapshot.questionnaire : null;
    const assessment = snapshot.assessment && typeof snapshot.assessment === "object" ? snapshot.assessment : null;
    const mappings: ControlledProductShadowMappingBundle = buildControlledProductShadowMappingBundle({
      athleteId: trigger.athleteId, questionnaire, assessment, prefs: snapshot.prefs ?? null,
      productStateRevision: reference.productStateRevisionFingerprint });
    const active = resolveActiveProgramFromList(snapshot.programs ?? [], undefined).program;
    const identityRegistry = createProductExerciseIdentityRegistry(collectProductExerciseIds(active,
      snapshot.prefs ?? null));
    const legacyProjection = active ? projectLegacyProgramForControlledShadow({ program: active,
      identityRegistry }) : null;
    const unresolved = [...mappings.unresolvedRequirements, ...(legacyProjection?.unresolvedMappings ?? []),
      ...(settlement === "product_snapshot_current" ? [] : [settlement])];
    const source = buildProductTrainingSnapshotShadowSource({ athleteId: trigger.athleteId, trigger, snapshot,
      reference, evaluationTime: input.evaluationTime, unresolvedMappings: unresolved });
    let pipeline: ControlledProductShadowPipelineResult;
    if (dependencies.policy.mode === "capture_only_internal_allowlist") {
      pipeline = nonEvaluatedPipeline("shadow_outcome_mapping_restricted", unresolved);
    } else if (settlement !== "product_snapshot_current") {
      pipeline = nonEvaluatedPipeline(settlement === "product_snapshot_conflict" ? "shadow_source_conflict" :
        "shadow_source_pending_sync", unresolved);
    } else {
      await emit({ name: "v2_pipeline_started", operationTime: input.evaluationTime,
        athleteId: trigger.athleteId, triggerId: trigger.triggerId, status: "started" });
      try {
        pipeline = await dependencies.pipeline.evaluate({ athleteId: trigger.athleteId,
          source, mappings, legacyProjection, evaluationTime: input.evaluationTime });
      } catch (error) {
        pipeline = nonEvaluatedPipeline("shadow_failed", [`V2_PIPELINE_FAILED:${error instanceof Error ?
          error.name : "UnknownError"}`]);
      }
      await emit({ name: pipeline.status === "shadow_failed" ? "v2_pipeline_failed" :
        pipeline.status.includes("incomplete") ? "v2_pipeline_incomplete" : "v2_pipeline_completed",
      operationTime: input.evaluationTime, athleteId: trigger.athleteId, triggerId: trigger.triggerId,
      status: pipeline.status, reasonCodes: pipeline.unresolvedRequirements });
    }
    const searchUnitsConsumed = pipeline.artifactReferences.length;
    let wallClockElapsedMs = Math.max(0, monotonicNowMs() - evaluationStartedAtMs);
    let resourceLimitReached = searchUnitsConsumed > dependencies.resourcePolicy.maximumSearchUnits ||
      wallClockElapsedMs > dependencies.resourcePolicy.wallClockBudgetMs;
    if (resourceLimitReached) {
      pipeline = nonEvaluatedPipeline("shadow_resource_limit", [
        ...(searchUnitsConsumed > dependencies.resourcePolicy.maximumSearchUnits ?
          ["CONTROLLED_PRODUCT_SHADOW_SEARCH_UNIT_LIMIT_REACHED"] : []),
        ...(wallClockElapsedMs > dependencies.resourcePolicy.wallClockBudgetMs ?
          ["CONTROLLED_PRODUCT_SHADOW_WALL_CLOCK_LIMIT_REACHED"] : []),
      ]);
    }
    const counterfactual = validateControlledProductShadowCounterfactualAttribution({
      deliveredLegacyProgramId: legacyProjection?.programId ?? null, shadowProgramId: null,
      productPerformanceProgramId: legacyProjection?.programId ?? null,
      legacyExerciseLogPrescriptionRevisionId: null, legacySessionSequenceRevisionId: null,
      shadowSourceEventCompleted: false, unmappedLegacyToleranceCreditedToShadow: false,
      productOutcomeAuthorizesShadowAdaptation: false, outcomeSuperiorityClaimed: false });
    if (!counterfactual.valid) pipeline = nonEvaluatedPipeline("shadow_failed", counterfactual.reasonCodes);
    const provisionalRunId = deriveControlledProductShadowRunId({ contract: CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE,
      athleteId: trigger.athleteId, productStateLineage: source.sourceSnapshotRevisionId,
      triggerFamily: trigger.triggerKind, anchorEntityId: trigger.anchorProgramId ?? trigger.anchorSessionId,
      runAttemptId: trigger.clientOperationId });
    const comparison = dependencies.policy.mode === "capture_only_internal_allowlist" ? null :
      compareLegacyProductWithV2Shadow({ runId: provisionalRunId, legacyProjection, pipeline });
    const prior = await dependencies.repository.findLatestRun(trigger.athleteId, trigger.anchorProgramId);
    const revision = runRevision({ trigger, sourceRevisionId: source.sourceSnapshotRevisionId, pipeline,
      comparison, evaluationTime: input.evaluationTime, basedOnRunRevisionId: prior?.runRevision.runRevisionId ?? null });
    const revisionReasons = validateControlledProductShadowRunRevision(revision);
    if (revisionReasons.length) return noop("failed", revisionReasons[0]!);
    const reloaded = await dependencies.loadProductSnapshot(trigger.athleteId);
    const reloadedReference = buildProductSnapshotReference(reloaded);
    wallClockElapsedMs = Math.max(wallClockElapsedMs, monotonicNowMs() - evaluationStartedAtMs);
    if (wallClockElapsedMs > dependencies.resourcePolicy.wallClockBudgetMs) {
      resourceLimitReached = true;
      pipeline = nonEvaluatedPipeline("shadow_resource_limit",
        [...pipeline.unresolvedRequirements, "CONTROLLED_PRODUCT_SHADOW_WALL_CLOCK_LIMIT_REACHED"]);
    } else if (reloadedReference.productStateRevisionFingerprint !== reference.productStateRevisionFingerprint ||
        controlledProductShadowEligibility({ policy: dependencies.policy, authenticatedUserId: trigger.athleteId,
          appSurface: trigger.appSurface }) !== "eligible") {
      pipeline = nonEvaluatedPipeline("shadow_source_conflict", ["PRODUCT_SNAPSHOT_CHANGED_BEFORE_PERSISTENCE"]);
    }
    const finalRevision = pipeline.status === revision.status ? revision :
      runRevision({ trigger, sourceRevisionId: source.sourceSnapshotRevisionId, pipeline, comparison: null,
        evaluationTime: input.evaluationTime, basedOnRunRevisionId: prior?.runRevision.runRevisionId ?? null });
    const record: ControlledProductShadowRunRecord = Object.freeze({ requestSemanticFingerprint: triggerFingerprint,
      trigger, productSnapshotReference: reference, source, mappings, legacyProjection, pipelineResult: pipeline,
      comparison: finalRevision.comparison, runRevision: finalRevision,
      resourceTrace: Object.freeze({ snapshotBytes, sessionsConsidered: snapshot.sessions?.length ?? 0,
        logsConsidered: snapshot.exerciseLogs?.length ?? 0, searchUnitsConsumed, wallClockElapsedMs,
        limitReached: resourceLimitReached }), failureCodes: Object.freeze(pipeline.status === "shadow_failed" ?
        pipeline.unresolvedRequirements : []), audit: Object.freeze({
        auditEventId: `shadow-audit:${finalRevision.runRevisionId}`, operationTime: input.evaluationTime,
        resultState: pipeline.status, provenance: Object.freeze(["controlled-product-shadow:append-only-audit"]) }) });
    await dependencies.repository.persistRun(record);
    await emit({ name: "run_persisted", operationTime: input.evaluationTime, athleteId: trigger.athleteId,
      triggerId: trigger.triggerId, runRevisionId: finalRevision.runRevisionId, status: pipeline.status });
    return Object.freeze({ disposition: pipeline.status === "shadow_resource_limit" ? "resource_limit" : "accepted",
      status: pipeline.status,
      runRevisionId: finalRevision.runRevisionId, clientArtifactCount: 0 });
  } });
}
