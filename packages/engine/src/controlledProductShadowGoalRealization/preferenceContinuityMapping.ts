import { PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING_REFERENCE,
  type ProductPreferenceContinuityShadowMapping } from "@praxis/training-engine-v2";
import type { ExerciseLog, LogPrefs } from "../types";

export function mapProductPreferenceContinuity(input: {
  readonly preferences: LogPrefs | null;
  readonly exerciseLogs: readonly ExerciseLog[];
}): ProductPreferenceContinuityShadowMapping {
  const feedback = Object.entries(input.preferences?.feedbackByExercise ?? {});
  const easy = new Set(feedback.filter(([, value]) => value.rating === "easy").map(([id]) => id));
  const pain = new Set(feedback.filter(([, value]) => value.rating === "pain").map(([id]) => id));
  for (const log of input.exerciseLogs) {
    if (log.felt === "easy") easy.add(log.exerciseId);
    if (log.felt === "pain") pain.add(log.exerciseId);
  }
  const substitutions = Object.entries(input.preferences?.substitutionByExercise ?? {})
    .map(([sourceExerciseId, targetExerciseId]) => Object.freeze({ sourceExerciseId, targetExerciseId }))
    .sort((left, right) => left.sourceExerciseId.localeCompare(right.sourceExerciseId));
  const explicitPreferenceBlocks = Object.entries(input.preferences?.blockedExerciseIds ?? {})
    .filter(([, entry]) => entry.reason === "personal_preference").map(([id]) => id).sort();
  return Object.freeze({ reference: PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING_REFERENCE,
    strongPreferredExerciseIds: Object.freeze([]),
    explicitPreferenceBlockedExerciseIds: Object.freeze(explicitPreferenceBlocks),
    easyChallengeFeedbackExerciseIds: Object.freeze([...easy].sort()),
    painMarkedContextExerciseIds: Object.freeze([...pain].sort()), substitutions: Object.freeze(substitutions),
    permanentFeedbackBlockCount: 0, progressionAuthorityCount: 0, globalSubstitutionAuthorityCount: 0 });
}
