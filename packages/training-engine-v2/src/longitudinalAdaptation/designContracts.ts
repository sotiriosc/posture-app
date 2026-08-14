import type { PhaseId } from "../domain/phase";
import type { SessionSection, TrainingRole } from "../domain/session";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type { ProgressionAxis } from "../domain/progression";
import type { ExerciseDose, ExerciseDoseMode } from "../prescription/dose";
import type {
  CompletionStatus,
  ExercisePerformanceTimingObservation,
  ExerciseSubstitutionRecord,
  ExecutionQualityObservation,
} from "../prescription/performanceOutcome";
import type { ProgressionReadinessTrace } from "../prescription/progressionEvidence";
import type { ProductionPhaseContinuityResult } from "../phaseContinuity/contracts";
import type { ProductionPhaseProgramSnapshot } from "../phaseContinuity/programSnapshot";
import type { TrainingResponseReceiverTrace } from "../trainingResponseReceiver";

export const LONGITUDINAL_ADAPTATION_CONTRACT_ID =
  "LONGITUDINAL_ADAPTATION_GATE_16_CONTRACT" as const;
export const LONGITUDINAL_ADAPTATION_CONTRACT_VERSION = "1.0.0" as const;
export const LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: LONGITUDINAL_ADAPTATION_CONTRACT_ID,
  contractVersion: LONGITUDINAL_ADAPTATION_CONTRACT_VERSION,
});
export const LONGITUDINAL_ADAPTATION_GATE_16_STATUS =
  "LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME" as const;
export const LONGITUDINAL_ADAPTATION_GATE_16_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;

export const LONGITUDINAL_ADAPTATION_POLICY_ID =
  "LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED" as const;
export const LONGITUDINAL_ADAPTATION_POLICY_VERSION = "1.0.0" as const;
export const LONGITUDINAL_ADAPTATION_POLICY_REFERENCE = Object.freeze({
  policyId: LONGITUDINAL_ADAPTATION_POLICY_ID,
  version: LONGITUDINAL_ADAPTATION_POLICY_VERSION,
});

export const LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY = Object.freeze([
  "CONTINUITY_BY_DEFAULT",
  "COMPLETED_EVIDENCE_BEFORE_CHANGE",
  "EXACT_REALIZATION_EVIDENCE_FIRST",
  "REPEATED_EVIDENCE_BEFORE_MATERIAL_CHANGE",
  "LOCAL_SCOPE_BEFORE_GLOBAL_CHANGE",
  "MINIMUM_CAUSALLY_SUFFICIENT_CHANGE",
  "PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT",
  "SUCCESSFUL_REEXPOSURE_PRESERVES_OPTIONS",
  "ONE_PRIMARY_ACTION_PER_TARGET",
  "NO_CALENDAR_PROGRESSION",
  "NO_PHASE_ONLY_PROGRESSION",
  "NO_NOVELTY_QUOTA",
  "NO_AUTOMATIC_ROTATION",
  "NO_AUTOMATIC_DELOAD",
  "NO_GOAL_REWRITE",
  "UNKNOWN_MEANS_HOLD",
  "CONFLICT_MEANS_REVIEW",
  "DECISION_SEPARATE_FROM_APPLICATION",
] as const);

export interface LongitudinalAdaptationPolicyV1 {
  readonly reference: typeof LONGITUDINAL_ADAPTATION_POLICY_REFERENCE;
  readonly state: "OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION";
  readonly philosophy: typeof LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY;
  readonly reviewer: "longitudinal_adaptation_policy_owner";
  readonly reviewedAt: string;
  readonly provenance: readonly string[];
}

export const LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED:
LongitudinalAdaptationPolicyV1 = Object.freeze({
  reference: LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  state: "OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION",
  philosophy: LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  reviewer: "longitudinal_adaptation_policy_owner",
  reviewedAt: "2026-08-14T16:00:00-04:00",
  provenance: Object.freeze([
    "owner-authorization:LONGITUDINAL_ADAPTATION_GATE_16_V1_ONTOLOGY_POLICY_AND_CAGT_ADMISSION",
  ]),
});

export const LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_ID =
  "LONGITUDINAL_OUTCOME_SOURCE_CONTRACT" as const;
export const LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION = "1.0.0" as const;
export const LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_ID,
  contractVersion: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION,
});

export const LONGITUDINAL_OUTCOME_SOURCE_OWNERS = Object.freeze([
  "exercise_performance_record",
  "completed_session_summary",
  "training_response_receiver",
  "recovery_summary",
  "adherence_summary",
  "progression_readiness",
  "training_safety",
  "phase_continuity",
  "coach_review",
  "clinician_restriction",
  "athlete_report",
  "planned_program_truth",
  "unknown",
] as const);
export type LongitudinalOutcomeSourceOwner = typeof LONGITUDINAL_OUTCOME_SOURCE_OWNERS[number];

export const LONGITUDINAL_OUTCOME_SIGNALS = Object.freeze([
  "productive_completion", "first_completed_exposure", "isolated_success", "repeated_success",
  "appropriate_challenge", "target_met", "target_partially_met", "target_failed",
  "repeated_target_failure", "quality_met", "quality_not_met", "tolerated_response",
  "limited_response", "adverse_response", "repeated_adverse_response", "successful_reexposure",
  "recovery_adequate", "recovery_concern", "recovery_unknown", "adherence_constraint",
  "progression_ready", "progression_not_ready", "plateau", "replacement_consideration",
  "prescription_review_attempted", "prescription_review_exhausted", "rotation_preference",
  "equivalent_candidate_pool", "week_reallocation_aggregate", "deload_review_aggregate",
  "phase_review_requested", "safety_block", "external_review_required", "mixed_evidence",
  "unknown_evidence",
] as const);
export type LongitudinalOutcomeSignal = typeof LONGITUDINAL_OUTCOME_SIGNALS[number];

export type LongitudinalEvidenceApplicability =
  | "EXACT_REALIZATION_EVIDENCE"
  | "RELATED_REALIZATION_EVIDENCE"
  | "EXERCISE_IDENTITY_HISTORY";

export interface LongitudinalRealizationContext {
  readonly exerciseId: string;
  readonly prescriptionId: string | null;
  readonly assignmentId: string | null;
  readonly doseMode: ExerciseDoseMode | null;
  readonly equipmentIds: readonly string[];
  readonly side: "left" | "right" | "bilateral" | "alternating" | "unknown" | null;
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly loadKey: string | null;
}

export interface LongitudinalOutcomeSourceRecord {
  readonly sourceRecordId: string;
  readonly owner: LongitudinalOutcomeSourceOwner;
  readonly sourceAuthority:
    | "test_design_explicit_source"
    | "caller_validated_summary"
    | "production_owner_trace"
    | "planned_program_validator"
    | "unknown";
  readonly athleteId: string;
  readonly targetId: string;
  readonly sourceExposureEventId: string | null;
  readonly sessionId: string | null;
  readonly occurredAt: string;
  readonly realization: LongitudinalRealizationContext | null;
  readonly applicability: LongitudinalEvidenceApplicability;
  readonly signals: readonly LongitudinalOutcomeSignal[];
  readonly reviewedAggregateSourceEventIds: readonly string[];
  readonly provenance: readonly string[];
}

export interface LongitudinalOutcomeSourceSnapshot {
  readonly contractReference: typeof LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE;
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly athleteId: string;
  readonly sourceRecords: readonly LongitudinalOutcomeSourceRecord[];
  readonly unresolvedSourceOwners: readonly LongitudinalOutcomeSourceOwner[];
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface CompletedExposureOutcomeLedgerEntry {
  readonly outcomeEntryId: string;
  readonly athleteId: string;
  readonly sourceExposureEventId: string;
  readonly originalAssignmentId: string;
  readonly originalExerciseId: string;
  readonly realizedExerciseId: string;
  readonly prescriptionId: string;
  readonly finalPrescriptionRevisionId: string;
  readonly sequencePlanId: string;
  readonly finalSequenceRevisionId: string;
  readonly plannedDoseReference: string;
  readonly actualPerformanceRecordId: string | null;
  readonly completionStatus: CompletionStatus;
  readonly actualDose: ExerciseDose | null;
  readonly actualDoseSource: "independently_observed" | "not_observed" | "planned_copy_invalid";
  readonly actualTiming: ExercisePerformanceTimingObservation | null;
  readonly actualTimingSource: "independently_observed" | "not_observed" | "planned_copy_invalid";
  readonly qualityObservations: readonly ExecutionQualityObservation[];
  readonly substitutionRecords: readonly ExerciseSubstitutionRecord[];
  readonly realizedStressExposureIds: readonly string[];
  readonly responseObservationIds: readonly string[];
  readonly recoveryEvidenceIds: readonly string[];
  readonly recoveryStatus:
    | "recovered_as_expected" | "recovery_concern" | "insufficient_observation" | "unknown";
  readonly sessionId: string;
  readonly opportunityId: string;
  readonly reservationId: string;
  readonly occurredAt: string;
  readonly sourceAuthority: "test_design_explicit_source" | "caller_validated_summary";
  readonly provenance: readonly string[];
}

export interface CompletedExposureOutcomeLedger {
  readonly ledgerId: string;
  readonly athleteId: string;
  readonly expectedSourceExposureEventIds: readonly string[];
  readonly entries: readonly CompletedExposureOutcomeLedgerEntry[];
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface CompletedExposureLedgerIntegrity {
  readonly expectedPlannedEventCount: number;
  readonly completedEventCount: number;
  readonly partialEventCount: number;
  readonly notPerformedEventCount: number;
  readonly substitutedEventCount: number;
  readonly unknownOutcomeCount: number;
  readonly duplicateOutcomeEntryCount: number;
  readonly missingOutcomeLinkCount: number;
  readonly orphanPerformanceRecordCount: number;
  readonly orphanResponseRecordCount: number;
  readonly wrongPrescriptionRevisionCount: number;
  readonly wrongSequenceRevisionCount: number;
  readonly crossSessionCollisionCount: number;
  readonly plannedAsActualCount: number;
  readonly reasonCodes: readonly string[];
}

export const LONGITUDINAL_TARGET_SCOPES = Object.freeze([
  "exact_realization", "prescription_lineage", "exercise_identity", "assignment_lineage",
  "session_need", "weekly_objective", "session", "week", "phase_review", "external_safety_review",
] as const);
export type LongitudinalTargetScope = typeof LONGITUDINAL_TARGET_SCOPES[number];

export interface LongitudinalAdaptationTarget {
  readonly targetId: string;
  readonly targetScope: LongitudinalTargetScope;
  readonly athleteId: string;
  readonly activeNeedIds: readonly string[];
  readonly activeObjectiveIds: readonly string[];
  readonly exerciseId: string | null;
  readonly assignmentId: string | null;
  readonly prescriptionId: string | null;
  readonly side: LongitudinalRealizationContext["side"];
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly loadKey: string | null;
  readonly doseMode: ExerciseDoseMode | null;
  readonly sessionId: string | null;
  readonly currentProgramSnapshotId: string;
  readonly currentPhaseId: PhaseId;
  readonly currentPhaseStateId: string;
  readonly active: boolean;
  readonly exerciseLegal: boolean;
  readonly productiveAnchor: boolean;
  readonly rotationEligible: boolean;
  readonly equivalentCandidatePoolAvailable: boolean;
  readonly legalProgressionAxes: readonly ProgressionAxis[];
  readonly supportedProgressionAxes: readonly ProgressionAxis[];
  readonly phasePreferredProgressionAxes: readonly ProgressionAxis[];
  readonly availableProgressionAxes: readonly ProgressionAxis[];
  readonly legalRegressionAxes: readonly ProgressionAxis[];
  readonly supportedRegressionAxes: readonly ProgressionAxis[];
  readonly implicatedPrescriptionDimensions: readonly string[];
  readonly requiredFuturePolicyRefs: readonly string[];
  readonly provenance: readonly string[];
}

export interface LongitudinalEvidenceWindow {
  readonly windowId: string;
  readonly targetId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly evaluationTime: string;
  readonly includedOutcomeEntryIds: readonly string[];
  readonly excludedOutcomeEntries: readonly { readonly outcomeEntryId: string; readonly reasonCode: string }[];
  readonly requiredSourceOwners: readonly LongitudinalOutcomeSourceOwner[];
  readonly recencyApplicabilityState: "current" | "superseded_visible" | "expired_visible" | "unknown";
  readonly distinctSourceEventCount: number;
  readonly distinctSessionCount: number;
  readonly distinctPrescriptionRealizationCount: number;
  readonly reviewedAggregateSourceEventIds: readonly string[];
  readonly provenance: readonly string[];
}

export const LONGITUDINAL_STATES = Object.freeze([
  "productive_continuity", "first_or_isolated_success", "repeated_success",
  "stable_appropriate_challenge", "stable_but_plateaued", "target_partially_met",
  "repeated_target_failure", "exact_realization_limited", "exact_realization_adverse",
  "adverse_across_related_realizations", "successful_reexposure", "recovery_concern",
  "adherence_constraint", "mixed_or_conflicting", "insufficient_evidence", "safety_blocked", "unknown",
] as const);
export type LongitudinalState = typeof LONGITUDINAL_STATES[number];

export interface LongitudinalEvidenceTrajectory {
  readonly orderedOutcomeEntryIds: readonly string[];
  readonly completionTrajectory: readonly CompletionStatus[];
  readonly doseTrajectory: readonly string[];
  readonly executionQualityTrajectory: readonly string[];
  readonly responseTrajectory: readonly LongitudinalOutcomeSignal[];
  readonly recoveryTrajectory: readonly string[];
  readonly adherenceTrajectory: readonly string[];
  readonly realizationChanges: readonly string[];
  readonly successfulReexposure: boolean;
  readonly plateauOrFailureEvidence: readonly string[];
  readonly mixedOrConflictingEvidence: readonly string[];
  readonly currentStrongestApplicableEvidence: LongitudinalEvidenceApplicability | null;
  readonly currentState: LongitudinalState;
  readonly sourceRecordIds: readonly string[];
  readonly provenance: readonly string[];
}

export const LONGITUDINAL_ACTIONS = Object.freeze([
  "keep_current", "repeat_for_confirmation", "hold_current_prescription",
  "prescription_modification_review", "progress_prescription_axis", "regress_prescription_axis",
  "reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation",
  "week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
  "owner_review_required", "no_action_insufficient_evidence",
] as const);
export type LongitudinalAction = typeof LONGITUDINAL_ACTIONS[number];

export interface LongitudinalActionCandidate {
  readonly candidateId: string;
  readonly action: LongitudinalAction;
  readonly targetId: string;
  readonly targetScope: LongitudinalTargetScope;
  readonly eligible: boolean;
  readonly selectedAxis: ProgressionAxis | null;
  readonly requiredEvidence: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly actionOwner: string;
  readonly applicationOwner: string;
  readonly continuityCost: "none" | "local" | "review_only" | "global_prohibited";
  readonly applicationBurden: "none" | "local_prescription" | "candidate_reopen" | "owner_review";
  readonly conflicts: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationThreadIdentity {
  readonly threadId: string;
  readonly athleteId: string;
  readonly targetScope: LongitudinalTargetScope;
  readonly activeNeedIds: readonly string[];
  readonly activeObjectiveIds: readonly string[];
  readonly exerciseId: string | null;
  readonly assignmentId: string | null;
  readonly prescriptionLineageId: string | null;
  readonly side: LongitudinalRealizationContext["side"];
  readonly phaseCycleId: string;
  readonly createdAt: string;
  readonly owner: "longitudinal_adaptation_owner" | "test_design_adapter";
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationStateIdentity {
  readonly stateId: string;
  readonly threadId: string;
  readonly athleteId: string;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationStateRevision {
  readonly stateIdentity: LongitudinalAdaptationStateIdentity;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly evidenceWindowId: string;
  readonly currentState: LongitudinalState;
  readonly currentAuthorizedOrPendingAction: LongitudinalAction;
  readonly evaluationTime: string;
  readonly decisionAttemptId: string;
  readonly finalForDecision: boolean;
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationStateRevisionLedger {
  readonly stateId: string;
  readonly revisions: readonly LongitudinalAdaptationStateRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export const LONGITUDINAL_DECISION_REVISION_REASON_CODES = Object.freeze([
  "initial_evaluation", "performance_evidence_revision", "response_evidence_revision",
  "recovery_evidence_revision", "adherence_evidence_revision", "progression_readiness_revision",
  "safety_revision", "phase_continuity_revision", "program_snapshot_revision", "policy_revision", "coach_review",
] as const);
export type LongitudinalDecisionRevisionReasonCode =
  typeof LONGITUDINAL_DECISION_REVISION_REASON_CODES[number];

export interface LongitudinalAdaptationDecisionRevision {
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: LongitudinalDecisionRevisionReasonCode;
  readonly policyReference: typeof LONGITUDINAL_ADAPTATION_POLICY_REFERENCE;
  readonly outcomeSnapshotRevisionId: string;
  readonly evidenceWindowId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly phaseContinuityDecisionRevisionId: string;
  readonly proposedApplicationSnapshotRevisionId: string | null;
  readonly stateRevisionId: string;
  readonly evaluationTime: string;
  readonly final: boolean;
  readonly decisionContentFingerprint: string;
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationDecisionRevisionLedger {
  readonly decisionId: string;
  readonly revisions: readonly LongitudinalAdaptationDecisionRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export interface LongitudinalAdaptationDecisionRevisionContext {
  readonly ledger: LongitudinalAdaptationDecisionRevisionLedger;
  readonly reasonCode: Exclude<LongitudinalDecisionRevisionReasonCode, "initial_evaluation">;
}

export interface LongitudinalAdaptationActionDirective {
  readonly directiveId: string;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly targetId: string;
  readonly targetScope: LongitudinalTargetScope;
  readonly action: LongitudinalAction;
  readonly selectedAxis: ProgressionAxis | null;
  readonly implicatedPrescriptionDimensions: readonly string[];
  readonly evidenceRecordIds: readonly string[];
  readonly sourceExposureEventIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly actionOwner: "longitudinal_adaptation_owner";
  readonly downstreamApplicationOwner:
    | "product_application" | "prescription_compiler" | "candidate_intelligence_and_composer"
    | "week_owner" | "phase_continuity_owner" | "training_safety_owner" | "human_owner_review";
  readonly requiredFuturePolicyReferences: readonly string[];
  readonly currentContinuityState: LongitudinalState;
  readonly unresolvedBlockers: readonly string[];
  readonly reviewState: "authorized_unapplied" | "review_required" | "insufficient_evidence";
  readonly decisionAuthorized: boolean;
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}

export interface LongitudinalAdaptationApplicationCandidate {
  readonly applicationCandidateId: string;
  readonly authorizedDirective: LongitudinalAdaptationActionDirective;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly explicitEntityMappings: readonly { readonly currentEntityId: string; readonly proposedEntityId: string }[];
  readonly claimedAppliedDimensions: readonly string[];
  readonly changedTargetIds: readonly string[];
  readonly applicationOwner: string;
  readonly applicationState: "not_applied" | "proposed_for_validation";
  readonly actionPersisted: boolean;
  readonly candidateSelectionReopened: boolean;
  readonly phaseMutationClaimed: boolean;
  readonly weekReallocationClaimed: boolean;
  readonly provenance: readonly string[];
}

export interface LongitudinalApplicationValidationResult {
  readonly status: "not_evaluated" | "valid_unapplied" | "valid_application_candidate" |
    "action_erased" | "action_scope_exceeded";
  readonly reasonCodes: readonly string[];
  readonly actionPersistenceCount: number;
  readonly scopeExceededCount: number;
}

export const LONGITUDINAL_GATE_16_SUBGATES = Object.freeze([
  "16.0_contract_and_fixture_truth", "16.1_upstream_validity",
  "16.2_completed_outcome_ledger_integrity", "16.3_evidence_applicability_and_chronology",
  "16.4_longitudinal_state", "16.5_action_candidate_eligibility",
  "16.6_action_selection_and_owner_boundary", "16.7_continuity_and_scope",
  "16.8_optional_application_validation", "16.9_final_longitudinal_verdict",
] as const);
export type LongitudinalGate16Subgate = typeof LONGITUDINAL_GATE_16_SUBGATES[number];

export interface LongitudinalGate16SubgateTrace {
  readonly subgate: LongitudinalGate16Subgate;
  readonly state: "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export const LONGITUDINAL_DETAILED_CLASSIFICATIONS = Object.freeze([
  "LONGITUDINAL_PRODUCTIVE_CONTINUITY_KEEP", "LONGITUDINAL_REPEAT_FOR_CONFIRMATION",
  "LONGITUDINAL_HOLD_INSUFFICIENT_EVIDENCE", "LONGITUDINAL_HOLD_MIXED_EVIDENCE",
  "LONGITUDINAL_PRESCRIPTION_MODIFICATION_REVIEW", "LONGITUDINAL_PROGRESSION_AXIS_AUTHORIZED",
  "LONGITUDINAL_REGRESSION_AXIS_AUTHORIZED", "LONGITUDINAL_REPLACEMENT_REVIEW_AUTHORIZED",
  "LONGITUDINAL_ROTATION_REVIEW_AUTHORIZED", "LONGITUDINAL_WEEK_REALLOCATION_REVIEW",
  "LONGITUDINAL_DELOAD_REVIEW", "LONGITUDINAL_PHASE_REVIEW", "LONGITUDINAL_EXTERNAL_SAFETY_REVIEW",
  "LONGITUDINAL_EVIDENCE_CONFLICT", "LONGITUDINAL_ACTION_CONFLICT",
  "LONGITUDINAL_ACTION_ERASED_DOWNSTREAM", "LONGITUDINAL_ACTION_SCOPE_EXCEEDED",
  "LONGITUDINAL_WRONG_LAYER_EFFECT", "LONGITUDINAL_OVER_ADAPTATION",
  "LONGITUDINAL_UNRESPONSIVE_TO_COMPLETED_EVIDENCE", "LONGITUDINAL_UPSTREAM_FAILED_SHADOW_ONLY",
  "LONGITUDINAL_OWNER_REQUIRED",
] as const);
export type LongitudinalDetailedClassification = typeof LONGITUDINAL_DETAILED_CLASSIFICATIONS[number];

export type LongitudinalGate16Status =
  | "longitudinal_decision_authorized"
  | "longitudinal_review_required"
  | "longitudinal_hold"
  | "longitudinal_insufficient_evidence"
  | "longitudinal_action_conflict"
  | "longitudinal_safety_blocked"
  | "longitudinal_upstream_invalid"
  | "longitudinal_contract_invalid"
  | "longitudinal_outcome_ledger_invalid"
  | "longitudinal_evidence_invalid"
  | "longitudinal_application_invalid";

export interface LongitudinalAdaptationGate16Input {
  readonly contractReference: typeof LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE;
  readonly authorityRegistry: {
    readonly reference: { readonly registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY"; readonly version: "5.0.0" };
    readonly gates: Readonly<Record<string, { readonly exactAuthority: string }>>;
  };
  readonly policy: LongitudinalAdaptationPolicyV1;
  readonly outcomeSourceContract: typeof LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE;
  readonly outcomeSourceSnapshot: LongitudinalOutcomeSourceSnapshot;
  readonly completedExposureLedger: CompletedExposureOutcomeLedger;
  readonly target: LongitudinalAdaptationTarget;
  readonly threadIdentity: LongitudinalAdaptationThreadIdentity;
  readonly evidenceWindow: LongitudinalEvidenceWindow;
  readonly stateRevisionLedger: LongitudinalAdaptationStateRevisionLedger;
  readonly currentStateRevision: LongitudinalAdaptationStateRevision;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly currentPhaseContinuityResult: ProductionPhaseContinuityResult;
  readonly upstreamGateStates: readonly { readonly gate: string; readonly state: "PASS" | "FAIL_STOP" }[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly trainingResponseReceiverTraces: readonly TrainingResponseReceiverTrace[];
  readonly progressionReadinessTraces: readonly ProgressionReadinessTrace[];
  readonly normalizedRecoverySummaryRecordIds: readonly string[];
  readonly normalizedAdherenceSummaryRecordIds: readonly string[];
  readonly optionalApplicationCandidate: LongitudinalAdaptationApplicationCandidate | null;
  readonly evaluationTime: string;
  readonly decisionAttemptId: string;
  readonly priorDecisionRevisionContext: LongitudinalAdaptationDecisionRevisionContext | null;
  readonly runShadowDiagnosticsAfterFailure?: boolean;
}

export interface LongitudinalAdaptationGate16Result {
  readonly contractReference: typeof LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE;
  readonly authorityRegistryReference: { readonly registryId: string; readonly version: string };
  readonly policyReference: typeof LONGITUDINAL_ADAPTATION_POLICY_REFERENCE;
  readonly outcomeSourceReference: typeof LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE;
  readonly threadId: string;
  readonly stateId: string;
  readonly stateRevisionId: string;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly decisionRevisionLedger: LongitudinalAdaptationDecisionRevisionLedger;
  readonly target: LongitudinalAdaptationTarget;
  readonly evidenceWindow: LongitudinalEvidenceWindow;
  readonly completedLedgerIntegrity: CompletedExposureLedgerIntegrity;
  readonly evidenceApplicability: readonly { readonly sourceRecordId: string;
    readonly applicability: LongitudinalEvidenceApplicability; readonly accepted: boolean;
    readonly reasonCodes: readonly string[] }[];
  readonly trajectory: LongitudinalEvidenceTrajectory;
  readonly currentStateClassification: LongitudinalState;
  readonly actionCandidates: readonly LongitudinalActionCandidate[];
  readonly selectedPrimaryAction: LongitudinalAction | null;
  readonly actionDirective: LongitudinalAdaptationActionDirective | null;
  readonly detailedClassifications: readonly LongitudinalDetailedClassification[];
  readonly blockers: readonly string[];
  readonly conflicts: readonly string[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly responseTrace: readonly string[];
  readonly progressionReadinessTrace: readonly string[];
  readonly continuityTrace: readonly string[];
  readonly reexposureTrace: readonly string[];
  readonly replacementRotationTrace: readonly string[];
  readonly ownerDeferralTrace: readonly string[];
  readonly applicationValidation: LongitudinalApplicationValidationResult;
  readonly firstFailingSubgate: LongitudinalGate16Subgate | null;
  readonly subgateTrace: readonly LongitudinalGate16SubgateTrace[];
  readonly shadowDiagnostics: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly status: LongitudinalGate16Status;
  readonly decisionAuthorized: boolean;
  readonly programMutationApplied: false;
  readonly prescriptionMutationApplied: false;
  readonly exerciseReplacementApplied: false;
  readonly rotationApplied: false;
  readonly deloadApplied: false;
  readonly weekReallocationApplied: false;
  readonly phaseMutationApplied: false;
  readonly applicationOwnerRequired: true;
  readonly provenance: readonly string[];
}

export interface LongitudinalHoldoutDescriptor {
  readonly scenarioId: string;
  readonly category:
    | "keep_repeat_hold" | "progression" | "regression_modification" | "replacement_review"
    | "rotation_review" | "week_deload_phase_safety_review" | "no_rescue_mutation";
  readonly expectedAction: LongitudinalAction | null;
  readonly expectedStatus: LongitudinalGate16Status;
  readonly expectedFirstFailingSubgate: LongitudinalGate16Subgate | null;
  readonly evidenceMode: string;
  readonly progressionAxis: ProgressionAxis | null;
  readonly exerciseId: string;
  readonly doseMode: ExerciseDoseMode;
  readonly section: SessionSection;
  readonly trainingRole: TrainingRole;
  readonly phaseId: PhaseId;
  readonly opportunityCount: 1 | 2 | 3 | 4 | 5 | 6;
  readonly genuineCompletedEvidenceHistory: boolean;
  readonly mutationKind: string;
}
