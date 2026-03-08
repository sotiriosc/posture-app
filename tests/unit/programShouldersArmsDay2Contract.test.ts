import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const resolveMainCategory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set((exercise.movementPattern ?? []).map((pattern) => normalizeToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  const hasPullPattern =
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull");
  const descriptorIndicatesPull =
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chinup");

  if (
    descriptor.includes("reardelt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck") ||
    tags.has("reardelt")
  ) {
    return "rearDeltMain";
  }
  if (
    (patterns.has("curl") || descriptor.includes("curl")) &&
    !hasPullPattern &&
    !descriptorIndicatesPull
  ) {
    return "biceps";
  }
  if (
    (patterns.has("extension") ||
      tags.has("triceps") ||
      descriptor.includes("triceps") ||
      descriptor.includes("pressdown") ||
      descriptor.includes("extension")) &&
    !descriptorIndicatesPull
  ) {
    return "triceps";
  }
  if (
    descriptor.includes("lateral raise") ||
    descriptor.includes("lateral-raise") ||
    tags.has("lateraldelt")
  ) {
    return "lateral";
  }
  if (
    patterns.has("verticalpush") ||
    descriptor.includes("shoulder press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("pike push-up") ||
    descriptor.includes("pike-pushup")
  ) {
    return "ohp";
  }
  return "other";
};

const isCarryExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set((exercise.movementPattern ?? []).map((pattern) => normalizeToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  return (
    patterns.has("carry") ||
    tags.has("carry") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("farmer")
  );
};

const isTowelOrHackArmExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    descriptor.includes("towel") ||
    descriptor.includes("self-resisted") ||
    descriptor.includes("self resisted") ||
    descriptor.includes("partner-resisted") ||
    descriptor.includes("partner resisted")
  );
};

const buildQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
  ...overrides,
});

const getShouldersArmsDay = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Shoulders + Arms");
  if (!day) throw new Error("Shoulders + Arms day not found");
  return day;
};

const getMainExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getShouldersArmsDay(program).routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const getAccessoryExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getShouldersArmsDay(program).routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const countArmAccessories = (accessories: Exercise[]) =>
  accessories.filter((exercise) => {
    const category = resolveMainCategory(exercise);
    return category === "biceps" || category === "triceps";
  });

describe("Shoulders + Arms Day 2 (3-day split) arms-as-accessories contract", () => {
  test("routine mains are shoulder-only with expected counts by experience", () => {
    const cases: Array<{
      experience: QuestionnaireData["experience"];
      phaseIndex: 1 | 2 | 3;
      expectedMainCount: number;
    }> = [
      { experience: "Beginner", phaseIndex: 1, expectedMainCount: 3 },
      { experience: "Intermediate", phaseIndex: 2, expectedMainCount: 4 },
      { experience: "Advanced", phaseIndex: 3, expectedMainCount: 4 },
    ];

    cases.forEach(({ experience, phaseIndex, expectedMainCount }) => {
      const seed = `day2-routine-shoulders-only-${experience.toLowerCase()}`;
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          experience,
          equipment: ["gym"],
        }),
        seed,
        { phaseIndex, seed }
      );
      const mains = getMainExercises(program);
      const categories = mains.map((exercise) => resolveMainCategory(exercise));

      expect(mains.length).toBe(expectedMainCount);
      expect(categories.filter((category) => category === "ohp").length).toBe(1);
      expect(categories.filter((category) => category === "lateral").length).toBe(1);
      expect(categories.filter((category) => category === "rearDeltMain").length).toBe(
        expectedMainCount - 2
      );
      expect(categories.filter((category) => category === "biceps").length).toBe(0);
      expect(categories.filter((category) => category === "triceps").length).toBe(0);
      expect(mains.some((exercise) => isCarryExercise(exercise))).toBe(false);
      expect(categories.filter((category) => category === "ohp").length).toBeLessThanOrEqual(1);
      expect(categories.filter((category) => category === "lateral").length).toBeLessThanOrEqual(1);
      expect(new Set(mains.map((exercise) => exercise.id)).size).toBe(mains.length);
    });
  });

  test("beginner has 2 arm accessories + 1 carry finisher", () => {
    const program = generateWeeklyProgram(
      buildQuestionnaire({
        experience: "Beginner",
        equipment: ["gym"],
      }),
      "day2-beginner-accessory-carry",
      { phaseIndex: 1, seed: "day2-beginner-accessory-carry" }
    );
    const accessories = getAccessoryExercises(program);
    const armAccessories = countArmAccessories(accessories);
    const carryIndexes = accessories
      .map((exercise, index) => ({ exercise, index }))
      .filter((entry) => isCarryExercise(entry.exercise))
      .map((entry) => entry.index);

    expect(armAccessories.length).toBe(2);
    expect(carryIndexes.length).toBe(1);
    expect(accessories.length).toBe(3);
    expect(Math.max(...carryIndexes)).toBe(accessories.length - 1);
  });

  test("intermediate has 2 arm accessories + 1 carry finisher", () => {
    const program = generateWeeklyProgram(
      buildQuestionnaire({
        experience: "Intermediate",
        equipment: ["gym"],
      }),
      "day2-intermediate-accessory-carry",
      { phaseIndex: 2, seed: "day2-intermediate-accessory-carry" }
    );
    const accessories = getAccessoryExercises(program);
    const armAccessories = countArmAccessories(accessories);
    const carryIndexes = accessories
      .map((exercise, index) => ({ exercise, index }))
      .filter((entry) => isCarryExercise(entry.exercise))
      .map((entry) => entry.index);

    expect(armAccessories.length).toBe(2);
    expect(carryIndexes.length).toBe(1);
    expect(accessories.length).toBe(3);
    expect(Math.max(...carryIndexes)).toBe(accessories.length - 1);
  });

  test("advanced has 4 arm accessories (2 biceps + 2 triceps) + 1 carry finisher", () => {
    const program = generateWeeklyProgram(
      buildQuestionnaire({
        experience: "Advanced",
        equipment: ["gym"],
      }),
      "day2-advanced-accessory-carry",
      { phaseIndex: 3, seed: "day2-advanced-accessory-carry" }
    );
    const accessories = getAccessoryExercises(program);
    const biceps = accessories.filter((exercise) => resolveMainCategory(exercise) === "biceps");
    const triceps = accessories.filter((exercise) => resolveMainCategory(exercise) === "triceps");
    const bicepsFamilyVariants = new Set(
      biceps.map(
        (exercise) => `${normalizeToken(exercise.familyKey ?? exercise.id)}::${normalizeToken(exercise.variantKey ?? "")}`
      )
    );
    const tricepsFamilyVariants = new Set(
      triceps.map(
        (exercise) => `${normalizeToken(exercise.familyKey ?? exercise.id)}::${normalizeToken(exercise.variantKey ?? "")}`
      )
    );
    const carryIndexes = accessories
      .map((exercise, index) => ({ exercise, index }))
      .filter((entry) => isCarryExercise(entry.exercise))
      .map((entry) => entry.index);

    expect(biceps.length).toBe(2);
    expect(triceps.length).toBe(2);
    expect(bicepsFamilyVariants.size).toBe(2);
    expect(tricepsFamilyVariants.size).toBe(2);
    expect(carryIndexes.length).toBe(1);
    expect(accessories.length).toBe(5);
    expect(Math.max(...carryIndexes)).toBe(accessories.length - 1);
  });

  test("gym availability avoids towel/isometric arm accessory hacks when weighted options exist", () => {
    const program = generateWeeklyProgram(
      buildQuestionnaire({
        experience: "Intermediate",
        equipment: ["gym", "bands", "none"],
      }),
      "day2-gym-no-towel-arm-hacks",
      { phaseIndex: 2, seed: "day2-gym-no-towel-arm-hacks" }
    );
    const armAccessories = countArmAccessories(getAccessoryExercises(program));

    expect(armAccessories.length).toBeGreaterThanOrEqual(2);
    armAccessories.forEach((exercise) => {
      const descriptor = `${exercise.id} ${exercise.name} ${exercise.variantKey ?? ""}`.toLowerCase();
      expect(isTowelOrHackArmExercise(exercise)).toBe(false);
      expect(exercise.loadType).not.toBe("timed");
      expect(descriptor.includes("iso")).toBe(false);
    });
  });
});
