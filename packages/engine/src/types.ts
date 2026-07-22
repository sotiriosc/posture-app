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
  /**
   * Phase 5 — Append-only log of every rung advancement.
   * Written by computeLadderState when decision.kind === "advance".
   * Used by resultsProjection to build the laddersClimbed field.
   */
  rungAdvancementHistory?: RungAdvancementRecord[];
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
  mode: "full" | "lighter" | "recovery";
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
  /**
   * Phase 6.3 — Per-section visibility (user-controlled progressive disclosure).
   * Maps a stable sectionId (see engine `ui/sectionVisibility`) to whether the
   * user wants that section shown.  Absent key means fall back to the section's
   * ratified default.  Never a global mode — this is per-section user agency.
   */
  sectionVisibility?: Record<string, boolean>;
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
  /**
   * Phase 4 — Because → Therefore surfacing.
   * Present when this exercise was biased by a posture focus tag.  Contains
   * the verbatim reason string from derivePoseFocus so the UI can render:
   * "[exercise name] — chosen because [sourceObservation]."
   */
  sourceObservation?: string;
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
  /**
   * Phase 3.5: persisted phase gating state.  Written when phaseSessionSnapshots
   * are supplied to generateWeeklyProgram.  Undefined on programs generated
   * before Phase 3.5 or without session history.
   */
  phaseTransitionState?: PhaseTransitionState;
  /**
   * Phase 4 — Assessment history.  One snapshot per accepted/retested assessment.
   * Append-only.  Used by the tag lifecycle evaluator.
   * Undefined on programs generated before Phase 4.
   */
  assessmentHistory?: AssessmentSnapshot[];
  /**
   * Phase 4 — Per-tag lifecycle state.  Keyed by focusTag.
   * Written by computeFocusTagLifecycleUpdate.
   * Undefined on programs generated before Phase 4.
   */
  focusTagLifecycle?: Record<string, FocusTagLifecycleState>;
  /**
   * Phase 5 — Ordered log of every phase transition earned.
   * Append-only.  Written by buildPhaseTransitionState when verdict === "advance".
   * Used by resultsProjection to build the phaseHistory field.
   * Undefined on programs generated before Phase 5.
   */
  phaseHistory?: PhaseTransitionRecord[];
  source: "local" | "cloud";
  deletedAt: string | null;
};

// ---------------------------------------------------------------------------
// Phase 5 — Rung advancement history (laddersClimbed projection)
// ---------------------------------------------------------------------------

/**
 * One rung advancement event, written by computeLadderState when
 * decision.kind === "advance".  Append-only on LadderState.
 */
export type RungAdvancementRecord = {
  pattern: string;
  fromExerciseId: string;
  fromDifficulty: number;
  toExerciseId: string;
  toDifficulty: number;
  /** Session count at the time of advancement (from sessionCount param). */
  atSessionCount: number;
  /** Phase index at the time of advancement. */
  atPhase: number;
  /** Human-readable criteria trace that earned this advance. */
  trace: string;
};

// ---------------------------------------------------------------------------
// Phase 5 — Phase transition history (phaseHistory projection)
// ---------------------------------------------------------------------------

/**
 * One completed phase, appended to Program.phaseHistory whenever a
 * phase transition is recorded.  Closed when the next phase begins.
 */
export type PhaseTransitionRecord = {
  phase: "activation" | "skill" | "growth";
  enteredAtSessionCount: number;
  /** Undefined if the phase is still current (open end). */
  exitedAtSessionCount?: number;
  /** Criteria verdict trace at the moment of exit. */
  criteriaAtExit: string[];
  trace: string;
};

// ---------------------------------------------------------------------------
// Phase 4 — Assessment history types
// ---------------------------------------------------------------------------

/**
 * A single observation within an assessment snapshot, carrying the raw
 * measurement values needed for retirement/escalation comparisons.
 */
export type AssessmentObservationRecord = {
  focusTag: string;
  measuredValue: number;
  threshold: number;
  /** Minimum keypoint confidence among keypoints that contributed to this observation. */
  keypointConfidences: number[];
};

/**
 * Phase 4 — Persisted snapshot of a single assessment event.
 * Written when a new pose analysis is accepted into the program.
 * Used by the tag lifecycle evaluator to determine retirement and escalation.
 */
export type AssessmentSnapshot = {
  /** ISO timestamp of when the assessment was taken (user-device time). */
  timestamp: string;
  /** Phase index at time of assessment. */
  phase: number;
  /** Overall pose confidenceScore from poseAnalyzer. */
  confidenceScore: number;
  /** Per-tag measurement records. */
  observations: AssessmentObservationRecord[];
  /** Acceptance status of this snapshot. */
  status: "accepted" | "insufficient_confidence" | "user_retook";
};

/**
 * Phase 4 — Tag lifecycle state for a single focus tag.
 * Persisted per-tag to track retest history and retirement decisions.
 */
export type FocusTagLifecycleState = {
  focusTag: string;
  /** Timestamp of first detection. */
  firstSeenAt: string;
  /**
   * Retirement decision, if any.
   * Written when retirement conditions are met.
   */
  retiredAt?: string;
  retirementTrace?: string;
  /**
   * Escalation decision, if any.
   * Written when a retest shows ≥20% worse than baseline on high-confidence photo.
   */
  escalatedAt?: string;
  escalationTrace?: string;
  /** Number of corrective emphasis bumps applied (bounded; max 1 per retest). */
  escalationBumps: number;
};

// ---------------------------------------------------------------------------
// Phase 4 — Retest cadence constants
// ---------------------------------------------------------------------------

/** Prompt for retest every N sessions if no phase transition has occurred first. */
export const RETEST_SESSION_CADENCE = 28;

/** Retirement: metric must be ≥ this fraction BELOW threshold (strong clear). */
export const RETIREMENT_STRONG_CLEAR_FACTOR = 0.15;

/** Escalation: metric must be ≥ this fraction ABOVE baseline to bump corrective emphasis. */
export const ESCALATION_WORSE_FACTOR = 0.20;

// ---------------------------------------------------------------------------
// Phase 4 — Assessment history
// ---------------------------------------------------------------------------

/**
 * Computes the tag lifecycle state from a list of assessment snapshots.
 *
 * Retirement conditions:
 *   (a) 2 consecutive retests show metric clears its threshold, OR
 *   (b) 1 retest shows metric ≥15% under threshold (strong clear).
 *
 * Escalation condition:
 *   A retest shows metric ≥20% worse than baseline on a high-confidence photo
 *   (confidenceScore ≥ CONFIDENCE_FLOOR).  Bounded to 1 bump per retest.
 *
 * Deterministic: evaluates from persisted history only, no Date.now().
 */
export function computeFocusTagLifecycleUpdate(params: {
  focusTag: string;
  baselineSnapshot: AssessmentSnapshot;
  retestSnapshots: AssessmentSnapshot[];
  /** Timestamp to use for retiredAt / escalatedAt writes. */
  evaluatedAt: string;
  priorState?: FocusTagLifecycleState;
}): FocusTagLifecycleState {
  const { focusTag, baselineSnapshot, retestSnapshots, evaluatedAt, priorState } = params;

  const prior: FocusTagLifecycleState = priorState ?? {
    focusTag,
    firstSeenAt: baselineSnapshot.timestamp,
    escalationBumps: 0,
  };

  if (prior.retiredAt) {
    return prior;
  }

  const baseline = baselineSnapshot.observations.find((obs) => obs.focusTag === focusTag);
  if (!baseline) {
    return prior;
  }

  let consecutiveClears = 0;
  let escalationApplied = false;
  const updatedBumps = prior.escalationBumps;

  for (const snapshot of retestSnapshots) {
    const obs = snapshot.observations.find((o) => o.focusTag === focusTag);
    if (!obs) continue;

    const metricClears = obs.measuredValue < obs.threshold;
    const strongClear = obs.measuredValue <= obs.threshold * (1 - RETIREMENT_STRONG_CLEAR_FACTOR);
    const highConfidence = snapshot.confidenceScore >= 0.55;

    if (metricClears) {
      consecutiveClears += 1;

      if (strongClear) {
        const retirementTrace = `${focusTag} focus retired — strong clear: metric ${obs.measuredValue.toFixed(3)} ≥${(RETIREMENT_STRONG_CLEAR_FACTOR * 100).toFixed(0)}% under threshold ${obs.threshold} — corrective slot reallocated.`;
        return { ...prior, retiredAt: evaluatedAt, retirementTrace, escalationBumps: updatedBumps };
      }

      if (consecutiveClears >= 2) {
        const firstRetestTs = retestSnapshots[0]?.timestamp ?? evaluatedAt;
        const retirementTrace = `${focusTag} focus retired — retest cleared threshold on [${firstRetestTs} → ${evaluatedAt}] — corrective slot reallocated.`;
        return { ...prior, retiredAt: evaluatedAt, retirementTrace, escalationBumps: updatedBumps };
      }
    } else {
      consecutiveClears = 0;

      if (
        highConfidence &&
        !escalationApplied &&
        obs.measuredValue >= baseline.measuredValue * (1 + ESCALATION_WORSE_FACTOR)
      ) {
        escalationApplied = true;
        const escalationTrace = `${focusTag} corrective emphasis bumped — retest metric ${obs.measuredValue.toFixed(3)} ≥${(ESCALATION_WORSE_FACTOR * 100).toFixed(0)}% worse than baseline ${baseline.measuredValue.toFixed(3)} — bump ${updatedBumps + 1}.`;
        return {
          ...prior,
          escalatedAt: evaluatedAt,
          escalationTrace,
          escalationBumps: updatedBumps + 1,
        };
      }
    }
  }

  return { ...prior, escalationBumps: updatedBumps };
}

/**
 * Returns true if a retest prompt should be shown, given session count and
 * whether a phase transition just occurred.
 *
 * Deterministic: uses sessionCount as the trigger, NOT Date.now().
 */
export function shouldPromptRetest(params: {
  sessionCount: number;
  phaseTransitionOccurred: boolean;
  lastRetestSessionCount: number;
}): boolean {
  const { sessionCount, phaseTransitionOccurred, lastRetestSessionCount } = params;
  if (phaseTransitionOccurred) return true;
  const sessionsSinceLastRetest = sessionCount - lastRetestSessionCount;
  return sessionsSinceLastRetest >= RETEST_SESSION_CADENCE;
}

// ---------------------------------------------------------------------------
// Phase 4 — Assessment history on Program
// ---------------------------------------------------------------------------

// See Program.assessmentHistory below.

/**
 * The result of evaluating a single gating criterion at a given session.
 * Stored in PhaseTransitionState.criteriaLastEvaluated for display and
 * for deterministic re-evaluation.
 */
export type GatingCriterionResult = {
  criterion: string;
  satisfied: boolean;
  /**
   * Human-readable explanation of why the criterion was satisfied or not.
   * Follows the format "N/M [label]" so the UI can surface it directly.
   */
  reason: string;
};

/**
 * Phase 3.5 — Persisted phase-gating state.
 *
 * Written by the gating evaluator at each session boundary.  Read by:
 *   - program.ts (to decide whether to auto-advance phaseIndex)
 *   - Phase 5 UI (to surface readiness display and retest flags)
 *   - Phase 3.3 maintain-mode prompt extension (to include readiness reason)
 *
 * One-way flow: the evaluator READS Phase 3/3.2/3.3 state and WRITES only
 * this type.  No Phase 3/3.2/3.3 logic is modified.
 */
export type PhaseTransitionState = {
  /** Phase being evaluated ("activation" | "skill" | "growth"). */
  phase: "activation" | "skill" | "growth";
  /** Total sessions completed in this phase (counter). */
  sessionsInPhase: number;
  /** Snapshot of criterion results from the most recent evaluation. */
  criteriaLastEvaluated: GatingCriterionResult[];
  /**
   * Session count at which criteria + minimum were first both satisfied.
   * Undefined until that point is reached.
   */
  eligibleAt?: number;
  /**
   * Session count at which an actual phase transition was recorded.
   * Set when the evaluator emits verdict === "advance".
   * Undefined until then.
   */
  unlockedAt?: number;
  /**
   * Human-readable trace of the most recent verdict, including every
   * criterion's verdict with numbers (for determinism testing and display).
   */
  lastTrace: string;
  /**
   * Phase 5 hook: exercises flagged for retest offer at the next session.
   * Written by the evaluator at every phase transition.  Cleared by the
   * Phase 5 UI when the user acts on them.
   */
  sacrificeRetestEligible?: Array<{
    exerciseId: string;
    sacrificedAtPhase: "activation" | "skill" | "growth";
    trace: string;
  }>;
};

/**
 * Phase 3.5 — Verdict returned by computeReadinessVerdict().
 * "advance" = criteria met + minimum passed, or maximum reached.
 * "hold"    = criteria not yet met or minimum not yet passed.
 */
export type GatingVerdict = {
  verdict: "advance" | "hold";
  reason: "criteria_met" | "max_reached" | "criteria_unmet" | "min_not_reached";
  criteriaResults: GatingCriterionResult[];
  satisfiedCount: number;
  requiredCount: number;
  trace: string;
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
  /**
   * Phase 3.5 — Persisted gating state for the current phase.
   * Written by computeReadinessVerdict(); undefined on programs generated
   * before Phase 3.5.
   */
  phaseTransitionState?: PhaseTransitionState;
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
