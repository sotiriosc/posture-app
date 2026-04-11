import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type {
  ExerciseLog,
  Program,
  ProgramDay,
  ProgramRoutineItem,
  ProgramSelectionDebugSource,
} from "@/lib/types";
import type { Exercise, ExerciseCategory } from "@/lib/exercises";
import { exerciseById, exercises, resolveExerciseHistoryIds } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import {
  isExerciseEligible,
  normalizeEquipmentSelection,
} from "@/lib/equipment";
import { derivePoseFocus } from "@/lib/engine/poseFocus";
import {
  MAX_PHASE_INDEX,
  deriveUserTrainingState,
  getCycleLadder,
  getPhaseMetaByIndex,
  getPhaseProfile,
} from "@/lib/phases";
import type { UserTrainingState } from "@/lib/phases";
import type { ExerciseFeedbackSummary } from "@/lib/logStore";
import type { PoseAnalysis, PoseMetrics } from "@/lib/poseAnalyzer";
import type { RandomFn } from "@/lib/seededRng";
import { resolveProgramVariationIndex as resolveProgramVariationIndexValue } from "@/lib/programVariationClient";
import {
  buildFinalSelectionTraceEmitter,
  finalizeWeeklyGenerationObservability,
  recordProgramSelectionAuditEntry,
  type ProgramSelectionAuditEntry,
  type ProgramSelectionAuditHook,
} from "@/lib/program/generationObservability";
import {
  normalizeWeekForProgramConstraints,
} from "@/lib/program/postGenerationPipeline";
import {
  buildProgramNextWeekPlan,
} from "@/lib/program/programAssembly";
import {
  finalizeAdvancedProgressionResult,
  finalizeWeeklyProgramResult,
  type ProgramConstraintWarning,
} from "@/lib/program/programFinalization";
import {
  DEFAULT_PROGRAM_VARIATION_CONFIG,
  createProgramVariationMemoryRuntime,
  type ProgramVariationConfig,
  type ProgramVariationState,
} from "@/lib/program/programVariationMemory";
import {
  buildBaseProgressedProgram,
  resolveProgressionFeedbackInputs,
  resolveProgressionRuntimeContext,
  runApprovedProgressionPipeline,
} from "@/lib/program/progressionExecution";
import { buildProgressionPipelineCallbacks } from "@/lib/program/progressionPipelineAdapters";
import {
  resolveWeeklyFeedbackInputs,
  resolveWeeklyRuntimeContext,
  runWeeklyGenerationPipeline,
} from "@/lib/program/weeklyExecution";
import {
  buildWeeklyPipelineCallbacks,
  resolveWeeklyRepairContext,
} from "@/lib/program/weeklyPipelineAdapters";
import {
  composeWeeklyDeterministicSelectionSeed,
  composeWeeklyDeterministicSelectionSeedBase,
  resolveVariationPoseFocusTags,
} from "@/lib/program/variationRuntime";
import {
  buildWarmupForDay,
  deriveDayIntentFromProgramDay,
} from "@/lib/program/warmupPlanner";
import {
  deriveProgramProgressionState,
  evaluateNextCycleProgression,
  evaluateNextPhaseProgression,
} from "@/lib/program/progressionTransition";
import {
  get3DayBackChestVerticalFallbackIds,
  get3DayMainLanePlan,
  get3DayTemplateCounts,
  type ThreeDayMainLanePlanEntry,
} from "@/lib/program/dayTemplates";

const nowIso = () => new Date().toISOString();
const MIN_WEEKS_FOR_PHASE_ADVANCE = 2;
export const PROGRAM_TEMPLATE_VERSION = 13;
const clampPhaseIndexToSupportedRange = (phaseIndex: number) =>
  Math.min(MAX_PHASE_INDEX, Math.max(1, Math.floor(phaseIndex)));

type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

type ExperienceProfile = {
  level: ExperienceLevel;
  mainSets: string;
  accessorySets: string;
  mainRepRange: string;
  accessoryRepRange: string;
  mainRestSec: number;
  accessoryRestSec: number;
  warmupSets: string;
  cooldownSets: string;
  mainLaneCount: number;
  accessoryCount: number;
  allowAdvancedCompounds: boolean;
};

type ProgressionPolicy = {
  allowDemandIncrease: boolean;
  maxDemandUpgradesPerDay: number;
  setsDelta: number;
  repsDelta: number;
  durationDeltaSec: number;
  restDeltaSec: number;
  minRestSec: number;
};

type PainSeverity = "low" | "medium" | "high";
type ProgramPhaseStage = "activation" | "skill" | "growth";
export type EquipmentCapabilityMode = "noneOnly" | "bandOnly" | "hasLoad";
type NormalizedExperienceLevel = "beginner" | "intermediate" | "advanced";

type PainRuleDefinition = {
  preferredTags: string[];
  preferredPatterns: string[];
  deprioritizeTags: string[];
  deprioritizePatterns: string[];
  substitutionPreferredIds: string[];
  substitutionPreferredTags: string[];
  substitutionPreferredPatterns: string[];
  substitutionDeprioritizeTags: string[];
  substitutionDeprioritizePatterns: string[];
  avoidOverheadWhenPainful?: boolean;
};

type IntentPrimaryGoal = "posture" | "hypertrophy" | "strength" | "general";
type IntentPhase = ProgramPhaseStage;
type IntentEquipmentMode = "none" | "bands" | "gym";
type RecoveryBudget = "low" | "medium" | "high";

export type ProgramIntentNeeds = {
  needsScapularControl: boolean;
  needsHipHingeRepattern: boolean;
  needsCoreAntiRotation: boolean;
  needsCalves: boolean;
  needsArmsIsolation: boolean;
  needsThoracicExtension: boolean;
};

export type ProgramIntentProfile = {
  primaryGoal: IntentPrimaryGoal;
  painSeverity: PainSeverity;
  painAreas: string[];
  experienceLevel: NormalizedExperienceLevel;
  phase: IntentPhase;
  equipment: IntentEquipmentMode;
  recoveryBudget: RecoveryBudget;
  priorityPatterns: string[];
  avoidPatterns: string[];
  needs: ProgramIntentNeeds;
};

export type ProgramVariationOptions = {
  seed?: string;
  variationIndex?: number;
  index?: number;
  useRecentMemory?: boolean;
  settingsHash?: string;
  recentGenerationSummary?: ProgramRecentGenerationSummary;
};

export type ProgramDayKey =
  | "day1_back_chest"
  | "day2_shoulders_arms"
  | "day3_legs_abs";

export type GenerationContext = {
  settingsHash: string;
  variationIndex: number;
  recent?: ProgramRecentGenerationSummary | null;
};

export type GenerationSettingsFingerprint = {
  goal: string;
  experience: string;
  daysPerWeek: number;
  equipment: string[];
  painAreas: string[];
  poseFocusTags?: string[];
  phaseIndex?: number;
};

export type ProgramRecentGenerationPhaseSummary = {
  phase: 1 | 2 | 3;
  routineIds: string[];
  accessoryIds: string[];
  routineFamilyKeys: string[];
  accessoryFamilyKeys: string[];
  routineVariantKeys: string[];
  accessoryVariantKeys: string[];
};

export type ProgramRecentGenerationDaySummary = {
  templateKey?: string;
  phaseSummaries?: ProgramRecentGenerationPhaseSummary[];
  // Backward-compatible shape support.
  routineIds?: string[];
  accessoryIds?: string[];
  familyKeys?: string[];
  variantKeys?: string[];
};

export type ProgramRecentGenerationSummary = {
  settingsHash?: string;
  variationIndex?: number;
  generatedAt?: number;
  // Backward-compatible legacy field support.
  phaseIndex?: number;
  days?:
    | (Partial<Record<ProgramDayKey, ProgramRecentGenerationDaySummary>> &
        Record<string, ProgramRecentGenerationDaySummary | undefined>)
    | Record<string, ProgramRecentGenerationDaySummary | undefined>;
  exerciseIds?: string[];
  familyKeys?: string[];
  variantKeys?: string[];
  dayTemplateKeys?: Record<string, string>;
};

type SelectionContext = {
  painAreas: string[];
  painSeverity: PainSeverity;
  preferredTags: Set<string>;
  preferredPatterns: Set<string>;
  deprioritizeTags: Set<string>;
  deprioritizePatterns: Set<string>;
  poseFocusTags: Set<string>;
  goal: string;
  phaseStage: ProgramPhaseStage;
  phaseName: string;
  experienceLevel: NormalizedExperienceLevel;
  capabilityMode: EquipmentCapabilityMode;
  intentProfile: ProgramIntentProfile;
  feedbackSummaryByExercise: Map<string, ExerciseFeedbackSummary>;
  recentlyUsedExerciseIds: Set<string>;
  feedbackPenaltyHints: Array<{
    exerciseId: string;
    movementPatterns: Set<string>;
    movementSignature: string;
  }>;
  variationState: ProgramVariationState | null;
};

const normalizeTagToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const stableHashUnit = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
};

const stableHashToken = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const POSE_FOCUS_TAG_ALIASES: Record<string, string[]> = {
  forward_head: [
    "forward_head",
    "neck_endurance",
    "posture_endurance",
    "tspine_extension",
  ],
  scapular_control: [
    "scapular_control",
    "scap_control",
    "scap",
    "upper_back",
  ],
  thoracic_extension: [
    "thoracic_extension",
    "tspine_extension",
    "t_spine",
    "upper_back",
  ],
  hip_stability: [
    "hip_stability",
    "glute_medius",
    "hip_extension",
    "stability",
    "balance",
    "core_stability",
  ],
};

const isPoseMetricsShape = (value: unknown): value is PoseMetrics => {
  if (!value || typeof value !== "object") return false;
  const metrics = value as Record<string, unknown>;
  return (
    "headForwardOffset" in metrics &&
    "scapularSymmetry" in metrics &&
    "torsoLeanAngle" in metrics &&
    "hipShift" in metrics
  );
};

const resolvePoseAnalysisFromSources = (params: {
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
}) => {
  if (params.poseAnalysis) return params.poseAnalysis;
  const reportCandidate = params.assessmentReport as unknown as {
    poseAnalysis?: unknown;
  } | null;
  const maybePose = reportCandidate?.poseAnalysis;
  if (!maybePose || typeof maybePose !== "object") return null;
  const metrics = (maybePose as { metrics?: unknown }).metrics;
  if (!isPoseMetricsShape(metrics)) return null;
  return maybePose as PoseAnalysis;
};

const normalizePainAreaToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const canonicalizePainArea = (value: string) => {
  const token = normalizePainAreaToken(value);
  if (token === "low_back" || token === "lower_back") return "lower back";
  if (token === "upper_back") return "upper back";
  if (token === "shoulder") return "shoulders";
  if (token === "hip") return "hips";
  if (token === "knee") return "knees";
  return token.replace(/_/g, " ");
};

const normalizeExperienceLevel = (value: string): NormalizedExperienceLevel => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "advanced") return "advanced";
  if (normalized === "intermediate") return "intermediate";
  return "beginner";
};

const experienceRankByLevel: Record<NormalizedExperienceLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const phaseStageRank: Record<ProgramPhaseStage, number> = {
  activation: 0,
  skill: 1,
  growth: 2,
};

const phaseStageFromIndex = (phaseIndex: number): ProgramPhaseStage => {
  if (phaseIndex <= 1) return "activation";
  if (phaseIndex === 2) return "skill";
  return "growth";
};

const phaseIndexFromStage = (phaseStage: ProgramPhaseStage) =>
  phaseStage === "activation" ? 1 : phaseStage === "skill" ? 2 : 3;

const toExperienceLevelLabel = (
  experienceLevel: NormalizedExperienceLevel
): ExperienceLevel =>
  experienceLevel === "advanced"
    ? "Advanced"
    : experienceLevel === "intermediate"
    ? "Intermediate"
    : "Beginner";

const phaseStageFromName = (
  phaseName: string | null | undefined,
  fallbackPhaseIndex = 1
): ProgramPhaseStage => {
  const text = String(phaseName ?? "").toLowerCase();
  if (!text) return phaseStageFromIndex(fallbackPhaseIndex);
  if (text.includes("activation")) return "activation";
  if (text.includes("skill")) return "skill";
  if (text.includes("growth")) return "growth";
  if (text.includes("control") || text.includes("technique")) return "activation";
  if (text.includes("capacity") || text.includes("hypertrophy")) return "skill";
  if (text.includes("strength") || text.includes("performance") || text.includes("power")) {
    return "growth";
  }
  return phaseStageFromIndex(fallbackPhaseIndex);
};

const normalizePhaseMin = (
  value: Exercise["phaseMin"] | null | undefined
): ProgramPhaseStage => {
  if (value === "skill" || value === "growth") return value;
  return "activation";
};

const feedbackPainRank: Record<ExerciseFeedbackSummary["pain"], number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

const feedbackDifficultyRank: Record<ExerciseFeedbackSummary["difficulty"], number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  failed: 3,
};

const clampFeedbackCompletionRate = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

const deriveMovementSignature = (exercise: Exercise) => {
  const text = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (text.includes("row")) return "row";
  if (
    text.includes("pulldown") ||
    text.includes("pull-up") ||
    text.includes("pullup") ||
    text.includes("chin-up") ||
    text.includes("chinup") ||
    text.includes("lat")
  ) {
    return "vertical_pull";
  }
  if (text.includes("pushup") || text.includes("push-up")) return "pushup";
  if (text.includes("overhead") || text.includes("shoulder-press")) return "vertical_press";
  if (text.includes("bench") || text.includes("floor-press") || text.includes("chest-press")) {
    return "horizontal_press";
  }
  if (text.includes("fly")) return "fly";
  if (text.includes("rdl") || text.includes("good-morning") || text.includes("hip-thrust")) {
    return "hinge_loaded";
  }
  if (text.includes("squat")) return "squat";
  if (text.includes("lunge") || text.includes("split-squat") || text.includes("step-up")) {
    return "single_leg";
  }
  return normalizeTagToken(exercise.id);
};

const completionRateFromExerciseLog = (log: ExerciseLog) => {
  const planned = log.setsPlanned ?? 0;
  const completed = log.setsCompleted ?? 0;
  if (planned > 0) {
    return clampFeedbackCompletionRate(completed / planned);
  }
  if (completed > 0) return 1;
  return 0;
};

const painFromExerciseLog = (log: ExerciseLog): ExerciseFeedbackSummary["pain"] => {
  if (log.painLevel && log.painLevel !== "none") return log.painLevel;
  if (log.felt !== "pain") return "none";
  const completionRate = completionRateFromExerciseLog(log);
  const rpe = log.rpe ?? 0;
  if (completionRate <= 0.5 || rpe >= 9) return "severe";
  if (completionRate < 1 || rpe >= 8) return "moderate";
  return "mild";
};

const guidanceSignalsDeload = (guidance?: string | null) => {
  const normalized = String(guidance ?? "").toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes("reduce") ||
    normalized.includes("lighter load") ||
    normalized.includes("drop 1 set") ||
    normalized.includes("drop one set")
  );
};

const guidanceSignalsProgressionReadiness = (guidance?: string | null) => {
  const normalized = String(guidance ?? "").toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes("add small load") ||
    normalized.includes("add load") ||
    normalized.includes("add weight") ||
    normalized.includes("add small") ||
    normalized.includes("add reps")
  );
};

const difficultyFromExerciseLog = (
  log: ExerciseLog,
  pain: ExerciseFeedbackSummary["pain"]
): ExerciseFeedbackSummary["difficulty"] => {
  const completionRate = completionRateFromExerciseLog(log);
  if (completionRate < 0.6) return "failed";
  if (pain === "moderate" || pain === "severe") return "failed";
  if (guidanceSignalsDeload(log.nextTimeGuidance)) {
    return completionRate < 1 ? "failed" : "hard";
  }
  if (log.felt === "hard") return "hard";
  if (log.felt === "easy" || guidanceSignalsProgressionReadiness(log.nextTimeGuidance)) {
    return "easy";
  }
  return "normal";
};

const summarizeFeedbackFromLogs = (logs: ExerciseLog[]) => {
  const grouped = new Map<string, ExerciseLog[]>();
  logs
    .filter((log) => !log.deletedAt)
    .sort((left, right) => {
      const updatedOrder = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
      if (updatedOrder !== 0) return updatedOrder;
      const createdOrder = (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
      if (createdOrder !== 0) return createdOrder;
      return left.id.localeCompare(right.id);
    })
    .forEach((log) => {
      const key = log.exerciseId;
      const list = grouped.get(key) ?? [];
      if (list.length < 3) {
        list.push(log);
        grouped.set(key, list);
      }
    });

  const summaries = new Map<string, ExerciseFeedbackSummary>();
  Array.from(grouped.keys())
    .sort((left, right) => left.localeCompare(right))
    .forEach((exerciseId) => {
      const recent = grouped.get(exerciseId) ?? [];
      if (!recent.length) return;

      let worstPain: ExerciseFeedbackSummary["pain"] = "none";
      let completionTotal = 0;
      const difficultyCounts = new Map<ExerciseFeedbackSummary["difficulty"], number>();
      let hardOrFailedCount = 0;
      let failedCount = 0;

      recent.forEach((log) => {
        const pain = painFromExerciseLog(log);
        if (feedbackPainRank[pain] > feedbackPainRank[worstPain]) {
          worstPain = pain;
        }
        const difficulty = difficultyFromExerciseLog(log, pain);
        difficultyCounts.set(difficulty, (difficultyCounts.get(difficulty) ?? 0) + 1);
        if (difficulty === "hard" || difficulty === "failed") {
          hardOrFailedCount += 1;
        }
        if (difficulty === "failed") {
          failedCount += 1;
        }
        completionTotal += completionRateFromExerciseLog(log);
      });

      const majorityDifficulty = Array.from(difficultyCounts.entries()).sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        const rankDelta = feedbackDifficultyRank[right[0]] - feedbackDifficultyRank[left[0]];
        if (rankDelta !== 0) return rankDelta;
        return left[0].localeCompare(right[0]);
      })[0]?.[0] ?? "normal";
      const hasModerateOrWorsePain =
        feedbackPainRank[worstPain] >= feedbackPainRank.moderate;
      const difficulty: ExerciseFeedbackSummary["difficulty"] =
        hasModerateOrWorsePain || failedCount >= 2
          ? "failed"
          : hardOrFailedCount >= 2
          ? "hard"
          : majorityDifficulty;

      summaries.set(exerciseId, {
        exerciseId,
        pain: worstPain,
        difficulty,
        completionRate: clampFeedbackCompletionRate(completionTotal / recent.length),
      });
    });

  return summaries;
};

export const getPainSeverity = (questionnaire: QuestionnaireData): PainSeverity => {
  const painCount = questionnaire.painAreas.length;
  const reducePainGoal = questionnaire.goals.toLowerCase().includes("reduce pain");
  const beginner = questionnaire.experience === "Beginner";
  if (painCount >= 2 || (reducePainGoal && beginner)) {
    return "high";
  }
  if (painCount === 1) {
    return "medium";
  }
  return "low";
};

const EMPTY_PAIN_RULE: PainRuleDefinition = {
  preferredTags: [],
  preferredPatterns: [],
  deprioritizeTags: [],
  deprioritizePatterns: [],
  substitutionPreferredIds: [],
  substitutionPreferredTags: [],
  substitutionPreferredPatterns: [],
  substitutionDeprioritizeTags: [],
  substitutionDeprioritizePatterns: [],
};

export const PAIN_RULES: Record<string, PainRuleDefinition> = {
  neck: {
    preferredTags: ["t-spine", "scap", "breath", "core"],
    preferredPatterns: ["mobility", "pull", "core"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
    substitutionPreferredIds: [
      "dumbbell-floor-press",
      "split-stance-row",
      "band-row",
      "face-pull",
      "prone-ytw",
    ],
    substitutionPreferredTags: ["scap", "upper-back", "neck", "tempo", "stability"],
    substitutionPreferredPatterns: ["pull", "scapular", "mobility"],
    substitutionDeprioritizeTags: ["overhead", "max_strength", "advanced"],
    substitutionDeprioritizePatterns: ["verticalpush"],
    avoidOverheadWhenPainful: true,
  },
  "upper back": {
    preferredTags: ["upper-back", "scap", "t-spine"],
    preferredPatterns: ["pull", "mobility"],
    deprioritizeTags: [],
    deprioritizePatterns: [],
    substitutionPreferredIds: ["split-stance-row", "band-row", "face-pull", "prone-ytw"],
    substitutionPreferredTags: ["scap", "upper-back", "posture", "tempo"],
    substitutionPreferredPatterns: ["pull", "scapular", "mobility"],
    substitutionDeprioritizeTags: ["max_strength"],
    substitutionDeprioritizePatterns: [],
  },
  "lower back": {
    preferredTags: ["core", "tva", "posterior", "hinge"],
    preferredPatterns: ["core", "hinge"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
    substitutionPreferredIds: [
      "hip-hinge-drill",
      "glute-bridges",
      "dead-bug",
      "bird-dog",
      "back-extension",
      "single-leg-glute-bridge-hold",
    ],
    substitutionPreferredTags: [
      "core",
      "stability",
      "mobility",
      "tempo",
      "posterior",
    ],
    substitutionPreferredPatterns: ["hinge", "anti-extension", "core"],
    substitutionDeprioritizeTags: ["max_strength", "advanced"],
    substitutionDeprioritizePatterns: ["verticalpush"],
  },
  shoulders: {
    preferredTags: ["scap", "upper-back", "core"],
    preferredPatterns: ["pull", "core", "mobility"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
    substitutionPreferredIds: [
      "dumbbell-floor-press",
      "db-bench-press",
      "incline-db-press",
      "split-stance-row",
      "band-row",
      "face-pull",
    ],
    substitutionPreferredTags: ["scap", "upper-back", "stability", "tempo", "neutral_grip"],
    substitutionPreferredPatterns: ["pull", "scapular"],
    substitutionDeprioritizeTags: ["overhead", "max_strength", "advanced"],
    substitutionDeprioritizePatterns: ["verticalpush"],
    avoidOverheadWhenPainful: true,
  },
  hips: {
    preferredTags: ["hips", "glutes", "mobility", "balance"],
    preferredPatterns: ["hinge", "squat", "mobility"],
    deprioritizeTags: [],
    deprioritizePatterns: [],
    substitutionPreferredIds: ["glute-bridges", "single-leg-hip-thrust", "cossack-squat"],
    substitutionPreferredTags: ["mobility", "stability", "glutes"],
    substitutionPreferredPatterns: ["hinge", "single-leg", "mobility"],
    substitutionDeprioritizeTags: ["max_strength"],
    substitutionDeprioritizePatterns: [],
  },
  knees: {
    preferredTags: ["glutes", "hinge", "balance", "core"],
    preferredPatterns: ["hinge", "core", "mobility"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: ["squat"],
    substitutionPreferredIds: [
      "split-squat",
      "db-split-squat",
      "db-step-up",
      "heels-elevated-squat",
      "band-front-squat",
    ],
    substitutionPreferredTags: ["single-leg", "tempo", "stability", "mobility"],
    substitutionPreferredPatterns: ["single-leg", "squat", "hinge"],
    substitutionDeprioritizeTags: ["max_strength", "advanced"],
    substitutionDeprioritizePatterns: [],
  },
  low_back: {
    ...EMPTY_PAIN_RULE,
    preferredTags: ["core", "tva", "posterior", "hinge"],
    preferredPatterns: ["core", "hinge"],
    deprioritizeTags: ["advanced"],
    substitutionPreferredIds: [
      "hip-hinge-drill",
      "glute-bridges",
      "dead-bug",
      "bird-dog",
      "back-extension",
      "single-leg-glute-bridge-hold",
    ],
    substitutionPreferredTags: ["core", "stability", "mobility", "tempo", "posterior"],
    substitutionPreferredPatterns: ["hinge", "anti-extension", "core"],
    substitutionDeprioritizeTags: ["max_strength", "advanced"],
    substitutionDeprioritizePatterns: ["verticalpush"],
  },
};

const deriveIntentPrimaryGoal = (goal: string): IntentPrimaryGoal => {
  const normalized = goal.trim().toLowerCase();
  if (normalized.includes("posture")) return "posture";
  if (normalized.includes("athletic") || normalized.includes("strength")) {
    return "strength";
  }
  if (normalized.includes("hypertrophy") || normalized.includes("muscle")) {
    return "hypertrophy";
  }
  return "general";
};

const deriveIntentEquipmentMode = (
  capabilityMode: EquipmentCapabilityMode
): IntentEquipmentMode => {
  if (capabilityMode === "hasLoad") return "gym";
  if (capabilityMode === "bandOnly") return "bands";
  return "none";
};

const getQuestionnaireFatigueHint = (questionnaire: QuestionnaireData) => {
  const fatigueLike = (questionnaire as unknown as Record<string, unknown>)["tiredness"];
  if (typeof fatigueLike === "number") return fatigueLike;
  if (typeof fatigueLike === "string") {
    const parsed = Number(fatigueLike);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const buildProgramIntentProfile = (params: {
  questionnaire: QuestionnaireData;
  painSeverity: PainSeverity;
  phaseStage: ProgramPhaseStage;
  experienceLevel: NormalizedExperienceLevel;
  capabilityMode: EquipmentCapabilityMode;
}) => {
  const {
    questionnaire,
    painSeverity,
    phaseStage,
    experienceLevel,
    capabilityMode,
  } = params;
  const primaryGoal = deriveIntentPrimaryGoal(questionnaire.goals);
  const painAreas = questionnaire.painAreas.map(canonicalizePainArea);
  const fatigueHint = getQuestionnaireFatigueHint(questionnaire);
  const lowRecovery =
    painSeverity === "high" ||
    experienceLevel === "beginner" ||
    fatigueHint >= 0.65 ||
    primaryGoal === "posture";
  const highRecovery =
    painSeverity === "low" &&
    experienceLevel === "advanced" &&
    phaseStage === "growth" &&
    fatigueHint <= 0.35;
  const recoveryBudget: RecoveryBudget = lowRecovery
    ? "low"
    : highRecovery
    ? "high"
    : "medium";

  const hasShoulderOrNeckPain = painAreas.some((area) =>
    ["shoulders", "neck", "upper back"].includes(area)
  );
  const hasLowBackPain = painAreas.some((area) =>
    ["lower back", "low back", "hips"].includes(area)
  );

  const needs: ProgramIntentNeeds = {
    needsScapularControl:
      primaryGoal === "posture" || hasShoulderOrNeckPain || painSeverity !== "low",
    needsHipHingeRepattern:
      hasLowBackPain || experienceLevel === "beginner" || primaryGoal === "posture",
    needsCoreAntiRotation:
      hasLowBackPain || painSeverity !== "low" || primaryGoal === "posture",
    needsCalves: primaryGoal === "posture" || primaryGoal === "general",
    needsArmsIsolation:
      questionnaire.daysPerWeek === 3 ||
      primaryGoal === "hypertrophy" ||
      primaryGoal === "strength",
    needsThoracicExtension: primaryGoal === "posture" || hasShoulderOrNeckPain,
  };

  const priorityPatterns = (() => {
    const priorities: string[] = [];
    if (needs.needsScapularControl) priorities.push("scapular");
    if (needs.needsThoracicExtension) priorities.push("thoracic_extension");
    if (needs.needsHipHingeRepattern) priorities.push("hinge_control");
    if (needs.needsCoreAntiRotation) priorities.push("anti_rotation");
    if (primaryGoal === "strength") priorities.push("squat", "hinge", "push", "pull");
    else if (primaryGoal === "hypertrophy") priorities.push("push", "pull", "squat", "hinge");
    else priorities.push("push", "pull", "squat", "hinge");
    if (needs.needsCalves) priorities.push("calves");
    if (needs.needsArmsIsolation) priorities.push("arms_isolation");
    return Array.from(new Set(priorities));
  })();

  const avoidPatterns = (() => {
    const avoid = new Set<string>();
    if (hasShoulderOrNeckPain) {
      avoid.add("vertical_push_load");
      avoid.add("aggressive_overhead");
    }
    if (hasLowBackPain || painSeverity === "high") {
      avoid.add("heavy_hinge");
    }
    if (phaseStage === "activation" && experienceLevel !== "advanced") {
      avoid.add("advanced_complexity");
    }
    return Array.from(avoid);
  })();

  return {
    primaryGoal,
    painSeverity,
    painAreas,
    experienceLevel,
    phase: phaseStage,
    equipment: deriveIntentEquipmentMode(capabilityMode),
    recoveryBudget,
    priorityPatterns,
    avoidPatterns,
    needs,
  } satisfies ProgramIntentProfile;
};

const buildSelectionContext = (
  questionnaire: QuestionnaireData,
  poseAnalysis?: PoseAnalysis | null,
  assessmentReport?: AssessmentReport | null,
  options?: {
    phaseIndex?: number;
    phaseName?: string | null;
    capabilityMode?: EquipmentCapabilityMode;
    feedbackSummaryByExercise?: Map<string, ExerciseFeedbackSummary>;
    recentlyUsedExerciseIds?: Set<string>;
    variationState?: ProgramVariationState | null;
  }
): SelectionContext => {
  const painAreas = questionnaire.painAreas.map(canonicalizePainArea);
  const painSeverity = getPainSeverity(questionnaire);
  const preferredTags = new Set<string>();
  const preferredPatterns = new Set<string>();
  const deprioritizeTags = new Set<string>();
  const deprioritizePatterns = new Set<string>();
  const poseFocusTags = new Set<string>();
  const shouldDeprioritizeAdvancedTag =
    questionnaire.goals === "Reduce pain" || questionnaire.experience === "Beginner";

  painAreas.forEach((area) => {
    const rules = PAIN_RULES[area];
    if (!rules) return;
    rules.preferredTags.forEach((tag) => preferredTags.add(tag));
    rules.preferredPatterns.forEach((pattern) => preferredPatterns.add(pattern));
    rules.deprioritizeTags.forEach((tag) => {
      if (tag.toLowerCase() === "advanced" && !shouldDeprioritizeAdvancedTag) {
        return;
      }
      deprioritizeTags.add(tag);
    });
    rules.deprioritizePatterns.forEach((pattern) =>
      deprioritizePatterns.add(pattern)
    );
  });

  if (questionnaire.goals === "Improve posture") {
    ["scap", "upper-back", "t-spine", "core"].forEach((tag) => preferredTags.add(tag));
    ["pull", "core", "mobility"].forEach((pattern) => preferredPatterns.add(pattern));
  }
  if (questionnaire.goals === "Reduce pain") {
    ["core", "tva", "breath", "mobility"].forEach((tag) => preferredTags.add(tag));
    ["core", "mobility"].forEach((pattern) => preferredPatterns.add(pattern));
    ["advanced"].forEach((tag) => deprioritizeTags.add(tag));
  }

  const resolvedPoseAnalysis = resolvePoseAnalysisFromSources({
    poseAnalysis,
    assessmentReport,
  });
  const poseFocus = derivePoseFocus(resolvedPoseAnalysis);
  poseFocus.focusTags.forEach((tag) => {
    poseFocusTags.add(normalizeTagToken(tag));
  });

  const phaseIndex = clampPhaseIndexToSupportedRange(options?.phaseIndex ?? 1);
  const phaseName = options?.phaseName ?? `Phase ${phaseIndex}`;
  const phaseStage = phaseStageFromName(phaseName, phaseIndex);
  const capabilityMode = options?.capabilityMode ?? "noneOnly";
  const experienceLevel = normalizeExperienceLevel(questionnaire.experience);
  const intentProfile = buildProgramIntentProfile({
    questionnaire,
    painSeverity,
    phaseStage,
    experienceLevel,
    capabilityMode,
  });
  const feedbackSummaryByExercise = new Map(
    options?.feedbackSummaryByExercise ? Array.from(options.feedbackSummaryByExercise.entries()) : []
  );
  const recentlyUsedExerciseIds = new Set(
    options?.recentlyUsedExerciseIds
      ? Array.from(options.recentlyUsedExerciseIds.values())
      : []
  );
  const feedbackPenaltyHints = Array.from(feedbackSummaryByExercise.values())
    .filter(
      (summary) =>
        summary.pain === "moderate" ||
        summary.pain === "severe" ||
        summary.difficulty === "failed"
    )
    .map((summary) => {
      const exercise = exerciseById(summary.exerciseId);
      if (!exercise) return null;
      return {
        exerciseId: summary.exerciseId,
        movementPatterns: new Set(
          exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
        ),
        movementSignature: deriveMovementSignature(exercise),
      };
    })
    .filter(
      (
        hint
      ): hint is {
        exerciseId: string;
        movementPatterns: Set<string>;
        movementSignature: string;
      } => Boolean(hint)
    )
    .sort((left, right) => left.exerciseId.localeCompare(right.exerciseId));

  return {
    painAreas,
    painSeverity,
    preferredTags,
    preferredPatterns,
    deprioritizeTags,
    deprioritizePatterns,
    poseFocusTags,
    goal: questionnaire.goals,
    phaseStage,
    phaseName,
    experienceLevel,
    capabilityMode,
    intentProfile,
    feedbackSummaryByExercise,
    recentlyUsedExerciseIds,
    feedbackPenaltyHints,
    variationState: options?.variationState ?? null,
  };
};

const buildRecentlyUsedExerciseIdSet = (params?: {
  recentLogs?: ExerciseLog[];
  previousWeek?: ProgramDay[];
}) => {
  const recentlyUsedExerciseIds = new Set<string>();
  (params?.recentLogs ?? []).forEach((log) => {
    if (typeof log.exerciseId === "string" && log.exerciseId.length) {
      recentlyUsedExerciseIds.add(log.exerciseId);
    }
  });
  (params?.previousWeek ?? []).forEach((day) => {
    day.routine.forEach((item) => {
      if (typeof item.exerciseId === "string" && item.exerciseId.length) {
        recentlyUsedExerciseIds.add(item.exerciseId);
      }
    });
  });
  return recentlyUsedExerciseIds;
};

const getExperienceProfile = (
  experience: string,
  goal: string,
  phaseIndex = 1
): ExperienceProfile => {
  const level: ExperienceLevel =
    experience === "Advanced"
      ? "Advanced"
      : experience === "Intermediate"
      ? "Intermediate"
      : "Beginner";

  const painBias = goal === "Reduce pain";
  const phaseStage = phaseStageFromIndex(phaseIndex);

  if (level === "Advanced") {
    const mainSets = painBias
      ? phaseStage === "growth"
        ? "3-4"
        : "3"
      : phaseStage === "activation"
      ? "3-4"
      : "4-5";
    const accessorySets = painBias ? "2-3" : phaseStage === "growth" ? "3" : "3-4";
    const mainRepRange = painBias
      ? phaseStage === "growth"
        ? "5-8"
        : "6-10"
      : phaseStage === "growth"
      ? "4-6"
      : phaseStage === "skill"
      ? "5-8"
      : "6-10";
    const accessoryRepRange = painBias
      ? "8-12"
      : phaseStage === "growth"
      ? "6-10"
      : "8-12";
    const mainRestSec = painBias ? (phaseStage === "growth" ? 100 : 90) : phaseStage === "growth" ? 120 : 105;
    const accessoryRestSec = painBias ? 60 : phaseStage === "growth" ? 75 : 65;
    return {
      level,
      mainSets,
      accessorySets,
      mainRepRange,
      accessoryRepRange,
      mainRestSec,
      accessoryRestSec,
      warmupSets: "2",
      cooldownSets: "2",
      mainLaneCount: 4,
      accessoryCount: 3,
      allowAdvancedCompounds: true,
    };
  }

  if (level === "Intermediate") {
    const mainSets = painBias
      ? phaseStage === "growth"
        ? "3"
        : "2-3"
      : phaseStage === "growth"
      ? "3-4"
      : "3";
    const accessorySets = painBias ? "2" : phaseStage === "growth" ? "2-3" : "2";
    const mainRepRange = painBias
      ? "6-10"
      : phaseStage === "growth"
      ? "5-8"
      : phaseStage === "skill"
      ? "6-10"
      : "8-12";
    const accessoryRepRange = painBias ? "8-12" : phaseStage === "growth" ? "8-12" : "10-15";
    const mainRestSec = painBias ? 90 : phaseStage === "growth" ? 105 : 90;
    const accessoryRestSec = painBias ? 60 : phaseStage === "growth" ? 65 : 55;
    return {
      level,
      mainSets,
      accessorySets,
      mainRepRange,
      accessoryRepRange,
      mainRestSec,
      accessoryRestSec,
      warmupSets: "2",
      cooldownSets: "2",
      mainLaneCount: 3,
      accessoryCount: 2,
      allowAdvancedCompounds: true,
    };
  }

  const beginnerMainSets = painBias
    ? "2"
    : phaseStage === "growth"
    ? "2-3"
    : "2";
  const beginnerMainReps = painBias
    ? "8-12"
    : phaseStage === "growth"
    ? "6-10"
    : "8-12";
  return {
    level,
    mainSets: beginnerMainSets,
    accessorySets: "2",
    mainRepRange: beginnerMainReps,
    accessoryRepRange: phaseStage === "growth" ? "8-12" : "10-15",
    mainRestSec: painBias ? 80 : phaseStage === "growth" ? 85 : 75,
    accessoryRestSec: 50,
    warmupSets: "2",
    cooldownSets: "1-2",
    mainLaneCount: 2,
    accessoryCount: 2,
    allowAdvancedCompounds: false,
  };
};

const clampDelta = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const buildProgressionPolicy = (params: {
  experienceLevel: ExperienceLevel;
  phaseIndex: number;
  cycleIndex: number;
  trainingState?: UserTrainingState;
}): ProgressionPolicy => {
  const { experienceLevel, phaseIndex, cycleIndex, trainingState } = params;
  const cycle = getCycleLadder(cycleIndex);
  const profile = getPhaseProfile(phaseIndex);
  const readiness = trainingState?.readiness ?? 0.65;
  const painRisk = trainingState?.painRisk ?? 0;
  const fatigueRisk = trainingState?.fatigueRisk ?? 0.2;
  const conservativeMode = painRisk >= 0.5 || fatigueRisk >= 0.6 || readiness < 0.5;
  const progressionMode =
    !conservativeMode && readiness >= 0.72 && painRisk < 0.35 && fatigueRisk < 0.5;

  const levelConfig =
    experienceLevel === "Advanced"
      ? {
          maxDemandUpgradesPerDay: progressionMode ? 3 : 2,
          minRestSec: 30,
          maxPositiveDurationDelta: 10,
          maxPositiveSetDelta: 1,
          maxPositiveRepDelta: 1,
        }
      : experienceLevel === "Intermediate"
      ? {
          maxDemandUpgradesPerDay: progressionMode ? 2 : 1,
          minRestSec: 35,
          maxPositiveDurationDelta: 10,
          maxPositiveSetDelta: 1,
          maxPositiveRepDelta: 1,
        }
      : {
          maxDemandUpgradesPerDay: progressionMode ? 1 : 0,
          minRestSec: 40,
          maxPositiveDurationDelta: 5,
          maxPositiveSetDelta: progressionMode ? 1 : 0,
          maxPositiveRepDelta: progressionMode ? 1 : 0,
        };

  const positiveSetCap = conservativeMode ? 0 : levelConfig.maxPositiveSetDelta;
  const positiveRepCap = conservativeMode ? 0 : levelConfig.maxPositiveRepDelta;
  const positiveDurationCap = conservativeMode ? 0 : levelConfig.maxPositiveDurationDelta;

  const setsDelta = clampDelta(cycle.setsDelta, conservativeMode ? -1 : 0, positiveSetCap);
  const repsDelta = clampDelta(cycle.repsDelta, conservativeMode ? -1 : 0, positiveRepCap);
  const durationDeltaSec = clampDelta(
    cycle.label === "Deload" ? -5 : 10,
    conservativeMode ? -5 : 0,
    positiveDurationCap
  );

  const intensityRestDelta =
    profile.intensity === "high" ? 10 : profile.intensity === "low" ? 5 : 0;
  const beginnerBuffer = experienceLevel === "Beginner" ? 5 : 0;
  const restDeltaSec = cycle.restDelta + intensityRestDelta + beginnerBuffer + (conservativeMode ? 10 : 0);

  return {
    allowDemandIncrease: !conservativeMode,
    maxDemandUpgradesPerDay: levelConfig.maxDemandUpgradesPerDay,
    setsDelta,
    repsDelta,
    durationDeltaSec,
    restDeltaSec,
    minRestSec: levelConfig.minRestSec,
  };
};

const pickBaselineFallbackExercise = (
  category: ExerciseCategory,
  loadType: ProgramRoutineItem["loadType"],
  available: Set<Equipment>,
  section: ProgramRoutineItem["section"] | undefined,
  context?: SelectionContext
) => {
  const eligible = exercises.filter(
    (exercise) =>
      exercise.category === category &&
      (context
        ? isExerciseEligibleForProgramContext({
            exercise,
            available,
            section,
            context,
          })
        : isExerciseEligible(exercise, available))
  );
  const loadTypeMatch = eligible.filter((exercise) => exercise.loadType === loadType);
  if (loadTypeMatch.length) return loadTypeMatch[0];
  if (eligible.length) return eligible[0];
  const noneFallback = exercises.filter(
    (exercise) =>
      exercise.category === category &&
      exercise.equipment.includes("none") &&
      (context
        ? isExerciseAllowedForSection(exercise, section) &&
          isEligibleForPhase(exercise, context.phaseName, context)
        : true)
  );
  return noneFallback[0] ?? exercises.find((exercise) => exercise.category === category) ?? null;
};

const highPainComfortTags = new Set([
  "motorcontrol",
  "motor_control",
  "mobility",
  "stability",
  "tempo",
]);

const highPainDemandTags = new Set(["max_strength", "maxstrength", "high_demand", "advanced"]);

const exerciseHasOverheadDemand = (exercise: Exercise) => {
  const normalizedTags = (exercise.tags ?? []).map(normalizeTagToken);
  return (
    exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "verticalpush") ||
    normalizedTags.some((tag) => tag.includes("overhead")) ||
    exercise.name.toLowerCase().includes("overhead")
  );
};

type SubstitutionCandidateScore = {
  exercise: Exercise;
  score: number;
  reasons: string[];
};

const getPainRulesForContext = (context?: SelectionContext) => {
  if (!context?.painAreas.length) return [] as PainRuleDefinition[];
  const rules: PainRuleDefinition[] = [];
  const seen = new Set<string>();
  context.painAreas.forEach((area) => {
    const canonical = canonicalizePainArea(area);
    if (seen.has(canonical)) return;
    seen.add(canonical);
    rules.push(PAIN_RULES[canonical] ?? PAIN_RULES[normalizePainAreaToken(canonical)] ?? EMPTY_PAIN_RULE);
  });
  return rules;
};

const scoreSubstitutionCandidate = (params: {
  candidate: Exercise;
  current: Exercise;
  section?: ProgramRoutineItem["section"];
  context?: SelectionContext;
}): SubstitutionCandidateScore => {
  const { candidate, current, context } = params;
  let score = 0;
  const reasons: string[] = [];

  const sharedPatterns = candidate.movementPattern.filter((pattern) =>
    current.movementPattern.includes(pattern)
  );
  if (sharedPatterns.length) {
    const delta = sharedPatterns.length * 3;
    score += delta;
    reasons.push(`+${delta} movement overlap`);
  }

  const sharedTags = (candidate.tags ?? []).filter((tag) =>
    (current.tags ?? []).includes(tag)
  );
  if (sharedTags.length) {
    const delta = sharedTags.length;
    score += delta;
    reasons.push(`+${delta} tag overlap`);
  }

  if (candidate.loadType === current.loadType) {
    score += 2;
    reasons.push("+2 matching load type");
  }

  if (context) {
    if (contraindicationHitsPainArea(candidate.contraindications, context.painAreas)) {
      score -= 12;
      reasons.push("-12 pain contraindication overlap");
    }

    const rules = getPainRulesForContext(context);
    const candidateTags = new Set([
      ...(candidate.tags ?? []).map(normalizeTagToken),
      ...(candidate.focusTags ?? []).map(normalizeTagToken),
    ]);
    const candidatePatterns = new Set(
      candidate.movementPattern.map((pattern) => normalizeTagToken(pattern))
    );

    rules.forEach((rule) => {
      if (rule.substitutionPreferredIds.includes(candidate.id)) {
        score += 6;
        reasons.push("+6 pain-specific preferred variant");
      }

      const preferredTagHits = rule.substitutionPreferredTags.filter((tag) =>
        candidateTags.has(normalizeTagToken(tag))
      );
      if (preferredTagHits.length) {
        const delta = preferredTagHits.length * 2;
        score += delta;
        reasons.push(`+${delta} pain-specific preferred tags`);
      }

      const preferredPatternHits = rule.substitutionPreferredPatterns.filter((pattern) =>
        candidatePatterns.has(normalizeTagToken(pattern))
      );
      if (preferredPatternHits.length) {
        const delta = preferredPatternHits.length * 2;
        score += delta;
        reasons.push(`+${delta} pain-specific preferred patterns`);
      }

      const deprioritizedTagHits = rule.substitutionDeprioritizeTags.filter((tag) =>
        candidateTags.has(normalizeTagToken(tag))
      );
      if (deprioritizedTagHits.length) {
        const delta = deprioritizedTagHits.length * 2;
        score -= delta;
        reasons.push(`-${delta} pain-specific deprioritized tags`);
      }

      const deprioritizedPatternHits = rule.substitutionDeprioritizePatterns.filter((pattern) =>
        candidatePatterns.has(normalizeTagToken(pattern))
      );
      if (deprioritizedPatternHits.length) {
        const delta = deprioritizedPatternHits.length * 2;
        score -= delta;
        reasons.push(`-${delta} pain-specific deprioritized patterns`);
      }

      if (rule.avoidOverheadWhenPainful && exerciseHasOverheadDemand(candidate)) {
        score -= 4;
        reasons.push("-4 overhead de-priority for painful shoulder/neck profiles");
      }
    });

    if (context.painSeverity === "high") {
      const comfortHits = Array.from(candidateTags).filter((tag) =>
        highPainComfortTags.has(tag)
      );
      if (comfortHits.length) {
        const delta = comfortHits.length * 2;
        score += delta;
        reasons.push(`+${delta} high-pain comfort tags`);
      }

      const demandHits = Array.from(candidateTags).filter((tag) =>
        highPainDemandTags.has(tag)
      );
      if (demandHits.length) {
        const delta = demandHits.length * 3;
        score -= delta;
        reasons.push(`-${delta} high-demand tags in high-pain profile`);
      }
    }
  }

  return { exercise: candidate, score, reasons };
};

const rankSubstitutionCandidates = (params: {
  current: Exercise;
  section?: ProgramRoutineItem["section"];
  available: Set<Equipment>;
  context?: SelectionContext;
}) => {
  const { current, section, available, context } = params;
  const poolById = new Map<string, Exercise>();

  (current.swapOptions ?? []).forEach((candidateId) => {
    const candidate = exerciseById(candidateId);
    if (!candidate) return;
    poolById.set(candidate.id, candidate);
  });

  exercises.forEach((candidate) => {
    if (candidate.id === current.id) return;
    if (candidate.category !== current.category) return;
    poolById.set(candidate.id, candidate);
  });

  return Array.from(poolById.values())
    .filter((candidate) => {
      if (!context) {
        return (
          isExerciseEligible(candidate, available) &&
          isExerciseAllowedForSection(candidate, section)
        );
      }
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available,
        section,
        context,
      });
    })
    .filter((candidate) => {
      const overlaps = candidate.movementPattern.some((pattern) =>
        current.movementPattern.includes(pattern)
      );
      return overlaps;
    })
    .map((candidate) =>
      scoreSubstitutionCandidate({
        candidate,
        current,
        section,
        context,
      })
    )
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });
};

export const previewPainSubstitutionChoices = (params: {
  questionnaire: QuestionnaireData;
  exerciseId: string;
  section?: ProgramRoutineItem["section"];
  limit?: number;
}) => {
  const { questionnaire, exerciseId, section, limit = 5 } = params;
  const current = exerciseById(exerciseId);
  if (!current) return [] as Array<{
    exerciseId: string;
    name: string;
    score: number;
    reasons: string[];
  }>;
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  const context = buildSelectionContext(questionnaire);
  return rankSubstitutionCandidates({
    current,
    section,
    available,
    context,
  })
    .slice(0, Math.max(1, limit))
    .map((entry) => ({
      exerciseId: entry.exercise.id,
      name: entry.exercise.name,
      score: Number(entry.score.toFixed(2)),
      reasons: entry.reasons,
    }));
};

const ensureEligibleItem = (
  item: ProgramRoutineItem,
  available: Set<Equipment>,
  selectionContext?: SelectionContext,
  dayTitle?: string
) => {
  const exercise = exerciseById(item.exerciseId);
  if (!exercise) return item;
  const failsPhaseEligibility = Boolean(
    selectionContext &&
      !isEligibleForPhase(exercise, selectionContext.phaseName, selectionContext)
  );
  const failsPainFilter =
    Boolean(selectionContext?.painAreas.length) &&
    contraindicationHitsPainArea(exercise.contraindications, selectionContext?.painAreas ?? []);
  if (
    (selectionContext
      ? isExerciseEligibleForProgramContext({
          exercise,
          available,
          section: item.section,
          context: selectionContext,
          dayTitle,
        })
      : isExerciseEligible(exercise, available)) &&
    !failsPainFilter &&
    !failsPhaseEligibility
  ) {
    return item;
  }

  const shouldUsePainAwareSubstitution =
    failsPainFilter || Boolean(selectionContext?.painAreas.length);
  const ranked = shouldUsePainAwareSubstitution
    ? rankSubstitutionCandidates({
        current: exercise,
        section: item.section,
        available,
        context: selectionContext,
      })
    : [];
  const shouldProtectMainIdentity =
    selectionContext &&
    dayTitle &&
    shouldApplyMainIdentityProtection({ available, context: selectionContext }) &&
    (isBackChestDayTitle(dayTitle) ||
      isShouldersArmsDayTitle(dayTitle) ||
      isLegsAbsDayTitle(dayTitle));
  const candidateAvoidsCurrentPain = (candidate: Exercise) =>
    !selectionContext?.painAreas.length ||
    !contraindicationHitsPainArea(candidate.contraindications, selectionContext.painAreas);
  const candidateIsStrictRoleReplacement = (candidate: Exercise) =>
    shouldProtectMainIdentity && selectionContext
      ? isRoleLegalForSlot({
          exercise: candidate,
          section: item.section,
          dayTitle,
          slotKind: item.selectionDebug?.slotKind,
          mainSlotLane: item.selectionDebug?.slotLane as MainLane | undefined,
          accessoryLane: item.selectionDebug?.slotLane as AccessoryLane | undefined,
          available,
          context: selectionContext,
        })
      : true;
  const candidatePreservesMainIdentity = (candidate: Exercise) =>
    shouldProtectMainIdentity && selectionContext
      ? isSameDayMainIdentityCandidate({
          exercise: candidate,
          section: item.section,
          dayTitle,
          available,
          context: selectionContext,
        })
      : true;
  const fallback =
    ranked.find((entry) => candidateAvoidsCurrentPain(entry.exercise) && candidateIsStrictRoleReplacement(entry.exercise))
      ?.exercise ??
    ranked.find((entry) => candidateAvoidsCurrentPain(entry.exercise) && candidatePreservesMainIdentity(entry.exercise))
      ?.exercise ??
    ranked.find((entry) => candidatePreservesMainIdentity(entry.exercise))?.exercise ??
    ranked[0]?.exercise ??
    pickBaselineFallbackExercise(
      exercise.category,
      exercise.loadType,
      available,
      item.section,
      selectionContext
    );
  if (!fallback) return item;
  return withSelectionDebug(
    {
      ...item,
      exerciseId: fallback.id,
      loadType: fallback.loadType,
      cues: buildProgramCues(fallback, item.section),
    },
    "eligibility_swap"
  );
};

const pickDistinctReplacement = (params: {
  item: ProgramRoutineItem;
  dayTitle?: string;
  usedIds: Set<string>;
  available: Set<Equipment>;
  context?: SelectionContext;
}) => {
  const { item, dayTitle, usedIds, available, context } = params;
  const current = exerciseById(item.exerciseId);
  if (!current) return null;
  const shouldEnforceRoleCompatibility =
    context &&
    shouldApplyMainIdentityProtection({ available, context }) &&
    (isBackChestDayTitle(dayTitle) ||
      isShouldersArmsDayTitle(dayTitle) ||
      isLegsAbsDayTitle(dayTitle));
  const isRoleCompatibleReplacement = (candidate: Exercise) =>
    shouldEnforceRoleCompatibility && context
      ? isRoleLegalForSlot({
          exercise: candidate,
          section: item.section,
          dayTitle,
          slotKind: item.selectionDebug?.slotKind,
          mainSlotLane: item.selectionDebug?.slotLane as MainLane | undefined,
          accessoryLane: item.selectionDebug?.slotLane as AccessoryLane | undefined,
          available,
          context,
        })
      : true;

  const swapCandidate =
    current.swapOptions
      ?.map((id) => exerciseById(id))
      .filter((candidate): candidate is Exercise => Boolean(candidate))
      .filter(
        (candidate) =>
          !usedIds.has(candidate.id) &&
          (context
            ? isExerciseEligibleForProgramContext({
                exercise: candidate,
                available,
                section: item.section,
                context,
                dayTitle,
              })
            : isExerciseEligible(candidate, available) &&
              isExerciseAllowedForSection(candidate, item.section)) &&
          isRoleCompatibleReplacement(candidate)
      )[0] ?? null;
  if (swapCandidate) return swapCandidate;

  const pool = exercises.filter((candidate) => {
    if (candidate.id === current.id) return false;
    if (usedIds.has(candidate.id)) return false;
    if (
      context
        ? !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section: item.section,
            context,
            dayTitle,
          })
        : !isExerciseEligible(candidate, available) ||
          !isExerciseAllowedForSection(candidate, item.section)
    ) {
      return false;
    }
    if (!isRoleCompatibleReplacement(candidate)) return false;
    if (candidate.category !== current.category) return false;
    return true;
  });
  const overlapPool = pool.filter((candidate) =>
    candidate.movementPattern.some((pattern) => current.movementPattern.includes(pattern))
  );
  if (overlapPool[0] ?? pool[0]) {
    return overlapPool[0] ?? pool[0] ?? null;
  }

  if (!context) return null;

  // As a last resort, preserve uniqueness even when pain/context filters are saturated.
  const relaxedPool = exercises.filter((candidate) => {
    if (candidate.id === current.id) return false;
    if (usedIds.has(candidate.id)) return false;
    if (!isExerciseEligible(candidate, available)) return false;
    if (!isExerciseAllowedForSection(candidate, item.section)) return false;
    if (!isRoleCompatibleReplacement(candidate)) return false;
    if (candidate.category !== current.category) return false;
    return true;
  });
  const relaxedOverlapPool = relaxedPool.filter((candidate) =>
    candidate.movementPattern.some((pattern) => current.movementPattern.includes(pattern))
  );
  return relaxedOverlapPool[0] ?? relaxedPool[0] ?? null;
};

const ensureDistinctRoutine = (
  day: ProgramDay,
  available: Set<Equipment>,
  context?: SelectionContext
): ProgramDay => {
  const usedIds = new Set<string>();
  const routine = day.routine.map((item) => {
    if (!usedIds.has(item.exerciseId)) {
      usedIds.add(item.exerciseId);
      return item;
    }
    const replacement = pickDistinctReplacement({
      item,
      dayTitle: day.title,
      usedIds,
      available,
      context,
    });
    if (!replacement) {
      return item;
    }
    usedIds.add(replacement.id);
    return withSelectionDebug(
      {
        ...item,
        exerciseId: replacement.id,
        loadType: replacement.loadType,
        cues: buildProgramCues(replacement, item.section),
      },
      "uniqueness_swap"
    );
  });
  return { ...day, routine };
};

const dedupeWeekForSelectionContext = (params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}) =>
  params.week.map((day) =>
    ensureDistinctRoutine(day, params.available, params.selectionContext)
  );

const normalizeWeekForSelectionContext = (params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}) =>
  normalizeWeekForProgramConstraints({
    week: params.week,
    available: params.available,
    selectionContext: params.selectionContext,
    resolveEligibilityAvailabilityForDay,
    ensureEligibleItem,
    ensureDistinctRoutine,
  });

const dedupeCues = (cues: string[]) => {
  const seen = new Set<string>();
  const next: string[] = [];
  cues.forEach((cue) => {
    const normalized = cue.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    next.push(cue.trim());
  });
  return next;
};

const buildProgramCues = (
  exercise: Exercise | undefined,
  section?: ProgramRoutineItem["section"]
) => {
  if (!exercise) return null;
  const cues = [...(exercise.cues ?? [])];
  const patternTokens = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tagTokens = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();

  if (section === "main" || section === "accessory") {
    if (descriptor.includes("lateral-raise") || descriptor.includes("lateral raise")) {
      cues.push("Use light dumbbells; stop before torso swing or shrugging.");
      cues.push("Raise in a smooth arc and lower for a full 2 seconds.");
    } else if (
      patternTokens.has("verticalpush") ||
      ((descriptor.includes("shoulder press") || descriptor.includes("overhead press")) &&
        tagTokens.has("shoulders"))
    ) {
      cues.push("Pick a load you can control without arching your lower back.");
      cues.push("Press straight up while keeping ribs stacked and neck relaxed.");
    } else if (patternTokens.has("push")) {
      cues.push("Control the lowering phase and stop 1-2 reps before form breaks.");
    } else if (patternTokens.has("pull")) {
      cues.push("Lead with elbows and pause briefly without shrugging.");
    } else if (patternTokens.has("squat") || patternTokens.has("hinge")) {
      cues.push("Own each eccentric with a steady brace and pain-free range.");
    } else if (
      patternTokens.has("core") ||
      patternTokens.has("anti_rotation") ||
      patternTokens.has("anti_extension") ||
      patternTokens.has("carry")
    ) {
      cues.push("Breathe behind the brace and keep ribcage stacked over pelvis.");
    }
  } else if (section === "warmup" || section === "activation") {
    cues.push("Move slowly enough to feel alignment, not momentum.");
  }

  return dedupeCues(cues).slice(0, 3);
};

const makeItem = (
  exerciseId: string,
  sets: string | number,
  reps?: string,
  durationSec?: number,
  restSec?: number,
  section?: ProgramRoutineItem["section"],
  selectionDebug?: ProgramRoutineItem["selectionDebug"]
): ProgramRoutineItem => {
  const exercise = exerciseById(exerciseId);
  return {
    exerciseId,
    section,
    sets,
    reps: reps ?? null,
    durationSec: durationSec ?? null,
    restSec: restSec ?? 60,
    loadType: exercise?.loadType ?? "bodyweight",
    notes: null,
    cues: buildProgramCues(exercise, section),
    ...(selectionDebug ? { selectionDebug } : {}),
  };
};

const withSelectionDebug = (
  item: ProgramRoutineItem,
  source: ProgramSelectionDebugSource,
  meta?: {
    slotId?: string;
    slotKind?: string;
    slotLane?: string;
    phaseIndex?: number;
  }
): ProgramRoutineItem => {
  if (item.section !== "main" && item.section !== "accessory") return item;
  return {
    ...item,
    selectionDebug: {
      ...(item.selectionDebug ?? {}),
      source,
      slotId: meta?.slotId ?? item.selectionDebug?.slotId,
      slotKind: meta?.slotKind ?? item.selectionDebug?.slotKind,
      slotLane: meta?.slotLane ?? item.selectionDebug?.slotLane,
      phaseIndex: meta?.phaseIndex ?? item.selectionDebug?.phaseIndex,
    },
  };
};

export type RequirementRule = {
  id: string;
  description: string;
  minCount?: number;
  anyOf?: RequirementRule[];
  tagsAny?: string[];
  focusTagsAny?: string[];
  movementPatternsAny?: string[];
  categories?: ExerciseCategory[];
  sections?: ProgramRoutineItem["section"][];
  muscleGroupsAny?: string[];
  nameIncludesAny?: string[];
  isIsolation?: boolean;
};

export type DayConstraintSpec = {
  id: string;
  mustInclude: RequirementRule[];
  mustNotInclude: RequirementRule[];
  optionalInclude: RequirementRule[];
};

type DayConstraintViolation = {
  rule: RequirementRule;
  section: ProgramRoutineItem["section"] | undefined;
  exerciseId: string;
  exerciseName: string;
};

type DayConstraintValidation = {
  ok: boolean;
  missing: RequirementRule[];
  violations: DayConstraintViolation[];
  optionalMissing: RequirementRule[];
};

type DayConstraintRepairWarning = {
  kind: "missing" | "violation" | "coverage";
  message: string;
};

type DayBudgetViolationRecord = {
  pattern: MainLane;
  dayTitle: string;
  slotId: string;
  exerciseId: string;
  reason: string;
};

type DayBudgetRelaxRecord = {
  pattern: MainLane;
  dayTitle: string;
  fromMax: number;
  toMax: number;
  reason: string;
};

type DayBudgetRepairReport = {
  resolvedViolations: DayBudgetViolationRecord[];
  unresolvedViolations: DayBudgetViolationRecord[];
  relaxedBudgets: DayBudgetRelaxRecord[];
};

type DayConstraintRepairResult = {
  day: ProgramDay;
  warnings: DayConstraintRepairWarning[];
  budgetReport?: DayBudgetRepairReport;
};

type DayConstraintRepairContext = {
  available: Set<Equipment>;
  selectionContext: SelectionContext;
  capabilityMode: EquipmentCapabilityMode;
  selectionSeed?: string;
  selectionRng?: RandomFn;
  previousWeek?: ProgramDay[];
};

type WeekConstraintRepairResult = {
  week: ProgramDay[];
  warnings: Array<{
    dayTitle: string;
    kind: "missing" | "violation" | "coverage";
    message: string;
  }>;
};

export type WeekCoverageSummary = {
  calvesDays: number;
  bicepsDays: number;
  tricepsDays: number;
  squatDays: number;
  hingeDays: number;
  pullDays: number;
  pushDays: number;
  antiRotationDays: number;
  carryDays: number;
  scapularDays: number;
};

type PrimaryMotorPattern =
  | "squat"
  | "hinge"
  | "horizontalPush"
  | "verticalPush"
  | "pull";

const PRIMARY_MOTOR_PATTERNS: PrimaryMotorPattern[] = [
  "squat",
  "hinge",
  "horizontalPush",
  "verticalPush",
  "pull",
];

const getExercisePrimaryMotorPatterns = (
  exercise: Exercise
): PrimaryMotorPattern[] => {
  const movementPatterns = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  const primary: PrimaryMotorPattern[] = [];
  if (movementPatterns.has("squat")) primary.push("squat");
  if (movementPatterns.has("hinge")) primary.push("hinge");
  if (movementPatterns.has("push")) primary.push("horizontalPush");
  if (movementPatterns.has("verticalpush")) primary.push("verticalPush");
  if (movementPatterns.has("pull")) primary.push("pull");
  return primary;
};

const summarizeDayMainPrimaryPatternCounts = (
  day: Pick<ProgramDay, "routine">
) => {
  const counts = new Map<PrimaryMotorPattern, number>();
  PRIMARY_MOTOR_PATTERNS.forEach((pattern) => {
    counts.set(pattern, 0);
  });
  day.routine.forEach((item) => {
    if (item.section !== "main") return;
    const exercise = exerciseById(item.exerciseId);
    if (!exercise) return;
    getExercisePrimaryMotorPatterns(exercise).forEach((pattern) => {
      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
    });
  });
  return counts;
};

const deriveHeavyPrimaryPatternsForDay = (
  day: Pick<ProgramDay, "routine">
): PrimaryMotorPattern[] => {
  const counts = summarizeDayMainPrimaryPatternCounts(day);
  return PRIMARY_MOTOR_PATTERNS.filter((pattern) => (counts.get(pattern) ?? 0) >= 2);
};

const deriveDominantPrimaryPatternsForDay = (
  day: Pick<ProgramDay, "routine">
): PrimaryMotorPattern[] => {
  const counts = summarizeDayMainPrimaryPatternCounts(day);
  const maxCount = Math.max(
    0,
    ...PRIMARY_MOTOR_PATTERNS.map((pattern) => counts.get(pattern) ?? 0)
  );
  if (maxCount <= 0) return [];
  return PRIMARY_MOTOR_PATTERNS.filter(
    (pattern) => (counts.get(pattern) ?? 0) === maxCount
  );
};

const hasPushPrimaryPattern = (patterns: Set<PrimaryMotorPattern>) =>
  patterns.has("horizontalPush") || patterns.has("verticalPush");

const deriveWeekPatternDayCounts = (week: ProgramDay[]) => {
  const counts = new Map<PrimaryMotorPattern, number>();
  PRIMARY_MOTOR_PATTERNS.forEach((pattern) => {
    counts.set(pattern, 0);
  });
  week.forEach((day) => {
    const dayPatterns = new Set<PrimaryMotorPattern>();
    day.routine.forEach((item) => {
      if (item.section !== "main") return;
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      getExercisePrimaryMotorPatterns(exercise).forEach((pattern) => {
        dayPatterns.add(pattern);
      });
    });
    dayPatterns.forEach((pattern) => {
      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
    });
  });
  return counts;
};

export const weeklyPatternSpacingScore = (week: ProgramDay[]) => {
  if (week.length <= 1) return 0;

  let score = 0;
  for (let index = 1; index < week.length; index += 1) {
    const previousDominant = new Set(
      deriveDominantPrimaryPatternsForDay(week[index - 1])
    );
    const currentDominant = new Set(deriveDominantPrimaryPatternsForDay(week[index]));
    const clusteredOverlap = Array.from(currentDominant).filter((pattern) =>
      previousDominant.has(pattern)
    ).length;
    if (clusteredOverlap > 0) {
      score -= clusteredOverlap * 1.25;
    }

    const alternatesPushPull =
      (hasPushPrimaryPattern(previousDominant) && currentDominant.has("pull")) ||
      (previousDominant.has("pull") && hasPushPrimaryPattern(currentDominant));
    if (alternatesPushPull) {
      score += 1;
    }

    const alternatesLowerPattern =
      (previousDominant.has("squat") && currentDominant.has("hinge")) ||
      (previousDominant.has("hinge") && currentDominant.has("squat"));
    if (alternatesLowerPattern) {
      score += 0.9;
    }
  }

  const patternDayCounts = deriveWeekPatternDayCounts(week);
  const allCounts = PRIMARY_MOTOR_PATTERNS.map(
    (pattern) => patternDayCounts.get(pattern) ?? 0
  );
  const nonZeroCounts = allCounts.filter((value) => value > 0);
  if (nonZeroCounts.length >= 2) {
    const maxCount = Math.max(...nonZeroCounts);
    const minCount = Math.min(...nonZeroCounts);
    const spread = maxCount - minCount;
    if (spread <= 1) {
      score += 1.5;
    } else {
      score -= Math.min(2, (spread - 1) * 0.75);
    }
  }

  return score;
};

const normalizeRuleTokens = (values?: string[]) =>
  (values ?? []).map((value) => normalizeTagToken(value));

const buildExerciseTokenIndex = (exercise: Exercise) => {
  const tags = new Set(normalizeRuleTokens(exercise.tags));
  const focusTags = new Set(normalizeRuleTokens(exercise.focusTags ?? []));
  const movementPatterns = new Set(normalizeRuleTokens(exercise.movementPattern));
  const muscleGroups = new Set(normalizeRuleTokens(exercise.muscleGroups));
  const idAndName = `${exercise.id} ${exercise.name}`.toLowerCase();
  return { tags, focusTags, movementPatterns, muscleGroups, idAndName };
};

const tokensIntersect = (haystack: Set<string>, needles?: string[]) => {
  if (!needles?.length) return true;
  const normalizedNeedles = normalizeRuleTokens(needles);
  return normalizedNeedles.some((needle) => haystack.has(needle));
};

const isIsolationExercise = (exercise: Exercise) => {
  const tokenIndex = buildExerciseTokenIndex(exercise);
  const isoTags = [
    "isolation",
    "biceps",
    "triceps",
    "calves",
    "lateral_delt",
    "shoulders_isolation",
  ];
  const isoPatterns = ["curl", "extension", "calf"];
  const isoNameTokens = [
    "curl",
    "triceps extension",
    "pressdown",
    "kickback",
    "lateral raise",
    "calf raise",
  ];
  if (tokensIntersect(tokenIndex.tags, isoTags)) return true;
  if (tokensIntersect(tokenIndex.movementPatterns, isoPatterns)) return true;
  if (tokensIntersect(tokenIndex.muscleGroups, ["biceps", "triceps", "calves"])) {
    return isoNameTokens.some((token) => tokenIndex.idAndName.includes(token));
  }
  return isoNameTokens.some((token) => tokenIndex.idAndName.includes(token));
};

export type ExerciseRole =
  | "mainStrength"
  | "mainControl"
  | "accessoryIsolation"
  | "postureCorrective"
  | "conditioning"
  | "carry"
  | "core";

export const deriveExerciseRole = (exercise: Exercise): ExerciseRole => {
  const tags = new Set((exercise.tags ?? []).map(normalizeTagToken));
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const name = `${exercise.id} ${exercise.name}`.toLowerCase();

  if (
    tags.has("carry") ||
    patterns.has("carry") ||
    name.includes("carry") ||
    name.includes("suitcase")
  ) {
    return "carry";
  }

  if (
    tags.has("conditioning") ||
    tags.has("cardio") ||
    tags.has("metcon") ||
    name.includes("conditioning")
  ) {
    return "conditioning";
  }

  if (
    patterns.has("core") ||
    patterns.has("anti_rotation") ||
    patterns.has("anti_extension")
  ) {
    return "core";
  }

  if (isIsolationExercise(exercise)) {
    return "accessoryIsolation";
  }

  if (
    tags.has("scap") ||
    tags.has("posture") ||
    tags.has("t_spine") ||
    tags.has("thoracic")
  ) {
    return "postureCorrective";
  }

  if (
    exercise.movementIntensity === "load" ||
    exercise.loadType === "weighted" ||
    exercise.difficultyTier === "hard"
  ) {
    return "mainStrength";
  }

  return "mainControl";
};

export const matchesRule = (
  exercise: Exercise,
  rule: RequirementRule,
  section?: ProgramRoutineItem["section"]
): boolean => {
  if (rule.sections?.length) {
    if (!section || !rule.sections.includes(section)) return false;
  }

  if (rule.categories?.length && !rule.categories.includes(exercise.category)) {
    return false;
  }

  if (
    typeof rule.isIsolation === "boolean" &&
    isIsolationExercise(exercise) !== rule.isIsolation
  ) {
    return false;
  }

  if (rule.anyOf?.length) {
    return rule.anyOf.some((childRule) => matchesRule(exercise, childRule, section));
  }

  const tokenIndex = buildExerciseTokenIndex(exercise);
  if (!tokensIntersect(tokenIndex.tags, rule.tagsAny)) return false;
  if (!tokensIntersect(tokenIndex.focusTags, rule.focusTagsAny)) return false;
  if (!tokensIntersect(tokenIndex.movementPatterns, rule.movementPatternsAny)) return false;
  if (!tokensIntersect(tokenIndex.muscleGroups, rule.muscleGroupsAny)) return false;
  if (rule.nameIncludesAny?.length) {
    const matchesName = rule.nameIncludesAny.some((needle) =>
      tokenIndex.idAndName.includes(needle.toLowerCase())
    );
    if (!matchesName) return false;
  }
  return true;
};

export const countMatches = (
  dayItems: Array<{
    item: ProgramRoutineItem;
    exercise: Exercise;
  }>,
  rule: RequirementRule
) =>
  dayItems.filter((entry) => matchesRule(entry.exercise, rule, entry.item.section)).length;

const requiredRuleCount = (rule: RequirementRule) => Math.max(1, rule.minCount ?? 1);

const normalizeSlotToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const resolveProgramVariationIndex = (
  options?:
    | Pick<ProgramVariationOptions, "variationIndex" | "index">
    | null
) => resolveProgramVariationIndexValue(options?.variationIndex ?? options?.index);
const {
  clearProgramVariationHistory,
  commitProgramVariationSnapshot,
  getVariationMemoryValuesForDayToken,
  resolveProgramVariationFamilyKey,
  resolveProgramVariationState,
  resolveProgramVariationVariantKey,
} = createProgramVariationMemoryRuntime({
  exerciseById,
  normalizeSlotToken,
  normalizeTagToken,
  stableHashToken,
  clampPhaseIndexToSupportedRange,
  resolveVariationIndex: resolveProgramVariationIndex,
});

export { clearProgramVariationHistory };

const makeDaySlotId = (
  day: ProgramDay,
  itemIndex: number,
  section?: ProgramRoutineItem["section"]
) => {
  const dayKey = `${day.dayIndex}-${normalizeSlotToken(day.title)}`;
  if (section === "main") {
    const mainOrdinal = day.routine
      .slice(0, itemIndex + 1)
      .filter((item) => item.section === "main").length;
    return `${dayKey}-main-${mainOrdinal}`;
  }
  return `${dayKey}-${section ?? "unknown"}-${itemIndex + 1}`;
};

const buildDayEntries = (day: ProgramDay) =>
  day.routine
    .map((item, index) => ({
      item,
      index,
      slotId: makeDaySlotId(day, index, item.section),
      exercise: exerciseById(item.exerciseId),
    }))
    .filter(
      (
        entry
      ): entry is {
        item: ProgramRoutineItem;
        index: number;
        slotId: string;
        exercise: Exercise;
      } => Boolean(entry.exercise)
    );

export const daySatisfiesSpec = (
  day: ProgramDay,
  spec: DayConstraintSpec
): DayConstraintValidation => {
  const entries = buildDayEntries(day);
  const missing = spec.mustInclude.filter(
    (rule) => countMatches(entries, rule) < requiredRuleCount(rule)
  );
  const optionalMissing = spec.optionalInclude.filter(
    (rule) => countMatches(entries, rule) < requiredRuleCount(rule)
  );
  const violations: DayConstraintViolation[] = [];
  spec.mustNotInclude.forEach((rule) => {
    entries.forEach((entry) => {
      if (!matchesRule(entry.exercise, rule, entry.item.section)) return;
      violations.push({
        rule,
        section: entry.item.section,
        exerciseId: entry.exercise.id,
        exerciseName: entry.exercise.name,
      });
    });
  });
  return {
    ok: missing.length === 0 && violations.length === 0,
    missing,
    violations,
    optionalMissing,
  };
};

const focusOverlapScore = (exercise: Exercise, focusTags: string[]) => {
  const focusSet = new Set(normalizeRuleTokens(focusTags));
  const exerciseTokens = new Set([
    ...normalizeRuleTokens(exercise.tags),
    ...normalizeRuleTokens(exercise.focusTags ?? []),
    ...normalizeRuleTokens(exercise.movementPattern),
    ...normalizeRuleTokens(exercise.muscleGroups),
  ]);
  let overlap = 0;
  focusSet.forEach((token) => {
    if (exerciseTokens.has(token)) overlap += 1;
  });
  return overlap;
};

const isExtraMainRoutineItem = (item: ProgramRoutineItem) =>
  item.section === "main" &&
  String(item.notes ?? "").toLowerCase().includes("3 sec eccentric");

const replacementPriorityForEntry = (params: {
  day: ProgramDay;
  item: ProgramRoutineItem;
  exercise: Exercise;
  focusTags: string[];
}) => {
  const { day, item, exercise, focusTags } = params;
  const overlap = focusOverlapScore(exercise, focusTags);
  if (item.section === "accessory") return overlap;
  if (item.section === "main" && isExtraMainRoutineItem(item)) return 100 + overlap;
  if (item.section === "main") return 200 + overlap;
  if (item.section === "activation") return 300 + overlap;
  if (item.section === "cooldown") return 400 + overlap;
  if (item.section === "warmup") return 500 + overlap;
  return 600 + overlap + day.dayIndex;
};

const getRepairTargetIndexes = (day: ProgramDay) =>
  buildDayEntries(day)
    .filter((entry) => entry.item.section === "accessory" || entry.item.section === "main")
    .sort((left, right) => {
      const leftPriority = replacementPriorityForEntry({
        day,
        item: left.item,
        exercise: left.exercise,
        focusTags: day.focusTags,
      });
      const rightPriority = replacementPriorityForEntry({
        day,
        item: right.item,
        exercise: right.exercise,
        focusTags: day.focusTags,
      });
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.index - right.index;
    })
    .map((entry) => entry.index);

const ruleLabel = (rule: RequirementRule) => rule.description || rule.id;

const findReplacementExerciseForRule = (params: {
  day: ProgramDay;
  itemIndex: number;
  requiredRule?: RequirementRule;
  avoidRules: RequirementRule[];
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}) => {
  const { day, itemIndex, requiredRule, avoidRules, available, selectionContext } =
    params;
  const currentItem = day.routine[itemIndex];
  if (!currentItem) return null;
  if (currentItem.section === "warmup" || currentItem.section === "cooldown") return null;
  const currentExercise = exerciseById(currentItem.exerciseId);
  if (!currentExercise) return null;

  const usedIds = new Set(day.routine.map((entry) => entry.exerciseId));
  usedIds.delete(currentExercise.id);

  const substitutionCandidates = rankSubstitutionCandidates({
    current: currentExercise,
    section: currentItem.section,
    available,
    context: selectionContext,
  }).map((entry) => entry.exercise);

  const globalCandidates = exercises
    .filter((candidate) => {
      if (candidate.id === currentExercise.id) return false;
      if (usedIds.has(candidate.id)) return false;
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available,
        section: currentItem.section,
        context: selectionContext,
      });
    })
    .sort((left, right) => {
      const rightScore =
        scoreExerciseForContext(right, currentItem.section, selectionContext, available) +
        focusOverlapScore(right, day.focusTags);
      const leftScore =
        scoreExerciseForContext(left, currentItem.section, selectionContext, available) +
        focusOverlapScore(left, day.focusTags);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.id.localeCompare(right.id);
    });

  const candidateMap = new Map<string, Exercise>();
  [...substitutionCandidates, ...globalCandidates].forEach((candidate) => {
    if (!candidateMap.has(candidate.id)) {
      candidateMap.set(candidate.id, candidate);
    }
  });

  const scoredCandidates = Array.from(candidateMap.values())
    .filter((candidate) => {
      if (
        requiredRule &&
        !matchesRule(candidate, requiredRule, currentItem.section)
      ) {
        return false;
      }
      if (
        avoidRules.some((rule) =>
          matchesRule(candidate, rule, currentItem.section)
        )
      ) {
        return false;
      }
      return true;
    })
    .map((candidate) => {
      let score = scoreExerciseForContext(
        candidate,
        currentItem.section,
        selectionContext,
        available
      );
      score += focusOverlapScore(candidate, day.focusTags) * 1.5;
      if (requiredRule && matchesRule(candidate, requiredRule, currentItem.section)) {
        score += 20;
      }
      if (candidate.category === currentExercise.category) {
        score += 2;
      }
      return { candidate, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.candidate.id.localeCompare(right.candidate.id);
    });

  return scoredCandidates[0]?.candidate ?? null;
};

const replaceDayItemExercise = (
  day: ProgramDay,
  itemIndex: number,
  replacement: Exercise,
  source: ProgramSelectionDebugSource = "contract_repair"
) => {
  const routine = [...day.routine];
  const current = routine[itemIndex];
  if (!current) return day;
  routine[itemIndex] = withSelectionDebug(
    {
      ...current,
      exerciseId: replacement.id,
      loadType: replacement.loadType,
      cues: buildProgramCues(replacement, current.section),
    },
    source,
    {
      slotId: makeDaySlotId(day, itemIndex, current.section),
    }
  );
  return { ...day, routine };
};

const rule = (
  id: string,
  description: string,
  config: Omit<RequirementRule, "id" | "description">
): RequirementRule => ({ id, description, ...config });

const anyOfRule = (
  id: string,
  description: string,
  anyOf: RequirementRule[]
): RequirementRule => ({ id, description, anyOf });

const pullBackRule = anyOfRule("pull_back", "pull/back movement", [
  rule("pull_pattern", "pull pattern", { movementPatternsAny: ["pull"] }),
  rule("back_tag", "back tag", {
    tagsAny: ["back", "upper-back", "lats", "pull"],
    muscleGroupsAny: ["upper back", "lats", "back"],
  }),
]);

const pushChestRule = anyOfRule("push_chest", "push/chest movement", [
  rule("push_pattern", "push pattern", { movementPatternsAny: ["push"] }),
  rule("chest_tag", "chest tag", {
    tagsAny: ["chest", "push"],
    muscleGroupsAny: ["chest"],
  }),
]);

const chestAccessoryRule = anyOfRule("chest_accessory", "chest-focused accessory", [
  rule("chest_muscle_group", "chest muscle group", {
    muscleGroupsAny: ["chest"],
  }),
  rule("chest_tag_or_name", "chest tag or name", {
    tagsAny: ["chest"],
  }),
  rule("chest_name_hint", "chest movement name hint", {
    nameIncludesAny: ["chest", "bench", "fly", "push-up", "pushup"],
  }),
]);

const shoulderVerticalRule = anyOfRule("shoulders_vertical", "shoulders/vertical push", [
  rule("vertical_push_pattern", "vertical push pattern", {
    movementPatternsAny: ["verticalpush"],
  }),
  rule("shoulders_tag", "shoulders", {
    tagsAny: ["shoulders", "vertical"],
    muscleGroupsAny: ["shoulders"],
  }),
]);

const lateralDeltRule = anyOfRule("lateral_delt_focus", "lateral delt", [
  rule("lateral_pattern", "lateral raise pattern", {
    movementPatternsAny: ["lateralraise"],
  }),
  rule("lateral_tags", "lateral delt tags", {
    tagsAny: ["lateraldelt", "lateral_delt", "lateral"],
    muscleGroupsAny: ["shoulders"],
  }),
  rule("lateral_name_hint", "lateral raise naming", {
    nameIncludesAny: ["lateral raise", "lateral-raise"],
  }),
]);

const bicepsIsolationRule = anyOfRule("biceps_iso", "biceps isolation", [
  rule("biceps_iso_tag", "biceps isolation tags", {
    tagsAny: ["biceps", "isolation"],
    muscleGroupsAny: ["biceps"],
    isIsolation: true,
  }),
  rule("biceps_curl_pattern", "biceps curl", {
    movementPatternsAny: ["curl"],
    muscleGroupsAny: ["biceps"],
    isIsolation: true,
  }),
]);

const tricepsIsolationRule = anyOfRule("triceps_iso", "triceps isolation", [
  rule("triceps_iso_tag", "triceps isolation tags", {
    tagsAny: ["triceps", "isolation"],
    muscleGroupsAny: ["triceps"],
    isIsolation: true,
  }),
  rule("triceps_extension_pattern", "triceps extension", {
    movementPatternsAny: ["extension"],
    muscleGroupsAny: ["triceps"],
    isIsolation: true,
  }),
]);

const squatRule = anyOfRule("squat_focus", "squat/quads", [
  rule("squat_pattern", "squat pattern", { movementPatternsAny: ["squat"] }),
  rule("quads_tag", "quads/legs", {
    tagsAny: ["quads", "legs", "squat"],
    muscleGroupsAny: ["quads"],
  }),
]);

const hingeRule = anyOfRule("hinge_focus", "hinge/hamstrings", [
  rule("hinge_pattern", "hinge pattern", { movementPatternsAny: ["hinge"] }),
  rule("hamstrings_tag", "hamstrings/posterior", {
    tagsAny: ["hamstrings", "posterior", "hinge"],
    muscleGroupsAny: ["hamstrings", "glutes"],
  }),
]);

const calvesRule = anyOfRule("calves_focus", "calves", [
  rule("calves_tag", "calves tags", {
    tagsAny: ["calves"],
    muscleGroupsAny: ["calves"],
  }),
  rule("calf_pattern", "calf pattern", {
    movementPatternsAny: ["calf"],
    muscleGroupsAny: ["calves"],
  }),
]);

const coreRule = anyOfRule("core_focus", "core/anti-rotation", [
  rule("core_tags", "core tags", {
    tagsAny: ["core", "tva"],
    movementPatternsAny: ["core", "anti-rotation", "anti-extension"],
  }),
  rule("core_muscles", "core muscles", {
    muscleGroupsAny: ["core", "obliques"],
  }),
]);

const antiRotationRule = anyOfRule("anti_rotation_focus", "anti-rotation", [
  rule("anti_rotation_pattern", "anti-rotation pattern", {
    movementPatternsAny: ["anti-rotation"],
  }),
  rule("anti_rotation_tag", "anti-rotation/core tags", {
    tagsAny: ["anti-rotation", "rotation", "core"],
  }),
]);

const carryRule = rule("carry_focus", "carry", {
  tagsAny: ["carry"],
  nameIncludesAny: ["carry", "suitcase"],
});

const scapPostureRule = anyOfRule("scap_posture", "scapular/posture", [
  rule("scap_tags", "scap tags", {
    tagsAny: ["scap", "upper-back", "posture", "t-spine", "thoracic"],
    movementPatternsAny: ["scapular"],
  }),
  rule("thoracic_focus", "thoracic focus", {
    nameIncludesAny: ["thoracic", "posture"],
  }),
]);

const carryOrAntiRotationRule = anyOfRule(
  "carry_or_anti_rotation",
  "carry or anti-rotation",
  [carryRule, antiRotationRule]
);

const upperPushPullRule = anyOfRule("upper_push_pull", "upper push/pull drift", [
  rule("upper_push", "upper push", { movementPatternsAny: ["push", "verticalpush"] }),
  rule("upper_pull", "upper pull", { movementPatternsAny: ["pull"] }),
]);

const conditioningRule = anyOfRule("conditioning", "conditioning", [
  rule("conditioning_tag", "conditioning tags", {
    tagsAny: ["conditioning", "cardio", "metcon"],
  }),
  rule("timed_conditional", "timed core", {
    categories: ["main"],
    movementPatternsAny: ["core"],
  }),
]);

const horizontalPushMainRule = rule("required_main_horizontal_push", "main horizontal push", {
  movementPatternsAny: ["push"],
  muscleGroupsAny: ["chest"],
  sections: ["main"],
});

const verticalPushMainRule: RequirementRule = {
  ...shoulderVerticalRule,
  id: "required_main_vertical_push_coherence",
  description: "main vertical push variety",
  sections: ["main"],
  minCount: 1,
};

const rowPullMainRule = rule("required_main_row_pull", "main row pull", {
  movementPatternsAny: ["pull"],
  nameIncludesAny: ["row"],
  sections: ["main"],
});

const verticalPullMainRule = anyOfRule("required_main_vertical_pull", "main vertical pull", [
  rule("vertical_pull_name", "vertical pull name", {
    movementPatternsAny: ["pull"],
    nameIncludesAny: ["pulldown", "pull-up", "pullup", "chin-up", "chinup"],
  }),
  rule("vertical_pull_lat", "lat-focused pull", {
    movementPatternsAny: ["pull"],
    tagsAny: ["lats"],
    nameIncludesAny: ["lat"],
  }),
]);
verticalPullMainRule.sections = ["main"];
verticalPullMainRule.minCount = 1;

const secondaryPullAngleMainRule = anyOfRule(
  "required_main_pull_angle_variety",
  "main secondary pull angle",
  [
    rule("scapular_pull_name", "scapular/rear-delt pull name", {
      movementPatternsAny: ["pull"],
      nameIncludesAny: ["face pull", "snow angel", "ytw", "swimmer", "widow"],
    }),
    rule("scapular_pull_tags", "scapular/rear-delt pull tags", {
      movementPatternsAny: ["pull"],
      tagsAny: ["scap", "upper-back"],
      muscleGroupsAny: ["upper back", "rear delts"],
    }),
  ]
);
secondaryPullAngleMainRule.sections = ["main"];
secondaryPullAngleMainRule.minCount = 1;

const mainPatternRuleByLane: Record<MainLane, RequirementRule> = {
  push: rule("required_main_push", "main push pattern", {
    movementPatternsAny: ["push"],
    sections: ["main"],
  }),
  verticalPush: {
    ...shoulderVerticalRule,
    id: "required_main_vertical_push",
    description: "main vertical push pattern",
    sections: ["main"],
  },
  pull: rule("required_main_pull", "main pull pattern", {
    movementPatternsAny: ["pull"],
    sections: ["main"],
  }),
  squat: rule("required_main_squat", "main squat pattern", {
    movementPatternsAny: ["squat"],
    sections: ["main"],
  }),
  hinge: rule("required_main_hinge", "main hinge pattern", {
    movementPatternsAny: ["hinge"],
    sections: ["main"],
  }),
};

const lowerSquatMainRule: RequirementRule = {
  ...mainPatternRuleByLane.squat,
  id: "required_main_squat_coherence",
  description: "main squat variety",
  minCount: 1,
};

const lowerHingeMainRule: RequirementRule = {
  ...mainPatternRuleByLane.hinge,
  id: "required_main_hinge_coherence",
  description: "main hinge variety",
  minCount: 1,
};

const buildConstraintSpecFromTemplate = (params: {
  template: SplitTemplateSpec;
  capabilityMode: EquipmentCapabilityMode;
}) => {
  const { template, capabilityMode } = params;
  const contract = template.constraints;
  const requiredMainPatternRules = contract.requiredMainPatterns.map((entry) => {
    const base = mainPatternRuleByLane[entry.pattern];
    return {
      ...base,
      id: `${template.title}_${base.id}`.toLowerCase().replace(/\s+/g, "_"),
      minCount: entry.min,
    };
  });

  const requiredMainRules = (contract.requiredMainRules ?? []).map((entry) => ({
    ...entry,
    minCount: requiredRuleCount(entry),
  }));
  const requiredAccessories = (contract.requiredAccessories ?? []).map((entry) => ({
    ...entry,
    minCount: requiredRuleCount(entry),
  }));
  const optionalRules = (contract.optionalRules ?? []).map((entry) => ({
    ...entry,
    minCount: requiredRuleCount(entry),
  }));

  const forbiddenMainRules = (contract.forbiddenMainTags ?? []).map((tag) =>
    rule(
      `${template.title}_forbidden_main_${tag}`.toLowerCase().replace(/\s+/g, "_"),
      `forbidden main tag: ${tag}`,
      {
        tagsAny: [tag],
        sections: ["main"],
      }
    )
  );

  if (contract.forbidUpperPushPullOnMainAndAccessory && capabilityMode !== "noneOnly") {
    forbiddenMainRules.push({ ...upperPushPullRule, sections: ["main", "accessory"] });
  }

  return {
    id: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    mustInclude: [...requiredMainPatternRules, ...requiredMainRules, ...requiredAccessories],
    mustNotInclude: forbiddenMainRules,
    optionalInclude: optionalRules,
  } satisfies DayConstraintSpec;
};

export const resolveDayConstraintSpec = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  capabilityMode: EquipmentCapabilityMode;
}): DayConstraintSpec | null => {
  const { day, daysPerWeek, capabilityMode } = params;
  const template = getSplitTemplateSpecs(daysPerWeek).find(
    (entry) => entry.title === day.title
  );
  if (!template) return null;
  return buildConstraintSpecFromTemplate({ template, capabilityMode });
};

const getMainLaneHits = (exercise: Exercise): MainLane[] => {
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const hits: MainLane[] = [];
  if (patterns.has("verticalpush")) hits.push("verticalPush");
  if (patterns.has("push")) hits.push("push");
  if (patterns.has("pull")) hits.push("pull");
  if (patterns.has("squat")) hits.push("squat");
  if (patterns.has("hinge")) hits.push("hinge");
  return hits;
};

const countMainLanes = (day: ProgramDay) => {
  const counts: Record<MainLane, number> = {
    push: 0,
    verticalPush: 0,
    pull: 0,
    squat: 0,
    hinge: 0,
  };
  buildDayEntries(day).forEach((entry) => {
    if (entry.item.section !== "main") return;
    getMainLaneHits(entry.exercise).forEach((lane) => {
      counts[lane] += 1;
    });
  });
  return counts;
};

const countBudgetPatterns = (day: ProgramDay) => {
  const counts: Record<BudgetPatternKey, number> = {
    push: 0,
    verticalPush: 0,
    pull: 0,
    squat: 0,
    hinge: 0,
    scapular: 0,
    carry: 0,
    antiRotation: 0,
    armsIsolation: 0,
    calves: 0,
  };
  buildDayEntries(day).forEach((entry) => {
    if (entry.item.section === "main") {
      getMainLaneHits(entry.exercise).forEach((lane) => {
        counts[lane] += 1;
      });
    }
    if (matchesRule(entry.exercise, scapPostureRule, entry.item.section)) {
      counts.scapular += 1;
    }
    if (matchesRule(entry.exercise, carryRule, entry.item.section)) {
      counts.carry += 1;
    }
    if (matchesRule(entry.exercise, antiRotationRule, entry.item.section)) {
      counts.antiRotation += 1;
    }
    if (
      matchesRule(entry.exercise, bicepsIsolationRule, entry.item.section) ||
      matchesRule(entry.exercise, tricepsIsolationRule, entry.item.section)
    ) {
      counts.armsIsolation += 1;
    }
    if (matchesRule(entry.exercise, calvesRule, entry.item.section)) {
      counts.calves += 1;
    }
  });
  return counts;
};

const toMainLaneCounts = (usage: Record<BudgetPatternKey, number>): Record<MainLane, number> => ({
  push: usage.push,
  verticalPush: usage.verticalPush,
  pull: usage.pull,
  squat: usage.squat,
  hinge: usage.hinge,
});

const getIntentNeedAlignmentScore = (exercise: Exercise, intentProfile: ProgramIntentProfile) => {
  let score = 0;
  if (intentProfile.needs.needsScapularControl && matchesRule(exercise, scapPostureRule)) {
    score += 1;
  }
  if (intentProfile.needs.needsHipHingeRepattern && matchesRule(exercise, hingeRule)) {
    score += 1;
  }
  if (intentProfile.needs.needsCoreAntiRotation && matchesRule(exercise, antiRotationRule)) {
    score += 1;
  }
  if (intentProfile.needs.needsCalves && matchesRule(exercise, calvesRule)) {
    score += 1;
  }
  if (
    intentProfile.needs.needsArmsIsolation &&
    (matchesRule(exercise, bicepsIsolationRule) ||
      matchesRule(exercise, tricepsIsolationRule))
  ) {
    score += 1;
  }
  if (intentProfile.needs.needsThoracicExtension && matchesRule(exercise, scapPostureRule)) {
    score += 1;
  }
  return score;
};

const isHipOrKneePainToken = (value: string) => {
  const token = normalizeTagToken(value);
  return token.includes("hip") || token.includes("knee");
};

type BudgetRepairDayKey = "lowerSquat" | "lowerHinge" | "upperPush" | "other";

type BudgetRepairCandidateSpec = {
  spec: DayConstraintSpec;
  patternKeys: BudgetPatternKey[];
};

const getBudgetRepairDayKey = (title: string): BudgetRepairDayKey => {
  const lower = title.toLowerCase();
  if (lower.includes("lower") && (lower.includes("hinge") || lower.includes("posterior"))) {
    return "lowerHinge";
  }
  if (lower.includes("lower") && lower.includes("squat")) {
    return "lowerSquat";
  }
  if (lower.includes("upper") && lower.includes("push")) {
    return "upperPush";
  }
  return "other";
};

const lightHingeControlRule = anyOfRule("light_hinge_control", "light hinge control", [
  rule("hinge_drill", "hip hinge drill", {
    nameIncludesAny: ["hip-hinge-drill", "hip hinge drill"],
    movementPatternsAny: ["hinge"],
  }),
  rule("glute_bridge", "glute bridge hold", {
    nameIncludesAny: ["glute-bridges", "single-leg-glute-bridge-hold", "glute bridge"],
    movementPatternsAny: ["hinge"],
  }),
]);

const singleSquatExposureRule = anyOfRule(
  "single_squat_exposure",
  "single squat exposure",
  [
    rule("split_squat", "split squat", {
      nameIncludesAny: ["split-squat", "split squat", "step-up", "step up"],
      movementPatternsAny: ["squat"],
    }),
    rule("single_leg_squat", "single-leg squat", {
      movementPatternsAny: ["squat", "single-leg"],
      tagsAny: ["single-leg"],
    }),
  ]
);

const buildBudgetRepairCandidateSpec = (params: {
  day: ProgramDay;
  overflowPattern: MainLane;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget;
  patternCounts: Record<BudgetPatternKey, number>;
}): BudgetRepairCandidateSpec | null => {
  const { day, overflowPattern, context, budget, patternCounts } = params;
  const dayKey = getBudgetRepairDayKey(day.title);
  if (dayKey === "other") return null;
  if (
    overflowPattern !== "squat" &&
    overflowPattern !== "hinge" &&
    overflowPattern !== "pull"
  ) {
    return null;
  }

  const candidateRules: RequirementRule[] = [
    antiRotationRule,
    carryRule,
    scapPostureRule,
    calvesRule,
  ];
  const patternKeys: BudgetPatternKey[] = ["antiRotation", "carry", "scapular", "calves"];

  if (dayKey === "lowerSquat" && overflowPattern === "squat") {
    const hingeMax = budget.mainMax?.hinge;
    const hasHingeCapacity =
      typeof hingeMax !== "number" || patternCounts.hinge < hingeMax;
    const painBlocksHingeControl =
      context.selectionContext.painSeverity === "high" &&
      context.selectionContext.painAreas.some((area) => {
        const token = normalizeTagToken(area);
        return token.includes("low_back") || token.includes("hip");
      });
    if (hasHingeCapacity && !painBlocksHingeControl) {
      candidateRules.push(lightHingeControlRule);
      patternKeys.push("hinge");
    }
  }

  if (dayKey === "lowerSquat" && overflowPattern === "hinge") {
    const squatMax = budget.mainMax?.squat;
    const hasSquatCapacity =
      typeof squatMax !== "number" || patternCounts.squat < squatMax;
    if (hasSquatCapacity) {
      candidateRules.push(singleSquatExposureRule);
      patternKeys.push("squat");
    }
  }

  if (dayKey === "lowerHinge" && overflowPattern === "hinge") {
    const squatMax = budget.mainMax?.squat;
    const hasSquatCapacity =
      typeof squatMax !== "number" || patternCounts.squat < squatMax;
    if (hasSquatCapacity) {
      candidateRules.push(singleSquatExposureRule);
      patternKeys.push("squat");
    }
  }

  if (dayKey === "lowerHinge" && overflowPattern === "squat") {
    const hingeMax = budget.mainMax?.hinge;
    const hasHingeCapacity =
      typeof hingeMax !== "number" || patternCounts.hinge < hingeMax;
    const painBlocksHingeControl =
      context.selectionContext.painSeverity === "high" &&
      context.selectionContext.painAreas.some((area) => {
        const token = normalizeTagToken(area);
        return token.includes("low_back") || token.includes("hip");
      });
    if (hasHingeCapacity && !painBlocksHingeControl) {
      candidateRules.push(lightHingeControlRule);
      patternKeys.push("hinge");
    }
  }

  if (dayKey === "upperPush" && overflowPattern === "pull") {
    candidateRules.push(pushChestRule, shoulderVerticalRule);
    patternKeys.push("push", "verticalPush");
  }

  if (!candidateRules.length) return null;

  return {
    spec: {
      id: `budget_repair_${dayKey}_${overflowPattern}`,
      mustInclude: [
        anyOfRule(
          `budget_repair_allowed_${dayKey}_${overflowPattern}`,
          "budget repair candidate",
          candidateRules
        ),
      ],
      mustNotInclude: [],
      optionalInclude: [],
    },
    patternKeys,
  };
};

const applyDayPatternBudget = (params: {
  day: ProgramDay;
  budget: DayPatternBudget | null;
  spec: DayConstraintSpec | null;
  context: DayConstraintRepairContext;
}): DayConstraintRepairResult => {
  const { day, budget, spec, context } = params;
  const emptyBudgetReport: DayBudgetRepairReport = {
    resolvedViolations: [],
    unresolvedViolations: [],
    relaxedBudgets: [],
  };
  if (!budget?.mainMax) return { day, warnings: [], budgetReport: emptyBudgetReport };

  let updatedDay: ProgramDay = { ...day, routine: [...day.routine] };
  const warnings: DayConstraintRepairWarning[] = [];
  const effectiveMax: Partial<Record<MainLane, number>> = { ...budget.mainMax };
  let relaxUsed = false;
  const budgetReport: DayBudgetRepairReport = {
    resolvedViolations: [],
    unresolvedViolations: [],
    relaxedBudgets: [],
  };

  const accessoryMax =
    typeof budget.accessoryMax === "number" && Number.isFinite(budget.accessoryMax)
      ? Math.max(0, budget.accessoryMax)
      : Number.POSITIVE_INFINITY;

  const canRelaxBudgetForLane = (lane: MainLane) => {
    if (relaxUsed) return false;
    if (context.selectionContext.intentProfile.recoveryBudget === "low") return false;
    if (
      (lane === "squat" || lane === "hinge") &&
      context.selectionContext.painSeverity === "high" &&
      context.selectionContext.painAreas.some(isHipOrKneePainToken)
    ) {
      return false;
    }
    return true;
  };

  const selectOffendingEntry = (lane: MainLane) => {
    const laneCounts = toMainLaneCounts(countBudgetPatterns(updatedDay));
    return buildDayEntries(updatedDay)
      .filter((entry) => entry.item.section === "main")
      .filter((entry) => getMainLaneHits(entry.exercise).includes(lane))
      .map((entry) => {
        const slotKind = slotKindByMainLane[lane];
        const detail = scoreExerciseForContextDetailed(
          entry.exercise,
          "main",
          context.selectionContext,
          context.available,
          {
            slotId: entry.slotId,
            dayTitle: updatedDay.title,
            dayFocusTags: updatedDay.focusTags,
            slotKind,
            slotLane: lane,
            capabilityMode: context.capabilityMode,
            dayBudget: budget,
          }
        );
        const capabilityBonus = getCapabilitySlotBonus({
          exercise: entry.exercise,
          section: "main",
          auditMeta: {
            slotId: entry.slotId,
            dayTitle: updatedDay.title,
            dayFocusTags: updatedDay.focusTags,
            slotKind,
            capabilityMode: context.capabilityMode,
          },
        });
        const laneContribution = getMainLaneHits(entry.exercise).reduce((sum, hit) => {
          const laneMin = budget.mainMin?.[hit] ?? 0;
          if (laneMin <= 0) return sum;
          return sum + (laneCounts[hit] <= laneMin ? 1 : 0);
        }, 0);
        return {
          ...entry,
          score: detail.score + capabilityBonus.bonus,
          needAlignment: getIntentNeedAlignmentScore(
            entry.exercise,
            context.selectionContext.intentProfile
          ),
          laneContribution,
          redundancy: Math.max(0, laneCounts[lane] - (budget.mainMin?.[lane] ?? 0)),
        };
      })
      .sort((left, right) => {
        if (left.score !== right.score) return left.score - right.score;
        if (left.needAlignment !== right.needAlignment) {
          return left.needAlignment - right.needAlignment;
        }
        if (left.laneContribution !== right.laneContribution) {
          return left.laneContribution - right.laneContribution;
        }
        if (left.redundancy !== right.redundancy) {
          return right.redundancy - left.redundancy;
        }
        return left.index - right.index;
      })[0];
  };

  const findBudgetAwareReplacement = (params: {
    targetIndex: number;
    offendingLane: MainLane;
  }): {
    replacement: Exercise | null;
    reason: "no candidates" | "equipment limits" | "pain gate" | "phase gate";
    candidatePoolSize: number;
    eligibleCount: number;
    repairSpecId: string | null;
  } => {
    const { targetIndex, offendingLane } = params;
    const targetItem = updatedDay.routine[targetIndex];
    if (!targetItem) {
      return {
        replacement: null,
        reason: "no candidates",
        candidatePoolSize: 0,
        eligibleCount: 0,
        repairSpecId: null,
      };
    }
    const currentExercise = exerciseById(targetItem.exerciseId);
    if (!currentExercise || targetItem.section !== "main") {
      return {
        replacement: null,
        reason: "no candidates",
        candidatePoolSize: 0,
        eligibleCount: 0,
        repairSpecId: null,
      };
    }

    const usedIds = new Set(updatedDay.routine.map((item) => item.exerciseId));
    usedIds.delete(currentExercise.id);

    const substitutionCandidates = rankSubstitutionCandidates({
      current: currentExercise,
      section: "main",
      available: context.available,
      context: context.selectionContext,
    }).map((entry) => entry.exercise);

    const globalCandidates = exercises
      .filter((candidate) => candidate.category === "main")
      .sort((left, right) => {
        const rightScore =
          scoreExerciseForContext(right, "main", context.selectionContext, context.available) +
          focusOverlapScore(right, updatedDay.focusTags);
        const leftScore =
          scoreExerciseForContext(left, "main", context.selectionContext, context.available) +
          focusOverlapScore(left, updatedDay.focusTags);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return left.id.localeCompare(right.id);
      });

    const pool = new Map<string, Exercise>();
    [...substitutionCandidates, ...globalCandidates].forEach((candidate) => {
      if (!pool.has(candidate.id)) {
        pool.set(candidate.id, candidate);
      }
    });

    let hasEquipmentEligible = false;
    let hasPhaseEligible = false;
    let hasContextEligible = false;
    let hasBudgetEligible = false;

    const patternCounts = countBudgetPatterns(updatedDay);
    const laneCounts = toMainLaneCounts(patternCounts);
    const currentLaneHits = getMainLaneHits(currentExercise);
    const budgetRepairSpec = buildBudgetRepairCandidateSpec({
      day: updatedDay,
      overflowPattern: offendingLane,
      context,
      budget,
      patternCounts,
    });
    const missingLanes = (Object.entries(budget.mainMin ?? {}) as Array<[MainLane, number]>)
      .filter(([, min]) => Number.isFinite(min))
      .filter(([lane, min]) => laneCounts[lane] < min)
      .map(([lane]) => lane);
    const slotId = makeDaySlotId(updatedDay, targetIndex, "main");
    const candidatePool = Array.from(pool.values());

    const scoredCandidates = candidatePool
      .filter((candidate) => {
        if (candidate.id === currentExercise.id) return false;
        const equipmentEligible =
          isExerciseEligible(candidate, context.available) &&
          isExerciseAllowedForSection(candidate, "main");
        if (!equipmentEligible) return false;
        hasEquipmentEligible = true;
        if (!isEligibleForPhase(candidate, context.selectionContext.phaseName, context.selectionContext)) {
          return false;
        }
        hasPhaseEligible = true;
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available: context.available,
            section: "main",
            context: context.selectionContext,
          })
        ) {
          return false;
        }
        hasContextEligible = true;
        if (
          spec?.mustNotInclude?.some((ruleEntry) =>
            matchesRule(candidate, ruleEntry, "main")
          )
        ) {
          return false;
        }
        const candidateLaneHits = getMainLaneHits(candidate);
        if (!budgetRepairSpec && !candidateLaneHits.length) return false;
        const projectedCounts: Record<MainLane, number> = { ...laneCounts };
        currentLaneHits.forEach((hit) => {
          projectedCounts[hit] = Math.max(0, projectedCounts[hit] - 1);
        });
        candidateLaneHits.forEach((hit) => {
          projectedCounts[hit] += 1;
        });
        const violatesMax = (Object.keys(effectiveMax) as MainLane[]).some((lane) => {
          const max = effectiveMax[lane];
          return typeof max === "number" && projectedCounts[lane] > max;
        });
        if (budgetRepairSpec) {
          const violatesNonOffendingMax = (Object.keys(effectiveMax) as MainLane[]).some(
            (lane) => {
              if (lane === offendingLane) return false;
              const max = effectiveMax[lane];
              if (typeof max !== "number") return false;
              if (projectedCounts[lane] <= max) return false;
              return projectedCounts[lane] > laneCounts[lane];
            }
          );
          if (violatesNonOffendingMax) return false;
          if (projectedCounts[offendingLane] >= laneCounts[offendingLane]) return false;
        } else if (violatesMax) {
          return false;
        }
        if (budgetRepairSpec) {
          const simulatedDay = replaceDayItemExercise(updatedDay, targetIndex, candidate);
          const repairValidation = daySatisfiesSpec(simulatedDay, budgetRepairSpec.spec);
          if (!repairValidation.ok) return false;
        }
        hasBudgetEligible = true;
        return true;
      })
      .map((candidate) => {
        const candidateLaneHits = getMainLaneHits(candidate);
        const projectedCounts: Record<MainLane, number> = { ...laneCounts };
        currentLaneHits.forEach((hit) => {
          projectedCounts[hit] = Math.max(0, projectedCounts[hit] - 1);
        });
        candidateLaneHits.forEach((hit) => {
          projectedCounts[hit] += 1;
        });
        const slotKind = slotKindByMainLane[offendingLane];
        const detail = scoreExerciseForContextDetailed(
          candidate,
          "main",
          context.selectionContext,
          context.available,
          {
            slotId,
            dayTitle: updatedDay.title,
            dayFocusTags: updatedDay.focusTags,
            slotKind,
            slotLane: offendingLane,
            capabilityMode: context.capabilityMode,
            dayBudget: budget,
          }
        );
        const capabilityBonus = getCapabilitySlotBonus({
          exercise: candidate,
          section: "main",
          auditMeta: {
            slotId,
            dayTitle: updatedDay.title,
            dayFocusTags: updatedDay.focusTags,
            slotKind,
            capabilityMode: context.capabilityMode,
          },
        });
        let score = detail.score + capabilityBonus.bonus;
        score += focusOverlapScore(candidate, updatedDay.focusTags);
        if (budgetRepairSpec) {
          const projectedPatternCounts = countBudgetPatterns(
            replaceDayItemExercise(updatedDay, targetIndex, candidate)
          );
          budgetRepairSpec.patternKeys.forEach((patternKey) => {
            if (patternCounts[patternKey] <= 0 && projectedPatternCounts[patternKey] > 0) {
              score += 4;
            } else if (projectedPatternCounts[patternKey] > patternCounts[patternKey]) {
              score += 1;
            }
          });
          score += 1.5;
        } else {
          candidateLaneHits.forEach((lane) => {
            const minRequired = budget.mainMin?.[lane] ?? 0;
            if (minRequired > 0 && laneCounts[lane] < minRequired) {
              score += 6;
            } else if (minRequired > 0 && projectedCounts[lane] <= minRequired) {
              score += 3;
            }
            const maxAllowed = effectiveMax[lane];
            if (typeof maxAllowed === "number" && projectedCounts[lane] < maxAllowed) {
              score += 0.5;
            }
          });
          if (candidateLaneHits.some((lane) => missingLanes.includes(lane))) {
            score += 4;
          }
          if (!candidateLaneHits.includes(offendingLane)) {
            score += 2;
          }
        }
        return { candidate, score };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.candidate.id.localeCompare(right.candidate.id);
      });

    if (scoredCandidates.length > 0) {
      return {
        replacement: scoredCandidates[0]?.candidate ?? null,
        reason: "no candidates",
        candidatePoolSize: candidatePool.length,
        eligibleCount: scoredCandidates.length,
        repairSpecId: budgetRepairSpec?.spec.id ?? null,
      };
    }
    if (!hasEquipmentEligible) {
      return {
        replacement: null,
        reason: "equipment limits",
        candidatePoolSize: candidatePool.length,
        eligibleCount: 0,
        repairSpecId: budgetRepairSpec?.spec.id ?? null,
      };
    }
    if (!hasPhaseEligible) {
      return {
        replacement: null,
        reason: "phase gate",
        candidatePoolSize: candidatePool.length,
        eligibleCount: 0,
        repairSpecId: budgetRepairSpec?.spec.id ?? null,
      };
    }
    if (!hasContextEligible) {
      return {
        replacement: null,
        reason: "pain gate",
        candidatePoolSize: candidatePool.length,
        eligibleCount: 0,
        repairSpecId: budgetRepairSpec?.spec.id ?? null,
      };
    }
    if (!hasBudgetEligible) {
      return {
        replacement: null,
        reason: "no candidates",
        candidatePoolSize: candidatePool.length,
        eligibleCount: 0,
        repairSpecId: budgetRepairSpec?.spec.id ?? null,
      };
    }
    return {
      replacement: null,
      reason: "no candidates",
      candidatePoolSize: candidatePool.length,
      eligibleCount: 0,
      repairSpecId: budgetRepairSpec?.spec.id ?? null,
    };
  };

  const attemptDemotion = (targetIndex: number, offendingLane: MainLane) => {
    const currentItem = updatedDay.routine[targetIndex];
    if (!currentItem || currentItem.section !== "main") return false;
    const accessoryCount = updatedDay.routine.filter(
      (item) => item.section === "accessory"
    ).length;
    if (accessoryCount >= accessoryMax) return false;

    const nextRoutine = [...updatedDay.routine];
    nextRoutine[targetIndex] = {
      ...currentItem,
      section: "accessory",
      sets: currentItem.sets ?? "2",
      reps: currentItem.reps ?? "10-15",
      restSec: Math.max(45, currentItem.restSec ?? 45),
    };
    const demotedDay: ProgramDay = { ...updatedDay, routine: nextRoutine };
    const mainCounts = toMainLaneCounts(countBudgetPatterns(demotedDay));
    const stillViolatesMax =
      typeof effectiveMax[offendingLane] === "number" &&
      mainCounts[offendingLane] > (effectiveMax[offendingLane] ?? 0);
    if (stillViolatesMax) return false;
    const violatesMin = (Object.entries(budget.mainMin ?? {}) as Array<[MainLane, number]>).some(
      ([lane, min]) => mainCounts[lane] < min
    );
    if (violatesMin) return false;
    if (spec && !daySatisfiesSpec(demotedDay, spec).ok) return false;
    updatedDay = demotedDay;
    return true;
  };

  const attemptDropOverflowMain = (targetIndex: number, offendingLane: MainLane) => {
    const currentItem = updatedDay.routine[targetIndex];
    if (!currentItem || currentItem.section !== "main") return false;
    const droppedDay: ProgramDay = {
      ...updatedDay,
      routine: updatedDay.routine.filter((_, index) => index !== targetIndex),
    };
    const mainCounts = toMainLaneCounts(countBudgetPatterns(droppedDay));
    const stillViolatesMax =
      typeof effectiveMax[offendingLane] === "number" &&
      mainCounts[offendingLane] > (effectiveMax[offendingLane] ?? 0);
    if (stillViolatesMax) return false;
    const violatesMin = (Object.entries(budget.mainMin ?? {}) as Array<[MainLane, number]>).some(
      ([lane, min]) => mainCounts[lane] < min
    );
    if (violatesMin) return false;
    if (spec && !daySatisfiesSpec(droppedDay, spec).ok) return false;
    updatedDay = droppedDay;
    return true;
  };

  (Object.keys(effectiveMax) as MainLane[]).forEach((lane) => {
    const maxAllowed = effectiveMax[lane];
    if (typeof maxAllowed !== "number") return;
    let resolvedMaxAllowed = maxAllowed;
    let guard = 0;
    while (countBudgetPatterns(updatedDay)[lane] > resolvedMaxAllowed && guard < 30) {
      guard += 1;
      const target = selectOffendingEntry(lane);
      if (!target) {
        const unresolved: DayBudgetViolationRecord = {
          pattern: lane,
          dayTitle: day.title,
          slotId: `${normalizeSlotToken(day.title)}-missing-target-${guard}`,
          exerciseId: "unknown",
          reason: "no candidates",
        };
        budgetReport.unresolvedViolations.push(unresolved);
        warnings.push({
          kind: "violation",
          message: `[budget_unresolved] ${JSON.stringify(unresolved)}`,
        });
        break;
      }

      const replacementResult = findBudgetAwareReplacement({
        targetIndex: target.index,
        offendingLane: lane,
      });
      if (replacementResult.replacement) {
        const fromExerciseId = target.exercise.id;
        updatedDay = replaceDayItemExercise(
          updatedDay,
          target.index,
          replacementResult.replacement,
          "coverage_repair"
        );
        budgetReport.resolvedViolations.push({
          pattern: lane,
          dayTitle: day.title,
          slotId: target.slotId,
          exerciseId: fromExerciseId,
          reason: `swapped to ${replacementResult.replacement.id}`,
        });
        resolvedMaxAllowed = effectiveMax[lane] ?? resolvedMaxAllowed;
        continue;
      }

      if (attemptDemotion(target.index, lane)) {
        budgetReport.resolvedViolations.push({
          pattern: lane,
          dayTitle: day.title,
          slotId: target.slotId,
          exerciseId: target.exercise.id,
          reason: "demoted to accessory",
        });
        resolvedMaxAllowed = effectiveMax[lane] ?? resolvedMaxAllowed;
        continue;
      }

      if (attemptDropOverflowMain(target.index, lane)) {
        budgetReport.resolvedViolations.push({
          pattern: lane,
          dayTitle: day.title,
          slotId: target.slotId,
          exerciseId: target.exercise.id,
          reason: "dropped overflow main",
        });
        resolvedMaxAllowed = effectiveMax[lane] ?? resolvedMaxAllowed;
        continue;
      }

      if (canRelaxBudgetForLane(lane)) {
        const fromMax: number = effectiveMax[lane] ?? resolvedMaxAllowed;
        const toMax: number = fromMax + 1;
        effectiveMax[lane] = toMax;
        relaxUsed = true;
        const relaxRecord: DayBudgetRelaxRecord = {
          pattern: lane,
          dayTitle: day.title,
          fromMax,
          toMax,
          reason: "no eligible candidates for replacement",
        };
        budgetReport.relaxedBudgets.push(relaxRecord);
        warnings.push({
          kind: "violation",
          message: `[budget_relaxed] ${JSON.stringify(relaxRecord)}`,
        });
        resolvedMaxAllowed = toMax;
        continue;
      }

      const unresolved: DayBudgetViolationRecord = {
        pattern: lane,
        dayTitle: day.title,
        slotId: target.slotId,
        exerciseId: target.exercise.id,
        reason: `${replacementResult.reason};pool=${replacementResult.candidatePoolSize};eligible=${replacementResult.eligibleCount};spec=${replacementResult.repairSpecId ?? "default"}`,
      };
      budgetReport.unresolvedViolations.push(unresolved);
      warnings.push({
        kind: "violation",
        message: `[budget_unresolved] ${JSON.stringify(unresolved)}`,
      });
      break;
    }
  });

  return {
    day: updatedDay,
    warnings: collectDedupedWarnings(warnings),
    budgetReport,
  };
};

const getRequiredMainPatternRules = (contract: DayConstraintSpec) =>
  contract.mustInclude.filter((rule) => rule.id.toLowerCase().includes("required_main_"));

const laneForRequiredMainPatternRule = (rule: RequirementRule): MainLane | null => {
  const id = rule.id.toLowerCase();
  if (id.includes("required_main_vertical_push")) return "verticalPush";
  if (id.includes("required_main_push")) return "push";
  if (id.includes("required_main_pull")) return "pull";
  if (id.includes("required_main_squat")) return "squat";
  if (id.includes("required_main_hinge")) return "hinge";
  return null;
};

const countMainMatchesForRule = (day: ProgramDay, rule: RequirementRule) =>
  buildDayEntries(day).filter(
    (entry) => entry.item.section === "main" && matchesRule(entry.exercise, rule, "main")
  ).length;

const scoreMainEntryForContractRepair = (params: {
  day: ProgramDay;
  entry: ReturnType<typeof buildDayEntries>[number];
  lane: MainLane;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
}) => {
  const { day, entry, lane, context, budget } = params;
  const slotKind = slotKindByMainLane[lane];
  const detail = scoreExerciseForContextDetailed(
    entry.exercise,
    "main",
    context.selectionContext,
    context.available,
    {
      slotId: entry.slotId,
      dayTitle: day.title,
      dayFocusTags: day.focusTags,
      slotKind,
      slotLane: lane,
      capabilityMode: context.capabilityMode,
      dayBudget: budget,
    }
  );
  const capabilityBonus = getCapabilitySlotBonus({
    exercise: entry.exercise,
    section: "main",
    auditMeta: {
      slotId: entry.slotId,
      dayTitle: day.title,
      dayFocusTags: day.focusTags,
      slotKind,
      slotLane: lane,
      capabilityMode: context.capabilityMode,
      dayBudget: budget,
    },
  });
  return detail.score + capabilityBonus.bonus;
};

const getPatternRepairPriorityBonus = (params: {
  exercise: Exercise;
  lane: MainLane;
  context: DayConstraintRepairContext;
}) => {
  const { exercise, lane, context } = params;
  if (context.capabilityMode !== "bandOnly" || lane !== "push") return 0;
  if (exercise.id === "band-chest-press") return 6;
  if (exercise.id === "pushup") return 5;
  if (exercise.id.includes("pushup")) return 4;
  if (exercise.id === "incline-pushup") return 3;
  return 0;
};

const findBestMainCandidateForRequiredPattern = (params: {
  day: ProgramDay;
  requiredRule: RequirementRule;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
  contract: DayConstraintSpec;
  complementaryRules?: RequirementRule[];
}): Exercise | null => {
  const { day, requiredRule, context, budget, contract, complementaryRules } = params;
  const lane = laneForRequiredMainPatternRule(requiredRule) ?? "pull";
  const usedIds = new Set(day.routine.map((item) => item.exerciseId));
  const laneCounts = countMainLanes(day);
  const coherenceRules =
    complementaryRules && complementaryRules.length ? complementaryRules : [requiredRule];

  const candidates = exercises
    .filter((exercise) => {
      if (exercise.category !== "main") return false;
      // Contract repair never duplicates exercises inside a day.
      if (usedIds.has(exercise.id)) return false;
      if (!matchesRule(exercise, requiredRule, "main")) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
        })
      ) {
        return false;
      }
      if (
        contract.mustNotInclude.some((rule) => matchesRule(exercise, rule, "main"))
      ) {
        return false;
      }
      return true;
    })
    .map((exercise) => {
      const slotId = `${normalizeSlotToken(day.title)}-contract-${requiredRule.id}`;
      const slotKind = slotKindByMainLane[lane];
      const detail = scoreExerciseForContextDetailed(
        exercise,
        "main",
        context.selectionContext,
        context.available,
        {
          slotId,
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind,
          slotLane: lane,
          capabilityMode: context.capabilityMode,
          dayBudget: budget,
        }
      );
      const capabilityBonus = getCapabilitySlotBonus({
        exercise,
        section: "main",
        auditMeta: {
          slotId,
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind,
          slotLane: lane,
          capabilityMode: context.capabilityMode,
          dayBudget: budget,
        },
      });
      return {
        exercise,
        score: (() => {
          const candidateLaneHits = getMainLaneHits(exercise);
          const redundancyPenalty = candidateLaneHits.reduce((sum, hitLane) => {
            const projected = laneCounts[hitLane] + 1;
            if (projected <= 1) return sum;
            return sum + (projected - 1) * 1.5;
          }, 0);
          const complementaryBonus = coherenceRules.reduce((sum, coherenceRule) => {
            const isMissing =
              countMainMatchesForRule(day, coherenceRule) < requiredRuleCount(coherenceRule);
            if (!isMissing) return sum;
            return sum + (matchesRule(exercise, coherenceRule, "main") ? 2 : 0);
          }, 0);
          return (
            detail.score +
            capabilityBonus.bonus +
            focusOverlapScore(exercise, day.focusTags) +
            getPatternRepairPriorityBonus({
              exercise,
              lane,
              context,
            }) +
            complementaryBonus -
            redundancyPenalty
          );
        })(),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  return candidates[0]?.exercise ?? null;
};

const canReplaceMainWithoutBreakingRequiredPatterns = (params: {
  day: ProgramDay;
  entry: ReturnType<typeof buildDayEntries>[number];
  requiredRules: RequirementRule[];
  requiredRuleBeingFilled: RequirementRule;
}) => {
  const { day, entry, requiredRules, requiredRuleBeingFilled } = params;
  return requiredRules.every((rule) => {
    if (rule.id === requiredRuleBeingFilled.id) return true;
    const currentCount = countMainMatchesForRule(day, rule);
    const removed = matchesRule(entry.exercise, rule, "main") ? 1 : 0;
    return currentCount - removed >= requiredRuleCount(rule);
  });
};

const findReplacementTargetForRequiredPattern = (params: {
  day: ProgramDay;
  requiredRule: RequirementRule;
  requiredRules: RequirementRule[];
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
}) => {
  const { day, requiredRule, requiredRules, context, budget } = params;
  const lane = laneForRequiredMainPatternRule(requiredRule) ?? "pull";

  return buildDayEntries(day)
    .filter((entry) => entry.item.section === "main")
    .filter((entry) =>
      canReplaceMainWithoutBreakingRequiredPatterns({
        day,
        entry,
        requiredRules,
        requiredRuleBeingFilled: requiredRule,
      })
    )
    .map((entry) => {
      const duplicatePatternCount = requiredRules.reduce((count, rule) => {
        if (!matchesRule(entry.exercise, rule, "main")) return count;
        const currentCount = countMainMatchesForRule(day, rule);
        return count + (currentCount > requiredRuleCount(rule) ? 1 : 0);
      }, 0);

      const laneHits = getMainLaneHits(entry.exercise);
      const laneDuplicateCount = laneHits.reduce((count, hitLane) => {
        const hitRule = requiredRules.find(
          (rule) => laneForRequiredMainPatternRule(rule) === hitLane
        );
        if (!hitRule) return count;
        const currentCount = countMainMatchesForRule(day, hitRule);
        return count + (currentCount > requiredRuleCount(hitRule) ? 1 : 0);
      }, 0);

      const score = scoreMainEntryForContractRepair({
        day,
        entry,
        lane,
        context,
        budget,
      });

      return {
        entry,
        duplicatePatternCount,
        laneDuplicateCount,
        score,
      };
    })
    .sort((left, right) => {
      if (left.duplicatePatternCount !== right.duplicatePatternCount) {
        return right.duplicatePatternCount - left.duplicatePatternCount;
      }
      if (left.laneDuplicateCount !== right.laneDuplicateCount) {
        return right.laneDuplicateCount - left.laneDuplicateCount;
      }
      if (left.score !== right.score) return left.score - right.score;
      return left.entry.index - right.entry.index;
    })[0]?.entry;
};

const enforceDayContract = (params: {
  day: ProgramDay;
  contract: DayConstraintSpec | null;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
}): DayConstraintRepairResult => {
  const { day, contract, context, budget } = params;
  if (!contract) return { day, warnings: [] };

  let updatedDay: ProgramDay = ensureDistinctRoutine(
    { ...day, routine: [...day.routine] },
    context.available,
    context.selectionContext
  );
  const warnings: DayConstraintRepairWarning[] = [];
  const requiredPatternRules = getRequiredMainPatternRules(contract);
  const baselineMainCount = day.routine.filter((item) => item.section === "main").length;

  requiredPatternRules.forEach((requiredRule) => {
    const targetCount = requiredRuleCount(requiredRule);
    let guard = 0;
    while (countMainMatchesForRule(updatedDay, requiredRule) < targetCount && guard < 8) {
      guard += 1;
      const candidate = findBestMainCandidateForRequiredPattern({
        day: updatedDay,
        requiredRule,
        context,
        budget,
        contract,
        complementaryRules: requiredPatternRules,
      });
      if (!candidate) {
        warnings.push({
          kind: "missing",
          message: `Contract repair could not find eligible main for "${ruleLabel(requiredRule)}".`,
        });
        break;
      }

      const replacementTarget = findReplacementTargetForRequiredPattern({
        day: updatedDay,
        requiredRule,
        requiredRules: requiredPatternRules,
        context,
        budget,
      });

      if (replacementTarget) {
        updatedDay = replaceDayItemExercise(updatedDay, replacementTarget.index, candidate);
        continue;
      }

      warnings.push({
        kind: "missing",
        message: `Contract repair could not replace a MAIN to satisfy "${ruleLabel(requiredRule)}" on ${day.title}.`,
      });
      break;
    }
  });

  updatedDay = ensureDistinctRoutine(updatedDay, context.available, context.selectionContext);

  const uniqueIds = new Set(updatedDay.routine.map((item) => item.exerciseId));
  if (uniqueIds.size !== updatedDay.routine.length) {
    const message = `Contract repair produced duplicate exercise IDs on ${day.title}.`;
    if (process.env.NODE_ENV === "test") {
      throw new Error(message);
    }
    warnings.push({ kind: "violation", message });
  }

  const finalMainCount = updatedDay.routine.filter((item) => item.section === "main").length;
  if (finalMainCount !== baselineMainCount) {
    const message = `Contract repair changed MAIN count on ${day.title} (${baselineMainCount} -> ${finalMainCount}).`;
    if (process.env.NODE_ENV === "test") {
      throw new Error(message);
    }
    warnings.push({ kind: "violation", message });
  }

  return {
    day: updatedDay,
    warnings: collectDedupedWarnings(warnings),
  };
};

const isUpperPushDayTitle = (title: string) => title.toLowerCase().includes("upper push");

const isUpperPullDayTitle = (title: string) => title.toLowerCase().includes("upper pull");

const uniqueRulesById = (rules: RequirementRule[]) => {
  const map = new Map<string, RequirementRule>();
  rules.forEach((rule) => {
    if (!map.has(rule.id)) {
      map.set(rule.id, rule);
    }
  });
  return Array.from(map.values());
};

const EMPTY_DAY_CONTRACT: DayConstraintSpec = {
  id: "coherence_fallback_contract",
  mustInclude: [],
  mustNotInclude: [],
  optionalInclude: [],
};

const canSatisfyMainRule = (params: {
  day: ProgramDay;
  rule: RequirementRule;
  preserveRules: RequirementRule[];
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
  contract: DayConstraintSpec;
}) => {
  const { day, rule, preserveRules, context, budget, contract } = params;
  if (countMainMatchesForRule(day, rule) >= requiredRuleCount(rule)) return true;
  return Boolean(
    findBestMainCandidateForRequiredPattern({
      day,
      requiredRule: rule,
      context,
      budget,
      contract,
      complementaryRules: preserveRules,
    })
  );
};

const enforceMainRulesBySwap = (params: {
  day: ProgramDay;
  rules: RequirementRule[];
  preserveRules: RequirementRule[];
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
  contract: DayConstraintSpec;
  warningPrefix: string;
}) => {
  const { day, rules, preserveRules, context, budget, contract, warningPrefix } = params;
  if (!rules.length) {
    return { day, warnings: [] as DayConstraintRepairWarning[] };
  }
  let updatedDay = { ...day, routine: [...day.routine] };
  const warnings: DayConstraintRepairWarning[] = [];
  const allRules = uniqueRulesById([...preserveRules, ...rules]);

  rules.forEach((requiredRule) => {
    let guard = 0;
    const targetCount = requiredRuleCount(requiredRule);
    while (countMainMatchesForRule(updatedDay, requiredRule) < targetCount && guard < 8) {
      guard += 1;
      const currentlyCovered = allRules.filter((rule) => {
        if (rule.id === requiredRule.id) return true;
        return countMainMatchesForRule(updatedDay, rule) >= requiredRuleCount(rule);
      });
      const candidate = findBestMainCandidateForRequiredPattern({
        day: updatedDay,
        requiredRule,
        context,
        budget,
        contract,
        complementaryRules: allRules,
      });
      if (!candidate) {
        warnings.push({
          kind: "missing",
          message: `${warningPrefix}: no eligible main for "${ruleLabel(requiredRule)}".`,
        });
        break;
      }
      const replacementTarget = findReplacementTargetForRequiredPattern({
        day: updatedDay,
        requiredRule,
        requiredRules: currentlyCovered.length ? currentlyCovered : [requiredRule],
        context,
        budget,
      });
      if (!replacementTarget) {
        warnings.push({
          kind: "missing",
          message: `${warningPrefix}: cannot replace MAIN for "${ruleLabel(requiredRule)}".`,
        });
        break;
      }
      updatedDay = replaceDayItemExercise(updatedDay, replacementTarget.index, candidate);
    }
  });

  return {
    day: updatedDay,
    warnings: collectDedupedWarnings(warnings),
  };
};

const enforceDayMainCoherence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
}) => {
  const { day, daysPerWeek, context, budget } = params;
  const contract =
    resolveDayConstraintSpec({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    }) ?? EMPTY_DAY_CONTRACT;
  const preserveRules = getRequiredMainPatternRules(contract);
  const desiredRules: RequirementRule[] = [];

  if (isUpperPushDayTitle(day.title)) {
    const canHorizontal = canSatisfyMainRule({
      day,
      rule: horizontalPushMainRule,
      preserveRules,
      context,
      budget,
      contract,
    });
    const canVertical = canSatisfyMainRule({
      day,
      rule: verticalPushMainRule,
      preserveRules,
      context,
      budget,
      contract,
    });
    if (canHorizontal && canVertical) {
      desiredRules.push(horizontalPushMainRule, verticalPushMainRule);
    }
  }

  if (isUpperPullDayTitle(day.title)) {
    const canRow = canSatisfyMainRule({
      day,
      rule: rowPullMainRule,
      preserveRules,
      context,
      budget,
      contract,
    });
    const canVertical = canSatisfyMainRule({
      day,
      rule: verticalPullMainRule,
      preserveRules,
      context,
      budget,
      contract,
    });
    if (canRow && canVertical) {
      desiredRules.push(rowPullMainRule, verticalPullMainRule);
    } else if (canRow) {
      if (context.capabilityMode === "hasLoad") {
        // In loaded contexts, avoid forcing low-load scap drills into MAIN pull slots.
        desiredRules.push(rowPullMainRule);
      } else {
        desiredRules.push(rowPullMainRule, secondaryPullAngleMainRule);
      }
    }
  }

  if (isLowerDayForCoverage(day)) {
    const painBlocksHingeRequirement =
      context.selectionContext.painSeverity === "high" &&
      context.selectionContext.intentProfile.avoidPatterns.includes("heavy_hinge") &&
      context.selectionContext.painAreas.some((area) => {
        const token = normalizeTagToken(area);
        return token.includes("hip") || token.includes("knee") || token.includes("low_back");
      }) &&
      context.selectionContext.phaseStage !== "growth";

    const canSquat = canSatisfyMainRule({
      day,
      rule: lowerSquatMainRule,
      preserveRules,
      context,
      budget,
      contract,
    });
    const canHinge = !painBlocksHingeRequirement
      ? canSatisfyMainRule({
          day,
          rule: lowerHingeMainRule,
          preserveRules,
          context,
          budget,
          contract,
        })
      : false;

    if (canSquat && canHinge) {
      desiredRules.push(lowerSquatMainRule, lowerHingeMainRule);
    }
  }

  return enforceMainRulesBySwap({
    day,
    rules: uniqueRulesById(desiredRules),
    preserveRules,
    context,
    budget,
    contract,
    warningPrefix: `${day.title} coherence`,
  });
};

const ensureDayHasDumbbellMain = (params: {
  day: ProgramDay;
  context: DayConstraintRepairContext;
  budget: DayPatternBudget | null;
}) => {
  const { day, context, budget } = params;
  if (context.capabilityMode !== "hasLoad") return day;
  if (!context.available.has("dumbbells")) return day;
  const availableForDay = resolveEligibilityAvailabilityForDay(day.title, context.available);
  const benchUnavailable = !availableForDay.has("bench");
  const skipBackChestBeginnerActivationDumbbellGuarantee =
    isBackChestDayTitle(day.title) &&
    context.selectionContext.experienceLevel === "beginner" &&
    context.selectionContext.phaseStage === "activation" &&
    availableForDay.has("machines");
  if (skipBackChestBeginnerActivationDumbbellGuarantee) return day;
  const protectBackChestActivationMachinePress =
    isBackChestDayTitle(day.title) &&
    context.selectionContext.experienceLevel === "beginner" &&
    context.selectionContext.phaseStage === "activation";

  const mainEntries = buildDayEntries(day)
    .filter((entry) => entry.item.section === "main")
    .filter((entry) =>
      !(
        protectBackChestActivationMachinePress &&
        entry.exercise.id === "machine-chest-press"
      )
    );
  if (!mainEntries.length) return day;
  if (mainEntries.some((entry) => entry.exercise.equipment.includes("dumbbells"))) return day;
  const plannedThreeDaySlotKinds = get3DayMainLanePlan(day.title, mainEntries.length) ?? null;

  const usedIds = new Set(day.routine.map((item) => item.exerciseId));
  const candidatesByTarget = mainEntries
    .map((entry, mainOrdinal) => {
      const overlapPatterns = new Set(
        entry.exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
      );
      const usedWithoutCurrent = new Set(usedIds);
      usedWithoutCurrent.delete(entry.exercise.id);
      const plannedSlot = plannedThreeDaySlotKinds?.[mainOrdinal];
      const slotLane = (plannedSlot?.lane as MainLane | undefined) ?? getMainLaneHits(entry.exercise)[0] ?? "pull";
      const slotKind = plannedSlot?.slotKind ?? slotKindByMainLane[slotLane];
      const preferredNoBenchIdsForLane =
        slotLane === "push"
          ? ["dumbbell-floor-press", "dumbbell-shoulder-press", "dumbbell-arnold-press"]
          : slotLane === "pull"
          ? ["dumbbell-rows", "dumbbell-chest-supported-row", "single-arm-dumbbell-row"]
          : slotLane === "squat"
          ? ["goblet-squat", "dumbbell-squat"]
          : slotLane === "hinge"
          ? ["dumbbell-rdl", "dumbbell-romanian-deadlift"]
          : [];

      const bestCandidate = exercises
        .filter((candidate) => {
          if (candidate.category !== "main") return false;
          if (!candidate.equipment.includes("dumbbells")) return false;
          if (usedWithoutCurrent.has(candidate.id)) return false;
          if (isShouldersArmsDayTitle(day.title)) {
            if (
              !matchesShouldersArmsMainSlotKind({
                exercise: candidate,
                slotKind,
                slotLane,
                dayTitle: day.title,
              })
            ) {
              return false;
            }
          } else if (isBackChestDayTitle(day.title)) {
            if (!matchesBackChestMainSlotKind({ exercise: candidate, slotKind, slotLane })) {
              return false;
            }
          } else {
            const candidateLanes = getMainLaneHits(candidate);
            if (candidateLanes.length && !candidateLanes.includes(slotLane)) return false;
          }
          if (
            !candidate.movementPattern.some((pattern) =>
              overlapPatterns.has(normalizeTagToken(pattern))
            )
          ) {
            return false;
          }
          return isExerciseEligibleForProgramContext({
            exercise: candidate,
            available: availableForDay,
            section: "main",
            context: context.selectionContext,
          });
        })
        .map((candidate) => {
          const detail = scoreExerciseForContextDetailed(
            candidate,
            "main",
            context.selectionContext,
            availableForDay,
            {
              slotId: entry.slotId,
              dayTitle: day.title,
              dayFocusTags: day.focusTags,
              slotKind,
              slotLane,
              capabilityMode: context.capabilityMode,
              dayBudget: budget,
            }
          );
          const capabilityBonus = getCapabilitySlotBonus({
            exercise: candidate,
            section: "main",
            auditMeta: {
              slotId: entry.slotId,
              dayTitle: day.title,
              dayFocusTags: day.focusTags,
              slotKind,
              slotLane,
              capabilityMode: context.capabilityMode,
              dayBudget: budget,
            },
          });
          const noBenchBonus =
            benchUnavailable && !candidate.equipment.includes("bench")
              ? 2
              : benchUnavailable && candidate.equipment.includes("bench")
              ? -2
              : 0;
          const noBenchLanePreferenceBonus =
            benchUnavailable && preferredNoBenchIdsForLane.includes(candidate.id) ? 2 : 0;
          return {
            candidate,
            score:
              detail.score +
              capabilityBonus.bonus +
              focusOverlapScore(candidate, day.focusTags) +
              noBenchBonus +
              noBenchLanePreferenceBonus,
          };
        })
        .sort((left, right) => {
          if (right.score !== left.score) return right.score - left.score;
          return left.candidate.id.localeCompare(right.candidate.id);
        })[0]?.candidate;

      if (!bestCandidate) return null;
      return { entryIndex: entry.index, candidate: bestCandidate };
    })
    .filter(
      (
        item
      ): item is {
        entryIndex: number;
        candidate: Exercise;
      } => Boolean(item)
    );

  const target = candidatesByTarget[0];
  if (!target) return day;
  return replaceDayItemExercise(
    day,
    target.entryIndex,
    target.candidate,
    "day_intelligence_repair"
  );
};

const collectDedupedWarnings = (warnings: DayConstraintRepairWarning[]) => {
  const seen = new Set<string>();
  const deduped: DayConstraintRepairWarning[] = [];
  warnings.forEach((warning) => {
    const key = `${warning.kind}:${warning.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(warning);
  });
  return deduped;
};

export const repairDayToMeetSpec = (
  day: ProgramDay,
  spec: DayConstraintSpec,
  context: DayConstraintRepairContext
): DayConstraintRepairResult => {
  let updatedDay: ProgramDay = {
    ...day,
    routine: [...day.routine],
  };
  const warnings: DayConstraintRepairWarning[] = [];

  spec.mustInclude.forEach((requiredRule) => {
    let currentEntries = buildDayEntries(updatedDay).map((entry) => ({
      item: entry.item,
      exercise: entry.exercise,
    }));
    let currentCount = countMatches(currentEntries, requiredRule);
    const targetCount = requiredRuleCount(requiredRule);
    if (currentCount >= targetCount) return;

    const targetIndexes = getRepairTargetIndexes(updatedDay);
    let repairedAny = false;
    const baselineEntries = buildDayEntries(updatedDay).map((entry) => ({
      item: entry.item,
      exercise: entry.exercise,
    }));
    const requiredRulesWithCoverage = spec.mustInclude.filter(
      (ruleCandidate) =>
        ruleCandidate.id !== requiredRule.id &&
        countMatches(baselineEntries, ruleCandidate) >= requiredRuleCount(ruleCandidate)
    );

    let guard = 0;
    while (currentCount < targetCount && guard < 12) {
      guard += 1;
      let repairedThisPass = false;
      for (const targetIndex of targetIndexes) {
        const replacement = findReplacementExerciseForRule({
          day: updatedDay,
          itemIndex: targetIndex,
          requiredRule,
          avoidRules: spec.mustNotInclude,
          available: context.available,
          selectionContext: context.selectionContext,
        });
        if (!replacement) continue;
        const simulatedDay = replaceDayItemExercise(updatedDay, targetIndex, replacement);
        const simulatedEntries = buildDayEntries(simulatedDay).map((entry) => ({
          item: entry.item,
          exercise: entry.exercise,
        }));
        const preservesExistingCoverage = requiredRulesWithCoverage.every(
          (coveredRule) =>
            countMatches(simulatedEntries, coveredRule) >= requiredRuleCount(coveredRule)
        );
        if (!preservesExistingCoverage) continue;
        const simulatedCount = countMatches(simulatedEntries, requiredRule);
        if (simulatedCount <= currentCount) continue;
        updatedDay = simulatedDay;
        currentEntries = simulatedEntries;
        currentCount = simulatedCount;
        repairedThisPass = true;
        repairedAny = true;
        break;
      }
      if (!repairedThisPass) break;
    }

    if (!repairedAny || currentCount < targetCount) {
      warnings.push({
        kind: "missing",
        message: `Could not satisfy "${ruleLabel(requiredRule)}" on ${day.title} (${currentCount}/${targetCount}).`,
      });
    }
  });

  spec.mustNotInclude.forEach((forbiddenRule) => {
    let guard = 0;
    while (guard < 20) {
      guard += 1;
      const entries = buildDayEntries(updatedDay).filter((entry) =>
        matchesRule(entry.exercise, forbiddenRule, entry.item.section)
      );
      if (!entries.length) break;

      const targetEntry = entries
        .filter(
          (entry) =>
            entry.item.section === "accessory" || entry.item.section === "main"
        )
        .sort((left, right) => {
          const leftPriority = replacementPriorityForEntry({
            day: updatedDay,
            item: left.item,
            exercise: left.exercise,
            focusTags: updatedDay.focusTags,
          });
          const rightPriority = replacementPriorityForEntry({
            day: updatedDay,
            item: right.item,
            exercise: right.exercise,
            focusTags: updatedDay.focusTags,
          });
          if (leftPriority !== rightPriority) return leftPriority - rightPriority;
          return left.index - right.index;
        })[0];

      if (!targetEntry) {
        warnings.push({
          kind: "violation",
          message: `Could not replace violation "${ruleLabel(forbiddenRule)}" on ${day.title}.`,
        });
        break;
      }

      const updatedEntries = buildDayEntries(updatedDay).map((entry) => ({
        item: entry.item,
        exercise: entry.exercise,
      }));
      const missingRules = daySatisfiesSpec(updatedDay, spec).missing;
      const prioritizedRequiredRule = [...missingRules].sort((left, right) => {
        const leftDeficit = requiredRuleCount(left) - countMatches(updatedEntries, left);
        const rightDeficit = requiredRuleCount(right) - countMatches(updatedEntries, right);
        return rightDeficit - leftDeficit;
      })[0];
      const replacement =
        findReplacementExerciseForRule({
          day: updatedDay,
          itemIndex: targetEntry.index,
          requiredRule: prioritizedRequiredRule,
          avoidRules: spec.mustNotInclude,
          available: context.available,
          selectionContext: context.selectionContext,
        }) ??
        findReplacementExerciseForRule({
          day: updatedDay,
          itemIndex: targetEntry.index,
          avoidRules: spec.mustNotInclude,
          available: context.available,
          selectionContext: context.selectionContext,
        });

      if (!replacement) {
        warnings.push({
          kind: "violation",
          message: `Could not remove "${ruleLabel(forbiddenRule)}" from ${day.title}.`,
        });
        break;
      }
      updatedDay = replaceDayItemExercise(updatedDay, targetEntry.index, replacement);
    }
  });

  const finalValidation = daySatisfiesSpec(updatedDay, spec);
  finalValidation.missing.forEach((missingRule) => {
    warnings.push({
      kind: "missing",
      message: `Missing "${ruleLabel(missingRule)}" on ${day.title} after repair.`,
    });
  });
  finalValidation.violations.forEach((violation) => {
    warnings.push({
      kind: "violation",
      message: `Violation "${ruleLabel(violation.rule)}" remained on ${day.title} (${violation.exerciseName}).`,
    });
  });

  return {
    day: updatedDay,
    warnings: collectDedupedWarnings(warnings),
  };
};

const isLowerDayForCoverage = (day: ProgramDay) => {
  const title = day.title.toLowerCase();
  if (title.includes("leg") || title.includes("lower")) return true;
  return day.focusTags.some((tag) => {
    const token = normalizeTagToken(tag);
    return ["legs", "lower", "squat", "hinge", "posterior"].includes(token);
  });
};

const appendCoverageAccessory = (params: {
  day: ProgramDay;
  exerciseId: string;
  painSeverity: PainSeverity;
  note: string;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  accessoryCapacity: number;
  preserveRules?: RequirementRule[];
}) => {
  const {
    day,
    exerciseId,
    painSeverity,
    note,
    context,
    daysPerWeek,
    accessoryCapacity,
    preserveRules = [],
  } = params;
  if (day.routine.some((item) => item.exerciseId === exerciseId)) return day;
  const highPain = painSeverity === "high";
  const base = makeItem(
    exerciseId,
    highPain ? "1-2" : "2",
    highPain ? "8-12" : "10-15",
    undefined,
    highPain ? 75 : 45,
    "accessory"
  );
  const next: ProgramRoutineItem = {
    ...base,
    notes: highPain
      ? appendNote(
          base.notes,
          "Comfort-first accessory: smooth tempo, pain-free range, and stop before strain."
        )
      : appendNote(base.notes, note),
  };
  const accessoryIndexes = day.routine
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.section === "accessory")
    .map((entry) => entry.index);
  if (accessoryIndexes.length < Math.max(0, accessoryCapacity)) {
    return { ...day, routine: [...day.routine, next] };
  }

  const daySpec = resolveDayConstraintSpec({
    day,
    daysPerWeek,
    capabilityMode: context.capabilityMode,
  });
  const protectedRules = (daySpec?.mustInclude ?? []).filter((rule) =>
    rule.sections?.includes("accessory")
  );
  const protectedIndexes = new Set(
    accessoryIndexes.filter((index) => {
      const item = day.routine[index];
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const mustKeepForDaySpec = protectedRules.some((rule) =>
        matchesRule(exercise, rule, "accessory")
      );
      const mustKeepByPreserveRule = preserveRules.some((rule) =>
        matchesRule(exercise, rule, "accessory")
      );
      return mustKeepForDaySpec || mustKeepByPreserveRule;
    })
  );

  const replacementTarget = accessoryIndexes
    .filter((index) => !protectedIndexes.has(index))
    .map((index) => {
      const item = day.routine[index];
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) {
        return { index, score: Number.NEGATIVE_INFINITY };
      }
      const score =
        scoreExerciseForContext(
          exercise,
          "accessory",
          context.selectionContext,
          context.available
        ) + focusOverlapScore(exercise, day.focusTags);
      return { index, score };
    })
    .sort((left, right) => {
      if (left.score !== right.score) return left.score - right.score;
      return left.index - right.index;
    })[0];

  if (!replacementTarget) {
    return day;
  }

  const routine = [...day.routine];
  routine[replacementTarget.index] = next;
  return { ...day, routine };
};

const pickCoverageExerciseId = (params: {
  day: ProgramDay;
  preferredIds: string[];
  matchRule: RequirementRule;
  context: DayConstraintRepairContext;
  week?: ProgramDay[];
  dayIndex?: number;
  daysPerWeek?: 3 | 4 | 5;
}) => {
  const { day, preferredIds, matchRule, context, week, dayIndex, daysPerWeek } = params;
  const usedIds = new Set(day.routine.map((item) => item.exerciseId));

  for (const preferredId of preferredIds) {
    const exercise = exerciseById(preferredId);
    if (!exercise) continue;
    if (usedIds.has(exercise.id)) continue;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      })
    ) {
      continue;
    }
    if (!matchesRule(exercise, matchRule, "accessory")) continue;
    return exercise.id;
  }

  const fallback = exercises
    .filter((candidate) => {
      if (usedIds.has(candidate.id)) return false;
      if (!matchesRule(candidate, matchRule, "accessory")) return false;
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      });
    })
    .map((candidate) => ({
      candidate,
      baseScore:
        scoreExerciseForContext(
          candidate,
          "accessory",
          context.selectionContext,
          context.available
        ) + focusOverlapScore(candidate, day.focusTags),
    }))
    .sort((left, right) => {
      if (right.baseScore !== left.baseScore) {
        return right.baseScore - left.baseScore;
      }

      if (
        week &&
        typeof dayIndex === "number" &&
        daysPerWeek &&
        week[dayIndex]
      ) {
        const simulateWeek = (exerciseId: string) => {
          const dayToPatch = week[dayIndex];
          if (!dayToPatch || dayToPatch.routine.some((item) => item.exerciseId === exerciseId)) {
            return week;
          }
          const simulatedItem = makeItem(
            exerciseId,
            "2",
            "10-15",
            undefined,
            45,
            "accessory"
          );
          const simulatedDay: ProgramDay = {
            ...dayToPatch,
            routine: [...dayToPatch.routine, simulatedItem],
          };
          const nextWeek = [...week];
          nextWeek[dayIndex] = simulatedDay;
          return nextWeek;
        };
        const rightWeekScore = getWeekBalanceTieBreakerScore({
          week: simulateWeek(right.candidate.id),
          daysPerWeek,
          capabilityMode: context.capabilityMode,
          selectionContext: context.selectionContext,
        });
        const leftWeekScore = getWeekBalanceTieBreakerScore({
          week: simulateWeek(left.candidate.id),
          daysPerWeek,
          capabilityMode: context.capabilityMode,
          selectionContext: context.selectionContext,
        });
        if (rightWeekScore !== leftWeekScore) {
          return rightWeekScore - leftWeekScore;
        }
      }

      return left.candidate.id.localeCompare(right.candidate.id);
    })[0]?.candidate;

  return fallback?.id ?? null;
};

const countDaysForCoverageRule = (week: ProgramDay[], rule: RequirementRule) =>
  week.reduce((count, day) => {
    const entries = buildDayEntries(day).map((entry) => ({
      item: entry.item,
      exercise: entry.exercise,
    }));
    return count + (countMatches(entries, rule) > 0 ? 1 : 0);
  }, 0);

export const summarizeWeekCoverage = (week: ProgramDay[]): WeekCoverageSummary => {
  return {
    calvesDays: countDaysForCoverageRule(week, calvesRule),
    bicepsDays: countDaysForCoverageRule(week, bicepsIsolationRule),
    tricepsDays: countDaysForCoverageRule(week, tricepsIsolationRule),
    squatDays: countDaysForCoverageRule(week, squatRule),
    hingeDays: countDaysForCoverageRule(week, hingeRule),
    pullDays: countDaysForCoverageRule(week, pullBackRule),
    pushDays: countDaysForCoverageRule(week, pushChestRule),
    antiRotationDays: countDaysForCoverageRule(week, antiRotationRule),
    carryDays: countDaysForCoverageRule(week, carryRule),
    scapularDays: countDaysForCoverageRule(week, scapPostureRule),
  };
};

const getWeekBalanceTieBreakerScore = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  capabilityMode: EquipmentCapabilityMode;
  selectionContext: SelectionContext;
}) => {
  const { week, daysPerWeek, capabilityMode, selectionContext } = params;
  const coverage = summarizeWeekCoverage(week);
  let score = 0;

  const pushPullDiff = Math.abs(coverage.pushDays - coverage.pullDays);
  score += pushPullDiff <= 1 ? 2 : -2 * (pushPullDiff - 1);

  const lowerPainRestricted =
    selectionContext.painSeverity === "high" &&
    selectionContext.painAreas.some((area) => {
      const token = normalizeTagToken(area);
      return token.includes("hip") || token.includes("knee") || token.includes("low_back");
    });
  const enforceLoadedLowerMinima =
    daysPerWeek >= 4 && capabilityMode === "hasLoad" && !lowerPainRestricted;
  if (enforceLoadedLowerMinima) {
    score += coverage.squatDays >= 2 ? 1.5 : -1.5 * (2 - coverage.squatDays);
    score += coverage.hingeDays >= 2 ? 1.5 : -1.5 * (2 - coverage.hingeDays);
  }

  score += coverage.scapularDays >= 2 ? 1 : -1 * (2 - coverage.scapularDays);
  score +=
    coverage.antiRotationDays >= 2 ? 1 : -1 * (2 - coverage.antiRotationDays);

  if (capabilityMode === "hasLoad" && daysPerWeek >= 4) {
    score += coverage.carryDays >= 1 ? 1 : -1;
  }

  score += weeklyPatternSpacingScore(week);

  return score;
};

type WeeklyCoverageContract = {
  calvesDays: number;
  bicepsDays: number;
  tricepsDays: number;
  squatDays: number;
  hingeDays: number;
  pullDays: number;
  pushDays: number;
};

export const getWeeklyCoverageContract = (daysPerWeek: 3 | 4 | 5): WeeklyCoverageContract => {
  if (daysPerWeek === 3) {
    return {
      calvesDays: 1,
      bicepsDays: 1,
      tricepsDays: 1,
      squatDays: 1,
      hingeDays: 1,
      pullDays: 2,
      pushDays: 2,
    };
  }
  if (daysPerWeek === 4) {
    return {
      calvesDays: 2,
      bicepsDays: 2,
      tricepsDays: 2,
      squatDays: 2,
      hingeDays: 2,
      pullDays: 2,
      pushDays: 2,
    };
  }
  return {
    calvesDays: 2,
    bicepsDays: 2,
    tricepsDays: 2,
    squatDays: 2,
    hingeDays: 2,
    pullDays: 2,
    pushDays: 2,
  };
};

const pickCoverageDayIndexes = (params: {
  week: ProgramDay[];
  matchRule: RequirementRule;
  preferLower: boolean;
  preferArms: boolean;
}) => {
  const { week, matchRule, preferLower, preferArms } = params;
  return week
    .map((day, index) => ({ day, index }))
    .sort((left, right) => {
      const scoreFor = (candidate: ProgramDay) => {
        const title = candidate.title.toLowerCase();
        let score = 0;
        if (preferLower && isLowerDayForCoverage(candidate)) score += 4;
        if (!preferLower && !isLowerDayForCoverage(candidate)) score += 2;
        if (preferArms && title.includes("arms")) score += 6;
        if (!preferArms && title.includes("arms")) score += 2;
        if (title.includes("shoulders")) score += 2;
        if (title.includes("upper")) score += 1;
        if (title.includes("lower")) score += 1;
        const entries = buildDayEntries(candidate).map((entry) => ({
          item: entry.item,
          exercise: entry.exercise,
        }));
        if (countMatches(entries, matchRule) === 0) score += 3;
        return score;
      };
      const rightScore = scoreFor(right.day);
      const leftScore = scoreFor(left.day);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.index - right.index;
    })
    .map((entry) => entry.index);
};

const enforceCoverageRuleByAccessory = (params: {
  week: ProgramDay[];
  rule: RequirementRule;
  metric:
    | "calvesDays"
    | "bicepsDays"
    | "tricepsDays"
    | "squatDays"
    | "hingeDays"
    | "pullDays"
    | "pushDays"
    | "antiRotationDays"
    | "carryDays"
    | "scapularDays";
  minDays: number;
  preferredIds: string[];
  dayIndexes: number[];
  daysPerWeek: 3 | 4 | 5;
  accessoryCapacityByDayIndex: Map<number, number>;
  preserveRules?: RequirementRule[];
  context: DayConstraintRepairContext;
  note: string;
  warningLabel: string;
}) => {
  const {
    rule,
    metric,
    minDays,
    preferredIds,
    dayIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex,
    preserveRules = [],
    context,
    note,
    warningLabel,
  } =
    params;
  const warnings: Array<{
    dayTitle: string;
    kind: "missing" | "violation" | "coverage";
    message: string;
  }> = [];
  const nextWeek = [...params.week];
  let summary = summarizeWeekCoverage(nextWeek);
  const currentCount = (coverage: WeekCoverageSummary) => coverage[metric];
  const blockedDayIndexes = new Set<number>();

  let guard = 0;
  while (currentCount(summary) < minDays && guard < 20) {
    guard += 1;
    const targetDayIndex = dayIndexes.find((index) => {
      if (blockedDayIndexes.has(index)) return false;
      const day = nextWeek[index];
      if (!day) return false;
      const entries = buildDayEntries(day).map((entry) => ({
        item: entry.item,
        exercise: entry.exercise,
      }));
      return countMatches(entries, rule) === 0;
    });
    if (typeof targetDayIndex !== "number") break;
    const day = nextWeek[targetDayIndex];
    const exerciseId = pickCoverageExerciseId({
      day,
      preferredIds,
      matchRule: rule,
      context,
      week: nextWeek,
      dayIndex: targetDayIndex,
      daysPerWeek,
    });
    if (!exerciseId) {
      warnings.push({
        dayTitle: day.title,
        kind: "coverage",
        message: `${warningLabel} coverage missing: no eligible accessory found for ${day.title}.`,
      });
      blockedDayIndexes.add(targetDayIndex);
      continue;
    }
    const patchedDay = appendCoverageAccessory({
      day,
      exerciseId,
      painSeverity: context.selectionContext.painSeverity,
      note,
      context,
      daysPerWeek,
      accessoryCapacity:
        accessoryCapacityByDayIndex.get(targetDayIndex) ?? Number.POSITIVE_INFINITY,
      preserveRules,
    });
    const patchedSignatures = patchedDay.routine.map((item) => item.exerciseId).join("|");
    const previousSignatures = day.routine.map((item) => item.exerciseId).join("|");
    if (patchedSignatures === previousSignatures) {
      blockedDayIndexes.add(targetDayIndex);
      warnings.push({
        dayTitle: day.title,
        kind: "coverage",
        message: `${warningLabel} coverage missing: no accessory slot can be replaced on ${day.title}.`,
      });
      continue;
    }
    nextWeek[targetDayIndex] = patchedDay;
    summary = summarizeWeekCoverage(nextWeek);
  }

  if (currentCount(summary) < minDays) {
    warnings.push({
      dayTitle: "week",
      kind: "coverage",
      message: `${warningLabel} coverage target not met (got ${currentCount(summary)}, expected ${minDays}).`,
    });
  }

  return { week: nextWeek, warnings, summary };
};

const applyWeeklyCoverageRepairs = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}) => {
  const { daysPerWeek, context } = params;
  let nextWeek = [...params.week];
  const warnings: Array<{
    dayTitle: string;
    kind: "missing" | "violation" | "coverage";
    message: string;
  }> = [];
  const baselineAccessoryCapacity = new Map<number, number>(
    nextWeek.map((day, index) => [
      index,
      Math.max(1, day.routine.filter((item) => item.section === "accessory").length),
    ])
  );

  const contract = getWeeklyCoverageContract(daysPerWeek);
  const intentProfile = context.selectionContext.intentProfile;
  const lowerDayIndexes = pickCoverageDayIndexes({
    week: nextWeek,
    matchRule: calvesRule,
    preferLower: true,
    preferArms: false,
  }).filter((index) => isLowerDayForCoverage(nextWeek[index]!));
  const upperDayIndexesRaw = pickCoverageDayIndexes({
    week: nextWeek,
    matchRule: pullBackRule,
    preferLower: false,
    preferArms: false,
  });
  const armPreferredDayIndexesRaw = pickCoverageDayIndexes({
    week: nextWeek,
    matchRule: bicepsIsolationRule,
    preferLower: false,
    preferArms: true,
  });
  const upperDayIndexes = upperDayIndexesRaw.filter(
    (index) => !isLowerDayForCoverage(nextWeek[index]!)
  );
  const lowerCoverageIndexes =
    lowerDayIndexes.length > 0
      ? lowerDayIndexes
      : nextWeek.map((_, index) => index);
  const armPreferredDayIndexes = armPreferredDayIndexesRaw.filter(
    (index) => !isLowerDayForCoverage(nextWeek[index]!)
  );
  const armCoverageIndexes =
    armPreferredDayIndexes.length || upperDayIndexes.length
      ? Array.from(new Set([...armPreferredDayIndexes, ...upperDayIndexes]))
      : Array.from(new Set([...armPreferredDayIndexesRaw, ...upperDayIndexesRaw]));
  const upperPullOrArmsDayIndexes = nextWeek
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => {
      const normalized = day.title.toLowerCase();
      return normalized.includes("upper pull") || normalized.includes("arms");
    })
    .map((entry) => entry.index);
  const corePriorityIndexes = pickCoverageDayIndexes({
    week: nextWeek,
    matchRule: antiRotationRule,
    preferLower: false,
    preferArms: false,
  });
  const armDayIndexes = nextWeek
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => {
      const normalized = day.title.toLowerCase();
      return (
        normalized.includes("shoulders + arms") ||
        normalized.includes("arms + posture + conditioning")
      );
    })
    .map((entry) => entry.index);

  const carryMinDays =
    intentProfile.recoveryBudget === "low"
      ? 1
      : daysPerWeek >= 4
      ? 2
      : 1;
  const antiRotationMinDays = intentProfile.needs.needsCoreAntiRotation
    ? daysPerWeek >= 4
      ? 2
      : 1
    : 1;
  const scapularMinDays = intentProfile.needs.needsScapularControl
    ? daysPerWeek >= 4
      ? 2
      : 1
    : 1;

  const carryPreferredIds =
    context.capabilityMode === "hasLoad"
      ? ["farmers-carry", "suitcase-carry", "suitcase-hold-march"]
      : context.capabilityMode === "bandOnly"
      ? ["band-suitcase-march", "suitcase-hold-march"]
      : ["suitcase-hold-march"];

  const carryRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: carryRule,
    metric: "carryDays",
    minDays: carryMinDays,
    preferredIds: carryPreferredIds,
    dayIndexes: [...lowerCoverageIndexes, ...corePriorityIndexes],
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Smart patch: weekly carry exposure.",
    warningLabel: "Carry",
  });
  nextWeek = carryRepair.week;
  warnings.push(...carryRepair.warnings);

  if (armDayIndexes.length > 0) {
    const armBicepsRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: bicepsIsolationRule,
      metric: "bicepsDays",
      minDays: armDayIndexes.length,
      preferredIds: ["db-biceps-curl", "band-biceps-curl", "towel-biceps-curl-hold"],
      dayIndexes: armDayIndexes,
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [tricepsIsolationRule],
      context,
      note: "Arms contract: add biceps isolation.",
      warningLabel: "Arms day biceps",
    });
    nextWeek = armBicepsRepair.week;
    warnings.push(...armBicepsRepair.warnings);

    const armTricepsRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: tricepsIsolationRule,
      metric: "tricepsDays",
      minDays: armDayIndexes.length,
      preferredIds: [
        "db-triceps-extension",
        "band-triceps-pressdown",
        "bodyweight-triceps-extension",
      ],
      dayIndexes: armDayIndexes,
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [bicepsIsolationRule],
      context,
      note: "Arms contract: add triceps isolation.",
      warningLabel: "Arms day triceps",
    });
    nextWeek = armTricepsRepair.week;
    warnings.push(...armTricepsRepair.warnings);
  }

  const antiRotationRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: antiRotationRule,
    metric: "antiRotationDays",
    minDays: antiRotationMinDays,
    preferredIds: [
      "pallof-press",
      "side-plank",
      "band-woodchop",
      "band-suitcase-march",
      "suitcase-hold-march",
      "dead-bug",
    ],
    dayIndexes: [...corePriorityIndexes, ...lowerCoverageIndexes, ...upperDayIndexes],
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Smart patch: weekly anti-rotation exposure.",
    warningLabel: "Anti-rotation",
  });
  nextWeek = antiRotationRepair.week;
  warnings.push(...antiRotationRepair.warnings);

  const calvesRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: calvesRule,
    metric: "calvesDays",
    minDays: contract.calvesDays,
    preferredIds: [
      "standing-calf-raise",
      "single-leg-calf-raise",
      "band-calf-raise",
      "db-calf-raise",
    ],
    dayIndexes: lowerCoverageIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Coverage add: weekly calves minimum.",
    warningLabel: "Calves",
  });
  nextWeek = calvesRepair.week;
  warnings.push(...calvesRepair.warnings);

  const bicepsRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: bicepsIsolationRule,
    metric: "bicepsDays",
    minDays: contract.bicepsDays,
    preferredIds: ["db-biceps-curl", "band-biceps-curl", "towel-biceps-curl-hold"],
    dayIndexes: Array.from(
      new Set([...upperPullOrArmsDayIndexes, ...armCoverageIndexes])
    ),
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    preserveRules: [tricepsIsolationRule, calvesRule],
    context,
    note: "Coverage add: weekly biceps minimum.",
    warningLabel: "Biceps",
  });
  nextWeek = bicepsRepair.week;
  warnings.push(...bicepsRepair.warnings);

  const tricepsRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: tricepsIsolationRule,
    metric: "tricepsDays",
    minDays: contract.tricepsDays,
    preferredIds: [
      "db-triceps-extension",
      "band-triceps-pressdown",
      "bodyweight-triceps-extension",
    ],
    dayIndexes: armCoverageIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    preserveRules: [bicepsIsolationRule, calvesRule],
    context,
    note: "Coverage add: weekly triceps minimum.",
    warningLabel: "Triceps",
  });
  nextWeek = tricepsRepair.week;
  warnings.push(...tricepsRepair.warnings);

  const pullRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: pullBackRule,
    metric: "pullDays",
    minDays: contract.pullDays,
    preferredIds: ["split-stance-row", "band-row", "dumbbell-rows", "lat-pulldown"],
    dayIndexes: upperDayIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Coverage add: weekly pull minimum.",
    warningLabel: "Pull",
  });
  nextWeek = pullRepair.week;
  warnings.push(...pullRepair.warnings);

  const pushRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: pushChestRule,
    metric: "pushDays",
    minDays: contract.pushDays,
    preferredIds: [
      "bodyweight-triceps-extension",
      "band-chest-press",
      "pushup",
      "dumbbell-floor-press",
    ],
    dayIndexes: upperDayIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Coverage add: weekly push minimum.",
    warningLabel: "Push",
  });
  nextWeek = pushRepair.week;
  warnings.push(...pushRepair.warnings);

  const squatRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: squatRule,
    metric: "squatDays",
    minDays: contract.squatDays,
    preferredIds: ["bodyweight-squat", "split-squat", "band-front-squat", "goblet-squat"],
    dayIndexes: lowerCoverageIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Coverage add: weekly squat minimum.",
    warningLabel: "Squat",
  });
  nextWeek = squatRepair.week;
  warnings.push(...squatRepair.warnings);

  const hingeRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: hingeRule,
    metric: "hingeDays",
    minDays: contract.hingeDays,
    preferredIds: ["hip-hinge-drill", "glute-bridges", "back-extension", "band-rdl"],
    dayIndexes: lowerCoverageIndexes,
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Coverage add: weekly hinge minimum.",
    warningLabel: "Hinge",
  });
  nextWeek = hingeRepair.week;
  warnings.push(...hingeRepair.warnings);

  const scapularRepair = enforceCoverageRuleByAccessory({
    week: nextWeek,
    rule: scapPostureRule,
    metric: "scapularDays",
    minDays: scapularMinDays,
    preferredIds: ["face-pull", "prone-ytw", "band-pull-aparts", "scapular-pushups"],
    dayIndexes: [...upperDayIndexes, ...armCoverageIndexes, ...corePriorityIndexes],
    daysPerWeek,
    accessoryCapacityByDayIndex: baselineAccessoryCapacity,
    context,
    note: "Smart patch: weekly scapular/posture exposure.",
    warningLabel: "Scapular control",
  });
  nextWeek = scapularRepair.week;
  warnings.push(...scapularRepair.warnings);

  const summaryAfterPrimaryRepairs = summarizeWeekCoverage(nextWeek);

  if (summaryAfterPrimaryRepairs.calvesDays < contract.calvesDays) {
    const calvesFallbackRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: calvesRule,
      metric: "calvesDays",
      minDays: contract.calvesDays,
      preferredIds: [
        "standing-calf-raise",
        "single-leg-calf-raise",
        "band-calf-raise",
        "db-calf-raise",
      ],
      dayIndexes: lowerCoverageIndexes,
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [bicepsIsolationRule, tricepsIsolationRule],
      context,
      note: "Fallback coverage add: weekly calves minimum.",
      warningLabel: "Calves fallback",
    });
    nextWeek = calvesFallbackRepair.week;
    warnings.push(...calvesFallbackRepair.warnings);
  }

  const summaryAfterCalvesFallback = summarizeWeekCoverage(nextWeek);
  if (summaryAfterCalvesFallback.bicepsDays < contract.bicepsDays) {
    const bicepsFallbackRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: bicepsIsolationRule,
      metric: "bicepsDays",
      minDays: contract.bicepsDays,
      preferredIds: ["db-biceps-curl", "band-biceps-curl", "towel-biceps-curl-hold"],
      dayIndexes: Array.from(
        new Set([...upperPullOrArmsDayIndexes, ...armCoverageIndexes])
      ),
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [tricepsIsolationRule, calvesRule],
      context,
      note: "Fallback coverage add: weekly biceps minimum.",
      warningLabel: "Biceps fallback",
    });
    nextWeek = bicepsFallbackRepair.week;
    warnings.push(...bicepsFallbackRepair.warnings);
  }

  const summaryAfterBicepsFallback = summarizeWeekCoverage(nextWeek);
  if (summaryAfterBicepsFallback.carryDays < carryMinDays) {
    const carryFallbackRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: carryRule,
      metric: "carryDays",
      minDays: carryMinDays,
      preferredIds: carryPreferredIds,
      dayIndexes: [...lowerCoverageIndexes, ...corePriorityIndexes, ...upperDayIndexes],
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [bicepsIsolationRule, tricepsIsolationRule, calvesRule, pullBackRule],
      context,
      note: "Fallback coverage add: weekly carry exposure.",
      warningLabel: "Carry fallback",
    });
    nextWeek = carryFallbackRepair.week;
    warnings.push(...carryFallbackRepair.warnings);
  }

  const summaryAfterCarryFallback = summarizeWeekCoverage(nextWeek);
  if (summaryAfterCarryFallback.pullDays < contract.pullDays) {
    const pullFallbackRepair = enforceCoverageRuleByAccessory({
      week: nextWeek,
      rule: pullBackRule,
      metric: "pullDays",
      minDays: contract.pullDays,
      preferredIds: ["split-stance-row", "band-row", "dumbbell-rows", "lat-pulldown"],
      dayIndexes: [...upperDayIndexes, ...corePriorityIndexes, ...lowerCoverageIndexes],
      daysPerWeek,
      accessoryCapacityByDayIndex: baselineAccessoryCapacity,
      preserveRules: [bicepsIsolationRule, tricepsIsolationRule, calvesRule, carryRule],
      context,
      note: "Fallback coverage add: weekly pull minimum.",
      warningLabel: "Pull fallback",
    });
    nextWeek = pullFallbackRepair.week;
    warnings.push(...pullFallbackRepair.warnings);
  }

  return {
    week: nextWeek,
    warnings: collectDedupedWarnings(
      warnings.map((warning) => ({
        kind: warning.kind,
        message: `${warning.dayTitle}: ${warning.message}`,
      }))
    ).map((warning) => {
      const splitIndex = warning.message.indexOf(": ");
      if (splitIndex < 0) {
        return { dayTitle: "week", kind: warning.kind, message: warning.message };
      }
      return {
        dayTitle: warning.message.slice(0, splitIndex),
        kind: warning.kind,
        message: warning.message.slice(splitIndex + 2),
      };
    }),
  };
};

const resolveSectionFocusForDay = (params: {
  day: ProgramDay;
  section: ProgramRoutineItem["section"] | undefined;
  daysPerWeek: 3 | 4 | 5;
}): SectionFocus => {
  const { day, section, daysPerWeek } = params;
  const template = resolveSplitTemplateForDay(daysPerWeek, day.title);
  if (section === "cooldown") {
    return template?.cooldownFocus ?? inferSectionFocusFromDayTitle(day.title);
  }
  if (section === "activation" || section === "warmup") {
    return template?.warmupFocus ?? inferSectionFocusFromDayTitle(day.title);
  }
  return inferSectionFocusFromDayTitle(day.title);
};

const adjacentMainLaneByPainRisk: Record<MainLane, MainLane[]> = {
  push: ["pull", "verticalPush"],
  verticalPush: ["push", "pull"],
  pull: ["push", "verticalPush"],
  squat: ["hinge"],
  hinge: ["squat"],
};

const adjacentAccessoryLaneByPainRisk: Record<AccessoryLane, AccessoryLane[]> = {
  push: ["pull", "core"],
  pull: ["core", "push"],
  chest: ["back", "core", "push"],
  back: ["core", "chest", "pull"],
  lower: ["core"],
  core: ["pull", "lower", "back", "chest"],
};

const findFeedbackReplacementForRoutineItem = (params: {
  day: ProgramDay;
  item: ProgramRoutineItem;
  itemIndex: number;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
  mainLane: MainLane | null;
  accessoryLane: AccessoryLane | null;
  sectionFocus: SectionFocus | null;
}): Exercise | null => {
  const {
    day,
    item,
    itemIndex,
    context,
    usedIds,
    mainLane,
    accessoryLane,
    sectionFocus,
  } = params;
  const current = exerciseById(item.exerciseId);
  if (!current) return null;
  if (!hasFeedbackRiskSignalForExercise(current, context.selectionContext)) return null;
  const highPainRisk = resolveFeedbackSummariesForExercise(
    current,
    context.selectionContext
  ).some((summary) => summary.pain === "moderate" || summary.pain === "severe");

  const usedWithoutCurrent = new Set(usedIds);
  usedWithoutCurrent.delete(current.id);
  const currentSignature = deriveMovementSignature(current);
  const currentSlotId = makeDaySlotId(day, itemIndex, item.section);
  const slotKind =
    item.section === "main"
      ? mainLane
        ? slotKindByMainLane[mainLane]
        : "mainRepair"
      : item.section === "accessory" && accessoryLane
      ? `accessory${accessoryLane}`
      : item.section
      ? `${item.section}FeedbackSwap`
      : "feedbackSwap";

  const rankedCandidates = rankSubstitutionCandidates({
    current,
    section: item.section,
    available: context.available,
    context: context.selectionContext,
  })
    .filter((entry) => !usedWithoutCurrent.has(entry.exercise.id))
    .map((entry) => {
      const detail = scoreExerciseForContextDetailed(
        entry.exercise,
        item.section,
        context.selectionContext,
        context.available,
        {
          slotId: currentSlotId,
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind,
          slotLane: item.section === "main" ? (mainLane ?? undefined) : undefined,
          capabilityMode: context.capabilityMode,
        }
      );
      const signatureChanged =
        deriveMovementSignature(entry.exercise) !== currentSignature;
      const risky = hasFeedbackRiskSignalForExercise(
        entry.exercise,
        context.selectionContext
      );
      return {
        ...entry,
        risky,
        signatureChanged,
        score:
          entry.score +
          detail.score +
          (signatureChanged ? 1.25 : 0) -
          (risky ? 2.5 : 0),
      };
    })
    .sort((left, right) => {
      if (left.risky !== right.risky) return left.risky ? 1 : -1;
      if (left.signatureChanged !== right.signatureChanged) {
        return left.signatureChanged ? -1 : 1;
      }
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  const matchesPrimaryConstraint = (exercise: Exercise) => {
    if (item.section === "main" && mainLane) {
      return matchesMainLanePattern(exercise, mainLane);
    }
    if (item.section === "accessory" && accessoryLane) {
      return matchesAccessoryLanePattern(exercise, accessoryLane);
    }
    if (
      (item.section === "activation" ||
        item.section === "warmup" ||
        item.section === "cooldown") &&
      sectionFocus
    ) {
      return matchesSectionFocus(exercise, sectionFocus);
    }
    return true;
  };

  const strictMatches = rankedCandidates.filter((entry) =>
    matchesPrimaryConstraint(entry.exercise)
  );

  const selectBestAdjacentFallback = () => {
    if (!highPainRisk) return [] as typeof rankedCandidates;
    if (item.section === "main" && mainLane) {
      const adjacentLanes = adjacentMainLaneByPainRisk[mainLane] ?? [];
      return rankedCandidates
        .map((entry) => ({
          ...entry,
          adjacentLaneIndex: adjacentLanes.findIndex((lane) =>
            matchesMainLanePattern(entry.exercise, lane)
          ),
        }))
        .filter((entry) => entry.adjacentLaneIndex >= 0)
        .sort((left, right) => {
          if (left.risky !== right.risky) return left.risky ? 1 : -1;
          if (left.adjacentLaneIndex !== right.adjacentLaneIndex) {
            return left.adjacentLaneIndex - right.adjacentLaneIndex;
          }
          if (left.signatureChanged !== right.signatureChanged) {
            return left.signatureChanged ? -1 : 1;
          }
          if (right.score !== left.score) return right.score - left.score;
          return left.exercise.id.localeCompare(right.exercise.id);
        });
    }
    if (item.section === "accessory" && accessoryLane) {
      const adjacentLanes = adjacentAccessoryLaneByPainRisk[accessoryLane] ?? [];
      return rankedCandidates
        .map((entry) => ({
          ...entry,
          adjacentLaneIndex: adjacentLanes.findIndex((lane) =>
            matchesAccessoryLanePattern(entry.exercise, lane)
          ),
        }))
        .filter((entry) => entry.adjacentLaneIndex >= 0)
        .sort((left, right) => {
          if (left.risky !== right.risky) return left.risky ? 1 : -1;
          if (left.adjacentLaneIndex !== right.adjacentLaneIndex) {
            return left.adjacentLaneIndex - right.adjacentLaneIndex;
          }
          if (left.signatureChanged !== right.signatureChanged) {
            return left.signatureChanged ? -1 : 1;
          }
          if (right.score !== left.score) return right.score - left.score;
          return left.exercise.id.localeCompare(right.exercise.id);
        });
    }
    return [] as typeof rankedCandidates;
  };

  const ranked = strictMatches.length ? strictMatches : selectBestAdjacentFallback();
  const replacement = ranked[0]?.exercise ?? null;
  if (!replacement) return null;
  if (replacement.id === current.id) return null;
  return replacement;
};

const findFallbackReplacementForStickyRiskMain = (params: {
  day: ProgramDay;
  item: ProgramRoutineItem;
  itemIndex: number;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
  mainLane: MainLane | null;
}): Exercise | null => {
  const { day, item, itemIndex, context, usedIds, mainLane } = params;
  if (item.section !== "main") return null;

  const current = exerciseById(item.exerciseId);
  if (!current) return null;
  if (!hasFeedbackRiskSignalForExercise(current, context.selectionContext)) return null;

  const usedWithoutCurrent = new Set(usedIds);
  usedWithoutCurrent.delete(current.id);
  const currentSignature = deriveMovementSignature(current);

  const ranked = rankSubstitutionCandidates({
    current,
    section: "main",
    available: context.available,
    context: context.selectionContext,
  })
    .filter((entry) => !usedWithoutCurrent.has(entry.exercise.id))
    .filter((entry) => (mainLane ? matchesMainLanePattern(entry.exercise, mainLane) : true))
    .filter(
      (entry) => deriveMovementSignature(entry.exercise) !== currentSignature
    )
    .map((entry) => {
      const detail = scoreExerciseForContextDetailed(
        entry.exercise,
        "main",
        context.selectionContext,
        context.available,
        {
          slotId: makeDaySlotId(day, itemIndex, "main"),
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind: mainLane ? slotKindByMainLane[mainLane] : "mainRepair",
          slotLane: mainLane ?? undefined,
          capabilityMode: context.capabilityMode,
        }
      );
      return {
        exercise: entry.exercise,
        score: entry.score + detail.score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  const replacement = ranked[0]?.exercise ?? null;
  if (!replacement || replacement.id === current.id) return null;
  return replacement;
};

const applyFeedbackDrivenSubstitutions = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): ProgramDay[] => {
  const { week, daysPerWeek, context } = params;
  if (!context.selectionContext.feedbackSummaryByExercise.size) return week;

  return week.map((day) => {
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    const mainLanes = resolvePlannedMainLanesForDay({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    });
    const accessoryLanes = resolvePlannedAccessoryLanesForDay({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    });

    let mainIndex = 0;
    let accessoryIndex = 0;
    const routine = day.routine.map((item, itemIndex) => {
      const current = exerciseById(item.exerciseId);
      const itemMainIndex = item.section === "main" ? mainIndex++ : null;
      const itemAccessoryIndex =
        item.section === "accessory" ? accessoryIndex++ : null;
      if (!current) return item;

      const mainLane =
        item.section === "main"
          ? mainLanes[itemMainIndex ?? 0] ?? getMainLaneHits(current)[0] ?? null
          : null;
      const accessoryLane =
        item.section === "accessory"
          ? accessoryLanes[itemAccessoryIndex ?? 0] ??
            (matchesAccessoryLanePattern(current, "push")
              ? "push"
              : matchesAccessoryLanePattern(current, "pull")
              ? "pull"
              : matchesAccessoryLanePattern(current, "lower")
              ? "lower"
              : "core")
          : null;
      const sectionFocus =
        item.section === "activation" ||
        item.section === "warmup" ||
        item.section === "cooldown"
          ? resolveSectionFocusForDay({
              day,
              section: item.section,
              daysPerWeek,
            })
          : null;
      const replacement = findFeedbackReplacementForRoutineItem({
        day,
        item,
        itemIndex,
        context,
        usedIds,
        mainLane,
        accessoryLane,
        sectionFocus,
      });
      if (!replacement) return item;

      usedIds.delete(current.id);
      usedIds.add(replacement.id);
      return {
        ...item,
        exerciseId: replacement.id,
        loadType: replacement.loadType,
        cues: buildProgramCues(replacement, item.section),
      };
    });

    let fallbackMainIndex = 0;
    const stabilizedRoutine = routine.map((item, itemIndex) => {
      if (item.section !== "main") return item;
      const current = exerciseById(item.exerciseId);
      const mainLane =
        mainLanes[fallbackMainIndex++] ?? (current ? getMainLaneHits(current)[0] ?? null : null);
      if (!current) return item;
      if (!hasFeedbackRiskSignalForExercise(current, context.selectionContext)) {
        return item;
      }
      const replacement = findFallbackReplacementForStickyRiskMain({
        day,
        item,
        itemIndex,
        context,
        usedIds,
        mainLane,
      });
      if (!replacement) return item;
      usedIds.delete(current.id);
      usedIds.add(replacement.id);
      return {
        ...item,
        exerciseId: replacement.id,
        loadType: replacement.loadType,
        cues: buildProgramCues(replacement, item.section),
      };
    });

    return ensureDistinctRoutine(
      { ...day, routine: stabilizedRoutine },
      context.available,
      context.selectionContext
    );
  });
};

const applyFinalFeedbackSafetyPass = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): ProgramDay[] => {
  const { week, daysPerWeek, context } = params;
  if (!context.selectionContext.feedbackSummaryByExercise.size) return week;

  return week.map((day) => {
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    const mainLanes = resolvePlannedMainLanesForDay({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    });
    let mainIndex = 0;

    const routine = day.routine.map((item, itemIndex) => {
      if (item.section !== "main") return item;
      const current = exerciseById(item.exerciseId);
      if (!current) return item;
      const mainLane =
        mainLanes[mainIndex++] ?? getMainLaneHits(current)[0] ?? null;

      if (!hasFeedbackRiskSignalForExercise(current, context.selectionContext)) {
        return item;
      }

      const replacement = findFallbackReplacementForStickyRiskMain({
        day,
        item,
        itemIndex,
        context,
        usedIds,
        mainLane,
      });
      if (!replacement) return item;

      usedIds.delete(current.id);
      usedIds.add(replacement.id);
      return {
        ...item,
        exerciseId: replacement.id,
        loadType: replacement.loadType,
        cues: buildProgramCues(replacement, item.section),
      };
    });

    return ensureDistinctRoutine(
      { ...day, routine },
      context.available,
      context.selectionContext
    );
  });
};

type BackChestAccessoryArchitectureStatus = {
  pullVolume: number;
  pushVolume: number;
  posteriorAccessoryCount: number;
  chestIsolationCount: number;
  redundantAccessoryCount: number;
  ok: boolean;
};

type BackChestAccessoryIntelligenceStatus = BackChestAccessoryArchitectureStatus & {
  hasRearDeltAccessory: boolean;
  hasExternalScapAccessory: boolean;
  repeatedPriorPhaseAccessoryPairing: boolean;
  chestIsolationOutsidePhase2: boolean;
  chestIsolationWithoutRearDeltSupport: boolean;
  chestIsolationWithoutExternalScapSupport: boolean;
  chestIsolationBeyondDailyCap: boolean;
  chestIsolationSlotConflict: boolean;
  previousAccessorySignature: string | null;
  currentAccessorySignature: string | null;
  ok: boolean;
};

type BackChestMainIntelligenceStatus = {
  anchorIntegrityOk: boolean;
  pullBiasOk: boolean;
  advancedStructureOk: boolean;
  noDuplicateRowAngles: boolean;
  noIsolationMains: boolean;
  equipmentTierEscalationOk: boolean;
  movementLadderOk: boolean;
  ok: boolean;
};

const getBackChestDayFromWeek = (week?: ProgramDay[]) =>
  week?.find((entry) => isBackChestDayTitle(entry.title)) ?? null;

const buildExerciseIdSignature = (ids: string[]) =>
  ids
    .slice()
    .sort((left, right) => left.localeCompare(right))
    .join("|");

const hasHorizontalPushSignature = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  return patterns.has("push") && !patterns.has("verticalpush");
};

const isPosteriorShoulderAccessory = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set((exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    tags.has("scap") ||
    tags.has("rotator_cuff") ||
    tags.has("external_rotation") ||
    muscles.has("rear_delts") ||
    muscles.has("rotator_cuff") ||
    patterns.has("externalrotation")
  );
};

const isBackChestPosteriorDeltIsolationDescriptor = (descriptor: string) =>
  descriptor.includes("rear-delt-fly") ||
  descriptor.includes("rear delt fly") ||
  descriptor.includes("reverse-pec-deck") ||
  descriptor.includes("reverse pec deck");

const isChestDominantIsolationAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (isBackChestPosteriorDeltIsolationDescriptor(descriptor)) return false;
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set((exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle)));
  const chestFlyDescriptor =
    descriptor.includes("chest-fly") ||
    descriptor.includes("chest fly") ||
    ((descriptor.includes("pec-deck") || descriptor.includes("pec deck")) &&
      !descriptor.includes("reverse"));
  return (
    chestFlyDescriptor ||
    (isIsolationExercise(exercise) &&
      (tags.has("chest") || muscles.has("chest") || descriptor.includes("chest")))
  );
};

const isBackChestChestFlyAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (isBackChestPosteriorDeltIsolationDescriptor(descriptor)) return false;
  return (
    descriptor.includes("chest-fly") ||
    descriptor.includes("chest fly") ||
    ((descriptor.includes("pec-deck") || descriptor.includes("pec deck")) &&
      !descriptor.includes("reverse"))
  );
};

const isBackChestRedundantAccessoryPattern = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const rowLike =
    descriptor.includes("row") || descriptor.includes("pulldown") || descriptor.includes("lat");
  const shoulderHealthExemption =
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("upright") ||
    descriptor.includes("pullover");
  return rowLike && !shoulderHealthExemption;
};

const isBackChestRowLikeAccessoryPattern = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const rowLikeDescriptor =
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down");
  if (!rowLikeDescriptor) return false;
  const structuralShoulderPattern =
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("rear-delt-fly") ||
    descriptor.includes("rear delt fly") ||
    descriptor.includes("reverse-pec-deck") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("prone y") ||
    descriptor.includes("prone swimmer") ||
    descriptor.includes("reverse snow angel");
  return !structuralShoulderPattern;
};

const evaluateBackChestAccessoryArchitecture = (params: {
  mainExercises: Exercise[];
  accessoryExercises: Exercise[];
  goalModifier: BackChestGoalModifier;
}): BackChestAccessoryArchitectureStatus => {
  const { mainExercises, accessoryExercises, goalModifier } = params;
  const allExercises = [...mainExercises, ...accessoryExercises];
  const pullVolume = allExercises.filter((exercise) =>
    exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "pull")
  ).length;
  const pushVolume = allExercises.filter((exercise) =>
    exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "push")
  ).length;
  const posteriorAccessoryCount = accessoryExercises.filter(isPosteriorShoulderAccessory).length;
  const chestIsolationCount = allExercises.filter(isChestDominantIsolationAccessory).length;
  const mainHasHorizontalPull = mainExercises.some(hasHorizontalPullSignature);
  const mainHasVerticalPull = mainExercises.some(hasVerticalPullSignature);
  const redundantAccessoryCount = accessoryExercises.filter((exercise) => {
    if (!(mainHasHorizontalPull || mainHasVerticalPull)) return false;
    return isBackChestRedundantAccessoryPattern(exercise);
  }).length;
  const pullPushOk =
    goalModifier.pullPushRatioBias === "strong"
      ? pullVolume >= pushVolume
      : pullVolume + 1 >= pushVolume;
  const ok =
    pullPushOk &&
    posteriorAccessoryCount >= 1 &&
    chestIsolationCount <= 1 &&
    redundantAccessoryCount === 0;
  return {
    pullVolume,
    pushVolume,
    posteriorAccessoryCount,
    chestIsolationCount,
    redundantAccessoryCount,
    ok,
  };
};

const evaluateBackChestAccessoryIntelligence = (params: {
  day: ProgramDay;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  mainExercises: Exercise[];
  accessoryExercises: Exercise[];
}): BackChestAccessoryIntelligenceStatus => {
  const { day, context, daysPerWeek, mainExercises, accessoryExercises } = params;
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  const architecture = evaluateBackChestAccessoryArchitecture({
    mainExercises,
    accessoryExercises,
    goalModifier,
  });
  const enforceThreeDayBackChestRules = daysPerWeek === 3 && isBackChestDayTitle(day.title);
  const hasRearDeltAccessory = accessoryExercises.some((exercise) =>
    isBackChestRearDeltDominantAccessory(exercise)
  );
  const hasExternalScapAccessory = accessoryExercises.some((exercise) =>
    isBackChestRequiredExternalScapAccessory(exercise)
  );
  const hasRearDeltOrExternalAccessory = accessoryExercises.some((exercise) =>
    isRearDeltOrExternalRotationPattern(exercise)
  );
  const previousBackChestDay = getBackChestDayFromWeek(context.previousWeek);
  const previousAccessorySignature = previousBackChestDay
    ? buildExerciseIdSignature(
        previousBackChestDay.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId)
      )
    : null;
  const currentAccessorySignature = buildExerciseIdSignature(
    day.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
  );
  const repeatedPriorPhaseAccessoryPairing =
    Boolean(previousAccessorySignature) &&
    previousAccessorySignature === currentAccessorySignature;

  const accessoryChestIsolationCount = accessoryExercises.filter(
    isBackChestChestFlyAccessory
  ).length;
  const chestIsolationOutsidePhase2 =
    enforceThreeDayBackChestRules &&
    (context.selectionContext.phaseStage !== "skill" || !goalModifier.chestFlyAllowed) &&
    accessoryChestIsolationCount > 0;
  const chestIsolationWithoutRearDeltSupport =
    enforceThreeDayBackChestRules &&
    accessoryChestIsolationCount > 0 &&
    !hasRearDeltAccessory;
  const chestIsolationWithoutExternalScapSupport =
    enforceThreeDayBackChestRules &&
    accessoryChestIsolationCount > 0 &&
    !hasExternalScapAccessory;
  const chestIsolationBeyondDailyCap = architecture.chestIsolationCount > 1;
  const firstAccessoryId = day.routine.find(
    (item) => item.section === "accessory"
  )?.exerciseId;
  const firstAccessoryExercise = firstAccessoryId ? exerciseById(firstAccessoryId) : null;
  const chestIsolationSlotConflict = Boolean(
    firstAccessoryExercise &&
      isChestDominantIsolationAccessory(firstAccessoryExercise)
  );
  const roleCoverageOk = enforceThreeDayBackChestRules
    ? hasRearDeltAccessory && hasExternalScapAccessory
    : hasRearDeltOrExternalAccessory;
  const ok =
    architecture.ok &&
    roleCoverageOk &&
    !repeatedPriorPhaseAccessoryPairing &&
    !chestIsolationOutsidePhase2 &&
    !chestIsolationWithoutRearDeltSupport &&
    !chestIsolationWithoutExternalScapSupport &&
    !chestIsolationBeyondDailyCap &&
    !chestIsolationSlotConflict;
  return {
    ...architecture,
    hasRearDeltAccessory,
    hasExternalScapAccessory,
    repeatedPriorPhaseAccessoryPairing,
    chestIsolationOutsidePhase2,
    chestIsolationWithoutRearDeltSupport,
    chestIsolationWithoutExternalScapSupport,
    chestIsolationBeyondDailyCap,
    chestIsolationSlotConflict,
    previousAccessorySignature,
    currentAccessorySignature,
    ok,
  };
};

const getBackChestAccessoryPrioritySeeds = (phaseStage: ProgramPhaseStage, slotIndex: number) => {
  if (slotIndex === 0) {
    if (phaseStage === "activation") {
      return [
        "cable-face-pull",
        "machine-rear-delt-row",
        "face-pull",
        "suspension-face-pull",
        "suspension-rear-delt-row",
      ];
    }
    if (phaseStage === "skill") {
      return [
        "machine-rear-delt-row",
        "suspension-rear-delt-row",
        "cable-face-pull",
        "face-pull",
        "suspension-row-upright",
        "suspension-face-pull",
      ];
    }
    return [
      "cable-face-pull",
      "machine-rear-delt-row",
      "suspension-face-pull",
      "suspension-rear-delt-row",
      "face-pull",
    ];
  }

  if (phaseStage === "activation") {
    return [
      "dumbbell-pullover",
      "machine-rear-delt-row",
      "suspension-face-pull",
      "cable-face-pull",
      "suspension-row-upright",
    ];
  }
  if (phaseStage === "skill") {
    return [
      "dumbbell-pullover",
      "suspension-row-upright",
      "machine-rear-delt-row",
      "cable-face-pull",
      "suspension-rear-delt-row",
    ];
  }
  return [
    "machine-rear-delt-row",
    "suspension-row-upright",
    "cable-face-pull",
    "dumbbell-pullover",
    "suspension-face-pull",
    "suspension-rear-delt-row",
  ];
};

const isRearDeltOrExternalRotationPattern = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle))
  );
  const patterns = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    tags.has("external_rotation") ||
    tags.has("rotator_cuff") ||
    muscles.has("rear_delts") ||
    muscles.has("rotator_cuff") ||
    patterns.has("externalrotation")
  );
};

const isLowerTrapUpwardOrSerratusPattern = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("upright") ||
    descriptor.includes("pullover") ||
    descriptor.includes("serratus")
  );
};

const chooseBackChestAccessoryCandidate = (params: {
  day: ProgramDay;
  slotIndex: number;
  usedIds: Set<string>;
  selectedMainExerciseIds: string[];
  selectedAccessoryIds: string[];
  priorPhaseAccessoryIds?: Set<string>;
  strictAvoidPriorPhaseIds?: boolean;
  context: DayConstraintRepairContext;
}): Exercise | null => {
  const {
    day,
    slotIndex,
    usedIds,
    selectedMainExerciseIds,
    selectedAccessoryIds,
    priorPhaseAccessoryIds,
    strictAvoidPriorPhaseIds = false,
    context,
  } = params;
  const phaseStage = context.selectionContext.phaseStage;
  const prioritySeeds = getBackChestAccessoryPrioritySeeds(phaseStage, slotIndex);
  const laneCandidates = getAccessoryCandidateIds({
    lane: "back",
    available: context.available,
    context: context.selectionContext,
    dayTitle: day.title,
  });
  const candidateIds = Array.from(new Set([...prioritySeeds, ...laneCandidates]));
  const mainExercises = selectedMainExerciseIds
    .map((id) => exerciseById(id))
    .filter((entry): entry is Exercise => Boolean(entry));
  const selectedAccessoryExercises = selectedAccessoryIds
    .map((id) => exerciseById(id))
    .filter((entry): entry is Exercise => Boolean(entry));
  const mainHasPullPattern =
    mainExercises.some(hasHorizontalPullSignature) || mainExercises.some(hasVerticalPullSignature);
  const mainHasHorizontalPush = mainExercises.some(hasHorizontalPushSignature);
  const existingChestIsolationCount = [...mainExercises, ...selectedAccessoryExercises].filter(
    isChestDominantIsolationAccessory
  ).length;
  const posteriorSatisfiedBySelected =
    selectedAccessoryExercises.some(isPosteriorShoulderAccessory);
  const hasPriorPhaseMemory = Boolean(priorPhaseAccessoryIds?.size);
  const hasLoad = context.selectionContext.capabilityMode === "hasLoad";
  const highPain = context.selectionContext.painSeverity === "high";
  const descriptorBonus = (exercise: Exercise) => {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const rearOrExternal = isRearDeltOrExternalRotationPattern(exercise);
    const lowerTrapOrSerratus = isLowerTrapUpwardOrSerratusPattern(exercise);
    const chestIsolation = isChestDominantIsolationAccessory(exercise);
    let bonus = 0;

    if (slotIndex === 0 && rearOrExternal) {
      bonus += 6;
    }
    if (slotIndex >= 1 && exercise.id === "dumbbell-pullover") {
      bonus += 3.5;
    }
    if (slotIndex >= 1 && rearOrExternal) {
      bonus += 2;
    }

    if (phaseStage === "activation") {
      if (rearOrExternal) {
        bonus += 4.5;
      }
      if (lowerTrapOrSerratus) {
        bonus += 1.25;
      }
    } else if (phaseStage === "skill") {
      if (slotIndex === 0 && rearOrExternal) {
        bonus += 3.5;
      }
      if (slotIndex >= 1 && lowerTrapOrSerratus) {
        bonus += 5;
      }
      if (slotIndex >= 1 && rearOrExternal) {
        bonus -= 1.25;
      }
    } else {
      if (slotIndex === 0 && rearOrExternal) {
        bonus += 3.75;
      }
      if (slotIndex >= 1 && lowerTrapOrSerratus) {
        bonus += 3;
      }
      if (slotIndex >= 1 && descriptor.includes("upright")) {
        bonus += 1.5;
      }
    }

    if (chestIsolation) {
      if (phaseStage === "skill") {
        bonus += 0.5;
      } else if (phaseStage === "growth") {
        bonus -= 3;
      }
    }

    if (hasPriorPhaseMemory && priorPhaseAccessoryIds?.has(exercise.id)) {
      bonus -= 3;
    } else if (hasPriorPhaseMemory) {
      bonus += 0.75;
    }

    if (isBackChestRedundantAccessoryPattern(exercise)) {
      bonus -= 8;
    }
    return bonus;
  };

  const eligible = candidateIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      })
    );

  const buildScoredPool = (allowBodyweightFallback: boolean, allowRedundantPattern: boolean) =>
    eligible
      .filter((exercise) => {
        if (strictAvoidPriorPhaseIds && priorPhaseAccessoryIds?.has(exercise.id)) {
          return false;
        }
        if (
          !allowBodyweightFallback &&
          hasLoad &&
          !highPain &&
          isBodyweightFallbackAccessory(exercise)
        ) {
          return false;
        }
        if (!allowRedundantPattern && mainHasPullPattern && isBackChestRedundantAccessoryPattern(exercise)) {
          return false;
        }
        const chestIsolation = isChestDominantIsolationAccessory(exercise);
        if (chestIsolation) {
          if (phaseStage === "activation") return false;
          if (slotIndex === 0) return false;
          if (!posteriorSatisfiedBySelected) return false;
          if (existingChestIsolationCount >= 1) return false;
          if (mainHasHorizontalPush && !posteriorSatisfiedBySelected) return false;
        }
        return true;
      })
      .map((exercise) => {
        const auditMeta: SelectionAuditMeta = {
          slotId: `${normalizeSlotToken(day.title)}-accessory-repair-${slotIndex + 1}`,
          slotIndex,
          phaseIndex: phaseIndexFromStage(context.selectionContext.phaseStage),
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind: "accessoryback",
          selectedMainExerciseIds,
          capabilityMode: context.capabilityMode,
        };
        const detail = scoreExerciseForContextDetailed(
          exercise,
          "accessory",
          context.selectionContext,
          context.available,
          auditMeta
        );
        return {
          exercise,
          score: detail.score + descriptorBonus(exercise),
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.exercise.id.localeCompare(right.exercise.id);
      });

  const strictPool = buildScoredPool(false, false);
  if (strictPool.length) return strictPool[0]?.exercise ?? null;
  const allowRedundantPool = buildScoredPool(false, true);
  if (allowRedundantPool.length) return allowRedundantPool[0]?.exercise ?? null;
  const allowBodyweightPool = buildScoredPool(true, true);
  return allowBodyweightPool[0]?.exercise ?? null;
};

type BackChestAccessoryRole = "rearDelt" | "externalScap" | "posterior";

const BACK_CHEST_ACCESSORY_REAR_DELT_POOLS: Record<ProgramPhaseStage, string[]> = {
  activation: [
    "band-rear-delt-fly",
    "machine-rear-delt-row",
    "prone-y-raise",
    "machine-reverse-pec-deck",
    "dumbbell-rear-delt-fly",
    "cable-rear-delt-fly",
    "suspension-rear-delt-row",
    "prone-swimmer",
    "reverse-snow-angel",
  ],
  skill: [
    "band-rear-delt-fly",
    "dumbbell-rear-delt-fly",
    "cable-rear-delt-fly",
    "prone-y-raise",
    "machine-reverse-pec-deck",
    "machine-rear-delt-row",
    "suspension-rear-delt-row",
    "reverse-snow-angel",
    "prone-swimmer",
  ],
  growth: [
    "band-rear-delt-fly",
    "cable-rear-delt-fly",
    "prone-y-raise",
    "machine-reverse-pec-deck",
    "machine-rear-delt-row",
    "dumbbell-rear-delt-fly",
    "suspension-rear-delt-row",
    "prone-swimmer",
    "reverse-snow-angel",
  ],
};

const BACK_CHEST_ACCESSORY_EXTERNAL_SCAP_POOLS: Record<ProgramPhaseStage, string[]> = {
  activation: [
    "band-face-pull-high-anchor",
    "cable-face-pull",
    "band-external-rotation",
    "cable-external-rotation",
    "cable-external-rotation-pressout",
    "prone-y-raise",
    "face-pull",
    "suspension-face-pull",
    "band-pull-aparts",
    "band-pull-apart",
    "dumbbell-pullover",
    "suspension-row-upright",
    "back-widow",
  ],
  skill: [
    "band-face-pull-high-anchor",
    "band-external-rotation",
    "cable-external-rotation",
    "cable-face-pull",
    "cable-external-rotation-pressout",
    "prone-y-raise",
    "face-pull",
    "suspension-face-pull",
    "band-pull-aparts",
    "machine-pec-deck-press",
    "dumbbell-chest-fly",
    "band-pull-apart",
    "dumbbell-pullover",
    "suspension-row-upright",
    "back-widow",
  ],
  growth: [
    "band-face-pull-high-anchor",
    "band-external-rotation",
    "cable-face-pull",
    "cable-external-rotation",
    "cable-external-rotation-pressout",
    "prone-y-raise",
    "face-pull",
    "band-pull-aparts",
    "band-pull-apart",
    "suspension-row-upright",
    "dumbbell-pullover",
    "suspension-face-pull",
    "back-widow",
  ],
};

const BACK_CHEST_ACCESSORY_TERTIARY_POOLS: Record<ProgramPhaseStage, string[]> = {
  activation: [
    "dumbbell-pullover",
    "suspension-row-upright",
    "band-rear-delt-fly",
    "band-face-pull-high-anchor",
    "band-external-rotation",
    "machine-rear-delt-row",
    "prone-y-raise",
    "machine-reverse-pec-deck",
    "dumbbell-rear-delt-fly",
    "cable-rear-delt-fly",
    "cable-face-pull",
    "cable-external-rotation",
    "cable-external-rotation-pressout",
    "face-pull",
    "band-pull-aparts",
    "band-pull-apart",
    "prone-swimmer",
  ],
  skill: [
    "dumbbell-pullover",
    "suspension-row-upright",
    "band-rear-delt-fly",
    "band-face-pull-high-anchor",
    "band-external-rotation",
    "dumbbell-rear-delt-fly",
    "cable-rear-delt-fly",
    "prone-y-raise",
    "machine-reverse-pec-deck",
    "machine-rear-delt-row",
    "cable-external-rotation",
    "cable-external-rotation-pressout",
    "cable-face-pull",
    "face-pull",
    "band-pull-aparts",
    "machine-pec-deck-press",
    "dumbbell-chest-fly",
    "band-pull-apart",
    "reverse-snow-angel",
  ],
  growth: [
    "suspension-row-upright",
    "dumbbell-pullover",
    "band-rear-delt-fly",
    "band-face-pull-high-anchor",
    "band-external-rotation",
    "dumbbell-rear-delt-fly",
    "cable-rear-delt-fly",
    "prone-y-raise",
    "machine-rear-delt-row",
    "machine-reverse-pec-deck",
    "cable-external-rotation",
    "cable-external-rotation-pressout",
    "cable-face-pull",
    "face-pull",
    "band-pull-aparts",
    "band-pull-apart",
    "prone-swimmer",
  ],
};

const isBackChestRearDeltDominantAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle))
  );
  const explicitRearDeltAccessory =
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse-pec-deck") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("rear-delt-fly") ||
    descriptor.includes("rear delt fly") ||
    descriptor.includes("reverse snow angel") ||
    descriptor.includes("prone swimmer") ||
    tags.has("rear_delt") ||
    tags.has("rear-delt") ||
    tags.has("reardelt");
  if (explicitRearDeltAccessory) return true;

  const compoundBackPull =
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down") ||
    descriptor.includes("pullup") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("chinup") ||
    descriptor.includes("chin-up") ||
    hasHorizontalPullSignature(exercise) ||
    hasVerticalPullSignature(exercise);

  return muscles.has("rear_delts") && !compoundBackPull;
};

const isBackChestRequiredExternalScapAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const patterns = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    tags.has("scap") ||
    tags.has("scapular") ||
    tags.has("rotator_cuff") ||
    tags.has("external_rotation") ||
    tags.has("externalrotation") ||
    patterns.has("externalrotation")
  );
};

const evaluateBackChestAccessoryRoleCoverage = (accessoryExercises: Exercise[]) => ({
  hasRearDeltAccessory: accessoryExercises.some((exercise) =>
    isBackChestRearDeltDominantAccessory(exercise)
  ),
  hasExternalScapAccessory: accessoryExercises.some((exercise) =>
    isBackChestRequiredExternalScapAccessory(exercise)
  ),
  chestFlyCount: accessoryExercises.filter((exercise) =>
    isBackChestChestFlyAccessory(exercise)
  ).length,
});

const isBackChestAccessoryRoleCoverageSatisfied = (accessoryExercises: Exercise[]) => {
  const coverage = evaluateBackChestAccessoryRoleCoverage(accessoryExercises);
  return coverage.hasRearDeltAccessory && coverage.hasExternalScapAccessory;
};

const isBackChestPhase2ChestFlyWindowOpen = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { context, daysPerWeek } = params;
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  if (daysPerWeek !== 3) return false;
  if (context.selectionContext.phaseStage !== "skill") return false;
  if (context.selectionContext.painSeverity !== "low") return false;
  return goalModifier.chestFlyAllowed;
};

const BACK_CHEST_PHASE2_CHEST_FLY_IDS = [
  "machine-pec-deck-press",
  "dumbbell-chest-fly",
  "suspension-chest-fly",
];

const BACK_CHEST_PHASE2_CHEST_FLY_COMPANION_IDS = [
  "cable-face-pull",
  "face-pull",
  "suspension-face-pull",
  "cable-external-rotation-pressout",
];

const isBackChestAccessoryMultiSatisfier = (exercise: Exercise) =>
  isBackChestRearDeltDominantAccessory(exercise) &&
  isBackChestRequiredExternalScapAccessory(exercise);

const isBackChestGymFlySetupAvailable = (available: Set<Equipment>) =>
  available.has("machines") || available.has("cables");

const getBackChestPhase2ChestFlyCandidatePriority = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { context, daysPerWeek } = params;
  if (!isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek })) return [];
  const goalType = resolveBackChestGoalType(context.selectionContext.goal);
  if (goalType === "reducePain") {
    return [
      "machine-pec-deck-press",
      "dumbbell-chest-fly",
      "suspension-chest-fly",
    ];
  }
  return [...BACK_CHEST_PHASE2_CHEST_FLY_IDS];
};

const shouldBackChestPhase2ChestFlyCycle = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { context, daysPerWeek } = params;
  if (!isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek })) return false;
  if (!isBackChestGymFlySetupAvailable(context.available)) return false;
  const flyIds = getBackChestPhase2ChestFlyCandidatePriority({ context, daysPerWeek });
  const hasEligibleFly = flyIds.some((id) => {
    const exercise = exerciseById(id);
    if (!exercise) return false;
    return isExerciseEligibleForProgramContext({
      exercise,
      available: context.available,
      section: "accessory",
      context: context.selectionContext,
    });
  });
  if (!hasEligibleFly) return false;
  const seedBasis = [
    context.selectionSeed ?? "back-chest-phase2-fly",
    context.selectionContext.goal,
    context.selectionContext.experienceLevel,
    context.selectionContext.phaseStage,
    Array.from(context.available).sort().join(","),
  ].join("|");
  return stableHashUnit(seedBasis) < 0.5;
};

const isBackChestExternalOrScapSupportAccessory = (exercise: Exercise) => {
  if (isBackChestRequiredExternalScapAccessory(exercise)) return true;
  if (isRearDeltOrExternalRotationPattern(exercise)) return true;
  if (isLowerTrapUpwardOrSerratusPattern(exercise)) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("pullover") ||
    descriptor.includes("upright") ||
    descriptor.includes("widow") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("snow angel") ||
    tags.has("scap") ||
    tags.has("scapular") ||
    tags.has("rotator_cuff") ||
    tags.has("external_rotation") ||
    tags.has("externalrotation")
  );
};

const getBackChestAccessoryRoleOrder = (params: {
  accessoryCount: number;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}): BackChestAccessoryRole[] => {
  const { accessoryCount, context, daysPerWeek } = params;
  if (accessoryCount <= 0) return [];
  if (
    accessoryCount === 2 &&
    shouldBackChestPhase2ChestFlyCycle({ context, daysPerWeek })
  ) {
    return ["rearDelt", "externalScap"];
  }
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  const base: BackChestAccessoryRole[] =
    goalModifier.accessoryBiasProfile === "stability"
      ? ["externalScap", "rearDelt"]
      : ["rearDelt", "externalScap"];
  while (base.length < accessoryCount) {
    base.push("posterior");
  }
  return base.slice(0, accessoryCount);
};

const getBackChestAccessoryPoolForRole = (
  role: BackChestAccessoryRole,
  phaseStage: ProgramPhaseStage
) => {
  if (role === "rearDelt") return BACK_CHEST_ACCESSORY_REAR_DELT_POOLS[phaseStage];
  if (role === "externalScap") return BACK_CHEST_ACCESSORY_EXTERNAL_SCAP_POOLS[phaseStage];
  return BACK_CHEST_ACCESSORY_TERTIARY_POOLS[phaseStage];
};

const matchesBackChestAccessoryRole = (
  exercise: Exercise,
  role: BackChestAccessoryRole
) => {
  if (role === "rearDelt") return isBackChestRearDeltDominantAccessory(exercise);
  if (role === "externalScap") return isBackChestExternalOrScapSupportAccessory(exercise);
  return (
    isBackChestRearDeltDominantAccessory(exercise) ||
    isBackChestExternalOrScapSupportAccessory(exercise) ||
    isPosteriorShoulderAccessory(exercise)
  );
};

const prioritizeNovelAccessoryIds = (ids: string[], priorIds: Set<string>) => {
  const uniqueIds = Array.from(new Set(ids));
  const novel = uniqueIds.filter((id) => !priorIds.has(id));
  const repeated = uniqueIds.filter((id) => priorIds.has(id));
  return [...novel, ...repeated];
};

const isBackChestFacePullFamilyAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("face-pull") || descriptor.includes("face pull");
};

const isBackChestAccessoryScapYTRaiseFamily = (exercise: Exercise) =>
  isScapularYTRaiseFamilyExercise(exercise);

const isBackChestAccessoryPreferredScapAlternative = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const externalRotationPattern =
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    patterns.has("externalrotation") ||
    patterns.has("external_rotation") ||
    tags.has("external_rotation") ||
    tags.has("externalrotation");
  const cableRearDeltPattern =
    exercise.equipment.includes("cables") &&
    (descriptor.includes("rear-delt") ||
      descriptor.includes("rear delt") ||
      descriptor.includes("reverse pec deck") ||
      descriptor.includes("reverse-pec-deck"));
  return (
    isBackChestFacePullFamilyAccessory(exercise) ||
    externalRotationPattern ||
    cableRearDeltPattern
  );
};

const resolveBackChestAccessoryFamilyKey = (exercise: Exercise) => {
  if (exercise.familyKey) return normalizeTagToken(exercise.familyKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("face-pull") || descriptor.includes("face pull")) {
    return "face_pull";
  }
  if (descriptor.includes("external rotation") || descriptor.includes("external-rotation")) {
    return "external_rotation";
  }
  if (descriptor.includes("pull-apart") || descriptor.includes("pull apart")) {
    return "pull_apart";
  }
  if (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck")
  ) {
    return "rear_delt";
  }
  if (
    descriptor.includes("prone swimmer") ||
    descriptor.includes("reverse snow angel") ||
    descriptor.includes("prone y raise") ||
    descriptor.includes("prone y-raise") ||
    descriptor.includes("prone ytw")
  ) {
    return "prone_scap_control";
  }
  if (descriptor.includes("chest fly") || descriptor.includes("chest-fly")) {
    return "chest_fly";
  }
  if (descriptor.includes("pullover")) return "pullover";
  if (descriptor.includes("back widow")) return "back_widow";
  return exercise.id;
};

const applyBackChestAccessoryGoalBias = (params: {
  orderedIds: string[];
  role: BackChestAccessoryRole;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { orderedIds, role, context, daysPerWeek } = params;
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  const phaseStage = context.selectionContext.phaseStage;
  const indexById = new Map(orderedIds.map((id, index) => [id, index]));
  const gymLikeIntermediateAccessoryContext =
    context.selectionContext.experienceLevel !== "beginner" &&
    hasGymLikeUpperImplementAvailability(context.available);
  const hasScapYTRaiseAlternative =
    gymLikeIntermediateAccessoryContext &&
    orderedIds.some((candidateId) => {
      const candidate = exerciseById(candidateId);
      if (!candidate) return false;
      if (isBackChestAccessoryScapYTRaiseFamily(candidate)) return false;
      if (!isBackChestAccessoryPreferredScapAlternative(candidate)) return false;
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      });
    });
  return [...orderedIds].sort((leftId, rightId) => {
    const left = exerciseById(leftId);
    const right = exerciseById(rightId);
    if (!left || !right) {
      const leftIndex = indexById.get(leftId) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = indexById.get(rightId) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    }
    const score = (exercise: Exercise) => {
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const rearDelt = isBackChestRearDeltDominantAccessory(exercise);
      const externalScap = isBackChestExternalOrScapSupportAccessory(exercise);
      const facePull = isBackChestFacePullFamilyAccessory(exercise);
      const chestFly = isBackChestChestFlyAccessory(exercise);
      const stabilitySupport = isLowerTrapUpwardOrSerratusPattern(exercise);
      let value = 0;
      if (goalModifier.accessoryBiasProfile === "stability") {
        if (externalScap) value += 4;
        if (rearDelt) value += 3;
        if (facePull) value += 2;
        if (stabilitySupport) value += 1;
        if (chestFly) value -= 8;
      } else if (goalModifier.accessoryBiasProfile === "posteriorDominant") {
        if (rearDelt) value += 5;
        if (externalScap) value += 3;
        if (role === "rearDelt" && rearDelt) value += 2;
        if (chestFly) value -= 10;
      } else if (goalModifier.accessoryBiasProfile === "strengthSupport") {
        if (facePull) value += 5;
        if (rearDelt) value += 3;
        if (externalScap) value += 2;
        if (stabilitySupport) value += 1;
        if (phaseStage === "activation") {
          if (rearDelt && !facePull) value += 2;
          if (descriptor.includes("external rotation")) value -= 1;
        } else if (phaseStage === "skill") {
          if (descriptor.includes("external rotation")) value += 2;
        } else if (phaseStage === "growth") {
          if (facePull) value += 2;
        }
        if (chestFly) value -= 4;
      } else {
        if (rearDelt) value += 2;
        if (externalScap) value += 2;
        if (stabilitySupport) value += 1;
      }
      if (
        hasScapYTRaiseAlternative &&
        isBackChestAccessoryScapYTRaiseFamily(exercise)
      ) {
        value -= 3;
      }
      if (goalModifier.pullPushRatioBias === "strong" && chestFly) value -= 4;
      return value;
    };
    const delta = score(right) - score(left);
    if (delta !== 0) return delta;
    const leftIndex = indexById.get(leftId) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = indexById.get(rightId) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
};

const promoteBackChestPhase2ChestFlyCandidate = (params: {
  orderedIds: string[];
  role: BackChestAccessoryRole;
  day: ProgramDay;
  selectedAccessoryExercises: Exercise[];
  accessoryTargetCount: number;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}) => {
  const {
    orderedIds,
    role,
    day,
    selectedAccessoryExercises,
    accessoryTargetCount,
    daysPerWeek,
    context,
  } = params;
  if (role !== "externalScap") return orderedIds;
  if (accessoryTargetCount !== 2) return orderedIds;
  if (!isBackChestDayTitle(day.title)) return orderedIds;
  if (!shouldBackChestPhase2ChestFlyCycle({ context, daysPerWeek })) return orderedIds;
  if (!selectedAccessoryExercises.some(isBackChestAccessoryMultiSatisfier)) return orderedIds;
  const prioritizedFlyIds = getBackChestPhase2ChestFlyCandidatePriority({
    context,
    daysPerWeek,
  }).filter((id) => orderedIds.includes(id));
  if (!prioritizedFlyIds.length) return orderedIds;
  return [
    ...prioritizedFlyIds,
    ...orderedIds.filter((id) => !prioritizedFlyIds.includes(id)),
  ];
};

const prioritizeBackChestPhase2ChestFlyCompanion = (params: {
  orderedIds: string[];
  role: BackChestAccessoryRole;
  selectedAccessoryIds: string[];
  accessoryTargetCount: number;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}) => {
  const {
    orderedIds,
    role,
    selectedAccessoryIds,
    accessoryTargetCount,
    daysPerWeek,
    context,
  } = params;
  if (role !== "rearDelt") return orderedIds;
  if (selectedAccessoryIds.length > 0) return orderedIds;
  if (accessoryTargetCount !== 2) return orderedIds;
  if (!shouldBackChestPhase2ChestFlyCycle({ context, daysPerWeek })) return orderedIds;
  const prioritizedCompanions = BACK_CHEST_PHASE2_CHEST_FLY_COMPANION_IDS.filter((id) =>
    orderedIds.includes(id)
  );
  if (!prioritizedCompanions.length) return orderedIds;
  return [
    ...prioritizedCompanions,
    ...orderedIds.filter((id) => !prioritizedCompanions.includes(id)),
  ];
};

const prioritizeBackChestPhase3RearDeltRotation = (params: {
  orderedIds: string[];
  role: BackChestAccessoryRole;
  usedIds: Set<string>;
  selectedAccessoryIds: string[];
  priorPhaseAccessoryIds: Set<string>;
  allowBodyweightFallback: boolean;
  context: DayConstraintRepairContext;
}) => {
  const {
    orderedIds,
    role,
    usedIds,
    selectedAccessoryIds,
    priorPhaseAccessoryIds,
    allowBodyweightFallback,
    context,
  } = params;
  if (role !== "rearDelt") return orderedIds;
  if (context.selectionContext.phaseStage !== "growth") return orderedIds;
  if (!priorPhaseAccessoryIds.has("dumbbell-rear-delt-fly")) return orderedIds;

  const hasLoad = context.selectionContext.capabilityMode === "hasLoad";
  const highPain = context.selectionContext.painSeverity === "high";
  const candidateIds = orderedIds.filter((id) => id !== "dumbbell-rear-delt-fly");
  const hasEligibleAlternative = candidateIds.some((id) => {
    const exercise = exerciseById(id);
    if (!exercise) return false;
    if (usedIds.has(exercise.id) || selectedAccessoryIds.includes(exercise.id)) return false;
    if (!matchesBackChestAccessoryRole(exercise, role)) return false;
    if (isBackChestRedundantAccessoryPattern(exercise)) return false;
    if (
      !allowBodyweightFallback &&
      hasLoad &&
      !highPain &&
      isBodyweightFallbackAccessory(exercise)
    ) {
      return false;
    }
    return isExerciseEligibleForProgramContext({
      exercise,
      available: context.available,
      section: "accessory",
      context: context.selectionContext,
    });
  });
  if (!hasEligibleAlternative) return orderedIds;
  return [...candidateIds, "dumbbell-rear-delt-fly"];
};

const resolveBackChestAccessoryRepRange = (params: {
  daysPerWeek: 3 | 4 | 5;
  phaseStage: ProgramPhaseStage;
  exercise: Exercise;
  fallbackReps: string | null | undefined;
}) => {
  const { daysPerWeek, phaseStage, fallbackReps } = params;
  if (daysPerWeek !== 3) return fallbackReps ?? null;
  if (phaseStage === "growth") {
    return "8-12";
  }
  return "10-15";
};

const pickBackChestAccessoryForRole = (params: {
  role: BackChestAccessoryRole;
  day: ProgramDay;
  usedIds: Set<string>;
  selectedMainExerciseIds: string[];
  selectedAccessoryIds: string[];
  accessoryTargetCount: number;
  daysPerWeek: 3 | 4 | 5;
  priorPhaseAccessoryIds: Set<string>;
  avoidPriorIds: boolean;
  allowBodyweightFallback: boolean;
  context: DayConstraintRepairContext;
}): Exercise | null => {
  const {
    role,
    day,
    usedIds,
    selectedMainExerciseIds,
    selectedAccessoryIds,
    accessoryTargetCount,
    daysPerWeek,
    priorPhaseAccessoryIds,
    avoidPriorIds,
    allowBodyweightFallback,
    context,
  } = params;
  const phaseStage = context.selectionContext.phaseStage;
  const selectedMainExercises = selectedMainExerciseIds
    .map((id) => exerciseById(id))
    .filter((entry): entry is Exercise => Boolean(entry));
  const selectedAccessoryExercises = selectedAccessoryIds
    .map((id) => exerciseById(id))
    .filter((entry): entry is Exercise => Boolean(entry));
  const existingChestIsolationCount = [...selectedMainExercises, ...selectedAccessoryExercises]
    .filter((exercise) => isChestDominantIsolationAccessory(exercise))
    .length;
  const enforceAccessoryFamilyDedup = daysPerWeek === 3;
  const laneCandidates = getAccessoryCandidateIds({
    lane: "back",
    available: context.available,
    context: context.selectionContext,
    dayTitle: day.title,
  });
  const rolePool = getBackChestAccessoryPoolForRole(role, phaseStage);
  const prioritizedIds = prioritizeNovelAccessoryIds(
    [...rolePool, ...laneCandidates],
    priorPhaseAccessoryIds
  );
  const companionPrioritizedIds = prioritizeBackChestPhase2ChestFlyCompanion({
    orderedIds: prioritizedIds,
    role,
    selectedAccessoryIds,
    accessoryTargetCount,
    daysPerWeek,
    context,
  });
  const chestFlyPrioritizedIds = promoteBackChestPhase2ChestFlyCandidate({
    orderedIds: companionPrioritizedIds,
    role,
    day,
    selectedAccessoryExercises,
    accessoryTargetCount,
    daysPerWeek,
    context,
  });
  const orderedIds = prioritizeBackChestPhase3RearDeltRotation({
    orderedIds: chestFlyPrioritizedIds,
    role,
    usedIds,
    selectedAccessoryIds,
    priorPhaseAccessoryIds,
    allowBodyweightFallback,
    context,
  });
  const goalBiasedOrderedIds = applyBackChestAccessoryGoalBias({
    orderedIds,
    role,
    context,
    daysPerWeek,
  });
  const finalOrderedIds = promoteBackChestPhase2ChestFlyCandidate({
    orderedIds: goalBiasedOrderedIds,
    role,
    day,
    selectedAccessoryExercises,
    accessoryTargetCount,
    daysPerWeek,
    context,
  });
  const tightenRowLikeAccessorySelection = daysPerWeek === 3;
  const hasNonRowLikeRoleAlternative =
    tightenRowLikeAccessorySelection &&
    finalOrderedIds.some((id) => {
      const exercise = exerciseById(id);
      if (!exercise) return false;
      if (usedIds.has(exercise.id) || selectedAccessoryIds.includes(exercise.id)) return false;
      const chestIsolationCandidate = isChestDominantIsolationAccessory(exercise);
      if (!chestIsolationCandidate && !matchesBackChestAccessoryRole(exercise, role)) {
        return false;
      }
      if (isBackChestRedundantAccessoryPattern(exercise)) return false;
      if (isBackChestRowLikeAccessoryPattern(exercise)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "accessory",
          context: context.selectionContext,
        })
      ) {
        return false;
      }
      if (!chestIsolationCandidate) return true;
      if (!isBackChestChestFlyAccessory(exercise)) return false;
      if (role !== "externalScap") return false;
      if (!isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek })) return false;
      if (accessoryTargetCount !== 2) return false;
      if (existingChestIsolationCount >= 1) return false;
      if (!selectedAccessoryExercises.some(isBackChestAccessoryMultiSatisfier)) return false;
      const projectedAccessoryExercises = [...selectedAccessoryExercises, exercise];
      return isBackChestAccessoryRoleCoverageSatisfied(projectedAccessoryExercises);
    });
  return pickFirstBackChestCandidateByIds({
    candidateIds: finalOrderedIds,
    section: "accessory",
    usedIds,
    context,
    allowBodyweightFallback,
    predicate: (exercise) => {
      const chestIsolationCandidate = isChestDominantIsolationAccessory(exercise);
      if (!chestIsolationCandidate && !matchesBackChestAccessoryRole(exercise, role)) {
        return false;
      }
      if (
        role === "rearDelt" &&
        selectedAccessoryExercises.length === 0 &&
        accessoryTargetCount === 2 &&
        shouldBackChestPhase2ChestFlyCycle({ context, daysPerWeek }) &&
        !isBackChestAccessoryMultiSatisfier(exercise)
      ) {
        return false;
      }
      if (selectedAccessoryIds.includes(exercise.id)) return false;
      if (enforceAccessoryFamilyDedup) {
        const candidateFamily = resolveBackChestAccessoryFamilyKey(exercise);
        const selectedFamilies = new Set(
          selectedAccessoryExercises.map((entry) =>
            resolveBackChestAccessoryFamilyKey(entry)
          )
        );
        if (selectedFamilies.has(candidateFamily)) return false;
      }
      if (isBackChestRedundantAccessoryPattern(exercise)) return false;
      if (
        tightenRowLikeAccessorySelection &&
        hasNonRowLikeRoleAlternative &&
        isBackChestRowLikeAccessoryPattern(exercise)
      ) {
        return false;
      }
      if (chestIsolationCandidate) {
        if (!isBackChestChestFlyAccessory(exercise)) return false;
        if (role !== "externalScap") return false;
        if (!isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek })) return false;
        if (accessoryTargetCount !== 2) return false;
        if (existingChestIsolationCount >= 1) return false;
        if (!selectedAccessoryExercises.some(isBackChestAccessoryMultiSatisfier)) return false;
        const projectedAccessoryExercises = [...selectedAccessoryExercises, exercise];
        if (!isBackChestAccessoryRoleCoverageSatisfied(projectedAccessoryExercises)) {
          return false;
        }
      }
      if (avoidPriorIds && priorPhaseAccessoryIds.has(exercise.id)) return false;
      return true;
    },
  });
};

const repairBackChestAccessoryArchitecture = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { day: ProgramDay; warning?: string } => {
  const { day, daysPerWeek, context } = params;
  if (!isBackChestDayTitle(day.title)) return { day };
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });

  const accessoryEntries = day.routine
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.section === "accessory");
  if (!accessoryEntries.length) return { day };

  const previousBackChestDay = getBackChestDayFromWeek(context.previousWeek);
  const priorPhaseAccessoryIds = new Set(
    previousBackChestDay
      ? previousBackChestDay.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId)
      : []
  );
  const mainExercises = day.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const selectedMainExerciseIds = mainExercises.map((exercise) => exercise.id);
  const previousSignature = previousBackChestDay
    ? buildExerciseIdSignature(
        previousBackChestDay.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId)
      )
    : null;
  const enforceThreeDayBackChestRules = daysPerWeek === 3;
  const enforceAccessoryFamilyDedup = enforceThreeDayBackChestRules;

  const backChestAccessorySetSatisfiesRules = (accessoryIds: string[]) => {
    if (!enforceThreeDayBackChestRules) return true;
    const selectedAccessories = accessoryIds
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    if (!selectedAccessories.length) return false;
    if (selectedAccessories.length < Math.min(2, accessoryEntries.length)) return false;
    if (enforceAccessoryFamilyDedup) {
      const familyKeys = selectedAccessories.map((exercise) =>
        resolveBackChestAccessoryFamilyKey(exercise)
      );
      if (new Set(familyKeys).size !== familyKeys.length) return false;
    }
    const coverage = evaluateBackChestAccessoryRoleCoverage(selectedAccessories);
    if (!coverage.hasRearDeltAccessory || !coverage.hasExternalScapAccessory) return false;
    if (coverage.chestFlyCount > 1) return false;
    if (
      coverage.chestFlyCount > 0 &&
      !isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek })
    ) {
      return false;
    }
    const architecture = evaluateBackChestAccessoryArchitecture({
      mainExercises,
      accessoryExercises: selectedAccessories,
      goalModifier,
    });
    if (!architecture.ok) return false;
    return true;
  };

  const buildAccessoryIds = (avoidPriorIds: boolean) => {
    const usedIds = new Set(
      day.routine
        .filter((item) => item.section !== "accessory")
        .map((item) => item.exerciseId)
    );
    const selectedAccessoryIds: string[] = [];
    const roleOrder = getBackChestAccessoryRoleOrder({
      accessoryCount: accessoryEntries.length,
      context,
      daysPerWeek,
    });

    roleOrder.forEach((role, slotIndex) => {
      const candidate =
        pickBackChestAccessoryForRole({
          role,
          day,
          usedIds,
          selectedMainExerciseIds,
          selectedAccessoryIds,
          accessoryTargetCount: accessoryEntries.length,
          daysPerWeek,
          priorPhaseAccessoryIds,
          avoidPriorIds,
          allowBodyweightFallback: false,
          context,
        }) ??
        pickBackChestAccessoryForRole({
          role,
          day,
          usedIds,
          selectedMainExerciseIds,
          selectedAccessoryIds,
          accessoryTargetCount: accessoryEntries.length,
          daysPerWeek,
          priorPhaseAccessoryIds,
          avoidPriorIds,
          allowBodyweightFallback: true,
          context,
        }) ??
        pickBackChestAccessoryForRole({
          role: "posterior",
          day,
          usedIds,
          selectedMainExerciseIds,
          selectedAccessoryIds,
          accessoryTargetCount: accessoryEntries.length,
          daysPerWeek,
          priorPhaseAccessoryIds,
          avoidPriorIds,
          allowBodyweightFallback: true,
          context,
        });

      const fallback = exerciseById(accessoryEntries[slotIndex]?.item.exerciseId ?? "");
      const selectedAccessoryExercises = selectedAccessoryIds
        .map((id) => exerciseById(id))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const fallbackChestIsolationCount = [...mainExercises, ...selectedAccessoryExercises]
        .filter((exercise) => isChestDominantIsolationAccessory(exercise))
        .length;
      const fallbackChestIsolation = Boolean(
        fallback && isChestDominantIsolationAccessory(fallback)
      );
      const fallbackChestFlyAllowed =
        Boolean(fallback) &&
        fallbackChestIsolation &&
        isBackChestChestFlyAccessory(fallback!) &&
        role !== "rearDelt" &&
        isBackChestPhase2ChestFlyWindowOpen({ context, daysPerWeek }) &&
        accessoryEntries.length === 2 &&
        fallbackChestIsolationCount < 1 &&
        isBackChestAccessoryRoleCoverageSatisfied([
          ...selectedAccessoryExercises,
          fallback!,
        ]);
      const fallbackFamilyAllowed =
        !enforceAccessoryFamilyDedup ||
        !fallback ||
        !selectedAccessoryExercises.some(
          (exercise) =>
            resolveBackChestAccessoryFamilyKey(exercise) ===
            resolveBackChestAccessoryFamilyKey(fallback)
        );
      const fallbackEligible =
        Boolean(fallback) &&
        !usedIds.has(fallback!.id) &&
        matchesBackChestAccessoryRole(fallback!, role) &&
        !isBackChestRedundantAccessoryPattern(fallback!) &&
        fallbackFamilyAllowed &&
        (!fallbackChestIsolation || fallbackChestFlyAllowed) &&
        (!avoidPriorIds || !priorPhaseAccessoryIds.has(fallback!.id)) &&
        isExerciseEligibleForProgramContext({
          exercise: fallback!,
          available: context.available,
          section: "accessory",
          context: context.selectionContext,
        });
      const selected = candidate ?? (fallbackEligible ? fallback! : null);
      if (!selected) return;
      usedIds.add(selected.id);
      selectedAccessoryIds.push(selected.id);
    });

    return selectedAccessoryIds;
  };

  const applyAccessoryIds = (accessoryIds: string[]) =>
    ({
      ...day,
      routine: day.routine.map((item, index) => {
        if (item.section !== "accessory") return item;
        const accessoryPosition = accessoryEntries.findIndex(
          (entry) => entry.index === index
        );
        const selectedId =
          accessoryPosition >= 0 ? accessoryIds[accessoryPosition] : null;
        const selectedExercise = selectedId ? exerciseById(selectedId) : null;
        if (!selectedExercise) return item;
        return {
          ...item,
          exerciseId: selectedExercise.id,
          loadType: selectedExercise.loadType,
          reps: resolveBackChestAccessoryRepRange({
            daysPerWeek,
            phaseStage: context.selectionContext.phaseStage,
            exercise: selectedExercise,
            fallbackReps: item.reps,
          }),
          cues: buildProgramCues(selectedExercise, item.section),
        };
      }),
    }) as ProgramDay;

  let selectedAccessoryIds = buildAccessoryIds(false);
  let repairedDay = applyAccessoryIds(selectedAccessoryIds);

  const trySwapSingleAccessorySlotForNovelPairing = (currentIds: string[]) => {
    if (!previousSignature) return currentIds;
    if (buildExerciseIdSignature(currentIds) !== previousSignature) return currentIds;

    const roleOrder = getBackChestAccessoryRoleOrder({
      accessoryCount: accessoryEntries.length,
      context,
      daysPerWeek,
    });
    const nonAccessoryUsedIds = new Set(
      day.routine
        .filter((item) => item.section !== "accessory")
        .map((item) => item.exerciseId)
    );
    const rolePriority: BackChestAccessoryRole[] = ["rearDelt", "externalScap", "posterior"];
    const roleMappedSwapIndexes = rolePriority.flatMap((priorityRole) =>
      roleOrder
        .map((role, index) => ({ role, index }))
        .filter((entry) => entry.role === priorityRole)
        .map((entry) => entry.index)
    );
    const swapIndexes = [
      ...roleMappedSwapIndexes,
      ...Array.from({ length: currentIds.length }, (_, index) => index).filter(
        (index) => !roleMappedSwapIndexes.includes(index)
      ),
    ];

    for (const swapIndex of swapIndexes) {
      const role = roleOrder[swapIndex] ?? "posterior";
      const lockedAccessoryIds = currentIds.filter((_, index) => index !== swapIndex);
      const usedIds = new Set(nonAccessoryUsedIds);
      lockedAccessoryIds.forEach((id) => usedIds.add(id));

      const replacement =
        pickBackChestAccessoryForRole({
          role,
          day,
          usedIds,
          selectedMainExerciseIds,
          selectedAccessoryIds: lockedAccessoryIds,
          accessoryTargetCount: accessoryEntries.length,
          daysPerWeek,
          priorPhaseAccessoryIds,
          avoidPriorIds: true,
          allowBodyweightFallback: false,
          context,
        }) ??
        pickBackChestAccessoryForRole({
          role,
          day,
          usedIds,
          selectedMainExerciseIds,
          selectedAccessoryIds: lockedAccessoryIds,
          accessoryTargetCount: accessoryEntries.length,
          daysPerWeek,
          priorPhaseAccessoryIds,
          avoidPriorIds: true,
          allowBodyweightFallback: true,
          context,
        });
      if (!replacement) continue;
      if (replacement.id === currentIds[swapIndex]) continue;

      const swappedIds = [...currentIds];
      swappedIds[swapIndex] = replacement.id;
      if (buildExerciseIdSignature(swappedIds) === previousSignature) continue;
      if (!backChestAccessorySetSatisfiesRules(swappedIds)) continue;
      return swappedIds;
    }

    return currentIds;
  };

  const ensureNovelPairing = () => {
    const signature = buildExerciseIdSignature(selectedAccessoryIds);
    if (!previousSignature || signature !== previousSignature) return;
    const swappedIds = trySwapSingleAccessorySlotForNovelPairing(selectedAccessoryIds);
    if (buildExerciseIdSignature(swappedIds) !== previousSignature) {
      selectedAccessoryIds = swappedIds;
      repairedDay = applyAccessoryIds(selectedAccessoryIds);
      return;
    }
    const strictIds = buildAccessoryIds(true);
    const strictSignature = buildExerciseIdSignature(strictIds);
    if (
      strictSignature !== previousSignature &&
      backChestAccessorySetSatisfiesRules(strictIds)
    ) {
      selectedAccessoryIds = strictIds;
      repairedDay = applyAccessoryIds(selectedAccessoryIds);
    }
  };

  if (!backChestAccessorySetSatisfiesRules(selectedAccessoryIds)) {
    const strictIds = buildAccessoryIds(true);
    if (backChestAccessorySetSatisfiesRules(strictIds)) {
      selectedAccessoryIds = strictIds;
      repairedDay = applyAccessoryIds(selectedAccessoryIds);
    }
  }

  ensureNovelPairing();

  const repairedAccessoryExercises = repairedDay.routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const repairedStatus = evaluateBackChestAccessoryIntelligence({
    day: repairedDay,
    context,
    daysPerWeek,
    mainExercises,
    accessoryExercises: repairedAccessoryExercises,
  });

  if (repairedStatus.ok) return { day: repairedDay };

  return {
    day: repairedDay,
    warning:
      `Back + Chest accessory architecture still imperfect after repair: ` +
      `pull=${repairedStatus.pullVolume}, push=${repairedStatus.pushVolume}, ` +
      `posterior=${repairedStatus.posteriorAccessoryCount}, chestIso=${repairedStatus.chestIsolationCount}, ` +
      `redundant=${repairedStatus.redundantAccessoryCount}, repeated=${repairedStatus.repeatedPriorPhaseAccessoryPairing}.`,
  };
};

const getBackChestMainSlotPlan = (params: {
  mainCount: number;
  selectionContext: SelectionContext;
  daysPerWeek: 3 | 4 | 5;
  available: Set<Equipment>;
}) => {
  const { mainCount, selectionContext, daysPerWeek, available } = params;
  if (daysPerWeek === 3) {
    const targetCount = Math.max(1, mainCount);
    const selectedVariantKey = selectionContext.variationState?.selectedDayTemplateKeys.get(
      "back_chest"
    );
    if (selectedVariantKey) {
      const selectedVariant = resolveThreeDayTemplateVariants({
        dayTitle: "Back + Chest",
        mainCount: targetCount,
        available,
        selectionContext,
      }).find((variant) => variant.key === selectedVariantKey);
      if (selectedVariant?.mainLanePlan.length) {
        return selectedVariant.mainLanePlan.map((slot, index) => ({
          lane: slot.lane as MainLane,
          slotKind: slot.slotKind,
          slotId: `back_chest-main-repair-${index + 1}`,
        }));
      }
    }
    const plannedFromTemplate = get3DayMainLanePlan(
      "Back + Chest",
      targetCount
    );
    if (plannedFromTemplate?.length) {
      return plannedFromTemplate.map((slot, index) => ({
        lane: slot.lane as MainLane,
        slotKind: slot.slotKind,
        slotId: `back_chest-main-repair-${index + 1}`,
      }));
    }
  }

  const lanes = resolveBackChestMainLanePlan({
    targetMainCount: Math.max(1, mainCount),
    selectionContext,
    daysPerWeek,
  });
  let pullOrdinal = 0;
  return lanes.slice(0, Math.max(1, mainCount)).map((lane, index) => {
    let slotKind = slotKindByMainLane[lane];
    if (lane === "pull") {
      pullOrdinal += 1;
      slotKind =
        pullOrdinal === 1
          ? "mainPullHorizontal"
          : pullOrdinal === 2
          ? "mainPullVertical"
          : "mainPullSupport";
    }
    return {
      lane,
      slotKind,
      slotId: `back_chest-main-repair-${index + 1}`,
    };
  });
};

const isBackChestMainPress = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  return patterns.has("push") || patterns.has("verticalpush");
};

const isBackChestMainPull = (exercise: Exercise) =>
  exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "pull");

const backChestRowAngleSignature = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (!descriptor.includes("row")) return null;
  if (descriptor.includes("machine seated row")) return "machine_seated";
  if (descriptor.includes("cable seated row")) return "cable_seated";
  if (descriptor.includes("chest-supported row")) return "chest_supported";
  if (descriptor.includes("dumbbell rows")) return "dumbbell_rows";
  if (descriptor.includes("split-stance row")) return "split_stance";
  if (descriptor.includes("suspension row")) return "suspension_row";
  if (descriptor.includes("barbell")) return "barbell_row";
  if (descriptor.includes("pendlay")) return "pendlay_row";
  return "generic_row";
};

const hasDuplicateBackChestRowAngles = (exercisesForDay: Exercise[]) => {
  const signatures = exercisesForDay
    .map((exercise) => backChestRowAngleSignature(exercise))
    .filter(
      (
        entry
      ): entry is Exclude<ReturnType<typeof backChestRowAngleSignature>, null> =>
        entry !== null
    );
  return new Set(signatures).size !== signatures.length;
};

const hasEligibleBackChestMainCandidate = (params: {
  slotKind: string;
  slotLane: MainLane;
  context: DayConstraintRepairContext;
  predicate: (exercise: Exercise) => boolean;
}) => {
  const { slotKind, slotLane, context, predicate } = params;
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  return exercises.some((exercise) => {
    if (exercise.category !== "main") return false;
    if (!predicate(exercise)) return false;
    if (slotKind.startsWith("mainPull") && isBackChestScapularAccessoryPullExercise(exercise)) {
      return false;
    }
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    ) {
      return false;
    }
    if (
      !matchesBackChestMainSlotKind({
        exercise,
        slotKind,
        slotLane,
      })
    ) {
      return false;
    }
    return true;
  });
};

const isBackChestSupportedRowForLadder = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    exercise.equipment.includes("machines") ||
    exercise.equipment.includes("cables") ||
    descriptor.includes("supported") ||
    descriptor.includes("chest-supported")
  );
};

const isBackChestIntermediateRowForLadder = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("dumbbell") || descriptor.includes("chest-supported");
};

const isBackChestAdvancedRowForLadder = (exercise: Exercise) =>
  exercise.equipment.includes("barbell") || isBackChestUnsupportedHingeRowExercise(exercise);

type BackChestAnchorRole = "horizontalPull" | "verticalPull" | "horizontalPush";

type BackChestTierProfile = {
  equipmentCeiling: BackChestEquipmentTier;
  painCapTier: BackChestEquipmentTier;
  tierCeiling: BackChestEquipmentTier;
  painCapActive: boolean;
};

type BackChestGoalType =
  | "reducePain"
  | "improvePosture"
  | "generalFitness"
  | "athleticPerformance";

type BackChestPullPushRatioBias = "strong" | "balanced";

type BackChestAccessoryBiasProfile =
  | "stability"
  | "posteriorDominant"
  | "balancedBias"
  | "strengthSupport";

type BackChestGoalModifier = {
  goalType: BackChestGoalType;
  tierCeilingAdjustment: number;
  supportedPatternBias: boolean;
  pullPushRatioBias: BackChestPullPushRatioBias;
  accessoryBiasProfile: BackChestAccessoryBiasProfile;
  preferNeutralGrip: boolean;
  chestFlyAllowed: boolean;
  allowTier3InPhase3: boolean;
  preferPullUpOverPulldown: boolean;
  moderateAccessoryRotation: boolean;
};

const resolveBackChestGoalType = (goal: string): BackChestGoalType => {
  const token = normalizeTagToken(goal);
  if (token === "reduce_pain") return "reducePain";
  if (token === "improve_posture") return "improvePosture";
  if (token === "athletic_performance") return "athleticPerformance";
  return "generalFitness";
};

const resolveBackChestGoalModifier = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}): BackChestGoalModifier => {
  const { context, daysPerWeek } = params;
  const goalType = resolveBackChestGoalType(context.selectionContext.goal);
  const inThreeDayBackChest = daysPerWeek === 3;
  const isGrowth = context.selectionContext.phaseStage === "growth";
  const isBeginner = context.selectionContext.experienceLevel === "beginner";
  const allowTier3InGrowthForIntermediatePlus =
    !isGrowth || context.selectionContext.experienceLevel !== "beginner";

  if (!inThreeDayBackChest) {
    return {
      goalType,
      tierCeilingAdjustment: 0,
      supportedPatternBias: false,
      pullPushRatioBias: "balanced",
      accessoryBiasProfile: "balancedBias",
      preferNeutralGrip: false,
      chestFlyAllowed: true,
      allowTier3InPhase3: allowTier3InGrowthForIntermediatePlus,
      preferPullUpOverPulldown: false,
      moderateAccessoryRotation: true,
    };
  }

  if (goalType === "reducePain") {
    return {
      goalType,
      tierCeilingAdjustment: isBeginner && isGrowth ? -1 : 0,
      supportedPatternBias: true,
      pullPushRatioBias: "strong",
      accessoryBiasProfile: "stability",
      preferNeutralGrip: true,
      chestFlyAllowed: true,
      allowTier3InPhase3: allowTier3InGrowthForIntermediatePlus,
      preferPullUpOverPulldown: false,
      moderateAccessoryRotation: true,
    };
  }

  if (goalType === "improvePosture") {
    return {
      goalType,
      tierCeilingAdjustment: 0,
      supportedPatternBias: false,
      pullPushRatioBias: "strong",
      accessoryBiasProfile: "posteriorDominant",
      preferNeutralGrip: false,
      chestFlyAllowed: true,
      allowTier3InPhase3: true,
      preferPullUpOverPulldown: false,
      moderateAccessoryRotation: true,
    };
  }

  if (goalType === "athleticPerformance") {
    return {
      goalType,
      tierCeilingAdjustment: 0,
      supportedPatternBias: false,
      pullPushRatioBias: "balanced",
      accessoryBiasProfile: "strengthSupport",
      preferNeutralGrip: false,
      chestFlyAllowed: true,
      allowTier3InPhase3: allowTier3InGrowthForIntermediatePlus,
      preferPullUpOverPulldown: true,
      moderateAccessoryRotation: true,
    };
  }

  return {
    goalType,
    tierCeilingAdjustment: 0,
    supportedPatternBias: false,
    pullPushRatioBias: "balanced",
    accessoryBiasProfile: "balancedBias",
    preferNeutralGrip: false,
    chestFlyAllowed: true,
    allowTier3InPhase3: true,
    preferPullUpOverPulldown: false,
    moderateAccessoryRotation: true,
  };
};

const BACK_CHEST_HORIZONTAL_PULL_LADDER: Record<BackChestEquipmentTier, string[]> = {
  1: [
    "machine-seated-row",
    "cable-seated-row",
    "band-row",
    "split-stance-row",
    "banded-rows-seated",
    "single-arm-band-row",
    "band-row-iso-hold",
    "suspension-row-incline",
    "suspension-row-upright",
    "supine-elbow-drive-row",
    "prone-elbow-row",
    "back-widow",
  ],
  2: [
    "dumbbell-chest-supported-row",
    "dumbbell-rows",
    "suspension-row-parallel",
    "suspension-row-feet-elevated",
    "suspension-archer-row",
    "suspension-one-arm-row-assisted",
  ],
  3: ["barbell-bent-over-row", "pendlay-row"],
};

const BACK_CHEST_VERTICAL_PULL_PULLUP_LADDER: Record<BackChestEquipmentTier, string[]> = {
  1: [
    "machine-assisted-pullup",
    "band-assisted-pullup",
    "scap-pullup",
    "machine-lat-pulldown",
    "kneeling-prayer-lat-pulldown",
    "prone-lat-sweep",
    "supine-lat-pulldown-isometric",
    "band-lat-pulldown",
    "band-lat-pulldown-kneeling",
    "tall-kneeling-band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-lat-pulldown-neutral-grip",
    "band-lat-pulldown-wide-grip",
    "band-lat-pulldown-iso-hold",
  ],
  2: [
    "neutral-grip-pullup",
    "chinup-strict",
    "chest-to-bar-pullup",
    "cable-lat-pulldown",
    "dumbbell-pullover",
  ],
  3: ["weighted-pullup", "barbell-landmine-pulldown"],
};

const BACK_CHEST_VERTICAL_PULL_PULLDOWN_LADDER: Record<BackChestEquipmentTier, string[]> = {
  1: [
    "machine-lat-pulldown",
    "kneeling-prayer-lat-pulldown",
    "band-lat-pulldown-kneeling",
    "tall-kneeling-band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-lat-pulldown-neutral-grip",
    "band-lat-pulldown-wide-grip",
    "band-lat-pulldown-iso-hold",
    "band-lat-pulldown",
    "seated-lat-sweep-pulse",
    "prone-lat-sweep",
    "supine-lat-pulldown-isometric",
  ],
  2: ["cable-lat-pulldown", "dumbbell-pullover", "machine-assisted-pullup"],
  3: ["barbell-landmine-pulldown"],
};

const BACK_CHEST_HORIZONTAL_PUSH_LADDER: Record<BackChestEquipmentTier, string[]> = {
  1: [
    "machine-chest-press",
    "machine-pec-deck-press",
    "band-chest-press",
    "split-stance-band-chest-press",
    "tall-kneeling-band-chest-press",
    "band-chest-press-iso-hold",
    "incline-pushup",
    "pushup",
    "countertop-pushup",
    "wall-pushup",
  ],
  2: [
    "dumbbell-bench-press",
    "dumbbell-incline-press",
    "dumbbell-chest-fly",
    "dumbbell-floor-press",
  ],
  3: ["barbell-bench-press-paused", "barbell-floor-press", "suspension-chest-fly"],
};

const BACK_CHEST_VERTICAL_PUSH_LADDER: Record<BackChestEquipmentTier, string[]> = {
  1: ["machine-shoulder-press", "band-overhead-press", "pike-pushup"],
  2: ["dumbbell-shoulder-press", "dumbbell-arnold-press"],
  3: ["barbell-strict-press", "barbell-push-press"],
};

const BACK_CHEST_SUPPORT_PULL_PHASE_POOLS: Record<ProgramPhaseStage, string[]> = {
  activation: [
    "cable-lat-pulldown",
    "machine-lat-pulldown",
    "machine-assisted-pullup",
    "band-assisted-pullup",
    "cable-seated-row",
    "dumbbell-chest-supported-row",
    "dumbbell-rows",
    "split-stance-row",
    "band-lat-pulldown-kneeling",
    "tall-kneeling-band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-lat-pulldown-neutral-grip",
    "band-lat-pulldown-wide-grip",
    "band-lat-pulldown-iso-hold",
    "band-lat-pulldown",
    "band-row",
    "banded-rows-seated",
    "single-arm-band-row",
  ],
  skill: [
    "cable-lat-pulldown",
    "machine-lat-pulldown",
    "neutral-grip-pullup",
    "machine-assisted-pullup",
    "dumbbell-chest-supported-row",
    "dumbbell-rows",
    "cable-seated-row",
    "split-stance-row",
    "band-lat-pulldown-kneeling",
    "tall-kneeling-band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-lat-pulldown-neutral-grip",
    "band-lat-pulldown-wide-grip",
    "band-lat-pulldown-iso-hold",
    "band-lat-pulldown",
    "banded-rows-seated",
    "single-arm-band-row",
    "barbell-landmine-pulldown",
  ],
  growth: [
    "weighted-pullup",
    "barbell-landmine-pulldown",
    "cable-lat-pulldown",
    "barbell-bent-over-row",
    "pendlay-row",
    "dumbbell-chest-supported-row",
    "dumbbell-rows",
    "band-lat-pulldown-neutral-grip",
    "band-lat-pulldown-wide-grip",
    "band-lat-pulldown-iso-hold",
    "band-lat-pulldown-kneeling",
    "tall-kneeling-band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-lat-pulldown",
    "banded-rows-seated",
    "single-arm-band-row",
    "machine-lat-pulldown",
    "cable-seated-row",
  ],
};

const toBackChestTier = (value: number): BackChestEquipmentTier => {
  if (value >= 3) return 3;
  if (value <= 1) return 1;
  return 2;
};

const resolveBackChestEquipmentCeiling = (
  available: Set<Equipment>
): BackChestEquipmentTier => {
  if (
    available.has("gym") ||
    available.has("barbell") ||
    (available.has("pullup_bar") && available.has("dumbbells"))
  ) {
    return 3;
  }
  if (
    available.has("dumbbells") ||
    available.has("bands") ||
    available.has("machines") ||
    available.has("cables") ||
    available.has("pullup_bar")
  ) {
    return 2;
  }
  return 1;
};

const resolveBackChestPainCapTier = (painSeverity: PainSeverity): BackChestEquipmentTier =>
  painSeverity === "high" ? 1 : painSeverity === "medium" ? 2 : 3;

const resolveBackChestTierProfile = (
  context: DayConstraintRepairContext
): BackChestTierProfile => {
  const equipmentCeiling = resolveBackChestEquipmentCeiling(context.available);
  const reducePainWithoutSelectedPainAreas =
    resolveBackChestGoalType(context.selectionContext.goal) === "reducePain" &&
    context.selectionContext.painAreas.length === 0;
  const painCapTier =
    reducePainWithoutSelectedPainAreas && context.selectionContext.experienceLevel === "beginner"
      ? 2
      : resolveBackChestPainCapTier(context.selectionContext.painSeverity);
  const tierCeiling = toBackChestTier(Math.min(equipmentCeiling, painCapTier));
  return {
    equipmentCeiling,
    painCapTier,
    tierCeiling,
    painCapActive: tierCeiling < equipmentCeiling,
  };
};

const resolveBackChestGoalAdjustedTierCeiling = (params: {
  tierProfile: BackChestTierProfile;
  goalModifier: BackChestGoalModifier;
}): BackChestEquipmentTier => {
  const { tierProfile, goalModifier } = params;
  if (goalModifier.tierCeilingAdjustment === 0) return tierProfile.tierCeiling;
  const shouldAdjust = tierProfile.tierCeiling >= 3;
  if (!shouldAdjust) return tierProfile.tierCeiling;
  const adjusted = tierProfile.tierCeiling + goalModifier.tierCeilingAdjustment;
  return toBackChestTier(adjusted);
};

const resolveBackChestMainAvailableSet = (available: Set<Equipment>) => {
  return available;
};

const isBackChestFloorPress = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("floor-press") ||
    descriptor.includes("floor press") ||
    exercise.id === "dumbbell-floor-press" ||
    exercise.id === "barbell-floor-press"
  );
};

const isBackChestFloorPressAllowed = (
  exercise: Exercise,
  context: DayConstraintRepairContext,
  tierProfile: BackChestTierProfile
) => {
  if (!isBackChestFloorPress(exercise)) return true;
  if (tierProfile.painCapActive) return true;
  return context.selectionContext.experienceLevel === "beginner";
};

const backChestExperienceRankByLevel: Record<NormalizedExperienceLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const backChestExperienceRankByMinimum: Record<
  NonNullable<Exercise["experienceMin"]>,
  number
> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const isBackChestExperienceEligible = (
  exercise: Exercise,
  experienceLevel: NormalizedExperienceLevel
) => {
  if (!exercise.experienceMin) return true;
  return (
    backChestExperienceRankByLevel[experienceLevel] >=
    backChestExperienceRankByMinimum[exercise.experienceMin]
  );
};

const resolveBackChestDesiredAnchorRung = (params: {
  context: DayConstraintRepairContext;
  tierProfile: BackChestTierProfile;
}): BackChestEquipmentTier => {
  const { context, tierProfile } = params;
  if (context.selectionContext.phaseStage === "activation") {
    return toBackChestTier(Math.min(1, tierProfile.tierCeiling));
  }
  if (context.selectionContext.phaseStage === "skill") {
    return toBackChestTier(Math.min(2, tierProfile.tierCeiling));
  }
  return tierProfile.tierCeiling;
};

const matchesBackChestAnchorRole = (
  exercise: Exercise,
  role: BackChestAnchorRole
) => {
  if (role === "horizontalPull") return hasHorizontalPullSignature(exercise);
  if (role === "verticalPull") return hasVerticalPullSignature(exercise);
  return hasHorizontalPushSignature(exercise);
};

const resolveBackChestAnchorRung = (
  _role: BackChestAnchorRole,
  exercise: Exercise,
  _hasPullupBar: boolean
): BackChestEquipmentTier => resolveBackChestEquipmentTier(exercise);

const buildBackChestRungOrder = (params: {
  targetRung: BackChestEquipmentTier;
  minRung: BackChestEquipmentTier;
  maxRung: BackChestEquipmentTier;
}) => {
  const { targetRung, minRung, maxRung } = params;
  const ordered: BackChestEquipmentTier[] = [];
  const append = (candidate: number) => {
    const tier = toBackChestTier(candidate);
    if (tier < minRung || tier > maxRung) return;
    if (!ordered.includes(tier)) ordered.push(tier);
  };
  append(targetRung);
  for (let rung = targetRung + 1; rung <= maxRung; rung += 1) append(rung);
  for (let rung = targetRung - 1; rung >= minRung; rung -= 1) append(rung);
  return ordered;
};

const pickFirstBackChestCandidateByIds = (params: {
  candidateIds: string[];
  section: ProgramRoutineItem["section"];
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
  tierCeiling?: BackChestEquipmentTier;
  allowBodyweightFallback?: boolean;
  predicate?: (exercise: Exercise) => boolean;
}): Exercise | null => {
  const {
    candidateIds,
    section,
    usedIds,
    context,
    tierCeiling,
    allowBodyweightFallback = false,
    predicate,
  } = params;
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const hasLoad = context.selectionContext.capabilityMode === "hasLoad";
  const needsLoadedBias = hasLoad && context.selectionContext.painSeverity === "low";
  for (const id of Array.from(new Set(candidateIds))) {
    const exercise = exerciseById(id);
    if (!exercise) continue;
    if (usedIds.has(exercise.id)) continue;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section,
        context: context.selectionContext,
      })
    ) {
      continue;
    }
    if (
      section === "accessory" &&
      needsLoadedBias &&
      !allowBodyweightFallback &&
      isBodyweightFallbackAccessory(exercise)
    ) {
      continue;
    }
    if (
      section === "main" &&
      needsLoadedBias &&
      !allowBodyweightFallback &&
      isBodyweightFallbackAccessory(exercise)
    ) {
      continue;
    }
    if (
      section === "main" &&
      !isBackChestExperienceEligible(
        exercise,
        context.selectionContext.experienceLevel
      )
    ) {
      continue;
    }
    if (section === "main" && isBackChestScapularAccessoryPullExercise(exercise)) {
      continue;
    }
    if (tierCeiling && resolveBackChestEquipmentTier(exercise) > tierCeiling) continue;
    if (predicate && !predicate(exercise)) continue;
    return exercise;
  }
  return null;
};

const getBackChestAnchorLadderIdsForRung = (params: {
  role: BackChestAnchorRole;
  rung: BackChestEquipmentTier;
  hasPullupBar: boolean;
}) => {
  const { role, rung, hasPullupBar } = params;
  const ladderByTier =
    role === "horizontalPull"
      ? BACK_CHEST_HORIZONTAL_PULL_LADDER
      : role === "horizontalPush"
      ? BACK_CHEST_HORIZONTAL_PUSH_LADDER
      : hasPullupBar
      ? BACK_CHEST_VERTICAL_PULL_PULLUP_LADDER
      : BACK_CHEST_VERTICAL_PULL_PULLDOWN_LADDER;

  const sourceIds = [
    ...(ladderByTier[1] ?? []),
    ...(ladderByTier[2] ?? []),
    ...(ladderByTier[3] ?? []),
  ];
  const candidateIds = Array.from(
    new Set(
      sourceIds.filter((id) => {
        const exercise = exerciseById(id);
        if (!exercise) return false;
        return resolveBackChestEquipmentTier(exercise) === rung;
      })
    )
  );

  if (role !== "verticalPull") return candidateIds;

  const verticalPriority = (id: string) => {
    const exercise = exerciseById(id);
    if (!exercise) return Number.MAX_SAFE_INTEGER;
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    if (exercise.id === "weighted-pullup") return 0;
    if (exercise.id === "neutral-grip-pullup") return 1;
    if (
      descriptor.includes("pullup") ||
      descriptor.includes("pull-up") ||
      descriptor.includes("chinup") ||
      descriptor.includes("chin-up")
    ) {
      return 2;
    }
    if (exercise.id === "cable-lat-pulldown") return 3;
    if (exercise.id === "machine-lat-pulldown") return 4;
    if (descriptor.includes("pulldown")) return 5;
    if (descriptor.includes("pullover")) return 7;
    return 6;
  };

  return candidateIds.sort((left, right) => {
    const rankDelta = verticalPriority(left) - verticalPriority(right);
    if (rankDelta !== 0) return rankDelta;
    return left.localeCompare(right);
  });
};

const getBackChestAnchorFromMain = (
  exercisesForDay: Exercise[],
  role: BackChestAnchorRole
) =>
  exercisesForDay.find((exercise) => matchesBackChestAnchorRole(exercise, role)) ?? null;

const isBackChestBeginnerGrowthSafetyCapActive = (params: {
  role: BackChestAnchorRole;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { role, context, daysPerWeek } = params;
  if (daysPerWeek !== 3) return false;
  if (context.selectionContext.phaseStage !== "growth") return false;
  if (context.selectionContext.experienceLevel !== "beginner") return false;
  return role === "horizontalPull" || role === "horizontalPush";
};

const isBackChestBeginnerSafeTier3Anchor = (exercise: Exercise) => {
  if (exercise.id === "barbell-bent-over-row" || exercise.id === "barbell-bench-press-paused") {
    return false;
  }
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("landmine")) return true;
  if (descriptor.includes("chest-supported")) return true;
  const machineOrCable =
    exercise.equipment.includes("machines") || exercise.equipment.includes("cables");
  if (!machineOrCable) return false;
  return (
    descriptor.includes("press") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down")
  );
};

const isBackChestAnchorTierAllowed = (params: {
  exercise: Exercise;
  role: BackChestAnchorRole;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  tierProfile: BackChestTierProfile;
  goalModifier?: BackChestGoalModifier;
}) => {
  const {
    exercise,
    role,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier: providedGoalModifier,
  } = params;
  const goalModifier =
    providedGoalModifier ??
    resolveBackChestGoalModifier({
      context,
      daysPerWeek,
    });
  const effectiveTierCeiling = resolveBackChestGoalAdjustedTierCeiling({
    tierProfile,
    goalModifier,
  });
  const tier = resolveBackChestEquipmentTier(exercise);
  if (tier > effectiveTierCeiling) return false;
  if (
    context.selectionContext.phaseStage === "growth" &&
    tier >= 3 &&
    !goalModifier.allowTier3InPhase3
  ) {
    return false;
  }
  const beginnerGrowthSafetyCapActive = isBackChestBeginnerGrowthSafetyCapActive({
    role,
    context,
    daysPerWeek,
  });
  if (!beginnerGrowthSafetyCapActive) {
    return true;
  }
  if (tier <= 2) return true;
  return isBackChestBeginnerSafeTier3Anchor(exercise);
};

const resolveBackChestExerciseFamilyKey = (
  exercise: Exercise,
  role?: BackChestAnchorRole
) => {
  if (exercise.familyKey) return normalizeTagToken(exercise.familyKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("face-pull") || descriptor.includes("face pull")) return "face_pull";
  if (descriptor.includes("external rotation") || descriptor.includes("external-rotation")) {
    return "external_rotation";
  }
  if (descriptor.includes("pull-apart") || descriptor.includes("pull apart")) {
    return "pull_apart";
  }
  if (descriptor.includes("rear-delt") || descriptor.includes("rear delt")) {
    return "rear_delt";
  }
  if (descriptor.includes("pulldown") || descriptor.includes("pull-down")) {
    if (exercise.equipment.includes("bands")) return "band_pulldown";
    if (exercise.equipment.includes("machines")) return "machine_pulldown";
    if (exercise.equipment.includes("cables")) return "cable_pulldown";
    return "pulldown";
  }
  if (
    descriptor.includes("pullup") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("chinup") ||
    descriptor.includes("chin-up")
  ) {
    return "pullup";
  }
  if (descriptor.includes("row")) {
    if (exercise.equipment.includes("bands")) return "band_row";
    if (exercise.equipment.includes("machines")) return "machine_row";
    if (exercise.equipment.includes("cables")) return "cable_row";
    if (exercise.equipment.includes("barbell")) return "barbell_row";
    if (exercise.equipment.includes("dumbbells")) return "db_row";
    return "row";
  }
  if (descriptor.includes("press")) {
    if (exercise.equipment.includes("bands")) return "band_press";
    if (exercise.equipment.includes("machines")) return "machine_press";
    if (exercise.equipment.includes("barbell")) return "barbell_press";
    if (exercise.equipment.includes("dumbbells")) return "db_press";
    return "press";
  }
  if (descriptor.includes("fly")) return "chest_fly";
  if (role === "horizontalPull") return "horizontal_pull";
  if (role === "verticalPull") return "vertical_pull";
  if (role === "horizontalPush") return "horizontal_push";
  return normalizeTagToken(exercise.id);
};

const resolveBackChestExerciseVariantKey = (exercise: Exercise) => {
  if (exercise.variantKey) return normalizeTagToken(exercise.variantKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("single-arm") || descriptor.includes("single arm")) return "single_arm";
  if (descriptor.includes("split-stance") || descriptor.includes("split stance")) {
    return "split_stance";
  }
  if (descriptor.includes("half-kneeling") || descriptor.includes("half kneeling")) {
    return "half_kneeling";
  }
  if (descriptor.includes("tall-kneeling") || descriptor.includes("tall kneeling")) {
    return "tall_kneeling";
  }
  if (descriptor.includes("kneeling")) return "kneeling";
  if (descriptor.includes("standing")) return "standing";
  if (descriptor.includes("wide-grip") || descriptor.includes("wide grip")) return "wide_grip";
  if (descriptor.includes("neutral-grip") || descriptor.includes("neutral grip")) {
    return "neutral_grip";
  }
  if (descriptor.includes("iso-hold") || descriptor.includes("isometric")) return "iso_hold";
  if (descriptor.includes("chest-supported") || descriptor.includes("chest supported")) {
    return "chest_supported";
  }
  if (descriptor.includes("incline")) return "incline";
  if (descriptor.includes("paused")) return "paused";
  if (descriptor.includes("seated")) return "seated";
  return "bilateral";
};

const resolveBackChestAnchorImplementPreferencePenalty = (params: {
  exercise: Exercise;
  availableForBackChest?: Set<Equipment>;
}) => {
  const { exercise, availableForBackChest } = params;
  if (!availableForBackChest) return 0;
  const hasGymOptions =
    availableForBackChest.has("machines") || availableForBackChest.has("cables");
  const hasAlternateLoad =
    availableForBackChest.has("bands") || availableForBackChest.has("dumbbells");
  if (!hasGymOptions || !hasAlternateLoad) return 0;

  const usesGymImplement =
    exercise.equipment.includes("machines") ||
    exercise.equipment.includes("cables") ||
    exercise.equipment.includes("barbell") ||
    exercise.equipment.includes("pullup_bar");
  if (usesGymImplement) return 0;
  if (exercise.equipment.includes("dumbbells")) return 1;
  if (exercise.equipment.includes("bands")) return 3;
  if (exercise.equipment.includes("none")) return 4;
  return 2;
};

const resolveBackChestAnchorPreferenceRank = (params: {
  role: BackChestAnchorRole;
  exercise: Exercise;
  goalModifier: BackChestGoalModifier;
  selectionContext?: SelectionContext;
  availableForBackChest?: Set<Equipment>;
}) => {
  const { role, exercise, goalModifier, selectionContext, availableForBackChest } = params;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((group) => normalizeTagToken(group))
  );
  const variantKey = resolveBackChestExerciseVariantKey(exercise);
  const focusTags = selectionContext?.poseFocusTags ?? new Set<string>();
  const phaseStage = selectionContext?.phaseStage;
  const needsScapControl =
    selectionContext?.intentProfile.needs.needsScapularControl ||
    focusTags.has("scapular_control") ||
    focusTags.has("scap_control");
  const needsExternalRotation =
    focusTags.has("external_rotation") ||
    focusTags.has("rotator_cuff") ||
    tags.has("externalrotation") ||
    tags.has("external_rotation");
  const needsControlBias = Boolean(needsScapControl || needsExternalRotation);
  if (role === "horizontalPull") {
    let rank = 0;
    if (goalModifier.supportedPatternBias) {
      if (isBackChestSupportedRowForLadder(exercise)) rank -= 3;
      if (descriptor.includes("landmine")) rank -= 2;
      if (isBackChestUnsupportedHingeRowExercise(exercise)) rank += 5;
    }
    if (needsControlBias) {
      if (
        variantKey === "single_arm" ||
        variantKey === "iso_hold" ||
        variantKey === "split_stance"
      ) {
        rank -= 3;
      }
      if (variantKey === "chest_supported" || isBackChestSupportedRowForLadder(exercise)) {
        rank -= 1;
      }
    }
    if (goalModifier.goalType === "improvePosture") {
      if (muscles.has("upper_back") || muscles.has("mid_back")) rank -= 2;
      if (tags.has("scap") || tags.has("scapular") || tags.has("reardelt")) rank -= 1;
      if (
        variantKey === "split_stance" ||
        variantKey === "single_arm" ||
        variantKey === "iso_hold"
      ) {
        rank -= 1;
      }
    } else if (goalModifier.goalType === "generalFitness") {
      if (variantKey === "split_stance") rank -= 2;
      if (variantKey === "iso_hold") rank += 1;
    } else if (goalModifier.goalType === "reducePain") {
      if (!needsControlBias) {
        if (
          variantKey === "single_arm" ||
          variantKey === "iso_hold" ||
          variantKey === "split_stance"
        ) {
          rank += 2;
        }
        if (variantKey === "bilateral" || variantKey === "seated") rank -= 1;
      }
      if (
        phaseStage === "activation" &&
        !needsControlBias &&
        (variantKey === "single_arm" || variantKey === "iso_hold")
      ) {
        rank += 3;
      }
      if (isBackChestUnsupportedHingeRowExercise(exercise)) rank += 2;
    }
    rank += resolveBackChestAnchorImplementPreferencePenalty({
      exercise,
      availableForBackChest,
    });
    return rank;
  }
  if (role === "verticalPull") {
    let rank = 0;
    const isPullupFamily =
      descriptor.includes("pullup") ||
      descriptor.includes("pull-up") ||
      descriptor.includes("chinup") ||
      descriptor.includes("chin-up");
    const isPulldownFamily =
      descriptor.includes("pulldown") ||
      descriptor.includes("pull-down") ||
      exercise.id === "cable-lat-pulldown" ||
      exercise.id === "machine-lat-pulldown";
    const isNeutralGrip =
      exercise.id === "neutral-grip-pullup" || descriptor.includes("neutral-grip");
    const isAssistedPull =
      exercise.id === "machine-assisted-pullup" || exercise.id === "band-assisted-pullup";
    if (needsControlBias) {
      if (variantKey === "kneeling" || variantKey === "tall_kneeling" || variantKey === "iso_hold") {
        rank -= 2;
      }
      if (isNeutralGrip || variantKey === "neutral_grip") rank -= 2;
    }
    if (goalModifier.preferNeutralGrip && isNeutralGrip) rank -= 4;
    if (goalModifier.preferPullUpOverPulldown) {
      if (isPullupFamily) rank -= 2;
      if (isPulldownFamily) rank += 1;
    }
    if (goalModifier.goalType === "improvePosture") {
      if (isNeutralGrip || variantKey === "neutral_grip") rank -= 2;
    } else if (goalModifier.goalType === "reducePain" && !needsControlBias) {
      if (variantKey === "wide_grip") rank += 2;
      if (isPulldownFamily || isAssistedPull) rank -= 1;
    }
    if (goalModifier.supportedPatternBias) {
      if (isAssistedPull || isPulldownFamily) rank -= 1;
      if (exercise.id === "chest-to-bar-pullup") rank += 4;
      if (exercise.id === "weighted-pullup") rank += 2;
    }
    rank += resolveBackChestAnchorImplementPreferencePenalty({
      exercise,
      availableForBackChest,
    });
    return rank;
  }
  if (role === "horizontalPush") {
    let rank = 0;
    const chestDominantIsolation =
      (descriptor.includes("fly") || descriptor.includes("pec deck")) &&
      !descriptor.includes("reverse");
    if (goalModifier.supportedPatternBias) {
      if (exercise.equipment.includes("machines")) rank -= 3;
      if (descriptor.includes("dumbbell")) rank -= 1;
      if (descriptor.includes("barbell")) rank += 3;
    }
    if (goalModifier.goalType === "improvePosture") {
      if (chestDominantIsolation) rank += 3;
      if (variantKey === "split_stance") rank -= 1;
    } else if (goalModifier.goalType === "athleticPerformance") {
      if (variantKey === "split_stance" || variantKey === "standing") rank -= 2;
      if (
        variantKey === "kneeling" ||
        variantKey === "tall_kneeling" ||
        variantKey === "half_kneeling"
      ) {
        rank += 1;
      }
    } else if (goalModifier.goalType === "generalFitness") {
      if (variantKey === "split_stance") rank -= 2;
      if (variantKey === "iso_hold") rank += 1;
    } else if (goalModifier.goalType === "reducePain") {
      if (chestDominantIsolation) rank += 4;
      if (!needsControlBias && (variantKey === "single_arm" || variantKey === "iso_hold")) {
        rank += 1;
      }
      if (!needsControlBias && variantKey === "bilateral" && exercise.equipment.includes("machines")) {
        rank -= 1;
      }
    }
    rank += resolveBackChestAnchorImplementPreferencePenalty({
      exercise,
      availableForBackChest,
    });
    return rank;
  }
  return 0;
};

type BackChestChestStimulusFamily = "press" | "fly";

type BackChestThreeDayChestStimulusPolicy = {
  priorFamily: BackChestChestStimulusFamily | null;
  preferComplementaryFamily: boolean;
  preferPressFamily: boolean;
  preferStablePressFamily: boolean;
  applyRepeatPenalty: boolean;
};

const resolveBackChestChestStimulusFamily = (
  exercise: Exercise
): BackChestChestStimulusFamily | null => {
  if (isBackChestFlyPatternExercise(exercise)) return "fly";
  if (hasHorizontalPushSignature(exercise)) return "press";
  return null;
};

const resolveBackChestThreeDayChestStimulusPolicy = (params: {
  role: BackChestAnchorRole;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
  previousAnchor: Exercise | null;
}): BackChestThreeDayChestStimulusPolicy | null => {
  const { role, daysPerWeek } = params;
  if (daysPerWeek !== 3 || role !== "horizontalPush") return null;
  return null;
};

const resolveBackChestThreeDayChestStimulusPreferenceRank = (params: {
  exercise: Exercise;
  policy: BackChestThreeDayChestStimulusPolicy;
}) => {
  const { exercise, policy } = params;
  const family = resolveBackChestChestStimulusFamily(exercise);
  if (!family) return 10;

  let rank = 0;

  if (policy.preferComplementaryFamily && policy.priorFamily) {
    const complementaryFamily = policy.priorFamily === "fly" ? "press" : "fly";
    if (family === complementaryFamily) rank -= 6;
  }

  if (policy.preferPressFamily) {
    rank += family === "press" ? -7 : 7;
  }

  if (policy.applyRepeatPenalty && policy.priorFamily && family === policy.priorFamily) {
    rank += 8;
  }

  if (policy.preferStablePressFamily && family === "press") {
    const stablePress =
      exercise.equipment.includes("machines") || exercise.equipment.includes("cables");
    if (stablePress) rank -= 2;
    if (!stablePress && exercise.loadType !== "weighted") rank += 1;
  }

  return rank;
};

const compareBackChestAnchorCandidates = (params: {
  role: BackChestAnchorRole;
  left: Exercise;
  right: Exercise;
  daysPerWeek: 3 | 4 | 5;
  goalModifier: BackChestGoalModifier;
  selectionContext?: SelectionContext;
  availableForBackChest?: Set<Equipment>;
  deprioritizedExerciseId?: string | null;
  preferFlyPattern?: boolean;
  chestStimulusPolicy?: BackChestThreeDayChestStimulusPolicy | null;
}) => {
  const {
    role,
    left,
    right,
    daysPerWeek,
    goalModifier,
    selectionContext,
    availableForBackChest,
    deprioritizedExerciseId = null,
    preferFlyPattern = false,
    chestStimulusPolicy = null,
  } = params;
  if (role === "horizontalPush" && chestStimulusPolicy) {
    const chestPolicyDelta =
      resolveBackChestThreeDayChestStimulusPreferenceRank({
        exercise: left,
        policy: chestStimulusPolicy,
      }) -
      resolveBackChestThreeDayChestStimulusPreferenceRank({
        exercise: right,
        policy: chestStimulusPolicy,
      });
    if (chestPolicyDelta !== 0) return chestPolicyDelta;
  }
  if (preferFlyPattern && role === "horizontalPush" && !chestStimulusPolicy) {
    const leftIsFly = isBackChestFlyPatternExercise(left);
    const rightIsFly = isBackChestFlyPatternExercise(right);
    if (leftIsFly !== rightIsFly) return leftIsFly ? -1 : 1;
  }
  if (daysPerWeek === 3) {
    const preferenceDelta =
      resolveBackChestAnchorPreferenceRank({
        role,
        exercise: left,
        goalModifier,
        selectionContext,
        availableForBackChest,
      }) -
      resolveBackChestAnchorPreferenceRank({
        role,
        exercise: right,
        goalModifier,
        selectionContext,
        availableForBackChest,
      });
    if (preferenceDelta !== 0) return preferenceDelta;
  }
  if (deprioritizedExerciseId) {
    const leftIsDeprioritized = left.id === deprioritizedExerciseId;
    const rightIsDeprioritized = right.id === deprioritizedExerciseId;
    if (leftIsDeprioritized !== rightIsDeprioritized) {
      return leftIsDeprioritized ? 1 : -1;
    }
  }
  const variationState = selectionContext?.variationState;
  const nonBeginnerLowPain =
    selectionContext?.experienceLevel !== "beginner" &&
    selectionContext?.painSeverity === "low";
  const activeVariationState =
    daysPerWeek === 3 &&
    selectionContext &&
    nonBeginnerLowPain &&
    variationState?.enabled
      ? variationState
      : null;
  if (activeVariationState && selectionContext) {
    const variationIndex = resolveProgramVariationIndex(activeVariationState.options);
    const variationSeed =
      activeVariationState.options.settingsHash ??
      activeVariationState.settingsKey ??
      activeVariationState.seedKey ??
      activeVariationState.options.seed ??
      "back-chest-anchor";
    const tieBreakSeed = `${variationSeed}|v:${variationIndex}|${selectionContext.phaseStage}|${role}`;
    const leftSeed = stableHashUnit(`${tieBreakSeed}|${left.id}`);
    const rightSeed = stableHashUnit(`${tieBreakSeed}|${right.id}`);
    if (leftSeed !== rightSeed) return leftSeed - rightSeed;
  }
  return 0;
};

const sortBackChestAnchorCandidateIds = (params: {
  role: BackChestAnchorRole;
  candidateIds: string[];
  daysPerWeek: 3 | 4 | 5;
  goalModifier: BackChestGoalModifier;
  selectionContext?: SelectionContext;
  availableForBackChest?: Set<Equipment>;
  deprioritizedExerciseId?: string | null;
  preferFlyPattern?: boolean;
  chestStimulusPolicy?: BackChestThreeDayChestStimulusPolicy | null;
}) => {
  const {
    role,
    candidateIds,
    daysPerWeek,
    goalModifier,
    selectionContext,
    availableForBackChest,
    deprioritizedExerciseId = null,
    preferFlyPattern = false,
    chestStimulusPolicy = null,
  } = params;
  const originalIndexById = new Map(candidateIds.map((id, index) => [id, index]));
  return [...candidateIds].sort((leftId, rightId) => {
    const left = exerciseById(leftId);
    const right = exerciseById(rightId);
    if (!left || !right) {
      const leftIndex = originalIndexById.get(leftId) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = originalIndexById.get(rightId) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    }
    const comparison = compareBackChestAnchorCandidates({
      role,
      left,
      right,
      daysPerWeek,
      goalModifier,
      selectionContext,
      availableForBackChest,
      deprioritizedExerciseId,
      preferFlyPattern,
      chestStimulusPolicy,
    });
    if (comparison !== 0) return comparison;
    const leftIndex = originalIndexById.get(leftId) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = originalIndexById.get(rightId) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
};

const resolveBackChestAnchorRoleForSlot = (
  slotKind: string,
  slotLane?: MainLane
): BackChestAnchorRole | null => {
  if (slotKind === "mainPullHorizontal") return "horizontalPull";
  if (slotKind === "mainPullVertical") return "verticalPull";
  if (slotKind === "mainPushFly" || slotKind === "mainPushCompound") {
    return "horizontalPush";
  }
  if (slotLane === "push") return "horizontalPush";
  return null;
};

const isBackChestIntermediateFlyExpansionSlotByIndex = (params: {
  slot: { lane: MainLane; slotKind?: string };
  slotIndex: number;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}) => {
  const { slot, slotIndex, context, daysPerWeek } = params;
  if (slot.slotKind === "mainPushFly") return true;
  if (daysPerWeek !== 3) return false;
  if (context.selectionContext.experienceLevel !== "intermediate") return false;
  if (context.selectionContext.phaseStage !== "skill") return false;
  if (resolveBackChestGoalType(context.selectionContext.goal) === "improvePosture") return false;
  if (slot.lane !== "push") return false;
  return slotIndex >= 3;
};

const shouldAllowBackChestFlyForSlot = (params: {
  slot: { lane: MainLane; slotKind?: string };
  slotIndex: number;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  goalModifier: BackChestGoalModifier;
}) => {
  const { slot, slotIndex, context, daysPerWeek, goalModifier } = params;
  if (slot.lane !== "push") return false;
  if (!goalModifier.chestFlyAllowed) return false;
  if (slot.slotKind === "mainPushFly") return true;
  return (
    isBackChestIntermediateFlyExpansionSlotByIndex({
      slot,
      slotIndex,
      context,
      daysPerWeek,
    }) && context.selectionContext.phaseStage === "skill"
  );
};

const getBackChestEligibleAnchorCandidates = (params: {
  role: BackChestAnchorRole;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  tierProfile: BackChestTierProfile;
  goalModifier?: BackChestGoalModifier;
}): Exercise[] => {
  const {
    role,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier: providedGoalModifier,
  } = params;
  const goalModifier =
    providedGoalModifier ??
    resolveBackChestGoalModifier({
      context,
      daysPerWeek,
    });
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const baseCandidates = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => matchesBackChestAnchorRole(exercise, role))
    .filter((exercise) => !isIsolationExercise(exercise))
    .filter((exercise) =>
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: false,
      })
    )
    .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    )
    .filter((exercise) =>
      isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
    )
    .filter((exercise) =>
      role === "horizontalPush"
        ? isBackChestFloorPressAllowed(exercise, context, tierProfile)
        : true
    )
    .filter((exercise) =>
      isBackChestAnchorTierAllowed({
        exercise,
        role,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
      })
    );
  const withStabilityBias =
    goalModifier.supportedPatternBias &&
    role === "horizontalPull" &&
    baseCandidates.some(isBackChestSupportedRowForLadder)
      ? baseCandidates.filter((exercise) => !isBackChestUnsupportedHingeRowExercise(exercise))
      : baseCandidates;
  const bandVerticalCandidates =
    role === "verticalPull" && context.available.has("bands")
      ? withStabilityBias.filter(isBackChestBandStyleVerticalPull)
      : [];
  const finalCandidates = bandVerticalCandidates.length
    ? bandVerticalCandidates
    : withStabilityBias;
  return finalCandidates.sort((left, right) =>
    compareBackChestAnchorCandidates({
      role,
      left,
      right,
      daysPerWeek,
      goalModifier,
      selectionContext: context.selectionContext,
      availableForBackChest,
      deprioritizedExerciseId: null,
    })
  );
};

const selectBackChestAnchorExercise = (params: {
  role: BackChestAnchorRole;
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  tierProfile: BackChestTierProfile;
  goalModifier?: BackChestGoalModifier;
  previousAnchor: Exercise | null;
  allowChestIsolation?: boolean;
  preferFlyPattern?: boolean;
}): Exercise | null => {
  const {
    role,
    usedIds,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier: providedGoalModifier,
    previousAnchor,
    allowChestIsolation = false,
    preferFlyPattern = false,
  } = params;
  const goalModifier =
    providedGoalModifier ??
    resolveBackChestGoalModifier({
      context,
      daysPerWeek,
    });
  const effectiveTierCeiling = resolveBackChestGoalAdjustedTierCeiling({
    tierProfile,
    goalModifier,
  });
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const reducePainModeActive = goalModifier.goalType === "reducePain";
  const reducePainVariationActive =
    reducePainModeActive &&
    goalModifier.moderateAccessoryRotation &&
    context.selectionContext.phaseStage !== "activation";
  const deprioritizedPreviousAnchorId = reducePainVariationActive ? previousAnchor?.id ?? null : null;
  const chestStimulusPolicy = resolveBackChestThreeDayChestStimulusPolicy({
    role,
    daysPerWeek,
    context,
    previousAnchor,
  });
  const effectivePreferFlyPattern = preferFlyPattern && !chestStimulusPolicy;
  const hasPullupBar = availableForBackChest.has("pullup_bar");
  const enforceBandVerticalPullIntegrity =
    role === "verticalPull" && daysPerWeek === 3 && context.available.has("bands");
  const previousRung = previousAnchor
    ? resolveBackChestAnchorRung(role, previousAnchor, hasPullupBar)
    : null;
  const rungFloor =
    previousRung && !tierProfile.painCapActive
      ? toBackChestTier(Math.min(previousRung, effectiveTierCeiling))
      : (1 as BackChestEquipmentTier);
  const eligibleAnchorCandidates = getBackChestEligibleAnchorCandidates({
    role,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier,
  }).filter((candidate) => !usedIds.has(candidate.id));
  const hasTier2OrHigherCandidate = eligibleAnchorCandidates.some(
    (candidate) => resolveBackChestEquipmentTier(candidate) >= 2
  );
  const highestEligibleTier = eligibleAnchorCandidates.reduce<BackChestEquipmentTier | null>(
    (highest, candidate) => {
      const tier = resolveBackChestEquipmentTier(candidate);
      if (!highest || tier > highest) return tier;
      return highest;
    },
    null
  );
  const hasAnyBandVerticalCandidate =
    enforceBandVerticalPullIntegrity &&
    eligibleAnchorCandidates.some(isBackChestBandStyleVerticalPull);
  const hasBandVerticalCandidateForRung = (rung: BackChestEquipmentTier) =>
    enforceBandVerticalPullIntegrity &&
    eligibleAnchorCandidates.some(
      (candidate) =>
        resolveBackChestAnchorRung(role, candidate, hasPullupBar) === rung &&
        isBackChestBandStyleVerticalPull(candidate)
    );

  const phaseStage = context.selectionContext.phaseStage;
  const desiredRung = resolveBackChestDesiredAnchorRung({
    context,
    tierProfile,
  });
  const effectiveDesiredRung = toBackChestTier(Math.min(desiredRung, effectiveTierCeiling));
  const minAllowedRung = tierProfile.painCapActive ? 1 : rungFloor;
  let strictRungOrder: BackChestEquipmentTier[];
  if (phaseStage === "activation") {
    const activationMaxRung = toBackChestTier(Math.min(2, effectiveTierCeiling));
    const nonBeginnerLowPainActivation =
      context.selectionContext.experienceLevel !== "beginner" &&
      context.selectionContext.painSeverity === "low";
    const preferTierTwoActivation =
      nonBeginnerLowPainActivation &&
      !allowChestIsolation &&
      hasTier2OrHigherCandidate &&
      activationMaxRung >= 2;
    const activationMinRung = preferTierTwoActivation
      ? (2 as BackChestEquipmentTier)
      : toBackChestTier(Math.min(minAllowedRung, activationMaxRung));
    strictRungOrder = buildBackChestRungOrder({
      targetRung: activationMinRung,
      minRung: activationMinRung,
      maxRung: activationMaxRung,
    });
  } else if (phaseStage === "skill") {
    const enforceTier2Floor =
      hasTier2OrHigherCandidate &&
      (reducePainModeActive
        ? effectiveTierCeiling >= 2
        : !tierProfile.painCapActive);
    const skillMinRung = enforceTier2Floor
      ? toBackChestTier(Math.max(2, minAllowedRung))
      : minAllowedRung;
    const skillTarget = toBackChestTier(Math.max(skillMinRung, effectiveDesiredRung));
    strictRungOrder = buildBackChestRungOrder({
      targetRung: skillTarget,
      minRung: skillMinRung,
      maxRung: effectiveTierCeiling,
    });
  } else {
    const growthTarget = toBackChestTier(
      Math.max(
        minAllowedRung,
        Math.min(highestEligibleTier ?? effectiveDesiredRung, effectiveTierCeiling)
      )
    );
    strictRungOrder = [growthTarget];
  }

  const relaxedRungOrderSource =
    phaseStage === "activation"
      ? ([2, 1] as BackChestEquipmentTier[])
      : ([3, 2, 1] as BackChestEquipmentTier[]);
  const relaxedRungOrder = relaxedRungOrderSource
    .filter((rung) => rung <= effectiveTierCeiling)
    .filter((rung) => rung >= minAllowedRung);
  const rungOrder = Array.from(new Set([...strictRungOrder, ...relaxedRungOrder]));
  for (const rung of rungOrder) {
    const orderedCandidateIds = sortBackChestAnchorCandidateIds({
      role,
      candidateIds: getBackChestAnchorLadderIdsForRung({
        role,
        rung,
        hasPullupBar,
      }),
      daysPerWeek,
      goalModifier,
      selectionContext: context.selectionContext,
      availableForBackChest,
      deprioritizedExerciseId: deprioritizedPreviousAnchorId,
      preferFlyPattern: effectivePreferFlyPattern,
      chestStimulusPolicy,
    });
    const candidate = pickFirstBackChestCandidateByIds({
      candidateIds: orderedCandidateIds,
      section: "main",
      usedIds,
      context,
      tierCeiling: effectiveTierCeiling,
      allowBodyweightFallback: role === "verticalPull",
      predicate: (exercise) => {
        if (
          !isBackChestMainBoundaryEligible({
            exercise,
            allowChestFly: allowChestIsolation,
          })
        ) {
          return false;
        }
        if (!matchesBackChestAnchorRole(exercise, role)) return false;
        if (
          enforceBandVerticalPullIntegrity &&
          hasBandVerticalCandidateForRung(rung) &&
          !isBackChestBandStyleVerticalPull(exercise)
        ) {
          return false;
        }
        if (
          isIsolationExercise(exercise) &&
          (!allowChestIsolation || !isBackChestFlyPatternExercise(exercise))
        ) {
          return false;
        }
        if (isBackChestScapularAccessoryPullExercise(exercise)) return false;
        if (
          !isBackChestExperienceEligible(
            exercise,
            context.selectionContext.experienceLevel
          )
        ) {
          return false;
        }
        if (
          role === "horizontalPush" &&
          !isBackChestFloorPressAllowed(exercise, context, tierProfile)
        ) {
          return false;
        }
        if (
          !isBackChestAnchorTierAllowed({
            exercise,
            role,
            context,
            daysPerWeek,
            tierProfile,
            goalModifier,
          })
        ) {
          return false;
        }
        const candidateRung = resolveBackChestAnchorRung(role, exercise, hasPullupBar);
        return candidateRung >= rungFloor && candidateRung === rung;
      },
    });
    if (candidate) return candidate;
  }

  for (const rung of rungOrder) {
    const rungFallback = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: availableForBackChest,
          section: "main",
          context: context.selectionContext,
        })
      )
      .filter((exercise) => matchesBackChestAnchorRole(exercise, role))
      .filter((exercise) =>
        isBackChestMainBoundaryEligible({
          exercise,
          allowChestFly: allowChestIsolation,
        })
      )
      .filter(
        (exercise) =>
          !isIsolationExercise(exercise) ||
          (allowChestIsolation && isBackChestFlyPatternExercise(exercise))
      )
      .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
      .filter((exercise) =>
        isBackChestExperienceEligible(
          exercise,
          context.selectionContext.experienceLevel
        )
      )
      .filter((exercise) =>
        role === "horizontalPush"
          ? isBackChestFloorPressAllowed(exercise, context, tierProfile)
          : true
      )
      .filter((exercise) =>
        isBackChestAnchorTierAllowed({
          exercise,
          role,
          context,
          daysPerWeek,
          tierProfile,
          goalModifier,
        })
      )
      .filter((exercise) =>
        enforceBandVerticalPullIntegrity && hasBandVerticalCandidateForRung(rung)
          ? isBackChestBandStyleVerticalPull(exercise)
          : true
      )
      .filter((exercise) => resolveBackChestAnchorRung(role, exercise, hasPullupBar) === rung)
      .sort((left, right) =>
        compareBackChestAnchorCandidates({
          role,
          left,
          right,
          daysPerWeek,
          goalModifier,
          selectionContext: context.selectionContext,
          availableForBackChest,
          deprioritizedExerciseId: deprioritizedPreviousAnchorId,
          preferFlyPattern: effectivePreferFlyPattern,
          chestStimulusPolicy,
        })
      )[0];
    if (rungFallback) return rungFallback;
  }

  const generic = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    )
    .filter((exercise) => matchesBackChestAnchorRole(exercise, role))
    .filter((exercise) =>
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: allowChestIsolation,
      })
    )
    .filter(
      (exercise) =>
        !isIsolationExercise(exercise) ||
        (allowChestIsolation && isBackChestFlyPatternExercise(exercise))
    )
    .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
    .filter((exercise) =>
      isBackChestExperienceEligible(
        exercise,
        context.selectionContext.experienceLevel
      )
    )
    .filter((exercise) =>
      role === "horizontalPush"
        ? isBackChestFloorPressAllowed(exercise, context, tierProfile)
        : true
    )
    .filter((exercise) =>
      isBackChestAnchorTierAllowed({
        exercise,
        role,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
      })
    )
    .filter((exercise) =>
      enforceBandVerticalPullIntegrity && hasAnyBandVerticalCandidate
        ? isBackChestBandStyleVerticalPull(exercise)
        : true
    )
    .sort((left, right) =>
      compareBackChestAnchorCandidates({
        role,
        left,
        right,
        daysPerWeek,
        goalModifier,
        selectionContext: context.selectionContext,
        availableForBackChest,
        deprioritizedExerciseId: deprioritizedPreviousAnchorId,
        preferFlyPattern: effectivePreferFlyPattern,
        chestStimulusPolicy,
      })
    )[0];

  return generic ?? null;
};

const selectBackChestSupportPullExercise = (params: {
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
  tierProfile: BackChestTierProfile;
}): Exercise | null => {
  const { usedIds, context, tierProfile } = params;
  const phasePool = BACK_CHEST_SUPPORT_PULL_PHASE_POOLS[context.selectionContext.phaseStage] ?? [];
  const candidate = pickFirstBackChestCandidateByIds({
    candidateIds: phasePool,
    section: "main",
    usedIds,
    context,
    tierCeiling: tierProfile.tierCeiling,
    predicate: (exercise) =>
      matchesBackChestMainSlotKind({
        exercise,
        slotKind: "mainPullSupport",
        slotLane: "pull",
      }) &&
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: false,
      }) &&
      !isIsolationExercise(exercise),
  });
  if (candidate) return candidate;

  const relaxedSupportCandidate = pickFirstBackChestCandidateByIds({
    candidateIds: phasePool,
    section: "main",
    usedIds,
    context,
    tierCeiling: tierProfile.tierCeiling,
    allowBodyweightFallback: true,
    predicate: (exercise) =>
      matchesBackChestMainSlotKind({
        exercise,
        slotKind: "mainPullSupport",
        slotLane: "pull",
      }) &&
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: false,
      }) &&
      !isIsolationExercise(exercise),
  });
  if (relaxedSupportCandidate) return relaxedSupportCandidate;

  // Keep support slot within upper-body push/pull compounds when pull-only pool is exhausted.
  const descriptorHasLowerBodyToken = (exercise: Exercise) => {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    return (
      descriptor.includes("squat") ||
      descriptor.includes("lunge") ||
      descriptor.includes("cossack") ||
      descriptor.includes("calf")
    );
  };
  const upperExpansionFallback = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: resolveBackChestMainAvailableSet(context.available),
        section: "main",
        context: context.selectionContext,
      })
    )
    .filter((exercise) =>
      isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
    )
    .filter((exercise) => !isIsolationExercise(exercise))
    .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
    .filter((exercise) =>
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: false,
      })
    )
    .filter((exercise) => resolveBackChestEquipmentTier(exercise) <= tierProfile.tierCeiling)
    .filter((exercise) => !descriptorHasLowerBodyToken(exercise))
    .filter((exercise) => {
      const patterns = new Set(
        exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
      );
      if (patterns.has("squat") || patterns.has("hinge") || patterns.has("singleleg")) {
        return false;
      }
      return (
        hasHorizontalPullSignature(exercise) ||
        hasVerticalPullSignature(exercise) ||
        hasHorizontalPushSignature(exercise) ||
        patterns.has("verticalpush")
      );
    })
    .sort((left, right) => {
      const leftPull =
        hasHorizontalPullSignature(left) || hasVerticalPullSignature(left);
      const rightPull =
        hasHorizontalPullSignature(right) || hasVerticalPullSignature(right);
      if (leftPull !== rightPull) return leftPull ? -1 : 1;
      return left.id.localeCompare(right.id);
    })[0];
  return upperExpansionFallback ?? null;
};

const selectBackChestVerticalPushExercise = (params: {
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
  tierProfile: BackChestTierProfile;
}): Exercise | null => {
  const { usedIds, context, tierProfile } = params;
  const desiredRung = resolveBackChestDesiredAnchorRung({ context, tierProfile });
  const rungOrder = buildBackChestRungOrder({
    targetRung: desiredRung,
    minRung: 1,
    maxRung: tierProfile.tierCeiling,
  });
  for (const rung of rungOrder) {
    const candidate = pickFirstBackChestCandidateByIds({
      candidateIds: BACK_CHEST_VERTICAL_PUSH_LADDER[rung],
      section: "main",
      usedIds,
      context,
      tierCeiling: tierProfile.tierCeiling,
      predicate: (exercise) =>
        matchesMainLanePattern(exercise, "verticalPush") &&
        !isIsolationExercise(exercise),
    });
    if (candidate) return candidate;
  }
  return null;
};

const evaluateBackChestMainIntelligence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): BackChestMainIntelligenceStatus => {
  const { day, daysPerWeek, context } = params;
  if (!isBackChestDayTitle(day.title)) {
    return {
      anchorIntegrityOk: true,
      pullBiasOk: true,
      advancedStructureOk: true,
      noDuplicateRowAngles: true,
      noIsolationMains: true,
      equipmentTierEscalationOk: true,
      movementLadderOk: true,
      ok: true,
    };
  }

  const mainExercises = day.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const accessoryExercises = day.routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const mainCount = mainExercises.length;
  const horizontalPullCount = mainExercises.filter((exercise) =>
    hasHorizontalPullSignature(exercise)
  ).length;
  const horizontalPushCount = mainExercises.filter((exercise) =>
    hasHorizontalPushSignature(exercise)
  ).length;
  const horizontalCompoundPressCount = mainExercises.filter(
    (exercise) => hasHorizontalPushSignature(exercise) && !isBackChestFlyPatternExercise(exercise)
  ).length;
  const verticalPullCount = mainExercises.filter((exercise) =>
    hasVerticalPullSignature(exercise)
  ).length;
  const flyMainCount = mainExercises.filter((exercise) =>
    isBackChestFlyPatternExercise(exercise)
  ).length;
  const pressMainCount = mainExercises.filter((exercise) =>
    isBackChestMainPress(exercise)
  ).length;
  const pullMainCount = mainExercises.filter((exercise) =>
    isBackChestMainPull(exercise)
  ).length;
  const hasLowerOrVerticalPushLeak = mainExercises.some(
    (exercise) =>
      isBackChestLowerBodyLeakExercise(exercise) ||
      isBackChestVerticalPushLeakExercise(exercise)
  );
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const previousBackChestDay = getBackChestDayFromWeek(context.previousWeek);
  const previousMainExercises = previousBackChestDay
    ? previousBackChestDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    : [];
  const horizontalPushExercise = getBackChestAnchorFromMain(
    mainExercises,
    "horizontalPush"
  );
  const hasEligibleFlyMainCandidate = exercises.some((exercise) => {
    if (exercise.category !== "main") return false;
    if (!isBackChestFlyPatternExercise(exercise)) return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    ) {
      return false;
    }
    return isBackChestMainBoundaryEligible({ exercise, allowChestFly: true });
  });
  const hasEligiblePressMainCandidate = exercises.some((exercise) => {
    if (exercise.category !== "main") return false;
    if (!hasHorizontalPushSignature(exercise)) return false;
    if (isBackChestFlyPatternExercise(exercise)) return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    ) {
      return false;
    }
    return isBackChestMainBoundaryEligible({ exercise, allowChestFly: false });
  });
  const flyAnchorSatisfied = flyMainCount >= 1 || !hasEligibleFlyMainCandidate;
  const compoundPressSatisfied = horizontalCompoundPressCount >= 1 || !hasEligiblePressMainCandidate;
  const pressMainCapOk = horizontalCompoundPressCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.press;
  const latAccentMainCount = mainExercises.filter((exercise) =>
    isBackChestLatAccentExercise(exercise)
  ).length;
  const backMainCount = horizontalPullCount + verticalPullCount + latAccentMainCount;
  const categoryCapsOk =
    horizontalPullCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.row &&
    horizontalCompoundPressCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.press &&
    verticalPullCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.vertical &&
    flyMainCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.fly &&
    latAccentMainCount <= BACK_CHEST_SECONDARY_CATEGORY_CAPS.latAccent;
  const isThreeDayBackChest = daysPerWeek === 3;
  const threeDayExpectedMainCount =
    context.selectionContext.experienceLevel === "advanced"
      ? 5
      : context.selectionContext.experienceLevel === "intermediate"
      ? 4
      : 3;
  const threeDayChestStructureOk =
    mainCount === threeDayExpectedMainCount &&
    horizontalPushCount === 2 &&
    horizontalCompoundPressCount >= 1 &&
    flyAnchorSatisfied &&
    compoundPressSatisfied;
  const threeDayBackStructureOk =
    context.selectionContext.experienceLevel === "beginner"
      ? backMainCount >= 1
      : horizontalPullCount >= 1 && verticalPullCount >= 1;
  const threeDayAdvancedBackExtraOk =
    context.selectionContext.experienceLevel !== "advanced" || backMainCount >= 3;
  const anchorIntegrityOk = isThreeDayBackChest
    ? threeDayChestStructureOk &&
      threeDayBackStructureOk &&
      threeDayAdvancedBackExtraOk &&
      categoryCapsOk &&
      !hasLowerOrVerticalPushLeak &&
      pressMainCapOk
    : horizontalPullCount >= 1 &&
      verticalPullCount === 1 &&
      flyAnchorSatisfied &&
      compoundPressSatisfied &&
      categoryCapsOk &&
      !hasLowerOrVerticalPushLeak &&
      pressMainCapOk;
  const pullVolume = [...mainExercises, ...accessoryExercises].filter((exercise) =>
    isBackChestMainPull(exercise)
  ).length;
  const pushVolume = [...mainExercises, ...accessoryExercises].filter((exercise) =>
    exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "push")
  ).length;
  const pullBiasOk = pullVolume >= pushVolume && pullMainCount >= pressMainCount;
  const noDuplicateRowAngles = !hasDuplicateBackChestRowAngles(mainExercises);
  const chestFlyIsolationMainCount = mainExercises.filter(
    (exercise) =>
      isIsolationExercise(exercise) && isBackChestFlyPatternExercise(exercise)
  ).length;
  const nonFlyIsolationMainCount = mainExercises.filter(
    (exercise) =>
      isIsolationExercise(exercise) && !isBackChestFlyPatternExercise(exercise)
  ).length;
  const noIsolationMains =
    nonFlyIsolationMainCount === 0 &&
    chestFlyIsolationMainCount <= 1 &&
    !mainExercises.some((exercise) => isBackChestScapularAccessoryPullExercise(exercise));

  const advancedStructureOk =
    context.selectionContext.experienceLevel !== "advanced" || mainCount < 5
      ? true
      : isThreeDayBackChest
      ? horizontalPushCount === 2 &&
        horizontalCompoundPressCount === 1 &&
        flyMainCount >= 1 &&
        pullMainCount >= 3 &&
        horizontalPullCount >= 1 &&
        verticalPullCount >= 1 &&
        backMainCount >= 3 &&
        horizontalPullCount <= 3 &&
        verticalPullCount <= 2 &&
        noDuplicateRowAngles
      : pressMainCount <= 2 &&
        pullMainCount >= 3 &&
        verticalPullCount === 1 &&
        horizontalPullCount >= 1 &&
        horizontalCompoundPressCount >= 1 &&
        horizontalPushCount <= 2 &&
        noDuplicateRowAngles;

  const tierProfile = resolveBackChestTierProfile(context);
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  const effectiveTierCeiling = resolveBackChestGoalAdjustedTierCeiling({
    tierProfile,
    goalModifier,
  });
  const hasPullupBar = context.available.has("pullup_bar");
  const horizontalPullExercise = getBackChestAnchorFromMain(
    mainExercises,
    "horizontalPull"
  );
  const verticalPullExercise = getBackChestAnchorFromMain(mainExercises, "verticalPull");
  const beginnerThreeDayBackLadderRole: BackChestAnchorRole | null =
    daysPerWeek === 3 && context.selectionContext.experienceLevel === "beginner"
      ? horizontalPullExercise
        ? "horizontalPull"
        : verticalPullExercise
        ? "verticalPull"
        : null
      : null;
  const phaseStage = context.selectionContext.phaseStage;
  const anchorRoles: BackChestAnchorRole[] =
    beginnerThreeDayBackLadderRole && daysPerWeek === 3
      ? [beginnerThreeDayBackLadderRole, "horizontalPush"]
      : ["horizontalPull", "verticalPull", "horizontalPush"];
  const anchorTierWithinCeiling = anchorRoles.every((role) => {
    const anchor = getBackChestAnchorFromMain(mainExercises, role);
    if (!anchor) return false;
    return isBackChestAnchorTierAllowed({
      exercise: anchor,
      role,
      context,
      daysPerWeek,
      tierProfile,
      goalModifier,
    });
  });
  const noAnchorRegression = anchorRoles.every((role) => {
    const currentAnchor = getBackChestAnchorFromMain(mainExercises, role);
    if (!currentAnchor) return false;
    if (tierProfile.painCapActive) return true;
    const previousAnchor = getBackChestAnchorFromMain(previousMainExercises, role);
    if (!previousAnchor) return true;
    const currentRung = resolveBackChestAnchorRung(role, currentAnchor, hasPullupBar);
    const previousRung = resolveBackChestAnchorRung(role, previousAnchor, hasPullupBar);
    const regressionCeiling = goalModifier.allowTier3InPhase3
      ? effectiveTierCeiling
      : toBackChestTier(Math.min(2, effectiveTierCeiling));
    if (
      isBackChestBeginnerGrowthSafetyCapActive({
        role,
        context,
        daysPerWeek,
      })
    ) {
      return currentRung >= toBackChestTier(Math.min(previousRung, 2, regressionCeiling));
    }
    return currentRung >= toBackChestTier(Math.min(previousRung, regressionCeiling));
  });
  const equipmentTierEscalationOk = anchorTierWithinCeiling && noAnchorRegression;

  const anchorTierRuleOk = (role: BackChestAnchorRole, selected: Exercise | null) => {
    if (!selected) return false;
    const selectedTier = resolveBackChestAnchorRung(role, selected, hasPullupBar);
    const eligibleCandidates = getBackChestEligibleAnchorCandidates({
      role,
      context,
      daysPerWeek,
      tierProfile,
      goalModifier,
    });
    const highestTier = eligibleCandidates.reduce<BackChestEquipmentTier>((highest, candidate) => {
      const tier = resolveBackChestEquipmentTier(candidate);
      return tier > highest ? tier : highest;
    }, 1);
    const hasTier2OrHigher = eligibleCandidates.some(
      (candidate) => resolveBackChestEquipmentTier(candidate) >= 2
    );
    const hasTier1Or2 = eligibleCandidates.some(
      (candidate) => resolveBackChestEquipmentTier(candidate) <= 2
    );

    if (phaseStage === "activation") {
      if (hasTier1Or2) return selectedTier <= Math.min(2, effectiveTierCeiling);
      return selectedTier >= 1;
    }

    if (phaseStage === "skill") {
      const enforceTier2Floor =
        hasTier2OrHigher &&
        (goalModifier.goalType === "reducePain"
          ? effectiveTierCeiling >= 2
          : !tierProfile.painCapActive);
      if (enforceTier2Floor) return selectedTier >= 2;
      return selectedTier >= 1;
    }

    if (tierProfile.painCapActive) {
      const safetyFloor = toBackChestTier(Math.max(1, highestTier - 1));
      return selectedTier >= safetyFloor;
    }
    return selectedTier >= highestTier;
  };

  const experienceMinOk = anchorRoles.every((role) => {
    const anchor = getBackChestAnchorFromMain(mainExercises, role);
    if (!anchor) return false;
    return isBackChestExperienceEligible(anchor, context.selectionContext.experienceLevel);
  });
  const rowLadderOk = anchorTierRuleOk("horizontalPull", horizontalPullExercise);
  const pullupLadderOk = anchorTierRuleOk("verticalPull", verticalPullExercise);
  const pressLadderOk = anchorTierRuleOk("horizontalPush", horizontalPushExercise);
  const beginnerBackLadderOk =
    daysPerWeek === 3 && context.selectionContext.experienceLevel === "beginner"
      ? beginnerThreeDayBackLadderRole === "horizontalPull"
        ? rowLadderOk
        : beginnerThreeDayBackLadderRole === "verticalPull"
        ? pullupLadderOk
        : false
      : true;
  const movementLadderOk =
    (daysPerWeek === 3 && context.selectionContext.experienceLevel === "beginner"
      ? beginnerBackLadderOk && pressLadderOk
      : rowLadderOk && pullupLadderOk && pressLadderOk) &&
    experienceMinOk;
  const ok =
    anchorIntegrityOk &&
    pullBiasOk &&
    advancedStructureOk &&
    noDuplicateRowAngles &&
    noIsolationMains &&
    equipmentTierEscalationOk &&
    movementLadderOk;
  return {
    anchorIntegrityOk,
    pullBiasOk,
    advancedStructureOk,
    noDuplicateRowAngles,
    noIsolationMains,
    equipmentTierEscalationOk,
    movementLadderOk,
    ok,
  };
};

const formatBackChestMainStatus = (status: BackChestMainIntelligenceStatus) =>
  `anchors=${status.anchorIntegrityOk},pullBias=${status.pullBiasOk},advanced=${status.advancedStructureOk},` +
  `rowAngles=${status.noDuplicateRowAngles},isolation=${status.noIsolationMains},` +
  `tier=${status.equipmentTierEscalationOk},ladder=${status.movementLadderOk}`;

const BACK_CHEST_ANCHOR_VARIATION_PRIORITY: BackChestAnchorRole[] = [
  "verticalPull",
  "horizontalPull",
  "horizontalPush",
];

const BACK_CHEST_BAND_ROW_VARIATION_IDS = [
  "single-arm-band-row",
  "band-row-iso-hold",
  "banded-rows-seated",
  "split-stance-row",
  "band-row",
];

const BACK_CHEST_BAND_PRESS_VARIATION_IDS = [
  "tall-kneeling-band-chest-press",
  "split-stance-band-chest-press",
  "band-chest-press-iso-hold",
  "band-chest-press",
];

const BACK_CHEST_BAND_UNILATERAL_OR_ISO_ROW_IDS = new Set([
  "single-arm-band-row",
  "band-row-iso-hold",
]);

const hasBackChestControlFocusForBands = (selectionContext: SelectionContext) => {
  const poseFocusTags = selectionContext.poseFocusTags;
  if (
    poseFocusTags.has("scapular_control") ||
    poseFocusTags.has("scap_control") ||
    poseFocusTags.has("external_rotation")
  ) {
    return true;
  }
  return selectionContext.preferredPatterns.has("anti_rotation");
};

const resolveBackChestBandRowPreferredIds = (params: {
  goalType: BackChestGoalType;
  phaseStage: ProgramPhaseStage;
  preferControlWork?: boolean;
}) => {
  const { goalType, phaseStage, preferControlWork = false } = params;
  const without = (id: string) =>
    BACK_CHEST_BAND_ROW_VARIATION_IDS.filter((candidate) => candidate !== id);
  if (goalType === "reducePain" && !preferControlWork) {
    if (phaseStage === "skill") {
      return [
        "split-stance-row",
        "banded-rows-seated",
        "band-row",
        "single-arm-band-row",
        "band-row-iso-hold",
      ];
    }
    return [
      "banded-rows-seated",
      "split-stance-row",
      "band-row",
      "single-arm-band-row",
      "band-row-iso-hold",
    ];
  }
  if (goalType === "athleticPerformance") {
    if (phaseStage === "skill") {
      return [
        "split-stance-row",
        "single-arm-band-row",
        ...without("split-stance-row").filter((candidate) => candidate !== "single-arm-band-row"),
      ];
    }
    return [
      "single-arm-band-row",
      "split-stance-row",
      ...without("single-arm-band-row").filter((candidate) => candidate !== "split-stance-row"),
    ];
  }
  if (phaseStage === "skill") {
    if (goalType === "generalFitness") {
      return [
        "split-stance-row",
        ...without("split-stance-row"),
      ];
    }
    return [
      "single-arm-band-row",
      "band-row-iso-hold",
      ...without("single-arm-band-row").filter((candidate) => candidate !== "band-row-iso-hold"),
    ];
  }
  return [
    "single-arm-band-row",
    "band-row-iso-hold",
    ...without("single-arm-band-row").filter((candidate) => candidate !== "band-row-iso-hold"),
  ];
};

const resolveBackChestBandPressPreferredIds = (params: {
  goalType: BackChestGoalType;
  phaseStage: ProgramPhaseStage;
  preferControlWork?: boolean;
}) => {
  const { goalType, phaseStage, preferControlWork = false } = params;
  const without = (id: string) =>
    BACK_CHEST_BAND_PRESS_VARIATION_IDS.filter((candidate) => candidate !== id);
  if (goalType === "reducePain" && !preferControlWork) {
    if (phaseStage === "skill") {
      return [
        "band-chest-press",
        "split-stance-band-chest-press",
        "tall-kneeling-band-chest-press",
        "band-chest-press-iso-hold",
      ];
    }
    return [
      "split-stance-band-chest-press",
      "band-chest-press",
      "tall-kneeling-band-chest-press",
      "band-chest-press-iso-hold",
    ];
  }
  if (goalType === "athleticPerformance") {
    if (phaseStage === "skill") {
      return [
        "split-stance-band-chest-press",
        "tall-kneeling-band-chest-press",
        ...without("split-stance-band-chest-press").filter(
          (candidate) => candidate !== "tall-kneeling-band-chest-press"
        ),
      ];
    }
    return [
      "split-stance-band-chest-press",
      "band-chest-press-iso-hold",
      ...without("split-stance-band-chest-press").filter(
        (candidate) => candidate !== "band-chest-press-iso-hold"
      ),
    ];
  }
  if (phaseStage === "skill") {
    if (goalType === "generalFitness") {
      return [
        "split-stance-band-chest-press",
        ...without("split-stance-band-chest-press"),
      ];
    }
    return [
      "tall-kneeling-band-chest-press",
      ...without("tall-kneeling-band-chest-press"),
    ];
  }
  return [
    "band-chest-press-iso-hold",
    ...without("band-chest-press-iso-hold"),
  ];
};

const isBackChestBandUnilateralOrIsoRow = (exercise: Exercise) => {
  if (resolveBackChestExerciseFamilyKey(exercise) !== "band_row") return false;
  const variantKey = resolveBackChestExerciseVariantKey(exercise);
  if (variantKey === "single_arm" || variantKey === "iso_hold") return true;
  return BACK_CHEST_BAND_UNILATERAL_OR_ISO_ROW_IDS.has(exercise.id);
};

type BackChestAnchorVariationPreset = {
  deprioritizedByRole: Partial<Record<BackChestAnchorRole, string[]>>;
  preferredByRole: Partial<Record<BackChestAnchorRole, string[]>>;
};

type BackChestProgressiveVariationTarget = {
  rolePriority: BackChestAnchorRole[];
  minDifferencesFromPrevious: number;
  preferBandVerticalFamily: boolean;
  preferredByRole?: Partial<Record<BackChestAnchorRole, string[]>>;
};

const isBackChestBandStyleVerticalPull = (exercise: Exercise) =>
  hasVerticalPullSignature(exercise) &&
  (exercise.equipment.includes("bands") || exercise.equipment.includes("cables"));

const resolveBackChestProgressiveVariationTarget = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}): BackChestProgressiveVariationTarget | null => {
  const { context, daysPerWeek } = params;
  if (daysPerWeek !== 3) return null;
  const goalType = resolveBackChestGoalType(context.selectionContext.goal);
  if (context.selectionContext.experienceLevel !== "beginner") return null;

  const phaseStage = context.selectionContext.phaseStage;
  if (phaseStage !== "skill" && phaseStage !== "growth") return null;

  if (context.capabilityMode === "noneOnly" && goalType === "reducePain") {
    return {
      rolePriority: ["verticalPull", "horizontalPush", "horizontalPull"],
      minDifferencesFromPrevious: phaseStage === "skill" ? 2 : 1,
      preferBandVerticalFamily: false,
      preferredByRole:
        phaseStage === "skill"
          ? {
              verticalPull: ["prone-lat-sweep", "supine-lat-pulldown-isometric"],
              horizontalPush: ["countertop-pushup", "wall-pushup"],
              horizontalPull: ["prone-elbow-row", "back-widow"],
            }
          : {
              verticalPull: ["supine-lat-pulldown-isometric", "prone-lat-sweep"],
              horizontalPush: ["wall-pushup", "countertop-pushup"],
              horizontalPull: ["back-widow", "prone-elbow-row"],
            },
    };
  }

  if (context.capabilityMode === "bandOnly") {
    const preferControlWork = hasBackChestControlFocusForBands(context.selectionContext);
    const bandRowPreferredIds = resolveBackChestBandRowPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    const bandPressPreferredIds = resolveBackChestBandPressPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    const bandVerticalPreferredIds =
      phaseStage === "skill"
        ? [
            "band-lat-pulldown-kneeling",
            "tall-kneeling-band-lat-pulldown",
            "standing-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown",
            "band-lat-pulldown-iso-hold",
          ]
        : [
            "standing-band-lat-pulldown",
            "tall-kneeling-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown-iso-hold",
            "band-lat-pulldown-kneeling",
            "band-lat-pulldown",
          ];
    return {
      rolePriority: ["horizontalPull", "horizontalPush", "verticalPull"],
      minDifferencesFromPrevious: phaseStage === "skill" ? 2 : 1,
      preferBandVerticalFamily: true,
      preferredByRole: {
        verticalPull: bandVerticalPreferredIds,
        horizontalPull: bandRowPreferredIds,
        horizontalPush: bandPressPreferredIds,
      },
    };
  }

  return null;
};

const countBackChestAnchorDifferencesFromPrevious = (params: {
  previousAnchorByRole: Map<BackChestAnchorRole, Exercise>;
  getCurrentAnchor: (
    role: BackChestAnchorRole
  ) => { slotIndex: number; exercise: Exercise } | null;
}) => {
  const { previousAnchorByRole, getCurrentAnchor } = params;
  return BACK_CHEST_ANCHOR_VARIATION_PRIORITY.reduce((count, role) => {
    const previous = previousAnchorByRole.get(role);
    const current = getCurrentAnchor(role);
    if (!previous || !current) return count;
    return previous.id === current.exercise.id ? count : count + 1;
  }, 0);
};

const resolveBackChestStandaloneVariationPreset = (params: {
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
}): BackChestAnchorVariationPreset | null => {
  const { context, daysPerWeek } = params;
  if (daysPerWeek !== 3) return null;
  const goalType = resolveBackChestGoalType(context.selectionContext.goal);
  if (context.selectionContext.experienceLevel !== "beginner") return null;
  if (
    context.capabilityMode !== "noneOnly" &&
    context.capabilityMode !== "bandOnly"
  ) {
    return null;
  }

  const phaseStage = context.selectionContext.phaseStage;
  if (phaseStage !== "skill" && phaseStage !== "growth") return null;

  if (context.capabilityMode === "noneOnly") {
    if (goalType !== "reducePain") return null;
    if (phaseStage === "skill") {
      return {
        deprioritizedByRole: {
          verticalPull: ["seated-lat-sweep-pulse", "supine-lat-pulldown-isometric"],
          horizontalPull: ["supine-elbow-drive-row"],
          horizontalPush: ["pushup"],
        },
        preferredByRole: {
          verticalPull: ["prone-lat-sweep", "supine-lat-pulldown-isometric"],
          horizontalPull: ["prone-elbow-row", "back-widow"],
          horizontalPush: ["countertop-pushup", "wall-pushup"],
        },
      };
    }

    return {
      deprioritizedByRole: {
        verticalPull: ["prone-lat-sweep", "seated-lat-sweep-pulse"],
        horizontalPull: ["prone-elbow-row", "supine-elbow-drive-row"],
        horizontalPush: ["pushup", "countertop-pushup"],
      },
      preferredByRole: {
        verticalPull: ["supine-lat-pulldown-isometric", "prone-lat-sweep"],
        horizontalPull: ["back-widow", "prone-elbow-row"],
        horizontalPush: ["wall-pushup", "countertop-pushup"],
      },
    };
  }

  if (phaseStage === "skill") {
    const preferControlWork = hasBackChestControlFocusForBands(context.selectionContext);
    const bandRowPreferredIds = resolveBackChestBandRowPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    const bandPressPreferredIds = resolveBackChestBandPressPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    return {
      deprioritizedByRole: {
        verticalPull: ["band-lat-pulldown", "band-lat-pulldown-kneeling"],
        horizontalPull: ["band-row"],
        horizontalPush: ["band-chest-press"],
      },
      preferredByRole: {
        verticalPull: [
          "band-lat-pulldown-kneeling",
          "tall-kneeling-band-lat-pulldown",
          "standing-band-lat-pulldown",
          "band-lat-pulldown-neutral-grip",
          "band-lat-pulldown-wide-grip",
          "band-lat-pulldown",
          "band-lat-pulldown-iso-hold",
        ],
        horizontalPull: bandRowPreferredIds,
        horizontalPush: bandPressPreferredIds,
      },
    };
  }

  const preferControlWork = hasBackChestControlFocusForBands(context.selectionContext);
  const bandRowPreferredIds = resolveBackChestBandRowPreferredIds({
    goalType,
    phaseStage,
    preferControlWork,
  });
  const bandPressPreferredIds = resolveBackChestBandPressPreferredIds({
    goalType,
    phaseStage,
    preferControlWork,
  });
  return {
    deprioritizedByRole: {
      verticalPull: ["band-lat-pulldown", "band-lat-pulldown-kneeling"],
      horizontalPull: ["split-stance-row", "band-row"],
      horizontalPush: ["pushup", "band-chest-press"],
    },
    preferredByRole: {
      verticalPull: [
        "standing-band-lat-pulldown",
        "tall-kneeling-band-lat-pulldown",
        "band-lat-pulldown-neutral-grip",
        "band-lat-pulldown-wide-grip",
        "band-lat-pulldown-iso-hold",
        "band-lat-pulldown-kneeling",
        "band-lat-pulldown",
      ],
      horizontalPull: bandRowPreferredIds,
      horizontalPush: bandPressPreferredIds,
    },
  };
};

const forceBackChestAnchorVariationOnRepeat = (params: {
  repairedMainIds: string[];
  mainSlotPlan: Array<{ slotKind: string; lane: MainLane }>;
  previousMainExercises: Exercise[];
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  tierProfile: BackChestTierProfile;
  goalModifier: BackChestGoalModifier;
}): string[] => {
  const {
    repairedMainIds,
    mainSlotPlan,
    previousMainExercises,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier,
  } = params;
  if (daysPerWeek !== 3) return repairedMainIds;

  const currentAnchorByRole = new Map<
    BackChestAnchorRole,
    { slotIndex: number; exercise: Exercise }
  >();
  repairedMainIds.forEach((exerciseId, slotIndex) => {
    const slot = mainSlotPlan[slotIndex];
    if (!slot) return;
    const role = resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane);
    if (!role || currentAnchorByRole.has(role)) return;
    const exercise = exerciseById(exerciseId);
    if (!exercise) return;
    currentAnchorByRole.set(role, { slotIndex, exercise });
  });

  const previousAnchorByRole = new Map<BackChestAnchorRole, Exercise>();
  BACK_CHEST_ANCHOR_VARIATION_PRIORITY.forEach((role) => {
    const previousAnchor = getBackChestAnchorFromMain(previousMainExercises, role);
    if (previousAnchor) {
      previousAnchorByRole.set(role, previousAnchor);
    }
  });

  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const hasPullupBar = availableForBackChest.has("pullup_bar");
  const dumbbellOnlyBackChest =
    availableForBackChest.has("dumbbells") &&
    !availableForBackChest.has("bands") &&
    !availableForBackChest.has("cables") &&
    !availableForBackChest.has("machines") &&
    !hasPullupBar;
  const variedMainIds = [...repairedMainIds];
  const usedMainIds = new Set(variedMainIds);

  const getCurrentAnchor = (role: BackChestAnchorRole) => {
    const current = currentAnchorByRole.get(role);
    if (!current) return null;
    const liveExercise = exerciseById(variedMainIds[current.slotIndex]);
    if (!liveExercise) return null;
    return { slotIndex: current.slotIndex, exercise: liveExercise };
  };

  const isExerciseCurrentlyUsedByAnchor = (exerciseId: string) =>
    BACK_CHEST_ANCHOR_VARIATION_PRIORITY.some((role) => {
      const anchor = getCurrentAnchor(role);
      return Boolean(anchor && anchor.exercise.id === exerciseId);
    });

  const selectReplacement = (params: {
    role: BackChestAnchorRole;
    current: { slotIndex: number; exercise: Exercise };
    preferredIds?: string[];
    preferBandVerticalFamily?: boolean;
    preferSameFamilyVariant?: boolean;
  }) => {
    const {
      role,
      current,
      preferredIds = [],
      preferBandVerticalFamily = false,
      preferSameFamilyVariant = false,
    } = params;
    if (
      role === "verticalPull" &&
      dumbbellOnlyBackChest &&
      current.exercise.id === "dumbbell-pullover"
    ) {
      return null;
    }
    const currentRung = resolveBackChestAnchorRung(role, current.exercise, hasPullupBar);
    const chestStimulusPolicy =
      role === "horizontalPush"
        ? resolveBackChestThreeDayChestStimulusPolicy({
            role,
            daysPerWeek,
            context,
            previousAnchor: previousAnchorByRole.get("horizontalPush") ?? null,
          })
        : null;
    const preferredIndexById = new Map(
      preferredIds.map((id, index) => [id, index] as const)
    );
    const allEligibleAlternatives = getBackChestEligibleAnchorCandidates({
      role,
      context,
      daysPerWeek,
      tierProfile,
      goalModifier,
    })
      .filter((exercise) => exercise.id !== current.exercise.id)
      .filter(
        (exercise) =>
          !usedMainIds.has(exercise.id) || !isExerciseCurrentlyUsedByAnchor(exercise.id)
      );
    const sameRungAlternatives = allEligibleAlternatives.filter(
      (exercise) =>
        resolveBackChestAnchorRung(role, exercise, hasPullupBar) === currentRung
    );
    const selectBandStyleAlternatives = (pool: Exercise[]) => {
      if (role !== "verticalPull" || !preferBandVerticalFamily) {
        return pool;
      }
      const bandStyle = pool.filter(isBackChestBandStyleVerticalPull);
      return bandStyle.length ? bandStyle : pool;
    };
    let alternatives = selectBandStyleAlternatives(sameRungAlternatives);
    if (!alternatives.length) {
      const relaxedRungFloor = toBackChestTier(Math.max(1, currentRung - 1));
      const relaxedRungCeiling = toBackChestTier(
        goalModifier.goalType === "reducePain" || tierProfile.painCapActive
          ? currentRung
          : Math.min(3, currentRung + 1)
      );
      const relaxedAlternatives = allEligibleAlternatives.filter((exercise) => {
        const rung = resolveBackChestAnchorRung(role, exercise, hasPullupBar);
        return rung >= relaxedRungFloor && rung <= relaxedRungCeiling;
      });
      alternatives = selectBandStyleAlternatives(relaxedAlternatives);
    }
    alternatives = alternatives
      .sort((left, right) =>
        {
          const leftPreferred = preferredIndexById.get(left.id);
          const rightPreferred = preferredIndexById.get(right.id);
          if (typeof leftPreferred === "number" || typeof rightPreferred === "number") {
            if (typeof leftPreferred !== "number") return 1;
            if (typeof rightPreferred !== "number") return -1;
            if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred;
          }
          return compareBackChestAnchorCandidates({
            role,
            left,
            right,
            daysPerWeek,
            goalModifier,
            selectionContext: context.selectionContext,
            availableForBackChest,
            deprioritizedExerciseId: current.exercise.id,
            chestStimulusPolicy,
          });
        }
      );
    if (preferSameFamilyVariant) {
      const currentFamilyKey = resolveBackChestExerciseFamilyKey(current.exercise, role);
      const currentVariantKey = resolveBackChestExerciseVariantKey(current.exercise);
      const sameFamilyVariantAlternatives = alternatives.filter((exercise) => {
        const familyKey = resolveBackChestExerciseFamilyKey(exercise, role);
        if (familyKey !== currentFamilyKey) return false;
        return resolveBackChestExerciseVariantKey(exercise) !== currentVariantKey;
      });
      if (sameFamilyVariantAlternatives.length) {
        return sameFamilyVariantAlternatives[0] ?? null;
      }
    }
    return alternatives[0] ?? null;
  };

  const applyReplacement = (params: {
    role: BackChestAnchorRole;
    replacement: Exercise;
  }) => {
    const { role, replacement } = params;
    const current = getCurrentAnchor(role);
    if (!current) return;
    usedMainIds.delete(current.exercise.id);
    usedMainIds.add(replacement.id);
    variedMainIds[current.slotIndex] = replacement.id;
  };

  const trySwapRoleWithPreferredIds = (params: {
    role: BackChestAnchorRole;
    preferredIds: string[];
    preferBandVerticalFamily?: boolean;
    preferSameFamilyVariant?: boolean;
  }) => {
    const {
      role,
      preferredIds,
      preferBandVerticalFamily = false,
      preferSameFamilyVariant = false,
    } = params;
    const current = getCurrentAnchor(role);
    if (!current) return false;
    const replacement = selectReplacement({
      role,
      current,
      preferredIds,
      preferBandVerticalFamily,
      preferSameFamilyVariant,
    });
    if (!replacement) return false;
    applyReplacement({ role, replacement });
    return true;
  };

  const didRoleChangeVsPrevious = (role: BackChestAnchorRole) => {
    const current = getCurrentAnchor(role);
    const previous = previousAnchorByRole.get(role);
    if (!current || !previous) return false;
    return current.exercise.id !== previous.id;
  };

  const enforceBandRowPressRotation = () => {
    if (context.capabilityMode !== "bandOnly") return;
    const phaseStage = context.selectionContext.phaseStage;
    if (phaseStage !== "skill" && phaseStage !== "growth") return;
    const goalType = resolveBackChestGoalType(context.selectionContext.goal);
    const preferControlWork = hasBackChestControlFocusForBands(context.selectionContext);
    const rowPreferredIds = resolveBackChestBandRowPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    const pressPreferredIds = resolveBackChestBandPressPreferredIds({
      goalType,
      phaseStage,
      preferControlWork,
    });
    const verticalPreferredIds =
      phaseStage === "skill"
        ? [
            "band-lat-pulldown-kneeling",
            "tall-kneeling-band-lat-pulldown",
            "standing-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown",
            "band-lat-pulldown-iso-hold",
          ]
        : [
            "standing-band-lat-pulldown",
            "tall-kneeling-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown-iso-hold",
            "band-lat-pulldown-kneeling",
            "band-lat-pulldown",
          ];

    const enforceVerticalBandVariationWhenPossible = () => {
      if (didRoleChangeVsPrevious("verticalPull")) return;
      trySwapRoleWithPreferredIds({
        role: "verticalPull",
        preferredIds: verticalPreferredIds,
        preferBandVerticalFamily: true,
        preferSameFamilyVariant: true,
      });
    };

    const enforceAnyAnchorDifferenceWhenAlternativesExist = () => {
      const changedCount =
        Number(didRoleChangeVsPrevious("horizontalPull")) +
        Number(didRoleChangeVsPrevious("horizontalPush")) +
        Number(didRoleChangeVsPrevious("verticalPull"));
      if (changedCount > 0) return;
      const swappedRow = trySwapRoleWithPreferredIds({
        role: "horizontalPull",
        preferredIds: rowPreferredIds,
        preferSameFamilyVariant: true,
      });
      if (swappedRow) return;
      const swappedPress = trySwapRoleWithPreferredIds({
        role: "horizontalPush",
        preferredIds: pressPreferredIds,
        preferSameFamilyVariant: true,
      });
      if (swappedPress) return;
      trySwapRoleWithPreferredIds({
        role: "verticalPull",
        preferredIds: verticalPreferredIds,
        preferBandVerticalFamily: true,
        preferSameFamilyVariant: true,
      });
    };

    if (phaseStage === "skill") {
      if (!didRoleChangeVsPrevious("horizontalPull")) {
        trySwapRoleWithPreferredIds({
          role: "horizontalPull",
          preferredIds: rowPreferredIds,
          preferSameFamilyVariant: true,
        });
      }
      if (!didRoleChangeVsPrevious("horizontalPush")) {
        trySwapRoleWithPreferredIds({
          role: "horizontalPush",
          preferredIds: pressPreferredIds,
          preferSameFamilyVariant: true,
        });
      }
      enforceVerticalBandVariationWhenPossible();
      enforceAnyAnchorDifferenceWhenAlternativesExist();
      return;
    }

    if (!didRoleChangeVsPrevious("horizontalPull")) {
      trySwapRoleWithPreferredIds({
        role: "horizontalPull",
        preferredIds: rowPreferredIds,
        preferSameFamilyVariant: true,
      });
    }
    if (!didRoleChangeVsPrevious("horizontalPush")) {
      trySwapRoleWithPreferredIds({
        role: "horizontalPush",
        preferredIds: pressPreferredIds,
        preferSameFamilyVariant: true,
      });
    }

    const currentRow = getCurrentAnchor("horizontalPull");
    if (
      currentRow &&
      !isBackChestBandUnilateralOrIsoRow(currentRow.exercise) &&
      rowPreferredIds.some(
        (candidateId) =>
          BACK_CHEST_BAND_UNILATERAL_OR_ISO_ROW_IDS.has(candidateId) &&
          candidateId !== currentRow.exercise.id
      )
    ) {
      trySwapRoleWithPreferredIds({
        role: "horizontalPull",
        preferredIds: rowPreferredIds,
        preferSameFamilyVariant: true,
      });
    }

    enforceVerticalBandVariationWhenPossible();
    enforceAnyAnchorDifferenceWhenAlternativesExist();
  };

  const enforceRoleLevelNonStaticAcrossPhases = () => {
    const phaseStage = context.selectionContext.phaseStage;
    if (phaseStage !== "skill" && phaseStage !== "growth") return;
    const goalType = resolveBackChestGoalType(context.selectionContext.goal);
    const preferControlWork = hasBackChestControlFocusForBands(context.selectionContext);
    const bandRowPreferredIds =
      context.capabilityMode === "bandOnly"
        ? resolveBackChestBandRowPreferredIds({
            goalType,
            phaseStage,
            preferControlWork,
          })
        : [];
    const bandPressPreferredIds =
      context.capabilityMode === "bandOnly"
        ? resolveBackChestBandPressPreferredIds({
            goalType,
            phaseStage,
            preferControlWork,
          })
        : [];
    const bandVerticalPreferredIds =
      phaseStage === "skill"
        ? [
            "band-lat-pulldown-kneeling",
            "tall-kneeling-band-lat-pulldown",
            "standing-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown",
            "band-lat-pulldown-iso-hold",
          ]
        : [
            "standing-band-lat-pulldown",
            "tall-kneeling-band-lat-pulldown",
            "band-lat-pulldown-neutral-grip",
            "band-lat-pulldown-wide-grip",
            "band-lat-pulldown-iso-hold",
            "band-lat-pulldown-kneeling",
            "band-lat-pulldown",
          ];
    const roleOrder: BackChestAnchorRole[] = [
      "horizontalPull",
      "horizontalPush",
      "verticalPull",
    ];
    roleOrder.forEach((role) => {
      if (didRoleChangeVsPrevious(role)) return;
      const preferBandVerticalFamily = role === "verticalPull" && context.available.has("bands");
      const preferredIds =
        role === "horizontalPull"
          ? bandRowPreferredIds
          : role === "horizontalPush"
          ? bandPressPreferredIds
          : role === "verticalPull" && preferBandVerticalFamily
          ? bandVerticalPreferredIds
          : [];
      trySwapRoleWithPreferredIds({
        role,
        preferredIds,
        preferBandVerticalFamily,
        preferSameFamilyVariant: true,
      });
    });
  };

  if (previousMainExercises.length) {
    const hasAllAnchors =
      BACK_CHEST_ANCHOR_VARIATION_PRIORITY.every((role) => currentAnchorByRole.has(role)) &&
      BACK_CHEST_ANCHOR_VARIATION_PRIORITY.every((role) => previousAnchorByRole.has(role));
    if (!hasAllAnchors) {
      return repairedMainIds;
    }

    const progressiveTarget = resolveBackChestProgressiveVariationTarget({
      context,
      daysPerWeek,
    });
    const anchorTripletRepeated =
      countBackChestAnchorDifferencesFromPrevious({
        previousAnchorByRole,
        getCurrentAnchor,
      }) === 0;
    const shouldEnforceRoleLevelNonStatic =
      context.selectionContext.phaseStage === "skill" ||
      context.selectionContext.phaseStage === "growth";
    if (!progressiveTarget && !anchorTripletRepeated && !shouldEnforceRoleLevelNonStatic) {
      return repairedMainIds;
    }
    if (!progressiveTarget && !anchorTripletRepeated && shouldEnforceRoleLevelNonStatic) {
      enforceBandRowPressRotation();
      enforceRoleLevelNonStaticAcrossPhases();
      return variedMainIds;
    }

    const targetDifferences = Math.max(
      anchorTripletRepeated ? 1 : 0,
      progressiveTarget?.minDifferencesFromPrevious ?? 0
    );
    const rolePriority = progressiveTarget?.rolePriority ?? BACK_CHEST_ANCHOR_VARIATION_PRIORITY;
    const preferredByRole = progressiveTarget?.preferredByRole ?? {};
    const preferBandVerticalFamily = Boolean(progressiveTarget?.preferBandVerticalFamily);

    const hasBandVerticalIntegrityGap = () => {
      if (!preferBandVerticalFamily) return false;
      const currentVertical = getCurrentAnchor("verticalPull");
      if (!currentVertical) return false;
      if (isBackChestBandStyleVerticalPull(currentVertical.exercise)) return false;
      const replacement = selectReplacement({
        role: "verticalPull",
        current: currentVertical,
        preferredIds: preferredByRole.verticalPull ?? [],
        preferBandVerticalFamily: true,
        preferSameFamilyVariant: context.capabilityMode === "bandOnly",
      });
      return Boolean(replacement);
    };

    for (const role of rolePriority) {
      const current = getCurrentAnchor(role);
      const previous = previousAnchorByRole.get(role);
      if (!current || !previous) continue;

      const currentDifferences = countBackChestAnchorDifferencesFromPrevious({
        previousAnchorByRole,
        getCurrentAnchor,
      });
      const needDifferenceCoverage = currentDifferences < targetDifferences;
      const needBandVerticalRepair = role === "verticalPull" && hasBandVerticalIntegrityGap();

      if (!needDifferenceCoverage && !needBandVerticalRepair) continue;
      if (needDifferenceCoverage && current.exercise.id !== previous.id && !needBandVerticalRepair) {
        continue;
      }

      const replacement = selectReplacement({
        role,
        current,
        preferredIds: preferredByRole[role] ?? [],
        preferBandVerticalFamily,
        preferSameFamilyVariant: context.capabilityMode === "bandOnly",
      });
      if (!replacement) continue;
      applyReplacement({ role, replacement });
    }

    enforceBandRowPressRotation();
    enforceRoleLevelNonStaticAcrossPhases();

    return variedMainIds;
  }

  if (!BACK_CHEST_ANCHOR_VARIATION_PRIORITY.every((role) => currentAnchorByRole.has(role))) {
    return repairedMainIds;
  }

  const standalonePreset = resolveBackChestStandaloneVariationPreset({
    context,
    daysPerWeek,
  });
  if (!standalonePreset) {
    return repairedMainIds;
  }

  for (const role of BACK_CHEST_ANCHOR_VARIATION_PRIORITY) {
    const current = getCurrentAnchor(role);
    if (!current) continue;
    const deprioritized = standalonePreset.deprioritizedByRole[role] ?? [];
    if (deprioritized.length && !deprioritized.includes(current.exercise.id)) continue;
    const replacement = selectReplacement({
      role,
      current,
      preferredIds: standalonePreset.preferredByRole[role] ?? [],
      preferBandVerticalFamily: context.capabilityMode === "bandOnly",
      preferSameFamilyVariant: context.capabilityMode === "bandOnly",
    });
    if (!replacement) continue;
    applyReplacement({ role, replacement });
    return variedMainIds;
  }

  return repairedMainIds;
};

const enforceBackChestThreeDayBeginnerChestStimulusMain = (params: {
  mainIds: string[];
  mainSlotPlan: Array<{ slotKind: string; lane: MainLane }>;
  previousMainExercises: Exercise[];
  context: DayConstraintRepairContext;
  daysPerWeek: 3 | 4 | 5;
  tierProfile: BackChestTierProfile;
  goalModifier: BackChestGoalModifier;
}): string[] => {
  const {
    mainIds,
    mainSlotPlan,
    previousMainExercises,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier,
  } = params;
  if (daysPerWeek !== 3) return mainIds;
  if (context.selectionContext.experienceLevel !== "beginner") return mainIds;

  const pushSlotIndex = mainSlotPlan.findIndex(
    (slot) =>
      resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane) ===
      "horizontalPush"
  );
  if (pushSlotIndex < 0) return mainIds;

  const currentPushId = mainIds[pushSlotIndex];
  const currentPushExercise = currentPushId ? exerciseById(currentPushId) : null;
  if (!currentPushExercise) return mainIds;

  const previousPushAnchor = getBackChestAnchorFromMain(
    previousMainExercises,
    "horizontalPush"
  );
  const chestStimulusPolicy = resolveBackChestThreeDayChestStimulusPolicy({
    role: "horizontalPush",
    daysPerWeek,
    context,
    previousAnchor: previousPushAnchor,
  });
  if (!chestStimulusPolicy) return mainIds;

  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const usedWithoutPush = new Set(mainIds);
  usedWithoutPush.delete(currentPushExercise.id);

  const candidates = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => !usedWithoutPush.has(exercise.id))
    .filter((exercise) => matchesBackChestAnchorRole(exercise, "horizontalPush"))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      })
    )
    .filter((exercise) =>
      isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: true,
      })
    )
    .filter(
      (exercise) =>
        !isIsolationExercise(exercise) || isBackChestFlyPatternExercise(exercise)
    )
    .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
    .filter((exercise) =>
      isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
    )
    .filter((exercise) =>
      isBackChestFloorPressAllowed(exercise, context, tierProfile)
    )
    .filter((exercise) =>
      isBackChestAnchorTierAllowed({
        exercise,
        role: "horizontalPush",
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
      })
    )
    .filter((exercise) => {
      const family = resolveBackChestChestStimulusFamily(exercise);
      return family === "press" || family === "fly";
    });

  if (!candidates.length) return mainIds;

  const pressCandidates = candidates.filter(
    (exercise) => resolveBackChestChestStimulusFamily(exercise) === "press"
  );
  const flyCandidates = candidates.filter(
    (exercise) => resolveBackChestChestStimulusFamily(exercise) === "fly"
  );

  let requiredFamily: BackChestChestStimulusFamily | null = null;
  if (chestStimulusPolicy.preferPressFamily && pressCandidates.length) {
    requiredFamily = "press";
  } else if (
    chestStimulusPolicy.preferComplementaryFamily &&
    chestStimulusPolicy.priorFamily
  ) {
    const complementaryFamily =
      chestStimulusPolicy.priorFamily === "fly" ? "press" : "fly";
    const complementaryCandidates =
      complementaryFamily === "press" ? pressCandidates : flyCandidates;
    if (complementaryCandidates.length) {
      requiredFamily = complementaryFamily;
    }
  }

  if (
    !requiredFamily &&
    chestStimulusPolicy.applyRepeatPenalty &&
    chestStimulusPolicy.priorFamily
  ) {
    const complementaryFamily =
      chestStimulusPolicy.priorFamily === "fly" ? "press" : "fly";
    const complementaryCandidates =
      complementaryFamily === "press" ? pressCandidates : flyCandidates;
    if (complementaryCandidates.length) {
      requiredFamily = complementaryFamily;
    }
  }

  if (!requiredFamily) return mainIds;

  const currentFamily = resolveBackChestChestStimulusFamily(currentPushExercise);
  if (currentFamily === requiredFamily) return mainIds;

  const candidatePool = candidates.filter(
    (exercise) => resolveBackChestChestStimulusFamily(exercise) === requiredFamily
  );
  if (!candidatePool.length) return mainIds;

  const replacement =
    [...candidatePool].sort((left, right) => {
      const comparison = compareBackChestAnchorCandidates({
        role: "horizontalPush",
        left,
        right,
        daysPerWeek,
        goalModifier,
        selectionContext: context.selectionContext,
        availableForBackChest,
        deprioritizedExerciseId: currentPushExercise.id,
        chestStimulusPolicy,
      });
      if (comparison !== 0) return comparison;
      return left.id.localeCompare(right.id);
    })[0] ?? null;
  if (!replacement || replacement.id === currentPushExercise.id) return mainIds;

  const nextIds = [...mainIds];
  nextIds[pushSlotIndex] = replacement.id;
  return nextIds;
};

const repairBackChestMainIntelligence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { day: ProgramDay; warning?: string } => {
  const { day, daysPerWeek, context } = params;
  if (!isBackChestDayTitle(day.title)) return { day };

  const mainEntries = day.routine
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.section === "main");
  if (!mainEntries.length) {
    return {
      day,
      warning: "Back + Chest main repair skipped because no MAIN entries were found.",
    };
  }

  const tierProfile = resolveBackChestTierProfile(context);
  const goalModifier = resolveBackChestGoalModifier({ context, daysPerWeek });
  const availableForBackChest = resolveBackChestMainAvailableSet(context.available);
  const mainSlotPlan = getBackChestMainSlotPlan({
    mainCount: mainEntries.length,
    selectionContext: context.selectionContext,
    daysPerWeek,
    available: availableForBackChest,
  });
  const previousBackChestDay = getBackChestDayFromWeek(context.previousWeek);
  const previousMainExercises = previousBackChestDay
    ? previousBackChestDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    : [];
  const usedIds = new Set<string>();
  const repairedMainIds = mainSlotPlan.map((slot, slotIndex) => {
    const anchorRoleForSlot = resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane);
    const intermediateFlyExpansionSlot = isBackChestIntermediateFlyExpansionSlotByIndex({
      slot,
      slotIndex,
      context,
      daysPerWeek,
    });
    const flyAnchorSlot = slot.slotKind === "mainPushFly";
    const slotAllowsChestFly = flyAnchorSlot || intermediateFlyExpansionSlot;
    const slotPrefersFly = flyAnchorSlot || intermediateFlyExpansionSlot;
    const shouldPreferDumbbellPulloverVerticalAnchor =
      slot.slotKind === "mainPullVertical" &&
      context.available.has("dumbbells") &&
      !context.available.has("bands") &&
      !context.available.has("cables");
    if (shouldPreferDumbbellPulloverVerticalAnchor) {
      // MAIN anchor selection can promote dumbbell pullover over a pre-filled accessory slot.
      // Accessory repair runs after this and will avoid duplicating MAIN IDs.
      usedIds.delete("dumbbell-pullover");
    }
    let selectedExercise: Exercise | null = null;
    if (slot.slotKind === "mainPullHorizontal") {
      selectedExercise = selectBackChestAnchorExercise({
        role: "horizontalPull",
        usedIds,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
        previousAnchor: getBackChestAnchorFromMain(previousMainExercises, "horizontalPull"),
      });
    } else if (slot.slotKind === "mainPullVertical") {
      selectedExercise = selectBackChestAnchorExercise({
        role: "verticalPull",
        usedIds,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
        previousAnchor: getBackChestAnchorFromMain(previousMainExercises, "verticalPull"),
      });
    } else if (slot.lane === "push") {
      selectedExercise = selectBackChestAnchorExercise({
        role: "horizontalPush",
        usedIds,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
        previousAnchor: getBackChestAnchorFromMain(previousMainExercises, "horizontalPush"),
        allowChestIsolation: slotAllowsChestFly,
        preferFlyPattern: slotPrefersFly,
      });
    } else if (slot.slotKind === "mainPullSupport") {
      selectedExercise = selectBackChestSupportPullExercise({
        usedIds,
        context,
        tierProfile,
      });
    } else if (slot.lane === "verticalPush") {
      selectedExercise = selectBackChestVerticalPushExercise({
        usedIds,
        context,
        tierProfile,
      });
    }

    if (!selectedExercise && slot.slotKind === "mainPullVertical") {
      selectedExercise = pickFirstBackChestCandidateByIds({
        candidateIds: get3DayBackChestVerticalFallbackIds(),
        section: "main",
        usedIds,
        context,
        tierCeiling: tierProfile.tierCeiling,
        allowBodyweightFallback: true,
        predicate: (exercise) =>
          !isBackChestScapularAccessoryPullExercise(exercise) &&
          (hasVerticalPullSignature(exercise) ||
            exercise.id === "supine-elbow-drive-row" ||
            exercise.id === "prone-elbow-row"),
      });
    }

    if (!selectedExercise) {
      const fallbackCurrentId = mainEntries[slotIndex]?.item.exerciseId;
      const fallbackCurrent = fallbackCurrentId ? exerciseById(fallbackCurrentId) : null;
      const fallbackCurrentEligible =
        Boolean(fallbackCurrent) &&
        !usedIds.has(fallbackCurrent!.id) &&
        isBackChestMainBoundaryEligible({
          exercise: fallbackCurrent!,
          allowChestFly: slotAllowsChestFly,
        }) &&
        (!isIsolationExercise(fallbackCurrent!) ||
          (slotAllowsChestFly &&
            isBackChestFlyPatternExercise(fallbackCurrent!))) &&
        !isBackChestScapularAccessoryPullExercise(fallbackCurrent!) &&
        isBackChestExperienceEligible(
          fallbackCurrent!,
          context.selectionContext.experienceLevel
        ) &&
        (anchorRoleForSlot
          ? isBackChestAnchorTierAllowed({
              exercise: fallbackCurrent!,
              role: anchorRoleForSlot,
              context,
              daysPerWeek,
              tierProfile,
              goalModifier,
            })
          : resolveBackChestEquipmentTier(fallbackCurrent!) <= tierProfile.tierCeiling) &&
        matchesBackChestMainSlotKind({
          exercise: fallbackCurrent!,
          slotKind: slot.slotKind,
          slotLane: slot.lane,
        }) &&
        isExerciseEligibleForProgramContext({
          exercise: fallbackCurrent!,
          available: availableForBackChest,
          section: "main",
          context: context.selectionContext,
        }) &&
        (slot.lane !== "push" ||
          isBackChestFloorPressAllowed(fallbackCurrent!, context, tierProfile));
      if (fallbackCurrentEligible) {
        selectedExercise = fallbackCurrent!;
      }
    }

    if (!selectedExercise) {
      selectedExercise =
        exercises
          .filter((exercise) => exercise.category === "main")
          .filter((exercise) => !usedIds.has(exercise.id))
          .filter((exercise) =>
            isExerciseEligibleForProgramContext({
              exercise,
              available: availableForBackChest,
              section: "main",
              context: context.selectionContext,
            })
          )
          .filter((exercise) =>
            matchesBackChestMainSlotKind({
              exercise,
              slotKind: slot.slotKind,
              slotLane: slot.lane,
            })
          )
          .filter((exercise) =>
            isBackChestMainBoundaryEligible({
              exercise,
              allowChestFly: slotAllowsChestFly,
            })
          )
          .filter(
            (exercise) =>
              !isIsolationExercise(exercise) ||
              (slotAllowsChestFly && isBackChestFlyPatternExercise(exercise))
          )
          .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
          .filter((exercise) =>
            isBackChestExperienceEligible(
              exercise,
              context.selectionContext.experienceLevel
            )
          )
          .filter((exercise) =>
            anchorRoleForSlot
              ? isBackChestAnchorTierAllowed({
                  exercise,
                  role: anchorRoleForSlot,
                  context,
                  daysPerWeek,
                  tierProfile,
                  goalModifier,
                })
              : resolveBackChestEquipmentTier(exercise) <= tierProfile.tierCeiling
          )
          .filter((exercise) =>
            slot.lane === "push"
              ? isBackChestFloorPressAllowed(exercise, context, tierProfile)
              : true
          )
          .sort((left, right) => left.id.localeCompare(right.id))[0] ?? null;
    }

    let selectedId =
      selectedExercise?.id ?? mainEntries[slotIndex]?.item.exerciseId ?? "machine-seated-row";
    const selectedFallbackExercise = exerciseById(selectedId);
      const selectedFallbackViolatesSlotPattern =
      Boolean(selectedFallbackExercise) &&
      !matchesBackChestMainSlotKind({
        exercise: selectedFallbackExercise!,
        slotKind: slot.slotKind,
        slotLane: slot.lane,
      });
    const selectedFallbackViolatesBoundary =
      Boolean(selectedFallbackExercise) &&
      !isBackChestMainBoundaryEligible({
        exercise: selectedFallbackExercise!,
        allowChestFly: slotAllowsChestFly,
      });
    const selectedFallbackViolatesTierCap =
      Boolean(selectedFallbackExercise) &&
      Boolean(anchorRoleForSlot) &&
      !isBackChestAnchorTierAllowed({
        exercise: selectedFallbackExercise!,
        role: anchorRoleForSlot!,
        context,
        daysPerWeek,
        tierProfile,
        goalModifier,
      });
    const selectedFallbackIneligibleForContext =
      Boolean(selectedFallbackExercise) &&
      !isExerciseEligibleForProgramContext({
        exercise: selectedFallbackExercise!,
        available: availableForBackChest,
        section: "main",
        context: context.selectionContext,
      });
    const selectedFallbackFailsExperience =
      Boolean(selectedFallbackExercise) &&
      !isBackChestExperienceEligible(
        selectedFallbackExercise!,
        context.selectionContext.experienceLevel
      );
    const selectedFallbackViolatesFloorPressRule =
      Boolean(selectedFallbackExercise) &&
      slot.lane === "push" &&
      !isBackChestFloorPressAllowed(selectedFallbackExercise!, context, tierProfile);
    if (
      selectedFallbackExercise &&
      (isBackChestScapularAccessoryPullExercise(selectedFallbackExercise) ||
        selectedFallbackViolatesBoundary ||
        selectedFallbackViolatesTierCap ||
        selectedFallbackViolatesSlotPattern ||
        selectedFallbackIneligibleForContext ||
        selectedFallbackFailsExperience ||
        selectedFallbackViolatesFloorPressRule)
    ) {
      const structuralFallback =
        exercises
          .filter((exercise) => exercise.category === "main")
          .filter((exercise) => !usedIds.has(exercise.id))
          .filter((exercise) =>
            isExerciseEligibleForProgramContext({
              exercise,
              available: availableForBackChest,
              section: "main",
              context: context.selectionContext,
            })
          )
          .filter((exercise) =>
            matchesBackChestMainSlotKind({
              exercise,
              slotKind: slot.slotKind,
              slotLane: slot.lane,
            })
          )
          .filter((exercise) =>
            isBackChestMainBoundaryEligible({
              exercise,
              allowChestFly: slotAllowsChestFly,
            })
          )
          .filter(
            (exercise) =>
              !isIsolationExercise(exercise) ||
              (slotAllowsChestFly && isBackChestFlyPatternExercise(exercise))
          )
          .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
          .filter((exercise) =>
            isBackChestExperienceEligible(
              exercise,
              context.selectionContext.experienceLevel
            )
          )
          .filter((exercise) =>
            anchorRoleForSlot
              ? isBackChestAnchorTierAllowed({
                  exercise,
                  role: anchorRoleForSlot,
                  context,
                  daysPerWeek,
                  tierProfile,
                  goalModifier,
                })
              : resolveBackChestEquipmentTier(exercise) <= tierProfile.tierCeiling
          )
          .sort((left, right) => left.id.localeCompare(right.id))[0] ?? null;
      if (structuralFallback) {
        selectedId = structuralFallback.id;
      }
    }
    usedIds.add(selectedId);
    return selectedId;
  });

  const repairedMainIdsWithVariation = forceBackChestAnchorVariationOnRepeat({
    repairedMainIds,
    mainSlotPlan,
    previousMainExercises,
    context,
    daysPerWeek,
    tierProfile,
    goalModifier,
  });
  const repairedMainIdsWithChestStimulusPolicy =
    enforceBackChestThreeDayBeginnerChestStimulusMain({
      mainIds: repairedMainIdsWithVariation,
      mainSlotPlan,
      previousMainExercises,
      context,
      daysPerWeek,
      tierProfile,
      goalModifier,
    });
  const repairedMainIdsWithExtraSlotRules = (() => {
    if (daysPerWeek !== 3 || repairedMainIdsWithChestStimulusPolicy.length <= 4) {
      return repairedMainIdsWithChestStimulusPolicy;
    }
    const nextIds = [...repairedMainIdsWithChestStimulusPolicy];
    const extraSlotIndexes = Array.from({ length: nextIds.length }, (_, index) => index).filter(
      (index) => index >= 4
    );
    if (!extraSlotIndexes.length) return nextIds;

    const isIntermediate = context.selectionContext.experienceLevel === "intermediate";
    const isAdvanced = context.selectionContext.experienceLevel === "advanced";
    const isPhaseOne = context.selectionContext.phaseStage === "activation";
    const phaseTwoGymFlyWindowOpen =
      context.selectionContext.phaseStage === "skill" &&
      goalModifier.chestFlyAllowed &&
      (context.available.has("machines") ||
        context.available.has("cables") ||
        context.available.has("dumbbells"));
    const allowSecondaryChestFly =
      goalModifier.chestFlyAllowed &&
      (context.available.has("machines") ||
        context.available.has("cables") ||
        context.available.has("dumbbells"));

    const selectedExerciseIdCounts = new Map<string, number>();
    const selectedStimulusKeyCounts = new Map<string, number>();
    const selectedFamilyToExercises = new Map<string, Exercise[]>();
    const categoryCounts: Record<
      Exclude<BackChestMainStimulusCategory, "other">,
      number
    > = {
      row: 0,
      press: 0,
      vertical: 0,
      fly: 0,
      latAccent: 0,
    };

    const resolveAnchorCategoryForIndex = (slotIndex: number) => {
      const slot = mainSlotPlan[slotIndex];
      if (slot?.slotKind === "mainPushFly") return "fly" as const;
      const role = slot ? resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane) : null;
      if (role === "horizontalPull") return "row" as const;
      if (role === "verticalPull") return "vertical" as const;
      if (role === "horizontalPush") return "press" as const;
      return null;
    };

    const resolveSecondaryCategoryForExercise = (exercise: Exercise) => {
      const resolvedCategory = resolveBackChestMainStimulusCategory(exercise);
      if (resolvedCategory === "other") return null;
      if (resolvedCategory === "vertical") return "vertical" as const;
      if (resolvedCategory === "fly") return "fly" as const;
      if (resolvedCategory === "latAccent") return "latAccent" as const;
      if (resolvedCategory === "row") return "row" as const;
      if (resolvedCategory === "press") return "press" as const;
      return null;
    };

    const addSelectedExercise = (params: {
      exercise: Exercise;
      category: Exclude<BackChestMainStimulusCategory, "other">;
    }) => {
      const { exercise, category } = params;
      selectedExerciseIdCounts.set(
        exercise.id,
        (selectedExerciseIdCounts.get(exercise.id) ?? 0) + 1
      );
      categoryCounts[category] += 1;
      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      selectedStimulusKeyCounts.set(
        stimulusKey,
        (selectedStimulusKeyCounts.get(stimulusKey) ?? 0) + 1
      );
      const familyKey = resolveBackChestExerciseFamilyKey(exercise);
      const existingFamilyExercises = selectedFamilyToExercises.get(familyKey) ?? [];
      existingFamilyExercises.push(exercise);
      selectedFamilyToExercises.set(familyKey, existingFamilyExercises);
    };

    const removeSelectedExercise = (params: {
      exercise: Exercise;
      category: Exclude<BackChestMainStimulusCategory, "other">;
    }) => {
      const { exercise, category } = params;
      const currentExerciseIdCount = selectedExerciseIdCounts.get(exercise.id) ?? 0;
      if (currentExerciseIdCount <= 1) {
        selectedExerciseIdCounts.delete(exercise.id);
      } else {
        selectedExerciseIdCounts.set(exercise.id, currentExerciseIdCount - 1);
      }
      categoryCounts[category] = Math.max(0, categoryCounts[category] - 1);
      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      const currentStimulusCount = selectedStimulusKeyCounts.get(stimulusKey) ?? 0;
      if (currentStimulusCount <= 1) {
        selectedStimulusKeyCounts.delete(stimulusKey);
      } else {
        selectedStimulusKeyCounts.set(stimulusKey, currentStimulusCount - 1);
      }
      const familyKey = resolveBackChestExerciseFamilyKey(exercise);
      const existingFamily = selectedFamilyToExercises.get(familyKey) ?? [];
      const removeIndex = existingFamily.findIndex((entry) => entry.id === exercise.id);
      const updatedFamily =
        removeIndex >= 0
          ? [
              ...existingFamily.slice(0, removeIndex),
              ...existingFamily.slice(removeIndex + 1),
            ]
          : existingFamily;
      if (updatedFamily.length) {
        selectedFamilyToExercises.set(familyKey, updatedFamily);
      } else {
        selectedFamilyToExercises.delete(familyKey);
      }
    };

    // Anchors are fixed; extra-slot governor only controls slot 5+.
    for (let slotIndex = 0; slotIndex < Math.min(4, nextIds.length); slotIndex += 1) {
      const exercise = exerciseById(nextIds[slotIndex]);
      if (!exercise) continue;
      const category = resolveAnchorCategoryForIndex(slotIndex);
      if (!category) continue;
      addSelectedExercise({ exercise, category });
    }

    const resolveSelectedChestFamily = (): BackChestChestStimulusFamily | null => {
      let pressCount = 0;
      let flyCount = 0;
      selectedExerciseIdCounts.forEach((count, exerciseId) => {
        if (count <= 0) return;
        const selected = exerciseById(exerciseId);
        if (!selected) return;
        const family = resolveBackChestChestStimulusFamily(selected);
        if (family === "press") pressCount += 1;
        if (family === "fly") flyCount += 1;
      });
      if (pressCount > 0 && flyCount === 0) return "press";
      if (flyCount > 0 && pressCount === 0) return "fly";
      return null;
    };

    const secondaryScores = (params: {
      exercise: Exercise;
      category: Exclude<BackChestMainStimulusCategory, "other">;
      slot: { lane: MainLane; slotKind?: string };
      slotIndex: number;
    }) => {
      const { exercise, category, slot, slotIndex } = params;
      const variantKey = resolveBackChestExerciseVariantKey(exercise);
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
      const focusTags = context.selectionContext.poseFocusTags;
      const hasControlFocus =
        hasBackChestControlFocusForBands(context.selectionContext) ||
        focusTags.has("scapular_control") ||
        focusTags.has("scap_control") ||
        focusTags.has("external_rotation");

      let score = 0;
      if (goalModifier.goalType === "improvePosture") {
        if (category === "row" || category === "latAccent") score += 5;
        if (variantKey === "neutral_grip") score += 3;
        if (
          variantKey === "split_stance" ||
          variantKey === "kneeling" ||
          variantKey === "tall_kneeling" ||
          variantKey === "iso_hold"
        ) {
          score += 2;
        }
        if (category === "press" && !isBackChestFlyPatternExercise(exercise)) score -= 2;
      } else if (goalModifier.goalType === "athleticPerformance") {
        if (variantKey === "split_stance" || variantKey === "single_arm") score += 3;
        if (variantKey === "standing") score += 2;
      } else if (goalModifier.goalType === "generalFitness") {
        if (variantKey === "bilateral") score += 2;
        if (variantKey === "split_stance") score += 2;
      } else if (goalModifier.goalType === "reducePain") {
        if (variantKey === "single_arm" || variantKey === "iso_hold") {
          score += hasControlFocus ? 1 : -2;
        }
        if (
          variantKey === "bilateral" ||
          variantKey === "seated" ||
          variantKey === "kneeling" ||
          variantKey === "tall_kneeling"
        ) {
          score += 3;
        }
        if (category === "fly") score -= 8;
      }
      if (hasControlFocus && (category === "row" || category === "latAccent")) {
        if (
          variantKey === "single_arm" ||
          variantKey === "split_stance" ||
          variantKey === "iso_hold" ||
          variantKey === "kneeling" ||
          variantKey === "tall_kneeling"
        ) {
          score += 2;
        }
      }
      if (isPhaseOne) {
        if (category === "press") score -= 3;
        if (category === "row" || category === "fly") score += 1;
      }
      if (descriptor.includes("face-pull") || descriptor.includes("rear-delt")) score -= 4;
      if (tags.has("scap") || tags.has("scapular") || tags.has("reardelt")) score -= 2;
      const gymLikeIntermediatePlusContext =
        context.selectionContext.experienceLevel !== "beginner" &&
        hasGymLikeUpperImplementAvailability(context.available);
      const isPushPairingSlot =
        slot.lane === "push" &&
        (slot.slotKind === "mainPushFly" ||
          isBackChestIntermediateFlyExpansionSlotByIndex({
            slot,
            slotIndex,
            context,
            daysPerWeek,
          }));
      if (gymLikeIntermediatePlusContext && isPushPairingSlot) {
        const selectedFamily = resolveSelectedChestFamily();
        const candidateFamily = resolveBackChestChestStimulusFamily(exercise);
        if (selectedFamily && candidateFamily) {
          if (candidateFamily === selectedFamily) {
            score -= 10;
          } else {
            score += 11;
          }
        }
      }
      return score;
    };

    const isSecondaryCandidateEligible = (params: {
      exercise: Exercise;
      category: Exclude<BackChestMainStimulusCategory, "other">;
      allowChestFly: boolean;
      strictStimulus: boolean;
      slotIndex: number;
      slotKind?: string;
      slotLane?: MainLane;
    }) => {
      const {
        exercise,
        category,
        allowChestFly,
        strictStimulus,
        slotIndex,
        slotKind,
        slotLane,
      } = params;
      if ((selectedExerciseIdCounts.get(exercise.id) ?? 0) > 0) return false;
      if (
        !isBackChestMainBoundaryEligible({
          exercise,
          allowChestFly: allowChestFly && category === "fly",
        })
      ) {
        return false;
      }
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: availableForBackChest,
          section: "main",
          context: context.selectionContext,
        })
      ) {
        return false;
      }
      if (isBackChestScapularAccessoryPullExercise(exercise)) return false;
      if (
        slotKind &&
        !matchesBackChestMainSlotKind({
          exercise,
          slotKind,
          slotLane,
        })
      ) {
        return false;
      }
      if (
        !isBackChestExperienceEligible(
          exercise,
          context.selectionContext.experienceLevel
        )
      ) {
        return false;
      }
      if (resolveBackChestEquipmentTier(exercise) > tierProfile.tierCeiling) return false;
      if (!isBackChestFloorPressAllowed(exercise, context, tierProfile)) return false;
      const allowVerticalSecondary =
        context.selectionContext.experienceLevel === "advanced" && slotIndex >= 4;
      if (category === "vertical" && !allowVerticalSecondary) return false;
      if (category === "fly" && !allowChestFly) return false;
      if (categoryCounts[category] >= BACK_CHEST_SECONDARY_CATEGORY_CAPS[category]) {
        return false;
      }
      if (
        isIsolationExercise(exercise) &&
        (category !== "fly" || !allowChestFly || !isBackChestFlyPatternExercise(exercise))
      ) {
        return false;
      }
      if (
        shouldGateBackChestGymLikeMainCandidate({
          exercise,
          allowChestFly: allowChestFly && category === "fly",
          slotKind,
          slotLane,
          available: availableForBackChest,
          context: context.selectionContext,
        })
      ) {
        return false;
      }
      if (!strictStimulus) return true;

      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      if ((selectedStimulusKeyCounts.get(stimulusKey) ?? 0) > 0) return false;
      const familyKey = resolveBackChestExerciseFamilyKey(exercise);
      const existingFamily = selectedFamilyToExercises.get(familyKey) ?? [];
      if (!existingFamily.length) return true;
      return existingFamily.every((reference) =>
        isBackChestMeaningfulSameFamilyStimulusDelta(exercise, reference)
      );
    };

    const resolveSecondaryCategoryPriority = (params: {
      slotIndex: number;
      firstExtraCategory: Exclude<BackChestMainStimulusCategory, "other"> | null;
      rowOptionCount: number;
      pressOptionCount: number;
    }) => {
      const { slotIndex, firstExtraCategory } = params;
      const defaultPriority: Exclude<BackChestMainStimulusCategory, "other">[] = [
        "row",
        "vertical",
        "press",
        "fly",
        "latAccent",
      ];
      if (isIntermediate && slotIndex >= 4) {
        if (phaseTwoGymFlyWindowOpen) {
          return ["fly", "row", "vertical", "press", "latAccent"];
        }
        return isPhaseOne
          ? ["row", "vertical", "fly", "press", "latAccent"]
          : defaultPriority;
      }
      if (isAdvanced && slotIndex === extraSlotIndexes[0]) {
        // Advanced Day 1 extra slot should prioritize lat-accent pullover before row/vertical stacking.
        return ["latAccent", "row", "vertical", "press", "fly"];
      }
      if (isAdvanced && firstExtraCategory) {
        if (firstExtraCategory === "row") return ["latAccent", "vertical", "press", "fly", "row"];
        if (firstExtraCategory === "vertical") {
          return ["latAccent", "row", "press", "fly", "vertical"];
        }
        if (firstExtraCategory === "press") {
          return ["latAccent", "row", "vertical", "fly", "press"];
        }
        if (firstExtraCategory === "fly") return ["latAccent", "row", "vertical", "press", "fly"];
        if (firstExtraCategory === "latAccent") {
          return ["row", "vertical", "press", "fly", "latAccent"];
        }
      }
      return isPhaseOne ? ["row", "vertical", "fly", "press", "latAccent"] : defaultPriority;
    };

    let firstExtraCategory: Exclude<BackChestMainStimulusCategory, "other"> | null = null;

    for (const slotIndex of extraSlotIndexes) {
      const slot = mainSlotPlan[slotIndex];
      if (!slot) continue;
      const currentExercise = exerciseById(nextIds[slotIndex]);
      const currentCategory = currentExercise
        ? resolveSecondaryCategoryForExercise(currentExercise)
        : null;
      if (currentExercise && currentCategory && categoryCounts[currentCategory] > 0) {
        removeSelectedExercise({ exercise: currentExercise, category: currentCategory });
      }

      const candidateMeta = exercises
        .filter((exercise) => exercise.category === "main")
        .map((exercise) => ({
          exercise,
          category: resolveSecondaryCategoryForExercise(exercise),
        }))
        .filter(
          (
            entry
          ): entry is {
            exercise: Exercise;
            category: Exclude<BackChestMainStimulusCategory, "other">;
          } => Boolean(entry.category)
        );
      const rowOptionCount = candidateMeta.filter((entry) => entry.category === "row").length;
      const pressOptionCount = candidateMeta.filter((entry) => entry.category === "press").length;
      const categoryPriority = resolveSecondaryCategoryPriority({
        slotIndex,
        firstExtraCategory,
        rowOptionCount,
        pressOptionCount,
      });
      const categoryRank = new Map(
        categoryPriority.map((category, index) => [category, index] as const)
      );

      const sortCandidates = (
        left: { exercise: Exercise; category: Exclude<BackChestMainStimulusCategory, "other"> },
        right: { exercise: Exercise; category: Exclude<BackChestMainStimulusCategory, "other"> }
      ) => {
        const leftRank = categoryRank.get(left.category) ?? Number.MAX_SAFE_INTEGER;
        const rightRank = categoryRank.get(right.category) ?? Number.MAX_SAFE_INTEGER;
        if (leftRank !== rightRank) return leftRank - rightRank;
        const scoreDelta =
          secondaryScores({
            exercise: right.exercise,
            category: right.category,
            slot,
            slotIndex,
          }) -
          secondaryScores({
            exercise: left.exercise,
            category: left.category,
            slot,
            slotIndex,
          });
        if (scoreDelta !== 0) return scoreDelta;
        const roleForSort: BackChestAnchorRole =
          left.category === "press" || left.category === "fly"
            ? "horizontalPush"
            : "horizontalPull";
        const anchorCmp = compareBackChestAnchorCandidates({
          role: roleForSort,
          left: left.exercise,
          right: right.exercise,
          daysPerWeek,
          goalModifier,
          selectionContext: context.selectionContext,
        });
        if (anchorCmp !== 0) return anchorCmp;
        return left.exercise.id.localeCompare(right.exercise.id);
      };

      const pickFromPool = (strictStimulus: boolean) =>
        [...candidateMeta]
          .filter((entry) =>
            isSecondaryCandidateEligible({
              exercise: entry.exercise,
              category: entry.category,
              allowChestFly: allowSecondaryChestFly,
              strictStimulus,
              slotIndex,
              slotKind: slot.slotKind,
              slotLane: slot.lane,
            })
          )
          .sort(sortCandidates)[0] ?? null;

      let selected = pickFromPool(true);
      if (!selected) {
        selected = pickFromPool(false);
      }
      if (!selected && currentExercise && currentCategory) {
        const currentAsFallbackAllowed = isSecondaryCandidateEligible({
          exercise: currentExercise,
          category: currentCategory,
          allowChestFly: allowSecondaryChestFly,
          strictStimulus: false,
          slotIndex,
          slotKind: slot.slotKind,
          slotLane: slot.lane,
        });
        if (currentAsFallbackAllowed) {
          selected = {
            exercise: currentExercise,
            category: currentCategory,
          };
        }
      }

      if (!selected) {
        const emergencyReplacement = [...candidateMeta].filter(
            (entry) =>
              !isSecondaryCandidateEligible({
                exercise: entry.exercise,
                category: entry.category,
                allowChestFly: allowSecondaryChestFly,
                strictStimulus: false,
                slotIndex,
                slotKind: slot.slotKind,
                slotLane: slot.lane,
              })
                ? isBackChestMainBoundaryEligible({
                    exercise: entry.exercise,
                    allowChestFly: allowSecondaryChestFly && entry.category === "fly",
                  }) &&
                  matchesBackChestMainSlotKind({
                    exercise: entry.exercise,
                    slotKind: slot.slotKind,
                    slotLane: slot.lane,
                  }) &&
                  isExerciseEligibleForProgramContext({
                    exercise: entry.exercise,
                    available: availableForBackChest,
                    section: "main",
                    context: context.selectionContext,
                  }) &&
                  !isBackChestScapularAccessoryPullExercise(entry.exercise) &&
                  isBackChestExperienceEligible(
                    entry.exercise,
                    context.selectionContext.experienceLevel
                  ) &&
                  resolveBackChestEquipmentTier(entry.exercise) <= tierProfile.tierCeiling &&
                  isBackChestFloorPressAllowed(entry.exercise, context, tierProfile) &&
                  !(
                    isIsolationExercise(entry.exercise) &&
                    (entry.category !== "fly" ||
                      !allowSecondaryChestFly ||
                      !isBackChestFlyPatternExercise(entry.exercise))
                  ) &&
                  !shouldGateBackChestGymLikeMainCandidate({
                    exercise: entry.exercise,
                    allowChestFly: allowSecondaryChestFly && entry.category === "fly",
                    slotKind: slot.slotKind,
                    slotLane: slot.lane,
                    available: availableForBackChest,
                    context: context.selectionContext,
                  })
                : true
          )
          .sort(sortCandidates)[0];
        if (emergencyReplacement) {
          nextIds[slotIndex] = emergencyReplacement.exercise.id;
          addSelectedExercise({
            exercise: emergencyReplacement.exercise,
            category: emergencyReplacement.category,
          });
          if (!firstExtraCategory) firstExtraCategory = emergencyReplacement.category;
          continue;
        }
        const anchorFallback = [0, 1, 2, 3]
          .map((anchorIndex) => exerciseById(nextIds[anchorIndex]))
          .filter((exercise): exercise is Exercise => Boolean(exercise))
          .map((exercise) => ({
            exercise,
            category: resolveSecondaryCategoryForExercise(exercise),
          }))
          .filter(
            (
              entry
            ): entry is {
              exercise: Exercise;
              category: Exclude<BackChestMainStimulusCategory, "other">;
            } => Boolean(entry.category)
          )
          .sort((left, right) => {
            const leftRank = categoryRank.get(left.category) ?? Number.MAX_SAFE_INTEGER;
            const rightRank = categoryRank.get(right.category) ?? Number.MAX_SAFE_INTEGER;
            return leftRank - rightRank;
          })
          .find((entry) => categoryCounts[entry.category] < BACK_CHEST_SECONDARY_CATEGORY_CAPS[entry.category]);
        if (anchorFallback) {
          nextIds[slotIndex] = anchorFallback.exercise.id;
          addSelectedExercise({
            exercise: anchorFallback.exercise,
            category: anchorFallback.category,
          });
          if (!firstExtraCategory) firstExtraCategory = anchorFallback.category;
          continue;
        }
        if (currentExercise && currentCategory) {
          addSelectedExercise({ exercise: currentExercise, category: currentCategory });
        }
        continue;
      }

      nextIds[slotIndex] = selected.exercise.id;
      addSelectedExercise({
        exercise: selected.exercise,
        category: selected.category,
      });
      if (!firstExtraCategory) firstExtraCategory = selected.category;
    }
    return nextIds;
  })();

  const repairedMainIdsWithSecondaryVariationGuard = (() => {
    if (daysPerWeek !== 3) return repairedMainIdsWithExtraSlotRules;
    if (context.selectionContext.experienceLevel === "beginner") {
      return repairedMainIdsWithExtraSlotRules;
    }
    if (repairedMainIdsWithExtraSlotRules.length <= 4 || previousMainExercises.length <= 4) {
      return repairedMainIdsWithExtraSlotRules;
    }
    const nextIds = [...repairedMainIdsWithExtraSlotRules];
    const previousSecondaryIds = previousMainExercises.slice(4).map((exercise) => exercise.id);
    const currentSecondaryIds = nextIds.slice(4);
    if (!previousSecondaryIds.length) return nextIds;
    if (previousSecondaryIds.length !== currentSecondaryIds.length) return nextIds;
    const secondariesMatchPrevious = currentSecondaryIds.every(
      (id, index) => id === previousSecondaryIds[index]
    );
    if (!secondariesMatchPrevious) return nextIds;

    const dumbbellsOnly =
      context.available.has("dumbbells") &&
      !context.available.has("machines") &&
      !context.available.has("cables") &&
      !context.available.has("bands") &&
      !context.available.has("barbell");
    const noneOnly = context.available.has("none") && context.available.size === 1;
    const swapPriority: Array<"press" | "row"> =
      dumbbellsOnly || noneOnly ? ["press", "row"] : ["row", "press"];

    const usedIds = new Set(nextIds);
    const categoryCounts: Record<Exclude<BackChestMainStimulusCategory, "other">, number> = {
      row: 0,
      press: 0,
      vertical: 0,
      fly: 0,
      latAccent: 0,
    };
    const stimulusCounts = new Map<string, number>();
    nextIds.forEach((id) => {
      const exercise = exerciseById(id);
      if (!exercise) return;
      const category = resolveBackChestMainStimulusCategory(exercise);
      if (category === "other") return;
      categoryCounts[category] += 1;
      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      stimulusCounts.set(stimulusKey, (stimulusCounts.get(stimulusKey) ?? 0) + 1);
    });

    const addSecondaryTracking = (
      exercise: Exercise,
      category: Exclude<BackChestMainStimulusCategory, "other">
    ) => {
      usedIds.add(exercise.id);
      categoryCounts[category] += 1;
      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      stimulusCounts.set(stimulusKey, (stimulusCounts.get(stimulusKey) ?? 0) + 1);
    };
    const removeSecondaryTracking = (
      exercise: Exercise,
      category: Exclude<BackChestMainStimulusCategory, "other">
    ) => {
      usedIds.delete(exercise.id);
      categoryCounts[category] = Math.max(0, categoryCounts[category] - 1);
      const stimulusKey = resolveBackChestStimulusKey({
        exercise,
        categoryOverride: category,
      });
      const current = stimulusCounts.get(stimulusKey) ?? 0;
      if (current <= 1) {
        stimulusCounts.delete(stimulusKey);
      } else {
        stimulusCounts.set(stimulusKey, current - 1);
      }
    };

    const trySwapSecondaryCategory = (targetCategory: "press" | "row") => {
      const candidateSlotIndexes = nextIds
        .map((id, index) => ({ id, index }))
        .filter((entry) => entry.index >= 4)
        .filter((entry) => {
          const exercise = exerciseById(entry.id);
          if (!exercise) return false;
          return resolveBackChestMainStimulusCategory(exercise) === targetCategory;
        })
        .map((entry) => entry.index);
      for (const slotIndex of candidateSlotIndexes) {
        const currentExercise = exerciseById(nextIds[slotIndex]);
        if (!currentExercise) continue;
        const currentCategory = resolveBackChestMainStimulusCategory(currentExercise);
        if (currentCategory !== targetCategory) continue;
        const slot = mainSlotPlan[slotIndex];
        const allowChestFly = Boolean(slot)
          ? shouldAllowBackChestFlyForSlot({
              slot,
              slotIndex,
              context,
              daysPerWeek,
              goalModifier,
            })
          : false;

        removeSecondaryTracking(currentExercise, currentCategory);
        const currentVariant = resolveBackChestExerciseVariantKey(currentExercise);
        const roleForSort: BackChestAnchorRole =
          targetCategory === "press" ? "horizontalPush" : "horizontalPull";
        const replacement = exercises
          .filter((exercise) => exercise.category === "main")
          .filter((exercise) => !usedIds.has(exercise.id))
          .filter((exercise) => exercise.id !== currentExercise.id)
          .map((exercise) => ({
            exercise,
            category: resolveBackChestMainStimulusCategory(exercise),
          }))
          .filter(
            (
              entry
            ): entry is {
              exercise: Exercise;
              category: Exclude<BackChestMainStimulusCategory, "other">;
            } => entry.category === targetCategory
          )
          .filter((entry) =>
            isExerciseEligibleForProgramContext({
              exercise: entry.exercise,
              available: availableForBackChest,
              section: "main",
              context: context.selectionContext,
            })
          )
          .filter((entry) =>
            isBackChestMainBoundaryEligible({
              exercise: entry.exercise,
              allowChestFly: false,
            })
          )
          .filter((entry) => !isBackChestScapularAccessoryPullExercise(entry.exercise))
          .filter((entry) => !isIsolationExercise(entry.exercise))
          .filter((entry) =>
            isBackChestExperienceEligible(
              entry.exercise,
              context.selectionContext.experienceLevel
            )
          )
          .filter((entry) => resolveBackChestEquipmentTier(entry.exercise) <= tierProfile.tierCeiling)
          .filter((entry) => isBackChestFloorPressAllowed(entry.exercise, context, tierProfile))
          .filter(
            (entry) =>
              !shouldGateBackChestGymLikeMainCandidate({
                exercise: entry.exercise,
                allowChestFly: allowChestFly && entry.category === "fly",
                slotKind: slot?.slotKind,
                slotLane: slot?.lane,
                available: availableForBackChest,
                context: context.selectionContext,
              })
          )
          .filter(
            (entry) =>
              categoryCounts[entry.category] < BACK_CHEST_SECONDARY_CATEGORY_CAPS[entry.category]
          )
          .filter((entry) => {
            const stimulusKey = resolveBackChestStimulusKey({
              exercise: entry.exercise,
              categoryOverride: entry.category,
            });
            return (stimulusCounts.get(stimulusKey) ?? 0) === 0;
          })
          .sort((left, right) => {
            const leftVariantChanged =
              resolveBackChestExerciseVariantKey(left.exercise) !== currentVariant;
            const rightVariantChanged =
              resolveBackChestExerciseVariantKey(right.exercise) !== currentVariant;
            if (leftVariantChanged !== rightVariantChanged) {
              return leftVariantChanged ? -1 : 1;
            }
            const cmp = compareBackChestAnchorCandidates({
              role: roleForSort,
              left: left.exercise,
              right: right.exercise,
              daysPerWeek,
              goalModifier,
              selectionContext: context.selectionContext,
              availableForBackChest,
            });
            if (cmp !== 0) return cmp;
            const leftSeed = stableHashUnit(
              `${context.selectionSeed ?? "back-chest-secondary-rotate"}|${slotIndex}|${left.exercise.id}`
            );
            const rightSeed = stableHashUnit(
              `${context.selectionSeed ?? "back-chest-secondary-rotate"}|${slotIndex}|${right.exercise.id}`
            );
            if (leftSeed !== rightSeed) return leftSeed - rightSeed;
            return left.exercise.id.localeCompare(right.exercise.id);
          })[0];

        if (replacement) {
          nextIds[slotIndex] = replacement.exercise.id;
          addSecondaryTracking(replacement.exercise, replacement.category);
          return true;
        }

        addSecondaryTracking(currentExercise, currentCategory);
      }
      return false;
    };

    for (const category of swapPriority) {
      if (trySwapSecondaryCategory(category)) {
        break;
      }
    }
    return nextIds;
  })();

  const repairedMainIdsWithVerticalCapGuard = (() => {
    if (daysPerWeek !== 3) return repairedMainIdsWithSecondaryVariationGuard;
    const allowedVerticalCount =
      context.selectionContext.experienceLevel === "advanced" ? 2 : 1;
    const nextIds = [...repairedMainIdsWithSecondaryVariationGuard];
    const resolveCategoryForId = (exerciseId: string) => {
      const exercise = exerciseById(exerciseId);
      if (!exercise) return null;
      const category = resolveBackChestMainStimulusCategory(exercise);
      if (category === "other") return null;
      return category;
    };
    const categoryCounts: Record<
      Exclude<BackChestMainStimulusCategory, "other">,
      number
    > = {
      row: 0,
      press: 0,
      vertical: 0,
      fly: 0,
      latAccent: 0,
    };
    nextIds.forEach((exerciseId) => {
      const category = resolveCategoryForId(exerciseId);
      if (!category) return;
      categoryCounts[category] += 1;
    });
    if (categoryCounts.vertical <= allowedVerticalCount) return nextIds;

    const anchorVerticalIndex = mainSlotPlan.findIndex(
      (slot) => slot.slotKind === "mainPullVertical"
    );
    const verticalIndexes = nextIds
      .map((exerciseId, index) => ({ exerciseId, index, category: resolveCategoryForId(exerciseId) }))
      .filter((entry) => entry.category === "vertical")
      .map((entry) => entry.index);
    const keepVerticalIndex = verticalIndexes.includes(anchorVerticalIndex)
      ? anchorVerticalIndex
      : verticalIndexes[0] ?? -1;
    if (keepVerticalIndex < 0) return nextIds;

    const selectedIds = new Set(nextIds);
    const categoryPriority: Exclude<BackChestMainStimulusCategory, "other">[] =
      context.selectionContext.phaseStage === "activation"
        ? ["row", "fly", "press", "latAccent"]
        : ["row", "press", "fly", "latAccent"];
    const categoryRank = new Map(
      categoryPriority.map((category, index) => [category, index] as const)
    );

    const buildReplacementForSlot = (slotIndex: number) => {
      const slot = mainSlotPlan[slotIndex];
      const allowChestFly = Boolean(slot)
        ? shouldAllowBackChestFlyForSlot({
            slot,
            slotIndex,
            context,
            daysPerWeek,
            goalModifier,
          })
        : false;
      const roleForSort: BackChestAnchorRole =
        slot?.lane === "push" || slot?.lane === "verticalPush"
          ? "horizontalPush"
          : "horizontalPull";

      const candidatePool = exercises
        .filter((exercise) => exercise.category === "main")
        .map((exercise) => ({
          exercise,
          category: resolveBackChestMainStimulusCategory(exercise),
        }))
        .filter(
          (
            entry
          ): entry is {
            exercise: Exercise;
            category: Exclude<BackChestMainStimulusCategory, "other">;
          } => entry.category !== "other"
        )
        .filter((entry) => entry.category !== "vertical")
        .filter((entry) =>
          isBackChestMainBoundaryEligible({
            exercise: entry.exercise,
            allowChestFly: allowChestFly && entry.category === "fly",
          })
        )
        .filter((entry) =>
          isExerciseEligibleForProgramContext({
            exercise: entry.exercise,
            available: availableForBackChest,
            section: "main",
            context: context.selectionContext,
          })
        )
        .filter((entry) => !isBackChestScapularAccessoryPullExercise(entry.exercise))
        .filter((entry) =>
          isBackChestExperienceEligible(
            entry.exercise,
            context.selectionContext.experienceLevel
          )
        )
        .filter((entry) => resolveBackChestEquipmentTier(entry.exercise) <= tierProfile.tierCeiling)
        .filter((entry) => isBackChestFloorPressAllowed(entry.exercise, context, tierProfile))
        .filter(
          (entry) =>
            !shouldGateBackChestGymLikeMainCandidate({
              exercise: entry.exercise,
              allowChestFly: allowChestFly && entry.category === "fly",
              slotKind: slot?.slotKind,
              slotLane: slot?.lane,
              available: availableForBackChest,
              context: context.selectionContext,
            })
        )
        .filter(
          (entry) =>
            !isIsolationExercise(entry.exercise) ||
            (entry.category === "fly" &&
              allowChestFly &&
              isBackChestFlyPatternExercise(entry.exercise))
        )
        .filter((entry) => !selectedIds.has(entry.exercise.id))
        .filter(
          (entry) => categoryCounts[entry.category] < BACK_CHEST_SECONDARY_CATEGORY_CAPS[entry.category]
        )
        .sort((left, right) => {
          const leftRank = categoryRank.get(left.category) ?? Number.MAX_SAFE_INTEGER;
          const rightRank = categoryRank.get(right.category) ?? Number.MAX_SAFE_INTEGER;
          if (leftRank !== rightRank) return leftRank - rightRank;
          const cmp = compareBackChestAnchorCandidates({
            role: roleForSort,
            left: left.exercise,
            right: right.exercise,
            daysPerWeek,
            goalModifier,
            selectionContext: context.selectionContext,
          });
          if (cmp !== 0) return cmp;
          return left.exercise.id.localeCompare(right.exercise.id);
        });
      return candidatePool[0] ?? null;
    };

    for (const slotIndex of verticalIndexes) {
      if (categoryCounts.vertical <= allowedVerticalCount) break;
      if (slotIndex === keepVerticalIndex) continue;
      const currentExercise = exerciseById(nextIds[slotIndex]);
      if (!currentExercise) continue;
      const currentCategory = resolveBackChestMainStimulusCategory(currentExercise);
      if (currentCategory !== "vertical") continue;

      selectedIds.delete(currentExercise.id);
      categoryCounts.vertical = Math.max(0, categoryCounts.vertical - 1);

      const replacement = buildReplacementForSlot(slotIndex);
      if (!replacement) {
        selectedIds.add(currentExercise.id);
        categoryCounts.vertical += 1;
        continue;
      }

      nextIds[slotIndex] = replacement.exercise.id;
      selectedIds.add(replacement.exercise.id);
      categoryCounts[replacement.category] += 1;
    }

    return nextIds;
  })();

  const repairedMainIdsWithBoundaryGuard = (() => {
    const nextIds = [...repairedMainIdsWithVerticalCapGuard];
    const usedIdCounts = new Map<string, number>();
    nextIds.forEach((id) => {
      usedIdCounts.set(id, (usedIdCounts.get(id) ?? 0) + 1);
    });
    const incrementUsedId = (id: string) => {
      usedIdCounts.set(id, (usedIdCounts.get(id) ?? 0) + 1);
    };
    const decrementUsedId = (id: string) => {
      const currentCount = usedIdCounts.get(id) ?? 0;
      if (currentCount <= 1) {
        usedIdCounts.delete(id);
      } else {
        usedIdCounts.set(id, currentCount - 1);
      }
    };
    const isIdUsed = (id: string) => (usedIdCounts.get(id) ?? 0) > 0;
    const seededBoundaryScore = (slotIndex: number, exerciseId: string) =>
      stableHashUnit(
        `${context.selectionSeed ?? "back-chest-boundary"}|slot:${slotIndex}|${exerciseId}`
      );
    const resolveAllowedFlyForSlot = (slotIndex: number) => {
      const slot = mainSlotPlan[slotIndex];
      if (!slot) return false;
      return shouldAllowBackChestFlyForSlot({
        slot,
        slotIndex,
        context,
        daysPerWeek,
        goalModifier,
      });
    };

    for (let slotIndex = 0; slotIndex < nextIds.length; slotIndex += 1) {
      const slot = mainSlotPlan[slotIndex];
      if (!slot) continue;
      const slotRole = resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane);
      const currentExercise = exerciseById(nextIds[slotIndex]);
      const allowChestFly = resolveAllowedFlyForSlot(slotIndex);
      const currentCategory = currentExercise
        ? resolveBackChestMainStimulusCategory(currentExercise)
        : "other";
      const currentValid =
        Boolean(currentExercise) &&
        currentCategory !== "other" &&
        isBackChestMainBoundaryEligible({
          exercise: currentExercise!,
          allowChestFly,
        }) &&
        matchesBackChestMainSlotKind({
          exercise: currentExercise!,
          slotKind: slot.slotKind,
          slotLane: slot.lane,
        }) &&
        !isBackChestScapularAccessoryPullExercise(currentExercise!) &&
        !(
          isIsolationExercise(currentExercise!) &&
          (!allowChestFly || !isBackChestFlyPatternExercise(currentExercise!))
        ) &&
        !shouldGateBackChestGymLikeMainCandidate({
          exercise: currentExercise!,
          allowChestFly,
          slotKind: slot.slotKind,
          slotLane: slot.lane,
          available: availableForBackChest,
          context: context.selectionContext,
        });
      if (currentValid) continue;

      if (currentExercise) {
        decrementUsedId(currentExercise.id);
      }

      const replacement = exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => !isIdUsed(exercise.id))
        .filter((exercise) => !currentExercise || exercise.id !== currentExercise.id)
        .filter((exercise) =>
          isExerciseEligibleForProgramContext({
            exercise,
            available: availableForBackChest,
            section: "main",
            context: context.selectionContext,
          })
        )
        .filter((exercise) =>
          matchesBackChestMainSlotKind({
            exercise,
            slotKind: slot.slotKind,
            slotLane: slot.lane,
          })
        )
        .filter((exercise) =>
          isBackChestMainBoundaryEligible({
            exercise,
            allowChestFly,
          })
        )
        .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
        .filter((exercise) =>
          isBackChestExperienceEligible(
            exercise,
            context.selectionContext.experienceLevel
          )
        )
        .filter((exercise) =>
          slotRole
            ? isBackChestAnchorTierAllowed({
                exercise,
                role: slotRole,
                context,
                daysPerWeek,
                tierProfile,
                goalModifier,
              })
            : resolveBackChestEquipmentTier(exercise) <= tierProfile.tierCeiling
        )
        .filter((exercise) => isBackChestFloorPressAllowed(exercise, context, tierProfile))
        .filter(
          (exercise) =>
            !shouldGateBackChestGymLikeMainCandidate({
              exercise,
              allowChestFly,
              slotKind: slot.slotKind,
              slotLane: slot.lane,
              available: availableForBackChest,
              context: context.selectionContext,
            })
        )
        .filter(
          (exercise) =>
            !isIsolationExercise(exercise) ||
            (allowChestFly && isBackChestFlyPatternExercise(exercise))
        )
        .sort((left, right) => {
          const leftScore = seededBoundaryScore(slotIndex, left.id);
          const rightScore = seededBoundaryScore(slotIndex, right.id);
          if (leftScore !== rightScore) return leftScore - rightScore;
          return left.id.localeCompare(right.id);
        })[0];

      if (replacement) {
        nextIds[slotIndex] = replacement.id;
        incrementUsedId(replacement.id);
        continue;
      }

      if (currentExercise) {
        incrementUsedId(currentExercise.id);
      }
    }

    return nextIds;
  })();

  const repairedMainIdsWithUniqueIdGuard = (() => {
    if (daysPerWeek !== 3) {
      return repairedMainIdsWithBoundaryGuard.map((id) => id as string | null);
    }
    const nextIds = repairedMainIdsWithBoundaryGuard.map((id) => id as string | null);
    const usedMainIds = new Set<string>();
    const seededUniqueGuardScore = (slotIndex: number, exerciseId: string) =>
      stableHashUnit(
        `${context.selectionSeed ?? "back-chest-unique"}|slot:${slotIndex}|${exerciseId}`
      );
    const resolveAllowedFlyForSlot = (slotIndex: number) => {
      const slot = mainSlotPlan[slotIndex];
      if (!slot) return false;
      return shouldAllowBackChestFlyForSlot({
        slot,
        slotIndex,
        context,
        daysPerWeek,
        goalModifier,
      });
    };
    const buildCategoryCountsWithoutSlot = (slotIndex: number) => {
      const counts: Record<Exclude<BackChestMainStimulusCategory, "other">, number> = {
        row: 0,
        press: 0,
        vertical: 0,
        fly: 0,
        latAccent: 0,
      };
      nextIds.forEach((id, index) => {
        if (index === slotIndex || !id) return;
        const exercise = exerciseById(id);
        if (!exercise) return;
        const category = resolveBackChestMainStimulusCategory(exercise);
        if (category === "other") return;
        counts[category] += 1;
      });
      return counts;
    };

    for (let slotIndex = 0; slotIndex < nextIds.length; slotIndex += 1) {
      const currentId = nextIds[slotIndex];
      if (!currentId) continue;
      if (!usedMainIds.has(currentId)) {
        usedMainIds.add(currentId);
        continue;
      }

      const slot = mainSlotPlan[slotIndex];
      if (!slot) {
        nextIds[slotIndex] = null;
        continue;
      }
      const slotRole = resolveBackChestAnchorRoleForSlot(slot.slotKind, slot.lane);
      const allowChestFly = resolveAllowedFlyForSlot(slotIndex);
      const categoryCounts = buildCategoryCountsWithoutSlot(slotIndex);

      const replacement = exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => !usedMainIds.has(exercise.id))
        .filter((exercise) => exercise.id !== currentId)
        .filter((exercise) =>
          isExerciseEligibleForProgramContext({
            exercise,
            available: availableForBackChest,
            section: "main",
            context: context.selectionContext,
          })
        )
        .filter((exercise) =>
          matchesBackChestMainSlotKind({
            exercise,
            slotKind: slot.slotKind,
            slotLane: slot.lane,
          })
        )
        .filter((exercise) =>
          isBackChestMainBoundaryEligible({
            exercise,
            allowChestFly,
          })
        )
        .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
        .filter((exercise) =>
          isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
        )
        .filter((exercise) =>
          slotRole
            ? isBackChestAnchorTierAllowed({
                exercise,
                role: slotRole,
                context,
                daysPerWeek,
                tierProfile,
                goalModifier,
              })
            : resolveBackChestEquipmentTier(exercise) <= tierProfile.tierCeiling
        )
        .filter((exercise) => isBackChestFloorPressAllowed(exercise, context, tierProfile))
        .filter(
          (exercise) =>
            !shouldGateBackChestGymLikeMainCandidate({
              exercise,
              allowChestFly,
              slotKind: slot.slotKind,
              slotLane: slot.lane,
              available: availableForBackChest,
              context: context.selectionContext,
            })
        )
        .filter(
          (exercise) =>
            !isIsolationExercise(exercise) ||
            (allowChestFly && isBackChestFlyPatternExercise(exercise))
        )
        .filter((exercise) => {
          const category = resolveBackChestMainStimulusCategory(exercise);
          if (category === "other") return false;
          return categoryCounts[category] < BACK_CHEST_SECONDARY_CATEGORY_CAPS[category];
        })
        .sort((left, right) => {
          const leftScore = seededUniqueGuardScore(slotIndex, left.id);
          const rightScore = seededUniqueGuardScore(slotIndex, right.id);
          if (leftScore !== rightScore) return leftScore - rightScore;
          return left.id.localeCompare(right.id);
        })[0];

      if (replacement) {
        nextIds[slotIndex] = replacement.id;
        usedMainIds.add(replacement.id);
      } else {
        // If no legal replacement exists, drop the duplicate slot rather than repeat an ID.
        nextIds[slotIndex] = null;
      }
    }

    return nextIds;
  })();

  const repairedMainIdsWithFlySlotGuard = (() => {
    if (daysPerWeek !== 3) return repairedMainIdsWithUniqueIdGuard;
    const flySlotIndex = mainSlotPlan.findIndex((slot) => slot.slotKind === "mainPushFly");
    if (flySlotIndex < 0) return repairedMainIdsWithUniqueIdGuard;

    const slot = mainSlotPlan[flySlotIndex];
    if (!slot) return repairedMainIdsWithUniqueIdGuard;

    const nextIds = [...repairedMainIdsWithUniqueIdGuard];
    const currentId = nextIds[flySlotIndex];
    const currentExercise = currentId ? exerciseById(currentId) : null;
    if (currentExercise && isBackChestFlyPatternExercise(currentExercise)) {
      return nextIds;
    }

    const usedIds = new Set(nextIds.filter((id): id is string => Boolean(id)));
    if (currentExercise) {
      usedIds.delete(currentExercise.id);
    }

    const replacement = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) => isBackChestFlyPatternExercise(exercise))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: availableForBackChest,
          section: "main",
          context: context.selectionContext,
        })
      )
      .filter((exercise) =>
        matchesBackChestMainSlotKind({
          exercise,
          slotKind: slot.slotKind,
          slotLane: slot.lane,
        })
      )
      .filter((exercise) =>
        isBackChestMainBoundaryEligible({
          exercise,
          allowChestFly: true,
        })
      )
      .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
      .filter((exercise) =>
        isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
      )
      .filter((exercise) =>
        isBackChestAnchorTierAllowed({
          exercise,
          role: "horizontalPush",
          context,
          daysPerWeek,
          tierProfile,
          goalModifier,
        })
      )
      .filter((exercise) => isBackChestFloorPressAllowed(exercise, context, tierProfile))
      .filter(
        (exercise) =>
          !shouldGateBackChestGymLikeMainCandidate({
            exercise,
            allowChestFly: true,
            slotKind: slot.slotKind,
            slotLane: slot.lane,
            available: availableForBackChest,
            context: context.selectionContext,
          })
      )
      .sort((left, right) => {
        const cmp = compareBackChestAnchorCandidates({
          role: "horizontalPush",
          left,
          right,
          daysPerWeek,
          goalModifier,
          selectionContext: context.selectionContext,
          availableForBackChest,
        });
        if (cmp !== 0) return cmp;
        return left.id.localeCompare(right.id);
      })[0];

    if (!replacement) return nextIds;
    nextIds[flySlotIndex] = replacement.id;
    return nextIds;
  })();

  const repairedMainIdsWithThreeDaySecondPushFlyGuard = (() => {
    if (daysPerWeek !== 3) return repairedMainIdsWithFlySlotGuard;
    const pushSlotIndexes = mainSlotPlan
      .map((slot, index) => ({ slot, index }))
      .filter((entry) => entry.slot.lane === "push")
      .map((entry) => entry.index);
    if (pushSlotIndexes.length < 2) return repairedMainIdsWithFlySlotGuard;

    const secondPushIndex = pushSlotIndexes[1]!;
    const secondPushSlot = mainSlotPlan[secondPushIndex];
    if (!secondPushSlot) return repairedMainIdsWithFlySlotGuard;

    const nextIds = [...repairedMainIdsWithFlySlotGuard];
    const currentId = nextIds[secondPushIndex];
    const currentExercise = currentId ? exerciseById(currentId) : null;
    if (currentExercise && isBackChestFlyPatternExercise(currentExercise)) {
      return nextIds;
    }

    const usedIds = new Set(nextIds.filter((id): id is string => Boolean(id)));
    if (currentExercise) {
      usedIds.delete(currentExercise.id);
    }

    const preferredFlyIds = ["machine-pec-deck-press", "dumbbell-chest-fly", "suspension-chest-fly"];
    const preferredCandidates = preferredFlyIds
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: availableForBackChest,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      )
      .filter((exercise) =>
        isBackChestMainBoundaryEligible({
          exercise,
          allowChestFly: true,
        })
      )
      .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
      .filter((exercise) =>
        isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
      )
      .filter((exercise) =>
        isBackChestAnchorTierAllowed({
          exercise,
          role: "horizontalPush",
          context,
          daysPerWeek,
          tierProfile,
          goalModifier,
        })
      )
      .filter((exercise) => isBackChestFloorPressAllowed(exercise, context, tierProfile))
      .filter(
        (exercise) =>
          !shouldGateBackChestGymLikeMainCandidate({
            exercise,
            allowChestFly: true,
            slotKind: secondPushSlot.slotKind,
            slotLane: secondPushSlot.lane,
            available: availableForBackChest,
            context: context.selectionContext,
          })
      );

    const fallbackFlyCandidate =
      exercises
        .filter((exercise) => exercise.category === "main")
        .filter((exercise) => !usedIds.has(exercise.id))
        .filter((exercise) => isBackChestFlyPatternExercise(exercise))
        .filter((exercise) =>
          isExerciseEligibleForProgramContext({
            exercise,
            available: availableForBackChest,
            section: "main",
            context: context.selectionContext,
            dayTitle: day.title,
          })
        )
        .filter((exercise) =>
          isBackChestMainBoundaryEligible({
            exercise,
            allowChestFly: true,
          })
        )
        .filter((exercise) => !isBackChestScapularAccessoryPullExercise(exercise))
        .filter((exercise) =>
          isBackChestExperienceEligible(exercise, context.selectionContext.experienceLevel)
        )
        .filter((exercise) =>
          isBackChestAnchorTierAllowed({
            exercise,
            role: "horizontalPush",
            context,
            daysPerWeek,
            tierProfile,
            goalModifier,
          })
        )
        .filter((exercise) => isBackChestFloorPressAllowed(exercise, context, tierProfile))
        .filter(
          (exercise) =>
            !shouldGateBackChestGymLikeMainCandidate({
              exercise,
              allowChestFly: true,
              slotKind: secondPushSlot.slotKind,
              slotLane: secondPushSlot.lane,
              available: availableForBackChest,
              context: context.selectionContext,
            })
        )
        .sort((left, right) => left.id.localeCompare(right.id))[0] ?? null;

    const replacement = preferredCandidates[0] ?? fallbackFlyCandidate;
    if (!replacement) return nextIds;
    nextIds[secondPushIndex] = replacement.id;
    return nextIds;
  })();

  const replacedRoutine = [...day.routine];
  const mainRoutineIndexesToDrop = new Set<number>();
  mainEntries.forEach((entry, index) => {
    const nextId = repairedMainIdsWithThreeDaySecondPushFlyGuard[index];
    const nextExercise = nextId ? exerciseById(nextId) : null;
    if (!nextId || !nextExercise) {
      mainRoutineIndexesToDrop.add(entry.index);
      return;
    }
    replacedRoutine[entry.index] = {
      ...entry.item,
      exerciseId: nextExercise.id,
      loadType: nextExercise.loadType,
      cues: buildProgramCues(nextExercise, entry.item.section),
    };
  });

  const routineAfterMainUniqueness =
    mainRoutineIndexesToDrop.size > 0
      ? replacedRoutine.filter((_, index) => !mainRoutineIndexesToDrop.has(index))
      : replacedRoutine;
  const repairedDay = { ...day, routine: routineAfterMainUniqueness };
  const repairedStatus = evaluateBackChestMainIntelligence({
    day: repairedDay,
    daysPerWeek,
    context,
  });
  if (repairedStatus.ok) return { day: repairedDay };

  return {
    day: repairedDay,
    warning:
      `Back + Chest main intelligence still imperfect after repair: ` +
      `${formatBackChestMainStatus(repairedStatus)}.`,
  };
};

const repairBackChestDayIntelligence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { day: ProgramDay; warnings: string[] } => {
  const { day, daysPerWeek, context } = params;
  if (!isBackChestDayTitle(day.title)) return { day, warnings: [] };

  const warnings: string[] = [];
  let updatedDay = day;

  const repairedMain = repairBackChestMainIntelligence({
    day: updatedDay,
    daysPerWeek,
    context,
  });
  if (repairedMain.warning) warnings.push(repairedMain.warning);
  updatedDay = repairedMain.day;

  const repairedAccessory = repairBackChestAccessoryArchitecture({
    day: updatedDay,
    daysPerWeek,
    context,
  });
  if (repairedAccessory.warning) warnings.push(repairedAccessory.warning);
  updatedDay = repairedAccessory.day;

  const finalMainStatus = evaluateBackChestMainIntelligence({
    day: updatedDay,
    daysPerWeek,
    context,
  });
  if (!finalMainStatus.ok) {
    warnings.push(
      `Back + Chest main intelligence validation failed after repair: ${formatBackChestMainStatus(finalMainStatus)}.`
    );
  }

  const finalMainExercises = updatedDay.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const finalAccessoryExercises = updatedDay.routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const finalAccessoryStatus = evaluateBackChestAccessoryIntelligence({
    day: updatedDay,
    context,
    daysPerWeek,
    mainExercises: finalMainExercises,
    accessoryExercises: finalAccessoryExercises,
  });
  if (!finalAccessoryStatus.ok) {
    warnings.push(
      `Back + Chest accessory intelligence validation failed after repair: ` +
        `pull=${finalAccessoryStatus.pullVolume}, push=${finalAccessoryStatus.pushVolume}, ` +
        `posterior=${finalAccessoryStatus.posteriorAccessoryCount}, chestIso=${finalAccessoryStatus.chestIsolationCount}, ` +
        `redundant=${finalAccessoryStatus.redundantAccessoryCount}, repeated=${finalAccessoryStatus.repeatedPriorPhaseAccessoryPairing}.`
    );
  }

  return {
    day: updatedDay,
    warnings,
  };
};

const isShouldersArmsDayTitle = (dayTitle?: string | null) =>
  normalizeSlotToken(dayTitle ?? "") === "shoulders_arms";

type ShouldersArmsAnchorRole = "ohp" | "lateral" | "biceps" | "triceps";
type ShouldersArmsSecondaryRole =
  | "biceps"
  | "triceps"
  | "rearDeltMain"
  | "shoulderSupportMain"
  | "shoulderSupportMainAlt";
type ShouldersArmsTemplateSecondaryRole = Exclude<
  ShouldersArmsSecondaryRole,
  "biceps" | "triceps"
>;
type ShouldersArmsAccessoryRole = "rearDelt" | "externalScap";
type ShouldersArmsArmRole = "biceps" | "triceps";
type ShouldersArmsMainCategory =
  | "ohp"
  | "lateral"
  | "biceps"
  | "triceps"
  | "rearDeltMain"
  | "shoulderSupport"
  | "uprightRow"
  | "other";

const SHOULDERS_ARMS_MAIN_CATEGORY_CAPS: Record<
  Exclude<ShouldersArmsMainCategory, "other">,
  number
> = {
  ohp: 1,
  lateral: 1,
  biceps: 0,
  triceps: 0,
  rearDeltMain: 2,
  shoulderSupport: 2,
  uprightRow: 0,
};

const normalizeShouldersArmsGoal = (goal: string) => {
  const normalized = goal.trim().toLowerCase();
  if (normalized.includes("posture")) return "improvePosture";
  if (normalized.includes("pain")) return "reducePain";
  if (normalized.includes("athletic")) return "athleticPerformance";
  return "generalFitness";
};

const resolveShouldersArmsTargetMainCount = (experienceLevel: NormalizedExperienceLevel) =>
  experienceLevel === "advanced" ? 4 : experienceLevel === "intermediate" ? 4 : 3;

const resolveShouldersArmsTargetAccessoryCount = (
  experienceLevel: NormalizedExperienceLevel
) => (experienceLevel === "advanced" ? 4 : 2);

const resolveShouldersArmsExerciseFamilyKey = (exercise: Exercise) => {
  if (exercise.familyKey?.trim()) return normalizeTagToken(exercise.familyKey);
  if (resolveShouldersArmsMainCategory(exercise) === "rearDeltMain") return "rear_delt_main";
  return normalizeTagToken(exercise.id);
};

const resolveShouldersArmsExerciseVariantKey = (exercise: Exercise) => {
  if (exercise.variantKey?.trim()) return normalizeTagToken(exercise.variantKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("single-arm") || descriptor.includes("single arm")) return "single_arm";
  if (descriptor.includes("split-stance") || descriptor.includes("split stance"))
    return "split_stance";
  if (descriptor.includes("kneeling")) return "kneeling";
  if (descriptor.includes("iso") || exercise.loadType === "timed") return "iso_hold";
  return "standard";
};

type ShouldersArmsArmLineVariant =
  | "elbow_behind"
  | "elbow_in_front"
  | "elbow_at_side"
  | "overhead"
  | "pushdown"
  | "extension";

type ShouldersArmsArmImplementClass =
  | "cable"
  | "dumbbell"
  | "machine"
  | "bodyweight";

const resolveShouldersArmsArmLineVariant = (
  exercise: Exercise,
  role: ShouldersArmsArmRole
): ShouldersArmsArmLineVariant => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const includesPatternToken = (token: string) => patterns.has(normalizeTagToken(token));
  if (role === "biceps") {
    if (
      descriptor.includes("incline") ||
      includesPatternToken("incline")
    ) {
      return "elbow_behind";
    }
    if (
      descriptor.includes("preacher") ||
      descriptor.includes("spider") ||
      includesPatternToken("preacher") ||
      includesPatternToken("spider")
    ) {
      return "elbow_in_front";
    }
    return "elbow_at_side";
  }
  if (descriptor.includes("overhead") || includesPatternToken("overhead")) return "overhead";
  if (descriptor.includes("pushdown") || includesPatternToken("pushdown")) return "pushdown";
  return "extension";
};

const resolveShouldersArmsArmImplementClass = (
  exercise: Exercise
): ShouldersArmsArmImplementClass => {
  if (exercise.equipment.includes("cables")) return "cable";
  if (exercise.equipment.includes("dumbbells")) return "dumbbell";
  if (exercise.equipment.includes("machines")) return "machine";
  return "bodyweight";
};

const hasGymLikeUpperImplementAvailability = (available: Set<Equipment>) =>
  available.has("machines") ||
  available.has("cables") ||
  available.has("dumbbells") ||
  available.has("barbell");

const hasGymLikeUpperImplementOnExercise = (exercise: Exercise) =>
  exercise.equipment.some(
    (item) =>
      item === "machines" ||
      item === "cables" ||
      item === "dumbbells" ||
      item === "barbell"
  );

const isGymNoPainSelectionContext = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) =>
  params.context.capabilityMode === "hasLoad" &&
  params.context.painSeverity === "low" &&
  params.context.painAreas.length === 0 &&
  params.available.has("gym") &&
  hasGymLikeUpperImplementAvailability(params.available);

const isDefaultGeneralFitnessNoPainSelectionContext = (context: SelectionContext) => {
  const goal = normalizeTagToken(context.goal);
  return (
    context.painSeverity === "low" &&
    context.painAreas.length === 0 &&
    goal.includes("general") &&
    goal.includes("fitness")
  );
};

const shouldApplyDefaultGeneralFitnessNoPainRoleStrictness = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) =>
  isDefaultGeneralFitnessNoPainSelectionContext(params.context) &&
  (params.available.has("bands") ||
    params.available.has("dumbbells") ||
    params.available.has("gym") ||
    hasGymLikeUpperImplementAvailability(params.available));

const shouldApplyBodyweightMainIdentityProtection = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) =>
  isDefaultGeneralFitnessNoPainSelectionContext(params.context) &&
  params.available.has("none") &&
  params.available.size === 1;

const hasPainAreaSignal = (context: SelectionContext, tokens: string[]) => {
  const normalizedTokens = new Set(tokens.map(normalizeTagToken));
  return context.painAreas.some((area) => {
    const normalizedArea = normalizeTagToken(area);
    return Array.from(normalizedTokens).some((token) => normalizedArea.includes(token));
  });
};

const hasUpperPainSignal = (context: SelectionContext) =>
  hasPainAreaSignal(context, ["shoulder", "neck", "upper_back", "upper back"]);

const hasLowBackPainSignal = (context: SelectionContext) =>
  hasPainAreaSignal(context, ["lower_back", "low_back", "back"]);

const shouldApplyPainAwareMainIdentityProtection = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  if (params.context.painAreas.length === 0 && params.context.painSeverity === "low") {
    return false;
  }
  if (!hasUpperPainSignal(params.context) && !hasLowBackPainSignal(params.context)) {
    return false;
  }
  return (
    params.available.has("bands") ||
    params.available.has("dumbbells") ||
    params.available.has("gym") ||
    hasGymLikeUpperImplementAvailability(params.available)
  );
};

const shouldApplyMainIdentityProtection = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) =>
  isGymNoPainSelectionContext(params) ||
  shouldApplyDefaultGeneralFitnessNoPainRoleStrictness(params) ||
  shouldApplyPainAwareMainIdentityProtection(params);

const shouldApplyFinalRoleLegality = (params: {
  available: Set<Equipment>;
  context: SelectionContext;
}) =>
  shouldApplyMainIdentityProtection(params) ||
  shouldApplyBodyweightMainIdentityProtection(params);

const isPushupPatternExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("pushup") || descriptor.includes("push-up");
};

const isVeryLowLoadPushupVariantExercise = (exercise: Exercise) => {
  if (!isPushupPatternExercise(exercise)) return false;
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.variantKey ?? ""}`.toLowerCase();
  return (
    descriptor.includes("wall") ||
    descriptor.includes("countertop") ||
    descriptor.includes("incline") ||
    descriptor.includes("hands-elevated") ||
    descriptor.includes("hands elevated")
  );
};

const isScapularYTRaiseFamilyExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    descriptor.includes("y-raise") ||
    descriptor.includes("y raise") ||
    descriptor.includes("t-raise") ||
    descriptor.includes("t raise") ||
    descriptor.includes("ytw") ||
    descriptor.includes("prone-y") ||
    descriptor.includes("prone y") ||
    descriptor.includes("prone-t") ||
    descriptor.includes("prone t")
  );
};

const isSelfOrPartnerResistedStyleArmExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    descriptor.includes("self-resisted") ||
    descriptor.includes("self resisted") ||
    descriptor.includes("partner-resisted") ||
    descriptor.includes("partner resisted") ||
    descriptor.includes("towel")
  );
};

const isShouldersArmsIsoArmExercise = (exercise: Exercise) => {
  const variant = resolveShouldersArmsExerciseVariantKey(exercise);
  if (exercise.loadType === "timed") return true;
  if (variant === "iso_hold") return true;
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.variantKey ?? ""}`.toLowerCase();
  return descriptor.includes("iso") || descriptor.includes("isometric");
};

const resolveShouldersArmsArmEquipmentPreferenceRank = (exercise: Exercise) => {
  if (exercise.equipment.includes("machines") || exercise.equipment.includes("cables")) return 4;
  if (exercise.equipment.includes("dumbbells") || exercise.equipment.includes("barbell")) {
    return 3;
  }
  if (exercise.equipment.includes("bands")) return 2;
  return 1;
};

const isShouldersArmsFacePullMainLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeTagToken(exercise.familyKey ?? "");
  return (
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    family === "face_pull" ||
    family === "facepull"
  );
};

const isShouldersArmsExternalRotationMainLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeTagToken(exercise.familyKey ?? "");
  return (
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    family === "external_rotation" ||
    family === "externalrotation"
  );
};

const isShouldersArmsRowOrVerticalPullMainLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeTagToken(exercise.familyKey ?? "");
  return (
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup") ||
    family.includes("row") ||
    family.includes("pulldown") ||
    family.includes("pull_down") ||
    family.includes("pullup") ||
    family.includes("pull_up") ||
    family.includes("chinup") ||
    family.includes("chin_up") ||
    hasVerticalPullSignature(exercise)
  );
};

const isShouldersArmsCarryMainLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeTagToken(exercise.familyKey ?? "");
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  return (
    patterns.has("carry") ||
    tags.has("carry") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("farmer") ||
    family.includes("carry")
  );
};

const isShouldersArmsArmMainLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeTagToken(exercise.familyKey ?? "");
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  return (
    patterns.has("curl") ||
    patterns.has("extension") ||
    descriptor.includes("curl") ||
    descriptor.includes("biceps") ||
    descriptor.includes("triceps") ||
    descriptor.includes("pressdown") ||
    family.includes("biceps") ||
    family.includes("triceps") ||
    tags.has("biceps") ||
    tags.has("triceps")
  );
};

const isShouldersArmsRearDeltMainExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle))
  );
  if (isShouldersArmsFacePullMainLeakExercise(exercise)) return false;
  if (isShouldersArmsExternalRotationMainLeakExercise(exercise)) return false;
  return (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck") ||
    tags.has("reardelt") ||
    tags.has("rear_delt") ||
    muscles.has("rear_delts")
  );
};

const isShouldersArmsSupportMainExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const familyKey = normalizeTagToken(exercise.familyKey ?? "");
  const supportDescriptor =
    descriptor.includes("y raise") ||
    descriptor.includes("y-raise") ||
    descriptor.includes("t raise") ||
    descriptor.includes("t-raise") ||
    descriptor.includes("prone t") ||
    descriptor.includes("prone-t") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("snow-angel") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("scaption") ||
    descriptor.includes("shoulder plane raise") ||
    descriptor.includes("shoulder-plane raise") ||
    descriptor.includes("arnold press") ||
    descriptor.includes("landmine press");
  const supportFamily = familyKey === "scap_support";
  const clearlyDisallowedForMainSupport =
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    isShouldersArmsFacePullMainLeakExercise(exercise) ||
    isShouldersArmsExternalRotationMainLeakExercise(exercise) ||
    isShouldersArmsRowOrVerticalPullMainLeakExercise(exercise) ||
    isShouldersArmsCarryMainLeakExercise(exercise) ||
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup") ||
    descriptor.includes("curl") ||
    descriptor.includes("pressdown") ||
    descriptor.includes("extension") ||
    descriptor.includes("triceps");
  return !clearlyDisallowedForMainSupport && (supportDescriptor || supportFamily);
};

type ShouldersArmsRearDeltSubtype = "fly" | "row" | "other";

const resolveShouldersArmsRearDeltSubtype = (
  exercise: Exercise
): ShouldersArmsRearDeltSubtype => {
  if (!isShouldersArmsRearDeltMainExercise(exercise)) return "other";
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const flyPattern =
    descriptor.includes("fly") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck");
  if (flyPattern) return "fly";
  const rowPattern =
    descriptor.includes("row") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    hasHorizontalPullSignature(exercise) ||
    patterns.has("horizontalpull") ||
    patterns.has("pull");
  if (rowPattern) return "row";
  return "other";
};

const resolveShouldersArmsMainCategory = (
  exercise: Exercise
): ShouldersArmsMainCategory => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const hasPullPattern =
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("horizontal_pull") ||
    patterns.has("verticalpull") ||
    patterns.has("vertical_pull");
  const descriptorIndicatesPull =
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup");

  if (
    patterns.has("lateralraise") ||
    patterns.has("lateral_raise") ||
    descriptor.includes("lateral raise") ||
    descriptor.includes("lateral-raise") ||
    tags.has("lateraldelt") ||
    tags.has("lateral_delt")
  ) {
    return "lateral";
  }
  if (isShouldersArmsSupportMainExercise(exercise)) return "shoulderSupport";
  if (isShouldersArmsRearDeltMainExercise(exercise)) return "rearDeltMain";

  if (descriptor.includes("upright row")) return "uprightRow";
  if (
    (patterns.has("curl") || descriptor.includes("curl")) &&
    !hasPullPattern &&
    !descriptorIndicatesPull
  ) {
    return "biceps";
  }
  if (tags.has("biceps") && !hasPullPattern && !descriptorIndicatesPull) return "biceps";
  if (
    (patterns.has("extension") ||
      tags.has("triceps") ||
      descriptor.includes("triceps") ||
      descriptor.includes("pressdown") ||
      descriptor.includes("extension")) &&
    !descriptorIndicatesPull
  ) {
    return "triceps";
  }
  if (
    patterns.has("verticalpush") ||
    descriptor.includes("shoulder press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("pike push-up") ||
    descriptor.includes("pike-pushup")
  ) {
    return "ohp";
  }
  return "other";
};

const isShouldersArmsMainBoundaryEligible = (exercise: Exercise) => {
  if (exercise.category !== "main") return false;
  if (isBackChestLowerBodyLeakExercise(exercise)) return false;
  if (hasVerticalPullSignature(exercise)) return false;
  if (isShouldersArmsRowOrVerticalPullMainLeakExercise(exercise)) return false;
  if (isShouldersArmsFacePullMainLeakExercise(exercise)) return false;
  if (isShouldersArmsExternalRotationMainLeakExercise(exercise)) return false;
  if (isShouldersArmsArmMainLeakExercise(exercise)) return false;
  if (isShouldersArmsCarryMainLeakExercise(exercise)) return false;
  const category = resolveShouldersArmsMainCategory(exercise);
  if (category === "rearDeltMain" && resolveShouldersArmsRearDeltSubtype(exercise) === "row") {
    return false;
  }
  if (
    hasHorizontalPullSignature(exercise) &&
    category !== "rearDeltMain" &&
    category !== "shoulderSupport"
  ) {
    return false;
  }
  if (
    category !== "ohp" &&
    category !== "lateral" &&
    category !== "rearDeltMain" &&
    category !== "shoulderSupport"
  ) {
    return false;
  }
  if (isChestDominantHorizontalPush(exercise)) return false;
  return true;
};

const resolveShouldersArmsArmStimulusKey = (
  exercise: Exercise,
  role: ShouldersArmsArmRole
) => {
  const armLineVariant = resolveShouldersArmsArmLineVariant(exercise, role);
  const family = resolveShouldersArmsExerciseFamilyKey(exercise);
  const variant = resolveShouldersArmsExerciseVariantKey(exercise);
  return `${role}::${family}::${variant}::${armLineVariant}::${exercise.loadType}`;
};

const isShouldersArmsArmIsolationForRole = (
  exercise: Exercise,
  role: ShouldersArmsArmRole
) => {
  const category = resolveShouldersArmsMainCategory(exercise);
  if (category !== role) return false;
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (role === "biceps") {
    return patterns.has("curl") || tags.has("isolation") || descriptor.includes("curl");
  }
  return (
    patterns.has("extension") ||
    tags.has("isolation") ||
    descriptor.includes("triceps") ||
    descriptor.includes("pressdown") ||
    descriptor.includes("extension")
  );
};

const isShouldersArmsAccessoryRearDelt = (exercise: Exercise) =>
  isShouldersArmsRearDeltMainExercise(exercise);

const isShouldersArmsAccessoryExternalScap = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  return (
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    patterns.has("scapular") ||
    patterns.has("externalrotation") ||
    tags.has("scapular") ||
    tags.has("external_rotation") ||
    tags.has("externalrotation")
  );
};

const resolveShouldersArmsAccessoryFamilyKey = (exercise: Exercise) => {
  if (exercise.familyKey?.trim()) return normalizeTagToken(exercise.familyKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("face pull") || descriptor.includes("face-pull")) return "face_pull";
  if (descriptor.includes("rear delt") || descriptor.includes("rear-delt")) return "rear_delt";
  if (descriptor.includes("external rotation") || descriptor.includes("external-rotation")) {
    return "external_rotation";
  }
  if (descriptor.includes("pull-apart") || descriptor.includes("pull apart")) return "pull_apart";
  return normalizeTagToken(exercise.id);
};

const chooseDeterministicTopScoredExercise = (
  scoredEntries: Array<{ exercise: Exercise; score: number }>,
  rng?: RandomFn,
  options?: {
    useVariationBand?: boolean;
    variationConfig?: ProgramVariationConfig;
    variationSeedToken?: string;
  }
) => {
  if (!scoredEntries.length) return null;
  const rankedEntries = [...scoredEntries].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.exercise.id.localeCompare(right.exercise.id);
  });
  const variationBandEnabled = Boolean(options?.useVariationBand);
  if (variationBandEnabled) {
    const topBand = getProgramVariationBandForRankedEntries(
      rankedEntries,
      options?.variationConfig ?? DEFAULT_PROGRAM_VARIATION_CONFIG
    );
    const chosen = pickFromProgramVariationBand(topBand, {
      rng,
      deterministicSeed: options?.variationSeedToken,
    });
    if (chosen) return chosen.exercise;
  }
  const maxScore = rankedEntries[0]?.score ?? Number.NEGATIVE_INFINITY;
  const topEntries = rankedEntries.filter((entry) => entry.score === maxScore);
  if (topEntries.length === 1) return topEntries[0]?.exercise ?? null;
  if (rng) {
    const index = Math.floor(rng() * topEntries.length);
    return topEntries[Math.max(0, Math.min(topEntries.length - 1, index))]?.exercise ?? null;
  }
  return topEntries[0]?.exercise ?? null;
};

const SHOULDERS_ARMS_ANCHOR_POOLS: Record<
  ShouldersArmsAnchorRole,
  Record<ProgramPhaseStage, string[]>
> = {
  ohp: {
    activation: [
      "machine-shoulder-press",
      "dumbbell-shoulder-press",
      "band-overhead-press",
      "pike-pushup",
      "suspension-pike-press-upright",
    ],
    skill: [
      "dumbbell-shoulder-press",
      "machine-shoulder-press",
      "dumbbell-arnold-press",
      "band-overhead-press",
      "suspension-pike-press-incline",
      "pike-pushup",
    ],
    growth: [
      "barbell-strict-press",
      "barbell-push-press",
      "dumbbell-shoulder-press",
      "dumbbell-arnold-press",
      "machine-shoulder-press",
      "suspension-pike-press-deep",
      "pike-pushup",
      "band-overhead-press",
    ],
  },
  lateral: {
    activation: [
      "dumbbell-lateral-raise",
      "band-lateral-raise",
      "prone-t-raise",
    ],
    skill: [
      "cable-lateral-raise",
      "dumbbell-lateral-raise",
      "band-lateral-raise",
      "prone-t-raise",
    ],
    growth: [
      "cable-lateral-raise",
      "dumbbell-lateral-raise",
      "band-lateral-raise",
      "prone-t-raise",
    ],
  },
  biceps: {
    activation: [
      "db-biceps-curl",
      "band-biceps-curl",
      "towel-biceps-curl-hold",
      "self-resisted-biceps-curl",
    ],
    skill: [
      "hammer-curl",
      "db-biceps-curl",
      "single-arm-band-biceps-curl",
      "band-biceps-curl",
      "towel-biceps-curl-hold",
      "self-resisted-biceps-curl",
    ],
    growth: [
      "hammer-curl",
      "cable-biceps-curl",
      "db-biceps-curl",
      "single-arm-band-biceps-curl",
      "band-biceps-curl",
      "towel-biceps-curl-hold",
      "self-resisted-biceps-curl",
    ],
  },
  triceps: {
    activation: [
      "band-triceps-pressdown",
      "db-triceps-extension",
      "dumbbell-triceps-kickback",
      "bodyweight-triceps-extension",
      "self-resisted-triceps-extension",
      "close-grip-pushup",
    ],
    skill: [
      "db-triceps-extension",
      "dumbbell-triceps-kickback",
      "band-triceps-pressdown",
      "band-overhead-triceps-extension",
      "overhead-cable-triceps-extension",
      "bodyweight-triceps-extension",
      "self-resisted-triceps-extension",
      "close-grip-pushup",
    ],
    growth: [
      "overhead-cable-triceps-extension",
      "db-triceps-extension",
      "dumbbell-triceps-kickback",
      "band-overhead-triceps-extension",
      "band-triceps-pressdown",
      "bodyweight-triceps-extension",
      "self-resisted-triceps-extension",
      "close-grip-pushup",
    ],
  },
};

const SHOULDERS_ARMS_REAR_DELT_MAIN_POOL_BY_PHASE: Record<
  ProgramPhaseStage,
  string[]
> = {
  activation: [
    "machine-reverse-pec-deck",
    "dumbbell-rear-delt-fly",
    "band-rear-delt-fly",
    "cable-rear-delt-fly",
    "reverse-snow-angel",
  ],
  skill: [
    "cable-rear-delt-fly",
    "machine-reverse-pec-deck",
    "dumbbell-rear-delt-fly",
    "band-rear-delt-fly",
    "reverse-snow-angel",
  ],
  growth: [
    "cable-rear-delt-fly",
    "dumbbell-rear-delt-fly",
    "machine-reverse-pec-deck",
    "band-rear-delt-fly",
    "reverse-snow-angel",
  ],
};

const SHOULDERS_ARMS_SUPPORT_MAIN_POOL_BY_PHASE: Record<ProgramPhaseStage, string[]> = {
  activation: [
    "prone-y-raise",
    "prone-swimmer",
    "reverse-snow-angel",
  ],
  skill: [
    "prone-y-raise",
    "prone-swimmer",
    "reverse-snow-angel",
  ],
  growth: [
    "prone-y-raise",
    "prone-swimmer",
    "reverse-snow-angel",
  ],
};

const SHOULDERS_ARMS_SUPPORT_MAIN_ALT_POOL_BY_PHASE: Record<
  ProgramPhaseStage,
  string[]
> = {
  activation: [
    "prone-swimmer",
    "reverse-snow-angel",
    "prone-y-raise",
  ],
  skill: [
    "reverse-snow-angel",
    "prone-swimmer",
    "prone-y-raise",
  ],
  growth: [
    "prone-swimmer",
    "reverse-snow-angel",
    "prone-y-raise",
  ],
};

const SHOULDERS_ARMS_ACCESSORY_POOL: Record<ShouldersArmsAccessoryRole, string[]> = {
  rearDelt: [
    "machine-reverse-pec-deck",
    "machine-rear-delt-row",
    "cable-rear-delt-fly",
    "dumbbell-rear-delt-fly",
    "band-rear-delt-fly",
    "suspension-rear-delt-row",
    "reverse-snow-angel",
  ],
  externalScap: [
    "cable-face-pull",
    "face-pull",
    "band-face-pull-high-anchor",
    "suspension-face-pull",
    "cable-external-rotation-pressout",
    "cable-external-rotation",
    "band-external-rotation",
    "machine-shoulder-external-rotation",
    "dumbbell-side-lying-external-rotation",
    "prone-y-raise",
    "band-pull-aparts",
  ],
};

const resolveShouldersArmsRoleFromCategory = (
  category: ShouldersArmsMainCategory
): ShouldersArmsAnchorRole | null => {
  if (category === "ohp") return "ohp";
  if (category === "lateral") return "lateral";
  if (category === "biceps") return "biceps";
  if (category === "triceps") return "triceps";
  return null;
};

const getShouldersArmsDayFromWeek = (week?: ProgramDay[]) =>
  week?.find((entry) => isShouldersArmsDayTitle(entry.title)) ?? null;

const selectShouldersArmsMainExercise = (params: {
  role: ShouldersArmsAnchorRole | ShouldersArmsSecondaryRole;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
  disallowIds?: Set<string>;
  preferredCategory?: ShouldersArmsMainCategory;
  dayTitle?: string;
}): Exercise | null => {
  const { role, context, usedIds, disallowIds, preferredCategory, dayTitle } = params;
  const phaseStage = context.selectionContext.phaseStage;
  const goalType = normalizeShouldersArmsGoal(context.selectionContext.goal);
  const anchorRole =
    role === "rearDeltMain" ||
    role === "shoulderSupportMain" ||
    role === "shoulderSupportMainAlt"
      ? null
      : (role as ShouldersArmsAnchorRole);
  const basePhaseIds =
    role === "rearDeltMain"
      ? SHOULDERS_ARMS_REAR_DELT_MAIN_POOL_BY_PHASE[phaseStage]
      : role === "shoulderSupportMain"
      ? SHOULDERS_ARMS_SUPPORT_MAIN_POOL_BY_PHASE[phaseStage]
      : role === "shoulderSupportMainAlt"
      ? SHOULDERS_ARMS_SUPPORT_MAIN_ALT_POOL_BY_PHASE[phaseStage]
      : SHOULDERS_ARMS_ANCHOR_POOLS[role as ShouldersArmsAnchorRole][phaseStage];
  const phaseIds =
    role === "ohp" &&
    phaseStage === "activation" &&
    context.selectionContext.experienceLevel !== "beginner" &&
    context.selectionContext.painSeverity === "low"
      ? [
          "dumbbell-shoulder-press",
          "band-overhead-press",
          "machine-shoulder-press",
          "pike-pushup",
          "suspension-pike-press-upright",
        ]
      : basePhaseIds;

  const fromSeedPool = phaseIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => {
      const category = resolveShouldersArmsMainCategory(exercise);
      if (role === "rearDeltMain") return category === "rearDeltMain";
      if (role === "shoulderSupportMain" || role === "shoulderSupportMainAlt") {
        return category === "shoulderSupport";
      }
      return resolveShouldersArmsRoleFromCategory(category) === anchorRole;
    });
  const fallbackPool = exercises.filter((exercise) => {
    if (!isShouldersArmsMainBoundaryEligible(exercise)) return false;
    const category = resolveShouldersArmsMainCategory(exercise);
    if (role === "rearDeltMain") return category === "rearDeltMain";
    if (role === "shoulderSupportMain" || role === "shoulderSupportMainAlt") {
      return category === "shoulderSupport";
    }
    return resolveShouldersArmsRoleFromCategory(category) === anchorRole;
  });

  const orderedPool = Array.from(new Set([...fromSeedPool, ...fallbackPool]));
  const candidates = orderedPool
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => !disallowIds?.has(exercise.id))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "main",
        context: context.selectionContext,
        dayTitle,
      })
    );

  const pickFrom = (pool: Exercise[]) => {
    if (!pool.length) return null;
    const orderedPool = [...pool].sort((left, right) => left.id.localeCompare(right.id));
    const hasHighImplementAvailability =
      context.available.has("machines") ||
      context.available.has("cables") ||
      context.available.has("dumbbells");
    const shoulderFocusedMainRole =
      role === "ohp" ||
      role === "lateral" ||
      role === "rearDeltMain" ||
      role === "shoulderSupportMain";
    const gymLikeIntermediateShoulderContext =
      shoulderFocusedMainRole &&
      hasGymLikeUpperImplementAvailability(context.available) &&
      context.selectionContext.experienceLevel !== "beginner";
    const scoredEntries = orderedPool
      .map((exercise) => {
        const category = resolveShouldersArmsMainCategory(exercise);
        const orderedIndex = Math.max(0, phaseIds.indexOf(exercise.id));
        let score = scoreExerciseForContext(
          exercise,
          "main",
          context.selectionContext,
          context.available
        );
        score += phaseIds.includes(exercise.id) ? (phaseIds.length - orderedIndex) * 4 : 0;
        if (preferredCategory && category === preferredCategory) score += 2;
        if (goalType === "improvePosture") {
          if (
            category === "triceps" &&
            (exercise.id.includes("pressdown") || exercise.id.includes("extension"))
          ) {
            score += 1;
          }
          if (category === "rearDeltMain") score += 1.5;
          if (category === "shoulderSupport") score += 2.25;
        }
        if (goalType === "reducePain") {
          const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
          if (exercise.equipment.includes("machines")) score += 2;
          if (descriptor.includes("single-arm") || descriptor.includes("single arm")) score -= 1;
          if (descriptor.includes("iso")) score += 0.5;
        }
        if (goalType === "athleticPerformance") {
          const variant = resolveShouldersArmsExerciseVariantKey(exercise);
          if (variant === "single_arm" || variant === "split_stance") score += 1.25;
          if (variant === "iso_hold") score -= 0.5;
        }
        if (hasHighImplementAvailability) {
          const usesOnlyBands =
            exercise.equipment.includes("bands") &&
            !exercise.equipment.includes("dumbbells") &&
            !exercise.equipment.includes("machines") &&
            !exercise.equipment.includes("cables");
          if (context.selectionContext.experienceLevel === "beginner") {
            if (usesOnlyBands) score -= 1;
            if (exercise.equipment.includes("machines")) score += 0.75;
            if (exercise.equipment.includes("dumbbells")) score += 0.5;
          } else {
            if (exercise.equipment.includes("cables")) score += 0.6;
            if (exercise.equipment.includes("dumbbells")) score += 0.6;
            if (
              context.selectionContext.experienceLevel === "advanced" &&
              phaseStage === "growth" &&
              exercise.equipment.includes("barbell")
            ) {
              score += 0.5;
            }
            if (exercise.equipment.includes("machines") && phaseStage === "activation") {
              score += 0.25;
            }
            if (usesOnlyBands && phaseStage === "growth") {
              score -= 0.25;
            }
          }
        }
        if (phaseStage === "activation" && exercise.tier && exercise.tier > 2) score -= 2;
        if (phaseStage === "growth" && exercise.tier && exercise.tier >= 2) score += 1;
        if (
          gymLikeIntermediateShoulderContext &&
          isScapularYTRaiseFamilyExercise(exercise) &&
          orderedPool.some(
            (candidate) =>
              candidate.id !== exercise.id &&
              !isScapularYTRaiseFamilyExercise(candidate)
          )
        ) {
          score -= 9;
        }
        return { exercise, score };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.exercise.id.localeCompare(right.exercise.id);
      });
    return chooseDeterministicTopScoredExercise(scoredEntries, context.selectionRng, {
      useVariationBand: Boolean(context.selectionContext.variationState?.enabled),
      variationConfig:
        context.selectionContext.variationState?.config ?? DEFAULT_PROGRAM_VARIATION_CONFIG,
      variationSeedToken: context.selectionContext.variationState?.enabled
        ? [
            context.selectionContext.variationState.seedKey,
            "shoulders-arms-main",
            role,
            scoredEntries
              .map((entry) => `${entry.exercise.id}:${entry.score.toFixed(2)}`)
              .join("|"),
          ].join("|")
        : undefined,
    });
  };

  const best = pickFrom(candidates);
  if (best) return best;
  if (disallowIds?.size) {
    const relaxed = orderedPool
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle,
        })
      );
    return pickFrom(relaxed);
  }
  return null;
};

const selectShouldersArmsAccessoryExercise = (params: {
  role: ShouldersArmsAccessoryRole;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
  usedFamilyKeys: Set<string>;
  disallowIds?: Set<string>;
}): Exercise | null => {
  const { role, context, usedIds, usedFamilyKeys, disallowIds } = params;
  const poolIds = SHOULDERS_ARMS_ACCESSORY_POOL[role];
  const pool = poolIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => !disallowIds?.has(exercise.id))
    .filter((exercise) => {
      const family = resolveShouldersArmsAccessoryFamilyKey(exercise);
      return !usedFamilyKeys.has(family);
    })
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      })
    );
  if (!pool.length) return null;
  const orderedPool = [...pool].sort((left, right) => left.id.localeCompare(right.id));
  const scoredEntries = orderedPool
    .map((exercise) => {
      let score = scoreExerciseForContext(
        exercise,
        "accessory",
        context.selectionContext,
        context.available
      );
      if (role === "rearDelt" && isShouldersArmsAccessoryRearDelt(exercise)) score += 2;
      if (role === "externalScap" && isShouldersArmsAccessoryExternalScap(exercise)) score += 2;
      if (context.selectionContext.phaseStage === "growth" && exercise.loadType === "weighted") {
        score += 1;
      }
      return { exercise, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });
  return chooseDeterministicTopScoredExercise(scoredEntries, context.selectionRng, {
    useVariationBand: Boolean(context.selectionContext.variationState?.enabled),
    variationConfig:
      context.selectionContext.variationState?.config ?? DEFAULT_PROGRAM_VARIATION_CONFIG,
    variationSeedToken: context.selectionContext.variationState?.enabled
      ? [
          context.selectionContext.variationState.seedKey,
          "shoulders-arms-accessory",
          role,
          scoredEntries
            .map((entry) => `${entry.exercise.id}:${entry.score.toFixed(2)}`)
            .join("|"),
        ].join("|")
      : undefined,
  });
};

const selectShouldersArmsArmAccessoryExercise = (params: {
  role: ShouldersArmsArmRole;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
  usedStimulusKeys: Set<string>;
  enforceUniqueStimulus?: boolean;
  disallowIds?: Set<string>;
  auditMeta?: SelectionAuditMeta;
}): Exercise | null => {
  const {
    role,
    context,
    usedIds,
    usedStimulusKeys,
    enforceUniqueStimulus = true,
    disallowIds,
    auditMeta,
  } = params;
  const gymAccessoryEnvironment =
    context.available.has("machines") ||
    context.available.has("cables") ||
    context.available.has("dumbbells");
  const phaseStage = context.selectionContext.phaseStage;
  const applySoftHistoryDiversity = phaseStage === "skill" || phaseStage === "growth";
  const recentImplementClasses = new Set<ShouldersArmsArmImplementClass>();
  const recentArmLineVariants = new Set<ShouldersArmsArmLineVariant>();
  const collectRecentTraits = (exercise: Exercise) => {
    if (!isShouldersArmsArmIsolationForRole(exercise, role)) return;
    recentImplementClasses.add(resolveShouldersArmsArmImplementClass(exercise));
    recentArmLineVariants.add(resolveShouldersArmsArmLineVariant(exercise, role));
  };
  context.selectionContext.recentlyUsedExerciseIds.forEach((exerciseId) => {
    const recentExercise = exerciseById(exerciseId);
    if (!recentExercise) return;
    collectRecentTraits(recentExercise);
  });
  (context.previousWeek ?? []).forEach((day) => {
    day.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .forEach((exercise) => collectRecentTraits(exercise));
  });
  const candidates = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => !disallowIds?.has(exercise.id))
    .filter((exercise) => !isBackChestLowerBodyLeakExercise(exercise))
    .filter((exercise) => !isChestDominantHorizontalPush(exercise))
    .filter((exercise) => !isShouldersArmsCarryMainLeakExercise(exercise))
    .filter((exercise) => isShouldersArmsArmIsolationForRole(exercise, role))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
      })
    )
    .filter((exercise) =>
      enforceUniqueStimulus
        ? !usedStimulusKeys.has(resolveShouldersArmsArmStimulusKey(exercise, role))
        : true
    );

  if (!candidates.length) return null;

  const hasWeightedAlternative = candidates.some((exercise) => exercise.loadType === "weighted");
  const filteredCandidates = candidates.filter((exercise) => {
    if (gymAccessoryEnvironment && isSelfOrPartnerResistedStyleArmExercise(exercise)) {
      return false;
    }
    if (
      hasWeightedAlternative &&
      (isSelfOrPartnerResistedStyleArmExercise(exercise) ||
        isShouldersArmsIsoArmExercise(exercise))
    ) {
      return false;
    }
    return true;
  });
  const effectiveCandidates = filteredCandidates.length ? filteredCandidates : candidates;

  const orderedCandidates = [...effectiveCandidates].sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  const scoredEntries = orderedCandidates
    .map((exercise) => {
      const patterns = new Set(
        (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
      );
      let score = scoreExerciseForContextDetailed(
        exercise,
        "accessory",
        context.selectionContext,
        context.available,
        auditMeta
      ).score;
      const equipmentPreferenceRank = resolveShouldersArmsArmEquipmentPreferenceRank(exercise);
      score += equipmentPreferenceRank * 2;
      if (exercise.loadType === "weighted") score += 1.5;
      if (applySoftHistoryDiversity) {
        const implementClass = resolveShouldersArmsArmImplementClass(exercise);
        const armLineVariant = resolveShouldersArmsArmLineVariant(exercise, role);
        const implementRepeatPenalty = phaseStage === "skill" ? 0.8 : 1.1;
        const variantRepeatPenalty = phaseStage === "skill" ? 0.6 : 0.9;
        score += recentImplementClasses.has(implementClass) ? -implementRepeatPenalty : 0.3;
        score += recentArmLineVariants.has(armLineVariant) ? -variantRepeatPenalty : 0.3;
      }
      if (role === "triceps" && patterns.has("extension")) score += 2;
      if (role === "biceps" && patterns.has("curl")) score += 2;
      if (role === "biceps" && gymAccessoryEnvironment) {
        const cableBonus =
          phaseStage === "growth" ? 0.8 : phaseStage === "skill" ? 1.2 : 2;
        const dumbbellBonus =
          phaseStage === "growth" ? 1.3 : phaseStage === "skill" ? 1.2 : 1.5;
        if (exercise.equipment.includes("cables")) score += cableBonus;
        if (exercise.equipment.includes("dumbbells")) score += dumbbellBonus;
        if (
          !exercise.equipment.includes("cables") &&
          !exercise.equipment.includes("dumbbells")
        ) {
          score -= 1;
        }
      }
      if (role === "triceps" && gymAccessoryEnvironment) {
        if (exercise.equipment.includes("cables")) score += 1.3;
        if (exercise.equipment.includes("dumbbells")) score += 1.1;
      }
      if (context.selectionContext.phaseStage === "growth" && exercise.loadType === "weighted") {
        score += 1;
      }
      return { exercise, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.exercise.id.localeCompare(right.exercise.id);
    });
  return chooseDeterministicTopScoredExercise(scoredEntries, context.selectionRng, {
    useVariationBand: Boolean(context.selectionContext.variationState?.enabled),
    variationConfig:
      context.selectionContext.variationState?.config ?? DEFAULT_PROGRAM_VARIATION_CONFIG,
    variationSeedToken: context.selectionContext.variationState?.enabled
      ? [
          context.selectionContext.variationState.seedKey,
          "shoulders-arms-arm-accessory",
          role,
          scoredEntries
            .map((entry) => `${entry.exercise.id}:${entry.score.toFixed(2)}`)
            .join("|"),
        ].join("|")
      : undefined,
  });
};

const resolveShouldersArmsAccessoryRepRange = (phaseStage: ProgramPhaseStage) =>
  phaseStage === "growth" ? "8-12" : "10-15";

const repairShouldersArmsDayIntelligence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { day: ProgramDay; warnings: string[] } => {
  const { day, daysPerWeek, context } = params;
  if (daysPerWeek !== 3 || !isShouldersArmsDayTitle(day.title)) return { day, warnings: [] };

  const warnings: string[] = [];
  const phaseStage = context.selectionContext.phaseStage;
  const experienceLevel = context.selectionContext.experienceLevel;
  const threeDayBlueprint = resolveThreeDayBlueprint({
    dayTitle: day.title,
    selectionContext: context.selectionContext,
    available: context.available,
  });
  const targetMainCount =
    threeDayBlueprint?.mainCount ?? resolveShouldersArmsTargetMainCount(experienceLevel);
  const targetAccessoryCount =
    threeDayBlueprint?.accessoryCount ??
    resolveShouldersArmsTargetAccessoryCount(experienceLevel);
  const phaseIndex = phaseIndexFromStage(phaseStage);
  const experienceForProfile: ExperienceLevel =
    experienceLevel === "advanced"
      ? "Advanced"
      : experienceLevel === "intermediate"
      ? "Intermediate"
      : "Beginner";
  const profile = getExperienceProfile(
    experienceForProfile,
    context.selectionContext.goal,
    phaseIndex
  );
  const anchorMainRoles: Array<"ohp" | "lateral"> = ["ohp", "lateral"];
  const extraMainCount = Math.max(0, targetMainCount - anchorMainRoles.length);
  const previousDay = getShouldersArmsDayFromWeek(context.previousWeek);
  const previousMainByRole = new Map<
    ShouldersArmsAnchorRole | ShouldersArmsSecondaryRole,
    string
  >();
  const previousMainExercises = previousDay
    ? previousDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    : [];
  previousMainExercises.forEach((exercise) => {
    const category = resolveShouldersArmsMainCategory(exercise);
    const role = resolveShouldersArmsRoleFromCategory(category);
    if (role && !previousMainByRole.has(role)) previousMainByRole.set(role, exercise.id);
    if (category === "rearDeltMain" && !previousMainByRole.has("rearDeltMain")) {
      previousMainByRole.set("rearDeltMain", exercise.id);
    }
    if (category === "shoulderSupport" && !previousMainByRole.has("shoulderSupportMain")) {
      previousMainByRole.set("shoulderSupportMain", exercise.id);
      previousMainByRole.set("shoulderSupportMainAlt", exercise.id);
    }
  });

  const usedMainIds = new Set<string>();
  const usedMainStimulusKeys = new Set<string>();
  const selectedMainExercises: Exercise[] = [];
  const selectedMainCategoryCounts: Record<
    Exclude<ShouldersArmsMainCategory, "other">,
    number
  > = {
    ohp: 0,
    lateral: 0,
    biceps: 0,
    triceps: 0,
    rearDeltMain: 0,
    shoulderSupport: 0,
    uprightRow: 0,
  };

  const hasEligibleRearDeltNonFlyAlternative = (excludeId?: string) =>
    exercises.some((candidate) => {
      if (candidate.category !== "main") return false;
      if (candidate.id === excludeId) return false;
      if (usedMainIds.has(candidate.id)) return false;
      if (!isShouldersArmsMainBoundaryEligible(candidate)) return false;
      if (resolveShouldersArmsMainCategory(candidate) !== "rearDeltMain") return false;
      if (resolveShouldersArmsRearDeltSubtype(candidate) === "fly") return false;
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available: context.available,
        section: "main",
        context: context.selectionContext,
        dayTitle: day.title,
      });
    });
  const hasEligibleShoulderSupportAlternative = (excludeId?: string) =>
    exercises.some((candidate) => {
      if (candidate.category !== "main") return false;
      if (candidate.id === excludeId) return false;
      if (usedMainIds.has(candidate.id)) return false;
      if (!isShouldersArmsMainBoundaryEligible(candidate)) return false;
      if (resolveShouldersArmsMainCategory(candidate) !== "shoulderSupport") return false;
      return isExerciseEligibleForProgramContext({
        exercise: candidate,
        available: context.available,
        section: "main",
        context: context.selectionContext,
        dayTitle: day.title,
      });
    });
  const resolveMainStimulusKey = (exercise: Exercise) => {
    const category = resolveShouldersArmsMainCategory(exercise);
    const family = resolveShouldersArmsExerciseFamilyKey(exercise);
    const variant = resolveShouldersArmsExerciseVariantKey(exercise);
    return `${category}::${family}::${variant}::${exercise.loadType}`;
  };
  const hasAnchorMainRole = (
    role: "ohp" | "lateral",
    mainExercises: Exercise[] = selectedMainExercises
  ) => mainExercises.some((exercise) => resolveShouldersArmsMainCategory(exercise) === role);
  const hasAllMainAnchors = (mainExercises: Exercise[] = selectedMainExercises) =>
    anchorMainRoles.every((role) => hasAnchorMainRole(role, mainExercises));

  const canSelectMainExercise = (exercise: Exercise) => {
    if (!isShouldersArmsMainBoundaryEligible(exercise)) return false;
    if (isChestDominantHorizontalPush(exercise)) return false;
    if (isBackChestLowerBodyLeakExercise(exercise)) return false;
    if (hasVerticalPullSignature(exercise)) return false;
    if (isShouldersArmsRowOrVerticalPullMainLeakExercise(exercise)) return false;
    if (isShouldersArmsFacePullMainLeakExercise(exercise)) return false;
    if (isShouldersArmsExternalRotationMainLeakExercise(exercise)) return false;
    if (isShouldersArmsArmMainLeakExercise(exercise)) return false;
    if (isShouldersArmsCarryMainLeakExercise(exercise)) return false;
    if (usedMainIds.has(exercise.id)) return false;
    if (isLegsCarryExercise(exercise)) return false;
    const category = resolveShouldersArmsMainCategory(exercise);
    if (category === "other" || category === "uprightRow") return false;
    if (category === "biceps" || category === "triceps") return false;
    if (selectedMainCategoryCounts[category] >= SHOULDERS_ARMS_MAIN_CATEGORY_CAPS[category]) {
      return false;
    }
    if (category === "rearDeltMain") {
      if (
        selectedMainCategoryCounts.rearDeltMain >= 1 &&
        selectedMainCategoryCounts.shoulderSupport <
          SHOULDERS_ARMS_MAIN_CATEGORY_CAPS.shoulderSupport &&
        hasEligibleShoulderSupportAlternative(exercise.id)
      ) {
        return false;
      }
      const candidateSubtype = resolveShouldersArmsRearDeltSubtype(exercise);
      const selectedRearDeltExercises = selectedMainExercises.filter(
        (entry) => resolveShouldersArmsMainCategory(entry) === "rearDeltMain"
      );
      const selectedRearDeltFlyCount = selectedRearDeltExercises.filter(
        (entry) => resolveShouldersArmsRearDeltSubtype(entry) === "fly"
      ).length;
      const selectedRearDeltNonFlyCount = selectedRearDeltExercises.filter(
        (entry) => resolveShouldersArmsRearDeltSubtype(entry) !== "fly"
      ).length;
      if (
        candidateSubtype === "fly" &&
        selectedRearDeltFlyCount >= 1 &&
        (selectedRearDeltNonFlyCount >= 1 ||
          hasEligibleRearDeltNonFlyAlternative(exercise.id))
      ) {
        return false;
      }
    }
    if (
      hasHorizontalPullSignature(exercise) &&
      category !== "rearDeltMain" &&
      category !== "shoulderSupport"
    ) {
      return false;
    }
    if (
      category === "rearDeltMain" &&
      resolveShouldersArmsRearDeltSubtype(exercise) === "row"
    ) {
      return false;
    }
    const stimulusKey = resolveMainStimulusKey(exercise);
    if (category !== "rearDeltMain" && usedMainStimulusKeys.has(stimulusKey)) return false;
    return true;
  };

  const addSelectedMain = (exercise: Exercise) => {
    const category = resolveShouldersArmsMainCategory(exercise);
    if (category !== "other") {
      selectedMainCategoryCounts[category] += 1;
    }
    usedMainIds.add(exercise.id);
    usedMainStimulusKeys.add(resolveMainStimulusKey(exercise));
    selectedMainExercises.push(exercise);
  };

  const trySelectRole = (params: {
    role: ShouldersArmsAnchorRole | ShouldersArmsSecondaryRole;
    laneLabel: string;
    required: boolean;
    avoidPrevious?: boolean;
  }) => {
    const { role, laneLabel, required, avoidPrevious = true } = params;
    const previousId = avoidPrevious ? previousMainByRole.get(role) : undefined;
    const preferredCategory =
      role === "rearDeltMain"
        ? "rearDeltMain"
        : role === "shoulderSupportMain" || role === "shoulderSupportMainAlt"
        ? "shoulderSupport"
        : (role as ShouldersArmsMainCategory);
    const phaseSpecificDisallow = new Set<string>();
    if (role === "rearDeltMain" && context.capabilityMode === "bandOnly") {
      if (phaseStage === "skill") phaseSpecificDisallow.add("band-rear-delt-fly");
      if (phaseStage === "growth") phaseSpecificDisallow.add("suspension-rear-delt-row");
    }
    const baseDisallowIds = new Set<string>();
    if (previousId) baseDisallowIds.add(previousId);
    phaseSpecificDisallow.forEach((id) => baseDisallowIds.add(id));
    const exhaustedDisallowIds = new Set<string>(baseDisallowIds);
    let candidate: Exercise | null = null;
    while (true) {
      candidate = selectShouldersArmsMainExercise({
        role,
        context,
        usedIds: usedMainIds,
        disallowIds: exhaustedDisallowIds.size ? exhaustedDisallowIds : undefined,
        preferredCategory,
        dayTitle: day.title,
      });
      if (!candidate && exhaustedDisallowIds.size > 0) {
        const relaxedCandidate = selectShouldersArmsMainExercise({
          role,
          context,
          usedIds: usedMainIds,
          preferredCategory,
          dayTitle: day.title,
        });
        if (!relaxedCandidate) {
          candidate = null;
        } else if (exhaustedDisallowIds.has(relaxedCandidate.id)) {
          candidate = null;
        } else {
          candidate = relaxedCandidate;
        }
      }
      if (!candidate) break;
      if (canSelectMainExercise(candidate)) break;
      const sizeBefore = exhaustedDisallowIds.size;
      exhaustedDisallowIds.add(candidate.id);
      if (exhaustedDisallowIds.size === sizeBefore) {
        candidate = null;
        break;
      }
      candidate = null;
    }
    if (!candidate) {
      if (required) {
        warnings.push(`Shoulders + Arms missing required ${laneLabel} anchor candidate.`);
      }
      return false;
    }
    addSelectedMain(candidate);
    return true;
  };

  const tryFillRemainingMainsFromSafeFallback = () => {
    const safeFallbackIds = [
      "machine-shoulder-press",
      "dumbbell-shoulder-press",
      "band-overhead-press",
      "pike-pushup",
      "dumbbell-lateral-raise",
      "band-lateral-raise",
      "prone-t-raise",
      "machine-reverse-pec-deck",
      "cable-rear-delt-fly",
      "dumbbell-rear-delt-fly",
      "band-rear-delt-fly",
      "reverse-snow-angel",
      "prone-y-raise",
      "prone-swimmer",
    ];
    const fallbackPool = Array.from(new Set(safeFallbackIds))
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      )
      .filter((exercise) => canSelectMainExercise(exercise))
      .sort((left, right) => left.id.localeCompare(right.id));
    fallbackPool.forEach((exercise) => {
      if (selectedMainExercises.length >= targetMainCount) return;
      addSelectedMain(exercise);
    });
  };

  const resolveSecondaryRoleFromTemplateSlotKind = (slotKind?: string) => {
    if (slotKind === "mainShoulderPullPrimary") return "rearDeltMain" as const;
    if (slotKind === "mainShoulderStructuralAlternate") {
      return "shoulderSupportMainAlt" as const;
    }
    if (slotKind === "mainShoulderStructuralSecondary") {
      return "shoulderSupportMain" as const;
    }
    return null;
  };

  const templatePlannedSecondaryRoles = (threeDayBlueprint?.mainLanePlan ?? [])
    .map((slot) => resolveSecondaryRoleFromTemplateSlotKind(slot.slotKind))
    .filter((role): role is ShouldersArmsTemplateSecondaryRole => Boolean(role));

  const buildMainSelection = (strictRebuild: boolean) => {
    anchorMainRoles.forEach((role) => {
      trySelectRole({
        role,
        laneLabel: `main_${role}`,
        required: true,
        avoidPrevious: !strictRebuild,
      });
    });

    const defaultExtraRolePriorityByIndex: Array<ShouldersArmsTemplateSecondaryRole[]> = [
      ["rearDeltMain", "shoulderSupportMain", "shoulderSupportMainAlt"],
      ["shoulderSupportMain", "shoulderSupportMainAlt", "rearDeltMain"],
    ];
    for (let index = 0; index < extraMainCount; index += 1) {
      let added = false;
      const primaryTemplateRole = templatePlannedSecondaryRoles[index];
      const rolePriority: ShouldersArmsTemplateSecondaryRole[] = primaryTemplateRole
        ? primaryTemplateRole === "rearDeltMain"
          ? ["rearDeltMain", "shoulderSupportMain", "shoulderSupportMainAlt"]
          : primaryTemplateRole === "shoulderSupportMainAlt"
          ? ["shoulderSupportMainAlt", "shoulderSupportMain", "rearDeltMain"]
          : ["shoulderSupportMain", "shoulderSupportMainAlt", "rearDeltMain"]
        : defaultExtraRolePriorityByIndex[
            Math.min(index, defaultExtraRolePriorityByIndex.length - 1)
          ] ?? [];
      for (const role of rolePriority) {
        if (
          trySelectRole({
            role,
            laneLabel: `extra_${role}`,
            required: false,
            avoidPrevious: !strictRebuild,
          })
        ) {
          added = true;
          break;
        }
      }
      if (!added) break;
    }
    if (selectedMainExercises.length < targetMainCount) {
      tryFillRemainingMainsFromSafeFallback();
    }
  };

  buildMainSelection(false);
  if (!hasAllMainAnchors()) {
    warnings.push("Shoulders + Arms anchor validator triggered strict rebuild.");
  }
  if (!hasAllMainAnchors()) {
    selectedMainExercises.splice(0, selectedMainExercises.length);
    usedMainIds.clear();
    usedMainStimulusKeys.clear();
    selectedMainCategoryCounts.ohp = 0;
    selectedMainCategoryCounts.lateral = 0;
    selectedMainCategoryCounts.biceps = 0;
    selectedMainCategoryCounts.triceps = 0;
    selectedMainCategoryCounts.rearDeltMain = 0;
    selectedMainCategoryCounts.shoulderSupport = 0;
    selectedMainCategoryCounts.uprightRow = 0;
    buildMainSelection(true);
  }
  if (!hasAllMainAnchors()) {
    warnings.push("Shoulders + Arms anchor validator could not restore OHP+lateral anchors.");
  }
  if (selectedMainExercises.length !== targetMainCount) {
    warnings.push(
      `Shoulders + Arms main target mismatch (expected ${targetMainCount}, got ${selectedMainExercises.length}).`
    );
  }

  const previousAccessoryIds = previousDay
    ? previousDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId)
    : [];
  const usedAccessoryIds = new Set<string>(selectedMainExercises.map((exercise) => exercise.id));
  const usedAccessoryStimulusByRole: Record<ShouldersArmsArmRole, Set<string>> = {
    triceps: new Set<string>(),
    biceps: new Set<string>(),
  };
  const accessoryExercises: Exercise[] = [];
  const accessoryRoleOrderFromBlueprint =
    threeDayBlueprint?.accessoryRoles.map((role) => {
      if (role === "tri_iso" || role === "tri_iso_variant") return "triceps";
      if (role === "bi_iso" || role === "bi_iso_variant") return "biceps";
      return null;
    }) ?? [];
  const accessoryRoleOrder: ShouldersArmsArmRole[] = accessoryRoleOrderFromBlueprint
    .filter((role): role is ShouldersArmsArmRole => Boolean(role));
  if (!accessoryRoleOrder.length) {
    const fallbackAccessoryRoleOrder: ShouldersArmsArmRole[] =
      targetAccessoryCount >= 4
        ? ["triceps", "biceps", "triceps", "biceps"]
        : targetAccessoryCount === 3
        ? ["triceps", "biceps", "triceps"]
        : ["triceps", "biceps"];
    accessoryRoleOrder.push(...fallbackAccessoryRoleOrder);
  }
  while (accessoryRoleOrder.length < targetAccessoryCount) {
    accessoryRoleOrder.push(accessoryRoleOrder.length % 2 === 0 ? "triceps" : "biceps");
  }

  const buildArmAccessoryAuditMeta = (
    slotIndex: number,
    role: ShouldersArmsArmRole
  ): SelectionAuditMeta => ({
    slotId: `${normalizeSlotToken(day.title)}-accessory-${slotIndex + 1}`,
    slotIndex,
    phaseIndex,
    dayTitle: day.title,
    dayFocusTags: day.focusTags,
    slotKind: role === "triceps" ? "accessoryTriIso" : "accessoryBiIso",
    selectedMainExerciseIds: selectedMainExercises.map((exercise) => exercise.id),
    selectedAccessoryExerciseIds: accessoryExercises.map((exercise) => exercise.id),
    capabilityMode: context.capabilityMode,
    selectionRng: context.selectionRng,
  });

  accessoryRoleOrder.forEach((role, index) => {
    const previousId = previousAccessoryIds[index];
    let picked = selectShouldersArmsArmAccessoryExercise({
      role,
      context,
      usedIds: usedAccessoryIds,
      usedStimulusKeys: usedAccessoryStimulusByRole[role],
      disallowIds: previousId ? new Set([previousId]) : undefined,
      auditMeta: buildArmAccessoryAuditMeta(index, role),
    });
    if (!picked && previousId) {
      picked = selectShouldersArmsArmAccessoryExercise({
        role,
        context,
        usedIds: usedAccessoryIds,
        usedStimulusKeys: usedAccessoryStimulusByRole[role],
        auditMeta: buildArmAccessoryAuditMeta(index, role),
      });
    }
    if (!picked) {
      picked = selectShouldersArmsArmAccessoryExercise({
        role,
        context,
        usedIds: usedAccessoryIds,
        usedStimulusKeys: usedAccessoryStimulusByRole[role],
        enforceUniqueStimulus: false,
        disallowIds: previousId ? new Set([previousId]) : undefined,
        auditMeta: buildArmAccessoryAuditMeta(index, role),
      });
    }
    if (!picked && previousId) {
      picked = selectShouldersArmsArmAccessoryExercise({
        role,
        context,
        usedIds: usedAccessoryIds,
        usedStimulusKeys: usedAccessoryStimulusByRole[role],
        enforceUniqueStimulus: false,
        auditMeta: buildArmAccessoryAuditMeta(index, role),
      });
    }
    if (!picked) return;
    usedAccessoryIds.add(picked.id);
    usedAccessoryStimulusByRole[role].add(resolveShouldersArmsArmStimulusKey(picked, role));
    accessoryExercises.push(picked);
  });

  if (accessoryExercises.length !== targetAccessoryCount) {
    warnings.push(
      `Shoulders + Arms accessory target mismatch (expected ${targetAccessoryCount}, got ${accessoryExercises.length}).`
    );
  }

  const warmupItems = day.routine.filter((item) => item.section === "warmup");
  const activationItems = day.routine.filter((item) => item.section === "activation");
  const cooldownItems = day.routine.filter((item) => item.section === "cooldown");
  const otherItems = day.routine.filter(
    (item) =>
      item.section !== "warmup" &&
      item.section !== "activation" &&
      item.section !== "main" &&
      item.section !== "accessory" &&
      item.section !== "cooldown"
  );

  const mainItems = selectedMainExercises.map((exercise) =>
    makeItem(
      exercise.id,
      profile.mainSets,
      profile.mainRepRange,
      undefined,
      profile.mainRestSec,
      "main"
    )
  );
  const accessoryRepRange = resolveShouldersArmsAccessoryRepRange(phaseStage);
  const accessoryItems = accessoryExercises.map((exercise) =>
    makeItem(
      exercise.id,
      profile.accessorySets,
      accessoryRepRange,
      undefined,
      profile.accessoryRestSec,
      "accessory"
    )
  );

  const rebuiltDay: ProgramDay = {
    ...day,
    routine: [
      ...warmupItems,
      ...activationItems,
      ...mainItems,
      ...accessoryItems,
      ...otherItems,
      ...cooldownItems,
    ],
  };

  const rebuiltMainExercises = rebuiltDay.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const rebuiltMainIds = rebuiltMainExercises.map((exercise) => exercise.id);
  if (new Set(rebuiltMainIds).size !== rebuiltMainIds.length) {
    warnings.push("Shoulders + Arms main repair found duplicate IDs after rebuild.");
  }
  if (rebuiltMainExercises.length !== targetMainCount) {
    warnings.push(
      `Shoulders + Arms main target mismatch (expected ${targetMainCount}, got ${rebuiltMainExercises.length}).`
    );
  }
  if (!hasAnchorMainRole("ohp", rebuiltMainExercises)) {
    warnings.push("Shoulders + Arms missing required OHP main.");
  }
  if (!hasAnchorMainRole("lateral", rebuiltMainExercises)) {
    warnings.push("Shoulders + Arms missing required lateral-raise main.");
  }
  if (rebuiltMainExercises.some((exercise) => isChestDominantHorizontalPush(exercise))) {
    warnings.push("Shoulders + Arms main includes chest-dominant push, which is disallowed.");
  }
  if (rebuiltMainExercises.some((exercise) => isBackChestLowerBodyLeakExercise(exercise))) {
    warnings.push("Shoulders + Arms main includes lower-body movement, which is disallowed.");
  }
  if (
    rebuiltMainExercises.some((exercise) => !isShouldersArmsMainBoundaryEligible(exercise))
  ) {
    warnings.push("Shoulders + Arms boundary violation remained after repair.");
  }
  if (
    rebuiltMainExercises.some((exercise) =>
      ["biceps", "triceps"].includes(resolveShouldersArmsMainCategory(exercise))
    )
  ) {
    warnings.push("Shoulders + Arms main includes arm isolation, which is disallowed.");
  }
  if (rebuiltMainExercises.some((exercise) => isLegsCarryExercise(exercise))) {
    warnings.push("Shoulders + Arms main includes a carry pattern, which is disallowed.");
  }
  if (rebuiltMainExercises.some((exercise) => isShouldersArmsRowOrVerticalPullMainLeakExercise(exercise))) {
    warnings.push("Shoulders + Arms main includes row/pulldown/pull-up patterns, which are disallowed.");
  }
  if (
    rebuiltMainExercises.some(
      (exercise) =>
        isShouldersArmsFacePullMainLeakExercise(exercise) ||
        isShouldersArmsExternalRotationMainLeakExercise(exercise)
    )
  ) {
    warnings.push("Shoulders + Arms main includes face-pull/external-rotation drills, which are disallowed.");
  }

  const mainCategoryCounts = rebuiltMainExercises.reduce(
    (counts, exercise) => {
      const category = resolveShouldersArmsMainCategory(exercise);
      if (category !== "other") counts[category] += 1;
      return counts;
    },
    {
      ohp: 0,
      lateral: 0,
      biceps: 0,
      triceps: 0,
      rearDeltMain: 0,
      shoulderSupport: 0,
      uprightRow: 0,
    }
  );
  if (mainCategoryCounts.ohp > 1) {
    warnings.push("Shoulders + Arms includes more than one OHP main.");
  }
  if (mainCategoryCounts.lateral > 1) {
    warnings.push("Shoulders + Arms includes more than one lateral-raise main.");
  }
  const maxRearDeltMainCount = Math.max(0, targetMainCount - 2);
  if (mainCategoryCounts.rearDeltMain > maxRearDeltMainCount) {
    warnings.push(
      `Shoulders + Arms includes more than ${maxRearDeltMainCount} rear-delt main(s).`
    );
  }
  if (mainCategoryCounts.shoulderSupport > 2) {
    warnings.push("Shoulders + Arms includes more than two shoulder-support mains.");
  }

  const accessoryIds = accessoryExercises.map((exercise) => exercise.id);
  if (new Set(accessoryIds).size !== accessoryIds.length) {
    warnings.push("Shoulders + Arms accessory repair produced duplicate IDs.");
  }
  const tricepsAccessoryCount = accessoryExercises.filter(
    (exercise) => resolveShouldersArmsMainCategory(exercise) === "triceps"
  ).length;
  const bicepsAccessoryCount = accessoryExercises.filter(
    (exercise) => resolveShouldersArmsMainCategory(exercise) === "biceps"
  ).length;
  if (tricepsAccessoryCount < 1) {
    warnings.push("Shoulders + Arms accessory repair missing required triceps accessory.");
  }
  if (bicepsAccessoryCount < 1) {
    warnings.push("Shoulders + Arms accessory repair missing required biceps accessory.");
  }
  if (targetAccessoryCount >= 4 && tricepsAccessoryCount < 2) {
    warnings.push("Shoulders + Arms advanced accessory repair missing second triceps accessory.");
  }
  if (targetAccessoryCount >= 4 && bicepsAccessoryCount < 2) {
    warnings.push("Shoulders + Arms advanced accessory repair missing second biceps accessory.");
  }
  if (
    targetAccessoryCount >= 4 &&
    (usedAccessoryStimulusByRole.triceps.size < 2 ||
      usedAccessoryStimulusByRole.biceps.size < 2)
  ) {
    warnings.push("Shoulders + Arms advanced arm accessory variations duplicated stimulus keys.");
  }

  return {
    day: rebuiltDay,
    warnings,
  };
};

type LegsAbsMainRole =
  | "squatPrimary"
  | "hingePrimary"
  | "singleLegOrSecondarySquat"
  | "secondaryLower";

const normalizeLegsPatternToken = (value: string) => normalizeTagToken(value);

const isLegsUpperBodyLeakExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  if (
    patterns.has("push") ||
    patterns.has("pull") ||
    patterns.has("verticalpush") ||
    patterns.has("horizontalpush") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull")
  ) {
    return true;
  }
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const lowerBodyCurlPattern =
    descriptor.includes("hamstring curl") ||
    descriptor.includes("leg curl") ||
    descriptor.includes("knee-flexion") ||
    descriptor.includes("knee flexion");
  return (
    descriptor.includes("row") ||
    descriptor.includes("press") ||
    descriptor.includes("bench") ||
    descriptor.includes("chest") ||
    descriptor.includes("lateral raise") ||
    (descriptor.includes("curl") && !lowerBodyCurlPattern) ||
    descriptor.includes("triceps") ||
    descriptor.includes("biceps")
  );
};

const isLegsCarryExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("carry") ||
    tags.has("carry") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase")
  );
};

const isLegsSquatMainExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  return patterns.has("squat");
};

const isLegsHingeMainExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  return patterns.has("hinge");
};

const isLegsSingleLegSquatExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  if (patterns.has("singleleg") || patterns.has("single_leg")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("split-squat") ||
    descriptor.includes("split squat") ||
    descriptor.includes("step-up") ||
    descriptor.includes("step up") ||
    descriptor.includes("lunge") ||
    descriptor.includes("cossack")
  );
};

const isLegsPrimarySquatExercise = (exercise: Exercise) =>
  isLegsSquatMainExercise(exercise) && !isLegsSingleLegSquatExercise(exercise);

const isLegsBackSquatExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("back-squat") ||
    (descriptor.includes("back squat") && exercise.equipment.includes("barbell"))
  );
};

const isLegsMachineSupportedSquatExercise = (exercise: Exercise) => {
  if (!isLegsSquatMainExercise(exercise)) return false;
  if (exercise.equipment.includes("machines")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("leg press") ||
    descriptor.includes("hack squat") ||
    descriptor.includes("assisted") ||
    descriptor.includes("supported") ||
    descriptor.includes("box squat")
  );
};

const isLegsFrontLoadedSquatExercise = (exercise: Exercise) => {
  if (!isLegsSquatMainExercise(exercise)) return false;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (
    descriptor.includes("goblet") ||
    descriptor.includes("front squat") ||
    descriptor.includes("front-squat")
  ) {
    return true;
  }
  const frontLoadedImplement =
    exercise.equipment.includes("dumbbells") ||
    exercise.equipment.includes("kettlebell") ||
    exercise.equipment.includes("bands");
  return frontLoadedImplement && descriptor.includes("squat");
};

const isLegsHeavierFrontLoadedSquatExercise = (exercise: Exercise) =>
  isLegsFrontLoadedSquatExercise(exercise) &&
  exercise.loadType === "weighted" &&
  !isLegsSingleLegSquatExercise(exercise);

type LegsAbsIsolationMainSubtype = "hamstring_curl" | "quad_extension";

const resolveLegsIsolationMainSubtype = (
  exercise: Exercise
): LegsAbsIsolationMainSubtype | null => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  const hamstringCurlPattern =
    descriptor.includes("hamstring curl") ||
    descriptor.includes("leg curl") ||
    descriptor.includes("knee-flexion") ||
    descriptor.includes("knee flexion") ||
    patterns.has("knee_flexion") ||
    patterns.has("kneeflexion");
  if (hamstringCurlPattern) return "hamstring_curl";
  const quadExtensionPattern =
    descriptor.includes("leg extension") ||
    descriptor.includes("quad extension") ||
    descriptor.includes("knee-extension") ||
    descriptor.includes("knee extension") ||
    patterns.has("knee_extension") ||
    patterns.has("kneeextension");
  if (quadExtensionPattern) return "quad_extension";
  return null;
};

const isLegsIsolationMainPromotionCandidate = (exercise: Exercise) =>
  resolveLegsIsolationMainSubtype(exercise) !== null;

const hasGymLikeLowerImplementAvailability = (available: Set<Equipment>) =>
  available.has("machines") ||
  available.has("dumbbells") ||
  available.has("barbell") ||
  available.has("kettlebell") ||
  available.has("cables");

const resolveLegsMainStimulusKey = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  const primaryPattern = patterns.has("squat")
    ? "squat"
    : patterns.has("hinge")
    ? "hinge"
    : patterns.has("singleleg") || patterns.has("single_leg")
    ? "single_leg"
    : "other";
  const family = normalizeTagToken(exercise.familyKey ?? exercise.id);
  const variant = normalizeTagToken(exercise.variantKey ?? "standard");
  const iso = exercise.loadType === "timed" || variant === "iso_hold" ? "iso" : "dynamic";
  return `${primaryPattern}::${family}::${variant}::${iso}::${exercise.loadType}`;
};

const isLegsCoreAccessoryExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("core") ||
    patterns.has("antirotation") ||
    patterns.has("anti_rotation") ||
    tags.has("core") ||
    tags.has("anti_rotation") ||
    descriptor.includes("plank") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("dead-bug") ||
    descriptor.includes("pallof") ||
    descriptor.includes("woodchop") ||
    descriptor.includes("brace")
  );
};

const isLegsCalvesAccessoryExercise = (exercise: Exercise) => {
  const patterns = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeLegsPatternToken(pattern))
  );
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle))
  );
  return patterns.has("calf") || tags.has("calves") || muscles.has("calves");
};

const getLegsAbsDayFromWeek = (week?: ProgramDay[]) =>
  week?.find((entry) => isLegsAbsDayTitle(entry.title)) ?? null;

const getLegsAbsRoleCandidateIds = (
  role: LegsAbsMainRole,
  phaseStage: ProgramPhaseStage
) => {
  if (role === "squatPrimary") {
    if (phaseStage === "growth") {
      return [
        "goblet-squat",
        "band-front-squat",
        "machine-hack-squat",
        "machine-leg-press",
        "dumbbell-step-up-loaded",
        "split-squat",
        "heels-elevated-squat",
        "barbell-back-squat",
      ];
    }
    if (phaseStage === "skill") {
      return [
        "goblet-squat",
        "band-front-squat",
        "machine-leg-press",
        "dumbbell-step-up-loaded",
        "assisted-step-up",
        "split-squat",
        "heels-elevated-squat",
        "machine-hack-squat",
        "bodyweight-squat",
      ];
    }
    return [
      "assisted-box-squat",
      "machine-leg-press",
      "goblet-squat",
      "bodyweight-squat",
      "heels-elevated-squat",
      "band-front-squat",
      "dumbbell-step-up-loaded",
    ];
  }

  if (role === "hingePrimary") {
    if (phaseStage === "growth") {
      return [
        "barbell-romanian-deadlift",
        "barbell-hip-thrust",
        "machine-glute-drive",
        "db-rdl",
        "single-leg-rdl",
        "back-extension",
        "machine-seated-hamstring-curl",
      ];
    }
    if (phaseStage === "skill") {
      return [
        "db-rdl",
        "back-extension",
        "barbell-hip-thrust",
        "machine-glute-drive",
        "single-leg-rdl",
        "machine-seated-hamstring-curl",
        "back-extension-hold",
        "single-leg-hip-thrust",
      ];
    }
    return [
      "single-leg-hip-thrust",
      "single-leg-glute-bridge-hold",
      "back-extension-hold",
      "back-extension",
      "db-rdl",
      "band-rdl",
      "single-leg-rdl",
    ];
  }

  if (role === "singleLegOrSecondarySquat") {
    if (phaseStage === "growth") {
      return [
        "dumbbell-step-up-loaded",
        "assisted-step-up",
        "split-squat",
        "machine-leg-press",
        "machine-hack-squat",
        "goblet-squat",
        "heels-elevated-squat",
      ];
    }
    if (phaseStage === "skill") {
      return [
        "assisted-step-up",
        "dumbbell-step-up-loaded",
        "split-squat",
        "goblet-squat",
        "machine-leg-press",
        "heels-elevated-squat",
        "bodyweight-squat",
      ];
    }
    return [
      "assisted-step-up",
      "machine-leg-press",
      "goblet-squat",
      "bodyweight-squat",
      "dumbbell-step-up-loaded",
      "heels-elevated-squat",
      "split-squat",
    ];
  }

  if (phaseStage === "growth") {
    return [
      "machine-leg-press",
      "goblet-squat",
      "db-rdl",
      "barbell-hip-thrust",
      "dumbbell-step-up-loaded",
      "machine-seated-hamstring-curl",
    ];
  }
  if (phaseStage === "skill") {
    return [
      "goblet-squat",
      "db-rdl",
      "machine-leg-press",
      "split-squat",
      "single-leg-rdl",
      "back-extension",
    ];
  }
  return [
    "goblet-squat",
    "single-leg-hip-thrust",
    "back-extension-hold",
    "split-squat",
    "bodyweight-squat",
    "back-extension",
  ];
};

const LEGS_ABS_CORE_ACCESSORY_IDS = [
  "dead-bug",
  "pallof-press",
  "plank",
  "side-plank",
  "hollow-body-hold",
  "bird-dog",
  "band-woodchop",
  "standing-brace-march",
  "marching-brace-hold",
  "wall-braced-single-leg-march",
  "contralateral-reach-march",
];

const LEGS_ABS_CALVES_ACCESSORY_IDS = [
  "db-calf-raise",
  "standing-calf-raise",
  "single-leg-calf-raise",
  "band-calf-raise",
];

const LEGS_ABS_EXTRA_AB_ACCESSORY_IDS = [
  "pallof-press",
  "side-plank",
  "plank",
  "hollow-body-hold",
  "dead-bug",
  "band-woodchop",
  "marching-brace-hold",
];

const repairLegsAbsDayIntelligence = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { day: ProgramDay; warnings: string[] } => {
  const { day, daysPerWeek, context } = params;
  if (daysPerWeek !== 3 || !isLegsAbsDayTitle(day.title)) return { day, warnings: [] };

  const warnings: string[] = [];
  const phaseStage = context.selectionContext.phaseStage;
  const experienceLevel = context.selectionContext.experienceLevel;
  const phaseIndex = phaseIndexFromStage(phaseStage);
  const experienceForProfile: ExperienceLevel =
    experienceLevel === "advanced"
      ? "Advanced"
      : experienceLevel === "intermediate"
      ? "Intermediate"
      : "Beginner";
  const profile = getExperienceProfile(
    experienceForProfile,
    context.selectionContext.goal,
    phaseIndex
  );
  const threeDayBlueprint = resolveThreeDayBlueprint({
    dayTitle: day.title,
    selectionContext: context.selectionContext,
    available: context.available,
  });
  const targetMainCount = threeDayBlueprint?.mainCount ?? 3;
  const targetAccessoryCount = threeDayBlueprint?.accessoryCount ?? 2;

  const previousDay = getLegsAbsDayFromWeek(context.previousWeek);
  const previousMainIds = previousDay
    ? previousDay.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId)
    : [];
  const previousAccessoryIds = previousDay
    ? previousDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId)
    : [];

  const usedMainIds = new Set<string>();
  const usedMainStimulusKeys = new Set<string>();
  const selectedMainExercises: Exercise[] = [];
  const gymLikeIntermediatePlusLegsContext =
    experienceLevel !== "beginner" &&
    hasGymLikeLowerImplementAvailability(context.available);
  const hasSelectedPrimaryCompoundAnchor = () =>
    selectedMainExercises.some(
      (exercise) => isLegsSquatMainExercise(exercise) || isLegsHingeMainExercise(exercise)
    );
  const hasSelectedPrimarySquatAndHinge = () =>
    selectedMainExercises.some(isLegsSquatMainExercise) &&
    selectedMainExercises.some(isLegsHingeMainExercise);
  const selectedLegsIsolationSubtypes = () =>
    new Set(
      selectedMainExercises
        .map((exercise) => resolveLegsIsolationMainSubtype(exercise))
        .filter((subtype): subtype is LegsAbsIsolationMainSubtype => Boolean(subtype))
    );

  const canUseMainForRole = (exercise: Exercise, role: LegsAbsMainRole) => {
    if (exercise.category !== "main") return false;
    if (usedMainIds.has(exercise.id)) return false;
    if (isLegsUpperBodyLeakExercise(exercise)) return false;
    if (experienceLevel === "beginner" && isLegsBackSquatExercise(exercise)) return false;
    if (
      experienceLevel === "beginner" &&
      phaseStage === "activation" &&
      `${exercise.id} ${exercise.name}`.toLowerCase().includes("cossack")
    ) {
      return false;
    }
    if (
      experienceLevel === "beginner" &&
      phaseStage === "activation" &&
      role !== "singleLegOrSecondarySquat" &&
      `${exercise.id} ${exercise.name}`.toLowerCase().includes("split squat")
    ) {
      return false;
    }
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "main",
        context: context.selectionContext,
        dayTitle: day.title,
      })
    ) {
      return false;
    }
    if (role === "squatPrimary" && !isLegsSquatMainExercise(exercise)) return false;
    if (role === "hingePrimary" && !isLegsHingeMainExercise(exercise)) return false;
    if (
      role === "singleLegOrSecondarySquat" &&
      !(
        isLegsSingleLegSquatExercise(exercise) ||
        (phaseStage !== "activation" || experienceLevel !== "beginner"
          ? isLegsSquatMainExercise(exercise)
          : false)
      )
    ) {
      return false;
    }
    if (
      role === "secondaryLower" &&
      !(
        isLegsSquatMainExercise(exercise) ||
        isLegsHingeMainExercise(exercise) ||
        (gymLikeIntermediatePlusLegsContext &&
          hasSelectedPrimaryCompoundAnchor() &&
          isLegsIsolationMainPromotionCandidate(exercise))
      )
    ) {
      return false;
    }
    if (experienceLevel === "beginner" && phaseStage === "activation") {
      const existingPrimarySquatCount = selectedMainExercises.filter(
        isLegsPrimarySquatExercise
      ).length;
      if (role === "singleLegOrSecondarySquat" && isLegsPrimarySquatExercise(exercise)) {
        return false;
      }
      if (
        role === "secondaryLower" &&
        isLegsPrimarySquatExercise(exercise) &&
        existingPrimarySquatCount >= 1
      ) {
        return false;
      }
    }
    const stimulusKey = resolveLegsMainStimulusKey(exercise);
    if (usedMainStimulusKeys.has(stimulusKey)) return false;
    return true;
  };

  const selectLegsMainForRole = (
    role: LegsAbsMainRole,
    candidateIds: string[],
    disallowIds?: Set<string>
  ) => {
    const eligibleCandidates = Array.from(new Set(candidateIds))
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => !disallowIds?.has(exercise.id))
      .filter((exercise) => canUseMainForRole(exercise, role));

    const nonMachineSquatOptionExists =
      role === "squatPrimary" &&
      eligibleCandidates.some((exercise) => !isLegsMachineSupportedSquatExercise(exercise));

    const candidates = eligibleCandidates
      .map((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const squatMachineSupported = isLegsMachineSupportedSquatExercise(exercise);
        const squatFrontLoaded = isLegsFrontLoadedSquatExercise(exercise);
        const squatHeavyFrontLoaded = isLegsHeavierFrontLoadedSquatExercise(exercise);
        let score = scoreExerciseForContext(
          exercise,
          "main",
          context.selectionContext,
          context.available
        );
        if (role === "squatPrimary" && isLegsSquatMainExercise(exercise)) score += 2;
        if (role === "hingePrimary" && isLegsHingeMainExercise(exercise)) score += 2;
        if (
          role === "singleLegOrSecondarySquat" &&
          isLegsSingleLegSquatExercise(exercise)
        ) {
          score += 2;
        }
        if (phaseStage === "activation") {
          if (
            descriptor.includes("bodyweight") ||
            descriptor.includes("goblet") ||
            descriptor.includes("supported") ||
            descriptor.includes("hold")
          ) {
            score += 1;
          }
        }
        if (phaseStage === "growth" && exercise.loadType === "weighted") {
          score += 1;
        }
        if (
          context.selectionContext.goal.toLowerCase().includes("pain") &&
          role === "hingePrimary"
        ) {
          if (
            descriptor.includes("hip thrust") ||
            descriptor.includes("glute bridge") ||
            descriptor.includes("back-extension-hold")
          ) {
            score += 1.5;
          }
        }
        if (experienceLevel === "beginner" && phaseStage === "activation") {
          if (
            role === "hingePrimary" &&
            (descriptor.includes("back extension") ||
              descriptor.includes("hip thrust") ||
              descriptor.includes("glute bridge"))
          ) {
            score += 2;
          }
          if (role === "singleLegOrSecondarySquat" && isLegsSingleLegSquatExercise(exercise)) {
            score += descriptor.includes("assisted") || descriptor.includes("supported") ? 2 : 1;
          }
        }
        if (role === "squatPrimary") {
          if (phaseStage === "activation") {
            if (squatMachineSupported) score += 2.5;
            if (squatFrontLoaded) score += 1.75;
          } else if (phaseStage === "skill") {
            if (squatFrontLoaded) score += 3;
            if (squatMachineSupported) score += 0.75;
          } else {
            if (squatHeavyFrontLoaded) score += 3.5;
            else if (squatFrontLoaded) score += 1.5;
            if (squatMachineSupported && !squatFrontLoaded) score += 0.5;
          }
          if (isLegsBackSquatExercise(exercise)) {
            score -= experienceLevel === "beginner" ? 8 : 2;
          }
          if (nonMachineSquatOptionExists) {
            if (squatMachineSupported) {
              score -= phaseStage === "activation" ? 0.5 : 1.5;
            }
          }
        }
        if (role === "secondaryLower" && gymLikeIntermediatePlusLegsContext) {
          const candidateIsolationSubtype = resolveLegsIsolationMainSubtype(exercise);
          const selectedIsolationSubtypes = selectedLegsIsolationSubtypes();
          const hasPrimaryCompound = hasSelectedPrimaryCompoundAnchor();
          const hasPrimaryPair = hasSelectedPrimarySquatAndHinge();
          if (candidateIsolationSubtype && hasPrimaryCompound) {
            score += 2.5;
            if (
              hasPrimaryPair &&
              candidateIsolationSubtype === "hamstring_curl" &&
              !selectedIsolationSubtypes.has("hamstring_curl")
            ) {
              score += 8;
            }
            if (
              hasPrimaryPair &&
              candidateIsolationSubtype === "quad_extension" &&
              !selectedIsolationSubtypes.has("quad_extension")
            ) {
              score += 8;
            }
          } else if (
            hasPrimaryPair &&
            (!selectedIsolationSubtypes.has("hamstring_curl") ||
              !selectedIsolationSubtypes.has("quad_extension"))
          ) {
            score -= 2;
          }
        }
        return { exercise, score };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const leftSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-main"}|${role}|${left.exercise.id}`
        );
        const rightSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-main"}|${role}|${right.exercise.id}`
        );
        if (leftSeed !== rightSeed) return leftSeed - rightSeed;
        return left.exercise.id.localeCompare(right.exercise.id);
      });
    return candidates[0]?.exercise ?? null;
  };

  const addSelectedMain = (exercise: Exercise) => {
    usedMainIds.add(exercise.id);
    usedMainStimulusKeys.add(resolveLegsMainStimulusKey(exercise));
    selectedMainExercises.push(exercise);
  };

  const syncSelectedMainTracking = () => {
    usedMainIds.clear();
    usedMainStimulusKeys.clear();
    selectedMainExercises.forEach((exercise) => {
      usedMainIds.add(exercise.id);
      usedMainStimulusKeys.add(resolveLegsMainStimulusKey(exercise));
    });
  };

  const roleToFamily = (role: LegsAbsMainRole) => {
    if (role === "squatPrimary") return "squat_primary";
    if (role === "hingePrimary") return "hinge_primary";
    if (role === "singleLegOrSecondarySquat") return "single_leg_or_secondary_squat";
    return "lower_secondary";
  };
  const familyToRole = (family: string): LegsAbsMainRole | null => {
    if (family === "squat_primary") return "squatPrimary";
    if (family === "hinge_primary") return "hingePrimary";
    if (family === "single_leg_or_secondary_squat") return "singleLegOrSecondarySquat";
    if (family === "lower_secondary") return "secondaryLower";
    return null;
  };
  const resolveRoleCandidateIds = (role: LegsAbsMainRole) => {
    if (role === "squatPrimary") {
      const squatLadder = threeDayBlueprint?.squatProgressionByPhase?.[phaseStage] ?? [];
      return Array.from(
        new Set([...squatLadder, ...getLegsAbsRoleCandidateIds("squatPrimary", phaseStage)])
      );
    }
    const baseIds = getLegsAbsRoleCandidateIds(role, phaseStage);
    if (role !== "secondaryLower" || !gymLikeIntermediatePlusLegsContext) {
      return baseIds;
    }
    const dynamicIsolationMainIds = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isLegsIsolationMainPromotionCandidate(exercise))
      .map((exercise) => exercise.id);
    return Array.from(new Set([...baseIds, ...dynamicIsolationMainIds]));
  };
  const resolveSwapCandidatesForRole = (role: LegsAbsMainRole) => {
    const family = roleToFamily(role);
    const swapFamilies = threeDayBlueprint?.laneSwapRules?.[family] ?? [];
    const swapRoles = swapFamilies
      .map((swapFamily) => familyToRole(swapFamily))
      .filter((swapRole): swapRole is LegsAbsMainRole => Boolean(swapRole));
    if (!swapRoles.length) return [];
    return Array.from(
      new Set(
        swapRoles.flatMap((swapRole) => resolveRoleCandidateIds(swapRole))
      )
    );
  };

  const trySelectRole = (
    role: LegsAbsMainRole,
    candidateIds: string[],
    laneLabel: string,
    swapCandidates?: string[]
  ) => {
    const previousId = previousMainIds.find((id) => candidateIds.includes(id));
    let picked = selectLegsMainForRole(
      role,
      candidateIds,
      previousId ? new Set([previousId]) : undefined
    );
    if (!picked && previousId) {
      picked = selectLegsMainForRole(role, candidateIds);
    }
    if (!picked && swapCandidates?.length) {
      picked = selectLegsMainForRole(role, swapCandidates);
      if (picked) {
        warnings.push(
          `Legs + Abs ${laneLabel} lane swapped to safe fallback (${picked.id}) due to constraints.`
        );
      }
    }
    if (!picked) {
      warnings.push(`Legs + Abs missing ${laneLabel} lane from eligible pool.`);
      return false;
    }
    addSelectedMain(picked);
    return true;
  };

  trySelectRole(
    "squatPrimary",
    resolveRoleCandidateIds("squatPrimary"),
    "squat",
    resolveSwapCandidatesForRole("squatPrimary")
  );
  trySelectRole(
    "hingePrimary",
    resolveRoleCandidateIds("hingePrimary"),
    "hinge",
    resolveSwapCandidatesForRole("hingePrimary")
  );
  trySelectRole(
    "singleLegOrSecondarySquat",
    resolveRoleCandidateIds("singleLegOrSecondarySquat"),
    "single_leg_or_secondary_squat",
    resolveSwapCandidatesForRole("singleLegOrSecondarySquat")
  );

  while (selectedMainExercises.length < targetMainCount) {
    const picked = selectLegsMainForRole(
      "secondaryLower",
      resolveRoleCandidateIds("secondaryLower"),
      previousMainIds.length ? new Set(previousMainIds) : undefined
    );
    if (!picked) break;
    addSelectedMain(picked);
  }

  if (selectedMainExercises.length < targetMainCount) {
    const fallbackMainPool = day.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => canUseMainForRole(exercise, "secondaryLower"));
    fallbackMainPool.forEach((exercise) => {
      if (selectedMainExercises.length >= targetMainCount) return;
      addSelectedMain(exercise);
    });
  }

  if (selectedMainExercises.length < targetMainCount) {
    const safeFallbackIds = [
      "goblet-squat",
      "bodyweight-squat",
      "split-squat",
      "heels-elevated-squat",
      "machine-leg-press",
      "dumbbell-step-up-loaded",
      "back-extension-hold",
      "back-extension",
      "single-leg-hip-thrust",
      "single-leg-glute-bridge-hold",
      "db-rdl",
      "single-leg-rdl",
      "band-rdl",
    ];
    const fallbackPool = Array.from(new Set(safeFallbackIds))
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => canUseMainForRole(exercise, "secondaryLower"))
      .sort((left, right) => left.id.localeCompare(right.id));
    fallbackPool.forEach((exercise) => {
      if (selectedMainExercises.length >= targetMainCount) return;
      addSelectedMain(exercise);
    });
    if (selectedMainExercises.length < targetMainCount) {
      warnings.push(
        `Legs + Abs main lanes were constraint-blocked; using all safe fallbacks still produced ${selectedMainExercises.length}/${targetMainCount} mains.`
      );
    }
  }

  const pickSingleLegIntegrityCandidate = (excludedIds: Set<string>) => {
    const candidateIds = resolveRoleCandidateIds("singleLegOrSecondarySquat");
    const candidates = Array.from(new Set(candidateIds))
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => !excludedIds.has(exercise.id))
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isLegsSingleLegSquatExercise(exercise))
      .filter((exercise) => !isLegsUpperBodyLeakExercise(exercise))
      .filter((exercise) =>
        experienceLevel === "beginner" ? !isLegsBackSquatExercise(exercise) : true
      )
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      )
      .map((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        let score = scoreExerciseForContext(
          exercise,
          "main",
          context.selectionContext,
          context.available
        );
        score += 3;
        if (phaseStage === "activation") {
          if (descriptor.includes("assisted") || descriptor.includes("supported")) score += 2;
          if (descriptor.includes("step-up") || descriptor.includes("step up")) score += 1;
        }
        return { exercise, score };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const leftSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-integrity"}|single-leg|${left.exercise.id}`
        );
        const rightSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-integrity"}|single-leg|${right.exercise.id}`
        );
        if (leftSeed !== rightSeed) return leftSeed - rightSeed;
        return left.exercise.id.localeCompare(right.exercise.id);
      });
    return candidates[0]?.exercise ?? null;
  };

  const enforceBeginnerPhaseOneLegsLaneIntegrity = () => {
    if (experienceLevel !== "beginner" || phaseStage !== "activation") return;

    let updated = false;
    const hasSingleLegMain = selectedMainExercises.some(isLegsSingleLegSquatExercise);
    if (!hasSingleLegMain) {
      const excludedIds = new Set(selectedMainExercises.map((exercise) => exercise.id));
      const replacement = pickSingleLegIntegrityCandidate(excludedIds);
      if (replacement) {
        if (selectedMainExercises.length < targetMainCount) {
          selectedMainExercises.push(replacement);
        } else {
          const primarySquatReplacementIndex = selectedMainExercises.findIndex(
            (exercise, index) => index > 0 && isLegsPrimarySquatExercise(exercise)
          );
          const fallbackReplacementIndex =
            primarySquatReplacementIndex >= 0
              ? primarySquatReplacementIndex
              : selectedMainExercises.findIndex((exercise) => isLegsPrimarySquatExercise(exercise));
          if (fallbackReplacementIndex >= 0) {
            selectedMainExercises[fallbackReplacementIndex] = replacement;
          }
        }
        warnings.push(
          `Legs + Abs Phase 1 integrity forced single-leg lane candidate (${replacement.id}).`
        );
        updated = true;
      }
    }

    const primarySquatIndexes = selectedMainExercises
      .map((exercise, index) => ({ exercise, index }))
      .filter((entry) => isLegsPrimarySquatExercise(entry.exercise))
      .map((entry) => entry.index);
    for (let index = 1; index < primarySquatIndexes.length; index += 1) {
      const targetIndex = primarySquatIndexes[index];
      const excludedIds = new Set(
        selectedMainExercises
          .map((exercise, selectedIndex) => (selectedIndex === targetIndex ? null : exercise.id))
          .filter((id): id is string => Boolean(id))
      );
      const replacement = pickSingleLegIntegrityCandidate(excludedIds);
      if (!replacement) {
        warnings.push(
          "Legs + Abs Phase 1 integrity could not replace duplicate primary squat lane with single-leg."
        );
        continue;
      }
      selectedMainExercises[targetIndex] = replacement;
      warnings.push(
        `Legs + Abs Phase 1 integrity replaced duplicate primary squat with single-leg (${replacement.id}).`
      );
      updated = true;
    }

    if (updated) {
      syncSelectedMainTracking();
    }
  };

  enforceBeginnerPhaseOneLegsLaneIntegrity();

  const usedAccessoryIds = new Set<string>(selectedMainExercises.map((exercise) => exercise.id));
  const selectedAccessories: Exercise[] = [];
  const usedAccessoryStimulus = new Set<string>();

  const selectAccessoryByIds = (
    ids: string[],
    role: "core" | "calves" | "extraAb",
    disallowIds?: Set<string>
  ) => {
    const candidates = Array.from(new Set(ids))
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => !usedAccessoryIds.has(exercise.id))
      .filter((exercise) => !disallowIds?.has(exercise.id))
      .filter((exercise) => !isLegsCarryExercise(exercise))
      .filter((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "accessory",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      )
      .filter((exercise) =>
        role === "core" || role === "extraAb"
          ? isLegsCoreAccessoryExercise(exercise)
          : isLegsCalvesAccessoryExercise(exercise)
      )
      .filter((exercise) => !usedAccessoryStimulus.has(resolveLegsMainStimulusKey(exercise)))
      .map((exercise) => {
        let score = scoreExerciseForContext(
          exercise,
          "accessory",
          context.selectionContext,
          context.available
        );
        if (role === "core" && isLegsCoreAccessoryExercise(exercise)) score += 2;
        if (role === "calves" && isLegsCalvesAccessoryExercise(exercise)) score += 2;
        if (role === "extraAb" && phaseStage === "growth") score += 1;
        return { exercise, score };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const leftSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-accessory"}|${role}|${left.exercise.id}`
        );
        const rightSeed = stableHashUnit(
          `${context.selectionSeed ?? "legs-abs-accessory"}|${role}|${right.exercise.id}`
        );
        if (leftSeed !== rightSeed) return leftSeed - rightSeed;
        return left.exercise.id.localeCompare(right.exercise.id);
      });
    return candidates[0]?.exercise ?? null;
  };

  const addAccessory = (exercise: Exercise) => {
    usedAccessoryIds.add(exercise.id);
    usedAccessoryStimulus.add(resolveLegsMainStimulusKey(exercise));
    selectedAccessories.push(exercise);
  };

  const accessoryRolePlanFromBlueprint =
    threeDayBlueprint?.accessoryRoles ?? [];
  const accessoryRolePlan: Array<"core" | "calves" | "extraAb"> =
    accessoryRolePlanFromBlueprint.length
      ? accessoryRolePlanFromBlueprint
          .map((role) => {
            if (role === "calves") return "calves" as const;
            if (role === "extra_ab") return "extraAb" as const;
            if (role === "core") return "core" as const;
            return null;
          })
          .filter((role): role is "core" | "calves" | "extraAb" => Boolean(role))
      : targetAccessoryCount >= 3
      ? ["core", "calves", "extraAb"]
      : ["core", "calves"];

  accessoryRolePlan.forEach((role) => {
    if (selectedAccessories.length >= targetAccessoryCount) return;
    const ids =
      role === "core"
        ? LEGS_ABS_CORE_ACCESSORY_IDS
        : role === "calves"
        ? LEGS_ABS_CALVES_ACCESSORY_IDS
        : LEGS_ABS_EXTRA_AB_ACCESSORY_IDS;
    const previousId = previousAccessoryIds.find((id) => ids.includes(id));
    let picked = selectAccessoryByIds(
      ids,
      role,
      previousId ? new Set([previousId]) : undefined
    );
    if (!picked && previousId) {
      picked = selectAccessoryByIds(ids, role);
    }
    if (picked) addAccessory(picked);
  });

  while (selectedAccessories.length < targetAccessoryCount) {
    const fallbackRole: "core" | "calves" =
      selectedAccessories.length % 2 === 0 ? "core" : "calves";
    const ids =
      fallbackRole === "core" ? LEGS_ABS_CORE_ACCESSORY_IDS : LEGS_ABS_CALVES_ACCESSORY_IDS;
    const picked = selectAccessoryByIds(ids, fallbackRole);
    if (!picked) break;
    addAccessory(picked);
  }

  const warmupItems = day.routine.filter((item) => item.section === "warmup");
  const activationItems = day.routine.filter((item) => item.section === "activation");
  const cooldownItems = day.routine.filter((item) => item.section === "cooldown");
  const otherItems = day.routine.filter(
    (item) =>
      item.section !== "warmup" &&
      item.section !== "activation" &&
      item.section !== "main" &&
      item.section !== "accessory" &&
      item.section !== "cooldown"
  );

  const mainItems = selectedMainExercises.map((exercise) =>
    makeItem(
      exercise.id,
      profile.mainSets,
      profile.mainRepRange,
      undefined,
      profile.mainRestSec,
      "main"
    )
  );
  const accessoryRepRange = phaseStage === "growth" ? "8-12" : "10-15";
  const accessoryItems = selectedAccessories.map((exercise) =>
    makeItem(
      exercise.id,
      profile.accessorySets,
      accessoryRepRange,
      undefined,
      profile.accessoryRestSec,
      "accessory"
    )
  );

  const rebuiltDay: ProgramDay = {
    ...day,
    routine: [
      ...warmupItems,
      ...activationItems,
      ...mainItems,
      ...accessoryItems,
      ...otherItems,
      ...cooldownItems,
    ],
  };

  const rebuiltMainExercises = rebuiltDay.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const rebuiltAccessoryExercises = rebuiltDay.routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  if (rebuiltMainExercises.length !== targetMainCount) {
    warnings.push(
      `Legs + Abs main target mismatch (expected ${targetMainCount}, got ${rebuiltMainExercises.length}).`
    );
  }
  if (rebuiltAccessoryExercises.length !== targetAccessoryCount) {
    warnings.push(
      `Legs + Abs accessory target mismatch (expected ${targetAccessoryCount}, got ${rebuiltAccessoryExercises.length}).`
    );
  }
  if (!rebuiltMainExercises.some((exercise) => isLegsSquatMainExercise(exercise))) {
    warnings.push("Legs + Abs missing required squat main.");
  }
  if (!rebuiltMainExercises.some((exercise) => isLegsHingeMainExercise(exercise))) {
    warnings.push("Legs + Abs missing required hinge main.");
  }
  if (
    !rebuiltMainExercises.some((exercise) =>
      phaseStage === "activation" && experienceLevel === "beginner"
        ? isLegsSingleLegSquatExercise(exercise)
        : isLegsSingleLegSquatExercise(exercise) || isLegsSquatMainExercise(exercise)
    )
  ) {
    warnings.push("Legs + Abs missing single-leg or secondary squat lane.");
  }
  if (rebuiltMainExercises.some((exercise) => isLegsUpperBodyLeakExercise(exercise))) {
    warnings.push("Legs + Abs main includes upper-body leakage.");
  }
  const rebuiltMainIds = rebuiltMainExercises.map((exercise) => exercise.id);
  if (new Set(rebuiltMainIds).size !== rebuiltMainIds.length) {
    warnings.push("Legs + Abs main includes duplicate exercise IDs.");
  }
  if (
    experienceLevel === "beginner" &&
    phaseStage === "activation" &&
    rebuiltMainExercises.filter((exercise) => isLegsPrimarySquatExercise(exercise)).length > 1
  ) {
    warnings.push("Legs + Abs Phase 1 integrity violation: duplicate primary squat mains.");
  }

  const coreAccessoryCount = rebuiltAccessoryExercises.filter((exercise) =>
    isLegsCoreAccessoryExercise(exercise)
  ).length;
  const calvesAccessoryCount = rebuiltAccessoryExercises.filter((exercise) =>
    isLegsCalvesAccessoryExercise(exercise)
  ).length;
  if (coreAccessoryCount < 1) {
    warnings.push("Legs + Abs accessory repair missing core slot.");
  }
  if (calvesAccessoryCount < 1) {
    warnings.push("Legs + Abs accessory repair missing calves slot.");
  }
  if (targetAccessoryCount >= 3 && coreAccessoryCount < 2) {
    warnings.push("Legs + Abs advanced accessory repair missing extra ab-focused slot.");
  }

  const carryAccessories = rebuiltAccessoryExercises.filter((exercise) => isLegsCarryExercise(exercise));
  if (carryAccessories.length > 1) {
    warnings.push("Legs + Abs carry constraint violated (more than one carry accessory).");
  }
  if (new Set(carryAccessories.map((exercise) => exercise.id)).size !== carryAccessories.length) {
    warnings.push("Legs + Abs carry constraint violated (duplicate carry accessory).");
  }
  if (coreAccessoryCount < 1 && carryAccessories.length > 0) {
    warnings.push("Legs + Abs carry accessory cannot replace core slot.");
  }

  return {
    day: rebuiltDay,
    warnings,
  };
};

const collectAccessoryCarryReferences = (week: ProgramDay[]) =>
  week.flatMap((day, dayIndex) =>
    day.routine
      .map((item, itemIndex) => ({ day, dayIndex, item, itemIndex }))
      .filter((entry) => entry.item.section === "accessory")
      .map((entry) => {
        const exercise = exerciseById(entry.item.exerciseId);
        return exercise ? { ...entry, exercise } : null;
      })
      .filter((entry): entry is { day: ProgramDay; dayIndex: number; item: ProgramRoutineItem; itemIndex: number; exercise: Exercise } => Boolean(entry))
      .filter((entry) => isLegsCarryExercise(entry.exercise))
  );

const pickThreeDayCarryAccessoryForDay = (params: {
  day: ProgramDay;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
}): Exercise | null => {
  const { day, context, usedIds } = params;
  const dayToken = normalizeSlotToken(day.title);
  const existingAccessoryIds = day.routine
    .filter((item) => item.section === "accessory")
    .map((item) => item.exerciseId);
  const carrySlotIndex = existingAccessoryIds.length;
  const carryAuditMeta: SelectionAuditMeta = {
    slotId: `${dayToken}-accessory-${carrySlotIndex + 1}`,
    slotIndex: carrySlotIndex,
    phaseIndex: phaseIndexFromStage(context.selectionContext.phaseStage),
    dayTitle: day.title,
    dayFocusTags: day.focusTags,
    slotKind: "accessoryCarryFinisher",
    selectedMainExerciseIds: day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId),
    selectedAccessoryExerciseIds: existingAccessoryIds,
    capabilityMode: context.capabilityMode,
    selectionRng: context.selectionRng,
  };
  const scoredEntries = exercises
    .filter((exercise) => isLegsCarryExercise(exercise))
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
        dayTitle: day.title,
      })
    )
    .map((exercise) => {
      const patterns = new Set(
        exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
      );
      let score = scoreExerciseForContextDetailed(
        exercise,
        "accessory",
        context.selectionContext,
        context.available,
        carryAuditMeta
      ).score;
      if (
        context.selectionContext.capabilityMode === "hasLoad" &&
        exercise.loadType === "weighted"
      ) {
        score += 1.5;
      }
      if (
        context.selectionContext.capabilityMode === "bandOnly" &&
        isBandEquippedExercise(exercise)
      ) {
        score += 1.5;
      }
      if (patterns.has("anti_rotation") || patterns.has("antirotation")) {
        score += 1;
      }
      if (
        context.selectionContext.experienceLevel === "beginner" &&
        exercise.loadType === "timed"
      ) {
        score += 0.5;
      }
      return { exercise, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftSeed = stableHashUnit(
        `${context.selectionSeed ?? "three-day-carry"}|${day.title}|${left.exercise.id}`
      );
      const rightSeed = stableHashUnit(
        `${context.selectionSeed ?? "three-day-carry"}|${day.title}|${right.exercise.id}`
      );
      if (leftSeed !== rightSeed) return leftSeed - rightSeed;
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  return chooseDeterministicTopScoredExercise(scoredEntries, context.selectionRng, {
    useVariationBand: Boolean(context.selectionContext.variationState?.enabled),
    variationConfig:
      context.selectionContext.variationState?.config ?? DEFAULT_PROGRAM_VARIATION_CONFIG,
    variationSeedToken: context.selectionContext.variationState?.enabled
      ? [
          context.selectionContext.variationState.seedKey,
          "three-day-carry",
          dayToken,
          scoredEntries
            .map((entry) => `${entry.exercise.id}:${entry.score.toFixed(2)}`)
            .join("|"),
        ].join("|")
      : undefined,
  });
};

const pickNonCarryAccessoryFallbackForDay = (params: {
  day: ProgramDay;
  context: DayConstraintRepairContext;
  usedIds: Set<string>;
}): Exercise | null => {
  const { day, context, usedIds } = params;
  const dayToken = normalizeSlotToken(day.title);
  const scoredEntries = exercises
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => !isLegsCarryExercise(exercise))
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: context.available,
        section: "accessory",
        context: context.selectionContext,
        dayTitle: day.title,
      })
    )
    .map((exercise) => {
      let score = scoreExerciseForContext(
        exercise,
        "accessory",
        context.selectionContext,
        context.available
      );
      if (dayToken === "shoulders_arms") {
        const category = resolveShouldersArmsMainCategory(exercise);
        if (category === "triceps" || category === "biceps") score += 4;
      } else if (dayToken === "back_chest") {
        if (matchesAccessoryLanePattern(exercise, "back")) score += 3;
      } else if (isLegsCoreAccessoryExercise(exercise) || isLegsCalvesAccessoryExercise(exercise)) {
        score += 3;
      }
      return { exercise, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftSeed = stableHashUnit(
        `${context.selectionSeed ?? "three-day-carry-fallback"}|${day.title}|${left.exercise.id}`
      );
      const rightSeed = stableHashUnit(
        `${context.selectionSeed ?? "three-day-carry-fallback"}|${day.title}|${right.exercise.id}`
      );
      if (leftSeed !== rightSeed) return leftSeed - rightSeed;
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  return chooseDeterministicTopScoredExercise(scoredEntries, context.selectionRng, {
    useVariationBand: Boolean(context.selectionContext.variationState?.enabled),
    variationConfig:
      context.selectionContext.variationState?.config ?? DEFAULT_PROGRAM_VARIATION_CONFIG,
    variationSeedToken: context.selectionContext.variationState?.enabled
      ? [
          context.selectionContext.variationState.seedKey,
          "three-day-non-carry-fallback",
          dayToken,
          scoredEntries
            .map((entry) => `${entry.exercise.id}:${entry.score.toFixed(2)}`)
            .join("|"),
        ].join("|")
      : undefined,
  });
};

const enforceBeginnerThreeDayCarryPolicy = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { week: ProgramDay[]; warnings: string[] } => {
  const { week, daysPerWeek, context } = params;
  if (daysPerWeek !== 3) {
    return { week, warnings: [] };
  }

  const warnings: string[] = [];
  const nextWeek = [...week];
  const shouldersIndex = nextWeek.findIndex((entry) => isShouldersArmsDayTitle(entry.title));
  if (shouldersIndex < 0) {
    return { week: nextWeek, warnings };
  }

  const ensureShouldersDayCarry = () => {
    if (context.selectionContext.experienceLevel === "advanced") return;
    const day = nextWeek[shouldersIndex];
    const accessoryEntries = day.routine
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.section === "accessory");
    const shouldersHasCarry = accessoryEntries.some((entry) => {
      const exercise = exerciseById(entry.item.exerciseId);
      return exercise ? isLegsCarryExercise(exercise) : false;
    });
    if (shouldersHasCarry) return;

    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    const carryAccessory = pickThreeDayCarryAccessoryForDay({
      day,
      context,
      usedIds,
    });
    if (!carryAccessory) return;

    const templateAccessory = accessoryEntries[accessoryEntries.length - 1]?.item;
    const insertAfterIndex = accessoryEntries[accessoryEntries.length - 1]?.itemIndex ?? -1;
    const firstCooldownIndex = day.routine.findIndex((item) => item.section === "cooldown");
    const insertIndex =
      insertAfterIndex >= 0
        ? insertAfterIndex + 1
        : firstCooldownIndex >= 0
        ? firstCooldownIndex
        : day.routine.length;
    const carrySets = templateAccessory?.sets ?? 2;
    const carryRestSec = templateAccessory?.restSec ?? 45;
    const carryDurationSec =
      carryAccessory.loadType === "timed"
        ? templateAccessory?.durationSec ??
          (context.selectionContext.phaseStage === "growth" ? 40 : 30)
        : undefined;
    const carryReps =
      carryAccessory.loadType === "timed"
        ? undefined
        : templateAccessory?.reps ?? "8-12";
    const carryItem = makeItem(
      carryAccessory.id,
      carrySets,
      carryReps ?? undefined,
      carryDurationSec,
      carryRestSec,
      "accessory",
      {
        source: "coverage_repair",
        slotId: `${normalizeSlotToken(day.title)}-accessory-carry-finisher`,
        slotKind: "accessoryCarry",
        slotLane: "core",
        phaseIndex: phaseIndexFromStage(context.selectionContext.phaseStage),
      }
    );
    const nextRoutine = [...day.routine];
    nextRoutine.splice(insertIndex, 0, carryItem);
    nextWeek[shouldersIndex] = {
      ...day,
      routine: nextRoutine,
    };
    warnings.push("3-day carry policy added one carry finisher on Shoulders + Arms day.");
  };

  ensureShouldersDayCarry();

  const carryRefs = collectAccessoryCarryReferences(nextWeek);
  const shouldersCarryRefs = carryRefs
    .filter((ref) => ref.dayIndex === shouldersIndex)
    .sort((left, right) => left.itemIndex - right.itemIndex);
  if (shouldersCarryRefs.length > 1) {
    const keepRef = shouldersCarryRefs[shouldersCarryRefs.length - 1];
    const refsToReplace = shouldersCarryRefs.filter(
      (ref) => ref.itemIndex !== keepRef.itemIndex
    );
    refsToReplace.forEach((ref) => {
      const day = nextWeek[ref.dayIndex];
      const usedIds = new Set(
        day.routine
          .filter((item, index) => index !== ref.itemIndex)
          .map((item) => item.exerciseId)
      );
      const fallback = pickNonCarryAccessoryFallbackForDay({
        day,
        context,
        usedIds,
      });
      if (!fallback) return;
      nextWeek[ref.dayIndex] = replaceDayItemExercise(
        day,
        ref.itemIndex,
        fallback,
        "coverage_repair"
      );
      warnings.push(
        `3-day carry policy replaced extra Shoulders + Arms carry with ${fallback.id}.`
      );
    });
  }

  ensureShouldersDayCarry();

  return {
    week: nextWeek,
    warnings,
  };
};

const resolveFinalMainSlotMeta = (params: {
  day: ProgramDay;
  mainOrdinal: number;
  mainCount: number;
}) => {
  const { day, mainOrdinal, mainCount } = params;
  const plan = get3DayMainLanePlan(day.title, Math.max(1, mainCount));
  const plannedSlot = plan?.[mainOrdinal];
  return {
    slotId: `${normalizeSlotToken(day.title)}-main-${mainOrdinal + 1}`,
    slotKind: plannedSlot?.slotKind ?? "mainRepair",
    slotLane: plannedSlot?.lane as MainLane | undefined,
  };
};

const finalMainCandidateMatchesSlot = (params: {
  exercise: Exercise;
  dayTitle: string;
  slotKind?: string;
  slotLane?: MainLane;
}) => {
  const { exercise, dayTitle, slotKind, slotLane } = params;
  if (isBackChestDayTitle(dayTitle)) {
    return matchesBackChestMainSlotKind({
      exercise,
      slotKind: slotKind ?? "mainRepair",
      slotLane,
    });
  }
  if (isShouldersArmsDayTitle(dayTitle)) {
    return matchesShouldersArmsMainSlotKind({
      exercise,
      slotKind: slotKind ?? "mainShoulderRepair",
      slotLane,
      dayTitle,
    });
  }
  return slotLane ? matchesMainLanePattern(exercise, slotLane) : true;
};

const findFinalRoleLegalityReplacement = (params: {
  day: ProgramDay;
  itemIndex: number;
  section: "main" | "accessory";
  slotKind?: string;
  mainSlotLane?: MainLane;
  accessoryLane?: AccessoryLane;
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
}) => {
  const { day, itemIndex, section, slotKind, mainSlotLane, accessoryLane, usedIds, context } =
    params;
  const current = day.routine[itemIndex];
  if (!current) return null;
  const currentExercise = exerciseById(current.exerciseId);

  return exercises
    .filter((candidate) => {
      if (candidate.id === current.exerciseId) return false;
      if (usedIds.has(candidate.id)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise: candidate,
          available: context.available,
          section,
          context: context.selectionContext,
          dayTitle: day.title,
        })
      ) {
        return false;
      }
      if (
        !isRoleLegalForSlot({
          exercise: candidate,
          section,
          dayTitle: day.title,
          slotKind,
          mainSlotLane,
          accessoryLane,
          available: context.available,
          context: context.selectionContext,
        })
      ) {
        return false;
      }
      if (
        section === "main" &&
        !finalMainCandidateMatchesSlot({
          exercise: candidate,
          dayTitle: day.title,
          slotKind,
          slotLane: mainSlotLane,
        })
      ) {
        return false;
      }
      if (currentExercise && section === "main" && !mainSlotLane) {
        const overlaps = candidate.movementPattern.some((pattern) =>
          currentExercise.movementPattern.includes(pattern)
        );
        if (!overlaps) return false;
      }
      return true;
    })
    .map((candidate) => ({
      candidate,
      score: scoreExerciseForContextDetailed(
        candidate,
        section,
        context.selectionContext,
        context.available,
        {
          slotId: makeDaySlotId(day, itemIndex, section),
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind: slotKind ?? `${section}Repair`,
          slotLane: mainSlotLane,
          capabilityMode: context.capabilityMode,
        }
      ).score,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.candidate.id.localeCompare(right.candidate.id);
    })[0]?.candidate ?? null;
};

const findConstrainedShoulderMainFallback = (params: {
  day: ProgramDay;
  slotKind?: string;
  slotLane?: MainLane;
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
}) => {
  const { day, slotKind, slotLane, usedIds, context } = params;
  if (!isShouldersArmsDayTitle(day.title)) return null;
  const upperPain = hasUpperPainSignal(context.selectionContext);
  const wantsVerticalPush = slotLane === "verticalPush" || slotKind === "mainVerticalPushPrimary";
  const wantsLateral = slotLane === "push" || slotKind === "mainLateralDeltPrimary";
  const wantsRearDelt = slotLane === "pull" || slotKind === "mainShoulderPullPrimary";
  const safeFallbackIds = [
    ...(wantsVerticalPush
      ? [
          "machine-shoulder-press",
          "dumbbell-shoulder-press",
          "band-overhead-press",
          "dumbbell-lateral-raise",
          "cable-lateral-raise",
          "band-lateral-raise",
        ]
      : []),
    ...(wantsLateral
      ? [
          "dumbbell-lateral-raise",
          "cable-lateral-raise",
          "band-lateral-raise",
          "machine-shoulder-press",
          "dumbbell-shoulder-press",
          "band-overhead-press",
        ]
      : []),
    ...(wantsRearDelt
      ? [
          "machine-reverse-pec-deck",
          "cable-rear-delt-fly",
          "dumbbell-rear-delt-fly",
          "band-rear-delt-fly",
          "dumbbell-lateral-raise",
          "cable-lateral-raise",
          "band-lateral-raise",
        ]
      : []),
    "machine-shoulder-press",
    "dumbbell-shoulder-press",
    "band-overhead-press",
    "dumbbell-lateral-raise",
    "cable-lateral-raise",
    "band-lateral-raise",
    "machine-reverse-pec-deck",
    "cable-rear-delt-fly",
    "dumbbell-rear-delt-fly",
    "band-rear-delt-fly",
    ...(!upperPain ? ["prone-t-raise", "prone-swimmer", "reverse-snow-angel"] : []),
  ];
  return Array.from(new Set(safeFallbackIds))
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .find((exercise) => {
      if (usedIds.has(exercise.id)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      ) {
        return false;
      }
      if (
        classifyMainSlotIdentity({
          exercise,
          dayTitle: day.title,
          available: context.available,
          context: context.selectionContext,
        }) === "support_corrective"
      ) {
        return false;
      }
      const category = resolveShouldersArmsMainCategory(exercise);
      const matchesPreferredSlot =
        (wantsVerticalPush && category === "ohp") ||
        (wantsLateral && category === "lateral") ||
        (wantsRearDelt && category === "rearDeltMain");
      const safeSameDayMain =
        category === "ohp" || category === "lateral" || category === "rearDeltMain";
      if (matchesPreferredSlot || safeSameDayMain) return true;
      return isMainLegalForSlot({
        exercise,
        dayTitle: day.title,
        slotKind: slotKind ?? "mainShoulderRepair",
        slotLane,
        available: context.available,
        context: context.selectionContext,
      });
    }) ?? null;
};

const findConstrainedBackChestMainFallback = (params: {
  day: ProgramDay;
  slotKind?: string;
  slotLane?: MainLane;
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
}) => {
  const { day, slotKind, slotLane, usedIds, context } = params;
  if (!isBackChestDayTitle(day.title)) return null;
  const wantsPull = slotLane === "pull" || Boolean(slotKind?.includes("Pull"));
  const candidateIds = wantsPull
    ? [
        "machine-lat-pulldown",
        "cable-lat-pulldown",
        "band-lat-pulldown",
        "single-arm-dumbbell-row",
        "dumbbell-rows",
        "machine-seated-row",
        "cable-seated-row",
        "band-row",
        "split-stance-row",
        "banded-rows-seated",
        "supine-elbow-drive-row",
      ]
    : [
        "machine-chest-press",
        "dumbbell-floor-press",
        "dumbbell-bench-press",
        "split-stance-band-chest-press",
        "band-chest-press",
        "pushup",
      ];

  return candidateIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .find((exercise) => {
      if (usedIds.has(exercise.id)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      ) {
        return false;
      }
      if (
        classifyMainSlotIdentity({
          exercise,
          dayTitle: day.title,
          available: context.available,
          context: context.selectionContext,
        }) === "support_corrective"
      ) {
        return false;
      }
      if (!isBackChestMainBoundaryEligible({ exercise, allowChestFly: slotKind === "mainPushFly" })) {
        return false;
      }
      return wantsPull
        ? hasHorizontalPullSignature(exercise) || hasVerticalPullSignature(exercise)
        : hasHorizontalPushSignature(exercise);
    }) ?? null;
};

const findConstrainedLegsMainFallback = (params: {
  day: ProgramDay;
  slotLane?: MainLane;
  usedIds: Set<string>;
  context: DayConstraintRepairContext;
}) => {
  const { day, slotLane, usedIds, context } = params;
  if (!isLegsAbsDayTitle(day.title)) return null;
  const wantsHinge = slotLane === "hinge";
  const candidateIds = [
    ...(wantsHinge
      ? [
          "db-rdl",
          "dumbbell-sumo-rdl",
          "band-rdl",
          "machine-seated-hamstring-curl",
          "barbell-romanian-deadlift",
          "machine-glute-drive",
          "barbell-hip-thrust",
          "bodyweight-good-morning",
        ]
      : []),
    "machine-leg-press",
    "machine-hack-squat",
    "goblet-squat",
    "band-front-squat",
    "split-squat",
    "heels-elevated-squat",
    "cossack-squat",
    "db-rdl",
    "dumbbell-sumo-rdl",
    "band-rdl",
    "machine-seated-hamstring-curl",
  ];

  return Array.from(new Set(candidateIds))
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .find((exercise) => {
      if (usedIds.has(exercise.id)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
          dayTitle: day.title,
        })
      ) {
        return false;
      }
      if (
        classifyMainSlotIdentity({
          exercise,
          dayTitle: day.title,
          available: context.available,
          context: context.selectionContext,
        }) === "support_corrective"
      ) {
        return false;
      }
      return exerciseHasLowerMainPattern(exercise);
    }) ?? null;
};

const enforceFinalRoleLegality = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): { week: ProgramDay[]; warnings: string[] } => {
  const { week, daysPerWeek, context } = params;
  if (daysPerWeek !== 3) return { week, warnings: [] };
  if (
    !shouldApplyFinalRoleLegality({
      available: context.available,
      context: context.selectionContext,
    })
  ) {
    return { week, warnings: [] };
  }

  const warnings: string[] = [];
  const nextWeek = week.map((day) => {
    const mainEntries = day.routine
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.section === "main");
    const accessoryEntries = day.routine
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.section === "accessory");
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    let nextDay = day;

    mainEntries.forEach((entry, mainOrdinal) => {
      const exercise = exerciseById(entry.item.exerciseId);
      if (!exercise) return;
      const resolvedSlot = resolveFinalMainSlotMeta({
        day,
        mainOrdinal,
        mainCount: mainEntries.length,
      });
      const debugSlotKind = entry.item.selectionDebug?.slotKind;
      const useSpecificDebugSlot =
        Boolean(debugSlotKind) &&
        !debugSlotKind?.includes("Final") &&
        !debugSlotKind?.includes("Repair");
      const provenanceSlot = useSpecificDebugSlot
        ? {
            slotId: entry.item.selectionDebug?.slotId ?? resolvedSlot.slotId,
            slotKind: debugSlotKind ?? resolvedSlot.slotKind,
            slotLane: (entry.item.selectionDebug?.slotLane as MainLane | undefined) ?? resolvedSlot.slotLane,
          }
        : resolvedSlot;
      const slot =
        isShouldersArmsDayTitle(day.title) &&
        (provenanceSlot.slotKind === "mainShoulderStructuralSecondary" ||
          provenanceSlot.slotKind === "mainShoulderStructuralAlternate")
          ? {
              ...provenanceSlot,
              slotKind: "mainShoulderPullPrimary",
              slotLane: "pull" as MainLane,
            }
          : provenanceSlot;
      const legal = isMainLegalForSlot({
        exercise,
        dayTitle: day.title,
        slotKind: slot.slotKind,
        slotLane: slot.slotLane,
        available: context.available,
        context: context.selectionContext,
      });
      if (legal) return;
      usedIds.delete(entry.item.exerciseId);
      let replacement = findFinalRoleLegalityReplacement({
        day: nextDay,
        itemIndex: entry.itemIndex,
        section: "main",
        slotKind: slot.slotKind,
        mainSlotLane: slot.slotLane,
        usedIds,
        context,
      });
      if (
        !replacement &&
        isBackChestDayTitle(day.title) &&
        shouldApplyFinalRoleLegality({
          available: context.available,
          context: context.selectionContext,
        })
      ) {
        replacement = findConstrainedBackChestMainFallback({
          day: nextDay,
          slotKind: slot.slotKind,
          slotLane: slot.slotLane,
          usedIds,
          context,
        });
      }
      if (
        !replacement &&
        isShouldersArmsDayTitle(day.title) &&
        shouldApplyFinalRoleLegality({
          available: context.available,
          context: context.selectionContext,
        })
      ) {
        replacement = findConstrainedShoulderMainFallback({
          day: nextDay,
          slotKind: slot.slotKind,
          slotLane: slot.slotLane,
          usedIds,
          context,
        });
      }
      if (
        !replacement &&
        isLegsAbsDayTitle(day.title) &&
        shouldApplyFinalRoleLegality({
          available: context.available,
          context: context.selectionContext,
        })
      ) {
        replacement = findConstrainedLegsMainFallback({
          day: nextDay,
          slotLane: slot.slotLane,
          usedIds,
          context,
        });
      }
      if (!replacement) {
        usedIds.add(entry.item.exerciseId);
        return;
      }
      usedIds.add(replacement.id);
      nextDay = replaceDayItemExercise(nextDay, entry.itemIndex, replacement, "legality_repair");
      const updated = nextDay.routine[entry.itemIndex];
      if (updated) {
        const routine = [...nextDay.routine];
        routine[entry.itemIndex] = withSelectionDebug(updated, "legality_repair", {
          slotId: slot.slotId,
          slotKind: slot.slotKind,
          slotLane: slot.slotLane,
          phaseIndex: phaseIndexFromStage(context.selectionContext.phaseStage),
        });
        nextDay = { ...nextDay, routine };
      }
      warnings.push(
        `${day.title} main legality replaced ${entry.item.exerciseId} with ${replacement.id}.`
      );
    });

    accessoryEntries.forEach((entry) => {
      const exercise = exerciseById(entry.item.exerciseId);
      if (!exercise) return;
      const accessoryLane =
        (entry.item.selectionDebug?.slotLane as AccessoryLane | undefined) ??
        (isBackChestDayTitle(day.title) ? "back" : undefined);
      if (!accessoryLane) return;
      const legal = isAccessoryLegalForSlot({
        exercise,
        dayTitle: day.title,
        slotLane: accessoryLane,
        available: context.available,
        context: context.selectionContext,
      });
      if (legal) return;
      usedIds.delete(entry.item.exerciseId);
      const replacement = findFinalRoleLegalityReplacement({
        day: nextDay,
        itemIndex: entry.itemIndex,
        section: "accessory",
        accessoryLane,
        usedIds,
        context,
      });
      if (!replacement) {
        usedIds.add(entry.item.exerciseId);
        return;
      }
      usedIds.add(replacement.id);
      nextDay = replaceDayItemExercise(nextDay, entry.itemIndex, replacement, "legality_repair");
      warnings.push(
        `${day.title} accessory legality replaced ${entry.item.exerciseId} with ${replacement.id}.`
      );
    });

    return nextDay;
  });

  return { week: nextWeek, warnings };
};

const applyDayCurriculumConstraints = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: DayConstraintRepairContext;
}): WeekConstraintRepairResult => {
  const { week, daysPerWeek, context } = params;

  const accumulatedWarnings: WeekConstraintRepairResult["warnings"] = [];
  const repairedDays = week.map((day) => {
    const spec = resolveDayConstraintSpec({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    });
    const dayBudget = resolveDayPatternBudget({
      title: day.title,
      selectionContext: context.selectionContext,
    });
    if (!spec) {
      const budgetOnly = applyDayPatternBudget({
        day,
        budget: dayBudget,
        spec: null,
        context,
      });
      const contractEnforced = enforceDayContract({
        day: budgetOnly.day,
        contract: null,
        context,
        budget: dayBudget,
      });
      const coherenceEnforced = enforceDayMainCoherence({
        day: contractEnforced.day,
        daysPerWeek,
        context,
        budget: dayBudget,
      });
      accumulatedWarnings.push(
        ...budgetOnly.warnings.map((warning) => ({
          dayTitle: day.title,
          kind: warning.kind,
          message: warning.message,
        })),
        ...contractEnforced.warnings.map((warning) => ({
          dayTitle: day.title,
          kind: warning.kind,
          message: warning.message,
        })),
        ...coherenceEnforced.warnings.map((warning) => ({
          dayTitle: day.title,
          kind: warning.kind,
          message: warning.message,
        }))
      );
      return ensureDayHasDumbbellMain({
        day: coherenceEnforced.day,
        context,
        budget: dayBudget,
      });
    }
    const repaired = repairDayToMeetSpec(day, spec, context);
    const budgetAdjusted = applyDayPatternBudget({
      day: repaired.day,
      budget: dayBudget,
      spec,
      context,
    });
    const contractEnforced = enforceDayContract({
      day: budgetAdjusted.day,
      contract: spec,
      context,
      budget: dayBudget,
    });
    const coherenceEnforced = enforceDayMainCoherence({
      day: contractEnforced.day,
      daysPerWeek,
      context,
      budget: dayBudget,
    });
    accumulatedWarnings.push(
      ...repaired.warnings.map((warning) => ({
        dayTitle: day.title,
        kind: warning.kind,
        message: warning.message,
      })),
      ...budgetAdjusted.warnings.map((warning) => ({
        dayTitle: day.title,
        kind: warning.kind,
        message: warning.message,
      })),
      ...contractEnforced.warnings.map((warning) => ({
        dayTitle: day.title,
        kind: warning.kind,
        message: warning.message,
      })),
      ...coherenceEnforced.warnings.map((warning) => ({
        dayTitle: day.title,
        kind: warning.kind,
        message: warning.message,
      }))
    );
    return ensureDayHasDumbbellMain({
      day: coherenceEnforced.day,
      context,
      budget: dayBudget,
    });
  });

  const weeklyRepaired = applyWeeklyCoverageRepairs({
    week: repairedDays,
    daysPerWeek,
    context,
  });
  const architectureAdjustedWeek = weeklyRepaired.week.map((day) => {
    const dayBudget = resolveDayPatternBudget({
      title: day.title,
      selectionContext: context.selectionContext,
    });
    const repairedBackChest = repairBackChestDayIntelligence({
      day,
      daysPerWeek,
      context,
    });
    repairedBackChest.warnings.forEach((message) => {
      accumulatedWarnings.push({
        dayTitle: day.title,
        kind: "violation",
        message,
      });
    });
    const repairedShouldersArms = repairShouldersArmsDayIntelligence({
      day: repairedBackChest.day,
      daysPerWeek,
      context,
    });
    repairedShouldersArms.warnings.forEach((message) => {
      accumulatedWarnings.push({
        dayTitle: day.title,
        kind: "violation",
        message,
      });
    });
    const repairedLegsAbs = repairLegsAbsDayIntelligence({
      day: repairedShouldersArms.day,
      daysPerWeek,
      context,
    });
    repairedLegsAbs.warnings.forEach((message) => {
      accumulatedWarnings.push({
        dayTitle: day.title,
        kind: "violation",
        message,
      });
    });
    return ensureDayHasDumbbellMain({
      day: repairedLegsAbs.day,
      context,
      budget: dayBudget,
    });
  });
  const beginnerCarryAdjusted = enforceBeginnerThreeDayCarryPolicy({
    week: architectureAdjustedWeek,
    daysPerWeek,
    context,
  });
  beginnerCarryAdjusted.warnings.forEach((message) => {
    accumulatedWarnings.push({
      dayTitle: "Shoulders + Arms",
      kind: "coverage",
      message,
    });
  });
  const roleLegalAdjusted = enforceFinalRoleLegality({
    week: beginnerCarryAdjusted.week,
    daysPerWeek,
    context,
  });
  roleLegalAdjusted.warnings.forEach((message) => {
    accumulatedWarnings.push({
      dayTitle: "Program role legality",
      kind: "violation",
      message,
    });
  });
  const dumbbellEnsuredWeek = roleLegalAdjusted.week.map((day) =>
    ensureDayHasDumbbellMain({
      day,
      context,
      budget: resolveDayPatternBudget({
        title: day.title,
        selectionContext: context.selectionContext,
      }),
    })
  );
  const postDumbbellRoleLegalAdjusted = enforceFinalRoleLegality({
    week: dumbbellEnsuredWeek,
    daysPerWeek,
    context,
  });
  postDumbbellRoleLegalAdjusted.warnings.forEach((message) => {
    accumulatedWarnings.push({
      dayTitle: "Program role legality",
      kind: "violation",
      message,
    });
  });
  const finalWeek = postDumbbellRoleLegalAdjusted.week.map((day) =>
    isLegsAbsDayTitle(day.title)
      ? ensureDayHasDumbbellMain({
          day,
          context,
          budget: resolveDayPatternBudget({
            title: day.title,
            selectionContext: context.selectionContext,
          }),
        })
      : day
  );

  const persistentWarnings: WeekConstraintRepairResult["warnings"] = [];
  finalWeek.forEach((day) => {
    const spec = resolveDayConstraintSpec({
      day,
      daysPerWeek,
      capabilityMode: context.capabilityMode,
    });
    if (!spec) return;
    const validation = daySatisfiesSpec(day, spec);
    validation.missing.forEach((missingRule) => {
      persistentWarnings.push({
        dayTitle: day.title,
        kind: "missing",
        message: `Missing "${ruleLabel(missingRule)}" on ${day.title} after repair.`,
      });
    });
    validation.violations.forEach((violation) => {
      persistentWarnings.push({
        dayTitle: day.title,
        kind: "violation",
        message: `Violation "${ruleLabel(violation.rule)}" remained on ${day.title} (${violation.exerciseName}).`,
      });
    });
  });

  return {
    week: finalWeek,
    warnings: [...accumulatedWarnings, ...persistentWarnings, ...weeklyRepaired.warnings],
  };
};

const canMoveFloorPressToPainSafeFallback = (params: {
  day: ProgramDay;
  context: DayConstraintRepairContext;
}) => {
  const { day, context } = params;
  if (!isBackChestDayTitle(day.title)) return day;
  if (context.selectionContext.experienceLevel === "beginner") return day;
  if (context.selectionContext.painSeverity !== "low") return day;
  const routine = day.routine.map((item) => {
    if (item.section !== "main") return item;
    if (item.exerciseId !== "dumbbell-floor-press" && item.exerciseId !== "barbell-floor-press") {
      return item;
    }
    const replacementIds = [
      "machine-chest-press",
      "dumbbell-bench-press",
      "dumbbell-incline-press",
      "barbell-bench-press-paused",
    ];
    const replacement = replacementIds
      .map((id) => exerciseById(id))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .find((exercise) =>
        isExerciseEligibleForProgramContext({
          exercise,
          available: context.available,
          section: "main",
          context: context.selectionContext,
        })
      );
    if (!replacement) return item;
    return {
      ...item,
      exerciseId: replacement.id,
      loadType: replacement.loadType,
      cues: buildProgramCues(replacement, item.section),
    };
  });
  return { ...day, routine };
};

const bumpSets = (sets: string | number | null | undefined) => {
  if (!sets) return sets ?? null;
  if (typeof sets === "number") {
    return Math.min(5, sets + 1);
  }
  const cleaned = sets.replace("–", "-");
  const parts = cleaned.split("-").map((part) => Number(part.trim()));
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return String(Math.min(5, parts[0] + 1));
  }
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    return `${Math.min(5, parts[0] + 1)}-${Math.min(6, parts[1] + 1)}`;
  }
  return sets;
};

const bumpReps = (reps?: string | null) => {
  if (!reps) return reps ?? null;
  const cleaned = reps.replace("–", "-");
  const match = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const min = Number(match[1]);
    const max = Number(match[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return `${min + 1}-${max + 1}`;
    }
  }
  const single = cleaned.match(/(\d+)/);
  if (single) {
    const value = Number(single[1]);
    if (Number.isFinite(value)) {
      return reps.replace(String(value), String(value + 1));
    }
  }
  return reps;
};

const adjustSets = (sets: string | number | null | undefined, delta: number) => {
  if (!sets || delta === 0) return sets ?? null;
  if (delta > 0) return bumpSets(sets);
  if (typeof sets === "number") {
    return Math.max(1, sets - 1);
  }
  const cleaned = sets.replace("–", "-");
  const parts = cleaned.split("-").map((part) => Number(part.trim()));
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    const min = Math.max(1, parts[0] - 1);
    const max = Math.max(min, parts[1] - 1);
    return `${min}-${max}`;
  }
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return String(Math.max(1, parts[0] - 1));
  }
  return sets;
};

const adjustReps = (reps?: string | null, delta = 0) => {
  if (!reps || delta === 0) return reps ?? null;
  if (delta > 0) return bumpReps(reps);
  const cleaned = reps.replace("–", "-");
  const match = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const min = Math.max(1, Number(match[1]) - 1);
    const max = Math.max(min, Number(match[2]) - 1);
    return `${min}-${max}`;
  }
  const single = cleaned.match(/(\d+)/);
  if (single) {
    const value = Number(single[1]);
    if (Number.isFinite(value)) {
      const next = Math.max(1, value - 1);
      return reps.replace(String(value), String(next));
    }
  }
  return reps;
};

const phaseUpgradeMap: Record<string, { phase2?: string; phase3?: string }> = {
  "wall-angel-hold": { phase2: "scapular-pushups", phase3: "scapular-pushups" },
  "prone-ytw": { phase2: "band-row", phase3: "dumbbell-rows" },
  "band-pull-aparts": { phase3: "face-pull" },
  "glute-bridges": { phase2: "single-leg-hip-thrust", phase3: "single-leg-rdl" },
  "single-leg-glute-bridge-hold": { phase2: "back-extension-hold", phase3: "db-rdl" },
  "back-extension-hold": { phase2: "back-extension", phase3: "db-rdl" },
  "dead-bug": { phase2: "plank", phase3: "plank" },
  "bird-dog": { phase3: "plank" },
  "bodyweight-squat": { phase2: "split-squat", phase3: "machine-leg-press" },
  "cossack-squat": { phase2: "machine-leg-press", phase3: "dumbbell-step-up-loaded" },
  "incline-pushup": { phase2: "dumbbell-floor-press", phase3: "dumbbell-bench-press" },
  "band-chest-press": { phase2: "dumbbell-floor-press", phase3: "dumbbell-bench-press" },
  "band-overhead-press": { phase2: "machine-shoulder-press", phase3: "dumbbell-shoulder-press" },
  "machine-seated-row": { phase2: "machine-lat-pulldown", phase3: "dumbbell-chest-supported-row" },
  pushup: { phase2: "dumbbell-floor-press", phase3: "dumbbell-bench-press" },
};

const upgradeExerciseId = (
  exerciseId: string,
  phaseIndex: number,
  available: Set<Equipment>,
  context?: SelectionContext
) => {
  if (phaseIndex <= 1) return exerciseId;
  const upgrade = phaseUpgradeMap[exerciseId];
  if (!upgrade) return exerciseId;
  const target =
    phaseIndex >= 3 ? upgrade.phase3 ?? upgrade.phase2 : upgrade.phase2;
  if (!target) return exerciseId;
  const candidate = exerciseById(target);
  if (
    candidate &&
    (context
      ? isExerciseEligibleForProgramContext({
          exercise: candidate,
          available,
          section: "main",
          context,
        })
      : isExerciseEligible(candidate, available))
  ) {
    return candidate.id;
  }
  return exerciseId;
};

const cycleVariationMap: Record<string, string[]> = {
  "dumbbell-rows": ["split-stance-row", "band-row", "prone-ytw"],
  "machine-seated-row": ["dumbbell-rows", "machine-lat-pulldown", "split-stance-row"],
  "machine-leg-press": ["split-squat", "heels-elevated-squat", "dumbbell-step-up-loaded"],
  "glute-bridges": ["hip-hinge-drill", "single-leg-rdl"],
  "db-rdl": ["back-extension", "back-extension-hold", "single-leg-rdl"],
  "back-extension-hold": ["back-extension", "db-rdl", "single-leg-rdl"],
  "dead-bug": ["bird-dog", "plank"],
  "face-pull": ["reverse-snow-angel", "band-pull-aparts"],
  "pallof-press": ["plank", "dead-bug"],
  "bodyweight-squat": ["split-squat"],
  "dumbbell-floor-press": ["dumbbell-bench-press", "dumbbell-chest-fly"],
  "dumbbell-bench-press": ["dumbbell-chest-fly", "dumbbell-shoulder-press"],
  "machine-shoulder-press": ["dumbbell-shoulder-press", "dumbbell-arnold-press"],
  "dumbbell-shoulder-press": ["dumbbell-lateral-raise", "pike-pushup"],
  "band-chest-press": ["incline-pushup", "pushup", "dumbbell-floor-press"],
  "band-overhead-press": [
    "machine-shoulder-press",
    "dumbbell-shoulder-press",
    "dumbbell-arnold-press",
  ],
  "band-rdl": ["single-leg-rdl", "back-extension-hold", "back-extension"],
  "back-extension": ["single-leg-rdl", "band-rdl", "back-extension-hold"],
  "band-front-squat": ["machine-leg-press", "split-squat", "heels-elevated-squat"],
  "band-lat-pulldown": ["band-row", "dumbbell-rows", "back-widow"],
  "band-woodchop": ["pallof-press", "side-plank-star"],
  pushup: ["incline-pushup", "pike-pushup"],
};

const isExerciseAllowedForSection = (
  exercise: Exercise,
  section?: ProgramRoutineItem["section"]
) => {
  if (!section) return true;
  if (section === "main") return exercise.category === "main";
  if (section === "activation")
    return exercise.category === "activation" || exercise.category === "warmup";
  if (section === "warmup")
    return exercise.category === "warmup" || exercise.category === "activation";
  if (section === "accessory") return exercise.category === "main";
  if (section === "cooldown")
    return exercise.category === "cooldown" || exercise.category === "warmup";
  return true;
};

const isHingeLoadPatternExercise = (exercise: Exercise) => {
  const hasHingePattern = exercise.movementPattern.some(
    (pattern) => normalizeTagToken(pattern) === "hinge"
  );
  if (!hasHingePattern) return false;
  return exercise.movementIntensity === "load";
};

const isDeadliftLikeExercise = (exercise: Exercise) => {
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return token.includes("deadlift") || token.includes("rdl");
};

const isActivationMachineMainPrimer = (exercise: Exercise) => {
  if (!exercise.equipment.includes("machines")) return false;
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  return (
    patterns.has("push") ||
    patterns.has("verticalpush") ||
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull") ||
    patterns.has("squat") ||
    patterns.has("hinge")
  );
};

const isBandOnlyBodyweightFallbackExercise = (exercise: Exercise) => {
  if (exercise.loadType !== "bodyweight") return false;
  if (exercise.equipment.includes("none")) return true;
  const idToken = exercise.id.toLowerCase();
  return (
    idToken.includes("pushup") &&
    exercise.equipment.every((item) => item === "bench")
  );
};

export const isEligibleForPhase = (
  exercise: Exercise,
  phaseName: string,
  context: SelectionContext
) => {
  const currentStage = phaseStageFromName(phaseName, phaseStageRank[context.phaseStage] + 1);
  const minimumStage = normalizePhaseMin(exercise.phaseMin);
  const inActivation = currentStage === "activation";
  const allowActivationMachineMainPrimer =
    inActivation &&
    minimumStage === "activation" &&
    isActivationMachineMainPrimer(exercise);
  const allowActivationPulloverAccessoryPrimer =
    inActivation &&
    exercise.id === "dumbbell-pullover" &&
    context.capabilityMode === "hasLoad" &&
    context.painSeverity !== "high";
  const activationPrimerException =
    allowActivationMachineMainPrimer || allowActivationPulloverAccessoryPrimer;
  if (phaseStageRank[currentStage] < phaseStageRank[minimumStage]) {
    if (!activationPrimerException) {
      return false;
    }
  }

  if (inActivation && isDeadliftLikeExercise(exercise)) {
    // Deadlift/RDL variants are intentionally deferred until skill/growth.
    return false;
  }

  const isBeginner = context.experienceLevel === "beginner";
  const isBeginnerOrIntermediate =
    isBeginner || context.experienceLevel === "intermediate";
  if (inActivation && isBeginnerOrIntermediate) {
    if (exercise.difficultyTier === "hard" && !activationPrimerException) {
      return false;
    }
  }

  const blockActivationHingeLoad =
    inActivation &&
    isHingeLoadPatternExercise(exercise) &&
    (isBeginner ||
      context.capabilityMode !== "hasLoad" ||
      context.painSeverity !== "low");
  if (blockActivationHingeLoad) {
    return false;
  }

  return true;
};

const isExerciseEligibleForProgramContext = (params: {
  exercise: Exercise;
  available: Set<Equipment>;
  section?: ProgramRoutineItem["section"];
  context: SelectionContext;
  dayTitle?: string;
}) => {
  const { exercise, available, section, context, dayTitle } = params;
  if (exercise.experienceMin) {
    const minimumExperience = normalizeExperienceLevel(exercise.experienceMin);
    if (experienceRankByLevel[context.experienceLevel] < experienceRankByLevel[minimumExperience]) {
      return false;
    }
  }
  if (
    section === "main" &&
    context.experienceLevel === "beginner" &&
    isLegsBackSquatExercise(exercise)
  ) {
    return false;
  }
  const intent = context.intentProfile;
  if (section === "main" && exercise.id === "goblet-squat" && available.has("machines")) {
    return false;
  }
  if (
    section === "main" &&
    context.capabilityMode === "hasLoad" &&
    context.experienceLevel !== "beginner" &&
    context.painSeverity === "low" &&
    context.painAreas.length === 0 &&
    [
      "seated-lat-sweep-pulse",
      "prone-elbow-row",
      "supine-elbow-drive-row",
      "back-widow",
      "prone-swimmer",
      "reverse-snow-angel",
    ].includes(exercise.id)
  ) {
    const allowShouldersArmsFallbackScapMain =
      Boolean(dayTitle && isShouldersArmsDayTitle(dayTitle)) &&
      (exercise.id === "prone-swimmer" || exercise.id === "reverse-snow-angel");
    if (!allowShouldersArmsFallbackScapMain) {
      return false;
    }
  }
  if (section === "main" && dayTitle) {
    const upperIntentDay = isUpperIntentDayTitle(dayTitle);
    const lowerIntentDay = isLowerIntentDayTitle(dayTitle);
    const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
    const postureActivationBeginnerHingeControl =
      upperIntentDay &&
      context.intentProfile.primaryGoal === "posture" &&
      context.phaseStage === "activation" &&
      context.experienceLevel === "beginner" &&
      patterns.has("hinge") &&
      !patterns.has("squat");

    if (
      upperIntentDay &&
      exerciseHasLowerMainPattern(exercise) &&
      !postureActivationBeginnerHingeControl
    ) {
      return false;
    }
    if (lowerIntentDay && exerciseHasUpperMainPattern(exercise)) {
      return false;
    }
  }
  const equipmentEligible =
    isExerciseEligible(exercise, available) ||
    (context.capabilityMode === "bandOnly" &&
      isBandOnlyBodyweightFallbackExercise(exercise));
  if (
    section === "main" &&
    intent.avoidPatterns.includes("vertical_push_load") &&
    exerciseHasOverheadDemand(exercise) &&
    exercise.loadType === "weighted" &&
    context.phaseStage !== "growth"
  ) {
    const allowMachinePrimerInSkill =
      exercise.id === "machine-shoulder-press" &&
      context.phaseStage === "skill" &&
      context.capabilityMode === "hasLoad" &&
      context.painSeverity !== "high";
    if (allowMachinePrimerInSkill) {
      // Controlled machine path can be used as a primer before free-weight overhead loading.
    } else {
      return false;
    }
  }
  if (
    section === "main" &&
    intent.avoidPatterns.includes("heavy_hinge") &&
    (isHingeLoadPatternExercise(exercise) || isDeadliftLikeExercise(exercise)) &&
    context.phaseStage !== "growth"
  ) {
    return false;
  }
  return (
    equipmentEligible &&
    isExerciseAllowedForSection(exercise, section) &&
    isEligibleForPhase(exercise, context.phaseName, context)
  );
};

const applyCycleVariationId = (
  exerciseId: string,
  cycleIndex: number,
  available: Set<Equipment>,
  section?: ProgramRoutineItem["section"],
  context?: SelectionContext
) => {
  if (cycleIndex <= 1) return exerciseId;
  const options = cycleVariationMap[exerciseId];
  if (!options?.length) return exerciseId;
  const start = Math.max(0, (cycleIndex - 2) % options.length);
  for (let offset = 0; offset < options.length; offset += 1) {
    const candidateId = options[(start + offset) % options.length];
    const candidate = exerciseById(candidateId);
    if (
      candidate &&
      (context
        ? isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section,
            context,
          })
        : isExerciseEligible(candidate, available) &&
          isExerciseAllowedForSection(candidate, section))
    ) {
      return candidate.id;
    }
  }
  return exerciseId;
};

const pickSwapVariantId = (
  exerciseId: string,
  cycleIndex: number,
  available: Set<Equipment>,
  section?: ProgramRoutineItem["section"],
  context?: SelectionContext
) => {
  if (cycleIndex <= 1) return exerciseId;
  const exercise = exerciseById(exerciseId);
  if (!exercise?.swapOptions?.length) return exerciseId;
  const candidates = exercise.swapOptions
    .map((id) => exerciseById(id))
    .filter((candidate): candidate is Exclude<typeof candidate, undefined> => Boolean(candidate))
    .filter(
      (candidate) =>
        candidate.id !== exerciseId &&
        (context
          ? isExerciseEligibleForProgramContext({
              exercise: candidate,
              available,
              section,
              context,
            })
          : isExerciseEligible(candidate, available) &&
            isExerciseAllowedForSection(candidate, section))
    );
  if (!candidates.length) return exerciseId;
  return candidates[(cycleIndex - 2) % candidates.length].id;
};

const loadDemandScore = (loadType: ProgramRoutineItem["loadType"]) => {
  if (loadType === "weighted") return 4;
  if (loadType === "assisted") return 3;
  if (loadType === "bodyweight") return 2;
  return 1;
};

const movementDemandScore = (exercise?: Exercise) => {
  if (!exercise) return 0;
  let score = loadDemandScore(exercise.loadType);
  if (exercise.category === "main") score += 2;
  if (exercise.movementPattern.includes("single-leg")) score += 1;
  if (exercise.tags.includes("balance")) score += 1;
  return score;
};

const progressionCandidatesMap: Record<string, string[]> = {
  "incline-pushup": ["band-chest-press", "dumbbell-floor-press", "dumbbell-bench-press"],
  pushup: ["band-chest-press", "dumbbell-floor-press", "dumbbell-bench-press"],
  "band-chest-press": ["dumbbell-floor-press", "dumbbell-bench-press", "dumbbell-chest-fly"],
  "band-overhead-press": ["machine-shoulder-press", "dumbbell-shoulder-press", "dumbbell-arnold-press"],
  "machine-shoulder-press": ["dumbbell-shoulder-press", "dumbbell-arnold-press"],
  "dumbbell-shoulder-press": ["dumbbell-arnold-press"],
  "dumbbell-floor-press": ["dumbbell-bench-press", "dumbbell-chest-fly"],
  "dumbbell-rows": ["machine-seated-row", "machine-lat-pulldown", "dumbbell-chest-supported-row"],
  "machine-seated-row": ["machine-lat-pulldown", "dumbbell-chest-supported-row", "barbell-bent-over-row"],
  "glute-bridges": ["single-leg-hip-thrust", "single-leg-rdl"],
  "single-leg-glute-bridge-hold": ["back-extension-hold", "db-rdl", "machine-seated-hamstring-curl"],
  "back-extension-hold": ["back-extension", "db-rdl", "machine-seated-hamstring-curl"],
  "back-extension": ["db-rdl", "dumbbell-sumo-rdl", "machine-seated-hamstring-curl"],
  "db-rdl": ["dumbbell-sumo-rdl", "barbell-romanian-deadlift", "machine-glute-drive"],
  "bodyweight-squat": ["split-squat", "machine-leg-press"],
  "split-squat": ["machine-leg-press", "dumbbell-step-up-loaded", "machine-hack-squat"],
  "machine-leg-press": ["dumbbell-step-up-loaded", "machine-hack-squat", "barbell-back-squat"],
  "heels-elevated-squat": ["machine-leg-press", "dumbbell-step-up-loaded"],
  "cossack-squat": ["split-squat", "machine-leg-press"],
  "dead-bug": ["plank"],
};

export const getProgressionCandidateIdsForValidation = () => {
  const ids = new Set<string>();
  Object.entries(progressionCandidatesMap).forEach(([sourceId, targetIds]) => {
    ids.add(sourceId);
    targetIds.forEach((targetId) => ids.add(targetId));
  });
  return Array.from(ids);
};

const pickProgressiveVariant = (params: {
  currentId: string;
  usedIds: Set<string>;
  available: Set<Equipment>;
  context?: SelectionContext;
}) => {
  const { currentId, usedIds, available, context } = params;
  const current = exerciseById(currentId);
  if (!current) return null;
  const currentScore = movementDemandScore(current);
  const orderedIds = [
    ...(progressionCandidatesMap[currentId] ?? []),
    ...(current.swapOptions ?? []),
  ];
  for (const candidateId of orderedIds) {
    const candidate = exerciseById(candidateId);
    if (!candidate) continue;
    if (context?.capabilityMode === "hasLoad" && candidate.id === "goblet-squat") {
      continue;
    }
    if (candidate.id === "bodyweight-good-morning") {
      continue;
    }
    if (usedIds.has(candidate.id)) continue;
    if (
      context
        ? !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section: "main",
            context,
          })
        : !isExerciseEligible(candidate, available)
    ) {
      continue;
    }
    const patternOverlap = candidate.movementPattern.some((pattern) =>
      current.movementPattern.includes(pattern)
    );
    if (!patternOverlap) continue;
    if (movementDemandScore(candidate) <= currentScore) continue;
    return candidate;
  }
  return null;
};

const enforceProgressiveDemand = (params: {
  previousWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  available: Set<Equipment>;
  phaseIndex: number;
  cycleIndex: number;
  experienceLevel: ExperienceLevel;
  trainingState?: UserTrainingState;
  selectionContext?: SelectionContext;
}) => {
  const {
    previousWeek,
    nextWeek,
    available,
    phaseIndex,
    cycleIndex,
    experienceLevel,
    trainingState,
    selectionContext,
  } = params;
  if (phaseIndex <= 1 && cycleIndex <= 1) return nextWeek;
  const policy = buildProgressionPolicy({
    experienceLevel,
    phaseIndex,
    cycleIndex,
    trainingState,
  });
  if (!policy.allowDemandIncrease || policy.maxDemandUpgradesPerDay <= 0) return nextWeek;

  const previousByDay = new Map(previousWeek.map((day) => [day.dayIndex, day]));
  return nextWeek.map((day) => {
    const previousDay = previousByDay.get(day.dayIndex);
    if (!previousDay) return day;
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    let upgradesApplied = 0;

    const routine = day.routine.map((item, index) => {
      const previousItem = previousDay.routine[index];
      if (!previousItem) return item;
      const currentExercise = exerciseById(item.exerciseId);
      const previousExercise = exerciseById(previousItem.exerciseId);
      if (!currentExercise || !previousExercise) return item;
      if (currentExercise.category !== "main") return item;

      const noDemandIncrease =
        movementDemandScore(currentExercise) <= movementDemandScore(previousExercise);
      if (!noDemandIncrease) return item;
      if (upgradesApplied >= policy.maxDemandUpgradesPerDay) return item;

      const upgrade = pickProgressiveVariant({
        currentId: currentExercise.id,
        usedIds,
        available,
        context: selectionContext,
      });
      if (!upgrade) return item;
      usedIds.delete(item.exerciseId);
      usedIds.add(upgrade.id);
      upgradesApplied += 1;
      return {
        ...item,
        exerciseId: upgrade.id,
        loadType: upgrade.loadType,
        cues: buildProgramCues(upgrade, item.section),
      };
    });

    return { ...day, routine };
  });
};

const progressiveChestPushMainIds = [
  "dumbbell-floor-press",
  "dumbbell-bench-press",
  "dumbbell-chest-fly",
] as const;

const ensureWeekHasProgressiveChestPushMain = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
  capabilityMode: EquipmentCapabilityMode;
  phaseIndex: number;
}) => {
  const { week, daysPerWeek, available, selectionContext, capabilityMode, phaseIndex } = params;
  if (phaseIndex < 2) return week;
  if (capabilityMode !== "hasLoad") return week;
  if (!available.has("dumbbells")) return week;

  const hasRequiredPushMain = week.some((day) =>
    day.routine.some(
      (item) =>
        item.section === "main" &&
        progressiveChestPushMainIds.includes(item.exerciseId as (typeof progressiveChestPushMainIds)[number])
    )
  );
  if (hasRequiredPushMain) return week;

  const dayOrder = week
    .map((day, index) => ({ day, index }))
    .sort((left, right) => {
      const score = (candidate: ProgramDay) => {
        const title = candidate.title.toLowerCase();
        let value = 0;
        if (title.includes("back + chest")) value += 10;
        if (title.includes("upper push")) value += 8;
        if (title.includes("push")) value += 5;
        if (candidate.focusTags.some((tag) => normalizeTagToken(tag).includes("chest"))) {
          value += 4;
        }
        if (candidate.focusTags.some((tag) => normalizeTagToken(tag).includes("push"))) {
          value += 3;
        }
        return value;
      };
      const rightScore = score(right.day);
      const leftScore = score(left.day);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return left.index - right.index;
    });

  for (const { day, index: dayIndex } of dayOrder) {
    const daySpec = resolveDayConstraintSpec({
      day,
      daysPerWeek,
      capabilityMode,
    });
    const mainEntries = buildDayEntries(day).filter((entry) => entry.item.section === "main");
    if (!mainEntries.length) continue;

    const preferredTargets = [
      ...mainEntries.filter((entry) =>
        entry.exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "push")
      ),
      ...mainEntries.filter(
        (entry) =>
          !entry.exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "push")
      ),
    ];

    for (const target of preferredTargets) {
      const usedIds = new Set(day.routine.map((item) => item.exerciseId));
      usedIds.delete(target.exercise.id);

      for (const candidateId of progressiveChestPushMainIds) {
        const candidate = exerciseById(candidateId);
        if (!candidate) continue;
        if (usedIds.has(candidate.id)) continue;
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section: "main",
            context: selectionContext,
          })
        ) {
          continue;
        }

        const simulated = replaceDayItemExercise(day, target.index, candidate);
        if (daySpec && !daySatisfiesSpec(simulated, daySpec).ok) continue;

        return week.map((entry, index) => (index === dayIndex ? simulated : entry));
      }
    }
  }

  return week;
};

const routineIdSignature = (day: ProgramDay) =>
  day.routine.map((item) => item.exerciseId).join("|");

const enforceMaterialWeekChange = (params: {
  currentWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  cycleIndex: number;
  available: Set<Equipment>;
  selectionContext?: SelectionContext;
}) => {
  const { currentWeek, nextWeek, cycleIndex, available, selectionContext } = params;
  const currentByDay = new Map(currentWeek.map((day) => [day.dayIndex, day]));
  return nextWeek.map((day) => {
    const currentDay = currentByDay.get(day.dayIndex);
    if (!currentDay) return day;
    if (routineIdSignature(day) !== routineIdSignature(currentDay)) return day;

    const mainIndex = day.routine.findIndex((item) => {
      const exercise = exerciseById(item.exerciseId);
      return exercise?.category === "main";
    });
    if (mainIndex < 0) return day;

    const item = day.routine[mainIndex];
    const variantId = pickSwapVariantId(
      item.exerciseId,
      cycleIndex + 1,
      available,
      item.section,
      selectionContext
    );
    if (variantId === item.exerciseId) return day;

    const variant = exerciseById(variantId);
    const routine = [...day.routine];
    routine[mainIndex] = {
      ...item,
      exerciseId: variantId,
      loadType: variant?.loadType ?? item.loadType,
      cues: buildProgramCues(variant ?? undefined, item.section) ?? item.cues,
    };
    return { ...day, routine };
  });
};

const painAreaPriorityTags: Record<string, string[]> = {
  neck: ["neck", "t-spine", "scap", "breath"],
  "upper back": ["upper-back", "scap", "t-spine"],
  "lower back": ["core", "tva", "hinge", "hips"],
  shoulders: ["scap", "upper-back", "shoulders"],
  hips: ["hips", "glutes", "hinge", "balance"],
  knees: ["legs", "squat", "ankles", "glutes"],
};

const sharedItemsCount = (a: string[], b: string[]) => {
  const right = new Set(b);
  return a.reduce((count, item) => (right.has(item) ? count + 1 : count), 0);
};

const scoreCandidateForProgression = (params: {
  candidate: Exercise;
  baseline?: Exercise;
  cycleIndex: number;
  phaseIndex: number;
  priorityTags: Set<string>;
  currentWeekIds: Set<string>;
}) => {
  const { candidate, baseline, cycleIndex, phaseIndex, priorityTags, currentWeekIds } =
    params;
  let score = 0;
  if (baseline) {
    if (candidate.category === baseline.category) score += 2;
    score += sharedItemsCount(candidate.movementPattern, baseline.movementPattern) * 3;
    score += sharedItemsCount(candidate.tags, baseline.tags) * 2;
    if (candidate.loadType === baseline.loadType) score += 1;
    if (phaseIndex >= 2 && baseline.loadType === "bodyweight") {
      if (candidate.loadType === "assisted" || candidate.loadType === "weighted") {
        score += 2;
      }
    }
  }
  score += candidate.tags.reduce(
    (sum, tag) => (priorityTags.has(tag.toLowerCase()) ? sum + 2 : sum),
    0
  );
  if (currentWeekIds.has(candidate.id)) score -= 5;
  score += cycleIndex;
  return score;
};

const remapWeekForProgressiveNovelty = (params: {
  currentWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  available: Set<Equipment>;
  cycleIndex: number;
  phaseIndex: number;
  painAreas: string[];
  selectionContext: SelectionContext;
}) => {
  const {
    currentWeek,
    nextWeek,
    available,
    cycleIndex,
    phaseIndex,
    painAreas,
    selectionContext,
  } = params;
  if (cycleIndex <= 1) return nextWeek;

  const currentWeekIds = new Set(
    currentWeek.flatMap((day) => day.routine.map((item) => item.exerciseId))
  );
  const priorityTags = new Set(
    painAreas.flatMap((area) => painAreaPriorityTags[canonicalizePainArea(area)] ?? [])
  );

  return nextWeek.map((day) => {
    const currentDay = currentWeek.find((entry) => entry.dayIndex === day.dayIndex);
    const baselineBySlot = currentDay?.routine ?? [];
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    const maxSwaps = Math.max(2, Math.ceil(day.routine.length * 0.6));
    let swaps = 0;

    const routine = day.routine.map((item, index) => {
      const baseline = exerciseById(baselineBySlot[index]?.exerciseId ?? item.exerciseId);
      const baseExercise = exerciseById(item.exerciseId);
      if (!baseExercise || swaps >= maxSwaps) return item;
      if (baseExercise.category === "warmup" && index === 0) return item;

      const pool = exercises.filter((candidate) => {
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section: item.section,
            context: selectionContext,
          })
        ) {
          return false;
        }
        if (usedIds.has(candidate.id)) return false;
        if (candidate.id === baseExercise.id) return false;
        if (candidate.category !== baseExercise.category) return false;
        const patternOverlap = candidate.movementPattern.some((pattern) =>
          baseExercise.movementPattern.includes(pattern)
        );
        if (!patternOverlap) return false;
        return true;
      });
      if (!pool.length) return item;

      const sorted = [...pool].sort((left, right) => {
        const rightScore = scoreCandidateForProgression({
          candidate: right,
          baseline: baseline ?? baseExercise,
          cycleIndex,
          phaseIndex,
          priorityTags,
          currentWeekIds,
        });
        const leftScore = scoreCandidateForProgression({
          candidate: left,
          baseline: baseline ?? baseExercise,
          cycleIndex,
          phaseIndex,
          priorityTags,
          currentWeekIds,
        });
        if (rightScore !== leftScore) return rightScore - leftScore;
        return left.id.localeCompare(right.id);
      });
      const nextExercise = sorted[0];
      if (!nextExercise) return item;

      usedIds.add(nextExercise.id);
      swaps += 1;
      return {
        ...item,
        exerciseId: nextExercise.id,
        loadType: nextExercise.loadType,
        cues: buildProgramCues(nextExercise, item.section),
      };
    });

    return { ...day, routine };
  });
};

const adjustRoutineForPhase = (
  day: ProgramDay,
  phaseIndex: number,
  cycleIndex: number,
  goal: string,
  available: Set<Equipment>,
  experienceLevel: ExperienceLevel,
  trainingState?: UserTrainingState,
  painSeverity: PainSeverity = "low",
  selectionContext?: SelectionContext
) => {
  const cycle = getCycleLadder(cycleIndex);
  const profile = getPhaseProfile(phaseIndex);
  const policy = buildProgressionPolicy({
    experienceLevel,
    phaseIndex,
    cycleIndex,
    trainingState,
  });

  const updated = day.routine.map((item) => {
    const upgradedId =
      item.section === "main"
        ? upgradeExerciseId(
            item.exerciseId,
            phaseIndex,
            available,
            selectionContext
          )
        : item.exerciseId;
    const variedByMapId = applyCycleVariationId(
      upgradedId,
      cycleIndex,
      available,
      item.section,
      selectionContext
    );
    const variedId = pickSwapVariantId(
      variedByMapId,
      cycleIndex,
      available,
      item.section,
      selectionContext
    );
    const upgradedExercise = variedId !== item.exerciseId ? exerciseById(variedId) : null;
    const baseReps = item.reps ?? null;
    const phaseReps =
      profile.repBias === "lower"
        ? "6-8"
        : profile.repBias === "moderate"
        ? baseReps ?? "8-10"
        : baseReps ?? "10-12";
    const restBase = item.restSec ?? 60;
    const tempoNote =
      profile.controlFocus || cycle.tempo
        ? `Tempo: ${cycle.tempo ?? "controlled"}`
        : null;
    const strengthBias = goal === "Athletic performance";
    const isProgressionSection = item.section === "main" || item.section === "accessory";
    const nextReps =
      item.loadType === "weighted" && strengthBias
        ? "6-8"
        : phaseReps
        ? adjustReps(phaseReps, isProgressionSection ? policy.repsDelta : 0)
        : item.reps;
    const restFloor = item.section === "main" ? policy.minRestSec + 10 : policy.minRestSec;

    const adjustedItem: ProgramRoutineItem = {
      ...item,
      exerciseId: variedId,
      loadType: upgradedExercise?.loadType ?? item.loadType,
      cues: buildProgramCues(upgradedExercise ?? undefined, item.section) ?? item.cues,
      notes: item.notes ?? tempoNote,
      sets: adjustSets(item.sets, isProgressionSection ? policy.setsDelta : 0),
      reps: nextReps,
      durationSec: item.durationSec
        ? Math.max(20, Math.min(150, item.durationSec + (isProgressionSection ? policy.durationDeltaSec : 0)))
        : item.durationSec,
      restSec: Math.max(restFloor, restBase + policy.restDeltaSec),
    };
    if (item.section === "main" && painSeverity === "high") {
      return applyHighPainMainPrescription(adjustedItem);
    }
    return adjustedItem;
  });

  return { ...day, routine: updated };
};

const contraindicationHitsPainArea = (
  contraindications: string[] | undefined,
  painAreas: string[]
) => {
  if (!contraindications?.length || !painAreas.length) return false;
  const lowered = contraindications.join(" ").toLowerCase();
  return painAreas.some((area) => lowered.includes(area));
};

const isShoulderIsolationExercise = (exercise: Exercise) =>
  (exercise.tags ?? []).some((tag) => {
    const token = normalizeTagToken(tag);
    return token === "lateral_delt" || token === "shoulders_isolation";
  });

const isUpperIntentDayTitle = (title: string) => {
  const normalized = title.toLowerCase();
  return (
    normalized.includes("upper") ||
    normalized.includes("back + chest") ||
    normalized.includes("shoulders + arms") ||
    normalized.includes("arms + posture")
  );
};

const isLowerIntentDayTitle = (title: string) => {
  const normalized = title.toLowerCase();
  return (
    normalized.includes("lower") ||
    normalized.includes("legs") ||
    normalized.includes("squat") ||
    normalized.includes("hinge") ||
    normalized.includes("posterior") ||
    normalized.includes("abs")
  );
};

const exerciseHasLowerMainPattern = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  return patterns.has("squat") || patterns.has("hinge");
};

const exerciseHasUpperMainPattern = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  return patterns.has("push") || patterns.has("pull") || patterns.has("verticalpush");
};

const matchesMainLanePattern = (exercise: Exercise, lane: MainLane) => {
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  if (lane === "verticalPush") {
    return patterns.has("verticalpush");
  }
  if (lane === "push") {
    return patterns.has("push");
  }
  if (lane === "pull") {
    return patterns.has("pull");
  }
  if (lane === "squat") {
    return patterns.has("squat");
  }
  return patterns.has("hinge");
};

const matchesAccessoryLanePattern = (exercise: Exercise, lane: AccessoryLane) => {
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeTagToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeTagToken));
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();

  if (lane === "chest") {
    return (
      muscles.has("chest") ||
      tags.has("chest") ||
      patterns.has("horizontalpush") ||
      token.includes("chest") ||
      token.includes("bench") ||
      token.includes("fly") ||
      token.includes("pushup") ||
      token.includes("push-up")
    );
  }
  if (lane === "back") {
    return (
      patterns.has("pull") ||
      patterns.has("horizontalpull") ||
      patterns.has("verticalpull") ||
      tags.has("pull") ||
      tags.has("scap") ||
      tags.has("upper_back") ||
      tags.has("lats") ||
      tags.has("back") ||
      muscles.has("upper_back") ||
      muscles.has("lats") ||
      muscles.has("back") ||
      token.includes("row") ||
      token.includes("pull") ||
      token.includes("lat") ||
      token.includes("back")
    );
  }

  if (lane === "push") {
    return (
      patterns.has("push") ||
      patterns.has("verticalpush") ||
      patterns.has("horizontalpush") ||
      tags.has("push") ||
      tags.has("chest") ||
      tags.has("triceps") ||
      tags.has("shoulders") ||
      token.includes("push")
    );
  }
  if (lane === "pull") {
    return (
      patterns.has("pull") ||
      patterns.has("horizontalpull") ||
      patterns.has("verticalpull") ||
      tags.has("pull") ||
      tags.has("scap") ||
      tags.has("upper_back") ||
      tags.has("lats") ||
      tags.has("biceps") ||
      token.includes("row") ||
      token.includes("pull")
    );
  }
  if (lane === "lower") {
    return (
      patterns.has("squat") ||
      patterns.has("hinge") ||
      patterns.has("single_leg") ||
      tags.has("legs") ||
      tags.has("glutes") ||
      tags.has("quads") ||
      tags.has("hamstrings") ||
      tags.has("calves") ||
      token.includes("squat") ||
      token.includes("hinge") ||
      token.includes("lunge") ||
      token.includes("step-up") ||
      token.includes("stepup")
    );
  }
  return (
    patterns.has("core") ||
    patterns.has("anti_rotation") ||
    patterns.has("anti_extension") ||
    patterns.has("carry") ||
    tags.has("core") ||
    tags.has("anti_rotation") ||
    tags.has("anti_extension") ||
    tags.has("carry") ||
    tags.has("tva") ||
    tags.has("breath") ||
    token.includes("plank") ||
    token.includes("dead bug") ||
    token.includes("bird dog") ||
    token.includes("pallof")
  );
};

const inferSectionFocusFromDayTitle = (title: string): SectionFocus => {
  const normalized = title.toLowerCase();
  if (
    normalized.includes("legs") ||
    normalized.includes("lower") ||
    normalized.includes("squat") ||
    normalized.includes("hinge")
  ) {
    return "lower";
  }
  if (
    normalized.includes("core") ||
    normalized.includes("abs") ||
    normalized.includes("posture")
  ) {
    return "core";
  }
  return "upper";
};

const matchesSectionFocus = (exercise: Exercise, focus: SectionFocus) => {
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeTagToken));
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();

  if (focus === "upper") {
    return (
      patterns.has("push") ||
      patterns.has("verticalpush") ||
      patterns.has("pull") ||
      patterns.has("scapular") ||
      tags.has("upper") ||
      tags.has("upper_back") ||
      tags.has("scap") ||
      tags.has("chest") ||
      tags.has("shoulders") ||
      tags.has("neck") ||
      token.includes("row") ||
      token.includes("press") ||
      token.includes("pull")
    );
  }
  if (focus === "lower") {
    return (
      patterns.has("squat") ||
      patterns.has("hinge") ||
      patterns.has("single_leg") ||
      tags.has("legs") ||
      tags.has("glutes") ||
      tags.has("hamstrings") ||
      tags.has("quads") ||
      tags.has("hips") ||
      tags.has("ankles") ||
      tags.has("calves")
    );
  }
  return (
    patterns.has("core") ||
    patterns.has("anti_rotation") ||
    patterns.has("anti_extension") ||
    patterns.has("carry") ||
    tags.has("core") ||
    tags.has("tva") ||
    tags.has("anti_rotation") ||
    tags.has("breath") ||
    token.includes("plank") ||
    token.includes("dead bug")
  );
};

const resolveSplitTemplateForDay = (daysPerWeek: 3 | 4 | 5, dayTitle: string) =>
  getSplitTemplateSpecs(daysPerWeek).find((template) => template.title === dayTitle) ?? null;

type ThreeDayBlueprintAccessoryRole =
  | "posture_back"
  | "tri_iso"
  | "bi_iso"
  | "tri_iso_variant"
  | "bi_iso_variant"
  | "core"
  | "calves"
  | "extra_ab";

type ThreeDayBlueprint = {
  dayTitle: string;
  mainCount: number;
  accessoryCount: number;
  mainLanePlan: ThreeDayMainLanePlanEntry[];
  requiredMainFamilies: string[];
  accessoryRoles: ThreeDayBlueprintAccessoryRole[];
  laneSwapRules: Record<string, string[]>;
  constraints: {
    pullMainsAtLeastPressMains: boolean;
    noVerticalPushMain: boolean;
    noLowerBodyLeakMain: boolean;
    maxCarryAccessories: number;
    preventDuplicateCarries: boolean;
    carryCannotReplaceCore: boolean;
  };
  squatProgressionByPhase?: Record<ProgramPhaseStage, string[]>;
};

type ThreeDayBlueprintTemplateVariant = {
  key: string;
  mainLanePlan: ThreeDayMainLanePlanEntry[];
};

const resolveThreeDayTemplateFamilyLayoutSignature = (
  mainLanePlan: ThreeDayMainLanePlanEntry[]
) => mainLanePlan.map((entry) => normalizeTagToken(entry.family)).join("|");

const hasEligibleBackChestTemplateSlotCandidate = (params: {
  slot: ThreeDayMainLanePlanEntry;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
  dayTitle: string;
}) => {
  const { slot, available, selectionContext, dayTitle } = params;
  return exercises.some((exercise) => {
    if (exercise.category !== "main") return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context: selectionContext,
        dayTitle,
      })
    ) {
      return false;
    }
    if (
      !isBackChestMainBoundaryEligible({
        exercise,
        allowChestFly: slot.slotKind === "mainPushFly",
      })
    ) {
      return false;
    }
    return matchesBackChestMainSlotKind({
      exercise,
      slotKind: slot.slotKind,
      slotLane: slot.lane as MainLane,
    });
  });
};

const hasEligibleShouldersArmsTemplateSlotCandidate = (params: {
  slot: ThreeDayMainLanePlanEntry;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
  dayTitle: string;
}) => {
  const { slot, available, selectionContext, dayTitle } = params;
  return exercises.some((exercise) => {
    if (exercise.category !== "main") return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context: selectionContext,
        dayTitle,
      })
    ) {
      return false;
    }
    if (!isShouldersArmsMainBoundaryEligible(exercise)) return false;
    const category = resolveShouldersArmsMainCategory(exercise);
    if (slot.slotKind === "mainVerticalPushPrimary") return category === "ohp";
    if (slot.slotKind === "mainLateralDeltPrimary") return category === "lateral";
    if (slot.slotKind === "mainShoulderPullPrimary") return category === "rearDeltMain";
    if (
      slot.slotKind === "mainShoulderStructuralSecondary" ||
      slot.slotKind === "mainShoulderStructuralAlternate"
    ) {
      return category === "shoulderSupport";
    }
    return category === "rearDeltMain" || category === "shoulderSupport";
  });
};

const isEligibleThreeDayTemplateVariant = (params: {
  variant: ThreeDayBlueprintTemplateVariant;
  dayTitle: string;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}) => {
  const { variant, dayTitle, available, selectionContext } = params;
  const dayKey = normalizeSlotToken(dayTitle);
  if (dayKey === "back_chest") {
    return variant.mainLanePlan.every((slot) =>
      hasEligibleBackChestTemplateSlotCandidate({
        slot,
        available,
        selectionContext,
        dayTitle,
      })
    );
  }
  if (dayKey === "shoulders_arms") {
    return variant.mainLanePlan.every((slot) =>
      hasEligibleShouldersArmsTemplateSlotCandidate({
        slot,
        available,
        selectionContext,
        dayTitle,
      })
    );
  }
  return true;
};

const resolveThreeDayTemplateVariants = (params: {
  dayTitle: string;
  mainCount: number;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}): ThreeDayBlueprintTemplateVariant[] => {
  const { dayTitle, mainCount, available, selectionContext } = params;
  const dayKey = normalizeSlotToken(dayTitle);
  const defaultPlan = get3DayMainLanePlan(dayTitle, mainCount) ?? [];
  const experienceLevel = selectionContext.experienceLevel;

  if (dayKey === "back_chest") {
    const hasPulloverCandidate = exercises.some((exercise) => {
      if (exercise.category !== "main") return false;
      if (!isBackChestLatAccentExercise(exercise)) return false;
      return isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context: selectionContext,
        dayTitle,
      });
    });
    const hasRowCandidate = exercises.some((exercise) => {
      if (exercise.category !== "main") return false;
      if (!hasHorizontalPullSignature(exercise)) return false;
      return isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context: selectionContext,
        dayTitle,
      });
    });
    const hasVerticalCandidate = exercises.some((exercise) => {
      if (exercise.category !== "main") return false;
      if (!hasVerticalPullSignature(exercise)) return false;
      if (isBackChestLatAccentExercise(exercise)) return false;
      return isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context: selectionContext,
        dayTitle,
      });
    });

    if (experienceLevel === "beginner" && mainCount === 3) {
      const gymNoPain = isGymNoPainSelectionContext({ available, context: selectionContext });
      if (!gymNoPain) {
        const variants: ThreeDayBlueprintTemplateVariant[] = [
          {
            key: "back_chest_beginner_press_fly_vertical",
            mainLanePlan: [
              { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
              { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
              { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            ],
          },
          {
            key: "back_chest_beginner_press_fly_row",
            mainLanePlan: [
              { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
              { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
              { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            ],
          },
        ];
        if (hasPulloverCandidate) {
          variants.push({
            key: "back_chest_beginner_press_fly_pullover",
            mainLanePlan: [
              { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
              { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
              { lane: "pull", slotKind: "mainPullSupport", family: "pull_secondary" },
            ],
          });
        }
        return variants;
      }
      const variants: ThreeDayBlueprintTemplateVariant[] = [
        {
          key: "back_chest_beginner_press_row_vertical",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
          ],
        },
        {
          key: "back_chest_beginner_press_vertical_row",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
          ],
        },
      ];
      return variants;
    }

    if (experienceLevel === "intermediate" && mainCount === 4) {
      const variants: ThreeDayBlueprintTemplateVariant[] = [
        {
          key: "back_chest_intermediate_press_fly_row_vertical",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
          ],
        },
        {
          key: "back_chest_intermediate_press_fly_vertical_row",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
          ],
        },
      ];
      // Intermediate favors row+vertical templates when vertical-pull options exist.
      if (hasPulloverCandidate && hasRowCandidate && !hasVerticalCandidate) {
        variants.push({
          key: "back_chest_intermediate_press_fly_row_pullover",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullSupport", family: "pull_secondary" },
          ],
        });
      }
      return variants;
    }

    if (experienceLevel === "advanced" && mainCount >= 5) {
      const variants: ThreeDayBlueprintTemplateVariant[] = [
        {
          key: "back_chest_advanced_press_fly_row_vertical_row",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
          ],
        },
        {
          key: "back_chest_advanced_press_fly_row_vertical_vertical",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
          ],
        },
      ];
      if (hasPulloverCandidate && !isGymNoPainSelectionContext({ available, context: selectionContext })) {
        variants.push({
          key: "back_chest_advanced_press_fly_vertical_row_pullover",
          mainLanePlan: [
            { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
            { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
            { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
            { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
            { lane: "pull", slotKind: "mainPullSupport", family: "pull_secondary" },
          ],
        });
      }
      return variants;
    }
  }

  if (dayKey === "shoulders_arms") {
    const gymNoPain = isGymNoPainSelectionContext({ available, context: selectionContext });
    if (mainCount <= 3) {
      const variants: ThreeDayBlueprintTemplateVariant[] = [
        {
          key: "shoulders_arms_beginner_ohp_lateral_rear_delt",
          mainLanePlan: [
            { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
            { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
            { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
          ],
        },
      ];
      if (!gymNoPain) {
        variants.push({
          key: "shoulders_arms_beginner_ohp_lateral_support",
          mainLanePlan: [
            { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
            { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
            {
              lane: "pull",
              slotKind: "mainShoulderStructuralSecondary",
              family: "shoulder_structural_secondary",
            },
          ],
        });
      }
      return variants;
    }

    const gymNoPainVariants: ThreeDayBlueprintTemplateVariant[] = [
      {
        key: "shoulders_arms_ohp_lateral_rear_rear",
        mainLanePlan: [
          { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
        ],
      },
      {
        key: "shoulders_arms_ohp_lateral_lateral_rear",
        mainLanePlan: [
          { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
        ],
      },
    ];
    if (gymNoPain) return gymNoPainVariants;

    return [
      {
        key: "shoulders_arms_ohp_lateral_rear_support",
        mainLanePlan: [
          { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
          {
            lane: "pull",
            slotKind: "mainShoulderStructuralSecondary",
            family: "shoulder_structural_secondary",
          },
        ],
      },
      {
        key: "shoulders_arms_ohp_lateral_support_rear",
        mainLanePlan: [
          { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          {
            lane: "pull",
            slotKind: "mainShoulderStructuralSecondary",
            family: "shoulder_structural_secondary",
          },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
        ],
      },
      {
        key: "shoulders_arms_ohp_lateral_rear_support_alt",
        mainLanePlan: [
          { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
          { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt" },
          { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "shoulder_pull" },
          {
            lane: "pull",
            slotKind: "mainShoulderStructuralAlternate",
            family: "shoulder_structural_alternate",
          },
        ],
      },
    ];
  }

  return defaultPlan.length
    ? [
        {
          key: `${dayKey}_default`,
          mainLanePlan: defaultPlan,
        },
      ]
    : [];
};

const selectThreeDayTemplateVariant = (params: {
  dayTitle: string;
  mainCount: number;
  available: Set<Equipment>;
  selectionContext: SelectionContext;
}): ThreeDayBlueprintTemplateVariant | null => {
  const { dayTitle, mainCount, available, selectionContext } = params;
  const variants = resolveThreeDayTemplateVariants({
    dayTitle,
    mainCount,
    available,
    selectionContext,
  }).filter((variant) => variant.mainLanePlan.length === mainCount);
  const eligibleVariants = variants.filter((variant) =>
    isEligibleThreeDayTemplateVariant({
      variant,
      dayTitle,
      available,
      selectionContext,
    })
  );
  if (!eligibleVariants.length) return null;

  const variationState = selectionContext.variationState;
  const dayToken = normalizeSlotToken(dayTitle);
  const alreadySelectedKey = variationState?.selectedDayTemplateKeys.get(dayToken);
  if (alreadySelectedKey) {
    const alreadySelected = eligibleVariants.find((variant) => variant.key === alreadySelectedKey);
    if (alreadySelected) return alreadySelected;
  }

  if (!variationState?.enabled) {
    const chosen = eligibleVariants[0]!;
    variationState?.selectedDayTemplateKeys.set(dayToken, chosen.key);
    return chosen;
  }

  const phaseIndex = phaseIndexFromStage(selectionContext.phaseStage);
  const recentTemplateKeys = getVariationMemoryValuesForDayToken(
    variationState.memory.recentDayTemplateKeys,
    dayToken,
    phaseIndex
  );
  const recentFamilyLayouts = getVariationMemoryValuesForDayToken(
    variationState.memory.recentDayMainFamilyLayoutSignatures,
    dayToken,
    phaseIndex
  );
  const templateIntentTuning =
    dayToken === "back_chest" || dayToken === "shoulders_arms"
      ? {
          templateRepeatPenaltyMultiplier: 1.75,
          familyLayoutPenaltyMultiplier: 1.8,
        }
      : {
          templateRepeatPenaltyMultiplier: 1.35,
          familyLayoutPenaltyMultiplier: 1.5,
        };
  const ranked = eligibleVariants
    .map((variant, index) => {
      let score = (eligibleVariants.length - index) * 0.75;
      const familyLayout = resolveThreeDayTemplateFamilyLayoutSignature(variant.mainLanePlan);
      if (index === 0) {
        score += 0.25;
      }
      const previousTemplateIndex = recentTemplateKeys.indexOf(variant.key);
      if (previousTemplateIndex >= 0) {
        const penalty =
          Math.max(1.25, 3 - previousTemplateIndex * 0.75) *
          templateIntentTuning.templateRepeatPenaltyMultiplier;
        score -= penalty;
      }
      if (recentFamilyLayouts.includes(familyLayout)) {
        score -= 2.25 * templateIntentTuning.familyLayoutPenaltyMultiplier;
      }
      return {
        variant,
        familyLayout,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.variant.key.localeCompare(right.variant.key);
    });
  const topBand = getProgramVariationBandForRankedEntries(ranked, variationState.config);
  const variationIndex = resolveProgramVariationIndex(variationState.options);
  const settingsToken = String(
    variationState.options.settingsHash ?? variationState.settingsKey
  ).trim();
  const seedAlignedOffset = topBand.length
    ? Math.floor(
        stableHashUnit(
          [
            settingsToken || variationState.settingsKey,
            variationState.options.seed ?? "default",
            dayToken,
            `phase:${phaseIndex}`,
            "template-variant-rotation",
          ].join("|")
        ) * topBand.length
      )
    : 0;
  const rotatedIndex = topBand.length
    ? (seedAlignedOffset + variationIndex) % topBand.length
    : 0;
  const chosenEntry = topBand[rotatedIndex] ?? ranked[0];
  if (!chosenEntry) return eligibleVariants[0] ?? null;
  variationState.selectedDayTemplateKeys.set(dayToken, chosenEntry.variant.key);
  return chosenEntry.variant;
};

const resolveThreeDayBlueprint = (params: {
  dayTitle: string;
  selectionContext: SelectionContext;
  available: Set<Equipment>;
}): ThreeDayBlueprint | null => {
  const { dayTitle, selectionContext, available } = params;
  const counts = get3DayTemplateCounts(dayTitle, selectionContext.experienceLevel);
  if (!counts) return null;

  const selectedTemplateVariant = selectThreeDayTemplateVariant({
    dayTitle,
    mainCount: counts.mainCount,
    available,
    selectionContext,
  });
  const mainLanePlan =
    selectedTemplateVariant?.mainLanePlan ??
    get3DayMainLanePlan(dayTitle, counts.mainCount) ??
    [];
  const dayKey = normalizeSlotToken(dayTitle);

  if (dayKey === "back_chest") {
    const isBeginner = selectionContext.experienceLevel === "beginner";
    const beginnerGymNoPain =
      isBeginner && isGymNoPainSelectionContext({ available, context: selectionContext });
    return {
      dayTitle,
      mainCount: counts.mainCount,
      accessoryCount: counts.accessoryCount,
      mainLanePlan,
      requiredMainFamilies: beginnerGymNoPain
        ? ["horizontal_press_compound", "horizontal_pull", "vertical_pull"]
        : ["horizontal_press_compound", "chest_fly", "pull_secondary"],
      accessoryRoles: ["posture_back", "posture_back"],
      laneSwapRules: {
        horizontal_press_compound: ["chest_fly"],
        chest_fly: ["horizontal_press_compound"],
        pull_secondary: ["horizontal_pull", "vertical_pull"],
        horizontal_pull: ["vertical_pull", "pull_secondary"],
        vertical_pull: ["horizontal_pull", "pull_secondary"],
      },
      constraints: {
        pullMainsAtLeastPressMains: true,
        noVerticalPushMain: true,
        noLowerBodyLeakMain: true,
        maxCarryAccessories: 0,
        preventDuplicateCarries: true,
        carryCannotReplaceCore: false,
      },
    };
  }

  if (dayKey === "shoulders_arms") {
    const accessoryRoles: ThreeDayBlueprintAccessoryRole[] =
      counts.accessoryCount >= 4
        ? ["tri_iso", "bi_iso", "tri_iso_variant", "bi_iso_variant"]
        : counts.accessoryCount >= 3
        ? ["tri_iso", "bi_iso", "tri_iso_variant"]
        : ["tri_iso", "bi_iso"];
    return {
      dayTitle,
      mainCount: counts.mainCount,
      accessoryCount: counts.accessoryCount,
      mainLanePlan,
      requiredMainFamilies: ["vertical_push", "lateral_delt", "shoulder_pull"],
      accessoryRoles,
      laneSwapRules: {
        vertical_push: ["shoulder_pull"],
        lateral_delt: ["shoulder_pull"],
        shoulder_pull: ["lateral_delt"],
      },
      constraints: {
        pullMainsAtLeastPressMains: false,
        noVerticalPushMain: false,
        noLowerBodyLeakMain: true,
        maxCarryAccessories: 1,
        preventDuplicateCarries: true,
        carryCannotReplaceCore: false,
      },
    };
  }

  if (dayKey === "legs_abs") {
    const accessoryRoles: ThreeDayBlueprintAccessoryRole[] =
      counts.accessoryCount >= 3
        ? ["core", "calves", "extra_ab"]
        : ["core", "calves"];
    const isBeginner = selectionContext.experienceLevel === "beginner";
    return {
      dayTitle,
      mainCount: counts.mainCount,
      accessoryCount: counts.accessoryCount,
      mainLanePlan,
      requiredMainFamilies: ["squat_primary", "hinge_primary", "single_leg_or_secondary_squat"],
      accessoryRoles,
      laneSwapRules: {
        squat_primary: ["single_leg_or_secondary_squat"],
        hinge_primary: ["lower_secondary"],
        single_leg_or_secondary_squat: ["squat_primary"],
      },
      constraints: {
        pullMainsAtLeastPressMains: false,
        noVerticalPushMain: true,
        noLowerBodyLeakMain: false,
        maxCarryAccessories: 1,
        preventDuplicateCarries: true,
        carryCannotReplaceCore: true,
      },
      squatProgressionByPhase: {
        activation: [
          "assisted-box-squat",
          "machine-leg-press",
          "bodyweight-squat",
          "goblet-squat",
          "heels-elevated-squat",
        ],
        skill: [
          "goblet-squat",
          "band-front-squat",
          "dumbbell-step-up-loaded",
          "assisted-step-up",
          "split-squat",
          "machine-hack-squat",
          "machine-leg-press",
        ],
        growth: [
          "goblet-squat",
          "band-front-squat",
          ...(isBeginner ? [] : ["barbell-back-squat"]),
          "machine-hack-squat",
          "machine-leg-press",
        ],
      },
    };
  }

  return null;
};

const resolveBackChestTargetMainCount = (experienceLevel: NormalizedExperienceLevel) => {
  if (experienceLevel === "advanced") return 5;
  if (experienceLevel === "intermediate") return 4;
  return 3;
};

const shouldUseBackChestVerticalPushExpansion = (selectionContext: SelectionContext) => {
  if (selectionContext.experienceLevel !== "advanced") return false;
  if (selectionContext.painSeverity === "high") return false;
  const avoidVerticalPush = selectionContext.intentProfile.avoidPatterns.includes(
    "vertical_push_load"
  );
  if (avoidVerticalPush) return false;
  const painAreaTokens = new Set(
    selectionContext.painAreas.map((area) => normalizeTagToken(area))
  );
  const shoulderSensitive = ["shoulders", "neck"].some((token) =>
    painAreaTokens.has(token)
  );
  return !shoulderSensitive;
};

const resolveBackChestMainLanePlan = (params: {
  targetMainCount: number;
  selectionContext: SelectionContext;
  daysPerWeek?: 3 | 4 | 5;
}): MainLane[] => {
  const { targetMainCount, selectionContext, daysPerWeek = 3 } = params;
  if (daysPerWeek === 3) {
    const plannedFromTemplate = get3DayMainLanePlan(
      "Back + Chest",
      Math.max(1, targetMainCount)
    );
    if (plannedFromTemplate?.length) {
      return plannedFromTemplate.map((slot) => slot.lane as MainLane);
    }
  }

  const goalType = resolveBackChestGoalType(selectionContext.goal);
  const anchors: MainLane[] = ["pull", "push", "pull"];
  if (targetMainCount <= anchors.length) {
    return anchors.slice(0, targetMainCount);
  }

  const planned: MainLane[] = [...anchors];
  if (targetMainCount >= 4) {
    if (daysPerWeek === 3) {
      // 3-day Back + Chest keeps the first expansion in pull families for structural balance.
      planned.push("pull");
    } else {
      planned.push("pull");
    }
  }
  if (targetMainCount >= 5) {
    if (daysPerWeek === 3) {
      // Fifth slot mirrors opposing family so Advanced Back + Chest does not drift into a single-family stack.
      planned.push("push");
    } else {
      planned.push("pull");
    }
  }

  while (planned.length < targetMainCount) {
    planned.push("pull");
  }
  return planned.slice(0, targetMainCount);
};

const resolvePlannedMainLanesForDay = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  capabilityMode: EquipmentCapabilityMode;
}): MainLane[] => {
  const { day, daysPerWeek, capabilityMode } = params;
  const template = resolveSplitTemplateForDay(daysPerWeek, day.title);
  const fallbackLane =
    (exerciseById(day.routine.find((item) => item.section === "main")?.exerciseId)?.movementPattern
      ?.map((pattern) => laneFromPatternToken(normalizeTagToken(pattern)))
      .find((lane): lane is MainLane => Boolean(lane)) as MainLane | undefined) ??
    "pull";
  if (!template) {
    return day.routine
      .filter((item) => item.section === "main")
      .map((item) => {
        const exercise = exerciseById(item.exerciseId);
        return exercise ? getMainLaneHits(exercise)[0] ?? fallbackLane : fallbackLane;
      });
  }

  const seedLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly([...template.lanes], template.title, template.focusTags)
      : [...template.lanes];
  const mainCount = day.routine.filter((item) => item.section === "main").length;
  if (daysPerWeek === 3) {
    const plannedFromTemplate = get3DayMainLanePlan(day.title, Math.max(1, mainCount));
    if (plannedFromTemplate?.length) {
      return plannedFromTemplate.map((slot) => slot.lane as MainLane);
    }
  }

  if (normalizeSlotToken(day.title) === "back_chest") {
    const inferredMainLanes = day.routine
      .filter((item) => item.section === "main")
      .map((item) => {
        const exercise = exerciseById(item.exerciseId);
        return exercise ? getMainLaneHits(exercise)[0] ?? fallbackLane : fallbackLane;
      });
    if (inferredMainLanes.length === mainCount && inferredMainLanes.length > 0) {
      return inferredMainLanes;
    }
  }

  const expandedLanes = seedLanes.length ? [...seedLanes] : [fallbackLane];
  while (expandedLanes.length < Math.max(1, mainCount)) {
    const nextIndex = expandedLanes.length % Math.max(1, seedLanes.length);
    expandedLanes.push(seedLanes[nextIndex] ?? seedLanes[0] ?? fallbackLane);
  }
  return expandedLanes.slice(0, mainCount);
};

const resolvePlannedAccessoryLanesFromTemplate = (params: {
  dayTitle: string;
  dayLanes: MainLane[];
  accessoryCount: number;
  blueprint?: ThreeDayBlueprint | null;
}): AccessoryLane[] => {
  const { dayTitle, dayLanes, accessoryCount, blueprint } = params;
  if (!accessoryCount) return [];

  if (blueprint?.accessoryRoles?.length) {
    const roleToLane = (role: ThreeDayBlueprintAccessoryRole): AccessoryLane => {
      if (role === "posture_back") return "back";
      if (role === "tri_iso") return "push";
      if (role === "bi_iso") return "pull";
      if (role === "tri_iso_variant") return "push";
      if (role === "bi_iso_variant") return "pull";
      if (role === "core") return "core";
      if (role === "calves") return "lower";
      return "core";
    };
    const planned = blueprint.accessoryRoles.map((role) => roleToLane(role));
    while (planned.length < accessoryCount) {
      planned.push("core");
    }
    return planned.slice(0, accessoryCount);
  }

  if (normalizeSlotToken(dayTitle) === "back_chest") {
    const planned: AccessoryLane[] = ["back"];
    if (accessoryCount >= 2) planned.push("back");
    while (planned.length < accessoryCount) {
      planned.push("back");
    }
    return planned;
  }

  const primaryLane: AccessoryLane = dayLanes.includes("push")
    ? "push"
    : dayLanes.includes("pull")
    ? "pull"
    : dayLanes.includes("squat") || dayLanes.includes("hinge")
    ? "lower"
    : "core";
  const complementaryLane: AccessoryLane =
    primaryLane === "push"
      ? "pull"
      : primaryLane === "pull"
      ? "push"
      : primaryLane === "lower"
      ? "core"
      : "lower";

  const planned: AccessoryLane[] = [primaryLane];
  if (accessoryCount >= 2) planned.push("core");
  if (accessoryCount >= 3) planned.push(complementaryLane);
  while (planned.length < accessoryCount) {
    planned.push("core");
  }
  return planned;
};

const accessoryLaneToActivationLane = (lane: AccessoryLane): "push" | "pull" | "lower" | "core" =>
  lane === "chest" ? "push" : lane === "back" ? "pull" : lane;

const resolvePlannedAccessoryLanesForDay = (params: {
  day: ProgramDay;
  daysPerWeek: 3 | 4 | 5;
  capabilityMode: EquipmentCapabilityMode;
}): AccessoryLane[] => {
  const { day, daysPerWeek, capabilityMode } = params;
  const template = resolveSplitTemplateForDay(daysPerWeek, day.title);
  const accessoryCount = day.routine.filter((item) => item.section === "accessory").length;
  if (!accessoryCount) return [];

  if (!template) {
    return day.routine
      .filter((item) => item.section === "accessory")
      .map((item) => {
        const exercise = exerciseById(item.exerciseId);
        if (!exercise) return "core" as AccessoryLane;
        if (matchesAccessoryLanePattern(exercise, "push")) return "push" as AccessoryLane;
        if (matchesAccessoryLanePattern(exercise, "pull")) return "pull" as AccessoryLane;
        if (matchesAccessoryLanePattern(exercise, "lower")) return "lower" as AccessoryLane;
        return "core" as AccessoryLane;
      });
  }

  const dayLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly([...template.lanes], template.title, template.focusTags)
      : [...template.lanes];
  return resolvePlannedAccessoryLanesFromTemplate({
    dayTitle: day.title,
    dayLanes,
    accessoryCount,
  });
};

const laneFromPatternToken = (token: string): MainLane | null => {
  if (token === "push") return "push";
  if (token === "verticalpush") return "verticalPush";
  if (token === "pull") return "pull";
  if (token === "squat") return "squat";
  if (token === "hinge") return "hinge";
  return null;
};

const mainLaneToPrimaryPattern = (
  lane: MainLane
): PrimaryMotorPattern => {
  if (lane === "push") return "horizontalPush";
  if (lane === "verticalPush") return "verticalPush";
  return lane;
};

const hasRowPullSignature = (exercise: Exercise) => {
  const hasPullPattern = exercise.movementPattern.some(
    (pattern) => normalizeTagToken(pattern) === "pull"
  );
  if (!hasPullPattern) return false;
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return token.includes("row");
};

const hasHorizontalPullSignature = (exercise: Exercise) => {
  const patternTokens = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  if (!patternTokens.has("pull")) return false;
  if (patternTokens.has("horizontalpull")) return true;
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return token.includes("row");
};

const hasVerticalPullSignature = (exercise: Exercise) => {
  const patternTokens = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  if (patternTokens.has("verticalpull")) return true;
  if (!patternTokens.has("pull")) return false;
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    token.includes("pulldown") ||
    token.includes("pull-up") ||
    token.includes("pullup") ||
    token.includes("chin-up") ||
    token.includes("chinup") ||
    token.includes("lat")
  );
};

const BACK_CHEST_MAIN_SCAPULAR_PULL_BLOCKLIST = new Set([
  "cable-face-pull",
  "face-pull",
  "band-face-pull-high-anchor",
  "suspension-face-pull",
  "machine-rear-delt-row",
  "machine-reverse-pec-deck",
  "band-rear-delt-fly",
  "dumbbell-rear-delt-fly",
  "cable-rear-delt-fly",
  "prone-y-raise",
  "cable-external-rotation",
  "cable-external-rotation-pressout",
  "suspension-rear-delt-row",
  "prone-swimmer",
  "reverse-snow-angel",
  "prone-ytw",
  "band-external-rotation",
  "band-pull-aparts",
  "band-pull-apart",
  "back-widow",
  "scap-pullup",
]);

const isBackChestScapularAccessoryPullExercise = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  if (!patterns.has("pull")) return false;
  if (BACK_CHEST_MAIN_SCAPULAR_PULL_BLOCKLIST.has(exercise.id)) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse-pec-deck") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("rear-delt-fly") ||
    descriptor.includes("rear delt fly") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("ytw") ||
    descriptor.includes("y-raise") ||
    descriptor.includes("y raise") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("scap-pullup") ||
    descriptor.includes("scap pullup")
  );
};

const isBackChestCompoundPullMainCandidate = (exercise: Exercise) => {
  const hasPullPattern = exercise.movementPattern.some(
    (pattern) => normalizeTagToken(pattern) === "pull"
  );
  if (!hasPullPattern) return false;
  if (isIsolationExercise(exercise)) return false;
  if (isBackChestScapularAccessoryPullExercise(exercise)) return false;
  return hasHorizontalPullSignature(exercise) || hasVerticalPullSignature(exercise);
};

const isBackChestMainScapularPullDisallowedForSlot = (params: {
  exercise: Exercise;
  section?: ProgramRoutineItem["section"];
  auditMeta?: SelectionAuditMeta;
}) => {
  const { exercise, section, auditMeta } = params;
  if (section !== "main" || !auditMeta) return false;
  if (!isBackChestDayTitle(auditMeta.dayTitle)) return false;
  if (!auditMeta.slotKind.startsWith("mainPull")) return false;
  return isBackChestScapularAccessoryPullExercise(exercise);
};

type BackChestEquipmentTier = 1 | 2 | 3;

const isPullupDescriptor = (exercise: Exercise) => {
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    token.includes("pullup") ||
    token.includes("pull-up") ||
    token.includes("chinup") ||
    token.includes("chin-up")
  );
};

const isAssistedPullupExercise = (exercise: Exercise) =>
  isPullupDescriptor(exercise) && exercise.loadType === "assisted";

const isBodyweightPullupExercise = (exercise: Exercise) =>
  isPullupDescriptor(exercise) && exercise.loadType === "bodyweight";

const isWeightedPullupExercise = (exercise: Exercise) =>
  isPullupDescriptor(exercise) && exercise.loadType === "weighted";

const isBackChestRowExercise = (exercise: Exercise) => {
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();
  return token.includes("row");
};

const isBackChestUnsupportedHingeRowExercise = (exercise: Exercise) => {
  if (!isBackChestRowExercise(exercise)) return false;
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  if (!patterns.has("hinge")) return false;
  return !exercise.equipment.includes("machines") && !exercise.equipment.includes("cables");
};

const isBackChestLowerBodyLeakExercise = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  if (patterns.has("squat") || patterns.has("hinge") || patterns.has("singleleg")) {
    return true;
  }
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("squat") ||
    descriptor.includes("lunge") ||
    descriptor.includes("cossack") ||
    descriptor.includes("deadlift") ||
    descriptor.includes("rdl") ||
    descriptor.includes("leg press") ||
    descriptor.includes("step-up") ||
    descriptor.includes("step up") ||
    descriptor.includes("hip thrust") ||
    descriptor.includes("hamstring") ||
    descriptor.includes("calf")
  );
};

const isBackChestVerticalPushLeakExercise = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  if (patterns.has("verticalpush")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("shoulder press") ||
    descriptor.includes("strict press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("arnold press") ||
    descriptor.includes("pike-pushup") ||
    descriptor.includes("pike pushup")
  );
};

const isBackChestShoulderIsolationLeakExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  return (
    descriptor.includes("lateral raise") ||
    descriptor.includes("rear delt raise") ||
    tags.has("lateraldelt") ||
    tags.has("shouldersisolation")
  );
};

type BackChestMainStimulusCategory =
  | "row"
  | "press"
  | "vertical"
  | "fly"
  | "latAccent"
  | "other";

const BACK_CHEST_SECONDARY_CATEGORY_CAPS: Record<
  Exclude<BackChestMainStimulusCategory, "other">,
  number
> = {
  row: 3,
  press: 1,
  vertical: 2,
  fly: 1,
  latAccent: 1,
};

const isBackChestLatAccentExercise = (exercise: Exercise) => {
  const familyKey = resolveBackChestExerciseFamilyKey(exercise);
  if (familyKey.includes("pullover")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("pullover");
};

const resolveBackChestMainStimulusCategory = (exercise: Exercise): BackChestMainStimulusCategory => {
  if (isBackChestFlyPatternExercise(exercise)) return "fly";
  if (isBackChestLatAccentExercise(exercise)) return "latAccent";
  if (hasVerticalPullSignature(exercise)) return "vertical";
  if (hasHorizontalPullSignature(exercise)) return "row";
  if (hasHorizontalPushSignature(exercise)) return "press";
  return "other";
};

const resolveBackChestStimulusKey = (params: {
  exercise: Exercise;
  categoryOverride?: BackChestMainStimulusCategory;
}) => {
  const { exercise, categoryOverride } = params;
  const category = categoryOverride ?? resolveBackChestMainStimulusCategory(exercise);
  const familyKey = resolveBackChestExerciseFamilyKey(exercise);
  const variantKey = resolveBackChestExerciseVariantKey(exercise);
  const unilateral = variantKey === "single_arm" ? "single" : "bilateral";
  const isIso =
    variantKey === "iso_hold" || exercise.loadType === "timed" ? "iso" : "dynamic";
  return `${familyKey}::${category}::${unilateral}::${isIso}::${exercise.loadType}`;
};

const isBackChestMeaningfulSameFamilyStimulusDelta = (
  candidate: Exercise,
  reference: Exercise
) => {
  const candidateFamily = resolveBackChestExerciseFamilyKey(candidate);
  const referenceFamily = resolveBackChestExerciseFamilyKey(reference);
  if (candidateFamily !== referenceFamily) return true;
  const candidateVariant = resolveBackChestExerciseVariantKey(candidate);
  const referenceVariant = resolveBackChestExerciseVariantKey(reference);
  const unilateralShift =
    (candidateVariant === "single_arm") !== (referenceVariant === "single_arm");
  const isoShift =
    (candidateVariant === "iso_hold") !== (referenceVariant === "iso_hold") ||
    (candidate.loadType === "timed") !== (reference.loadType === "timed");
  const loadingShift = candidate.loadType !== reference.loadType;
  const angleShift =
    candidateVariant === "incline" ||
    referenceVariant === "incline" ||
    candidateVariant === "paused" ||
    referenceVariant === "paused" ||
    candidateVariant === "chest_supported" ||
    referenceVariant === "chest_supported";
  if (unilateralShift || isoShift || loadingShift || angleShift) return true;
  return false;
};

const isBackChestMainBoundaryEligible = (params: {
  exercise: Exercise;
  allowChestFly?: boolean;
}) => {
  const { exercise, allowChestFly = false } = params;
  if (isBackChestLowerBodyLeakExercise(exercise)) return false;
  if (isBackChestVerticalPushLeakExercise(exercise)) return false;
  if (isBackChestShoulderIsolationLeakExercise(exercise)) return false;
  const backChestPrimaryPattern =
    hasHorizontalPullSignature(exercise) ||
    hasVerticalPullSignature(exercise) ||
    hasHorizontalPushSignature(exercise);
  const flyAllowed = allowChestFly && isBackChestFlyPatternExercise(exercise);
  if (!backChestPrimaryPattern && !flyAllowed) return false;
  if (isIsolationExercise(exercise) && !flyAllowed) return false;
  return true;
};

const resolveBackChestEquipmentTier = (exercise: Exercise): BackChestEquipmentTier => {
  if (exercise.tier) return exercise.tier;
  const weightedWithDbOrBb =
    exercise.loadType === "weighted" &&
    (exercise.equipment.includes("dumbbells") ||
      exercise.equipment.includes("barbell"));
  return weightedWithDbOrBb ? 2 : 1;
};

const matchesBackChestMainSlotKind = (params: {
  exercise: Exercise;
  slotKind: string;
  slotLane?: MainLane;
}) => {
  const { exercise, slotKind, slotLane } = params;
  if (slotKind === "mainPushFly") return hasHorizontalPushSignature(exercise);
  if (slotKind === "mainPushCompound") {
    return hasHorizontalPushSignature(exercise) && !isBackChestFlyPatternExercise(exercise);
  }
  if (slotKind === "mainPullVertical") {
    return hasVerticalPullSignature(exercise) && !isBackChestLatAccentExercise(exercise);
  }
  if (slotKind === "mainPullHorizontal") return hasHorizontalPullSignature(exercise);
  if (slotKind === "mainPullSupport") {
    return isBackChestCompoundPullMainCandidate(exercise);
  }
  if (slotLane) return matchesMainLanePattern(exercise, slotLane);
  return true;
};

const matchesShouldersArmsMainSlotKind = (params: {
  exercise: Exercise;
  slotKind: string;
  slotLane?: MainLane;
  dayTitle?: string | null;
}) => {
  const { exercise, slotKind, slotLane, dayTitle } = params;
  if (!isShouldersArmsDayTitle(dayTitle)) {
    if (slotLane) return matchesMainLanePattern(exercise, slotLane);
    return true;
  }
  if (!isShouldersArmsMainBoundaryEligible(exercise)) return false;
  const category = resolveShouldersArmsMainCategory(exercise);
  if (slotKind === "mainVerticalPushPrimary") return category === "ohp";
  if (slotKind === "mainLateralDeltPrimary") return category === "lateral";
  if (slotKind === "mainShoulderPullPrimary") return category === "rearDeltMain";
  if (
    slotKind === "mainShoulderStructuralSecondary" ||
    slotKind === "mainShoulderStructuralAlternate"
  ) {
    return category === "shoulderSupport";
  }
  if (slotLane === "verticalPush") return category === "ohp";
  if (slotLane === "push") return category === "lateral";
  if (slotLane === "pull") return category === "rearDeltMain" || category === "shoulderSupport";
  return (
    category === "ohp" ||
    category === "lateral" ||
    category === "rearDeltMain" ||
    category === "shoulderSupport"
  );
};

const isSupportOnlyMovement = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("snow-angel") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("y raise") ||
    descriptor.includes("y-raise") ||
    descriptor.includes("t raise") ||
    descriptor.includes("t-raise") ||
    descriptor.includes("ytw") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("scap-pullup") ||
    descriptor.includes("scap pullup")
  );
};

const isRegressionOrDrillMovement = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  const lowLoadMainBlocklist = new Set([
    "bodyweight-squat",
    "back-extension-hold",
    "single-leg-glute-bridge-hold",
    "back-extension",
    "glute-bridges",
    "single-leg-hip-thrust",
    "single-leg-rdl",
    "supine-lat-pulldown-isometric",
    "prone-elbow-row",
    "back-widow",
    "prone-lat-sweep",
    "seated-lat-sweep-pulse",
    "dead-bug",
    "bird-dog",
    "plank",
    "side-plank",
    "hollow-body-hold",
  ]);
  return (
    lowLoadMainBlocklist.has(exercise.id) ||
    exercise.loadType === "timed" ||
    descriptor.includes("drill") ||
    descriptor.includes("hold") ||
    descriptor.includes("isometric") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("bird dog") ||
    descriptor.includes("plank") ||
    descriptor.includes("brace") ||
    descriptor.includes("march")
  );
};

type MainSlotIdentityTier = "true_main" | "constrained_main" | "support_corrective";

const classifyMainSlotIdentity = (params: {
  exercise: Exercise;
  dayTitle?: string | null;
  available: Set<Equipment>;
  context: SelectionContext;
}): MainSlotIdentityTier => {
  const { exercise, dayTitle, available, context } = params;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const upperPain = hasUpperPainSignal(context);
  const lowBackPain = hasLowBackPainSignal(context);
  const loadedOrBandContext =
    available.has("bands") ||
    available.has("dumbbells") ||
    available.has("gym") ||
    hasGymLikeUpperImplementAvailability(available);

  if (isBackChestDayTitle(dayTitle)) {
    if (
      isSupportOnlyMovement(exercise) ||
      isRegressionOrDrillMovement(exercise) ||
      isBackChestLatAccentExercise(exercise) ||
      isBackChestRearDeltDominantAccessory(exercise)
    ) {
      return "support_corrective";
    }
  }

  if (isShouldersArmsDayTitle(dayTitle)) {
    if (
      isSupportOnlyMovement(exercise) ||
      (upperPain &&
        (exercise.id === "pike-pushup" ||
          descriptor.includes("pike push") ||
          descriptor.includes("pike-push")))
    ) {
      return "support_corrective";
    }
  }

  if (isLegsAbsDayTitle(dayTitle)) {
    const beginnerActivationNoPainHingePrimer =
      exercise.id === "bodyweight-good-morning" &&
      context.experienceLevel === "beginner" &&
      context.phaseStage === "activation" &&
      context.painSeverity === "low" &&
      context.painAreas.length === 0;
    if (exercise.id === "bodyweight-good-morning" && !beginnerActivationNoPainHingePrimer) {
      return "support_corrective";
    }
    if (isRegressionOrDrillMovement(exercise)) {
      return "support_corrective";
    }
    if (
      lowBackPain &&
      (exercise.id === "bodyweight-squat" ||
        exercise.id === "bodyweight-good-morning" ||
        exercise.id === "back-extension" ||
        exercise.id === "back-extension-hold" ||
        exercise.id === "single-leg-hip-thrust" ||
        exercise.id === "single-leg-glute-bridge-hold")
    ) {
      return "support_corrective";
    }
  }

  if (loadedOrBandContext && exercise.equipment.every((item) => item === "none")) {
    return "constrained_main";
  }

  return "true_main";
};

const isMainLegalForSlot = (params: {
  exercise: Exercise;
  dayTitle?: string | null;
  slotKind?: string;
  slotLane?: MainLane;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, dayTitle, slotKind, slotLane, available, context } = params;
  if (exercise.category !== "main") return false;
  const strictDefaultNoPain = shouldApplyDefaultGeneralFitnessNoPainRoleStrictness({
    available,
    context,
  });
  const protectMainIdentity =
    shouldApplyMainIdentityProtection({ available, context }) ||
    (isLegsAbsDayTitle(dayTitle) &&
      shouldApplyBodyweightMainIdentityProtection({ available, context }));
  const identityTier = classifyMainSlotIdentity({
    exercise,
    dayTitle,
    available,
    context,
  });

  if (isBackChestDayTitle(dayTitle)) {
    if (protectMainIdentity && identityTier === "support_corrective") return false;
    if (!isBackChestMainBoundaryEligible({ exercise, allowChestFly: slotKind === "mainPushFly" })) {
      return false;
    }
    return matchesBackChestMainSlotKind({
      exercise,
      slotKind: slotKind ?? "mainRepair",
      slotLane,
    });
  }

  if (isShouldersArmsDayTitle(dayTitle)) {
    const supportTemplateSlot =
      slotKind === "mainShoulderStructuralSecondary" ||
      slotKind === "mainShoulderStructuralAlternate";
    const enforceStrictShoulderMain = protectMainIdentity && !supportTemplateSlot;
    const constrainedRearDeltFallback =
      strictDefaultNoPain &&
      exercise.id === "prone-t-raise" &&
      (slotKind === "mainShoulderPullPrimary" || slotLane === "pull");
    if (constrainedRearDeltFallback) return true;
    if (enforceStrictShoulderMain && identityTier === "support_corrective") return false;
    const category = resolveShouldersArmsMainCategory(exercise);
    if (enforceStrictShoulderMain && category === "shoulderSupport") return false;
    return matchesShouldersArmsMainSlotKind({
      exercise,
      slotKind: slotKind ?? "mainShoulderRepair",
      slotLane,
      dayTitle,
    });
  }

  if (isLegsAbsDayTitle(dayTitle)) {
    if (protectMainIdentity && identityTier === "support_corrective") return false;
    if (isLegsCarryExercise(exercise)) return false;
    if (matchesAccessoryLanePattern(exercise, "core")) return false;
    if (matchesAccessoryLanePattern(exercise, "lower") && !matchesMainLanePattern(exercise, slotLane ?? "squat")) {
      return false;
    }
    return slotLane ? matchesMainLanePattern(exercise, slotLane) : exerciseHasLowerMainPattern(exercise);
  }

  if (protectMainIdentity && identityTier === "support_corrective") return false;
  return slotLane ? matchesMainLanePattern(exercise, slotLane) : true;
};

const isAccessoryLegalForSlot = (params: {
  exercise: Exercise;
  dayTitle?: string | null;
  slotLane?: AccessoryLane;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, dayTitle, slotLane, available, context } = params;
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const hasTriceps = tags.has("triceps") || descriptor.includes("triceps");
  const hasBiceps = tags.has("biceps") || descriptor.includes("biceps") || descriptor.includes("curl");
  const gymNoPain = isGymNoPainSelectionContext({ available, context });
  const strictLoadedOrDefaultNoPain =
    gymNoPain || shouldApplyMainIdentityProtection({ available, context });

  if (isShouldersArmsDayTitle(dayTitle)) {
    if (slotLane === "push") return hasTriceps;
    if (slotLane === "pull") return hasBiceps;
  }

  if (isBackChestDayTitle(dayTitle) && slotLane === "back" && strictLoadedOrDefaultNoPain) {
    return (
      isBackChestRearDeltDominantAccessory(exercise) ||
      isBackChestRequiredExternalScapAccessory(exercise) ||
      isRearDeltOrExternalRotationPattern(exercise)
    );
  }

  if (isLegsAbsDayTitle(dayTitle) && strictLoadedOrDefaultNoPain) {
    if (slotLane === "lower" && isLegsCarryExercise(exercise)) return false;
    if (slotLane === "core") return matchesAccessoryLanePattern(exercise, "core");
  }

  return slotLane ? matchesAccessoryLanePattern(exercise, slotLane) : true;
};

const isRoleLegalForSlot = (params: {
  exercise: Exercise;
  section?: ProgramRoutineItem["section"];
  dayTitle?: string | null;
  slotKind?: string;
  mainSlotLane?: MainLane;
  accessoryLane?: AccessoryLane;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  if (params.section === "main") {
    return isMainLegalForSlot({
      exercise: params.exercise,
      dayTitle: params.dayTitle,
      slotKind: params.slotKind,
      slotLane: params.mainSlotLane,
      available: params.available,
      context: params.context,
    });
  }
  if (params.section === "accessory") {
    return isAccessoryLegalForSlot({
      exercise: params.exercise,
      dayTitle: params.dayTitle,
      slotLane: params.accessoryLane,
      available: params.available,
      context: params.context,
    });
  }
  return true;
};

const isSameDayMainIdentityCandidate = (params: {
  exercise: Exercise;
  section?: ProgramRoutineItem["section"];
  dayTitle?: string | null;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, section, dayTitle, available, context } = params;
  if (section !== "main") {
    return true;
  }
  if (
    classifyMainSlotIdentity({
      exercise,
      dayTitle,
      available,
      context,
    }) === "support_corrective"
  ) {
    return false;
  }
  if (isBackChestDayTitle(dayTitle)) {
    return isBackChestMainBoundaryEligible({ exercise, allowChestFly: true });
  }
  if (isShouldersArmsDayTitle(dayTitle)) {
    const category = resolveShouldersArmsMainCategory(exercise);
    return category === "ohp" || category === "lateral" || category === "rearDeltMain";
  }
  if (isLegsAbsDayTitle(dayTitle)) {
    return (
      exerciseHasLowerMainPattern(exercise) &&
      !isLegsCarryExercise(exercise) &&
      !matchesAccessoryLanePattern(exercise, "core")
    );
  }
  return true;
};

const resolveHighestBackChestTierForSlot = (params: {
  slotKind: string;
  slotLane?: MainLane;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { slotKind, slotLane, available, context } = params;
  const isBackChestPullSlot = slotKind.startsWith("mainPull");
  const availableForSlot = isBackChestPullSlot
    ? resolveBackChestMainAvailableSet(available)
    : available;
  const eligiblePool = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) =>
      isBackChestPullSlot ? !isBackChestScapularAccessoryPullExercise(exercise) : true
    )
    .filter((exercise) =>
      matchesBackChestMainSlotKind({
        exercise,
        slotKind,
        slotLane,
      })
    )
    .filter((exercise) =>
      isExerciseEligibleForProgramContext({
        exercise,
        available: availableForSlot,
        section: "main",
        context,
      })
    );
  if (!eligiblePool.length) return 1 as BackChestEquipmentTier;
  return eligiblePool.reduce<BackChestEquipmentTier>((highest, exercise) => {
    const tier = resolveBackChestEquipmentTier(exercise);
    return tier > highest ? tier : highest;
  }, 1);
};

const isUpperPushFocusedDay = (dayTitle: string, dayFocusTags: string[]) => {
  const normalizedTitle = dayTitle.toLowerCase();
  if (normalizedTitle.includes("upper push")) return true;
  if (normalizedTitle.includes("upper") && normalizedTitle.includes("push")) return true;
  return dayFocusTags.some((tag) => normalizeTagToken(tag) === "push");
};

const isChestDominantHorizontalPush = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeTagToken(pattern)));
  if (!patterns.has("push") || patterns.has("verticalpush")) return false;
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeTagToken(tag)));
  const muscles = new Set(
    (exercise.muscleGroups ?? []).map((muscle) => normalizeTagToken(muscle))
  );
  const idName = `${exercise.id} ${exercise.name}`.toLowerCase();
  const isPushupPattern =
    idName.includes("pushup") ||
    idName.includes("push-up") ||
    idName.includes("push up");
  const isPikePushupPattern =
    idName.includes("pike pushup") ||
    idName.includes("pike-pushup") ||
    idName.includes("pike push-up");
  return (
    (isPushupPattern && !isPikePushupPattern) ||
    tags.has("chest") ||
    muscles.has("chest") ||
    idName.includes("chest") ||
    idName.includes("bench") ||
    idName.includes("floor-press") ||
    idName.includes("floor press") ||
    idName.includes("fly")
  );
};

type ScoreWithReasons = {
  score: number;
  reasons: string[];
};

type CapabilitySlotBonus = {
  bonus: number;
  reasons: string[];
};

type PoseFocusScoreBonus = {
  bonus: number;
  reasons: string[];
};

const isBandEquippedExercise = (exercise: Exercise) =>
  exercise.equipment.some((item) => {
    const token = String(item).toLowerCase();
    return token === "bands" || token === "band";
  });

const loadedAccessoryEquipment = new Set<Equipment>([
  "bands",
  "dumbbells",
  "barbell",
  "kettlebell",
  "cables",
  "machines",
]);

const hasLoadedAccessoryImplement = (exercise: Exercise) =>
  exercise.equipment.some((item) => loadedAccessoryEquipment.has(item));

const isBodyweightFallbackAccessory = (exercise: Exercise) =>
  exercise.loadType === "bodyweight" ||
  exercise.loadType === "timed" ||
  (!hasLoadedAccessoryImplement(exercise) && exercise.loadType === "assisted");

const isBackChestDayTitle = (dayTitle?: string | null) =>
  normalizeSlotToken(dayTitle ?? "") === "back_chest";

const isLegsAbsDayTitle = (dayTitle?: string | null) =>
  normalizeSlotToken(dayTitle ?? "") === "legs_abs";

const resolveSlotOrdinal = (slotId?: string | null) => {
  if (!slotId) return null;
  const match = slotId.match(/-(\d+)$/);
  if (!match) return null;
  const ordinal = Number(match[1]);
  return Number.isFinite(ordinal) ? ordinal : null;
};

const isBackChestFlyPatternExercise = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck")
  );
};

const isBackChestIntermediateExpansionPushSlot = (params: {
  auditMeta?: SelectionAuditMeta;
  context: SelectionContext;
}) => {
  const { auditMeta, context } = params;
  if (!auditMeta) return false;
  if (!isBackChestDayTitle(auditMeta.dayTitle)) return false;
  if (context.experienceLevel !== "intermediate") return false;
  if (auditMeta.slotLane !== "push") return false;
  if ((auditMeta.expectedLaneCounts?.push ?? 0) < 2) return false;
  const ordinal = resolveSlotOrdinal(auditMeta.slotId);
  return typeof ordinal === "number" && ordinal > 3;
};

const isBackChestReasonablePressOrFlyMainAlternative = (params: {
  exercise: Exercise;
  allowChestFly: boolean;
}) => {
  const { exercise, allowChestFly } = params;
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""}`.toLowerCase();
  const patternTokens = new Set(
    (exercise.movementPattern ?? []).map((pattern) => normalizeTagToken(pattern))
  );
  const flyPattern =
    isBackChestFlyPatternExercise(exercise) ||
    patternTokens.has("fly") ||
    descriptor.includes("fly");
  const pressPattern =
    hasHorizontalPushSignature(exercise) ||
    patternTokens.has("horizontalpush") ||
    patternTokens.has("chestpress") ||
    descriptor.includes("bench") ||
    descriptor.includes("press");
  if (flyPattern && !allowChestFly) return false;
  if (!pressPattern && !flyPattern) return false;
  return exercise.loadType === "weighted" || hasGymLikeUpperImplementOnExercise(exercise);
};

const hasEligibleBackChestMainAlternative = (params: {
  exercise: Exercise;
  slotKind?: string;
  slotLane?: MainLane;
  allowChestFly: boolean;
  available: Set<Equipment>;
  context: SelectionContext;
  predicate: (candidate: Exercise) => boolean;
}) => {
  const { exercise, slotKind, slotLane, allowChestFly, available, context, predicate } = params;
  const isCandidateEligible = (candidate: Exercise, respectSlotKind: boolean) => {
    if (candidate.category !== "main") return false;
    if (candidate.id === exercise.id) return false;
    if (
      respectSlotKind &&
      slotKind &&
      !matchesBackChestMainSlotKind({
        exercise: candidate,
        slotKind,
        slotLane,
      })
    ) {
      return false;
    }
    if (
      !isExerciseEligibleForProgramContext({
        exercise: candidate,
        available,
        section: "main",
        context,
      })
    ) {
      return false;
    }
    if (!isBackChestMainBoundaryEligible({ exercise: candidate, allowChestFly })) return false;
    return predicate(candidate);
  };
  const hasSlotScopedCandidate = exercises.some((candidate) =>
    isCandidateEligible(candidate, true)
  );
  if (hasSlotScopedCandidate) return true;
  return exercises.some((candidate) => isCandidateEligible(candidate, false));
};

const hasEligibleLoadedBackChestPushAlternative = (params: {
  exercise: Exercise;
  slotKind: string;
  slotLane?: MainLane;
  allowChestFly: boolean;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, slotKind, slotLane, allowChestFly, available, context } = params;
  return hasEligibleBackChestMainAlternative({
    exercise,
    slotKind,
    slotLane: slotLane ?? "push",
    allowChestFly,
    available,
    context,
    predicate: (candidate) => {
      if (isVeryLowLoadPushupVariantExercise(candidate)) return false;
      return isBackChestReasonablePressOrFlyMainAlternative({
        exercise: candidate,
        allowChestFly,
      });
    },
  });
};

const hasEligibleBackChestNonScapularMainAlternative = (params: {
  exercise: Exercise;
  slotKind: string;
  slotLane?: MainLane;
  allowChestFly: boolean;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, slotKind, slotLane, allowChestFly, available, context } = params;
  return hasEligibleBackChestMainAlternative({
    exercise,
    slotKind,
    slotLane: slotLane ?? "pull",
    allowChestFly,
    available,
    context,
    predicate: (candidate) => !isScapularYTRaiseFamilyExercise(candidate),
  });
};

const shouldGateBackChestGymLikeMainCandidate = (params: {
  exercise: Exercise;
  allowChestFly: boolean;
  slotKind?: string;
  slotLane?: MainLane;
  available: Set<Equipment>;
  context: SelectionContext;
}) => {
  const { exercise, allowChestFly, slotKind, slotLane, available, context } = params;
  const gymLikeIntermediateUpperMainContext =
    hasGymLikeUpperImplementAvailability(available) &&
    context.experienceLevel !== "beginner";
  if (!gymLikeIntermediateUpperMainContext) return false;
  if (
    isVeryLowLoadPushupVariantExercise(exercise) &&
    hasEligibleLoadedBackChestPushAlternative({
      exercise,
      slotKind: slotKind ?? "mainPushCompound",
      slotLane: slotLane ?? "push",
      allowChestFly,
      available,
      context,
    })
  ) {
    return true;
  }
  if (
    isScapularYTRaiseFamilyExercise(exercise) &&
    hasEligibleBackChestNonScapularMainAlternative({
      exercise,
      slotKind: slotKind ?? "mainRepair",
      slotLane: slotLane ?? "pull",
      allowChestFly,
      available,
      context,
    })
  ) {
    return true;
  }
  return false;
};

const resolveEligibilityAvailabilityForDay = (
  dayTitle: string,
  available: Set<Equipment>
) => (isBackChestDayTitle(dayTitle) ? resolveBackChestMainAvailableSet(available) : available);

const getCapabilitySlotBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  auditMeta?: SelectionAuditMeta;
}): CapabilitySlotBonus => {
  const { exercise, section, auditMeta } = params;
  if (section !== "main" || !auditMeta) {
    return { bonus: 0, reasons: [] };
  }

  let bonus = 0;
  const reasons: string[] = [];
  const slotKind = auditMeta.slotKind;

  if (
    auditMeta.capabilityMode === "hasLoad" &&
    (slotKind === "mainSquat" || slotKind === "mainHinge") &&
    exercise.loadType === "weighted"
  ) {
    bonus += 1;
    reasons.push("+1 capability bonus: loaded lower slot prefers weighted");
  }

  if (
    auditMeta.capabilityMode === "bandOnly" &&
    (slotKind === "mainPull" ||
      slotKind === "mainPullHorizontal" ||
      slotKind === "mainPullVertical" ||
      slotKind === "mainPullSupport" ||
      slotKind === "mainHinge") &&
    isBandEquippedExercise(exercise)
  ) {
    bonus += 1;
    reasons.push("+1 capability bonus: band-only pull/hinge prefers resisted band");
  }

  if (auditMeta.capabilityMode === "bandOnly" && slotKind === "mainPush") {
    if (exercise.id === "band-chest-press") {
      bonus += 2;
      reasons.push("+2 capability bonus: band-only push prefers band chest press");
    } else if (exercise.id === "pushup") {
      bonus += 1;
      reasons.push("+1 capability bonus: band-only push fallback push-up");
    } else if (exercise.id.includes("pushup")) {
      bonus += 0.5;
      reasons.push("+0.5 capability bonus: band-only push fallback push-up variant");
    }
  }

  return { bonus, reasons };
};

const getPoseFocusScoreBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
}): PoseFocusScoreBonus => {
  const { exercise, section, context } = params;
  if (!context.poseFocusTags.size) {
    return { bonus: 0, reasons: [] };
  }

  const exerciseFocusTags = new Set(
    (exercise.focusTags ?? []).map((tag) => normalizeTagToken(String(tag)))
  );
  const matchedPoseTags = Array.from(context.poseFocusTags).filter((poseTag) => {
    if (exerciseFocusTags.has(poseTag)) return true;
    const aliases = POSE_FOCUS_TAG_ALIASES[poseTag] ?? [poseTag];
    return aliases.some((alias) => exerciseFocusTags.has(normalizeTagToken(alias)));
  });

  if (!matchedPoseTags.length) {
    return { bonus: 0, reasons: [] };
  }

  const bonus = section === "main" ? 0.5 : 1;
  return {
    bonus,
    reasons: [
      `+${bonus.toFixed(1)} pose-focus tag match (${matchedPoseTags.join(", ")})`,
    ],
  };
};

const getMainVarietyScoreBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  auditMeta?: SelectionAuditMeta;
}): ScoreWithReasons => {
  const { exercise, section, context, auditMeta } = params;
  if (section !== "main" || !auditMeta?.selectedMainExerciseIds?.length) {
    return { score: 0, reasons: [] };
  }

  const selectedExercises = auditMeta.selectedMainExerciseIds
    .map((id) => exerciseById(id))
    .filter((item): item is Exercise => Boolean(item));
  if (!selectedExercises.length) return { score: 0, reasons: [] };

  const expectedLaneCounts = auditMeta.expectedLaneCounts ?? {};
  const selectedPatternCounts = new Map<string, number>();
  const selectedFamilyCounts = new Map<string, number>();
  const selectedVariantCounts = new Map<string, number>();
  selectedExercises.forEach((selected) => {
    selected.movementPattern.forEach((pattern) => {
      const token = normalizeTagToken(pattern);
      selectedPatternCounts.set(token, (selectedPatternCounts.get(token) ?? 0) + 1);
    });
    const familyKey = resolveProgramVariationFamilyKey(selected);
    const variantKey = resolveProgramVariationVariantKey(selected);
    selectedFamilyCounts.set(familyKey, (selectedFamilyCounts.get(familyKey) ?? 0) + 1);
    selectedVariantCounts.set(variantKey, (selectedVariantCounts.get(variantKey) ?? 0) + 1);
  });

  const candidatePatternTokens = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  const candidateFamilyKey = resolveProgramVariationFamilyKey(exercise);
  const candidateVariantKey = resolveProgramVariationVariantKey(exercise);

  let score = 0;
  const reasons: string[] = [];
  const duplicatePenaltyStep = context.capabilityMode === "bandOnly" ? 0.5 : 1.25;

  candidatePatternTokens.forEach((patternToken) => {
    const existingCount = selectedPatternCounts.get(patternToken) ?? 0;
    if (existingCount <= 0) return;
    const lane = laneFromPatternToken(patternToken);
    const laneExpectedDuplicates =
      lane && (expectedLaneCounts[lane] ?? 0) > 1;
    if (laneExpectedDuplicates) return;
    const penalty = duplicatePenaltyStep * existingCount;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} main variety penalty (${patternToken})`);
  });

  const familyDuplicates = selectedFamilyCounts.get(candidateFamilyKey) ?? 0;
  if (familyDuplicates > 0) {
    const familyPenalty =
      (context.capabilityMode === "hasLoad" ? 1.2 : 0.65) * familyDuplicates;
    score -= familyPenalty;
    reasons.push(
      `-${familyPenalty.toFixed(2)} in-program family overuse (${candidateFamilyKey})`
    );
  }

  const variantDuplicates = selectedVariantCounts.get(candidateVariantKey) ?? 0;
  if (variantDuplicates > 0) {
    const variantPenalty =
      (context.capabilityMode === "hasLoad" ? 0.8 : 0.4) * variantDuplicates;
    score -= variantPenalty;
    reasons.push(
      `-${variantPenalty.toFixed(2)} in-program variant overuse (${candidateVariantKey})`
    );
  }

  const hasPush = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "push")
  );
  const hasVerticalPush = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "verticalpush")
  );
  const candidateHasPush = candidatePatternTokens.has("push");
  const candidateHasVerticalPush = candidatePatternTokens.has("verticalpush");

  if (hasPush && !hasVerticalPush && candidateHasVerticalPush) {
    score += 1.5;
    reasons.push("+1.5 complementary push + vertical push");
  }
  if (hasVerticalPush && !hasPush && candidateHasPush) {
    score += 1.5;
    reasons.push("+1.5 complementary push + vertical push");
  }

  const pushFocusedDay = isUpperPushFocusedDay(
    auditMeta.dayTitle,
    auditMeta.dayFocusTags ?? []
  );
  if (pushFocusedDay && (candidateHasPush || candidateHasVerticalPush)) {
    const selectedPushAngles = selectedExercises.reduce(
      (acc, selected) => {
        const selectedPatterns = new Set(
          selected.movementPattern.map((pattern) => normalizeTagToken(pattern))
        );
        if (selectedPatterns.has("verticalpush")) {
          acc.vertical += 1;
        } else if (selectedPatterns.has("push")) {
          acc.horizontal += 1;
          if (isChestDominantHorizontalPush(selected)) {
            acc.chestDominantHorizontal += 1;
          }
        }
        return acc;
      },
      { horizontal: 0, vertical: 0, chestDominantHorizontal: 0 }
    );

    const anglePenaltyStep = context.capabilityMode === "hasLoad" ? 1.25 : 0.5;
    if (candidateHasVerticalPush) {
      const nextCount = selectedPushAngles.vertical + 1;
      if (nextCount > 2) {
        const penalty = anglePenaltyStep * (nextCount - 2);
        score -= penalty;
        reasons.push(`-${penalty.toFixed(2)} upper-push angle repetition (vertical)`);
      }
    } else if (candidateHasPush) {
      const nextCount = selectedPushAngles.horizontal + 1;
      if (nextCount > 2) {
        const penalty = anglePenaltyStep * (nextCount - 2);
        score -= penalty;
        reasons.push(`-${penalty.toFixed(2)} upper-push angle repetition (horizontal)`);
      }
    }

    if (isChestDominantHorizontalPush(exercise)) {
      const nextChestHorizontalCount = selectedPushAngles.chestDominantHorizontal + 1;
      if (nextChestHorizontalCount >= 2) {
        const chestPenalty =
          (context.capabilityMode === "hasLoad" ? 0.75 : 0.35) *
          (nextChestHorizontalCount - 1);
        score -= chestPenalty;
        reasons.push(
          `-${chestPenalty.toFixed(2)} upper-push chest-dominant similarity penalty`
        );
      }
    }
  }

  const hasRow = selectedExercises.some(hasRowPullSignature);
  const hasVerticalPull = selectedExercises.some(hasVerticalPullSignature);
  const candidateIsRow = hasRowPullSignature(exercise);
  const candidateIsVerticalPull = hasVerticalPullSignature(exercise);
  if (hasRow && !hasVerticalPull && candidateIsVerticalPull) {
    score += 1.25;
    reasons.push("+1.25 complementary row + vertical pull");
  }
  if (hasVerticalPull && !hasRow && candidateIsRow) {
    score += 1.25;
    reasons.push("+1.25 complementary row + vertical pull");
  }

  const hasSquat = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "squat")
  );
  const hasHinge = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "hinge")
  );
  const candidateHasSquat = candidatePatternTokens.has("squat");
  const candidateHasHinge = candidatePatternTokens.has("hinge");
  if (hasSquat && !hasHinge && candidateHasHinge) {
    score += 1.5;
    reasons.push("+1.5 complementary squat + hinge");
  }
  if (hasHinge && !hasSquat && candidateHasSquat) {
    score += 1.5;
    reasons.push("+1.5 complementary squat + hinge");
  }

  const hasCarry = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "carry")
  );
  const hasAntiRotation = selectedExercises.some((entry) =>
    entry.movementPattern.some((pattern) => normalizeTagToken(pattern) === "anti_rotation")
  );
  const candidateHasCarry = candidatePatternTokens.has("carry");
  const candidateHasAntiRotation = candidatePatternTokens.has("anti_rotation");
  if (hasCarry && !hasAntiRotation && candidateHasAntiRotation) {
    score += 1;
    reasons.push("+1 complementary carry + anti-rotation");
  }
  if (hasAntiRotation && !hasCarry && candidateHasCarry) {
    score += 1;
    reasons.push("+1 complementary carry + anti-rotation");
  }

  return { score, reasons };
};

type DaySpecificVarietyIntentTuning = {
  globalExerciseRepeatMultiplier: number;
  globalFamilyRepeatMultiplier: number;
  globalVariantRepeatMultiplier: number;
  slotExerciseRepeatMultiplier: number;
  slotFamilyRepeatMultiplier: number;
  slotVariantRepeatMultiplier: number;
  slotSignatureRepeatMultiplier: number;
  dayLayoutRepeatMultiplier: number;
  dayFamilyLayoutRepeatMultiplier: number;
  novelFamilyBonusMultiplier: number;
  accessoryPrefixRepeatPenalty: number;
  accessoryPrefixVariantPenalty: number;
  accessoryNovelFamilyBonus: number;
  enforceAccessoryPrefixVariety: boolean;
};

const DEFAULT_DAY_SPECIFIC_VARIETY_TUNING: DaySpecificVarietyIntentTuning = {
  globalExerciseRepeatMultiplier: 1,
  globalFamilyRepeatMultiplier: 1,
  globalVariantRepeatMultiplier: 1,
  slotExerciseRepeatMultiplier: 1,
  slotFamilyRepeatMultiplier: 1,
  slotVariantRepeatMultiplier: 1,
  slotSignatureRepeatMultiplier: 1,
  dayLayoutRepeatMultiplier: 1,
  dayFamilyLayoutRepeatMultiplier: 1,
  novelFamilyBonusMultiplier: 1,
  accessoryPrefixRepeatPenalty: 0,
  accessoryPrefixVariantPenalty: 0,
  accessoryNovelFamilyBonus: 0,
  enforceAccessoryPrefixVariety: false,
};

const BACK_CHEST_VARIETY_SLOT_KINDS = new Set([
  "mainPushCompound",
  "mainPushFly",
  "mainPullHorizontal",
  "mainPullVertical",
  "mainPullSupport",
]);

const SHOULDERS_ARMS_VARIETY_MAIN_SLOT_KINDS = new Set([
  "mainVerticalPushPrimary",
  "mainLateralDeltPrimary",
  "mainShoulderPullPrimary",
  "mainShoulderStructuralSecondary",
  "mainShoulderStructuralAlternate",
]);

const isShouldersArmsVarietyAccessoryExercise = (exercise: Exercise) => {
  if (isShouldersArmsCarryMainLeakExercise(exercise)) return true;
  const category = resolveShouldersArmsMainCategory(exercise);
  return category === "biceps" || category === "triceps";
};

const collectRecentSlotSequenceForDaySection = (
  slotMap: Map<string, string>,
  dayTokenRaw: string,
  section: "main" | "accessory"
) => {
  const dayToken = normalizeSlotToken(dayTokenRaw);
  const prefix = `${dayToken}-${section}-`;
  return Array.from(slotMap.entries())
    .map(([slotId, value]) => {
      if (!slotId.startsWith(prefix)) return null;
      const suffix = slotId.slice(prefix.length);
      const ordinal = Number(suffix);
      if (!Number.isFinite(ordinal)) return null;
      return { value, ordinal };
    })
    .filter((entry): entry is { value: string; ordinal: number } => Boolean(entry))
    .sort((left, right) => left.ordinal - right.ordinal)
    .map((entry) => entry.value);
};

const resolveDaySpecificVarietyIntentTuning = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  auditMeta?: SelectionAuditMeta;
}) => {
  const { exercise, section, auditMeta } = params;
  if (!auditMeta?.dayTitle || !auditMeta.slotKind) {
    return DEFAULT_DAY_SPECIFIC_VARIETY_TUNING;
  }
  const dayToken = normalizeSlotToken(auditMeta.dayTitle);
  if (dayToken === "back_chest" && section === "main") {
    if (!BACK_CHEST_VARIETY_SLOT_KINDS.has(auditMeta.slotKind)) {
      return DEFAULT_DAY_SPECIFIC_VARIETY_TUNING;
    }
    return {
      globalExerciseRepeatMultiplier: 1.1,
      globalFamilyRepeatMultiplier: 1.2,
      globalVariantRepeatMultiplier: 1.25,
      slotExerciseRepeatMultiplier: 1.3,
      slotFamilyRepeatMultiplier: 1.35,
      slotVariantRepeatMultiplier: 1.45,
      slotSignatureRepeatMultiplier: 1.35,
      dayLayoutRepeatMultiplier: 1.25,
      dayFamilyLayoutRepeatMultiplier: 1.2,
      novelFamilyBonusMultiplier: 1.15,
      accessoryPrefixRepeatPenalty: 0,
      accessoryPrefixVariantPenalty: 0,
      accessoryNovelFamilyBonus: 0,
      enforceAccessoryPrefixVariety: false,
    };
  }
  if (dayToken === "shoulders_arms") {
    if (section === "main" && SHOULDERS_ARMS_VARIETY_MAIN_SLOT_KINDS.has(auditMeta.slotKind)) {
      return {
        globalExerciseRepeatMultiplier: 1.15,
        globalFamilyRepeatMultiplier: 1.2,
        globalVariantRepeatMultiplier: 1.3,
        slotExerciseRepeatMultiplier: 1.35,
        slotFamilyRepeatMultiplier: 1.4,
        slotVariantRepeatMultiplier: 1.5,
        slotSignatureRepeatMultiplier: 1.4,
        dayLayoutRepeatMultiplier: 1.3,
        dayFamilyLayoutRepeatMultiplier: 1.25,
        novelFamilyBonusMultiplier: 1.2,
        accessoryPrefixRepeatPenalty: 0,
        accessoryPrefixVariantPenalty: 0,
        accessoryNovelFamilyBonus: 0,
        enforceAccessoryPrefixVariety: false,
      };
    }
    if (section === "accessory" && isShouldersArmsVarietyAccessoryExercise(exercise)) {
      return {
        globalExerciseRepeatMultiplier: 1.2,
        globalFamilyRepeatMultiplier: 1.25,
        globalVariantRepeatMultiplier: 1.35,
        slotExerciseRepeatMultiplier: 1.35,
        slotFamilyRepeatMultiplier: 1.4,
        slotVariantRepeatMultiplier: 1.5,
        slotSignatureRepeatMultiplier: 1.4,
        dayLayoutRepeatMultiplier: 1.15,
        dayFamilyLayoutRepeatMultiplier: 1.1,
        novelFamilyBonusMultiplier: 1.1,
        accessoryPrefixRepeatPenalty: 1.05,
        accessoryPrefixVariantPenalty: 0.65,
        accessoryNovelFamilyBonus: 0.2,
        enforceAccessoryPrefixVariety: true,
      };
    }
  }
  return DEFAULT_DAY_SPECIFIC_VARIETY_TUNING;
};

const getCrossGenerationVarietyScoreBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  auditMeta?: SelectionAuditMeta;
}): ScoreWithReasons => {
  const { exercise, section, context, auditMeta } = params;
  const variationState = context.variationState;
  if (!variationState?.enabled) return { score: 0, reasons: [] };
  if (!variationState.options.useRecentMemory) return { score: 0, reasons: [] };

  let score = 0;
  const reasons: string[] = [];
  const familyKey = resolveProgramVariationFamilyKey(exercise);
  const variantKey = resolveProgramVariationVariantKey(exercise);
  const slotSignature = `${familyKey}::${variantKey}`;
  const daySpecificTuning = resolveDaySpecificVarietyIntentTuning({
    exercise,
    section,
    auditMeta,
  });

  if (variationState.memory.recentExerciseIds.has(exercise.id)) {
    const penaltyBase = section === "main" ? 3.25 : section === "accessory" ? 1.35 : 0.5;
    const penalty = penaltyBase * daySpecificTuning.globalExerciseRepeatMultiplier;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} prior-generation duplicate exercise penalty`);
  }

  const familyOveruse = variationState.memory.recentFamilyCounts.get(familyKey) ?? 0;
  if (familyOveruse > 0) {
    const penaltyBase =
      section === "main"
        ? Math.min(2.5, familyOveruse * 0.14)
        : Math.min(1.25, familyOveruse * 0.08);
    const penalty = penaltyBase * daySpecificTuning.globalFamilyRepeatMultiplier;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} prior-generation family overuse (${familyKey})`);
  } else if (section === "main") {
    const bonus = 0.25 * daySpecificTuning.novelFamilyBonusMultiplier;
    score += bonus;
    reasons.push(`+${bonus.toFixed(2)} prior-generation novel family bonus`);
  }

  const variantOveruse = variationState.memory.recentVariantCounts.get(variantKey) ?? 0;
  if (variantOveruse > 0) {
    const penaltyBase =
      section === "main"
        ? Math.min(1.6, variantOveruse * 0.1)
        : Math.min(0.8, variantOveruse * 0.06);
    const penalty = penaltyBase * daySpecificTuning.globalVariantRepeatMultiplier;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} prior-generation variant overuse (${variantKey})`);
  }

  if (auditMeta?.slotId) {
    const previousSlotExerciseId =
      variationState.memory.recentSlotExerciseIds.get(auditMeta.slotId);
    const previousSlotFamilyKeyExplicit =
      variationState.memory.recentSlotFamilyKeys.get(auditMeta.slotId);
    const previousSlotVariantKeyExplicit =
      variationState.memory.recentSlotVariantKeys.get(auditMeta.slotId);
    const previousSlotSignature =
      variationState.memory.recentSlotFamilySignatures.get(auditMeta.slotId);
    const previousSlotFamilyKey =
      previousSlotFamilyKeyExplicit ||
      (previousSlotSignature?.includes("::")
        ? previousSlotSignature.split("::")[0] ?? ""
        : "");
    const previousSlotVariantKey =
      previousSlotVariantKeyExplicit ||
      (previousSlotSignature?.includes("::")
        ? previousSlotSignature.split("::")[1] ?? ""
        : "");
    const exactSlotIdRepeat = previousSlotExerciseId === exercise.id;
    if (exactSlotIdRepeat) {
      const idRepeatPenaltyBase = section === "main" ? 2.4 : 1.2;
      const idRepeatPenalty =
        idRepeatPenaltyBase * daySpecificTuning.slotExerciseRepeatMultiplier;
      score -= idRepeatPenalty;
      reasons.push(
        `-${idRepeatPenalty.toFixed(2)} prior-generation same-slot exercise repeat`
      );
    } else {
      if (previousSlotFamilyKey && previousSlotFamilyKey === familyKey) {
        const familySlotPenaltyBase = section === "main" ? 1.35 : 0.7;
        const familySlotPenalty =
          familySlotPenaltyBase * daySpecificTuning.slotFamilyRepeatMultiplier;
        score -= familySlotPenalty;
        reasons.push(
          `-${familySlotPenalty.toFixed(2)} prior-generation same-slot family repeat (${familyKey})`
        );
      }
      if (previousSlotVariantKey && previousSlotVariantKey === variantKey) {
        const variantSlotPenaltyBase = section === "main" ? 0.65 : 0.35;
        const variantSlotPenalty =
          variantSlotPenaltyBase * daySpecificTuning.slotVariantRepeatMultiplier;
        score -= variantSlotPenalty;
        reasons.push(
          `-${variantSlotPenalty.toFixed(2)} prior-generation same-slot variant repeat (${variantKey})`
        );
      }
      if (
        previousSlotSignature &&
        !previousSlotFamilyKey &&
        !previousSlotVariantKey &&
        previousSlotSignature === slotSignature
      ) {
        const fallbackSlotPenaltyBase = section === "main" ? 1.4 : 0.75;
        const fallbackSlotPenalty =
          fallbackSlotPenaltyBase * daySpecificTuning.slotSignatureRepeatMultiplier;
        score -= fallbackSlotPenalty;
        reasons.push(
          `-${fallbackSlotPenalty.toFixed(2)} prior-generation same-slot signature repeat`
        );
      }
    }
  }
  if (section === "main" && auditMeta?.dayTitle) {
    const dayToken = normalizeSlotToken(auditMeta.dayTitle);
    const phaseIndex = phaseIndexFromStage(context.phaseStage);
    const recentMainLayouts = getVariationMemoryValuesForDayToken(
      variationState.memory.recentDayMainLayoutSignatures,
      dayToken,
      phaseIndex
    );
    const recentFamilyLayouts = getVariationMemoryValuesForDayToken(
      variationState.memory.recentDayMainFamilyLayoutSignatures,
      dayToken,
      phaseIndex
    );
    const selectedBeforeCurrent = (auditMeta.selectedMainExerciseIds ?? [])
      .map((id) => exerciseById(id))
      .filter((entry): entry is Exercise => Boolean(entry));
    if (selectedBeforeCurrent.length) {
      const proposedLayoutSignature = [...selectedBeforeCurrent, exercise]
        .map(
          (entry) =>
            `${resolveProgramVariationFamilyKey(entry)}::${resolveProgramVariationVariantKey(entry)}`
        )
        .join("|");
      if (
        recentMainLayouts.some((layout) =>
          layout === proposedLayoutSignature || layout.startsWith(`${proposedLayoutSignature}|`)
        )
      ) {
        const layoutPenalty = 2.25 * daySpecificTuning.dayLayoutRepeatMultiplier;
        score -= layoutPenalty;
        reasons.push(`-${layoutPenalty.toFixed(2)} prior-generation day layout repeat pressure`);
      }
      const proposedFamilyLayout = [...selectedBeforeCurrent, exercise]
        .map((entry) => resolveProgramVariationFamilyKey(entry))
        .join("|");
      if (
        recentFamilyLayouts.some((layout) =>
          layout === proposedFamilyLayout || layout.startsWith(`${proposedFamilyLayout}|`)
        )
      ) {
        const familyLayoutPenalty = 1.9 * daySpecificTuning.dayFamilyLayoutRepeatMultiplier;
        score -= familyLayoutPenalty;
        reasons.push(
          `-${familyLayoutPenalty.toFixed(2)} prior-generation day family-layout repeat pressure`
        );
      }
    }
  }

  if (
    section === "accessory" &&
    daySpecificTuning.enforceAccessoryPrefixVariety &&
    auditMeta?.dayTitle
  ) {
    const dayToken = normalizeSlotToken(auditMeta.dayTitle);
    const selectedAccessoryExercises = (auditMeta.selectedAccessoryExerciseIds ?? [])
      .map((id) => exerciseById(id))
      .filter((entry): entry is Exercise => Boolean(entry));
    if (selectedAccessoryExercises.length) {
      const proposedFamilyPrefix = [...selectedAccessoryExercises, exercise].map((entry) =>
        resolveProgramVariationFamilyKey(entry)
      );
      const proposedVariantPrefix = [...selectedAccessoryExercises, exercise].map((entry) =>
        resolveProgramVariationVariantKey(entry)
      );
      const recentFamilyPrefix = collectRecentSlotSequenceForDaySection(
        variationState.memory.recentSlotFamilyKeys,
        dayToken,
        "accessory"
      );
      const recentVariantPrefix = collectRecentSlotSequenceForDaySection(
        variationState.memory.recentSlotVariantKeys,
        dayToken,
        "accessory"
      );
      const sameFamilyPrefix =
        recentFamilyPrefix.length >= proposedFamilyPrefix.length &&
        proposedFamilyPrefix.every((value, index) => recentFamilyPrefix[index] === value);
      const sameVariantPrefix =
        recentVariantPrefix.length >= proposedVariantPrefix.length &&
        proposedVariantPrefix.every((value, index) => recentVariantPrefix[index] === value);
      if (sameFamilyPrefix) {
        score -= daySpecificTuning.accessoryPrefixRepeatPenalty;
        reasons.push(
          `-${daySpecificTuning.accessoryPrefixRepeatPenalty.toFixed(2)} prior-generation Day 2 accessory pairing repeat`
        );
      } else if (!recentFamilyPrefix.includes(familyKey)) {
        score += daySpecificTuning.accessoryNovelFamilyBonus;
        reasons.push(
          `+${daySpecificTuning.accessoryNovelFamilyBonus.toFixed(2)} Day 2 accessory family novelty`
        );
      }
      if (sameVariantPrefix) {
        score -= daySpecificTuning.accessoryPrefixVariantPenalty;
        reasons.push(
          `-${daySpecificTuning.accessoryPrefixVariantPenalty.toFixed(2)} prior-generation Day 2 accessory variant-pairing repeat`
        );
      }
    }
  }

  return { score, reasons };
};

const hasPatternIntersection = (left: Set<string>, right: Set<string>) =>
  Array.from(left).some((token) => right.has(token));

const resolveFeedbackSummariesForExercise = (
  exercise: Exercise,
  context: SelectionContext
) => {
  if (!context.feedbackSummaryByExercise.size) return [] as ExerciseFeedbackSummary[];
  const historyIds = Array.from(
    new Set(resolveExerciseHistoryIds(exercise.id, 1))
  ).sort((left, right) => left.localeCompare(right));
  return historyIds
    .map((id) => context.feedbackSummaryByExercise.get(id))
    .filter((summary): summary is ExerciseFeedbackSummary => Boolean(summary));
};

const hasFeedbackRiskSignalForSummary = (summary: ExerciseFeedbackSummary) =>
  summary.pain === "moderate" ||
  summary.pain === "severe" ||
  summary.difficulty === "failed" ||
  summary.difficulty === "hard";

const hasFeedbackRiskSignalForExercise = (
  exercise: Exercise,
  context: SelectionContext
) =>
  resolveFeedbackSummariesForExercise(exercise, context).some((summary) =>
    hasFeedbackRiskSignalForSummary(summary)
  );

const hasEligibleFeedbackAlternative = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  available: Set<Equipment>;
  auditMeta?: SelectionAuditMeta;
}) => {
  const { exercise, section, context, available, auditMeta } = params;
  if (section !== "main") return false;

  const hasPainOrFailureRisk = resolveFeedbackSummariesForExercise(
    exercise,
    context
  ).some(
    (summary) =>
      summary.difficulty === "failed" ||
      summary.pain === "moderate" ||
      summary.pain === "severe"
  );
  const candidatePatterns = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  const candidateSignature = deriveMovementSignature(exercise);

  return exercises.some((alternative) => {
    if (alternative.id === exercise.id) return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise: alternative,
        available,
        section,
        context,
      })
    ) {
      return false;
    }
    if (auditMeta?.slotLane && !matchesMainLanePattern(alternative, auditMeta.slotLane)) {
      return false;
    }
    const alternativePatterns = new Set(
      alternative.movementPattern.map((pattern) => normalizeTagToken(pattern))
    );
    if (!hasPatternIntersection(candidatePatterns, alternativePatterns)) {
      return false;
    }
    if (hasPainOrFailureRisk) {
      return true;
    }
    return deriveMovementSignature(alternative) !== candidateSignature;
  });
};

const shouldAvoidFeedbackRiskCandidate = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  available: Set<Equipment>;
  auditMeta?: SelectionAuditMeta;
}) => {
  const { exercise, section, context, available, auditMeta } = params;
  if (section !== "main") return false;
  if (!hasFeedbackRiskSignalForExercise(exercise, context)) return false;
  return hasEligibleFeedbackAlternative({
    exercise,
    section,
    context,
    available,
    auditMeta,
  });
};

const getFeedbackSelectionScoreBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  available: Set<Equipment>;
  auditMeta?: SelectionAuditMeta;
}) => {
  const { exercise, section, context, available, auditMeta } = params;
  if (section !== "main") {
    return { score: 0, reasons: [] as string[] };
  }

  const feedbackSummaries = resolveFeedbackSummariesForExercise(exercise, context);
  const hasPainPenalty = feedbackSummaries.some(
    (summary) => summary.pain === "moderate" || summary.pain === "severe"
  );
  const hasFailurePenalty = feedbackSummaries.some(
    (summary) => summary.difficulty === "failed"
  );
  const hasHardPenalty = feedbackSummaries.some(
    (summary) => summary.difficulty === "hard"
  );
  const hasEasyReadyBonus = feedbackSummaries.some(
    (summary) => summary.difficulty === "easy" && summary.completionRate >= 1
  );

  let score = 0;
  const reasons: string[] = [];

  if (hasPainPenalty) {
    score -= 4;
    reasons.push("-4 feedback pain penalty");
  }
  if (hasFailurePenalty) {
    score -= 2.5;
    reasons.push("-2.5 feedback failure penalty");
  } else if (hasHardPenalty) {
    score -= 0.75;
    reasons.push("-0.75 feedback hard-session penalty");
  }
  if (!hasPainPenalty && !hasFailurePenalty && hasEasyReadyBonus) {
    score += 0.5;
    reasons.push("+0.5 feedback progression readiness bonus");
  }

  const hasSubstituteOption =
    (hasPainPenalty || hasFailurePenalty) &&
    hasEligibleFeedbackAlternative({
      exercise,
      section,
      context,
      available,
      auditMeta,
    });
  if (hasSubstituteOption) {
    score -= 6;
    reasons.push("-6 feedback substitute-available penalty");
  }

  const candidatePatterns = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );
  const candidateSignature = deriveMovementSignature(exercise);
  const shouldPreferSafeAlternative =
    !hasPainPenalty &&
    !hasFailurePenalty &&
    context.feedbackPenaltyHints.some((hint) => {
      if (hint.exerciseId === exercise.id) return false;
      if (hint.movementSignature === candidateSignature) return false;
      return hasPatternIntersection(candidatePatterns, hint.movementPatterns);
    });

  if (shouldPreferSafeAlternative) {
    score += 1.5;
    reasons.push("+1.5 feedback safe-substitution pattern bonus");
  }

  return { score, reasons };
};

const getIntentSlotScoreBonus = (params: {
  exercise: Exercise;
  section: ProgramRoutineItem["section"] | undefined;
  context: SelectionContext;
  available: Set<Equipment>;
  auditMeta?: SelectionAuditMeta;
}): ScoreWithReasons => {
  const { exercise, section, context, available, auditMeta } = params;
  let score = 0;
  const reasons: string[] = [];
  const role = deriveExerciseRole(exercise);
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeTagToken));
  const lane = auditMeta?.slotLane;
  const gymLoadReadyMain =
    section === "main" &&
    context.capabilityMode === "hasLoad" &&
    context.experienceLevel !== "beginner" &&
    context.painSeverity !== "high" &&
    Boolean(lane);

  if (section === "main" && lane) {
    if (matchesMainLanePattern(exercise, lane)) {
      score += 3;
      reasons.push(`+3 lane match (${lane})`);
    } else {
      score -= 2;
      reasons.push(`-2 lane mismatch (${lane})`);
    }
  }

  if (
    section === "main" &&
    context.phaseStage === "activation" &&
    context.capabilityMode === "hasLoad"
  ) {
    const conservativeActivationMachineBias =
      context.experienceLevel === "beginner" || context.painSeverity === "high";
    const foundationalMainPattern =
      patterns.has("push") ||
      patterns.has("verticalpush") ||
      patterns.has("pull") ||
      patterns.has("horizontalpull") ||
      patterns.has("verticalpull") ||
      patterns.has("squat") ||
      patterns.has("hinge");
    if (foundationalMainPattern && conservativeActivationMachineBias) {
      if (exercise.equipment.includes("machines")) {
        score += 5;
        reasons.push("+5 Control & Technique machine-main priority");
      } else if (exercise.loadType === "weighted") {
        score -= 1;
        reasons.push("-1 Control & Technique non-machine weighted main de-priority");
      }
    } else if (
      foundationalMainPattern &&
      context.experienceLevel !== "beginner" &&
      context.painSeverity === "low"
    ) {
      if (exercise.loadType === "weighted" && !exercise.equipment.includes("machines")) {
        score += 0.75;
        reasons.push("+0.75 activation non-machine weighted main preference for intermediate/advanced");
      } else if (exercise.equipment.includes("machines")) {
        score -= 0.35;
        reasons.push("-0.35 activation machine-main de-priority for intermediate/advanced");
      }
    }
  }

  if (gymLoadReadyMain && lane) {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const hingeControlException =
      lane === "hinge" &&
      (exercise.id === "back-extension-hold" || exercise.id === "back-extension");
    const lowDemandMain =
      (exercise.loadType === "bodyweight" ||
        exercise.loadType === "assisted" ||
        exercise.loadType === "timed") &&
      !hingeControlException;
    if (exercise.loadType === "weighted") {
      const bonus =
        context.phaseStage === "activation" ? 1.5 : context.phaseStage === "skill" ? 2 : 2.5;
      score += bonus;
      reasons.push(`+${bonus} gym loaded-main progression bias`);
    }
    if (lowDemandMain) {
      const penalty =
        context.phaseStage === "activation" ? 1.5 : context.phaseStage === "skill" ? 2.5 : 4;
      score -= penalty;
      reasons.push(`-${penalty} gym low-load main de-priority`);
    }
    if (
      (lane === "push" || lane === "verticalPush") &&
      descriptor.includes("pushup") &&
      !descriptor.includes("scapular")
    ) {
      const penalty = context.phaseStage === "activation" ? 1 : 2.5;
      score -= penalty;
      reasons.push(`-${penalty} gym pushup fallback penalty`);
    }
  }

  if (section === "main" && role === "accessoryIsolation") {
    const penalty = context.phaseStage === "growth" ? 2 : 4;
    score -= penalty;
    reasons.push(`-${penalty} isolation movement de-prioritized as main`);
  }

  if (section === "main" && auditMeta?.slotLane === "verticalPush") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const shoulderPressPattern =
      descriptor.includes("press") && (tags.has("shoulders") || patterns.has("verticalpush"));
    const lateralRaisePattern =
      descriptor.includes("lateral-raise") || descriptor.includes("lateral raise");

    if (shoulderPressPattern) {
      score += 1.25;
      reasons.push("+1.25 vertical slot shoulder-press specificity");
    }
    if (lateralRaisePattern) {
      score -= 1.25;
      reasons.push("-1.25 lateral raise de-prioritized as primary vertical slot");
    }
    if (
      context.capabilityMode === "hasLoad" &&
      context.phaseStage !== "growth" &&
      descriptor.includes("machine")
    ) {
      const conservativeShoulderPressBias =
        context.experienceLevel === "beginner" || context.painSeverity === "high";
      if (conservativeShoulderPressBias) {
        score += 0.8;
        reasons.push("+0.8 machine-guided shoulder press bias in early phases");
      } else {
        score -= 0.4;
        reasons.push("-0.4 intermediate/advanced vertical-push avoids machine defaulting in early phases");
      }
    }
    if (
      context.phaseStage === "growth" &&
      shoulderPressPattern &&
      exercise.equipment.includes("dumbbells")
    ) {
      score += 0.4;
      reasons.push("+0.4 dumbbell shoulder-press progression bias in growth");
    }
  }

  if (section === "main" && auditMeta?.slotLane === "push" && context.capabilityMode === "hasLoad") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const backChestMainDay = isBackChestDayTitle(auditMeta?.dayTitle);
    const intermediateBackChestExpansionPushSlot = isBackChestIntermediateExpansionPushSlot({
      auditMeta,
      context,
    });
    const backChestFlyAnchorSlot = backChestMainDay && auditMeta?.slotKind === "mainPushFly";
    const allowBackChestFlyMainSlot =
      intermediateBackChestExpansionPushSlot || backChestFlyAnchorSlot;
    const gymLikeIntermediateUpperMainContext =
      hasGymLikeUpperImplementAvailability(available) &&
      context.experienceLevel !== "beginner";
    const shoulderPainProfile =
      context.painSeverity !== "low" ||
      context.painAreas.some((area) => {
        const token = normalizeTagToken(area);
        return token === "shoulders" || token === "neck";
      });
    const floorPressPattern =
      descriptor.includes("floor-press") ||
      descriptor.includes("floor press") ||
      exercise.id === "dumbbell-floor-press" ||
      exercise.id === "barbell-floor-press";
    const chestIsolationMainPattern =
      descriptor.includes("fly") ||
      descriptor.includes("pec deck") ||
      descriptor.includes("pec-deck");
    const loadedPressPattern =
      exercise.loadType === "weighted" &&
      (descriptor.includes("press") ||
        descriptor.includes("bench") ||
        descriptor.includes("floor") ||
        descriptor.includes("chest"));
    const selectedMainChestFamilies = (auditMeta?.selectedMainExerciseIds ?? [])
      .map((selectedId) => exerciseById(selectedId))
      .filter((entry): entry is Exercise => Boolean(entry))
      .map((entry) => resolveBackChestChestStimulusFamily(entry))
      .filter((family): family is BackChestChestStimulusFamily => Boolean(family));
    const selectedPressFamilyCount = selectedMainChestFamilies.filter(
      (family) => family === "press"
    ).length;
    const selectedFlyFamilyCount = selectedMainChestFamilies.filter(
      (family) => family === "fly"
    ).length;
    const selectedChestFamily =
      selectedPressFamilyCount > 0 && selectedFlyFamilyCount === 0
        ? ("press" as BackChestChestStimulusFamily)
        : selectedFlyFamilyCount > 0 && selectedPressFamilyCount === 0
        ? ("fly" as BackChestChestStimulusFamily)
        : null;
    const candidateChestFamily = resolveBackChestChestStimulusFamily(exercise);
    const pairingPushSlot =
      backChestMainDay &&
      (intermediateBackChestExpansionPushSlot || backChestFlyAnchorSlot);
    if (
      backChestMainDay &&
      gymLikeIntermediateUpperMainContext &&
      isVeryLowLoadPushupVariantExercise(exercise) &&
      hasEligibleLoadedBackChestPushAlternative({
        exercise,
        slotKind: auditMeta?.slotKind ?? "mainPushCompound",
        slotLane: auditMeta?.slotLane,
        allowChestFly: allowBackChestFlyMainSlot,
        available,
        context,
      })
    ) {
      const penalty = context.phaseStage === "activation" ? 16 : 24;
      score -= penalty;
      reasons.push(
        `-${penalty} Back + Chest gym progression blocks very-low-load push-up mains when loaded alternatives exist`
      );
    }
    if (
      pairingPushSlot &&
      gymLikeIntermediateUpperMainContext &&
      selectedChestFamily &&
      candidateChestFamily
    ) {
      if (candidateChestFamily === selectedChestFamily) {
        score -= 10;
        reasons.push("-10 Back + Chest extra push slot avoids repeating chest family");
      } else {
        score += 12;
        reasons.push("+12 Back + Chest extra push slot favors press/fly complement pairing");
      }
    }
    if (loadedPressPattern) {
      const delta = context.phaseStage === "activation" ? 1 : 1.75;
      score += delta;
      reasons.push(`+${delta} loaded horizontal push specificity`);
    }
    if (backChestMainDay) {
      const beginnerPressSupport =
        exercise.id === "machine-chest-press" || exercise.id === "incline-pushup";
      const intermediatePressProgression =
        exercise.id === "dumbbell-bench-press" || exercise.id === "dumbbell-incline-press";
      const advancedPressProgression =
        exercise.id === "barbell-bench-press-paused" ||
        (exercise.equipment.includes("barbell") && descriptor.includes("bench"));

      if (context.experienceLevel === "beginner") {
        if (beginnerPressSupport) {
          score += 4;
          reasons.push("+4 beginner press ladder prefers machine/incline push-up");
        }
        if (exercise.equipment.includes("barbell")) {
          score -= 6;
          reasons.push("-6 beginner press ladder avoids barbell pressing");
        }
      } else if (context.experienceLevel === "intermediate") {
        if (intermediatePressProgression) {
          score += 3.5;
          reasons.push("+3.5 intermediate press ladder prefers dumbbell bench/incline");
        }
        if (
          context.phaseStage !== "activation" &&
          exercise.id === "machine-chest-press" &&
          context.painSeverity === "low"
        ) {
          score -= 1.75;
          reasons.push("-1.75 intermediate press ladder avoids default machine pressing");
        }
      } else {
        if (context.phaseStage === "growth" && advancedPressProgression) {
          score += 5;
          reasons.push("+5 advanced press ladder prioritizes barbell bench progression");
        }
        if (
          context.phaseStage === "growth" &&
          available.has("barbell") &&
          intermediatePressProgression
        ) {
          score -= 2.5;
          reasons.push("-2.5 advanced press ladder avoids staying at dumbbell level with barbell available");
        }
      }
    }
    if (backChestMainDay && patterns.has("verticalpush")) {
      score -= 12;
      reasons.push("-12 Back + Chest push anchor requires horizontal press (not vertical push)");
    }
    if (backChestMainDay && chestIsolationMainPattern) {
      if (allowBackChestFlyMainSlot) {
        score += 9;
        reasons.push("+9 Back + Chest fly-enabled push slot prioritizes fly pattern");
      } else {
        score -= 12;
        reasons.push("-12 Back + Chest push anchor blocks chest-isolation mains");
      }
    } else if (backChestMainDay && allowBackChestFlyMainSlot) {
      if (backChestFlyAnchorSlot) {
        score -= 8;
        reasons.push("-8 Back + Chest fly-first slot requires chest-fly pattern");
      } else {
        score -= 1.5;
        reasons.push("-1.5 Back + Chest intermediate expansion push slot nudges toward fly variation");
      }
    }
    if (backChestMainDay && floorPressPattern) {
      const beginnerShoulderProtectionCase =
        context.experienceLevel === "beginner" && shoulderPainProfile;
      if (beginnerShoulderProtectionCase) {
        score += 1.25;
        reasons.push("+1.25 floor-press allowed for beginner shoulder-protection profile");
      } else {
        const penalty = context.experienceLevel === "advanced" ? 12 : 9;
        score -= penalty;
        reasons.push(
          `-${penalty} Back + Chest de-prioritizes floor-press outside beginner shoulder-protection use`
        );
      }
    }
  }

  if (section === "main" && auditMeta?.slotLane === "pull" && context.capabilityMode === "hasLoad") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const backChestMainDay = isBackChestDayTitle(auditMeta?.dayTitle);
    const loadedPullPattern =
      (exercise.loadType === "weighted" || exercise.loadType === "assisted") &&
      (descriptor.includes("row") ||
        descriptor.includes("pulldown") ||
        descriptor.includes("lat") ||
        exercise.equipment.includes("machines") ||
        exercise.equipment.includes("cables"));
    if (loadedPullPattern) {
      const delta = context.phaseStage === "activation" ? 1.25 : 2;
      score += delta;
      reasons.push(`+${delta} loaded pull specificity`);
    }
    const lowValuePull =
      descriptor.includes("prone-elbow-row") ||
      descriptor.includes("supine-elbow-drive-row") ||
      descriptor.includes("lat-sweep") ||
      descriptor.includes("snow angel");
    if (lowValuePull) {
      const penalty = context.phaseStage === "activation" ? 0.75 : 2;
      score -= penalty;
      reasons.push(`-${penalty} low-progressive pull de-priority`);
    }
    const conservativeActivationPullBias =
      context.experienceLevel === "beginner" || context.painSeverity === "high";
    if (
      context.phaseStage === "activation" &&
      conservativeActivationPullBias &&
      exercise.equipment.includes("machines")
    ) {
      score += 2.5;
      reasons.push("+2.5 Control & Technique pull-slot machine priority");
    }
    if (
      context.phaseStage === "activation" &&
      conservativeActivationPullBias &&
      exercise.id === "dumbbell-rows"
    ) {
      score -= 4;
      reasons.push("-4 dumbbell row held for later-phase pull progression");
    }
    if (
      backChestMainDay &&
      context.phaseStage === "activation" &&
      auditMeta?.slotKind === "mainPullHorizontal"
    ) {
      if (conservativeActivationPullBias) {
        if (exercise.id === "machine-seated-row") {
          score += 8;
          reasons.push("+8 Back + Chest first pull slot prefers machine seated row in control phase");
        }
        if (exercise.id === "dumbbell-rows") {
          score -= 6;
          reasons.push("-6 Back + Chest first pull slot de-prioritizes dumbbell row in control phase");
        }
      } else if (context.painSeverity === "low") {
        if (
          exercise.id === "dumbbell-rows" ||
          exercise.id === "dumbbell-chest-supported-row" ||
          exercise.id === "cable-seated-row"
        ) {
          score += 2.25;
          reasons.push("+2.25 Back + Chest activation pull slot favors skill-carrying row variants");
        }
        if (exercise.id === "machine-seated-row") {
          score -= 1.5;
          reasons.push("-1.5 Back + Chest activation pull slot avoids machine-default lock-in");
        }
      }
    }
  }

  if (section === "main" && isBackChestDayTitle(auditMeta?.dayTitle)) {
    const tier = resolveBackChestEquipmentTier(exercise);
    const highestTierForSlot = resolveHighestBackChestTierForSlot({
      slotKind: auditMeta?.slotKind ?? "mainRepair",
      slotLane: auditMeta?.slotLane,
      available,
      context,
    });
    if (context.phaseStage === "activation") {
      if (tier <= 2) {
        score += 2;
        reasons.push("+2 Back + Chest Control phase prefers Tier 1/2 positions");
      } else {
        score -= 3;
        reasons.push("-3 Back + Chest Control phase de-prioritizes Tier 3 neural demand");
      }
    } else if (context.phaseStage === "skill") {
      if (tier === 2) {
        score += 2.5;
        reasons.push("+2.5 Back + Chest Hypertrophy phase prefers Tier 2 loading");
      } else if (tier === 1 && context.painSeverity === "low") {
        score -= 2;
        reasons.push("-2 Back + Chest Hypertrophy phase avoids default Tier 1 when unconstrained");
      } else if (tier === 3 && context.experienceLevel === "advanced") {
        score += 0.75;
        reasons.push("+0.75 advanced readiness for selective Tier 3 in Hypertrophy phase");
      }
    } else {
      if (tier === highestTierForSlot) {
        score += 3.5;
        reasons.push("+3.5 Back + Chest Strength phase escalates to highest available tier");
      } else if (highestTierForSlot > tier && context.painSeverity === "low") {
        score -= 4;
        reasons.push("-4 Back + Chest Strength phase avoids staying below available top tier");
      }
      if (
        available.has("barbell") &&
        highestTierForSlot >= 3 &&
        exercise.equipment.includes("barbell")
      ) {
        score += 2.5;
        reasons.push("+2.5 barbell-over-dumbbell preference in Strength phase");
      }
      if (
        available.has("barbell") &&
        highestTierForSlot >= 3 &&
        !exercise.equipment.includes("barbell") &&
        tier === 2
      ) {
        score -= 1.5;
        reasons.push("-1.5 dumbbell plateau penalty when barbell path is available");
      }
    }
  }

  if (section === "main" && auditMeta?.slotKind === "mainPullHorizontal") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const isHorizontalPull = hasHorizontalPullSignature(exercise);
    const isVerticalPull = hasVerticalPullSignature(exercise);
    if (isHorizontalPull) {
      score += 6;
      reasons.push("+6 Back + Chest horizontal-pull slot specificity");
    } else {
      score -= 6;
      reasons.push("-6 Back + Chest horizontal-pull slot mismatch");
    }
    if (isVerticalPull) {
      score -= 3;
      reasons.push("-3 vertical-pull de-prioritized in dedicated horizontal slot");
    }
    if (descriptor.includes("row")) {
      score += 1.25;
      reasons.push("+1.25 row specificity in horizontal pull slot");
    }

    const supportedRowPattern =
      exercise.equipment.includes("machines") ||
      exercise.equipment.includes("cables") ||
      descriptor.includes("supported") ||
      descriptor.includes("chest-supported");
    const unsupportedHingeRow = isBackChestUnsupportedHingeRowExercise(exercise);
    if (context.experienceLevel === "beginner") {
      if (supportedRowPattern) {
        score += 3;
        reasons.push("+3 beginner row ladder prefers machine/supported rows");
      }
      if (unsupportedHingeRow || exercise.equipment.includes("barbell")) {
        score -= 4;
        reasons.push("-4 beginner row ladder avoids unsupported hinge rows");
      }
    } else if (context.experienceLevel === "intermediate") {
      if (
        descriptor.includes("dumbbell") ||
        descriptor.includes("chest-supported") ||
        exercise.id === "dumbbell-rows"
      ) {
        score += 3;
        reasons.push("+3 intermediate row ladder prefers dumbbell/chest-supported rows");
      }
      if (context.phaseStage !== "activation" && exercise.equipment.includes("machines")) {
        score -= 1.5;
        reasons.push("-1.5 intermediate row ladder de-prioritizes default machine rows");
      }
    } else {
      if (context.phaseStage === "growth" && (exercise.equipment.includes("barbell") || unsupportedHingeRow)) {
        score += 4;
        reasons.push("+4 advanced row ladder prefers barbell/unsupported hinge rows");
      }
      if (context.phaseStage === "growth" && supportedRowPattern) {
        score -= 2.5;
        reasons.push("-2.5 advanced row ladder avoids staying on supported rows in Strength phase");
      }
    }
  }

  if (section === "main" && auditMeta?.slotKind === "mainPullSupport") {
    const horizontalPull = hasHorizontalPullSignature(exercise);
    const verticalPull = hasVerticalPullSignature(exercise);
    const supportCategory = resolveBackChestMainStimulusCategory(exercise);
    const isLatAccentSupport = supportCategory === "latAccent";
    const selectedMainExercises = (auditMeta?.selectedMainExerciseIds ?? [])
      .map((id) => exerciseById(id))
      .filter((entry): entry is Exercise => Boolean(entry));
    const hasSelectedHorizontalPull = selectedMainExercises.some(hasHorizontalPullSignature);
    const hasSelectedVerticalPull = selectedMainExercises.some(hasVerticalPullSignature);
    if (isBackChestScapularAccessoryPullExercise(exercise)) {
      score -= 20;
      reasons.push("-20 Back + Chest extra pull main blocks scapular accessory patterns");
    } else if (horizontalPull || verticalPull) {
      score += 4;
      reasons.push("+4 Back + Chest extra pull main favors compound pull expansion");
    } else {
      score -= 12;
      reasons.push("-12 Back + Chest extra pull main requires horizontal or vertical pull pattern");
    }

    if (isLatAccentSupport) {
      score += 8.5;
      reasons.push("+8.5 Back + Chest advanced extra pull prioritizes pullover/lat-accent balance");
      if (available.has("dumbbells")) {
        score += 2.25;
        reasons.push("+2.25 dumbbell pullover preference when available");
      }
      if (
        context.experienceLevel === "advanced" &&
        context.painSeverity === "low" &&
        context.phaseStage !== "activation"
      ) {
        score += 1.25;
        reasons.push("+1.25 advanced low-pain phase supports lat-accent volume");
      }
    }

    if (horizontalPull && hasSelectedHorizontalPull) {
      score -= 6;
      reasons.push("-6 Back + Chest extra pull main de-prioritizes second horizontal pull by default");
    }
    if (verticalPull && hasSelectedVerticalPull && !isLatAccentSupport) {
      score -= 2;
      reasons.push("-2 Back + Chest extra pull main lightly de-prioritizes repeated vertical-pull loading");
    }

    if (horizontalPull) {
      const candidateAngle = backChestRowAngleSignature(exercise);
      if (
        candidateAngle &&
        selectedMainExercises.some(
          (selectedExercise) => backChestRowAngleSignature(selectedExercise) === candidateAngle
        )
      ) {
        score -= 10;
        reasons.push("-10 Back + Chest extra pull main avoids duplicate row-angle stacking");
      } else {
        score += 1.5;
        reasons.push("+1.5 Back + Chest extra pull main supports additional row loading");
      }
    }
    if (verticalPull && !isLatAccentSupport) {
      score += 2.5;
      reasons.push("+2.5 Back + Chest extra pull main favors secondary vertical pull reinforcement");
    }
    if (
      context.experienceLevel === "advanced" &&
      !isLatAccentSupport &&
      hasSelectedHorizontalPull &&
      hasSelectedVerticalPull
    ) {
      if (horizontalPull) {
        score += 3;
        reasons.push("+3 advanced extra-back fallback prefers row variant before extra vertical");
      }
      if (verticalPull) {
        score -= 3;
        reasons.push("-3 advanced extra-back fallback de-prioritizes third vertical before row variant");
      }
    }
    if (context.phaseStage !== "activation" && exercise.loadType === "weighted") {
      score += 0.75;
      reasons.push("+0.75 Back + Chest extra pull main higher-tension progression bonus");
    }
  }

  if (section === "main" && isBackChestDayTitle(auditMeta?.dayTitle)) {
    const gymLikeIntermediateUpperMainContext =
      hasGymLikeUpperImplementAvailability(available) &&
      context.experienceLevel !== "beginner";
    const intermediateBackChestExpansionPushSlot = isBackChestIntermediateExpansionPushSlot({
      auditMeta,
      context,
    });
    const backChestFlyAnchorSlot = auditMeta?.slotKind === "mainPushFly";
    const allowBackChestFlyMainSlot =
      intermediateBackChestExpansionPushSlot || backChestFlyAnchorSlot;
    if (
      gymLikeIntermediateUpperMainContext &&
      isScapularYTRaiseFamilyExercise(exercise) &&
      hasEligibleBackChestNonScapularMainAlternative({
        exercise,
        slotKind: auditMeta?.slotKind ?? "mainRepair",
        slotLane: auditMeta?.slotLane,
        allowChestFly: allowBackChestFlyMainSlot,
        available,
        context,
      })
    ) {
      const penalty = context.phaseStage === "activation" ? 10 : 16;
      score -= penalty;
      reasons.push(
        `-${penalty} Back + Chest gym progression reserves Y/T-raise family for accessory-corrective use when stronger mains are available`
      );
    }
  }

  if (section === "main" && auditMeta?.slotKind === "mainPullVertical") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const isVerticalPull = patterns.has("verticalpull");
    const isLatAccentVertical = isBackChestLatAccentExercise(exercise);
    if (isVerticalPull) {
      score += 6;
      reasons.push("+6 Back + Chest vertical-pull slot specificity");
    } else {
      score -= 6;
      reasons.push("-6 Back + Chest vertical-pull slot mismatch");
    }
    if (
      isLatAccentVertical &&
      hasEligibleBackChestMainAlternative({
        exercise,
        slotKind: "mainPullVertical",
        slotLane: "pull",
        allowChestFly: false,
        available,
        context,
        predicate: (candidate) =>
          hasVerticalPullSignature(candidate) && !isBackChestLatAccentExercise(candidate),
      })
    ) {
      score -= 12;
      reasons.push("-12 Back + Chest vertical slot reserves pullover/lat-accent for extra-back template slots");
    }
    if (isLatAccentVertical && context.experienceLevel === "intermediate") {
      score -= 18;
      reasons.push("-18 intermediate Back + Chest vertical slot blocks pullover when row+vertical templates are available");
    }

    if (descriptor.includes("pulldown")) {
      score += 2.5;
      reasons.push("+2.5 pulldown-first progression bonus");
    }
    const pullupBarAvailable = available.has("pullup_bar");
    const assistedPullup = isAssistedPullupExercise(exercise);
    const bodyweightPullup = isBodyweightPullupExercise(exercise);
    const weightedPullup = isWeightedPullupExercise(exercise);
    const assistedPullupEligible =
      pullupBarAvailable &&
      hasEligibleBackChestMainCandidate({
        slotKind: "mainPullVertical",
        slotLane: "pull",
        context: {
          available,
          selectionContext: context,
          capabilityMode: context.capabilityMode,
        },
        predicate: (candidate) => isAssistedPullupExercise(candidate),
      });
    const bodyweightPullupEligible =
      pullupBarAvailable &&
      hasEligibleBackChestMainCandidate({
        slotKind: "mainPullVertical",
        slotLane: "pull",
        context: {
          available,
          selectionContext: context,
          capabilityMode: context.capabilityMode,
        },
        predicate: (candidate) => isBodyweightPullupExercise(candidate),
      });
    if (pullupBarAvailable) {
      if (context.experienceLevel === "beginner") {
        if (assistedPullup) {
          score += 5;
          reasons.push("+5 beginner pull-up ladder prefers assisted pull-up");
        }
        if (assistedPullupEligible && !assistedPullup && context.painSeverity === "low") {
          score -= 3;
          reasons.push("-3 beginner pull-up ladder prioritizes assisted pull-up when available");
        }
        if (bodyweightPullup) {
          score -= 3.5;
          reasons.push("-3.5 beginner pull-up ladder avoids strict bodyweight pull-up");
        }
        if (weightedPullup) {
          score -= 7;
          reasons.push("-7 beginner pull-up ladder blocks weighted pull-up");
        }
      } else if (context.experienceLevel === "intermediate") {
        if (bodyweightPullup) {
          score += 5;
          reasons.push("+5 intermediate pull-up ladder prefers bodyweight pull-up");
        }
        if (
          bodyweightPullupEligible &&
          !bodyweightPullup &&
          context.painSeverity === "low"
        ) {
          score -= 3;
          reasons.push("-3 intermediate pull-up ladder prioritizes bodyweight pull-up when available");
        }
        if (assistedPullup && context.painSeverity === "low") {
          score -= 3;
          reasons.push("-3 intermediate pull-up ladder avoids assisted pull-up when unconstrained");
        }
        if (weightedPullup && context.phaseStage !== "growth") {
          score -= 1.25;
          reasons.push("-1.25 intermediate pull-up ladder delays weighted pull-up until Strength phase");
        }
      } else {
        if (weightedPullup) {
          const bonus = context.phaseStage === "growth" ? 10 : 3;
          score += bonus;
          reasons.push(`+${bonus} advanced pull-up ladder prioritizes weighted pull-up progression`);
        } else if (
          context.phaseStage === "growth" &&
          available.has("dumbbells") &&
          context.painSeverity === "low"
        ) {
          score -= 12;
          reasons.push("-12 advanced pull-up ladder requires weighted pull-up when available");
        } else if (bodyweightPullup) {
          score += 2;
          reasons.push("+2 advanced pull-up ladder accepts strict pull-up as fallback");
        } else if (assistedPullup && context.painSeverity === "low") {
          score -= 4;
          reasons.push("-4 advanced pull-up ladder avoids assisted pull-up when higher tiers are available");
        }
      }
    } else if (assistedPullup) {
      score -= 2;
      reasons.push("-2 assisted pull-up de-prioritized when pull-up bar is unavailable");
    }

    if (descriptor.includes("row")) {
      score -= 3;
      reasons.push("-3 row de-prioritized in dedicated vertical-pull slot");
    }
  }

  if (section === "accessory" && auditMeta?.slotKind === "accessorychest") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const hasLoadAccess = context.capabilityMode === "hasLoad";
    const highPain = context.painSeverity === "high";
    const backChestAccessoryDay = isBackChestDayTitle(auditMeta?.dayTitle);
    const machineBased = exercise.equipment.includes("machines");
    const cableBased = exercise.equipment.includes("cables");
    const dumbbellBased = exercise.equipment.includes("dumbbells");
    const bodyweightFallback = isBodyweightFallbackAccessory(exercise);

    if (descriptor.includes("fly")) {
      const bonus = backChestAccessoryDay ? 4 : 1.5;
      score += bonus;
      reasons.push(`+${bonus} chest-fly rehab specificity`);
    }
    if (hasLoadAccess) {
      if (machineBased) {
        const bonus = backChestAccessoryDay ? 6 : 5.5;
        score += bonus;
        reasons.push(`+${bonus} machine chest accessory priority`);
      } else if (cableBased) {
        const bonus = backChestAccessoryDay ? 5 : 4.5;
        score += bonus;
        reasons.push(`+${bonus} cable chest accessory priority`);
      } else if (dumbbellBased) {
        const bonus = backChestAccessoryDay ? 2 : 2.5;
        score += bonus;
        reasons.push(`+${bonus} dumbbell chest accessory priority`);
      }
      if (bodyweightFallback) {
        const penalty = highPain ? 1.5 : backChestAccessoryDay ? 9 : 7;
        score -= penalty;
        reasons.push(`-${penalty} bodyweight chest fallback de-priority when load is available`);
      }
      if (descriptor.includes("pushup") || descriptor.includes("push-up")) {
        const penalty = highPain ? 1.5 : 3.5;
        score -= penalty;
        reasons.push(`-${penalty} push-up reserved as fallback chest accessory in gym contexts`);
      }
      if (
        backChestAccessoryDay &&
        (descriptor.includes("floor-press") ||
          descriptor.includes("floor press") ||
          descriptor.includes("bench"))
      ) {
        const penalty = highPain ? 0.5 : 2;
        score -= penalty;
        reasons.push(`-${penalty} Back + Chest chest slot biases fly variation over pressing accessory`);
      }
    } else if (bodyweightFallback) {
      score += 1.5;
      reasons.push("+1.5 no-load chest fallback bonus");
    }
  }

  if (section === "accessory" && auditMeta?.slotKind === "accessoryback") {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    const hasLoadAccess = context.capabilityMode === "hasLoad";
    const highPain = context.painSeverity === "high";
    const backChestAccessoryDay = isBackChestDayTitle(auditMeta?.dayTitle);
    const machineBased = exercise.equipment.includes("machines");
    const cableBased = exercise.equipment.includes("cables");
    const bodyweightFallback = isBodyweightFallbackAccessory(exercise);
    const facePullPattern = descriptor.includes("face-pull") || descriptor.includes("face pull");
    const uprightPattern = descriptor.includes("upright");
    const rearDeltPattern = descriptor.includes("rear-delt") || descriptor.includes("rear delt");
    const dumbbellRowPattern = exercise.id === "dumbbell-rows" || descriptor.includes("dumbbell rows");
    const suspensionPattern = descriptor.includes("suspension");
    const pulloverPattern = descriptor.includes("pullover");
    const selectedMainDescriptors = (auditMeta?.selectedMainExerciseIds ?? [])
      .map((id) => exerciseById(id))
      .filter((entry): entry is Exercise => Boolean(entry))
      .map((entry) => `${entry.id} ${entry.name}`.toLowerCase());
    const mainAlreadyHasRowOrVerticalPull = selectedMainDescriptors.some(
      (entry) => entry.includes("row") || entry.includes("pulldown") || entry.includes("lat")
    );
    const rowLikeAccessory = descriptor.includes("row") || descriptor.includes("pulldown") || descriptor.includes("lat");

    if (facePullPattern) {
      const bonus = backChestAccessoryDay ? 4 : 2;
      score += bonus;
      reasons.push(`+${bonus} face-pull rehab specificity`);
    }
    if (backChestAccessoryDay && (uprightPattern || rearDeltPattern)) {
      score += 2.75;
      reasons.push("+2.75 upright/rear-delt pull rehab specificity");
    }
    if (descriptor.includes("row") || descriptor.includes("pulldown") || descriptor.includes("lat")) {
      const bonus = backChestAccessoryDay ? 1.25 : 1;
      score += bonus;
      reasons.push(`+${bonus} back accessory pattern specificity`);
    }

    if (hasLoadAccess) {
      if (backChestAccessoryDay && pulloverPattern) {
        const bonus = context.phaseStage === "activation" ? 12 : 4;
        score += bonus;
        reasons.push(`+${bonus} Back + Chest accessory pull-over pattern preference`);
      }
      if (machineBased) {
        const bonus = backChestAccessoryDay ? 6.5 : 6;
        score += bonus;
        reasons.push(`+${bonus} machine back accessory priority`);
      } else if (cableBased) {
        const bonus = backChestAccessoryDay ? 6 : 5;
        score += bonus;
        reasons.push(`+${bonus} cable back accessory priority`);
      }
      if (bodyweightFallback) {
        const penalty = highPain ? 1.25 : backChestAccessoryDay ? 9.5 : 7;
        score -= penalty;
        reasons.push(`-${penalty} bodyweight back fallback de-priority when load is available`);
      }
      if (
        descriptor.includes("supine-elbow-drive-row") ||
        descriptor.includes("prone-elbow-row") ||
        descriptor.includes("snow-angel")
      ) {
        const penalty = highPain ? 0.75 : backChestAccessoryDay ? 5 : 4;
        score -= penalty;
        reasons.push(`-${penalty} low-load back corrective reserved as fallback`);
      }
      if (
        descriptor.includes("prone-swimmer") ||
        descriptor.includes("back-widow") ||
        descriptor.includes("reverse-snow-angel")
      ) {
        const penalty = highPain ? 2 : backChestAccessoryDay ? 12 : 10;
        score -= penalty;
        reasons.push(`-${penalty} bodyweight back drill held for no-load or pain fallback`);
      }
      if (backChestAccessoryDay && dumbbellRowPattern) {
        const penalty = highPain ? 1.25 : 5;
        score -= penalty;
        reasons.push(`-${penalty} dumbbell row de-prioritized vs machine/cable/scap pulls`);
      }
      if (backChestAccessoryDay && suspensionPattern && !highPain) {
        const penalty = 1.5;
        score -= penalty;
        reasons.push(`-${penalty} suspension pull reserved as loaded fallback`);
      }
      if (backChestAccessoryDay && mainAlreadyHasRowOrVerticalPull && rowLikeAccessory) {
        const penalty = highPain ? 0.75 : context.phaseStage === "activation" ? 10 : 4;
        score -= penalty;
        reasons.push(`-${penalty} Back + Chest accessory avoids duplicating row/lat main patterns`);
      }
      if (
        backChestAccessoryDay &&
        context.phaseStage === "activation" &&
        (exercise.id === "machine-seated-row" || exercise.id === "machine-lat-pulldown")
      ) {
        const penalty = 6;
        score -= penalty;
        reasons.push(`-${penalty} Back + Chest control phase reserves machine rows/pulldowns for main slots`);
      }
    } else if (bodyweightFallback) {
      score += 1.25;
      reasons.push("+1.25 no-load back fallback bonus");
    }
  }

  if (section === "main" && auditMeta?.slotLane === "squat") {
    if (exercise.id === "machine-leg-press" && context.capabilityMode === "hasLoad") {
      const bonus = context.phaseStage === "growth" ? 4.5 : 4;
      score += bonus;
      reasons.push(`+${bonus} machine leg-press lower-body primer bias`);
    }
    if (exercise.id === "goblet-squat" && context.capabilityMode === "hasLoad") {
      const penalty = context.phaseStage === "growth" ? 2 : 2.5;
      score -= penalty;
      reasons.push(`-${penalty} goblet squat de-prioritized when loaded options are available`);
    }
    if (
      context.capabilityMode === "hasLoad" &&
      (exercise.id === "cossack-squat" || exercise.id === "shrimp-squat" || patterns.has("mobility"))
    ) {
      const penalty = context.phaseStage === "activation" ? 1 : 2.5;
      score -= penalty;
      reasons.push(`-${penalty} gym squat slot avoids mobility-first main`);
    }
  }

  if (section === "main" && auditMeta?.slotLane === "hinge") {
    if (exercise.id === "back-extension-hold") {
      const delta = context.phaseStage === "growth" ? 0.5 : 1.25;
      score += delta;
      reasons.push(`+${delta} back-extension hold hinge-control bias`);
    }
    if (exercise.id === "bodyweight-good-morning") {
      const penalty = context.phaseStage === "growth" ? 1 : 2;
      score -= penalty;
      reasons.push(`-${penalty} good-morning de-prioritized for hinge safety`);
    }
    if (context.capabilityMode === "hasLoad" && exercise.id === "db-rdl") {
      const bonus = context.phaseStage === "activation" ? 1 : 2;
      score += bonus;
      reasons.push(`+${bonus} loaded hinge progression bias`);
    }
  }

  const priorDayHeavyPatterns = new Set(auditMeta?.priorDayHeavyPatterns ?? []);
  if (section === "main" && auditMeta?.slotLane && priorDayHeavyPatterns.size) {
    const currentMainPattern = mainLaneToPrimaryPattern(auditMeta.slotLane);
    const stackedSamePattern = priorDayHeavyPatterns.has(currentMainPattern);
    if (stackedSamePattern) {
      const heavyMain =
        exercise.loadType === "weighted" ||
        exercise.movementIntensity === "load" ||
        role === "mainStrength";
      const stackedPenalty = heavyMain ? 0.35 : 0.15;
      score -= stackedPenalty;
      reasons.push(
        `-${stackedPenalty.toFixed(1)} consecutive-day ${currentMainPattern} fatigue stacking penalty`
      );
    }

    const priorPushHeavy =
      priorDayHeavyPatterns.has("horizontalPush") ||
      priorDayHeavyPatterns.has("verticalPush");
    const currentPushPattern =
      currentMainPattern === "horizontalPush" || currentMainPattern === "verticalPush";
    if (
      (priorPushHeavy && currentMainPattern === "pull") ||
      (priorDayHeavyPatterns.has("pull") && currentPushPattern)
    ) {
      score += 0.2;
      reasons.push("+0.2 push/pull alternation bonus");
    }

    if (
      (priorDayHeavyPatterns.has("squat") && currentMainPattern === "hinge") ||
      (priorDayHeavyPatterns.has("hinge") && currentMainPattern === "squat")
    ) {
      score += 0.2;
      reasons.push("+0.2 squat/hinge alternation bonus");
    }
  }

  if (section === "accessory" && priorDayHeavyPatterns.size) {
    if (priorDayHeavyPatterns.has("hinge")) {
      const recoveryAccessoryMatch =
        role === "core" ||
        role === "postureCorrective" ||
        patterns.has("anti_rotation") ||
        patterns.has("core") ||
        tags.has("anti_rotation") ||
        tags.has("scap") ||
        tags.has("posture");
      if (recoveryAccessoryMatch) {
        score += 0.2;
        reasons.push("+0.2 hinge-recovery accessory bias (core/scap/anti-rotation)");
      }
    }

    const priorPushHeavy =
      priorDayHeavyPatterns.has("horizontalPush") ||
      priorDayHeavyPatterns.has("verticalPush");
    if (priorPushHeavy) {
      const pullPostureAccessoryMatch =
        patterns.has("pull") ||
        tags.has("scap") ||
        tags.has("posture") ||
        tags.has("upper_back") ||
        role === "postureCorrective";
      if (pullPostureAccessoryMatch) {
        score += 0.2;
        reasons.push("+0.2 post-push accessory bias (pull/posture/scap)");
      }
    }
  }

  if (context.intentProfile.needs.needsScapularControl) {
    if (tags.has("scap") || tags.has("upper_back") || role === "postureCorrective") {
      score += 1.5;
      reasons.push("+1.5 scapular-control need match");
    }
  }
  if (context.intentProfile.needs.needsHipHingeRepattern) {
    if (patterns.has("hinge") && role === "mainControl") {
      score += 1.5;
      reasons.push("+1.5 hinge-repattern need match");
    }
  }
  if (context.intentProfile.needs.needsCoreAntiRotation) {
    if (patterns.has("anti_rotation") || tags.has("anti_rotation")) {
      score += 1.5;
      reasons.push("+1.5 anti-rotation need match");
    }
  }
  if (context.intentProfile.needs.needsThoracicExtension) {
    if (tags.has("t_spine") || tags.has("thoracic") || tags.has("posture")) {
      score += 1.2;
      reasons.push("+1.2 thoracic/posture need match");
    }
  }

  if (context.phaseStage === "activation") {
    if (role === "mainControl" || role === "postureCorrective" || role === "core") {
      const controlBias = gymLoadReadyMain ? 0.75 : 2;
      score += controlBias;
      reasons.push(`+${controlBias} activation control bias`);
    }
    if (
      tags.has("scap") ||
      tags.has("core") ||
      tags.has("tva") ||
      tags.has("stability") ||
      tags.has("control")
    ) {
      const stabilityBias = gymLoadReadyMain ? 0.35 : 1;
      score += stabilityBias;
      reasons.push(`+${stabilityBias} activation stability/control emphasis`);
    }
    if (
      role === "mainStrength" &&
      (exercise.loadType === "weighted" || exercise.movementIntensity === "load")
    ) {
      const activationLoadPenalty =
        context.capabilityMode === "hasLoad"
          ? context.experienceLevel === "beginner" || context.painSeverity === "high"
            ? 4
            : 1
          : context.experienceLevel === "beginner"
          ? 4
          : 3;
      score -= activationLoadPenalty;
      reasons.push(`-${activationLoadPenalty} activation load penalty`);
      if (exercise.difficultyTier === "hard" || tags.has("advanced") || tags.has("strength")) {
        score -= 1;
        reasons.push("-1 activation max-strength style de-priority");
      }
    }

    const beginnerLimitedCapabilityActivation =
      section === "main" &&
      context.experienceLevel === "beginner" &&
      (context.capabilityMode === "bandOnly" || context.capabilityMode === "noneOnly");
    if (beginnerLimitedCapabilityActivation && patterns.has("squat")) {
      const highMobilityOrLateralMain =
        exercise.id === "cossack-squat" ||
        patterns.has("mobility") ||
        patterns.has("single_leg") ||
        tags.has("advanced");
      if (highMobilityOrLateralMain) {
        score -= 1.75;
        reasons.push("-1.75 beginner activation squat simplicity penalty");
      }

      const foundationalSimpleSquat =
        !patterns.has("single_leg") &&
        !patterns.has("mobility") &&
        !tags.has("advanced");
      if (foundationalSimpleSquat) {
        score += 0.8;
        reasons.push("+0.8 beginner activation foundational squat bonus");
      }
    }
  } else if (context.phaseStage === "skill") {
    if (role === "mainStrength") {
      score += 1;
      reasons.push("+1 skill strength exposure");
    } else if (role === "mainControl") {
      score += 0.5;
      reasons.push("+0.5 skill control exposure");
    }
    if (
      patterns.has("single_leg") ||
      patterns.has("mobility") ||
      tags.has("balance") ||
      tags.has("unilateral")
    ) {
      const delta = context.painSeverity === "high" ? 0.5 : 1;
      score += delta;
      reasons.push(`+${delta} skill unilateral/coordination exposure`);
    }
  } else {
    if (role === "mainStrength") {
      score += 2;
      reasons.push("+2 growth strength exposure");
    }
    if (
      section === "main" &&
      context.capabilityMode === "hasLoad" &&
      exercise.loadType === "weighted" &&
      (patterns.has("push") ||
        patterns.has("pull") ||
        patterns.has("squat") ||
        patterns.has("hinge"))
    ) {
      score += 1.2;
      reasons.push("+1.2 growth loaded compound bias");
    }
    if (section === "main" && role === "accessoryIsolation") {
      score -= 0.8;
      reasons.push("-0.8 growth de-priority for isolation as MAIN");
    }
  }

  if (section === "main" && auditMeta) {
    const dayTitle = auditMeta.dayTitle.toLowerCase();
    const intermediateBackChestExpansionPushSlot = isBackChestIntermediateExpansionPushSlot({
      auditMeta,
      context,
    });
    const backChestFlyAnchorSlot =
      dayTitle.includes("back + chest") && auditMeta.slotKind === "mainPushFly";
    const allowBackChestFlyMainSlot =
      intermediateBackChestExpansionPushSlot || backChestFlyAnchorSlot;
    if (dayTitle.includes("back + chest") && isIsolationExercise(exercise)) {
      if (
        allowBackChestFlyMainSlot &&
        isBackChestFlyPatternExercise(exercise)
      ) {
        score += 5;
        reasons.push("+5 Back + Chest fly-enabled slot allows fly variation");
      } else {
        score -= 12;
        reasons.push("-12 isolation blocked in Back + Chest main slots");
      }
    }
    if (dayTitle.includes("back + chest") && isShoulderIsolationExercise(exercise)) {
      score -= 8;
      reasons.push("-8 misplaced shoulder isolation main on Back + Chest");
    }
    if (dayTitle.includes("shoulders + arms") && isChestDominantHorizontalPush(exercise)) {
      score -= 12;
      reasons.push("-12 chest-dominant push blocked on Shoulders + Arms");
    }

    const isUpperDay = isUpperIntentDayTitle(auditMeta.dayTitle);
    if (isUpperDay && (patterns.has("hinge") || patterns.has("squat"))) {
      const postureActivationBeginner =
        context.intentProfile.primaryGoal === "posture" &&
        context.phaseStage === "activation" &&
        context.experienceLevel === "beginner" &&
        patterns.has("hinge") &&
        role === "mainControl";
      if (!postureActivationBeginner) {
        score -= 4;
        reasons.push("-4 upper-day lower-pattern main penalty");
      }
    }
  }

  if (context.intentProfile.avoidPatterns.includes("vertical_push_load")) {
    if (exerciseHasOverheadDemand(exercise) && exercise.loadType === "weighted") {
      score -= 3;
      reasons.push("-3 avoid vertical loaded pressing");
    }
  }
  if (context.intentProfile.avoidPatterns.includes("heavy_hinge")) {
    if (isHingeLoadPatternExercise(exercise) || isDeadliftLikeExercise(exercise)) {
      score -= 3;
      reasons.push("-3 avoid heavy hinge under pain/safety profile");
    }
  }
  if (
    context.intentProfile.avoidPatterns.includes("advanced_complexity") &&
    (exercise.difficultyTier === "hard" ||
      (exercise.loadType === "weighted" &&
        exercise.movementPattern.some((pattern) => normalizeTagToken(pattern) === "single_leg")))
  ) {
    score -= 3;
    reasons.push("-3 advanced complexity penalty in early phase");
  }

  if (auditMeta?.dayBudget?.mainMax && section === "main") {
    const { mainMax } = auditMeta.dayBudget;
    if (
      typeof mainMax.hinge === "number" &&
      mainMax.hinge <= 0 &&
      patterns.has("hinge")
    ) {
      score -= 4;
      reasons.push("-4 day budget: hinge main not allowed");
    }
    if (
      typeof mainMax.squat === "number" &&
      mainMax.squat <= 0 &&
      patterns.has("squat")
    ) {
      score -= 4;
      reasons.push("-4 day budget: squat main not allowed");
    }
  }

  const mainVarietyBonus = getMainVarietyScoreBonus({
    exercise,
    section,
    context,
    auditMeta,
  });
  score += mainVarietyBonus.score;
  reasons.push(...mainVarietyBonus.reasons);

  const crossGenerationVarietyBonus = getCrossGenerationVarietyScoreBonus({
    exercise,
    section,
    context,
    auditMeta,
  });
  score += crossGenerationVarietyBonus.score;
  reasons.push(...crossGenerationVarietyBonus.reasons);

  return { score, reasons };
};

const scoreExerciseForContextDetailed = (
  exercise: Exercise,
  section: ProgramRoutineItem["section"] | undefined,
  context: SelectionContext,
  available: Set<Equipment>,
  auditMeta?: SelectionAuditMeta,
  recentlyUsedIds?: Set<string>
): ScoreWithReasons => {
  let score = 0;
  const reasons: string[] = [];
  const recentExerciseIds = recentlyUsedIds ?? context.recentlyUsedExerciseIds;

  const preferredTagHits = exercise.tags.filter((tag) =>
    context.preferredTags.has(tag.toLowerCase())
  );
  if (preferredTagHits.length) {
    const delta = preferredTagHits.length * 3;
    score += delta;
    reasons.push(`+${delta} preferred tags (${preferredTagHits.join(", ")})`);
  }

  const preferredPatternHits = exercise.movementPattern.filter((pattern) =>
    context.preferredPatterns.has(pattern.toLowerCase())
  );
  if (preferredPatternHits.length) {
    const delta = preferredPatternHits.length * 2;
    score += delta;
    reasons.push(
      `+${delta} preferred patterns (${preferredPatternHits.join(", ")})`
    );
  }

  const deprioritizeTagHits = exercise.tags.filter((tag) =>
    context.deprioritizeTags.has(tag.toLowerCase())
  );
  if (deprioritizeTagHits.length) {
    const delta = deprioritizeTagHits.length * 2;
    score -= delta;
    reasons.push(`-${delta} deprioritized tags (${deprioritizeTagHits.join(", ")})`);
  }

  const deprioritizePatternHits = exercise.movementPattern.filter((pattern) =>
    context.deprioritizePatterns.has(pattern.toLowerCase())
  );
  if (deprioritizePatternHits.length) {
    const delta = deprioritizePatternHits.length * 2;
    score -= delta;
    reasons.push(
      `-${delta} deprioritized patterns (${deprioritizePatternHits.join(", ")})`
    );
  }

  if (
    context.goal === "Reduce pain" &&
    section === "main" &&
    exercise.tags.includes("advanced")
  ) {
    score -= 3;
    reasons.push("-3 advanced main for pain-reduction goal");
  }

  if (section === "main" && exercise.loadType === "weighted") {
    score += 2;
    reasons.push("+2 weighted main bias");
  }

  if (recentExerciseIds.has(exercise.id)) {
    if (section === "main") {
      score -= 4;
      reasons.push("-4 recently used main penalty");
    } else if (section === "accessory") {
      score -= 1.5;
      reasons.push("-1.5 recently used accessory penalty");
    }
  }

  if (section === "main" && available.has("dumbbells")) {
    if (exercise.equipment.includes("dumbbells")) {
      const delta = available.has("bench") ? 2 : 3;
      score += delta;
      reasons.push(`+${delta} dumbbell availability bias`);
    }
    if (
      available.has("bands") &&
      exercise.equipment.includes("bands") &&
      !exercise.equipment.includes("dumbbells")
    ) {
      score -= 1;
      reasons.push("-1 band-only exercise penalty when dumbbells are available");
    }
  }

  const isPushLane = (auditMeta?.slotLane ?? "").includes("push");
  if (
    section === "main" &&
    isPushLane &&
    context.phaseStage === "activation" &&
    isBackChestDayTitle(auditMeta?.dayTitle)
  ) {
    const conservativeActivationPushBias =
      context.experienceLevel === "beginner" || context.painSeverity === "high";
    if (conservativeActivationPushBias) {
      // Beginner/high-pain profiles can stay machine-stable in phase 1.
      if (exercise.id === "machine-chest-press") {
        score += 16;
        reasons.push("+16 activation main push machine chest preference (beginner/high-pain)");
      } else if (exercise.id === "dumbbell-bench-press") {
        score += 4;
        reasons.push("+4 activation main push dumbbell bench secondary preference");
      }
    } else if (
      context.experienceLevel !== "beginner" &&
      context.painSeverity === "low" &&
      exercise.id === "machine-chest-press"
    ) {
      score -= 1.25;
      reasons.push("-1.25 activation push de-prioritizes machine chest default for intermediate/advanced");
    }
  }

  const poseFocusBonus = getPoseFocusScoreBonus({
    exercise,
    section,
    context,
  });
  score += poseFocusBonus.bonus;
  reasons.push(...poseFocusBonus.reasons);

  if (contraindicationHitsPainArea(exercise.contraindications, context.painAreas)) {
    score -= 8;
    reasons.push("-8 contraindication overlap with pain areas");
  }

  const intentSlotBonus = getIntentSlotScoreBonus({
    exercise,
    section,
    context,
    available,
    auditMeta,
  });
  score += intentSlotBonus.score;
  reasons.push(...intentSlotBonus.reasons);

  const feedbackBonus = getFeedbackSelectionScoreBonus({
    exercise,
    section,
    context,
    available,
    auditMeta,
  });
  score += feedbackBonus.score;
  reasons.push(...feedbackBonus.reasons);

  return { score, reasons };
};

const scoreExerciseForContext = (
  exercise: Exercise,
  section: ProgramRoutineItem["section"] | undefined,
  context: SelectionContext,
  available: Set<Equipment>
) => {
  return scoreExerciseForContextDetailed(exercise, section, context, available).score;
};

const getProgramVariationBandForRankedEntries = <T extends { score: number }>(
  rankedEntries: T[],
  config: ProgramVariationConfig
) => {
  if (!rankedEntries.length) return [] as T[];
  const topScore = rankedEntries[0]!.score;
  const scoreAllowance = Math.max(
    Math.max(0, config.topBandMinScoreAllowance),
    Math.abs(topScore) * Math.max(0, config.topBandPercent)
  );
  const inBand = rankedEntries
    .slice(0, Math.max(1, config.topBandMaxCandidates))
    .filter((entry) => topScore - entry.score <= scoreAllowance);
  if (inBand.length >= Math.max(1, config.topBandMinCandidates)) {
    return inBand;
  }
  return rankedEntries.slice(0, 1);
};

const pickFromProgramVariationBand = <T>(
  entries: T[],
  options?: {
    rng?: RandomFn;
    deterministicSeed?: string;
  }
) => {
  if (!entries.length) return null;
  if (entries.length === 1) return entries[0] ?? null;
  if (options?.deterministicSeed) {
    const seededUnit = stableHashUnit(options.deterministicSeed);
    const index = Math.floor(seededUnit * entries.length);
    return entries[Math.max(0, Math.min(entries.length - 1, index))] ?? null;
  }
  const rng = options?.rng;
  if (!rng) return entries[0] ?? null;
  const index = Math.floor(rng() * entries.length);
  return entries[Math.max(0, Math.min(entries.length - 1, index))] ?? null;
};

const resolveVariationAuditSlotIndex = (auditMeta?: SelectionAuditMeta) => {
  const explicitSlotIndex = auditMeta?.slotIndex;
  if (typeof explicitSlotIndex === "number" && Number.isFinite(explicitSlotIndex)) {
    return Math.max(0, Math.floor(explicitSlotIndex));
  }
  const slotId = String(auditMeta?.slotId ?? "");
  const match = slotId.match(/(\d+)(?!.*\d)/);
  if (!match) return 0;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed) - 1);
};

const resolveVariationAuditPhaseIndex = (
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) => {
  const explicitPhaseIndex = auditMeta?.phaseIndex;
  if (typeof explicitPhaseIndex === "number" && Number.isFinite(explicitPhaseIndex)) {
    return clampPhaseIndexToSupportedRange(explicitPhaseIndex);
  }
  return phaseIndexFromStage(context.phaseStage);
};

const buildVariationBandDeterministicSeed = (params: {
  context: SelectionContext;
  variationState: ProgramVariationState;
  section?: ProgramRoutineItem["section"];
  auditMeta?: SelectionAuditMeta;
  topBandSignature: string;
}) => {
  const { context, variationState, section, auditMeta, topBandSignature } = params;
  const settingsToken = String(
    variationState.options.settingsHash ?? variationState.settingsKey
  ).trim();
  const variationIndex = resolveProgramVariationIndex(variationState.options);
  const phaseIndex = resolveVariationAuditPhaseIndex(context, auditMeta);
  const slotIndex = resolveVariationAuditSlotIndex(auditMeta);
  const slotId = normalizeSlotToken(auditMeta?.slotId ?? "unknown-slot");
  const slotKind = normalizeSlotToken(auditMeta?.slotKind ?? "unknown-slot-kind");
  return [
    "variation-top-band",
    `settings:${settingsToken || variationState.settingsKey}`,
    `variationIndex:${variationIndex}`,
    `phaseIndex:${phaseIndex}`,
    `slotIndex:${slotIndex}`,
    `slotId:${slotId}`,
    `slotKind:${slotKind}`,
    `section:${section ?? "unknown"}`,
    variationState.seedKey,
    topBandSignature,
  ].join("|");
};

const pickFirstEligibleId = (
  candidates: string[],
  available: Set<Equipment>,
  context: SelectionContext,
  section?: ProgramRoutineItem["section"],
  auditMeta?: SelectionAuditMeta
) => {
  const eligible = candidates
    .map((id, index) => ({ id, index, exercise: exerciseById(id) }))
    .filter(
      (entry): entry is { id: string; index: number; exercise: Exercise } =>
        Boolean(entry.exercise)
    )
    .filter(
      (entry) =>
        isExerciseEligibleForProgramContext({
          exercise: entry.exercise,
          available,
          section,
          context,
          dayTitle: auditMeta?.dayTitle,
        })
    )
    .filter(
      (entry) =>
        !isBackChestMainScapularPullDisallowedForSlot({
          exercise: entry.exercise,
          section,
          auditMeta,
        })
    )
    .filter((entry) =>
      isRoleLegalForSlot({
        exercise: entry.exercise,
        section,
        dayTitle: auditMeta?.dayTitle,
        slotKind: auditMeta?.slotKind,
        mainSlotLane: auditMeta?.slotLane,
        accessoryLane: auditMeta?.slotLane as AccessoryLane | undefined,
        available,
        context,
      })
    )
    .map((entry) => {
      const detail = scoreExerciseForContextDetailed(
        entry.exercise,
        section,
        context,
        available,
        auditMeta
      );
      const capabilityBonus = getCapabilitySlotBonus({
        exercise: entry.exercise,
        section,
        auditMeta,
      });
      const baseScore = detail.score + capabilityBonus.bonus;
      const tieBreakerPenalty = entry.index * 0.01;
      const score = baseScore - tieBreakerPenalty;
      const reasons =
        tieBreakerPenalty > 0
          ? [
              ...detail.reasons,
              ...capabilityBonus.reasons,
              `-${tieBreakerPenalty.toFixed(2)} candidate order tie-break`,
            ]
          : [...detail.reasons, ...capabilityBonus.reasons];
      return { ...entry, baseScore, score, reasons };
    })
    .sort((left, right) => right.score - left.score);

  const safeEligible =
    section === "main"
      ? eligible.filter(
          (entry) =>
            !shouldAvoidFeedbackRiskCandidate({
              exercise: entry.exercise,
              section,
              context,
              available,
              auditMeta,
            })
        )
      : eligible;

  const riskyEligible =
    section === "main"
      ? eligible.filter((entry) =>
          shouldAvoidFeedbackRiskCandidate({
            exercise: entry.exercise,
            section,
            context,
            available,
            auditMeta,
          })
        )
      : [];

  const feedbackFallbackEligible =
    section === "main" && !safeEligible.length && riskyEligible.length
      ? exercises
          .filter((exercise) => !eligible.some((entry) => entry.id === exercise.id))
          .filter((exercise) =>
            isExerciseEligibleForProgramContext({
              exercise,
              available,
              section,
              context,
              dayTitle: auditMeta?.dayTitle,
            })
          )
          .filter((exercise) =>
            !isBackChestMainScapularPullDisallowedForSlot({
              exercise,
              section,
              auditMeta,
            })
          )
          .filter((exercise) =>
            isRoleLegalForSlot({
              exercise,
              section,
              dayTitle: auditMeta?.dayTitle,
              slotKind: auditMeta?.slotKind,
              mainSlotLane: auditMeta?.slotLane,
              accessoryLane: auditMeta?.slotLane as AccessoryLane | undefined,
              available,
              context,
            })
          )
          .filter((exercise) =>
            auditMeta?.slotLane
              ? matchesMainLanePattern(exercise, auditMeta.slotLane)
              : true
          )
          .filter((exercise) =>
            riskyEligible.some((entry) =>
              hasPatternIntersection(
                new Set(
                  entry.exercise.movementPattern.map((pattern) =>
                    normalizeTagToken(pattern)
                  )
                ),
                new Set(
                  exercise.movementPattern.map((pattern) =>
                    normalizeTagToken(pattern)
                  )
                )
              )
            )
          )
          .filter(
            (exercise) =>
              !shouldAvoidFeedbackRiskCandidate({
                exercise,
                section,
                context,
                available,
                auditMeta,
              })
          )
          .map((exercise, index) => {
            const detail = scoreExerciseForContextDetailed(
              exercise,
              section,
              context,
              available,
              auditMeta
            );
            const capabilityBonus = getCapabilitySlotBonus({
              exercise,
              section,
              auditMeta,
            });
            const baseScore = detail.score + capabilityBonus.bonus;
            const tieBreakerPenalty = (eligible.length + index) * 0.01;
            const score = baseScore - tieBreakerPenalty;
            const reasons =
              tieBreakerPenalty > 0
                ? [
                    ...detail.reasons,
                    ...capabilityBonus.reasons,
                    `-${tieBreakerPenalty.toFixed(2)} candidate order tie-break`,
                  ]
                : [...detail.reasons, ...capabilityBonus.reasons];
            return {
              id: exercise.id,
              index: eligible.length + index,
              exercise,
              baseScore,
              score,
              reasons,
            };
          })
          .sort((left, right) => right.score - left.score)
      : [];

  const choicePool = safeEligible.length
    ? safeEligible
    : feedbackFallbackEligible.length
    ? feedbackFallbackEligible
    : eligible;
  const rankedChoicePool = [...choicePool].sort((left, right) => {
    return right.score - left.score;
  });

  const canCaptureAudit =
    process.env.NODE_ENV !== "production" &&
    section === "main" &&
    Boolean(auditMeta) &&
    (DEBUG_AUDIT_SELECTION || Boolean(auditMeta?.selectionAuditHook));

  if (!rankedChoicePool.length) return candidates[candidates.length - 1];

  const maybeVariationBandPick = () => {
    const varietyState = context.variationState;
    if (!varietyState?.enabled) return null;
    const topBand = getProgramVariationBandForRankedEntries(
      rankedChoicePool,
      varietyState.config
    );
    const topBandSignature = topBand
      .map((entry) => `${entry.id}:${entry.score.toFixed(2)}`)
      .join("|");
    const variationSeedToken = buildVariationBandDeterministicSeed({
      context,
      variationState: varietyState,
      section,
      auditMeta,
      topBandSignature,
    });
    return pickFromProgramVariationBand(topBand, {
      rng: auditMeta?.selectionRng,
      deterministicSeed: variationSeedToken,
    });
  };

  const maybeSeededTiePick = () => {
    if (section !== "main") return null;
    const seededRng = auditMeta?.selectionRng;
    if (!seededRng) return null;
    const topBaseScore = rankedChoicePool[0]?.baseScore;
    if (typeof topBaseScore !== "number") return null;
    const tied = rankedChoicePool.filter(
      (entry) => Math.abs(entry.baseScore - topBaseScore) < 1e-9
    );
    if (tied.length <= 1) return null;
    const selectedIndex = Math.floor(seededRng() * tied.length);
    return tied[Math.max(0, Math.min(tied.length - 1, selectedIndex))] ?? null;
  };

  const chosenEntry =
    maybeVariationBandPick() ?? maybeSeededTiePick() ?? rankedChoicePool[0];

  if (canCaptureAudit && auditMeta) {
    const top = eligible.slice(0, 5).map((entry) => ({
      exerciseId: entry.id,
      name: entry.exercise.name,
      score: Number(entry.score.toFixed(2)),
      reasons: entry.reasons,
    }));
    const chosen = {
      exerciseId: chosenEntry.id,
      name: chosenEntry.exercise.name,
      score: Number(chosenEntry.score.toFixed(2)),
      reasons: chosenEntry.reasons,
    };
    const payload: ProgramSelectionAuditEntry = {
      slotId: auditMeta.slotId,
      dayTitle: auditMeta.dayTitle,
      slotKind: auditMeta.slotKind,
      capabilityMode: auditMeta.capabilityMode,
      chosen,
      top,
    };
    recordProgramSelectionAuditEntry({
      entry: payload,
      persistToBuffer: DEBUG_AUDIT_SELECTION,
      selectionAuditHook: auditMeta.selectionAuditHook,
    });
  }

  return chosenEntry.id;
};

const chooseWarmupId = (
  focus: "upper" | "lower" | "core",
  available: Set<Equipment>,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    focus === "upper"
      ? ["wall-slides", "thoracic-rotation", "cat-cow"]
      : focus === "lower"
      ? ["ankle-mobility", "cat-cow", "thoracic-rotation"]
      : ["cat-cow", "thoracic-rotation", "wall-angel-hold"],
    available,
    context,
    "warmup"
  );

const chooseCooldownId = (
  focus: "upper" | "lower" | "core",
  available: Set<Equipment>,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    focus === "upper"
      ? ["doorway-pec-stretch", "thread-the-needle", "banded-lat-stretch", "chin-tucks"]
      : focus === "lower"
      ? ["hamstring-stretch", "hip-flexor-stretch", "breathing-90-90"]
      : ["breathing-90-90", "thread-the-needle", "hip-flexor-stretch"],
    available,
    context,
    "cooldown"
  );

const chooseActivationId = (
  lane: "push" | "pull" | "lower" | "core",
  available: Set<Equipment>,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    lane === "push"
      ? ["scapular-pushups", "band-pull-aparts", "wall-angel-hold", "dead-bug"]
      : lane === "pull"
      ? ["band-pull-aparts", "prone-ytw", "wall-angel-hold", "dead-bug"]
      : lane === "lower"
      ? ["hip-hinge-drill", "glute-bridges", "dead-bug", "bird-dog"]
      : ["dead-bug", "bird-dog", "wall-angel-hold", "glute-bridges"],
    available,
    context,
    "activation"
  );

const getPushCompoundCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  const beginnerTrack = context.experienceLevel === "beginner";
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      return [
        "machine-chest-press",
        "dumbbell-bench-press",
        "dumbbell-incline-press",
        "barbell-bench-press-paused",
        "dumbbell-floor-press",
        "barbell-floor-press",
        "band-chest-press",
        "incline-pushup",
      ];
    }
    if (phaseIndex >= 2) {
      if (!beginnerTrack) {
        return [
          "dumbbell-bench-press",
          "dumbbell-incline-press",
          "machine-chest-press",
          "barbell-bench-press-paused",
          "dumbbell-floor-press",
          "band-chest-press",
          "incline-pushup",
          "pushup",
        ];
      }
      return [
        "machine-chest-press",
        "dumbbell-bench-press",
        "dumbbell-incline-press",
        "barbell-bench-press-paused",
        "dumbbell-floor-press",
        "band-chest-press",
        "incline-pushup",
        "pushup",
      ];
    }
    if (!beginnerTrack) {
      return [
        "dumbbell-bench-press",
        "dumbbell-incline-press",
        "machine-chest-press",
        "dumbbell-floor-press",
        "band-chest-press",
        "incline-pushup",
        "pushup",
      ];
    }
    return [
      "machine-chest-press",
      "dumbbell-bench-press",
      "dumbbell-incline-press",
      "dumbbell-floor-press",
      "band-chest-press",
      "incline-pushup",
      "pushup",
    ];
  }

  if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
    return [
      "dumbbell-bench-press",
      "dumbbell-floor-press",
      "band-chest-press",
      "band-overhead-press",
      "pushup",
      "incline-pushup",
    ];
  }
  if (phaseIndex >= 2) {
    return [
      "dumbbell-floor-press",
      "dumbbell-bench-press",
      "band-overhead-press",
      "band-chest-press",
      "pushup",
      "incline-pushup",
    ];
  }
  return [
    "dumbbell-floor-press",
    "dumbbell-bench-press",
    "band-chest-press",
    "pushup",
    "incline-pushup",
  ];
};

const getVerticalPushCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      return [
        "machine-shoulder-press",
        "dumbbell-shoulder-press",
        "dumbbell-arnold-press",
        "barbell-strict-press",
        "barbell-push-press",
        "band-overhead-press",
        "pike-pushup",
        "scapular-pushups",
      ];
    }
    if (phaseIndex >= 2) {
      return [
        "machine-shoulder-press",
        "dumbbell-shoulder-press",
        "band-overhead-press",
        "dumbbell-arnold-press",
        "pike-pushup",
        "scapular-pushups",
        "incline-pushup",
      ];
    }
    return [
      "dumbbell-shoulder-press",
      "band-overhead-press",
      "machine-shoulder-press",
      "pike-pushup",
      "scapular-pushups",
      "incline-pushup",
    ];
  }

  if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
    return [
      "dumbbell-shoulder-press",
      "dumbbell-arnold-press",
      "band-overhead-press",
      "pike-pushup",
      "scapular-pushups",
    ];
  }
  return [
    "dumbbell-shoulder-press",
    "band-overhead-press",
    "pike-pushup",
    "scapular-pushups",
    "incline-pushup",
  ];
};

const getPullCompoundCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  const beginnerTrack = context.experienceLevel === "beginner";
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      if (!beginnerTrack) {
        return [
          "dumbbell-chest-supported-row",
          "cable-seated-row",
          "barbell-bent-over-row",
          "dumbbell-rows",
          "machine-seated-row",
          "machine-lat-pulldown",
          "cable-lat-pulldown",
          "barbell-landmine-pulldown",
          "band-lat-pulldown",
          "face-pull",
        ];
      }
      return [
        "machine-lat-pulldown",
        "machine-seated-row",
        "dumbbell-chest-supported-row",
        "barbell-bent-over-row",
        "cable-seated-row",
        "cable-lat-pulldown",
        "dumbbell-rows",
        "barbell-landmine-pulldown",
        "band-lat-pulldown",
        "face-pull",
      ];
    }
    if (phaseIndex >= 2) {
      if (!beginnerTrack) {
        return [
          "dumbbell-chest-supported-row",
          "dumbbell-rows",
          "cable-seated-row",
          "machine-seated-row",
          "machine-lat-pulldown",
          "band-lat-pulldown",
          "band-row",
          "split-stance-row",
          "face-pull",
          "prone-swimmer",
        ];
      }
      return [
        "machine-seated-row",
        "dumbbell-rows",
        "machine-lat-pulldown",
        "band-lat-pulldown",
        "band-row",
        "split-stance-row",
        "face-pull",
        "prone-swimmer",
      ];
    }
    if (!beginnerTrack) {
      return [
        "dumbbell-chest-supported-row",
        "dumbbell-rows",
        "cable-seated-row",
        "machine-seated-row",
        "band-row",
        "split-stance-row",
        "face-pull",
        "supine-elbow-drive-row",
        "prone-elbow-row",
        "back-widow",
      ];
    }
    return [
      "machine-seated-row",
      "split-stance-row",
      "band-row",
      "face-pull",
      "supine-elbow-drive-row",
      "prone-elbow-row",
      "back-widow",
    ];
  }

  if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
    return [
      "dumbbell-rows",
      "split-stance-row",
      "band-lat-pulldown",
      "band-row",
      "face-pull",
      "reverse-snow-angel",
    ];
  }
  return [
    "dumbbell-rows",
    "band-lat-pulldown",
    "band-row",
    "split-stance-row",
    "back-widow",
    "face-pull",
    "reverse-snow-angel",
    "prone-swimmer",
  ];
};

const getBackChestVerticalPullCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  const beginnerTrack = context.experienceLevel === "beginner";
  const verticalIntentFallbackIds = get3DayBackChestVerticalFallbackIds().filter(
    (id) => id !== "supine-elbow-drive-row" && id !== "prone-elbow-row"
  );
  const withVerticalFallbacks = (ids: string[]) =>
    Array.from(new Set([...ids, ...verticalIntentFallbackIds]));
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      if (!beginnerTrack) {
        return withVerticalFallbacks([
          "weighted-pullup",
          "cable-lat-pulldown",
          "neutral-grip-pullup",
          "chinup-strict",
          "machine-lat-pulldown",
          "barbell-landmine-pulldown",
          "machine-assisted-pullup",
          "band-assisted-pullup",
          "chest-to-bar-pullup",
          "band-lat-pulldown",
          "dumbbell-pullover",
        ]);
      }
      return withVerticalFallbacks([
        "weighted-pullup",
        "machine-lat-pulldown",
        "cable-lat-pulldown",
        "barbell-landmine-pulldown",
        "machine-assisted-pullup",
        "band-assisted-pullup",
        "neutral-grip-pullup",
        "chinup-strict",
        "chest-to-bar-pullup",
        "band-lat-pulldown",
        "dumbbell-pullover",
      ]);
    }
    if (phaseIndex >= 2) {
      if (!beginnerTrack) {
        return withVerticalFallbacks([
          "cable-lat-pulldown",
          "machine-lat-pulldown",
          "neutral-grip-pullup",
          "chinup-strict",
          "machine-assisted-pullup",
          "band-assisted-pullup",
          "weighted-pullup",
          "band-lat-pulldown",
          "dumbbell-pullover",
          "kneeling-prayer-lat-pulldown",
        ]);
      }
      return withVerticalFallbacks([
        "machine-lat-pulldown",
        "cable-lat-pulldown",
        "machine-assisted-pullup",
        "band-assisted-pullup",
        "neutral-grip-pullup",
        "chinup-strict",
        "weighted-pullup",
        "band-lat-pulldown",
        "dumbbell-pullover",
        "kneeling-prayer-lat-pulldown",
      ]);
    }
    if (!beginnerTrack) {
      return withVerticalFallbacks([
        "cable-lat-pulldown",
        "machine-lat-pulldown",
        "neutral-grip-pullup",
        "chinup-strict",
        "machine-assisted-pullup",
        "band-assisted-pullup",
        "band-lat-pulldown",
        "kneeling-prayer-lat-pulldown",
        "supine-lat-pulldown-isometric",
        "prone-lat-sweep",
        "dumbbell-pullover",
      ]);
    }
    return withVerticalFallbacks([
      "machine-lat-pulldown",
      "band-lat-pulldown",
      "machine-assisted-pullup",
      "band-assisted-pullup",
      "scap-pullup",
      "kneeling-prayer-lat-pulldown",
      "supine-lat-pulldown-isometric",
      "prone-lat-sweep",
    ]);
  }

  if (context.capabilityMode === "bandOnly") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      return withVerticalFallbacks([
        "weighted-pullup",
        "band-lat-pulldown",
        "band-assisted-pullup",
        "neutral-grip-pullup",
        "chinup-strict",
        "chest-to-bar-pullup",
        "scap-pullup",
        "kneeling-prayer-lat-pulldown",
        "supine-lat-pulldown-isometric",
      ]);
    }
    return withVerticalFallbacks([
      "band-lat-pulldown",
      "band-assisted-pullup",
      "scap-pullup",
      "kneeling-prayer-lat-pulldown",
      "supine-lat-pulldown-isometric",
      "prone-lat-sweep",
    ]);
  }

  if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
    return withVerticalFallbacks([
      "weighted-pullup",
      "kneeling-prayer-lat-pulldown",
      "supine-lat-pulldown-isometric",
      "prone-lat-sweep",
      "scap-pullup",
      "neutral-grip-pullup",
      "chinup-strict",
      "chest-to-bar-pullup",
    ]);
  }
  return withVerticalFallbacks([
    "kneeling-prayer-lat-pulldown",
    "supine-lat-pulldown-isometric",
    "prone-lat-sweep",
    "scap-pullup",
    "band-assisted-pullup",
  ]);
};

const getBackChestSupportPullCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  const merged = [
    ...getBackChestVerticalPullCandidateIds(phaseIndex, experience, context),
    ...getPullCompoundCandidateIds(phaseIndex, experience, context),
  ];
  return Array.from(new Set(merged)).filter((id) => {
    const exercise = exerciseById(id);
    return Boolean(exercise && isBackChestCompoundPullMainCandidate(exercise));
  });
};

const getSquatCompoundCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      return [
        "machine-hack-squat",
        "machine-leg-press",
        "dumbbell-step-up-loaded",
        "barbell-back-squat",
        "split-squat",
        "heels-elevated-squat",
        "bodyweight-squat",
      ];
    }
    if (phaseIndex >= 2) {
      return [
        "machine-leg-press",
        "split-squat",
        "dumbbell-step-up-loaded",
        "machine-hack-squat",
        "heels-elevated-squat",
        "bodyweight-squat",
        "band-front-squat",
      ];
    }
    return [
      "machine-leg-press",
      "split-squat",
      "heels-elevated-squat",
      "bodyweight-squat",
      "band-front-squat",
      "cossack-squat",
    ];
  }

  if (phaseIndex >= 2 && experience.allowAdvancedCompounds) {
    return [
      "split-squat",
      "bodyweight-squat",
      "band-front-squat",
      "heels-elevated-squat",
      "cossack-squat",
      "shrimp-squat",
    ];
  }
  return [
    "split-squat",
    "bodyweight-squat",
    "band-front-squat",
    "heels-elevated-squat",
    "cossack-squat",
  ];
};

const getHingeCompoundCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3 && experience.allowAdvancedCompounds) {
      return [
        "machine-seated-hamstring-curl",
        "dumbbell-sumo-rdl",
        "barbell-romanian-deadlift",
        "barbell-hip-thrust",
        "machine-glute-drive",
        "db-rdl",
        "back-extension",
        "single-leg-rdl",
      ];
    }
    if (phaseIndex >= 2) {
      return [
        "db-rdl",
        "back-extension",
        "back-extension-hold",
        "single-leg-rdl",
        "machine-seated-hamstring-curl",
        "machine-glute-drive",
        "barbell-hip-thrust",
        "band-rdl",
      ];
    }
    return [
      "back-extension-hold",
      "db-rdl",
      "back-extension",
      "single-leg-hip-thrust",
      "single-leg-glute-bridge-hold",
      "band-rdl",
      "single-leg-rdl",
    ];
  }

  if (phaseIndex >= 2 && experience.allowAdvancedCompounds) {
    return [
      "back-extension-hold",
      "back-extension",
      "single-leg-hip-thrust",
      "single-leg-glute-bridge-hold",
      "single-leg-rdl",
      "band-rdl",
      "db-rdl",
    ];
  }
  return [
    "back-extension-hold",
    "back-extension",
    "single-leg-glute-bridge-hold",
    "single-leg-hip-thrust",
    "single-leg-rdl",
    "band-rdl",
    "db-rdl",
  ];
};

const choosePushCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getPushCompoundCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseVerticalPushId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getVerticalPushCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const choosePullCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getPullCompoundCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseBackChestVerticalPullId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getBackChestVerticalPullCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseBackChestSupportPullId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getBackChestSupportPullCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const getBackChestFlyMainCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => {
  const knownFlyIds = [
    "machine-pec-deck-press",
    "dumbbell-chest-fly",
    "suspension-chest-fly",
  ];
  const discoveredFlyIds = exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => isBackChestFlyPatternExercise(exercise))
    .filter((exercise) => hasHorizontalPushSignature(exercise))
    .map((exercise) => exercise.id);
  const flyFirst = Array.from(new Set([...knownFlyIds, ...discoveredFlyIds]));
  const safePressFallback = getPushCompoundCandidateIds(phaseIndex, experience, context);
  return Array.from(new Set([...flyFirst, ...safePressFallback]));
};

const chooseBackChestFlyMainId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) => {
  const flyAndFallbackCandidates = getBackChestFlyMainCandidateIds(
    phaseIndex,
    experience,
    context
  );
  const strictFlyCandidates = flyAndFallbackCandidates.filter((id) => {
    const exercise = exerciseById(id);
    if (!exercise) return false;
    if (!isBackChestFlyPatternExercise(exercise)) return false;
    if (
      !isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "main",
        context,
        dayTitle: auditMeta?.dayTitle ?? "Back + Chest",
      })
    ) {
      return false;
    }
    if (!isBackChestMainBoundaryEligible({ exercise, allowChestFly: true })) return false;
    if (isBackChestScapularAccessoryPullExercise(exercise)) return false;
    return true;
  });
  if (strictFlyCandidates.length) {
    return pickFirstEligibleId(
      strictFlyCandidates,
      available,
      context,
      "main",
      auditMeta
    );
  }
  return pickFirstEligibleId(
    flyAndFallbackCandidates,
    available,
    context,
    "main",
    auditMeta
  );
};

const getShouldersLateralMainCandidateIds = (
  phaseIndex: number,
  _experience: ExperienceProfile,
  context: SelectionContext
) => {
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 2) {
      return [
        "cable-lateral-raise",
        "dumbbell-lateral-raise",
        "band-lateral-raise",
        "prone-t-raise",
      ];
    }
    return ["dumbbell-lateral-raise", "band-lateral-raise", "prone-t-raise"];
  }
  return ["band-lateral-raise", "dumbbell-lateral-raise", "prone-t-raise"];
};

const chooseShouldersLateralMainId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getShouldersLateralMainCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const getShouldersRearDeltMainCandidateIds = (
  phaseIndex: number,
  _experience: ExperienceProfile,
  context: SelectionContext
) => {
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3) {
      return [
        "machine-reverse-pec-deck",
        "cable-rear-delt-fly",
        "dumbbell-rear-delt-fly",
        "band-rear-delt-fly",
        "reverse-snow-angel",
      ];
    }
    return [
      "machine-reverse-pec-deck",
      "dumbbell-rear-delt-fly",
      "cable-rear-delt-fly",
      "band-rear-delt-fly",
      "reverse-snow-angel",
    ];
  }
  if (context.capabilityMode === "bandOnly") {
    return [
      "band-rear-delt-fly",
      "reverse-snow-angel",
      "dumbbell-rear-delt-fly",
    ];
  }
  return ["reverse-snow-angel", "dumbbell-rear-delt-fly", "band-rear-delt-fly"];
};

const getShouldersSupportMainCandidateIds = (
  phaseIndex: number,
  _experience: ExperienceProfile,
  context: SelectionContext,
  options?: {
    alternate?: boolean;
  }
) => {
  const alternate = Boolean(options?.alternate);
  if (context.capabilityMode === "hasLoad") {
    if (phaseIndex >= 3) {
      return alternate
        ? ["prone-swimmer", "reverse-snow-angel", "prone-y-raise"]
        : ["prone-y-raise", "reverse-snow-angel", "prone-swimmer"];
    }
    return alternate
      ? ["reverse-snow-angel", "prone-swimmer", "prone-y-raise"]
      : ["prone-y-raise", "prone-swimmer", "reverse-snow-angel"];
  }
  if (context.capabilityMode === "bandOnly") {
    return alternate
      ? ["reverse-snow-angel", "prone-swimmer", "prone-y-raise"]
      : ["prone-y-raise", "reverse-snow-angel", "prone-swimmer"];
  }
  return alternate
    ? ["prone-swimmer", "reverse-snow-angel", "prone-y-raise"]
    : ["prone-y-raise", "reverse-snow-angel", "prone-swimmer"];
};

const chooseShouldersRearDeltMainId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getShouldersRearDeltMainCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseShouldersSupportMainId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta,
  options?: {
    alternate?: boolean;
  }
) =>
  pickFirstEligibleId(
    getShouldersSupportMainCandidateIds(phaseIndex, experience, context, options),
    available,
    context,
    "main",
    auditMeta
  );

const getShouldersPullMainCandidateIds = (
  phaseIndex: number,
  experience: ExperienceProfile,
  context: SelectionContext
) => getShouldersRearDeltMainCandidateIds(phaseIndex, experience, context);

const chooseShouldersPullMainId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  chooseShouldersRearDeltMainId(
    phaseIndex,
    available,
    experience,
    context,
    auditMeta
  );

const getLegsSingleLegOrSecondarySquatCandidateIds = (
  phaseIndex: number,
  _experience: ExperienceProfile,
  _context: SelectionContext
) => {
  if (phaseIndex >= 3) {
    return [
      "dumbbell-step-up-loaded",
      "split-squat",
      "goblet-squat",
      "machine-leg-press",
      "machine-hack-squat",
      "heels-elevated-squat",
      "bodyweight-squat",
    ];
  }
  if (phaseIndex >= 2) {
    return [
      "split-squat",
      "dumbbell-step-up-loaded",
      "goblet-squat",
      "machine-leg-press",
      "heels-elevated-squat",
      "bodyweight-squat",
      "cossack-squat",
    ];
  }
  return [
    "split-squat",
    "bodyweight-squat",
    "heels-elevated-squat",
    "goblet-squat",
    "dumbbell-step-up-loaded",
    "machine-leg-press",
    "cossack-squat",
  ];
};

const chooseLegsSingleLegOrSecondarySquatId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getLegsSingleLegOrSecondarySquatCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const getLegsLowerSecondaryCandidateIds = (
  phaseIndex: number,
  _experience: ExperienceProfile,
  _context: SelectionContext
) => {
  if (phaseIndex >= 3) {
    return [
      "barbell-hip-thrust",
      "barbell-romanian-deadlift",
      "machine-leg-press",
      "machine-hack-squat",
      "db-rdl",
      "goblet-squat",
      "dumbbell-step-up-loaded",
      "machine-seated-hamstring-curl",
    ];
  }
  if (phaseIndex >= 2) {
    return [
      "goblet-squat",
      "db-rdl",
      "machine-leg-press",
      "split-squat",
      "single-leg-rdl",
      "machine-seated-hamstring-curl",
      "back-extension",
    ];
  }
  return [
    "goblet-squat",
    "single-leg-hip-thrust",
    "back-extension-hold",
    "split-squat",
    "bodyweight-squat",
    "back-extension",
  ];
};

const chooseLegsLowerSecondaryId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getLegsLowerSecondaryCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseSquatCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getSquatCompoundCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const chooseHingeCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getHingeCompoundCandidateIds(phaseIndex, experience, context),
    available,
    context,
    "main",
    auditMeta
  );

const getAccessoryCandidateIds = (params: {
  lane: "push" | "pull" | "lower" | "core" | "chest" | "back";
  available: Set<Equipment>;
  context: SelectionContext;
  dayTitle?: string;
}) => {
  const { lane, available, context, dayTitle } = params;
  const prioritizeLoaded =
    context.capabilityMode === "hasLoad" && context.painSeverity !== "high";
  const backChestAccessoryDay = isBackChestDayTitle(dayTitle);
  const shouldersArmsAccessoryDay = isShouldersArmsDayTitle(dayTitle);
  const hasEligibleAccessoryCandidate = (ids: string[]) =>
    ids.some((id) => {
      const exercise = exerciseById(id);
      if (!exercise) return false;
      return isExerciseEligibleForProgramContext({
        exercise,
        available,
        section: "accessory",
        context,
      });
    });

  const chestLoadedFirst = backChestAccessoryDay
    ? [
        "machine-pec-deck-press",
        "machine-chest-press",
        "dumbbell-chest-fly",
        "dumbbell-floor-press",
      ]
    : [
        "machine-pec-deck-press",
        "dumbbell-chest-fly",
        "machine-chest-press",
        "dumbbell-floor-press",
      ];
  const chestFallback = [
    "suspension-chest-fly",
    "band-chest-press",
    "incline-pushup",
    "pushup",
    "wall-pushup",
  ];
  const backLoadedFirst = backChestAccessoryDay
    ? [
        "machine-rear-delt-row",
        "cable-face-pull",
        "face-pull",
        "suspension-face-pull",
        "suspension-rear-delt-row",
        "suspension-row-upright",
        "dumbbell-pullover",
        "dumbbell-chest-supported-row",
        "split-stance-row",
        "band-row",
        "band-lat-pulldown",
        "cable-seated-row",
        "cable-lat-pulldown",
        "machine-seated-row",
        "machine-lat-pulldown",
        "dumbbell-rows",
      ]
    : [
        "machine-rear-delt-row",
        "cable-face-pull",
        "machine-seated-row",
        "cable-seated-row",
        "machine-lat-pulldown",
        "cable-lat-pulldown",
        "face-pull",
        "suspension-face-pull",
        "dumbbell-chest-supported-row",
        "dumbbell-rows",
        "split-stance-row",
        "band-row",
        "band-lat-pulldown",
      ];
  const backFallback = [
    "reverse-snow-angel",
    "supine-elbow-drive-row",
    "prone-elbow-row",
    "prone-swimmer",
    "back-widow",
  ];

  if (lane === "chest") {
    if (prioritizeLoaded && hasEligibleAccessoryCandidate(chestLoadedFirst)) {
      return [...chestLoadedFirst];
    }
    return [...chestLoadedFirst, ...chestFallback];
  }
  if (lane === "back") {
    if (prioritizeLoaded && hasEligibleAccessoryCandidate(backLoadedFirst)) {
      return [...backLoadedFirst];
    }
    return [...backLoadedFirst, ...backFallback];
  }
  if (lane === "push") {
    const tricepsCandidates = [
      "db-triceps-extension",
      "dumbbell-triceps-kickback",
      "band-triceps-pressdown",
      "band-overhead-triceps-extension",
      "overhead-cable-triceps-extension",
      "bodyweight-triceps-extension",
      "self-resisted-triceps-extension",
    ];
    if (shouldersArmsAccessoryDay) return tricepsCandidates;
    return [
      ...tricepsCandidates,
      "dumbbell-chest-fly",
      "dumbbell-lateral-raise",
    ];
  }
  if (lane === "pull") {
    const bicepsCandidates = [
      "db-biceps-curl",
      "hammer-curl",
      "cable-biceps-curl",
      "band-biceps-curl",
      "single-arm-band-biceps-curl",
      "towel-biceps-curl-hold",
      "self-resisted-biceps-curl",
    ];
    if (shouldersArmsAccessoryDay) return bicepsCandidates;
    return [
      "face-pull",
      "band-lat-pulldown",
      "reverse-snow-angel",
      ...bicepsCandidates,
    ];
  }
  if (lane === "lower") {
    return [
      "single-leg-calf-raise",
      "standing-calf-raise",
      "band-rdl",
      "hip-hinge-drill",
      "glute-bridges",
      "band-front-squat",
      "bodyweight-squat",
      "cossack-squat",
      "suitcase-carry",
      "farmers-carry",
      "band-suitcase-march",
      "suitcase-hold-march",
    ];
  }
  return [
    "suitcase-carry",
    "farmers-carry",
    "band-suitcase-march",
    "suitcase-hold-march",
    "band-woodchop",
    "pallof-press",
    "dead-bug",
    "bird-dog",
    "standing-brace-march",
    "marching-brace-hold",
    "wall-braced-single-leg-march",
    "contralateral-reach-march",
    "hollow-body-hold",
    "plank",
    "side-plank",
    "side-plank-star",
  ];
};

const chooseAccessoryId = (
  lane: "push" | "pull" | "lower" | "core" | "chest" | "back",
  available: Set<Equipment>,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    getAccessoryCandidateIds({ lane, available, context, dayTitle: auditMeta?.dayTitle }),
    available,
    context,
    "accessory",
    auditMeta
  );

type MainLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";
type AccessoryLane = "push" | "pull" | "lower" | "core" | "chest" | "back";
type SectionFocus = "upper" | "lower" | "core";
type BudgetPatternKey =
  | MainLane
  | "scapular"
  | "carry"
  | "antiRotation"
  | "armsIsolation"
  | "calves";
type PlannedMainSlot = {
  slotId: string;
  lane: MainLane;
  isExtraMain: boolean;
  slotKind?: string;
};

type DayPatternBudget = {
  mainMin?: Partial<Record<MainLane, number>>;
  mainMax?: Partial<Record<MainLane, number>>;
  accessoryMax?: number;
  requiresCarryOrAntiRotation?: boolean;
  requiresArmIsolation?: boolean;
};

const DEBUG_AUDIT_SELECTION = false;

export {
  clearProgramSelectionAuditBuffer,
  getProgramSelectionAuditBuffer,
} from "@/lib/program/generationObservability";
export type {
  ProgramSelectionAuditCandidate,
  ProgramSelectionAuditEntry,
} from "@/lib/program/generationObservability";

export type { ProgramConstraintWarning } from "@/lib/program/programFinalization";

const programConstraintWarningBuffer: ProgramConstraintWarning[] = [];

export const getProgramConstraintWarningBuffer = () => [
  ...programConstraintWarningBuffer,
];

export const clearProgramConstraintWarningBuffer = () => {
  programConstraintWarningBuffer.length = 0;
};

const pushProgramConstraintWarnings = (warnings: ProgramConstraintWarning[]) => {
  if (!warnings.length) return;
  warnings.forEach((warning) => {
    programConstraintWarningBuffer.push(warning);
    if (programConstraintWarningBuffer.length > 2000) {
      programConstraintWarningBuffer.shift();
    }
  });
};

type SelectionAuditMeta = {
  slotId: string;
  slotIndex?: number;
  phaseIndex?: number;
  dayTitle: string;
  dayFocusTags: string[];
  slotKind: string;
  slotLane?: MainLane;
  selectedMainExerciseIds?: string[];
  selectedAccessoryExerciseIds?: string[];
  expectedLaneCounts?: Partial<Record<MainLane, number>>;
  capabilityMode: EquipmentCapabilityMode;
  dayBudget?: DayPatternBudget | null;
  priorDayHeavyPatterns?: PrimaryMotorPattern[];
  selectionAuditHook?: ProgramSelectionAuditHook;
  selectionRng?: RandomFn;
};

const appendNote = (notes: string | null | undefined, text: string) => {
  const current = (notes ?? "").trim();
  if (!current) return text;
  if (current.toLowerCase().includes(text.toLowerCase())) return current;
  return `${current} ${text}`;
};

const capMainSetsForHighPain = (sets: string | number | null | undefined) => {
  if (sets === null || sets === undefined) return sets ?? null;
  if (typeof sets === "number") {
    return Math.min(2, sets);
  }
  const cleaned = sets.replace("–", "-");
  const parts = cleaned.split("-").map((part) => Number(part.trim()));
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return String(Math.min(2, parts[0]));
  }
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    const min = Math.min(2, Math.max(1, parts[0]));
    const max = Math.min(2, Math.max(min, parts[1]));
    return min === max ? String(min) : `${min}-${max}`;
  }
  return "2";
};

const applyHighPainMainPrescription = (item: ProgramRoutineItem) => {
  const isTimedMain = item.loadType === "timed";
  return {
    ...item,
    sets: capMainSetsForHighPain(item.sets),
    reps: isTimedMain ? item.reps : "8-12",
    durationSec: isTimedMain
      ? Math.max(30, Math.min(45, item.durationSec ?? 45))
      : item.durationSec,
    restSec: Math.max(45, (item.restSec ?? 60) + 20),
    notes: appendNote(
      item.notes,
      "Stop 2 reps before strain. Prioritize range and control."
    ),
  };
};

const expandRepRangeForExtraMain = (reps?: string | null) => {
  if (!reps) return reps ?? null;
  const cleaned = reps.replace("–", "-");
  const match = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return reps;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return reps;
  const nextMax = Math.min(max + 4, min + 6);
  return cleaned.replace(match[0], `${min}-${nextMax}`);
};

const applyCapabilityMainPrescription = (params: {
  item: ProgramRoutineItem;
  slot: PlannedMainSlot;
  capabilityMode: EquipmentCapabilityMode;
}) => {
  const { item, slot, capabilityMode } = params;
  if (capabilityMode === "hasLoad") return item;

  if (capabilityMode === "noneOnly" && slot.isExtraMain) {
    return {
      ...item,
      reps: expandRepRangeForExtraMain(item.reps),
      durationSec:
        typeof item.durationSec === "number"
          ? Math.min(60, item.durationSec + 10)
          : item.durationSec,
      restSec: Math.max(30, (item.restSec ?? 60) - 15),
      notes: appendNote(item.notes, "3 sec eccentric"),
    };
  }

  if (
    capabilityMode === "bandOnly" &&
    (slot.lane === "pull" || slot.lane === "hinge")
  ) {
    return {
      ...item,
      notes: appendNote(
        item.notes,
        "When you hit the top of the rep range, increase band tension or step farther from anchor."
      ),
    };
  }

  return item;
};

const applyPainSeverityMainPrescription = (params: {
  item: ProgramRoutineItem;
  selectionContext: SelectionContext;
}) => {
  const { item, selectionContext } = params;
  if (selectionContext.painSeverity !== "high") return item;
  return applyHighPainMainPrescription(item);
};

const isLowerFocusedDay = (title: string, focusTags: string[]) => {
  const lowerTitle = title.toLowerCase().includes("leg");
  const lowerTags = focusTags.some((tag) => {
    const normalized = tag.trim().toLowerCase();
    return normalized === "legs" || normalized === "lower";
  });
  return lowerTitle || lowerTags;
};

const ensurePullLaneBandOnly = (
  lanes: MainLane[],
  dayTitle: string,
  focusTags: string[]
) => {
  if (lanes.includes("pull")) return lanes;

  const next = [...lanes];
  const lowerDay = isLowerFocusedDay(dayTitle, focusTags);

  if (lowerDay) {
    const hasHinge = next.includes("hinge");
    if (hasHinge) {
      // Preserve lower-day posterior-chain intent: never replace hinge to force pull.
      const pushIndex = next.findIndex(
        (lane) => lane === "push" || lane === "verticalPush"
      );
      if (pushIndex >= 0) {
        next[pushIndex] = "pull";
        return next;
      }
      const nonLowerIndex = next.findIndex(
        (lane) => lane !== "hinge" && lane !== "squat"
      );
      if (nonLowerIndex >= 0) {
        next[nonLowerIndex] = "pull";
      }
      return next;
    }

    if (next.includes("squat")) {
      // On lower days with no hinge, prefer restoring hinge balance over forcing pull.
      const pushIndex = next.findIndex(
        (lane) => lane === "push" || lane === "verticalPush"
      );
      if (pushIndex >= 0) {
        next[pushIndex] = "hinge";
        return next;
      }
      const nonLowerIndex = next.findIndex(
        (lane) => lane !== "squat" && lane !== "hinge"
      );
      if (nonLowerIndex >= 0) {
        next[nonLowerIndex] = "hinge";
        return next;
      }
      const squatIndex = next.findIndex((lane) => lane === "squat");
      if (squatIndex >= 0) {
        next[squatIndex] = "hinge";
      }
      return next;
    }

    const nonHingeIndex = next.findIndex((lane) => lane !== "hinge");
    if (nonHingeIndex >= 0) {
      next[nonHingeIndex] = "hinge";
    }
    return next;
  }

  const pushIndex = next.findIndex(
    (lane) => lane === "push" || lane === "verticalPush"
  );
  if (pushIndex >= 0) {
    next[pushIndex] = "pull";
    return next;
  }
  const replaceIndex = next.findIndex((lane) => lane !== "pull");
  if (replaceIndex >= 0) {
    next[replaceIndex] = "pull";
  }
  return next;
};

const resolveDayPatternBudget = (params: {
  title: string;
  selectionContext: SelectionContext;
}): DayPatternBudget | null => {
  const { title, selectionContext } = params;
  const normalized = title.toLowerCase();
  const postureActivationBeginner =
    selectionContext.intentProfile.primaryGoal === "posture" &&
    selectionContext.phaseStage === "activation" &&
    selectionContext.experienceLevel === "beginner";

  if (normalized === "back + chest") {
    const advanced = selectionContext.experienceLevel === "advanced";
    const intermediate = selectionContext.experienceLevel === "intermediate";
    return {
      mainMin: {
        pull: advanced ? 3 : 2,
        push: 1,
      },
      mainMax: {
        pull: advanced ? 4 : intermediate ? 3 : 2,
        push: advanced || intermediate ? 2 : 1,
        verticalPush: 0,
        squat: 0,
        hinge: 0,
      },
    };
  }

  if (normalized === "shoulders + arms") {
    return {
      mainMin: { verticalPush: 1, pull: 1 },
      mainMax: {
        pull: 1,
        squat: 0,
        hinge: postureActivationBeginner ? 1 : 0,
      },
      requiresArmIsolation: true,
    };
  }

  if (normalized === "legs + abs") {
    return {
      mainMin: { squat: 1, hinge: 1 },
      mainMax: { pull: 0, push: 0, verticalPush: 0 },
    };
  }

  if (normalized === "upper push + scapular control" || normalized === "upper push") {
    return {
      mainMin: { push: 1, verticalPush: 1 },
      mainMax: {
        pull: postureActivationBeginner ? 1 : 0,
        squat: 0,
        hinge: postureActivationBeginner ? 1 : 0,
      },
    };
  }

  if (normalized === "upper pull + thoracic posture" || normalized === "upper pull") {
    return {
      mainMin: { pull: 1 },
      mainMax: {
        push: postureActivationBeginner ? 1 : 0,
        verticalPush: 0,
        squat: 0,
        hinge: postureActivationBeginner ? 1 : 0,
      },
    };
  }

  if (normalized === "lower (squat emphasis) + core" || normalized === "lower squat") {
    return {
      mainMin: { squat: 1 },
      mainMax: { squat: 2, hinge: 1 },
    };
  }

  if (
    normalized === "lower (hinge emphasis) + carry/anti-rotation" ||
    normalized === "lower hinge + posterior chain"
  ) {
    return {
      mainMin: { hinge: 1 },
      mainMax: { hinge: 2, squat: 1 },
      requiresCarryOrAntiRotation: true,
    };
  }

  if (normalized === "arms + posture + conditioning") {
    return {
      mainMin: { pull: 1, verticalPush: 1 },
      mainMax: { squat: 0, hinge: 0 },
      requiresArmIsolation: true,
    };
  }

  return null;
};

const slotKindByMainLane: Record<MainLane, string> = {
  push: "mainPush",
  verticalPush: "mainVerticalPush",
  pull: "mainPull",
  squat: "mainSquat",
  hinge: "mainHinge",
};

const maybeRotateThreeDayTemplateLanePlan = (params: {
  dayTitle: string;
  phaseIndex: number;
  plan: ThreeDayMainLanePlanEntry[] | null;
  selectionContext: SelectionContext;
}): ThreeDayMainLanePlanEntry[] | null => {
  const { dayTitle, phaseIndex, plan, selectionContext } = params;
  if (!plan?.length) return plan;
  const variationState = selectionContext.variationState;
  if (!variationState?.enabled) return plan;

  const dayToken = normalizeSlotToken(dayTitle);
  if (variationState.selectedDayTemplateKeys.has(dayToken)) {
    return plan;
  }
  const seededUnit = stableHashUnit(
    `${variationState.seedKey}|${dayToken}|lane-plan|${phaseIndex}`
  );
  const shouldSwap = seededUnit >= 0.5;
  if (!shouldSwap) return plan;

  if (dayToken === "back_chest" && plan.length >= 4) {
    const third = plan[2];
    const fourth = plan[3];
    if (
      third?.slotKind === "mainPullHorizontal" &&
      fourth?.slotKind === "mainPullVertical"
    ) {
      const rotated = [...plan];
      rotated[2] = fourth;
      rotated[3] = third;
      return rotated;
    }
  }

  if (dayToken === "shoulders_arms" && plan.length >= 4) {
    const third = plan[2];
    const fourth = plan[3];
    if (
      third?.slotKind === "mainShoulderPullPrimary" &&
      fourth?.slotKind === "mainShoulderStructuralSecondary"
    ) {
      const rotated = [...plan];
      rotated[2] = fourth;
      rotated[3] = third;
      return rotated;
    }
  }

  return plan;
};

const buildStructuredDay = (params: {
  title: string;
  focusTags: string[];
  experienceProfile: ExperienceProfile;
  selectionContext: SelectionContext;
  daysPerWeek: 3 | 4 | 5;
  phaseIndex: number;
  available: Set<Equipment>;
  lanes: MainLane[];
  warmupFocus: "upper" | "lower" | "core";
  cooldownFocus: "upper" | "lower" | "core";
  capabilityMode: EquipmentCapabilityMode;
  priorDayHeavyPatterns?: PrimaryMotorPattern[];
  selectionAuditHook?: ProgramSelectionAuditHook;
  selectionRng?: RandomFn;
}) => {
  const {
    title,
    focusTags,
    experienceProfile,
    selectionContext,
    daysPerWeek,
    phaseIndex,
    available,
    lanes,
    warmupFocus,
    cooldownFocus,
    capabilityMode,
    priorDayHeavyPatterns,
    selectionAuditHook,
    selectionRng,
  } = params;
  const used = new Set<string>();
  const pickUnique = (
    id: string,
    fallbackCandidates: string[],
    section: ProgramRoutineItem["section"],
    options: {
      mainSlot?: PlannedMainSlot;
      accessoryLane?: AccessoryLane;
    } = {}
  ) => {
    const fallbackCandidateSet = new Set(fallbackCandidates);
    const isCandidateRoleLegal = (candidate: Exercise) =>
      isRoleLegalForSlot({
        exercise: candidate,
        section,
        dayTitle: title,
        slotKind: options.mainSlot ? getSlotKindForSlot(options.mainSlot) : undefined,
        mainSlotLane: options.mainSlot?.lane,
        accessoryLane: options.accessoryLane,
        available,
        context: selectionContext,
      });
    const matchesRequestedSlot = (candidate: Exercise) => {
      if (!isCandidateRoleLegal(candidate)) return false;
      if (options.mainSlot) {
        return isMainCandidateCompatibleWithPlannedSlot(candidate, options.mainSlot);
      }
      if (options.accessoryLane) {
        return (
          fallbackCandidateSet.has(candidate.id) &&
          matchesAccessoryLanePattern(candidate, options.accessoryLane)
        );
      }
      return true;
    };

    const current = exerciseById(id);
    if (!used.has(id) && current && matchesRequestedSlot(current)) {
      used.add(id);
      return { id, source: "initial_pick" as ProgramSelectionDebugSource };
    }
    const fallbackFromList = fallbackCandidates.find((candidateId) => {
      const candidate = exerciseById(candidateId);
      if (!candidate) return false;
      if (used.has(candidate.id)) return false;
      if (!matchesRequestedSlot(candidate)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise: candidate,
          available,
          section,
          context: selectionContext,
          dayTitle: title,
        })
      ) {
        return false;
      }
      return true;
    });
    if (fallbackFromList) {
      used.add(fallbackFromList);
      return { id: fallbackFromList, source: "uniqueness_swap" as ProgramSelectionDebugSource };
    }

    const pool = exercises
      .filter((candidate) => {
        if (used.has(candidate.id)) return false;
        if (!matchesRequestedSlot(candidate)) return false;
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section,
            context: selectionContext,
            dayTitle: title,
          })
        ) {
          return false;
        }
        if (!current) return true;
        return candidate.movementPattern.some((pattern) =>
          current.movementPattern.includes(pattern)
        );
      })
      .sort(
        (left, right) =>
          scoreExerciseForContext(right, section, selectionContext, available) -
          scoreExerciseForContext(left, section, selectionContext, available)
      );
    const next = pool[0]?.id ?? id;
    used.add(next);
    return {
      id: next,
      source:
        next === id
          ? ("initial_pick" as ProgramSelectionDebugSource)
          : ("uniqueness_swap" as ProgramSelectionDebugSource),
    };
  };

  const warmupId = pickUnique(
    chooseWarmupId(warmupFocus, available, selectionContext),
    ["cat-cow", "thoracic-rotation", "wall-slides"],
    "warmup"
  ).id;
  const normalizedTitle = normalizeSlotToken(title);
  const threeDayBlueprint =
    daysPerWeek === 3
      ? resolveThreeDayBlueprint({
          dayTitle: title,
          selectionContext,
          available,
        })
      : null;
  const seedLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly([...lanes], title, focusTags)
      : [...lanes];
  const dayBudget = resolveDayPatternBudget({
    title,
    selectionContext,
  });
  const targetMainSlotCount = Math.max(
    1,
    threeDayBlueprint ? threeDayBlueprint.mainCount : experienceProfile.mainLaneCount
  );
  const threeDayTemplateLanePlanBase =
    threeDayBlueprint?.mainLanePlan.length
      ? threeDayBlueprint.mainLanePlan
      : daysPerWeek === 3
      ? get3DayMainLanePlan(title, targetMainSlotCount)
      : null;
  const threeDayTemplateLanePlan = maybeRotateThreeDayTemplateLanePlan({
    dayTitle: title,
    phaseIndex,
    plan: threeDayTemplateLanePlanBase,
    selectionContext,
  });
  const expandedLanes =
    threeDayTemplateLanePlan?.length
      ? threeDayTemplateLanePlan.map((slot) => slot.lane as MainLane)
      : normalizedTitle === "back_chest"
      ? resolveBackChestMainLanePlan({
          targetMainCount: targetMainSlotCount,
          selectionContext,
          daysPerWeek,
        })
      : seedLanes.length
      ? [...seedLanes]
      : (["pull"] as MainLane[]);

  // Keep non-extra mains inside the day's intended lanes instead of leaking to other patterns.
  while (expandedLanes.length < targetMainSlotCount) {
    const nextIndex = expandedLanes.length % Math.max(1, seedLanes.length);
    expandedLanes.push(seedLanes[nextIndex] ?? seedLanes[0] ?? "pull");
  }
  const plannedLanes =
    threeDayTemplateLanePlan?.length
      ? threeDayTemplateLanePlan
          .map((slot) => slot.lane as MainLane)
          .slice(0, targetMainSlotCount)
      : normalizedTitle === "back_chest"
      ? expandedLanes.slice(0, targetMainSlotCount)
      : capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly(expandedLanes, title, focusTags).slice(
          0,
          targetMainSlotCount
        )
      : expandedLanes.slice(0, targetMainSlotCount);
  const plannedMainSlots: PlannedMainSlot[] = plannedLanes.map((lane, index) => ({
    slotId: `${normalizedTitle}-main-${index + 1}`,
    lane,
    isExtraMain: false,
    slotKind: threeDayTemplateLanePlan?.[index]?.slotKind,
  }));
  const backChestPullSlotKindById = new Map<
    string,
    "mainPullHorizontal" | "mainPullVertical" | "mainPullSupport"
  >();
  if (normalizedTitle === "back_chest") {
    let pullOrdinal = 0;
    plannedMainSlots.forEach((slot) => {
      if (slot.slotKind === "mainPullHorizontal") {
        backChestPullSlotKindById.set(slot.slotId, "mainPullHorizontal");
        return;
      }
      if (slot.slotKind === "mainPullVertical") {
        backChestPullSlotKindById.set(slot.slotId, "mainPullVertical");
        return;
      }
      if (slot.slotKind === "mainPullSupport") {
        backChestPullSlotKindById.set(slot.slotId, "mainPullSupport");
        return;
      }
      if (slot.lane !== "pull") return;
      pullOrdinal += 1;
      if (pullOrdinal === 1) {
        backChestPullSlotKindById.set(slot.slotId, "mainPullHorizontal");
        return;
      }
      if (pullOrdinal === 2) {
        backChestPullSlotKindById.set(slot.slotId, "mainPullVertical");
        return;
      }
      backChestPullSlotKindById.set(slot.slotId, "mainPullSupport");
    });
  }
  const getSlotKindForSlot = (slot: PlannedMainSlot) =>
    slot.slotKind ??
    (slot.lane === "pull"
      ? backChestPullSlotKindById.get(slot.slotId) ?? slotKindByMainLane[slot.lane]
      : slotKindByMainLane[slot.lane]);
  const isMainCandidateCompatibleWithPlannedSlot = (
    candidate: Exercise,
    slot: PlannedMainSlot
  ) => {
    const slotKind = getSlotKindForSlot(slot);
    if (normalizedTitle === "back_chest") {
      return matchesBackChestMainSlotKind({
        exercise: candidate,
        slotKind,
        slotLane: slot.lane,
      });
    }
    if (normalizedTitle === "shoulders_arms") {
      return matchesShouldersArmsMainSlotKind({
        exercise: candidate,
        slotKind,
        slotLane: slot.lane,
        dayTitle: title,
      });
    }
    return matchesMainLanePattern(candidate, slot.lane);
  };
  const expectedLaneCounts = plannedLanes.reduce((map, lane) => {
    map[lane] = (map[lane] ?? 0) + 1;
    return map;
  }, {} as Partial<Record<MainLane, number>>);

  const mainIds: string[] = [];
  const mainSelectionSources: ProgramSelectionDebugSource[] = [];
  plannedMainSlots.forEach((slot) => {
    const lane = slot.lane;
    const slotKind = getSlotKindForSlot(slot);
    const slotIndex = mainIds.length;
    const auditMeta: SelectionAuditMeta = {
      slotId: slot.slotId,
      slotIndex,
      phaseIndex,
      dayTitle: title,
      dayFocusTags: focusTags,
      capabilityMode,
      slotKind,
      slotLane: lane,
      selectedMainExerciseIds: [...mainIds],
      expectedLaneCounts,
      dayBudget,
      priorDayHeavyPatterns,
      selectionAuditHook,
      selectionRng,
    };
    const selectedId =
      lane === "push"
        ? slotKind === "mainPushFly"
          ? chooseBackChestFlyMainId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : slotKind === "mainLateralDeltPrimary"
          ? chooseShouldersLateralMainId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : choosePushCompoundId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
        : lane === "verticalPush"
        ? chooseVerticalPushId(
            phaseIndex,
            available,
            experienceProfile,
            selectionContext,
            auditMeta
          )
        : lane === "pull"
        ? slotKind === "mainPullVertical"
          ? chooseBackChestVerticalPullId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : slotKind === "mainPullSupport"
          ? chooseBackChestSupportPullId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : slotKind === "mainShoulderPullPrimary"
          ? chooseShouldersRearDeltMainId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : slotKind === "mainShoulderStructuralSecondary" ||
            slotKind === "mainShoulderStructuralAlternate"
          ? chooseShouldersSupportMainId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta,
              {
                alternate: slotKind === "mainShoulderStructuralAlternate",
              }
            )
          : choosePullCompoundId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
        : lane === "squat"
        ? slotKind === "mainSingleLegOrSecondarySquat"
          ? chooseLegsSingleLegOrSecondarySquatId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : chooseSquatCompoundId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
        : lane === "hinge"
        ? slotKind === "mainLowerSecondary"
          ? chooseLegsLowerSecondaryId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
          : chooseHingeCompoundId(
              phaseIndex,
              available,
              experienceProfile,
              selectionContext,
              auditMeta
            )
        : chooseHingeCompoundId(
            phaseIndex,
            available,
            experienceProfile,
            selectionContext,
            auditMeta
          );
    mainIds.push(selectedId);
    mainSelectionSources.push("initial_pick");
  });

  if (
    normalizedTitle === "back_chest" &&
    selectionContext.phaseStage === "activation" &&
    capabilityMode === "hasLoad"
  ) {
    const primaryRowSlotIndex = plannedMainSlots.findIndex(
      (slot) =>
        slot.lane === "pull" &&
        getSlotKindForSlot(slot) === "mainPullHorizontal"
    );
    if (primaryRowSlotIndex >= 0) {
      const machineRow = exerciseById("machine-seated-row");
      if (
        machineRow &&
        isExerciseEligibleForProgramContext({
          exercise: machineRow,
          available,
          section: "main",
          context: selectionContext,
          dayTitle: title,
        })
      ) {
        mainIds[primaryRowSlotIndex] = machineRow.id;
        mainSelectionSources[primaryRowSlotIndex] = "day_intelligence_repair";
      }
    }
  }

  const ensureMainEquipmentBalance = (mainExerciseIds: string[]) => {
    if (!(available.has("dumbbells") && available.has("bands"))) {
      return mainExerciseIds;
    }
    const hasDumbbellMain = mainExerciseIds.some((id) =>
      exerciseById(id)?.equipment.includes("dumbbells")
    );
    if (hasDumbbellMain) return mainExerciseIds;

    const targetIndex = Math.max(0, mainExerciseIds.length - 1);
    const targetSlot = plannedMainSlots[targetIndex];
    const current = exerciseById(mainExerciseIds[targetIndex]);
    if (!current) return mainExerciseIds;

    const replacement = exercises
      .filter((candidate) => {
        if (candidate.id === current.id) return false;
        if (used.has(candidate.id)) return false;
        if (candidate.category !== "main") return false;
        if (!candidate.equipment.includes("dumbbells")) return false;
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section: "main",
            context: selectionContext,
            dayTitle: title,
          })
        ) {
          return false;
        }
        if (targetSlot && !isMainCandidateCompatibleWithPlannedSlot(candidate, targetSlot)) {
          return false;
        }
        const overlap = candidate.movementPattern.some((pattern) =>
          current.movementPattern.includes(pattern)
        );
        return overlap;
      })
      .sort(
        (left, right) =>
          scoreExerciseForContext(right, "main", selectionContext, available) -
          scoreExerciseForContext(left, "main", selectionContext, available)
      )[0];

    if (!replacement) return mainExerciseIds;
    return mainExerciseIds.map((id, index) =>
      index === targetIndex ? replacement.id : id
    );
  };

  const scoreMainCandidateForSlot = (candidate: Exercise, slot: PlannedMainSlot) => {
    const slotKind = getSlotKindForSlot(slot);
    const base = scoreExerciseForContextDetailed(
      candidate,
      "main",
      selectionContext,
      available,
      {
        slotId: slot.slotId,
        dayTitle: title,
        dayFocusTags: focusTags,
        slotKind,
        slotLane: slot.lane,
        capabilityMode,
        dayBudget,
        priorDayHeavyPatterns,
      }
    ).score;
    const capability = getCapabilitySlotBonus({
      exercise: candidate,
      section: "main",
      auditMeta: {
        slotId: slot.slotId,
        dayTitle: title,
        dayFocusTags: focusTags,
        slotKind,
        capabilityMode,
        priorDayHeavyPatterns,
      },
    }).bonus;
    return base + capability;
  };

  const softMinimumScoreSlack = 2;

  const applyCapabilitySoftMinimum = (mainExerciseIds: string[]) => {
    if (capabilityMode === "noneOnly") return mainExerciseIds;

    const nextIds = [...mainExerciseIds];
    const currentExercises = nextIds
      .map((id) => exerciseById(id))
      .filter((item): item is Exercise => Boolean(item));
    const weightedMainCount = currentExercises.filter(
      (exercise) => exercise.loadType === "weighted"
    ).length;
    const bandResistedMainCount = currentExercises.filter((exercise) =>
      isBandEquippedExercise(exercise)
    ).length;

    const attemptSlotSwap = (
      targetIndex: number,
      shouldKeep: (candidate: Exercise) => boolean
    ) => {
      const slot = plannedMainSlots[targetIndex];
      if (!slot) return;
      const currentId = nextIds[targetIndex];
      const currentExercise = exerciseById(currentId);
      if (!currentExercise) return;

      const usedIds = new Set(nextIds);
      usedIds.delete(currentId);

      const bestCandidate = exercises
        .filter((candidate) => {
          if (candidate.id === currentId) return false;
          if (usedIds.has(candidate.id)) return false;
          if (candidate.category !== "main") return false;
          if (
            !isExerciseEligibleForProgramContext({
              exercise: candidate,
              available,
              section: "main",
              context: selectionContext,
              dayTitle: title,
          })
        ) {
          return false;
        }
        if (!shouldKeep(candidate)) return false;
        if (!isMainCandidateCompatibleWithPlannedSlot(candidate, slot)) {
          return false;
        }
        return true;
      })
        .map((candidate) => ({
          candidate,
          score: scoreMainCandidateForSlot(candidate, slot),
        }))
        .sort((left, right) => right.score - left.score)[0];

      if (!bestCandidate) return;
      const currentScore = scoreMainCandidateForSlot(currentExercise, slot);
      if (bestCandidate.score + softMinimumScoreSlack < currentScore) return;
      nextIds[targetIndex] = bestCandidate.candidate.id;
    };

    if (capabilityMode === "hasLoad" && weightedMainCount === 0) {
      const targetIndex = plannedMainSlots.findIndex(
        (slot) => slot.lane === "squat" || slot.lane === "hinge"
      );
      if (targetIndex >= 0) {
        const targetLane = plannedMainSlots[targetIndex]?.lane;
        const preferMachineSquat = targetLane === "squat" && available.has("machines");
        attemptSlotSwap(targetIndex, (candidate) => {
          if (candidate.loadType !== "weighted") return false;
          if (!preferMachineSquat) return true;
          return candidate.equipment.includes("machines");
        });
      }
    }

    if (capabilityMode === "bandOnly" && bandResistedMainCount === 0) {
      const targetIndex = plannedMainSlots.findIndex(
        (slot) => slot.lane === "pull" || slot.lane === "hinge"
      );
      if (targetIndex >= 0) {
        attemptSlotSwap(targetIndex, (candidate) => isBandEquippedExercise(candidate));
      }
    }

    return nextIds;
  };

  const plannedAccessoryLanes = resolvePlannedAccessoryLanesFromTemplate({
    dayTitle: title,
    dayLanes: seedLanes,
    accessoryCount:
      threeDayBlueprint ? threeDayBlueprint.accessoryCount : experienceProfile.accessoryCount,
    blueprint: threeDayBlueprint,
  });
  const activationLane = accessoryLaneToActivationLane(plannedAccessoryLanes[0] ?? "core");
  const activationId = chooseActivationId(activationLane, available, selectionContext);
  const accessoryAuditMeta = (
    slotId: string,
    slotKind: string,
    slotIndex: number
  ): SelectionAuditMeta => ({
    slotId,
    slotIndex,
    phaseIndex,
    dayTitle: title,
    dayFocusTags: focusTags,
    slotKind,
    selectedMainExerciseIds: [...mainIds],
    capabilityMode,
    priorDayHeavyPatterns,
    selectionRng,
  });
  const accessoryPlans = plannedAccessoryLanes.map((lane, index) => {
    const auditMeta = accessoryAuditMeta(
      `${normalizedTitle}-accessory-${index + 1}`,
      `accessory${lane}`,
      index
    );
    const selectedId = chooseAccessoryId(
      lane,
      available,
      selectionContext,
      auditMeta
    );
    const fallbackCandidates = getAccessoryCandidateIds({
      lane,
      available,
      context: selectionContext,
      dayTitle: title,
    });
    return {
      lane,
      selectedId,
      fallbackCandidates,
      auditMeta,
    };
  });
  const cooldownId = chooseCooldownId(cooldownFocus, available, selectionContext);
  const equipmentBalancedMainIds = ensureMainEquipmentBalance(mainIds);
  const capabilityAdjustedMainIds = applyCapabilitySoftMinimum(equipmentBalancedMainIds);

  const routine = [
    makeItem(warmupId, experienceProfile.warmupSets, "6-10", 60, 30, "warmup"),
    makeItem(
      pickUnique(
        activationId,
        ["dead-bug", "bird-dog", "band-pull-aparts", "hip-hinge-drill"],
        "activation"
      ).id,
      "2",
      "8-12",
      60,
      30,
      "activation"
    ),
    ...capabilityAdjustedMainIds.map((id, index) => {
      const slot = plannedMainSlots[index] ?? {
        slotId: `${normalizedTitle}-main-${index + 1}`,
        lane: "pull" as MainLane,
        isExtraMain: false,
      };
      const slotFallbackCandidates =
        slot.lane === "push"
          ? slot.slotKind === "mainPushFly"
            ? getBackChestFlyMainCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : slot.slotKind === "mainLateralDeltPrimary"
            ? getShouldersLateralMainCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : Array.from(
                new Set([
                  ...getPushCompoundCandidateIds(
                    phaseIndex,
                    experienceProfile,
                    selectionContext
                  ),
                  ...getVerticalPushCandidateIds(
                    phaseIndex,
                    experienceProfile,
                    selectionContext
                  ),
                ])
              )
          : slot.lane === "verticalPush"
          ? Array.from(
              new Set([
                ...getVerticalPushCandidateIds(
                  phaseIndex,
                  experienceProfile,
                  selectionContext
                ),
                ...getPushCompoundCandidateIds(
                  phaseIndex,
                  experienceProfile,
                  selectionContext
                ),
              ])
            )
          : slot.lane === "pull"
          ? getSlotKindForSlot(slot) === "mainPullVertical"
            ? getBackChestVerticalPullCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : getSlotKindForSlot(slot) === "mainPullSupport"
            ? getBackChestSupportPullCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : getSlotKindForSlot(slot) === "mainShoulderPullPrimary"
            ? getShouldersRearDeltMainCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : getSlotKindForSlot(slot) === "mainShoulderStructuralSecondary" ||
              getSlotKindForSlot(slot) === "mainShoulderStructuralAlternate"
            ? getShouldersSupportMainCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext,
                {
                  alternate:
                    getSlotKindForSlot(slot) === "mainShoulderStructuralAlternate",
                }
              )
            : getPullCompoundCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
          : slot.lane === "squat"
          ? getSlotKindForSlot(slot) === "mainSingleLegOrSecondarySquat"
            ? getLegsSingleLegOrSecondarySquatCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
            : getSquatCompoundCandidateIds(
                phaseIndex,
                experienceProfile,
                selectionContext
              )
          : getSlotKindForSlot(slot) === "mainLowerSecondary"
          ? getLegsLowerSecondaryCandidateIds(
              phaseIndex,
              experienceProfile,
              selectionContext
            )
          : getHingeCompoundCandidateIds(
              phaseIndex,
              experienceProfile,
              selectionContext
            );
      const uniqueId = pickUnique(
        id,
        slotFallbackCandidates,
        "main",
        { mainSlot: slot }
      );
      const baseSelectionSource: ProgramSelectionDebugSource =
        uniqueId.source === "uniqueness_swap"
          ? "uniqueness_swap"
          : id !== mainIds[index]
          ? "day_intelligence_repair"
          : mainSelectionSources[index] ?? "initial_pick";
      const item = makeItem(
        uniqueId.id,
        experienceProfile.mainSets,
        experienceProfile.mainRepRange,
        undefined,
        experienceProfile.mainRestSec,
        "main",
        {
          source: baseSelectionSource,
          slotId: slot.slotId,
          slotKind: getSlotKindForSlot(slot),
          slotLane: slot.lane,
          phaseIndex,
        }
      );
      const capabilityAdjusted = applyCapabilityMainPrescription({
        item,
        slot,
        capabilityMode,
      });
      return applyPainSeverityMainPrescription({
        item: capabilityAdjusted,
        selectionContext,
      });
    }),
    ...accessoryPlans.map((plan) => {
      const uniqueId = pickUnique(
        plan.selectedId,
        plan.fallbackCandidates,
        "accessory",
        { accessoryLane: plan.lane }
      );
      return makeItem(
        uniqueId.id,
        experienceProfile.accessorySets,
        experienceProfile.accessoryRepRange,
        undefined,
        experienceProfile.accessoryRestSec,
        "accessory",
        {
          source: uniqueId.source,
          slotId: plan.auditMeta.slotId,
          slotKind: plan.auditMeta.slotKind,
          slotLane: plan.lane,
          phaseIndex,
        }
      );
    }),
    makeItem(
      cooldownId,
      experienceProfile.cooldownSets,
      "30 sec per side",
      60,
      30,
      "cooldown"
    ),
  ];

  return { title, focusTags, routine };
};

const emitFinalSelectionTraceForWeek = buildFinalSelectionTraceEmitter<
  SelectionContext,
  Equipment,
  EquipmentCapabilityMode,
  Exercise,
  MainLane
>({
  resolveExerciseById: (exerciseId) => exerciseById(exerciseId) ?? undefined,
  getExerciseId: (exercise) => exercise.id,
  getExerciseName: (exercise) => exercise.name,
  resolveMainLane: (exercise) => getMainLaneHits(exercise)[0],
  resolveSlotKind: (lane) => (lane ? slotKindByMainLane[lane] : "mainRepair"),
  buildSlotId: ({ dayTitle, mainIndex }) =>
    `${normalizeSlotToken(dayTitle)}-main-${mainIndex}`,
  scoreExerciseForSelectionTrace: ({ exercise, selectionContext, available, auditMeta }) =>
    scoreExerciseForContextDetailed(
      exercise,
      "main",
      selectionContext,
      available,
      auditMeta
    ),
  getCapabilityBonus: ({ exercise, auditMeta }) =>
    getCapabilitySlotBonus({
      exercise,
      section: "main",
      auditMeta,
    }),
});

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  if (parsed === 4 || parsed === 5) return parsed;
  return 3;
};

type SplitTemplateSpec = {
  title: string;
  focusTags: string[];
  lanes: MainLane[];
  warmupFocus: "upper" | "lower" | "core";
  cooldownFocus: "upper" | "lower" | "core";
  adaptiveNote?: string;
  constraints: {
    requiredMainPatterns: Array<{ pattern: MainLane; min: number }>;
    requiredMainRules?: RequirementRule[];
    forbiddenMainTags?: string[];
    requiredAccessories?: RequirementRule[];
    optionalRules?: RequirementRule[];
    forbidUpperPushPullOnMainAndAccessory?: boolean;
  };
};

const withAccessorySection = (baseRule: RequirementRule, minCount = 1): RequirementRule => ({
  ...baseRule,
  id: `${baseRule.id}_accessory`,
  description: `${baseRule.description} accessory`,
  sections: ["accessory"],
  minCount,
});

const dedupeRuleListById = (rules: RequirementRule[]) => {
  const byId = new Map<string, RequirementRule>();
  rules.forEach((rule) => {
    if (!byId.has(rule.id)) {
      byId.set(rule.id, rule);
    }
  });
  return Array.from(byId.values());
};

const dedupeStringValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

type AdaptiveWeakpointDomain = "upperPosture" | "coreStability" | "lowerStability";

type AdaptiveWeakpointPlan = {
  domain: AdaptiveWeakpointDomain;
  lanes: MainLane[];
  focusTags: string[];
  requiredMainRules: RequirementRule[];
  requiredAccessories: RequirementRule[];
  optionalRules: RequirementRule[];
  forbiddenMainTags: string[];
  deprioritizedLabel: string;
  weakpointLabel: string;
  overrideMainRules: boolean;
};

const deriveAdaptiveWeakpointPlan = (
  selectionContext: SelectionContext
): AdaptiveWeakpointPlan | null => {
  const poseTags = selectionContext.poseFocusTags;
  const painAreaTokens = new Set(
    selectionContext.painAreas.map((area) => normalizeTagToken(area))
  );
  const hasUpperPain = ["neck", "shoulders", "upper_back"].some((token) =>
    painAreaTokens.has(token)
  );
  const hasSpinePain = ["lower_back", "low_back"].some((token) =>
    painAreaTokens.has(token)
  );
  const hasLowerPain = ["hips", "knees"].some((token) => painAreaTokens.has(token));
  const hasPoseSignals = poseTags.size > 0;

  let upperScore = 0;
  let coreScore = 0;
  let lowerScore = 0;

  if (
    poseTags.has("scapular_control") ||
    poseTags.has("forward_head") ||
    poseTags.has("thoracic_extension")
  ) {
    upperScore += 2;
    coreScore += 1;
  }
  if (poseTags.has("hip_stability")) {
    lowerScore += 2;
    coreScore += 1;
  }
  if (hasUpperPain) {
    upperScore += 2;
    coreScore += 1;
  }
  if (hasSpinePain) {
    coreScore += 2;
    lowerScore += 1;
  }
  if (hasLowerPain) {
    lowerScore += 2;
    coreScore += 1;
  }
  if (selectionContext.intentProfile.needs.needsScapularControl) upperScore += 1;
  if (selectionContext.intentProfile.needs.needsCoreAntiRotation) coreScore += 1;
  if (selectionContext.intentProfile.needs.needsHipHingeRepattern) lowerScore += 1;
  if (selectionContext.painSeverity === "high") {
    coreScore += 1;
    if (hasUpperPain) upperScore += 1;
    if (hasLowerPain || hasSpinePain) lowerScore += 1;
  }

  const rankedDomains: Array<{ domain: AdaptiveWeakpointDomain; score: number }> = [
    { domain: "coreStability", score: coreScore },
    { domain: "upperPosture", score: upperScore },
    { domain: "lowerStability", score: lowerScore },
  ];
  rankedDomains.sort((left, right) => right.score - left.score);

  const top = rankedDomains[0];
  if (!top) return null;
  const runnerUpScore = rankedDomains[1]?.score ?? 0;
  const decisiveLead = top.score - runnerUpScore >= 2;
  const highPainProfile = selectionContext.painSeverity === "high";
  const mediumPainProfile = selectionContext.painSeverity === "medium";
  const upperEvidence =
    (poseTags.has("scapular_control") ? 1 : 0) +
    (poseTags.has("forward_head") ? 1 : 0) +
    (poseTags.has("thoracic_extension") ? 1 : 0) +
    (hasUpperPain ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsScapularControl ? 1 : 0);
  const coreEvidence =
    (selectionContext.intentProfile.needs.needsCoreAntiRotation ? 1 : 0) +
    (hasSpinePain ? 1 : 0) +
    (poseTags.has("thoracic_extension") ? 1 : 0) +
    (poseTags.has("hip_stability") ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsHipHingeRepattern ? 1 : 0);
  const lowerEvidence =
    (hasLowerPain ? 1 : 0) +
    (hasSpinePain ? 1 : 0) +
    (poseTags.has("hip_stability") ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsHipHingeRepattern ? 1 : 0);
  const evidenceByDomain: Record<AdaptiveWeakpointDomain, number> = {
    upperPosture: upperEvidence,
    coreStability: coreEvidence,
    lowerStability: lowerEvidence,
  };
  const topEvidence = evidenceByDomain[top.domain];
  const shouldAdapt =
    (highPainProfile && top.score >= 4 && topEvidence >= 3 && decisiveLead) ||
    (mediumPainProfile && top.score >= 5 && topEvidence >= 4 && decisiveLead && hasPoseSignals);
  if (!shouldAdapt) return null;
  const overrideMainRules =
    highPainProfile && top.score >= 5 && topEvidence >= 4 && decisiveLead;

  if (top.domain === "upperPosture") {
    return {
      domain: "upperPosture",
      lanes: ["pull", "pull"],
      focusTags: ["upper-back", "scapular", "posture", "thoracic", "core"],
      requiredMainRules: [scapPostureRule],
      requiredAccessories: [
        withAccessorySection(coreRule, 1),
        withAccessorySection(antiRotationRule, 1),
      ],
      optionalRules: [withAccessorySection(carryOrAntiRotationRule, 1)],
      forbiddenMainTags: ["biceps", "triceps", "chest"],
      deprioritizedLabel: "arm and pressing emphasis",
      weakpointLabel: "scapular + posture control",
      overrideMainRules,
    };
  }
  if (top.domain === "lowerStability") {
    return {
      domain: "lowerStability",
      lanes: ["squat", "hinge"],
      focusTags: ["lower", "legs", "glutes", "balance", "core", "stability"],
      requiredMainRules: [],
      requiredAccessories: [
        withAccessorySection(coreRule, 1),
        withAccessorySection(calvesRule, 1),
      ],
      optionalRules: [withAccessorySection(antiRotationRule, 1)],
      forbiddenMainTags: ["chest"],
      deprioritizedLabel: "high-fatigue upper-body volume",
      weakpointLabel: "lower-body balance + hip stability",
      overrideMainRules,
    };
  }
  return {
    domain: "coreStability",
    lanes: ["squat", "hinge"],
    focusTags: ["core", "anti-rotation", "stability", "trunk", "glutes"],
    requiredMainRules: [],
    requiredAccessories: [
      withAccessorySection(coreRule, 1),
      withAccessorySection(antiRotationRule, 1),
    ],
    optionalRules: [withAccessorySection(carryOrAntiRotationRule, 1)],
    forbiddenMainTags: ["biceps", "triceps"],
    deprioritizedLabel: "non-essential isolation volume",
    weakpointLabel: "core alignment + trunk control",
    overrideMainRules,
  };
};

const applyAdaptiveWeakpointTemplateOverlay = (params: {
  templates: SplitTemplateSpec[];
  daysPerWeek: 3 | 4 | 5;
  selectionContext: SelectionContext;
}): SplitTemplateSpec[] => {
  const { templates, daysPerWeek, selectionContext } = params;
  const adaptivePlan = deriveAdaptiveWeakpointPlan(selectionContext);
  if (!adaptivePlan) return templates;

  const targetTitlePriority =
    daysPerWeek === 3
      ? adaptivePlan.domain === "lowerStability"
        ? ["Legs + Abs", "Shoulders + Arms"]
        : adaptivePlan.domain === "upperPosture"
        ? ["Back + Chest", "Shoulders + Arms"]
        : ["Legs + Abs", "Shoulders + Arms"]
      : daysPerWeek === 4
      ? adaptivePlan.domain === "lowerStability"
        ? ["Lower (Squat Emphasis) + Core", "Lower (Hinge Emphasis) + Carry/Anti-rotation"]
        : adaptivePlan.domain === "upperPosture"
        ? ["Upper Pull + Thoracic Posture", "Upper Push + Scapular Control"]
        : ["Lower (Hinge Emphasis) + Carry/Anti-rotation", "Lower (Squat Emphasis) + Core"]
      : adaptivePlan.domain === "lowerStability"
      ? ["Lower Hinge + Posterior Chain", "Lower Squat"]
      : adaptivePlan.domain === "upperPosture"
      ? ["Arms + Posture + Conditioning", "Upper Pull"]
      : ["Arms + Posture + Conditioning", "Lower Hinge + Posterior Chain"];

  const targetIndex = targetTitlePriority
    .map((title) => templates.findIndex((template) => template.title === title))
    .find((index) => typeof index === "number" && index >= 0);
  if (typeof targetIndex !== "number") return templates;

  const adaptiveNote = adaptivePlan.overrideMainRules
    ? `Adaptive rebalance: ${adaptivePlan.deprioritizedLabel} skipped for this cycle. Replaced with ${adaptivePlan.weakpointLabel} to restore balance.`
    : `Adaptive rebalance: ${adaptivePlan.deprioritizedLabel} de-prioritized this cycle. Emphasis shifted to ${adaptivePlan.weakpointLabel} to restore balance.`;
  const overrideMainRules = daysPerWeek !== 4 && adaptivePlan.overrideMainRules;

  return templates.map((template, index) => {
    if (index !== targetIndex) return template;

    return {
      ...template,
      focusTags: dedupeStringValues([...template.focusTags, ...adaptivePlan.focusTags]),
      adaptiveNote,
      constraints: {
        ...template.constraints,
        requiredMainRules: overrideMainRules
          ? dedupeRuleListById([...adaptivePlan.requiredMainRules])
          : template.constraints.requiredMainRules,
        requiredAccessories: dedupeRuleListById([
          ...(template.constraints.requiredAccessories ?? []),
          ...adaptivePlan.requiredAccessories,
        ]),
        optionalRules: dedupeRuleListById([
          ...(template.constraints.optionalRules ?? []),
          ...adaptivePlan.optionalRules,
        ]),
        forbiddenMainTags: dedupeStringValues([
          ...(template.constraints.forbiddenMainTags ?? []),
          ...adaptivePlan.forbiddenMainTags,
        ]),
      },
    };
  });
};

const applyAdaptiveTemplateNote = (
  day: ReturnType<typeof buildStructuredDay>,
  note: string
) => {
  const targetIndex = day.routine.findIndex(
    (item) => item.section === "activation" || item.section === "main"
  );
  if (targetIndex < 0) return day;
  const target = day.routine[targetIndex];
  if (!target) return day;
  const routine = [...day.routine];
  routine[targetIndex] = {
    ...target,
    notes: appendNote(target.notes, note),
  };
  return {
    ...day,
    routine,
  };
};

const getSplitTemplateSpecs = (daysPerWeek: 3 | 4 | 5): SplitTemplateSpec[] => {
  if (daysPerWeek === 3) {
    return [
      {
        title: "Back + Chest",
        focusTags: ["back", "chest", "fly", "push", "pull"],
        lanes: ["push", "pull", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "push", min: 2 },
            { pattern: "pull", min: 1 },
          ],
          requiredAccessories: [
            withAccessorySection(scapPostureRule, 1),
            withAccessorySection(pullBackRule, 1),
          ],
          forbiddenMainTags: ["lateral-delt", "shoulders-isolation"],
          optionalRules: [scapPostureRule],
        },
      },
      {
        title: "Shoulders + Arms",
        focusTags: ["shoulders", "arms", "upper", "lateral_delt", "rear_delt"],
        lanes: ["verticalPush", "push", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "verticalPush", min: 1 },
          ],
          requiredMainRules: [lateralDeltRule],
          requiredAccessories: [
            withAccessorySection(tricepsIsolationRule, 1),
            withAccessorySection(bicepsIsolationRule, 1),
          ],
          forbiddenMainTags: ["chest", "biceps", "triceps"],
        },
      },
      {
        title: "Legs + Abs",
        focusTags: ["legs", "quads", "hamstrings", "core"],
        lanes: ["squat", "hinge", "squat"],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "squat", min: 1 },
            { pattern: "hinge", min: 1 },
          ],
          requiredAccessories: [
            withAccessorySection(coreRule, 1),
            withAccessorySection(calvesRule, 1),
          ],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
    ];
  }

  if (daysPerWeek === 4) {
    return [
      {
        title: "Upper Push + Scapular Control",
        focusTags: ["upper", "push", "shoulders", "triceps", "scapular", "posture"],
        lanes: ["push", "verticalPush"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "push", min: 1 },
            { pattern: "verticalPush", min: 1 },
          ],
          requiredMainRules: [scapPostureRule],
          requiredAccessories: [withAccessorySection(tricepsIsolationRule, 1)],
          optionalRules: [withAccessorySection(coreRule, 1)],
        },
      },
      {
        title: "Lower (Squat Emphasis) + Core",
        focusTags: ["legs", "lower", "squat", "quads", "core", "anti-rotation"],
        lanes: ["squat", "hinge"],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "squat", min: 1 },
            { pattern: "hinge", min: 1 },
          ],
          requiredAccessories: [
            withAccessorySection(coreRule, 1),
            withAccessorySection(calvesRule, 1),
          ],
          forbiddenMainTags: ["push", "chest"],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
      {
        title: "Upper Pull + Thoracic Posture",
        focusTags: ["upper", "pull", "back", "thoracic", "posture", "scapular"],
        lanes: ["pull", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [{ pattern: "pull", min: 2 }],
          requiredMainRules: [scapPostureRule],
          requiredAccessories: [withAccessorySection(bicepsIsolationRule, 1)],
          optionalRules: [withAccessorySection(coreRule, 1)],
        },
      },
      {
        title: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
        focusTags: [
          "legs",
          "lower",
          "hinge",
          "posterior",
          "hamstrings",
          "glutes",
          "core",
          "carry",
          "anti-rotation",
        ],
        lanes: ["hinge", "squat"],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "hinge", min: 1 },
            { pattern: "squat", min: 1 },
          ],
          forbiddenMainTags: ["push", "chest"],
          requiredAccessories: [
            withAccessorySection(carryOrAntiRotationRule, 1),
            withAccessorySection(calvesRule, 1),
          ],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
    ];
  }

  return [
    {
      title: "Upper Push",
      focusTags: ["upper", "push", "chest", "shoulders", "triceps"],
      lanes: ["push", "verticalPush"],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [
          { pattern: "push", min: 1 },
          { pattern: "verticalPush", min: 1 },
        ],
        forbiddenMainTags: ["lateral-delt", "shoulders-isolation"],
        requiredAccessories: [withAccessorySection(tricepsIsolationRule, 1)],
        optionalRules: [scapPostureRule],
      },
    },
    {
      title: "Lower Squat",
      focusTags: ["lower", "legs", "squat", "quads", "core"],
      lanes: ["squat", "squat"],
      warmupFocus: "lower",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "squat", min: 1 },
          { pattern: "hinge", min: 1 },
        ],
        forbiddenMainTags: ["push", "chest"],
        requiredAccessories: [
          withAccessorySection(coreRule, 1),
          withAccessorySection(calvesRule, 1),
        ],
        forbidUpperPushPullOnMainAndAccessory: true,
      },
    },
    {
      title: "Upper Pull",
      focusTags: ["upper", "pull", "back", "biceps", "posture"],
      lanes: ["pull", "pull"],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [{ pattern: "pull", min: 2 }],
        requiredMainRules: [scapPostureRule],
        requiredAccessories: [withAccessorySection(bicepsIsolationRule, 1)],
      },
    },
    {
      title: "Lower Hinge + Posterior Chain",
      focusTags: ["lower", "hinge", "posterior", "hamstrings", "glutes", "core"],
      lanes: ["hinge", "hinge"],
      warmupFocus: "lower",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "hinge", min: 1 },
          { pattern: "squat", min: 1 },
        ],
        forbiddenMainTags: ["push", "chest"],
        requiredAccessories: [
          withAccessorySection(carryOrAntiRotationRule, 1),
          withAccessorySection(calvesRule, 1),
        ],
        forbidUpperPushPullOnMainAndAccessory: true,
      },
    },
    {
      title: "Arms + Posture + Conditioning",
      focusTags: ["arms", "posture", "conditioning", "scapular", "core", "upper"],
      lanes: ["pull", "verticalPush"],
      warmupFocus: "core",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "pull", min: 1 },
          { pattern: "verticalPush", min: 1 },
        ],
        requiredMainRules: [bicepsIsolationRule, tricepsIsolationRule, scapPostureRule],
        requiredAccessories: [withAccessorySection(coreRule, 1)],
        optionalRules: [conditioningRule],
      },
    },
  ];
};

export const previewSplitTemplates = (
  daysPerWeek: 3 | 4 | 5,
  capabilityMode: EquipmentCapabilityMode
) =>
  getSplitTemplateSpecs(daysPerWeek).map((template) => ({
    title: template.title,
    focusTags: [...template.focusTags],
    lanes:
      capabilityMode === "bandOnly"
        ? ensurePullLaneBandOnly([...template.lanes], template.title, template.focusTags)
        : [...template.lanes],
  }));

const buildSplitTemplates = (
  daysPerWeek: 3 | 4 | 5,
  experienceProfile: ExperienceProfile,
  phaseIndex: number,
  available: Set<Equipment>,
  selectionContext: SelectionContext,
  capabilityMode: EquipmentCapabilityMode,
  selectionAuditHook?: ProgramSelectionAuditHook,
  selectionRng?: RandomFn
) => {
  const templates = applyAdaptiveWeakpointTemplateOverlay({
    templates: getSplitTemplateSpecs(daysPerWeek),
    daysPerWeek,
    selectionContext,
  });
  const builtDays: ReturnType<typeof buildStructuredDay>[] = [];
  let priorDayHeavyPatterns: PrimaryMotorPattern[] = [];

  templates.forEach((template) => {
    const builtDayBase = buildStructuredDay({
      title: template.title,
      focusTags: template.focusTags,
      experienceProfile,
      selectionContext,
      daysPerWeek,
      phaseIndex,
      available,
      lanes: template.lanes,
      warmupFocus: template.warmupFocus,
      cooldownFocus: template.cooldownFocus,
      capabilityMode,
      priorDayHeavyPatterns,
      selectionAuditHook,
      selectionRng,
    });
    const builtDay = template.adaptiveNote
      ? applyAdaptiveTemplateNote(builtDayBase, template.adaptiveNote)
      : builtDayBase;
    builtDays.push(builtDay);
    priorDayHeavyPatterns = deriveHeavyPrimaryPatternsForDay(builtDay);
  });

  return builtDays;
};

const attachStructuredPrepBlocksToWeek = (params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  capabilityMode: EquipmentCapabilityMode;
  painAreas: string[];
  painSeverity: PainSeverity;
  goal: string;
  experienceLevel: SelectionContext["experienceLevel"];
  poseFocusTags: Set<string>;
}) =>
  params.week.map((day) => {
    const dayIntent = deriveDayIntentFromProgramDay(day);
    const { warmupBlock, activationBlock, cooldownBlock } = buildWarmupForDay(
      dayIntent,
      params.available,
      params.capabilityMode,
      params.painAreas,
      {
        goal: params.goal,
        experienceLevel: params.experienceLevel,
        poseFocusTags: params.poseFocusTags,
        painSeverity: params.painSeverity,
      }
    );
    return {
      ...day,
      warmup: warmupBlock,
      activation: activationBlock,
      cooldown: cooldownBlock,
    };
  });

const inferSelectionDebugLane = (
  item: ProgramRoutineItem,
  exercise: Exercise
): string | undefined => {
  if (item.section === "main") {
    return getMainLaneHits(exercise)[0];
  }
  if (item.section !== "accessory") return undefined;
  if (matchesAccessoryLanePattern(exercise, "push")) return "push";
  if (matchesAccessoryLanePattern(exercise, "pull")) return "pull";
  if (matchesAccessoryLanePattern(exercise, "lower")) return "lower";
  if (matchesAccessoryLanePattern(exercise, "core")) return "core";
  if (matchesAccessoryLanePattern(exercise, "chest")) return "chest";
  if (matchesAccessoryLanePattern(exercise, "back")) return "back";
  return undefined;
};

const backfillMainAccessorySelectionDebug = (
  week: ProgramDay[],
  phaseIndex: number
): ProgramDay[] =>
  week.map((day) => ({
    ...day,
    routine: day.routine.map((item, itemIndex) => {
      if (item.section !== "main" && item.section !== "accessory") return item;
      if (item.selectionDebug?.source) return item;
      const exercise = exerciseById(item.exerciseId);
      return withSelectionDebug(item, "initial_pick", {
        slotId: makeDaySlotId(day, itemIndex, item.section),
        slotKind: item.section === "main" ? "mainFinal" : "accessoryFinal",
        slotLane: exercise ? inferSelectionDebugLane(item, exercise) : undefined,
        phaseIndex,
      });
    }),
  }));

export const generateWeeklyProgram = (
  data: QuestionnaireData,
  programId: string,
  options?: {
    phaseIndex?: number;
    weekIndex?: number;
    cycleIndex?: number;
    totalWeekIndex?: number;
    trainingState?: ReturnType<typeof deriveUserTrainingState>;
    selectionAuditHook?: ProgramSelectionAuditHook;
    seed?: string;
    poseAnalysis?: PoseAnalysis | null;
    assessmentReport?: AssessmentReport | null;
    recentLogs?: ExerciseLog[];
    previousWeek?: ProgramDay[];
    feedbackSummaryByExercise?: Map<string, ExerciseFeedbackSummary>;
    variation?: ProgramVariationOptions;
  }
): Program => {
  const { resolvedFeedbackSummaryByExercise, recentlyUsedExerciseIds } =
    resolveWeeklyFeedbackInputs({
      recentLogs: options?.recentLogs,
      previousWeek: options?.previousWeek,
      feedbackSummaryByExercise: options?.feedbackSummaryByExercise,
      summarizeFeedbackFromLogs,
      buildRecentlyUsedExerciseIdSet,
    });
  const variationPoseFocusTags = resolveVariationPoseFocusTags({
    poseAnalysis: options?.poseAnalysis,
    assessmentReport: options?.assessmentReport,
    resolvePoseAnalysisFromSources: ({ poseAnalysis, assessmentReport }) =>
      resolvePoseAnalysisFromSources({
        poseAnalysis,
        assessmentReport,
      }),
    derivePoseFocus,
    normalizeTagToken,
  });
  const weeklyRuntimeContext = resolveWeeklyRuntimeContext({
    questionnaire: data,
    feedbackSummaryByExercise: resolvedFeedbackSummaryByExercise,
    recentlyUsedExerciseIds,
    poseFocusTagsForVariation: variationPoseFocusTags,
    phaseIndex: options?.phaseIndex,
    weekIndex: options?.weekIndex,
    totalWeekIndex: options?.totalWeekIndex,
    cycleIndex: options?.cycleIndex,
    seed: options?.seed,
    variation: options?.variation,
    trainingState: options?.trainingState,
    normalizeDaysPerWeek,
    resolveVariationState: resolveProgramVariationState,
    getExperienceProfile,
    getPhaseName: (phaseIndex) => getPhaseMetaByIndex(phaseIndex).phaseName,
    buildSelectionContext: ({
      phaseIndex,
      capabilityMode,
      phaseName,
      feedbackSummaryByExercise,
      recentlyUsedExerciseIds,
      variationState,
    }) =>
      buildSelectionContext(data, options?.poseAnalysis, options?.assessmentReport, {
        phaseIndex,
        capabilityMode,
        phaseName,
        feedbackSummaryByExercise,
        recentlyUsedExerciseIds,
        variationState,
      }),
    createTrainingState: (phaseIndex) =>
      deriveUserTrainingState({
        phaseIndex,
        complianceRate: 0,
        painFlag: data.painAreas.length > 0,
        fatigueFlag: false,
      }),
    buildNextWeekPlan: ({
      phaseName,
      trainingState,
      painSeverity,
      complianceRate,
      painFlag,
      fatigueFlag,
    }) =>
      buildProgramNextWeekPlan({
        complianceRate,
        painFlag,
        fatigueFlag,
        phaseName,
        trainingState,
        painSeverity,
      }),
  });

  let days: ProgramDay[] = [];
  const splitTemplates = buildSplitTemplates(
    weeklyRuntimeContext.normalizedDaysPerWeek,
    weeklyRuntimeContext.experienceProfile,
    weeklyRuntimeContext.phaseIndex,
    weeklyRuntimeContext.availableEquipment,
    weeklyRuntimeContext.selectionContext,
    weeklyRuntimeContext.capabilityMode,
    options?.selectionAuditHook,
    weeklyRuntimeContext.selectionRng
  );
  days = splitTemplates.map((template, dayIndex) => ({ dayIndex, ...template }));

  const timestamp = nowIso();
  const adjustedDays = days.map((day) =>
    adjustRoutineForPhase(
      day,
      weeklyRuntimeContext.phaseIndex,
      weeklyRuntimeContext.cycleIndex,
      data.goals ?? "",
      weeklyRuntimeContext.availableEquipment,
      weeklyRuntimeContext.experienceProfile.level,
      weeklyRuntimeContext.trainingState,
      weeklyRuntimeContext.selectionContext.painSeverity,
      weeklyRuntimeContext.selectionContext
    )
  );

  const deterministicSelectionSeedBase =
    composeWeeklyDeterministicSelectionSeedBase({
      baseSeed: options?.seed,
      phaseIndex: weeklyRuntimeContext.phaseIndex,
      cycleIndex: weeklyRuntimeContext.cycleIndex,
      weekIndex: weeklyRuntimeContext.weekIndex,
      totalWeekIndex: weeklyRuntimeContext.totalWeekIndex,
      daysPerWeek: weeklyRuntimeContext.normalizedDaysPerWeek,
      goal: data.goals ?? "",
      experience: data.experience,
      availableEquipment: weeklyRuntimeContext.availableEquipment,
      painAreas: data.painAreas,
      normalizeTagToken,
      normalizeExperienceLevel,
    });
  const deterministicSelectionSeed = composeWeeklyDeterministicSelectionSeed({
    baseSeed: deterministicSelectionSeedBase,
    variationState: weeklyRuntimeContext.variationState,
  });

  const dayRepairContext: DayConstraintRepairContext = resolveWeeklyRepairContext({
    availableEquipment: weeklyRuntimeContext.availableEquipment,
    selectionContext: weeklyRuntimeContext.selectionContext,
    capabilityMode: weeklyRuntimeContext.capabilityMode,
    selectionSeed: deterministicSelectionSeed,
    selectionRng: weeklyRuntimeContext.selectionRng,
    previousWeek: options?.previousWeek,
  });
  const weeklyPipelineCallbacks = buildWeeklyPipelineCallbacks({
    runtimeContext: weeklyRuntimeContext,
    repairContext: dayRepairContext,
    normalizeWeekForSelectionContext,
    applyFeedbackDrivenSubstitutions,
    applyDayCurriculumConstraints,
    applyFinalFeedbackSafetyPass,
    attachStructuredPrepBlocksToWeek,
  });
  const structuredWeekResult = runWeeklyGenerationPipeline({
    initialWeek: adjustedDays,
    ...weeklyPipelineCallbacks,
  });
  const structuredPrepWeek = backfillMainAccessorySelectionDebug(
    structuredWeekResult.week,
    weeklyRuntimeContext.phaseIndex
  );
  finalizeWeeklyGenerationObservability({
    week: structuredPrepWeek,
    selectionContext: weeklyRuntimeContext.selectionContext,
    available: weeklyRuntimeContext.availableEquipment,
    capabilityMode: weeklyRuntimeContext.capabilityMode,
    selectionAuditHook: options?.selectionAuditHook,
    emitSelectionTrace: emitFinalSelectionTraceForWeek,
    commitVariationSnapshot: commitProgramVariationSnapshot,
  });

  return finalizeWeeklyProgramResult({
    pushWarnings: pushProgramConstraintWarnings,
    programId,
    phaseName: weeklyRuntimeContext.phaseName,
    createdAt: timestamp,
    goalTrack: data.goals ?? null,
    daysPerWeek: weeklyRuntimeContext.normalizedDaysPerWeek,
    phaseIndex: weeklyRuntimeContext.phaseIndex,
    weekIndex: weeklyRuntimeContext.weekIndex,
    totalWeekIndex: weeklyRuntimeContext.totalWeekIndex,
    cycleIndex: weeklyRuntimeContext.cycleIndex,
    nextWeekPlan: weeklyRuntimeContext.nextWeekPlan,
    week: structuredPrepWeek,
    questionnaire: data,
    trainingState: weeklyRuntimeContext.trainingState,
    consistencyRate: 0,
    warnings: structuredWeekResult.warnings,
    templateVersion: PROGRAM_TEMPLATE_VERSION,
  });
};

export const generateNextPhaseProgram = (params: {
  currentProgram: Program;
  questionnaire: QuestionnaireData;
  painFlag: boolean;
  complianceRate: number;
  fatigueFlag: boolean;
  completedSessionsCount?: number;
  completedWeeksCount?: number;
  movementQuality?: number;
  confidence?: number;
  capacity?: number;
  recentLogs?: import("@/lib/types").ExerciseLog[];
  feedbackSummaryByExercise?: Map<string, ExerciseFeedbackSummary>;
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
  nextProgramId: string;
  seed?: string;
}) => {
  const {
    currentProgram,
    questionnaire,
    painFlag,
    complianceRate,
    fatigueFlag,
    completedSessionsCount,
    completedWeeksCount,
    movementQuality,
    confidence,
    capacity,
    recentLogs = [],
    feedbackSummaryByExercise,
    poseAnalysis,
    assessmentReport,
    nextProgramId,
    seed,
  } = params;

  const progressionState = deriveProgramProgressionState({
    currentProgram,
    complianceRate,
    painFlag,
    fatigueFlag,
    movementQuality,
    confidence,
    capacity,
  });
  const phaseDecision = evaluateNextPhaseProgression({
    currentProgram,
    progressionState,
    completedSessionsCount,
    completedWeeksCount,
    minimumWeeksForPhaseAdvance: MIN_WEEKS_FOR_PHASE_ADVANCE,
  });
  if (phaseDecision.status !== "advanced") return phaseDecision;

  const nextTarget = phaseDecision.target;
  const { resolvedFeedbackSummaryByExercise, recentlyUsedExerciseIds } =
    resolveProgressionFeedbackInputs({
      currentProgram,
      recentLogs,
      feedbackSummaryByExercise,
      summarizeFeedbackFromLogs,
      buildRecentlyUsedExerciseIdSet,
    });

  const phaseProgram = buildBaseProgressedProgram({
    currentWeek: currentProgram.week,
    target: nextTarget,
    buildProgramForTarget: (target) =>
      generateWeeklyProgram(questionnaire, nextProgramId, {
        phaseIndex: target.phaseIndex,
        weekIndex: target.weekIndex,
        cycleIndex: target.cycleIndex,
        totalWeekIndex: target.totalWeekIndex,
        trainingState: progressionState.trainingState,
        seed,
        poseAnalysis,
        assessmentReport,
        recentLogs,
        previousWeek: currentProgram.week,
        feedbackSummaryByExercise: resolvedFeedbackSummaryByExercise,
      }),
    retryWithCycleIndexOnSameWeek: 2,
  });
  const phaseRuntimeContext = resolveProgressionRuntimeContext({
    questionnaire,
    program: phaseProgram,
    target: nextTarget,
    feedbackSummaryByExercise: resolvedFeedbackSummaryByExercise,
    recentlyUsedExerciseIds,
    buildSelectionContext: ({
      phaseIndex,
      phaseName,
      capabilityMode,
      feedbackSummaryByExercise,
      recentlyUsedExerciseIds,
    }) =>
      buildSelectionContext(questionnaire, poseAnalysis, assessmentReport, {
        phaseIndex,
        phaseName,
        capabilityMode,
        feedbackSummaryByExercise,
        recentlyUsedExerciseIds,
      }),
    getPhaseName: (phaseIndex) => getPhaseMetaByIndex(phaseIndex).phaseName,
    normalizeDaysPerWeek,
  });
  const phasePipelineCallbacks = buildProgressionPipelineCallbacks({
    questionnairePainAreas: questionnaire.painAreas,
    previousWeek: currentProgram.week,
    trainingState: progressionState.trainingState,
    experienceLevel: getExperienceProfile(
      questionnaire.experience,
      questionnaire.goals
    ).level,
    enforceMaterialWeekChange,
    remapWeekForProgressiveNovelty,
    enforceProgressiveDemand,
    dedupeWeekForSelectionContext,
    applyDayCurriculumConstraints,
    normalizeWeekForSelectionContext,
    attachStructuredPrepBlocksToWeek,
    extraRepair: ensureWeekHasProgressiveChestPushMain,
  });
  const progressedPhaseResult = runApprovedProgressionPipeline({
    currentWeek: currentProgram.week,
    proposedProgram: phaseProgram,
    questionnaire,
    runtimeContext: phaseRuntimeContext,
    ...phasePipelineCallbacks,
  });
  const structuredPhaseWeek = backfillMainAccessorySelectionDebug(
    progressedPhaseResult.week,
    phaseRuntimeContext.resolvedTarget.phaseIndex
  );
  const optimizedPhase = progressedPhaseResult.optimizerResult;
  const painSeverity = getPainSeverity(questionnaire);

  return finalizeAdvancedProgressionResult({
    pushWarnings: pushProgramConstraintWarnings,
    warnings: progressedPhaseResult.warnings,
    program: phaseProgram,
    questionnaire,
    phaseIndex: phaseRuntimeContext.resolvedTarget.phaseIndex,
    cycleIndex: phaseRuntimeContext.resolvedTarget.cycleIndex,
    weekIndex: phaseRuntimeContext.resolvedTarget.weekIndex,
    week: structuredPhaseWeek,
    complianceRate,
    painFlag,
    fatigueFlag,
    painSeverity,
    trainingState: progressionState.trainingState,
    recentLogs,
    optimizerResult: optimizedPhase,
  });
};

export const generateNextCycleProgram = (params: {
  currentProgram: Program;
  questionnaire: QuestionnaireData;
  painFlag: boolean;
  complianceRate: number;
  fatigueFlag: boolean;
  completedSessionsCount?: number;
  completedWeeksCount?: number;
  movementQuality?: number;
  confidence?: number;
  capacity?: number;
  recentLogs?: import("@/lib/types").ExerciseLog[];
  feedbackSummaryByExercise?: Map<string, ExerciseFeedbackSummary>;
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
  nextProgramId: string;
  seed?: string;
}) => {
  const {
    currentProgram,
    questionnaire,
    painFlag,
    complianceRate,
    fatigueFlag,
    completedSessionsCount,
    completedWeeksCount,
    movementQuality,
    confidence,
    capacity,
    recentLogs = [],
    feedbackSummaryByExercise,
    poseAnalysis,
    assessmentReport,
    nextProgramId,
    seed,
  } = params;

  const progressionState = deriveProgramProgressionState({
    currentProgram,
    complianceRate,
    painFlag,
    fatigueFlag,
    movementQuality,
    confidence,
    capacity,
  });
  const cycleDecision = evaluateNextCycleProgression({
    currentProgram,
    progressionState,
    complianceRate,
    completedSessionsCount,
    completedWeeksCount,
    minimumWeeksForPhaseAdvance: MIN_WEEKS_FOR_PHASE_ADVANCE,
  });
  if (cycleDecision.status !== "advanced") return cycleDecision;

  const nextTarget = cycleDecision.target;
  const { resolvedFeedbackSummaryByExercise, recentlyUsedExerciseIds } =
    resolveProgressionFeedbackInputs({
      currentProgram,
      recentLogs,
      feedbackSummaryByExercise,
      summarizeFeedbackFromLogs,
      buildRecentlyUsedExerciseIdSet,
    });

  const program = buildBaseProgressedProgram({
    currentWeek: currentProgram.week,
    target: nextTarget,
    buildProgramForTarget: (target) =>
      generateWeeklyProgram(questionnaire, nextProgramId, {
        phaseIndex: target.phaseIndex,
        weekIndex: target.weekIndex,
        cycleIndex: target.cycleIndex,
        totalWeekIndex: target.totalWeekIndex,
        trainingState: progressionState.trainingState,
        seed,
        poseAnalysis,
        assessmentReport,
        recentLogs,
        previousWeek: currentProgram.week,
        feedbackSummaryByExercise: resolvedFeedbackSummaryByExercise,
      }),
  });
  const cycleRuntimeContext = resolveProgressionRuntimeContext({
    questionnaire,
    program,
    target: nextTarget,
    feedbackSummaryByExercise: resolvedFeedbackSummaryByExercise,
    recentlyUsedExerciseIds,
    buildSelectionContext: ({
      phaseIndex,
      phaseName,
      capabilityMode,
      feedbackSummaryByExercise,
      recentlyUsedExerciseIds,
    }) =>
      buildSelectionContext(questionnaire, poseAnalysis, assessmentReport, {
        phaseIndex,
        phaseName,
        capabilityMode,
        feedbackSummaryByExercise,
        recentlyUsedExerciseIds,
      }),
    getPhaseName: (phaseIndex) => getPhaseMetaByIndex(phaseIndex).phaseName,
    normalizeDaysPerWeek,
  });
  const cyclePipelineCallbacks = buildProgressionPipelineCallbacks({
    questionnairePainAreas: questionnaire.painAreas,
    previousWeek: currentProgram.week,
    trainingState: progressionState.trainingState,
    experienceLevel: getExperienceProfile(
      questionnaire.experience,
      questionnaire.goals
    ).level,
    enforceMaterialWeekChange,
    remapWeekForProgressiveNovelty,
    enforceProgressiveDemand,
    dedupeWeekForSelectionContext,
    applyDayCurriculumConstraints,
    normalizeWeekForSelectionContext,
    attachStructuredPrepBlocksToWeek,
  });
  const progressedCycleResult = runApprovedProgressionPipeline({
    currentWeek: currentProgram.week,
    proposedProgram: program,
    questionnaire,
    runtimeContext: cycleRuntimeContext,
    ...cyclePipelineCallbacks,
  });
  const structuredCycleWeek = backfillMainAccessorySelectionDebug(
    progressedCycleResult.week,
    cycleRuntimeContext.resolvedTarget.phaseIndex
  );
  const optimizedCycle = progressedCycleResult.optimizerResult;
  const painSeverity = getPainSeverity(questionnaire);

  return finalizeAdvancedProgressionResult({
    pushWarnings: pushProgramConstraintWarnings,
    warnings: progressedCycleResult.warnings,
    program,
    questionnaire,
    phaseIndex: cycleRuntimeContext.resolvedTarget.phaseIndex,
    cycleIndex: cycleRuntimeContext.resolvedTarget.cycleIndex,
    weekIndex: cycleRuntimeContext.resolvedTarget.weekIndex,
    week: structuredCycleWeek,
    complianceRate,
    painFlag,
    fatigueFlag,
    painSeverity,
    trainingState: progressionState.trainingState,
    recentLogs,
    optimizerResult: optimizedCycle,
  });
};
