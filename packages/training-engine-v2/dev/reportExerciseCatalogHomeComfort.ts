import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  curationFingerprints,
  curationJsonReports,
  curationMarkdownReports,
  reportCorpusFingerprint,
} from "../tests/exerciseCatalogHomeComfort/reports";
import { controlledScenarios, holdoutManifest, readiness } from "../tests/exerciseCatalogHomeComfort/evidence";
import { validationSummary } from "../tests/exerciseCatalogHomeComfort/validation";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

for (const [filename, content] of Object.entries(curationMarkdownReports)) {
  writeFileSync(resolve(docsRoot, filename), content, "utf8");
}
for (const [filename, content] of Object.entries(curationJsonReports)) {
  writeFileSync(resolve(docsRoot, filename), content, "utf8");
}

const integrationBlocks: Readonly<Record<string, string>> = Object.freeze({
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md":
    "Pre-G1 completes read-only coverage and home-comfort curation against the frozen 45-row catalog. Three owner-ready packages are compared without selecting a package or changing Candidate, Composer, Week, Prescription, Product Shadow, Product UI, delivery, or activation.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md":
    "Pre-G1 adds no activation authority. The current 45 rows and inactive Get stronger preview remain frozen. Pre-G2 production expansion, Pre-G3 practice-option bridging, G owner delivery, and H broader activation remain separately authorized.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md":
    "Before G, the sequence now requires Pre-G1 curation, Pre-G2 owner-approved production catalog expansion, and Pre-G3 Full/Lighter/Recovery V2 bridging. This commit completes only Pre-G1 read-only evidence.",
  "docs/training-engine-v2/ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_READINESS.md":
    "Chunk F remains completed preview-only and unchanged. Pre-G1 evaluates catalog coverage before owner delivery without exposing Get stronger, changing its app-local contracts, or adding any Product route, persistence, generation, shadow, or output behavior.",
  "docs/training-engine-v2/ARCHITECTURE.md":
    "`EXERCISE_HOME_COMFORT_PROFILE@1.0.0` and `HOME_EXERCISE_COMFORT_SELECTION_POLICY_V1@1.0.0` are design-only curation contracts. Comfort is multidimensional and ordered after Safety, equipment, purpose, pain/response, and productive familiarity; it is not a score or active ranking input.",
  "docs/training-engine-v2/DOMAIN.md":
    "Home environment, experience, exact identity familiarity, realization familiarity, comfort, equipment capability, and support are separate facts. Grip, support, angle, range, side, and load alone do not create duplicate canonical identities.",
  "docs/training-engine-v2/TESTING.md":
    `Pre-G1 evidence covers ${controlledScenarios.length} controlled scenarios, a frozen ${holdoutManifest.length}-case holdout, ${validationSummary.mutationCount}/${validationSummary.mutationCount} rejected semantic mutations, and ${validationSummary.metamorphicCount}/${validationSummary.metamorphicCount} passed metamorphic relations. Source and activation guards prove zero runtime/Product changes.`,
});

const start = "<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->";
const end = "<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->";
const pattern = /<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->/;
for (const [relativePath, summary] of Object.entries(integrationBlocks)) {
  const path = resolve(workspaceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`PRE_G1_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  const block = `${start}\n\n## Pre-G1 - Exercise catalog coverage and home comfort curation\n\n${summary}\n\n` +
    `Combined curation fingerprint: \`${curationFingerprints.combinedCuration}\`. ` +
    `Exact next dependency: \`${readiness.nextDependency}\`.\n\n${end}`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, block) : `${current.trimEnd()}\n\n${block}\n`, "utf8");
}

process.stdout.write(`${JSON.stringify({
  classification: readiness.classification,
  ontologyClassification: readiness.ontologyClassification,
  markdownReportCount: Object.keys(curationMarkdownReports).length,
  jsonReportCount: Object.keys(curationJsonReports).length,
  controlledScenarioCount: controlledScenarios.length,
  holdoutCount: holdoutManifest.length,
  mutationResult: `${validationSummary.mutationRejectedCount}/${validationSummary.mutationCount}`,
  metamorphicResult: `${validationSummary.metamorphicPassedCount}/${validationSummary.metamorphicCount}`,
  reportCorpusFingerprint,
  combinedCurationFingerprint: curationFingerprints.combinedCuration,
  nextDependency: readiness.nextDependency,
}, null, 2)}\n`);
