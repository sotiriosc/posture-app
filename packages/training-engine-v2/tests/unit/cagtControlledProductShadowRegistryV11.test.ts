import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10 } from "../cagt/effectiveAuthorityRegistryV10";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11,
  validateEffectiveAuthorityRegistryV11 } from "../cagt/effectiveAuthorityRegistryV11";

describe("CAGT Effective Authority Registry V11", () => {
  it("freezes Gates 0-16 while adding observation-only Product shadow metadata", () => {
    expect(validateEffectiveAuthorityRegistryV11()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gateOrder).toEqual(CAGT_GATE_ORDER);
    for (const gateId of CAGT_GATE_ORDER) {
      expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gates[gateId].exactAuthority)
        .toBe(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gates[gateId].exactAuthority);
    }
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11).toMatchObject({
      applicationOrchestrationAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
      controlledProductShadowIntegrationAuthority:
        "CONTROLLED_PRODUCT_RUNTIME_OBSERVATION_AUTHORITY_DEFAULT_OFF",
      controlledProductShadowDecisionAuthority: "NO_PRODUCT_DECISION_AUTHORITY",
      legacyProductOutputAuthority: "SOLE_USER_VISIBLE_PROGRAM_AUTHORITY",
      v2ShadowProgramPerformanceAuthority: "NONE_COUNTERFACTUAL_ONLY",
      productActivationAuthority: "NOT_IMPLEMENTED", productRuntimeActive: false,
      controlledShadowDefaultMode: "off",
    });
  });
});
