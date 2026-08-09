import type { AssessmentPriority } from "./assessment";
import type { PhaseIntent } from "./phase";
import type {
  BodyRegion,
  JointStressTag,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "./primitives";

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

export interface TrainingSlot {
  readonly id: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly optional: boolean;
  readonly preparationDependencyIds: readonly string[];
}

export interface SessionIntent {
  readonly id: string;
  readonly phaseIntent: PhaseIntent;
  readonly primaryPurpose: TrainingGoal;
  readonly priorityMuscles: readonly MuscleGroup[];
  readonly priorityMovementRoles: readonly MovementRole[];
  readonly assessmentPriorityIds: readonly string[];
  readonly assessmentPriorityLevel: AssessmentPriority;
  readonly relevantPainConstraintIds: readonly string[];
  readonly fatigueConsiderations: readonly string[];
  readonly slots: readonly TrainingSlot[];
  readonly preparationDependencies: readonly PreparationDependency[];
}

export interface SectionCoherenceRequirement {
  readonly section: SessionSection;
  readonly shouldRelateTo: readonly ("session_intent" | "assessment" | "pain" | "main_exercise" | "fatigue")[];
}
