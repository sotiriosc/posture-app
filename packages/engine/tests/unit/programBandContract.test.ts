import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  BAND_THREE_DAY_TITLES,
  looksLikeGymShapedDayTitle,
  validateBandProgramContract,
} from "@/lib/program/bandProgramContract";
import { deriveProgramCapabilities } from "@/lib/program/equipmentCapabilities";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { validateDumbbellProgramContract } from "@/lib/program/dumbbellProgramContract";
import { validateGymProgramContract } from "@/lib/program/gymProgramContract";

const generateBand = (
  overrides: Partial<QuestionnaireData>,
  id: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      ...overrides,
    },
    id,
    { phaseIndex, seed: `${id}-seed` }
  );
};

describe("band program contract", () => {
  test("legacy bands never imply type or anchor", () => {
    const capabilities = deriveProgramCapabilities(["bands"]);
    expect(capabilities.hasBands).toBe(true);
    expect(capabilities.bandSetupConfirmed).toBe(false);
    expect(capabilities.hasLongBand).toBe(false);
    expect(capabilities.hasLoopBand).toBe(false);
    expect(capabilities.hasHighAnchor).toBe(false);
  });

  test("all band setup options produce Full Body A/B/C without gym titles", () => {
    const setups = [
      "loop_only",
      "long_no_anchor",
      "long_with_anchor",
      "both_no_anchor",
      "both_with_anchor",
    ] as const;
    for (const bandSetup of setups) {
      const program = generateBand({ bandSetup }, `band-${bandSetup}`);
      expect(program.week.map((day) => day.title)).toEqual([...BAND_THREE_DAY_TITLES]);
      program.week.forEach((day) => {
        expect(looksLikeGymShapedDayTitle(day.title)).toBe(false);
      });
      expect(
        validateBandProgramContract({
          program,
          persona: `band-${bandSetup}`,
          equipment: ["bands"],
          bandSetup,
          experience: "Beginner",
        })
      ).toEqual([]);
    }
  });

  test("legacy unknown band week stays legal without anchored pulldowns", () => {
    const program = generateBand({}, "band-legacy");
    const ids = program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(ids.some((id) => id.includes("pulldown") || id.includes("pallof"))).toBe(
      false
    );
    expect(
      validateBandProgramContract({
        program,
        persona: "band-legacy",
        equipment: ["bands"],
        experience: "Beginner",
      })
    ).toEqual([]);
  });

  test("high-anchor vertical pull appears only with confirmed anchor", () => {
    const anchored = generateBand({ bandSetup: "long_with_anchor" }, "band-hi");
    const noAnchor = generateBand({ bandSetup: "long_no_anchor" }, "band-no");
    const anchoredIds = anchored.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    const noAnchorIds = noAnchor.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(anchoredIds.some((id) => id.includes("pulldown"))).toBe(true);
    expect(noAnchorIds.some((id) => id.includes("pulldown"))).toBe(false);
  });

  test("loop-only does not schedule long-band rows or pulldowns", () => {
    const program = generateBand({ bandSetup: "loop_only" }, "band-loop");
    const ids = program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(ids.some((id) => id.includes("pulldown"))).toBe(false);
    expect(ids.some((id) => id === "band-rdl" || id === "split-stance-row")).toBe(
      false
    );
  });

  test("deterministic repeat for anchored beginner week", () => {
    const a = generateBand({ bandSetup: "long_with_anchor" }, "band-det");
    const b = generateBand({ bandSetup: "long_with_anchor" }, "band-det");
    const sig = (program: ReturnType<typeof generateWeeklyProgram>) =>
      program.week
        .map(
          (day) =>
            `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`
        )
        .join("|");
    expect(sig(a)).toBe(sig(b));
  });

  test("gym and dumbbell contracts remain green", () => {
    clearProgramVariationHistory();
    const gym = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "band-preserve-gym",
      { phaseIndex: 1, seed: "band-preserve-gym" }
    );
    expect(
      validateGymProgramContract({
        program: gym,
        persona: "band-preserve-gym",
        equipment: ["gym"],
        experience: "Beginner",
      })
    ).toEqual([]);

    clearProgramVariationHistory();
    const db = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "band-preserve-db",
      { phaseIndex: 1, seed: "band-preserve-db" }
    );
    expect(
      validateDumbbellProgramContract({
        program: db,
        persona: "band-preserve-db",
        equipment: ["dumbbells"],
        experience: "Beginner",
      })
    ).toEqual([]);
  });

  test("bodyweight and mixed-home identities preserved", () => {
    expect(resolvePrimaryProgramEquipmentMode([])).toBe("bodyweight");
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells", "bands"])).toBe(
      "mixedHome"
    );
  });
});
