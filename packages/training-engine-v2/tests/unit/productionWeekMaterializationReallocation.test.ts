import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  NO_TRAINING_SAFETY_SIGNALS,
  PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  buildProductionPrescribedWeekSourceProjection,
  materializeSessionAllocation,
  reallocateRemainingWeek,
  validateProductionPrescribedWeekSourceSnapshot,
} from "../../src";
import {
  PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
  PRODUCTION_WEEK_TEST_TIME,
  productionFeasibilityOracle,
  productionMaterializationInput,
  productionOpportunity,
  reviseProductionPlanReservationStatuses,
  productionSourceSnapshot,
  productionWeekPlan,
  productionWeeklyIntent,
} from "../helpers/productionWeekPlanningFixtures";

describe("Production Session Allocation Materializer", () => {
  it("materializes only a current reservation plus explicit actual context", () => {
    const input = productionMaterializationInput();
    const result = materializeSessionAllocation(input);
    expect(result.status).toBe("directive_materialized");
    expect(result.directive?.allocatedObjectives).toHaveLength(input.reservation.allocatedObjectives.length);
    expect(result.currentEquipmentHandoff).toBe(input.actualCurrentEquipment);
    expect(JSON.stringify(result.directive)).not.toMatch(/exerciseId|sets|reps/);
  });

  it("retains required responsibility when minutes decrease but structural capacity remains sufficient", () => {
    const input = productionMaterializationInput();
    const result = materializeSessionAllocation({ ...input, actualCurrentAvailability: {
      ...input.actualCurrentAvailability!, availableMinutes: 30,
    } });
    expect(result.status).toBe("directive_materialized");
    expect(result.retainedObjectiveIds).toHaveLength(input.reservation.allocatedObjectives.length);
    expect(result.expectedActualTrace).toContain("LESS_TIME_DOES_NOT_SILENTLY_DROP_REQUIRED_RESPONSIBILITY");
  });

  it("requests, but does not run, reallocation for changed equipment or structural capacity", () => {
    const input = productionMaterializationInput();
    const result = materializeSessionAllocation({ ...input,
      actualCurrentEquipment: { capabilities: BODYWEIGHT_EQUIPMENT, provenance: "explicit_today", sourceRef: "equipment-loss" } });
    expect(result.status).toBe("requires_week_reallocation");
    expect(result.directive).toBeNull();
    expect(result.decisionTrace).toContain("NO_AUTOMATIC_REALLOCATION");
  });

  it("gives actual Safety and explicit cancellation typed precedence", () => {
    const input = productionMaterializationInput();
    const blocked = materializeSessionAllocation({ ...input, actualTrainingSafety: { signals: [{
      signalId: "actual-safety", requestedReviewLevel: "urgent_external_review_required",
      authority: { source: "athlete_report", sourceRef: "actual", evidenceBasis: ["Explicit current signal"],
        reportedBy: "athlete", reportedAt: PRODUCTION_WEEK_TEST_TIME }, resolution: { state: "unresolved" }, notes: [],
    }] } });
    expect(blocked.status).toBe("blocked_by_training_readiness");
    expect(materializeSessionAllocation({ ...input, userCancelled: true }).status).toBe("user_cancelled");
  });

  it("rejects stale and completed reservation revisions", () => {
    const input = productionMaterializationInput();
    expect(materializeSessionAllocation({ ...input, expectedWeekPlanRevisionId: "stale" }).status)
      .toBe("stale_reservation_revision");
    const completedPlan = reviseProductionPlanReservationStatuses(productionWeekPlan(), {
      [input.reservation.reservationId]: "completed_immutable",
    });
    expect(materializeSessionAllocation(productionMaterializationInput(completedPlan)).status)
      .toBe("stale_reservation_revision");
  });
});

describe("Production remaining-Week reallocation and Gate 13 projection", () => {
  it("preserves completed history, never doubles missed work, and returns an unapplied candidate", () => {
    const initialSource = productionSourceSnapshot();
    const intent = productionWeeklyIntent({ source: initialSource });
    const initialPlan = productionWeekPlan({ source: initialSource, intent });
    const currentPlan = reviseProductionPlanReservationStatuses(initialPlan, {
      [initialPlan.reservations[0]!.reservationId]: "completed_immutable",
      [initialPlan.reservations[1]!.reservationId]: "missed_requires_reallocation",
    });
    const completedReservation = currentPlan.reservations[0]!;
    const missedReservation = currentPlan.reservations[1]!;
    const updatedSource = productionSourceSnapshot(initialSource.opportunities.map((opportunity) =>
      productionOpportunity({ index: opportunity.order, completion:
        opportunity.opportunityId === completedReservation.opportunityId ? "completed" :
          opportunity.opportunityId === missedReservation.opportunityId ? "missed" : "not_started" })));
    const reallocationInput = {
      reallocationContract: PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
      currentPlan,
      currentSourceSnapshot: updatedSource,
      immutableCompletedReservationIds: [completedReservation.reservationId],
      missedCancelledOrInvalidatedOpportunityIds: [missedReservation.opportunityId],
      remainingObjectiveIds: [intent.objectives[0]!.objectiveId],
      updatedOpportunities: updatedSource.opportunities,
      trainingSafety: NO_TRAINING_SAFETY_SIGNALS,
      reasonEvidenceRefs: ["explicit-missed-opportunity"],
      policy: PRODUCTION_WEEK_POLICY_V1,
      feasibilityOracle: productionFeasibilityOracle(),
      searchResourcePolicy: PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
      evaluationTime: PRODUCTION_WEEK_TEST_TIME,
      reallocationAttemptId: "reallocation-attempt-1",
      weeklyIntent: intent,
    } as const;
    const result = reallocateRemainingWeek(reallocationInput);
    expect(result.status).toBe("revised_plan_candidate");
    expect(result.preservedCompletedReservations).toEqual([completedReservation]);
    expect(result.invalidatedFutureReservationIds).toContain(missedReservation.reservationId);
    expect(result.noDoubleCountTrace).toContain("MISSED_WORK_NOT_DOUBLED");
    expect(result.applicationApplied).toBe(false);
    expect(result.applicationOwnerRequired).toBe(true);
    expect(reallocateRemainingWeek({ ...reallocationInput, immutableCompletedReservationIds: [] }).status)
      .toBe("invalid_completed_history");
    expect(reallocateRemainingWeek({ ...reallocationInput,
      missedCancelledOrInvalidatedOpportunityIds: [] }).decisionTrace)
      .toContain("MISSED_CANCELLED_HISTORY_MUST_BE_ENUMERATED");
  });

  it("projects the production Week ontology into the existing Gate 13 source contract", () => {
    const source = productionSourceSnapshot();
    const intent = productionWeeklyIntent({ source });
    const plan = productionWeekPlan({ source, intent });
    const result = buildProductionPrescribedWeekSourceProjection({ sourceSnapshot: source, weeklyIntent: intent, weekPlan: plan });
    expect(result.status).toBe("projection_built");
    expect(validateProductionPrescribedWeekSourceSnapshot(result.projection!)).toEqual([]);
    expect(result.projection?.allocationTraces.every((entry) => entry.sessionDirectiveId === null &&
      entry.sessionNeedIds.length === 0)).toBe(true);
    expect(JSON.stringify(result.projection)).not.toMatch(/Prescription|Sequence|completedPerformance/);
  });
});
