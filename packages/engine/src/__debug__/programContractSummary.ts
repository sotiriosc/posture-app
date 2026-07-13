import { exerciseById, type Exercise } from "@/lib/exercises";
import type { Program, ProgramRoutineItem } from "@/lib/types";

export const CONTRACT_LANES = ["push", "verticalPush", "pull", "squat", "hinge"] as const;

export type ContractLane = (typeof CONTRACT_LANES)[number];

export type ContractFamilyBucket =
  | "horizontal_press"
  | "chest_fly"
  | "vertical_press"
  | "upright_row"
  | "horizontal_row"
  | "vertical_pull"
  | "rear_delt"
  | "lateral_delt"
  | "shoulder_support"
  | "scapular_pull"
  | "squat"
  | "single_leg_squat"
  | "hinge"
  | "other";

export type ProgramContractDaySummary = {
  dayIndex: number;
  title: string;
  mainCount: number;
  accessoryCount: number;
  lanes: Record<ContractLane, number>;
  mainFamilies: ContractFamilyBucket[];
  mainIds: string[];
  accessoryIds: string[];
};

export type ProgramContractSummary = {
  label?: string;
  daysPerWeek: 3 | 4 | 5;
  experience?: string;
  equipment?: string[];
  painAreas?: string[];
  days: ProgramContractDaySummary[];
};

type SummaryMetadata = Omit<ProgramContractSummary, "days">;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const textIncludes = (descriptor: string, values: string[]) =>
  values.some((value) => descriptor.includes(value));

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === normalizeToken(pattern));

const hasAnyPattern = (exercise: Exercise, patterns: string[]) =>
  patterns.some((pattern) => hasPattern(exercise, pattern));

const descriptorForExercise = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${exercise.variantKey ?? ""} ${(
    exercise.tags ?? []
  ).join(" ")}`.toLowerCase();

const normalizeDebugLane = (slotLane: string | undefined): ContractLane | null => {
  if (!slotLane) return null;
  const token = normalizeToken(slotLane);
  if (token === "verticalpush") return "verticalPush";
  if (token === "push" || token === "pull" || token === "squat" || token === "hinge") {
    return token;
  }
  return null;
};

export const inferContractLane = (
  item: ProgramRoutineItem,
  exercise: Exercise | undefined
): ContractLane | null => {
  const debugLane = normalizeDebugLane(item.selectionDebug?.slotLane);
  if (debugLane) return debugLane;
  if (!exercise) return null;

  if (hasPattern(exercise, "verticalpush")) return "verticalPush";
  if (hasPattern(exercise, "push")) return "push";
  if (hasAnyPattern(exercise, ["pull", "horizontalpull", "verticalpull"])) return "pull";
  if (hasPattern(exercise, "squat")) return "squat";
  if (hasPattern(exercise, "hinge")) return "hinge";
  return null;
};

export const bucketExerciseFamily = (exercise: Exercise | undefined): ContractFamilyBucket => {
  if (!exercise) return "other";

  const descriptor = descriptorForExercise(exercise);
  const family = normalizeToken(exercise.familyKey ?? "");
  const hasRearDelt =
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reardelt") ||
    family.includes("reardelt");
  const hasLateral =
    descriptor.includes("lateral raise") ||
    descriptor.includes("lateral-raise") ||
    descriptor.includes("prone t") ||
    descriptor.includes("prone-t") ||
    family.includes("lateralraise") ||
    hasPattern(exercise, "lateralraise");
  const hasShoulderSupport =
    textIncludes(descriptor, [
      "y raise",
      "y-raise",
      "swimmer",
      "snow angel",
      "snow-angel",
      "scaption",
      "shoulder plane",
    ]) || family.includes("scapsupport");

  if (hasRearDelt) return "rear_delt";
  if (hasLateral) return "lateral_delt";
  if (hasShoulderSupport) return "shoulder_support";

  if (
    hasPattern(exercise, "verticalpush") ||
    textIncludes(descriptor, ["shoulder press", "overhead press", "arnold press", "pike-pushup", "pike push-up", "landmine press"])
  ) {
    return "vertical_press";
  }

  if (
    hasAnyPattern(exercise, ["verticalpull"]) ||
    textIncludes(descriptor, ["pulldown", "pull-down", "pullup", "pull-up", "chinup", "chin-up"])
  ) {
    return "vertical_pull";
  }

  if (
    textIncludes(descriptor, ["upright row", "upright-row"])
  ) {
    return "upright_row";
  }

  if (
    hasAnyPattern(exercise, ["horizontalpull"]) ||
    textIncludes(descriptor, ["row", "seal row"])
  ) {
    return "horizontal_row";
  }

  if (hasPattern(exercise, "pull") || hasPattern(exercise, "scapular")) {
    return "scapular_pull";
  }

  if (textIncludes(descriptor, ["fly", "pec deck", "pec-deck"]) && hasPattern(exercise, "push")) {
    return "chest_fly";
  }

  if (hasPattern(exercise, "push")) return "horizontal_press";

  if (
    hasPattern(exercise, "squat") &&
    textIncludes(descriptor, [
      "split squat",
      "split-squat",
      "step-up",
      "step up",
      "lunge",
      "single-leg",
      "cossack",
    ])
  ) {
    return "single_leg_squat";
  }

  if (hasPattern(exercise, "squat")) return "squat";
  if (hasPattern(exercise, "hinge")) return "hinge";
  return "other";
};

const emptyLaneCounts = (): Record<ContractLane, number> => ({
  push: 0,
  verticalPush: 0,
  pull: 0,
  squat: 0,
  hinge: 0,
});

export const buildProgramContractSummary = (
  program: Program,
  metadata: SummaryMetadata = { daysPerWeek: program.daysPerWeek }
): ProgramContractSummary => ({
  ...metadata,
  daysPerWeek: metadata.daysPerWeek ?? program.daysPerWeek,
  days: program.week.map((day) => {
    const mainItems = day.routine.filter((item) => item.section === "main");
    const accessoryItems = day.routine.filter((item) => item.section === "accessory");
    const lanes = emptyLaneCounts();

    mainItems.forEach((item) => {
      const lane = inferContractLane(item, exerciseById(item.exerciseId));
      if (lane) lanes[lane] += 1;
    });

    return {
      dayIndex: day.dayIndex,
      title: day.title,
      mainCount: mainItems.length,
      accessoryCount: accessoryItems.length,
      lanes,
      mainFamilies: mainItems.map((item) => bucketExerciseFamily(exerciseById(item.exerciseId))),
      mainIds: mainItems.map((item) => item.exerciseId),
      accessoryIds: accessoryItems.map((item) => item.exerciseId),
    };
  }),
});

const formatLaneCounts = (lanes: Record<ContractLane, number>) =>
  CONTRACT_LANES.filter((lane) => lanes[lane] > 0)
    .map((lane) => `${lane}:${lanes[lane]}`)
    .join(" ");

export const formatProgramContractSummary = (summary: ProgramContractSummary) => {
  const headerParts = [
    summary.label,
    `${summary.daysPerWeek}d`,
    summary.experience,
    summary.equipment?.length ? `equipment=${summary.equipment.join("+")}` : null,
    summary.painAreas?.length ? `pain=${summary.painAreas.join("+")}` : "pain=none",
  ].filter(Boolean);

  const body = summary.days
    .map(
      (day) =>
        `${day.dayIndex + 1}. ${day.title} | main=${day.mainCount} accessory=${
          day.accessoryCount
        } | lanes=${formatLaneCounts(day.lanes)} | families=${day.mainFamilies.join(",")} | ids=${day.mainIds.join(",")}`
    )
    .join("\n");

  return `${headerParts.join(" | ")}\n${body}`;
};
