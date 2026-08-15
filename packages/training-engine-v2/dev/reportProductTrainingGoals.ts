import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildProductTrainingGoalAuditReport } from
  "../tests/cagt/productTrainingGoalAudit";
import {
  PRODUCT_TRAINING_GOAL_JSON_FILENAMES,
  PRODUCT_TRAINING_GOAL_REPORT_FILENAMES,
  PRODUCT_TRAINING_GOAL_UPDATED_DOCS,
  buildProductTrainingGoalJsonReports,
  buildProductTrainingGoalMarkdownReports,
  productTrainingGoalDocumentationMarker,
} from "../tests/cagt/productTrainingGoalReports";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const markdown = buildProductTrainingGoalMarkdownReports();
const json = buildProductTrainingGoalJsonReports();
for (const filename of PRODUCT_TRAINING_GOAL_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
}
for (const filename of PRODUCT_TRAINING_GOAL_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}

const marker = productTrainingGoalDocumentationMarker();
const pattern = /<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:START -->[\s\S]*?<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:END -->/;
for (const filename of PRODUCT_TRAINING_GOAL_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) :
    `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}

const report = buildProductTrainingGoalAuditReport();
process.stdout.write(`${JSON.stringify({
  classification: report.classification,
  ontology: report.ontologyClassification,
  productionBehaviorChanged: report.productionBehaviorChanged,
  selectedPolicy: report.selectedPolicy,
  scenarioCount: report.scenarios.length,
  affectedExerciseCount: report.affectedExercises.length,
  cagtResult: report.cagt.result,
  combinedAuditFingerprint: report.auditFingerprints.combinedAudit,
  nextDependency: report.nextDependency,
}, null, 2)}\n`);
