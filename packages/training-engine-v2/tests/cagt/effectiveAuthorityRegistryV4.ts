import { CAGT_GATE_ORDER, type CagtGateId, type CagtLayerAuthority } from "./contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_REFERENCE,
} from "./effectiveAuthorityRegistryV3";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_VERSION = "4.0.0" as const;
export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_VERSION,
});
export type CagtEffectiveAuthorityDetailV4 =
  | "PRODUCTION_TEST_INTEGRITY" | "DESIGN_WEEK_AND_HORIZON_AUTHORITY"
  | "PRODUCTION_KERNEL_AUTHORITY" | "FOUNDATION_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE"
  | "FOUNDATION_ONLY_NOT_IMPLEMENTED";

export interface CagtEffectiveGateAuthorityDescriptorV4 {
  readonly gate: CagtGateId;
  readonly coarseLegacyAuthority: CagtLayerAuthority;
  readonly exactAuthority: CagtEffectiveAuthorityDetailV4;
  readonly evidenceSource: string;
  readonly productionRuntimeAuthority: boolean;
  readonly testOnlyComparison: boolean;
  readonly provenance: readonly string[];
}

function descriptor(gate: CagtGateId): CagtEffectiveGateAuthorityDescriptorV4 {
  if (gate !== "gate_15_phase_continuity") {
    const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3.gates[gate];
    return Object.freeze({ ...previous,
      exactAuthority: previous.exactAuthority as CagtEffectiveAuthorityDetailV4,
      provenance: Object.freeze([...previous.provenance,
        "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@4.0.0"]) });
  }
  return Object.freeze({ gate, coarseLegacyAuthority: "PRODUCTION",
    exactAuthority: "PRODUCTION_KERNEL_AUTHORITY", evidenceSource:
      "PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0_GOLDEN_EQUIVALENCE_AND_STRESS",
    productionRuntimeAuthority: true, testOnlyComparison: false,
    provenance: Object.freeze(["CAGT_EFFECTIVE_AUTHORITY_REGISTRY@4.0.0",
      "gate-authority:gate_15_phase_continuity", "activation-status:NOT_ACTIVATED"]) });
}

const gates = Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gate) => [gate, descriptor(gate)]))) as
Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptorV4>>;

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_REFERENCE,
  provenance: Object.freeze([
    "owner-authorization:PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTATION_NOT_ACTIVATION",
    "historical-registry:CAGT_V1_V2_V3_PRESERVED",
  ]),
});

export function validateEffectiveAuthorityRegistryV4(
  registry: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4,
): readonly string[] {
  const reasons: string[] = [];
  if (registry.reference.registryId !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID ||
      registry.reference.version !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_VERSION) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V4_REQUIRED");
  }
  if (registry.gateOrder.some((gate, index) => gate !== CAGT_GATE_ORDER[index])) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_GATE_ORDER_INVALID");
  }
  for (const gate of CAGT_GATE_ORDER) if (!registry.gates[gate]) reasons.push(`CAGT_GATE_MISSING:${gate}`);
  if (registry.gates.gate_14_full_prescribed_program_comparison.exactAuthority !==
      "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE") {
    reasons.push("CAGT_GATE_14_AUTHORITY_NOT_PRESERVED");
  }
  const gate15 = registry.gates.gate_15_phase_continuity;
  if (gate15.exactAuthority !== "PRODUCTION_KERNEL_AUTHORITY" || !gate15.productionRuntimeAuthority ||
      gate15.testOnlyComparison) reasons.push("CAGT_GATE_15_PRODUCTION_AUTHORITY_INVALID");
  const gate16 = registry.gates.gate_16_longitudinal_adaptation;
  if (gate16.exactAuthority !== "FOUNDATION_ONLY_NOT_IMPLEMENTED" || gate16.productionRuntimeAuthority) {
    reasons.push("CAGT_GATE_16_FOUNDATION_BOUNDARY_INVALID");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
