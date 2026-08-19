import type { BodyRegion, Side } from "./primitives";

export const TRAINING_TOLERANCE_RESULTS = [
  "tolerated",
  "limited",
  "not_tolerated",
  "unknown",
] as const;
export type TrainingToleranceResult =
  (typeof TRAINING_TOLERANCE_RESULTS)[number];

export const REPORTED_SYMPTOM_CHANGES = [
  "improved",
  "unchanged",
  "worsened",
  "not_applicable",
  "unknown",
] as const;
export type ReportedSymptomChange =
  (typeof REPORTED_SYMPTOM_CHANGES)[number];

export const TRAINING_RESPONSE_ONSETS = [
  "during_exposure",
  "immediately_after",
  "delayed",
  "not_applicable",
  "unknown",
] as const;
export type TrainingResponseOnset =
  (typeof TRAINING_RESPONSE_ONSETS)[number];

export const TRAINING_RESPONSE_PERSISTENCE = [
  "resolved_before_next_relevant_exposure",
  "persisted_beyond_observation_window",
  "ongoing",
  "not_applicable",
  "unknown",
] as const;
export type TrainingResponsePersistence =
  (typeof TRAINING_RESPONSE_PERSISTENCE)[number];

export const TRAINING_RESPONSE_CONSEQUENCES = [
  "completed",
  "modified",
  "stopped_exercise",
  "stopped_session",
  "unknown",
] as const;
export type TrainingResponseConsequence =
  (typeof TRAINING_RESPONSE_CONSEQUENCES)[number];

export interface ReportedSymptomLocation {
  readonly region: BodyRegion;
  readonly side: Side | "unknown";
}

export type TrainingExposureLink =
  | {
      readonly realizationStatus: "linked_to_performance_record";
      readonly exerciseId: string;
      readonly prescriptionId: string;
      readonly performanceRecordId: string;
      readonly sourceExposureEventId?: string;
      readonly realizedStressExposureIds: readonly string[];
    }
  | {
      readonly realizationStatus: "linked_to_prescription_only";
      readonly exerciseId: string;
      readonly prescriptionId: string;
      readonly sourceExposureEventId?: string;
      readonly realizedStressExposureIds: readonly string[];
    }
  | {
      readonly realizationStatus: "partial_historical_report" | "unknown";
      readonly exerciseId: string;
      readonly prescriptionId?: string;
      readonly performanceRecordId?: string;
      readonly sourceExposureEventId?: string;
      readonly realizedStressExposureIds: readonly string[];
    };

export const TRAINING_RESPONSE_PROVENANCE_SOURCES = [
  "athlete_report",
  "coach_observation",
  "clinician_report",
  "performance_record",
  "sensor",
  "historical_migration",
  "unknown",
] as const;
export type TrainingResponseProvenanceSource =
  (typeof TRAINING_RESPONSE_PROVENANCE_SOURCES)[number];

export interface TrainingResponseProvenance {
  readonly source: TrainingResponseProvenanceSource;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly reportedBy: string;
  readonly recordedAt: string;
}

export interface TrainingResponseObservation {
  readonly observationId: string;
  readonly occurredAt: string;
  readonly exposure: TrainingExposureLink;
  readonly tolerance: TrainingToleranceResult;
  readonly symptomChange: ReportedSymptomChange;
  readonly onset: TrainingResponseOnset;
  readonly persistence: TrainingResponsePersistence;
  readonly consequence: TrainingResponseConsequence;
  readonly reportedLocations: readonly ReportedSymptomLocation[];
  readonly provenance: TrainingResponseProvenance;
  readonly notes: readonly string[];
}

export interface TrainingResponseHistory {
  readonly observations: readonly TrainingResponseObservation[];
}

export const EMPTY_TRAINING_RESPONSE_HISTORY: TrainingResponseHistory = {
  observations: [],
};

export interface TrainingResponseValidationFinding {
  readonly severity: "error";
  readonly code: string;
  readonly message: string;
  readonly observationId?: string;
}

function validExplicitTime(value: string): boolean {
  return (
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

export function validateTrainingResponseHistory(
  history: TrainingResponseHistory,
): readonly TrainingResponseValidationFinding[] {
  const findings: TrainingResponseValidationFinding[] = [];
  const ids = new Set<string>();
  const add = (code: string, message: string, observationId?: string): void => {
    findings.push({ severity: "error", code, message, observationId });
  };
  if (!Array.isArray(history.observations)) {
    return [{ severity: "error", code: "invalid_training_response_observations", message: "Training response observations must be an array." }];
  }
  for (const observation of history.observations) {
    if (typeof observation !== "object" || observation === null) {
      add("invalid_training_response_observation", "Training response observation must be a structured object.");
      continue;
    }
    const id = observation.observationId;
    if (!id?.trim()) add("missing_training_response_observation_id", "Training response observationId is required.");
    else if (ids.has(id)) add("duplicate_training_response_observation_id", "Training response observationId must be unique.", id);
    else ids.add(id);
    if (!validExplicitTime(observation.occurredAt)) add("invalid_training_response_occurred_at", "Training response occurredAt must be a valid timestamp with explicit timezone.", id);
    if (!observation.exposure?.exerciseId?.trim()) add("missing_training_response_exercise_id", "Training response exposure requires exerciseId.", id);
    if (
      observation.exposure?.realizationStatus === "linked_to_performance_record" &&
      (!observation.exposure.prescriptionId?.trim() || !observation.exposure.performanceRecordId?.trim())
    ) add("incomplete_performance_response_link", "Performance-linked response requires prescriptionId and performanceRecordId.", id);
    if (
      observation.exposure?.realizationStatus === "linked_to_prescription_only" &&
      !observation.exposure.prescriptionId?.trim()
    ) add("incomplete_prescription_response_link", "Prescription-linked response requires prescriptionId.", id);
    if (!TRAINING_TOLERANCE_RESULTS.includes(observation.tolerance)) add("invalid_training_tolerance", "Training tolerance value is invalid.", id);
    if (!REPORTED_SYMPTOM_CHANGES.includes(observation.symptomChange)) add("invalid_training_symptom_change", "Reported symptom change is invalid.", id);
    if (!TRAINING_RESPONSE_ONSETS.includes(observation.onset)) add("invalid_training_response_onset", "Training response onset is invalid.", id);
    if (!TRAINING_RESPONSE_PERSISTENCE.includes(observation.persistence)) add("invalid_training_response_persistence", "Training response persistence is invalid.", id);
    if (!TRAINING_RESPONSE_CONSEQUENCES.includes(observation.consequence)) add("invalid_training_response_consequence", "Training response consequence is invalid.", id);
    if (!TRAINING_RESPONSE_PROVENANCE_SOURCES.includes(observation.provenance?.source)) add("invalid_training_response_provenance_source", "Training response provenance source is invalid.", id);
    if (
      !observation.provenance?.sourceRef?.trim() ||
      !observation.provenance?.reportedBy?.trim() ||
      !validExplicitTime(observation.provenance?.recordedAt ?? "") ||
      !observation.provenance?.evidenceBasis?.length ||
      observation.provenance.evidenceBasis.some((item: string) => !item.trim())
    ) add("incomplete_training_response_provenance", "Training response provenance requires sourceRef, reportedBy, recordedAt, and evidence basis.", id);
  }
  return findings;
}
