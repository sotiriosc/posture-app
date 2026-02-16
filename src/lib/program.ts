import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { ExerciseLog, Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";
import type { Exercise, ExerciseCategory } from "@/lib/exercises";
import { exerciseById, exercises, resolveExerciseHistoryIds } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import {
  isExerciseEligible,
  normalizeEquipmentSelection,
} from "@/lib/equipment";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import { derivePoseFocus } from "@/lib/engine/poseFocus";
import {
  MAX_PHASE_INDEX,
  buildNextWeekPlan,
  decideProgramProgression,
  deriveUserTrainingState,
  getCycleLadder,
  getPhaseMetaByIndex,
  getPhaseProfile,
} from "@/lib/phases";
import type { UserTrainingState } from "@/lib/phases";
import { optimizePhaseWeek } from "@/lib/phaseOptimizer";
import { buildMovementProfile } from "@/lib/movementProfile";
import { buildPhaseObjective } from "@/lib/phaseObjectives";
import type { ExerciseFeedbackSummary } from "@/lib/logStore";
import type { PoseAnalysis, PoseMetrics } from "@/lib/poseAnalyzer";
import { createSeededRng, type RandomFn } from "@/lib/seededRng";
import { buildSessionAdaptation } from "@/lib/sessionAdaptation";

const nowIso = () => new Date().toISOString();
const MIN_WEEKS_FOR_PHASE_ADVANCE = 2;
export const PROGRAM_TEMPLATE_VERSION = 11;
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
  feedbackPenaltyHints: Array<{
    exerciseId: string;
    movementPatterns: Set<string>;
    movementSignature: string;
  }>;
};

const normalizeTagToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

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
    feedbackPenaltyHints,
  };
};

const getExperienceProfile = (
  experience: string,
  goal: string
): ExperienceProfile => {
  const level: ExperienceLevel =
    experience === "Advanced"
      ? "Advanced"
      : experience === "Intermediate"
      ? "Intermediate"
      : "Beginner";

  const painBias = goal === "Reduce pain";

  if (level === "Advanced") {
    return {
      level,
      mainSets: painBias ? "3" : "4-5",
      accessorySets: painBias ? "2-3" : "3-4",
      mainRepRange: painBias ? "6-10" : "4-8",
      accessoryRepRange: painBias ? "8-12" : "8-15",
      mainRestSec: painBias ? 90 : 105,
      accessoryRestSec: painBias ? 60 : 75,
      warmupSets: "2",
      cooldownSets: "2",
      mainLaneCount: 4,
      accessoryCount: 3,
      allowAdvancedCompounds: true,
    };
  }

  if (level === "Intermediate") {
    return {
      level,
      mainSets: painBias ? "2-3" : "3-4",
      accessorySets: "2-3",
      mainRepRange: "6-10",
      accessoryRepRange: "8-12",
      mainRestSec: 90,
      accessoryRestSec: 60,
      warmupSets: "2",
      cooldownSets: "2",
      mainLaneCount: 3,
      accessoryCount: 2,
      allowAdvancedCompounds: true,
    };
  }

  return {
    level,
    mainSets: "2-3",
    accessorySets: "2",
    mainRepRange: "8-12",
    accessoryRepRange: "10-15",
    mainRestSec: 75,
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

const buildProgramIntelligence = (params: {
  questionnaire: QuestionnaireData;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  week: ProgramDay[];
  consistencyRate: number;
  recentLogs?: import("@/lib/types").ExerciseLog[];
  trainingState?: ReturnType<typeof deriveUserTrainingState>;
  optimizerReport?: {
    changedSlots: number;
    totalSlots: number;
  };
}) => {
  const {
    questionnaire,
    phaseIndex,
    cycleIndex,
    weekIndex,
    week,
    consistencyRate,
    recentLogs = [],
    trainingState,
    optimizerReport,
  } = params;

  const movementProfile = buildMovementProfile({
    questionnaire,
    recentLogs,
    consistencyRate,
  });
  const phaseObjective = buildPhaseObjective({
    phaseIndex,
    cycleIndex,
    weekIndex,
    movementProfile,
  });
  const sessionAdaptation = buildSessionAdaptation({
    movementProfile,
    trainingState,
    changedSlots: optimizerReport?.changedSlots ?? 0,
    totalSlots: optimizerReport?.totalSlots ?? 0,
    week,
  });

  return {
    movementProfile,
    phaseObjective,
    sessionAdaptation,
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
  selectionContext?: SelectionContext
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
  const fallback =
    ranked[0]?.exercise ??
    pickBaselineFallbackExercise(
      exercise.category,
      exercise.loadType,
      available,
      item.section,
      selectionContext
    );
  if (!fallback) return item;
  return {
    ...item,
    exerciseId: fallback.id,
    loadType: fallback.loadType,
    cues: fallback.cues ?? null,
  };
};

const pickDistinctReplacement = (params: {
  item: ProgramRoutineItem;
  usedIds: Set<string>;
  available: Set<Equipment>;
  context?: SelectionContext;
}) => {
  const { item, usedIds, available, context } = params;
  const current = exerciseById(item.exerciseId);
  if (!current) return null;

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
              })
            : isExerciseEligible(candidate, available) &&
              isExerciseAllowedForSection(candidate, item.section))
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
          })
        : !isExerciseEligible(candidate, available) ||
          !isExerciseAllowedForSection(candidate, item.section)
    ) {
      return false;
    }
    if (candidate.category !== current.category) return false;
    return true;
  });
  const overlapPool = pool.filter((candidate) =>
    candidate.movementPattern.some((pattern) => current.movementPattern.includes(pattern))
  );
  return overlapPool[0] ?? pool[0] ?? null;
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
      usedIds,
      available,
      context,
    });
    if (!replacement) {
      return item;
    }
    usedIds.add(replacement.id);
    return {
      ...item,
      exerciseId: replacement.id,
      loadType: replacement.loadType,
      cues: replacement.cues,
    };
  });
  return { ...day, routine };
};

const makeItem = (
  exerciseId: string,
  sets: string | number,
  reps?: string,
  durationSec?: number,
  restSec?: number,
  section?: ProgramRoutineItem["section"]
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
    cues: exercise?.cues ?? null,
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
    "extension",
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
  replacement: Exercise
) => {
  const routine = [...day.routine];
  const current = routine[itemIndex];
  if (!current) return day;
  routine[itemIndex] = {
    ...current,
    exerciseId: replacement.id,
    loadType: replacement.loadType,
    cues: replacement.cues,
  };
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

const shoulderVerticalRule = anyOfRule("shoulders_vertical", "shoulders/vertical push", [
  rule("vertical_push_pattern", "vertical push pattern", {
    movementPatternsAny: ["verticalpush"],
  }),
  rule("shoulders_tag", "shoulders", {
    tagsAny: ["shoulders", "vertical"],
    muscleGroupsAny: ["shoulders"],
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
          replacementResult.replacement
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
      desiredRules.push(rowPullMainRule, secondaryPullAngleMainRule);
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

  const mainEntries = buildDayEntries(day).filter((entry) => entry.item.section === "main");
  if (!mainEntries.length) return day;
  if (mainEntries.some((entry) => entry.exercise.equipment.includes("dumbbells"))) return day;

  const usedIds = new Set(day.routine.map((item) => item.exerciseId));
  const candidatesByTarget = mainEntries
    .map((entry) => {
      const overlapPatterns = new Set(
        entry.exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
      );
      const usedWithoutCurrent = new Set(usedIds);
      usedWithoutCurrent.delete(entry.exercise.id);
      const slotLane = getMainLaneHits(entry.exercise)[0] ?? "pull";
      const slotKind = slotKindByMainLane[slotLane];

      const bestCandidate = exercises
        .filter((candidate) => {
          if (candidate.category !== "main") return false;
          if (!candidate.equipment.includes("dumbbells")) return false;
          if (usedWithoutCurrent.has(candidate.id)) return false;
          if (
            !candidate.movementPattern.some((pattern) =>
              overlapPatterns.has(normalizeTagToken(pattern))
            )
          ) {
            return false;
          }
          return isExerciseEligibleForProgramContext({
            exercise: candidate,
            available: context.available,
            section: "main",
            context: context.selectionContext,
          });
        })
        .map((candidate) => {
          const detail = scoreExerciseForContextDetailed(
            candidate,
            "main",
            context.selectionContext,
            context.available,
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
          return {
            candidate,
            score:
              detail.score +
              capabilityBonus.bonus +
              focusOverlapScore(candidate, day.focusTags),
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
  return replaceDayItemExercise(day, target.entryIndex, target.candidate);
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
      bicepsDays: 2,
      tricepsDays: 2,
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
      Math.max(3, day.routine.filter((item) => item.section === "accessory").length),
    ])
  );

  const contract = getWeeklyCoverageContract(daysPerWeek);
  const intentProfile = context.selectionContext.intentProfile;
  const lowerDayIndexes = pickCoverageDayIndexes({
    week: nextWeek,
    matchRule: calvesRule,
    preferLower: true,
    preferArms: false,
  });
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
    dayIndexes: [...lowerDayIndexes, ...corePriorityIndexes],
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
    dayIndexes: [...corePriorityIndexes, ...lowerDayIndexes, ...upperDayIndexes],
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
      dayIndexes: [...lowerDayIndexes, ...corePriorityIndexes, ...upperDayIndexes],
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
      dayIndexes: [...upperDayIndexes, ...corePriorityIndexes, ...lowerDayIndexes],
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
  lower: ["core"],
  core: ["pull", "lower"],
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
        cues: replacement.cues ?? null,
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
        cues: replacement.cues ?? null,
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
        cues: replacement.cues ?? null,
      };
    });

    return ensureDistinctRoutine(
      { ...day, routine },
      context.available,
      context.selectionContext
    );
  });
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
  const persistentWarnings: WeekConstraintRepairResult["warnings"] = [];
  weeklyRepaired.week.forEach((day) => {
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
    week: weeklyRepaired.week,
    warnings: [...accumulatedWarnings, ...persistentWarnings, ...weeklyRepaired.warnings],
  };
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
  "dead-bug": { phase2: "plank", phase3: "plank" },
  "bird-dog": { phase3: "plank" },
  "bodyweight-squat": { phase2: "split-squat", phase3: "split-squat" },
  "incline-pushup": { phase2: "dumbbell-floor-press", phase3: "dumbbell-bench-press" },
  "band-chest-press": { phase2: "dumbbell-floor-press", phase3: "dumbbell-bench-press" },
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
  "glute-bridges": ["hip-hinge-drill", "single-leg-rdl"],
  "dead-bug": ["bird-dog", "plank"],
  "face-pull": ["reverse-snow-angel", "band-pull-aparts"],
  "pallof-press": ["plank", "dead-bug"],
  "bodyweight-squat": ["split-squat"],
  "dumbbell-floor-press": ["dumbbell-bench-press", "dumbbell-chest-fly"],
  "dumbbell-bench-press": ["dumbbell-chest-fly", "dumbbell-shoulder-press"],
  "dumbbell-shoulder-press": ["dumbbell-lateral-raise", "pike-pushup"],
  "band-chest-press": ["incline-pushup", "pushup", "dumbbell-floor-press"],
  "band-overhead-press": ["dumbbell-shoulder-press", "pike-pushup"],
  "band-rdl": ["single-leg-rdl", "bodyweight-good-morning"],
  "back-extension": ["bodyweight-good-morning", "single-leg-rdl"],
  "band-front-squat": ["split-squat", "heels-elevated-squat"],
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
  if (section === "accessory")
    return exercise.category === "activation" || exercise.category === "main";
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
  if (phaseStageRank[currentStage] < phaseStageRank[minimumStage]) {
    return false;
  }

  const inActivation = currentStage === "activation";
  if (inActivation && isDeadliftLikeExercise(exercise)) {
    // Deadlift/RDL variants are intentionally deferred until skill/growth.
    return false;
  }

  const isBeginnerOrIntermediate =
    context.experienceLevel === "beginner" ||
    context.experienceLevel === "intermediate";
  if (inActivation && isBeginnerOrIntermediate) {
    if (exercise.difficultyTier === "hard") return false;
    if (isHingeLoadPatternExercise(exercise)) return false;
  }

  return true;
};

const isExerciseEligibleForProgramContext = (params: {
  exercise: Exercise;
  available: Set<Equipment>;
  section?: ProgramRoutineItem["section"];
  context: SelectionContext;
}) => {
  const { exercise, available, section, context } = params;
  const intent = context.intentProfile;
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
    return false;
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
  "dumbbell-floor-press": ["dumbbell-bench-press", "dumbbell-chest-fly"],
  "dumbbell-rows": ["split-stance-row", "band-row"],
  "glute-bridges": ["single-leg-hip-thrust", "single-leg-rdl"],
  "back-extension": ["single-leg-rdl", "band-rdl"],
  "bodyweight-squat": ["split-squat"],
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
        cues: upgrade.cues,
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
      cues: variant?.cues ?? item.cues,
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
        cues: nextExercise.cues,
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
    const upgradedId = upgradeExerciseId(
      item.exerciseId,
      phaseIndex,
      available,
      selectionContext
    );
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
      cues: upgradedExercise?.cues ?? item.cues,
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
  const token = `${exercise.id} ${exercise.name}`.toLowerCase();

  if (lane === "push") {
    return (
      patterns.has("push") ||
      patterns.has("verticalpush") ||
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
  const expandedLanes = seedLanes.length ? [...seedLanes] : [fallbackLane];
  while (expandedLanes.length < Math.max(1, mainCount)) {
    const nextIndex = expandedLanes.length % Math.max(1, seedLanes.length);
    expandedLanes.push(seedLanes[nextIndex] ?? seedLanes[0] ?? fallbackLane);
  }
  return expandedLanes.slice(0, mainCount);
};

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

const hasVerticalPullSignature = (exercise: Exercise) => {
  const hasPullPattern = exercise.movementPattern.some(
    (pattern) => normalizeTagToken(pattern) === "pull"
  );
  if (!hasPullPattern) return false;
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
  return (
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
    (slotKind === "mainPull" || slotKind === "mainHinge") &&
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
  selectedExercises.forEach((selected) => {
    selected.movementPattern.forEach((pattern) => {
      const token = normalizeTagToken(pattern);
      selectedPatternCounts.set(token, (selectedPatternCounts.get(token) ?? 0) + 1);
    });
  });

  const candidatePatternTokens = new Set(
    exercise.movementPattern.map((pattern) => normalizeTagToken(pattern))
  );

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
  auditMeta?: SelectionAuditMeta;
}): ScoreWithReasons => {
  const { exercise, section, context, auditMeta } = params;
  let score = 0;
  const reasons: string[] = [];
  const role = deriveExerciseRole(exercise);
  const patterns = new Set(exercise.movementPattern.map(normalizeTagToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeTagToken));

  if (section === "main" && auditMeta?.slotLane) {
    if (matchesMainLanePattern(exercise, auditMeta.slotLane)) {
      score += 3;
      reasons.push(`+3 lane match (${auditMeta.slotLane})`);
    } else {
      score -= 2;
      reasons.push(`-2 lane mismatch (${auditMeta.slotLane})`);
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
      score += 2;
      reasons.push("+2 activation control bias");
    }
    if (
      tags.has("scap") ||
      tags.has("core") ||
      tags.has("tva") ||
      tags.has("stability") ||
      tags.has("control")
    ) {
      score += 1;
      reasons.push("+1 activation stability/control emphasis");
    }
    if (
      role === "mainStrength" &&
      (exercise.loadType === "weighted" || exercise.movementIntensity === "load")
    ) {
      score -= context.experienceLevel === "beginner" ? 4 : 3;
      reasons.push("-3 to -4 activation load penalty");
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
    if (dayTitle.includes("back + chest") && isShoulderIsolationExercise(exercise)) {
      score -= 8;
      reasons.push("-8 misplaced shoulder isolation main on Back + Chest");
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

  return { score, reasons };
};

const scoreExerciseForContextDetailed = (
  exercise: Exercise,
  section: ProgramRoutineItem["section"] | undefined,
  context: SelectionContext,
  available: Set<Equipment>,
  auditMeta?: SelectionAuditMeta
): ScoreWithReasons => {
  let score = 0;
  const reasons: string[] = [];

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

  const rankedEligible = (safeEligible.length ? safeEligible : eligible)
    .sort((left, right) => {
      return right.score - left.score;
    });

  const canCaptureAudit =
    process.env.NODE_ENV !== "production" &&
    section === "main" &&
    Boolean(auditMeta) &&
    (DEBUG_AUDIT_SELECTION || Boolean(auditMeta?.selectionAuditHook));

  if (!rankedEligible.length) return candidates[candidates.length - 1];

  const maybeSeededTiePick = () => {
    const rng = auditMeta?.selectionRng;
    if (!rng) return null;
    const topBaseScore = rankedEligible[0]?.baseScore;
    if (typeof topBaseScore !== "number") return null;
    const tied = rankedEligible.filter(
      (entry) => Math.abs(entry.baseScore - topBaseScore) < 1e-9
    );
    if (tied.length <= 1) return null;
    const selectedIndex = Math.floor(rng() * tied.length);
    return tied[Math.max(0, Math.min(tied.length - 1, selectedIndex))] ?? null;
  };

  const chosenEntry = maybeSeededTiePick() ?? rankedEligible[0];

  if (canCaptureAudit && auditMeta) {
    const top = rankedEligible.slice(0, 5).map((entry) => ({
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
    if (DEBUG_AUDIT_SELECTION) {
      selectionAuditBuffer.push(payload);
      if (selectionAuditBuffer.length > 500) {
        selectionAuditBuffer.shift();
      }
    }
    auditMeta.selectionAuditHook?.(payload);
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

const choosePushCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    phaseIndex >= 3 && experience.allowAdvancedCompounds
      ? [
          "db-bench-press",
          "incline-db-press",
          "dumbbell-bench-press",
          "dumbbell-floor-press",
          "band-overhead-press",
          "pseudo-planche-pushup",
          "archer-pushup",
          "band-chest-press",
          "pushup",
          "incline-pushup",
        ]
      : phaseIndex >= 2
      ? [
          "db-bench-press",
          "incline-db-press",
          "dumbbell-floor-press",
          "dumbbell-bench-press",
          "band-overhead-press",
          "band-chest-press",
          "pushup",
          "incline-pushup",
        ]
      : ["db-bench-press", "incline-db-press", "incline-pushup", "band-chest-press", "pushup"],
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
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? ["db-overhead-press", "dumbbell-shoulder-press", "pike-pushup", "scapular-pushups"]
      : ["db-overhead-press", "pike-pushup", "scapular-pushups", "incline-pushup"],
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
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? [
          "lat-pulldown",
          "seated-cable-row",
          "dumbbell-rows",
          "band-lat-pulldown",
          "band-row",
          "split-stance-row",
          "prone-swimmer",
          "back-widow",
          "reverse-snow-angel",
          "face-pull",
        ]
      : [
          "lat-pulldown",
          "seated-cable-row",
          "band-lat-pulldown",
          "band-row",
          "split-stance-row",
          "dumbbell-rows",
          "back-widow",
          "face-pull",
          "reverse-snow-angel",
        ],
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
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? [
          "goblet-squat",
          "db-split-squat",
          "db-step-up",
          "shrimp-squat",
          "cossack-squat",
          "split-squat",
          "heels-elevated-squat",
          "bodyweight-squat",
        ]
      : [
          "goblet-squat",
          "db-split-squat",
          "db-step-up",
          "band-front-squat",
          "bodyweight-squat",
          "split-squat",
          "heels-elevated-squat",
          "cossack-squat",
        ],
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
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? [
          "db-rdl",
          "hip-thrust",
          "band-rdl",
          "back-extension",
          "single-leg-rdl",
          "single-leg-hip-thrust",
          "single-leg-glute-bridge-hold",
          "bodyweight-good-morning",
        ]
      : [
          "db-rdl",
          "hip-thrust",
          "band-rdl",
          "back-extension",
          "bodyweight-good-morning",
          "single-leg-rdl",
          "single-leg-hip-thrust",
          "single-leg-glute-bridge-hold",
        ],
    available,
    context,
    "main",
    auditMeta
  );

const chooseAccessoryId = (
  lane: "push" | "pull" | "lower" | "core",
  available: Set<Equipment>,
  context: SelectionContext,
  auditMeta?: SelectionAuditMeta
) =>
  pickFirstEligibleId(
    lane === "push"
      ? ["dumbbell-lateral-raise", "dumbbell-chest-fly", "band-pull-aparts", "scapular-pushups"]
      : lane === "pull"
      ? ["face-pull", "prone-ytw", "band-lat-pulldown", "band-pull-aparts", "reverse-snow-angel"]
      : lane === "lower"
      ? [
          "suitcase-carry",
          "farmers-carry",
          "band-suitcase-march",
          "suitcase-hold-march",
          "band-rdl",
          "hip-hinge-drill",
          "glute-bridges",
          "band-front-squat",
          "bodyweight-squat",
          "cossack-squat",
        ]
      : [
          "suitcase-carry",
          "farmers-carry",
          "band-suitcase-march",
          "suitcase-hold-march",
          "band-woodchop",
          "side-plank",
          "side-plank-star",
          "hollow-body-hold",
          "pallof-press",
          "dead-bug",
          "plank",
          "bird-dog",
        ],
    available,
    context,
    "accessory",
    auditMeta
  );

type MainLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";
type AccessoryLane = "push" | "pull" | "lower" | "core";
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
};

type DayPatternBudget = {
  mainMin?: Partial<Record<MainLane, number>>;
  mainMax?: Partial<Record<MainLane, number>>;
  accessoryMax?: number;
  requiresCarryOrAntiRotation?: boolean;
  requiresArmIsolation?: boolean;
};

const DEBUG_AUDIT_SELECTION = false;

export type ProgramSelectionAuditCandidate = {
  exerciseId: string;
  name: string;
  score: number;
  reasons: string[];
};

export type ProgramSelectionAuditEntry = {
  slotId: string;
  dayTitle: string;
  slotKind: string;
  capabilityMode: EquipmentCapabilityMode;
  chosen: ProgramSelectionAuditCandidate;
  top: ProgramSelectionAuditCandidate[];
};

type ProgramSelectionAuditHook = (entry: ProgramSelectionAuditEntry) => void;

const selectionAuditBuffer: ProgramSelectionAuditEntry[] = [];

export const getProgramSelectionAuditBuffer = () => [...selectionAuditBuffer];

export const clearProgramSelectionAuditBuffer = () => {
  selectionAuditBuffer.length = 0;
};

export type ProgramConstraintWarning = {
  programId: string;
  phaseName: string | null;
  dayTitle: string;
  kind: "missing" | "violation" | "coverage";
  message: string;
};

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
  dayTitle: string;
  dayFocusTags: string[];
  slotKind: string;
  slotLane?: MainLane;
  selectedMainExerciseIds?: string[];
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
    return {
      mainMin: { pull: 1, push: 1 },
      mainMax: { verticalPush: 0 },
    };
  }

  if (normalized === "shoulders + arms") {
    return {
      mainMin: { verticalPush: 1, pull: 1 },
      mainMax: {
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

const buildStructuredDay = (params: {
  title: string;
  focusTags: string[];
  experienceProfile: ExperienceProfile;
  selectionContext: SelectionContext;
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
    section: ProgramRoutineItem["section"]
  ) => {
    if (!used.has(id)) {
      used.add(id);
      return id;
    }
    const current = exerciseById(id);
    const fallbackFromList = fallbackCandidates.find((candidateId) => {
      const candidate = exerciseById(candidateId);
      if (!candidate) return false;
      if (used.has(candidate.id)) return false;
      if (
        !isExerciseEligibleForProgramContext({
          exercise: candidate,
          available,
          section,
          context: selectionContext,
        })
      ) {
        return false;
      }
      return true;
    });
    if (fallbackFromList) {
      used.add(fallbackFromList);
      return fallbackFromList;
    }

    const pool = exercises
      .filter((candidate) => {
        if (used.has(candidate.id)) return false;
        if (
          !isExerciseEligibleForProgramContext({
            exercise: candidate,
            available,
            section,
            context: selectionContext,
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
    return next;
  };

  const warmupId = pickUnique(
    chooseWarmupId(warmupFocus, available, selectionContext),
    ["cat-cow", "thoracic-rotation", "wall-slides"],
    "warmup"
  );
  const seedLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly([...lanes], title, focusTags)
      : [...lanes];
  const dayBudget = resolveDayPatternBudget({
    title,
    selectionContext,
  });
  const expandedLanes = seedLanes.length ? [...seedLanes] : (["pull"] as MainLane[]);
  const targetMainSlotCount = Math.max(seedLanes.length, experienceProfile.mainLaneCount);

  // Keep non-extra mains inside the day's intended lanes instead of leaking to other patterns.
  while (expandedLanes.length < targetMainSlotCount) {
    const nextIndex = expandedLanes.length % Math.max(1, seedLanes.length);
    expandedLanes.push(seedLanes[nextIndex] ?? seedLanes[0] ?? "pull");
  }
  const plannedLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly(expandedLanes, title, focusTags)
      : expandedLanes;
  const normalizedTitle = normalizeSlotToken(title);
  const plannedMainSlots: PlannedMainSlot[] = plannedLanes.map((lane, index) => ({
    slotId: `${normalizedTitle}-main-${index + 1}`,
    lane,
    isExtraMain: false,
  }));
  const expectedLaneCounts = plannedLanes.reduce((map, lane) => {
    map[lane] = (map[lane] ?? 0) + 1;
    return map;
  }, {} as Partial<Record<MainLane, number>>);

  const mainIds: string[] = [];
  plannedMainSlots.forEach((slot) => {
    const lane = slot.lane;
    const auditMeta: SelectionAuditMeta = {
      slotId: slot.slotId,
      dayTitle: title,
      dayFocusTags: focusTags,
      capabilityMode,
      slotKind: slotKindByMainLane[lane],
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
        ? choosePushCompoundId(
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
        ? choosePullCompoundId(
            phaseIndex,
            available,
            experienceProfile,
            selectionContext,
            auditMeta
          )
        : lane === "squat"
        ? chooseSquatCompoundId(
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
  });

  const ensureMainEquipmentBalance = (mainExerciseIds: string[]) => {
    if (!(available.has("dumbbells") && available.has("bands"))) {
      return mainExerciseIds;
    }
    const hasDumbbellMain = mainExerciseIds.some((id) =>
      exerciseById(id)?.equipment.includes("dumbbells")
    );
    if (hasDumbbellMain) return mainExerciseIds;

    const targetIndex = Math.max(0, mainExerciseIds.length - 1);
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
          })
        ) {
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
    const slotKind = slotKindByMainLane[slot.lane];
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
            })
          ) {
            return false;
          }
          if (!shouldKeep(candidate)) return false;
          if (slot.lane === "squat" && !candidate.movementPattern.includes("squat")) {
            return false;
          }
          if (slot.lane === "hinge" && !candidate.movementPattern.includes("hinge")) {
            return false;
          }
          if (slot.lane === "pull" && !candidate.movementPattern.includes("pull")) {
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
        attemptSlotSwap(targetIndex, (candidate) => candidate.loadType === "weighted");
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

  const primaryAccessoryLane = lanes.includes("push")
    ? "push"
    : lanes.includes("pull")
    ? "pull"
    : lanes.includes("squat") || lanes.includes("hinge")
    ? "lower"
    : "core";
  const activationId = chooseActivationId(primaryAccessoryLane, available, selectionContext);
  const accessoryAuditMeta = (
    slotId: string,
    slotKind: string
  ): SelectionAuditMeta => ({
    slotId,
    dayTitle: title,
    dayFocusTags: focusTags,
    slotKind,
    capabilityMode,
    priorDayHeavyPatterns,
  });
  const accessoryA = chooseAccessoryId(
    primaryAccessoryLane,
    available,
    selectionContext,
    accessoryAuditMeta(`${normalizedTitle}-accessory-1`, `accessory${primaryAccessoryLane}`)
  );
  const accessoryB = chooseAccessoryId(
    "core",
    available,
    selectionContext,
    accessoryAuditMeta(`${normalizedTitle}-accessory-2`, "accessoryCore")
  );
  const accessoryCLane: "push" | "pull" | "lower" | "core" =
    primaryAccessoryLane === "push"
      ? "pull"
      : primaryAccessoryLane === "pull"
      ? "push"
      : primaryAccessoryLane === "lower"
      ? "core"
      : "lower";
  const accessoryC =
    experienceProfile.accessoryCount >= 3
      ? chooseAccessoryId(
          accessoryCLane,
          available,
          selectionContext,
          accessoryAuditMeta(`${normalizedTitle}-accessory-3`, `accessory${accessoryCLane}`)
        )
      : null;
  const cooldownId = chooseCooldownId(cooldownFocus, available, selectionContext);

  const routine = [
    makeItem(warmupId, experienceProfile.warmupSets, "6-10", 60, 30, "warmup"),
    makeItem(
      pickUnique(
        activationId,
        ["dead-bug", "bird-dog", "band-pull-aparts", "hip-hinge-drill"],
        "activation"
      ),
      "2",
      "8-12",
      60,
      30,
      "activation"
    ),
    ...applyCapabilitySoftMinimum(ensureMainEquipmentBalance(mainIds)).map((id, index) => {
      const slot = plannedMainSlots[index] ?? {
        slotId: `${normalizedTitle}-main-${index + 1}`,
        lane: "pull" as MainLane,
        isExtraMain: false,
      };
      const slotFallbackCandidates =
        slot.lane === "push"
          ? [
              choosePushCompoundId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
              chooseVerticalPushId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
            ]
          : slot.lane === "verticalPush"
          ? [
              chooseVerticalPushId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
              choosePushCompoundId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
            ]
          : slot.lane === "pull"
          ? [
              choosePullCompoundId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
            ]
          : slot.lane === "squat"
          ? [
              chooseSquatCompoundId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
            ]
          : [
              chooseHingeCompoundId(
                phaseIndex,
                available,
                experienceProfile,
                selectionContext
              ),
            ];
      const uniqueId = pickUnique(
        id,
        slotFallbackCandidates,
        "main"
      );
      const item = makeItem(
        uniqueId,
        experienceProfile.mainSets,
        experienceProfile.mainRepRange,
        90,
        experienceProfile.mainRestSec,
        "main"
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
    makeItem(
      accessoryA,
      experienceProfile.accessorySets,
      experienceProfile.accessoryRepRange,
      75,
      experienceProfile.accessoryRestSec,
      "accessory"
    ),
    makeItem(
      accessoryB,
      experienceProfile.accessorySets,
      experienceProfile.accessoryRepRange,
      75,
      experienceProfile.accessoryRestSec,
      "accessory"
    ),
    ...(accessoryC
      ? [
          makeItem(
            accessoryC,
            experienceProfile.accessorySets,
            experienceProfile.accessoryRepRange,
            75,
            experienceProfile.accessoryRestSec,
            "accessory"
          ),
        ]
      : []),
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

const emitFinalSelectionTraceForWeek = (params: {
  week: ProgramDay[];
  selectionContext: SelectionContext;
  available: Set<Equipment>;
  capabilityMode: EquipmentCapabilityMode;
  selectionAuditHook?: ProgramSelectionAuditHook;
}) => {
  const { week, selectionContext, available, capabilityMode, selectionAuditHook } = params;
  if (!selectionAuditHook) return;

  week.forEach((day) => {
    const mainItems = day.routine.filter(
      (item): item is ProgramRoutineItem => item.section === "main"
    );
    mainItems.forEach((item, index) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      const lane = getMainLaneHits(exercise)[0];
      const slotId = `${normalizeSlotToken(day.title)}-main-${index + 1}`;
      const slotKind = lane ? slotKindByMainLane[lane] : "mainRepair";
      const detail = scoreExerciseForContextDetailed(
        exercise,
        "main",
        selectionContext,
        available,
        {
          slotId,
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind,
          slotLane: lane,
          capabilityMode,
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
          capabilityMode,
        },
      });
      const chosenScore = Number((detail.score + capabilityBonus.bonus).toFixed(2));
      const chosenReasons = ["[final_trace]", ...detail.reasons, ...capabilityBonus.reasons];
      const chosen: ProgramSelectionAuditCandidate = {
        exerciseId: exercise.id,
        name: exercise.name,
        score: chosenScore,
        reasons: chosenReasons,
      };
      selectionAuditHook({
        slotId,
        dayTitle: day.title,
        slotKind,
        capabilityMode,
        chosen,
        top: [chosen],
      });
    });
  });
};

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
      ? ["Shoulders + Arms"]
      : daysPerWeek === 5
      ? ["Arms + Posture + Conditioning"]
      : ["Upper Push + Scapular Control"];

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
        focusTags: ["back", "chest", "push", "pull"],
        lanes: ["pull", "push"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "pull", min: 1 },
            { pattern: "push", min: 1 },
          ],
          forbiddenMainTags: ["lateral-delt", "shoulders-isolation"],
          optionalRules: [scapPostureRule],
        },
      },
      {
        title: "Shoulders + Arms",
        focusTags: ["shoulders", "arms", "upper"],
        lanes: ["verticalPush", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "verticalPush", min: 1 },
            { pattern: "pull", min: 1 },
          ],
          requiredMainRules: [bicepsIsolationRule, tricepsIsolationRule],
          optionalRules: [scapPostureRule],
        },
      },
      {
        title: "Legs + Abs",
        focusTags: ["legs", "quads", "hamstrings", "core"],
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

const HIGH_PAIN_SUMMARY_CLAUSE =
  "This plan prioritizes comfortable range of motion and control to restore movement before growth.";

const applyHighPainSummaryClause = (
  plan: { summary: string; change: string; reason: string },
  painSeverity: PainSeverity
) => {
  if (painSeverity !== "high") return plan;
  if (plan.summary.includes(HIGH_PAIN_SUMMARY_CLAUSE)) return plan;
  return {
    ...plan,
    summary: `${plan.summary} ${HIGH_PAIN_SUMMARY_CLAUSE}`.trim(),
  };
};

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
    feedbackSummaryByExercise?: Map<string, ExerciseFeedbackSummary>;
  }
): Program => {
  const normalizedDaysPerWeek = normalizeDaysPerWeek(data.daysPerWeek);
  const equipmentContext = normalizeEquipmentSelection(data.equipment);
  const capability = computeEquipmentCapability(data.equipment);
  const capabilityMode: EquipmentCapabilityMode = capability.hasLoad
    ? "hasLoad"
    : capability.hasBand
    ? "bandOnly"
    : "noneOnly";
  const feedbackSummaryByExercise =
    options?.feedbackSummaryByExercise ??
    summarizeFeedbackFromLogs(options?.recentLogs ?? []);
  const phaseIndex = options?.phaseIndex ?? 1;
  const experienceProfile = getExperienceProfile(
    data.experience,
    data.goals ?? "Improve posture"
  );
  const selectionContext = buildSelectionContext(
    data,
    options?.poseAnalysis,
    options?.assessmentReport,
    {
      phaseIndex,
      capabilityMode,
      phaseName: getPhaseMetaByIndex(phaseIndex).phaseName,
      feedbackSummaryByExercise,
    }
  );
  const selectionRng = options?.seed ? createSeededRng(options.seed) : undefined;

  let days: ProgramDay[] = [];
  const splitTemplates = buildSplitTemplates(
    normalizedDaysPerWeek,
    experienceProfile,
    phaseIndex,
    equipmentContext.available,
    selectionContext,
    capabilityMode,
    options?.selectionAuditHook,
    selectionRng
  );
  days = splitTemplates.map((template, dayIndex) => ({ dayIndex, ...template }));

  const timestamp = nowIso();
  const weekIndex = options?.weekIndex ?? 1;
  const totalWeekIndex = options?.totalWeekIndex ?? 1;
  const cycleIndex = options?.cycleIndex ?? 1;
  const phaseMeta = getPhaseMetaByIndex(phaseIndex);
  const profile = getPhaseProfile(phaseIndex);
  const trainingState =
    options?.trainingState ??
    deriveUserTrainingState({
      phaseIndex,
      complianceRate: 0,
      painFlag: data.painAreas.length > 0,
      fatigueFlag: false,
    });
  const phase = {
    name: phaseMeta.phaseName,
    phaseIndex,
    cycleIndex,
    weekIndex,
    weekCount: weekIndex,
    goal: profile.description,
  };
  const nextWeekPlan = applyHighPainSummaryClause(
    buildNextWeekPlan({
      complianceRate: 0,
      painFlag: data.painAreas.length > 0,
      fatigueFlag: false,
      phaseName: phaseMeta.phaseName,
      trainingState,
    }),
    selectionContext.painSeverity
  );
  const adjustedDays = days.map((day) =>
    adjustRoutineForPhase(
      day,
      phaseIndex,
      cycleIndex,
      data.goals ?? "",
      equipmentContext.available,
      experienceProfile.level,
      trainingState,
      selectionContext.painSeverity,
      selectionContext
    )
  );

  const dayRepairContext: DayConstraintRepairContext = {
    available: equipmentContext.available,
    selectionContext,
    capabilityMode,
  };
  const feedbackSubstitutedDays = applyFeedbackDrivenSubstitutions({
    week: adjustedDays,
    daysPerWeek: normalizedDaysPerWeek,
    context: dayRepairContext,
  });

  const eligibleDays = feedbackSubstitutedDays
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available, selectionContext)
      ),
    }))
    .map((day) =>
      ensureDistinctRoutine(day, equipmentContext.available, selectionContext)
    );
  const constraintAdjusted = applyDayCurriculumConstraints({
    week: eligibleDays,
    daysPerWeek: normalizedDaysPerWeek,
    context: dayRepairContext,
  });
  const finalizedWeek = constraintAdjusted.week
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available, selectionContext)
      ),
    }))
    .map((day) =>
      ensureDistinctRoutine(day, equipmentContext.available, selectionContext)
    );
  const feedbackSafetyWeek = applyFinalFeedbackSafetyPass({
    week: finalizedWeek,
    daysPerWeek: normalizedDaysPerWeek,
    context: dayRepairContext,
  }).map((day) => ({
    ...day,
    routine: day.routine.map((item) =>
      ensureEligibleItem(item, equipmentContext.available, selectionContext)
    ),
  }));
  emitFinalSelectionTraceForWeek({
    week: feedbackSafetyWeek,
    selectionContext,
    available: equipmentContext.available,
    capabilityMode,
    selectionAuditHook: options?.selectionAuditHook,
  });
  pushProgramConstraintWarnings(
    constraintAdjusted.warnings.map((warning) => ({
      programId,
      phaseName: phaseMeta.phaseName,
      dayTitle: warning.dayTitle,
      kind: warning.kind,
      message: warning.message,
    }))
  );
  const intelligence = buildProgramIntelligence({
    questionnaire: data,
    phaseIndex,
    cycleIndex,
    weekIndex,
    week: feedbackSafetyWeek,
    consistencyRate: 0,
    trainingState,
  });

  return {
    id: programId,
    userId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    templateVersion: PROGRAM_TEMPLATE_VERSION,
    goalTrack: data.goals ?? null,
    daysPerWeek: normalizedDaysPerWeek,
    estimatedSessionMinutesRange: { min: 45, max: 60 },
    phaseIndex: phaseMeta.phaseIndex,
    phaseName: phaseMeta.phaseName,
    weekIndex,
    totalWeekIndex,
    cycleIndex,
    phase,
    nextWeekPlan,
    ...intelligence,
    week: feedbackSafetyWeek,
    source: "local",
    deletedAt: null,
  };
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
    nextProgramId,
    seed,
  } = params;

  const phaseIndex = clampPhaseIndexToSupportedRange(currentProgram.phaseIndex ?? 1);
  if (phaseIndex >= MAX_PHASE_INDEX) {
    return {
      status: "repeat" as const,
      message: `You are already in Phase ${MAX_PHASE_INDEX}. Continue progressing through cycles for variation.`,
    };
  }
  const totalWeekIndex =
    currentProgram.totalWeekIndex ?? currentProgram.weekIndex ?? 1;
  const priorReadiness =
    currentProgram.nextWeekPlan?.summary.includes("progress") ? 0.7 : 0.55;
  const trainingState = deriveUserTrainingState({
    phaseIndex,
    complianceRate,
    painFlag,
    fatigueFlag,
    movementQuality,
    confidence,
    capacity,
    priorReadiness,
  });
  if (trainingState.painRisk >= 0.65) {
    return {
      status: "blocked" as const,
      message: trainingState.reason,
    };
  }

  if (trainingState.consistency < 0.5 || trainingState.fatigueRisk >= 0.65) {
    return {
      status: "repeat" as const,
      message: trainingState.reason,
    };
  }

  const weeksCompleted =
    typeof completedWeeksCount === "number"
      ? completedWeeksCount
      : Math.max(0, totalWeekIndex - 1);
  if (weeksCompleted < MIN_WEEKS_FOR_PHASE_ADVANCE) {
    return {
      status: "repeat" as const,
      message: "Complete at least 2 full weeks before advancing to the next phase.",
    };
  }

  const requiredSessionsForPhase = currentProgram.daysPerWeek * MIN_WEEKS_FOR_PHASE_ADVANCE;
  if (
    typeof completedSessionsCount === "number" &&
    completedSessionsCount < requiredSessionsForPhase
  ) {
    return {
      status: "repeat" as const,
      message: `Complete at least ${requiredSessionsForPhase} sessions before advancing to the next phase.`,
    };
  }

  const nextPhaseIndex = clampPhaseIndexToSupportedRange(phaseIndex + 1);
  const nextWeekIndex = 1;
  const nextCycleIndex = 1;
  const nextTotalWeekIndex = totalWeekIndex + 1;
  const feedbackSummaryByExercise = summarizeFeedbackFromLogs(recentLogs);

  const program = generateWeeklyProgram(questionnaire, nextProgramId, {
    phaseIndex: nextPhaseIndex,
    weekIndex: nextWeekIndex,
    cycleIndex: nextCycleIndex,
    totalWeekIndex: nextTotalWeekIndex,
    trainingState,
    seed,
    recentLogs,
    feedbackSummaryByExercise,
  });
  const hasSameWeekTemplate =
    JSON.stringify(program.week) === JSON.stringify(currentProgram.week);
  const phaseProgram = hasSameWeekTemplate
      ? generateWeeklyProgram(questionnaire, nextProgramId, {
        phaseIndex: nextPhaseIndex,
        weekIndex: nextWeekIndex,
        cycleIndex: 2,
        totalWeekIndex: nextTotalWeekIndex,
        trainingState,
        seed,
        recentLogs,
        feedbackSummaryByExercise,
      })
    : program;
  const equipmentContext = normalizeEquipmentSelection(questionnaire.equipment);
  const phaseCapability = computeEquipmentCapability(questionnaire.equipment);
  const phaseCapabilityMode: EquipmentCapabilityMode = phaseCapability.hasLoad
    ? "hasLoad"
    : phaseCapability.hasBand
    ? "bandOnly"
    : "noneOnly";
  const phaseSelectionContext = buildSelectionContext(
    questionnaire,
    undefined,
    undefined,
    {
      phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
      phaseName:
        phaseProgram.phaseName ??
        getPhaseMetaByIndex(phaseProgram.phaseIndex ?? nextPhaseIndex).phaseName,
      capabilityMode: phaseCapabilityMode,
      feedbackSummaryByExercise,
    }
  );
  const phaseWeek = enforceMaterialWeekChange({
    currentWeek: currentProgram.week,
    nextWeek: phaseProgram.week,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    available: equipmentContext.available,
    selectionContext: phaseSelectionContext,
  });
  const remappedPhaseWeek = remapWeekForProgressiveNovelty({
    currentWeek: currentProgram.week,
    nextWeek: phaseWeek,
    available: equipmentContext.available,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    painAreas: questionnaire.painAreas,
    selectionContext: phaseSelectionContext,
  });
  const optimizedPhase = optimizePhaseWeek({
    proposedWeek: remappedPhaseWeek,
    previousWeek: currentProgram.week,
    questionnaire,
    availableEquipment: equipmentContext.available,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
  });
  const progressedPhaseWeek = enforceProgressiveDemand({
    previousWeek: currentProgram.week,
    nextWeek: optimizedPhase.week,
    available: equipmentContext.available,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    experienceLevel: getExperienceProfile(questionnaire.experience, questionnaire.goals).level,
    trainingState,
    selectionContext: phaseSelectionContext,
  });
  const distinctOptimizedPhaseWeek = progressedPhaseWeek.map((day) =>
    ensureDistinctRoutine(day, equipmentContext.available, phaseSelectionContext)
  );
  const constrainedPhaseWeekResult = applyDayCurriculumConstraints({
    week: distinctOptimizedPhaseWeek,
    daysPerWeek: normalizeDaysPerWeek(phaseProgram.daysPerWeek),
    context: {
      available: equipmentContext.available,
      selectionContext: phaseSelectionContext,
      capabilityMode: phaseCapabilityMode,
    },
  });
  const constrainedPhaseWeek = constrainedPhaseWeekResult.week
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available, phaseSelectionContext)
      ),
    }))
    .map((day) =>
      ensureDistinctRoutine(day, equipmentContext.available, phaseSelectionContext)
    );
  const progressedChestPushWeek = ensureWeekHasProgressiveChestPushMain({
    week: constrainedPhaseWeek,
    daysPerWeek: normalizeDaysPerWeek(phaseProgram.daysPerWeek),
    available: equipmentContext.available,
    selectionContext: phaseSelectionContext,
    capabilityMode: phaseCapabilityMode,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
  });
  pushProgramConstraintWarnings(
    constrainedPhaseWeekResult.warnings.map((warning) => ({
      programId: phaseProgram.id,
      phaseName: phaseProgram.phaseName ?? null,
      dayTitle: warning.dayTitle,
      kind: warning.kind,
      message: warning.message,
    }))
  );

  const phaseMeta = getPhaseMetaByIndex(nextPhaseIndex);
  const painSeverity = getPainSeverity(questionnaire);
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate,
    painFlag,
    fatigueFlag,
    phaseName: phaseMeta.phaseName,
    trainingState,
  });
  const enhancedNextWeekPlan = applyHighPainSummaryClause(
    {
      ...nextWeekPlan,
      change: `${nextWeekPlan.change} ${optimizedPhase.summary}`,
    },
    painSeverity
  );
  const intelligence = buildProgramIntelligence({
    questionnaire,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    weekIndex: phaseProgram.weekIndex ?? nextWeekIndex,
    week: progressedChestPushWeek,
    consistencyRate: complianceRate,
    recentLogs,
    trainingState,
    optimizerReport: {
      changedSlots: optimizedPhase.changedSlots,
      totalSlots: optimizedPhase.totalSlots,
    },
  });

  return {
    status: "advanced" as const,
    program: {
      ...phaseProgram,
      week: progressedChestPushWeek,
      nextWeekPlan: enhancedNextWeekPlan,
      ...intelligence,
      phaseOptimizerReport: {
        summary: optimizedPhase.summary,
        priorities: optimizedPhase.priorities,
        changedSlots: optimizedPhase.changedSlots,
        totalSlots: optimizedPhase.totalSlots,
        exerciseReasons: optimizedPhase.exerciseReasons,
      },
    },
  };
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
    nextProgramId,
    seed,
  } = params;

  const phaseIndex = clampPhaseIndexToSupportedRange(currentProgram.phaseIndex ?? 1);
  const phaseWeekIndex = currentProgram.weekIndex ?? 1;
  const totalWeekIndex =
    currentProgram.totalWeekIndex ?? currentProgram.weekIndex ?? 1;
  const cycleIndex = currentProgram.cycleIndex ?? 1;
  const priorReadiness =
    currentProgram.nextWeekPlan?.summary.includes("progress") ? 0.7 : 0.55;
  const trainingState = deriveUserTrainingState({
    phaseIndex,
    complianceRate,
    painFlag,
    fatigueFlag,
    movementQuality,
    confidence,
    capacity,
    priorReadiness,
  });
  const transition = decideProgramProgression({
    state: trainingState,
    phaseIndex,
    cycleIndex,
    phaseWeekIndex,
    totalWeekIndex,
    minimumWeeksForPhaseAdvance: MIN_WEEKS_FOR_PHASE_ADVANCE,
  });

  const requiredSessionsForCurrentCycle = currentProgram.daysPerWeek;
  if (
    typeof completedSessionsCount === "number" &&
    completedSessionsCount < requiredSessionsForCurrentCycle
  ) {
    return {
      status: "repeat" as const,
      message: `Complete at least ${requiredSessionsForCurrentCycle} sessions before starting the next cycle.`,
    };
  }

  if (complianceRate < 0.85) {
    return {
      status: "repeat" as const,
      message: "Hit at least 85% weekly compliance before advancing cycle.",
    };
  }

  if (
    transition.next &&
    transition.next.phaseIndex > phaseIndex &&
    typeof completedWeeksCount === "number" &&
    completedWeeksCount < MIN_WEEKS_FOR_PHASE_ADVANCE
  ) {
    return {
      status: "repeat" as const,
      message: "Complete at least 2 full weeks before advancing phase.",
    };
  }

  if (transition.status !== "advanced" || !transition.next) {
    return {
      status: transition.status,
      message: transition.message ?? trainingState.reason,
    };
  }
  const feedbackSummaryByExercise = summarizeFeedbackFromLogs(recentLogs);

  const program = generateWeeklyProgram(questionnaire, nextProgramId, {
    phaseIndex: transition.next.phaseIndex,
    weekIndex: transition.next.weekIndex,
    cycleIndex: transition.next.cycleIndex,
    totalWeekIndex: transition.next.totalWeekIndex,
    trainingState,
    seed,
    recentLogs,
    feedbackSummaryByExercise,
  });
  const equipmentContext = normalizeEquipmentSelection(questionnaire.equipment);
  const cycleCapability = computeEquipmentCapability(questionnaire.equipment);
  const cycleCapabilityMode: EquipmentCapabilityMode = cycleCapability.hasLoad
    ? "hasLoad"
    : cycleCapability.hasBand
    ? "bandOnly"
    : "noneOnly";
  const cycleSelectionContext = buildSelectionContext(
    questionnaire,
    undefined,
    undefined,
    {
      phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
      phaseName:
        program.phaseName ??
        getPhaseMetaByIndex(program.phaseIndex ?? transition.next.phaseIndex).phaseName,
      capabilityMode: cycleCapabilityMode,
      feedbackSummaryByExercise,
    }
  );
  const nextWeek = enforceMaterialWeekChange({
    currentWeek: currentProgram.week,
    nextWeek: program.week,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    available: equipmentContext.available,
    selectionContext: cycleSelectionContext,
  });
  const remappedNextWeek = remapWeekForProgressiveNovelty({
    currentWeek: currentProgram.week,
    nextWeek,
    available: equipmentContext.available,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    painAreas: questionnaire.painAreas,
    selectionContext: cycleSelectionContext,
  });
  const optimizedCycle = optimizePhaseWeek({
    proposedWeek: remappedNextWeek,
    previousWeek: currentProgram.week,
    questionnaire,
    availableEquipment: equipmentContext.available,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
  });
  const progressedCycleWeek = enforceProgressiveDemand({
    previousWeek: currentProgram.week,
    nextWeek: optimizedCycle.week,
    available: equipmentContext.available,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    experienceLevel: getExperienceProfile(questionnaire.experience, questionnaire.goals).level,
    trainingState,
    selectionContext: cycleSelectionContext,
  });
  const distinctOptimizedCycleWeek = progressedCycleWeek.map((day) =>
    ensureDistinctRoutine(day, equipmentContext.available, cycleSelectionContext)
  );
  const constrainedCycleWeekResult = applyDayCurriculumConstraints({
    week: distinctOptimizedCycleWeek,
    daysPerWeek: normalizeDaysPerWeek(program.daysPerWeek),
    context: {
      available: equipmentContext.available,
      selectionContext: cycleSelectionContext,
      capabilityMode: cycleCapabilityMode,
    },
  });
  const constrainedCycleWeek = constrainedCycleWeekResult.week
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available, cycleSelectionContext)
      ),
    }))
    .map((day) =>
      ensureDistinctRoutine(day, equipmentContext.available, cycleSelectionContext)
    );
  pushProgramConstraintWarnings(
    constrainedCycleWeekResult.warnings.map((warning) => ({
      programId: program.id,
      phaseName: program.phaseName ?? null,
      dayTitle: warning.dayTitle,
      kind: warning.kind,
      message: warning.message,
    }))
  );

  const phaseMeta = getPhaseMetaByIndex(transition.next.phaseIndex);
  const painSeverity = getPainSeverity(questionnaire);
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate,
    painFlag,
    fatigueFlag,
    phaseName: phaseMeta.phaseName,
    trainingState,
  });
  const enhancedNextWeekPlan = applyHighPainSummaryClause(
    {
      ...nextWeekPlan,
      change: `${nextWeekPlan.change} ${optimizedCycle.summary}`,
    },
    painSeverity
  );
  const intelligence = buildProgramIntelligence({
    questionnaire,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    weekIndex: program.weekIndex ?? transition.next.weekIndex,
    week: constrainedCycleWeek,
    consistencyRate: complianceRate,
    recentLogs,
    trainingState,
    optimizerReport: {
      changedSlots: optimizedCycle.changedSlots,
      totalSlots: optimizedCycle.totalSlots,
    },
  });

  return {
    status: "advanced" as const,
    program: {
      ...program,
      week: constrainedCycleWeek,
      nextWeekPlan: enhancedNextWeekPlan,
      ...intelligence,
      phaseOptimizerReport: {
        summary: optimizedCycle.summary,
        priorities: optimizedCycle.priorities,
        changedSlots: optimizedCycle.changedSlots,
        totalSlots: optimizedCycle.totalSlots,
        exerciseReasons: optimizedCycle.exerciseReasons,
      },
    },
  };
};
