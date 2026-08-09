import type {
  DemandLevel,
  IntensityBand,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "./primitives";

export type PhaseId = "phase_1" | "phase_2" | "phase_3";

export interface PhaseCapabilityExpectation {
  readonly movementRoles: readonly MovementRole[];
  readonly control: DemandLevel;
  readonly stability: DemandLevel;
  readonly coordination: DemandLevel;
  readonly technicalComplexity: DemandLevel;
}

export interface PhaseProgressionIntent {
  readonly loading: DemandLevel;
  readonly effort: IntensityBand;
  readonly preferredProgressionAxes: readonly (
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
  readonly exerciseContinuityDefault: "prefer_continue_when_productive" | "review_for_phase_fit";
}

export interface PhaseAdvancementCriterion {
  readonly id: string;
  readonly description: string;
  readonly evidenceSignals: readonly string[];
  readonly blockingSignals: readonly string[];
}

export interface PhaseIntent {
  readonly id: PhaseId;
  readonly name: string;
  readonly primaryGoal: TrainingGoal;
  readonly developedQualities: readonly string[];
  readonly priorityMuscles: readonly MuscleGroup[];
  readonly capabilityExpectation: PhaseCapabilityExpectation;
  readonly progressionIntent: PhaseProgressionIntent;
  readonly advancementCriteria: readonly PhaseAdvancementCriterion[];
}

export interface PhaseState {
  readonly currentPhaseId: PhaseId;
  readonly weekInPhase: number;
  readonly metCriterionIds: readonly string[];
  readonly blockedCriterionIds: readonly string[];
}

export const THREE_PHASE_FOUNDATION: readonly [PhaseIntent, PhaseIntent, PhaseIntent] = [
  {
    id: "phase_1",
    name: "Foundation and control",
    primaryGoal: "posture_and_movement_quality",
    developedQualities: ["position", "control", "repeatable technique", "movement confidence"],
    priorityMuscles: ["trunk", "glutes", "upper_back", "serratus"],
    capabilityExpectation: {
      movementRoles: ["breathing_position", "scapular_control", "anti_extension_core", "squat", "hinge"],
      control: "moderate",
      stability: "low",
      coordination: "low",
      technicalComplexity: "low",
    },
    progressionIntent: {
      loading: "low",
      effort: "easy",
      preferredProgressionAxes: ["range", "tempo", "reps", "support_reduction"],
      exerciseContinuityDefault: "prefer_continue_when_productive",
    },
    advancementCriteria: [
      {
        id: "phase1-repeatable-control",
        description: "Priority patterns are repeatable without symptom escalation.",
        evidenceSignals: ["successful sessions", "stable pain response", "coachable technique"],
        blockingSignals: ["acute pain", "repeated technique breakdown"],
      },
    ],
  },
  {
    id: "phase_2",
    name: "Capacity and progressive loading",
    primaryGoal: "strength",
    developedQualities: ["tissue capacity", "strength capacity", "training consistency"],
    priorityMuscles: ["chest", "lats", "quads", "hamstrings", "glutes", "trunk"],
    capabilityExpectation: {
      movementRoles: ["squat", "hinge", "single_leg", "horizontal_push", "horizontal_pull"],
      control: "moderate",
      stability: "moderate",
      coordination: "moderate",
      technicalComplexity: "moderate",
    },
    progressionIntent: {
      loading: "moderate",
      effort: "moderate",
      preferredProgressionAxes: ["load", "reps", "sets", "range"],
      exerciseContinuityDefault: "prefer_continue_when_productive",
    },
    advancementCriteria: [
      {
        id: "phase2-recoverable-progression",
        description: "Progressive stimulus is tolerated with recoverable fatigue.",
        evidenceSignals: ["progression success", "appropriate challenge", "recovery within week"],
        blockingSignals: ["plateau with poor recovery", "repeated missed sessions", "pain response"],
      },
    ],
  },
  {
    id: "phase_3",
    name: "Performance consolidation",
    primaryGoal: "hypertrophy",
    developedQualities: ["productive stimulus", "coordination", "independent progression"],
    priorityMuscles: ["chest", "lats", "side_delts", "rear_delts", "quads", "hamstrings", "glutes"],
    capabilityExpectation: {
      movementRoles: [
        "squat",
        "hinge",
        "single_leg",
        "horizontal_push",
        "vertical_push",
        "horizontal_pull",
        "vertical_pull",
      ],
      control: "high",
      stability: "moderate",
      coordination: "moderate",
      technicalComplexity: "moderate",
    },
    progressionIntent: {
      loading: "high",
      effort: "hard",
      preferredProgressionAxes: ["load", "sets", "reps", "stability", "coordination"],
      exerciseContinuityDefault: "review_for_phase_fit",
    },
    advancementCriteria: [
      {
        id: "phase3-long-term-readiness",
        description: "The user has clear productive progression paths and manageable fatigue.",
        evidenceSignals: ["stable performance trend", "manageable fatigue", "no unresolved pain limiter"],
        blockingSignals: ["unclear response", "unresolved pain limitation"],
      },
    ],
  },
];
