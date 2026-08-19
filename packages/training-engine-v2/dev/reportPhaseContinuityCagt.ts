import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PHASE_CONTINUITY_GATE_15_UPDATED_DOCS,
  buildPhaseContinuityCagtReport,
  phaseContinuityGate15DocumentationMarker,
  renderPhaseContinuityCagtReports,
} from "../tests/cagt/phaseContinuityReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  process.cwd() : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const report = buildPhaseContinuityCagtReport();
for (const [name, content] of Object.entries(renderPhaseContinuityCagtReports(report))) {
  writeFileSync(resolve(docsRoot, name), content);
}

const marker = phaseContinuityGate15DocumentationMarker(report);
const markerPattern = /<!-- PHASE_CONTINUITY_GATE_15_V1:START -->[\s\S]*?<!-- PHASE_CONTINUITY_GATE_15_V1:END -->/;
for (const name of PHASE_CONTINUITY_GATE_15_UPDATED_DOCS) {
  const path = resolve(docsRoot, name);
  const current = existsSync(path) ? readFileSync(path, "utf8") :
    `# ${name.replace(/\.md$/, "").replaceAll("_", " ")}\n`;
  const next = markerPattern.test(current) ? current.replace(markerPattern, marker) :
    `${current.trimEnd()}\n\n${marker}\n`;
  writeFileSync(path, next);
}

process.stdout.write(`${JSON.stringify({
  classification: report.classification,
  ontology: report.ontologyClassification,
  authorityRegistry: `${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}`,
  holdoutPairs: report.holdout.pairCount,
  genuineProgramPairs: report.holdout.genuineCompleteProgramPairCount,
  expectationMismatches: report.holdout.expectationMismatchCount,
  acceptedDownstreamRescues: report.holdout.acceptedDownstreamRescueCount,
  stress: report.stress.result,
  activation: report.activationGuards.result,
  combinedFingerprint: report.fingerprints.combinedGate15Design,
}, null, 2)}\n`);
