import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const baseQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

const backChestMains = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  expect(day).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const requiresBenchSurface = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    exercise.equipment.includes("bench") ||
    descriptor.includes("bench press") ||
    descriptor.includes("bench-press") ||
    descriptor.includes("incline press") ||
    descriptor.includes("incline-press") ||
    descriptor.includes("chest-supported") ||
    descriptor.includes("chest supported")
  );
};

describe("program environment eligibility", () => {
  test("home dumbbells avoid bench-surface mains and use floor press", () => {
    const program = generateWeeklyProgram(baseQuestionnaire, "env-home-db", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "env-home-db",
    });

    const mains = backChestMains(program);
    const mainIds = mains.map((exercise) => exercise.id);

    expect(mainIds).toContain("dumbbell-floor-press");
    expect(mainIds).not.toContain("dumbbell-bench-press");
    expect(mains.some(requiresBenchSurface)).toBe(false);
  });

  test("bench and gym contexts keep bench-supported pressing eligible", () => {
    const withBench = generateWeeklyProgram(
      { ...baseQuestionnaire, equipment: ["dumbbells", "bench"] },
      "env-home-db-bench",
      {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "env-home-db-bench",
      }
    );
    const gym = generateWeeklyProgram(
      { ...baseQuestionnaire, equipment: ["gym"] },
      "env-gym",
      {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "env-gym",
      }
    );

    expect(backChestMains(withBench).map((exercise) => exercise.id)).toContain(
      "dumbbell-bench-press"
    );
    expect(backChestMains(gym).map((exercise) => exercise.id)).toContain(
      "dumbbell-bench-press"
    );
  });

  test("environment filtering preserves basic generator invariants", () => {
    const program = generateWeeklyProgram(baseQuestionnaire, "env-invariants", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "env-invariants",
    });

    expect(program.daysPerWeek).toBe(3);
    expect(program.week).toHaveLength(3);
    program.week.forEach((day) => {
      const sections = new Set(day.routine.map((item) => item.section));
      const ids = day.routine.map((item) => item.exerciseId);
      expect(sections.has("warmup")).toBe(true);
      expect(sections.has("activation")).toBe(true);
      expect(sections.has("main")).toBe(true);
      expect(sections.has("accessory")).toBe(true);
      expect(sections.has("cooldown")).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
