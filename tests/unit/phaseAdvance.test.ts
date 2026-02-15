import { describe, expect, test } from "vitest";
import {
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const baseData: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("phase progression changes program output", () => {
  test("phase 1 vs phase 2 routines differ", () => {
    const phase1 = generateWeeklyProgram(baseData, "p1", {
      phaseIndex: 1,
      weekIndex: 1,
    });
    const phase2 = generateWeeklyProgram(baseData, "p2", {
      phaseIndex: 2,
      weekIndex: 1,
    });

    expect(phase1.week[0].routine).not.toEqual(phase2.week[0].routine);
  });

  test("advance generates new program with next phase", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 3,
      totalWeekIndex: 3,
    });
    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "next",
    });

    expect(result.status).toBe("advanced");
    if (result.status === "advanced") {
      expect(result.program.id).toBe("next");
      expect(result.program.phaseIndex).toBe(2);
      expect(result.program.weekIndex).toBe(1);
      expect(result.program.cycleIndex).toBe(1);
    }
  });

  test("phase advance requires at least 2 weeks", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 1,
    });
    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 3,
      completedWeeksCount: 1,
      nextProgramId: "next",
    });

    expect(result.status).toBe("repeat");
  });

  test("cycle progression can trigger next phase when readiness is high", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
    });
    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 9,
      completedWeeksCount: 3,
      movementQuality: 0.85,
      confidence: 0.8,
      capacity: 0.8,
      nextProgramId: "next-cycle",
    });

    expect(result.status).toBe("advanced");
    if (result.status === "advanced") {
      expect(result.program.phaseIndex).toBe(2);
      expect(result.program.weekIndex).toBe(1);
      expect(result.program.cycleIndex).toBe(1);
      expect(result.program.totalWeekIndex).toBe(4);
    }
  });

  test("cycle progression repeats when fatigue risk is high", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 2,
      cycleIndex: 2,
    });
    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 0.8,
      fatigueFlag: true,
      nextProgramId: "next-cycle",
    });

    expect(result.status).toBe("repeat");
  });

  test("cycle progression requires full session count for current week target", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 2,
      cycleIndex: 2,
      totalWeekIndex: 2,
    });
    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 2,
      completedWeeksCount: 1,
      nextProgramId: "next-cycle",
    });

    expect(result.status).toBe("repeat");
  });

  test("next cycle advances to a materially different routine", () => {
    const current = generateWeeklyProgram(baseData, "current", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
    });
    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 3,
      completedWeeksCount: 1,
      nextProgramId: "next-cycle",
    });

    expect(result.status).toBe("advanced");
    if (result.status === "advanced") {
      expect(result.program.week).not.toEqual(current.week);
      const beforeIds = current.week.flatMap((day) =>
        day.routine.map((item) => item.exerciseId)
      );
      const afterIds = result.program.week.flatMap((day) =>
        day.routine.map((item) => item.exerciseId)
      );
      const changed = beforeIds.filter((id, index) => afterIds[index] !== id).length;
      expect(changed).toBeGreaterThanOrEqual(5);
      result.program.week.forEach((day) => {
        const ids = day.routine.map((item) => item.exerciseId);
        expect(new Set(ids).size).toBe(ids.length);
      });
    }
  });

  test("phase progression upgrades push demand when equipment allows", () => {
    const equippedData: QuestionnaireData = {
      ...baseData,
      equipment: ["dumbbells", "bench", "bands"],
      daysPerWeek: 3,
    };
    const current = generateWeeklyProgram(equippedData, "current", {
      phaseIndex: 1,
      weekIndex: 3,
      totalWeekIndex: 3,
    });
    current.week[0].routine[2] = {
      ...current.week[0].routine[2],
      exerciseId: "incline-pushup",
      loadType: "bodyweight",
    };

    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: equippedData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "next-push-upgrade",
    });

    expect(result.status).toBe("advanced");
    if (result.status === "advanced") {
      const ids = result.program.week.flatMap((day) =>
        day.routine.map((item) => item.exerciseId)
      );
      expect(
        ids.some((id) =>
          ["dumbbell-floor-press", "dumbbell-bench-press", "dumbbell-chest-fly"].includes(id)
        )
      ).toBe(true);
    }
  });

  test("manual phase advance does not create phase 4", () => {
    const current = generateWeeklyProgram(baseData, "phase3-current", {
      phaseIndex: 3,
      weekIndex: 6,
      cycleIndex: 3,
      totalWeekIndex: 6,
    });
    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 18,
      completedWeeksCount: 6,
      nextProgramId: "phase4-attempt",
    });

    expect(result.status).toBe("repeat");
  });

  test("phase 3 progression continues through cycles instead of phase 4", () => {
    const current = generateWeeklyProgram(baseData, "phase3-cycle", {
      phaseIndex: 3,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 7,
    });
    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: baseData,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 21,
      completedWeeksCount: 7,
      movementQuality: 0.9,
      confidence: 0.85,
      capacity: 0.85,
      nextProgramId: "phase3-next-cycle",
    });

    expect(result.status).toBe("advanced");
    if (result.status === "advanced") {
      expect(result.program.phaseIndex).toBe(3);
      expect(result.program.cycleIndex).toBe(4);
      expect(result.program.weekIndex).toBe(4);
    }
  });
});
