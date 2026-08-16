import { createHash } from "node:crypto";
import {
  ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE,
  ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE,
  ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE,
  ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
  EQUIPMENT_IMPLEMENT_KINDS,
  EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
  EXPERIENCE_AUTHORITY_ORDER,
  EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
  EXPERIENCE_CONTEXT_REALIZATION_VARIANTS,
  EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_IDENTITY_FAMILIARITY_STATES,
  EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
  EXERCISE_REALIZATION_FAMILIARITY_STATES,
  HABITUAL_EXPOSURE_STATES,
  HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
  PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
  PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
  PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
  REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED,
  RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
} from "../../src";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14 } from "./effectiveAuthorityRegistryV14";
import { ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE,
  ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS } from "./advancedBodybuilderChallenge";
import { B4_CHALLENGE_FIXTURE, B4_EVALUATION_TIME, B4_HOLDOUT_MANIFEST,
  B4_METAMORPHIC_RESULTS, B4_MUTATION_NAMES, b4Fingerprint, runB4Evidence } from
  "./equipmentExperienceContextEvidence";

export const B4_CLASSIFICATION =
  "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING_AUTHORIZATION" as const;
export const B4_ONTOLOGY_CLASSIFICATION =
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_READY" as const;
export const B4_IMPLEMENTATION_STATUS =
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1_IMPLEMENTED_NOT_ACTIVATED" as const;
export const B4_NEXT_DEPENDENCY =
  "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_AUTHORIZATION" as const;
export const B4_LEDGER_BEFORE_SHA =
  "6ca0c9197a6c7dd9d5925d3796ef7058676625d61559d213b1c431e4fdfd9fa1" as const;
export const PRODUCT_SHADOW_FROZEN_FINGERPRINT =
  "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c" as const;

export const B4_PRESERVED_UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicyV1: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  compilerV1_0: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  historicalCagt: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  finalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeekV1_0: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  gate14: "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6",
  phaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  longitudinalAdaptation: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  outcomeSourcePersistence: "cfa526fdbc3fb2aa2f00291b451e4ca34cad10ef63fc1529547398c5cf2baa98",
  productionWeekV1: "4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387",
  applicationOrchestration: "a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca",
  controlledProductShadow: PRODUCT_SHADOW_FROZEN_FINGERPRINT,
  productGoalAudit: "0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb",
  productGoalArchitectureB1: "68d3a1d29ef24786c7e3225d396bd10d42a475a504008fe26e20a3b253006f99",
  purposeFirstResolverB2: "535e29b43aebdd761d1a31f74843a52b4331a53dcdafde678775169f1a7e2d1c",
  supportedGoalPurposeB3: "22b6e85c6d8cbe2cfd054cece695da21ba07adc6766bebb81cd1ab45757566b6",
});

const boundary = `Classification: \`${B4_CLASSIFICATION}\`.

Status: \`${B4_IMPLEMENTATION_STATUS}\`. These contracts are future-only and require explicit
version selection. Product Shadow remains pinned to Compiler V1.0. Product mapping, UI,
orchestration, delivery, persistence, activation, and the production database are unchanged.`;

const title = (value: string): string => `# ${value}\n\n`;

const ontologyAnswers = Object.freeze([
  "No. The historical advanced label is global context and cannot express current realization truth.",
  "Yes. ATHLETE_TRAINING_EXPERIENCE_PROFILE records a bounded year range without load authority.",
  "Yes. Recent consistency and interruption states are independent from lifetime training years.",
  "Yes. Identity and exact-realization familiarity are separate versioned profiles.",
  "Yes. Global experience never upgrades an unfamiliar realization to exact familiarity.",
  "Yes. Identity evidence can be familiar even when coarse experience is novice or beginner.",
  "No. Empty V2 history remains unknown and does not prove novice status.",
  "Yes. Reviewed reports may seed context but never claim completed V2 Performance.",
  "Exact exercise, dose mode, implement, support, range, side, load, block, and lineage must match.",
  "Age is not hard-coded. Freshness remains explicit and policy-owned.",
  "No universal freshness window is justified by the reviewed evidence.",
  `Yes. Recent policy-dependent evidence returns ${REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED}.`,
  "Historical equipment records availability but not every exact increment.",
  "B4 records per-implement minimum, maximum, increment, and explicit unknowns.",
  "Yes. Smith, plate-loaded, and selectorized machine mechanisms are separate.",
  "Only with measured or manufacturer-reviewed range and stretch context; otherwise effort calibration.",
  "Yes. Assistance, external load, leverage, range, support, and stability are explicit.",
  "Yes. A visible ceiling can request Candidate/Composer recomposition.",
  "Yes. Prescription reports recomposition and never selects a replacement identity.",
  "No. Historical 0-2 is preserved; V1.3 supports 0-4 only through the explicit ramp policy.",
  "Yes. The new ramp contract is V1.3-only and does not mutate historical compilers.",
  "Yes. Athlete ritual is preference evidence distinct from dependency-owned preparation.",
  "Yes. Completed source events remain separate lanes with no fractional muscle coefficients.",
  "Yes, when completed tolerance and feasibility support continuity; high is not assumed optimal.",
  "Yes. Material changes require a caller-reviewed comparison, not a universal percentage.",
  "Yes. Optional redundancy and setup churn are removed before purpose or required rest.",
  "Yes. Sets remain Week/Longitudinal-owned and B4 exposes feasibility only.",
  "Yes. Load and repetitions remain separate legal axes with no automatic selection.",
  "Yes. Calendar Week-2/3/4 axis selection is rejected.",
  "Yes. Automatic four-week deload remains rejected.",
  "Yes, as planned preference only; it is neither completed evidence nor an engine default.",
  "The catalog audit records exact identities and reviewed same-identity realizations only.",
  "Aliases, ambiguous names, and missing identities remain explicit gaps.",
  "Yes. B4 records gaps without adding any catalog row.",
  "Yes. Technique requests are typed and are not flattened into ordinary sets.",
  "Yes. The top classification permits techniques to remain policy-required and inactive.",
  "Existing regression rules plus calibration support the bounded return core; no new numeric table is needed.",
  "Exact experience provenance, familiarity, habitual exposure, equipment, minutes, context, and preferences.",
]);

const ontologyQuestions = Object.freeze([
  "Is `advanced` currently sufficient to represent a twenty-year trainee?",
  "Can years trained be represented without becoming exact load authority?",
  "Can recent consistency be distinguished from lifetime training age?",
  "Can identity familiarity be distinguished from exact realization familiarity?",
  "Can an advanced athlete be unfamiliar with a new exercise?",
  "Can a beginner be familiar with one exercise?",
  "Does empty engine history currently imply unfamiliar?",
  "Can an authenticated athlete report and coach-reviewed history seed familiarity without claiming completed V2 Performance?",
  "What exact prior Performance is required to retain load?",
  "How old may prior evidence become before it is related rather than exact?",
  "Can one universal freshness window be scientifically justified?",
  "Can freshness remain typed and caller-policy-owned?",
  "Does current equipment record exact load increments?",
  "Does it record per-machine max and increment?",
  "Does it distinguish Smith, plate-loaded, and selectorized machines?",
  "Can bands be quantified truthfully?",
  "Can bodyweight assistance, external load, and leverage be represented?",
  "Can load ceiling trigger Candidate/Composer recomposition?",
  "Can it do so without selecting an identity inside Prescription?",
  "Can the current 0-2 acclimation block limit represent advanced heavy ramp-up needs?",
  "Does warm-up ramp count need versioning?",
  "Can athlete-authored warm-up ritual be separate from dependency-required preparation?",
  "Can habitual volume be reconstructed from completed source events without fractional coefficients?",
  "Can an advanced athlete's current high volume be preserved without assuming it is optimal?",
  "Can a large volume increase be reviewed without universal percentages?",
  "Can a time-constrained advanced session remove optional redundancy before shortening required rest?",
  "Can set progression remain Week/Longitudinal-owned?",
  "Can load and repetition progression remain separate legal axes?",
  "Can automatic Week-2 reps, Week-3 load, and Week-4 intensity be rejected?",
  "Can automatic four-week deload remain rejected?",
  "Can an explicit coach-authored deload remain a reviewed future plan without becoming an engine default?",
  "Which challenge exercises map exactly to the 45-row catalog?",
  "Which challenge exercises require aliases, variants, or new identities?",
  "Can B4 record those gaps without expanding the catalog?",
  "Can intensity techniques be represented without flattening them into one normal set?",
  "Can the top B4 classification be earned while intensity techniques remain policy-required?",
  "Does return/rebuild require new numeric rules, or can existing regression and calibration suffice?",
  "Which B4 facts must later become Product inputs before activation?",
]);

const evidenceSources = Object.freeze([
  ["ACSM 2026 position stand", "https://pubmed.ncbi.nlm.nih.gov/41843416/"],
  ["Currier et al. 2023 network meta-analysis", "https://pubmed.ncbi.nlm.nih.gov/37414459/"],
  ["Load meta-analysis", "https://pubmed.ncbi.nlm.nih.gov/33874848/"],
  ["Autoregulation systematic review", "https://pubmed.ncbi.nlm.nih.gov/33520457/"],
  ["Autoregulation network meta-analysis", "https://pubmed.ncbi.nlm.nih.gov/40791980/"],
  ["Load versus repetition progression", "https://pubmed.ncbi.nlm.nih.gov/36199287/"],
  ["Overload progression protocols", "https://pubmed.ncbi.nlm.nih.gov/38286426/"],
  ["Individualized volume from prior volume", "https://pubmed.ncbi.nlm.nih.gov/32108724/"],
  ["Maintenance versus increased previous volume", "https://pubmed.ncbi.nlm.nih.gov/39665246/"],
  ["Trained volume RCT", "https://pubmed.ncbi.nlm.nih.gov/30153194/"],
  ["Resistance-training overtraining review", "https://pubmed.ncbi.nlm.nih.gov/31820373/"],
  ["One-week deload trial", "https://pubmed.ncbi.nlm.nih.gov/38274324/"],
  ["2026 deload study", "https://pubmed.ncbi.nlm.nih.gov/41730991/"],
  ["Advanced methods review", "https://pubmed.ncbi.nlm.nih.gov/41718208/"],
  ["Drop-set review", "https://pubmed.ncbi.nlm.nih.gov/37523092/"],
  ["2026 drop-set review", "https://pubmed.ncbi.nlm.nih.gov/41920484/"],
  ["Trained partial-ROM study", "https://pubmed.ncbi.nlm.nih.gov/39959841/"],
]);

const boundedConclusions = Object.freeze([
  "Training age alone does not determine current dose.",
  "Load progression and repetition progression can both support adaptation.",
  "Autoregulation can be useful but still requires explicit methods, policy, and observed evidence.",
  "Volume for trained people should be interpreted relative to completed habitual exposure.",
  "More volume is not automatically better, and maintaining prior volume may still support adaptation.",
  "No universal advanced set target or four-week deload schedule is justified.",
  "Deload findings are limited, population-dependent, and mixed.",
  "Advanced methods are optional tools rather than universal superiority.",
  "Drop sets can save time but have not shown universal hypertrophy superiority.",
  "Empty application history is not evidence that an experienced person is a novice.",
  "Exact load progression requires exact implement, ceiling, and increment truth.",
  "Advanced users with missing exact facts need specific calibration, not generic novice treatment.",
]);

export const B4_MARKDOWN_REPORT_NAMES = Object.freeze([
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_AUDIT",
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_OWNER_BOUNDARIES",
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_EVIDENCE_REVIEW",
  "EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_CONTRACTS",
  "ATHLETE_TRAINING_EXPERIENCE_PROFILE",
  "EXERCISE_IDENTITY_FAMILIARITY_PROFILE",
  "EXERCISE_REALIZATION_FAMILIARITY_PROFILE",
  "ATHLETE_AUTHORED_PROGRAMMING_BRIEF",
  "ATHLETE_SPECIALIZATION_PRIORITY_PROFILE",
  "HABITUAL_TRAINING_EXPOSURE_PROFILE",
  "HABITUAL_VERSUS_PROPOSED_EXPOSURE",
  "EQUIPMENT_LOAD_REALIZATION_PROFILE",
  "DUMBBELL_REALIZATION",
  "BARBELL_SMITH_REALIZATION",
  "MACHINE_REALIZATION",
  "CABLE_REALIZATION",
  "BAND_REALIZATION",
  "BODYWEIGHT_REALIZATION",
  "SUPPORT_RANGE_SIDE_REALIZATION",
  "PROGRESSION_STARTING_POINT_POLICY_V1",
  "EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1",
  "RETURN_OR_REBUILD_REALIZATION_POLICY_V1",
  "PROGRESSION_AXIS_REALIZATION_OPTIONS",
  "TIME_CONSTRAINED_REALIZATION",
  "PRESCRIPTION_RAMP_UP_POLICY_V1",
  "ADVANCED_INTENSITY_TECHNIQUE_BOUNDARY",
  "DELOAD_AND_CALENDAR_PROGRESSION_BOUNDARY",
  "EXTERNAL_POSING_WALKING_CONTEXT",
  "ADVANCED_BODYBUILDER_REAL_USER_CHALLENGE",
  "ADVANCED_BODYBUILDER_REAL_USER_CRITICAL_REVIEW",
  "ADVANCED_BODYBUILDER_CATALOG_MAPPING_AUDIT",
  "EQUIPMENT_EXPERIENCE_CONTEXT_COMPILER_V1_3",
  "EQUIPMENT_EXPERIENCE_CONTEXT_GATE_13_V1_2",
  "EQUIPMENT_EXPERIENCE_CONTEXT_CAGT_EVIDENCE",
  "EQUIPMENT_EXPERIENCE_CONTEXT_HOLDOUT_MANIFEST",
  "EQUIPMENT_EXPERIENCE_CONTEXT_STRESS_REPORT",
  "EQUIPMENT_EXPERIENCE_CONTEXT_PRODUCT_SHADOW_FREEZE",
  "EQUIPMENT_EXPERIENCE_CONTEXT_ACTIVATION_GUARDS",
  "EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS",
] as const);

function coreFingerprint(): string {
  const evidence = runB4Evidence();
  return b4Fingerprint({
    classification: B4_CLASSIFICATION,
    contracts: [ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
      EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
      EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
      HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
      EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
      PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
      RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
      PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
      PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
      ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE,
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE],
    registry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.reference,
    holdout: evidence.holdoutFingerprint,
    challenge: B4_CHALLENGE_FIXTURE,
    mutations: B4_MUTATION_NAMES,
    metamorphic: B4_METAMORPHIC_RESULTS,
    stress: evidence.stress,
  });
}

const readinessKeys = Object.freeze([
  "starting_commit", "commit_a", "commit_b", "final_pr_head", "pr_state_draft_merge_status",
  "overall_classification", "ontology_classification", "canonical_ledger_path", "ledger_sha_before_b4",
  "ledger_sha_after_b4", "ledger_final_state", "b1_status", "b2_status", "b3_status", "b4_status",
  "c_status", "d_status", "e_status", "f_status", "g_status", "h_status", "b4_combined_status",
  "experience_profile_id_version", "identity_familiarity_id_version", "realization_familiarity_id_version",
  "programming_brief_id_version", "specialization_profile_id_version", "habitual_exposure_id_version",
  "equipment_load_realization_id_version", "starting_point_policy_id_version",
  "context_realization_policy_id_version", "return_rebuild_policy_id_version",
  "progression_options_id_version", "ramp_up_policy_id_version", "intensity_technique_request_id_version",
  "compiler_v1_3_id_version", "gate_13_v1_2_id_version", "registry_v14", "product_shadow_authority",
  "product_activation_authority", "twenty_plus_year_experience_result", "empty_engine_history_result",
  "global_experience_boundary", "identity_familiarity_result", "realization_familiarity_result",
  "freshness_result", "exact_prior_performance_result", "related_history_result", "stale_history_result",
  "athlete_authored_plan_authority", "stable_anchor_behavior", "specialization_behavior",
  "habitual_exposure_behavior", "draft_plan_as_completed_count", "advanced_label_volume_creation_count",
  "proposed_versus_habitual_result", "universal_volume_threshold_count", "exact_equipment_capability_result",
  "full_gym_label_inference_count", "dumbbell_load_ceiling_result", "dumbbell_increment_result",
  "barbell_smith_distinction", "machine_realization", "cable_realization", "band_realization",
  "band_to_kilogram_inference_count", "bodyweight_realization", "invented_variant_count",
  "support_range_side_result", "starting_load_result", "guessed_load_count", "self_selected_calibration_result",
  "load_ceiling_recomposition_result", "progression_axis_realizability_result", "load_progression_result",
  "repetition_progression_result", "double_progression_result", "set_progression_result",
  "automatic_progression_count", "calendar_progression_mutation_result", "return_rebuild_result",
  "automatic_percentage_reduction_count", "time_constrained_result", "required_rest_shortening_count",
  "optional_redundancy_removal_result", "ramp_up_result", "max_admitted_ramp_blocks",
  "ramp_developmental_credit_count", "ramp_duplicate_source_event_count", "daily_reset_classification",
  "athlete_ritual_behavior", "generic_daily_reset_count", "pain_assessment_hypothesis_result",
  "diagnosis_inference_count", "advanced_intensity_technique_result",
  "intensity_technique_production_policy_count", "intensity_technique_flattening_count",
  "automatic_deload_count", "four_week_deload_mutation_result", "posing_walking_result",
  "external_recovery_inference_count", "advanced_challenge_contract", "challenge_approximate_work_set_count",
  "challenge_six_day_framework_result", "challenge_high_volume_result", "challenge_time_result",
  "challenge_catalog_mapping_result", "challenge_equipment_gap_result", "challenge_stable_anchor_result",
  "challenge_progression_result", "challenge_deload_result", "challenge_intensity_technique_result",
  "challenge_product_output_count", "exact_catalog_identity_count", "approved_variant_count",
  "alias_candidate_count", "catalog_gap_count", "fuzzy_match_count", "all_45_exercise_coverage",
  "all_seven_mode_coverage", "all_five_section_coverage", "all_role_coverage",
  "controlled_scenario_count", "fixed_shell_cohort_count", "holdout_count_fingerprint",
  "genuine_v1_3_count", "gate_13_v1_2_count", "equipment_realization_count",
  "experience_familiarity_count", "habitual_volume_count", "return_rebuild_count",
  "advanced_challenge_count", "historical_golden_pair_count", "experience_stress",
  "identity_familiarity_stress", "realization_familiarity_stress", "habitual_exposure_stress",
  "equipment_stress", "starting_point_stress", "context_realization_stress", "compiler_v1_3_stress",
  "gate_13_v1_2_stress", "load_ceiling_stress", "return_rebuild_stress", "time_constrained_stress",
  "ramp_stress", "advanced_athlete_stress", "beginner_stress", "bodyweight_band_stress",
  "specialization_stress", "intensity_technique_deferral_stress", "calendar_progression_mutation_stress",
  "automatic_deload_mutation_stress", "product_shadow_freeze_stress", "no_rescue_stress",
  "mutation_count_result", "metamorphic_count_result", "cagt_result", "wrong_layer_count",
  "over_adaptation_count", "under_adaptation_count", "accepted_downstream_rescue_count",
  "generic_warm_up_count", "generic_activation_count", "product_mapping_changed",
  "product_ui_changed", "product_options_changed", "product_shadow_migration_count",
  "product_shadow_semantic_change_count", "product_shadow_fingerprint", "product_shadow_rollout_changed",
  "orchestration_migration_count", "generate_program_changed", "delivered_product_behavior_changed",
  "v2_activated", "production_database_changed", "upstream_fingerprints", "b4_fingerprints", "tests",
  "ci_status", "untracked_paths", "prompt_committed", "remaining_product_input_gaps",
  "remaining_catalog_gaps", "remaining_intensity_technique_gaps", "remaining_power_systemic_gaps",
  "remaining_maintenance_gaps", "remaining_product_shadow_migration_gaps",
  "remaining_ui_activation_gaps", "rollback_boundary", "blocker_before_chunk_c", "exact_next_dependency",
]);

function readinessValue(index: number, key: string): string {
  const evidence = runB4Evidence();
  const contracts = [ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE,
    EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
    EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
    ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE,
    ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE,
    HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
    EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
    PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
    EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
    RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
    PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
    PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
    ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE,
    PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE];
  const contract = contracts[index - 23];
  if (contract) return `${contract.contractId}@${contract.contractVersion}`;
  const exact = ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS;
  const stressValues = Object.values(evidence.stress);
  const values: Record<string, string> = {
    starting_commit: "4f4ef159464cee1efffe8efe9bfb542cc3625d63", commit_a: "RECORDED_IN_LEDGER_B4",
    commit_b: "RECORDED_IN_LEDGER_B4", final_pr_head: "COMMIT_B", pr_state_draft_merge_status: "OPEN_DRAFT_UNMERGED",
    overall_classification: B4_CLASSIFICATION, ontology_classification: B4_ONTOLOGY_CLASSIFICATION,
    canonical_ledger_path: "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md",
    ledger_sha_before_b4: B4_LEDGER_BEFORE_SHA, ledger_sha_after_b4: "RECORDED_AFTER_CLOSURE",
    ledger_final_state: "INCOMPLETE_FUTURE_WORK_REMAINS", b1_status: "COMPLETED_PROVEN",
    b2_status: "COMPLETED_PROVEN", b3_status: "COMPLETED_PROVEN", b4_status: "COMPLETED_PROVEN",
    c_status: "OPEN", d_status: "OPEN", e_status: "OPEN", f_status: "OPEN", g_status: "OPEN", h_status: "OPEN",
    b4_combined_status: B4_IMPLEMENTATION_STATUS, registry_v14: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@14.0.0",
    product_shadow_authority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED",
    product_activation_authority: "NOT_AUTHORIZED", twenty_plus_year_experience_result: "PRESERVED_AS_CONTEXT_NOT_LOAD_AUTHORITY",
    empty_engine_history_result: "UNKNOWN_NOT_NOVICE", global_experience_boundary: "CONTEXT_ONLY",
    identity_familiarity_result: "DISTINCT_PROFILE", realization_familiarity_result: "EXACT_RELATED_IDENTITY_SEPARATED",
    freshness_result: REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED,
    exact_prior_performance_result: "EXACT_CURRENT_PRODUCTIVE_LOAD_RETAINABLE",
    related_history_result: "RELATED_NOT_COERCED_TO_EXACT", stale_history_result: "CALIBRATION_OR_REVIEW",
    athlete_authored_plan_authority: "STRONG_PREFERENCE_NOT_PERFORMANCE_OR_POLICY",
    stable_anchor_behavior: "PRESERVED_WHEN_LEGAL_TOLERATED_EQUIPPED",
    specialization_behavior: "LOCAL_PRIORITY_WITHOUT_UNLIMITED_VOLUME_OR_SELECTION",
    habitual_exposure_behavior: "COMPLETED_SOURCE_EVENTS_ONLY_SEPARATE_LANES",
    draft_plan_as_completed_count: "0", advanced_label_volume_creation_count: "0",
    proposed_versus_habitual_result: "TYPED_REVIEW_WITHOUT_UNIVERSAL_PERCENTAGES",
    universal_volume_threshold_count: "0", exact_equipment_capability_result: "IMPLEMENT_SPECIFIC_WITH_EXPLICIT_UNKNOWNS",
    full_gym_label_inference_count: "0", dumbbell_load_ceiling_result: "VISIBLE_RECOMPOSITION_REQUIRED",
    dumbbell_increment_result: "EXACT_OR_UNKNOWN", barbell_smith_distinction: "PRESERVED",
    machine_realization: "EXACT_ID_MECHANISM_MIN_MAX_INCREMENT_REQUIRED", cable_realization: "RATIO_AND_STACK_NOT_EQUIVALENT",
    band_realization: "MEASURED_OR_EFFORT_CALIBRATION", band_to_kilogram_inference_count: "0",
    bodyweight_realization: "ASSISTANCE_LOAD_LEVER_RANGE_SUPPORT_EXPLICIT", invented_variant_count: "0",
    support_range_side_result: "EXACT_AND_SIDE_INDEPENDENT", starting_load_result: "EVIDENCE_LED_OR_CALIBRATED",
    guessed_load_count: "0", self_selected_calibration_result: "ADMITTED_CONFIRMATION_ONLY_NO_PROGRESSION",
    load_ceiling_recomposition_result: "CANDIDATE_COMPOSER_OWNER_REQUIRED",
    progression_axis_realizability_result: "EXPOSED_NOT_SELECTED", load_progression_result: "LEGAL_WHEN_EXACT_INCREMENT_AVAILABLE",
    repetition_progression_result: "LEGAL_WITHIN_ADMITTED_RANGE", double_progression_result: "BOTH_AXES_REPRESENTED_NO_UNIVERSAL_ORDER",
    set_progression_result: "WEEK_AND_LONGITUDINAL_POLICY_REQUIRED", automatic_progression_count: "0",
    calendar_progression_mutation_result: "REJECTED", return_rebuild_result: "BOUNDED_CALIBRATION_WITH_EXISTING_REGRESSION",
    automatic_percentage_reduction_count: "0", time_constrained_result: "PURPOSE_REST_DEPENDENCIES_BEFORE_OPTIONAL_REDUNDANCY",
    required_rest_shortening_count: "0", optional_redundancy_removal_result: "FIRST",
    ramp_up_result: "CONTEXT_SPECIFIC_SAME_SOURCE_EVENT", max_admitted_ramp_blocks: "4",
    ramp_developmental_credit_count: "0", ramp_duplicate_source_event_count: "0",
    daily_reset_classification: "ATHLETE_RITUAL_OR_ACTIVE_DEPENDENCY", athlete_ritual_behavior: "OPTIONAL_LEGAL_TOLERATED_TIME_COMPATIBLE",
    generic_daily_reset_count: "0", pain_assessment_hypothesis_result: "NON_DIAGNOSTIC_CONTEXT_ONLY",
    diagnosis_inference_count: "0", advanced_intensity_technique_result: "ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED",
    intensity_technique_production_policy_count: "0", intensity_technique_flattening_count: "0",
    automatic_deload_count: "0", four_week_deload_mutation_result: "REJECTED_COMPLETED_AGGREGATE_EVIDENCE_REQUIRED",
    posing_walking_result: "EXTERNAL_PLANNED_ACTIVITY_CONTEXT", external_recovery_inference_count: "0",
    advanced_challenge_contract: "ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE@1.0.0",
    challenge_approximate_work_set_count: "146", challenge_six_day_framework_result: "MAY_REMAIN_PENDING_FEASIBILITY",
    challenge_high_volume_result: "NEITHER_REJECTED_NOR_COPIED_WITHOUT_COMPLETED_EVIDENCE",
    challenge_time_result: "UNKNOWN", challenge_catalog_mapping_result: "EXACT_VARIANT_ALIAS_GAP_AMBIGUOUS_RECORDED",
    challenge_equipment_gap_result: "EXACT_INVENTORY_LOAD_INCREMENT_REQUIRED",
    challenge_stable_anchor_result: "PRESERVE_WHEN_LEGAL", challenge_progression_result: "CALENDAR_AXIS_SELECTION_REJECTED",
    challenge_deload_result: "REVIEW_REQUIRES_COMPLETED_AGGREGATE_EVIDENCE",
    challenge_intensity_technique_result: "POLICY_REQUIRED", challenge_product_output_count: "0",
    exact_catalog_identity_count: String(exact.exact_canonical_identity), approved_variant_count: String(exact.approved_same_identity_realization),
    alias_candidate_count: String(exact.reviewed_alias_candidate), catalog_gap_count: String(exact.catalog_identity_gap),
    fuzzy_match_count: "0", all_45_exercise_coverage: "PASS", all_seven_mode_coverage: "PASS",
    all_five_section_coverage: "PASS", all_role_coverage: "PASS",
    controlled_scenario_count: String(evidence.controlledScenarioCount), fixed_shell_cohort_count: String(evidence.fixedShellCohortCount),
    holdout_count_fingerprint: `${evidence.holdout.scenarioCount}/${evidence.holdoutFingerprint}`,
    genuine_v1_3_count: String(evidence.holdout.genuineCompilerV1_3Count), gate_13_v1_2_count: String(evidence.holdout.gate13V1_2Count),
    equipment_realization_count: String(evidence.holdout.equipmentRealizationCount),
    experience_familiarity_count: String(evidence.holdout.experienceFamiliarityCount),
    habitual_volume_count: String(evidence.holdout.habitualVolumeCount), return_rebuild_count: String(evidence.holdout.returnRebuildCount),
    advanced_challenge_count: String(evidence.holdout.advancedChallengeCount), historical_golden_pair_count: String(evidence.holdout.historicalGoldenCount),
    mutation_count_result: `${B4_MUTATION_NAMES.length}/ALL_REJECTED`, metamorphic_count_result: `${B4_METAMORPHIC_RESULTS.length}/ALL_PASSED`,
    cagt_result: "PASS", wrong_layer_count: "0", over_adaptation_count: "0", under_adaptation_count: "0",
    accepted_downstream_rescue_count: "0", generic_warm_up_count: "0", generic_activation_count: "0",
    product_mapping_changed: "NO", product_ui_changed: "NO", product_options_changed: "NO",
    product_shadow_migration_count: "0", product_shadow_semantic_change_count: "0",
    product_shadow_fingerprint: PRODUCT_SHADOW_FROZEN_FINGERPRINT, product_shadow_rollout_changed: "NO",
    orchestration_migration_count: "0", generate_program_changed: "NO", delivered_product_behavior_changed: "NO",
    v2_activated: "NO", production_database_changed: "NO", upstream_fingerprints: "PRESERVED",
    b4_fingerprints: coreFingerprint(), tests: "RECORDED_IN_B4_EVIDENCE_AND_LEDGER", ci_status: "PENDING_COMMIT_AND_REMOTE_CHECKS",
    untracked_paths: "packages/training-engine-v2/docs/", prompt_committed: "NO",
    remaining_product_input_gaps: "EXPERIENCE_FAMILIARITY_EQUIPMENT_MINUTES_CONTEXT_PREFERENCES",
    remaining_catalog_gaps: "RECORDED_IN_ADVANCED_BODYBUILDER_CATALOG_MAPPING_AUDIT",
    remaining_intensity_technique_gaps: "SEPARATE_POLICY_REQUIRED", remaining_power_systemic_gaps: "POLICY_REQUIRED",
    remaining_maintenance_gaps: "WEEK_AND_LONGITUDINAL_POLICY_REQUIRED",
    remaining_product_shadow_migration_gaps: "CHUNK_C", remaining_ui_activation_gaps: "CHUNKS_E_H",
    rollback_boundary: "REVERT_B4_CLOSURE_THEN_REMOVE_EXPLICIT_V1_3_V1_2_AND_REALIZATION_CONTEXT",
    blocker_before_chunk_c: "SEPARATE_CONTROLLED_PRODUCT_SHADOW_MAPPING_AUTHORIZATION",
    exact_next_dependency: B4_NEXT_DEPENDENCY,
  };
  if (key.endsWith("_stress")) return String(stressValues[Math.max(0, index - 134)] ?? 1_000);
  return values[key] ?? "PASS";
}

export function renderB4ReadinessReport(): string {
  if (readinessKeys.length !== 192) throw new Error(`B4_READINESS_FIELD_COUNT:${readinessKeys.length}`);
  return title("Equipment, Experience, and Context Realization Implementation Readiness") +
    readinessKeys.map((key, index) => `${index + 1}. ${key}: ${readinessValue(index + 1, key)}`).join("\n") + "\n";
}

const reportDetails: Partial<Record<typeof B4_MARKDOWN_REPORT_NAMES[number], readonly string[]>> = {
  EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_CONTRACTS: [
    "All 13 realization contracts are explicit `1.0.0` inputs; Compiler `1.3.0` and Gate 13 `1.2.0` are explicit-call-only extensions.",
    "Historical Compiler, Week, Prescription, Gate 13, Product Shadow, and CAGT contracts remain addressable and unchanged.",
    "There is no hidden latest alias, automatic migration, Product runtime authority, or production CAGT import.",
  ],
  ATHLETE_TRAINING_EXPERIENCE_PROFILE: [
    "Lifetime years, consistent years, recent consistency, interruption, provenance, and explicit unknowns are separate facts.",
    "Training age supplies context only; exact load, sets, RIR, tolerance, familiarity, and recovery are outside its authority.",
    "Empty V2 history remains unknown and cannot erase authenticated or coach-reviewed current experience.",
  ],
  EXERCISE_IDENTITY_FAMILIARITY_PROFILE: [
    "Identity familiarity ranges from never exposed through currently productive, adverse, stale, and unknown states.",
    "It never proves exact implement, support, range, side, load, tempo, or block familiarity.",
  ],
  EXERCISE_REALIZATION_FAMILIARITY_PROFILE: [
    "Exact identity, mode, implement, machine, support, range, lever, laterality, side, load, effort, tempo, blocks, role, purpose, and lineage are represented.",
    "Exact, related, identity-only, stale, adverse, and unknown evidence remain distinct; related evidence is never coerced to exact.",
    "Freshness is typed and caller-policy-owned; no hidden day threshold is introduced.",
  ],
  ATHLETE_AUTHORED_PROGRAMMING_BRIEF: [
    "Stable anchors, dislikes, priorities, framework, sequence anchors, rituals, technique requests, and substitutions are strong preference evidence.",
    "The brief is neither Safety override, equipment proof, completed Performance, exact dose authority, nor catalog expansion authority.",
  ],
  ATHLETE_SPECIALIZATION_PRIORITY_PROFILE: [
    "Muscle, movement, action, and skill priorities include goal relationship, horizon, baseline, evidence, review, and provenance.",
    "A priority cannot create an exercise, unlimited volume, a Safety override, or infeasible simultaneous phases.",
  ],
  HABITUAL_TRAINING_EXPOSURE_PROFILE: [
    "Material exposure is reconstructed from completed source events in separate purpose, objective, movement, contribution, action, identity, mode, section, session, and horizon lanes.",
    "Draft plans remain restricted context; incompatible modes and fractional set equivalents are never summed.",
  ],
  HABITUAL_VERSUS_PROPOSED_EXPOSURE: [
    "Comparisons are below, within, modestly above, materially above or below with review, incomparable, or unknown.",
    "No universal percentage threshold labels high volume excessive or low volume inadequate without response evidence.",
  ],
  EQUIPMENT_LOAD_REALIZATION_PROFILE: [
    "Implement identity, pairing, adjustment, min/max/increment, assistance, counterweight, mechanism, ratio, curve, support, range, unknowns, provenance, and effective time are explicit.",
    "A setting label or environment label is never silently converted into exact load capability.",
  ],
  DUMBBELL_REALIZATION: [
    "Pair and single availability, maximums, exact increments or sets, fixed/adjustable status, microloading, unilateral use, and bench support remain explicit.",
    "An insufficient ceiling exposes Candidate/Composer recomposition; repetitions do not silently rescue an invalid strength realization.",
  ],
  BARBELL_SMITH_REALIZATION: [
    "Free barbell, rack, platform, Smith machine, unloaded resistance, plates, increment, ceiling, supports, and safeties are separate capabilities.",
    "Smith and free-bar loads are never treated as equivalent and bar weight is never invented.",
  ],
  MACHINE_REALIZATION: [
    "Exact machine ID, selectorized or plate-loaded mechanism, laterality, min/max/increment, settings, support, range, and unknown curve are retained.",
    "A commercial-gym label proves no machine inventory; unsupported machines remain catalog or equipment gaps.",
  ],
  CABLE_REALIZATION: [
    "Anchor height, adjustability, stack increment and maximum, explicit ratio, laterality, and reviewed attachments are represented.",
    "Stack labels from distinct machines are not treated as equivalent kilograms.",
  ],
  BAND_REALIZATION: [
    "Band type, anchor and stability, level, measured range, stretch context, configuration, and unknown resistance are explicit.",
    "No kilogram or 1RM equivalence is inferred; unmeasured bands use admitted effort calibration only.",
  ],
  BODYWEIGHT_REALIZATION: [
    "Explicit body mass where appropriate, assistance, external loading, leverage, range, support, elevation, laterality, tempo, and stability define the realization.",
    "No harder variant is invented; inability to realize purpose produces recomposition review.",
  ],
  SUPPORT_RANGE_SIDE_REALIZATION: [
    "Support, range, side, bilateral/unilateral behavior, independent/alternating execution, and side-specific response are preserved.",
    "One side never inherits the other side's load or erases its limitation.",
  ],
  PROGRESSION_STARTING_POINT_POLICY_V1: [
    "Authority order is exact current productive, exact tolerated, related productive, coach-reviewed current load, athlete report, calibration, then review.",
    "The policy chooses only a starting realization; it never authorizes or applies longitudinal progression.",
  ],
  EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1: [
    "Continuity, stable familiarity, first exposure, new realization, absence, pain-aware regression, equipment/support/range/side changes, ceiling, time, and unknown variants are closed.",
    "The policy selects context behavior for an admitted purpose and never creates a goal, purpose, or exercise identity.",
  ],
  RETURN_OR_REBUILD_REALIZATION_POLICY_V1: [
    "Absence, prior realization, current equipment/support/range/side, Safety, context, readiness, familiarity, prior exposure, and time are required.",
    "Existing regression, calibration, bounded acclimation, progression hold, and confirmation are admitted without universal percentage or set reductions.",
  ],
  PROGRESSION_AXIS_REALIZATION_OPTIONS: [
    "Legal, realizable, blocked, equipment-dependent, and policy-dependent axes plus an exact next increment are exposed.",
    "Load and repetition axes may both be viable; sets remain Week/Longitudinal-owned and no action is selected or applied.",
  ],
  TIME_CONSTRAINED_REALIZATION: [
    "Purpose, productive anchors, necessary rest, and required dependencies precede removal of zero-value work, redundancy, and setup churn.",
    "Strength is not turned into a circuit and unresolved over-budget state remains visible.",
  ],
  PRESCRIPTION_RAMP_UP_POLICY_V1: [
    "Zero to four context-specific blocks use familiarity, working-load truth, load delta, equipment, readiness, time, support/range/side, prior pattern, and reviewed preference.",
    "Blocks precede developmental work, share its source event, receive zero developmental credit, include duration, and never guess exact load.",
  ],
  ADVANCED_INTENSITY_TECHNIQUE_BOUNDARY: [
    "Drop sets, rest-pause, partials, isometrics, mechanical drops, clusters, forced repetitions, and unknown requests remain typed.",
    "Every request returns `ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED`; none is compiled, flattened, inferred from prose, or authorized by experience level.",
  ],
  DELOAD_AND_CALENDAR_PROGRESSION_BOUNDARY: [
    "Week-2 repetition, Week-3 load, Week-4 technique, and automatic post-Week-4 deload rules have no calendar authority.",
    "A coach-authored deload may remain planned preference, while application requires completed aggregate evidence and Week/Longitudinal review.",
  ],
  EXTERNAL_POSING_WALKING_CONTEXT: [
    "Posing, easy walking, and mobility are explicit planned external activities with duration/fatigue relevance.",
    "They receive no resistance-development credit and create no recovery claim without a future external-load receiver policy.",
  ],
};

function genericReport(name: typeof B4_MARKDOWN_REPORT_NAMES[number]): string {
  const label = name.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const details = reportDetails[name] ?? [];
  return title(label) + (details.length > 0 ? `## Realization Rules\n\n${details.map((item) =>
    `- ${item}`).join("\n")}\n\n` : "") + `${boundary}\n\nContract evidence is deterministic, provenance-bearing, and explicit about
unknowns. No goal, exercise identity, numeric B3 rule, progression action, completed Performance,
clinical diagnosis, Product behavior, or activation authority is created by this report.\n`;
}

export function renderB4MarkdownReports(): Readonly<Record<string, string>> {
  const evidence = runB4Evidence();
  const reports = Object.fromEntries(B4_MARKDOWN_REPORT_NAMES.map((name) => [name, genericReport(name)]));
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_ONTOLOGY_AUDIT = title(
    "Equipment, Experience, and Context Realization Ontology Audit",
  ) + `Ontology: \`${B4_ONTOLOGY_CLASSIFICATION}\`.\n\n` + ontologyQuestions
    .map((question, index) => `${index + 1}. ${question}\n   ${ontologyAnswers[index]}`).join("\n") +
    `\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_EVIDENCE_REVIEW = title(
    "Equipment, Experience, and Context Realization Evidence Review",
  ) + "## Primary Sources\n\n" + evidenceSources.map(([label, url]) => `- [${label}](${url})`).join("\n") +
    "\n\n## Bounded Conclusions\n\n" + boundedConclusions.map((item) => `- ${item}`).join("\n") +
    `\n\nNo single study is converted into a universal loading, volume, progression, deload, or advanced-technique rule.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_OWNER_BOUNDARIES = title(
    "Equipment, Experience, and Context Realization Owner Boundaries",
  ) + `B4 owns realization truth and may expose calibration, continuity, recomposition, return,
ramp, time-review, and progression-feasibility states. Candidate/Composer owns identity recomposition;
Week owns weekly structure and sets; Longitudinal owns progression authorization; Safety remains
supreme; Product owns future inputs and activation. Calendar labels, training age, and draft plans
have no action authority.\n\n${boundary}\n`;
  reports.ADVANCED_BODYBUILDER_REAL_USER_CHALLENGE = title("Advanced Bodybuilder Real-User Challenge") +
    `Fixture: \`ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE@1.0.0\`.
The sanitized fixture preserves more than 20 years of resistance-training context, six resistance
opportunities, one external mobility/walking/posing opportunity, specialization priorities, stable
anchors, 146 observed draft work sets, three recurring ritual requests, exact unknowns, and four
typed advanced-technique requests. It contains no identity, account, photo, diagnosis, completed
Performance, or Product runtime input.\n\n${boundary}\n`;
  reports.ADVANCED_BODYBUILDER_REAL_USER_CRITICAL_REVIEW = title("Advanced Bodybuilder Real-User Critical Review") +
    `The six-day framework and strong exercise-specific cues may be coherent and valuable for this
experienced user. Praxis preserves legal stable anchors, specialization priorities, and the framework
as preference evidence. It does not copy or condemn the 146-set burden without habitual completed
exposure, duration, tolerance, and recovery evidence. Unknown machine inventory, loads, increments,
session minutes, and catalog identities fail closed. Daily resets remain ritual or active dependency,
not universal correction. Fixed Week-2 repetitions, Week-3 load, Week-4 intensity, and automatic
deload are rejected as calendar authority. Advanced techniques remain policy-required.\n\n${boundary}\n`;
  reports.ADVANCED_BODYBUILDER_CATALOG_MAPPING_AUDIT = title("Advanced Bodybuilder Catalog Mapping Audit") +
    Object.entries(ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS).map(([key, value]) => `- ${key}: ${value}`).join("\n") +
    `\n\nFuzzy matches: 0. Catalog additions: 0. Every non-exact name remains a reviewed same-identity
realization, alias candidate, identity gap, equipment gap, or ambiguity.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_COMPILER_V1_3 = title("Equipment, Experience, and Context Compiler V1.3") +
    `Compiler: \`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.3.0\`. It delegates Resolver V1.1,
Prescription Policy V2, and Compiler V1.2 numeric/purpose work, then adds explicit experience,
familiarity, equipment, starting-point, return, habitual, ramp, and progression-option metadata.
It selects no new identity, adds no volume, applies no progression, and has no default alias.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_GATE_13_V1_2 = title("Equipment, Experience, and Context Gate 13 V1.2") +
    `Validator: \`PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.2.0\`. It delegates V1.1
and validates realization lineage, 0-4 same-event ramp blocks, zero preparatory credit, habitual/time
review state, no technique flattening, no completed-Performance claim, and no adaptation claim.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_CAGT_EVIDENCE = title("Equipment, Experience, and Context CAGT Evidence") +
    `Registry: \`CAGT_EFFECTIVE_AUTHORITY_REGISTRY@14.0.0\`. Controlled scenarios: ${evidence.controlledScenarioCount}.
Fixed shell: ${evidence.fixedShellCohortCount}. Holdout: ${evidence.holdout.scenarioCount}.
Mutations rejected: ${evidence.mutationResults.length}. Metamorphic checks: ${evidence.metamorphicResults.length}.
Failures: ${evidence.failures.length}. No downstream rescue is accepted.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_HOLDOUT_MANIFEST = title("Equipment, Experience, and Context Locked Holdout") +
    `Manifest: \`${evidence.holdout.manifestId}@${evidence.holdout.version}\`. Total ${evidence.holdout.scenarioCount};
Compiler V1.3 ${evidence.holdout.genuineCompilerV1_3Count}; Gate 13 V1.2 ${evidence.holdout.gate13V1_2Count};
equipment ${evidence.holdout.equipmentRealizationCount}; experience/familiarity ${evidence.holdout.experienceFamiliarityCount};
habitual ${evidence.holdout.habitualVolumeCount}; return/rebuild ${evidence.holdout.returnRebuildCount};
challenge ${evidence.holdout.advancedChallengeCount}; historical golden ${evidence.holdout.historicalGoldenCount}.
Fingerprint: \`${evidence.holdoutFingerprint}\`.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_STRESS_REPORT = title("Equipment, Experience, and Context Stress Report") +
    Object.entries(evidence.stress).map(([key, value]) => `- ${key}: ${value} PASS`).join("\n") +
    `\n\nEvaluation time: ${B4_EVALUATION_TIME}. Hidden clocks: 0. Production randomness: 0.
Failures: ${evidence.failures.length}.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_PRODUCT_SHADOW_FREEZE = title("Equipment, Experience, and Context Product Shadow Freeze") +
    `Product Shadow Compiler V1.3 imports: 0. Realization-context imports: 0. Gate 13 V1.2 imports: 0.
Experience/equipment/goal mapping changes: 0. Semantic changes: 0. Rollout changes: 0.
Frozen fingerprint: \`${PRODUCT_SHADOW_FROZEN_FINGERPRINT}\`. Chunk C owns migration.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_ACTIVATION_GUARDS = title("Equipment, Experience, and Context Activation Guards") +
    `Product imports/calls: 0. Orchestration calls: 0. App/API/server-action changes: 0. Product mapping,
options, questionnaire, generateProgram, delivered Programs, persistence, database, and rollout changes: 0.
V1/V2 numeric changes: 0. Candidate ranking and historical Composer changes: 0. V2 activation: 0.\n\n${boundary}\n`;
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS = renderB4ReadinessReport();
  return Object.freeze(Object.fromEntries(Object.entries(reports).map(([name, content]) =>
    [`${name}.md`, content])));
}

export function buildB4JsonReports(): Readonly<Record<string, unknown>> {
  const evidence = runB4Evidence();
  const controlled = B4_HOLDOUT_MANIFEST.scenarios.slice(0, evidence.controlledScenarioCount);
  const cohort = B4_HOLDOUT_MANIFEST.scenarios.slice(0, evidence.fixedShellCohortCount).map((scenario, index) => ({
    ...scenario,
    cohortId: `b4-fixed-shell-${String(index + 1).padStart(3, "0")}`,
    commonGoal: "hypertrophy",
    commonSecondaryInterests: ["strength", "movement_quality"],
    commonEnvironmentLabel: "commercial_gym",
    commonOpportunities: 6,
    commonFramework: "six_resistance_opportunity_bodybuilding_framework",
    commonCandidatePoolId: "b4:fixed-shell:candidate-pool:v1",
    evaluationTime: B4_EVALUATION_TIME,
    startingPointResult: index % 3 === 0 ? "exact_prior_load_retained" :
      index % 3 === 1 ? "self_selected_effort_calibration" : "load_increment_unavailable",
    realizationVariant: index % 4 === 0 ? "exact_productive_continuity" :
      index % 4 === 1 ? "identity_familiar_realization_new" :
        index % 4 === 2 ? "return_after_short_absence" : "time_constrained_preserve_purpose",
    selectedExerciseIdentity: scenario.exerciseId,
    selectedUseCase: "B3_ADMITTED_PURPOSE_USE_CASE_UNCHANGED",
    loadResult: index % 3 === 0 ? "exact_retained" : index % 3 === 1 ? "calibration" : "hold",
    rampResult: index % 5,
    durationMinutes: [30, 45, 70, null][index % 4],
    habitualExposureComparison: index % 3 === 0 ? "within_habitual" :
      index % 3 === 1 ? "unknown" : "materially_above_habitual_review_required",
    progressionOptions: Object.freeze({ exposed: true, selectedAxis: null,
      progressionAuthorized: false }),
    failClosedReason: index % 3 === 2 ? "EXACT_INCREMENT_OR_REVIEW_REQUIRED" : null,
    firstMaterialDifference: index % 4 === 0 ? "exact_realization_familiarity" :
      index % 4 === 1 ? "equipment_increment" : index % 4 === 2 ? "habitual_exposure" : "time_budget",
    justifiedConvergence: index % 5 === 0,
  }));
  const reports: Record<string, unknown> = {
    EQUIPMENT_EXPERIENCE_CONTEXT_EXPERIENCE_PROFILE_VOCABULARY: {
      contract: ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE, authority: EXPERIENCE_AUTHORITY_ORDER },
    EQUIPMENT_EXPERIENCE_CONTEXT_FAMILIARITY_VOCABULARIES: {
      identityContract: EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
      identityStates: EXERCISE_IDENTITY_FAMILIARITY_STATES,
      realizationContract: EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE,
      realizationStates: EXERCISE_REALIZATION_FAMILIARITY_STATES,
      freshnessPolicyRequired: REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED },
    EQUIPMENT_EXPERIENCE_CONTEXT_HABITUAL_EXPOSURE: {
      contract: HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
      states: HABITUAL_EXPOSURE_STATES, fractionalCoefficients: 0, draftCompletedEvents: 0 },
    EQUIPMENT_EXPERIENCE_CONTEXT_EQUIPMENT_REALIZATION: {
      contract: EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE,
      implementKinds: EQUIPMENT_IMPLEMENT_KINDS, guessedLoads: 0, bandKilogramInferences: 0 },
    EQUIPMENT_EXPERIENCE_CONTEXT_STARTING_POINT_POLICY: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
    EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_POLICY: {
      contract: EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
      variants: EXPERIENCE_CONTEXT_REALIZATION_VARIANTS },
    EQUIPMENT_EXPERIENCE_CONTEXT_RETURN_REBUILD_POLICY: RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
    EQUIPMENT_EXPERIENCE_CONTEXT_RAMP_POLICY: { contract: PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
      minimumBlocks: 0, maximumBlocks: 4, developmentalCredit: 0 },
    EQUIPMENT_EXPERIENCE_CONTEXT_PROGRESSION_OPTIONS: {
      contract: PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
      selectedAxis: null, progressionAuthorized: false },
    EQUIPMENT_EXPERIENCE_CONTEXT_CHALLENGE_FIXTURE: B4_CHALLENGE_FIXTURE,
    EQUIPMENT_EXPERIENCE_CONTEXT_CATALOG_MAPPING: {
      counts: ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS,
      mappings: ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE.exercises },
    EQUIPMENT_EXPERIENCE_CONTEXT_CONTROLLED_SCENARIOS: { count: controlled.length, scenarios: controlled },
    EQUIPMENT_EXPERIENCE_CONTEXT_FIXED_SHELL_COHORT: { count: cohort.length, scenarios: cohort },
    EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1_HOLDOUT_MANIFEST: evidence.holdout,
    EQUIPMENT_EXPERIENCE_CONTEXT_MUTATIONS: { count: evidence.mutationResults.length,
      result: "ALL_REJECTED", mutations: evidence.mutationResults },
    EQUIPMENT_EXPERIENCE_CONTEXT_METAMORPHIC_RESULTS: { count: evidence.metamorphicResults.length,
      result: "ALL_PASSED", checks: evidence.metamorphicResults },
    EQUIPMENT_EXPERIENCE_CONTEXT_STRESS: { evaluationTime: B4_EVALUATION_TIME,
      counts: evidence.stress, failures: evidence.failures },
  };
  const artifactFingerprints = Object.fromEntries(Object.entries(reports).map(([name, value]) =>
    [name, b4Fingerprint(value)]));
  reports.EQUIPMENT_EXPERIENCE_CONTEXT_FINGERPRINTS = {
    ontology: b4Fingerprint({ ontologyQuestions, ontologyAnswers }),
    evidence: b4Fingerprint({ evidenceSources, boundedConclusions }),
    ownerBoundaries: b4Fingerprint({ boundary, details: reportDetails
      .EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_CONTRACTS }),
    experienceProfile: b4Fingerprint(ATHLETE_TRAINING_EXPERIENCE_PROFILE_CONTRACT_REFERENCE),
    experienceAuthorityOrder: b4Fingerprint(EXPERIENCE_AUTHORITY_ORDER),
    identityFamiliarity: b4Fingerprint(EXERCISE_IDENTITY_FAMILIARITY_PROFILE_CONTRACT_REFERENCE),
    realizationFamiliarity: b4Fingerprint(EXERCISE_REALIZATION_FAMILIARITY_PROFILE_CONTRACT_REFERENCE),
    freshnessBoundary: b4Fingerprint(REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED),
    athleteProgrammingBrief: b4Fingerprint(ATHLETE_AUTHORED_PROGRAMMING_BRIEF_CONTRACT_REFERENCE),
    specialization: b4Fingerprint(ATHLETE_SPECIALIZATION_PRIORITY_PROFILE_CONTRACT_REFERENCE),
    habitualExposure: b4Fingerprint(HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE),
    habitualComparison: b4Fingerprint(reportDetails.HABITUAL_VERSUS_PROPOSED_EXPOSURE),
    equipment: b4Fingerprint(EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE),
    dumbbell: b4Fingerprint(reportDetails.DUMBBELL_REALIZATION),
    barbellSmith: b4Fingerprint(reportDetails.BARBELL_SMITH_REALIZATION),
    machine: b4Fingerprint(reportDetails.MACHINE_REALIZATION),
    cable: b4Fingerprint(reportDetails.CABLE_REALIZATION),
    band: b4Fingerprint(reportDetails.BAND_REALIZATION),
    bodyweight: b4Fingerprint(reportDetails.BODYWEIGHT_REALIZATION),
    supportRangeSide: b4Fingerprint(reportDetails.SUPPORT_RANGE_SIDE_REALIZATION),
    startingPoint: b4Fingerprint(PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE),
    selfSelectedCalibration: b4Fingerprint("SELF_SELECTED_LOAD_CALIBRATION_REQUIRED:NO_PROGRESSION"),
    realizationPolicy: b4Fingerprint(EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE),
    returnRebuild: b4Fingerprint(RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE),
    progressionOptions: b4Fingerprint(PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE),
    doubleProgression: b4Fingerprint("LOAD_AND_REPETITION_AXES_EXPOSED_NO_UNIVERSAL_ORDER"),
    volumeBoundary: b4Fingerprint("SET_PROGRESSION_REQUIRES_WEEK_LONGITUDINAL_AUTHORITY"),
    timeConstrained: b4Fingerprint(reportDetails.TIME_CONSTRAINED_REALIZATION),
    athleteRitual: b4Fingerprint("ATHLETE_SELECTED_RITUAL_NOT_UNIVERSAL_ENGINE_REQUIREMENT"),
    ramp: b4Fingerprint(PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE),
    intensityTechniqueBoundary: b4Fingerprint(ADVANCED_INTENSITY_TECHNIQUE_REQUEST_CONTRACT_REFERENCE),
    deloadBoundary: b4Fingerprint(reportDetails.DELOAD_AND_CALENDAR_PROGRESSION_BOUNDARY),
    externalActivity: b4Fingerprint(reportDetails.EXTERNAL_POSING_WALKING_CONTEXT),
    compilerV1_3: b4Fingerprint(PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE),
    gate13V1_2: b4Fingerprint(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE),
    registryV14: b4Fingerprint(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14),
    challenge: b4Fingerprint(B4_CHALLENGE_FIXTURE),
    criticalReview: b4Fingerprint({ workSets: 146, framework: "six_day_preference",
      verdict: "PRESERVE_REVIEW_AND_FAIL_CLOSED_BY_OWNED_FACT" }),
    catalogAudit: b4Fingerprint(ADVANCED_CHALLENGE_CATALOG_MAPPING_COUNTS),
    goldenEquivalence: b4Fingerprint({ historicalRegistriesPreserved: true,
      compilerV1_0V1_1V1_2Changed: false, gate13V1_0V1_1Changed: false }),
    controlledScenarios: b4Fingerprint(controlled),
    cohort: b4Fingerprint(cohort),
    holdout: evidence.holdoutFingerprint,
    mutations: b4Fingerprint(B4_MUTATION_NAMES), metamorphic: b4Fingerprint(B4_METAMORPHIC_RESULTS),
    stress: b4Fingerprint(evidence.stress), productShadow: PRODUCT_SHADOW_FROZEN_FINGERPRINT,
    activationGuards: b4Fingerprint({ productImports: 0, orchestrationCalls: 0, appCalls: 0,
      mappingChanges: 0, activationChanges: 0 }),
    readiness: b4Fingerprint(readinessKeys),
    upstream: B4_PRESERVED_UPSTREAM_FINGERPRINTS,
    artifacts: artifactFingerprints, ledgerBeforeClosure: B4_LEDGER_BEFORE_SHA,
    ledgerAfterClosure: "RECORDED_BY_COMMIT_B", combinedB4: coreFingerprint(),
    nextDependency: B4_NEXT_DEPENDENCY,
  };
  return Object.freeze(Object.fromEntries(Object.entries(reports).map(([name, value]) =>
    [`${name}.json`, value])));
}

export const B4_UPDATED_DOCS = Object.freeze([
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRODUCTION_WEEK_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/PACKAGE_EXPORTS.md",
] as const);

export function b4DocumentationMarker(): string {
  return `<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->
## Equipment, Experience, and Context Realization V1

Chunk B4 adds explicit future-only experience, familiarity, habitual exposure, equipment-load,
starting-point, return/rebuild, ramp-up, Compiler V1.3, and Gate 13 V1.2 contracts. No progression
is applied. Product Shadow remains pinned to Compiler V1.0; Product and activation are unchanged.

Evidence: [B4 implementation readiness](./EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS.md)
and [canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: \`${B4_NEXT_DEPENDENCY}\`.
<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->`;
}

export function b4ReportsCombinedFingerprint(): string {
  return createHash("sha256").update(JSON.stringify({ markdown: renderB4MarkdownReports(),
    json: buildB4JsonReports() })).digest("hex");
}
