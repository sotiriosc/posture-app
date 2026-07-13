import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import { auditWeeklyCoverageFromExercises } from "@/lib/program/coverageAudit";

const pickExercises = (ids: string[]) =>
  ids
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is NonNullable<ReturnType<typeof exerciseById>> =>
      Boolean(exercise)
    );

const warningMessagesFor = (programId: string) =>
  getProgramConstraintWarningBuffer()
    .filter((warning) => warning.programId === programId)
    .map((warning) => warning.message);

const backChestMains = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  expect(day).toBeTruthy();
  return day?.routine.filter((item) => item.section === "main") ?? [];
};

const legsMains = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Legs + Abs");
  expect(day).toBeTruthy();
  return day?.routine.filter((item) => item.section === "main") ?? [];
};

const shouldersMains = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Shoulders + Arms");
  expect(day).toBeTruthy();
  return day?.routine.filter((item) => item.section === "main") ?? [];
};

const hasVerticalPullOrSurrogate = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  const descriptor = `${exercise?.id ?? ""} ${exercise?.name ?? ""}`.toLowerCase();
  return Boolean(
    exercise?.weeklyCoverageTags?.includes("verticalPull") ||
      exercise?.weeklyCoverageTags?.includes("verticalPullSurrogate") ||
      exercise?.movementPattern.some((pattern) => pattern.toLowerCase() === "verticalpull") ||
      descriptor.includes("lat sweep") ||
      descriptor.includes("lat pulldown")
  );
};

describe("program role truthfulness", () => {
  test("constrained rear-delt work does not fake chest coverage", () => {
    const audit = auditWeeklyCoverageFromExercises(
      pickExercises(["band-rear-delt-fly", "prone-swimmer"]),
      {
        daysPerWeek: 3,
        phase: "skill",
        experience: "beginner",
      }
    );
    const rearDeltFly = exerciseById("band-rear-delt-fly");

    expect(rearDeltFly?.accessoryRoles).toContain("accessoryRearDelt");
    expect(rearDeltFly?.weeklyCoverageTags ?? []).not.toContain("chest");
    expect(rearDeltFly?.weeklyCoverageTags ?? []).not.toContain("chestIsolation");
    expect(audit.categoryHits.chest).toBe(0);
    expect(audit.categoryHits.chestIsolation).toBe(0);
    expect(audit.missingMustHitCoverage).toContain("chest");
  });

  test("structural shoulder drills do not satisfy loaded shoulder quotas", () => {
    const proneSwimmer = exerciseById("prone-swimmer");

    expect(proneSwimmer?.slotRoles).toContain("mainShoulderStructural");
    expect(proneSwimmer?.slotRoles ?? []).not.toContain("mainRearDeltLoaded");
    expect(proneSwimmer?.weeklyCoverageTags ?? []).not.toContain("delts");
    expect(proneSwimmer?.weeklyCoverageTags ?? []).not.toContain("rearDeltIsolation");
  });

  test("side plank star contributes to core and not lower", () => {
    const sidePlankStar = exerciseById("side-plank-star");
    const coverageTags = new Set(sidePlankStar?.weeklyCoverageTags ?? []);

    expect(coverageTags.has("core")).toBe(true);
    expect(coverageTags.has("coreStability")).toBe(true);
    expect(coverageTags.has("antiRotation")).toBe(true);
    expect(coverageTags.has("lowerRegion")).toBe(false);
    expect(coverageTags.has("unilateralLower")).toBe(false);
  });

  test("pallof press contributes to core anti-rotation and not push", () => {
    const pallofPress = exerciseById("pallof-press");
    const coverageTags = new Set(pallofPress?.weeklyCoverageTags ?? []);
    const movementPatterns = new Set(pallofPress?.movementPattern ?? []);

    expect(coverageTags.has("core")).toBe(true);
    expect(coverageTags.has("antiRotation")).toBe(true);
    expect(movementPatterns.has("anti-rotation")).toBe(true);
    expect(coverageTags.has("pushCompound")).toBe(false);
    expect(movementPatterns.has("push")).toBe(false);
  });

  test("no-equipment Back + Chest keeps push-ups in push slots and rows in pull slots", () => {
    const programId = "truth-none-back-chest-slots";
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["lower back"],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      programId,
      { phaseIndex: 1, seed: "three-day-persona-review-12-phase-1" }
    );
    const mains = backChestMains(program);
    const pushupLike = new Set(["pushup", "countertop-pushup", "wall-pushup", "archer-pushup"]);
    const rowLike = new Set(["supine-elbow-drive-row", "prone-elbow-row", "back-widow"]);

    expect(mains.some((item) => pushupLike.has(item.exerciseId))).toBe(true);
    expect(
      mains
        .filter((item) => pushupLike.has(item.exerciseId))
        .every(
          (item) =>
            item.selectionDebug?.slotLane === "push" &&
            !item.selectionDebug?.slotKind?.startsWith("mainPull")
        )
    ).toBe(true);
    expect(
      mains
        .filter((item) => rowLike.has(item.exerciseId))
        .every(
          (item) =>
            item.selectionDebug?.slotLane === "pull" &&
            item.selectionDebug?.slotKind !== "mainPushSecondary"
        )
    ).toBe(true);
    expect(warningMessagesFor(programId)).toEqual([]);
  });

  test("constrained vertical-pull surrogate satisfies Back + Chest without missing-main warnings", () => {
    const programId = "truth-none-vertical-surrogate";
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      programId,
      { phaseIndex: 2, seed: "three-day-persona-review-11-phase-2" }
    );
    const mains = backChestMains(program);

    expect(mains.some((item) => item.selectionDebug?.slotKind === "mainPullHorizontal")).toBe(true);
    expect(
      mains.some(
        (item) =>
          item.selectionDebug?.slotKind === "mainPullVertical" &&
          hasVerticalPullOrSurrogate(item.exerciseId)
      )
    ).toBe(true);
    expect(warningMessagesFor(programId).join("\n")).not.toMatch(/main pull pattern|main vertical pull/i);
  });

  test("band chest fly remains a legal chest-isolation main without stale archer-pushup warnings", () => {
    const programId = "truth-band-chest-fly-final";
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["bands"],
        daysPerWeek: 3,
      },
      programId,
      { phaseIndex: 3, seed: "three-day-persona-review-9-phase-3" }
    );
    const fly = backChestMains(program).find((item) => item.exerciseId === "band-chest-fly");

    expect(fly).toBeTruthy();
    expect(fly?.selectionDebug?.slotKind).toBe("mainPushFly");
    expect(fly?.selectionDebug?.slotLane).toBe("push");
    expect(warningMessagesFor(programId).join("\n")).not.toMatch(
      /band-chest-fly.*archer-pushup|archer-pushup.*band-chest-fly|main legality replaced|final main integrity replaced/i
    );
  });

  test("hip-extension hinge surrogates satisfy lower-back-pain hinge slots without carry noise", () => {
    const programId = "truth-low-back-hinge-surrogate";
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["lower back"],
        experience: "Beginner",
        equipment: ["bands"],
        daysPerWeek: 3,
      },
      programId,
      { phaseIndex: 1, seed: "three-day-persona-review-10-phase-1" }
    );
    const hinge = legsMains(program).find(
      (item) => item.selectionDebug?.slotKind === "mainHingePrimary"
    );
    const messages = warningMessagesFor(programId).join("\n");

    expect(hinge?.exerciseId).toBeTruthy();
    expect(hinge?.exerciseId).not.toBe("back-extension");
    expect(hinge?.exerciseId).not.toBe("back-extension-hold");
    expect(messages).not.toMatch(/main hinge pattern|carry coverage|carry fallback/i);
  });

  test("lower-back pain profiles avoid back-extension-hold as the primary hinge main", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(questionnaire, "truth-low-back-pain", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "truth-low-back-pain",
    });
    const legsDay = program.week.find((day) => day.title === "Legs + Abs");
    const hingeMain = legsDay?.routine.find(
      (item) =>
        item.section === "main" && item.selectionDebug?.slotKind === "mainHingePrimary"
    );

    expect(legsDay).toBeTruthy();
    expect(hingeMain?.exerciseId).toBeTruthy();
    expect(hingeMain?.exerciseId).not.toBe("back-extension-hold");
  });

  test("3-day Legs + Abs finishes with explicit lower main slots and no calf mains", () => {
    const profiles: Array<{ id: string; questionnaire: QuestionnaireData; phaseIndex: 1 | 2 | 3 }> = [
      {
        id: "truth-legs-gym-beginner",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["gym"],
          daysPerWeek: 3,
        },
        phaseIndex: 1,
      },
      {
        id: "truth-legs-db-intermediate",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          equipment: ["dumbbells"],
          daysPerWeek: 3,
        },
        phaseIndex: 1,
      },
      {
        id: "truth-legs-bands-intermediate-growth",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          equipment: ["bands"],
          daysPerWeek: 3,
        },
        phaseIndex: 3,
      },
    ];

    profiles.forEach(({ id, questionnaire, phaseIndex }) => {
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const program = generateWeeklyProgram(questionnaire, id, {
        phaseIndex,
        seed: `${id}-seed`,
      });
      const mains = legsMains(program);

      expect(mains.every((item) => item.selectionDebug?.slotKind !== "mainFinal")).toBe(true);
      expect(
        mains.every((item) => !["db-calf-raise", "band-calf-raise"].includes(item.exerciseId))
      ).toBe(true);
      expect(warningMessagesFor(id).join("\n")).not.toMatch(/Final main slot|main hinge pattern/i);
    });
  });

  test("hamstring curl is secondary hamstring work, not a primary hinge or generic main", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "truth-hamstring-curl-slot",
      { phaseIndex: 1, seed: "truth-hamstring-curl-slot" }
    );

    legsMains(program)
      .filter((item) => item.exerciseId === "machine-seated-hamstring-curl")
      .forEach((item) => {
        expect(item.selectionDebug?.slotKind).toBe("mainHamstringIsolation");
        expect(item.selectionDebug?.slotKind).not.toBe("mainHingePrimary");
        expect(item.selectionDebug?.slotKind).not.toBe("mainFinal");
      });
  });

  test("lower-back-pain Phase 1 uses a hip-extension hinge surrogate instead of hamstring curl", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["lower back"],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "truth-low-back-phase-one-hip-extension",
      { phaseIndex: 1, seed: "three-day-persona-review-4-phase-1" }
    );
    const hinge = legsMains(program).find(
      (item) => item.selectionDebug?.slotKind === "mainHingePrimary"
    );
    const hingeName = `${exerciseById(hinge?.exerciseId)?.id ?? ""} ${
      exerciseById(hinge?.exerciseId)?.name ?? ""
    }`.toLowerCase();

    expect(hinge?.exerciseId).toBeTruthy();
    expect(hinge?.exerciseId).not.toBe("machine-seated-hamstring-curl");
    expect(hingeName).toMatch(/hip thrust|glute bridge|glute-bridge/);
    expect(warningMessagesFor("truth-low-back-phase-one-hip-extension")).toEqual([]);
  });

  test("dumbbell Shoulder + Arms does not satisfy shoulder-pull slots with structural or press exercises", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "truth-dumbbell-shoulder-pull",
      { phaseIndex: 1, seed: "three-day-persona-review-6-phase-1" }
    );

    shouldersMains(program).forEach((item) => {
      if (item.exerciseId === "prone-swimmer") {
        expect(item.selectionDebug?.slotKind).not.toBe("mainShoulderPullPrimary");
      }
      if (item.exerciseId === "dumbbell-arnold-press") {
        expect(item.selectionDebug?.slotKind).not.toContain("Pull");
      }
    });
  });

  test("constrained dumbbell Back + Chest Phase 1 includes a vertical-pull surrogate", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "truth-db-back-chest-vertical-surrogate",
      { phaseIndex: 1, seed: "three-day-persona-review-6-phase-1" }
    );

    expect(
      backChestMains(program).some(
        (item) =>
          item.selectionDebug?.slotKind === "mainPullVertical" &&
          hasVerticalPullOrSurrogate(item.exerciseId)
      )
    ).toBe(true);
    expect(warningMessagesFor("truth-db-back-chest-vertical-surrogate")).toEqual([]);
  });

  test("side-plank star and Pallof press finish with core accessory labels", () => {
    const cases: Array<{
      id: string;
      questionnaire: QuestionnaireData;
      phaseIndex: 1 | 2 | 3;
      seed: string;
      expectedExerciseId: string;
    }> = [
      {
        id: "truth-pallof-final-core",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["bands"],
          daysPerWeek: 3,
        },
        phaseIndex: 3,
        seed: "slot-core-bands-5",
        expectedExerciseId: "pallof-press",
      },
      {
        id: "truth-side-plank-star-final-core",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Advanced",
          equipment: ["none"],
          daysPerWeek: 3,
        },
        phaseIndex: 2,
        seed: "side-star-1",
        expectedExerciseId: "side-plank-star",
      },
    ];

    cases.forEach(({ id, questionnaire, phaseIndex, seed, expectedExerciseId }) => {
      clearProgramVariationHistory();
      const program = generateWeeklyProgram(questionnaire, id, { phaseIndex, seed });
      const item = program.week
        .flatMap((day) => day.routine)
        .find((entry) => entry.exerciseId === expectedExerciseId);

      expect(item?.section).toBe("accessory");
      expect(item?.selectionDebug?.slotKind).toBe("accessorycore");
      expect(item?.selectionDebug?.slotLane).toBe("core");
    });
  });
});
