import {
  PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING_REFERENCE,
  PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION_REFERENCE,
  REFERENCE_EXERCISES,
  type ProductExperienceRealizationShadowMapping,
  type ProductLegacyHistoryAuthorityProjection,
} from "@praxis/training-engine-v2";
import type { ExerciseLog, Program, SessionRecord } from "../types";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapProductExperienceForRealization(
  questionnaire: Record<string, unknown> | null,
): ProductExperienceRealizationShadowMapping {
  const sourceExperience = text(questionnaire?.experience);
  const coarseExperience = sourceExperience === "Beginner" ? "beginner" as const :
    sourceExperience === "Intermediate" ? "intermediate" as const :
      sourceExperience === "Advanced" ? "advanced" as const : null;
  return Object.freeze({ reference: PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING_REFERENCE,
    sourceExperience, coarseExperience, trainingYears: null, recentConsistency: null,
    exactExerciseFamiliarity: null, exactLoadAuthority: false,
    status: coarseExperience ? "coarse_experience_only" : "mapping_required",
    explicitUnknowns: Object.freeze(["training_years", "recent_consistency",
      "exact_exercise_familiarity", "exact_realization_familiarity", "exact_load_authority"]) });
}

function programExerciseIds(programs: readonly Program[]): readonly string[] {
  return programs.flatMap((program) => program.week.flatMap((day) =>
    day.routine.map((item) => item.exerciseId)));
}

export function projectProductLegacyHistoryAuthority(input: {
  readonly programs: readonly Program[];
  readonly sessions: readonly SessionRecord[];
  readonly exerciseLogs: readonly ExerciseLog[];
  readonly activeProgramId: string | null;
}): ProductLegacyHistoryAuthorityProjection {
  const canonical = new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id));
  const identities = [...new Set([
    ...programExerciseIds(input.programs),
    ...input.exerciseLogs.map((log) => log.exerciseId),
  ])].sort();
  const exact = identities.filter((identity) => canonical.has(identity));
  const unresolved = identities.filter((identity) => !canonical.has(identity));
  return Object.freeze({ reference: PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION_REFERENCE,
    activeLegacyProgramId: input.activeProgramId, programCount: input.programs.length,
    sessionRecordCount: input.sessions.length, exerciseLogCount: input.exerciseLogs.length,
    canonicalIdentityExposureIds: Object.freeze(exact), unresolvedIdentityIds: Object.freeze(unresolved),
    authority: "restricted_identity_and_continuity_context_only",
    continuityContext: input.activeProgramId ? "LEGACY_DELIVERED_PROGRAM_CONTINUITY_CONTEXT" : "none",
    athleteAuthoredProgrammingCount: 0, exactRealizationFamiliarityCount: 0,
    completedV2PerformanceCount: 0, progressionAuthorityCount: 0,
    missingLineage: Object.freeze(["final_v2_prescription_revision", "final_v2_sequence_revision",
      "v2_source_exposure_event", "v2_completed_performance"]) });
}
