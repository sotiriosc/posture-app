/**
 * First-class bodyweight session templates (Phase 5).
 *
 * Selected before exercise selection when primaryEquipmentMode === "bodyweight".
 * Assumes only floor + wall unless another support capability is explicitly confirmed.
 * Does not inherit gym body-part titles or loaded-slot expectations.
 */

import type { ThreeDayMainLanePlanEntry } from "@/lib/program/dayTemplates";
import type {
  SplitTemplateRequirementRule,
  SplitTemplateRuleSet,
  SplitTemplateSpec,
} from "@/lib/program/splitTemplatePolicy";

export type BodyweightExperienceLevel = "beginner" | "intermediate" | "advanced";

export type BodyweightDayIdentity =
  | "full_body_a"
  | "full_body_b"
  | "full_body_c"
  | "practice_restore"
  | "upper_pattern_practice"
  | "lower_core_practice"
  | "unknown";

/** Canonical titles from Phase 5 execution prompt. */
export const BODYWEIGHT_THREE_DAY_TITLES = [
  "Full Body A — Squat, Push and Trunk",
  "Full Body B — Hinge, Single-Leg and Shoulder",
  "Full Body C — Single-Leg, Push Variation and Back Intent",
] as const;

export const BODYWEIGHT_FOUR_DAY_TITLES = [
  ...BODYWEIGHT_THREE_DAY_TITLES,
  "Practice & Restore",
] as const;

export const BODYWEIGHT_FIVE_DAY_TITLES = [
  ...BODYWEIGHT_THREE_DAY_TITLES,
  "Upper Pattern Practice",
  "Lower & Core Practice",
] as const;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeBodyweightExperienceLevel = (
  value?: string
): BodyweightExperienceLevel => {
  const token = normalizeToken(value ?? "beginner");
  if (token === "advanced") return "advanced";
  if (token === "intermediate") return "intermediate";
  return "beginner";
};

export const resolveBodyweightDayIdentity = (
  dayTitle: string
): BodyweightDayIdentity => {
  const token = normalizeToken(dayTitle);
  if (
    token.includes("full_body_a") ||
    (token.includes("squat") && token.includes("push") && token.includes("trunk"))
  ) {
    return "full_body_a";
  }
  if (
    token.includes("full_body_b") ||
    (token.includes("hinge") &&
      token.includes("single_leg") &&
      token.includes("shoulder"))
  ) {
    return "full_body_b";
  }
  if (
    token.includes("full_body_c") ||
    (token.includes("single_leg") &&
      token.includes("push_variation") &&
      token.includes("back_intent"))
  ) {
    return "full_body_c";
  }
  if (token.includes("practice") && token.includes("restore")) {
    return "practice_restore";
  }
  if (token.includes("upper_pattern")) return "upper_pattern_practice";
  if (token.includes("lower") && token.includes("core") && token.includes("practice")) {
    return "lower_core_practice";
  }
  return "unknown";
};

export const isBodyweightFullBodyDayTitle = (dayTitle: string) => {
  const identity = resolveBodyweightDayIdentity(dayTitle);
  return (
    identity === "full_body_a" ||
    identity === "full_body_b" ||
    identity === "full_body_c"
  );
};

export const isBodyweightProgramDayTitle = (dayTitle: string) =>
  resolveBodyweightDayIdentity(dayTitle) !== "unknown";

export const looksLikeGymShapedDayTitle = (dayTitle: string) => {
  const token = normalizeToken(dayTitle);
  return (
    (token.includes("back") && token.includes("chest")) ||
    (token.includes("shoulder") && token.includes("arm")) ||
    (token.includes("legs") && token.includes("abs")) ||
    (token.includes("upper") && (token.includes("push") || token.includes("pull"))) ||
    (token.includes("lower") &&
      (token.includes("squat") || token.includes("hinge")) &&
      !token.includes("practice")) ||
    (token.includes("arms") && token.includes("posture"))
  );
};

type VolumeContract = { mainCount: number; accessoryCount: number };

/** Experience caps from Phase 5 prompt §8 (Build/Reinforce excluding warmup/finish). */
const FULL_BODY_VOLUME: Record<BodyweightExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 5, accessoryCount: 2 },
};

const PRACTICE_VOLUME: Record<BodyweightExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 2, accessoryCount: 1 },
  intermediate: { mainCount: 2, accessoryCount: 2 },
  advanced: { mainCount: 3, accessoryCount: 2 },
};

export const getBodyweightDayVolumeContract = (
  dayTitle: string,
  experience?: string
): VolumeContract | null => {
  const level = normalizeBodyweightExperienceLevel(experience);
  const identity = resolveBodyweightDayIdentity(dayTitle);
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

const FULL_BODY_A_BEGINNER: ThreeDayMainLanePlanEntry[] = [
  { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
  { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
  { lane: "pull", slotKind: "mainTrunkAntiExtension", family: "trunk_anti_extension" },
];

const FULL_BODY_A_INTERMEDIATE: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_A_BEGINNER,
  { lane: "hinge", slotKind: "mainHipExtension", family: "hip_extension" },
];

const FULL_BODY_A_ADVANCED: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_A_INTERMEDIATE,
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
];

const FULL_BODY_B_BEGINNER: ThreeDayMainLanePlanEntry[] = [
  { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
];

const FULL_BODY_B_INTERMEDIATE: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_B_BEGINNER,
  { lane: "pull", slotKind: "mainTrunkLateral", family: "trunk_lateral" },
];

const FULL_BODY_B_ADVANCED: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_B_INTERMEDIATE,
  { lane: "pull", slotKind: "mainScapularReinforcement", family: "scapular_reinforcement" },
];

const FULL_BODY_C_BEGINNER: ThreeDayMainLanePlanEntry[] = [
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "push", slotKind: "mainPushSecondary", family: "press_variation" },
  { lane: "pull", slotKind: "mainUpperBackControl", family: "upper_back_control" },
];

const FULL_BODY_C_INTERMEDIATE: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_C_BEGINNER,
  { lane: "hinge", slotKind: "mainHipExtension", family: "hip_extension" },
];

const FULL_BODY_C_ADVANCED: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_C_INTERMEDIATE,
  { lane: "pull", slotKind: "mainTrunkAntiExtension", family: "trunk_anti_extension" },
];

const planForExperience = (
  beginner: ThreeDayMainLanePlanEntry[],
  intermediate: ThreeDayMainLanePlanEntry[],
  advanced: ThreeDayMainLanePlanEntry[],
  level: BodyweightExperienceLevel,
  mainCount: number
) => {
  const base =
    level === "advanced" ? advanced : level === "intermediate" ? intermediate : beginner;
  return base.slice(0, Math.max(1, Math.min(base.length, mainCount)));
};

export const getBodyweightMainLanePlan = (
  dayTitle: string,
  experience?: string
): ThreeDayMainLanePlanEntry[] | null => {
  const level = normalizeBodyweightExperienceLevel(experience);
  const volume = getBodyweightDayVolumeContract(dayTitle, experience);
  if (!volume) return null;
  const identity = resolveBodyweightDayIdentity(dayTitle);
  if (identity === "full_body_a") {
    return planForExperience(
      FULL_BODY_A_BEGINNER,
      FULL_BODY_A_INTERMEDIATE,
      FULL_BODY_A_ADVANCED,
      level,
      volume.mainCount
    );
  }
  if (identity === "full_body_b") {
    return planForExperience(
      FULL_BODY_B_BEGINNER,
      FULL_BODY_B_INTERMEDIATE,
      FULL_BODY_B_ADVANCED,
      level,
      volume.mainCount
    );
  }
  if (identity === "full_body_c") {
    return planForExperience(
      FULL_BODY_C_BEGINNER,
      FULL_BODY_C_INTERMEDIATE,
      FULL_BODY_C_ADVANCED,
      level,
      volume.mainCount
    );
  }
  if (identity === "practice_restore") {
    const plan: ThreeDayMainLanePlanEntry[] = [
      { lane: "pull", slotKind: "mainUpperBackControl", family: "upper_back_control" },
      { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
    ];
    return plan.slice(0, volume.mainCount);
  }
  if (identity === "upper_pattern_practice") {
    const plan: ThreeDayMainLanePlanEntry[] = [
      { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
      { lane: "pull", slotKind: "mainUpperBackControl", family: "upper_back_control" },
      {
        lane: "verticalPush",
        slotKind: "mainVerticalPushPrimary",
        family: "vertical_push",
      },
    ];
    return plan.slice(0, volume.mainCount);
  }
  if (identity === "lower_core_practice") {
    const plan: ThreeDayMainLanePlanEntry[] = [
      { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
      { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
      { lane: "pull", slotKind: "mainTrunkAntiExtension", family: "trunk_anti_extension" },
    ];
    return plan.slice(0, volume.mainCount);
  }
  return null;
};

/**
 * Ranked floor/wall-first candidates. Elevated-surface and pull-up-bar options
 * appear only when eligibility confirms those capabilities.
 */
export const BODYWEIGHT_ROLE_CANDIDATE_IDS: Record<string, string[]> = {
  squat_primary: ["bodyweight-squat", "heels-elevated-squat"],
  horizontal_press_compound: ["wall-pushup", "pushup", "close-grip-pushup"],
  trunk_anti_extension: ["dead-bug", "plank", "hollow-body-hold", "bird-dog"],
  hip_extension: [
    "glute-bridges",
    "single-leg-glute-bridge-hold",
    "single-leg-hip-thrust",
  ],
  hinge_primary: [
    "bodyweight-good-morning",
    "glute-bridges",
    "single-leg-glute-bridge-hold",
    "single-leg-rdl",
    "single-leg-hip-thrust",
  ],
  unilateral_lower_loaded: ["split-squat", "cossack-squat", "shrimp-squat"],
  vertical_push: ["pike-pushup", "wall-pushup"],
  press_variation: ["pushup", "close-grip-pushup", "archer-pushup", "wall-pushup"],
  trunk_lateral: ["side-plank", "side-plank-star", "dead-bug"],
  scapular_reinforcement: ["scapular-pushups", "wall-slides", "prone-ytw"],
  /**
   * Honest upper-back / scapular strength — never a true loaded pull claim.
   * When pull-up bar is confirmed, true vertical pulling candidates are preferred
   * by authorship (see authorBodyweightMainSelections).
   */
  upper_back_control: [
    "prone-elbow-row",
    "back-widow",
    "reverse-snow-angel",
    "prone-ytw",
    "scapular-pushups",
  ],
  true_vertical_pull: [
    "scap-pullup",
    "neutral-grip-pullup",
    "pullup",
    "chinup-strict",
  ],
  posterior_chain_secondary: [
    "glute-bridges",
    "single-leg-glute-bridge-hold",
    "bodyweight-good-morning",
  ],
  core: ["dead-bug", "plank", "side-plank", "hollow-body-hold"],
};

const withAccessorySection = <RequirementRule extends SplitTemplateRequirementRule>(
  rule: RequirementRule,
  min: number
): RequirementRule => ({ ...rule, min, section: "accessory" });

export const buildBodyweightSplitTemplateSpecs = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(
  daysPerWeek: 3 | 4 | 5,
  rules: SplitTemplateRuleSet<RequirementRule>
): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  const fullBodyA: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: BODYWEIGHT_THREE_DAY_TITLES[0],
    focusTags: ["full-body", "squat", "push", "trunk", "bodyweight"],
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
        withAccessorySection(rules.scapPostureRule, 1),
        withAccessorySection(rules.coreRule, 1),
      ],
    },
  };

  const fullBodyB: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: BODYWEIGHT_THREE_DAY_TITLES[1],
    focusTags: ["full-body", "hinge", "unilateral", "vertical_push", "bodyweight"],
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
        withAccessorySection(rules.scapPostureRule, 1),
      ],
    },
  };

  const fullBodyC: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: BODYWEIGHT_THREE_DAY_TITLES[2],
    focusTags: ["full-body", "single-leg", "push", "upper-back", "bodyweight"],
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

  if (daysPerWeek === 3) {
    return [fullBodyA, fullBodyB, fullBodyC];
  }

  if (daysPerWeek === 4) {
    return [
      fullBodyA,
      fullBodyB,
      fullBodyC,
      {
        title: BODYWEIGHT_FOUR_DAY_TITLES[3],
        focusTags: ["practice", "restore", "mobility", "core", "bodyweight"],
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
      title: BODYWEIGHT_FIVE_DAY_TITLES[3],
      focusTags: ["upper", "practice", "push", "scapular", "bodyweight"],
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
      title: BODYWEIGHT_FIVE_DAY_TITLES[4],
      focusTags: ["lower", "practice", "core", "hinge", "squat", "bodyweight"],
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

export type BodyweightMainAuthorItem = {
  exerciseId: string;
  slotKind: string;
  slotLane: ThreeDayMainLanePlanEntry["lane"];
  family: string;
};

/**
 * Template-driven main authorship for bodyweight days. Prefer floor/wall
 * candidates; unlock true vertical pulling only when pull-up bar is confirmed.
 */
export const authorBodyweightMainSelections = (params: {
  dayTitle: string;
  experienceLevel?: string;
  usedIds?: Iterable<string>;
  hasPullupBar?: boolean;
  avoidVerticalPushLoad?: boolean;
  preferPainAwareHinge?: boolean;
  preferSoftHorizontalPress?: boolean;
  isEligible: (exerciseId: string, family: string) => boolean;
}): BodyweightMainAuthorItem[] => {
  const plan = getBodyweightMainLanePlan(params.dayTitle, params.experienceLevel) ?? [];
  const used = new Set(params.usedIds ?? []);
  const selections: BodyweightMainAuthorItem[] = [];

  plan.forEach((slot) => {
    let family = slot.family;
    let slotKind = slot.slotKind;
    let candidates = [...(BODYWEIGHT_ROLE_CANDIDATE_IDS[family] ?? [])];
    const preferTrueVerticalPull =
      family === "upper_back_control" && Boolean(params.hasPullupBar);

    if (preferTrueVerticalPull) {
      // Prefer confirmed-bar vertical pulling, but never claim mainPullVertical
      // unless a true vertical candidate is actually selected.
      candidates = [
        ...(BODYWEIGHT_ROLE_CANDIDATE_IDS.true_vertical_pull ?? []),
        ...candidates,
      ];
    }

    if (family === "hinge_primary" && params.preferPainAwareHinge) {
      candidates = [
        "glute-bridges",
        "single-leg-glute-bridge-hold",
        "single-leg-hip-thrust",
        ...candidates.filter(
          (id) =>
            id !== "bodyweight-good-morning" &&
            id !== "single-leg-rdl" &&
            id !== "glute-bridges"
        ),
      ];
    }

    if (family === "vertical_push" && params.avoidVerticalPushLoad) {
      candidates = candidates.filter((id) => id === "wall-pushup" || id === "pike-pushup");
      if (!candidates.length) candidates = ["wall-pushup"];
    }

    if (
      (family === "horizontal_press_compound" || family === "press_variation") &&
      (params.avoidVerticalPushLoad || params.preferSoftHorizontalPress)
    ) {
      candidates = [
        "wall-pushup",
        "pushup",
        ...candidates.filter((id) => id !== "wall-pushup" && id !== "pushup"),
      ];
    }

    if (family === "unilateral_lower_loaded" || family === "press_variation") {
      candidates = candidates
        .filter((id) => !used.has(id))
        .concat(candidates.filter((id) => used.has(id)));
    }

    const picked =
      candidates.find((id) => !used.has(id) && params.isEligible(id, family)) ??
      candidates.find((id) => params.isEligible(id, family));
    if (!picked) return;
    used.add(picked);

    const trueVerticalIds = new Set(
      BODYWEIGHT_ROLE_CANDIDATE_IDS.true_vertical_pull ?? []
    );
    if (preferTrueVerticalPull && trueVerticalIds.has(picked)) {
      family = "true_vertical_pull";
      slotKind = "mainPullVertical";
    } else if (preferTrueVerticalPull) {
      family = "upper_back_control";
      slotKind = "mainUpperBackControl";
    }

    selections.push({
      exerciseId: picked,
      slotKind,
      slotLane: slot.lane,
      family,
    });
  });

  return selections;
};

export type BodyweightThreeDayBlueprint = {
  dayTitle: string;
  mainCount: number;
  accessoryCount: number;
  mainLanePlan: ThreeDayMainLanePlanEntry[];
  requiredMainFamilies: string[];
  accessoryRoles: Array<"core" | "calves" | "posture_back" | "extra_ab">;
  laneSwapRules: Record<string, string[]>;
  constraints: {
    pullMainsAtLeastPressMains: boolean;
    noVerticalPushMain: boolean;
    noLowerBodyLeakMain: boolean;
    maxCarryAccessories: number;
    preventDuplicateCarries: boolean;
    carryCannotReplaceCore: boolean;
    /** Bodyweight without a bar never requires a true vertical pull. */
    requireTrueVerticalPull: boolean;
  };
};

export const resolveBodyweightThreeDayBlueprint = (params: {
  dayTitle: string;
  experienceLevel?: string;
}): BodyweightThreeDayBlueprint | null => {
  const { dayTitle, experienceLevel } = params;
  const volume = getBodyweightDayVolumeContract(dayTitle, experienceLevel);
  const mainLanePlan = getBodyweightMainLanePlan(dayTitle, experienceLevel);
  if (!volume || !mainLanePlan) return null;
  const identity = resolveBodyweightDayIdentity(dayTitle);
  const requiredMainFamilies = mainLanePlan.map((entry) => entry.family);
  const accessoryRoles: BodyweightThreeDayBlueprint["accessoryRoles"] =
    identity === "full_body_b"
      ? volume.accessoryCount >= 2
        ? ["posture_back", "core"]
        : ["core"]
      : volume.accessoryCount >= 2
      ? ["core", "posture_back"]
      : ["core"];

  return {
    dayTitle,
    mainCount: volume.mainCount,
    accessoryCount: volume.accessoryCount,
    mainLanePlan,
    requiredMainFamilies,
    accessoryRoles,
    laneSwapRules: {
      squat_primary: ["unilateral_lower_loaded"],
      horizontal_press_compound: ["press_variation"],
      hinge_primary: ["hip_extension", "posterior_chain_secondary"],
      unilateral_lower_loaded: ["squat_primary"],
      vertical_push: ["press_variation"],
      press_variation: ["horizontal_press_compound"],
      upper_back_control: ["scapular_reinforcement"],
      hip_extension: ["hinge_primary"],
      trunk_anti_extension: ["trunk_lateral"],
    },
    constraints: {
      pullMainsAtLeastPressMains: false,
      noVerticalPushMain: identity === "full_body_a",
      noLowerBodyLeakMain: false,
      maxCarryAccessories: 0,
      preventDuplicateCarries: true,
      carryCannotReplaceCore: true,
      requireTrueVerticalPull: false,
    },
  };
};
