import { describe, expect, it } from "vitest";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4,
  validateEffectiveAuthorityRegistryV4,
} from "../cagt/effectiveAuthorityRegistryV4";
import { productionPhaseContinuityActivationGuards } from "../helpers/productionPhaseContinuityLab";

describe("production Phase Continuity authority and inactivity", () => {
  it("sets Gate 15 production authority while preserving Gate 16 foundation-only", () => {
    expect(validateEffectiveAuthorityRegistryV4(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4)).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4.gates.gate_15_phase_continuity.exactAuthority)
      .toBe("PRODUCTION_KERNEL_AUTHORITY");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4.gates.gate_16_longitudinal_adaptation.exactAuthority)
      .toBe("FOUNDATION_ONLY_NOT_IMPLEMENTED");
  });

  it("proves zero runtime activation and forbidden production imports", () => {
    expect(productionPhaseContinuityActivationGuards()).toMatchObject({
      failureCount: 0, result: "PRODUCTION_PHASE_CONTINUITY_NOT_ACTIVATED",
    });
  });
});
