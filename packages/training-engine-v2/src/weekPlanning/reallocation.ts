import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import { deriveWeeklyIntentRevisionId, explicitIsoTime, sameSemanticValue, uniqueSorted, validateProductionWeekAllocationPlan,
  validateProductionWeekPlanningSourceSnapshot } from "./canonical";
import { composeWeekAllocation } from "./composer";
import {
  PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  type ProductionRemainingWeekReallocationInput,
  type ProductionRemainingWeekReallocationResult,
  type ProductionRemainingWeekReallocationStatus,
  type ProductionSessionAllocationReservation,
} from "./contracts";

function result(
  input: ProductionRemainingWeekReallocationInput,
  status: ProductionRemainingWeekReallocationStatus,
  reasons: readonly string[],
  options: {
    readonly candidate?: ProductionRemainingWeekReallocationResult["revisedPlanCandidate"];
    readonly completed?: readonly ProductionSessionAllocationReservation[];
    readonly invalidated?: readonly string[];
  } = {},
): ProductionRemainingWeekReallocationResult {
  const candidate = options.candidate ?? null;
  const priorFuture = input.currentPlan.reservations.filter((entry) => entry.status !== "completed_immutable");
  const nextFuture = candidate?.reservations.filter((entry) => entry.status !== "completed_immutable") ?? [];
  const priorByObjective = new Map(priorFuture.flatMap((reservation) => reservation.allocatedObjectives
    .map((objective) => [objective.weeklyObjectiveId, reservation.opportunityId] as const)));
  const nextByObjective = new Map(nextFuture.flatMap((reservation) => reservation.allocatedObjectives
    .map((objective) => [objective.weeklyObjectiveId, reservation.opportunityId] as const)));
  const moved = uniqueSorted([...nextByObjective].filter(([objectiveId, opportunityId]) =>
    priorByObjective.has(objectiveId) && priorByObjective.get(objectiveId) !== opportunityId)
    .map(([objectiveId, opportunityId]) => `${objectiveId}:${priorByObjective.get(objectiveId)}->${opportunityId}`));
  const unchanged = uniqueSorted([...nextByObjective].filter(([objectiveId, opportunityId]) =>
    priorByObjective.get(objectiveId) === opportunityId).map(([objectiveId, opportunityId]) => `${objectiveId}:${opportunityId}`));
  const resolved = new Set(nextFuture.flatMap((reservation) => reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId)));
  return Object.freeze({
    status,
    priorPlanRevisionId: input.currentPlan.weekPlanRevisionId,
    revisedPlanCandidate: candidate,
    preservedCompletedReservations: Object.freeze([...(options.completed ?? [])]),
    invalidatedFutureReservationIds: Object.freeze([...(options.invalidated ?? [])].sort()),
    newlyProposedFutureReservationIds: Object.freeze(nextFuture.map((entry) => entry.reservationId).sort()),
    movedResponsibilityTraces: moved,
    unchangedResponsibilityTraces: unchanged,
    unresolvedObjectiveIds: Object.freeze(input.remainingObjectiveIds.filter((id) => !resolved.has(id)).sort()),
    noDoubleCountTrace: Object.freeze([
      "COMPLETED_OBJECTIVE_COUNTS_RETAINED",
      "MISSED_AND_CANCELLED_HISTORY_RETAINED",
      "ONLY_REMAINING_RESPONSIBILITY_CONSIDERED",
      "MISSED_WORK_NOT_DOUBLED",
    ]),
    searchTrace: candidate?.searchTrace ?? Object.freeze([]),
    decisionTrace: Object.freeze([status, ...uniqueSorted(reasons), "NO_OBJECTIVE_CREATED", "NO_OPPORTUNITY_CREATED",
      "NO_EXERCISE_SELECTION", "NO_DOSE", "APPLICATION_DEFERRED"]),
    applicationApplied: false,
    applicationOwnerRequired: true,
    provenance: Object.freeze({ owner: "remaining_week_reallocator",
      sourceRefs: Object.freeze([input.currentPlan.weekPlanRevisionId, input.currentSourceSnapshot.sourceSnapshotRevisionId,
        ...input.reasonEvidenceRefs].sort()),
      ruleRefs: Object.freeze(["COMPLETED_HISTORY_IMMUTABLE", "REQUIRED_BEFORE_PREFERRED_BEFORE_OPTIONAL",
        "NO_DOUBLE_COUNT", "APPLICATION_OWNER_REQUIRED"]) }),
  });
}

export function reallocateRemainingWeek(
  input: ProductionRemainingWeekReallocationInput,
): ProductionRemainingWeekReallocationResult {
  if (!sameSemanticValue(input.reallocationContract, PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE)) {
    return result(input, "unsupported_reallocation_contract", ["UNSUPPORTED_PRODUCTION_REMAINING_WEEK_REALLOCATION_VERSION"]);
  }
  const inputReasons = uniqueSorted([
    ...validateProductionWeekAllocationPlan(input.currentPlan),
    ...validateProductionWeekPlanningSourceSnapshot(input.currentSourceSnapshot),
    ...(explicitIsoTime(input.evaluationTime) ? [] : ["REALLOCATION_EVALUATION_TIME_INVALID"]),
    ...(input.reallocationAttemptId.trim() ? [] : ["REALLOCATION_ATTEMPT_ID_REQUIRED"]),
    ...(input.currentPlan.weeklyIntentRevisionId === input.weeklyIntent.intentRevisionId ? [] : ["REALLOCATION_INTENT_REVISION_MISMATCH"]),
    ...(input.currentPlan.planningHorizonId === input.currentSourceSnapshot.planningHorizonId ? [] : ["REALLOCATION_HORIZON_LINEAGE_MISMATCH"]),
    ...(sameSemanticValue(input.updatedOpportunities.map((entry) =>
      `${entry.opportunityId}@${entry.opportunityRevisionId}`).sort(), input.currentSourceSnapshot.opportunities.map((entry) =>
      `${entry.opportunityId}@${entry.opportunityRevisionId}`).sort()) ? [] :
      ["REALLOCATION_OPPORTUNITIES_MUST_MATCH_SOURCE_SNAPSHOT"]),
  ]);
  if (inputReasons.length > 0) return result(input, "invalid_reallocation_input", inputReasons);
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety });
  if (!readiness.downstreamTrainingAllowed) return result(input, "blocked_by_training_readiness", readiness.unresolvedSignalIds);
  const reservationById = new Map(input.currentPlan.reservations.map((entry) => [entry.reservationId, entry]));
  const requiredCompletedReservationIds = input.currentPlan.reservations
    .filter((entry) => entry.status === "completed_immutable").map((entry) => entry.reservationId).sort();
  if (!sameSemanticValue([...input.immutableCompletedReservationIds].sort(), requiredCompletedReservationIds)) {
    return result(input, "invalid_completed_history", ["ALL_COMPLETED_RESERVATIONS_MUST_BE_ENUMERATED"]);
  }
  const requiredInvalidatedOpportunityIds = uniqueSorted([
    ...input.currentPlan.reservations.filter((entry) => ["missed_requires_reallocation", "cancelled_requires_reallocation"]
      .includes(entry.status)).map((entry) => entry.opportunityId),
    ...input.currentSourceSnapshot.opportunities.filter((entry) => ["missed", "cancelled"].includes(entry.completionStatus))
      .map((entry) => entry.opportunityId),
  ]);
  if (requiredInvalidatedOpportunityIds.some((id) =>
    !input.missedCancelledOrInvalidatedOpportunityIds.includes(id))) {
    return result(input, "invalid_reallocation_input", ["MISSED_CANCELLED_HISTORY_MUST_BE_ENUMERATED"]);
  }
  const completed = input.immutableCompletedReservationIds.map((id) => reservationById.get(id)).filter((entry):
    entry is ProductionSessionAllocationReservation => entry !== undefined);
  if (completed.length !== input.immutableCompletedReservationIds.length ||
      completed.some((entry) => entry.status !== "completed_immutable")) {
    return result(input, "invalid_completed_history", ["COMPLETED_RESERVATION_SET_INVALID"]);
  }
  const objectiveById = new Map(input.weeklyIntent.objectives.map((entry) => [entry.objectiveId, entry]));
  if (input.remainingObjectiveIds.some((id) => !objectiveById.has(id))) {
    return result(input, "invalid_reallocation_input", ["REALLOCATION_CANNOT_CREATE_OBJECTIVE"]);
  }
  const invalidated = input.currentPlan.reservations.filter((reservation) =>
    reservation.status !== "completed_immutable" && input.missedCancelledOrInvalidatedOpportunityIds.includes(reservation.opportunityId));
  if (invalidated.length === 0 && input.remainingObjectiveIds.length === 0) {
    return result(input, "reallocation_not_required", ["NO_REMAINING_REALLOCATION_NEED"], { completed });
  }
  const completedCounts = new Map<string, number>();
  for (const reservation of completed) {
    for (const objective of reservation.allocatedObjectives) {
      completedCounts.set(objective.weeklyObjectiveId, (completedCounts.get(objective.weeklyObjectiveId) ?? 0) + 1);
    }
  }
  const remainingSet = new Set(input.remainingObjectiveIds);
  const remainingObjectives = input.weeklyIntent.objectives.filter((objective) => remainingSet.has(objective.objectiveId))
    .map((objective) => {
      const completedCount = completedCounts.get(objective.objectiveId) ?? 0;
      return Object.freeze({ ...objective, frequencyIntent: Object.freeze({ ...objective.frequencyIntent,
        minimumAllocatedSessions: Math.max(0, objective.frequencyIntent.minimumAllocatedSessions - completedCount),
        targetAllocatedSessions: Math.max(0, objective.frequencyIntent.targetAllocatedSessions - completedCount),
        softMaximumAllocatedSessions: Math.max(0, objective.frequencyIntent.softMaximumAllocatedSessions - completedCount),
      }) });
    });
  const { intentRevisionId: priorIntentRevisionId, provenance: intentProvenance, ...priorIntentContent } = input.weeklyIntent;
  const remainingIntentContent = Object.freeze({ ...priorIntentContent,
    basedOnRevisionId: priorIntentRevisionId,
    objectives: Object.freeze(remainingObjectives),
    horizonRevisionId: input.currentSourceSnapshot.horizonRevisionId,
    sourceSnapshotRevisionId: input.currentSourceSnapshot.sourceSnapshotRevisionId,
    evaluationTime: input.evaluationTime });
  const remainingIntent = Object.freeze({ ...remainingIntentContent,
    intentRevisionId: deriveWeeklyIntentRevisionId(remainingIntentContent),
    provenance: intentProvenance });
  const composed = composeWeekAllocation({
    composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
    weeklyIntent: remainingIntent,
    sourceSnapshot: input.currentSourceSnapshot,
    orderedOpportunities: input.updatedOpportunities,
    completionState: Object.freeze(Object.fromEntries(input.updatedOpportunities.map((entry) =>
      [entry.opportunityId, entry.completionStatus]))),
    previousWeekStructureEvidence: input.weeklyIntent.continuityEvidence,
    policy: input.policy,
    ...(input.policyRegistry ? { policyRegistry: input.policyRegistry } : {}),
    spacingRequirements: Object.freeze([]),
    ...(input.feasibilityOracle ? { feasibilityOracle: input.feasibilityOracle } : {}),
    ...(input.precomputedFeasibilityResults ? { precomputedFeasibilityResults: input.precomputedFeasibilityResults } : {}),
    searchResourcePolicy: input.searchResourcePolicy,
    evaluationTime: input.evaluationTime,
    allocationAttemptId: input.currentPlan.allocationAttemptId,
    priorPlanRevision: input.currentPlan,
  });
  if (composed.status === "requires_policy") return result(input, "reallocation_policy_required", composed.decisionTrace,
    { completed, invalidated: invalidated.map((entry) => entry.reservationId) });
  if (composed.status === "blocked_by_training_readiness") return result(input, "blocked_by_training_readiness", composed.decisionTrace,
    { completed, invalidated: invalidated.map((entry) => entry.reservationId) });
  if (composed.status === "search_inconclusive") return result(input, "search_inconclusive", composed.decisionTrace,
    { completed, invalidated: invalidated.map((entry) => entry.reservationId) });
  if (composed.status !== "allocation_composed") return result(input, "reallocation_infeasible", composed.decisionTrace,
    { completed, invalidated: invalidated.map((entry) => entry.reservationId) });
  return result(input, "revised_plan_candidate", ["REMAINING_WEEK_PLAN_CANDIDATE_CREATED"], {
    candidate: composed,
    completed,
    invalidated: invalidated.map((entry) => entry.reservationId),
  });
}
