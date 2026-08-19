import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { ExerciseActionFunction } from "../domain/exercise";
import type { MuscleRelationshipRequirement } from "../domain/exerciseSelectionNeed";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { PhaseIntent } from "../domain/phase";
import type { BodyRegion, MovementRole, MuscleGroup } from "../domain/primitives";
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
import type { ProductionWeeklyExecutionRequirements } from "../domain/weeklyExecutionRequirements";

export const PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEK_PLANNING_SOURCE",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEKLY_INTENT_PLANNER",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEK_ALLOCATION_COMPOSER",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_SESSION_ALLOCATION_MATERIALIZER",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_REMAINING_WEEK_REALLOCATION",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEK_PLAN_REVISION",
  contractVersion: "1.0.0",
} as const);

export const PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_STATUS =
  "PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_CLASSIFICATION =
  "PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_READY_FOR_ADAPTATION_APPLICATION_ORCHESTRATION_AUTHORIZATION" as const;
export const PRODUCTION_WEEK_ONTOLOGY_CLASSIFICATION = "TARGETED_PRODUCTION_WEEK_DOMAIN_FIXES_REQUIRED" as const;

export const WEEK_POLICY_REQUIRED = "WEEK_POLICY_REQUIRED" as const;
export const WEEK_POLICY_UNAVAILABLE = "WEEK_POLICY_UNAVAILABLE" as const;
export const WEEK_POLICY_CONFLICT = "WEEK_POLICY_CONFLICT" as const;
export const WEEKLY_POLICY_REQUIRED = "WEEKLY_POLICY_REQUIRED" as const;
export const UNSUPPORTED_WEEK_OBJECTIVE_SCOPE = "UNSUPPORTED_WEEK_OBJECTIVE_SCOPE" as const;
export const CURRENT_WEEK_AVAILABILITY_REQUIRED = "CURRENT_WEEK_AVAILABILITY_REQUIRED" as const;
export const WEEK_DELOAD_POLICY_REQUIRED = "WEEK_DELOAD_POLICY_REQUIRED" as const;
export const SPACING_R0_PRESCRIPTION_PENDING = "SPACING_R0_PRESCRIPTION_PENDING" as const;

export type ProductionWeekContractReference =
  | typeof PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE
  | typeof PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE
  | typeof PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE
  | typeof PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE
  | typeof PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE
  | typeof PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE;

export type ProductionWeekPlanningSourceAuthority =
  | "explicit_user_fact"
  | "explicit_coach_fact"
  | "product_confirmed_fact"
  | "owner_decision"
  | "compatibility_adapter";

export interface ProductionWeekProvenance {
  readonly owner: "product_horizon_source" | "weekly_intent_planner" | "week_allocation_composer" |
    "session_allocation_materializer" | "remaining_week_reallocator" | "compatibility_adapter";
  readonly sourceRefs: readonly string[];
  readonly ruleRefs: readonly string[];
}

export type ProductionWeekPlanningBoundary =
  | { readonly kind: "explicit_date_range"; readonly startDate: string; readonly endDate: string }
  | { readonly kind: "ordered_cycle"; readonly cycleRef: string; readonly startOrder: number; readonly endOrder: number };

export type ProductionOpportunityConfirmationState =
  | "observed_free_window"
  | "suggested_training_opportunity"
  | "user_confirmed"
  | "coach_confirmed"
  | "product_confirmed"
  | "tentative"
  | "unavailable";

export type ProductionOpportunityAvailabilityStatus = "available" | "tentative" | "cancelled" | "unavailable" | "unknown";
export type ProductionOpportunityCompletionStatus = "not_started" | "completed" | "missed" | "cancelled" | "unknown";

export type ProductionExpectedEquipment =
  | { readonly kind: "capability_snapshot"; readonly capabilities: EquipmentCapabilities; readonly sourceRef: string }
  | { readonly kind: "equipment_reference"; readonly equipmentRef: string; readonly sourceRef: string }
  | { readonly kind: "unknown"; readonly sourceRef: string };

export interface ProductionWeekOpportunityConstraint {
  readonly constraintId: string;
  readonly kind: "must_precede_opportunity" | "must_follow_opportunity" | "single_session_only" |
    "external_load_proximity" | "accessibility_requirement" | "unknown";
  readonly targetOpportunityIds: readonly string[];
  readonly required: boolean;
  readonly sourceRef: string;
}

export interface ProductionWeekTrainingOpportunity {
  readonly opportunityId: string;
  readonly opportunityRevisionId: string;
  readonly intendedWindowRef: string;
  readonly order: number;
  readonly timeWindow?: { readonly startsAt: string; readonly endsAt: string; readonly timezone: string };
  readonly availabilityStatus: ProductionOpportunityAvailabilityStatus;
  readonly completionStatus: ProductionOpportunityCompletionStatus;
  readonly expectedAvailableMinutes: number | null;
  readonly expectedStructuralCapacity: StructuralCapacityMode;
  readonly expectedEquipment: ProductionExpectedEquipment;
  readonly locationRef?: string;
  readonly constraints: readonly ProductionWeekOpportunityConstraint[];
  readonly confirmationState: ProductionOpportunityConfirmationState;
  readonly sourceAuthority: ProductionWeekPlanningSourceAuthority;
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionWeekUnresolvedContext {
  readonly observationId: string;
  readonly category: "schedule" | "current_availability" | "current_equipment" | "recovery_readiness" |
    "illness_or_safety" | "external_training_load" | "accessibility" | "social_or_environmental" |
    "programming_policy" | "unknown";
  readonly owner: "product_horizon_source" | "training_safety" | "weekly_policy" | "application_orchestration" | "unknown";
  readonly resolutionState: "requires_typed_input" | "owner_policy_required" | "externally_resolved";
  readonly blocksWeeklyIntent: boolean;
  readonly blocksAllocation: boolean;
  readonly sourceRef: string;
}

export interface ProductionProfileWeekDefaults {
  readonly typicalDaysPerWeek: number;
  readonly typicalMinutes: number | null;
  readonly preferredDayRefs: readonly string[];
  readonly equipmentRef?: string;
  readonly confirmationState: "tentative";
  readonly sourceRef: string;
}

export type ProductionWeekPlanningHorizonId = string;
export type ProductionWeekPlanningHorizonRevisionId = string;

export interface ProductionWeekPlanningHorizonIdentity {
  readonly horizonId: ProductionWeekPlanningHorizonId;
  readonly athleteId: string;
  readonly boundary: ProductionWeekPlanningBoundary;
  readonly lineageAttemptId: string;
}

export interface ProductionWeekPlanningHorizonRevision {
  readonly horizonId: ProductionWeekPlanningHorizonId;
  readonly horizonRevisionId: ProductionWeekPlanningHorizonRevisionId;
  readonly basedOnRevisionId: ProductionWeekPlanningHorizonRevisionId | null;
  readonly opportunityRevisionIds: readonly string[];
  readonly unresolvedContextIds: readonly string[];
  readonly evaluationTime: string;
}

export interface ProductionWeekPlanningSourceSnapshot {
  readonly sourceContract: typeof PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE;
  readonly sourceSnapshotId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly athleteId: string;
  readonly planningHorizonId: ProductionWeekPlanningHorizonId;
  readonly horizonRevisionId: ProductionWeekPlanningHorizonRevisionId;
  readonly planningBoundary: ProductionWeekPlanningBoundary;
  readonly evaluationTime: string;
  readonly timezone?: string;
  readonly opportunities: readonly ProductionWeekTrainingOpportunity[];
  readonly profileDefaults?: ProductionProfileWeekDefaults;
  readonly priorHorizonRevisionId: ProductionWeekPlanningHorizonRevisionId | null;
  readonly unresolvedContext: readonly ProductionWeekUnresolvedContext[];
  readonly sourceAuthority: ProductionWeekPlanningSourceAuthority;
  readonly provenance: ProductionWeekProvenance;
}

export type ProductionWeekObjectiveFamily = "strength" | "muscle" | "direct" | "assessment" | "capacity" |
  "participation" | "spacing";
export type ProductionPlanningObjectivePriority = "required" | "preferred" | "optional";
export type ProductionWeekObjectivePurpose = "movement_development" | "muscle_development" |
  "direct_action_development" | "capacity_development" | "assessment_priority_development" | "recovery_support";

export interface ProductionWeekPlanningFrequencyIntent {
  readonly minimumAllocatedSessions: number;
  readonly targetAllocatedSessions: number;
  readonly softMaximumAllocatedSessions: number;
  readonly sourceRef: string;
}

export interface ProductionWeekPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface ProductionWeekFrequencyRule {
  readonly family: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing">;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly frequency: ProductionWeekPlanningFrequencyIntent;
  readonly ruleId: string;
}

export interface ProductionWeekPolicy {
  readonly reference: ProductionWeekPolicyReference;
  readonly historicalCompatibilityLabels: readonly string[];
  readonly frequencyRules: readonly ProductionWeekFrequencyRule[];
  readonly participationState: "advisory_only_no_executable_frequency";
  readonly spacingState: typeof SPACING_R0_PRESCRIPTION_PENDING;
  readonly supportedScopes: readonly string[];
  readonly unsupportedScopes: readonly string[];
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionWeekPolicyRegistry {
  readonly policies: readonly ProductionWeekPolicy[];
}

export type ProductionWeekPolicyInput = ProductionWeekPolicy | ProductionWeekPolicyReference | null;

export interface ProductionWeeklySelectionTarget {
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetActionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly muscleRequirement: MuscleRelationshipRequirement;
  readonly targetBodyRegions: readonly BodyRegion[];
}

export interface ProductionWeeklyObjectiveSourceEvidence {
  readonly sourceKind: "reviewed_policy" | "coach_weekly_priority" | "user_explicit_weekly_priority" |
    "external_weekly_brief" | "assessment_with_reviewed_policy";
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
}

export interface ProductionWeeklyObjectiveGoalRelationship {
  readonly goal: TrainingOutcomeGoal;
  readonly relationship: "primary_weekly_goal" | "secondary_weekly_goal" | "cross_goal_support";
  readonly sourceEvidenceRefs: readonly string[];
}

export interface ProductionExplicitWeeklyPriority {
  readonly priorityId: string;
  readonly family: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing">;
  readonly purpose: ProductionWeekObjectivePurpose;
  readonly target: ProductionWeeklySelectionTarget;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly sourceEvidence: readonly ProductionWeeklyObjectiveSourceEvidence[];
  readonly goalRelationships: readonly ProductionWeeklyObjectiveGoalRelationship[];
  readonly exactActionOwnership?: "primary_required" | "exact_action";
  readonly uniqueMarginalValueRef?: string;
  readonly executionRequirements?: ProductionWeeklyExecutionRequirements;
}

export type ProductionWeeklyObjectivePolicyState = "resolved_for_allocation" | "frequency_policy_required" |
  "dose_policy_pending" | "recovery_policy_required" | "unsupported_objective_scope";

export interface ProductionWeeklyDevelopmentObjective {
  readonly objectiveId: string;
  readonly family: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing">;
  readonly purpose: ProductionWeekObjectivePurpose;
  readonly target: ProductionWeeklySelectionTarget;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly sourceEvidence: readonly ProductionWeeklyObjectiveSourceEvidence[];
  readonly sourcePriorityIds: readonly string[];
  readonly goalRelationships: readonly ProductionWeeklyObjectiveGoalRelationship[];
  readonly frequencyIntent: ProductionWeekPlanningFrequencyIntent;
  readonly dosePolicyState: "pending_prescription_policy" | "not_applicable";
  readonly spacingRequirementRefs: readonly string[];
  readonly roleFlexibility: readonly ("main" | "secondary" | "accessory")[];
  readonly uniqueMarginalValueRef: string | null;
  readonly policyState: ProductionWeeklyObjectivePolicyState;
  readonly reasonCode: "explicit_supported_weekly_priority" | "supported_primary_goal_responsibility" |
    "merged_structurally_equivalent_objective" | "explicit_recovery_support";
  readonly executionRequirements?: ProductionWeeklyExecutionRequirements;
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionWeeklyPriorityTrace {
  readonly objectiveId: string;
  readonly sourcePriorityIds: readonly string[];
  readonly ruleRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface ProductionWeekContinuityEvidence {
  readonly priorPlanRevisionId: string | null;
  readonly productiveRelationships: readonly {
    readonly objectiveLineageRef: string;
    readonly opportunityId: string;
    readonly sourceRefs: readonly string[];
  }[];
  readonly completedOpportunityIds: readonly string[];
  readonly missedOpportunityIds: readonly string[];
  readonly changeReasonRefs: readonly string[];
}

export type ProductionWeeklyIntentId = string;
export type ProductionWeeklyIntentRevisionId = string;

export interface ProductionWeeklyIntent {
  readonly intentId: ProductionWeeklyIntentId;
  readonly intentRevisionId: ProductionWeeklyIntentRevisionId;
  readonly basedOnRevisionId: ProductionWeeklyIntentRevisionId | null;
  readonly intentAttemptId: string;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly horizonRevisionId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly orderedSecondaryGoals: readonly TrainingOutcomeGoal[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly phaseIntentRef: string;
  readonly objectives: readonly ProductionWeeklyDevelopmentObjective[];
  readonly policyReference: ProductionWeekPolicyReference;
  readonly continuityEvidence: ProductionWeekContinuityEvidence;
  readonly unresolvedContext: readonly ProductionWeekUnresolvedContext[];
  readonly evaluationTime: string;
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionExternalLoadObservation {
  readonly observationId: string;
  readonly sourceRef: string;
  readonly materiallyBlocksPlanning: boolean;
  readonly receiverPolicyState: "unavailable";
}

export interface ProductionWeeklyIntentPlannerInput {
  readonly plannerContract: typeof PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE;
  readonly policy: ProductionWeekPolicyInput;
  readonly policyRegistry?: ProductionWeekPolicyRegistry;
  readonly sourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly athlete: AthleteProfile;
  readonly explicitOutcomeGoal: TrainingOutcomeGoal | null;
  readonly outcomeGoalLineageId: string;
  readonly orderedSecondaryGoals: readonly TrainingOutcomeGoal[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly phaseIntent: PhaseIntent;
  readonly assessment: AssessmentState;
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety: TrainingSafetyState;
  readonly history: TrainingHistory;
  readonly trainingResponseHistory: TrainingResponseHistory;
  readonly explicitWeeklyPriorities: readonly ProductionExplicitWeeklyPriority[];
  readonly externalLoadObservations: readonly ProductionExternalLoadObservation[];
  readonly continuityEvidence: ProductionWeekContinuityEvidence;
  readonly evaluationTime: string;
  readonly intentAttemptId: string;
  readonly priorIntentRevision?: ProductionWeeklyIntent;
}

export type ProductionWeeklyIntentPlanningStatus = "weekly_intent_planned" | "weekly_goal_under_specified" |
  "weekly_policy_required" | "current_week_availability_required" | "contradictory_week_input" |
  "blocked_by_training_readiness" | "unsupported_context" | "unsupported_contract_version" |
  "invalid_source_snapshot" | "invalid_prior_revision_context";

export interface ProductionWeeklyIntentPlanningResult {
  readonly status: ProductionWeeklyIntentPlanningStatus;
  readonly weeklyIntent: ProductionWeeklyIntent | null;
  readonly includedObjectiveTraces: readonly ProductionWeeklyPriorityTrace[];
  readonly omittedPriorityTraces: readonly ProductionWeeklyPriorityTrace[];
  readonly mergedObjectiveTraces: readonly ProductionWeeklyPriorityTrace[];
  readonly policyFindings: readonly string[];
  readonly ownershipFindings: readonly string[];
  readonly unresolvedContext: readonly ProductionWeekUnresolvedContext[];
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly decisionTrace: readonly string[];
  readonly provenance: ProductionWeekProvenance;
}

export type ProductionSessionResponsibilityPurpose = "dominant_main" | "secondary_main" | "secondary_accessory" |
  "direct_accessory" | "capacity_main" | "capacity_accessory" | "explicit_preparation" | "activation" | "recovery";

export interface ProductionReservedSessionObjective {
  readonly responsibilityId: string;
  readonly weeklyObjectiveId: string;
  readonly purpose: ProductionSessionResponsibilityPurpose;
  readonly weeklyObjectivePriority: ProductionPlanningObjectivePriority;
  readonly sessionLocalPriority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly target: ProductionWeeklySelectionTarget;
  readonly sourceEvidenceRefs: readonly string[];
  readonly reasonCode: "allocated_weekly_responsibility" | "explicit_assessment_or_preparation" |
    "explicit_recovery_responsibility";
  readonly executionRequirements?: ProductionWeeklyExecutionRequirements;
  readonly provenance: ProductionWeekProvenance;
}

export type ProductionSessionFeasibilityStatus = "feasible_session_skeleton" | "infeasible_objective_combination" |
  "candidate_review_required" | "prescription_resolution_required" | "blocked_by_training_readiness" |
  "search_inconclusive" | "unsupported_objective_scope" | "invalid_oracle_input";

export interface ProductionSessionFeasibilityOracleInput {
  readonly opportunity: ProductionWeekTrainingOpportunity;
  readonly objectives: readonly ProductionWeeklyDevelopmentObjective[];
  readonly evaluationTime: string;
  readonly sourceSnapshotRevisionId: string;
}

export interface ProductionSessionFeasibilityResult {
  readonly opportunityId: string;
  readonly opportunityRevisionId: string;
  readonly objectiveIds: readonly string[];
  readonly status: ProductionSessionFeasibilityStatus;
  readonly sourceRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly downstreamContractVersions: readonly string[];
  readonly resultFingerprint: string;
}

export interface ProductionSessionFeasibilityOracle {
  readonly oracleId: string;
  readonly oracleVersion: string;
  readonly evaluate: (input: ProductionSessionFeasibilityOracleInput) => ProductionSessionFeasibilityResult;
}

export interface ProductionWeekSearchResourcePolicy {
  readonly policyId: string;
  readonly version: string;
  readonly mode: "exact_only" | "exact_then_bounded_frontier";
  readonly maximumExpandedStates: number;
  readonly maximumCompletePlansEvaluated: number;
  readonly maximumParetoStatesRetained: number;
  readonly onLimit: "RETURN_SEARCH_INCONCLUSIVE";
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionWeeklyRecoverySpacingRequirement {
  readonly requirementId: string;
  readonly objectiveIds: readonly string[];
  readonly basis: { readonly kind: "ordered_opportunity_gap"; readonly minimumGap: number } |
    { readonly kind: "elapsed_time_duration"; readonly minimumDurationMinutes: number } |
    { readonly kind: "prescription_pending" };
  readonly required: boolean;
  readonly policySourceRef: string;
}

export interface ProductionWeekTopologyPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface ProductionWeekTopologyCoherenceGroup {
  readonly groupId: string;
  readonly objectiveIds: readonly string[];
}

export interface ProductionWeekTopologyPolicy {
  readonly reference: ProductionWeekTopologyPolicyReference;
  readonly scope: "controlled_owner_get_stronger_product_responsibilities";
  readonly eligibleObjectiveIds: readonly string[];
  readonly preferredMaximumRequiredResponsibilitiesPerSession: number;
  readonly coherenceGroups: readonly ProductionWeekTopologyCoherenceGroup[];
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionWeekAllocationComposerInput {
  readonly composerContract: typeof PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE;
  readonly weeklyIntent: ProductionWeeklyIntent;
  readonly sourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly orderedOpportunities: readonly ProductionWeekTrainingOpportunity[];
  readonly completionState: Readonly<Record<string, ProductionOpportunityCompletionStatus>>;
  readonly previousWeekStructureEvidence: ProductionWeekContinuityEvidence;
  readonly policy: ProductionWeekPolicyInput;
  readonly policyRegistry?: ProductionWeekPolicyRegistry;
  readonly spacingRequirements: readonly ProductionWeeklyRecoverySpacingRequirement[];
  readonly topologyPolicy?: ProductionWeekTopologyPolicy;
  readonly feasibilityOracle?: ProductionSessionFeasibilityOracle;
  readonly precomputedFeasibilityResults?: readonly ProductionSessionFeasibilityResult[];
  readonly searchResourcePolicy: ProductionWeekSearchResourcePolicy;
  readonly evaluationTime: string;
  readonly allocationAttemptId: string;
  readonly priorPlanRevision?: ProductionWeekAllocationPlan;
}

export type ProductionWeekObjectiveSatisfactionState = "allocated_minimum_opportunities" |
  "allocated_target_opportunities" | "below_minimum_unresolved" | "above_soft_ceiling_review" |
  "allocated_requires_session_feasibility" | "allocated_requires_prescription_validation" |
  "optional_not_allocated" | "blocked_by_availability" | "blocked_by_training_readiness" |
  "requires_week_reallocation" | "frequency_policy_required" | "unsupported_objective_scope" | "search_inconclusive";

export interface ProductionWeekEvaluationVector {
  readonly hardValid: boolean;
  readonly globalTrainingSafetyAllowed: boolean;
  readonly completedHistoryImmutable: boolean;
  readonly requiredMinimumVector: readonly boolean[];
  readonly opportunityLegalityVector: readonly boolean[];
  readonly requiredSpacingVector: readonly boolean[];
  readonly topologyPolicyReference?: ProductionWeekTopologyPolicyReference;
  readonly requiredTargetExposureVector?: readonly boolean[];
  readonly requiredResponsibilityConcentrationVector?: readonly number[];
  readonly occupiedSessionCount?: number;
  readonly withinWeekPrimaryEmphasisBalanceVector?: readonly number[];
  readonly primaryEmphasisFingerprint?: string;
  readonly topologyProvenance?: readonly string[];
  readonly feasibilityVector: readonly ProductionSessionFeasibilityStatus[];
  readonly continuityVector: readonly boolean[];
  readonly requiredFrequencyVector: readonly number[];
  readonly preferredFrequencyVector: readonly number[];
  readonly optionalUniqueValueVector: readonly boolean[];
  readonly softMaximumReviewBurden: number;
  readonly equipmentCapacityCoherenceVector: readonly boolean[];
  readonly duplicationBurden: number;
  readonly frameworkStabilityVector: readonly boolean[];
  readonly canonicalTieBreak: string;
}

export type ProductionWeekPlanId = string;
export type ProductionWeekPlanRevisionId = string;

export interface ProductionSessionAllocationReservation {
  readonly reservationId: string;
  readonly reservationRevisionId: string;
  readonly weekPlanId: ProductionWeekPlanId;
  readonly weekPlanRevisionId: ProductionWeekPlanRevisionId;
  readonly weeklyIntentId: ProductionWeeklyIntentId;
  readonly weeklyIntentRevisionId: ProductionWeeklyIntentRevisionId;
  readonly opportunityId: string;
  readonly opportunityRevisionId: string;
  readonly athleteId: string;
  readonly sessionType: "ordinary_training";
  readonly weeklyPrimaryGoal: TrainingOutcomeGoal;
  readonly weeklySecondaryGoals: readonly TrainingOutcomeGoal[];
  readonly sessionOutcomeGoal: TrainingOutcomeGoal;
  readonly goalEvidenceRefs: readonly string[];
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly allocatedObjectives: readonly ProductionReservedSessionObjective[];
  readonly expectedStructuralCapacity: StructuralCapacityMode;
  readonly expectedAvailableMinutes: number | null;
  readonly expectedEquipment: ProductionExpectedEquipment;
  readonly neighboringReservationRefs: readonly string[];
  readonly weeklyObjectiveSourceRefs: readonly string[];
  readonly unresolvedWeekContext: readonly ProductionWeekUnresolvedContext[];
  readonly unresolvedCurrentSessionContext: readonly string[];
  readonly status: "reserved" | "completed_immutable" | "missed_requires_reallocation" |
    "cancelled_requires_reallocation" | "blocked_by_training_readiness" | "unresolved";
  readonly sourceTrace: readonly string[];
  readonly provenance: ProductionWeekProvenance;
}

export type ProductionWeekAllocationStatus = "allocation_composed" | "allocation_infeasible" | "requires_policy" |
  "blocked_by_training_readiness" | "search_inconclusive" | "invalid_allocation_input" |
  "unsupported_composer_contract" | "invalid_prior_revision_context";

export interface ProductionWeekAllocationPlan {
  readonly planContract: typeof PRODUCTION_WEEK_PLAN_REVISION_CONTRACT_REFERENCE;
  readonly weekPlanId: ProductionWeekPlanId;
  readonly weekPlanRevisionId: ProductionWeekPlanRevisionId;
  readonly basedOnRevisionId: ProductionWeekPlanRevisionId | null;
  readonly allocationAttemptId: string;
  readonly athleteId: string;
  readonly weeklyIntentId: ProductionWeeklyIntentId;
  readonly weeklyIntentRevisionId: ProductionWeeklyIntentRevisionId;
  readonly planningHorizonId: string;
  readonly horizonRevisionId: string;
  readonly status: ProductionWeekAllocationStatus;
  readonly reservations: readonly ProductionSessionAllocationReservation[];
  readonly objectiveAllocationTraces: Readonly<Record<string, readonly string[]>>;
  readonly unallocatedObjectiveTraces: Readonly<Record<string, readonly string[]>>;
  readonly spacingTraces: readonly string[];
  readonly continuityTraces: readonly string[];
  readonly equipmentAvailabilityTraces: readonly string[];
  readonly structuralCapacityTraces: readonly string[];
  readonly searchCompleteness: "exact_optimal" | "exact_infeasible" | "bounded_optimality_not_proven" | "search_inconclusive";
  readonly searchTrace: readonly string[];
  readonly wholeWeekEvaluation: ProductionWeekEvaluationVector | null;
  readonly objectiveSatisfactionStates: Readonly<Record<string, ProductionWeekObjectiveSatisfactionState>>;
  readonly unresolvedPrescriptionRequirements: readonly string[];
  readonly unresolvedCurrentSessionFacts: readonly string[];
  readonly reallocationState: "not_required" | "required" | "completed_history_preserved";
  readonly decisionTrace: readonly string[];
  readonly evaluationTime: string;
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionSessionAllocationMaterializationInput {
  readonly materializerContract: typeof PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE;
  readonly reservation: ProductionSessionAllocationReservation;
  readonly expectedWeekPlanRevisionId: string;
  readonly actualCurrentAvailability: CurrentSessionAvailability | null;
  readonly actualCurrentStructuralCapacity: StructuralCapacityMode | null;
  readonly actualCurrentEquipment: CurrentSessionEquipment | null;
  readonly actualTrainingSafety: TrainingSafetyState;
  readonly actualEvaluationTime: string;
  readonly actualLocationRef?: string;
  readonly userCancelled: boolean;
  readonly unresolvedCurrentContext: readonly UnresolvedPlannerContextObservation[];
  readonly productUpdateRefs: readonly string[];
  readonly materializationAttemptId: string;
  readonly priorMaterializationRevisionId?: string;
}

export type ProductionSessionAllocationMaterializationStatus = "directive_materialized" | "requires_week_reallocation" |
  "under_specified_current_context" | "blocked_by_training_readiness" | "user_cancelled" | "unsupported_context" |
  "stale_reservation_revision" | "invalid_materialization_input" | "unsupported_materializer_contract";

export interface ProductionSessionAllocationMaterializationResult {
  readonly status: ProductionSessionAllocationMaterializationStatus;
  readonly materializationId: string;
  readonly materializationRevisionId: string;
  readonly directive: SessionAllocationDirective | null;
  readonly currentEquipmentHandoff: CurrentSessionEquipment | null;
  readonly expectedActualTrace: readonly string[];
  readonly retainedObjectiveIds: readonly string[];
  readonly reallocationEvidence: readonly string[];
  readonly unresolvedContext: readonly UnresolvedPlannerContextObservation[];
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly decisionTrace: readonly string[];
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionRemainingWeekReallocationInput {
  readonly reallocationContract: typeof PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE;
  readonly currentPlan: ProductionWeekAllocationPlan;
  readonly currentSourceSnapshot: ProductionWeekPlanningSourceSnapshot;
  readonly immutableCompletedReservationIds: readonly string[];
  readonly missedCancelledOrInvalidatedOpportunityIds: readonly string[];
  readonly remainingObjectiveIds: readonly string[];
  readonly updatedOpportunities: readonly ProductionWeekTrainingOpportunity[];
  readonly trainingSafety: TrainingSafetyState;
  readonly reasonEvidenceRefs: readonly string[];
  readonly policy: ProductionWeekPolicyInput;
  readonly policyRegistry?: ProductionWeekPolicyRegistry;
  readonly feasibilityOracle?: ProductionSessionFeasibilityOracle;
  readonly precomputedFeasibilityResults?: readonly ProductionSessionFeasibilityResult[];
  readonly searchResourcePolicy: ProductionWeekSearchResourcePolicy;
  readonly evaluationTime: string;
  readonly reallocationAttemptId: string;
  readonly weeklyIntent: ProductionWeeklyIntent;
}

export type ProductionRemainingWeekReallocationStatus = "revised_plan_candidate" | "reallocation_not_required" |
  "reallocation_infeasible" | "reallocation_policy_required" | "blocked_by_training_readiness" |
  "search_inconclusive" | "invalid_completed_history" | "invalid_reallocation_input" |
  "unsupported_reallocation_contract";

export interface ProductionRemainingWeekReallocationResult {
  readonly status: ProductionRemainingWeekReallocationStatus;
  readonly priorPlanRevisionId: string;
  readonly revisedPlanCandidate: ProductionWeekAllocationPlan | null;
  readonly preservedCompletedReservations: readonly ProductionSessionAllocationReservation[];
  readonly invalidatedFutureReservationIds: readonly string[];
  readonly newlyProposedFutureReservationIds: readonly string[];
  readonly movedResponsibilityTraces: readonly string[];
  readonly unchangedResponsibilityTraces: readonly string[];
  readonly unresolvedObjectiveIds: readonly string[];
  readonly noDoubleCountTrace: readonly string[];
  readonly searchTrace: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly applicationApplied: false;
  readonly applicationOwnerRequired: true;
  readonly provenance: ProductionWeekProvenance;
}

export interface ProductionAllocationLedgerEntry {
  readonly objectiveId: string;
  readonly reservationIds: readonly string[];
  readonly opportunityCount: number;
  readonly satisfactionState: ProductionWeekObjectiveSatisfactionState;
  readonly doseCredit: 0;
}
