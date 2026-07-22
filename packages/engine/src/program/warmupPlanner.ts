import { exerciseById, exercises } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import type { LadderState, ProgramDay } from "@/lib/types";
import {
  isBackChestIntent,
  isCoreStabilityIntent,
  isLegDayIntent,
  isShoulderIntent,
  resolveCooldownBlockOrder,
  resolveWarmupContractRules,
  type DayIntent,
  type WarmupCapabilityMode,
  type WarmupContractRule,
} from "@/lib/program/warmupContracts";
import {
  getWarmupBlockById,
  listWarmupBlocks,
  type WarmupBlock,
  type WarmupItem,
} from "@/lib/program/warmupLibrary";
import { getJointsForPatterns } from "@/lib/program/patternJointMap";
import { getPrevLadderRung } from "@/lib/program/ladderAdvancement";

type PlannedEntry = {
  item: WarmupItem;
  sourceBlockId: string;
  required: boolean;
};

type WarmupPlanningContext = {
  goal?: string;
  experienceLevel?: string;
  poseFocusTags?: Iterable<string>;
  painSeverity?: "low" | "medium" | "high";
};

type WarmupPlanningSignals = {
  reducePainGoal: boolean;
  defaultGeneralFitnessNoPain: boolean;
  beginner: boolean;
  advanced: boolean;
  scapBias: boolean;
  hipBias: boolean;
  tSpineBias: boolean;
  highPain: boolean;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const parsePainTokens = (pain: string[]) =>
  new Set(
    pain
      .flatMap((value) => value.split(/[,_/]+/))
      .map(normalizeToken)
      .filter(Boolean)
  );

const hasIntersection = (left: Set<string>, right: Set<string>) => {
  for (const item of left) {
    if (right.has(item)) return true;
  }
  return false;
};

const isWarmupItemEquipmentEligible = (item: WarmupItem, equipment: Set<Equipment>) => {
  if (item.equipment.includes("none")) return true;
  return item.equipment.every((required) => equipment.has(required));
};

const isWarmupItemPainEligible = (item: WarmupItem, painTokens: Set<string>) => {
  if (!item.painAreasToAvoid?.length || painTokens.size === 0) return true;
  const avoidTokens = new Set(item.painAreasToAvoid.map(normalizeToken));
  return !hasIntersection(avoidTokens, painTokens);
};

const hasRuleSatisfied = (entries: PlannedEntry[], rule: WarmupContractRule) =>
  entries.some((entry) => rule.candidateBlockIds.includes(entry.sourceBlockId));

const markRuleEntriesRequired = (entries: PlannedEntry[], rule: WarmupContractRule) => {
  entries.forEach((entry) => {
    if (rule.candidateBlockIds.includes(entry.sourceBlockId)) {
      entry.required = true;
    }
  });
};

const sectionDurationSec = (entries: PlannedEntry[]) =>
  entries.reduce((total, entry) => total + (entry.item.durationSec ?? 60), 0);

const resolveSection = (rule: WarmupContractRule) => rule.section;

const tryAddItemFromBlockOrder = (params: {
  entries: PlannedEntry[];
  blockIds: string[];
  usedIds: Set<string>;
  equipment: Set<Equipment>;
  painTokens: Set<string>;
  required: boolean;
  allowUsedIds?: boolean;
}) => {
  const {
    entries,
    blockIds,
    usedIds,
    equipment,
    painTokens,
    required,
    allowUsedIds = false,
  } = params;

  for (const blockId of blockIds) {
    const block = getWarmupBlockById(blockId);
    if (!block) continue;

    const candidate = block.items.find((item) => {
      if (!allowUsedIds && usedIds.has(item.id)) return false;
      if (!isWarmupItemEquipmentEligible(item, equipment)) return false;
      if (!isWarmupItemPainEligible(item, painTokens)) return false;
      return true;
    });

    if (!candidate) continue;
    entries.push({ item: candidate, sourceBlockId: blockId, required });
    usedIds.add(candidate.id);
    return true;
  }
  return false;
};

const buildIntentTags = (intent: DayIntent) => {
  const tags = new Set<string>([`day_${normalizeToken(intent.dayName)}`]);
  Object.entries(intent.movement).forEach(([key, active]) => {
    if (active) tags.add(`movement_${normalizeToken(key)}`);
  });
  Object.entries(intent.emphasis).forEach(([key, active]) => {
    if (active) tags.add(`emphasis_${normalizeToken(key)}`);
  });
  return Array.from(tags);
};

const toArrayFromIterable = (values?: Iterable<string>) => {
  if (!values) return [];
  if (Array.isArray(values)) return values;
  return Array.from(values);
};

const derivePlanningSignals = (
  context: WarmupPlanningContext | undefined,
  painTokens: Set<string>
): WarmupPlanningSignals => {
  const goal = normalizeToken(context?.goal ?? "");
  const experience = normalizeToken(context?.experienceLevel ?? "");
  const poseTags = new Set(toArrayFromIterable(context?.poseFocusTags).map(normalizeToken));
  const painSeverity = context?.painSeverity ?? "low";
  const noPain = painSeverity === "low" && painTokens.size === 0;
  return {
    reducePainGoal: goal.includes("pain"),
    defaultGeneralFitnessNoPain:
      noPain && goal.includes("general") && goal.includes("fitness"),
    beginner: experience === "beginner",
    advanced: experience === "advanced",
    scapBias:
      poseTags.has("scapular_control") ||
      poseTags.has("forward_head") ||
      poseTags.has("thoracic_extension"),
    hipBias: poseTags.has("hip_stability"),
    tSpineBias: poseTags.has("thoracic_extension") || poseTags.has("forward_head"),
    highPain: painSeverity === "high" || painTokens.size >= 2,
  };
};

const prioritizeBlockIds = (blockIds: string[], preferredIds: string[]) => {
  const ordered: string[] = [];
  preferredIds.forEach((id) => {
    if (!ordered.includes(id)) {
      ordered.push(id);
    }
  });
  blockIds.forEach((id) => {
    if (!ordered.includes(id)) {
      ordered.push(id);
    }
  });
  return ordered;
};

const prioritizeRulesForSignals = (
  rules: WarmupContractRule[],
  dayIntent: DayIntent,
  signals: WarmupPlanningSignals
) =>
  rules.map((rule) => {
    if (rule.id === "global-mobility") {
      const preferred = signals.hipBias
        ? ["hip-opener-rotation", "ankle-dorsiflexion-prep", "t-spine-mobility"]
        : signals.scapBias || signals.tSpineBias
        ? ["shoulder-scap-prep", "t-spine-mobility", "hip-opener-rotation"]
        : isLegDayIntent(dayIntent)
        ? ["hip-opener-rotation", "ankle-dorsiflexion-prep", "t-spine-mobility"]
        : ["t-spine-mobility", "shoulder-scap-prep", "hip-opener-rotation"];
      return {
        ...rule,
        candidateBlockIds: prioritizeBlockIds(rule.candidateBlockIds, preferred),
      };
    }
    if (rule.id === "global-activation") {
      const preferred =
        isLegDayIntent(dayIntent) || signals.hipBias
          ? ["glute-activation", "hinge-patterning", "core-brace-patterning"]
          : isShoulderIntent(dayIntent)
          ? ["serratus-upward-rotation-prep", "rotator-cuff-prep", "core-brace-patterning"]
          : signals.scapBias
          ? ["serratus-upward-rotation-prep", "row-push-rehearsal", "core-brace-patterning"]
          : ["core-brace-patterning", "row-push-rehearsal", "glute-activation"];
      return {
        ...rule,
        candidateBlockIds: prioritizeBlockIds(rule.candidateBlockIds, preferred),
      };
    }
    return rule;
  });

const warmupFillerOrder = (intent: DayIntent, signals: WarmupPlanningSignals) => {
  if (isLegDayIntent(intent)) {
    if (signals.hipBias || signals.highPain) {
      return [
        "hip-opener-rotation",
        "ankle-dorsiflexion-prep",
        "glute-activation",
        "t-spine-mobility",
      ];
    }
    return [
      "hip-opener-rotation",
      "ankle-dorsiflexion-prep",
      "glute-activation",
      "hinge-patterning",
      "squat-patterning",
      "t-spine-mobility",
    ];
  }
  if (isShoulderIntent(intent) || isBackChestIntent(intent)) {
    if (signals.scapBias || signals.tSpineBias) {
      return [
        "shoulder-scap-prep",
        "t-spine-mobility",
        "serratus-upward-rotation-prep",
        "row-push-rehearsal",
      ];
    }
    return [
      "shoulder-scap-prep",
      "t-spine-mobility",
      "serratus-upward-rotation-prep",
      "row-push-rehearsal",
      "core-brace-patterning",
    ];
  }
  if (isCoreStabilityIntent(intent)) {
    return [
      "t-spine-mobility",
      "hip-opener-rotation",
      "core-brace-patterning",
      "anti-rotation",
      "ankle-dorsiflexion-prep",
    ];
  }
  return [
    "t-spine-mobility",
    "hip-opener-rotation",
    "shoulder-scap-prep",
    "core-brace-patterning",
    "glute-activation",
  ];
};

const activationFillerOrder = (intent: DayIntent, signals: WarmupPlanningSignals) => {
  if (isLegDayIntent(intent)) {
    if (signals.hipBias || signals.highPain) {
      return ["glute-activation", "hinge-patterning", "core-brace-patterning"];
    }
    return ["glute-activation", "hinge-patterning", "squat-patterning", "core-brace-patterning"];
  }
  if (isShoulderIntent(intent)) {
    if (signals.scapBias) {
      return [
        "serratus-upward-rotation-prep",
        "rotator-cuff-prep",
        "core-brace-patterning",
      ];
    }
    return [
      "serratus-upward-rotation-prep",
      "rotator-cuff-prep",
      "row-push-rehearsal",
      "core-brace-patterning",
    ];
  }
  if (isBackChestIntent(intent)) {
    if (signals.scapBias || signals.tSpineBias) {
      return ["row-push-rehearsal", "serratus-upward-rotation-prep", "core-brace-patterning"];
    }
    return [
      "row-push-rehearsal",
      "serratus-upward-rotation-prep",
      "core-brace-patterning",
      "anti-rotation",
    ];
  }
  if (isCoreStabilityIntent(intent)) {
    return ["anti-rotation", "core-brace-patterning", "glute-activation", "row-push-rehearsal"];
  }
  return ["core-brace-patterning", "row-push-rehearsal", "glute-activation", "anti-rotation"];
};

const resolveSectionTargets = (params: {
  dayIntent: DayIntent;
  signals: WarmupPlanningSignals;
}) => {
  const { dayIntent, signals } = params;

  const warmup = {
    minItems: 3,
    maxItems: 3,
    minDurationSec: 210,
    maxDurationSec: 360,
  };
  const activation = {
    minItems: 2,
    maxItems: 2,
    minDurationSec: 90,
    maxDurationSec: 180,
  };
  const cooldown = {
    minItems: 1,
    maxItems: 1,
    minDurationSec: 45,
    maxDurationSec: 120,
  };

  if (isLegDayIntent(dayIntent) || signals.hipBias) {
    warmup.minDurationSec = 240;
    warmup.maxDurationSec = 360;
  }
  if (signals.defaultGeneralFitnessNoPain && !signals.scapBias && !signals.hipBias) {
    warmup.minItems = isLegDayIntent(dayIntent) ? 3 : 2;
    warmup.maxItems = 3;
    warmup.minDurationSec = isLegDayIntent(dayIntent) ? 210 : 150;
    warmup.maxDurationSec = isLegDayIntent(dayIntent) ? 360 : 270;
    activation.minItems = 1;
    activation.maxItems = 2;
    activation.minDurationSec = 60;
    activation.maxDurationSec = 150;
  }
  if (signals.highPain || signals.reducePainGoal) {
    cooldown.minItems = 1;
    cooldown.maxItems = 1;
    cooldown.minDurationSec = 60;
    cooldown.maxDurationSec = 120;
  }
  if (signals.defaultGeneralFitnessNoPain) {
    cooldown.minItems = 1;
    cooldown.maxItems = 1;
    cooldown.minDurationSec = 60;
    cooldown.maxDurationSec = 120;
  }
  if (signals.advanced && !signals.reducePainGoal) {
    warmup.maxItems = Math.min(3, warmup.maxItems);
    activation.maxItems = Math.min(2, activation.maxItems);
  }

  return { warmup, activation, cooldown };
};

const enforceSectionTargets = (params: {
  entries: PlannedEntry[];
  usedIds: Set<string>;
  equipment: Set<Equipment>;
  painTokens: Set<string>;
  minItems: number;
  maxItems: number;
  minDurationSec: number;
  maxDurationSec: number;
  fillerBlockIds: string[];
  allowRequiredTrim?: boolean;
}) => {
  const {
    entries,
    usedIds,
    equipment,
    painTokens,
    minItems,
    maxItems,
    minDurationSec,
    maxDurationSec,
    fillerBlockIds,
    allowRequiredTrim = false,
  } = params;

  let safety = 0;
  while (
    safety < 24 &&
    entries.length < maxItems &&
    (entries.length < minItems || sectionDurationSec(entries) < minDurationSec)
  ) {
    const added = tryAddItemFromBlockOrder({
      entries,
      blockIds: fillerBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: false,
    });
    if (!added) break;
    safety += 1;
  }

  while (
    entries.length > minItems &&
    (entries.length > maxItems || sectionDurationSec(entries) > maxDurationSec)
  ) {
    const removableIndex = [...entries].reverse().findIndex((entry) => {
      if (!entry.required) return true;
      return allowRequiredTrim;
    });
    if (removableIndex < 0) break;
    const actualIndex = entries.length - 1 - removableIndex;
    const [removed] = entries.splice(actualIndex, 1);
    if (removed) {
      usedIds.delete(removed.item.id);
    }
  }
};

const buildCooldownBlock = (params: {
  dayIntent: DayIntent;
  usedIds: Set<string>;
  equipment: Set<Equipment>;
  painTokens: Set<string>;
  minItems: number;
  maxItems: number;
  minDurationSec: number;
  maxDurationSec: number;
}) => {
  const {
    dayIntent,
    usedIds,
    equipment,
    painTokens,
    minItems,
    maxItems,
    minDurationSec,
    maxDurationSec,
  } = params;
  const entries: PlannedEntry[] = [];
  const candidateBlockIds = resolveCooldownBlockOrder(dayIntent);

  tryAddItemFromBlockOrder({
    entries,
    blockIds: candidateBlockIds,
    usedIds,
    equipment,
    painTokens,
    required: true,
  });

  if (minItems >= 2 && entries.length < maxItems) {
    const recoveryFirstBlockIds = [
      "cooldown-core",
      ...candidateBlockIds.filter((blockId) => blockId !== "cooldown-core"),
    ];
    tryAddItemFromBlockOrder({
      entries,
      blockIds: recoveryFirstBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: true,
    });
  }

  let safety = 0;
  while (
    safety < 12 &&
    entries.length < maxItems &&
    (entries.length < minItems || sectionDurationSec(entries) < minDurationSec)
  ) {
    const added = tryAddItemFromBlockOrder({
      entries,
      blockIds: candidateBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: false,
    });
    if (!added) break;
    safety += 1;
  }

  while (
    entries.length > minItems &&
    (entries.length > maxItems || sectionDurationSec(entries) > maxDurationSec)
  ) {
    const removableIndex = [...entries]
      .reverse()
      .findIndex((entry) => !entry.required);
    if (removableIndex < 0) break;
    const actualIndex = entries.length - 1 - removableIndex;
    const [removed] = entries.splice(actualIndex, 1);
    if (removed) {
      usedIds.delete(removed.item.id);
    }
  }

  return {
    id: `${normalizeToken(dayIntent.dayName)}-cooldown`,
    title: "Cooldown",
    tags: [...buildIntentTags(dayIntent), "cooldown"],
    items: entries.map((entry) => entry.item),
  } satisfies WarmupBlock;
};

const addSkeletonBlocks = (params: {
  rules: WarmupContractRule[];
  warmupEntries: PlannedEntry[];
  activationEntries: PlannedEntry[];
  usedIds: Set<string>;
  equipment: Set<Equipment>;
  painTokens: Set<string>;
}) => {
  const { rules, warmupEntries, activationEntries, usedIds, equipment, painTokens } = params;
  const globalRuleOrder = ["global-general", "global-mobility", "global-activation"];
  globalRuleOrder.forEach((ruleId) => {
    const rule = rules.find((candidate) => candidate.id === ruleId);
    if (!rule) return;
    const entries = resolveSection(rule) === "warmup" ? warmupEntries : activationEntries;
    tryAddItemFromBlockOrder({
      entries,
      blockIds: rule.candidateBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: false,
    });
  });
};

const enforceRules = (params: {
  rules: WarmupContractRule[];
  warmupEntries: PlannedEntry[];
  activationEntries: PlannedEntry[];
  usedIds: Set<string>;
  equipment: Set<Equipment>;
  painTokens: Set<string>;
}) => {
  const { rules, warmupEntries, activationEntries, usedIds, equipment, painTokens } = params;
  rules.forEach((rule) => {
    const entries = resolveSection(rule) === "warmup" ? warmupEntries : activationEntries;
    if (hasRuleSatisfied(entries, rule)) {
      markRuleEntriesRequired(entries, rule);
      return;
    }
    const added = tryAddItemFromBlockOrder({
      entries,
      blockIds: rule.candidateBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: true,
    });
    if (added) return;
    const reused = tryAddItemFromBlockOrder({
      entries,
      blockIds: rule.candidateBlockIds,
      usedIds,
      equipment,
      painTokens,
      required: true,
      allowUsedIds: true,
    });
    if (reused) {
      markRuleEntriesRequired(entries, rule);
    }
  });
};

export const deriveDayIntentFromProgramDay = (
  day: Pick<ProgramDay, "title" | "routine">
): DayIntent => {
  const mainRoutine = day.routine.filter((item) => item.section === "main");
  const sourceItems = mainRoutine.length
    ? mainRoutine
    : day.routine.filter((item) => item.section !== "cooldown");
  const sourceExercises = sourceItems
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is NonNullable<ReturnType<typeof exerciseById>> => Boolean(exercise));

  const patternTokens = new Set<string>();
  const descriptorTokens = new Set<string>();
  sourceExercises.forEach((exercise) => {
    exercise.movementPattern.forEach((pattern) => patternTokens.add(normalizeToken(pattern)));
    [...(exercise.tags ?? []), ...(exercise.focusTags ?? []), ...(exercise.muscleGroups ?? [])].forEach(
      (token) => descriptorTokens.add(normalizeToken(token))
    );
  });

  const hasPattern = (...patterns: string[]) =>
    patterns.some((pattern) => patternTokens.has(normalizeToken(pattern)));
  const hasDescriptor = (...tokens: string[]) =>
    tokens.some((token) => descriptorTokens.has(normalizeToken(token)));

  const pullMain = hasPattern("pull", "horizontal_pull", "vertical_pull");
  const pushMain = hasPattern("push", "horizontal_push");
  const hingeMain = hasPattern("hinge");
  const squatMain = hasPattern("squat", "knee_dominant");
  const overhead =
    hasPattern("vertical_push", "verticalpush") ||
    hasDescriptor("overhead", "verticalpush");
  const core = hasPattern("core", "anti_rotation", "anti_extension");
  const carries = hasPattern("carry");

  return {
    dayName: day.title,
    movement: {
      pullMain,
      pushMain,
      hingeMain,
      squatMain,
      overhead,
      core,
      carries,
    },
    emphasis: {
      hips:
        hasDescriptor("hips", "hip", "glutes", "glute", "hamstrings", "posterior_chain") ||
        hingeMain ||
        squatMain,
      shoulders:
        hasDescriptor("shoulders", "shoulder", "delts", "delt", "scap", "scapular", "serratus") ||
        overhead,
      tSpine: hasDescriptor("t_spine", "thoracic", "upper_back", "posture", "scapular"),
      ankles:
        hasDescriptor("ankles", "ankle", "calves", "calf") ||
        hasPattern("knee_dominant") ||
        squatMain,
    },
  };
};

export type FourBlockWarmupOptions = {
  /**
   * Phase 3W — LadderState for PRIME block generation.
   * When present, the planner looks up d1–d2 rungs for each of today's main
   * patterns and adds them as PRIME items (unloaded rehearsal).
   */
  ladderState?: LadderState;
  /**
   * Phase 3W — Total warmup budget in seconds (default 360 = 6 min).
   * Clamped internally to 300–480 s (5–8 min per contract).
   */
  budgetSec?: number;
  /** Assessment focus tags (e.g. "forward_head") for overlay injection. */
  poseFocusTags?: Set<string>;
  /** Goal string forwarded to the existing planning-signals derivation. */
  goal?: string;
  experienceLevel?: string;
  painSeverity?: "low" | "medium" | "high";
};

// ---------------------------------------------------------------------------
// Phase 3W helpers
// ---------------------------------------------------------------------------

const ALL_WARMUP_ITEMS: WarmupItem[] = (() => {
  const seen = new Set<string>();
  return listWarmupBlocks().flatMap((block) =>
    block.items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
  );
})();

/**
 * Return all warmup-library items whose `mobilizes` array overlaps with
 * at least one joint in `targetJoints`, filtered by equipment and pain.
 */
const findMobilizeItems = (
  targetJoints: string[],
  usedIds: Set<string>,
  equipment: Set<Equipment>,
  painTokens: Set<string>
): WarmupItem[] => {
  const jointSet = new Set(targetJoints);
  return ALL_WARMUP_ITEMS.filter((item) => {
    if (usedIds.has(item.id)) return false;
    if (!isWarmupItemEquipmentEligible(item, equipment)) return false;
    if (!isWarmupItemPainEligible(item, painTokens)) return false;
    return (item.mobilizes ?? []).some((j) => jointSet.has(j));
  });
};

/**
 * Exercise → minimal WarmupItem for the PRIME block.
 * Items are presented as unloaded/light rehearsal (durationSec: 60).
 */
const exerciseToWarmupItem = (exerciseId: string): WarmupItem | null => {
  const ex = exerciseById(exerciseId);
  if (!ex) return null;
  return {
    id: ex.id,
    name: ex.name,
    tags: [...(ex.tags ?? []), "prime"],
    equipment: ex.equipment,
    durationSec: 60,
    reps: "5-6 (unloaded / light)",
    cue: (ex.cues?.[0] ?? "") + " — treat as pattern rehearsal, not a working set.",
    primes: ex.pattern ? [ex.pattern] : [],
    mobilizes: ex.mobilizes ?? [],
    painAreasToAvoid: ex.painContraindications ?? [],
  };
};

/**
 * Find d1 and d2 exercises for a pattern starting from the current rung.
 * Returns ALL d1 exercises for the pattern when no ladder state is provided,
 * ordered so the caller can pick the first equipment-eligible one.
 * When ladder state is provided, walks backwards to find the d1/d2 ancestors
 * of the current rung (plus all d1 exercises as fallback).
 */
const getD1D2RunsForPattern = (
  pattern: string,
  currentExerciseId: string | undefined
): string[] => {
  // All d1 exercises for the pattern (sorted deterministically by id)
  const allD1 = exercises
    .filter(
      (ex) => ex.pattern === pattern && ex.category === "main" && (ex.difficulty ?? 99) === 1
    )
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((ex) => ex.id);

  // No ladder state → return all d1 candidates (caller picks first eligible)
  if (!currentExerciseId) return allD1;

  const current = exerciseById(currentExerciseId);
  if (!current) return allD1;

  // If we're already at d1 or d2, use the current rung as the primer
  if ((current.difficulty ?? 99) <= 2) return [currentExerciseId, ...allD1.filter((id) => id !== currentExerciseId)];

  // Walk backwards to find the d2 (or d1) ancestor of the current rung
  const rungs: string[] = [];
  let cursor: string | null = currentExerciseId;
  while (cursor) {
    const ex = exerciseById(cursor);
    if (!ex) break;
    const diff = ex.difficulty ?? 99;
    if (diff <= 2) {
      rungs.unshift(cursor);
      if (diff === 1) break;
    }
    cursor = getPrevLadderRung(cursor);
  }

  // Prefer: ancestor d2/d1 → all d1 exercises as fallback
  const preferred = rungs.length ? [rungs[rungs.length - 1]!] : [];
  const fallback = allD1.filter((id) => !preferred.includes(id));
  return [...preferred, ...fallback];
};

/** Pattern→toolbox block mapping for ACTIVATE (phase 3W). */
const PATTERN_TOOLBOX_BLOCK: Readonly<Record<string, string>> = {
  horizontal_pull: "toolbox-scap-health",
  vertical_pull:   "toolbox-scap-health",
  horizontal_push: "toolbox-scap-health",
  vertical_push:   "toolbox-scap-health",
  hinge:           "toolbox-hip-health",
  knee_dominant:   "toolbox-knee-health",
  core_stability:  "toolbox-core-health",
};

/** Assessment focus-tag → injected warmup item IDs (forward_head → chin-tuck / wall-slide). */
const FOCUS_TAG_INJECTIONS: Readonly<Record<string, string[]>> = {
  forward_head:      ["wall-slides", "scap-cars"],
  thoracic_extension:["thoracic-open-book", "thread-the-needle"],
  hip_stability:     ["ninety-ninety-switches", "glute-bridge-activation"],
  scapular_control:  ["serratus-wall-slide", "scap-cars"],
};

/** Protective injection: joint pain flag → warmup item IDs to inject. */
const PAIN_PROTECTIVE_INJECTIONS: Array<{
  painTokens: string[];
  injectedItems: string[];
  requiresLowerDay?: boolean;
  requiresUpperDay?: boolean;
}> = [
  {
    painTokens: ["knee", "knees"],
    injectedItems: ["half-kneeling-knee-over-toe-rocks", "wall-supported-deep-knee-bend-hold"],
    requiresLowerDay: true,
  },
  {
    painTokens: ["shoulder", "shoulders"],
    injectedItems: ["serratus-wall-slide", "scap-cars"],
    requiresUpperDay: true,
  },
];

export const buildWarmupForDay = (
  dayIntent: DayIntent,
  equipment: Set<Equipment>,
  capability: WarmupCapabilityMode,
  pain: string[] = [],
  context?: WarmupPlanningContext
) => {
  const painTokens = parsePainTokens(pain);
  const signals = derivePlanningSignals(context, painTokens);
  const rules = prioritizeRulesForSignals(
    resolveWarmupContractRules(dayIntent, capability),
    dayIntent,
    signals
  );
  const sectionTargets = resolveSectionTargets({ dayIntent, signals });
  const warmupEntries: PlannedEntry[] = [];
  const activationEntries: PlannedEntry[] = [];
  const usedIds = new Set<string>();

  addSkeletonBlocks({
    rules,
    warmupEntries,
    activationEntries,
    usedIds,
    equipment,
    painTokens,
  });

  enforceRules({
    rules,
    warmupEntries,
    activationEntries,
    usedIds,
    equipment,
    painTokens,
  });

  enforceSectionTargets({
    entries: warmupEntries,
    usedIds,
    equipment,
    painTokens,
    minItems: sectionTargets.warmup.minItems,
    maxItems: sectionTargets.warmup.maxItems,
    minDurationSec: sectionTargets.warmup.minDurationSec,
    maxDurationSec: sectionTargets.warmup.maxDurationSec,
    fillerBlockIds: warmupFillerOrder(dayIntent, signals),
    allowRequiredTrim: true,
  });

  enforceSectionTargets({
    entries: activationEntries,
    usedIds,
    equipment,
    painTokens,
    minItems: sectionTargets.activation.minItems,
    maxItems: sectionTargets.activation.maxItems,
    minDurationSec: sectionTargets.activation.minDurationSec,
    maxDurationSec: sectionTargets.activation.maxDurationSec,
    fillerBlockIds: activationFillerOrder(dayIntent, signals),
    allowRequiredTrim: true,
  });

  const cooldownBlock = buildCooldownBlock({
    dayIntent,
    usedIds,
    equipment,
    painTokens,
    minItems: sectionTargets.cooldown.minItems,
    maxItems: sectionTargets.cooldown.maxItems,
    minDurationSec: sectionTargets.cooldown.minDurationSec,
    maxDurationSec: sectionTargets.cooldown.maxDurationSec,
  });

  const intentTags = buildIntentTags(dayIntent);

  return {
    warmupBlock: {
      id: `${normalizeToken(dayIntent.dayName)}-warmup`,
      title: "Warmup",
      tags: [...intentTags, "warmup"],
      items: warmupEntries.map((entry) => entry.item),
    } satisfies WarmupBlock,
    activationBlock: {
      id: `${normalizeToken(dayIntent.dayName)}-activation`,
      title: "Activation + Patterning",
      tags: [...intentTags, "activation"],
      items: activationEntries.map((entry) => entry.item),
    } satisfies WarmupBlock,
    cooldownBlock,
  };
};

// ---------------------------------------------------------------------------
// Phase 3W — Four-block contract
// ---------------------------------------------------------------------------

/**
 * Build the Phase 3W four-block warmup for a single training day.
 *
 * Blocks in order:
 *   RAMP     — 1 general pick (raise temperature)
 *   MOBILIZE — picks targeting joints loaded by today's main patterns
 *   ACTIVATE — lane-toolbox picks (scap_health / hip_health / knee_health / core_health)
 *   PRIME    — d1–d2 ladder rung per main pattern (unloaded rehearsal)
 *
 * Overlays applied AFTER the four-block plan:
 *   - assessment focus tags inject corrective items (forward_head → wall-slides daily)
 *   - pain contraindications filter all blocks (zero silent drops)
 *   - protective injection: joint-pain flag + that joint is loaded → inject mobilizer
 *
 * Budget enforcement: drop ACTIVATE items first, then RAMP items; MOBILIZE
 * and PRIME are load-bearing safety features and drop last.
 *
 * Returns the four WarmupBlocks plus a `warmupDecisionTrace` string array.
 */
export const buildFourBlockWarmup = (
  dayIntent: DayIntent,
  todayPatterns: string[],
  equipment: Set<Equipment>,
  pain: string[] = [],
  options?: FourBlockWarmupOptions
): {
  rampBlock: WarmupBlock;
  mobilizeBlock: WarmupBlock;
  activateBlock: WarmupBlock;
  primeBlock: WarmupBlock;
  cooldownBlock: WarmupBlock;
  warmupDecisionTrace: string[];
} => {
  const dayKey = normalizeToken(dayIntent.dayName);
  const painTokens = parsePainTokens(pain);
  const budgetSec = Math.max(300, Math.min(480, options?.budgetSec ?? 360));
  const ladderState = options?.ladderState;
  const poseFocusTags = options?.poseFocusTags ?? new Set<string>();
  const decisionTrace: string[] = [];
  const usedIds = new Set<string>();

  const isLower = isLegDayIntent(dayIntent);
  const isUpper = isShoulderIntent(dayIntent) || isBackChestIntent(dayIntent);

  // Helper: pick first eligible item from a pool
  const pickFromPool = (pool: WarmupItem[]): WarmupItem | null => {
    return pool.find(
      (item) =>
        !usedIds.has(item.id) &&
        isWarmupItemEquipmentEligible(item, equipment) &&
        isWarmupItemPainEligible(item, painTokens)
    ) ?? null;
  };

  // Helper: pick from a named block
  const pickFromBlock = (blockId: string): WarmupItem | null => {
    const block = getWarmupBlockById(blockId);
    if (!block) return null;
    return pickFromPool(block.items);
  };

  // ── RAMP ──────────────────────────────────────────────────────────────────
  const rampItems: WarmupItem[] = [];
  const rampPick = pickFromBlock("global-general");
  if (rampPick) {
    rampItems.push(rampPick);
    usedIds.add(rampPick.id);
    decisionTrace.push(`RAMP: ${rampPick.name} — general temperature raise`);
  } else {
    decisionTrace.push("RAMP: no eligible item found — block degraded (no silent drop)");
  }

  // ── MOBILIZE ──────────────────────────────────────────────────────────────
  const targetJoints = getJointsForPatterns(todayPatterns);
  const mobilizeItems: WarmupItem[] = [];
  const coveredJoints = new Set<string>();

  // Greedy: pick items until all target joints are covered or pool exhausted
  let mobilizePool = findMobilizeItems(targetJoints, usedIds, equipment, painTokens);
  const MAX_MOBILIZE = 3;
  let safety = 0;
  while (
    safety < 12 &&
    mobilizeItems.length < MAX_MOBILIZE &&
    mobilizePool.length > 0
  ) {
    // Score each candidate by how many NEW TARGET joints it covers.
    // Only joints in targetJoints count — items that exclusively cover
    // non-target joints score 0 and are not picked.
    const jointSet = new Set(targetJoints);
    const scored = mobilizePool
      .map((item) => ({
        item,
        newJoints: (item.mobilizes ?? []).filter(
          (j) => jointSet.has(j) && !coveredJoints.has(j)
        ).length,
      }))
      .sort((a, b) => b.newJoints - a.newJoints);

    const best = scored[0];
    if (!best || best.newJoints === 0) break;

    mobilizeItems.push(best.item);
    usedIds.add(best.item.id);
    (best.item.mobilizes ?? []).forEach((j) => coveredJoints.add(j));
    const because = `joints: ${(best.item.mobilizes ?? []).join(", ")}`;
    decisionTrace.push(`MOBILIZE: ${best.item.name} — ${because}`);

    mobilizePool = findMobilizeItems(targetJoints, usedIds, equipment, painTokens);
    safety++;
  }

  // Degradation: if mobilize is empty, fall back to ramp-like item with trace
  if (mobilizeItems.length === 0) {
    const fallback = pickFromBlock("t-spine-mobility") ?? pickFromBlock("hip-opener-rotation");
    if (fallback) {
      mobilizeItems.push(fallback);
      usedIds.add(fallback.id);
      decisionTrace.push(
        `MOBILIZE: ${fallback.name} — degraded fallback (no joint-specific mobilizer found)`
      );
    } else {
      decisionTrace.push("MOBILIZE: no eligible item found — block degraded; degradationNotes updated");
    }
  }

  // ── ACTIVATE ──────────────────────────────────────────────────────────────
  const activateItems: WarmupItem[] = [];
  const activateToolboxes = new Set<string>();
  for (const pattern of todayPatterns) {
    const toolbox = PATTERN_TOOLBOX_BLOCK[pattern];
    if (toolbox) activateToolboxes.add(toolbox);
  }

  // Multi-lane days: pick one from each relevant toolbox, budget permitting
  for (const toolboxId of activateToolboxes) {
    const pick = pickFromBlock(toolboxId);
    if (pick) {
      activateItems.push(pick);
      usedIds.add(pick.id);
      decisionTrace.push(
        `ACTIVATE: ${pick.name} — toolbox: ${toolboxId} (pattern lanes: ${todayPatterns.join(", ")})`
      );
    } else {
      decisionTrace.push(
        `ACTIVATE: no eligible item in ${toolboxId} — will degrade if needed`
      );
    }
  }

  // Fallback if no toolbox produced items
  if (activateItems.length === 0) {
    const fallback = pickFromBlock("core-brace-patterning");
    if (fallback) {
      activateItems.push(fallback);
      usedIds.add(fallback.id);
      decisionTrace.push(`ACTIVATE: ${fallback.name} — fallback (no toolbox match)`);
    } else {
      decisionTrace.push("ACTIVATE: block degraded — no eligible activation found");
    }
  }

  // ── PRIME ─────────────────────────────────────────────────────────────────
  const primeItems: WarmupItem[] = [];

  for (const pattern of todayPatterns) {
    const currentExerciseId = ladderState?.byPattern[pattern]?.exerciseId;
    const d1d2Ids = getD1D2RunsForPattern(pattern, currentExerciseId);
    const currentName = currentExerciseId
      ? (exerciseById(currentExerciseId)?.name ?? currentExerciseId)
      : "none";

    let primed = false;
    for (const exId of d1d2Ids) {
      if (usedIds.has(exId)) continue;
      const primeItem = exerciseToWarmupItem(exId);
      if (!primeItem) continue;
      if (!isWarmupItemEquipmentEligible(primeItem, equipment)) continue;
      if (!isWarmupItemPainEligible(primeItem, painTokens)) continue;

      primeItems.push(primeItem);
      usedIds.add(exId);
      decisionTrace.push(
        `PRIME: ${primeItem.name} — today's main: ${currentName} (${pattern})`
      );
      primed = true;
      break; // one primer per pattern
    }

    if (!primed) {
      if (d1d2Ids.length === 0) {
        decisionTrace.push(`PRIME: no d1–d2 rung found for pattern ${pattern} — skipped`);
      } else {
        decisionTrace.push(`PRIME: no equipment-eligible d1–d2 rung for pattern ${pattern} — skipped`);
      }
    }
  }

  // ── Assessment focus-tag overlays ─────────────────────────────────────────
  for (const [tag, itemIds] of Object.entries(FOCUS_TAG_INJECTIONS)) {
    if (!poseFocusTags.has(tag)) continue;
    for (const itemId of itemIds) {
      if (usedIds.has(itemId)) continue;
      // Inject into mobilize block (prepend: highest priority)
      const injectPool = ALL_WARMUP_ITEMS.filter((i) => i.id === itemId);
      const inject = pickFromPool(injectPool);
      if (inject) {
        mobilizeItems.unshift(inject);
        usedIds.add(inject.id);
        decisionTrace.push(`MOBILIZE (overlay): ${inject.name} — focus tag: ${tag}`);
        break;
      }
    }
  }

  // ── Protective injection overlay ──────────────────────────────────────────
  for (const rule of PAIN_PROTECTIVE_INJECTIONS) {
    const painMatch = rule.painTokens.some((pt) => painTokens.has(pt));
    if (!painMatch) continue;
    if (rule.requiresLowerDay && !isLower) continue;
    if (rule.requiresUpperDay && !isUpper) continue;

    for (const itemId of rule.injectedItems) {
      if (usedIds.has(itemId)) continue;
      const injectPool = ALL_WARMUP_ITEMS.filter((i) => i.id === itemId);
      const inject = pickFromPool(injectPool);
      if (inject) {
        mobilizeItems.unshift(inject);
        usedIds.add(inject.id);
        decisionTrace.push(
          `MOBILIZE (protective injection): ${inject.name} — ` +
          `${rule.painTokens.join("/")} pain flag active`
        );
        break;
      }
    }
  }

  // ── Budget enforcement ────────────────────────────────────────────────────
  const totalSec = () =>
    rampItems.reduce((s, i) => s + (i.durationSec ?? 60), 0) +
    mobilizeItems.reduce((s, i) => s + (i.durationSec ?? 60), 0) +
    activateItems.reduce((s, i) => s + (i.durationSec ?? 60), 0) +
    primeItems.reduce((s, i) => s + (i.durationSec ?? 60), 0);

  // Drop ACTIVATE items first, then RAMP, then MOBILIZE, PRIME last
  let safetyBudget = 0;
  while (totalSec() > budgetSec && safetyBudget < 20) {
    safetyBudget++;
    if (activateItems.length > 1) {
      const dropped = activateItems.pop();
      if (dropped) {
        decisionTrace.push(`BUDGET: dropped ACTIVATE item "${dropped.name}" (budget ${budgetSec}s)`);
        continue;
      }
    }
    if (rampItems.length > 0) {
      const dropped = rampItems.pop();
      if (dropped) {
        decisionTrace.push(`BUDGET: dropped RAMP item "${dropped.name}" (budget ${budgetSec}s)`);
        continue;
      }
    }
    if (mobilizeItems.length > 1) {
      const dropped = mobilizeItems.pop();
      if (dropped) {
        decisionTrace.push(`BUDGET: dropped MOBILIZE item "${dropped.name}" (budget ${budgetSec}s)`);
        continue;
      }
    }
    if (primeItems.length > 1) {
      const dropped = primeItems.pop();
      if (dropped) {
        decisionTrace.push(`BUDGET: dropped PRIME item "${dropped.name}" (budget ${budgetSec}s)`);
        continue;
      }
    }
    break; // nothing left to drop
  }

  // ── Cooldown: mirror of today's MOBILIZE joints, downshift pool ───────────
  // The signal context (goal, painSeverity) informs whether cooldown is 1 or 2
  // items; derive this from the same signals as buildWarmupForDay uses.
  const cooldownPlanningSignals = derivePlanningSignals(
    {
      goal: options?.goal,
      experienceLevel: options?.experienceLevel,
      poseFocusTags: options?.poseFocusTags,
      painSeverity: options?.painSeverity,
    },
    painTokens
  );
  const cooldownTargets = resolveSectionTargets({ dayIntent, signals: cooldownPlanningSignals });
  const cooldownUsedIds = new Set<string>();
  const cooldownCandidateIds = resolveCooldownBlockOrder(dayIntent);
  const cooldownEntries: PlannedEntry[] = [];
  tryAddItemFromBlockOrder({
    entries: cooldownEntries,
    blockIds: cooldownCandidateIds,
    usedIds: cooldownUsedIds,
    equipment,
    painTokens,
    required: true,
  });
  if (cooldownEntries.length < cooldownTargets.cooldown.maxItems) {
    tryAddItemFromBlockOrder({
      entries: cooldownEntries,
      blockIds: ["cooldown-core", ...cooldownCandidateIds.filter((id) => id !== "cooldown-core")],
      usedIds: cooldownUsedIds,
      equipment,
      painTokens,
      required: false,
    });
  }
  cooldownEntries.forEach((e) => {
    decisionTrace.push(`COOLDOWN: ${e.item.name} — joint mirror: ${targetJoints.join(", ") || "general"}`);
  });

  const intentTags = buildIntentTags(dayIntent);

  return {
    rampBlock: {
      id: `${dayKey}-ramp`,
      title: "Ramp",
      tags: [...intentTags, "ramp", "general"],
      items: rampItems,
    } satisfies WarmupBlock,
    mobilizeBlock: {
      id: `${dayKey}-mobilize`,
      title: "Mobilize",
      tags: [...intentTags, "mobilize"],
      items: mobilizeItems,
    } satisfies WarmupBlock,
    activateBlock: {
      id: `${dayKey}-activate`,
      title: "Activate",
      tags: [...intentTags, "activate"],
      items: activateItems,
    } satisfies WarmupBlock,
    primeBlock: {
      id: `${dayKey}-prime`,
      title: "Prime",
      tags: [...intentTags, "prime"],
      items: primeItems,
    } satisfies WarmupBlock,
    cooldownBlock: {
      id: `${dayKey}-cooldown`,
      title: "Cooldown",
      tags: [...intentTags, "cooldown"],
      items: cooldownEntries.map((e) => e.item),
    } satisfies WarmupBlock,
    warmupDecisionTrace: decisionTrace,
  };
};
