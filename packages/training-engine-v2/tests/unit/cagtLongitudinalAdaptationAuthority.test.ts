import { describe, expect, it } from "vitest";
import {
  LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_STATUS,
  LONGITUDINAL_ADAPTATION_GATE_16_STATUS,
  LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
  LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
} from "../../src/longitudinalAdaptation/designContracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5,
  validateEffectiveAuthorityRegistryV5,
} from "../cagt/effectiveAuthorityRegistryV5";
import { longitudinalAdaptationActivationGuards } from "../helpers/longitudinalAdaptationDesignLab";

describe("Gate 16 design authority", () => {
  it("preserves Gate 15 production authority and admits Gate 16 design evidence only", () => {
    expect(validateEffectiveAuthorityRegistryV5(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5)).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.reference).toEqual({
      registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY", version: "5.0.0",
    });
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.gates.gate_15_phase_continuity.exactAuthority)
      .toBe("PRODUCTION_KERNEL_AUTHORITY");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.gates.gate_16_longitudinal_adaptation).toMatchObject({
      exactAuthority: "LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE",
      productionRuntimeAuthority: false, testOnlyComparison: true,
    });
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5.historicalRegistriesPreserved).toBe(true);
  });

  it("locks the contract, outcome source, policy owner, and inactive status", () => {
    expect(LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE).toEqual({
      contractId: "LONGITUDINAL_ADAPTATION_GATE_16_CONTRACT", contractVersion: "1.0.0",
    });
    expect(LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE).toEqual({
      contractId: "LONGITUDINAL_OUTCOME_SOURCE_CONTRACT", contractVersion: "1.0.0",
    });
    expect(LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED.state)
      .toBe("OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION");
    expect(LONGITUDINAL_ADAPTATION_GATE_16_STATUS)
      .toBe("LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME");
    expect(LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_STATUS).toBe("NOT_ACTIVATED");
  });

  it("has no runtime, product, live-source, UI, or automatic-action path", () => {
    expect(longitudinalAdaptationActivationGuards()).toMatchObject({
      failureCount: 0, result: "LONGITUDINAL_ADAPTATION_GATE_16_NOT_ACTIVATED",
    });
  });
});
