import type {
  ExplicitFinalSessionSequencingPolicyInput,
  FinalSessionSequencingPolicyResolution,
  ProductionFinalSessionSequencingPolicy,
} from "./contracts";
import {
  PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE,
  SESSION_SEQUENCING_POLICY_V1,
  SESSION_SEQUENCING_POLICY_V1_ID,
  SESSION_SEQUENCING_POLICY_V1_VERSION,
} from "./sessionSequencingPolicyV1";

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateFinalSessionSequencingPolicy(
  policy: ProductionFinalSessionSequencingPolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (!policy.policyId.trim() || !policy.version.trim()) {
    reasons.push("SEQUENCING_POLICY_IDENTITY_INVALID");
  }
  if (policy.policyId !== SESSION_SEQUENCING_POLICY_V1_ID ||
    policy.version !== SESSION_SEQUENCING_POLICY_V1_VERSION) {
    reasons.push("SEQUENCING_POLICY_UNAVAILABLE");
  }
  if (policy.activationAuthorized !== false || policy.state !== "reviewed_not_activated") {
    reasons.push("SEQUENCING_POLICY_ACTIVATION_BOUNDARY_INVALID");
  }
  if (!sameValue(policy.sectionPrecedence, PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE)) {
    reasons.push("SEQUENCING_POLICY_SECTION_PRECEDENCE_INVALID");
  }
  if (policy.executionMode !== "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY" || policy.pairingPermitted !== false) {
    reasons.push("SEQUENCING_POLICY_EXECUTION_MODE_INVALID");
  }
  if (policy.setupPolicy.relationshipIsDuration !== false || policy.timingPolicy.inventedTimePermitted !== false) {
    reasons.push("SEQUENCING_POLICY_NO_INVENTED_TIME_INVALID");
  }
  const ruleIds = policy.rules.map((rule) => rule.ruleId);
  if (new Set(ruleIds).size !== ruleIds.length) reasons.push("SEQUENCING_POLICY_DUPLICATE_RULE_ID");
  for (const conflict of policy.conflicts) {
    if (conflict.authority === "equal" && conflict.resolution === "unresolved") {
      reasons.push("SEQUENCING_POLICY_CONFLICT");
    }
  }
  const normalizedRules = (rules: ProductionFinalSessionSequencingPolicy["rules"]) =>
    [...rules].sort((left, right) => left.ruleId.localeCompare(right.ruleId));
  if (!sameValue(normalizedRules(policy.rules), normalizedRules(SESSION_SEQUENCING_POLICY_V1.rules)) ||
    !sameValue(policy.philosophy, SESSION_SEQUENCING_POLICY_V1.philosophy) ||
    !sameValue(policy.evaluationOrder, SESSION_SEQUENCING_POLICY_V1.evaluationOrder) ||
    !sameValue(policy.setupPolicy, SESSION_SEQUENCING_POLICY_V1.setupPolicy) ||
    !sameValue(policy.interferencePolicy, SESSION_SEQUENCING_POLICY_V1.interferencePolicy) ||
    !sameValue(policy.timingPolicy, SESSION_SEQUENCING_POLICY_V1.timingPolicy)) {
    reasons.push("SEQUENCING_POLICY_SEMANTICS_UNSUPPORTED");
  }
  if (policy.conflicts.length > 0 && !reasons.includes("SEQUENCING_POLICY_CONFLICT")) {
    reasons.push("SEQUENCING_POLICY_SEMANTICS_UNSUPPORTED");
  }
  const rulesByAuthority = new Map<string, ProductionFinalSessionSequencingPolicy["rules"][number]>();
  for (const rule of policy.rules) {
    const key = `${rule.kind}:${rule.section}:${rule.priority}`;
    const current = rulesByAuthority.get(key);
    if (current && current.value !== rule.value) reasons.push("SEQUENCING_POLICY_CONFLICT");
    rulesByAuthority.set(key, rule);
  }
  return [...new Set(reasons)].sort();
}

export function resolveFinalSessionSequencingPolicy(input: {
  readonly policy: ExplicitFinalSessionSequencingPolicyInput;
  readonly availablePolicies?: readonly ProductionFinalSessionSequencingPolicy[];
}): FinalSessionSequencingPolicyResolution {
  if (!input.policy) {
    return { status: "sequencing_policy_required", policy: null, trace: ["SEQUENCING_POLICY_REQUIRED"] };
  }
  const policy = "rules" in input.policy
    ? input.policy
    : input.availablePolicies?.find((candidate) =>
      candidate.policyId === input.policy?.policyId && candidate.version === input.policy?.version
    ) ?? null;
  if (!policy) {
    return { status: "sequencing_policy_unavailable", policy: null, trace: ["SEQUENCING_POLICY_UNAVAILABLE"] };
  }
  const validation = validateFinalSessionSequencingPolicy(policy);
  if (validation.length > 0) {
    return {
      status: validation.includes("SEQUENCING_POLICY_CONFLICT")
        ? "sequencing_policy_conflict"
        : "sequencing_policy_unavailable",
      policy: null,
      trace: validation,
    };
  }
  return {
    status: "resolved",
    policy,
    trace: [`SEQUENCING_POLICY_RESOLVED:${policy.policyId}@${policy.version}`],
  };
}
