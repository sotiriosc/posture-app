import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import type {
  SessionAllocationMaterializationResult as DesignMaterializationResult,
  SessionAllocationReservation as DesignReservation,
  WeekAllocationPlan as DesignWeekAllocationPlan,
  WeekPlanningHorizon as DesignWeekPlanningHorizon,
  WeeklyIntent as DesignWeeklyIntent,
} from "../weekComposer/designContracts";
import {
  deriveReservationId,
  deriveReservationRevisionId,
  deriveWeekOpportunityId,
  deriveWeekOpportunityRevisionId,
  deriveWeekPlanningHorizonId,
  deriveWeekPlanId,
  deriveWeekPlanRevisionId,
  deriveWeeklyIntentId,
  deriveWeeklyIntentRevisionId,
  stableId,
  uniqueSorted,
} from "./canonical";
import {
  PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
  type ProductionSessionAllocationMaterializationResult,
  type ProductionSessionAllocationReservation,
  type ProductionWeekAllocationPlan,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeekPolicy,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeeklyDevelopmentObjective,
  type ProductionWeeklyIntent,
} from "./contracts";
import { buildProductionWeekPlanningSourceSnapshot } from "./source";

export function adaptDesignWeekPlanningHorizon(input: {
  readonly horizon: DesignWeekPlanningHorizon;
  readonly confirmationByOpportunityId: Readonly<Record<string, ProductionWeekTrainingOpportunity["confirmationState"]>>;
  readonly horizonLineageAttemptId: string;
}): ReturnType<typeof buildProductionWeekPlanningSourceSnapshot> {
  const planningHorizonId = deriveWeekPlanningHorizonId({ athleteId: input.horizon.athleteId,
    boundary: input.horizon.boundary, lineageAttemptId: input.horizonLineageAttemptId });
  const opportunities = input.horizon.opportunities.map((opportunity): ProductionWeekTrainingOpportunity => {
    const intendedWindowRef = opportunity.id;
    const base: Omit<ProductionWeekTrainingOpportunity, "opportunityRevisionId" | "provenance"> = {
      opportunityId: deriveWeekOpportunityId({ horizonId: planningHorizonId, intendedWindowRef }),
      intendedWindowRef,
      order: opportunity.order,
      ...(opportunity.calendarDateRef ? { timeWindow: { startsAt: `${opportunity.calendarDateRef}T00:00:00Z`,
        endsAt: `${opportunity.calendarDateRef}T23:59:59Z`, timezone: input.horizon.timezone ?? "UTC" } } : {}),
      availabilityStatus: opportunity.availabilityStatus === "completed" ? "unavailable" : opportunity.availabilityStatus,
      completionStatus: opportunity.completionStatus,
      expectedAvailableMinutes: opportunity.expectedAvailability.availableMinutes,
      expectedStructuralCapacity: opportunity.expectedAvailability.structuralCapacity,
      expectedEquipment: opportunity.expectedEquipment.kind === "capability_snapshot" ?
        { kind: "capability_snapshot", capabilities: opportunity.expectedEquipment.capabilities,
          sourceRef: opportunity.expectedEquipment.provenance.sourceRef } : opportunity.expectedEquipment.kind === "equipment_reference" ?
          { kind: "equipment_reference", equipmentRef: opportunity.expectedEquipment.equipmentRef,
            sourceRef: opportunity.expectedEquipment.provenance.sourceRef } :
          { kind: "unknown", sourceRef: opportunity.expectedEquipment.provenance.sourceRef },
      constraints: opportunity.constraints.map((constraint) => ({ constraintId: constraint.constraintId,
        kind: constraint.kind, targetOpportunityIds: constraint.targetOpportunityIds, required: constraint.required,
        sourceRef: constraint.provenance.sourceRef })),
      confirmationState: input.confirmationByOpportunityId[opportunity.id] ?? "tentative",
      sourceAuthority: "compatibility_adapter",
    };
    return Object.freeze({ ...base, opportunityRevisionId: deriveWeekOpportunityRevisionId(base),
      provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([opportunity.id]),
        ruleRefs: Object.freeze(["DESIGN_HORIZON_TO_PRODUCTION_SOURCE"]) }) });
  });
  return buildProductionWeekPlanningSourceSnapshot({
    athleteId: input.horizon.athleteId,
    planningBoundary: input.horizon.boundary,
    horizonLineageAttemptId: input.horizonLineageAttemptId,
    opportunities,
    evaluationTime: input.horizon.evaluationAsOf,
    ...(input.horizon.timezone ? { timezone: input.horizon.timezone } : {}),
    priorHorizonRevisionId: null,
    unresolvedContext: input.horizon.unresolvedScheduleContext.map((entry) => ({ observationId: entry.observationId,
      category: entry.category, owner: entry.category === "illness_or_safety" ? "training_safety" : "unknown",
      resolutionState: entry.resolutionState, blocksWeeklyIntent: entry.blocksWeeklyIntent,
      blocksAllocation: entry.blocksAllocation, sourceRef: entry.sourceRef })),
    sourceAuthority: "compatibility_adapter",
    provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([input.horizon.id]),
      ruleRefs: Object.freeze(["DESIGN_HORIZON_COMPATIBILITY_ONLY", "NO_LIVE_PRODUCT_LOOKUP"]) }),
  });
}

function designObjectiveToProduction(
  objective: DesignWeeklyIntent["objectives"][number],
): ProductionWeeklyDevelopmentObjective | null {
  if (!objective.frequencyIntent || objective.purpose === "conditioning_development") return null;
  const family = objective.purpose === "movement_development" ? "strength" :
    objective.purpose === "muscle_development" ? "muscle" :
      objective.purpose === "direct_action_development" ? "direct" :
        objective.purpose === "assessment_priority_development" ? "assessment" : "capacity";
  return Object.freeze({
    objectiveId: objective.id,
    family,
    purpose: objective.purpose,
    target: objective.selectionTarget,
    priority: objective.priority,
    priorityOrder: objective.priorityOrder,
    sourceEvidence: objective.sourceEvidence.map((entry) => ({ sourceKind: entry.sourceKind,
      sourceId: entry.sourceId, evidenceRefs: entry.evidenceRefs })),
    sourcePriorityIds: uniqueSorted(objective.sourceEvidence.map((entry) => entry.sourceId)),
    goalRelationships: objective.goalRelationships,
    frequencyIntent: { minimumAllocatedSessions: objective.frequencyIntent.minimumAllocatedSessions,
      targetAllocatedSessions: objective.frequencyIntent.targetAllocatedSessions,
      softMaximumAllocatedSessions: objective.frequencyIntent.softMaximumAllocatedSessions,
      sourceRef: objective.frequencyIntent.sourceRef },
    dosePolicyState: objective.dosePolicyReference.state === "not_applicable" ? "not_applicable" : "pending_prescription_policy",
    spacingRequirementRefs: objective.recoverySpacingRequirementRefs,
    roleFlexibility: objective.sessionRoleFlexibility,
    uniqueMarginalValueRef: objective.priority === "optional" ? `${objective.id}:historical-explicit-value` : null,
    policyState: objective.unresolvedPolicyState === "resolved_for_allocation" ? "resolved_for_allocation" :
      objective.unresolvedPolicyState === "FREQUENCY_POLICY_REQUIRED" ? "frequency_policy_required" : "dose_policy_pending",
    reasonCode: "explicit_supported_weekly_priority",
    provenance: Object.freeze({ owner: "compatibility_adapter",
      sourceRefs: uniqueSorted(objective.sourceEvidence.map((entry) => entry.sourceId)),
      ruleRefs: Object.freeze(["DESIGN_WEEKLY_OBJECTIVE_COMPATIBILITY_PROJECTION"]) }),
  });
}

export function adaptDesignWeeklyIntent(input: {
  readonly intent: DesignWeeklyIntent;
  readonly sourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly policy: ProductionWeekPolicy;
  readonly outcomeGoalLineageId: string;
  readonly intentAttemptId: string;
}): { readonly status: "adapted"; readonly intent: ProductionWeeklyIntent } |
  { readonly status: "unsupported_design_intent"; readonly intent: null; readonly reasonCodes: readonly string[] } {
  const objectives = input.intent.objectives.map(designObjectiveToProduction);
  if (objectives.some((entry) => entry === null)) return Object.freeze({ status: "unsupported_design_intent",
    intent: null, reasonCodes: Object.freeze(["DESIGN_INTENT_CONTAINS_UNSUPPORTED_OBJECTIVE_SCOPE"]) });
  const intentId = deriveWeeklyIntentId({ athleteId: input.intent.athleteId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId, outcomeGoalLineageId: input.outcomeGoalLineageId,
    policyReference: input.policy.reference, intentAttemptId: input.intentAttemptId });
  const base: Omit<ProductionWeeklyIntent, "intentRevisionId" | "provenance"> = {
    intentId, basedOnRevisionId: null, intentAttemptId: input.intentAttemptId,
    athleteId: input.intent.athleteId, planningHorizonId: input.sourceSnapshot.planningHorizonId,
    horizonRevisionId: input.sourceSnapshot.horizonRevisionId,
    sourceSnapshotRevisionId: input.sourceSnapshot.sourceSnapshotRevisionId,
    outcomeGoal: input.intent.outcomeGoal, orderedSecondaryGoals: input.intent.orderedSecondaryGoals,
    programmingContextModes: input.intent.programmingContextModes, phaseIntentRef: input.intent.phaseIntentRef,
    objectives: objectives as readonly ProductionWeeklyDevelopmentObjective[], policyReference: input.policy.reference,
    continuityEvidence: Object.freeze({ priorPlanRevisionId: null,
      productiveRelationships: input.intent.continuityEvidence.productiveAllocationRelationships.map((entry) => ({
        objectiveLineageRef: entry.objectiveId,
        opportunityId: entry.responsibilitySignature.split("@").at(-1) ?? entry.responsibilitySignature,
        sourceRefs: entry.sourceEvidenceRefs })),
      completedOpportunityIds: input.intent.continuityEvidence.completedOpportunityIds,
      missedOpportunityIds: input.intent.continuityEvidence.missedOpportunityIds,
      changeReasonRefs: input.intent.continuityEvidence.changeReasonRefs }),
    unresolvedContext: input.sourceSnapshot.unresolvedContext,
    evaluationTime: input.sourceSnapshot.evaluationTime,
  };
  const productionIntent: ProductionWeeklyIntent = Object.freeze({ ...base,
    intentRevisionId: deriveWeeklyIntentRevisionId(base),
    provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([input.intent.id]),
      ruleRefs: Object.freeze(["DESIGN_INTENT_TO_PRODUCTION_COMPATIBILITY"]) }) });
  return Object.freeze({ status: "adapted", intent: productionIntent });
}

export function adaptDesignWeekAllocationPlan(input: {
  readonly designPlan: DesignWeekAllocationPlan;
  readonly intent: ProductionWeeklyIntent;
  readonly sourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly allocationAttemptId: string;
}): ProductionWeekAllocationPlan {
  const weekPlanId = deriveWeekPlanId({ athleteId: input.intent.athleteId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId, weeklyIntentId: input.intent.intentId,
    allocationAttemptId: input.allocationAttemptId });
  const weekPlanRevisionId = stableId("week-plan-revision", { weekPlanId, designPlan: input.designPlan,
    intentRevisionId: input.intent.intentRevisionId, horizonRevisionId: input.sourceSnapshot.horizonRevisionId });
  const opportunityByDesignId = new Map(input.sourceSnapshot.opportunities.map((entry) =>
    [entry.intendedWindowRef, entry]));
  const reservationIdByDesignId = new Map(input.designPlan.reservations.map((reservation) => [reservation.id,
    deriveReservationId({ weekPlanId,
      opportunityId: opportunityByDesignId.get(reservation.opportunityId)!.opportunityId,
      responsibilityLineage: reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId) })]));
  const reservations = input.designPlan.reservations.map((reservation): ProductionSessionAllocationReservation => {
    const opportunity = opportunityByDesignId.get(reservation.opportunityId)!;
    const base: Omit<ProductionSessionAllocationReservation, "reservationRevisionId" | "provenance"> = {
      reservationId: reservationIdByDesignId.get(reservation.id)!, weekPlanId, weekPlanRevisionId,
      weeklyIntentId: input.intent.intentId, weeklyIntentRevisionId: input.intent.intentRevisionId,
      opportunityId: opportunity.opportunityId, opportunityRevisionId: opportunity.opportunityRevisionId,
      athleteId: reservation.athleteId, sessionType: reservation.sessionType,
      weeklyPrimaryGoal: reservation.weeklyPrimaryOutcomeGoal,
      weeklySecondaryGoals: reservation.weeklySecondaryOutcomeGoals,
      sessionOutcomeGoal: reservation.sessionOutcomeGoal,
      goalEvidenceRefs: uniqueSorted(reservation.sessionGoalEvidence.flatMap((entry) => entry.goalRelationship.sourceEvidenceRefs)),
      programmingContextModes: reservation.programmingContextModes,
      allocatedObjectives: reservation.allocatedObjectives.map((entry) => ({
        responsibilityId: entry.id, weeklyObjectiveId: entry.weeklyObjectiveId, purpose: entry.purpose,
        weeklyObjectivePriority: entry.weeklyObjectivePriority, sessionLocalPriority: entry.priority,
        priorityOrder: entry.priorityOrder, target: entry.selectionTarget, sourceEvidenceRefs: entry.sourceEvidenceRefs,
        reasonCode: entry.purpose === "activation" || entry.purpose === "explicit_preparation" ?
          "explicit_assessment_or_preparation" : entry.purpose === "recovery" ?
            "explicit_recovery_responsibility" : "allocated_weekly_responsibility",
        provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([entry.id]),
          ruleRefs: Object.freeze(["DESIGN_RESPONSIBILITY_COMPATIBILITY"]) }),
      })),
      expectedStructuralCapacity: reservation.expectedStructuralCapacity,
      expectedAvailableMinutes: reservation.expectedAvailability.availableMinutes,
      expectedEquipment: reservation.expectedEquipment.kind === "capability_snapshot" ?
        { kind: "capability_snapshot", capabilities: reservation.expectedEquipment.capabilities,
          sourceRef: reservation.expectedEquipment.provenance.sourceRef } : reservation.expectedEquipment.kind === "equipment_reference" ?
          { kind: "equipment_reference", equipmentRef: reservation.expectedEquipment.equipmentRef,
            sourceRef: reservation.expectedEquipment.provenance.sourceRef } :
          { kind: "unknown", sourceRef: reservation.expectedEquipment.provenance.sourceRef },
      neighboringReservationRefs: reservation.neighboringReservationRefs.map((id) => reservationIdByDesignId.get(id) ?? id),
      weeklyObjectiveSourceRefs: reservation.weeklyObjectiveSourceRefs,
      unresolvedWeekContext: input.sourceSnapshot.unresolvedContext,
      unresolvedCurrentSessionContext: reservation.unresolvedCurrentSessionContext.map((entry) => entry.observationId),
      status: reservation.status, sourceTrace: Object.freeze([reservation.id, "DESIGN_RESERVATION_COMPATIBILITY"]),
    };
    return Object.freeze({ ...base, reservationRevisionId: deriveReservationRevisionId(base),
      provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([reservation.id]),
        ruleRefs: Object.freeze(["DESIGN_RESERVATION_TO_PRODUCTION"]) }) });
  });
  const statuses = Object.fromEntries(input.intent.objectives.map((objective) => [objective.objectiveId,
    input.designPlan.objectiveSatisfactionStates[objective.objectiveId] ?? "below_minimum_unresolved"]));
  const draftPlan: ProductionWeekAllocationPlan = Object.freeze({
    planContract: PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE, weekPlanId, weekPlanRevisionId,
    basedOnRevisionId: null, allocationAttemptId: input.allocationAttemptId,
    athleteId: input.intent.athleteId,
    weeklyIntentId: input.intent.intentId, weeklyIntentRevisionId: input.intent.intentRevisionId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId, horizonRevisionId: input.sourceSnapshot.horizonRevisionId,
    status: input.designPlan.status === "allocation_designed" ? "allocation_composed" :
      input.designPlan.status === "allocation_infeasible" ? "allocation_infeasible" :
        input.designPlan.status === "requires_policy" ? "requires_policy" :
          input.designPlan.status === "search_inconclusive" ? "search_inconclusive" : "blocked_by_training_readiness",
    reservations, objectiveAllocationTraces: input.designPlan.objectiveAllocationTraces,
    unallocatedObjectiveTraces: input.designPlan.unallocatedObjectiveTraces,
    spacingTraces: input.designPlan.recoverySpacingTraces,
    continuityTraces: input.designPlan.continuityTraces,
    equipmentAvailabilityTraces: input.designPlan.equipmentAvailabilityTraces,
    structuralCapacityTraces: input.designPlan.expectedStructuralCapacityTraces,
    searchCompleteness: input.designPlan.searchCompleteness === "exhaustive_design_optimal" ? "exact_optimal" :
      input.designPlan.searchCompleteness === "exhaustive_design_infeasible" ? "exact_infeasible" :
        input.designPlan.searchCompleteness === "bounded_design_optimality_not_proven" ?
          "bounded_optimality_not_proven" : "search_inconclusive",
    searchTrace: input.designPlan.decisionTrace,
    wholeWeekEvaluation: null,
    objectiveSatisfactionStates: statuses,
    unresolvedPrescriptionRequirements: input.designPlan.unresolvedPrescriptionRequirements,
    unresolvedCurrentSessionFacts: input.designPlan.unresolvedCurrentSessionFacts,
    reallocationState: input.designPlan.reallocationState,
    decisionTrace: Object.freeze([...input.designPlan.decisionTrace, "DESIGN_PLAN_COMPATIBILITY_PROJECTION"]),
    evaluationTime: input.sourceSnapshot.evaluationTime,
    provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([input.designPlan.weeklyIntentId]),
      ruleRefs: Object.freeze(["DESIGN_PLAN_TO_PRODUCTION_COMPATIBILITY", "NO_APPLICATION"]) }),
  });
  const { weekPlanRevisionId: draftRevisionId, provenance, reservations: draftReservations,
    ...planRevisionContent } = draftPlan;
  void draftRevisionId;
  const revisionReservations = draftReservations.map((reservation) => {
    const { weekPlanRevisionId: reservationPlanRevisionId, reservationRevisionId,
      provenance: reservationProvenance, ...reservationContent } = reservation;
    void reservationPlanRevisionId;
    void reservationRevisionId;
    void reservationProvenance;
    return reservationContent;
  });
  const finalPlanRevisionId = deriveWeekPlanRevisionId({ ...planRevisionContent,
    reservations: revisionReservations });
  const finalReservations = draftReservations.map((reservation) => {
    const { reservationRevisionId, provenance: reservationProvenance, ...reservationContent } = reservation;
    void reservationRevisionId;
    const finalContent = { ...reservationContent, weekPlanRevisionId: finalPlanRevisionId };
    return Object.freeze({ ...finalContent, reservationRevisionId: deriveReservationRevisionId(finalContent),
      provenance: reservationProvenance });
  });
  return Object.freeze({ ...draftPlan, weekPlanRevisionId: finalPlanRevisionId,
    reservations: Object.freeze(finalReservations), provenance });
}

export function adaptDesignMaterializationResult(input: {
  readonly result: DesignMaterializationResult;
  readonly reservation: ProductionSessionAllocationReservation;
  readonly materializationAttemptId: string;
  readonly evaluationTime: string;
}): ProductionSessionAllocationMaterializationResult {
  const materializationId = stableId("session-allocation-materialization", {
    reservationId: input.reservation.reservationId, materializationAttemptId: input.materializationAttemptId });
  return Object.freeze({
    status: input.result.status,
    materializationId,
    materializationRevisionId: stableId("session-allocation-materialization-revision", {
      materializationId, reservationRevisionId: input.reservation.reservationRevisionId, result: input.result }),
    directive: input.result.directive,
    currentEquipmentHandoff: input.result.plannerCurrentEquipment,
    expectedActualTrace: input.result.expectedActualComparisonTrace,
    retainedObjectiveIds: input.result.retainedWeeklyObjectiveIds,
    reallocationEvidence: input.result.reallocationEvidenceRefs,
    unresolvedContext: input.result.unresolvedContext,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: { signals: [] } }),
    decisionTrace: Object.freeze([...input.result.decisionTrace, "DESIGN_MATERIALIZATION_COMPATIBILITY_PROJECTION"]),
    provenance: Object.freeze({ owner: "compatibility_adapter", sourceRefs: Object.freeze([
      input.reservation.reservationRevisionId]), ruleRefs: Object.freeze(["DESIGN_MATERIALIZATION_TO_PRODUCTION"]) }),
  });
}

export function projectProductionReservationToDesign(
  reservation: ProductionSessionAllocationReservation,
): DesignReservation {
  return {
    id: reservation.reservationId, weekIntentId: reservation.weeklyIntentId,
    opportunityId: reservation.opportunityId, athleteId: reservation.athleteId,
    sessionType: reservation.sessionType, weeklyPrimaryOutcomeGoal: reservation.weeklyPrimaryGoal,
    weeklySecondaryOutcomeGoals: reservation.weeklySecondaryGoals, sessionOutcomeGoal: reservation.sessionOutcomeGoal,
    sessionGoalEvidence: [], programmingContextModes: reservation.programmingContextModes,
    allocatedObjectives: reservation.allocatedObjectives.map((entry) => ({ id: entry.responsibilityId,
      weeklyObjectiveId: entry.weeklyObjectiveId, purpose: entry.purpose,
      weeklyObjectivePriority: entry.weeklyObjectivePriority, priority: entry.sessionLocalPriority,
      priorityOrder: entry.priorityOrder, selectionTarget: entry.target,
      sourceEvidenceRefs: entry.sourceEvidenceRefs, reasonCode: entry.reasonCode,
      explanation: "Compatibility projection from a production reservation." })),
    expectedStructuralCapacity: reservation.expectedStructuralCapacity,
    expectedAvailability: { availableMinutes: reservation.expectedAvailableMinutes,
      structuralCapacity: reservation.expectedStructuralCapacity,
      provenance: { sourceType: "product_adapter", sourceRef: reservation.reservationRevisionId,
        evidenceBasis: ["Production reservation compatibility projection"], recordedAt: "unknown",
        reviewStatus: "accepted", truthState: "expected_future_fact" } },
    expectedEquipment: reservation.expectedEquipment.kind === "capability_snapshot" ?
      { kind: "capability_snapshot", capabilities: reservation.expectedEquipment.capabilities,
        provenance: { sourceType: "product_adapter", sourceRef: reservation.expectedEquipment.sourceRef,
          evidenceBasis: ["Production reservation compatibility projection"], recordedAt: "unknown",
          reviewStatus: "accepted", truthState: "expected_future_fact" } } :
      { kind: "unknown", provenance: { sourceType: "product_adapter", sourceRef: reservation.expectedEquipment.sourceRef,
        evidenceBasis: ["Expected equipment remains unresolved in the historical projection"], recordedAt: "unknown",
        reviewStatus: "needs_review", truthState: "expected_future_fact" } },
    neighboringReservationRefs: reservation.neighboringReservationRefs,
    weeklyObjectiveSourceRefs: reservation.weeklyObjectiveSourceRefs,
    unresolvedWeeklyContext: [], unresolvedCurrentSessionContext: [], status: reservation.status,
    sourceTrace: { composerId: "week_allocation_composer_design_v1", sourceRefs: [reservation.reservationRevisionId],
      policyRefs: [], ruleRefs: ["PRODUCTION_TO_HISTORICAL_DESIGN_PROJECTION"] },
  };
}
