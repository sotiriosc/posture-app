import type { ExercisePerformanceRecord } from "./prescription/performanceOutcome";
import type { ExercisePrescription } from "./prescription/prescription";
import type { PrescriptionSide } from "./prescription/types";
import type {
  TrainingResponseHistory,
  TrainingResponseObservation,
} from "./domain/trainingResponse";

export type TrainingResponseEvidenceClassification =
  | "SUCCESSFUL_TOLERATED_EXPOSURE"
  | "IMPROVED_RESPONSE"
  | "UNCHANGED_RESPONSE"
  | "LIMITED_EXPOSURE"
  | "AGGRAVATED_EXPOSURE"
  | "UNKNOWN_RESPONSE";

export interface TrainingResponseLedgerEntry {
  readonly observationId: string;
  readonly occurredAt: string;
  readonly exerciseId: string;
  readonly prescriptionId: string | null;
  readonly performanceRecordId: string | null;
  readonly sourceExposureEventId: string | null;
  readonly realizedStressExposureIds: readonly string[];
  readonly classification: TrainingResponseEvidenceClassification;
  readonly evidenceClassifications: readonly TrainingResponseEvidenceClassification[];
  readonly observation: TrainingResponseObservation;
}

export interface TrainingResponseLedgerTrace {
  readonly asOf: string;
  readonly exerciseId: string;
  readonly requestedPrescriptionId: string | null;
  readonly requestedSide: PrescriptionSide | null;
  readonly orderedRelevantObservations: readonly TrainingResponseLedgerEntry[];
  readonly latestApplicableResponse: TrainingResponseLedgerEntry | null;
  readonly previousApplicableResponses: readonly TrainingResponseLedgerEntry[];
  readonly observationIds: readonly string[];
  readonly hasLaterToleratedExposureAfterLimitedOrNotTolerated: boolean;
  readonly earlierAdverseObservationIdsWithLaterToleratedExposure: readonly string[];
  readonly hasConflictingHistory: boolean;
  readonly hasUnknownEvidence: boolean;
  readonly evidenceStatus:
    | "NO_APPLICABLE_EVIDENCE"
    | "OBSERVED_HISTORY"
    | "MIXED_OR_CONFLICTING_HISTORY"
    | "INSUFFICIENT_OR_UNKNOWN_EVIDENCE";
}

export interface TrainingResponseContextFinding {
  readonly severity: "error";
  readonly code: string;
  readonly message: string;
  readonly observationId: string;
}

function linkedPerformanceRecordId(
  observation: TrainingResponseObservation,
): string | undefined {
  return "performanceRecordId" in observation.exposure
    ? observation.exposure.performanceRecordId
    : undefined;
}

export function validateTrainingResponseContext(input: {
  readonly history: TrainingResponseHistory;
  readonly prescriptions: readonly ExercisePrescription[];
  readonly performanceRecords: readonly ExercisePerformanceRecord[];
}): readonly TrainingResponseContextFinding[] {
  const findings: TrainingResponseContextFinding[] = [];
  const prescriptions = new Map(input.prescriptions.map((item) => [item.prescriptionId, item]));
  const performances = new Map(input.performanceRecords.map((item) => [item.performanceRecordId, item]));
  const add = (code: string, message: string, observationId: string): void => {
    findings.push({ severity: "error", code, message, observationId });
  };
  for (const observation of input.history.observations) {
    const link = observation.exposure;
    if (link.prescriptionId) {
      const prescription = prescriptions.get(link.prescriptionId);
      if (!prescription) add("missing_response_prescription", "Linked response prescription does not exist.", observation.observationId);
      else if (prescription.exerciseId !== link.exerciseId) add("response_prescription_exercise_mismatch", "Linked prescription exercise must match the response exercise.", observation.observationId);
    }
    const performanceRecordId = linkedPerformanceRecordId(observation);
    if (performanceRecordId) {
      const performance = performances.get(performanceRecordId);
      if (!performance) add("missing_response_performance_record", "Linked response performance record does not exist.", observation.observationId);
      else {
        if (performance.exerciseId !== link.exerciseId || performance.prescriptionId !== link.prescriptionId) {
          add("response_performance_link_mismatch", "Linked performance exercise and prescription must match the response exposure.", observation.observationId);
        }
        if (!performance.trainingResponseObservationIds.includes(observation.observationId)) {
          add("performance_missing_response_back_reference", "Linked performance record must reference the response observation.", observation.observationId);
        }
      }
    }
  }
  return findings;
}

function validTime(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function classify(
  observation: TrainingResponseObservation,
): TrainingResponseEvidenceClassification {
  if (observation.tolerance === "unknown" || observation.symptomChange === "unknown") {
    return "UNKNOWN_RESPONSE";
  }
  if (observation.tolerance === "not_tolerated" || observation.symptomChange === "worsened") {
    return "AGGRAVATED_EXPOSURE";
  }
  if (observation.tolerance === "limited") return "LIMITED_EXPOSURE";
  if (observation.symptomChange === "improved") return "IMPROVED_RESPONSE";
  if (observation.symptomChange === "unchanged") return "UNCHANGED_RESPONSE";
  return "SUCCESSFUL_TOLERATED_EXPOSURE";
}

function classifications(
  observation: TrainingResponseObservation,
): readonly TrainingResponseEvidenceClassification[] {
  const values: TrainingResponseEvidenceClassification[] = [];
  if (observation.tolerance === "tolerated") values.push("SUCCESSFUL_TOLERATED_EXPOSURE");
  if (observation.tolerance === "limited") values.push("LIMITED_EXPOSURE");
  if (observation.tolerance === "not_tolerated") values.push("AGGRAVATED_EXPOSURE");
  if (observation.symptomChange === "improved") values.push("IMPROVED_RESPONSE");
  if (observation.symptomChange === "unchanged") values.push("UNCHANGED_RESPONSE");
  if (observation.symptomChange === "worsened") values.push("AGGRAVATED_EXPOSURE");
  if (values.length === 0 || observation.tolerance === "unknown" || observation.symptomChange === "unknown") {
    values.push("UNKNOWN_RESPONSE");
  }
  return [...new Set(values)];
}

function prescriptionUsesSide(
  prescription: ExercisePrescription | undefined,
  requestedSide: PrescriptionSide,
): boolean {
  const behavior = prescription?.dose.sideBehavior;
  if (!behavior) return false;
  return (
    behavior.loadSide === requestedSide ||
    behavior.supportSide === requestedSide ||
    behavior.startingSide === requestedSide ||
    behavior.movementSide?.kind === "each_side" ||
    (behavior.movementSide?.kind === "single_side" &&
      behavior.movementSide.side === requestedSide) ||
    (behavior.movementSide?.kind === "alternating" &&
      (!behavior.movementSide.startingSide ||
        behavior.movementSide.startingSide === requestedSide))
  );
}

export function buildTrainingResponseLedger(input: {
  readonly history: TrainingResponseHistory;
  readonly asOf: string;
  readonly exerciseId: string;
  readonly prescriptionId?: string;
  readonly side?: PrescriptionSide;
  readonly prescriptions?: readonly ExercisePrescription[];
  readonly performanceRecords?: readonly ExercisePerformanceRecord[];
}): TrainingResponseLedgerTrace {
  const asOfTime = validTime(input.asOf);
  const prescriptions = new Map(
    (input.prescriptions ?? []).map((prescription) => [
      prescription.prescriptionId,
      prescription,
    ]),
  );
  const performances = new Map(
    (input.performanceRecords ?? []).map((performance) => [
      performance.performanceRecordId,
      performance,
    ]),
  );
  const relevant = input.history.observations
    .filter((observation) => {
      const occurredAt = validTime(observation.occurredAt);
      if (occurredAt === null || asOfTime === null || occurredAt > asOfTime) return false;
      if (observation.exposure.exerciseId !== input.exerciseId) return false;
      if (
        input.prescriptionId &&
        observation.exposure.prescriptionId !== input.prescriptionId
      ) return false;
      if (input.side) {
        const linkedPrescription = observation.exposure.prescriptionId
          ? prescriptions.get(observation.exposure.prescriptionId)
          : undefined;
        if (!prescriptionUsesSide(linkedPrescription, input.side)) return false;
      }
      return true;
    })
    .sort((left, right) => {
      const timeDelta = (validTime(left.occurredAt) ?? 0) - (validTime(right.occurredAt) ?? 0);
      return timeDelta || left.observationId.localeCompare(right.observationId);
    });
  const entries = relevant.map((observation): TrainingResponseLedgerEntry => {
    const performanceRecordId = linkedPerformanceRecordId(observation);
    const performance = performanceRecordId
      ? performances.get(performanceRecordId)
      : undefined;
    return {
      observationId: observation.observationId,
      occurredAt: observation.occurredAt,
      exerciseId: observation.exposure.exerciseId,
      prescriptionId: observation.exposure.prescriptionId ?? null,
      performanceRecordId: performanceRecordId ?? null,
      sourceExposureEventId: observation.exposure.sourceExposureEventId ?? null,
      realizedStressExposureIds: [
        ...new Set([
          ...observation.exposure.realizedStressExposureIds,
          ...(performance?.realizedStressExposureIds ?? []),
        ]),
      ].sort(),
      classification: classify(observation),
      evidenceClassifications: classifications(observation),
      observation,
    };
  });
  const adverse = entries.filter((entry) =>
    entry.classification === "LIMITED_EXPOSURE" ||
    entry.classification === "AGGRAVATED_EXPOSURE",
  );
  const tolerated = entries.filter((entry) =>
    [
      "SUCCESSFUL_TOLERATED_EXPOSURE",
      "IMPROVED_RESPONSE",
      "UNCHANGED_RESPONSE",
    ].includes(entry.classification),
  );
  const earlierWithLaterTolerance = adverse
    .filter((entry) =>
      tolerated.some(
        (candidate) =>
          (validTime(candidate.occurredAt) ?? 0) >
          (validTime(entry.occurredAt) ?? 0),
      ),
    )
    .map((entry) => entry.observationId);
  const hasUnknownEvidence = entries.some(
    (entry) => entry.classification === "UNKNOWN_RESPONSE",
  );
  const hasConflictingHistory = adverse.length > 0 && tolerated.length > 0;
  const evidenceStatus =
    entries.length === 0
      ? "NO_APPLICABLE_EVIDENCE"
      : hasConflictingHistory
        ? "MIXED_OR_CONFLICTING_HISTORY"
        : hasUnknownEvidence
          ? "INSUFFICIENT_OR_UNKNOWN_EVIDENCE"
          : "OBSERVED_HISTORY";

  return {
    asOf: input.asOf,
    exerciseId: input.exerciseId,
    requestedPrescriptionId: input.prescriptionId ?? null,
    requestedSide: input.side ?? null,
    orderedRelevantObservations: entries,
    latestApplicableResponse: entries.at(-1) ?? null,
    previousApplicableResponses: entries.slice(0, -1),
    observationIds: entries.map((entry) => entry.observationId),
    hasLaterToleratedExposureAfterLimitedOrNotTolerated:
      earlierWithLaterTolerance.length > 0,
    earlierAdverseObservationIdsWithLaterToleratedExposure:
      earlierWithLaterTolerance,
    hasConflictingHistory,
    hasUnknownEvidence,
    evidenceStatus,
  };
}
