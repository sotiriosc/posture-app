import { describe, expect, test } from "vitest";
import {
  ACTIVITY_MULTIPLIERS,
  calculateMacros,
  isValidMacroCalculatorInput,
  MACRO_INPUT_BOUNDS,
} from "@/tools/macroCalculator";

/**
 * Phase 6f, Commit 9 — /tools/macro-calculator math correctness.
 * Expected values below are the Mifflin-St Jeor BMR + activity-multiplier
 * TDEE + goal adjustment + (1.8 g/kg protein, 25% fat, remainder carbs)
 * split, computed independently and pinned here as a contract.
 */
describe("calculateMacros", () => {
  test("180 lb male, 70 in, 30 yo, moderate activity, maintain", () => {
    expect(
      calculateMacros({
        weightLb: 180,
        heightIn: 70,
        age: 30,
        sex: "male",
        activityLevel: "moderate",
        goal: "maintain",
      })
    ).toEqual({
      bmr: 1783,
      tdee: 2763,
      calories: 2763,
      proteinG: 147,
      carbsG: 371,
      fatG: 77,
    });
  });

  test("150 lb female, 65 in, 25 yo, light activity, lose fat", () => {
    expect(
      calculateMacros({
        weightLb: 150,
        heightIn: 65,
        age: 25,
        sex: "female",
        activityLevel: "light",
        goal: "lose",
      })
    ).toEqual({
      bmr: 1426,
      tdee: 1961,
      calories: 1461,
      proteinG: 122,
      carbsG: 151,
      fatG: 41,
    });
  });

  test("200 lb male, 72 in, 22 yo, active, build muscle", () => {
    expect(
      calculateMacros({
        weightLb: 200,
        heightIn: 72,
        age: 22,
        sex: "male",
        activityLevel: "active",
        goal: "build",
      })
    ).toEqual({
      bmr: 1945,
      tdee: 3355,
      calories: 3655,
      proteinG: 163,
      carbsG: 521,
      fatG: 102,
    });
  });

  test("a small, older, sedentary person on 'lose' is floored at 1200 calories rather than going lower", () => {
    const result = calculateMacros({
      weightLb: 70,
      heightIn: 48,
      age: 70,
      sex: "female",
      activityLevel: "sedentary",
      goal: "lose",
    });
    expect(result.calories).toBe(1200);
    expect(result.tdee).toBeLessThan(1200);
  });

  test("the macro split is moderate fat / high carb / high protein: fat is ~25% of calories and carbs are the largest macro by calories", () => {
    const result = calculateMacros({
      weightLb: 180,
      heightIn: 70,
      age: 30,
      sex: "male",
      activityLevel: "moderate",
      goal: "maintain",
    });
    const fatCalories = result.fatG * 9;
    const proteinCalories = result.proteinG * 4;
    const carbCalories = result.carbsG * 4;

    expect(fatCalories / result.calories).toBeCloseTo(0.25, 1);
    expect(carbCalories).toBeGreaterThan(proteinCalories);
    expect(carbCalories).toBeGreaterThan(fatCalories);
    // Total macro calories reconcile with the calorie target (within rounding).
    expect(fatCalories + proteinCalories + carbCalories).toBeCloseTo(result.calories, -1);
  });

  test("every activity multiplier increases TDEE relative to sedentary", () => {
    const base = {
      weightLb: 180,
      heightIn: 70,
      age: 30,
      sex: "male" as const,
      goal: "maintain" as const,
    };
    const sedentary = calculateMacros({ ...base, activityLevel: "sedentary" });
    (Object.keys(ACTIVITY_MULTIPLIERS) as Array<keyof typeof ACTIVITY_MULTIPLIERS>)
      .filter((level) => level !== "sedentary")
      .forEach((level) => {
        const result = calculateMacros({ ...base, activityLevel: level });
        expect(result.tdee).toBeGreaterThan(sedentary.tdee);
      });
  });

  test("build > maintain > lose in calorie output for otherwise-identical inputs", () => {
    const base = {
      weightLb: 180,
      heightIn: 70,
      age: 30,
      sex: "male" as const,
      activityLevel: "moderate" as const,
    };
    const lose = calculateMacros({ ...base, goal: "lose" });
    const maintain = calculateMacros({ ...base, goal: "maintain" });
    const build = calculateMacros({ ...base, goal: "build" });
    expect(build.calories).toBeGreaterThan(maintain.calories);
    expect(maintain.calories).toBeGreaterThan(lose.calories);
  });
});

describe("isValidMacroCalculatorInput", () => {
  const valid = {
    weightLb: 180,
    heightIn: 70,
    age: 30,
    sex: "male" as const,
    activityLevel: "moderate" as const,
    goal: "maintain" as const,
  };

  test("a fully valid input is accepted", () => {
    expect(isValidMacroCalculatorInput(valid)).toBe(true);
  });

  test("weight below or above bounds is rejected", () => {
    expect(
      isValidMacroCalculatorInput({ ...valid, weightLb: MACRO_INPUT_BOUNDS.weightLb.min - 1 })
    ).toBe(false);
    expect(
      isValidMacroCalculatorInput({ ...valid, weightLb: MACRO_INPUT_BOUNDS.weightLb.max + 1 })
    ).toBe(false);
  });

  test("height below or above bounds is rejected", () => {
    expect(
      isValidMacroCalculatorInput({ ...valid, heightIn: MACRO_INPUT_BOUNDS.heightIn.min - 1 })
    ).toBe(false);
    expect(
      isValidMacroCalculatorInput({ ...valid, heightIn: MACRO_INPUT_BOUNDS.heightIn.max + 1 })
    ).toBe(false);
  });

  test("age below or above bounds is rejected", () => {
    expect(isValidMacroCalculatorInput({ ...valid, age: MACRO_INPUT_BOUNDS.age.min - 1 })).toBe(
      false
    );
    expect(isValidMacroCalculatorInput({ ...valid, age: MACRO_INPUT_BOUNDS.age.max + 1 })).toBe(
      false
    );
  });

  test("a missing or invalid sex/activityLevel/goal is rejected", () => {
    expect(isValidMacroCalculatorInput({ ...valid, sex: "other" })).toBe(false);
    expect(isValidMacroCalculatorInput({ ...valid, activityLevel: "extreme" })).toBe(false);
    expect(isValidMacroCalculatorInput({ ...valid, goal: "shred" })).toBe(false);
  });

  test("non-numeric or missing numeric fields are rejected rather than throwing", () => {
    expect(isValidMacroCalculatorInput({ ...valid, weightLb: undefined })).toBe(false);
    expect(isValidMacroCalculatorInput({ ...valid, weightLb: Number.NaN })).toBe(false);
    expect(isValidMacroCalculatorInput({})).toBe(false);
  });
});
