import { describe, expect, it } from "vitest";
import {
  CURRENT_NUMERIC_TOURNAMENT_DISPOSITION,
  CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION,
  CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT,
  DISCLOSED_REGRESSION_COHORT_DISPOSITION,
  EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS,
  PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1,
  buildPrescriptionEvaluatorHardeningReport,
} from "../cagt/prescriptionTournamentEvaluatorHardening";

describe("CAGT Prescription evaluator validity hardening", () => {
  it("marks the prior numeric tournament as provisional without changing candidate values", () => {
    const report = buildPrescriptionEvaluatorHardeningReport();

    expect(CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT)
      .toBe("9d7366c054dd01d01de132d7c358b18d4cc506aaaea962dd48d869ea68e5ac07");
    expect(report.retainedCurrentTournamentFingerprint).toBe(CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT);
    expect(report.currentTournamentDisposition).toBe(CURRENT_NUMERIC_TOURNAMENT_DISPOSITION);
    expect(report.currentTournamentProvisionalClassification)
      .toBe(CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION);
    expect(report.currentHoldoutDisposition).toBe(DISCLOSED_REGRESSION_COHORT_DISPOSITION);
    expect(report.disclosedRegressionFingerprint)
      .toBe("ad86a6167e5811a657918b866ba660172cae1d3cae1157081b47f60a754f2c46");
    expect(report.candidateValuesUnchanged).toBe(true);
    expect(PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1.manifestFingerprint)
      .toBe("7d96a67a80ce0b6c16f40523cd6b8f2734128953e781dcfe977dd12aba4c69a8");
  }, 90_000);

  it("keeps evaluator inputs blind and withdraws owner-leading recommendations", () => {
    const report = buildPrescriptionEvaluatorHardeningReport();
    const counts = Object.groupBy(report.candidateEvidence, (entry) => entry.classification);

    expect(report.classification).toBe("PRESCRIPTION_TOURNAMENT_CAUSAL_VALIDITY_READY_FOR_OWNER_SELECTION");
    expect(report.ownerRecommendationsWithdrawn).toBe(true);
    expect(report.blindEvaluatorStatus).toBe("BLIND_SEMANTIC_EVALUATOR_ACTIVE");
    expect(report.candidateEvidence).toHaveLength(83);
    expect(report.nonDominatedCandidates).toHaveLength(64);
    expect(report.dominatedCandidates).toHaveLength(3);
    expect(counts.CAGT_REJECTED_FOR_BLOAT).toHaveLength(2);
    expect(counts.NO_POLICY_CONTROL).toHaveLength(14);
    expect(report.candidateEvidence.some((entry) =>
      String(entry.classification) === "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION")).toBe(false);

    expect(report.blindness).toEqual(expect.objectContaining({
      candidateRenameMutation: "PASS_NO_METRIC_CHANGE",
      ownerLeadingMutation: "PASS_NO_METRIC_CHANGE",
      shapeLabelMutation: "PASS_NO_METRIC_CHANGE",
      expectedRiskProseMutation: "PASS_NO_METRIC_CHANGE",
      semanticEquivalence: "PASS_EQUIVALENT_SEMANTICS_EQUIVALENT_RESULTS",
      highLabelWithMinimalValues: "EVALUATED_AS_MINIMAL_VALUES",
      balancedLabelWithStressValues: "EVALUATED_AS_STRESS_VALUES",
      evaluatorOutputIdentityLeak: "NO_IDENTITY_BEFORE_POST_EVALUATION_MAPPING",
    }));
  }, 60_000);

  it("pins the corrected evaluator hardening fingerprint", () => {
    const report = buildPrescriptionEvaluatorHardeningReport();

    expect(report.aggregateCausalSummary).toEqual({
      underAdaptationCount: 0,
      overAdaptationCount: 0,
      wrongLayerCount: 0,
      downstreamRescueCount: 0,
      sourceEventDuplicationCount: 0,
      preparatoryMiscreditCount: 0,
      performanceAssumptionCount: 0,
    });
    expect(report.fingerprints).toEqual(EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS);
  }, 60_000);
});
