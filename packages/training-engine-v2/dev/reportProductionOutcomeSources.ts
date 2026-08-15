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

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
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
    writeFileSync(path, markdown[filename], "utf8");
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
