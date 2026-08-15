import {
  deriveAdaptationDirectiveApplicationRequestId,
  evaluateAdaptationApplicationPreconditions,
  routeAdaptationApplicationOwner,
  validateAdaptationDirectiveApplicationRequest,
  type AdaptationApplicationOwner,
  type AdaptationApplicationPrecondition,
  type AdaptationDirectiveApplicationRequest,
} from "../../src/adaptationPersistence/designContracts";

export function buildAdaptationApplicationRequest(
  action = "progress_prescription_axis",
): AdaptationDirectiveApplicationRequest {
  const routing = routeAdaptationApplicationOwner(action);
  const semantic = {
    directiveId: "directive-design-1", directiveRevisionId: "directive-revision-design-1",
    athleteId: "athlete-design-1", targetId: "target-design-1", targetScope: "exercise_assignment",
    action, applicationOwner: routing.owner as AdaptationApplicationOwner,
    expectedCurrentEntityRevisions: Object.freeze({ program: "program-revision-1", prescription: "prescription-revision-1" }),
    requestedAppliedDimensions: Object.freeze(["load"]), confirmationRequirement: "not_required" as const,
    policyReferences: Object.freeze([{ policyId: "PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1", version: "1.0.0" }]),
    idempotencyKey: `application:${action}:1`, createdAt: "2026-08-14T16:00:00.000Z",
  };
  return Object.freeze({ ...semantic, requestId: deriveAdaptationDirectiveApplicationRequestId(semantic),
    provenance: Object.freeze(["design-evidence:handoff-only"]) });
}

export function satisfiedAdaptationApplicationPreconditions(): AdaptationApplicationPrecondition {
  return Object.freeze({ directiveFinalAndActive: true, targetStillActive: true,
    currentProgramRevisionMatches: true, currentPrescriptionRevisionMatches: true,
    currentPhaseStateMatches: true, currentWeekSourceRevisionMatches: true,
    newerConflictingSourceRecordAbsent: true, safetyBlockAbsent: true,
    requiredConfirmationPresent: true, rightfulOwnerAvailable: true, idempotencyKeyUnused: true });
}

export function runAdaptationApplicationHandoffCases() {
  const actions = ["progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review",
    "reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation",
    "week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
    "owner_review_required", "keep_current", "repeat_for_confirmation", "no_action_insufficient_evidence"];
  const rows = Array.from({ length: 35 }, (_, index) => {
    const action = actions[index % actions.length];
    const request = buildAdaptationApplicationRequest(action);
    const routing = routeAdaptationApplicationOwner(action);
    const validationReasons = validateAdaptationDirectiveApplicationRequest(request);
    const preconditions = { ...satisfiedAdaptationApplicationPreconditions(), rightfulOwnerAvailable: routing.available };
    const result = evaluateAdaptationApplicationPreconditions(preconditions);
    const expectedState = routing.available ? "proposed" : "owner_unavailable";
    return Object.freeze({ caseId: `application-handoff-${String(index + 1).padStart(2, "0")}`, action,
      owner: routing.owner, ownerAvailable: routing.available, validationReasons,
      state: result.state, passed: result.state === expectedState &&
        validationReasons.every((reason) => reason === "APPLICATION_OWNER_UNAVAILABLE") });
  });
  return Object.freeze({ caseCount: rows.length, appliedStateCount: 0,
    failureCount: rows.filter((row) => !row.passed).length, rows: Object.freeze(rows) });
}
