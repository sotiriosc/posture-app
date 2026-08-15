import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import { PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE } from "./policies/longitudinalAdaptationPolicyV1";
import type {
  ProductionLongitudinalAdaptationDecisionRevision,
  ProductionLongitudinalAdaptationDecisionRevisionContext,
  ProductionLongitudinalAdaptationDecisionRevisionLedger,
  ProductionLongitudinalAdaptationStateRevision,
  ProductionLongitudinalAdaptationStateRevisionLedger,
  ProductionLongitudinalAdaptationThreadIdentity,
} from "./contracts";

export function deriveProductionLongitudinalThreadId(input: Omit<ProductionLongitudinalAdaptationThreadIdentity,
  "threadId" | "createdAt" | "owner" | "provenance">): string {
  return stableId("production-longitudinal-thread", {
    ...input, activeNeedIds: [...input.activeNeedIds].sort(), activeObjectiveIds: [...input.activeObjectiveIds].sort(),
  });
}

export function deriveProductionLongitudinalStateId(input: {
  readonly threadId: string; readonly athleteId: string;
}): string {
  return stableId("production-longitudinal-state", input);
}

export function deriveProductionLongitudinalStateRevisionId(input: Omit<ProductionLongitudinalAdaptationStateRevision,
  "revisionId" | "provenance">): string {
  return stableId("production-longitudinal-state-revision", input);
}

export function deriveProductionLongitudinalDecisionId(input: {
  readonly athleteId: string; readonly threadId: string; readonly evidenceWindowId: string;
  readonly decisionAttemptId: string;
}): string {
  return stableId("production-longitudinal-decision", input);
}

export function deriveProductionLongitudinalDecisionRevisionId(input: Omit<
ProductionLongitudinalAdaptationDecisionRevision, "decisionRevisionId" | "final" | "provenance">): string {
  return stableId("production-longitudinal-decision-revision", input);
}

export function deriveProductionLongitudinalDirectiveId(input: {
  readonly decisionId: string; readonly decisionRevisionId: string; readonly targetId: string;
  readonly action: string; readonly selectedAxis: string | null;
}): string {
  return stableId("production-longitudinal-directive", input);
}

export function validateProductionLongitudinalThreadIdentity(
  identity: ProductionLongitudinalAdaptationThreadIdentity,
): readonly string[] {
  const reasons: string[] = [];
  const { threadId: _threadId, createdAt: _createdAt, owner: _owner, provenance: _provenance, ...semantic } = identity;
  void [_threadId, _createdAt, _owner, _provenance];
  if (identity.threadId !== deriveProductionLongitudinalThreadId(semantic)) reasons.push("LONGITUDINAL_THREAD_ID_INVALID");
  if (!explicitIsoTime(identity.createdAt)) reasons.push("LONGITUDINAL_THREAD_CREATED_AT_INVALID");
  if (identity.owner !== "longitudinal_adaptation") reasons.push("LONGITUDINAL_THREAD_OWNER_INVALID");
  return uniqueSorted(reasons);
}

export function validateProductionLongitudinalStateRevisionLedger(
  ledger: ProductionLongitudinalAdaptationStateRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  if (!ledger.revisions.length) return Object.freeze(["LONGITUDINAL_STATE_REVISION_REQUIRED"]);
  const ids = new Set(ledger.revisions.map((revision) => revision.revisionId));
  if (ids.size !== ledger.revisions.length) reasons.push("DUPLICATE_LONGITUDINAL_STATE_REVISION_ID");
  const final = ledger.revisions.filter((revision) => revision.finalForDecision);
  if (final.length !== 1 || final[0]?.revisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_LONGITUDINAL_STATE_REVISION_REQUIRED");
  }
  for (const revision of ledger.revisions) {
    const { revisionId: _revisionId, provenance: _provenance, ...semantic } = revision;
    void [_revisionId, _provenance];
    if (revision.revisionId !== deriveProductionLongitudinalStateRevisionId(semantic)) {
      reasons.push("LONGITUDINAL_STATE_REVISION_ID_INVALID");
    }
    if (revision.stateIdentity.stateId !== ledger.stateId || !explicitIsoTime(revision.evaluationTime)) {
      reasons.push("LONGITUDINAL_STATE_REVISION_LINEAGE_INVALID");
    }
    if (revision.basedOnRevisionId !== null && !ids.has(revision.basedOnRevisionId)) {
      reasons.push("LONGITUDINAL_STATE_REVISION_BASED_ON_INVALID");
    }
  }
  const historicalIds = ledger.revisions.filter((revision) => !revision.finalForDecision)
    .map((revision) => revision.revisionId).sort();
  if (JSON.stringify(historicalIds) !== JSON.stringify([...ledger.finalizedHistoricalRevisionIds].sort())) {
    reasons.push("LONGITUDINAL_HISTORICAL_STATE_REVISIONS_INVALID");
  }
  return uniqueSorted(reasons);
}

export function buildProductionLongitudinalDecisionRevision(input: {
  readonly decisionId: string;
  readonly outcomeSnapshotRevisionId: string;
  readonly evidenceWindowId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly phaseContinuityDecisionRevisionId: string;
  readonly proposedApplicationSnapshotRevisionId: string | null;
  readonly stateRevisionId: string;
  readonly evaluationTime: string;
  readonly decisionContentFingerprint: string;
  readonly priorContext: ProductionLongitudinalAdaptationDecisionRevisionContext | null;
}): { readonly revision: ProductionLongitudinalAdaptationDecisionRevision;
  readonly ledger: ProductionLongitudinalAdaptationDecisionRevisionLedger } {
  const prior = input.priorContext?.ledger.revisions ?? [];
  const semantic = {
    decisionId: input.decisionId,
    basedOnRevisionId: input.priorContext?.ledger.finalRevisionId ?? null,
    reasonCode: input.priorContext?.reasonCode ?? "initial_evaluation" as const,
    policyReference: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
    outcomeSnapshotRevisionId: input.outcomeSnapshotRevisionId,
    evidenceWindowId: input.evidenceWindowId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
    phaseContinuityDecisionRevisionId: input.phaseContinuityDecisionRevisionId,
    proposedApplicationSnapshotRevisionId: input.proposedApplicationSnapshotRevisionId,
    stateRevisionId: input.stateRevisionId,
    evaluationTime: input.evaluationTime,
    decisionContentFingerprint: input.decisionContentFingerprint,
  };
  const revision: ProductionLongitudinalAdaptationDecisionRevision = Object.freeze({ ...semantic,
    decisionRevisionId: deriveProductionLongitudinalDecisionRevisionId(semantic), final: true,
    provenance: Object.freeze(["production-longitudinal:immutable-decision-revision"]) });
  const historical = prior.map((entry) => Object.freeze({ ...entry, final: false }));
  return Object.freeze({ revision, ledger: Object.freeze({ decisionId: input.decisionId,
    revisions: Object.freeze([...historical, revision]), finalRevisionId: revision.decisionRevisionId,
    finalizedHistoricalRevisionIds: Object.freeze(prior.map((entry) => entry.decisionRevisionId)) }) });
}

export function validateProductionLongitudinalDecisionRevisionLedger(
  ledger: ProductionLongitudinalAdaptationDecisionRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  const ids = new Set(ledger.revisions.map((revision) => revision.decisionRevisionId));
  if (ids.size !== ledger.revisions.length) reasons.push("DUPLICATE_LONGITUDINAL_DECISION_REVISION_ID");
  const final = ledger.revisions.filter((revision) => revision.final);
  if (final.length !== 1 || final[0]?.decisionRevisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_LONGITUDINAL_DECISION_REVISION_REQUIRED");
  }
  for (const revision of ledger.revisions) {
    const { decisionRevisionId: _id, final: _final, provenance: _provenance, ...semantic } = revision;
    void [_id, _final, _provenance];
    if (revision.decisionRevisionId !== deriveProductionLongitudinalDecisionRevisionId(semantic)) {
      reasons.push("LONGITUDINAL_DECISION_REVISION_ID_INVALID");
    }
    if (revision.decisionId !== ledger.decisionId || !explicitIsoTime(revision.evaluationTime)) {
      reasons.push("LONGITUDINAL_DECISION_REVISION_LINEAGE_INVALID");
    }
    if (revision.basedOnRevisionId !== null && !ids.has(revision.basedOnRevisionId)) {
      reasons.push("LONGITUDINAL_DECISION_REVISION_BASED_ON_INVALID");
    }
  }
  return uniqueSorted(reasons);
}
