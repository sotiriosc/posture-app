/**
 * Canonical mixed-home program contract (Phase 5B).
 *
 * Dumbbell Full Body A/B/C identity + justified band use + setup coherence.
 */

import { exerciseById, type Exercise } from "@/lib/exercises";
import {
  deriveProgramCapabilities,
  inferExerciseSupportRequirements,
  isSupportConfirmedByCapabilities,
  type ProgramCapabilities,
} from "@/lib/program/equipmentCapabilities";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import {
  countAnchorHeightChanges,
  deriveBandCapabilityOverlay,
  type BandSetupLane,
} from "@/lib/program/bandSetup";
import { resolveBandExerciseRequirement } from "@/lib/program/bandExerciseRequirements";
import {
  MIXED_HOME_FIVE_DAY_TITLES,
  MIXED_HOME_FOUR_DAY_TITLES,
  MIXED_HOME_THREE_DAY_TITLES,
  getMixedHomeDayVolumeContract,
  getMixedHomeMainLanePlan,
  isMixedHomeFullBodyDayTitle,
  looksLikeGymShapedDayTitle,
  maxMixedHomeAnchorHeightChangesForExperience,
  maxMixedHomeSetupBlocksForExperience,
  mixedHomeLaneHasHighAnchor,
  normalizeMixedHomeExperienceLevel,
  refineMixedHomeCapabilityLane,
  resolveMixedHomeDayIdentity,
  type MixedHomeCapabilityLane,
  type MixedHomeSelectedTool,
} from "@/lib/program/mixedHomeTemplates";
import type { Program, ProgramRoutineItem } from "@/lib/types";

export type MixedHomeHardFailureReasonCode =
  | "MIXED_HOME_GYM_TEMPLATE_INHERITANCE"
  | "MIXED_HOME_DUMBBELL_TEMPLATE_ONLY"
  | "MIXED_HOME_BAND_TEMPLATE_ONLY"
  | "MIXED_HOME_ILLEGAL_EQUIPMENT"
  | "MIXED_HOME_UNCONFIRMED_ANCHOR"
  | "MIXED_HOME_UNCONFIRMED_BAND_TYPE"
  | "MIXED_HOME_FALSE_VERTICAL_PULL"
  | "MIXED_HOME_MISSING_HORIZONTAL_PULL"
  | "MIXED_HOME_MISSING_HINGE"
  | "MIXED_HOME_PREP_AS_MAIN"
  | "MIXED_HOME_DAY_IDENTITY_MISMATCH"
  | "MIXED_HOME_RANDOM_EQUIPMENT_MIX"
  | "MIXED_HOME_BAND_OVERUSE"
  | "MIXED_HOME_REDUNDANT_CROSS_TOOL_ROLE"
  | "MIXED_HOME_EXCESS_SETUP_TRANSITIONS"
  | "MIXED_HOME_EXCESS_ANCHOR_CHANGES"
  | "MIXED_HOME_DUPLICATE_FAMILY"
  | "MIXED_HOME_EXCESS_COMPLEXITY"
  | "MIXED_HOME_MISSING_WEEKLY_ROLE"
  | "MIXED_HOME_EXCESSIVE_PHASE_CHURN"
  | "MIXED_HOME_NONDETERMINISTIC_OUTPUT"
  | "MIXED_HOME_IDENTITY_COLLAPSE"
  | "MIXED_HOME_VOLUME_OUTSIDE_CONTRACT";

export type MixedHomeHardFailure = {
  reasonCode: MixedHomeHardFailureReasonCode;
  persona: string;
  setupLane: MixedHomeCapabilityLane | null;
  bandSetupLane: BandSetupLane | null;
  phase: number | null;
  daysPerWeek: number | null;
  dayTitle: string | null;
  slot: string | null;
  exerciseId: string | null;
  expectedRole: string | null;
  actualRole: string | null;
  selectedTool: MixedHomeSelectedTool | null;
  availableAlternativeTools: MixedHomeSelectedTool[];
  setupTransitions: string[];
  requiredCapability: string | null;
  confirmedCapabilities: string[];
  detail: string;
  existedInPhase0Baseline?: boolean;
};

export type DeferredMixedHomeExperienceGap = {
  exerciseId: string;
  dayTitle: string;
  kind: "demo" | "cues" | "progression_link" | "capability_limitation";
  detail: string;
};

export type MixedHomeSetupBlock = {
  tool: MixedHomeSelectedTool;
  exerciseIds: string[];
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const descriptorOf = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""}`.toLowerCase();

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some(
    (entry) => normalizeToken(entry) === normalizeToken(pattern)
  );

const confirmedCapabilityLabels = (capabilities: ProgramCapabilities) =>
  Object.entries(capabilities)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .sort();

const classifyTool = (exercise: Exercise): MixedHomeSelectedTool => {
  if (exercise.equipment.includes("bands")) return "band";
  if (exercise.equipment.includes("dumbbells")) return "dumbbell";
  return "bodyweight";
};

const PAIN_AWARE_HIP_EXTENSION_IDS = new Set([
  "single-leg-glute-bridge-hold",
  "single-leg-hip-thrust",
  "glute-bridges",
]);

const isPrepOnly = (exercise: Exercise) => {
  if (PAIN_AWARE_HIP_EXTENSION_IDS.has(exercise.id)) return false;
  if (exercise.id === "single-leg-rdl") return false;
  if (exercise.id === "bodyweight-squat" || exercise.id === "heels-elevated-squat") {
    return false;
  }
  if (exercise.id === "band-pull-aparts" || exercise.id === "band-pull-apart") {
    return false;
  }
  return (
    Boolean(exercise.supportOnly) ||
    Boolean(exercise.regressionOnly) ||
    exercise.category === "warmup" ||
    exercise.category === "activation" ||
    exercise.category === "cooldown"
  );
};

const isTrueHinge = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  if (descriptor.includes("curl") && descriptor.includes("hamstring")) return false;
  if (PAIN_AWARE_HIP_EXTENSION_IDS.has(exercise.id)) return true;
  return (
    hasPattern(exercise, "hinge") &&
    (descriptor.includes("rdl") ||
      descriptor.includes("deadlift") ||
      descriptor.includes("good morning") ||
      descriptor.includes("hip thrust") ||
      descriptor.includes("glute bridge") ||
      descriptor.includes("glute drive"))
  );
};

const isTrueHorizontalPull = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  if (
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("pulse") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart")
  ) {
    return false;
  }
  return (
    hasPattern(exercise, "horizontalPull") ||
    (hasPattern(exercise, "pull") && descriptor.includes("row"))
  );
};

const isTrueVerticalPull = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "verticalPull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup")
  );
};

const isFalseVerticalPullClaim = (exercise: Exercise, slotKind?: string | null) => {
  const slot = normalizeToken(slotKind ?? "");
  const claimsVertical =
    slot.includes("verticalpull") ||
    slot.includes("pullvertical") ||
    Boolean(exercise.slotRoles?.includes("pullVertical"));
  if (!claimsVertical) return false;
  if (isTrueVerticalPull(exercise)) return false;
  const descriptor = descriptorOf(exercise);
  return (
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("pulse") ||
    descriptor.includes("scap") ||
    descriptor.includes("pull-apart") ||
    isTrueHorizontalPull(exercise)
  );
};

const isScapOrPullApartOnly = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("rear delt")
  );
};

const illegalEquipmentTokens = ["machines", "cables", "barbell", "kettlebell"] as const;

export const classifyMixedHomeSessionTools = (
  day: Program["week"][number],
  options?: { mainsOnly?: boolean }
): {
  dumbbell: number;
  band: number;
  bodyweight: number;
  setupBlocks: MixedHomeSetupBlock[];
  setupSequence: string[];
} => {
  const work = day.routine.filter((item) =>
    options?.mainsOnly
      ? item.section === "main"
      : item.section === "main" || item.section === "accessory"
  );
  let dumbbell = 0;
  let band = 0;
  let bodyweight = 0;
  const setupBlocks: MixedHomeSetupBlock[] = [];
  work.forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    if (!exercise) return;
    const tool = classifyTool(exercise);
    if (tool === "dumbbell") dumbbell += 1;
    else if (tool === "band") band += 1;
    else bodyweight += 1;
    const last = setupBlocks[setupBlocks.length - 1];
    if (last && last.tool === tool) {
      last.exerciseIds.push(exercise.id);
    } else {
      setupBlocks.push({ tool, exerciseIds: [exercise.id] });
    }
  });
  return {
    dumbbell,
    band,
    bodyweight,
    setupBlocks,
    setupSequence: setupBlocks.map(
      (block) => `${block.tool}(${block.exerciseIds.length})`
    ),
  };
};

/**
 * Coalesce main+accessory work into contiguous setup blocks so dual-tool
 * sessions do not thrash (MIXED_HOME_RANDOM_EQUIPMENT_MIX).
 * Preserves relative order within each tool and keeps non-work sections fixed.
 */
export const coalesceMixedHomeSessionWorkOrder = <
  Day extends { routine: ProgramRoutineItem[] }
>(
  day: Day
): Day => {
  const workIndexes: number[] = [];
  const workItems: ProgramRoutineItem[] = [];
  day.routine.forEach((item, index) => {
    if (item.section === "main" || item.section === "accessory") {
      workIndexes.push(index);
      workItems.push(item);
    }
  });
  if (workItems.length < 2) return day;

  const toolOf = (item: ProgramRoutineItem): MixedHomeSelectedTool => {
    const exercise = exerciseById(item.exerciseId);
    return exercise ? classifyTool(exercise) : "bodyweight";
  };

  // Prefer dominant loaded tools first, then bodyweight polish.
  const toolRank: Record<MixedHomeSelectedTool, number> = {
    dumbbell: 0,
    band: 1,
    bodyweight: 2,
  };
  const mains = workItems.filter((item) => item.section === "main");
  const accessories = workItems.filter((item) => item.section === "accessory");
  const sortStableByTool = (items: ProgramRoutineItem[]) =>
    [...items]
      .map((item, index) => ({ item, index, tool: toolOf(item) }))
      .sort((left, right) => {
        const rankDelta = toolRank[left.tool] - toolRank[right.tool];
        if (rankDelta !== 0) return rankDelta;
        return left.index - right.index;
      })
      .map((entry) => entry.item);

  const coalesced = [...sortStableByTool(mains), ...sortStableByTool(accessories)];
  const before = classifyMixedHomeSessionTools(day);
  const probeDay = {
    ...day,
    routine: day.routine.map((item, index) => {
      const workPos = workIndexes.indexOf(index);
      return workPos >= 0 ? coalesced[workPos]! : item;
    }),
  };
  const after = classifyMixedHomeSessionTools(probeDay);
  const beforePathological =
    before.setupBlocks.length >= 5 &&
    before.setupBlocks.every((block) => block.exerciseIds.length === 1) &&
    before.dumbbell > 0 &&
    before.band > 0;
  const afterPathological =
    after.setupBlocks.length >= 5 &&
    after.setupBlocks.every((block) => block.exerciseIds.length === 1) &&
    after.dumbbell > 0 &&
    after.band > 0;
  // Only rewrite when we improve pathological thrash or reduce setup blocks.
  if (
    !beforePathological &&
    after.setupBlocks.length >= before.setupBlocks.length
  ) {
    return day;
  }
  if (afterPathological && after.setupBlocks.length >= before.setupBlocks.length) {
    return day;
  }
  return probeDay;
};

export const collectDeferredMixedHomeExperienceGaps = (
  program: Program,
  options?: { hasTrueVerticalPullCapability?: boolean }
): DeferredMixedHomeExperienceGap[] => {
  const gaps: DeferredMixedHomeExperienceGap[] = [];
  program.week.forEach((day) => {
    day.routine.forEach((item) => {
      if (item.section !== "main" && item.section !== "accessory") return;
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      if (!exercise.videoUrl && exercise.demoStatus !== "url") {
        gaps.push({
          exerciseId: exercise.id,
          dayTitle: day.title,
          kind: "demo",
          detail: "Missing demo URL",
        });
      }
      if (!exercise.cues?.length) {
        gaps.push({
          exerciseId: exercise.id,
          dayTitle: day.title,
          kind: "cues",
          detail: "Missing coaching cues",
        });
      }
      if (!exercise.progressionOf && !exercise.regressionOf) {
        gaps.push({
          exerciseId: exercise.id,
          dayTitle: day.title,
          kind: "progression_link",
          detail: "Missing progression/regression link",
        });
      }
    });
  });
  if (!options?.hasTrueVerticalPullCapability) {
    gaps.push({
      exerciseId: "",
      dayTitle: program.week[0]?.title ?? "",
      kind: "capability_limitation",
      detail:
        "True vertical pulling unavailable without confirmed high-anchor band or pull-up bar",
    });
  }
  return gaps;
};

export const scoreMixedHomeProgramStructuralQuality = (params: {
  failures: MixedHomeHardFailure[];
  deferredGapCount: number;
  setupCoherencePenalty?: number;
}) => {
  const hardPenalty = Math.min(100, params.failures.length * 12);
  const structuralScore = Math.max(0, 100 - hardPenalty);
  const setupPenalty = Math.min(15, params.setupCoherencePenalty ?? 0);
  const deferredPenalty = Math.min(25, params.deferredGapCount * 0.5);
  return {
    structuralScore: Math.max(0, structuralScore - setupPenalty),
    equipmentHonestyScore: Math.max(0, 100 - hardPenalty),
    setupCoherenceScore: Math.max(0, 100 - setupPenalty * 4),
    fullExperienceScore: Math.max(
      0,
      structuralScore - setupPenalty - deferredPenalty
    ),
  };
};

export type ValidateMixedHomeProgramParams = {
  program: Program;
  persona: string;
  equipment: string[];
  bandSetup?: unknown;
  experience?: string;
  painAreas?: string[];
  phaseIndex?: number;
  phase0BaselineReasonCodes?: Set<string>;
};

export const validateMixedHomeProgramContract = (
  params: ValidateMixedHomeProgramParams
): MixedHomeHardFailure[] => {
  const {
    program,
    persona,
    equipment,
    bandSetup,
    experience,
    painAreas = [],
    phaseIndex = null,
    phase0BaselineReasonCodes,
  } = params;
  const failures: MixedHomeHardFailure[] = [];
  const capabilities = deriveProgramCapabilities(equipment);
  const bandOverlay = deriveBandCapabilityOverlay({ equipment, bandSetup });
  const capabilityLane = refineMixedHomeCapabilityLane({
    bandSetupLane: bandOverlay.setupLane,
    resolvedBandSetup: bandOverlay.resolvedSetup,
  });
  const confirmed = confirmedCapabilityLabels(capabilities);
  const canVertical =
    capabilities.hasPullupBar || mixedHomeLaneHasHighAnchor(capabilityLane);

  const pushFailure = (
    failure: Omit<
      MixedHomeHardFailure,
      | "existedInPhase0Baseline"
      | "confirmedCapabilities"
      | "phase"
      | "daysPerWeek"
      | "setupLane"
      | "bandSetupLane"
      | "selectedTool"
      | "availableAlternativeTools"
      | "setupTransitions"
      | "requiredCapability"
    > &
      Partial<
        Pick<
          MixedHomeHardFailure,
          | "phase"
          | "daysPerWeek"
          | "confirmedCapabilities"
          | "setupLane"
          | "bandSetupLane"
          | "selectedTool"
          | "availableAlternativeTools"
          | "setupTransitions"
          | "requiredCapability"
        >
      >
  ) => {
    failures.push({
      ...failure,
      phase: failure.phase ?? phaseIndex,
      daysPerWeek: failure.daysPerWeek ?? program.daysPerWeek,
      confirmedCapabilities: failure.confirmedCapabilities ?? confirmed,
      setupLane: failure.setupLane ?? capabilityLane,
      bandSetupLane: failure.bandSetupLane ?? bandOverlay.setupLane,
      selectedTool: failure.selectedTool ?? null,
      availableAlternativeTools: failure.availableAlternativeTools ?? [
        "dumbbell",
        "band",
        "bodyweight",
      ],
      setupTransitions: failure.setupTransitions ?? [],
      requiredCapability: failure.requiredCapability ?? null,
      existedInPhase0Baseline: phase0BaselineReasonCodes?.has(failure.reasonCode),
    });
  };

  const primaryMode = resolvePrimaryProgramEquipmentMode(equipment);
  if (primaryMode !== "mixedHome") {
    pushFailure({
      reasonCode: "MIXED_HOME_IDENTITY_COLLAPSE",
      persona,
      dayTitle: null,
      slot: null,
      exerciseId: null,
      expectedRole: "mixedHome",
      actualRole: primaryMode,
      detail: `Expected mixedHome primary mode, got ${primaryMode}`,
    });
    return failures;
  }

  const experienceLevel = normalizeMixedHomeExperienceLevel(experience);
  const expectedTitles =
    program.daysPerWeek === 3
      ? MIXED_HOME_THREE_DAY_TITLES
      : program.daysPerWeek === 4
      ? MIXED_HOME_FOUR_DAY_TITLES
      : MIXED_HOME_FIVE_DAY_TITLES;

  const actualTitles = program.week.map((day) => day.title);
  actualTitles.forEach((title) => {
    if (looksLikeGymShapedDayTitle(title)) {
      pushFailure({
        reasonCode: "MIXED_HOME_GYM_TEMPLATE_INHERITANCE",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: "mixed_home_full_body_or_practice",
        actualRole: title,
        detail: "Mixed-home mode inherited a gym-shaped day title",
      });
    }
  });

  // Detect pure dumbbell-only / band-only title sets that are not mixed-home deliberate.
  // Same Full Body titles as dumbbell/band — identity mismatch is about gym inheritance
  // and missing expected titles, not title string uniqueness.
  expectedTitles.forEach((title) => {
    if (!actualTitles.includes(title)) {
      pushFailure({
        reasonCode: "MIXED_HOME_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: title,
        actualRole: actualTitles.join(" | "),
        detail: "Expected mixed-home day title missing from generated week",
      });
    }
  });

  let weeklyHorizontalPull = 0;
  let weeklyTrueHinge = 0;
  let weeklySquat = 0;
  let weeklyPress = 0;
  let weekDumbbellMains = 0;
  let weekBandMains = 0;

  program.week.forEach((day) => {
    const identity = resolveMixedHomeDayIdentity(day.title);
    if (identity === "unknown" && !looksLikeGymShapedDayTitle(day.title)) {
      pushFailure({
        reasonCode: "MIXED_HOME_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: day.title,
        slot: null,
        exerciseId: null,
        expectedRole: "known_mixed_home_day_identity",
        actualRole: "unknown",
        detail: "Unrecognized mixed-home day title",
      });
    }

    const mains = day.routine.filter((item) => item.section === "main");
    const accessories = day.routine.filter((item) => item.section === "accessory");
    const buildReinforceCount = mains.length + accessories.length;
    const complexityCap =
      experienceLevel === "advanced" ? 7 : experienceLevel === "intermediate" ? 6 : 5;
    if (isMixedHomeFullBodyDayTitle(day.title) && buildReinforceCount > complexityCap) {
      pushFailure({
        reasonCode: "MIXED_HOME_EXCESS_COMPLEXITY",
        persona,
        dayTitle: day.title,
        slot: "build_reinforce",
        exerciseId: null,
        expectedRole: `<=${complexityCap}`,
        actualRole: String(buildReinforceCount),
        detail: `Full-body Build/Reinforce count exceeds ${experienceLevel} complexity cap`,
      });
    }

    const volume = getMixedHomeDayVolumeContract(day.title, experienceLevel);
    if (volume && isMixedHomeFullBodyDayTitle(day.title)) {
      if (mains.length > volume.mainCount + 1 || accessories.length > volume.accessoryCount + 1) {
        pushFailure({
          reasonCode: "MIXED_HOME_VOLUME_OUTSIDE_CONTRACT",
          persona,
          dayTitle: day.title,
          slot: "volume",
          exerciseId: null,
          expectedRole: `main<=${volume.mainCount}+1 accessory<=${volume.accessoryCount}+1`,
          actualRole: `main=${mains.length} accessory=${accessories.length}`,
          detail: "Mixed-home session volume far outside experience contract",
        });
      }
    }

    const toolStats = classifyMixedHomeSessionTools(day);
    // Transition caps apply to main-work setup blocks (accessories may add polish tools).
    const mainToolStats = classifyMixedHomeSessionTools(day, { mainsOnly: true });
    const maxBlocks = maxMixedHomeSetupBlocksForExperience(experienceLevel);
    if (mainToolStats.setupBlocks.length > maxBlocks) {
      pushFailure({
        reasonCode: "MIXED_HOME_EXCESS_SETUP_TRANSITIONS",
        persona,
        dayTitle: day.title,
        slot: "setup_blocks",
        exerciseId: null,
        expectedRole: `<=${maxBlocks}`,
        actualRole: String(mainToolStats.setupBlocks.length),
        setupTransitions: mainToolStats.setupSequence,
        detail: "Too many major equipment/setup blocks for experience level",
      });
    }

    // Random mix: every work item changes tool (pathological thrash).
    if (
      toolStats.setupBlocks.length >= 5 &&
      toolStats.setupBlocks.every((block) => block.exerciseIds.length === 1) &&
      toolStats.dumbbell > 0 &&
      toolStats.band > 0
    ) {
      pushFailure({
        reasonCode: "MIXED_HOME_RANDOM_EQUIPMENT_MIX",
        persona,
        dayTitle: day.title,
        slot: "equipment_dominance",
        exerciseId: null,
        expectedRole: "coherent_setup_blocks",
        actualRole: toolStats.setupSequence.join("→"),
        setupTransitions: toolStats.setupSequence,
        detail: "Session appears randomly assembled across tools",
      });
    }

    const rolePlan =
      getMixedHomeMainLanePlan(day.title, experienceLevel, {
        hasTrueVerticalPullCapability: canVertical,
      }) ?? [];
    const mainExercises = mains
      .map((item) => ({ item, exercise: exerciseById(item.exerciseId) }))
      .filter(
        (entry): entry is { item: ProgramRoutineItem; exercise: Exercise } =>
          Boolean(entry.exercise)
      );

    let dayDbMains = 0;
    let dayBandMains = 0;
    let dayHorizontalPull = false;
    let dayTrueHinge = false;
    const familyCounts = new Map<string, number>();
    const roleToolPairs: Array<{ role: string; tool: MixedHomeSelectedTool }> = [];
    const anchorHeights: Array<"none" | "high" | "middle" | "low"> = [];

    mainExercises.forEach(({ item, exercise }, index) => {
      const slotKind = item.selectionDebug?.slotKind ?? null;
      const planned = rolePlan[index];
      const familyKey =
        planned?.family ?? normalizeToken(slotKind ?? exercise.pattern ?? "unknown");
      familyCounts.set(familyKey, (familyCounts.get(familyKey) ?? 0) + 1);
      const tool = classifyTool(exercise);
      roleToolPairs.push({ role: familyKey, tool });
      if (tool === "dumbbell") {
        dayDbMains += 1;
        weekDumbbellMains += 1;
      }
      if (tool === "band") {
        dayBandMains += 1;
        weekBandMains += 1;
      }

      if (isTrueHorizontalPull(exercise)) {
        dayHorizontalPull = true;
        weeklyHorizontalPull += 1;
      }
      if (isTrueHinge(exercise)) {
        dayTrueHinge = true;
        weeklyTrueHinge += 1;
      }
      if (hasPattern(exercise, "squat")) weeklySquat += 1;
      if (hasPattern(exercise, "push") || hasPattern(exercise, "verticalPush")) {
        weeklyPress += 1;
      }

      if (isPrepOnly(exercise)) {
        pushFailure({
          reasonCode: "MIXED_HOME_PREP_AS_MAIN",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: planned?.family ?? "loaded_main",
          actualRole: "preparationOnly",
          selectedTool: tool,
          detail: "Preparation/regression drill filled a mixed-home main role",
        });
      }

      if (isFalseVerticalPullClaim(exercise, slotKind)) {
        pushFailure({
          reasonCode: "MIXED_HOME_FALSE_VERTICAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "honest_non_vertical_or_true_vertical",
          actualRole: "false_vertical_pull_claim",
          selectedTool: tool,
          requiredCapability: canVertical ? "high_anchor_or_pullup_bar" : null,
          detail: "Surrogate must not satisfy true vertical pull",
        });
      }

      // Pull-aparts cannot be the only meaningful pulling role on Full Body A.
      if (
        identity === "full_body_a" &&
        planned?.family === "horizontal_pull" &&
        isScapOrPullApartOnly(exercise)
      ) {
        pushFailure({
          reasonCode: "MIXED_HOME_MISSING_HORIZONTAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "true_horizontal_pull",
          actualRole: "scapular_drill_only",
          selectedTool: tool,
          detail: "Pull-apart/scap drill cannot satisfy Full Body A horizontal pull",
        });
      }

      for (const token of illegalEquipmentTokens) {
        if (exercise.equipment.includes(token)) {
          pushFailure({
            reasonCode: "MIXED_HOME_ILLEGAL_EQUIPMENT",
            persona,
            dayTitle: day.title,
            slot: slotKind,
            exerciseId: exercise.id,
            expectedRole: "dumbbells_bands_bodyweight_only",
            actualRole: token,
            selectedTool: tool,
            detail: `Mixed-home program selected ${token}-dependent exercise`,
          });
        }
      }

      if (exercise.equipment.includes("bands")) {
        const requirement = resolveBandExerciseRequirement({
          exerciseId: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          variantKey: exercise.variantKey,
          cues: exercise.cues,
        });
        if (requirement) {
          anchorHeights.push(
            requirement.anchor === "repositionable"
              ? "middle"
              : requirement.anchor === "none"
              ? "none"
              : requirement.anchor
          );
          if (
            !bandOverlay.hasLongBand &&
            !bandOverlay.hasLoopBand &&
            bandOverlay.resolvedSetup === "legacy_unknown"
          ) {
            // Legacy unknown: allow cautious band scap work but not typed long-band anchors.
            if (requirement.anchor !== "none") {
              pushFailure({
                reasonCode: "MIXED_HOME_UNCONFIRMED_BAND_TYPE",
                persona,
                dayTitle: day.title,
                slot: slotKind,
                exerciseId: exercise.id,
                expectedRole: "confirmed_band_type",
                actualRole: requirement.bandType,
                selectedTool: "band",
                requiredCapability: "bandSetup",
                detail: "Band exercise requires confirmed band type (legacy unknown)",
              });
            }
          } else {
            if (
              requirement.bandType === "longBand" &&
              !bandOverlay.hasLongBand
            ) {
              pushFailure({
                reasonCode: "MIXED_HOME_UNCONFIRMED_BAND_TYPE",
                persona,
                dayTitle: day.title,
                slot: slotKind,
                exerciseId: exercise.id,
                expectedRole: "longBand",
                actualRole: "unavailable",
                selectedTool: "band",
                requiredCapability: "longBand",
                detail: "Long-band exercise scheduled without confirmed long band",
              });
            }
            if (
              requirement.bandType === "miniLoop" &&
              !bandOverlay.hasLoopBand
            ) {
              pushFailure({
                reasonCode: "MIXED_HOME_UNCONFIRMED_BAND_TYPE",
                persona,
                dayTitle: day.title,
                slot: slotKind,
                exerciseId: exercise.id,
                expectedRole: "miniLoop",
                actualRole: "unavailable",
                selectedTool: "band",
                requiredCapability: "miniLoop",
                detail: "Mini-loop exercise scheduled without confirmed loops",
              });
            }
            if (
              requirement.anchor !== "none" &&
              !bandOverlay.hasDoorAnchor &&
              requirement.anchor !== "repositionable"
            ) {
              // repositionable still needs an anchor in Phase 4 semantics — treat as mid.
            }
            const needsAnchor =
              requirement.anchor === "high" ||
              requirement.anchor === "middle" ||
              requirement.anchor === "low" ||
              requirement.anchor === "repositionable";
            if (needsAnchor && !bandOverlay.hasDoorAnchor) {
              pushFailure({
                reasonCode: "MIXED_HOME_UNCONFIRMED_ANCHOR",
                persona,
                dayTitle: day.title,
                slot: slotKind,
                exerciseId: exercise.id,
                expectedRole: `anchor:${requirement.anchor}`,
                actualRole: "no_anchor",
                selectedTool: "band",
                requiredCapability: "door_anchor",
                detail: "Anchored band exercise without confirmed anchor",
              });
            }
          }
        }
      }

      // Band anchors are validated via bandSetup overlay above — do not double-count
      // inferred band_anchor tokens as furniture/support failures.
      const missingSupport = inferExerciseSupportRequirements({
        exerciseId: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment,
        cues: exercise.cues,
        mistakes: exercise.mistakes,
        tags: exercise.tags,
        variantKey: exercise.variantKey,
      }).filter((support) => {
        const token = normalizeToken(support);
        if (token.includes("band_anchor") || token.includes("anchor")) {
          return false;
        }
        return !isSupportConfirmedByCapabilities(support, capabilities);
      });
      if (missingSupport.length) {
        pushFailure({
          reasonCode: "MIXED_HOME_ILLEGAL_EQUIPMENT",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "confirmed_support_only",
          actualRole: missingSupport.join(","),
          selectedTool: tool,
          requiredCapability: missingSupport[0] ?? null,
          detail: "Exercise requires unconfirmed support equipment",
        });
      }
    });

    const maxAnchorChanges = maxMixedHomeAnchorHeightChangesForExperience(experienceLevel);
    const anchorChanges = countAnchorHeightChanges(anchorHeights);
    if (anchorChanges > maxAnchorChanges) {
      pushFailure({
        reasonCode: "MIXED_HOME_EXCESS_ANCHOR_CHANGES",
        persona,
        dayTitle: day.title,
        slot: "anchor_heights",
        exerciseId: null,
        expectedRole: `<=${maxAnchorChanges}`,
        actualRole: String(anchorChanges),
        setupTransitions: toolStats.setupSequence,
        detail: "Too many anchor-height changes in session",
      });
    }

    // Band overuse: bands dominate primary strength roles on a full-body day.
    // A single justified band vertical-pull main beside bodyweight/DB support is allowed.
    if (
      isMixedHomeFullBodyDayTitle(day.title) &&
      dayBandMains >= 2 &&
      dayDbMains === 0 &&
      mains.length >= 3
    ) {
      pushFailure({
        reasonCode: "MIXED_HOME_BAND_OVERUSE",
        persona,
        dayTitle: day.title,
        slot: "equipment_dominance",
        exerciseId: null,
        expectedRole: "dumbbell_primary_anchors",
        actualRole: `dbMains=${dayDbMains},bandMains=${dayBandMains}`,
        setupTransitions: toolStats.setupSequence,
        detail: "Bands displaced most dumbbell strength anchors without justification",
      });
    }

    // Redundant cross-tool: same role family filled by both tools in one day (mains).
    const rolesByTool = new Map<string, Set<MixedHomeSelectedTool>>();
    roleToolPairs.forEach(({ role, tool }) => {
      const set = rolesByTool.get(role) ?? new Set();
      set.add(tool);
      rolesByTool.set(role, set);
    });
    for (const [role, tools] of rolesByTool) {
      if (tools.has("dumbbell") && tools.has("band")) {
        pushFailure({
          reasonCode: "MIXED_HOME_REDUNDANT_CROSS_TOOL_ROLE",
          persona,
          dayTitle: day.title,
          slot: role,
          exerciseId: null,
          expectedRole: "single_tool_per_role",
          actualRole: Array.from(tools).join("+"),
          detail: `Role ${role} duplicated across dumbbell and band`,
        });
      }
    }

    if (identity === "full_body_a" && !dayHorizontalPull) {
      pushFailure({
        reasonCode: "MIXED_HOME_MISSING_HORIZONTAL_PULL",
        persona,
        dayTitle: day.title,
        slot: "mainPullHorizontal",
        exerciseId: null,
        expectedRole: "horizontal_pull",
        actualRole: null,
        detail: "Full Body A missing true horizontal pull",
      });
    }

    if (identity === "full_body_b" && !dayTrueHinge) {
      pushFailure({
        reasonCode: "MIXED_HOME_MISSING_HINGE",
        persona,
        dayTitle: day.title,
        slot: "mainHingePrimary",
        exerciseId: null,
        expectedRole: "true_hinge_or_hip_extension",
        actualRole: null,
        detail: "Full Body B missing true hinge / hip-extension intent",
      });
    }

    for (const [family, count] of familyCounts) {
      if (count >= 3) {
        pushFailure({
          reasonCode: "MIXED_HOME_DUPLICATE_FAMILY",
          persona,
          dayTitle: day.title,
          slot: family,
          exerciseId: null,
          expectedRole: "<=2",
          actualRole: String(count),
          detail: `Duplicate movement family dominance (${family})`,
        });
      }
    }
  });

  // Week looks like dumbbell-only if zero band work despite confirmed bands — soft structural
  // only when long/loop bands are confirmed and no band appears in mains/accessories at all.
  const anyBandWork = program.week.some((day) =>
    day.routine.some((item) => {
      if (item.section !== "main" && item.section !== "accessory") return false;
      const exercise = exerciseById(item.exerciseId);
      return Boolean(exercise?.equipment.includes("bands"));
    })
  );
  if (
    !anyBandWork &&
    (bandOverlay.hasLongBand || bandOverlay.hasLoopBand) &&
    bandOverlay.bandSetupConfirmed
  ) {
    // Not always a hard failure — prompt allows bands only when justified.
    // Flag as dumbbell-template-only when week also has no band accessories and
    // vertical-pull capability exists that should have been used on Day C.
    if (canVertical && weekDumbbellMains > 0) {
      pushFailure({
        reasonCode: "MIXED_HOME_DUMBBELL_TEMPLATE_ONLY",
        persona,
        dayTitle: null,
        slot: "weekly_tool_mix",
        exerciseId: null,
        expectedRole: "justified_band_advantage_when_capable",
        actualRole: "dumbbell_only_week",
        detail:
          "Confirmed high-anchor/loop capability unused; week behaves as dumbbell-only",
      });
    }
  }

  const anyDumbbellWork = program.week.some((day) =>
    day.routine.some((item) => {
      if (item.section !== "main" && item.section !== "accessory") return false;
      const exercise = exerciseById(item.exerciseId);
      return Boolean(exercise?.equipment.includes("dumbbells"));
    })
  );
  if (!anyDumbbellWork && weekBandMains > 0) {
    pushFailure({
      reasonCode: "MIXED_HOME_BAND_TEMPLATE_ONLY",
      persona,
      dayTitle: null,
      slot: "weekly_tool_mix",
      exerciseId: null,
      expectedRole: "dumbbell_primary_anchors",
      actualRole: "band_only_week",
      detail: "Mixed-home week used bands without dumbbell strength anchors",
    });
  }

  if (weeklyHorizontalPull < 1) {
    pushFailure({
      reasonCode: "MIXED_HOME_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_horizontal_pull",
      exerciseId: null,
      expectedRole: "horizontal_pull>=1",
      actualRole: String(weeklyHorizontalPull),
      detail: "Week missing true horizontal pull exposure",
    });
  }
  if (weeklyTrueHinge < 1) {
    pushFailure({
      reasonCode: "MIXED_HOME_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_hinge",
      exerciseId: null,
      expectedRole: "hinge>=1",
      actualRole: String(weeklyTrueHinge),
      detail: "Week missing true hinge / hip-extension exposure",
    });
  }
  if (weeklySquat < 1 || weeklyPress < 1) {
    pushFailure({
      reasonCode: "MIXED_HOME_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: weeklySquat < 1 ? "weekly_squat" : "weekly_press",
      exerciseId: null,
      expectedRole: "squat_and_press_coverage",
      actualRole: `squat=${weeklySquat},press=${weeklyPress}`,
      detail: "Week missing squat or press exposure",
    });
  }

  void painAreas;
  return failures;
};

export {
  MIXED_HOME_THREE_DAY_TITLES,
  MIXED_HOME_FOUR_DAY_TITLES,
  MIXED_HOME_FIVE_DAY_TITLES,
  resolveMixedHomeDayIdentity,
  looksLikeGymShapedDayTitle,
  isMixedHomeFullBodyDayTitle,
};
