import { describe, expect, it } from "vitest";
import {
  REAL_USER_WEEK_VARIABLES,
  REVIEWED_POLICY_QUESTIONS,
  STANDALONE_RECOVERY_SESSION_VERDICT,
  allocationSignature,
  buildFixedShellWeekCohort,
  buildFixedSplitFailureMatrix,
  buildSearchArchitectureComparison,
  runControlledWeekScenarios,
  runWeeklyPolicyConsequenceLab,
  weeklyIntentSignature,
} from "../helpers/weekComposerDesignLab";

describe("Week design personalization, contrast, and policy boundaries", () => {
  it("covers the 18-user fixed shell and 10+ same-experience/equipment regression", () => {
    const cohort = buildFixedShellWeekCohort();
    expect(cohort).toHaveLength(18);
    const firstTwelveIntentSignatures = new Set(cohort.slice(0, 12).map((entry) => JSON.stringify(weeklyIntentSignature(entry.intent))));
    const firstTwelveAllocationSignatures = new Set(cohort.slice(0, 12).map((entry) => JSON.stringify(allocationSignature(entry.plan))));
    expect(firstTwelveIntentSignatures.size).toBeGreaterThan(4);
    expect(firstTwelveAllocationSignatures.size).toBeGreaterThan(4);
    expect(cohort.some((entry) => entry.classification === "UNRESPONSIVE_TO_MATERIAL_INPUT")).toBe(false);
    expect(cohort.some((entry) => entry.classification === "WRONG_LAYER_EFFECT")).toBe(false);
  });

  it("separates Week intent, allocation, materialization, and downstream-only changes", () => {
    const cohort = buildFixedShellWeekCohort();
    expect(cohort.find((entry) => entry.id === "direct-calf")?.classification).toBe("MATERIAL_WEEK_INTENT_DIFFERENCE");
    expect(cohort.find((entry) => entry.id === "productive-continuity")?.classification).toBe("MATERIAL_ALLOCATION_DIFFERENCE");
    expect(cohort.find((entry) => entry.id === "travel-equipment-change")?.materializationStatus).toBe("requires_week_reallocation");
    expect(cohort.find((entry) => entry.id === "high-external-sport-load")?.intent.status).toBe("unsupported_context");
    expect(cohort.find((entry) => entry.id === "irrelevant-pain")?.classification).toBe("JUSTIFIED_CONVERGENCE");
  });

  it("shows fixed-split and greedy baseline failures without productionizing templates", () => {
    const matrix = buildFixedSplitFailureMatrix(runControlledWeekScenarios());
    expect(matrix.length).toBeGreaterThanOrEqual(60);
    const failures = new Set(matrix.flatMap((entry) => entry.failureCodes));
    expect(failures).toContain("split_label_caused_allocation");
    expect(failures).toContain("assessment_repeated_every_opportunity");
    expect(failures).toContain("optional_objective_repeated_without_unique_value");
    expect(failures).toContain("recovery_and_distribution_ignored");
  });

  it("recommends lexicographic complete-plan choice and Pareto pruning, never weights", () => {
    const comparison = buildSearchArchitectureComparison();
    expect(comparison.recommendation).toContain("strict_lexicographic");
    expect(comparison.pareto.classification).toBe("DESIGN_READY");
    expect(comparison.weightedContrast.classification).toBe("OWNER_POLICY_REQUIRED");
    expect(comparison.productionBounds).toBe("UNAPPROVED");
  });

  it("exposes policy consequences without selecting production numbers", () => {
    const rows = runWeeklyPolicyConsequenceLab();
    expect(rows).toHaveLength(7);
    expect(rows.every((entry) => entry.productionDecision === "NOT_SELECTED")).toBe(true);
    expect(rows.map((entry) => entry.id)).toContain("direct-vs-secondary-development");
    expect(rows.map((entry) => entry.id)).toContain("constrained-vs-expanded");
  });

  it("classifies real-user variables only where a legitimate receiver exists", () => {
    expect(REAL_USER_WEEK_VARIABLES.length).toBeGreaterThanOrEqual(30);
    expect(REAL_USER_WEEK_VARIABLES).toContainEqual(["illness", "Safety/Clinical"]);
    expect(REAL_USER_WEEK_VARIABLES).toContainEqual(["poor sleep", "Requires Future Typed Contract"]);
    expect(REAL_USER_WEEK_VARIABLES).toContainEqual(["productive session structure", "Week Allocation Composer"]);
    expect(REAL_USER_WEEK_VARIABLES).toContainEqual(["deload need", "Longitudinal Adaptation"]);
  });

  it("leaves scientific questions and standalone recovery explicitly unresolved", () => {
    expect(REVIEWED_POLICY_QUESTIONS).toHaveLength(6);
    expect(REVIEWED_POLICY_QUESTIONS.every((entry) => entry.status !== undefined)).toBe(true);
    expect(STANDALONE_RECOVERY_SESSION_VERDICT).toBe("KEEP_DEFERRED");
  });

  it("passes anti-bloat invariants across controlled allocations", () => {
    const scenarios = runControlledWeekScenarios().filter((entry) => entry.plan);
    expect(scenarios.every((entry) => entry.plan!.reservations.length <= entry.horizon.opportunities.length)).toBe(true);
    expect(scenarios.every((entry) => entry.plan!.reservations.every((reservation) => reservation.allocatedObjectives.length > 0))).toBe(true);
    expect(scenarios.find((entry) => entry.id === "assessment-priority")?.plan?.reservations
      .flatMap((entry) => entry.allocatedObjectives).filter((entry) => entry.purpose === "activation")).toHaveLength(1);
    expect(scenarios.find((entry) => entry.id === "direct-calf")?.plan?.reservations
      .flatMap((entry) => entry.allocatedObjectives).filter((entry) => entry.weeklyObjectiveId === "weekly-objective:calf")).toHaveLength(1);
  });
});
