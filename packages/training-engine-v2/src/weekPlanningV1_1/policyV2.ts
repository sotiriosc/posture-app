import { PRODUCTION_WEEK_POLICY_V1 } from "../weekPlanning/policy";
import type { ProductionPlanningObjectivePriority, ProductionWeekPlanningFrequencyIntent } from
  "../weekPlanning/contracts";
import { PRODUCTION_WEEK_POLICY_V2_REFERENCE, type ProductionWeekFrequencyRuleV2,
  type ProductionWeekObjectiveFamilyV1_1, type ProductionWeekPolicyV2,
  type WeekFrequencyCandidate } from "./contracts";

const frequencyCandidate = (candidate: WeekFrequencyCandidate): WeekFrequencyCandidate =>
  Object.freeze(candidate);

export const WEEK_V2_FREQUENCY_CANDIDATES = Object.freeze([
  frequencyCandidate({ candidateId: "MQF1", family: "movement_quality", ownerPreferred: false,
    required: [1, 1, 2], preferred: [0, 1, 2], optional: [0, 1, 1] }),
  frequencyCandidate({ candidateId: "MQF2", family: "movement_quality", ownerPreferred: true,
    required: [1, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
  frequencyCandidate({ candidateId: "MQF3", family: "movement_quality", ownerPreferred: false,
    required: [2, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
  frequencyCandidate({ candidateId: "MEF1", family: "muscular_endurance", ownerPreferred: false,
    required: [1, 1, 2], preferred: [0, 1, 2], optional: [0, 1, 1] }),
  frequencyCandidate({ candidateId: "MEF2", family: "muscular_endurance", ownerPreferred: true,
    required: [1, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
  frequencyCandidate({ candidateId: "MEF3", family: "muscular_endurance", ownerPreferred: false,
    required: [2, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
]);

function frequency(values: readonly [number, number, number], sourceRef: string):
ProductionWeekPlanningFrequencyIntent {
  return Object.freeze({
    minimumAllocatedSessions: values[0],
    targetAllocatedSessions: values[1],
    softMaximumAllocatedSessions: values[2],
    sourceRef,
  });
}

function addedRules(family: "movement_quality" | "muscular_endurance",
  candidateId: "MQF2" | "MEF2"): readonly ProductionWeekFrequencyRuleV2[] {
  const candidate = WEEK_V2_FREQUENCY_CANDIDATES.find((entry) => entry.candidateId === candidateId)!;
  return Object.freeze((["required", "preferred", "optional"] as const).map((priority) => Object.freeze({
    family,
    priority,
    frequency: frequency(candidate[priority], `WEEK_POLICY_V2:${candidateId}:${priority}`),
    ruleId: `WEEK_POLICY_V2:${candidateId}:${priority}`,
  })));
}

const ADDED_RULES = Object.freeze([
  ...addedRules("movement_quality", "MQF2"),
  ...addedRules("muscular_endurance", "MEF2"),
]);

export const PRODUCTION_WEEK_POLICY_V2: ProductionWeekPolicyV2 = Object.freeze({
  reference: PRODUCTION_WEEK_POLICY_V2_REFERENCE,
  inheritedPolicyReference: PRODUCTION_WEEK_POLICY_V1.reference,
  inheritedFrequencyRules: PRODUCTION_WEEK_POLICY_V1.frequencyRules,
  addedFrequencyRules: ADDED_RULES,
  frequencyRules: Object.freeze([...PRODUCTION_WEEK_POLICY_V1.frequencyRules, ...ADDED_RULES]),
  selectedMovementQualityCandidate: "MQF2",
  selectedMuscularEnduranceCandidate: "MEF2",
  activationAuthorized: false,
});

export function resolveProductionWeekFrequencyV2(
  policy: ProductionWeekPolicyV2,
  family: Exclude<ProductionWeekObjectiveFamilyV1_1, "participation" | "spacing">,
  priority: ProductionPlanningObjectivePriority,
): ProductionWeekPlanningFrequencyIntent | null {
  return policy.frequencyRules.find((entry) => entry.family === family &&
    entry.priority === priority)?.frequency ?? null;
}
