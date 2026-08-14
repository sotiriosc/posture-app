import { stableId } from "../prescription/compiler/utilities";
import type {
  ProductionPostPrescriptionWeekValidationInput,
  ProductionPostPrescriptionWeekValidationRevision,
  ProductionPostPrescriptionWeekValidationRevisionLedger,
} from "./contracts";
import type { PostPrescriptionWeekValidationPolicyReference } from "./policies/contracts";

export type PostPrescriptionWeekValidationId = string;
export type PostPrescriptionWeekValidationRevisionId = string;

export function derivePostPrescriptionWeekValidationId(
  input: Pick<ProductionPostPrescriptionWeekValidationInput, "validatorContract" | "weekSource">,
): PostPrescriptionWeekValidationId {
  return stableId("post-prescription-week-validation", {
    validatorContractId: input.validatorContract.contractId,
    athleteId: input.weekSource.athleteId,
    planningHorizonId: input.weekSource.planningHorizonId,
    weeklyIntentId: input.weekSource.weeklyIntentId,
    weekAllocationPlanId: input.weekSource.weekAllocationPlanId,
  });
}

export function collectFinalPrescriptionRevisionIds(
  input: Pick<ProductionPostPrescriptionWeekValidationInput, "sessionBundles">,
): readonly string[] {
  return [...new Set(input.sessionBundles.flatMap((bundle) =>
    bundle.prescriptionCompilation?.plans.map((plan) => plan.revisionLedger.finalRevisionId) ?? []))].sort();
}

export function collectFinalSequenceRevisionIds(
  input: Pick<ProductionPostPrescriptionWeekValidationInput, "sessionBundles">,
): readonly string[] {
  return [...new Set(input.sessionBundles.flatMap((bundle) =>
    bundle.sequencingResult?.plan ? [bundle.sequencingResult.plan.revisionLedger.finalRevisionId] : []))].sort();
}

export function derivePostPrescriptionWeekValidationRevisionId(input: {
  readonly validationId: PostPrescriptionWeekValidationId;
  readonly policyRef: PostPrescriptionWeekValidationPolicyReference | null;
  readonly validationInput: ProductionPostPrescriptionWeekValidationInput;
  readonly basedOnRevisionId: string | null;
}): PostPrescriptionWeekValidationRevisionId {
  const source = input.validationInput.weekSource;
  return stableId("post-prescription-week-validation-revision", {
    validationId: input.validationId,
    validatorContract: input.validationInput.validatorContract,
    policyRef: input.policyRef,
    sourceSnapshotRevisionId: source.sourceSnapshotRevisionId,
    finalPrescriptionRevisionIds: collectFinalPrescriptionRevisionIds(input.validationInput),
    finalSequenceRevisionIds: collectFinalSequenceRevisionIds(input.validationInput),
    reservationStates: [...source.reservations]
      .sort((left, right) => left.reservationId.localeCompare(right.reservationId))
      .map((reservation) => ({
        reservationId: reservation.reservationId,
        opportunityId: reservation.opportunityId,
        availabilityState: reservation.availabilityState,
        executionState: reservation.executionState,
        invalidationState: reservation.invalidationState,
      })),
    opportunityStates: [...source.opportunities]
      .sort((left, right) => left.opportunityId.localeCompare(right.opportunityId))
      .map((opportunity) => ({
        opportunityId: opportunity.opportunityId,
        order: opportunity.order,
        calendarDateTime: opportunity.calendarDateTime,
        availabilityState: opportunity.availabilityState,
        executionState: opportunity.executionState,
      })),
    evaluationTime: input.validationInput.evaluationTime,
    basedOnRevisionId: input.basedOnRevisionId,
  });
}

export function validatePostPrescriptionWeekValidationRevisionLedger(
  ledger: ProductionPostPrescriptionWeekValidationRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  const mutatedFinalIds = (ledger as unknown as { readonly finalRevisionIds?: unknown }).finalRevisionIds;
  if (Array.isArray(mutatedFinalIds) && mutatedFinalIds.length !== 1) {
    reasons.push("INVALID_FINAL_VALIDATION_REVISION_COUNT");
  }
  const revisionIds = ledger.revisions.map((revision) => revision.validationRevisionId);
  const revisionIdSet = new Set(revisionIds);
  if (revisionIdSet.size !== revisionIds.length) reasons.push("DUPLICATE_VALIDATION_REVISION_ID");
  if (!revisionIdSet.has(ledger.finalRevisionId)) reasons.push("FINAL_VALIDATION_REVISION_NOT_IN_LEDGER");
  if (ledger.revisions.some((revision) => revision.validationId !== ledger.validationId)) {
    reasons.push("VALIDATION_ID_LINEAGE_MISMATCH");
  }
  for (const revision of ledger.revisions) {
    if (revision.basedOnRevisionId !== null && !revisionIdSet.has(revision.basedOnRevisionId)) {
      reasons.push("BROKEN_VALIDATION_REVISION_ANCESTRY");
    }
  }
  const supersededIds = new Set<string>();
  for (const supersession of ledger.supersessions) {
    if (!revisionIdSet.has(supersession.supersededRevisionId) ||
        !revisionIdSet.has(supersession.supersedingRevisionId)) {
      reasons.push("BROKEN_VALIDATION_REVISION_SUPERSESSION");
    }
    if (supersededIds.has(supersession.supersededRevisionId)) {
      reasons.push("VALIDATION_REVISION_SUPERSEDED_MORE_THAN_ONCE");
    }
    supersededIds.add(supersession.supersededRevisionId);
  }
  if (supersededIds.has(ledger.finalRevisionId)) reasons.push("FINAL_VALIDATION_REVISION_SUPERSEDED");
  if (ledger.finalizedHistoricalRevisionIds.some((id) => !revisionIdSet.has(id))) {
    reasons.push("UNKNOWN_FINALIZED_HISTORICAL_VALIDATION_REVISION");
  }
  if (ledger.finalizedHistoricalRevisionIds.some((id) => supersededIds.has(id))) {
    reasons.push("FINALIZED_HISTORICAL_VALIDATION_REVISION_IMMUTABLE");
  }
  return [...new Set(reasons)].sort();
}

export function buildPostPrescriptionWeekValidationRevisionLedger(input: {
  readonly validationInput: ProductionPostPrescriptionWeekValidationInput;
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly policyRef: PostPrescriptionWeekValidationPolicyReference;
}): {
  readonly ledger: ProductionPostPrescriptionWeekValidationRevisionLedger | null;
  readonly reasonCodes: readonly string[];
} {
  const context = input.validationInput.priorValidationRevisionContext;
  const prior = context?.ledger ?? null;
  const priorReasons = prior ? [...validatePostPrescriptionWeekValidationRevisionLedger(prior)] : [];
  if (prior && prior.validationId !== input.validationId) priorReasons.push("VALIDATION_ID_LINEAGE_MISMATCH");
  if (prior?.finalizedHistoricalRevisionIds.includes(prior.finalRevisionId)) {
    priorReasons.push("FINALIZED_HISTORICAL_VALIDATION_REVISION_IMMUTABLE");
  }
  if (priorReasons.length > 0) return { ledger: null, reasonCodes: [...new Set(priorReasons)].sort() };
  const basedOnRevisionId = prior?.finalRevisionId ?? null;
  const revision: ProductionPostPrescriptionWeekValidationRevision = Object.freeze({
    validatorContract: input.validationInput.validatorContract,
    validationId: input.validationId,
    validationRevisionId: input.validationRevisionId,
    basedOnRevisionId,
    reasonCode: context?.reasonCode ?? "initial_validation",
    createdAt: input.validationInput.evaluationTime,
    changedFieldRefs: Object.freeze([...(context?.changedFieldRefs ?? [])].sort()),
    sourceSnapshotRevisionId: input.validationInput.weekSource.sourceSnapshotRevisionId,
    policyRef: input.policyRef,
    finalPrescriptionRevisionIds: collectFinalPrescriptionRevisionIds(input.validationInput),
    finalSequenceRevisionIds: collectFinalSequenceRevisionIds(input.validationInput),
    provenance: Object.freeze({
      source: "prescription_contract",
      sourceRef: `post-prescription-week-validation-revision:${input.validationRevisionId}`,
    }),
  });
  const ledger: ProductionPostPrescriptionWeekValidationRevisionLedger = Object.freeze({
    validatorContract: input.validationInput.validatorContract,
    validationId: input.validationId,
    revisions: Object.freeze([...(prior?.revisions ?? []), revision]),
    supersessions: Object.freeze([
      ...(prior?.supersessions ?? []),
      ...(basedOnRevisionId ? [{
        supersededRevisionId: basedOnRevisionId,
        supersedingRevisionId: input.validationRevisionId,
        occurredAt: input.validationInput.evaluationTime,
        reasonCode: revision.reasonCode,
      }] : []),
    ]),
    finalRevisionId: input.validationRevisionId,
    finalizedHistoricalRevisionIds: Object.freeze([...(prior?.finalizedHistoricalRevisionIds ?? [])]),
  });
  const reasons = validatePostPrescriptionWeekValidationRevisionLedger(ledger);
  return reasons.length > 0 ? { ledger: null, reasonCodes: reasons } : { ledger, reasonCodes: [] };
}
