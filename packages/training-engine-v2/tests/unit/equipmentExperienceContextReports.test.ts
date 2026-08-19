import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  B4_MARKDOWN_REPORT_NAMES,
  B4_UPDATED_DOCS,
  b4DocumentationMarker,
  b4ReportsCombinedFingerprint,
  buildB4JsonReports,
  renderB4MarkdownReports,
} from "../cagt/equipmentExperienceContextReports";

const workspace = resolve(process.cwd(), "../..");
const docs = resolve(workspace, "docs/training-engine-v2");
const goalRealizationMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n?/;

describe("B4 deterministic reports", () => {
  it("persists every required Markdown report byte-for-byte", () => {
    const reports = renderB4MarkdownReports();
    expect(B4_MARKDOWN_REPORT_NAMES).toHaveLength(39);
    expect(Object.keys(reports)).toHaveLength(39);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8").replace(goalRealizationMarker, "\n"))
        .toBe(expected);
    }
    expect(reports["EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_AUDIT.md"])
      .toContain("38. Which B4 facts must later become Product inputs before activation?");
    expect(reports["EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_EVIDENCE_REVIEW.md"])
      .toContain("https://pubmed.ncbi.nlm.nih.gov/41843416/");
  });

  it("persists all deterministic JSON artifacts and the locked holdout", () => {
    const reports = buildB4JsonReports();
    expect(Object.keys(reports)).toHaveLength(18);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8")).toBe(`${JSON.stringify(expected, null, 2)}\n`);
    }
    expect(reports["EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1_HOLDOUT_MANIFEST.json"])
      .toMatchObject({ scenarioCount: 720, lockedBeforeEvaluation: true,
        genuineCompilerV1_3Count: 500, gate13V1_2Count: 240 });
    const cohort = reports["EQUIPMENT_EXPERIENCE_CONTEXT_FIXED_SHELL_COHORT.json"] as {
      readonly count: number;
      readonly scenarios: readonly unknown[];
    };
    expect(cohort.count).toBe(120);
    expect(cohort.scenarios[0]).toEqual(expect.objectContaining({
        commonCandidatePoolId: "b4:fixed-shell:candidate-pool:v1",
        selectedUseCase: "B3_ADMITTED_PURPOSE_USE_CASE_UNCHANGED",
        progressionOptions: expect.objectContaining({ selectedAxis: null, progressionAuthorized: false }),
      }));
  });

  it("records exactly 192 readiness fields and stable fingerprints", () => {
    const readiness = renderB4MarkdownReports()[
      "EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS.md"]!;
    expect(readiness.match(/^\d+\. /gm)).toHaveLength(192);
    expect(readiness).toContain("192. exact_next_dependency: " +
      "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_AUTHORIZATION");
    expect(b4ReportsCombinedFingerprint()).toMatch(/^[a-f0-9]{64}$/);
    expect(b4ReportsCombinedFingerprint()).toBe(b4ReportsCombinedFingerprint());
  });

  it("adds one bounded marker to every required integration document", () => {
    expect(B4_UPDATED_DOCS).toHaveLength(15);
    const marker = b4DocumentationMarker();
    for (const path of B4_UPDATED_DOCS) {
      const content = readFileSync(resolve(workspace, path), "utf8");
      expect(content.match(/<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->/g))
        .toHaveLength(1);
      expect(content).toContain(marker);
    }
  });
});
