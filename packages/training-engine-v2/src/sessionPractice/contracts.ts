import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type { SessionIntent, SessionNeedPriority, SessionSection } from "../domain/session";
import type { ExerciseDose } from "../prescription/dose";
import type {
  ProductionExercisePrescriptionPlan,
  ProductionPrescriptionDoseBlock,
} from "../prescription/compiler/contracts";
import type { EvidenceProvenance } from "../prescription/types";
import type {
  FinalSequencedSessionDurationInterval,
  ProductionFinalSessionSequencePlan,
  ProductionSequencedAssignmentStep,
} from "../sequencing/contracts";
import type { SessionExerciseAssignment, SessionSkeleton } from "../sessionComposer/contracts";

export const HISTORICAL_SESSION_PRACTICE_OPTIONS_V1_CONTRACT_REFERENCE = Object.freeze({
  contractId: "HISTORICAL_SESSION_PRACTICE_OPTIONS_V1",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_OPTIONS_V2_BRIDGE",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_REQUEST",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_OPTION_POLICY_V2",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_OPTION_AVAILABILITY",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_REALIZATION_PLAN",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_REALIZATION_REVISION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_REALIZATION_REVISION",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_ASSIGNMENT_DISPOSITION",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_PRESCRIPTION_REVISION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_PRESCRIPTION_REVISION",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_COMPLETION_DISPOSITION",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_OUTCOME_SOURCE_LINK",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_GATE13_RECEIVER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_GATE13_RECEIVER",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_REMAINING_WEEK_HANDOFF_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_REMAINING_WEEK_HANDOFF",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_LONGITUDINAL_OBSERVATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_LONGITUDINAL_OBSERVATION",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_PRODUCT_ADAPTER",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_PERSISTENCE",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE = Object.freeze({
  contractId: "SESSION_PRACTICE_OBSERVABILITY",
  contractVersion: "1.0.0",
} as const);

export const PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL",
  contractVersion: "1.0.0",
} as const);

export const SESSION_PRACTICE_LIGHTER_POLICY_V1 = Object.freeze({
  contractReference: SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE,
  policyId: "SESSION_PRACTICE_LIGHTER_POLICY_V1_STRUCTURAL_FIRST",
  version: "1.0.0",
  mode: "lighter",
} as const);

export const SESSION_PRACTICE_RECOVERY_POLICY_V1 = Object.freeze({
  contractReference: SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE,
  policyId: "SESSION_PRACTICE_RECOVERY_POLICY_V1_EXPLICIT_SUPPORT_ONLY",
  version: "1.0.0",
  mode: "recovery",
} as const);

export const SESSION_PRACTICE_FULL_POLICY_V1 = Object.freeze({
  contractReference: SESSION_PRACTICE_OPTION_POLICY_V2_CONTRACT_REFERENCE,
  policyId: "SESSION_PRACTICE_FULL_POLICY_V1_EXACT_PASS_THROUGH",
  version: "1.0.0",
  mode: "full",
} as const);

export const SESSION_PRACTICE_MODES = Object.freeze(["full", "lighter", "recovery"] as const);
export type SessionPracticeModeV2 = typeof SESSION_PRACTICE_MODES[number];

export type SessionPracticeRequestSource =
  | "athlete_explicit"
  | "structured_recommendation_confirmed_by_athlete"
  | "legacy_compatibility_restricted";

export interface SessionPracticeRequest {
  readonly contractReference: typeof SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE;
  readonly requestId: string;
  readonly attemptId: string;
  readonly athleteId: string;
  readonly sourceProgramId: string;
  readonly sourceProgramRevisionId: string;
  readonly sourceWeekPlanId: string;
  readonly sourceWeekPlanRevisionId: string;
  readonly sourceReservationId: string;
  readonly sourceReservationRevisionId: string;
  readonly sourceSessionIntentId: string;
  readonly sourceSessionSkeletonId: string;
  readonly sourceSessionSkeletonFingerprint: string;
  readonly sourceFinalPrescribedSessionId: string;
  readonly sourceFinalPrescribedSessionRevisionId: string;
  readonly requestedMode: SessionPracticeModeV2;
  readonly source: SessionPracticeRequestSource;
  readonly recommendationReference: string | null;
  readonly selectedAt: string;
  readonly evaluationTime: string;
  readonly currentEquipmentReference: string;
  readonly trainingSafetyReference: string;
  readonly actualAvailableMinutes: number | null;
  readonly provenance: readonly string[];
  readonly state: "counterfactual" | "applied";
}

export interface SessionPracticeRecommendation {
  readonly recommendationId: string;
  readonly suggestedMode: SessionPracticeModeV2;
  readonly authority: "SUGGESTION_ONLY";
  readonly reasonCodes: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly reviewState: "reviewed" | "pending" | "policy_required";
  readonly issuedAt: string;
  readonly expiresAt: string | null;
  readonly automaticSelection: false;
}

export type SessionPracticeAttemptState =
  | "no_selection"
  | "selected_pre_execution"
  | "final_for_execution"
  | "execution_started"
  | "completed"
  | "abandoned"
  | "superseded_pre_execution"
  | "invalidated";

export type SessionPracticeExecutionStartEvent =
  | "final_timer_started"
  | "set_marked_complete"
  | "performance_observation_recorded"
  | "load_entry_committed"
  | "repetitions_entry_committed"
  | "rpe_entry_committed"
  | "explicit_start_command";

export interface SessionPracticeAttemptLifecycle {
  readonly attemptId: string;
  readonly sourceSessionRevisionId: string;
  readonly state: SessionPracticeAttemptState;
  readonly selectedMode: SessionPracticeModeV2 | null;
  readonly realizationRevisionIds: readonly string[];
  readonly finalForExecutionRevisionId: string | null;
  readonly executionStartEvent: SessionPracticeExecutionStartEvent | null;
  readonly executionStartedAt: string | null;
  readonly abandonedAt: string | null;
  readonly supersededByAttemptId: string | null;
}

export interface SessionPracticeWeekSource {
  readonly programId: string;
  readonly programRevisionId: string;
  readonly weekPlanId: string;
  readonly weekPlanRevisionId: string;
  readonly reservationId: string;
  readonly reservationRevisionId: string;
  readonly opportunityId: string;
  readonly responsibilityIds: readonly string[];
  readonly requiredResponsibilityIds: readonly string[];
}

export interface SessionPracticeGate13Source {
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly state: "PASS" | "FAIL_STOP";
  readonly sourceExposureEventIds: readonly string[];
}

export interface SessionPracticeSourceSnapshot {
  readonly bridgeContractReference: typeof SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE;
  readonly sourceSessionId: string;
  readonly sourceSessionRevisionId: string;
  readonly sourceSessionFingerprint: string;
  readonly finalPrescribedSessionId: string;
  readonly finalPrescribedSessionRevisionId: string;
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
  readonly prescriptions: readonly ProductionExercisePrescriptionPlan[];
  readonly finalSequence: ProductionFinalSessionSequencePlan;
  readonly week: SessionPracticeWeekSource;
  readonly gate13: SessionPracticeGate13Source;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly policyVersionRefs: readonly string[];
  readonly admittedMinimumCountByBlockId: Readonly<Record<string, number>>;
  readonly currentEquipmentReference: string;
  readonly capturedAt: string;
}

export const SESSION_PRACTICE_OPTION_AVAILABILITY_STATES = Object.freeze([
  "available",
  "available_with_pending_week_responsibility",
  "prescription_resolution_required",
  "unavailable_no_material_reduction",
  "unavailable_no_recovery_realization",
  "blocked_by_training_safety",
  "blocked_by_source_session_incomplete",
  "blocked_by_execution_started",
  "policy_required",
  "conflict",
  "not_applicable",
] as const);
export type SessionPracticeOptionAvailabilityState =
  typeof SESSION_PRACTICE_OPTION_AVAILABILITY_STATES[number];

export interface SessionPracticeMaterialityTrace {
  readonly assignmentOmissionCount: number;
  readonly developmentalCountReduction: number;
  readonly explicitLowerVariantCount: number;
  readonly materialReduction: boolean;
  readonly reasonCodes: readonly string[];
}

export interface SessionPracticeOptionAvailability {
  readonly contractReference: typeof SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE;
  readonly mode: SessionPracticeModeV2;
  readonly state: SessionPracticeOptionAvailabilityState;
  readonly reasonCodes: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly materiality: SessionPracticeMaterialityTrace;
  readonly fallbackApplied: false;
}

export type SessionPracticeAssignmentDispositionState = "retained" | "omitted" | "modified";
export type SessionPracticeRecoveryContributionLane =
  | "recovery_support_only"
  | "preparation_support_only"
  | "activation_support_only"
  | "technique_control_observation_only";

export interface SessionPracticeAssignmentDisposition {
  readonly contractReference: typeof SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly sourceExposureEventId: string;
  readonly state: SessionPracticeAssignmentDispositionState;
  readonly priority: SessionNeedPriority | "unallocated";
  readonly productiveRequiredAnchor: boolean;
  readonly retainedBlockIds: readonly string[];
  readonly omittedBlockIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly recoveryContributionLane: SessionPracticeRecoveryContributionLane | null;
  readonly performanceCreated: false;
}

export interface SessionPracticeDependencyDisposition {
  readonly dependencyAssignmentId: string;
  readonly dependentAssignmentIds: readonly string[];
  readonly state: "retained_required" | "retained_independent" | "pruned_orphan" | "not_applicable";
  readonly reasonCodes: readonly string[];
}

export interface SessionPracticeDoseFactChange {
  readonly blockId: string;
  readonly oldDose: ExerciseDose;
  readonly newDose: ExerciseDose | null;
  readonly changedFieldRefs: readonly string[];
  readonly unchangedFieldRefs: readonly string[];
}

export interface SessionPracticePrescriptionRevision {
  readonly contractReference: typeof SESSION_PRACTICE_PRESCRIPTION_REVISION_CONTRACT_REFERENCE;
  readonly prescriptionId: string;
  readonly originalPrescriptionRevisionId: string;
  readonly revisedPrescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly assignmentId: string;
  readonly basedOnRevisionId: string;
  readonly policyReference: string;
  readonly modifiedBlockIds: readonly string[];
  readonly omittedBlockIds: readonly string[];
  readonly doseChanges: readonly SessionPracticeDoseFactChange[];
  readonly finalForExecution: boolean;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export interface SessionPracticeNeedCoverage {
  readonly needId: string;
  readonly priority: SessionNeedPriority;
  readonly sourceAssignmentIds: readonly string[];
  readonly retainedAssignmentIds: readonly string[];
  readonly state: "preserved" | "omitted_pending_responsibility" | "not_applicable";
}

export interface SessionPracticeBurdenVector {
  readonly assignmentCount: number;
  readonly optionalAssignmentCount: number;
  readonly preferredAssignmentCount: number;
  readonly developmentalBlockCount: number;
  readonly developmentalCount: number | null;
  readonly preparatoryBlockCount: number;
  readonly sourceEventCount: number;
  readonly prescribedWorkIntervalSeconds: readonly [number, number | null];
  readonly restIntervalSeconds: readonly [number, number | null];
  readonly durationIntervalSeconds: readonly [number, number | null];
  readonly setupTransitionCount: number;
  readonly stressConcentrationObservationCount: number;
  readonly unresolvedDuration: boolean;
}

export interface SessionPracticeBurdenDifference {
  readonly source: SessionPracticeBurdenVector;
  readonly realized: SessionPracticeBurdenVector;
  readonly materiality: SessionPracticeMaterialityTrace;
  readonly universalBurdenScore: null;
}

export interface SessionPracticeStructuralProjection {
  readonly mode: SessionPracticeModeV2;
  readonly availability: SessionPracticeOptionAvailability;
  readonly assignments: readonly SessionPracticeAssignmentDisposition[];
  readonly dependencies: readonly SessionPracticeDependencyDisposition[];
  readonly prescriptionRevisions: readonly SessionPracticePrescriptionRevision[];
  readonly needCoverage: readonly SessionPracticeNeedCoverage[];
  readonly purposePreserved: boolean;
  readonly requiredResponsibilitiesSatisfied: boolean;
  readonly sourceEventsPreserved: boolean;
  readonly developmentalCreditEligible: boolean;
  readonly unresolvedRequirements: readonly string[];
  readonly weekResponsibilityConsequences: readonly string[];
  readonly noFallbackTrace: readonly string[];
}

export interface SessionPracticeFinalSequence {
  readonly sequencePlanId: string;
  readonly sequenceRevisionId: string;
  readonly basedOnSourceSequenceRevisionId: string;
  readonly steps: readonly ProductionSequencedAssignmentStep[];
  readonly finalPrescriptionRevisionIds: readonly string[];
  readonly duration: FinalSequencedSessionDurationInterval;
  readonly dependencyOrderPreserved: boolean;
  readonly blockOrderPreserved: boolean;
  readonly noPairing: true;
  readonly recomputedFromExplicitFacts: boolean;
  readonly reasonCodes: readonly string[];
}

export type SessionPracticeRealizationStatus =
  | "realized"
  | "unavailable"
  | "blocked"
  | "conflict";

export interface SessionPracticeRealizationPlan {
  readonly contractReference: typeof SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE;
  readonly bridgeContractReference: typeof SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE;
  readonly realizerContractReference: typeof PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE;
  readonly policyReference: string;
  readonly mode: SessionPracticeModeV2;
  readonly status: SessionPracticeRealizationStatus;
  readonly sourceSessionId: string;
  readonly sourceSessionRevisionId: string;
  readonly attemptId: string;
  readonly requestId: string;
  readonly realizationRevisionId: string;
  readonly finalForExecution: boolean;
  readonly assignments: readonly SessionPracticeAssignmentDisposition[];
  readonly dependencies: readonly SessionPracticeDependencyDisposition[];
  readonly anchors: readonly { readonly assignmentId: string; readonly preserved: boolean }[];
  readonly needCoverage: readonly SessionPracticeNeedCoverage[];
  readonly purposePreserved: boolean;
  readonly sourceEventsPreserved: boolean;
  readonly prescriptionRevisions: readonly SessionPracticePrescriptionRevision[];
  readonly finalSequence: SessionPracticeFinalSequence | null;
  readonly duration: FinalSequencedSessionDurationInterval | null;
  readonly burdenDifference: SessionPracticeBurdenDifference;
  readonly availability: SessionPracticeOptionAvailability;
  readonly unresolvedRequirements: readonly string[];
  readonly weekResponsibilityConsequences: readonly string[];
  readonly completionCreditPolicy:
    | "normal_gate13_and_outcome_truth"
    | "required_realized_evidence_only"
    | "recovery_support_only_original_responsibility_unfulfilled"
    | "none";
  readonly noFallbackTrace: readonly string[];
  readonly provenance: readonly string[];
}

export interface SessionPracticeRealizationRevision {
  readonly contractReference: typeof SESSION_PRACTICE_REALIZATION_REVISION_CONTRACT_REFERENCE;
  readonly realizationRevisionId: string;
  readonly attemptId: string;
  readonly requestId: string;
  readonly mode: SessionPracticeModeV2;
  readonly basedOnRevisionId: string | null;
  readonly state: "draft" | "superseded" | "final_for_execution" | "invalidated";
  readonly createdAt: string;
  readonly sourceSessionRevisionId: string;
  readonly planFingerprint: string;
}

export interface SessionPracticePolicyContext {
  readonly source: SessionPracticeSourceSnapshot;
  readonly request: SessionPracticeRequest;
  readonly createdAt: string;
}

export interface SessionPracticeAssignmentFacts {
  readonly assignment: SessionExerciseAssignment;
  readonly assignmentId: string;
  readonly sourceStep: ProductionSequencedAssignmentStep;
  readonly prescription: ProductionExercisePrescriptionPlan;
  readonly priority: SessionNeedPriority | "unallocated";
  readonly productiveRequiredAnchor: boolean;
  readonly uniqueActiveNeedIds: readonly string[];
  readonly independentlyActiveSupport: boolean;
  readonly dependentAssignmentIds: readonly string[];
  readonly dependencyAssignmentIds: readonly string[];
}

export interface SessionPracticeRevisedPrescriptionPlan extends Omit<
  ProductionExercisePrescriptionPlan,
  "prescriptionRevisionId" | "doseBlocks"
> {
  readonly prescriptionRevisionId: string;
  readonly doseBlocks: readonly ProductionPrescriptionDoseBlock[];
}

export interface SessionPracticeSequencingSource {
  readonly retainedAssignmentIds: readonly string[];
  readonly revisedPrescriptions: readonly SessionPracticeRevisedPrescriptionPlan[];
  readonly sourceSections: readonly SessionSection[];
}

export interface SessionPracticeCompletionEvidence {
  readonly attemptId: string;
  readonly realizationRevisionId: string;
  readonly performedSourceEventIds: readonly string[];
  readonly completedBlockIds: readonly string[];
  readonly partiallyCompletedBlockIds: readonly string[];
  readonly abandoned: boolean;
  readonly evidenceComplete: boolean;
  readonly conflictingEvidence: boolean;
  readonly completedAt: string;
}

export type SessionPracticeCompletionDispositionStatus =
  | "full_completed_as_prescribed"
  | "lighter_completed_required_responsibilities_satisfied"
  | "lighter_completed_partial_responsibility"
  | "recovery_support_completed_original_responsibility_unfulfilled"
  | "practice_attempt_partially_completed"
  | "practice_attempt_not_completed"
  | "practice_attempt_abandoned"
  | "completion_evidence_incomplete"
  | "completion_conflict";

export interface SessionPracticeCompletionDisposition {
  readonly contractReference: typeof SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE;
  readonly dispositionId: string;
  readonly attemptId: string;
  readonly realizationRevisionId: string;
  readonly status: SessionPracticeCompletionDispositionStatus;
  readonly creditedSourceEventIds: readonly string[];
  readonly unfulfilledResponsibilityIds: readonly string[];
  readonly weekReviewRequired: boolean;
  readonly automaticReallocationApplied: false;
  readonly automaticDoublingApplied: false;
  readonly adaptationActionApplied: false;
  readonly reasonCodes: readonly string[];
}

export interface SessionPracticeV2Draft {
  readonly contractReference: typeof SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE;
  readonly draftId: string;
  readonly attemptId: string;
  readonly selectedMode: SessionPracticeModeV2;
  readonly requestId: string;
  readonly realizationRevisionId: string;
  readonly finalForExecutionPlanReference: string;
  readonly sourceSessionRevisionId: string;
  readonly currentPosition: {
    readonly exerciseIndex: number;
    readonly blockIndex: number;
    readonly setIndex: number;
  };
  readonly actualPerformanceState: Readonly<Record<string, unknown>>;
  readonly timers: readonly { readonly timerId: string; readonly elapsedSeconds: number; readonly running: boolean }[];
  readonly substitutionReferences: readonly string[];
  readonly updatedAt: string;
  readonly attemptState: SessionPracticeAttemptState;
}

export interface SessionPracticeContractProvenance {
  readonly contractVersions: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
}
