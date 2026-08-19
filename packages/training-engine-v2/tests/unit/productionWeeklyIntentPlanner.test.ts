import { describe, expect, it } from "vitest";
import {
  PRODUCTION_WEEK_POLICY_V1,
  planWeeklyIntent,
} from "../../src";
import {
  productionPlannerInput,
  productionPriority,
} from "../helpers/productionWeekPlanningFixtures";

describe("Production Weekly Intent Planner", () => {
  it("plans typed responsibility without placing it into opportunities", () => {
    const result = planWeeklyIntent(productionPlannerInput());
    expect(result.status).toBe("weekly_intent_planned");
    expect(result.weeklyIntent?.objectives).toHaveLength(1);
    expect(result.weeklyIntent?.objectives[0]?.frequencyIntent).toMatchObject({
      minimumAllocatedSessions: 1, targetAllocatedSessions: 2, softMaximumAllocatedSessions: 3,
    });
    expect(JSON.stringify(result.weeklyIntent)).not.toContain("reservationId");
    expect(result.ownershipFindings).toContain("OPPORTUNITY_PLACEMENT_DEFERRED_TO_WEEK_ALLOCATION_COMPOSER");
  });

  it("merges only structurally equivalent typed priorities and retains their provenance", () => {
    const result = planWeeklyIntent(productionPlannerInput({ priorities: [
      productionPriority({ priorityId: "a" }), productionPriority({ priorityId: "b" }),
    ] }));
    expect(result.weeklyIntent?.objectives).toHaveLength(1);
    expect(result.weeklyIntent?.objectives[0]?.sourcePriorityIds).toEqual(["a", "b"]);
    expect(result.mergedObjectiveTraces).toHaveLength(1);
  });

  it("keeps distinct purposes, direct ownership, and priority owners separate", () => {
    const direct = productionPriority({ priorityId: "direct", family: "direct", purpose: "direct_action_development",
      exactActionOwnership: "exact_action", target: { targetMovementRoles: [], targetActionFunctions: ["elbow_flexion"],
        targetMuscles: ["biceps"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["elbow"] } });
    const muscle = productionPriority({ priorityId: "muscle", family: "muscle", purpose: "muscle_development" });
    const result = planWeeklyIntent(productionPlannerInput({ priorities: [direct, muscle] }));
    expect(result.status).toBe("weekly_intent_planned");
    expect(result.weeklyIntent?.objectives).toHaveLength(2);
  });

  it("fails closed for missing policy, unavailable scope, no confirmed horizon, and Safety", () => {
    expect(planWeeklyIntent(productionPlannerInput({ policy: null })).status).toBe("weekly_policy_required");
    expect(planWeeklyIntent(productionPlannerInput({ outcomeGoal: "conditioning",
      priorities: [productionPriority({ family: "capacity", purpose: "capacity_development" })] })).status)
      .toBe("weekly_policy_required");
    const safety = { signals: [{ signalId: "review", requestedReviewLevel: "review_required_before_ordinary_training" as const,
      authority: { source: "coach" as const, sourceRef: "coach-review", evidenceBasis: ["Explicit review"],
        reportedBy: "coach", reportedAt: "2026-08-15T09:00:00-04:00" }, resolution: { state: "unresolved" as const }, notes: [] }] };
    expect(planWeeklyIntent(productionPlannerInput({ safety })).status).toBe("blocked_by_training_readiness");
  });

  it("keeps phase and pain contextual and creates no generic warm-up or activation objective", () => {
    const result = planWeeklyIntent(productionPlannerInput({ priorities: [productionPriority()] }));
    expect(result.weeklyIntent?.objectives.map((entry) => entry.purpose)).toEqual(["movement_development"]);
    expect(JSON.stringify(result.weeklyIntent)).not.toMatch(/generic[_-](warmup|warm-up|activation)/i);
    expect(result.ownershipFindings).toEqual(expect.arrayContaining(["PHASE_CONTEXT_ONLY", "PAIN_CREATES_NO_WEEKLY_OBJECTIVE"]));
    expect(result.weeklyIntent?.policyReference).toEqual(PRODUCTION_WEEK_POLICY_V1.reference);
  });

  it("derives stable lineage identity and a changed immutable revision for material source changes", () => {
    const first = planWeeklyIntent(productionPlannerInput());
    const changed = planWeeklyIntent(productionPlannerInput({ priorities: [productionPriority({ priorityOrder: 1 })] }));
    expect(first.weeklyIntent?.intentId).toBe(changed.weeklyIntent?.intentId);
    expect(first.weeklyIntent?.intentRevisionId).not.toBe(changed.weeklyIntent?.intentRevisionId);
  });
});
