/**
 * Phase 6f, Commit 9 — public `/tools/macro-calculator` marketing page.
 *
 * Pure calculation logic, deliberately isolated from the page/UI so it can
 * be unit tested without a browser and so the page itself stays "client-side
 * math, no API calls" (SEO essentials in bloom-plan Phase 6f Commit 9).
 *
 * Formula choices (ratified macro ratio: moderate fat / high carb / high
 * protein):
 *  - BMR via Mifflin-St Jeor (the standard, more accurate than Harris-
 *    Benedict for a general lifting population).
 *  - TDEE = BMR × activity multiplier, then a flat calorie adjustment for
 *    the stated goal (lose / maintain / build).
 *  - Protein is set directly from bodyweight (1.8 g/kg — solidly inside the
 *    1.6–2.2 g/kg range supported for resistance-trained lifters), not as a
 *    percentage of calories, because a %-of-calories protein target quietly
 *    under-feeds protein for anyone eating in a large deficit. Fat is set as
 *    a flat 25% of total calories ("moderate"). Carbs get the remainder —
 *    which, for a resistance-training population at these calorie levels,
 *    reliably comes out as the single largest macro by both grams and
 *    percentage ("high carb").
 *  - Calorie floor of 1200 protects against a nonsensical output for very
 *    low bodyweight + "lose" combinations; this is a marketing calculator,
 *    not a clinical tool, and should never recommend an unsafe number.
 */

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type Goal = "lose" | "maintain" | "build";

export type MacroCalculatorInput = {
  /** Bodyweight in pounds. */
  weightLb: number;
  /** Height in inches. */
  heightIn: number;
  /** Age in years. */
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type MacroCalculatorResult = {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

const CALORIES_PER_G_PROTEIN = 4;
const CALORIES_PER_G_CARB = 4;
const CALORIES_PER_G_FAT = 9;

const PROTEIN_G_PER_KG_BODYWEIGHT = 1.8;
const FAT_SHARE_OF_CALORIES = 0.25;
const MINIMUM_CALORIES = 1200;

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const ACTIVITY_LEVEL_OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: "sedentary", label: "Sedentary — little to no exercise" },
  { value: "light", label: "Light — training 1–3 days/week" },
  { value: "moderate", label: "Moderate — training 3–5 days/week" },
  { value: "active", label: "Active — training 6–7 days/week" },
  { value: "veryActive", label: "Very active — physical job plus training" },
];

export const GOAL_OPTIONS: Array<{ value: Goal; label: string }> = [
  { value: "lose", label: "Lose fat" },
  { value: "maintain", label: "Maintain" },
  { value: "build", label: "Build muscle" },
];

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  build: 300,
};

export const MACRO_INPUT_BOUNDS = {
  weightLb: { min: 60, max: 600 },
  heightIn: { min: 40, max: 96 },
  age: { min: 13, max: 100 },
} as const;

export const isValidMacroCalculatorInput = (
  input: Partial<Record<keyof MacroCalculatorInput, unknown>>
): input is MacroCalculatorInput => {
  const weightLb = input.weightLb;
  const heightIn = input.heightIn;
  const age = input.age;
  return (
    typeof weightLb === "number" &&
    Number.isFinite(weightLb) &&
    weightLb >= MACRO_INPUT_BOUNDS.weightLb.min &&
    weightLb <= MACRO_INPUT_BOUNDS.weightLb.max &&
    typeof heightIn === "number" &&
    Number.isFinite(heightIn) &&
    heightIn >= MACRO_INPUT_BOUNDS.heightIn.min &&
    heightIn <= MACRO_INPUT_BOUNDS.heightIn.max &&
    typeof age === "number" &&
    Number.isFinite(age) &&
    age >= MACRO_INPUT_BOUNDS.age.min &&
    age <= MACRO_INPUT_BOUNDS.age.max &&
    (input.sex === "male" || input.sex === "female") &&
    typeof input.activityLevel === "string" &&
    input.activityLevel in ACTIVITY_MULTIPLIERS &&
    typeof input.goal === "string" &&
    input.goal in GOAL_CALORIE_ADJUSTMENT
  );
};

export const calculateMacros = (input: MacroCalculatorInput): MacroCalculatorResult => {
  const weightKg = input.weightLb * LB_TO_KG;
  const heightCm = input.heightIn * IN_TO_CM;

  const sexOffset = input.sex === "male" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * input.age + sexOffset;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const calories = Math.max(
    MINIMUM_CALORIES,
    Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[input.goal])
  );

  const proteinG = Math.round(weightKg * PROTEIN_G_PER_KG_BODYWEIGHT);
  const proteinCalories = proteinG * CALORIES_PER_G_PROTEIN;

  const fatCalories = calories * FAT_SHARE_OF_CALORIES;
  const fatG = Math.round(fatCalories / CALORIES_PER_G_FAT);

  const remainingCalories = Math.max(0, calories - proteinCalories - fatG * CALORIES_PER_G_FAT);
  const carbsG = Math.round(remainingCalories / CALORIES_PER_G_CARB);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    proteinG,
    carbsG,
    fatG,
  };
};
