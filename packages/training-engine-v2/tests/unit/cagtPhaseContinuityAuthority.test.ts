import { describe, expect, it } from "vitest";
import {
  PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PHASE_CONTINUITY_GATE_15_STATUS,
  PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
  PHASE_DEVELOPMENTAL_EMPHASES,
  PHASE_TRANSITION_GRAPH,
} from "../../src/phaseContinuity/designContracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
  validateEffectiveAuthorityRegistryV3,
} from "../cagt/effectiveAuthorityRegistryV3";
import { phaseContinuityActivationGuards } from "../helpers/phaseContinuityDesignLab";

describe("Gate 15 design authority", () => {
  it("admits explicit V3 authority while preserving Gate 14 and Gate 16 boundaries", () => {
    expect(validateEffectiveAuthorityRegistryV3(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3)).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3.reference).toEqual({
      registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY",
      version: "3.0.0",
    });
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3.gates.gate_15_phase_continuity.exactAuthority)
      .toBe("PHASE_CONTINUITY_DESIGN_EVIDENCE");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3.gates.gate_15_phase_continuity.productionRuntimeAuthority)
      .toBe(false);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3.gates.gate_16_longitudinal_adaptation.exactAuthority)
      .toBe("FOUNDATION_ONLY_NOT_IMPLEMENTED");
  });

  it("keeps phase emphasis contextual and closes the V1 transition graph", () => {
    expect(PHASE_CONTINUITY_CONTRACT_REFERENCE).toEqual({
      contractId: "PHASE_CONTINUITY_GATE_15_CONTRACT",
      version: "1.0.0",
    });
    expect(PHASE_CONTINUITY_GATE_15_STATUS)
      .toBe("PHASE_CONTINUITY_GATE_15_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME");
    expect(Object.values(PHASE_DEVELOPMENTAL_EMPHASES).every((entry) =>
      !entry.createsWeeklyObjective && !entry.createsSessionNeed && !entry.replacesAthleteOutcomeGoal)).toBe(true);
    expect(PHASE_TRANSITION_GRAPH.legalAdjacentAdvancementEdges).toEqual([
      "phase_1->phase_2", "phase_2->phase_3",
    ]);
    expect(PHASE_TRANSITION_GRAPH.automaticCycleReset).toBe(false);
    expect(PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT.automaticProgression).toBe(false);
  });

  it("has no runtime activation path", () => {
    expect(phaseContinuityActivationGuards()).toMatchObject({
      failureCount: 0,
      result: "NO_RUNTIME_ACTIVATION",
    });
  });
});
