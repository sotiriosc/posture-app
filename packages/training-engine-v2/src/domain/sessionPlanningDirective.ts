import type { EquipmentCapabilities, EquipmentCapabilityKey } from "./equipment";
import type { ExerciseActionFunction, ExerciseMechanicsReviewStatus } from "./exercise";
import type { MuscleRelationshipRequirement } from "./exerciseSelectionNeed";
import type { PreparationCategory } from "../preparation/contracts";
import type {
  SessionNeedPriority,
  StandaloneAdmission,
  StructuralCapacityMode,
} from "./session";
import type { BodyRegion, MovementRole, MuscleGroup, Side } from "./primitives";

export const TRAINING_OUTCOME_GOALS = [
  "strength",
  "hypertrophy",
  "general_fitness",
  "conditioning",
  "posture_and_movement_quality",
] as const;
export type TrainingOutcomeGoal = (typeof TRAINING_OUTCOME_GOALS)[number];

export const PROGRAMMING_CONTEXT_MODES = ["pain_aware_return"] as const;
export type ProgrammingContextMode = (typeof PROGRAMMING_CONTEXT_MODES)[number];

export type PlannerSessionType = "ordinary_training";
export type SessionAllocationDirectiveSource =
  | "future_week_composer"
  | "explicit_standalone_session_brief";

export type CurrentSessionFactProvenance =
  | "explicit_today"
  | "week_allocation"
  | "profile_default"
  | "unknown";

export interface CurrentSessionAvailability {
  readonly availableMinutes: number | null;
  readonly structuralCapacity: StructuralCapacityMode;
  readonly provenance: CurrentSessionFactProvenance;
  readonly sourceRef: string;
}

export interface CurrentSessionEquipment {
  readonly capabilities: EquipmentCapabilities;
  readonly provenance: CurrentSessionFactProvenance;
  readonly sourceRef: string;
}

export const ALLOCATED_SESSION_OBJECTIVE_KINDS = [
  "dominant_main",
  "secondary_main",
  "secondary_accessory",
  "direct_accessory",
  "capacity_main",
  "capacity_accessory",
  "explicit_preparation",
  "activation",
  "recovery",
] as const;
export type AllocatedSessionObjectiveKind =
  (typeof ALLOCATED_SESSION_OBJECTIVE_KINDS)[number];

export type SessionObjectiveSourceKind =
  | "future_week_allocation"
  | "standalone_session_brief"
  | "user_explicit_session_request"
  | "assessment_enrichment"
  | "typed_dependency";

export interface SessionObjectiveSourceEvidence {
  readonly sourceKind: SessionObjectiveSourceKind;
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
}

export interface AllocatedObjectiveSelectionTarget {
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetActionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly muscleRequirement: MuscleRelationshipRequirement;
  readonly targetBodyRegions: readonly BodyRegion[];
}

export const PREPARATION_DEPENDENCY_SOURCE_KINDS = [
  "assessment_fact",
  "selected_exercise_mechanics",
  "explicit_range_or_control_requirement",
  "phase_requirement",
  "known_successful_preparation_history",
  "upstream_preparation_handoff",
] as const;

export type PreparationDependencySourceKind =
  (typeof PREPARATION_DEPENDENCY_SOURCE_KINDS)[number];

export type PreparationDependencyOwnership = "shared" | "assignment_local";
export type PreparationDependencyFamiliarityPolicy =
  | "always_when_owned"
  | "novice_or_unfamiliar";

export interface AllocatedPreparationRangeRequirement {
  readonly requirementId: string;
  readonly sourceAssessmentSignalId: string;
  readonly bodyRegion: BodyRegion;
  readonly actionFunction?: ExerciseActionFunction;
  readonly side?: Side;
  readonly provenance: string;
  readonly reviewStatus: ExerciseMechanicsReviewStatus | "unknown";
  readonly explanation: string;
}

export interface AllocatedPreparationDependencyProvenance {
  readonly sourceKind: PreparationDependencySourceKind;
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
  readonly transformationRuleId: string;
}

/** Typed upstream ownership for a separate preparation need serving this objective. */
export interface AllocatedPreparationDependency {
  readonly id: string;
  readonly requiredPreparationCategories: readonly PreparationCategory[];
  readonly sourceAssessmentFactIds: readonly string[];
  readonly requiredEquipmentCapabilities: readonly EquipmentCapabilityKey[];
  readonly intendedSection: "warmup" | "activation";
  readonly priority: SessionNeedPriority;
  readonly ownership: PreparationDependencyOwnership;
  readonly selectionTarget: AllocatedObjectiveSelectionTarget;
  readonly targetExerciseIds: readonly string[];
  readonly rangeRequirements: readonly AllocatedPreparationRangeRequirement[];
  readonly required: boolean;
  readonly familiarityPolicy: PreparationDependencyFamiliarityPolicy;
  readonly provenance: AllocatedPreparationDependencyProvenance;
  readonly reasonCode: string;
  readonly explanation: string;
}

export type ObjectiveStandaloneAdmissionDirection =
  | "policy_default"
  | StandaloneAdmission;

export interface AllocatedSessionObjective {
  readonly id: string;
  readonly kind: AllocatedSessionObjectiveKind;
  readonly priority: SessionNeedPriority;
  readonly priorityOrder: number;
  readonly selectionTarget: AllocatedObjectiveSelectionTarget;
  readonly preparationDependencies?: readonly AllocatedPreparationDependency[];
  readonly sourceEvidence: readonly SessionObjectiveSourceEvidence[];
  readonly standaloneAdmissionDirection: ObjectiveStandaloneAdmissionDirection;
  readonly reasonCode: string;
  readonly explanation: string;
}

export type UnresolvedPlannerContextCategory =
  | "current_availability"
  | "current_equipment"
  | "recovery_readiness"
  | "schedule_disruption"
  | "goal_ambiguity"
  | "preference_or_request"
  | "safety_or_medical"
  | "accessibility_or_support"
  | "unknown";

export interface UnresolvedPlannerContextObservation {
  readonly observationId: string;
  readonly source: string;
  readonly contextCategory: UnresolvedPlannerContextCategory;
  readonly proposedOwner: string;
  readonly resolutionState: "unowned" | "requires_typed_input" | "externally_resolved";
  readonly blocksPlanning: boolean;
  readonly description: string;
}

export interface SessionAllocationDirectiveSourceTrace {
  readonly owner: SessionAllocationDirectiveSource;
  readonly sourceRefs: readonly string[];
  readonly transformationRuleIds: readonly string[];
}

export interface SessionAllocationDirective {
  readonly id: string;
  readonly source: SessionAllocationDirectiveSource;
  readonly athleteId: string;
  readonly sessionType: PlannerSessionType;
  readonly outcomeGoal?: TrainingOutcomeGoal;
  readonly legacyPrimaryGoal?: "pain_aware_return";
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly currentSessionAvailability?: CurrentSessionAvailability;
  readonly allocatedObjectives: readonly AllocatedSessionObjective[];
  readonly neighboringSessionContextRefs: readonly string[];
  readonly unresolvedWeeklyContextRefs: readonly string[];
  readonly weekReallocationEvidenceRefs: readonly string[];
  readonly unresolvedContextObservations: readonly UnresolvedPlannerContextObservation[];
  readonly sourceTrace: SessionAllocationDirectiveSourceTrace;
  readonly evaluationAsOf: string;
}
