import {
  ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1,
  ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
  ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1,
  PRODUCTION_ADAPTATION_APPLICATION_OWNER_REGISTRY_REFERENCE,
  createProductionAdaptationApplicationOwnerRegistry,
  createProductionCandidateComposerApplicationOwnerPort,
  createProductionPhaseContinuityApplicationOwnerPort,
  createProductionPrescriptionApplicationOwnerPort,
  createProductionProductHumanApplicationOwnerPort,
  createProductionTrainingSafetyApplicationOwnerPort,
  createProductionWeekApplicationOwnerPort,
  deriveAdaptationApplicationOrchestrationRequestId,
  deriveAdaptationApplicationOrchestrationRequestRevisionId,
  deriveAdaptationApplicationOwnerResultFingerprint,
  productionLongitudinalApplicationOwner,
  type ProductionAdaptationApplicationOrchestrationDependencies,
  type ProductionAdaptationApplicationOrchestrationInput,
  type ProductionAdaptationApplicationOrchestrationRequest,
  type ProductionAdaptationApplicationOwnerPortFamily,
  type ProductionAdaptationApplicationOwnerResult,
  type ProductionLongitudinalAction,
  type ProductionLongitudinalAdaptationActionDirective,
  type ProductionLongitudinalPrescriptionDimension,
  type ProductionPhaseProgramSnapshot,
} from "../../src";

export const ORCHESTRATION_EVALUATION_TIME = "2026-08-15T12:00:00.000-04:00";

export function orchestrationProgramSnapshot(revision = "program-revision-1",
  semanticResponsibilityKey = "target-semantics-1"): ProductionPhaseProgramSnapshot {
  return Object.freeze({ snapshotContract: Object.freeze({ contractId: "PRODUCTION_PHASE_PROGRAM_SNAPSHOT",
    contractVersion: "1.0.0" }), snapshotId: "program-1", snapshotRevisionId: revision,
  basedOnRevisionId: revision === "program-revision-1" ? null : "program-revision-1", athleteId: "athlete-1",
  planningHorizonId: "horizon-1", weeklyIntentId: "intent-1", weekAllocationPlanId: "week-plan-1",
  phaseId: "phase_1", phaseStateId: "phase-state-1", phaseStateRevisionId: "phase-state-revision-1",
  phaseContextValid: true, sourceSnapshotId: "source-1", sourceSnapshotRevisionId: "source-revision-1",
  postPrescriptionWeekValidationId: "gate13-1", postPrescriptionWeekValidationRevisionId: "gate13-revision-1",
  finalValidationStatus: "valid", gate13Valid: true, entities: Object.freeze([
    Object.freeze({ kind: "prescription", entityId: "target-1", semanticResponsibilityKey,
      sessionId: "session-1", exerciseId: "exercise-1", sequenceIndex: 1, section: "main",
      active: true, sourceRefs: Object.freeze([revision]) }),
    Object.freeze({ kind: "session", entityId: "session-1", semanticResponsibilityKey: "session-semantics",
      sessionId: "session-1", exerciseId: null, sequenceIndex: null, section: null,
      active: true, sourceRefs: Object.freeze(["intent-1"]) }),
  ]), productiveAnchors: Object.freeze([
    Object.freeze({ exerciseId: "anchor-1", activeNeedIds: Object.freeze(["need-anchor"]),
      classification: "anchor", productive: true, equipmentLost: false, explicitlyBlocked: false,
      repeatedAdverseEvidence: false, sourceRefs: Object.freeze(["anchor-evidence"]) }),
  ]), supportingContinuity: Object.freeze([]),
  finalPrescriptionRefs: Object.freeze([{ prescriptionId: "prescription-1", revisionId: revision }]),
  finalSequenceRefs: Object.freeze([{ sequencePlanId: "sequence-1", revisionId: "sequence-revision-1" }]),
  unresolvedPolicies: Object.freeze([]), executionFeasibilityState: "executable",
  completedEvidenceInferred: false, evaluationTime: ORCHESTRATION_EVALUATION_TIME,
  provenance: Object.freeze(["application-orchestration-fixture:program"]) } as ProductionPhaseProgramSnapshot);
}

const DIMENSIONS: Readonly<Partial<Record<ProductionLongitudinalAction,
  readonly ProductionLongitudinalPrescriptionDimension[]>>> = Object.freeze({
  progress_prescription_axis: Object.freeze(["load"] as const),
  regress_prescription_axis: Object.freeze(["load"] as const),
  prescription_modification_review: Object.freeze(["side"] as const),
});

export function orchestrationDirective(action: ProductionLongitudinalAction = "keep_current"):
ProductionLongitudinalAdaptationActionDirective {
  const dimensions = DIMENSIONS[action] ?? Object.freeze([]);
  return Object.freeze({ directiveId: `directive-${action}`, decisionId: `decision-${action}`,
    decisionRevisionId: `decision-revision-${action}`, targetId: "target-1", targetScope: "exact_realization",
    action, selectedAxis: action === "progress_prescription_axis" || action === "regress_prescription_axis" ?
      "load" : null, implicatedPrescriptionDimensions: dimensions,
    evidenceSourceRecordRevisions: Object.freeze(["source-record-revision-1"]),
    sourceExposureEventIds: Object.freeze(["source-event-1"]), reasonCodes: Object.freeze(["FIXTURE_FINAL_DIRECTIVE"]),
    actionOwner: "longitudinal_adaptation", downstreamApplicationOwner: productionLongitudinalApplicationOwner(action),
    requiredFuturePolicyReferences: Object.freeze([]), currentContinuityState: "productive_continuity",
    unresolvedBlockers: Object.freeze([]), reviewState: action === "owner_review_required" ? "review_required" :
      action === "no_action_insufficient_evidence" ? "insufficient_evidence" : "authorized_unapplied",
    decisionAuthorized: action !== "owner_review_required" && action !== "no_action_insufficient_evidence",
    applicationApplied: false, provenance: Object.freeze(["application-orchestration-fixture:directive"]) });
}

export function orchestrationRequest(directive = orchestrationDirective(), mode:
ProductionAdaptationApplicationOrchestrationRequest["mode"] = "build_shadow_candidate"):
ProductionAdaptationApplicationOrchestrationRequest {
  const owner = productionLongitudinalApplicationOwner(directive.action) as
    ProductionAdaptationApplicationOrchestrationRequest["requestedOwner"];
  const port = orchestrationOwnerPorts().find((entry) => entry.owner === owner &&
    entry.supportedActions.includes(directive.action))!;
  const base = { orchestrationContract: ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE, mode,
    requestId: "", requestRevisionId: "", basedOnRequestRevisionId: null,
    orchestrationAttemptId: `orchestration-attempt-${directive.action}`, athleteId: "athlete-1",
    authenticatedPrincipalOrServiceId: "principal-1", longitudinalDecisionId: directive.decisionId,
    longitudinalDecisionRevisionId: directive.decisionRevisionId, directiveId: directive.directiveId,
    directiveRevisionId: `directive-revision-${directive.action}`, targetId: directive.targetId,
    targetScope: directive.targetScope, expectedCurrentRevisions: Object.freeze({
      sourceSnapshotRevisionId: "source-revision-1", programSnapshotRevisionId: "program-revision-1",
      weekSourceSnapshotRevisionId: "week-source-revision-1", weekHorizonRevisionId: "horizon-revision-1",
      weeklyIntentRevisionId: "intent-revision-1", weekPlanRevisionId: "week-plan-revision-1",
      prescriptionRevisionId: "prescription-revision-1", sequenceRevisionId: "sequence-revision-1",
      phaseStateRevisionId: "phase-state-revision-1", phaseResultRevisionId: "phase-result-revision-1",
      safetySnapshotRevisionId: "safety-revision-1" }), requestedOwner: owner,
    ownerPortReference: port.contractReference, requestedAppliedDimensions: directive.implicatedPrescriptionDimensions,
    confirmationState: (["keep_current", "repeat_for_confirmation", "hold_current_prescription",
      "no_action_insufficient_evidence"].includes(directive.action) ? "not_required_no_change" :
      "shadow_authorized_live_confirmation_absent") as ProductionAdaptationApplicationOrchestrationRequest["confirmationState"],
    idempotencyKey: `idempotency-${directive.action}`, evaluationTime: ORCHESTRATION_EVALUATION_TIME,
    provenance: Object.freeze(["application-orchestration-fixture:request"]) };
  const requestId = deriveAdaptationApplicationOrchestrationRequestId({
    orchestrationContract: base.orchestrationContract, athleteId: base.athleteId,
    directiveId: base.directiveId, targetId: base.targetId,
    orchestrationAttemptId: base.orchestrationAttemptId,
  });
  const withId = { ...base, requestId };
  const { requestRevisionId: _revision, provenance: _provenance, ...revisionInput } = withId;
  void [_revision, _provenance];
  return Object.freeze({ ...withId,
    requestRevisionId: deriveAdaptationApplicationOrchestrationRequestRevisionId(revisionInput) });
}

export function orchestrationInput(action: ProductionLongitudinalAction = "keep_current",
  mode: ProductionAdaptationApplicationOrchestrationRequest["mode"] = "build_shadow_candidate"):
ProductionAdaptationApplicationOrchestrationInput {
  const directive = orchestrationDirective(action);
  const request = orchestrationRequest(directive, mode);
  return Object.freeze({ request, directive, preconditionSnapshot: Object.freeze({
    directiveFinalAndActive: true, decisionFinalAndActive: true, targetStillActive: true,
    actualCurrentRevisions: request.expectedCurrentRevisions, newerConflictingSourceRecordAbsent: true,
    newerLongitudinalDecisionForTargetAbsent: true, requiredPolicyVersionsAvailable: true,
    ownerPortAvailable: true, shadowAuthorizationPresent: true, liveConfirmationAbsentOrNotApplicable: true,
    idempotencyKeyUnused: true, safetyAllowsMaterialOwnerCall: true, evaluationTimeValid: true }),
  currentProgramSnapshot: orchestrationProgramSnapshot(), currentWeekPlan: null, currentPhaseResult: null,
  entityMappings: Object.freeze([{ currentEntityId: "target-1", proposedEntityId: "target-1" }]) });
}

function unresolvedResult(status: ProductionAdaptationApplicationOwnerResult["status"],
  invocation: Parameters<NonNullable<ProductionAdaptationApplicationOwnerPortFamily["invoke"]>>[0]) {
  const directive = invocation.input.directive;
  return { status, currentEntityRevisions: {}, proposedEntityRevisions: {}, changedTargetIds: Object.freeze([]),
    changedDimensions: Object.freeze([]), unchangedEntityIds: Object.freeze([]),
    unresolvedRequirements: Object.freeze(["EXPLICIT_OWNER_RESOLUTION_REQUIRED"]),
    reasonCodes: Object.freeze(["EXPLICIT_OWNER_RESOLUTION_REQUIRED"]), selectedAxis: directive.selectedAxis,
    proposedProgramSnapshot: null, proposedWeekPlan: null, proposedPhaseResult: null,
    candidateSelectionReopened: false, weekReallocationClaimed: false, phaseReviewClaimed: false,
    actionPersisted: true, provenance: Object.freeze(["application-orchestration-fixture:unresolved-owner"]) } as const;
}

export function orchestrationOwnerPorts(): readonly ProductionAdaptationApplicationOwnerPortFamily[] {
  return Object.freeze([
    createProductionPrescriptionApplicationOwnerPort((invocation) =>
      unresolvedResult("prescription_resolution_required", invocation)),
    createProductionCandidateComposerApplicationOwnerPort((invocation) =>
      unresolvedResult("candidate_review_required", invocation)),
    createProductionWeekApplicationOwnerPort(),
    createProductionPhaseContinuityApplicationOwnerPort((invocation) =>
      ({ ...unresolvedResult("phase_review_candidate", invocation), phaseReviewClaimed: true })),
    createProductionTrainingSafetyApplicationOwnerPort(),
    createProductionProductHumanApplicationOwnerPort("product_application"),
    createProductionProductHumanApplicationOwnerPort("human_owner_review"),
  ]);
}

export function orchestrationDependencies(
  ports = orchestrationOwnerPorts(),
): ProductionAdaptationApplicationOrchestrationDependencies {
  const resultContract = Object.freeze({ contractId: "PRODUCTION_ADAPTATION_APPLICATION_OWNER_RESULT",
    contractVersion: "1.0.0" });
  const registry = createProductionAdaptationApplicationOwnerRegistry({
    registryReference: PRODUCTION_ADAPTATION_APPLICATION_OWNER_REGISTRY_REFERENCE,
    entries: ports.map((port) => Object.freeze({ owner: port.owner, ownerContract: port.contractReference,
      supportedActions: port.supportedActions, availability: "available" as const,
      proposedResultContract: resultContract, requiredPolicyReferences: Object.freeze([]),
      requiredCurrentRevisionKeys: Object.freeze(["sourceSnapshotRevisionId", "programSnapshotRevisionId"] as const),
      canBuildProgramCandidate: ["prescription", "candidate_intelligence_and_composer"].includes(port.owner),
      canApplyLiveMutation: false as const, provenance: Object.freeze(["fixture:explicit-owner-registry"]) })),
    provenance: Object.freeze(["fixture:explicit-owner-registry-injection"]),
  });
  return Object.freeze({ ownerRegistry: registry, orchestrationPolicy: ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1,
    confirmationPolicy: ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1, ownerPorts: ports,
    explicitOwnerPolicyReferences: Object.freeze([ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1.reference]),
    ownerInputs: Object.freeze({}) });
}

export function resolvedPrescriptionPort() {
  return createProductionPrescriptionApplicationOwnerPort((invocation) => {
    const directive = invocation.input.directive;
    const proposed = orchestrationProgramSnapshot("program-revision-2", "target-semantics-load-22kg");
    const semantic = { status: "proposed_prescription_revision" as const,
      currentEntityRevisions: Object.freeze({ prescription: "prescription-revision-1" }),
      proposedEntityRevisions: Object.freeze({ prescription: "prescription-revision-2" }),
      changedTargetIds: Object.freeze([directive.targetId]), changedDimensions: Object.freeze(["load"] as const),
      unchangedEntityIds: Object.freeze(["session-1", "anchor-1"]), unresolvedRequirements: Object.freeze([]),
      reasonCodes: Object.freeze(["EXACT_OWNER_REALIZATION_SUPPLIED"]), selectedAxis: directive.selectedAxis,
      proposedProgramSnapshot: proposed, proposedWeekPlan: null, proposedPhaseResult: null,
      candidateSelectionReopened: false, weekReallocationClaimed: false, phaseReviewClaimed: false,
      actionPersisted: true, provenance: Object.freeze(["fixture:prescription-owner-resolved"]) };
    return semantic;
  });
}

export function refingerprintOwnerResult(result: Omit<ProductionAdaptationApplicationOwnerResult,
  "ownerResultFingerprint">): ProductionAdaptationApplicationOwnerResult {
  return Object.freeze({ ...result,
    ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(result) });
}
