import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { ExerciseLog, ProgramDay } from "@/lib/types";
import {
  resolveWeeklyFeedbackInputs,
  resolveWeeklyRuntimeContext,
} from "@/lib/program/weeklyExecution";

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands", "bench"],
  daysPerWeek: 4,
};

describe("weekly execution helpers", () => {
  test("resolveWeeklyFeedbackInputs preserves explicit summary and recent usage context", () => {
    const createdAt = new Date("2026-04-09T10:00:00Z").toISOString();
    const previousWeek: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Back + Chest",
        focusTags: [],
        routine: [
          {
            exerciseId: "push-up",
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
      ["dead-bug", { painPenalty: 1 }],
    ]);

    const result = resolveWeeklyFeedbackInputs({
      recentLogs,
      previousWeek,
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
    expect(result.recentlyUsedExerciseIds.has("push-up")).toBe(true);
  });

  test("resolveWeeklyRuntimeContext centralizes weekly runtime setup and selection RNG", () => {
    const runtimeContext = resolveWeeklyRuntimeContext({
      questionnaire,
      feedbackSummaryByExercise: new Map<string, unknown>(),
      recentlyUsedExerciseIds: new Set(["dead-bug"]),
      poseFocusTagsForVariation: ["scapular_control"],
      phaseIndex: 2,
      weekIndex: 3,
      totalWeekIndex: 6,
      cycleIndex: 2,
      seed: "weekly-runtime-seed",
      variation: { variationIndex: 1 },
      normalizeDaysPerWeek: (daysPerWeek) => daysPerWeek,
      resolveVariationState: ({ phaseIndex, baseSeed }) => ({
        enabled: true,
        seedKey: `${baseSeed}:${phaseIndex}`,
      }),
      getExperienceProfile: () => ({ level: "Intermediate", mainSets: "3" }),
      getPhaseName: (phaseIndex) => `Phase ${phaseIndex}`,
      buildSelectionContext: ({
        phaseIndex,
        phaseName,
        capabilityMode,
        feedbackSummaryByExercise,
        recentlyUsedExerciseIds,
        variationState,
      }) => ({
        painAreas: ["Shoulders"],
        painSeverity: "medium" as const,
        goal: "General fitness",
        experienceLevel: "intermediate",
        poseFocusTags: new Set(["scapular_control"]),
        phaseIndex,
        phaseName,
        capabilityMode,
        feedbackCount: feedbackSummaryByExercise.size,
        recentCount: recentlyUsedExerciseIds.size,
        variationState,
      }),
      createTrainingState: (phaseIndex) => ({
        phaseIndex,
        readiness: "build",
      }),
      buildNextWeekPlan: ({ phaseName, trainingState, painSeverity }) => ({
        summary: `${phaseName}:${painSeverity}`,
        change: String((trainingState as { readiness: string }).readiness),
      }),
    });

    expect(runtimeContext.normalizedDaysPerWeek).toBe(4);
    expect(runtimeContext.availableEquipment.has("dumbbells")).toBe(true);
    expect(runtimeContext.capabilityMode).toBe("hasLoad");
    expect(runtimeContext.phaseIndex).toBe(2);
    expect(runtimeContext.weekIndex).toBe(3);
    expect(runtimeContext.totalWeekIndex).toBe(6);
    expect(runtimeContext.cycleIndex).toBe(2);
    expect(runtimeContext.phaseName).toBe("Phase 2");
    expect(runtimeContext.experienceProfile).toEqual({
      level: "Intermediate",
      mainSets: "3",
    });
    expect(runtimeContext.trainingState).toEqual({
      phaseIndex: 2,
      readiness: "build",
    });
    expect(runtimeContext.nextWeekPlan).toEqual({
      summary: "Phase 2:medium",
      change: "build",
    });
    expect(runtimeContext.selectionContext).toMatchObject({
      phaseIndex: 2,
      phaseName: "Phase 2",
      capabilityMode: "hasLoad",
      feedbackCount: 0,
      recentCount: 1,
    });
    expect(runtimeContext.variationState).toEqual({
      enabled: true,
      seedKey: "weekly-runtime-seed:2",
    });
    expect(runtimeContext.selectionRng?.()).toBeDefined();
    expect(runtimeContext.selectionRng?.()).not.toBeNaN();
  });
});
