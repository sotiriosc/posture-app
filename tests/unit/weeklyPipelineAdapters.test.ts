import { describe, expect, test, vi } from "vitest";
import type { Equipment } from "@/lib/equipment";
import {
  buildWeeklyPipelineCallbacks,
  resolveWeeklyRepairContext,
} from "@/lib/program/weeklyPipelineAdapters";
import { runWeeklyGenerationPipeline } from "@/lib/program/weeklyExecution";
import type { ProgramDay } from "@/lib/types";

const currentWeek: ProgramDay[] = [
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

const runtimeContext = {
  normalizedDaysPerWeek: 4 as const,
  availableEquipment: new Set<Equipment>(["dumbbells", "bench"]),
  capabilityMode: "hasLoad" as const,
  phaseIndex: 2,
  weekIndex: 1,
  totalWeekIndex: 2,
  cycleIndex: 2,
  phaseName: "Phase 2",
  experienceProfile: { level: "Intermediate" },
  trainingState: { phaseIndex: 2 },
  nextWeekPlan: { summary: "next", change: "build" },
  selectionContext: {
    painAreas: ["Shoulders"],
    painSeverity: "medium" as const,
    goal: "General fitness",
    experienceLevel: "intermediate",
    poseFocusTags: new Set(["scapular_control"]),
    variationState: {
      enabled: true,
      seedKey: "weekly-seed",
    },
  },
  variationState: {
    enabled: true,
    seedKey: "weekly-seed",
  },
  selectionRng: undefined,
};

describe("weekly pipeline adapters", () => {
  test("resolveWeeklyRepairContext centralizes repair runtime inputs", () => {
    expect(
      resolveWeeklyRepairContext({
        availableEquipment: runtimeContext.availableEquipment,
        selectionContext: runtimeContext.selectionContext,
        capabilityMode: runtimeContext.capabilityMode,
        selectionSeed: "weekly-seed",
        previousWeek: currentWeek,
      })
    ).toEqual({
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
      capabilityMode: "hasLoad",
      selectionSeed: "weekly-seed",
      selectionRng: undefined,
      previousWeek: currentWeek,
    });
  });

  test("buildWeeklyPipelineCallbacks wires weekly runtime inputs into policy callbacks", () => {
    const repairContext = resolveWeeklyRepairContext({
      availableEquipment: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
      capabilityMode: runtimeContext.capabilityMode,
      selectionSeed: "weekly-seed",
      previousWeek: currentWeek,
    });
    const normalizeWeekForSelectionContext = vi.fn(() => currentWeek);
    const applyFeedbackDrivenSubstitutions = vi.fn(() => currentWeek);
    const applyDayCurriculumConstraints = vi.fn(() => ({
      week: currentWeek,
      warnings: [],
    }));
    const applyFinalFeedbackSafetyPass = vi.fn(() => currentWeek);
    const attachStructuredPrepBlocksToWeek = vi.fn(() => currentWeek);

    const callbacks = buildWeeklyPipelineCallbacks({
      runtimeContext,
      repairContext,
      normalizeWeekForSelectionContext,
      applyFeedbackDrivenSubstitutions,
      applyDayCurriculumConstraints,
      applyFinalFeedbackSafetyPass,
      attachStructuredPrepBlocksToWeek,
    });

    callbacks.normalizeWeek(currentWeek);
    callbacks.substituteWeek(currentWeek);
    callbacks.repairWeek(currentWeek);
    callbacks.applyFeedbackSafety(currentWeek);
    callbacks.attachPrep(currentWeek);

    expect(normalizeWeekForSelectionContext).toHaveBeenCalledWith({
      week: currentWeek,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    });
    expect(applyFeedbackDrivenSubstitutions).toHaveBeenCalledWith({
      week: currentWeek,
      daysPerWeek: 4,
      context: repairContext,
    });
    expect(applyDayCurriculumConstraints).toHaveBeenCalledWith({
      week: currentWeek,
      daysPerWeek: 4,
      context: repairContext,
    });
    expect(applyFinalFeedbackSafetyPass).toHaveBeenCalledWith({
      week: currentWeek,
      daysPerWeek: 4,
      context: repairContext,
    });
    expect(attachStructuredPrepBlocksToWeek).toHaveBeenCalledWith({
      week: currentWeek,
      available: runtimeContext.availableEquipment,
      capabilityMode: "hasLoad",
      painAreas: ["Shoulders"],
      painSeverity: "medium",
      goal: "General fitness",
      experienceLevel: "intermediate",
      poseFocusTags: new Set(["scapular_control"]),
    });
  });

  test("runWeeklyGenerationPipeline preserves weekly finalization sequencing and warning merge", () => {
    const callOrder: string[] = [];
    let repairCallCount = 0;

    const result = runWeeklyGenerationPipeline({
      initialWeek: currentWeek,
      substituteWeek: (week) => {
        callOrder.push("substitute");
        return week;
      },
      normalizeWeek: (week) => {
        callOrder.push("normalize");
        return week;
      },
      repairWeek: (week) => {
        repairCallCount += 1;
        callOrder.push(`repair:${repairCallCount}`);
        return {
          week,
          warnings: [
            {
              dayTitle: "Back + Chest",
              kind: "coverage",
              message: `warning-${repairCallCount}`,
            },
          ],
        };
      },
      applyFeedbackSafety: (week) => {
        callOrder.push("feedbackSafety");
        return week;
      },
      attachPrep: (week) => {
        callOrder.push("attachPrep");
        return week;
      },
    });

    expect(callOrder).toEqual([
      "substitute",
      "normalize",
      "repair:1",
      "normalize",
      "feedbackSafety",
      "normalize",
      "repair:2",
      "normalize",
      "attachPrep",
    ]);
    expect(result.week).toEqual(currentWeek);
    expect(result.warnings).toEqual([
      {
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "warning-1",
      },
      {
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "warning-2",
      },
    ]);
  });
});
