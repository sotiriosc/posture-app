import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionAdaptationApplicationOwnerInvocation,
  ProductionTrainingSafetyApplicationOwnerPort } from "./ownerPorts";

export const PRODUCTION_TRAINING_SAFETY_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_TRAINING_SAFETY_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

export function createProductionTrainingSafetyApplicationOwnerPort(): ProductionTrainingSafetyApplicationOwnerPort {
  return Object.freeze({ owner: "training_safety",
    contractReference: PRODUCTION_TRAINING_SAFETY_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(["external_safety_review"] as const),
    invoke: (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const directive = invocation.input.directive;
      const semantic: Omit<ProductionAdaptationApplicationOwnerResult, "ownerResultFingerprint"> = Object.freeze({
        ownerContract: PRODUCTION_TRAINING_SAFETY_APPLICATION_OWNER_CONTRACT_REFERENCE,
        owner: "training_safety", action: directive.action, targetId: directive.targetId,
        status: "external_safety_review_required", currentEntityRevisions: Object.freeze({
          safetySnapshotRevisionId: invocation.input.request.expectedCurrentRevisions.safetySnapshotRevisionId }),
        proposedEntityRevisions: Object.freeze({}), changedTargetIds: Object.freeze([]),
        changedDimensions: Object.freeze([]), unchangedEntityIds: Object.freeze([]),
        unresolvedRequirements: Object.freeze(["EXTERNAL_TRAINING_SAFETY_REVIEW_REQUIRED"]),
        reasonCodes: Object.freeze(["APPLICATION_BLOCKED_FOR_EXTERNAL_TRAINING_SAFETY_REVIEW"]),
        selectedAxis: null, proposedProgramSnapshot: null, proposedWeekPlan: null, proposedPhaseResult: null,
        candidateSelectionReopened: false, weekReallocationClaimed: false, phaseReviewClaimed: false,
        actionPersisted: true, applicationApplied: false,
        provenance: Object.freeze(["training-safety-owner:external-review-no-diagnosis"]) });
      return Object.freeze({ ...semantic,
        ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(semantic) });
    } });
}
