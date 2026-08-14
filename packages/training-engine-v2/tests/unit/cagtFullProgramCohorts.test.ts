import { describe, expect, it } from "vitest";
import {
  fullProgramCoverageEvidence,
  fullProgramGate14ActivationGuards,
  runFullProgramControlledPairs,
  runFullProgramEvaluatorBlindness,
  runFullProgramFourDayCohort,
  runFullProgramMultiHorizonCohorts,
} from "../helpers/fullPrescribedProgramCagtLab";

describe("full prescribed-program cohorts and evaluator blindness", () => {
  it("admits controlled pairs and fixed/multi-horizon cohorts without diversity thresholds", () => {
    expect(runFullProgramControlledPairs()).toMatchObject({ pairCount: 72, hardFailureCount: 0 });
    expect(runFullProgramFourDayCohort()).toMatchObject({ cohortSize: 24, confirmedOpportunityCount: 4,
      rawDiversityThresholdCount: 0, result: "FOUR_DAY_FIXED_FRAMEWORK_COHORT_PASSED" });
    expect(runFullProgramMultiHorizonCohorts()).toMatchObject({ failureCount: 0,
      result: "MULTI_HORIZON_SHAPE_COHORTS_PASSED" });
  });

  it("is blind to labels and remains inactive outside tests and reports", () => {
    expect(runFullProgramEvaluatorBlindness().failureCount).toBe(0);
    expect(Object.values(fullProgramGate14ActivationGuards()).every((count) => count === 0)).toBe(true);
  });

  it("executes the complete locked catalog, dose, role, purpose, and horizon coverage inventory", () => {
    expect(fullProgramCoverageEvidence()).toMatchObject({
      exerciseIdentityCount: 45,
      doseModeCount: 7,
      sectionCount: 5,
      trainingRoleCount: 7,
      objectivePurposeCount: 6,
      opportunityShapes: [1, 2, 3, 4, 5, 6],
      catalogIdentityMutationSpecimenCount: 45,
      doseModeMutationSpecimenCount: 2,
      catalogIdentityGate13FailureCount: 0,
      doseModeGate13FailureCount: 0,
      failureCount: 0,
    });
  });
});
