import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { deriveUserTrainingState } from "@/lib/phases";
import { generateWeeklyProgram } from "@/lib/program";
import {
  assembleAdvancedProgressionResult,
  buildProgramConstraintWarnings,
  buildProgramNextWeekPlan,
  buildProgramPhaseMetadata,
} from "@/lib/program/programAssembly";

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands", "bench"],
  daysPerWeek: 4,
};

describe("program assembly helpers", () => {
  test("phase metadata assembly keeps phase object shaping consistent", () => {
    const { phaseMeta, phase } = buildProgramPhaseMetadata({
      phaseIndex: 2,
      cycleIndex: 3,
      weekIndex: 4,
    });

    expect(phaseMeta.phaseIndex).toBe(2);
    expect(phaseMeta.phaseName).toBeTruthy();
    expect(phase).toEqual({
      name: phaseMeta.phaseName,
      phaseIndex: 2,
      cycleIndex: 3,
      weekIndex: 4,
      weekCount: 4,
      goal: expect.any(String),
    });
  });

  test("next-week plan assembly preserves optimizer summary and high-pain clause", () => {
    const trainingState = deriveUserTrainingState({
      phaseIndex: 2,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
    });

    const plan = buildProgramNextWeekPlan({
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      phaseName: "Hypertrophy & Capacity",
      trainingState,
      painSeverity: "high",
      optimizerSummary: "Phase optimizer changed 4/20 exercise slots.",
    });

    expect(plan.change).toContain("Phase optimizer changed 4/20 exercise slots.");
    expect(plan.summary).toContain(
      "This plan prioritizes comfortable range of motion and control to restore movement before growth."
    );
  });

  test("constraint warning assembly preserves program and phase metadata", () => {
    expect(
      buildProgramConstraintWarnings({
        programId: "assembly-program",
        phaseName: "Hypertrophy & Capacity",
        warnings: [
          {
            dayTitle: "Back + Chest",
            kind: "coverage",
            message: "Added safe fallback to preserve day coverage.",
          },
        ],
      })
    ).toEqual([
      {
        programId: "assembly-program",
        phaseName: "Hypertrophy & Capacity",
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "Added safe fallback to preserve day coverage.",
      },
    ]);
  });

  test("advanced progression assembly keeps enriched program result shape", () => {
    const baseProgram = generateWeeklyProgram(questionnaire, "assembly-base-program", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
      seed: "assembly-base-program",
    });
    const trainingState = deriveUserTrainingState({
      phaseIndex: 2,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
    });

    const result = assembleAdvancedProgressionResult({
      program: baseProgram,
      questionnaire,
      phaseIndex: baseProgram.phaseIndex ?? 2,
      cycleIndex: baseProgram.cycleIndex ?? 2,
      weekIndex: baseProgram.weekIndex ?? 1,
      week: baseProgram.week,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      painSeverity: "medium",
      trainingState,
      optimizerResult: {
        summary: "Phase optimizer changed 2/24 exercise slots with priority on progression.",
        priorities: ["push", "pull"],
        changedSlots: 2,
        totalSlots: 24,
        exerciseReasons: {
          "Back + Chest:1": ["Progression demand"],
        },
      },
    });

    expect(result.status).toBe("advanced");
    expect(result.program.id).toBe(baseProgram.id);
    expect(result.program.nextWeekPlan?.change).toContain(
      "Phase optimizer changed 2/24 exercise slots with priority on progression."
    );
    expect(result.program.phaseOptimizerReport).toEqual({
      summary: "Phase optimizer changed 2/24 exercise slots with priority on progression.",
      priorities: ["push", "pull"],
      changedSlots: 2,
      totalSlots: 24,
      exerciseReasons: {
        "Back + Chest:1": ["Progression demand"],
      },
    });
    expect(result.program.movementProfile).toBeTruthy();
    expect(result.program.phaseObjective).toBeTruthy();
    expect(result.program.sessionAdaptation).toBeTruthy();
  });
});
