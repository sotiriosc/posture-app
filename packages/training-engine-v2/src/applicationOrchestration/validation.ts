import { productionLongitudinalApplicationOwner } from "../longitudinalAdaptation/actionCandidates";
import type { ProductionLongitudinalAdaptationApplicationCandidate } from
  "../longitudinalAdaptation/contracts";
import { uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationOrchestrationInput,
  ProductionAdaptationApplicationOwnerResult } from "./contracts";
import type { ProductionAdaptationApplicationOwnerPortFamily } from "./ownerPorts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";

export function validateProductionAdaptationApplicationOwnerResult(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly port: ProductionAdaptationApplicationOwnerPortFamily;
}): readonly string[] {
  const { request, directive } = input.orchestrationInput;
  const result = input.ownerResult;
  const reasons: string[] = [];
  const { ownerResultFingerprint: _fingerprint, provenance: _provenance, ...semanticResult } = result;
  void [_fingerprint, _provenance];
  if (result.ownerResultFingerprint !== deriveAdaptationApplicationOwnerResultFingerprint(semanticResult)) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_FINGERPRINT_INVALID");
  }
  if (result.applicationApplied !== false) reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_APPLIED_FORBIDDEN");
  if (result.owner !== request.requestedOwner || result.owner !== directive.downstreamApplicationOwner ||
      result.owner !== productionLongitudinalApplicationOwner(directive.action)) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_WRONG_OWNER");
  }
  if (result.action !== directive.action) reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_ACTION_MISMATCH");
  if (result.targetId !== directive.targetId || request.targetId !== directive.targetId) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_TARGET_MISMATCH");
  }
  if (input.port.owner !== result.owner || !input.port.supportedActions.includes(result.action)) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_PORT_MISMATCH");
  }
  if (input.port.contractReference.contractId !== result.ownerContract.contractId ||
      input.port.contractReference.contractVersion !== result.ownerContract.contractVersion) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_CONTRACT_MISMATCH");
  }
  if (result.changedTargetIds.some((targetId) => targetId !== directive.targetId)) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_SCOPE_EXCEEDED");
  }
  if (result.changedDimensions.some((dimension) =>
    !directive.implicatedPrescriptionDimensions.includes(dimension))) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_DIMENSION_SCOPE_EXCEEDED");
  }
  if (["progress_prescription_axis", "regress_prescription_axis"].includes(directive.action) &&
      result.selectedAxis !== directive.selectedAxis) reasons.push("ADAPTATION_APPLICATION_OWNER_RESULT_AXIS_CHANGED");
  if (["keep_current", "repeat_for_confirmation", "hold_current_prescription",
    "no_action_insufficient_evidence"].includes(directive.action) &&
      (result.changedTargetIds.length || result.changedDimensions.length)) {
    reasons.push("ADAPTATION_APPLICATION_NO_CHANGE_OWNER_MUTATED_SCOPE");
  }
  if (directive.action === "owner_review_required" && result.proposedProgramSnapshot) {
    reasons.push("ADAPTATION_APPLICATION_HUMAN_REVIEW_FAKE_PROGRAM");
  }
  if (directive.action === "deload_review" && (result.proposedProgramSnapshot || result.proposedWeekPlan)) {
    reasons.push("ADAPTATION_APPLICATION_DELOAD_CONSTRUCTION_FORBIDDEN");
  }
  if (directive.action === "external_safety_review" && result.changedTargetIds.length) {
    reasons.push("ADAPTATION_APPLICATION_SAFETY_WORKAROUND_FORBIDDEN");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function projectShadowCandidateForLongitudinalValidation(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly proposedProgramSnapshot: ProductionAdaptationApplicationOwnerResult["proposedProgramSnapshot"];
  readonly completeForValidation: boolean;
}): ProductionLongitudinalAdaptationApplicationCandidate {
  const owner = input.ownerResult;
  return Object.freeze({
    applicationCandidateId: `longitudinal-application-projection:${owner.ownerResultFingerprint}`,
    authorizedDirective: input.orchestrationInput.directive,
    currentProgramSnapshot: input.orchestrationInput.currentProgramSnapshot,
    proposedProgramSnapshot: input.proposedProgramSnapshot ?? input.orchestrationInput.currentProgramSnapshot,
    explicitEntityMappings: input.orchestrationInput.entityMappings,
    claimedAppliedDimensions: owner.changedDimensions,
    changedTargetIds: owner.changedTargetIds,
    applicationOwner: owner.owner,
    applicationState: input.completeForValidation ? "proposed_for_validation" : "not_applied",
    actionPersisted: owner.actionPersisted,
    candidateSelectionReopened: owner.candidateSelectionReopened,
    phaseMutationClaimed: false,
    weekReallocationClaimed: owner.weekReallocationClaimed,
    provenance: Object.freeze(["application-orchestration:longitudinal-validation-projection"]),
  });
}
