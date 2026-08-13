export const CAGT_VERSION = "1.0.0";
export const CAGT_EVALUATION_AS_OF = "2026-08-12T20:46:56-04:00";

export type CagtLayerAuthority = "PRODUCTION" | "DESIGN_ONLY" | "HANDOFF_ONLY" | "FOUNDATION_ONLY" | "NOT_IMPLEMENTED";
export type CagtGateExecutionState = "PASS" | "PASS_WITH_EXPECTED_CONVERGENCE" | "PASS_WITH_JUSTIFIED_CONVERGENCE" |
  "PASS_DIFFERENCE_DEFERRED_TO_RIGHTFUL_OWNER" | "FAIL_STOP" | "NOT_APPLICABLE" | "NOT_IMPLEMENTED" |
  "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
export type CagtClassification = "EXPECTED_CONVERGENCE" | "JUSTIFIED_CONVERGENCE" | "MATERIAL_ADAPTATION" |
  "OPTIONAL_VARIATION" | "DIFFERENCE_DEFERRED_TO_LATER_OWNER" | "TRACE_ONLY_DIFFERENCE_NOT_SUFFICIENT" |
  "SUSPICIOUS_CONVERGENCE" | "UNRESPONSIVE_TO_MATERIAL_INPUT" | "OVER_ADAPTATION" | "WRONG_LAYER_EFFECT" |
  "DOWNSTREAM_RESCUE_REJECTED";
export type CagtFrameworkRelationship = "expected_same" | "may_converge" | "must_differ";
export type CagtAdaptiveRelationship = "expected_same" | "justified_same_allowed" | "must_differ";

export const CAGT_GATE_ORDER = [
  "gate_0_scenario_truth", "gate_1_weekly_responsibility_truth", "gate_2_whole_week_allocation_coverage",
  "gate_3_weekly_causal_adaptation", "gate_4_weekly_duplication_distribution",
  "gate_5_reservation_day_materialization", "gate_6_session_intent_truth", "gate_7_candidate_intelligence_truth",
  "gate_8_session_composition_truth", "gate_9_prescription_handoff_truth", "gate_10_sequencing_duration_handoff_truth",
  "gate_11_execution_response_foundation", "gate_12_all_horizon_sessions", "gate_13_post_prescription_weekly_validation",
  "gate_14_full_prescribed_program_comparison", "gate_15_phase_continuity", "gate_16_longitudinal_adaptation",
] as const;
export type CagtGateId = typeof CAGT_GATE_ORDER[number];

export const CAGT_GATE_AUTHORITY: Readonly<Record<CagtGateId, CagtLayerAuthority>> = {
  gate_0_scenario_truth: "PRODUCTION", gate_1_weekly_responsibility_truth: "DESIGN_ONLY",
  gate_2_whole_week_allocation_coverage: "DESIGN_ONLY", gate_3_weekly_causal_adaptation: "DESIGN_ONLY",
  gate_4_weekly_duplication_distribution: "DESIGN_ONLY", gate_5_reservation_day_materialization: "DESIGN_ONLY",
  gate_6_session_intent_truth: "PRODUCTION", gate_7_candidate_intelligence_truth: "PRODUCTION",
  gate_8_session_composition_truth: "PRODUCTION", gate_9_prescription_handoff_truth: "HANDOFF_ONLY",
  gate_10_sequencing_duration_handoff_truth: "HANDOFF_ONLY", gate_11_execution_response_foundation: "FOUNDATION_ONLY",
  gate_12_all_horizon_sessions: "DESIGN_ONLY", gate_13_post_prescription_weekly_validation: "NOT_IMPLEMENTED",
  gate_14_full_prescribed_program_comparison: "NOT_IMPLEMENTED", gate_15_phase_continuity: "NOT_IMPLEMENTED",
  gate_16_longitudinal_adaptation: "FOUNDATION_ONLY",
};

export const CAGT_DIFFERENCE_DIMENSIONS = [
  "horizon_opportunities", "weekly_objectives", "weekly_goal_relationship", "objective_priority", "objective_frequency",
  "objective_allocation", "reservation_responsibility", "reservation_session_goal", "recovery_spacing_state",
  "unresolved_week_context", "reallocation_state", "current_availability", "current_equipment", "structural_capacity",
  "materialization_status", "retained_responsibility", "safety_readiness", "session_needs", "need_priority", "need_section",
  "need_role", "standalone_admission", "preparation_dependency", "assessment_enrichment", "active_continuity",
  "candidate_legality", "candidate_pool", "candidate_order", "candidate_readiness", "candidate_continuity",
  "candidate_phase_evidence", "candidate_pain_evidence", "selected_identity", "section_assignment", "assigned_role",
  "shared_need_coverage", "anchor_retention", "supporting_work", "optional_work", "unresolved_candidate_review",
  "unresolved_prescription_requirement", "infeasibility", "search_completeness", "sets", "reps", "load", "effort",
  "range", "support", "side", "tempo", "rest", "duration", "distance", "steps", "realized_stress",
  "within_section_order", "dependency_order", "superset_or_pairing", "transition_order", "duration_feasibility",
  "trace_only", "prose", "label", "scenario_id", "display_order",
] as const;
export type CagtDifferenceDimension = typeof CAGT_DIFFERENCE_DIMENSIONS[number];
export const CAGT_TIMING_DIFFERENCE_DIMENSIONS = [
  "dose_mode_knowledge", "tempo_capability", "duration_capability", "breathing_cadence_capability",
  "locomotor_cadence_capability", "timing_policy_requirement", "timing_provenance", "prescribed_tempo",
  "actual_tempo", "prescribed_duration", "actual_duration", "timing_control_observation",
  "timing_reexposure", "duration_determinability", "unknown_tempo_contribution", "rest_setup_dependency",
] as const;
export type CagtTimingDifferenceDimension = typeof CAGT_TIMING_DIFFERENCE_DIMENSIONS[number];
export const CAGT_NON_MATERIAL_DIMENSIONS: readonly CagtDifferenceDimension[] =
  ["trace_only", "prose", "label", "scenario_id", "display_order"];

export interface CagtCounterfactualContract {
  readonly id: string;
  readonly version: string;
  readonly baselineScenarioId: string;
  readonly counterfactualScenarioId: string;
  readonly changedFactPaths: readonly string[];
  readonly changedFactIds: readonly string[];
  readonly canonicalFactOwner: string;
  readonly materiality: "material" | "inert";
  readonly earliestPermittedResponseGate: CagtGateId | null;
  readonly latestRequiredResponseGate: CagtGateId | null;
  readonly invariantGates: readonly CagtGateId[];
  readonly permittedDifferenceDimensions: readonly CagtDifferenceDimension[];
  readonly prohibitedDifferenceDimensions: readonly CagtDifferenceDimension[];
  readonly acceptableConvergenceReasons: readonly string[];
  readonly justifiedConvergenceReason?: string;
  readonly expectedFrameworkRelationship: CagtFrameworkRelationship;
  readonly expectedAdaptiveContentRelationship: CagtAdaptiveRelationship;
  readonly expectedPrescriptionRelationship: "same" | "may_differ" | "must_differ" | "not_implemented";
  readonly expectedSequenceRelationship: "same" | "may_differ" | "must_differ" | "not_implemented";
  readonly layerAuthorityExpectations: Partial<Readonly<Record<CagtGateId, CagtLayerAuthority>>>;
  readonly downstreamRescueProhibited: true;
  readonly source: { readonly sourceType: "owner_decision" | "reviewed_test_contract"; readonly sourceRef: string };
  readonly explanation: string;
}

export interface CagtGateSnapshot {
  readonly dimensions: Partial<Readonly<Record<CagtDifferenceDimension, unknown>>>;
}
export interface CagtScenario {
  readonly id: string;
  readonly fixture: unknown;
  readonly gates: Partial<Readonly<Record<CagtGateId, CagtGateSnapshot>>>;
}
export interface CagtGateResult {
  readonly gate: CagtGateId;
  readonly authority: CagtLayerAuthority;
  readonly state: CagtGateExecutionState;
  readonly classification: CagtClassification | null;
  readonly differingDimensions: readonly CagtDifferenceDimension[];
  readonly materialDifferingDimensions: readonly CagtDifferenceDimension[];
  readonly reasonCode: string;
  readonly invalidUpstreamGate: CagtGateId | null;
  readonly invalidUpstreamReason: string | null;
  readonly scored: boolean;
  readonly diagnosticOnly: boolean;
}
export interface CagtPairResult {
  readonly contractId: string;
  readonly fixtureValid: boolean;
  readonly expectedEarliestGate: CagtGateId | null;
  readonly expectedLatestGate: CagtGateId | null;
  readonly actualFirstAnyDifferenceGate: CagtGateId | null;
  readonly actualFirstMaterialDifferenceGate: CagtGateId | null;
  readonly firstDifferenceDimensions: readonly CagtDifferenceDimension[];
  readonly firstFailingGate: CagtGateId | null;
  readonly classification: CagtClassification;
  readonly downstreamRescueAttempted: boolean;
  readonly downstreamDifferencesObserved: readonly CagtDifferenceDimension[];
  readonly downstreamDifferencesScored: false;
  readonly finalScoredResult: "PASS" | "FAIL_STOP" | "NOT_IMPLEMENTED";
  readonly gateResults: readonly CagtGateResult[];
}
