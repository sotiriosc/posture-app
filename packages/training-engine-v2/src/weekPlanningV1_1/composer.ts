import { PRODUCTION_WEEK_ALLOCATION_COMPOSER_V1_1_REFERENCE,
  type ProductionSessionResponsibilityPurposeV1_1, type ProductionWeekAllocationPlanV1_1,
  type ProductionWeeklyDevelopmentObjectiveV1_1, type ProductionWeeklyIntentV1_1 } from "./contracts";

function responsibility(objective: ProductionWeeklyDevelopmentObjectiveV1_1):
ProductionSessionResponsibilityPurposeV1_1 {
  if (objective.family === "movement_quality") return objective.priority === "required" ?
    "movement_quality_main" : "movement_quality_accessory";
  if (objective.family === "muscular_endurance") return objective.priority === "required" ?
    "muscular_endurance_main" : "muscular_endurance_accessory";
  if (objective.family === "strength") return objective.purposeAuthority === "primary_local_purpose" ?
    "dominant_main" : "secondary_main";
  if (objective.family === "muscle") return objective.purposeAuthority === "primary_local_purpose" ?
    "dominant_main" : "secondary_main";
  if (objective.family === "direct") return "direct_accessory";
  if (objective.family === "capacity") return objective.priority === "required" ?
    "capacity_main" : "capacity_accessory";
  return "secondary_accessory";
}

export function composeSupportedPurposeWeekV1_1(input: {
  readonly intent: ProductionWeeklyIntentV1_1;
  readonly opportunities: ProductionWeekAllocationPlanV1_1["opportunities"];
}): ProductionWeekAllocationPlanV1_1 {
  const reservations = input.intent.objectives.flatMap((objective, objectiveIndex) => {
    const desired = Math.min(objective.frequencyIntent.targetAllocatedSessions,
      input.opportunities.length);
    const minimum = Math.min(objective.frequencyIntent.minimumAllocatedSessions,
      input.opportunities.length);
    const count = Math.max(minimum, desired);
    return Array.from({ length: count }, (_, index) => {
      const opportunity = input.opportunities[(objectiveIndex + index) % input.opportunities.length];
      if (!opportunity) return null;
      return Object.freeze({
        responsibilityId: `week-v1_1:responsibility:${objective.objectiveId}:${opportunity.opportunityId}`,
        weeklyObjectiveId: objective.objectiveId,
        opportunityId: opportunity.opportunityId,
        purpose: responsibility(objective),
        localPrescriptionPurpose: objective.localPrescriptionPurpose,
        purposeAuthority: objective.purposeAuthority,
        priority: objective.priority,
        priorityOrder: objective.priorityOrder,
        sourceEvidenceRefs: objective.sourceEvidenceRefs,
      });
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  });
  const represented = new Set(reservations.map((entry) => entry.weeklyObjectiveId));
  return Object.freeze({
    composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_V1_1_REFERENCE,
    planId: `week-v1_1:plan:${input.intent.intentId}`,
    weeklyIntentId: input.intent.intentId,
    opportunities: input.opportunities,
    reservations: Object.freeze(reservations),
    omittedObjectiveIds: Object.freeze(input.intent.objectives.filter((entry) =>
      !represented.has(entry.objectiveId)).map((entry) => entry.objectiveId)),
    optionalBloatCount: 0,
  });
}
