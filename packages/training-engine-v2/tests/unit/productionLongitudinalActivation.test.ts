import { describe, expect, it } from "vitest";
import { productionLongitudinalActivationGuards } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal activation guards", () => {
  it("keeps every runtime, live-source, application, UI, and automatic-action path absent", () => {
    const result = productionLongitudinalActivationGuards();
    expect(result.failureCount).toBe(0);
    expect(Object.values(result.checks).every((count) => count === 0)).toBe(true);
    expect(result).toMatchObject({ livePerformanceAdapterCount: 0, liveAdherenceAdapterCount: 0,
      liveRecoveryAdapterCount: 0, result: "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_NOT_ACTIVATED" });
  });
});
