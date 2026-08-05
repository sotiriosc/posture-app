/**
 * Canonical band program contract (Phase 4).
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
  BAND_FIVE_DAY_TITLES,
  BAND_FOUR_DAY_TITLES,
  BAND_THREE_DAY_TITLES,
  getBandDayVolumeContract,
  isBandFullBodyDayTitle,
  looksLikeGymShapedDayTitle,
  maxAnchorHeightChangesForExperience,
  normalizeBandExperienceLevel,
  resolveBandDayIdentity,
} from "@/lib/program/bandTemplates";
import type { Program, ProgramRoutineItem } from "@/lib/types";

export type BandHardFailureReasonCode =
  | "BAND_GYM_TEMPLATE_INHERITANCE"
  | "BAND_UNCONFIRMED_TYPE"
  | "BAND_UNCONFIRMED_ANCHOR"
  | "BAND_ANCHOR_HEIGHT_MISMATCH"
  | "BAND_LOOP_ONLY_LONG_BAND_EXERCISE"
  | "BAND_FALSE_VERTICAL_PULL"
  | "BAND_MISSING_HORIZONTAL_PULL"
  | "BAND_MISSING_TRUE_HINGE"
  | "BAND_ILLEGAL_EQUIPMENT"
  | "BAND_UNCONFIRMED_SUPPORT"
  | "BAND_PREP_AS_MAIN"
  | "BAND_DAY_IDENTITY_MISMATCH"
  | "BAND_EXCESS_ANCHOR_CHANGES"
  | "BAND_DUPLICATE_FAMILY"
  | "BAND_EXCESS_COMPLEXITY"
  | "BAND_MISSING_WEEKLY_ROLE"
  | "BAND_EXCESSIVE_PHASE_CHURN"
  | "BAND_NONDETERMINISTIC_OUTPUT"
  | "BAND_IDENTITY_COLLAPSE"
  | "BAND_VOLUME_OUTSIDE_CONTRACT";

export type BandHardFailure = {
  reasonCode: BandHardFailureReasonCode;
  persona: string;
  setupLane: BandSetupLane | null;
  phase: number | null;
  daysPerWeek: number | null;
  dayTitle: string | null;
  slot: string | null;
  exerciseId: string | null;
  expectedRole: string | null;
  actualRole: string | null;
  requiredBandType: string | null;
  requiredAnchorHeight: string | null;
  confirmedCapabilities: string[];
  detail: string;
  existedInPhase0Baseline?: boolean;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const confirmedCapabilityLabels = (capabilities: ProgramCapabilities) =>
  Object.entries(capabilities)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .sort();

const isPrepOnly = (exercise: Exercise) => {
  if (
    exercise.id === "single-leg-glute-bridge-hold" ||
    exercise.id === "single-leg-hip-thrust" ||
    exercise.id === "single-leg-rdl" ||
    exercise.id === "band-pull-aparts" ||
    exercise.id === "band-pull-apart"
  ) {
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
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("curl") && descriptor.includes("hamstring")) return false;
  return (
    exercise.movementPattern.some((p) => normalizeToken(p) === "hinge") &&
    (descriptor.includes("rdl") ||
      descriptor.includes("deadlift") ||
      descriptor.includes("hip thrust") ||
      descriptor.includes("glute bridge") ||
      descriptor.includes("good morning"))
  );
};

const isTrueHorizontalPull = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (
    descriptor.includes("pullover") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("pulse") ||
    descriptor.includes("sweep")
  ) {
    return false;
  }
  return (
    exercise.movementPattern.some((p) => normalizeToken(p) === "horizontalpull") ||
    (exercise.movementPattern.some((p) => normalizeToken(p) === "pull") &&
      descriptor.includes("row"))
  );
};

const isTrueVerticalPull = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up")
  );
};

const anchorHeightOf = (
  exercise: Exercise
): "none" | "high" | "middle" | "low" => {
  const req = resolveBandExerciseRequirement({
    exerciseId: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment,
    variantKey: exercise.variantKey,
    cues: exercise.cues,
  });
  if (!req || req.anchor === "none") return "none";
  if (req.anchor === "high" || req.anchor === "repositionable") return "high";
  if (req.anchor === "middle") return "middle";
  return "low";
};

export const scoreBandProgramStructuralQuality = (params: {
  failures: BandHardFailure[];
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

export const collectDeferredBandExperienceGaps = (program: Program) => {
  const gaps: Array<{
    exerciseId: string;
    dayTitle: string;
    kind: "demo" | "cues" | "progression_link" | "anchor_safety";
    detail: string;
  }> = [];
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
      const req = resolveBandExerciseRequirement({
        exerciseId: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment,
        variantKey: exercise.variantKey,
        cues: exercise.cues,
      });
      if (req && req.anchor !== "none") {
        gaps.push({
          exerciseId: exercise.id,
          dayTitle: day.title,
          kind: "anchor_safety",
          detail: `Anchored exercise requires height=${req.anchor} + secure-anchor warning`,
        });
      }
    });
  });
  return gaps;
};

export const validateBandProgramContract = (params: {
  program: Program;
  persona: string;
  equipment: string[];
  bandSetup?: unknown;
  experience?: string;
  phaseIndex?: number;
}): BandHardFailure[] => {
  const {
    program,
    persona,
    equipment,
    bandSetup,
    experience,
    phaseIndex = null,
  } = params;
  const failures: BandHardFailure[] = [];
  const overlay = deriveBandCapabilityOverlay({ equipment, bandSetup });
  const capabilities = deriveProgramCapabilities(equipment, { bandSetup });
  const confirmed = confirmedCapabilityLabels(capabilities);
  const setupLane = overlay.setupLane;

  const pushFailure = (
    failure: Omit<
      BandHardFailure,
      | "setupLane"
      | "confirmedCapabilities"
      | "phase"
      | "daysPerWeek"
      | "requiredBandType"
      | "requiredAnchorHeight"
      | "existedInPhase0Baseline"
    > &
      Partial<
        Pick<
          BandHardFailure,
          | "phase"
          | "daysPerWeek"
          | "requiredBandType"
          | "requiredAnchorHeight"
          | "confirmedCapabilities"
        >
      >
  ) => {
    failures.push({
      setupLane,
      phase: failure.phase ?? phaseIndex,
      daysPerWeek: failure.daysPerWeek ?? program.daysPerWeek,
      confirmedCapabilities: failure.confirmedCapabilities ?? confirmed,
      requiredBandType: failure.requiredBandType ?? null,
      requiredAnchorHeight: failure.requiredAnchorHeight ?? null,
      ...failure,
    });
  };

  if (resolvePrimaryProgramEquipmentMode(equipment) !== "bands") {
    pushFailure({
      reasonCode: "BAND_IDENTITY_COLLAPSE",
      persona,
      dayTitle: null,
      slot: null,
      exerciseId: null,
      expectedRole: "bands",
      actualRole: resolvePrimaryProgramEquipmentMode(equipment),
      detail: "Expected bands primary mode",
    });
    return failures;
  }

  const experienceLevel = normalizeBandExperienceLevel(experience);
  const expectedTitles =
    program.daysPerWeek === 3
      ? BAND_THREE_DAY_TITLES
      : program.daysPerWeek === 4
      ? BAND_FOUR_DAY_TITLES
      : BAND_FIVE_DAY_TITLES;

  program.week.forEach((day) => {
    if (looksLikeGymShapedDayTitle(day.title)) {
      pushFailure({
        reasonCode: "BAND_GYM_TEMPLATE_INHERITANCE",
        persona,
        dayTitle: day.title,
        slot: null,
        exerciseId: null,
        expectedRole: "band_full_body_or_practice",
        actualRole: day.title,
        detail: "Band mode inherited a gym-shaped day title",
      });
    }
  });

  expectedTitles.forEach((title) => {
    if (!program.week.some((day) => day.title === title)) {
      pushFailure({
        reasonCode: "BAND_DAY_IDENTITY_MISMATCH",
        persona,
        dayTitle: title,
        slot: null,
        exerciseId: null,
        expectedRole: title,
        actualRole: program.week.map((day) => day.title).join(" | "),
        detail: "Expected band day title missing",
      });
    }
  });

  let weeklyHorizontalPull = 0;
  let weeklyTrueHinge = 0;
  let weeklySquat = 0;

  program.week.forEach((day) => {
    const mains = day.routine.filter((item) => item.section === "main");
    const accessories = day.routine.filter((item) => item.section === "accessory");
    const buildReinforce = mains.length + accessories.length;
    const complexityCap =
      experienceLevel === "advanced" ? 7 : experienceLevel === "intermediate" ? 6 : 5;
    if (isBandFullBodyDayTitle(day.title) && buildReinforce > complexityCap) {
      pushFailure({
        reasonCode: "BAND_EXCESS_COMPLEXITY",
        persona,
        dayTitle: day.title,
        slot: "build_reinforce",
        exerciseId: null,
        expectedRole: `<=${complexityCap}`,
        actualRole: String(buildReinforce),
        detail: "Build/Reinforce exceeds experience complexity cap",
      });
    }

    const volume = getBandDayVolumeContract(day.title, experienceLevel);
    if (volume && isBandFullBodyDayTitle(day.title)) {
      if (mains.length > volume.mainCount + 1 || accessories.length > volume.accessoryCount + 1) {
        pushFailure({
          reasonCode: "BAND_VOLUME_OUTSIDE_CONTRACT",
          persona,
          dayTitle: day.title,
          slot: "volume",
          exerciseId: null,
          expectedRole: `main<=${volume.mainCount}+1`,
          actualRole: `main=${mains.length}`,
          detail: "Band session volume far outside contract",
        });
      }
    }

    const heights: Array<"none" | "high" | "middle" | "low"> = [];
    let dayHorizontal = false;
    let dayHinge = false;

    const inspect = (item: ProgramRoutineItem) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      const slotKind = item.selectionDebug?.slotKind ?? null;
      const req = resolveBandExerciseRequirement({
        exerciseId: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment,
        variantKey: exercise.variantKey,
        cues: exercise.cues,
      });

      if (item.section === "main" || item.section === "accessory") {
        heights.push(anchorHeightOf(exercise));
      }

      if (item.section === "main" && isPrepOnly(exercise)) {
        pushFailure({
          reasonCode: "BAND_PREP_AS_MAIN",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "loaded_or_honest_main",
          actualRole: "preparationOnly",
          detail: "Preparation drill filled a band main role",
        });
      }

      for (const token of ["machines", "cables", "barbell", "kettlebell", "dumbbells"] as const) {
        if (exercise.equipment.includes(token) && setupLane !== "none") {
          // Bodyweight/dumbbell leakage into pure band weeks is illegal except loop bodyweight path.
          if (token === "dumbbells") {
            pushFailure({
              reasonCode: "BAND_ILLEGAL_EQUIPMENT",
              persona,
              dayTitle: day.title,
              slot: slotKind,
              exerciseId: exercise.id,
              expectedRole: "bands_or_bodyweight",
              actualRole: token,
              detail: `Band program selected ${token}-dependent exercise`,
            });
          } else {
            pushFailure({
              reasonCode: "BAND_ILLEGAL_EQUIPMENT",
              persona,
              dayTitle: day.title,
              slot: slotKind,
              exerciseId: exercise.id,
              expectedRole: "bands_or_bodyweight",
              actualRole: token,
              detail: `Band program selected ${token}-dependent exercise`,
            });
          }
        }
      }

      if (req && exercise.equipment.includes("bands")) {
        if (
          setupLane === "loop_only" &&
          req.bandType === "longBand"
        ) {
          pushFailure({
            reasonCode: "BAND_LOOP_ONLY_LONG_BAND_EXERCISE",
            persona,
            dayTitle: day.title,
            slot: slotKind,
            exerciseId: exercise.id,
            expectedRole: "miniLoop_or_bodyweight",
            actualRole: "longBand",
            requiredBandType: "longBand",
            detail: "Long-band exercise scheduled in loop-only plan",
          });
        }
        if (!overlay.bandSetupConfirmed && req.bandType !== "either") {
          pushFailure({
            reasonCode: "BAND_UNCONFIRMED_TYPE",
            persona,
            dayTitle: day.title,
            slot: slotKind,
            exerciseId: exercise.id,
            expectedRole: "confirmed_band_type_or_either",
            actualRole: req.bandType,
            requiredBandType: req.bandType,
            detail: "Band type not confirmed for scheduled exercise",
          });
        }
        if (req.anchor !== "none") {
          const ok =
            (req.anchor === "high" || req.anchor === "repositionable"
              ? capabilities.hasHighAnchor
              : req.anchor === "middle"
              ? capabilities.hasMidAnchor
              : capabilities.hasLowAnchor) && capabilities.hasDoorAnchor;
          if (!ok) {
            pushFailure({
              reasonCode: "BAND_UNCONFIRMED_ANCHOR",
              persona,
              dayTitle: day.title,
              slot: slotKind,
              exerciseId: exercise.id,
              expectedRole: "confirmed_anchor",
              actualRole: req.anchor,
              requiredAnchorHeight: req.anchor,
              detail: "Anchored band exercise without confirmed anchor capability",
            });
          }
        }
      }

      const missing = inferExerciseSupportRequirements({
        exerciseId: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment,
        cues: exercise.cues,
        mistakes: exercise.mistakes,
        tags: exercise.tags,
        variantKey: exercise.variantKey,
      }).filter((support) => !isSupportConfirmedByCapabilities(support, capabilities));
      if (missing.some((entry) => entry.includes("anchor") || entry.includes("door"))) {
        // Already covered by BAND_UNCONFIRMED_ANCHOR when req present.
      } else if (missing.includes("bench")) {
        pushFailure({
          reasonCode: "BAND_UNCONFIRMED_SUPPORT",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "confirmed_support",
          actualRole: missing.join(","),
          detail: "Unconfirmed support equipment",
        });
      }

      if (
        item.section === "main" &&
        isTrueVerticalPull(exercise) &&
        !capabilities.hasHighAnchor
      ) {
        pushFailure({
          reasonCode: "BAND_FALSE_VERTICAL_PULL",
          persona,
          dayTitle: day.title,
          slot: slotKind,
          exerciseId: exercise.id,
          expectedRole: "high_anchor_or_no_vertical_claim",
          actualRole: "vertical_pull_without_high_anchor",
          requiredAnchorHeight: "high",
          detail: "Vertical pull without confirmed high anchor",
        });
      }

      if (item.section === "main" && isTrueHorizontalPull(exercise)) {
        dayHorizontal = true;
        weeklyHorizontalPull += 1;
      }
      if (item.section === "main" && isTrueHinge(exercise)) {
        dayHinge = true;
        weeklyTrueHinge += 1;
      }
      if (
        item.section === "main" &&
        exercise.movementPattern.some((p) => normalizeToken(p) === "squat")
      ) {
        weeklySquat += 1;
      }
    };

    mains.forEach(inspect);
    accessories.forEach(inspect);

    const changes = countAnchorHeightChanges(heights);
    const maxChanges = maxAnchorHeightChangesForExperience(experienceLevel);
    if (changes > maxChanges) {
      pushFailure({
        reasonCode: "BAND_EXCESS_ANCHOR_CHANGES",
        persona,
        dayTitle: day.title,
        slot: "anchor_transitions",
        exerciseId: null,
        expectedRole: `<=${maxChanges}`,
        actualRole: String(changes),
        detail: "Too many anchor-height changes in one session",
      });
    }

    if (
      resolveBandDayIdentity(day.title) === "full_body_b" &&
      !dayHinge
    ) {
      pushFailure({
        reasonCode: "BAND_MISSING_TRUE_HINGE",
        persona,
        dayTitle: day.title,
        slot: "mainHingePrimary",
        exerciseId: null,
        expectedRole: "true_hinge_or_hip_extension",
        actualRole: null,
        detail: "Full Body B missing hinge / hip-extension intent",
      });
    }

    if (
      resolveBandDayIdentity(day.title) === "full_body_a" &&
      !dayHorizontal &&
      setupLane !== "loop_only" &&
      setupLane !== "legacy_unknown"
    ) {
      pushFailure({
        reasonCode: "BAND_MISSING_HORIZONTAL_PULL",
        persona,
        dayTitle: day.title,
        slot: "mainPullHorizontal",
        exerciseId: null,
        expectedRole: "horizontal_pull",
        actualRole: null,
        detail: "Full Body A missing true horizontal pull",
      });
    }
  });

  if (
    weeklyTrueHinge < 1 &&
    setupLane !== "none"
  ) {
    pushFailure({
      reasonCode: "BAND_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_hinge",
      exerciseId: null,
      expectedRole: "hinge>=1",
      actualRole: String(weeklyTrueHinge),
      detail: "Week missing hinge / hip-extension exposure",
    });
  }
  if (weeklySquat < 1) {
    pushFailure({
      reasonCode: "BAND_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_squat",
      exerciseId: null,
      expectedRole: "squat>=1",
      actualRole: String(weeklySquat),
      detail: "Week missing squat exposure",
    });
  }
  if (
    weeklyHorizontalPull < 1 &&
    setupLane !== "loop_only" &&
    setupLane !== "legacy_unknown"
  ) {
    pushFailure({
      reasonCode: "BAND_MISSING_WEEKLY_ROLE",
      persona,
      dayTitle: null,
      slot: "weekly_horizontal_pull",
      exerciseId: null,
      expectedRole: "horizontal_pull>=1",
      actualRole: String(weeklyHorizontalPull),
      detail: "Week missing true horizontal pull",
    });
  }

  return failures;
};

export {
  BAND_THREE_DAY_TITLES,
  BAND_FOUR_DAY_TITLES,
  BAND_FIVE_DAY_TITLES,
  resolveBandDayIdentity,
  looksLikeGymShapedDayTitle,
  isBandFullBodyDayTitle,
};
