import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
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
});
