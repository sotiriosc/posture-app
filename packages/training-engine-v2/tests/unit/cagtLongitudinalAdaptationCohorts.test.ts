import { describe, expect, it } from "vitest";
import {
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST,
  LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS,
  LONGITUDINAL_FIXED_SHELL_DESCRIPTORS,
  LONGITUDINAL_HOLDOUT_REQUIREMENT_COUNTS,
} from "../cagt/longitudinalAdaptationCohorts";
import { runLongitudinalControlledChains, runLongitudinalFixedShell } from
  "../helpers/longitudinalAdaptationDesignLab";

describe("Gate 16 cohorts", () => {
  it("meets controlled-chain and fixed-shell floors", () => {
    expect(LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.length).toBeGreaterThanOrEqual(120);
    expect(LONGITUDINAL_FIXED_SHELL_DESCRIPTORS.length).toBeGreaterThanOrEqual(40);
    expect(runLongitudinalControlledChains()).toMatchObject({ caseCount: 130, mismatchCount: 0,
      validationFailureCount: 0 });
    expect(runLongitudinalFixedShell()).toMatchObject({ caseCount: 40, mismatchCount: 0,
      validationFailureCount: 0 });
  });

  it("locks the independent holdout before execution", () => {
    expect(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST).toMatchObject({
      frozenBeforeExecution: true,
      fingerprint: "7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18",
      correctionPolicy: "V1.1_AND_NEW_LOCKED_HOLDOUT_REQUIRED",
    });
  });

  it("covers category and horizon requirements", () => {
    expect(LONGITUDINAL_HOLDOUT_REQUIREMENT_COUNTS).toEqual({ total: 360, genuineCompletedHistory: 325,
      keepRepeatHold: 85, progression: 75, regressionModification: 55, replacement: 45, rotation: 30,
      ownerReview: 35, noRescue: 35, exerciseIdentityCount: 45, doseModeCount: 7, sectionCount: 5,
      trainingRoleCount: 7, phaseCount: 3, horizonShapeCount: 6 });
  });
});
