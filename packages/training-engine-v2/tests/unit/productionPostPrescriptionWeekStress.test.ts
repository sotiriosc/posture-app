import { describe, expect, it } from "vitest";
import { runProductionPostPrescriptionWeekDeterministicStress } from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week deterministic stress", () => {
  it("passes the complete minimum stress matrix", () => {
    expect(runProductionPostPrescriptionWeekDeterministicStress(1_000)).toMatchObject({
      deterministicValidationComparisonCount: 10_000,
      genuineCompletePrescribedWeekValidationCount: 1_000,
      sourceLedgerIntegrityValidationCount: 1_000,
      objectiveRealizationComparisonCount: 1_000,
      validationRevisionChainCount: 1_000,
      h1H2EvidenceComparisonCount: 1_000,
      spacingValidationCount: 1_000,
      exerciseIdentityCount: 45,
      doseModeCount: 7,
      sessionSectionCount: 5,
      designHoldoutScenarioCount: 160,
      deterministicMismatchCount: 0,
      validationFailureCount: 0,
      ledgerFailureCount: 0,
      objectiveFailureCount: 0,
      revisionChainFailureCount: 0,
      spacingFailureCount: 0,
      hiddenClockCount: 0,
      productionRandomnessCount: 0,
      result: "DETERMINISTIC_PRODUCTION_POST_PRESCRIPTION_WEEK_STRESS_PASSED",
    });
  }, 90_000);
});
