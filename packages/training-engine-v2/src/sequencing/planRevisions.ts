import type {
  FinalSessionSequenceRevisionContext,
  FinalSequencingSearchResourcePolicy,
  ProductionFinalSequenceRevision,
  ProductionFinalSequenceRevisionLedger,
  ProductionSequencingAssignmentFact,
  ExplicitProductionSequencingTransitionFact,
  ProductionFinalSessionSequencingContractReference,
} from "./contracts";
import type { FinalSessionSequencingPolicyReference } from "./policies/contracts";
import { buildFinalSessionSequenceRevisionId, finalSequencingDeterministicToken } from "./planIdentity";
import { PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE } from "./contracts";

export interface FinalSequenceRevisionBuildResult {
  readonly revision: ProductionFinalSequenceRevision | null;
  readonly ledger: ProductionFinalSequenceRevisionLedger | null;
  readonly errors: readonly string[];
}

function explicitIsoTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateSequencingPlanRevisionLedger(
  ledger: ProductionFinalSequenceRevisionLedger,
): readonly string[] {
  const errors: string[] = [];
  const revisionIds = ledger.revisions.map((revision) => revision.sequenceRevisionId);
  if (
    ledger.sequencingContract.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId ||
    ledger.sequencingContract.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
  ) errors.push("SEQUENCE_REVISION_LEDGER_CONTRACT_MISMATCH");
  if (new Set(revisionIds).size !== revisionIds.length) errors.push("DUPLICATE_SEQUENCE_REVISION_ID");
  if (!revisionIds.includes(ledger.finalRevisionId)) errors.push("SEQUENCE_FINAL_REVISION_NOT_FOUND");
  if (revisionIds.at(-1) !== ledger.finalRevisionId) errors.push("SEQUENCE_FINAL_REVISION_NOT_LATEST");
  if (new Set(ledger.completedRevisionIds).size !== ledger.completedRevisionIds.length) {
    errors.push("DUPLICATE_COMPLETED_SEQUENCE_REVISION_ID");
  }
  if (ledger.completedRevisionIds.some((id) => !revisionIds.includes(id))) {
    errors.push("COMPLETED_SEQUENCE_REVISION_NOT_FOUND");
  }
  const byId = new Map(ledger.revisions.map((revision) => [revision.sequenceRevisionId, revision]));
  for (const [index, revision] of ledger.revisions.entries()) {
    if (
      revision.sequencePlanId !== ledger.sequencePlanId ||
      revision.executionAttemptId !== ledger.executionAttemptId
    ) errors.push("SEQUENCE_REVISION_LEDGER_IDENTITY_MISMATCH");
    if (
      revision.sequencingContract.contractId !== ledger.sequencingContract.contractId ||
      revision.sequencingContract.contractVersion !== ledger.sequencingContract.contractVersion
    ) errors.push("SEQUENCE_REVISION_CONTRACT_MISMATCH");
    if (!explicitIsoTime(revision.createdAt)) errors.push("SEQUENCE_REVISION_INVALID_CREATED_AT");
    if (new Set(revision.changedFieldRefs).size !== revision.changedFieldRefs.length) {
      errors.push("DUPLICATE_SEQUENCE_REVISION_CHANGED_FIELD_REF");
    }
    if (revision.basedOnRevisionId && !byId.has(revision.basedOnRevisionId)) {
      errors.push("SEQUENCE_REVISION_BASE_NOT_FOUND");
    }
    const expectedBase = index === 0 ? null : ledger.revisions[index - 1].sequenceRevisionId;
    if (revision.basedOnRevisionId !== expectedBase) errors.push("SEQUENCE_REVISION_CHAIN_NOT_LINEAR");
    if (index > 0 && Date.parse(revision.createdAt) < Date.parse(ledger.revisions[index - 1].createdAt)) {
      errors.push("SEQUENCE_REVISION_TIME_NOT_MONOTONIC");
    }
    const { revisionContentFingerprint, ...content } = revision;
    if (revisionContentFingerprint !== finalSequencingDeterministicToken(content)) {
      errors.push("SEQUENCE_REVISION_CONTENT_FINGERPRINT_MISMATCH");
    }
  }
  const superseded = new Set<string>();
  if (ledger.supersessions.length !== Math.max(0, ledger.revisions.length - 1)) {
    errors.push("SEQUENCE_SUPERSESSION_CHAIN_INCOMPLETE");
  }
  for (const [index, entry] of ledger.supersessions.entries()) {
    if (!byId.has(entry.supersededRevisionId) || !byId.has(entry.supersedingRevisionId)) {
      errors.push("SEQUENCE_SUPERSESSION_REVISION_NOT_FOUND");
    }
    if (superseded.has(entry.supersededRevisionId)) errors.push("SEQUENCE_REVISION_SUPERSEDED_MORE_THAN_ONCE");
    if (ledger.completedRevisionIds.includes(entry.supersededRevisionId)) {
      errors.push("COMPLETED_SEQUENCE_REVISION_SUPERSEDED");
    }
    const supersedingRevision = ledger.revisions[index + 1];
    if (
      entry.supersededRevisionId !== ledger.revisions[index]?.sequenceRevisionId ||
      entry.supersedingRevisionId !== supersedingRevision?.sequenceRevisionId
    ) errors.push("SEQUENCE_SUPERSESSION_CHAIN_NOT_LINEAR");
    if (!explicitIsoTime(entry.occurredAt)) errors.push("SEQUENCE_SUPERSESSION_INVALID_OCCURRED_AT");
    if (supersedingRevision && (
      entry.occurredAt !== supersedingRevision.createdAt ||
      entry.reasonCode !== supersedingRevision.reasonCode
    )) errors.push("SEQUENCE_SUPERSESSION_REVISION_MISMATCH");
    superseded.add(entry.supersededRevisionId);
  }
  if (superseded.has(ledger.finalRevisionId)) errors.push("SEQUENCE_FINAL_REVISION_SUPERSEDED");
  return [...new Set(errors)].sort();
}

export function buildProductionFinalSequenceRevision(input: {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly sequencePlanId: string;
  readonly executionAttemptId: string;
  readonly policyRef: FinalSessionSequencingPolicyReference;
  readonly assignments: readonly ProductionSequencingAssignmentFact[];
  readonly explicitTransitionFacts: readonly ExplicitProductionSequencingTransitionFact[];
  readonly searchResourcePolicy: FinalSequencingSearchResourcePolicy;
  readonly evaluationTime: string;
  readonly revisionContext: FinalSessionSequenceRevisionContext | null;
}): FinalSequenceRevisionBuildResult {
  const errors: string[] = [];
  const priorLedger = input.revisionContext?.ledger ?? null;
  if (!explicitIsoTime(input.evaluationTime)) errors.push("INVALID_SEQUENCE_REVISION_EVALUATION_TIME");
  if (priorLedger) {
    errors.push(...validateSequencingPlanRevisionLedger(priorLedger));
    if (
      priorLedger.sequencePlanId !== input.sequencePlanId ||
      priorLedger.executionAttemptId !== input.executionAttemptId
    ) errors.push("SEQUENCE_REVISION_CONTEXT_IDENTITY_MISMATCH");
    if (priorLedger.completedRevisionIds.includes(priorLedger.finalRevisionId)) {
      errors.push("COMPLETED_SEQUENCE_REVISION_IMMUTABLE");
    }
  }
  if (errors.length > 0) return { revision: null, ledger: null, errors: [...new Set(errors)].sort() };

  const basedOnRevisionId = priorLedger?.finalRevisionId ?? null;
  const sequenceRevisionId = buildFinalSessionSequenceRevisionId({
    sequencingContract: input.sequencingContract,
    sequencePlanId: input.sequencePlanId,
    policyRef: input.policyRef,
    assignments: input.assignments,
    transitionFacts: input.explicitTransitionFacts,
    searchResourcePolicy: input.searchResourcePolicy,
    evaluationTime: input.evaluationTime,
    priorRevisionId: basedOnRevisionId,
  });
  if (priorLedger?.revisions.some((revision) => revision.sequenceRevisionId === sequenceRevisionId)) {
    return { revision: null, ledger: null, errors: ["DUPLICATE_SEQUENCE_REVISION_ID"] };
  }
  const revisionContent: Omit<ProductionFinalSequenceRevision, "revisionContentFingerprint"> = {
    sequencingContract: input.sequencingContract,
    sequenceRevisionId,
    sequencePlanId: input.sequencePlanId,
    executionAttemptId: input.executionAttemptId,
    basedOnRevisionId,
    reasonCode: input.revisionContext?.reasonCode ?? "initial_sequence",
    createdAt: input.evaluationTime,
    changedFieldRefs: input.revisionContext?.changedFieldRefs ?? ["initial_sequence"],
    policyRef: input.policyRef,
    finalPrescriptionRevisionIds: input.assignments.map((fact) => fact.finalPrescriptionRevisionId).sort(),
    transitionFactIds: input.explicitTransitionFacts.map((fact) => fact.transitionFactId).sort(),
    searchResourcePolicyRef: {
      policyId: input.searchResourcePolicy.policyId,
      version: input.searchResourcePolicy.version,
    },
    provenance: [{
      source: "prescription_contract",
      sourceRef: `final-sequencing-revision:${finalSequencingDeterministicToken(sequenceRevisionId)}`,
    }],
  };
  const revision: ProductionFinalSequenceRevision = {
    ...revisionContent,
    revisionContentFingerprint: finalSequencingDeterministicToken(revisionContent),
  };
  const supersessions = priorLedger ? [
    ...priorLedger.supersessions,
    {
      supersededRevisionId: priorLedger.finalRevisionId,
      supersedingRevisionId: sequenceRevisionId,
      occurredAt: input.evaluationTime,
      reasonCode: input.revisionContext!.reasonCode,
    },
  ] : [];
  const ledger: ProductionFinalSequenceRevisionLedger = {
    sequencingContract: input.sequencingContract,
    sequencePlanId: input.sequencePlanId,
    executionAttemptId: input.executionAttemptId,
    revisions: [...(priorLedger?.revisions ?? []), revision],
    supersessions,
    finalRevisionId: sequenceRevisionId,
    completedRevisionIds: priorLedger?.completedRevisionIds ?? [],
  };
  const ledgerErrors = validateSequencingPlanRevisionLedger(ledger);
  return ledgerErrors.length > 0
    ? { revision: null, ledger: null, errors: ledgerErrors }
    : { revision, ledger, errors: [] };
}
