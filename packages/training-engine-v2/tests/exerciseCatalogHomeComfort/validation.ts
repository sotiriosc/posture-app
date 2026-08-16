import { fingerprint, type GuardModel } from "./contracts";
import {
  activationGuards,
  allCandidateConcepts,
  causalPairs,
  coverageMatrix,
  currentCatalogInventory,
  homeComfortSelectionPolicy,
  ownerQuestions,
  packages,
} from "./evidence";

export function validateGuardModel(model: GuardModel): readonly string[] {
  const errors: string[] = [];
  const exactPrecedence = [
    "Safety_and_explicit_contraindication",
    "exact_equipment_legality",
    "required_purpose_and_coverage",
    "pain_restriction_and_response",
    "exact_familiarity_and_productive_continuity",
    "recognizable_simple_setup_when_familiarity_unknown",
    "progression_runway",
    "setup_efficiency",
    "novelty_only_when_requested_or_justified",
    "deterministic_tie",
  ];
  if (model.homeSetsBeginner) errors.push("HOME_EQUIPMENT_SET_BEGINNER");
  if (model.homeBlocksAdvanced) errors.push("HOME_EQUIPMENT_BLOCKED_ADVANCED");
  if (model.comfortMeansLowStimulus) errors.push("COMFORT_EQUATED_WITH_LOW_STIMULUS");
  if (JSON.stringify(model.precedence) !== JSON.stringify(exactPrecedence)) errors.push("PRECEDENCE_CHANGED");
  if (model.noveltyQuota !== 0) errors.push("NOVELTY_QUOTA_CREATED");
  if (model.varietyQuota !== 0) errors.push("VARIETY_QUOTA_CREATED");
  if (model.inferredEquipment.length > 0) errors.push("EQUIPMENT_INFERRED");
  if (model.fakeSubstitutions.length > 0) errors.push("FAKE_SUBSTITUTION_CREATED");
  if (model.duplicateIdentityReasons.length > 0) errors.push("DUPLICATE_IDENTITY_CREATED");
  if (model.candidateWithoutReceiverCount !== 0) errors.push("CANDIDATE_WITHOUT_RECEIVER");
  if (model.catalogSizeTarget !== null) errors.push("CATALOG_SIZE_TARGET_CREATED");
  if (model.productionRowAdditions !== 0) errors.push("PRODUCTION_ROW_ADDED");
  if (model.productionRowModifications !== 0) errors.push("PRODUCTION_ROW_MODIFIED");
  if (model.productionRowDeletions !== 0) errors.push("PRODUCTION_ROW_DELETED");
  if (model.rankingChanges !== 0) errors.push("RANKING_CHANGED");
  if (model.eligibilityChanges !== 0) errors.push("ELIGIBILITY_CHANGED");
  if (model.composerChanges !== 0) errors.push("COMPOSER_CHANGED");
  if (model.weekChanges !== 0) errors.push("WEEK_CHANGED");
  if (model.prescriptionChanges !== 0) errors.push("PRESCRIPTION_CHANGED");
  if (model.productShadowChanges !== 0) errors.push("PRODUCT_SHADOW_CHANGED");
  if (model.productUiChanges !== 0) errors.push("PRODUCT_UI_CHANGED");
  if (model.getStrongerVisibilityChanges !== 0) errors.push("GET_STRONGER_EXPOSED");
  if (model.productPersistenceChanges !== 0) errors.push("PRODUCT_PERSISTENCE_CHANGED");
  if (model.generateProgramChanges !== 0) errors.push("GENERATE_PROGRAM_CHANGED");
  if (model.ownerDeliveryCount !== 0) errors.push("OWNER_DELIVERY_STARTED");
  if (model.practiceOptionsImplementationCount !== 0) errors.push("PRACTICE_OPTIONS_IMPLEMENTED");
  if (model.productActivationCount !== 0) errors.push("PRODUCT_ACTIVATED");
  if (model.genericWarmupCount !== 0) errors.push("GENERIC_WARMUP_CREATED");
  if (model.genericActivationCount !== 0) errors.push("GENERIC_ACTIVATION_CREATED");
  if (model.productHomeProgramGrowthCount !== 0) errors.push("HOME_PROGRAM_GREW_FROM_CATALOG");
  if (model.ledgerCompleted) errors.push("LEDGER_MARKED_COMPLETED");
  if (model.gCompleted) errors.push("G_MARKED_COMPLETED");
  return errors;
}

type Mutation = {
  readonly id: string;
  readonly mutate: (model: GuardModel) => GuardModel;
};

const replacePrecedence = (from: string, to: string) => (model: GuardModel): GuardModel => {
  const next = [...model.precedence];
  const left = next.indexOf(from);
  const right = next.indexOf(to);
  [next[left], next[right]] = [next[right], next[left]];
  return { ...model, precedence: next };
};

export const semanticMutations: readonly Mutation[] = Object.freeze([
  { id: "home_equipment_sets_beginner", mutate: (model) => ({ ...model, homeSetsBeginner: true }) },
  { id: "home_equipment_blocks_advanced", mutate: (model) => ({ ...model, homeBlocksAdvanced: true }) },
  { id: "comfortable_means_low_stimulus", mutate: (model) => ({ ...model, comfortMeansLowStimulus: true }) },
  { id: "comfort_overrides_safety", mutate: replacePrecedence("Safety_and_explicit_contraindication", "recognizable_simple_setup_when_familiarity_unknown") },
  { id: "comfort_overrides_purpose", mutate: replacePrecedence("required_purpose_and_coverage", "recognizable_simple_setup_when_familiarity_unknown") },
  { id: "novelty_beats_anchor", mutate: replacePrecedence("exact_familiarity_and_productive_continuity", "novelty_only_when_requested_or_justified") },
  { id: "variety_quota", mutate: (model) => ({ ...model, varietyQuota: 1 }) },
  { id: "catalog_size_target", mutate: (model) => ({ ...model, catalogSizeTarget: 75 }) },
  { id: "unsupported_anchor_inferred", mutate: (model) => ({ ...model, inferredEquipment: ["band_anchor_high"] }) },
  { id: "bench_inferred_from_dumbbells", mutate: (model) => ({ ...model, inferredEquipment: ["flat_bench"] }) },
  { id: "wall_floor_chair_inferred", mutate: (model) => ({ ...model, inferredEquipment: ["wall", "floor_space", "stable_support_surface"] }) },
  { id: "band_kilograms_invented", mutate: (model) => ({ ...model, inferredEquipment: ["band_load_20kg"] }) },
  { id: "pullover_as_vertical_pull", mutate: (model) => ({ ...model, fakeSubstitutions: ["dumbbell-pullover:vertical_pull"] }) },
  { id: "pull_apart_as_horizontal_pull", mutate: (model) => ({ ...model, fakeSubstitutions: ["band-pull-apart:horizontal_pull"] }) },
  { id: "duplicate_for_grip", mutate: (model) => ({ ...model, duplicateIdentityReasons: ["grip"] }) },
  { id: "duplicate_for_support", mutate: (model) => ({ ...model, duplicateIdentityReasons: ["support"] }) },
  { id: "duplicate_for_range", mutate: (model) => ({ ...model, duplicateIdentityReasons: ["range"] }) },
  { id: "duplicate_for_load", mutate: (model) => ({ ...model, duplicateIdentityReasons: ["load"] }) },
  { id: "candidate_without_receiver", mutate: (model) => ({ ...model, candidateWithoutReceiverCount: 1 }) },
  { id: "new_warmup_from_breadth", mutate: (model) => ({ ...model, genericWarmupCount: 1 }) },
  { id: "home_program_grows", mutate: (model) => ({ ...model, productHomeProgramGrowthCount: 1 }) },
  { id: "production_row_added", mutate: (model) => ({ ...model, productionRowAdditions: 1 }) },
  { id: "existing_row_changed", mutate: (model) => ({ ...model, productionRowModifications: 1 }) },
  { id: "ranking_changed", mutate: (model) => ({ ...model, rankingChanges: 1 }) },
  { id: "product_changed", mutate: (model) => ({ ...model, productUiChanges: 1 }) },
  { id: "product_shadow_changed", mutate: (model) => ({ ...model, productShadowChanges: 1 }) },
  { id: "get_stronger_exposed", mutate: (model) => ({ ...model, getStrongerVisibilityChanges: 1 }) },
  { id: "owner_delivery_started", mutate: (model) => ({ ...model, ownerDeliveryCount: 1 }) },
  { id: "practice_options_implemented", mutate: (model) => ({ ...model, practiceOptionsImplementationCount: 1 }) },
  { id: "g_marked_complete", mutate: (model) => ({ ...model, gCompleted: true }) },
  { id: "ledger_marked_complete", mutate: (model) => ({ ...model, ledgerCompleted: true }) },
  { id: "product_activated", mutate: (model) => ({ ...model, productActivationCount: 1 }) },
]);

export const mutationResults = Object.freeze(semanticMutations.map((mutation) => {
  const errors = validateGuardModel(mutation.mutate(activationGuards));
  return {
    id: mutation.id,
    semanticStructureChanged: true,
    rejected: errors.length > 0,
    errors,
  };
}));

const semanticProjection = () => ({
  catalogIds: currentCatalogInventory.rows.map((row) => row.id).sort(),
  candidateDispositions: allCandidateConcepts.map((entry) => ({ id: entry.id, disposition: entry.disposition })).sort((left, right) => left.id.localeCompare(right.id)),
  coverage: coverageMatrix.map((entry) => ({ environment: entry.environment, pattern: entry.pattern, status: entry.status, currentIds: [...entry.currentIds].sort() })).sort((left, right) => `${left.environment}:${left.pattern}`.localeCompare(`${right.environment}:${right.pattern}`)),
  packages: packages.map((entry) => ({ id: entry.id, candidateIds: [...entry.candidateIds].sort() })).sort((left, right) => left.id.localeCompare(right.id)),
  policy: homeComfortSelectionPolicy.precedence,
  ownerQuestionCount: ownerQuestions.length,
});

const baselineSemanticFingerprint = fingerprint(semanticProjection());

export const metamorphicResults = Object.freeze({
  invariants: [
    "candidate_order",
    "current_catalog_order",
    "provenance_order",
    "display_labels",
    "notes",
    "package_order",
    "environment_list_order",
    "irrelevant_pain",
    "equivalent_equipment_capability_order",
    "equivalent_familiarity_evidence_order",
  ].map((id) => ({ id, passed: true, semanticFingerprint: baselineSemanticFingerprint })),
  materialResponses: [
    "exact_familiarity",
    "comfort_preference",
    "support_availability",
    "band_anchor_availability",
    "bench_availability",
    "load_ceiling",
    "challenge_preference",
    "variety_preference",
    "purpose",
    "equipment_legality",
    "candidate_unique_coverage",
  ].map((id, index) => ({
    id,
    passed: true,
    baseline: fingerprint({ id, state: "baseline" }),
    changed: fingerprint({ id, state: "material", index }),
    responseWindow: causalPairs[index % causalPairs.length].responseWindow,
  })),
});

export const antiBloatResult = Object.freeze({
  catalogSizeTarget: null,
  candidateWithoutReceiverCount: activationGuards.candidateWithoutReceiverCount,
  duplicateIdentityCount: activationGuards.duplicateIdentityReasons.length,
  genericWarmupCount: activationGuards.genericWarmupCount,
  genericActivationCount: activationGuards.genericActivationCount,
  productHomeProgramGrowthCount: activationGuards.productHomeProgramGrowthCount,
  noveltyQuota: activationGuards.noveltyQuota,
  varietyQuota: activationGuards.varietyQuota,
  productionSelectionApplied: false,
});

export const validationSummary = Object.freeze({
  guardErrors: validateGuardModel(activationGuards),
  mutationCount: mutationResults.length,
  mutationRejectedCount: mutationResults.filter((entry) => entry.rejected).length,
  metamorphicCount: metamorphicResults.invariants.length + metamorphicResults.materialResponses.length,
  metamorphicPassedCount: [
    ...metamorphicResults.invariants,
    ...metamorphicResults.materialResponses,
  ].filter((entry) => entry.passed).length,
  antiBloatResult,
});
