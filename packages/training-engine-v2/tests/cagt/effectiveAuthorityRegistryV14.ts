import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13_REFERENCE } from "./effectiveAuthorityRegistryV13";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "14.0.0",
});

function gate(gateId: CagtGateId) {
  const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.gates[gateId];
  return Object.freeze({ ...previous, provenance: Object.freeze([...previous.provenance,
    "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@14.0.0"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13_REFERENCE,
  gate9EquipmentExperienceContextAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.3.0_EXPLICIT_CALLS_ONLY" as const,
  gate13EquipmentExperienceContextAuthority:
    "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.2.0_EXPLICIT_CALLS_ONLY" as const,
  realizationContextAuthority:
    "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME" as const,
  ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED" as const,
  ProductActivationAuthority: "NOT_AUTHORIZED" as const,
  productionImportsCagt: false as const,
  productRuntimeActive: false as const,
  compilerV1_3Activated: false as const,
  validatorV1_2Activated: false as const,
});

export function validateEffectiveAuthorityRegistryV14(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.reference.version !== "14.0.0") {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14_REQUIRED");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.gateOrder.some((gateId, index) =>
    gateId !== CAGT_GATE_ORDER[index])) reasons.push("CAGT_GATE_ORDER_INVALID");
  for (const gateId of CAGT_GATE_ORDER) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.ProductShadowCompilerAuthority !==
      "HISTORICAL_COMPATIBILITY_V1_0_PINNED") reasons.push("CAGT_PRODUCT_SHADOW_COMPILER_CHANGED");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.ProductActivationAuthority !== "NOT_AUTHORIZED" ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.productRuntimeActive ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.compilerV1_3Activated ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.validatorV1_2Activated) {
    reasons.push("CAGT_PRODUCT_ACTIVATION_MUST_REMAIN_UNAUTHORIZED");
  }
  return Object.freeze(reasons.sort());
}
