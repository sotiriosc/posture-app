import type { ExerciseSelectionNeed } from "./exerciseSelectionNeed";
import type { PhaseIntent } from "./phase";
import type { BodyRegion, MovementRole, MuscleGroup, TrainingGoal } from "./primitives";

export const SESSION_SECTIONS = [
  "warmup",
  "activation",
  "main",
  "accessory",
  "cooldown",
] as const;

export type SessionSection = (typeof SESSION_SECTIONS)[number];

export type TrainingRole =
  | "preparation"
  | "activation"
  | "primary_strength"
  | "secondary_strength"
  | "hypertrophy_accessory"
  | "capacity"
  | "recovery";

export const SESSION_NEED_PRIORITIES = ["required", "preferred", "optional"] as const;
export type SessionNeedPriority = (typeof SESSION_NEED_PRIORITIES)[number];

export const STRUCTURAL_CAPACITY_MODES = [
  "condensed",
  "standard",
  "expanded",
  "unknown",
] as const;
export type StructuralCapacityMode = (typeof STRUCTURAL_CAPACITY_MODES)[number];

export type StandaloneAdmission = "admitted" | "shared_only" | "duration_conditional";
export type SessionFatigueSignal =
  | "fresh"
  | "local_fatigue"
  | "systemic_fatigue"
  | "joint_stress_accumulated";

export type SessionNeedSourceKind =
  | "weekly_intent"
  | "session_primary_purpose"
  | "direct_muscle_priority"
  | "movement_or_action_priority"
  | "assessment_priority"
  | "explicit_preparation_dependency"
  | "pain_response_requirement"
  | "continuity_requirement"
  | "phase_intent"
  | "user_preference"
  | "recovery_requirement";

export interface SessionNeedSourceEvidence {
  readonly sourceKind: SessionNeedSourceKind;
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
}

export interface SessionNeedDependency {
  readonly dependencyId: string;
  readonly targetNeedIds: readonly string[];
  readonly targetExerciseIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly string[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly assessmentSignalIds: readonly string[];
  readonly requiredRangeIds: readonly string[];
  readonly painResponseRequirementIds: readonly string[];
  readonly required: boolean;
}

export interface SessionNeed {
  readonly id: string;
  readonly section: SessionSection;
  readonly priority: SessionNeedPriority;
  readonly priorityOrder: number;
  readonly standaloneAdmission: StandaloneAdmission;
  readonly sourceEvidence: readonly SessionNeedSourceEvidence[];
  readonly dependencies: readonly SessionNeedDependency[];
  readonly reasonCode: string;
  readonly explanation: string;
  readonly selection: ExerciseSelectionNeed;
}

export type SessionKind =
  | "ordinary_training"
  | "strength"
  | "hypertrophy"
  | "general_fitness"
  | "posture_and_movement_quality"
  | "pain_aware_return";

export interface SessionContinuityIdentityEvidence {
  readonly exerciseId: string;
  readonly previouslyServedNeedIds: readonly string[];
  readonly responseReceiverTraceRefs: readonly string[];
  readonly observationalClassification: "anchor" | "stable_supporting" | "rotation_eligible";
  readonly productive: boolean;
  readonly plateaued: boolean;
  readonly failedProgression: boolean;
  readonly equipmentLost: boolean;
  readonly explicitlyBlocked: boolean;
  readonly repeatedAdverseEvidence: boolean;
}

export interface SessionContinuityEvidence {
  readonly identities: readonly SessionContinuityIdentityEvidence[];
}

export interface SessionIntentSourceTrace {
  readonly plannerId: string;
  readonly sourceRefs: readonly string[];
}

export interface SessionIntent {
  readonly id: string;
  readonly athleteId: string;
  readonly kind: SessionKind;
  readonly phaseIntent: PhaseIntent;
  readonly primaryGoal: TrainingGoal;
  readonly needs: readonly SessionNeed[];
  readonly structuralCapacity: StructuralCapacityMode;
  readonly availableMinutes: number;
  readonly assessmentContextRefs: readonly string[];
  readonly painResponseContextRefs: readonly string[];
  readonly fatigueContext: readonly SessionFatigueSignal[];
  readonly continuityEvidence: SessionContinuityEvidence;
  readonly plannerSourceTrace: SessionIntentSourceTrace;
  readonly unresolvedWeeklyContextRefs: readonly string[];
}

/** @deprecated Fixed slots are retained only for legacy trace/optimizer contracts. */
export interface TrainingSlot {
  readonly id: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly optional: boolean;
  readonly preparationDependencyIds: readonly string[];
}

/** @deprecated Use SessionNeedDependency on the needs-first SessionIntent. */
export interface PreparationDependency {
  readonly id: string;
  readonly fromSection: SessionSection;
  readonly preparesForSections: readonly SessionSection[];
  readonly preparesForExerciseIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly assessmentSignalIds: readonly string[];
  readonly jointRangeNeeds: readonly BodyRegion[];
  readonly sessionIntentId: string;
  readonly explanation: string;
}

export interface SectionCoherenceRequirement {
  readonly section: SessionSection;
  readonly shouldRelateTo: readonly (
    | "session_intent"
    | "assessment"
    | "pain"
    | "main_exercise"
    | "fatigue"
  )[];
}
