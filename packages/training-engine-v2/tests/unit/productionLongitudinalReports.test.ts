import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCTION_LONGITUDINAL_JSON_FILES,
  PRODUCTION_LONGITUDINAL_REPORT_FILES,
  PRODUCTION_LONGITUDINAL_UPDATED_DOCS,
  buildProductionLongitudinalAdaptationReport,
  productionLongitudinalDocumentationMarker,
  renderProductionLongitudinalAdaptationReports,
} from "../helpers/productionLongitudinalAdaptationReport";

describe("production Longitudinal reports", () => {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");

  it("freezes all requested Markdown and JSON artifacts", () => {
    const report = buildProductionLongitudinalAdaptationReport();
    const rendered = renderProductionLongitudinalAdaptationReports(report);
    expect(PRODUCTION_LONGITUDINAL_REPORT_FILES).toHaveLength(36);
    expect(PRODUCTION_LONGITUDINAL_JSON_FILES).toHaveLength(9);
    expect(Object.keys(rendered)).toHaveLength(45);
    const foundationMarker = /\n*<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->[\s\S]*?<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->\n*/;
    const productionSourceMarker = /\n*<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->[\s\S]*?<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->\n*/;
    for (const [name, content] of Object.entries(rendered)) {
      expect(readFileSync(resolve(docsRoot, name), "utf8").replace(foundationMarker, "\n")
        .replace(productionSourceMarker, "\n"), name).toBe(content);
    }
  });

  it("updates every historical and architecture handoff with one deterministic marker", () => {
    const marker = productionLongitudinalDocumentationMarker();
    for (const name of PRODUCTION_LONGITUDINAL_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, name), "utf8");
      expect(content, name).toContain(marker);
      expect(content.match(/PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START/g)).toHaveLength(1);
    }
  });

  it("publishes the ready-but-inactive classification and clean evidence", () => {
    expect(buildProductionLongitudinalAdaptationReport()).toMatchObject({
      classification:
        "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_READY_FOR_OUTCOME_SOURCE_AND_APPLICATION_INTEGRATION_AUTHORIZATION",
      ontologyClassification: "TARGETED_PRODUCTION_LONGITUDINAL_ADAPTATION_DOMAIN_FIXES_REQUIRED",
      kernelStatus: "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTED_NOT_ACTIVATED",
      activationStatus: "NOT_ACTIVATED", authorityRegistryValidationReasons: [],
      golden: { semanticMismatchCount: 0 }, mutations: { mismatchCount: 0 },
      metamorphic: { failureCount: 0 }, stress: { failureCount: 0 }, activation: { failureCount: 0 },
    });
  });
});
