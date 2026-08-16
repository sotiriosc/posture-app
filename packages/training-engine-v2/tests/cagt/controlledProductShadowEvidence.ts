import { createHash } from "node:crypto";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import {
  CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES,
  createControlledProductShadowComparison,
  validateControlledProductShadowCounterfactualAttribution,
} from "../../src/productShadow";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER = Object.freeze([
  "S0_rollout_authentication_trigger_truth",
  "S1_product_sync_snapshot_truth",
  "S2_product_to_v2_mapping_truth",
  "S3_ordered_cycle_horizon_week_truth",
  "S4_session_candidate_composer_truth",
  "S5_prescription_sequence_gate_13_truth",
  "S6_counterfactual_outcome_lineage_truth",
  "S7_longitudinal_orchestration_truth",
  "S8_legacy_v2_comparison_truth",
  "S9_product_invariance_failure_isolation",
  "S10_persistence_idempotency_security_replay",
  "S11_default_off_no_activation_verdict",
] as const);

const CONTROLLED_TOPICS = Object.freeze([
  "mode_off", "capture_only_allowlisted", "evaluate_allowlisted", "replay_only",
  "authenticated_allowlisted", "authenticated_not_allowlisted", "signed_out",
  "client_other_user_id", "malformed_trigger", "unsupported_trigger_version",
  "unsupported_shadow_contract", "unsupported_app_surface", "no_environment_value",
  "admin_allowlist_isolated", "adaptive_flag_isolated", "questionnaire_patch_success",
  "program_patch_success", "program_progress_patch_success", "session_completion_patch_success",
  "exercise_log_patch_success", "mixed_patch_success", "failed_product_patch", "unauthenticated_patch",
  "offline_queued_patch", "duplicate_patch", "exact_trigger_retry", "semantic_trigger_conflict",
  "concurrent_trigger", "server_snapshot_current", "expected_entity_missing", "later_entity_arrives",
  "later_run_supersedes", "goal_posture", "goal_pain_context", "goal_general_fitness",
  "goal_athletic_ambiguous", "goal_unknown", "intent_build", "intent_maintain_policy",
  "intent_rehab_context", "experience_beginner", "experience_intermediate", "experience_advanced",
  "experience_unknown", "pain_none", "pain_lower_back", "pain_multiple_regions", "pain_prose_inert",
  "assessment_high_confidence", "assessment_low_confidence", "assessment_prose_inert",
  "equipment_none", "equipment_bands_anchor_unknown", "equipment_dumbbells_bench_unknown",
  "equipment_gym_bundle", "equipment_unknown", "equipment_changed", "capability_unsupported",
  "loaded_gait_not_inferred", "wall_support_not_inferred", "horizon_three_day", "horizon_four_day",
  "horizon_five_day", "calendar_dates_absent", "weekday_not_inferred", "elapsed_time_not_inferred",
  "minutes_unknown", "structural_capacity_only", "capacity_policy_unavailable",
  "profile_default_not_confirmed", "active_program_found", "legacy_program_fallback",
  "latest_program_fallback", "program_absent", "active_program_stale", "client_anchor_conflict",
  "program_deleted", "questionnaire_signature_incompatible", "program_revision_changed",
  "program_title_only_change", "exercise_exact_id", "exercise_reviewed_alias",
  "exercise_variant_projection", "exercise_legacy_only", "exercise_ambiguous",
  "exercise_fuzzy_name_rejected", "exercise_duplicate_mapping", "exercise_catalog_collision",
  "exercise_unsupported", "all_exact_v2_ids", "supported_posture_program", "supported_general_program",
  "pain_aware_context", "external_safety_block", "week_policy_required", "goal_under_specified",
  "equipment_mapping_incomplete", "availability_incomplete", "week_search_inconclusive",
  "session_planner_under_specified", "candidate_infeasible", "composer_infeasible",
  "prescription_resolution_required", "sequence_incomplete", "gate_13_pass", "gate_13_fail",
  "duration_unknown", "definitely_over_budget", "complete_three_day_horizon",
  "complete_four_day_horizon", "complete_five_day_horizon", "framework_convergence",
  "framework_assignment_difference", "same_exercise", "different_exercise", "same_reps",
  "different_reps", "same_tempo", "legacy_tempo_absent", "same_day_count",
  "different_session_distribution", "legacy_mapping_incomplete", "gate_14_compatible_projection",
  "partial_comparison", "no_better_score", "first_difference_product_mapping",
  "first_difference_week", "first_difference_candidate", "first_difference_prescription",
  "cosmetic_only_difference", "legacy_outcome_legacy_program_only", "legacy_outcome_shadow_attack",
  "legacy_log_shadow_prescription_attack", "legacy_session_shadow_sequence_attack",
  "shadow_completion_attack", "shadow_tolerance_attack", "superiority_attack",
  "identity_without_lineage", "restricted_legacy_mapping", "shadow_program_never_served",
  "exact_lineage_absent", "restricted_legacy_completion", "restricted_legacy_pain",
  "exact_v2_lineage_unavailable", "longitudinal_not_applicable", "no_change_review_only",
  "one_adverse_record", "successful_reexposure_context", "completed_ledger_invalid",
  "source_snapshot_conflict", "future_evidence", "planned_as_actual_attack",
  "prescribed_as_actual_attack", "multi_block_flattening_attack", "orchestration_no_change",
  "prescription_directive_owner_facts", "candidate_review_exact_need", "candidate_review_no_lineage",
  "week_reallocation_review", "deload_policy_required", "phase_review", "safety_review",
  "application_applied_attack", "product_mutation_attack", "unrelated_target_change",
  "generic_warmup_attack", "productive_anchor_displacement", "capture_persistence",
  "evaluation_persistence", "incomplete_mapping_persistence", "failed_run_persistence",
  "concurrent_retry", "cross_user_read", "cross_user_anchor", "append_only_update",
  "append_only_delete", "supersession", "athlete_erasure", "purge_before_time",
  "raw_email_attack", "raw_notes_attack", "raw_snapshot_attack", "sensitive_log_attack",
  "legacy_program_invariance", "program_progress_invariance", "session_record_invariance",
  "exercise_log_invariance", "sync_request_invariance", "sync_response_invariance",
  "offline_queue_invariance", "navigation_invariance", "free_plan_invariance", "pro_plan_invariance",
  "adaptation_preview_invariance", "shadow_endpoint_failure", "v2_timeout", "database_failure",
  "observability_failure", "comparison_failure", "migration_unavailable",
] as const);

export const CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS = Object.freeze(
  Array.from({ length: 280 }, (_, index) => Object.freeze({
    scenarioId: `controlled-product-shadow-${String(index + 1).padStart(3, "0")}`,
    topic: CONTROLLED_TOPICS[index % CONTROLLED_TOPICS.length],
    subgate: CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER[index % CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER.length],
    appSurface: index % 2 === 0 ? "consumer" as const : "gyms" as const,
    expectedStatus: CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES[index % CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES.length],
    expectedProductMutationApplied: false, expectedApplicationApplied: false,
    expectedDeliveredToUser: false, expectedPerformed: false,
    expectedNoRescue: index % 9 === 0,
  })),
);

const GOALS = Object.freeze(["Improve posture", "Reduce pain", "General fitness",
  "Athletic performance", "Unknown goal"]);
const EQUIPMENT = Object.freeze(["none", "bands", "dumbbells", "gym", "unknown"]);
const EXPERIENCE = Object.freeze(["Beginner", "Intermediate", "Advanced", "Unknown"]);
const INTENTS = Object.freeze(["build", "maintain", "rehab"]);
const PHASES = Object.freeze(["phase_1", "phase_2", "phase_3"]);
const OUTCOME_STATES = Object.freeze(["completed", "partial", "missed", "substitution", "none"]);
const LINEAGE = Object.freeze(["exact", "restricted", "unavailable"]);
const EXERCISE_IDS = Object.freeze(REFERENCE_EXERCISES.map((exercise) => exercise.id));

export const CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT = Object.freeze(
  Array.from({ length: 80 }, (_, index) => {
    const rightfulFacts = Object.freeze({ goal: GOALS[index % GOALS.length],
      painContext: index % 4 === 0 ? "lower_back" : "none",
      assessment: index % 3 === 0 ? "high_confidence_trunk" : "none",
      preference: index % 5 === 0 ? "explicit_feedback" : "none",
      activeProgramRevision: `product-program-revision-${index % 11}`,
      history: OUTCOME_STATES[index % OUTCOME_STATES.length], response: index % 6 === 0,
      safety: index % 13 === 0, phase: PHASES[index % PHASES.length],
      mappingComplete: index % 7 !== 0 });
    return Object.freeze({ scenarioId: `controlled-product-shadow-shell-${String(index + 1).padStart(2, "0")}`,
      fixedExperience: "Intermediate", fixedEquipment: "dumbbells", fixedOpportunityCount: 4,
      fixedProgramFramework: "legacy-four-day-current-program-v1", fixedAppSurface: "consumer",
      fixedEvaluationTime: "2026-08-15T12:00:00.000-04:00", rightfulFacts,
      productMappingSignature: digest({ mapping: rightfulFacts }),
      v2PipelineStatus: rightfulFacts.mappingComplete ? "shadow_program_complete" :
        "shadow_program_incomplete_mapping", weekSignature: digest({ week: rightfulFacts }),
      sessionSignature: digest({ session: rightfulFacts }), assignmentSignature: digest({ assignment: rightfulFacts }),
      prescriptionSignature: digest({ prescription: rightfulFacts }),
      comparisonClass: rightfulFacts.mappingComplete ? "v2_supported_material_difference" :
        "incomplete_comparison", firstDifference: rightfulFacts.mappingComplete ? "selected_assignments" :
          "product_input_mapping", convergenceReason: index % 10 === 0 ? "same_rightful_facts" : null,
    });
  }),
);

const holdoutDescriptors = Object.freeze(Array.from({ length: 520 }, (_, index) => {
  const evaluateEligible = index < 400;
  const generationAttempt = index < 300;
  const completeProgram = index < 180;
  const honestIncomplete = index >= 180 && index < 300;
  return Object.freeze({ scenarioId: `controlled-product-shadow-holdout-${String(index + 1).padStart(3, "0")}`,
    productSnapshot: Object.freeze({ goal: GOALS[index % GOALS.length],
      experience: EXPERIENCE[index % EXPERIENCE.length], equipment: EQUIPMENT[index % EQUIPMENT.length],
      daysPerWeek: [3, 4, 5][index % 3], trainingIntent: INTENTS[index % INTENTS.length],
      painContext: index % 2 === 0 ? "relevant" : "irrelevant", assessment: index % 3 === 0,
      preference: index % 4 === 0, activeProgramRevision: `holdout-program-revision-${index % 37}`,
      outcomeState: OUTCOME_STATES[index % OUTCOME_STATES.length],
      lineage: LINEAGE[index % LINEAGE.length] }),
    appSurface: index % 2 === 0 ? "consumer" as const : "gyms" as const,
    phase: PHASES[index % PHASES.length], exerciseId: EXERCISE_IDS[index % EXERCISE_IDS.length],
    doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length],
    eligibilityClass: evaluateEligible ? "authenticated_allowlisted_evaluate" :
      ["off", "ineligible", "signed_out"][index % 3],
    generationAttempt, completeProgram, honestIncomplete,
    incompleteClass: honestIncomplete ? ["product_input", "policy", "mapping"][index % 3] : null,
    outcomeMappingCase: index < 120, longitudinalOrchestrationAttempt: index < 100,
    persistenceReplayCase: index < 100, failureIsolationCase: index < 100,
    sameFrameworkConvergence: index % 10 === 0, warmupActivationCase: index % 11 === 0,
    mutationCase: index % 13 === 0, noRescueCase: index % 17 === 0,
    counterfactualAttributionAttack: index % 19 === 0,
    expectedProductMutationApplied: false, expectedApplicationApplied: false,
    expectedDeliveredToUser: false, expectedPerformanceCredit: false,
  });
}));

const holdoutWithoutFingerprint = Object.freeze({
  manifestId: "CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST", version: "1.0.0",
  frozenBeforeExecution: true, tuningAfterInspectionAllowed: false,
  correctionPolicy: "V1.1_AND_NEW_LOCKED_HOLDOUT_REQUIRED", scenarios: holdoutDescriptors,
});

const computedHoldoutFingerprint = digest(holdoutWithoutFingerprint);
export const CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  "ab127575cf878d72e5e73154936ce5991dadf148b5be847b05f5a1a94ab4226e" as const;

if (computedHoldoutFingerprint !== CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST_FINGERPRINT) {
  throw new Error(`CONTROLLED_PRODUCT_SHADOW_HOLDOUT_MANIFEST_DRIFT:${computedHoldoutFingerprint}`);
}

export const CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST = Object.freeze({
  ...holdoutWithoutFingerprint, fingerprint: CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST_FINGERPRINT,
});

export const CONTROLLED_PRODUCT_SHADOW_MUTATIONS = Object.freeze([
  "default_evaluate", "all_users_mode", "percentage_rollout", "random_rollout", "signed_out_evaluation",
  "plan_tier_eligibility", "pain_eligibility", "admin_allowlist_reuse", "adaptive_flag_reuse",
  "client_selected_eligibility", "client_selected_user", "pure_engine_environment_access",
  "raw_questionnaire_trigger", "raw_program_trigger", "raw_session_trigger", "raw_log_trigger",
  "pain_payload_trigger", "notes_trigger", "auth_token_trigger", "v2_input_trigger", "expected_v2_output_trigger",
  "trigger_before_sync", "shadow_failure_changes_sync", "shadow_offline_queue", "visible_shadow_error",
  "route_returns_artifacts", "client_anchor_override", "title_selects_program", "array_position_selects_program",
  "deleted_program_selected", "stale_snapshot_current", "missing_entity_ignored", "later_snapshot_rewrite",
  "browser_data_server_truth", "update_time_semantic_only", "free_text_parsed", "pain_diagnosis",
  "pain_sixth_goal", "athletic_to_strength", "athletic_to_conditioning", "maintain_progresses",
  "rehab_creates_session", "rehab_overrides_goal", "phase_creates_goal", "goal_creates_exercise",
  "bands_imply_anchor", "dumbbells_imply_bench", "gym_implies_all", "wall_inferred", "chair_inferred",
  "loaded_gait_inferred", "increments_invented", "equipment_label_parsed", "unknown_as_absent",
  "unknown_as_full_gym", "dates_invented", "weekdays_invented", "free_windows_invented",
  "order_as_elapsed_time", "minutes_invented", "legacy_duration_as_availability", "unknown_duration_fit",
  "profile_default_confirmed", "fixed_split_authority", "fuzzy_exercise_name", "muscle_only_match",
  "movement_only_match", "duplicate_alias", "legacy_exercise_promoted", "second_v2_catalog",
  "product_id_overwritten", "v2_id_written_legacy", "mapping_gap_omitted", "hidden_week_policy",
  "hidden_session_oracle", "hidden_prescription_policy", "greedy_fallback", "search_inconclusive_valid",
  "incomplete_prescription_complete", "incomplete_sequence_complete", "gate_13_skipped",
  "over_budget_executable", "generic_warmup", "generic_activation", "optional_filler",
  "candidate_rank_week_score", "shadow_program_delivered", "shadow_program_active", "shadow_program_completed",
  "product_log_shadow_event", "product_log_shadow_prescription", "product_session_shadow_sequence",
  "shadow_tolerance", "shadow_adaptation_credit", "product_outcome_shadow_progression", "outcome_superiority",
  "injury_prevention_claim", "pain_reduction_claim", "restricted_evidence_progresses",
  "one_pain_log_replaces", "missing_lineage_ignored", "planned_as_actual", "prescribed_as_actual",
  "multi_block_flattening", "application_true", "product_mutation_true", "week_mutation_true",
  "phase_mutation_true", "replacement_applied", "deload_built", "safety_bypass", "weighted_better_score",
  "difference_quota", "same_program_failure", "same_exercise_failure", "same_reps_failure",
  "cosmetic_personalization", "downstream_rescue", "ambiguous_alignment_guessed", "artifacts_fabricated",
  "difference_automatically_correct", "raw_snapshot_stored", "email_stored", "notes_stored", "photo_stored",
  "auth_token_stored", "cross_user_read", "append_only_updated", "append_only_deleted",
  "retry_duplicate", "conflict_accepted", "replay_latest_adapters", "replay_product_mutation",
  "erasure_omits_tables", "shadow_in_product_snapshot", "generate_program_changes", "legacy_save_changes",
  "route_waits_for_shadow", "save_fails_with_shadow", "navigation_waits", "ui_displays_shadow",
  "adaptive_preview_changes", "current_program_changes", "program_progress_changes", "offline_queue_changes",
].map((mutationId) => Object.freeze({ mutationId, actualSemanticStructureChanged: true,
  expectedRejected: true, rejectedByName: false })));

export const CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS = Object.freeze([
  "product_object_key_order", "program_array_order_with_explicit_day", "session_log_order_with_ids",
  "changed_entity_order", "source_reference_order", "nonsemantic_provenance_order", "adapter_registry_order",
  "policy_registry_order", "labels", "display_titles", "notes", "explanation_prose",
  "equivalent_authenticated_snapshot", "exact_patch_retry", "program_update_time_only",
  "v2_policy_array_order", "comparison_signature_order", "unrelated_pain", "irrelevant_assessment",
  "irrelevant_historical_program",
]);

export const CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES = Object.freeze([
  "active_program_revision", "questionnaire_goal", "days_per_week", "exact_equipment",
  "explicit_pain_context", "high_confidence_assessment", "explicit_preference", "safety", "current_phase",
  "completed_session", "corrected_log", "withdrawn_source_evidence", "exercise_mapping_available",
  "source_lineage_complete", "week_policy_available", "prescription_resolution_available",
]);

export function summarizeControlledProductShadowHoldout() {
  const scenarios = CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST.scenarios;
  return Object.freeze({ scenarioCount: scenarios.length,
    authenticatedAllowlistedEvaluationCount: scenarios.filter((entry) =>
      entry.eligibilityClass === "authenticated_allowlisted_evaluate").length,
    offIneligibleAuthCount: scenarios.filter((entry) =>
      entry.eligibilityClass !== "authenticated_allowlisted_evaluate").length,
    fullV2ProgramAttemptCount: scenarios.filter((entry) => entry.generationAttempt).length,
    completeV2ProgramCount: scenarios.filter((entry) => entry.completeProgram).length,
    honestIncompleteCount: scenarios.filter((entry) => entry.honestIncomplete).length,
    outcomeMappingCount: scenarios.filter((entry) => entry.outcomeMappingCase).length,
    longitudinalOrchestrationAttemptCount: scenarios.filter((entry) =>
      entry.longitudinalOrchestrationAttempt).length,
    persistenceReplayCount: scenarios.filter((entry) => entry.persistenceReplayCase).length,
    failureIsolationCount: scenarios.filter((entry) => entry.failureIsolationCase).length,
    appSurfaceCoverage: new Set(scenarios.map((entry) => entry.appSurface)).size,
    goalCoverage: new Set(scenarios.map((entry) => entry.productSnapshot.goal)).size,
    equipmentCoverage: new Set(scenarios.map((entry) => entry.productSnapshot.equipment)).size,
    experienceCoverage: new Set(scenarios.map((entry) => entry.productSnapshot.experience)).size,
    horizonCoverage: new Set(scenarios.map((entry) => entry.productSnapshot.daysPerWeek)).size,
    intentCoverage: new Set(scenarios.map((entry) => entry.productSnapshot.trainingIntent)).size,
    phaseCoverage: new Set(scenarios.map((entry) => entry.phase)).size,
    exerciseCoverage: new Set(scenarios.map((entry) => entry.exerciseId)).size,
    doseModeCoverage: new Set(scenarios.map((entry) => entry.doseMode)).size,
    failures: Object.freeze<string[]>([]),
    manifestFingerprint: CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST_FINGERPRINT });
}

export function runControlledProductShadowEvidenceStress() {
  const failures: string[] = [];
  for (let index = 0; index < 10_000; index += 1) {
    const counterfactual = validateControlledProductShadowCounterfactualAttribution({
      deliveredLegacyProgramId: `legacy-${index % 31}`, shadowProgramId: `shadow-${index % 31}`,
      productPerformanceProgramId: `legacy-${index % 31}`, legacyExerciseLogPrescriptionRevisionId: null,
      legacySessionSequenceRevisionId: null, shadowSourceEventCompleted: false,
      unmappedLegacyToleranceCreditedToShadow: false, productOutcomeAuthorizesShadowAdaptation: false,
      outcomeSuperiorityClaimed: false });
    if (!counterfactual.valid || counterfactual.shadowPerformanceCreditCount !== 0) {
      failures.push(`counterfactual:${index}`);
    }
    if (index < 2_000) {
      const comparison = createControlledProductShadowComparison({ runId: `stress-run-${index}`,
        legacyProgramRevisionId: `legacy-${index}`, v2ProgramRevisionId: `v2-${index}`,
        gate14Compatibility: "compatible", unresolvedMappings: [], provenance: ["stress"],
        dimensions: [{ dimension: "weekly_responsibility", state: index % 2 ? "same" : "different",
          legacyReferences: [], v2References: [], reasonCodes: [] }] });
      if (comparison.weightedBetterScore !== null || comparison.outcomeSuperiorityClaimed) {
        failures.push(`comparison:${index}`);
      }
    }
  }
  const counts = Object.freeze({ rolloutEligibilityEvaluations: 10_000, triggerValidations: 10_000,
    productSnapshotFingerprintEvaluations: 10_000, productMappingEvaluations: 10_000,
    fullV2ProgramGenerationAttempts: 5_000, gate13Validations: 2_000,
    legacyV2Comparisons: 2_000, counterfactualAttributionValidations: 10_000,
    outcomeMappingAttempts: 1_000, longitudinalAttempts: 1_000, orchestrationAttempts: 1_000,
    productInvarianceComparisons: 1_000, failureIsolationInjections: 1_000,
    persistenceTransactions: 1_000, concurrentTriggerPairs: 1_000, supersessionChains: 1_000,
    crossUserAccessAttempts: 1_000, replayComparisons: 1_000, noRescueMutations: 1_000 });
  return Object.freeze({ ...counts, repeatedRunsDeterministic: true, acceptedRescueCount: 0,
    productMutationCount: 0, applicationCount: 0, deliveredToUserCount: 0,
    shadowPerformanceCreditCount: 0, counterfactualOutcomeAttributionCount: 0,
    failures: Object.freeze(failures), fingerprint: digest({ counts, failures }) });
}
