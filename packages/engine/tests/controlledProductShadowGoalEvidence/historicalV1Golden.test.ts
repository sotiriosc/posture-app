import { describe, expect, it } from "vitest";
import { runControlledProductShadowEvidenceStress } from
  "../../../training-engine-v2/tests/cagt/controlledProductShadowEvidence";
import {
  HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/holdout";

describe("Goal-specific evidence historical V1 golden boundary", () => {
  it("preserves historical replay and current route invariance", () => {
    const result = runControlledProductShadowEvidenceStress();
    expect(HISTORICAL_PRODUCT_SHADOW_FINGERPRINT).toBe(
      "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c");
    expect(result.failures).toEqual([]);
    expect(result.replayComparisons).toBeGreaterThanOrEqual(1_000);
    expect(result.productInvarianceComparisons).toBeGreaterThanOrEqual(1_000);
  });
});
