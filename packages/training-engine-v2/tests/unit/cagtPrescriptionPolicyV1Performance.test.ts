import { describe, expect, it } from "vitest";
import { buildPrescriptionPolicyV1AdmissionReport } from "../cagt/prescriptionPolicyV1OwnerAdmission";

describe("CAGT Prescription Policy V1 performance, load and duration truth", () => {
  it("uses independent actual-performance fixtures without mutating the plan", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.performance.comparisonCount).toBe(1_452);
    expect(Object.values(report.performance.observationKinds).every((count) => count > 0)).toBe(true);
    expect(report.performance.independentActualFixtureCount).toBe(report.performance.comparisonCount);
    expect(report.performance.actualAsPlanAssumptionCount).toBe(0);
    expect(report.performance.planMutationCount).toBe(0);
    expect(report.performance.validationErrorCount).toBe(0);
    expect(report.performance.substitutionDoubleCount).toBe(0);
    expect(report.performance.noObservationPreservedCount).toBeGreaterThan(0);
  }, 60_000);

  it("retains exact load only with complete evidence and otherwise falls back", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.loadSelection.exactPriorLoadRetainedCount).toBeGreaterThan(0);
    expect(report.loadSelection.exactPriorLoadRejectedToFallbackCount).toBeGreaterThan(0);
    expect(report.loadSelection.userSelectedByEffortCount).toBeGreaterThan(0);
    expect(report.loadSelection.automaticProgressionCount).toBe(0);
  }, 60_000);

  it("keeps duration unknown under the rightful owner and preserves production fingerprints", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.duration.unknownCount).toBeGreaterThan(0);
    expect(report.duration.unknownOwners).toMatchObject({
      unknown_due_to_repetition_tempo: expect.any(Number),
      unknown_due_to_locomotor_pace: expect.any(Number),
      unknown_due_to_step_cadence: expect.any(Number),
      unknown_due_to_sequencing: expect.any(Number),
    });
    expect(report.duration.unknownClassifiedAsFitOrFailureCount).toBe(0);
    expect(report.causal.fakeDurationFindingCount).toBe(0);
    expect(report.productionFingerprints.candidateRankingMatches).toBe(true);
    expect(report.productionFingerprints.candidateComprehensiveMatches).toBe(true);
    expect(report.productionFingerprints.sessionPlannerMatches).toBe(true);
    expect(report.productionFingerprints.sessionComposerMatches).toBe(true);
    expect(report.productionFingerprints.evaluatorHardening)
      .toBe("61a01108e0a5c73b0b1fa1847c5891b43f5e8cb583ee4382fd54736a4b53e740");
  }, 60_000);
});
