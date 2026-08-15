import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10_REFERENCE } from "./effectiveAuthorityRegistryV10";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "11.0.0",
});

function gate(gateId: CagtGateId) {
  const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gates[gateId];
  return Object.freeze({ ...previous, provenance: Object.freeze([...previous.provenance,
    "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@11.0.0"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10_REFERENCE,
  applicationOrchestrationAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME" as const,
  controlledProductShadowIntegrationAuthority:
    "CONTROLLED_PRODUCT_RUNTIME_OBSERVATION_AUTHORITY_DEFAULT_OFF" as const,
  controlledProductShadowDecisionAuthority: "NO_PRODUCT_DECISION_AUTHORITY" as const,
  legacyProductOutputAuthority: "SOLE_USER_VISIBLE_PROGRAM_AUTHORITY" as const,
  v2ShadowProgramPerformanceAuthority: "NONE_COUNTERFACTUAL_ONLY" as const,
  productActivationAuthority: "NOT_IMPLEMENTED" as const,
  productionImportsCagt: false as const,
  productRuntimeActive: false as const,
  directiveApplicationActive: false as const,
  controlledShadowDefaultMode: "off" as const,
});

export function validateEffectiveAuthorityRegistryV11(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.reference.version !== "11.0.0") {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11_REQUIRED");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gateOrder.some((gateId, index) =>
    gateId !== CAGT_GATE_ORDER[index])) reasons.push("CAGT_GATE_ORDER_INVALID");
  for (const gateId of CAGT_GATE_ORDER) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V10.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.applicationOrchestrationAuthority !==
      "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME") {
    reasons.push("CAGT_APPLICATION_ORCHESTRATION_POST_GATE_AUTHORITY_INVALID");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.controlledProductShadowDecisionAuthority !==
      "NO_PRODUCT_DECISION_AUTHORITY") reasons.push("CAGT_PRODUCT_DECISION_AUTHORITY_INVALID");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.legacyProductOutputAuthority !==
      "SOLE_USER_VISIBLE_PROGRAM_AUTHORITY") reasons.push("CAGT_LEGACY_PRODUCT_AUTHORITY_INVALID");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.productActivationAuthority !== "NOT_IMPLEMENTED" ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.productRuntimeActive) {
    reasons.push("CAGT_PRODUCT_ACTIVATION_MUST_REMAIN_ABSENT");
  }
  return Object.freeze(reasons.sort());
}
