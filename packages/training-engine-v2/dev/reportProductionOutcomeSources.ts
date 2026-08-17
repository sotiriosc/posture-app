import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES,
  PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES,
  PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS,
  buildProductionOutcomeSourceImplementationReport,
  buildProductionOutcomeSourceJsonReports,
  buildProductionOutcomeSourceMarkdownReports,
  productionOutcomeSourceDocumentationMarker,
} from "../tests/cagt/productionOutcomeSourceReport";
import { preserveLinkedDocumentationMarkers } from "./preserveLinkedDocumentationMarkers";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
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
const markdown = buildProductionOutcomeSourceMarkdownReports();
const json = buildProductionOutcomeSourceJsonReports();
for (const filename of PRODUCTION_OUTCOME_SOURCE_REPORT_FILENAMES) {
  const path = resolve(docsRoot, filename);
  if (filename === "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT.md" && existsSync(path)) {
    const current = readFileSync(path, "utf8");
    const block = `<!-- PRODUCTION_OUTCOME_SOURCE_REPORT_V1:START -->\n${markdown[filename].trim()}\n<!-- PRODUCTION_OUTCOME_SOURCE_REPORT_V1:END -->`;
    const reportPattern = /<!-- PRODUCTION_OUTCOME_SOURCE_REPORT_V1:START -->[\s\S]*?<!-- PRODUCTION_OUTCOME_SOURCE_REPORT_V1:END -->/;
    writeFileSync(path, reportPattern.test(current) ? current.replace(reportPattern, block) :
      `${current.trimEnd()}\n\n${block}\n`, "utf8");
  } else {
    const current = existsSync(path) ? readFileSync(path, "utf8") : "";
    writeFileSync(path,
      preserveLinkedDocumentationMarkers(markdown[filename], current, linkedMarkerPatterns), "utf8");
  }
}
for (const filename of PRODUCTION_OUTCOME_SOURCE_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}
const marker = productionOutcomeSourceDocumentationMarker();
const pattern = /<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->[\s\S]*?<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->/;
for (const filename of PRODUCTION_OUTCOME_SOURCE_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}
const report = buildProductionOutcomeSourceImplementationReport();
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyAuditClassification, controlled: report.evidence.controlled.scenarioCount,
  holdout: report.evidence.foundationHoldoutCount, adapters: report.productionAdapterContractCount,
  tables: report.schema.physicalTableCount, replay: report.evidence.stress.deterministicReplays,
  stress: report.evidence.stress.result,
  combinedFingerprint: report.fingerprints.combinedProductionSourcePersistenceImplementation }, null, 2)}\n`);
