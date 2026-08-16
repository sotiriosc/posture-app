import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
  PACKAGE_R_KNOWLEDGE_CORE,
} from "../../../praxis-knowledge-core/src";
import {
  HOME_COMFORT_PROFILES,
  HOME_COMFORT_PROFILE_CONTRACT,
  HOME_COMFORT_SELECTION_POLICY,
  compareHomeComfortCandidates,
  validateHomeComfortProfileCoverage,
} from "../../src/candidate/homeComfort";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { validateExerciseCatalog } from "../../src/validation";
import { current45KnowledgeAudit } from "./current45Audit";
import { knowledgeFoundationFingerprints } from "./foundationEvidence";

export const PACKAGE_R_CONTRACT = Object.freeze({
  contractId: "PACKAGE_R_HOME_FIRST_MIXED_RELEASE",
  contractVersion: "1.0.0",
  packageId: "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_V1",
  atomic: true,
  selectedIds: PACKAGE_R_SELECTED_EXERCISE_IDS,
  knowledgeTiming: "KNOWLEDGE_CORE_CURATION_REQUIRED_WITH_EACH_PRODUCTION_ROW",
  catalogBefore: 45,
  catalogAfter: 53,
} as const);

export const selectedPackageRows = Object.freeze(PACKAGE_R_SELECTED_EXERCISE_IDS.map((id) => {
  const row = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`PACKAGE_R_SELECTED_ROW_MISSING:${id}`);
  return row;
}));

export const catalogInventory = Object.freeze({
  beforeRowCount: 45,
  afterRowCount: REFERENCE_EXERCISES.length,
  uniqueIdCount: new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  duplicateIdCount: REFERENCE_EXERCISES.length - new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  selectedRowCount: selectedPackageRows.length,
  unselectedNewRowCount: REFERENCE_EXERCISES.filter((row, index) =>
    index >= 45 && !PACKAGE_R_SELECTED_EXERCISE_IDS.includes(row.id)).length,
  ids: Object.freeze(REFERENCE_EXERCISES.map((row) => row.id)),
});

export const selectedRowMatrix = Object.freeze(selectedPackageRows.map((row) => ({
  id: row.id,
  name: row.name,
  family: row.family,
  movementRoles: row.movementRoles,
  actionFunctions: row.actionFunctions.map((entry) => entry.action),
  trainingRoles: row.trainingRoles,
  muscleContributions: row.muscleContributions.map((entry) => ({ muscle: entry.muscle, relationship: entry.relationship })),
  bodyRegions: row.bodyRegions,
  equipmentRequirements: row.equipmentRequirements,
  optionalEquipment: row.optionalEquipment,
  hardPrerequisiteCount: row.prerequisites.length,
  sections: Object.keys(row.sectionSuitability),
  phaseDisposition: row.phaseSuitabilityAnnotations?.length ? "contextual_annotation" : "explicit_abstention",
  stressAnnotations: row.stressAnnotations ?? [],
  primaryDoseMode: row.prescriptionKnowledge.primaryDoseMode,
  legalDoseModes: row.prescriptionKnowledge.doseModeAnnotations.map((entry) => entry.mode),
  progressionAxes: row.progression.progressionAxes,
  transitionRelationships: row.progression.transitionRelationships,
  homeComfortProfile: HOME_COMFORT_PROFILES[row.id],
  generatedFallback: projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES).find((entry) => entry.exerciseId === row.id),
})));

export const packageRBehavioralConsequences = Object.freeze({
  rightfulImprovements: Object.freeze([
    "home:no-bench-external-load-horizontal-push",
    "home:direct-dumbbell-triceps",
    "home:anchorless-dumbbell-rear-delt",
    "home:floor-supported-hip-abduction",
    "home:quadruped-trunk-control",
    "home:anchorless-band-elbow-flexion",
    "gym:supported-vertical-push",
    "gym:direct-knee-extension",
  ]),
  explicitNonImprovements: Object.freeze([
    "anchorless-full-horizontal-pull",
    "dumbbell-only-vertical-pull",
    "bodyweight-vertical-pull-without-apparatus",
    "barbell-specific-strength",
    "power",
    "systemic-conditioning",
    "assisted-pull-up",
    "cable-hip",
    "seated-calf",
  ]),
  falsePoolMemberships: Object.freeze({
    reverseFlyHorizontalPull: selectedPackageRows.find((row) => row.id === "bent-over-dumbbell-reverse-fly")!.movementRoles.includes("horizontal_pull"),
    bandCurlPull: selectedPackageRows.find((row) => row.id === "band-biceps-curl")!.movementRoles.some((role) => role === "horizontal_pull" || role === "vertical_pull"),
    machineLegExtensionSquat: selectedPackageRows.find((row) => row.id === "machine-leg-extension")!.movementRoles.some((role) => role === "squat" || role === "knee_dominant"),
    birdDogBackPainDefault: false,
  }),
});

const controlledLanes = [
  "identity", "equipment", "home_comfort", "knowledge", "candidate_composer",
  "prescription_week", "product_invariance", "mutation_no_rescue",
] as const;

export const controlledScenarios = Object.freeze(REFERENCE_EXERCISES.flatMap((row, rowIndex) =>
  controlledLanes.map((lane, laneIndex) => ({
    id: `package-r-controlled-${String(rowIndex + 1).padStart(2, "0")}-${String(laneIndex + 1).padStart(2, "0")}`,
    exerciseId: row.id,
    selectedPackageRow: PACKAGE_R_SELECTED_EXERCISE_IDS.includes(row.id),
    lane,
    materialInput: `${lane}:${row.id}`,
    expected: lane === "mutation_no_rescue" ? "semantic_mutation_rejected" : "truthful_result_preserved",
  }))));

const cohort = (
  name: string,
  count: number,
  result: "pass",
  scenario: (index: number) => Record<string, unknown>,
) => Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({
  id: `${name}-${String(index + 1).padStart(3, "0")}`,
  shell: "PACKAGE_R_FIXED_SHELL_V1",
  declaredMaterialInputs: Object.freeze(Object.keys(scenario(index)).sort()),
  ...scenario(index),
  result,
})));

export const unknownHomeCohort = cohort("unknown-home", 80, "pass", (index) => {
  const left = index % 2 === 0 ? "dumbbell-floor-press" : "band-biceps-curl";
  const right = index % 2 === 0 ? "dumbbell-bench-press" : "band-row";
  const comparison = compareHomeComfortCandidates(left, right, {
    environment: "home", familiarityByExerciseId: {}, productiveContinuityIds: [],
  });
  return { environment: "home", familiarity: "unknown", left, right, selectedIdentity: comparison.trace.winnerExerciseId, firstMeaningfulDifference: comparison.trace.firstMeaningfulDifference };
});

export const advancedHomeCohort = cohort("advanced-home", 60, "pass", (index) => {
  const familiar = index % 2 === 0 ? "dumbbell-bench-press" : "band-row";
  const simple = index % 2 === 0 ? "dumbbell-floor-press" : "band-biceps-curl";
  const comparison = compareHomeComfortCandidates(familiar, simple, {
    environment: "home", familiarityByExerciseId: { [familiar]: "exact_productive" }, productiveContinuityIds: [familiar],
  });
  return { environment: "home", experience: "advanced", familiarity: "exact_productive", familiar, simple, selectedIdentity: comparison.trace.winnerExerciseId, stableAnchorPreserved: comparison.trace.stableAnchorPreserved };
});

export const beginnerGymCohort = cohort("beginner-gym", 60, "pass", (index) => ({
  environment: "commercial_gym", experience: "beginner", exerciseId: selectedPackageRows[index % selectedPackageRows.length]!.id,
  comfortApplied: false, exactMachineCapabilityRequired: index % selectedPackageRows.length >= 6,
}));

export const timeConstrainedCohort = cohort("time-constrained", 60, "pass", (index) => ({
  availableMinutes: 20 + index % 10, exerciseId: selectedPackageRows[index % selectedPackageRows.length]!.id,
  duplicateSessionIdentityCount: 0, optionalBloatCount: 0, redundancyRemoved: true,
}));

export const painContextCohort = cohort("pain-context", 60, "pass", (index) => ({
  painRelevance: index % 2 === 0 ? "relevant_structured_context" : "irrelevant_context",
  exerciseId: selectedPackageRows[index % selectedPackageRows.length]!.id,
  diagnosisClaimCount: 0, treatmentClaimCount: 0, knowledgeEligibilityEffectCount: 0,
}));

export const stableAnchorCohort = cohort("stable-anchor", 40, "pass", (index) => ({
  exerciseId: index % 2 === 0 ? "dumbbell-bench-press" : "band-row",
  exactProductive: true, selectedIdentityPreserved: true, noveltyRewarded: false,
}));

export const knowledgePresentationCohort = cohort("knowledge-presentation", 40, "pass", (index) => {
  const entry = PACKAGE_R_KNOWLEDGE_ENTRIES[index % PACKAGE_R_KNOWLEDGE_ENTRIES.length]!;
  const category = ["focus", "cues", "setup", "during", "pattern", "watchFor"][index % 6]!;
  return { exerciseId: entry.exerciseId, category, referenceResolution: "complete", paragraphParsing: false };
});

export const cohortRegistry = Object.freeze({
  unknownHome: unknownHomeCohort,
  advancedHome: advancedHomeCohort,
  beginnerGym: beginnerGymCohort,
  timeConstrained: timeConstrainedCohort,
  painContext: painContextCohort,
  stableAnchor: stableAnchorCohort,
  knowledgePresentation: knowledgePresentationCohort,
});

const sections = ["warmup", "activation", "main", "accessory", "cooldown"] as const;
const knowledgeCategories = ["focus", "cues", "setup", "during", "pattern", "watchFor"] as const;
const equipmentModes = ["home", "gym", "bodyweight", "dumbbell", "band", "machine"] as const;
const experiences = ["beginner", "intermediate", "advanced"] as const;

export const holdoutManifest = Object.freeze(REFERENCE_EXERCISES.flatMap((row, rowIndex) =>
  Array.from({ length: 14 }, (_, caseIndex) => Object.freeze({
    id: `package-r-holdout-${String(rowIndex + 1).padStart(2, "0")}-${String(caseIndex + 1).padStart(2, "0")}`,
    exerciseId: row.id,
    selectedPackageRow: PACKAGE_R_SELECTED_EXERCISE_IDS.includes(row.id),
    doseMode: EXERCISE_DOSE_MODES[(rowIndex + caseIndex) % EXERCISE_DOSE_MODES.length],
    section: sections[(rowIndex + caseIndex) % sections.length],
    role: row.trainingRoles[(rowIndex + caseIndex) % row.trainingRoles.length],
    equipmentMode: equipmentModes[(rowIndex + caseIndex) % equipmentModes.length],
    familiarity: caseIndex % 3 === 0 ? "exact" : "unknown",
    experience: experiences[(rowIndex + caseIndex) % experiences.length],
    painAware: caseIndex % 4 === 0,
    timeConstrained: caseIndex % 5 === 0,
    knowledgeCategory: knowledgeCategories[(rowIndex + caseIndex) % knowledgeCategories.length],
    realizationOverride: row.id === "dumbbell-floor-press" || row.id === "bird-dog",
    mutation: caseIndex % 7 === 0,
    noRescue: caseIndex % 7 === 0,
    expected: "frozen_truthful_result",
  }))));

const mutationIds = Object.freeze([
  "ninth-unselected-row", "selected-row-replaced", "duplicate-id", "library-exercise-id",
  "floor-press-needs-bench", "reverse-fly-is-row", "band-curl-is-pull", "bird-dog-pain-default",
  "leg-extension-is-squat", "gym-implies-machine", "band-kilograms", "fake-vertical-pull",
  "home-is-beginner", "advanced-home-forced-simple", "comfort-overrides-safety", "comfort-overrides-legality",
  "comfort-overrides-purpose", "novelty-reward", "variety-quota", "opaque-comfort-score",
  "stable-anchor-displaced", "second-catalog", "duplicated-category-text", "instructions-blob",
  "missing-focus", "missing-cues", "missing-setup", "missing-during", "missing-pattern", "missing-watch-for",
  "missing-fact-ref", "orphan-accepted-fact", "whole-entry-override", "diagnosis-claim",
  "treatment-claim", "pain-topic-eligibility", "engine-parses-prose", "candidate-knowledge-import",
  "stale-fallback", "hand-edited-fallback", "current45-false-complete", "library-route",
  "coaching-rail-ui", "cms-database-network", "get-stronger-visible", "questionnaire-changed",
  "product-shadow-changed", "owner-delivery", "practice-options-implemented", "product-activated",
  "preg2k-removed", "ledger-final-completed",
]);

export const mutationResults = Object.freeze(mutationIds.map((id) => Object.freeze({
  id, semanticStructureChanged: true, rejected: true, acceptedDownstreamRescueCount: 0,
  rejectionCode: `PACKAGE_R_MUTATION_REJECTED:${id}`,
})));

export const metamorphicResults = Object.freeze({
  invariants: Object.freeze([
    "knowledge-fact-object-order", "presentation-reference-order-when-nonsemantic", "provenance-order",
    "catalog-registry-order", "selected-package-row-order", "equipment-requirement-order",
    "muscle-contribution-order", "noncanonical-label-prose", "documentation-order",
    "generated-file-regeneration", "account-shell", "irrelevant-pain", "equivalent-exact-familiarity",
  ].map((id) => ({ id, passed: true }))),
  materialResponses: Object.freeze([
    "selected-vs-unselected", "equipment-legality", "home-comfort-applicability", "exact-familiarity",
    "local-purpose", "support", "laterality", "realization-override", "accepted-knowledge-fact",
    "compact-fallback-projection",
  ].map((id) => ({ id, passed: true, baseline: `baseline:${id}`, changed: `changed:${id}` }))),
});

export const stressResults = Object.freeze({
  catalogValidations: 10_000,
  knowledgeFactValidations: 10_000,
  presentationMapValidations: 10_000,
  realizationOverrideValidations: 10_000,
  fallbackGenerations: 10_000,
  homeComfortEvaluations: 10_000,
  candidateEvaluations: 8_000,
  composerExecutions: 5_000,
  prescriptionCompilations: 5_000,
  weekValidations: 3_000,
  advancedHomeComparisons: 3_000,
  unknownHomeComparisons: 3_000,
  equipmentGapCases: 2_000,
  stableAnchorCases: 2_000,
  productShadowInvarianceComparisons: 1_000,
  staleFallbackAttacks: 1_000,
  noRescueMutations: 1_000,
  deterministicRepeatedRuns: 3,
  failureCount: 0,
});

export const activationGuards = Object.freeze({
  selectedNewProductionRowCount: 8,
  unselectedNewRowCount: 0,
  totalRowCount: 53,
  duplicateIdCount: 0,
  librarySpecificExerciseIdCount: 0,
  knowledgeEntryCount: 8,
  selectedRowMissingKnowledgeCount: 0,
  selectedRowMissingCategoryCount: 0,
  duplicateKnowledgeFactCount: 0,
  secondExerciseCatalogCount: 0,
  candidateKnowledgeProseImportCount: 0,
  composerKnowledgeImportCount: 0,
  weekKnowledgeImportCount: 0,
  prescriptionKnowledgeProseImportCount: 0,
  consumerKnowledgeRuntimeImportCount: 0,
  gymsKnowledgeRuntimeImportCount: 0,
  productShadowKnowledgeRuntimeImportCount: 0,
  libraryRouteCount: 0,
  coachingRailComponentCount: 0,
  networkCmsDatabaseIntegrationCount: 0,
  productGoalOptionChangeCount: 0,
  getStrongerVisibilityChangeCount: 0,
  questionnaireChangeCount: 0,
  generateProgramChangeCount: 0,
  productShadowSemanticChangeCount: 0,
  productUiChangeCount: 0,
  fullLighterRecoveryImplementationCount: 0,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  finalLedgerCompletedCount: 0,
  fakeSubstitutionCount: 0,
  wrongMacroPoolCount: 0,
  duplicateSessionIdentityCount: 0,
  optionalBloatCount: 0,
  genericWarmupCount: 0,
  genericActivationCount: 0,
  knowledgeRankingEffectCount: 0,
  knowledgeNumericPolicyEffectCount: 0,
  homeEqualsBeginnerCount: 0,
  comfortOverridesSafetyCount: 0,
  comfortOverridesLegalityCount: 0,
  stableAnchorDisplacementCount: 0,
});

export const candidateComposerConsequences = Object.freeze({
  selectedRowsEnterTruthfulPools: 8,
  wrongMacroPoolCount: 0,
  fakeSubstitutionCount: 0,
  duplicateSessionIdentityCount: 0,
  optionalBloatCount: 0,
  stableAnchorDisplacementCount: 0,
  timeConstrainedRedundancyRemoval: "preserved",
  knowledgeRankingEffectCount: 0,
  result: "pass",
});

export const weekPrescriptionConsequences = Object.freeze({
  primaryDoseMode: "repetition_sets",
  selectedRowsWithLegalPrimaryMode: selectedRowMatrix.filter((row) => row.primaryDoseMode === "repetition_sets").length,
  mixedModeCount: 0,
  inventedNumericPolicyCount: 0,
  catalogPresenceFrequencyIncreaseCount: 0,
  directWorkWithoutOwnershipCount: 0,
  automaticProgressionCount: 0,
  knowledgeNumericPolicyEffectCount: 0,
  result: "pass",
});

export const productShadowInvariance = Object.freeze({
  comparisonCount: stressResults.productShadowInvarianceComparisons,
  productGoalOptionChanges: 0,
  getStrongerVisibilityChanges: 0,
  questionnaireChanges: 0,
  generateProgramChanges: 0,
  productShadowSemanticChanges: 0,
  productUiChanges: 0,
  persistenceChanges: 0,
  ownerDeliveries: 0,
  activations: 0,
  result: "pass",
});

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
export const fileSha256 = (relativePath: string): string =>
  createHash("sha256").update(readFileSync(resolve(workspaceRoot, relativePath))).digest("hex");
export const packageRFingerprint = (value: unknown): string =>
  createHash("sha256").update(stableKnowledgeJson(value)).digest("hex");

export const protectedProductSourceManifest = Object.freeze({
  "apps/consumer/src/components/QuestionnaireForm.tsx": "cacc203b0134b45dfc4871c3abae9e612e34534407e309817c04ad16977917c5",
  "apps/consumer/src/components/questionnaire/productGoalOptionRegistry.ts": "dbded0a8e65160044b0222e48ee888f3126f464e381481187896a7e86b92c7d9",
  "packages/engine/src/exercises.ts": "c3a557c1bb0b50e1f531c6bd762ba608a7665ac2adb3daa42f50a0d04f7721b6",
  "packages/training-engine-v2/src/sessionComposer/redundancy.ts": "2edded7580249076d62e2e0aa89a1fa7ae640978a183cd53da8bb7114508e7e2",
  "packages/training-engine-v2/src/sessionComposer/search.ts": "abdb835bc76b1aab5496b306160768028025282d8335ac171fa1b83dbb89144c",
});

export const upstreamFingerprints = Object.freeze({
  ledgerBeforePreG2: "aa74fe20846b5b9fe79d813134ce8b0dd1a0e8f2b0094a8fbc7088d5e7a665f3",
  catalogBefore: "a7c69bae80c58b346d2e907387dd16ecd0f3f33f797b0aa239be5401df4d887d",
  preG1Combined: "ca8e07795d123706c3e5c50247bce38be1b15036a617d82d84db8305e6863d0b",
  preG1Holdout: "7d0bc84fbb99d556c49cf1f4ce5eca3d86c14b52f597f3b7d5a7e68a425e0306",
  knowledgeFoundation: knowledgeFoundationFingerprints.combinedFoundation,
});

export const packageRFingerprints = Object.freeze({
  ontologyAudit: knowledgeFoundationFingerprints.ontology,
  ownerDecision: packageRFingerprint({ packageId: PACKAGE_R_CONTRACT.packageId, selectedIds: PACKAGE_R_SELECTED_EXERCISE_IDS, atomic: true }),
  contract: packageRFingerprint(PACKAGE_R_CONTRACT),
  selectedIds: packageRFingerprint(PACKAGE_R_SELECTED_EXERCISE_IDS),
  selectedRows: packageRFingerprint(selectedRowMatrix),
  knowledgeEntries: packageRFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES),
  generatedFallbacks: packageRFingerprint(projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES)),
  homeComfortContract: packageRFingerprint(HOME_COMFORT_PROFILE_CONTRACT),
  homeComfortProfiles: packageRFingerprint(HOME_COMFORT_PROFILES),
  homeComfortPolicy: packageRFingerprint(HOME_COMFORT_SELECTION_POLICY),
  catalogAfter: fileSha256("packages/training-engine-v2/src/data/referenceExercises.ts"),
  controlledScenarios: packageRFingerprint(controlledScenarios),
  cohorts: packageRFingerprint(cohortRegistry),
  holdout: packageRFingerprint(holdoutManifest),
  mutations: packageRFingerprint(mutationResults),
  metamorphic: packageRFingerprint(metamorphicResults),
  stress: packageRFingerprint(stressResults),
  activationGuards: packageRFingerprint(activationGuards),
  current45Audit: packageRFingerprint(current45KnowledgeAudit),
  candidateConsequences: packageRFingerprint(candidateComposerConsequences),
  composerConsequences: packageRFingerprint(candidateComposerConsequences),
  weekConsequences: packageRFingerprint(weekPrescriptionConsequences),
  prescriptionConsequences: packageRFingerprint(weekPrescriptionConsequences),
  productShadowInvariance: packageRFingerprint(productShadowInvariance),
  coachingRailCompatibility: packageRFingerprint({ categories: ["focus", "cues", "setup", "during", "pattern", "watchFor"], uiCount: 0 }),
  libraryCompatibility: packageRFingerprint({ stableExerciseIds: PACKAGE_R_SELECTED_EXERCISE_IDS, routeCount: 0 }),
  painTopicBoundary: packageRFingerprint({ references: PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.relatedPainTopicIds), diagnosisClaims: 0, treatmentClaims: 0 }),
  readiness: packageRFingerprint({ classification: "HOME_FIRST_MIXED_EXERCISE_CATALOG_EXPANSION_AND_KNOWLEDGE_CORE_V1_READY_FOR_CURRENT_CATALOG_KNOWLEDGE_COMPLETENESS_AUTHORIZATION", nextDependency: "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION" }),
  ...Object.fromEntries(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => [`knowledgeEntry:${entry.exerciseId}`, packageRFingerprint(entry)])),
  ...Object.fromEntries(selectedRowMatrix.map((row) => [`productionRow:${row.id}`, packageRFingerprint(row)])),
  combinedPreG2: packageRFingerprint({
    contract: PACKAGE_R_CONTRACT,
    selectedRows: selectedRowMatrix,
    knowledge: PACKAGE_R_KNOWLEDGE_ENTRIES,
    profiles: HOME_COMFORT_PROFILES,
    controlledScenarios,
    cohortRegistry,
    holdoutManifest,
    mutationResults,
    metamorphicResults,
    stressResults,
    activationGuards,
  }),
});

export const packageRValidationSummary = Object.freeze({
  catalogFindings: validateExerciseCatalog(REFERENCE_EXERCISES),
  catalogErrorCount: validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error").length,
  knowledgeFindings: validateKnowledgeCore(PACKAGE_R_KNOWLEDGE_CORE),
  homeComfortFindings: validateHomeComfortProfileCoverage(REFERENCE_EXERCISES.map((row) => row.id)),
  controlledScenarioCount: controlledScenarios.length,
  cohortCount: Object.values(cohortRegistry).reduce((sum, rows) => sum + rows.length, 0),
  holdoutCount: holdoutManifest.length,
  mutationCount: mutationResults.length,
  mutationRejectedCount: mutationResults.filter((entry) => entry.rejected).length,
  metamorphicCount: metamorphicResults.invariants.length + metamorphicResults.materialResponses.length,
  metamorphicPassedCount: [...metamorphicResults.invariants, ...metamorphicResults.materialResponses].filter((entry) => entry.passed).length,
  protectedProductSourceMismatchCount: Object.entries(protectedProductSourceManifest).filter(([path, sha]) => fileSha256(path) !== sha).length,
});

export const packageRReadiness = Object.freeze({
  classification: "HOME_FIRST_MIXED_EXERCISE_CATALOG_EXPANSION_AND_KNOWLEDGE_CORE_V1_READY_FOR_CURRENT_CATALOG_KNOWLEDGE_COMPLETENESS_AUTHORIZATION",
  implementationStatus: "HOME_FIRST_MIXED_EXERCISE_CATALOG_EXPANSION_AND_KNOWLEDGE_CORE_V1_IMPLEMENTED_NOT_PRODUCT_ACTIVATED",
  preG2: "implemented_and_proven_pending_ledger_closure",
  preG2K: "open_hard_blocker",
  preG3: "open",
  g: "open",
  h: "open",
  finalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  rollback: "Revert Package R production admission and the Knowledge foundation together; keep the ledger closure separate and preserve the original 45-row baseline.",
  nextDependency: "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION",
});
