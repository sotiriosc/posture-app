import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ADAPTATION_APPLICATION_ORCHESTRATION_DOCUMENTATION_FINGERPRINT } from
  "../cagt/applicationOrchestrationDocumentation";
import {
  APPLICATION_ORCHESTRATION_JSON_FILENAMES,
  APPLICATION_ORCHESTRATION_REPORT_FILENAMES,
  APPLICATION_ORCHESTRATION_UPDATED_DOCS,
  buildApplicationOrchestrationImplementationReport,
  buildApplicationOrchestrationJsonReports,
  buildApplicationOrchestrationMarkdownReports,
} from "../cagt/applicationOrchestrationReport";

const docsRoot = resolve(__dirname, "../../../../docs/training-engine-v2");

describe("adaptation application orchestration reports", () => {
  it("persists every deterministic Markdown and JSON artifact", () => {
    const report = buildApplicationOrchestrationImplementationReport();
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_DOCUMENTATION_FINGERPRINT).toBe(report.combinedFingerprint);
    const markdown = buildApplicationOrchestrationMarkdownReports();
    const json = buildApplicationOrchestrationJsonReports();
    expect(APPLICATION_ORCHESTRATION_REPORT_FILENAMES).toHaveLength(34);
    expect(APPLICATION_ORCHESTRATION_JSON_FILENAMES).toHaveLength(14);
    for (const filename of APPLICATION_ORCHESTRATION_REPORT_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(markdown[filename]);
    }
    for (const filename of APPLICATION_ORCHESTRATION_JSON_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  }, 120_000);

  it("updates every historical integration document through one bounded marker", () => {
    expect(APPLICATION_ORCHESTRATION_UPDATED_DOCS).toHaveLength(17);
    for (const filename of APPLICATION_ORCHESTRATION_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, filename), "utf8");
      expect(content.match(/ADAPTATION_APPLICATION_ORCHESTRATION_V1:START/g)).toHaveLength(1);
      expect(content.match(/ADAPTATION_APPLICATION_ORCHESTRATION_V1:END/g)).toHaveLength(1);
    }
  });

  it("stops exactly at controlled Product shadow integration authorization", () => {
    const report = buildApplicationOrchestrationImplementationReport();
    expect(report.classification)
      .toBe("ADAPTATION_APPLICATION_ORCHESTRATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION");
    expect(report.status).toBe("ADAPTATION_APPLICATION_ORCHESTRATION_V1_IMPLEMENTED_NOT_ACTIVATED");
    expect(report.activationStatus).toBe("NOT_ACTIVATED");
    expect(report.nextDependency).toBe("CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION");
    expect(report.activationGuards.appliedApplicationStateCount).toBe(0);
  });
});
