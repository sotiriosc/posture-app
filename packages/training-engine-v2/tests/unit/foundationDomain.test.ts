import { describe, expect, it } from "vitest";
import {
  GOLDEN_PERSONAS,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  validateExerciseCatalog,
  validateTrainingInput,
} from "../../src";

describe("foundation reference data", () => {
  it("keeps the reference catalog small, representative, and schema-valid", () => {
    expect(REFERENCE_EXERCISES.length).toBeGreaterThanOrEqual(20);
    expect(REFERENCE_EXERCISES).toHaveLength(45);

    const validationErrors = validateExerciseCatalog(REFERENCE_EXERCISES).filter(
      (finding) => finding.severity === "error",
    );
    expect(validationErrors).toEqual([]);

    const movementRoles = new Set(REFERENCE_EXERCISES.flatMap((exercise) => exercise.movementRoles));
    for (const role of [
      "horizontal_push",
      "horizontal_pull",
      "vertical_push",
      "vertical_pull",
      "squat",
      "hinge",
      "single_leg",
      "anti_extension_core",
      "anti_lateral_flexion_core",
      "trunk_flexion",
      "trunk_rotation",
      "loaded_bracing",
      "carry",
    ]) {
      expect([...movementRoles]).toContain(role);
    }

    const primaryMuscles = new Set(REFERENCE_EXERCISES.flatMap((exercise) => exercise.primaryMuscles));
    for (const muscle of [
      "chest",
      "lats",
      "quads",
      "hamstrings",
      "glutes",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "trunk",
    ]) {
      expect([...primaryMuscles]).toContain(muscle);
    }
  });

  it("defines twelve golden personas with valid inputs", () => {
    expect(GOLDEN_PERSONAS).toHaveLength(12);

    for (const persona of GOLDEN_PERSONAS) {
      const errors = validateTrainingInput(persona).filter((finding) => finding.severity === "error");
      expect(errors).toEqual([]);
      expect(persona.expectedReasoningFocus.length).toBeGreaterThan(0);
    }
  });
});
