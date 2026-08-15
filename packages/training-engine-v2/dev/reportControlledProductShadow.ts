import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { controlledProductShadowDocumentationMarker } from
  "../tests/cagt/controlledProductShadowDocumentation";
import {
  CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES,
  CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES,
  CONTROLLED_PRODUCT_SHADOW_UPDATED_DOCS,
  buildControlledProductShadowImplementationReport,
  buildControlledProductShadowJsonReports,
  buildControlledProductShadowMarkdownReports,
} from "../tests/cagt/controlledProductShadowReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const markdown = buildControlledProductShadowMarkdownReports();
const json = buildControlledProductShadowJsonReports();
for (const filename of CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
}
for (const filename of CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}
const marker = controlledProductShadowDocumentationMarker();
const pattern = /<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->/;
for (const filename of CONTROLLED_PRODUCT_SHADOW_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) :
    `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}
const report = buildControlledProductShadowImplementationReport();
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyClassification, status: report.status,
  controlled: report.controlledScenarioCount, fixedShell: report.fixedShellCount,
  holdout: report.holdout.scenarioCount, holdoutFingerprint: report.holdout.manifestFingerprint,
  stressFailures: report.stress.failures.length, activation: report.v2ApplicationState,
  combinedFingerprint: report.combinedFingerprint, nextDependency: report.nextDependency }, null, 2)}\n`);
