import { describe, expect, it } from "vitest";
import {
  PRODUCTION_WEEK_POLICY_V1,
  adaptDesignWeekAllocationPlan,
  adaptDesignWeekPlanningHorizon,
  adaptDesignWeeklyIntent,
  validateProductionWeekAllocationPlan,
} from "../../src";
import {
  allocationInput,
  designWeekAllocation,
  designWeeklyIntent,
  weeklyIntentInput,
} from "../helpers/weekComposerDesignLab";
import {
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_FINGERPRINT,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST,
  runProductionWeekGoldenEvidence,
  runProductionWeekHoldout,
} from "../cagt/productionWeekEvidence";

describe("production Week locked holdout and golden evidence", () => {
  it("freezes 300 scenarios before execution with the required overlapping cohorts", () => {
    expect(PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST).toMatchObject({
      frozenBeforeExecution: true,
      scenarioCount: 300,
      plannerComposerScenarioCount: 220,
      materializationScenarioCount: 120,
      reallocationScenarioCount: 60,
    });
    expect(PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_FINGERPRINT).toHaveLength(64);
  });

  it("passes the independently frozen holdout without post-inspection tuning", () => {
    const result = runProductionWeekHoldout();
    expect(result.failures).toEqual([]);
    expect(result).toMatchObject({ scenarioCount: 300, oneThroughSixOpportunityCoverage: true,
      familyCoverage: true, priorityCoverage: true, equipmentCoverage: true,
      structuralCapacityCoverage: true, goalCoverage: true, phaseCoverage: true });
    expect(result.genuinePlannerComposerScenarios).toBeGreaterThanOrEqual(220);
    expect(result.materializationScenarios).toBeGreaterThanOrEqual(100);
    expect(result.reallocationScenarios).toBeGreaterThanOrEqual(60);
    expect(result.blockedSafetyScenarios).toBeGreaterThan(0);
    expect(result.unsupportedScopeScenarios).toBeGreaterThan(0);
    expect(result.irregularCycleScenarios).toBeGreaterThan(0);
    expect(result.relevantPainScenarios).toBeGreaterThan(0);
    expect(result.justifiedConvergenceScenarios).toBeGreaterThan(0);
  });

  it("preserves frozen Week, Product Horizon, policy, session, and Gate 13 semantics", () => {
    expect(runProductionWeekGoldenEvidence()).toMatchObject({
      historicalWeekScenarioCount: 19,
      historicalProductHorizonScenarioCount: 23,
      weekPolicyV1HoldoutCount: 40,
      completeAdmissionPipelineCount: 95,
      coherentSessionProgramScenarioCount: 38,
      materializedDirective: true,
      gate13ProjectionCompatible: true,
      expectedRepresentationChangesOnly: true,
      unexplainedSemanticDifferences: [],
    });
  });

  it("runs historical design facts through explicit adapters without an unexplained semantic change", () => {
    const designInput = weeklyIntentInput();
    const historicalIntent = designWeeklyIntent(designInput).weeklyIntent!;
    const historicalPlan = designWeekAllocation(allocationInput({ intent: historicalIntent,
      horizon: designInput.planningHorizon }));
    const source = adaptDesignWeekPlanningHorizon({ horizon: designInput.planningHorizon,
      confirmationByOpportunityId: Object.fromEntries(designInput.planningHorizon.opportunities.map((entry) =>
        [entry.id, "user_confirmed"])), horizonLineageAttemptId: "historical-golden-adapter" });
    expect(source.status).toBe("source_snapshot_built");
    const intent = adaptDesignWeeklyIntent({ intent: historicalIntent, sourceSnapshot: source.snapshot!,
      policy: PRODUCTION_WEEK_POLICY_V1, outcomeGoalLineageId: "historical-golden-goal",
      intentAttemptId: "historical-golden-intent" });
    expect(intent.status).toBe("adapted");
    const plan = adaptDesignWeekAllocationPlan({ designPlan: historicalPlan, intent: intent.intent!,
      sourceSnapshot: source.snapshot!, allocationAttemptId: "historical-golden-allocation" });
    expect(validateProductionWeekAllocationPlan(plan)).toEqual([]);
    expect(plan.reservations).toHaveLength(historicalPlan.reservations.length);
    expect(plan.objectiveAllocationTraces).toEqual(historicalPlan.objectiveAllocationTraces);
  });
});
