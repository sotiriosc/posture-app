import { reallocateRemainingWeek } from "../weekPlanning/reallocation";
import { WEEK_DELOAD_POLICY_REQUIRED } from "../weekPlanning/contracts";
import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionAdaptationApplicationOwnerInvocation,
  ProductionWeekApplicationOwnerPort } from "./ownerPorts";

export const PRODUCTION_WEEK_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEK_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

function finalize(result: Omit<ProductionAdaptationApplicationOwnerResult,
  "ownerResultFingerprint">): ProductionAdaptationApplicationOwnerResult {
  return Object.freeze({ ...result,
    ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(result) });
}

export function createProductionWeekApplicationOwnerPort(): ProductionWeekApplicationOwnerPort {
  return Object.freeze({ owner: "week", contractReference: PRODUCTION_WEEK_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(["week_reallocation_review", "deload_review"] as const),
    invoke: (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const { input } = invocation;
      const directive = input.directive;
      if (directive.action === "deload_review") return finalize({
        ownerContract: PRODUCTION_WEEK_APPLICATION_OWNER_CONTRACT_REFERENCE, owner: "week", action: directive.action,
        targetId: directive.targetId, status: "week_deload_policy_required", currentEntityRevisions: {},
        proposedEntityRevisions: {}, changedTargetIds: Object.freeze([]), changedDimensions: Object.freeze([]),
        unchangedEntityIds: Object.freeze([]), unresolvedRequirements: Object.freeze([WEEK_DELOAD_POLICY_REQUIRED]),
        reasonCodes: Object.freeze([WEEK_DELOAD_POLICY_REQUIRED]), selectedAxis: null, proposedProgramSnapshot: null,
        proposedWeekPlan: null, proposedPhaseResult: null, candidateSelectionReopened: false,
        weekReallocationClaimed: false, phaseReviewClaimed: false, actionPersisted: true,
        applicationApplied: false, provenance: Object.freeze(["week-owner:deload-policy-required"]) });
      const result = input.precomputedWeekReallocationResult ??
        (input.weekReallocationInput ? reallocateRemainingWeek(input.weekReallocationInput) : null);
      if (!result) return finalize({
        ownerContract: PRODUCTION_WEEK_APPLICATION_OWNER_CONTRACT_REFERENCE, owner: "week", action: directive.action,
        targetId: directive.targetId, status: "owner_input_invalid", currentEntityRevisions: {},
        proposedEntityRevisions: {}, changedTargetIds: Object.freeze([]), changedDimensions: Object.freeze([]),
        unchangedEntityIds: Object.freeze([]), unresolvedRequirements: Object.freeze(["WEEK_REALLOCATION_INPUT_REQUIRED"]),
        reasonCodes: Object.freeze(["WEEK_REALLOCATION_INPUT_REQUIRED"]), selectedAxis: null,
        proposedProgramSnapshot: null, proposedWeekPlan: null, proposedPhaseResult: null,
        candidateSelectionReopened: false, weekReallocationClaimed: false, phaseReviewClaimed: false,
        actionPersisted: false, applicationApplied: false, provenance: Object.freeze(["week-owner:invalid-input"]) });
      const proposed = result.revisedPlanCandidate;
      const status = result.status === "revised_plan_candidate" ? "revised_week_plan_candidate" :
        result.status === "reallocation_not_required" ? "week_reallocation_not_required" :
        result.status === "reallocation_policy_required" ? "week_reallocation_policy_required" :
        result.status === "blocked_by_training_readiness" ? "week_reallocation_blocked" :
        result.status === "reallocation_infeasible" || result.status === "search_inconclusive" ?
          "week_reallocation_infeasible" : "owner_input_invalid";
      return finalize({ ownerContract: PRODUCTION_WEEK_APPLICATION_OWNER_CONTRACT_REFERENCE, owner: "week",
        action: directive.action, targetId: directive.targetId, status,
        currentEntityRevisions: Object.freeze({ weekPlanRevisionId: result.priorPlanRevisionId }),
        proposedEntityRevisions: Object.freeze(proposed ?
          { weekPlanRevisionId: proposed.weekPlanRevisionId } : {}) as Readonly<Record<string, string>>,
        changedTargetIds: Object.freeze(proposed ? [directive.targetId] : []), changedDimensions: Object.freeze([]),
        unchangedEntityIds: result.preservedCompletedReservations.map((entry) => entry.reservationId),
        unresolvedRequirements: result.unresolvedObjectiveIds,
        reasonCodes: result.decisionTrace, selectedAxis: null, proposedProgramSnapshot: null,
        proposedWeekPlan: proposed, proposedPhaseResult: null, candidateSelectionReopened: false,
        weekReallocationClaimed: proposed !== null, phaseReviewClaimed: false, actionPersisted: true,
        applicationApplied: false, provenance: Object.freeze(["week-owner:production-remaining-week-reallocation"]) });
    } });
}
