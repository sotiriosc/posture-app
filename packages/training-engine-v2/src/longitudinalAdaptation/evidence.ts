import { deterministicToken, explicitIsoTime, uniqueSorted } from "../prescription/compiler/utilities";
import type {
  ProductionCompletedExposureOutcomeLedger,
  ProductionLongitudinalAdaptationTarget,
  ProductionLongitudinalEvidenceTrajectory,
  ProductionLongitudinalEvidenceWindow,
  ProductionLongitudinalState,
} from "./contracts";
import type {
  ProductionLongitudinalEvidenceApplicability,
  ProductionLongitudinalOutcomeSourceRecord,
  ProductionLongitudinalOutcomeSourceSnapshot,
  ProductionLongitudinalRealizationContext,
  ProductionLongitudinalRealizationDifference,
} from "./sourceContracts";
import { activeProductionLongitudinalSourceRecords } from "./sourceRevisions";

function sameOptional(expected: string | null, actual: string | null): boolean {
  return expected === null || expected === actual;
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function productionLongitudinalRealizationDifferences(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly realization: ProductionLongitudinalRealizationContext;
}): readonly ProductionLongitudinalRealizationDifference[] {
  const differences: ProductionLongitudinalRealizationDifference[] = [];
  const { target, realization } = input;
  if (target.exerciseId !== realization.exerciseId) differences.push("exercise_identity");
  if (!sameOptional(target.prescriptionLineageId, realization.prescriptionLineageId)) differences.push("prescription_lineage");
  if (!sameOptional(target.assignmentLineageId, realization.assignmentLineageId)) differences.push("assignment_lineage");
  if (target.doseMode !== null && target.doseMode !== realization.doseMode) differences.push("dose_mode");
  if (!sameSet(target.equipmentIds, realization.equipmentIds)) differences.push("equipment");
  if (!sameOptional(target.supportKey, realization.supportKey)) differences.push("support");
  if (!sameOptional(target.rangeKey, realization.rangeKey)) differences.push("range");
  if (!sameOptional(target.leverKey, realization.leverKey)) differences.push("lever");
  if (!sameOptional(target.laterality, realization.laterality)) differences.push("laterality");
  if (!sameOptional(target.side, realization.side)) differences.push("side");
  if (!sameOptional(target.loadKey, realization.loadKey)) differences.push("load");
  if (!sameOptional(target.effortKey, realization.effortKey)) differences.push("effort");
  if (!sameOptional(target.tempoKey, realization.tempoKey)) differences.push("tempo");
  if (!sameOptional(target.restKey, realization.restKey)) differences.push("rest");
  if (!sameSet(target.plannedBlockIds, realization.plannedBlockIds)) differences.push("block_structure");
  return Object.freeze(differences);
}

export function classifyProductionLongitudinalEvidenceApplicability(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly record: ProductionLongitudinalOutcomeSourceRecord;
}): { readonly sourceRecordRevisionId: string; readonly applicability: ProductionLongitudinalEvidenceApplicability;
  readonly differences: readonly ProductionLongitudinalRealizationDifference[];
  readonly accepted: boolean; readonly reasonCodes: readonly string[] } {
  const reasons: string[] = [];
  const differences = input.record.realization ? productionLongitudinalRealizationDifferences({
    target: input.target, realization: input.record.realization }) : Object.freeze(["unknown"] as const);
  const applicability: ProductionLongitudinalEvidenceApplicability = !input.record.realization ||
    input.record.realization.exerciseId !== input.target.exerciseId ? "EXERCISE_IDENTITY_HISTORY" :
    differences.length === 0 ? "EXACT_REALIZATION_EVIDENCE" : "RELATED_REALIZATION_EVIDENCE";
  if (input.record.targetId !== input.target.targetId) reasons.push("LONGITUDINAL_EVIDENCE_TARGET_MISMATCH");
  if (input.record.targetScope !== input.target.targetScope) reasons.push("LONGITUDINAL_EVIDENCE_SCOPE_BROADENING_PROHIBITED");
  if (input.record.declaredApplicability !== applicability) {
    reasons.push("LONGITUDINAL_EVIDENCE_APPLICABILITY_MISMATCH");
  }
  if (input.record.owner === "unknown") reasons.push("LONGITUDINAL_EVIDENCE_SOURCE_UNKNOWN");
  if (input.record.owner === "planned_program_truth" && input.record.signals.some((signal) =>
    !["unknown_evidence", "phase_review_requested"].includes(signal))) {
    reasons.push("PLANNED_PROGRAM_TRUTH_USED_AS_COMPLETED_LONGITUDINAL_EVIDENCE");
  }
  return Object.freeze({ sourceRecordRevisionId: input.record.sourceRecordRevisionId, applicability, differences,
    accepted: reasons.length === 0, reasonCodes: Object.freeze(uniqueSorted(reasons)) });
}

export function validateProductionLongitudinalEvidenceWindow(input: {
  readonly window: ProductionLongitudinalEvidenceWindow;
  readonly ledger: ProductionCompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: ProductionLongitudinalOutcomeSourceSnapshot;
  readonly target: ProductionLongitudinalAdaptationTarget;
}): readonly string[] {
  const reasons: string[] = [];
  const entries = new Map(input.ledger.entries.map((entry) => [entry.outcomeEntryId, entry]));
  if (input.window.targetId !== input.target.targetId || !explicitIsoTime(input.window.startsAt) ||
      !explicitIsoTime(input.window.endsAt) || !explicitIsoTime(input.window.evaluationTime) ||
      input.window.evaluationTime !== input.outcomeSnapshot.evaluationTime ||
      Date.parse(input.window.startsAt) > Date.parse(input.window.endsAt) ||
      Date.parse(input.window.endsAt) > Date.parse(input.window.evaluationTime)) {
    reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_INVALID");
  }
  const included = input.window.includedOutcomeEntryIds.map((id) => entries.get(id));
  if (included.some((entry) => !entry)) reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_ENTRY_MISSING");
  if (new Set(input.window.includedOutcomeEntryIds).size !== input.window.includedOutcomeEntryIds.length) {
    reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_DUPLICATE_ENTRY");
  }
  if (included.some((entry) => entry && (Date.parse(entry.occurredAt) > Date.parse(input.window.evaluationTime) ||
      Date.parse(entry.occurredAt) < Date.parse(input.window.startsAt) ||
      Date.parse(entry.occurredAt) > Date.parse(input.window.endsAt)))) {
    reasons.push("FUTURE_OR_OUT_OF_WINDOW_EVIDENCE");
  }
  const valid = included.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (new Set(valid.map((entry) => entry.sourceExposureEventId)).size !== input.window.distinctSourceEventCount ||
      new Set(valid.map((entry) => entry.sessionId)).size !== input.window.distinctSessionCount ||
      new Set(valid.map((entry) => `${entry.realizedExerciseId}:${entry.finalPrescriptionRevisionId}`)).size !==
        input.window.distinctRealizationCount) reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_COUNTS_INVALID");
  const owners = new Set(activeProductionLongitudinalSourceRecords(input.outcomeSnapshot).map((record) => record.owner));
  if (input.window.requiredSourceOwners.some((owner) => !owners.has(owner))) {
    reasons.push("LONGITUDINAL_REQUIRED_EVIDENCE_SOURCE_MISSING");
  }
  if (input.window.recencyApplicabilityState !== "current") reasons.push("NON_CURRENT_EVIDENCE_WINDOW_CANNOT_AUTHORIZE_ACTION");
  return Object.freeze(uniqueSorted(reasons));
}

export function validateProductionRepeatedLongitudinalEvidence(input: {
  readonly window: ProductionLongitudinalEvidenceWindow;
  readonly outcomeSnapshot: ProductionLongitudinalOutcomeSourceSnapshot;
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly materialChangeClaimed: boolean;
}): readonly string[] {
  if (!input.materialChangeClaimed) return Object.freeze([]);
  const records = activeProductionLongitudinalSourceRecords(input.outcomeSnapshot).filter((record) =>
    record.targetId === input.target.targetId && record.targetScope === input.target.targetScope);
  const aggregateEvents = new Set(input.window.reviewedAggregateSourceEventIds);
  const directEvents = new Set(records.map((record) => record.sourceExposureEventId)
    .filter((value): value is string => value !== null));
  const repeated = directEvents.size > 1 || aggregateEvents.size > 1;
  const reasons: string[] = [];
  if (!repeated) reasons.push("LONGITUDINAL_REPEATED_EVIDENCE_DISTINCT_SOURCE_EVENT_REQUIRED");
  if (aggregateEvents.size !== input.window.reviewedAggregateSourceEventIds.length) {
    reasons.push("DUPLICATE_SOURCE_EVENT_CANNOT_PROVE_REPETITION");
  }
  if (records.length > 1 && directEvents.size < 2 && aggregateEvents.size < 2) {
    reasons.push("DUPLICATED_SOURCE_RECORD_CANNOT_PROVE_REPETITION");
  }
  if (records.some((record) => record.realization &&
      productionLongitudinalRealizationDifferences({ target: input.target, realization: record.realization })
        .includes("exercise_identity"))) reasons.push("REPEATED_EVIDENCE_TARGET_COMPATIBILITY_INVALID");
  return Object.freeze(uniqueSorted(reasons));
}

function state(signals: ReadonlySet<string>): ProductionLongitudinalState {
  if (signals.has("safety_block") || signals.has("external_review_required")) return "safety_blocked";
  if (signals.has("successful_reexposure")) return "successful_reexposure";
  if (signals.has("mixed_evidence")) return "mixed_or_conflicting";
  if (signals.has("repeated_adverse_response")) return "adverse_across_related_realizations";
  if (signals.has("adverse_response")) return "exact_realization_adverse";
  if (signals.has("limited_response")) return "exact_realization_limited";
  if (signals.has("repeated_target_failure")) return "repeated_target_failure";
  if (signals.has("target_partially_met")) return "target_partially_met";
  if (signals.has("recovery_concern")) return "recovery_concern";
  if (signals.has("adherence_constraint")) return "adherence_constraint";
  if (signals.has("plateau")) return "stable_but_plateaued";
  if (signals.has("repeated_success")) return "repeated_success";
  if (signals.has("first_completed_exposure") || signals.has("isolated_success")) return "first_or_isolated_success";
  if (signals.has("productive_completion") && signals.has("appropriate_challenge")) {
    return "stable_appropriate_challenge";
  }
  if (signals.has("productive_completion")) return "productive_continuity";
  if (signals.has("unknown_evidence") || signals.has("recovery_unknown")) return "insufficient_evidence";
  return "unknown";
}

const applicabilityRank: Readonly<Record<ProductionLongitudinalEvidenceApplicability, number>> = {
  EXACT_REALIZATION_EVIDENCE: 3, RELATED_REALIZATION_EVIDENCE: 2, EXERCISE_IDENTITY_HISTORY: 1,
};

export function buildProductionLongitudinalEvidenceTrajectory(input: {
  readonly ledger: ProductionCompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: ProductionLongitudinalOutcomeSourceSnapshot;
  readonly window: ProductionLongitudinalEvidenceWindow;
  readonly target: ProductionLongitudinalAdaptationTarget;
}): ProductionLongitudinalEvidenceTrajectory {
  const included = new Set(input.window.includedOutcomeEntryIds);
  const entries = input.ledger.entries.filter((entry) => included.has(entry.outcomeEntryId))
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) ||
      left.outcomeEntryId.localeCompare(right.outcomeEntryId));
  const includedEvents = new Set(entries.map((entry) => entry.sourceExposureEventId));
  const active = activeProductionLongitudinalSourceRecords(input.outcomeSnapshot).filter((record) =>
    record.targetId === input.target.targetId && (record.sourceExposureEventId === null ||
      includedEvents.has(record.sourceExposureEventId) || record.reviewedAggregateSourceEventIds.some((id) => includedEvents.has(id))));
  const classified = active.map((record) => ({ record,
    classification: classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record }) }));
  const strongestRank = Math.max(0, ...classified.map((entry) => applicabilityRank[entry.classification.applicability]));
  const decisionRecords = classified.filter((entry) => applicabilityRank[entry.classification.applicability] === strongestRank)
    .map((entry) => entry.record).sort((left, right) => left.observedAt.localeCompare(right.observedAt) ||
      left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId));
  const signals = decisionRecords.flatMap((record) => record.signals);
  const signalSet = new Set(signals);
  return Object.freeze({ orderedOutcomeEntryIds: Object.freeze(entries.map((entry) => entry.outcomeEntryId)),
    blockCompletionTrajectory: Object.freeze(entries.flatMap((entry) => entry.blockPerformance?.blockResults
      .map((result) => `${result.blockResultId}:${result.completionStatus}`) ?? [])),
    eventCompletionTrajectory: Object.freeze(entries.map((entry) => entry.eventCompletionState)),
    actualDoseTrajectoryByLane: Object.freeze(entries.flatMap((entry) => entry.blockPerformance?.blockResults
      .map((result) => result.actualDose ? `${result.actualDose.mode}:${deterministicToken(result.actualDose)}` : "not_observed") ?? [])),
    executionQualityTrajectory: Object.freeze(entries.flatMap((entry) => entry.blockPerformance?.blockResults
      .flatMap((result) => result.qualityObservations.map((observation) => observation.result)) ?? [])),
    responseTrajectory: Object.freeze(signals),
    recoveryTrajectory: Object.freeze(entries.map((entry) => entry.recoveryStatus)),
    adherenceTrajectory: Object.freeze(decisionRecords.filter((record) => record.owner === "adherence_summary")
      .flatMap((record) => record.signals)),
    realizationChanges: Object.freeze(uniqueSorted(entries.map((entry) =>
      `${entry.originalExerciseId}->${entry.realizedExerciseId}`))),
    substitutionHistory: Object.freeze(uniqueSorted(entries.flatMap((entry) => entry.substitutionLineage))),
    successfulReexposure: signalSet.has("successful_reexposure"),
    plateauOrFailureEvidence: Object.freeze(uniqueSorted(decisionRecords.filter((record) => record.signals.some((signal) =>
      ["plateau", "target_failed", "repeated_target_failure"].includes(signal))).map((record) => record.sourceRecordRevisionId))),
    mixedOrConflictingEvidence: Object.freeze(uniqueSorted(decisionRecords.filter((record) =>
      record.signals.includes("mixed_evidence")).map((record) => record.sourceRecordRevisionId))),
    currentStrongestApplicableEvidence: strongestRank === 3 ? "EXACT_REALIZATION_EVIDENCE" : strongestRank === 2 ?
      "RELATED_REALIZATION_EVIDENCE" : strongestRank === 1 ? "EXERCISE_IDENTITY_HISTORY" : null,
    currentState: state(signalSet),
    sourceRecordRevisions: Object.freeze(uniqueSorted(active.map((record) => record.sourceRecordRevisionId))),
    provenance: Object.freeze(["production-longitudinal:ordered-strongest-applicability-no-weighted-score"]),
  });
}
