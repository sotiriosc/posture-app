import type {
  PhaseAdvancementCriterionDefinition,
  PhaseContinuityContractReference,
  PhaseCriterionEvidenceRecord,
  PhaseCycleIdentity,
  PhaseStateRevision,
  PhaseTransitionProposal,
} from "../../src/phaseContinuity/designContracts";
import type {
  TrainingReadinessTrace,
} from "../../src/domain/trainingSafety";
import type { TrainingResponseReceiverTrace } from "../../src/trainingResponseReceiver";
import type { ProgressionReadinessTrace } from "../../src/prescription/progressionEvidence";
import type { FullPrescribedProgramSnapshot } from "./fullProgramContracts";
import type {
  CagtEffectiveAuthorityRegistryV3,
  CagtEffectiveAuthorityRegistryV3Reference,
} from "./effectiveAuthorityRegistryV3";

export const PHASE_CONTINUITY_GATE_15_SUBGATES = [
  "15.0_contract_and_fixture_truth",
  "15.1_upstream_validity",
  "15.2_phase_state_truth",
  "15.3_evidence_truth",
  "15.4_transition_eligibility",
  "15.5_cross_horizon_alignment",
  "15.6_stable_base_continuity",
  "15.7_local_phase_owned_change",
  "15.8_warmup_activation_and_supporting_continuity",
  "15.9_final_phase_continuity_verdict",
] as const;
export type PhaseContinuityGate15Subgate = typeof PHASE_CONTINUITY_GATE_15_SUBGATES[number];

export const PHASE_CONTINUITY_STATUSES = [
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
  "unsupported_phase_continuity_contract",
  "longitudinal_owner_required",
] as const;
export type PhaseContinuityStatus = typeof PHASE_CONTINUITY_STATUSES[number];

export const PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS = [
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
] as const;
export type PhaseContinuityDetailedClassification =
  typeof PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS[number];

export const PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS = [
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
export type PhaseProgramContinuityClassification =
  typeof PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS[number];

export interface CompletedPhaseEvidenceFixture {
  readonly sourceType:
    | "production_performance_summary"
    | "completed_session_summary"
    | "Product_adherence_source";
  readonly recordId: string;
  readonly athleteId: string;
  readonly completed: true;
  readonly occurredAt: string;
  readonly authority: "TEST_DESIGN_FIXTURE_EXPLICIT_SOURCE_NOT_RUNTIME_INGESTION";
  readonly provenance: readonly string[];
}

export interface PlannedProgramTruthTrace {
  readonly snapshotId: string;
  readonly gate13Valid: boolean;
  readonly gate14Classification:
    | "PROGRAM_EXPECTED_CONVERGENCE"
    | "PROGRAM_JUSTIFIED_CONVERGENCE"
    | "PROGRAM_MATERIAL_ADAPTATION_PRESERVED"
    | "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15";
  readonly completedEvidenceInferred: false;
  readonly sourceRef: string;
}

export interface PhaseContinuityGate15Input {
  readonly contractReference: PhaseContinuityContractReference;
  readonly authorityRegistry: CagtEffectiveAuthorityRegistryV3;
  readonly policyReference: {
    readonly policyId: "PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT";
    readonly version: "1.0.0";
  };
  readonly phaseCycleIdentity: PhaseCycleIdentity;
  readonly currentPhaseStateRevision: PhaseStateRevision;
  readonly transitionProposal: PhaseTransitionProposal;
  readonly currentProgramSnapshot: FullPrescribedProgramSnapshot;
  readonly proposedProgramSnapshot: FullPrescribedProgramSnapshot;
  readonly currentProgramTruth: PlannedProgramTruthTrace;
  readonly proposedProgramTruth: PlannedProgramTruthTrace;
  readonly criterionDefinitions: readonly PhaseAdvancementCriterionDefinition[];
  readonly criterionEvidenceRecords: readonly PhaseCriterionEvidenceRecord[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly trainingResponseReceiverTraces: readonly TrainingResponseReceiverTrace[];
  readonly progressionReadinessTraces: readonly ProgressionReadinessTrace[];
  readonly completedEvidenceFixtures: readonly CompletedPhaseEvidenceFixture[];
  readonly evaluationTime: string;
  readonly runShadowDiagnosticsAfterFailure?: boolean;
}

export interface PhaseCriterionEvaluation {
  readonly criterionId: string;
  readonly state: "met" | "not_met" | "blocked" | "conflict" | "insufficient" | "invalid";
  readonly acceptedEvidenceRecordIds: readonly string[];
  readonly rejectedEvidenceRecordIds: readonly string[];
  readonly reasonCodes: readonly string[];
}

export interface PhaseCrossHorizonAlignmentEntry {
  readonly entityKind: string;
  readonly currentEntityId: string | null;
  readonly proposedEntityId: string | null;
  readonly status:
    | "exact_lineage_match"
    | "explicit_cross_horizon_mapping"
    | "semantic_responsibility_match"
    | "intentionally_unmatched"
    | "ambiguous_alignment";
  readonly continuityClassification: PhaseProgramContinuityClassification;
  readonly reasonCode: string;
}

export interface PhaseCrossHorizonAlignmentResult {
  readonly status: "aligned" | "ambiguous_alignment" | "invalid_alignment";
  readonly entries: readonly PhaseCrossHorizonAlignmentEntry[];
  readonly ambiguityCount: number;
  readonly invalidCount: number;
  readonly reasonCodes: readonly string[];
}

export interface PhaseContinuityMetricTrace {
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

export interface PhaseContinuityGate15SubgateTrace {
  readonly subgate: PhaseContinuityGate15Subgate;
  readonly state: "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export interface PhaseContinuityGate15Result {
  readonly contractReference: PhaseContinuityContractReference;
  readonly authorityRegistryReference: CagtEffectiveAuthorityRegistryV3Reference;
  readonly policyReference: PhaseContinuityGate15Input["policyReference"];
  readonly phaseCycleId: string;
  readonly currentPhaseStateId: string;
  readonly currentPhaseStateRevisionId: string;
  readonly transitionProposalId: string;
  readonly currentProgramSnapshotId: string;
  readonly proposedProgramSnapshotId: string;
  readonly status: PhaseContinuityStatus;
  readonly detailedClassifications: readonly PhaseContinuityDetailedClassification[];
  readonly criterionEvaluations: readonly PhaseCriterionEvaluation[];
  readonly evidenceSufficiencyTrace: readonly string[];
  readonly blockers: readonly string[];
  readonly conflicts: readonly string[];
  readonly trainingSafetyTrace: TrainingReadinessTrace;
  readonly transitionEligibilityTrace: readonly string[];
  readonly crossHorizonAlignment: PhaseCrossHorizonAlignmentResult;
  readonly continuityClassifications: readonly PhaseProgramContinuityClassification[];
  readonly stableBaseTrace: readonly string[];
  readonly anchorTrace: readonly string[];
  readonly prescriptionContinuityTrace: readonly string[];
  readonly warmupActivationTrace: readonly string[];
  readonly replacementTrace: readonly string[];
  readonly rotationTrace: readonly string[];
  readonly phasePolicyTrace: readonly string[];
  readonly gate16DeferralTrace: readonly string[];
  readonly metrics: PhaseContinuityMetricTrace;
  readonly noRescueTrace: {
    readonly upstreamFailureObserved: boolean;
    readonly downstreamRescueAttempted: boolean;
    readonly downstreamRescueAccepted: false;
  };
  readonly firstFailingSubgate: PhaseContinuityGate15Subgate | null;
  readonly subgateTrace: readonly PhaseContinuityGate15SubgateTrace[];
  readonly shadowDiagnostics: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly automaticProgressionCount: 0;
  readonly automaticReplacementCount: 0;
  readonly automaticRotationCount: 0;
  readonly automaticDeloadCount: 0;
  readonly genericPhaseWarmupCount: 0;
  readonly genericPhaseActivationCount: 0;
  readonly provenance: readonly string[];
}
