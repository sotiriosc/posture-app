import { describe, expect, it } from "vitest";
import { buildFixedShellPlannerCohort, plannerInput } from "../helpers/sessionIntentPlannerProduction";
import { planAndComposeSessionSkeleton } from "../../src";

describe("Session Intent Planner personalization and integration", () => {
  it("covers the 18-user fixed shell and 10+ same-experience/equipment regression", () => {
    const cohort = buildFixedShellPlannerCohort();
    expect(cohort).toHaveLength(18);
    expect(new Set(cohort.slice(0, 12).map((row) => row.result.planning.sessionIntent?.outcomeGoal)).size).toBeGreaterThan(1);
    expect(cohort.find((row) => row.id === "no-allocation")?.result.planning.status).toBe("requires_week_or_explicit_session_allocation");
    expect(cohort.find((row) => row.id === "high-assessment")?.result.planning.sessionIntent?.needs).toHaveLength(2);
    expect(cohort.find((row) => row.id === "low-assessment")?.result.planning.sessionIntent?.needs).toHaveLength(1);
    expect(cohort.find((row) => row.id === "missed-session-context")?.result.planning.sessionIntent?.needs).toHaveLength(1);
  });

  it("runs the real Planner to Candidate to Composer production path", () => {
    const result = planAndComposeSessionSkeleton(plannerInput());
    expect(result.planning.status).toBe("planned");
    expect(result.candidateResultsByNeed).not.toBeNull();
    expect(result.skeleton?.compositionStatus).toBe("valid");
    expect(result.skeleton?.assignments.length).toBeGreaterThan(0);
    expect(result.skeleton?.assignments[0].satisfiedNeedIds.length).toBeGreaterThan(0);
  });

  it("projects continuity only onto active needs", () => {
    const cohort = buildFixedShellPlannerCohort();
    const productive = cohort.find((row) => row.id === "productive-continuity")!.result.planning;
    expect(productive.sessionIntent?.continuityEvidence.identities).toContainEqual(expect.objectContaining({
      exerciseId: "machine-row", productive: true, observationalClassification: "anchor",
    }));
    expect(productive.continuityTraces.every((trace) => trace.activeNeedIds.length > 0 || trace.disposition === "inactive_history_omitted")).toBe(true);
  });
});
