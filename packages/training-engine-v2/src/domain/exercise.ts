import type { EquipmentRequirement } from "./equipment";
import type { ExercisePrescriptionKnowledgeProfile } from "./exercisePrescriptionKnowledge";
import type { PhaseId } from "./phase";
import type { ProgressionAxis } from "./progression";
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
  | "carry_load"
  | "squat_pattern"
  | "hinge_pattern"
  | "single_leg_pattern"
  | "upper_push"
  | "upper_pull"
  | "arm_accessory"
  | "delt_accessory"
  | "calf_accessory"
  | "hip_accessory"
  | "quad_accessory"
  | "cuff_control"
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

export type ExercisePhaseAnnotationReviewStatus =
  | "accepted"
  | "needs_review"
  | "unknown";

export type ExercisePhaseAnnotationSourceType =
  | "legacy_reference_catalog_migration"
  | "owner_decision"
  | "human_exercise_science_review"
  | "external_reference"
  | "unknown";

export interface ExercisePhaseAnnotationScope {
  readonly trainingRoles?: readonly TrainingRole[];
  readonly sessionSections?: readonly SessionSection[];
}

export interface ExercisePhaseAnnotationProvenance {
  readonly sourceType: ExercisePhaseAnnotationSourceType;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly reviewerId?: string;
  readonly reviewedAt?: string;
  readonly legalUseCoverage?: {
    readonly trainingRoles: readonly TrainingRole[];
    readonly sessionSections: readonly SessionSection[];
  };
}

export interface ExercisePhaseSuitabilityAnnotation {
  readonly annotationId: string;
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly suitability: ExerciseSuitability["suitability"];
  readonly scope: ExercisePhaseAnnotationScope;
  readonly reason: string;
  readonly reviewStatus: ExercisePhaseAnnotationReviewStatus;
  readonly provenance: ExercisePhaseAnnotationProvenance;
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

export const EXERCISE_ACTION_FUNCTIONS = [
  "elbow_flexion",
  "elbow_extension",
  "shoulder_abduction",
  "shoulder_extension",
  "shoulder_horizontal_adduction",
  "shoulder_horizontal_abduction",
  "shoulder_external_rotation",
  "scapular_protraction",
  "scapular_retraction",
  "scapular_upward_rotation",
  "knee_flexion",
  "knee_extension",
  "hip_extension",
  "hip_flexion",
  "hip_abduction",
  "hip_adduction",
  "hip_internal_rotation",
  "hip_external_rotation",
  "ankle_plantar_flexion",
  "ankle_dorsiflexion",
  "single_leg_stance_control",
] as const;

export type ExerciseActionFunction = (typeof EXERCISE_ACTION_FUNCTIONS)[number];

export const MUSCLE_CONTRIBUTION_RELATIONSHIPS = [
  "primary_target",
  "key_secondary_target",
  "incidental_contributor",
  "stabilizer_or_contextual_contributor",
  "unknown",
] as const;

export type MuscleContributionRelationship =
  (typeof MUSCLE_CONTRIBUTION_RELATIONSHIPS)[number];

export interface ExerciseKnowledgeProvenance {
  readonly source: "owner_decision" | "human_exercise_science_review" | "external_reference" | "unknown";
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
}

export interface ExerciseActionFunctionAnnotation {
  readonly action: ExerciseActionFunction;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly provenance: readonly ExerciseKnowledgeProvenance[];
  readonly notes: string;
}

export interface ExerciseMuscleContribution {
  readonly muscle: MuscleGroup;
  readonly relationship: MuscleContributionRelationship;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly provenance: readonly ExerciseKnowledgeProvenance[];
  readonly notes: string;
}

export function musclesWithRelationships(
  exercise: Pick<ExerciseDefinition, "muscleContributions">,
  relationships: readonly MuscleContributionRelationship[],
): readonly MuscleGroup[] {
  return exercise.muscleContributions
    .filter((entry) => relationships.includes(entry.relationship))
    .map((entry) => entry.muscle);
}

export function meaningfulTargetMuscles(
  exercise: Pick<ExerciseDefinition, "muscleContributions">,
): readonly MuscleGroup[] {
  return musclesWithRelationships(exercise, ["primary_target", "key_secondary_target"]);
}

export const EXERCISE_STRESS_SOURCES = [
  "joint_stress",
  "caution",
  "contraindicated",
] as const;

export type ExerciseStressSource = (typeof EXERCISE_STRESS_SOURCES)[number];

export const EXERCISE_STRESS_EXPOSURE_SCOPES = [
  "intrinsic",
  "prescription_modifiable",
  "variant_dependent",
  "dose_created",
  "unknown",
] as const;

export type ExerciseStressExposureScope =
  (typeof EXERCISE_STRESS_EXPOSURE_SCOPES)[number];

export const EXERCISE_STRESS_SIDE_SCOPES = [
  "side_neutral",
  "prescription_side",
  "bilateral_or_systemic",
  "unknown",
] as const;

export type ExerciseStressSideScope =
  (typeof EXERCISE_STRESS_SIDE_SCOPES)[number];

export const EXERCISE_STRESS_REVIEW_STATUSES = [
  "accepted",
  "needs_review",
] as const;

export type ExerciseStressReviewStatus =
  (typeof EXERCISE_STRESS_REVIEW_STATUSES)[number];

export const EXERCISE_STRESS_PROVENANCE_SOURCES = [
  "owner_decision",
  "human_exercise_science_review",
  "external_reference",
  "legacy_unscoped",
  "unknown",
] as const;

export type ExerciseStressProvenanceSource =
  (typeof EXERCISE_STRESS_PROVENANCE_SOURCES)[number];

export interface ExerciseStressAnnotationProvenance {
  readonly source: ExerciseStressProvenanceSource;
  readonly sourceRef: string;
  readonly evidenceBasis: readonly string[];
  readonly notes?: string;
}

export interface ExerciseStressAnnotation {
  readonly tag: JointStressTag;
  readonly source: ExerciseStressSource;
  readonly exposureScope: ExerciseStressExposureScope;
  readonly sideScope: ExerciseStressSideScope;
  readonly reviewStatus: ExerciseStressReviewStatus;
  readonly provenance: readonly ExerciseStressAnnotationProvenance[];
  readonly notes: string;
}

export interface ExerciseStressAnnotationValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly message: string;
}

function includesValue<T extends readonly string[]>(
  values: T,
  value: string,
): value is T[number] {
  return values.includes(value);
}

export function validateExerciseStressAnnotation(
  annotation: ExerciseStressAnnotation,
): readonly ExerciseStressAnnotationValidationFinding[] {
  const findings: ExerciseStressAnnotationValidationFinding[] = [];
  const add = (code: string, message: string): void => {
    findings.push({ severity: "error", code, message });
  };

  if (!includesValue(EXERCISE_STRESS_SOURCES, annotation.source)) {
    add("invalid_source", "Exercise stress annotation source is not approved.");
  }
  if (!includesValue(EXERCISE_STRESS_EXPOSURE_SCOPES, annotation.exposureScope)) {
    add("invalid_exposure_scope", "Exercise stress annotation exposure scope is not approved.");
  }
  if (!includesValue(EXERCISE_STRESS_SIDE_SCOPES, annotation.sideScope)) {
    add("invalid_side_scope", "Exercise stress annotation side scope is not approved.");
  }
  if (!includesValue(EXERCISE_STRESS_REVIEW_STATUSES, annotation.reviewStatus)) {
    add("invalid_review_status", "Exercise stress annotation review status is not approved.");
  }
  if (annotation.provenance.length === 0) {
    add("missing_provenance", "Exercise stress annotations must expose structured provenance.");
  }

  annotation.provenance.forEach((provenance, index) => {
    const target = `provenance[${index}]`;
    if (!includesValue(EXERCISE_STRESS_PROVENANCE_SOURCES, provenance.source)) {
      add("invalid_provenance_source", `${target} source is not approved.`);
    }
    if (provenance.sourceRef.trim().length === 0) {
      add("missing_provenance_source_ref", `${target} sourceRef is required.`);
    }
    if (provenance.evidenceBasis.length === 0) {
      add("missing_evidence_basis", `${target} evidenceBasis is required.`);
    }
  });

  if (annotation.reviewStatus === "accepted") {
    for (const provenance of annotation.provenance) {
      if (provenance.source === "legacy_unscoped" || provenance.source === "unknown") {
        add(
          "accepted_provenance_not_authoritative",
          "Accepted stress annotations require owner, human, or external provenance.",
        );
      }
    }
  }

  return findings;
}

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

export type ExerciseBasePosition =
  | "standing"
  | "half_kneeling"
  | "tall_kneeling"
  | "prone"
  | "side_support"
  | "supine"
  | "seated"
  | "quadruped"
  | "hanging"
  | "unknown";

export type ExerciseStance =
  | "bilateral"
  | "single_leg"
  | "split"
  | "half_kneeling_lead_side"
  | "staggered"
  | "stacked_feet"
  | "bent_knee_side_support"
  | "alternating_march"
  | "unknown";

export type ExerciseOrientation =
  | "upright"
  | "prone"
  | "supine"
  | "lateral"
  | "diagonal"
  | "suspended"
  | "unknown";

export type ExerciseSupportContactBodyRegion =
  | "forearm"
  | "hand"
  | "foot"
  | "knee"
  | "chest"
  | "back"
  | "pelvis"
  | "seat"
  | "unknown";

export type ExerciseSupportContactSource =
  | "floor"
  | "wall"
  | "bench"
  | "machine"
  | "box"
  | "stable_support_surface"
  | "unknown";

export type ExerciseSupportContactMode =
  | "weight_bearing"
  | "balance_assist"
  | "positioning"
  | "unknown";

export type ExerciseSupportContactSide =
  | "left"
  | "right"
  | "prescription_side"
  | "bilateral"
  | "alternating"
  | "side_neutral"
  | "unknown";

export interface ExerciseSupportContact {
  readonly bodyRegion: ExerciseSupportContactBodyRegion;
  readonly source: ExerciseSupportContactSource;
  readonly mode: ExerciseSupportContactMode;
  readonly side: ExerciseSupportContactSide;
  readonly taskRole: "primary" | "secondary" | "unknown";
}

export type ExerciseSupportAmount =
  | "none"
  | "light_touch"
  | "partial"
  | "substantial"
  | "prescription_modifiable"
  | "unknown";

export type ExerciseSupportRelationship =
  | "same_side_load"
  | "opposite_side_load"
  | "bilateral"
  | "side_neutral"
  | "alternating"
  | "unknown";

export interface ExerciseSupportProfile {
  readonly basePosition: ExerciseBasePosition;
  readonly stance: ExerciseStance;
  readonly orientation: ExerciseOrientation;
  readonly supportContacts: readonly ExerciseSupportContact[];
  readonly supportAmount: ExerciseSupportAmount;
  readonly supportRelationship: ExerciseSupportRelationship;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly notes: string;
}

export type ExerciseResistancePathType =
  | "machine_guided"
  | "cable_anchored"
  | "free_implement"
  | "bodyweight"
  | "band_anchored"
  | "band_unanchored"
  | "prescription_dependent"
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

export type ExerciseProgressionAxis = ProgressionAxis;

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
  readonly actionFunctions: readonly ExerciseActionFunctionAnnotation[];
  readonly trainingRoles: readonly TrainingRole[];
  readonly muscleContributions: readonly ExerciseMuscleContribution[];
  /** Derived compatibility projection. `muscleContributions` is canonical. */
  readonly primaryMuscles: readonly MuscleGroup[];
  /** Derived compatibility projection. `muscleContributions` is canonical. */
  readonly secondaryMuscles: readonly MuscleGroup[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly equipmentRequirements: readonly EquipmentRequirement[];
  readonly optionalEquipment: readonly EquipmentRequirement[];
  readonly prerequisites: readonly ExercisePrerequisite[];
  readonly sectionSuitability: Partial<Record<SessionSection, ExerciseSuitability>>;
  readonly phaseSuitability: Partial<Record<PhaseId, ExerciseSuitability>>;
  readonly phaseSuitabilityAnnotations?: readonly ExercisePhaseSuitabilityAnnotation[];
  readonly loading: ExerciseLoadingProfile;
  readonly mechanics?: ExerciseMechanicsProfile;
  readonly stressAnnotations?: readonly ExerciseStressAnnotation[];
  readonly prescriptionKnowledge: ExercisePrescriptionKnowledgeProfile;
  readonly progression: ExerciseProgressionProfile;
  readonly cautionStressTags: readonly JointStressTag[];
  readonly contraindicatedStressTags: readonly JointStressTag[];
  readonly coachingFocus: readonly string[];
}
