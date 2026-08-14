import { describe, expect, it } from "vitest";
import {
  EXPECTED_PRODUCTION_POST_PRESCRIPTION_WEEK_COMBINED_FINGERPRINT,
  PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
  PRODUCTION_POST_PRESCRIPTION_WEEK_UPDATED_DOCS,
  buildProductionPostPrescriptionWeekReport,
  renderProductionPostPrescriptionWeekReports,
} from "../helpers/productionPostPrescriptionWeekReport";

describe("production post-Prescription Week deterministic reports", () => {
  const report = buildProductionPostPrescriptionWeekReport();

  it("renders the complete production report and documentation surface", () => {
    const reports = renderProductionPostPrescriptionWeekReports(report);
    expect(Object.keys(reports)).toHaveLength(25);
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_UPDATED_DOCS).toHaveLength(20);
    expect(reports["PRODUCTION_POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md"])
      .toContain("PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION");
    expect(reports["PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13.md"])
      .toContain("PRODUCTION_KERNEL_AUTHORITY");
    expect(Object.values(reports).join("\n")).not.toContain("effective weekly stimulus");
  });

  it("records hard-zero production evidence and inactivity", () => {
    expect(report.golden).toMatchObject({
      scenarioCount: 160,
      cleanComparisonCount: 128,
      exactCommonSemanticMatchCount: 128,
      unexplainedSemanticDifferenceCount: 0,
      expectedEventCount: 860,
      observedEventCount: 860,
      uniqueEventCount: 860,
      cleanGate13FailureCount: 0,
    });
    expect(report.mutations).toMatchObject({ rejectedCount: 57, mutationCount: 57, nameBasedRejectionCount: 0 });
    expect(report.stress).toMatchObject({
      deterministicValidationComparisonCount: 10_000,
      deterministicMismatchCount: 0,
      revisionChainFailureCount: 0,
    });
    expect(Object.values(report.activation).every((count) => count === 0)).toBe(true);
  }, 90_000);

  it("preserves all frozen fingerprints and deterministically derives production fingerprints", () => {
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS).toMatchObject({
      candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
      productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
      productionFinalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
      postPrescriptionWeekDesign: "6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82",
      postPrescriptionWeekHoldout: "f2116ec34146fa25f1c3fa23906becc5b3d35cac8160f38124273d79ccbdf402",
    });
    expect(Object.keys(report.fingerprints)).toHaveLength(36);
    expect(report.fingerprints.combinedProductionPostPrescriptionWeekValidatorKernel).toMatch(/^[a-f0-9]{64}$/);
    expect(report.fingerprints.combinedProductionPostPrescriptionWeekValidatorKernel)
      .toBe(EXPECTED_PRODUCTION_POST_PRESCRIPTION_WEEK_COMBINED_FINGERPRINT);
    expect(buildProductionPostPrescriptionWeekReport().fingerprints).toEqual(report.fingerprints);
  });
});
