import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises } from "@/lib/exercises";
import { evaluateHardPainExclusion, isHardExcludedByPain } from "@/lib/painModel";
import { generateWeeklyProgram } from "@/lib/program";

const baseQ = (painAreas: string[]): QuestionnaireData => ({
  goals: "General fitness",
  painAreas,
  experience: "Beginner",
  equipment: ["gym", "dumbbells", "machines"],
  daysPerWeek: 3,
});

const allRoutineIds = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));

describe("painHardExclusion — structured gate", () => {
  test("machine-leg-press is hard-excluded for Knees via structured knees token", () => {
    const ex = exerciseById("machine-leg-press");
    expect(ex).toBeTruthy();
    expect(ex!.painContraindications).toContain("knees");
    const result = evaluateHardPainExclusion(ex!, ["Knees"]);
    expect(result.excluded).toBe(true);
    expect(result.via).toBe("structured");
  });

  test("goblet-squat acute knees is soft; machine-leg-press knees remains hard", () => {
    const goblet = exerciseById("goblet-squat");
    expect(goblet).toBeTruthy();
    expect(goblet!.painContraindications).toContain("acute knees");
    expect(isHardExcludedByPain(goblet!, ["knees"])).toBe(false);

    const press = exerciseById("machine-leg-press");
    expect(press).toBeTruthy();
    expect(isHardExcludedByPain(press!, ["knees"])).toBe(true);
  });

  test("generated program never includes hard-contraindicated exercises for Knees", () => {
    const program = generateWeeklyProgram(baseQ(["Knees"]), "pain-hard-knees", {
      phaseIndex: 1,
      seed: "pain-hard-knees",
    });
    const ids = allRoutineIds(program);
    for (const id of ids) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(
        isHardExcludedByPain(ex, ["Knees"]),
        `program included hard-excluded ${id}`
      ).toBe(false);
    }
  });

  test("alias Knees / knee / knees produce equivalent hard-exclusion sets", () => {
    const seeds = ["Knees", "knee", "knees"] as const;
    const excludedSets = seeds.map((label) => {
      const set = new Set<string>();
      for (const ex of exercises) {
        if (isHardExcludedByPain(ex, [label])) set.add(ex.id);
      }
      return [...set].sort();
    });
    expect(excludedSets[0]).toEqual(excludedSets[1]);
    expect(excludedSets[1]).toEqual(excludedSets[2]);
  });

  test("determinism: same seed + Knees yields identical routine ids", () => {
    const a = generateWeeklyProgram(baseQ(["Knees"]), "pain-det-a", {
      phaseIndex: 1,
      seed: "pain-det-shared",
    });
    const b = generateWeeklyProgram(baseQ(["Knees"]), "pain-det-b", {
      phaseIndex: 1,
      seed: "pain-det-shared",
    });
    expect(allRoutineIds(a)).toEqual(allRoutineIds(b));
  });

  test("multi-area shoulders + knees still never hard-excludes violations", () => {
    const program = generateWeeklyProgram(
      baseQ(["Shoulders", "Knees"]),
      "pain-multi-sk",
      { phaseIndex: 1, seed: "pain-multi-sk" }
    );
    for (const id of allRoutineIds(program)) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(isHardExcludedByPain(ex, ["Shoulders", "Knees"])).toBe(false);
    }
  });

  test("unknown + known area: generation still succeeds and respects known hard excludes", () => {
    const program = generateWeeklyProgram(
      baseQ(["Knees", "not-a-real-area"]),
      "pain-unknown-known",
      { phaseIndex: 1, seed: "pain-unknown-known" }
    );
    expect(program.week.length).toBeGreaterThan(0);
    for (const id of allRoutineIds(program)) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(isHardExcludedByPain(ex, ["Knees"])).toBe(false);
    }
  });
});
