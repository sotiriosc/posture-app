import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import {
  canonicalize,
  explicitIsoTime,
  sameSemanticValue,
  stableId,
  uniqueSorted,
  validateProductionReservation,
} from "./canonical";
import {
  PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
  type ProductionSessionAllocationMaterializationInput,
  type ProductionSessionAllocationMaterializationResult,
  type ProductionSessionAllocationMaterializationStatus,
} from "./contracts";

function sameEquipment(
  expected: ProductionSessionAllocationMaterializationInput["reservation"]["expectedEquipment"],
  actual: NonNullable<ProductionSessionAllocationMaterializationInput["actualCurrentEquipment"]>,
): boolean {
  if (expected.kind !== "capability_snapshot") return true;
  return JSON.stringify(canonicalize(expected.capabilities)) === JSON.stringify(canonicalize(actual.capabilities));
}

function baseResult(
  input: ProductionSessionAllocationMaterializationInput,
  status: ProductionSessionAllocationMaterializationStatus,
  reasons: readonly string[],
): ProductionSessionAllocationMaterializationResult {
  const materializationId = stableId("session-allocation-materialization", {
    reservationId: input.reservation.reservationId,
    materializationAttemptId: input.materializationAttemptId,
  });
  const materializationRevisionId = stableId("session-allocation-materialization-revision", {
    materializationId,
    reservationRevisionId: input.reservation.reservationRevisionId,
    priorMaterializationRevisionId: input.priorMaterializationRevisionId ?? null,
    actualCurrentAvailability: input.actualCurrentAvailability,
    actualCurrentStructuralCapacity: input.actualCurrentStructuralCapacity,
    actualCurrentEquipment: input.actualCurrentEquipment,
    actualTrainingSafety: input.actualTrainingSafety,
    actualEvaluationTime: input.actualEvaluationTime,
    userCancelled: input.userCancelled,
    unresolvedCurrentContext: input.unresolvedCurrentContext,
  });
  return Object.freeze({
    status,
    materializationId,
    materializationRevisionId,
    directive: null,
    currentEquipmentHandoff: input.actualCurrentEquipment,
    expectedActualTrace: uniqueSorted(reasons),
    retainedObjectiveIds: uniqueSorted(input.reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId)),
    reallocationEvidence: status === "requires_week_reallocation" || status === "user_cancelled" ? uniqueSorted(reasons) : Object.freeze([]),
    unresolvedContext: input.unresolvedCurrentContext,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: input.actualTrainingSafety }),
    decisionTrace: Object.freeze([status, ...uniqueSorted(reasons), "NO_AUTOMATIC_REALLOCATION", "NO_EXERCISE_SELECTION", "NO_DOSE"]),
    provenance: Object.freeze({ owner: "session_allocation_materializer",
      sourceRefs: Object.freeze([input.reservation.reservationRevisionId, ...input.productUpdateRefs].sort()),
      ruleRefs: Object.freeze(["EXPECTED_VERSUS_ACTUAL", "LOCAL_TRAINING_SAFETY_RECHECK", "APPLICATION_DEFERRED"]) }),
  });
}

export function materializeSessionAllocation(
  input: ProductionSessionAllocationMaterializationInput,
): ProductionSessionAllocationMaterializationResult {
  if (!sameSemanticValue(input.materializerContract, PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE)) {
    return baseResult(input, "unsupported_materializer_contract", ["UNSUPPORTED_PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_VERSION"]);
  }
  const inputReasons = [
    ...validateProductionReservation(input.reservation),
    ...(explicitIsoTime(input.actualEvaluationTime) ? [] : ["MATERIALIZATION_EVALUATION_TIME_INVALID"]),
    ...(input.materializationAttemptId.trim() ? [] : ["MATERIALIZATION_ATTEMPT_ID_REQUIRED"]),
  ];
  if (inputReasons.length > 0) return baseResult(input, "invalid_materialization_input", inputReasons);
  if (input.expectedWeekPlanRevisionId !== input.reservation.weekPlanRevisionId) {
    return baseResult(input, "stale_reservation_revision", ["RESERVATION_WEEK_PLAN_REVISION_STALE"]);
  }
  if (input.reservation.status === "completed_immutable") {
    return baseResult(input, "stale_reservation_revision", ["COMPLETED_RESERVATION_IMMUTABLE"]);
  }
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.actualTrainingSafety });
  if (!readiness.downstreamTrainingAllowed) {
    return baseResult(input, "blocked_by_training_readiness", readiness.unresolvedSignalIds);
  }
  if (input.userCancelled) return baseResult(input, "user_cancelled", ["USER_EXPLICITLY_CANCELLED"]);
  if (input.unresolvedCurrentContext.some((entry) => entry.blocksPlanning)) {
    return baseResult(input, "unsupported_context", input.unresolvedCurrentContext
      .filter((entry) => entry.blocksPlanning).map((entry) => entry.observationId));
  }
  if (!input.actualCurrentAvailability || !input.actualCurrentEquipment || !input.actualCurrentStructuralCapacity) {
    return baseResult(input, "under_specified_current_context", ["ACTUAL_AVAILABILITY_EQUIPMENT_AND_CAPACITY_REQUIRED"]);
  }
  const reallocationReasons: string[] = [];
  if (["missed_requires_reallocation", "cancelled_requires_reallocation", "blocked_by_training_readiness", "unresolved"]
    .includes(input.reservation.status)) reallocationReasons.push(`RESERVATION_STATUS:${input.reservation.status}`);
  if (input.actualCurrentStructuralCapacity !== input.reservation.expectedStructuralCapacity) {
    reallocationReasons.push("ACTUAL_STRUCTURAL_CAPACITY_CHANGED");
  }
  if (!sameEquipment(input.reservation.expectedEquipment, input.actualCurrentEquipment)) {
    reallocationReasons.push("ACTUAL_EQUIPMENT_CHANGED");
  }
  if (input.actualCurrentAvailability.availableMinutes !== null && input.actualCurrentAvailability.availableMinutes <= 0) {
    reallocationReasons.push("ACTUAL_AVAILABLE_MINUTES_INSUFFICIENT");
  }
  if (reallocationReasons.length > 0) return baseResult(input, "requires_week_reallocation", reallocationReasons);

  const base = baseResult(input, "directive_materialized", [
    `EXPECTED_MINUTES:${input.reservation.expectedAvailableMinutes ?? "unknown"}`,
    `ACTUAL_MINUTES:${input.actualCurrentAvailability.availableMinutes ?? "unknown"}`,
    "STRUCTURAL_CAPACITY_CONFIRMED",
    "ACTUAL_EQUIPMENT_RESOLVED",
    ...(input.actualCurrentAvailability.availableMinutes !== input.reservation.expectedAvailableMinutes ?
      ["LESS_TIME_DOES_NOT_SILENTLY_DROP_REQUIRED_RESPONSIBILITY"] : []),
  ]);
  const directive = Object.freeze({
    id: stableId("session-allocation-directive", {
      reservationRevisionId: input.reservation.reservationRevisionId,
      materializationRevisionId: base.materializationRevisionId,
    }),
    source: "future_week_composer" as const,
    athleteId: input.reservation.athleteId,
    sessionType: "ordinary_training" as const,
    outcomeGoal: input.reservation.sessionOutcomeGoal,
    programmingContextModes: input.reservation.programmingContextModes,
    currentSessionAvailability: input.actualCurrentAvailability,
    allocatedObjectives: Object.freeze(input.reservation.allocatedObjectives.map((objective) => Object.freeze({
      id: objective.responsibilityId,
      kind: objective.purpose,
      priority: objective.sessionLocalPriority,
      priorityOrder: objective.priorityOrder,
      selectionTarget: objective.target,
      sourceEvidence: Object.freeze([{ sourceKind: "future_week_allocation" as const,
        sourceId: objective.weeklyObjectiveId, evidenceRefs: objective.sourceEvidenceRefs }]),
      standaloneAdmissionDirection: "policy_default" as const,
      reasonCode: objective.reasonCode,
      explanation: "Materialized from an explicitly reserved weekly responsibility; no new policy was added.",
      ...(objective.executionRequirements ? { executionRequirements: objective.executionRequirements } : {}),
    }))),
    neighboringSessionContextRefs: input.reservation.neighboringReservationRefs,
    unresolvedWeeklyContextRefs: input.reservation.unresolvedWeekContext.map((entry) => entry.observationId),
    weekReallocationEvidenceRefs: Object.freeze([]),
    unresolvedContextObservations: input.unresolvedCurrentContext,
    sourceTrace: Object.freeze({ owner: "future_week_composer" as const,
      sourceRefs: Object.freeze([input.reservation.reservationRevisionId, ...input.productUpdateRefs].sort()),
      transformationRuleIds: Object.freeze(["RESERVATION_PLUS_ACTUAL_CONTEXT_NO_NEW_POLICY"]),
    }),
    evaluationAsOf: input.actualEvaluationTime,
  });
  return Object.freeze({ ...base, directive,
    decisionTrace: Object.freeze(["directive_materialized", "EXPECTED_VERSUS_ACTUAL_VALIDATED",
      "REQUIRED_RESPONSIBILITIES_RETAINED", "NO_EXERCISE_SELECTION", "NO_DOSE", "NO_APPLICATION"]) });
}
