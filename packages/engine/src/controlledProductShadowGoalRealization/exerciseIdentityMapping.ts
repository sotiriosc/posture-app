import { REFERENCE_EXERCISES, type ProductExerciseIdentityShadowMapping } from "@praxis/training-engine-v2";
import type { ExerciseLog, LogPrefs, Program } from "../types";
import { PRODUCT_SHADOW_EXERCISE_IDENTITY_REGISTRY_V2_REFERENCE,
  type ProductGoalRealizationFixtureExtensions } from "./contracts";

export function mapProductExerciseIdentities(input: {
  readonly programs: readonly Program[];
  readonly exerciseLogs: readonly ExerciseLog[];
  readonly preferences: LogPrefs | null;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}): ProductExerciseIdentityShadowMapping {
  const ids = [...new Set([
    ...input.programs.flatMap((program) => program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId))),
    ...input.exerciseLogs.map((log) => log.exerciseId),
    ...Object.keys(input.preferences?.feedbackByExercise ?? {}),
    ...Object.keys(input.preferences?.substitutionByExercise ?? {}),
    ...Object.values(input.preferences?.substitutionByExercise ?? {}),
  ])].sort();
  const canonical = new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id));
  const reviewedAliases = new Map((input.fixtureExtensions?.reviewedExerciseAliases ?? [])
    .map((entry) => [entry.productExerciseId, entry.v2ExerciseId] as const));
  const entries = ids.map((productExerciseId) => {
    const alias = reviewedAliases.get(productExerciseId);
    if (canonical.has(productExerciseId)) return Object.freeze({ productExerciseId,
      v2ExerciseId: productExerciseId, classification: "exact_same_canonical_id" as const });
    if (alias && canonical.has(alias)) return Object.freeze({ productExerciseId,
      v2ExerciseId: alias, classification: "explicit_reviewed_alias" as const });
    return Object.freeze({ productExerciseId, v2ExerciseId: null,
      classification: "legacy_only_no_v2_identity" as const });
  });
  return Object.freeze({ registryReference: PRODUCT_SHADOW_EXERCISE_IDENTITY_REGISTRY_V2_REFERENCE,
    entries: Object.freeze(entries), fuzzyMatchCount: 0 });
}
