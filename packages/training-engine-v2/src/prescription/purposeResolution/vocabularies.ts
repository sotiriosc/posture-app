export const PRESCRIPTION_LOCAL_PURPOSES = Object.freeze([
  "strength_development",
  "hypertrophy_development",
  "direct_development",
  "capacity_development",
  "movement_quality_development",
  "muscular_endurance_development",
  "systemic_conditioning_development",
  "power_development",
  "technique_or_control",
  "preparation",
  "activation",
  "recovery",
  "unknown",
] as const);
export type PrescriptionLocalPurpose = typeof PRESCRIPTION_LOCAL_PURPOSES[number];

export const PRESCRIPTION_PURPOSE_AUTHORITIES = Object.freeze([
  "primary_local_purpose",
  "secondary_local_purpose",
  "cross_goal_support",
  "dependency_support",
  "context_only",
  "unknown",
] as const);
export type PrescriptionPurposeAuthority = typeof PRESCRIPTION_PURPOSE_AUTHORITIES[number];

export const PRESCRIPTION_PURPOSE_SOURCE_KINDS = Object.freeze([
  "production_week_objective_lineage",
  "explicit_standalone_purpose",
  "typed_dependency",
  "legacy_compatibility_restricted",
  "unknown",
] as const);
export type PrescriptionPurposeSourceKind = typeof PRESCRIPTION_PURPOSE_SOURCE_KINDS[number];

export const PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES = Object.freeze([
  "purpose_resolved",
  "prescription_purpose_required",
  "prescription_purpose_lineage_invalid",
  "prescription_purpose_conflict",
  "prescription_purpose_policy_required",
  "prescription_purpose_policy_unavailable",
  "prescription_purpose_policy_conflict",
  "prescription_purpose_role_section_conflict",
  "prescription_purpose_dose_mode_unsupported",
  "prescription_purpose_goal_relationship_conflict",
  "prescription_policy_rule_unavailable",
] as const);
export type PrescriptionPurposeResolutionStatus =
  typeof PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES[number];

export const PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER = Object.freeze([
  "P0_contract_and_resolver_policy_truth",
  "P1_source_snapshot_and_lineage_truth",
  "P2_primary_and_supporting_purpose_truth",
  "P3_section_and_role_compatibility",
  "P4_dose_mode_and_exercise_knowledge_legality",
  "P5_equipment_context_and_goal_compatibility",
  "P6_supported_use_case_mapping",
  "P7_numeric_policy_rule_lookup",
  "P8_compilation_and_block_construction",
  "P9_final_no_fallback_verdict",
] as const);

export const PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES = Object.freeze([
  "movement_quality_development",
  "muscular_endurance_development",
  "systemic_conditioning_development",
  "power_development",
] as const satisfies readonly PrescriptionLocalPurpose[]);
