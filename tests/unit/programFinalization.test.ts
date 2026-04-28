import { describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { deriveUserTrainingState } from "@/lib/phases";
import { PROGRAM_TEMPLATE_VERSION, generateWeeklyProgram } from "@/lib/program";
import {
  finalizeAdvancedProgressionResult,
  finalizeWeeklyProgramResult,
  pushConstraintWarningsForProgram,
} from "@/lib/program/programFinalization";

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands", "bench"],
  daysPerWeek: 4,
};

describe("program finalization helpers", () => {
  test("pushConstraintWarningsForProgram maps warnings before forwarding them", () => {
    const pushWarnings = vi.fn();

    const warnings = pushConstraintWarningsForProgram({
      programId: "finalization-program",
      phaseName: "Hypertrophy & Capacity",
      warnings: [
        {
          dayTitle: "Back + Chest",
          kind: "coverage",
          message: "Added safe fallback to preserve day coverage.",
        },
      ],
      pushWarnings,
    });

    expect(warnings).toEqual([
      {
        programId: "finalization-program",
        phaseName: "Hypertrophy & Capacity",
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "Added safe fallback to preserve day coverage.",
      },
    ]);
    expect(pushWarnings).toHaveBeenCalledWith(warnings);
  });

  test("finalizeWeeklyProgramResult preserves weekly enriched program shape and warning handoff", () => {
    const baseProgram = generateWeeklyProgram(questionnaire, "finalize-weekly-base", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
      seed: "finalize-weekly-base",
    });
    const pushWarnings = vi.fn();
    const trainingState = deriveUserTrainingState({
      phaseIndex: 2,
      complianceRate: 0,
      painFlag: false,
      fatigueFlag: false,
    });

    const program = finalizeWeeklyProgramResult({
      pushWarnings,
      programId: baseProgram.id,
      phaseName: baseProgram.phaseName ?? null,
      createdAt: baseProgram.createdAt,
      goalTrack: baseProgram.goalTrack,
      daysPerWeek: baseProgram.daysPerWeek,
      phaseIndex: baseProgram.phaseIndex ?? 2,
      weekIndex: baseProgram.weekIndex ?? 1,
      totalWeekIndex: baseProgram.totalWeekIndex ?? 2,
      cycleIndex: baseProgram.cycleIndex ?? 2,
      nextWeekPlan: baseProgram.nextWeekPlan!,
      week: baseProgram.week,
      questionnaire,
      trainingState,
      consistencyRate: 0,
      warnings: [
        {
          dayTitle: "Back + Chest",
          kind: "coverage",
          message: "Added safe fallback to preserve day coverage.",
        },
      ],
      templateVersion: PROGRAM_TEMPLATE_VERSION,
    });

    expect(pushWarnings).toHaveBeenCalledTimes(1);
    expect(program.id).toBe(baseProgram.id);
    expect(program.phase).toBeTruthy();
    expect(program.nextWeekPlan).toEqual(baseProgram.nextWeekPlan);
    expect(program.movementProfile).toBeTruthy();
    expect(program.phaseObjective).toBeTruthy();
    expect(program.sessionAdaptation).toBeTruthy();
  });

  test("finalizeAdvancedProgressionResult preserves advanced result assembly and warning handoff", () => {
    const baseProgram = generateWeeklyProgram(questionnaire, "finalize-advanced-base", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
      seed: "finalize-advanced-base",
    });
    const pushWarnings = vi.fn();
    const trainingState = deriveUserTrainingState({
      phaseIndex: 2,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
    });

    const result = finalizeAdvancedProgressionResult({
      pushWarnings,
      warnings: [
        {
          dayTitle: "Back + Chest",
          kind: "coverage",
          message: "Added safe fallback to preserve day coverage.",
        },
      ],
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

    expect(pushWarnings).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("advanced");
    expect(result.program.id).toBe(baseProgram.id);
    expect(result.program.nextWeekPlan?.summary).toBeTruthy();
    expect(result.program.phaseOptimizerReport?.summary).toContain(
      "Phase optimizer changed 2/24 exercise slots"
    );
    expect(result.program.movementProfile).toBeTruthy();
    expect(result.program.phaseObjective).toBeTruthy();
    expect(result.program.sessionAdaptation).toBeTruthy();
  });
});
