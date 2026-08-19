import type { ProductionAdaptationApplicationConfirmationPolicy,
  ProductionAdaptationApplicationOrchestrationPolicy } from "./contracts";

export const ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1 = Object.freeze({
  reference: Object.freeze({ contractId: "ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1_SHADOW_FIRST",
    contractVersion: "1.0.0" }),
  state: "OWNER_SELECTED_FOR_INACTIVE_PRODUCTION_ORCHESTRATION",
  rules: Object.freeze([
    "FINAL_DIRECTIVE_REQUIRED", "CURRENT_REVISIONS_REQUIRED", "EXPLICIT_OWNER_AND_PORT_REQUIRED",
    "EXPLICIT_POLICY_REQUIRED", "NO_SILENT_REBASE", "SHADOW_BEFORE_APPLICATION",
    "ONE_DIRECTIVE_TARGET", "ONE_PRIMARY_OWNER", "LOCAL_BEFORE_GLOBAL", "PRESERVE_UNRELATED_ENTITIES",
    "PRESERVE_PRODUCTIVE_ANCHORS", "PRESERVE_DEPENDENCY_OWNED_SUPPORTING_WORK",
    "FULL_DOWNSTREAM_VALIDATION", "NO_APPLIED_STATE", "UNKNOWN_OR_CONFLICT_BLOCKS", "SAFETY_PRECEDENCE",
  ]),
  applicationApplied: false,
  provenance: Object.freeze(["application-orchestration-policy:reviewed-shadow-first-v1"]),
} as const satisfies ProductionAdaptationApplicationOrchestrationPolicy);

export const ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1 = Object.freeze({
  reference: Object.freeze({ contractId: "ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1_EXPLICIT_MATERIAL_CHANGE",
    contractVersion: "1.0.0" }),
  shadowEvaluationAuthorization: "explicit_without_live_consent",
  liveApplicationConfirmation: "not_implemented",
  materialActions: Object.freeze([
    "progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review",
    "reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation",
    "week_reallocation_review", "deload_review", "phase_review",
  ]),
  noChangeActions: Object.freeze([
    "keep_current", "repeat_for_confirmation", "hold_current_prescription", "no_action_insufficient_evidence",
  ]),
  provenance: Object.freeze(["application-confirmation-policy:live-confirmation-not-implemented-v1"]),
} as const satisfies ProductionAdaptationApplicationConfirmationPolicy);
