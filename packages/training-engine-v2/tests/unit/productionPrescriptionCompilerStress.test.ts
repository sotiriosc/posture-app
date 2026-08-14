import { describe, expect, it } from "vitest";
import { runProductionPrescriptionCompilerStress } from "../helpers/productionPrescriptionCompilerReport";

describe("production Prescription Compiler deterministic stress", () => {
  it("passes assignment, session, revision, performance, and repeat stress", () => {
    const report = runProductionPrescriptionCompilerStress();
    expect(report.assignmentCompilationCount).toBeGreaterThanOrEqual(10_000);
    expect(report.completeSessionCompilationCount).toBeGreaterThanOrEqual(1_000);
    expect(report.revisionChainCount).toBeGreaterThanOrEqual(1_000);
    expect(report.performanceLinkageValidationCount).toBeGreaterThanOrEqual(1_000);
    expect(report.assignmentFailureCount).toBe(0);
    expect(report.completeSessionStructuralFailureCount).toBe(0);
    expect(report.revisionChainFailureCount).toBe(0);
    expect(report.performanceLinkageFailureCount).toBe(0);
    expect(report.deterministicMismatchCount).toBe(0);
    expect(report.automaticProgressionCount).toBe(0);
    expect(report.fakeDurationCount).toBe(0);
    expect(report.sourceEventDuplicationCount).toBe(0);
    expect(report.policyCreatedAssignmentCount).toBe(0);
    expect(report.policyRemovedAssignmentCount).toBe(0);
    expect(report.substitutionCount).toBe(0);
    expect(report.multiBlockFlatteningCount).toBe(0);
    expect(report.result).toBe("DETERMINISTIC_STRESS_PASSED");
  }, 30_000);
});
