import type { PhaseId } from "../../src/domain/phase";
import { EXERCISE_DOSE_MODES, PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src";
import { digest } from "./signatures";
import type { PhaseContinuityStatus } from "./phaseContinuityContracts";

export const PHASE_CONTINUITY_CONTROLLED_CASE_NAMES = Object.freeze([
  "same_phase_same_facts", "week_count_increases_only", "calendar_time_changes_only",
  "phase_display_name_changes", "developed_quality_prose_changes",
  "priority_muscle_array_changes_without_objective", "current_program_remains_productive",
  "insufficient_performance_evidence", "mixed_response_evidence", "unknown_recovery",
  "target_criterion_incomplete", "one_missed_session", "one_failed_set",
  "one_local_prescription_review", "irrelevant_pain",
  "phase_1_to_2_all_typed_criteria_met", "phase_1_to_2_planned_valid_no_completed_evidence",
  "phase_1_to_2_isolated_success_only", "phase_1_to_2_repeated_successful_evidence",
  "phase_1_to_2_tolerated_exposure_stable_execution", "phase_1_to_2_worsening_response_blocker",
  "phase_1_to_2_urgent_safety_block", "phase_1_to_2_unresolved_prescription_blocker",
  "phase_1_to_2_mixed_evidence", "phase_1_to_2_evidence_conflict",
  "phase_1_to_2_same_framework_retained", "phase_1_to_2_same_anchors_retained",
  "phase_1_to_2_same_complete_program_legal", "phase_1_to_2_local_prescription_policy_change",
  "phase_1_to_2_all_exercises_replaced_mutation", "phase_2_generic_strength_template_mutation",
  "phase_priority_muscles_create_needs_mutation", "phase_primary_goal_overrides_athlete_goal_mutation",
  "phase_2_to_3_repeated_productive_progression_evidence",
  "phase_2_to_3_progression_review_permitted_not_selected", "phase_2_to_3_recoverability_present",
  "phase_2_to_3_recovery_missing", "phase_2_to_3_plateau_productive_continuity",
  "phase_2_to_3_plateau_poor_recovery", "phase_2_to_3_one_adverse_response",
  "phase_2_to_3_successful_re_exposure", "phase_2_to_3_same_framework_retained",
  "phase_2_to_3_phase_incompatible_assignment_reviewed", "phase_2_to_3_all_anchors_replaced_mutation",
  "phase_2_to_3_universal_set_increase_mutation", "phase_2_to_3_universal_effort_increase_mutation",
  "phase_2_to_3_universal_support_reduction_mutation", "phase_2_to_3_universal_slow_tempo_mutation",
  "phase_3_remain", "phase_3_cycle_completion_owner_review", "automatic_phase_4_mutation",
  "automatic_phase_1_restart_mutation", "automatic_deload_mutation", "automatic_rotation_mutation",
  "regression_pain_region_only", "regression_repeated_response_blocker", "regression_safety_block",
  "regression_one_missed_week", "regression_low_adherence_evidence",
  "explicit_regression_review_evidence", "automatic_phase_2_to_1_mutation",
  "phase_change_plus_explicit_goal_change", "phase_change_plus_one_day_equipment_loss",
  "phase_change_plus_whole_horizon_equipment_loss", "phase_change_plus_condensed_session",
  "phase_change_plus_new_direct_objective", "phase_change_plus_removed_objective",
  "phase_change_plus_relevant_support_requirement", "phase_change_plus_side_specific_requirement",
  "phase_change_plus_safety_block", "warmup_dependency_persists", "warmup_dependency_disappears",
  "new_typed_warmup_dependency", "generic_phase_1_corrective_circuit_mutation",
  "generic_phase_2_activation_circuit_mutation", "generic_phase_3_cuff_circuit_mutation",
  "shared_preparation_remains_shared", "stale_supporting_work_remains_mutation",
  "stable_phase_cycle_identity", "ambiguous_cross_horizon_session_alignment",
  "stable_anchor_moved_to_another_session", "source_event_revised_without_duplication",
  "same_exercise_changed_prescription", "same_exercise_reps_tempo", "exercise_changed_due_equipment_not_phase",
] as const);

export type PhaseContinuityEvidenceMode =
  | "met"
  | "missing"
  | "planned_only"
  | "isolated"
  | "mixed"
  | "blocker"
  | "conflict";

export type PhaseContinuityMutationKind =
  | "none"
  | "local_phase_prescription"
  | "global_program_regeneration"
  | "upstream_failure"
  | "goal_override"
  | "phase_creates_need"
  | "automatic_progression"
  | "automatic_replacement"
  | "automatic_rotation"
  | "automatic_deload"
  | "automatic_cycle_reset"
  | "automatic_regression"
  | "generic_phase_warmup"
  | "generic_phase_activation"
  | "anchor_displacement"
  | "ambiguous_alignment"
  | "equipment_local_change"
  | "week_policy_change"
  | "structured_response_change";

export type PhaseContinuityHoldoutCategory =
  | "stay"
  | "advance"
  | "hold_missing_evidence"
  | "evidence_conflict"
  | "safety_block"
  | "phase_3_cycle_review"
  | "justified_local_change"
  | "excessive_regeneration_mutation"
  | "no_rescue_mutation";

export interface PhaseContinuityHoldoutDescriptor {
  readonly pairId: string;
  readonly category: PhaseContinuityHoldoutCategory;
  readonly snapshotIndex: number;
  readonly currentPhaseId: PhaseId;
  readonly targetPhaseId: PhaseId;
  readonly transitionKind: "stay" | "adjacent_advancement" | "cycle_completion_review";
  readonly evidenceMode: PhaseContinuityEvidenceMode;
  readonly safetyBlock: boolean;
  readonly mutationKind: PhaseContinuityMutationKind;
  readonly genuineCompleteProgramPair: boolean;
  readonly expectedStatus: PhaseContinuityStatus;
  readonly expectedFirstFailingSubgate: string | null;
}

function descriptors(input: {
  readonly category: PhaseContinuityHoldoutCategory;
  readonly count: number;
  readonly offset: number;
  readonly phase: (index: number) => readonly [PhaseId, PhaseId];
  readonly transitionKind: PhaseContinuityHoldoutDescriptor["transitionKind"];
  readonly evidenceMode: PhaseContinuityEvidenceMode;
  readonly safetyBlock?: boolean;
  readonly mutationKind?: PhaseContinuityMutationKind;
  readonly genuine: boolean;
  readonly expectedStatus: PhaseContinuityStatus;
  readonly expectedFirstFailingSubgate?: string | null;
}): readonly PhaseContinuityHoldoutDescriptor[] {
  return Array.from({ length: input.count }, (_, localIndex) => {
    const index = input.offset + localIndex;
    const [currentPhaseId, targetPhaseId] = input.phase(localIndex);
    return Object.freeze({
      pairId: `phase-continuity-holdout-${String(index + 1).padStart(3, "0")}`,
      category: input.category,
      snapshotIndex: index,
      currentPhaseId,
      targetPhaseId,
      transitionKind: input.transitionKind,
      evidenceMode: input.evidenceMode,
      safetyBlock: input.safetyBlock ?? false,
      mutationKind: input.mutationKind ?? "none",
      genuineCompleteProgramPair: input.genuine,
      expectedStatus: input.expectedStatus,
      expectedFirstFailingSubgate: input.expectedFirstFailingSubgate ?? null,
    });
  });
}

const samePhase = (index: number): readonly [PhaseId, PhaseId] => {
  const phase = (["phase_1", "phase_2", "phase_3"] as const)[index % 3];
  return [phase, phase];
};
const adjacent = (index: number): readonly [PhaseId, PhaseId] => index % 2 === 0 ?
  ["phase_1", "phase_2"] : ["phase_2", "phase_3"];
const phase3 = (): readonly [PhaseId, PhaseId] => ["phase_3", "phase_3"];

const pairs = Object.freeze([
  ...descriptors({ category: "stay", count: 55, offset: 0, phase: samePhase, transitionKind: "stay",
    evidenceMode: "missing", genuine: true, expectedStatus: "remain_current_phase" }),
  ...descriptors({ category: "advance", count: 60, offset: 55, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "met", genuine: true,
    expectedStatus: "advance_to_next_phase_authorized" }),
  ...descriptors({ category: "hold_missing_evidence", count: 45, offset: 115, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "missing", genuine: true,
    expectedStatus: "hold_current_phase_pending_evidence" }),
  ...descriptors({ category: "evidence_conflict", count: 20, offset: 160, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "conflict", genuine: true,
    expectedStatus: "transition_evidence_conflict" }),
  ...descriptors({ category: "safety_block", count: 15, offset: 180, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "met", safetyBlock: true, genuine: true,
    expectedStatus: "transition_blocked_by_training_safety" }),
  ...descriptors({ category: "phase_3_cycle_review", count: 15, offset: 195, phase: phase3,
    transitionKind: "cycle_completion_review", evidenceMode: "met", genuine: true,
    expectedStatus: "phase_cycle_completion_owner_review_required" }),
  ...descriptors({ category: "justified_local_change", count: 30, offset: 210, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "met", mutationKind: "local_phase_prescription",
    genuine: false, expectedStatus: "advance_to_next_phase_authorized" }),
  ...descriptors({ category: "excessive_regeneration_mutation", count: 30, offset: 240, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "met", mutationKind: "global_program_regeneration",
    genuine: false, expectedStatus: "transition_not_authorized",
    expectedFirstFailingSubgate: "15.6_stable_base_continuity" }),
  ...descriptors({ category: "no_rescue_mutation", count: 25, offset: 270, phase: adjacent,
    transitionKind: "adjacent_advancement", evidenceMode: "met", mutationKind: "upstream_failure",
    genuine: false, expectedStatus: "upstream_program_invalid",
    expectedFirstFailingSubgate: "15.1_upstream_validity" }),
]);

export const PHASE_CONTINUITY_HOLDOUT_COVERAGE_LOCK = Object.freeze({
  exerciseIds: Object.freeze(REFERENCE_EXERCISES.map((exercise) => exercise.id).sort()),
  doseModes: Object.freeze([...EXERCISE_DOSE_MODES].sort()),
  sections: Object.freeze(["accessory", "activation", "cooldown", "main", "warmup"]),
  trainingRoles: Object.freeze(["activation", "capacity", "hypertrophy_accessory", "preparation",
    "primary_strength", "recovery", "secondary_strength"]),
  opportunityCounts: Object.freeze([1, 2, 3, 4, 5, 6]),
  requiredEvidence: Object.freeze(["typed_completion", "execution_quality", "tolerance", "recoverability",
    "progression_readiness", "training_safety", "planned_gate_13", "planned_gate_14"]),
  requiredBoundaries: Object.freeze(["relevant_pain", "irrelevant_pain", "direct_priority",
    "assessment_priority", "capacity", "equipment_change", "duration_unknown",
    "unsupported_policy_scope", "same_program_convergence", "warmup_activation"]),
});

export const PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST = Object.freeze({
  contractId: "PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST",
  version: "1.0.0",
  frozenBeforeExecution: true,
  correctionPolicy: "V1.1_NEW_HOLDOUT_REQUIRED",
  coverageLock: PHASE_CONTINUITY_HOLDOUT_COVERAGE_LOCK,
  pairCount: pairs.length,
  pairs,
});

export const PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  digest(PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST);
export const EXPECTED_PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  "9d4c6fe5b46612e34a798beee89f0c6e83992df516ebdbdc37fe28b47aa7f293" as const;

export const PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS = Object.freeze({
  pairCount: pairs.length,
  genuineCompleteProgramPairCount: pairs.filter((entry) => entry.genuineCompleteProgramPair).length,
  stayCount: pairs.filter((entry) => entry.category === "stay").length,
  advanceCount: pairs.filter((entry) => entry.category === "advance").length,
  holdCount: pairs.filter((entry) => entry.category === "hold_missing_evidence").length,
  conflictCount: pairs.filter((entry) => entry.category === "evidence_conflict").length,
  safetyBlockCount: pairs.filter((entry) => entry.category === "safety_block").length,
  cycleReviewCount: pairs.filter((entry) => entry.category === "phase_3_cycle_review").length,
  stableFrameworkTransitionPairCount: pairs.filter((entry) => entry.genuineCompleteProgramPair).length,
  anchorContinuityPairCount: pairs.filter((entry) => entry.genuineCompleteProgramPair).length,
  justifiedLocalChangePairCount: pairs.filter((entry) => entry.category === "justified_local_change").length,
  excessiveRegenerationMutationCount: pairs.filter((entry) =>
    entry.category === "excessive_regeneration_mutation").length,
  noRescueMutationCount: pairs.filter((entry) => entry.category === "no_rescue_mutation").length,
});

export const PHASE_CONTINUITY_FIXED_SHELL_COHORT_SIZE = 30;
export const PHASE_CONTINUITY_MULTI_HORIZON_SHAPES = Object.freeze([
  "one_opportunity", "two_opportunities", "three_opportunities", "five_opportunities",
  "six_opportunities", "irregular_ordered_cycle",
] as const);
