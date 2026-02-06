import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const patternsNeeded = ["squat", "hinge", "push", "pull", "core", "mobility"];

const hasPatterns = (exerciseIds: string[]) => {
  const patterns = new Set<string>();
  exerciseIds.forEach((id) => {
    const exercise = exerciseById(id);
    exercise?.movementPattern.forEach((pattern) => patterns.add(pattern));
  });
  return patternsNeeded.every((pattern) => patterns.has(pattern));
};

const baseData: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("program generation slot coverage", () => {
  test("none equipment still fills required patterns", () => {
    const program = generateWeeklyProgram(baseData, "test-program");
    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(hasPatterns(ids)).toBe(true);
    });
  });

  test("bands equipment still fills required patterns", () => {
    const program = generateWeeklyProgram(
      { ...baseData, equipment: ["bands"] },
      "test-program"
    );
    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(hasPatterns(ids)).toBe(true);
    });
  });
});
