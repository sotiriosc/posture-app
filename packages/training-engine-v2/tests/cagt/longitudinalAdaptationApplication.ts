import type {
  LongitudinalAdaptationApplicationCandidate,
  LongitudinalApplicationValidationResult,
} from "../../src/longitudinalAdaptation/designContracts";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

const REVIEW_ONLY_ACTIONS = new Set([
  "week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
  "owner_review_required", "no_action_insufficient_evidence",
]);

export function validateLongitudinalApplicationCandidate(
  candidate: LongitudinalAdaptationApplicationCandidate | null,
): LongitudinalApplicationValidationResult {
  if (!candidate || candidate.applicationState === "not_applied") return Object.freeze({
    status: "valid_unapplied" as const, reasonCodes: Object.freeze(["APPLICATION_DEFERRED_TO_RIGHTFUL_OWNER"]),
    actionPersistenceCount: 0, scopeExceededCount: 0 });
  const directive = candidate.authorizedDirective;
  const reasons: string[] = [];
  const unrelated = candidate.changedTargetIds.filter((id) => id !== directive.targetId);
  if (unrelated.length > 0 || candidate.phaseMutationClaimed ||
      candidate.weekReallocationClaimed && directive.action !== "week_reallocation_review") {
    reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  }
  if (directive.action === "keep_current" && candidate.changedTargetIds.length > 0) {
    reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  }
  if (directive.action === "progress_prescription_axis" || directive.action === "regress_prescription_axis") {
    if (!directive.selectedAxis || !candidate.claimedAppliedDimensions.includes(directive.selectedAxis)) {
      reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
    }
    if (candidate.claimedAppliedDimensions.some((dimension) => dimension !== directive.selectedAxis &&
        !directive.implicatedPrescriptionDimensions.includes(dimension))) {
      reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
    }
  }
  if (directive.action === "prescription_modification_review" && candidate.claimedAppliedDimensions.length > 0 &&
      candidate.claimedAppliedDimensions.some((dimension) =>
        !directive.implicatedPrescriptionDimensions.includes(dimension))) {
    reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  }
  if (directive.action === "reopen_candidate_selection_for_replacement" ||
      directive.action === "reopen_candidate_selection_for_bounded_rotation") {
    if (!candidate.candidateSelectionReopened) reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
    if (candidate.claimedAppliedDimensions.includes("selected_exercise_identity")) {
      reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
    }
  }
  if (!REVIEW_ONLY_ACTIONS.has(directive.action) && directive.action !== "hold_current_prescription" &&
      directive.action !== "repeat_for_confirmation" && !candidate.actionPersisted) {
    reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  }
  const uniqueReasons = unique(reasons);
  const erased = uniqueReasons.includes("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  const exceeded = uniqueReasons.includes("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  return Object.freeze({ status: exceeded ? "action_scope_exceeded" as const :
    erased ? "action_erased" as const : "valid_application_candidate" as const,
  reasonCodes: uniqueReasons.length ? uniqueReasons : Object.freeze(["AUTHORIZED_ACTION_PRESERVED_WITHIN_SCOPE"]),
  actionPersistenceCount: erased ? 0 : 1, scopeExceededCount: exceeded ? 1 : 0 });
}
