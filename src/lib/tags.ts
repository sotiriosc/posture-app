export const FOCUS_TAGS = [
  "tspine_rotation",
  "tspine_extension",
  "scap_control",
  "neck_endurance",
  "hip_extension",
  "hip_mobility",
  "squat_pattern",
  "hinge_pattern",
  "core_anti_rotation",
  "core_anti_extension",
  "core_stability",
  "ankle_mobility",
  "glute_medius",
  "posture_endurance",
  "push_strength",
  "pull_strength",
  "breathing",
  "balance",
] as const;

export type FocusTag = (typeof FOCUS_TAGS)[number];
