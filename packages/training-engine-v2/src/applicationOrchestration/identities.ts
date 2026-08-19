import { stableId } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationOrchestrationRequest,
  ProductionAdaptationApplicationOwnerResult, ProductionAdaptationApplicationDownstreamValidation } from "./contracts";

export function deriveAdaptationApplicationOrchestrationRequestId(input: Pick<
  ProductionAdaptationApplicationOrchestrationRequest,
  "orchestrationContract" | "athleteId" | "directiveId" | "targetId" | "orchestrationAttemptId"
>): string {
  return stableId("adaptation-application-orchestration-request", {
    orchestrationContract: input.orchestrationContract,
    athleteId: input.athleteId,
    directiveId: input.directiveId,
    targetId: input.targetId,
    orchestrationAttemptId: input.orchestrationAttemptId,
  });
}

export function deriveAdaptationApplicationOrchestrationRequestRevisionId(
  request: Omit<ProductionAdaptationApplicationOrchestrationRequest, "requestRevisionId" | "provenance">,
): string {
  return stableId("adaptation-application-orchestration-request-revision", request);
}

export function deriveProductionAdaptationApplicationOrchestrationId(input: {
  readonly requestId: string;
  readonly directiveRevisionId: string;
  readonly rightfulOwner: string;
  readonly targetId: string;
  readonly orchestrationAttemptId: string;
}): string {
  return stableId("adaptation-application-orchestration", input);
}

export function deriveProductionAdaptationApplicationOrchestrationRevisionId(input: {
  readonly orchestrationId: string;
  readonly ownerResultFingerprint: string | null;
  readonly proposedProgramRevisionId: string | null;
  readonly validationFingerprint: string | null;
  readonly persistenceState: string;
  readonly evaluationTime: string;
  readonly basedOnOrchestrationRevisionId: string | null;
}): string {
  return stableId("adaptation-application-orchestration-revision", input);
}

export function deriveAdaptationApplicationShadowCandidateId(input: {
  readonly requestId: string;
  readonly directiveRevisionId: string;
  readonly ownerResultFingerprint: string;
  readonly targetId: string;
}): string {
  return stableId("adaptation-application-shadow-candidate", input);
}

export function deriveAdaptationApplicationShadowCandidateRevisionId(input: {
  readonly shadowCandidateId: string;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly downstreamValidation: ProductionAdaptationApplicationDownstreamValidation;
  readonly evaluationTime: string;
  readonly basedOnShadowCandidateRevisionId: string | null;
}): string {
  return stableId("adaptation-application-shadow-candidate-revision", {
    shadowCandidateId: input.shadowCandidateId,
    proposedEntityRevisions: input.ownerResult.proposedEntityRevisions,
    validationFingerprint: input.downstreamValidation.validationFingerprint,
    evaluationTime: input.evaluationTime,
    basedOnShadowCandidateRevisionId: input.basedOnShadowCandidateRevisionId,
  });
}

export function deriveAdaptationApplicationOwnerResultFingerprint(
  result: Omit<ProductionAdaptationApplicationOwnerResult, "ownerResultFingerprint" | "provenance">,
): string {
  const { provenance: _provenance, ownerResultFingerprint: _fingerprint, ...semantic } =
    result as Omit<ProductionAdaptationApplicationOwnerResult, "ownerResultFingerprint"> &
    Partial<Pick<ProductionAdaptationApplicationOwnerResult, "ownerResultFingerprint">>;
  void [_provenance, _fingerprint];
  return stableId("adaptation-application-owner-result", semantic);
}
