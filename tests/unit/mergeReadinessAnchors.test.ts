import { describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildEngineSignals, generateProgram } from "@/lib/engine";
import { deriveUserTrainingState } from "@/lib/phases";
import {
  PROGRAM_TEMPLATE_VERSION,
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";
import { finalizeWeeklyProgramResult } from "@/lib/program/programFinalization";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";

const weekSignature = (week: ReturnType<typeof generateWeeklyProgram>["week"]) =>
  week
    .map((day) => day.routine.map((item) => `${item.section}:${item.exerciseId}`).join(","))
    .join("|");

type GeneratedWeek = ReturnType<typeof generateWeeklyProgram>["week"];
type GeneratedDay = GeneratedWeek[number];
type RoutineSection = GeneratedDay["routine"][number]["section"];

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const getSectionExercises = (day: GeneratedDay, section: RoutineSection) =>
  day.routine
    .filter((item) => item.section === section)
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const exerciseHasAnyToken = (exercise: Exercise, tokens: string[]) => {
  const normalizedTokens = new Set(tokens.map(normalizeToken));
  const exerciseTokens = [
    ...(exercise.movementPattern ?? []),
    ...(exercise.slotRoles ?? []),
    ...(exercise.weeklyCoverageTags ?? []),
    ...(exercise.accessoryRoles ?? []),
    ...(exercise.tags ?? []),
  ].map(normalizeToken);
  return exerciseTokens.some((token) => normalizedTokens.has(token));
};

const hasExerciseWithAnyToken = (exercises: Exercise[], tokens: string[]) =>
  exercises.some((exercise) => exerciseHasAnyToken(exercise, tokens));

const findGeneratedDay = (week: GeneratedWeek, title: string) => {
  const day = week.find((entry) => entry.title === title);
  expect(day).toBeTruthy();
  if (!day) {
    throw new Error(`Expected ${title} day.`);
  }
  return day;
};

const expectRoutineShape = (
  week: GeneratedWeek,
  questionnaire: QuestionnaireData
) => {
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  expect(week).toHaveLength(questionnaire.daysPerWeek);
  week.forEach((day) => {
    const sections = new Set(day.routine.map((item) => item.section));
    expect(sections.has("warmup")).toBe(true);
    expect(sections.has("activation")).toBe(true);
    expect(sections.has("main")).toBe(true);
    expect(sections.has("accessory")).toBe(true);
    expect(sections.has("cooldown")).toBe(true);
    const ids = day.routine.map((item) => item.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      day.routine.every((item) => {
        const exercise = exerciseById(item.exerciseId);
        return Boolean(exercise && isExerciseEligible(exercise, available));
      })
    ).toBe(true);
  });
};

const expectThreeDayIdentity = (week: GeneratedWeek) => {
  const backChest = findGeneratedDay(week, "Back + Chest");
  const backChestMains = getSectionExercises(backChest, "main");
  const backChestAll = [
    ...backChestMains,
    ...getSectionExercises(backChest, "accessory"),
  ];
  expect(
    hasExerciseWithAnyToken(backChestMains, [
      "push",
      "horizontalpush",
      "chest",
      "pushCompound",
      "mainChestIsolation",
    ])
  ).toBe(true);
  expect(
    hasExerciseWithAnyToken(backChestAll, [
      "pull",
      "horizontalpull",
      "verticalpull",
      "back",
      "upper-back",
    ])
  ).toBe(true);

  const shouldersArms = findGeneratedDay(week, "Shoulders + Arms");
  const shouldersMains = getSectionExercises(shouldersArms, "main");
  const shouldersAll = [
    ...shouldersMains,
    ...getSectionExercises(shouldersArms, "accessory"),
  ];
  expect(
    hasExerciseWithAnyToken(shouldersMains, [
      "verticalpush",
      "lateraldelt",
      "reardelt",
      "delts",
      "shoulders",
    ])
  ).toBe(true);
  expect(hasExerciseWithAnyToken(shouldersAll, ["accessoryTriceps", "triceps"])).toBe(
    true
  );
  expect(hasExerciseWithAnyToken(shouldersAll, ["accessoryBiceps", "biceps"])).toBe(
    true
  );

  const legsAbs = findGeneratedDay(week, "Legs + Abs");
  const legsMains = getSectionExercises(legsAbs, "main");
  const legsAccessories = getSectionExercises(legsAbs, "accessory");
  expect(hasExerciseWithAnyToken(legsMains, ["squat", "kneedominant"])).toBe(true);
  expect(
    hasExerciseWithAnyToken(legsMains, ["hinge", "posteriorchain", "glute"])
  ).toBe(true);
  expect(
    hasExerciseWithAnyToken(legsAccessories, [
      "core",
      "coreStability",
      "antiRotation",
      "accessoryCoreStability",
    ])
  ).toBe(true);
};

const engineQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands"],
  daysPerWeek: 3,
};

const progressionQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("merge readiness anchors", () => {
  test("weekly generation through the engine stays anchored", () => {
    const signals = buildEngineSignals({
      questionnaire: engineQuestionnaire,
      prefs: {
        schemaVersion: 2,
        feedbackByExercise: {
          "band-row": {
            rating: "hard",
          },
        },
      },
      nowIso: "2026-04-09T12:00:00.000Z",
    });

    const result = generateProgram({
      mode: "weekly",
      signals,
      nextProgramId: "anchor-weekly",
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 1,
    });

    expect(result.status).toBe("generated");
    if (!("program" in result)) {
      throw new Error("Expected generated weekly result.");
    }

    expect(result.seed).toBe(
      "engine-v1|weekly|target:2:1:1:1|questionnaire:15hyeri|settings:w8rmy8|history:14wgysr"
    );
    expectRoutineShape(result.program.week, engineQuestionnaire);
    expectThreeDayIdentity(result.program.week);
  });

  test("nextCycle anchor stays advanced with the same progressed week shape", () => {
    const current = generateWeeklyProgram(progressionQuestionnaire, "current-cycle", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "anchor-cycle",
    });

    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: progressionQuestionnaire,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 3,
      completedWeeksCount: 1,
      nextProgramId: "next-cycle",
      seed: "anchor-cycle",
    });

    expect(result.status).toBe("advanced");
    if (result.status !== "advanced") {
      throw new Error("Expected advanced next-cycle result.");
    }

    expect(result.program.phaseIndex).toBe(1);
    expect(result.program.weekIndex).toBe(2);
    expect(result.program.cycleIndex).toBe(2);
    expectRoutineShape(result.program.week, progressionQuestionnaire);
    expectThreeDayIdentity(result.program.week);
  });

  test("nextPhase anchor stays advanced with the same phase-reset week shape", () => {
    const current = generateWeeklyProgram(progressionQuestionnaire, "current-phase", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 1,
      totalWeekIndex: 3,
      seed: "anchor-phase",
    });

    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: progressionQuestionnaire,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "next-phase",
      seed: "anchor-phase",
    });

    expect(result.status).toBe("advanced");
    if (result.status !== "advanced") {
      throw new Error("Expected advanced next-phase result.");
    }

    expect(result.program.phaseIndex).toBe(2);
    expect(result.program.weekIndex).toBe(1);
    expect(result.program.cycleIndex).toBe(1);
    expectRoutineShape(result.program.week, progressionQuestionnaire);
    expectThreeDayIdentity(result.program.week);
  });

  test("same deterministic state still yields the same week", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const run = () =>
      generateWeeklyProgram(questionnaire, "deterministic-anchor", {
        phaseIndex: 2,
        weekIndex: 2,
        cycleIndex: 2,
        totalWeekIndex: 5,
        seed: "anchor-deterministic",
        variation: {
          seed: "anchor-var",
          settingsHash: "anchor-settings",
          variationIndex: 3,
          useRecentMemory: false,
        },
      });

    const a = run();
    const b = run();

    expect(weekSignature(a.week)).toBe(weekSignature(b.week));
  });

  test("warning forwarding and observability seams stay intact", () => {
    const auditEntries: Array<{ reasons: string[] }> = [];
    const observed = generateWeeklyProgram(engineQuestionnaire, "observability-anchor", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "observability-seed",
      selectionAuditHook: (entry) => {
        auditEntries.push({
          reasons: entry.chosen.reasons,
        });
      },
    });

    expect(auditEntries.length).toBeGreaterThan(0);
    expect(auditEntries.some((entry) => entry.reasons.includes("[final_trace]"))).toBe(true);

    const pushWarnings = vi.fn();
    const trainingState = deriveUserTrainingState({
      phaseIndex: observed.phaseIndex ?? 2,
      complianceRate: 0,
      painFlag: false,
      fatigueFlag: false,
    });

    finalizeWeeklyProgramResult({
      pushWarnings,
      programId: observed.id,
      phaseName: observed.phaseName ?? null,
      createdAt: observed.createdAt,
      goalTrack: observed.goalTrack,
      daysPerWeek: observed.daysPerWeek,
      phaseIndex: observed.phaseIndex ?? 2,
      weekIndex: observed.weekIndex ?? 1,
      totalWeekIndex: observed.totalWeekIndex ?? 1,
      cycleIndex: observed.cycleIndex ?? 1,
      nextWeekPlan: observed.nextWeekPlan!,
      week: observed.week,
      questionnaire: engineQuestionnaire,
      trainingState,
      consistencyRate: 0,
      warnings: [
        {
          dayTitle: "Back + Chest",
          kind: "coverage",
          message: "Anchor warning forwarding check.",
        },
      ],
      templateVersion: PROGRAM_TEMPLATE_VERSION,
    });

    expect(pushWarnings).toHaveBeenCalledWith([
      {
        programId: observed.id,
        phaseName: observed.phaseName ?? "Phase 2: Hypertrophy & Capacity",
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "Anchor warning forwarding check.",
      },
    ]);
  });
});
