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

export type ExerciseDemandDimension =
  | "trunk_control"
  | "scapular_control"
  | "stability"
  | "coordination"
  | "range"
  | "joint_control";

export type ExerciseDemandAnnotationLevel = DemandLevel | "unknown";
export type ExerciseMechanicsReviewStatus = "accepted" | "needs_review";

export const TRUNK_FUNCTION_LEVELS = [
  "unknown",
  "none",
  "low",
  "moderate",
  "high",
] as const;

export type TrunkFunctionLevel = (typeof TRUNK_FUNCTION_LEVELS)[number];

export const TRUNK_FUNCTION_EVIDENCE_SOURCES = [
  "reference_catalog",
  "human_exercise_science_review",
  "external_reference",
  "unknown",
] as const;

export type TrunkFunctionEvidenceSource =
  (typeof TRUNK_FUNCTION_EVIDENCE_SOURCES)[number];

export interface TrunkFunctionProvenance {
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
}

export interface TrunkFunctionAnnotation {
  readonly level: TrunkFunctionLevel;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly source: TrunkFunctionEvidenceSource;
  readonly provenance: readonly TrunkFunctionProvenance[];
  readonly notes: string;
}

export const TRUNK_MECHANICS_FUNCTIONS = [
  "breathingPressureCoordination",
  "antiExtensionContribution",
  "antiRotationContribution",
  "antiLateralFlexionContribution",
  "controlledFlexionContribution",
  "controlledRotationContribution",
  "loadedBracingContribution",
  "gaitLoadTransferContribution",
] as const;

export type TrunkMechanicsFunction =
  (typeof TRUNK_MECHANICS_FUNCTIONS)[number];

export interface TrunkMechanicsProfile {
  readonly breathingPressureCoordination: TrunkFunctionAnnotation;
  readonly antiExtensionContribution: TrunkFunctionAnnotation;
  readonly antiRotationContribution: TrunkFunctionAnnotation;
  readonly antiLateralFlexionContribution: TrunkFunctionAnnotation;
  readonly controlledFlexionContribution: TrunkFunctionAnnotation;
  readonly controlledRotationContribution: TrunkFunctionAnnotation;
  readonly loadedBracingContribution: TrunkFunctionAnnotation;
  readonly gaitLoadTransferContribution: TrunkFunctionAnnotation;
}

export interface ExerciseDemandAnnotation {
  readonly level: ExerciseDemandAnnotationLevel;
  readonly source:
    | "reference_catalog"
    | "existing_loading_profile"
    | "human_review_needed"
    | "unknown";
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
}

export interface ExerciseSupportProfile {
  readonly externalSupport:
    | "none"
    | "floor"
    | "wall"
    | "bench"
    | "machine"
    | "box"
    | "cable_or_band_anchor"
    | "unknown";
  readonly bodySupport:
    | "none"
    | "supine"
    | "prone"
    | "chest_supported"
    | "seated_supported"
    | "hands_supported"
    | "standing"
    | "unknown";
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
}

export type ExerciseResistancePathType =
  | "machine_guided"
  | "cable_anchored"
  | "free_implement"
  | "bodyweight"
  | "band_anchored"
  | "unknown";

export type ExerciseTrajectoryFreedom = "low" | "moderate" | "high" | "unknown";
export type ExerciseLineOfPullAdjustability = "low" | "moderate" | "high" | "unknown";
export type ExerciseLaterality =
  | "bilateral_linked"
  | "bilateral_independent"
  | "unilateral"
  | "alternating"
  | "unknown";
export type ExerciseFitDependency =
  | "machine_geometry"
  | "setup_geometry"
  | "low"
  | "unknown";

export interface ExerciseResistancePathProfile {
  readonly resistancePath: ExerciseResistancePathType;
  readonly trajectoryFreedom: ExerciseTrajectoryFreedom;
  readonly lineOfPullAdjustability: ExerciseLineOfPullAdjustability;
  readonly laterality: ExerciseLaterality;
  readonly fitDependency: ExerciseFitDependency;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
  readonly provenance: readonly string[];
}

export interface ScapularMechanicsProfile {
  readonly serratusContribution: ExerciseDemandAnnotation;
  readonly upwardRotationControl: ExerciseDemandAnnotation;
  readonly retractionDemand: ExerciseDemandAnnotation;
  readonly externalRotationContribution: ExerciseDemandAnnotation;
  readonly loadedScapularControl: ExerciseDemandAnnotation;
  readonly preparationSuitability: "poor" | "possible" | "good" | "excellent" | "unknown";
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
}

export interface ExerciseMechanicsProfile {
  readonly support: ExerciseSupportProfile;
  readonly resistancePath?: ExerciseResistancePathProfile;
  readonly demands: Readonly<Record<ExerciseDemandDimension, ExerciseDemandAnnotation>>;
  readonly scapularMechanics?: ScapularMechanicsProfile;
  readonly trunkMechanics?: TrunkMechanicsProfile;
}

export type ExerciseProgressionAxis =
  | "load"
  | "reps"
  | "sets"
  | "range"
  | "tempo"
  | "support_reduction"
  | "stability"
  | "coordination"
  | "complexity";

export type ExerciseTransitionDirection = "progression" | "regression" | "lateral";
export type ExerciseTransitionClassification =
  | "developmental"
  | "context_dependent"
  | "questionable"
  | "needs_review";
export type ExerciseTransitionPurpose =
  | "increase_loadability"
  | "reduce_loadability"
  | "increase_support"
  | "reduce_support"
  | "increase_stability_demand"
  | "reduce_stability_demand"
  | "increase_coordination_demand"
  | "reduce_coordination_demand"
  | "change_resistance_path"
  | "equipment_transition"
  | "movement_pattern_development"
  | "preparation_to_loaded_training"
  | "feature_shift"
  | "stimulus_shift"
  | "pain_or_tolerance_regression";

export interface ExerciseTransitionRelationship {
  readonly targetExerciseId: string;
  readonly direction: ExerciseTransitionDirection;
  readonly classification: ExerciseTransitionClassification;
  readonly purposes: readonly ExerciseTransitionPurpose[];
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
  readonly provenance: readonly string[];
}

export interface ExerciseProgressionProfile {
  readonly progressionAxes: readonly ExerciseProgressionAxis[];
  readonly transitionRelationships: readonly ExerciseTransitionRelationship[];
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
  readonly mechanics?: ExerciseMechanicsProfile;
  readonly progression: ExerciseProgressionProfile;
  readonly cautionStressTags: readonly JointStressTag[];
  readonly contraindicatedStressTags: readonly JointStressTag[];
  readonly coachingFocus: readonly string[];
}
