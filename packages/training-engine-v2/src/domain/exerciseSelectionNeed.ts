import type { ExerciseActionFunction } from "./exercise";
import type { BodyRegion, MovementRole, MuscleGroup } from "./primitives";
import type { TrainingRole } from "./session";

export const MUSCLE_RELATIONSHIP_REQUIREMENTS = [
  "any_meaningful_contributor",
  "primary_preferred",
  "primary_required",
] as const;

export type MuscleRelationshipRequirement =
  (typeof MUSCLE_RELATIONSHIP_REQUIREMENTS)[number];

/** Canonical exercise-selection truth, independent of session context and scoring. */
export interface ExerciseSelectionNeed {
  readonly requestedRole: TrainingRole;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetActionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly muscleRequirement: MuscleRelationshipRequirement;
  readonly targetBodyRegions: readonly BodyRegion[];
}
