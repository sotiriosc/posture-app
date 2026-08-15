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

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const marker = productGoalArchitectureDocumentationMarker();
const pattern = /<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->[\s\S]*?<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->/;
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
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
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
