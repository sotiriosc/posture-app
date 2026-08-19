import { TRAINING_OUTCOME_GOALS } from "../domain/sessionPlanningDirective";
import { PRESCRIPTION_LOCAL_PURPOSES } from "../prescription/purposeResolution";
import { GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX } from "./compatibilityPolicyV1";
import type { SupportedGoalAndLocalPurposePolicy } from "./contracts";
import { GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE,
  SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE } from "./contracts";

export function validateSupportedGoalAndLocalPurposePolicy(
  policy: SupportedGoalAndLocalPurposePolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (policy.reference.policyId !== SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE.policyId ||
      policy.reference.version !== SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE.version) {
    reasons.push("SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE_INVALID");
  }
  if (policy.compatibilityPolicyReference.policyId !==
      GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE.policyId ||
      policy.productActivationAuthorized || policy.goalCreatesPurpose ||
      policy.blendedNumericPrescriptionAllowed || policy.duplicateSourceEventsAllowed) {
    reasons.push("SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_AUTHORITY_BOUNDARY_INVALID");
  }
  if (!policy.onePrimaryPurposePerAssignment ||
      policy.equalPrimaryConflictBehavior !== "fail_closed") {
    reasons.push("SUPPORTED_GOAL_LOCAL_PURPOSE_PRIMARY_POLICY_INVALID");
  }
  if (new Set(policy.dispositions.map((entry) => entry.localPurpose)).size !==
      policy.dispositions.length) reasons.push("SUPPORTED_GOAL_LOCAL_PURPOSE_DISPOSITION_DUPLICATED");
  for (const goal of TRAINING_OUTCOME_GOALS) {
    if (!GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX[goal]?.length) {
      reasons.push(`GOAL_LOCAL_PURPOSE_COMPATIBILITY_MISSING:${goal}`);
    }
  }
  for (const purpose of ["strength_development", "hypertrophy_development",
    "movement_quality_development", "muscular_endurance_development"] as const) {
    if (!PRESCRIPTION_LOCAL_PURPOSES.includes(purpose) ||
        !policy.dispositions.some((entry) => entry.localPurpose === purpose)) {
      reasons.push(`SUPPORTED_PURPOSE_DISPOSITION_MISSING:${purpose}`);
    }
  }
  return Object.freeze([...new Set(reasons)].sort());
}
