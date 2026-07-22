import { describe, expect, test, vi } from "vitest";
import {
  composeSelectionRngSeedToken,
  composeWeeklyDeterministicSelectionSeed,
  composeWeeklyDeterministicSelectionSeedBase,
  finalizeGenerationVariationSnapshot,
  resolveVariationPoseFocusTags,
} from "@/lib/program/variationRuntime";

describe("variation runtime helpers", () => {
  test("resolveVariationPoseFocusTags normalizes and sorts derived pose tags", () => {
    expect(
      resolveVariationPoseFocusTags({
        poseAnalysis: { id: "pose" },
        assessmentReport: { id: "report" },
        resolvePoseAnalysisFromSources: ({ poseAnalysis }) => poseAnalysis,
        derivePoseFocus: () => ({
          focusTags: ["Thoracic Extension", "scapular-control", "Forward Head"],
          reasons: {},
          status: "ok" as const,
        }),
        normalizeTagToken: (value) =>
          value
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_"),
      })
    ).toEqual(["forward_head", "scapular_control", "thoracic_extension"]);
  });

  test("seed helpers preserve exact weekly seed composition behavior", () => {
    expect(
      composeSelectionRngSeedToken({
        baseSeed: "seed-a",
        variationState: { enabled: true, seedKey: "var-1" },
      })
    ).toBe("seed-a|var-1");
    expect(
      composeSelectionRngSeedToken({
        baseSeed: undefined,
        variationState: { enabled: true, seedKey: "var-1" },
      })
    ).toBe("var-1");

    const baseSeed = composeWeeklyDeterministicSelectionSeedBase({
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 3,
      totalWeekIndex: 5,
      daysPerWeek: 4,
      goal: "General fitness",
      experience: "Intermediate",
      availableEquipment: new Set(["bench", "dumbbells"]),
      painAreas: ["Shoulders"],
      normalizeTagToken: (value) =>
        value
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_"),
      normalizeExperienceLevel: (value) => value.toLowerCase(),
    });

    expect(baseSeed).toBe(
      "weekly|2|1|3|5|4|general_fitness|intermediate|bench,dumbbells|shoulders"
    );
    expect(
      composeWeeklyDeterministicSelectionSeed({
        baseSeed,
        variationState: { enabled: true, seedKey: "variety|key" },
      })
    ).toBe(`${baseSeed}|variation:variety|key`);
  });

  test("finalizeGenerationVariationSnapshot delegates snapshot commit without altering payload", () => {
    const commitVariationSnapshot = vi.fn();
    const week = [
      {
        dayIndex: 0,
        title: "Back + Chest",
        focusTags: [],
        routine: [],
      },
    ];
    const variationState = { enabled: true, seedKey: "var-1" };

    finalizeGenerationVariationSnapshot({
      variationState,
      week,
      commitVariationSnapshot,
    });

    expect(commitVariationSnapshot).toHaveBeenCalledWith(variationState, week);
  });
});
