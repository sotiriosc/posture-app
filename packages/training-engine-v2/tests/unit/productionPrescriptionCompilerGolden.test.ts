import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT,
  PRESCRIPTION_POLICY_V1_RULE_MATRIX,
} from "../../src";
import {
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT as HISTORICAL_REST,
  PRESCRIPTION_POLICY_V1_RULE_MATRIX as HISTORICAL_MATRIX,
  PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER as HISTORICAL_SPECIFICITY,
} from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  buildProductionPrescriptionCompilerGoldenReport,
  buildProductionPrescriptionCompilerReadinessReport,
} from "../helpers/productionPrescriptionCompilerReport";

describe("production Prescription Compiler V1 golden migration", () => {
  it("has one byte-equivalent canonical production policy source", () => {
    expect(PRESCRIPTION_POLICY_V1_RULE_MATRIX).toEqual(HISTORICAL_MATRIX);
    expect(PRESCRIPTION_POLICY_V1_REST_PLACEMENT).toEqual(HISTORICAL_REST);
    expect(PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER).toEqual(HISTORICAL_SPECIFICITY);
  });

  it("preserves all 132 admitted outcomes with no unexplained semantic difference", () => {
    const report = buildProductionPrescriptionCompilerGoldenReport();
    expect(report.scenarioCount).toBe(132);
    expect(report.historicalCompiledScenarioCount).toBe(129);
    expect(report.productionCompiledScenarioCount).toBe(129);
    expect(report.statusEquivalenceCount).toBe(132);
    expect(report.semanticComparisonCount).toBeGreaterThan(0);
    expect(report.unexplainedDifferenceCount).toBe(0);
    expect(report.sourceEventCountDifference).toBe(0);
    expect(report.result).toBe(
      "GOLDEN_V1_EQUIVALENCE_WITH_DOCUMENTED_REPRESENTATION_CORRECTIONS",
    );
  });

  it("classifies the kernel ready while activation remains off", () => {
    const report = buildProductionPrescriptionCompilerReadinessReport();
    expect(report.classification).toBe(
      "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL_READY_FOR_FINAL_SEQUENCING_AUTHORIZATION",
    );
    expect(report.activationStatus).toBe("NOT_ACTIVATED");
    expect(report.testHelperImportCount).toBe(0);
  });
});
