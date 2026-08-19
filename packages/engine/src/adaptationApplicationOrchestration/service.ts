import { deriveProductionAdaptationApplicationOrchestrationRevisionId,
  orchestrateProductionAdaptationApplication, type ProductionAdaptationApplicationOrchestrationInput,
  type ProductionAdaptationApplicationOrchestrationResult } from "@praxis/training-engine-v2";
import { AdaptationApplicationOrchestrationPersistenceError,
  type AdaptationApplicationOrchestrationServiceDependencies } from "./contracts";
import { sanitizeAdaptationApplicationOrchestrationObservabilityEvent } from "./observability";
import { adaptationApplicationOrchestrationRequestSemanticFingerprint,
  buildPersistedAdaptationApplicationOrchestrationRun } from "./repository";

function persistedResult(result: ProductionAdaptationApplicationOrchestrationResult):
ProductionAdaptationApplicationOrchestrationResult {
  const current = result.orchestrationRevision;
  const revisionInput = { orchestrationId: current.orchestrationId,
    ownerResultFingerprint: result.ownerResult?.ownerResultFingerprint ?? null,
    proposedProgramRevisionId: result.shadowCandidate?.proposedProgramSnapshot?.snapshotRevisionId ?? null,
    validationFingerprint: result.shadowCandidate?.downstreamValidation.validationFingerprint ?? null,
    persistenceState: "persisted" as const, evaluationTime: current.evaluationTime,
    basedOnOrchestrationRevisionId: current.basedOnOrchestrationRevisionId };
  const status = result.status === "shadow_candidate_validated" ?
    "shadow_candidate_validated_persisted" as const : result.status;
  return Object.freeze({ ...result, status, orchestrationRevision: Object.freeze({ ...current, ...revisionInput,
    orchestrationRevisionId: deriveProductionAdaptationApplicationOrchestrationRevisionId(revisionInput) }) });
}

function assertUnapplied(result: ProductionAdaptationApplicationOrchestrationResult): void {
  if (result.applicationApplied !== false || result.productMutationApplied !== false ||
      result.ownerResult?.applicationApplied !== false && result.ownerResult !== null ||
      result.shadowCandidate?.applicationApplied !== false && result.shadowCandidate !== null) {
    throw new AdaptationApplicationOrchestrationPersistenceError("applied_state_rejected");
  }
}

export function createAdaptationApplicationOrchestrationService(
  dependencies: AdaptationApplicationOrchestrationServiceDependencies,
) {
  const emit = async (event: Parameters<typeof sanitizeAdaptationApplicationOrchestrationObservabilityEvent>[0]) =>
    dependencies.observability.emit(sanitizeAdaptationApplicationOrchestrationObservabilityEvent(event));
  return Object.freeze({
    orchestrateAdaptationApplication: async (input: ProductionAdaptationApplicationOrchestrationInput):
    Promise<ProductionAdaptationApplicationOrchestrationResult> => {
      const request = input.request;
      await emit({ name: "request_received", operationTime: request.evaluationTime,
        athleteId: request.athleteId, requestId: request.requestId, status: "received" });
      const fingerprint = adaptationApplicationOrchestrationRequestSemanticFingerprint(input);
      const prior = await dependencies.repository.getOrchestrationByIdempotencyKey(request.athleteId,
        request.idempotencyKey);
      if (prior) {
        if (prior.requestSemanticFingerprint !== fingerprint) {
          throw new AdaptationApplicationOrchestrationPersistenceError("idempotency_conflict");
        }
        await emit({ name: "idempotent_retry", operationTime: request.evaluationTime,
          athleteId: request.athleteId, requestId: request.requestId, status: "exact_retry" });
        return Object.freeze({ ...prior.result, status: "idempotent_prior_result",
          reasonCodes: Object.freeze([...new Set([...prior.result.reasonCodes,
            "EXACT_IDEMPOTENT_RETRY_RETURNED_PRIOR_RESULT"])].sort()) });
      }
      const evaluated = await orchestrateProductionAdaptationApplication(input, dependencies.pureDependencies);
      assertUnapplied(evaluated);
      await emit({ name: evaluated.preconditions.satisfied ? "preconditions_passed" : "preconditions_failed",
        operationTime: request.evaluationTime, athleteId: request.athleteId, requestId: request.requestId,
        status: evaluated.preconditions.state, reasonCodes: evaluated.preconditions.reasonCodes });
      if (request.mode !== "build_and_persist_shadow_result") return evaluated;
      const result = persistedResult(evaluated);
      const policyReferences = [dependencies.pureDependencies.orchestrationPolicy.reference,
        dependencies.pureDependencies.confirmationPolicy.reference,
        ...dependencies.pureDependencies.explicitOwnerPolicyReferences];
      const run = buildPersistedAdaptationApplicationOrchestrationRun({ orchestrationInput: input, result,
        policyReferences });
      try {
        return await dependencies.repository.transaction(async (transaction) => {
          await dependencies.repository.lockIdempotencyKey(request.athleteId, request.idempotencyKey, transaction);
          const concurrent = await dependencies.repository.getOrchestrationByIdempotencyKey(request.athleteId,
            request.idempotencyKey, transaction);
          if (concurrent) {
            if (concurrent.requestSemanticFingerprint !== fingerprint) {
              throw new AdaptationApplicationOrchestrationPersistenceError("idempotency_conflict");
            }
            return Object.freeze({ ...concurrent.result, status: "idempotent_prior_result" as const });
          }
          if (!await dependencies.recheckCurrentRevisions(request, transaction)) {
            throw new AdaptationApplicationOrchestrationPersistenceError("stale_before_persistence");
          }
          await dependencies.repository.persistOrchestrationRequestRevision(run, transaction);
          await dependencies.repository.persistPreconditionSnapshot(run, transaction);
          await dependencies.repository.persistOwnerResult(run, transaction);
          await dependencies.repository.persistShadowCandidate(run, transaction);
          await dependencies.repository.persistValidationResult(run, transaction);
          await dependencies.repository.persistOrchestrationRevision(run, transaction);
          await dependencies.repository.persistApplicationAttempt(run, transaction);
          await dependencies.repository.appendAuditEvent(run, transaction);
          await emit({ name: "orchestration_result_persisted", operationTime: request.evaluationTime,
            athleteId: request.athleteId, requestId: request.requestId,
            orchestrationRevisionId: result.orchestrationRevision.orchestrationRevisionId, status: result.status });
          return result;
        });
      } catch (error) {
        await emit({ name: "persistence_failed", operationTime: request.evaluationTime,
          athleteId: request.athleteId, requestId: request.requestId, status: "failed" });
        throw error;
      }
    },
  });
}
