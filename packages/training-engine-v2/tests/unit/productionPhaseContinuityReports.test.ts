import { describe, expect, it } from "vitest";
import {
  PRODUCTION_PHASE_CONTINUITY_JSON_FILES,
  PRODUCTION_PHASE_CONTINUITY_REPORT_FILES,
  buildProductionPhaseContinuityReport,
  renderProductionPhaseContinuityReports,
} from "../helpers/productionPhaseContinuityReport";

describe("production Phase Continuity reports", () => {
  it("renders every required deterministic Markdown and JSON artifact", () => {
    const report = buildProductionPhaseContinuityReport();
    const files = renderProductionPhaseContinuityReports(report);
    expect(PRODUCTION_PHASE_CONTINUITY_REPORT_FILES).toHaveLength(26);
    expect(PRODUCTION_PHASE_CONTINUITY_JSON_FILES).toHaveLength(6);
    expect(Object.keys(files).sort()).toEqual([
      ...PRODUCTION_PHASE_CONTINUITY_REPORT_FILES,
      ...PRODUCTION_PHASE_CONTINUITY_JSON_FILES,
    ].sort());
    expect(report).toMatchObject({
      classification: "PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION",
      ontologyClassification: "PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_READY",
      kernelStatus: "PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED",
      activationStatus: "NOT_ACTIVATED",
    });
    expect(report.authorityRegistryValidationReasons).toEqual([]);
  });
});
