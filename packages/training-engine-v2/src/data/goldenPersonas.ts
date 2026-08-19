import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile, CurrentTrainingState, TrainingEngineInput } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import { EMPTY_TRAINING_HISTORY, type TrainingHistory } from "../domain/history";
import { NO_PAIN_OR_INJURY, type PainAndInjuryState } from "../domain/painInjury";
import type { TrainingGoal } from "../domain/primitives";

export interface GoldenPersona extends TrainingEngineInput {
  readonly fixtureId: string;
  readonly expectedReasoningFocus: readonly string[];
}

function athlete(
  id: string,
  label: string,
  experience: AthleteProfile["experience"],
  primaryGoal: TrainingGoal,
  daysPerWeek: number,
  minutesPerSession: number,
): AthleteProfile {
  return {
    id,
    label,
    experience,
    primaryGoal,
    secondaryGoals: primaryGoal === "hypertrophy" ? ["strength"] : ["posture_and_movement_quality"],
    preferences: {
      preferredExerciseIds: [],
      dislikedExerciseIds: [],
      varietyPreference: "moderate",
      notes: [],
    },
    availability: {
      daysPerWeek,
      minutesPerSession,
      preferredTrainingDays: [],
    },
  };
}

const neutralAssessment: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const phase1: CurrentTrainingState = {
  phase: {
    currentPhaseId: "phase_1",
    weekInPhase: 1,
    metCriterionIds: [],
    blockedCriterionIds: [],
  },
  weekIndex: 1,
};

const phase2: CurrentTrainingState = {
  phase: {
    currentPhaseId: "phase_2",
    weekInPhase: 2,
    metCriterionIds: ["phase1-repeatable-control"],
    blockedCriterionIds: [],
  },
  weekIndex: 5,
};

const phase3: CurrentTrainingState = {
  phase: {
    currentPhaseId: "phase_3",
    weekInPhase: 2,
    metCriterionIds: ["phase1-repeatable-control", "phase2-recoverable-progression"],
    blockedCriterionIds: [],
  },
  weekIndex: 9,
};

function baseEquipment(environment: EquipmentCapabilities["environment"]): EquipmentCapabilities {
  return {
    environment,
    trainingSpace: {
      stableLoadedStandingSpace: false,
      loadedGait: {
        available: false,
      },
    },
    bodyweight: {
      floorSpace: true,
      wallAvailable: true,
      pullUpBar: false,
    },
    bench: {
      types: [],
      stable: false,
    },
    dumbbells: {
      available: false,
      pairAvailable: false,
      adjustable: false,
    },
    barbell: {
      available: false,
      rackAvailable: false,
    },
    cables: {
      available: false,
      adjustableHeight: false,
      availableHeights: [],
    },
    bands: {
      types: [],
      anchors: [],
    },
    machines: {
      availableMachineIds: [],
    },
    supportSurfaces: ["wall"],
  };
}

export const FULL_GYM_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("commercial_gym"),
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: true,
      straightLineMeters: 12,
      turningAvailable: true,
      overheadClearance: true,
    },
  },
  bench: {
    types: ["flat", "adjustable"],
    stable: true,
  },
  dumbbells: {
    available: true,
    pairAvailable: true,
    adjustable: false,
    maxPairWeightKg: 50,
  },
  barbell: {
    available: true,
    rackAvailable: true,
    maxLoadKg: 180,
  },
  cables: {
    available: true,
    adjustableHeight: true,
    availableHeights: ["low", "mid", "high"],
  },
  bands: {
    types: ["loop", "tube_handles"],
    anchors: [
      { height: "low", stableFor: "moderate" },
      { height: "mid", stableFor: "moderate" },
      { height: "high", stableFor: "moderate" },
    ],
  },
  machines: {
    availableMachineIds: [
      "abdominal_crunch",
      "chest_press",
      "row",
      "lat_pulldown",
      "leg_press",
      "leg_curl",
      "reverse_pec_deck",
      "shoulder_press",
    ],
  },
  supportSurfaces: ["wall", "box"],
};

export const DUMBBELLS_AND_BENCH_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("home"),
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: false,
    },
  },
  bench: {
    types: ["flat", "adjustable"],
    stable: true,
  },
  dumbbells: {
    available: true,
    pairAvailable: true,
    adjustable: true,
    maxPairWeightKg: 32,
  },
  supportSurfaces: ["wall", "box"],
};

export const DUMBBELLS_NO_BENCH_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("home"),
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: false,
    },
  },
  dumbbells: {
    available: true,
    pairAvailable: true,
    adjustable: true,
    maxPairWeightKg: 24,
  },
  supportSurfaces: ["wall", "box"],
};

export const ANCHORED_BANDS_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("home"),
  trainingSpace: {
    stableLoadedStandingSpace: false,
    loadedGait: {
      available: false,
    },
  },
  bands: {
    types: ["tube_handles", "loop"],
    anchors: [
      { height: "low", stableFor: "moderate" },
      { height: "mid", stableFor: "moderate" },
      { height: "high", stableFor: "light" },
    ],
  },
};

export const BANDS_WITHOUT_ANCHOR_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("travel"),
  trainingSpace: {
    stableLoadedStandingSpace: false,
    loadedGait: {
      available: false,
    },
  },
  bands: {
    types: ["tube_handles"],
    anchors: [],
  },
};

export const LOOP_BANDS_ONLY_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("travel"),
  trainingSpace: {
    stableLoadedStandingSpace: false,
    loadedGait: {
      available: false,
    },
  },
  bands: {
    types: ["loop", "mini_loop"],
    anchors: [],
  },
};

export const BODYWEIGHT_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("home"),
  trainingSpace: {
    stableLoadedStandingSpace: false,
    loadedGait: {
      available: false,
    },
  },
};

export const MIXED_HOME_EQUIPMENT: EquipmentCapabilities = {
  ...baseEquipment("home"),
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: false,
    },
  },
  bench: {
    types: ["flat"],
    stable: true,
  },
  dumbbells: {
    available: true,
    pairAvailable: true,
    adjustable: true,
    maxPairWeightKg: 18,
  },
  bands: {
    types: ["loop", "tube_handles"],
    anchors: [{ height: "mid", stableFor: "light" }],
  },
  supportSurfaces: ["wall", "box"],
};

const shoulderConcernAssessment: AssessmentState = {
  signals: [
    {
      id: "right-scapular-control-priority",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      side: "right",
      description: "Right scapular control should influence preparation and pressing choices.",
    },
  ],
  historicalWeaknesses: [
    {
      id: "historic-overhead-control-gap",
      region: "shoulder",
      movementRole: "vertical_push",
      description: "Historical overhead-control gap, not automatically current pain.",
    },
  ],
};

const lowBackAssessment: AssessmentState = {
  signals: [
    {
      id: "low-back-hinge-control",
      type: "control_finding",
      source: "movement_screen",
      confidence: "medium",
      priority: "secondary",
      region: "lumbar_spine",
      movementRole: "hinge",
      description: "Hinge control should influence loaded hinge readiness.",
    },
  ],
  historicalWeaknesses: [],
};

const shoulderDiscomfort: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "mild-right-shoulder-discomfort",
      region: "shoulder",
      severity0To10: 2,
      stressTags: ["overhead_pressing", "shoulder_abduction_external_rotation"],
      effect: "prefer_support",
      description: "Mild current discomfort should affect suitability, not hard-exclude all pressing.",
    },
  ],
};

const moderateLowBackPain: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  moderatePain: [
    {
      kind: "moderate_pain",
      id: "moderate-low-back-hinge-pain",
      region: "lumbar_spine",
      severity0To10: 4,
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
      requiredResponse: "avoid_aggravator",
      description: "Loaded hinges need review and likely substitution.",
    },
  ],
};

const personalBlockPainState: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  personalExerciseBlocks: [
    {
      kind: "personal_exercise_block",
      id: "blocks-push-up",
      exerciseIds: ["push-up"],
      reason: "Athlete refuses push-ups because of prior negative experience.",
      createdBy: "athlete",
    },
  ],
};

function history(overrides: Partial<TrainingHistory> = {}): TrainingHistory {
  return {
    ...EMPTY_TRAINING_HISTORY,
    ...overrides,
  };
}

export const GOLDEN_PERSONAS: readonly GoldenPersona[] = [
  {
    fixtureId: "beginner-gym-no-pain",
    athlete: athlete("beginner-gym-no-pain", "Beginner gym, no pain", "beginner", "general_fitness", 3, 45),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: FULL_GYM_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["beginner is not machine-only", "equipment truth", "phase 1 control"],
  },
  {
    fixtureId: "beginner-gym-shoulder-concern",
    athlete: athlete("beginner-gym-shoulder-concern", "Beginner gym, shoulder concern", "beginner", "pain_aware_return", 3, 40),
    assessment: shoulderConcernAssessment,
    painAndInjury: shoulderDiscomfort,
    equipment: FULL_GYM_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["assessment affects warmup and main work", "mild discomfort is not a blanket hard gate"],
  },
  {
    fixtureId: "intermediate-gym-muscle-gain",
    athlete: athlete("intermediate-gym-muscle-gain", "Intermediate gym, muscle gain", "intermediate", "hypertrophy", 4, 60),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: FULL_GYM_EQUIPMENT,
    history: history({
      exerciseHistory: {
        events: [
          {
            id: "db-bench-appropriate",
            exerciseId: "dumbbell-bench-press",
            type: "appropriate_challenge",
            movementRole: "horizontal_push",
            notes: "Good challenge and no pain response.",
          },
        ],
        stableExerciseIds: ["dumbbell-bench-press"],
        blockedExerciseIds: [],
      },
    }),
    currentState: phase2,
    expectedReasoningFocus: ["productive continuity", "hypertrophy accessories", "weekly exposure"],
  },
  {
    fixtureId: "advanced-gym-muscle-gain",
    athlete: athlete("advanced-gym-muscle-gain", "Advanced gym, muscle gain", "advanced", "hypertrophy", 5, 70),
    assessment: lowBackAssessment,
    painAndInjury: moderateLowBackPain,
    equipment: FULL_GYM_EQUIPMENT,
    history: history(),
    currentState: phase3,
    expectedReasoningFocus: ["advanced is not hardest-is-best", "pain changes suitability and prescription"],
  },
  {
    fixtureId: "beginner-dumbbells-bench",
    athlete: athlete("beginner-dumbbells-bench", "Beginner dumbbells + bench", "beginner", "strength", 3, 45),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["free weights are legal when capability fits", "bench support matters"],
  },
  {
    fixtureId: "intermediate-dumbbells",
    athlete: athlete("intermediate-dumbbells", "Intermediate dumbbells", "intermediate", "hypertrophy", 4, 55),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
    history: history(),
    currentState: phase2,
    expectedReasoningFocus: ["dumbbell progression", "loadability limits"],
  },
  {
    fixtureId: "dumbbells-without-bench",
    athlete: athlete("dumbbells-without-bench", "Dumbbells without bench", "beginner", "strength", 3, 40),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["bench-dependent exercises are illegal", "floor/bodyweight alternatives remain possible"],
  },
  {
    fixtureId: "anchored-bands",
    athlete: athlete("anchored-bands", "Anchored bands", "beginner", "general_fitness", 3, 35),
    assessment: shoulderConcernAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: ANCHORED_BANDS_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["anchor height matters", "band rows and pulldowns can be represented"],
  },
  {
    fixtureId: "bands-without-anchor",
    athlete: athlete("bands-without-anchor", "Bands without anchor", "beginner", "general_fitness", 3, 30),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: BANDS_WITHOUT_ANCHOR_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["band ownership is not anchor capability", "setup impossibility is hard eligibility"],
  },
  {
    fixtureId: "loop-bands-only",
    athlete: athlete("loop-bands-only", "Loop bands only", "novice", "posture_and_movement_quality", 3, 25),
    assessment: neutralAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: LOOP_BANDS_ONLY_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["loop bands differ from anchored tube bands", "limited loading path"],
  },
  {
    fixtureId: "bodyweight",
    athlete: athlete("bodyweight", "Bodyweight", "novice", "general_fitness", 3, 30),
    assessment: neutralAssessment,
    painAndInjury: personalBlockPainState,
    equipment: BODYWEIGHT_EQUIPMENT,
    history: history(),
    currentState: phase1,
    expectedReasoningFocus: ["personal block is not contraindication", "bodyweight-only constraints"],
  },
  {
    fixtureId: "mixed-home",
    athlete: athlete("mixed-home", "Mixed home", "intermediate", "strength", 4, 45),
    assessment: lowBackAssessment,
    painAndInjury: NO_PAIN_OR_INJURY,
    equipment: MIXED_HOME_EQUIPMENT,
    history: history({
      exerciseHistory: {
        events: [
          {
            id: "goblet-squat-success",
            exerciseId: "goblet-squat",
            type: "progression_success",
            movementRole: "squat",
            notes: "Recent success suggests continuity may beat novelty.",
          },
        ],
        stableExerciseIds: ["goblet-squat"],
        blockedExerciseIds: [],
      },
    }),
    currentState: phase2,
    expectedReasoningFocus: ["continuity vs replacement", "mixed capability realism"],
  },
];
