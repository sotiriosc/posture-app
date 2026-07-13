import { describe, expect, test, vi } from "vitest";
import { deriveUserTrainingState } from "@/lib/phases";
import { buildProgressionPipelineCallbacks } from "@/lib/program/progressionPipelineAdapters";
import type { ProgressionRuntimeContext } from "@/lib/program/progressionExecution";
import type { ProgramDay } from "@/lib/types";

type TestSelectionContext = {
  painAreas: string[];
  painSeverity: "low" | "medium" | "high";
  goal: string;
  experienceLevel: string;
  poseFocusTags: Set<string>;
  phaseName: string;
};

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

const runtimeContext: ProgressionRuntimeContext<TestSelectionContext> = {
  availableEquipment: new Set(["dumbbells", "bench"]),
  capabilityMode: "hasLoad",
  selectionContext: {
    painAreas: ["Shoulders"],
    painSeverity: "medium",
    goal: "General fitness",
    experienceLevel: "intermediate",
    poseFocusTags: new Set(["scapular_control"]),
    phaseName: "Hypertrophy & Capacity",
  },
  daysPerWeek: 4,
  phaseName: "Hypertrophy & Capacity",
  resolvedTarget: {
    phaseIndex: 2,
    cycleIndex: 2,
    weekIndex: 1,
  },
};

describe("progression pipeline adapters", () => {
  test("buildProgressionPipelineCallbacks wires shared runtime inputs into policy callbacks", () => {
    const trainingState = deriveUserTrainingState({
      phaseIndex: 2,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
    });
    const enforceMaterialWeekChange = vi.fn(() => currentWeek);
    const remapWeekForProgressiveNovelty = vi.fn(() => currentWeek);
    const enforceProgressiveDemand = vi.fn(() => currentWeek);
    const dedupeWeekForSelectionContext = vi.fn(() => currentWeek);
    const applyDayCurriculumConstraints = vi.fn(() => ({
      week: currentWeek,
      warnings: [],
    }));
    const normalizeWeekForSelectionContext = vi.fn(() => currentWeek);
    const attachStructuredPrepBlocksToWeek = vi.fn(() => currentWeek);
    const extraRepair = vi.fn(() => currentWeek);

    const callbacks = buildProgressionPipelineCallbacks({
      questionnairePainAreas: ["Shoulders"],
      previousWeek: currentWeek,
      trainingState,
      experienceLevel: "Intermediate",
      enforceMaterialWeekChange,
      remapWeekForProgressiveNovelty,
      enforceProgressiveDemand,
      dedupeWeekForSelectionContext,
      applyDayCurriculumConstraints,
      normalizeWeekForSelectionContext,
      attachStructuredPrepBlocksToWeek,
      extraRepair,
    });

    callbacks.runMaterialWeekChange(currentWeek, currentWeek, runtimeContext);
    callbacks.runNoveltyRemap(currentWeek, currentWeek, runtimeContext);
    callbacks.runDemandProgression(currentWeek, currentWeek, runtimeContext);
    callbacks.dedupeWeek(currentWeek, runtimeContext);
    callbacks.repairWeek(currentWeek, runtimeContext);
    callbacks.normalizeWeek(currentWeek, runtimeContext);
    callbacks.attachPrep(currentWeek, runtimeContext);
    callbacks.extraRepair?.(currentWeek, runtimeContext);

    expect(enforceMaterialWeekChange).toHaveBeenCalledWith({
      currentWeek,
      nextWeek: currentWeek,
      cycleIndex: 2,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    });
    expect(remapWeekForProgressiveNovelty).toHaveBeenCalledWith({
      currentWeek,
      nextWeek: currentWeek,
      available: runtimeContext.availableEquipment,
      cycleIndex: 2,
      phaseIndex: 2,
      painAreas: ["Shoulders"],
      selectionContext: runtimeContext.selectionContext,
    });
    expect(enforceProgressiveDemand).toHaveBeenCalledWith({
      previousWeek: currentWeek,
      nextWeek: currentWeek,
      available: runtimeContext.availableEquipment,
      phaseIndex: 2,
      cycleIndex: 2,
      experienceLevel: "Intermediate",
      trainingState,
      selectionContext: runtimeContext.selectionContext,
    });
    expect(dedupeWeekForSelectionContext).toHaveBeenCalledWith({
      week: currentWeek,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    });
    expect(applyDayCurriculumConstraints).toHaveBeenCalledWith({
      week: currentWeek,
      daysPerWeek: 4,
      context: {
        available: runtimeContext.availableEquipment,
        selectionContext: runtimeContext.selectionContext,
        capabilityMode: "hasLoad",
        previousWeek: currentWeek,
      },
    });
    expect(normalizeWeekForSelectionContext).toHaveBeenCalledWith({
      week: currentWeek,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
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
    expect(extraRepair).toHaveBeenCalledWith({
      week: currentWeek,
      daysPerWeek: 4,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
      capabilityMode: "hasLoad",
      phaseIndex: 2,
    });
  });

  test("buildProgressionPipelineCallbacks leaves extraRepair undefined when not supplied", () => {
    const callbacks = buildProgressionPipelineCallbacks({
      questionnairePainAreas: ["Shoulders"],
      previousWeek: currentWeek,
      trainingState: deriveUserTrainingState({
        phaseIndex: 2,
        complianceRate: 1,
        painFlag: false,
        fatigueFlag: false,
      }),
      experienceLevel: "Intermediate",
      enforceMaterialWeekChange: vi.fn(() => currentWeek),
      remapWeekForProgressiveNovelty: vi.fn(() => currentWeek),
      enforceProgressiveDemand: vi.fn(() => currentWeek),
      dedupeWeekForSelectionContext: vi.fn(() => currentWeek),
      applyDayCurriculumConstraints: vi.fn(() => ({
        week: currentWeek,
        warnings: [],
      })),
      normalizeWeekForSelectionContext: vi.fn(() => currentWeek),
      attachStructuredPrepBlocksToWeek: vi.fn(() => currentWeek),
    });

    expect(callbacks.extraRepair).toBeUndefined();
  });
});
