import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES,
  PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES,
  PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS,
  buildProductGoalArchitectureImplementationReport,
  buildProductGoalArchitectureJsonReports,
  buildProductGoalArchitectureMarkdownReports,
  productGoalArchitectureDocumentationMarker,
} from "../tests/cagt/productGoalArchitectureReports";
import { preserveLinkedDocumentationMarkers } from "./preserveLinkedDocumentationMarkers";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const marker = productGoalArchitectureDocumentationMarker();
const pattern = /<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->[\s\S]*?<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->/;
const linkedMarkerPatterns = Object.freeze([
  /\n*<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->[\s\S]*?<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->\n?/,
  /\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n?/,
  /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n?/,
  /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n?/,
  /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n?/,
  /\n*<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->[\s\S]*?<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->\n?/,
  /\n*<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->[\s\S]*?<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->\n?/,
  /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/,
  /\n*<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->\n?/,
]);

for (const filename of PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS) {
  const path = resolve(workspaceRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") :
    `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) :
    `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}

const markdown = buildProductGoalArchitectureMarkdownReports(workspaceRoot);
const json = buildProductGoalArchitectureJsonReports(workspaceRoot);
for (const filename of PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  writeFileSync(path,
    preserveLinkedDocumentationMarkers(markdown[filename], current, linkedMarkerPatterns), "utf8");
}
for (const filename of PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}

const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
process.stdout.write(`${JSON.stringify({
  classification: report.classification,
  b1State: report.b1State,
  ledgerFingerprint: report.fingerprints.canonicalLedgerAfterClosure,
  combinedFingerprint: report.fingerprints.combinedB1ArchitectureAdmission,
  ledgerIssueCount: report.ledgerValidation.issues.length,
  policyIssueCount: report.policyValidation.length,
  sourceGuardIssueCount: report.sourceGuardValidation.length,
  mutationCount: report.mutations.length,
  metamorphicCount: report.metamorphic.invariants.length +
    report.metamorphic.materialResponses.length,
  artificialRuntimeDifferenceCount: report.cagt.artificialRuntimeDifferenceCount,
  nextDependency: report.nextDependency,
}, null, 2)}\n`);
