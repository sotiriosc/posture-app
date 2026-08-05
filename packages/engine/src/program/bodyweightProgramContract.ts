/**
 * Canonical bodyweight program contract (Phase 5).
 *
 * Validates full-body A/B/C identity, floor/wall support truth, honest pulling,
 * and simplicity caps. Does not weaken gym, dumbbell, or band contracts.
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
  BODYWEIGHT_FIVE_DAY_TITLES,
  BODYWEIGHT_FOUR_DAY_TITLES,
  BODYWEIGHT_THREE_DAY_TITLES,
  getBodyweightDayVolumeContract,
  getBodyweightMainLanePlan,
  isBodyweightFullBodyDayTitle,
  looksLikeGymShapedDayTitle,
  normalizeBodyweightExperienceLevel,
  resolveBodyweightDayIdentity,
  type BodyweightDayIdentity,
} from "@/lib/program/bodyweightTemplates";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type MovementRoleTruth =
  | "true"
  | "supportedVariant"
  | "surrogate"
  | "preparationOnly";

export type BodyweightHardFailureReasonCode =
  | "BODYWEIGHT_GYM_TEMPLATE_INHERITANCE"
  | "BODYWEIGHT_ILLEGAL_EQUIPMENT"
  | "BODYWEIGHT_UNCONFIRMED_SUPPORT"
  | "BODYWEIGHT_FALSE_VERTICAL_PULL"
  | "BODYWEIGHT_FALSE_HORIZONTAL_PULL"
  | "BODYWEIGHT_PREP_AS_MAIN"
  | "BODYWEIGHT_MISSING_SQUAT"
  | "BODYWEIGHT_MISSING_HINGE_OR_HIP_EXTENSION"
  | "BODYWEIGHT_MISSING_UNILATERAL"
  | "BODYWEIGHT_MISSING_PUSH"
  | "BODYWEIGHT_MISSING_TRUNK"
  | "BODYWEIGHT_DAY_IDENTITY_MISMATCH"
  | "BODYWEIGHT_CORRECTIVE_CLUSTER"
  | "BODYWEIGHT_DUPLICATE_FAMILY"
  | "BODYWEIGHT_EXCESS_COMPLEXITY"
  | "BODYWEIGHT_EXCESS_POSITION_TRANSITIONS"
  | "BODYWEIGHT_MISSING_WEEKLY_ROLE"
  | "BODYWEIGHT_EXCESSIVE_PHASE_CHURN"
  | "BODYWEIGHT_NONDETERMINISTIC_OUTPUT"
  | "BODYWEIGHT_IDENTITY_COLLAPSE"
  | "BODYWEIGHT_VOLUME_OUTSIDE_CONTRACT";

export type BodyweightHardFailure = {
  reasonCode: BodyweightHardFailureReasonCode;
  persona: string;
  phase: number | null;
  daysPerWeek: number | null;
  dayTitle: string | null;
  slot: string | null;
  exerciseId: string | null;
  expectedRole: string | null;
  actualRole: string | null;
  requiredCapability: string | null;
  roleTruth: MovementRoleTruth | null;
  confirmedCapabilities: string[];
  detail: string;
  existedInPhase0Baseline?: boolean;
};

export type DeferredBodyweightExperienceGap = {
  exerciseId: string;
  dayTitle: string;
  kind: "demo" | "cues" | "progression_link" | "capability_limitation";
  detail: string;
};

export type BodyweightPosition =
  | "standing"
  | "kneeling"
  | "quadruped"
  | "prone"
  | "supine"
  | "side_lying"
  | "wall_supported";

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

const HIP_EXTENSION_IDS = new Set([
  "glute-bridges",
  "single-leg-glute-bridge-hold",
  "single-leg-hip-thrust",
]);

/** Catalog marks many floor strength progressions regressionOnly for gym contexts. */
const LEGAL_BODYWEIGHT_STRENGTH_IDS = new Set([
  "bodyweight-squat",
  "heels-elevated-squat",
  "split-squat",
  "cossack-squat",
  "shrimp-squat",
  "pushup",
  "wall-pushup",
  "close-grip-pushup",
  "archer-pushup",
  "pike-pushup",
  "plank",
  "side-plank",
  "side-plank-star",
  "hollow-body-hold",
  "dead-bug",
  "bird-dog",
  "bodyweight-good-morning",
  "single-leg-rdl",
  "prone-elbow-row",
  "back-widow",
  "reverse-snow-angel",
  "prone-ytw",
  "scapular-pushups",
  "scap-pullup",
  "neutral-grip-pullup",
  "pullup",
  "chinup-strict",
  ...HIP_EXTENSION_IDS,
]);

const OBSCURE_CORRECTIVE_IDS = new Set([
  "seated-lat-sweep-pulse",
  "prone-lat-sweep",
  "supine-lat-pulldown-isometric",
  "supine-elbow-drive-row",
]);

const isHonestUpperBackSlot = (slotKind?: string | null) => {
  const slot = normalizeToken(slotKind ?? "");
  return (
    slot.includes("upperback") ||
    slot.includes("scapular") ||
    slot.includes("trunk")
  );
};

const isTrueVerticalPull = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "verticalPull") &&
    (descriptor.includes("pull-up") ||
      descriptor.includes("pullup") ||
      descriptor.includes("chin-up") ||
      descriptor.includes("chinup") ||
      descriptor.includes("scap-pullup") ||
      descriptor.includes("scap pull"))
  );
};

const isPrepOnly = (exercise: Exercise) => {
  if (LEGAL_BODYWEIGHT_STRENGTH_IDS.has(exercise.id)) return false;
  if (isTrueVerticalPull(exercise)) return false;
  // regressionOnly alone is not prep in bodyweight mode — many legal floor
  // strength progressions carry that flag for gym-context degradation.
  return (
    Boolean(exercise.supportOnly) ||
    exercise.category === "warmup" ||
    exercise.category === "activation" ||
    exercise.category === "cooldown"
  );
};

const isTrueHorizontalPull = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  if (
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("pulse") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("ytw") ||
    descriptor.includes("wall slide") ||
    descriptor.includes("elbow-row") ||
    descriptor.includes("elbow drive") ||
    descriptor.includes("back-widow") ||
    descriptor.includes("widow")
  ) {
    return false;
  }
  return (
    hasPattern(exercise, "horizontalPull") ||
    (hasPattern(exercise, "pull") && descriptor.includes("row") && !descriptor.includes("elbow"))
  );
};

const isUpperBackControlSurrogate = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    descriptor.includes("elbow-row") ||
    descriptor.includes("back-widow") ||
    descriptor.includes("widow") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("ytw") ||
    descriptor.includes("scapular-push") ||
    descriptor.includes("prone-y") ||
    descriptor.includes("prone-t") ||
    (hasPattern(exercise, "scapular") && hasPattern(exercise, "pull"))
  );
};

const isFalsePullClaim = (
  exercise: Exercise,
  slotKind?: string | null
): { vertical: boolean; horizontal: boolean; roleTruth: MovementRoleTruth } | null => {
  // Authored honest upper-back / trunk slots must never be judged as true-pull claims,
  // even when the catalog still tags the exercise with gym pullHorizontal roles.
  if (isHonestUpperBackSlot(slotKind)) return null;

  const slot = normalizeToken(slotKind ?? "");
  const claimsVertical =
    slot.includes("verticalpull") || slot.includes("pullvertical");
  const claimsHorizontal =
    slot.includes("horizontalpull") || slot.includes("pullhorizontal");

  if (claimsVertical && !isTrueVerticalPull(exercise)) {
    return {
      vertical: true,
      horizontal: false,
      roleTruth: isUpperBackControlSurrogate(exercise) ? "surrogate" : "preparationOnly",
    };
  }
  if (claimsHorizontal && !isTrueHorizontalPull(exercise)) {
    return {
      vertical: false,
      horizontal: true,
      roleTruth: isUpperBackControlSurrogate(exercise) ? "surrogate" : "preparationOnly",
    };
  }
  return null;
};

export const classifyBodyweightMovementRoleTruth = (params: {
  exercise: Exercise;
  slotKind?: string | null;
  family?: string | null;
}): MovementRoleTruth => {
  const { exercise, slotKind, family } = params;
  if (isPrepOnly(exercise) && !HIP_EXTENSION_IDS.has(exercise.id)) {
    return "preparationOnly";
  }
  const familyToken = normalizeToken(family ?? "");
  if (
    familyToken === "upper_back_control" ||
    familyToken === "scapular_reinforcement" ||
    normalizeToken(slotKind ?? "").includes("upperback")
  ) {
    return isTrueVerticalPull(exercise) ? "true" : "surrogate";
  }
  if (isTrueVerticalPull(exercise) || isTrueHorizontalPull(exercise)) return "true";
  if (isUpperBackControlSurrogate(exercise)) return "surrogate";
  if (HIP_EXTENSION_IDS.has(exercise.id)) return "supportedVariant";
  return "true";
};

const illegalEquipmentTokens = [
  "machines",
  "cables",
  "barbell",
  "kettlebell",
  "dumbbells",
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
    (descriptor.includes("countertop") ||
      descriptor.includes("incline-push") ||
      descriptor.includes("incline push")) &&
    !capabilities.hasBench
  ) {
    missing.push("elevated_surface");
  }
  if (
    (descriptor.includes("chair") || descriptor.includes("box squat")) &&
    !capabilities.hasBench
  ) {
    missing.push("chair_or_bench");
  }
  if (
    (descriptor.includes("step-up") ||
      descriptor.includes("step up") ||
      descriptor.includes("stair")) &&
    !capabilities.hasBench
  ) {
    missing.push("step_or_stairs");
  }
  if (descriptor.includes("doorway") || descriptor.includes("door anchor")) {
    missing.push("doorway");
  }
  if (
    descriptor.includes("suspension") &&
    !capabilities.hasPullupBar
  ) {
    missing.push("suspension_or_pullup_bar");
  }
  if (
    (descriptor.includes("bulgarian") || descriptor.includes("chest-supported")) &&
    !capabilities.hasBench
  ) {
    missing.push("bench_or_chair");
  }
  return Array.from(new Set(missing));
};

const isSquatRole = (exercise: Exercise) =>
  hasPattern(exercise, "squat") || descriptorOf(exercise).includes("squat");

const isPushRole = (exercise: Exercise) =>
  hasPattern(exercise, "push") ||
  hasPattern(exercise, "verticalPush") ||
  hasPattern(exercise, "horizontalPush");

const isHingeOrHipExtension = (exercise: Exercise) => {
  if (HIP_EXTENSION_IDS.has(exercise.id)) return true;
  if (isPrepOnly(exercise) && !descriptorOf(exercise).includes("good morning")) {
    return false;
  }
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "hinge") &&
    (descriptor.includes("rdl") ||
      descriptor.includes("good morning") ||
      descriptor.includes("hip thrust") ||
      descriptor.includes("glute bridge") ||
      descriptor.includes("bridge") ||
      descriptor.includes("hinge"))
  );
};

const isUnilateralLower = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "single-leg") ||
    descriptor.includes("split") ||
    descriptor.includes("lunge") ||
    descriptor.includes("shrimp") ||
    descriptor.includes("cossack") ||
    descriptor.includes("single-leg")
  );
};

const isTrunkRole = (exercise: Exercise) => {
  const descriptor = descriptorOf(exercise);
  return (
    hasPattern(exercise, "core") ||
    hasPattern(exercise, "anti-extension") ||
    hasPattern(exercise, "anti-rotation") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("plank") ||
    descriptor.includes("bird dog") ||
    descriptor.includes("hollow")
  );
};

export const inferBodyweightPosition = (exercise: Exercise): BodyweightPosition => {
  const descriptor = descriptorOf(exercise);
  if (descriptor.includes("wall") || descriptor.includes("handstand")) {
    return "wall_supported";
  }
  if (
    descriptor.includes("side plank") ||
    descriptor.includes("side-plank") ||
    descriptor.includes("side lying")
  ) {
    return "side_lying";
  }
  if (
    descriptor.includes("dead bug") ||
    descriptor.includes("glute bridge") ||
    descriptor.includes("hip thrust") ||
    descriptor.includes("supine") ||
    descriptor.includes("hollow")
  ) {
    return "supine";
  }
  if (
    descriptor.includes("prone") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("back-widow") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("ytw")
  ) {
    return "prone";
  }
  if (descriptor.includes("bird dog") || descriptor.includes("quadruped")) {
    return "quadruped";
  }
  if (descriptor.includes("kneeling") || descriptor.includes("half kneeling")) {
    return "kneeling";
  }
  if (descriptor.includes("plank") && !descriptor.includes("side")) {
    return "prone";
  }
  return "standing";
};

export const countBodyweightPositionTransitions = (day: ProgramDay) => {
  const positions = day.routine
    .filter((item) => item.section === "main" || item.section === "accessory")
    .map((item) => {
      const exercise = exerciseById(item.exerciseId);
      return exercise ? inferBodyweightPosition(exercise) : null;
    })
    .filter((value): value is BodyweightPosition => Boolean(value));
  let transitions = 0;
  for (let i = 1; i < positions.length; i += 1) {
    if (positions[i] !== positions[i - 1]) transitions += 1;
  }
  return { transitions, positions };
};

export const collectDeferredBodyweightExperienceGaps = (
  program: Program,
  capabilities?: ProgramCapabilities
): DeferredBodyweightExperienceGap[] => {
  const gaps: DeferredBodyweightExperienceGap[] = [];
  const caps = capabilities ?? deriveProgramCapabilities(["none"]);
  if (!caps.hasPullupBar) {
    gaps.push({
      exerciseId: "*",
      dayTitle: "*",
      kind: "capability_limitation",
      detail:
        "True loaded pulling is unavailable without a confirmed pull-up bar or pulling setup; upper-back control is trained honestly instead.",
    });
  }
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

export const scoreBodyweightProgramStructuralQuality = (params: {
  failures: BodyweightHardFailure[];
  deferredGapCount: number;
}) => {
  const hardPenalty = Math.min(100, params.failures.length * 12);
  const structuralScore = Math.max(0, 100 - hardPenalty);
  const deferredPenalty = Math.min(25, params.deferredGapCount * 0.5);
  return {
    structuralScore,
    fullExperienceScore: Math.max(0, structuralScore - deferredPenalty),
    capabilityHonestyScore: params.failures.some((failure) =>
      failure.reasonCode.includes("FALSE_") ||
      failure.reasonCode === "BODYWEIGHT_UNCONFIRMED_SUPPORT" ||
      failure.reasonCode === "BODYWEIGHT_ILLEGAL_EQUIPMENT"
    )
      ? Math.max(0, 100 - params.failures.length * 15)
      : 100,
  };
};

export type ValidateBodyweightProgramParams = {
  program: Program;
  persona: string;
  equipment: string[];
  experience?: string;
  painAreas?: string[];
  phaseIndex?: number;
  phase0BaselineReasonCodes?: Set<string>;
};

export const validateBodyweightProgramContract = (
  params: ValidateBodyweightProgramParams
): BodyweightHardFailure[] => {
  const {
    program,
    persona,
    equipment,
    experience,
    painAreas = [],
    phaseIndex = null,
    phase0BaselineReasonCodes,
  } = params;
  const failures: BodyweightHardFailure[] = [];
  const capabilities = deriveProgramCapabilities(equipment);
  const confirmed = confirmedCapabilityLabels(capabilities);
  const pushFailure = (
    failure: Omit<
      BodyweightHardFailure,
      | "existedInPhase0Baseline"
      | "confirmedCapabilities"
      | "phase"
      | "daysPerWeek"
      | "roleTruth"
    > &
      Partial<
        Pick<
          BodyweightHardFailure,
          "phase" | "daysPerWeek" | "confirmedCapabilities" | "roleTruth"
        >
      >
  ) => {
    failures.push({
      phase: failure.phase ?? phaseIndex,
      daysPerWeek: failure.daysPerWeek ?? program.daysPerWeek,
      confirmedCapabilities: failure.confirmedCapabilities ?? confirmed,
      requiredCapability: failure.requiredCapability ?? null,
      roleTruth: failure.roleTruth ?? null,
      ...failure,
      existedInPhase0Baseline: phase0BaselineReasonCodes?.has(failure.reasonCode),
    });
  };

  const primaryMode = resolvePrimaryProgramEquipmentMode(equipment);
  if (primaryMode !== "bodyweight") {
    pushFailure({
      reasonCode: "BODYWEIGHT_IDENTITY_COLLAPSE",
      persona,
      dayTitle: null,
      slot: null,
      exerciseId: null,
      expectedRole: "bodyweight",
      actualRole: primaryMode,
      requiredCapability: null,
      detail: `Expected bodyweight primary mode, got ${primaryMode}`,
    });
    return failures;
  }

  const experienceLevel = normalizeBodyweightExperienceLevel(experience);
  const expectedTitles =
    program.daysPerWeek === 3
      ? BODYWEIGHT_THREE_DAY_TITLES
      : program.daysPerWeek === 4
      ? BODYWEIGHT_FOUR_DAY_TITLES
      : BODYWEIGHT_FIVE_DAY_TITLES;

  const actualTitles = program.week.map((day) => day.title);
  actualTitles.forEach((title) => {
    if (looksLikeGymShapedDayTitle(title)) {
      pushFailure({
        reasonCode: "BODYWEIGHT_GYM_TEMPLATE_INHERITANCE",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: "bodyweight_full_body_or_practice",
        actualRole: title,
        requiredCapability: null,
        detail: "Bodyweight mode inherited a gym-shaped day title",
      });
    }
  });

  expectedTitles.forEach((title) => {
    if (!actualTitles.includes(title)) {
      pushFailure({
        reasonCode: "BODYWEIGHT_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: title,
        actualRole: actualTitles.join(" | "),
        requiredCapability: null,
        detail: "Expected bodyweight day title missing from generated week",
      });
    }
  });

  let weeklySquat = 0;
  let weeklyHinge = 0;
  let weeklyUnilateral = 0;
  let weeklyPush = 0;
  let weeklyTrunk = 0;
  let weeklyUpperBackSupport = 0;

  program.week.forEach((day) => {
    const identity = resolveBodyweightDayIdentity(day.title);
    if (identity === "unknown" && !looksLikeGymShapedDayTitle(day.title)) {
      pushFailure({
        reasonCode: "BODYWEIGHT_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: day.title,
        slot: null,
        exerciseId: null,
        expectedRole: "known_bodyweight_day_identity",
        actualRole: "unknown",
        requiredCapability: null,
        detail: "Unrecognized bodyweight day title",
      });
    }

    const mains = day.routine.filter((item) => item.section === "main");
    const accessories = day.routine.filter((item) => item.section === "accessory");
    const buildReinforceCount = mains.length + accessories.length;
    const complexityCap =
      experienceLevel === "advanced" ? 7 : experienceLevel === "intermediate" ? 6 : 5;
    if (isBodyweightFullBodyDayTitle(day.title) && buildReinforceCount > complexityCap) {
      pushFailure({
        reasonCode: "BODYWEIGHT_EXCESS_COMPLEXITY",
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

    const volume = getBodyweightDayVolumeContract(day.title, experienceLevel);
    if (volume && isBodyweightFullBodyDayTitle(day.title)) {
      if (mains.length > volume.mainCount + 1 || accessories.length > volume.accessoryCount + 1) {
        pushFailure({
          reasonCode: "BODYWEIGHT_VOLUME_OUTSIDE_CONTRACT",
          persona,
          dayTitle: day.title,
          slot: "volume",
          exerciseId: null,
          expectedRole: `main<=${volume.mainCount}+1 accessory<=${volume.accessoryCount}+1`,
          actualRole: `main=${mains.length} accessory=${accessories.length}`,
          requiredCapability: null,
          detail: "Bodyweight session volume far outside experience contract",
        });
      }
    }

    const { transitions } = countBodyweightPositionTransitions(day);
    if (isBodyweightFullBodyDayTitle(day.title) && transitions > 8) {
      pushFailure({
        reasonCode: "BODYWEIGHT_EXCESS_POSITION_TRANSITIONS",
        persona,
        dayTitle: day.title,
        slot: "position_flow",
        exerciseId: null,
        expectedRole: "<=8",
        actualRole: String(transitions),
        requiredCapability: null,
        detail: "Unnecessarily chaotic standing/floor position transitions",
      });
    }

    const rolePlan = getBodyweightMainLanePlan(day.title, experienceLevel) ?? [];
    const mainExercises = mains
      .map((item) => ({ item, exercise: exerciseById(item.exerciseId) }))
      .filter(
        (entry): entry is { item: ProgramRoutineItem; exercise: Exercise } =>
          Boolean(entry.exercise)
      );

    const familyCounts = new Map<string, number>();
    let dayCorrectiveCluster = 0;
    let daySquat = false;
    let dayHinge = false;
    let dayUnilateral = false;
    let dayPush = false;
    let dayTrunk = false;
    let dayUpperBack = false;

    mainExercises.forEach(({ item, exercise }, index) => {
      const slotKind = item.selectionDebug?.slotKind ?? null;
      const planned = rolePlan[index];
      const familyKey =
        planned?.family ?? normalizeToken(slotKind ?? exercise.pattern ?? "unknown");
      familyCounts.set(familyKey, (familyCounts.get(familyKey) ?? 0) + 1);

      const roleTruth = classifyBodyweightMovementRoleTruth({
        exercise,
        slotKind,
        family: planned?.family ?? familyKey,
      });

      if (isSquatRole(exercise)) {
        daySquat = true;
        weeklySquat += 1;
      }
      if (isHingeOrHipExtension(exercise)) {
        dayHinge = true;
        weeklyHinge += 1;
      }
      if (isUnilateralLower(exercise)) {
        dayUnilateral = true;
        weeklyUnilateral += 1;
      }
      if (isPushRole(exercise)) {
        dayPush = true;
        weeklyPush += 1;
      }
      if (isTrunkRole(exercise)) {
        dayTrunk = true;
        weeklyTrunk += 1;
      }
      if (
        isUpperBackControlSurrogate(exercise) ||
        isTrueVerticalPull(exercise) ||
        familyKey === "upper_back_control" ||
        familyKey === "true_vertical_pull" ||
        familyKey === "scapular_reinforcement"
      ) {
        dayUpperBack = true;
        weeklyUpperBackSupport += 1;
      }

      if (OBSCURE_CORRECTIVE_IDS.has(exercise.id) || roleTruth === "preparationOnly") {
        dayCorrectiveCluster += 1;
      }

      if (isPrepOnly(exercise) && roleTruth === "preparationOnly") {
        pushFailure({
          reasonCode: "BODYWEIGHT_PREP_AS_MAIN",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: planned?.family ?? "strength_main",
          actualRole: "preparationOnly",
          requiredCapability: null,
          roleTruth: "preparationOnly",
          detail: "Preparation/regression drill filled a bodyweight main role",
        });
      }

      const falsePull = isFalsePullClaim(exercise, slotKind);
      if (falsePull?.vertical) {
        pushFailure({
          reasonCode: "BODYWEIGHT_FALSE_VERTICAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: capabilities.hasPullupBar
            ? "true_vertical_pull_or_honest_surrogate_slot"
            : "honest_upper_back_control_slot",
          actualRole: "false_vertical_pull_claim",
          requiredCapability: capabilities.hasPullupBar ? "pullup_bar" : null,
          roleTruth: falsePull.roleTruth,
          detail: "Surrogate/prep work must not satisfy a true vertical pull slot",
        });
      }
      if (falsePull?.horizontal) {
        pushFailure({
          reasonCode: "BODYWEIGHT_FALSE_HORIZONTAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "honest_upper_back_control_or_true_horizontal",
          actualRole: "false_horizontal_pull_claim",
          requiredCapability: null,
          roleTruth: falsePull.roleTruth,
          detail: "Prone/scapular drill must not satisfy a true horizontal pull slot",
        });
      }

      for (const token of illegalEquipmentTokens) {
        if (exercise.equipment.includes(token)) {
          pushFailure({
            reasonCode: "BODYWEIGHT_ILLEGAL_EQUIPMENT",
            persona,
            dayTitle: day.title,
            slot: slotKind,
            exerciseId: exercise.id,
            expectedRole: "floor_wall_bodyweight_only",
            actualRole: token,
            requiredCapability: null,
            roleTruth,
            detail: `Bodyweight program selected ${token}-dependent exercise`,
          });
        }
      }

      const missingSupport = requiresUnconfirmedSupport(exercise, capabilities);
      if (missingSupport.length) {
        pushFailure({
          reasonCode: "BODYWEIGHT_UNCONFIRMED_SUPPORT",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "confirmed_support_only",
          actualRole: missingSupport.join(","),
          requiredCapability: missingSupport[0] ?? null,
          roleTruth,
          detail: "Exercise requires unconfirmed furniture or support equipment",
        });
      }
    });

    if (dayCorrectiveCluster >= 3) {
      pushFailure({
        reasonCode: "BODYWEIGHT_CORRECTIVE_CLUSTER",
        persona,
        dayTitle: day.title,
        slot: "build",
        exerciseId: null,
        expectedRole: "<3_obscure_correctives",
        actualRole: String(dayCorrectiveCluster),
        requiredCapability: null,
        detail: "Obscure corrective cluster dominates the Build section",
      });
    }

    if (identity === "full_body_a") {
      if (!daySquat) {
        pushFailure({
          reasonCode: "BODYWEIGHT_MISSING_SQUAT",
          persona,
          dayTitle: day.title,
          slot: "mainSquatPrimary",
          exerciseId: null,
          expectedRole: "squat",
          actualRole: null,
          requiredCapability: null,
          detail: "Full Body A missing squat role",
        });
      }
      if (!dayPush) {
        pushFailure({
          reasonCode: "BODYWEIGHT_MISSING_PUSH",
          persona,
          dayTitle: day.title,
          slot: "mainPushCompound",
          exerciseId: null,
          expectedRole: "push",
          actualRole: null,
          requiredCapability: null,
          detail: "Full Body A missing push role",
        });
      }
      if (!dayTrunk) {
        const trunkAccessory = accessories.some((item) => {
          const exercise = exerciseById(item.exerciseId);
          return exercise ? isTrunkRole(exercise) : false;
        });
        if (!trunkAccessory) {
          pushFailure({
            reasonCode: "BODYWEIGHT_MISSING_TRUNK",
            persona,
            dayTitle: day.title,
            slot: "mainTrunkAntiExtension",
            exerciseId: null,
            expectedRole: "trunk",
            actualRole: null,
            requiredCapability: null,
            detail: "Full Body A missing trunk / anti-extension role",
          });
        }
      }
    }

    if (identity === "full_body_b" && !dayHinge) {
      pushFailure({
        reasonCode: "BODYWEIGHT_MISSING_HINGE_OR_HIP_EXTENSION",
        persona,
        dayTitle: day.title,
        slot: "mainHingePrimary",
        exerciseId: null,
        expectedRole: "hinge_or_hip_extension",
        actualRole: null,
        requiredCapability: null,
        detail: "Full Body B missing truthful hinge / hip-extension role",
      });
    }

    if (
      (identity === "full_body_b" || identity === "full_body_c") &&
      !dayUnilateral
    ) {
      pushFailure({
        reasonCode: "BODYWEIGHT_MISSING_UNILATERAL",
        persona,
        dayTitle: day.title,
        slot: "mainUnilateralLowerLoaded",
        exerciseId: null,
        expectedRole: "unilateral_lower",
        actualRole: null,
        requiredCapability: null,
        detail: `${day.title} missing unilateral lower-body role`,
      });
    }

    if (identity === "full_body_c" && !dayUpperBack && !capabilities.hasPullupBar) {
      // Honest upper-back support is required when true pulling is unavailable.
      pushFailure({
        reasonCode: "BODYWEIGHT_MISSING_WEEKLY_ROLE",
        persona,
        dayTitle: day.title,
        slot: "mainUpperBackControl",
        exerciseId: null,
        expectedRole: "upper_back_control",
        actualRole: null,
        requiredCapability: null,
        detail: "Full Body C missing honest upper-back / scapular strength intent",
      });
    }

    for (const [family, count] of familyCounts) {
      if (count >= 3) {
        pushFailure({
          reasonCode: "BODYWEIGHT_DUPLICATE_FAMILY",
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

    void dayPush;
  });

  if (weeklySquat < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_squat",
      exerciseId: null,
      expectedRole: "squat>=1",
      actualRole: String(weeklySquat),
      requiredCapability: null,
      detail: "Week missing squat exposure",
    });
  }
  if (weeklyHinge < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_HINGE_OR_HIP_EXTENSION",
      persona,
      dayTitle: null,
      slot: "weekly_hinge",
      exerciseId: null,
      expectedRole: "hinge_or_hip_extension>=1",
      actualRole: String(weeklyHinge),
      requiredCapability: null,
      detail: "Week missing hinge / hip-extension exposure",
    });
  }
  if (weeklyUnilateral < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_UNILATERAL",
      persona,
      dayTitle: null,
      slot: "weekly_unilateral",
      exerciseId: null,
      expectedRole: "unilateral>=1",
      actualRole: String(weeklyUnilateral),
      requiredCapability: null,
      detail: "Week missing unilateral lower-body exposure",
    });
  }
  if (weeklyPush < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_PUSH",
      persona,
      dayTitle: null,
      slot: "weekly_push",
      exerciseId: null,
      expectedRole: "push>=1",
      actualRole: String(weeklyPush),
      requiredCapability: null,
      detail: "Week missing push exposure",
    });
  }
  if (weeklyTrunk < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_TRUNK",
      persona,
      dayTitle: null,
      slot: "weekly_trunk",
      exerciseId: null,
      expectedRole: "trunk>=1",
      actualRole: String(weeklyTrunk),
      requiredCapability: null,
      detail: "Week missing trunk exposure",
    });
  }
  if (weeklyUpperBackSupport < 1) {
    pushFailure({
      reasonCode: "BODYWEIGHT_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_upper_back",
      exerciseId: null,
      expectedRole: "upper_back_support>=1",
      actualRole: String(weeklyUpperBackSupport),
      requiredCapability: null,
      detail: "Week missing honest upper-back / scapular support exposure",
    });
  }

  void painAreas;
  return failures;
};

export {
  BODYWEIGHT_THREE_DAY_TITLES,
  BODYWEIGHT_FOUR_DAY_TITLES,
  BODYWEIGHT_FIVE_DAY_TITLES,
  resolveBodyweightDayIdentity,
  looksLikeGymShapedDayTitle,
  isBodyweightFullBodyDayTitle,
};

export type { BodyweightDayIdentity };
