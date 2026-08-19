import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import {
  canonicalWeekFingerprint,
  deriveReservationId,
  deriveReservationRevisionId,
  deriveWeekPlanId,
  deriveWeekPlanRevisionId,
  explicitIsoTime,
  sameSemanticValue,
  stableId,
  uniqueSorted,
  validateProductionSessionFeasibilityResult,
  validateProductionSpacingRequirement,
  validateProductionWeekAllocationPlan,
  validateProductionWeekPlanningSourceSnapshot,
  validateProductionWeekSearchResourcePolicy,
  validateProductionWeeklyIntent,
} from "./canonical";
import {
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
  type ProductionSessionAllocationReservation,
  type ProductionSessionFeasibilityResult,
  type ProductionSessionFeasibilityStatus,
  type ProductionSessionResponsibilityPurpose,
  type ProductionWeekAllocationComposerInput,
  type ProductionWeekAllocationPlan,
  type ProductionWeekAllocationStatus,
  type ProductionWeekEvaluationVector,
  type ProductionWeekObjectiveSatisfactionState,
  type ProductionWeekTopologyPolicy,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeeklyDevelopmentObjective,
  type ProductionWeeklyRecoverySpacingRequirement,
} from "./contracts";
import { resolveProductionWeekPolicy } from "./policy";
import { isConfirmedProductionTrainingOpportunity } from "./source";

const PRIORITY_RANK = { required: 0, preferred: 1, optional: 2 } as const;
const FEASIBILITY_RANK: Readonly<Record<ProductionSessionFeasibilityStatus, number>> = {
  feasible_session_skeleton: 7,
  prescription_resolution_required: 6,
  candidate_review_required: 5,
  unsupported_objective_scope: 4,
  search_inconclusive: 3,
  invalid_oracle_input: 2,
  blocked_by_training_readiness: 1,
  infeasible_objective_combination: 0,
};

function planRevisionId(
  content: Omit<ProductionWeekAllocationPlan, "weekPlanRevisionId" | "provenance">,
): string {
  const reservations = content.reservations.map((reservation) => {
    const { weekPlanRevisionId, reservationRevisionId, provenance, ...reservationContent } = reservation;
    void weekPlanRevisionId;
    void reservationRevisionId;
    void provenance;
    return reservationContent;
  });
  return deriveWeekPlanRevisionId({ ...content, reservations });
}

type Assignment = Readonly<Record<string, readonly string[]>>;

function combinations(values: readonly string[], count: number): readonly (readonly string[])[] {
  if (count === 0) return [[]];
  if (count > values.length) return [];
  const output: string[][] = [];
  const visit = (start: number, selected: string[]): void => {
    if (selected.length === count) { output.push([...selected]); return; }
    for (let index = start; index < values.length; index += 1) {
      selected.push(values[index]!);
      visit(index + 1, selected);
      selected.pop();
    }
  };
  visit(0, []);
  return output;
}

function assignmentKey(assignment: Assignment): string {
  return Object.entries(assignment).sort(([left], [right]) => left.localeCompare(right))
    .map(([objectiveId, opportunities]) => `${objectiveId}:${[...opportunities].sort().join(",")}`).join("|");
}

function enumerateAssignments(input: ProductionWeekAllocationComposerInput, opportunityIds: readonly string[]): {
  readonly assignments: readonly Assignment[];
  readonly expandedStates: number;
  readonly completePlans: number;
  readonly limitReached: boolean;
  readonly boundedFrontierUsed: boolean;
} {
  let states: readonly Assignment[] = [Object.freeze({})];
  let expandedStates = 0;
  let limitReached = false;
  let boundedFrontierUsed = false;
  const objectives = [...input.weeklyIntent.objectives].sort((left, right) =>
    PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] || left.priorityOrder - right.priorityOrder ||
    left.objectiveId.localeCompare(right.objectiveId));
  for (const objective of objectives) {
    const minimum = objective.priority === "optional" ? 0 : objective.frequencyIntent.minimumAllocatedSessions;
    const maximum = objective.priority === "optional" && !objective.uniqueMarginalValueRef ? 0 :
      Math.min(opportunityIds.length, objective.frequencyIntent.targetAllocatedSessions);
    const choices: (readonly string[])[] = [];
    for (let count = minimum; count <= maximum; count += 1) choices.push(...combinations(opportunityIds, count));
    const next: Assignment[] = [];
    outer: for (const state of states) {
      for (const choice of choices) {
        expandedStates += 1;
        if (expandedStates > input.searchResourcePolicy.maximumExpandedStates) {
          limitReached = true;
          break outer;
        }
        next.push(Object.freeze({ ...state, [objective.objectiveId]: Object.freeze([...choice]) }));
      }
    }
    if (limitReached && input.searchResourcePolicy.mode === "exact_only") {
      return { assignments: Object.freeze([]), expandedStates, completePlans: 0, limitReached, boundedFrontierUsed };
    }
    if (limitReached || next.length > input.searchResourcePolicy.maximumParetoStatesRetained) {
      limitReached = true;
      boundedFrontierUsed = true;
      states = Object.freeze([...next].sort((left, right) => assignmentKey(left).localeCompare(assignmentKey(right)))
        .slice(0, input.searchResourcePolicy.maximumParetoStatesRetained));
    } else {
      states = Object.freeze(next);
    }
  }
  if (states.length > input.searchResourcePolicy.maximumCompletePlansEvaluated) {
    limitReached = true;
    boundedFrontierUsed = true;
    states = Object.freeze([...states].sort((left, right) => assignmentKey(left).localeCompare(assignmentKey(right)))
      .slice(0, input.searchResourcePolicy.maximumCompletePlansEvaluated));
  }
  return { assignments: states, expandedStates, completePlans: states.length, limitReached, boundedFrontierUsed };
}

function objectiveIdsAt(assignment: Assignment, opportunityId: string): readonly string[] {
  return Object.entries(assignment).filter(([, opportunityIds]) => opportunityIds.includes(opportunityId))
    .map(([objectiveId]) => objectiveId).sort();
}

function topologyPrimarySequence(policy: ProductionWeekTopologyPolicy): readonly string[] {
  const sequence: string[] = [];
  const maximumGroupSize = Math.max(0, ...policy.coherenceGroups.map((group) => group.objectiveIds.length));
  for (let index = 0; index < maximumGroupSize; index += 1) {
    for (const group of policy.coherenceGroups) {
      const objectiveId = group.objectiveIds[index];
      if (objectiveId) sequence.push(objectiveId);
    }
  }
  return Object.freeze(sequence);
}

function primaryObjectivesForAssignment(
  input: ProductionWeekAllocationComposerInput,
  assignment: Assignment,
  opportunities: readonly ProductionWeekTrainingOpportunity[],
): ReadonlyMap<string, string> {
  if (!input.topologyPolicy) return new Map();
  const eligible = new Set(input.topologyPolicy.eligibleObjectiveIds);
  const sequence = topologyPrimarySequence(input.topologyPolicy);
  const sequenceRank = new Map(sequence.map((objectiveId, index) => [objectiveId, index]));
  const primaryCounts = new Map(sequence.map((objectiveId) => [objectiveId, 0]));
  const selected = new Map<string, string>();
  const active = opportunities.filter((opportunity) =>
    objectiveIdsAt(assignment, opportunity.opportunityId).length > 0);
  for (const [index, opportunity] of active.entries()) {
    const candidates = objectiveIdsAt(assignment, opportunity.opportunityId).filter((id) => eligible.has(id));
    if (candidates.length === 0) continue;
    const desired = sequence[index % sequence.length];
    const primary = [...candidates].sort((left, right) => {
      if ((left === desired) !== (right === desired)) return left === desired ? -1 : 1;
      const countDifference = (primaryCounts.get(left) ?? 0) - (primaryCounts.get(right) ?? 0);
      if (countDifference !== 0) return countDifference;
      return (sequenceRank.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (sequenceRank.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right);
    })[0]!;
    selected.set(opportunity.opportunityId, primary);
    primaryCounts.set(primary, (primaryCounts.get(primary) ?? 0) + 1);
  }
  return selected;
}

function topologyEvaluation(
  input: ProductionWeekAllocationComposerInput,
  assignment: Assignment,
  opportunities: readonly ProductionWeekTrainingOpportunity[],
): Partial<Pick<ProductionWeekEvaluationVector, "topologyPolicyReference" | "requiredTargetExposureVector" |
  "requiredResponsibilityConcentrationVector" | "occupiedSessionCount" |
  "withinWeekPrimaryEmphasisBalanceVector" | "primaryEmphasisFingerprint" | "topologyProvenance">> {
  const policy = input.topologyPolicy;
  if (!policy) return Object.freeze({});
  const eligible = new Set(policy.eligibleObjectiveIds);
  const eligibleObjectives = input.weeklyIntent.objectives.filter((objective) => eligible.has(objective.objectiveId))
    .sort((left, right) => left.priorityOrder - right.priorityOrder || left.objectiveId.localeCompare(right.objectiveId));
  const active = opportunities.filter((opportunity) =>
    objectiveIdsAt(assignment, opportunity.opportunityId).length > 0);
  const concentrations = active.map((opportunity) => objectiveIdsAt(assignment, opportunity.opportunityId)
    .filter((objectiveId) => eligible.has(objectiveId)).length);
  const maximumConcentration = Math.max(0, ...concentrations);
  const concentrationExcess = concentrations.reduce((sum, count) => sum +
    Math.max(0, count - policy.preferredMaximumRequiredResponsibilitiesPerSession), 0);
  const concentrationSpread = concentrations.length === 0 ? 0 :
    maximumConcentration - Math.min(...concentrations);
  const targetExposureTotal = eligibleObjectives.reduce((sum, objective) =>
    sum + objective.frequencyIntent.targetAllocatedSessions, 0);
  const balancedBase = active.length === 0 ? 0 : Math.floor(targetExposureTotal / active.length);
  const balancedRemainder = active.length === 0 ? 0 : targetExposureTotal % active.length;
  const orderedBalanceDeviation = concentrations.reduce((sum, count, index) =>
    sum + Math.abs(count - (balancedBase + (index < balancedRemainder ? 1 : 0))), 0);
  const primaryByOpportunity = primaryObjectivesForAssignment(input, assignment, opportunities);
  const primarySequence = topologyPrimarySequence(policy);
  const primaryCounts = new Map(policy.eligibleObjectiveIds.map((objectiveId) => [objectiveId, 0]));
  const groupByObjective = new Map(policy.coherenceGroups.flatMap((group) =>
    group.objectiveIds.map((objectiveId) => [objectiveId, group.groupId] as const)));
  let mixedGroupSessionCount = 0;
  let adjacentSameGroupCount = 0;
  let sequenceMismatchCount = 0;
  let previousPrimaryGroup: string | null = null;
  const fingerprint: string[] = [];
  for (const [index, opportunity] of active.entries()) {
    const assignedGroups = new Set(objectiveIdsAt(assignment, opportunity.opportunityId)
      .filter((objectiveId) => eligible.has(objectiveId)).map((objectiveId) => groupByObjective.get(objectiveId))
      .filter((groupId): groupId is string => Boolean(groupId)));
    if (assignedGroups.size > 1) mixedGroupSessionCount += 1;
    const primary = primaryByOpportunity.get(opportunity.opportunityId) ?? "unresolved";
    fingerprint.push(`${opportunity.opportunityId}:${primary}`);
    if (primary !== "unresolved") primaryCounts.set(primary, (primaryCounts.get(primary) ?? 0) + 1);
    const primaryGroup = groupByObjective.get(primary) ?? null;
    if (primaryGroup && previousPrimaryGroup === primaryGroup) adjacentSameGroupCount += 1;
    if (primaryGroup) previousPrimaryGroup = primaryGroup;
    if (primary !== primarySequence[index % primarySequence.length]) sequenceMismatchCount += 1;
  }
  const missingPrimaryCount = [...primaryCounts.values()].filter((count) => count === 0).length;
  const repeatedPrimaryCount = [...primaryCounts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  return Object.freeze({ topologyPolicyReference: policy.reference,
    requiredTargetExposureVector: Object.freeze(eligibleObjectives.map((objective) =>
      (assignment[objective.objectiveId]?.length ?? 0) === objective.frequencyIntent.targetAllocatedSessions)),
    requiredResponsibilityConcentrationVector: Object.freeze([
      maximumConcentration, concentrationExcess, concentrationSpread, orderedBalanceDeviation,
    ]),
    occupiedSessionCount: active.length,
    withinWeekPrimaryEmphasisBalanceVector: Object.freeze([
      mixedGroupSessionCount, adjacentSameGroupCount, missingPrimaryCount, repeatedPrimaryCount,
      sequenceMismatchCount,
    ]),
    primaryEmphasisFingerprint: fingerprint.join("|"),
    topologyProvenance: Object.freeze([
      `${policy.reference.policyId}@${policy.reference.version}`,
      `preferred_maximum:${policy.preferredMaximumRequiredResponsibilitiesPerSession}`,
      ...policy.coherenceGroups.map((group) => `${group.groupId}:${group.objectiveIds.join(",")}`),
    ]),
  });
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function feasibilityFor(
  input: ProductionWeekAllocationComposerInput,
  opportunity: ProductionWeekTrainingOpportunity,
  objectiveIds: readonly string[],
): ProductionSessionFeasibilityResult {
  const precomputed = input.precomputedFeasibilityResults?.find((entry) =>
    entry.opportunityId === opportunity.opportunityId &&
    entry.opportunityRevisionId === opportunity.opportunityRevisionId && sameIds(entry.objectiveIds, objectiveIds));
  if (precomputed) return precomputed;
  const objectives = objectiveIds.map((id) => input.weeklyIntent.objectives.find((entry) => entry.objectiveId === id)!)
    .filter(Boolean);
  if (input.feasibilityOracle) return input.feasibilityOracle.evaluate({ opportunity, objectives,
    evaluationTime: input.evaluationTime, sourceSnapshotRevisionId: input.sourceSnapshot.sourceSnapshotRevisionId });
  return Object.freeze({
    opportunityId: opportunity.opportunityId,
    opportunityRevisionId: opportunity.opportunityRevisionId,
    objectiveIds: Object.freeze([...objectiveIds]),
    status: "search_inconclusive",
    sourceRefs: Object.freeze(["EXPLICIT_FEASIBILITY_EVIDENCE_REQUIRED"]),
    unresolvedRequirementRefs: Object.freeze(["SESSION_FEASIBILITY_ORACLE_OR_PRECOMPUTED_RESULT_REQUIRED"]),
    downstreamContractVersions: Object.freeze([]),
    resultFingerprint: canonicalWeekFingerprint({ opportunityId: opportunity.opportunityId, objectiveIds,
      status: "search_inconclusive" }),
  });
}

function spacingSatisfied(
  assignment: Assignment,
  opportunities: readonly ProductionWeekTrainingOpportunity[],
  requirement: ProductionWeeklyRecoverySpacingRequirement,
): boolean {
  const basis = requirement.basis;
  if (!requirement.required || basis.kind === "prescription_pending") return true;
  const selected = uniqueSorted(requirement.objectiveIds.flatMap((objectiveId) => assignment[objectiveId] ?? []));
  const selectedOpportunities = selected.map((id) => opportunities.find((entry) => entry.opportunityId === id))
    .filter((entry): entry is ProductionWeekTrainingOpportunity => entry !== undefined)
    .sort((left, right) => left.order - right.order || left.opportunityId.localeCompare(right.opportunityId));
  if (basis.kind === "ordered_opportunity_gap") {
    return selectedOpportunities.every((entry, index) => index === 0 ||
      entry.order - selectedOpportunities[index - 1]!.order >= basis.minimumGap);
  }
  if (selectedOpportunities.some((entry) => !entry.timeWindow)) return false;
  return selectedOpportunities.every((entry, index) => index === 0 ||
    Date.parse(entry.timeWindow!.startsAt) - Date.parse(selectedOpportunities[index - 1]!.timeWindow!.endsAt) >=
      basis.minimumDurationMinutes * 60_000);
}

function evaluate(
  input: ProductionWeekAllocationComposerInput,
  assignment: Assignment,
  opportunities: readonly ProductionWeekTrainingOpportunity[],
): { readonly vector: ProductionWeekEvaluationVector; readonly feasibility: readonly ProductionSessionFeasibilityResult[] } {
  const required = input.weeklyIntent.objectives.filter((entry) => entry.priority === "required");
  const preferred = input.weeklyIntent.objectives.filter((entry) => entry.priority === "preferred");
  const optional = input.weeklyIntent.objectives.filter((entry) => entry.priority === "optional");
  const feasibility = opportunities.flatMap((opportunity) => {
    const objectiveIds = objectiveIdsAt(assignment, opportunity.opportunityId);
    if (objectiveIds.length === 0) return [];
    const result = feasibilityFor(input, opportunity, objectiveIds);
    const validationReasons = validateProductionSessionFeasibilityResult(result);
    return validationReasons.length === 0 ? [result] : [Object.freeze({ ...result,
      status: "invalid_oracle_input" as const,
      unresolvedRequirementRefs: uniqueSorted([...result.unresolvedRequirementRefs, ...validationReasons]),
    })];
  });
  const requiredMinimumVector = required.map((objective) =>
    (assignment[objective.objectiveId]?.length ?? 0) >= objective.frequencyIntent.minimumAllocatedSessions);
  const opportunityLegalityVector = opportunities.map((opportunity) => {
    const allocated = objectiveIdsAt(assignment, opportunity.opportunityId).length > 0;
    return !allocated || isConfirmedProductionTrainingOpportunity(opportunity);
  });
  const requiredSpacingVector = input.spacingRequirements.map((requirement) => spacingSatisfied(assignment, opportunities, requirement));
  const continuityVector = input.previousWeekStructureEvidence.productiveRelationships.map((relationship) =>
    (assignment[relationship.objectiveLineageRef] ?? []).includes(relationship.opportunityId));
  const feasibilityVector = feasibility.map((entry) => entry.status);
  const forbiddenFeasibility = new Set<ProductionSessionFeasibilityStatus>([
    "infeasible_objective_combination", "blocked_by_training_readiness", "unsupported_objective_scope", "invalid_oracle_input",
  ]);
  const incompleteFeasibility = feasibilityVector.some((status) => status === "search_inconclusive");
  const hardValid = requiredMinimumVector.every(Boolean) && opportunityLegalityVector.every(Boolean) &&
    requiredSpacingVector.every(Boolean) && !feasibilityVector.some((status) => forbiddenFeasibility.has(status)) &&
    !incompleteFeasibility;
  const topology = topologyEvaluation(input, assignment, opportunities);
  const vector: ProductionWeekEvaluationVector = Object.freeze({
    hardValid,
    globalTrainingSafetyAllowed: true,
    completedHistoryImmutable: true,
    requiredMinimumVector: Object.freeze(requiredMinimumVector),
    opportunityLegalityVector: Object.freeze(opportunityLegalityVector),
    requiredSpacingVector: Object.freeze(requiredSpacingVector),
    ...topology,
    feasibilityVector: Object.freeze(feasibilityVector),
    continuityVector: Object.freeze(continuityVector),
    requiredFrequencyVector: Object.freeze(required.map((entry) => assignment[entry.objectiveId]?.length ?? 0)),
    preferredFrequencyVector: Object.freeze(preferred.map((entry) => assignment[entry.objectiveId]?.length ?? 0)),
    optionalUniqueValueVector: Object.freeze(optional.map((entry) => {
      const count = assignment[entry.objectiveId]?.length ?? 0;
      return count > 0 && count <= entry.frequencyIntent.targetAllocatedSessions && entry.uniqueMarginalValueRef !== null;
    })),
    softMaximumReviewBurden: input.weeklyIntent.objectives.reduce((total, objective) => total + Math.max(0,
      (assignment[objective.objectiveId]?.length ?? 0) - objective.frequencyIntent.softMaximumAllocatedSessions), 0),
    equipmentCapacityCoherenceVector: Object.freeze(feasibility.map((entry) =>
      entry.status !== "infeasible_objective_combination" && entry.status !== "invalid_oracle_input")),
    duplicationBurden: input.weeklyIntent.objectives.reduce((total, objective) => total + Math.max(0,
      (assignment[objective.objectiveId]?.length ?? 0) - objective.frequencyIntent.targetAllocatedSessions), 0),
    frameworkStabilityVector: Object.freeze(continuityVector),
    canonicalTieBreak: assignmentKey(assignment),
  });
  return Object.freeze({ vector, feasibility: Object.freeze(feasibility) });
}

function compareBooleans(left: readonly boolean[], right: readonly boolean[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? false) !== (right[index] ?? false)) return left[index] ? -1 : 1;
  }
  return 0;
}

function compareNumbers(left: readonly number[], right: readonly number[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) return (right[index] ?? 0) - (left[index] ?? 0);
  }
  return 0;
}

function compareNumbersAscending(left: readonly number[], right: readonly number[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) return (left[index] ?? 0) - (right[index] ?? 0);
  }
  return 0;
}

export function compareProductionWeekEvaluations(
  left: ProductionWeekEvaluationVector,
  right: ProductionWeekEvaluationVector,
): number {
  if (left.hardValid !== right.hardValid) return left.hardValid ? -1 : 1;
  if (left.globalTrainingSafetyAllowed !== right.globalTrainingSafetyAllowed) return left.globalTrainingSafetyAllowed ? -1 : 1;
  if (left.completedHistoryImmutable !== right.completedHistoryImmutable) return left.completedHistoryImmutable ? -1 : 1;
  for (const pair of [[left.requiredMinimumVector, right.requiredMinimumVector],
    [left.opportunityLegalityVector, right.opportunityLegalityVector],
    [left.requiredSpacingVector, right.requiredSpacingVector]] as const) {
    const compared = compareBooleans(pair[0], pair[1]);
    if (compared !== 0) return compared;
  }
  if (left.topologyPolicyReference || right.topologyPolicyReference) {
    const leftReference = left.topologyPolicyReference ?
      `${left.topologyPolicyReference.policyId}@${left.topologyPolicyReference.version}` : "";
    const rightReference = right.topologyPolicyReference ?
      `${right.topologyPolicyReference.policyId}@${right.topologyPolicyReference.version}` : "";
    if (leftReference !== rightReference) return leftReference.localeCompare(rightReference);
    let topologyCompared = compareBooleans(left.requiredTargetExposureVector ?? [],
      right.requiredTargetExposureVector ?? []);
    if (topologyCompared !== 0) return topologyCompared;
    topologyCompared = compareNumbersAscending(left.requiredResponsibilityConcentrationVector ?? [],
      right.requiredResponsibilityConcentrationVector ?? []);
    if (topologyCompared !== 0) return topologyCompared;
    if ((left.occupiedSessionCount ?? 0) !== (right.occupiedSessionCount ?? 0)) {
      return (left.occupiedSessionCount ?? 0) - (right.occupiedSessionCount ?? 0);
    }
    topologyCompared = compareNumbersAscending(left.withinWeekPrimaryEmphasisBalanceVector ?? [],
      right.withinWeekPrimaryEmphasisBalanceVector ?? []);
    if (topologyCompared !== 0) return topologyCompared;
  }
  let compared = compareNumbers(left.feasibilityVector.map((entry) => FEASIBILITY_RANK[entry]),
    right.feasibilityVector.map((entry) => FEASIBILITY_RANK[entry]));
  if (compared !== 0) return compared;
  compared = compareBooleans(left.continuityVector, right.continuityVector);
  if (compared !== 0) return compared;
  compared = compareNumbers(left.requiredFrequencyVector, right.requiredFrequencyVector);
  if (compared !== 0) return compared;
  compared = compareNumbers(left.preferredFrequencyVector, right.preferredFrequencyVector);
  if (compared !== 0) return compared;
  compared = compareBooleans(left.optionalUniqueValueVector, right.optionalUniqueValueVector);
  if (compared !== 0) return compared;
  if (left.softMaximumReviewBurden !== right.softMaximumReviewBurden) return left.softMaximumReviewBurden - right.softMaximumReviewBurden;
  compared = compareBooleans(left.equipmentCapacityCoherenceVector, right.equipmentCapacityCoherenceVector);
  if (compared !== 0) return compared;
  if (left.duplicationBurden !== right.duplicationBurden) return left.duplicationBurden - right.duplicationBurden;
  compared = compareBooleans(left.frameworkStabilityVector, right.frameworkStabilityVector);
  if (compared !== 0) return compared;
  return left.canonicalTieBreak.localeCompare(right.canonicalTieBreak);
}

function responsibilityPurpose(objective: ProductionWeeklyDevelopmentObjective, dominant: boolean): ProductionSessionResponsibilityPurpose {
  if (objective.purpose === "assessment_priority_development") return "explicit_preparation";
  if (objective.purpose === "recovery_support") return "recovery";
  if (dominant) return objective.purpose === "capacity_development" ? "capacity_main" : "dominant_main";
  if (objective.purpose === "direct_action_development" || objective.purpose === "muscle_development") return "direct_accessory";
  if (objective.purpose === "capacity_development") return "capacity_accessory";
  return "secondary_main";
}

function reservationDraft(input: ProductionWeekAllocationComposerInput, assignment: Assignment,
  opportunity: ProductionWeekTrainingOpportunity, objectiveIds: readonly string[], planId: string, planRevisionId: string,
  reservationIdsByOpportunity: ReadonlyMap<string, string>,
  primaryObjectiveByOpportunity: ReadonlyMap<string, string>): ProductionSessionAllocationReservation {
  const objectives = objectiveIds.map((id) => input.weeklyIntent.objectives.find((entry) => entry.objectiveId === id)!)
    .sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
      left.priorityOrder - right.priorityOrder || left.objectiveId.localeCompare(right.objectiveId));
  const reviewedPrimaryObjectiveId = primaryObjectiveByOpportunity.get(opportunity.opportunityId);
  const dominantIndex = reviewedPrimaryObjectiveId ? objectives.findIndex((entry) =>
    entry.objectiveId === reviewedPrimaryObjectiveId) : objectives.findIndex((entry) =>
    !["assessment_priority_development", "recovery_support", "direct_action_development"].includes(entry.purpose));
  const dominant = objectives[dominantIndex] ?? objectives[0]!;
  const primaryRelationships = dominant.goalRelationships.filter((entry) => entry.relationship !== "cross_goal_support");
  const goals = uniqueSorted(primaryRelationships.map((entry) => entry.goal));
  const sessionGoal = goals.length === 1 ? primaryRelationships[0]!.goal : input.weeklyIntent.outcomeGoal;
  const reservationId = reservationIdsByOpportunity.get(opportunity.opportunityId)!;
  const neighboringReservationRefs = input.orderedOpportunities
    .filter((entry) => Math.abs(entry.order - opportunity.order) === 1)
    .map((entry) => reservationIdsByOpportunity.get(entry.opportunityId)).filter((id): id is string => id !== undefined).sort();
  const base: Omit<ProductionSessionAllocationReservation, "reservationRevisionId" | "provenance"> = {
    reservationId,
    weekPlanId: planId,
    weekPlanRevisionId: planRevisionId,
    weeklyIntentId: input.weeklyIntent.intentId,
    weeklyIntentRevisionId: input.weeklyIntent.intentRevisionId,
    opportunityId: opportunity.opportunityId,
    opportunityRevisionId: opportunity.opportunityRevisionId,
    athleteId: input.weeklyIntent.athleteId,
    sessionType: "ordinary_training",
    weeklyPrimaryGoal: input.weeklyIntent.outcomeGoal,
    weeklySecondaryGoals: input.weeklyIntent.orderedSecondaryGoals,
    sessionOutcomeGoal: sessionGoal,
    goalEvidenceRefs: uniqueSorted(objectives.flatMap((entry) => entry.goalRelationships.flatMap((relationship) =>
      relationship.sourceEvidenceRefs))),
    programmingContextModes: input.weeklyIntent.programmingContextModes,
    allocatedObjectives: Object.freeze(objectives.map((objective, index) => Object.freeze({
      responsibilityId: stableId("session-responsibility", { reservationId, objectiveId: objective.objectiveId }),
      weeklyObjectiveId: objective.objectiveId,
      purpose: responsibilityPurpose(objective, index === dominantIndex),
      weeklyObjectivePriority: objective.priority,
      sessionLocalPriority: index === dominantIndex ? "required" : objective.priority,
      priorityOrder: objective.priorityOrder,
      target: objective.target,
      sourceEvidenceRefs: uniqueSorted(objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs)),
      reasonCode: objective.purpose === "assessment_priority_development" ? "explicit_assessment_or_preparation" :
        objective.purpose === "recovery_support" ? "explicit_recovery_responsibility" : "allocated_weekly_responsibility",
      ...(objective.executionRequirements ? { executionRequirements: objective.executionRequirements } : {}),
      provenance: Object.freeze({ owner: "week_allocation_composer", sourceRefs: Object.freeze([objective.objectiveId]),
        ruleRefs: Object.freeze(["OBJECTIVE_TO_SESSION_RESPONSIBILITY"]) }),
    }))),
    expectedStructuralCapacity: opportunity.expectedStructuralCapacity,
    expectedAvailableMinutes: opportunity.expectedAvailableMinutes,
    expectedEquipment: opportunity.expectedEquipment,
    neighboringReservationRefs: Object.freeze(neighboringReservationRefs),
    weeklyObjectiveSourceRefs: uniqueSorted(objectives.flatMap((entry) => entry.sourcePriorityIds)),
    unresolvedWeekContext: input.weeklyIntent.unresolvedContext,
    unresolvedCurrentSessionContext: Object.freeze([`${opportunity.opportunityId}:ACTUAL_SESSION_CONTEXT_PENDING`]),
    status: "reserved",
    sourceTrace: Object.freeze([input.weeklyIntent.intentRevisionId, opportunity.opportunityRevisionId,
      "EXPECTED_FACTS_NOT_ACTUAL", "NO_EXERCISE_IDENTITY", "NO_DOSE"]),
  };
  return Object.freeze({ ...base, reservationRevisionId: deriveReservationRevisionId(base),
    provenance: Object.freeze({ owner: "week_allocation_composer",
      sourceRefs: Object.freeze([input.weeklyIntent.intentRevisionId, opportunity.opportunityRevisionId]),
      ruleRefs: Object.freeze(["STRICT_LEXICOGRAPHIC_WEEK_ALLOCATION", "NO_FIXED_SPLIT_AUTHORITY"]) }) });
}

function satisfaction(objective: ProductionWeeklyDevelopmentObjective, count: number,
  feasibility: readonly ProductionSessionFeasibilityResult[]): ProductionWeekObjectiveSatisfactionState {
  if (feasibility.some((entry) => entry.objectiveIds.includes(objective.objectiveId) && entry.status === "search_inconclusive")) {
    return "search_inconclusive";
  }
  if (objective.priority === "optional" && count === 0) return "optional_not_allocated";
  if (count < objective.frequencyIntent.minimumAllocatedSessions) {
    return objective.priority === "optional" ? "optional_not_allocated" : "below_minimum_unresolved";
  }
  if (count > objective.frequencyIntent.softMaximumAllocatedSessions) return "above_soft_ceiling_review";
  if (feasibility.some((entry) => entry.objectiveIds.includes(objective.objectiveId) &&
      ["candidate_review_required", "prescription_resolution_required"].includes(entry.status))) {
    return "allocated_requires_session_feasibility";
  }
  if (count >= objective.frequencyIntent.targetAllocatedSessions) return "allocated_target_opportunities";
  return "allocated_minimum_opportunities";
}

export function validateProductionWeekTopologyPolicy(
  input: ProductionWeekAllocationComposerInput,
): readonly string[] {
  const policy = input.topologyPolicy;
  if (!policy) return Object.freeze([]);
  const reasons: string[] = [];
  if (!policy.reference.policyId.trim() || !policy.reference.version.trim()) {
    reasons.push("WEEK_TOPOLOGY_POLICY_REFERENCE_REQUIRED");
  }
  if (policy.scope !== "controlled_owner_get_stronger_product_responsibilities") {
    reasons.push("WEEK_TOPOLOGY_POLICY_SCOPE_UNSUPPORTED");
  }
  if (policy.eligibleObjectiveIds.length === 0 ||
      new Set(policy.eligibleObjectiveIds).size !== policy.eligibleObjectiveIds.length) {
    reasons.push("OWNER_TOPOLOGY_REQUIRES_UNIQUE_PRODUCT_RESPONSIBILITIES");
  }
  if (policy.preferredMaximumRequiredResponsibilitiesPerSession !== 2) {
    reasons.push("OWNER_TOPOLOGY_REVIEWED_CONCENTRATION_POLICY_REQUIRED");
  }
  const objectiveById = new Map(input.weeklyIntent.objectives.map((objective) => [objective.objectiveId, objective]));
  if (policy.eligibleObjectiveIds.some((objectiveId) => {
    const objective = objectiveById.get(objectiveId);
    return !objective || objective.priority !== "required" || objective.purpose === "recovery_support" ||
      !objective.executionRequirements?.developmentalCreditRequired;
  })) reasons.push("OWNER_TOPOLOGY_OBJECTIVE_SCOPE_MISMATCH");
  const groupedObjectiveIds = policy.coherenceGroups.flatMap((group) => group.objectiveIds);
  if (policy.coherenceGroups.length === 0 || policy.coherenceGroups.some((group) =>
    !group.groupId.trim() || group.objectiveIds.length === 0) ||
    new Set(policy.coherenceGroups.map((group) => group.groupId)).size !== policy.coherenceGroups.length ||
    new Set(groupedObjectiveIds).size !== groupedObjectiveIds.length ||
    JSON.stringify([...groupedObjectiveIds].sort()) !== JSON.stringify([...policy.eligibleObjectiveIds].sort())) {
    reasons.push("OWNER_TOPOLOGY_COHERENCE_GROUP_PARTITION_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

function emptyPlan(input: ProductionWeekAllocationComposerInput, status: ProductionWeekAllocationStatus,
  reasons: readonly string[], searchTrace: readonly string[] = []): ProductionWeekAllocationPlan {
  const weekPlanId = deriveWeekPlanId({ athleteId: input.weeklyIntent.athleteId,
    planningHorizonId: input.weeklyIntent.planningHorizonId,
    weeklyIntentId: input.weeklyIntent.intentId, allocationAttemptId: input.allocationAttemptId });
  const defaultSatisfaction: ProductionWeekObjectiveSatisfactionState =
    status === "blocked_by_training_readiness" ? "blocked_by_training_readiness" :
      status === "search_inconclusive" ? "search_inconclusive" : "below_minimum_unresolved";
  const objectiveSatisfactionStates: Readonly<Record<string, ProductionWeekObjectiveSatisfactionState>> =
    Object.freeze(Object.fromEntries(input.weeklyIntent.objectives.map((entry) =>
      [entry.objectiveId, defaultSatisfaction])));
  const content: Omit<ProductionWeekAllocationPlan, "weekPlanRevisionId" | "provenance"> = {
    planContract: PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
    weekPlanId, basedOnRevisionId: input.priorPlanRevision?.weekPlanRevisionId ?? null,
    allocationAttemptId: input.allocationAttemptId,
    athleteId: input.weeklyIntent.athleteId,
    weeklyIntentId: input.weeklyIntent.intentId, weeklyIntentRevisionId: input.weeklyIntent.intentRevisionId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId, horizonRevisionId: input.sourceSnapshot.horizonRevisionId,
    status, reservations: Object.freeze([]), objectiveAllocationTraces: Object.freeze({}),
    unallocatedObjectiveTraces: Object.freeze(Object.fromEntries(input.weeklyIntent.objectives.map((entry) =>
      [entry.objectiveId, uniqueSorted(reasons)]))), spacingTraces: Object.freeze([]), continuityTraces: Object.freeze([]),
    equipmentAvailabilityTraces: Object.freeze([]), structuralCapacityTraces: Object.freeze([]),
    searchCompleteness: status === "allocation_infeasible" ? "exact_infeasible" : "search_inconclusive",
    searchTrace: Object.freeze([...searchTrace]), wholeWeekEvaluation: null,
    objectiveSatisfactionStates,
    unresolvedPrescriptionRequirements: Object.freeze(input.weeklyIntent.objectives
      .filter((entry) => entry.dosePolicyState === "pending_prescription_policy").map((entry) => `${entry.objectiveId}:PRESCRIPTION_REQUIRED`)),
    unresolvedCurrentSessionFacts: Object.freeze([]), reallocationState: "not_required",
    decisionTrace: Object.freeze([status, ...uniqueSorted(reasons), "NO_EXECUTABLE_BEST_SO_FAR_PLAN"]),
    evaluationTime: input.evaluationTime,
  };
  return Object.freeze({
    ...content,
    weekPlanRevisionId: planRevisionId(content),
    provenance: Object.freeze({ owner: "week_allocation_composer", sourceRefs: Object.freeze([
      input.weeklyIntent.intentRevisionId, input.sourceSnapshot.sourceSnapshotRevisionId]),
      ruleRefs: Object.freeze([status]) }),
  });
}

export function composeWeekAllocation(input: ProductionWeekAllocationComposerInput): ProductionWeekAllocationPlan {
  if (!sameSemanticValue(input.composerContract, PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE)) {
    return emptyPlan(input, "unsupported_composer_contract", ["UNSUPPORTED_PRODUCTION_WEEK_ALLOCATION_COMPOSER_VERSION"]);
  }
  const sourceOpportunityRevisions = input.sourceSnapshot.opportunities.map((entry) =>
    `${entry.opportunityId}@${entry.opportunityRevisionId}`).sort();
  const orderedOpportunityRevisions = input.orderedOpportunities.map((entry) =>
    `${entry.opportunityId}@${entry.opportunityRevisionId}`).sort();
  const sourceCompletionState = Object.fromEntries(input.sourceSnapshot.opportunities.map((entry) =>
    [entry.opportunityId, entry.completionStatus]));
  const inputReasons = uniqueSorted([
    ...validateProductionWeeklyIntent(input.weeklyIntent),
    ...validateProductionWeekPlanningSourceSnapshot(input.sourceSnapshot),
    ...validateProductionWeekSearchResourcePolicy(input.searchResourcePolicy),
    ...input.spacingRequirements.flatMap(validateProductionSpacingRequirement),
    ...validateProductionWeekTopologyPolicy(input),
    ...(explicitIsoTime(input.evaluationTime) ? [] : ["WEEK_ALLOCATION_EVALUATION_TIME_INVALID"]),
    ...(input.weeklyIntent.horizonRevisionId === input.sourceSnapshot.horizonRevisionId || input.priorPlanRevision ? [] :
      ["WEEK_INTENT_HORIZON_REVISION_STALE"]),
    ...(input.feasibilityOracle || (input.precomputedFeasibilityResults?.length ?? 0) > 0 ? [] :
      ["SESSION_FEASIBILITY_ORACLE_OR_PRECOMPUTED_RESULT_REQUIRED"]),
    ...(JSON.stringify(sourceOpportunityRevisions) === JSON.stringify(orderedOpportunityRevisions) ? [] :
      ["ORDERED_OPPORTUNITIES_MUST_MATCH_SOURCE_SNAPSHOT"]),
    ...(sameSemanticValue(sourceCompletionState, input.completionState) ? [] :
      ["COMPLETION_STATE_MUST_MATCH_SOURCE_SNAPSHOT"]),
  ]);
  if (inputReasons.length > 0) return emptyPlan(input, "invalid_allocation_input", inputReasons);
  const policyResolution = resolveProductionWeekPolicy(input.policy, input.policyRegistry);
  if (!policyResolution.policy) return emptyPlan(input, "requires_policy", [policyResolution.reasonCode]);
  if (!sameSemanticValue(policyResolution.policy.reference, input.weeklyIntent.policyReference)) {
    return emptyPlan(input, "requires_policy", ["WEEK_INTENT_ALLOCATION_POLICY_MISMATCH"]);
  }
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.weeklyIntent.unresolvedContext.some((entry) =>
    entry.category === "illness_or_safety" && entry.blocksAllocation) ? {
      signals: [{ signalId: "week-allocation-unresolved-safety", requestedReviewLevel: "review_required_before_ordinary_training",
        authority: { source: "upstream_safety_system", sourceRef: "week-source", evidenceBasis: ["Explicit unresolved source context"],
          reportedBy: "product_horizon_source", reportedAt: input.evaluationTime }, resolution: { state: "unresolved" }, notes: [] }],
    } : { signals: [] } });
  if (!readiness.downstreamTrainingAllowed) return emptyPlan(input, "blocked_by_training_readiness", readiness.unresolvedSignalIds);
  if (input.priorPlanRevision && (input.priorPlanRevision.weekPlanId !== deriveWeekPlanId({
    athleteId: input.weeklyIntent.athleteId, planningHorizonId: input.weeklyIntent.planningHorizonId,
    weeklyIntentId: input.weeklyIntent.intentId, allocationAttemptId: input.allocationAttemptId }) ||
      input.priorPlanRevision.allocationAttemptId !== input.allocationAttemptId)) {
    return emptyPlan(input, "invalid_prior_revision_context", ["WEEK_PLAN_PRIOR_REVISION_LINEAGE_MISMATCH"]);
  }
  const opportunities = Object.freeze([...input.orderedOpportunities]
    .filter(isConfirmedProductionTrainingOpportunity)
    .sort((left, right) => left.order - right.order || left.opportunityId.localeCompare(right.opportunityId)));
  const completedReservations = Object.freeze((input.priorPlanRevision?.reservations ?? [])
    .filter((entry) => entry.status === "completed_immutable"));
  const search = enumerateAssignments(input, opportunities.map((entry) => entry.opportunityId));
  const searchTrace = Object.freeze([`expanded_states:${search.expandedStates}`, `complete_plans:${search.completePlans}`,
    `bounded_frontier_used:${search.boundedFrontierUsed}`]);
  if (search.limitReached) {
    return emptyPlan(input, "search_inconclusive", ["WEEK_SEARCH_RESOURCE_LIMIT_REACHED"], searchTrace);
  }
  if (search.assignments.length === 0) return emptyPlan(input, "allocation_infeasible", ["NO_LEGAL_ASSIGNMENT"], searchTrace);
  let winner: { readonly assignment: Assignment; readonly vector: ProductionWeekEvaluationVector;
    readonly feasibility: readonly ProductionSessionFeasibilityResult[] } | null = null;
  for (const assignment of search.assignments) {
    const candidate = { assignment, ...evaluate(input, assignment, opportunities) };
    if (!winner || compareProductionWeekEvaluations(candidate.vector, winner.vector) < 0) winner = candidate;
  }
  if (!winner) return emptyPlan(input, "allocation_infeasible", ["NO_LEGAL_ASSIGNMENT"], searchTrace);
  if (!winner.vector.hardValid) {
    const incomplete = winner.feasibility.some((entry) => entry.status === "search_inconclusive");
    return emptyPlan(input, incomplete ? "search_inconclusive" : "allocation_infeasible",
      incomplete ? ["SESSION_FEASIBILITY_SEARCH_INCONCLUSIVE"] : ["NO_HARD_VALID_WEEK_PLAN"], searchTrace);
  }
  const weekPlanId = deriveWeekPlanId({ athleteId: input.weeklyIntent.athleteId,
    planningHorizonId: input.weeklyIntent.planningHorizonId,
    weeklyIntentId: input.weeklyIntent.intentId, allocationAttemptId: input.allocationAttemptId });
  const activeOpportunities = opportunities.filter((entry) => objectiveIdsAt(winner.assignment, entry.opportunityId).length > 0);
  const reservationIdsByOpportunity = new Map(activeOpportunities.map((opportunity) => {
    const objectiveIds = objectiveIdsAt(winner.assignment, opportunity.opportunityId);
    return [opportunity.opportunityId, deriveReservationId({ weekPlanId, opportunityId: opportunity.opportunityId,
      responsibilityLineage: objectiveIds })];
  }));
  const primaryObjectiveByOpportunity = primaryObjectivesForAssignment(input, winner.assignment, opportunities);
  const revisionDrafts = activeOpportunities.map((opportunity) => reservationDraft(input, winner.assignment, opportunity,
    objectiveIdsAt(winner.assignment, opportunity.opportunityId), weekPlanId, "PENDING_PLAN_REVISION",
    reservationIdsByOpportunity, primaryObjectiveByOpportunity));
  const satisfactionStates = Object.freeze(Object.fromEntries(input.weeklyIntent.objectives.map((objective) =>
    [objective.objectiveId, satisfaction(objective, winner.assignment[objective.objectiveId]?.length ?? 0, winner.feasibility)])));
  const contentForRevision: Omit<ProductionWeekAllocationPlan, "weekPlanRevisionId" | "provenance"> = {
    planContract: PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
    weekPlanId, basedOnRevisionId: input.priorPlanRevision?.weekPlanRevisionId ?? null,
    allocationAttemptId: input.allocationAttemptId,
    athleteId: input.weeklyIntent.athleteId,
    weeklyIntentId: input.weeklyIntent.intentId, weeklyIntentRevisionId: input.weeklyIntent.intentRevisionId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId, horizonRevisionId: input.sourceSnapshot.horizonRevisionId,
    status: "allocation_composed",
    reservations: Object.freeze([...completedReservations, ...revisionDrafts]),
    objectiveAllocationTraces: Object.freeze(Object.fromEntries(input.weeklyIntent.objectives.map((objective) =>
      [objective.objectiveId, Object.freeze([...(winner.assignment[objective.objectiveId] ?? [])])]))),
    unallocatedObjectiveTraces: Object.freeze(Object.fromEntries(input.weeklyIntent.objectives
      .filter((objective) => (winner.assignment[objective.objectiveId]?.length ?? 0) < objective.frequencyIntent.targetAllocatedSessions)
      .map((objective) => [objective.objectiveId, Object.freeze([objective.priority === "optional" ?
        "OPTIONAL_NOT_REQUIRED_FOR_VALID_PLAN" : "TARGET_MISSED_MINIMUM_MET"])]))),
    spacingTraces: Object.freeze(input.spacingRequirements.map((entry) =>
      `${entry.requirementId}:${spacingSatisfied(winner.assignment, opportunities, entry) ? "satisfied" : "unresolved"}`)),
    continuityTraces: Object.freeze(input.previousWeekStructureEvidence.productiveRelationships.map((entry) =>
      `${entry.objectiveLineageRef}@${entry.opportunityId}:${(winner.assignment[entry.objectiveLineageRef] ?? [])
        .includes(entry.opportunityId) ? "preserved" : "changed_with_reason_required"}`)),
    equipmentAvailabilityTraces: Object.freeze(revisionDrafts.map((entry) => `${entry.opportunityId}:${entry.expectedEquipment.kind}`)),
    structuralCapacityTraces: Object.freeze(revisionDrafts.map((entry) => `${entry.opportunityId}:${entry.expectedStructuralCapacity}`)),
    searchCompleteness: "exact_optimal",
    searchTrace,
    wholeWeekEvaluation: winner.vector,
    objectiveSatisfactionStates: satisfactionStates,
    unresolvedPrescriptionRequirements: Object.freeze(input.weeklyIntent.objectives
      .filter((entry) => entry.dosePolicyState === "pending_prescription_policy")
      .map((entry) => `${entry.objectiveId}:PRESCRIPTION_REQUIRED`)),
    unresolvedCurrentSessionFacts: Object.freeze(revisionDrafts.flatMap((entry) => entry.unresolvedCurrentSessionContext)),
    reallocationState: completedReservations.length > 0 ? "completed_history_preserved" : "not_required",
    decisionTrace: Object.freeze(["EXPLICIT_WEEK_POLICY", "EXPLICIT_SESSION_FEASIBILITY_EVIDENCE",
      "EXACT_DETERMINISTIC_SEARCH", "STRICT_LEXICOGRAPHIC_EVALUATION", "REQUIRED_BEFORE_PREFERRED_BEFORE_OPTIONAL",
      ...(input.topologyPolicy ? [`TOPOLOGY_POLICY:${input.topologyPolicy.reference.policyId}@${input.topologyPolicy.reference.version}`,
        "REQUIRED_TARGET_BEFORE_CONCENTRATION_BEFORE_FEWEST_OCCUPIED_BEFORE_PRIMARY_BALANCE",
        "UNUSED_OPPORTUNITIES_ALLOWED"] : []),
      "NO_FIXED_SPLIT_AUTHORITY", "NO_EXERCISE_SELECTION", "NO_DOSE", "NO_APPLICATION"]),
    evaluationTime: input.evaluationTime,
  };
  const weekPlanRevisionId = planRevisionId(contentForRevision);
  const proposed = activeOpportunities.map((opportunity) => reservationDraft(input, winner.assignment, opportunity,
    objectiveIdsAt(winner.assignment, opportunity.opportunityId), weekPlanId, weekPlanRevisionId,
    reservationIdsByOpportunity, primaryObjectiveByOpportunity));
  const plan: ProductionWeekAllocationPlan = Object.freeze({
    ...contentForRevision,
    weekPlanRevisionId,
    reservations: Object.freeze([...completedReservations, ...proposed]),
    provenance: Object.freeze({ owner: "week_allocation_composer", sourceRefs: Object.freeze([
      input.weeklyIntent.intentRevisionId, input.sourceSnapshot.sourceSnapshotRevisionId]),
      ruleRefs: Object.freeze([`${policyResolution.policy.reference.policyId}@${policyResolution.policy.reference.version}`,
        `${input.searchResourcePolicy.policyId}@${input.searchResourcePolicy.version}`,
        ...(input.topologyPolicy ? [
          `${input.topologyPolicy.reference.policyId}@${input.topologyPolicy.reference.version}`,
        ] : [])]) }),
  });
  const validationReasons = validateProductionWeekAllocationPlan(plan);
  return validationReasons.length === 0 ? plan : emptyPlan(input, "invalid_allocation_input", validationReasons, searchTrace);
}
