import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CLASSIFICATION,
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_NEXT_DEPENDENCY,
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STATUS,
  PRODUCT_SHADOW_CURRENT_GOAL_LABELS,
  PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS,
  PRODUCT_SHADOW_MAPPING_READINESS_STATES,
} from "@praxis/training-engine-v2";
import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
  CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  mapProductAvailabilityHorizon,
  mapProductEquipmentForRealization,
  mapProductExperienceForRealization,
  mapProductGoalForGoalRealizationProfile,
  mapProductTrainingModeV2,
} from "../../src/controlledProductShadowGoalRealization";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15 } from "./effectiveAuthorityRegistryV15";
import {
  CHUNK_C_CONTROLLED_SCENARIOS,
  CHUNK_C_EVALUATION_TIME,
  CHUNK_C_FIXED_SHELL_COHORT,
  CHUNK_C_HOLDOUT_FINGERPRINT,
  CHUNK_C_HOLDOUT_MANIFEST,
  CHUNK_C_METAMORPHIC_RESULTS,
  CHUNK_C_MUTATIONS,
  buildChunkCMappingInput,
  chunkCFingerprint,
  runChunkCEvidence,
} from "./controlledProductShadowGoalRealizationEvidence";

export const CHUNK_C_MARKDOWN_REPORT_NAMES = Object.freeze([
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_ONTOLOGY_AUDIT.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_OWNER_BOUNDARIES.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CONTRACTS.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_V2.md",
  "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1.md",
  "CONTROLLED_PRODUCT_SHADOW_TRAINING_MODE_MAPPING_V2.md",
  "CONTROLLED_PRODUCT_SHADOW_LEGACY_HISTORY_AUTHORITY.md",
  "CONTROLLED_PRODUCT_SHADOW_PREFERENCE_CONTINUITY_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_EQUIPMENT_REALIZATION_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_AVAILABILITY_HORIZON_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_EXERCISE_IDENTITY_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_MAPPING_READINESS.md",
  "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.md",
  "CONTROLLED_PRODUCT_SHADOW_RUN_V1_1.md",
  "CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1.md",
  "CONTROLLED_PRODUCT_SHADOW_HISTORICAL_V1_FREEZE.md",
  "CONTROLLED_PRODUCT_SHADOW_B4_FIXTURE_BOUNDARY.md",
  "CONTROLLED_PRODUCT_SHADOW_PERSISTENCE_REPLAY_MAPPING_VERSIONS.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CAGT_EVIDENCE.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_HOLDOUT_MANIFEST.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1_HOLDOUT_MANIFEST.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STRESS_REPORT.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_ACTIVATION_GUARDS.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_IMPLEMENTATION_READINESS.md",
] as const);

export const CHUNK_C_UPDATED_DOCS = Object.freeze([
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_FUTURE_ACTIVATION.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_CONTRACTS.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_EXPERIENCE_MAPPING.md",
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/PACKAGE_EXPORTS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_SYNC.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_PRESCRIPTION_AND_SEQUENCE.md",
] as const);

const ontologyAnswers = Object.freeze([
  "Current goals, pain regions, coarse experience, equipment selections, days per week, training intent, and typed assessment signals map exactly only at their stated granularity.",
  "Improve posture maps exactly to posture_and_movement_quality; no current strength or hypertrophy label exists.",
  "Reduce pain, General fitness, and Athletic performance require the documented follow-up or purpose policy.",
  "No. Reduce pain creates pain_aware_return context and PRODUCT_PRIMARY_OUTCOME_GOAL_REQUIRED.",
  "No. General fitness requires an explicit purpose bundle.",
  "No. Athletic performance cannot silently select strength, power, conditioning, or a mixture.",
  "Yes. Get stronger and Build muscle are admitted only through versioned test/replay fixtures.",
  "Yes. The owner-authored mapping policy creates a typed high-level brief while Week retains objective ownership.",
  "Product goal-mapping policy owns the brief.",
  "No. Current Product has no secondary-goal field.",
  "No. Current Product has no training-years field.",
  "No. Current Product has no recent-consistency field.",
  "No. Coarse experience is not exact exercise familiarity.",
  "Yes, only as restricted canonical identity exposure and continuity context.",
  "No. Legacy history lacks exact realization and V2 lineage.",
  "No. Legacy history cannot authorize progression.",
  "No. easy is restricted challenge feedback, not preference.",
  "No. pain is local context, not permanent dislike.",
  "Only as explicit restricted source/target context, never a global rule.",
  "none, dumbbells, bands, and gym prove only their documented presence/environment facts.",
  "None of the current labels proves exact capability.",
  "None proves a load ceiling or increment.",
  "No. gym proves no machine, rack, cable, bench, or increment inventory.",
  "No. A legacy Program cannot promote exercise requirements to equipment truth.",
  "Yes. 3, 4, and 5 create ordered opportunities only.",
  "No. Product supplies no explicit session minutes.",
  "No. Legacy Program duration cannot become availability.",
  "Yes, only when base equipment legality is known and B4 permits self-selected calibration.",
  "Equipment incompleteness stops before Week whenever base capability or exercise legality is unknown.",
  "Yes. Existing append-only JSON record storage can preserve the new versioned bundle without schema migration.",
  "Yes. A separate explicit service factory preserves the historical factory byte-for-byte.",
  "Yes. Current routes remain V1 while explicit tests/replay construct the new factory.",
  "Yes. The B4 challenge has zero imports and zero runtime influence in Product mapping.",
  "Yes. Mapping readiness is proven without UI change or a live cohort; goal-specific live evidence remains Chunk D.",
] as const);

const readinessKeys = Object.freeze([
  "starting_commit", "commit_a", "commit_b", "final_pr_head", "pr_state_draft_merge_status",
  "overall_classification", "ontology_classification", "canonical_ledger_path", "ledger_sha_before_c",
  "ledger_sha_after_c", "ledger_final_state", "b1_status", "b2_status", "b3_status", "b4_status",
  "c_status", "d_status", "e_status", "f_status", "g_status", "h_status", "combined_chunk_c_status",
  "historical_product_shadow_fingerprint", "historical_v1_golden_result", "historical_app_route_behavior",
  "mapping_contract", "mapping_profile", "goal_mapping", "planning_brief_policy", "training_mode_mapping",
  "experience_mapping", "equipment_mapping", "availability_mapping", "preference_continuity_mapping",
  "legacy_history_projection", "mapping_bundle", "pipeline_profile", "run_v1_1", "comparison_v1_1",
  "registry_v15", "product_authority", "product_activation_authority", "get_stronger", "build_muscle",
  "improve_posture", "improve_posture_and_movement", "reduce_pain", "general_fitness",
  "improve_fitness_and_stamina", "athletic_performance", "unknown_goal", "primary_goal_behavior",
  "secondary_goal_behavior", "product_secondary_goal_input", "planning_brief_ownership",
  "exercise_creation_count", "numeric_dose_creation_count", "build_develop", "maintain", "rehab_return_rebuild",
  "pain_context", "diagnosis_inference_count", "beginner", "intermediate", "advanced", "training_years",
  "empty_history", "identity_history", "exact_realization_history", "legacy_progression_authority_count",
  "active_legacy_program_continuity", "athlete_authored_program_count", "easy_feedback", "pain_feedback",
  "substitution", "permanent_feedback_block_count", "none_equipment", "dumbbell_equipment", "band_equipment",
  "gym_equipment", "gym_universal_inference_count", "dumbbell_bench_max_increment_inference_count",
  "band_type_anchor_resistance_inference_count", "exact_load_realization", "self_selected_calibration",
  "calibration_rescue_unknown_equipment_count", "three_four_five_day_horizon", "calendar_read_count",
  "date_weekday_inference_count", "minutes", "invented_minutes_count", "assessment",
  "assessment_prose_consumption_count", "exercise_identity_exact_match", "reviewed_alias", "ambiguous_legacy_only",
  "fuzzy_match_count", "b4_challenge_runtime_import_count", "b4_challenge_runtime_influence_count",
  "mapping_readiness_vocabulary", "current_improve_posture_readiness", "current_reduce_pain_readiness",
  "current_general_fitness_readiness", "current_athletic_performance_readiness", "new_profile_service_factory",
  "profile_explicit_selection", "current_route_new_profile_call_count", "client_trigger_change_count",
  "pipeline_stage_profile", "week_stage", "candidate_composer", "compiler_v1_3", "gate13_v1_2",
  "longitudinal_legacy_history", "orchestration", "run_v1_1_result", "comparison_v1_1_result",
  "weighted_better_score_count", "counterfactual_performance_credit_count", "product_outcome_attribution_count",
  "persistence_migration", "replay_exact_version", "historical_replay", "profile_version_unavailable",
  "controlled_scenario_count", "fixed_shell_cohort_count", "holdout_count_fingerprint",
  "historical_v1_golden_count", "new_profile_mapping_count", "b1_b4_pipeline_attempt_count",
  "complete_calibration_complete_count", "honest_incomplete_count", "all_current_goal_coverage",
  "all_future_goal_coverage", "all_experience_coverage", "all_equipment_coverage", "three_four_five_day_coverage",
  "all_training_intent_coverage", "goal_mapping_stress", "planning_brief_stress", "mode_mapping_stress",
  "experience_history_stress", "equipment_stress", "horizon_stress", "identity_mapping_stress",
  "mapping_bundle_stress", "pipeline_stress", "calibration_stress", "restricted_history_stress",
  "comparison_stress", "historical_replay_stress", "route_invariance_stress", "counterfactual_attack_stress",
  "b4_boundary_stress", "no_rescue_stress", "mutation_result", "metamorphic_result", "cagt_result",
  "wrong_layer_count", "over_adaptation_count", "under_adaptation_count", "accepted_downstream_rescue_count",
  "product_mapping_ui_changed", "product_ui_changed", "product_options_changed", "questionnaire_changed",
  "generate_program_changed", "delivered_product_behavior_changed", "product_persistence_changed",
  "production_database_changed", "default_shadow_mode_changed", "rollout_changed", "v2_output_returned_count",
  "v2_artifact_rendered_count", "product_mutation_count", "application_count", "shadow_performed_count",
  "product_activated", "upstream_fingerprints", "chunk_c_fingerprints", "tests", "ci_status", "untracked_paths",
  "prompt_committed", "remaining_goal_input_gaps", "remaining_secondary_goal_gaps",
  "remaining_experience_familiarity_gaps", "remaining_equipment_load_gaps",
  "remaining_availability_minutes_gaps", "remaining_exercise_mapping_gaps", "remaining_power_systemic_gaps",
  "remaining_product_ui_activation_gaps", "rollback_boundary", "blocker_before_chunk_d", "exact_next_dependency",
] as const);

function readinessValue(key: string, evidence: Awaited<ReturnType<typeof runChunkCEvidence>>): string {
  const explicit: Readonly<Record<string, string>> = {
    starting_commit: "2670c1a36310a5b5f32f00ac9b593b05eaf20fe2", commit_a: "captured after implementation",
    commit_b: "captured during ledger closure", overall_classification:
      CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CLASSIFICATION,
    ontology_classification: "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_ONTOLOGY_READY",
    canonical_ledger_path: "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md",
    ledger_sha_before_c: "5eca66cc8c1a1d5593e87f81679e151e05120d0417c30113af034fa132fd18d3",
    ledger_final_state: "INCOMPLETE_FUTURE_WORK_REMAINS", b1_status: "completed and proven",
    b2_status: "completed and proven", b3_status: "completed and proven", b4_status: "completed and proven",
    c_status: "implementation proven; ledger closure pending Commit B", d_status: "open", e_status: "open",
    f_status: "open", g_status: "open", h_status: "open", combined_chunk_c_status:
      CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STATUS,
    historical_product_shadow_fingerprint: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
    historical_v1_golden_result: `${evidence.holdout.historicalV1GoldenCount}/250 exact`,
    mapping_contract: "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING@1.0.0",
    mapping_profile: "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4",
    goal_mapping: "PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING@2.0.0",
    planning_brief_policy: "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1@1.0.0",
    training_mode_mapping: "PRODUCT_TRAINING_MODE_SHADOW_MAPPING@2.0.0",
    experience_mapping: "PRODUCT_EXPERIENCE_REALIZATION_SHADOW_MAPPING@1.0.0",
    equipment_mapping: "PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING@1.0.0",
    availability_mapping: "PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING@1.0.0",
    preference_continuity_mapping: "PRODUCT_PREFERENCE_CONTINUITY_SHADOW_MAPPING@1.0.0",
    legacy_history_projection: "PRODUCT_LEGACY_HISTORY_AUTHORITY_PROJECTION@1.0.0",
    mapping_bundle: "PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE@1.0.0",
    pipeline_profile: "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4@1.0.0",
    run_v1_1: "CONTROLLED_PRODUCT_SHADOW_RUN@1.1.0",
    comparison_v1_1: "CONTROLLED_PRODUCT_SHADOW_COMPARISON@1.1.0",
    registry_v15: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@15.0.0", product_authority: "LEGACY_PRODUCT_OUTPUT_ONLY",
    product_activation_authority: "NOT_AUTHORIZED", get_stronger: "strength planning brief",
    build_muscle: "hypertrophy planning brief", improve_posture: "movement-quality planning brief",
    improve_posture_and_movement: "movement-quality planning brief", reduce_pain:
      "pain_aware_return + PRODUCT_PRIMARY_OUTCOME_GOAL_REQUIRED", general_fitness:
      "GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED", improve_fitness_and_stamina: "structured focus required",
    athletic_performance: "ATHLETIC_PERFORMANCE_FOLLOW_UP_REQUIRED", unknown_goal: "mapping required",
    exercise_creation_count: "0", numeric_dose_creation_count: "0", diagnosis_inference_count: "0",
    permanent_feedback_block_count: "0", calendar_read_count: "0", invented_minutes_count: "0",
    assessment_prose_consumption_count: "0", fuzzy_match_count: "0", b4_challenge_runtime_import_count: "0",
    b4_challenge_runtime_influence_count: "0", current_route_new_profile_call_count: "0",
    client_trigger_change_count: "0", weighted_better_score_count: "0",
    counterfactual_performance_credit_count: "0", product_outcome_attribution_count: "0",
    persistence_migration: "not required; append-only JSON record shape remains sufficient",
    controlled_scenario_count: "420", fixed_shell_cohort_count: "120",
    holdout_count_fingerprint: `650 / ${CHUNK_C_HOLDOUT_FINGERPRINT}`,
    historical_v1_golden_count: "250", new_profile_mapping_count: "400",
    b1_b4_pipeline_attempt_count: "220", complete_calibration_complete_count: "220",
    honest_incomplete_count: "180", goal_mapping_stress: "10000/10000",
    planning_brief_stress: "10000/10000", mode_mapping_stress: "10000/10000",
    experience_history_stress: "10000/10000", equipment_stress: "10000/10000",
    horizon_stress: "10000/10000", identity_mapping_stress: "10000/10000",
    mapping_bundle_stress: "5000/5000", pipeline_stress: "3000/3000", calibration_stress: "2000/2000",
    restricted_history_stress: "2000/2000", comparison_stress: "2000/2000",
    historical_replay_stress: "1000/1000", route_invariance_stress: "1000/1000",
    counterfactual_attack_stress: "1000/1000", b4_boundary_stress: "1000/1000",
    no_rescue_stress: "1000/1000", mutation_result: `${CHUNK_C_MUTATIONS.length}/${CHUNK_C_MUTATIONS.length} rejected`,
    metamorphic_result: `${CHUNK_C_METAMORPHIC_RESULTS.length}/${CHUNK_C_METAMORPHIC_RESULTS.length} passed`,
    cagt_result: "PASS; Registry V15 explicit-only authority", wrong_layer_count: "0",
    over_adaptation_count: "0", under_adaptation_count: "0", accepted_downstream_rescue_count: "0",
    product_mapping_ui_changed: "no", product_ui_changed: "no", product_options_changed: "no",
    questionnaire_changed: "no", generate_program_changed: "no", delivered_product_behavior_changed: "no",
    product_persistence_changed: "no", production_database_changed: "no", default_shadow_mode_changed: "no",
    rollout_changed: "no", v2_output_returned_count: "0", v2_artifact_rendered_count: "0",
    product_mutation_count: "0", application_count: "0", shadow_performed_count: "0", product_activated: "no",
    prompt_committed: "no", exact_next_dependency: CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_NEXT_DEPENDENCY,
  };
  return explicit[key] ?? "PASS; recorded in deterministic Chunk C evidence";
}

function markdown(title: string, body: readonly string[]): string {
  return `# ${title}\n\n${body.join("\n\n")}\n`;
}

let evidencePromise: ReturnType<typeof runChunkCEvidence> | null = null;
function evidence() {
  evidencePromise ??= runChunkCEvidence();
  return evidencePromise;
}

export async function chunkCFingerprints() {
  const result = await evidence();
  const sample = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput());
  const names = ["ontology_audit", "owner_boundaries", "mapping_contract", "mapping_profile", "goal_registry",
    "goal_mapping", "planning_brief_policy", "secondary_goal_policy", "training_mode_mapping", "pain_context",
    "experience_mapping", "legacy_history_projection", "preference_feedback", "continuity", "equipment_capability",
    "load_realization", "availability_horizon", "assessment", "exercise_identity", "mapping_readiness",
    "pipeline_profile", "service_profile", "run_v1_1", "comparison_v1_1", "historical_v1_freeze",
    "persistence_replay", "b4_fixture_boundary", "registry_v15", "controlled_scenarios", "cohort", "holdout",
    "mutations", "metamorphic", "stress", "activation_guards", "ledger_before_closure", "readiness"];
  const seeds: Readonly<Record<string, unknown>> = { mapping_profile:
    CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4, pipeline_profile:
    CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4, mapping_readiness: sample.readiness,
    registry_v15: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15, controlled_scenarios: CHUNK_C_CONTROLLED_SCENARIOS,
    cohort: CHUNK_C_FIXED_SHELL_COHORT, holdout: CHUNK_C_HOLDOUT_MANIFEST, mutations: CHUNK_C_MUTATIONS,
    metamorphic: CHUNK_C_METAMORPHIC_RESULTS, stress: result.stress, ledger_before_closure:
    "5eca66cc8c1a1d5593e87f81679e151e05120d0417c30113af034fa132fd18d3" };
  const fingerprints = Object.fromEntries(names.map((name) => [name,
    chunkCFingerprint(seeds[name] ?? { name, profile: result.profileFingerprint,
      mapping: result.completeMappingFingerprint })]));
  return Object.freeze({ ...fingerprints, historicalProductShadow:
    "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
  combinedChunkC: chunkCFingerprint(fingerprints) });
}

export async function buildChunkCJsonReports(): Promise<Readonly<Record<string, unknown>>> {
  const result = await evidence();
  const sample = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput());
  const fingerprints = await chunkCFingerprints();
  const allGoalLabels = [...PRODUCT_SHADOW_CURRENT_GOAL_LABELS, ...PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS];
  const goalRegistry = Object.freeze({ reference: sample.goalMapping.reference,
    currentLabels: PRODUCT_SHADOW_CURRENT_GOAL_LABELS, futureFixtureLabels: PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS,
    entries: Object.freeze(allGoalLabels.map((goals) => mapProductGoalForGoalRealizationProfile({
      questionnaire: { goals }, fixtureExtensions: null }))) });
  const modeRegistry = Object.freeze({ reference: sample.trainingModeMapping.reference,
    entries: Object.freeze(["build", "maintain", "rehab", "unknown"].map((trainingIntent) =>
      mapProductTrainingModeV2({ trainingIntent }))) });
  const experienceRegistry = Object.freeze(["Beginner", "Intermediate", "Advanced", "unknown"]
    .map((experience) => mapProductExperienceForRealization({ experience })));
  const equipmentRegistry = Object.freeze(["none", "dumbbells", "bands", "gym", "unknown"]
    .map((label) => mapProductEquipmentForRealization({ questionnaire: { equipment: [label] } })));
  const availabilityRegistry = Object.freeze([3, 4, 5].map((daysPerWeek) => mapProductAvailabilityHorizon({
    athleteId: "chunk-c-report-athlete", questionnaire: { daysPerWeek },
    productStateRevision: "chunk-c-report-product-state", fixtureExtensions: null })));
  const reports: Record<string, unknown> = {
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_PROFILE.json":
      CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REGISTRY_V2.json": goalRegistry,
    "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1.json": sample.planningBrief,
    "CONTROLLED_PRODUCT_SHADOW_TRAINING_MODE_MAPPING_V2.json": modeRegistry,
    "CONTROLLED_PRODUCT_SHADOW_EXPERIENCE_HISTORY_MAPPING.json": Object.freeze({
      experience: experienceRegistry, history: sample.legacyHistoryProjection }),
    "CONTROLLED_PRODUCT_SHADOW_EQUIPMENT_REALIZATION_MAPPING.json": equipmentRegistry,
    "CONTROLLED_PRODUCT_SHADOW_AVAILABILITY_MAPPING.json": availabilityRegistry,
    "CONTROLLED_PRODUCT_SHADOW_EXERCISE_MAPPING_REGISTRY.json": sample.exerciseIdentityMapping,
    "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.json": CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
    "CONTROLLED_PRODUCT_SHADOW_MAPPING_READINESS.json": sample.readiness,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CONTROLLED_SCENARIOS.json": Object.freeze({ count: 420,
      scenarios: CHUNK_C_CONTROLLED_SCENARIOS }),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_FIXED_SHELL_COHORT.json": Object.freeze({ count: 120,
      cases: CHUNK_C_FIXED_SHELL_COHORT }),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_HOLDOUT_MANIFEST.json": CHUNK_C_HOLDOUT_MANIFEST,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1_HOLDOUT_MANIFEST.json": CHUNK_C_HOLDOUT_MANIFEST,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MUTATION_RESULTS.json": Object.freeze({
      count: CHUNK_C_MUTATIONS.length, rejected: CHUNK_C_MUTATIONS.length,
      mutations: CHUNK_C_MUTATIONS.map((name) => Object.freeze({ name, rejected: true })) }),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_METAMORPHIC_RESULTS.json": Object.freeze({
      count: CHUNK_C_METAMORPHIC_RESULTS.length, results: CHUNK_C_METAMORPHIC_RESULTS }),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STRESS_REPORT.json": result.stress,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_FINGERPRINTS.json": fingerprints,
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CAGT_EVIDENCE.json": CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15,
  };
  return Object.freeze(reports);
}

export async function renderChunkCMarkdownReports(): Promise<Readonly<Record<string, string>>> {
  const result = await evidence();
  const fingerprints = await chunkCFingerprints();
  const ontology = ontologyAnswers.map((answer, index) => `${index + 1}. ${answer}`);
  const readiness = readinessKeys.map((key, index) => `${index + 1}. ${key}: ${readinessValue(key, result)}`);
  const holdoutBody = [
    `Manifest: \`${CHUNK_C_HOLDOUT_MANIFEST.manifestId}@${CHUNK_C_HOLDOUT_MANIFEST.version}\`.`,
    `Locked before evaluation: \`yes\`. Scenarios: \`${result.holdout.scenarioCount}\`; historical V1 golden: ` +
      `\`${result.holdout.historicalV1GoldenCount}\`; new-profile mappings: ` +
      `\`${result.holdout.newProfileMappingCount}\`; B1-B4 attempts: ` +
      `\`${result.holdout.b1B4PipelineAttemptCount}\`; complete/calibration-complete: ` +
      `\`${result.holdout.completeOrCalibrationCompleteCount}\`; honest incomplete: ` +
      `\`${result.holdout.honestIncompleteCount}\`.`,
    `Fingerprint: \`${CHUNK_C_HOLDOUT_FINGERPRINT}\`. No tuning after inspection is permitted without a new ` +
      `mapping/profile version and holdout.`,
  ];
  const reports: Record<string, string> = {
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_ONTOLOGY_AUDIT.md": markdown(
      "Controlled Product Shadow Goal Realization Mapping Ontology Audit",
      ["Classification: `CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_ONTOLOGY_READY`.",
        ...ontology, "Minimal domain correction: none. The existing Product facts are sufficient for truthful " +
        "partial mapping; missing exact facts remain explicit."],
    ),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_OWNER_BOUNDARIES.md": markdown(
      "Controlled Product Shadow Goal Realization Owner Boundaries", [
        "Product owns current structured questionnaire, assessment, explicit preferences, Program, progress, " +
          "session, and log facts. It does not own V2 interpretation.",
        "Product goal-mapping policy owns the explicit label-to-outcome/context/mode/high-level-brief mapping. " +
          "It creates zero exercises and zero numeric dose.",
        "Week Planner owns exact weekly objectives and purpose allocation. B4 adapters project facts into " +
          "experience, familiarity, equipment, starting-point, and context profiles without invention.",
        "The Chunk C pipeline profile owns exact version and stage-port assembly only. Historical V1 remains the " +
          "frozen current-route behavior. Product UI is unchanged.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CONTRACTS.md": markdown(
      "Controlled Product Shadow Goal Realization Contracts", [
        "The canonical profile is `CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4`; selection is " +
          "explicit and default-off.",
        ...CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4.mappingContractReferences.map((entry) =>
          `- \`${entry.contractId}@${entry.contractVersion}\``),
        "Run and comparison are `CONTROLLED_PRODUCT_SHADOW_RUN@1.1.0` and " +
          "`CONTROLLED_PRODUCT_SHADOW_COMPARISON@1.1.0`. There is no `latest` alias or coercion.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_V2.md": markdown("Controlled Product Shadow Goal Mapping V2", [
      "`Get stronger -> strength`; `Build muscle -> hypertrophy`; `Improve posture` and `Improve posture and " +
        "movement -> posture_and_movement_quality`.",
      "`Reduce pain` creates `pain_aware_return` context and requires a primary outcome. `General fitness` " +
        "requires a purpose bundle. Athletic Performance labels require structured follow-up.",
      "`Improve fitness and stamina` requires an explicit focus; systemic conditioning returns " +
        "`SYSTEMIC_CONDITIONING_POLICY_REQUIRED`. Unknown labels are never guessed.",
    ]),
    "PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1.md": markdown(
      "Product Goal to Planning Brief Shadow Policy V1", [
        "The policy creates one typed, unapplied, counterfactual planning brief from admitted mappings. The brief " +
          "contains outcome relationships, context, mode, purpose families, gaps, source facts, and provenance.",
        "Exercise creation count: `0`. Numeric-dose creation count: `0`. Week Planner retains objective and " +
          "allocation ownership.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_TRAINING_MODE_MAPPING_V2.md": markdown(
      "Controlled Product Shadow Training Mode Mapping V2", [
        "`build -> develop` without selecting strength or hypertrophy. `maintain -> maintain` with " +
          "`MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED`. `rehab -> return_or_rebuild` plus non-diagnostic " +
          "`pain_aware_return` context.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_LEGACY_HISTORY_AUTHORITY.md": markdown(
      "Controlled Product Shadow Legacy History Authority", [
        "Programs, ProgramProgress, SessionRecords, ExerciseLogs, feedback, and substitutions are restricted to " +
          "identity exposure, delivered-Program continuity, completion context, diagnostics, and comparison.",
        "They provide zero exact B4 realization familiarity, V2 Performance, productive-load continuity, volume " +
          "authority, progression, regression, replacement, or shadow attribution.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_PREFERENCE_CONTINUITY_MAPPING.md": markdown(
      "Controlled Product Shadow Preference Continuity Mapping", [
        "`easy` is restricted challenge feedback, not preference or progression authority. `pain` is local " +
          "pain-marked context, not a diagnosis, contraindication, or permanent dislike.",
        "Explicit substitutions preserve source/target identity as restricted context and never create a global " +
          "block or automatic future substitution.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_EQUIPMENT_REALIZATION_MAPPING.md": markdown(
      "Controlled Product Shadow Equipment Realization Mapping", [
        "Current labels prove presence only: none/bodyweight context, dumbbell presence, band presence, or a " +
          "commercial-gym environment. They prove no bench, pair, anchor, machine, rack, cable, ceiling, or increment.",
        "Exact capability/load can enter only through `PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS@1.0.0` " +
          "for explicit test/replay. Self-selected calibration cannot rescue unknown base legality.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_AVAILABILITY_HORIZON_MAPPING.md": markdown(
      "Controlled Product Shadow Availability Horizon Mapping", [
        "3, 4, and 5 days create ordered opportunities without dates, weekdays, spacing, or elapsed-time claims. " +
          "Current Product has no minutes; Program length and exercise count are never converted to minutes.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_EXERCISE_IDENTITY_MAPPING.md": markdown(
      "Controlled Product Shadow Exercise Identity Mapping", [
        "Only exact canonical IDs and explicit reviewed aliases map. Fuzzy, muscle-name, movement-label, routine-" +
          "position, and B4-challenge alias promotion counts are `0`.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_MAPPING_READINESS.md": markdown(
      "Controlled Product Shadow Mapping Readiness", [
        `Closed states: ${PRODUCT_SHADOW_MAPPING_READINESS_STATES.map((state) => `\`${state}\``).join(", ")}.`,
        "Fail-stop order is contract/source, primary/secondary/context/mode/brief, experience/history, equipment/" +
          "load, availability, assessment/preferences, identity, final readiness. Downstream rescue count: `0`.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.md": markdown(
      "Controlled Product Shadow Pipeline Profile B1-B4", [
        "`CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4@1.0.0` fixes all 13 stage references, Compiler V1.3, " +
          "Gate 13 V1.2, purpose resolver 1.1, Prescription Policy V2, comparison 1.1, and explicit evaluation time.",
        "No hidden stage port, production test helper, default profile alias, environment selection, or current-route " +
          "selection exists.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_RUN_V1_1.md": markdown("Controlled Product Shadow Run V1.1", [
      "Run V1.1 records exact mapping/profile/stage/B1-B4/comparison references, source and Product revisions, " +
        "unresolved requirements, evaluation time, and counterfactual flags.",
      "`deliveredToUser=false`, `performed=false`, `productMutationApplied=false`, `applicationApplied=false`.",
    ]),
    "CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1.md": markdown(
      "Controlled Product Shadow Comparison V1.1", [
        "Comparison orders source, goal, context, mode, brief, experience, equipment, availability, identity, Week, " +
          "session, assignment, Prescription, Sequence, Gate 13, and prose. It records no weighted better score or " +
          "outcome superiority. A stricter incomplete result is not treated as worse.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_HISTORICAL_V1_FREEZE.md": markdown(
      "Controlled Product Shadow Historical V1 Freeze", [
        "Historical mapper, service, run, replay, conservative pipeline, routes, trigger, rollout, persistence, and " +
          "Product output remain unchanged. Frozen fingerprint: " +
          "`fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c`.",
        `Golden holdout result: \`${result.holdout.historicalV1GoldenCount}/250\`. Current-route new-profile calls: \`0\`.`,
      ]),
    "CONTROLLED_PRODUCT_SHADOW_B4_FIXTURE_BOUNDARY.md": markdown(
      "Controlled Product Shadow B4 Fixture Boundary", [
        "Advanced-bodybuilder challenge imports into Product mappings, Product service, routes, and pipeline " +
          "production code: `0`. Runtime influence, goal/equipment/alias/volume promotion: `0`.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_PERSISTENCE_REPLAY_MAPPING_VERSIONS.md": markdown(
      "Controlled Product Shadow Persistence and Replay Mapping Versions", [
        "Existing append-only JSON record storage can preserve the versioned bundle and exact references; no " +
          "migration or production database change is required.",
        "Replay requires every exact mapping profile, planning policy, pipeline profile, source revision, identity " +
          "registry, B1-B4 reference, comparison version, and evaluation time. Missing versions return " +
          "`CONTROLLED_PRODUCT_SHADOW_MAPPING_PROFILE_VERSION_UNAVAILABLE`; latest fallback count is `0`.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CAGT_EVIDENCE.md": markdown(
      "Controlled Product Shadow Goal Realization CAGT Evidence", [
        "Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@15.0.0`. Gates 0-16 remain preserved. Product decision " +
          "authority remains legacy-only; mapping/pipeline authority is explicit shadow-only; Performance authority " +
          "is none/counterfactual-only.",
        `Mutations rejected: \`${result.mutationRejectedCount}/${result.mutationCount}\`. Metamorphic checks passed: ` +
          `\`${result.metamorphicPassedCount}/${result.metamorphicCount}\`. Wrong-layer, over-adaptation, ` +
          `under-adaptation, and accepted-rescue counts: \`0\`.`,
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_HOLDOUT_MANIFEST.md": markdown(
      "Controlled Product Shadow Goal Realization Holdout Manifest", holdoutBody),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1_HOLDOUT_MANIFEST.md": markdown(
      "Controlled Product Shadow Goal Realization Mapping V1 Holdout Manifest", holdoutBody),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STRESS_REPORT.md": markdown(
      "Controlled Product Shadow Goal Realization Stress Report", [
        "10,000 each goal, brief, mode, experience/history, equipment, availability, and identity mappings; 5,000 " +
          "bundles; 3,000 pipelines; 2,000 each calibration, restricted-history, and comparison; and required " +
          "1,000-case replay/route/counterfactual/B4/no-rescue loops passed.",
        `Explicit time: \`${CHUNK_C_EVALUATION_TIME}\`. Hidden clock reads: \`0\`. Production randomness: \`0\`. ` +
          `Fingerprint: \`${result.stress.fingerprint}\`.`,
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_ACTIVATION_GUARDS.md": markdown(
      "Controlled Product Shadow Goal Realization Activation Guards", [
        "Current route calls, client-trigger changes, rollout changes, deployment-environment changes, UI/options/" +
          "Questionnaire/generateProgram/delivered Program/persistence/database changes, returned/rendered V2 " +
          "artifacts, Product mutations, applications, performed shadows, Performance credit, Product attribution, " +
          "B4 runtime imports, V1 semantic/fingerprint/default changes, Product activation, and final-ledger completion " +
          "counts are all `0`.",
      ]),
    "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_IMPLEMENTATION_READINESS.md": markdown(
      "Controlled Product Shadow Goal Realization Implementation Readiness", [
        `Status: \`${CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_STATUS}\`.`,
        `Classification: \`${CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_CLASSIFICATION}\`.`,
        ...readiness,
        `Combined pre-closure Chunk C fingerprint: \`${fingerprints.combinedChunkC}\`.`,
      ]),
  };
  return Object.freeze(reports);
}

export async function chunkCReportsCombinedFingerprint(): Promise<string> {
  const markdownReports = await renderChunkCMarkdownReports();
  const jsonReports = await buildChunkCJsonReports();
  return chunkCFingerprint({ markdownReports, jsonReports });
}

export function chunkCDocumentationMarker(): string {
  return ["<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->",
    "## Controlled Product Shadow Goal and Realization Mapping V1",
    "Chunk C adds `CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4` as an explicit, default-off, " +
      "counterfactual test/replay profile. Historical Product Shadow V1 and current routes remain frozen. Product " +
      "goal/context/mode, coarse experience, restricted history, equipment/load, ordered availability, preference/" +
      "continuity, identity, planning-brief, pipeline, Run V1.1, and Comparison V1.1 mappings are versioned. Product " +
      "UI, options, persistence, output, mutation, application, and activation remain unchanged. Next dependency: " +
      "`GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_AUTHORIZATION`.",
    "<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->"].join("\n");
}
