import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9_REFERENCE } from "./effectiveAuthorityRegistryV9";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "10.0.0",
});

function gate(gateId: CagtGateId) {
  const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId];
  return Object.freeze({ ...previous, provenance: Object.freeze([...previous.provenance,
    "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@10.0.0"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9_REFERENCE,
  applicationOrchestrationAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME" as const,
  controlledProductShadowAuthority: "NOT_IMPLEMENTED" as const,
  productActivationAuthority: "NOT_IMPLEMENTED" as const,
  productionImportsCagt: false as const,
  productRuntimeActive: false as const,
  directiveApplicationActive: false as const,
});

export function validateEffectiveAuthorityRegistryV10(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.reference.version !== "10.0.0") {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10_REQUIRED");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gateOrder.some((gateId, index) =>
    gateId !== CAGT_GATE_ORDER[index])) reasons.push("CAGT_GATE_ORDER_INVALID");
  for (const gateId of CAGT_GATE_ORDER) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.applicationOrchestrationAuthority !==
      "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME") {
    reasons.push("CAGT_APPLICATION_ORCHESTRATION_POST_GATE_AUTHORITY_INVALID");
  }
  return Object.freeze(reasons.sort());
}
