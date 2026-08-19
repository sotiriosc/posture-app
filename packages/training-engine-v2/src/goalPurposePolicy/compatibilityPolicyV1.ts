import type { PrescriptionLocalPurpose } from "../prescription/purposeResolution";
import { GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE,
  type GoalLocalPurposeCompatibilityInput,
  type GoalLocalPurposeCompatibilityResult } from "./contracts";

const COMPATIBLE_PURPOSES = Object.freeze({
  strength: ["strength_development", "hypertrophy_development", "direct_development",
    "movement_quality_development", "muscular_endurance_development", "capacity_development"],
  hypertrophy: ["hypertrophy_development", "strength_development", "direct_development",
    "movement_quality_development", "muscular_endurance_development", "capacity_development"],
  general_fitness: ["strength_development", "hypertrophy_development", "direct_development",
    "movement_quality_development", "muscular_endurance_development", "capacity_development"],
  posture_and_movement_quality: ["movement_quality_development", "strength_development",
    "hypertrophy_development", "direct_development", "capacity_development",
    "muscular_endurance_development"],
  conditioning: ["muscular_endurance_development", "capacity_development"],
} as const satisfies Readonly<Record<string, readonly PrescriptionLocalPurpose[]>>);

function relationshipValid(input: GoalLocalPurposeCompatibilityInput): boolean {
  if (input.purposeAuthority === "primary_local_purpose") {
    return input.goalRelationship === "primary_weekly_goal";
  }
  if (input.purposeAuthority === "secondary_local_purpose") {
    return input.goalRelationship === "secondary_weekly_goal";
  }
  if (input.purposeAuthority === "cross_goal_support") {
    return input.goalRelationship === "cross_goal_support";
  }
  return true;
}

export function validateGoalLocalPurposeCompatibility(
  input: GoalLocalPurposeCompatibilityInput,
): GoalLocalPurposeCompatibilityResult {
  const relationship = relationshipValid(input);
  const base = {
    policyReference: GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1_REFERENCE,
    outcomeGoal: input.outcomeGoal,
    validatedLocalPurpose: input.localPurpose,
    purposeCreatedFromGoal: false as const,
    systemicConditioningComplete: false as const,
    contextCreatesPurpose: false as const,
    relationshipValid: relationship,
  };
  if (!relationship) return Object.freeze({ ...base, status: "goal_relationship_invalid",
    reasonCodes: Object.freeze(["PURPOSE_AUTHORITY_GOAL_RELATIONSHIP_INVALID"]) });
  if (!input.localPurpose) {
    return Object.freeze({ ...base,
      status: input.outcomeGoal === "general_fitness" ?
        "general_fitness_purpose_bundle_required" : "local_purpose_required",
      reasonCodes: Object.freeze([input.outcomeGoal === "general_fitness" ?
        "GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED" : "EXPLICIT_LOCAL_PURPOSE_REQUIRED"]) });
  }
  if (input.localPurpose === "power_development") return Object.freeze({ ...base,
    status: "power_development_policy_required",
    reasonCodes: Object.freeze(["POWER_DEVELOPMENT_POLICY_REQUIRED"]) });
  if (input.localPurpose === "systemic_conditioning_development" ||
      (input.outcomeGoal === "conditioning" && input.requestedSystemicScope)) {
    return Object.freeze({ ...base, status: "systemic_conditioning_policy_required",
      reasonCodes: Object.freeze(["SYSTEMIC_CONDITIONING_POLICY_REQUIRED"]) });
  }
  const compatible = COMPATIBLE_PURPOSES[input.outcomeGoal].includes(input.localPurpose as never) ||
    ["preparation", "activation", "recovery", "technique_or_control"].includes(input.localPurpose);
  return Object.freeze({ ...base,
    status: compatible ? "compatible" : "goal_local_purpose_incompatible",
    reasonCodes: Object.freeze(compatible ? [
      `EXPLICIT_LOCAL_PURPOSE_VALIDATED:${input.localPurpose}`,
      ...input.programmingContextModes.map((mode) => `CONTEXT_ONLY:${mode}`),
    ] : [`GOAL_LOCAL_PURPOSE_INCOMPATIBLE:${input.outcomeGoal}:${input.localPurpose}`]),
  });
}

export const GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX = COMPATIBLE_PURPOSES;
