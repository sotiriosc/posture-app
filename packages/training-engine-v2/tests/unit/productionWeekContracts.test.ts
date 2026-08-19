import { describe, expect, it } from "vitest";
import {
  HISTORICAL_WEEK_POLICY_V1_COMPATIBILITY_LABEL,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ACTIVATION_STATUS,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_CLASSIFICATION,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_STATUS,
  PRODUCTION_WEEK_POLICY_V1,
  PRODUCTION_WEEK_POLICY_V1_REFERENCE,
  PRODUCTION_WEEK_POLICY_REGISTRY_V1,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  buildProductionWeekPlanningSourceSnapshot,
  deriveWeekPlanningHorizonId,
  resolveProductionWeekPolicy,
  validateProductionWeekPlanningSourceSnapshot,
  validateProductionWeekPolicy,
  validateProductionWeekOpportunity,
  validateProductionWeeklyIntent,
  validateProductionWeekAllocationPlan,
  validateProductionReservation,
} from "../../src";
import {
  PRODUCTION_WEEK_TEST_PROVENANCE,
  PRODUCTION_WEEK_TEST_TIME,
  productionOpportunity,
  productionSourceSnapshot,
  productionWeeklyIntent,
  productionWeekPlan,
} from "../helpers/productionWeekPlanningFixtures";

describe("production Week contracts and canonical policy", () => {
  it("publishes versioned inactive contracts and the exact readiness classification", () => {
    expect(PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_STATUS)
      .toBe("PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_IMPLEMENTED_NOT_ACTIVATED");
    expect(PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ACTIVATION_STATUS).toBe("NOT_ACTIVATED");
    expect(PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_CLASSIFICATION)
      .toBe("PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_READY_FOR_ADAPTATION_APPLICATION_ORCHESTRATION_AUTHORIZATION");
  });

  it("preserves the admitted S2/H1/D1/A1/C1/P0/R0 values in one live policy", () => {
    expect(validateProductionWeekPolicy(PRODUCTION_WEEK_POLICY_V1)).toEqual([]);
    const bands = Object.fromEntries(PRODUCTION_WEEK_POLICY_V1.frequencyRules.map((entry) =>
      [`${entry.family}:${entry.priority}`, [entry.frequency.minimumAllocatedSessions,
        entry.frequency.targetAllocatedSessions, entry.frequency.softMaximumAllocatedSessions]]));
    expect(bands).toMatchObject({
      "strength:required": [1, 2, 3], "strength:preferred": [0, 1, 2], "strength:optional": [0, 1, 1],
      "muscle:required": [1, 1, 2], "direct:required": [1, 1, 1],
      "assessment:required": [1, 1, 1], "capacity:required": [1, 1, 1],
    });
    expect(PRODUCTION_WEEK_POLICY_V1.participationState).toBe("advisory_only_no_executable_frequency");
    expect(PRODUCTION_WEEK_POLICY_V1.spacingState).toBe("SPACING_R0_PRESCRIPTION_PENDING");
    expect(PRODUCTION_WEEK_POLICY_V1.historicalCompatibilityLabels)
      .toContain(HISTORICAL_WEEK_POLICY_V1_COMPATIBILITY_LABEL);
    expect(PRODUCTION_WEEK_POLICY_REGISTRY_V1.policies).toHaveLength(1);
  });

  it("fails closed for missing, unavailable, and equal-authority conflicting policy", () => {
    expect(resolveProductionWeekPolicy(null).reasonCode).toBe("WEEK_POLICY_REQUIRED");
    expect(resolveProductionWeekPolicy({ policyId: "missing", version: "1.0.0" }, PRODUCTION_WEEK_POLICY_REGISTRY_V1).reasonCode)
      .toBe("WEEK_POLICY_UNAVAILABLE");
    expect(resolveProductionWeekPolicy(PRODUCTION_WEEK_POLICY_V1_REFERENCE, {
      policies: [PRODUCTION_WEEK_POLICY_V1, PRODUCTION_WEEK_POLICY_V1],
    }).reasonCode).toBe("WEEK_POLICY_CONFLICT");
  });
});

describe("production Week planning source", () => {
  it("builds deterministic snapshot, horizon, and opportunity revisions from explicit facts", () => {
    const opportunities = [productionOpportunity({ index: 1 }), productionOpportunity({ index: 0 })];
    const first = productionSourceSnapshot(opportunities);
    const second = productionSourceSnapshot([...opportunities].reverse());
    expect(first).toEqual(second);
    expect(validateProductionWeekPlanningSourceSnapshot(first)).toEqual([]);
    expect(first.opportunities.map((entry) => entry.order)).toEqual([0, 1]);
  });

  it("rejects observed calendar freedom as consent and leaves profile defaults tentative", () => {
    const freeWindow = productionOpportunity({ index: 0, confirmation: "observed_free_window" });
    expect(validateProductionWeekPlanningSourceSnapshot({ ...productionSourceSnapshot(), opportunities: [freeWindow] }))
      .toContain("FREE_WINDOW_IS_NOT_TRAINING_CONSENT");
    const profileBoundary = { kind: "ordered_cycle" as const, cycleRef: "cycle", startOrder: 0, endOrder: 0 };
    const profileHorizonId = deriveWeekPlanningHorizonId({ athleteId: "athlete", boundary: profileBoundary,
      lineageAttemptId: "profile-default-only" });
    const result = buildProductionWeekPlanningSourceSnapshot({
      athleteId: "athlete", planningBoundary: profileBoundary,
      horizonLineageAttemptId: "profile-default-only", opportunities: [productionOpportunity({ index: 0,
        horizonId: profileHorizonId,
        status: "tentative", confirmation: "tentative" })], evaluationTime: PRODUCTION_WEEK_TEST_TIME,
      profileDefaults: { typicalDaysPerWeek: 3, typicalMinutes: 45, preferredDayRefs: ["monday"],
        confirmationState: "tentative", sourceRef: "profile" }, priorHorizonRevisionId: null,
      unresolvedContext: [], sourceAuthority: "explicit_user_fact", provenance: PRODUCTION_WEEK_TEST_PROVENANCE,
    });
    expect(result.status).toBe("current_week_availability_required");
    expect(result.snapshot).toBeNull();
  });

  it("rejects stale semantic revisions and substituted identities at every Week layer", () => {
    const opportunity = productionOpportunity({ index: 0 });
    expect(validateProductionWeekOpportunity({ ...opportunity, expectedAvailableMinutes: 30 }))
      .toContain("OPPORTUNITY_REVISION_CONTENT_MISMATCH");

    const source = productionSourceSnapshot();
    expect(validateProductionWeekPlanningSourceSnapshot({ ...source,
      unresolvedContext: [{ observationId: "mutated-source-context", category: "unknown", owner: "unknown",
        resolutionState: "requires_typed_input",
        blocksWeeklyIntent: false, blocksAllocation: false, sourceRef: "mutation" }] }))
      .toContain("WEEK_SOURCE_SNAPSHOT_REVISION_CONTENT_MISMATCH");

    const intent = productionWeeklyIntent({ source });
    expect(validateProductionWeeklyIntent({ ...intent, orderedSecondaryGoals: ["hypertrophy"] }))
      .toContain("WEEKLY_INTENT_REVISION_CONTENT_MISMATCH");

    const plan = productionWeekPlan({ source, intent });
    expect(validateProductionWeekAllocationPlan({ ...plan, weekPlanId: "random-plan-id" }))
      .toContain("WEEK_PLAN_IDENTITY_CONTENT_MISMATCH");
    expect(validateProductionWeekAllocationPlan({ ...plan,
      decisionTrace: [...plan.decisionTrace, "SEMANTIC_MUTATION"] }))
      .toContain("WEEK_PLAN_REVISION_CONTENT_MISMATCH");

    const reservation = plan.reservations[0]!;
    expect(validateProductionReservation({ ...reservation, reservationId: "random-reservation-id" }))
      .toContain("RESERVATION_IDENTITY_CONTENT_MISMATCH");
    expect(validateProductionReservation({ ...reservation, expectedAvailableMinutes: 15 }))
      .toContain("RESERVATION_REVISION_CONTENT_MISMATCH");
  });
});
