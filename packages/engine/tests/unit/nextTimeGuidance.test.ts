import { describe, expect, test } from "vitest";
import { generateNextTimeGuidance } from "@/lib/progression";

describe("next time guidance mapping", () => {
  test("pain moderate/severe overrides all other guidance", () => {
    const output = generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 10,
      difficulty: "easy",
      painLevel: "severe",
    });
    expect(output).toBe("Next time: reduce range + use lighter load.");
  });

  test("hard or failed triggers reduction guidance", () => {
    const hardOutput = generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 8,
      actualSets: 3,
      actualRepsPerSet: 8,
      difficulty: "hard",
      painLevel: "none",
    });
    expect(hardOutput).toBe("Next time: reduce load 5-10% or drop 1 set.");

    const failedOutput = generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 8,
      actualSets: 2,
      actualRepsPerSet: 7,
      difficulty: "failed",
      painLevel: "none",
    });
    expect(failedOutput).toBe("Next time: reduce load 5-10% or drop 1 set.");
  });

  test("easy + hit target suggests increase", () => {
    const output = generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 10,
      difficulty: "easy",
      painLevel: "none",
    });
    expect(output).toBe("Next time: add small load or reps.");
  });

  test("rep overshoot suggests dynamic load increase percentage", () => {
    const output = generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 8,
      actualSets: 3,
      actualRepsPerSet: 30,
      difficulty: "moderate",
      painLevel: "none",
    });
    expect(output).toBe(
      "Next time: add 20% weight and work in the 8-10 rep range."
    );
  });

  test("moderate + under target suggests adding reps at same load", () => {
    const output = generateNextTimeGuidance({
      loadType: "bodyweight",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 8,
      difficulty: "moderate",
      painLevel: "none",
    });
    expect(output).toBe("Next time: keep load, aim for +2 reps total.");
  });
});
