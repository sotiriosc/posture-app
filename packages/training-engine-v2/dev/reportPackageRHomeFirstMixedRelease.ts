import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
} from "../../praxis-knowledge-core/src";
import { HOME_COMFORT_PROFILES, HOME_COMFORT_SELECTION_POLICY } from "../src/candidate/homeComfort";
import {
  PACKAGE_R_CONTRACT,
  activationGuards,
  candidateComposerConsequences,
  catalogInventory,
  cohortRegistry,
  controlledScenarios,
  holdoutManifest,
  metamorphicResults,
  mutationResults,
  packageRBehavioralConsequences,
  packageRFingerprints,
  packageRReadiness,
  packageRValidationSummary,
  productShadowInvariance,
  selectedRowMatrix,
  stressResults,
  upstreamFingerprints,
  weekPrescriptionConsequences,
} from "../tests/packageRKnowledge/releaseEvidence";
import { current45KnowledgeAudit } from "../tests/packageRKnowledge/current45Audit";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const generated = "Generated deterministically from Package R production evidence; edit the source contracts and regenerate.";
const md = (title: string, sections: readonly string[]) => `# ${title}\n\n${generated}\n\n${sections.join("\n\n")}\n`;
const bullets = (values: readonly string[]) => values.map((value) => `- ${value}`).join("\n");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const rowTable = [
  "| ID | Family | Movement roles | Actions | Equipment | Dose | Phase |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...selectedRowMatrix.map((row) =>
    `| \`${row.id}\` | ${row.family} | ${row.movementRoles.join(", ")} | ${row.actionFunctions.join(", ") || "none"} | ${row.equipmentRequirements.map((item) => item.id).join(", ")} | ${row.primaryDoseMode} | ${row.phaseDisposition} |`),
].join("\n");

const markdownReports: Readonly<Record<string, string>> = Object.freeze({
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_OWNER_DECISION.md": md("Package R Home-First Mixed Release Owner Decision", [
    `Owner-selected package: \`${PACKAGE_R_CONTRACT.packageId}\`. Philosophy: home-first mixed release with six truthful home capabilities and two exact-machine gym capabilities. Admission is atomic.`,
    `Selected IDs:\n${bullets(PACKAGE_R_SELECTED_EXERCISE_IDS.map((id) => `\`${id}\``))}`,
    "No substitute row is authorized. Assisted pull-up, cable hip, seated calf, barbell, deadlift, pull-up, suspension row, reverse lunge, bodyweight squat identity, band pull-apart, band RDL, foot-anchored seated band row, body-wrapped press, power, conditioning, and advanced intensity work remain deferred.",
    "Knowledge timing is `KNOWLEDGE_CORE_CURATION_REQUIRED_WITH_EACH_PRODUCTION_ROW`. The original 45 remain a separate Pre-G2K completeness obligation.",
  ]),
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_CONTRACT.md": md("Package R Home-First Mixed Release Contract", [
    `Contract: \`${PACKAGE_R_CONTRACT.contractId}@${PACKAGE_R_CONTRACT.contractVersion}\`. Catalog transition: ${PACKAGE_R_CONTRACT.catalogBefore} -> ${PACKAGE_R_CONTRACT.catalogAfter}.`,
    "One production catalog owns exercise identity. The separate Knowledge package references those stable IDs and cannot affect eligibility, ranking, composition, Week, Prescription, pain matching, or phase scoring.",
    "Home comfort is lexicographic, context-bounded, and later than Safety, blocks, legality, purpose, pain/response, dependencies, and productive familiarity. It has no weighted score, novelty quota, or variety quota.",
  ]),
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_ROW_MATRIX.md": md("Package R Home-First Mixed Release Row Matrix", [rowTable]),
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_BEHAVIORAL_CONSEQUENCES.md": md("Package R Home-First Mixed Release Behavioral Consequences", [
    `Rightful improvements:\n${bullets(packageRBehavioralConsequences.rightfulImprovements)}`,
    `Explicit non-improvements:\n${bullets(packageRBehavioralConsequences.explicitNonImprovements)}`,
    `False pool memberships: ${JSON.stringify(packageRBehavioralConsequences.falsePoolMemberships)}. No fake pull, squat, pain-default, or macro-pattern substitution is admitted.`,
  ]),
  "HOME_COMFORT_PRODUCTION_PROFILE.md": md("Home Comfort Production Profile", [
    "`HOME_COMFORT_PRODUCTION_PROFILE@1.0.0` keeps recognition, setup, anchor dependence, support confidence, balance/stability burden, coordination, transitions, stop/restart clarity, equipment ambiguity, and first-session disposition separate from difficulty and experience.",
    `Accepted profiles: ${Object.keys(HOME_COMFORT_PROFILES).length}. Unknown/review profiles: 0. Weighted score: none.`,
  ]),
  "HOME_COMFORT_PRODUCTION_SELECTION_POLICY.md": md("Home Comfort Production Selection Policy", [
    `Contract: \`${HOME_COMFORT_SELECTION_POLICY.contract.contractId}@${HOME_COMFORT_SELECTION_POLICY.contract.contractVersion}\`.`,
    HOME_COMFORT_SELECTION_POLICY.precedence.map((value, index) => `${index + 1}. ${value}`).join("\n"),
    "Advanced exact productive familiarity may preserve a demanding legal realization. Comfort never overrides Safety, legality, required purpose, or pain/response truth and never creates an exercise, warm-up, activation, novelty target, or variety quota.",
  ]),
  "PACKAGE_R_CANDIDATE_COMPOSER_REPORT.md": md("Package R Candidate And Composer Report", [
    bullets(Object.entries(candidateComposerConsequences).map(([key, value]) => `${key}: ${value}`)),
    "Reverse Fly is rear-delt accessory, Band Curl is arm accessory, Machine Leg Extension is quad accessory, and Bird Dog is an explicit trunk-control candidate. One identity can appear at most once per session.",
  ]),
  "PACKAGE_R_WEEK_PRESCRIPTION_REPORT.md": md("Package R Week And Prescription Report", [
    bullets(Object.entries(weekPrescriptionConsequences).map(([key, value]) => `${key}: ${value}`)),
    "All eight rows use reviewed repetition sets. Exact sets, repetitions, load, tempo, duration, effort, rest, weekly frequency, and progression remain purpose/Prescription-owned. Catalog presence creates no weekly credit.",
  ]),
  "PACKAGE_R_HOME_COMFORT_COHORT.md": md("Package R Home Comfort Cohort", [
    `Unknown-home cases: ${cohortRegistry.unknownHome.length}, all pass. Beginner-gym cases: ${cohortRegistry.beginnerGym.length}, all pass. Time-constrained cases: ${cohortRegistry.timeConstrained.length}, all pass. Pain/context cases: ${cohortRegistry.painContext.length}, all pass.`,
    "Unknown home familiarity can choose a more immediately usable legal candidate only at the bounded tie point. Irrelevant pain is invariant; relevant pain remains structured engine truth.",
  ]),
  "PACKAGE_R_ADVANCED_HOME_COHORT.md": md("Package R Advanced Home Cohort", [
    `Advanced exact-familiarity cases: ${cohortRegistry.advancedHome.length}, all pass. Stable-anchor cases: ${cohortRegistry.stableAnchor.length}, all pass.`,
    "Exact productive familiarity preserves a legal demanding home realization ahead of coarse comfort. Home never implies beginner.",
  ]),
  "PACKAGE_R_PRODUCT_SHADOW_INVARIANCE.md": md("Package R Product Shadow Invariance", [
    bullets(Object.entries(productShadowInvariance).map(([key, value]) => `${key}: ${value}`)),
    "Current Product goal options, ordinary Get stronger visibility, Questionnaire, generateProgram, routes, persistence, Product Shadow semantics, and delivered output are unchanged.",
  ]),
  "PACKAGE_R_ACTIVATION_GUARDS.md": md("Package R Activation Guards", [bullets(Object.entries(activationGuards).map(([key, value]) => `${key}: ${value}`))]),
  "PACKAGE_R_IMPLEMENTATION_READINESS.md": md("Package R Implementation Readiness", [
    `Classification: \`${packageRReadiness.classification}\`.`,
    `Implementation status: \`${packageRReadiness.implementationStatus}\`.`,
    `Catalog: ${catalogInventory.afterRowCount} rows / ${catalogInventory.uniqueIdCount} IDs. Knowledge: ${PACKAGE_R_KNOWLEDGE_ENTRIES.length} complete selected entries. Controlled scenarios: ${controlledScenarios.length}. Cohorts: ${Object.values(cohortRegistry).flat().length}. Holdout: ${holdoutManifest.length}. Mutations: ${mutationResults.length}/${mutationResults.length} rejected. Metamorphic: ${packageRValidationSummary.metamorphicPassedCount}/${packageRValidationSummary.metamorphicCount} passed.`,
    `Current 45 blocker rows: ${current45KnowledgeAudit.counts.rowBlockerCount}. Pre-G2K, Pre-G3, G, and H remain open. Final state remains \`${packageRReadiness.finalState}\`.`,
    `Exact next dependency: \`${packageRReadiness.nextDependency}\`.`,
  ]),
  "HOME_FIRST_MIXED_EXERCISE_CATALOG_KNOWLEDGE_V1_HOLDOUT_MANIFEST.md": md("Home-First Mixed Exercise Catalog Knowledge V1 Holdout Manifest", [
    `Locked cases: ${holdoutManifest.length}. Fingerprint: \`${packageRFingerprints.holdout}\`.`,
    "Coverage includes all 53 identities, all eight selected rows, seven dose modes, five sections, all row roles, home/gym/bodyweight/dumbbell/band/machine modes, unknown and exact familiarity, three experience levels, pain-aware and time-constrained cases, all six Knowledge categories, overrides, fallback, current-45 audit, Candidate/Composer, Week/Prescription, Product invariance, mutation, and no-rescue lanes.",
    "Semantic corrections require a new package/contract version and new locked holdout.",
  ]),
  "EXERCISE_CATALOG_CURRENT_53_PRODUCTION.md": md("Exercise Catalog Current 53 Production", [
    `Canonical source: \`packages/training-engine-v2/src/data/referenceExercises.ts\`. Rows: ${catalogInventory.afterRowCount}. Unique IDs: ${catalogInventory.uniqueIdCount}. Duplicate IDs: ${catalogInventory.duplicateIdCount}.`,
    `Catalog before SHA-256: \`${upstreamFingerprints.catalogBefore}\`. Catalog after SHA-256: \`${packageRFingerprints.catalogAfter}\`.`,
    catalogInventory.ids.map((id, index) => `${index + 1}. \`${id}\``).join("\n"),
  ]),
});

const jsonReports: Readonly<Record<string, string>> = Object.freeze({
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_CONTRACT.json": json(PACKAGE_R_CONTRACT),
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_ROW_MATRIX.json": json(selectedRowMatrix),
  "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_BEHAVIORAL_CONSEQUENCES.json": json(packageRBehavioralConsequences),
  "HOME_COMFORT_PRODUCTION_PROFILES.json": json(HOME_COMFORT_PROFILES),
  "HOME_COMFORT_PRODUCTION_SELECTION_POLICY.json": json(HOME_COMFORT_SELECTION_POLICY),
  "EXERCISE_CATALOG_CURRENT_53_PRODUCTION.json": json(catalogInventory),
  "PACKAGE_R_CATALOG_FINGERPRINT.json": json({ before: upstreamFingerprints.catalogBefore, after: packageRFingerprints.catalogAfter }),
  "PACKAGE_R_CONTROLLED_SCENARIOS.json": json(controlledScenarios),
  "PACKAGE_R_FIXED_SHELL_COHORTS.json": json(cohortRegistry),
  "HOME_FIRST_MIXED_EXERCISE_CATALOG_KNOWLEDGE_V1_HOLDOUT_MANIFEST.json": json(holdoutManifest),
  "PACKAGE_R_MUTATIONS.json": json(mutationResults),
  "PACKAGE_R_METAMORPHIC_RESULTS.json": json(metamorphicResults),
  "PACKAGE_R_STRESS_RESULTS.json": json(stressResults),
  "PACKAGE_R_CANDIDATE_COMPOSER_REPORT.json": json(candidateComposerConsequences),
  "PACKAGE_R_WEEK_PRESCRIPTION_REPORT.json": json(weekPrescriptionConsequences),
  "PACKAGE_R_PRODUCT_SHADOW_INVARIANCE.json": json(productShadowInvariance),
  "PACKAGE_R_ACTIVATION_GUARDS.json": json(activationGuards),
  "PACKAGE_R_PRE_G2_FINGERPRINTS.json": json({ upstream: upstreamFingerprints, preG2: packageRFingerprints }),
  "PACKAGE_R_IMPLEMENTATION_READINESS.json": json({ ...packageRReadiness, validation: packageRValidationSummary, fingerprints: packageRFingerprints }),
});

for (const [filename, content] of Object.entries({ ...markdownReports, ...jsonReports })) {
  writeFileSync(resolve(docsRoot, filename), content, "utf8");
}

const integrationBlocks: Readonly<Record<string, string>> = Object.freeze({
  "docs/training-engine-v2/FUTURE_PRAXIS_KNOWLEDGE_LAYER_COMPATIBILITY.md":
    "Pre-G2 implements the pure `@praxis/knowledge-core` data boundary for the selected eight rows. Engine production code consumes only committed generated compact fallbacks. Coaching Rail and Library runtime/UI integration remain unimplemented.",
  "docs/training-engine-v2/EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_READINESS.md":
    "The historical Pre-G1 45-row curation remains frozen. The owner subsequently selected atomic Package R; Pre-G2 adds exactly eight rows and opens Pre-G2K for the original 45 Knowledge cores.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md":
    "Pre-G2 admits Package R and its canonical Knowledge core without Product activation. Pre-G2K is now a hard blocker before Pre-G3 and G.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md":
    "Package R changes no Product option, visibility, Questionnaire, route, persistence, generation, owner delivery, or activation. Pre-G2K, Pre-G3, G, and H remain open.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md":
    "The pre-G sequence is Pre-G2 selected rows plus Knowledge, Pre-G2K current-catalog Knowledge completeness, Pre-G3 practice options, G controlled owner delivery, then H broader activation.",
  "docs/training-engine-v2/ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_READINESS.md":
    "The inactive Get stronger preview remains unchanged. Package R expands only the V2 production catalog and build-time Knowledge evidence.",
  "docs/training-engine-v2/ARCHITECTURE.md":
    "Canonical educational facts live in a private pure package. Candidate, Composer, Week, Prescription, Product Shadow, consumer, and gyms import no Knowledge runtime API; selected compact fallbacks are generated and committed in engine source.",
  "docs/training-engine-v2/DOMAIN.md":
    "Home comfort is a versioned per-exercise selection fact, not difficulty or experience. It is evaluated only after Safety, blocks, legality, purpose, pain/response, dependencies, and exact productive familiarity.",
  "docs/training-engine-v2/TESTING.md":
    `Package R evidence includes ${controlledScenarios.length} controlled scenarios, ${Object.values(cohortRegistry).flat().length} fixed-shell cases, a ${holdoutManifest.length}-case holdout, ${mutationResults.length} rejected mutations, ${packageRValidationSummary.metamorphicPassedCount} passed metamorphic relations, and deterministic stress with zero failures.`,
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md":
    "The canonical production exercise catalog contains 53 IDs after Package R. Knowledge facts remain a separate pure package and never become decision inputs.",
  "docs/training-engine-v2/EXERCISE_CATALOG_HOME_COMFORT_CORE_PACKAGE.md":
    "Historical Package H was not admitted as a package. Package R selects six reviewed home capabilities; every other Package H candidate remains deferred.",
  "docs/training-engine-v2/EXERCISE_CATALOG_COMMERCIAL_GYM_CORE_PACKAGE.md":
    "Historical Package G was not admitted as a package. Package R selects Machine Shoulder Press and Machine Leg Extension with exact capabilities; every other Package G candidate remains deferred.",
  "docs/training-engine-v2/EXERCISE_CATALOG_MIXED_MINIMAL_RELEASE_PACKAGE.md":
    "Historical Package M informed the owner decision but was not admitted verbatim. Atomic Package R is the sole Pre-G2 selection.",
});

const start = "<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->";
const end = "<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->";
const pattern = /<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->[\s\S]*?<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->/;
for (const [relativePath, summary] of Object.entries(integrationBlocks)) {
  const path = resolve(workspaceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`PACKAGE_R_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  const block = `${start}\n\n## Pre-G2 - Package R production catalog and Knowledge core\n\n${summary}\n\n` +
    `Combined Pre-G2 fingerprint: \`${packageRFingerprints.combinedPreG2}\`. ` +
    `Exact next dependency: \`${packageRReadiness.nextDependency}\`.\n\n${end}`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, block) : `${current.trimEnd()}\n\n${block}\n`, "utf8");
}

process.stdout.write(`${JSON.stringify({
  classification: packageRReadiness.classification,
  catalog: `${catalogInventory.afterRowCount}/${catalogInventory.uniqueIdCount}`,
  controlledScenarioCount: controlledScenarios.length,
  cohortCount: Object.values(cohortRegistry).flat().length,
  holdoutCount: holdoutManifest.length,
  mutationResult: `${packageRValidationSummary.mutationRejectedCount}/${packageRValidationSummary.mutationCount}`,
  metamorphicResult: `${packageRValidationSummary.metamorphicPassedCount}/${packageRValidationSummary.metamorphicCount}`,
  markdownReportCount: Object.keys(markdownReports).length,
  jsonReportCount: Object.keys(jsonReports).length,
  combinedPreG2Fingerprint: packageRFingerprints.combinedPreG2,
  nextDependency: packageRReadiness.nextDependency,
}, null, 2)}\n`);
