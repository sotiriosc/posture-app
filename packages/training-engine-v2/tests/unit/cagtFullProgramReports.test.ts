import { describe, expect, it } from "vitest";
import {
  EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_COMBINED_FINGERPRINT,
  FULL_PROGRAM_GATE_14_UPDATED_DOCS,
  buildFullPrescribedProgramCagtReport,
  renderFullPrescribedProgramCagtReports,
} from "../cagt/fullProgramReport";

describe("full prescribed-program CAGT deterministic reports", () => {
  const report = buildFullPrescribedProgramCagtReport();

  it("renders the complete requested report and documentation surface", () => {
    const reports = renderFullPrescribedProgramCagtReports(report);
    expect(Object.keys(reports)).toHaveLength(23);
    expect(FULL_PROGRAM_GATE_14_UPDATED_DOCS).toHaveLength(15);
    expect(reports["FULL_PRESCRIBED_PROGRAM_CAGT_IMPLEMENTATION_READINESS.md"])
      .toContain("FULL_PRESCRIBED_PROGRAM_CAGT_V1_READY_FOR_PHASE_CONTINUITY_AUTHORIZATION");
    expect(reports["CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.md"])
      .toContain("MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE");
  });

  it("locks deterministic fingerprints and all hard-zero evidence", () => {
    expect(report.fingerprints.combinedGate14Tooling)
      .toBe(EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_COMBINED_FINGERPRINT);
    expect(report.holdout).toMatchObject({ expectationMismatchCount: 0, acceptedDownstreamRescueCount: 0,
      resultValidationFailureCount: 0 });
    expect(report.stress.result).toBe("DETERMINISTIC_FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_PASSED");
    expect(report.coverage.failureCount).toBe(0);
    expect(report.phaseLongitudinalBoundary.failureCount).toBe(0);
    expect(Object.values(report.activationGuards).every((count) => count === 0)).toBe(true);
  });
}, 90_000);
