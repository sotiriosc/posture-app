/**
 * Canonical gym program contract (Phase 2).
 *
 * Declares day identity, experience volume, required/forbidden roles, and
 * validation helpers. Generator/tests/audits should share these definitions.
 *
 * Experience counts are sourced from the established three-day templates in
 * dayTemplates.ts — not invented here.
 */

import { exerciseById, type Exercise } from "@/lib/exercises";
import {
  get3DayMainLanePlan,
  get3DayTemplateCounts,
  type ThreeDayMainLanePlanEntry,
} from "@/lib/program/dayTemplates";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type MovementRoleTruth =
  | "true"
  | "supportedVariant"
  | "surrogate"
  | "preparationOnly";

export type GymHardFailureReasonCode =
  | "GYM_IDENTITY_COLLAPSE"
  | "GYM_DAY_TITLE_UNKNOWN"
  | "GYM_DAY_TITLE_SLOT_MISMATCH"
  | "GYM_VOLUME_OUTSIDE_CONTRACT"
  | "GYM_REQUIRED_ROLE_MISSING"
  | "GYM_REQUIRED_ROLE_WRONG_TRUTH"
  | "GYM_VERTICAL_PULL_SURROGATE"
  | "GYM_VERTICAL_PUSH_SATISFIED_BY_HORIZONTAL"
  | "GYM_HINGE_SATISFIED_BY_CARRY"
  | "GYM_HINGE_SATISFIED_BY_CURL_ONLY"
  | "GYM_PAIN_FREE_MAIN_IS_PREP_ONLY"
  | "GYM_DUPLICATE_FAMILY_DOMINANCE"
  | "GYM_WEEKLY_ROLE_MISSING"
  | "GYM_ILLEGAL_EQUIPMENT"
  | "GYM_PHASE_ANCHOR_CHURN"
  | "GYM_NONDETERMINISTIC_REPEAT"
  | "GYM_PRESS_EXCEEDS_PULL_ON_BACK_CHEST"
  | "GYM_LOWER_MAIN_HAS_UPPER_LEAK"
  | "GYM_UPPER_MAIN_HAS_LOWER_LEAK";

export type GymHardFailure = {
  reasonCode: GymHardFailureReasonCode;
  persona: string;
  dayTitle: string | null;
  slot: string | null;
  exerciseId: string | null;
  expectedRole: string | null;
  actualRole: string | null;
  detail: string;
  existedInPhase0Baseline?: boolean;
};

export type GymDayIdentity =
  | "back_chest"
  | "shoulders_arms"
  | "legs_abs"
  | "upper_push"
  | "upper_pull"
  | "lower_squat"
  | "lower_hinge"
  | "arms_posture"
  | "unknown";

export type GymExperienceLevel = "beginner" | "intermediate" | "advanced";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeGymExperienceLevel = (
  value?: string
): GymExperienceLevel => {
  const token = normalizeToken(value ?? "beginner");
  if (token === "advanced") return "advanced";
  if (token === "intermediate") return "intermediate";
  return "beginner";
};

export const resolveGymDayIdentity = (dayTitle: string): GymDayIdentity => {
  const token = normalizeToken(dayTitle);
  if (
    token === "back_chest" ||
    (token.includes("back") && token.includes("chest"))
  ) {
    return "back_chest";
  }
  if (token.includes("shoulder") && token.includes("arm")) return "shoulders_arms";
  if (token.includes("legs") && (token.includes("abs") || token.includes("core"))) {
    return "legs_abs";
  }
  if (token.includes("upper") && token.includes("push")) return "upper_push";
  if (token.includes("upper") && token.includes("pull")) return "upper_pull";
  if (token.includes("lower") && token.includes("squat")) return "lower_squat";
  if (token.includes("lower") && token.includes("hinge")) return "lower_hinge";
  if (token.includes("arms") && token.includes("posture")) return "arms_posture";
  return "unknown";
};

/** Established live title for day 3 — keep `Legs + Abs` unless proven false. */
export const GYM_THREE_DAY_TITLES = [
  "Back + Chest",
  "Shoulders + Arms",
  "Legs + Abs",
] as const;

export const GYM_FOUR_DAY_TITLES = [
  "Upper Push + Scapular Control",
  "Lower (Squat Emphasis) + Core",
  "Upper Pull + Thoracic Posture",
  "Lower (Hinge Emphasis) + Carry/Anti-rotation",
] as const;

export const GYM_FIVE_DAY_TITLES = [
  "Upper Push",
  "Lower Squat",
  "Upper Pull",
  "Lower Hinge + Posterior Chain",
  "Arms + Posture + Conditioning",
] as const;

export const getGymThreeDayVolumeContract = (
  dayTitle: string,
  experience?: string
) => get3DayTemplateCounts(dayTitle, experience);

export const getGymThreeDayMainRolePlan = (
  dayTitle: string,
  experience?: string
): ThreeDayMainLanePlanEntry[] | null => {
  const counts = get3DayTemplateCounts(dayTitle, experience);
  if (!counts) return null;
  return get3DayMainLanePlan(dayTitle, counts.mainCount);
};

const descriptorOf = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""}`.toLowerCase();

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some(
    (entry) => normalizeToken(entry) === normalizeToken(pattern)
  );

export const classifyGymMovementRoleTruth = (
  exercise: Exercise,
  expectedFamilyOrRole: string
): MovementRoleTruth => {
  const expected = normalizeToken(expectedFamilyOrRole);
  const descriptor = descriptorOf(exercise);
  const tags = new Set((exercise.weeklyCoverageTags ?? []).map(normalizeToken));

  if (exercise.supportOnly || exercise.regressionOnly) {
    return "preparationOnly";
  }

  if (
    expected.includes("vertical_pull") ||
    expected.includes("pullvertical") ||
    expected === "vertical_pull"
  ) {
    if (
      tags.has("verticalpullsurrogate") ||
      descriptor.includes("pullover") ||
      descriptor.includes("lat sweep") ||
      descriptor.includes("lat-sweep") ||
      descriptor.includes("supine lat") ||
      descriptor.includes("seated-lat-sweep") ||
      descriptor.includes("seated lat sweep")
    ) {
      return "surrogate";
    }
    if (
      exercise.slotRoles?.includes("pullVertical") ||
      hasPattern(exercise, "verticalPull") ||
      descriptor.includes("pulldown") ||
      descriptor.includes("pull-up") ||
      descriptor.includes("pullup") ||
      descriptor.includes("chin-up") ||
      descriptor.includes("chinup")
    ) {
      return "true";
    }
    return "surrogate";
  }

  if (
    expected.includes("vertical_push") ||
    expected.includes("verticalpush")
  ) {
    if (hasPattern(exercise, "verticalPush") || exercise.slotRoles?.includes("verticalPush")) {
      return "true";
    }
    if (hasPattern(exercise, "push") && !hasPattern(exercise, "verticalPush")) {
      return "surrogate";
    }
    return "surrogate";
  }

  if (expected.includes("horizontal_pull") || expected.includes("pullhorizontal")) {
    if (
      exercise.slotRoles?.includes("pullHorizontal") ||
      hasPattern(exercise, "horizontalPull") ||
      descriptor.includes("row")
    ) {
      return "true";
    }
    return "surrogate";
  }

  if (
    expected.includes("horizontal_press") ||
    expected.includes("push_compound") ||
    expected.includes("chest")
  ) {
    if (descriptor.includes("fly") || descriptor.includes("pec deck")) {
      return expected.includes("fly") || expected.includes("isolation")
        ? "true"
        : "supportedVariant";
    }
    if (
      exercise.slotRoles?.includes("pushCompound") ||
      (hasPattern(exercise, "push") && !hasPattern(exercise, "verticalPush"))
    ) {
      return "true";
    }
    return "surrogate";
  }

  if (expected.includes("squat")) {
    if (hasPattern(exercise, "squat") || exercise.slotRoles?.includes("squatPrimary")) {
      return "true";
    }
    return "surrogate";
  }

  if (expected.includes("hinge")) {
    if (
      descriptor.includes("carry") ||
      descriptor.includes("suitcase") ||
      exercise.carryType === "carry"
    ) {
      return "surrogate";
    }
    if (
      descriptor.includes("hamstring curl") ||
      descriptor.includes("leg curl") ||
      descriptor.includes("seated-hamstring")
    ) {
      return "supportedVariant";
    }
    if (hasPattern(exercise, "hinge") || exercise.slotRoles?.includes("hingePrimary")) {
      return "true";
    }
    return "surrogate";
  }

  if (expected.includes("unilateral") || expected.includes("single_leg")) {
    if (
      exercise.slotRoles?.includes("unilateralLowerLoaded") ||
      descriptor.includes("split squat") ||
      descriptor.includes("lunge") ||
      descriptor.includes("step-up") ||
      descriptor.includes("step up") ||
      descriptor.includes("bulgarian")
    ) {
      return "true";
    }
    return "surrogate";
  }

  if (exercise.loadType === "bodyweight" && (exercise.difficulty ?? 1) <= 2) {
    return "supportedVariant";
  }

  return "true";
};

const isPrepOnlyExercise = (exercise: Exercise) =>
  Boolean(exercise.supportOnly) ||
  exercise.category === "warmup" ||
  exercise.category === "activation" ||
  exercise.category === "cooldown";

const isCarryExercise = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    exercise.carryType === "carry" ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase")
  );
};

const isUpperMainLeak = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "push") ||
    hasPattern(exercise, "pull") ||
    hasPattern(exercise, "verticalPush") ||
    descriptor.includes("curl") ||
    descriptor.includes("pressdown")
  );
};

const isLowerMainLeak = (exercise: Exercise) =>
  hasPattern(exercise, "squat") || hasPattern(exercise, "hinge");

const familyKeyOf = (exercise: Exercise) =>
  normalizeToken(exercise.familyKey?.trim() ? exercise.familyKey : exercise.id);

const countPressVsPull = (mains: Exercise[]) => {
  let press = 0;
  let pull = 0;
  mains.forEach((exercise) => {
    const descriptor = descriptorOf(exercise);
    const isFly =
      descriptor.includes("fly") ||
      descriptor.includes("pec deck") ||
      normalizeToken(exercise.familyKey ?? "") === "chest_fly";
    if (
      (hasPattern(exercise, "push") || hasPattern(exercise, "horizontalPush")) &&
      !hasPattern(exercise, "verticalPush")
    ) {
      press += 1;
      if (isFly) {
        // fly counts as press-pattern exposure for balance limits
      }
    }
    if (
      hasPattern(exercise, "pull") ||
      hasPattern(exercise, "horizontalPull") ||
      hasPattern(exercise, "verticalPull") ||
      exercise.slotRoles?.includes("pullHorizontal") ||
      exercise.slotRoles?.includes("pullVertical") ||
      descriptor.includes("row") ||
      descriptor.includes("pulldown")
    ) {
      pull += 1;
    }
  });
  return { press, pull };
};

export type ValidateGymProgramParams = {
  program: Program;
  persona: string;
  equipment: string[];
  experience?: string;
  painAreas?: string[];
  phase0BaselineReasonCodes?: Set<string>;
};

export const validateGymProgramContract = (
  params: ValidateGymProgramParams
): GymHardFailure[] => {
  const {
    program,
    persona,
    equipment,
    experience,
    painAreas = [],
    phase0BaselineReasonCodes,
  } = params;
  const failures: GymHardFailure[] = [];
  const pushFailure = (failure: Omit<GymHardFailure, "existedInPhase0Baseline">) => {
    failures.push({
      ...failure,
      existedInPhase0Baseline: phase0BaselineReasonCodes?.has(failure.reasonCode),
    });
  };

  const primaryMode = resolvePrimaryProgramEquipmentMode(equipment);
  if (primaryMode !== "gym") {
    pushFailure({
      reasonCode: "GYM_IDENTITY_COLLAPSE",
      persona,
      dayTitle: null,
      slot: null,
      exerciseId: null,
      expectedRole: "gym",
      actualRole: primaryMode,
      detail: `Expected gym primary mode, got ${primaryMode}`,
    });
    return failures;
  }

  const experienceLevel = normalizeGymExperienceLevel(experience);
  const painFree = painAreas.length === 0;

  const expectedTitles =
    program.daysPerWeek === 3
      ? GYM_THREE_DAY_TITLES
      : program.daysPerWeek === 4
      ? GYM_FOUR_DAY_TITLES
      : GYM_FIVE_DAY_TITLES;

  const actualTitles = program.week.map((day) => day.title);
  expectedTitles.forEach((title) => {
    if (!actualTitles.includes(title)) {
      pushFailure({
        reasonCode: "GYM_DAY_TITLE_UNKNOWN",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: title,
        actualRole: actualTitles.join(" | "),
        detail: `Expected day title missing from generated week`,
      });
    }
  });

  program.week.forEach((day) => {
    const identity = resolveGymDayIdentity(day.title);
    if (identity === "unknown") {
      pushFailure({
        reasonCode: "GYM_DAY_TITLE_UNKNOWN",
        persona,
        dayTitle: day.title,
        slot: null,
        exerciseId: null,
        expectedRole: "known_gym_day_identity",
        actualRole: "unknown",
        detail: `Unrecognized gym day title`,
      });
    }

    const mains = day.routine.filter((item) => item.section === "main");
    const accessories = day.routine.filter((item) => item.section === "accessory");
    const mainExercises = mains
      .map((item) => ({ item, exercise: exerciseById(item.exerciseId) }))
      .filter(
        (entry): entry is { item: ProgramRoutineItem; exercise: Exercise } =>
          Boolean(entry.exercise)
      );

    if (program.daysPerWeek === 3) {
      const volume = getGymThreeDayVolumeContract(day.title, experienceLevel);
      if (volume) {
        if (mains.length !== volume.mainCount || accessories.length !== volume.accessoryCount) {
          pushFailure({
            reasonCode: "GYM_VOLUME_OUTSIDE_CONTRACT",
            persona,
            dayTitle: day.title,
            slot: "volume",
            exerciseId: null,
            expectedRole: `main=${volume.mainCount}, accessory=${volume.accessoryCount}`,
            actualRole: `main=${mains.length}, accessory=${accessories.length}`,
            detail: `Experience=${experienceLevel} volume mismatch`,
          });
        }
      }

      const rolePlan = getGymThreeDayMainRolePlan(day.title, experienceLevel) ?? [];
      rolePlan.forEach((role, index) => {
        const entry = mainExercises[index];
        if (!entry) {
          pushFailure({
            reasonCode: "GYM_REQUIRED_ROLE_MISSING",
            persona,
            dayTitle: day.title,
            slot: role.slotKind,
            exerciseId: null,
            expectedRole: role.family,
            actualRole: null,
            detail: `Missing main slot index ${index} for ${role.slotKind}`,
          });
          return;
        }
        const truth = classifyGymMovementRoleTruth(entry.exercise, role.family);
        const lowBackOrHipPain = painAreas.some((area) => {
          const token = normalizeToken(area);
          if (token.includes("upper_back") || token.includes("upperback")) {
            return false;
          }
          return (
            token.includes("lower_back") ||
            token.includes("low_back") ||
            token.includes("hip") ||
            token === "back"
          );
        });
        const painAwareHingeAllowed =
          lowBackOrHipPain &&
          role.family === "hinge_primary" &&
          (truth === "supportedVariant" ||
            truth === "preparationOnly" ||
            descriptorOf(entry.exercise).includes("glute bridge") ||
            descriptorOf(entry.exercise).includes("hip thrust") ||
            descriptorOf(entry.exercise).includes("hamstring curl"));

        if (
          (truth === "surrogate" || truth === "preparationOnly") &&
          !painAwareHingeAllowed
        ) {
          pushFailure({
            reasonCode:
              role.family === "vertical_pull"
                ? "GYM_VERTICAL_PULL_SURROGATE"
                : truth === "preparationOnly" && painFree
                ? "GYM_PAIN_FREE_MAIN_IS_PREP_ONLY"
                : "GYM_REQUIRED_ROLE_WRONG_TRUTH",
            persona,
            dayTitle: day.title,
            slot: role.slotKind,
            exerciseId: entry.exercise.id,
            expectedRole: role.family,
            actualRole: truth,
            detail: `${entry.exercise.name} truth=${truth} for required ${role.family}`,
          });
        }
        if (painFree && isPrepOnlyExercise(entry.exercise)) {
          pushFailure({
            reasonCode: "GYM_PAIN_FREE_MAIN_IS_PREP_ONLY",
            persona,
            dayTitle: day.title,
            slot: role.slotKind,
            exerciseId: entry.exercise.id,
            expectedRole: "loaded_or_true_main",
            actualRole: "preparationOnly",
            detail: `Pain-free gym main filled by preparation-only exercise`,
          });
        }
      });
    }

    if (identity === "back_chest") {
      const mainsOnly = mainExercises.map((entry) => entry.exercise);
      const { press, pull } = countPressVsPull(mainsOnly);
      if (press > pull) {
        pushFailure({
          reasonCode: "GYM_PRESS_EXCEEDS_PULL_ON_BACK_CHEST",
          persona,
          dayTitle: day.title,
          slot: "main",
          exerciseId: null,
          expectedRole: "pull >= press",
          actualRole: `press=${press}, pull=${pull}`,
          detail: "Back + Chest pull exposure must be at least equal to press exposure",
        });
      }
      const verticalPush = mainsOnly.find(
        (exercise) =>
          hasPattern(exercise, "verticalPush") ||
          descriptorOf(exercise).includes("shoulder press") ||
          descriptorOf(exercise).includes("overhead press")
      );
      if (verticalPush) {
        pushFailure({
          reasonCode: "GYM_DAY_TITLE_SLOT_MISMATCH",
          persona,
          dayTitle: day.title,
          slot: "main",
          exerciseId: verticalPush.id,
          expectedRole: "no_vertical_push",
          actualRole: "vertical_push",
          detail: "Back + Chest must not include vertical push mains",
        });
      }
      const lowerLeak = mainsOnly.find(isLowerMainLeak);
      if (lowerLeak) {
        pushFailure({
          reasonCode: "GYM_UPPER_MAIN_HAS_LOWER_LEAK",
          persona,
          dayTitle: day.title,
          slot: "main",
          exerciseId: lowerLeak.id,
          expectedRole: "upper_only",
          actualRole: "lower_pattern",
          detail: "Back + Chest main includes lower-body pattern",
        });
      }
    }

    if (identity === "shoulders_arms") {
      const verticalPress = mainExercises.find((entry) => {
        const truth = classifyGymMovementRoleTruth(entry.exercise, "vertical_push");
        return truth === "true";
      });
      const horizontalAsVertical = mainExercises.find((entry) => {
        const slot = normalizeToken(entry.item.selectionDebug?.slotKind ?? "");
        return (
          slot.includes("verticalpush") &&
          classifyGymMovementRoleTruth(entry.exercise, "vertical_push") !== "true"
        );
      });
      if (!verticalPress && painFree) {
        pushFailure({
          reasonCode: "GYM_REQUIRED_ROLE_MISSING",
          persona,
          dayTitle: day.title,
          slot: "mainVerticalPushPrimary",
          exerciseId: null,
          expectedRole: "vertical_push",
          actualRole: null,
          detail: "Shoulders + Arms missing true vertical press in pain-free gym plan",
        });
      }
      if (horizontalAsVertical) {
        pushFailure({
          reasonCode: "GYM_VERTICAL_PUSH_SATISFIED_BY_HORIZONTAL",
          persona,
          dayTitle: day.title,
          slot: horizontalAsVertical.item.selectionDebug?.slotKind ?? "main",
          exerciseId: horizontalAsVertical.exercise.id,
          expectedRole: "vertical_push",
          actualRole: "horizontal_or_other",
          detail: "Horizontal press cannot silently satisfy vertical-press role",
        });
      }
    }

    if (identity === "legs_abs" || identity === "lower_squat" || identity === "lower_hinge") {
      const hingeMain = mainExercises.find((entry) =>
        normalizeToken(entry.item.selectionDebug?.slotKind ?? "").includes("hinge")
      );
      if (hingeMain) {
        if (isCarryExercise(hingeMain.exercise)) {
          pushFailure({
            reasonCode: "GYM_HINGE_SATISFIED_BY_CARRY",
            persona,
            dayTitle: day.title,
            slot: hingeMain.item.selectionDebug?.slotKind ?? "mainHingePrimary",
            exerciseId: hingeMain.exercise.id,
            expectedRole: "hinge",
            actualRole: "carry",
            detail: "Carry cannot satisfy hinge role",
          });
        }
        const truth = classifyGymMovementRoleTruth(hingeMain.exercise, "hinge");
        if (
          truth === "supportedVariant" &&
          (descriptorOf(hingeMain.exercise).includes("curl") ||
            descriptorOf(hingeMain.exercise).includes("hamstring"))
        ) {
          const otherTrueHinge = mainExercises.some(
            (entry) =>
              entry.exercise.id !== hingeMain.exercise.id &&
              classifyGymMovementRoleTruth(entry.exercise, "hinge") === "true"
          );
          if (!otherTrueHinge) {
            pushFailure({
              reasonCode: "GYM_HINGE_SATISFIED_BY_CURL_ONLY",
              persona,
              dayTitle: day.title,
              slot: hingeMain.item.selectionDebug?.slotKind ?? "mainHingePrimary",
              exerciseId: hingeMain.exercise.id,
              expectedRole: "true_hinge",
              actualRole: "hamstring_curl_or_isolation",
              detail: "Hamstring curl cannot be the only hinge",
            });
          }
        }
      }
      const upperLeak = mainExercises.find((entry) => isUpperMainLeak(entry.exercise));
      if (upperLeak && identity !== "arms_posture") {
        // Allow only if clearly lower; filter false positives from "press" in leg press names later if needed
        const descriptor = descriptorOf(upperLeak.exercise);
        if (
          !descriptor.includes("leg press") &&
          !descriptor.includes("hack squat") &&
          !hasPattern(upperLeak.exercise, "squat") &&
          !hasPattern(upperLeak.exercise, "hinge")
        ) {
          pushFailure({
            reasonCode: "GYM_LOWER_MAIN_HAS_UPPER_LEAK",
            persona,
            dayTitle: day.title,
            slot: upperLeak.item.selectionDebug?.slotKind ?? "main",
            exerciseId: upperLeak.exercise.id,
            expectedRole: "lower_only",
            actualRole: "upper_pattern",
            detail: "Lower day main includes upper-body leakage",
          });
        }
      }
    }

    const familyCounts = new Map<string, number>();
    mainExercises.forEach((entry) => {
      const key = familyKeyOf(entry.exercise);
      familyCounts.set(key, (familyCounts.get(key) ?? 0) + 1);
    });
    familyCounts.forEach((count, family) => {
      if (count >= 3) {
        pushFailure({
          reasonCode: "GYM_DUPLICATE_FAMILY_DOMINANCE",
          persona,
          dayTitle: day.title,
          slot: "main",
          exerciseId: family,
          expectedRole: "family_count<=2",
          actualRole: `family_count=${count}`,
          detail: `Duplicate family ${family} dominates the session`,
        });
      }
    });
  });

  return failures;
};

export const scoreGymProgramStructuralQuality = (params: {
  failures: GymHardFailure[];
  deferredGapCount: number;
}): { structuralScore: number; fullExperienceScore: number } => {
  const hardPenalty = Math.min(100, params.failures.length * 12);
  const structuralScore = Math.max(0, 100 - hardPenalty);
  const deferredPenalty = Math.min(40, params.deferredGapCount * 0.5);
  const fullExperienceScore = Math.max(0, structuralScore - deferredPenalty);
  return { structuralScore, fullExperienceScore };
};

export const collectDeferredExperienceGaps = (program: Program) => {
  const gaps: Array<{ exerciseId: string; gap: string }> = [];
  program.week.forEach((day) => {
    day.routine.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) {
        gaps.push({ exerciseId: item.exerciseId, gap: "missing_catalog_entry" });
        return;
      }
      if (!exercise.videoUrl && exercise.demoStatus !== "url") {
        gaps.push({ exerciseId: exercise.id, gap: "missing_demo" });
      }
      if (!exercise.cues?.length) {
        gaps.push({ exerciseId: exercise.id, gap: "missing_cues" });
      }
      if (!exercise.progressionOf && !exercise.regressionOf) {
        gaps.push({ exerciseId: exercise.id, gap: "missing_progression_links" });
      }
    });
  });
  return gaps;
};

export const summarizeGymWeekRoles = (week: ProgramDay[]) => {
  const titles = week.map((day) => day.title);
  const mainSlotKinds = week.flatMap((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.selectionDebug?.slotKind ?? item.exerciseId)
  );
  return { titles, mainSlotKinds };
};
