import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8_REFERENCE,
} from "./effectiveAuthorityRegistryV8";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "9.0.0",
} as const);

const WEEK_PRODUCTION_GATES = new Set<CagtGateId>([
  "gate_1_weekly_responsibility_truth",
  "gate_2_whole_week_allocation_coverage",
  "gate_3_weekly_causal_adaptation",
  "gate_4_weekly_duplication_distribution",
  "gate_5_reservation_day_materialization",
]);

function gate(gateId: CagtGateId) {
  if (!WEEK_PRODUCTION_GATES.has(gateId)) {
    return Object.freeze({ ...CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates[gateId],
      provenance: Object.freeze([...CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates[gateId].provenance,
        "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@9.0.0"]) });
  }
  return Object.freeze({
    gate: gateId,
    coarseLegacyAuthority: "PRODUCTION" as const,
    exactAuthority: "PRODUCTION_KERNEL_AUTHORITY" as const,
    evidenceSource: "PRODUCTION_WEEKLY_INTENT_PLANNER@1.0.0+PRODUCTION_WEEK_ALLOCATION_COMPOSER@1.0.0+PRODUCTION_SESSION_ALLOCATION_MATERIALIZER@1.0.0",
    productionRuntimeAuthority: true,
    testOnlyComparison: false,
    provenance: Object.freeze([
      "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@9.0.0",
      `gate-authority:${gateId}`,
      "activation-status:IMPLEMENTED_NOT_ACTIVATED",
    ]),
  });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8_REFERENCE,
  productionImportsCagt: false as const,
  productHorizonRuntimeActive: false as const,
  automaticPolicySelectionActive: false as const,
  automaticFeasibilityInvocationActive: false as const,
  weekPlanPersistenceActive: false as const,
  weekPlanApplicationActive: false as const,
  automaticMaterializationActive: false as const,
  automaticReallocationActive: false as const,
});

export function validateEffectiveAuthorityRegistryV9(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.reference.version !== "9.0.0") reasons.push("CAGT_REGISTRY_V9_REQUIRED");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gateOrder.some((value, index) => value !== CAGT_GATE_ORDER[index])) {
    reasons.push("CAGT_GATE_ORDER_INVALID");
  }
  for (const gateId of WEEK_PRODUCTION_GATES) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId].exactAuthority !== "PRODUCTION_KERNEL_AUTHORITY") {
      reasons.push(`CAGT_WEEK_GATE_PRODUCTION_AUTHORITY_REQUIRED:${gateId}`);
    }
  }
  for (const gateId of CAGT_GATE_ORDER.filter((value) => !WEEK_PRODUCTION_GATES.has(value))) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates.gate_12_all_horizon_sessions.exactAuthority !==
      "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY") reasons.push("CAGT_GATE_12_MUST_REMAIN_MIXED");
  return Object.freeze(reasons.sort());
}
