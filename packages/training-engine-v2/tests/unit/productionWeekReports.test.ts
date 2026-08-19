import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCTION_WEEK_JSON_FILENAMES,
  PRODUCTION_WEEK_REPORT_FILENAMES,
  PRODUCTION_WEEK_UPDATED_DOCS,
  buildProductionWeekImplementationReport,
  buildProductionWeekJsonReports,
  buildProductionWeekMarkdownReports,
} from "../cagt/productionWeekReport";
import { PRODUCTION_WEEK_DOCUMENTATION_FINGERPRINT } from "../cagt/productionWeekDocumentation";

const docsRoot = resolve(__dirname, "../../../../docs/training-engine-v2");

describe("production Week reports", () => {
  it("persists every deterministic markdown and JSON artifact", () => {
    expect(PRODUCTION_WEEK_DOCUMENTATION_FINGERPRINT).toBe(
      buildProductionWeekImplementationReport().combinedProductionWeekImplementation,
    );
    const markdown = buildProductionWeekMarkdownReports();
    const json = buildProductionWeekJsonReports();
    expect(PRODUCTION_WEEK_REPORT_FILENAMES).toHaveLength(37);
    expect(PRODUCTION_WEEK_JSON_FILENAMES).toHaveLength(12);
    const orchestrationMarker = /\n*<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->[\s\S]*?<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->\n*/g;
    const productShadowMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->\n*/g;
    const supportedPurposeMarker = /\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n*/g;
    const b4Marker = /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n*/g;
    const preG3Marker = /\n*<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:START -->[\s\S]*?<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:END -->\n*/g;
    for (const filename of PRODUCTION_WEEK_REPORT_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8").replace(orchestrationMarker, "\n")
        .replace(productShadowMarker, "\n").replace(supportedPurposeMarker, "\n")
        .replace(b4Marker, "\n").replace(preG3Marker, "\n"))
        .toBe(markdown[filename]);
    }
    for (const filename of PRODUCTION_WEEK_JSON_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  }, 120_000);

  it("updates architecture and historical readiness with one bounded marker", () => {
    expect(PRODUCTION_WEEK_UPDATED_DOCS).toHaveLength(19);
    for (const filename of PRODUCTION_WEEK_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, filename), "utf8");
      expect(content.match(/PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START/g)).toHaveLength(1);
      expect(content.match(/PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END/g)).toHaveLength(1);
    }
  });

  it("reports readiness for adaptation application orchestration and nothing beyond it", () => {
    const report = buildProductionWeekImplementationReport();
    expect(report.classification).toBe(
      "PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_READY_FOR_ADAPTATION_APPLICATION_ORCHESTRATION_AUTHORIZATION");
    expect(report.combinedStatus).toBe("PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_IMPLEMENTED_NOT_ACTIVATED");
    expect(report.runtimeActivationStatus).toBe("NOT_ACTIVATED");
    expect(report.nextDependency).toBe("ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION");
  });
});
