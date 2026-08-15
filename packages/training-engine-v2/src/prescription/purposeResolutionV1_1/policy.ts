import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_ID,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_VERSION } from "../purposeResolution";
import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
  type PrescriptionPurposeSupportedMappingV1_1,
  type ProductionPrescriptionPurposeResolverPolicyV1_1 } from "./contracts";

const INHERITED_MAPPINGS = PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings as
  readonly PrescriptionPurposeSupportedMappingV1_1[];

const ADDED_MAPPINGS: readonly PrescriptionPurposeSupportedMappingV1_1[] = Object.freeze([
  Object.freeze<PrescriptionPurposeSupportedMappingV1_1>({ mappingId: "purpose-v1_1:secondary-hypertrophy",
    localPurpose: "hypertrophy_development", sections: ["main", "accessory"],
    roles: ["secondary_strength"], doseModes: ["repetition_sets"],
    useCases: ["secondary_hypertrophy"] }),
  Object.freeze<PrescriptionPurposeSupportedMappingV1_1>({ mappingId: "purpose-v1_1:movement-quality",
    localPurpose: "movement_quality_development", sections: ["main", "accessory"],
    roles: ["primary_strength", "secondary_strength", "hypertrophy_accessory"],
    doseModes: ["repetition_sets"],
    useCases: ["movement_quality_main", "movement_quality_accessory"] }),
  Object.freeze<PrescriptionPurposeSupportedMappingV1_1>({ mappingId: "purpose-v1_1:muscular-endurance",
    localPurpose: "muscular_endurance_development", sections: ["main", "accessory"],
    roles: ["primary_strength", "secondary_strength", "hypertrophy_accessory"],
    doseModes: ["repetition_sets"],
    useCases: ["muscular_endurance_main", "muscular_endurance_accessory"] }),
]);

export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1:
ProductionPrescriptionPurposeResolverPolicyV1_1 = Object.freeze({
  reference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
  state: "OWNER_SELECTED_RESOLUTION_POLICY_IMPLEMENTED_NOT_ACTIVATED",
  inheritedPolicyReference: Object.freeze({
    policyId: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_ID,
    version: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_VERSION,
  }),
  inheritedMappings: INHERITED_MAPPINGS,
  addedMappings: ADDED_MAPPINGS,
  supportedMappings: Object.freeze([...INHERITED_MAPPINGS, ...ADDED_MAPPINGS]),
  unsupportedPurposes: Object.freeze([
    "systemic_conditioning_development", "power_development",
  ] as const),
  noBroadFallback: true,
  goalCreatesPurpose: false,
  activationAuthorized: false,
});

export function resolvePrescriptionPurposeResolverPolicyV1_1(input: {
  readonly policy: import("./contracts").ExplicitPrescriptionPurposeResolverPolicyV1_1Input;
  readonly availablePolicies?: readonly ProductionPrescriptionPurposeResolverPolicyV1_1[];
}): { readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly policy: ProductionPrescriptionPurposeResolverPolicyV1_1 | null } {
  if (!input.policy) return { status: "required", policy: null };
  const reference = input.policy;
  if ("supportedMappings" in reference) return { status: "resolved", policy: reference };
  const candidates = (input.availablePolicies ?? []).filter((entry) =>
    entry.reference.policyId === reference.policyId &&
    entry.reference.version === reference.version);
  if (candidates.length === 0) return { status: "unavailable", policy: null };
  if (candidates.length > 1) return { status: "conflict", policy: null };
  return { status: "resolved", policy: candidates[0] };
}
