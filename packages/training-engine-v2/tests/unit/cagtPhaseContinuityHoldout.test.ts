import { describe, expect, it } from "vitest";
import {
  EXPECTED_PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS,
} from "../cagt/phaseContinuityCohorts";
import { runPhaseContinuityHoldout } from "../helpers/phaseContinuityDesignLab";

describe("Gate 15 frozen holdout", () => {
  it("keeps the pre-execution manifest immutable and fingerprint locked", () => {
    expect(PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT)
      .toBe(EXPECTED_PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT);
    expect(PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.frozenBeforeExecution).toBe(true);
    expect(PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS).toMatchObject({
      pairCount: 295,
      genuineCompleteProgramPairCount: 210,
      stableFrameworkTransitionPairCount: 210,
      anchorContinuityPairCount: 210,
      justifiedLocalChangePairCount: 30,
      excessiveRegenerationMutationCount: 30,
      noRescueMutationCount: 25,
    });
  });

  it("matches every frozen expectation and accepts no downstream rescue", () => {
    const holdout = runPhaseContinuityHoldout();
    expect(holdout.pairCount).toBe(295);
    expect(holdout.expectationMismatchCount).toBe(0);
    expect(holdout.resultValidationFailureCount).toBe(0);
    expect(holdout.acceptedDownstreamRescueCount).toBe(0);
    expect(holdout.downstreamRescueAttemptCount).toBe(25);
  });
});
