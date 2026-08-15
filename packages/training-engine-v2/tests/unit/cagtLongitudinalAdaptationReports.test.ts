import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildLongitudinalAdaptationReports,
  LONGITUDINAL_ADAPTATION_CLASSIFICATION,
  LONGITUDINAL_ADAPTATION_REPORT_FILENAMES,
} from "../cagt/longitudinalAdaptationReport";
import { LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION } from
  "../../src/longitudinalAdaptation/designContracts";

describe("Gate 16 reports", () => {
  it("builds and freezes all 32 required artifacts", () => {
    const reports = buildLongitudinalAdaptationReports();
    expect(LONGITUDINAL_ADAPTATION_REPORT_FILENAMES).toHaveLength(32);
    expect(Object.keys(reports).sort()).toEqual([...LONGITUDINAL_ADAPTATION_REPORT_FILENAMES].sort());
    const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
      resolve(process.cwd(), "packages/training-engine-v2");
    const productionMarker = /\n*<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START -->[\s\S]*?<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:END -->\n*/;
    const foundationMarker = /\n*<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->[\s\S]*?<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->\n*/;
    for (const filename of LONGITUDINAL_ADAPTATION_REPORT_FILENAMES) {
      const actual = readFileSync(resolve(packageRoot, "../../docs/training-engine-v2", filename), "utf8")
        .replace(productionMarker, "\n").replace(foundationMarker, "\n");
      expect(actual, filename)
        .toBe(reports[filename]);
    }
  });

  it("states readiness without claiming production runtime", () => {
    expect(LONGITUDINAL_ADAPTATION_CLASSIFICATION)
      .toBe("LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION");
    expect(LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION)
      .toBe("LONGITUDINAL_ADAPTATION_ONTOLOGY_READY");
    const admission = JSON.parse(buildLongitudinalAdaptationReports()
      ["LONGITUDINAL_ADAPTATION_CAGT_ADMISSION_REPORT.json"]);
    expect(admission.ontologyAuditClassification).toBe("LONGITUDINAL_ADAPTATION_ONTOLOGY_READY");
    const report = buildLongitudinalAdaptationReports()["LONGITUDINAL_ADAPTATION_IMPLEMENTATION_READINESS.md"];
    expect(report).toContain("OWNER_AUTHORIZATION_FOR_PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION");
    expect(report).toContain("does not implement, export, activate, or wire a production Longitudinal Adaptation kernel");
  });

  it("retains the complete ontology, evidence-topic, and real-user audits", () => {
    const reports = buildLongitudinalAdaptationReports();
    const ontology = reports["LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT.md"];
    expect(ontology).toContain("## Concept audit");
    expect(ontology).toContain("20. **Yes.** Gate 16 can consume caller-supplied normalized outcomes");
    expect(ontology).toContain("current application-history storage");
    const evidence = reports["LONGITUDINAL_ADAPTATION_EVIDENCE_REVIEW.md"];
    expect(evidence).toContain("| Double/repetition progression |");
    expect(evidence).toContain("| Older/adapted populations |");
    const variables = reports["REAL_USER_LONGITUDINAL_ADAPTATION_VARIABLE_AUDIT.md"];
    expect(variables).toContain("| Delayed symptoms |");
    expect(variables).toContain("| Coach override |");
    expect(variables).toContain("| Rotation |");
  });
});
