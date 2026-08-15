import { describe, expect, it } from "vitest";
import { runProductionLongitudinalStress } from "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal deterministic stress", () => {
  it("passes all deterministic and specialized minimum counts", () => {
    const result = runProductionLongitudinalStress();
    expect(result.deterministicEvaluationCount).toBeGreaterThanOrEqual(10_000);
    for (const count of [result.sourceValidationCount, result.sourceRevisionChainCount,
      result.completedLedgerValidationCount, result.blockPerformanceValidationCount,
      result.evidenceWindowEvaluationCount, result.applicabilityClassificationCount,
      result.repeatedEvidenceEvaluationCount, result.progressionAxisCandidateEvaluationCount,
      result.regressionAxisCandidateEvaluationCount, result.replacementReexposureEvaluationCount,
      result.rotationReviewEvaluationCount, result.applicationPersistenceValidationCount,
      result.stateRevisionChainCount, result.decisionRevisionChainCount, result.noRescueMutationCount]) {
      expect(count).toBeGreaterThanOrEqual(1_000);
    }
    expect(result).toMatchObject({ deterministicMismatchCount: 0, resultValidationFailureCount: 0,
      sourceValidationFailureCount: 0, sourceRevisionValidationFailureCount: 0,
      acceptedDownstreamRescueCount: 0, hiddenClockReadCount: 0, randomOutputCount: 0,
      failureCount: 0, result: "PRODUCTION_LONGITUDINAL_ADAPTATION_DETERMINISTIC_STRESS_PASS" });
  });
});
