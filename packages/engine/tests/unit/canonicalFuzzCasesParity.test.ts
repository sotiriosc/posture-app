/**
 * Generator parity (§9 option 2): prove canonicalFuzzCases matches mode-audit
 * construction for representative + boundary indexes.
 */
import { describe, expect, test } from "vitest";
import type { BandSetupOption } from "@/lib/program/bandSetup";
import {
  buildCanonicalFuzzCase,
  hashSeedForMode,
  type FuzzMode,
} from "@/lib/__debug__/lib/canonicalFuzzCases";

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

/** Mirror of mode-audit case construction (gym/db/band/bw/mh audits). */
const buildModeAuditCase = (mode: FuzzMode, index: number) => {
  const experience = EXPERIENCES[index % EXPERIENCES.length];
  const phaseIndex = PHASES[Math.floor(index / 3) % PHASES.length];
  const daysPerWeek = DAYS[Math.floor(index / 9) % DAYS.length];
  const goalsValue = GOALS[Math.floor(index / 27) % GOALS.length];

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

  let x = (index + 1) * 2654435761;
  x ^= x >>> 16;
  const hex = (x >>> 0).toString(16);
  const seedPrefix: Record<FuzzMode, string> = {
    gym: "gym-fuzz-",
    dumbbells: "db-fuzz-",
    bands: "band-fuzz-",
    bodyweight: "bw-fuzz-",
    mixedHome: "mh-fuzz-",
  };
  const seed = `${seedPrefix[mode]}${hex}`;
  const equipmentKey = [...equipment].map((v) => v.toLowerCase()).sort().join(",");
  const capabilityLane = [equipmentKey, bandSetup ?? "bandSetup:none"].join("|");

  return {
    seed,
    experience,
    phaseIndex,
    daysPerWeek,
    goalsValue,
    painAreas: [...painAreas],
    equipment: [...equipment],
    bandSetup,
    capabilityLane,
  };
};

const MODES: FuzzMode[] = ["gym", "dumbbells", "bands", "bodyweight", "mixedHome"];
const INDEXES = [0, 1, 2, 16, 17, 26, 80, 81, 242, 243, 728, 729, 999, 9999];

describe("canonicalFuzzCases parity with mode-audit construction", () => {
  test.each(MODES)("%s matches mode-audit dimensions at representative indexes", (mode) => {
    for (const index of INDEXES) {
      const expected = buildModeAuditCase(mode, index);
      const actual = buildCanonicalFuzzCase(mode, index);
      expect(hashSeedForMode(mode, index)).toBe(expected.seed);
      expect(actual.seed).toBe(expected.seed);
      expect(actual.questionnaire.experience).toBe(expected.experience);
      expect(actual.phaseIndex).toBe(expected.phaseIndex);
      expect(actual.questionnaire.daysPerWeek).toBe(expected.daysPerWeek);
      expect(actual.questionnaire.goals).toBe(expected.goalsValue);
      expect(actual.questionnaire.painAreas).toEqual(expected.painAreas);
      expect(actual.questionnaire.equipment).toEqual(expected.equipment);
      expect(actual.questionnaire.bandSetup).toBe(expected.bandSetup);
      expect(actual.capabilityLane).toBe(expected.capabilityLane);
    }
  });
});
