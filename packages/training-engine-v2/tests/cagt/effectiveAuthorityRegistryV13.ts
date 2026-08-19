import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID } from "./effectiveAuthorityRegistryV2";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12_REFERENCE } from "./effectiveAuthorityRegistryV12";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13_REFERENCE = Object.freeze({
  registryId: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_ID,
  version: "13.0.0",
});

function gate(gateId: CagtGateId) {
  const previous = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gates[gateId];
  return Object.freeze({ ...previous, provenance: Object.freeze([...previous.provenance,
    "registry-projection:CAGT_EFFECTIVE_AUTHORITY_REGISTRY@13.0.0"]) });
}

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13 = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: Object.freeze(Object.fromEntries(CAGT_GATE_ORDER.map((gateId) => [gateId, gate(gateId)]))) as
    Readonly<Record<CagtGateId, ReturnType<typeof gate>>>,
  historicalRegistriesPreserved: true as const,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12_REFERENCE,
  gate1SupportedFutureAuthority:
    "PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE@2.0.0_EXPLICIT_CALLS_ONLY" as const,
  gate9HistoricalCompilerAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0_FROZEN_COMPATIBILITY" as const,
  gate9PurposeFirstAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0_FROZEN_FUTURE_BASELINE" as const,
  gate9SupportedFutureAuthority:
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.2.0_EXPLICIT_CALLS_ONLY" as const,
  gate13SupportedFutureAuthority:
    "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.1.0_EXPLICIT_CALLS_ONLY" as const,
  ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED" as const,
  ProductActivationAuthority: "NOT_AUTHORIZED" as const,
  productionImportsCagt: false as const,
  productRuntimeActive: false as const,
  supportedPurposeCompilerActivated: false as const,
});

export function validateEffectiveAuthorityRegistryV13(): readonly string[] {
  const reasons: string[] = [];
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.reference.version !== "13.0.0") {
    reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13_REQUIRED");
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.gateOrder.some((gateId, index) =>
    gateId !== CAGT_GATE_ORDER[index])) reasons.push("CAGT_GATE_ORDER_INVALID");
  for (const gateId of CAGT_GATE_ORDER) {
    if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.gates[gateId].exactAuthority !==
        CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12.gates[gateId].exactAuthority) {
      reasons.push(`CAGT_HISTORICAL_GATE_AUTHORITY_CHANGED:${gateId}`);
    }
  }
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.ProductShadowCompilerAuthority !==
      "HISTORICAL_COMPATIBILITY_V1_0_PINNED") reasons.push("CAGT_PRODUCT_SHADOW_COMPILER_CHANGED");
  if (CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.ProductActivationAuthority !== "NOT_AUTHORIZED" ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.productRuntimeActive ||
      CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13.supportedPurposeCompilerActivated) {
    reasons.push("CAGT_PRODUCT_ACTIVATION_MUST_REMAIN_UNAUTHORIZED");
  }
  return Object.freeze(reasons.sort());
}
