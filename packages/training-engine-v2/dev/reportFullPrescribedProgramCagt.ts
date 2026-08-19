import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FULL_PROGRAM_GATE_14_UPDATED_DOCS,
  buildFullPrescribedProgramCagtReport,
  fullProgramGate14DocumentationMarker,
  renderFullPrescribedProgramCagtReports,
} from "../tests/cagt/fullProgramReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd() : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const report = buildFullPrescribedProgramCagtReport();
for (const [name, content] of Object.entries(renderFullPrescribedProgramCagtReports(report))) {
  writeFileSync(resolve(docsRoot, name), content);
}

const marker = fullProgramGate14DocumentationMarker(report);
const markerPattern = /<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:START -->[\s\S]*?<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:END -->/;
for (const name of FULL_PROGRAM_GATE_14_UPDATED_DOCS) {
  const path = resolve(docsRoot, name);
  const current = existsSync(path) ? readFileSync(path, "utf8") : `# ${name.replace(/\.md$/, "").replaceAll("_", " ")}\n`;
  const next = markerPattern.test(current) ? current.replace(markerPattern, marker) : `${current.trimEnd()}\n\n${marker}\n`;
  writeFileSync(path, next);
}

process.stdout.write(`${JSON.stringify({
  classification: report.classification,
  authorityRegistry: `${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}`,
  holdoutPairs: report.holdout.pairCount,
  genuineCompleteProgramPairs: report.holdout.genuineCompleteProgramPairCount,
  expectationMismatches: report.holdout.expectationMismatchCount,
  acceptedDownstreamRescues: report.holdout.acceptedDownstreamRescueCount,
  stress: report.stress.result,
  combinedFingerprint: report.fingerprints.combinedGate14Tooling,
}, null, 2)}\n`);
