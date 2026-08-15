import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCTION_WEEK_JSON_FILENAMES,
  PRODUCTION_WEEK_REPORT_FILENAMES,
  PRODUCTION_WEEK_UPDATED_DOCS,
  buildProductionWeekImplementationReport,
  buildProductionWeekJsonReports,
  buildProductionWeekMarkdownReports,
} from "../tests/cagt/productionWeekReport";
import { productionWeekDocumentationMarker } from "../tests/cagt/productionWeekDocumentation";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const markdown = buildProductionWeekMarkdownReports();
const json = buildProductionWeekJsonReports();
for (const filename of PRODUCTION_WEEK_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
}
for (const filename of PRODUCTION_WEEK_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}
const marker = productionWeekDocumentationMarker();
const pattern = /<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START -->[\s\S]*?<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END -->/;
for (const filename of PRODUCTION_WEEK_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}
const report = buildProductionWeekImplementationReport();
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyAuditClassification, holdout: report.holdout.scenarioCount,
  holdoutFailures: report.holdout.failures.length, stressFailures: report.stress.failures.length,
  activation: report.runtimeActivationStatus,
  combinedFingerprint: report.combinedProductionWeekImplementation,
  nextDependency: report.nextDependency }, null, 2)}\n`);
