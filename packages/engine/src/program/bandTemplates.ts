/**
 * First-class band session templates (Phase 4).
 * Selected before exercise selection when primaryEquipmentMode === "bands".
 */

import type { ThreeDayMainLanePlanEntry } from "@/lib/program/dayTemplates";
import type {
  SplitTemplateRequirementRule,
  SplitTemplateRuleSet,
  SplitTemplateSpec,
} from "@/lib/program/splitTemplatePolicy";
import type { BandSetupLane } from "@/lib/program/bandSetup";
import { looksLikeGymShapedDayTitle as looksLikeGymShapedDayTitleShared } from "@/lib/program/dumbbellTemplates";

export type BandExperienceLevel = "beginner" | "intermediate" | "advanced";

export type BandDayIdentity =
  | "full_body_a"
  | "full_body_b"
  | "full_body_c"
  | "practice_restore"
  | "upper_pattern_practice"
  | "lower_core_practice"
  | "unknown";

export const BAND_THREE_DAY_TITLES = [
  "Full Body A — Squat, Press and Row",
  "Full Body B — Hinge, Overhead and Unilateral",
  "Full Body C — Single-Leg, Press Variation and Lat Intent",
] as const;

export const BAND_FOUR_DAY_TITLES = [
  ...BAND_THREE_DAY_TITLES,
  "Practice & Restore",
] as const;

export const BAND_FIVE_DAY_TITLES = [
  ...BAND_THREE_DAY_TITLES,
  "Upper Pattern Practice",
  "Lower & Core Practice",
] as const;

export const looksLikeGymShapedDayTitle = looksLikeGymShapedDayTitleShared;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeBandExperienceLevel = (
  value?: string
): BandExperienceLevel => {
  const token = normalizeToken(value ?? "beginner");
  if (token === "advanced") return "advanced";
  if (token === "intermediate") return "intermediate";
  return "beginner";
};

export const resolveBandDayIdentity = (dayTitle: string): BandDayIdentity => {
  const token = normalizeToken(dayTitle);
  if (
    token.includes("full_body_a") ||
    (token.includes("squat") && token.includes("press") && token.includes("row"))
  ) {
    return "full_body_a";
  }
  if (
    token.includes("full_body_b") ||
    (token.includes("hinge") &&
      token.includes("overhead") &&
      token.includes("unilateral"))
  ) {
    return "full_body_b";
  }
  if (
    token.includes("full_body_c") ||
    (token.includes("single_leg") && token.includes("lat"))
  ) {
    return "full_body_c";
  }
  if (token.includes("practice") && token.includes("restore")) return "practice_restore";
  if (token.includes("upper_pattern")) return "upper_pattern_practice";
  if (token.includes("lower") && token.includes("core") && token.includes("practice")) {
    return "lower_core_practice";
  }
  return "unknown";
};

export const isBandFullBodyDayTitle = (dayTitle: string) => {
  const identity = resolveBandDayIdentity(dayTitle);
  return (
    identity === "full_body_a" ||
    identity === "full_body_b" ||
    identity === "full_body_c"
  );
};

export const isBandProgramDayTitle = (dayTitle: string) =>
  resolveBandDayIdentity(dayTitle) !== "unknown";

type VolumeContract = { mainCount: number; accessoryCount: number };

const FULL_BODY_VOLUME: Record<BandExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 5, accessoryCount: 2 },
};

const PRACTICE_VOLUME: Record<BandExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 2, accessoryCount: 1 },
  intermediate: { mainCount: 2, accessoryCount: 2 },
  advanced: { mainCount: 3, accessoryCount: 2 },
};

export const getBandDayVolumeContract = (
  dayTitle: string,
  experience?: string
): VolumeContract | null => {
  const level = normalizeBandExperienceLevel(experience);
  const identity = resolveBandDayIdentity(dayTitle);
  if (
    identity === "full_body_a" ||
    identity === "full_body_b" ||
    identity === "full_body_c"
  ) {
    return FULL_BODY_VOLUME[level];
  }
  if (
    identity === "practice_restore" ||
    identity === "upper_pattern_practice" ||
    identity === "lower_core_practice"
  ) {
    return PRACTICE_VOLUME[level];
  }
  return null;
};

const FULL_BODY_A: ThreeDayMainLanePlanEntry[] = [
  { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
  { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
];

const FULL_BODY_B: ThreeDayMainLanePlanEntry[] = [
  { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
];

const FULL_BODY_C: ThreeDayMainLanePlanEntry[] = [
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "push", slotKind: "mainPushSecondary", family: "press_variation" },
  { lane: "pull", slotKind: "mainPullSupport", family: "lat_biased_pull" },
];

const planForExperience = (
  base: ThreeDayMainLanePlanEntry[],
  level: BandExperienceLevel,
  mainCount: number,
  extras: ThreeDayMainLanePlanEntry[]
) => {
  const merged =
    level === "advanced"
      ? [...base, ...extras]
      : level === "intermediate"
      ? [...base, ...extras.slice(0, 1)]
      : base;
  return merged.slice(0, Math.max(1, Math.min(merged.length, mainCount)));
};

export const getBandMainLanePlan = (
  dayTitle: string,
  experience?: string
): ThreeDayMainLanePlanEntry[] | null => {
  const level = normalizeBandExperienceLevel(experience);
  const volume = getBandDayVolumeContract(dayTitle, experience);
  if (!volume) return null;
  const identity = resolveBandDayIdentity(dayTitle);
  if (identity === "full_body_a") {
    return planForExperience(
      FULL_BODY_A,
      level,
      volume.mainCount,
      [{ lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" }]
    );
  }
  if (identity === "full_body_b") {
    return planForExperience(
      FULL_BODY_B,
      level,
      volume.mainCount,
      [{ lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" }]
    );
  }
  if (identity === "full_body_c") {
    return planForExperience(
      FULL_BODY_C,
      level,
      volume.mainCount,
      [{ lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" }]
    );
  }
  if (identity === "practice_restore") {
    return [
      { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
      { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
    ].slice(0, volume.mainCount) as ThreeDayMainLanePlanEntry[];
  }
  if (identity === "upper_pattern_practice") {
    return [
      { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
      { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
      {
        lane: "verticalPush",
        slotKind: "mainVerticalPushPrimary",
        family: "vertical_push",
      },
    ].slice(0, volume.mainCount) as ThreeDayMainLanePlanEntry[];
  }
  if (identity === "lower_core_practice") {
    return [
      { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
      { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
      {
        lane: "squat",
        slotKind: "mainUnilateralLowerLoaded",
        family: "unilateral_lower_loaded",
      },
    ].slice(0, volume.mainCount) as ThreeDayMainLanePlanEntry[];
  }
  return null;
};

/** Ranked candidates by family + setup lane. */
export const BAND_ROLE_CANDIDATES: Record<
  BandSetupLane,
  Record<string, string[]>
> = {
  long_with_anchor: {
    squat_primary: ["band-front-squat", "heels-elevated-squat"],
    horizontal_press_compound: [
      "split-stance-band-chest-press",
      "band-chest-press",
      "pushup",
    ],
    horizontal_pull: ["split-stance-row", "band-row", "single-arm-band-row"],
    hinge_primary: ["band-rdl", "single-leg-hip-thrust", "single-leg-glute-bridge-hold"],
    unilateral_lower_loaded: ["split-squat", "heels-elevated-squat"],
    vertical_push: ["band-overhead-press", "pike-pushup"],
    press_variation: ["pushup", "band-chest-press", "close-grip-pushup"],
    lat_biased_pull: [
      "band-lat-pulldown",
      "standing-band-lat-pulldown",
      "band-straight-arm-pulldown",
      "split-stance-row",
    ],
  },
  long_no_anchor: {
    squat_primary: ["band-front-squat", "heels-elevated-squat"],
    horizontal_press_compound: ["band-chest-press", "split-stance-band-chest-press", "pushup"],
    horizontal_pull: ["split-stance-row", "band-row", "single-arm-band-row"],
    hinge_primary: ["band-rdl", "single-leg-hip-thrust", "single-leg-glute-bridge-hold"],
    unilateral_lower_loaded: ["split-squat", "heels-elevated-squat"],
    vertical_push: ["band-overhead-press", "pike-pushup"],
    press_variation: ["pushup", "band-chest-press", "close-grip-pushup"],
    lat_biased_pull: ["split-stance-row", "band-row", "band-pull-aparts"],
  },
  loop_only: {
    squat_primary: ["heels-elevated-squat", "split-squat"],
    horizontal_press_compound: ["pushup", "incline-pushup", "pike-pushup"],
    // Honest loop limitation: pull-aparts / scap work, not false loaded rows.
    horizontal_pull: ["band-pull-aparts", "band-pull-apart"],
    hinge_primary: ["single-leg-hip-thrust", "single-leg-glute-bridge-hold"],
    unilateral_lower_loaded: ["split-squat", "heels-elevated-squat"],
    vertical_push: ["pike-pushup", "incline-pushup"],
    press_variation: ["close-grip-pushup", "pushup", "incline-pushup"],
    lat_biased_pull: ["band-pull-aparts", "band-pull-apart", "band-rear-delt-fly"],
  },
  legacy_unknown: {
    squat_primary: ["heels-elevated-squat", "split-squat"],
    horizontal_press_compound: ["pushup", "incline-pushup"],
    horizontal_pull: ["band-pull-aparts", "band-pull-apart"],
    hinge_primary: ["single-leg-hip-thrust", "single-leg-glute-bridge-hold"],
    unilateral_lower_loaded: ["split-squat", "heels-elevated-squat"],
    vertical_push: ["pike-pushup"],
    press_variation: ["pushup", "close-grip-pushup"],
    lat_biased_pull: ["band-pull-aparts", "band-pull-apart"],
  },
  none: {
    squat_primary: ["heels-elevated-squat"],
    horizontal_press_compound: ["pushup"],
    horizontal_pull: ["band-pull-aparts"],
    hinge_primary: ["single-leg-glute-bridge-hold"],
    unilateral_lower_loaded: ["split-squat"],
    vertical_push: ["pike-pushup"],
    press_variation: ["pushup"],
    lat_biased_pull: ["band-pull-aparts"],
  },
};

const withAccessorySection = <RequirementRule extends SplitTemplateRequirementRule>(
  rule: RequirementRule,
  min: number
): RequirementRule => ({ ...rule, min, section: "accessory" });

export const buildBandSplitTemplateSpecs = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(
  daysPerWeek: 3 | 4 | 5,
  rules: SplitTemplateRuleSet<RequirementRule>
): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  const fullBodyA: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: BAND_THREE_DAY_TITLES[0],
    focusTags: ["full-body", "squat", "push", "pull", "bands"],
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
    },
  };
  const fullBodyB: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: BAND_THREE_DAY_TITLES[1],
    focusTags: ["full-body", "hinge", "vertical_push", "unilateral", "bands"],
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
    title: BAND_THREE_DAY_TITLES[2],
    focusTags: ["full-body", "single-leg", "press", "lats", "bands"],
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
        title: BAND_FOUR_DAY_TITLES[3],
        focusTags: ["practice", "restore", "mobility", "core"],
        lanes: ["pull", "squat"] as MainLane[],
        warmupFocus: "core",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "pull" as MainLane, min: 1 },
            { pattern: "squat" as MainLane, min: 1 },
          ],
          requiredAccessories: [withAccessorySection(rules.coreRule, 1)],
        },
      },
    ];
  }
  return [
    fullBodyA,
    fullBodyB,
    fullBodyC,
    {
      title: BAND_FIVE_DAY_TITLES[3],
      focusTags: ["upper", "practice", "push", "pull"],
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
      title: BAND_FIVE_DAY_TITLES[4],
      focusTags: ["lower", "practice", "core", "hinge", "squat"],
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

export type BandMainAuthorItem = {
  exerciseId: string;
  slotKind: string;
  slotLane: ThreeDayMainLanePlanEntry["lane"];
  family: string;
};

export const authorBandMainSelections = (params: {
  dayTitle: string;
  experienceLevel?: string;
  setupLane: BandSetupLane;
  usedIds?: Iterable<string>;
  avoidVerticalPushLoad?: boolean;
  preferPainAwareHinge?: boolean;
  phaseIndex?: number;
  isEligible: (exerciseId: string, family: string) => boolean;
}): BandMainAuthorItem[] => {
  const plan = getBandMainLanePlan(params.dayTitle, params.experienceLevel) ?? [];
  const laneCandidates = BAND_ROLE_CANDIDATES[params.setupLane] ?? BAND_ROLE_CANDIDATES.legacy_unknown;
  const used = new Set(params.usedIds ?? []);
  const selections: BandMainAuthorItem[] = [];
  const phaseIndex = params.phaseIndex ?? 1;

  plan.forEach((slot) => {
    let candidates = [...(laneCandidates[slot.family] ?? [])];
    if (slot.family === "hinge_primary" && params.preferPainAwareHinge) {
      // Activation: isometric bridge; skill/growth: progress to hip-thrust (still avoid RDL).
      candidates =
        phaseIndex >= 2
          ? [
              "single-leg-hip-thrust",
              "single-leg-glute-bridge-hold",
              ...candidates.filter((id) => id !== "band-rdl"),
              "band-rdl",
            ]
          : [
              "single-leg-glute-bridge-hold",
              "single-leg-hip-thrust",
              ...candidates.filter((id) => id !== "band-rdl"),
              "band-rdl",
            ];
    }
    if (slot.family === "vertical_push" && params.avoidVerticalPushLoad) {
      candidates = candidates.filter((id) => id.includes("pike") || id.includes("pushup"));
      if (!candidates.length) candidates = ["pike-pushup"];
    }
    if (
      phaseIndex >= 2 &&
      (slot.family === "horizontal_press_compound" || slot.family === "press_variation")
    ) {
      // Prefer standard / close-grip pushups over incline regressions in later phases.
      candidates = [
        ...candidates.filter((id) => id !== "incline-pushup"),
        ...candidates.filter((id) => id === "incline-pushup"),
      ];
    }
    if (phaseIndex >= 3 && slot.family === "squat_primary") {
      candidates = [
        ...candidates.filter((id) => id.includes("band")),
        ...candidates.filter((id) => !id.includes("band")),
      ];
    }
    const picked =
      candidates.find((id) => !used.has(id) && params.isEligible(id, slot.family)) ??
      candidates.find((id) => params.isEligible(id, slot.family));
    if (!picked) return;
    used.add(picked);
    selections.push({
      exerciseId: picked,
      slotKind: slot.slotKind,
      slotLane: slot.lane,
      family: slot.family,
    });
  });

  return selections;
};

export const maxAnchorHeightChangesForExperience = (
  experience?: string
): number => {
  const level = normalizeBandExperienceLevel(experience);
  if (level === "beginner") return 1;
  return 2;
};
