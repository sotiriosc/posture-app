import type { SupportedGoalAndLocalPurposePolicy,
  SupportedGoalLocalPurposeDisposition } from "./contracts";
import { GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE,
  SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE,
  SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STATUS } from "./contracts";

export const SUPPORTED_GOAL_LOCAL_PURPOSE_DISPOSITIONS = Object.freeze([
  ["strength_development", "supported_core", "EXISTING_STRENGTH_RULES_UNCHANGED", 0],
  ["hypertrophy_development", "supported_new_policy", "MAIN_ACCESSORY_UNCHANGED_SECONDARY_SH1_ADDED", 1],
  ["direct_development", "supported_core", "EXISTING_DIRECT_RULES_UNCHANGED", 0],
  ["capacity_development", "supported_core", "EXISTING_LOCAL_CAPACITY_RULES_UNCHANGED", 0],
  ["movement_quality_development", "supported_new_policy", "BOUNDED_REPETITION_QUALITY_PRACTICE_MQ1", 3],
  ["muscular_endurance_development", "supported_new_policy", "BOUNDED_LOCAL_REPETITION_ENDURANCE_ME1", 3],
  ["technique_or_control", "supported_core", "EXISTING_TECHNIQUE_CONTROL_RULES_UNCHANGED", 0],
  ["preparation", "supported_core", "EXISTING_PREPARATION_RULES_UNCHANGED", 0],
  ["activation", "supported_core", "EXISTING_ACTIVATION_RULES_UNCHANGED", 0],
  ["recovery", "supported_core", "EXISTING_RECOVERY_RULES_UNCHANGED", 0],
  ["systemic_conditioning_development", "deferred", "SYSTEMIC_CONDITIONING_POLICY_REQUIRED", 0],
  ["power_development", "deferred", "POWER_DEVELOPMENT_POLICY_REQUIRED", 0],
  ["maintenance", "deferred", "MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED", 0],
  ["return_or_rebuild", "future_realization", "RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED", 0],
  ["toning", "outside_prescription_ownership", "NO_TONING_PHYSIOLOGY", 0],
  ["body_composition", "outside_prescription_ownership", "SEPARATE_PRODUCT_PROFILE_OWNER_REQUIRED", 0],
  ["nutrition", "outside_prescription_ownership", "SEPARATE_NUTRITION_OWNER_REQUIRED", 0],
] .map(([localPurpose, disposition, reasonCode, productionRuleCount]) => Object.freeze({
  localPurpose, disposition, reasonCode, productionRuleCount,
})) as readonly SupportedGoalLocalPurposeDisposition[]);

export const SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1:
SupportedGoalAndLocalPurposePolicy = Object.freeze({
  reference: SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE,
  status: SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STATUS,
  compatibilityPolicyReference: GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE,
  dispositions: SUPPORTED_GOAL_LOCAL_PURPOSE_DISPOSITIONS,
  goalCreatesPurpose: false,
  onePrimaryPurposePerAssignment: true,
  blendedNumericPrescriptionAllowed: false,
  duplicateSourceEventsAllowed: false,
  equalPrimaryConflictBehavior: "fail_closed",
  productActivationAuthorized: false,
});

export const SUPPORTED_TRAINING_MODE_DISPOSITIONS = Object.freeze({
  develop: "SUPPORTED_CURRENT_DEVELOPMENTAL_BEHAVIOR",
  maintain: "MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED",
  return_or_rebuild: "RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED",
} as const);
