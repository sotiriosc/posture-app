import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9 } from "../cagt/effectiveAuthorityRegistryV9";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10,
  validateEffectiveAuthorityRegistryV10 } from "../cagt/effectiveAuthorityRegistryV10";

describe("CAGT Effective Authority Registry V10", () => {
  it("freezes Gates 0-16 and records orchestration as post-Gate authority", () => {
    expect(validateEffectiveAuthorityRegistryV10()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gateOrder).toEqual(CAGT_GATE_ORDER);
    for (const gateId of CAGT_GATE_ORDER) {
      expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gates[gateId].exactAuthority)
        .toBe(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId].exactAuthority);
    }
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10).toMatchObject({
      applicationOrchestrationAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
      controlledProductShadowAuthority: "NOT_IMPLEMENTED", productActivationAuthority: "NOT_IMPLEMENTED",
      productRuntimeActive: false, directiveApplicationActive: false,
    });
  });
});
