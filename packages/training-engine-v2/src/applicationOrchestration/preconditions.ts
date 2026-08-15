import { explicitIsoTime, sameSemanticValue, uniqueSorted } from "../prescription/compiler/utilities";
import { ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
  ADAPTATION_APPLICATION_ORCHESTRATION_MODES, type ProductionAdaptationApplicationOrchestrationRequest,
  type ProductionAdaptationApplicationPreconditionResult,
  type ProductionAdaptationApplicationPreconditionSnapshot } from "./contracts";
import { deriveAdaptationApplicationOrchestrationRequestId,
  deriveAdaptationApplicationOrchestrationRequestRevisionId } from "./identities";

export function validateProductionAdaptationApplicationOrchestrationRequest(
  request: ProductionAdaptationApplicationOrchestrationRequest,
): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(request.orchestrationContract, ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION");
  }
  if (!ADAPTATION_APPLICATION_ORCHESTRATION_MODES.includes(request.mode)) reasons.push("INVALID_ORCHESTRATION_MODE");
  if (!explicitIsoTime(request.evaluationTime)) reasons.push("ADAPTATION_APPLICATION_EVALUATION_TIME_INVALID");
  if (!request.athleteId.trim() || !request.authenticatedPrincipalOrServiceId.trim() ||
      !request.directiveId.trim() || !request.directiveRevisionId.trim() || !request.longitudinalDecisionId.trim() ||
      !request.longitudinalDecisionRevisionId.trim() || !request.targetId.trim() ||
      !request.orchestrationAttemptId.trim()) reasons.push("ADAPTATION_APPLICATION_REQUEST_LINEAGE_REQUIRED");
  if (!request.idempotencyKey.trim()) reasons.push("ADAPTATION_APPLICATION_IDEMPOTENCY_KEY_REQUIRED");
  if (request.requestId !== deriveAdaptationApplicationOrchestrationRequestId(request)) {
    reasons.push("ADAPTATION_APPLICATION_REQUEST_ID_INVALID");
  }
  const { requestRevisionId: _revision, provenance: _provenance, ...revisionInput } = request;
  void [_revision, _provenance];
  if (request.requestRevisionId !== deriveAdaptationApplicationOrchestrationRequestRevisionId(revisionInput)) {
    reasons.push("ADAPTATION_APPLICATION_REQUEST_REVISION_ID_INVALID");
  }
  if (request.requestRevisionId === request.basedOnRequestRevisionId) {
    reasons.push("ADAPTATION_APPLICATION_REQUEST_REVISION_SELF_REFERENCE");
  }
  return Object.freeze(uniqueSorted(reasons));
}

const REVISION_REASONS = Object.freeze({
  sourceSnapshotRevisionId: "APPLICATION_SOURCE_SNAPSHOT_REVISION_STALE",
  programSnapshotRevisionId: "APPLICATION_PROGRAM_REVISION_STALE",
  weekSourceSnapshotRevisionId: "APPLICATION_WEEK_SOURCE_REVISION_STALE",
  weekHorizonRevisionId: "APPLICATION_WEEK_HORIZON_REVISION_STALE",
  weeklyIntentRevisionId: "APPLICATION_WEEK_INTENT_REVISION_STALE",
  weekPlanRevisionId: "APPLICATION_WEEK_PLAN_REVISION_STALE",
  prescriptionRevisionId: "APPLICATION_PRESCRIPTION_REVISION_STALE",
  sequenceRevisionId: "APPLICATION_SEQUENCE_REVISION_STALE",
  phaseStateRevisionId: "APPLICATION_PHASE_STATE_REVISION_STALE",
  phaseResultRevisionId: "APPLICATION_PHASE_RESULT_REVISION_STALE",
  safetySnapshotRevisionId: "APPLICATION_SAFETY_REVISION_STALE",
} as const);

export function evaluateProductionAdaptationApplicationPreconditions(input: {
  readonly request: ProductionAdaptationApplicationOrchestrationRequest;
  readonly snapshot: ProductionAdaptationApplicationPreconditionSnapshot;
  readonly requestReasonCodes?: readonly string[];
}): ProductionAdaptationApplicationPreconditionResult {
  const reasons = [...(input.requestReasonCodes ?? [])];
  const failed: string[] = [];
  const fail = (name: string, reason: string) => { failed.push(name); reasons.push(reason); };
  const snapshot = input.snapshot;
  if (!snapshot.directiveFinalAndActive) fail("directiveFinalAndActive", "APPLICATION_DIRECTIVE_NOT_FINAL_ACTIVE");
  if (!snapshot.decisionFinalAndActive) fail("decisionFinalAndActive", "APPLICATION_DECISION_NOT_FINAL_ACTIVE");
  if (!snapshot.targetStillActive) fail("targetStillActive", "APPLICATION_TARGET_INACTIVE");
  for (const key of Object.keys(REVISION_REASONS) as readonly (keyof typeof REVISION_REASONS)[]) {
    if (input.request.expectedCurrentRevisions[key] !== snapshot.actualCurrentRevisions[key]) {
      fail(key, REVISION_REASONS[key]);
    }
  }
  if (!snapshot.newerConflictingSourceRecordAbsent) fail("newerConflictingSourceRecordAbsent", "APPLICATION_NEWER_SOURCE_CONFLICT");
  if (!snapshot.newerLongitudinalDecisionForTargetAbsent) fail("newerLongitudinalDecisionForTargetAbsent",
    "APPLICATION_NEWER_LONGITUDINAL_DECISION_CONFLICT");
  if (!snapshot.requiredPolicyVersionsAvailable) fail("requiredPolicyVersionsAvailable", "APPLICATION_POLICY_REQUIRED");
  if (!snapshot.ownerPortAvailable) fail("ownerPortAvailable", "ADAPTATION_APPLICATION_OWNER_UNAVAILABLE");
  if (!snapshot.shadowAuthorizationPresent) fail("shadowAuthorizationPresent", "APPLICATION_SHADOW_AUTHORIZATION_REQUIRED");
  if (!snapshot.liveConfirmationAbsentOrNotApplicable) fail("liveConfirmationAbsentOrNotApplicable",
    "LIVE_APPLICATION_CONFIRMATION_NOT_SUPPORTED");
  if (!snapshot.idempotencyKeyUnused) fail("idempotencyKeyUnused", "APPLICATION_IDEMPOTENCY_KEY_ALREADY_USED");
  if (!snapshot.safetyAllowsMaterialOwnerCall) fail("safetyAllowsMaterialOwnerCall", "APPLICATION_SAFETY_BLOCK");
  if (!snapshot.evaluationTimeValid || !explicitIsoTime(input.request.evaluationTime)) {
    fail("evaluationTimeValid", "ADAPTATION_APPLICATION_EVALUATION_TIME_INVALID");
  }
  let state: ProductionAdaptationApplicationPreconditionResult["state"] = "preconditions_satisfied";
  if (reasons.includes("APPLICATION_SAFETY_BLOCK")) state = "blocked_safety";
  else if (reasons.includes("APPLICATION_NEWER_SOURCE_CONFLICT") ||
      reasons.includes("APPLICATION_NEWER_LONGITUDINAL_DECISION_CONFLICT")) state = "blocked_conflict";
  else if (reasons.includes("APPLICATION_DIRECTIVE_NOT_FINAL_ACTIVE")) state = "directive_not_final";
  else if (reasons.includes("APPLICATION_DECISION_NOT_FINAL_ACTIVE")) state = "decision_not_final";
  else if (reasons.includes("APPLICATION_TARGET_INACTIVE")) state = "target_inactive";
  else if (reasons.includes("ADAPTATION_APPLICATION_OWNER_UNAVAILABLE")) state = "owner_unavailable";
  else if (reasons.includes("APPLICATION_POLICY_REQUIRED")) state = "pending_policy";
  else if (reasons.includes("APPLICATION_IDEMPOTENCY_KEY_ALREADY_USED")) state = "idempotent_prior_result";
  else if (reasons.some((reason) => reason.includes("REVISION_STALE"))) state = "blocked_stale";
  else if (reasons.length) state = "invalid_request";
  return Object.freeze({ state, satisfied: reasons.length === 0, failedPreconditions: Object.freeze(uniqueSorted(failed)),
    reasonCodes: Object.freeze(uniqueSorted(reasons)), silentRebasePerformed: false });
}
