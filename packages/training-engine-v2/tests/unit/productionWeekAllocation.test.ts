import { describe, expect, it } from "vitest";
import {
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  composeWeekAllocation,
  validateProductionWeekAllocationPlan,
} from "../../src";
import {
  PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
  productionComposerInput,
  productionFeasibilityOracle,
  productionOpportunity,
  productionPriority,
  productionSourceSnapshot,
  productionWeeklyIntent,
} from "../helpers/productionWeekPlanningFixtures";

describe("Production Week Allocation Composer", () => {
  it("allocates the S2 target through exact deterministic whole-Week search", () => {
    const input = productionComposerInput();
    const first = composeWeekAllocation(input);
    const repeated = composeWeekAllocation(input);
    expect(first).toEqual(repeated);
    expect(first.status).toBe("allocation_composed");
    expect(first.searchCompleteness).toBe("exact_optimal");
    expect(first.reservations).toHaveLength(2);
    expect(first.objectiveSatisfactionStates[input.weeklyIntent.objectives[0]!.objectiveId])
      .toBe("allocated_target_opportunities");
    expect(validateProductionWeekAllocationPlan(first)).toEqual([]);
  });

  it("preserves required before preferred and omits optional work without unique marginal value", () => {
    const source = productionSourceSnapshot([productionOpportunity({ index: 0 })]);
    const intent = productionWeeklyIntent({ source, priorities: [
      productionPriority({ priorityId: "required", priority: "required", priorityOrder: 0 }),
      productionPriority({ priorityId: "preferred", family: "muscle", purpose: "muscle_development",
        priority: "preferred", priorityOrder: 1 }),
      productionPriority({ priorityId: "optional", family: "capacity", purpose: "capacity_development",
        priority: "optional", priorityOrder: 2 }),
    ] });
    const plan = composeWeekAllocation(productionComposerInput({ source, intent }));
    expect(plan.status).toBe("allocation_composed");
    const optional = intent.objectives.find((entry) => entry.priority === "optional")!;
    expect(plan.objectiveAllocationTraces[optional.objectiveId]).toEqual([]);
    expect(plan.objectiveSatisfactionStates[optional.objectiveId]).toBe("optional_not_allocated");
    expect(plan.reservations.every((entry) => entry.allocatedObjectives.length > 0)).toBe(true);
  });

  it("admits explicit optional unique value without allowing it to beat required work", () => {
    const source = productionSourceSnapshot([productionOpportunity({ index: 0 })]);
    const intent = productionWeeklyIntent({ source, priorities: [
      productionPriority({ priorityId: "required", priority: "required", priorityOrder: 0 }),
      productionPriority({ priorityId: "optional", family: "capacity", purpose: "capacity_development",
        priority: "optional", priorityOrder: 1, uniqueMarginalValueRef: "explicit-capacity-value" }),
    ] });
    const plan = composeWeekAllocation(productionComposerInput({ source, intent }));
    expect(plan.status).toBe("allocation_composed");
    expect(plan.reservations[0]?.allocatedObjectives.map((entry) => entry.weeklyObjectivePriority))
      .toEqual(expect.arrayContaining(["required", "optional"]));
  });

  it("lets capacity-main be the sole dominant ordinary-session responsibility", () => {
    const source = productionSourceSnapshot([productionOpportunity({ index: 0 })]);
    const intent = productionWeeklyIntent({ source, priorities: [productionPriority({
      priorityId: "capacity", family: "capacity", purpose: "capacity_development",
    })] });
    const plan = composeWeekAllocation(productionComposerInput({ source, intent }));
    expect(plan.reservations[0]?.allocatedObjectives).toHaveLength(1);
    expect(plan.reservations[0]?.allocatedObjectives[0]?.purpose).toBe("capacity_main");
    expect(plan.reservations[0]?.allocatedObjectives[0]?.target.targetMovementRoles).toContain("horizontal_pull");
  });

  it("uses explicit reviewed spacing and never interprets opportunity order as elapsed time", () => {
    const input = productionComposerInput();
    const objectiveId = input.weeklyIntent.objectives[0]!.objectiveId;
    const spaced = composeWeekAllocation({ ...input, spacingRequirements: [{
      requirementId: "explicit-order-gap", objectiveIds: [objectiveId],
      basis: { kind: "ordered_opportunity_gap", minimumGap: 2 }, required: true, policySourceRef: "reviewed-spacing-rule",
    }] });
    expect(spaced.status).toBe("allocation_composed");
    const orders = spaced.reservations.map((reservation) => input.orderedOpportunities
      .find((entry) => entry.opportunityId === reservation.opportunityId)!.order);
    expect(orders[1]! - orders[0]!).toBeGreaterThanOrEqual(2);
  });

  it("returns search inconclusive when explicit limits are exhausted and emits no best-so-far plan", () => {
    const plan = composeWeekAllocation(productionComposerInput({ search: {
      ...PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
      mode: "exact_then_bounded_frontier",
      maximumExpandedStates: 1,
      maximumCompletePlansEvaluated: 1,
      maximumParetoStatesRetained: 1,
    } }));
    expect(plan.status).toBe("search_inconclusive");
    expect(plan.reservations).toEqual([]);
    expect(plan.decisionTrace).toContain("NO_EXECUTABLE_BEST_SO_FAR_PLAN");
  });

  it("preserves explicit downstream review and rejects infeasible oracle results", () => {
    const review = composeWeekAllocation(productionComposerInput({ oracle: productionFeasibilityOracle("candidate_review_required") }));
    expect(review.status).toBe("allocation_composed");
    expect(Object.values(review.objectiveSatisfactionStates)).toContain("allocated_requires_session_feasibility");
    const infeasible = composeWeekAllocation(productionComposerInput({
      oracle: productionFeasibilityOracle("infeasible_objective_combination"),
    }));
    expect(infeasible.status).toBe("allocation_infeasible");
    expect(infeasible.reservations).toEqual([]);
  });

  it("contains no exercise, dose, fixed-split, Candidate-score, or production-random authority", () => {
    const plan = composeWeekAllocation(productionComposerInput());
    const serialized = JSON.stringify(plan);
    expect(serialized).not.toMatch(/exerciseId|sets|reps|fixedSeed|candidateScore|push_pull_legs|upper_lower/);
    expect(plan.decisionTrace).toEqual(expect.arrayContaining(["NO_FIXED_SPLIT_AUTHORITY", "NO_EXERCISE_SELECTION", "NO_DOSE"]));
    expect(PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_WEEK_POLICY_V1.reference.version).toBe("1.0.0");
  });

  it("rejects opportunities and completion facts that are not the exact source snapshot", () => {
    const input = productionComposerInput();
    const extraOpportunity = productionOpportunity({ index: 5 });
    expect(composeWeekAllocation({ ...input,
      orderedOpportunities: [...input.orderedOpportunities, extraOpportunity] }).decisionTrace)
      .toContain("ORDERED_OPPORTUNITIES_MUST_MATCH_SOURCE_SNAPSHOT");
    expect(composeWeekAllocation({ ...input,
      completionState: { ...input.completionState,
        [input.orderedOpportunities[0]!.opportunityId]: "missed" } }).decisionTrace)
      .toContain("COMPLETION_STATE_MUST_MATCH_SOURCE_SNAPSHOT");
  });
});
