import { describe, expect, it } from "vitest";
import { CONTROLLED_PRODUCT_SHADOW_CLASSIFICATION, CONTROLLED_PRODUCT_SHADOW_PRODUCT_AUTHORITY,
  CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES, createControlledProductShadowComparison,
  validateControlledProductShadowCounterfactualAttribution } from "../../src/productShadow";

describe("controlled Product shadow pure boundary", () => {
  it("keeps Product authority legacy-only with a closed status vocabulary", () => {
    expect(CONTROLLED_PRODUCT_SHADOW_CLASSIFICATION).toBe(
      "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION");
    expect(CONTROLLED_PRODUCT_SHADOW_PRODUCT_AUTHORITY).toBe("LEGACY_PRODUCT_OUTPUT_ONLY");
    expect(CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES).toHaveLength(22);
  });

  it("hard-rejects counterfactual performance, dose, sequence, tolerance, adaptation, and superiority claims", () => {
    const result = validateControlledProductShadowCounterfactualAttribution({ deliveredLegacyProgramId: "legacy",
      shadowProgramId: "shadow", productPerformanceProgramId: "shadow",
      legacyExerciseLogPrescriptionRevisionId: "shadow-prescription",
      legacySessionSequenceRevisionId: "shadow-sequence", shadowSourceEventCompleted: true,
      unmappedLegacyToleranceCreditedToShadow: true, productOutcomeAuthorizesShadowAdaptation: true,
      outcomeSuperiorityClaimed: true });
    expect(result.valid).toBe(false);
    expect(result.reasonCodes).toContain("SHADOW_COUNTERFACTUAL_MISATTRIBUTED_AS_PERFORMED");
    expect(result.shadowPerformanceCreditCount).toBe(0);
  });

  it("selects the earliest meaningful difference without a weighted better score", () => {
    const comparison = createControlledProductShadowComparison({ runId: "run-1",
      legacyProgramRevisionId: "legacy-1", v2ProgramRevisionId: "v2-1", gate14Compatibility: "partial",
      unresolvedMappings: [], provenance: ["fixture"], dimensions: [
        { dimension: "reps_tempo", state: "different", legacyReferences: [], v2References: [], reasonCodes: [] },
        { dimension: "weekly_responsibility", state: "different", legacyReferences: [], v2References: [], reasonCodes: [] },
      ] });
    expect(comparison.firstMeaningfulDifference).toBe("weekly_responsibility");
    expect(comparison.weightedBetterScore).toBeNull();
    expect(comparison.outcomeSuperiorityClaimed).toBe(false);
  });
});
