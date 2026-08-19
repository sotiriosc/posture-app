import { describe, expect, it } from "vitest";
import {
  EXPECTED_WEEK_DESIGN_FINGERPRINTS,
  computeWeekDesignFingerprints,
  runDeterministicWeekDesignFuzz,
} from "../helpers/weekComposerDesignLab";

describe("Week design deterministic evidence", () => {
  it("passes 10,000 fixed-seed cases including 1,000 exhaustive allocation cases", () => {
    const result = runDeterministicWeekDesignFuzz(10_000);
    expect(result.cases).toBe(10_000);
    expect(result.allocationCases).toBe(1_000);
    expect(result.failures).toEqual([]);
  });

  it("preserves all 23 named design contracts plus the combined fingerprint", () => {
    expect(Object.keys(computeWeekDesignFingerprints())).toHaveLength(24);
    expect(computeWeekDesignFingerprints()).toEqual(EXPECTED_WEEK_DESIGN_FINGERPRINTS);
  });
});
