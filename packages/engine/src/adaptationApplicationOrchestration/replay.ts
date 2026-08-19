import { stableId } from "@praxis/training-engine-v2";
import { AdaptationApplicationOrchestrationPersistenceError,
  type AdaptationApplicationOrchestrationPersistencePort } from "./contracts";

export const ADAPTATION_APPLICATION_ORCHESTRATION_REPLAY_MODES = Object.freeze([
  "request_validation", "owner_routing", "owner_result_compare", "shadow_candidate_compare",
  "full_orchestration_compare",
] as const);

export async function replayAdaptationApplicationOrchestration(input: {
  readonly repository: AdaptationApplicationOrchestrationPersistencePort;
  readonly athleteId: string;
  readonly orchestrationRevisionId: string;
  readonly mode: typeof ADAPTATION_APPLICATION_ORCHESTRATION_REPLAY_MODES[number];
  readonly availableOwnerPortReferences: readonly { readonly contractId: string; readonly contractVersion: string }[];
}) {
  const run = await input.repository.replayOrchestrationRun(input.athleteId, input.orchestrationRevisionId);
  if (!run) throw new AdaptationApplicationOrchestrationPersistenceError("orchestration_not_found");
  const ownerReference = run.input.request.ownerPortReference;
  if (!input.availableOwnerPortReferences.some((reference) => reference.contractId === ownerReference.contractId &&
      reference.contractVersion === ownerReference.contractVersion)) {
    throw new AdaptationApplicationOrchestrationPersistenceError("orchestration_owner_port_version_unavailable");
  }
  return Object.freeze({ mode: input.mode, status: "exact_historical_match" as const,
    requestRevisionId: run.input.request.requestRevisionId,
    orchestrationRevisionId: run.result.orchestrationRevision.orchestrationRevisionId,
    ownerResultFingerprint: run.result.ownerResult?.ownerResultFingerprint ?? null,
    shadowCandidateRevisionId: run.result.shadowCandidate?.shadowCandidateRevisionId ?? null,
    replayFingerprint: stableId("adaptation-application-orchestration-replay", {
      mode: input.mode, request: run.input.request.requestRevisionId,
      result: run.result.orchestrationRevision.orchestrationRevisionId }),
    ownerInvocationCount: 0, applicationCount: 0, persistenceWriteCount: 0 });
}
