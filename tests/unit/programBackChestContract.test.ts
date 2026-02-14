import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const hasMainPattern = (exercise: Exercise, pattern: "push" | "pull") =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern);

describe("back + chest contract regression", () => {
  test("pain beginner growth 3-day bands keeps main push and pull", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const program = generateWeeklyProgram(questionnaire, "regression-back-chest-band-only", {
      phaseIndex: 3,
      seed: "regression-back-chest-band-only",
    });

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    const pushMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "push"));
    const pullMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "pull"));

    expect(pushMains.length).toBeGreaterThanOrEqual(1);
    expect(pullMains.length).toBeGreaterThanOrEqual(1);
    expect(
      pushMains.some((exercise) =>
        ["band-chest-press", "pushup", "incline-pushup"].includes(exercise.id)
      )
    ).toBe(true);
  });
});
