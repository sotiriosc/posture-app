import type { TrainingResponseObservation } from "./domain/trainingResponse";
import type { ExercisePerformanceRecord } from "./prescription/performanceOutcome";
import type { ExercisePrescription } from "./prescription/prescription";
import type { PrescriptionSide } from "./prescription/types";
import {
  buildTrainingResponseLedger,
  type TrainingResponseEvidenceClassification,
  type TrainingResponseLedgerEntry,
} from "./trainingResponseHistory";

export const TRAINING_RESPONSE_APPLICABILITY_LEVELS = [
  "EXACT_REALIZATION_EVIDENCE",
  "RELATED_REALIZATION_EVIDENCE",
  "EXERCISE_IDENTITY_HISTORY",
] as const;

export type TrainingResponseApplicabilityLevel =
  (typeof TRAINING_RESPONSE_APPLICABILITY_LEVELS)[number];

export const TRAINING_RESPONSE_RECEIVER_CLASSIFICATIONS = [
  "NO_APPLICABLE_RESPONSE_EVIDENCE",
  "CONTINUITY_SUPPORTED",
  "CURRENT_PRESCRIPTION_MAY_CONTINUE",
  "HOLD_MONITOR_CURRENT_PRESCRIPTION",
  "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
  "PROGRESSION_REVIEW_PERMITTED",
  "INSUFFICIENT_OR_MIXED_EVIDENCE",
  "EXERCISE_REPLACEMENT_CONSIDERATION_EVIDENCE",
] as const;

export type TrainingResponseReceiverClassification =
  (typeof TRAINING_RESPONSE_RECEIVER_CLASSIFICATIONS)[number];

export type TrainingResponseReceiverOwner =
  | "NO_RESPONSE_OWNER_ACTION"
  | "CONTINUITY_OWNER"
  | "PROGRESSION_REVIEW_OWNER"
  | "PRESCRIPTION_REVIEW_OWNER"
  | "EXERCISE_REPLACEMENT_CONSIDERATION_OWNER";

export type RealizationDifference =
  | "prescription_id"
  | "performance_record"
  | "phase"
  | "dose_mode"
  | "volume"
  | "load"
  | "effort"
  | "rest"
  | "range"
  | "tempo"
  | "support"
  | "lever"
  | "laterality"
  | "side_behavior"
  | "realization_detail_unknown";

export interface ApplicableTrainingResponseEvidence {
  readonly observationId: string;
  readonly applicability: TrainingResponseApplicabilityLevel;
  readonly matchBasis:
    | "performance_record_id"
    | "prescription_id"
    | "related_prescription"
    | "exercise_identity_only";
  readonly prescriptionId: string | null;
  readonly performanceRecordId: string | null;
  readonly structuredDifferences: readonly RealizationDifference[];
  readonly classification: TrainingResponseEvidenceClassification;
  readonly observation: TrainingResponseObservation;
}

export interface AdverseTrainingResponseSummary {
  readonly observationCount: number;
  readonly observationIds: readonly string[];
  readonly distinctPrescriptionIds: readonly string[];
  readonly distinctSupportContexts: readonly string[];
  readonly distinctLoadContexts: readonly string[];
  readonly distinctRangeContexts: readonly string[];
  readonly occurredAcrossMateriallyDifferentRealizations: boolean;
  readonly laterToleratedObservationIds: readonly string[];
}

export interface TrainingResponseReceiverTrace {
  readonly asOf: string;
  readonly exerciseId: string;
  readonly prescriptionId: string;
  readonly performanceRecordId: string | null;
  readonly classifications: readonly TrainingResponseReceiverClassification[];
  readonly nextOwner: TrainingResponseReceiverOwner;
  readonly continuityRecommendation:
    | "NO_APPLICABLE_RESPONSE_EVIDENCE"
    | "KEEP_UNLESS_OTHER_PROGRAMMING_REASON"
    | "REVIEW_CURRENT_PRESCRIPTION_BEFORE_REPLACEMENT"
    | "INSUFFICIENT_EVIDENCE";
  readonly exactRealizationEvidence: readonly ApplicableTrainingResponseEvidence[];
  readonly relatedRealizationEvidence: readonly ApplicableTrainingResponseEvidence[];
  readonly exerciseIdentityHistory: readonly ApplicableTrainingResponseEvidence[];
  readonly latestExactResponse: ApplicableTrainingResponseEvidence | null;
  readonly adverseHistory: AdverseTrainingResponseSummary;
  readonly successfulReExposure: boolean;
  readonly mixedOrConflictingExactEvidence: boolean;
  readonly unknownExactEvidence: boolean;
  readonly prescriptionReviewPrecedesReplacement: true;
  readonly automaticPrescriptionChange: false;
  readonly automaticProgressionDecision: false;
  readonly automaticExerciseReplacement: false;
  readonly reason: string;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonical(child)]),
    );
  }
  return value;
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function volumeShape(prescription: ExercisePrescription): unknown {
  const dose = prescription.dose;
  switch (dose.mode) {
    case "repetition_sets":
      return { sets: dose.sets, repetitions: dose.repetitions, perSide: dose.perSide };
    case "timed_hold":
      return { sets: dose.sets, duration: dose.duration };
    case "breath_cycles":
      return { rounds: dose.rounds, breathCycles: dose.breathCycles };
    case "distance_carry":
      return { trips: dose.trips, distancePerTrip: dose.distancePerTrip };
    case "timed_carry":
      return { trips: dose.trips, durationPerTrip: dose.durationPerTrip };
    case "step_march":
      return { steps: dose.steps, duration: dose.duration, alternation: dose.alternation };
    case "step_sets":
      return {
        sets: dose.sets,
        steps: dose.steps,
        stepCountInterpretation: dose.stepCountInterpretation,
        alternation: dose.alternation,
      };
  }
}

function realizationDifferences(
  current: ExercisePrescription,
  historical: ExercisePrescription,
): readonly RealizationDifference[] {
  const differences: RealizationDifference[] = [];
  const compare = (
    difference: RealizationDifference,
    left: unknown,
    right: unknown,
  ): void => {
    if (!sameValue(left, right)) differences.push(difference);
  };

  if (current.prescriptionId !== historical.prescriptionId) {
    differences.push("prescription_id");
  }
  compare("phase", current.phaseId, historical.phaseId);
  compare("dose_mode", current.dose.mode, historical.dose.mode);
  compare("volume", volumeShape(current), volumeShape(historical));
  compare("load", current.dose.load, historical.dose.load);
  compare("effort", current.dose.effort, historical.dose.effort);
  compare("rest", current.dose.rest, historical.dose.rest);
  compare("range", current.dose.range, historical.dose.range);
  compare(
    "tempo",
    "tempo" in current.dose ? current.dose.tempo : undefined,
    "tempo" in historical.dose ? historical.dose.tempo : undefined,
  );
  compare("support", current.dose.support, historical.dose.support);
  compare("lever", current.dose.lever, historical.dose.lever);
  compare("laterality", current.dose.laterality, historical.dose.laterality);
  compare("side_behavior", current.dose.sideBehavior, historical.dose.sideBehavior);
  return differences;
}

function isAdverse(observation: TrainingResponseObservation): boolean {
  return (
    observation.tolerance === "not_tolerated" ||
    observation.symptomChange === "worsened" ||
    observation.consequence === "stopped_exercise" ||
    observation.consequence === "stopped_session"
  );
}

function isLimited(observation: TrainingResponseObservation): boolean {
  return observation.tolerance === "limited";
}

function isTolerated(observation: TrainingResponseObservation): boolean {
  return observation.tolerance === "tolerated" && !isAdverse(observation);
}

function isUnknown(observation: TrainingResponseObservation): boolean {
  return (
    observation.tolerance === "unknown" ||
    observation.symptomChange === "unknown" ||
    observation.onset === "unknown" ||
    observation.persistence === "unknown" ||
    observation.consequence === "unknown"
  );
}

function contextValue(value: unknown): string {
  return JSON.stringify(canonical(value));
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function evidenceFromEntry(input: {
  readonly entry: TrainingResponseLedgerEntry;
  readonly currentPrescription: ExercisePrescription;
  readonly currentPerformanceRecord?: ExercisePerformanceRecord;
  readonly prescriptions: ReadonlyMap<string, ExercisePrescription>;
}): ApplicableTrainingResponseEvidence {
  const historicalPrescription = input.entry.prescriptionId
    ? input.prescriptions.get(input.entry.prescriptionId)
    : undefined;
  const exactPerformance = Boolean(
    input.currentPerformanceRecord &&
      input.entry.performanceRecordId ===
        input.currentPerformanceRecord.performanceRecordId,
  );
  const exactPrescription =
    !input.currentPerformanceRecord &&
    input.entry.prescriptionId === input.currentPrescription.prescriptionId;

  if (exactPerformance || exactPrescription) {
    return {
      observationId: input.entry.observationId,
      applicability: "EXACT_REALIZATION_EVIDENCE",
      matchBasis: exactPerformance ? "performance_record_id" : "prescription_id",
      prescriptionId: input.entry.prescriptionId,
      performanceRecordId: input.entry.performanceRecordId,
      structuredDifferences: [],
      classification: input.entry.classification,
      observation: input.entry.observation,
    };
  }

  if (historicalPrescription) {
    const structuredDifferences: RealizationDifference[] = [
      ...realizationDifferences(
        input.currentPrescription,
        historicalPrescription,
      ),
    ];
    if (
      input.currentPerformanceRecord &&
      historicalPrescription.prescriptionId ===
        input.currentPrescription.prescriptionId
    ) {
      structuredDifferences.push("performance_record");
    }
    return {
      observationId: input.entry.observationId,
      applicability: "RELATED_REALIZATION_EVIDENCE",
      matchBasis: "related_prescription",
      prescriptionId: input.entry.prescriptionId,
      performanceRecordId: input.entry.performanceRecordId,
      structuredDifferences: unique(structuredDifferences),
      classification: input.entry.classification,
      observation: input.entry.observation,
    };
  }

  return {
    observationId: input.entry.observationId,
    applicability: "EXERCISE_IDENTITY_HISTORY",
    matchBasis: "exercise_identity_only",
    prescriptionId: input.entry.prescriptionId,
    performanceRecordId: input.entry.performanceRecordId,
    structuredDifferences: ["realization_detail_unknown"],
    classification: input.entry.classification,
    observation: input.entry.observation,
  };
}

function summarizeAdverseHistory(input: {
  readonly entries: readonly ApplicableTrainingResponseEvidence[];
  readonly prescriptions: ReadonlyMap<string, ExercisePrescription>;
}): AdverseTrainingResponseSummary {
  const adverse = input.entries.filter(
    (entry) => isAdverse(entry.observation) || isLimited(entry.observation),
  );
  const adverseTimes = adverse.map((entry) => Date.parse(entry.observation.occurredAt));
  const latestAdverseTime = adverseTimes.length > 0 ? Math.max(...adverseTimes) : null;
  const laterTolerated = latestAdverseTime === null
    ? []
    : input.entries.filter(
        (entry) =>
          isTolerated(entry.observation) &&
          Date.parse(entry.observation.occurredAt) > latestAdverseTime,
      );
  const contexts = adverse
    .map((entry) =>
      entry.prescriptionId
        ? input.prescriptions.get(entry.prescriptionId)
        : undefined,
    )
    .filter((candidate): candidate is ExercisePrescription => Boolean(candidate));
  const distinctPrescriptionIds = unique(
    adverse.flatMap((entry) => entry.prescriptionId ? [entry.prescriptionId] : []),
  );
  const distinctSupportContexts = unique(
    contexts.map((prescription) => contextValue(prescription.dose.support ?? null)),
  );
  const distinctLoadContexts = unique(
    contexts.map((prescription) => contextValue(prescription.dose.load ?? null)),
  );
  const distinctRangeContexts = unique(
    contexts.map((prescription) => contextValue(prescription.dose.range ?? null)),
  );
  const occurredAcrossMateriallyDifferentRealizations = contexts.some(
    (left, leftIndex) =>
      contexts.slice(leftIndex + 1).some((right) =>
        realizationDifferences(left, right).some(
          (difference) => difference !== "prescription_id",
        ),
      ),
  );

  return {
    observationCount: adverse.length,
    observationIds: adverse.map((entry) => entry.observationId),
    distinctPrescriptionIds,
    distinctSupportContexts,
    distinctLoadContexts,
    distinctRangeContexts,
    occurredAcrossMateriallyDifferentRealizations,
    laterToleratedObservationIds: laterTolerated.map((entry) => entry.observationId),
  };
}

function orderedClassifications(
  values: readonly TrainingResponseReceiverClassification[],
): readonly TrainingResponseReceiverClassification[] {
  return TRAINING_RESPONSE_RECEIVER_CLASSIFICATIONS.filter((candidate) =>
    values.includes(candidate),
  );
}

export function buildTrainingResponseReceiverTrace(input: {
  readonly history: Parameters<typeof buildTrainingResponseLedger>[0]["history"];
  readonly asOf: string;
  readonly currentPrescription: ExercisePrescription;
  readonly currentPerformanceRecord?: ExercisePerformanceRecord;
  readonly prescriptions?: readonly ExercisePrescription[];
  readonly performanceRecords?: readonly ExercisePerformanceRecord[];
  readonly side?: PrescriptionSide;
}): TrainingResponseReceiverTrace {
  const allPrescriptions = uniquePrescriptions([
    input.currentPrescription,
    ...(input.prescriptions ?? []),
  ]);
  const prescriptions = new Map(
    allPrescriptions.map((prescription) => [prescription.prescriptionId, prescription]),
  );
  const ledger = buildTrainingResponseLedger({
    history: input.history,
    asOf: input.asOf,
    exerciseId: input.currentPrescription.exerciseId,
    side: input.side,
    prescriptions: allPrescriptions,
    performanceRecords: input.performanceRecords,
  });
  const evidence = ledger.orderedRelevantObservations.map((entry) =>
    evidenceFromEntry({
      entry,
      currentPrescription: input.currentPrescription,
      currentPerformanceRecord: input.currentPerformanceRecord,
      prescriptions,
    }),
  );
  const exact = evidence.filter(
    (entry) => entry.applicability === "EXACT_REALIZATION_EVIDENCE",
  );
  const related = evidence.filter(
    (entry) => entry.applicability === "RELATED_REALIZATION_EVIDENCE",
  );
  const identity = evidence.filter(
    (entry) => entry.applicability === "EXERCISE_IDENTITY_HISTORY",
  );
  const latestExact = exact.at(-1) ?? null;
  const exactHasPositive = exact.some((entry) => isTolerated(entry.observation));
  const exactHasAdverseOrLimited = exact.some(
    (entry) => isAdverse(entry.observation) || isLimited(entry.observation),
  );
  const mixed = exactHasPositive && exactHasAdverseOrLimited;
  const unknown = exact.some((entry) => isUnknown(entry.observation));
  const adverseHistory = summarizeAdverseHistory({ entries: evidence, prescriptions });
  const successfulReExposure = adverseHistory.laterToleratedObservationIds.length > 0;
  const replacementConsideration =
    adverseHistory.occurredAcrossMateriallyDifferentRealizations &&
    !successfulReExposure;
  const classifications: TrainingResponseReceiverClassification[] = [];

  if (evidence.length === 0) {
    classifications.push("NO_APPLICABLE_RESPONSE_EVIDENCE");
  } else if (exact.length === 0 || unknown || mixed) {
    classifications.push("INSUFFICIENT_OR_MIXED_EVIDENCE");
    if (mixed && latestExact && isTolerated(latestExact.observation)) {
      classifications.push("CURRENT_PRESCRIPTION_MAY_CONTINUE");
    }
  } else if (latestExact && isAdverse(latestExact.observation)) {
    classifications.push(
      "HOLD_MONITOR_CURRENT_PRESCRIPTION",
      "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
    );
  } else if (latestExact && isLimited(latestExact.observation)) {
    classifications.push(
      "HOLD_MONITOR_CURRENT_PRESCRIPTION",
      "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
    );
  } else if (latestExact && isTolerated(latestExact.observation)) {
    classifications.push(
      "CONTINUITY_SUPPORTED",
      "CURRENT_PRESCRIPTION_MAY_CONTINUE",
      "PROGRESSION_REVIEW_PERMITTED",
    );
  } else {
    classifications.push("INSUFFICIENT_OR_MIXED_EVIDENCE");
  }

  if (replacementConsideration) {
    classifications.push("EXERCISE_REPLACEMENT_CONSIDERATION_EVIDENCE");
  }

  const ordered = orderedClassifications(classifications);
  const nextOwner: TrainingResponseReceiverOwner =
    ordered.includes("PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED") ||
    ordered.includes("HOLD_MONITOR_CURRENT_PRESCRIPTION")
      ? "PRESCRIPTION_REVIEW_OWNER"
      : ordered.includes("PROGRESSION_REVIEW_PERMITTED")
        ? "PROGRESSION_REVIEW_OWNER"
        : ordered.includes("CONTINUITY_SUPPORTED")
          ? "CONTINUITY_OWNER"
          : ordered.includes("EXERCISE_REPLACEMENT_CONSIDERATION_EVIDENCE")
            ? "EXERCISE_REPLACEMENT_CONSIDERATION_OWNER"
            : "NO_RESPONSE_OWNER_ACTION";
  const continuityRecommendation = ordered.includes("CONTINUITY_SUPPORTED") ||
    (mixed && latestExact !== null && isTolerated(latestExact.observation))
    ? "KEEP_UNLESS_OTHER_PROGRAMMING_REASON"
    : ordered.includes("PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED")
      ? "REVIEW_CURRENT_PRESCRIPTION_BEFORE_REPLACEMENT"
      : ordered.includes("NO_APPLICABLE_RESPONSE_EVIDENCE")
        ? "NO_APPLICABLE_RESPONSE_EVIDENCE"
        : "INSUFFICIENT_EVIDENCE";

  return {
    asOf: input.asOf,
    exerciseId: input.currentPrescription.exerciseId,
    prescriptionId: input.currentPrescription.prescriptionId,
    performanceRecordId: input.currentPerformanceRecord?.performanceRecordId ?? null,
    classifications: ordered,
    nextOwner,
    continuityRecommendation,
    exactRealizationEvidence: exact,
    relatedRealizationEvidence: related,
    exerciseIdentityHistory: identity,
    latestExactResponse: latestExact,
    adverseHistory,
    successfulReExposure,
    mixedOrConflictingExactEvidence: mixed,
    unknownExactEvidence: unknown,
    prescriptionReviewPrecedesReplacement: true,
    automaticPrescriptionChange: false,
    automaticProgressionDecision: false,
    automaticExerciseReplacement: false,
    reason: receiverReason({ ordered, exact, related, identity, successfulReExposure }),
  };
}

function uniquePrescriptions(
  prescriptions: readonly ExercisePrescription[],
): readonly ExercisePrescription[] {
  const byId = new Map<string, ExercisePrescription>();
  for (const prescription of prescriptions) {
    byId.set(prescription.prescriptionId, prescription);
  }
  return [...byId.values()].sort((left, right) =>
    left.prescriptionId.localeCompare(right.prescriptionId),
  );
}

function receiverReason(input: {
  readonly ordered: readonly TrainingResponseReceiverClassification[];
  readonly exact: readonly ApplicableTrainingResponseEvidence[];
  readonly related: readonly ApplicableTrainingResponseEvidence[];
  readonly identity: readonly ApplicableTrainingResponseEvidence[];
  readonly successfulReExposure: boolean;
}): string {
  if (input.ordered.includes("NO_APPLICABLE_RESPONSE_EVIDENCE")) {
    return "No response observation applies to this exercise identity at the explicit asOf time.";
  }
  if (input.exact.length === 0) {
    return `Only contextual history applies (${input.related.length} related realization, ${input.identity.length} identity-only); it does not prove current-realization tolerance.`;
  }
  if (input.ordered.includes("PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED")) {
    return "Current-realization evidence requests prescription review before any exercise-replacement consideration.";
  }
  if (input.ordered.includes("INSUFFICIENT_OR_MIXED_EVIDENCE")) {
    return input.successfulReExposure
      ? "Mixed history remains visible, including successful later re-exposure; it creates no permanent failure classification."
      : "Current-realization evidence is mixed or unknown and requires review without an automatic action.";
  }
  return "Current tolerated realization supports continuity and permits progression review without selecting or applying progression.";
}
