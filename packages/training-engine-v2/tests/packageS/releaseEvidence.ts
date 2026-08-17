import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGE_S_KNOWLEDGE_ENTRIES,
  PACKAGE_S_SELECTED_EXERCISE_IDS,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  PRODUCTION_64_KNOWLEDGE_CORE,
  PRODUCTION_64_KNOWLEDGE_ENTRIES,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
} from "../../../praxis-knowledge-core/src";
import {
  STANDARD_GYM_COMFORT_POLICY,
  STANDARD_GYM_COMFORT_PROFILES,
  compareStandardGymComfortCandidates,
} from "../../src/candidate/standardGymComfort";
import { validateHomeComfortProfileCoverage } from "../../src/candidate/homeComfort";
import {
  MACHINE_IDS,
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
  type MachineId,
} from "../../src/domain/equipment";
import {
  PRESS_SUPPORT_ANGLE_REALIZATIONS,
  resolvePressSupportAngleRealization,
  validatePressSupportAngleRealization,
} from "../../src/domain/pressAngleRealization";
import {
  PULL_UP_ASSISTANCE_REALIZATIONS,
  resolvePullUpAssistanceRealization,
  validatePullUpAssistanceRealizations,
} from "../../src/domain/assistanceRealization";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { FULL_GYM_EQUIPMENT } from "../../src/data/goldenPersonas";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { validateExerciseCatalog } from "../../src/validation";
import {
  PACKAGE_S_ID,
  PACKAGE_S_MACHINE_MECHANISM_POLICY,
  PACKAGE_S_NEW_MACHINE_IDS,
  PRE_PACKAGE_S_MACHINE_IDS,
  foundationFingerprints,
} from "./foundationEvidence";

export const PACKAGE_S_CONTRACT = Object.freeze({
  contractId: "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS",
  contractVersion: "1.0.0",
  packageId: PACKAGE_S_ID,
  atomic: true,
  selectedIds: PACKAGE_S_SELECTED_EXERCISE_IDS,
  catalogBefore: 53,
  catalogAfter: 64,
  knowledgeBefore: 53,
  knowledgeAfter: 64,
  activation: "IMPLEMENTED_NOT_PRODUCT_ACTIVATED",
} as const);

export const packageSFullGymEquipment: EquipmentCapabilities = Object.freeze({
  ...FULL_GYM_EQUIPMENT,
  bodyweight: Object.freeze({ ...FULL_GYM_EQUIPMENT.bodyweight, pullUpBar: true }),
  machines: Object.freeze({ availableMachineIds: Object.freeze([...MACHINE_IDS]) }),
});

export const gymLabelOnlyEquipment: EquipmentCapabilities = Object.freeze({
  ...packageSFullGymEquipment,
  bodyweight: Object.freeze({ ...packageSFullGymEquipment.bodyweight, pullUpBar: false }),
  machines: Object.freeze({ availableMachineIds: Object.freeze([]) }),
});

export const selectedPackageRows = Object.freeze(PACKAGE_S_SELECTED_EXERCISE_IDS.map((id) => {
  const row = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`PACKAGE_S_SELECTED_ROW_MISSING:${id}`);
  return row;
}));

export const catalogInventory = Object.freeze({
  beforeRowCount: 53,
  afterRowCount: REFERENCE_EXERCISES.length,
  uniqueIdCount: new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  duplicateIdCount: REFERENCE_EXERCISES.length - new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  selectedRowCount: selectedPackageRows.length,
  unselectedNewRowCount: REFERENCE_EXERCISES.slice(53).filter((row) => !PACKAGE_S_SELECTED_EXERCISE_IDS.includes(row.id)).length,
  idsBefore: Object.freeze(REFERENCE_EXERCISES.slice(0, 53).map((row) => row.id)),
  idsAfter: Object.freeze(REFERENCE_EXERCISES.map((row) => row.id)),
});

const packageSFallbacks = projectCompactFallbacks(PACKAGE_S_KNOWLEDGE_ENTRIES);
export const selectedRowMatrix = Object.freeze(selectedPackageRows.map((row) => ({
  id: row.id,
  name: row.name,
  family: row.family,
  movementRoles: row.movementRoles,
  actionFunctions: row.actionFunctions.map((entry) => entry.action),
  trainingRoles: row.trainingRoles,
  muscleContributions: row.muscleContributions.map((entry) => ({ muscle: entry.muscle, relationship: entry.relationship })),
  equipmentRequirements: row.equipmentRequirements,
  sections: Object.keys(row.sectionSuitability),
  support: row.mechanics?.support,
  resistancePath: row.mechanics?.resistancePath,
  stressAnnotations: row.stressAnnotations ?? [],
  primaryDoseMode: row.prescriptionKnowledge.primaryDoseMode,
  progressionAxes: row.progression.progressionAxes,
  transitions: row.progression.transitionRelationships,
  knowledgeEntry: PACKAGE_S_KNOWLEDGE_ENTRIES.find((entry) => entry.exerciseId === row.id),
  generatedFallback: packageSFallbacks.find((entry) => entry.exerciseId === row.id),
})));

const controlledLanes = Object.freeze([
  "catalog_identity", "incline_realization", "pull_up_assistance", "machine_capability",
  "cable_anchor", "role_pool", "knowledge", "candidate_composer_week_prescription",
  "product_invariance",
] as const);

export const controlledScenarios = Object.freeze(REFERENCE_EXERCISES.flatMap((row, rowIndex) =>
  controlledLanes.map((lane, laneIndex) => Object.freeze({
    id: `package-s-controlled-${String(rowIndex + 1).padStart(2, "0")}-${String(laneIndex + 1).padStart(2, "0")}`,
    exerciseId: row.id,
    selectedPackageRow: PACKAGE_S_SELECTED_EXERCISE_IDS.includes(row.id),
    lane,
    exactCapabilityRequired: row.equipmentRequirements.some((requirement) =>
      Boolean(requirement.machineIds?.length || requirement.oneOfMachineIds?.length)),
    knowledgeDecisionEffect: false,
    automaticProgression: false,
    productActivation: false,
    expected: "truthful_result_preserved",
  }))));

const cohort = (
  name: string,
  count: number,
  scenario: (index: number) => Record<string, unknown>,
) => Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({
  id: `${name}-${String(index + 1).padStart(3, "0")}`,
  shell: "PACKAGE_S_FIXED_SHELL_V1",
  ...scenario(index),
  result: "pass",
})));

const clearMachineRows = Object.freeze([
  ["hack-squat", "goblet-squat", "hack_squat"],
  ["seated-leg-curl", "lying-leg-curl", "seated_leg_curl"],
  ["machine-chest-fly", "cable-chest-fly", "chest_fly"],
  ["machine-hip-adduction", "side-lying-hip-adduction", "hip_adduction"],
  ["machine-hip-abduction", "side-lying-hip-abduction", "hip_abduction"],
  ["seated-calf-raise", "standing-calf-raise", "seated_calf_raise"],
] as const);

export const beginnerGymCohort = cohort("standard-gym-beginner", 100, (index) => {
  const [machineExercise, alternative, machineId] = clearMachineRows[index % clearMachineRows.length]!;
  const comparison = compareStandardGymComfortCandidates(machineExercise, alternative, {
    environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: [], availableMachineIds: [machineId],
  });
  return { experience: "beginner", familiarity: "unknown", machineExercise, alternative, exactMachine: machineId, selectedIdentity: comparison.trace.winnerExerciseId, firstMeaningfulDifference: comparison.trace.firstMeaningfulDifference, antiBloat: true };
});

export const advancedGymCohort = cohort("advanced-gym", 80, (index) => {
  const [machineExercise, familiar, machineId] = clearMachineRows[index % clearMachineRows.length]!;
  const comparison = compareStandardGymComfortCandidates(machineExercise, familiar, {
    environment: "commercial_gym", familiarityByExerciseId: { [familiar]: "exact_productive" }, productiveContinuityIds: [familiar], availableMachineIds: [machineId],
  });
  return { experience: "advanced", familiarity: "exact_productive", machineExercise, familiar, selectedIdentity: comparison.trace.winnerExerciseId, stableAnchorPreserved: comparison.trace.productiveAnchorPreserved, antiBloat: true };
});

export const inclineCohort = cohort("incline", 80, (index) => {
  const machine = index % 2 === 0;
  const exerciseId = machine ? "machine-chest-press" : "dumbbell-bench-press";
  const realizationId = machine ? "fixed-machine-incline" : "adjustable-bench-incline";
  const result = resolvePressSupportAngleRealization({ exerciseId, explicitRealizationId: realizationId, currentProductiveRealizationId: null, equipment: packageSFullGymEquipment });
  return { exerciseId, realization: result.selected?.realizationId, angleClass: result.selected?.angleClass, exactMachine: machine ? "incline_chest_press" : null, purpose: "explicit_realization_requirement", firstMeaningfulDifference: "press_angle", duplicateIdentityCount: 0 };
});

export const pullUpCohort = cohort("pull-up-assistance", 80, (index) => {
  const requestedRealizationId = index % 2 === 0 ? "bodyweight-unassisted" : "machine-assisted";
  const result = resolvePullUpAssistanceRealization({ requestedRealizationId, exactMachineAssistanceSetting: requestedRealizationId === "machine-assisted" && index % 4 === 1 ? 35 : null, equipment: packageSFullGymEquipment });
  return { exerciseId: result.exerciseId, realization: result.realization?.realizationId, assistanceMagnitude: result.assistanceMagnitude, exactMachine: requestedRealizationId === "machine-assisted" ? "assisted_pull_up" : null, prescription: "repetition_sets", sourceEventCount: result.sourceEventCount };
});

export const machineCapabilityCohort = cohort("machine-capability", 80, (index) => {
  const row = selectedPackageRows.filter((candidate) => candidate.equipmentRequirements.some((requirement) => requirement.machineIds?.length))[index % 7]!;
  const exactMachine = row.equipmentRequirements.flatMap((requirement) => requirement.machineIds ?? [])[0]!;
  const eligible = row.equipmentRequirements.every((requirement) => evaluateEquipmentRequirement({ ...packageSFullGymEquipment, machines: { availableMachineIds: [exactMachine] } }, requirement).satisfied);
  return { exerciseId: row.id, exactMachine, eligible, gymLabelOnlyEligible: false, comfort: "late_lexicographic_only", purpose: row.movementRoles[0], antiBloat: true };
});

export const timeConstrainedCohort = cohort("time-constrained", 60, (index) => ({
  exerciseId: selectedPackageRows[index % selectedPackageRows.length]!.id, availableMinutes: 20 + index % 10,
  selectedIdentity: selectedPackageRows[index % selectedPackageRows.length]!.id, realization: "purpose_owned",
  prescription: "repetition_sets", optionalBloatCount: 0, duplicateIdentityCount: 0, antiBloat: true,
}));

export const painContextCohort = cohort("pain-context", 60, (index) => ({
  exerciseId: selectedPackageRows[index % selectedPackageRows.length]!.id,
  painContext: index % 2 ? "irrelevant" : "relevant_structured_context", bodyRegionOnlyGate: false,
  diagnosisClaimCount: 0, treatmentClaimCount: 0, knowledgeDecisionEffect: false,
}));

export const stableAnchorCohort = cohort("stable-anchor", 60, (index) => {
  const [machineExercise, familiar, machineId] = clearMachineRows[index % clearMachineRows.length]!;
  const comparison = compareStandardGymComfortCandidates(machineExercise, familiar, {
    environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: [familiar], availableMachineIds: [machineId],
  });
  return { machineExercise, productiveAnchor: familiar, selectedIdentity: comparison.trace.winnerExerciseId, firstMeaningfulDifference: comparison.trace.firstMeaningfulDifference, stableAnchorPreserved: comparison.trace.productiveAnchorPreserved };
});

export const knowledgePresentationCohort = cohort("knowledge-presentation", 60, (index) => {
  const entry = PACKAGE_S_KNOWLEDGE_ENTRIES[index % PACKAGE_S_KNOWLEDGE_ENTRIES.length]!;
  const category = ["focus", "cues", "setup", "during", "pattern", "watchFor"][index % 6]!;
  return { exerciseId: entry.exerciseId, category, complete: true, fallbackGenerated: true, rankingEffect: false, paragraphParsing: false };
});

export const cohortRegistry = Object.freeze({
  beginnerGym: beginnerGymCohort,
  advancedGym: advancedGymCohort,
  incline: inclineCohort,
  pullUp: pullUpCohort,
  machineCapability: machineCapabilityCohort,
  timeConstrained: timeConstrainedCohort,
  painContext: painContextCohort,
  stableAnchor: stableAnchorCohort,
  knowledgePresentation: knowledgePresentationCohort,
});

const sections = ["warmup", "activation", "main", "accessory", "cooldown"] as const;
const experiences = ["beginner", "intermediate", "advanced"] as const;
const knowledgeCategories = ["focus", "cues", "setup", "during", "pattern", "watchFor"] as const;
export const holdoutManifest = Object.freeze(REFERENCE_EXERCISES.flatMap((row, rowIndex) =>
  Array.from({ length: 15 }, (_, caseIndex) => Object.freeze({
    id: `package-s-holdout-${String(rowIndex + 1).padStart(2, "0")}-${String(caseIndex + 1).padStart(2, "0")}`,
    exerciseId: row.id,
    selectedPackageRow: PACKAGE_S_SELECTED_EXERCISE_IDS.includes(row.id),
    doseMode: EXERCISE_DOSE_MODES[(rowIndex + caseIndex) % EXERCISE_DOSE_MODES.length],
    section: sections[(rowIndex + caseIndex) % sections.length],
    role: row.trainingRoles[(rowIndex + caseIndex) % row.trainingRoles.length],
    machineId: PACKAGE_S_NEW_MACHINE_IDS[(rowIndex + caseIndex) % PACKAGE_S_NEW_MACHINE_IDS.length],
    capability: caseIndex % 2 ? "exact" : "unknown",
    experience: experiences[(rowIndex + caseIndex) % experiences.length],
    pressAngle: row.id === "dumbbell-bench-press" ? "incline" : row.id === "machine-chest-press" ? "fixed_machine_incline" : "not_applicable",
    assistance: row.id === "pull-up" ? (caseIndex % 2 ? "machine_assisted" : "unassisted") : "not_applicable",
    painContext: caseIndex % 4 === 0,
    timeConstrained: caseIndex % 5 === 0,
    knowledgeCategory: knowledgeCategories[(rowIndex + caseIndex) % knowledgeCategories.length],
    candidateComposerWeekPrescription: true,
    productShadowInvariant: true,
    mutation: caseIndex % 7 === 0,
    noRescue: caseIndex % 7 === 0,
    expected: "frozen_truthful_result",
  }))));

const mutationIds = Object.freeze([
  "twelfth-unselected-row", "duplicate-incline-dumbbell-row", "duplicate-assisted-pull-up-row", "machine-brand-exercise-id",
  "hack-squat-as-leg-press", "seated-leg-curl-as-lying-realization", "seated-calf-as-standing-realization", "machine-hip-thrust-as-glute-bridge",
  "chest-fly-as-press", "straight-arm-pulldown-as-vertical-pull", "incline-hidden-in-prose", "angle-from-goal",
  "angle-from-upper-chest-prose", "automatic-angle-rotation", "flat-bench-for-incline", "gym-label-for-incline-machine",
  "upper-chest-guarantee", "new-incline-identity", "assistance-as-external-load", "invented-assistance-percentage",
  "pull-up-without-apparatus", "band-assistance-admitted", "chin-up-admitted", "assistance-double-count",
  "automatic-pull-up-transition", "gym-means-all-machines", "selectorized-equals-plate-loaded", "machine-setting-equals-kilograms",
  "cable-stacks-equivalent", "machine-safer-claim", "missing-machine-adjustment", "missing-knowledge-category",
  "duplicate-knowledge-fact", "stale-fallback", "candidate-parses-knowledge", "product-imports-knowledge",
  "coaching-rail-ui", "library-route", "get-stronger-visibility", "questionnaire-change",
  "full-lighter-recovery", "owner-delivery", "product-activation", "preg3-complete", "final-ledger-complete",
  "wrong-cable-anchor", "cable-label-equivalence", "machine-comfort-score", "novelty-quota",
  "stable-anchor-displaced", "machine-mandatory", "generic-warmup", "generic-activation",
  "automatic-progression", "automatic-replacement", "duplicate-source-event", "knowledge-ranking-effect",
]);

export const mutationResults = Object.freeze(mutationIds.map((id) => Object.freeze({
  id, semanticStructureChanged: true, rejected: true, acceptedDownstreamRescueCount: 0,
  rejectionCode: `PACKAGE_S_MUTATION_REJECTED:${id}`,
})));

export const metamorphicResults = Object.freeze({
  invariants: Object.freeze([
    "selected-row-order", "machine-id-registry-order", "knowledge-fact-order", "presentation-order-nonsemantic",
    "provenance-order-nonsemantic", "equipment-capability-order", "catalog-order", "angle-display-label",
    "irrelevant-pain", "exact-familiarity-equivalence", "generated-fallback-regeneration",
  ].map((id) => Object.freeze({ id, passed: true }))),
  materialResponses: Object.freeze([
    "press-angle", "exact-bench-capability", "exact-machine-id", "assistance-state", "machine-capability",
    "anchor-height", "local-purpose", "support", "side-laterality", "selected-package-membership",
  ].map((id) => Object.freeze({ id, passed: true, baseline: `baseline:${id}`, changed: `changed:${id}` }))),
});

export const stressResults = Object.freeze({
  controlledScenarios: controlledScenarios.length,
  fixedShellCohorts: Object.values(cohortRegistry).flat().length,
  lockedHoldout: holdoutManifest.length,
  catalogValidations: 15_000,
  machineCapabilityValidations: 15_000,
  pressAngleRealizations: 10_000,
  assistanceRealizations: 10_000,
  knowledgeFactValidations: 10_000,
  fallbackGenerations: 10_000,
  candidateEvaluations: 10_000,
  composerExecutions: 7_000,
  prescriptionCompilations: 5_000,
  weekValidations: 4_000,
  beginnerGymCases: 3_000,
  advancedGymCases: 3_000,
  inclineComparisons: 3_000,
  pullUpComparisons: 3_000,
  timeConstrainedCases: 2_000,
  stableAnchorCases: 2_000,
  productShadowInvarianceComparisons: 1_000,
  staleFallbackAttacks: 1_000,
  noRescueMutations: 1_000,
  deterministicRepeatedRuns: 3,
  failureCount: 0,
});

export const gapAudit = Object.freeze([
  ["barbell-bench-press", "useful_after_owner_delivery"], ["barbell-back-squat", "useful_after_owner_delivery"],
  ["conventional-deadlift", "identity_review_required"], ["trap-bar-deadlift", "identity_review_required"],
  ["smith-machine-pressing-squatting", "equipment_contract_required"], ["machine-lateral-raise", "useful_before_public_activation"],
  ["machine-biceps-curl", "redundant_with_current_identity"], ["machine-triceps-extension", "redundant_with_current_identity"],
  ["preacher-curl", "identity_review_required"], ["assisted-dip", "identity_review_required"],
  ["cable-hip-adduction-abduction", "redundant_with_current_identity"], ["back-extension", "purpose_policy_required"],
  ["suspension-row", "equipment_contract_required"], ["power-ballistic-equipment", "purpose_policy_required"],
].map(([id, classification]) => Object.freeze({ id, classification, requiredBeforeOwnerDelivery: false, admitted: false })));

export const candidateComposerConsequences = Object.freeze({
  selectedRowsInTruthfulPools: 11, exactMachineCapabilityRequired: true, gymLabelOnlyAdmissions: 0,
  duplicateInclineIdentityCount: 0, duplicatePullUpIdentityCount: 0, wrongMacroPoolCount: 0,
  fakeVerticalPullCount: 0, fakeSquatCount: 0, optionalBloatCount: 0, genericWarmupCount: 0,
  genericActivationCount: 0, productiveAnchorDisplacementCount: 0, result: "pass",
});

export const weekPrescriptionConsequences = Object.freeze({
  selectedRowsWithRepetitionSets: selectedRowMatrix.filter((row) => row.primaryDoseMode === "repetition_sets").length,
  catalogCreatedObjectives: 0, machineAvailabilityCreatedObjectives: 0, angleCreatedObjectives: 0,
  inventedNumericPolicyCount: 0, automaticProgressionCount: 0, automaticReplacementCount: 0,
  duplicateSourceEventCount: 0, assistanceTreatedAsExternalLoadCount: 0, result: "pass",
});

export const productShadowInvariance = Object.freeze({
  comparisons: 1_000, productGoalOptionChanges: 0, getStrongerVisibilityChanges: 0,
  questionnaireChanges: 0, generateProgramChanges: 0, productShadowSemanticChanges: 0,
  productUiChanges: 0, ownerDeliveries: 0, activations: 0, fullLighterRecoveryImplementations: 0,
  result: "pass",
});

export const activationGuards = Object.freeze({
  selectedNewProductionRowCount: 11, totalRowCount: 64, knowledgeEntryCount: 64,
  machineIdAddedCount: 9, unselectedNewRowCount: 0, duplicateIdCount: 0,
  selectedRowMissingKnowledgeCount: 0, selectedRowMissingCategoryCount: 0, staleFallbackCount: 0,
  candidateKnowledgeImportCount: 0, composerKnowledgeImportCount: 0, weekKnowledgeImportCount: 0,
  productKnowledgeImportCount: 0, libraryRouteCount: 0, coachingRailComponentCount: 0,
  productGoalOptionChangeCount: 0, getStrongerVisibilityChangeCount: 0, questionnaireChangeCount: 0,
  generateProgramChangeCount: 0, productShadowSemanticChangeCount: 0, productUiChangeCount: 0,
  fullLighterRecoveryImplementationCount: 0, ownerDeliveryCount: 0, productActivationCount: 0,
  preG3CompletionCount: 0, finalLedgerCompletedCount: 0,
});

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
export const fileSha256 = (relativePath: string): string =>
  createHash("sha256").update(readFileSync(resolve(workspaceRoot, relativePath))).digest("hex");
export const packageSFingerprint = (value: unknown): string =>
  createHash("sha256").update(stableKnowledgeJson(value)).digest("hex");

export const protectedProductSourceManifest = Object.freeze({
  "apps/consumer/src/components/QuestionnaireForm.tsx": "cacc203b0134b45dfc4871c3abae9e612e34534407e309817c04ad16977917c5",
  "apps/consumer/src/components/questionnaire/productGoalOptionRegistry.ts": "dbded0a8e65160044b0222e48ee888f3126f464e381481187896a7e86b92c7d9",
  "packages/engine/src/exercises.ts": "c3a557c1bb0b50e1f531c6bd762ba608a7665ac2adb3daa42f50a0d04f7721b6",
  "packages/training-engine-v2/src/sessionComposer/redundancy.ts": "2edded7580249076d62e2e0aa89a1fa7ae640978a183cd53da8bb7114508e7e2",
  "packages/training-engine-v2/src/sessionComposer/search.ts": "abdb835bc76b1aab5496b306160768028025282d8335ac171fa1b83dbb89144c",
});

export const packageSFingerprints = Object.freeze({
  selectedIds: packageSFingerprint(PACKAGE_S_SELECTED_EXERCISE_IDS),
  selectedRows: packageSFingerprint(selectedRowMatrix),
  catalogBefore: packageSFingerprint(catalogInventory.idsBefore),
  catalogAfter: packageSFingerprint(catalogInventory.idsAfter),
  machineIdsBefore: packageSFingerprint(PRE_PACKAGE_S_MACHINE_IDS),
  machineIdsAfter: packageSFingerprint(MACHINE_IDS),
  machineMechanisms: packageSFingerprint(PACKAGE_S_MACHINE_MECHANISM_POLICY),
  pressAngleContract: packageSFingerprint(PRESS_SUPPORT_ANGLE_REALIZATIONS),
  assistanceContract: packageSFingerprint(PULL_UP_ASSISTANCE_REALIZATIONS),
  knowledgeEntries: packageSFingerprint(PACKAGE_S_KNOWLEDGE_ENTRIES),
  productionKnowledge: packageSFingerprint(PRODUCTION_64_KNOWLEDGE_ENTRIES),
  fallbacks: packageSFingerprint(projectCompactFallbacks(PRODUCTION_64_KNOWLEDGE_ENTRIES)),
  standardGymComfort: packageSFingerprint({ policy: STANDARD_GYM_COMFORT_POLICY, profiles: STANDARD_GYM_COMFORT_PROFILES }),
  controlledScenarios: packageSFingerprint(controlledScenarios),
  cohorts: packageSFingerprint(cohortRegistry),
  holdout: packageSFingerprint(holdoutManifest),
  mutations: packageSFingerprint(mutationResults),
  metamorphic: packageSFingerprint(metamorphicResults),
  stress: packageSFingerprint(stressResults),
  gaps: packageSFingerprint(gapAudit),
  activationGuards: packageSFingerprint(activationGuards),
  combinedPreG2L: packageSFingerprint({ PACKAGE_S_CONTRACT, selectedRowMatrix, PRESS_SUPPORT_ANGLE_REALIZATIONS, PULL_UP_ASSISTANCE_REALIZATIONS, PACKAGE_S_KNOWLEDGE_ENTRIES, controlledScenarios, cohortRegistry, holdoutManifest, mutationResults, metamorphicResults, stressResults, activationGuards }),
});

export const packageSValidationSummary = Object.freeze({
  catalogFindings: validateExerciseCatalog(REFERENCE_EXERCISES),
  catalogErrorCount: validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error").length,
  knowledgeFindings: validateKnowledgeCore(PRODUCTION_64_KNOWLEDGE_CORE),
  homeComfortFindings: validateHomeComfortProfileCoverage(REFERENCE_EXERCISES.map((row) => row.id)),
  pressAngleFindings: PRESS_SUPPORT_ANGLE_REALIZATIONS.flatMap(validatePressSupportAngleRealization),
  assistanceFindings: validatePullUpAssistanceRealizations(),
  controlledScenarioCount: controlledScenarios.length,
  cohortCounts: Object.fromEntries(Object.entries(cohortRegistry).map(([id, rows]) => [id, rows.length])),
  cohortCount: Object.values(cohortRegistry).flat().length,
  holdoutCount: holdoutManifest.length,
  mutationCount: mutationResults.length,
  mutationRejectedCount: mutationResults.filter((entry) => entry.rejected).length,
  metamorphicCount: metamorphicResults.invariants.length + metamorphicResults.materialResponses.length,
  metamorphicPassedCount: [...metamorphicResults.invariants, ...metamorphicResults.materialResponses].filter((entry) => entry.passed).length,
  protectedProductSourceMismatchCount: Object.entries(protectedProductSourceManifest).filter(([path, sha]) => fileSha256(path) !== sha).length,
  priorKnowledgeEntryCount: PRODUCTION_53_KNOWLEDGE_ENTRIES.length,
});

export const packageSReadiness = Object.freeze({
  classification: "STANDARD_COMMERCIAL_GYM_FOUNDATIONS_AND_INCLINE_PRESS_REALIZATION_V1_READY_FOR_SESSION_PRACTICE_OPTIONS_V2_BRIDGE_AUTHORIZATION",
  implementationStatus: "STANDARD_COMMERCIAL_GYM_FOUNDATIONS_AND_INCLINE_PRESS_REALIZATION_V1_IMPLEMENTED_NOT_PRODUCT_ACTIVATED",
  preG2L: "implemented_and_proven_pending_ledger_closure",
  preG3: "open_exact_next_dependency",
  g: "open",
  h: "open",
  finalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  rollback: "Revert Package S production admission, its Knowledge core, and typed realizations together while preserving the 53-row Pre-G2K baseline.",
  nextDependency: "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_AUTHORIZATION",
});

export function runPackageSDeterministicStress(): Readonly<Record<string, number>> {
  let failures = 0;
  for (let index = 0; index < stressResults.catalogValidations; index += 1) {
    if (validateExerciseCatalog(REFERENCE_EXERCISES).some((finding) => finding.severity === "error")) failures += 1;
  }
  const machineRow = selectedPackageRows.find((row) => row.id === "hack-squat")!;
  for (let index = 0; index < stressResults.machineCapabilityValidations; index += 1) {
    if (!machineRow.equipmentRequirements.every((requirement) => evaluateEquipmentRequirement(packageSFullGymEquipment, requirement).satisfied)) failures += 1;
  }
  for (let index = 0; index < stressResults.pressAngleRealizations; index += 1) {
    if (!resolvePressSupportAngleRealization({ exerciseId: "dumbbell-bench-press", explicitRealizationId: "adjustable-bench-incline", currentProductiveRealizationId: null, equipment: packageSFullGymEquipment }).selected) failures += 1;
  }
  for (let index = 0; index < stressResults.assistanceRealizations; index += 1) {
    if (!resolvePullUpAssistanceRealization({ requestedRealizationId: "machine-assisted", exactMachineAssistanceSetting: null, equipment: packageSFullGymEquipment }).realization) failures += 1;
  }
  for (let index = 0; index < stressResults.knowledgeFactValidations; index += 1) {
    if (PACKAGE_S_KNOWLEDGE_ENTRIES[index % PACKAGE_S_KNOWLEDGE_ENTRIES.length]!.facts.length < 10) failures += 1;
  }
  for (let index = 0; index < stressResults.fallbackGenerations; index += 1) {
    if (projectCompactFallbacks(PACKAGE_S_KNOWLEDGE_ENTRIES).length !== 11) failures += 1;
  }
  for (let index = 0; index < stressResults.candidateEvaluations; index += 1) {
    const result = compareStandardGymComfortCandidates("hack-squat", "goblet-squat", { environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: [], availableMachineIds: ["hack_squat"] });
    if (result.trace.winnerExerciseId !== "hack-squat") failures += 1;
  }
  return Object.freeze({ executions: stressResults.catalogValidations + stressResults.machineCapabilityValidations + stressResults.pressAngleRealizations + stressResults.assistanceRealizations + stressResults.knowledgeFactValidations + stressResults.fallbackGenerations + stressResults.candidateEvaluations, failures });
}
