import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";

export const ADAPTATION_PERSISTENCE_ENTITY_TYPES = Object.freeze([
  "raw_source_envelope", "normalized_source_record", "source_record_revision", "active_revision_reference",
  "decision_use_authorization", "performance_block_result", "response_observation", "adherence_observation",
  "recovery_readiness_observation", "safety_restriction_observation", "equipment_environment_snapshot",
  "external_load_observation", "source_snapshot", "completed_exposure_ledger", "longitudinal_state_revision",
  "longitudinal_decision_revision", "action_directive", "application_request", "application_attempt", "audit_event",
] as const);
export type AdaptationPersistenceEntityType = typeof ADAPTATION_PERSISTENCE_ENTITY_TYPES[number];

export const ADAPTATION_PERSISTENCE_TRANSACTION_BOUNDARIES = Object.freeze({
  sourceIngestion: Object.freeze(["raw_source_envelope", "normalized_source_record", "source_record_revision",
    "idempotency_result", "audit_event"]),
  snapshot: Object.freeze(["active_revision_reference", "source_snapshot", "audit_event"]),
  decision: Object.freeze(["completed_exposure_ledger", "longitudinal_state_revision",
    "longitudinal_decision_revision", "action_directive", "audit_event"]),
  futureApplication: Object.freeze(["precondition_check", "application_attempt", "owner_mutation",
    "applied_result", "audit_event"]),
} as const);

export interface AppendOnlyPersistenceRecordDesign {
  readonly entityType: AdaptationPersistenceEntityType;
  readonly entityId: string;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly athleteId: string;
  readonly occurredAt: string;
  readonly recordedAt: string;
  readonly immutableContentFingerprint: string;
  readonly authorizationReference: string | null;
  readonly provenance: readonly string[];
}

export interface AdaptationDecisionPersistenceRecordDesign {
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly basedOnDecisionRevisionId: string | null;
  readonly stateRevisionId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly completedExposureLedgerRevisionId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly policyReference: { readonly policyId: string; readonly version: string };
  readonly unresolvedBlockers: readonly string[];
  readonly requiredApplicationOwner: AdaptationApplicationOwner;
  readonly applicationState: AdaptationApplicationState;
  readonly final: boolean;
  readonly evaluatedAt: string;
  readonly provenance: readonly string[];
}

export interface AdaptationDirectivePersistenceRecordDesign {
  readonly directiveId: string;
  readonly directiveRevisionId: string;
  readonly basedOnDirectiveRevisionId: string | null;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly targetId: string;
  readonly action: string;
  readonly requestedDimensions: readonly string[];
  readonly applicationOwner: AdaptationApplicationOwner;
  readonly applicationState: AdaptationApplicationState;
  readonly sourceSnapshotRevisionId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export const ADAPTATION_APPLICATION_OWNERS = Object.freeze([
  "prescription", "candidate_composer", "week", "phase_continuity", "training_safety", "product_human", "unknown",
] as const);
export type AdaptationApplicationOwner = typeof ADAPTATION_APPLICATION_OWNERS[number];

export const ADAPTATION_APPLICATION_STATES = Object.freeze([
  "pending_owner", "pending_confirmation", "pending_policy", "blocked_stale", "blocked_conflict",
  "blocked_safety", "owner_unavailable", "proposed", "applied", "rejected", "superseded",
  "rolled_back", "failed", "unknown",
] as const);
export type AdaptationApplicationState = typeof ADAPTATION_APPLICATION_STATES[number];

export interface AdaptationDirectiveApplicationRequest {
  readonly requestId: string;
  readonly directiveId: string;
  readonly directiveRevisionId: string;
  readonly athleteId: string;
  readonly targetId: string;
  readonly targetScope: string;
  readonly action: string;
  readonly applicationOwner: AdaptationApplicationOwner;
  readonly expectedCurrentEntityRevisions: Readonly<Record<string, string>>;
  readonly requestedAppliedDimensions: readonly string[];
  readonly confirmationRequirement: "required" | "not_required" | "unknown";
  readonly policyReferences: readonly { readonly policyId: string; readonly version: string }[];
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export interface AdaptationApplicationPrecondition {
  readonly directiveFinalAndActive: boolean;
  readonly targetStillActive: boolean;
  readonly currentProgramRevisionMatches: boolean;
  readonly currentPrescriptionRevisionMatches: boolean;
  readonly currentPhaseStateMatches: boolean;
  readonly currentWeekSourceRevisionMatches: boolean;
  readonly newerConflictingSourceRecordAbsent: boolean;
  readonly safetyBlockAbsent: boolean;
  readonly requiredConfirmationPresent: boolean;
  readonly rightfulOwnerAvailable: boolean;
  readonly idempotencyKeyUnused: boolean;
}

export interface AdaptationApplicationPreconditionResult {
  readonly state: Exclude<AdaptationApplicationState, "applied">;
  readonly satisfied: boolean;
  readonly reasonCodes: readonly string[];
  readonly silentRebasePerformed: false;
}

export interface AdaptationApplicationAttemptAuditDesign {
  readonly attemptId: string;
  readonly requestId: string;
  readonly basedOnDirectiveRevisionId: string;
  readonly preconditionResult: AdaptationApplicationPreconditionResult;
  readonly owner: AdaptationApplicationOwner;
  readonly changedEntityReferences: readonly string[];
  readonly beforeRevisionIds: readonly string[];
  readonly afterRevisionIds: readonly string[];
  readonly rollbackReference: string | null;
  readonly result: Exclude<AdaptationApplicationState, "applied">;
  readonly externallyOwnedOrIrreversible: boolean;
  readonly auditEventId: string;
  readonly attemptedAt: string;
  readonly provenance: readonly string[];
}

export const APPLICATION_OWNER_UNAVAILABLE = "APPLICATION_OWNER_UNAVAILABLE" as const;

const ROUTING: Readonly<Record<string, AdaptationApplicationOwner>> = Object.freeze({
  progress_prescription_axis: "prescription",
  regress_prescription_axis: "prescription",
  prescription_modification_review: "prescription",
  authorize_progression_axis: "prescription",
  authorize_regression_axis: "prescription",
  request_local_prescription_modification: "prescription",
  reopen_candidate_selection_for_replacement: "candidate_composer",
  reopen_candidate_selection_for_rotation: "candidate_composer",
  reopen_candidate_selection_for_bounded_rotation: "candidate_composer",
  week_reallocation_review: "week",
  deload_review: "week",
  request_week_reallocation_review: "week",
  request_deload_review: "week",
  request_phase_review: "phase_continuity",
  phase_review: "phase_continuity",
  request_external_safety_review: "training_safety",
  external_safety_review: "training_safety",
  owner_review_required: "product_human",
  keep_current: "product_human",
  repeat_for_confirmation: "product_human",
  no_action_insufficient_evidence: "product_human",
  hold_current_plan: "product_human",
  repeat_current_prescription: "product_human",
  keep_current_exercise: "product_human",
  insufficient_evidence: "product_human",
});

export function routeAdaptationApplicationOwner(action: string): {
  readonly owner: AdaptationApplicationOwner;
  readonly available: boolean;
  readonly reasonCode: string | null;
} {
  const owner = ROUTING[action] ?? "product_human";
  const available = owner !== "week";
  return Object.freeze({ owner, available, reasonCode: available ? null : APPLICATION_OWNER_UNAVAILABLE });
}

export function deriveAdaptationDirectiveApplicationRequestId(input: Omit<
AdaptationDirectiveApplicationRequest, "requestId" | "provenance">): string {
  return stableId("adaptation-directive-application-request", input);
}

export function validateAdaptationDirectiveApplicationRequest(
  request: AdaptationDirectiveApplicationRequest,
): readonly string[] {
  const reasons: string[] = [];
  const { requestId: _requestId, provenance: _provenance, ...semantic } = request;
  void [_requestId, _provenance];
  if (request.requestId !== deriveAdaptationDirectiveApplicationRequestId(semantic)) {
    reasons.push("ADAPTATION_APPLICATION_REQUEST_ID_INVALID");
  }
  if (!explicitIsoTime(request.createdAt)) reasons.push("ADAPTATION_APPLICATION_REQUEST_TIME_INVALID");
  if (!ADAPTATION_APPLICATION_OWNERS.includes(request.applicationOwner)) reasons.push("ADAPTATION_APPLICATION_OWNER_INVALID");
  const routing = routeAdaptationApplicationOwner(request.action);
  if (routing.owner !== request.applicationOwner) reasons.push("ADAPTATION_APPLICATION_WRONG_OWNER");
  if (!routing.available) reasons.push(APPLICATION_OWNER_UNAVAILABLE);
  if (!request.idempotencyKey.trim()) reasons.push("ADAPTATION_APPLICATION_IDEMPOTENCY_KEY_REQUIRED");
  if (!request.directiveRevisionId.trim() || !request.athleteId.trim() || !request.targetId.trim()) {
    reasons.push("ADAPTATION_APPLICATION_LINEAGE_REQUIRED");
  }
  return uniqueSorted(reasons);
}

export function evaluateAdaptationApplicationPreconditions(
  preconditions: AdaptationApplicationPrecondition,
): AdaptationApplicationPreconditionResult {
  const reasons: string[] = [];
  if (!preconditions.directiveFinalAndActive) reasons.push("APPLICATION_DIRECTIVE_NOT_FINAL_ACTIVE");
  if (!preconditions.targetStillActive) reasons.push("APPLICATION_TARGET_STALE");
  if (!preconditions.currentProgramRevisionMatches) reasons.push("APPLICATION_PROGRAM_REVISION_STALE");
  if (!preconditions.currentPrescriptionRevisionMatches) reasons.push("APPLICATION_PRESCRIPTION_REVISION_STALE");
  if (!preconditions.currentPhaseStateMatches) reasons.push("APPLICATION_PHASE_STATE_STALE");
  if (!preconditions.currentWeekSourceRevisionMatches) reasons.push("APPLICATION_WEEK_REVISION_STALE");
  if (!preconditions.newerConflictingSourceRecordAbsent) reasons.push("APPLICATION_NEWER_SOURCE_CONFLICT");
  if (!preconditions.safetyBlockAbsent) reasons.push("APPLICATION_SAFETY_BLOCK");
  if (!preconditions.requiredConfirmationPresent) reasons.push("APPLICATION_CONFIRMATION_REQUIRED");
  if (!preconditions.rightfulOwnerAvailable) reasons.push(APPLICATION_OWNER_UNAVAILABLE);
  if (!preconditions.idempotencyKeyUnused) reasons.push("APPLICATION_IDEMPOTENCY_KEY_ALREADY_USED");
  let state: Exclude<AdaptationApplicationState, "applied"> = "proposed";
  if (reasons.some((reason) => reason.includes("SAFETY"))) state = "blocked_safety";
  else if (reasons.some((reason) => reason.includes("CONFLICT"))) state = "blocked_conflict";
  else if (reasons.includes(APPLICATION_OWNER_UNAVAILABLE)) state = "owner_unavailable";
  else if (reasons.some((reason) => reason.includes("CONFIRMATION"))) state = "pending_confirmation";
  else if (reasons.length) state = "blocked_stale";
  return Object.freeze({ state, satisfied: reasons.length === 0, reasonCodes: uniqueSorted(reasons),
    silentRebasePerformed: false });
}

export function validateAppendOnlyPersistenceRecordDesign(
  record: AppendOnlyPersistenceRecordDesign,
): readonly string[] {
  const reasons: string[] = [];
  if (!ADAPTATION_PERSISTENCE_ENTITY_TYPES.includes(record.entityType)) reasons.push("PERSISTENCE_ENTITY_TYPE_INVALID");
  if (!record.entityId.trim() || !record.revisionId.trim() || !record.athleteId.trim() ||
      !record.immutableContentFingerprint.trim()) reasons.push("PERSISTENCE_APPEND_ONLY_LINEAGE_REQUIRED");
  if (record.revisionId === record.basedOnRevisionId) reasons.push("PERSISTENCE_REVISION_SELF_REFERENCE");
  if (!explicitIsoTime(record.occurredAt) || !explicitIsoTime(record.recordedAt)) reasons.push("PERSISTENCE_TIME_INVALID");
  return uniqueSorted(reasons);
}

export const ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM = Object.freeze({
  contractId: "ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM", version: "1.0.0", designOnly: true,
  rollbackImplemented: false, everyActionReversible: false, externalActionsRequireExplicitReview: true,
});
