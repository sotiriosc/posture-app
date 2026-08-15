import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCTION_LONGITUDINAL_UPDATED_DOCS,
  buildProductionLongitudinalAdaptationReport,
  productionLongitudinalDocumentationMarker,
  renderProductionLongitudinalAdaptationReports,
} from "../tests/helpers/productionLongitudinalAdaptationReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const report = buildProductionLongitudinalAdaptationReport();
for (const [name, content] of Object.entries(renderProductionLongitudinalAdaptationReports(report))) {
  writeFileSync(resolve(docsRoot, name), content);
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
