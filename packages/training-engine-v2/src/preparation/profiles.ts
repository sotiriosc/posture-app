import type { PreparationKnowledgeProfile } from "./contracts";

const DYNAMIC_EVIDENCE = [
  "dynamic-warmup-li-2023",
  "dynamic-stretching-opplert-2018",
  "praxis-drill-mechanics-inference-v1",
];
const ACTIVATION_EVIDENCE = [
  "upper-body-warmup-mccrary-2015",
  "pape-fatigue-xu-2025",
  "praxis-drill-mechanics-inference-v1",
];
const DOCTRINE = ["praxis-causal-preparation-doctrine-v1"];

function profile(
  input: PreparationKnowledgeProfile,
): PreparationKnowledgeProfile {
  return Object.freeze({
    ...input,
    categories: Object.freeze([...input.categories]),
    movementRoles: Object.freeze([...input.movementRoles]),
    actionFunctions: Object.freeze([...input.actionFunctions]),
    targetMuscles: Object.freeze([...input.targetMuscles]),
    bodyRegions: Object.freeze([...input.bodyRegions]),
    mechanicalStressTags: Object.freeze([...input.mechanicalStressTags]),
    equipmentRequirementIds: Object.freeze([...input.equipmentRequirementIds]),
    intendedSections: Object.freeze([...input.intendedSections]),
    compatibleDemandIds: Object.freeze([...input.compatibleDemandIds]),
    incompatibleConditionIds: Object.freeze([...input.incompatibleConditionIds]),
    painConsiderations: Object.freeze([...input.painConsiderations]),
    prerequisiteIds: Object.freeze([...input.prerequisiteIds]),
    timingConstraints: Object.freeze([...input.timingConstraints]),
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    dosage: Object.freeze({ ...input.dosage }),
  });
}

export const PREPARATION_KNOWLEDGE_PROFILES: readonly PreparationKnowledgeProfile[] = Object.freeze([
  profile({
    exerciseId: "ninety-ninety-breathing", categories: ["breathing_position", "cooldown_downshift"],
    movementRoles: ["breathing_position", "anti_extension_core"], actionFunctions: [], targetMuscles: [],
    bodyRegions: ["ribcage", "pelvis", "lumbar_spine"], mechanicalStressTags: [],
    equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "minimal",
    intendedSections: ["warmup", "cooldown"], compatibleDemandIds: ["breathing_position", "ribcage_pelvis_position", "downshift"],
    incompatibleConditionIds: ["unsupported_strength_enhancement_claim"], painConsiderations: ["Use only a comfortable supported position and breathing strategy."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "breath_cycles", minimum: null, maximum: null, unit: "breaths", explanation: "Prescription owns the exact breath count; no universal cadence is approved." },
    timingConstraints: ["May precede dynamic preparation or appear as optional post-session downshift."],
    evidenceRefs: ["inspiratory-warmup-cirino-2023", ...DOCTRINE], explanation: "Selected only for an explicit position, breathing, or downshift responsibility.",
  }),
  profile({
    exerciseId: "serratus-wall-slide", categories: ["activation_control", "dynamic_mobility"],
    movementRoles: ["scapular_control"], actionFunctions: ["scapular_upward_rotation"], targetMuscles: ["serratus"],
    bodyRegions: ["shoulder", "ribcage", "thoracic_spine"], mechanicalStressTags: [], equipmentRequirementIds: ["wall-support"],
    setupComplexity: "low", fatigueCost: "low", intendedSections: ["warmup", "activation"], compatibleDemandIds: ["scapular_upward_rotation_control", "serratus_control"],
    incompatibleConditionIds: ["wall_unavailable", "shoulder_response_exclusion"], painConsiderations: ["Shoulder response and comfortable arm range override selection."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use a low-fatigue quality-limited dose owned by Prescription." }, timingConstraints: ["Must finish before pressing acclimation and main work.", "Stop before local fatigue changes pressing mechanics."],
    evidenceRefs: ACTIVATION_EVIDENCE, explanation: "Provides wall-supported scapular upward-rotation control when typed mechanics require it.",
  }),
  profile({
    exerciseId: "scapular-push-up", categories: ["activation_control", "movement_rehearsal"],
    movementRoles: ["scapular_control", "anti_extension_core"], actionFunctions: ["scapular_protraction"], targetMuscles: ["serratus", "trunk"],
    bodyRegions: ["shoulder", "ribcage", "wrist", "elbow"], mechanicalStressTags: ["wrist_extension_loading", "upper_limb_support_loading"], equipmentRequirementIds: ["stable-upper-limb-support"],
    setupComplexity: "moderate", fatigueCost: "low", intendedSections: ["warmup", "activation"], compatibleDemandIds: ["scapular_protraction_control", "upper_limb_support_control"],
    incompatibleConditionIds: ["upper_limb_support_excluded", "wrist_extension_excluded"], painConsiderations: ["Wrist and shoulder response choose wall/elevated support or exclude the drill."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Support and repetitions remain quality-limited and non-fatiguing." }, timingConstraints: ["Use before press rehearsal or acclimation.", "Do not turn the drill into a fatiguing push-up set."],
    evidenceRefs: ACTIVATION_EVIDENCE, explanation: "Provides a no-wall-capable scapular protraction option when support loading remains legal.",
  }),
  profile({
    exerciseId: "dead-bug", categories: ["activation_control"], movementRoles: ["anti_extension_core"], actionFunctions: [], targetMuscles: ["trunk"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip"], mechanicalStressTags: ["long_lever_core"], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "low",
    intendedSections: ["activation"], compatibleDemandIds: ["anti_extension_control", "trunk_position_control"], incompatibleConditionIds: ["supine_position_excluded", "long_lever_core_excluded"], painConsiderations: ["Shorten the lever or exclude when symptoms increase."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Prescription selects a controlled non-fatiguing limb realization." }, timingConstraints: ["Must not fatigue the trunk before required loaded work."], evidenceRefs: [...ACTIVATION_EVIDENCE, ...DOCTRINE], explanation: "Serves explicit anti-extension or trunk-position control, not generic core filler.",
  }),
  profile({
    exerciseId: "bird-dog", categories: ["activation_control"], movementRoles: ["anti_extension_core", "anti_rotation_core"], actionFunctions: [], targetMuscles: ["trunk"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip", "shoulder"], mechanicalStressTags: ["upper_limb_support_loading"], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "moderate", fatigueCost: "low",
    intendedSections: ["activation"], compatibleDemandIds: ["anti_rotation_control", "contralateral_control"], incompatibleConditionIds: ["quadruped_support_excluded"], painConsiderations: ["Wrist, knee, shoulder, and lumbar response override selection."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Prescription owns limb choice and quality-limited dose." }, timingConstraints: ["Must remain low fatigue before main work."], evidenceRefs: [...ACTIVATION_EVIDENCE, ...DOCTRINE], explanation: "Serves explicit contralateral or anti-rotation control when quadruped support is legal.",
  }),
  profile({
    exerciseId: "moving-ninety-ninety-hip-switch", categories: ["dynamic_mobility", "range_access"], movementRoles: ["mobility"], actionFunctions: ["hip_internal_rotation", "hip_external_rotation"], targetMuscles: [],
    bodyRegions: ["hip", "pelvis", "knee"], mechanicalStressTags: [], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "minimal",
    intendedSections: ["warmup"], compatibleDemandIds: ["hip_rotation_range", "lower_body_range_access"], incompatibleConditionIds: ["seated_hip_rotation_excluded"], painConsiderations: ["Hip and knee response bound the range; no forced end position."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use smooth quality-limited switches; no universal repetition count is approved." }, timingConstraints: ["Precedes lower-body movement rehearsal and exercise acclimation."], evidenceRefs: [...DYNAMIC_EVIDENCE, ...DOCTRINE], explanation: "Serves a typed hip-rotation range need, not every lower-body session.",
  }),
  profile({
    exerciseId: "quadruped-hip-rock-back", categories: ["dynamic_mobility", "range_access"], movementRoles: ["mobility"], actionFunctions: ["hip_flexion"], targetMuscles: [],
    bodyRegions: ["hip", "pelvis", "lumbar_spine", "knee", "wrist"], mechanicalStressTags: ["upper_limb_support_loading"], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "minimal",
    intendedSections: ["warmup"], compatibleDemandIds: ["hip_flexion_range", "supported_hip_range"], incompatibleConditionIds: ["quadruped_support_excluded"], painConsiderations: ["Wrist, knee, hip, or lumbar response may require forearm support or exclusion."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use a controlled range and stop before compensatory trunk motion." }, timingConstraints: ["Precedes squat or hinge rehearsal and acclimation."], evidenceRefs: [...DYNAMIC_EVIDENCE, ...DOCTRINE], explanation: "Serves a typed supported hip-flexion range need.",
  }),
  profile({
    exerciseId: "wall-ankle-dorsiflexion-rock", categories: ["dynamic_mobility", "range_access"], movementRoles: ["mobility"], actionFunctions: ["ankle_dorsiflexion"], targetMuscles: [],
    bodyRegions: ["ankle", "knee"], mechanicalStressTags: [], equipmentRequirementIds: ["wall-and-floor-space"], setupComplexity: "low", fatigueCost: "minimal",
    intendedSections: ["warmup"], compatibleDemandIds: ["ankle_dorsiflexion_range", "knee_dominant_range_access"], incompatibleConditionIds: ["wall_unavailable", "ankle_or_knee_response_exclusion"], painConsiderations: ["Heel, ankle, and knee response bound the range."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use a controlled rock with no universal repetition default." }, timingConstraints: ["Precedes knee-dominant rehearsal and acclimation."], evidenceRefs: [...DYNAMIC_EVIDENCE, ...DOCTRINE], explanation: "Serves explicit ankle-dorsiflexion range needs when a wall is available.",
  }),
  profile({
    exerciseId: "half-kneeling-hip-flexor-stretch", categories: ["range_access", "cooldown_downshift"], movementRoles: ["mobility"], actionFunctions: ["hip_extension"], targetMuscles: [],
    bodyRegions: ["hip", "pelvis", "knee", "lumbar_spine"], mechanicalStressTags: [], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "moderate", fatigueCost: "minimal",
    intendedSections: ["warmup", "cooldown"], compatibleDemandIds: ["hip_extension_range", "comfortable_post_session_range"], incompatibleConditionIds: ["half_kneeling_excluded", "unsupported_recovery_claim"], painConsiderations: ["Knee contact, hip, and lumbar response override selection."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "static_hold", minimum: null, maximum: 45, unit: "seconds", explanation: "Pre-main static exposure is capped at 45 seconds per side as a performance boundary, not a default; cooldown dose remains Prescription-owned." }, timingConstraints: ["Before main work, only for a required range limitation and followed by dynamic or task-specific preparation.", "Cooldown use is optional and carries no soreness or recovery guarantee."], evidenceRefs: ["static-stretching-simic-2013", "postexercise-stretch-afonso-2021", ...DOCTRINE], explanation: "Serves explicit hip-extension range or optional comfortable cooldown ownership; couch-stretch geometry remains deferred.",
  }),
  profile({
    exerciseId: "bodyweight-squat-rehearsal", categories: ["movement_rehearsal"], movementRoles: ["squat", "knee_dominant"], actionFunctions: ["knee_extension", "hip_extension"], targetMuscles: ["quads", "glutes"],
    bodyRegions: ["hip", "knee", "ankle", "pelvis"], mechanicalStressTags: ["deep_knee_flexion"], equipmentRequirementIds: ["bodyweight-standing-space"], setupComplexity: "low", fatigueCost: "low",
    intendedSections: ["warmup", "activation"], compatibleDemandIds: ["squat_pattern_rehearsal", "knee_dominant_rehearsal"], incompatibleConditionIds: ["deep_knee_flexion_excluded"], painConsiderations: ["Depth and support remain subordinate to hip, knee, and ankle response."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use a low-fatigue quality-limited rehearsal dose." }, timingConstraints: ["Precedes exercise-specific squat acclimation.", "Must not replace or earn credit for required loaded work."], evidenceRefs: ["specific-warmup-abad-2011", ...DOCTRINE], explanation: "Rehearses unloaded squat mechanics without requiring a box or external load.",
  }),
  profile({
    exerciseId: "bodyweight-box-squat", categories: ["movement_rehearsal"], movementRoles: ["squat", "knee_dominant"], actionFunctions: ["knee_extension", "hip_extension"], targetMuscles: ["quads", "glutes"],
    bodyRegions: ["hip", "knee", "ankle"], mechanicalStressTags: ["deep_knee_flexion"], equipmentRequirementIds: ["bodyweight-floor", "box"], setupComplexity: "low", fatigueCost: "low", intendedSections: ["warmup", "activation"],
    compatibleDemandIds: ["box_bounded_squat_rehearsal"], incompatibleConditionIds: ["box_unavailable", "deep_knee_flexion_excluded"], painConsiderations: ["Box height and depth remain response-bounded."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Prescription owns box height and low-fatigue repetition dose." }, timingConstraints: ["Precedes loaded knee-dominant acclimation."], evidenceRefs: ["specific-warmup-abad-2011", ...DOCTRINE], explanation: "Provides box-bounded squat rehearsal when exact box capability is available.",
  }),
  profile({
    exerciseId: "bodyweight-hip-hinge-rehearsal", categories: ["movement_rehearsal"], movementRoles: ["hinge"], actionFunctions: ["hip_extension"], targetMuscles: ["glutes", "hamstrings"],
    bodyRegions: ["hip", "pelvis", "lumbar_spine"], mechanicalStressTags: [], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "low", intendedSections: ["warmup", "activation"],
    compatibleDemandIds: ["hinge_pattern_rehearsal"], incompatibleConditionIds: ["hinge_response_exclusion"], painConsiderations: ["Range and support remain subordinate to lumbar and hip response."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "dynamic_repetitions", minimum: null, maximum: null, unit: "repetitions", explanation: "Use a low-fatigue quality-limited rehearsal dose." }, timingConstraints: ["Precedes loaded hinge acclimation.", "Must not earn developmental hinge credit."], evidenceRefs: ["specific-warmup-abad-2011", ...DOCTRINE], explanation: "Rehearses unloaded hinge mechanics before an owned hinge task.",
  }),
  profile({
    exerciseId: "single-leg-balance-rehearsal", categories: ["activation_control", "movement_rehearsal"], movementRoles: ["single_leg"], actionFunctions: ["single_leg_stance_control"], targetMuscles: ["hip_abductors"],
    bodyRegions: ["hip", "pelvis", "ankle"], mechanicalStressTags: [], equipmentRequirementIds: ["bodyweight-floor"], setupComplexity: "low", fatigueCost: "low", intendedSections: ["warmup", "activation"],
    compatibleDemandIds: ["single_leg_stance_control"], incompatibleConditionIds: ["single_leg_stance_excluded"], painConsiderations: ["Use stable support or exclude when balance or joint response requires it."], prerequisiteIds: [], ownership: "shared",
    dosage: { doseMode: "duration", minimum: null, maximum: null, unit: "seconds", explanation: "Prescription owns support and exposure duration." }, timingConstraints: ["Precedes dynamic or loaded single-leg work and remains non-fatiguing."], evidenceRefs: [...ACTIVATION_EVIDENCE, ...DOCTRINE], explanation: "Serves an explicit stationary single-leg control dependency.",
  }),
]);

const PROFILE_BY_ID = new Map(PREPARATION_KNOWLEDGE_PROFILES.map((entry) => [entry.exerciseId, entry]));

export function getPreparationKnowledgeProfile(
  exerciseId: string,
): PreparationKnowledgeProfile | undefined {
  return PROFILE_BY_ID.get(exerciseId);
}
