import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

type MainPattern = "push" | "verticalPush" | "pull" | "squat" | "hinge";

const normalizePattern = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const hasMainPattern = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number],
  required: MainPattern
) => {
  const requiredToken = normalizePattern(required);
  return day.routine
    .filter((item) => item.section === "main")
    .some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patternMatch = exercise.movementPattern.some(
        (pattern) => normalizePattern(pattern) === requiredToken
      );
      if (patternMatch) return true;
      if (required !== "verticalPush") return false;
      const tagTokens = new Set((exercise.tags ?? []).map(normalizePattern));
      const muscleTokens = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
      const shouldersTagMatch = tagTokens.has("shoulders") || tagTokens.has("vertical");
      const shouldersMuscleMatch = muscleTokens.has("shoulders");
      return shouldersTagMatch && shouldersMuscleMatch;
    });
};

const expectDayHasRequiredMainPatterns = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  dayTitle: string;
  requiredPatterns: MainPattern[];
}) => {
  const { program, dayTitle, requiredPatterns } = params;
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return;
  requiredPatterns.forEach((pattern) => {
    expect(
      hasMainPattern(day, pattern),
      `${dayTitle} missing required main ${pattern}`
    ).toBe(true);
  });
};

describe("split contract repair enforcement", () => {
  test("3-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(input, "split-3-day-repair", {
      phaseIndex: 3,
      seed: "split-3-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Back + Chest",
      requiredPatterns: ["pull", "push"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Shoulders + Arms",
      requiredPatterns: ["verticalPush", "pull"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Legs + Abs",
      requiredPatterns: ["squat", "hinge"],
    });
  });

  test("4-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: ["Hips"],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 4,
    };
    const program = generateWeeklyProgram(input, "split-4-day-repair", {
      phaseIndex: 2,
      seed: "split-4-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Push + Scapular Control",
      requiredPatterns: ["push"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Squat Emphasis) + Core",
      requiredPatterns: ["squat"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull + Thoracic Posture",
      requiredPatterns: ["pull"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
      requiredPatterns: ["hinge"],
    });
  });

  test("5-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells", "bands", "bench"],
      daysPerWeek: 5,
    };
    const program = generateWeeklyProgram(input, "split-5-day-repair", {
      phaseIndex: 3,
      seed: "split-5-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Push",
      requiredPatterns: ["push"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Squat",
      requiredPatterns: ["squat"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull",
      requiredPatterns: ["pull"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Hinge + Posterior Chain",
      requiredPatterns: ["hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Arms + Posture + Conditioning",
      requiredPatterns: ["pull", "verticalPush"],
    });
  });
});
