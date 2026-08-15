import { canonicalize, stableId } from "../prescription/compiler/utilities";
import type { OutcomeSourceDecisionUseAuthorization, OutcomeSourceRecordRevisionLedger,
  ProductionOutcomeSourceSnapshot } from "./designContracts";
import {
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  REPLAY_ADAPTER_VERSION_UNAVAILABLE,
  buildVersionedProductionOutcomeSourceSnapshot,
  type ProductionOutcomeSourceAdapterRegistry,
} from "./productionContracts";

export const PRODUCTION_OUTCOME_SOURCE_REPLAY_MODES = Object.freeze([
  "source_only", "snapshot_only", "decision_compare", "full_audit_compare",
] as const);
export type ProductionOutcomeSourceReplayMode = typeof PRODUCTION_OUTCOME_SOURCE_REPLAY_MODES[number];

export interface ProductionOutcomeSourceHistoricalAdapterReference {
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly payloadSchemaId: string;
  readonly payloadSchemaVersion: string;
}

export interface ProductionOutcomeSourceReplayInput<TLedger = unknown, TDecision = unknown> {
  readonly replayContractReference: typeof PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE;
  readonly mode: ProductionOutcomeSourceReplayMode;
  readonly athleteId: string;
  readonly evaluationTime: string;
  readonly snapshotId: string;
  readonly revisionLedgers: readonly OutcomeSourceRecordRevisionLedger[];
  readonly authorizations: readonly OutcomeSourceDecisionUseAuthorization[];
  readonly unresolvedSourceCategories: ProductionOutcomeSourceSnapshot["unresolvedSourceCategories"];
  readonly historicalAdapterReferences: readonly ProductionOutcomeSourceHistoricalAdapterReference[];
  readonly adapterRegistry: ProductionOutcomeSourceAdapterRegistry;
  readonly storedSnapshotFingerprint: string | null;
  readonly storedLedger: TLedger | null;
  readonly storedDecision: TDecision | null;
  readonly buildCompletedLedger?: (snapshot: ProductionOutcomeSourceSnapshot) => TLedger;
  readonly evaluateDecision?: (snapshot: ProductionOutcomeSourceSnapshot, ledger: TLedger | null) => TDecision;
}

export interface ProductionOutcomeSourceReplayResult<TLedger = unknown, TDecision = unknown> {
  readonly status: "matched" | "mismatched" | "rejected";
  readonly mode: ProductionOutcomeSourceReplayMode;
  readonly rebuiltSnapshot: ProductionOutcomeSourceSnapshot | null;
  readonly rebuiltLedger: TLedger | null;
  readonly rebuiltDecision: TDecision | null;
  readonly snapshotMatched: boolean | null;
  readonly ledgerMatched: boolean | null;
  readonly decisionMatched: boolean | null;
  readonly mismatchPaths: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly duplicateDecisionCount: 0;
  readonly directiveApplicationCount: 0;
  readonly persistenceWriteCount: 0;
  readonly fingerprint: string;
}

function semanticEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function rejected<TLedger, TDecision>(
  mode: ProductionOutcomeSourceReplayMode,
  reasons: readonly string[],
): ProductionOutcomeSourceReplayResult<TLedger, TDecision> {
  const result = { status: "rejected" as const, mode, rebuiltSnapshot: null, rebuiltLedger: null,
    rebuiltDecision: null, snapshotMatched: null, ledgerMatched: null, decisionMatched: null,
    mismatchPaths: Object.freeze<string[]>([]), reasonCodes: Object.freeze([...reasons].sort()),
    duplicateDecisionCount: 0 as const, directiveApplicationCount: 0 as const, persistenceWriteCount: 0 as const };
  return Object.freeze({ ...result, fingerprint: stableId("production-outcome-source-replay", result) });
}

export function replayOutcomeSourceHistory<TLedger = unknown, TDecision = unknown>(
  input: ProductionOutcomeSourceReplayInput<TLedger, TDecision>,
): ProductionOutcomeSourceReplayResult<TLedger, TDecision> {
  if (input.replayContractReference.contractId !== PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE.contractId ||
      input.replayContractReference.contractVersion !== PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE.contractVersion) {
    return rejected(input.mode, ["UNSUPPORTED_PRODUCTION_OUTCOME_SOURCE_REPLAY_VERSION"]);
  }
  const unavailable = input.historicalAdapterReferences.filter((reference) =>
    !input.adapterRegistry.adapters.some((adapter) => adapter.adapterId === reference.adapterId &&
      adapter.adapterVersion === reference.adapterVersion && adapter.payloadSchemaId === reference.payloadSchemaId &&
      adapter.payloadSchemaVersion === reference.payloadSchemaVersion));
  if (unavailable.length) return rejected(input.mode, [REPLAY_ADAPTER_VERSION_UNAVAILABLE,
    ...unavailable.map((reference) => `${reference.adapterId}@${reference.adapterVersion}`)]);
  const snapshotResult = buildVersionedProductionOutcomeSourceSnapshot({
    ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    snapshotId: input.snapshotId, athleteId: input.athleteId, evaluationTime: input.evaluationTime,
    revisionLedgers: input.revisionLedgers, authorizations: input.authorizations,
    unresolvedSourceCategories: input.unresolvedSourceCategories,
    provenance: Object.freeze([`production-replay:${input.mode}`]),
  });
  if (!snapshotResult.snapshot) return rejected(input.mode, snapshotResult.reasonCodes);
  const snapshot = snapshotResult.snapshot;
  const compareSnapshot = input.storedSnapshotFingerprint !== null;
  const snapshotMatched = compareSnapshot ? input.storedSnapshotFingerprint === snapshot.fingerprint : null;
  const needsLedger = input.mode === "decision_compare" || input.mode === "full_audit_compare";
  const rebuiltLedger = needsLedger && input.buildCompletedLedger ? input.buildCompletedLedger(snapshot) : null;
  const ledgerMatched = needsLedger && input.storedLedger !== null && rebuiltLedger !== null ?
    semanticEqual(input.storedLedger, rebuiltLedger) : null;
  const rebuiltDecision = needsLedger && input.evaluateDecision ? input.evaluateDecision(snapshot, rebuiltLedger) : null;
  const decisionMatched = needsLedger && input.storedDecision !== null && rebuiltDecision !== null ?
    semanticEqual(input.storedDecision, rebuiltDecision) : null;
  const mismatchPaths: string[] = [];
  if (snapshotMatched === false) mismatchPaths.push("snapshot.fingerprint");
  if (ledgerMatched === false) mismatchPaths.push("completedExposureLedger");
  if (decisionMatched === false) mismatchPaths.push("longitudinalDecision");
  const result = { status: mismatchPaths.length ? "mismatched" as const : "matched" as const,
    mode: input.mode, rebuiltSnapshot: snapshot, rebuiltLedger, rebuiltDecision, snapshotMatched,
    ledgerMatched, decisionMatched, mismatchPaths: Object.freeze(mismatchPaths), reasonCodes: Object.freeze<string[]>([]),
    duplicateDecisionCount: 0 as const, directiveApplicationCount: 0 as const, persistenceWriteCount: 0 as const };
  return Object.freeze({ ...result, fingerprint: stableId("production-outcome-source-replay", {
    status: result.status, mode: result.mode, snapshotFingerprint: snapshot.fingerprint,
    rebuiltLedger, rebuiltDecision, mismatchPaths,
  }) });
}
