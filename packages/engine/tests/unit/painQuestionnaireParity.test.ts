import { describe, expect, test } from "vitest";
import { QUESTIONNAIRE_PAIN_DISPLAY_LABELS } from "@/lib/painModel";

describe("pain questionnaire parity", () => {
  test("shared display labels include Knees and the six supported areas", () => {
    expect(QUESTIONNAIRE_PAIN_DISPLAY_LABELS).toEqual([
      "Neck",
      "Upper back",
      "Lower back",
      "Shoulders",
      "Hips",
      "Knees",
    ]);
  });
});
