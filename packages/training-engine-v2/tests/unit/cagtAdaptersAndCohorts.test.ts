import { describe, expect, it } from "vitest";
import { buildFourDayFrameworkCohort } from "../cagt/cohorts";
import { runCagtHumanLikeChains } from "../cagt/humanChains";
import { runCagtProductHorizonAdapter } from "../cagt/horizonAdapter";
import { runCagtWeekPolicyCalibration } from "../cagt/policyAdapter";
import { buildCagtDuplicationBaseline, buildCagtReportData } from "../cagt/report";

describe("CAGT cohorts and adapters", () => {
  it("allows a shared four-day framework while adaptive content remains independently visible", () => {
    const cohort = buildFourDayFrameworkCohort();
    expect(cohort).toHaveLength(10);
    expect(cohort.every((entry) => entry.confirmedOpportunities === 4)).toBe(true);
    expect(new Set(cohort.map((entry) => JSON.stringify(entry.framework))).size).toBeLessThan(cohort.length);
    expect(new Set(cohort.map((entry) => entry.adaptiveSignature)).size).toBeGreaterThan(1);
  });

  it("reports duplication semantically instead of imposing diversity quotas", () => {
    const baseline = buildCagtDuplicationBaseline();
    expect(baseline.frameworkRecurrence).toBeGreaterThan(0);
    expect(baseline.classifications).toContain("PRODUCTIVE_STABILITY");
    expect(baseline.repRecurrence).toBeNull();
  });

  it("wraps all nine policy candidates and thirteen consequences without selecting values", () => {
    const result = runCagtWeekPolicyCalibration();
    expect(result).toMatchObject({ candidateCount: 9, consequenceCount: 13, numericPolicyActivated: false });
    expect(result.candidates.every((entry) => entry.productionDecision === "NOT_SELECTED_FOR_PRODUCTION")).toBe(true);
  });

  it("gates Product Horizon facts without creating programming effects", () => {
    expect(runCagtProductHorizonAdapter()).toEqual(expect.objectContaining({ adapterStatus: "DESIGN_EVIDENCE_PASS",
      scenarioCount: 23, failures: [], wrongLayerEffects: 0, calendarCreatesResponsibility: false,
      profileDefaultConfirmedAutomatically: false, equipmentChangesGoals: false, completedHistoryRewritten: false,
      identicalCurrentFactsConverge: true, factualDimensionsOnly: true }));
  });

  it("keeps human-like chains within implemented authority", () => {
    const chains = runCagtHumanLikeChains();
    expect(chains).toHaveLength(6);
    expect(chains.some((entry) => entry.result === "PASS_WITH_EXPECTED_CONVERGENCE")).toBe(true);
    expect(JSON.stringify(chains)).not.toContain("PRESCRIPTION_PASS");
  });

  it("exposes first meaningful differences and observed-only collision metrics", () => {
    const report = buildCagtReportData({ stressCases: 100, pipelineCases: 50 });
    expect(report.classification).toBe("CAGT_READY_FOR_POLICY_ADMISSION_USE");
    expect(report.firstMeaningfulDifferences).toHaveLength(32);
    expect(report.observedMetrics).toContain("same_rep_placeholder_rate");
    expect(report.noRescue.downstreamDifferencesScored).toBe(false);
  }, 60_000);
});
