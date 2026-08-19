import { describe, expect, it } from "vitest";
import { buildPrescriptionPolicyV1AdmissionReport } from "../cagt/prescriptionPolicyV1OwnerAdmission";

describe("CAGT Prescription Policy V1 full-session admission", () => {
  it("preserves source, revision, assignment and complete-session purpose truth", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.holdout.compiledFullSessionCount).toBe(129);
    expect(report.causal).toEqual({
      underAdaptationCount: 0,
      overAdaptationCount: 0,
      wrongLayerEffectCount: 0,
      downstreamRescueAttemptCount: 12,
      acceptedDownstreamRescueCount: 0,
      sourceEventDuplicationCount: 0,
      revisionErrorCount: 0,
      preparatoryMiscreditCount: 0,
      substitutionDoubleCount: 0,
      orphanPreparationCount: 0,
      missingRequiredPreparationCount: 0,
      mainPurposeLossCount: 0,
      accessoryPurposeLossCount: 0,
      policyCreatedAssignmentCount: 0,
      ignoredRequiredModificationCount: 0,
      actualAsPlanAssumptionCount: 0,
      fakeDurationFindingCount: 0,
      candidateIdentityLeakCount: 0,
      validationErrorCount: 0,
    });
  }, 60_000);

  it("keeps supporting work subordinate and block structure bounded", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.coherence.warmupActivationCompleteSessionResult).toBe("PASS_BOUNDED_AND_SUBORDINATE");
    expect(report.coherence.supportingWorkOverwhelmCount).toBe(0);
    expect(report.coherence.sameRepResult).toBe("PASS_LEGAL_CONVERGENCE_PRESERVED");
    expect(report.coherence.sameTempoResult).toBe("PASS_LEGAL_CONVERGENCE_PRESERVED");
    expect(report.coherence.rampUpCounts.zero).toBeGreaterThan(0);
    expect(report.coherence.rampUpCounts.one).toBeGreaterThan(0);
    expect(report.coherence.rampUpCounts.two).toBeGreaterThan(0);
    expect(report.coherence.backoffBlockCount).toBe(0);
    expect(report.h1h2).toEqual({
      h1: "MUSCLE_H1_SINGLE_FLEXIBLE",
      h2: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE",
    });
    expect(report.spacing).toBe("PRESCRIPTION_AND_RESPONSE_DEPENDENT");
  }, 60_000);
});
