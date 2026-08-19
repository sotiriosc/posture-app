import { PRESCRIPTION_POLICY_SPECIFICITY_ORDER, PRESCRIPTION_POLICY_V1 } from "../policies";
import { PRESCRIPTION_POLICY_V2_NEW_USE_CASES,
  type ProductionPrescriptionPolicyV2 } from "./policyContracts";

export function validateProductionPrescriptionPolicyV2(
  policy: ProductionPrescriptionPolicyV2,
): readonly string[] {
  const reasons: string[] = [];
  if (policy.policyId !== "PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE" ||
      policy.version !== "2.0.0") reasons.push("PRESCRIPTION_POLICY_V2_REFERENCE_INVALID");
  if (policy.activationAuthorized || policy.state !== "reviewed_not_activated") {
    reasons.push("PRESCRIPTION_POLICY_V2_ACTIVATION_BOUNDARY_INVALID");
  }
  if (JSON.stringify(policy.specificityOrder) !== JSON.stringify(PRESCRIPTION_POLICY_SPECIFICITY_ORDER)) {
    reasons.push("PRESCRIPTION_POLICY_V2_SPECIFICITY_ORDER_INVALID");
  }
  if (policy.inheritedRuleCount !== PRESCRIPTION_POLICY_V1.rules.length ||
      PRESCRIPTION_POLICY_V1.rules.some((rule, index) => policy.rules[index] !== rule)) {
    reasons.push("PRESCRIPTION_POLICY_V1_RULE_REFERENCE_CHANGED");
  }
  const newRules = policy.rules.slice(policy.inheritedRuleCount);
  if (newRules.length !== 7 || newRules.some((rule) =>
    !PRESCRIPTION_POLICY_V2_NEW_USE_CASES.includes(rule.applicability.useCase as never))) {
    reasons.push("PRESCRIPTION_POLICY_V2_NEW_RULE_SCOPE_INVALID");
  }
  if (newRules.some((rule) => rule.applicability.doseMode !== "repetition_sets")) {
    reasons.push("PRESCRIPTION_POLICY_V2_NEW_RULE_MODE_INVALID");
  }
  if (new Set(policy.rules.map((rule) => rule.ruleId)).size !== policy.rules.length) {
    reasons.push("PRESCRIPTION_POLICY_V2_DUPLICATE_RULE_ID");
  }
  if (policy.rules.some((rule) => /power|systemic|maintenance|return|toning/i.test(rule.ruleId))) {
    reasons.push("PRESCRIPTION_POLICY_V2_DEFERRED_RULE_ADMITTED");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
