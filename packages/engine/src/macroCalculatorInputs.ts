/**
 * Account-scoped macro calculator inputs persisted on the user record.
 * Anonymous visitors never write this — see /tools/macro-calculator Option C.
 */

export type MacroCalculatorSex = "male" | "female";
export type MacroCalculatorActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";
export type MacroCalculatorGoal = "lose" | "maintain" | "build";

export type MacroCalculatorSavedInputs = {
  weightLb: number;
  heightIn: number;
  age: number;
  sex: MacroCalculatorSex;
  activityLevel: MacroCalculatorActivityLevel;
  goal: MacroCalculatorGoal;
  /** ISO timestamp of last account-side save. */
  updatedAt: string;
};

const SEX = new Set<MacroCalculatorSex>(["male", "female"]);
const ACTIVITY = new Set<MacroCalculatorActivityLevel>([
  "sedentary",
  "light",
  "moderate",
  "active",
  "veryActive",
]);
const GOAL = new Set<MacroCalculatorGoal>(["lose", "maintain", "build"]);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Parse unknown JSON into saved inputs, or null when invalid/absent.
 * Does not enforce calculator range bounds — the UI calculator does that.
 */
export const parseMacroCalculatorSavedInputs = (
  raw: unknown
): MacroCalculatorSavedInputs | null => {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (
    !isFiniteNumber(obj.weightLb) ||
    !isFiniteNumber(obj.heightIn) ||
    !isFiniteNumber(obj.age)
  ) {
    return null;
  }
  if (typeof obj.sex !== "string" || !SEX.has(obj.sex as MacroCalculatorSex)) {
    return null;
  }
  if (
    typeof obj.activityLevel !== "string" ||
    !ACTIVITY.has(obj.activityLevel as MacroCalculatorActivityLevel)
  ) {
    return null;
  }
  if (typeof obj.goal !== "string" || !GOAL.has(obj.goal as MacroCalculatorGoal)) {
    return null;
  }
  const updatedAt =
    typeof obj.updatedAt === "string" && obj.updatedAt.trim()
      ? obj.updatedAt
      : new Date().toISOString();
  return {
    weightLb: obj.weightLb,
    heightIn: obj.heightIn,
    age: obj.age,
    sex: obj.sex as MacroCalculatorSex,
    activityLevel: obj.activityLevel as MacroCalculatorActivityLevel,
    goal: obj.goal as MacroCalculatorGoal,
    updatedAt,
  };
};
