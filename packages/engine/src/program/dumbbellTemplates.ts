/**
 * First-class dumbbell session templates (Phase 3).
 *
 * Selected before exercise selection when primaryEquipmentMode === "dumbbells".
 * Does not inherit gym body-part titles or machine/cable slot expectations.
 */

import type { ThreeDayMainLanePlanEntry } from "@/lib/program/dayTemplates";
import type {
  SplitTemplateRequirementRule,
  SplitTemplateRuleSet,
  SplitTemplateSpec,
} from "@/lib/program/splitTemplatePolicy";

export type DumbbellExperienceLevel = "beginner" | "intermediate" | "advanced";

export type DumbbellDayIdentity =
  | "full_body_a"
  | "full_body_b"
  | "full_body_c"
  | "practice_restore"
  | "upper_pattern_practice"
  | "lower_core_practice"
  | "unknown";

export const DUMBBELL_THREE_DAY_TITLES = [
  "Full Body A — Squat, Press and Row",
  "Full Body B — Hinge, Overhead and Unilateral",
  "Full Body C — Single-Leg, Press Variation and Lat Intent",
] as const;

export const DUMBBELL_FOUR_DAY_TITLES = [
  ...DUMBBELL_THREE_DAY_TITLES,
  "Practice & Restore",
] as const;

export const DUMBBELL_FIVE_DAY_TITLES = [
  ...DUMBBELL_THREE_DAY_TITLES,
  "Upper Pattern Practice",
  "Lower & Core Practice",
] as const;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeDumbbellExperienceLevel = (
  value?: string
): DumbbellExperienceLevel => {
  const token = normalizeToken(value ?? "beginner");
  if (token === "advanced") return "advanced";
  if (token === "intermediate") return "intermediate";
  return "beginner";
};

export const resolveDumbbellDayIdentity = (dayTitle: string): DumbbellDayIdentity => {
  const token = normalizeToken(dayTitle);
  if (token.includes("full_body_a") || (token.includes("squat") && token.includes("press") && token.includes("row"))) {
    return "full_body_a";
  }
  if (
    token.includes("full_body_b") ||
    (token.includes("hinge") && token.includes("overhead") && token.includes("unilateral"))
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

export const isDumbbellFullBodyDayTitle = (dayTitle: string) => {
  const identity = resolveDumbbellDayIdentity(dayTitle);
  return (
    identity === "full_body_a" ||
    identity === "full_body_b" ||
    identity === "full_body_c"
  );
};

export const isDumbbellProgramDayTitle = (dayTitle: string) =>
  resolveDumbbellDayIdentity(dayTitle) !== "unknown";

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

/** Experience caps from Phase 3 prompt §6 (Build/Reinforce excluding warmup/finish). */
const FULL_BODY_VOLUME: Record<DumbbellExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 5, accessoryCount: 2 },
};

const PRACTICE_VOLUME: Record<DumbbellExperienceLevel, VolumeContract> = {
  beginner: { mainCount: 2, accessoryCount: 1 },
  intermediate: { mainCount: 2, accessoryCount: 2 },
  advanced: { mainCount: 3, accessoryCount: 2 },
};

export const getDumbbellDayVolumeContract = (
  dayTitle: string,
  experience?: string
): VolumeContract | null => {
  const level = normalizeDumbbellExperienceLevel(experience);
  const identity = resolveDumbbellDayIdentity(dayTitle);
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
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
];

const FULL_BODY_A_INTERMEDIATE: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_A_BEGINNER,
  { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
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
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
];

const FULL_BODY_B_ADVANCED: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_B_INTERMEDIATE,
  {
    lane: "hinge",
    slotKind: "mainSecondaryLowerLoaded",
    family: "posterior_chain_secondary",
  },
];

const FULL_BODY_C_BEGINNER: ThreeDayMainLanePlanEntry[] = [
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "push", slotKind: "mainPushSecondary", family: "press_variation" },
  { lane: "pull", slotKind: "mainPullSupport", family: "lat_biased_pull" },
];

const FULL_BODY_C_INTERMEDIATE: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_C_BEGINNER,
  { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
];

const FULL_BODY_C_ADVANCED: ThreeDayMainLanePlanEntry[] = [
  ...FULL_BODY_C_INTERMEDIATE,
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
];

const planForExperience = (
  beginner: ThreeDayMainLanePlanEntry[],
  intermediate: ThreeDayMainLanePlanEntry[],
  advanced: ThreeDayMainLanePlanEntry[],
  level: DumbbellExperienceLevel,
  mainCount: number
) => {
  const base =
    level === "advanced" ? advanced : level === "intermediate" ? intermediate : beginner;
  return base.slice(0, Math.max(1, Math.min(base.length, mainCount)));
};

export const getDumbbellMainLanePlan = (
  dayTitle: string,
  experience?: string
): ThreeDayMainLanePlanEntry[] | null => {
  const level = normalizeDumbbellExperienceLevel(experience);
  const volume = getDumbbellDayVolumeContract(dayTitle, experience);
  if (!volume) return null;
  const identity = resolveDumbbellDayIdentity(dayTitle);
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
      { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
      { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
    ];
    return plan.slice(0, volume.mainCount);
  }
  if (identity === "upper_pattern_practice") {
    const plan: ThreeDayMainLanePlanEntry[] = [
      { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
      { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
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
      {
        lane: "squat",
        slotKind: "mainUnilateralLowerLoaded",
        family: "unilateral_lower_loaded",
      },
    ];
    return plan.slice(0, volume.mainCount);
  }
  return null;
};

/**
 * Ranked candidate families for dumbbell roles. Prefer floor / no-bench options.
 * Not hardcoded persona workouts — selection still chooses among eligibles.
 */
export const DUMBBELL_ROLE_CANDIDATE_IDS: Record<string, string[]> = {
  squat_primary: ["goblet-squat", "heels-elevated-squat", "bodyweight-squat"],
  horizontal_press_compound: [
    "dumbbell-floor-press",
    "pushup",
    "dumbbell-bench-press",
  ],
  horizontal_pull: ["single-arm-dumbbell-row", "dumbbell-rows"],
  hinge_primary: ["db-rdl", "dumbbell-sumo-rdl", "single-leg-rdl"],
  unilateral_lower_loaded: [
    "dumbbell-reverse-lunge",
    "split-squat",
    "dumbbell-bulgarian-split-squat",
    "dumbbell-step-up-loaded",
  ],
  vertical_push: [
    "dumbbell-shoulder-press",
    "dumbbell-arnold-press",
    "pike-pushup",
  ],
  press_variation: [
    "pushup",
    "dumbbell-floor-press",
    "close-grip-pushup",
    "dumbbell-chest-fly",
  ],
  // Prefer true rows for lat intent; pullover is lat-biased but never a true vertical pull.
  lat_biased_pull: ["single-arm-dumbbell-row", "dumbbell-rows", "dumbbell-pullover"],
  posterior_chain_secondary: ["dumbbell-sumo-rdl", "db-rdl", "single-leg-rdl"],
  core: ["dead-bug", "hollow-body-hold", "plank", "side-plank"],
  anti_rotation: ["pallof-press", "dead-bug", "bird-dog"],
  calves: ["db-calf-raise"],
};

const withAccessorySection = <RequirementRule extends SplitTemplateRequirementRule>(
  rule: RequirementRule,
  min: number
): RequirementRule => ({ ...rule, min, section: "accessory" });

export const buildDumbbellSplitTemplateSpecs = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(
  daysPerWeek: 3 | 4 | 5,
  rules: SplitTemplateRuleSet<RequirementRule>
): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  const fullBodyA: SplitTemplateSpec<MainLane, RequirementRule> = {
    title: DUMBBELL_THREE_DAY_TITLES[0],
    focusTags: ["full-body", "squat", "push", "pull", "dumbbells"],
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
    title: DUMBBELL_THREE_DAY_TITLES[1],
    focusTags: ["full-body", "hinge", "vertical_push", "unilateral", "dumbbells"],
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
    title: DUMBBELL_THREE_DAY_TITLES[2],
    focusTags: ["full-body", "single-leg", "press", "lats", "dumbbells"],
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

  if (daysPerWeek === 3) {
    return [fullBodyA, fullBodyB, fullBodyC];
  }

  if (daysPerWeek === 4) {
    return [
      fullBodyA,
      fullBodyB,
      fullBodyC,
      {
        title: DUMBBELL_FOUR_DAY_TITLES[3],
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
      title: DUMBBELL_FIVE_DAY_TITLES[3],
      focusTags: ["upper", "practice", "push", "pull", "scapular"],
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
      title: DUMBBELL_FIVE_DAY_TITLES[4],
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

export type DumbbellMainAuthorItem = {
  exerciseId: string;
  slotKind: string;
  slotLane: ThreeDayMainLanePlanEntry["lane"];
  family: string;
};

/**
 * Template-driven main authorship for dumbbell days. Picks the first eligible
 * ranked candidate per role so Full Body A/B/C is not rewritten by gym repairs.
 */
export const authorDumbbellMainSelections = (params: {
  dayTitle: string;
  experienceLevel?: string;
  usedIds?: Iterable<string>;
  avoidVerticalPushLoad?: boolean;
  preferPainAwareHinge?: boolean;
  preferSoftHorizontalPress?: boolean;
  isEligible: (exerciseId: string, family: string) => boolean;
}): DumbbellMainAuthorItem[] => {
  const plan = getDumbbellMainLanePlan(params.dayTitle, params.experienceLevel) ?? [];
  const used = new Set(params.usedIds ?? []);
  const selections: DumbbellMainAuthorItem[] = [];

  plan.forEach((slot) => {
    let candidates = [...(DUMBBELL_ROLE_CANDIDATE_IDS[slot.family] ?? [])];
    if (slot.family === "hinge_primary" && params.preferPainAwareHinge) {
      candidates = [
        "single-leg-hip-thrust",
        "single-leg-glute-bridge-hold",
        ...candidates.filter((id) => id !== "db-rdl" && id !== "dumbbell-sumo-rdl"),
        "db-rdl",
      ];
    }
    if (slot.family === "vertical_push" && params.avoidVerticalPushLoad) {
      candidates = candidates.filter(
        (id) => id === "pike-pushup" || id.includes("landmine")
      );
      if (!candidates.length) candidates = ["pike-pushup"];
    }
    if (
      (slot.family === "horizontal_press_compound" || slot.family === "press_variation") &&
      (params.avoidVerticalPushLoad || params.preferSoftHorizontalPress)
    ) {
      candidates = [
        "incline-pushup",
        "pushup",
        "dumbbell-floor-press",
        ...candidates.filter(
          (id) =>
            id !== "incline-pushup" &&
            id !== "pushup" &&
            id !== "dumbbell-floor-press" &&
            id !== "dumbbell-bench-press"
        ),
      ];
    }
    // Prefer distinct unilateral choices across the week when possible.
    if (slot.family === "unilateral_lower_loaded") {
      candidates = candidates.filter((id) => !used.has(id)).concat(
        candidates.filter((id) => used.has(id))
      );
    }
    if (slot.family === "press_variation") {
      candidates = candidates.filter((id) => !used.has(id)).concat(
        candidates.filter((id) => used.has(id))
      );
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

export type DumbbellThreeDayBlueprint = {
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
    /** Honest: true vertical pull is not required for dumbbell-only weeks. */
    requireTrueVerticalPull: boolean;
  };
};

export const resolveDumbbellThreeDayBlueprint = (params: {
  dayTitle: string;
  experienceLevel?: string;
}): DumbbellThreeDayBlueprint | null => {
  const { dayTitle, experienceLevel } = params;
  const volume = getDumbbellDayVolumeContract(dayTitle, experienceLevel);
  const mainLanePlan = getDumbbellMainLanePlan(dayTitle, experienceLevel);
  if (!volume || !mainLanePlan) return null;
  const identity = resolveDumbbellDayIdentity(dayTitle);
  const requiredMainFamilies = mainLanePlan.map((entry) => entry.family);
  const accessoryRoles: DumbbellThreeDayBlueprint["accessoryRoles"] =
    identity === "full_body_c"
      ? volume.accessoryCount >= 2
        ? ["core", "calves"]
        : ["core"]
      : identity === "full_body_b"
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
      horizontal_pull: ["lat_biased_pull"],
      hinge_primary: ["posterior_chain_secondary"],
      unilateral_lower_loaded: ["squat_primary"],
      vertical_push: ["press_variation"],
      press_variation: ["horizontal_press_compound"],
      lat_biased_pull: ["horizontal_pull"],
      posterior_chain_secondary: ["hinge_primary"],
    },
    constraints: {
      pullMainsAtLeastPressMains: false,
      noVerticalPushMain: identity === "full_body_a",
      noLowerBodyLeakMain: false,
      maxCarryAccessories: 1,
      preventDuplicateCarries: true,
      carryCannotReplaceCore: true,
      requireTrueVerticalPull: false,
    },
  };
};
