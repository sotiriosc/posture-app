/**
 * Canonical fuzz case generators shared with the five mode audits.
 * Mirrors gym/dumbbell/band/bodyweight/mixed-home hashSeed + dimension cycling.
 * Do not invent a simplified second fuzz generator.
 */

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { BandSetupOption } from "@/lib/program/bandSetup";
import type { PrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { LogPrefs } from "@/lib/types";

export type FuzzMode = PrimaryProgramEquipmentMode;

export type CanonicalFuzzCase = {
  mode: FuzzMode;
  index: number;
  seed: string;
  phaseIndex: 1 | 2 | 3;
  questionnaire: QuestionnaireData;
  blockedExerciseIds?: LogPrefs["blockedExerciseIds"];
  /** Structural persona key — excludes variation seed. */
  structuralKey: string;
  /** Complete input key — includes seed. */
  completeKey: string;
  capabilityLane: string;
  painKey: string;
  blockedKey: string;
};

const EXPERIENCES = ["Beginner", "Intermediate", "Advanced"] as const;
const PHASES = [1, 2, 3] as const;
const DAYS = [3, 4, 5] as const;
const GOALS = [
  "General fitness",
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
] as const;

const GYM_PAIN: string[][] = [
  [],
  ["Shoulders"],
  ["Upper back"],
  ["Lower back"],
  ["Hips"],
  ["Knees"],
  ["Shoulders", "Upper back"],
  ["Lower back", "Hips"],
  ["Lower back", "Neck"],
  ["Neck"],
];
const GYM_EQUIPMENT = [["gym"], ["gym", "dumbbells"], ["gym", "bands"]];

const DB_PAIN: string[][] = [
  [],
  ["Shoulders"],
  ["Upper back"],
  ["Lower back"],
  ["Hips"],
  ["Knees"],
  ["Shoulders", "Upper back"],
  ["Lower back", "Hips"],
  ["Neck"],
];
const DB_EQUIPMENT = [
  ["dumbbells"],
  ["dumbbells", "bench"],
  ["dumbbells", "pullup_bar"],
  ["dumbbells", "bench", "pullup_bar"],
];

const BAND_PAIN = DB_PAIN;
const BAND_SETUPS: Array<BandSetupOption | undefined> = [
  undefined,
  "loop_only",
  "long_no_anchor",
  "long_with_anchor",
  "both_no_anchor",
  "both_with_anchor",
];

const BW_PAIN = DB_PAIN;
const BW_EQUIPMENT = [
  ["none"],
  [],
  ["none", "pullup_bar"],
  ["pullup_bar"],
  ["none", "bench"],
  ["foam_roller"],
];

const MH_PAIN: string[][] = [
  [],
  ["Shoulders"],
  ["Upper back"],
  ["Lower back"],
  ["Hips"],
  ["Knees"],
  ["Shoulders", "Upper back"],
  ["Lower back", "Hips"],
];
const MH_EQUIPMENT: string[][] = [
  ["dumbbells", "bands"],
  ["bands", "dumbbells"],
  ["dumbbells", "bands", "pullup_bar"],
  ["dumbbells", "bands", "bench"],
  ["pullup_bar", "bands", "dumbbells"],
];
const MH_BAND_SETUPS = [
  "long_with_anchor",
  "long_no_anchor",
  "loop_only",
  "both_with_anchor",
  "both_no_anchor",
  undefined,
] as const;

/** Same hash mixing as mode audits; prefix differs per mode. */
export const hashSeedForMode = (mode: FuzzMode, index: number): string => {
  let x = (index + 1) * 2654435761;
  x ^= x >>> 16;
  const hex = (x >>> 0).toString(16);
  switch (mode) {
    case "gym":
      return `gym-fuzz-${hex}`;
    case "dumbbells":
      return `db-fuzz-${hex}`;
    case "bands":
      return `band-fuzz-${hex}`;
    case "bodyweight":
      return `bw-fuzz-${hex}`;
    case "mixedHome":
      return `mh-fuzz-${hex}`;
  }
};

const BLOCK_POOL = ["db-rdl", "goblet-squat", "bodyweight-squat", "band-rdl"] as const;

const sortedJoin = (values: string[]) => [...values].map((v) => v.toLowerCase()).sort().join(",");

export const buildCanonicalFuzzCase = (
  mode: FuzzMode,
  index: number,
  options?: { seedOverride?: string; includeBlocks?: boolean }
): CanonicalFuzzCase => {
  const experience = EXPERIENCES[index % EXPERIENCES.length];
  const phaseIndex = PHASES[Math.floor(index / 3) % PHASES.length];
  const daysPerWeek = DAYS[Math.floor(index / 9) % DAYS.length];
  const goalsValue = GOALS[Math.floor(index / 27) % GOALS.length];
  const seed = options?.seedOverride ?? hashSeedForMode(mode, index);

  let painAreas: string[] = [];
  let equipment: string[] = [];
  let bandSetup: BandSetupOption | undefined;

  if (mode === "gym") {
    painAreas = GYM_PAIN[Math.floor(index / 81) % GYM_PAIN.length];
    equipment = GYM_EQUIPMENT[Math.floor(index / 243) % GYM_EQUIPMENT.length];
  } else if (mode === "dumbbells") {
    painAreas = DB_PAIN[Math.floor(index / 81) % DB_PAIN.length];
    equipment = DB_EQUIPMENT[Math.floor(index / 243) % DB_EQUIPMENT.length];
  } else if (mode === "bands") {
    painAreas = BAND_PAIN[Math.floor(index / 81) % BAND_PAIN.length];
    equipment = ["bands"];
    bandSetup = BAND_SETUPS[Math.floor(index / 243) % BAND_SETUPS.length];
  } else if (mode === "bodyweight") {
    painAreas = BW_PAIN[Math.floor(index / 81) % BW_PAIN.length];
    equipment = BW_EQUIPMENT[Math.floor(index / 243) % BW_EQUIPMENT.length];
  } else {
    painAreas = MH_PAIN[Math.floor(index / 81) % MH_PAIN.length];
    equipment = MH_EQUIPMENT[Math.floor(index / 243) % MH_EQUIPMENT.length];
    bandSetup = MH_BAND_SETUPS[Math.floor(index / 729) % MH_BAND_SETUPS.length];
  }

  let blockedExerciseIds: LogPrefs["blockedExerciseIds"] | undefined;
  let blockedKey = "";
  if (options?.includeBlocks && index % 17 === 0) {
    const id = BLOCK_POOL[Math.floor(index / 17) % BLOCK_POOL.length];
    blockedExerciseIds = {
      [id]: {
        reason: "personal_preference",
        blockedAt: { phase: "skill", sessionCount: 3 },
      },
    };
    blockedKey = id;
  }

  const questionnaire: QuestionnaireData = {
    goals: goalsValue,
    painAreas: [...painAreas],
    experience,
    equipment: [...equipment] as QuestionnaireData["equipment"],
    daysPerWeek,
    ...(bandSetup ? { bandSetup } : {}),
  };

  const painKey = sortedJoin(painAreas);
  const equipmentKey = sortedJoin(equipment);
  const capabilityLane = [equipmentKey, bandSetup ?? "bandSetup:none"].join("|");
  const structuralKey = [
    mode,
    experience,
    String(phaseIndex),
    String(daysPerWeek),
    goalsValue,
    painKey,
    capabilityLane,
    blockedKey || "blocks:none",
  ].join("||");
  const completeKey = `${structuralKey}||seed:${seed}`;

  return {
    mode,
    index,
    seed,
    phaseIndex,
    questionnaire,
    blockedExerciseIds,
    structuralKey,
    completeKey,
    capabilityLane,
    painKey,
    blockedKey,
  };
};

export const FUZZ_MODES: FuzzMode[] = [
  "gym",
  "dumbbells",
  "bands",
  "bodyweight",
  "mixedHome",
];

export const HOLDOUT_NAMESPACE = "fuzz-integrity-holdout-v1";

export const holdoutSeed = (mode: FuzzMode, index: number) =>
  `${HOLDOUT_NAMESPACE}:${mode}:${index}`;
