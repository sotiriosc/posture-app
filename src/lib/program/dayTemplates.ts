type ThreeDayExperienceLevel = "beginner" | "intermediate" | "advanced";

type ThreeDayTemplateCounts = {
  mainCount: number;
  accessoryCount: number;
};

type DayTemplateMainLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";

export type ThreeDayMainLanePlanEntry = {
  lane: DayTemplateMainLane;
  slotKind: string;
  family:
    | "chest_fly"
    | "extra_back_loaded"
    | "horizontal_pull"
    | "vertical_pull"
    | "horizontal_press_compound"
    | "pull_secondary"
    | "vertical_push"
    | "lateral_delt_loaded"
    | "rear_delt_loaded"
    | "secondary_loaded_shoulder"
    | "lateral_delt"
    | "shoulder_pull"
    | "shoulder_structural_secondary"
    | "shoulder_structural_alternate"
    | "squat_primary"
    | "hinge_primary"
    | "unilateral_lower_loaded"
    | "secondary_lower_loaded"
    | "single_leg_or_secondary_squat"
    | "lower_secondary";
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const normalizeExperienceLevel = (value?: string): ThreeDayExperienceLevel => {
  const normalized = normalizeToken(value ?? "beginner");
  if (normalized === "advanced") return "advanced";
  if (normalized === "intermediate") return "intermediate";
  return "beginner";
};

const isBackChest3DayTitle = (dayTitle: string) =>
  normalizeToken(dayTitle) === "back_+_chest" ||
  normalizeToken(dayTitle) === "back_chest";

const isShouldersArms3DayTitle = (dayTitle: string) =>
  normalizeToken(dayTitle) === "shoulders_+_arms" ||
  normalizeToken(dayTitle) === "shoulders_arms";

const isLegsAbs3DayTitle = (dayTitle: string) =>
  normalizeToken(dayTitle) === "legs_+_abs" ||
  normalizeToken(dayTitle) === "legs_abs";

const BACK_CHEST_3_DAY_COUNTS: Record<ThreeDayExperienceLevel, ThreeDayTemplateCounts> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 5, accessoryCount: 2 },
};

const SHOULDERS_ARMS_3_DAY_COUNTS: Record<
  ThreeDayExperienceLevel,
  ThreeDayTemplateCounts
> = {
  beginner: { mainCount: 3, accessoryCount: 3 },
  intermediate: { mainCount: 4, accessoryCount: 3 },
  advanced: { mainCount: 4, accessoryCount: 4 },
};

const LEGS_ABS_3_DAY_COUNTS: Record<ThreeDayExperienceLevel, ThreeDayTemplateCounts> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 4, accessoryCount: 3 },
};

const BACK_CHEST_3_DAY_BEGINNER_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
  { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
];

const BACK_CHEST_3_DAY_INTERMEDIATE_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
  { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
  { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
];

const BACK_CHEST_3_DAY_ADVANCED_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  ...BACK_CHEST_3_DAY_INTERMEDIATE_MAIN_PLAN,
  { lane: "pull", slotKind: "mainExtraBackLoaded", family: "extra_back_loaded" },
];

// Three-day gym MAIN slots are role-locked. The broad lane still tells older
// scoring how to group a slot, but slotKind/family is the contract repair must preserve.
const SHOULDERS_ARMS_3_DAY_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
  { lane: "push", slotKind: "mainLateralDeltPrimary", family: "lateral_delt_loaded" },
  { lane: "pull", slotKind: "mainShoulderPullPrimary", family: "rear_delt_loaded" },
  {
    lane: "pull",
    slotKind: "mainSecondaryLoadedShoulder",
    family: "secondary_loaded_shoulder",
  },
];

const LEGS_ABS_3_DAY_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "squat", slotKind: "mainSquatPrimary", family: "squat_primary" },
  { lane: "hinge", slotKind: "mainHingePrimary", family: "hinge_primary" },
  {
    lane: "squat",
    slotKind: "mainUnilateralLowerLoaded",
    family: "unilateral_lower_loaded",
  },
  { lane: "hinge", slotKind: "mainSecondaryLowerLoaded", family: "secondary_lower_loaded" },
];

export const get3DayTemplateCounts = (
  dayTitle: string,
  experienceLevel?: string
): ThreeDayTemplateCounts | null => {
  const normalizedExperience = normalizeExperienceLevel(experienceLevel);
  if (isBackChest3DayTitle(dayTitle)) {
    return BACK_CHEST_3_DAY_COUNTS[normalizedExperience];
  }
  if (isShouldersArms3DayTitle(dayTitle)) {
    return SHOULDERS_ARMS_3_DAY_COUNTS[normalizedExperience];
  }
  if (isLegsAbs3DayTitle(dayTitle)) {
    return LEGS_ABS_3_DAY_COUNTS[normalizedExperience];
  }
  return null;
};

export const get3DayMainLanePlan = (
  dayTitle: string,
  mainCount: number
): ThreeDayMainLanePlanEntry[] | null => {
  if (isBackChest3DayTitle(dayTitle)) {
    const normalizedCount = Math.max(1, mainCount);
    if (normalizedCount >= 5) return BACK_CHEST_3_DAY_ADVANCED_MAIN_PLAN;
    if (normalizedCount >= 4) return BACK_CHEST_3_DAY_INTERMEDIATE_MAIN_PLAN;
    const clampedCount = Math.max(
      1,
      Math.min(BACK_CHEST_3_DAY_BEGINNER_MAIN_PLAN.length, normalizedCount)
    );
    return BACK_CHEST_3_DAY_BEGINNER_MAIN_PLAN.slice(0, clampedCount);
  }
  if (isShouldersArms3DayTitle(dayTitle)) {
    const clampedCount = Math.max(
      1,
      Math.min(SHOULDERS_ARMS_3_DAY_MAIN_PLAN.length, mainCount)
    );
    return SHOULDERS_ARMS_3_DAY_MAIN_PLAN.slice(0, clampedCount);
  }
  if (isLegsAbs3DayTitle(dayTitle)) {
    const clampedCount = Math.max(1, Math.min(LEGS_ABS_3_DAY_MAIN_PLAN.length, mainCount));
    return LEGS_ABS_3_DAY_MAIN_PLAN.slice(0, clampedCount);
  }
  return null;
};

export const get3DayBackChestVerticalFallbackIds = () => [
  // Bands-first vertical fallback family when available.
  "band-lat-pulldown",
  "band-lat-pulldown-kneeling",
  "tall-kneeling-band-lat-pulldown",
  "standing-band-lat-pulldown",
  "band-lat-pulldown-neutral-grip",
  "band-lat-pulldown-wide-grip",
  "band-lat-pulldown-iso-hold",
  // Dumbbell vertical fallback.
  "dumbbell-pullover",
  // Bodyweight lat-intent fallback chain.
  "supine-lat-pulldown-isometric",
  "prone-lat-sweep",
  "seated-lat-sweep-pulse",
  // Last-resort bodyweight row-intent fallback.
  "supine-elbow-drive-row",
  "prone-elbow-row",
];
