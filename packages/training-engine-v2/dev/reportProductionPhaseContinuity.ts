import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCTION_PHASE_CONTINUITY_UPDATED_DOCS,
  buildProductionPhaseContinuityReport,
  productionPhaseContinuityDocumentationMarker,
  renderProductionPhaseContinuityReports,
} from "../tests/helpers/productionPhaseContinuityReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const report = buildProductionPhaseContinuityReport();
for (const [name, content] of Object.entries(renderProductionPhaseContinuityReports(report))) {
  writeFileSync(resolve(docsRoot, name), content);
}
const marker = productionPhaseContinuityDocumentationMarker(report);
const pattern = /<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:START -->[\s\S]*?<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:END -->/;
for (const name of PRODUCTION_PHASE_CONTINUITY_UPDATED_DOCS) {
  const path = resolve(docsRoot, name);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${name.replace(/\.md$/, "")}\n`;
  const next = pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`;
  writeFileSync(path, next);
}
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyClassification, golden: report.golden.result,
  stress: report.stress.result, activation: report.activation.result,
  combinedFingerprint: report.fingerprints.combinedProductionPhaseContinuityKernel }, null, 2)}\n`);
