import { describe, expect, it } from "vitest";
import { computeCagtFingerprints, EXPECTED_CAGT_FINGERPRINTS } from "../cagt/report";
import { runWeekPolicyV1Admission, runWeekPolicyV1Stress } from "../cagt/weekPolicyV1Admission";
import { WEEK_POLICY_V1_OWNER_SELECTION, WEEK_POLICY_V1_STATE } from "../cagt/weekPolicyV1Contracts";
import {
  EXPECTED_WEEK_POLICY_V1_FINGERPRINTS, FROZEN_PRODUCTION_FINGERPRINTS,
  computeWeekPolicyV1Fingerprints,
} from "../cagt/weekPolicyV1Report";
import {
  EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS, computeWeekPolicyTournamentFingerprints,
} from "../cagt/weekPolicyTournamentReport";

describe("CAGT Week Policy V1 owner admission", () => {
  it("freezes the exact owner-selected causal core without production activation", () => {
    expect(WEEK_POLICY_V1_OWNER_SELECTION).toEqual(expect.objectContaining({
      candidateId: "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE", status: WEEK_POLICY_V1_STATE,
      strength: expect.objectContaining({ required: [1, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
      muscle: expect.objectContaining({ candidate: "MUSCLE_H1_SINGLE_FLEXIBLE", required: [1, 1, 2] }),
      direct: expect.objectContaining({ candidate: "DIRECT_D1_ONCE", required: [1, 1, 1] }),
      assessment: expect.objectContaining({ candidate: "ASSESSMENT_A1_SINGLE_CLUSTER", required: [1, 1, 1] }),
      capacity: expect.objectContaining({ candidate: "CAPACITY_C1_ONCE", required: [1, 1, 1] }),
      participation: "PARTICIPATION_P0_NONE", spacing: "SPACING_R0_PRESCRIPTION_PENDING",
      productionActivation: false,
    }));
    expect(WEEK_POLICY_V1_OWNER_SELECTION.deferred).toEqual([
      "H2_DEFERRED_PENDING_PRESCRIPTION_DISTRIBUTION_EVIDENCE",
      "D2_DEFERRED_NO_UNIQUE_EXECUTABLE_VALUE",
      "C2_DEFERRED_NO_UNIQUE_REPEAT_VALUE",
    ]);
  });

  it("admits the covered core only and preserves owner-visible scope gaps", () => {
    const result = runWeekPolicyV1Admission();
    expect(result.classification).toBe("WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS");
    expect(result).toEqual(expect.objectContaining({ calibrationPassed: true, holdoutPassed: true,
      hardCagtFailures: 0, underAdaptation: 0, overAdaptation: 0, downstreamRescueAttempts: 0,
      firstSessionCanaryPassed: true, allSessionHorizonPassed: true,
      productionActivation: false, productionBehaviorChanged: false }));
    expect(result.scopeCoverage.filter((entry) => entry.status === "unresolved")).toHaveLength(8);
    expect(result.scopeGapResults.every((entry) => entry.status === "WEEKLY_POLICY_REQUIRED")).toBe(true);
  });

  it("freezes V1 admission separately while preserving CAGT and numeric tournament fingerprints", () => {
    expect(computeWeekPolicyV1Fingerprints()).toEqual(EXPECTED_WEEK_POLICY_V1_FINGERPRINTS);
    expect(computeCagtFingerprints()).toEqual(EXPECTED_CAGT_FINGERPRINTS);
    expect(computeWeekPolicyTournamentFingerprints()).toEqual(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS);
    expect(FROZEN_PRODUCTION_FINGERPRINTS.cagtCore).toBe(EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool);
    expect(FROZEN_PRODUCTION_FINGERPRINTS.numericPolicyTournament)
      .toBe(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS.combinedNumericPolicyTournament);
  }, 30_000);

  it("runs the fixed-seed V1 metamorphic stress floor", () => {
    const stress = runWeekPolicyV1Stress();
    expect(stress.cases).toBe(10_000);
    expect(stress.completePipelines).toBeGreaterThanOrEqual(1_000);
    expect(stress.failures).toEqual([]);
    expect(stress.digest).toBe(stress.repeatedRunDigest);
    expect(stress).toEqual(expect.objectContaining({ objectiveOrderPermutationStable: true,
      opportunityOrderPermutationStable: true, assessmentSignalPermutationStable: true,
      candidateOrderPermutationStable: true, catalogOrderPermutationStable: true,
      evidenceOrderPermutationStable: true, proseMutationInert: true, labelMutationInert: true,
      equivalentSignalDeduplicationStable: true, stalePreparationMutationRejected: true,
      orphanActivationMutationRejected: true, condensedRequiredPreparationPreserved: true,
      mainCandidateReplacementRevalidated: true, repeatedRunDeterministic: true,
      shadowDiagnosticsUnscored: true, productionActivation: false }));
  }, 30_000);
});
