import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11 } from "../cagt/effectiveAuthorityRegistryV11";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12,
  validateEffectiveAuthorityRegistryV12 } from "../cagt/effectiveAuthorityRegistryV12";

describe("CAGT Effective Authority Registry V12", () => {
  it("preserves every gate while recording the explicit future V1.1 lane", () => {
    expect(validateEffectiveAuthorityRegistryV12()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gateOrder).toEqual(CAGT_GATE_ORDER);
    for (const gateId of CAGT_GATE_ORDER) {
      expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gates[gateId].exactAuthority)
        .toBe(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gates[gateId].exactAuthority);
    }
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12).toMatchObject({
      gate9HistoricalCompilerAuthority:
        "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0_FROZEN_COMPATIBILITY",
      gate9SupportedFutureActivationAuthority: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0",
      purposeFirstResolverAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
      ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED",
      ProductActivationAuthority: "NOT_AUTHORIZED",
      productionImportsCagt: false,
      productRuntimeActive: false,
      purposeFirstCompilerActivated: false,
    });
  });
});
