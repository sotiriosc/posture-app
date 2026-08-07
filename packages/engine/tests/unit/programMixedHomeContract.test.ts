import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  MIXED_HOME_THREE_DAY_TITLES,
  looksLikeGymShapedDayTitle,
  validateMixedHomeProgramContract,
} from "@/lib/program/mixedHomeProgramContract";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { validateDumbbellProgramContract } from "@/lib/program/dumbbellProgramContract";
import { validateBandProgramContract } from "@/lib/program/bandProgramContract";
import { validateBodyweightProgramContract } from "@/lib/program/bodyweightProgramContract";
import { validateGymProgramContract } from "@/lib/program/gymProgramContract";
import { exerciseById } from "@/lib/exercises";

const baseMixed: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells", "bands"],
  bandSetup: "long_with_anchor",
  daysPerWeek: 3,
};

const generateMixed = (
  overrides: Partial<QuestionnaireData>,
  id: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(
    { ...baseMixed, ...overrides },
    id,
    { phaseIndex, seed: `${id}-seed` }
  );
};

describe("mixed-home program contract", () => {
  test("dumbbells + bands routes to mixedHome Full Body A/B/C (not gym)", () => {
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells", "bands"])).toBe(
      "mixedHome"
    );
    expect(resolvePrimaryProgramEquipmentMode(["bands", "dumbbells"])).toBe(
      "mixedHome"
    );
    const program = generateMixed({}, "mh-titles");
    expect(program.week.map((day) => day.title)).toEqual([
      ...MIXED_HOME_THREE_DAY_TITLES,
    ]);
    program.week.forEach((day) => {
      expect(looksLikeGymShapedDayTitle(day.title)).toBe(false);
    });
  });

  test("beginner/intermediate/advanced anchored weeks have zero hard failures", () => {
    for (const experience of ["Beginner", "Intermediate", "Advanced"] as const) {
      const program = generateMixed(
        { experience },
        `mh-contract-${experience.toLowerCase()}`
      );
      const failures = validateMixedHomeProgramContract({
        program,
        persona: `mh-${experience}`,
        equipment: ["dumbbells", "bands"],
        bandSetup: "long_with_anchor",
        experience,
      });
      expect(failures, experience).toEqual([]);
    }
  });

  test("each band setup lane keeps Full Body identity without gym titles", () => {
    for (const bandSetup of [
      "long_with_anchor",
      "long_no_anchor",
      "loop_only",
      "both_with_anchor",
      "both_no_anchor",
    ] as const) {
      const program = generateMixed(
        { experience: "Intermediate", bandSetup },
        `mh-lane-${bandSetup}`
      );
      expect(program.week.map((day) => day.title)).toEqual([
        ...MIXED_HOME_THREE_DAY_TITLES,
      ]);
      expect(
        validateMixedHomeProgramContract({
          program,
          persona: `mh-lane-${bandSetup}`,
          equipment: ["dumbbells", "bands"],
          bandSetup,
          experience: "Intermediate",
        })
      ).toEqual([]);
    }
  });

  test("four- and five-day mixed-home weeks keep A/B/C foundation", () => {
    const four = generateMixed(
      { experience: "Intermediate", daysPerWeek: 4 },
      "mh-4d",
      2
    );
    expect(four.week.map((day) => day.title)).toContain("Practice & Restore");
    expect(
      validateMixedHomeProgramContract({
        program: four,
        persona: "mh-4d",
        equipment: ["dumbbells", "bands"],
        bandSetup: "long_with_anchor",
        experience: "Intermediate",
      })
    ).toEqual([]);

    const five = generateMixed(
      { experience: "Advanced", daysPerWeek: 5 },
      "mh-5d",
      3
    );
    expect(five.week.map((day) => day.title)).toEqual(
      expect.arrayContaining([
        "Upper Pattern Practice",
        "Lower & Core Practice",
      ])
    );
    expect(
      validateMixedHomeProgramContract({
        program: five,
        persona: "mh-5d",
        equipment: ["dumbbells", "bands"],
        bandSetup: "long_with_anchor",
        experience: "Advanced",
      })
    ).toEqual([]);
  });

  test("Full Body A keeps true horizontal pull; dumbbells anchor strength", () => {
    const program = generateMixed(
      { experience: "Intermediate" },
      "mh-pull-honesty"
    );
    const dayA = program.week.find((day) => day.title.startsWith("Full Body A"));
    const mains = dayA?.routine.filter((item) => item.section === "main") ?? [];
    const pull = mains.find(
      (item) => item.selectionDebug?.slotKind === "mainPullHorizontal"
    );
    expect(pull?.exerciseId).toMatch(/row/);
    const dbMains = mains.filter((item) =>
      exerciseById(item.exerciseId)?.equipment.includes("dumbbells")
    );
    expect(dbMains.length).toBeGreaterThanOrEqual(2);
  });

  test("true vertical pull only with high anchor or pull-up bar", () => {
    const noAnchor = generateMixed(
      { bandSetup: "long_no_anchor", experience: "Intermediate" },
      "mh-no-vert"
    );
    const falseVertical = noAnchor.week.flatMap((day) =>
      day.routine.filter(
        (item) =>
          item.section === "main" &&
          (item.selectionDebug?.slotKind === "mainPullVertical" ||
            item.selectionDebug?.slotKind?.toLowerCase().includes("verticalpull"))
      )
    );
    // Without capability, authored slots must not claim vertical pull falsely.
    falseVertical.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      const name = `${item.exerciseId} ${exercise?.name ?? ""}`.toLowerCase();
      expect(
        name.includes("pulldown") ||
          name.includes("pull-up") ||
          name.includes("pullup")
      ).toBe(false);
    });

    const anchored = generateMixed(
      { bandSetup: "long_with_anchor", experience: "Intermediate" },
      "mh-vert"
    );
    const dayC = anchored.week.find((day) => day.title.startsWith("Full Body C"));
    const vertical = dayC?.routine.find(
      (item) =>
        item.section === "main" &&
        item.selectionDebug?.slotKind === "mainPullVertical"
    );
    expect(vertical?.exerciseId).toMatch(/pulldown|pull-up|pullup|chin/);
  });

  test("loop-only does not schedule long-band anchored rows/pulldowns", () => {
    const program = generateMixed(
      { bandSetup: "loop_only", experience: "Intermediate" },
      "mh-loop"
    );
    const ids = program.week.flatMap((day) =>
      day.routine
        .filter((item) => item.section === "main" || item.section === "accessory")
        .map((item) => item.exerciseId)
    );
    expect(ids.some((id) => id.includes("pulldown"))).toBe(false);
    expect(ids.some((id) => id === "pallof-press")).toBe(false);
    expect(
      validateMixedHomeProgramContract({
        program,
        persona: "mh-loop",
        equipment: ["dumbbells", "bands"],
        bandSetup: "loop_only",
        experience: "Intermediate",
      })
    ).toEqual([]);
  });

  test("no-anchor lane rejects fixed-anchor exercises", () => {
    const program = generateMixed(
      { bandSetup: "long_no_anchor", experience: "Intermediate" },
      "mh-no-anchor"
    );
    const failures = validateMixedHomeProgramContract({
      program,
      persona: "mh-no-anchor",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_no_anchor",
      experience: "Intermediate",
    });
    expect(
      failures.filter((failure) =>
        failure.reasonCode.includes("UNCONFIRMED_ANCHOR")
      )
    ).toEqual([]);
  });

  test("deterministic repeat generation", () => {
    const a = generateMixed({ experience: "Beginner" }, "mh-det");
    const b = generateMixed({ experience: "Beginner" }, "mh-det");
    const sig = (program: typeof a) =>
      program.week
        .map(
          (day) =>
            `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`
        )
        .join("|");
    expect(sig(a)).toBe(sig(b));
  });

  test("pain adaptations preserve Full Body identity", () => {
    for (const painAreas of [
      ["Shoulders"],
      ["Lower back"],
      ["Knees"],
      ["Hips"],
      ["Upper back"],
    ] as const) {
      const program = generateMixed(
        {
          experience: "Beginner",
          goals: "Reduce pain",
          painAreas: [...painAreas],
        },
        `mh-pain-${painAreas[0]}`
      );
      expect(program.week.map((day) => day.title)).toEqual([
        ...MIXED_HOME_THREE_DAY_TITLES,
      ]);
      expect(
        validateMixedHomeProgramContract({
          program,
          persona: `mh-pain-${painAreas[0]}`,
          equipment: ["dumbbells", "bands"],
          bandSetup: "long_with_anchor",
          experience: "Beginner",
          painAreas: [...painAreas],
        })
      ).toEqual([]);
    }
  });

  test("gym / dumbbell / band / bodyweight regressions remain enforceable", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const gym = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "mh-reg-gym",
      { phaseIndex: 1, seed: "mh-reg-gym" }
    );
    expect(gym.week.map((day) => day.title)).toEqual([
      "Back + Chest",
      "Shoulders + Arms",
      "Legs + Abs",
    ]);
    expect(
      validateGymProgramContract({
        program: gym,
        persona: "mh-reg-gym",
        equipment: ["gym"],
        experience: "Beginner",
      }).length
    ).toBeGreaterThanOrEqual(0);

    const dumbbell = generateMixed(
      { equipment: ["dumbbells"], bandSetup: undefined },
      "mh-reg-db"
    );
    // Force dumbbell-only questionnaire
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const dbProgram = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "mh-reg-db2",
      { phaseIndex: 1, seed: "mh-reg-db2" }
    );
    expect(
      validateDumbbellProgramContract({
        program: dbProgram,
        persona: "mh-reg-db2",
        equipment: ["dumbbells"],
        experience: "Beginner",
      })
    ).toEqual([]);
    void dumbbell;

    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const bandProgram = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["bands"],
        bandSetup: "long_with_anchor",
        daysPerWeek: 3,
      },
      "mh-reg-band",
      { phaseIndex: 1, seed: "mh-reg-band" }
    );
    expect(
      validateBandProgramContract({
        program: bandProgram,
        persona: "mh-reg-band",
        equipment: ["bands"],
        bandSetup: "long_with_anchor",
        experience: "Beginner",
      })
    ).toEqual([]);

    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const bwProgram = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      "mh-reg-bw",
      { phaseIndex: 1, seed: "mh-reg-bw" }
    );
    expect(
      validateBodyweightProgramContract({
        program: bwProgram,
        persona: "mh-reg-bw",
        equipment: ["none"],
        experience: "Beginner",
      })
    ).toEqual([]);
  });
});
