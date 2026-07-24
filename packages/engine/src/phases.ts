export type PhasePlan = {
  name: string;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  weekCount: number;
  goal: string;
};

type TrainingStage = "onramp" | "build" | "push" | "deload" | "rebuild";

export type UserTrainingState = {
  stage: TrainingStage;
  readiness: number;
  consistency: number;
  painRisk: number;
  fatigueRisk: number;
  movementQuality: number;
  capacity: number;
  confidence: number;
  trend: "up" | "flat" | "down";
  reason: string;
};

export type NextWeekPlan = {
  summary: string;
  change: string;
  reason: string;
};

export type PhaseProfile = {
  key: string;
  label: string;
  description: string;
  repBias: "lower" | "moderate" | "higher";
  intensity: "low" | "moderate" | "high";
  controlFocus: boolean;
};

export const MIN_PHASE_INDEX = 1;
export const MAX_PHASE_INDEX = 3;

const PHASE_PROFILES: PhaseProfile[] = [
  {
    key: "control",
    label: "Control & Technique",
    description: "Slow tempo, position control, clean movement.",
    repBias: "higher",
    intensity: "low",
    controlFocus: true,
  },
  {
    key: "capacity",
    label: "Hypertrophy & Capacity",
    description: "Moderate loads, more volume, steady effort.",
    repBias: "moderate",
    intensity: "moderate",
    controlFocus: false,
  },
  {
    key: "strength",
    label: "Strength Focus",
    description: "Lower reps, longer rest, higher effort.",
    repBias: "lower",
    intensity: "high",
    controlFocus: false,
  },
  {
    key: "strength-volume",
    label: "Strength + Volume",
    description: "Strength work with an extra set for capacity.",
    repBias: "moderate",
    intensity: "high",
    controlFocus: false,
  },
  {
    key: "performance",
    label: "Performance & Power",
    description: "Explosive intent, crisp reps, athletic emphasis.",
    repBias: "lower",
    intensity: "high",
    controlFocus: false,
  },
  {
    key: "deload",
    label: "Deload & Refine",
    description: "Reduced volume, sharpen technique, recover.",
    repBias: "higher",
    intensity: "low",
    controlFocus: true,
  },
];

const ACTIVE_PHASE_PROFILES = PHASE_PROFILES.slice(0, MAX_PHASE_INDEX);

const clampPhaseIndex = (phaseIndex: number) => {
  if (!Number.isFinite(phaseIndex)) return MIN_PHASE_INDEX;
  return Math.min(MAX_PHASE_INDEX, Math.max(MIN_PHASE_INDEX, Math.floor(phaseIndex)));
};

export const getPhaseProfile = (phaseIndex: number) => {
  const index = clampPhaseIndex(phaseIndex);
  return ACTIVE_PHASE_PROFILES[index - 1] ?? ACTIVE_PHASE_PROFILES[0];
};

export const getCycleLadder = (cycleIndex: number) => {
  const index = Math.max(1, cycleIndex);
  const mod = (index - 1) % 4;
  if (mod === 3) {
    return {
      label: "Deload",
      setsDelta: -1,
      repsDelta: -1,
      restDelta: 10,
      tempo: "slow",
    };
  }
  return {
    label: mod === 0 ? "Base" : mod === 1 ? "Build" : "Push",
    setsDelta: mod === 0 ? 0 : 1,
    repsDelta: mod === 0 ? 0 : 1,
    restDelta: mod === 0 ? 0 : -5,
    tempo: mod === 2 ? "controlled" : undefined,
  };
};

export const buildNextWeekPlan = (params: {
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  phaseName: string;
  trainingState?: UserTrainingState;
}): NextWeekPlan => {
  const { complianceRate, painFlag, fatigueFlag, phaseName, trainingState } =
    params;

  if (trainingState?.painRisk && trainingState.painRisk >= 0.65) {
    return {
      summary: "Next week: reduce stress and rebuild comfortable mechanics.",
      change: "Lower volume/load and bias tempo + mobility for symptom-free reps.",
      reason: trainingState.reason,
    };
  }

  if (trainingState?.fatigueRisk && trainingState.fatigueRisk >= 0.65) {
    return {
      summary: "Next week: hold loading and recover while keeping rhythm.",
      change: "Keep load stable, trim 1 set on harder movements, prioritize quality.",
      reason: trainingState.reason,
    };
  }

  if (trainingState?.readiness && trainingState.readiness >= 0.75) {
    return {
      summary: "Next week: progress one variable on priority lifts.",
      change: "Add a rep, load, density, or tempo challenge where quality stayed high.",
      reason: trainingState.reason,
    };
  }

  if (painFlag) {
    return {
      summary:
        "Next week: regress intensity and prioritize comfortable movement.",
      change: "Reduce range or load on 1–2 exercises; add extra mobility.",
      reason: "Pain flagged last week—ease to a simpler version to keep this smooth.",
    };
  }

  if (fatigueFlag) {
    return {
      summary: "Next week: hold load and focus on control.",
      change: "Keep weights the same; aim for cleaner reps or tempo work.",
      reason: "Fatigue was high—hold load and refine technique.",
    };
  }

  if (complianceRate >= 0.75) {
    return {
      summary: "Next week: progress one variable on 1–2 lifts.",
      change: "Add 1–2 reps or a small load bump within your range.",
      reason: `Strong compliance in ${phaseName}.`,
    };
  }

  return {
    summary: "Next week: repeat this week and build consistency.",
    change: "Keep targets steady; focus on showing up.",
    reason: "Consistency first before adding stress.",
  };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const deriveUserTrainingState = (params: {
  phaseIndex: number;
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  movementQuality?: number;
  confidence?: number;
  capacity?: number;
  priorReadiness?: number;
}): UserTrainingState => {
  const {
    phaseIndex,
    complianceRate,
    painFlag,
    fatigueFlag,
    movementQuality,
    confidence,
    capacity,
    priorReadiness,
  } = params;
  const profile = getPhaseProfile(phaseIndex);
  const stage: TrainingStage =
    profile.key === "control"
      ? "onramp"
      : profile.key === "capacity"
      ? "build"
      : profile.key === "deload"
      ? "deload"
      : profile.key === "strength" || profile.key === "performance"
      ? "push"
      : "rebuild";

  const consistency = clamp01(complianceRate);
  const painRisk = painFlag ? 1 : 0;
  const fatigueRisk = fatigueFlag ? 0.8 : 0.2;
  const quality = clamp01(movementQuality ?? (painFlag ? 0.3 : 0.7));
  const userConfidence = clamp01(confidence ?? (consistency >= 0.75 ? 0.75 : 0.55));
  const workCapacity = clamp01(capacity ?? (consistency >= 0.75 ? 0.75 : 0.6));

  const rawReadiness =
    consistency * 0.35 +
    quality * 0.25 +
    userConfidence * 0.2 +
    workCapacity * 0.2 -
    painRisk * 0.35 -
    fatigueRisk * 0.15;
  const readiness = clamp01(rawReadiness);

  const trend =
    typeof priorReadiness === "number"
      ? readiness - priorReadiness >= 0.08
        ? "up"
        : priorReadiness - readiness >= 0.08
        ? "down"
        : "flat"
      : "flat";

  const reason = painFlag
    ? "Pain risk is elevated, so the plan should downshift and rebuild control."
    : fatigueFlag
    ? "Fatigue risk is elevated, so hold intensity and recover while keeping consistency."
    : readiness >= 0.75
    ? "Readiness is high with stable consistency, so progression is appropriate."
    : consistency < 0.5
    ? "Consistency is still building, so repeat and stabilize before adding stress."
    : "Readiness is moderate; progress conservatively while refining movement quality.";

  return {
    stage,
    readiness,
    consistency,
    painRisk,
    fatigueRisk,
    movementQuality: quality,
    capacity: workCapacity,
    confidence: userConfidence,
    trend,
    reason,
  };
};

export const decideProgramProgression = (params: {
  state: UserTrainingState;
  phaseIndex: number;
  cycleIndex: number;
  phaseWeekIndex: number;
  totalWeekIndex: number;
  minimumWeeksForPhaseAdvance?: number;
}) => {
  const {
    state,
    phaseIndex,
    cycleIndex,
    phaseWeekIndex,
    totalWeekIndex,
    minimumWeeksForPhaseAdvance = 2,
  } = params;
  const normalizedPhaseIndex = clampPhaseIndex(phaseIndex);
  const normalizedCycleIndex = Math.max(1, cycleIndex);
  const normalizedPhaseWeekIndex = Math.max(1, phaseWeekIndex);
  const normalizedTotalWeekIndex = Math.max(1, totalWeekIndex);
  if (state.painRisk >= 0.65) {
    return {
      status: "blocked" as const,
      message: "Address pain first before progressing.",
      next: null,
    };
  }

  if (state.consistency < 0.5 || state.fatigueRisk >= 0.65) {
    return {
      status: "repeat" as const,
      message:
        state.fatigueRisk >= 0.65
          ? "Fatigue is high. Repeat with reduced stress this week."
          : "Repeat this week to build consistency.",
      next: null,
    };
  }

  const shouldAdvancePhase =
    normalizedCycleIndex >= 3 &&
    state.readiness >= 0.75 &&
    normalizedTotalWeekIndex >= minimumWeeksForPhaseAdvance;
  if (shouldAdvancePhase) {
    if (normalizedPhaseIndex >= MAX_PHASE_INDEX) {
      return {
        status: "advanced" as const,
        message: null,
        next: {
          phaseIndex: MAX_PHASE_INDEX,
          cycleIndex: normalizedCycleIndex + 1,
          weekIndex: normalizedPhaseWeekIndex + 1,
          totalWeekIndex: normalizedTotalWeekIndex + 1,
        },
      };
    }
    return {
      status: "advanced" as const,
      message: null,
      next: {
        phaseIndex: normalizedPhaseIndex + 1,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: normalizedTotalWeekIndex + 1,
      },
    };
  }

  return {
    status: "advanced" as const,
    message: null,
    next: {
      phaseIndex: normalizedPhaseIndex,
      cycleIndex: normalizedCycleIndex + 1,
      weekIndex: normalizedPhaseWeekIndex + 1,
      totalWeekIndex: normalizedTotalWeekIndex + 1,
    },
  };
};

export const getPhaseMetaByIndex = (phaseIndex: number) => {
  const index = clampPhaseIndex(phaseIndex);
  const profile = getPhaseProfile(index);
  return {
    phaseIndex: index,
    phaseName: `Phase ${index}: ${profile.label}`,
    goal: profile.description,
  };
};

/**
 * Canonical user-facing phase label. Prefer this over any
 * "activation" / "skill" / "growth" string in UI.
 *
 * Convention (Phase 6g Commit 3 characterization —
 * packages/engine/tests/unit/phaseVocabularyConvention.test.ts):
 *   - `phaseIndex` is 1-based in the live write path when callers pass
 *     getPhaseMetaByIndex's world (1 | 2 | 3).
 *   - `rungAdvancementHistory[].atPhase` is a pass-through of that
 *     phaseIndex, so live climbs store 1 | 2 | 3.
 *   - `atPhase === 0` appears when generateWeeklyProgram omitted
 *     options.phaseIndex (`?? 0`) or in hand-authored fixtures; clamp
 *     treats 0 as Phase 1 so display never invents a "Phase 0".
 * Do not teach this helper a second (0-based) convention — normalize
 * at the write site instead.
 */
export const formatPhaseName = (phaseIndex: number): string =>
  getPhaseMetaByIndex(phaseIndex).phaseName;

/**
 * Tolerant reader for persisted curriculum-stage words
 * ("activation" | "skill" | "growth") written into LogPrefs.blockedAt.phase
 * and Program.phaseHistory[].phase / phaseTransitionState.
 *
 * Maps to the 1-based phaseIndex used by getPhaseMetaByIndex /
 * phaseIndexFromStage (selection). Does not rewrite stored records.
 * Unknown / empty input falls back to Phase 1.
 *
 * Note: the live phaseHistory write ternary in program.ts is off-by-one
 * relative to phaseStageFromIndex (characterization documents
 * 1→"skill", 2→"growth", 3→"activation"). This reader intentionally
 * uses the selection-canonical mapping (activation→1, skill→2, growth→3)
 * so display agrees with the hero. Historical records written by the
 * buggy ternary may mis-label; we do not invent a second mapping to
 * "undo" that without a migration.
 */
export const phaseIndexFromPersistedStage = (
  stage: string | number | null | undefined
): number => {
  if (typeof stage === "number" && Number.isFinite(stage)) {
    return clampPhaseIndex(stage);
  }
  const text = String(stage ?? "")
    .trim()
    .toLowerCase();
  if (text === "activation") return 1;
  if (text === "skill") return 2;
  if (text === "growth") return 3;
  // Also accept already-formatted display names / "Phase N" prefixes.
  const phaseMatch = text.match(/^phase\s*(\d+)/i);
  if (phaseMatch) return clampPhaseIndex(Number(phaseMatch[1]));
  return MIN_PHASE_INDEX;
};
