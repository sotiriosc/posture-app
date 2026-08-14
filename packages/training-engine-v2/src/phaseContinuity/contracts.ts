import type { PhaseId } from "../domain/phase";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type {
  ExplicitPhaseContinuityPolicyInput,
  PhaseContinuityPolicyReference,
  ProductionPhaseCriterionDefinition,
  ProductionPhaseContinuityPolicy,
} from "./policies";
import type {
  ProductionPhaseCriterionEvidenceRecord,
  ProductionPhaseEvidenceSnapshot,
  ProductionPhaseEvidenceSourceContractReference,
} from "./sourceContracts";
import type { ProductionPhaseProgramSnapshot } from "./programSnapshot";

export const PRODUCTION_PHASE_CONTINUITY_CONTRACT_ID =
  "PRODUCTION_PHASE_CONTINUITY_KERNEL" as const;
export const PRODUCTION_PHASE_CONTINUITY_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_PHASE_CONTINUITY_KERNEL_STATUS =
  "PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_PHASE_CONTINUITY_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION =
  "PRODUCTION_PHASE_CONTINUITY_ONTOLOGY_READY" as const;
export const PRODUCTION_PHASE_CONTINUITY_IMPLEMENTATION_CLASSIFICATION =
  "PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION" as const;

export interface ProductionPhaseContinuityContractReference {
  readonly contractId: typeof PRODUCTION_PHASE_CONTINUITY_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_PHASE_CONTINUITY_CONTRACT_VERSION;
}

export const PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE:
ProductionPhaseContinuityContractReference = Object.freeze({
  contractId: PRODUCTION_PHASE_CONTINUITY_CONTRACT_ID,
  contractVersion: PRODUCTION_PHASE_CONTINUITY_CONTRACT_VERSION,
});

export const PRODUCTION_PHASE_CONTINUITY_STATUSES = [
  "remain_current_phase",
  "advance_to_next_phase_authorized",
  "hold_current_phase_pending_evidence",
  "hold_current_phase_due_blocker",
  "phase_regression_review_required",
  "phase_cycle_completion_owner_review_required",
  "transition_not_authorized",
  "transition_evidence_conflict",
  "transition_blocked_by_training_safety",
  "current_phase_state_invalid",
  "target_phase_invalid",
  "phase_program_alignment_ambiguous",
  "upstream_program_invalid",
  "phase_continuity_policy_required",
  "phase_continuity_policy_unavailable",
  "phase_continuity_policy_conflict",
  "phase_evidence_source_required",
  "phase_evidence_source_unavailable",
  "unsupported_phase_continuity_contract",
  "invalid_decision_revision_context",
  "longitudinal_owner_required",
] as const;
export type ProductionPhaseContinuityStatus = typeof PRODUCTION_PHASE_CONTINUITY_STATUSES[number];

export const PRODUCTION_PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS = [
  "PHASE_STAY_JUSTIFIED",
  "PHASE_ADVANCEMENT_AUTHORIZED",
  "PHASE_ADVANCEMENT_NOT_AUTHORIZED",
  "PHASE_HOLD_PENDING_EVIDENCE",
  "PHASE_HOLD_DUE_BLOCKER",
  "PHASE_TRANSITION_EVIDENCE_CONFLICT",
  "PHASE_REGRESSION_REVIEW_REQUIRED",
  "PHASE_CYCLE_COMPLETION_OWNER_REVIEW_REQUIRED",
  "PHASE_PROGRAM_CONTINUITY_PRESERVED",
  "PHASE_PROGRAM_LOCAL_CHANGE_JUSTIFIED",
  "PHASE_PROGRAM_EXCESSIVE_REGENERATION",
  "PHASE_PROGRAM_REQUIRED_CHANGE_MISSING",
  "PHASE_PROGRAM_ADAPTATION_ERASED",
  "PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS",
  "PHASE_WRONG_LAYER_EFFECT",
  "PHASE_COSMETIC_ONLY_CHANGE",
  "PHASE_DECISION_DEFERRED_TO_GATE_16",
  "PHASE_UPSTREAM_FAILED_SHADOW_ONLY",
  "PHASE_CONTINUITY_OVER_ADAPTATION",
] as const;
export type ProductionPhaseContinuityDetailedClassification =
  typeof PRODUCTION_PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS[number];

export const PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS = [
  "preserved_exact",
  "preserved_same_identity_modified_prescription",
  "preserved_same_assignment_resequenced",
  "preserved_reallocated_across_session",
  "added_due_new_active_objective",
  "added_due_new_active_need",
  "removed_due_inactive_objective",
  "removed_due_inactive_need",
  "changed_due_current_equipment",
  "changed_due_training_safety",
  "changed_due_structured_response_review",
  "changed_due_explicit_phase_policy",
  "changed_due_explicit_goal_or_week_policy",
  "replacement_consideration_only",
  "phase_fit_review_only",
  "intentionally_unmatched",
  "unexplained_change",
  "ambiguous_alignment",
] as const;
export type ProductionPhaseProgramContinuityClassification =
  typeof PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS[number];

export const PRODUCTION_PHASE_CHANGED_FACT_OWNERS = [
  "phase_policy", "goal_or_week_owner", "product_horizon", "equipment", "training_safety",
  "prescription", "response_receiver", "progression_review", "performance", "adherence",
  "longitudinal", "presentation",
] as const;
export type ProductionPhaseChangedFactOwner = typeof PRODUCTION_PHASE_CHANGED_FACT_OWNERS[number];

export const PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS = [
  "phase_policy", "phase_state", "program_framework", "productive_anchor", "supporting_dependency",
  "explicit_outcome_goal", "weekly_objective", "opportunity_schedule", "equipment_realization",
  "training_safety", "structured_response", "prescription_requirement", "progression_review",
  "performance_evidence", "adherence_evidence", "structural_capacity", "presentation_only",
  "longitudinal_deferred", "automatic_progression", "automatic_replacement", "automatic_rotation",
  "automatic_deload", "automatic_regression", "automatic_cycle_reset",
] as const;
export type ProductionPhaseChangedFactDimension = typeof PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS[number];

export const PRODUCTION_PHASE_CHANGED_FACT_REASON_CODES = [
  "explicit_phase_policy_applicability", "phase_state_observation", "athlete_goal_changed",
  "weekly_objective_changed", "opportunity_or_session_changed", "equipment_changed",
  "training_safety_changed", "structured_response_review", "prescription_requirement_changed",
  "progression_review_requested", "performance_evidence_revised", "adherence_evidence_revised",
  "structural_capacity_changed", "presentation_only_change", "deferred_to_longitudinal_owner",
  "productive_anchor_continuity", "supporting_dependency_changed", "automatic_action_prohibited",
  "intentional_unmatched_entity", "compatibility_projection",
] as const;
export type ProductionPhaseChangedFactReasonCode =
  typeof PRODUCTION_PHASE_CHANGED_FACT_REASON_CODES[number];

export type ProductionPhaseTransitionKind =
  | "stay" | "adjacent_advancement" | "regression_review" | "cycle_completion_review";
export type ProductionPhaseEntityKind =
  | "weekly_objective" | "opportunity" | "reservation" | "session" | "session_need"
  | "assignment" | "source_event" | "prescription" | "sequence_step";
export type ProductionPhaseMappingKind =
  | "exact_lineage" | "explicit_mapping" | "semantic_responsibility" | "intentional_unmatched";
export type ProductionPhaseProposalSource =
  | "phase_continuity_owner" | "coach_review" | "product_orchestration" | "compatibility_adapter";

export interface ProductionPhaseTransitionChangedFact {
  readonly factId: string;
  readonly owner: ProductionPhaseChangedFactOwner;
  readonly dimension: ProductionPhaseChangedFactDimension;
  readonly reasonCode: ProductionPhaseChangedFactReasonCode;
  readonly material: boolean;
  readonly sourceRef: string;
}

export interface ProductionPhaseTransitionEntityMapping {
  readonly entityKind: ProductionPhaseEntityKind;
  readonly currentEntityId: string;
  readonly proposedEntityId: string;
  readonly mappingKind: ProductionPhaseMappingKind;
  readonly reasonCode: ProductionPhaseChangedFactReasonCode;
  readonly sourceRef: string;
}

export interface ProductionPhaseTransitionProposal {
  readonly proposalId: string;
  readonly phaseCycleId: string;
  readonly currentPhaseStateRevisionId: string;
  readonly currentPhaseId: PhaseId;
  readonly proposedTargetPhaseId: PhaseId;
  readonly transitionKind: ProductionPhaseTransitionKind;
  readonly criterionDefinitionIds: readonly string[];
  readonly evidenceRecordIds: readonly string[];
  readonly blockerRecordIds: readonly string[];
  readonly proposedProgramSnapshotId: string;
  readonly changedFacts: readonly ProductionPhaseTransitionChangedFact[];
  readonly explicitEntityMappings: readonly ProductionPhaseTransitionEntityMapping[];
  readonly proposalSource: ProductionPhaseProposalSource;
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export type ProductionPhaseCycleStatus = "active" | "held" | "owner_review_required" | "completed";
export interface PhaseCycleIdentity {
  readonly phaseCycleId: string;
  readonly athleteId: string;
  readonly sourceProgramLineageId: string;
  readonly sourceHorizonLineageId: string;
  readonly cycleStatus: ProductionPhaseCycleStatus;
  readonly createdAt: string;
  readonly owner: "phase_cycle_owner" | "product_orchestration" | "compatibility_adapter";
  readonly sourceRef: string;
  readonly provenance: readonly string[];
}

export interface ProductionPhaseStateIdentity {
  readonly phaseStateId: string;
  readonly phaseCycleId: string;
  readonly athleteId: string;
  readonly createdAt: string;
  readonly owner: "phase_state_owner" | "product_orchestration" | "compatibility_adapter";
  readonly provenance: readonly string[];
}
export type ProductionPhaseStateRevisionStatus = "current" | "held" | "review" | "completed";
export const PRODUCTION_PHASE_STATE_REVISION_REASON_CODES = [
  "initial_state", "authorized_transition_candidate", "evidence_review", "safety_review",
  "response_review", "coach_review", "cycle_completion_review",
] as const;
export type ProductionPhaseStateRevisionReasonCode =
  typeof PRODUCTION_PHASE_STATE_REVISION_REASON_CODES[number];

export interface ProductionPhaseStateRevision {
  readonly phaseStateIdentity: ProductionPhaseStateIdentity;
  readonly phaseStateRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly currentPhaseId: PhaseId;
  readonly status: ProductionPhaseStateRevisionStatus;
  readonly reasonCode: ProductionPhaseStateRevisionReasonCode;
  readonly evidenceSnapshotId: string;
  readonly createdAt: string;
  readonly finalForDecision: boolean;
  readonly decisionAttemptId: string;
  readonly weekInPhaseObservation: number | null;
  readonly automaticAdvancementAuthority: false;
  readonly provenance: readonly string[];
}
export interface ProductionPhaseStateRevisionLedger {
  readonly phaseStateId: string;
  readonly revisions: readonly ProductionPhaseStateRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export const PRODUCTION_PHASE_DECISION_REVISION_REASON_CODES = [
  "initial_evaluation", "evidence_revision", "current_program_revision", "proposed_program_revision",
  "phase_state_revision", "safety_revision", "response_revision", "policy_revision", "coach_review",
] as const;
export type ProductionPhaseDecisionRevisionReasonCode =
  typeof PRODUCTION_PHASE_DECISION_REVISION_REASON_CODES[number];
export interface ProductionPhaseContinuityDecisionRevision {
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: ProductionPhaseDecisionRevisionReasonCode;
  readonly policyRef: PhaseContinuityPolicyReference | null;
  readonly evidenceSnapshotRevisionId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly proposedProgramSnapshotRevisionId: string;
  readonly phaseStateRevisionId: string;
  readonly createdAt: string;
  readonly final: boolean;
  readonly decisionContentFingerprint: string;
  readonly provenance: readonly string[];
}
export interface ProductionPhaseContinuityDecisionRevisionLedger {
  readonly decisionId: string;
  readonly revisions: readonly ProductionPhaseContinuityDecisionRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}
export interface ProductionPhaseContinuityDecisionRevisionContext {
  readonly ledger: ProductionPhaseContinuityDecisionRevisionLedger;
  readonly reasonCode: Exclude<ProductionPhaseDecisionRevisionReasonCode, "initial_evaluation">;
}

export interface ProductionPhaseCriterionEvaluation {
  readonly criterionId: string;
  readonly state: "met" | "blocked" | "conflict" | "insufficient" | "invalid" | "not_applicable";
  readonly acceptedEvidenceRecordIds: readonly string[];
  readonly rejectedEvidenceRecordIds: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface ProductionPhaseCrossHorizonAlignmentEntry {
  readonly entityKind: ProductionPhaseEntityKind;
  readonly currentEntityId: string | null;
  readonly proposedEntityId: string | null;
  readonly status: "exact_lineage_match" | "explicit_cross_horizon_mapping"
    | "semantic_responsibility_match" | "intentionally_unmatched" | "ambiguous_alignment";
  readonly continuityClassification: ProductionPhaseProgramContinuityClassification;
  readonly reasonCode: string;
}
export interface ProductionPhaseCrossHorizonAlignmentResult {
  readonly status: "aligned" | "ambiguous_alignment" | "invalid_alignment";
  readonly entries: readonly ProductionPhaseCrossHorizonAlignmentEntry[];
  readonly ambiguityCount: number;
  readonly invalidCount: number;
  readonly reasonCodes: readonly string[];
}

export interface ProductionPhaseContinuityMetricTrace {
  readonly frameworkRetentionRate: number;
  readonly objectiveRetentionRate: number;
  readonly sessionPurposeRetentionRate: number;
  readonly anchorRetentionRate: number;
  readonly exerciseIdentityRetentionRate: number;
  readonly samePrescriptionRate: number;
  readonly sameRepRate: number;
  readonly sameTempoRate: number;
  readonly sameSequenceRate: number;
  readonly warmupRetentionRate: number;
  readonly activationRetentionRate: number;
  readonly localChangeRate: number;
  readonly replacementConsiderationRate: number;
  readonly unexplainedChangeCount: number;
  readonly phaseOwnedChangeCount: number;
  readonly nonPhaseOwnedChangeCount: number;
}

export const PRODUCTION_PHASE_CONTINUITY_SUBGATES = [
  "15.0_contract_and_input_truth", "15.1_upstream_program_truth", "15.2_phase_state_truth",
  "15.3_evidence_truth", "15.4_transition_eligibility", "15.5_cross_horizon_alignment",
  "15.6_stable_base_continuity", "15.7_local_phase_owned_change",
  "15.8_supporting_continuity", "15.9_final_verdict",
] as const;
export type ProductionPhaseContinuitySubgate = typeof PRODUCTION_PHASE_CONTINUITY_SUBGATES[number];
export interface ProductionPhaseContinuitySubgateTrace {
  readonly subgate: ProductionPhaseContinuitySubgate;
  readonly state: "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export interface ProductionPhaseContinuityInput {
  readonly contractReference: ProductionPhaseContinuityContractReference;
  readonly policy: ExplicitPhaseContinuityPolicyInput;
  readonly availablePolicies?: readonly ProductionPhaseContinuityPolicy[];
  readonly evidenceSourceContract: ProductionPhaseEvidenceSourceContractReference;
  readonly evidenceSnapshot: ProductionPhaseEvidenceSnapshot | null;
  readonly phaseCycleIdentity: PhaseCycleIdentity;
  readonly phaseStateRevisionLedger: ProductionPhaseStateRevisionLedger;
  readonly currentPhaseStateRevision: ProductionPhaseStateRevision;
  readonly transitionProposal: ProductionPhaseTransitionProposal;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly criterionDefinitions: readonly ProductionPhaseCriterionDefinition[];
  readonly criterionEvidenceRecords: readonly ProductionPhaseCriterionEvidenceRecord[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly evaluationTime: string;
  readonly decisionAttemptId: string;
  readonly priorDecisionRevisionContext: ProductionPhaseContinuityDecisionRevisionContext | null;
  readonly runShadowDiagnosticsAfterFailure?: boolean;
}

export interface ProductionPhaseContinuityResult {
  readonly contractReference: ProductionPhaseContinuityContractReference;
  readonly policyReference: PhaseContinuityPolicyReference | null;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly decisionRevisionLedger: ProductionPhaseContinuityDecisionRevisionLedger;
  readonly phaseCycleId: string;
  readonly currentPhaseStateId: string;
  readonly currentPhaseStateRevisionId: string;
  readonly transitionProposalId: string;
  readonly currentProgramSnapshotId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly proposedProgramSnapshotId: string;
  readonly proposedProgramSnapshotRevisionId: string;
  readonly status: ProductionPhaseContinuityStatus;
  readonly detailedClassifications: readonly ProductionPhaseContinuityDetailedClassification[];
  readonly criterionEvaluations: readonly ProductionPhaseCriterionEvaluation[];
  readonly evidenceSufficiencyTrace: readonly string[];
  readonly blockers: readonly string[];
  readonly conflicts: readonly string[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly transitionEligibilityTrace: readonly string[];
  readonly crossHorizonAlignment: ProductionPhaseCrossHorizonAlignmentResult;
  readonly continuityClassifications: readonly ProductionPhaseProgramContinuityClassification[];
  readonly stableBaseTrace: readonly string[];
  readonly anchorTrace: readonly string[];
  readonly prescriptionContinuityTrace: readonly string[];
  readonly warmupActivationTrace: readonly string[];
  readonly replacementTrace: readonly string[];
  readonly rotationTrace: readonly string[];
  readonly phasePolicyTrace: readonly string[];
  readonly gate16DeferralTrace: readonly string[];
  readonly metrics: ProductionPhaseContinuityMetricTrace;
  readonly noRescueTrace: {
    readonly upstreamFailureObserved: boolean;
    readonly downstreamRescueAttempted: boolean;
    readonly downstreamRescueAccepted: false;
  };
  readonly firstFailingStage: ProductionPhaseContinuitySubgate | null;
  readonly subgateTrace: readonly ProductionPhaseContinuitySubgateTrace[];
  readonly shadowDiagnostics: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly proposedStateRevisionCandidate: ProductionPhaseStateRevision | null;
  readonly decisionAuthorized: boolean;
  readonly stateMutationApplied: false;
  readonly applicationOwnerRequired: true;
  readonly automaticProgressionCount: 0;
  readonly automaticReplacementCount: 0;
  readonly automaticRotationCount: 0;
  readonly automaticDeloadCount: 0;
  readonly genericPhaseWarmupCount: 0;
  readonly genericPhaseActivationCount: 0;
  readonly provenance: readonly string[];
}
