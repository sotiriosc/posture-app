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

  test("generation remains deterministic across pain/equipment/capability/phase matrix", () => {
    const scenarios: Array<{
      id: string;
      input: QuestionnaireData;
      phaseIndex: 1 | 2 | 3;
      cycleIndex: number;
      weekIndex: number;
      totalWeekIndex: number;
    }> = [
      {
        id: "none-beginner-p1",
        input: {
          goals: "Improve posture",
          painAreas: [],
          experience: "Beginner",
          equipment: ["none"],
          daysPerWeek: 3,
        },
        phaseIndex: 1,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 1,
      },
      {
        id: "bands-pain-p3",
        input: {
          goals: "Reduce pain",
          painAreas: ["Shoulders", "Lower back"],
          experience: "Beginner",
          equipment: ["bands"],
          daysPerWeek: 3,
        },
        phaseIndex: 3,
        cycleIndex: 2,
        weekIndex: 2,
        totalWeekIndex: 4,
      },
      {
        id: "mixed-equip-p2",
        input: {
          goals: "General fitness",
          painAreas: ["Hips"],
          experience: "Intermediate",
          equipment: ["dumbbells", "bands"],
          daysPerWeek: 4,
        },
        phaseIndex: 2,
        cycleIndex: 2,
        weekIndex: 1,
        totalWeekIndex: 3,
      },
      {
        id: "loaded-advanced-p3",
        input: {
          goals: "Athletic performance",
          painAreas: [],
          experience: "Advanced",
          equipment: ["dumbbells", "bands", "bench"],
          daysPerWeek: 5,
        },
        phaseIndex: 3,
        cycleIndex: 3,
        weekIndex: 2,
        totalWeekIndex: 7,
      },
    ];

    scenarios.forEach((scenario) => {
      const a = generateWeeklyProgram(scenario.input, `${scenario.id}-a`, {
        phaseIndex: scenario.phaseIndex,
        cycleIndex: scenario.cycleIndex,
        weekIndex: scenario.weekIndex,
        totalWeekIndex: scenario.totalWeekIndex,
      });
      const b = generateWeeklyProgram(scenario.input, `${scenario.id}-b`, {
        phaseIndex: scenario.phaseIndex,
        cycleIndex: scenario.cycleIndex,
        weekIndex: scenario.weekIndex,
        totalWeekIndex: scenario.totalWeekIndex,
      });

      expect(comparableWeek(a)).toEqual(comparableWeek(b));
      expect(a.phaseIndex).toBe(b.phaseIndex);
      expect(a.daysPerWeek).toBe(b.daysPerWeek);
    });
  });
});
