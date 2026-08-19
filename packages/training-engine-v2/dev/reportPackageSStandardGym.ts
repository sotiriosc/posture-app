import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGE_S_KNOWLEDGE_ENTRIES,
  PACKAGE_S_SELECTED_EXERCISE_IDS,
  PRODUCTION_64_KNOWLEDGE_ENTRIES,
  projectCompactFallbacks,
} from "../../praxis-knowledge-core/src";
import { HOME_COMFORT_PROFILES } from "../src/candidate/homeComfort";
import {
  STANDARD_GYM_COMFORT_POLICY,
  STANDARD_GYM_COMFORT_PROFILES,
} from "../src/candidate/standardGymComfort";
import { MACHINE_IDS } from "../src/domain/equipment";
import { PRESS_SUPPORT_ANGLE_REALIZATIONS } from "../src/domain/pressAngleRealization";
import { PULL_UP_ASSISTANCE_REALIZATIONS } from "../src/domain/assistanceRealization";
import {
  PACKAGE_S_ID,
  PACKAGE_S_MACHINE_MECHANISM_POLICY,
  PACKAGE_S_NEW_MACHINE_IDS,
  PRE_PACKAGE_S_MACHINE_IDS,
} from "../tests/packageS/foundationEvidence";
import {
  PACKAGE_S_CONTRACT,
  activationGuards,
  candidateComposerConsequences,
  catalogInventory,
  cohortRegistry,
  controlledScenarios,
  gapAudit,
  holdoutManifest,
  metamorphicResults,
  mutationResults,
  packageSFingerprints,
  packageSReadiness,
  packageSValidationSummary,
  productShadowInvariance,
  selectedRowMatrix,
  stressResults,
  weekPrescriptionConsequences,
} from "../tests/packageS/releaseEvidence";

const check = process.argv.includes("--check");
const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const generated = "Generated deterministically from Package S production evidence; edit the source contracts and regenerate.";
const md = (title: string, sections: readonly string[]) => `# ${title}\n\n${generated}\n\n${sections.join("\n\n")}\n`;
const bullets = (values: readonly string[]) => values.map((value) => `- ${value}`).join("\n");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const rowTable = [
  "| ID | Roles | Actions | Exact equipment | Dose | Support |",
  "| --- | --- | --- | --- | --- | --- |",
  ...selectedRowMatrix.map((row) => `| \`${row.id}\` | ${row.movementRoles.join(", ")} | ${row.actionFunctions.join(", ")} | ${row.equipmentRequirements.map((item) => item.id).join(", ")} | ${row.primaryDoseMode} | ${row.support?.basePosition ?? "unknown"} |`),
].join("\n");

function curationReport(exerciseId: string): string {
  const row = selectedRowMatrix.find((candidate) => candidate.id === exerciseId)!;
  const knowledge = PACKAGE_S_KNOWLEDGE_ENTRIES.find((candidate) => candidate.exerciseId === exerciseId)!;
  return md(`${row.name} Production Curation`, [
    `Canonical identity: \`${row.id}\`. Family: \`${row.family}\`. Movement roles: ${row.movementRoles.map((value) => `\`${value}\``).join(", ")}. Actions: ${row.actionFunctions.map((value) => `\`${value}\``).join(", ")}.`,
    `Exact equipment requirements: ${row.equipmentRequirements.map((value) => `\`${value.id}\``).join(", ")}. Support: \`${row.support?.basePosition ?? "unknown"}\` / \`${row.support?.supportAmount ?? "unknown"}\`. Resistance: \`${row.resistancePath?.resistancePath ?? "unknown"}\`.`,
    `Primary dose mode: \`${row.primaryDoseMode}\`. Legal progression axes: ${row.progressionAxes.map((value) => `\`${value}\``).join(", ")}. Every transition is contextual and has no automatic selection effect.`,
    `Knowledge: ${knowledge.facts.length} accepted facts and ${knowledge.realizationOverrides.length} realization overrides across focus, cues, setup, during, pattern, and watchFor. Compact fallback is generated from canonical fact references.`,
    "Machine support, familiarity, prose, and catalog presence create no safety claim, objective, score bonus, automatic progression, or automatic replacement.",
  ]);
}

const markdownReports: Readonly<Record<string, string>> = Object.freeze({
  "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_ROW_MATRIX.md": md("Package S Standard Commercial-Gym Foundations Row Matrix", [rowTable, "All 11 rows are atomic. Exact machine or cable capability is required, and no unselected identity is admitted."]),
  "PULL_UP_PRODUCTION_CURATION.md": curationReport("pull-up"),
  "HACK_SQUAT_PRODUCTION_CURATION.md": curationReport("hack-squat"),
  "SEATED_LEG_CURL_PRODUCTION_CURATION.md": curationReport("seated-leg-curl"),
  "MACHINE_CHEST_FLY_PRODUCTION_CURATION.md": curationReport("machine-chest-fly"),
  "MACHINE_HIP_ADDUCTION_PRODUCTION_CURATION.md": curationReport("machine-hip-adduction"),
  "MACHINE_HIP_ABDUCTION_PRODUCTION_CURATION.md": curationReport("machine-hip-abduction"),
  "SEATED_CALF_RAISE_PRODUCTION_CURATION.md": curationReport("seated-calf-raise"),
  "MACHINE_HIP_THRUST_PRODUCTION_CURATION.md": curationReport("machine-hip-thrust"),
  "CABLE_LATERAL_RAISE_PRODUCTION_CURATION.md": curationReport("cable-lateral-raise"),
  "OVERHEAD_CABLE_TRICEPS_EXTENSION_PRODUCTION_CURATION.md": curationReport("overhead-cable-triceps-extension"),
  "STRAIGHT_ARM_CABLE_PULLDOWN_PRODUCTION_CURATION.md": curationReport("straight-arm-cable-pulldown"),
  "PACKAGE_S_CANDIDATE_COMPOSER_REPORT.md": md("Package S Candidate And Composer Report", [bullets(Object.entries(candidateComposerConsequences).map(([key, value]) => `${key}: ${value}`)), "Exact capability gates eligibility. Pull-Up, incline dumbbell press, and incline machine press each retain one source identity; time constraints remove redundancy without creating generic support work."]),
  "PACKAGE_S_WEEK_PRESCRIPTION_REPORT.md": md("Package S Week And Prescription Report", [bullets(Object.entries(weekPrescriptionConsequences).map(([key, value]) => `${key}: ${value}`)), "Catalog presence, machine availability, and angle create no weekly objective. Numeric policy remains purpose-owned; assistance and press angle remain realization-owned."]),
  "PACKAGE_S_STANDARD_GYM_COMFORT_REPORT.md": md("Package S Standard-Gym Comfort Report", [
    `Contract: \`${STANDARD_GYM_COMFORT_POLICY.contract.contractId}@${STANDARD_GYM_COMFORT_POLICY.contract.contractVersion}\`. Profiles: ${Object.keys(STANDARD_GYM_COMFORT_PROFILES).length}.`,
    STANDARD_GYM_COMFORT_POLICY.precedence.map((value, index) => `${index + 1}. ${value}`).join("\n"),
    "The signal is a late lexicographic tie preference only. It requires exact machine capability and unknown or limited familiarity, preserves productive anchors, has no weighted total, and never means machines are safer or mandatory.",
  ]),
  "PACKAGE_S_INCLINE_PRESS_COHORT.md": md("Package S Incline Press Cohort", [
    `Cases: ${cohortRegistry.incline.length}; all pass. Dumbbell incline remains \`dumbbell-bench-press\`; fixed-machine incline remains \`machine-chest-press\`.`,
    "Angle selection requires explicit realization preference or productive continuity and exact bench/machine capability. No upper-chest guarantee, scoring bonus, random variation, phase inference, or automatic rotation exists.",
  ]),
  "PACKAGE_S_PULL_UP_COHORT.md": md("Package S Pull-Up Cohort", [
    `Cases: ${cohortRegistry.pullUp.length}; all pass. One \`pull-up\` identity supports \`bodyweight-unassisted\` and \`machine-assisted\`.`,
    "Machine assistance is not external load. Exact and unknown settings remain truthful, each assignment emits one source event, and neither assistance reduction nor transition to unassisted is automatic.",
  ]),
  "PACKAGE_S_PRODUCT_SHADOW_INVARIANCE.md": md("Package S Product Shadow Invariance", [bullets(Object.entries(productShadowInvariance).map(([key, value]) => `${key}: ${value}`)), "Product, Product Shadow, current routes, Get stronger visibility, Full/Lighter/Recovery, owner delivery, and activation are unchanged."]),
  "REMAINING_STANDARD_GYM_CATALOG_GAPS.md": md("Remaining Standard-Gym Catalog Gaps", [
    ["| Gap | Classification | Required before owner delivery |", "| --- | --- | --- |", ...gapAudit.map((entry) => `| \`${entry.id}\` | ${entry.classification} | no |`)].join("\n"),
    "This is a read-only audit. No listed gap is admitted and none is necessary for truthful owner delivery from the 64-row catalog.",
  ]),
  "PACKAGE_S_ACTIVATION_GUARDS.md": md("Package S Activation Guards", [bullets(Object.entries(activationGuards).map(([key, value]) => `${key}: ${value}`))]),
  "PACKAGE_S_IMPLEMENTATION_READINESS.md": md("Package S Implementation Readiness", [
    `Classification: \`${packageSReadiness.classification}\`.`,
    `Implementation status: \`${packageSReadiness.implementationStatus}\`. Catalog: ${catalogInventory.beforeRowCount} -> ${catalogInventory.afterRowCount}; Knowledge: 53 -> ${PRODUCTION_64_KNOWLEDGE_ENTRIES.length}.`,
    `Controlled scenarios: ${controlledScenarios.length}. Fixed-shell cohorts: ${packageSValidationSummary.cohortCount}. Holdout: ${holdoutManifest.length}. Mutations: ${packageSValidationSummary.mutationRejectedCount}/${packageSValidationSummary.mutationCount}. Metamorphic: ${packageSValidationSummary.metamorphicPassedCount}/${packageSValidationSummary.metamorphicCount}. Stress failures: ${stressResults.failureCount}.`,
    `Pre-G3, G, and H remain open. Final state: \`${packageSReadiness.finalState}\`. Exact next dependency: \`${packageSReadiness.nextDependency}\`.`,
  ]),
  "STANDARD_COMMERCIAL_GYM_FOUNDATIONS_INCLINE_PRESS_V1_HOLDOUT_MANIFEST.md": md("Standard Commercial-Gym Foundations And Incline Press V1 Holdout Manifest", [
    `Locked scenarios: ${holdoutManifest.length}. SHA-256: \`${packageSFingerprints.holdout}\`.`,
    "Coverage includes all 64 identities, 11 selected rows, seven dose modes, five sections, all selected machine IDs, both incline paths, both Pull-Up assistance states, exact/unknown capability, all experience levels, pain/context, time constraints, Knowledge, Candidate/Composer/Week/Prescription, Product Shadow invariance, mutations, and no-rescue.",
    "Any semantic correction requires a new package/version and holdout.",
  ]),
  "PRODUCTION_64_EXERCISE_KNOWLEDGE_COACHING_RAIL_COMPATIBILITY.md": md("Production 64 Exercise Knowledge Coaching Rail Compatibility", ["All 64 Knowledge entries expose canonical focus, cues, setup, during, pattern, watchFor, provenance, realization overrides, related mechanics/actions/stress, optional non-diagnostic pain topics, and compact fallback references. Coaching Rail UI remains unbuilt."]),
  "PRODUCTION_64_EXERCISE_KNOWLEDGE_LIBRARY_COMPATIBILITY.md": md("Production 64 Exercise Knowledge Library Compatibility", ["All 64 stable exercise IDs resolve to complete canonical Knowledge. No Library route, public UI, CMS, database, network integration, article, diagram, or video is added."]),
});

const jsonReports: Readonly<Record<string, string>> = Object.freeze({
  "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_CONTRACT.json": json(PACKAGE_S_CONTRACT),
  "PACKAGE_S_SELECTED_IDS.json": json({ packageId: PACKAGE_S_ID, selectedIds: PACKAGE_S_SELECTED_EXERCISE_IDS }),
  "PACKAGE_S_MACHINE_ID_REGISTRY_BEFORE_AFTER.json": json({ before: PRE_PACKAGE_S_MACHINE_IDS, added: PACKAGE_S_NEW_MACHINE_IDS, after: MACHINE_IDS, mechanisms: PACKAGE_S_MACHINE_MECHANISM_POLICY }),
  "PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT.json": json({ contract: PRESS_SUPPORT_ANGLE_REALIZATIONS[0]?.contract, realizations: PRESS_SUPPORT_ANGLE_REALIZATIONS }),
  "PACKAGE_S_INCLINE_REALIZATIONS.json": json(PRESS_SUPPORT_ANGLE_REALIZATIONS),
  "PULL_UP_ASSISTANCE_REALIZATIONS.json": json(PULL_UP_ASSISTANCE_REALIZATIONS),
  "PACKAGE_S_KNOWLEDGE_ENTRIES.json": json(PACKAGE_S_KNOWLEDGE_ENTRIES),
  "PRODUCTION_64_KNOWLEDGE_FALLBACKS.json": json(projectCompactFallbacks(PRODUCTION_64_KNOWLEDGE_ENTRIES)),
  "PACKAGE_S_CATALOG_BEFORE_AFTER.json": json(catalogInventory),
  "PACKAGE_S_CONTROLLED_SCENARIOS.json": json(controlledScenarios),
  "PACKAGE_S_FIXED_SHELL_COHORTS.json": json(cohortRegistry),
  "STANDARD_COMMERCIAL_GYM_FOUNDATIONS_INCLINE_PRESS_V1_HOLDOUT_MANIFEST.json": json(holdoutManifest),
  "PACKAGE_S_MUTATIONS.json": json(mutationResults),
  "PACKAGE_S_METAMORPHIC_RESULTS.json": json(metamorphicResults),
  "PACKAGE_S_STRESS_RESULTS.json": json(stressResults),
  "REMAINING_STANDARD_GYM_CATALOG_GAPS.json": json(gapAudit),
  "PACKAGE_S_FINGERPRINTS.json": json(packageSFingerprints),
  "PACKAGE_S_ACTIVATION_GUARDS.json": json(activationGuards),
  "PACKAGE_S_IMPLEMENTATION_READINESS.json": json({ ...packageSReadiness, validation: packageSValidationSummary, fingerprints: packageSFingerprints }),
  "PACKAGE_S_STANDARD_GYM_COMFORT.json": json({ policy: STANDARD_GYM_COMFORT_POLICY, profiles: STANDARD_GYM_COMFORT_PROFILES, homeProfileCount: Object.keys(HOME_COMFORT_PROFILES).length }),
});

const foundationReports = Object.freeze([
  "STANDARD_GYM_FOUNDATIONS_INCLINE_PRESS_ONTOLOGY_AUDIT.md",
  "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_OWNER_DECISION.md",
  "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_CONTRACT.md",
  "PRESS_SUPPORT_ANGLE_REALIZATION_CONTRACT.md",
  "DUMBBELL_BENCH_PRESS_INCLINE_REALIZATION.md",
  "MACHINE_CHEST_PRESS_INCLINE_REALIZATION.md",
  "PULL_UP_ASSISTANCE_REALIZATION.md",
  "STANDARD_GYM_MACHINE_CAPABILITY_EXPANSION.md",
  "PACKAGE_S_KNOWLEDGE_COMPLETENESS.md",
]);

function persist(path: string, expected: string): void {
  if (check) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== expected) {
      throw new Error(`PACKAGE_S_REPORT_STALE:${path}`);
    }
    return;
  }
  writeFileSync(path, expected, "utf8");
}

for (const filename of foundationReports) {
  if (!existsSync(resolve(docsRoot, filename))) throw new Error(`PACKAGE_S_FOUNDATION_REPORT_REQUIRED:${filename}`);
}
for (const [filename, content] of Object.entries({ ...markdownReports, ...jsonReports })) {
  persist(resolve(docsRoot, filename), content);
}

const integrationBlocks: Readonly<Record<string, string>> = Object.freeze({
  "docs/training-engine-v2/CURRENT_45_EXERCISE_KNOWLEDGE_CORE_PRE_G2K_READINESS.md": "Pre-G2K remains completed. Pre-G2L preserves its closed 53-entry historical baseline, adds only the authorized machine-chest-press incline realization to the current corpus, and expands the canonical registry to 64 complete entries.",
  "docs/training-engine-v2/PACKAGE_R_IMPLEMENTATION_READINESS.md": "Pre-G2 Package R remains completed and frozen. Pre-G2L adds exactly the separately authorized 11-row Package S without reopening or redesigning Package R.",
  "docs/training-engine-v2/EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_READINESS.md": "The canonical catalog now contains 64 unique production identities. Package S adds standard-commercial-gym foundations, while incline dumbbell/machine press and Pull-Up assistance remain typed realizations rather than duplicate identities.",
  "docs/training-engine-v2/FUTURE_PRAXIS_KNOWLEDGE_LAYER_COMPATIBILITY.md": "The production Knowledge registry now contains 64 complete entries and generates all 64 compact fallbacks. Knowledge remains non-decisional prose and no Coaching Rail or Library runtime is activated.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md": "Pre-G2L completes standard-commercial-gym foundations and typed incline/Pull-Up realizations without changing Product architecture. Session Practice Options V2 is the exact next dependency.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md": "Pre-G2L changes no Product option, Get stronger visibility, Questionnaire, current route, Product Shadow behavior, Full/Lighter/Recovery behavior, owner delivery, or activation.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md": "After completed Pre-G2K and Pre-G2L, the next authorized dependency is Session Practice Options Full/Lighter/Recovery V2 bridge work. This tranche does not begin it.",
  "docs/training-engine-v2/TESTING.md": `Pre-G2L evidence freezes ${controlledScenarios.length} controlled scenarios, ${packageSValidationSummary.cohortCount} fixed-shell cases, ${holdoutManifest.length} holdout cases, ${mutationResults.length} rejected mutations, ${packageSValidationSummary.metamorphicPassedCount} metamorphic passes, and required deterministic stress with zero failures.`,
  "docs/training-engine-v2/ARCHITECTURE.md": "Package S extends the one canonical exercise catalog and one canonical Knowledge registry. Press angle and Pull-Up assistance are typed realization truth; standard-gym comfort is a late score-neutral tie policy.",
  "docs/training-engine-v2/DOMAIN.md": "Standard-gym machines require exact capability IDs. Incline is press-support angle truth, machine assistance is not external load, and shoulder_extension is an accessory action that does not satisfy vertical_pull ownership.",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md": "The V2 production catalog contains 64 IDs and 64 complete Knowledge entries after Package S. Product, Shadow, delivery, activation, and Session Practice Options remain outside this tranche.",
});

const start = "<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:START -->";
const end = "<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:END -->";
const pattern = /<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:START -->[\s\S]*?<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:END -->/;
for (const [relativePath, summary] of Object.entries(integrationBlocks)) {
  const path = resolve(workspaceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`PACKAGE_S_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  const block = `${start}\n\n## Pre-G2L - Standard commercial-gym foundations and incline press realization\n\n${summary}\n\nCombined Pre-G2L fingerprint: \`${packageSFingerprints.combinedPreG2L}\`. Exact next dependency: \`${packageSReadiness.nextDependency}\`.\n\n${end}`;
  const expected = pattern.test(current) ? current.replace(pattern, block) : `${current.trimEnd()}\n\n${block}\n`;
  persist(path, expected);
}

process.stdout.write(`${JSON.stringify({
  mode: check ? "check" : "write",
  classification: packageSReadiness.classification,
  catalog: `${catalogInventory.afterRowCount}/${catalogInventory.uniqueIdCount}`,
  knowledge: PRODUCTION_64_KNOWLEDGE_ENTRIES.length,
  controlledScenarios: controlledScenarios.length,
  cohorts: packageSValidationSummary.cohortCount,
  holdout: holdoutManifest.length,
  mutations: `${packageSValidationSummary.mutationRejectedCount}/${packageSValidationSummary.mutationCount}`,
  metamorphic: `${packageSValidationSummary.metamorphicPassedCount}/${packageSValidationSummary.metamorphicCount}`,
  markdownReports: Object.keys(markdownReports).length + foundationReports.length,
  jsonReports: Object.keys(jsonReports).length,
  combinedPreG2L: packageSFingerprints.combinedPreG2L,
  nextDependency: packageSReadiness.nextDependency,
}, null, 2)}\n`);
