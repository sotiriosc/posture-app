import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  OUTCOME_SOURCE_REPORT_FILENAMES,
  OUTCOME_SOURCE_UPDATED_DOCS,
  buildOutcomeSourceAdmissionReport,
  buildOutcomeSourceReports,
  outcomeSourceDocumentationMarker,
} from "../tests/cagt/outcomeSourceReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });
const report = buildOutcomeSourceAdmissionReport();
const reports = buildOutcomeSourceReports();
for (const filename of OUTCOME_SOURCE_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), reports[filename], "utf8");
}
const marker = outcomeSourceDocumentationMarker(report);
const pattern = /<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->[\s\S]*?<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->/;
for (const filename of OUTCOME_SOURCE_UPDATED_DOCS) {
  const path = resolve(docsRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  const next = pattern.test(current) ? current.replace(pattern, marker) : `${current.trimEnd()}\n\n${marker}\n`;
  writeFileSync(path, next, "utf8");
}
process.stdout.write(`${JSON.stringify({ classification: report.classification,
  ontology: report.ontologyAuditClassification, controlled: report.controlled.scenarioCount,
  holdout: report.holdout.total, replay: report.replay.replayHistoryCount,
  golden: report.golden.result, stress: report.stress.result,
  activation: report.activation.result,
  combinedFingerprint: report.foundationFingerprints.combinedSourcePersistenceFoundation }, null, 2)}\n`);
