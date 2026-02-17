import { exerciseById } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import type { ProgramDay } from "@/lib/types";
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
  type WarmupBlock,
  type WarmupItem,
} from "@/lib/program/warmupLibrary";

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
  return {
    reducePainGoal: goal.includes("pain"),
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
    maxItems: 4,
    minDurationSec: 210,
    maxDurationSec: 390,
  };
  const activation = {
    minItems: 2,
    maxItems: 3,
    minDurationSec: 90,
    maxDurationSec: 210,
  };
  const cooldown = {
    minItems: 1,
    maxItems: 1,
    minDurationSec: 45,
    maxDurationSec: 120,
  };

  if (isLegDayIntent(dayIntent) || signals.hipBias) {
    warmup.minDurationSec = 240;
    warmup.maxDurationSec = 420;
  }
  if (signals.highPain || signals.reducePainGoal) {
    cooldown.maxItems = 2;
    cooldown.minDurationSec = 60;
    cooldown.maxDurationSec = 180;
  }
  if (signals.beginner && !signals.highPain) {
    cooldown.maxItems = Math.max(cooldown.maxItems, 2);
  }
  if (signals.advanced && !signals.reducePainGoal) {
    warmup.maxItems = Math.min(4, warmup.maxItems);
    activation.maxItems = Math.min(3, activation.maxItems);
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

  while (entries.length > minItems && sectionDurationSec(entries) > maxDurationSec) {
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
