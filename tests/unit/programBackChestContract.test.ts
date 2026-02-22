import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateNextPhaseProgram, generateWeeklyProgram } from "@/lib/program";

const isVerticalPullMain = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "verticalpull");

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isBackAccessory = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull") ||
    tags.has("pull") ||
    tags.has("scap") ||
    tags.has("upperback") ||
    tags.has("lats") ||
    tags.has("back") ||
    muscles.has("upperback") ||
    muscles.has("lats") ||
    muscles.has("back") ||
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("lat") ||
    descriptor.includes("back")
  );
};

const isRearDeltOrExternalAccessory = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("scap") ||
    tags.has("externalrotation") ||
    tags.has("rotatorcuff") ||
    muscles.has("reardelts") ||
    muscles.has("rotatorcuff") ||
    patterns.has("externalrotation") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("external rotation")
  );
};

const isChestIsolationAccessory = (exercise: Exercise) => {
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck") ||
    ((tags.has("chest") || muscles.has("chest")) &&
      (descriptor.includes("isolation") || descriptor.includes("fly")))
  );
};

const isRedundantBackAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const rowLike =
    descriptor.includes("row") || descriptor.includes("pulldown") || descriptor.includes("lat");
  const shoulderHealthExemption =
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("upright") ||
    descriptor.includes("pullover");
  return rowLike && !shoulderHealthExemption;
};

const hasHorizontalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("push") && !patterns.has("verticalpush");
};

const hasHorizontalPullMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return patterns.has("horizontalpull") || descriptor.includes("row");
};

const hasVerticalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("verticalpush");
};

const pressingMainCount = (exercises: Exercise[]) =>
  exercises.filter(
    (exercise) => hasHorizontalPushMain(exercise) || hasVerticalPushMain(exercise)
  ).length;

const pullMainCount = (exercises: Exercise[]) =>
  exercises.filter((exercise) => hasPullPattern(exercise)).length;

const rowAngleSignature = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (!descriptor.includes("row")) return null;
  if (descriptor.includes("machine seated row")) return "machine_seated";
  if (descriptor.includes("cable seated row")) return "cable_seated";
  if (descriptor.includes("chest-supported row")) return "chest_supported";
  if (descriptor.includes("dumbbell rows")) return "dumbbell_rows";
  if (descriptor.includes("split-stance row")) return "split_stance";
  if (descriptor.includes("suspension row")) return "suspension_row";
  return "generic_row";
};

const hasDuplicateRowAngles = (exercises: Exercise[]) => {
  const signatures = exercises
    .map((exercise) => rowAngleSignature(exercise))
    .filter((entry): entry is string => Boolean(entry));
  return new Set(signatures).size !== signatures.length;
};

const hasPullPattern = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "pull");

const hasPushPattern = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "push");

const pullVsPushVolume = (exercises: Exercise[]) => {
  const pull = exercises.filter((exercise) => hasPullPattern(exercise)).length;
  const push = exercises.filter((exercise) => hasPushPattern(exercise)).length;
  return { pull, push };
};

const redundantBackIds = new Set([
  "machine-seated-row",
  "cable-seated-row",
  "machine-lat-pulldown",
  "cable-lat-pulldown",
  "dumbbell-rows",
  "split-stance-row",
  "band-row",
  "band-lat-pulldown",
]);

const isLoadedOrAssistedAccessory = (exercise: Exercise) => {
  if (exercise.loadType === "bodyweight" || exercise.loadType === "timed") return false;
  return true;
};

const includesAnyRedundantBackId = (exercises: Exercise[]) =>
  exercises.some((exercise) => redundantBackIds.has(exercise.id));

describe("back + chest contract regression", () => {
  test("pain beginner growth 3-day bands keeps structural push-pull architecture", () => {
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
    expect(mainExercises.length).toBeGreaterThanOrEqual(3);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);

    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(accessoryExercises.length).toBeGreaterThanOrEqual(2);
    expect(accessoryExercises.every((exercise) => isBackAccessory(exercise))).toBe(true);
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.filter((exercise) => isChestIsolationAccessory(exercise)).length).toBeLessThanOrEqual(1);
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);

    const volume = pullVsPushVolume([...mainExercises, ...accessoryExercises]);
    expect(volume.pull).toBeGreaterThanOrEqual(volume.push);
  });

  test("gym profile keeps accessory posterior bias and avoids redundant row stacking", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(questionnaire, "regression-back-chest-gym-priority", {
      phaseIndex: 2,
      seed: "regression-back-chest-gym-priority",
    });

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    expect(accessoryExercises.length).toBeGreaterThanOrEqual(2);
    expect(accessoryExercises.every((exercise) => isBackAccessory(exercise))).toBe(true);
    expect(accessoryExercises.every((exercise) => isLoadedOrAssistedAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);
    expect(includesAnyRedundantBackId(accessoryExercises)).toBe(false);
    expect(accessoryExercises.filter((exercise) => isChestIsolationAccessory(exercise)).length).toBeLessThanOrEqual(1);

    const volume = pullVsPushVolume([...mainExercises, ...accessoryExercises]);
    expect(volume.pull).toBeGreaterThanOrEqual(volume.push);
  });

  test("phase 1 gym prioritizes machine mains and shoulder-health accessories", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-phase1-machine-priority",
      {
        phaseIndex: 1,
        seed: "regression-back-chest-phase1-machine-priority",
      }
    );

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const machineMains = mainExercises.filter((exercise) =>
      exercise.equipment.includes("machines")
    );

    expect(machineMains.length).toBeGreaterThanOrEqual(2);
    expect(mainExercises.some((exercise) => exercise.id === "machine-seated-row")).toBe(true);
    expect(mainExercises.some((exercise) => exercise.id === "machine-lat-pulldown")).toBe(true);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);

    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(accessoryExercises.every((exercise) => isBackAccessory(exercise))).toBe(true);
    expect(accessoryExercises.every((exercise) => isLoadedOrAssistedAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);
    expect(includesAnyRedundantBackId(accessoryExercises)).toBe(false);
  });

  test("experience scaling applies fixed Back + Chest main/accessory counts", () => {
    const cases: Array<{
      experience: QuestionnaireData["experience"];
      expectedMain: number;
      expectedAccessory: number;
    }> = [
      { experience: "Beginner", expectedMain: 3, expectedAccessory: 2 },
      { experience: "Intermediate", expectedMain: 4, expectedAccessory: 2 },
      { experience: "Advanced", expectedMain: 5, expectedAccessory: 3 },
    ];

    cases.forEach(({ experience, expectedMain, expectedAccessory }) => {
      const questionnaire: QuestionnaireData = {
        goals: "Improve posture",
        painAreas: [],
        experience,
        daysPerWeek: 3,
        equipment: ["gym"],
      };
      const program = generateWeeklyProgram(
        questionnaire,
        `regression-back-chest-scaling-${experience.toLowerCase()}`,
        {
          phaseIndex: 2,
          seed: `regression-back-chest-scaling-${experience.toLowerCase()}`,
        }
      );
      const backChestDay = program.week.find((day) => day.title === "Back + Chest");
      expect(backChestDay).toBeTruthy();
      if (!backChestDay) return;

      const mainExercises = backChestDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const accessoryExercises = backChestDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));

      expect(mainExercises.length).toBe(expectedMain);
      expect(accessoryExercises.length).toBe(expectedAccessory);
      expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
      expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
      expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);
      expect(mainExercises.some((exercise) => isChestIsolationAccessory(exercise))).toBe(false);
    });
  });

  test("advanced Back + Chest keeps pull bias, press cap, no floor-press default, and no duplicate row angles", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup_bar"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-advanced-pattern-integrity",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-advanced-pattern-integrity",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(mainExercises.length).toBe(5);
    expect(pullMainCount(mainExercises)).toBeGreaterThanOrEqual(3);
    expect(pressingMainCount(mainExercises)).toBeLessThanOrEqual(2);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBeGreaterThanOrEqual(1);
    expect(hasDuplicateRowAngles(mainExercises)).toBe(false);
    expect(
      mainExercises.some((exercise) => exercise.id === "dumbbell-floor-press")
    ).toBe(false);
  });

  test("phase progression rotates Back + Chest accessory pairing", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "regression-back-chest-phase1-rotation", {
      phaseIndex: 1,
      seed: "regression-back-chest-phase1-rotation",
    });
    const advanced = generateNextPhaseProgram({
      currentProgram: phase1,
      questionnaire,
      painFlag: false,
      complianceRate: 0.95,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "regression-back-chest-phase2-rotation",
      seed: "regression-back-chest-phase2-rotation",
    });

    expect(advanced.status).toBe("advanced");
    if (advanced.status !== "advanced") return;

    const phase1BackChest = phase1.week.find((day) => day.title === "Back + Chest");
    const phase2BackChest = advanced.program.week.find((day) => day.title === "Back + Chest");
    expect(phase1BackChest).toBeTruthy();
    expect(phase2BackChest).toBeTruthy();
    if (!phase1BackChest || !phase2BackChest) return;

    const phase1Signature = phase1BackChest.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .sort((left, right) => left.localeCompare(right))
      .join("|");
    const phase2Signature = phase2BackChest.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .sort((left, right) => left.localeCompare(right))
      .join("|");

    expect(phase2Signature).not.toBe(phase1Signature);
  });

  test("pull-up ladder escalates to weighted pull-up for advanced phase 3 when pull-up bar is available", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-advanced-weighted-pullup",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-advanced-weighted-pullup",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(mainExercises.map((exercise) => exercise.id)).toContain("weighted-pullup");
  });
});
