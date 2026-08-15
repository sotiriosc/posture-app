import { PRODUCTION_WEEK_POLICY_V1 } from "../weekPlanning/policy";
import type { ProductionWeekPolicyV2 } from "./contracts";

export function weekPolicyV1CompatibilityPreserved(policy: ProductionWeekPolicyV2): boolean {
  return policy.inheritedPolicyReference.policyId === PRODUCTION_WEEK_POLICY_V1.reference.policyId &&
    policy.inheritedPolicyReference.version === PRODUCTION_WEEK_POLICY_V1.reference.version &&
    policy.inheritedFrequencyRules === PRODUCTION_WEEK_POLICY_V1.frequencyRules;
}
