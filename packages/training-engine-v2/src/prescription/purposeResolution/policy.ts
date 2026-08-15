import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE } from
  "../../productGoalArchitecture/contracts";
import type { PrescriptionPurposeSupportedMapping,
  ProductionPrescriptionPurposeResolverPolicy } from "./contracts";
import { PRESCRIPTION_PURPOSE_AUTHORITIES, PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER,
  PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES } from "./vocabularies";

export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_ID =
  "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_PURPOSE_FIRST_FAIL_CLOSED" as const;
export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_VERSION = "1.0.0" as const;
export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE =
  "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_PURPOSE_FIRST_FAIL_CLOSED@1.0.0" as const;
export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_STATUS =
  "OWNER_SELECTED_RESOLUTION_POLICY_IMPLEMENTED_NOT_ACTIVATED" as const;

const SUPPORTED_PURPOSE_MAPPINGS = [
  { mappingId: "purpose-v1:strength", localPurpose: "strength_development",
    sections: ["main", "accessory"], roles: ["primary_strength", "secondary_strength"],
    doseModes: ["repetition_sets"], useCases: ["main_strength", "secondary_strength"],
    authorityRequirement: "primary_or_secondary_local" },
  { mappingId: "purpose-v1:hypertrophy", localPurpose: "hypertrophy_development",
    sections: ["main", "accessory"], roles: ["primary_strength", "hypertrophy_accessory"],
    doseModes: ["repetition_sets"], useCases: ["main_hypertrophy", "hypertrophy_accessory"],
    authorityRequirement: "primary_or_secondary_local" },
  { mappingId: "purpose-v1:direct", localPurpose: "direct_development",
    sections: ["accessory"], roles: ["hypertrophy_accessory"], doseModes: ["repetition_sets"],
    useCases: ["direct_accessory"], authorityRequirement: "primary_or_secondary_local" },
  { mappingId: "purpose-v1:capacity", localPurpose: "capacity_development",
    sections: ["main", "accessory"], roles: ["capacity"],
    doseModes: ["distance_carry", "timed_carry", "step_march", "step_sets", "timed_hold"],
    useCases: ["capacity_carry", "accessory_carry", "developmental_stationary_march",
      "developmental_counted_steps", "timed_hold"], authorityRequirement: "primary_or_secondary_local" },
  { mappingId: "purpose-v1:preparation", localPurpose: "preparation", sections: ["warmup"],
    roles: ["preparation"], doseModes: ["repetition_sets", "timed_hold", "breath_cycles", "step_march", "step_sets"],
    useCases: ["preparation", "supporting_stationary_march", "supporting_counted_steps"],
    authorityRequirement: "dependency_support" },
  { mappingId: "purpose-v1:activation", localPurpose: "activation", sections: ["activation"],
    roles: ["activation"], doseModes: ["repetition_sets", "timed_hold", "step_march", "step_sets"],
    useCases: ["activation", "supporting_stationary_march", "supporting_counted_steps"],
    authorityRequirement: "dependency_support" },
  { mappingId: "purpose-v1:recovery", localPurpose: "recovery", sections: ["cooldown"],
    roles: ["recovery"], doseModes: ["breath_cycles", "timed_hold"],
    useCases: ["recovery_cooldown"], authorityRequirement: "explicit_local_or_dependency" },
  { mappingId: "purpose-v1:technique-control", localPurpose: "technique_or_control",
    sections: ["warmup", "activation", "accessory", "cooldown"],
    roles: ["preparation", "activation", "hypertrophy_accessory", "recovery"],
    doseModes: ["timed_hold", "breath_cycles", "step_march", "step_sets"],
    useCases: ["timed_hold", "breath_cycles", "supporting_stationary_march", "supporting_counted_steps"],
    authorityRequirement: "explicit_local_or_dependency" },
] as const satisfies readonly PrescriptionPurposeSupportedMapping[];

export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1:
ProductionPrescriptionPurposeResolverPolicy = Object.freeze({
  policyId: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_ID,
  version: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_VERSION,
  reference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  state: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_STATUS,
  ownerArchitecturePolicyReference: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE,
  resolutionOrder: PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER,
  authorityOrder: PRESCRIPTION_PURPOSE_AUTHORITIES,
  supportedMappings: Object.freeze(SUPPORTED_PURPOSE_MAPPINGS),
  unsupportedPurposes: PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES,
  conflictBehavior: "fail_closed",
  missingPurposeBehavior: "fail_closed",
  noBroadFallback: true,
  numericDoseValuesOwned: false,
  activationAuthorized: false,
});

export function resolvePrescriptionPurposeResolverPolicy(input: {
  readonly policy: import("./contracts").ExplicitPrescriptionPurposeResolverPolicyInput;
  readonly availablePolicies?: readonly ProductionPrescriptionPurposeResolverPolicy[];
}): { readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly policy: ProductionPrescriptionPurposeResolverPolicy | null; readonly trace: readonly string[] } {
  if (!input.policy) return { status: "required", policy: null,
    trace: ["PRESCRIPTION_PURPOSE_RESOLVER_POLICY_REQUIRED"] };
  if ("state" in input.policy) return { status: "resolved", policy: input.policy,
    trace: [`PURPOSE_RESOLVER_POLICY:${input.policy.reference}`] };
  const requested = input.policy;
  const candidates = (input.availablePolicies ?? []).filter((entry) =>
    entry.policyId === requested.policyId && entry.version === requested.version);
  if (candidates.length === 0) return { status: "unavailable", policy: null,
    trace: ["PRESCRIPTION_PURPOSE_RESOLVER_POLICY_UNAVAILABLE"] };
  if (candidates.length > 1) return { status: "conflict", policy: null,
    trace: ["PRESCRIPTION_PURPOSE_RESOLVER_POLICY_CONFLICT"] };
  return { status: "resolved", policy: candidates[0], trace: [`PURPOSE_RESOLVER_POLICY:${candidates[0].reference}`] };
}
