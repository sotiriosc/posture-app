import { describe, expect, test } from "vitest";
import { exercises } from "@/lib/exercises";
import {
  isExerciseEligible,
  normalizeEquipmentSelection,
  type Equipment,
} from "@/lib/equipment";

describe("equipment filtering", () => {
  test("no equipment selects only none exercises", () => {
    const { available } = normalizeEquipmentSelection(["none"]);
    const eligible = exercises.filter((exercise) =>
      isExerciseEligible(exercise, available)
    );
    expect(eligible.length).toBeGreaterThan(0);
    eligible.forEach((exercise) => {
      expect(
        exercise.equipment.every((item) => available.has(item as Equipment)) ||
          exercise.equipment.includes("none")
      ).toBe(true);
    });
  });

  test("bands equipment includes band exercises", () => {
    const { available } = normalizeEquipmentSelection(["bands"]);
    const eligible = exercises.filter((exercise) =>
      isExerciseEligible(exercise, available)
    );
    expect(
      eligible.some((exercise) => exercise.equipment.includes("bands"))
    ).toBe(true);
  });
});
