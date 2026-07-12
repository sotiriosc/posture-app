import { exerciseById, exercises, type Exercise } from "@/lib/exercises";

export type CatalogValidationReport = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const MAIN_PATTERNS = new Set([
  "horizontal_pull",
  "vertical_pull",
  "horizontal_push",
  "vertical_push",
  "knee_dominant",
  "hinge",
  "core_stability",
]);

// Recognized isolation/accessory families: valid patterns but ladder-exempt
// (they progress by load/reps in place, not via progressionOf chains).
const ISOLATION_PATTERNS = new Set([
  "calves",
  "carry_load",
  "lateral_raise",
  "elbow_flexion",
  "elbow_extension",
]);

export const getExerciseById = (id?: string) => exerciseById(id);

export const requireExerciseById = (id?: string) => {
  const exercise = exerciseById(id);
  if (!exercise) {
    throw new Error(`[exerciseCatalog] Unknown exercise id: ${id ?? "(empty)"}`);
  }
  return exercise;
};

const toNormalized = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const validateMainMetadata = (
  exercise: Exercise,
  errors: string[],
  warnings: string[]
) => {
  if (exercise.category !== "main") return;

  if (!exercise.pattern) {
    errors.push(`${exercise.id}: missing pattern`);
  } else if (
    !MAIN_PATTERNS.has(exercise.pattern) &&
    !ISOLATION_PATTERNS.has(exercise.pattern)
  ) {
    errors.push(`${exercise.id}: invalid pattern "${exercise.pattern}"`);
  }

  if (!exercise.difficulty) {
    errors.push(`${exercise.id}: missing difficulty`);
  }
  if (!exercise.painContraindications?.length) {
    errors.push(`${exercise.id}: missing painContraindications`);
  }
  if (!exercise.difficultyTier) {
    warnings.push(`${exercise.id}: missing difficultyTier`);
  }
  if (!exercise.movementIntensity) {
    warnings.push(`${exercise.id}: missing movementIntensity`);
  }
};

export const validateExerciseCatalog = (): CatalogValidationReport => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const seenIds = new Set<string>();
  const seenNames = new Map<string, string>();
  const allIds = new Set(exercises.map((exercise) => exercise.id));

  exercises.forEach((exercise) => {
    if (!exercise.id.trim()) {
      errors.push("Encountered exercise with empty id");
      return;
    }

    if (seenIds.has(exercise.id)) {
      errors.push(`Duplicate id: ${exercise.id}`);
    } else {
      seenIds.add(exercise.id);
    }

    const normalizedName = toNormalized(exercise.name);
    const existingNameOwner = seenNames.get(normalizedName);
    if (existingNameOwner && existingNameOwner !== exercise.id) {
      warnings.push(
        `Potential duplicate name: "${exercise.name}" (${existingNameOwner}, ${exercise.id})`
      );
    } else {
      seenNames.set(normalizedName, exercise.id);
    }

    if (!exercise.equipment.length) {
      errors.push(`${exercise.id}: equipment cannot be empty`);
    }
    if (!exercise.movementPattern.length) {
      errors.push(`${exercise.id}: movementPattern cannot be empty`);
    }
    if (!exercise.muscleGroups.length) {
      errors.push(`${exercise.id}: muscleGroups cannot be empty`);
    }
    if (!exercise.tags.length) {
      warnings.push(`${exercise.id}: tags is empty`);
    }

    if (exercise.progressionOf && !allIds.has(exercise.progressionOf)) {
      errors.push(
        `${exercise.id}: progressionOf references unknown id "${exercise.progressionOf}"`
      );
    }
    if (exercise.regressionOf && !allIds.has(exercise.regressionOf)) {
      errors.push(
        `${exercise.id}: regressionOf references unknown id "${exercise.regressionOf}"`
      );
    }

    if (exercise.swapOptions?.length) {
      exercise.swapOptions.forEach((swapId) => {
        if (!allIds.has(swapId)) {
          warnings.push(`${exercise.id}: swap option references unknown id "${swapId}"`);
        }
        if (swapId === exercise.id) {
          warnings.push(`${exercise.id}: swap option references itself`);
        }
      });
    }

    validateMainMetadata(exercise, errors, warnings);
  });

  const patternCounts = exercises
    .filter((exercise) => exercise.category === "main")
    .reduce<Record<string, number>>((acc, exercise) => {
      if (!exercise.pattern) return acc;
      acc[exercise.pattern] = (acc[exercise.pattern] ?? 0) + 1;
      return acc;
    }, {});

  MAIN_PATTERNS.forEach((pattern) => {
    if (!patternCounts[pattern]) {
      errors.push(`Missing main pattern coverage for "${pattern}"`);
    }
  });

  return { ok: errors.length === 0, errors, warnings };
};

