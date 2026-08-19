import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  NO_PAIN_OR_INJURY,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRequest,
} from "../../src";
import {
  MODERATE_PAIN_CALIBRATION_POLICIES,
  buildModeratePainCalibrationData,
  renderModeratePainCalibrationDecision,
} from "../helpers/moderatePainCalibrationLab";

const data = buildModeratePainCalibrationData();

describe("moderate-pain human calibration laboratory", () => {
  it("covers every required policy, scenario, severity, response, and candidate", () => {
    expect(data.productionCaseCount).toBe(60);
    expect(data.policies).toHaveLength(9);
    expect(data.matrix).toHaveLength(1512);
    expect(data.scenarios.map((scenario) => ({
      id: scenario.id,
      candidates: scenario.exerciseIds,
    }))).toEqual([
      {
        id: "shoulder-horizontal-push",
        candidates: ["push-up", "dumbbell-bench-press", "machine-chest-press"],
      },
      {
        id: "low-back-hinge",
        candidates: ["dumbbell-romanian-deadlift", "cable-pull-through"],
      },
      {
        id: "low-back-horizontal-row",
        candidates: [
          "machine-row",
          "seated-cable-row",
          "chest-supported-dumbbell-row",
          "one-arm-dumbbell-row",
        ],
      },
      {
        id: "knee-squat",
        candidates: ["goblet-squat", "leg-press", "bodyweight-box-squat"],
      },
      {
        id: "single-leg",
        candidates: ["split-squat", "step-up"],
      },
    ]);

    for (const policy of MODERATE_PAIN_CALIBRATION_POLICIES) {
      expect(data.matrix.filter((row) => row.policyId === policy.id)).toHaveLength(168);
    }
    expect(new Set(data.matrix.map((row) => row.severity))).toEqual(new Set([3, 4, 5, 6]));
    expect(new Set(data.matrix.map((row) => row.requiredResponse))).toEqual(
      new Set(["avoid_aggravator", "reduce_load_and_range", "substitute_role"]),
    );
  });

  it("keeps the current flat policy and response-led flat policy numerically identical to production", () => {
    expect(data.productionParityViolations).toEqual([]);

    const responseLedRows = data.matrix.filter(
      (row) => row.policyId === "D_RESPONSE_LED_FLAT",
    );
    expect(responseLedRows.every((row) =>
      row.total === row.baselineTotal &&
      row.rank === row.baselineRank &&
      row.painSuitabilityRaw === row.baselinePainSuitabilityRaw
    )).toBe(true);
  });

  it("applies severity once per matched signal instead of once per stress fact", () => {
    expect(data.signalCountingProof).toEqual({
      scenario: "Low-Back Hinge",
      candidateId: "dumbbell-romanian-deadlift",
      severity: 6,
      policyId: "B_UPPER_100",
      canonicalOverlapUnits: 1,
      matchedSignalCount: 1,
      preferredSignalLevelAdjustment: 1,
      badPerTagAdjustment: 1,
    });

    const cable = data.matrix.find((row) =>
      row.policyId === "B_UPPER_100" &&
      row.scenarioId === "low-back-hinge" &&
      row.candidateId === "cable-pull-through" &&
      row.severity === 6 &&
      row.requiredResponse === "avoid_aggravator"
    );
    expect(cable).toEqual(expect.objectContaining({
      painSuitabilityOverlapUnits: 1,
      matchedModerateSignalCount: 1,
      signalLevelSeverityAdjustment: 1,
      badPerTagSeverityAdjustment: 1,
    }));
  });

  it("keeps joint cost identical across severity 3 through 6 for every policy", () => {
    expect(data.jointCostInvariantViolations).toEqual([]);

    const rdlRows = data.matrix.filter((row) =>
      row.policyId === "C_UPPER_WEIGHTED" &&
      row.scenarioId === "low-back-hinge" &&
      row.candidateId === "dumbbell-romanian-deadlift" &&
      row.requiredResponse === "avoid_aggravator"
    );
    expect(new Set(rdlRows.map((row) => row.jointCostRaw))).toEqual(new Set([7.05]));
    expect(new Set(rdlRows.map((row) => row.jointCostWeightedContribution))).toEqual(
      new Set([0.371053]),
    );
    expect(new Set(rdlRows.map((row) => row.aggregateTotalWeight))).toEqual(new Set([15.2]));
  });

  it("keeps required response out of numeric scoring and exposes its distinct owner", () => {
    expect(data.applicableReadinessByResponse).toEqual({
      avoid_aggravator: "REQUIRES_CANDIDATE_REVIEW",
      reduce_load_and_range: "REQUIRES_PRESCRIPTION",
      substitute_role: "REQUIRES_SESSION_ROLE_SUBSTITUTION",
    });

    const sameNumericCase = data.matrix.filter((row) =>
      row.policyId === "B_UPPER_050" &&
      row.scenarioId === "shoulder-horizontal-push" &&
      row.candidateId === "push-up" &&
      row.severity === 6
    );
    expect(new Set(sameNumericCase.map((row) => row.total))).toHaveLength(1);
    expect(new Set(sameNumericCase.map((row) => row.painSuitabilityRaw))).toHaveLength(1);
    expect(sameNumericCase.map((row) => row.responseOwner)).toEqual([
      "candidate_review",
      "prescription",
      "session_intent_or_session_composer",
    ]);
  });

  it("makes substitute-role non-executability visible without substituting the role", () => {
    expect(data.resultTraceExposesSubstituteRole).toBe(true);
    const substituteRows = data.matrix.filter(
      (row) => row.requiredResponse === "substitute_role",
    );
    expect(substituteRows.filter(
      (row) => row.responseExecutionStatus !== "not_applicable_no_candidate_stress_match",
    ).every(
      (row) => row.candidateReadiness === "REQUIRES_SESSION_ROLE_SUBSTITUTION",
    )).toBe(true);
    expect(substituteRows.filter(
      (row) => row.responseExecutionStatus === "not_applicable_no_candidate_stress_match",
    ).every(
      (row) => row.candidateReadiness === "EXECUTABLE_AT_CANDIDATE_SCOPE",
    )).toBe(true);
    expect(substituteRows.every(
      (row) => row.responseOwner === "session_intent_or_session_composer",
    )).toBe(true);
    expect(new Set(substituteRows.map((row) => row.candidateId))).toEqual(
      new Set(data.scenarios.flatMap((scenario) => scenario.exerciseIds)),
    );
  });

  it("records the exact candidate-aware readiness reclassification", () => {
    expect(data.readinessCorrections).toEqual([
      {
        requiredResponse: "avoid_aggravator",
        before: "REQUIRES_CANDIDATE_REVIEW",
        after: "EXECUTABLE_AT_CANDIDATE_SCOPE",
        scenarioIds: ["low-back-horizontal-row"],
        candidateIds: [
          "chest-supported-dumbbell-row",
          "machine-row",
          "one-arm-dumbbell-row",
          "seated-cable-row",
        ],
        candidateMatrixRowsChanged: 144,
        selectedProductionCasesChanged: 0,
        selectedMatrixCellsChanged: 0,
      },
      {
        requiredResponse: "reduce_load_and_range",
        before: "REQUIRES_PRESCRIPTION",
        after: "EXECUTABLE_AT_CANDIDATE_SCOPE",
        scenarioIds: ["low-back-horizontal-row"],
        candidateIds: [
          "chest-supported-dumbbell-row",
          "machine-row",
          "one-arm-dumbbell-row",
          "seated-cable-row",
        ],
        candidateMatrixRowsChanged: 144,
        selectedProductionCasesChanged: 0,
        selectedMatrixCellsChanged: 0,
      },
      {
        requiredResponse: "substitute_role",
        before: "REQUIRES_SESSION_ROLE_SUBSTITUTION",
        after: "EXECUTABLE_AT_CANDIDATE_SCOPE",
        scenarioIds: ["low-back-horizontal-row"],
        candidateIds: [
          "chest-supported-dumbbell-row",
          "machine-row",
          "one-arm-dumbbell-row",
          "seated-cable-row",
        ],
        candidateMatrixRowsChanged: 144,
        selectedProductionCasesChanged: 0,
        selectedMatrixCellsChanged: 0,
      },
    ]);

    const selectedRows = data.matrix.filter(
      (row) =>
        row.scenarioId === "low-back-horizontal-row" &&
        row.selectedCandidateId === "machine-row",
    );
    expect(selectedRows.every(
      (row) => row.selectedCandidatePainReadiness === "EXECUTABLE_AT_CANDIDATE_SCOPE",
    )).toBe(true);
  });

  it("does not turn moderate severity 5 or 6 into hard rejection", () => {
    expect(data.matrix.every((row) => row.outcome === "legal")).toBe(true);
    expect(data.matrix.every((row) => row.rejectionCodes.length === 0)).toBe(true);
    expect(data.matrix.filter((row) => row.severity >= 5)).not.toHaveLength(0);
  });

  it("keeps the response-led policy flat while exposing non-hard review urgency", () => {
    const lower = data.matrix.find((row) =>
      row.policyId === "D_RESPONSE_LED_FLAT" &&
      row.scenarioId === "single-leg" &&
      row.candidateId === "split-squat" &&
      row.severity === 4 &&
      row.requiredResponse === "avoid_aggravator"
    );
    const upper = data.matrix.find((row) =>
      row.policyId === "D_RESPONSE_LED_FLAT" &&
      row.scenarioId === "single-leg" &&
      row.candidateId === "split-squat" &&
      row.severity === 5 &&
      row.requiredResponse === "avoid_aggravator"
    );

    expect(lower).toEqual(expect.objectContaining({
      signalLevelSeverityAdjustment: 0,
      reviewUrgency: "standard_moderate_review",
    }));
    expect(upper).toEqual(expect.objectContaining({
      signalLevelSeverityAdjustment: 0,
      reviewUrgency: "elevated_moderate_review_non_hard",
    }));
    expect(upper?.painSuitabilityRaw).toBe(lower?.painSuitabilityRaw);
    expect(upper?.jointCostRaw).toBe(lower?.jointCostRaw);
    expect(upper?.total).toBe(lower?.total);
  });

  it("reports no manufactured rank threshold and records the response-led owner decision", () => {
    expect(data.matrix.filter(
      (row) => row.rankDeltaFromFlat !== null && row.rankDeltaFromFlat !== 0,
    )).toEqual([]);
    expect(data.winnerChanges).toEqual([]);
    expect(data.policySummaries.every((summary) => summary.rankChanges === 0)).toBe(true);
    expect(data.policySummaries.every((summary) => summary.winnerChanges === 0)).toBe(true);
    expect(data.classification).toBe(
      "RESPONSE_LED_FLAT_POLICY_ADOPTED_NUMERIC_CALIBRATION_DEFERRED",
    );

    const report = renderModeratePainCalibrationDecision(data);
    expect(report).toContain("No policy produced a meaningful winner change");
    expect(report).toContain("Recommended production coefficient range: **none supported by this laboratory**");
    expect(report).toContain("MODERATE_PAIN_CANDIDATE_POLICY: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**");
    expect(report).toContain("session feedback\n  -> longitudinal adaptation\n  -> next prescription/progression decision");
    expect(report.match(/^\| [3-6] \|/gm)?.length).toBe(1512);
    expect(readFileSync(
      new URL(
        "../../../../docs/training-engine-v2/MODERATE_PAIN_CALIBRATION_DECISION.md",
        import.meta.url,
      ),
      "utf8",
    )).toBe(report);
  });

  it("reserves urgent external review for explicit acute urgency", () => {
    const scenario = getControlledCandidateScenario("horizontal-pull-gym-neutral");
    if (!scenario) {
      throw new Error("Missing horizontal-pull-gym-neutral scenario.");
    }
    const request: CandidateRequest = {
      ...scenario.request,
      id: "moderate-calibration-explicit-urgent-review-probe",
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "explicit-urgent-review",
          region: "knee",
          severity0To10: 7,
          stressTags: [],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: true,
          description: "Explicit urgent-review observability probe.",
        }],
      },
    };
    const result = runCandidateRankingLab(request);

    expect(result.painExecutionReadiness.selectedCandidatePainReadiness).toBe(
      "URGENT_EXTERNAL_REVIEW",
    );
    expect(result.painExecutionReadiness.urgentReviewSignalIds).toEqual([
      "explicit-urgent-review",
    ]);
    expect(result.rankedCandidates.length).toBeGreaterThan(0);
  });
});
