import type { WarmupBlock } from "@/lib/program/warmupLibrary";

export type SessionRecord = {
  id: string;
  userId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  routineId: string | null;
  durationSec: number | null;
  notes: string | null;
  sessionFeedback?: "easy" | "moderate" | "hard" | "pain" | null;
  sessionPainLocation?: PainLocation | null;
  sessionFeedbackNotes?: string | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type PainLocation =
  | "neck"
  | "shoulder"
  | "upper back"
  | "lower back"
  | "hips"
  | "knees"
  | "other";

export type PainLevel = "none" | "mild" | "moderate" | "severe";

export type ExerciseLog = {
  id: string;
  userId: string | null;
  sessionId: string;
  exerciseId: string;
  section?: ProgramRoutineItem["section"] | null;
  originalExerciseId?: string | null;
  substitutedExerciseId?: string | null;
  programId?: string | null;
  dayIndex?: number | null;
  createdAt: string;
  updatedAt: string;
  loadType: "weighted" | "bodyweight" | "timed" | "assisted";
  unit: "lb" | "kg" | null;
  weight: number | null;
  reps: number | null;
  repsBySet: number[] | null;
  setsPlanned: number | null;
  setsCompleted: number | null;
  durationSec: number | null;
  workSecondsUsed?: number | null;
  restSecondsUsed?: number | null;
  rpe: number | null;
  felt: "easy" | "moderate" | "hard" | "pain" | null;
  painLevel?: PainLevel | null;
  painLocation?: PainLocation | null;
  nextTimeGuidance?: string | null;
  feedbackNotes?: string | null;
  notes: string | null;
  computedVolume: number | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type ExerciseFeedback = {
  rating: "easy" | "moderate" | "hard" | "pain";
  painLocation?: PainLocation | null;
  notes?: string | null;
};

export type LogPrefs = {
  schemaVersion: number;
  timerPrefs?: { workSeconds: number; restSeconds: number };
  timerPrefsByExercise?: Record<
    string,
    { workSeconds: number; restSeconds: number }
  >;
  loadPrefsByExercise?: Record<
    string,
    {
      unit?: "lb" | "kg";
      weight?: string;
      repsMode?: "single" | "per-set";
      reps?: string;
      repsBySet?: string[];
      selectedSets?: number;
    }
  >;
  feedbackByExercise?: Record<string, ExerciseFeedback>;
  substitutionByExercise?: Record<string, string>;
};

export type ProgramRoutineItem = {
  exerciseId: string;
  section?: "warmup" | "activation" | "main" | "accessory" | "cooldown";
  sets: string | number | null;
  reps?: string | null;
  durationSec?: number | null;
  restSec?: number | null;
  loadType: "weighted" | "bodyweight" | "timed" | "assisted";
  notes?: string | null;
  cues?: string[] | null;
  selectionDebug?: ProgramSelectionDebug;
};

export type ProgramSelectionDebugSource =
  | "initial_pick"
  | "uniqueness_swap"
  | "eligibility_swap"
  | "feedback_swap"
  | "contract_repair"
  | "coverage_repair"
  | "day_intelligence_repair";

export type ProgramSelectionDebug = {
  source: ProgramSelectionDebugSource;
  slotId?: string;
  slotKind?: string;
  slotLane?: string;
  phaseIndex?: number;
};

export type ProgramDay = {
  dayIndex: number;
  title: string;
  focusTags: string[];
  routine: ProgramRoutineItem[];
  warmup?: WarmupBlock;
  activation?: WarmupBlock;
  cooldown?: WarmupBlock;
};

export type Program = {
  id: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  templateVersion?: number;
  goalTrack: string | null;
  daysPerWeek: 3 | 4 | 5;
  estimatedSessionMinutesRange: { min: 45; max: 60 };
  phaseIndex?: number;
  phaseName?: string;
  // Week index within the current phase.
  weekIndex?: number;
  // Absolute week counter across a user's full training history.
  totalWeekIndex?: number;
  cycleIndex?: number;
  phase?: {
    name: string;
    phaseIndex: number;
    cycleIndex: number;
    weekIndex: number;
    weekCount: number;
    goal: string;
  };
  nextWeekPlan?: {
    summary: string;
    change: string;
    reason: string;
  };
  phaseOptimizerReport?: {
    summary: string;
    priorities: string[];
    changedSlots: number;
    totalSlots: number;
    exerciseReasons: Record<string, string[]>;
  };
  movementProfile?: {
    generatedAt: string;
    readiness: number;
    recovery: number;
    consistency: number;
    painRisk: number;
    confidence: number;
    asymmetry: number;
    painSensitivity: Record<string, number>;
    skillScores: Record<string, number>;
    priorities: string[];
  };
  phaseObjective?: {
    title: string;
    objective: string;
    phaseFocus: string;
    primaryPatterns: string[];
    successMarkers: string[];
    guardrail: string;
    weekIntent: string;
    whyNow: string;
    riskWatchouts: string[];
    coachingPrompts: string[];
    metrics: {
      readiness: number;
      consistency: number;
      painRisk: number;
      asymmetry: number;
    };
  };
  sessionAdaptation?: {
    summary: string;
    reasons: string[];
    appliedChanges: string[];
    masteryNext: string[];
    dataSignals: string[];
    masteryChecks: string[];
  };
  week: ProgramDay[];
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type ProgramProgress = {
  programId: string;
  lastCompletedDayIndex: number | null;
  nextDayIndex: number;
  completedDayIndices: number[];
  phaseIndex?: number;
  phaseStartedAt?: string | null;
  cyclesCompletedInPhase?: number;
  daysPerWeek?: number;
  weekIndex?: number;
  countedWeekKeys?: string[];
  updatedAt: string;
};

export type TrainingStage =
  | "onramp"
  | "build"
  | "push"
  | "deload"
  | "rebuild";

export type TrainingTrend = "up" | "flat" | "down";

export type UserTrainingState = {
  stage: TrainingStage;
  readiness: number;
  consistency: number;
  painRisk: number;
  fatigueRisk: number;
  movementQuality: number;
  capacity: number;
  confidence: number;
  trend: TrainingTrend;
  reason: string;
};
