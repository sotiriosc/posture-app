import { productionProvenance, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  type PrescribedWeekSourceSnapshot,
} from "../weekValidation/sourceContracts";
import { validateProductionPrescribedWeekSourceSnapshot } from "../weekValidation/validation";
import type {
  ProductionWeekAllocationPlan,
  ProductionWeekPlanningSourceSnapshot,
  ProductionWeeklyIntent,
} from "./contracts";

export interface BuildProductionPrescribedWeekSourceProjectionInput {
  readonly sourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly weeklyIntent: ProductionWeeklyIntent;
  readonly weekPlan: ProductionWeekAllocationPlan;
}

export type BuildProductionPrescribedWeekSourceProjectionResult =
  | { readonly status: "projection_built"; readonly projection: PrescribedWeekSourceSnapshot; readonly reasonCodes: readonly string[] }
  | { readonly status: "invalid_projection_input"; readonly projection: null; readonly reasonCodes: readonly string[] };

function availability(status: string): "available" | "unavailable" | "unknown" {
  if (status === "available") return "available";
  if (status === "cancelled" || status === "unavailable") return "unavailable";
  return "unknown";
}

function execution(status: string): "not_started" | "in_progress" | "performed" | "cancelled" | "unknown" {
  if (status === "not_started") return "not_started";
  if (status === "completed") return "performed";
  if (status === "cancelled") return "cancelled";
  return "unknown";
}

export function buildProductionPrescribedWeekSourceProjection(
  input: BuildProductionPrescribedWeekSourceProjectionInput,
): BuildProductionPrescribedWeekSourceProjectionResult {
  const lineageReasons = [
    ...(input.sourceSnapshot.planningHorizonId === input.weekPlan.planningHorizonId ? [] : ["GATE_13_HORIZON_LINEAGE_MISMATCH"]),
    ...(input.weeklyIntent.intentId === input.weekPlan.weeklyIntentId ? [] : ["GATE_13_INTENT_LINEAGE_MISMATCH"]),
    ...(input.weeklyIntent.athleteId === input.sourceSnapshot.athleteId ? [] : ["GATE_13_ATHLETE_LINEAGE_MISMATCH"]),
    ...(input.weekPlan.status === "allocation_composed" ? [] : ["GATE_13_REQUIRES_COMPOSED_WEEK_PLAN"]),
  ];
  if (lineageReasons.length > 0) return Object.freeze({ status: "invalid_projection_input", projection: null,
    reasonCodes: uniqueSorted(lineageReasons) });
  const provenance = Object.freeze([productionProvenance(input.weekPlan.weekPlanRevisionId,
    "Pure production Week source projection; downstream realization artifacts are intentionally absent.")]);
  const reservationsByOpportunity = new Map<string, string[]>();
  for (const reservation of input.weekPlan.reservations) {
    reservationsByOpportunity.set(reservation.opportunityId,
      [...(reservationsByOpportunity.get(reservation.opportunityId) ?? []), reservation.reservationId]);
  }
  const projection: PrescribedWeekSourceSnapshot = Object.freeze({
    sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
    sourceSnapshotId: stableId("prescribed-week-source", {
      athleteId: input.weeklyIntent.athleteId, horizonId: input.sourceSnapshot.planningHorizonId,
      intentId: input.weeklyIntent.intentId, planId: input.weekPlan.weekPlanId }),
    sourceSnapshotRevisionId: stableId("prescribed-week-source-revision", {
      sourceRevisionId: input.sourceSnapshot.sourceSnapshotRevisionId,
      intentRevisionId: input.weeklyIntent.intentRevisionId,
      planRevisionId: input.weekPlan.weekPlanRevisionId,
      evaluationTime: input.weekPlan.evaluationTime,
    }),
    sourceAuthority: "PRODUCTION_WEEK_SOURCE_CONTRACT",
    athleteId: input.weeklyIntent.athleteId,
    planningHorizonId: input.sourceSnapshot.planningHorizonId,
    weeklyIntentId: input.weeklyIntent.intentId,
    weekAllocationPlanId: input.weekPlan.weekPlanId,
    horizonBoundary: Object.freeze({
      startsAt: input.sourceSnapshot.planningBoundary.kind === "explicit_date_range" ?
        `${input.sourceSnapshot.planningBoundary.startDate}T00:00:00Z` : null,
      endsAt: input.sourceSnapshot.planningBoundary.kind === "explicit_date_range" ?
        `${input.sourceSnapshot.planningBoundary.endDate}T23:59:59Z` : null,
      timezone: input.sourceSnapshot.timezone ?? null,
    }),
    opportunities: Object.freeze(input.sourceSnapshot.opportunities.map((opportunity) => Object.freeze({
      opportunityId: opportunity.opportunityId,
      order: opportunity.order,
      calendarDateTime: opportunity.timeWindow?.startsAt ?? null,
      availableMinutes: opportunity.expectedAvailableMinutes,
      availabilityState: availability(opportunity.availabilityStatus),
      executionState: execution(opportunity.completionStatus),
      reservationIds: Object.freeze([...(reservationsByOpportunity.get(opportunity.opportunityId) ?? [])].sort()),
      provenance,
    }))),
    objectives: Object.freeze(input.weeklyIntent.objectives.map((objective) => Object.freeze({
      objectiveId: objective.objectiveId,
      purpose: objective.purpose,
      target: objective.target,
      priority: objective.priority,
      priorityOrder: objective.priorityOrder,
      goalRelationships: objective.goalRelationships,
      frequencyIntent: Object.freeze({ ...objective.frequencyIntent, provenance }),
      supportedPolicyRef: input.weeklyIntent.policyReference,
      dosePolicyState: objective.dosePolicyState === "not_applicable" ? "not_applicable" as const :
        "prescribed_dose_target_not_defined" as const,
      spacingState: "SPACING_R0_PRESCRIPTION_PENDING" as const,
      sourceEvidenceRefs: uniqueSorted(objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs)),
      provenance,
    }))),
    reservations: Object.freeze(input.weekPlan.reservations.map((reservation) => Object.freeze({
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      allocatedObjectiveIds: Object.freeze(reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId).sort()),
      expectedSessionGoal: reservation.sessionOutcomeGoal,
      responsibilityEvidenceRefs: uniqueSorted(reservation.allocatedObjectives.flatMap((entry) => entry.sourceEvidenceRefs)),
      availabilityState: reservation.status === "cancelled_requires_reallocation" ? "unavailable" as const : "available" as const,
      executionState: reservation.status === "completed_immutable" ? "performed" as const :
        reservation.status === "cancelled_requires_reallocation" ? "cancelled" as const : "not_started" as const,
      invalidationState: reservation.status === "cancelled_requires_reallocation" ? "cancelled" as const : "active" as const,
      provenance,
    }))),
    allocationTraces: Object.freeze(input.weekPlan.reservations.flatMap((reservation) =>
      reservation.allocatedObjectives.map((objective) => Object.freeze({
        allocationTraceId: stableId("week-allocation-trace", {
          planRevisionId: input.weekPlan.weekPlanRevisionId, reservationId: reservation.reservationId,
          objectiveId: objective.weeklyObjectiveId }),
        objectiveId: objective.weeklyObjectiveId,
        reservationId: reservation.reservationId,
        opportunityId: reservation.opportunityId,
        sessionDirectiveId: null,
        sessionNeedIds: Object.freeze([]),
        sourceEvidenceRefs: objective.sourceEvidenceRefs,
        provenance,
      })))),
    unsupportedScopes: Object.freeze(input.weeklyIntent.unresolvedContext.map((entry) => entry.category).sort()),
    unresolvedPolicyRefs: Object.freeze(input.weeklyIntent.objectives
      .filter((entry) => entry.policyState !== "resolved_for_allocation").map((entry) => entry.objectiveId).sort()),
    evaluationTime: input.weekPlan.evaluationTime,
    provenance,
  });
  const reasons = validateProductionPrescribedWeekSourceSnapshot(projection);
  return reasons.length === 0 ? Object.freeze({ status: "projection_built", projection, reasonCodes: Object.freeze([]) }) :
    Object.freeze({ status: "invalid_projection_input", projection: null, reasonCodes: reasons });
}

export function buildProductionAllocationLedger(
  intent: ProductionWeeklyIntent,
  plan: ProductionWeekAllocationPlan,
) {
  return Object.freeze(intent.objectives.map((objective) => {
    const reservationIds = plan.reservations.filter((reservation) => reservation.allocatedObjectives
      .some((entry) => entry.weeklyObjectiveId === objective.objectiveId)).map((entry) => entry.reservationId).sort();
    return Object.freeze({ objectiveId: objective.objectiveId, reservationIds: Object.freeze(reservationIds),
      opportunityCount: reservationIds.length,
      satisfactionState: plan.objectiveSatisfactionStates[objective.objectiveId] ?? "below_minimum_unresolved",
      doseCredit: 0 as const });
  }));
}
