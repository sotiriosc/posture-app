import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  PRODUCTION_WEEK_POLICY_V1,
  composeWeekAllocation,
  materializeSessionAllocation,
  planWeeklyIntent,
} from "../../src";
import {
  PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
  productionComposerInput,
  productionMaterializationInput,
  productionOpportunity,
  productionPlannerInput,
  productionPriority,
  productionSourceSnapshot,
  productionWeekPlan,
} from "../helpers/productionWeekPlanningFixtures";
import { PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST } from "../cagt/productionWeekEvidence";

describe("production Week mutation rejection", () => {
  it("freezes all 64 semantic mutation subjects without name-based rejection", () => {
    expect(PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST).toHaveLength(64);
    expect(new Set(PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST).size).toBe(64);
    expect(PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST.every((entry) => entry.length > 0)).toBe(true);
  });
  it("rejects hidden/missing policy and unsupported fallback instead of borrowing a family", () => {
    expect(planWeeklyIntent(productionPlannerInput({ policy: null })).status).toBe("weekly_policy_required");
    expect(planWeeklyIntent({ ...productionPlannerInput(), policy: { policyId: "unknown", version: "9.9.9" },
      policyRegistry: { policies: [PRODUCTION_WEEK_POLICY_V1] } }).policyFindings).toContain("WEEK_POLICY_UNAVAILABLE");
  });

  it("rejects optional bloat, fixed-seed-like hidden bounds, and best-so-far execution", () => {
    const source = productionSourceSnapshot([productionOpportunity({ index: 0 })]);
    const planned = planWeeklyIntent(productionPlannerInput({ source, priorities: [productionPriority({
      priorityId: "optional", priority: "optional", family: "capacity", purpose: "capacity_development",
    })] }));
    const plan = composeWeekAllocation(productionComposerInput({ source, intent: planned.weeklyIntent! }));
    expect(plan.reservations).toEqual([]);
    const exhausted = composeWeekAllocation(productionComposerInput({ search: {
      ...PRODUCTION_WEEK_EXACT_SEARCH_POLICY, maximumExpandedStates: 1,
      maximumCompletePlansEvaluated: 1, maximumParetoStatesRetained: 1,
    } }));
    expect(exhausted.status).toBe("search_inconclusive");
    expect(exhausted.reservations).toEqual([]);
  });

  it("never treats expected equipment as actual or silently substitutes an exercise", () => {
    const input = productionMaterializationInput();
    const changed = materializeSessionAllocation({ ...input,
      actualCurrentEquipment: { capabilities: BODYWEIGHT_EQUIPMENT, provenance: "explicit_today", sourceRef: "changed" } });
    expect(changed.status).toBe("requires_week_reallocation");
    expect(changed.directive).toBeNull();
    expect(JSON.stringify(changed)).not.toContain("exerciseId");
  });
});

describe("production Week metamorphic properties", () => {
  it("is invariant to explicit objective and opportunity array ordering", () => {
    const priorities = [productionPriority({ priorityId: "a", priorityOrder: 0 }),
      productionPriority({ priorityId: "b", family: "capacity", purpose: "capacity_development", priorityOrder: 1 })];
    const forward = planWeeklyIntent(productionPlannerInput({ priorities }));
    const reverse = planWeeklyIntent(productionPlannerInput({ priorities: [...priorities].reverse() }));
    expect(forward.weeklyIntent).toEqual(reverse.weeklyIntent);
    const opportunities = [productionOpportunity({ index: 0 }), productionOpportunity({ index: 1 }),
      productionOpportunity({ index: 2 })];
    const sourceForward = productionSourceSnapshot(opportunities);
    const sourceReverse = productionSourceSnapshot([...opportunities].reverse());
    expect(sourceForward).toEqual(sourceReverse);
  });

  it("is invariant to labels and unrelated prose because neither enters production inputs", () => {
    const first = planWeeklyIntent(productionPlannerInput());
    const athlete = productionPlannerInput().athlete;
    const second = planWeeklyIntent({ ...productionPlannerInput(), athlete: { ...athlete,
      label: "Presentation-only label mutation", preferences: { ...athlete.preferences,
        notes: ["Inert explanation prose"] } } });
    expect(first.weeklyIntent?.objectives).toEqual(second.weeklyIntent?.objectives);
    expect(first.weeklyIntent?.intentRevisionId).toBe(second.weeklyIntent?.intentRevisionId);
  });

  it("responds materially to opportunity count, equipment, and actual-day facts at rightful owners", () => {
    const three = productionWeekPlan();
    const oneSource = productionSourceSnapshot([productionOpportunity({ index: 0 })]);
    const oneIntent = planWeeklyIntent(productionPlannerInput({ source: oneSource })).weeklyIntent!;
    const one = composeWeekAllocation(productionComposerInput({ source: oneSource, intent: oneIntent }));
    expect(three.reservations.length).not.toBe(one.reservations.length);
    const materialInput = productionMaterializationInput(three);
    expect(materializeSessionAllocation({ ...materialInput, actualCurrentStructuralCapacity: "condensed" }).status)
      .toBe("requires_week_reallocation");
  });
});
