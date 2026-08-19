import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { applicationOrchestrationDocumentationMarker } from
  "../tests/cagt/applicationOrchestrationDocumentation";
import {
  APPLICATION_ORCHESTRATION_JSON_FILENAMES,
  APPLICATION_ORCHESTRATION_REPORT_FILENAMES,
  APPLICATION_ORCHESTRATION_UPDATED_DOCS,
  buildApplicationOrchestrationImplementationReport,
  buildApplicationOrchestrationJsonReports,
  buildApplicationOrchestrationMarkdownReports,
} from "../tests/cagt/applicationOrchestrationReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const markdown = buildApplicationOrchestrationMarkdownReports();
const json = buildApplicationOrchestrationJsonReports();
for (const filename of APPLICATION_ORCHESTRATION_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
}
for (const filename of APPLICATION_ORCHESTRATION_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}
const marker = applicationOrchestrationDocumentationMarker();
const pattern = /<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->[\s\S]*?<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->/;
for (const filename of APPLICATION_ORCHESTRATION_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}
const report = buildApplicationOrchestrationImplementationReport();
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyClassification, controlled: report.controlledScenarioCount,
  fixedShell: report.fixedShellCount, holdout: report.holdout.scenarioCount,
  stressFailures: report.stress.failures.length, activation: report.activationStatus,
  combinedFingerprint: report.combinedFingerprint, nextDependency: report.nextDependency }, null, 2)}\n`);
