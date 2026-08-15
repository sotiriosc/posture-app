import type { ProgressionAxis } from "../domain/progression";
import type { ProductionLongitudinalAdaptationActionDirective,
  ProductionLongitudinalApplicationValidationResult } from "../longitudinalAdaptation/contracts";
import type { ProductionLongitudinalAction, ProductionLongitudinalActionOwner,
  ProductionLongitudinalPrescriptionDimension } from "../longitudinalAdaptation/policies/policyContracts";
import type { ProductionPhaseContinuityResult } from "../phaseContinuity/contracts";
import type { ProductionPhaseProgramSnapshot } from "../phaseContinuity/programSnapshot";
import type { ProductionWeekAllocationPlan, ProductionRemainingWeekReallocationInput,
  ProductionRemainingWeekReallocationResult } from "../weekPlanning/contracts";

export const ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_ID =
  "ADAPTATION_APPLICATION_ORCHESTRATION" as const;
export const ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION = "1.0.0" as const;
export const ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_ID,
  contractVersion: ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION,
});
export const ADAPTATION_APPLICATION_ORCHESTRATION_STATUS =
  "ADAPTATION_APPLICATION_ORCHESTRATION_V1_IMPLEMENTED_NOT_ACTIVATED" as const;
export const ADAPTATION_APPLICATION_ORCHESTRATION_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const ADAPTATION_APPLICATION_ORCHESTRATION_CLASSIFICATION =
  "ADAPTATION_APPLICATION_ORCHESTRATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION" as const;
export const ADAPTATION_APPLICATION_ORCHESTRATION_ONTOLOGY_CLASSIFICATION =
  "TARGETED_ADAPTATION_APPLICATION_ORCHESTRATION_DOMAIN_FIXES_REQUIRED" as const;
export const UNSUPPORTED_ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION =
  "UNSUPPORTED_ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION" as const;

export interface VersionedOrchestrationContractReference {
  readonly contractId: string;
  readonly contractVersion: string;
}

export const ADAPTATION_APPLICATION_ORCHESTRATION_MODES = Object.freeze([
  "validate_only", "build_shadow_candidate", "build_and_persist_shadow_result",
] as const);
export type AdaptationApplicationOrchestrationMode =
  typeof ADAPTATION_APPLICATION_ORCHESTRATION_MODES[number];

export const ADAPTATION_APPLICATION_ORCHESTRATION_STATUSES = Object.freeze([
  "no_change_shadow_validated", "shadow_candidate_validated", "shadow_candidate_validated_persisted",
  "pending_confirmation", "pending_human_review", "pending_policy", "owner_unavailable", "blocked_stale",
  "blocked_conflict", "blocked_safety", "directive_invalid", "decision_invalid", "target_inactive",
  "owner_result_invalid", "downstream_rebuild_required", "downstream_validation_failed",
  "application_scope_invalid", "idempotent_prior_result", "persistence_failed",
  "unsupported_orchestration_contract", "invalid_orchestration_revision_context",
] as const);
export type ProductionAdaptationApplicationOrchestrationStatus =
  typeof ADAPTATION_APPLICATION_ORCHESTRATION_STATUSES[number];

export const PRODUCTION_ADAPTATION_APPLICATION_PRECONDITION_STATES = Object.freeze([
  "preconditions_satisfied", "blocked_stale", "blocked_conflict", "blocked_safety", "pending_confirmation",
  "pending_policy", "owner_unavailable", "directive_not_final", "decision_not_final", "target_inactive",
  "invalid_revision_context", "idempotent_prior_result", "invalid_request",
] as const);
export type ProductionAdaptationApplicationPreconditionState =
  typeof PRODUCTION_ADAPTATION_APPLICATION_PRECONDITION_STATES[number];

export type MaterialChangeConfirmationState =
  | "shadow_authorized_live_confirmation_absent"
  | "not_required_no_change"
  | "live_confirmation_absent"
  | "unknown";

export interface ProductionAdaptationApplicationCurrentRevisions {
  readonly sourceSnapshotRevisionId: string;
  readonly programSnapshotRevisionId: string;
  readonly weekSourceSnapshotRevisionId: string;
  readonly weekHorizonRevisionId: string;
  readonly weeklyIntentRevisionId: string;
  readonly weekPlanRevisionId: string;
  readonly prescriptionRevisionId: string | null;
  readonly sequenceRevisionId: string | null;
  readonly phaseStateRevisionId: string;
  readonly phaseResultRevisionId: string;
  readonly safetySnapshotRevisionId: string;
}

export type AdaptationApplicationOrchestrationRequestId = string;
export type AdaptationApplicationOrchestrationRequestRevisionId = string;

export interface ProductionAdaptationApplicationOrchestrationRequest {
  readonly orchestrationContract: typeof ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE;
  readonly mode: AdaptationApplicationOrchestrationMode;
  readonly requestId: AdaptationApplicationOrchestrationRequestId;
  readonly requestRevisionId: AdaptationApplicationOrchestrationRequestRevisionId;
  readonly basedOnRequestRevisionId: string | null;
  readonly orchestrationAttemptId: string;
  readonly athleteId: string;
  readonly authenticatedPrincipalOrServiceId: string;
  readonly longitudinalDecisionId: string;
  readonly longitudinalDecisionRevisionId: string;
  readonly directiveId: string;
  readonly directiveRevisionId: string;
  readonly targetId: string;
  readonly targetScope: string;
  readonly expectedCurrentRevisions: ProductionAdaptationApplicationCurrentRevisions;
  readonly requestedOwner: Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">;
  readonly ownerPortReference: VersionedOrchestrationContractReference;
  readonly requestedAppliedDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly confirmationState: MaterialChangeConfirmationState;
  readonly idempotencyKey: string;
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationPreconditionSnapshot {
  readonly directiveFinalAndActive: boolean;
  readonly decisionFinalAndActive: boolean;
  readonly targetStillActive: boolean;
  readonly actualCurrentRevisions: ProductionAdaptationApplicationCurrentRevisions;
  readonly newerConflictingSourceRecordAbsent: boolean;
  readonly newerLongitudinalDecisionForTargetAbsent: boolean;
  readonly requiredPolicyVersionsAvailable: boolean;
  readonly ownerPortAvailable: boolean;
  readonly shadowAuthorizationPresent: boolean;
  readonly liveConfirmationAbsentOrNotApplicable: boolean;
  readonly idempotencyKeyUnused: boolean;
  readonly safetyAllowsMaterialOwnerCall: boolean;
  readonly evaluationTimeValid: boolean;
}

export interface ProductionAdaptationApplicationPreconditionResult {
  readonly state: ProductionAdaptationApplicationPreconditionState;
  readonly satisfied: boolean;
  readonly failedPreconditions: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly silentRebasePerformed: false;
}

export const PRODUCTION_ADAPTATION_APPLICATION_OWNER_RESULT_STATUSES = Object.freeze([
  "proposed_prescription_revision", "no_change_remains_correct", "prescription_resolution_required",
  "prescription_policy_required", "prescription_policy_conflict", "axis_not_realizable",
  "current_prescription_stale", "candidate_selection_reopened_and_composed", "same_identity_remains_best",
  "no_legal_equivalent_candidate", "candidate_review_required", "composer_infeasible", "search_inconclusive",
  "revised_week_plan_candidate", "week_reallocation_not_required", "week_reallocation_infeasible",
  "week_reallocation_policy_required", "week_reallocation_blocked", "week_downstream_rebuild_required",
  "week_deload_policy_required", "phase_review_candidate", "external_safety_review_required",
  "no_change_shadow_disposition", "human_review_required", "target_inactive", "owner_input_invalid",
] as const);
export type ProductionAdaptationApplicationOwnerResultStatus =
  typeof PRODUCTION_ADAPTATION_APPLICATION_OWNER_RESULT_STATUSES[number];

export interface ProductionAdaptationApplicationOwnerResult {
  readonly ownerContract: VersionedOrchestrationContractReference;
  readonly owner: Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">;
  readonly action: ProductionLongitudinalAction;
  readonly targetId: string;
  readonly status: ProductionAdaptationApplicationOwnerResultStatus;
  readonly currentEntityRevisions: Readonly<Record<string, string>>;
  readonly proposedEntityRevisions: Readonly<Record<string, string>>;
  readonly changedTargetIds: readonly string[];
  readonly changedDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly unchangedEntityIds: readonly string[];
  readonly unresolvedRequirements: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly selectedAxis: ProgressionAxis | null;
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot | null;
  readonly proposedWeekPlan: ProductionWeekAllocationPlan | null;
  readonly proposedPhaseResult: ProductionPhaseContinuityResult | null;
  readonly candidateSelectionReopened: boolean;
  readonly weekReallocationClaimed: boolean;
  readonly phaseReviewClaimed: boolean;
  readonly actionPersisted: boolean;
  readonly ownerResultFingerprint: string;
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationOwnerRegistryEntry {
  readonly owner: Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">;
  readonly ownerContract: VersionedOrchestrationContractReference;
  readonly supportedActions: readonly ProductionLongitudinalAction[];
  readonly availability: "available" | "pending_policy" | "unavailable";
  readonly proposedResultContract: VersionedOrchestrationContractReference;
  readonly requiredPolicyReferences: readonly VersionedOrchestrationContractReference[];
  readonly requiredCurrentRevisionKeys: readonly (keyof ProductionAdaptationApplicationCurrentRevisions)[];
  readonly canBuildProgramCandidate: boolean;
  readonly canApplyLiveMutation: false;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationOwnerRegistry {
  readonly registryReference: VersionedOrchestrationContractReference;
  readonly entries: readonly ProductionAdaptationApplicationOwnerRegistryEntry[];
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationOrchestrationPolicy {
  readonly reference: VersionedOrchestrationContractReference;
  readonly state: "OWNER_SELECTED_FOR_INACTIVE_PRODUCTION_ORCHESTRATION";
  readonly rules: readonly string[];
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationConfirmationPolicy {
  readonly reference: VersionedOrchestrationContractReference;
  readonly shadowEvaluationAuthorization: "explicit_without_live_consent";
  readonly liveApplicationConfirmation: "not_implemented";
  readonly materialActions: readonly ProductionLongitudinalAction[];
  readonly noChangeActions: readonly ProductionLongitudinalAction[];
  readonly provenance: readonly string[];
}

export type AdaptationApplicationShadowCandidateId = string;
export type AdaptationApplicationShadowCandidateRevisionId = string;

export interface ProductionAdaptationApplicationDownstreamValidation {
  readonly status: "validated" | "not_required" | "incomplete" | "failed";
  readonly gate13Status: "passed" | "not_required" | "incomplete" | "failed";
  readonly prescriptionValid: boolean | null;
  readonly sequencingValid: boolean | null;
  readonly weekValid: boolean | null;
  readonly phaseSnapshotValid: boolean | null;
  readonly reasonCodes: readonly string[];
  readonly validationFingerprint: string;
}

export interface ProductionAdaptationApplicationLocalityTrace {
  readonly targetChangedAsAuthorized: boolean;
  readonly authorizedDimensionsChanged: boolean;
  readonly dependentChanges: readonly string[];
  readonly unrelatedTargetsUnchanged: boolean;
  readonly unrelatedSessionsUnchanged: boolean;
  readonly unrelatedWeekObjectivesUnchanged: boolean;
  readonly productiveAnchorsRetained: boolean;
  readonly warmupActivationDependencyTruthRetained: boolean;
  readonly currentGoalRetained: boolean;
  readonly phaseStateUnapplied: boolean;
  readonly weekPlanUnchangedUnlessReallocationCandidate: boolean;
  readonly actualLiveStateUnchanged: true;
  readonly reasonCodes: readonly string[];
}

export interface ProductionAdaptationApplicationShadowCandidate {
  readonly shadowCandidateId: AdaptationApplicationShadowCandidateId;
  readonly shadowCandidateRevisionId: AdaptationApplicationShadowCandidateRevisionId;
  readonly basedOnShadowCandidateRevisionId: string | null;
  readonly orchestrationRequestId: string;
  readonly orchestrationRequestRevisionId: string;
  readonly directiveId: string;
  readonly directiveRevisionId: string;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot | null;
  readonly currentWeekPlan: ProductionWeekAllocationPlan | null;
  readonly proposedWeekPlan: ProductionWeekAllocationPlan | null;
  readonly currentPhaseResult: ProductionPhaseContinuityResult | null;
  readonly proposedPhaseResult: ProductionPhaseContinuityResult | null;
  readonly entityMappings: readonly { readonly currentEntityId: string; readonly proposedEntityId: string }[];
  readonly changedTargetIds: readonly string[];
  readonly claimedAppliedDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly candidateSelectionReopened: boolean;
  readonly weekReallocationClaimed: boolean;
  readonly phaseReviewClaimed: boolean;
  readonly actionPersisted: boolean;
  readonly downstreamValidation: ProductionAdaptationApplicationDownstreamValidation;
  readonly localityTrace: ProductionAdaptationApplicationLocalityTrace;
  readonly applicationApplied: false;
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export type ProductionAdaptationApplicationOrchestrationId = string;
export type ProductionAdaptationApplicationOrchestrationRevisionId = string;

export interface ProductionAdaptationApplicationOrchestrationRevision {
  readonly orchestrationId: ProductionAdaptationApplicationOrchestrationId;
  readonly orchestrationRevisionId: ProductionAdaptationApplicationOrchestrationRevisionId;
  readonly basedOnOrchestrationRevisionId: string | null;
  readonly finalForOrchestrationAttempt: true;
  readonly requestId: string;
  readonly requestRevisionId: string;
  readonly owner: Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">;
  readonly ownerResultFingerprint: string | null;
  readonly proposedProgramRevisionId: string | null;
  readonly validationFingerprint: string | null;
  readonly persistenceState: "not_requested" | "pending" | "persisted" | "failed";
  readonly evaluationTime: string;
}

export interface ProductionAdaptationApplicationOrchestrationResult {
  readonly status: ProductionAdaptationApplicationOrchestrationStatus;
  readonly request: ProductionAdaptationApplicationOrchestrationRequest;
  readonly preconditions: ProductionAdaptationApplicationPreconditionResult;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult | null;
  readonly shadowCandidate: ProductionAdaptationApplicationShadowCandidate | null;
  readonly longitudinalApplicationValidation: ProductionLongitudinalApplicationValidationResult | null;
  readonly orchestrationRevision: ProductionAdaptationApplicationOrchestrationRevision;
  readonly reasonCodes: readonly string[];
  readonly primaryOwnerInvocationCount: 0 | 1;
  readonly supportingOwnerInvocationCount: number;
  readonly applicationApplied: false;
  readonly productMutationApplied: false;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationApplicationOrchestrationInput {
  readonly request: ProductionAdaptationApplicationOrchestrationRequest;
  readonly directive: ProductionLongitudinalAdaptationActionDirective;
  readonly preconditionSnapshot: ProductionAdaptationApplicationPreconditionSnapshot;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly currentWeekPlan: ProductionWeekAllocationPlan | null;
  readonly currentPhaseResult: ProductionPhaseContinuityResult | null;
  readonly entityMappings: readonly { readonly currentEntityId: string; readonly proposedEntityId: string }[];
  readonly weekReallocationInput?: ProductionRemainingWeekReallocationInput;
  readonly precomputedWeekReallocationResult?: ProductionRemainingWeekReallocationResult;
}

export interface ProductionAdaptationApplicationOrchestrationAuditEvent {
  readonly auditEventId: string;
  readonly athleteId: string;
  readonly principalOrServiceId: string;
  readonly requestId: string;
  readonly requestRevisionId: string;
  readonly directiveRevisionId: string;
  readonly decisionRevisionId: string;
  readonly currentRevisions: ProductionAdaptationApplicationCurrentRevisions;
  readonly owner: string;
  readonly ownerPortReference: VersionedOrchestrationContractReference;
  readonly policyReferences: readonly VersionedOrchestrationContractReference[];
  readonly preconditionState: ProductionAdaptationApplicationPreconditionState;
  readonly ownerResultFingerprint: string | null;
  readonly shadowCandidateRevisionId: string | null;
  readonly validationFingerprint: string | null;
  readonly finalUnappliedStatus: ProductionAdaptationApplicationOrchestrationStatus;
  readonly operationTime: string;
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}
