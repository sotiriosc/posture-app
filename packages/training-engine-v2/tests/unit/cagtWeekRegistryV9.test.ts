import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9,
  validateEffectiveAuthorityRegistryV9,
} from "../cagt/effectiveAuthorityRegistryV9";

describe("CAGT effective authority registry V9", () => {
  it("graduates Gates 1-5 and preserves Gate 0-16 order and all other authority", () => {
    expect(validateEffectiveAuthorityRegistryV9()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gateOrder).toEqual(CAGT_GATE_ORDER);
    for (const gateId of CAGT_GATE_ORDER.slice(1, 6)) {
      expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId]!.exactAuthority).toBe("PRODUCTION_KERNEL_AUTHORITY");
    }
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates.gate_12_all_horizon_sessions.exactAuthority)
      .toBe("MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates.gate_13_post_prescription_weekly_validation.exactAuthority)
      .toBe("PRODUCTION_KERNEL_AUTHORITY");
  });

  it("keeps all runtime and application switches off", () => {
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9).toMatchObject({
      productionImportsCagt: false,
      productHorizonRuntimeActive: false,
      automaticPolicySelectionActive: false,
      automaticFeasibilityInvocationActive: false,
      weekPlanPersistenceActive: false,
      weekPlanApplicationActive: false,
      automaticMaterializationActive: false,
      automaticReallocationActive: false,
    });
  });
});
