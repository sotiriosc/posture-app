import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE } from "./effectiveAuthorityRegistryV7";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "8.0.0",
} as const);

function gate(gateId: CagtGateId) {
  if (gateId !== "gate_11_execution_response_foundation") {
    return Object.freeze({ ...CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7.gates[gateId],
      provenance: Object.freeze([...CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7.gates[gateId].provenance,
        "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@8.0.0"]) });
  }
  return Object.freeze({ gate: gateId, coarseLegacyAuthority: "PRODUCTION" as const,
    exactAuthority: "PRODUCTION_KERNEL_AUTHORITY" as const,
    evidenceSource: "PRODUCTION_OUTCOME_SOURCE_INGESTION@1.0.0+PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0",
    productionRuntimeAuthority: true, testOnlyComparison: false,
    provenance: Object.freeze(["CAGT_EFFECTIVE_AUTHORITY_REGISTRY@8.0.0",
      "gate-authority:gate_11_execution_response_foundation",
      "activation-status:IMPLEMENTED_NOT_ACTIVATED"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE,
  productionImportsCagt: false as const,
  liveApplicationIngestionActive: false as const,
  automaticLongitudinalEvaluationActive: false as const,
  directiveApplicationActive: false as const,
});

export function validateEffectiveAuthorityRegistryV8(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.reference.version !== "8.0.0") reasons.push("CAGT_REGISTRY_V8_REQUIRED");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gateOrder.some((value, index) => value !== CAGT_GATE_ORDER[index])) {
    reasons.push("CAGT_GATE_ORDER_INVALID");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates.gate_11_execution_response_foundation.exactAuthority !==
      "PRODUCTION_KERNEL_AUTHORITY") reasons.push("CAGT_GATE_11_PRODUCTION_AUTHORITY_REQUIRED");
  for (const gateId of CAGT_GATE_ORDER.filter((value) => value !== "gate_11_execution_response_foundation")) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V8.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  return Object.freeze(reasons.sort());
}
