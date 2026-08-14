import { REFERENCE_EXERCISES } from "../../src";
import {
  FINAL_SESSION_PAIRING_DISPOSITION,
  FINAL_SESSION_SECTION_PRECEDENCE,
  FINAL_SESSION_SEQUENCING_EXECUTION_MODE,
  FINAL_SESSION_SEQUENCING_PHILOSOPHY,
  SESSION_SEQUENCING_POLICY_V1_REFERENCE,
} from "../../src/sequencing/designContracts";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "./prescriptionPolicyV1OwnerAdmission";
import { digest } from "./signatures";

export const SESSION_SEQUENCING_POLICY_V1_EVALUATION_TIME =
  "2026-08-13T22:15:00-04:00" as const;
export const SESSION_SEQUENCING_POLICY_V1_HOLDOUT_SEED = 0x0806710;
export const SESSION_SEQUENCING_POLICY_V1_STRESS_SEED = 0x5100cafe;
export const SESSION_SEQUENCING_GATE_10_AUTHORITY =
  "DESIGN_EVIDENCE_PLUS_HANDOFF_AUTHORITY" as const;
export const SESSION_SEQUENCING_GATE_11_AUTHORITY = "FOUNDATION_ONLY" as const;

export const SESSION_SEQUENCING_POLICY_V1 = Object.freeze({
  ...SESSION_SEQUENCING_POLICY_V1_REFERENCE,
  reviewedAt: SESSION_SEQUENCING_POLICY_V1_EVALUATION_TIME,
  reviewerId: "PROJECT_OWNER",
  philosophy: FINAL_SESSION_SEQUENCING_PHILOSOPHY,
  sectionPrecedence: FINAL_SESSION_SECTION_PRECEDENCE,
  executionMode: FINAL_SESSION_SEQUENCING_EXECUTION_MODE,
  pairingDisposition: FINAL_SESSION_PAIRING_DISPOSITION,
  automaticSelectionPermitted: false,
  productionActivationAuthorized: false,
} as const);

export const SESSION_SEQUENCING_POLICY_CANDIDATES = Object.freeze([
  { id: "SEQUENCE_C0_CANONICAL_SERIALIZATION_CONTROL", blindedLabel: "POLICY_A", semantics: "canonical" },
  { id: "SEQUENCE_V1_CAUSAL_SEQUENTIAL", blindedLabel: "POLICY_B", semantics: "causal_sequential" },
  { id: "SEQUENCE_S1_SETUP_FIRST_GREEDY_STRESS", blindedLabel: "POLICY_C", semantics: "setup_first" },
  { id: "SEQUENCE_F1_FATIGUE_ONLY_STRESS", blindedLabel: "POLICY_D", semantics: "fatigue_only" },
  { id: "SEQUENCE_R1_CANDIDATE_RANK_STRESS", blindedLabel: "POLICY_E", semantics: "candidate_rank" },
  { id: "SEQUENCE_P1_PAIRING_COMPRESSION_STRESS", blindedLabel: "POLICY_F", semantics: "pairing" },
  { id: "SEQUENCE_X0_NO_POLICY", blindedLabel: "POLICY_G", semantics: "none" },
] as const);

export const SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER = Object.freeze([
  "hard_input_validity",
  "training_safety",
  "assignment_preservation",
  "dependency_satisfaction",
  "section_precedence",
  "prescription_block_atomicity",
  "dominant_purpose_preservation",
  "required_need_priority",
  "planner_priority_vector",
  "supporting_work_context",
  "fatigue_interference",
  "accessory_priority",
  "cooldown_last",
  "setup_efficiency",
  "unknown_transition_burden",
  "canonical_identity_tie_break",
] as const);

export const SESSION_SEQUENCING_HARD_INVARIANTS = Object.freeze([
  "PRESERVE_EVERY_ASSIGNMENT_EXACTLY_ONCE",
  "NO_ASSIGNMENT_ADDITION_REMOVAL_DUPLICATION_OR_SUBSTITUTION",
  "PRESERVE_SECTION_AND_ROLE",
  "PRESERVE_SOURCE_EVENT_PRESCRIPTION_AND_FINAL_REVISION",
  "PRESERVE_DOSE_BLOCK_CONTENT_AND_ORDER",
  "PRESERVE_WITHIN_EXERCISE_REST",
  "PRESERVE_COMPOSER_DEPENDENCIES",
  "PRESERVE_FIXED_SECTION_PRECEDENCE",
  "REQUIRE_ACYCLIC_ORDERING_GRAPH",
  "TRAINING_SAFETY_BLOCK_PRODUCES_NO_EXECUTABLE_SEQUENCE",
  "UNRESOLVED_REQUIREMENTS_REMAIN_VISIBLE",
  "DETERMINISTIC_FOR_IDENTICAL_MEANINGFUL_FACTS",
  "REJECT_GROUPED_OR_INTERLEAVED_EXECUTION",
] as const);

export const SESSION_SEQUENCING_CAGT_PAIR_IDS = Object.freeze([
  "identical_meaningful_facts",
  "athlete_label_only",
  "prose_only",
  "candidate_rank_after_selection",
  "irrelevant_pain",
  "required_preparation_dependency",
  "shared_preparation_assignment",
  "required_activation_dependency",
  "dominant_main_changes",
  "strength_hypertrophy_same_skeleton",
  "capacity_main",
  "required_pull_accessory_carry",
  "required_hinge_optional_trunk",
  "required_press_direct_triceps",
  "setup_change_only",
  "equipment_realization_change",
  "unresolved_prescription_requirement",
  "blocked_training_safety",
  "ordering_dependency_cycle",
  "missing_prescription_plan",
  "extra_prescription_plan",
  "source_event_mismatch",
  "block_reordering",
  "block_interleaving",
  "pairing_without_policy",
  "unknown_transition_duration",
  "known_lower_bound_over_available",
  "unknown_upper_bound_not_fit",
  "different_users_same_sequence",
  "random_order_identical_facts",
  "setup_first_displaces_required_main",
  "candidate_rank_changes_order",
] as const);

export const SESSION_SEQUENCING_METAMORPHIC_INVARIANTS = Object.freeze([
  "candidate_rank_changes_after_assignment_selection",
  "catalog_ordering",
  "assignment_input_ordering",
  "prescription_plan_input_ordering",
  "policy_rule_order",
  "nonsemantic_provenance_array_order",
  "label_changes",
  "display_name_changes",
  "prose_changes",
  "evidence_ref_order",
  "nonsemantic_identity_changes_with_identical_setup",
  "irrelevant_pain",
  "irrelevant_assessment",
  "irrelevant_history",
] as const);

export const SESSION_SEQUENCING_MATERIAL_RESPONSES = Object.freeze([
  "hard_dependency",
  "section",
  "role",
  "dominant_need_priority",
  "planner_priority",
  "capacity_main_ownership",
  "required_vs_optional_accessory",
  "explicit_setup_late_tie",
  "explicit_fatigue_interference",
  "explicit_transition_duration",
  "available_minutes_lower_bound_conflict",
] as const);

export const SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES = Object.freeze([
  "candidate_identity_or_label_affects_order",
  "prose_affects_order",
  "random_output",
  "hidden_clock",
  "assignment_addition",
  "assignment_removal",
  "duplicate_assignment",
  "exercise_substitution",
  "section_change",
  "role_change",
  "source_event_rewrite",
  "prescription_id_rewrite",
  "revision_rewrite",
  "block_reorder",
  "block_interleaving",
  "dependency_violation",
  "section_precedence_violation",
  "training_safety_bypass",
  "required_preparation_after_dependent",
  "required_activation_after_dependent",
  "policy_created_warmup",
  "policy_created_activation",
  "main_purpose_loss",
  "optional_before_required_without_authority",
  "candidate_rank_leakage",
  "setup_overrides_required_purpose",
  "unsupported_pairing",
  "within_exercise_rest_overwritten",
  "fake_transition_duration",
  "fake_recovery_duration",
  "fake_session_duration_or_unknown_called_fit",
  "downstream_rescue_of_gate_0_through_9",
] as const);

export const SESSION_SEQUENCING_CONTROLLED_SCENARIO_IDS = Object.freeze([
  ...SESSION_SEQUENCING_CAGT_PAIR_IDS,
  "no_warmup", "no_activation", "warmup_only", "activation_only", "warmup_and_activation",
  "several_preparation_dependencies", "several_activation_dependencies", "shared_supporting_identity",
  "no_generic_supporting_work", "main_acclimation_atomic", "required_accessory", "optional_accessory",
  "multiple_main_assignments", "carry_and_hold", "breathing_and_march", "counted_steps",
  "exact_duration", "bounded_duration", "unknown_setup", "unknown_recovery", "section_transition",
] as const);

export const SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST = Object.freeze({
  holdoutId: "SESSION_SEQUENCING_POLICY_V1_HOLDOUT",
  version: "1.0.0",
  seed: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_SEED,
  lockedBeforeExecution: true,
  policyTuningAfterInspectionPermitted: false,
  correctionsRequireVersion: "1.1.0",
  sourceFixtureFingerprintBoundary: "PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT",
  calibrationExerciseIds: REFERENCE_EXERCISES.map((exercise) => exercise.id).sort(),
  scenarios: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((fixture) => ({
    scenarioId: `sequencing:${fixture.scenarioId}`,
    sourceScenarioId: fixture.scenarioId,
    archetype: fixture.archetype,
    assignmentCount: fixture.skeleton.assignments.length,
    exerciseIds: fixture.skeleton.assignments.map((assignment) => assignment.exerciseId).sort(),
    sections: fixture.skeleton.assignments.map((assignment) => assignment.section).sort(),
    roles: fixture.skeleton.assignments.map((assignment) => assignment.role).sort(),
    experience: fixture.experience,
    goal: fixture.goal,
    phaseId: fixture.phaseId,
    equipmentContext: fixture.equipmentContext,
    structuralCapacity: fixture.capacity,
    contextTags: [...fixture.contextTags].sort(),
    expectedPrescriptionResolution: fixture.expectedResolution,
  })),
});

export const SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT =
  digest(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST);

export const SESSION_SEQUENCING_ONTOLOGY_CLASSIFICATION =
  "FINAL_SEQUENCING_ONTOLOGY_READY" as const;
