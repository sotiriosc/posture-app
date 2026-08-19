import {
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  replayOutcomeSourceHistory as replayPureOutcomeSourceHistory,
  type ProductionOutcomeSourceAdapterRegistry,
  type ProductionOutcomeSourceHistoricalAdapterReference,
  type ProductionOutcomeSourceReplayMode,
  type ProductionOutcomeSourceReplayResult,
} from "@praxis/training-engine-v2";
import type { OutcomeSourcePersistencePort } from "./contracts";
import { NOOP_OUTCOME_SOURCE_OBSERVABILITY, type OutcomeSourceObservability } from "./observability";

export async function replayOutcomeSourceHistory<TLedger = unknown, TDecision = unknown>(input: {
  readonly repository: OutcomeSourcePersistencePort;
  readonly athleteId: string;
  readonly evaluationTime: string;
  readonly snapshotId: string;
  readonly mode: ProductionOutcomeSourceReplayMode;
  readonly adapterRegistry: ProductionOutcomeSourceAdapterRegistry;
  readonly historicalAdapterReferences: readonly ProductionOutcomeSourceHistoricalAdapterReference[];
  readonly authorizations: Parameters<typeof replayPureOutcomeSourceHistory<TLedger, TDecision>>[0]["authorizations"];
  readonly storedSnapshotFingerprint: string | null;
  readonly storedLedger: TLedger | null;
  readonly storedDecision: TDecision | null;
  readonly buildCompletedLedger?: Parameters<typeof replayPureOutcomeSourceHistory<TLedger, TDecision>>[0]["buildCompletedLedger"];
  readonly evaluateDecision?: Parameters<typeof replayPureOutcomeSourceHistory<TLedger, TDecision>>[0]["evaluateDecision"];
  readonly operationTime: string;
  readonly observability?: OutcomeSourceObservability;
}): Promise<ProductionOutcomeSourceReplayResult<TLedger, TDecision>> {
  const revisionLedgers = await input.repository.readRevisionLedgers(input.athleteId);
  const result = replayPureOutcomeSourceHistory<TLedger, TDecision>({
    replayContractReference: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
    mode: input.mode, athleteId: input.athleteId, evaluationTime: input.evaluationTime,
    snapshotId: input.snapshotId, revisionLedgers, authorizations: input.authorizations,
    unresolvedSourceCategories: Object.freeze([]), historicalAdapterReferences: input.historicalAdapterReferences,
    adapterRegistry: input.adapterRegistry, storedSnapshotFingerprint: input.storedSnapshotFingerprint,
    storedLedger: input.storedLedger, storedDecision: input.storedDecision,
    buildCompletedLedger: input.buildCompletedLedger, evaluateDecision: input.evaluateDecision,
  });
  await (input.observability ?? NOOP_OUTCOME_SOURCE_OBSERVABILITY).emit({
    name: result.status === "matched" ? "replay_matched" : "replay_mismatched",
    operationTime: input.operationTime, athleteId: input.athleteId, entityId: input.snapshotId,
    status: result.status, reasonCodes: result.reasonCodes,
  });
  return result;
}

export const OUTCOME_SOURCE_REPLAY_PERSISTENCE_WRITE_COUNT = 0 as const;
export const OUTCOME_SOURCE_REPLAY_DUPLICATE_DECISION_COUNT = 0 as const;
export const OUTCOME_SOURCE_REPLAY_DIRECTIVE_APPLICATION_COUNT = 0 as const;
