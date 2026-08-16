import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES,
  GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES,
  GOAL_SPECIFIC_PRODUCT_SHADOW_UPDATED_DOCS,
  buildGoalSpecificProductShadowJsonReports,
  buildGoalSpecificProductShadowMarkdownReports,
  buildGoalSpecificProductShadowReport,
  goalSpecificProductShadowDocumentationMarker,
} from "../tests/controlledProductShadowGoalEvidence/reportAssembly";

async function main() {
  const workspaceRoot = process.cwd().endsWith("packages/engine") ? resolve(process.cwd(), "../..") :
    process.cwd();
  const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
  mkdirSync(docsRoot, { recursive: true });
  const markdown = await buildGoalSpecificProductShadowMarkdownReports(workspaceRoot);
  const json = await buildGoalSpecificProductShadowJsonReports(workspaceRoot);
  for (const filename of GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES) {
    writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
  }
  for (const filename of GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES) {
    writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
  }

  const marker = goalSpecificProductShadowDocumentationMarker();
  const pattern = /<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->/;
  for (const relativePath of GOAL_SPECIFIC_PRODUCT_SHADOW_UPDATED_DOCS) {
    const path = resolve(workspaceRoot, relativePath);
    if (!existsSync(path)) throw new Error(`GOAL_SPECIFIC_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
    const current = readFileSync(path, "utf8");
    writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) :
      `${current.trimEnd()}\n\n${marker}\n`, "utf8");
  }

  const report = await buildGoalSpecificProductShadowReport(workspaceRoot);
  process.stdout.write(`${JSON.stringify({
    classification: report.evidence.classification,
    controlled: report.evidence.controlledScenarioCount,
    fixedShell: report.evidence.fixedShellCount,
    causalPairs: report.evidence.causalPairCount,
    holdout: report.evidence.holdoutCount,
    genuinePipelineExecutions: report.evidence.genuinePipelineExecutionCount,
    snapshots: report.evidence.fullProgramSnapshotCount,
    honestIncomplete: report.evidence.honestIncompleteCount,
    gate14Comparisons: report.evidence.gate14ComparisonCount,
    failureCount: report.evidence.failures.length,
    combinedChunkD: report.fingerprints.combinedChunkD,
    nextDependency: report.evidence.nextDependency,
  }, null, 2)}\n`);
}

void main();
