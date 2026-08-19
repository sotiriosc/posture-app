import { describe, expect, it } from "vitest";
import {
  LONGITUDINAL_ADAPTATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
  resolveProductionLongitudinalAdaptationPolicy,
} from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED } from
  "../../src/longitudinalAdaptation/designContracts";

describe("production Longitudinal Policy V1", () => {
  it("requires explicit object or explicit reference plus registry", () => {
    expect(resolveProductionLongitudinalAdaptationPolicy({ policy: null }).status).toBe("required");
    expect(resolveProductionLongitudinalAdaptationPolicy({
      policy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
    }).status).toBe("unavailable");
    expect(resolveProductionLongitudinalAdaptationPolicy({
      policy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
      availablePolicies: [PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED],
    }).status).toBe("resolved");
  });

  it("rejects equal-reference semantic conflicts", () => {
    const conflict = Object.freeze({ ...PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
      philosophy: Object.freeze([...PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.philosophy,
        "CONFLICTING_RULE"]) });
    expect(resolveProductionLongitudinalAdaptationPolicy({
      policy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
      availablePolicies: [PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED, conflict],
    })).toMatchObject({ status: "conflict", reasonCodes: ["LONGITUDINAL_ADAPTATION_POLICY_CONFLICT"] });
  });

  it("keeps the admitted design policy as an exact frozen compatibility projection", () => {
    expect(LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED)
      .toBe(LONGITUDINAL_ADAPTATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION);
    expect(LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.philosophy)
      .toEqual(PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.philosophy);
  });
});
