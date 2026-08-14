import type { ProductionPhaseProgramSnapshot } from "../../src/phaseContinuity";
import {
  LONGITUDINAL_ADAPTATION_CONTRACT_ID,
  type CompletedExposureLedgerIntegrity,
  type CompletedExposureOutcomeLedger,
  type LongitudinalAdaptationDecisionRevision,
  type LongitudinalAdaptationDecisionRevisionContext,
  type LongitudinalAdaptationDecisionRevisionLedger,
  type LongitudinalAdaptationStateRevision,
  type LongitudinalAdaptationStateRevisionLedger,
  type LongitudinalAdaptationTarget,
  type LongitudinalAdaptationThreadIdentity,
  type LongitudinalEvidenceApplicability,
  type LongitudinalEvidenceTrajectory,
  type LongitudinalEvidenceWindow,
  type LongitudinalOutcomeSourceRecord,
  type LongitudinalOutcomeSourceSnapshot,
  type LongitudinalState,
} from "../../src/longitudinalAdaptation/designContracts";
import { digest } from "./signatures";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function deriveLongitudinalThreadId(input: Pick<LongitudinalAdaptationThreadIdentity,
"athleteId" | "targetScope" | "activeNeedIds" | "activeObjectiveIds" | "exerciseId" | "assignmentId"
| "prescriptionLineageId" | "side" | "phaseCycleId">): string {
  return digest({ kind: "longitudinal-thread", athleteId: input.athleteId, targetScope: input.targetScope,
    activeNeedIds: [...input.activeNeedIds].sort(), activeObjectiveIds: [...input.activeObjectiveIds].sort(),
    exerciseId: input.exerciseId, assignmentId: input.assignmentId,
    prescriptionLineageId: input.prescriptionLineageId, side: input.side, phaseCycleId: input.phaseCycleId });
}

export function deriveLongitudinalStateId(input: { readonly athleteId: string; readonly threadId: string }): string {
  return digest({ kind: "longitudinal-state", athleteId: input.athleteId, threadId: input.threadId });
}

export function deriveLongitudinalStateRevisionId(input: Pick<LongitudinalAdaptationStateRevision,
"stateIdentity" | "basedOnRevisionId" | "evidenceWindowId" | "currentState"
| "currentAuthorizedOrPendingAction" | "evaluationTime" | "decisionAttemptId">): string {
  return digest({ kind: "longitudinal-state-revision", stateId: input.stateIdentity.stateId,
    basedOnRevisionId: input.basedOnRevisionId, evidenceWindowId: input.evidenceWindowId,
    currentState: input.currentState, currentAuthorizedOrPendingAction: input.currentAuthorizedOrPendingAction,
    evaluationTime: input.evaluationTime, decisionAttemptId: input.decisionAttemptId });
}

export function deriveLongitudinalDecisionId(input: {
  readonly athleteId: string; readonly threadId: string; readonly evidenceWindowId: string;
  readonly decisionAttemptId: string;
}): string {
  return digest({ kind: "longitudinal-decision", contract: LONGITUDINAL_ADAPTATION_CONTRACT_ID,
    athleteId: input.athleteId, threadId: input.threadId, evidenceWindowId: input.evidenceWindowId,
    decisionAttemptId: input.decisionAttemptId });
}

export function deriveLongitudinalDecisionRevisionId(input: Omit<LongitudinalAdaptationDecisionRevision,
"decisionRevisionId" | "reasonCode" | "final" | "decisionContentFingerprint" | "provenance">): string {
  return digest({ kind: "longitudinal-decision-revision", decisionId: input.decisionId,
    basedOnRevisionId: input.basedOnRevisionId, policyReference: input.policyReference,
    outcomeSnapshotRevisionId: input.outcomeSnapshotRevisionId, evidenceWindowId: input.evidenceWindowId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
    phaseContinuityDecisionRevisionId: input.phaseContinuityDecisionRevisionId,
    proposedApplicationSnapshotRevisionId: input.proposedApplicationSnapshotRevisionId,
    stateRevisionId: input.stateRevisionId, evaluationTime: input.evaluationTime });
}

export function validateLongitudinalThreadIdentity(value: LongitudinalAdaptationThreadIdentity): readonly string[] {
  const reasons: string[] = [];
  if (!value.athleteId || !value.phaseCycleId || !value.createdAt || !explicitTime(value.createdAt)) {
    reasons.push("LONGITUDINAL_THREAD_IDENTITY_INCOMPLETE");
  }
  if (value.threadId !== deriveLongitudinalThreadId(value)) reasons.push("LONGITUDINAL_THREAD_IDENTITY_INVALID");
  return unique(reasons);
}

export function validateLongitudinalStateRevisionLedger(
  ledger: LongitudinalAdaptationStateRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  if (ledger.revisions.length === 0) reasons.push("LONGITUDINAL_STATE_LEDGER_EMPTY");
  if (new Set(ledger.revisions.map((entry) => entry.revisionId)).size !== ledger.revisions.length) {
    reasons.push("DUPLICATE_LONGITUDINAL_STATE_REVISION");
  }
  const final = ledger.revisions.filter((entry) => entry.finalForDecision);
  if (final.length !== 1 || final[0]?.revisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_LONGITUDINAL_STATE_REVISION_REQUIRED");
  }
  ledger.revisions.forEach((revision, index) => {
    const expectedBasedOn = index === 0 ? null : ledger.revisions[index - 1].revisionId;
    if (revision.stateIdentity.stateId !== ledger.stateId || revision.basedOnRevisionId !== expectedBasedOn ||
        !explicitTime(revision.evaluationTime) || revision.revisionId !== deriveLongitudinalStateRevisionId(revision)) {
      reasons.push("LONGITUDINAL_STATE_REVISION_LINEAGE_INVALID");
    }
    if (revision.stateIdentity.stateId !== deriveLongitudinalStateId(revision.stateIdentity)) {
      reasons.push("LONGITUDINAL_STATE_IDENTITY_INVALID");
    }
  });
  if (ledger.finalizedHistoricalRevisionIds.some((id) => !ledger.revisions.some((entry) => entry.revisionId === id))) {
    reasons.push("LONGITUDINAL_HISTORICAL_STATE_REVISION_MISSING");
  }
  return unique(reasons);
}

export function validateLongitudinalDecisionRevisionLedger(
  ledger: LongitudinalAdaptationDecisionRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  if (ledger.revisions.length === 0) reasons.push("LONGITUDINAL_DECISION_LEDGER_EMPTY");
  if (new Set(ledger.revisions.map((entry) => entry.decisionRevisionId)).size !== ledger.revisions.length) {
    reasons.push("DUPLICATE_LONGITUDINAL_DECISION_REVISION");
  }
  const final = ledger.revisions.filter((entry) => entry.final);
  if (final.length !== 1 || final[0]?.decisionRevisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_LONGITUDINAL_DECISION_REVISION_REQUIRED");
  }
  ledger.revisions.forEach((revision, index) => {
    const expectedBasedOn = index === 0 ? null : ledger.revisions[index - 1].decisionRevisionId;
    if (revision.decisionId !== ledger.decisionId || revision.basedOnRevisionId !== expectedBasedOn ||
        !explicitTime(revision.evaluationTime) ||
        revision.decisionRevisionId !== deriveLongitudinalDecisionRevisionId(revision)) {
      reasons.push("LONGITUDINAL_DECISION_REVISION_LINEAGE_INVALID");
    }
  });
  if (ledger.finalizedHistoricalRevisionIds.some((id) => !ledger.revisions.some((entry) =>
    entry.decisionRevisionId === id))) reasons.push("LONGITUDINAL_HISTORICAL_DECISION_REVISION_MISSING");
  return unique(reasons);
}

export function buildLongitudinalDecisionRevision(input: {
  readonly decisionId: string;
  readonly outcomeSnapshotRevisionId: string;
  readonly evidenceWindowId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly phaseContinuityDecisionRevisionId: string;
  readonly proposedApplicationSnapshotRevisionId: string | null;
  readonly stateRevisionId: string;
  readonly evaluationTime: string;
  readonly contentFingerprint: string;
  readonly priorContext: LongitudinalAdaptationDecisionRevisionContext | null;
}): { readonly revision: LongitudinalAdaptationDecisionRevision;
  readonly ledger: LongitudinalAdaptationDecisionRevisionLedger } {
  const prior = input.priorContext?.ledger.revisions ?? [];
  const basedOnRevisionId = input.priorContext?.ledger.finalRevisionId ?? null;
  const identity = { decisionId: input.decisionId,
    policyReference: { policyId: "LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED" as const,
      version: "1.0.0" as const },
    outcomeSnapshotRevisionId: input.outcomeSnapshotRevisionId, evidenceWindowId: input.evidenceWindowId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
    phaseContinuityDecisionRevisionId: input.phaseContinuityDecisionRevisionId,
    proposedApplicationSnapshotRevisionId: input.proposedApplicationSnapshotRevisionId,
    stateRevisionId: input.stateRevisionId, evaluationTime: input.evaluationTime, basedOnRevisionId };
  const revision = Object.freeze({ ...identity,
    decisionRevisionId: deriveLongitudinalDecisionRevisionId(identity),
    reasonCode: input.priorContext?.reasonCode ?? "initial_evaluation" as const,
    final: true, decisionContentFingerprint: input.contentFingerprint,
    provenance: Object.freeze(["design-evidence:LONGITUDINAL_ADAPTATION_GATE_16_V1"]) });
  const historical = prior.map((entry) => Object.freeze({ ...entry, final: false }));
  return Object.freeze({ revision, ledger: Object.freeze({ decisionId: input.decisionId,
    revisions: Object.freeze([...historical, revision]), finalRevisionId: revision.decisionRevisionId,
    finalizedHistoricalRevisionIds: Object.freeze(prior.map((entry) => entry.decisionRevisionId)) }) });
}

function duplicateCount(values: readonly string[]): number {
  return values.length - new Set(values).size;
}

export function validateCompletedExposureLedger(input: {
  readonly ledger: CompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: LongitudinalOutcomeSourceSnapshot;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
}): CompletedExposureLedgerIntegrity {
  const entries = input.ledger.entries;
  const reasons: string[] = [];
  const outcomeIds = entries.map((entry) => entry.outcomeEntryId);
  const eventIds = entries.map((entry) => entry.sourceExposureEventId);
  const duplicateOutcomeEntryCount = duplicateCount(outcomeIds) + duplicateCount(eventIds);
  const represented = new Set(eventIds);
  const missingOutcomeLinkCount = input.ledger.expectedSourceExposureEventIds.filter((id) => !represented.has(id)).length;
  const sourceIds = new Set(input.outcomeSnapshot.sourceRecords.map((entry) => entry.sourceRecordId));
  const orphanPerformanceRecordCount = entries.filter((entry) => entry.actualPerformanceRecordId &&
    !sourceIds.has(entry.actualPerformanceRecordId)).length;
  const orphanResponseRecordCount = entries.flatMap((entry) => entry.responseObservationIds)
    .filter((id) => !sourceIds.has(id)).length;
  const prescriptionRefs = new Set(input.currentProgramSnapshot.finalPrescriptionRefs.map((entry) =>
    `${entry.prescriptionId}:${entry.revisionId}`));
  const sequenceRefs = new Set(input.currentProgramSnapshot.finalSequenceRefs.map((entry) =>
    `${entry.sequencePlanId}:${entry.revisionId}`));
  const wrongPrescriptionRevisionCount = entries.filter((entry) =>
    !prescriptionRefs.has(`${entry.prescriptionId}:${entry.finalPrescriptionRevisionId}`)).length;
  const wrongSequenceRevisionCount = entries.filter((entry) =>
    !sequenceRefs.has(`${entry.sequencePlanId}:${entry.finalSequenceRevisionId}`)).length;
  const sessionsByEvent = new Map<string, Set<string>>();
  for (const entry of entries) {
    const sessions = sessionsByEvent.get(entry.sourceExposureEventId) ?? new Set<string>();
    sessions.add(entry.sessionId);
    sessionsByEvent.set(entry.sourceExposureEventId, sessions);
  }
  const crossSessionCollisionCount = [...sessionsByEvent.values()].filter((sessions) => sessions.size > 1).length;
  const plannedAsActualCount = entries.filter((entry) => entry.actualDoseSource === "planned_copy_invalid" ||
    entry.actualTimingSource === "planned_copy_invalid").length;
  if (duplicateOutcomeEntryCount) reasons.push("DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY");
  if (missingOutcomeLinkCount) reasons.push("MISSING_COMPLETED_EXPOSURE_OUTCOME_LINK");
  if (orphanPerformanceRecordCount) reasons.push("ORPHAN_PERFORMANCE_RECORD");
  if (orphanResponseRecordCount) reasons.push("ORPHAN_RESPONSE_RECORD");
  if (wrongPrescriptionRevisionCount) reasons.push("WRONG_FINAL_PRESCRIPTION_REVISION");
  if (wrongSequenceRevisionCount) reasons.push("WRONG_FINAL_SEQUENCE_REVISION");
  if (crossSessionCollisionCount) reasons.push("CROSS_SESSION_SOURCE_EVENT_COLLISION");
  if (plannedAsActualCount) reasons.push("PLANNED_PROGRAM_TRUTH_USED_AS_ACTUAL_OUTCOME");
  if (entries.some((entry) => entry.completionStatus === "not_performed" &&
    (entry.actualDose !== null || entry.actualTiming !== null))) reasons.push("NOT_PERFORMED_OUTCOME_HAS_ACTUAL_DOSE");
  if (entries.some((entry) => entry.occurredAt > input.ledger.evaluationTime || !explicitTime(entry.occurredAt))) {
    reasons.push("COMPLETED_OUTCOME_TIME_INVALID");
  }
  return Object.freeze({ expectedPlannedEventCount: input.ledger.expectedSourceExposureEventIds.length,
    completedEventCount: entries.filter((entry) => entry.completionStatus === "completed_as_planned").length,
    partialEventCount: entries.filter((entry) => ["partially_completed", "target_not_met"]
      .includes(entry.completionStatus)).length,
    notPerformedEventCount: entries.filter((entry) => entry.completionStatus === "not_performed").length,
    substitutedEventCount: entries.filter((entry) => entry.completionStatus === "substituted").length,
    unknownOutcomeCount: entries.filter((entry) => entry.completionStatus === "unknown").length,
    duplicateOutcomeEntryCount, missingOutcomeLinkCount, orphanPerformanceRecordCount,
    orphanResponseRecordCount, wrongPrescriptionRevisionCount, wrongSequenceRevisionCount,
    crossSessionCollisionCount, plannedAsActualCount, reasonCodes: unique(reasons) });
}

function sameContext(expected: string | null, actual: string | null): boolean {
  return expected === null || expected === actual;
}

export function classifyEvidenceApplicability(input: {
  readonly target: LongitudinalAdaptationTarget;
  readonly record: LongitudinalOutcomeSourceRecord;
}): { readonly sourceRecordId: string; readonly applicability: LongitudinalEvidenceApplicability;
  readonly accepted: boolean; readonly reasonCodes: readonly string[] } {
  const realization = input.record.realization;
  const reasons: string[] = [];
  let applicability: LongitudinalEvidenceApplicability = "EXERCISE_IDENTITY_HISTORY";
  if (realization && realization.exerciseId === input.target.exerciseId) {
    const exact = sameContext(input.target.prescriptionId, realization.prescriptionId) &&
      sameContext(input.target.assignmentId, realization.assignmentId) &&
      sameContext(input.target.side, realization.side) && sameContext(input.target.supportKey, realization.supportKey) &&
      sameContext(input.target.rangeKey, realization.rangeKey) && sameContext(input.target.loadKey, realization.loadKey) &&
      (input.target.doseMode === null || input.target.doseMode === realization.doseMode);
    applicability = exact ? "EXACT_REALIZATION_EVIDENCE" : "RELATED_REALIZATION_EVIDENCE";
  }
  if (input.record.targetId !== input.target.targetId) reasons.push("LONGITUDINAL_EVIDENCE_TARGET_MISMATCH");
  if (input.record.owner === "unknown" || input.record.sourceAuthority === "unknown") {
    reasons.push("LONGITUDINAL_EVIDENCE_SOURCE_UNKNOWN");
  }
  if (input.record.owner === "planned_program_truth" && input.record.signals.some((signal) => ![
    "unknown_evidence", "phase_review_requested",
  ].includes(signal))) reasons.push("PLANNED_PROGRAM_TRUTH_USED_AS_COMPLETED_LONGITUDINAL_EVIDENCE");
  if (input.record.applicability !== applicability) reasons.push("LONGITUDINAL_EVIDENCE_APPLICABILITY_MISMATCH");
  return Object.freeze({ sourceRecordId: input.record.sourceRecordId, applicability,
    accepted: reasons.length === 0, reasonCodes: unique(reasons) });
}

export function validateLongitudinalEvidenceWindow(input: {
  readonly window: LongitudinalEvidenceWindow;
  readonly ledger: CompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: LongitudinalOutcomeSourceSnapshot;
  readonly target: LongitudinalAdaptationTarget;
}): readonly string[] {
  const reasons: string[] = [];
  const entries = new Map(input.ledger.entries.map((entry) => [entry.outcomeEntryId, entry]));
  if (input.window.targetId !== input.target.targetId || !explicitTime(input.window.startsAt) ||
      !explicitTime(input.window.endsAt) || !explicitTime(input.window.evaluationTime) ||
      input.window.evaluationTime !== input.outcomeSnapshot.evaluationTime ||
      Date.parse(input.window.startsAt) > Date.parse(input.window.endsAt) ||
      Date.parse(input.window.endsAt) > Date.parse(input.window.evaluationTime)) {
    reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_INVALID");
  }
  const included = input.window.includedOutcomeEntryIds.map((id) => entries.get(id));
  if (included.some((entry) => !entry)) reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_ENTRY_MISSING");
  if (duplicateCount(input.window.includedOutcomeEntryIds)) reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_DUPLICATE_ENTRY");
  if (included.some((entry) => entry && (Date.parse(entry.occurredAt) > Date.parse(input.window.evaluationTime) ||
    Date.parse(entry.occurredAt) < Date.parse(input.window.startsAt)))) reasons.push("FUTURE_OR_OUT_OF_WINDOW_EVIDENCE");
  const valid = included.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (new Set(valid.map((entry) => entry.sourceExposureEventId)).size !== input.window.distinctSourceEventCount ||
      new Set(valid.map((entry) => entry.sessionId)).size !== input.window.distinctSessionCount ||
      new Set(valid.map((entry) => `${entry.prescriptionId}:${entry.finalPrescriptionRevisionId}`)).size !==
        input.window.distinctPrescriptionRealizationCount) reasons.push("LONGITUDINAL_EVIDENCE_WINDOW_COUNTS_INVALID");
  const presentOwners = new Set(input.outcomeSnapshot.sourceRecords.map((record) => record.owner));
  if (input.window.requiredSourceOwners.some((owner) => !presentOwners.has(owner))) {
    reasons.push("LONGITUDINAL_REQUIRED_EVIDENCE_SOURCE_MISSING");
  }
  return unique(reasons);
}

export function validateRepeatedLongitudinalEvidence(input: {
  readonly window: LongitudinalEvidenceWindow;
  readonly outcomeSnapshot: LongitudinalOutcomeSourceSnapshot;
  readonly materialChangeClaimed: boolean;
}): readonly string[] {
  if (!input.materialChangeClaimed) return Object.freeze([]);
  const aggregate = input.window.reviewedAggregateSourceEventIds;
  const distinctAggregate = new Set(aggregate);
  const repeated = input.window.distinctSourceEventCount > 1 || distinctAggregate.size > 1;
  const reasons: string[] = [];
  if (!repeated) reasons.push("LONGITUDINAL_REPEATED_EVIDENCE_DISTINCT_SOURCE_EVENT_REQUIRED");
  if (aggregate.length !== distinctAggregate.size) reasons.push("DUPLICATE_SOURCE_EVENT_CANNOT_PROVE_REPETITION");
  const sourceEvents = input.outcomeSnapshot.sourceRecords.map((record) => record.sourceExposureEventId)
    .filter((value): value is string => Boolean(value));
  if (duplicateCount(sourceEvents) && input.window.distinctSourceEventCount < 2) {
    reasons.push("DUPLICATED_SOURCE_RECORD_CANNOT_PROVE_REPETITION");
  }
  return unique(reasons);
}

function strongest(records: readonly LongitudinalOutcomeSourceRecord[]): LongitudinalEvidenceApplicability | null {
  if (records.some((record) => record.applicability === "EXACT_REALIZATION_EVIDENCE")) {
    return "EXACT_REALIZATION_EVIDENCE";
  }
  if (records.some((record) => record.applicability === "RELATED_REALIZATION_EVIDENCE")) {
    return "RELATED_REALIZATION_EVIDENCE";
  }
  return records.length ? "EXERCISE_IDENTITY_HISTORY" : null;
}

function strongestRecords(records: readonly LongitudinalOutcomeSourceRecord[]): readonly LongitudinalOutcomeSourceRecord[] {
  const applicability = strongest(records);
  return applicability ? records.filter((record) => record.applicability === applicability) : Object.freeze([]);
}

function state(signals: ReadonlySet<string>): LongitudinalState {
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
  if (signals.has("first_completed_exposure") || signals.has("isolated_success")) {
    return "first_or_isolated_success";
  }
  if (signals.has("productive_completion") && signals.has("appropriate_challenge")) {
    return "stable_appropriate_challenge";
  }
  if (signals.has("productive_completion")) return "productive_continuity";
  if (signals.has("unknown_evidence") || signals.has("recovery_unknown")) return "insufficient_evidence";
  return "unknown";
}

export function buildLongitudinalEvidenceTrajectory(input: {
  readonly ledger: CompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: LongitudinalOutcomeSourceSnapshot;
  readonly window: LongitudinalEvidenceWindow;
}): LongitudinalEvidenceTrajectory {
  const included = new Set(input.window.includedOutcomeEntryIds);
  const entries = input.ledger.entries.filter((entry) => included.has(entry.outcomeEntryId))
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) ||
      left.outcomeEntryId.localeCompare(right.outcomeEntryId));
  const records = [...input.outcomeSnapshot.sourceRecords].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt) || left.sourceRecordId.localeCompare(right.sourceRecordId));
  const decisionRecords = strongestRecords(records);
  const signals = decisionRecords.flatMap((record) => record.signals);
  const signalSet = new Set(signals);
  return Object.freeze({ orderedOutcomeEntryIds: Object.freeze(entries.map((entry) => entry.outcomeEntryId)),
    completionTrajectory: Object.freeze(entries.map((entry) => entry.completionStatus)),
    doseTrajectory: Object.freeze(entries.map((entry) => entry.actualDose ? digest(entry.actualDose) : "not_observed")),
    executionQualityTrajectory: Object.freeze(entries.flatMap((entry) =>
      entry.qualityObservations.map((observation) => observation.result))),
    responseTrajectory: Object.freeze(signals),
    recoveryTrajectory: Object.freeze(entries.map((entry) => entry.recoveryStatus)),
    adherenceTrajectory: Object.freeze(records.filter((record) => record.owner === "adherence_summary")
      .flatMap((record) => record.signals)),
    realizationChanges: unique(entries.map((entry) => `${entry.originalExerciseId}->${entry.realizedExerciseId}`)),
    successfulReexposure: signalSet.has("successful_reexposure"),
    plateauOrFailureEvidence: unique(decisionRecords.filter((record) => record.signals.some((signal) =>
      ["plateau", "target_failed", "repeated_target_failure"].includes(signal))).map((record) => record.sourceRecordId)),
    mixedOrConflictingEvidence: unique(decisionRecords.filter((record) => record.signals.includes("mixed_evidence"))
      .map((record) => record.sourceRecordId)),
    currentStrongestApplicableEvidence: strongest(records), currentState: state(signalSet),
    sourceRecordIds: unique(records.map((record) => record.sourceRecordId)),
    provenance: Object.freeze(["design-evidence:ordered-no-weighted-score"]) });
}
