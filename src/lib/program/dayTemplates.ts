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
    | "horizontal_pull"
    | "vertical_pull"
    | "horizontal_press_compound"
    | "pull_secondary"
    | "vertical_push"
    | "shoulder_pull"
    | "arm_primary"
    | "arm_secondary";
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

const BACK_CHEST_3_DAY_COUNTS: Record<ThreeDayExperienceLevel, ThreeDayTemplateCounts> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 5, accessoryCount: 2 },
};

const SHOULDERS_ARMS_3_DAY_COUNTS: Record<
  ThreeDayExperienceLevel,
  ThreeDayTemplateCounts
> = {
  beginner: { mainCount: 3, accessoryCount: 2 },
  intermediate: { mainCount: 4, accessoryCount: 2 },
  advanced: { mainCount: 4, accessoryCount: 4 },
};

const BACK_CHEST_3_DAY_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "push", slotKind: "mainPushFly", family: "chest_fly" },
  { lane: "pull", slotKind: "mainPullHorizontal", family: "horizontal_pull" },
  { lane: "pull", slotKind: "mainPullVertical", family: "vertical_pull" },
  { lane: "push", slotKind: "mainPushCompound", family: "horizontal_press_compound" },
  { lane: "pull", slotKind: "mainPullSupport", family: "pull_secondary" },
];

const SHOULDERS_ARMS_3_DAY_MAIN_PLAN: ThreeDayMainLanePlanEntry[] = [
  { lane: "verticalPush", slotKind: "mainVerticalPushPrimary", family: "vertical_push" },
  { lane: "pull", slotKind: "mainPullPrimary", family: "shoulder_pull" },
  { lane: "push", slotKind: "mainArmPrimary", family: "arm_primary" },
  { lane: "push", slotKind: "mainArmSecondary", family: "arm_secondary" },
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
  return null;
};

export const get3DayMainLanePlan = (
  dayTitle: string,
  mainCount: number
): ThreeDayMainLanePlanEntry[] | null => {
  if (isBackChest3DayTitle(dayTitle)) {
    const clampedCount = Math.max(1, Math.min(BACK_CHEST_3_DAY_MAIN_PLAN.length, mainCount));
    return BACK_CHEST_3_DAY_MAIN_PLAN.slice(0, clampedCount);
  }
  if (isShouldersArms3DayTitle(dayTitle)) {
    const clampedCount = Math.max(
      1,
      Math.min(SHOULDERS_ARMS_3_DAY_MAIN_PLAN.length, mainCount)
    );
    return SHOULDERS_ARMS_3_DAY_MAIN_PLAN.slice(0, clampedCount);
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
