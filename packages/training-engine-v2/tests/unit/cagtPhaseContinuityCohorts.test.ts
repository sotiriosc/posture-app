import { describe, expect, it } from "vitest";
import {
  phaseContinuityCoverageEvidence,
  runPhaseContinuityControlledCases,
  runPhaseContinuityFixedShellCohort,
  runPhaseContinuityMultiHorizonCohorts,
} from "../helpers/phaseContinuityDesignLab";

describe("Gate 15 controlled and shape cohorts", () => {
  it("executes all named controlled cases without malformed results", () => {
    const controlled = runPhaseContinuityControlledCases();
    expect(controlled.caseCount).toBe(85);
    expect(controlled.validationFailureCount).toBe(0);
  });

  it("keeps the fixed four-opportunity shell legal for 30 distinct users", () => {
    const cohort = runPhaseContinuityFixedShellCohort();
    expect(cohort.cohortSize).toBe(30);
    expect(cohort.uniqueAthleteCount).toBe(30);
    expect(cohort.opportunityCount).toBe(4);
    expect(cohort.frameworkRetentionRate).toBe(1);
    expect(cohort.unexplainedChurnCount).toBe(0);
  });

  it("covers every required horizon shape and inherited catalog surface", () => {
    expect(runPhaseContinuityMultiHorizonCohorts()).toMatchObject({ shapeCount: 6, failureCount: 0 });
    const coverage = phaseContinuityCoverageEvidence();
    expect(coverage.phaseContinuityCoverageFailureCount).toBe(0);
    expect(coverage.exerciseIdentityCount).toBe(45);
    expect(coverage.doseModeCount).toBe(7);
  });
});
