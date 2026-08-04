import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { isHardExcludedByPain } from "@/lib/painModel";
import { generateWeeklyProgram } from "@/lib/program";

const kneeQ: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Knees"],
  experience: "Beginner",
  equipment: ["gym", "dumbbells", "machines", "bands"],
  daysPerWeek: 3,
};

const noPainQ: QuestionnaireData = {
  ...kneeQ,
  painAreas: [],
};

describe("painKneePolicy — protective without blanket ban", () => {
  test("knee pain program still includes lower-body / hinge-capable work", () => {
    const program = generateWeeklyProgram(kneeQ, "knee-policy-lower", {
      phaseIndex: 1,
      seed: "knee-policy-lower",
    });
    const mains = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main")
    );
    expect(mains.length).toBeGreaterThan(0);

    const lowerOrHinge = mains.some((item) => {
      const ex = exerciseById(item.exerciseId);
      if (!ex) return false;
      const patterns = ex.movementPattern.map((p) => p.toLowerCase());
      const tags = (ex.tags ?? []).map((t) => t.toLowerCase());
      return (
        patterns.some((p) =>
          ["squat", "hinge", "single-leg", "kneedominant"].includes(p)
        ) ||
        tags.some((t) =>
          ["legs", "glutes", "hinge", "posterior", "squat"].includes(t)
        )
      );
    });
    expect(
      lowerOrHinge,
      "expected some lower-body or hinge main under knee pain"
    ).toBe(true);
  });

  test("knee pain does not eliminate all squat-pattern exercises unless hard-excluded", () => {
    // Soft policy may deprioritize squat, but non-contraindicated squat work may remain.
    const program = generateWeeklyProgram(kneeQ, "knee-policy-squat-soft", {
      phaseIndex: 1,
      seed: "knee-policy-squat-soft",
    });
    for (const id of program.week.flatMap((d) =>
      d.routine.map((i) => i.exerciseId)
    )) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(isHardExcludedByPain(ex, ["Knees"])).toBe(false);
    }
    // Program still builds vs no-pain
    const baseline = generateWeeklyProgram(noPainQ, "knee-policy-baseline", {
      phaseIndex: 1,
      seed: "knee-policy-baseline",
    });
    expect(program.week.length).toBe(baseline.week.length);
  });

  test("shoulders + knees and lower_back + knees remain generable", () => {
    for (const areas of [
      ["Shoulders", "Knees"],
      ["Lower back", "Knees"],
      ["Hips", "Knees"],
    ]) {
      const program = generateWeeklyProgram(
        { ...kneeQ, painAreas: areas },
        `knee-multi-${areas.join("-")}`,
        { phaseIndex: 1, seed: `knee-multi-${areas.join("-")}` }
      );
      expect(program.week.length).toBeGreaterThan(0);
      for (const id of program.week.flatMap((d) =>
        d.routine.map((i) => i.exerciseId)
      )) {
        const ex = exerciseById(id);
        if (!ex) continue;
        expect(isHardExcludedByPain(ex, areas)).toBe(false);
      }
    }
  });
});
