import { stableId } from "@praxis/training-engine-v2";
import type { ProductionAdaptationApplicationOrchestrationAuditEvent,
  ProductionAdaptationApplicationOrchestrationInput,
  ProductionAdaptationApplicationOrchestrationResult } from "@praxis/training-engine-v2";
import type { PersistedAdaptationApplicationOrchestrationRun } from "./contracts";

export function adaptationApplicationOrchestrationRequestSemanticFingerprint(
  input: ProductionAdaptationApplicationOrchestrationInput,
): string {
  return stableId("adaptation-application-orchestration-request-semantic", {
    requestRevisionId: input.request.requestRevisionId,
    directiveRevisionId: input.request.directiveRevisionId,
    expectedCurrentRevisions: input.request.expectedCurrentRevisions,
  });
}

export function buildAdaptationApplicationOrchestrationAuditEvent(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly result: ProductionAdaptationApplicationOrchestrationResult;
  readonly policyReferences: readonly { readonly contractId: string; readonly contractVersion: string }[];
}): ProductionAdaptationApplicationOrchestrationAuditEvent {
  const request = input.orchestrationInput.request;
  const result = input.result;
  return Object.freeze({ auditEventId: stableId("adaptation-application-orchestration-audit", {
    requestRevisionId: request.requestRevisionId,
    orchestrationRevisionId: result.orchestrationRevision.orchestrationRevisionId }),
  athleteId: request.athleteId, principalOrServiceId: request.authenticatedPrincipalOrServiceId,
  requestId: request.requestId, requestRevisionId: request.requestRevisionId,
  directiveRevisionId: request.directiveRevisionId, decisionRevisionId: request.longitudinalDecisionRevisionId,
  currentRevisions: request.expectedCurrentRevisions, owner: request.requestedOwner,
  ownerPortReference: request.ownerPortReference, policyReferences: Object.freeze([...input.policyReferences]),
  preconditionState: result.preconditions.state,
  ownerResultFingerprint: result.ownerResult?.ownerResultFingerprint ?? null,
  shadowCandidateRevisionId: result.shadowCandidate?.shadowCandidateRevisionId ?? null,
  validationFingerprint: result.shadowCandidate?.downstreamValidation.validationFingerprint ?? null,
  finalUnappliedStatus: result.status, operationTime: request.evaluationTime, applicationApplied: false,
  provenance: Object.freeze(["adaptation-application-orchestration:append-only-audit"]) });
}

export function buildPersistedAdaptationApplicationOrchestrationRun(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly result: ProductionAdaptationApplicationOrchestrationResult;
  readonly policyReferences: readonly { readonly contractId: string; readonly contractVersion: string }[];
}): PersistedAdaptationApplicationOrchestrationRun {
  return Object.freeze({ requestSemanticFingerprint:
    adaptationApplicationOrchestrationRequestSemanticFingerprint(input.orchestrationInput),
  input: input.orchestrationInput, result: input.result,
  auditEvent: buildAdaptationApplicationOrchestrationAuditEvent(input) });
}
