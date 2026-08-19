import { describe, expect, it } from "vitest";
import {
  EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT,
  PHASE_CONTINUITY_GATE_15_UPDATED_DOCS,
  buildPhaseContinuityCagtReport,
  renderPhaseContinuityCagtReports,
} from "../cagt/phaseContinuityReport";

describe("Gate 15 report contract", () => {
  it("builds a ready deterministic admission report", () => {
    const report = buildPhaseContinuityCagtReport();
    expect(report.classification)
      .toBe("PHASE_CONTINUITY_GATE_15_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION");
    expect(report.ontologyClassification).toBe("PHASE_CONTINUITY_ONTOLOGY_READY");
    expect(report.readinessFailures).toBe(0);
    expect(report.fingerprints.combinedGate15Design)
      .toBe(EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT);
  }, 60_000);

  it("renders every required new artifact and declares every updated document", () => {
    const rendered = renderPhaseContinuityCagtReports();
    expect(Object.keys(rendered)).toHaveLength(25);
    expect(rendered).toHaveProperty("PHASE_CONTINUITY_ONTOLOGY_AUDIT.md");
    expect(rendered).toHaveProperty("PHASE_CONTINUITY_EVIDENCE_REVIEW.md");
    expect(rendered).toHaveProperty("PHASE_CONTINUITY_HOLDOUT_MANIFEST.json");
    expect(rendered).toHaveProperty("PHASE_CONTINUITY_CAGT_ADMISSION_REPORT.json");
    expect(rendered).toHaveProperty("PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md");
    expect(PHASE_CONTINUITY_GATE_15_UPDATED_DOCS).toHaveLength(14);
  }, 60_000);
});
