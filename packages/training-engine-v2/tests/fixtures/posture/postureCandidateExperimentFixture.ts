import {
  deriveAlignmentPriorities,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  type AssessmentState,
  type CandidateNeed,
  type CandidateRequest,
} from "../../../src";
import { POSTURE_PHOTO_ASSESSMENT_STATE } from "./realPostureAssessmentFixture";

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const continuity = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
} as const;

function requireValue<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing posture photo experiment ${label}.`);
  }

  return value;
}

const athlete = requireValue(
  GOLDEN_PERSONAS.find((persona) => persona.fixtureId === "intermediate-gym-muscle-gain")
    ?.athlete,
  "base athlete",
);

const phase = requireValue(
  THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === "phase_2"),
  "base phase",
);

export const POSTURE_PHOTO_EXPERIMENT_NEEDS: readonly CandidateNeed[] = [
  {
    id: "photo-exp-horizontal-push",
    whyNeeded: "Diagnostic horizontal push comparison.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_push"],
    targetMuscles: ["chest", "triceps"],
    targetBodyRegions: ["shoulder", "elbow"],
    goal: "strength",
  },
  {
    id: "photo-exp-horizontal-pull",
    whyNeeded: "Diagnostic horizontal pull comparison.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_pull"],
    targetMuscles: ["mid_back", "lats"],
    targetBodyRegions: ["shoulder", "thoracic_spine"],
    goal: "strength",
  },
  {
    id: "photo-exp-trunk-activation",
    whyNeeded: "Diagnostic trunk-control activation comparison.",
    requestedRole: "activation",
    requestedSection: "activation",
    targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
    targetMuscles: ["trunk"],
    targetBodyRegions: ["lumbar_spine", "pelvis"],
    goal: "posture_and_movement_quality",
  },
  {
    id: "photo-exp-squat-main",
    whyNeeded: "Diagnostic squat-pattern comparison.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal: "strength",
  },
  {
    id: "photo-exp-single-leg-accessory",
    whyNeeded: "Diagnostic single-leg and hip-stability comparison.",
    requestedRole: "hypertrophy_accessory",
    requestedSection: "accessory",
    targetMovementRoles: ["single_leg"],
    targetMuscles: ["glutes", "hip_abductors"],
    targetBodyRegions: ["hip", "knee"],
    goal: "hypertrophy",
  },
];

export function createPosturePhotoCandidateExperimentRequests(input: {
  readonly assessmentEnabled: boolean;
}): readonly CandidateRequest[] {
  const assessment = input.assessmentEnabled
    ? POSTURE_PHOTO_ASSESSMENT_STATE
    : EMPTY_ASSESSMENT;

  return POSTURE_PHOTO_EXPERIMENT_NEEDS.map((need) => ({
    id: `${need.id}-${input.assessmentEnabled ? "assessment-on" : "assessment-off"}`,
    athlete,
    goal: need.goal,
    phase,
    need,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: FULL_GYM_EQUIPMENT,
    history: EMPTY_TRAINING_HISTORY,
    continuity,
    candidatePool: REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control", "overhead-control"],
    fatigueSignals: ["fresh"],
  }));
}
