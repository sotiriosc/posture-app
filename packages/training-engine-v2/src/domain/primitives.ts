export const EXPERIENCE_LEVELS = [
  "novice",
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const TRAINING_GOALS = [
  "posture_and_movement_quality",
  "strength",
  "hypertrophy",
  "general_fitness",
  "pain_aware_return",
  "conditioning",
] as const;

export type TrainingGoal = (typeof TRAINING_GOALS)[number];

export const MOVEMENT_ROLES = [
  "breathing_position",
  "mobility",
  "scapular_control",
  "anti_extension_core",
  "anti_rotation_core",
  "anti_lateral_flexion_core",
  "trunk_flexion",
  "trunk_rotation",
  "loaded_bracing",
  "squat",
  "hinge",
  "single_leg",
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "carry",
] as const;

export type MovementRole = (typeof MOVEMENT_ROLES)[number];

export const MUSCLE_GROUPS = [
  "chest",
  "lats",
  "mid_back",
  "upper_back",
  "front_delts",
  "side_delts",
  "rear_delts",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "trunk",
  "serratus",
  "rotator_cuff",
  "hip_adductors",
  "hip_abductors",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const BODY_REGIONS = [
  "neck",
  "shoulder",
  "elbow",
  "wrist",
  "thoracic_spine",
  "lumbar_spine",
  "ribcage",
  "pelvis",
  "hip",
  "knee",
  "ankle",
  "general",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

export const JOINT_STRESS_TAGS = [
  "deep_knee_flexion",
  "loaded_knee_flexion",
  "loaded_spinal_flexion",
  "loaded_spinal_extension",
  "heavy_axial_loading",
  "loaded_hinge",
  "overhead_pressing",
  "horizontal_pressing",
  "shoulder_abduction_external_rotation",
  "wrist_extension_loading",
  "high_impact",
  "grip_intensive",
  "long_lever_core",
] as const;

export type JointStressTag = (typeof JOINT_STRESS_TAGS)[number];

export type Side = "left" | "right" | "bilateral" | "not_applicable";
export type PriorityLevel = "context" | "secondary" | "primary" | "blocking";
export type ConfidenceLevel = "low" | "medium" | "high";
export type DemandLevel = "low" | "moderate" | "high";
export type Loadability = "none" | "limited" | "moderate" | "high";
export type IntensityBand = "easy" | "moderate" | "hard";
