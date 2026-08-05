/**
 * Canonical dumbbell program contract (Phase 3).
 *
 * Validates full-body A/B/C identity, equipment honesty, pull/hinge truth,
 * and simplicity caps. Does not weaken the gym contract.
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
  DUMBBELL_FIVE_DAY_TITLES,
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_THREE_DAY_TITLES,
  getDumbbellDayVolumeContract,
  getDumbbellMainLanePlan,
  isDumbbellFullBodyDayTitle,
  looksLikeGymShapedDayTitle,
  normalizeDumbbellExperienceLevel,
  resolveDumbbellDayIdentity,
  type DumbbellDayIdentity,
} from "@/lib/program/dumbbellTemplates";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type DumbbellHardFailureReasonCode =
  | "DUMBBELL_GYM_TEMPLATE_INHERITANCE"
  | "DUMBBELL_FALSE_VERTICAL_PULL"
  | "DUMBBELL_MISSING_HORIZONTAL_PULL"
  | "DUMBBELL_MISSING_TRUE_HINGE"
  | "DUMBBELL_UNCONFIRMED_BENCH"
  | "DUMBBELL_UNCONFIRMED_SUPPORT"
  | "DUMBBELL_ILLEGAL_EQUIPMENT"
  | "DUMBBELL_PREP_AS_MAIN"
  | "DUMBBELL_DAY_IDENTITY_MISMATCH"
  | "DUMBBELL_DUPLICATE_FAMILY"
  | "DUMBBELL_EXCESS_COMPLEXITY"
  | "DUMBBELL_MISSING_WEEKLY_ROLE"
  | "DUMBBELL_EXCESSIVE_PHASE_CHURN"
  | "DUMBBELL_NONDETERMINISTIC_OUTPUT"
  | "DUMBBELL_IDENTITY_COLLAPSE"
  | "DUMBBELL_VOLUME_OUTSIDE_CONTRACT"
  | "DUMBBELL_CURL_ONLY_HINGE";

export type DumbbellHardFailure = {
  reasonCode: DumbbellHardFailureReasonCode;
  persona: string;
  phase: number | null;
  daysPerWeek: number | null;
  dayTitle: string | null;
  slot: string | null;
  exerciseId: string | null;
  expectedRole: string | null;
  actualRole: string | null;
  requiredCapability: string | null;
  confirmedCapabilities: string[];
  detail: string;
  existedInPhase0Baseline?: boolean;
};

export type DeferredDumbbellExperienceGap = {
  exerciseId: string;
  dayTitle: string;
  kind: "demo" | "cues" | "progression_link";
  detail: string;
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

/** Explicit hip-extension surrogates legal as dumbbell hinge mains under pain policy. */
const PAIN_AWARE_HIP_EXTENSION_IDS = new Set([
  "single-leg-glute-bridge-hold",
  "single-leg-hip-thrust",
  "glute-bridges",
]);

const isPrepOnly = (exercise: Exercise) => {
  if (PAIN_AWARE_HIP_EXTENSION_IDS.has(exercise.id)) return false;
  // Catalog marks some legal unilateral hinges as regressionOnly; still valid mains here.
  if (exercise.id === "single-leg-rdl") return false;
  return (
    Boolean(exercise.supportOnly) ||
    Boolean(exercise.regressionOnly) ||
    exercise.category === "warmup" ||
    exercise.category === "activation" ||
    exercise.category === "cooldown"
  );
};

const isHamstringCurl = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    descriptor.includes("hamstring curl") ||
    descriptor.includes("leg curl") ||
    descriptor.includes("seated-hamstring")
  );
};

const isTrueHinge = (exercise: Exercise) => {
  if (isHamstringCurl(exercise)) return false;
  if (PAIN_AWARE_HIP_EXTENSION_IDS.has(exercise.id)) return true;
  if (isPrepOnly(exercise) && !descriptorOf(exercise).includes("rdl")) return false;
  const descriptor = descriptorOf(exercise);
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
    descriptor.includes("pulse")
  ) {
    return false;
  }
  return (
    hasPattern(exercise, "horizontalPull") ||
    (hasPattern(exercise, "pull") && descriptor.includes("row"))
  );
};

const isFalseVerticalPullClaim = (exercise: Exercise, slotKind?: string | null) => {
  const slot = normalizeToken(slotKind ?? "");
  const descriptor = descriptorOf(exercise);
  const claimsVertical =
    slot.includes("verticalpull") ||
    slot.includes("pullvertical") ||
    Boolean(exercise.slotRoles?.includes("pullVertical"));
  if (!claimsVertical) return false;
  const trueVertical =
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup") ||
    hasPattern(exercise, "verticalPull");
  if (trueVertical) return false;
  return (
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("pulse") ||
    descriptor.includes("scap") ||
    isTrueHorizontalPull(exercise)
  );
};

const isLatBiasedPull = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    descriptor.includes("pullover") ||
    (hasPattern(exercise, "pull") &&
      (descriptor.includes("lat") || (exercise.muscleGroups ?? []).some((m) => normalizeToken(m).includes("lat"))))
  );
};

const illegalEquipmentTokens = [
  "machines",
  "cables",
  "barbell",
  "kettlebell",
  "bands",
] as const;

const requiresUnconfirmedSupport = (
  exercise: Exercise,
  capabilities: ProgramCapabilities
) => {
  const inferred = inferExerciseSupportRequirements({
    exerciseId: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment,
    cues: exercise.cues,
    mistakes: exercise.mistakes,
    tags: exercise.tags,
    variantKey: exercise.variantKey,
  });
  const missing = inferred.filter(
    (support) => !isSupportConfirmedByCapabilities(support, capabilities)
  );
  const descriptor = descriptorOf(exercise);
  if (
    (descriptor.includes("step-up") || descriptor.includes("step up")) &&
    !capabilities.hasBench
  ) {
    missing.push("step_or_platform");
  }
  if (
    (descriptor.includes("bulgarian") || descriptor.includes("chest-supported")) &&
    !capabilities.hasBench
  ) {
    missing.push("bench_or_chair");
  }
  return Array.from(new Set(missing));
};

export const collectDeferredDumbbellExperienceGaps = (
  program: Program
): DeferredDumbbellExperienceGap[] => {
  const gaps: DeferredDumbbellExperienceGap[] = [];
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
  return gaps;
};

export const scoreDumbbellProgramStructuralQuality = (params: {
  failures: DumbbellHardFailure[];
  deferredGapCount: number;
}) => {
  const hardPenalty = Math.min(100, params.failures.length * 12);
  const structuralScore = Math.max(0, 100 - hardPenalty);
  const deferredPenalty = Math.min(25, params.deferredGapCount * 0.5);
  return {
    structuralScore,
    fullExperienceScore: Math.max(0, structuralScore - deferredPenalty),
  };
};

export type ValidateDumbbellProgramParams = {
  program: Program;
  persona: string;
  equipment: string[];
  experience?: string;
  painAreas?: string[];
  phaseIndex?: number;
  phase0BaselineReasonCodes?: Set<string>;
};

export const validateDumbbellProgramContract = (
  params: ValidateDumbbellProgramParams
): DumbbellHardFailure[] => {
  const {
    program,
    persona,
    equipment,
    experience,
    painAreas = [],
    phaseIndex = null,
    phase0BaselineReasonCodes,
  } = params;
  const failures: DumbbellHardFailure[] = [];
  const capabilities = deriveProgramCapabilities(equipment);
  const confirmed = confirmedCapabilityLabels(capabilities);
  const pushFailure = (
    failure: Omit<
      DumbbellHardFailure,
      "existedInPhase0Baseline" | "confirmedCapabilities" | "phase" | "daysPerWeek"
    > &
      Partial<Pick<DumbbellHardFailure, "phase" | "daysPerWeek" | "confirmedCapabilities">>
  ) => {
    failures.push({
      ...failure,
      phase: failure.phase ?? phaseIndex,
      daysPerWeek: failure.daysPerWeek ?? program.daysPerWeek,
      confirmedCapabilities: failure.confirmedCapabilities ?? confirmed,
      requiredCapability: failure.requiredCapability ?? null,
      existedInPhase0Baseline: phase0BaselineReasonCodes?.has(failure.reasonCode),
    });
  };

  const primaryMode = resolvePrimaryProgramEquipmentMode(equipment);
  if (primaryMode !== "dumbbells") {
    pushFailure({
      reasonCode: "DUMBBELL_IDENTITY_COLLAPSE",
      persona,
      dayTitle: null,
      slot: null,
      exerciseId: null,
      expectedRole: "dumbbells",
      actualRole: primaryMode,
      requiredCapability: null,
      detail: `Expected dumbbells primary mode, got ${primaryMode}`,
    });
    return failures;
  }

  const experienceLevel = normalizeDumbbellExperienceLevel(experience);
  const expectedTitles =
    program.daysPerWeek === 3
      ? DUMBBELL_THREE_DAY_TITLES
      : program.daysPerWeek === 4
      ? DUMBBELL_FOUR_DAY_TITLES
      : DUMBBELL_FIVE_DAY_TITLES;

  const actualTitles = program.week.map((day) => day.title);
  actualTitles.forEach((title) => {
    if (looksLikeGymShapedDayTitle(title)) {
      pushFailure({
        reasonCode: "DUMBBELL_GYM_TEMPLATE_INHERITANCE",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: "dumbbell_full_body_or_practice",
        actualRole: title,
        requiredCapability: null,
        detail: "Dumbbell mode inherited a gym-shaped day title",
      });
    }
  });

  expectedTitles.forEach((title) => {
    if (!actualTitles.includes(title)) {
      pushFailure({
        reasonCode: "DUMBBELL_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: title,
        actualRole: actualTitles.join(" | "),
        requiredCapability: null,
        detail: "Expected dumbbell day title missing from generated week",
      });
    }
  });

  let weeklyHorizontalPull = 0;
  let weeklyTrueHinge = 0;
  let weeklySquat = 0;
  let weeklyPress = 0;

  program.week.forEach((day) => {
    const identity = resolveDumbbellDayIdentity(day.title);
    if (identity === "unknown" && !looksLikeGymShapedDayTitle(day.title)) {
      pushFailure({
        reasonCode: "DUMBBELL_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: day.title,
        slot: null,
        exerciseId: null,
        expectedRole: "known_dumbbell_day_identity",
        actualRole: "unknown",
        requiredCapability: null,
        detail: "Unrecognized dumbbell day title",
      });
    }

    const mains = day.routine.filter((item) => item.section === "main");
    const accessories = day.routine.filter((item) => item.section === "accessory");
    const buildReinforceCount = mains.length + accessories.length;
    const complexityCap =
      experienceLevel === "advanced" ? 7 : experienceLevel === "intermediate" ? 6 : 5;
    if (
      isDumbbellFullBodyDayTitle(day.title) &&
      buildReinforceCount > complexityCap
    ) {
      pushFailure({
        reasonCode: "DUMBBELL_EXCESS_COMPLEXITY",
        persona,
        dayTitle: day.title,
        slot: "build_reinforce",
        exerciseId: null,
        expectedRole: `<=${complexityCap}`,
        actualRole: String(buildReinforceCount),
        requiredCapability: null,
        detail: `Full-body Build/Reinforce count exceeds ${experienceLevel} complexity cap`,
      });
    }

    const volume = getDumbbellDayVolumeContract(day.title, experienceLevel);
    if (volume && isDumbbellFullBodyDayTitle(day.title)) {
      if (mains.length > volume.mainCount + 1 || accessories.length > volume.accessoryCount + 1) {
        pushFailure({
          reasonCode: "DUMBBELL_VOLUME_OUTSIDE_CONTRACT",
          persona,
          dayTitle: day.title,
          slot: "volume",
          exerciseId: null,
          expectedRole: `main<=${volume.mainCount}+1 accessory<=${volume.accessoryCount}+1`,
          actualRole: `main=${mains.length} accessory=${accessories.length}`,
          requiredCapability: null,
          detail: "Dumbbell session volume far outside experience contract",
        });
      }
    }

    const rolePlan = getDumbbellMainLanePlan(day.title, experienceLevel) ?? [];
    const mainExercises = mains
      .map((item) => ({ item, exercise: exerciseById(item.exerciseId) }))
      .filter(
        (entry): entry is { item: ProgramRoutineItem; exercise: Exercise } =>
          Boolean(entry.exercise)
      );

    const familyCounts = new Map<string, number>();
    let dayHorizontalPull = false;
    let dayTrueHinge = false;
    let dayHingeSlotCurlOnly = false;

    mainExercises.forEach(({ item, exercise }, index) => {
      const slotKind = item.selectionDebug?.slotKind ?? null;
      const planned = rolePlan[index];
      const familyKey = planned?.family ?? normalizeToken(slotKind ?? exercise.pattern ?? "unknown");
      familyCounts.set(familyKey, (familyCounts.get(familyKey) ?? 0) + 1);

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
          reasonCode: "DUMBBELL_PREP_AS_MAIN",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: planned?.family ?? "loaded_main",
          actualRole: "preparationOnly",
          requiredCapability: null,
          detail: "Preparation/regression drill filled a dumbbell main role",
        });
      }

      if (isFalseVerticalPullClaim(exercise, slotKind)) {
        pushFailure({
          reasonCode: "DUMBBELL_FALSE_VERTICAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "honest_non_vertical_or_true_vertical",
          actualRole: "false_vertical_pull_claim",
          requiredCapability: capabilities.hasPullupBar ? "pullup_bar" : null,
          detail: "Pullover/surrogate must not satisfy true vertical pull",
        });
      }

      for (const token of illegalEquipmentTokens) {
        if (exercise.equipment.includes(token)) {
          pushFailure({
            reasonCode: "DUMBBELL_ILLEGAL_EQUIPMENT",
            persona,
            dayTitle: day.title,
            slot: slotKind,
            exerciseId: exercise.id,
            expectedRole: "dumbbells_floor_wall_only",
            actualRole: token,
            requiredCapability: null,
            detail: `Dumbbell program selected ${token}-dependent exercise`,
          });
        }
      }

      const missingSupport = requiresUnconfirmedSupport(exercise, capabilities);
      if (missingSupport.includes("bench") || missingSupport.includes("bench_or_chair")) {
        pushFailure({
          reasonCode: "DUMBBELL_UNCONFIRMED_BENCH",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "no_bench_or_confirmed_bench",
          actualRole: missingSupport.join(","),
          requiredCapability: "bench",
          detail: "Exercise requires bench/chair without confirmed capability",
        });
      } else if (missingSupport.length) {
        pushFailure({
          reasonCode: "DUMBBELL_UNCONFIRMED_SUPPORT",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "confirmed_support_only",
          actualRole: missingSupport.join(","),
          requiredCapability: missingSupport[0] ?? null,
          detail: "Exercise requires unconfirmed support equipment",
        });
      }

      const hingeSlot =
        normalizeToken(slotKind ?? "").includes("hinge") ||
        planned?.family === "hinge_primary";
      if (hingeSlot && isHamstringCurl(exercise)) {
        dayHingeSlotCurlOnly = true;
      }
    });

    if (
      (identity === "full_body_a" || identity === "full_body_b" || identity === "full_body_c") &&
      !dayHorizontalPull &&
      identity !== "full_body_b"
    ) {
      // Day B may place horizontal pull in accessories for beginner; still check weekly later.
      if (identity === "full_body_a" || identity === "full_body_c") {
        const hasPullAccessory = accessories.some((item) => {
          const exercise = exerciseById(item.exerciseId);
          return exercise ? isTrueHorizontalPull(exercise) || isLatBiasedPull(exercise) : false;
        });
        if (!hasPullAccessory && identity === "full_body_a") {
          pushFailure({
            reasonCode: "DUMBBELL_MISSING_HORIZONTAL_PULL",
            persona,
            dayTitle: day.title,
            slot: "mainPullHorizontal",
            exerciseId: null,
            expectedRole: "horizontal_pull",
            actualRole: null,
            requiredCapability: null,
            detail: "Full Body A missing true horizontal pull",
          });
        }
      }
    }

    if (identity === "full_body_b" && !dayTrueHinge) {
      pushFailure({
        reasonCode: "DUMBBELL_MISSING_TRUE_HINGE",
        persona,
        dayTitle: day.title,
        slot: "mainHingePrimary",
        exerciseId: null,
        expectedRole: "true_hinge_or_hip_extension",
        actualRole: null,
        requiredCapability: null,
        detail: "Full Body B missing true hinge / hip-extension intent",
      });
    }

    if (dayHingeSlotCurlOnly && !dayTrueHinge) {
      pushFailure({
        reasonCode: "DUMBBELL_CURL_ONLY_HINGE",
        persona,
        dayTitle: day.title,
        slot: "mainHingePrimary",
        exerciseId: "machine-seated-hamstring-curl",
        expectedRole: "true_hinge",
        actualRole: "hamstring_curl",
        requiredCapability: null,
        detail: "Hamstring curl cannot be the only hinge on a dumbbell day",
      });
    }

    for (const [family, count] of familyCounts) {
      if (count >= 3) {
        pushFailure({
          reasonCode: "DUMBBELL_DUPLICATE_FAMILY",
          persona,
          dayTitle: day.title,
          slot: family,
          exerciseId: null,
          expectedRole: "<=2",
          actualRole: String(count),
          requiredCapability: null,
          detail: `Duplicate movement family dominance (${family})`,
        });
      }
    }
  });

  if (weeklyHorizontalPull < 1) {
    pushFailure({
      reasonCode: "DUMBBELL_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_horizontal_pull",
      exerciseId: null,
      expectedRole: "horizontal_pull>=1",
      actualRole: String(weeklyHorizontalPull),
      requiredCapability: null,
      detail: "Week missing true horizontal pull exposure",
    });
  }
  if (weeklyTrueHinge < 1) {
    pushFailure({
      reasonCode: "DUMBBELL_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_hinge",
      exerciseId: null,
      expectedRole: "hinge>=1",
      actualRole: String(weeklyTrueHinge),
      requiredCapability: null,
      detail: "Week missing true hinge / hip-extension exposure",
    });
  }
  if (weeklySquat < 1 || weeklyPress < 1) {
    pushFailure({
      reasonCode: "DUMBBELL_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: weeklySquat < 1 ? "weekly_squat" : "weekly_press",
      exerciseId: null,
      expectedRole: "squat_and_press_coverage",
      actualRole: `squat=${weeklySquat},press=${weeklyPress}`,
      requiredCapability: null,
      detail: "Week missing squat or press exposure",
    });
  }

  // Honest reporting: without pull-up bar, true vertical pull is unavailable.
  if (!capabilities.hasPullupBar) {
    // No hard failure — absence is correct. Surrogate claims already flagged.
  }

  void painAreas;
  return failures;
};

export {
  DUMBBELL_THREE_DAY_TITLES,
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_FIVE_DAY_TITLES,
  resolveDumbbellDayIdentity,
  looksLikeGymShapedDayTitle,
  isDumbbellFullBodyDayTitle,
};

export type { DumbbellDayIdentity };
