import { sameSemanticValue } from "../../prescription/compiler/utilities";
import type {
  ExplicitProductionLongitudinalAdaptationPolicyInput,
  ProductionLongitudinalAdaptationPolicy,
  ProductionLongitudinalAdaptationPolicyReference,
} from "./policyContracts";

export interface ProductionLongitudinalPolicyResolution {
  readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly policy: ProductionLongitudinalAdaptationPolicy | null;
  readonly reasonCodes: readonly string[];
}

function sameReference(left: ProductionLongitudinalAdaptationPolicyReference,
  right: ProductionLongitudinalAdaptationPolicyReference): boolean {
  return left.policyId === right.policyId && left.version === right.version;
}

export function resolveProductionLongitudinalAdaptationPolicy(input: {
  readonly policy: ExplicitProductionLongitudinalAdaptationPolicyInput;
  readonly availablePolicies?: readonly ProductionLongitudinalAdaptationPolicy[];
}): ProductionLongitudinalPolicyResolution {
  if (!input.policy) return Object.freeze({ status: "required", policy: null,
    reasonCodes: Object.freeze(["LONGITUDINAL_ADAPTATION_POLICY_REQUIRED"]) });
  if ("state" in input.policy) return Object.freeze({ status: "resolved", policy: input.policy,
    reasonCodes: Object.freeze(["EXPLICIT_LONGITUDINAL_ADAPTATION_POLICY_OBJECT"]) });
  const reference = input.policy;
  const matches = (input.availablePolicies ?? []).filter((candidate) => sameReference(candidate.reference, reference));
  if (!matches.length) return Object.freeze({ status: "unavailable", policy: null,
    reasonCodes: Object.freeze(["LONGITUDINAL_ADAPTATION_POLICY_UNAVAILABLE"]) });
  if (matches.some((candidate) => !sameSemanticValue(candidate, matches[0]))) {
    return Object.freeze({ status: "conflict", policy: null,
      reasonCodes: Object.freeze(["LONGITUDINAL_ADAPTATION_POLICY_CONFLICT"]) });
  }
  return Object.freeze({ status: "resolved", policy: matches[0],
    reasonCodes: Object.freeze(["EXPLICIT_LONGITUDINAL_ADAPTATION_POLICY_REGISTRY_MATCH"]) });
}
