import type {
  ExerciseActionFunction,
  ExerciseDefinition,
  ExerciseMuscleContribution,
  ExerciseStressExposureScope,
  ExerciseStressSideScope,
  ExerciseStressSource,
  MuscleContributionRelationship,
} from "../domain/exercise";
import type { JointStressTag, MovementRole, MuscleGroup } from "../domain/primitives";
import type { SessionIntent, SessionSection, TrainingRole } from "../domain/session";
import type { SessionAllocationDirective } from "../domain/sessionPlanningDirective";
import type { PrescriptionBlockContributionClassification } from "../prescription/designContracts";
import type { ExerciseDose, ExerciseDoseMode } from "../prescription/dose";
import type {
  PrescriptionDurationInterval,
  PrescriptionSessionCompilationResult,
  ProductionPrescriptionDoseBlock,
} from "../prescription/compiler/contracts";
import type { EvidenceProvenance } from "../prescription/types";
import type {
  FinalSequencedSessionDurationInterval,
  ProductionFinalSessionSequencingResult,
} from "../sequencing/contracts";
import type { SessionSkeleton } from "../sessionComposer/contracts";
import type {
  SessionAllocationReservation,
  WeekAllocationPlan,
  WeekPlanningHorizon,
  WeeklyDevelopmentObjective,
  WeeklyIntent,
} from "../weekComposer/designContracts";

/** Design-only contracts. This module is intentionally absent from the package index. */

export const POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_STATUS =
  "POST_PRESCRIPTION_WEEK_VALIDATION_V1_DESIGN_EVIDENCE_NOT_PRODUCTION" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_ID =
  "POST_PRESCRIPTION_WEEK_VALIDATION_V1_DESIGN_CONTRACT" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_VERSION = "1.0.0" as const;

export interface PostPrescriptionWeekValidationContractReference {
  readonly contractId: typeof POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_ID;
  readonly contractVersion: typeof POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_VERSION;
}

export const POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE:
PostPrescriptionWeekValidationContractReference = Object.freeze({
  contractId: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_ID,
  contractVersion: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_VERSION,
});

export type PostPrescriptionWeekValidationClassification =
  | "POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION"
  | "POST_PRESCRIPTION_WEEK_VALIDATION_V1_SUPPORTED_SCOPE_READY_TARGETED_POLICY_GAPS"
  | "TARGETED_POST_PRESCRIPTION_WEEK_VALIDATION_V1_FIXES_REQUIRED"
  | "POST_PRESCRIPTION_WEEK_VALIDATION_FOUNDATION_GAP";

export type PostPrescriptionWeekValidationOntologyClassification =
  | "POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_READY"
  | "TARGETED_POST_PRESCRIPTION_WEEK_DOMAIN_FIXES_REQUIRED"
  | "POST_PRESCRIPTION_WEEK_VALIDATION_FOUNDATION_GAP";

export type PostPrescriptionWeekInputAuthority =
  | "PRODUCTION_UPSTREAM_AUTHORITY"
  | "DESIGN_UPSTREAM_AUTHORITY"
  | "COMPATIBILITY_INPUT"
  | "FUTURE_PRODUCTION_ADAPTER_REQUIRED";

export interface PostPrescriptionWeekInputAuthorityTrace {
  readonly field: string;
  readonly authority: PostPrescriptionWeekInputAuthority;
  readonly owner: string;
  readonly reasonCode: string;
}

export interface PostPrescriptionWeekPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface PostPrescriptionWeekFrequencyRule {
  readonly purpose: WeeklyDevelopmentObjective["purpose"];
  readonly required: readonly [minimum: number, target: number, softMaximum: number];
  readonly preferred: readonly [minimum: number, target: number, softMaximum: number];
  readonly optional: readonly [minimum: number, target: number, softMaximum: number];
  readonly sourceRuleId: string;
}

export interface PostPrescriptionWeekValidationPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly authority: "OWNER_SELECTED_DESIGN_EVIDENCE";
  readonly weekPolicyRef: PostPrescriptionWeekPolicyReference;
  readonly frequencyRules: readonly PostPrescriptionWeekFrequencyRule[];
  readonly supportedPurposes: readonly WeeklyDevelopmentObjective["purpose"][];
  readonly unsupportedScopes: readonly string[];
  readonly spacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING";
  readonly h1Policy: "MUSCLE_H1_SINGLE_FLEXIBLE";
  readonly h2Disposition: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE";
  readonly automaticSelection: false;
  readonly productionActivation: false;
  readonly provenance: EvidenceProvenance;
}

export type ExplicitPostPrescriptionWeekValidationPolicyInput =
  | PostPrescriptionWeekValidationPolicy
  | PostPrescriptionWeekPolicyReference
  | null;

export type PostPrescriptionWeekSessionAdmissibilityStatus =
  | "prescribed_and_sequenced"
  | "prescribed_duration_unresolved"
  | "definitely_over_budget"
  | "blocked_by_training_readiness"
  | "incomplete_prescription"
  | "incomplete_sequencing"
  | "search_inconclusive"
  | "missing_session_artifact"
  | "invalid_identity_chain";

export type ObjectivePrescribedRealizationStatus =
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

export type ObjectiveThresholdState = "below" | "met" | "above" | "pending" | "not_applicable";

export interface PostPrescriptionWeekSessionArtifact {
  readonly reservationId: string;
  readonly materializedDirective: SessionAllocationDirective | null;
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: SessionSkeleton;
  readonly prescriptionCompilation: PrescriptionSessionCompilationResult | null;
  readonly sequencingResult: ProductionFinalSessionSequencingResult | null;
}

export interface PostPrescriptionWeekValidationInput {
  readonly validationContract: PostPrescriptionWeekValidationContractReference;
  readonly athleteId: string;
  readonly weeklyIntent: WeeklyIntent;
  readonly weekAllocationPlan: WeekAllocationPlan;
  readonly orderedReservations: readonly SessionAllocationReservation[];
  readonly planningHorizon: WeekPlanningHorizon;
  readonly weekPolicyRef: PostPrescriptionWeekPolicyReference;
  readonly sessionArtifacts: readonly PostPrescriptionWeekSessionArtifact[];
  readonly exerciseRegistry: readonly ExerciseDefinition[];
  readonly evaluationTime: string;
  readonly validationPolicy: ExplicitPostPrescriptionWeekValidationPolicyInput;
  readonly validationPolicyRegistry?: readonly PostPrescriptionWeekValidationPolicy[];
}

export interface SessionAdmissibilityTrace {
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string | null;
  readonly executionAttemptId: string | null;
  readonly status: PostPrescriptionWeekSessionAdmissibilityStatus;
  readonly prescribedWorkPresent: boolean;
  readonly executableMinimumEligible: boolean;
  readonly durationState: FinalSequencedSessionDurationInterval["status"] | "unavailable";
  readonly reasonCodes: readonly string[];
}

export interface BlockPurposeView {
  readonly blockId: string;
  readonly purpose: ProductionPrescriptionDoseBlock["purpose"];
  readonly contributionClassification: PrescriptionBlockContributionClassification;
  readonly doseMode: ExerciseDoseMode;
  readonly objectiveIds: readonly string[];
  readonly developmentalCreditEligible: boolean;
  readonly reasonCodes: readonly string[];
}

export interface PlannedDoseLaneView {
  readonly sourceExposureEventId: string;
  readonly blockId: string;
  readonly mode: ExerciseDoseMode;
  readonly dose: ExerciseDose;
  readonly commensurableWithinModeOnly: true;
  readonly developmentalCreditEligible: boolean;
  readonly provenance: EvidenceProvenance;
}

export interface PlannedMuscleRelationshipView {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly muscle: MuscleGroup;
  readonly relationship: MuscleContributionRelationship;
  readonly blockIds: readonly string[];
  readonly doseModes: readonly ExerciseDoseMode[];
  readonly reviewStatus: ExerciseMuscleContribution["reviewStatus"];
  readonly fractionalCoefficient: null;
  readonly provenance: readonly string[];
}

export interface PlannedMovementActionCapacityView {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly ExerciseActionFunction[];
  readonly capacityLane: "loaded_carry" | "loaded_bracing" | "supported_stationary_capacity" | "none";
  readonly assessmentLane: "technique_quality" | "preparation_control" | "none";
  readonly recoveryLane: "prescribed_recovery_support" | "none";
  readonly provenance: readonly string[];
}

export type PlannedStressExposureResolutionState =
  | "intrinsic_planned_exposure"
  | "prescription_modified_exposure"
  | "variant_confirmed_exposure"
  | "dose_created_potential_unresolved"
  | "no_matching_prescribed_exposure"
  | "unknown_requires_review";

export interface PlannedStressExposureTrace {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly blockIds: readonly string[];
  readonly stressTag: JointStressTag;
  readonly source: ExerciseStressSource;
  readonly exposureScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly resolutionState: PlannedStressExposureResolutionState;
  readonly actualInjuryClaimed: false;
  readonly provenance: readonly string[];
}

export interface PlannedSourceExposureLedgerEntry {
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
  readonly sequencePlanId: string;
  readonly sequenceRevisionId: string;
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
  readonly blockPurposeViews: readonly BlockPurposeView[];
  readonly doseLanes: readonly PlannedDoseLaneView[];
  readonly muscleContributionViews: readonly PlannedMuscleRelationshipView[];
  readonly movementActionCapacityView: PlannedMovementActionCapacityView;
  readonly stressExposureViews: readonly PlannedStressExposureTrace[];
  readonly durationInterval: PrescriptionDurationInterval;
  readonly executionFeasibilityState: PostPrescriptionWeekSessionAdmissibilityStatus;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface SourceEventIntegrityTrace {
  readonly expectedEventCount: number;
  readonly observedEventCount: number;
  readonly observedUniqueEventCount: number;
  readonly duplicateEventCount: number;
  readonly missingEventCount: number;
  readonly orphanEventCount: number;
  readonly crossSessionEventCollisionCount: number;
  readonly stalePrescriptionRevisionCount: number;
  readonly staleSequenceRevisionCount: number;
  readonly sourceEventRewriteCount: number;
  readonly reasonCodes: readonly string[];
}

export interface WeeklyObjectivePrescribedRealizationTrace {
  readonly weeklyObjectiveId: string;
  readonly purpose: WeeklyDevelopmentObjective["purpose"];
  readonly priority: WeeklyDevelopmentObjective["priority"];
  readonly priorityOrder: number;
  readonly target: WeeklyDevelopmentObjective["selectionTarget"];
  readonly allocatedReservationIds: readonly string[];
  readonly prescribedQualifyingReservationIds: readonly string[];
  readonly pendingDurationReservationIds: readonly string[];
  readonly nonexecutiveReservationIds: readonly string[];
  readonly qualifyingSourceEventIds: readonly string[];
  readonly nonqualifyingSourceEvents: readonly { eventId: string; reasonCodes: readonly string[] }[];
  readonly relevantBlockIds: readonly string[];
  readonly relationshipEvidence: readonly string[];
  readonly prescribedFrequencyCount: number;
  readonly minimumState: ObjectiveThresholdState;
  readonly targetState: ObjectiveThresholdState;
  readonly softMaximumState: ObjectiveThresholdState;
  readonly dosePolicyState: "prescribed_dose_target_not_defined" | "explicit_reviewed_target" | "not_applicable";
  readonly spacingState: PostPrescriptionWeekSpacingResult;
  readonly status: ObjectivePrescribedRealizationStatus;
  readonly unresolvedRefs: readonly string[];
  readonly provenance: readonly string[];
}

export interface PlannedBurdenVector {
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
  readonly observedRecoveryCost: null;
  readonly aggregateScore: null;
}

export type PlannedConcentrationKind =
  | "repeated_objective_in_one_session"
  | "repeated_muscle_primary_target"
  | "repeated_key_secondary"
  | "axial_loading_concentration"
  | "grip_loading_concentration"
  | "trunk_bracing_concentration"
  | "repeated_joint_stress_tag"
  | "several_high_effort_developmental_events"
  | "supporting_work_accumulation";

export interface PlannedConcentrationTrace {
  readonly kind: PlannedConcentrationKind;
  readonly reservationIds: readonly string[];
  readonly sourceExposureEventIds: readonly string[];
  readonly observationOnly: true;
  readonly hardLimitPolicyRef: null;
}

export interface PlannedWeeklyDurationView {
  readonly knownLowerBoundSeconds: number;
  readonly knownUpperBoundSeconds: number | null;
  readonly sessionUnknowns: readonly { reservationId: string; components: readonly string[] }[];
  readonly definitelyOverBudgetReservationIds: readonly string[];
  readonly possiblyOverBudgetReservationIds: readonly string[];
  readonly unresolvedReservationIds: readonly string[];
  readonly totalDurationKnown: boolean;
  readonly physiologicalDoseMetric: false;
}

export type PostPrescriptionWeekSpacingResult =
  | "spacing_policy_not_defined"
  | "elapsed_time_unknown"
  | "prescribed_burden_known_response_missing"
  | "prescribed_burden_unknown"
  | "structurally_distributed"
  | "structurally_concentrated"
  | "explicit_spacing_requirement_met"
  | "explicit_spacing_requirement_not_met"
  | "response_dependent";

export interface PlannedSpacingTrace {
  readonly weeklyObjectiveId: string;
  readonly earlierReservationId: string;
  readonly laterReservationId: string;
  readonly elapsedMinutes: number | null;
  readonly elapsedTimeKnown: boolean;
  readonly orderedOpportunityGap: number;
  readonly prescribedBurdenKnown: boolean;
  readonly responseEvidenceAvailable: false;
  readonly applicableSpacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING";
  readonly result: PostPrescriptionWeekSpacingResult;
}

export type PostPrescriptionWeekArgumentStatus =
  | "coherent_within_supported_scope"
  | "coherent_with_unresolved_dose_sufficiency"
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

export interface PlannedPrescribedWeekArgumentTrace {
  readonly status: PostPrescriptionWeekArgumentStatus;
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
  readonly validationAddedExerciseCount: 0;
  readonly validationRemovedExerciseCount: 0;
  readonly plannedFactsCalledCompletedCount: 0;
  readonly reasonCodes: readonly string[];
}

export const POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES = [
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

export type PostPrescriptionWeekGate13Subgate =
  (typeof POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES)[number];

export interface PostPrescriptionWeekGate13Trace {
  readonly subgate: PostPrescriptionWeekGate13Subgate;
  readonly state: "PASS" | "FAIL_STOP" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export interface PostPrescriptionWeekValidationDecisionTrace {
  readonly inputAuthorityTrace: readonly PostPrescriptionWeekInputAuthorityTrace[];
  readonly policyResolutionTrace: readonly string[];
  readonly sessionInventoryTrace: readonly string[];
  readonly identityTrace: readonly string[];
  readonly blockContributionTrace: readonly string[];
  readonly objectiveMappingTrace: readonly string[];
  readonly doseLaneTrace: readonly string[];
  readonly stressDurationTrace: readonly string[];
  readonly spacingTrace: readonly string[];
  readonly noDownstreamRescueTrace: readonly string[];
  readonly completedPerformanceConsumed: false;
  readonly longitudinalDecisionConsumed: false;
  readonly finalReasonCodes: readonly string[];
}

export interface PostPrescriptionWeekValidationResult {
  readonly validationContract: PostPrescriptionWeekValidationContractReference;
  readonly authority: "POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE";
  readonly productionActivationStatus: "NOT_ACTIVATED";
  readonly athleteId: string;
  readonly weeklyIntentId: string;
  readonly weekAllocationPlanId: string;
  readonly planningHorizonId: string;
  readonly status: PostPrescriptionWeekArgumentStatus;
  readonly sourceExposureLedger: readonly PlannedSourceExposureLedgerEntry[];
  readonly objectiveRealizationTraces: readonly WeeklyObjectivePrescribedRealizationTrace[];
  readonly sessionAdmissibilityTraces: readonly SessionAdmissibilityTrace[];
  readonly doseLaneSummaries: readonly PlannedDoseLaneView[];
  readonly muscleRelationshipViews: readonly PlannedMuscleRelationshipView[];
  readonly movementActionCapacityViews: readonly PlannedMovementActionCapacityView[];
  readonly stressTraces: readonly PlannedStressExposureTrace[];
  readonly burdenVectors: readonly PlannedBurdenVector[];
  readonly concentrationTraces: readonly PlannedConcentrationTrace[];
  readonly spacingTraces: readonly PlannedSpacingTrace[];
  readonly weeklyDurationView: PlannedWeeklyDurationView;
  readonly sourceEventIntegrityTrace: SourceEventIntegrityTrace;
  readonly completeWeekArgument: PlannedPrescribedWeekArgumentTrace;
  readonly unsupportedScopes: readonly string[];
  readonly unresolvedPolicies: readonly string[];
  readonly gate13Trace: readonly PostPrescriptionWeekGate13Trace[];
  readonly decisionTrace: PostPrescriptionWeekValidationDecisionTrace;
  readonly provenance: readonly EvidenceProvenance[];
}
