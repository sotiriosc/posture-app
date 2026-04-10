import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildEngineSignals, generateProgram } from "@/lib/engine";
import type { ExerciseLog, Program, ProgramProgress, SessionRecord } from "@/lib/types";

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands"],
  daysPerWeek: 3,
};

const comparableWeek = (program: Program) =>
  program.week.map((day) => ({
    dayIndex: day.dayIndex,
    title: day.title,
    routine: day.routine.map((item) => ({
      exerciseId: item.exerciseId,
      section: item.section,
      sets: item.sets,
      reps: item.reps,
      loadType: item.loadType,
    })),
  }));

const buildSignals = (params?: {
  sessions?: SessionRecord[];
  exerciseLogs?: ExerciseLog[];
  programProgress?: ProgramProgress | null;
}) =>
  buildEngineSignals({
    questionnaire,
    history: {
      sessions: params?.sessions ?? [],
      exerciseLogs: params?.exerciseLogs ?? [],
      programProgress: params?.programProgress ?? null,
    },
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

describe("engine program entry point", () => {
  test("same state yields the same generated week", () => {
    const base = generateProgram({
      mode: "weekly",
      signals: buildSignals(),
      nextProgramId: "engine-base",
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 1,
    });

    expect(base.status).toBe("generated");
    if (!("program" in base)) {
      throw new Error("Expected a generated base program.");
    }

    const sessions: SessionRecord[] = [
      {
        id: "session-1",
        userId: null,
        startedAt: "2026-04-07T09:00:00.000Z",
        completedAt: "2026-04-07T09:45:00.000Z",
        createdAt: "2026-04-07T09:00:00.000Z",
        updatedAt: "2026-04-07T09:45:00.000Z",
        routineId: base.program.id,
        durationSec: 2700,
        notes: null,
        sessionFeedback: "moderate",
        source: "local",
        deletedAt: null,
      },
    ];
    const exerciseLogs: ExerciseLog[] = [
      {
        id: "log-1",
        userId: null,
        sessionId: "session-1",
        exerciseId: "band-row",
        section: "main",
        programId: base.program.id,
        dayIndex: 0,
        createdAt: "2026-04-07T09:10:00.000Z",
        updatedAt: "2026-04-07T09:10:00.000Z",
        loadType: "weighted",
        unit: null,
        weight: null,
        reps: 12,
        repsBySet: [12, 12, 12],
        setsPlanned: 3,
        setsCompleted: 3,
        durationSec: null,
        rpe: 7,
        felt: "hard",
        notes: null,
        computedVolume: null,
        source: "local",
        deletedAt: null,
      },
    ];
    const progress: ProgramProgress = {
      programId: base.program.id,
      lastCompletedDayIndex: 0,
      nextDayIndex: 1,
      completedDayIndices: [0],
      phaseIndex: base.program.phaseIndex ?? 2,
      phaseStartedAt: "2026-04-01T12:00:00.000Z",
      cyclesCompletedInPhase: 1,
      daysPerWeek: base.program.daysPerWeek,
      weekIndex: 2,
      countedWeekKeys: [`${base.program.id}:${base.program.phaseIndex ?? 2}:1`],
      updatedAt: "2026-04-07T09:45:00.000Z",
    };
    const followUpSignals = buildSignals({
      sessions,
      exerciseLogs,
      programProgress: progress,
    });

    const run = (nextProgramId: string) =>
      generateProgram({
        mode: "weekly",
        signals: followUpSignals,
        currentProgram: base.program,
        nextProgramId,
        phaseIndex: base.program.phaseIndex ?? 2,
        cycleIndex: 2,
        weekIndex: 2,
        totalWeekIndex: 2,
      });

    const a = run("engine-repeat-a");
    const b = run("engine-repeat-b");

    expect(a.status).toBe("generated");
    expect(b.status).toBe("generated");
    if ("program" in a && "program" in b) {
      expect(a.seed).toBe(b.seed);
      expect(comparableWeek(a.program)).toEqual(comparableWeek(b.program));
    }
  });

  test("changing cycle/week target changes the seed and the resulting week", () => {
    const signals = buildSignals();

    const cycleOne = generateProgram({
      mode: "weekly",
      signals,
      nextProgramId: "engine-cycle-1",
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 1,
    });
    expect(cycleOne.status).toBe("generated");
    if (!("program" in cycleOne)) {
      throw new Error("Expected a generated cycle-one program.");
    }

    const cycleTwo = generateProgram({
      mode: "weekly",
      signals,
      currentProgram: cycleOne.program,
      nextProgramId: "engine-cycle-2",
      phaseIndex: 2,
      cycleIndex: 2,
      weekIndex: 2,
      totalWeekIndex: 2,
    });
    expect(cycleTwo.status).toBe("generated");
    if (!("program" in cycleTwo)) {
      throw new Error("Expected a generated cycle-two program.");
    }

    expect(cycleOne.seed).not.toBe(cycleTwo.seed);
    expect(comparableWeek(cycleOne.program)).not.toEqual(comparableWeek(cycleTwo.program));
  });
});
