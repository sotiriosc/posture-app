import { fingerprint, jsonReport } from "./contracts";
import {
  activationGuards,
  allCandidateConcepts,
  causalPairs,
  closureProjection,
  comfortFirstProgression,
  controlledScenarios,
  coverageMatrix,
  currentCatalogInventory,
  currentPoolSummary,
  deferredCategories,
  externalEvidence,
  firstSessionCohort,
  gymCoverageMatrix,
  historicalP1Candidates,
  holdoutManifest,
  homeCandidates,
  homeComfortProfileSchema,
  homeComfortSelectionPolicy,
  homeComfortSemantics,
  homeCoverageMatrix,
  illustrativeComfortProfiles,
  legacyProductCatalogComparison,
  ontologyAnswers,
  ontologyClassification,
  ownerQuestions,
  packages,
  practiceOptionsReminder,
  readiness,
  realizationAudit,
  sourceFreezeManifest,
  upstreamFingerprints,
  commonStrengthCandidates,
} from "./evidence";
import {
  antiBloatResult,
  metamorphicResults,
  mutationResults,
  validationSummary,
} from "./validation";

const dispositionInventory = Object.freeze(allCandidateConcepts.map((entry) => ({
  id: entry.id,
  group: entry.group,
  receiver: entry.receiver,
  disposition: entry.disposition,
  firstTrancheEligible: entry.firstTrancheEligible,
})));

const fingerprintInputs = Object.freeze({
  ontologyAudit: { ontologyClassification, ontologyAnswers },
  current45Inventory: currentCatalogInventory,
  legacyProductCatalog: legacyProductCatalogComparison,
  currentPoolMatrix: { coverageMatrix, currentPoolSummary },
  comfortProfile: { homeComfortProfileSchema, illustrativeComfortProfiles, homeComfortSemantics },
  comfortSelectionPolicy: homeComfortSelectionPolicy,
  sameIdentityRealizationAudit: realizationAudit,
  homeCandidateUniverse: homeCandidates,
  historicalP1Review: historicalP1Candidates,
  commonStrengthAudit: commonStrengthCandidates,
  deferredCategories,
  dispositions: dispositionInventory,
  homeCoverage: homeCoverageMatrix,
  gymCoverage: gymCoverageMatrix,
  fullCoverage: coverageMatrix,
  comfortCohort: firstSessionCohort,
  causalPairs,
  antiBloat: antiBloatResult,
  externalEvidence,
  packageH: packages.find((entry) => entry.id === "H"),
  packageG: packages.find((entry) => entry.id === "G"),
  packageM: packages.find((entry) => entry.id === "M"),
  ownerDecisionMatrix: ownerQuestions,
  practiceOptionsReminder,
  controlledScenarios,
  holdout: holdoutManifest,
  mutations: mutationResults,
  metamorphicResults,
  activationGuards,
  ledgerBefore: upstreamFingerprints.canonicalLedgerBefore,
  ledgerAfter: closureProjection,
  readiness,
});

type FingerprintKey = keyof typeof fingerprintInputs;
const individualFingerprints = Object.freeze(Object.fromEntries(
  Object.entries(fingerprintInputs).map(([key, value]) => [key, fingerprint(value)]),
) as Record<FingerprintKey, string>);

export const curationFingerprints = Object.freeze({
  upstream: upstreamFingerprints,
  ...individualFingerprints,
  combinedCuration: fingerprint({ upstreamFingerprints, individualFingerprints }),
});

const esc = (value: unknown) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const title = (value: string) => `# ${value}\n\n`;
const bullets = (values: readonly unknown[]) => values.map((value) => `- ${esc(value)}`).join("\n");
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]) => [
  `| ${headers.join(" | ")} |`,
  `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map(esc).join(" | ")} |`),
].join("\n");
const footer = (key: FingerprintKey) => `\n\nFingerprint: \`${curationFingerprints[key]}\`.\n`;

const ontologyReport = () => title("Exercise Catalog Coverage and Home Comfort Ontology Audit") +
  `Authorization: \`EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1_READ_ONLY_NOT_PRODUCTION_CATALOG_EXPANSION\`.\n\n` +
  `Classification: \`${ontologyClassification}\`. Runtime authority: none. Current rows changed: 0.\n\n` +
  `## Concept classification\n\n${table(["Concept", "Classification", "Finding"], [
    ["Canonical exercise ID", "CORRECT_CANONICAL_IDENTITY", "One stable identity owns movement/task truth; grip, support, range, and load alone remain realizations."],
    ["Support, stance, range, side, load", "SAME_IDENTITY_REALIZATION", "Prescription/equipment facts do not create duplicate rows."],
    ["Current 45 rows", "CURRENT_ROW_SUFFICIENT", "Broad whole-body foundation with environment-specific thin and empty pools."],
    ["Current familiarity/comfort", "CURRENT_ROW_METADATA_GAP", "B4 exact familiarity exists, but no active comfort profile or ranking score exists."],
    ["No-bench home horizontal press", "HOME_COMFORT_GAP", "Only Push-Up is current; Dumbbell Floor Press is a candidate."],
    ["Anchorless vertical pull", "EQUIPMENT_CAPABILITY_GAP", "Truthful limitation; no pullover/pull-apart substitution."],
    ["Advanced power/conditioning", "OUT_OF_SCOPE", "Requires future receiver, modality, dose, equipment, and Safety policy."],
    ["Candidate packages", "OWNER_DECISION_REQUIRED", "Three packages are compared; none is selected."],
  ])}\n\n` +
  `## Explicit answers\n\n${table(["#", "Answer"], ontologyAnswers)}` + footer("ontologyAudit");

const comfortProfileReport = () => title("Exercise Home Comfort Profile") +
  `Contract: \`${homeComfortProfileSchema.reference.contractId}@${homeComfortProfileSchema.reference.contractVersion}\`. ` +
  `It is design-only, separate from difficulty, phase, experience, skill, Safety, score, and Product preference. It has no weighted score and no ranking authority.\n\n` +
  `## Closed dimensions\n\n${table(["Dimension", "Values"], homeComfortProfileSchema.dimensions.map((dimension) => [dimension,
    ["firstSessionConfidenceSuitability", "homeEnvironmentFit"].includes(dimension)
      ? homeComfortProfileSchema.closedFits.join(", ")
      : ["unknowns", "provenance", "reviewState"].includes(dimension)
        ? "typed evidence/review fields"
        : homeComfortProfileSchema.closedLevels.join(", ")]))}\n\n` +
  `## Semantics\n\nComfortable means: ${homeComfortSemantics.comfortable}\n\nIt does not mean:\n\n${bullets(homeComfortSemantics.comfortableDoesNotMean)}\n\n` +
  `Familiarity sources are ordered evidence, with recognizable/simple movement only a weak default when exact familiarity is unknown. Contradictory exact evidence always wins.` +
  footer("comfortProfile");

const comfortPolicyReport = () => title("Home Exercise Comfort Selection Policy V1") +
  `Contract: \`${homeComfortSelectionPolicy.reference.contractId}@${homeComfortSelectionPolicy.reference.contractVersion}\`. Activation: \`${homeComfortSelectionPolicy.activation}\`.\n\n` +
  `## Strict precedence\n\n${homeComfortSelectionPolicy.precedence.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}\n\n` +
  `No additive comfort score exists. Home creates a tie preference only when familiarity is unknown/limited, several candidates are otherwise truthful, no productive anchor exists, and no higher-priority purpose is lost. Advanced exact evidence may justify demanding home realizations.\n\n` +
  `## Comfort-first growth\n\n${bullets(comfortFirstProgression.sequence)}\n\nTransition only for: ${comfortFirstProgression.transitionReasons.join(", ")}.` +
  footer("comfortSelectionPolicy");

const baselineReport = () => title("Exercise Catalog Current 45 Baseline") +
  `Source: \`${currentCatalogInventory.source}\`. Frozen commit: \`${currentCatalogInventory.frozenAtCommit}\`. Rows: ${currentCatalogInventory.rowCount}. Unique IDs: ${currentCatalogInventory.uniqueIdCount}. Additions/modifications/deletions: 0/0/0.\n\n` +
  table(["#", "ID", "Name", "Family", "Movement roles", "Equipment"], currentCatalogInventory.rows.map((row, index) => [
    index + 1, row.id, row.name, row.family, row.movementRoles.join(", "), row.equipmentRequirements.map((entry) => entry.id).join(", "),
  ])) +
  `\n\n## Source freeze manifest\n\n${table(["Path", "SHA-256"], Object.entries(sourceFreezeManifest))}` +
  footer("current45Inventory");

const realizationReport = () => title("Exercise Catalog Current Realization Audit") +
  table(["Identity boundary", "Variants", "Decision", "Reason", "Metadata"], realizationAudit.map((entry) => [
    entry.identity, entry.variants.join(", "), entry.decision, entry.reason, entry.requiredMetadata.join(", "),
  ])) +
  `\n\nSame-identity decisions: ${realizationAudit.filter((entry) => entry.decision === "same_identity").length}. ` +
  `Distinct decisions: ${realizationAudit.filter((entry) => entry.decision === "distinct_identity").length}. ` +
  `Unresolved: ${realizationAudit.filter((entry) => entry.decision === "unresolved").length}. ` +
  `No row is created for grip, support, range, angle, side, or load alone.` + footer("sameIdentityRealizationAudit");

const legacyProductReport = () => title("Exercise Catalog Legacy Product Comparison") +
  `Legacy source: \`${legacyProductCatalogComparison.source}\`. Current legacy rows/unique IDs: ` +
  `${legacyProductCatalogComparison.currentRowCount}/${legacyProductCatalogComparison.currentUniqueIdCount}. ` +
  `Screenshot reference: \`${legacyProductCatalogComparison.screenshotReference}\` (owner binary remains untracked and uncommitted).\n\n` +
  `Legacy names are Product context only. Coarse \`bands\` and \`none\` labels do not prove anchor height, support, floor, routing, load, Safety, or a canonical V2 role.\n\n` +
  table(["Legacy ID", "Display", "Screenshot", "V2 relationship", "Finding", "Disposition"], legacyProductCatalogComparison.rows.map((entry) => [
    entry.legacyId, entry.displayName, entry.screenshotObserved, entry.v2Relationship, entry.finding, entry.disposition,
  ])) +
  `\n\nMapping policy: ${legacyProductCatalogComparison.exactMappingPolicy}.` + footer("legacyProductCatalog");

const coverageReport = (heading: string, rows: typeof coverageMatrix, key: "homeCoverage" | "gymCoverage" | "fullCoverage") =>
  title(heading) + table(["Environment", "Pattern/action", "Experience/familiarity", "Applicable purposes", "Status", "Current IDs", "Candidates", "Reason"], rows.map((entry) => [
    entry.environment, entry.pattern, entry.experienceAndFamiliarityStates.join(", "), entry.applicablePurposes.join(", "), entry.status,
    entry.currentIds.join(", ") || "none", entry.candidateIds.join(", ") || "none", entry.reason,
  ])) + footer(key);

const candidateTable = (rows: typeof homeCandidates) => table([
  "ID", "Boundary", "Equipment truth", "Comfort", "Setup", "Receiver", "Redundancy", "Disposition", "First tranche",
], rows.map((entry) => [entry.id, entry.identityBoundary, entry.equipmentTruth, entry.homeComfort, entry.setupComplexity,
  entry.receiver, entry.redundancy, entry.disposition, entry.firstTrancheEligible]));

const homeCandidateReport = () => title("Exercise Catalog Home Comfort Candidates") +
  candidateTable(homeCandidates) +
  `\n\nA band pull-apart is not horizontal pulling; a dumbbell pullover is not vertical pulling. Foot-anchored rows and body-wrapped presses remain rejected from first-tranche comfort curation pending safety/owner review.` +
  footer("homeCandidateUniverse");

const historicalReport = () => title("Exercise Catalog Historical P1 Review") +
  `Historical proposal status is not owner approval.\n\n${candidateTable(historicalP1Candidates)}` + footer("historicalP1Review");

const commonReport = () => title("Exercise Catalog Common Strength Core Audit") +
  candidateTable(commonStrengthCandidates) +
  `\n\nBarbell bench, squat, and deadlift are not required before initial controlled owner delivery. Current machine/dumbbell/bodyweight alternatives can serve general strength while barbell-specific equipment, stress, knowledge, and receiver contracts remain open.` +
  footer("commonStrengthAudit");

const deferredReport = () => title("Exercise Catalog Deferred Categories") +
  table(["Category", "Disposition", "Reason"], deferredCategories.map((entry) => [entry.id, entry.disposition, entry.reason])) +
  footer("deferredCategories");

const dispositionReport = () => title("Exercise Catalog Candidate Dispositions") +
  table(["ID", "Group", "Receiver", "Disposition", "First tranche eligible"], dispositionInventory.map((entry) => [
    entry.id, entry.group, entry.receiver, entry.disposition, entry.firstTrancheEligible,
  ])) + footer("dispositions");

const cohortReport = () => title("Exercise Catalog First-Session Comfort Cohort") +
  table(["Scenario", "Expected", "Production selection"], firstSessionCohort.map((entry) => [entry.id, entry.expected, entry.productionSelectionApplied])) +
  `\n\nResult: home never sets Beginner, unknown home facts favor comfort only after legality/purpose, advanced exact evidence is respected, and no equipment or fake pull is invented.` +
  footer("comfortCohort");

const causalReport = () => title("Exercise Catalog Comfort and Growth Causal Tests") +
  table(["Baseline", "Material pair", "Response window", "Expected"], causalPairs.map((entry) => [entry.left, entry.right, entry.responseWindow, entry.expected])) +
  `\n\nNo downstream repetition change can rescue an illegal or wrong-purpose exercise choice.` + footer("causalPairs");

const antiBloatReport = () => title("Exercise Catalog Anti-Bloat") +
  table(["Guard", "Observed"], Object.entries(antiBloatResult).map(([key, value]) => [key, value])) +
  `\n\nThere is no target catalog size. Catalog breadth creates no automatic warm-up, activation, accessory, session-length, or Product home-program growth.` +
  footer("antiBloat");

const evidenceReport = () => title("Exercise Catalog External Evidence Review") +
  `Primary research/index records are used only for bounded architecture conclusions; every exercise-specific production claim remains owner-reviewed.\n\n` +
  table(["Evidence", "Source", "Bounded conclusion"], externalEvidence.map((entry) => [entry.id, entry.source, entry.boundedConclusion])) +
  `\n\nThe evidence does not prove that every home user is a beginner, one exercise is universally best, familiar exercises are always superior, machines are always safer, or bands are always simpler.` +
  footer("externalEvidence");

const packageReport = (id: "H" | "G" | "M", key: "packageH" | "packageG" | "packageM") => {
  const entry = packages.find((candidate) => candidate.id === id)!;
  return title(`Exercise Catalog ${entry.name} Package`) +
    `Package ID: \`${entry.id}\`. Comparative curation only; not selected. New-row proposal count: ${entry.newRowCount}.\n\n` +
    `## Candidate IDs\n\n${bullets(entry.candidateIds)}\n\n` +
    `## Same-identity metadata\n\n${bullets(entry.sameIdentityMetadata)}\n\n` +
    table(["Dimension", "Result"], [
      ["Environments improved", entry.environmentsImproved.join(", ")],
      ["Pools improved", entry.poolsImproved.join(", ")],
      ["Remaining gaps", entry.remainingGaps.join(", ")],
      ["Home comfort", entry.homeComfortConsequence],
      ["Advanced user", entry.advancedUserConsequence],
      ["Ranking", entry.rankingConsequenceExpectation],
      ["Composer", entry.composerConsequence],
      ["Prescription/Knowledge", entry.knowledgeWork],
      ["Test burden", entry.testBurden],
      ["Rollback", entry.rollback],
      ["Risk", entry.risk],
    ]) + footer(key);
};

const ownerReport = () => title("Exercise Catalog Owner Decision Matrix") +
  `No package or owner-value decision is silently selected.\n\n` +
  table(["#", "Owner question", "Current status"], ownerQuestions.map((question, index) => [index + 1, question, "OWNER_DECISION_REQUIRED"])) +
  footer("ownerDecisionMatrix");

const practiceReport = () => title("Session Practice Options Pre-G Bridge Reminder") +
  `Status: \`${practiceOptionsReminder.status}\`. Implementation count: ${practiceOptionsReminder.implementationCount}.\n\n` +
  `## Full\n\n${practiceOptionsReminder.full}\n\n## Lighter\n\n${practiceOptionsReminder.lighter.intent}\n\nRemove first:\n\n${bullets(practiceOptionsReminder.lighter.removeFirst)}\n\n` +
  `Lighter is not permanently defined as ${practiceOptionsReminder.lighter.prohibitedDefinition}.\n\n## Recovery\n\n${practiceOptionsReminder.recovery.intent}\n\nProhibited:\n\n${bullets(practiceOptionsReminder.recovery.prohibited)}\n\n` +
  `One choice is a Longitudinal failure signal: ${practiceOptionsReminder.longitudinalFailureSignalFromOneChoice}.` +
  footer("practiceOptionsReminder");

const holdoutReport = () => title("Exercise Catalog Coverage and Home Comfort Curation V1 Holdout Manifest") +
  `Frozen cases: ${holdoutManifest.length}. Tuning after evaluation: prohibited. Production selection applied: no.\n\n` +
  table(["ID", "Lane", "Subject", "Environment", "Experience", "Familiarity", "Comfort dimension", "Expected"], holdoutManifest.map((entry) => [
    entry.id, entry.lane, entry.subject, entry.environment, entry.experience, entry.familiarity, entry.comfortDimension, entry.expected,
  ])) + footer("holdout");

const readinessReport = () => title("Exercise Catalog Coverage and Home Comfort Curation Readiness") +
  `Classification: \`${readiness.classification}\`.\n\nOntology: \`${readiness.ontologyClassification}\`.\n\n` +
  `Current rows/unique IDs: ${currentCatalogInventory.rowCount}/${currentCatalogInventory.uniqueIdCount}. Production additions/modifications/deletions: 0/0/0. ` +
  `Controlled scenarios: ${controlledScenarios.length}. Frozen holdout: ${holdoutManifest.length}. Mutations: ${validationSummary.mutationRejectedCount}/${validationSummary.mutationCount} rejected. ` +
  `Metamorphic: ${validationSummary.metamorphicPassedCount}/${validationSummary.metamorphicCount} passed.\n\n` +
  `Packages H/G/M are owner-ready comparisons. Recommended package: none. Package selected: no. Pre-G1 is ready for ledger closure; Pre-G2, Pre-G3, G, and H remain open. ` +
  `Final ledger state remains \`${closureProjection.finalState}\`.\n\n` +
  `Rollback: ${readiness.rollback}\n\nExact next dependency: \`${readiness.nextDependency}\`.\n\n` +
  `Combined curation fingerprint: \`${curationFingerprints.combinedCuration}\`.` + footer("readiness");

export const curationMarkdownReports: Readonly<Record<string, string>> = Object.freeze({
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_ONTOLOGY_AUDIT.md": ontologyReport(),
  "EXERCISE_HOME_COMFORT_PROFILE.md": comfortProfileReport(),
  "HOME_EXERCISE_COMFORT_SELECTION_POLICY_V1.md": comfortPolicyReport(),
  "EXERCISE_CATALOG_CURRENT_45_BASELINE.md": baselineReport(),
  "EXERCISE_CATALOG_CURRENT_REALIZATION_AUDIT.md": realizationReport(),
  "EXERCISE_CATALOG_LEGACY_PRODUCT_COMPARISON.md": legacyProductReport(),
  "EXERCISE_CATALOG_HOME_COVERAGE_MATRIX.md": coverageReport("Exercise Catalog Home Coverage Matrix", homeCoverageMatrix, "homeCoverage"),
  "EXERCISE_CATALOG_GYM_COVERAGE_MATRIX.md": coverageReport("Exercise Catalog Gym Coverage Matrix", gymCoverageMatrix, "gymCoverage"),
  "EXERCISE_CATALOG_FULL_COVERAGE_MATRIX.md": coverageReport("Exercise Catalog Full Coverage Matrix", coverageMatrix, "fullCoverage"),
  "EXERCISE_CATALOG_HOME_COMFORT_CANDIDATES.md": homeCandidateReport(),
  "EXERCISE_CATALOG_HISTORICAL_P1_REVIEW.md": historicalReport(),
  "EXERCISE_CATALOG_COMMON_STRENGTH_CORE_AUDIT.md": commonReport(),
  "EXERCISE_CATALOG_DEFERRED_CATEGORIES.md": deferredReport(),
  "EXERCISE_CATALOG_CANDIDATE_DISPOSITIONS.md": dispositionReport(),
  "EXERCISE_CATALOG_FIRST_SESSION_COMFORT_COHORT.md": cohortReport(),
  "EXERCISE_CATALOG_COMFORT_AND_GROWTH_CAUSAL_TESTS.md": causalReport(),
  "EXERCISE_CATALOG_ANTI_BLOAT.md": antiBloatReport(),
  "EXERCISE_CATALOG_EXTERNAL_EVIDENCE_REVIEW.md": evidenceReport(),
  "EXERCISE_CATALOG_HOME_COMFORT_CORE_PACKAGE.md": packageReport("H", "packageH"),
  "EXERCISE_CATALOG_COMMERCIAL_GYM_CORE_PACKAGE.md": packageReport("G", "packageG"),
  "EXERCISE_CATALOG_MIXED_MINIMAL_RELEASE_PACKAGE.md": packageReport("M", "packageM"),
  "EXERCISE_CATALOG_OWNER_DECISION_MATRIX.md": ownerReport(),
  "SESSION_PRACTICE_OPTIONS_PRE_G_BRIDGE_REMINDER.md": practiceReport(),
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_V1_HOLDOUT_MANIFEST.md": holdoutReport(),
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_READINESS.md": readinessReport(),
});

export const curationJsonReports: Readonly<Record<string, string>> = Object.freeze({
  "EXERCISE_CATALOG_CURRENT_45_BASELINE.json": jsonReport(currentCatalogInventory),
  "EXERCISE_CATALOG_CURRENT_POOL_MATRIX.json": jsonReport({ coverageMatrix, currentPoolSummary }),
  "EXERCISE_HOME_COMFORT_PROFILE_SCHEMA.json": jsonReport({ homeComfortProfileSchema, illustrativeComfortProfiles, homeComfortSemantics }),
  "EXERCISE_CATALOG_CURRENT_REALIZATION_AUDIT.json": jsonReport(realizationAudit),
  "EXERCISE_CATALOG_LEGACY_PRODUCT_COMPARISON.json": jsonReport(legacyProductCatalogComparison),
  "EXERCISE_CATALOG_CANDIDATE_INVENTORY.json": jsonReport(allCandidateConcepts),
  "EXERCISE_CATALOG_CANDIDATE_DISPOSITIONS.json": jsonReport(dispositionInventory),
  "EXERCISE_CATALOG_FULL_COVERAGE_MATRIX.json": jsonReport(coverageMatrix),
  "EXERCISE_CATALOG_FIRST_SESSION_COMFORT_COHORT.json": jsonReport(firstSessionCohort),
  "EXERCISE_CATALOG_COMFORT_AND_GROWTH_CAUSAL_PAIRS.json": jsonReport(causalPairs),
  "EXERCISE_CATALOG_PACKAGE_COMPARISONS.json": jsonReport(packages),
  "EXERCISE_CATALOG_OWNER_DECISION_MATRIX.json": jsonReport(ownerQuestions),
  "EXERCISE_CATALOG_CONTROLLED_SCENARIOS.json": jsonReport(controlledScenarios),
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_V1_HOLDOUT_MANIFEST.json": jsonReport(holdoutManifest),
  "EXERCISE_CATALOG_CURATION_MUTATIONS.json": jsonReport(mutationResults),
  "EXERCISE_CATALOG_CURATION_METAMORPHIC_RESULTS.json": jsonReport(metamorphicResults),
  "EXERCISE_CATALOG_CURATION_ACTIVATION_GUARDS.json": jsonReport(activationGuards),
  "EXERCISE_CATALOG_CURATION_FINGERPRINTS.json": jsonReport(curationFingerprints),
  "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_READINESS.json": jsonReport({
    ...readiness,
    validation: validationSummary,
    fingerprints: curationFingerprints,
  }),
});

export const reportCorpusFingerprint = fingerprint({
  markdown: curationMarkdownReports,
  json: curationJsonReports,
});
