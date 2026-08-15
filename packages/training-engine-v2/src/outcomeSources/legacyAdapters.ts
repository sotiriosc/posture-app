import { stableId, uniqueSorted } from "../prescription/compiler/utilities";

export const LEGACY_OUTCOME_SOURCE_LIMITATIONS = Object.freeze([
  "source_event_mapping_required", "prescription_revision_mapping_required",
  "sequence_revision_mapping_required", "block_mapping_required", "multi_block_structure_unavailable",
  "actual_timing_unverified", "planned_actual_mixed", "free_text_ignored", "decision_use_restricted",
  "backfill_review_required", "athlete_mapping_required", "event_time_missing", "unsupported_record",
  "conflict_requires_review",
] as const);
export type LegacyOutcomeSourceLimitation = typeof LEGACY_OUTCOME_SOURCE_LIMITATIONS[number];
export type LegacyBackfillClassification = "backfill_ready" | LegacyOutcomeSourceLimitation;

export interface LegacyBackfillMapping {
  readonly athleteId: string | null;
  readonly sourceExposureEventId: string | null;
  readonly prescriptionId: string | null;
  readonly prescriptionRevisionId: string | null;
  readonly sequencePlanId: string | null;
  readonly sequenceRevisionId: string | null;
  readonly blockIds: readonly string[];
  readonly actualTimingVerified: boolean;
}

export interface LegacyCompatibilityProjection {
  readonly adapterId: string;
  readonly adapterVersion: "1.0.0";
  readonly sourceNativeRecordId: string;
  readonly sourceCategory: string;
  readonly categoricalAuthority: "imported_legacy_record";
  readonly decisionUseState: "restricted";
  readonly contextualFacts: Readonly<Record<string, unknown>>;
  readonly limitations: readonly LegacyOutcomeSourceLimitation[];
  readonly backfillClassifications: readonly LegacyBackfillClassification[];
  readonly projectionFingerprint: string;
}

export interface LegacyExerciseLogInput {
  readonly id: string;
  readonly userId?: string | null;
  readonly sessionId: string;
  readonly exerciseId: string;
  readonly originalExerciseId?: string | null;
  readonly substitutedExerciseId?: string | null;
  readonly programId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly weight?: number | null;
  readonly reps?: number | null;
  readonly repsBySet?: readonly number[] | null;
  readonly setsPlanned?: number | null;
  readonly setsCompleted?: number | null;
  readonly durationSec?: number | null;
  readonly activeDurationSec?: number | null;
  readonly workSecondsUsed?: number | null;
  readonly restSecondsUsed?: number | null;
  readonly rpe?: number | null;
  readonly felt?: string | null;
  readonly painLevel?: string | null;
  readonly painLocation?: string | null;
  readonly feedbackNotes?: string | null;
  readonly notes?: string | null;
}

export interface LegacySessionRecordInput {
  readonly id: string;
  readonly userId?: string | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
  readonly createdAt?: string | null;
  readonly durationSec?: number | null;
  readonly activeDurationSec?: number | null;
  readonly abandoned?: boolean | null;
  readonly notes?: string | null;
  readonly sessionFeedbackNotes?: string | null;
  readonly feedback?: Readonly<Record<string, unknown>> | null;
}

export interface LegacyStructuredFeedbackInput {
  readonly id: string;
  readonly sessionId: string;
  readonly completed?: "yes" | "partial" | "no";
  readonly difficultyRPE?: number;
  readonly painBefore?: number;
  readonly painAfter?: number;
  readonly energy?: number;
  readonly techniqueConfidence?: number;
  readonly enjoyment?: number;
  readonly timeAvailableNextSession?: number;
  readonly notes?: string;
  readonly eventTime?: string | null;
}

export interface LegacyQuestionnaireInput {
  readonly id?: string;
  readonly completedAt?: string | null;
  readonly structuredAnswers: Readonly<Record<string, string | number | boolean | readonly string[] | null>>;
}

export interface LegacyEquipmentPreferenceInput {
  readonly id: string;
  readonly equipmentIds: readonly string[];
  readonly blockedExerciseIds?: Readonly<Record<string, { readonly reason: string }>>;
  readonly updatedAt?: string | null;
}

function mappingLimitations(mapping?: Partial<LegacyBackfillMapping>): LegacyOutcomeSourceLimitation[] {
  const limitations: LegacyOutcomeSourceLimitation[] = [];
  if (!mapping?.athleteId) limitations.push("athlete_mapping_required");
  if (!mapping?.sourceExposureEventId) limitations.push("source_event_mapping_required");
  if (!mapping?.prescriptionRevisionId) limitations.push("prescription_revision_mapping_required");
  if (!mapping?.sequenceRevisionId) limitations.push("sequence_revision_mapping_required");
  if (!mapping?.blockIds?.length) limitations.push("block_mapping_required", "multi_block_structure_unavailable");
  if (!mapping?.actualTimingVerified) limitations.push("actual_timing_unverified");
  return limitations;
}

function projection(input: Omit<LegacyCompatibilityProjection, "adapterVersion" | "categoricalAuthority" |
"decisionUseState" | "projectionFingerprint">): LegacyCompatibilityProjection {
  const base = { ...input, limitations: Object.freeze(uniqueSorted(input.limitations) as LegacyOutcomeSourceLimitation[]),
    backfillClassifications: Object.freeze(uniqueSorted(input.backfillClassifications) as LegacyBackfillClassification[]),
    adapterVersion: "1.0.0" as const, categoricalAuthority: "imported_legacy_record" as const,
    decisionUseState: "restricted" as const };
  return Object.freeze({ ...base, projectionFingerprint: stableId("legacy-outcome-source-projection", base) });
}

export function LegacyExerciseLogAdapter(
  record: LegacyExerciseLogInput,
  mapping?: Partial<LegacyBackfillMapping>,
): LegacyCompatibilityProjection {
  const limitations = mappingLimitations(mapping);
  limitations.push("planned_actual_mixed", "decision_use_restricted", "backfill_review_required");
  if (record.notes || record.feedbackNotes) limitations.push("free_text_ignored");
  if (!record.createdAt) limitations.push("event_time_missing");
  if ((mapping?.blockIds?.length ?? 0) !== 1) limitations.push("multi_block_structure_unavailable");
  return projection({ adapterId: "LegacyExerciseLogAdapter", sourceNativeRecordId: record.id,
    sourceCategory: "exercise_performance", contextualFacts: Object.freeze({ sessionId: record.sessionId,
      exerciseId: record.exerciseId, originalExerciseId: record.originalExerciseId ?? record.exerciseId,
      substitutedExerciseId: record.substitutedExerciseId ?? null, programId: record.programId ?? null,
      loggedWeight: record.weight ?? null, loggedReps: record.reps ?? null,
      loggedRepsBySet: record.repsBySet ?? null, setsPlanned: record.setsPlanned ?? null,
      setsCompleted: record.setsCompleted ?? null, durationSec: record.durationSec ?? null,
      activeDurationSec: record.activeDurationSec ?? null, workSecondsUsed: record.workSecondsUsed ?? null,
      restSecondsUsed: record.restSecondsUsed ?? null, rpe: record.rpe ?? null,
      felt: record.felt ?? null, painLevel: record.painLevel ?? null,
      painLocation: record.painLocation ?? null, eventTime: record.createdAt ?? null }),
    limitations, backfillClassifications: limitations });
}

export function LegacySessionRecordAdapter(
  record: LegacySessionRecordInput,
  mapping?: Partial<LegacyBackfillMapping>,
): LegacyCompatibilityProjection {
  const limitations = mappingLimitations(mapping);
  limitations.push("decision_use_restricted", "backfill_review_required");
  if (!record.startedAt && !record.completedAt && !record.createdAt) limitations.push("event_time_missing");
  if (record.notes || record.sessionFeedbackNotes) limitations.push("free_text_ignored");
  return projection({ adapterId: "LegacySessionRecordAdapter", sourceNativeRecordId: record.id,
    sourceCategory: "session_completion", contextualFacts: Object.freeze({ startedAt: record.startedAt ?? null,
      completedAt: record.completedAt ?? null, durationSec: record.durationSec ?? null,
      activeDurationSec: record.activeDurationSec ?? null, abandoned: record.abandoned ?? null,
      structuredFeedbackPresent: Boolean(record.feedback) }), limitations, backfillClassifications: limitations });
}

export function LegacyStructuredFeedbackAdapter(
  record: LegacyStructuredFeedbackInput,
  mapping?: Partial<LegacyBackfillMapping>,
): LegacyCompatibilityProjection {
  const limitations = mappingLimitations(mapping);
  limitations.push("decision_use_restricted", "backfill_review_required");
  if (record.notes) limitations.push("free_text_ignored");
  if (!record.eventTime) limitations.push("event_time_missing");
  return projection({ adapterId: "LegacyStructuredFeedbackAdapter", sourceNativeRecordId: record.id,
    sourceCategory: "training_response", contextualFacts: Object.freeze({ sessionId: record.sessionId,
      completed: record.completed ?? null, difficultyRPE: record.difficultyRPE ?? null,
      painBefore: record.painBefore ?? null, painAfter: record.painAfter ?? null,
      energy: record.energy ?? null, techniqueConfidence: record.techniqueConfidence ?? null,
      enjoyment: record.enjoyment ?? null, timeAvailableNextSession: record.timeAvailableNextSession ?? null,
      eventTime: record.eventTime ?? null }), limitations, backfillClassifications: limitations });
}

export function LegacyQuestionnaireAdapter(
  record: LegacyQuestionnaireInput,
  mapping?: Partial<Pick<LegacyBackfillMapping, "athleteId">>,
): LegacyCompatibilityProjection {
  const limitations: LegacyOutcomeSourceLimitation[] = ["decision_use_restricted", "backfill_review_required"];
  if (!mapping?.athleteId) limitations.push("athlete_mapping_required");
  if (!record.completedAt) limitations.push("event_time_missing");
  return projection({ adapterId: "LegacyQuestionnaireAdapter", sourceNativeRecordId: record.id ??
      stableId("legacy-questionnaire", record.structuredAnswers), sourceCategory: "athlete_report",
    contextualFacts: Object.freeze({ structuredAnswers: record.structuredAnswers,
      completedAt: record.completedAt ?? null }), limitations, backfillClassifications: limitations });
}

export function LegacyEquipmentPreferenceAdapter(
  record: LegacyEquipmentPreferenceInput,
  mapping?: Partial<Pick<LegacyBackfillMapping, "athleteId">>,
): LegacyCompatibilityProjection {
  const limitations: LegacyOutcomeSourceLimitation[] = ["decision_use_restricted", "backfill_review_required"];
  if (!mapping?.athleteId) limitations.push("athlete_mapping_required");
  if (!record.updatedAt) limitations.push("event_time_missing");
  return projection({ adapterId: "LegacyEquipmentPreferenceAdapter", sourceNativeRecordId: record.id,
    sourceCategory: "equipment_snapshot", contextualFacts: Object.freeze({
      equipmentIds: Object.freeze([...record.equipmentIds].sort()),
      blockedExerciseIds: Object.freeze(Object.keys(record.blockedExerciseIds ?? {}).sort()),
      updatedAt: record.updatedAt ?? null }), limitations, backfillClassifications: limitations });
}

export const LEGACY_PRODUCT_COMPATIBILITY_ADAPTERS = Object.freeze([
  "LegacyExerciseLogAdapter", "LegacySessionRecordAdapter", "LegacyStructuredFeedbackAdapter",
  "LegacyQuestionnaireAdapter", "LegacyEquipmentPreferenceAdapter",
] as const);
export const LEGACY_PRODUCT_COMPATIBILITY_ADAPTER_COUNT = LEGACY_PRODUCT_COMPATIBILITY_ADAPTERS.length;
export const PRODUCT_NATIVE_COMPATIBILITY_MAPPING_COUNT = 5 as const;

export interface LegacyBackfillDryRunInput {
  readonly exerciseLogs?: readonly LegacyExerciseLogInput[];
  readonly sessions?: readonly LegacySessionRecordInput[];
  readonly structuredFeedback?: readonly LegacyStructuredFeedbackInput[];
  readonly questionnaire?: LegacyQuestionnaireInput | null;
  readonly equipmentPreferences?: LegacyEquipmentPreferenceInput | null;
  readonly mappings?: Readonly<Record<string, Partial<LegacyBackfillMapping>>>;
}

export interface LegacyBackfillDryRunResult {
  readonly recordCount: number;
  readonly writeCount: 0;
  readonly classifications: Readonly<Record<LegacyBackfillClassification, number>>;
  readonly projections: readonly LegacyCompatibilityProjection[];
  readonly fingerprint: string;
}

export function analyzeLegacyOutcomeSourceBackfill(input: LegacyBackfillDryRunInput): LegacyBackfillDryRunResult {
  const mappings = input.mappings ?? {};
  const projections: LegacyCompatibilityProjection[] = [
    ...(input.exerciseLogs ?? []).map((record) => LegacyExerciseLogAdapter(record, mappings[record.id])),
    ...(input.sessions ?? []).map((record) => LegacySessionRecordAdapter(record, mappings[record.id])),
    ...(input.structuredFeedback ?? []).map((record) => LegacyStructuredFeedbackAdapter(record, mappings[record.id])),
    ...(input.questionnaire ? [LegacyQuestionnaireAdapter(input.questionnaire,
      mappings[input.questionnaire.id ?? "questionnaire"])] : []),
    ...(input.equipmentPreferences ? [LegacyEquipmentPreferenceAdapter(input.equipmentPreferences,
      mappings[input.equipmentPreferences.id])] : []),
  ];
  const keys = ["backfill_ready", ...LEGACY_OUTCOME_SOURCE_LIMITATIONS] as const;
  const classifications = Object.fromEntries(keys.map((key) => [key, 0])) as
    Record<LegacyBackfillClassification, number>;
  for (const item of projections) {
    if (item.backfillClassifications.length === 0) classifications.backfill_ready += 1;
    item.backfillClassifications.forEach((classification) => { classifications[classification] += 1; });
  }
  const semantic = { projections: projections.map((item) => item.projectionFingerprint), classifications };
  return Object.freeze({ recordCount: projections.length, writeCount: 0,
    classifications: Object.freeze(classifications), projections: Object.freeze(projections),
    fingerprint: stableId("legacy-outcome-source-backfill-dry-run", semantic) });
}
