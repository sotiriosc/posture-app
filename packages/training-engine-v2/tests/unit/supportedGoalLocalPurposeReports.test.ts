import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSupportedPurposeJsonReports, renderSupportedPurposeMarkdownReports,
  SUPPORTED_PURPOSE_MARKDOWN_REPORT_NAMES, SUPPORTED_PURPOSE_UPDATED_DOCS,
  supportedPurposeDocumentationMarker, supportedPurposeReportCombinedFingerprint } from
  "../cagt/supportedGoalLocalPurposeReports";

const workspace = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docs = resolve(workspace, "docs/training-engine-v2");
const b4Marker = /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n*/g;

describe("B3 supported goal and local-purpose deterministic reports", () => {
  it("renders every required Markdown report byte-for-byte", () => {
    const reports = renderSupportedPurposeMarkdownReports();
    expect(SUPPORTED_PURPOSE_MARKDOWN_REPORT_NAMES).toHaveLength(27);
    expect(Object.keys(reports)).toHaveLength(27);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8").replace(b4Marker, "\n")).toBe(expected);
    }
    const evidence = reports["SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_EVIDENCE_REVIEW.md"]!;
    expect(evidence).toContain("https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/");
    expect(evidence).toContain("https://pubmed.ncbi.nlm.nih.gov/37414459/");
    expect(evidence).toContain("Local endurance is not equivalent to systemic conditioning");
  });

  it("renders all 15 deterministic JSON artifacts byte-for-byte", () => {
    const reports = buildSupportedPurposeJsonReports();
    expect(Object.keys(reports)).toHaveLength(15);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8")).toBe(`${JSON.stringify(expected, null, 2)}\n`);
    }
    expect(reports["SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1_HOLDOUT_MANIFEST.json"]).toMatchObject({
      scenarioCount: 540, genuineCompilerV1_2Count: 380, weekV2Count: 180,
      gate13V1_1Count: 180, historicalGoldenCount: 120,
    });
  });

  it("records exactly 155 sequential readiness fields and a stable combined fingerprint", () => {
    const readiness = readFileSync(resolve(docs,
      "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS.md"), "utf8")
      .replace(b4Marker, "\n");
    const fields = readiness.match(/^\d+\. /gm) ?? [];
    expect(fields).toHaveLength(155);
    expect(readiness).toContain("155. exact_next_dependency: " +
      "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION");
    expect(supportedPurposeReportCombinedFingerprint()).toMatch(/^[a-f0-9]{64}$/);
    expect(supportedPurposeReportCombinedFingerprint()).toBe(supportedPurposeReportCombinedFingerprint());
  });

  it("adds exactly one bounded B3 marker to every requested integration document", () => {
    expect(SUPPORTED_PURPOSE_UPDATED_DOCS).toHaveLength(15);
    const marker = supportedPurposeDocumentationMarker();
    for (const path of SUPPORTED_PURPOSE_UPDATED_DOCS) {
      const content = readFileSync(resolve(workspace, path), "utf8");
      expect(content.match(/<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->/g)).toHaveLength(1);
      expect(content).toContain(marker);
    }
  });
});
