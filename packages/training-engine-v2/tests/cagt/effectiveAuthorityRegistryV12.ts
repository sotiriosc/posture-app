import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11_REFERENCE } from "./effectiveAuthorityRegistryV11";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "12.0.0",
});

function gate(gateId: CagtGateId) {
  const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gates[gateId];
  return Object.freeze({ ...previous, provenance: Object.freeze([...previous.provenance,
    "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@12.0.0"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11_REFERENCE,
  gate9HistoricalCompilerAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0_FROZEN_COMPATIBILITY" as const,
  gate9SupportedFutureActivationAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0" as const,
  purposeFirstResolverAuthority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME" as const,
  ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED" as const,
  ProductActivationAuthority: "NOT_AUTHORIZED" as const,
  productionImportsCagt: false as const,
  productRuntimeActive: false as const,
  purposeFirstCompilerActivated: false as const,
});

export function validateEffectiveAuthorityRegistryV12(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.reference.version !== "12.0.0") {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12_REQUIRED");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gateOrder.some((gateId, index) =>
    gateId !== CAGT_GATE_ORDER[index])) reasons.push("CAGT_GATE_ORDER_INVALID");
  for (const gateId of CAGT_GATE_ORDER) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.purposeFirstResolverAuthority !==
      "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME") reasons.push("CAGT_RESOLVER_AUTHORITY_INVALID");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.ProductShadowCompilerAuthority !==
      "HISTORICAL_COMPATIBILITY_V1_0_PINNED") reasons.push("CAGT_PRODUCT_SHADOW_COMPILER_CHANGED");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.ProductActivationAuthority !== "NOT_AUTHORIZED" ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.productRuntimeActive ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.purposeFirstCompilerActivated) {
    reasons.push("CAGT_PRODUCT_ACTIVATION_MUST_REMAIN_UNAUTHORIZED");
  }
  return Object.freeze(reasons.sort());
}
