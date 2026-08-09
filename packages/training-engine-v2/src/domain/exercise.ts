import type { EquipmentRequirement } from "./equipment";
import type { PhaseId } from "./phase";
import type {
  BodyRegion,
  DemandLevel,
  JointStressTag,
  Loadability,
  MovementRole,
  MuscleGroup,
} from "./primitives";
import type { SessionSection, TrainingRole } from "./session";

export type ExerciseFamily =
  | "breathing_reset"
  | "mobility_preparation"
  | "scapular_preparation"
  | "core_control"
  | "squat_pattern"
  | "hinge_pattern"
  | "single_leg_pattern"
  | "upper_push"
  | "upper_pull"
  | "arm_accessory"
  | "delt_accessory"
  | "glute_hamstring";

export type ExercisePrerequisiteType =
  | "required_competency"
  | "required_control"
  | "required_setup_skill"
  | "required_strength_capability";

export interface ExercisePrerequisite {
  readonly id: string;
  readonly type: ExercisePrerequisiteType;
  readonly description: string;
}

export interface ExerciseSuitability {
  readonly suitability: "poor" | "possible" | "good" | "excellent";
  readonly reason: string;
}

export interface ExerciseLoadingProfile {
  readonly loadability: Loadability;
  readonly loadingPotential: DemandLevel;
  readonly skillDemand: DemandLevel;
  readonly stabilityDemand: DemandLevel;
  readonly coordinationDemand: DemandLevel;
  readonly localFatigue: DemandLevel;
  readonly systemicFatigue: DemandLevel;
  readonly axialLoading: DemandLevel;
  readonly jointStressTags: readonly JointStressTag[];
}

export interface ExerciseProgressionProfile {
  readonly regressionExerciseIds: readonly string[];
  readonly progressionExerciseIds: readonly string[];
  readonly progressionAxes: readonly (
    | "load"
    | "reps"
    | "sets"
    | "range"
    | "tempo"
    | "support_reduction"
    | "stability"
    | "coordination"
    | "complexity"
  )[];
}

export interface ExerciseDefinition {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly family: ExerciseFamily;
  readonly movementRoles: readonly MovementRole[];
  readonly trainingRoles: readonly TrainingRole[];
  readonly primaryMuscles: readonly MuscleGroup[];
  readonly secondaryMuscles: readonly MuscleGroup[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly equipmentRequirements: readonly EquipmentRequirement[];
  readonly optionalEquipment: readonly EquipmentRequirement[];
  readonly prerequisites: readonly ExercisePrerequisite[];
  readonly sectionSuitability: Partial<Record<SessionSection, ExerciseSuitability>>;
  readonly phaseSuitability: Partial<Record<PhaseId, ExerciseSuitability>>;
  readonly loading: ExerciseLoadingProfile;
  readonly progression: ExerciseProgressionProfile;
  readonly cautionStressTags: readonly JointStressTag[];
  readonly contraindicatedStressTags: readonly JointStressTag[];
  readonly coachingFocus: readonly string[];
}
