import type { ProductionAdaptationApplicationLocalityTrace,
  ProductionAdaptationApplicationOrchestrationInput, ProductionAdaptationApplicationOwnerResult,
  ProductionAdaptationApplicationDownstreamValidation, ProductionAdaptationApplicationShadowCandidate } from "./contracts";
import { deriveAdaptationApplicationShadowCandidateId,
  deriveAdaptationApplicationShadowCandidateRevisionId } from "./identities";

export function buildProductionAdaptationApplicationShadowCandidate(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly proposedProgramSnapshot: ProductionAdaptationApplicationOwnerResult["proposedProgramSnapshot"];
  readonly proposedWeekPlan: ProductionAdaptationApplicationOwnerResult["proposedWeekPlan"];
  readonly downstreamValidation: ProductionAdaptationApplicationDownstreamValidation;
  readonly localityTrace: ProductionAdaptationApplicationLocalityTrace;
  readonly basedOnShadowCandidateRevisionId?: string | null;
}): ProductionAdaptationApplicationShadowCandidate {
  const request = input.orchestrationInput.request;
  const shadowCandidateId = deriveAdaptationApplicationShadowCandidateId({ requestId: request.requestId,
    directiveRevisionId: request.directiveRevisionId,
    ownerResultFingerprint: input.ownerResult.ownerResultFingerprint, targetId: request.targetId });
  const revisionInput = { shadowCandidateId, ownerResult: input.ownerResult,
    downstreamValidation: input.downstreamValidation, evaluationTime: request.evaluationTime,
    basedOnShadowCandidateRevisionId: input.basedOnShadowCandidateRevisionId ?? null };
  return Object.freeze({ shadowCandidateId,
    shadowCandidateRevisionId: deriveAdaptationApplicationShadowCandidateRevisionId(revisionInput),
    basedOnShadowCandidateRevisionId: revisionInput.basedOnShadowCandidateRevisionId,
    orchestrationRequestId: request.requestId, orchestrationRequestRevisionId: request.requestRevisionId,
    directiveId: request.directiveId, directiveRevisionId: request.directiveRevisionId,
    ownerResult: input.ownerResult, currentProgramSnapshot: input.orchestrationInput.currentProgramSnapshot,
    proposedProgramSnapshot: input.proposedProgramSnapshot,
    currentWeekPlan: input.orchestrationInput.currentWeekPlan, proposedWeekPlan: input.proposedWeekPlan,
    currentPhaseResult: input.orchestrationInput.currentPhaseResult,
    proposedPhaseResult: input.ownerResult.proposedPhaseResult,
    entityMappings: input.orchestrationInput.entityMappings, changedTargetIds: input.ownerResult.changedTargetIds,
    claimedAppliedDimensions: input.ownerResult.changedDimensions,
    candidateSelectionReopened: input.ownerResult.candidateSelectionReopened,
    weekReallocationClaimed: input.ownerResult.weekReallocationClaimed,
    phaseReviewClaimed: input.ownerResult.phaseReviewClaimed, actionPersisted: input.ownerResult.actionPersisted,
    downstreamValidation: input.downstreamValidation, localityTrace: input.localityTrace,
    applicationApplied: false, evaluationTime: request.evaluationTime,
    provenance: Object.freeze(["application-orchestration:unapplied-shadow-candidate"]) });
}
