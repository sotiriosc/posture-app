import type {
  PrescriptionRevisionContext,
  ProductionPrescriptionRevision,
  ProductionPrescriptionRevisionLedger,
} from "./contracts";
import type { PrescriptionPolicyReference } from "../policies";
import { explicitIsoTime, productionProvenance, stableId } from "./utilities";

export interface RevisionLedgerBuildResult {
  readonly status: "valid" | "invalid_revision_context";
  readonly ledger: ProductionPrescriptionRevisionLedger | null;
  readonly reasonCodes: readonly string[];
}

export function buildPrescriptionRevisionLedger(input: {
  readonly prescriptionId: string;
  readonly sourceExposureEventId: string;
  readonly executionAttemptId: string;
  readonly evaluationTime: string;
  readonly policyRef: PrescriptionPolicyReference;
  readonly unresolvedRequirementRefs: readonly string[];
  readonly revisionContext: PrescriptionRevisionContext | null;
}): RevisionLedgerBuildResult {
  if (!explicitIsoTime(input.evaluationTime)) {
    return {
      status: "invalid_revision_context",
      ledger: null,
      reasonCodes: ["REVISION_EVALUATION_TIME_INVALID"],
    };
  }

  const prior = input.revisionContext?.ledger ?? null;
  const reasonCodes = prior ? validatePrescriptionRevisionLedger(prior) : [];
  if (prior) {
    if (prior.prescriptionId !== input.prescriptionId) reasonCodes.push("REVISION_PRESCRIPTION_ID_MISMATCH");
    if (prior.sourceExposureEventId !== input.sourceExposureEventId) reasonCodes.push("REVISION_SOURCE_EVENT_ID_MISMATCH");
    if (prior.executionAttemptId !== input.executionAttemptId) reasonCodes.push("REVISION_EXECUTION_ATTEMPT_ID_MISMATCH");
    if (prior.completedRevisionIds.includes(prior.finalRevisionId)) {
      reasonCodes.push("COMPLETED_HISTORY_IMMUTABLE");
    }
  }
  if (reasonCodes.length > 0) {
    return { status: "invalid_revision_context", ledger: null, reasonCodes };
  }

  const basedOnRevisionId = prior?.finalRevisionId ?? null;
  const reasonCode: ProductionPrescriptionRevision["reasonCode"] =
    input.revisionContext?.reasonCode ?? "initial_compilation";
  const changedFieldRefs = input.revisionContext?.changedFieldRefs ?? [];
  const prescriptionRevisionId = stableId("prescription-revision", {
    prescriptionId: input.prescriptionId,
    sourceExposureEventId: input.sourceExposureEventId,
    executionAttemptId: input.executionAttemptId,
    basedOnRevisionId,
    reasonCode,
    changedFieldRefs: [...changedFieldRefs].sort(),
    evaluationTime: input.evaluationTime,
  });
  if (prior?.revisions.some((revision) => revision.prescriptionRevisionId === prescriptionRevisionId)) {
    return {
      status: "invalid_revision_context",
      ledger: null,
      reasonCodes: ["DUPLICATE_PRESCRIPTION_REVISION_ID"],
    };
  }
  const revision: ProductionPrescriptionRevision = Object.freeze({
    prescriptionRevisionId,
    prescriptionId: input.prescriptionId,
    sourceExposureEventId: input.sourceExposureEventId,
    executionAttemptId: input.executionAttemptId,
    basedOnRevisionId,
    reasonCode,
    createdAt: input.evaluationTime,
    changedFieldRefs: [...changedFieldRefs].sort(),
    policyRef: input.policyRef,
    unresolvedRequirementRefs: [...input.unresolvedRequirementRefs].sort(),
    provenance: productionProvenance(`prescription-compiler:revision:${prescriptionRevisionId}`),
  });
  const ledger: ProductionPrescriptionRevisionLedger = Object.freeze({
    prescriptionId: input.prescriptionId,
    sourceExposureEventId: input.sourceExposureEventId,
    executionAttemptId: input.executionAttemptId,
    revisions: Object.freeze([...(prior?.revisions ?? []), revision]),
    supersessions: Object.freeze([
      ...(prior?.supersessions ?? []),
      ...(basedOnRevisionId ? [{
        supersededRevisionId: basedOnRevisionId,
        supersedingRevisionId: prescriptionRevisionId,
        occurredAt: input.evaluationTime,
        reasonCode,
      }] : []),
    ]),
    finalRevisionId: prescriptionRevisionId,
    completedRevisionIds: Object.freeze([...(prior?.completedRevisionIds ?? [])]),
  });
  const postValidation = validatePrescriptionRevisionLedger(ledger);
  return postValidation.length === 0
    ? { status: "valid", ledger, reasonCodes: [] }
    : { status: "invalid_revision_context", ledger: null, reasonCodes: postValidation };
}

export function validatePrescriptionRevisionLedger(
  ledger: ProductionPrescriptionRevisionLedger,
): string[] {
  const reasons: string[] = [];
  const mutatedFinalIds = (ledger as unknown as { readonly finalRevisionIds?: unknown }).finalRevisionIds;
  if (Array.isArray(mutatedFinalIds) && mutatedFinalIds.length !== 1) {
    reasons.push("INVALID_FINAL_REVISION_COUNT");
  }
  const ids = ledger.revisions.map((revision) => revision.prescriptionRevisionId);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) reasons.push("DUPLICATE_PRESCRIPTION_REVISION_ID");
  if (!idSet.has(ledger.finalRevisionId)) reasons.push("FINAL_REVISION_NOT_IN_LEDGER");
  for (const revision of ledger.revisions) {
    if (revision.prescriptionId !== ledger.prescriptionId) reasons.push("REVISION_PRESCRIPTION_ID_MISMATCH");
    if (revision.sourceExposureEventId !== ledger.sourceExposureEventId) reasons.push("REVISION_SOURCE_EVENT_ID_MISMATCH");
    if (revision.executionAttemptId !== ledger.executionAttemptId) reasons.push("REVISION_EXECUTION_ATTEMPT_ID_MISMATCH");
    if (revision.basedOnRevisionId !== null && !idSet.has(revision.basedOnRevisionId)) {
      reasons.push("BROKEN_REVISION_ANCESTRY");
    }
    if (!explicitIsoTime(revision.createdAt)) reasons.push("REVISION_TIME_INVALID");
  }
  const superseded = new Set<string>();
  for (const edge of ledger.supersessions) {
    if (!idSet.has(edge.supersededRevisionId) || !idSet.has(edge.supersedingRevisionId)) {
      reasons.push("BROKEN_REVISION_SUPERSESSION");
    }
    if (superseded.has(edge.supersededRevisionId)) reasons.push("REVISION_SUPERSEDED_MORE_THAN_ONCE");
    superseded.add(edge.supersededRevisionId);
  }
  if (superseded.has(ledger.finalRevisionId)) reasons.push("FINAL_REVISION_SUPERSEDED");
  if (ledger.completedRevisionIds.some((id) => !idSet.has(id))) reasons.push("UNKNOWN_COMPLETED_REVISION_ID");
  return [...new Set(reasons)].sort();
}
