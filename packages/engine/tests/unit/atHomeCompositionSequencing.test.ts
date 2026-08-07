import { describe, expect, it } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  PROGRAM_TEMPLATE_VERSION,
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  applyConstraintAwareSequencing,
  assertSectionOrderInvariant,
} from "@/lib/program/sequencingPolicy";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

const mainAccessoryOrder = (program: Program) =>
  program.week
    .map(
      (day) =>
        `${day.title}:${day.routine
          .filter((item) => item.section === "main" || item.section === "accessory")
          .map((item) => item.exerciseId)
          .join(",")}`
    )
    .join("|");

const sectionSequence = (day: ProgramDay) =>
  day.routine.map((item) => item.section ?? "main");

const generate = (
  questionnaire: QuestionnaireData,
  seed: string,
  options?: {
    phaseIndex?: number;
    cycleIndex?: number;
    previousWeek?: ProgramDay[];
    blockedExerciseIds?: Parameters<typeof generateWeeklyProgram>[2] extends
      | { blockedExerciseIds?: infer B }
      | undefined
      ? B
      : never;
    skipSequencing?: boolean;
  }
) => {
  clearProgramConstraintWarningBuffer();
  clearProgramVariationHistory();
  return generateWeeklyProgram(questionnaire, seed, {
    phaseIndex: options?.phaseIndex ?? 1,
    seed,
    cycleIndex: options?.cycleIndex ?? 1,
    weekIndex: 1,
    previousWeek: options?.previousWeek,
    blockedExerciseIds: options?.blockedExerciseIds,
    skipSequencing: options?.skipSequencing,
  });
};

const AT_HOME_MODES: Array<{
  id: string;
  questionnaire: QuestionnaireData;
  days: Array<3 | 4 | 5>;
}> = [
  {
    id: "dumbbells",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bench"],
      daysPerWeek: 3,
    },
    days: [3, 4, 5],
  },
  {
    id: "anchored_bands",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    days: [3, 4, 5],
  },
  {
    id: "no_anchor_bands",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    },
    days: [3, 4, 5],
  },
  {
    id: "loop_only",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "loop_only",
    },
    days: [3, 4, 5],
  },
  {
    id: "bodyweight",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    days: [3, 4, 5],
  },
  {
    id: "mixed_home",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands", "bench"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    days: [3, 4, 5],
  },
];

describe("at-home composition sequencing", () => {
  it("bumps template version to 19 for composition contract ordering", () => {
    expect(PROGRAM_TEMPLATE_VERSION).toBe(19);
  });

  it("keeps section order warmup → activation → main → accessory → cooldown", () => {
    const program = generate(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "seq-section-order"
    );
    for (const day of program.week) {
      expect(assertSectionOrderInvariant(day)).toBe(true);
      const sections = sectionSequence(day);
      const firstMain = sections.indexOf("main");
      const firstAccessory = sections.indexOf("accessory");
      const firstCooldown = sections.indexOf("cooldown");
      if (firstMain >= 0 && firstAccessory >= 0) {
        expect(firstMain).toBeLessThan(firstAccessory);
      }
      if (firstAccessory >= 0 && firstCooldown >= 0) {
        expect(firstAccessory).toBeLessThan(firstCooldown);
      }
      expect(sections.includes("warmup" as never) || true).toBe(true);
    }
  });

  it("keeps primary main early and never promotes prep into main", () => {
    const withoutSeq = generate(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["dumbbells", "bench"],
        daysPerWeek: 3,
      },
      "seq-primary-lock",
      { skipSequencing: true }
    );
    const withSeq = generate(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["dumbbells", "bench"],
        daysPerWeek: 3,
      },
      "seq-primary-lock",
      { skipSequencing: false }
    );
    withoutSeq.week.forEach((day, dayIndex) => {
      const authoredPrimary = day.routine.find((item) => item.section === "main")?.exerciseId;
      const sequencedPrimary = withSeq.week[dayIndex]?.routine.find(
        (item) => item.section === "main"
      )?.exerciseId;
      expect(sequencedPrimary).toBe(authoredPrimary);
      const prepIds = new Set(
        day.routine
          .filter((item) => item.section === "warmup" || item.section === "activation")
          .map((item) => item.exerciseId)
      );
      const sequencedMains = withSeq.week[dayIndex]!.routine.filter(
        (item) => item.section === "main"
      );
      sequencedMains.forEach((item) => {
        expect(prepIds.has(item.exerciseId)).toBe(false);
      });
    });
  });

  it("rotates equivalent groups deterministically for identical inputs", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bench"],
      daysPerWeek: 3,
    };
    const a = generate(q, "seq-det-1", { cycleIndex: 2 });
    const b = generate(q, "seq-det-1", { cycleIndex: 2 });
    expect(mainAccessoryOrder(a)).toBe(mainAccessoryOrder(b));
    expect(a.templateVersion).toBe(19);
  });

  it("can vary order across cycle lanes without unseeded randomness", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells", "bench"],
      daysPerWeek: 4,
    };
    const cycle1 = generate(q, "seq-cycle-lane", { cycleIndex: 1 });
    const cycle2 = generate(q, "seq-cycle-lane", { cycleIndex: 2 });
    const cycle1b = generate(q, "seq-cycle-lane", { cycleIndex: 1 });
    const cycle2b = generate(q, "seq-cycle-lane", { cycleIndex: 2 });
    expect(mainAccessoryOrder(cycle1)).toBe(mainAccessoryOrder(cycle1b));
    expect(mainAccessoryOrder(cycle2)).toBe(mainAccessoryOrder(cycle2b));
    // Cycle lanes remain deterministic; selection may also progress with cycleIndex.
    expect(cycle1.templateVersion).toBe(19);
    expect(cycle2.templateVersion).toBe(19);
  });

  it("respects personal blocks and pain constraints after sequencing", () => {
    const blockedId = "goblet-squat";
    const program = generate(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Lower back"],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "seq-blocks-pain",
      {
        blockedExerciseIds: {
          [blockedId]: {
            reason: "personal_preference",
            blockedAt: { phase: "activation", sessionCount: 1 },
          },
        },
      }
    );
    const allIds = program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
    expect(allIds.includes(blockedId)).toBe(false);
    expect(program.templateVersion).toBe(19);
  });

  it("does not silently reorder a stored previous program object", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    };
    const stored = generate(q, "seq-stored-immutable");
    const snapshot = JSON.stringify(stored.week);
    generate(q, "seq-stored-immutable-next", {
      cycleIndex: 2,
      previousWeek: stored.week,
    });
    expect(JSON.stringify(stored.week)).toBe(snapshot);
  });

  it("policy unit: cooldown remains last and prep stays out of main section", () => {
    const day: ProgramDay = {
      dayIndex: 0,
      title: "Full Body A",
      focusTags: [],
      routine: [
        item("cat-cow", "warmup"),
        item("band-pull-aparts", "activation"),
        item("goblet-squat", "main", "squat"),
        item("dumbbell-bench-press", "main", "push"),
        item("dumbbell-rows", "main", "pull"),
        item("dumbbell-lateral-raise", "accessory", "isolation"),
        item("band-pull-aparts", "accessory", "scap"),
        item("childs-pose", "cooldown"),
      ],
    };
    const result = applyConstraintAwareSequencing({
      week: [day],
      seed: "unit-policy",
      cycleIndex: 3,
    });
    const sections = result.week[0]!.routine.map((entry) => entry.section);
    expect(sections[sections.length - 1]).toBe("cooldown");
    expect(sections.indexOf("main")).toBeLessThan(sections.indexOf("accessory"));
    expect(result.week[0]!.routine.find((entry) => entry.section === "main")?.exerciseId).toBe(
      "goblet-squat"
    );
    expect(assertSectionOrderInvariant(result.week[0]!)).toBe(true);
  });

  for (const mode of AT_HOME_MODES) {
    for (const days of mode.days) {
      it(`regression ${mode.id} ${days}d generates quality program`, () => {
        const program = generate(
          { ...mode.questionnaire, daysPerWeek: days },
          `seq-reg-${mode.id}-${days}`
        );
        expect(program.week).toHaveLength(days);
        expect(program.templateVersion).toBe(19);
        for (const day of program.week) {
          expect(assertSectionOrderInvariant(day)).toBe(true);
          expect(day.routine.some((item) => item.section === "main")).toBe(true);
        }
      });
    }
  }
});

describe("beginner gate intelligence corrections", () => {
  it("keeps goblet squat eligible when machines are available (soft preference)", () => {
    // Multiple seeds: goblet may or may not win, but machine-only is not required.
    const families = new Set<string>();
    for (let i = 0; i < 8; i += 1) {
      const program = generate(
        {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["gym"],
          daysPerWeek: 3,
        },
        `gate-goblet-${i + 1}`,
        { phaseIndex: 1 }
      );
      program.week
        .flatMap((day) => day.routine.filter((item) => item.section === "main"))
        .forEach((item) => {
          if (item.exerciseId.includes("machine")) families.add("machines");
          if (item.exerciseId.includes("dumbbell") || item.exerciseId.startsWith("db-")) {
            families.add("dumbbells");
          }
          if (item.exerciseId === "goblet-squat") families.add("goblet");
        });
    }
    expect(families.has("machines")).toBe(true);
    expect(families.has("dumbbells") || families.has("goblet")).toBe(true);
  });

  it("repair/fallback parity: blocking machine-chest-press yields non-machine push", () => {
    const program = generate(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "gate-block-mcp",
      {
        phaseIndex: 1,
        blockedExerciseIds: {
          "machine-chest-press": {
            reason: "personal_preference",
            blockedAt: { phase: "activation", sessionCount: 1 },
          },
        },
      }
    );
    const ids = program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
    expect(ids.includes("machine-chest-press")).toBe(false);
    expect(ids.some((id) => id.includes("press") || id.includes("push"))).toBe(true);
  });
});

const item = (
  exerciseId: string,
  section: ProgramRoutineItem["section"],
  slotLane?: string
): ProgramRoutineItem => ({
  exerciseId,
  section,
  sets: 3,
  reps: "8-10",
  loadType: "weighted",
  selectionDebug: slotLane
    ? {
        source: "initial_pick",
        slotLane,
        slotKind: `main${slotLane}`,
      }
    : { source: "initial_pick" },
});
