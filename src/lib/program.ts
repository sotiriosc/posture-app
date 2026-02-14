import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";
import type { Exercise, ExerciseCategory } from "@/lib/exercises";
import { exerciseById, exercises } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import {
  isExerciseEligible,
  normalizeEquipmentSelection,
} from "@/lib/equipment";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
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
import { buildSessionAdaptation } from "@/lib/sessionAdaptation";

const nowIso = () => new Date().toISOString();
const MIN_WEEKS_FOR_PHASE_ADVANCE = 2;
export const PROGRAM_TEMPLATE_VERSION = 11;

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

type SelectionContext = {
  painAreas: string[];
  preferredTags: Set<string>;
  preferredPatterns: Set<string>;
  deprioritizeTags: Set<string>;
  deprioritizePatterns: Set<string>;
  goal: string;
};

export const PAIN_RULES: Record<
  string,
  {
    preferredTags: string[];
    preferredPatterns: string[];
    deprioritizeTags: string[];
    deprioritizePatterns: string[];
  }
> = {
  neck: {
    preferredTags: ["t-spine", "scap", "breath", "core"],
    preferredPatterns: ["mobility", "pull", "core"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
  },
  "upper back": {
    preferredTags: ["upper-back", "scap", "t-spine"],
    preferredPatterns: ["pull", "mobility"],
    deprioritizeTags: [],
    deprioritizePatterns: [],
  },
  "lower back": {
    preferredTags: ["core", "tva", "posterior", "hinge"],
    preferredPatterns: ["core", "hinge"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
  },
  shoulders: {
    preferredTags: ["scap", "upper-back", "core"],
    preferredPatterns: ["pull", "core", "mobility"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: [],
  },
  hips: {
    preferredTags: ["hips", "glutes", "mobility", "balance"],
    preferredPatterns: ["hinge", "squat", "mobility"],
    deprioritizeTags: [],
    deprioritizePatterns: [],
  },
  knees: {
    preferredTags: ["glutes", "hinge", "balance", "core"],
    preferredPatterns: ["hinge", "core", "mobility"],
    deprioritizeTags: ["advanced"],
    deprioritizePatterns: ["squat"],
  },
};

const buildSelectionContext = (questionnaire: QuestionnaireData): SelectionContext => {
  const painAreas = questionnaire.painAreas.map((area) => area.trim().toLowerCase());
  const preferredTags = new Set<string>();
  const preferredPatterns = new Set<string>();
  const deprioritizeTags = new Set<string>();
  const deprioritizePatterns = new Set<string>();

  painAreas.forEach((area) => {
    const rules = PAIN_RULES[area];
    if (!rules) return;
    rules.preferredTags.forEach((tag) => preferredTags.add(tag));
    rules.preferredPatterns.forEach((pattern) => preferredPatterns.add(pattern));
    rules.deprioritizeTags.forEach((tag) => deprioritizeTags.add(tag));
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

  return {
    painAreas,
    preferredTags,
    preferredPatterns,
    deprioritizeTags,
    deprioritizePatterns,
    goal: questionnaire.goals,
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

const pickFallbackExercise = (
  category: ExerciseCategory,
  loadType: ProgramRoutineItem["loadType"],
  available: Set<Equipment>
) => {
  const eligible = exercises.filter(
    (exercise) => exercise.category === category && isExerciseEligible(exercise, available)
  );
  const loadTypeMatch = eligible.filter((exercise) => exercise.loadType === loadType);
  if (loadTypeMatch.length) return loadTypeMatch[0];
  if (eligible.length) return eligible[0];
  const noneFallback = exercises.filter(
    (exercise) =>
      exercise.category === category && exercise.equipment.includes("none")
  );
  return noneFallback[0] ?? exercises.find((exercise) => exercise.category === category) ?? null;
};

const ensureEligibleItem = (
  item: ProgramRoutineItem,
  available: Set<Equipment>
) => {
  const exercise = exerciseById(item.exerciseId);
  if (!exercise) return item;
  if (isExerciseEligible(exercise, available)) return item;
  const fallback = pickFallbackExercise(exercise.category, exercise.loadType, available);
  if (!fallback) return item;
  return {
    ...item,
    exerciseId: fallback.id,
    loadType: fallback.loadType,
    cues: fallback.cues ?? null,
  };
};

const patternPriority = [
  "squat",
  "hinge",
  "push",
  "pull",
  "core",
  "mobility",
];

const defaultPrescriptionByPattern = (pattern: string) => {
  if (pattern === "mobility") return { sets: "2", reps: "6-8", duration: 60 };
  if (pattern === "core") return { sets: "2-3", reps: "8-12", duration: 60 };
  return { sets: "3", reps: "8-12", duration: 75 };
};

const chooseExerciseForPattern = (
  pattern: string,
  available: Set<Equipment>,
  preferBands: boolean,
  usedIds: Set<string>
) => {
  const eligible = exercises.filter(
    (exercise) =>
      exercise.movementPattern.includes(pattern) &&
      isExerciseEligible(exercise, available) &&
      !usedIds.has(exercise.id)
  );

  if (preferBands && ["pull", "push", "core"].includes(pattern)) {
    const bandFirst = eligible.filter((exercise) =>
      exercise.equipment.includes("bands")
    );
    if (bandFirst.length) return bandFirst[0];
  }

  if (eligible.length) return eligible[0];

  const noneFallback = exercises.filter(
    (exercise) =>
      exercise.movementPattern.includes(pattern) &&
      exercise.equipment.includes("none") &&
      !usedIds.has(exercise.id)
  );
  return noneFallback[0] ?? null;
};

const ensureSlotCoverage = (
  day: ProgramDay,
  available: Set<Equipment>,
  preferBands: boolean,
  targetCount: number
) => {
  const usedIds = new Set(day.routine.map((item) => item.exerciseId));
  const existingPatterns = new Set<string>();

  day.routine.forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    exercise?.movementPattern.forEach((pattern) =>
      existingPatterns.add(pattern)
    );
  });

  const needed = Math.max(0, targetCount - day.routine.length);
  if (needed === 0) return day;

  const dayHint = `${day.title} ${day.focusTags.join(" ")}`.toLowerCase();
  const patternBias = (pattern: string) => {
    if (dayHint.includes("upper") && (pattern === "push" || pattern === "pull")) return 3;
    if (dayHint.includes("lower") && (pattern === "squat" || pattern === "hinge")) return 3;
    if (dayHint.includes("push") && pattern === "push") return 4;
    if (dayHint.includes("pull") && pattern === "pull") return 4;
    if (dayHint.includes("core") && pattern === "core") return 4;
    return 0;
  };

  const missing = patternPriority
    .filter((pattern) => !existingPatterns.has(pattern))
    .sort((left, right) => patternBias(right) - patternBias(left))
    .slice(0, needed);

  if (!missing.length) return day;

  const additions: ProgramRoutineItem[] = [];
  missing.forEach((pattern) => {
    const exercise = chooseExerciseForPattern(
      pattern,
      available,
      preferBands,
      usedIds
    );
    if (!exercise) return;
    usedIds.add(exercise.id);
    const defaultRx = defaultPrescriptionByPattern(pattern);
    additions.push(
      makeItem(exercise.id, defaultRx.sets, defaultRx.reps, defaultRx.duration, 60)
    );
  });

  return {
    ...day,
    routine: [...day.routine, ...additions],
  };
};

const pickDistinctReplacement = (params: {
  item: ProgramRoutineItem;
  usedIds: Set<string>;
  available: Set<Equipment>;
}) => {
  const { item, usedIds, available } = params;
  const current = exerciseById(item.exerciseId);
  if (!current) return null;

  const swapCandidate =
    current.swapOptions
      ?.map((id) => exerciseById(id))
      .filter((candidate): candidate is Exercise => Boolean(candidate))
      .filter(
        (candidate) =>
          !usedIds.has(candidate.id) &&
          isExerciseEligible(candidate, available) &&
          isExerciseAllowedForSection(candidate, item.section)
      )[0] ?? null;
  if (swapCandidate) return swapCandidate;

  const pool = exercises.filter((candidate) => {
    if (candidate.id === current.id) return false;
    if (usedIds.has(candidate.id)) return false;
    if (!isExerciseEligible(candidate, available)) return false;
    if (!isExerciseAllowedForSection(candidate, item.section)) return false;
    if (candidate.category !== current.category) return false;
    const patternOverlap = candidate.movementPattern.some((pattern) =>
      current.movementPattern.includes(pattern)
    );
    return patternOverlap;
  });
  return pool[0] ?? null;
};

const ensureDistinctRoutine = (
  day: ProgramDay,
  available: Set<Equipment>
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
  available: Set<Equipment>
) => {
  if (phaseIndex <= 1) return exerciseId;
  const upgrade = phaseUpgradeMap[exerciseId];
  if (!upgrade) return exerciseId;
  const target =
    phaseIndex >= 3 ? upgrade.phase3 ?? upgrade.phase2 : upgrade.phase2;
  if (!target) return exerciseId;
  const candidate = exerciseById(target);
  if (candidate && isExerciseEligible(candidate, available)) {
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

const applyCycleVariationId = (
  exerciseId: string,
  cycleIndex: number,
  available: Set<Equipment>,
  section?: ProgramRoutineItem["section"]
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
      isExerciseEligible(candidate, available) &&
      isExerciseAllowedForSection(candidate, section)
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
  section?: ProgramRoutineItem["section"]
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
        isExerciseEligible(candidate, available) &&
        isExerciseAllowedForSection(candidate, section)
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

const pickProgressiveVariant = (params: {
  currentId: string;
  usedIds: Set<string>;
  available: Set<Equipment>;
}) => {
  const { currentId, usedIds, available } = params;
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
    if (!isExerciseEligible(candidate, available)) continue;
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
}) => {
  const {
    previousWeek,
    nextWeek,
    available,
    phaseIndex,
    cycleIndex,
    experienceLevel,
    trainingState,
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

const routineIdSignature = (day: ProgramDay) =>
  day.routine.map((item) => item.exerciseId).join("|");

const enforceMaterialWeekChange = (params: {
  currentWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  cycleIndex: number;
  available: Set<Equipment>;
}) => {
  const { currentWeek, nextWeek, cycleIndex, available } = params;
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
      item.section
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
}) => {
  const { currentWeek, nextWeek, available, cycleIndex, phaseIndex, painAreas } = params;
  if (cycleIndex <= 1) return nextWeek;

  const currentWeekIds = new Set(
    currentWeek.flatMap((day) => day.routine.map((item) => item.exerciseId))
  );
  const priorityTags = new Set(
    painAreas.flatMap((area) => painAreaPriorityTags[area.toLowerCase()] ?? [])
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
        if (!isExerciseEligible(candidate, available)) return false;
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
  trainingState?: UserTrainingState
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
    const upgradedId = upgradeExerciseId(item.exerciseId, phaseIndex, available);
    const variedByMapId = applyCycleVariationId(
      upgradedId,
      cycleIndex,
      available,
      item.section
    );
    const variedId = pickSwapVariantId(
      variedByMapId,
      cycleIndex,
      available,
      item.section
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

    return {
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

const scoreExerciseForContext = (
  exercise: Exercise,
  section: ProgramRoutineItem["section"] | undefined,
  context: SelectionContext,
  available: Set<Equipment>
) => {
  let score = 0;
  score += exercise.tags.reduce(
    (sum, tag) => (context.preferredTags.has(tag.toLowerCase()) ? sum + 3 : sum),
    0
  );
  score += exercise.movementPattern.reduce(
    (sum, pattern) =>
      context.preferredPatterns.has(pattern.toLowerCase()) ? sum + 2 : sum,
    0
  );
  score -= exercise.tags.reduce(
    (sum, tag) => (context.deprioritizeTags.has(tag.toLowerCase()) ? sum + 2 : sum),
    0
  );
  score -= exercise.movementPattern.reduce(
    (sum, pattern) =>
      context.deprioritizePatterns.has(pattern.toLowerCase()) ? sum + 2 : sum,
    0
  );
  if (context.goal === "Reduce pain" && section === "main" && exercise.tags.includes("advanced")) {
    score -= 3;
  }
  if (section === "main" && exercise.loadType === "weighted") {
    score += 2;
  }
  if (section === "main" && available.has("dumbbells")) {
    if (exercise.equipment.includes("dumbbells")) {
      score += available.has("bench") ? 2 : 3;
    }
    if (available.has("bands") && exercise.equipment.includes("bands") && !exercise.equipment.includes("dumbbells")) {
      score -= 1;
    }
  }
  if (contraindicationHitsPainArea(exercise.contraindications, context.painAreas)) {
    score -= 8;
  }
  return score;
};

const pickFirstEligibleId = (
  candidates: string[],
  available: Set<Equipment>,
  context: SelectionContext,
  section?: ProgramRoutineItem["section"]
) => {
  const eligible = candidates
    .map((id, index) => ({ id, index, exercise: exerciseById(id) }))
    .filter(
      (entry): entry is { id: string; index: number; exercise: Exercise } =>
        Boolean(entry.exercise)
    )
    .filter(
      (entry) =>
        isExerciseEligible(entry.exercise, available) &&
        isExerciseAllowedForSection(entry.exercise, section)
    )
    .sort((left, right) => {
      const rightScore =
        scoreExerciseForContext(right.exercise, section, context, available) - right.index * 0.01;
      const leftScore =
        scoreExerciseForContext(left.exercise, section, context, available) - left.index * 0.01;
      return rightScore - leftScore;
    });

  if (eligible.length) return eligible[0].id;
  return candidates[candidates.length - 1];
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
  context: SelectionContext
) =>
  pickFirstEligibleId(
    phaseIndex >= 3 && experience.allowAdvancedCompounds
      ? [
          "dumbbell-bench-press",
          "band-overhead-press",
          "pseudo-planche-pushup",
          "archer-pushup",
          "dumbbell-floor-press",
          "band-chest-press",
          "pushup",
          "incline-pushup",
        ]
      : phaseIndex >= 2
      ? [
          "dumbbell-floor-press",
          "band-overhead-press",
          "band-chest-press",
          "pushup",
          "incline-pushup",
        ]
      : ["incline-pushup", "band-chest-press", "pushup"],
    available,
    context,
    "main"
  );

const chooseVerticalPushId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? ["dumbbell-shoulder-press", "pike-pushup", "scapular-pushups"]
      : ["pike-pushup", "scapular-pushups", "incline-pushup"],
    available,
    context,
    "main"
  );

const choosePullCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? [
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
    "main"
  );

const chooseSquatCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? ["shrimp-squat", "cossack-squat", "split-squat", "heels-elevated-squat", "bodyweight-squat"]
      : ["band-front-squat", "bodyweight-squat", "split-squat", "heels-elevated-squat", "cossack-squat"],
    available,
    context,
    "main"
  );

const chooseHingeCompoundId = (
  phaseIndex: number,
  available: Set<Equipment>,
  experience: ExperienceProfile,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    phaseIndex >= 2 && experience.allowAdvancedCompounds
      ? [
          "band-rdl",
          "back-extension",
          "single-leg-rdl",
          "single-leg-hip-thrust",
          "single-leg-glute-bridge-hold",
          "bodyweight-good-morning",
        ]
      : [
          "band-rdl",
          "back-extension",
          "bodyweight-good-morning",
          "single-leg-rdl",
          "single-leg-hip-thrust",
          "single-leg-glute-bridge-hold",
        ],
    available,
    context,
    "main"
  );

const chooseAccessoryId = (
  lane: "push" | "pull" | "lower" | "core",
  available: Set<Equipment>,
  context: SelectionContext
) =>
  pickFirstEligibleId(
    lane === "push"
      ? ["dumbbell-lateral-raise", "dumbbell-chest-fly", "band-pull-aparts", "scapular-pushups"]
      : lane === "pull"
      ? ["face-pull", "prone-ytw", "band-lat-pulldown", "band-pull-aparts", "reverse-snow-angel"]
      : lane === "lower"
      ? ["band-rdl", "hip-hinge-drill", "glute-bridges", "band-front-squat", "bodyweight-squat", "cossack-squat"]
      : ["band-woodchop", "side-plank-star", "hollow-body-hold", "pallof-press", "dead-bug", "plank", "bird-dog"],
    available,
    context,
    "accessory"
  );

type MainLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";
type EquipmentCapabilityMode = "noneOnly" | "bandOnly" | "hasLoad";
type PlannedMainSlot = {
  lane: MainLane;
  isExtraMain: boolean;
};
const DEBUG_ENGINE_ASSERTS = false;

const appendNote = (notes: string | null | undefined, text: string) => {
  const current = (notes ?? "").trim();
  if (!current) return text;
  if (current.toLowerCase().includes(text.toLowerCase())) return current;
  return `${current} ${text}`;
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
      if (!isExerciseEligible(candidate, available)) return false;
      if (!isExerciseAllowedForSection(candidate, section)) return false;
      return true;
    });
    if (fallbackFromList) {
      used.add(fallbackFromList);
      return fallbackFromList;
    }

    const pool = exercises
      .filter((candidate) => {
        if (used.has(candidate.id)) return false;
        if (!isExerciseEligible(candidate, available)) return false;
        if (!isExerciseAllowedForSection(candidate, section)) return false;
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
  const expandedLanes = [...lanes];
  const laneOrder: MainLane[] = lanes.includes("push") || lanes.includes("verticalPush")
    ? ["push", "verticalPush", "pull", "hinge", "squat"]
    : lanes.includes("pull")
    ? ["pull", "push", "verticalPush", "hinge", "squat"]
    : lanes.includes("squat")
    ? ["squat", "hinge", "pull", "push", "verticalPush"]
    : ["hinge", "squat", "pull", "push", "verticalPush"];
  // None-only users need extra main work to drive sufficient training stimulus.
  const additionalMainSlots =
    capabilityMode === "noneOnly"
      ? 2
      : capabilityMode === "bandOnly" && lanes.length <= 1
      ? 1
      : 0;
  const baseMainSlotCount = Math.max(lanes.length, experienceProfile.mainLaneCount);
  const targetMainSlots = baseMainSlotCount + additionalMainSlots;
  let laneCursor = 0;
  if (capabilityMode === "noneOnly") {
    for (const candidate of laneOrder) {
      if (expandedLanes.length >= targetMainSlots) break;
      if (expandedLanes.includes(candidate)) continue;
      expandedLanes.push(candidate);
    }
  }
  while (expandedLanes.length < targetMainSlots) {
    expandedLanes.push(laneOrder[laneCursor % laneOrder.length]);
    laneCursor += 1;
  }
  const plannedLanes =
    capabilityMode === "bandOnly"
      ? ensurePullLaneBandOnly(expandedLanes, title, focusTags)
      : expandedLanes;
  const plannedMainSlots: PlannedMainSlot[] = plannedLanes.map((lane, index) => ({
    lane,
    isExtraMain: capabilityMode === "noneOnly" && index >= baseMainSlotCount,
  }));
  if (process.env.NODE_ENV !== "production" || DEBUG_ENGINE_ASSERTS) {
    const extraCount = plannedMainSlots.filter((slot) => slot.isExtraMain).length;
    const expectedExtraCount = capabilityMode === "noneOnly" ? 2 : 0;
    if (extraCount !== expectedExtraCount) {
      throw new Error(
        `[program] extra-main invariant failed for "${title}" (${capabilityMode}): expected ${expectedExtraCount}, got ${extraCount}`
      );
    }
  }

  const mainIds = plannedMainSlots.map((slot) => {
    const lane = slot.lane;
    if (lane === "push")
      return choosePushCompoundId(
        phaseIndex,
        available,
        experienceProfile,
        selectionContext
      );
    if (lane === "verticalPush")
      return chooseVerticalPushId(
        phaseIndex,
        available,
        experienceProfile,
        selectionContext
      );
    if (lane === "pull")
      return choosePullCompoundId(
        phaseIndex,
        available,
        experienceProfile,
        selectionContext
      );
    if (lane === "squat")
      return chooseSquatCompoundId(
        phaseIndex,
        available,
        experienceProfile,
        selectionContext
      );
    return chooseHingeCompoundId(
      phaseIndex,
      available,
      experienceProfile,
      selectionContext
    );
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
        if (!isExerciseEligible(candidate, available)) return false;
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

  const primaryAccessoryLane = lanes.includes("push")
    ? "push"
    : lanes.includes("pull")
    ? "pull"
    : lanes.includes("squat") || lanes.includes("hinge")
    ? "lower"
    : "core";
  const activationId = chooseActivationId(primaryAccessoryLane, available, selectionContext);
  const accessoryA = chooseAccessoryId(primaryAccessoryLane, available, selectionContext);
  const accessoryB = chooseAccessoryId("core", available, selectionContext);
  const accessoryC =
    experienceProfile.accessoryCount >= 3
      ? chooseAccessoryId(
          primaryAccessoryLane === "push" ? "pull" : "push",
          available,
          selectionContext
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
    ...ensureMainEquipmentBalance(mainIds).map((id, index) => {
      const uniqueId = pickUnique(
        id,
        [
          choosePullCompoundId(
            phaseIndex,
            available,
            experienceProfile,
            selectionContext
          ),
          chooseHingeCompoundId(
            phaseIndex,
            available,
            experienceProfile,
            selectionContext
          ),
          chooseSquatCompoundId(
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
        ],
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
      return applyCapabilityMainPrescription({
        item,
        slot: plannedMainSlots[index] ?? { lane: "pull", isExtraMainSlot: false },
        capabilityMode,
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

const buildSplitTemplates = (
  daysPerWeek: 3 | 4 | 5,
  experienceProfile: ExperienceProfile,
  phaseIndex: number,
  available: Set<Equipment>,
  selectionContext: SelectionContext,
  capabilityMode: EquipmentCapabilityMode
) => {
  if (daysPerWeek === 3) {
    return [
      buildStructuredDay({
        title: "Back + Chest",
        focusTags: ["back", "chest", "push", "pull"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["pull", "push"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        capabilityMode,
      }),
      buildStructuredDay({
        title: "Shoulders + Arms",
        focusTags: ["shoulders", "arms", "upper"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["verticalPush", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        capabilityMode,
      }),
      buildStructuredDay({
        title: "Legs + Abs",
        focusTags: ["legs", "quads", "hamstrings", "core"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["squat", "hinge"],
        warmupFocus: "lower",
        cooldownFocus: "core",
        capabilityMode,
      }),
    ];
  }
  if (daysPerWeek === 4) {
    return [
      buildStructuredDay({
        title: "Push A",
        focusTags: ["push", "chest", "shoulders", "triceps"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["push", "verticalPush"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        capabilityMode,
      }),
      buildStructuredDay({
        title: "Pull",
        focusTags: ["pull", "back", "biceps"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["pull", "pull"],
        warmupFocus: "upper",
        cooldownFocus: "core",
        capabilityMode,
      }),
      buildStructuredDay({
        title: "Legs + Abs",
        focusTags: ["legs", "quads", "core"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["squat", "hinge"],
        warmupFocus: "lower",
        cooldownFocus: "core",
        capabilityMode,
      }),
      buildStructuredDay({
        title: "Push B",
        focusTags: ["push", "shoulders", "arms"],
        experienceProfile,
        selectionContext,
        phaseIndex,
        available,
        lanes: ["verticalPush", "push"],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        capabilityMode,
      }),
    ];
  }
  return [
    buildStructuredDay({
      title: "Push",
      focusTags: ["push", "chest", "shoulders", "triceps"],
      experienceProfile,
      selectionContext,
      phaseIndex,
      available,
      lanes: ["push", "verticalPush"],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      capabilityMode,
    }),
    buildStructuredDay({
      title: "Pull",
      focusTags: ["pull", "back", "biceps"],
      experienceProfile,
      selectionContext,
      phaseIndex,
      available,
      lanes: ["pull", "pull"],
      warmupFocus: "upper",
      cooldownFocus: "core",
      capabilityMode,
    }),
    buildStructuredDay({
      title: "Legs (Quads + Abs)",
      focusTags: ["legs", "quads", "core"],
      experienceProfile,
      selectionContext,
      phaseIndex,
      available,
      lanes: ["squat", "squat"],
      warmupFocus: "lower",
      cooldownFocus: "core",
      capabilityMode,
    }),
    buildStructuredDay({
      title: "Upper Mix",
      focusTags: ["upper", "push", "pull", "arms"],
      experienceProfile,
      selectionContext,
      phaseIndex,
      available,
      lanes: ["push", "pull"],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      capabilityMode,
    }),
    buildStructuredDay({
      title: "Legs (Posterior Chain)",
      focusTags: ["posterior", "hamstrings", "glutes", "core"],
      experienceProfile,
      selectionContext,
      phaseIndex,
      available,
      lanes: ["hinge", "hinge"],
      warmupFocus: "lower",
      cooldownFocus: "core",
      capabilityMode,
    }),
  ];
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
  const phaseIndex = options?.phaseIndex ?? 1;
  const experienceProfile = getExperienceProfile(
    data.experience,
    data.goals ?? "Improve posture"
  );
  const selectionContext = buildSelectionContext(data);

  let days: ProgramDay[] = [];
  const splitTemplates = buildSplitTemplates(
    normalizedDaysPerWeek,
    experienceProfile,
    phaseIndex,
    equipmentContext.available,
    selectionContext,
    capabilityMode
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
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate: 0,
    painFlag: data.painAreas.length > 0,
    fatigueFlag: false,
    phaseName: phaseMeta.phaseName,
    trainingState,
  });
  const adjustedDays = days.map((day) =>
    adjustRoutineForPhase(
      day,
      phaseIndex,
      cycleIndex,
      data.goals ?? "",
      equipmentContext.available,
      experienceProfile.level,
      trainingState
    )
  );

  const eligibleDays = adjustedDays
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available)
      ),
    }))
    .map((day) => ensureDistinctRoutine(day, equipmentContext.available));
  const intelligence = buildProgramIntelligence({
    questionnaire: data,
    phaseIndex,
    cycleIndex,
    weekIndex,
    week: eligibleDays,
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
    week: eligibleDays,
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
  } = params;

  const phaseIndex = currentProgram.phaseIndex ?? 1;
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

  const nextPhaseIndex = phaseIndex + 1;
  const nextWeekIndex = 1;
  const nextCycleIndex = 1;
  const nextTotalWeekIndex = totalWeekIndex + 1;

  const program = generateWeeklyProgram(questionnaire, nextProgramId, {
    phaseIndex: nextPhaseIndex,
    weekIndex: nextWeekIndex,
    cycleIndex: nextCycleIndex,
    totalWeekIndex: nextTotalWeekIndex,
    trainingState,
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
      })
    : program;
  const equipmentContext = normalizeEquipmentSelection(questionnaire.equipment);
  const phaseWeek = enforceMaterialWeekChange({
    currentWeek: currentProgram.week,
    nextWeek: phaseProgram.week,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    available: equipmentContext.available,
  });
  const remappedPhaseWeek = remapWeekForProgressiveNovelty({
    currentWeek: currentProgram.week,
    nextWeek: phaseWeek,
    available: equipmentContext.available,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    painAreas: questionnaire.painAreas,
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
  });
  const distinctOptimizedPhaseWeek = progressedPhaseWeek.map((day) =>
    ensureDistinctRoutine(day, equipmentContext.available)
  );

  const phaseMeta = getPhaseMetaByIndex(nextPhaseIndex);
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate,
    painFlag,
    fatigueFlag,
    phaseName: phaseMeta.phaseName,
    trainingState,
  });
  const enhancedNextWeekPlan = {
    ...nextWeekPlan,
    change: `${nextWeekPlan.change} ${optimizedPhase.summary}`,
  };
  const intelligence = buildProgramIntelligence({
    questionnaire,
    phaseIndex: phaseProgram.phaseIndex ?? nextPhaseIndex,
    cycleIndex: phaseProgram.cycleIndex ?? nextCycleIndex,
    weekIndex: phaseProgram.weekIndex ?? nextWeekIndex,
    week: distinctOptimizedPhaseWeek,
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
      week: distinctOptimizedPhaseWeek,
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
  } = params;

  const phaseIndex = currentProgram.phaseIndex ?? 1;
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

  const program = generateWeeklyProgram(questionnaire, nextProgramId, {
    phaseIndex: transition.next.phaseIndex,
    weekIndex: transition.next.weekIndex,
    cycleIndex: transition.next.cycleIndex,
    totalWeekIndex: transition.next.totalWeekIndex,
    trainingState,
  });
  const equipmentContext = normalizeEquipmentSelection(questionnaire.equipment);
  const nextWeek = enforceMaterialWeekChange({
    currentWeek: currentProgram.week,
    nextWeek: program.week,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    available: equipmentContext.available,
  });
  const remappedNextWeek = remapWeekForProgressiveNovelty({
    currentWeek: currentProgram.week,
    nextWeek,
    available: equipmentContext.available,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    painAreas: questionnaire.painAreas,
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
  });
  const distinctOptimizedCycleWeek = progressedCycleWeek.map((day) =>
    ensureDistinctRoutine(day, equipmentContext.available)
  );

  const phaseMeta = getPhaseMetaByIndex(transition.next.phaseIndex);
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate,
    painFlag,
    fatigueFlag,
    phaseName: phaseMeta.phaseName,
    trainingState,
  });
  const enhancedNextWeekPlan = {
    ...nextWeekPlan,
    change: `${nextWeekPlan.change} ${optimizedCycle.summary}`,
  };
  const intelligence = buildProgramIntelligence({
    questionnaire,
    phaseIndex: program.phaseIndex ?? transition.next.phaseIndex,
    cycleIndex: program.cycleIndex ?? transition.next.cycleIndex,
    weekIndex: program.weekIndex ?? transition.next.weekIndex,
    week: distinctOptimizedCycleWeek,
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
      week: distinctOptimizedCycleWeek,
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
