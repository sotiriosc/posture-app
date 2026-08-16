import { deriveAlignmentPriorities } from "../alignment";
import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import { EMPTY_TRAINING_HISTORY, type TrainingHistory } from "../domain/history";
import {
  NO_PAIN_OR_INJURY,
  type PainAndInjuryState,
} from "../domain/painInjury";
import { THREE_PHASE_FOUNDATION, type PhaseId, type PhaseIntent } from "../domain/phase";
import type {
  BodyRegion,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "../domain/primitives";
import type { SessionSection, TrainingRole } from "../domain/session";
import type {
  CandidateNeed,
  CandidateRequest,
  ContinuityContext,
  FatigueSignal,
} from "../candidate/request";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  LOOP_BANDS_ONLY_EQUIPMENT,
} from "./goldenPersonas";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "./referenceExercises";

export interface ControlledCandidateScenario {
  readonly id: string;
  readonly title: string;
  readonly focus: readonly string[];
  readonly request: CandidateRequest;
}

const NEUTRAL_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const HIGH_CONFIDENCE_SCAPULAR_ASSESSMENT: AssessmentState = {
  signals: [
    {
      id: "confirmed-scapular-control-priority",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      muscleGroup: "serratus",
      description: "Confirmed scapular control priority should influence prep and accessory choices.",
    },
  ],
  historicalWeaknesses: [],
};

const LOW_CONFIDENCE_SCAPULAR_ASSESSMENT: AssessmentState = {
  signals: [
    {
      id: "photo-scapular-control-uncertain",
      type: "control_finding",
      source: "photo_assessment",
      confidence: "low",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      muscleGroup: "serratus",
      description: "Low-confidence scapular observation should remain visible without dominating ranking.",
    },
  ],
  historicalWeaknesses: [],
};

const LOW_BACK_CONTROL_ASSESSMENT: AssessmentState = {
  signals: [
    {
      id: "low-back-hinge-control-priority",
      type: "control_finding",
      source: "movement_screen",
      confidence: "medium",
      priority: "secondary",
      region: "lumbar_spine",
      movementRole: "hinge",
      description: "Hinge control should influence loaded hinge and unsupported row decisions.",
    },
  ],
  historicalWeaknesses: [],
};

const LOW_BACK_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "mild-low-back-discomfort",
      region: "lumbar_spine",
      severity0To10: 2,
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
      effect: "prefer_support",
      description: "Mild low-back discomfort should prefer supported rows without hard-excluding every pull.",
    },
  ],
};

const MODERATE_LOW_BACK_PAIN: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  moderatePain: [
    {
      kind: "moderate_pain",
      id: "moderate-low-back-loaded-hinge-pain",
      region: "lumbar_spine",
      severity0To10: 4,
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
      requiredResponse: "avoid_aggravator",
      description: "Moderate low-back pain should push loaded hinge stress into review.",
    },
  ],
};

const SHOULDER_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "mild-shoulder-pressing-discomfort",
      region: "shoulder",
      severity0To10: 2,
      stressTags: ["horizontal_pressing", "shoulder_abduction_external_rotation"],
      effect: "prefer_support",
      description: "Mild shoulder discomfort should affect pressing suitability, not erase all pressing.",
    },
  ],
};

const BODYWEIGHT_PUSH_UP_BLOCK: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  personalExerciseBlocks: [
    {
      kind: "personal_exercise_block",
      id: "blocked-push-up",
      exerciseIds: ["push-up"],
      reason: "Athlete has explicitly blocked push-ups.",
      createdBy: "athlete",
    },
  ],
};

const EMPTY_CONTINUITY: ContinuityContext = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
};

function phase(id: PhaseId): PhaseIntent {
  return THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id) ?? THREE_PHASE_FOUNDATION[0];
}

function persona(id: string): AthleteProfile {
  const found = GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === id);
  if (!found) {
    throw new Error(`Missing golden persona ${id}`);
  }

  return found.athlete;
}

function trainingHistory(overrides: Partial<TrainingHistory> = {}): TrainingHistory {
  return {
    ...EMPTY_TRAINING_HISTORY,
    ...overrides,
    exerciseHistory: {
      ...EMPTY_TRAINING_HISTORY.exerciseHistory,
      ...overrides.exerciseHistory,
    },
    sessionHistory: {
      ...EMPTY_TRAINING_HISTORY.sessionHistory,
      ...overrides.sessionHistory,
    },
    programHistory: {
      ...EMPTY_TRAINING_HISTORY.programHistory,
      ...overrides.programHistory,
    },
    progressionState: {
      ...EMPTY_TRAINING_HISTORY.progressionState,
      ...overrides.progressionState,
    },
    fatigueState: {
      ...EMPTY_TRAINING_HISTORY.fatigueState,
      ...overrides.fatigueState,
      byMovementRole: {
        ...EMPTY_TRAINING_HISTORY.fatigueState.byMovementRole,
        ...overrides.fatigueState?.byMovementRole,
      },
    },
  };
}

function need(input: {
  readonly id: string;
  readonly whyNeeded: string;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly targetBodyRegions: readonly BodyRegion[];
  readonly goal: TrainingGoal;
}): CandidateNeed {
  return { ...input, muscleRequirement: "primary_preferred" };
}

function makeRequest(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly goal: TrainingGoal;
  readonly phaseId: PhaseId;
  readonly need: CandidateNeed;
  readonly equipment: EquipmentCapabilities;
  readonly assessment?: AssessmentState;
  readonly painAndInjury?: PainAndInjuryState;
  readonly history?: TrainingHistory;
  readonly continuity?: ContinuityContext;
  readonly satisfiedPrerequisiteIds?: readonly string[];
  readonly fatigueSignals?: readonly FatigueSignal[];
  readonly notes?: readonly string[];
}): CandidateRequest {
  const assessment = input.assessment ?? NEUTRAL_ASSESSMENT;

  return {
    id: input.id,
    athlete: persona(input.athleteId),
    goal: input.goal,
    phase: phase(input.phaseId),
    need: input.need,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painAndInjury ?? NO_PAIN_OR_INJURY,
    equipment: input.equipment,
    history: input.history ?? trainingHistory(),
    continuity: input.continuity ?? EMPTY_CONTINUITY,
    candidatePool: REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: input.satisfiedPrerequisiteIds ?? [],
    fatigueSignals: input.fatigueSignals ?? ["fresh"],
    notes: input.notes,
  };
}

const horizontalPullMain = (goal: TrainingGoal = "strength") =>
  need({
    id: `horizontal-pull-main-${goal}`,
    whyNeeded: "Choose a loadable horizontal pull for the main session slot.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_pull"],
    targetMuscles: ["mid_back", "lats"],
    targetBodyRegions: ["shoulder", "thoracic_spine"],
    goal,
  });

const horizontalPullSecondary = need({
  id: "horizontal-pull-secondary",
  whyNeeded: "Choose a practical horizontal pull when primary equipment is constrained.",
  requestedRole: "secondary_strength",
  requestedSection: "accessory",
  targetMovementRoles: ["horizontal_pull"],
  targetMuscles: ["mid_back", "lats", "rear_delts"],
  targetBodyRegions: ["shoulder", "thoracic_spine"],
  goal: "general_fitness",
});

const scapularActivation = need({
  id: "scapular-activation",
  whyNeeded: "Choose an activation drill that directly supports scapular control.",
  requestedRole: "activation",
  requestedSection: "activation",
  targetMovementRoles: ["scapular_control", "horizontal_pull"],
  targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
  targetBodyRegions: ["shoulder", "thoracic_spine"],
  goal: "posture_and_movement_quality",
});

const horizontalPushMain = (goal: TrainingGoal = "strength") =>
  need({
    id: `horizontal-push-main-${goal}`,
    whyNeeded: "Choose a horizontal push for the main session slot.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_push"],
    targetMuscles: ["chest", "triceps"],
    targetBodyRegions: ["shoulder", "elbow"],
    goal,
  });

const squatMain = (goal: TrainingGoal = "strength") =>
  need({
    id: `squat-main-${goal}`,
    whyNeeded: "Choose a knee-dominant exercise for the lower-body main slot.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["knee_dominant"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal,
  });

const hingeSecondary = need({
  id: "hinge-secondary",
  whyNeeded: "Choose a posterior-chain hinge exposure that fits current capability and symptoms.",
  requestedRole: "secondary_strength",
  requestedSection: "accessory",
  targetMovementRoles: ["hinge"],
  targetMuscles: ["hamstrings", "glutes"],
  targetBodyRegions: ["hip", "lumbar_spine"],
  goal: "strength",
});

const rearDeltAccessory = need({
  id: "rear-delt-accessory",
  whyNeeded: "Choose rear-delt and upper-back accessory work with scapular-control relevance.",
  requestedRole: "hypertrophy_accessory",
  requestedSection: "accessory",
  targetMovementRoles: ["horizontal_pull", "scapular_control"],
  targetMuscles: ["rear_delts", "upper_back"],
  targetBodyRegions: ["shoulder", "thoracic_spine"],
  goal: "hypertrophy",
});

export const CONTROLLED_CANDIDATE_SCENARIOS: readonly ControlledCandidateScenario[] = [
  {
    id: "horizontal-pull-gym-neutral",
    title: "Horizontal pull, full gym, neutral profile",
    focus: ["legal pool", "role fit", "loadability"],
    request: makeRequest({
      id: "horizontal-pull-gym-neutral",
      athleteId: "intermediate-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
    }),
  },
  {
    id: "horizontal-pull-low-back-discomfort",
    title: "Horizontal pull with low-back discomfort",
    focus: ["pain suitability", "joint cost", "support preference"],
    request: makeRequest({
      id: "horizontal-pull-low-back-discomfort",
      athleteId: "mixed-home",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
      assessment: LOW_BACK_CONTROL_ASSESSMENT,
      painAndInjury: LOW_BACK_DISCOMFORT,
    }),
  },
  {
    id: "horizontal-pull-low-confidence-scapular",
    title: "Horizontal pull with low-confidence scapular observation",
    focus: ["low confidence does not dominate", "assessment visibility"],
    request: makeRequest({
      id: "horizontal-pull-low-confidence-scapular",
      athleteId: "intermediate-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
      assessment: LOW_CONFIDENCE_SCAPULAR_ASSESSMENT,
    }),
  },
  {
    id: "scapular-activation-high-confidence",
    title: "Activation with confirmed scapular priority",
    focus: ["assessment influence", "alignment influence", "activation role"],
    request: makeRequest({
      id: "scapular-activation-high-confidence",
      athleteId: "anchored-bands",
      goal: "posture_and_movement_quality",
      phaseId: "phase_1",
      need: scapularActivation,
      equipment: ANCHORED_BANDS_EQUIPMENT,
      assessment: HIGH_CONFIDENCE_SCAPULAR_ASSESSMENT,
    }),
  },
  {
    id: "horizontal-pull-productive-continuity",
    title: "Horizontal pull favors productive continuity",
    focus: ["continuity", "progression opportunity"],
    request: makeRequest({
      id: "horizontal-pull-productive-continuity",
      athleteId: "intermediate-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
      continuity: {
        ...EMPTY_CONTINUITY,
        currentExerciseId: "chest-supported-dumbbell-row",
        productiveExerciseIds: ["chest-supported-dumbbell-row"],
      },
      history: trainingHistory({
        exerciseHistory: {
          events: [],
          stableExerciseIds: ["chest-supported-dumbbell-row"],
          blockedExerciseIds: [],
        },
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          readyToProgressExerciseIds: ["chest-supported-dumbbell-row"],
        },
      }),
    }),
  },
  {
    id: "horizontal-pull-plateau-replacement",
    title: "Horizontal pull replacement after plateau",
    focus: ["replacement", "stalled progression"],
    request: makeRequest({
      id: "horizontal-pull-plateau-replacement",
      athleteId: "intermediate-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
      continuity: {
        ...EMPTY_CONTINUITY,
        currentExerciseId: "chest-supported-dumbbell-row",
        plateauedExerciseIds: ["chest-supported-dumbbell-row"],
        failedProgressionExerciseIds: ["chest-supported-dumbbell-row"],
      },
      history: trainingHistory({
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          stalledExerciseIds: ["chest-supported-dumbbell-row"],
        },
      }),
    }),
  },
  {
    id: "horizontal-push-phase-1",
    title: "Horizontal push in Phase 1",
    focus: ["phase appropriateness", "control"],
    request: makeRequest({
      id: "horizontal-push-phase-1",
      athleteId: "beginner-gym-no-pain",
      goal: "strength",
      phaseId: "phase_1",
      need: horizontalPushMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    }),
  },
  {
    id: "horizontal-push-phase-3",
    title: "Horizontal push in Phase 3",
    focus: ["phase appropriateness", "loadability"],
    request: makeRequest({
      id: "horizontal-push-phase-3",
      athleteId: "advanced-gym-muscle-gain",
      goal: "hypertrophy",
      phaseId: "phase_3",
      need: horizontalPushMain("hypertrophy"),
      equipment: FULL_GYM_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    }),
  },
  {
    id: "horizontal-push-shoulder-discomfort",
    title: "Horizontal push with shoulder discomfort",
    focus: ["pain suitability", "joint cost"],
    request: makeRequest({
      id: "horizontal-push-shoulder-discomfort",
      athleteId: "beginner-gym-shoulder-concern",
      goal: "pain_aware_return",
      phaseId: "phase_1",
      need: horizontalPushMain("pain_aware_return"),
      equipment: FULL_GYM_EQUIPMENT,
      painAndInjury: SHOULDER_DISCOMFORT,
      assessment: HIGH_CONFIDENCE_SCAPULAR_ASSESSMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    }),
  },
  {
    id: "horizontal-push-no-bench",
    title: "Horizontal push with dumbbells but no bench",
    focus: ["equipment hard eligibility", "home constraints"],
    request: makeRequest({
      id: "horizontal-push-no-bench",
      athleteId: "dumbbells-without-bench",
      goal: "strength",
      phaseId: "phase_1",
      need: horizontalPushMain("strength"),
      equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    }),
  },
  {
    id: "lower-squat-phase-1",
    title: "Squat pattern in Phase 1",
    focus: ["phase-sensitive ranking", "range control"],
    request: makeRequest({
      id: "lower-squat-phase-1",
      athleteId: "beginner-gym-no-pain",
      goal: "strength",
      phaseId: "phase_1",
      need: squatMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
    }),
  },
  {
    id: "lower-squat-phase-3",
    title: "Squat pattern in Phase 3",
    focus: ["phase-sensitive ranking", "stimulus potential"],
    request: makeRequest({
      id: "lower-squat-phase-3",
      athleteId: "advanced-gym-muscle-gain",
      goal: "hypertrophy",
      phaseId: "phase_3",
      need: squatMain("hypertrophy"),
      equipment: FULL_GYM_EQUIPMENT,
    }),
  },
  {
    id: "lower-hinge-moderate-low-back-pain",
    title: "Hinge with moderate low-back pain",
    focus: ["pain review warning", "joint cost"],
    request: makeRequest({
      id: "lower-hinge-moderate-low-back-pain",
      athleteId: "advanced-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: hingeSecondary,
      equipment: FULL_GYM_EQUIPMENT,
      assessment: LOW_BACK_CONTROL_ASSESSMENT,
      painAndInjury: MODERATE_LOW_BACK_PAIN,
      satisfiedPrerequisiteIds: ["hinge-control"],
    }),
  },
  {
    id: "lower-hinge-capability-missing",
    title: "Hinge without required hinge competency",
    focus: ["capability hard eligibility", "legal substitution pool"],
    request: makeRequest({
      id: "lower-hinge-capability-missing",
      athleteId: "beginner-gym-no-pain",
      goal: "strength",
      phaseId: "phase_1",
      need: hingeSecondary,
      equipment: FULL_GYM_EQUIPMENT,
      assessment: LOW_BACK_CONTROL_ASSESSMENT,
    }),
  },
  {
    id: "home-dumbbells-bench-horizontal-pull",
    title: "Home dumbbells and bench horizontal pull",
    focus: ["home equipment truth", "support option"],
    request: makeRequest({
      id: "home-dumbbells-bench-horizontal-pull",
      athleteId: "beginner-dumbbells-bench",
      goal: "strength",
      phaseId: "phase_1",
      need: horizontalPullMain("strength"),
      equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
    }),
  },
  {
    id: "home-dumbbells-no-bench-horizontal-pull",
    title: "Home dumbbells without bench horizontal pull",
    focus: ["bench-dependent rejection", "legal unsupported dumbbell option"],
    request: makeRequest({
      id: "home-dumbbells-no-bench-horizontal-pull",
      athleteId: "dumbbells-without-bench",
      goal: "strength",
      phaseId: "phase_1",
      need: horizontalPullMain("strength"),
      equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
    }),
  },
  {
    id: "anchored-bands-horizontal-pull",
    title: "Anchored bands horizontal pull",
    focus: ["anchor-aware legality", "band row"],
    request: makeRequest({
      id: "anchored-bands-horizontal-pull",
      athleteId: "anchored-bands",
      goal: "general_fitness",
      phaseId: "phase_1",
      need: horizontalPullSecondary,
      equipment: ANCHORED_BANDS_EQUIPMENT,
    }),
  },
  {
    id: "bands-without-anchor-horizontal-pull",
    title: "Tube bands without anchor horizontal pull",
    focus: ["setup hard eligibility", "band ownership is not anchor capability"],
    request: makeRequest({
      id: "bands-without-anchor-horizontal-pull",
      athleteId: "bands-without-anchor",
      goal: "general_fitness",
      phaseId: "phase_1",
      need: horizontalPullSecondary,
      equipment: BANDS_WITHOUT_ANCHOR_EQUIPMENT,
    }),
  },
  {
    id: "loop-bands-only-horizontal-pull",
    title: "Loop bands only horizontal pull",
    focus: ["band type distinction", "no anchored-tube assumption"],
    request: makeRequest({
      id: "loop-bands-only-horizontal-pull",
      athleteId: "loop-bands-only",
      goal: "general_fitness",
      phaseId: "phase_1",
      need: horizontalPullSecondary,
      equipment: LOOP_BANDS_ONLY_EQUIPMENT,
    }),
  },
  {
    id: "bodyweight-personal-block-push-up",
    title: "Bodyweight push with explicit personal block",
    focus: ["personal block hard rule", "preference is not medical contraindication"],
    request: makeRequest({
      id: "bodyweight-personal-block-push-up",
      athleteId: "bodyweight",
      goal: "strength",
      phaseId: "phase_1",
      need: horizontalPushMain("strength"),
      equipment: BODYWEIGHT_EQUIPMENT,
      painAndInjury: BODYWEIGHT_PUSH_UP_BLOCK,
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    }),
  },
  {
    id: "rear-delt-accessory-scapular-priority",
    title: "Rear-delt accessory with confirmed scapular priority",
    focus: ["accessory ranking", "assessment/alignment score visibility"],
    request: makeRequest({
      id: "rear-delt-accessory-scapular-priority",
      athleteId: "advanced-gym-muscle-gain",
      goal: "hypertrophy",
      phaseId: "phase_3",
      need: rearDeltAccessory,
      equipment: FULL_GYM_EQUIPMENT,
      assessment: HIGH_CONFIDENCE_SCAPULAR_ASSESSMENT,
    }),
  },
  {
    id: "horizontal-pull-fatigue-context",
    title: "Horizontal pull under fatigue context",
    focus: ["fatigue cost", "stimulus vs recoverability"],
    request: makeRequest({
      id: "horizontal-pull-fatigue-context",
      athleteId: "intermediate-gym-muscle-gain",
      goal: "strength",
      phaseId: "phase_2",
      need: horizontalPullMain("strength"),
      equipment: FULL_GYM_EQUIPMENT,
      fatigueSignals: ["local_fatigue", "joint_stress_accumulated"],
      history: trainingHistory({
        fatigueState: {
          overall: "moderate",
          byMovementRole: {
            horizontal_pull: "high",
          },
        },
      }),
    }),
  },
];

export function getControlledCandidateScenario(id: string): ControlledCandidateScenario | undefined {
  return CONTROLLED_CANDIDATE_SCENARIOS.find((scenario) => scenario.id === id);
}
