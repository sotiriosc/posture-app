/**
 * First-class mixed-home session templates (Phase 5B).
 *
 * Selected before exercise selection when primaryEquipmentMode === "mixedHome".
 * Structural base = dumbbell Full Body A/B/C; bands only for justified advantages.
 *
 * Weekly rotation (documented before implementation):
 * - 3d: Full Body A / B / C
 * - 4d: A / B / C + Practice & Restore (lower-volume pull + squat)
 * - 5d: A / B / C + Upper Pattern Practice + Lower & Core Practice
 * Extra days distribute pattern stress; they do not become band-corrective or gym body-part days.
 */

import type { ThreeDayMainLanePlanEntry } from "@/lib/program/dayTemplates";
import type {
  SplitTemplateRequirementRule,
  SplitTemplateRuleSet,
  SplitTemplateSpec,
} from "@/lib/program/splitTemplatePolicy";
import type { BandSetupLane } from "@/lib/program/bandSetup";
import {
  DUMBBELL_FIVE_DAY_TITLES,
  DUMBBELL_FOUR_DAY_TITLES,
  DUMBBELL_ROLE_CANDIDATE_IDS,
  DUMBBELL_THREE_DAY_TITLES,
  getDumbbellDayVolumeContract,
  getDumbbellMainLanePlan,
  isDumbbellFullBodyDayTitle,
  isDumbbellProgramDayTitle,
  looksLikeGymShapedDayTitle as looksLikeGymShapedDayTitleShared,
  normalizeDumbbellExperienceLevel,
  resolveDumbbellDayIdentity,
  resolveDumbbellThreeDayBlueprint,
  type DumbbellDayIdentity,
  type DumbbellExperienceLevel,
  type DumbbellThreeDayBlueprint,
} from "@/lib/program/dumbbellTemplates";
import { BAND_ROLE_CANDIDATES } from "@/lib/program/bandTemplates";

export type MixedHomeExperienceLevel = DumbbellExperienceLevel;
export type MixedHomeDayIdentity = DumbbellDayIdentity;

/** Capability lanes from phase5b §4. */
export type MixedHomeCapabilityLane =
  | "db_long_with_anchor"
  | "db_long_no_anchor"
  | "db_loop_only"
  | "db_both_with_anchor"
  | "db_both_no_anchor"
  | "db_legacy_unknown";

export type MixedHomeSelectedTool = "dumbbell" | "band" | "bodyweight";

export type MixedHomeBandRationale =
  | "true_vertical_pull_high_anchor"
  | "true_vertical_pull_pullup_bar"
  | "horizontal_pull_advantage"
  | "anti_rotation_anchor"
  | "scapular_rear_delt"
  | "pain_aware_substitution"
  | "resistance_profile_variety"
  | "dumbbell_primary_anchor"
  | "bodyweight_support";

export const MIXED_HOME_THREE_DAY_TITLES = DUMBBELL_THREE_DAY_TITLES;
export const MIXED_HOME_FOUR_DAY_TITLES = DUMBBELL_FOUR_DAY_TITLES;
export const MIXED_HOME_FIVE_DAY_TITLES = DUMBBELL_FIVE_DAY_TITLES;

export const looksLikeGymShapedDayTitle = looksLikeGymShapedDayTitleShared;
export const normalizeMixedHomeExperienceLevel = normalizeDumbbellExperienceLevel;
export const resolveMixedHomeDayIdentity = resolveDumbbellDayIdentity;
export const isMixedHomeFullBodyDayTitle = isDumbbellFullBodyDayTitle;
export const isMixedHomeProgramDayTitle = isDumbbellProgramDayTitle;
export const getMixedHomeDayVolumeContract = getDumbbellDayVolumeContract;

export const resolveMixedHomeCapabilityLane = (params: {
  bandSetupLane: BandSetupLane;
}): MixedHomeCapabilityLane => {
  switch (params.bandSetupLane) {
    case "long_with_anchor":
      return "db_long_with_anchor";
    case "long_no_anchor":
      return "db_long_no_anchor";
    case "loop_only":
      return "db_loop_only";
    case "legacy_unknown":
    case "none":
      return "db_legacy_unknown";
    default:
      return "db_legacy_unknown";
  }
};

/** Refine lane when both band types are confirmed via bandSetup option. */
export const refineMixedHomeCapabilityLane = (params: {
  bandSetupLane: BandSetupLane;
  resolvedBandSetup?: string | null;
}): MixedHomeCapabilityLane => {
  const setup = params.resolvedBandSetup ?? "";
  if (setup === "both_with_anchor") return "db_both_with_anchor";
  if (setup === "both_no_anchor") return "db_both_no_anchor";
  return resolveMixedHomeCapabilityLane({ bandSetupLane: params.bandSetupLane });
};

export const mixedHomeLaneHasHighAnchor = (lane: MixedHomeCapabilityLane) =>
  lane === "db_long_with_anchor" || lane === "db_both_with_anchor";

export const mixedHomeLaneHasLongBand = (lane: MixedHomeCapabilityLane) =>
  lane === "db_long_with_anchor" ||
  lane === "db_long_no_anchor" ||
  lane === "db_both_with_anchor" ||
  lane === "db_both_no_anchor";

export const mixedHomeLaneHasLoop = (lane: MixedHomeCapabilityLane) =>
  lane === "db_loop_only" ||
  lane === "db_both_with_anchor" ||
  lane === "db_both_no_anchor";

export const mixedHomeLaneAllowsAnchoredAntiRotation = (lane: MixedHomeCapabilityLane) =>
  mixedHomeLaneHasHighAnchor(lane);

const toBandSetupLane = (lane: MixedHomeCapabilityLane): BandSetupLane => {
  if (lane === "db_long_with_anchor" || lane === "db_both_with_anchor") {
    return "long_with_anchor";
  }
  if (lane === "db_long_no_anchor" || lane === "db_both_no_anchor") {
    return "long_no_anchor";
  }
  if (lane === "db_loop_only") return "loop_only";
  return "legacy_unknown";
};

export const getMixedHomeMainLanePlan = (
  dayTitle: string,
  experience?: string,
  options?: { hasTrueVerticalPullCapability?: boolean }
): ThreeDayMainLanePlanEntry[] | null => {
  const plan = getDumbbellMainLanePlan(dayTitle, experience);
  if (!plan) return null;
  if (!options?.hasTrueVerticalPullCapability) return plan;
  const identity = resolveMixedHomeDayIdentity(dayTitle);
  if (identity !== "full_body_c") return plan;
  return plan.map((entry) => {
    if (entry.family !== "lat_biased_pull") return entry;
    return {
      lane: "pull" as const,
      slotKind: "mainPullVertical",
      family: "true_vertical_pull" as ThreeDayMainLanePlanEntry["family"],
    };
  });
};

const BAND_ADVANTAGE_IDS: Record<string, string[]> = {
  true_vertical_pull: [
    "band-lat-pulldown",
    "standing-band-lat-pulldown",
    "band-straight-arm-pulldown",
  ],
  horizontal_pull: ["split-stance-row", "band-row", "single-arm-band-row"],
  anti_rotation: ["pallof-press"],
  scapular_rear_delt: [
    "band-pull-apart",
    "band-pull-aparts",
    "band-rear-delt-fly",
    "face-pull",
  ],
  pullup_vertical: [
    "pull-up",
    "chin-up",
    "assisted-pull-up",
    "band-assisted-pull-up",
    "negative-pull-up",
  ],
};

const classifyTool = (exerciseId: string): MixedHomeSelectedTool => {
  if (
    exerciseId.includes("band") ||
    exerciseId.includes("pallof") ||
    exerciseId.includes("face-pull") ||
    exerciseId === "split-stance-row"
  ) {
    return "band";
  }
  if (
    exerciseId.includes("dumbbell") ||
    exerciseId.startsWith("db-") ||
    exerciseId.includes("goblet") ||
    exerciseId === "single-arm-dumbbell-row" ||
    exerciseId === "dumbbell-rows"
  ) {
    return "dumbbell";
  }
  return "bodyweight";
};

/**
 * Build ranked candidates for a role: dumbbell anchors first, then justified
 * band options for the capability lane.
 */
export const buildMixedHomeRoleCandidates = (params: {
  family: string;
  capabilityLane: MixedHomeCapabilityLane;
  hasPullupBar?: boolean;
  preferBandAdvantage?: boolean;
}): Array<{ id: string; tool: MixedHomeSelectedTool; rationale: MixedHomeBandRationale }> => {
  const { family, capabilityLane, hasPullupBar } = params;
  const bandLane = toBandSetupLane(capabilityLane);
  const bandPool = BAND_ROLE_CANDIDATES[bandLane] ?? BAND_ROLE_CANDIDATES.legacy_unknown;
  const dbPool = DUMBBELL_ROLE_CANDIDATE_IDS[family] ?? [];
  const out: Array<{
    id: string;
    tool: MixedHomeSelectedTool;
    rationale: MixedHomeBandRationale;
  }> = [];
  const seen = new Set<string>();

  const push = (
    id: string,
    rationale: MixedHomeBandRationale,
    tool?: MixedHomeSelectedTool
  ) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, tool: tool ?? classifyTool(id), rationale });
  };

  if (family === "true_vertical_pull") {
    if (hasPullupBar) {
      BAND_ADVANTAGE_IDS.pullup_vertical.forEach((id) =>
        push(id, "true_vertical_pull_pullup_bar")
      );
    }
    if (mixedHomeLaneHasHighAnchor(capabilityLane)) {
      BAND_ADVANTAGE_IDS.true_vertical_pull.forEach((id) =>
        push(id, "true_vertical_pull_high_anchor", "band")
      );
    }
    // Honest fallback if vertical capability was expected but candidates fail eligibility.
    dbPool.forEach((id) => push(id, "dumbbell_primary_anchor"));
    (bandPool.lat_biased_pull ?? []).forEach((id) =>
      push(id, "resistance_profile_variety")
    );
    return out;
  }

  if (family === "horizontal_pull") {
    // Dumbbell row is the primary strength anchor.
    dbPool.forEach((id) => push(id, "dumbbell_primary_anchor"));
    if (mixedHomeLaneHasLongBand(capabilityLane)) {
      BAND_ADVANTAGE_IDS.horizontal_pull.forEach((id) =>
        push(id, "horizontal_pull_advantage", "band")
      );
    }
    // Mini-loops must not create false loaded pulling — skip band rows for loop_only.
    return out;
  }

  if (family === "lat_biased_pull") {
    dbPool.forEach((id) => push(id, "dumbbell_primary_anchor"));
    if (mixedHomeLaneHasHighAnchor(capabilityLane)) {
      BAND_ADVANTAGE_IDS.true_vertical_pull.forEach((id) =>
        push(id, "true_vertical_pull_high_anchor", "band")
      );
    } else if (mixedHomeLaneHasLongBand(capabilityLane)) {
      (bandPool.lat_biased_pull ?? []).forEach((id) =>
        push(id, "resistance_profile_variety", "band")
      );
    } else if (mixedHomeLaneHasLoop(capabilityLane)) {
      BAND_ADVANTAGE_IDS.scapular_rear_delt.forEach((id) =>
        push(id, "scapular_rear_delt", "band")
      );
    }
    return out;
  }

  // Primary strength roles: dumbbells first; bands only as pain fallback.
  // Never let band pool displace horizontal/vertical press or squat anchors casually.
  dbPool.forEach((id) => push(id, "dumbbell_primary_anchor"));
  const strengthFamilies = new Set([
    "squat_primary",
    "horizontal_press_compound",
    "press_variation",
    "vertical_push",
    "hinge_primary",
    "unilateral_lower_loaded",
    "posterior_chain_secondary",
  ]);
  if (
    params.preferBandAdvantage &&
    mixedHomeLaneHasLongBand(capabilityLane) &&
    !strengthFamilies.has(family)
  ) {
    (bandPool[family] ?? []).forEach((id) =>
      push(id, "pain_aware_substitution", "band")
    );
  } else {
    (bandPool[family] ?? [])
      .filter((id) => classifyTool(id) === "bodyweight")
      .forEach((id) => push(id, "bodyweight_support", "bodyweight"));
  }

  if (family === "anti_rotation" && mixedHomeLaneAllowsAnchoredAntiRotation(capabilityLane)) {
    BAND_ADVANTAGE_IDS.anti_rotation.forEach((id) =>
      push(id, "anti_rotation_anchor", "band")
    );
  }

  return out;
};

export type MixedHomeMainAuthorItem = {
  exerciseId: string;
  slotKind: string;
  slotLane: ThreeDayMainLanePlanEntry["lane"];
  family: string;
  selectedTool: MixedHomeSelectedTool;
  rationale: MixedHomeBandRationale;
};

export const authorMixedHomeMainSelections = (params: {
  dayTitle: string;
  experienceLevel?: string;
  capabilityLane: MixedHomeCapabilityLane;
  hasPullupBar?: boolean;
  usedIds?: Iterable<string>;
  avoidVerticalPushLoad?: boolean;
  preferPainAwareHinge?: boolean;
  preferSoftHorizontalPress?: boolean;
  isEligible: (exerciseId: string, family: string) => boolean;
}): MixedHomeMainAuthorItem[] => {
  const canVertical =
    Boolean(params.hasPullupBar) || mixedHomeLaneHasHighAnchor(params.capabilityLane);
  const plan =
    getMixedHomeMainLanePlan(params.dayTitle, params.experienceLevel, {
      hasTrueVerticalPullCapability: canVertical,
    }) ?? [];
  const used = new Set(params.usedIds ?? []);
  const selections: MixedHomeMainAuthorItem[] = [];

  plan.forEach((slot) => {
    let ranked = buildMixedHomeRoleCandidates({
      family: slot.family,
      capabilityLane: params.capabilityLane,
      hasPullupBar: params.hasPullupBar,
      preferBandAdvantage: Boolean(params.preferPainAwareHinge),
    });

    if (slot.family === "hinge_primary" && params.preferPainAwareHinge) {
      const painFirst = [
        "single-leg-hip-thrust",
        "single-leg-glute-bridge-hold",
        ...ranked.map((entry) => entry.id),
      ];
      const seen = new Set<string>();
      ranked = painFirst
        .filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((id) => ({
          id,
          tool: classifyTool(id),
          rationale: "pain_aware_substitution" as const,
        }));
    }

    if (slot.family === "vertical_push" && params.avoidVerticalPushLoad) {
      ranked = ranked.filter(
        (entry) => entry.id === "pike-pushup" || entry.id.includes("pushup")
      );
      if (!ranked.length) {
        ranked = [
          {
            id: "pike-pushup",
            tool: "bodyweight",
            rationale: "pain_aware_substitution",
          },
        ];
      }
    }

    if (
      (slot.family === "horizontal_press_compound" ||
        slot.family === "press_variation") &&
      (params.avoidVerticalPushLoad || params.preferSoftHorizontalPress)
    ) {
      const soft = [
        "incline-pushup",
        "pushup",
        "dumbbell-floor-press",
        ...ranked.map((entry) => entry.id),
      ];
      const seen = new Set<string>();
      ranked = soft
        .filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((id) => ({
          id,
          tool: classifyTool(id),
          rationale:
            classifyTool(id) === "dumbbell"
              ? ("dumbbell_primary_anchor" as const)
              : ("pain_aware_substitution" as const),
        }));
    }

    if (
      slot.family === "unilateral_lower_loaded" ||
      slot.family === "press_variation"
    ) {
      // Prefer unused, but keep dumbbell anchors ahead of bodyweight fillers.
      ranked = [
        ...ranked.filter((entry) => entry.tool === "dumbbell" && !used.has(entry.id)),
        ...ranked.filter((entry) => entry.tool === "dumbbell" && used.has(entry.id)),
        ...ranked.filter((entry) => entry.tool !== "dumbbell" && !used.has(entry.id)),
        ...ranked.filter((entry) => entry.tool !== "dumbbell" && used.has(entry.id)),
      ];
    }

    // Rank already prefers unused-within-tool then used dumbbells before bodyweight.
    // Do not skip used dumbbell anchors in favor of unused bodyweight fillers.
    const picked = ranked.find((entry) =>
      params.isEligible(entry.id, slot.family)
    );
    if (!picked) return;
    used.add(picked.id);

    let slotKind = slot.slotKind;
    let family = slot.family;
    // Honest pull slot: only claim true vertical when the pick is actually vertical.
    if (slot.family === "true_vertical_pull") {
      const isVertical =
        picked.id.includes("pulldown") ||
        picked.id.includes("pull-up") ||
        picked.id.includes("pullup") ||
        picked.id.includes("chin-up") ||
        picked.id.includes("chinup");
      if (!isVertical) {
        slotKind = "mainPullSupport";
        family = "lat_biased_pull";
      }
    }

    selections.push({
      exerciseId: picked.id,
      slotKind,
      slotLane: slot.lane,
      family,
      selectedTool: picked.tool,
      rationale: picked.rationale,
    });
  });

  return selections;
};

const withAccessorySection = <RequirementRule extends SplitTemplateRequirementRule>(
  rule: RequirementRule,
  min: number
): RequirementRule => ({ ...rule, min, section: "accessory" });

export const buildMixedHomeSplitTemplateSpecs = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(
  daysPerWeek: 3 | 4 | 5,
  rules: SplitTemplateRuleSet<RequirementRule>
): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  const fullBodyA: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: MIXED_HOME_THREE_DAY_TITLES[0],
    focusTags: ["full-body", "squat", "push", "pull", "mixed-home", "dumbbells", "bands"],
    lanes: ["squat", "push", "pull"] as MainLane[],
    warmupFocus: "lower",
    cooldownFocus: "core",
    constraints: {
      requiredMainPatterns: [
        { pattern: "squat" as MainLane, min: 1 },
        { pattern: "push" as MainLane, min: 1 },
        { pattern: "pull" as MainLane, min: 1 },
      ],
      requiredAccessories: [
        withAccessorySection(rules.coreRule, 1),
        withAccessorySection(rules.scapPostureRule, 1),
      ],
      optionalRules: [rules.carryOrAntiRotationRule],
    },
  };

  const fullBodyB: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: MIXED_HOME_THREE_DAY_TITLES[1],
    focusTags: [
      "full-body",
      "hinge",
      "vertical_push",
      "unilateral",
      "mixed-home",
      "dumbbells",
      "bands",
    ],
    lanes: ["hinge", "squat", "verticalPush"] as MainLane[],
    warmupFocus: "upper",
    cooldownFocus: "core",
    constraints: {
      requiredMainPatterns: [
        { pattern: "hinge" as MainLane, min: 1 },
        { pattern: "squat" as MainLane, min: 1 },
        { pattern: "verticalPush" as MainLane, min: 1 },
      ],
      requiredAccessories: [
        withAccessorySection(rules.antiRotationRule, 1),
        withAccessorySection(rules.pullBackRule, 1),
      ],
    },
  };

  const fullBodyC: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: MIXED_HOME_THREE_DAY_TITLES[2],
    focusTags: ["full-body", "single-leg", "press", "lats", "mixed-home", "dumbbells", "bands"],
    lanes: ["squat", "push", "pull"] as MainLane[],
    warmupFocus: "lower",
    cooldownFocus: "core",
    constraints: {
      requiredMainPatterns: [
        { pattern: "squat" as MainLane, min: 1 },
        { pattern: "push" as MainLane, min: 1 },
        { pattern: "pull" as MainLane, min: 1 },
      ],
      requiredAccessories: [
        withAccessorySection(rules.coreRule, 1),
        withAccessorySection(rules.calvesRule, 1),
      ],
    },
  };

  if (daysPerWeek === 3) return [fullBodyA, fullBodyB, fullBodyC];

  if (daysPerWeek === 4) {
    return [
      fullBodyA,
      fullBodyB,
      fullBodyC,
      {
        title: MIXED_HOME_FOUR_DAY_TITLES[3],
        focusTags: ["practice", "restore", "mobility", "core", "mixed-home"],
        lanes: ["pull", "squat"] as MainLane[],
        warmupFocus: "core",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "pull" as MainLane, min: 1 },
            { pattern: "squat" as MainLane, min: 1 },
          ],
          requiredAccessories: [withAccessorySection(rules.coreRule, 1)],
          optionalRules: [rules.scapPostureRule],
        },
      },
    ];
  }

  return [
    fullBodyA,
    fullBodyB,
    fullBodyC,
    {
      title: MIXED_HOME_FIVE_DAY_TITLES[3],
      focusTags: ["upper", "practice", "push", "pull", "scapular", "mixed-home"],
      lanes: ["push", "pull"] as MainLane[],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [
          { pattern: "push" as MainLane, min: 1 },
          { pattern: "pull" as MainLane, min: 1 },
        ],
        requiredAccessories: [withAccessorySection(rules.scapPostureRule, 1)],
      },
    },
    {
      title: MIXED_HOME_FIVE_DAY_TITLES[4],
      focusTags: ["lower", "practice", "core", "hinge", "squat", "mixed-home"],
      lanes: ["squat", "hinge"] as MainLane[],
      warmupFocus: "lower",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "squat" as MainLane, min: 1 },
          { pattern: "hinge" as MainLane, min: 1 },
        ],
        requiredAccessories: [withAccessorySection(rules.coreRule, 1)],
      },
    },
  ];
};

export type MixedHomeThreeDayBlueprint = DumbbellThreeDayBlueprint;

export const resolveMixedHomeThreeDayBlueprint = (params: {
  dayTitle: string;
  experienceLevel?: string;
  hasTrueVerticalPullCapability?: boolean;
}): MixedHomeThreeDayBlueprint | null => {
  const base = resolveDumbbellThreeDayBlueprint({
    dayTitle: params.dayTitle,
    experienceLevel: params.experienceLevel,
  });
  if (!base) return null;
  const plan =
    getMixedHomeMainLanePlan(params.dayTitle, params.experienceLevel, {
      hasTrueVerticalPullCapability: params.hasTrueVerticalPullCapability,
    }) ?? base.mainLanePlan;
  return {
    ...base,
    mainLanePlan: plan,
    requiredMainFamilies: plan.map((entry) => entry.family),
    constraints: {
      ...base.constraints,
      requireTrueVerticalPull: Boolean(params.hasTrueVerticalPullCapability),
    },
  };
};

export const maxMixedHomeSetupBlocksForExperience = (experience?: string) => {
  const level = normalizeMixedHomeExperienceLevel(experience);
  if (level === "beginner") return 3;
  if (level === "intermediate") return 4;
  return 5;
};

export const maxMixedHomeAnchorHeightChangesForExperience = (experience?: string) => {
  const level = normalizeMixedHomeExperienceLevel(experience);
  if (level === "beginner") return 1;
  return 2;
};
