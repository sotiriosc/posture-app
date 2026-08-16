import { createHash } from "node:crypto";
import { CAGT_GATE_ORDER } from "../contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE,
} from "../effectiveAuthorityRegistryV2";

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_REFERENCE = Object.freeze({
  registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY",
  version: "16.0.0",
} as const);

const semantic = {
  reference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_REFERENCE,
  gateOrder: CAGT_GATE_ORDER,
  gates: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.gates,
  historicalGate14CompatibilityRegistryReference:
    CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2_REFERENCE,
  historicalRegistryPreserved: true as const,
  goalSpecificShadowEvidenceAuthority:
    "TEST_DEVELOPER_CONTROLLED_SHADOW_EVIDENCE" as const,
  mappingProfileAuthority:
    "CONTROLLED_SHADOW_MAPPING_AUTHORITY_NOT_PRODUCT_DECISION" as const,
  pipelineProfileAuthority:
    "CONTROLLED_SHADOW_PIPELINE_AUTHORITY_EXPLICIT_ONLY" as const,
  productDecisionAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY" as const,
  productActivationAuthority: "NOT_AUTHORIZED" as const,
  performanceAuthority: "NONE_COUNTERFACTUAL_ONLY" as const,
  outcomeClaimAuthority: "NONE" as const,
  productionImportCount: 0 as const,
  provenance: Object.freeze([
    "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@2.0.0:PRESERVED",
    "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE@1.0.0",
    "test-developer-only:not-product-runtime-authority",
  ]),
};

export const CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16 = Object.freeze({
  ...semantic,
  fingerprint: createHash("sha256").update(JSON.stringify(semantic)).digest("hex"),
});

export function validateCagtEffectiveAuthorityRegistryV16(): readonly string[] {
  const failures: string[] = [];
  const registry = CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16;
  if (registry.reference.registryId !== "CAGT_EFFECTIVE_AUTHORITY_REGISTRY" ||
      registry.reference.version !== "16.0.0") {
    failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_REQUIRED");
  }
  if (registry.gateOrder.length !== CAGT_GATE_ORDER.length ||
      registry.gateOrder.some((gate, index) => gate !== CAGT_GATE_ORDER[index])) {
    failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_GATE_ORDER_INVALID");
  }
  if (registry.productionImportCount !== 0 ||
      registry.productDecisionAuthority !== "LEGACY_PRODUCT_OUTPUT_ONLY" ||
      registry.productActivationAuthority !== "NOT_AUTHORIZED" ||
      registry.performanceAuthority !== "NONE_COUNTERFACTUAL_ONLY" ||
      registry.outcomeClaimAuthority !== "NONE") {
    failures.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16_BOUNDARY_INVALID");
  }
  return Object.freeze(failures);
}
