import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHUNK_C_MARKDOWN_REPORT_NAMES,
  CHUNK_C_UPDATED_DOCS,
  buildChunkCJsonReports,
  chunkCDocumentationMarker,
  chunkCReportsCombinedFingerprint,
  renderChunkCMarkdownReports,
} from "../cagt/controlledProductShadowGoalRealizationReports";

const goalSpecificEvidenceMarker = /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n*/g;

const workspace = process.cwd().endsWith("packages/engine") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docs = resolve(workspace, "docs/training-engine-v2");

describe("Chunk C deterministic reports", () => {
  it("persists every required Markdown report byte-for-byte", async () => {
    const reports = await renderChunkCMarkdownReports();
    expect(CHUNK_C_MARKDOWN_REPORT_NAMES).toHaveLength(24);
    expect(Object.keys(reports)).toHaveLength(24);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8").replace(goalSpecificEvidenceMarker, "\n"))
        .toBe(expected);
    }
    expect(reports["CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_ONTOLOGY_AUDIT.md"]
      .match(/^\d+\. /gm)).toHaveLength(34);
  });

  it("persists deterministic JSON and both holdout names", async () => {
    const reports = await buildChunkCJsonReports();
    expect(Object.keys(reports)).toHaveLength(19);
    for (const [name, expected] of Object.entries(reports)) {
      expect(readFileSync(resolve(docs, name), "utf8")).toBe(`${JSON.stringify(expected, null, 2)}\n`);
    }
    expect(reports["CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1_HOLDOUT_MANIFEST.json"])
      .toMatchObject({ scenarioCount: 650, historicalV1GoldenCount: 250, newProfileMappingCount: 400,
        b1B4PipelineAttemptCount: 220, completeOrCalibrationCompleteCount: 220,
        honestIncompleteCount: 180 });
  });

  it("records all 195 readiness fields and stable fingerprints", async () => {
    const reports = await renderChunkCMarkdownReports();
    const readiness = reports["CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_IMPLEMENTATION_READINESS.md"]!;
    expect(readiness.match(/^\d+\. /gm)).toHaveLength(195);
    expect(readiness).toContain("195. exact_next_dependency: " +
      "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_AUTHORIZATION");
    await expect(chunkCReportsCombinedFingerprint()).resolves.toMatch(/^[a-f0-9]{64}$/);
  });

  it("adds one bounded marker to every integration document", () => {
    expect(CHUNK_C_UPDATED_DOCS).toHaveLength(16);
    const marker = chunkCDocumentationMarker();
    for (const path of CHUNK_C_UPDATED_DOCS) {
      const content = readFileSync(resolve(workspace, path), "utf8");
      expect(content.match(/<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->/g))
        .toHaveLength(1);
      expect(content).toContain(marker);
    }
  });
});
