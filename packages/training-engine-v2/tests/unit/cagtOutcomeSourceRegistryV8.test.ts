import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8,
  validateEffectiveAuthorityRegistryV8 } from "../cagt/effectiveAuthorityRegistryV8";

describe("CAGT effective authority registry V8", () => {
  it("graduates Gate 11 while preserving every other gate and nonactivation", () => {
    expect(validateEffectiveAuthorityRegistryV8()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gateOrder).toEqual(CAGT_GATE_ORDER);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates.gate_11_execution_response_foundation)
      .toMatchObject({ exactAuthority: "PRODUCTION_KERNEL_AUTHORITY", productionRuntimeAuthority: true,
        testOnlyComparison: false });
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.liveApplicationIngestionActive).toBe(false);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.automaticLongitudinalEvaluationActive).toBe(false);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.directiveApplicationActive).toBe(false);
  });
});
