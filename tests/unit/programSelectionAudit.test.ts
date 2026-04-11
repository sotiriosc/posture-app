import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const normalizeToken = (value: string) => value.toLowerCase().replace(/[\s-]+/g, "_");

const hasAnyToken = (values: string[] | undefined, tokens: string[]) => {
  const normalized = new Set((values ?? []).map(normalizeToken));
  return tokens.some((token) => normalized.has(normalizeToken(token)));
};

const movementTokens = (exerciseId: string) =>
  exerciseById(exerciseId)?.movementPattern.map(normalizeToken) ?? [];

const isUpperMainPattern = (exerciseId: string) => {
  const patterns = new Set(movementTokens(exerciseId));
  return patterns.has("push") || patterns.has("pull") || patterns.has("verticalpush");
};

const isLowerMainPattern = (exerciseId: string) => {
  const patterns = new Set(movementTokens(exerciseId));
  return patterns.has("squat") || patterns.has("hinge");
};

const weekSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week
    .map((day) =>
      day.routine
        .map((item) =>
          [
            item.section,
            item.exerciseId,
            item.selectionDebug?.source ?? "none",
            item.selectionDebug?.slotLane ?? "none",
          ].join(":")
        )
        .join(",")
    )
    .join("|");

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 3,
};

describe("program selection audit metadata", () => {
  test("attaches main and accessory selection debug metadata to generated week items", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-audit", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-audit-seed",
    });

    const auditedItems = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main" || item.section === "accessory")
    );

    expect(auditedItems.length).toBeGreaterThan(0);
    expect(auditedItems.every((item) => item.selectionDebug?.source)).toBe(true);
  });

  test("keeps obvious main fallback drift out of upper and lower day structures", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-family-fallback", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-family-fallback-seed",
    });

    const upperDays = program.week.filter((day) => !/legs|abs|lower/i.test(day.title));
    const lowerDays = program.week.filter((day) => /legs|abs|lower/i.test(day.title));

    upperDays.forEach((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(mainIds.every((exerciseId) => !isLowerMainPattern(exerciseId))).toBe(true);
    });

    lowerDays.forEach((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(mainIds.every((exerciseId) => !isUpperMainPattern(exerciseId))).toBe(true);
    });
  });

  test("uses arm-specific accessory pools on the Shoulders + Arms day", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-accessory-pools", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-accessory-pools-seed",
    });

    const shouldersDay = program.week.find((day) => day.title === "Shoulders + Arms");
    expect(shouldersDay).toBeTruthy();
    if (!shouldersDay) return;

    const armAccessories = shouldersDay.routine.filter(
      (item) =>
        item.section === "accessory" &&
        (item.selectionDebug?.slotLane === "push" ||
          item.selectionDebug?.slotLane === "pull")
    );

    expect(armAccessories.length).toBeGreaterThan(0);
    armAccessories.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise).toBeTruthy();
      if (!exercise) return;
      if (item.selectionDebug?.slotLane === "push") {
        expect(hasAnyToken(exercise.tags, ["triceps"])).toBe(true);
      }
      if (item.selectionDebug?.slotLane === "pull") {
        expect(hasAnyToken(exercise.tags, ["biceps"])).toBe(true);
      }
    });
  });

  test("preserves deterministic same-seed output with selection debug metadata", () => {
    const run = () =>
      generateWeeklyProgram(questionnaire, "selection-deterministic", {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-deterministic-seed",
      });

    expect(weekSignature(run())).toBe(weekSignature(run()));
  });
});
