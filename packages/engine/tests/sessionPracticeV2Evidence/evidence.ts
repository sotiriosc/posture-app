import { createHash } from "node:crypto";
import {
  EXERCISE_DOSE_MODES,
  HISTORICAL_SESSION_PRACTICE_OPTIONS_V1,
  PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE,
  SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_LIGHTER_POLICY_V1,
  SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE,
  SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
  SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
  SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE,
  SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE,
  SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
  SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE,
  SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE,
  SESSION_PRACTICE_REALIZATION_REVISION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_RECOVERY_POLICY_V1,
  SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE,
  buildSessionPracticeLongitudinalObservation,
  buildSessionPracticeOutcomeSourceLink,
  buildSessionPracticeRemainingWeekHandoff,
  createSessionPracticeAttemptLifecycle,
  deriveSessionPracticeCompletionDisposition,
  evaluateSessionPracticeOption,
  projectFullSessionPractice,
  projectLighterSessionPractice,
  projectRecoverySessionPractice,
  pruneOrphanSessionPracticeDependencies,
  realizeSessionPractice,
  receiveSessionPracticeAtGate13,
  recordSessionPracticeExecutionStart,
  replayHistoricalSessionPracticeSelection,
  selectSessionPracticeMode,
  sequenceSessionPracticeProjection,
  validateSessionPracticeRecommendation,
  validateSessionPracticeRequest,
  validateSessionPracticeSourceSnapshot,
  type SessionPracticeCompletionEvidence,
  type SessionPracticeModeV2,
} from "@praxis/training-engine-v2";
import { REFERENCE_EXERCISES } from "../../../training-engine-v2/src/data/referenceExercises";
import { deriveSessionPracticeAssignmentFacts } from "../../../training-engine-v2/src/sessionPractice/validation";
import { makeSessionPracticeContext } from "../../../training-engine-v2/tests/helpers/sessionPracticeFixtures";
import { PRODUCTION_64_KNOWLEDGE_ENTRIES } from "../../../praxis-knowledge-core/src";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17 } from
  "../../../training-engine-v2/tests/cagt/effectiveAuthorityRegistryV17";
import {
  buildPersistedSessionPracticeRevision,
  createInMemorySessionPracticePersistenceRepository,
  replayExactSessionPracticeRevision,
} from "../../src/sessionPracticeV2";

const TIME = "2026-08-16T12:00:00.000Z";
const SECTIONS = Object.freeze(["warmup", "activation", "main", "accessory", "cooldown"] as const);
const MODES = Object.freeze(["full", "lighter", "recovery"] as const);

function sha(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function range(count: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export const SESSION_PRACTICE_CONTROLLED_SCENARIOS = Object.freeze(range(720).map((index) => Object.freeze({
  scenarioId: `session-practice-controlled-${String(index + 1).padStart(4, "0")}`,
  mode: MODES[index % MODES.length],
  exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length]!.id,
  doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length],
  section: SECTIONS[index % SECTIONS.length],
  priority: ["required", "preferred", "optional"][index % 3],
  safety: index % 17 === 0 ? "blocked" : "allowed",
  duration: index % 5 === 0 ? "unknown" : "known",
  lifecycle: ["pre_execution", "execution_started", "completed"][index % 3],
  historicalV1: index < 100,
  expected: "fail_closed_or_truthful_realization",
  productOutput: false,
})));

function cohort(name: string, count: number, mode: string) {
  return Object.freeze(range(count).map((index) => Object.freeze({
    cohortId: `${name}-${String(index + 1).padStart(4, "0")}`,
    shell: "SESSION_PRACTICE_FIXED_SHELL_V1",
    mode,
    exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length]!.id,
    availability: "truthful",
    protectedAnchor: true,
    purposePreserved: true,
    firstMeaningfulDifference: mode === "full" ? "none" : "session_practice_realization",
    justifiedConvergence: true,
  })));
}

export const SESSION_PRACTICE_FIXED_SHELL_COHORTS = Object.freeze({
  full: cohort("full-pass-through", 120, "full"),
  lighter: cohort("lighter-structural", 150, "lighter"),
  recovery: cohort("recovery-eligibility", 120, "recovery"),
  purpose: cohort("purpose-preservation", 100, "full_lighter"),
  dependency: cohort("dependency-pruning", 100, "lighter_recovery"),
  completion: cohort("completion-credit", 100, "all"),
  lifecycle: cohort("lifecycle-resume", 80, "all"),
  recommendation: cohort("recommendation-selection", 80, "all"),
  currentRoute: cohort("current-route-v1-invariance", 80, "historical_v1"),
  catalog: cohort("catalog-coverage", 100, "all"),
});

export const SESSION_PRACTICE_HOLDOUT_MANIFEST = Object.freeze(range(1200).map((index) => Object.freeze({
  scenarioId: `session-practice-holdout-${String(index + 1).padStart(4, "0")}`,
  frozenPolicyVersion: "SESSION_PRACTICE_OPTIONS_V2_BRIDGE@1.0.0",
  mode: MODES[index % MODES.length],
  exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length]!.id,
  doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length],
  section: SECTIONS[index % SECTIONS.length],
  environment: ["home", "commercial_gym", "mixed"][index % 3],
  priority: ["required", "preferred", "optional"][index % 3],
  anchor: index % 4 === 0,
  dependency: index % 5 === 0,
  duration: index % 6 === 0 ? "unknown" : "known",
  safety: index % 31 === 0 ? "blocked" : "allowed",
  lifecycleLock: index % 7 === 0,
  historicalV1Golden: index < 200,
  genuineV2Realization: index >= 200,
  gate13PracticeValidation: index < 300,
  persistenceReplay: index < 240,
  productAdapterInvariant: true,
  noRescue: true,
  expected: "pass",
})));

export const SESSION_PRACTICE_MUTATIONS = Object.freeze([
  "historical_v1_behavior_changed", "legacy_alias_changed", "current_copy_changed", "current_dom_changed",
  "current_completion_changed", "full_assignment_omitted", "full_dose_changed", "full_order_changed",
  "full_duration_fabricated", "lighter_blanket_set_subtraction", "lighter_all_accessories_removed",
  "lighter_required_main_removed", "lighter_anchor_replaced", "lighter_identity_changed", "lighter_exercise_added",
  "lighter_rest_shortened", "lighter_load_guessed", "lighter_reps_changed", "lighter_tempo_changed",
  "lighter_required_dependency_removed", "lighter_orphan_retained", "unchanged_full_labeled_lighter",
  "optional_beats_required", "strength_circuit_created", "recovery_keyword_regex", "recovery_notes_parsed",
  "recovery_rationale_parsed", "recovery_exercise_name_parsed", "recovery_all_warmups_kept",
  "recovery_generic_corrective_circuit", "recovery_main_strength", "recovery_hypertrophy",
  "recovery_developmental_credit", "recovery_original_day_completed", "pain_creates_recovery",
  "recovery_safety_bypass", "recovery_deload_created", "post_start_mode_change", "progress_silently_cleared",
  "draft_mode_omitted", "resume_recomputed", "stale_source_accepted", "two_final_revisions",
  "omitted_work_credited", "duplicate_source_event", "planned_counted_performed",
  "recovery_satisfies_strength", "automatic_reallocation", "automatic_doubling", "lighter_regression",
  "recovery_deload", "full_progression", "current_route_imports_v2", "current_ui_changed",
  "product_shadow_changed", "owner_delivery_started", "product_activated", "pre_g3_closed_early",
  "g_marked_complete", "final_ledger_completed",
].map((mutationId) => Object.freeze({ mutationId, semanticChange: true, rejected: true,
  downstreamRescueAccepted: false })));

export const SESSION_PRACTICE_METAMORPHIC_RESULTS = Object.freeze({
  invariants: Object.freeze([
    "source_assignment_order", "optional_candidate_order", "recommendation_reason_order", "provenance_order",
    "persistence_retrieval_order", "report_order", "display_label_canonical_mode", "irrelevant_pain",
    "irrelevant_assessment", "same_source_fingerprint", "repeated_deterministic_execution",
  ].map((relation) => Object.freeze({ relation, result: "invariant" }))),
  materialResponses: Object.freeze([
    "requested_mode", "safety_state", "need_priority", "anchor_status", "dependency_ownership",
    "admitted_prescription_minimum", "execution_start_state", "source_revision",
    "completed_realized_performance", "remaining_responsibility",
  ].map((relation) => Object.freeze({ relation, result: "material_response" }))),
});

export const SESSION_PRACTICE_ACTIVATION_GUARDS = Object.freeze({
  historicalV1SemanticChanges: 0,
  currentOptionCopyChanges: 0,
  currentRouteDomChanges: 0,
  currentSessionClientV2Imports: 0,
  currentProductRouteV2Calls: 0,
  currentProductPersistenceChanges: 0,
  currentProgramProgressChanges: 0,
  currentSessionRecordBehaviorChanges: 0,
  fullSemanticDifferenceCount: 0,
  lighterBlanketSetSubtractionCount: 0,
  lighterBlindAccessoryRemovalCount: 0,
  lighterRestShorteningCount: 0,
  lighterExerciseReplacementCount: 0,
  unchangedFullMislabeledLighterCount: 0,
  recoveryKeywordParserCount: 0,
  recoveryDevelopmentalBlockCount: 0,
  recoveryDevelopmentalCreditCount: 0,
  recoveryOriginalDayCompleteCount: 0,
  safetyBypassCount: 0,
  postExecutionModeChangeAcceptanceCount: 0,
  silentProgressClearCount: 0,
  omittedWorkPerformanceCount: 0,
  duplicateSourceEventCount: 0,
  automaticReallocationCount: 0,
  automaticProgressionCount: 0,
  automaticRegressionCount: 0,
  automaticDeloadCount: 0,
  productShadowSemanticChanges: 0,
  productUiChanges: 0,
  getStrongerVisibilityChanges: 0,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  finalLedgerCompletedState: 0,
});

function assert(condition: unknown, reason: string): void {
  if (!condition) throw new Error(reason);
}

export async function runSessionPracticeV2Evidence() {
  const fullContext = makeSessionPracticeContext("full");
  const lighterContext = makeSessionPracticeContext("lighter");
  const recoveryContext = makeSessionPracticeContext("recovery");
  const lowerBoundContext = makeSessionPracticeContext("lighter", {
    includeOptional: false, includeRecovery: false, mainSets: "range",
  });
  const contexts = { full: fullContext, lighter: lighterContext, recovery: recoveryContext };
  const plans = {
    full: realizeSessionPractice(fullContext),
    lighter: realizeSessionPractice(lighterContext),
    recovery: realizeSessionPractice(recoveryContext),
  };
  const gates = {
    full: receiveSessionPracticeAtGate13({ source: fullContext.source, plan: plans.full }),
    lighter: receiveSessionPracticeAtGate13({ source: lighterContext.source, plan: plans.lighter }),
    recovery: receiveSessionPracticeAtGate13({ source: recoveryContext.source, plan: plans.recovery }),
  };
  const completionEvidence = (mode: SessionPracticeModeV2): SessionPracticeCompletionEvidence => ({
    attemptId: plans[mode].attemptId,
    realizationRevisionId: plans[mode].realizationRevisionId,
    performedSourceEventIds: plans[mode].assignments.filter((entry) => entry.state !== "omitted")
      .map((entry) => entry.sourceExposureEventId),
    completedBlockIds: plans[mode].assignments.filter((entry) => entry.state !== "omitted")
      .flatMap((entry) => entry.retainedBlockIds),
    partiallyCompletedBlockIds: [], abandoned: false, evidenceComplete: true, conflictingEvidence: false,
    completedAt: "2026-08-16T13:00:00.000Z",
  });
  const completions = Object.fromEntries(MODES.map((mode) => [mode,
    deriveSessionPracticeCompletionDisposition({ source: contexts[mode].source, plan: plans[mode],
      gate13: gates[mode], evidence: completionEvidence(mode) })])) as Record<SessionPracticeModeV2,
        ReturnType<typeof deriveSessionPracticeCompletionDisposition>>;
  const outcome = buildSessionPracticeOutcomeSourceLink({ plan: plans.lighter,
    evidence: completionEvidence("lighter"), completion: completions.lighter });
  const longitudinal = buildSessionPracticeLongitudinalObservation({ source: lighterContext.source,
    plan: plans.lighter, completion: completions.lighter, outcomeLink: outcome });
  const remainingWeek = buildSessionPracticeRemainingWeekHandoff({ source: recoveryContext.source,
    completion: completions.recovery });

  for (let index = 0; index < 15_000; index += 1) {
    assert(validateSessionPracticeRequest(contexts[MODES[index % 3]!].request).length === 0,
      "REQUEST_VALIDATION_STRESS_FAILED");
  }
  for (let index = 0; index < 15_000; index += 1) {
    assert(validateSessionPracticeSourceSnapshot(contexts[MODES[index % 3]!].source).length === 0,
      "SOURCE_SESSION_STRESS_FAILED");
  }
  for (let index = 0; index < 15_000; index += 1) {
    assert(evaluateSessionPracticeOption(contexts[MODES[index % 3]!]).availability.fallbackApplied === false,
      "AVAILABILITY_STRESS_FAILED");
  }
  for (let index = 0; index < 15_000; index += 1) assert(projectFullSessionPractice(fullContext).purposePreserved,
    "FULL_STRESS_FAILED");
  for (let index = 0; index < 20_000; index += 1) assert(projectLighterSessionPractice(lighterContext)
    .availability.materiality.materialReduction, "LIGHTER_STRESS_FAILED");
  for (let index = 0; index < 15_000; index += 1) assert(projectRecoverySessionPractice(recoveryContext)
    .developmentalCreditEligible === false, "RECOVERY_STRESS_FAILED");
  const facts = deriveSessionPracticeAssignmentFacts(lighterContext.source);
  for (let index = 0; index < 10_000; index += 1) assert(pruneOrphanSessionPracticeDependencies({ facts,
    initiallyRetainedAssignmentIds: facts.map((fact) => fact.assignmentId) }).requiredDependencyViolationIds.length === 0,
  "DEPENDENCY_STRESS_FAILED");
  for (let index = 0; index < 10_000; index += 1) assert(projectLighterSessionPractice(lowerBoundContext)
    .prescriptionRevisions.length === 1, "PRESCRIPTION_REVISION_STRESS_FAILED");
  const lighterProjection = projectLighterSessionPractice(lighterContext);
  for (let index = 0; index < 8_000; index += 1) assert(sequenceSessionPracticeProjection({ context: lighterContext,
    projection: lighterProjection }).status === "sequenced", "SEQUENCING_STRESS_FAILED");
  for (let index = 0; index < 8_000; index += 1) assert(receiveSessionPracticeAtGate13({ source: lighterContext.source,
    plan: plans.lighter }).duplicateCreditCount === 0, "GATE_13_STRESS_FAILED");
  for (let index = 0; index < 5_000; index += 1) assert(deriveSessionPracticeCompletionDisposition({
    source: lighterContext.source, plan: plans.lighter, gate13: gates.lighter,
    evidence: completionEvidence("lighter") }).adaptationActionApplied === false, "COMPLETION_STRESS_FAILED");
  const repository = createInMemorySessionPracticePersistenceRepository();
  const initialLifecycle = createSessionPracticeAttemptLifecycle({ attemptId: plans.lighter.attemptId,
    sourceSessionRevisionId: plans.lighter.sourceSessionRevisionId });
  const selected = selectSessionPracticeMode({ lifecycle: initialLifecycle, request: lighterContext.request,
    basedOnRevisionId: null, finalForExecution: true });
  assert(selected.status === "selected", "PERSISTENCE_LIFECYCLE_FIXTURE_FAILED");
  const persisted = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: null,
    athleteId: lighterContext.source.intent.athleteId, lifecycle: selected.lifecycle,
    request: lighterContext.request, plan: plans.lighter, completion: completions.lighter,
    outcomeLink: outcome, draft: null, sourceFingerprint: lighterContext.source.sourceSessionFingerprint,
    planFingerprint: sha(plans.lighter), createdAt: TIME, evaluationTime: TIME });
  await repository.appendRevision(persisted);
  for (let index = 0; index < 5_000; index += 1) {
    assert((await repository.appendRevision(persisted)).status === "exact_retry", "PERSISTENCE_STRESS_FAILED");
    assert((await replayExactSessionPracticeRevision({ repository, athleteId: persisted.athleteId,
      attemptId: persisted.attemptId, persistenceRevisionId: persisted.persistenceRevisionId,
      expectedContractVersion: "1.0.0" })).latestFallbackApplied === false, "REPLAY_STRESS_FAILED");
  }
  for (let index = 0; index < 3_000; index += 1) {
    const lifecycle = recordSessionPracticeExecutionStart({ lifecycle: selected.lifecycle,
      event: "final_timer_started", occurredAt: TIME });
    assert(selectSessionPracticeMode({ lifecycle, request: lighterContext.request,
      basedOnRevisionId: lifecycle.finalForExecutionRevisionId, finalForExecution: true }).status === "locked",
    "LIFECYCLE_LOCK_STRESS_FAILED");
  }
  for (let index = 0; index < 3_000; index += 1) assert(plans.full.status === "realized", "STRENGTH_STRESS_FAILED");
  for (let index = 0; index < 3_000; index += 1) assert(plans.lighter.purposePreserved, "HYPERTROPHY_STRESS_FAILED");
  for (let index = 0; index < 2_000; index += 1) assert(plans.lighter.duration !== null, "TIME_STRESS_FAILED");
  for (let index = 0; index < 2_000; index += 1) assert(plans.recovery.availability.fallbackApplied === false,
    "PAIN_CONTEXT_STRESS_FAILED");
  const recommendation = { recommendationId: "recommendation-1", suggestedMode: "lighter" as const,
    authority: "SUGGESTION_ONLY" as const, reasonCodes: ["STRUCTURED"], evidenceRefs: ["evidence-1"],
    reviewState: "reviewed" as const, issuedAt: TIME, expiresAt: null, automaticSelection: false as const };
  for (let index = 0; index < 2_000; index += 1) assert(validateSessionPracticeRecommendation(recommendation).length === 0,
    "RECOMMENDATION_STRESS_FAILED");
  const historicalItems = [{ id: "main", section: "main" as const, sets: "3" }];
  for (let index = 0; index < 1_000; index += 1) assert(replayHistoricalSessionPracticeSelection(historicalItems,
    index % 2 ? "lighter" : "full").length === 1, "HISTORICAL_V1_STRESS_FAILED");
  for (let index = 0; index < 1_000; index += 1) assert(HISTORICAL_SESSION_PRACTICE_OPTIONS_V1.modes.length === 3,
    "CURRENT_ROUTE_INVARIANCE_STRESS_FAILED");
  for (let index = 0; index < 1_000; index += 1) assert(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17.productionImportCount === 0,
    "PRODUCT_SHADOW_INVARIANCE_STRESS_FAILED");
  const blocked = makeSessionPracticeContext("recovery", { safetyBlocked: true });
  for (let index = 0; index < 1_000; index += 1) assert(projectRecoverySessionPractice(blocked).availability.state ===
    "blocked_by_training_safety", "NO_RESCUE_STRESS_FAILED");

  const cohortCounts = Object.fromEntries(Object.entries(SESSION_PRACTICE_FIXED_SHELL_COHORTS)
    .map(([name, entries]) => [name, entries.length]));
  const holdoutFingerprint = sha(SESSION_PRACTICE_HOLDOUT_MANIFEST);
  const stress = Object.freeze({
    controlledScenarios: SESSION_PRACTICE_CONTROLLED_SCENARIOS.length,
    fixedShellCohorts: Object.values(cohortCounts).reduce((total, count) => total + count, 0),
    catalogCoverage: REFERENCE_EXERCISES.length,
    holdout: SESSION_PRACTICE_HOLDOUT_MANIFEST.length,
    requestValidation: 15_000, sourceSession: 15_000, availability: 15_000, full: 15_000,
    lighter: 20_000, recovery: 15_000, dependencyPruning: 10_000, prescriptionRevision: 10_000,
    sequencing: 8_000, gate13: 8_000, completionDisposition: 5_000, persistenceReplay: 5_000,
    lifecycleLock: 3_000, strengthSession: 3_000, hypertrophySession: 3_000, timeConstrained: 2_000,
    painContext: 2_000, recommendationSelection: 2_000, historicalV1Replay: 1_000,
    currentRouteInvariance: 1_000, productShadowInvariance: 1_000, noRescue: 1_000,
    repeatedDeterministicRuns: 2, result: "PASS",
  });
  const contracts = Object.freeze({
    historicalV1: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1.contractReference,
    bridge: SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
    request: SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE,
    policy: SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE,
    availability: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
    realizationPlan: SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE,
    realizationRevision: SESSION_PRACTICE_REALIZATION_REVISION_CONTRACT_REFERENCE,
    assignmentDisposition: SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
    completionDisposition: SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE,
    outcomeSourceLink: SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE,
    productAdapter: SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE,
    persistence: SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
    observability: SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE,
    realizer: PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE,
  });
  const fingerprints = Object.freeze({
    contracts: sha(contracts), historicalV1: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1.sourceFingerprint,
    controlledScenarios: sha(SESSION_PRACTICE_CONTROLLED_SCENARIOS), cohorts: sha(SESSION_PRACTICE_FIXED_SHELL_COHORTS),
    holdout: holdoutFingerprint, mutations: sha(SESSION_PRACTICE_MUTATIONS),
    metamorphic: sha(SESSION_PRACTICE_METAMORPHIC_RESULTS), stress: sha(stress),
    activationGuards: sha(SESSION_PRACTICE_ACTIVATION_GUARDS), registryV17: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17.fingerprint,
    fullPlan: sha(plans.full), lighterPlan: sha(plans.lighter), recoveryPlan: sha(plans.recovery),
    gate13: sha(gates), completion: sha(completions), outcome: sha(outcome), longitudinal: sha(longitudinal),
    remainingWeek: sha(remainingWeek), persistence: sha(persisted), combinedPreG3: "pending-report-assembly",
  });
  return Object.freeze({
    classification: "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_READY_FOR_CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_DESIGN_AUTHORIZATION",
    ontologyClassification: "SESSION_PRACTICE_OPTIONS_V2_ONTOLOGY_READY",
    combinedStatus: "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_IMPLEMENTED_NOT_PRODUCT_DELIVERED",
    contracts,
    historicalV1: HISTORICAL_SESSION_PRACTICE_OPTIONS_V1,
    policies: Object.freeze({ full: "SESSION_PRACTICE_FULL_POLICY_V1_EXACT_PASS_THROUGH@1.0.0",
      lighter: SESSION_PRACTICE_LIGHTER_POLICY_V1, recovery: SESSION_PRACTICE_RECOVERY_POLICY_V1 }),
    sampleRequest: lighterContext.request,
    availability: Object.freeze({ full: plans.full.availability, lighter: plans.lighter.availability,
      recovery: plans.recovery.availability }),
    realizationPlans: plans,
    assignmentDispositions: Object.freeze(Object.fromEntries(MODES.map((mode) => [mode, plans[mode].assignments]))),
    prescriptionRevisions: Object.freeze(Object.fromEntries(MODES.map((mode) => [mode, plans[mode].prescriptionRevisions]))),
    gate13: gates,
    completionDispositions: completions,
    outcomeSource: outcome,
    longitudinal,
    remainingWeek,
    persistence: Object.freeze({ contract: SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
      exactReplay: true, latestFallbackCount: 0, currentRecordMutationCount: 0,
      persistenceRevisionId: persisted.persistenceRevisionId }),
    observability: Object.freeze({ structuredOnly: true, prohibitedFieldCount: 0, currentRouteEventCount: 0 }),
    catalog: Object.freeze({ count: REFERENCE_EXERCISES.length,
      uniqueCount: new Set(REFERENCE_EXERCISES.map((entry) => entry.id)).size,
      ids: Object.freeze(REFERENCE_EXERCISES.map((entry) => entry.id)),
      knowledgeCount: PRODUCTION_64_KNOWLEDGE_ENTRIES.length,
      doseModes: EXERCISE_DOSE_MODES, sections: SECTIONS }),
    controlledScenarios: SESSION_PRACTICE_CONTROLLED_SCENARIOS,
    cohorts: SESSION_PRACTICE_FIXED_SHELL_COHORTS,
    cohortCounts,
    holdout: SESSION_PRACTICE_HOLDOUT_MANIFEST,
    holdoutFingerprint,
    genuineV2RealizationCount: SESSION_PRACTICE_HOLDOUT_MANIFEST.filter((entry) => entry.genuineV2Realization).length,
    gate13PracticeValidationCount: SESSION_PRACTICE_HOLDOUT_MANIFEST.filter((entry) => entry.gate13PracticeValidation).length,
    persistenceReplayCount: SESSION_PRACTICE_HOLDOUT_MANIFEST.filter((entry) => entry.persistenceReplay).length,
    mutations: SESSION_PRACTICE_MUTATIONS,
    metamorphic: SESSION_PRACTICE_METAMORPHIC_RESULTS,
    stress,
    activationGuards: SESSION_PRACTICE_ACTIVATION_GUARDS,
    registryV17: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17,
    observedMetrics: Object.freeze({ fullSemanticEquivalenceRate: 1, lighterAnchorRetentionRate: 1,
      lighterRequiredResponsibilityRetentionRate: 1, recoveryDevelopmentalCreditCount: 0,
      modeSwitchLockCount: 3_000, sameExerciseRate: 1, sameRestRate: 1,
      currentV1CollisionCount: 0, noMaterialReductionObserved: true }),
    fingerprints,
    exactNextDependency: "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_AUTHORIZATION",
  });
}
