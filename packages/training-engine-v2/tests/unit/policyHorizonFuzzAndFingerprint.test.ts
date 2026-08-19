import { describe, expect, it } from "vitest";
import {
  EXPECTED_POLICY_HORIZON_FINGERPRINTS,
  computePolicyHorizonFingerprints,
  runPolicyHorizonFuzz,
} from "../helpers/policyHorizonDesignLab";

describe("Policy and Product Horizon design determinism", () => {
  it("passes 10,000 deterministic fixed-seed Product Adapter cases", () => {
    const result = runPolicyHorizonFuzz(10_000);
    expect(result.cases).toBe(10_000);
    expect(result.failures).toEqual([]);
    expect(result.digest).toBe("49f795108a2cc574e31352c6666c416b491af3d30c1303844d781d87666c9e14");
  });

  it("freezes all 22 policy/horizon design fingerprints", () => {
    expect(Object.keys(computePolicyHorizonFingerprints())).toHaveLength(22);
    expect(computePolicyHorizonFingerprints()).toEqual(EXPECTED_POLICY_HORIZON_FINGERPRINTS);
  });
});
