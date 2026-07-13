import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import {
  deriveProgramProgressionState,
  evaluateNextCycleProgression,
  evaluateNextPhaseProgression,
  resolveGeneratedProgramTransitionState,
} from "@/lib/program/progressionTransition";

const baseQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("program progression transition helpers", () => {
  test("derives normalized progression state from the current program", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-state-current", {
      phaseIndex: 2,
      weekIndex: 3,
      cycleIndex: 4,
      totalWeekIndex: 7,
    });

    const state = deriveProgramProgressionState({
      currentProgram: current,
      complianceRate: 0.9,
      painFlag: false,
      fatigueFlag: false,
      movementQuality: 0.8,
      confidence: 0.8,
      capacity: 0.8,
    });

    expect(state.phaseIndex).toBe(2);
    expect(state.phaseWeekIndex).toBe(3);
    expect(state.cycleIndex).toBe(4);
    expect(state.totalWeekIndex).toBe(7);
    expect(state.trainingState.readiness).toBeGreaterThan(0);
  });

  test("next-phase evaluation preserves blocked pain-risk outcome", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-phase-blocked", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
    });
    const state = deriveProgramProgressionState({
      currentProgram: current,
      complianceRate: 1,
      painFlag: true,
      fatigueFlag: false,
      movementQuality: 0.2,
      confidence: 0.2,
      capacity: 0.2,
    });

    expect(
      evaluateNextPhaseProgression({
        currentProgram: current,
        progressionState: state,
        completedSessionsCount: baseQuestionnaire.daysPerWeek * 2,
        completedWeeksCount: 2,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "blocked",
      message: state.trainingState.reason,
    });
  });

  test("next-phase evaluation preserves completed-week and session gates", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-phase-gates", {
      phaseIndex: 1,
      weekIndex: 2,
      cycleIndex: 2,
      totalWeekIndex: 2,
    });
    const state = deriveProgramProgressionState({
      currentProgram: current,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      movementQuality: 0.9,
      confidence: 0.9,
      capacity: 0.9,
    });

    expect(
      evaluateNextPhaseProgression({
        currentProgram: current,
        progressionState: state,
        completedSessionsCount: baseQuestionnaire.daysPerWeek * 2,
        completedWeeksCount: 1,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "repeat",
      message: "Complete at least 2 full weeks before advancing to the next phase.",
    });

    expect(
      evaluateNextPhaseProgression({
        currentProgram: current,
        progressionState: state,
        completedSessionsCount: baseQuestionnaire.daysPerWeek,
        completedWeeksCount: 2,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "repeat",
      message: `Complete at least ${baseQuestionnaire.daysPerWeek * 2} sessions before advancing to the next phase.`,
    });
  });

  test("next-phase evaluation returns the expected target when advanced", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-phase-advanced", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
    });
    const state = deriveProgramProgressionState({
      currentProgram: current,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      movementQuality: 0.9,
      confidence: 0.9,
      capacity: 0.9,
    });

    expect(
      evaluateNextPhaseProgression({
        currentProgram: current,
        progressionState: state,
        completedSessionsCount: baseQuestionnaire.daysPerWeek * 2,
        completedWeeksCount: 2,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "advanced",
      target: {
        phaseIndex: 2,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 4,
      },
    });
  });

  test("next-cycle evaluation preserves session and compliance gates", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-cycle-gates", {
      phaseIndex: 1,
      weekIndex: 2,
      cycleIndex: 2,
      totalWeekIndex: 2,
    });
    const state = deriveProgramProgressionState({
      currentProgram: current,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      movementQuality: 0.8,
      confidence: 0.8,
      capacity: 0.8,
    });

    expect(
      evaluateNextCycleProgression({
        currentProgram: current,
        progressionState: state,
        complianceRate: 1,
        completedSessionsCount: 2,
        completedWeeksCount: 1,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "repeat",
      message: "Complete at least 3 sessions before starting the next cycle.",
    });

    expect(
      evaluateNextCycleProgression({
        currentProgram: current,
        progressionState: state,
        complianceRate: 0.8,
        completedSessionsCount: 3,
        completedWeeksCount: 1,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "repeat",
      message: "Hit at least 85% weekly compliance before advancing cycle.",
    });
  });

  test("next-cycle evaluation preserves blocked and advanced outcomes", () => {
    const blockedCurrent = generateWeeklyProgram(
      baseQuestionnaire,
      "progression-cycle-blocked-current",
      {
        phaseIndex: 1,
        weekIndex: 2,
        cycleIndex: 2,
        totalWeekIndex: 2,
      }
    );
    const blockedState = deriveProgramProgressionState({
      currentProgram: blockedCurrent,
      complianceRate: 1,
      painFlag: true,
      fatigueFlag: false,
      movementQuality: 0.2,
      confidence: 0.2,
      capacity: 0.2,
    });

    expect(
      evaluateNextCycleProgression({
        currentProgram: blockedCurrent,
        progressionState: blockedState,
        complianceRate: 1,
        completedSessionsCount: 3,
        completedWeeksCount: 1,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "blocked",
      message: "Address pain first before progressing.",
    });

    const advancedCurrent = generateWeeklyProgram(
      baseQuestionnaire,
      "progression-cycle-advanced-current",
      {
        phaseIndex: 1,
        weekIndex: 3,
        cycleIndex: 3,
        totalWeekIndex: 3,
      }
    );
    const advancedState = deriveProgramProgressionState({
      currentProgram: advancedCurrent,
      complianceRate: 1,
      painFlag: false,
      fatigueFlag: false,
      movementQuality: 0.9,
      confidence: 0.9,
      capacity: 0.9,
    });

    expect(
      evaluateNextCycleProgression({
        currentProgram: advancedCurrent,
        progressionState: advancedState,
        complianceRate: 1,
        completedSessionsCount: 3,
        completedWeeksCount: 3,
        minimumWeeksForPhaseAdvance: 2,
      })
    ).toEqual({
      status: "advanced",
      target: {
        phaseIndex: 2,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 4,
      },
    });
  });

  test("resolved generated transition state falls back to the planned target", () => {
    const current = generateWeeklyProgram(baseQuestionnaire, "progression-fallback-current", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
    });

    expect(
      resolveGeneratedProgramTransitionState({
        program: {
          ...current,
          phaseIndex: undefined,
          cycleIndex: undefined,
          weekIndex: undefined,
        },
        fallbackTarget: {
          phaseIndex: 2,
          cycleIndex: 1,
          weekIndex: 1,
          totalWeekIndex: 2,
        },
      })
    ).toEqual({
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
    });
  });
});
