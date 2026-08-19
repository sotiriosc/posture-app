import { createHash } from "node:crypto";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_REFERENCE,
} from "./goalSpecificProductShadowEvidence/cagt";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17_REFERENCE = Object.freeze({
  registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY",
  version: "17.0.0",
} as const);

const semantic = Object.freeze({
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17_REFERENCE,
  gateOrder: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.gateOrder,
  gates: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.gates,
  supersedesReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_REFERENCE,
  historicalRegistryPreserved: true as const,
  sessionPracticeRequestAuthority: "ATHLETE_DAY_OF_REQUEST" as const,
  sessionPracticeRealizerAuthority: "PRODUCTION_KERNEL_NOT_PRODUCT_RUNTIME" as const,
  recommendationAuthority: "SUGGESTION_ONLY" as const,
  Gate13PracticeReceiverAuthority: "PRODUCTION_KERNEL_NOT_PRODUCT_RUNTIME" as const,
  ProductAdapterAuthority: "FUTURE_CONTROLLED_OWNER_DELIVERY_ONLY" as const,
  ProductDecisionAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY" as const,
  ProductActivationAuthority: "NOT_AUTHORIZED" as const,
  LongitudinalActionAuthority: "COMPLETED_REPEATED_EVIDENCE_REQUIRED" as const,
  productionImportCount: 0 as const,
  ownerAccountDeliveryAuthorized: false as const,
  productRuntimeActive: false as const,
  provenance: Object.freeze([
    "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@16.0.0:PRESERVED",
    "SESSION_PRACTICE_OPTIONS_V2_BRIDGE@1.0.0",
    "test-developer-evidence-only:not-product-runtime-authority",
  ]),
});

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17 = Object.freeze({
  ...semantic,
  fingerprint: createHash("sha256").update(JSON.stringify(semantic)).digest("hex"),
});

export function validateCagtEffectiveAuthorityRegistryV17(): readonly string[] {
  const failures: string[] = [];
  const registry = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17;
  if (registry.reference.registryId !== "CAGT_EFFECTIVE_AUTHORITY_REGISTRY" ||
      registry.reference.version !== "17.0.0") failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17_REQUIRED");
  if (registry.gateOrder.length !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.gateOrder.length ||
      registry.gateOrder.some((gate, index) => gate !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.gateOrder[index])) {
    failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17_GATE_ORDER_INVALID");
  }
  if (registry.gates !== CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.gates ||
      registry.productionImportCount !== 0 || registry.ProductActivationAuthority !== "NOT_AUTHORIZED" ||
      registry.ProductDecisionAuthority !== "LEGACY_PRODUCT_OUTPUT_ONLY" || registry.productRuntimeActive ||
      registry.ownerAccountDeliveryAuthorized) failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17_BOUNDARY_INVALID");
  return Object.freeze(failures);
}
