import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ORIGINAL_45_KNOWLEDGE_ENTRIES,
  ORIGINAL_45_KNOWLEDGE_IDS,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  stableKnowledgeJson,
} from "../../praxis-knowledge-core/src";
import {
  PRE_G2K_CONTRACTS,
  activationGuards,
  coachingRailCompatibility,
  completenessMatrix,
  completionSummary,
  controlledScenarios,
  engineFactConflicts,
  fallbackAfter,
  fallbackBefore,
  fallbackEquivalence,
  fallbackEquivalenceRows,
  fixedShellCohorts,
  holdoutManifest,
  implementationReadiness,
  knowledgeCompletionFingerprint,
  languageAndClaimsReview,
  libraryCompatibility,
  metamorphicResults,
  mutationResults,
  original45ExactIdResult,
  ownerBoundaries,
  packageRFreeze,
  preG2KFingerprints,
  provenanceRegistry,
  realizationReviewLedger,
  runtimeBoundary,
  stressResults,
  upstreamFingerprints,
  waveManifests,
} from "../tests/current45Knowledge/releaseEvidence";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const jsonRoot = resolve(docsRoot, "pre-g2k-json");

const pretty = (value: unknown) => `${JSON.stringify(JSON.parse(stableKnowledgeJson(value)), null, 2)}\n`;
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]) => [
  `| ${headers.join(" | ")} |`,
  `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
].join("\n");
const report = (title: string, status: string, body: string) =>
  `# ${title}\n\nStatus: \`${status}\`\n\n${body.trim()}\n`;

const completenessTable = table(
  ["Exercise", "Facts", "Focus", "Cues", "Setup", "During", "Pattern", "Watch", "Overrides", "Result"],
  completenessMatrix.map((row) => [row.exerciseId, row.factCount, row.categoryCounts.focus, row.categoryCounts.cues,
    row.categoryCounts.setup, row.categoryCounts.during, row.categoryCounts.pattern, row.categoryCounts.watchFor,
    row.realizationOverrideCount, row.status]),
);
const registryTable = table(
  ["#", "Exercise", "Facts", "Overrides", "Mechanics", "Roles", "Actions", "Stress"],
  PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry, index) => [index + 1, entry.exerciseId, entry.facts.length,
    entry.realizationOverrides.length, entry.relatedMechanicsIds.join(", "), entry.relatedMovementRoleIds.join(", ") || "none",
    entry.relatedActionFunctionIds.join(", ") || "none", entry.relatedStressTags.join(", ") || "none"]),
);
const fallbackTable = table(
  ["Exercise", "Summary", "Coaching", "Source facts"],
  fallbackEquivalenceRows.map((row) => [row.exerciseId, row.summaryEquivalent ? "equal" : "mismatch",
    row.coachingFocusEquivalent ? "equal" : "mismatch", row.sourceFactIds.join(", ")]),
);
const overrideTable = table(
  ["Exercise", "Disposition", "Overrides", "Uncovered", "Unresolved boundary"],
  realizationReviewLedger.map((row) => [row.exerciseId, row.disposition, row.acceptedOverrideCount,
    row.currentProductionRealizationUncoveredCount, row.unresolvedClaims.join("; ") || "none"]),
);
const provenanceTable = table(
  ["Exercise", "Facts", "Entry sources", "Fact sources", "Missing"],
  PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => [entry.exerciseId, entry.facts.length,
    [...new Set(entry.provenance.map((value) => value.sourceType))].join(", "),
    [...new Set(entry.facts.flatMap((fact) => fact.provenance.map((value) => value.sourceType)))].join(", "),
    entry.facts.filter((fact) => fact.provenance.length === 0).length]),
);

const markdownFiles: Readonly<Record<string, string>> = {
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_PRE_G2K_READINESS.md": report("Current 45 Exercise Knowledge Core Pre-G2K Readiness", "COMPLETE_AND_PROVEN",
    `All 45 original rows and all eight Package R rows are Knowledge-core complete. The registry contains 53 entries and ${completionSummary.knowledgeFactCountAfter} accepted facts. All six categories and provenance resolve, the original 45 and Package R fallbacks remain byte-equivalent, and current Product behavior is unchanged.\n\nCombined Pre-G2K fingerprint: \`${preG2KFingerprints.combined}\`.\n\nExact next dependency: \`${completionSummary.nextDependency}\`.`),
  "CURRENT_45_KNOWLEDGE_COMPLETION_ONTOLOGY_AUDIT.md": report("Current 45 Knowledge Completion Ontology Audit", "PASS",
    `The engine remains decision authority and Knowledge remains reusable educational truth.\n\n${table(["Measure", "Result"], Object.entries(completionSummary).map(([key, value]) => [key, value]))}`),
  "CURRENT_45_KNOWLEDGE_COMPLETION_OWNER_BOUNDARIES.md": report("Current 45 Knowledge Completion Owner Boundaries", "PRESERVED",
    `${table(["Exercise", "Deferred claim"], ownerBoundaries.flatMap((row) => row.unresolvedClaims.map((claim) => [row.exerciseId, claim])))}\n\nNo deferred non-production identity leaves a current production realization uncovered.`),
  "CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT.md": report("Current 45 Knowledge Completion Contract", "1.0.0",
    `${table(["Contract", "Version"], Object.values(PRE_G2K_CONTRACTS).map((contract) => [contract.contractId, contract.contractVersion]))}\n\nExactly 45 original entries migrate; eight Package R entries remain frozen; all 53 compact fallbacks are generated.`),
  "CURRENT_45_KNOWLEDGE_REALIZATION_OVERRIDE_REVIEW.md": report("Current 45 Knowledge Realization Override Review", "17_OF_17_REVIEWED", overrideTable),
  "CURRENT_45_KNOWLEDGE_PROVENANCE_REPORT.md": report("Current 45 Knowledge Provenance Report", "PASS", provenanceTable),
  "CURRENT_45_KNOWLEDGE_LANGUAGE_AND_CLAIMS_REVIEW.md": report("Current 45 Knowledge Language And Claims Review", "PASS",
    table(["Measure", "Result"], Object.entries(languageAndClaimsReview).map(([key, value]) => [key, value]))),
  "CURRENT_45_KNOWLEDGE_ENGINE_FACT_CONFLICT_REPORT.md": report("Current 45 Knowledge Engine Fact Conflict Report", "ZERO_CONFLICTS",
    `Movement roles, action functions, and stress references match the production catalog for all 53 entries.\n\nConflict count: ${engineFactConflicts.length}. No engine metadata was changed.`),
  "CURRENT_45_KNOWLEDGE_COMPACT_FALLBACK_EQUIVALENCE.md": report("Current 45 Knowledge Compact Fallback Equivalence", "BYTE_EQUIVALENT",
    `The frozen pre-completion matrix fingerprint remains \`${fallbackEquivalence.upstreamMatrixFingerprint}\`.\n\n${fallbackTable}`),
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_REGISTRY.md": report("Production 53 Exercise Knowledge Registry", "53_OF_53_COMPLETE", registryTable),
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_COMPLETENESS_MATRIX.md": report("Production 53 Exercise Knowledge Completeness Matrix", "53_OF_53_COMPLETE", completenessTable),
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_COACHING_RAIL_COMPATIBILITY.md": report("Production 53 Exercise Knowledge Coaching Rail Compatibility", "DATA_COMPATIBLE_UI_NOT_IMPLEMENTED",
    `${table(["Exercise", "Focus", "Cues", "Setup", "During", "Pattern", "Watch", "Result"], coachingRailCompatibility.map((row) => [row.exerciseId, row.focus, row.cues, row.setup, row.during, row.pattern, row.watchFor, row.result]))}\n\nNo Coaching Rail component was created.`),
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_LIBRARY_COMPATIBILITY.md": report("Production 53 Exercise Knowledge Library Compatibility", "DATA_COMPATIBLE_UI_NOT_IMPLEMENTED",
    `${table(["Exercise", "Mechanics", "Setup", "Pattern", "Watch", "Result"], libraryCompatibility.map((row) => [row.exerciseId, row.mechanicsReferences.join(", "), row.setupReferences, row.patternReferences, row.watchForReferences, row.result]))}\n\nLong-form articles, media, routes, and Library UI were not created.`),
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_RUNTIME_BOUNDARY.md": report("Production 53 Exercise Knowledge Runtime Boundary", "PASS",
    table(["Runtime boundary", "Count"], Object.entries(runtimeBoundary).map(([key, value]) => [key, value]))),
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_HOLDOUT_MANIFEST.md": report("Current 45 Exercise Knowledge Core Completeness V1 Holdout Manifest", "LOCKED_PASS",
    `Cases: ${holdoutManifest.length}\n\nFingerprint: \`${preG2KFingerprints.holdout}\`\n\nCoverage: 53 production identities, 45 migrated entries, eight frozen Package R entries, 17 realization audits, six categories, seven dose modes, five sections, nine equipment/task modes, four provenance types, fallback, conflict, clinical, runtime, Product invariance, and no-rescue.`),
  "CURRENT_45_KNOWLEDGE_MUTATION_REPORT.md": report("Current 45 Knowledge Mutation Report", "PASS",
    `Semantic mutations: ${mutationResults.length}. Rejected: ${mutationResults.filter((row) => row.rejected).length}. Accepted downstream rescues: ${mutationResults.reduce((sum, row) => sum + row.acceptedDownstreamRescueCount, 0)}.\n\n${table(["Mutation", "Changed", "Rejected", "Wrong layer", "Result"], mutationResults.map((row) => [row.id, row.semanticStructureChanged, row.rejected, row.wrongLayerCount, row.result]))}`),
  "CURRENT_45_KNOWLEDGE_METAMORPHIC_REPORT.md": report("Current 45 Knowledge Metamorphic Report", "PASS",
    `${table(["Invariant", "Passed"], metamorphicResults.invariants.map((row) => [row.id, row.passed]))}\n\n${table(["Material input", "Passed", "Baseline", "Changed"], metamorphicResults.materialResponses.map((row) => [row.id, row.passed, row.baseline, row.changed]))}`),
  "CURRENT_45_KNOWLEDGE_STRESS_REPORT.md": report("Current 45 Knowledge Stress Report", "PASS",
    table(["Evaluation", "Count"], Object.entries(stressResults).map(([key, value]) => [key, value]))),
  "CURRENT_45_KNOWLEDGE_ACTIVATION_GUARDS.md": report("Current 45 Knowledge Activation Guards", "PASS",
    table(["Guard", "Count"], Object.entries(activationGuards).map(([key, value]) => [key, value]))),
  "CURRENT_45_KNOWLEDGE_IMPLEMENTATION_READINESS.md": report("Current 45 Knowledge Implementation Readiness", completionSummary.classification,
    `${table(["Measure", "Result"], Object.entries(implementationReadiness).map(([key, value]) => [key, value]))}\n\nPre-G3 remains open. G and H remain open. Product delivery and activation remain zero.`),
};

const jsonFiles: Readonly<Record<string, unknown>> = {
  "ORIGINAL_45_ID_SET.json": original45ExactIdResult,
  "WAVE_MANIFESTS.json": waveManifests,
  "PRODUCTION_53_EXERCISE_KNOWLEDGE_REGISTRY.json": PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId),
  "KNOWLEDGE_ENTRIES.json": PRODUCTION_53_KNOWLEDGE_ENTRIES,
  "FACT_REGISTRY.json": PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts),
  "PRESENTATION_MAPS.json": PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.presentation),
  "REALIZATION_OVERRIDES.json": PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides),
  "PROVENANCE.json": provenanceRegistry,
  "FALLBACK_BEFORE_AFTER.json": { before: fallbackBefore, after: fallbackAfter, equivalence: fallbackEquivalenceRows },
  "COMPLETENESS_MATRIX.json": completenessMatrix,
  "ENGINE_CONFLICT_FINDINGS.json": engineFactConflicts,
  "CONTROLLED_SCENARIOS.json": controlledScenarios,
  "FIXED_SHELL_COHORTS.json": fixedShellCohorts,
  "MUTATIONS.json": mutationResults,
  "METAMORPHIC_RESULTS.json": metamorphicResults,
  "STRESS.json": stressResults,
  "FINGERPRINTS.json": { upstream: upstreamFingerprints, preG2K: preG2KFingerprints },
  "ACTIVATION_GUARDS.json": activationGuards,
};

export function renderedCurrent45KnowledgeReports(): Readonly<Record<string, string>> {
  return Object.freeze({
    ...Object.fromEntries(Object.entries(markdownFiles).map(([name, content]) => [resolve(docsRoot, name), content])),
    ...Object.fromEntries(Object.entries(jsonFiles).map(([name, value]) => [resolve(jsonRoot, name), pretty(value)])),
    [resolve(docsRoot, "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_HOLDOUT_MANIFEST.json")]: pretty(holdoutManifest),
  });
}

export function current45KnowledgeReportStatus() {
  const rendered = renderedCurrent45KnowledgeReports();
  const stale = Object.entries(rendered).filter(([path, content]) => !existsSync(path) || readFileSync(path, "utf8") !== content).map(([path]) => path);
  return Object.freeze({ fileCount: Object.keys(rendered).length, stale: Object.freeze(stale), fingerprint: knowledgeCompletionFingerprint(rendered) });
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) {
  const mode = process.argv[2] ?? "--print";
  const rendered = renderedCurrent45KnowledgeReports();
  if (mode === "--write") {
    mkdirSync(docsRoot, { recursive: true });
    mkdirSync(jsonRoot, { recursive: true });
    for (const [path, content] of Object.entries(rendered)) writeFileSync(path, content, "utf8");
    process.stdout.write(`wrote ${Object.keys(rendered).length} deterministic Pre-G2K reports\n`);
  } else if (mode === "--check") {
    const status = current45KnowledgeReportStatus();
    if (status.stale.length) throw new Error(`CURRENT_45_KNOWLEDGE_REPORTS_STALE:${status.stale.join(",")}`);
    process.stdout.write(`Pre-G2K reports current: ${status.fileCount}; fingerprint=${status.fingerprint}\n`);
  } else {
    process.stdout.write(pretty({ files: Object.keys(rendered).sort(), fingerprints: preG2KFingerprints }));
  }
}
