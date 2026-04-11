import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildEngineSignals, generateProgram } from "@/lib/engine";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { clearProgramVariationHistory, generateWeeklyProgram } from "@/lib/program";
import type { Program } from "@/lib/types";

const baseQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 5,
  ...overrides,
});

const generateAnchorProgram = (
  questionnaire: QuestionnaireData,
  id: string
): Program =>
  generateWeeklyProgram(questionnaire, id, {
    phaseIndex: 2,
    seed: id,
    variation: {
      seed: `${id}-slot`,
      settingsHash: `${id}-settings`,
      variationIndex: 1,
      useRecentMemory: false,
      initialLiveVariation: true,
    },
  });

const mainExercises = (program: Program, title: string) => {
  const day = program.week.find((item) => item.title === title);
  expect(day, `Missing generated day "${title}"`).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const accessoryExercises = (program: Program, title: string) => {
  const day = program.week.find((item) => item.title === title);
  expect(day, `Missing generated day "${title}"`).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern.toLowerCase());

const hasUpperPattern = (exercise: Exercise) =>
  ["push", "pull", "verticalpush", "horizontalpush", "horizontalpull", "verticalpull"].some(
    (pattern) => hasPattern(exercise, pattern)
  );

const hasLowerPattern = (exercise: Exercise) =>
  ["squat", "hinge"].some((pattern) => hasPattern(exercise, pattern));

const isArmIsolation = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("biceps") ||
    descriptor.includes("curl") ||
    descriptor.includes("triceps extension") ||
    descriptor.includes("triceps-extension") ||
    descriptor.includes("pressdown") ||
    descriptor.includes("kickback")
  );
};

const isSupportDrill = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return [
    "face pull",
    "external rotation",
    "pull-apart",
    "snow angel",
    "swimmer",
    "y raise",
    "t raise",
    "lat sweep",
    "isometric",
    "hold",
    "dead bug",
    "plank",
    "bird dog",
  ].some((token) => descriptor.includes(token));
};

const isKnownLowerMainDrift = (exercise: Exercise) =>
  [
    "bodyweight-good-morning",
    "back-extension-hold",
    "single-leg-hip-thrust",
    "single-leg-glute-bridge-hold",
  ].includes(exercise.id);

const isCarryMain = (exercise: Exercise) =>
  exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "carry") ||
  /carry|suitcase/i.test(`${exercise.id} ${exercise.name}`);

const isCoreOnlyMain = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => pattern.toLowerCase()));
  return (
    patterns.has("core") &&
    !["push", "pull", "verticalpush", "squat", "hinge"].some((pattern) =>
      patterns.has(pattern)
    )
  );
};

const countPattern = (exercises: Exercise[], pattern: string) =>
  exercises.filter((exercise) => hasPattern(exercise, pattern)).length;

const mainLayoutSignature = (program: Program) =>
  program.week
    .map((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId)
        .join(",")
    )
    .join("|");

const comparableWeek = (program: Program) =>
  program.week.map((day) => ({
    title: day.title,
    routine: day.routine.map((item) => ({
      exerciseId: item.exerciseId,
      section: item.section,
      sets: item.sets,
      reps: item.reps,
      loadType: item.loadType,
    })),
  }));

const buildSignals = (questionnaire: QuestionnaireData) =>
  buildEngineSignals({
    questionnaire,
    history: {
      sessions: [],
      exerciseLogs: [],
      programProgress: null,
    },
    prefs: null,
    nowIso: "2026-04-11T12:00:00.000Z",
  });

describe("higher-frequency split contracts", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("4-day gym split preserves two upper and two lower day identities", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        experience: "Beginner",
        daysPerWeek: 4,
      }),
      "hf-4day-beginner-gym"
    );

    expect(program.week.map((day) => day.title)).toEqual([
      "Upper Push + Scapular Control",
      "Lower (Squat Emphasis) + Core",
      "Upper Pull + Thoracic Posture",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ]);

    program.week.forEach((day) => {
      const mains = day.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(mains.length).toBeGreaterThanOrEqual(2);
      if (day.title.startsWith("Upper")) {
        expect(mains.some(hasUpperPattern)).toBe(true);
        expect(mains.some(hasLowerPattern)).toBe(false);
      } else {
        expect(mains.some(hasLowerPattern)).toBe(true);
        expect(mains.some(hasUpperPattern)).toBe(false);
      }
      expect(day.warmup?.items.length ?? 0).toBeLessThanOrEqual(
        day.title.startsWith("Upper") ? 3 : 4
      );
      expect(day.activation?.items.length ?? 0).toBeLessThanOrEqual(2);
      expect(day.cooldown?.items.length ?? 0).toBeGreaterThanOrEqual(2);
    });

    const hingeMains = mainExercises(program, "Lower (Hinge Emphasis) + Carry/Anti-rotation");
    expect(hingeMains[0] ? hasPattern(hingeMains[0], "hinge") : false).toBe(true);
    expect(hingeMains.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(hingeMains.some(isCarryMain)).toBe(false);
    expect(countPattern(hingeMains, "squat")).toBeLessThanOrEqual(
      Math.max(1, countPattern(hingeMains, "hinge"))
    );
  });

  test("5-day gym split keeps arms/posture as an upper exposure, not an isolation main day", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-intermediate-gym"
    );

    const lowerSquat = mainExercises(program, "Lower Squat");
    const lowerHinge = mainExercises(program, "Lower Hinge + Posterior Chain");
    expect(lowerSquat.some((exercise) => hasPattern(exercise, "squat"))).toBe(true);
    expect(lowerSquat.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(lowerSquat.some((exercise) => exercise.id === "bodyweight-good-morning")).toBe(false);
    expect(countPattern(lowerSquat, "squat")).toBeGreaterThanOrEqual(
      countPattern(lowerSquat, "hinge")
    );
    expect(lowerHinge[0] ? hasPattern(lowerHinge[0], "hinge") : false).toBe(true);
    expect(lowerHinge.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(countPattern(lowerHinge, "hinge")).toBeGreaterThanOrEqual(
      countPattern(lowerHinge, "squat")
    );
    expect(lowerHinge.some(isKnownLowerMainDrift)).toBe(false);
    expect(lowerHinge.some(isCarryMain)).toBe(false);

    const armsMains = mainExercises(program, "Arms + Posture + Conditioning");
    expect(armsMains.some((exercise) => hasPattern(exercise, "pull"))).toBe(true);
    expect(armsMains.some((exercise) => hasPattern(exercise, "verticalpush"))).toBe(true);
    expect(armsMains.some(isArmIsolation)).toBe(false);
    expect(armsMains.some(isSupportDrill)).toBe(false);
    expect(armsMains.some(isCarryMain)).toBe(false);
    expect(armsMains.some(isCoreOnlyMain)).toBe(false);

    const armsAccessories = accessoryExercises(program, "Arms + Posture + Conditioning");
    expect(armsAccessories.some((exercise) => /triceps|extension/i.test(exercise.name))).toBe(true);
    expect(armsAccessories.some((exercise) => /biceps|curl/i.test(exercise.name))).toBe(true);
  });

  test("5-day pain-aware gym split protects lower mains from hold/drill fallback", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        painAreas: ["Lower back", "Shoulders/neck"],
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-pain-gym"
    );

    const lowerMains = [
      ...mainExercises(program, "Lower Squat"),
      ...mainExercises(program, "Lower Hinge + Posterior Chain"),
    ];
    expect(lowerMains.some(isKnownLowerMainDrift)).toBe(false);
    expect(lowerMains.some((exercise) => hasPattern(exercise, "squat"))).toBe(true);
    expect(lowerMains.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
  });

  test("5-day no-equipment split keeps constrained lower days anchored instead of filler-only", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["none"],
        experience: "Advanced",
        daysPerWeek: 5,
      }),
      "hf-5day-advanced-none"
    );

    const lowerSquat = mainExercises(program, "Lower Squat");
    const lowerHinge = mainExercises(program, "Lower Hinge + Posterior Chain");
    expect(lowerSquat.some((exercise) => exercise.id === "bodyweight-good-morning")).toBe(false);
    expect(lowerSquat.some(isCarryMain)).toBe(false);
    expect(countPattern(lowerSquat, "squat")).toBeGreaterThanOrEqual(2);
    expect(lowerHinge[0] ? hasPattern(lowerHinge[0], "hinge") : false).toBe(true);
    expect(countPattern(lowerHinge, "hinge")).toBeGreaterThanOrEqual(2);
    expect(lowerHinge.some(isCarryMain)).toBe(false);
    expect(
      lowerHinge.some((exercise) =>
        ["back-extension-hold", "single-leg-hip-thrust", "single-leg-glute-bridge-hold"].includes(
          exercise.id
        )
      )
    ).toBe(false);

    const armsMains = mainExercises(program, "Arms + Posture + Conditioning");
    expect(armsMains.some((exercise) => hasPattern(exercise, "pull"))).toBe(true);
    expect(armsMains.some((exercise) => hasPattern(exercise, "verticalpush"))).toBe(true);
    expect(armsMains.some(isArmIsolation)).toBe(false);
    expect(armsMains.some(isCarryMain)).toBe(false);
    expect(armsMains.some(isCoreOnlyMain)).toBe(false);
  });

  test("4/5-day live initial variation changes main layout while same slot stays stable", () => {
    const questionnaire = baseQuestionnaire({
      equipment: ["gym"],
      daysPerWeek: 5,
    });
    const signals = buildSignals(questionnaire);
    const generateLive = (slot: string, id: string) =>
      generateProgram({
        mode: "weekly",
        signals,
        nextProgramId: id,
        initialVariationSeed: slot,
        phaseIndex: 2,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 1,
      });

    const slotA = generateLive("hf-live-slot-a", "hf-live-slot-a");
    const slotARepeat = generateLive("hf-live-slot-a", "hf-live-slot-a-repeat");
    const slotB = generateLive("hf-live-slot-b", "hf-live-slot-b");

    expect(slotA.status).toBe("generated");
    expect(slotARepeat.status).toBe("generated");
    expect(slotB.status).toBe("generated");
    if ("program" in slotA && "program" in slotARepeat && "program" in slotB) {
      expect(slotA.program.week).toHaveLength(5);
      expect(comparableWeek(slotA.program)).toEqual(comparableWeek(slotARepeat.program));
      expect(mainLayoutSignature(slotA.program)).not.toBe(mainLayoutSignature(slotB.program));
    }
  });
});
