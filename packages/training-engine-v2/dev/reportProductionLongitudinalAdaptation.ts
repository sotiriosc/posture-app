import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCTION_LONGITUDINAL_UPDATED_DOCS,
  buildProductionLongitudinalAdaptationReport,
  productionLongitudinalDocumentationMarker,
  renderProductionLongitudinalAdaptationReports,
} from "../tests/helpers/productionLongitudinalAdaptationReport";
import { preserveLinkedDocumentationMarkers } from "./preserveLinkedDocumentationMarkers";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const report = buildProductionLongitudinalAdaptationReport();
const linkedMarkerPatterns = Object.freeze([
  /\n*<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->[\s\S]*?<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->\n?/,
  /\n*<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->[\s\S]*?<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->\n?/,
  /\n*<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START -->[\s\S]*?<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END -->\n?/,
  /\n*<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->[\s\S]*?<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->\n?/,
  /\n*<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->\n?/,
  /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n?/,
  /\n*<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:START -->[\s\S]*?<!-- PRE_G3_SESSION_PRACTICE_OPTIONS_V2:END -->\n?/,
  /\n*<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->\n?/,
]);
for (const [name, content] of Object.entries(renderProductionLongitudinalAdaptationReports(report))) {
  const path = resolve(docsRoot, name);
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  writeFileSync(path, preserveLinkedDocumentationMarkers(content, current, linkedMarkerPatterns));
}
const marker = productionLongitudinalDocumentationMarker(report);
const pattern = /<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START -->[\s\S]*?<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:END -->/;
for (const name of PRODUCTION_LONGITUDINAL_UPDATED_DOCS) {
  const path = resolve(docsRoot, name);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${name.replace(/\.md$/, "")}\n`;
  const next = pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`;
  writeFileSync(path, next);
}
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyClassification, golden: report.golden.result,
  stress: report.stress.result, activation: report.activation.result,
  combinedFingerprint: report.fingerprints.combinedProductionLongitudinalKernel }, null, 2)}\n`);
