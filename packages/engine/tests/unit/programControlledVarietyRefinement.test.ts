import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { clearProgramVariationHistory, generateWeeklyProgram } from "@/lib/program";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const buildQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 3,
  ...overrides,
});

const getDayExercises = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: string,
  section: "main" | "accessory"
) => {
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return [];
  return day.routine
    .filter((item) => item.section === section)
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const isChestIsolationExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeToken(exercise.familyKey ?? exercise.id);
  const rearDeltFly =
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck");
  return (
    !rearDeltFly &&
    (family === "chestfly" ||
      descriptor.includes("fly") ||
      descriptor.includes("pec deck") ||
      descriptor.includes("pec-deck"))
  );
};

const isUprightRowExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("upright row") || descriptor.includes("upright-row");
};

const isCalfExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("calf");
};

describe("controlled variety refinement", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("beginner gym Back + Chest accessories rotate support families and can add chest isolation", () => {
    const supportAccessoryIds = new Set<string>();
    let sawChestIsolationAccessory = false;

    Array.from({ length: 8 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          goals: "Build strength",
          experience: "Beginner",
          equipment: ["gym"],
        }),
        `back-chest-accessory-variety-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "back-chest-accessory-variety",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const accessories = getDayExercises(program, "Back + Chest", "accessory");
      const supportAccessory = accessories.find((exercise) => !isChestIsolationExercise(exercise));
      if (supportAccessory) supportAccessoryIds.add(supportAccessory.id);
      if (accessories.some(isChestIsolationExercise)) {
        sawChestIsolationAccessory = true;
      }
    });

    expect(supportAccessoryIds.size).toBeGreaterThan(1);
    expect(sawChestIsolationAccessory).toBe(true);
  });

  test("intermediate gym shoulder day can rotate into upright-row family only in safe profiles", () => {
    let sawSafeUprightRow = false;

    Array.from({ length: 10 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          goals: "General fitness",
          experience: "Intermediate",
          equipment: ["gym"],
        }),
        `shoulder-safe-variety-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "shoulder-safe-variety",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const mains = getDayExercises(program, "Shoulders + Arms", "main");
      if (mains.some(isUprightRowExercise)) {
        sawSafeUprightRow = true;
      }
    });

    const painAwareProgram = generateWeeklyProgram(
      buildQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Neck"],
        experience: "Intermediate",
        equipment: ["gym"],
      }),
      "shoulder-pain-upright-row-guard",
      {
        phaseIndex: 2,
        seed: "shoulder-pain-upright-row-guard",
      }
    );
    const painAwareMains = getDayExercises(painAwareProgram, "Shoulders + Arms", "main");

    expect(sawSafeUprightRow).toBe(true);
    expect(painAwareMains.some(isUprightRowExercise)).toBe(false);
  });

  test("gym unilateral-lower selection is not locked to step-up family when alternatives exist", () => {
    const unilateralIds = new Set<string>();

    Array.from({ length: 12 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          goals: "General fitness",
          experience: "Intermediate",
          equipment: ["gym"],
        }),
        `legs-unilateral-variety-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "legs-unilateral-variety",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const mains = getDayExercises(program, "Legs + Abs", "main");
      const unilateral = mains.find((exercise) =>
        (exercise.slotRoles ?? []).includes("unilateralLowerLoaded")
      );
      if (unilateral) unilateralIds.add(unilateral.id);
    });

    expect(unilateralIds.size).toBeGreaterThan(1);
    expect(Array.from(unilateralIds).some((id) => !id.includes("step-up"))).toBe(true);
  });

  test("dumbbell home/core planning rotates beyond side-plank family when truthful alternatives exist", () => {
    const coreAccessoryIds = new Set<string>();

    Array.from({ length: 8 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          goals: "General fitness",
          experience: "Intermediate",
          equipment: ["dumbbells"],
        }),
        `core-variety-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "core-variety",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const accessories = getDayExercises(program, "Legs + Abs", "accessory");
      const coreAccessory = accessories.find((exercise) => !isCalfExercise(exercise));
      if (coreAccessory) coreAccessoryIds.add(coreAccessory.id);
    });

    expect(coreAccessoryIds.size).toBeGreaterThan(1);
    expect(
      Array.from(coreAccessoryIds).some(
        (id) => !id.includes("side-plank") && !id.includes("side-plank-star")
      )
    ).toBe(true);
  });

  test("band-only Back + Chest can select a true fly-style chest slot without rear-delt leakage", () => {
    const mains = getDayExercises(
      generateWeeklyProgram(
        buildQuestionnaire({
          goals: "Build strength",
          experience: "Intermediate",
          equipment: ["bands"],
        }),
        "bands-chest-isolation-path",
        {
          phaseIndex: 2,
          seed: "bands-chest-isolation-path",
        }
      ),
      "Back + Chest",
      "main"
    );

    expect(mains.some((exercise) => exercise.id === "band-chest-fly")).toBe(true);
    expect(exerciseById("band-rear-delt-fly")?.accessoryRoles ?? []).not.toContain(
      "accessoryChestIsolation"
    );
  });
});
