import {
  CAGT_GATE_ORDER,
  type CagtGateId,
  type CagtLayerAuthority,
} from "./contracts";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID =
  "CAGT_EFFECTIVE_AUTHORITY_REGISTRY" as const;
export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_VERSION = "2.0.0" as const;

export type CagtEffectiveAuthorityDetail =
  | "PRODUCTION_TEST_INTEGRITY"
  | "DESIGN_WEEK_AND_HORIZON_AUTHORITY"
  | "PRODUCTION_KERNEL_AUTHORITY"
  | "FOUNDATION_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY"
  | "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE"
  | "NOT_IMPLEMENTED"
  | "FOUNDATION_ONLY_NOT_IMPLEMENTED";

export interface CagtEffectiveAuthorityRegistryReference {
  readonly registryId: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID;
  readonly version: typeof CAGT_EFFECTIVE_AUTHORITY_REGISTRY_VERSION;
}

export interface CagtEffectiveGateAuthorityDescriptor {
  readonly gate: CagtGateId;
  readonly coarseLegacyAuthority: CagtLayerAuthority;
  readonly exactAuthority: CagtEffectiveAuthorityDetail;
  readonly evidenceSource: string;
  readonly productionRuntimeAuthority: boolean;
  readonly testOnlyComparison: boolean;
  readonly provenance: readonly string[];
}

export interface CagtEffectiveAuthorityRegistry {
  readonly reference: CagtEffectiveAuthorityRegistryReference;
  readonly gateOrder: typeof CAGT_GATE_ORDER;
  readonly gates: Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptor>>;
  readonly historicalRegistryPreserved: true;
  readonly provenance: readonly string[];
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE:
CagtEffectiveAuthorityRegistryReference = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_VERSION,
});

const exactAuthorityByGate: Readonly<Record<CagtGateId, CagtEffectiveAuthorityDetail>> = Object.freeze({
  gate_0_scenario_truth: "PRODUCTION_TEST_INTEGRITY",
  gate_1_weekly_responsibility_truth: "DESIGN_WEEK_AND_HORIZON_AUTHORITY",
  gate_2_whole_week_allocation_coverage: "DESIGN_WEEK_AND_HORIZON_AUTHORITY",
  gate_3_weekly_causal_adaptation: "DESIGN_WEEK_AND_HORIZON_AUTHORITY",
  gate_4_weekly_duplication_distribution: "DESIGN_WEEK_AND_HORIZON_AUTHORITY",
  gate_5_reservation_day_materialization: "DESIGN_WEEK_AND_HORIZON_AUTHORITY",
  gate_6_session_intent_truth: "PRODUCTION_KERNEL_AUTHORITY",
  gate_7_candidate_intelligence_truth: "PRODUCTION_KERNEL_AUTHORITY",
  gate_8_session_composition_truth: "PRODUCTION_KERNEL_AUTHORITY",
  gate_9_prescription_handoff_truth: "PRODUCTION_KERNEL_AUTHORITY",
  gate_10_sequencing_duration_handoff_truth: "PRODUCTION_KERNEL_AUTHORITY",
  gate_11_execution_response_foundation: "FOUNDATION_AUTHORITY",
  gate_12_all_horizon_sessions: "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY",
  gate_13_post_prescription_weekly_validation: "PRODUCTION_KERNEL_AUTHORITY",
  gate_14_full_prescribed_program_comparison: "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE",
  gate_15_phase_continuity: "NOT_IMPLEMENTED",
  gate_16_longitudinal_adaptation: "FOUNDATION_ONLY_NOT_IMPLEMENTED",
});

function coarseProjection(authority: CagtEffectiveAuthorityDetail): CagtLayerAuthority {
  if (authority === "PRODUCTION_TEST_INTEGRITY" || authority === "PRODUCTION_KERNEL_AUTHORITY") return "PRODUCTION";
  if (authority === "FOUNDATION_AUTHORITY" || authority === "FOUNDATION_ONLY_NOT_IMPLEMENTED") return "FOUNDATION_ONLY";
  if (authority === "NOT_IMPLEMENTED") return "NOT_IMPLEMENTED";
  return "DESIGN_ONLY";
}

function evidenceSource(gate: CagtGateId, authority: CagtEffectiveAuthorityDetail): string {
  if (gate === "gate_14_full_prescribed_program_comparison") return "FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_DESIGN_AND_ADMISSION";
  if (gate === "gate_13_post_prescription_weekly_validation") return "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.0.0";
  if (gate === "gate_10_sequencing_duration_handoff_truth") return "PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0";
  if (gate === "gate_9_prescription_handoff_truth") return "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0";
  return `CAGT_EFFECTIVE_AUTHORITY:${authority}`;
}

const gates = Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gate) => {
  const exactAuthority = exactAuthorityByGate[gate];
  const descriptor: CagtEffectiveGateAuthorityDescriptor = Object.freeze({
    gate,
    coarseLegacyAuthority: coarseProjection(exactAuthority),
    exactAuthority,
    evidenceSource: evidenceSource(gate, exactAuthority),
    productionRuntimeAuthority: exactAuthority === "PRODUCTION_KERNEL_AUTHORITY",
    testOnlyComparison: gate === "gate_14_full_prescribed_program_comparison",
    provenance: Object.freeze([
      `${CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID}@${CAGT_EFFECTIVE_AUTHORITY_REGISTRY_VERSION}`,
      `gate-authority:${gate}`,
    ]),
  });
  return [gate, descriptor];
}))) as Readonly<Record<CagtGateId, CagtEffectiveGateAuthorityDescriptor>>;

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2: CagtEffectiveAuthorityRegistry = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates,
  historicalRegistryPreserved: true,
  provenance: Object.freeze([
    "owner-authorization:FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_DESIGN_AND_ADMISSION",
    "historical-registry:CAGT_V1_PRESERVED",
  ]),
});

export function projectEffectiveAuthorityRegistryV2ToLegacy(
  registry: CagtEffectiveAuthorityRegistry,
): Readonly<Record<CagtGateId, CagtLayerAuthority>> {
  return Object.freeze(Object.fromEntries(registry.gateOrder.map((gate) => [
    gate,
    registry.gates[gate].coarseLegacyAuthority,
  ])) as Readonly<Record<CagtGateId, CagtLayerAuthority>>);
}

export function validateEffectiveAuthorityRegistryV2(
  registry: CagtEffectiveAuthorityRegistry,
): readonly string[] {
  const reasons: string[] = [];
  if (registry.reference.registryId !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID ||
      registry.reference.version !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_VERSION) {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REQUIRED");
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
    reasons.push("CAGT_GATE_14_TEST_ONLY_AUTHORITY_INVALID");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
