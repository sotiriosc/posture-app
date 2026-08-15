import type { ProgrammingContextMode, TrainingOutcomeGoal } from "../domain/sessionPlanningDirective";
import type { PrescriptionLocalPurpose, PrescriptionPurposeAuthority } from
  "../prescription/purposeResolution";

export const SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE = Object.freeze({
  policyId: "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY",
  version: "1.0.0",
} as const);

export const GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE = Object.freeze({
  policyId: "GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1",
  version: "1.0.0",
} as const);

export const SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STATUS =
  "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_IMPLEMENTED_NOT_ACTIVATED" as const;

export const SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CLASSIFICATION =
  "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_READY_FOR_EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_AUTHORIZATION" as const;

export const SUPPORTED_GOAL_LOCAL_PURPOSE_NEXT_DEPENDENCY =
  "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION" as const;

export const GOAL_LOCAL_PURPOSE_COMPATIBILITY_STATUSES = Object.freeze([
  "compatible",
  "local_purpose_required",
  "general_fitness_purpose_bundle_required",
  "systemic_conditioning_policy_required",
  "power_development_policy_required",
  "goal_local_purpose_incompatible",
  "goal_relationship_invalid",
] as const);
export type GoalLocalPurposeCompatibilityStatus =
  typeof GOAL_LOCAL_PURPOSE_COMPATIBILITY_STATUSES[number];

export interface GoalLocalPurposeCompatibilityInput {
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly localPurpose: PrescriptionLocalPurpose | null;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly goalRelationship: "primary_weekly_goal" | "secondary_weekly_goal" | "cross_goal_support";
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly requestedSystemicScope: boolean;
}

export interface GoalLocalPurposeCompatibilityResult {
  readonly policyReference: typeof GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE;
  readonly status: GoalLocalPurposeCompatibilityStatus;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly validatedLocalPurpose: PrescriptionLocalPurpose | null;
  readonly purposeCreatedFromGoal: false;
  readonly systemicConditioningComplete: false;
  readonly contextCreatesPurpose: false;
  readonly relationshipValid: boolean;
  readonly reasonCodes: readonly string[];
}

export interface SupportedGoalLocalPurposeDisposition {
  readonly localPurpose: PrescriptionLocalPurpose | "maintenance" | "return_or_rebuild" |
    "toning" | "body_composition" | "nutrition";
  readonly disposition: "supported_core" | "supported_new_policy" | "deferred" |
    "future_realization" | "outside_prescription_ownership";
  readonly reasonCode: string;
  readonly productionRuleCount: number;
}

export interface SupportedGoalAndLocalPurposePolicy {
  readonly reference: typeof SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_REFERENCE;
  readonly status: typeof SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STATUS;
  readonly compatibilityPolicyReference: typeof GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE;
  readonly dispositions: readonly SupportedGoalLocalPurposeDisposition[];
  readonly goalCreatesPurpose: false;
  readonly onePrimaryPurposePerAssignment: true;
  readonly blendedNumericPrescriptionAllowed: false;
  readonly duplicateSourceEventsAllowed: false;
  readonly equalPrimaryConflictBehavior: "fail_closed";
  readonly productActivationAuthorized: false;
}
