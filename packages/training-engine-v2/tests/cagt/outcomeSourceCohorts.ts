import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { SESSION_SECTIONS } from "../../src/domain/session";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { PRODUCTION_LONGITUDINAL_ACTIONS } from "../../src/longitudinalAdaptation";
import { OUTCOME_SOURCE_CATEGORIES } from "../../src/outcomeSources/designContracts";
import { digest } from "./signatures";

export const OUTCOME_SOURCE_CONTROLLED_SCENARIO_NAMES = Object.freeze([
  "first_delivery", "exact_retry", "same_idempotency_key_different_payload", "duplicated_network_retry",
  "out_of_order_revisions", "offline_sync", "late_arriving_event", "same_event_two_devices",
  "duplicate_source_native_record", "distinct_identical_valued_events", "correction_to_reps",
  "correction_to_load", "correction_to_event_time", "correction_to_side", "correction_to_support",
  "correction_to_response", "superseded_record", "withdrawn_record", "invalid_record",
  "two_active_final_revisions", "correction_chain_cycle", "stale_active_pointer", "one_block_completion",
  "multi_block_completion", "partial_block", "omitted_block", "additional_unplanned_block", "not_performed",
  "substitution_before_block", "substitution_during_block", "wrong_prescription_revision",
  "wrong_sequence_revision", "planned_as_actual_mutation", "prescribed_timing_as_actual_mutation",
  "flattened_multi_block_mutation", "tolerated_response", "limited_response", "adverse_response",
  "successful_reexposure", "delayed_response", "left_side_response", "support_specific_response",
  "load_specific_response", "pain_region_only", "unknown_persistence", "clinician_restriction",
  "athlete_report_conflicts_clinician", "completed_session", "partial_session", "session_not_started",
  "exercise_skipped", "time_constraint", "equipment_unavailable", "schedule_conflict", "unknown_reason",
  "one_missed_session", "repeated_reservation_conflict", "explicit_adequate_recovery",
  "explicit_recovery_concern", "unknown_recovery", "localized_concern", "systemic_concern",
  "expired_readiness_report", "future_readiness_report", "conflicting_readiness_reports",
  "current_equipment_snapshot", "exact_increment_available", "exact_increment_unavailable",
  "support_surface_unavailable", "travel_location", "one_day_equipment_loss", "whole_horizon_equipment_loss",
  "stale_equipment_snapshot", "sport_practice", "running", "manual_work", "explicit_external_duration",
  "unknown_external_intensity", "no_external_receiver_policy", "external_load_note_only", "authorized_source",
  "restricted_category", "revoked_authorization", "pending_authorization", "unknown_authorization",
  "audit_retained_decision_excluded", "free_text_note_ignored", "analytics_rejected_as_authority",
  "wrong_athlete_identity", "unauthorized_principal", "original_replay", "reordered_delivery_replay",
  "correction_replay", "supersession_replay", "authorization_revocation_replay", "policy_version_replay",
  "repeated_replay_no_new_decision", "replay_after_late_event", "replay_after_stale_exclusion",
  "replay_after_conflict", "prescription_directive_routing", "candidate_composer_routing",
  "week_routing_unavailable", "deload_routing_unavailable", "phase_routing", "safety_routing",
  "stale_directive", "stale_program_revision", "newer_source_conflict", "missing_confirmation",
  "duplicate_application_request", "application_attempt_unapplied", "wrong_owner", "unsupported_action",
  ...OUTCOME_SOURCE_CATEGORIES.map((category) => `closed_category_${category}`),
  "corrected_state_is_immutable", "active_state_is_single", "superseded_state_is_inactive",
  "withdrawn_state_is_decision_excluded", "invalid_state_is_rejected", "unknown_state_requires_review",
  "left_right_not_deduplicated", "supported_unsupported_not_deduplicated", "planned_actual_not_merged",
  "performance_response_not_merged", "user_clinician_not_merged", "event_ingestion_time_separated",
  "future_event_rejected", "late_event_rebuild_only", "unknown_authority_no_material_change",
  "lower_authority_no_silent_override", "raw_payload_is_reference_only", "display_name_inert",
  "device_id_nonsemantic", "provenance_order_inert", "snapshot_order_inert", "no_hidden_store",
  "no_hidden_clock", "no_random_identity", "no_automatic_application", "no_downstream_rescue",
] as const);

export interface OutcomeSourceHoldoutDescriptor {
  readonly scenarioId: string;
  readonly kinds: readonly ("performance" | "response" | "adherence" | "recovery" | "safety_clinician" |
    "equipment_environment" | "external_load" | "correction" | "authorization_privacy" | "application")[];
  readonly completeReplay: boolean;
  readonly exerciseId: string;
  readonly doseMode: string;
  readonly section: string;
  readonly action: string;
  readonly applicability: "exact" | "related" | "identity";
  readonly sourceCategory: string;
  readonly frozenExpectedState: "accepted" | "excluded" | "review" | "owner_unavailable";
}

function holdoutDescriptor(index: number): OutcomeSourceHoldoutDescriptor {
  const kinds: OutcomeSourceHoldoutDescriptor["kinds"][number][] = [];
  if (index < 80) kinds.push("performance");
  if (index >= 40 && index < 100) kinds.push("response");
  if (index >= 100 && index < 140) kinds.push("adherence");
  if (index >= 140 && index < 180) kinds.push("recovery");
  if (index >= 180 && index < 205) kinds.push("safety_clinician");
  if (index >= 205 && index < 230) kinds.push("equipment_environment");
  if (index >= 230 && index < 250) kinds.push("external_load");
  if (index >= 250 && index < 300) kinds.push("correction");
  if (index >= 300 && index < 340) kinds.push("authorization_privacy");
  if (index >= 325) kinds.push("application");
  return Object.freeze({ scenarioId: `outcome-source-holdout-${String(index + 1).padStart(3, "0")}`,
    kinds: Object.freeze(kinds), completeReplay: index < 240,
    exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length].id,
    doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length],
    section: SESSION_SECTIONS[index % SESSION_SECTIONS.length],
    action: PRODUCTION_LONGITUDINAL_ACTIONS[index % PRODUCTION_LONGITUDINAL_ACTIONS.length],
    applicability: (["exact", "related", "identity"] as const)[index % 3],
    sourceCategory: OUTCOME_SOURCE_CATEGORIES[index % OUTCOME_SOURCE_CATEGORIES.length],
    frozenExpectedState: index >= 325 ? "owner_unavailable" : index >= 300 ? "excluded" :
      index >= 250 ? "review" : "accepted" });
}

export const OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS = Object.freeze(
  Array.from({ length: 360 }, (_, index) => holdoutDescriptor(index)));

const manifestContent = Object.freeze({
  manifestId: "OUTCOME_SOURCE_AND_PERSISTENCE_FOUNDATION_V1_HOLDOUT_MANIFEST",
  version: "1.0.0", frozenBeforeExecution: true,
  descriptors: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS,
});
export const OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST_FINGERPRINT = digest(manifestContent);
export const OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST = Object.freeze({
  ...manifestContent, fingerprint: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST_FINGERPRINT,
});

export const OUTCOME_SOURCE_FIXED_SHELL_DESCRIPTORS = Object.freeze(Array.from({ length: 40 }, (_, index) =>
  Object.freeze({ scenarioId: `outcome-source-fixed-shell-${String(index + 1).padStart(2, "0")}`,
    variant: (["performance", "response", "recovery", "adherence", "correction", "authorization",
      "equipment", "external_load", "source_order", "labels_prose"] as const)[index % 10],
    semanticGroup: Math.floor(index / 10), athleteId: "athlete-fixed-shell", programId: "program-fixed-shell",
    evaluationTime: "2026-08-14T16:00:00.000Z" })));

export function outcomeSourceHoldoutCounts() {
  const count = (kind: OutcomeSourceHoldoutDescriptor["kinds"][number]) =>
    OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS.filter((entry) => entry.kinds.includes(kind)).length;
  return Object.freeze({ total: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS.length,
    completeReplay: OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS.filter((entry) => entry.completeReplay).length,
    performance: count("performance"), response: count("response"), adherence: count("adherence"),
    recovery: count("recovery"), safetyClinician: count("safety_clinician"),
    equipmentEnvironment: count("equipment_environment"), externalLoad: count("external_load"),
    correction: count("correction"), authorizationPrivacy: count("authorization_privacy"),
    application: count("application"), exerciseIdentities: new Set(OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS
      .map((entry) => entry.exerciseId)).size, doseModes: new Set(OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS
      .map((entry) => entry.doseMode)).size, sections: new Set(OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS
      .map((entry) => entry.section)).size, actionClasses: new Set(OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_DESCRIPTORS
      .map((entry) => entry.action)).size });
}
