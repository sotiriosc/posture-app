import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  daySatisfiesSpec,
  generateWeeklyProgram,
  resolveDayConstraintSpec,
} from "@/lib/program";
import type { ExerciseLog, Program } from "@/lib/types";

const toCapabilityMode = (
  questionnaire: QuestionnaireData
): "noneOnly" | "bandOnly" | "hasLoad" => {
  const capability = computeEquipmentCapability(questionnaire.equipment);
  if (capability.hasLoad) return "hasLoad";
  if (capability.hasBand) return "bandOnly";
  return "noneOnly";
};

const expectedMainCount = (experience: QuestionnaireData["experience"]) =>
  experience === "Beginner" ? 2 : 3;

const inferMainLane = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return null;
  const patterns = new Set(
    exercise.movementPattern.map((pattern) =>
      pattern.trim().toLowerCase().replace(/[\s-]+/g, "")
    )
  );
  if (patterns.has("verticalpush")) return "verticalpush";
  if (patterns.has("push")) return "push";
  if (patterns.has("pull")) return "pull";
  if (patterns.has("squat")) return "squat";
  if (patterns.has("hinge")) return "hinge";
  return null;
};

const summary = (program: Program) =>
  program.week.map((day) => ({
    title: day.title,
    mainIds: day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId),
    accessoryIds: day.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .slice(0, 3),
  }));

const assertGoldenInvariants = (program: Program, questionnaire: QuestionnaireData) => {
  const capabilityMode = toCapabilityMode(questionnaire);
  const expectedMain = expectedMainCount(questionnaire.experience);

  expect(program.week.length).toBe(questionnaire.daysPerWeek);

  program.week.forEach((day) => {
    const ids = day.routine.map((item) => item.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);

    const mains = day.routine.filter((item) => item.section === "main");
    expect(mains.length).toBe(expectedMain);
    mains.forEach((item) => {
      expect(exerciseById(item.exerciseId)?.category).toBe("main");
    });

    const spec = resolveDayConstraintSpec({
      day,
      daysPerWeek: questionnaire.daysPerWeek,
      capabilityMode,
    });
    if (!spec) return;
    const validation = daySatisfiesSpec(day, spec);
    expect(validation.ok).toBe(true);
  });
};

describe("program adaptation from logs end-to-end", () => {
  test("failed + deload guidance on a main exercise adapts next seeded week while preserving contracts", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 4,
    };

    const seed = "adaptation-from-logs-e2e-seed";
    const weekA = generateWeeklyProgram(questionnaire, "adapt-week-a", {
      seed,
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
    });

    const targetDayIndex = weekA.week.findIndex((day) =>
      day.title.toLowerCase().includes("upper pull")
    );
    expect(targetDayIndex).toBeGreaterThanOrEqual(0);
    const dayA = weekA.week[targetDayIndex];
    const dayAMains = dayA.routine.filter((item) => item.section === "main");
    expect(dayAMains.length).toBeGreaterThan(0);

    const riskyExerciseId = dayAMains[0].exerciseId;
    const riskyLane = inferMainLane(riskyExerciseId);
    expect(riskyLane).toBeTruthy();

    const recentLogs: ExerciseLog[] = [
      {
        id: "adapt-log-1",
        userId: "local",
        sessionId: "session-1",
        exerciseId: riskyExerciseId,
        section: "main",
        originalExerciseId: null,
        substitutedExerciseId: null,
        programId: weekA.id,
        dayIndex: targetDayIndex,
        createdAt: "2026-02-10T10:00:00.000Z",
        updatedAt: "2026-02-10T10:00:00.000Z",
        loadType: exerciseById(riskyExerciseId)?.loadType ?? "weighted",
        unit: "lb",
        weight: 50,
        reps: 6,
        repsBySet: [6, 6],
        setsPlanned: 3,
        setsCompleted: 2,
        durationSec: null,
        workSecondsUsed: null,
        restSecondsUsed: null,
        rpe: 9,
        felt: "pain",
        painLevel: "severe",
        painLocation: "shoulder",
        nextTimeGuidance: "Next time: reduce load 5-10% or drop 1 set.",
        feedbackNotes: null,
        notes: null,
        computedVolume: 600,
        source: "local",
        deletedAt: null,
      },
      {
        id: "adapt-log-2",
        userId: "local",
        sessionId: "session-2",
        exerciseId: riskyExerciseId,
        section: "main",
        originalExerciseId: null,
        substitutedExerciseId: null,
        programId: weekA.id,
        dayIndex: targetDayIndex,
        createdAt: "2026-02-12T10:00:00.000Z",
        updatedAt: "2026-02-12T10:00:00.000Z",
        loadType: exerciseById(riskyExerciseId)?.loadType ?? "weighted",
        unit: "lb",
        weight: 50,
        reps: 7,
        repsBySet: [7, 7],
        setsPlanned: 3,
        setsCompleted: 2,
        durationSec: null,
        workSecondsUsed: null,
        restSecondsUsed: null,
        rpe: 8,
        felt: "hard",
        painLevel: "moderate",
        painLocation: "shoulder",
        nextTimeGuidance: "Next time: reduce range + use lighter load.",
        feedbackNotes: null,
        notes: null,
        computedVolume: 700,
        source: "local",
        deletedAt: null,
      },
    ];

    const weekB = generateWeeklyProgram(questionnaire, "adapt-week-b", {
      seed,
      phaseIndex: 2,
      weekIndex: 2,
      cycleIndex: 1,
      totalWeekIndex: 2,
      recentLogs,
    });

    const dayB = weekB.week[targetDayIndex];
    const dayBMains = dayB.routine.filter((item) => item.section === "main");
    expect(dayBMains.length).toBe(dayAMains.length);
    expect(dayBMains[0].exerciseId).not.toBe(riskyExerciseId);

    const replacementLane = inferMainLane(dayBMains[0].exerciseId);
    expect(replacementLane).toBe(riskyLane);

    assertGoldenInvariants(weekB, questionnaire);

    const weekBAgain = generateWeeklyProgram(questionnaire, "adapt-week-b-repeat", {
      seed,
      phaseIndex: 2,
      weekIndex: 2,
      cycleIndex: 1,
      totalWeekIndex: 2,
      recentLogs,
    });
    expect(summary(weekBAgain)).toEqual(summary(weekB));
  });
});
