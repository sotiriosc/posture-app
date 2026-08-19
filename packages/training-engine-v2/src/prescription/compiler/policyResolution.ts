import {
  PRESCRIPTION_POLICY_SPECIFICITY_ORDER,
  type ProductionPrescriptionPolicy,
} from "../policies";
import type { ExplicitPrescriptionPolicyInput } from "./contracts";
import { sameSemanticValue } from "./utilities";

export interface PrescriptionPolicyResolutionResult {
  readonly status:
    | "resolved"
    | "prescription_policy_required"
    | "prescription_policy_unavailable"
    | "prescription_policy_conflict";
  readonly policy: ProductionPrescriptionPolicy | null;
  readonly trace: readonly string[];
}

export function resolvePrescriptionPolicy(input: {
  readonly policy: ExplicitPrescriptionPolicyInput;
  readonly availablePolicies?: readonly ProductionPrescriptionPolicy[];
}): PrescriptionPolicyResolutionResult {
  if (input.policy === null) {
    return {
      status: "prescription_policy_required",
      policy: null,
      trace: ["PRESCRIPTION_POLICY_REQUIRED"],
    };
  }
  const policy = "rules" in input.policy
    ? input.policy
    : input.availablePolicies?.find((candidate) =>
      candidate.policyId === input.policy?.policyId &&
      candidate.version === input.policy?.version
    ) ?? null;
  if (!policy) {
    return {
      status: "prescription_policy_unavailable",
      policy: null,
      trace: ["PRESCRIPTION_POLICY_UNAVAILABLE"],
    };
  }
  const validation = validateProductionPrescriptionPolicy(policy);
  if (validation.length > 0) {
    return {
      status: validation.includes("PRESCRIPTION_POLICY_EQUAL_AUTHORITY_CONFLICT")
        ? "prescription_policy_conflict"
        : "prescription_policy_unavailable",
      policy: null,
      trace: validation,
    };
  }
  return {
    status: "resolved",
    policy,
    trace: [`PRESCRIPTION_POLICY_RESOLVED:${policy.policyId}@${policy.version}`],
  };
}

export function validateProductionPrescriptionPolicy(
  policy: ProductionPrescriptionPolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (!policy.policyId.trim() || !policy.version.trim()) reasons.push("PRESCRIPTION_POLICY_IDENTITY_INVALID");
  if (policy.activationAuthorized !== false) reasons.push("PRESCRIPTION_POLICY_ACTIVATION_BOUNDARY_INVALID");
  if (
    JSON.stringify(policy.specificityOrder) !==
    JSON.stringify(PRESCRIPTION_POLICY_SPECIFICITY_ORDER)
  ) reasons.push("PRESCRIPTION_POLICY_SPECIFICITY_ORDER_INVALID");
  const ids = policy.rules.map((rule) => rule.ruleId);
  if (new Set(ids).size !== ids.length) reasons.push("PRESCRIPTION_POLICY_DUPLICATE_RULE_ID");
  const byApplicability = new Map<string, ProductionPrescriptionPolicy["rules"][number]>();
  for (const rule of policy.rules) {
    const key = JSON.stringify(rule.applicability);
    const existing = byApplicability.get(key);
    if (existing && !sameSemanticValue(existing.value, rule.value) &&
      !existing.overrideOfRuleIds.includes(rule.ruleId) &&
      !rule.overrideOfRuleIds.includes(existing.ruleId)) {
      reasons.push("PRESCRIPTION_POLICY_EQUAL_AUTHORITY_CONFLICT");
    }
    byApplicability.set(key, rule);
  }
  for (const conflict of policy.conflicts) {
    if (
      conflict.authority === "equal" &&
      conflict.resolution === "unresolved"
    ) reasons.push("PRESCRIPTION_POLICY_EQUAL_AUTHORITY_CONFLICT");
  }
  return [...new Set(reasons)].sort();
}
