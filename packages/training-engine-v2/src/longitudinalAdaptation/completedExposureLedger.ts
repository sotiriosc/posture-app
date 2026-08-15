import { explicitIsoTime, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionPhaseProgramSnapshot } from "../phaseContinuity/programSnapshot";
import { validateProductionExercisePerformanceBlockLinkage } from "./blockPerformance";
import type {
  ProductionCompletedExposureLedgerIntegrity,
  ProductionCompletedExposureOutcomeLedger,
} from "./contracts";
import type { ProductionLongitudinalOutcomeSourceSnapshot } from "./sourceContracts";
import { activeProductionLongitudinalSourceRecords } from "./sourceRevisions";

function duplicateCount(values: readonly string[]): number {
  return values.length - new Set(values).size;
}

export function validateProductionCompletedExposureLedger(input: {
  readonly ledger: ProductionCompletedExposureOutcomeLedger;
  readonly outcomeSnapshot: ProductionLongitudinalOutcomeSourceSnapshot;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
}): ProductionCompletedExposureLedgerIntegrity {
  const entries = input.ledger.entries;
  const reasons: string[] = [];
  const duplicateOutcomeEntryCount = duplicateCount(entries.map((entry) => entry.outcomeEntryId)) +
    duplicateCount(entries.map((entry) => entry.sourceExposureEventId));
  const representedEvents = new Set(entries.map((entry) => entry.sourceExposureEventId));
  const missingOutcomeLinkCount = input.ledger.expectedSourceExposureEventIds.filter((id) => !representedEvents.has(id)).length;
  const activeRecords = activeProductionLongitudinalSourceRecords(input.outcomeSnapshot);
  const sourceIdentityRefs = new Set(activeRecords.flatMap((record) => [record.sourceRecordId,
    record.sourceRecordRevisionId, ...record.upstreamSourceRecordIds]));
  const orphanPerformanceRecordCount = entries.filter((entry) => entry.blockPerformance &&
    !sourceIdentityRefs.has(entry.blockPerformance.performanceRecordId)).length;
  const orphanResponseRecordCount = entries.flatMap((entry) => entry.responseObservationIds)
    .filter((id) => !sourceIdentityRefs.has(id)).length;
  const prescriptionRefs = new Set(input.currentProgramSnapshot.finalPrescriptionRefs.map((entry) =>
    `${entry.prescriptionId}:${entry.revisionId}`));
  const sequenceRefs = new Set(input.currentProgramSnapshot.finalSequenceRefs.map((entry) =>
    `${entry.sequencePlanId}:${entry.revisionId}`));
  const wrongPrescriptionRevisionCount = entries.filter((entry) =>
    !prescriptionRefs.has(`${entry.prescriptionId}:${entry.finalPrescriptionRevisionId}`) ||
    entry.blockPerformance && entry.blockPerformance.prescriptionRevisionId !== entry.finalPrescriptionRevisionId).length;
  const wrongSequenceRevisionCount = entries.filter((entry) =>
    !sequenceRefs.has(`${entry.sequencePlanId}:${entry.finalSequenceRevisionId}`)).length;
  const sessionsByEvent = new Map<string, Set<string>>();
  for (const entry of entries) {
    const sessions = sessionsByEvent.get(entry.sourceExposureEventId) ?? new Set<string>();
    sessions.add(entry.sessionId);
    sessionsByEvent.set(entry.sourceExposureEventId, sessions);
  }
  const crossSessionCollisionCount = [...sessionsByEvent.values()].filter((sessions) => sessions.size > 1).length;
  let orphanBlockResultCount = 0;
  let plannedAsActualCount = 0;
  let prescribedTimingAsActualCount = 0;
  let multiBlockFlatteningCount = 0;
  for (const entry of entries) {
    if (!entry.blockPerformance) {
      if (entry.eventCompletionState !== "not_performed" && entry.eventCompletionState !== "outcome_unknown") {
        reasons.push("PERFORMANCE_LINKAGE_REQUIRED_FOR_OBSERVED_COMPLETION");
      }
      continue;
    }
    const validation = validateProductionExercisePerformanceBlockLinkage(entry.blockPerformance);
    orphanBlockResultCount += validation.orphanBlockResultCount;
    plannedAsActualCount += validation.plannedAsActualCount;
    prescribedTimingAsActualCount += validation.prescribedTimingAsActualCount;
    multiBlockFlatteningCount += validation.multiBlockFlatteningCount;
    reasons.push(...validation.reasonCodes);
    if (validation.eventCompletionState !== entry.eventCompletionState) reasons.push("EVENT_COMPLETION_NOT_DERIVED_FROM_BLOCKS");
    if (entry.blockPerformance.sourceExposureEventId !== entry.sourceExposureEventId ||
        entry.blockPerformance.prescriptionId !== entry.prescriptionId) reasons.push("PERFORMANCE_EVENT_LINEAGE_INVALID");
    if (JSON.stringify([...entry.plannedBlockIds].sort()) !==
        JSON.stringify(entry.blockPerformance.plannedBlocks.map((block) => block.blockId).sort())) {
      reasons.push("LEDGER_PLANNED_BLOCK_LINEAGE_INVALID");
    }
  }
  if (duplicateOutcomeEntryCount) reasons.push("DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY");
  if (missingOutcomeLinkCount) reasons.push("MISSING_COMPLETED_EXPOSURE_OUTCOME_LINK");
  if (orphanPerformanceRecordCount) reasons.push("ORPHAN_PERFORMANCE_RECORD");
  if (orphanResponseRecordCount) reasons.push("ORPHAN_RESPONSE_RECORD");
  if (wrongPrescriptionRevisionCount) reasons.push("WRONG_FINAL_PRESCRIPTION_REVISION");
  if (wrongSequenceRevisionCount) reasons.push("WRONG_FINAL_SEQUENCE_REVISION");
  if (crossSessionCollisionCount) reasons.push("CROSS_SESSION_SOURCE_EVENT_COLLISION");
  if (entries.some((entry) => entry.athleteId !== input.ledger.athleteId ||
      entry.athleteId !== input.outcomeSnapshot.athleteId)) reasons.push("LEDGER_ATHLETE_LINEAGE_INVALID");
  if (!explicitIsoTime(input.ledger.evaluationTime) || entries.some((entry) => !explicitIsoTime(entry.occurredAt) ||
      Date.parse(entry.occurredAt) > Date.parse(input.ledger.evaluationTime))) reasons.push("COMPLETED_OUTCOME_TIME_INVALID");
  if (entries.some((entry) => entry.sourceAuthority !== "caller_validated_production_source")) {
    reasons.push("PRODUCTION_SOURCE_AUTHORITY_REQUIRED");
  }
  return Object.freeze({ expectedPlannedEventCount: input.ledger.expectedSourceExposureEventIds.length,
    observedOutcomeEventCount: new Set(entries.map((entry) => entry.sourceExposureEventId)).size,
    completedEventCount: entries.filter((entry) => ["completed_as_planned", "completed_with_variation"]
      .includes(entry.eventCompletionState)).length,
    partialEventCount: entries.filter((entry) => entry.eventCompletionState === "partially_completed").length,
    notPerformedEventCount: entries.filter((entry) => entry.eventCompletionState === "not_performed").length,
    substitutedEventCount: entries.filter((entry) => entry.eventCompletionState === "substituted_and_completed").length,
    unknownOutcomeCount: entries.filter((entry) => entry.eventCompletionState === "outcome_unknown").length,
    duplicateOutcomeEntryCount, missingOutcomeLinkCount, orphanPerformanceRecordCount, orphanResponseRecordCount,
    orphanBlockResultCount, wrongPrescriptionRevisionCount, wrongSequenceRevisionCount, crossSessionCollisionCount,
    plannedAsActualCount, prescribedTimingAsActualCount, multiBlockFlatteningCount,
    reasonCodes: Object.freeze(uniqueSorted(reasons)) });
}
