import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES, type ExerciseDoseMode } from "../../src/prescription/dose";
import { SESSION_SECTIONS, type TrainingRole } from "../../src/domain/session";
import type { ProgressionAxis } from "../../src/domain/progression";
import type {
  LongitudinalAction,
  LongitudinalGate16Status,
  LongitudinalHoldoutDescriptor,
} from "../../src/longitudinalAdaptation/designContracts";
import { digest } from "./signatures";

export const LONGITUDINAL_TRAINING_ROLES = Object.freeze<TrainingRole[]>([
  "preparation", "activation", "primary_strength", "secondary_strength",
  "hypertrophy_accessory", "capacity", "recovery",
]);

export const LONGITUDINAL_CONTROLLED_CHAIN_NAMES = Object.freeze([
  "first_successful_exposure", "repeated_success_appropriate_challenge", "productive_current_prescription",
  "mixed_exact_evidence", "unknown_recovery", "target_partially_met", "insufficient_history",
  "same_facts_different_labels", "repeated_target_met", "execution_quality_met", "response_tolerated",
  "recovery_adequate", "load_axis_legal", "reps_axis_legal", "duration_axis_legal", "distance_axis_legal",
  "steps_axis_legal", "support_reduction_axis_legal", "phase_preferred_axis_late_tie",
  "two_equal_axes_conflict", "unavailable_load_increment", "sets_without_week_policy",
  "tempo_without_policy", "isolated_success_progression_mutation", "calendar_progression_mutation",
  "phase_only_progression_mutation", "exact_limited_load", "exact_limited_range", "exact_limited_support",
  "exact_limited_side", "repeated_target_failure", "one_failed_set_mutation", "pain_region_only_mutation",
  "global_regression_mutation", "unrelated_session_regression_mutation", "repeated_adverse_exact_realizations",
  "materially_different_failed_realizations", "modification_review_attempted", "modification_review_not_attempted",
  "successful_reexposure", "one_adverse_realization", "exercise_illegal", "equipment_lost",
  "replacement_identity_selected_by_gate16_mutation", "global_exercise_ban_mutation",
  "optional_rotation_eligible_accessory", "productive_anchor_rotation_mutation", "calendar_rotation_mutation",
  "phase_rotation_mutation", "variety_without_eligible_pool", "plateau_with_eligible_pool",
  "adverse_disguised_as_variety_mutation", "multi_session_recovery_concern", "one_poor_session",
  "week_count_only", "phase3_only", "adherence_constraint", "over_budget_repetition",
  "automatic_week_reallocation_mutation", "missed_work_doubling_mutation", "phase_review_request",
  "phase_mutation_applied_by_gate16", "safety_block", "external_review", "gate15_advance_unapplied",
  "gate15_hold", "activation_tolerated", "activation_fatigue_concern", "preparation_dependency_persists",
  "preparation_dependency_disappears", "universal_warmup_progression_mutation", "recurring_a1_confusion_mutation",
  "authorized_load_axis_reflected_locally", "authorized_regression_reflected_locally",
  "keep_with_unrelated_change", "replacement_candidate_search_reopened",
  "replacement_direct_swap_without_candidate_rerun", "action_erased_downstream", "action_scope_exceeded",
  "identical_next_program_after_keep", "same_reps_tempo_after_load_progress", "same_exercise_after_modification",
  "duplicate_source_event", "duplicate_outcome_entry", "planned_dose_as_actual", "prescribed_tempo_as_actual",
  "copied_record_as_repeated", "future_dated_evidence", "stale_evidence", "wrong_side_evidence",
  "wrong_support_context", "wrong_prescription_revision", "orphan_response", "substitution_lineage",
  "not_performed_exposure", "shoulder_response_calves_unchanged", "hinge_issue_press_unchanged",
  "left_issue_right_unchanged", "accessory_plateau_main_unchanged", "one_session_adherence_others_unchanged",
  ...Array.from({ length: 30 }, (_, index) => `extended_multi_horizon_chain_${String(index + 1).padStart(2, "0")}`),
] as const);

function axisForMode(mode: ExerciseDoseMode): ProgressionAxis {
  if (mode === "repetition_sets") return "load";
  if (mode === "timed_hold" || mode === "timed_carry") return "duration";
  if (mode === "breath_cycles") return "breath_cycles";
  if (mode === "distance_carry") return "distance";
  return "steps";
}

function expected(action: LongitudinalAction | null, upstream = false): LongitudinalGate16Status {
  if (upstream) return "longitudinal_upstream_invalid";
  if (action === "owner_review_required") return "longitudinal_action_conflict";
  if (action === "hold_current_prescription") return "longitudinal_hold";
  if (action === "no_action_insufficient_evidence" || action === null) return "longitudinal_insufficient_evidence";
  if (action === "external_safety_review") return "longitudinal_safety_blocked";
  if (["week_reallocation_review", "deload_review", "phase_review"].includes(action)) {
    return "longitudinal_review_required";
  }
  return "longitudinal_decision_authorized";
}

function descriptor(input: {
  readonly index: number;
  readonly prefix: string;
  readonly category: LongitudinalHoldoutDescriptor["category"];
  readonly action: LongitudinalAction | null;
  readonly evidenceMode: string;
  readonly genuine: boolean;
  readonly mutationKind?: string;
}): LongitudinalHoldoutDescriptor {
  const exercise = REFERENCE_EXERCISES[input.index % REFERENCE_EXERCISES.length];
  const doseMode = EXERCISE_DOSE_MODES[input.index % EXERCISE_DOSE_MODES.length];
  const upstream = input.category === "no_rescue_mutation";
  return Object.freeze({ scenarioId: `${input.prefix}-${String(input.index + 1).padStart(3, "0")}`,
    category: input.category, expectedAction: input.action,
    expectedStatus: expected(input.action, upstream),
    expectedFirstFailingSubgate: upstream ? "16.1_upstream_validity" : null,
    evidenceMode: input.evidenceMode, progressionAxis:
      ["progress_prescription_axis", "regress_prescription_axis"].includes(input.action ?? "") ?
        axisForMode(doseMode) : null,
    exerciseId: exercise.id, doseMode, section: SESSION_SECTIONS[input.index % SESSION_SECTIONS.length],
    trainingRole: LONGITUDINAL_TRAINING_ROLES[input.index % LONGITUDINAL_TRAINING_ROLES.length],
    phaseId: (["phase_1", "phase_2", "phase_3"] as const)[input.index % 3],
    opportunityCount: ((input.index % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
    genuineCompletedEvidenceHistory: input.genuine,
    mutationKind: input.mutationKind ?? "none" });
}

function holdoutDescriptor(index: number): LongitudinalHoldoutDescriptor {
  if (index < 85) {
    if (index < 10) return descriptor({ index, prefix: "longitudinal-holdout", category: "keep_repeat_hold",
      action: "keep_current", evidenceMode: "productive", genuine: true,
      mutationKind: (["accepted_related_side", "accepted_related_support", "accepted_related_range",
        "accepted_related_load"] as const)[index % 4] });
    if (index < 20) return descriptor({ index, prefix: "longitudinal-holdout", category: "keep_repeat_hold",
      action: "keep_current", evidenceMode: "productive", genuine: true,
      mutationKind: "accepted_identity_history" });
    if (index < 25) return descriptor({ index, prefix: "longitudinal-holdout", category: "keep_repeat_hold",
      action: "keep_current", evidenceMode: "successful_reexposure", genuine: true });
    if (index < 30) return Object.freeze({ ...descriptor({ index, prefix: "longitudinal-holdout",
      category: "keep_repeat_hold", action: null, evidenceMode: "productive", genuine: true,
      mutationKind: "unsupported_source_gap" }), expectedStatus: "longitudinal_evidence_invalid" as const,
      expectedFirstFailingSubgate: "16.3_evidence_applicability_and_chronology" as const });
    const mod = index % 3;
    return descriptor({ index, prefix: "longitudinal-holdout", category: "keep_repeat_hold",
      action: mod === 0 ? "keep_current" : mod === 1 ? "repeat_for_confirmation" :
        "hold_current_prescription", evidenceMode: mod === 0 ? "productive" : mod === 1 ? "isolated" : "mixed",
      genuine: true });
  }
  if (index < 160) return descriptor({ index, prefix: "longitudinal-holdout", category: "progression",
    action: "progress_prescription_axis", evidenceMode: "progress", genuine: true });
  if (index < 215) {
    const regression = index % 2 === 0;
    return descriptor({ index, prefix: "longitudinal-holdout", category: "regression_modification",
      action: regression ? "regress_prescription_axis" : "prescription_modification_review",
      evidenceMode: regression ? "regress" : "modify", genuine: true });
  }
  if (index < 260) return descriptor({ index, prefix: "longitudinal-holdout", category: "replacement_review",
    action: "reopen_candidate_selection_for_replacement", evidenceMode: "replacement", genuine: true });
  if (index < 290) return descriptor({ index, prefix: "longitudinal-holdout", category: "rotation_review",
    action: "reopen_candidate_selection_for_bounded_rotation", evidenceMode: "rotation", genuine: true });
  if (index < 325) {
    const actions = ["week_reallocation_review", "deload_review", "phase_review",
      "external_safety_review"] as const;
    const modes = ["week_review", "deload_review", "phase_review", "safety"] as const;
    const local = index % actions.length;
    return descriptor({ index, prefix: "longitudinal-holdout", category: "week_deload_phase_safety_review",
      action: actions[local], evidenceMode: modes[local], genuine: true });
  }
  return descriptor({ index, prefix: "longitudinal-holdout", category: "no_rescue_mutation",
    action: null, evidenceMode: "progress", genuine: false, mutationKind: "upstream_failure" });
}

export const LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS = Object.freeze(
  Array.from({ length: 360 }, (_, index) => holdoutDescriptor(index)),
);

const holdoutWithoutFingerprint = Object.freeze({
  manifestId: "LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST",
  version: "1.0.0",
  frozenBeforeExecution: true,
  correctionPolicy: "V1.1_AND_NEW_LOCKED_HOLDOUT_REQUIRED",
  descriptors: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS,
});

const computedHoldoutFingerprint = digest(holdoutWithoutFingerprint);
export const LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  "7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18" as const;

if (computedHoldoutFingerprint !== LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST_FINGERPRINT) {
  throw new Error(`LONGITUDINAL_HOLDOUT_MANIFEST_DRIFT:${computedHoldoutFingerprint}`);
}

export const LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST = Object.freeze({
  ...holdoutWithoutFingerprint,
  fingerprint: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_MANIFEST_FINGERPRINT,
});

export const LONGITUDINAL_HOLDOUT_REQUIREMENT_COUNTS = Object.freeze({
  total: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS.length,
  genuineCompletedHistory: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.genuineCompletedEvidenceHistory).length,
  keepRepeatHold: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "keep_repeat_hold").length,
  progression: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "progression").length,
  regressionModification: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "regression_modification").length,
  replacement: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "replacement_review").length,
  rotation: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "rotation_review").length,
  ownerReview: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "week_deload_phase_safety_review").length,
  noRescue: LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .filter((entry) => entry.category === "no_rescue_mutation").length,
  exerciseIdentityCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.exerciseId)).size,
  doseModeCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.doseMode)).size,
  sectionCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.section)).size,
  trainingRoleCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.trainingRole)).size,
  phaseCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.phaseId)).size,
  horizonShapeCount: new Set(LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS
    .map((entry) => entry.opportunityCount)).size,
});

export const LONGITUDINAL_FIXED_SHELL_DESCRIPTORS = Object.freeze(Array.from({ length: 40 }, (_, index) => {
  const modes = ["isolated", "productive", "mixed", "progress", "modify", "regress", "replacement",
    "rotation", "week_review", "deload_review", "phase_review", "safety", "successful_reexposure"] as const;
  const actions: Readonly<Record<typeof modes[number], LongitudinalAction>> = {
    isolated: "repeat_for_confirmation", productive: "keep_current", mixed: "hold_current_prescription",
    progress: "progress_prescription_axis", modify: "prescription_modification_review",
    regress: "regress_prescription_axis", replacement: "reopen_candidate_selection_for_replacement",
    rotation: "reopen_candidate_selection_for_bounded_rotation", week_review: "week_reallocation_review",
    deload_review: "deload_review", phase_review: "phase_review", safety: "external_safety_review",
    successful_reexposure: "keep_current",
  };
  const mode = modes[index % modes.length];
  return descriptor({ index, prefix: "longitudinal-fixed-shell", category: "keep_repeat_hold",
    action: actions[mode], evidenceMode: mode, genuine: true });
}));

function controlledMode(name: string): { action: LongitudinalAction | null; mode: string; mutation: string } {
  if (/duplicate_source_event|duplicate_outcome_entry|planned_dose_as_actual|prescribed_tempo_as_actual|copied_record|future_dated|stale_evidence|wrong_side|wrong_support|wrong_prescription|orphan_response/.test(name)) {
    return { action: null, mode: "productive", mutation: name };
  }
  if (/replacement_direct_swap/.test(name)) return {
    action: "reopen_candidate_selection_for_replacement", mode: "replacement", mutation: name };
  if (/keep_with_unrelated_change/.test(name)) return {
    action: "keep_current", mode: "productive", mutation: name };
  if (/action_erased|action_scope_exceeded|phase_mutation_applied/.test(name)) {
    return { action: "progress_prescription_axis", mode: "progress", mutation: name };
  }
  if (/safety_block|external_review/.test(name)) return { action: "external_safety_review", mode: "safety", mutation: "none" };
  if (/phase_review/.test(name)) return { action: "phase_review", mode: "phase_review", mutation: "none" };
  if (/multi_session_recovery|deload/.test(name)) return { action: "deload_review", mode: "deload_review", mutation: "none" };
  if (/week_reallocation|adherence_constraint|over_budget/.test(name)) return { action: "week_reallocation_review", mode: "week_review", mutation: "none" };
  if (/rotation_eligible|plateau_with_eligible_pool/.test(name)) return {
    action: "reopen_candidate_selection_for_bounded_rotation", mode: "rotation", mutation: "none" };
  if (/productive_anchor_rotation|calendar_rotation|phase_rotation|variety_without|adverse_disguised/.test(name)) {
    return { action: "keep_current", mode: "productive", mutation: name };
  }
  if (/successful_reexposure/.test(name)) return { action: "keep_current", mode: "successful_reexposure", mutation: "none" };
  if (/repeated_adverse|materially_different|modification_review_attempted|exercise_illegal|equipment_lost/.test(name)) {
    return { action: "reopen_candidate_selection_for_replacement", mode: "replacement", mutation: "none" };
  }
  if (/one_adverse|modification_review_not_attempted|exact_limited/.test(name)) {
    return { action: "prescription_modification_review", mode: "modify", mutation: "none" };
  }
  if (/repeated_target_failure/.test(name)) return { action: "regress_prescription_axis", mode: "regress", mutation: "none" };
  if (/one_failed_set|pain_region|global_regression|unrelated_session_regression/.test(name)) {
    return { action: "hold_current_prescription", mode: "mixed", mutation: name };
  }
  if (/two_equal_axes/.test(name)) return { action: "owner_review_required", mode: "progress_conflict", mutation: "none" };
  if (/isolated_success_progression|calendar_progression|phase_only_progression|unavailable_load|sets_without|tempo_without/.test(name)) {
    return { action: "repeat_for_confirmation", mode: "isolated", mutation: name };
  }
  if (/target_met|quality_met|response_tolerated|recovery_adequate|axis_legal|phase_preferred|authorized_load|same_reps_tempo/.test(name)) {
    return { action: "progress_prescription_axis", mode: "progress", mutation: "none" };
  }
  if (/mixed|unknown_recovery|partially_met/.test(name)) return {
    action: "hold_current_prescription", mode: "mixed", mutation: "none" };
  if (/first_success|insufficient_history/.test(name)) return {
    action: "repeat_for_confirmation", mode: "isolated", mutation: "none" };
  return { action: "keep_current", mode: "productive", mutation: "none" };
}

export const LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS = Object.freeze(
  LONGITUDINAL_CONTROLLED_CHAIN_NAMES.map((name, index) => {
    const row = controlledMode(name);
    const base = descriptor({ index, prefix: "longitudinal-controlled", category: "keep_repeat_hold",
      action: row.action, evidenceMode: row.mode, genuine: true, mutationKind: row.mutation });
    const ledgerFailure = /duplicate_source_event|duplicate_outcome_entry|planned_dose_as_actual|prescribed_tempo_as_actual|copied_record|future_dated|wrong_prescription|orphan_response/.test(row.mutation);
    const evidenceFailure = /stale_evidence|wrong_side|wrong_support/.test(row.mutation);
    const applicationFailure = /action_erased|action_scope_exceeded|phase_mutation_applied|keep_with_unrelated_change|replacement_direct_swap/.test(row.mutation);
    const axisCase: Partial<Pick<LongitudinalHoldoutDescriptor, "doseMode" | "progressionAxis">> =
      /load_axis_legal|authorized_load_axis/.test(name) ? { doseMode: "repetition_sets", progressionAxis: "load" } :
      /reps_axis_legal/.test(name) ? { doseMode: "repetition_sets", progressionAxis: "reps" } :
      /duration_axis_legal/.test(name) ? { doseMode: "timed_hold", progressionAxis: "duration" } :
      /distance_axis_legal/.test(name) ? { doseMode: "distance_carry", progressionAxis: "distance" } :
      /steps_axis_legal/.test(name) ? { doseMode: "step_sets", progressionAxis: "steps" } :
      /support_reduction_axis_legal/.test(name) ?
        { doseMode: "repetition_sets", progressionAxis: "support_reduction" } : {};
    return Object.freeze({ ...base, ...axisCase, scenarioId: name,
      expectedStatus: ledgerFailure ? "longitudinal_outcome_ledger_invalid" as const :
        evidenceFailure ? "longitudinal_evidence_invalid" as const :
        applicationFailure ? "longitudinal_application_invalid" as const : base.expectedStatus,
      expectedFirstFailingSubgate: ledgerFailure ? "16.2_completed_outcome_ledger_integrity" as const :
        evidenceFailure ? "16.3_evidence_applicability_and_chronology" as const :
        applicationFailure ? "16.8_optional_application_validation" as const : base.expectedFirstFailingSubgate });
  }),
);
