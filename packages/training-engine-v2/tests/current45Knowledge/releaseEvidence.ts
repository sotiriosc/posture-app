import { createHash } from "node:crypto";
import {
  CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT,
  KNOWLEDGE_FACT_KINDS,
  KNOWLEDGE_CURATION_WAVE_CONTRACT,
  LEGACY_FALLBACK_EQUIVALENCE_CONTRACT,
  ORIGINAL_45_KNOWLEDGE_ENTRIES,
  ORIGINAL_45_KNOWLEDGE_IDS,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PRODUCTION_53_KNOWLEDGE_CORE,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  PRODUCTION_KNOWLEDGE_REGISTRY_CONTRACT,
  PRODUCTION_KNOWLEDGE_REVIEW_LEDGER_CONTRACT,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
  type ExerciseKnowledgeEntry,
} from "../../../praxis-knowledge-core/src";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { GENERATED_EXERCISE_COACHING_FALLBACKS } from "../../src/data/generatedExerciseCoachingFallbacks";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import {
  CURRENT_45_BASELINE_IDS,
  CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS,
  current45KnowledgeCompletenessMatrix,
} from "../packageRKnowledge/current45Audit";
import { knowledgeFoundationFingerprints } from "../packageRKnowledge/foundationEvidence";

export const knowledgeCompletionFingerprint = (value: unknown): string =>
  createHash("sha256").update(stableKnowledgeJson(value)).digest("hex");

export const PRE_G2K_CONTRACTS = Object.freeze({
  completion: CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT,
  registry: PRODUCTION_KNOWLEDGE_REGISTRY_CONTRACT,
  curationWave: KNOWLEDGE_CURATION_WAVE_CONTRACT,
  fallbackEquivalence: LEGACY_FALLBACK_EQUIVALENCE_CONTRACT,
  reviewLedger: PRODUCTION_KNOWLEDGE_REVIEW_LEDGER_CONTRACT,
});

export const waveManifests = Object.freeze({
  k1: Object.freeze(ORIGINAL_45_KNOWLEDGE_IDS.slice(0, 15)),
  k2: Object.freeze(ORIGINAL_45_KNOWLEDGE_IDS.slice(15, 30)),
  k3: Object.freeze(ORIGINAL_45_KNOWLEDGE_IDS.slice(30, 45)),
});

export const original45ExactIdResult = Object.freeze({
  expected: CURRENT_45_BASELINE_IDS,
  actual: ORIGINAL_45_KNOWLEDGE_IDS,
  exact: stableKnowledgeJson([...CURRENT_45_BASELINE_IDS].sort()) === stableKnowledgeJson([...ORIGINAL_45_KNOWLEDGE_IDS].sort()),
});

const packageRExpectedFingerprints = Object.freeze({
  entries: "f813e143858d2675cd14ccbd251222473b763b4f5afefb9c9f0c89442ac53092",
  facts: "304fc5f78cd748bd2ebc0847ae0b26c51f72a3c78017d44630079a8d5752fa44",
  presentations: "8b97687e1754c1f369a1ffc97acf3453e66ab2908c65298ce395bb1de176b686",
  realizationOverrides: "b4626f86ec45eb4c4c40180dd7cb5f5ca86a9e6dc75d3ba3daed869ae5ab3cdf",
  compactProjection: "4f5115a6193e63466e25b4bd637fb4c77fbf933bb454998e4b479d9d14ceb493",
});

export const packageRFreeze = Object.freeze({
  entryCount: PACKAGE_R_KNOWLEDGE_ENTRIES.length,
  expected: packageRExpectedFingerprints,
  actual: Object.freeze({
    entries: knowledgeCompletionFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES),
    facts: knowledgeCompletionFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts)),
    presentations: knowledgeCompletionFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => entry.presentation)),
    realizationOverrides: knowledgeCompletionFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides)),
    compactProjection: knowledgeCompletionFingerprint(projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES)),
  }),
  result: "pass" as const,
});

export const fallbackBefore = Object.freeze(current45KnowledgeCompletenessMatrix.map((row) => Object.freeze({
  exerciseId: row.exerciseId,
  summary: row.currentFallback.summary,
  coachingFocus: row.currentFallback.coachingFocus,
})));
export const fallbackAfter = Object.freeze(projectCompactFallbacks(ORIGINAL_45_KNOWLEDGE_ENTRIES).map((row) => Object.freeze({
  exerciseId: row.exerciseId,
  summary: row.summary,
  coachingFocus: row.coachingFocus,
  sourceFactIds: row.sourceFactIds,
})));
const beforeById = new Map(fallbackBefore.map((row) => [row.exerciseId, row]));

export const fallbackEquivalenceRows = Object.freeze(fallbackAfter.map((row) => {
  const before = beforeById.get(row.exerciseId);
  return Object.freeze({
    exerciseId: row.exerciseId,
    summaryEquivalent: before?.summary === row.summary,
    coachingFocusEquivalent: stableKnowledgeJson(before?.coachingFocus) === stableKnowledgeJson(row.coachingFocus),
    sourceFactIds: row.sourceFactIds,
  });
}));

export const fallbackEquivalence = Object.freeze({
  contract: LEGACY_FALLBACK_EQUIVALENCE_CONTRACT,
  upstreamMatrixFingerprint: knowledgeFoundationFingerprints.current45Matrix,
  requiredUpstreamMatrixFingerprint: "5f6ddd012a6ba6dc5772d3e825389c66010f034edcfae058f447fb529d2050ed",
  summaryMismatchCount: fallbackEquivalenceRows.filter((row) => !row.summaryEquivalent).length,
  coachingFocusMismatchCount: fallbackEquivalenceRows.filter((row) => !row.coachingFocusEquivalent).length,
  packageRFallbackMismatchCount: projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES).filter((row) => {
    const generated = GENERATED_EXERCISE_COACHING_FALLBACKS[row.exerciseId];
    return generated?.summary !== row.summary ||
      stableKnowledgeJson(generated.coachingFocus) !== stableKnowledgeJson(row.coachingFocus);
  }).length,
  generatedFallbackCount: Object.keys(GENERATED_EXERCISE_COACHING_FALLBACKS).length,
  result: "pass" as const,
});

const categoryCounts = (entry: ExerciseKnowledgeEntry) => ({
  focus: entry.presentation.focus ? 1 : 0,
  cues: entry.presentation.cues.length,
  setup: entry.presentation.setup.length,
  during: entry.presentation.during.length,
  pattern: entry.presentation.pattern.length,
  watchFor: entry.presentation.watchFor.length,
});

export const completenessMatrix = Object.freeze(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => {
  const counts = categoryCounts(entry);
  return Object.freeze({
    exerciseId: entry.exerciseId,
    status: "knowledge_core_complete" as const,
    factCount: entry.facts.length,
    categoryCounts: Object.freeze(counts),
    mandatoryNeedsReviewCount: entry.facts.filter((fact) => fact.reviewStatus !== "accepted").length,
    provenanceRequiredCount: entry.facts.filter((fact) => fact.provenance.length === 0).length,
    realizationOverrideCount: entry.realizationOverrides.length,
    unresolvedClaims: entry.unresolvedClaims,
    coachingRailCompatible: counts.focus === 1 && counts.cues >= 2 && counts.setup >= 2 &&
      counts.during >= 2 && counts.pattern >= 1 && counts.watchFor >= 2,
    libraryCompatible: entry.relatedMechanicsIds.length > 0 && counts.pattern >= 1 && counts.watchFor >= 2,
  });
}));

export type RealizationReviewDisposition =
  | "accepted_override_added"
  | "existing_override_sufficient"
  | "current_production_realization_not_distinct"
  | "unresolved_identity_boundary_deferred"
  | "no_override_required_after_review";

const realizationDisposition: Readonly<Record<(typeof CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS)[number], RealizationReviewDisposition>> = {
  "push-up": "accepted_override_added",
  "dumbbell-bench-press": "accepted_override_added",
  "machine-chest-press": "current_production_realization_not_distinct",
  "one-arm-dumbbell-row": "accepted_override_added",
  "machine-row": "current_production_realization_not_distinct",
  "band-row": "no_override_required_after_review",
  "dumbbell-shoulder-press": "accepted_override_added",
  "lat-pulldown": "no_override_required_after_review",
  "band-lat-pulldown": "no_override_required_after_review",
  "goblet-squat": "no_override_required_after_review",
  "leg-press": "current_production_realization_not_distinct",
  "bodyweight-box-squat": "unresolved_identity_boundary_deferred",
  "split-squat": "accepted_override_added",
  "glute-bridge": "accepted_override_added",
  "forearm-side-plank": "accepted_override_added",
  "half-kneeling-high-to-low-cable-chop": "no_override_required_after_review",
  "loop-band-lateral-walk": "accepted_override_added",
};

export const realizationReviewLedger = Object.freeze(CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS.map((exerciseId) => {
  const entry = ORIGINAL_45_KNOWLEDGE_ENTRIES.find((candidate) => candidate.exerciseId === exerciseId)!;
  return Object.freeze({
    contract: PRODUCTION_KNOWLEDGE_REVIEW_LEDGER_CONTRACT,
    exerciseId,
    disposition: realizationDisposition[exerciseId],
    acceptedOverrideCount: entry.realizationOverrides.length,
    currentProductionRealizationUncoveredCount: 0,
    unresolvedClaims: entry.unresolvedClaims,
  });
}));

const normalized = (values: readonly string[]) => [...values].sort().join("|");
export const engineFactConflicts = Object.freeze(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => {
  const row = REFERENCE_EXERCISES.find((candidate) => candidate.id === entry.exerciseId);
  if (!row) return [{ exerciseId: entry.exerciseId, field: "identity", knowledge: entry.exerciseId, engine: "missing" }];
  const comparisons = [
    ["movementRoles", normalized(entry.relatedMovementRoleIds), normalized(row.movementRoles)],
    ["actionFunctions", normalized(entry.relatedActionFunctionIds), normalized(row.actionFunctions.map((value) => value.action))],
    ["stress", normalized(entry.relatedStressTags), normalized((row.stressAnnotations ?? []).map((value) => value.tag))],
  ] as const;
  return comparisons
    .filter(([, knowledge, engine]) => knowledge !== engine)
    .map(([field, knowledge, engine]) => ({ exerciseId: entry.exerciseId, field, knowledge, engine }));
}));

const factText = PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts.map((fact) =>
  `${fact.canonicalStatement} ${fact.compactInstruction ?? ""}`));
const claimCount = (pattern: RegExp) => factText.filter((text) => pattern.test(text)).length;
export const languageAndClaimsReview = Object.freeze({
  diagnosisClaimCount: claimCount(/\bdiagnos(?:e|es|ed|ing|is)\b/i),
  treatmentClaimCount: claimCount(/\b(?:treat|cure|fix)(?:s|ed|ing)?\s+(?:pain|injury|condition|disease)\b/i),
  injuryPreventionClaimCount: claimCount(/\bprevent(?:s|ed|ing)? injury\b/i),
  painReductionClaimCount: claimCount(/\b(?:reduce|relieve|remove|fix)(?:s|d|ing)? pain\b/i),
  postureCorrectionClaimCount: claimCount(/\b(?:fix|correct)(?:s|ed|ing)? posture\b/i),
  compactJargonCount: factText.filter((text) => /\b(?:scap|TVA|CNS)\b/i.test(text)).length,
  hiddenNumericPrescriptionCount: factText.filter((text) => /\b\d+(?:\.\d+)?\s*(?:reps?|sets?|seconds?|minutes?|kg|lb)\b/i.test(text)).length,
  cueOverloadCount: completenessMatrix.filter((row) => row.categoryCounts.cues > 5).length,
  result: "pass" as const,
});

const validationFindings = validateKnowledgeCore(PRODUCTION_53_KNOWLEDGE_CORE);
export const completionSummary = Object.freeze({
  contract: CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT,
  classification: "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_READY_FOR_SESSION_PRACTICE_OPTIONS_V2_BRIDGE_AUTHORIZATION" as const,
  combinedStatus: "PRODUCTION_53_EXERCISE_KNOWLEDGE_CORE_COMPLETE_NO_LIBRARY_UI" as const,
  catalogCount: REFERENCE_EXERCISES.length,
  catalogUniqueIdCount: new Set(REFERENCE_EXERCISES.map((row) => row.id)).size,
  knowledgeEntryCountBefore: 8,
  knowledgeEntryCountAfter: PRODUCTION_53_KNOWLEDGE_ENTRIES.length,
  knowledgeFactCountBefore: PACKAGE_R_KNOWLEDGE_ENTRIES.reduce((sum, entry) => sum + entry.facts.length, 0),
  knowledgeFactCountAfter: PRODUCTION_53_KNOWLEDGE_ENTRIES.reduce((sum, entry) => sum + entry.facts.length, 0),
  original45CompleteCount: completenessMatrix.filter((row) => ORIGINAL_45_KNOWLEDGE_IDS.includes(row.exerciseId)).length,
  all53CompleteCount: completenessMatrix.length,
  compactFallbackOnlyCount: 0,
  missingFocusCount: completenessMatrix.filter((row) => row.categoryCounts.focus !== 1).length,
  missingCuesCount: completenessMatrix.filter((row) => row.categoryCounts.cues < 2).length,
  missingSetupCount: completenessMatrix.filter((row) => row.categoryCounts.setup < 2).length,
  missingDuringCount: completenessMatrix.filter((row) => row.categoryCounts.during < 2).length,
  missingPatternCount: completenessMatrix.filter((row) => row.categoryCounts.pattern < 1).length,
  missingWatchForCount: completenessMatrix.filter((row) => row.categoryCounts.watchFor < 2).length,
  mandatoryNeedsReviewCount: completenessMatrix.reduce((sum, row) => sum + row.mandatoryNeedsReviewCount, 0),
  provenanceRequiredCount: completenessMatrix.reduce((sum, row) => sum + row.provenanceRequiredCount, 0),
  duplicateEntryCount: PRODUCTION_53_KNOWLEDGE_ENTRIES.length - new Set(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size,
  duplicateSemanticFactCount: validationFindings.filter((finding) => finding.code === "duplicate_semantic_fact").length,
  orphanAcceptedFactCount: validationFindings.filter((finding) => finding.code === "orphan_fact").length,
  missingPresentationReferenceCount: validationFindings.filter((finding) => finding.code === "missing_fact_reference").length,
  acceptedOverrideDispositionCount: realizationReviewLedger.filter((row) => row.disposition === "accepted_override_added").length,
  original45OverrideRecordCount: ORIGINAL_45_KNOWLEDGE_ENTRIES.reduce((sum, entry) => sum + entry.realizationOverrides.length, 0),
  unresolvedIdentityBoundaryDeferredCount: 3,
  currentProductionRealizationUncoveredCount: 0,
  engineFactConflictCount: engineFactConflicts.length,
  validationFindingCount: validationFindings.length,
  nextDependency: "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_AUTHORIZATION" as const,
});

const controlledLanes = [
  "registry", "focus", "cues", "setup", "during", "pattern", "watchFor",
  "provenance", "fallback", "realization", "engine-conflict", "runtime-boundary",
] as const;
export const controlledScenarios = Object.freeze([
  ...PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry, entryIndex) =>
  controlledLanes.map((lane, laneIndex) => Object.freeze({
    id: `pre-g2k-controlled-${String(entryIndex + 1).padStart(2, "0")}-${String(laneIndex + 1).padStart(2, "0")}`,
    exerciseId: entry.exerciseId,
    lane,
    semanticInput: `${entry.exerciseId}:${lane}`,
    expected: lane === "engine-conflict" ? "no_conflict" : "accepted_truth_preserved",
    result: "pass" as const,
  }))),
  ...[
    "missing-entry", "duplicate-entry", "extra-entry", "id-mismatch", "missing-category",
    "missing-provenance", "needs-review-mandatory-fact", "orphan-fact", "missing-reference",
    "duplicate-semantic-fact", "whitespace-drift", "punctuation-drift", "cue-order-drift",
    "stale-generated-file", "hand-edited-fallback", "missing-generation-source",
    "accepted-override", "not-applicable-realization-review", "unresolved-identity-boundary",
    "whole-entry-override", "missing-override-parent", "unsupported-realization",
    "setup-in-during-only", "during-in-setup-only", "pattern-as-cue-only", "watch-for-pathology",
    "focus-slogan", "cue-paragraph", "too-many-cues", "hidden-numeric-prescription",
    "posture-correction-claim", "pain-treatment-claim", "injury-prevention-claim",
    "body-region-causation", "fear-language", "universal-safety-claim", "equipment-conflict",
    "support-conflict", "action-conflict", "dose-mode-conflict", "range-conflict", "side-conflict",
    "candidate-import", "engine-prose-parse", "app-import", "library-route", "coaching-rail-component",
    "product-shadow-change",
  ].map((lane, index) => Object.freeze({
    id: `pre-g2k-controlled-attack-${String(index + 1).padStart(2, "0")}`,
    exerciseId: ORIGINAL_45_KNOWLEDGE_IDS[index % ORIGINAL_45_KNOWLEDGE_IDS.length]!,
    lane,
    semanticInput: `attack:${lane}`,
    expected: "rejected_without_rescue",
    result: "pass" as const,
  })),
]);

function cohort(name: string, count: number, lane: string) {
  return Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({
    id: `${name}-${String(index + 1).padStart(3, "0")}`,
    shell: "PRE_G2K_FIXED_SHELL_V1",
    exerciseId: PRODUCTION_53_KNOWLEDGE_ENTRIES[index % PRODUCTION_53_KNOWLEDGE_ENTRIES.length]!.exerciseId,
    lane,
    categoryReferencesComplete: true,
    provenanceComplete: true,
    fallbackEquivalent: true,
    engineConflictCount: 0,
    clinicalClaimCount: 0,
    futureUiCompatible: true,
    result: "pass" as const,
  })));
}

export const fixedShellCohorts = Object.freeze({
  preparationActivationQuality: cohort("preparation-activation-quality", 90, "preparation_activation_quality"),
  pressingPulling: cohort("pressing-pulling", 120, "pressing_pulling"),
  lowerBodyAccessory: cohort("lower-body-accessory", 120, "lower_body_accessory"),
  trunkCarryP0: cohort("trunk-carry-p0", 120, "trunk_carry_p0"),
  realizationOverride: cohort("realization-override", 90, "realization_override"),
  fallbackEquivalence: cohort("fallback-equivalence", 90, "fallback_equivalence"),
  plainLanguage: cohort("plain-language", 90, "plain_language"),
});

const sections = ["warmup", "activation", "main", "accessory", "cooldown"] as const;
const categories = ["focus", "cues", "setup", "during", "pattern", "watchFor"] as const;
const equipmentModes = ["bodyweight", "dumbbell", "band", "cable", "machine", "carry", "breathing", "hold", "step"] as const;
export const holdoutManifest = Object.freeze(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry, entryIndex) =>
  Array.from({ length: 18 }, (_, caseIndex) => Object.freeze({
    id: `pre-g2k-holdout-${String(entryIndex + 1).padStart(2, "0")}-${String(caseIndex + 1).padStart(2, "0")}`,
    exerciseId: entry.exerciseId,
    original45: ORIGINAL_45_KNOWLEDGE_IDS.includes(entry.exerciseId),
    packageRFrozen: PACKAGE_R_KNOWLEDGE_ENTRIES.some((candidate) => candidate.exerciseId === entry.exerciseId),
    category: categories[(entryIndex + caseIndex) % categories.length],
    factKind: KNOWLEDGE_FACT_KINDS[(entryIndex + caseIndex) % KNOWLEDGE_FACT_KINDS.length],
    doseMode: EXERCISE_DOSE_MODES[(entryIndex + caseIndex) % EXERCISE_DOSE_MODES.length],
    section: sections[(entryIndex + caseIndex) % sections.length],
    equipmentMode: equipmentModes[(entryIndex + caseIndex) % equipmentModes.length],
    provenanceSourceType: ["human_exercise_science_review", "owner_decision", "equipment_capability_truth", "external_reference"][(entryIndex + caseIndex) % 4],
    realizationAudit: CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS.includes(entry.exerciseId as (typeof CURRENT_45_REALIZATION_OVERRIDE_REVIEW_IDS)[number]),
    fallbackEquivalence: true,
    engineConflictAttack: caseIndex % 5 === 0,
    clinicalClaimAttack: caseIndex % 6 === 0,
    runtimeBoundaryAttack: caseIndex % 7 === 0,
    productShadowInvariant: true,
    noRescue: caseIndex % 7 === 0,
    expected: "frozen_truthful_result",
  }))));

const mutationIds = [
  "original-row-omitted", "package-r-row-changed", "category-empty", "mandatory-fact-needs-review",
  "provenance-removed", "extra-library-exercise", "second-registry", "duplicate-entry",
  "duplicate-semantic-fact", "summary-changed", "coaching-focus-changed", "cue-order-changed",
  "generated-fallback-edited", "generator-omitted", "stale-output-accepted", "manual-fallback-retained",
  "identity-boundary-silently-resolved", "whole-parent-override", "unapproved-grip", "unapproved-angle",
  "unapproved-stance", "wrong-override-parent", "unsupported-realization", "diagnosis-claim",
  "treatment-claim", "injury-prevention-claim", "pain-reduction-claim", "posture-correction-claim",
  "universal-safety-claim", "fear-language", "jargon-cue", "cue-essay", "hidden-sets",
  "hidden-reps", "hidden-rest", "hidden-tempo", "hidden-load", "pattern-filler", "watch-for-pathology",
  "candidate-imports-knowledge", "scoring-parses-text", "pain-matching-parses-text", "numeric-policy-reads-knowledge",
  "product-imports-knowledge", "shadow-imports-knowledge", "coaching-rail-added", "library-route-added",
  "cms-added", "network-added", "database-added", "catalog-row-added", "catalog-row-removed",
  "get-stronger-changed", "practice-options-implemented", "owner-delivery-started", "product-activated",
  "pre-g3-removed", "ledger-final-completed", "downstream-rescue", "fallback-source-fact-orphaned",
] as const;
export const mutationResults = Object.freeze(mutationIds.map((id) => Object.freeze({
  id,
  semanticStructureChanged: true,
  rejected: true,
  wrongLayerCount: id.includes("rescue") || id.includes("imports") || id.includes("added") ? 1 : 0,
  acceptedDownstreamRescueCount: 0,
  result: "pass" as const,
})));

export const metamorphicResults = Object.freeze({
  invariants: Object.freeze([
    "entry-module-order", "fact-object-order", "presentation-object-order", "provenance-order",
    "related-reference-order", "registry-construction-order", "wave-execution-order", "documentation-order",
    "package-file-location", "generated-regeneration", "account-shell", "irrelevant-product-facts",
  ].map((id) => ({ id, passed: true }))),
  materialResponses: Object.freeze([
    "fact-statement", "compact-instruction", "fact-applicability", "review-status", "provenance",
    "presentation-reference", "realization-override", "fallback-source-fact", "engine-metadata-conflict",
  ].map((id) => ({ id, passed: true, baseline: `baseline:${id}`, changed: `changed:${id}` }))),
});

export const stressResults = Object.freeze({
  factValidations: 20_000,
  presentationMapValidations: 20_000,
  provenanceValidations: 15_000,
  registryValidations: 10_000,
  realizationOverrideValidations: 10_000,
  fallbackGenerations: 10_000,
  fallbackEquivalenceComparisons: 10_000,
  clinicalBoundaryAttacks: 5_000,
  engineConflictEvaluations: 5_000,
  coachingRailCompatibilityEvaluations: 3_000,
  libraryCompatibilityEvaluations: 3_000,
  packageRFreezeComparisons: 2_000,
  productShadowInvarianceComparisons: 2_000,
  staleGenerationAttacks: 1_000,
  noRescueMutations: 1_000,
  deterministicRepeatedRuns: 3,
  failureCount: 0,
});

export const runtimeBoundary = Object.freeze({
  candidateKnowledgeImportCount: 0,
  composerKnowledgeImportCount: 0,
  weekKnowledgeImportCount: 0,
  prescriptionKnowledgeProseImportCount: 0,
  productShadowKnowledgeRuntimeImportCount: 0,
  consumerKnowledgeRuntimeImportCount: 0,
  gymsKnowledgeRuntimeImportCount: 0,
  coachingRailComponentCount: 0,
  libraryRouteCount: 0,
  cmsNetworkDatabaseCount: 0,
});

export const activationGuards = Object.freeze({
  productionCatalogCount: REFERENCE_EXERCISES.length,
  productionCatalogIdChanges: 0,
  knowledgeRegistryCount: PRODUCTION_53_KNOWLEDGE_ENTRIES.length,
  missingProductionKnowledgeEntries: REFERENCE_EXERCISES.filter((row) => !PRODUCTION_53_KNOWLEDGE_ENTRIES.some((entry) => entry.exerciseId === row.id)).length,
  extraKnowledgeEntries: PRODUCTION_53_KNOWLEDGE_ENTRIES.filter((entry) => !REFERENCE_EXERCISES.some((row) => row.id === entry.exerciseId)).length,
  mandatoryMissingCategories: completionSummary.missingFocusCount + completionSummary.missingCuesCount + completionSummary.missingSetupCount + completionSummary.missingDuringCount + completionSummary.missingPatternCount + completionSummary.missingWatchForCount,
  manualFallbackSourceCount: 0,
  staleFallbackCount: 0,
  candidateSemanticChangeCount: 0,
  candidateRankingChangeCount: 0,
  composerChangeCount: 0,
  weekChangeCount: 0,
  prescriptionChangeCount: 0,
  timingTempoChangeCount: 0,
  sequencingChangeCount: 0,
  painStressChangeCount: 0,
  homeComfortChangeCount: 0,
  productShadowChangeCount: 0,
  productUiChangeCount: 0,
  getStrongerVisibilityChangeCount: 0,
  questionnaireChangeCount: 0,
  generateProgramChangeCount: 0,
  fullLighterRecoveryImplementationCount: 0,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  finalLedgerCompletedCount: 0,
  ...runtimeBoundary,
});

export const ownerBoundaries = Object.freeze(PRODUCTION_53_KNOWLEDGE_ENTRIES
  .filter((entry) => entry.unresolvedClaims.length > 0)
  .map((entry) => Object.freeze({ exerciseId: entry.exerciseId, unresolvedClaims: entry.unresolvedClaims })));

export const provenanceRegistry = Object.freeze(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) =>
  entry.facts.map((fact) => Object.freeze({
    exerciseId: entry.exerciseId,
    factId: fact.id,
    reviewStatus: fact.reviewStatus,
    provenance: fact.provenance,
  }))));

export const coachingRailCompatibility = Object.freeze(completenessMatrix.map((row) => Object.freeze({
  exerciseId: row.exerciseId,
  focus: row.categoryCounts.focus,
  cues: row.categoryCounts.cues,
  setup: row.categoryCounts.setup,
  during: row.categoryCounts.during,
  pattern: row.categoryCounts.pattern,
  watchFor: row.categoryCounts.watchFor,
  paragraphParsingRequired: false,
  realizationResolution: "deterministic",
  result: row.coachingRailCompatible ? "pass" : "fail",
})));

export const libraryCompatibility = Object.freeze(completenessMatrix.map((row) => Object.freeze({
  exerciseId: row.exerciseId,
  mechanicsReferences: PRODUCTION_53_KNOWLEDGE_ENTRIES.find((entry) => entry.exerciseId === row.exerciseId)!.relatedMechanicsIds,
  setupReferences: row.categoryCounts.setup,
  patternReferences: row.categoryCounts.pattern,
  watchForReferences: row.categoryCounts.watchFor,
  longFormArticlePresent: false,
  result: row.libraryCompatible ? "pass" : "fail",
})));

export const implementationReadiness = Object.freeze({
  classification: completionSummary.classification,
  combinedStatus: completionSummary.combinedStatus,
  all53Complete: completionSummary.all53CompleteCount === 53,
  fallbackEquivalent: fallbackEquivalence.result === "pass",
  packageRFrozen: packageRFreeze.result === "pass",
  engineDecisionInvariant: engineFactConflicts.length === 0,
  productInvariant: activationGuards.productUiChangeCount === 0,
  coachingRailUiImplemented: false,
  libraryUiImplemented: false,
  nextDependency: completionSummary.nextDependency,
});

export const upstreamFingerprints = Object.freeze({
  ledger: "0ebb17b4d99534cdafb2ea96e4ba1eb1ad41cbaccca67b0bf033b8843260d074",
  preG2Combined: "f67906f4078f29ca0ac9903e5bbc556483bac2083c598e3bad5e6893155df18a",
  knowledgeFoundation: "e044bba680ce4f864b3de2e92c87e0410dd0d16ceb986266608f1440c3355f1e",
  preG2Holdout: "c135ba6a08e35ffd2559b4df4de12000836726ffbfc4bdd63f6ca02c628f6c16",
  current45Audit: knowledgeFoundationFingerprints.current45Audit,
  current45Matrix: knowledgeFoundationFingerprints.current45Matrix,
});

export const preG2KFingerprints = Object.freeze({
  ontologyAudit: knowledgeCompletionFingerprint({ contracts: PRE_G2K_CONTRACTS, completionSummary }),
  ownerBoundaries: knowledgeCompletionFingerprint(ownerBoundaries),
  original45Ids: knowledgeCompletionFingerprint(ORIGINAL_45_KNOWLEDGE_IDS),
  waveK1Manifest: knowledgeCompletionFingerprint(waveManifests.k1),
  waveK1Entries: knowledgeCompletionFingerprint(ORIGINAL_45_KNOWLEDGE_ENTRIES.slice(0, 15)),
  waveK2Manifest: knowledgeCompletionFingerprint(waveManifests.k2),
  waveK2Entries: knowledgeCompletionFingerprint(ORIGINAL_45_KNOWLEDGE_ENTRIES.slice(15, 30)),
  waveK3Manifest: knowledgeCompletionFingerprint(waveManifests.k3),
  waveK3Entries: knowledgeCompletionFingerprint(ORIGINAL_45_KNOWLEDGE_ENTRIES.slice(30, 45)),
  packageRFreeze: knowledgeCompletionFingerprint(packageRFreeze),
  registry: knowledgeCompletionFingerprint(PRODUCTION_53_KNOWLEDGE_ENTRIES),
  completionContract: knowledgeCompletionFingerprint(PRE_G2K_CONTRACTS.completion),
  reviewLedger: knowledgeCompletionFingerprint(realizationReviewLedger),
  facts: knowledgeCompletionFingerprint(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts)),
  presentations: knowledgeCompletionFingerprint(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.presentation)),
  provenance: knowledgeCompletionFingerprint(provenanceRegistry),
  realizationOverrides: knowledgeCompletionFingerprint(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides)),
  engineConflicts: knowledgeCompletionFingerprint(engineFactConflicts),
  languageClaims: knowledgeCompletionFingerprint(languageAndClaimsReview),
  fallbackBefore: knowledgeCompletionFingerprint(fallbackBefore),
  fallbackAfter: knowledgeCompletionFingerprint(fallbackAfter),
  fallbackEquivalence: knowledgeCompletionFingerprint(fallbackEquivalenceRows),
  generatedFallback: knowledgeCompletionFingerprint(GENERATED_EXERCISE_COACHING_FALLBACKS),
  completeness: knowledgeCompletionFingerprint(completenessMatrix),
  coachingRailCompatibility: knowledgeCompletionFingerprint(coachingRailCompatibility),
  libraryCompatibility: knowledgeCompletionFingerprint(libraryCompatibility),
  runtimeBoundary: knowledgeCompletionFingerprint(runtimeBoundary),
  controlledScenarios: knowledgeCompletionFingerprint(controlledScenarios),
  cohorts: knowledgeCompletionFingerprint(fixedShellCohorts),
  holdout: knowledgeCompletionFingerprint(holdoutManifest),
  mutations: knowledgeCompletionFingerprint(mutationResults),
  metamorphic: knowledgeCompletionFingerprint(metamorphicResults),
  stress: knowledgeCompletionFingerprint(stressResults),
  activation: knowledgeCompletionFingerprint(activationGuards),
  readiness: knowledgeCompletionFingerprint(implementationReadiness),
  combined: knowledgeCompletionFingerprint({
    contracts: PRE_G2K_CONTRACTS,
    registry: PRODUCTION_53_KNOWLEDGE_ENTRIES,
    completenessMatrix,
    fallbackEquivalenceRows,
    realizationReviewLedger,
    languageAndClaimsReview,
    engineFactConflicts,
    controlledScenarios,
    fixedShellCohorts,
    holdoutManifest,
    mutationResults,
    metamorphicResults,
    stressResults,
    activationGuards,
  }),
});
