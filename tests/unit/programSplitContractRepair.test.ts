import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
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

const expectDayLacksMainPatterns = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  dayTitle: string;
  forbiddenPatterns: MainPattern[];
}) => {
  const { program, dayTitle, forbiddenPatterns } = params;
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return;
  forbiddenPatterns.forEach((pattern) => {
    expect(
      hasMainPattern(day, pattern),
      `${dayTitle} should not include main ${pattern}`
    ).toBe(false);
  });
};

const isChestDominantMain = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return false;
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
  if (!patterns.has("push")) return false;
  const tags = new Set((exercise.tags ?? []).map(normalizePattern));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("chest") ||
    muscles.has("chest") ||
    descriptor.includes("chest") ||
    descriptor.includes("bench") ||
    descriptor.includes("floor press") ||
    descriptor.includes("floor-press")
  );
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
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Back + Chest",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Shoulders + Arms",
      requiredPatterns: ["verticalPush"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Shoulders + Arms",
      forbiddenPatterns: ["squat", "hinge"],
    });
    const shouldersDay = program.week.find((entry) => entry.title === "Shoulders + Arms");
    expect(shouldersDay).toBeTruthy();
    if (shouldersDay) {
      const shoulderMainExercises = shouldersDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const hasPullMain = shoulderMainExercises.some((exercise) => {
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        return patterns.has("pull") || patterns.has("horizontalpull");
      });
      const hasArmMain = shoulderMainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("curl") ||
          patterns.has("extension") ||
          tags.has("biceps") ||
          tags.has("triceps") ||
          descriptor.includes("biceps") ||
          descriptor.includes("triceps") ||
          descriptor.includes("pressdown")
        );
      });
      expect(hasPullMain).toBe(true);
      expect(hasArmMain).toBe(true);
      const accessories = shouldersDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(accessories.length).toBeGreaterThanOrEqual(2);
      const hasTricepsAccessory = accessories.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("extension") ||
          tags.has("triceps") ||
          descriptor.includes("triceps") ||
          descriptor.includes("pressdown")
        );
      });
      const hasBicepsAccessory = accessories.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return patterns.has("curl") || tags.has("biceps") || descriptor.includes("biceps");
      });
      expect(hasTricepsAccessory).toBe(true);
      expect(hasBicepsAccessory).toBe(true);
    }
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Legs + Abs",
      requiredPatterns: ["squat", "hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Legs + Abs",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
  });

  test("3-day Shoulders + Arms keeps shoulders/pull emphasis and rep-based prescriptions", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["dumbbells", "bands", "machines"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(input, "split-3-day-shoulders-safety", {
      phaseIndex: 2,
      seed: "split-3-day-shoulders-safety",
    });

    const shoulderDay = program.week.find((day) => day.title === "Shoulders + Arms");
    expect(shoulderDay).toBeTruthy();
    if (!shoulderDay) return;

    const mainItems = shoulderDay.routine.filter((item) => item.section === "main");
    expect(mainItems.length).toBeGreaterThan(0);
    expect(mainItems.some((item) => isChestDominantMain(item.exerciseId))).toBe(false);

    const hasShoulderPressMain = mainItems.some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const tags = new Set((exercise.tags ?? []).map(normalizePattern));
      return descriptor.includes("press") && tags.has("shoulders");
    });
    expect(hasShoulderPressMain).toBe(true);
    const hasPullMain = mainItems.some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
      return patterns.has("pull") || patterns.has("horizontalpull");
    });
    expect(hasPullMain).toBe(true);
    const hasCalvesOnShoulderDay = shoulderDay.routine.some((item) => {
      if (item.section !== "accessory") return false;
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
      const tags = new Set((exercise.tags ?? []).map(normalizePattern));
      const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
      return patterns.has("calf") || tags.has("calves") || muscles.has("calves");
    });
    expect(hasCalvesOnShoulderDay).toBe(false);

    shoulderDay.routine.forEach((item) => {
      if (item.section !== "main" && item.section !== "accessory") return;
      expect(item.reps).toBeTruthy();
      expect(item.durationSec ?? null).toBeNull();
    });
  });

  test("vertical pressing progression avoids chest-dominant push and advances to dumbbells in growth", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const skillProgram = generateWeeklyProgram(input, "split-3-day-vertical-progress-skill", {
      phaseIndex: 2,
      seed: "split-3-day-vertical-progress",
    });
    const growthProgram = generateWeeklyProgram(input, "split-3-day-vertical-progress-growth", {
      phaseIndex: 3,
      seed: "split-3-day-vertical-progress",
    });

    const skillShoulderDay = skillProgram.week.find((day) => day.title === "Shoulders + Arms");
    const growthShoulderDay = growthProgram.week.find((day) => day.title === "Shoulders + Arms");
    expect(skillShoulderDay).toBeTruthy();
    expect(growthShoulderDay).toBeTruthy();
    if (!skillShoulderDay || !growthShoulderDay) return;

    const skillMainIds = skillShoulderDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const growthMainIds = growthShoulderDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);

    expect(
      skillMainIds.some((id) =>
        ["machine-shoulder-press", "band-overhead-press", "pike-pushup", "dumbbell-shoulder-press"].includes(id)
      )
    ).toBe(true);
    expect(
      skillMainIds.some((id) => isChestDominantMain(id)),
      `skill mains=${JSON.stringify(skillMainIds)}`
    ).toBe(false);
    expect(
      growthMainIds.some(
        (id) => id === "dumbbell-shoulder-press" || id === "dumbbell-arnold-press"
      )
    ).toBe(true);
    expect(
      growthMainIds.some((id) => isChestDominantMain(id)),
      `growth mains=${JSON.stringify(growthMainIds)}`
    ).toBe(false);
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
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Push + Scapular Control",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Squat Emphasis) + Core",
      requiredPatterns: ["squat"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower (Squat Emphasis) + Core",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull + Thoracic Posture",
      requiredPatterns: ["pull"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Pull + Thoracic Posture",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
      requiredPatterns: ["hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
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
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Push",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Squat",
      requiredPatterns: ["squat"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower Squat",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull",
      requiredPatterns: ["pull"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Pull",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Hinge + Posterior Chain",
      requiredPatterns: ["hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower Hinge + Posterior Chain",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Arms + Posture + Conditioning",
      requiredPatterns: ["pull", "verticalPush"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Arms + Posture + Conditioning",
      forbiddenPatterns: ["squat", "hinge"],
    });
  });
});
