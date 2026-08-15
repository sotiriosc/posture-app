import { PRODUCTION_WEEK_POLICY_V1 } from "../weekPlanning/policy";
import type { ProductionWeekAllocationPlanV1_1, ProductionWeeklyIntentV1_1,
  ProductionWeekPolicyV2 } from "./contracts";

export function validateProductionWeekPolicyV2(policy: ProductionWeekPolicyV2): readonly string[] {
  const reasons: string[] = [];
  if (policy.reference.policyId !== "PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE" ||
      policy.reference.version !== "2.0.0" || policy.activationAuthorized) {
    reasons.push("PRODUCTION_WEEK_POLICY_V2_REFERENCE_OR_ACTIVATION_INVALID");
  }
  if (policy.inheritedFrequencyRules !== PRODUCTION_WEEK_POLICY_V1.frequencyRules ||
      policy.inheritedFrequencyRules.some((rule, index) => rule !== PRODUCTION_WEEK_POLICY_V1.frequencyRules[index])) {
    reasons.push("PRODUCTION_WEEK_POLICY_V1_RULES_CHANGED");
  }
  if (policy.addedFrequencyRules.length !== 6 ||
      !policy.addedFrequencyRules.some((entry) => entry.family === "movement_quality") ||
      !policy.addedFrequencyRules.some((entry) => entry.family === "muscular_endurance")) {
    reasons.push("PRODUCTION_WEEK_POLICY_V2_ADDED_FAMILIES_INVALID");
  }
  return Object.freeze(reasons.sort());
}

export function validatePurposePropagationV1_1(input: {
  readonly intent: ProductionWeeklyIntentV1_1;
  readonly plan: ProductionWeekAllocationPlanV1_1;
}): readonly string[] {
  const reasons: string[] = [];
  for (const reservation of input.plan.reservations) {
    const objective = input.intent.objectives.find((entry) =>
      entry.objectiveId === reservation.weeklyObjectiveId);
    if (!objective) reasons.push("WEEK_V1_1_RESERVATION_OBJECTIVE_MISSING");
    else if (objective.localPrescriptionPurpose !== reservation.localPrescriptionPurpose ||
        objective.purposeAuthority !== reservation.purposeAuthority) {
      reasons.push("WEEK_V1_1_LOCAL_PURPOSE_PROPAGATION_INVALID");
    }
  }
  if (input.plan.optionalBloatCount !== 0) reasons.push("WEEK_V1_1_OPTIONAL_BLOAT_INVALID");
  return Object.freeze([...new Set(reasons)].sort());
}
