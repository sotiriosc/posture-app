import {
  CAGT_GATE_ORDER,
  type CagtGateId,
  type CagtLayerAuthority,
} from "./contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE,
} from "./effectiveAuthorityRegistryV2";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_VERSION = "3.0.0" as const;

export type CagtEffectiveAuthorityDetailV3 =
  | "PRODUCTION_TEST_INTEGRITY"
  | "DESIGN_WEEK_AND_HORIZON_AUTHORITY"
  | "PRODUCTION_KERNEL_AUTHORITY"
  | "FOUNDATION_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE"
  | "PHASE_CONTINUITY_DESIGN_EVIDENCE"
  | "FOUNDATION_ONLY_NOT_IMPLEMENTED";

export interface CagtEffectiveAuthorityRegistryV3Reference {
  readonly registryId: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID;
  readonly version: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_VERSION;
}

export interface CagtEffectiveGateAuthorityDescriptorV3 {
  readonly gate: CagtGateId;
  readonly coarseLegacyAuthority: CagtLayerAuthority;
  readonly exactAuthority: CagtEffectiveAuthorityDetailV3;
  readonly evidenceSource: string;
  readonly productionRuntimeAuthority: boolean;
  readonly testOnlyComparison: boolean;
  readonly provenance: readonly string[];
}

export interface CagtEffectiveAuthorityRegistryV3 {
  readonly reference: CagtEffectiveAuthorityRegistryV3Reference;
  readonly gateOrder: typeof CAGT_GATE_ORDER;
  readonly gates: Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptorV3>>;
  readonly historicalRegistryPreserved: true;
  readonly supersedesReference: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE;
  readonly provenance: readonly string[];
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_REFERENCE:
CagtEffectiveAuthorityRegistryV3Reference = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_VERSION,
});

function descriptor(gate: CagtGateId): CagtEffectiveGateAuthorityDescriptorV3 {
  if (gate !== "gate_15_phase_continuity") {
    const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.gates[gate];
    return Object.freeze({
      ...previous,
      exactAuthority: previous.exactAuthority as CagtEffectiveAuthorityDetailV3,
      provenance: Object.freeze([
        ...previous.provenance,
        "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@3.0.0",
      ]),
    });
  }
  return Object.freeze({
    gate,
    coarseLegacyAuthority: "DESIGN_ONLY",
    exactAuthority: "PHASE_CONTINUITY_DESIGN_EVIDENCE",
    evidenceSource: "PHASE_CONTINUITY_GATE_15_V1_ONTOLOGY_POLICY_AND_CAGT_ADMISSION",
    productionRuntimeAuthority: false,
    testOnlyComparison: true,
    provenance: Object.freeze([
      "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@3.0.0",
      "gate-authority:gate_15_phase_continuity",
    ]),
  });
}

const gates = Object.freeze(Object.fromEntries(
  CAGT_GATE_ORDER.map((gate) => [gate, descriptor(gate)]),
)) as Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptorV3>>;

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3:
CagtEffectiveAuthorityRegistryV3 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates,
  historicalRegistryPreserved: true,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE,
  provenance: Object.freeze([
    "owner-authorization:PHASE_CONTINUITY_GATE_15_V1_ONTOLOGY_POLICY_AND_CAGT_ADMISSION",
    "historical-registry:CAGT_V1_PRESERVED",
    "effective-authority-registry:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@2.0.0_PRESERVED",
  ]),
});

export function validateEffectiveAuthorityRegistryV3(
  registry: CagtEffectiveAuthorityRegistryV3,
): readonly string[] {
  const reasons: string[] = [];
  if (registry.reference.registryId !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID ||
      registry.reference.version !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_VERSION) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3_REQUIRED");
  }
  if (registry.gateOrder.length !== CAGT_GATE_ORDER.length ||
      registry.gateOrder.some((gate, index) => gate !== CAGT_GATE_ORDER[index])) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_GATE_ORDER_INVALID");
  }
  for (const gate of CAGT_GATE_ORDER) {
    if (!registry.gates[gate] || registry.gates[gate].gate !== gate) {
      reasons.push(`CAGT_EFFECTIVE_AUTHORITY_GATE_MISSING:${gate}`);
    }
  }
  const gate14 = registry.gates.gate_14_full_prescribed_program_comparison;
  if (gate14.exactAuthority !== "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE" ||
      gate14.productionRuntimeAuthority || !gate14.testOnlyComparison) {
    reasons.push("CAGT_GATE_14_AUTHORITY_NOT_PRESERVED");
  }
  const gate15 = registry.gates.gate_15_phase_continuity;
  if (gate15.exactAuthority !== "PHASE_CONTINUITY_DESIGN_EVIDENCE" ||
      gate15.productionRuntimeAuthority || !gate15.testOnlyComparison) {
    reasons.push("CAGT_GATE_15_DESIGN_ONLY_AUTHORITY_INVALID");
  }
  const gate16 = registry.gates.gate_16_longitudinal_adaptation;
  if (gate16.exactAuthority !== "FOUNDATION_ONLY_NOT_IMPLEMENTED" ||
      gate16.productionRuntimeAuthority) {
    reasons.push("CAGT_GATE_16_FOUNDATION_BOUNDARY_INVALID");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function projectEffectiveAuthorityRegistryV3ToLegacy(
  registry: CagtEffectiveAuthorityRegistryV3,
): Readonly<Record<CagtGateId, CagtLayerAuthority>> {
  return Object.freeze(Object.fromEntries(registry.gateOrder.map((gate) => [
    gate,
    registry.gates[gate].coarseLegacyAuthority,
  ])) as Readonly<Record<CagtGateId, CagtLayerAuthority>>);
}
