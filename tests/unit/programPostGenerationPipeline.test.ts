import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program } from "@/lib/types";
import {
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";

const weeklyInput: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands", "bench"],
  daysPerWeek: 4,
};

const comparableProgramView = (program: Program) => ({
  week: program.week.map((day) => ({
    title: day.title,
    routine: day.routine.map((item) => ({
      exerciseId: item.exerciseId,
      section: item.section,
      sets: item.sets,
      reps: item.reps,
      restSec: item.restSec,
      loadType: item.loadType,
    })),
    warmup: day.warmup?.items.map((item) => item.id) ?? [],
    activation: day.activation?.items.map((item) => item.id) ?? [],
    cooldown: day.cooldown?.items.map((item) => item.id) ?? [],
  })),
  nextWeekPlan: program.nextWeekPlan,
  phaseOptimizerReport: program.phaseOptimizerReport,
});

const expectEnrichedValidWeek = (program: Program) => {
  expect(program.phase).toBeTruthy();
  expect(program.nextWeekPlan).toBeTruthy();
  expect(program.movementProfile).toBeTruthy();
  expect(program.phaseObjective).toBeTruthy();
  expect(program.sessionAdaptation).toBeTruthy();

  program.week.forEach((day) => {
    expect(day.warmup?.items.length ?? 0).toBeGreaterThan(0);
    expect(day.activation?.items.length ?? 0).toBeGreaterThan(0);
    expect(day.cooldown?.items.length ?? 0).toBeGreaterThan(0);

    const routineIds = day.routine.map((item) => item.exerciseId);
    expect(new Set(routineIds).size).toBe(routineIds.length);
  });
};

describe("post-generation pipeline regression", () => {
  test("weekly generation still returns a valid enriched week", () => {
    const program = generateWeeklyProgram(weeklyInput, "pipeline-weekly", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 2,
      totalWeekIndex: 2,
      seed: "pipeline-weekly",
    });

    expectEnrichedValidWeek(program);
  });

  test("next-cycle progression remains deterministic and enriched after repairs", () => {
    const current = generateWeeklyProgram(weeklyInput, "pipeline-cycle-current", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "pipeline-cycle-current",
    });

    const run = (nextProgramId: string) =>
      generateNextCycleProgram({
        currentProgram: current,
        questionnaire: weeklyInput,
        painFlag: false,
        complianceRate: 1,
        fatigueFlag: false,
        completedSessionsCount: weeklyInput.daysPerWeek,
        completedWeeksCount: 1,
        movementQuality: 0.85,
        confidence: 0.85,
        capacity: 0.85,
        nextProgramId,
        seed: "pipeline-cycle-next",
      });

    const a = run("pipeline-cycle-a");
    const b = run("pipeline-cycle-b");

    expect(a.status).toBe("advanced");
    expect(b.status).toBe("advanced");
    if (a.status !== "advanced" || b.status !== "advanced") return;

    expect(comparableProgramView(a.program)).toEqual(comparableProgramView(b.program));
    expect(a.program.nextWeekPlan?.summary).toBeTruthy();
    expect(a.program.phaseOptimizerReport?.summary).toBeTruthy();
    expect(a.program.phaseOptimizerReport?.changedSlots).toBeGreaterThanOrEqual(0);
    expectEnrichedValidWeek(a.program);
  });

  test("next-phase progression still keeps downstream repairs and enrichment", () => {
    const current = generateWeeklyProgram(weeklyInput, "pipeline-phase-current", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
      seed: "pipeline-phase-current",
    });

    const run = (nextProgramId: string) =>
      generateNextPhaseProgram({
        currentProgram: current,
        questionnaire: weeklyInput,
        painFlag: false,
        complianceRate: 1,
        fatigueFlag: false,
        completedSessionsCount: weeklyInput.daysPerWeek * 2,
        completedWeeksCount: 2,
        nextProgramId,
        seed: "pipeline-phase-next",
      });

    const a = run("pipeline-phase-a");
    const b = run("pipeline-phase-b");

    expect(a.status).toBe("advanced");
    expect(b.status).toBe("advanced");
    if (a.status !== "advanced" || b.status !== "advanced") return;

    expect(comparableProgramView(a.program)).toEqual(comparableProgramView(b.program));
    expect(a.program.nextWeekPlan?.summary).toBeTruthy();
    expect(a.program.phaseOptimizerReport?.summary).toBeTruthy();
    expect(a.program.phaseOptimizerReport?.changedSlots).toBeGreaterThanOrEqual(0);
    expectEnrichedValidWeek(a.program);
  });

  test("next-phase progression can still return blocked when pain risk is high", () => {
    const current = generateWeeklyProgram(weeklyInput, "pipeline-phase-block-current", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 3,
      totalWeekIndex: 3,
      seed: "pipeline-phase-block-current",
    });

    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: weeklyInput,
      painFlag: true,
      complianceRate: 1,
      fatigueFlag: false,
      movementQuality: 0.2,
      confidence: 0.2,
      capacity: 0.2,
      completedSessionsCount: weeklyInput.daysPerWeek * 2,
      completedWeeksCount: 2,
      nextProgramId: "pipeline-phase-blocked",
      seed: "pipeline-phase-blocked",
    });

    expect(result.status).toBe("blocked");
  });
});
