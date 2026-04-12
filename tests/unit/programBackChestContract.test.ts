import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { generateNextPhaseProgram, generateWeeklyProgram } from "@/lib/program";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const hasHorizontalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("push") && !patterns.has("verticalpush");
};

const isFlyMain = (exercise: Exercise) => {
  const family = normalizeToken(exercise.familyKey ?? "");
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    family === "chestfly" ||
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck")
  );
};

const isPressMain = (exercise: Exercise) =>
  hasHorizontalPushMain(exercise) && !isFlyMain(exercise);

const isHorizontalPullMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return patterns.has("horizontalpull") || descriptor.includes("row");
};

const isVerticalPullMain = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "verticalpull");

const isBackMain = (exercise: Exercise) =>
  isHorizontalPullMain(exercise) ||
  isVerticalPullMain(exercise) ||
  `${exercise.id} ${exercise.name}`.toLowerCase().includes("pullover");

const isPulloverLatAccentMain = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name}`.toLowerCase().includes("pullover");

const isBackFocusedAccessory = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull") ||
    patterns.has("externalrotation") ||
    tags.has("back") ||
    tags.has("lats") ||
    tags.has("scap") ||
    tags.has("scapular") ||
    tags.has("reardelt") ||
    tags.has("externalrotation") ||
    muscles.has("upperback") ||
    muscles.has("lats") ||
    muscles.has("reardelts") ||
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("lat") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("y raise")
  );
};

const accessoryFamilyKey = (exercise: Exercise) =>
  normalizeToken(exercise.familyKey?.trim() ? exercise.familyKey : exercise.id);

const getBackChestDay = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  expect(day).toBeTruthy();
  if (!day) {
    throw new Error("Missing Back + Chest day.");
  }
  return day;
};

const getMainExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getBackChestDay(program).routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const getAccessoryExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getBackChestDay(program).routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const buildQuestionnaire = (
  experience: QuestionnaireData["experience"],
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "Improve posture",
  painAreas: [],
  experience,
  daysPerWeek: 3,
  equipment: ["gym"],
  ...overrides,
});

const advanceToNextPhase = (params: {
  currentProgram: ReturnType<typeof generateWeeklyProgram>;
  questionnaire: QuestionnaireData;
  nextProgramId: string;
  seed: string;
}) => {
  const next = generateNextPhaseProgram({
    currentProgram: params.currentProgram,
    questionnaire: params.questionnaire,
    painFlag: false,
    complianceRate: 0.95,
    fatigueFlag: false,
    completedSessionsCount: 6,
    completedWeeksCount: 2,
    nextProgramId: params.nextProgramId,
    seed: params.seed,
  });
  expect(next.status).toBe("advanced");
  if (next.status !== "advanced") {
    throw new Error(`Expected advanced status for ${params.nextProgramId}.`);
  }
  return next.program;
};

describe("back + chest 3-day final contract", () => {
  test("beginner day 1 has 3 mains: press + row + vertical pull", () => {
    const questionnaire = buildQuestionnaire("Beginner");
    const program = generateWeeklyProgram(questionnaire, "back-chest-beginner-day1-final", {
      phaseIndex: 2,
      seed: "back-chest-beginner-day1-final",
    });
    const mains = getMainExercises(program);

    expect(mains.length).toBe(3);
    expect(mains.filter(isPressMain).length).toBe(1);
    expect(mains.filter(isFlyMain).length).toBe(0);
    expect(mains.filter(isHorizontalPullMain).length).toBeGreaterThanOrEqual(1);
    expect(mains.filter(isVerticalPullMain).length).toBeGreaterThanOrEqual(1);
    expect(mains.filter(isBackMain).length).toBe(2);
    expect(new Set(mains.map((entry) => entry.id)).size).toBe(mains.length);
  });

  test("intermediate day 1 has 4 mains: press + fly + row + vertical", () => {
    const questionnaire = buildQuestionnaire("Intermediate");
    const program = generateWeeklyProgram(questionnaire, "back-chest-intermediate-day1-final", {
      phaseIndex: 2,
      seed: "back-chest-intermediate-day1-final",
    });
    const mains = getMainExercises(program);

    expect(mains.length).toBe(4);
    expect(mains.filter(isPressMain).length).toBe(1);
    expect(mains.filter(isFlyMain).length).toBe(1);
    expect(mains.filter(isHorizontalPullMain).length).toBeGreaterThanOrEqual(1);
    expect(mains.filter(isVerticalPullMain).length).toBeGreaterThanOrEqual(1);
    expect(new Set(mains.map((entry) => entry.id)).size).toBe(mains.length);
  });

  test("mixed equipment keeps chest slot 2 as fly when any fly is eligible", () => {
    const cases: QuestionnaireData["equipment"][] = [
      ["gym", "bands"],
      ["gym", "bands", "none"],
      ["gym", "dumbbells"],
      ["bands", "dumbbells", "bench"],
    ];

    cases.forEach((equipment, index) => {
      const questionnaire = buildQuestionnaire("Intermediate", { equipment });
      const seed = `back-chest-mixed-fly-slot-enforcement-${index + 1}`;
      const program = generateWeeklyProgram(questionnaire, seed, {
        phaseIndex: 2,
        seed,
      });
      const mains = getMainExercises(program);
      const chestMains = mains.filter((exercise) => hasHorizontalPushMain(exercise));
      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      const hasEligibleFly = exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => isFlyMain(exercise) && hasHorizontalPushMain(exercise))
        .some((exercise) => isExerciseEligible(exercise, available));

      expect(chestMains.length).toBe(2);
      if (hasEligibleFly) {
        expect(isFlyMain(chestMains[1]!)).toBe(true);
        expect(chestMains.filter((exercise) => isPressMain(exercise)).length).toBe(1);
      }
    });
  });

  test("mixed bands + dumbbells + bench never leaks press+press when fly is eligible", () => {
    const questionnaire = buildQuestionnaire("Intermediate", {
      goals: "General fitness",
      equipment: ["bands", "dumbbells", "bench"],
    });

    Array.from({ length: 10 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        questionnaire,
        `back-chest-bands-db-bench-fly-enforcement-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "back-chest-bands-db-bench-fly-enforcement",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const mains = getMainExercises(program);
      const chestMains = mains.filter((exercise) => hasHorizontalPushMain(exercise));
      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      const hasEligibleFly = exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => isFlyMain(exercise) && hasHorizontalPushMain(exercise))
        .some((exercise) => isExerciseEligible(exercise, available));

      expect(chestMains.length).toBe(2);
      expect(hasEligibleFly).toBe(true);
      expect(isFlyMain(chestMains[1]!)).toBe(true);
      expect(chestMains.filter((exercise) => isPressMain(exercise)).length).toBe(1);
    });
  });

  test("advanced day 1 has 5 mains with exactly 2 chest and 3 back", () => {
    const questionnaire = buildQuestionnaire("Advanced");
    const program = generateWeeklyProgram(questionnaire, "back-chest-advanced-day1-final", {
      phaseIndex: 2,
      seed: "back-chest-advanced-day1-final",
    });
    const mains = getMainExercises(program);

    const pressCount = mains.filter(isPressMain).length;
    const flyCount = mains.filter(isFlyMain).length;
    const rowCount = mains.filter(isHorizontalPullMain).length;
    const verticalCount = mains.filter(isVerticalPullMain).length;
    const backCount = mains.filter(isBackMain).length;

    expect(mains.length).toBe(5);
    expect(pressCount).toBe(1);
    expect(flyCount).toBe(1);
    expect(rowCount).toBeGreaterThanOrEqual(1);
    expect(verticalCount).toBeGreaterThanOrEqual(1);
    expect(backCount).toBe(3);
    expect(rowCount).toBeLessThanOrEqual(3);
    expect(verticalCount).toBeLessThanOrEqual(2);
    expect(new Set(mains.map((entry) => entry.id)).size).toBe(mains.length);
  });

  test("advanced gym day 1 extra back slot avoids pullover/lat-accent when row or pulldown candidates exist", () => {
    const cases: Array<{
      label: string;
      equipment: QuestionnaireData["equipment"];
      phaseIndex: 2 | 3;
    }> = [
      { label: "gym", equipment: ["gym"], phaseIndex: 3 },
    ];

    cases.forEach(({ label, equipment, phaseIndex }) => {
      const questionnaire = buildQuestionnaire("Advanced", {
        goals: "General fitness",
        equipment,
      });
      const seed = `back-chest-advanced-pullover-priority-${label}`;
      const program = generateWeeklyProgram(questionnaire, seed, {
        phaseIndex,
        seed,
      });
      const mains = getMainExercises(program);
      const backMains = mains.filter((exercise) => isBackMain(exercise));
      const pulloverCount = backMains.filter((exercise) => isPulloverLatAccentMain(exercise)).length;
      const rowCount = backMains.filter((exercise) => isHorizontalPullMain(exercise)).length;
      const available = normalizeEquipmentSelection(equipment).available;
      const pulloverEligible = exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => isPulloverLatAccentMain(exercise))
        .some((exercise) => isExerciseEligible(exercise, available));

      expect(mains.length).toBe(5);
      expect(backMains.length).toBe(3);
      expect(pulloverEligible).toBe(true);
      expect(pulloverCount).toBe(0);
      expect(rowCount).toBeGreaterThanOrEqual(1);
      expect(backMains.some((exercise) => isVerticalPullMain(exercise))).toBe(true);
    });
  });

  test("day 1 accessories are exactly 2, both back-focused, no duplicate familyKey", () => {
    const cases: QuestionnaireData["experience"][] = ["Beginner", "Intermediate", "Advanced"];
    cases.forEach((experience) => {
      const questionnaire = buildQuestionnaire(experience);
      const program = generateWeeklyProgram(
        questionnaire,
        `back-chest-accessory-final-${experience.toLowerCase()}`,
        {
          phaseIndex: 2,
          seed: `back-chest-accessory-final-${experience.toLowerCase()}`,
        }
      );
      const accessories = getAccessoryExercises(program);
      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      available.add("machines");
      available.add("cables");
      available.add("pullup_bar");

      expect(accessories.length).toBe(2);
      expect(accessories.every((exercise) => isBackFocusedAccessory(exercise))).toBe(true);
      expect(
        new Set(accessories.map((exercise) => accessoryFamilyKey(exercise))).size
      ).toBe(accessories.length);
      accessories.forEach((exercise) => {
        expect(isExerciseEligible(exercise, available)).toBe(true);
      });
    });
  });

  test("intermediate gym phase progression rotates row/vertical/press/fly when alternatives exist", () => {
    const questionnaire = buildQuestionnaire("Intermediate");
    const phase1 = generateWeeklyProgram(questionnaire, "back-chest-rotation-p1", {
      phaseIndex: 1,
      seed: "back-chest-rotation-p1",
    });
    const phase2 = advanceToNextPhase({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "back-chest-rotation-p2",
      seed: "back-chest-rotation-p2",
    });
    const phase3 = advanceToNextPhase({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "back-chest-rotation-p3",
      seed: "back-chest-rotation-p3",
    });

    const phases = [phase1, phase2, phase3].map((program) => {
      const mains = getMainExercises(program);
      return {
        press: mains.find((exercise) => isPressMain(exercise))?.id ?? "missing_press",
        fly: mains.find((exercise) => isFlyMain(exercise))?.id ?? "missing_fly",
        row: mains.find((exercise) => isHorizontalPullMain(exercise))?.id ?? "missing_row",
        vertical:
          mains.find((exercise) => isVerticalPullMain(exercise))?.id ?? "missing_vertical",
      };
    });

    const hasAlternatives = (predicate: (exercise: Exercise) => boolean) =>
      exercises.filter((exercise) => exercise.category === "main").filter(predicate).length > 1;

    if (hasAlternatives(isPressMain)) {
      expect(!(phases[0].press === phases[1].press && phases[1].press === phases[2].press)).toBe(
        true
      );
    }
    if (hasAlternatives(isFlyMain)) {
      expect(!(phases[0].fly === phases[1].fly && phases[1].fly === phases[2].fly)).toBe(
        true
      );
    }
    if (hasAlternatives(isHorizontalPullMain)) {
      expect(!(phases[0].row === phases[1].row && phases[1].row === phases[2].row)).toBe(true);
    }
    if (hasAlternatives(isVerticalPullMain)) {
      expect(
        !(phases[0].vertical === phases[1].vertical && phases[1].vertical === phases[2].vertical)
      ).toBe(true);
    }
  });

  test("phase 1 intermediate/advanced gym avoids machine-locked chest press defaults", () => {
    (["Intermediate", "Advanced"] as const).forEach((experience) => {
      const questionnaire = buildQuestionnaire(experience, {
        goals: "General fitness",
        equipment: ["gym"],
      });
      const pressIds = new Set<string>();
      let sawNonMachinePress = false;

      Array.from({ length: 12 }, (_, variationIndex) => {
        const program = generateWeeklyProgram(
          questionnaire,
          `back-chest-${experience.toLowerCase()}-activation-press-variety-${variationIndex}`,
          {
            phaseIndex: 1,
            variation: {
              seed: `back-chest-${experience.toLowerCase()}-activation-press-variety`,
              variationIndex,
              useRecentMemory: false,
            },
          }
        );
        const pressMain = getMainExercises(program).find((exercise) => isPressMain(exercise));
        expect(pressMain).toBeTruthy();
        if (!pressMain) return;

        pressIds.add(pressMain.id);
        const machineOnly =
          pressMain.equipment.includes("machines") &&
          pressMain.equipment.every((equipment) => equipment === "machines");
        if (!machineOnly) {
          sawNonMachinePress = true;
        }
      });

      expect(sawNonMachinePress).toBe(true);
      expect(pressIds.size).toBeGreaterThanOrEqual(1);
    });
  });

  test("intermediate template rotation uses row+vertical variants and avoids pullover when vertical is available", () => {
    const questionnaire = buildQuestionnaire("Intermediate", {
      goals: "General fitness",
      equipment: ["gym"],
    });
    const backOrders = new Set<string>();

    Array.from({ length: 10 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        questionnaire,
        `back-chest-intermediate-template-rotation-${variationIndex}`,
        {
          phaseIndex: 2,
          variation: {
            seed: "back-chest-intermediate-template-rotation",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const mains = getMainExercises(program);
      const backMains = mains.filter(
        (exercise) =>
          isHorizontalPullMain(exercise) ||
          isVerticalPullMain(exercise) ||
          isPulloverLatAccentMain(exercise)
      );
      const backOrder = backMains
        .map((exercise) =>
          isPulloverLatAccentMain(exercise)
            ? "pullover"
            : isHorizontalPullMain(exercise)
            ? "row"
            : "vertical"
        )
        .join(">");

      expect(mains.length).toBe(4);
      expect(mains.filter(isPressMain).length).toBe(1);
      expect(mains.filter(isFlyMain).length).toBe(1);
      expect(mains.filter(isHorizontalPullMain).length).toBeGreaterThanOrEqual(1);
      expect(mains.filter(isVerticalPullMain).length).toBeGreaterThanOrEqual(1);
      expect(mains.some((exercise) => isPulloverLatAccentMain(exercise))).toBe(false);
      backOrders.add(backOrder);
    });

    expect(backOrders.has("row>vertical")).toBe(true);
    expect(backOrders.size).toBeGreaterThanOrEqual(1);
  });
});
