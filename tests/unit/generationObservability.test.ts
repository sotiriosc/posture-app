import { describe, expect, test, vi } from "vitest";
import {
  buildFinalSelectionTraceEmitter,
  clearProgramSelectionAuditBuffer,
  finalizeWeeklyGenerationObservability,
  getProgramSelectionAuditBuffer,
  recordProgramSelectionAuditEntry,
} from "@/lib/program/generationObservability";
import type { ProgramDay } from "@/lib/types";

describe("generation observability helpers", () => {
  test("recordProgramSelectionAuditEntry preserves hook behavior and debug buffer semantics", () => {
    clearProgramSelectionAuditBuffer();
    const selectionAuditHook = vi.fn();

    recordProgramSelectionAuditEntry({
      entry: {
        slotId: "slot-1",
        dayTitle: "Back + Chest",
        slotKind: "main",
        capabilityMode: "hasLoad",
        chosen: {
          exerciseId: "push-up",
          name: "Push-Up",
          score: 9,
          reasons: ["reason"],
        },
        top: [],
      },
      persistToBuffer: true,
      bufferLimit: 1,
      selectionAuditHook,
    });

    recordProgramSelectionAuditEntry({
      entry: {
        slotId: "slot-2",
        dayTitle: "Back + Chest",
        slotKind: "main",
        capabilityMode: "hasLoad",
        chosen: {
          exerciseId: "row",
          name: "Row",
          score: 10,
          reasons: ["reason"],
        },
        top: [],
      },
      persistToBuffer: true,
      bufferLimit: 1,
      selectionAuditHook,
    });

    expect(selectionAuditHook).toHaveBeenCalledTimes(2);
    expect(getProgramSelectionAuditBuffer()).toEqual([
      expect.objectContaining({
        slotId: "slot-2",
      }),
    ]);
  });

  test("buildFinalSelectionTraceEmitter preserves final-trace payload shape", () => {
    const selectionAuditHook = vi.fn();
    const emitFinalSelectionTraceForWeek = buildFinalSelectionTraceEmitter({
      resolveExerciseById: (exerciseId: string) => ({
        id: exerciseId,
        name: exerciseId.toUpperCase(),
      }),
      getExerciseId: (exercise) => exercise.id,
      getExerciseName: (exercise) => exercise.name,
      resolveMainLane: () => "push" as const,
      resolveSlotKind: (lane) => lane ?? "mainRepair",
      buildSlotId: ({ dayTitle, mainIndex }) =>
        `${dayTitle.toLowerCase().replace(/\s+/g, "-")}-${mainIndex}`,
      scoreExerciseForSelectionTrace: () => ({
        score: 7.5,
        reasons: ["score"],
      }),
      getCapabilityBonus: () => ({
        bonus: 1.25,
        reasons: ["capability"],
      }),
    });
    const week: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Back + Chest",
        focusTags: ["back", "chest"],
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

    emitFinalSelectionTraceForWeek({
      week,
      selectionContext: { phaseName: "Phase 1" },
      available: new Set(["dumbbells"]),
      capabilityMode: "hasLoad",
      selectionAuditHook,
    });

    expect(selectionAuditHook).toHaveBeenCalledWith({
      slotId: "back-+-chest-1",
      dayTitle: "Back + Chest",
      slotKind: "push",
      capabilityMode: "hasLoad",
      chosen: {
        exerciseId: "push-up",
        name: "PUSH-UP",
        score: 8.75,
        reasons: ["[final_trace]", "score", "capability"],
      },
      top: [
        {
          exerciseId: "push-up",
          name: "PUSH-UP",
          score: 8.75,
          reasons: ["[final_trace]", "score", "capability"],
        },
      ],
    });
  });

  test("finalizeWeeklyGenerationObservability emits trace and commits variation snapshot together", () => {
    const emitSelectionTrace = vi.fn();
    const commitVariationSnapshot = vi.fn();
    const week: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Back + Chest",
        focusTags: [],
        routine: [],
      },
    ];
    const selectionContext = {
      variationState: { enabled: true, seedKey: "var-1" },
    };

    finalizeWeeklyGenerationObservability({
      week,
      selectionContext,
      available: new Set(["dumbbells"]),
      capabilityMode: "hasLoad",
      selectionAuditHook: vi.fn(),
      emitSelectionTrace,
      commitVariationSnapshot,
    });

    expect(emitSelectionTrace).toHaveBeenCalledWith({
      week,
      selectionContext,
      available: new Set(["dumbbells"]),
      capabilityMode: "hasLoad",
      selectionAuditHook: expect.any(Function),
    });
    expect(commitVariationSnapshot).toHaveBeenCalledWith(
      selectionContext.variationState,
      week
    );
  });
});
