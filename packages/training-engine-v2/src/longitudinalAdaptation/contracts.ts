import type { PhaseId } from "../domain/phase";
import type { ProgressionAxis } from "../domain/progression";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type { ExerciseDoseMode } from "../prescription/dose";
import type { ProgressionReadinessTrace } from "../prescription/progressionEvidence";
import type { ProductionPhaseContinuityResult } from "../phaseContinuity/contracts";
import type { ProductionPhaseProgramSnapshot } from "../phaseContinuity/programSnapshot";
import type { TrainingResponseReceiverTrace } from "../trainingResponseReceiver";
import type {
  ExplicitProductionLongitudinalAdaptationPolicyInput,
  ProductionLongitudinalAction,
  ProductionLongitudinalActionOwner,
  ProductionLongitudinalAdaptationPolicy,
  ProductionLongitudinalAdaptationPolicyReference,
  ProductionLongitudinalPrescriptionDimension,
} from "./policies/policyContracts";
import type {
  ProductionExercisePerformanceBlockLinkage,
  ProductionLongitudinalEventCompletionState,
} from "./blockPerformance";
import type {
  ProductionLongitudinalEvidenceApplicability,
  ProductionLongitudinalOutcomeSignal,
  ProductionLongitudinalOutcomeSourceContractReference,
  ProductionLongitudinalOutcomeSourceOwner,
  ProductionLongitudinalOutcomeSourceSnapshot,
  ProductionLongitudinalRealizationContext,
  ProductionLongitudinalRealizationDifference,
} from "./sourceContracts";
import type { ProductionLongitudinalSourceRevisionTrace } from "./sourceRevisions";

export const PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_ID =
  "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_ID,
  contractVersion: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_VERSION,
});
export type ProductionLongitudinalAdaptationContractReference =
  typeof PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_STATUS =
  "PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_ONTOLOGY_AUDIT_CLASSIFICATION =
  "TARGETED_PRODUCTION_LONGITUDINAL_ADAPTATION_DOMAIN_FIXES_REQUIRED" as const;

export const PRODUCTION_LONGITUDINAL_TARGET_SCOPES = Object.freeze([
  "exact_realization", "prescription_lineage", "exercise_identity", "assignment_lineage", "session_need",
  "weekly_objective", "session", "week", "phase_review", "external_safety_review",
] as const);
export type ProductionLongitudinalTargetScope = typeof PRODUCTION_LONGITUDINAL_TARGET_SCOPES[number];

export interface ProductionLongitudinalAdaptationTarget {
  readonly targetId: string;
  readonly targetScope: ProductionLongitudinalTargetScope;
  readonly athleteId: string;
  readonly activeNeedIds: readonly string[];
  readonly activeObjectiveIds: readonly string[];
  readonly exerciseId: string | null;
  readonly assignmentLineageId: string | null;
  readonly prescriptionLineageId: string | null;
  readonly side: ProductionLongitudinalRealizationContext["side"];
  readonly laterality: ProductionLongitudinalRealizationContext["laterality"];
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly leverKey: string | null;
  readonly loadKey: string | null;
  readonly effortKey: string | null;
  readonly tempoKey: string | null;
  readonly restKey: string | null;
  readonly equipmentIds: readonly string[];
  readonly plannedBlockIds: readonly string[];
  readonly doseMode: ExerciseDoseMode | null;
  readonly sessionId: string | null;
  readonly currentProgramSnapshotId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly currentPhaseId: PhaseId;
  readonly currentPhaseStateId: string;
  readonly currentPhaseStateRevisionId: string;
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
  readonly implicatedPrescriptionDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly requiredFuturePolicyReferences: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductionCompletedExposureOutcomeLedgerEntry {
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
  readonly plannedBlockIds: readonly string[];
  readonly blockPerformance: ProductionExercisePerformanceBlockLinkage | null;
  readonly eventCompletionState: ProductionLongitudinalEventCompletionState;
  readonly substitutionLineage: readonly string[];
  readonly realizedStressExposureIds: readonly string[];
  readonly responseObservationIds: readonly string[];
  readonly recoveryEvidenceIds: readonly string[];
  readonly recoveryStatus: "recovered_as_expected" | "recovery_concern" | "insufficient_observation" | "unknown";
  readonly sessionId: string;
  readonly opportunityId: string;
  readonly reservationId: string;
  readonly occurredAt: string;
  readonly sourceRecordRevisionIds: readonly string[];
  readonly sourceAuthority: "caller_validated_production_source";
  readonly provenance: readonly string[];
}

export interface ProductionCompletedExposureOutcomeLedger {
  readonly ledgerId: string;
  readonly athleteId: string;
  readonly expectedSourceExposureEventIds: readonly string[];
  readonly entries: readonly ProductionCompletedExposureOutcomeLedgerEntry[];
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface ProductionCompletedExposureLedgerIntegrity {
  readonly expectedPlannedEventCount: number;
  readonly observedOutcomeEventCount: number;
  readonly completedEventCount: number;
  readonly partialEventCount: number;
  readonly notPerformedEventCount: number;
  readonly substitutedEventCount: number;
  readonly unknownOutcomeCount: number;
  readonly duplicateOutcomeEntryCount: number;
  readonly missingOutcomeLinkCount: number;
  readonly orphanPerformanceRecordCount: number;
  readonly orphanResponseRecordCount: number;
  readonly orphanBlockResultCount: number;
  readonly wrongPrescriptionRevisionCount: number;
  readonly wrongSequenceRevisionCount: number;
  readonly crossSessionCollisionCount: number;
  readonly plannedAsActualCount: number;
  readonly prescribedTimingAsActualCount: number;
  readonly multiBlockFlatteningCount: number;
  readonly reasonCodes: readonly string[];
}

export interface ProductionLongitudinalEvidenceWindow {
  readonly windowId: string;
  readonly targetId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly evaluationTime: string;
  readonly includedOutcomeEntryIds: readonly string[];
  readonly excludedOutcomeEntries: readonly {
    readonly outcomeEntryId: string;
    readonly reasonCode: "before_window" | "after_window" | "future_evidence" | "target_mismatch" |
      "superseded_visible" | "withdrawn_visible" | "source_invalid";
  }[];
  readonly requiredSourceOwners: readonly ProductionLongitudinalOutcomeSourceOwner[];
  readonly recencyApplicabilityState: "current" | "superseded_visible" | "expired_visible" | "unknown";
  readonly distinctSourceEventCount: number;
  readonly distinctSessionCount: number;
  readonly distinctRealizationCount: number;
  readonly reviewedAggregateSourceEventIds: readonly string[];
  readonly provenance: readonly string[];
}

export const PRODUCTION_LONGITUDINAL_STATES = Object.freeze([
  "productive_continuity", "first_or_isolated_success", "repeated_success", "stable_appropriate_challenge",
  "stable_but_plateaued", "target_partially_met", "repeated_target_failure", "exact_realization_limited",
  "exact_realization_adverse", "adverse_across_related_realizations", "successful_reexposure",
  "recovery_concern", "adherence_constraint", "mixed_or_conflicting", "insufficient_evidence",
  "safety_blocked", "unknown",
] as const);
export type ProductionLongitudinalState = typeof PRODUCTION_LONGITUDINAL_STATES[number];

export interface ProductionLongitudinalEvidenceTrajectory {
  readonly orderedOutcomeEntryIds: readonly string[];
  readonly blockCompletionTrajectory: readonly string[];
  readonly eventCompletionTrajectory: readonly ProductionLongitudinalEventCompletionState[];
  readonly actualDoseTrajectoryByLane: readonly string[];
  readonly executionQualityTrajectory: readonly string[];
  readonly responseTrajectory: readonly ProductionLongitudinalOutcomeSignal[];
  readonly recoveryTrajectory: readonly string[];
  readonly adherenceTrajectory: readonly ProductionLongitudinalOutcomeSignal[];
  readonly realizationChanges: readonly string[];
  readonly substitutionHistory: readonly string[];
  readonly successfulReexposure: boolean;
  readonly plateauOrFailureEvidence: readonly string[];
  readonly mixedOrConflictingEvidence: readonly string[];
  readonly currentStrongestApplicableEvidence: ProductionLongitudinalEvidenceApplicability | null;
  readonly currentState: ProductionLongitudinalState;
  readonly sourceRecordRevisions: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalActionCandidate {
  readonly candidateId: string;
  readonly action: ProductionLongitudinalAction;
  readonly targetId: string;
  readonly targetScope: ProductionLongitudinalTargetScope;
  readonly eligible: boolean;
  readonly selectedAxis: ProgressionAxis | null;
  readonly requiredEvidence: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly actionOwner: "longitudinal_adaptation";
  readonly applicationOwner: ProductionLongitudinalActionOwner;
  readonly continuityCost: "none" | "local" | "review_only";
  readonly applicationBurden: "none" | "local_prescription" | "candidate_reopen" | "owner_review";
  readonly conflicts: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalAdaptationThreadIdentity {
  readonly threadId: string;
  readonly athleteId: string;
  readonly targetScope: ProductionLongitudinalTargetScope;
  readonly activeNeedIds: readonly string[];
  readonly activeObjectiveIds: readonly string[];
  readonly exerciseId: string | null;
  readonly assignmentLineageId: string | null;
  readonly prescriptionLineageId: string | null;
  readonly side: ProductionLongitudinalRealizationContext["side"];
  readonly phaseCycleId: string;
  readonly createdAt: string;
  readonly owner: "longitudinal_adaptation";
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalAdaptationStateIdentity {
  readonly stateId: string;
  readonly threadId: string;
  readonly athleteId: string;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalAdaptationStateRevision {
  readonly stateIdentity: ProductionLongitudinalAdaptationStateIdentity;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly evidenceWindowId: string;
  readonly currentState: ProductionLongitudinalState;
  readonly currentAuthorizedOrPendingAction: ProductionLongitudinalAction;
  readonly evaluationTime: string;
  readonly decisionAttemptId: string;
  readonly finalForDecision: boolean;
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalAdaptationStateRevisionLedger {
  readonly stateId: string;
  readonly revisions: readonly ProductionLongitudinalAdaptationStateRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export const PRODUCTION_LONGITUDINAL_DECISION_REVISION_REASON_CODES = Object.freeze([
  "initial_evaluation", "performance_evidence_revision", "response_evidence_revision", "recovery_evidence_revision",
  "adherence_evidence_revision", "progression_readiness_revision", "safety_revision",
  "phase_continuity_revision", "program_snapshot_revision", "policy_revision", "coach_review",
] as const);
export type ProductionLongitudinalDecisionRevisionReasonCode =
  typeof PRODUCTION_LONGITUDINAL_DECISION_REVISION_REASON_CODES[number];

export interface ProductionLongitudinalAdaptationDecisionRevision {
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: ProductionLongitudinalDecisionRevisionReasonCode;
  readonly policyReference: ProductionLongitudinalAdaptationPolicyReference;
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

export interface ProductionLongitudinalAdaptationDecisionRevisionLedger {
  readonly decisionId: string;
  readonly revisions: readonly ProductionLongitudinalAdaptationDecisionRevision[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export interface ProductionLongitudinalAdaptationDecisionRevisionContext {
  readonly ledger: ProductionLongitudinalAdaptationDecisionRevisionLedger;
  readonly reasonCode: Exclude<ProductionLongitudinalDecisionRevisionReasonCode, "initial_evaluation">;
}

export interface ProductionLongitudinalAdaptationActionDirective {
  readonly directiveId: string;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly targetId: string;
  readonly targetScope: ProductionLongitudinalTargetScope;
  readonly action: ProductionLongitudinalAction;
  readonly selectedAxis: ProgressionAxis | null;
  readonly implicatedPrescriptionDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly evidenceSourceRecordRevisions: readonly string[];
  readonly sourceExposureEventIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly actionOwner: "longitudinal_adaptation";
  readonly downstreamApplicationOwner: ProductionLongitudinalActionOwner;
  readonly requiredFuturePolicyReferences: readonly string[];
  readonly currentContinuityState: ProductionLongitudinalState;
  readonly unresolvedBlockers: readonly string[];
  readonly reviewState: "authorized_unapplied" | "review_required" | "insufficient_evidence";
  readonly decisionAuthorized: boolean;
  readonly applicationApplied: false;
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalAdaptationApplicationCandidate {
  readonly applicationCandidateId: string;
  readonly authorizedDirective: ProductionLongitudinalAdaptationActionDirective;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly explicitEntityMappings: readonly { readonly currentEntityId: string; readonly proposedEntityId: string }[];
  readonly claimedAppliedDimensions: readonly ProductionLongitudinalPrescriptionDimension[];
  readonly changedTargetIds: readonly string[];
  readonly applicationOwner: ProductionLongitudinalActionOwner;
  readonly applicationState: "not_applied" | "proposed_for_validation";
  readonly actionPersisted: boolean;
  readonly candidateSelectionReopened: boolean;
  readonly phaseMutationClaimed: boolean;
  readonly weekReallocationClaimed: boolean;
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalApplicationValidationResult {
  readonly status: "valid_unapplied" | "valid_application_candidate" | "action_erased" |
    "action_scope_exceeded" | "wrong_application_owner";
  readonly reasonCodes: readonly string[];
  readonly actionPersistenceCount: number;
  readonly scopeExceededCount: number;
  readonly wrongOwnerCount: number;
}

export interface ProductionLongitudinalUpstreamAuthoritySnapshot {
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly currentProgramTruthValid: boolean;
  readonly sourceEventIntegrityValid: boolean;
  readonly prescriptionValid: boolean;
  readonly sequenceValid: boolean;
  readonly weekValid: boolean;
  readonly phaseContinuityValid: boolean;
  readonly trainingSafetyValidated: boolean;
  readonly unresolvedUpstreamBlockers: readonly string[];
  readonly validatedAt: string;
  readonly provenance: readonly string[];
}

export const PRODUCTION_LONGITUDINAL_SUBGATES = Object.freeze([
  "16.0_contract_and_input_truth", "16.1_upstream_authority", "16.2_completed_outcome_ledger_integrity",
  "16.3_evidence_applicability_and_chronology", "16.4_longitudinal_state",
  "16.5_action_candidate_eligibility", "16.6_action_selection_and_owner_boundary",
  "16.7_continuity_and_scope", "16.8_optional_application_validation", "16.9_final_verdict",
] as const);
export type ProductionLongitudinalSubgate = typeof PRODUCTION_LONGITUDINAL_SUBGATES[number];
export interface ProductionLongitudinalSubgateTrace {
  readonly subgate: ProductionLongitudinalSubgate;
  readonly state: "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export type ProductionLongitudinalStatus =
  | "decision_authorized" | "review_required" | "hold" | "insufficient_evidence" | "action_conflict"
  | "safety_blocked" | "upstream_invalid" | "contract_invalid" | "source_invalid"
  | "completed_ledger_invalid" | "evidence_invalid" | "application_invalid";

export interface ProductionLongitudinalAdaptationInput {
  readonly contractReference: ProductionLongitudinalAdaptationContractReference;
  readonly policy: ExplicitProductionLongitudinalAdaptationPolicyInput;
  readonly availablePolicies?: readonly ProductionLongitudinalAdaptationPolicy[];
  readonly outcomeSourceContract: ProductionLongitudinalOutcomeSourceContractReference;
  readonly outcomeSourceSnapshot: ProductionLongitudinalOutcomeSourceSnapshot;
  readonly completedExposureLedger: ProductionCompletedExposureOutcomeLedger;
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly threadIdentity: ProductionLongitudinalAdaptationThreadIdentity;
  readonly evidenceWindow: ProductionLongitudinalEvidenceWindow;
  readonly stateRevisionLedger: ProductionLongitudinalAdaptationStateRevisionLedger;
  readonly currentStateRevision: ProductionLongitudinalAdaptationStateRevision;
  readonly currentProgramSnapshot: ProductionPhaseProgramSnapshot;
  readonly currentPhaseContinuityResult: ProductionPhaseContinuityResult;
  readonly upstreamAuthority: ProductionLongitudinalUpstreamAuthoritySnapshot;
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly trainingResponseReceiverTraces: readonly TrainingResponseReceiverTrace[];
  readonly progressionReadinessTraces: readonly ProgressionReadinessTrace[];
  readonly normalizedRecoverySourceRevisionIds: readonly string[];
  readonly normalizedAdherenceSourceRevisionIds: readonly string[];
  readonly optionalApplicationCandidate: ProductionLongitudinalAdaptationApplicationCandidate | null;
  readonly evaluationTime: string;
  readonly decisionAttemptId: string;
  readonly priorDecisionRevisionContext: ProductionLongitudinalAdaptationDecisionRevisionContext | null;
  readonly runShadowDiagnosticsAfterFailure?: boolean;
}

export interface ProductionLongitudinalAdaptationResult {
  readonly contractReference: ProductionLongitudinalAdaptationContractReference;
  readonly policyReference: ProductionLongitudinalAdaptationPolicyReference | null;
  readonly outcomeSourceReference: ProductionLongitudinalOutcomeSourceContractReference;
  readonly threadId: string;
  readonly stateId: string;
  readonly stateRevisionId: string;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly decisionRevisionLedger: ProductionLongitudinalAdaptationDecisionRevisionLedger;
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly evidenceWindow: ProductionLongitudinalEvidenceWindow;
  readonly completedLedgerIntegrity: ProductionCompletedExposureLedgerIntegrity;
  readonly sourceRevisionTrace: readonly ProductionLongitudinalSourceRevisionTrace[];
  readonly evidenceApplicability: readonly { readonly sourceRecordRevisionId: string;
    readonly applicability: ProductionLongitudinalEvidenceApplicability;
    readonly differences: readonly ProductionLongitudinalRealizationDifference[];
    readonly accepted: boolean; readonly reasonCodes: readonly string[] }[];
  readonly trajectory: ProductionLongitudinalEvidenceTrajectory;
  readonly currentStateClassification: ProductionLongitudinalState;
  readonly actionCandidates: readonly ProductionLongitudinalActionCandidate[];
  readonly selectedPrimaryAction: ProductionLongitudinalAction | null;
  readonly actionDirective: ProductionLongitudinalAdaptationActionDirective | null;
  readonly detailedClassifications: readonly string[];
  readonly blockers: readonly string[];
  readonly conflicts: readonly string[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly responseTrace: readonly string[];
  readonly progressionReadinessTrace: readonly string[];
  readonly continuityTrace: readonly string[];
  readonly reexposureTrace: readonly string[];
  readonly replacementRotationTrace: readonly string[];
  readonly weekDeloadPhaseDeferralTrace: readonly string[];
  readonly applicationValidation: ProductionLongitudinalApplicationValidationResult;
  readonly firstFailingSubgate: ProductionLongitudinalSubgate | null;
  readonly subgateTrace: readonly ProductionLongitudinalSubgateTrace[];
  readonly shadowDiagnostics: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly status: ProductionLongitudinalStatus;
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
