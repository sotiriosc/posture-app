import {
  KNOWLEDGE_COMPLETENESS_AUDIT_CONTRACT,
  type ExerciseKnowledgeCompactFallback,
} from "../../../praxis-knowledge-core/src";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { expectedCanonicalIds } from "../exerciseCatalogHomeComfort/evidence";

export const CURRENT_45_BASELINE_IDS: readonly string[] = Object.freeze([...expectedCanonicalIds]);

export const CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS = Object.freeze([
  "push-up",
  "dumbbell-bench-press",
  "machine-chest-press",
  "one-arm-dumbbell-row",
  "machine-row",
  "band-row",
  "dumbbell-shoulder-press",
  "lat-pulldown",
  "band-lat-pulldown",
  "goblet-squat",
  "leg-press",
  "bodyweight-box-squat",
  "split-squat",
  "glute-bridge",
  "forearm-side-plank",
  "half-kneeling-high-to-low-cable-chop",
  "loop-band-lateral-walk",
] as const);

export const KNOWLEDGE_COMPLETENESS_STATUSES = [
  "knowledge_core_complete",
  "compact_fallback_only",
  "missing_focus",
  "missing_cues",
  "missing_setup",
  "missing_during",
  "missing_pattern",
  "missing_watch_for",
  "realization_override_required",
  "provenance_required",
  "semantic_conflict_review_required",
  "not_applicable",
  "unknown",
] as const;

export type KnowledgeCompletenessStatus = (typeof KNOWLEDGE_COMPLETENESS_STATUSES)[number];

export interface Current45KnowledgeAuditRow {
  readonly exerciseId: string;
  readonly name: string;
  readonly statuses: readonly KnowledgeCompletenessStatus[];
  readonly currentFallback: Omit<ExerciseKnowledgeCompactFallback, "contract" | "sourceFactIds">;
  readonly exactBlockers: readonly string[];
  readonly prioritySignals: readonly string[];
}

const baselineRows = CURRENT_45_BASELINE_IDS.map((id) => {
  const row = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`CURRENT_45_BASELINE_ROW_MISSING:${id}`);
  return row;
});

export const current45KnowledgeCompletenessMatrix: readonly Current45KnowledgeAuditRow[] =
  Object.freeze(baselineRows.map((row) => {
    const realizationOverrideRequired = CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS.includes(
      row.id as (typeof CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS)[number],
    );
    return Object.freeze({
      exerciseId: row.id,
      name: row.name,
      statuses: Object.freeze([
        "compact_fallback_only" as const,
        "missing_focus" as const,
        "missing_cues" as const,
        "missing_setup" as const,
        "missing_during" as const,
        "missing_pattern" as const,
        "missing_watch_for" as const,
        ...(realizationOverrideRequired ? ["realization_override_required" as const] : []),
        "provenance_required" as const,
      ]),
      currentFallback: Object.freeze({
        exerciseId: row.id,
        summary: row.summary,
        coachingFocus: Object.freeze([...row.coachingFocus]),
      }),
      exactBlockers: Object.freeze([
        "Canonical focus, cues, setup, during, pattern, and watchFor facts have not been curated.",
        "Existing summary and coachingFocus remain frozen compact fallbacks and are not promoted into accepted facts.",
        "Fact-level provenance is required.",
        ...(realizationOverrideRequired
          ? ["At least one known realization boundary requires a differences-only Knowledge override review."]
          : []),
      ]),
      prioritySignals: Object.freeze([
        row.sectionSuitability.main ? "main_or_frequent_selection" : "supporting_selection",
        row.bodyRegions.length > 0 ? "pain_context_relevance" : "low_pain_context_relevance",
        realizationOverrideRequired ? "realization_complexity" : "single_reviewed_identity_path",
        row.coachingFocus.length > 0 ? "workout_card_visible" : "compact_copy_gap",
      ]),
    });
  }));

const countStatus = (status: KnowledgeCompletenessStatus) =>
  current45KnowledgeCompletenessMatrix.filter((row) => row.statuses.includes(status)).length;

export const current45KnowledgeAudit = Object.freeze({
  contract: KNOWLEDGE_COMPLETENESS_AUDIT_CONTRACT,
  authority: "read_only_pre_g2k_required" as const,
  baselineRowCount: current45KnowledgeCompletenessMatrix.length,
  baselineUniqueIdCount: new Set(current45KnowledgeCompletenessMatrix.map((row) => row.exerciseId)).size,
  counts: Object.freeze({
    knowledgeCoreComplete: countStatus("knowledge_core_complete"),
    compactFallbackOnly: countStatus("compact_fallback_only"),
    missingFocus: countStatus("missing_focus"),
    missingCues: countStatus("missing_cues"),
    missingSetup: countStatus("missing_setup"),
    missingDuring: countStatus("missing_during"),
    missingPattern: countStatus("missing_pattern"),
    missingWatchFor: countStatus("missing_watch_for"),
    realizationOverrideRequired: countStatus("realization_override_required"),
    provenanceRequired: countStatus("provenance_required"),
    semanticConflictReviewRequired: countStatus("semantic_conflict_review_required"),
    rowBlockerCount: current45KnowledgeCompletenessMatrix.filter((row) =>
      !row.statuses.includes("knowledge_core_complete")).length,
  }),
  compactFallbackChanges: 0,
  inferredKnowledgeEntries: 0,
  exactNextDependency: "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION",
});
