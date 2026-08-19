import { validateGoalLocalPurposeCompatibility } from "../goalPurposePolicy";
import type { PrescriptionPurposeAuthority } from "../prescription/purposeResolution";
import { PRODUCTION_WEEKLY_INTENT_PLANNER_V1_1_REFERENCE,
  type ProductionExplicitWeeklyPriorityV1_1, type ProductionWeeklyIntentV1_1,
  type ProductionWeekPolicyV2 } from "./contracts";
import { resolveProductionWeekFrequencyV2 } from "./policyV2";

function relationshipFor(authority: PrescriptionPurposeAuthority) {
  if (authority === "primary_local_purpose") return "primary_weekly_goal" as const;
  if (authority === "secondary_local_purpose") return "secondary_weekly_goal" as const;
  return "cross_goal_support" as const;
}

export function planSupportedPurposeWeeklyIntentV1_1(input: {
  readonly policy: ProductionWeekPolicyV2;
  readonly intentId: string;
  readonly athleteId: string;
  readonly outcomeGoal: ProductionWeeklyIntentV1_1["outcomeGoal"];
  readonly priorities: readonly ProductionExplicitWeeklyPriorityV1_1[];
  readonly evaluationTime: string;
}): ProductionWeeklyIntentV1_1 {
  if (input.policy.activationAuthorized || input.policy.reference.version !== "2.0.0") {
    throw new Error("PRODUCTION_WEEK_POLICY_V2_REQUIRED");
  }
  const objectives = [...input.priorities].sort((left, right) =>
    left.priorityOrder - right.priorityOrder || left.priorityId.localeCompare(right.priorityId))
    .map((priority) => {
      const goalRelationship = priority.goalRelationships.find((entry) =>
        entry.relationship === relationshipFor(priority.purposeAuthority));
      const compatibility = validateGoalLocalPurposeCompatibility({
        outcomeGoal: input.outcomeGoal,
        localPurpose: priority.localPrescriptionPurpose,
        purposeAuthority: priority.purposeAuthority,
        goalRelationship: goalRelationship?.relationship ?? relationshipFor(priority.purposeAuthority),
        programmingContextModes: [],
        requestedSystemicScope: priority.localPrescriptionPurpose === "systemic_conditioning_development",
      });
      if (compatibility.status !== "compatible") {
        throw new Error(compatibility.reasonCodes[0] ?? "GOAL_LOCAL_PURPOSE_INCOMPATIBLE");
      }
      const frequencyIntent = resolveProductionWeekFrequencyV2(
        input.policy, priority.family, priority.priority,
      );
      if (!frequencyIntent) throw new Error(`WEEK_V2_FREQUENCY_REQUIRED:${priority.family}:${priority.priority}`);
      return Object.freeze({
        objectiveId: `week-v1_1:objective:${priority.priorityId}`,
        family: priority.family,
        purpose: priority.purpose,
        localPrescriptionPurpose: priority.localPrescriptionPurpose,
        purposeAuthority: priority.purposeAuthority,
        target: priority.target,
        priority: priority.priority,
        priorityOrder: priority.priorityOrder,
        goalRelationships: priority.goalRelationships,
        frequencyIntent,
        sourcePriorityIds: Object.freeze([priority.priorityId]),
        sourceEvidenceRefs: priority.sourceEvidenceRefs,
      });
    });
  return Object.freeze({
    plannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_V1_1_REFERENCE,
    intentId: input.intentId,
    athleteId: input.athleteId,
    outcomeGoal: input.outcomeGoal,
    policyReference: input.policy.reference,
    objectives: Object.freeze(objectives),
    evaluationTime: input.evaluationTime,
    selectionBehaviorChanged: false,
  });
}
