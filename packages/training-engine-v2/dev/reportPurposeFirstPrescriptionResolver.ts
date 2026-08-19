import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES,
  PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES,
  PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS,
  buildPurposeFirstImplementationReport,
  buildPurposeFirstJsonReports,
  buildPurposeFirstMarkdownReports,
  purposeFirstPrescriptionDocumentationMarker,
} from "../tests/cagt/purposeFirstPrescriptionResolverReports";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const marker = purposeFirstPrescriptionDocumentationMarker();
const pattern = /<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->[\s\S]*?<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->/;
for (const filename of PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS) {
  const path = resolve(workspaceRoot, filename);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${filename.replace(/\.md$/, "")}\n`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, marker) :
    `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}

const markdown = buildPurposeFirstMarkdownReports(workspaceRoot);
const json = buildPurposeFirstJsonReports(workspaceRoot);
for (const filename of PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), markdown[filename], "utf8");
}
for (const filename of PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES) {
  writeFileSync(resolve(docsRoot, filename), json[filename], "utf8");
}

const report = buildPurposeFirstImplementationReport(workspaceRoot);
process.stdout.write(`${JSON.stringify({
  classification: report.classification,
  ontologyClassification: report.ontologyClassification,
  controlled: `${report.evidence.controlledPassedCount}/${report.evidence.controlledScenarioCount}`,
  fallthrough: `${report.evidence.correctedFallthroughCount}/${report.evidence.fallthroughScenarioCount}`,
  golden: `${report.evidence.goldenEquivalentCount}/${report.evidence.goldenPairCount}`,
  holdout: report.evidence.holdout,
  mutations: report.mutations.length,
  metamorphic: report.metamorphic.invariants.length + report.metamorphic.materialResponses.length,
  stressFailureCount: report.stress.failureCount,
  guards: report.guards,
  combinedFingerprint: report.fingerprints.combinedB2Implementation,
  nextDependency: report.nextDependency,
}, null, 2)}\n`);
