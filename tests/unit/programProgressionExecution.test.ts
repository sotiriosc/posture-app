import { describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import {
  buildBaseProgressedProgram,
  resolveProgressionFeedbackInputs,
  resolveProgressionRuntimeContext,
} from "@/lib/program/progressionExecution";
import type { ExerciseLog, ProgramDay } from "@/lib/types";

const baseQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands", "bench"],
  daysPerWeek: 4,
};

describe("program progression execution helpers", () => {
  test("resolves progression feedback inputs from explicit summary and recent usage", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-exec-feedback", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "progression-exec-feedback",
    });
    const createdAt = new Date("2026-04-09T10:00:00Z").toISOString();
    const recentLogs: ExerciseLog[] = [
      {
        id: "log-1",
        userId: null,
        sessionId: "session-1",
        exerciseId: "dead-bug",
        createdAt,
        updatedAt: createdAt,
        loadType: "bodyweight",
        unit: null,
        weight: null,
        reps: 10,
        repsBySet: [10],
        setsPlanned: 1,
        setsCompleted: 1,
        durationSec: null,
        rpe: 3,
        felt: "moderate",
        notes: null,
        computedVolume: null,
        source: "local",
        deletedAt: null,
      },
    ];
    const explicitSummary = new Map<string, unknown>([
      ["dead-bug", { painPenalty: 1, downshiftBias: 0 }],
    ]);

    const result = resolveProgressionFeedbackInputs({
      currentProgram: current,
      recentLogs,
      feedbackSummaryByExercise: explicitSummary,
      summarizeFeedbackFromLogs: () => new Map(),
      buildRecentlyUsedExerciseIdSet: (params) => {
        const ids = new Set<string>();
        (params?.recentLogs ?? []).forEach((log) => ids.add(log.exerciseId));
        (params?.previousWeek ?? []).forEach((day) =>
          day.routine.forEach((item) => ids.add(item.exerciseId))
        );
        return ids;
      },
    });

    expect(result.resolvedFeedbackSummaryByExercise).toBe(explicitSummary);
    expect(result.recentlyUsedExerciseIds.has("dead-bug")).toBe(true);
    expect(result.recentlyUsedExerciseIds.size).toBeGreaterThan(1);
  });

  test("buildBaseProgressedProgram preserves phase retry-with-cycle-2 behavior", () => {
    const currentWeek: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Back + Chest",
        focusTags: [],
        routine: [
          {
            exerciseId: "a",
            section: "main",
            sets: "3",
            reps: "8",
            durationSec: null,
            restSec: 60,
            loadType: "bodyweight",
            notes: null,
            cues: null,
          },
        ],
      },
    ];
    const buildProgramForTarget = vi.fn((target: {
      phaseIndex: number;
      cycleIndex: number;
      weekIndex: number;
      totalWeekIndex: number;
    }) => ({
      week:
        target.cycleIndex === 1
          ? currentWeek
          : [
              {
                ...currentWeek[0],
                routine: [{ ...currentWeek[0].routine[0], exerciseId: "b" }],
              },
            ],
    }));

    const result = buildBaseProgressedProgram({
      currentWeek,
      target: {
        phaseIndex: 2,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 4,
      },
      buildProgramForTarget,
      retryWithCycleIndexOnSameWeek: 2,
    });

    expect(buildProgramForTarget).toHaveBeenCalledTimes(2);
    expect(buildProgramForTarget).toHaveBeenNthCalledWith(1, {
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 4,
    });
    expect(buildProgramForTarget).toHaveBeenNthCalledWith(2, {
      phaseIndex: 2,
      cycleIndex: 2,
      weekIndex: 1,
      totalWeekIndex: 4,
    });
    expect(result.week[0]?.routine[0]?.exerciseId).toBe("b");
  });

  test("resolveProgressionRuntimeContext centralizes equipment, target fallback, and selection context setup", () => {
    const program = {
      ...generateWeeklyProgram(baseQuestionnaire, "progression-exec-runtime", {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 2,
        totalWeekIndex: 2,
        seed: "progression-exec-runtime",
      }),
      phaseIndex: undefined,
      cycleIndex: undefined,
      weekIndex: undefined,
      phaseName: undefined,
    };

    const runtimeContext = resolveProgressionRuntimeContext({
      questionnaire: baseQuestionnaire,
      program,
      target: {
        phaseIndex: 2,
        cycleIndex: 2,
        weekIndex: 1,
        totalWeekIndex: 2,
      },
      feedbackSummaryByExercise: new Map<string, unknown>(),
      recentlyUsedExerciseIds: new Set(["dead-bug"]),
      buildSelectionContext: ({
        phaseIndex,
        phaseName,
        capabilityMode,
        recentlyUsedExerciseIds,
      }) => ({
        phaseIndex,
        phaseName,
        capabilityMode,
        recentCount: recentlyUsedExerciseIds.size,
      }),
      getPhaseName: (phaseIndex) => `Phase ${phaseIndex}`,
      normalizeDaysPerWeek: (daysPerWeek) => daysPerWeek,
    });

    expect(runtimeContext.capabilityMode).toBe("hasLoad");
    expect(runtimeContext.resolvedTarget).toEqual({
      phaseIndex: 2,
      cycleIndex: 2,
      weekIndex: 1,
    });
    expect(runtimeContext.phaseName).toBe("Phase 2");
    expect(runtimeContext.daysPerWeek).toBe(4);
    expect(runtimeContext.selectionContext).toEqual({
      phaseIndex: 2,
      phaseName: "Phase 2",
      capabilityMode: "hasLoad",
      recentCount: 1,
    });
  });
});
