import { describe, expect, it } from "vitest";
import { runLongitudinalHoldout } from "../helpers/longitudinalAdaptationDesignLab";

describe("Gate 16 locked holdout", () => {
  it("admits all 360 histories without mismatch or invalid result", () => {
    const holdout = runLongitudinalHoldout();
    expect(holdout).toMatchObject({ caseCount: 360, mismatchCount: 0, validationFailureCount: 0,
      result: "LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_PASS",
      manifestFingerprint: "7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18" });
    expect(Object.values(holdout.actionCounts).reduce((sum, value) => sum + value, 0)).toBe(320);
    expect(holdout.rows.filter((row) => row.result.evidenceApplicability.some((entry) =>
      entry.accepted && entry.applicability === "RELATED_REALIZATION_EVIDENCE"))).toHaveLength(10);
    expect(holdout.rows.filter((row) => row.result.evidenceApplicability.some((entry) =>
      entry.accepted && entry.applicability === "EXERCISE_IDENTITY_HISTORY"))).toHaveLength(10);
    expect(holdout.rows.filter((row) => row.result.trajectory.successfulReexposure)).toHaveLength(5);
    expect(holdout.rows.filter((row) => row.result.blockers
      .includes("LONGITUDINAL_REQUIRED_EVIDENCE_SOURCE_MISSING"))).toHaveLength(5);
  });
});
