import { canonicalize, explicitIsoTime, sameSemanticValue, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import { validateProductionWeeklyExecutionRequirements } from "../domain/weeklyExecutionRequirements";
import {
  PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
  PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  type ProductionExpectedEquipment,
  type ProductionSessionAllocationReservation,
  type ProductionSessionFeasibilityResult,
  type ProductionWeekAllocationPlan,
  type ProductionWeekOpportunityConstraint,
  type ProductionWeekPlanningBoundary,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeekPolicy,
  type ProductionWeekSearchResourcePolicy,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeeklyDevelopmentObjective,
  type ProductionWeeklyIntent,
  type ProductionWeeklyRecoverySpacingRequirement,
} from "./contracts";

export { canonicalize, explicitIsoTime, sameSemanticValue, stableId, uniqueSorted };

export function canonicalWeekFingerprint(value: unknown): string {
  return stableId("production-week-fingerprint", canonicalize(value)).split(":")[1]!;
}

export function deriveWeekPlanningHorizonId(input: {
  readonly athleteId: string;
  readonly boundary: ProductionWeekPlanningBoundary;
  readonly lineageAttemptId: string;
}): string {
  return stableId("week-horizon", input);
}

export function deriveWeekOpportunityId(input: {
  readonly horizonId: string;
  readonly intendedWindowRef: string;
}): string {
  return stableId("week-opportunity", input);
}

export function deriveWeekOpportunityRevisionId(input: Omit<ProductionWeekTrainingOpportunity,
"opportunityRevisionId" | "provenance">): string {
  return stableId("week-opportunity-revision", input);
}

export function deriveWeekPlanningHorizonRevisionId(input: {
  readonly horizonId: string;
  readonly opportunities: readonly ProductionWeekTrainingOpportunity[];
  readonly unresolvedContextIds: readonly string[];
  readonly evaluationTime: string;
  readonly basedOnRevisionId: string | null;
}): string {
  return stableId("week-horizon-revision", {
    ...input,
    opportunities: [...input.opportunities]
      .sort((left, right) => left.order - right.order || left.opportunityId.localeCompare(right.opportunityId))
      .map((opportunity) => ({
        opportunityId: opportunity.opportunityId,
        opportunityRevisionId: opportunity.opportunityRevisionId,
      })),
    unresolvedContextIds: uniqueSorted(input.unresolvedContextIds),
  });
}

export function deriveWeekSourceSnapshotId(input: Pick<ProductionWeekPlanningSourceSnapshot,
"athleteId" | "planningHorizonId">): string {
  return stableId("week-source-snapshot", {
    athleteId: input.athleteId,
    planningHorizonId: input.planningHorizonId,
  });
}

export function deriveWeekSourceSnapshotRevisionId(input: Omit<ProductionWeekPlanningSourceSnapshot,
"sourceSnapshotRevisionId" | "provenance">): string {
  return stableId("week-source-snapshot-revision", input);
}

export function deriveWeeklyIntentId(input: {
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly outcomeGoalLineageId: string;
  readonly policyReference: ProductionWeekPolicy["reference"];
  readonly intentAttemptId: string;
}): string {
  return stableId("weekly-intent", input);
}

export function deriveWeeklyIntentRevisionId(input: Omit<ProductionWeeklyIntent,
"intentRevisionId" | "provenance">): string {
  return stableId("weekly-intent-revision", input);
}

export function deriveWeekPlanId(input: {
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly weeklyIntentId: string;
  readonly allocationAttemptId: string;
}): string {
  return stableId("week-plan", input);
}

export function deriveWeekPlanRevisionId(input: Omit<ProductionWeekAllocationPlan,
"weekPlanRevisionId" | "reservations" | "provenance"> & {
  readonly reservations: readonly Omit<ProductionSessionAllocationReservation,
  "weekPlanRevisionId" | "reservationRevisionId" | "provenance">[];
}): string {
  return stableId("week-plan-revision", input);
}

export function deriveReservationId(input: {
  readonly weekPlanId: string;
  readonly opportunityId: string;
  readonly responsibilityLineage: readonly string[];
}): string {
  return stableId("week-reservation", { ...input, responsibilityLineage: uniqueSorted(input.responsibilityLineage) });
}

export function deriveReservationRevisionId(input: Omit<ProductionSessionAllocationReservation,
"reservationRevisionId" | "provenance">): string {
  return stableId("week-reservation-revision", input);
}

function requiredText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function unique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function validEquipment(equipment: ProductionExpectedEquipment): boolean {
  return equipment.kind === "capability_snapshot" ||
    (equipment.kind === "equipment_reference" && requiredText(equipment.equipmentRef)) ||
    (equipment.kind === "unknown" && requiredText(equipment.sourceRef));
}

function validateConstraint(constraint: ProductionWeekOpportunityConstraint): readonly string[] {
  const reasons: string[] = [];
  if (!requiredText(constraint.constraintId) || !requiredText(constraint.sourceRef)) reasons.push("OPPORTUNITY_CONSTRAINT_ID_REQUIRED");
  if (!unique(constraint.targetOpportunityIds)) reasons.push("OPPORTUNITY_CONSTRAINT_TARGET_DUPLICATE");
  return reasons;
}

export function validateProductionWeekOpportunity(opportunity: ProductionWeekTrainingOpportunity): readonly string[] {
  const reasons: string[] = [];
  if (!requiredText(opportunity.opportunityId)) reasons.push("OPPORTUNITY_ID_REQUIRED");
  if (!requiredText(opportunity.opportunityRevisionId)) reasons.push("OPPORTUNITY_REVISION_ID_REQUIRED");
  if (!requiredText(opportunity.intendedWindowRef)) reasons.push("OPPORTUNITY_WINDOW_LINEAGE_REQUIRED");
  if (!Number.isInteger(opportunity.order) || opportunity.order < 0) reasons.push("OPPORTUNITY_ORDER_INVALID");
  if (opportunity.expectedAvailableMinutes !== null &&
      (!Number.isFinite(opportunity.expectedAvailableMinutes) || opportunity.expectedAvailableMinutes <= 0)) {
    reasons.push("OPPORTUNITY_AVAILABLE_MINUTES_INVALID");
  }
  if (opportunity.timeWindow) {
    if (!explicitIsoTime(opportunity.timeWindow.startsAt) || !explicitIsoTime(opportunity.timeWindow.endsAt) ||
        Date.parse(opportunity.timeWindow.startsAt) >= Date.parse(opportunity.timeWindow.endsAt)) {
      reasons.push("OPPORTUNITY_TIME_WINDOW_INVALID");
    }
  }
  if (!validEquipment(opportunity.expectedEquipment)) reasons.push("OPPORTUNITY_EXPECTED_EQUIPMENT_INVALID");
  const { opportunityRevisionId, provenance, ...revisionContent } = opportunity;
  void provenance;
  if (deriveWeekOpportunityRevisionId(revisionContent) !== opportunityRevisionId) {
    reasons.push("OPPORTUNITY_REVISION_CONTENT_MISMATCH");
  }
  reasons.push(...opportunity.constraints.flatMap(validateConstraint));
  if (opportunity.confirmationState === "observed_free_window" && opportunity.availabilityStatus === "available") {
    reasons.push("FREE_WINDOW_IS_NOT_TRAINING_CONSENT");
  }
  if (["tentative", "suggested_training_opportunity"].includes(opportunity.confirmationState) &&
      opportunity.availabilityStatus === "available") {
    reasons.push("UNCONFIRMED_OPPORTUNITY_CANNOT_BE_AVAILABLE");
  }
  return uniqueSorted(reasons);
}

export function validateProductionWeekPlanningSourceSnapshot(
  snapshot: ProductionWeekPlanningSourceSnapshot,
): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(snapshot.sourceContract, PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_WEEK_PLANNING_SOURCE_VERSION");
  }
  if (![snapshot.sourceSnapshotId, snapshot.sourceSnapshotRevisionId, snapshot.athleteId,
    snapshot.planningHorizonId, snapshot.horizonRevisionId].every(requiredText)) reasons.push("WEEK_SOURCE_ID_REQUIRED");
  if (!explicitIsoTime(snapshot.evaluationTime)) reasons.push("WEEK_SOURCE_EVALUATION_TIME_INVALID");
  if (snapshot.opportunities.length === 0) reasons.push("WEEK_SOURCE_OPPORTUNITIES_REQUIRED");
  reasons.push(...snapshot.opportunities.flatMap(validateProductionWeekOpportunity));
  const opportunityIds = snapshot.opportunities.map((entry) => entry.opportunityId);
  const revisions = snapshot.opportunities.map((entry) => entry.opportunityRevisionId);
  const orders = snapshot.opportunities.map((entry) => entry.order);
  if (!unique(opportunityIds)) reasons.push("DUPLICATE_OPPORTUNITY_ID");
  if (!unique(revisions)) reasons.push("DUPLICATE_OPPORTUNITY_REVISION_ID");
  if (!unique(orders.map(String))) reasons.push("DUPLICATE_OPPORTUNITY_ORDER");
  if (snapshot.opportunities.some((entry) => deriveWeekOpportunityId({ horizonId: snapshot.planningHorizonId,
    intendedWindowRef: entry.intendedWindowRef }) !== entry.opportunityId)) {
    reasons.push("OPPORTUNITY_ID_HORIZON_LINEAGE_MISMATCH");
  }
  if (snapshot.profileDefaults && snapshot.profileDefaults.confirmationState !== "tentative") {
    reasons.push("PROFILE_DEFAULT_MUST_REMAIN_TENTATIVE");
  }
  if (deriveWeekSourceSnapshotId(snapshot) !== snapshot.sourceSnapshotId) reasons.push("WEEK_SOURCE_SNAPSHOT_ID_MISMATCH");
  const expectedHorizonRevisionId = deriveWeekPlanningHorizonRevisionId({
    horizonId: snapshot.planningHorizonId,
    opportunities: snapshot.opportunities,
    unresolvedContextIds: snapshot.unresolvedContext.map((entry) => entry.observationId),
    evaluationTime: snapshot.evaluationTime,
    basedOnRevisionId: snapshot.priorHorizonRevisionId,
  });
  if (expectedHorizonRevisionId !== snapshot.horizonRevisionId) reasons.push("WEEK_HORIZON_REVISION_CONTENT_MISMATCH");
  const { sourceSnapshotRevisionId, provenance, ...snapshotRevisionContent } = snapshot;
  void provenance;
  if (deriveWeekSourceSnapshotRevisionId(snapshotRevisionContent) !== sourceSnapshotRevisionId) {
    reasons.push("WEEK_SOURCE_SNAPSHOT_REVISION_CONTENT_MISMATCH");
  }
  return uniqueSorted(reasons);
}

export function validateProductionWeekPolicy(policy: ProductionWeekPolicy): readonly string[] {
  const reasons: string[] = [];
  if (!requiredText(policy.reference.policyId) || !requiredText(policy.reference.version)) reasons.push("WEEK_POLICY_REFERENCE_REQUIRED");
  const keys = policy.frequencyRules.map((rule) => `${rule.family}:${rule.priority}`);
  if (!unique(keys)) reasons.push("DUPLICATE_WEEK_POLICY_RULE");
  for (const rule of policy.frequencyRules) {
    const frequency = rule.frequency;
    if (![frequency.minimumAllocatedSessions, frequency.targetAllocatedSessions,
      frequency.softMaximumAllocatedSessions].every((value) => Number.isInteger(value) && value >= 0) ||
      frequency.minimumAllocatedSessions > frequency.targetAllocatedSessions ||
      frequency.targetAllocatedSessions > frequency.softMaximumAllocatedSessions) {
      reasons.push(`WEEK_POLICY_FREQUENCY_INVALID:${rule.ruleId}`);
    }
  }
  if (policy.participationState !== "advisory_only_no_executable_frequency") reasons.push("PARTICIPATION_P0_REQUIRED");
  if (policy.spacingState !== "SPACING_R0_PRESCRIPTION_PENDING") reasons.push("SPACING_R0_REQUIRED");
  return uniqueSorted(reasons);
}

export function validateProductionWeeklyObjective(objective: ProductionWeeklyDevelopmentObjective): readonly string[] {
  const reasons: string[] = [];
  if (!requiredText(objective.objectiveId) || objective.sourcePriorityIds.length === 0) reasons.push("WEEK_OBJECTIVE_IDENTITY_REQUIRED");
  if (!unique(objective.sourcePriorityIds)) reasons.push("WEEK_OBJECTIVE_SOURCE_PRIORITY_DUPLICATE");
  if (objective.frequencyIntent.minimumAllocatedSessions > objective.frequencyIntent.targetAllocatedSessions ||
      objective.frequencyIntent.targetAllocatedSessions > objective.frequencyIntent.softMaximumAllocatedSessions) {
    reasons.push("WEEK_OBJECTIVE_FREQUENCY_INVALID");
  }
  if (objective.family === "direct" && objective.target.muscleRequirement !== "primary_required" &&
      objective.target.targetActionFunctions.length === 0) {
    reasons.push("DIRECT_OBJECTIVE_REQUIRES_PRIMARY_OR_EXACT_ACTION");
  }
  if (objective.executionRequirements) {
    reasons.push(...validateProductionWeeklyExecutionRequirements(objective.executionRequirements));
  }
  return uniqueSorted(reasons);
}

export function validateProductionWeeklyIntent(intent: ProductionWeeklyIntent): readonly string[] {
  const reasons: string[] = [];
  if (![intent.intentId, intent.intentRevisionId, intent.intentAttemptId, intent.athleteId,
    intent.planningHorizonId, intent.horizonRevisionId].every(requiredText)) reasons.push("WEEKLY_INTENT_IDENTITY_REQUIRED");
  if (!explicitIsoTime(intent.evaluationTime)) reasons.push("WEEKLY_INTENT_EVALUATION_TIME_INVALID");
  reasons.push(...intent.objectives.flatMap(validateProductionWeeklyObjective));
  if (!unique(intent.objectives.map((entry) => entry.objectiveId))) reasons.push("DUPLICATE_WEEK_OBJECTIVE_ID");
  const { intentRevisionId, provenance, ...revisionContent } = intent;
  void provenance;
  if (deriveWeeklyIntentRevisionId(revisionContent) !== intentRevisionId) reasons.push("WEEKLY_INTENT_REVISION_CONTENT_MISMATCH");
  return uniqueSorted(reasons);
}

export function validateProductionWeekSearchResourcePolicy(policy: ProductionWeekSearchResourcePolicy): readonly string[] {
  const reasons: string[] = [];
  if (![policy.policyId, policy.version].every(requiredText)) reasons.push("WEEK_SEARCH_POLICY_REFERENCE_REQUIRED");
  if (![policy.maximumExpandedStates, policy.maximumCompletePlansEvaluated,
    policy.maximumParetoStatesRetained].every((value) => Number.isInteger(value) && value > 0)) {
    reasons.push("WEEK_SEARCH_RESOURCE_LIMIT_INVALID");
  }
  if (policy.onLimit !== "RETURN_SEARCH_INCONCLUSIVE") reasons.push("WEEK_SEARCH_LIMIT_MUST_RETURN_INCONCLUSIVE");
  return uniqueSorted(reasons);
}

export function validateProductionSessionFeasibilityResult(result: ProductionSessionFeasibilityResult): readonly string[] {
  const reasons: string[] = [];
  if (![result.opportunityId, result.opportunityRevisionId, result.resultFingerprint].every(requiredText)) {
    reasons.push("SESSION_FEASIBILITY_IDENTITY_REQUIRED");
  }
  if (result.objectiveIds.length === 0 || !unique(result.objectiveIds)) reasons.push("SESSION_FEASIBILITY_OBJECTIVES_INVALID");
  return uniqueSorted(reasons);
}

export function validateProductionSpacingRequirement(
  requirement: ProductionWeeklyRecoverySpacingRequirement,
): readonly string[] {
  const reasons: string[] = [];
  if (!requiredText(requirement.requirementId) || !requiredText(requirement.policySourceRef)) reasons.push("SPACING_REQUIREMENT_ID_REQUIRED");
  if (requirement.objectiveIds.length === 0 || !unique(requirement.objectiveIds)) reasons.push("SPACING_OBJECTIVES_INVALID");
  if (requirement.basis.kind === "ordered_opportunity_gap" &&
      (!Number.isInteger(requirement.basis.minimumGap) || requirement.basis.minimumGap < 1)) {
    reasons.push("ORDERED_OPPORTUNITY_GAP_INVALID");
  }
  if (requirement.basis.kind === "elapsed_time_duration" &&
      (!Number.isFinite(requirement.basis.minimumDurationMinutes) || requirement.basis.minimumDurationMinutes <= 0)) {
    reasons.push("ELAPSED_TIME_SPACING_INVALID");
  }
  return uniqueSorted(reasons);
}

export function validateProductionReservation(reservation: ProductionSessionAllocationReservation): readonly string[] {
  const reasons: string[] = [];
  if (![reservation.reservationId, reservation.reservationRevisionId, reservation.weekPlanId,
    reservation.weekPlanRevisionId, reservation.weeklyIntentId, reservation.weeklyIntentRevisionId,
    reservation.opportunityId, reservation.opportunityRevisionId].every(requiredText)) reasons.push("RESERVATION_IDENTITY_REQUIRED");
  if (reservation.allocatedObjectives.length === 0) reasons.push("EMPTY_RESERVATION");
  if (!unique(reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId))) {
    reasons.push("DUPLICATE_OBJECTIVE_WITHIN_RESERVATION");
  }
  const expectedReservationId = deriveReservationId({ weekPlanId: reservation.weekPlanId,
    opportunityId: reservation.opportunityId,
    responsibilityLineage: reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId) });
  if (expectedReservationId !== reservation.reservationId) reasons.push("RESERVATION_IDENTITY_CONTENT_MISMATCH");
  const { reservationRevisionId, provenance, ...revisionContent } = reservation;
  void provenance;
  if (deriveReservationRevisionId(revisionContent) !== reservationRevisionId) {
    reasons.push("RESERVATION_REVISION_CONTENT_MISMATCH");
  }
  return uniqueSorted(reasons);
}

export function validateProductionWeekAllocationPlan(plan: ProductionWeekAllocationPlan): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(plan.planContract, PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_WEEK_PLAN_REVISION_VERSION");
  }
  if (![plan.weekPlanId, plan.weekPlanRevisionId, plan.allocationAttemptId, plan.athleteId, plan.weeklyIntentId,
    plan.weeklyIntentRevisionId, plan.planningHorizonId, plan.horizonRevisionId].every(requiredText)) {
    reasons.push("WEEK_PLAN_IDENTITY_REQUIRED");
  }
  const expectedPlanId = deriveWeekPlanId({ athleteId: plan.athleteId,
    planningHorizonId: plan.planningHorizonId, weeklyIntentId: plan.weeklyIntentId,
    allocationAttemptId: plan.allocationAttemptId });
  if (expectedPlanId !== plan.weekPlanId) reasons.push("WEEK_PLAN_IDENTITY_CONTENT_MISMATCH");
  if (!explicitIsoTime(plan.evaluationTime)) reasons.push("WEEK_PLAN_EVALUATION_TIME_INVALID");
  reasons.push(...plan.reservations.flatMap(validateProductionReservation));
  if (!unique(plan.reservations.map((entry) => entry.reservationId))) reasons.push("DUPLICATE_RESERVATION_ID");
  if (!unique(plan.reservations.map((entry) => entry.reservationRevisionId))) reasons.push("DUPLICATE_RESERVATION_REVISION_ID");
  if (plan.reservations.some((entry) => entry.athleteId !== plan.athleteId || entry.weekPlanId !== plan.weekPlanId)) {
    reasons.push("WEEK_PLAN_RESERVATION_IDENTITY_MISMATCH");
  }
  if (plan.reservations.some((entry) => entry.status !== "completed_immutable" &&
      entry.weekPlanRevisionId !== plan.weekPlanRevisionId)) {
    reasons.push("WEEK_PLAN_RESERVATION_REVISION_MISMATCH");
  }
  const { weekPlanRevisionId, provenance, reservations, ...planRevisionContent } = plan;
  void provenance;
  const revisionReservations = reservations.map((reservation) => {
    const { weekPlanRevisionId: reservationPlanRevisionId, reservationRevisionId,
      provenance: reservationProvenance, ...reservationContent } = reservation;
    void reservationPlanRevisionId;
    void reservationRevisionId;
    void reservationProvenance;
    return reservationContent;
  });
  if (deriveWeekPlanRevisionId({ ...planRevisionContent, reservations: revisionReservations }) !== weekPlanRevisionId) {
    reasons.push("WEEK_PLAN_REVISION_CONTENT_MISMATCH");
  }
  return uniqueSorted(reasons);
}

export function validateProductionWeekContractReference(reference: unknown): readonly string[] {
  const supported = [
    PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
    PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
    PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
    PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
    PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
    PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE,
  ];
  return supported.some((entry) => sameSemanticValue(entry, reference)) ? [] : ["UNSUPPORTED_PRODUCTION_WEEK_CONTRACT_VERSION"];
}
