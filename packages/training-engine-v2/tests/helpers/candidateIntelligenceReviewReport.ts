import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { deriveAlignmentPriorities } from "../../src/alignment";
import { rankCandidateRequest } from "../../src/candidate/ranking/rankCandidates";
import { buildHorizontalRowSelectionTrace } from "../../src/candidate/rowSelectionKnowledge";
import { calculateAssessmentRelevanceTraces } from "../../src/candidate/scoring/assessmentRelevance";
import { signalDemandDimension } from "../../src/candidate/scoring/assessment/classifySignal";
import {
  candidateMatchesTrainingNeed,
  specificityForSignal,
} from "../../src/candidate/scoring/assessment/specificity";
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
  AssessmentFeature,
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
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
} from "../../src/data/goldenPersonas";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import {
  buildExerciseTransitionTrace,
  type ExerciseTransitionTrace,
  type TransitionValueDelta,
} from "../../src/transitionComparison";
import type {
  CandidateRankingResult,
  RankedCandidate,
} from "../../src/candidate/types";
import { createPosturePhotoCandidateExperimentRequests } from "../fixtures/posture/postureCandidateExperimentFixture";

type Provenance = "CONFIDENT" | "REASONABLE_INFERENCE" | "NEEDS_REVIEW" | "UNKNOWN";
type EquivalenceClassification =
  | "LEGITIMATELY_EQUIVALENT_AT_CURRENT_SCOPE"
  | "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT"
  | "CONTEXT_REQUIRED_TO_DIFFERENTIATE";

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
const ROW_EXERCISE_IDS = [
  "chest-supported-dumbbell-row",
  "machine-row",
  "seated-cable-row",
  "one-arm-dumbbell-row",
] as const;
const SCAPULAR_SEMANTICS_EXERCISE_IDS = [
  "serratus-wall-slide",
  "band-face-pull",
  "band-row",
  "reverse-pec-deck",
  "push-up",
  "dumbbell-bench-press",
  "machine-row",
  "seated-cable-row",
  "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row",
] as const;
const FEATURE_CONTRAST_EXERCISE_IDS = [
  "serratus-wall-slide",
  "band-face-pull",
  "reverse-pec-deck",
  "band-row",
] as const;

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

function componentValue(candidate: RankedCandidate, componentId: string): string {
  const component = candidate.components.find((entry) => entry.id === componentId);
  return component ? component.rawValue.toFixed(3) : "n/a";
}

function exactScoreSignature(candidate: RankedCandidate): string {
  return candidate.components
    .map((component) => `${component.id}:${component.rawValue.toFixed(3)}`)
    .join("|");
}

function suitabilityDetails(record: object): string {
  const entries = Object.entries(
    record as Record<string, { readonly suitability: string; readonly reason: string }>,
  );
  return entries.length > 0
    ? entries.map(([key, value]) => `${key}:${value?.suitability} (${value?.reason})`).join("; ")
    : "none";
}

function phaseSuitability(exercise: ExerciseDefinition): string {
  return THREE_PHASE_FOUNDATION
    .map((phaseEntry) => {
      const suitability = exercise.phaseSuitability[phaseEntry.id];
      return `${phaseEntry.id}:${suitability?.suitability ?? "unspecified"}`;
    })
    .join(", ");
}

function phaseSuitabilityDetails(exercise: ExerciseDefinition): string {
  return THREE_PHASE_FOUNDATION
    .map((phaseEntry) => {
      const suitability = exercise.phaseSuitability[phaseEntry.id];
      return `${phaseEntry.id}:${suitability?.suitability ?? "unspecified"}${suitability?.reason ? ` (${suitability.reason})` : ""}`;
    })
    .join("; ");
}

function referenceExerciseById(id: string): ExerciseDefinition {
  const exercise = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!exercise) {
    throw new Error(`Missing reference exercise ${id}`);
  }

  return exercise;
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

const genericScapularPriority = assessment([
  {
    id: "review-generic-scapular-control-priority",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "shoulder",
    movementRole: "scapular_control",
    description: "High-confidence generic scapular-control priority for contrast tables.",
  },
]);

function featureSpecificScapularPriority(input: {
  readonly id: string;
  readonly feature: AssessmentFeature;
  readonly description: string;
}): AssessmentState {
  return assessment([
    {
      id: input.id,
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      assessmentFeatures: [input.feature],
      description: input.description,
    },
  ]);
}

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

function provenanceForResistancePath(exercise: ExerciseDefinition): Provenance {
  const path = exercise.mechanics?.resistancePath;

  if (!path || path.resistancePath === "unknown") {
    return "UNKNOWN";
  }

  return path.reviewStatus === "accepted" ? "CONFIDENT" : "NEEDS_REVIEW";
}

function withProvenance(text: string, provenance: Provenance): string {
  return `${text} [${provenance}]`;
}

function formatDemandAnnotation(annotation: ExerciseDemandAnnotation | undefined): string {
  const provenance = provenanceForDemand(annotation);
  const level = annotation?.level ?? "unknown";
  const notes = annotation?.notes ? `; ${annotation.notes}` : "";

  return withProvenance(`${level}${notes}`, provenance);
}

function formatSupport(exercise: ExerciseDefinition): string {
  const support = exercise.mechanics?.support;
  const provenance = provenanceForSupport(exercise);

  if (!support) {
    return withProvenance("unknown support metadata", provenance);
  }

  return withProvenance(
    `${support.externalSupport}/${support.bodySupport}; ${support.notes}`,
    provenance,
  );
}

function formatResistancePath(exercise: ExerciseDefinition): string {
  const path = exercise.mechanics?.resistancePath;
  const provenance = provenanceForResistancePath(exercise);

  if (!path) {
    return withProvenance("unknown resistance/path metadata", provenance);
  }

  return withProvenance(
    [
      `path=${path.resistancePath}`,
      `trajectory=${path.trajectoryFreedom}`,
      `lineOfPull=${path.lineOfPullAdjustability}`,
      `laterality=${path.laterality}`,
      `fit=${path.fitDependency}`,
      `review=${path.reviewStatus}`,
      `notes=${path.notes}`,
      `provenance=${path.provenance.join("; ")}`,
    ].join("; "),
    provenance,
  );
}

function counted(
  counts: Record<Provenance, number>,
  provenance: Provenance,
  text: string,
): string {
  counts[provenance] += 1;
  return withProvenance(text, provenance);
}

function demandCell(
  counts: Record<Provenance, number>,
  annotation: ExerciseDemandAnnotation | undefined,
): string {
  const provenance = provenanceForDemand(annotation);

  counts[provenance] += 1;
  return formatDemandAnnotation(annotation);
}

function supportCell(
  counts: Record<Provenance, number>,
  exercise: ExerciseDefinition,
): string {
  const provenance = provenanceForSupport(exercise);
  counts[provenance] += 1;
  return formatSupport(exercise);
}

function resistancePathCell(
  counts: Record<Provenance, number>,
  exercise: ExerciseDefinition,
): string {
  const provenance = provenanceForResistancePath(exercise);
  counts[provenance] += 1;
  return formatResistancePath(exercise);
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
    `sameExerciseAxes=${list(exercise.progression.progressionAxes)}`,
    `transitions=${exercise.progression.transitionRelationships.length > 0
      ? exercise.progression.transitionRelationships
        .map((relationship) => `${relationship.direction}:${relationship.targetExerciseId}:${relationship.classification}`)
        .join(", ")
      : "none"}`,
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

function formatScapularMechanics(exercise: ExerciseDefinition): string {
  if (!scapularRelevant(exercise)) {
    return "not relevant";
  }

  const scapular = exercise.mechanics?.scapularMechanics;
  if (!scapular) {
    return withProvenance("missing scapularMechanics profile", "UNKNOWN");
  }

  return [
    `serratus=${formatDemandAnnotation(scapular.serratusContribution)}`,
    `upwardRotation=${formatDemandAnnotation(scapular.upwardRotationControl)}`,
    `retraction=${formatDemandAnnotation(scapular.retractionDemand)}`,
    `externalRotation=${formatDemandAnnotation(scapular.externalRotationContribution)}`,
    `loadedControl=${formatDemandAnnotation(scapular.loadedScapularControl)}`,
    `preparation=${withProvenance(
      scapular.preparationSuitability,
      scapular.reviewStatus === "accepted" ? "CONFIDENT" : "NEEDS_REVIEW",
    )}`,
    `notes=${scapular.notes}`,
  ].join("; ");
}

function formatMechanicsDemands(exercise: ExerciseDefinition): string {
  const demands = exercise.mechanics?.demands;

  return [
    `trunk_control=${formatDemandAnnotation(demands?.trunk_control)}`,
    `scapular_control=${formatDemandAnnotation(demands?.scapular_control)}`,
    `stability=${formatDemandAnnotation(demands?.stability)}`,
    `coordination=${formatDemandAnnotation(demands?.coordination)}`,
    `range=${formatDemandAnnotation(demands?.range)}`,
    `joint_control=${formatDemandAnnotation(demands?.joint_control)}`,
  ].join("; ");
}

function renderIndividualReferenceExerciseSections(): string {
  const sections = [
    "## Individual Exercise Audit",
    "",
    "Every `REFERENCE_EXERCISES` entry is listed below with the identity, training truth, muscle/region truth, setup/loading truth, mechanical annotations, scapular semantics where relevant, progression relationships, and risk metadata currently available to the V2 candidate engine.",
    "",
  ];

  REFERENCE_EXERCISES.forEach((exercise) => {
    sections.push(`### ${exercise.id} / ${exercise.name}`);
    sections.push("");
    sections.push(`- Identity: family=${exercise.family}; summary=${exercise.summary}`);
    sections.push(
      `- Training truth: movementRoles=${list(exercise.movementRoles)}; trainingRoles=${list(exercise.trainingRoles)}; sections=${suitabilityDetails(exercise.sectionSuitability)}; phases=${phaseSuitabilityDetails(exercise)}; prerequisites=${exercise.prerequisites.length > 0 ? exercise.prerequisites.map((entry) => `${entry.id}:${entry.type}`).join(", ") : "none"}`,
    );
    sections.push(
      `- Muscle/region truth: primary=${list(exercise.primaryMuscles)}; secondary=${list(exercise.secondaryMuscles)}; regions=${list(exercise.bodyRegions)}`,
    );
    sections.push(
      `- Setup/loading truth: equipment=${equipmentRequirements(exercise)}; optionalEquipment=${exercise.optionalEquipment.length > 0 ? exercise.optionalEquipment.map((requirement) => requirement.label).join(", ") : "none"}; support=${formatSupport(exercise)}; loadability=${exercise.loading.loadability}; loadingPotential=${exercise.loading.loadingPotential}; skill=${exercise.loading.skillDemand}; stability=${exercise.loading.stabilityDemand}; coordination=${exercise.loading.coordinationDemand}; localFatigue=${exercise.loading.localFatigue}; systemicFatigue=${exercise.loading.systemicFatigue}; axialLoading=${exercise.loading.axialLoading}`,
    );
    sections.push(`- Resistance/path mechanics: ${formatResistancePath(exercise)}`);
    sections.push(`- Mechanics: ${formatMechanicsDemands(exercise)}`);
    sections.push(`- Scapular mechanics: ${formatScapularMechanics(exercise)}`);
    sections.push(
      `- Progression/transition: sameExerciseAxes=${list(exercise.progression.progressionAxes)}; transitions=${exercise.progression.transitionRelationships.length > 0
        ? exercise.progression.transitionRelationships
          .map((relationship) => `${relationship.direction}:${relationship.targetExerciseId}:${relationship.classification}; purposes=${list(relationship.purposes)}`)
          .join(" | ")
        : "none"}`,
    );
    sections.push(
      `- Risk/coaching: ${painRiskMetadata(exercise)}; coachingFocus=${list(exercise.coachingFocus)}`,
    );
    sections.push("");
  });

  return sections.join("\n");
}

function rowPhaseAuditScenarios(): readonly ReviewScenario[] {
  return [
    {
      id: "phase-audit-horizontal-pull-phase-1",
      group: "Phase Audit",
      title: "Horizontal pull phase 1",
      request: makeRequest({
        id: "phase-audit-horizontal-pull-phase-1",
        athleteId: "beginner-gym-no-pain",
        goal: "strength",
        phaseId: "phase_1",
        need: horizontalPullNeed("strength"),
      }),
    },
    {
      id: "phase-audit-horizontal-pull-phase-2",
      group: "Phase Audit",
      title: "Horizontal pull phase 2",
      request: makeRequest({
        id: "phase-audit-horizontal-pull-phase-2",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
      }),
    },
    {
      id: "phase-audit-horizontal-pull-phase-3",
      group: "Phase Audit",
      title: "Horizontal pull phase 3",
      request: makeRequest({
        id: "phase-audit-horizontal-pull-phase-3",
        athleteId: "advanced-gym-muscle-gain",
        goal: "hypertrophy",
        phaseId: "phase_3",
        need: horizontalPullNeed("hypertrophy"),
        painAndInjury: NO_PAIN_OR_INJURY,
        assessment: EMPTY_ASSESSMENT,
      }),
    },
  ];
}

function classifyEquivalentTie(ids: readonly string[]): EquivalenceClassification {
  const sorted = [...ids].sort().join(",");

  if (sorted === "machine-row,seated-cable-row") {
    return "CONTEXT_REQUIRED_TO_DIFFERENTIATE";
  }

  return "LEGITIMATELY_EQUIVALENT_AT_CURRENT_SCOPE";
}

function renderEquivalentMetadataAudit(): string {
  const tieRows: string[] = [];

  rowPhaseAuditScenarios().forEach((scenario) => {
    const result = rankCandidateRequest(scenario.request);
    const groups = new Map<string, RankedCandidate[]>();

    result.rankedCandidates.forEach((candidate) => {
      const signature = exactScoreSignature(candidate);
      groups.set(signature, [...(groups.get(signature) ?? []), candidate]);
    });

    [...groups.values()]
      .filter((group) => group.length > 1)
      .forEach((group) => {
        const ids = group.map((candidate) => candidate.exercise.id);
        const classification = classifyEquivalentTie(ids);
        tieRows.push(
          `| ${md(scenario.title)} | ${md(ids.join(", "))} | ${classification} | Exact score-vector tie at current component precision. |`,
        );
      });
  });

  const tieTable = tieRows.length > 0
    ? [
        "| Scenario | Exercises | Classification | Evidence |",
        "|---|---|---|---|",
        ...tieRows,
      ].join("\n")
    : "No exact score-vector ties were found in the row phase audit scenarios.";

  return [
    "## Duplicate And Equivalent Metadata Audit",
    "",
    "No literal duplicate exercise definitions were found when identity, equipment labels, support notes, and progression edges are considered. The meaningful issue is scoring-relevant equivalence: different exercises can collapse to the same score vector when their current component inputs are effectively identical.",
    "",
    tieTable,
    "",
    "`machine-row` and `seated-cable-row` are the important audited pair. They now differ by resistance/path metadata as well as equipment/setup label. In the default horizontal-pull context, the scoring-relevant fields that reach ranking components can still be equivalent: role, section intent, muscle target, pain, phase, stimulus, loadability, skill, stability, fatigue, joint cost, continuity, assessment, and alignment all match. This is now classified as `CONTEXT_REQUIRED_TO_DIFFERENTIATE`: the catalog knows the exercises are mechanically distinct, but the request does not contain a legitimate machine-fit, cable-setup, path-preference, or exercise-specific history discriminator.",
    "",
  ].join("\n");
}

function scapularAuditRequest(): CandidateRequest {
  return makeRequest({
    id: "reference-knowledge-scapular-semantics-audit",
    athleteId: "intermediate-gym-muscle-gain",
    goal: "posture_and_movement_quality",
    phaseId: "phase_1",
    need: scapularActivationNeed,
    equipment: FULL_GYM_EQUIPMENT,
    assessment: scapularPriority,
  });
}

function renderScapularSemanticsTrace(): string {
  const request = scapularAuditRequest();
  const result = rankCandidateRequest(request);
  const signal = request.assessment.signals[0];
  const dimension = signalDemandDimension(signal);
  const legalById = new Map(result.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]));
  const rejectById = new Map(
    result.hardRejectedCandidates.map((candidate) => [candidate.exercise.id, candidate]),
  );
  const rows = SCAPULAR_SEMANTICS_EXERCISE_IDS.map((exerciseId) => {
    const exercise = referenceExerciseById(exerciseId);
    const candidate = legalById.get(exerciseId);
    const rejection = rejectById.get(exerciseId);
    const truthful = candidateMatchesTrainingNeed(request, exercise);
    const trace = calculateAssessmentRelevanceTraces({ request, exercise })[0];
    const specificity = specificityForSignal({ signal, exercise, request, dimension });
    const directShortCircuit =
      trace.featureMatches.length === 0 &&
      truthful &&
      Boolean(signal.movementRole) &&
      request.need.targetMovementRoles.includes(signal.movementRole as MovementRole) &&
      exercise.movementRoles.includes(signal.movementRole as MovementRole);
    const truth = truthful
      ? "truthful/legal"
      : `rejected: ${rejection?.eligibility.rejectionReasons.map((reason) => reason.code).join(", ") ?? "not legal"}`;

    return [
      exercise.id,
      dimension,
      truth,
      directShortCircuit ? "yes" : "no",
      specificity.toFixed(3),
      trace.relevance,
      trace.relevanceReasonCode,
      featureTraceCell(trace),
      taskDemandCell(trace),
      taskCapabilityCell(trace),
      trace.demandCapability.match,
      featureDevelopmentCell(trace),
      trace.relationship,
      `${trace.boundedInfluence.toFixed(3)}; assessment=${trace.assessmentContribution.toFixed(3)}; alignment=${trace.alignmentContribution.toFixed(3)}`,
      candidate ? componentValue(candidate, "assessment_fit") : "n/a",
      candidate ? componentValue(candidate, "alignment_fit") : "n/a",
    ];
  });

  const table = [
    "| Exercise | Classification | Training-Need Truth | Direct Role Short-Circuit | Specificity | Relevance | Reason Code | Feature Trace | Overall Task Demand | Task Capability | Task Match | Feature Development | Relationship | Influence Budget | Assessment Fit | Alignment Fit |",
    "|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---:|---:|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
  ].join("\n");

  return [
    "## Scapular Semantics Audit",
    "",
    "Synthetic assessment traced here: `{ movementRole: scapular_control, muscleGroup: serratus, region: shoulder, confidence: high, priority: primary }` against a Phase 1 full-gym scapular activation request.",
    "",
    table,
    "",
    "Direct movement-role matching no longer short-circuits candidate-specific scapular mechanics when a normalized scapular feature is present. A generic `scapular_control` signal can still use broad role relevance; a serratus/protraction, upward-rotation, retraction, cuff, or loaded-stability signal now has to pass candidate feature matching first.",
    "",
  ].join("\n");
}

function renderAssessmentFeatureSemanticsAudit(): string {
  return [
    "## Assessment Feature Semantics Audit",
    "",
    "| Feature Need | Current Expression | Current Consumption | Audit Finding |",
    "|---|---|---|---|",
    "| serratus / protraction | `muscleGroup: serratus`; `assessmentFeatures`; `scapularMechanics.serratusContribution` | Normalized feature matching before generic role relevance | Now consumed; current feature confidence is limited by profile-level review status. |",
    "| upward rotation | `assessmentFeatures`; `scapularMechanics.upwardRotationControl` | Explicit feature matching before generic role relevance | Now consumed when supplied explicitly. |",
    "| retraction | `assessmentFeatures`; posterior shoulder/upper-back normalized signal; `scapularMechanics.retractionDemand` | Explicit or normalized feature matching | Now consumed; rows/face pulls/reverse pec deck separate from wall-slide mechanics. |",
    "| external rotation / cuff | `muscleGroup: rotator_cuff`; `assessmentFeatures`; `scapularMechanics.externalRotationContribution` | Explicit or normalized feature matching | Now consumed without inferring cuff from shoulder region alone. |",
    "| scapular stability under load | `assessmentFeatures`; `scapularMechanics.loadedScapularControl`; generic `demands.scapular_control` | Explicit feature matching as emphasis; generic demand remains overall task context | Now distinguishes loaded scapular stability from low-load preparation without treating the emphasis field as a validated feature challenge scale. |",
    "",
    "Recommendation: keep the normalized feature layer narrow and continue reviewing profile-level `needs_review` metadata before Session Composer relies on feature-specific scapular selection.",
    "",
  ].join("\n");
}

function renderPhaseAudit(): string {
  const allPhaseRows = REFERENCE_EXERCISES.map((exercise) =>
    `| ${md(exercise.id)} | ${md(phaseSuitability(exercise))} | ${md(phaseSuitabilityDetails(exercise))} |`,
  );
  const rowRankingRows = rowPhaseAuditScenarios().flatMap((scenario) => {
    const result = rankCandidateRequest(scenario.request);
    return result.rankedCandidates
      .filter((candidate) => ROW_EXERCISE_IDS.some((id) => id === candidate.exercise.id))
      .map((candidate) =>
        [
          scenario.request.phase.id,
          candidate.rank,
          candidate.exercise.id,
          candidate.total.toFixed(3),
          componentValue(candidate, "phase_fit"),
          componentValue(candidate, "progression_value"),
          componentValue(candidate, "equipment_practicality"),
          componentValue(candidate, "session_intent_fit"),
          componentValue(candidate, "skill_fit"),
          componentValue(candidate, "stability_fit"),
          componentValue(candidate, "assessment_fit"),
          componentValue(candidate, "alignment_fit"),
        ],
      );
  });
  const allPhaseTable = [
    "| Exercise | Phase Summary | Phase Reasons |",
    "|---|---|---|",
    ...allPhaseRows,
  ].join("\n");
  const rowRankingTable = [
    "| Phase | Rank | Row Exercise | Total | Phase Fit | Progression | Equipment | Session Intent | Skill | Stability | Assessment | Alignment |",
    "|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rowRankingRows.map((row) => `| ${row.map(md).join(" | ")} |`),
  ].join("\n");

  return [
    "## Phase Suitability Audit",
    "",
    allPhaseTable,
    "",
    "### Horizontal Row Phase Ordering",
    "",
    rowRankingTable,
    "",
    "Observed row ordering is explainable from current component math, not from a hidden calibration change. Phase 1 favors `chest-supported-dumbbell-row` because it keeps the supported-row skill/stability profile while receiving a stronger progression-value score than `machine-row`/`seated-cable-row`; `one-arm-dumbbell-row` remains behind because its phase, session-intent, skill, and stability scores are lower for a beginner/Phase 1 request. Phase 2 makes `machine-row` and `seated-cable-row` effectively equal and narrowly ahead of `chest-supported-dumbbell-row` because the current component inputs are almost identical and equipment practicality slightly favors machine/cable availability. Phase 3 returns `chest-supported-dumbbell-row` above machine/cable rows in the current review scenario because the catalog treats it as a later-phase, loadable supported dumbbell progression while `one-arm-dumbbell-row` is still penalized by higher unilateral stability/trunk demands.",
    "",
  ].join("\n");
}

function formatDelta(delta: TransitionValueDelta): string {
  return `${delta.source}->${delta.target} (${delta.delta})`;
}

function formatFeatureChanges(trace: ExerciseTransitionTrace): string {
  const changed = trace.structuralDelta.assessmentFeatures.filter(
    (feature) => feature.delta !== "same",
  );

  return changed.length > 0
    ? changed
      .map((feature) => `${feature.feature}:${feature.source}->${feature.target} (${feature.delta})`)
      .join("<br>")
    : "none modeled";
}

function formatPurposeEvidence(trace: ExerciseTransitionTrace): string {
  return trace.purposeEvidence
    .map((finding) => `${finding.purpose}: ${finding.status}<br>${finding.evidence}`)
    .join("<br>");
}

function transitionTraceRows(): readonly ExerciseTransitionTrace[] {
  const byId = new Map(REFERENCE_EXERCISES.map((exercise) => [exercise.id, exercise]));

  return REFERENCE_EXERCISES.flatMap((source) =>
    source.progression.transitionRelationships.flatMap((relationship) => {
      const target = byId.get(relationship.targetExerciseId);

      if (!target) {
        return [];
      }

      return [
        buildExerciseTransitionTrace({
          source,
          target,
          relationship,
        }),
      ];
    }),
  );
}

function renderProgressionGraphAudit(): string {
  const rows = transitionTraceRows();
  const purposeEvidence = rows.flatMap((row) => row.purposeEvidence);
  const classificationCounts = rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.classification] = (counts[row.classification] ?? 0) + 1;
    return counts;
  }, {});
  const purposeStatusCounts = purposeEvidence.reduce<Record<string, number>>((counts, finding) => {
    counts[finding.status] = (counts[finding.status] ?? 0) + 1;
    return counts;
  }, {});

  return [
    "## Structured Exercise Transition Audit",
    "",
    "Same-exercise progression now lives in `progressionAxes`. Cross-exercise replacements live in `transitionRelationships` and have no automatic selection effect at Candidate Intelligence stage.",
    "",
    `Transition count: ${rows.length}. Classification counts: ${Object.entries(classificationCounts)
      .map(([classification, count]) => `${classification}=${count}`)
      .join(", ")}.`,
    "",
    `Purpose evidence: total=${purposeEvidence.length}; structurally_confirmed=${purposeStatusCounts.structurally_confirmed ?? 0}; contextual_intent=${purposeStatusCounts.contextual_intent ?? 0}; unknown_metadata=${purposeStatusCounts.unknown_metadata ?? 0}; contradicted=${purposeStatusCounts.contradicted ?? 0}.`,
    "",
    "Direct structural purposes use only normalized mechanics deltas. Contextual programming and multidimensional support purposes retain review provenance without becoming structural confirmation. Unknown mechanics remain explicit.",
    "",
    "| Source | Target | Direction | Classification | Purposes | Purpose Evidence | Shared Roles | Changed Roles | Support Change | Resistance/Path Change | Demand Deltas | Loadability Delta | Equipment Change | Feature Change | Review | Automatic Selection Effect | Notes |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map((row) => {
      const delta = row.structuralDelta;
      return `| ${md(row.sourceExerciseId)} | ${md(row.targetExerciseId)} | ${row.direction} | ${row.classification} | ${list(row.purposes)} | ${formatPurposeEvidence(row)} | ${list(delta.sharedMovementRoles)} | sourceOnly=${list(delta.sourceOnlyMovementRoles)}<br>targetOnly=${list(delta.targetOnlyMovementRoles)} | external=${formatDelta(delta.support.externalSupport)}<br>body=${formatDelta(delta.support.bodySupport)} | path=${formatDelta(delta.resistancePath.resistancePath)}<br>trajectory=${formatDelta(delta.resistancePath.trajectoryFreedom)}<br>line=${formatDelta(delta.resistancePath.lineOfPullAdjustability)}<br>laterality=${formatDelta(delta.resistancePath.laterality)}<br>fit=${formatDelta(delta.resistancePath.fitDependency)} | trunk=${formatDelta(delta.demand.trunk)}<br>stability=${formatDelta(delta.demand.stability)}<br>coordination=${formatDelta(delta.demand.coordination)} | ${formatDelta(delta.loading.loadability)} | shared=${list(delta.equipment.shared)}<br>sourceOnly=${list(delta.equipment.sourceOnly)}<br>targetOnly=${list(delta.equipment.targetOnly)} | ${formatFeatureChanges(row)} | ${row.reviewStatus}; provenance=${list(row.provenance)} | ${row.automaticSelectionEffect} | ${md(row.notes)} |`;
    }),
    "",
    "Key reviewed relationships: `band-face-pull -> serratus-wall-slide` is a context-dependent lateral feature/equipment transition; both `reverse-pec-deck <-> band-face-pull` directions remain questionable; `pallof-press -> dead-bug` remains needs-review; `machine-row`/`seated-cable-row -> chest-supported-dumbbell-row` remain context-dependent row transitions, not universal progressions.",
    "",
  ].join("\n");
}

function renderStrongDecisionReview(): string {
  return [
    "## Strong Decisions From Weak Or Coarse Metadata",
    "",
    "- `machine-row` and `seated-cable-row` can tie exactly because current scoring components do not consume resistance-path preference without request evidence. The catalog now exposes them as mechanically distinct rather than knowledge-equivalent.",
    "- Generic `scapular_control` movement-role matching can still assign broad relevance when the signal has no feature-specific evidence. Feature-specific scapular findings now use candidate scapular mechanics before relevance is established.",
    "- Unknown mechanics are neutral rather than favorable, but unknown support/demand metadata remains broad for several accessory exercises. Those exercises should not receive production-level prescription confidence until reviewed.",
    "",
  ].join("\n");
}

function renderKnowledgeGapAudit(): string {
  const unknownSupport = REFERENCE_EXERCISES
    .filter((exercise) => provenanceForSupport(exercise) === "UNKNOWN")
    .map((exercise) => exercise.id);
  const unknownScapular = REFERENCE_EXERCISES
    .filter((exercise) => scapularRelevant(exercise) && !exercise.mechanics?.scapularMechanics)
    .map((exercise) => exercise.id);
  const missingResistancePath = REFERENCE_EXERCISES
    .filter((exercise) => !exercise.mechanics?.resistancePath)
    .map((exercise) => exercise.id);

  return [
    "## Unknown And Missing Knowledge Gaps",
    "",
    "P0 gaps:",
    "- Review and harden normalized scapular feature semantics before relying on scapular findings for session composition: serratus/protraction, upward rotation, retraction, external rotation/cuff, and loaded scapular stability now match explicitly, but profile-level review remains incomplete.",
    "- Keep direct movement-role relevance generic-only so `scapular_control` does not bypass candidate-specific mechanics when a signal is feature-specific.",
    "- Row resistance/path knowledge now distinguishes the four primary row variants, but machine fit, cable attachment, pulley geometry, and self-selected path preferences still require explicit request/history context before they should break ties.",
    "",
    "P1 gaps:",
    `- Unknown support metadata: ${list(unknownSupport)}.`,
    `- Missing scapular mechanics profiles for scapular-relevant upper-body exercises: ${list(unknownScapular)}.`,
    `- Missing resistance/path profiles outside the targeted row set: ${list(missingResistancePath)}.`,
    "- Transition relationships are now separated from same-exercise progression axes; whole-session or multi-week composition still must not treat them as automatic replacement commands.",
    "- Add human-reviewed phase suitability rationale where phase ordering is intended to express development rather than convenience.",
    "",
    "P2 gaps:",
    "- Extend resistance/path profiles beyond the targeted row set only when a real selection question needs them.",
    "- Add dosage and intent context for whether an exercise is being selected as preparation, motor-control exposure, hypertrophy accessory, or main strength work.",
    "- Add side/limb specificity and posture-photo feature mapping before asymmetric findings drive unilateral selections.",
    "",
  ].join("\n");
}

function renderReadinessClassification(): string {
  return [
    "## Readiness Classification",
    "",
    "Classification: **READY_FOR_TARGETED_FIXES**",
    "",
    "Rationale: the current V2 candidate engine is deterministic, observable, and safe enough for targeted semantics fixes. Feature-specific scapular consumption is now implemented at Candidate Intelligence scope, but it is still not ready for Session Composer because row equivalence gaps, phase suitability calibration, and transition/readiness policy remain unresolved.",
    "",
  ].join("\n");
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
      exercise.family,
      exercise.summary,
      list(exercise.movementRoles),
      list(exercise.trainingRoles),
      sectionSuitability(exercise),
      phaseSuitability(exercise),
      list(exercise.primaryMuscles),
      list(exercise.secondaryMuscles),
      list(exercise.bodyRegions),
      equipmentRequirements(exercise),
      supportCell(counts, exercise),
      resistancePathCell(counts, exercise),
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
    "| Exercise ID | Name | Family | Summary | Movement Roles | Training Roles | Section Suitability | Phase Suitability | Primary Muscles | Secondary Muscles | Body Regions | Equipment / Setup | Support | Resistance Path | Loadability | Loading Potential | Trunk Control | Scapular Control | Stability | Coordination | Range | Joint Control | Scapular Mechanics | Pain / Risk Metadata | Progression Relationships |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
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
    "Scope: audit/report only. This generation does not tune ranking weights, change exercise-science calibration, add Session Composer behavior, or alter engine behavior.",
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
    renderIndividualReferenceExerciseSections(),
    renderStrongDecisionReview(),
    renderEquivalentMetadataAudit(),
    renderScapularSemanticsTrace(),
    renderAssessmentFeatureSemanticsAudit(),
    renderPhaseAudit(),
    renderProgressionGraphAudit(),
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
    "Candidate Intelligence v0 does not treat demand-capability numbers as measured athlete capacity. Capability estimates expose `estimateSource`, `contributingSources`, and `evidenceQuality`. Movement-role-matched training history can contribute `history_inferred` evidence, but direct observed training-capability measurement is not consumed yet.",
    "",
    "Low-quality capability evidence limits bounded assessment/alignment influence. This keeps exact demand-capability matching from dominating when the number is mostly default-derived.",
    "",
    "## Unknown Metadata Behavior",
    "",
    "Unknown exercise mechanics are represented as `candidateDemand: null`, `candidateDemandSource.level: unknown`, and `demandCapability.match: not_applicable`. Unknown demand is neutral; it is not treated as zero demand, easy, safe, ideal, or inappropriate. Focused tests cover this with an unknown-mechanics clone of `dead-bug`.",
    "",
    renderKnowledgeGapAudit(),
    renderReadinessClassification(),
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
      const features = trace.featureMatches.length === 0
        ? "generic"
        : trace.featureMatches
            .map(
              (feature) =>
                `${feature.assessmentFeature}/${feature.assessmentFeatureSource}/${feature.candidateFeatureLevel}/${feature.candidateFeatureReviewStatus}/${feature.featureMatch}`,
            )
            .join(", ");

      return [
        `signal ${trace.signalId}`,
        `feature ${features}`,
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

function featureReviewRequest(id: string, assessmentState: AssessmentState): CandidateRequest {
  return makeRequest({
    id,
    athleteId: "intermediate-gym-muscle-gain",
    goal: "posture_and_movement_quality",
    phaseId: "phase_1",
    need: scapularActivationNeed,
    equipment: FULL_GYM_EQUIPMENT,
    assessment: assessmentState,
  });
}

function featureTraceCell(trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number]): string {
  if (trace.featureDevelopment.length === 0) {
    return "generic; source=unknown; emphasis=not_applicable; review=not_applicable; match=none; challenge=not_applicable";
  }

  return trace.featureDevelopment
    .map((development, index) => {
      const feature = trace.featureMatches[index];

      return [
        development.assessmentFeature,
        `source=${feature?.assessmentFeatureSource ?? "unknown"}`,
        `emphasis=${development.featureEmphasisLevel}/${development.featureEmphasisSource}`,
        `candidate=${feature?.candidateFeature ?? "unknown"}`,
        `review=${development.featureReviewStatus}`,
        `match=${development.featureMatch}`,
        `challenge=${formatNumber(development.featureChallengeDemand)}/${development.featureChallengeDemandSource}`,
        `featureCapabilityPrior=${formatNumber(development.featureCapabilityEstimate)}/${development.featureCapabilityPriorSource}`,
        `featureCapabilityEvidence=${development.featureCapabilitySource}/${development.featureCapabilityEvidenceQuality}`,
        `featureSpecificEvidence=${development.featureSpecificEvidenceSources.join(",") || "none"}`,
        `featureHistory=${development.featureSpecificHistorySupport}`,
        `featureDemandCapability=${development.featureDemandCapabilityMatch}`,
      ].join("; ");
    })
    .join("<br>");
}

function taskDemandCell(trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number]): string {
  return [
    formatNumber(trace.demandCapability.candidateDemand),
    trace.demandCapability.candidateDemandSource.level,
    trace.demandCapability.candidateDemandSource.source,
    trace.demandCapability.candidateDemandSource.reviewStatus,
  ].join("/");
}

function taskCapabilityCell(trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number]): string {
  return [
    formatNumber(trace.demandCapability.currentCapability),
    trace.demandCapability.capabilityEstimate.estimateSource,
    trace.demandCapability.capabilityEstimate.evidenceQuality,
  ].join("/");
}

function featureDevelopmentCell(trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number]): string {
  if (trace.featureDevelopment.length === 0) {
    return "not_applicable";
  }

  return trace.featureDevelopment
    .map((development) =>
      [
        `challenge=${formatNumber(development.featureChallengeDemand)}/${development.featureChallengeDemandSource}`,
        `prior=${formatNumber(development.featureCapabilityEstimate)}/${development.featureCapabilityPriorSource}`,
        `evidence=${development.featureCapabilitySource}/${development.featureCapabilityEvidenceQuality}`,
        `specificEvidence=${development.featureSpecificEvidenceSources.join(",") || "none"}`,
        `history=${development.featureSpecificHistorySupport}`,
        `match=${development.featureDemandCapabilityMatch}`,
      ].join("; "),
    )
    .join("<br>");
}

function renderFeatureContrastTable(input: {
  readonly title: string;
  readonly requestId: string;
  readonly assessmentState: AssessmentState;
}): string {
  const request = featureReviewRequest(input.requestId, input.assessmentState);
  const result = rankCandidateRequest(request);
  const rankedById = new Map(result.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]));
  const rejectedById = new Map(
    result.hardRejectedCandidates.map((candidate) => [candidate.exercise.id, candidate]),
  );
  const rows = FEATURE_CONTRAST_EXERCISE_IDS.map((exerciseId) => {
    const exercise = referenceExerciseById(exerciseId);
    const candidate = rankedById.get(exerciseId);
    const rejection = rejectedById.get(exerciseId);
    const trace = calculateAssessmentRelevanceTraces({ request, exercise })[0];

    return [
      exerciseId,
      candidate ? String(candidate.rank) : "rejected",
      candidate ? candidate.total.toFixed(3) : "n/a",
      rejection
        ? rejection.eligibility.rejectionReasons.map((reason) => reason.code).join(", ")
        : "legal",
      trace.relevance,
      trace.relationship,
      featureTraceCell(trace),
      taskDemandCell(trace),
      taskCapabilityCell(trace),
      trace.demandCapability.match,
      featureDevelopmentCell(trace),
      trace.boundedInfluence.toFixed(3),
      trace.assessmentContribution.toFixed(3),
      trace.alignmentContribution.toFixed(3),
    ];
  });

  return [
    `### ${input.title}`,
    "",
    "| Exercise | Rank | Total | Truth | Relevance | Relationship | Feature Trace | Overall Task Demand | Task Capability | Task Match | Feature Development | Bounded | Assessment | Alignment |",
    "|---|---:|---:|---|---|---|---|---|---|---|---|---:|---:|---:|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
    "",
  ].join("\n");
}

function renderFeatureSpecificScapularAssessmentReview(): string {
  return [
    "## Feature-Specific Scapular Assessment Review",
    "",
    "This section reruns Phase 1 / Scapular Activation / full-gym contrast requests. It is observational and uses the feature-specific scapular semantics added after the reference knowledge audit.",
    "",
    renderFeatureContrastTable({
      title: "Generic Scapular Control",
      requestId: "feature-review-generic-scapular",
      assessmentState: genericScapularPriority,
    }),
    renderFeatureContrastTable({
      title: "Serratus / Protraction Control",
      requestId: "feature-review-serratus-protraction",
      assessmentState: scapularPriority,
    }),
    renderFeatureContrastTable({
      title: "Upward Rotation Control",
      requestId: "feature-review-upward-rotation",
      assessmentState: featureSpecificScapularPriority({
        id: "review-upward-rotation-control",
        feature: "upward_rotation_control",
        description: "High-confidence upward-rotation scapular-control priority.",
      }),
    }),
    renderFeatureContrastTable({
      title: "Retraction Control",
      requestId: "feature-review-retraction",
      assessmentState: featureSpecificScapularPriority({
        id: "review-retraction-control",
        feature: "retraction_control",
        description: "High-confidence retraction scapular-control priority.",
      }),
    }),
    renderFeatureContrastTable({
      title: "External Rotation / Cuff Control",
      requestId: "feature-review-cuff",
      assessmentState: featureSpecificScapularPriority({
        id: "review-external-rotation-cuff-control",
        feature: "external_rotation_or_cuff_control",
        description: "High-confidence external-rotation/cuff scapular-control priority.",
      }),
    }),
    renderFeatureContrastTable({
      title: "Loaded Scapular Stability",
      requestId: "feature-review-loaded-stability",
      assessmentState: featureSpecificScapularPriority({
        id: "review-loaded-scapular-stability",
        feature: "loaded_scapular_stability",
        description: "High-confidence loaded scapular-stability priority.",
      }),
    }),
    "Review notes:",
    "- Generic `scapular_control` keeps broad movement-role relevance when no feature evidence is present.",
    "- Serratus/protraction and upward-rotation findings distinguish `serratus-wall-slide` from candidates explicitly modeled with low serratus/upward-rotation contribution.",
    "- Retraction and cuff findings shift relevance toward face-pull/row/reverse-pec-deck metadata instead of the wall-slide shortcut.",
    "- Loaded-stability findings no longer treat low-load preparation and loaded scapular work as identical.",
    "- Most current scapular profiles still carry profile-level `needs_review`, so feature traces should be treated as transparent working metadata, not final exercise-science certainty.",
    "",
  ].join("\n");
}

function legacyFeatureDemandCell(
  trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number],
): string {
  if (trace.featureDevelopment.length === 0) {
    return "Generic signal: broad movement-role relevance uses overall task demand directly.";
  }

  const development = trace.featureDevelopment[0];

  return [
    `Legacy interpretation treated ${trace.demandCapability.dimension} task demand ${formatNumber(trace.demandCapability.candidateDemand)} as the target ${development.assessmentFeature} demand`,
    `task match=${trace.demandCapability.match}`,
    "feature challenge was not separated",
  ].join("; ");
}

function currentFeatureDemandCell(
  trace: ReturnType<typeof calculateAssessmentRelevanceTraces>[number],
): string {
  if (trace.featureDevelopment.length === 0) {
    return "No normalized feature: generic task semantics remain in force.";
  }

  const development = trace.featureDevelopment[0];

  return [
    `emphasis=${development.featureEmphasisLevel}/${development.featureEmphasisSource}`,
    `overallTaskDemand=${formatNumber(development.overallTaskDemand)}/${development.overallTaskDemandSource.level}`,
    `featureChallenge=${formatNumber(development.featureChallengeDemand)}/${development.featureChallengeDemandSource}`,
    `featureCapabilityPrior=${formatNumber(development.featureCapabilityEstimate)}/${development.featureCapabilityPriorSource}`,
    `featureCapabilityEvidence=${development.featureCapabilitySource}/${development.featureCapabilityEvidenceQuality}`,
    `featureSpecificEvidence=${development.featureSpecificEvidenceSources.join(",") || "none"}`,
    `featureHistory=${development.featureSpecificHistorySupport}`,
    `featureDemandCapability=${development.featureDemandCapabilityMatch}`,
  ].join("; ");
}

function renderFeatureDemandSeparationTable(input: {
  readonly title: string;
  readonly requestId: string;
  readonly assessmentState: AssessmentState;
}): string {
  const request = featureReviewRequest(input.requestId, input.assessmentState);
  const result = rankCandidateRequest(request);
  const rankedById = new Map(result.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]));
  const rows = FEATURE_CONTRAST_EXERCISE_IDS.map((exerciseId) => {
    const trace = calculateAssessmentRelevanceTraces({
      request,
      exercise: referenceExerciseById(exerciseId),
    })[0];
    const candidate = rankedById.get(exerciseId);

    return [
      exerciseId,
      candidate ? String(candidate.rank) : "rejected",
      candidate ? candidate.total.toFixed(3) : "n/a",
      trace.relevance,
      featureTraceCell(trace),
      legacyFeatureDemandCell(trace),
      currentFeatureDemandCell(trace),
      trace.relationship,
      trace.boundedInfluence.toFixed(3),
    ];
  });

  return [
    `### ${input.title}`,
    "",
    "| Exercise | Rank | Total | Relevance | Feature Trace | Before Trace Semantics | After Trace Semantics | Relationship | Bounded |",
    "|---|---:|---:|---|---|---|---|---|---:|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
    "",
  ].join("\n");
}

function renderFeatureEmphasisVsCapabilityDemandReview(): string {
  return [
    "# Feature Emphasis vs Capability Demand Review",
    "",
    "This section reruns the same Phase 1 / Scapular Activation / full-gym feature contrasts after separating feature expression from task demand and feature challenge. The `Before Trace Semantics` column describes the legacy interpretation now avoided: overall scapular task demand could be read as target-feature demand. The `After Trace Semantics` column is generated from the current trace contract.",
    "",
    renderFeatureDemandSeparationTable({
      title: "Serratus / Protraction Control",
      requestId: "feature-demand-review-serratus-protraction",
      assessmentState: scapularPriority,
    }),
    renderFeatureDemandSeparationTable({
      title: "Upward Rotation Control",
      requestId: "feature-demand-review-upward-rotation",
      assessmentState: featureSpecificScapularPriority({
        id: "demand-review-upward-rotation-control",
        feature: "upward_rotation_control",
        description: "High-confidence upward-rotation scapular-control priority.",
      }),
    }),
    renderFeatureDemandSeparationTable({
      title: "Retraction Control",
      requestId: "feature-demand-review-retraction",
      assessmentState: featureSpecificScapularPriority({
        id: "demand-review-retraction-control",
        feature: "retraction_control",
        description: "High-confidence retraction scapular-control priority.",
      }),
    }),
    renderFeatureDemandSeparationTable({
      title: "External Rotation / Cuff Control",
      requestId: "feature-demand-review-cuff",
      assessmentState: featureSpecificScapularPriority({
        id: "demand-review-external-rotation-cuff-control",
        feature: "external_rotation_or_cuff_control",
        description: "High-confidence external-rotation/cuff scapular-control priority.",
      }),
    }),
    renderFeatureDemandSeparationTable({
      title: "Loaded Scapular Stability",
      requestId: "feature-demand-review-loaded-stability",
      assessmentState: featureSpecificScapularPriority({
        id: "demand-review-loaded-scapular-stability",
        feature: "loaded_scapular_stability",
        description: "High-confidence loaded scapular-stability priority.",
      }),
    }),
    "Review notes:",
    "- Existing `scapularMechanics` fields are consumed as feature emphasis/expression metadata.",
    "- Overall `mechanics.demands.scapular_control` remains visible as task demand, not target-feature challenge.",
    "- Feature challenge demand is currently `unknown/not_modeled`, so feature demand/capability match is `not_applicable` and feature-specific bounded influence is zero.",
    "- Feature-specific severity affects the feature capability estimate, while overall task capability stays a weak/default programming prior unless direct or relevant history evidence exists.",
    "- Low feature expression is labeled `low_expression`, not conflict.",
    "",
  ].join("\n");
}

function withGenericScapularHistory(request: CandidateRequest, exerciseId: string): CandidateRequest {
  return {
    ...request,
    evaluationContext: {
      asOf: "2026-08-10T00:00:00.000Z",
    },
    history: history({
      exerciseHistory: {
        events: [
          {
            id: `${request.id}-generic-scapular-history`,
            exerciseId,
            type: "too_easy",
            occurredAt: "2026-08-07T00:00:00.000Z",
            movementRole: "scapular_control",
            notes: "Generic scapular-control history without normalized assessment-feature tags.",
          },
        ],
        stableExerciseIds: [],
        blockedExerciseIds: [],
      },
      progressionState: {
        ...EMPTY_TRAINING_HISTORY.progressionState,
        successfulMovementRoles: ["scapular_control"],
      },
    }),
  };
}

function featureCapabilityProvenanceRow(input: {
  readonly label: string;
  readonly request: CandidateRequest;
  readonly exerciseId: string;
}): readonly string[] {
  const trace = calculateAssessmentRelevanceTraces({
    request: input.request,
    exercise: referenceExerciseById(input.exerciseId),
  })[0];
  const feature = trace.featureDevelopment[0];

  return [
    input.label,
    input.exerciseId,
    trace.relevance,
    taskCapabilityCell(trace),
    feature
      ? [
          formatNumber(feature.featureCapabilityEstimate),
          feature.featureCapabilitySource,
          feature.featureCapabilityEvidenceQuality,
          feature.featureCapabilityPriorSource,
        ].join("/")
      : "not_applicable",
    feature?.featureSpecificEvidenceSources.join(",") || "none",
    feature?.featureSpecificHistorySupport ?? "not_applicable",
    feature?.featureDemandCapabilityMatch ?? "not_applicable",
    trace.boundedInfluence.toFixed(3),
  ];
}

function renderFeatureCapabilityProvenanceReview(): string {
  const retractionRequest = withGenericScapularHistory(
    featureReviewRequest(
      "feature-capability-provenance-retraction-history",
      featureSpecificScapularPriority({
        id: "provenance-retraction-control",
        feature: "retraction_control",
        description: "High-confidence retraction scapular-control priority.",
      }),
    ),
    "serratus-wall-slide",
  );
  const serratusRequest = withGenericScapularHistory(
    featureReviewRequest("feature-capability-provenance-serratus-history", scapularPriority),
    "band-face-pull",
  );
  const severityRequest = featureReviewRequest(
    "feature-capability-provenance-serratus-severity",
    assessment([
      {
        ...scapularPriority.signals[0],
        id: "provenance-serratus-moderate-severity",
        severity: "moderate",
      },
    ]),
  );
  const rows = [
    featureCapabilityProvenanceRow({
      label: "Retraction assessment + generic scapular history",
      request: retractionRequest,
      exerciseId: "band-face-pull",
    }),
    featureCapabilityProvenanceRow({
      label: "Serratus assessment + generic retraction/scapular history",
      request: serratusRequest,
      exerciseId: "serratus-wall-slide",
    }),
    featureCapabilityProvenanceRow({
      label: "Serratus assessment + explicit feature severity",
      request: severityRequest,
      exerciseId: "serratus-wall-slide",
    }),
  ];

  return [
    "# Feature Capability Provenance Review",
    "",
    "Overall task capability and feature capability now have separate provenance. Generic `scapular_control` history may still contribute to overall task capability, but it is not feature-specific evidence because `ExerciseHistoryEvent` currently carries only `movementRole`, not normalized assessment features.",
    "",
    "| Scenario | Exercise | Relevance | Overall Task Capability | Feature Capability Prior/Evidence | Feature-Specific Evidence | Feature History Support | Feature Match | Bounded |",
    "|---|---|---|---|---|---|---|---|---:|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
    "",
    "Current limitation: feature capability is a weak phase/experience prior unless the assessment signal supplies feature-specific severity. Future feature-aware history needs explicit normalized feature evidence at the history boundary before it can support retraction, serratus/protraction, upward-rotation, cuff, or loaded-scapular-stability capability.",
    "",
  ].join("\n");
}

function withoutRowMachine(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    machines: {
      availableMachineIds: equipment.machines.availableMachineIds.filter(
        (machineId) => machineId !== "row",
      ),
    },
  };
}

function withoutCable(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    cables: {
      available: false,
      adjustableHeight: false,
      availableHeights: [],
    },
  };
}

function rowContinuityRequest(): CandidateRequest {
  return makeRequest({
    id: "horizontal-row-review-machine-continuity",
    athleteId: "intermediate-gym-muscle-gain",
    goal: "strength",
    phaseId: "phase_2",
    need: horizontalPullNeed("strength"),
    equipment: FULL_GYM_EQUIPMENT,
    continuity: {
      ...EMPTY_CONTINUITY,
      currentExerciseId: "machine-row",
      productiveExerciseIds: ["machine-row"],
    },
    history: history({
      exerciseHistory: {
        events: [
          {
            id: "machine-row-productive-history",
            exerciseId: "machine-row",
            type: "appropriate_challenge",
            occurredAt: "2026-08-07T00:00:00.000Z",
            movementRole: "horizontal_pull",
            notes: "Machine row was productive and appropriately challenging.",
          },
        ],
        stableExerciseIds: ["machine-row"],
        blockedExerciseIds: [],
      },
      progressionState: {
        ...EMPTY_TRAINING_HISTORY.progressionState,
        readyToProgressExerciseIds: ["machine-row"],
      },
    }),
  });
}

function horizontalRowSelectionScenarios(): readonly ReviewScenario[] {
  return [
    {
      id: "horizontal-row-neutral-full-gym",
      group: "Horizontal Row Selection",
      title: "Neutral Full Gym",
      request: makeRequest({
        id: "horizontal-row-review-neutral-full-gym",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: FULL_GYM_EQUIPMENT,
        assessment: EMPTY_ASSESSMENT,
        painAndInjury: NO_PAIN_OR_INJURY,
      }),
    },
    {
      id: "horizontal-row-low-back",
      group: "Horizontal Row Selection",
      title: "Low-Back Concern",
      request: makeRequest({
        id: "horizontal-row-review-low-back",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: FULL_GYM_EQUIPMENT,
        assessment: lowBackHingePriority,
        painAndInjury: lowBackDiscomfort,
      }),
    },
    {
      id: "horizontal-row-no-bench",
      group: "Horizontal Row Selection",
      title: "No Bench",
      request: makeRequest({
        id: "horizontal-row-review-no-bench",
        athleteId: "dumbbells-without-bench",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
      }),
    },
    {
      id: "horizontal-row-no-machine",
      group: "Horizontal Row Selection",
      title: "No Row Machine",
      request: makeRequest({
        id: "horizontal-row-review-no-machine",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: withoutRowMachine(FULL_GYM_EQUIPMENT),
      }),
    },
    {
      id: "horizontal-row-no-cable",
      group: "Horizontal Row Selection",
      title: "No Cable",
      request: makeRequest({
        id: "horizontal-row-review-no-cable",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: withoutCable(FULL_GYM_EQUIPMENT),
      }),
    },
    {
      id: "horizontal-row-dumbbells-bench-only",
      group: "Horizontal Row Selection",
      title: "Dumbbells + Bench Only",
      request: makeRequest({
        id: "horizontal-row-review-dumbbells-bench-only",
        athleteId: "beginner-dumbbells-bench",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
      }),
    },
    {
      id: "horizontal-row-continuity",
      group: "Horizontal Row Selection",
      title: "Machine Row Productive Continuity",
      request: rowContinuityRequest(),
    },
  ];
}

function renderHorizontalRowTraceTable(scenario: ReviewScenario): string {
  const result = rankCandidateRequest(scenario.request);
  const trace = buildHorizontalRowSelectionTrace(result);
  const rows = trace.candidates.map((candidate) => [
    scenario.title,
    candidate.exerciseId,
    candidate.rank ? String(candidate.rank) : "rejected",
    candidate.total === null ? "n/a" : candidate.total.toFixed(3),
    candidate.legal ? "legal" : `rejected: ${candidate.rejectionCodes.join(", ")}`,
    `${candidate.support.externalSupport}/${candidate.support.bodySupport}/${candidate.support.reviewStatus}`,
    [
      candidate.resistancePath.resistancePath,
      `trajectory=${candidate.resistancePath.trajectoryFreedom}`,
      `line=${candidate.resistancePath.lineOfPullAdjustability}`,
      `laterality=${candidate.resistancePath.laterality}`,
      `fit=${candidate.resistancePath.fitDependency}`,
      `review=${candidate.resistancePath.reviewStatus}`,
    ].join("; "),
    [
      `trunk=${candidate.demand.trunk}`,
      `stability=${candidate.demand.stability}`,
      `coordination=${candidate.demand.coordination}`,
      `joint=${candidate.demand.jointControl}`,
    ].join("; "),
    [
      `loadability=${candidate.loading.loadability}`,
      `potential=${candidate.loading.loadingPotential}`,
      `localFatigue=${candidate.loading.localFatigue}`,
      `systemicFatigue=${candidate.loading.systemicFatigue}`,
    ].join("; "),
    candidate.contextualDifferentiators.join("<br>"),
    candidate.contextRequired.join("<br>"),
  ]);

  return [
    `### ${scenario.title}`,
    "",
    "| Scenario | Exercise | Rank | Total | Legal | Support | Resistance Path | Demand | Loading | Contextual Differentiators | Context Required |",
    "|---|---|---:|---:|---|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
    "",
  ].join("\n");
}

function renderHorizontalRowTieTable(scenarios: readonly ReviewScenario[]): string {
  const rows = scenarios.flatMap((scenario) => {
    const result = rankCandidateRequest(scenario.request);
    const trace = buildHorizontalRowSelectionTrace(result);

    return trace.tieStatus.map((tie) => [
      scenario.title,
      tie.exerciseIds.join(" <-> "),
      tie.statusCodes.join(", "),
      tie.evidence.join("<br>"),
    ]);
  });

  if (rows.length === 0) {
    return "No score-equivalent legal horizontal-row pairs were found in these scenarios.";
  }

  return [
    "| Scenario | Pair | Tie Status | Evidence |",
    "|---|---|---|---|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
  ].join("\n");
}

function renderHorizontalRowSelectionReview(): string {
  const scenarios = horizontalRowSelectionScenarios();

  return [
    "# Horizontal Row Selection Review",
    "",
    "This section audits the four primary horizontal-row variants through the real Candidate Intelligence request/ranking pipeline. Resistance/path metadata is observational only: it does not add score weights, generic path bonuses, or forced machine/cable ordering.",
    "",
    "The neutral full-gym request may still tie `machine-row` and `seated-cable-row`. That tie is now classified as `SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT` plus `CONTEXT_REQUIRED_TO_DIFFERENTIATE`, not as identical exercise knowledge.",
    "",
    ...scenarios.map(renderHorizontalRowTraceTable),
    "## Horizontal Row Tie Status",
    "",
    renderHorizontalRowTieTable(scenarios),
    "",
    "Review notes:",
    "- Machine row exposes `machine_guided`, `machine_geometry`, and unknown line/laterality fields because generic row-machine identity does not identify exact path, grip, convergence/divergence, chest support, or fit.",
    "- Seated cable row exposes `cable_anchored` setup geometry and `needs_review` path semantics because attachment, pulley geometry, grip, and exact line of pull vary.",
    "- Chest-supported and one-arm dumbbell rows expose free-implement trajectory/laterality differences while trunk, stability, support, loading, and pain behavior remain owned by existing components.",
    "- Exercise-specific history and continuity remain valid discriminators; path metadata does not generalize one exercise's success to all machines, cables, or free-implement rows.",
    "",
  ].join("\n");
}

function transitionCandidateRow(input: {
  readonly label: string;
  readonly request: CandidateRequest;
  readonly sourceId: string;
  readonly targetId: string;
}): readonly string[] {
  const result = rankCandidateRequest(input.request);
  const source = result.rankedCandidates.find((candidate) => candidate.exercise.id === input.sourceId);
  const target = result.rankedCandidates.find((candidate) => candidate.exercise.id === input.targetId);
  const sourceProgression = source ? componentValue(source, "progression_value") : "rejected";
  const targetProgression = target ? componentValue(target, "progression_value") : "rejected";

  return [
    input.label,
    source ? `${source.rank} / ${source.total.toFixed(3)}` : "rejected",
    target ? `${target.rank} / ${target.total.toFixed(3)}` : "rejected",
    sourceProgression,
    targetProgression,
    "transition knowledge only; automatic selection effect = none",
  ];
}

function renderProgressionVsTransitionReview(): string {
  const productive = continuityFor("chest-supported-dumbbell-row", "successful_current");
  const plateau = continuityFor("chest-supported-dumbbell-row", "plateau");
  const failed = continuityFor("chest-supported-dumbbell-row", "repeated_failure");
  const pain = continuityFor("chest-supported-dumbbell-row", "pain_response");
  const rows = [
    transitionCandidateRow({
      label: "Productive current exercise + ready to progress",
      request: makeRequest({
        id: "progression-transition-productive-current",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        continuity: productive.continuity,
        history: productive.history,
      }),
      sourceId: "chest-supported-dumbbell-row",
      targetId: "seated-cable-row",
    }),
    transitionCandidateRow({
      label: "Plateaued current exercise",
      request: makeRequest({
        id: "progression-transition-plateau",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        continuity: plateau.continuity,
        history: plateau.history,
      }),
      sourceId: "chest-supported-dumbbell-row",
      targetId: "seated-cable-row",
    }),
    transitionCandidateRow({
      label: "Failed progression current exercise",
      request: makeRequest({
        id: "progression-transition-failed",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        continuity: failed.continuity,
        history: failed.history,
      }),
      sourceId: "chest-supported-dumbbell-row",
      targetId: "seated-cable-row",
    }),
    transitionCandidateRow({
      label: "Pain-response current exercise",
      request: makeRequest({
        id: "progression-transition-pain-response",
        athleteId: "intermediate-gym-muscle-gain",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        continuity: pain.continuity,
        history: pain.history,
        painAndInjury: lowBackDiscomfort,
      }),
      sourceId: "chest-supported-dumbbell-row",
      targetId: "seated-cable-row",
    }),
    transitionCandidateRow({
      label: "Equipment-limited dumbbells + bench only",
      request: makeRequest({
        id: "progression-transition-equipment-limited",
        athleteId: "beginner-dumbbells-bench",
        goal: "strength",
        phaseId: "phase_2",
        need: horizontalPullNeed("strength"),
        equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
      }),
      sourceId: "machine-row",
      targetId: "chest-supported-dumbbell-row",
    }),
  ];
  const transitionRows = transitionTraceRows();
  const questionable = transitionRows.filter((trace) => trace.classification === "questionable");
  const needsReview = transitionRows.filter((trace) => trace.classification === "needs_review");

  return [
    "# Progression vs Exercise Transition Review",
    "",
    "`progressionAxes` now describe how the same exercise can advance while preserving identity. `transitionRelationships` describe cross-exercise replacement knowledge and always report `automaticSelectionEffect = none` at Candidate Intelligence scope.",
    "",
    "| Scenario | Source Rank/Total | Target Rank/Total | Source Progression Value | Target Progression Value | Interpretation |",
    "|---|---:|---:|---:|---:|---|",
    ...rows.map((row) => `| ${row.map(md).join(" | ")} |`),
    "",
    `Questionable transitions: ${questionable.map((trace) => `${trace.sourceExerciseId}->${trace.targetExerciseId}`).join(", ") || "none"}.`,
    `Needs-review transitions: ${needsReview.map((trace) => `${trace.sourceExerciseId}->${trace.targetExerciseId}`).join(", ") || "none"}.`,
    "",
    "Continuity principle: productive current exercises with same-exercise progression runway should generally be kept and progressed before replacement is considered. Plateau, failed progression, pain response, and equipment changes can justify considering replacement, but the target still has to win normal Candidate Intelligence with hard eligibility and pain constraints intact.",
    "",
  ].join("\n");
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
  sections.push(renderFeatureSpecificScapularAssessmentReview());
  sections.push(renderFeatureEmphasisVsCapabilityDemandReview());
  sections.push(renderFeatureCapabilityProvenanceReview());
  sections.push(renderHorizontalRowSelectionReview());
  sections.push(renderProgressionVsTransitionReview());
  sections.push("## Questionable Rankings / Modeling Gaps");
  sections.push("");
  sections.push("- Overall task capability estimates are mostly weak phase/default estimates unless assessment signals carry explicit severity or movement-role-matched training history exists.");
  sections.push("- Feature capability estimates do not consume generic movement-role history; current history records do not carry normalized feature tags.");
  sections.push("- `too_easy` and `appropriate_challenge` history events can now influence inferred capability when movement-role matched, but continuity/progression semantics still need more domain nuance.");
  sections.push("- Scapular candidates now expose feature-specific differentiation, but feature challenge demand is not yet modeled; feature-specific signals therefore stay neutral for bounded influence until that challenge scale exists.");
  sections.push("- Unknown metadata is now neutral and observable, but the catalog still has unknown fields that should not be promoted into production prescription without review.");
  sections.push("");
  sections.push("## Candidate Intelligence Sign-Off");
  sections.push("");
  sections.push("Classification: **READY_FOR_TARGETED_FIXES**");
  sections.push("");
  sections.push("Reasons:");
  sections.push("- Role truth, equipment truth, pain behavior, assessment relevance, bounded influence, and unknown-metadata safety are working at the current foundation scope.");
  sections.push("- Session composition should still wait for additional targeted fixes to row differentiation, phase calibration, and transition/readiness policy.");
  sections.push("- Observed capability evidence is not yet represented, and history-based capability evidence remains movement-role-inferred rather than measured.");
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
