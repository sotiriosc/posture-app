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
const linkedMarkerPatterns = Object.freeze([
  /\n*<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->[\s\S]*?<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->\n?/,
  /\n*<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->[\s\S]*?<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->\n?/,
  /\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n?/,
  /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n?/,
  /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n?/,
  /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n?/,
  /\n*<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->[\s\S]*?<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->\n?/,
  /\n*<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->[\s\S]*?<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->\n?/,
  /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/,
]);

function preserveLinkedMarkers(content: string, current: string): string {
  const starts = linkedMarkerPatterns.flatMap((pattern) => {
    const match = current.match(pattern);
    return match?.index === undefined ? [] : [match.index];
  });
  return starts.length > 0 ? `${content.trimEnd()}${current.slice(Math.min(...starts))}` : content;
}

const markdown = buildProductTrainingGoalMarkdownReports();
const json = buildProductTrainingGoalJsonReports();
for (const filename of PRODUCT_TRAINING_GOAL_REPORT_FILENAMES) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  writeFileSync(path, preserveLinkedMarkers(markdown[filename], current), "utf8");
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
