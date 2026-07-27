import { describe, expect, test } from "vitest";
import { parseMacroCalculatorSavedInputs } from "@/lib/macroCalculatorInputs";

describe("parseMacroCalculatorSavedInputs", () => {
  test("accepts a complete saved payload", () => {
    const parsed = parseMacroCalculatorSavedInputs({
      weightLb: 180,
      heightIn: 70,
      age: 30,
      sex: "male",
      activityLevel: "moderate",
      goal: "maintain",
      updatedAt: "2026-07-26T00:00:00.000Z",
    });
    expect(parsed).toMatchObject({
      weightLb: 180,
      heightIn: 70,
      age: 30,
      sex: "male",
      activityLevel: "moderate",
      goal: "maintain",
    });
  });

  test("rejects incomplete or invalid payloads", () => {
    expect(parseMacroCalculatorSavedInputs(null)).toBeNull();
    expect(parseMacroCalculatorSavedInputs({ weightLb: 180 })).toBeNull();
    expect(
      parseMacroCalculatorSavedInputs({
        weightLb: 180,
        heightIn: 70,
        age: 30,
        sex: "other",
        activityLevel: "moderate",
        goal: "maintain",
      })
    ).toBeNull();
  });
});
