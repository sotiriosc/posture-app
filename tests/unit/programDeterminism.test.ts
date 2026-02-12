import { describe, expect, test } from "vitest";
import {
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const input: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands"],
  daysPerWeek: 4,
};

const comparableWeek = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.map((day) => ({
    dayIndex: day.dayIndex,
    title: day.title,
    routine: day.routine.map((item) => ({
      exerciseId: item.exerciseId,
      section: item.section,
      sets: item.sets,
      reps: item.reps,
      restSec: item.restSec,
      loadType: item.loadType,
    })),
  }));

describe("program determinism", () => {
  test("same questionnaire + options yields stable weekly structure", () => {
    const a = generateWeeklyProgram(input, "det-a", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
    });
    const b = generateWeeklyProgram(input, "det-b", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
    });

    expect(comparableWeek(a)).toEqual(comparableWeek(b));
    expect(a.daysPerWeek).toBe(b.daysPerWeek);
    expect(a.phaseName).toBe(b.phaseName);
  });

  test("next-cycle generation is deterministic from same state and signals", () => {
    const current = generateWeeklyProgram(input, "det-current", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
    });

    const run = (nextProgramId: string) =>
      generateNextCycleProgram({
        currentProgram: current,
        questionnaire: input,
        painFlag: false,
        complianceRate: 1,
        fatigueFlag: false,
        completedSessionsCount: input.daysPerWeek,
        completedWeeksCount: 1,
        nextProgramId,
      });

    const a = run("det-next-a");
    const b = run("det-next-b");
    expect(a.status).toBe(b.status);
    if (a.status === "advanced" && b.status === "advanced") {
      expect(comparableWeek(a.program)).toEqual(comparableWeek(b.program));
      expect(a.program.phaseOptimizerReport?.summary).toBe(
        b.program.phaseOptimizerReport?.summary
      );
    }
  });

  test("next-phase generation is deterministic from same state and signals", () => {
    const current = generateWeeklyProgram(input, "det-phase-current", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
    });

    const run = (nextProgramId: string) =>
      generateNextPhaseProgram({
        currentProgram: current,
        questionnaire: input,
        painFlag: false,
        complianceRate: 1,
        fatigueFlag: false,
        completedSessionsCount: input.daysPerWeek * 2,
        completedWeeksCount: 2,
        nextProgramId,
      });

    const a = run("det-phase-a");
    const b = run("det-phase-b");
    expect(a.status).toBe(b.status);
    if (a.status === "advanced" && b.status === "advanced") {
      expect(comparableWeek(a.program)).toEqual(comparableWeek(b.program));
      expect(a.program.phaseOptimizerReport?.changedSlots).toBe(
        b.program.phaseOptimizerReport?.changedSlots
      );
    }
  });
});
