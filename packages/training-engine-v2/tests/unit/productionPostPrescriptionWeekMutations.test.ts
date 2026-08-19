import { describe, expect, it } from "vitest";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS,
  PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS,
  runProductionPostPrescriptionWeekMetamorphicSuite,
  runProductionPostPrescriptionWeekMutationSuite,
} from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week semantic defenses", () => {
  it("rejects every real semantic mutation without reading its name", () => {
    const mutations = runProductionPostPrescriptionWeekMutationSuite();
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS).toHaveLength(57);
    expect(mutations).toMatchObject({
      mutationCount: 57,
      rejectedCount: 57,
      semanticMutationCount: 57,
      nameBasedRejectionCount: 0,
      acceptedDownstreamRescueCount: 0,
      result: "PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS_REJECTED",
    });
    expect(mutations.results.every((result) => result.reasonCodes.length > 0)).toBe(true);
  });

  it("proves 18 invariants and 13 material responses", () => {
    const metamorphic = runProductionPostPrescriptionWeekMetamorphicSuite();
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS).toHaveLength(18);
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES).toHaveLength(13);
    expect(metamorphic).toMatchObject({
      invariantCount: 18,
      invariantFailureCount: 0,
      materialResponseCount: 13,
      materialResponseFailureCount: 0,
      result: "PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_EVIDENCE_PASSED",
    });
  });
});
