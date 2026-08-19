import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES,
  PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES,
  PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS,
  buildProductionOutcomeSourceImplementationReport,
  buildProductionOutcomeSourceJsonReports,
  buildProductionOutcomeSourceMarkdownReports,
} from "../cagt/productionOutcomeSourceReport";

const docsRoot = resolve(__dirname, "../../../../docs/training-engine-v2");

describe("production outcome source reports", () => {
  it("emits every required deterministic report", () => {
    const orchestrationMarker = /\n*<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->[\s\S]*?<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->\n*/g;
    const productShadowMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->\n*/g;
    const preG3Marker = /\n*<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:START -->[\s\S]*?<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:END -->\n*/g;
    const chunkGDesignMarker = /\n*<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->\n*/g;
    const markdown = buildProductionOutcomeSourceMarkdownReports();
    const json = buildProductionOutcomeSourceJsonReports();
    expect(PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES).toHaveLength(40);
    expect(PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES).toHaveLength(14);
    for (const filename of PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES) {
      const persisted = readFileSync(resolve(docsRoot, filename), "utf8").replace(orchestrationMarker, "\n")
        .replace(productShadowMarker, "\n").replace(preG3Marker, "\n").replace(chunkGDesignMarker, "\n");
      if (filename === "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT.md") {
        expect(persisted).toContain(markdown[filename].trim());
        expect(persisted).toContain("FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME");
      } else expect(persisted).toBe(markdown[filename]);
    }
    for (const filename of PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  }, 45_000);

  it("updates architecture history through a bounded marker", () => {
    expect(PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS).toHaveLength(19);
    for (const filename of PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, filename), "utf8");
      expect(content.match(/PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START/g)).toHaveLength(1);
      expect(content.match(/PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END/g)).toHaveLength(1);
    }
  });

  it("returns the admitted readiness and exact next dependency", () => {
    const report = buildProductionOutcomeSourceImplementationReport();
    expect(report.classification).toBe(
      "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION");
    expect(report.nextDependency).toBe("PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION");
    expect(report.runtimeActivationStatus).toBe("NOT_ACTIVATED");
  });
});
