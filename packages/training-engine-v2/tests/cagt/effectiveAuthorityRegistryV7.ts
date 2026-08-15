import { CAGT_GATE_ORDER, type CagtGateId, type CagtLayerAuthority } from "./contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6_REFERENCE,
} from "./effectiveAuthorityRegistryV6";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_VERSION = "7.0.0" as const;
export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_VERSION,
});

export type CagtEffectiveAuthorityDetailV7 =
  | "PRODUCTION_TEST_INTEGRITY" | "DESIGN_WEEK_AND_HORIZON_AUTHORITY"
  | "PRODUCTION_KERNEL_AUTHORITY" | "FOUNDATION_AUTHORITY"
  | "OUTCOME_SOURCE_AND_PERSISTENCE_DESIGN_EVIDENCE"
  | "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE";

export interface CagtEffectiveGateAuthorityDescriptorV7 {
  readonly gate: CagtGateId;
  readonly coarseLegacyAuthority: CagtLayerAuthority;
  readonly exactAuthority: CagtEffectiveAuthorityDetailV7;
  readonly evidenceSource: string;
  readonly productionRuntimeAuthority: boolean;
  readonly testOnlyComparison: boolean;
  readonly provenance: readonly string[];
}

function descriptor(gate: CagtGateId): CagtEffectiveGateAuthorityDescriptorV7 {
  if (gate !== "gate_11_execution_response_foundation") {
    const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6.gates[gate];
    return Object.freeze({ ...previous, exactAuthority: previous.exactAuthority as CagtEffectiveAuthorityDetailV7,
      provenance: Object.freeze([...previous.provenance,
        "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@7.0.0"]) });
  }
  return Object.freeze({ gate, coarseLegacyAuthority: "FOUNDATION_ONLY",
    exactAuthority: "OUTCOME_SOURCE_AND_PERSISTENCE_DESIGN_EVIDENCE",
    evidenceSource: "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION@1.0.0",
    productionRuntimeAuthority: false, testOnlyComparison: true,
    provenance: Object.freeze(["CAGT_EFFECTIVE_AUTHORITY_REGISTRY@7.0.0",
      "gate-authority:gate_11_execution_response_foundation", "activation-status:NOT_ACTIVATED"]) });
}

const gates = Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gate) => [gate, descriptor(gate)]))) as
Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptorV7>>;

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V6_REFERENCE,
  explicitTestOnlySelectionRequired: true as const,
  provenance: Object.freeze([
    "owner-authorization:OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_ONTOLOGY_POLICY_AND_CAGT_ADMISSION",
    "historical-registry:CAGT_V1_V2_V3_V4_V5_V6_PRESERVED",
  ]),
});

export function validateEffectiveAuthorityRegistryV7(
  registry: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7,
): readonly string[] {
  const reasons: string[] = [];
  if (registry.reference.registryId !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID ||
      registry.reference.version !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_VERSION) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REQUIRED");
  }
  if (registry.gateOrder.some((gate, index) => gate !== CAGT_GATE_ORDER[index])) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_GATE_ORDER_INVALID");
  }
  for (const gate of CAGT_GATE_ORDER) if (!registry.gates[gate]) reasons.push(`CAGT_GATE_MISSING:${gate}`);
  const gate11 = registry.gates.gate_11_execution_response_foundation;
  if (gate11.exactAuthority !== "OUTCOME_SOURCE_AND_PERSISTENCE_DESIGN_EVIDENCE" ||
      gate11.productionRuntimeAuthority || !gate11.testOnlyComparison) {
    reasons.push("CAGT_GATE_11_DESIGN_AUTHORITY_INVALID");
  }
  for (const gate of ["gate_6_session_intent_truth", "gate_7_candidate_intelligence_truth",
    "gate_8_session_composition_truth", "gate_9_prescription_handoff_truth",
    "gate_10_sequencing_duration_handoff_truth", "gate_13_post_prescription_weekly_validation",
    "gate_15_phase_continuity", "gate_16_longitudinal_adaptation"] as const) {
    if (registry.gates[gate].exactAuthority !== "PRODUCTION_KERNEL_AUTHORITY") {
      reasons.push(`CAGT_PRODUCTION_AUTHORITY_NOT_PRESERVED:${gate}`);
    }
  }
  return Object.freeze([...new Set(reasons)].sort());
}
