import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionAdaptationApplicationOwnerInvocation,
  ProductionProductHumanApplicationOwnerPort } from "./ownerPorts";

export const PRODUCTION_PRODUCT_HUMAN_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_PRODUCT_HUMAN_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

export function createProductionProductHumanApplicationOwnerPort(
  owner: "product_application" | "human_owner_review",
): ProductionProductHumanApplicationOwnerPort {
  const supportedActions = owner === "product_application" ?
    ["keep_current", "repeat_for_confirmation", "hold_current_prescription"] as const :
    ["owner_review_required", "no_action_insufficient_evidence"] as const;
  return Object.freeze({ owner, contractReference: PRODUCTION_PRODUCT_HUMAN_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(supportedActions),
    invoke: (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const directive = invocation.input.directive;
      const review = directive.action === "owner_review_required";
      const semantic: Omit<ProductionAdaptationApplicationOwnerResult, "ownerResultFingerprint"> = Object.freeze({
        ownerContract: PRODUCTION_PRODUCT_HUMAN_APPLICATION_OWNER_CONTRACT_REFERENCE, owner,
        action: directive.action, targetId: directive.targetId,
        status: review ? "human_review_required" : "no_change_shadow_disposition",
        currentEntityRevisions: Object.freeze({ programSnapshotRevisionId:
          invocation.input.currentProgramSnapshot.snapshotRevisionId }),
        proposedEntityRevisions: Object.freeze({ programSnapshotRevisionId:
          invocation.input.currentProgramSnapshot.snapshotRevisionId }),
        changedTargetIds: Object.freeze([]), changedDimensions: Object.freeze([]),
        unchangedEntityIds: Object.freeze(invocation.input.currentProgramSnapshot.entities
          .map((entry) => entry.entityId).sort()),
        unresolvedRequirements: Object.freeze(review ? ["HUMAN_OWNER_REVIEW_REQUIRED"] :
          directive.action === "repeat_for_confirmation" ? ["FUTURE_CONFIRMATION_EVIDENCE_REQUIRED"] : []),
        reasonCodes: Object.freeze(review ? ["OWNER_CONFLICT_PRESERVED_FOR_HUMAN_REVIEW"] :
          ["CURRENT_PROGRAM_PRESERVED_WITH_NO_MUTATION"]), selectedAxis: null,
        proposedProgramSnapshot: review ? null : invocation.input.currentProgramSnapshot,
        proposedWeekPlan: null, proposedPhaseResult: null, candidateSelectionReopened: false,
        weekReallocationClaimed: false, phaseReviewClaimed: false, actionPersisted: true,
        applicationApplied: false, provenance: Object.freeze(["product-human-owner:no-live-product-behavior"]) });
      return Object.freeze({ ...semantic,
        ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(semantic) });
    } });
}
