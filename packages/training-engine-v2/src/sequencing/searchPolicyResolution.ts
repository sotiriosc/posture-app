import {
  FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID,
  FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION,
  type ExplicitFinalSequencingSearchResourcePolicyInput,
  type FinalSequencingSearchResourcePolicy,
} from "./contracts";

export interface FinalSequencingSearchResourcePolicyResolution {
  readonly status:
    | "resolved"
    | "sequencing_search_policy_required"
    | "sequencing_search_policy_unavailable";
  readonly policy: FinalSequencingSearchResourcePolicy | null;
  readonly trace: readonly string[];
}

export function validateFinalSequencingSearchResourcePolicy(
  policy: FinalSequencingSearchResourcePolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (
    policy.policyId !== FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID ||
    policy.version !== FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION ||
    policy.mode !== "exact_only" ||
    policy.onLimit !== "RETURN_SEARCH_INCONCLUSIVE"
  ) reasons.push("SEQUENCING_SEARCH_POLICY_UNAVAILABLE");
  if (!Number.isSafeInteger(policy.maximumStatesExpanded) || policy.maximumStatesExpanded < 1) {
    reasons.push("SEQUENCING_SEARCH_POLICY_INVALID_STATE_LIMIT");
  }
  if (
    !Number.isSafeInteger(policy.maximumLegalCompleteOrdersEvaluated) ||
    policy.maximumLegalCompleteOrdersEvaluated < 1
  ) reasons.push("SEQUENCING_SEARCH_POLICY_INVALID_COMPLETE_ORDER_LIMIT");
  return [...new Set(reasons)].sort();
}

export function resolveFinalSequencingSearchResourcePolicy(input: {
  readonly policy: ExplicitFinalSequencingSearchResourcePolicyInput;
  readonly availablePolicies?: readonly FinalSequencingSearchResourcePolicy[];
}): FinalSequencingSearchResourcePolicyResolution {
  if (!input.policy) {
    return {
      status: "sequencing_search_policy_required",
      policy: null,
      trace: ["SEQUENCING_SEARCH_POLICY_REQUIRED"],
    };
  }
  const policy = "maximumStatesExpanded" in input.policy
    ? input.policy
    : input.availablePolicies?.find((candidate) =>
      candidate.policyId === input.policy?.policyId && candidate.version === input.policy?.version
    ) ?? null;
  if (!policy) {
    return {
      status: "sequencing_search_policy_unavailable",
      policy: null,
      trace: ["SEQUENCING_SEARCH_POLICY_UNAVAILABLE"],
    };
  }
  const validation = validateFinalSequencingSearchResourcePolicy(policy);
  if (validation.length > 0) {
    return { status: "sequencing_search_policy_unavailable", policy: null, trace: validation };
  }
  return {
    status: "resolved",
    policy,
    trace: [`SEQUENCING_SEARCH_POLICY_RESOLVED:${policy.policyId}@${policy.version}`],
  };
}
