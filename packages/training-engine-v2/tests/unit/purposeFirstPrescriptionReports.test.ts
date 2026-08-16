import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES,
  PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES,
  PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS,
  buildPurposeFirstImplementationReport,
  buildPurposeFirstJsonReports,
  buildPurposeFirstMarkdownReports,
  purposeFirstPrescriptionDocumentationMarker,
} from "../cagt/purposeFirstPrescriptionResolverReports";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");

function withoutSupportedPurposeAddendum(content: string): string {
  return content
    .replace(/\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n*/g, "\n")
    .replace(/\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n*/g, "\n");
}

describe("Purpose-first Prescription deterministic reports", () => {
  it("persists all 29 Markdown and 13 deterministic JSON artifacts exactly", () => {
    const markdown = buildPurposeFirstMarkdownReports(workspaceRoot);
    const json = buildPurposeFirstJsonReports(workspaceRoot);
    expect(Object.keys(markdown)).toEqual([...PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES]);
    expect(Object.keys(json)).toEqual([...PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES]);
    for (const filename of PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES) {
      expect(withoutSupportedPurposeAddendum(readFileSync(resolve(docsRoot, filename), "utf8")))
        .toBe(markdown[filename]);
    }
    for (const filename of PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES) {
      expect(() => JSON.parse(json[filename])).not.toThrow();
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  }, 30_000);

  it("renders the complete sequential 172-field readiness record", () => {
    const readiness = buildPurposeFirstMarkdownReports(workspaceRoot)[
      "PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md"];
    const items = [...readiness.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(items).toEqual(Array.from({ length: 172 }, (_, index) => index + 1));
    expect(readiness).toContain("172. exact next dependency: " +
      "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION");
  }, 30_000);

  it("records all 26 ontology answers and the top ontology classification", () => {
    const ontology = buildPurposeFirstMarkdownReports(workspaceRoot)[
      "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_AUDIT.md"];
    expect(ontology).toContain("PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_READY");
    const answers = [...ontology.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(answers).toEqual(Array.from({ length: 26 }, (_, index) => index + 1));
  }, 30_000);

  it("adds exactly one bounded B2 marker to every required linked document", () => {
    const marker = purposeFirstPrescriptionDocumentationMarker();
    expect(PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS).toHaveLength(14);
    for (const path of PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS) {
      const content = readFileSync(resolve(workspaceRoot, path), "utf8");
      expect(content.match(/<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->/g)).toHaveLength(1);
      expect(content).toContain(marker);
    }
  });

  it("records zero runtime migration and complete evidence", () => {
    const report = buildPurposeFirstImplementationReport(workspaceRoot);
    expect(report.guards).toEqual({
      productShadowV1_1Imports: 0,
      productShadowResolverImports: 0,
      orchestrationV1_1Calls: 0,
      appV1_1Imports: 0,
      productionCagtImports: 0,
      importTimeExecutions: 0,
    });
    expect(report.evidence).toMatchObject({ controlledScenarioCount: 241,
      controlledPassedCount: 241, fallthroughScenarioCount: 60,
      correctedFallthroughCount: 60, goldenPairCount: 100, goldenEquivalentCount: 100 });
    expect(report.stress.failureCount).toBe(0);
  }, 30_000);
});
