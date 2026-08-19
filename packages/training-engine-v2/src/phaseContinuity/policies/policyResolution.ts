import type {
  ExplicitPhaseContinuityPolicyInput,
  PhaseContinuityPolicyReference,
  ProductionPhaseContinuityPolicy,
} from "./policyContracts";

export interface PhaseContinuityPolicyResolution {
  readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly policy: ProductionPhaseContinuityPolicy | null;
  readonly reasonCodes: readonly string[];
}

function sameReference(left: PhaseContinuityPolicyReference, right: PhaseContinuityPolicyReference): boolean {
  return left.policyId === right.policyId && left.version === right.version;
}

function semanticPolicy(policy: ProductionPhaseContinuityPolicy): string {
  return JSON.stringify({
    reference: policy.reference,
    philosophy: policy.philosophy,
    criterionDefinitionIds: policy.criterionDefinitionIds,
    automaticAdvancement: policy.automaticAdvancement,
    automaticRegression: policy.automaticRegression,
    automaticCycleReset: policy.automaticCycleReset,
    automaticProgression: policy.automaticProgression,
    automaticReplacement: policy.automaticReplacement,
    automaticRotation: policy.automaticRotation,
    automaticDeload: policy.automaticDeload,
  });
}

export function resolvePhaseContinuityPolicy(input: {
  readonly policy: ExplicitPhaseContinuityPolicyInput;
  readonly availablePolicies?: readonly ProductionPhaseContinuityPolicy[];
}): PhaseContinuityPolicyResolution {
  if (!input.policy) return Object.freeze({ status: "required", policy: null,
    reasonCodes: Object.freeze(["PHASE_CONTINUITY_POLICY_REQUIRED"]) });
  if ("state" in input.policy) return Object.freeze({ status: "resolved", policy: input.policy,
    reasonCodes: Object.freeze(["EXPLICIT_PHASE_CONTINUITY_POLICY_OBJECT"]) });
  const matches = (input.availablePolicies ?? []).filter((candidate) =>
    sameReference(candidate.reference, input.policy as PhaseContinuityPolicyReference));
  if (matches.length === 0) return Object.freeze({ status: "unavailable", policy: null,
    reasonCodes: Object.freeze(["PHASE_CONTINUITY_POLICY_UNAVAILABLE"]) });
  if (new Set(matches.map(semanticPolicy)).size > 1) return Object.freeze({ status: "conflict", policy: null,
    reasonCodes: Object.freeze(["PHASE_CONTINUITY_POLICY_CONFLICT"]) });
  return Object.freeze({ status: "resolved", policy: matches[0],
    reasonCodes: Object.freeze(["EXPLICIT_PHASE_CONTINUITY_POLICY_REGISTRY_MATCH"]) });
}
