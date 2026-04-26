import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { generateNextPhaseProgram, generateWeeklyProgram } from "@/lib/program";

const buildSignature = (ids: string[]) =>
  [...ids].sort((left, right) => left.localeCompare(right)).join("|");

const getBackChestAccessoryIds = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  if (!day) return [] as string[];
  return day.routine
    .filter((item) => item.section === "accessory")
    .map((item) => item.exerciseId);
};

const getBackChestAccessoryReps = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  if (!day) return [] as string[];
  return day.routine
    .filter((item) => item.section === "accessory")
    .map((item) => item.reps ?? null);
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isRearDeltDominantAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeToken(muscle))
  );
  return (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse snow angel") ||
    descriptor.includes("prone swimmer") ||
    tags.has("reardelt") ||
    muscles.has("reardelts")
  );
};

const isExternalScapAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeToken(pattern))
  );
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    tags.has("scap") ||
    tags.has("externalrotation") ||
    tags.has("rotatorcuff") ||
    patterns.has("externalrotation")
  );
};

const isChestIsolationAccessory = (exercise: Exercise) =>
  exercise.accessoryRoles?.includes("accessoryChestIsolation") ?? false;

const expectChestIsolationHasPosteriorSupport = (ids: string[]) => {
  const selected = ids
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const chestIsolation = selected.filter(isChestIsolationAccessory);
  if (!chestIsolation.length) return;

  expect(chestIsolation).toHaveLength(1);
  expect(
    selected.some(
      (exercise) =>
        !isChestIsolationAccessory(exercise) &&
        (isRearDeltDominantAccessory(exercise) || isExternalScapAccessory(exercise))
    )
  ).toBe(true);
};

const advancePhase = (
  currentProgram: ReturnType<typeof generateWeeklyProgram>,
  questionnaire: QuestionnaireData,
  nextProgramId: string,
  seed: string
) => {
  const result = generateNextPhaseProgram({
    currentProgram,
    questionnaire,
    painFlag: false,
    complianceRate: 0.9,
    fatigueFlag: false,
    completedSessionsCount: questionnaire.daysPerWeek * 2,
    completedWeeksCount: 2,
    nextProgramId,
    seed,
  });
  expect(result.status).toBe("advanced");
  if (result.status !== "advanced") {
    throw new Error(`Expected advanced phase transition but got ${result.status}`);
  }
  return result.program;
};

describe("back + chest accessory progression", () => {
  test("phase progression avoids identical accessory pairs in 3-day split", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bc-accessory-phase1", {
      phaseIndex: 1,
      seed: "bc-accessory-phase1-seed",
    });
    const phase2 = advancePhase(
      phase1,
      questionnaire,
      "bc-accessory-phase2",
      "bc-accessory-phase2-seed"
    );
    const phase3 = advancePhase(
      phase2,
      questionnaire,
      "bc-accessory-phase3",
      "bc-accessory-phase3-seed"
    );

    const phase1Signature = buildSignature(getBackChestAccessoryIds(phase1));
    const phase2Signature = buildSignature(getBackChestAccessoryIds(phase2));
    const phase3Signature = buildSignature(getBackChestAccessoryIds(phase3));

    expect(phase2Signature).not.toBe(phase1Signature);
    expect(phase3Signature).not.toBe(phase2Signature);
  });

  test("beginner gym accessories rotate and chest isolation stays paired with posterior support", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bc-fly-phase1", {
      phaseIndex: 1,
      seed: "bc-fly-phase1-seed",
    });
    const phase2 = generateWeeklyProgram(questionnaire, "bc-fly-phase2", {
      phaseIndex: 2,
      seed: "bc-fly-phase2-seed",
    });
    const phase3 = generateWeeklyProgram(questionnaire, "bc-fly-phase3", {
      phaseIndex: 3,
      seed: "bc-fly-phase3-seed",
    });

    const phase1AccessoryIds = getBackChestAccessoryIds(phase1);
    const phase2AccessoryIds = getBackChestAccessoryIds(phase2);
    const phase3AccessoryIds = getBackChestAccessoryIds(phase3);
    const phase1AccessoryReps = getBackChestAccessoryReps(phase1);
    const phase2AccessoryReps = getBackChestAccessoryReps(phase2);
    const phase3AccessoryReps = getBackChestAccessoryReps(phase3);

    const gymEligibleRearAlternates = exercises.filter((exercise) => {
      if (exercise.category !== "main") return false;
      if (exercise.id === "machine-rear-delt-row") return false;
      const gymEligible = exercise.equipment.some((entry) =>
        ["machines", "cables", "dumbbells", "gym"].includes(entry)
      );
      return gymEligible && isRearDeltDominantAccessory(exercise);
    });
    const gymEligibleScapAlternates = exercises.filter((exercise) => {
      if (exercise.category !== "main") return false;
      if (exercise.id === "cable-face-pull") return false;
      const gymEligible = exercise.equipment.some((entry) =>
        ["machines", "cables", "dumbbells", "gym", "bands"].includes(entry)
      );
      return gymEligible && isExternalScapAccessory(exercise);
    });
    const alternatesExist =
      gymEligibleRearAlternates.length > 0 || gymEligibleScapAlternates.length > 0;

    if (alternatesExist) {
      expect(buildSignature(phase2AccessoryIds)).not.toBe(
        buildSignature(phase1AccessoryIds)
      );
    }

    expect(phase1AccessoryReps.every((reps) => reps === "10-15")).toBe(true);
    expect(
      phase2AccessoryReps.every((reps) => reps === "10-15" || reps === "12-20")
    ).toBe(true);
    expect(phase3AccessoryReps.every((reps) => reps === "8-12")).toBe(true);

    expectChestIsolationHasPosteriorSupport(phase1AccessoryIds);
    expectChestIsolationHasPosteriorSupport(phase2AccessoryIds);
    expectChestIsolationHasPosteriorSupport(phase3AccessoryIds);

    const progressedPhase2 = advancePhase(
      phase1,
      questionnaire,
      "bc-fly-progressed-phase2",
      "bc-fly-progressed-phase2-seed"
    );
    const progressedPhase3 = advancePhase(
      progressedPhase2,
      questionnaire,
      "bc-fly-progressed-phase3",
      "bc-fly-progressed-phase3-seed"
    );
    const progressedPhase2RearDelt = getBackChestAccessoryIds(progressedPhase2).find((id) => {
      const exercise = exerciseById(id);
      return Boolean(exercise && isRearDeltDominantAccessory(exercise));
    });
    const progressedPhase3RearDelt = getBackChestAccessoryIds(progressedPhase3).find((id) => {
      const exercise = exerciseById(id);
      return Boolean(exercise && isRearDeltDominantAccessory(exercise));
    });
    const hasRearDeltAlternatives =
      gymEligibleRearAlternates.filter((exercise) => exercise.id !== "dumbbell-rear-delt-fly")
        .length > 0;
    if (progressedPhase2RearDelt === "dumbbell-rear-delt-fly" && hasRearDeltAlternatives) {
      expect(progressedPhase3RearDelt).not.toBe("dumbbell-rear-delt-fly");
    }
  });
});
