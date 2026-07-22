import type { WarmupBlock } from "@/lib/program/warmupLibrary";

/**
 * Aggregated per-exercise feedback summary computed from recent ExerciseLogs.
 * Canonical location is types.ts (promoted from logStore.ts in Phase 3 hygiene).
 * Phase 3.0-refinement (ED-3.0.2): deferred flag is set by user response to
 * the Phase 3.2 Sacrifice/Test/Modify prompt — never set automatically.
 */
export type ExerciseFeedbackSummary = {
  exerciseId: string;
  pain: "none" | "mild" | "moderate" | "severe";
  difficulty: "easy" | "normal" | "hard" | "failed";
  completionRate: number;
  /**
   * Phase 3.2 — Sacrifice: set by user choosing Sacrifice or auto-Sacrifice
   * (two-strikes).  When true, the engine hard-blocks this exercise from every
   * repair-insertion path and skips it from next-cycle selection scoring.
   * Never set automatically by the engine without user action.
   */
  deferred?: boolean;
  /**
   * Phase 3.2 — Test: set when user chooses Test (or dismisses the prompt).
   * On the next session, if the same exercise triggers a heavy signal again,
   * auto-Sacrifice is applied (two-strikes-and-defer).
   * Cleared when the exercise logs a clean session.
   */
  probation?: boolean;
  /**
   * Phase 3.2 — Sacrifice timestamp.  Written when deferred is set to true.
   * Phase 5 reads this for the "Sacrificed exercises" retest panel.
   */
  sacrificedAt?: { phase: "activation" | "skill" | "growth"; sessionCount: number };
  /**
   * Phase 3.2 — Auto-Sacrifice flag.  Distinguishes user-chosen Sacrifice from
   * two-strikes-triggered auto-defer.  Carries a decisionTrace line.
   */
  autoSacrificed?: boolean;
};

/**
 * Per-pattern ladder rung tracking.  Updated on each program generation cycle.
 * Phase 3: criteria-based progression engine.
 */
export type LadderRungState = {
  /** Exercise ID of the current rung for this pattern. */
  exerciseId: string;
  /** Canonical pattern key (e.g. "hinge", "horizontal_pull"). */
  pattern: string;
  /** Difficulty level 1–5 of the current exercise. */
  difficulty: number;
  /** Consecutive clean sessions accumulated since last regression (or init). */
  cleanSessionsCount: number;
  /** Sessions required before an advance attempt (2 normally; 3 after REG-2 hysteresis). */
  requiredForAdvance: number;
  /** True when hysteresis is active (3 clean sessions required). */
  inHysteresis: boolean;
  /** Human-readable trace of the last advance/hold/regress decision. */
  lastDecisionTrace: string;
};

export type LadderState = {
  /** Keyed by canonical pattern name. */
  byPattern: Record<string, LadderRungState>;
  /**
   * Phase 3.2 — Retest queue.  When a user Sacrifices an exercise, its ID is
   * added here under the pattern key.  Phase 5 reads this list to surface
   * "Ready to retest?" prompts at phase transitions.
   */
  sacrificedByPattern?: Record<string, string[]>;
  /**
   * Phase 3.3 — Maintain mode override.
   * Set per-pattern when the user responds "Yes, let's progress" to the
   * phase-transition prompt in maintain mode.  Temporarily flips intent to
   * "build" for that pattern only, cleared after one successful advance.
   */
  progressionOverrideByPattern?: Record<string, "build">;
  /**
   * Phase 3.3 — Rehab mode explicit advance request.
   * Set only by explicit user action (never auto-set).  Permits one
   * advancement attempt for that pattern before being cleared.
   */
  explicitAdvanceRequestedByPattern?: Record<string, boolean>;
  /**
   * Phase 3.3 — Maintain phase-transition prompt tracking.
   * Records the phase index at which the "Want to try progressing?" prompt
   * was last surfaced per pattern.  Prevents re-nagging within the same phase.
   */
  maintainPromptShownAtPhase?: Record<string, number>;
};

export type SessionFeedback = {
  completed?: "yes" | "partial" | "no";
  difficultyRPE?: number;
  painBefore?: number;
  painAfter?: number;
  energy?: number;
  techniqueConfidence?: number;
  enjoyment?: number;
  timeAvailableNextSession?: number;
  notes?: string;
};

export type SessionFeedbackSignals = {
  painDelta?: number;
  completed?: "yes" | "partial" | "no";
  effortBand?: "low" | "moderate" | "high";
  confidenceBand?: "low" | "moderate" | "high";
  energyBand?: "low" | "moderate" | "high";
  readinessHint?: "progress" | "maintain" | "reduce" | "recover";
  flags: string[];
  coachSummary?: string;
};

export type SessionAdaptationPreview = {
  readinessHint: "progress" | "maintain" | "reduce" | "recover";
  suggestedAction:
    | "gently_progress"
    | "repeat"
    | "reduce_dose"
    | "simplify_pattern"
    | "recovery_session";
  reasons: string[];
  coachMessage: string;
};

export type NextSessionRecommendation = {
  mode: "normal" | "repeat" | "reduce" | "simplify" | "recover";
  priority: "low" | "medium" | "high";
  reasons: string[];
  message: string;
  suggestedAdjustments: string[];
  sourceSessionId?: string;
};

export type SessionPracticeOption = {
  mode: "full" | "steady" | "reduced" | "simplified" | "recovery";
  label: string;
  description: string;
  isRecommended?: boolean;
  sourceRecommendationMode?: NextSessionRecommendation["mode"];
};

export type AdaptiveProgramIntent = {
  enabled: boolean;
  mode: "none" | "hold" | "reduce" | "simplify" | "recover" | "gently_progress";
  source: "session_feedback";
  reasons: string[];
  constraints: string[];
  suggestedGeneratorEffects: string[];
};

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
  feedback?: SessionFeedback | null;
  selectedPracticeMode?: SessionPracticeOption["mode"];
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
  /**
   * Phase 3.2 — persisted contract state per exercise.
   * Stores deferred/probation/sacrificedAt/autoSacrificed set by the
   * Sacrifice/Test/Modify pre-session prompt.  Merged with computed log
   * summaries when building feedbackSummaryByExercise.
   */
  contractStateByExercise?: Record<
    string,
    Pick<
      ExerciseFeedbackSummary,
      "deferred" | "probation" | "sacrificedAt" | "autoSacrificed"
    >
  >;
  /**
   * Phase 3.3 — Personal Equipment Blocks.
   * Exercises the user has removed from their program (either by preference or
   * because the equipment is unavailable).  Hard-filtered before scoring, at
   * the same tier as painContraindications — no exception paths.
   *
   * Reset options (Settings screen):
   *   - "Reset equipment blocks" → clears entries where reason === "no_equipment"
   *   - "Reset all blocks" → clears all entries in this map
   *
   * These resets do NOT touch sacrifice/regression history or LadderState — the
   * coaching state persists through equipment changes by design.
   */
  blockedExerciseIds?: Record<
    string,
    {
      reason: "no_equipment" | "personal_preference";
      blockedAt: { phase: "activation" | "skill" | "growth"; sessionCount: number };
    }
  >;
};

export type ExercisePrescription = {
  sets?: number;
  reps?: string;
  tempo?: string;
  restSeconds?: number;
  targetRPE?: number;
  progressionRule?: string;
  regressionRule?: string;
  stopRule?: string;
};

export type ExerciseRationale = {
  whyThisExercise?: string;
  mainCue?: string;
  commonMistake?: string;
  easierVersion?: string;
  harderVersion?: string;
  stopIf?: string;
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
  prescription?: ExercisePrescription;
  rationale?: ExerciseRationale;
};

export type ProgramSelectionDebugSource =
  | "initial_pick"
  | "uniqueness_swap"
  | "eligibility_swap"
  | "feedback_swap"
  | "legality_repair"
  | "contract_repair"
  | "coverage_repair"
  | "day_intelligence_repair";

export type ProgramSelectionDecisionTrace = {
  selectedForQuota?: Array<{
    category: string;
    deficit: number;
    bonus: number;
  }>;
  noveltyPenaltyApplied?: number;
  environmentBonusOrPenalty?: number;
  slotRoleMatch?: string;
  tieBreakRank?: number;
  phaseFitBonusOrPenalty?: number;
  dayIdentityBonusOrPenalty?: number;
  fatigueOverlapPenalty?: number;
  /**
   * Present when the slot was filled via the degradation contract instead of
   * the primary selection path. Values follow the contract stages:
   *   "degraded-a" = sibling-family relax / tier-cap relaxed
   *   "degraded-b" = ladder-aware substitution (any pattern rung)
   *   "degraded-c" = corrective fallback (scap_health / hip_health / etc.)
   *   "dropped"    = last-resort drop; see ProgramDay.degradationNotes for user msg
   */
  degradationReason?: "degraded-a" | "degraded-b" | "degraded-c" | "dropped";
};

export type ProgramSelectionDebug = {
  source: ProgramSelectionDebugSource;
  slotId?: string;
  slotKind?: string;
  slotLane?: string;
  phaseIndex?: number;
  decisionTrace?: ProgramSelectionDecisionTrace;
};

export type ProgramDay = {
  dayIndex: number;
  title: string;
  focusTags: string[];
  routine: ProgramRoutineItem[];
  warmup?: WarmupBlock;
  activation?: WarmupBlock;
  cooldown?: WarmupBlock;
  /**
   * Phase 3W — PRIME block.  One d1–d2 rung per main pattern of the day,
   * unloaded/minimally loaded.  The ladder read downward is the primer
   * generator.  Items here are WarmupItems built from Exercise catalog entries.
   */
  prime?: WarmupBlock;
  /**
   * Phase 3W — Human-readable trace of every RAMP/MOBILIZE/ACTIVATE/PRIME
   * pick with block label and reason.  Undefined on programs generated before
   * Phase 3W.
   */
  warmupDecisionTrace?: string[];
  /** User-visible notes explaining why a slot was dropped or degraded. */
  degradationNotes?: string[];
};

export type Program = {
  id: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  templateVersion?: number;
  questionnaireSignature?: string;
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
  /**
   * Phase 3: per-pattern ladder rung state.  Written on each generation cycle.
   * Undefined on programs generated before Phase 3 (treated as "no history").
   */
  ladderState?: LadderState;
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
  workoutsCompletedInPhase?: number;
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
