import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { deriveAlignmentPriorities } from "../../src/alignment";
import { rankCandidateRequest } from "../../src/candidate/ranking/rankCandidates";
import type {
  CandidateNeed,
  CandidateRequest,
  ContinuityContext,
  FatigueSignal,
} from "../../src/candidate/request";
import { CANDIDATE_SCORE_COMPONENTS } from "../../src/candidate/scoring/components";
import {
  EMPTY_TRAINING_HISTORY,
  type TrainingHistory,
} from "../../src/domain/history";
import {
  NO_PAIN_OR_INJURY,
  type PainAndInjuryState,
} from "../../src/domain/painInjury";
import { THREE_PHASE_FOUNDATION, type PhaseId } from "../../src/domain/phase";
import type {
  BodyRegion,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "../../src/domain/primitives";
import type { SessionSection, TrainingRole } from "../../src/domain/session";
import type {
  AssessmentSignal,
  AssessmentState,
} from "../../src/domain/assessment";
import type {
  ExerciseDefinition,
  ExerciseDemandAnnotation,
  ScapularMechanicsProfile,
} from "../../src/domain/exercise";
import type { EquipmentCapabilities } from "../../src/domain/equipment";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
} from "../../src/data/goldenPersonas";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import type {
  CandidateRankingResult,
  RankedCandidate,
} from "../../src/candidate/types";
import { createPosturePhotoCandidateExperimentRequests } from "../fixtures/posture/postureCandidateExperimentFixture";

type Provenance = "CONFIDENT" | "REASONABLE_INFERENCE" | "NEEDS_REVIEW" | "UNKNOWN";

interface AuditBuildResult {
  readonly markdown: string;
  readonly counts: Readonly<Record<Provenance, number>>;
}

interface ReviewScenario {
  readonly id: string;
  readonly group: string;
  readonly title: string;
  readonly request: CandidateRequest;
}

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const EMPTY_CONTINUITY: ContinuityContext = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
};

const COMPONENT_IDS = CANDIDATE_SCORE_COMPONENTS.map((component) => component.id);

function md(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "none";
  }

  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function list(values: readonly string[] | undefined): string {
  return values && values.length > 0 ? values.join(", ") : "none";
}

function formatNumber(value: number | null | undefined, digits = 3): string {
  return typeof value === "number" ? value.toFixed(digits) : "unknown";
}

function persona(fixtureId: string) {
  const found = GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === fixtureId);
  if (!found) {
    throw new Error(`Missing golden persona ${fixtureId}`);
  }

  return found.athlete;
}

function phase(id: PhaseId) {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing phase ${id}`);
  }

  return found;
}

function history(overrides: Partial<TrainingHistory> = {}): TrainingHistory {
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
  return input;
}

function makeRequest(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly goal: TrainingGoal;
  readonly phaseId: PhaseId;
  readonly need: CandidateNeed;
  readonly equipment?: EquipmentCapabilities;
  readonly assessment?: AssessmentState;
  readonly painAndInjury?: PainAndInjuryState;
  readonly history?: TrainingHistory;
  readonly continuity?: ContinuityContext;
  readonly satisfiedPrerequisiteIds?: readonly string[];
  readonly fatigueSignals?: readonly FatigueSignal[];
  readonly candidatePool?: readonly ExerciseDefinition[];
}): CandidateRequest {
  const assessment = input.assessment ?? EMPTY_ASSESSMENT;

  return {
    id: input.id,
    athlete: persona(input.athleteId),
    goal: input.goal,
    phase: phase(input.phaseId),
    need: input.need,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painAndInjury ?? NO_PAIN_OR_INJURY,
    equipment: input.equipment ?? FULL_GYM_EQUIPMENT,
    history: input.history ?? history(),
    continuity: input.continuity ?? EMPTY_CONTINUITY,
    candidatePool: input.candidatePool ?? REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: input.satisfiedPrerequisiteIds ?? [],
    fatigueSignals: input.fatigueSignals ?? ["fresh"],
  };
}

function horizontalPullNeed(goal: TrainingGoal = "strength"): CandidateNeed {
  return need({
    id: `review-horizontal-pull-${goal}`,
    whyNeeded: "Audit a horizontal pull candidate choice.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_pull"],
    targetMuscles: ["mid_back", "lats"],
    targetBodyRegions: ["shoulder", "thoracic_spine"],
    goal,
  });
}

function horizontalPushNeed(goal: TrainingGoal = "strength"): CandidateNeed {
  return need({
    id: `review-horizontal-push-${goal}`,
    whyNeeded: "Audit a horizontal push candidate choice.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["horizontal_push"],
    targetMuscles: ["chest", "triceps"],
    targetBodyRegions: ["shoulder", "elbow"],
    goal,
  });
}

function squatNeed(goal: TrainingGoal = "strength"): CandidateNeed {
  return need({
    id: `review-squat-${goal}`,
    whyNeeded: "Audit a squat-pattern candidate choice.",
    requestedRole: "primary_strength",
    requestedSection: "main",
    targetMovementRoles: ["squat"],
    targetMuscles: ["quads", "glutes"],
    targetBodyRegions: ["knee", "hip", "ankle"],
    goal,
  });
}

const hingeNeed = need({
  id: "review-hinge",
  whyNeeded: "Audit a hinge-pattern candidate choice.",
  requestedRole: "secondary_strength",
  requestedSection: "accessory",
  targetMovementRoles: ["hinge"],
  targetMuscles: ["hamstrings", "glutes"],
  targetBodyRegions: ["hip", "lumbar_spine"],
  goal: "strength",
});

const singleLegNeed = need({
  id: "review-single-leg",
  whyNeeded: "Audit a single-leg lower-body candidate choice.",
  requestedRole: "hypertrophy_accessory",
  requestedSection: "accessory",
  targetMovementRoles: ["single_leg"],
  targetMuscles: ["glutes", "hip_abductors"],
  targetBodyRegions: ["hip", "knee"],
  goal: "hypertrophy",
});

const trunkActivationNeed = need({
  id: "review-trunk-activation",
  whyNeeded: "Audit trunk-control activation choices.",
  requestedRole: "activation",
  requestedSection: "activation",
  targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
  targetMuscles: ["trunk"],
  targetBodyRegions: ["lumbar_spine", "pelvis"],
  goal: "posture_and_movement_quality",
});

const scapularActivationNeed = need({
  id: "review-scapular-activation",
  whyNeeded: "Audit scapular-control activation choices.",
  requestedRole: "activation",
  requestedSection: "activation",
  targetMovementRoles: ["scapular_control", "horizontal_pull"],
  targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
  targetBodyRegions: ["shoulder", "thoracic_spine"],
  goal: "posture_and_movement_quality",
});

function assessment(signals: readonly AssessmentSignal[]): AssessmentState {
  return {
    signals,
    historicalWeaknesses: [],
  };
}

const scapularPriority = assessment([
  {
    id: "review-scapular-control-priority",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "shoulder",
    movementRole: "scapular_control",
    muscleGroup: "serratus",
    description: "High-confidence scapular-control priority for audit tables.",
  },
]);

const shoulderScapularPriority = assessment([
  {
    id: "review-shoulder-scapular-control",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "shoulder",
    movementRole: "scapular_control",
    muscleGroup: "rotator_cuff",
    description: "Shoulder control concern for horizontal push audit.",
  },
]);

const trunkPriority = assessment([
  {
    id: "review-trunk-control-priority",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "lumbar_spine",
    movementRole: "anti_extension_core",
    muscleGroup: "trunk",
    description: "High-confidence trunk-control priority for audit tables.",
  },
]);

const lowBackHingePriority = assessment([
  {
    id: "review-low-back-hinge-control",
    type: "control_finding",
    source: "movement_screen",
    confidence: "medium",
    priority: "secondary",
    region: "lumbar_spine",
    movementRole: "hinge",
    description: "Low-back/hinge control priority for audit tables.",
  },
]);

const kneeAlignmentPriority = assessment([
  {
    id: "review-knee-alignment",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "knee",
    movementRole: "squat",
    muscleGroup: "glutes",
    description: "Knee alignment concern for squat audit.",
  },
]);

const hipKneeSingleLegPriority = assessment([
  {
    id: "review-hip-knee-single-leg",
    type: "asymmetry_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "hip",
    movementRole: "single_leg",
    muscleGroup: "hip_abductors",
    description: "Hip/knee control finding for single-leg audit.",
  },
]);

const irrelevantKneePriority = assessment([
  {
    id: "review-irrelevant-knee",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "knee",
    movementRole: "squat",
    muscleGroup: "glutes",
    description: "Deliberately irrelevant knee signal for non-lower-body activation audit.",
  },
]);

const lowBackDiscomfort: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "review-mild-low-back-discomfort",
      region: "lumbar_spine",
      severity0To10: 2,
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
      effect: "prefer_support",
      description: "Mild low-back discomfort for support/risk audit.",
    },
  ],
};

const shoulderDiscomfort: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "review-mild-shoulder-discomfort",
      region: "shoulder",
      severity0To10: 2,
      stressTags: ["horizontal_pressing", "shoulder_abduction_external_rotation"],
      effect: "prefer_support",
      description: "Mild shoulder discomfort for pressing audit.",
    },
  ],
};

function continuityFor(
  exerciseId: string,
  state:
    | "successful_current"
    | "too_easy"
    | "appropriate_challenge"
    | "repeated_failure"
    | "plateau"
    | "pain_response",
): {
  readonly continuity: ContinuityContext;
  readonly history: TrainingHistory;
} {
  const currentContinuity: ContinuityContext = {
    ...EMPTY_CONTINUITY,
    currentExerciseId: exerciseId,
  };

  switch (state) {
    case "successful_current":
      return {
        continuity: {
          ...currentContinuity,
          productiveExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-success`,
                exerciseId,
                type: "successful_completion",
                movementRole: "horizontal_pull",
                notes: "Recent successful completion.",
              },
            ],
            stableExerciseIds: [exerciseId],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            readyToProgressExerciseIds: [exerciseId],
          },
        }),
      };
    case "too_easy":
      return {
        continuity: {
          ...currentContinuity,
          productiveExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-too-easy`,
                exerciseId,
                type: "too_easy",
                movementRole: "horizontal_pull",
                notes: "Same exercise reported too easy.",
              },
            ],
            stableExerciseIds: [exerciseId],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            readyToProgressExerciseIds: [exerciseId],
          },
        }),
      };
    case "appropriate_challenge":
      return {
        continuity: {
          ...currentContinuity,
          productiveExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-appropriate`,
                exerciseId,
                type: "appropriate_challenge",
                movementRole: "horizontal_pull",
                notes: "Same exercise remains appropriately challenging.",
              },
            ],
            stableExerciseIds: [exerciseId],
            blockedExerciseIds: [],
          },
        }),
      };
    case "repeated_failure":
      return {
        continuity: {
          ...currentContinuity,
          failedProgressionExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-failure-1`,
                exerciseId,
                type: "progression_failure",
                movementRole: "horizontal_pull",
                notes: "Failed progression attempt.",
              },
              {
                id: `${exerciseId}-failure-2`,
                exerciseId,
                type: "failed_target",
                movementRole: "horizontal_pull",
                notes: "Repeated target failure.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            stalledExerciseIds: [exerciseId],
          },
        }),
      };
    case "plateau":
      return {
        continuity: {
          ...currentContinuity,
          plateauedExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-plateau`,
                exerciseId,
                type: "plateau",
                movementRole: "horizontal_pull",
                notes: "Plateau reported.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            stalledExerciseIds: [exerciseId],
          },
        }),
      };
    case "pain_response":
      return {
        continuity: {
          ...currentContinuity,
          painResponseExerciseIds: [exerciseId],
        },
        history: history({
          exerciseHistory: {
            events: [
              {
                id: `${exerciseId}-pain`,
                exerciseId,
                type: "pain_response",
                movementRole: "horizontal_pull",
                notes: "Pain response after current exercise.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
        }),
      };
  }
}

function buildScenarios(): readonly ReviewScenario[] {
  const rowExerciseId = "chest-supported-dumbbell-row";
  const continuityStates = [
    "successful_current",
    "too_easy",
    "appropriate_challenge",
    "repeated_failure",
    "plateau",
    "pain_response",
  ] as const;

  return [
    {
      id: "horizontal-pull-phase-1-no-pain",
      group: "A. Horizontal Pull",
      title: "Phase 1, no pain",
      request: makeRequest({
        id: "review-horizontal-pull-phase-1-no-pain",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: horizontalPullNeed("strength"),
      }),
    },
    {
      id: "horizontal-pull-phase-1-low-back",
      group: "A. Horizontal Pull",
      title: "Phase 1, mild low-back concern",
      request: makeRequest({
        id: "review-horizontal-pull-phase-1-low-back",
        athleteId: "beginner-dumbbells-bench",
        goal: "strength",
        phaseId: "phase_1",
        need: horizontalPullNeed("strength"),
        equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
        assessment: lowBackHingePriority,
        painAndInjury: lowBackDiscomfort,
      }),
    },
    {
      id: "horizontal-pull-phase-1-scapular",
      group: "A. Horizontal Pull",
      title: "Phase 1 + scapular-control priority",
      request: makeRequest({
        id: "review-horizontal-pull-phase-1-scapular",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: horizontalPullNeed("strength"),
        assessment: scapularPriority,
      }),
    },
    {
      id: "horizontal-pull-phase-3-healthy",
      group: "A. Horizontal Pull",
      title: "Phase 3, healthy",
      request: makeRequest({
        id: "review-horizontal-pull-phase-3-healthy",
        athleteId: "advanced-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_3",
        need: horizontalPullNeed("hypertrophy"),
        painAndInjury: NO_PAIN_OR_INJURY,
        assessment: EMPTY_ASSESSMENT,
      }),
    },
    {
      id: "horizontal-push-phase-1-beginner",
      group: "B. Horizontal Push",
      title: "Phase 1 beginner",
      request: makeRequest({
        id: "review-horizontal-push-phase-1-beginner",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: horizontalPushNeed("strength"),
        satisfiedPrerequisiteIds: ["push-up-plank-control"],
      }),
    },
    {
      id: "horizontal-push-phase-1-shoulder",
      group: "B. Horizontal Push",
      title: "Phase 1 shoulder concern",
      request: makeRequest({
        id: "review-horizontal-push-phase-1-shoulder",
        athleteId: "beginner-gym-shoulder-concern",
        goal: "pain_aware_return",
        phaseId: "phase_1",
        need: horizontalPushNeed("pain_aware_return"),
        assessment: shoulderScapularPriority,
        painAndInjury: shoulderDiscomfort,
        satisfiedPrerequisiteIds: ["push-up-plank-control"],
      }),
    },
    {
      id: "horizontal-push-phase-2",
      group: "B. Horizontal Push",
      title: "Phase 2",
      request: makeRequest({
        id: "review-horizontal-push-phase-2",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPushNeed("strength"),
        satisfiedPrerequisiteIds: ["push-up-plank-control"],
      }),
    },
    {
      id: "horizontal-push-phase-3-healthy",
      group: "B. Horizontal Push",
      title: "Phase 3 healthy",
      request: makeRequest({
        id: "review-horizontal-push-phase-3-healthy",
        athleteId: "advanced-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_3",
        need: horizontalPushNeed("hypertrophy"),
        painAndInjury: NO_PAIN_OR_INJURY,
        assessment: EMPTY_ASSESSMENT,
        satisfiedPrerequisiteIds: ["push-up-plank-control"],
      }),
    },
    {
      id: "horizontal-push-phase-3-assessment",
      group: "B. Horizontal Push",
      title: "Phase 3 + relevant trunk assessment signal",
      request: makeRequest({
        id: "review-horizontal-push-phase-3-assessment",
        athleteId: "advanced-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_3",
        need: horizontalPushNeed("hypertrophy"),
        assessment: trunkPriority,
        painAndInjury: NO_PAIN_OR_INJURY,
        satisfiedPrerequisiteIds: ["push-up-plank-control"],
      }),
    },
    {
      id: "lower-squat-phase-1",
      group: "C. Lower Body",
      title: "Phase 1 squat, healthy",
      request: makeRequest({
        id: "review-lower-squat-phase-1",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: squatNeed("strength"),
      }),
    },
    {
      id: "lower-squat-phase-1-knee",
      group: "C. Lower Body",
      title: "Phase 1 squat + knee alignment concern",
      request: makeRequest({
        id: "review-lower-squat-phase-1-knee",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: squatNeed("strength"),
        assessment: kneeAlignmentPriority,
      }),
    },
    {
      id: "lower-squat-phase-2",
      group: "C. Lower Body",
      title: "Phase 2 squat",
      request: makeRequest({
        id: "review-lower-squat-phase-2",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: squatNeed("strength"),
      }),
    },
    {
      id: "lower-squat-phase-3",
      group: "C. Lower Body",
      title: "Phase 3 squat",
      request: makeRequest({
        id: "review-lower-squat-phase-3",
        athleteId: "advanced-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_3",
        need: squatNeed("hypertrophy"),
        painAndInjury: NO_PAIN_OR_INJURY,
        assessment: EMPTY_ASSESSMENT,
      }),
    },
    {
      id: "lower-hinge-healthy",
      group: "C. Lower Body",
      title: "Hinge healthy",
      request: makeRequest({
        id: "review-lower-hinge-healthy",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: hingeNeed,
        satisfiedPrerequisiteIds: ["hinge-control"],
      }),
    },
    {
      id: "lower-hinge-low-back",
      group: "C. Lower Body",
      title: "Hinge + low-back concern",
      request: makeRequest({
        id: "review-lower-hinge-low-back",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "pain_aware_return",
        phaseId: "phase_2",
        need: hingeNeed,
        assessment: lowBackHingePriority,
        painAndInjury: lowBackDiscomfort,
        satisfiedPrerequisiteIds: ["hinge-control"],
      }),
    },
    {
      id: "lower-single-leg-hip-knee",
      group: "C. Lower Body",
      title: "Single-leg + hip/knee finding",
      request: makeRequest({
        id: "review-lower-single-leg-hip-knee",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_2",
        need: singleLegNeed,
        assessment: hipKneeSingleLegPriority,
      }),
    },
    {
      id: "activation-trunk-early",
      group: "D. Activation",
      title: "Trunk-control early phase",
      request: makeRequest({
        id: "review-activation-trunk-early",
        athleteId: "beginner-gym-no-pain",
        goal: "posture_and_movement_quality",
        phaseId: "phase_1",
        need: trunkActivationNeed,
        assessment: trunkPriority,
      }),
    },
    {
      id: "activation-trunk-later",
      group: "D. Activation",
      title: "Trunk-control later phase",
      request: makeRequest({
        id: "review-activation-trunk-later",
        athleteId: "advanced-gym-muscle-gain",
        goal: "posture_and_movement_quality",
        phaseId: "phase_3",
        need: trunkActivationNeed,
        assessment: trunkPriority,
        painAndInjury: NO_PAIN_OR_INJURY,
      }),
    },
    {
      id: "activation-scapular-priority",
      group: "D. Activation",
      title: "Scapular-control priority",
      request: makeRequest({
        id: "review-activation-scapular-priority",
        athleteId: "anchored-bands",
        goal: "posture_and_movement_quality",
        phaseId: "phase_1",
        need: scapularActivationNeed,
        equipment: ANCHORED_BANDS_EQUIPMENT,
        assessment: scapularPriority,
      }),
    },
    {
      id: "activation-trunk-irrelevant",
      group: "D. Activation",
      title: "Trunk activation with irrelevant knee signal",
      request: makeRequest({
        id: "review-activation-trunk-irrelevant",
        athleteId: "beginner-gym-no-pain",
        goal: "posture_and_movement_quality",
        phaseId: "phase_1",
        need: trunkActivationNeed,
        assessment: irrelevantKneePriority,
      }),
    },
    {
      id: "activation-scapular-irrelevant",
      group: "D. Activation",
      title: "Scapular activation with irrelevant trunk signal",
      request: makeRequest({
        id: "review-activation-scapular-irrelevant",
        athleteId: "anchored-bands",
        goal: "posture_and_movement_quality",
        phaseId: "phase_1",
        need: scapularActivationNeed,
        equipment: ANCHORED_BANDS_EQUIPMENT,
        assessment: trunkPriority,
      }),
    },
    ...continuityStates.map((state): ReviewScenario => {
      const signals = continuityFor(rowExerciseId, state);
      return {
        id: `continuity-${state}`,
        group: "E. Continuity / Progression",
        title: state.replaceAll("_", " "),
        request: makeRequest({
          id: `review-continuity-${state}`,
          athleteId: "intermediate-gym-muscle-gain",
          goal: "strength",
          phaseId: "phase_2",
          need: horizontalPullNeed("strength"),
          continuity: signals.continuity,
          history: signals.history,
        }),
      };
    }),
  ];
}

function provenanceForDemand(annotation: ExerciseDemandAnnotation | undefined): Provenance {
  if (!annotation || annotation.level === "unknown" || annotation.source === "unknown") {
    return "UNKNOWN";
  }

  if (annotation.reviewStatus === "needs_review") {
    return "NEEDS_REVIEW";
  }

  if (annotation.source === "existing_loading_profile" || annotation.source === "human_review_needed") {
    return "REASONABLE_INFERENCE";
  }

  return "CONFIDENT";
}

function provenanceForSupport(exercise: ExerciseDefinition): Provenance {
  const support = exercise.mechanics?.support;

  if (!support || support.externalSupport === "unknown" || support.bodySupport === "unknown") {
    return "UNKNOWN";
  }

  return support.reviewStatus === "accepted" ? "CONFIDENT" : "NEEDS_REVIEW";
}

function counted(
  counts: Record<Provenance, number>,
  provenance: Provenance,
  text: string,
): string {
  counts[provenance] += 1;
  return `${text} [${provenance}]`;
}

function demandCell(
  counts: Record<Provenance, number>,
  annotation: ExerciseDemandAnnotation | undefined,
): string {
  const provenance = provenanceForDemand(annotation);
  const level = annotation?.level ?? "unknown";
  const notes = annotation?.notes ? `; ${annotation.notes}` : "";

  return counted(counts, provenance, `${level}${notes}`);
}

function supportCell(
  counts: Record<Provenance, number>,
  exercise: ExerciseDefinition,
): string {
  const support = exercise.mechanics?.support;
  const provenance = provenanceForSupport(exercise);

  if (!support) {
    return counted(counts, provenance, "unknown support metadata");
  }

  return counted(
    counts,
    provenance,
    `${support.externalSupport}/${support.bodySupport}; ${support.notes}`,
  );
}

function catalogCell(
  counts: Record<Provenance, number>,
  text: string,
  hasReviewedContent = true,
): string {
  return counted(counts, hasReviewedContent ? "CONFIDENT" : "UNKNOWN", text);
}

function sectionSuitability(exercise: ExerciseDefinition): string {
  return Object.entries(exercise.sectionSuitability)
    .map(([section, suitability]) => `${section}:${suitability?.suitability}`)
    .join(", ");
}

function equipmentRequirements(exercise: ExerciseDefinition): string {
  return exercise.equipmentRequirements
    .map((requirement) => requirement.label)
    .join(", ");
}

function painRiskMetadata(exercise: ExerciseDefinition): string {
  return [
    `jointStress=${list(exercise.loading.jointStressTags)}`,
    `caution=${list(exercise.cautionStressTags)}`,
    `contraindicated=${list(exercise.contraindicatedStressTags)}`,
  ].join("; ");
}

function progressionMetadata(exercise: ExerciseDefinition): string {
  return [
    `progressions=${list(exercise.progression.progressionExerciseIds)}`,
    `regressions=${list(exercise.progression.regressionExerciseIds)}`,
    `axes=${list(exercise.progression.progressionAxes)}`,
  ].join("; ");
}

function scapularRelevant(exercise: ExerciseDefinition): boolean {
  return exercise.movementRoles.some((role) =>
    [
      "scapular_control",
      "horizontal_push",
      "horizontal_pull",
      "vertical_push",
      "vertical_pull",
    ].includes(role),
  );
}

function scapularDemandCell(
  counts: Record<Provenance, number>,
  scapular: ScapularMechanicsProfile | undefined,
  field: keyof Pick<
    ScapularMechanicsProfile,
    | "serratusContribution"
    | "upwardRotationControl"
    | "retractionDemand"
    | "externalRotationContribution"
    | "loadedScapularControl"
  >,
): string {
  return demandCell(counts, scapular?.[field]);
}

function scapularPreparationCell(
  counts: Record<Provenance, number>,
  exercise: ExerciseDefinition,
): string {
  if (!scapularRelevant(exercise)) {
    return "not relevant";
  }

  const scapular = exercise.mechanics?.scapularMechanics;
  if (!scapular || scapular.preparationSuitability === "unknown") {
    return counted(counts, "UNKNOWN", "unknown");
  }

  return counted(
    counts,
    scapular.reviewStatus === "accepted" ? "CONFIDENT" : "NEEDS_REVIEW",
    scapular.preparationSuitability,
  );
}

function buildReferenceExerciseKnowledgeReviewMarkdown(): AuditBuildResult {
  const counts: Record<Provenance, number> = {
    CONFIDENT: 0,
    REASONABLE_INFERENCE: 0,
    NEEDS_REVIEW: 0,
    UNKNOWN: 0,
  };
  const rows = REFERENCE_EXERCISES.map((exercise) => {
    const demands = exercise.mechanics?.demands;
    const scapular = exercise.mechanics?.scapularMechanics;
    const scapularFields = scapularRelevant(exercise)
      ? [
          scapularDemandCell(counts, scapular, "serratusContribution"),
          scapularDemandCell(counts, scapular, "upwardRotationControl"),
          scapularDemandCell(counts, scapular, "retractionDemand"),
          scapularDemandCell(counts, scapular, "externalRotationContribution"),
          scapularDemandCell(counts, scapular, "loadedScapularControl"),
          scapularPreparationCell(counts, exercise),
        ].join("<br>")
      : "not relevant";

    return [
      exercise.id,
      exercise.name,
      list(exercise.movementRoles),
      list(exercise.trainingRoles),
      sectionSuitability(exercise),
      list(exercise.primaryMuscles),
      list(exercise.secondaryMuscles),
      equipmentRequirements(exercise),
      supportCell(counts, exercise),
      catalogCell(counts, exercise.loading.loadability),
      catalogCell(counts, exercise.loading.loadingPotential),
      demandCell(counts, demands?.trunk_control),
      demandCell(counts, demands?.scapular_control),
      demandCell(counts, demands?.stability),
      demandCell(counts, demands?.coordination),
      demandCell(counts, demands?.range),
      demandCell(counts, demands?.joint_control),
      scapularFields,
      catalogCell(
        counts,
        painRiskMetadata(exercise),
        exercise.loading.jointStressTags.length > 0 ||
          exercise.cautionStressTags.length > 0 ||
          exercise.contraindicatedStressTags.length > 0,
      ),
      catalogCell(counts, progressionMetadata(exercise)),
    ];
  });

  const table = [
    "| Exercise ID | Name | Movement Roles | Training Roles | Section Suitability | Primary Muscles | Secondary Muscles | Equipment / Setup | Support | Loadability | Loading Potential | Trunk Control | Scapular Control | Stability | Coordination | Range | Joint Control | Scapular Mechanics | Pain / Risk Metadata | Progression Relationships |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
  ].join("\n");

  const scapularExercises = REFERENCE_EXERCISES.filter(scapularRelevant);
  const scapularGaps = scapularExercises.flatMap((exercise) => {
    const scapular = exercise.mechanics?.scapularMechanics;

    if (!scapular) {
      return [`- ${exercise.id}: missing scapularMechanics profile.`];
    }

    const gaps = [
      ["serratus contribution", scapular.serratusContribution],
      ["upward-rotation/control relevance", scapular.upwardRotationControl],
      ["retraction contribution/demand", scapular.retractionDemand],
      ["cuff/external-rotation contribution", scapular.externalRotationContribution],
      ["loaded vs preparation nature", scapular.loadedScapularControl],
    ].flatMap(([label, annotation]) => {
      const demand = annotation as ExerciseDemandAnnotation;
      return demand.reviewStatus === "needs_review" || demand.level === "unknown"
        ? [`${label}: ${demand.level} (${demand.reviewStatus})`]
        : [];
    });

    if (scapular.preparationSuitability === "unknown" || scapular.reviewStatus === "needs_review") {
      gaps.push(`preparation suitability/profile review: ${scapular.preparationSuitability} (${scapular.reviewStatus})`);
    }

    return gaps.length > 0 ? [`- ${exercise.id}: ${gaps.join("; ")}.`] : [];
  });

  const markdown = [
    "# Reference Exercise Knowledge Review",
    "",
    "Generated from `REFERENCE_EXERCISES` by `packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts`.",
    "",
    "Provenance policy:",
    "- CONFIDENT: accepted reference-catalog or normalized catalog field.",
    "- REASONABLE_INFERENCE: reused from an existing normalized field as a proxy.",
    "- NEEDS_REVIEW: non-empty annotation exists but asks for human exercise-science review.",
    "- UNKNOWN: missing, unknown, or intentionally not inferred.",
    "",
    "## Provenance Counts",
    "",
    `| CONFIDENT | REASONABLE_INFERENCE | NEEDS_REVIEW | UNKNOWN |`,
    `|---:|---:|---:|---:|`,
    `| ${counts.CONFIDENT} | ${counts.REASONABLE_INFERENCE} | ${counts.NEEDS_REVIEW} | ${counts.UNKNOWN} |`,
    "",
    "## Complete Reference Exercise Metadata Audit",
    "",
    table,
    "",
    "## SCAPULAR_METADATA_REVIEW",
    "",
    "Current metadata is enough to separate serratus wall slide, band face pull, and band row at a coarse demand-capability level. It is not yet enough to make high-confidence fine-grained distinctions across all pressing and rowing candidates without human review.",
    "",
    "Metadata gaps:",
    "",
    ...scapularGaps,
    "",
    "## Capability Provenance Result",
    "",
    "Candidate Intelligence v0 does not treat demand-capability numbers as measured athlete capacity. Capability estimates expose `estimateSource`, `contributingSources`, and `evidenceQuality`. With the current fixtures, most estimates are `phase_default` with `weak` evidence because assessment signals generally do not provide explicit severity and no direct observed training-capability measurement is consumed yet.",
    "",
    "Low-quality capability evidence limits bounded assessment/alignment influence. This keeps exact demand-capability matching from dominating when the number is mostly default-derived.",
    "",
    "## Unknown Metadata Behavior",
    "",
    "Unknown exercise mechanics are represented as `candidateDemand: null`, `candidateDemandSource.level: unknown`, and `demandCapability.match: not_applicable`. Unknown demand is neutral; it is not treated as zero demand, easy, safe, ideal, or inappropriate. Focused tests cover this with an unknown-mechanics clone of `dead-bug`.",
    "",
  ].join("\n");

  return { markdown, counts };
}

function componentsCell(candidate: RankedCandidate): string {
  return candidate.components
    .filter((component) => COMPONENT_IDS.includes(component.id))
    .map(
      (component) =>
        `${component.id}: raw ${component.rawValue.toFixed(3)}, w ${component.weight.toFixed(6)}, contrib ${component.weightedContribution.toFixed(6)}`,
    )
    .join("<br>");
}

function assessmentSemanticsCell(candidate: RankedCandidate): string {
  const traces = candidate.components.flatMap((component) => component.assessmentRelevance ?? []);

  if (traces.length === 0) {
    return "no assessment signals";
  }

  return traces
    .map((trace) => {
      const capability = trace.demandCapability.capabilityEstimate;

      return [
        `signal ${trace.signalId}`,
        `conf ${trace.confidence}`,
        `priority ${trace.priority}`,
        `severity ${trace.signalInterpretation.severity}`,
        `relevance ${trace.relevance}`,
        `demand ${formatNumber(trace.demandCapability.candidateDemand)}`,
        `capability ${formatNumber(capability.value)} (${capability.estimateSource}/${capability.evidenceQuality})`,
        `phase ${formatNumber(trace.demandCapability.phaseIntentDemand)}`,
        `match ${trace.demandCapability.match}`,
        `relationship ${trace.relationship}`,
        `bounded ${trace.boundedInfluence.toFixed(3)}`,
      ].join("; ");
    })
    .join("<br>");
}

function rankingTable(result: CandidateRankingResult): string {
  const rows = result.rankedCandidates.map((candidate) =>
    [
      candidate.rank,
      `${candidate.exercise.id} / ${candidate.exercise.name}`,
      candidate.total.toFixed(3),
      componentsCell(candidate),
      assessmentSemanticsCell(candidate),
    ],
  );

  return [
    "| Rank | Exercise | Final Total | Components: raw / weight / weightedContribution | Assessment Semantics |",
    "|---:|---|---:|---|---|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
  ].join("\n");
}

function rejectedTable(result: CandidateRankingResult): string {
  if (result.hardRejectedCandidates.length === 0) {
    return "No hard-rejected candidates.";
  }

  return [
    "| Exercise | Rejection Stage | Reason Code | Explanation |",
    "|---|---|---|---|",
    ...result.hardRejectedCandidates.map((candidate) => {
      const reasonCodes = candidate.eligibility.rejectionReasons
        .map((reason) => reason.code)
        .join(", ");
      const explanations = candidate.eligibility.rejectionReasons
        .map((reason) => `${reason.message}${reason.evidence.length > 0 ? ` (${reason.evidence.join("; ")})` : ""}`)
        .join(" / ");

      return `| ${md(`${candidate.exercise.id} / ${candidate.exercise.name}`)} | hard eligibility | ${md(reasonCodes)} | ${md(explanations)} |`;
    }),
  ].join("\n");
}

function renderScenario(scenario: ReviewScenario): string {
  const result = rankCandidateRequest(scenario.request);

  return [
    `### ${scenario.title}`,
    "",
    `Request: \`${scenario.id}\`; phase: \`${scenario.request.phase.id}\`; goal: \`${scenario.request.goal}\`; legal candidates: ${result.legalCandidateCount}.`,
    "",
    rankingTable(result),
    "",
    "**Hard Rejections**",
    "",
    rejectedTable(result),
    "",
  ].join("\n");
}

function renderPostureRegression(): string {
  const off = createPosturePhotoCandidateExperimentRequests({ assessmentEnabled: false });
  const on = createPosturePhotoCandidateExperimentRequests({ assessmentEnabled: true });
  const sections: string[] = [
    "## Real Posture Regression: Assessment OFF vs ON",
    "",
    "This reruns the preserved real-posture fixture after the semantics refactor. It is observational only; no tuning is applied.",
    "",
  ];

  off.forEach((offRequest, index) => {
    const onRequest = on[index];
    const offResult = rankCandidateRequest(offRequest);
    const onResult = rankCandidateRequest(onRequest);

    sections.push(`### ${offRequest.need.id}`);
    sections.push("");
    sections.push("#### Assessment OFF");
    sections.push("");
    sections.push(rankingTable(offResult));
    sections.push("");
    sections.push("#### Assessment ON");
    sections.push("");
    sections.push(rankingTable(onResult));
    sections.push("");
    sections.push("#### Assessment ON Hard Rejections");
    sections.push("");
    sections.push(rejectedTable(onResult));
    sections.push("");
  });

  sections.push("Regression notes:");
  sections.push("- Cross-role contamination remains blocked by hard eligibility and training-need truth.");
  sections.push("- Lower-body findings affect lower-body candidates when the requested role is lower body.");
  sections.push("- Irrelevant findings remain visible as neutral traces rather than score movers.");
  sections.push("- Trunk influence is demand/capability aware, but most capability estimates are weak/default-derived.");
  sections.push("- Assessment influence remains bounded and does not create legal candidates across roles.");
  sections.push("");

  return sections.join("\n");
}

function renderRankingReviewMarkdown(): string {
  const scenarios = buildScenarios();
  const sections: string[] = [
    "# Post-Refactor Candidate Intelligence Human Review",
    "",
    "Generated from the current refactored semantics by `packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts`.",
    "",
    "This report is observational. It does not tune weights, add exercises, compose sessions, or alter old engine/application code.",
    "",
    "## Post-Refactor Ranking Tables",
    "",
  ];
  let currentGroup = "";

  scenarios.forEach((scenario) => {
    if (scenario.group !== currentGroup) {
      currentGroup = scenario.group;
      sections.push(`## ${currentGroup}`);
      sections.push("");
    }

    sections.push(renderScenario(scenario));
  });

  sections.push(renderPostureRegression());
  sections.push("## Questionable Rankings / Modeling Gaps");
  sections.push("");
  sections.push("- Capability estimates are mostly weak phase/default estimates because signals do not yet carry explicit severity and observed capability/history is not yet consumed.");
  sections.push("- `too_easy` and `appropriate_challenge` history events are documented in the audit scenarios, but current scoring only acts on continuity buckets and progression-state arrays. This limits nuance in continuity/progression review.");
  sections.push("- Scapular candidates are differentiated coarsely, but many scapular mechanics annotations remain `NEEDS_REVIEW`, especially for pressing and rowing candidates.");
  sections.push("- Unknown metadata is now neutral and observable, but the catalog still has unknown fields that should not be promoted into production prescription without review.");
  sections.push("");
  sections.push("## Candidate Intelligence Sign-Off");
  sections.push("");
  sections.push("Classification: **NOT_READY**");
  sections.push("");
  sections.push("Reasons:");
  sections.push("- Role truth, equipment truth, pain behavior, assessment relevance, bounded influence, and unknown-metadata safety are working at the current foundation scope.");
  sections.push("- Session composition should wait for human review of reference exercise metadata, especially scapular mechanics, demand levels, and pain/risk annotations.");
  sections.push("- Observed/history-based capability evidence is not yet represented strongly enough for exact demand-capability matching to be production-level.");
  sections.push("- Continuity/progression semantics need more domain review before they drive whole-session or whole-week decisions.");
  sections.push("");

  return sections.join("\n");
}

export function writeCandidateIntelligenceReviewDocs(rootDir = process.cwd()): {
  readonly referencePath: string;
  readonly rankingPath: string;
  readonly counts: Readonly<Record<Provenance, number>>;
} {
  const docsDir = resolve(rootDir, "docs/training-engine-v2");
  const referencePath = resolve(docsDir, "REFERENCE_EXERCISE_KNOWLEDGE_REVIEW.md");
  const rankingPath = resolve(docsDir, "CANDIDATE_INTELLIGENCE_REVIEW.md");
  const referenceReview = buildReferenceExerciseKnowledgeReviewMarkdown();
  const rankingReview = renderRankingReviewMarkdown();
  const startMarker = "<!-- POST_REFACTOR_CANDIDATE_INTELLIGENCE_REVIEW_START -->";
  const endMarker = "<!-- POST_REFACTOR_CANDIDATE_INTELLIGENCE_REVIEW_END -->";
  const generatedSection = `${startMarker}\n\n${rankingReview}\n${endMarker}`;
  const existingRankingReview = existsSync(rankingPath)
    ? readFileSync(rankingPath, "utf8").trimEnd()
    : "";
  const nextRankingReview =
    existingRankingReview.includes(startMarker) && existingRankingReview.includes(endMarker)
      ? existingRankingReview.replace(
          new RegExp(`${startMarker}[\\s\\S]*${endMarker}`),
          generatedSection,
        )
      : `${existingRankingReview}\n\n${generatedSection}`.trimStart();

  mkdirSync(docsDir, { recursive: true });
  writeFileSync(referencePath, `${referenceReview.markdown}\n`);
  writeFileSync(rankingPath, `${nextRankingReview}\n`);

  return {
    referencePath,
    rankingPath,
    counts: referenceReview.counts,
  };
}

if (process.argv[1]?.endsWith("candidateIntelligenceReviewReport.ts")) {
  const result = writeCandidateIntelligenceReviewDocs();
  console.log(`Wrote ${result.referencePath}`);
  console.log(`Wrote ${result.rankingPath}`);
  console.log(JSON.stringify(result.counts));
}
