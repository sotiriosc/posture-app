import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { ExerciseActionFunction } from "../domain/exercise";
import type { MuscleRelationshipRequirement } from "../domain/exerciseSelectionNeed";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { PhaseId, PhaseIntent } from "../domain/phase";
import type { BodyRegion, ExperienceLevel, JointStressTag, MovementRole, MuscleGroup } from "../domain/primitives";
import type {
  CurrentSessionAvailability,
  CurrentSessionEquipment,
  ProgrammingContextMode,
  SessionAllocationDirective,
  TrainingOutcomeGoal,
  UnresolvedPlannerContextObservation,
} from "../domain/sessionPlanningDirective";
import type { StructuralCapacityMode } from "../domain/session";
import type { TrainingResponseHistory } from "../domain/trainingResponse";
import type { TrainingReadinessTrace, TrainingSafetyState } from "../domain/trainingSafety";

/** Design-only contracts. This module is intentionally absent from the package index. */

export type WeekDesignClassification =
  | "DESIGN_READY"
  | "OWNER_POLICY_REQUIRED"
  | "HUMAN_REVIEW_REQUIRED"
  | "DOMAIN_CHANGE_REQUIRED"
  | "DEFER_TO_PRESCRIPTION"
  | "DEFER_TO_LONGITUDINAL_ADAPTATION"
  | "DEFER_TO_PRODUCT_ADAPTER"
  | "OUT_OF_SCOPE";

export type WeekDesignOverallClassification =
  | "WEEK_LAYER_DESIGN_READY_FOR_OWNER_POLICY_APPROVAL"
  | "TARGETED_WEEK_DESIGN_DECISIONS_REQUIRED"
  | "WEEK_ONTOLOGY_FOUNDATION_GAP";

export type WeekFactTruthState =
  | "expected_future_fact"
  | "actual_current_fact"
  | "planned_allocation"
  | "prescribed_dose"
  | "completed_performance"
  | "observed_response";

export interface WeekFactProvenance {
  readonly sourceType:
    | "product_adapter"
    | "coach_weekly_brief"
    | "athlete_explicit_input"
    | "reviewed_programming_policy"
    | "external_activity_source"
    | "training_history"
    | "owner_decision"
    | "non_production_fixture"
    | "unknown";
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly recordedAt: string;
  readonly reviewStatus: "accepted" | "needs_review" | "unknown";
  readonly truthState: WeekFactTruthState;
}

export type WeekPlanningBoundary =
  | {
      readonly kind: "explicit_date_range";
      readonly startDate: string;
      readonly endDate: string;
    }
  | {
      readonly kind: "ordered_cycle";
      readonly cycleRef: string;
      readonly startOrder: number;
      readonly endOrder: number;
    };

export type WeekOpportunityAvailabilityStatus =
  | "available"
  | "tentative"
  | "cancelled"
  | "completed"
  | "unknown";

export type WeekOpportunityCompletionStatus =
  | "not_started"
  | "completed"
  | "missed"
  | "cancelled"
  | "unknown";

export interface ExpectedSessionAvailability {
  readonly availableMinutes: number | null;
  readonly structuralCapacity: StructuralCapacityMode;
  readonly provenance: WeekFactProvenance;
}

export type ExpectedSessionEquipment =
  | {
      readonly kind: "capability_snapshot";
      readonly capabilities: EquipmentCapabilities;
      readonly provenance: WeekFactProvenance;
    }
  | {
      readonly kind: "equipment_reference";
      readonly equipmentRef: string;
      readonly provenance: WeekFactProvenance;
    }
  | {
      readonly kind: "unknown";
      readonly provenance: WeekFactProvenance;
    };

export interface WeekOpportunityConstraint {
  readonly constraintId: string;
  readonly kind:
    | "must_precede_opportunity"
    | "must_follow_opportunity"
    | "single_session_only"
    | "external_load_proximity"
    | "accessibility_requirement"
    | "unknown";
  readonly targetOpportunityIds: readonly string[];
  readonly required: boolean;
  readonly provenance: WeekFactProvenance;
}

export interface WeekTrainingOpportunity {
  readonly id: string;
  readonly calendarDateRef?: string;
  readonly order: number;
  readonly expectedAvailability: ExpectedSessionAvailability;
  readonly expectedEquipment: ExpectedSessionEquipment;
  readonly provenance: WeekFactProvenance;
  readonly availabilityStatus: WeekOpportunityAvailabilityStatus;
  readonly completionStatus: WeekOpportunityCompletionStatus;
  readonly constraints: readonly WeekOpportunityConstraint[];
  readonly unresolvedActualDayContextRefs: readonly string[];
}

export interface UnresolvedWeekContextObservation {
  readonly observationId: string;
  readonly category:
    | "schedule"
    | "current_availability"
    | "current_equipment"
    | "recovery_readiness"
    | "illness_or_safety"
    | "external_training_load"
    | "accessibility"
    | "social_or_environmental"
    | "programming_policy"
    | "unknown";
  readonly proposedOwner: string;
  readonly resolutionState: "requires_typed_input" | "owner_policy_required" | "externally_resolved";
  readonly blocksWeeklyIntent: boolean;
  readonly blocksAllocation: boolean;
  readonly sourceRef: string;
  readonly explanation: string;
}

export interface WeekPlanningHorizon {
  readonly id: string;
  readonly athleteId: string;
  readonly boundary: WeekPlanningBoundary;
  readonly evaluationAsOf: string;
  readonly opportunities: readonly WeekTrainingOpportunity[];
  readonly provenance: WeekFactProvenance;
  readonly timezone?: string;
  readonly calendarRef?: string;
  readonly completedOpportunityIds: readonly string[];
  readonly remainingOpportunityIds: readonly string[];
  readonly unresolvedScheduleContext: readonly UnresolvedWeekContextObservation[];
}

export type WeeklyPolicySourceType =
  | "owner_decision"
  | "human_exercise_science_review"
  | "external_reference"
  | "NON_PRODUCTION_POLICY_FIXTURE";

export interface WeeklyPolicyRuleScope {
  readonly outcomeGoals: readonly TrainingOutcomeGoal[];
  readonly secondaryGoals: readonly TrainingOutcomeGoal[];
  readonly experienceLevels: readonly ExperienceLevel[];
  readonly phaseIds: readonly PhaseId[];
  readonly contextModes: readonly ProgrammingContextMode[];
  readonly objectivePurposes: readonly WeeklyDevelopmentPurpose[];
  readonly targetTypes: readonly ("movement" | "action" | "muscle" | "capacity" | "assessment")[];
  readonly populations: readonly string[];
  readonly horizonCapacity: readonly StructuralCapacityMode[];
}

export type ReviewedWeeklyPolicyRule = {
  readonly id: string;
  readonly scope: WeeklyPolicyRuleScope;
  readonly evidenceRefs: readonly string[];
  readonly overridesRuleIds: readonly string[];
} & (
  | { readonly kind: "participation_intent"; readonly candidateRef: string;
      readonly executableState: "value_not_approved" }
  | { readonly kind: "objective_frequency_intent"; readonly candidateRef: string;
      readonly executableState: "value_not_approved" }
  | { readonly kind: "direct_development_ownership";
      readonly directRequirement: "primary_required_or_exact_action"; readonly secondaryCredit: "no_numeric_credit";
    }
  | { readonly kind: "assessment_recurrence";
      readonly clusterLimit: "one_weekly_objective_per_coherent_cluster"; readonly additionalFrequency: "explicit_authority_required";
    }
  | { readonly kind: "spacing_requirement"; readonly spacingBasis: WeeklyRecoverySpacingBasis }
  | { readonly kind: "soft_ceiling_behavior"; readonly behavior: "review_unique_marginal_value" }
  | { readonly kind: "constrained_horizon_priority"; readonly behavior: "required_before_preferred_before_optional" }
  | { readonly kind: "phase_applicability"; readonly behavior: "select_applicable_rule_without_multiplier" }
  | { readonly kind: "conflict_resolution"; readonly behavior: "explicit_override_or_weekly_policy_conflict" }
);

export interface ReviewedWeeklyProgrammingPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly sourceType: WeeklyPolicySourceType;
  readonly sourceRefs: readonly string[];
  readonly evidenceBasis: readonly string[];
  readonly reviewer: string;
  readonly reviewedAt: string;
  readonly applicableGoals: readonly TrainingOutcomeGoal[];
  readonly applicableExperienceLevels: readonly ExperienceLevel[];
  readonly applicablePhaseIds: readonly PhaseId[];
  readonly applicableContextModes: readonly ProgrammingContextMode[];
  readonly ruleRefs: readonly string[];
  readonly rules: readonly ReviewedWeeklyPolicyRule[];
  readonly explicitUnknowns: readonly string[];
}

export type WeeklyDevelopmentPurpose =
  | "movement_development"
  | "muscle_development"
  | "direct_action_development"
  | "capacity_development"
  | "conditioning_development"
  | "assessment_priority_development"
  | "recovery_support";

export interface WeeklySelectionTarget {
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetActionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly muscleRequirement: MuscleRelationshipRequirement;
  readonly targetBodyRegions: readonly BodyRegion[];
}

export interface WeeklyObjectiveSourceEvidence {
  readonly sourceKind:
    | "reviewed_policy"
    | "coach_weekly_priority"
    | "user_explicit_weekly_priority"
    | "external_weekly_brief"
    | "assessment_with_reviewed_policy";
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
  readonly provenance: WeekFactProvenance;
}

export interface WeeklyFrequencyIntent {
  readonly minimumAllocatedSessions: number;
  readonly targetAllocatedSessions: number;
  readonly softMaximumAllocatedSessions: number;
  readonly source:
    | "reviewed_policy"
    | "coach_allocation"
    | "explicit_owner_decision"
    | "externally_supplied_weekly_brief";
  readonly sourceRef: string;
  readonly provenance: WeekFactProvenance;
}

export type WeeklyDosePolicyReference =
  | {
      readonly state: "pending_prescription_policy" | "unknown";
      readonly policyRef?: string;
    }
  | {
      readonly state: "explicit_reviewed_target";
      readonly policyRef: string;
    }
  | {
      readonly state: "not_applicable";
      readonly policyRef?: string;
    };

export type WeeklySessionRoleFlexibility = "main" | "secondary" | "accessory";

export interface WeeklyObjectiveGoalRelationship {
  readonly goal: TrainingOutcomeGoal;
  readonly relationship: "primary_weekly_goal" | "secondary_weekly_goal" | "cross_goal_support";
  readonly sourceEvidenceRefs: readonly string[];
}

export interface WeeklyDevelopmentObjective {
  readonly id: string;
  readonly purpose: WeeklyDevelopmentPurpose;
  readonly selectionTarget: WeeklySelectionTarget;
  readonly priority: "required" | "preferred" | "optional";
  readonly priorityOrder: number;
  readonly sourceEvidence: readonly WeeklyObjectiveSourceEvidence[];
  readonly goalRelationships: readonly WeeklyObjectiveGoalRelationship[];
  readonly frequencyIntent?: WeeklyFrequencyIntent;
  readonly dosePolicyReference: WeeklyDosePolicyReference;
  readonly recoverySpacingRequirementRefs: readonly string[];
  readonly sessionRoleFlexibility: readonly WeeklySessionRoleFlexibility[];
  readonly unresolvedPolicyState:
    | "resolved_for_allocation"
    | "FREQUENCY_POLICY_REQUIRED"
    | "dose_policy_pending"
    | "recovery_policy_required"
    | "unsupported";
  readonly reasonCode: string;
  readonly explanation: string;
}

export type WeeklyRecoverySpacingBasis =
  | { readonly kind: "ordered_opportunity_gap"; readonly minimumGap: number }
  | { readonly kind: "elapsed_time_duration"; readonly minimumDurationMinutes: number;
      readonly requiresExplicitTimeWindows: true }
  | { readonly kind: "unknown_pending_prescription"; readonly unresolvedReason: string }
  | { readonly kind: "external_event_spacing"; readonly externalEventRefs: readonly string[];
      readonly reviewedRuleRef: string };

export interface WeeklyRecoverySpacingRequirement {
  readonly id: string;
  readonly weeklyObjectiveIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly muscles: readonly MuscleGroup[];
  readonly stressTags: readonly JointStressTag[];
  readonly capacityLanes: readonly ("capacity" | "conditioning" | "stress_monitoring")[];
  readonly spacingBasis: WeeklyRecoverySpacingBasis;
  readonly required: boolean;
  readonly policySourceRef: string;
  readonly provenance: WeekFactProvenance;
  readonly unresolvedPrescriptionDependency: boolean;
}

export interface ExternalTrainingLoadEvent {
  readonly id: string;
  readonly kind:
    | "sport_practice"
    | "manual_work"
    | "running"
    | "class"
    | "competition"
    | "other_resistance_training";
  readonly opportunityProximityRefs: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly stressTags: readonly JointStressTag[];
  readonly expectedOrObserved: "expected" | "observed";
  readonly provenance: WeekFactProvenance;
  readonly reviewedReceiverState: "reviewed_policy_available" | "unresolved_context";
}

export interface WeekStructureContinuityEvidence {
  readonly previousWeeklyObjectiveIds: readonly string[];
  readonly previousSessionResponsibilitySignatures: readonly string[];
  readonly productiveAllocationRelationships: readonly {
    readonly objectiveId: string;
    readonly responsibilitySignature: string;
    readonly sourceEvidenceRefs: readonly string[];
  }[];
  readonly completedOpportunityIds: readonly string[];
  readonly missedOpportunityIds: readonly string[];
  readonly objectiveSatisfactionStates: Readonly<Record<string, WeekObjectiveSatisfactionState>>;
  readonly scheduleMovementRefs: readonly string[];
  readonly maintenanceReasonRefs: readonly string[];
  readonly changeReasonRefs: readonly string[];
}

export interface WeeklyIntentSourceTrace {
  readonly plannerId: "weekly_intent_planner_design_v1";
  readonly sourceRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly transformationRuleRefs: readonly string[];
}

export interface WeeklyIntent {
  readonly id: string;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly orderedSecondaryGoals: readonly TrainingOutcomeGoal[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly phaseIntentRef: PhaseId;
  readonly objectives: readonly WeeklyDevelopmentObjective[];
  readonly policyReferences: readonly string[];
  readonly assessmentPriorityReferences: readonly string[];
  readonly painSafetyContextReferences: readonly string[];
  readonly continuityEvidence: WeekStructureContinuityEvidence;
  readonly currentHorizonOpportunityReferences: readonly string[];
  readonly unresolvedContext: readonly UnresolvedWeekContextObservation[];
  readonly sourceTrace: WeeklyIntentSourceTrace;
}

export interface ExplicitWeeklyPriority {
  readonly id: string;
  readonly purpose: WeeklyDevelopmentPurpose;
  readonly target: WeeklySelectionTarget;
  readonly priority: "required" | "preferred" | "optional";
  readonly priorityOrder: number;
  readonly frequencyIntent?: WeeklyFrequencyIntent;
  readonly dosePolicyReference: WeeklyDosePolicyReference;
  readonly sourceEvidence: readonly WeeklyObjectiveSourceEvidence[];
  readonly goalRelationships: readonly WeeklyObjectiveGoalRelationship[];
}

export interface WeeklyIntentPlannerInput {
  readonly athlete: AthleteProfile;
  readonly explicitOutcomeGoal?: TrainingOutcomeGoal;
  readonly orderedSecondaryGoals: readonly TrainingOutcomeGoal[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly phaseIntent: PhaseIntent;
  readonly planningHorizon: WeekPlanningHorizon;
  readonly assessment: AssessmentState;
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety: TrainingSafetyState;
  readonly history: TrainingHistory;
  readonly trainingResponseHistory: TrainingResponseHistory;
  readonly explicitWeeklyPriorities: readonly ExplicitWeeklyPriority[];
  readonly reviewedPolicy?: ReviewedWeeklyProgrammingPolicy;
  readonly externalLoadContext: readonly ExternalTrainingLoadEvent[];
  readonly evaluationAsOf: string;
}

export type WeeklyIntentPlanningStatus =
  | "weekly_intent_planned"
  | "weekly_goal_under_specified"
  | "weekly_policy_required"
  | "current_week_availability_required"
  | "contradictory_week_input"
  | "blocked_by_training_readiness"
  | "unsupported_context";

export interface WeekDesignFinding {
  readonly severity: "error" | "warning" | "observation";
  readonly code: string;
  readonly owner: string;
  readonly sourceRef: string;
  readonly classification: WeekDesignClassification;
  readonly message: string;
}

export interface WeeklyObjectiveDecisionTrace {
  readonly objectiveId: string;
  readonly sourcePriorityIds: readonly string[];
  readonly ruleRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface WeeklyIntentPlanningResult {
  readonly status: WeeklyIntentPlanningStatus;
  readonly weeklyIntent: WeeklyIntent | null;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly includedObjectiveTraces: readonly WeeklyObjectiveDecisionTrace[];
  readonly omittedPriorityTraces: readonly WeeklyObjectiveDecisionTrace[];
  readonly mergedObjectiveTraces: readonly WeeklyObjectiveDecisionTrace[];
  readonly policyFindings: readonly WeekDesignFinding[];
  readonly contextOwnershipFindings: readonly WeekDesignFinding[];
  readonly unresolvedContext: readonly UnresolvedWeekContextObservation[];
  readonly decisionTrace: readonly string[];
}

export type SessionResponsibilityPurpose =
  | "dominant_main"
  | "secondary_main"
  | "secondary_accessory"
  | "direct_accessory"
  | "capacity_main"
  | "capacity_accessory"
  | "explicit_preparation"
  | "activation"
  | "recovery";

export interface ReservedSessionObjective {
  readonly id: string;
  readonly weeklyObjectiveId: string;
  readonly purpose: SessionResponsibilityPurpose;
  readonly weeklyObjectivePriority: "required" | "preferred" | "optional";
  /** Session-local priority after allocation; dominant ordinary-session responsibility is required locally. */
  readonly priority: "required" | "preferred" | "optional";
  readonly priorityOrder: number;
  readonly selectionTarget: WeeklySelectionTarget;
  readonly sourceEvidenceRefs: readonly string[];
  readonly reasonCode: string;
  readonly explanation: string;
}

export type SessionAllocationReservationStatus =
  | "reserved"
  | "completed_immutable"
  | "missed_requires_reallocation"
  | "cancelled_requires_reallocation"
  | "blocked_by_training_readiness"
  | "unresolved";

export interface SessionAllocationReservation {
  readonly id: string;
  readonly weekIntentId: string;
  readonly opportunityId: string;
  readonly athleteId: string;
  readonly sessionType: "ordinary_training";
  readonly weeklyPrimaryOutcomeGoal: TrainingOutcomeGoal;
  readonly weeklySecondaryOutcomeGoals: readonly TrainingOutcomeGoal[];
  readonly sessionOutcomeGoal: TrainingOutcomeGoal;
  readonly sessionGoalEvidence: readonly {
    readonly weeklyObjectiveId: string;
    readonly goalRelationship: WeeklyObjectiveGoalRelationship;
  }[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly allocatedObjectives: readonly ReservedSessionObjective[];
  readonly expectedStructuralCapacity: StructuralCapacityMode;
  readonly expectedAvailability: ExpectedSessionAvailability;
  readonly expectedEquipment: ExpectedSessionEquipment;
  readonly neighboringReservationRefs: readonly string[];
  readonly weeklyObjectiveSourceRefs: readonly string[];
  readonly unresolvedWeeklyContext: readonly UnresolvedWeekContextObservation[];
  readonly unresolvedCurrentSessionContext: readonly UnresolvedWeekContextObservation[];
  readonly status: SessionAllocationReservationStatus;
  readonly sourceTrace: {
    readonly composerId: "week_allocation_composer_design_v1";
    readonly sourceRefs: readonly string[];
    readonly policyRefs: readonly string[];
    readonly ruleRefs: readonly string[];
  };
}

export interface SessionAllocationMaterializationInput {
  readonly reservation: SessionAllocationReservation;
  readonly actualCurrentAvailability?: CurrentSessionAvailability;
  readonly actualCurrentEquipment?: CurrentSessionEquipment;
  readonly actualEvaluationTime: string;
  readonly actualSafetyState: TrainingSafetyState;
  readonly actualUnresolvedContext: readonly UnresolvedPlannerContextObservation[];
  readonly explicitProductUserUpdateRefs: readonly string[];
}

export type SessionAllocationMaterializationStatus =
  | "directive_materialized"
  | "requires_week_reallocation"
  | "under_specified_current_context"
  | "blocked_by_training_readiness"
  | "unsupported_context";

export interface SessionAllocationMaterializationResult {
  readonly status: SessionAllocationMaterializationStatus;
  readonly directive: SessionAllocationDirective | null;
  /** Existing production Planner input receives current equipment beside the directive. */
  readonly plannerCurrentEquipment: CurrentSessionEquipment | null;
  readonly expectedActualComparisonTrace: readonly string[];
  readonly retainedWeeklyObjectiveIds: readonly string[];
  readonly reallocationEvidenceRefs: readonly string[];
  readonly unresolvedContext: readonly UnresolvedPlannerContextObservation[];
  readonly decisionTrace: readonly string[];
}

export type SessionFeasibilityOracleStatus =
  | "feasible_session_skeleton"
  | "infeasible_objective_combination"
  | "candidate_review_required"
  | "prescription_resolution_required"
  | "search_inconclusive";

export interface PrecomputedSessionFeasibilityResult {
  readonly opportunityId: string;
  readonly objectiveIds: readonly string[];
  readonly status: SessionFeasibilityOracleStatus;
  readonly sourceTraceRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
}

export interface DeterministicWeekSearchPolicy {
  readonly policyId: string;
  readonly mode: "exhaustive_design_lab" | "bounded_design_proposal";
  readonly expandedStateBudget?: number;
  readonly retainedParetoFrontierPerLayer?: number;
  readonly fixedSeed?: number;
  readonly status: "NON_PRODUCTION_POLICY_FIXTURE";
}

export interface WeekAllocationCompositionInput {
  readonly weeklyIntent: WeeklyIntent;
  readonly planningHorizon: WeekPlanningHorizon;
  readonly orderedTrainingOpportunities: readonly WeekTrainingOpportunity[];
  readonly currentCompletionState: Readonly<Record<string, WeekOpportunityCompletionStatus>>;
  readonly previousWeekStructureEvidence: WeekStructureContinuityEvidence;
  readonly allocationPolicy: ReviewedWeeklyProgrammingPolicy;
  readonly recoverySpacingRequirements: readonly WeeklyRecoverySpacingRequirement[];
  readonly precomputedFeasibilityResults: readonly PrecomputedSessionFeasibilityResult[];
  readonly evaluationAsOf: string;
  readonly deterministicSearchPolicy: DeterministicWeekSearchPolicy;
}

export type WeekObjectiveSatisfactionState =
  | "allocated_minimum_opportunities"
  | "allocated_target_opportunities"
  | "below_minimum_unresolved"
  | "above_soft_ceiling_review"
  | "allocated_requires_session_feasibility"
  | "allocated_requires_prescription_validation"
  | "optional_not_allocated"
  | "blocked_by_availability"
  | "blocked_by_training_readiness"
  | "requires_week_reallocation"
  | "frequency_policy_required";

export interface WeekEvaluationVector {
  readonly hardValid: boolean;
  readonly requiredMinimumAllocationVector: readonly boolean[];
  readonly globalTrainingSafetyAllowsExecution: boolean;
  readonly opportunityLegalityVector: readonly boolean[];
  readonly requiredRecoverySpacingVector: readonly boolean[];
  readonly structuralContinuityVector: readonly boolean[];
  readonly sessionFeasibilityVector: readonly SessionFeasibilityOracleStatus[];
  readonly requiredFrequencyVector: readonly number[];
  readonly priorityFrequencyVector: readonly number[];
  readonly stressConcentrationBurden: number;
  readonly equipmentCapacityCoherenceVector: readonly boolean[];
  readonly preferredTargetAllocationVector: readonly boolean[];
  readonly optionalMarginalValueVector: readonly boolean[];
  readonly unnecessaryDuplicationBurden: number;
  readonly canonicalTieBreak: string;
}

export type WeekAllocationSearchCompleteness =
  | "exhaustive_design_optimal"
  | "exhaustive_design_infeasible"
  | "bounded_design_optimality_not_proven"
  | "search_inconclusive";

export interface WeekAllocationPlan {
  readonly status: "allocation_designed" | "allocation_infeasible" | "requires_policy" | "blocked" | "search_inconclusive";
  readonly weeklyIntentId: string;
  readonly reservations: readonly SessionAllocationReservation[];
  readonly objectiveAllocationTraces: Readonly<Record<string, readonly string[]>>;
  readonly unallocatedObjectiveTraces: Readonly<Record<string, readonly string[]>>;
  readonly recoverySpacingTraces: readonly string[];
  readonly continuityTraces: readonly string[];
  readonly equipmentAvailabilityTraces: readonly string[];
  readonly expectedStructuralCapacityTraces: readonly string[];
  readonly searchCompleteness: WeekAllocationSearchCompleteness;
  readonly wholeWeekEvaluation: WeekEvaluationVector | null;
  readonly objectiveSatisfactionStates: Readonly<Record<string, WeekObjectiveSatisfactionState>>;
  readonly unresolvedPrescriptionRequirements: readonly string[];
  readonly unresolvedCurrentSessionFacts: readonly string[];
  readonly reallocationState: "not_required" | "required" | "completed_history_preserved";
  readonly decisionTrace: readonly string[];
}

export interface AllocationLedgerEntry {
  readonly weeklyObjectiveId: string;
  readonly reservationIds: readonly string[];
  readonly allocatedOpportunityCount: number;
  readonly satisfactionState: WeekObjectiveSatisfactionState;
  readonly doseCredit: 0;
}

export interface PlannedPrescriptionLedgerEntry {
  readonly sourceExposureEventId: string;
  readonly reservationId: string;
  readonly exerciseId: string;
  readonly prescriptionRef: string;
  readonly roleSectionRef: string;
  readonly muscleContributionRelationshipRefs: readonly string[];
  readonly prescribedDoseRefs: readonly string[];
  readonly realizedStressRefs: readonly string[];
  readonly recoveryBurdenRefs: readonly string[];
}

export interface CompletedResponseLedgerEntry {
  readonly sourceExposureEventId: string;
  readonly performanceRecordRef: string;
  readonly adherenceRef: string;
  readonly executionQualityRef: string;
  readonly symptomResponseRefs: readonly string[];
  readonly recoveryResponseRefs: readonly string[];
  readonly progressionResponseRefs: readonly string[];
  readonly reExposureRefs: readonly string[];
}

export type StandaloneRecoverySessionDesignVerdict =
  | "READY_FOR_SEPARATE_DESIGN"
  | "KEEP_DEFERRED"
  | "CAN_USE_ORDINARY_SESSION_WITH_EXPLICIT_RECOVERY_OBJECTIVE";

export interface ReviewedPolicyQuestion {
  readonly id: string;
  readonly topic:
    | "weekly_set_targets"
    | "frequency_superiority"
    | "recovery_spacing"
    | "direct_secondary_credit"
    | "deload_schedule"
    | "phase_volume_adjustment";
  readonly status:
    | "OWNER_DECISION_REQUIRED"
    | "HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED"
    | "EXTERNAL_REFERENCE_PENDING"
    | "CURRENTLY_UNSUPPORTED";
  readonly requiredEvidence: readonly string[];
  readonly prohibitedAssumptions: readonly string[];
}
