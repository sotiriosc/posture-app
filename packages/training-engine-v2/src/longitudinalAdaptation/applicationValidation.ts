import type {
  ProductionLongitudinalAdaptationApplicationCandidate,
  ProductionLongitudinalApplicationValidationResult,
} from "./contracts";
import { productionLongitudinalApplicationOwner } from "./actionCandidates";
import { uniqueSorted } from "../prescription/compiler/utilities";

const REVIEW_ONLY_ACTIONS = new Set([
  "week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
  "owner_review_required", "no_action_insufficient_evidence",
]);

export function validateProductionLongitudinalApplicationCandidate(
  candidate: ProductionLongitudinalAdaptationApplicationCandidate | null,
): ProductionLongitudinalApplicationValidationResult {
  if (!candidate || candidate.applicationState === "not_applied") return Object.freeze({
    status: "valid_unapplied", reasonCodes: Object.freeze(["APPLICATION_DEFERRED_TO_RIGHTFUL_OWNER"]),
    actionPersistenceCount: 0, scopeExceededCount: 0, wrongOwnerCount: 0,
  });
  const directive = candidate.authorizedDirective;
  const reasons: string[] = [];
  if (candidate.applicationOwner !== directive.downstreamApplicationOwner ||
      candidate.applicationOwner !== productionLongitudinalApplicationOwner(directive.action)) {
    reasons.push("LONGITUDINAL_WRONG_APPLICATION_OWNER");
  }
  if (candidate.changedTargetIds.some((id) => id !== directive.targetId) || candidate.phaseMutationClaimed ||
      candidate.weekReallocationClaimed) reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  if (directive.action === "keep_current" && candidate.changedTargetIds.length > 0) {
    reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  }
  if (["progress_prescription_axis", "regress_prescription_axis"].includes(directive.action)) {
    const dimensionForAxis: Readonly<Record<string, string>> = { reps: "repetitions", support_reduction: "support",
      rest_reduction: "rest" };
    const selectedDimension = directive.selectedAxis ? dimensionForAxis[directive.selectedAxis] ?? directive.selectedAxis : null;
    if (!selectedDimension || !candidate.claimedAppliedDimensions.includes(selectedDimension as never)) {
      reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
    }
    if (candidate.claimedAppliedDimensions.some((dimension) => dimension !== selectedDimension &&
        !directive.implicatedPrescriptionDimensions.includes(dimension))) {
      reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
    }
  }
  if (directive.action === "prescription_modification_review" && candidate.claimedAppliedDimensions.some((dimension) =>
    !directive.implicatedPrescriptionDimensions.includes(dimension))) reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  if (["reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation"]
    .includes(directive.action)) {
    if (!candidate.candidateSelectionReopened) reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
    if (candidate.claimedAppliedDimensions.includes("unresolved_other")) reasons.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  }
  if (!REVIEW_ONLY_ACTIONS.has(directive.action) && !["hold_current_prescription", "repeat_for_confirmation"]
    .includes(directive.action) && !candidate.actionPersisted) reasons.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  const unique = uniqueSorted(reasons);
  const wrong = unique.includes("LONGITUDINAL_WRONG_APPLICATION_OWNER");
  const exceeded = unique.includes("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  const erased = unique.includes("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  return Object.freeze({ status: wrong ? "wrong_application_owner" : exceeded ? "action_scope_exceeded" :
    erased ? "action_erased" : "valid_application_candidate",
  reasonCodes: Object.freeze(unique.length ? unique : ["AUTHORIZED_ACTION_PRESERVED_WITHIN_SCOPE"]),
  actionPersistenceCount: erased ? 0 : 1, scopeExceededCount: exceeded ? 1 : 0, wrongOwnerCount: wrong ? 1 : 0 });
}
