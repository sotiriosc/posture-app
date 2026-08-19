import type {
  ExerciseActionFunction,
  ExerciseDefinition,
  ExerciseStressExposureScope,
  ExerciseStressSideScope,
  ExerciseStressSource,
  MuscleContributionRelationship,
} from "../domain/exercise";
import type { JointStressTag, MovementRole, MuscleGroup } from "../domain/primitives";
import type { SessionIntent, SessionSection, TrainingRole } from "../domain/session";
import type {
  ProductionLoadingCompletenessState,
  ProductionWeeklyExecutionRequirements,
} from "../domain/weeklyExecutionRequirements";
import type { ExerciseDose, ExerciseDoseMode } from "../prescription/dose";
import type {
  PrescriptionDurationInterval,
  PrescriptionSessionCompilationResult,
} from "../prescription/compiler/contracts";
import type {
  PrescriptionBlockContributionClassification,
  PrescriptionDoseBlockPurpose,
} from "../prescription/designContracts";
import type { EvidenceProvenance, ISODateTimeString } from "../prescription/types";
import type {
  FinalSequencedSessionDurationInterval,
  ProductionFinalSessionSequencingResult,
} from "../sequencing/contracts";
import type { SessionSkeleton } from "../sessionComposer/contracts";
import type {
  ExplicitPostPrescriptionWeekValidationPolicyInput,
  PostPrescriptionWeekValidationPolicyReference,
  ProductionPostPrescriptionWeekValidationPolicy,
} from "./policies/contracts";
import type {
  PrescribedWeekSourceSnapshot,
  ProductionWeekObjectiveSnapshot,
} from "./sourceContracts";

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_ID =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL" as const;
export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_STATUS =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_CLASSIFICATION =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_READY" as const;
export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CLASSIFICATION =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION" as const;

export const PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY = Object.freeze({
  gate9: "PRODUCTION_KERNEL_AUTHORITY",
  gate10: "PRODUCTION_KERNEL_AUTHORITY",
  gate11: "FOUNDATION_AUTHORITY",
  gate12: "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY",
  gate13: "PRODUCTION_KERNEL_AUTHORITY",
  gate14: "NOT_IMPLEMENTED",
  gate15: "NOT_IMPLEMENTED",
  gate16: "FOUNDATION_ONLY / NOT_IMPLEMENTED",
} as const);

export interface ProductionPostPrescriptionWeekValidatorContractReference {
  readonly contractId: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION;
}

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE:
ProductionPostPrescriptionWeekValidatorContractReference = Object.freeze({
  contractId: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_ID,
  contractVersion: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION,
});

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES = [
  "validated_supported_scope",
  "validated_with_unresolved_dose_sufficiency",
  "validated_with_execution_feasibility_pending",
  "blocked_by_training_readiness",
  "incomplete_due_to_missing_session_artifact",
  "incomplete_due_to_prescription",
  "incomplete_due_to_sequencing",
  "invalid_source_exposure_ledger",
  "invalid_objective_mapping",
  "required_prescribed_realization_missing",
  "definitely_over_budget_requires_week_review",
  "week_reallocation_review_required",
  "unsupported_objective_scope",
  "weekly_policy_required",
  "weekly_policy_conflict",
  "source_contract_required",
  "source_contract_unavailable",
  "invalid_source_contract",
  "unsupported_validator_contract_version",
  "unsupported_prescription_contract_version",
  "unsupported_sequencing_contract_version",
  "invalid_validation_revision_context",
] as const;

export type ProductionPostPrescriptionWeekValidationStatus =
  (typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES)[number];

export type ProductionSessionAdmissibilityStatus =
  | "prescribed_and_sequenced"
  | "prescribed_duration_unresolved"
  | "definitely_over_budget"
  | "possibly_over_budget"
  | "blocked_by_training_readiness"
  | "incomplete_prescription"
  | "incomplete_sequencing"
  | "search_inconclusive"
  | "missing_session_artifact"
  | "invalid_identity_chain"
  | "superseded_or_cancelled";

export type ProductionObjectivePrescribedRealizationStatus =
  | "prescribed_minimum_opportunities_met"
  | "prescribed_target_opportunities_met"
  | "prescribed_below_minimum_unresolved"
  | "prescribed_above_soft_maximum_review"
  | "prescribed_realization_present_duration_pending"
  | "prescribed_realization_missing"
  | "prescribed_realization_incompatible"
  | "allocation_present_prescription_missing"
  | "prescription_present_sequence_missing"
  | "source_trace_incomplete"
  | "prescribed_dose_target_not_defined"
  | "spacing_unresolved"
  | "blocked_by_training_readiness"
  | "definitely_over_budget_requires_week_review"
  | "optional_not_prescribed"
  | "weekly_policy_required"
  | "weekly_policy_conflict"
  | "unsupported_objective_scope";

export type ProductionObjectiveThresholdState = "below" | "met" | "above" | "pending" | "not_applicable";

export interface ProductionPostPrescriptionWeekSessionBundle {
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
  readonly sessionIntent: SessionIntent | null;
  readonly sessionSkeleton: SessionSkeleton | null;
  readonly prescriptionCompilation: PrescriptionSessionCompilationResult | null;
  readonly sequencingResult: ProductionFinalSessionSequencingResult | null;
  readonly expectedArtifactState: "expected" | "superseded" | "cancelled";
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionPostPrescriptionWeekValidationInput {
  readonly validatorContract: ProductionPostPrescriptionWeekValidatorContractReference;
  readonly validationPolicy: ExplicitPostPrescriptionWeekValidationPolicyInput;
  readonly availableValidationPolicies?: readonly ProductionPostPrescriptionWeekValidationPolicy[];
  readonly weekSource: PrescribedWeekSourceSnapshot;
  readonly sessionBundles: readonly ProductionPostPrescriptionWeekSessionBundle[];
  readonly exerciseRegistry: readonly ExerciseDefinition[];
  readonly evaluationTime: ISODateTimeString;
  readonly upstreamGateState: "PASS" | "FAIL_STOP";
  readonly priorValidationRevisionContext: ProductionPostPrescriptionWeekValidationRevisionContext | null;
}

export interface ProductionSessionAdmissibilityTrace {
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string | null;
  readonly executionAttemptId: string | null;
  readonly status: ProductionSessionAdmissibilityStatus;
  readonly prescribedRealizationPresent: boolean;
  readonly executableMinimumEligible: boolean;
  readonly pendingFeasibilityEligible: boolean;
  readonly durationState: FinalSequencedSessionDurationInterval["status"] | "unavailable";
  readonly reasonCodes: readonly string[];
}

export interface ProductionBlockPurposeView {
  readonly blockId: string;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly contributionClassification: PrescriptionBlockContributionClassification;
  readonly doseMode: ExerciseDoseMode;
  readonly objectiveIds: readonly string[];
  readonly developmentalCreditEligible: boolean;
  readonly reasonCodes: readonly string[];
}

export interface ProductionPlannedDoseLaneView {
  readonly sourceExposureEventId: string;
  readonly blockId: string;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly contributionClassification: PrescriptionBlockContributionClassification;
  readonly mode: ExerciseDoseMode;
  readonly dose: ExerciseDose;
  readonly commensurableWithinModeOnly: true;
  readonly timingKnown: boolean;
  readonly provenance: EvidenceProvenance;
}

export interface ProductionPlannedMuscleRelationshipView {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly objectiveIds: readonly string[];
  readonly muscle: MuscleGroup;
  readonly relationship: MuscleContributionRelationship;
  readonly blockIds: readonly string[];
  readonly developmentalSetRange: readonly [number, number] | null;
  readonly nonSetLaneRefs: readonly string[];
  readonly reviewStatus: "accepted" | "needs_review";
  readonly fractionalCoefficient: null;
  readonly provenance: readonly string[];
}

export interface ProductionPlannedMovementActionCapacityView {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly objectiveIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly ExerciseActionFunction[];
  readonly capacityLane: "loaded_carry" | "loaded_bracing" | "supported_stationary_capacity" | "none";
  readonly assessmentLane: "technique_quality" | "preparation_control" | "reviewed_assessment_development" | "none";
  readonly recoveryLane: "prescribed_recovery_support" | "none";
  readonly provenance: readonly string[];
}

export type ProductionPlannedStressExposureResolutionState =
  | "intrinsic_planned_exposure"
  | "prescription_modified_exposure"
  | "variant_confirmed_exposure"
  | "dose_created_potential_unresolved"
  | "no_matching_prescribed_exposure"
  | "unknown_requires_review";

export interface ProductionPlannedStressExposureTrace {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly blockIds: readonly string[];
  readonly stressTag: JointStressTag;
  readonly source: ExerciseStressSource;
  readonly exposureScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly prescribedRealizationFacts: readonly string[];
  readonly resolutionState: ProductionPlannedStressExposureResolutionState;
  readonly injuryOrDiagnosisClaimed: false;
  readonly provenance: readonly string[];
}

export interface ProductionPlannedSourceExposureLedgerEntry {
  readonly validatorContract: ProductionPostPrescriptionWeekValidatorContractReference;
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly weeklyIntentId: string;
  readonly weekAllocationPlanId: string;
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
  readonly sequencePlanId: string;
  readonly finalSequenceRevisionId: string;
  readonly sequenceIndex: number;
  readonly assignmentId: string;
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly prescriptionId: string;
  readonly finalPrescriptionRevisionId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly satisfiedSessionNeedIds: readonly string[];
  readonly weeklyObjectiveIds: readonly string[];
  readonly doseBlockIds: readonly string[];
  readonly blockPurposeViews: readonly ProductionBlockPurposeView[];
  readonly doseLanes: readonly ProductionPlannedDoseLaneView[];
  readonly muscleRelationshipViews: readonly ProductionPlannedMuscleRelationshipView[];
  readonly movementActionCapacityView: ProductionPlannedMovementActionCapacityView;
  readonly stressExposureViews: readonly ProductionPlannedStressExposureTrace[];
  readonly durationInterval: PrescriptionDurationInterval;
  readonly sessionAdmissibilityState: ProductionSessionAdmissibilityStatus;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionSourceEventIntegrityTrace {
  readonly expectedEventCount: number;
  readonly observedEventCount: number;
  readonly uniqueEventCount: number;
  readonly duplicateEventCount: number;
  readonly missingEventCount: number;
  readonly orphanEventCount: number;
  readonly crossSessionEventCollisionCount: number;
  readonly stalePrescriptionRevisionCount: number;
  readonly staleSequenceRevisionCount: number;
  readonly wrongReservationCount: number;
  readonly wrongOpportunityCount: number;
  readonly wrongExecutionAttemptCount: number;
  readonly reasonCodes: readonly string[];
}

export type ProductionPostPrescriptionWeekSpacingResult =
  | "spacing_policy_not_defined"
  | "elapsed_time_unknown"
  | "prescribed_burden_known_response_missing"
  | "prescribed_burden_unknown"
  | "structurally_distributed"
  | "structurally_concentrated"
  | "explicit_spacing_requirement_met"
  | "explicit_spacing_requirement_not_met"
  | "response_dependent";

export interface ProductionWeeklyObjectivePrescribedRealizationTrace {
  readonly objectiveId: string;
  readonly purpose: string;
  readonly target: ProductionWeekObjectiveSnapshot["target"];
  readonly priority: ProductionWeekObjectiveSnapshot["priority"];
  readonly priorityOrder: number;
  readonly policyRef: PostPrescriptionWeekValidationPolicyReference | null;
  readonly allocatedReservationIds: readonly string[];
  readonly prescribedQualifyingReservationIds: readonly string[];
  readonly executableQualifyingReservationIds: readonly string[];
  readonly pendingDurationReservationIds: readonly string[];
  readonly nonexecutiveReservationIds: readonly string[];
  readonly qualifyingEventIds: readonly string[];
  readonly nonqualifyingEvents: readonly { readonly eventId: string; readonly reasonCodes: readonly string[] }[];
  readonly qualifyingBlockIds: readonly string[];
  readonly relationshipEvidence: readonly string[];
  readonly allocatedOpportunityCount: number;
  readonly prescribedFrequencyCount: number;
  readonly executablePrescribedFrequencyCount: number;
  readonly pendingFeasibilityOpportunityCount: number;
  readonly minimumState: ProductionObjectiveThresholdState;
  readonly targetState: ProductionObjectiveThresholdState;
  readonly softMaximumState: ProductionObjectiveThresholdState;
  readonly dosePolicyState: ProductionWeekObjectiveSnapshot["dosePolicyState"];
  readonly spacingState: ProductionPostPrescriptionWeekSpacingResult;
  readonly executionRequirements: ProductionWeeklyExecutionRequirements | null;
  readonly executionRequirementsSatisfied: boolean;
  readonly executionRequirementReasonCodes: readonly string[];
  readonly loadingCompletenessState: ProductionLoadingCompletenessState | "not_applicable";
  readonly status: ProductionObjectivePrescribedRealizationStatus;
  readonly unresolvedRefs: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductionPlannedBurdenVector {
  readonly reservationId: string;
  readonly localFatigue: readonly string[];
  readonly systemicFatigue: readonly string[];
  readonly axialLoading: readonly string[];
  readonly gripLoading: readonly string[];
  readonly trunkBracing: readonly string[];
  readonly repeatedStressTags: readonly JointStressTag[];
  readonly developmentalBlockCount: number;
  readonly preparatoryBlockCount: number;
  readonly knownTimedExposureSeconds: number;
  readonly unknownDurationComponents: readonly string[];
  readonly highEffortEventCount: number;
  readonly observedRecoveryCost: null;
  readonly aggregateScore: null;
}

export interface ProductionPlannedConcentrationTrace {
  readonly kind:
    | "repeated_objective_in_one_session"
    | "repeated_muscle_primary_target"
    | "repeated_key_secondary"
    | "axial_loading_concentration"
    | "grip_loading_concentration"
    | "trunk_bracing_concentration"
    | "repeated_joint_stress_tag"
    | "several_high_effort_developmental_events"
    | "supporting_work_accumulation";
  readonly reservationIds: readonly string[];
  readonly sourceExposureEventIds: readonly string[];
  readonly observationOnly: true;
  readonly hardLimitPolicyRef: null;
}

export interface ProductionWeeklyDurationView {
  readonly knownLowerBoundSeconds: number;
  readonly knownUpperBoundSeconds: number | null;
  readonly unknownSessionIds: readonly string[];
  readonly definitelyOverBudgetReservationIds: readonly string[];
  readonly possiblyOverBudgetReservationIds: readonly string[];
  readonly totalDurationKnown: boolean;
  readonly physiologicalDoseMetric: false;
}

export interface ProductionPlannedSpacingTrace {
  readonly objectiveId: string;
  readonly earlierReservationId: string;
  readonly laterReservationId: string;
  readonly elapsedMinutes: number | null;
  readonly elapsedTimeKnown: boolean;
  readonly orderedOpportunityGap: number;
  readonly prescribedBurdenKnown: boolean;
  readonly responseEvidenceAvailable: false;
  readonly applicableSpacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING";
  readonly result: ProductionPostPrescriptionWeekSpacingResult;
}

export interface ProductionWeeklyAssessmentPreparationTrace {
  readonly preparationEventIds: readonly string[];
  readonly activationEventIds: readonly string[];
  readonly dependencyDrivenRecurrenceEventIds: readonly string[];
  readonly assessmentObjectiveRecurrenceEventIds: readonly string[];
  readonly sharedDependencyCoverageEventIds: readonly string[];
  readonly genericSupportingEventIds: readonly string[];
  readonly developmentalMiscreditEventIds: readonly string[];
  readonly duplicateSupportingEventIds: readonly string[];
  readonly supportingWorkConcentrationReservationIds: readonly string[];
  readonly validatorCreatedSupportingAssignmentCount: 0;
}

export interface ProductionPlannedRecoverySupportView {
  readonly sourceExposureEventId: string;
  readonly reservationId: string;
  readonly exerciseId: string;
  readonly objectiveIds: readonly string[];
  readonly blockIds: readonly string[];
  readonly observation: "PRESCRIBED_RECOVERY_SUPPORT_OBSERVATION";
  readonly recoveredStateClaimed: false;
}

export type ProductionPlannedPrescribedWeekArgumentStatus =
  | "coherent_within_supported_scope"
  | "coherent_with_unresolved_dose_sufficiency"
  | "coherent_with_execution_feasibility_pending"
  | "incomplete_due_to_missing_session_artifact"
  | "incomplete_due_to_prescription"
  | "incomplete_due_to_sequencing"
  | "invalid_source_exposure_ledger"
  | "invalid_objective_mapping"
  | "required_prescribed_realization_missing"
  | "blocked_by_training_readiness"
  | "week_reallocation_review_required"
  | "unsupported_policy_scope"
  | "weekly_policy_required"
  | "weekly_policy_conflict";

export interface ProductionPlannedPrescribedWeekArgumentTrace {
  readonly status: ProductionPlannedPrescribedWeekArgumentStatus;
  readonly requiredObjectivesPresent: boolean;
  readonly allocationsPreserved: boolean;
  readonly sessionsBelongToReservations: boolean;
  readonly assignmentsMapToOneSourceEvent: boolean;
  readonly sourceEventsUnique: boolean;
  readonly finalPrescriptionRevisionsPreserved: boolean;
  readonly finalSequenceRevisionsPreserved: boolean;
  readonly minimumPrescribedOpportunitiesMet: boolean;
  readonly supportingLanesSeparate: boolean;
  readonly relationshipsPreserved: boolean;
  readonly noncommensurableDoseModesSeparate: boolean;
  readonly overBudgetSessionsExposed: boolean;
  readonly unknownDurationsExposed: boolean;
  readonly spacingUnknownsExposed: boolean;
  readonly unsupportedScopesExplicit: boolean;
  readonly validationAddedSessionCount: 0;
  readonly validationRemovedSessionCount: 0;
  readonly validationAddedExerciseCount: 0;
  readonly validationRemovedExerciseCount: 0;
  readonly plannedFactsCalledCompletedCount: 0;
  readonly reasonCodes: readonly string[];
}

export const PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES = [
  "13.0_week_input_truth",
  "13.1_session_completeness",
  "13.2_source_event_integrity",
  "13.3_block_contribution_truth",
  "13.4_weekly_objective_mapping",
  "13.5_prescribed_frequency_distribution",
  "13.6_dose_lane_truth",
  "13.7_stress_concentration_duration",
  "13.8_spacing_truth",
  "13.9_complete_prescribed_week_argument",
] as const;

export type ProductionPostPrescriptionWeekGate13Subgate =
  (typeof PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES)[number];

export interface ProductionPostPrescriptionWeekGate13Trace {
  readonly subgate: ProductionPostPrescriptionWeekGate13Subgate;
  readonly state: "PASS" | "FAIL_STOP" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export type ProductionPostPrescriptionWeekInputAuthority =
  | "PRODUCTION_WEEK_SOURCE_CONTRACT"
  | "PRODUCTION_PLANNER_AUTHORITY"
  | "PRODUCTION_COMPOSER_AUTHORITY"
  | "PRODUCTION_PRESCRIPTION_AUTHORITY"
  | "PRODUCTION_SEQUENCING_AUTHORITY"
  | "EXPLICIT_VALIDATION_POLICY"
  | "COMPATIBILITY_ADAPTER"
  | "UNRESOLVED_FUTURE_OWNER";

export interface ProductionPostPrescriptionWeekInputAuthorityTrace {
  readonly field: string;
  readonly authority: ProductionPostPrescriptionWeekInputAuthority;
  readonly owner: string;
  readonly reasonCode: string;
}

export type ProductionPostPrescriptionWeekValidationRevisionReasonCode =
  | "initial_validation"
  | "prescription_revision"
  | "sequence_revision"
  | "reservation_revision"
  | "opportunity_revision"
  | "policy_revision"
  | "source_adapter_revision"
  | "coach_review";

export interface ProductionPostPrescriptionWeekValidationRevision {
  readonly validatorContract: ProductionPostPrescriptionWeekValidatorContractReference;
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: ProductionPostPrescriptionWeekValidationRevisionReasonCode;
  readonly createdAt: ISODateTimeString;
  readonly changedFieldRefs: readonly string[];
  readonly sourceSnapshotRevisionId: string;
  readonly policyRef: PostPrescriptionWeekValidationPolicyReference;
  readonly finalPrescriptionRevisionIds: readonly string[];
  readonly finalSequenceRevisionIds: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export interface ProductionPostPrescriptionWeekValidationRevisionLedger {
  readonly validatorContract: ProductionPostPrescriptionWeekValidatorContractReference;
  readonly validationId: string;
  readonly revisions: readonly ProductionPostPrescriptionWeekValidationRevision[];
  readonly supersessions: readonly {
    readonly supersededRevisionId: string;
    readonly supersedingRevisionId: string;
    readonly occurredAt: ISODateTimeString;
    readonly reasonCode: ProductionPostPrescriptionWeekValidationRevisionReasonCode;
  }[];
  readonly finalRevisionId: string;
  readonly finalizedHistoricalRevisionIds: readonly string[];
}

export interface ProductionPostPrescriptionWeekValidationRevisionContext {
  readonly ledger: ProductionPostPrescriptionWeekValidationRevisionLedger;
  readonly reasonCode: Exclude<ProductionPostPrescriptionWeekValidationRevisionReasonCode, "initial_validation">;
  readonly changedFieldRefs: readonly string[];
}

export interface ProductionPostPrescriptionWeekCompatibilityProjection {
  readonly objectivePrescribedStates: Readonly<Record<string, ProductionObjectivePrescribedRealizationStatus>>;
  readonly qualifyingReservationIdsByObjective: Readonly<Record<string, readonly string[]>>;
  readonly sourceEventIdsByObjective: Readonly<Record<string, readonly string[]>>;
  readonly sessionAdmissibilityByReservation: Readonly<Record<string, ProductionSessionAdmissibilityStatus>>;
  readonly durationState: "known" | "unknown";
  readonly unresolvedPolicies: readonly string[];
  readonly noncanonical: true;
}

export interface ProductionPostPrescriptionWeekDecisionTrace {
  readonly contractVersionTrace: readonly string[];
  readonly sourceAdapterAuthorityTrace: readonly string[];
  readonly policyResolutionTrace: readonly string[];
  readonly weekInputTrace: readonly string[];
  readonly sessionInventoryTrace: readonly string[];
  readonly sessionAdmissibilityTrace: readonly string[];
  readonly objectiveProvenanceTrace: readonly string[];
  readonly sourceEventTrace: readonly string[];
  readonly prescriptionRevisionTrace: readonly string[];
  readonly sequenceRevisionTrace: readonly string[];
  readonly blockContributionTrace: readonly string[];
  readonly frequencyTrace: readonly string[];
  readonly doseLaneTrace: readonly string[];
  readonly relationshipTrace: readonly string[];
  readonly assessmentPreparationTrace: readonly string[];
  readonly capacityRecoveryTrace: readonly string[];
  readonly stressTrace: readonly string[];
  readonly burdenConcentrationTrace: readonly string[];
  readonly durationTrace: readonly string[];
  readonly spacingTrace: readonly string[];
  readonly unsupportedScopeTrace: readonly string[];
  readonly noRescueTrace: readonly string[];
  readonly completeWeekTrace: readonly string[];
  readonly finalReasonCodes: readonly string[];
  readonly actualPerformanceConsumed: false;
  readonly longitudinalDecisionConsumed: false;
}

export interface ProductionPostPrescriptionWeekValidationResult {
  readonly validatorContract: ProductionPostPrescriptionWeekValidatorContractReference;
  readonly validationPolicyRef: PostPrescriptionWeekValidationPolicyReference | null;
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly revisionLedger: ProductionPostPrescriptionWeekValidationRevisionLedger | null;
  readonly athleteId: string;
  readonly sourceSnapshotId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly status: ProductionPostPrescriptionWeekValidationStatus;
  readonly sourceExposureLedger: readonly ProductionPlannedSourceExposureLedgerEntry[];
  readonly objectiveRealizationTraces: readonly ProductionWeeklyObjectivePrescribedRealizationTrace[];
  readonly sessionAdmissibilityTraces: readonly ProductionSessionAdmissibilityTrace[];
  readonly doseLaneSummaries: readonly ProductionPlannedDoseLaneView[];
  readonly muscleRelationshipViews: readonly ProductionPlannedMuscleRelationshipView[];
  readonly movementActionCapacityViews: readonly ProductionPlannedMovementActionCapacityView[];
  readonly assessmentPreparationTrace: ProductionWeeklyAssessmentPreparationTrace;
  readonly recoveryViews: readonly ProductionPlannedRecoverySupportView[];
  readonly stressTraces: readonly ProductionPlannedStressExposureTrace[];
  readonly burdenVectors: readonly ProductionPlannedBurdenVector[];
  readonly concentrationTraces: readonly ProductionPlannedConcentrationTrace[];
  readonly spacingTraces: readonly ProductionPlannedSpacingTrace[];
  readonly weeklyDurationView: ProductionWeeklyDurationView;
  readonly sourceEventIntegrityTrace: ProductionSourceEventIntegrityTrace;
  readonly completeWeekArgument: ProductionPlannedPrescribedWeekArgumentTrace;
  readonly unsupportedScopes: readonly string[];
  readonly unresolvedPolicies: readonly string[];
  readonly gate13Trace: readonly ProductionPostPrescriptionWeekGate13Trace[];
  readonly inputAuthorityTrace: readonly ProductionPostPrescriptionWeekInputAuthorityTrace[];
  readonly decisionTrace: ProductionPostPrescriptionWeekDecisionTrace;
  readonly compatibilityProjection: ProductionPostPrescriptionWeekCompatibilityProjection;
  readonly provenance: readonly EvidenceProvenance[];
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY";
  readonly productionActivationStatus: "NOT_ACTIVATED";
}
