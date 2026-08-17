import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES,
  CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES,
  buildControlledProductShadowImplementationReport,
  buildControlledProductShadowJsonReports,
  buildControlledProductShadowMarkdownReports,
} from "../cagt/controlledProductShadowReport";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const productGoalAuditMarker = /\n?<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:START -->[\s\S]*?<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:END -->\n?/g;
const b4Marker = /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n*/g;
const goalRealizationMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n*/g;
const goalSpecificEvidenceMarker = /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n*/g;
const preG3Marker = /\n*<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:START -->[\s\S]*?<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:END -->\n*/g;

describe("controlled Product shadow deterministic reports", () => {
  it("builds every requested Markdown and JSON report", () => {
    const markdown = buildControlledProductShadowMarkdownReports();
    const json = buildControlledProductShadowJsonReports();
    expect(Object.keys(markdown)).toEqual([...CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES]);
    expect(Object.keys(json)).toEqual([...CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES]);
    for (const filename of CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES) {
      expect(markdown[filename]).toContain("No V2 artifact is returned");
      expect(readFileSync(resolve(docsRoot, filename), "utf8").replace(productGoalAuditMarker, "")
        .replace(b4Marker, "").replace(goalRealizationMarker, "")
        .replace(goalSpecificEvidenceMarker, "").replace(preG3Marker, "").trimEnd())
        .toBe(markdown[filename].trimEnd());
    }
    for (const filename of CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES) {
      expect(() => JSON.parse(json[filename])).not.toThrow();
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  });

  it("returns the authorized default-off classification and exact next dependency", () => {
    const report = buildControlledProductShadowImplementationReport();
    expect(report).toMatchObject({
      classification: "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION",
      ontologyClassification: "CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_READY",
      status: "CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF",
      productAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY", v2ApplicationState: "NOT_ACTIVATED",
      nextDependency: "SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION" });
    expect(report.stress.failures).toEqual([]);
    expect(Object.values(report.activationGuards).filter((value) => typeof value === "number" && value < 0))
      .toEqual([]);
  });

  it("renders the complete sequential 287-item authorization return ledger", () => {
    const readiness = buildControlledProductShadowMarkdownReports()[
      "CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md"];
    const items = [...readiness.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(items).toEqual(Array.from({ length: 287 }, (_, index) => index + 1));
    expect(readiness).toContain("287. exact next dependency: SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION");
  });
});
