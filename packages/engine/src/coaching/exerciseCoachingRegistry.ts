/**
 * Canonical keyed coaching registry for release-critical exercises.
 */

import { allExercises, exerciseById } from "@/lib/exercises";
import type { ExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingContract";
import { EXERCISE_COACHING_OVERRIDES } from "@/lib/coaching/exerciseCoachingOverrides";
import {
  mergeCoachingContent,
  synthesizeExerciseCoaching,
} from "@/lib/coaching/synthesizeExerciseCoaching";

const registryCache = new Map<string, ExerciseCoachingContent>();

export const getExerciseCoachingContent = (
  exerciseId: string
): ExerciseCoachingContent | null => {
  if (registryCache.has(exerciseId)) {
    return registryCache.get(exerciseId) ?? null;
  }
  const exercise = exerciseById(exerciseId);
  if (!exercise) {
    return null;
  }
  const synthesized = synthesizeExerciseCoaching(exercise);
  const override = EXERCISE_COACHING_OVERRIDES[exerciseId];
  const content = override
    ? mergeCoachingContent(synthesized, override)
    : synthesized;
  registryCache.set(exerciseId, content);
  return content;
};

export const requireExerciseCoachingContent = (
  exerciseId: string
): ExerciseCoachingContent => {
  const content = getExerciseCoachingContent(exerciseId);
  if (!content) {
    throw new Error(`Missing coaching content for exercise ${exerciseId}`);
  }
  return content;
};

export const listRegisteredCoachingExerciseIds = (): string[] =>
  allExercises
    .filter((exercise) => !exercise.deprecated)
    .map((exercise) => exercise.id)
    .filter((id) => getExerciseCoachingContent(id) !== null);

export const clearExerciseCoachingRegistryCache = () => {
  registryCache.clear();
};
