import { describe, expect, it } from "vitest";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  hasEquipmentCapability,
  validateAssessmentSignal,
  type AssessmentSignal,
  type PainAndInjuryState,
} from "../../src";

describe("equipment, assessment, and pain primitives", () => {
  it("represents real equipment capabilities instead of broad labels only", () => {
    expect(hasEquipmentCapability(FULL_GYM_EQUIPMENT, "selectorized_machine")).toBe(true);
    expect(hasEquipmentCapability(FULL_GYM_EQUIPMENT, "adjustable_bench")).toBe(true);

    expect(hasEquipmentCapability(DUMBBELLS_NO_BENCH_EQUIPMENT, "dumbbells")).toBe(true);
    expect(hasEquipmentCapability(DUMBBELLS_NO_BENCH_EQUIPMENT, "flat_bench")).toBe(false);

    expect(hasEquipmentCapability(ANCHORED_BANDS_EQUIPMENT, "band_anchor_high")).toBe(true);
    expect(hasEquipmentCapability(BANDS_WITHOUT_ANCHOR_EQUIPMENT, "tube_band")).toBe(true);
    expect(hasEquipmentCapability(BANDS_WITHOUT_ANCHOR_EQUIPMENT, "band_anchor_mid")).toBe(false);

    expect(hasEquipmentCapability(BODYWEIGHT_EQUIPMENT, "bodyweight")).toBe(true);
    expect(hasEquipmentCapability(BODYWEIGHT_EQUIPMENT, "cable_stack")).toBe(false);
  });

  it("keeps assessment confidence and priority inspectable", () => {
    const lowConfidenceBlocking: AssessmentSignal = {
      id: "low-confidence-blocking",
      type: "mobility_finding",
      source: "photo_assessment",
      confidence: "low",
      priority: "blocking",
      region: "shoulder",
      description: "Low confidence finding should trigger review before becoming a hard blocker.",
    };

    expect(validateAssessmentSignal(lowConfidenceBlocking)).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "low_confidence_blocking_signal",
      }),
    ]);
  });

  it("distinguishes discomfort, contraindication, and personal block", () => {
    const painState: PainAndInjuryState = {
      ...NO_PAIN_OR_INJURY,
      currentDiscomforts: [
        {
          kind: "current_discomfort",
          id: "mild-shoulder",
          region: "shoulder",
          severity0To10: 2,
          stressTags: ["overhead_pressing"],
          effect: "prefer_support",
          description: "Mild discomfort should influence suitability and prescription.",
        },
      ],
      hardContraindications: [
        {
          kind: "hard_contraindication",
          id: "no-loaded-spinal-flexion",
          stressTags: ["loaded_spinal_flexion"],
          reason: "Clinician-directed contraindication.",
          source: "clinician",
        },
      ],
      personalExerciseBlocks: [
        {
          kind: "personal_exercise_block",
          id: "no-push-up",
          exerciseIds: ["push-up"],
          reason: "Athlete preference block.",
          createdBy: "athlete",
        },
      ],
    };

    expect(painState.currentDiscomforts[0].kind).toBe("current_discomfort");
    expect(painState.hardContraindications[0].source).toBe("clinician");
    expect(painState.personalExerciseBlocks[0].kind).toBe("personal_exercise_block");
  });
});
