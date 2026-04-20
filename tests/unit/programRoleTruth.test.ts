import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";
import { auditWeeklyCoverageFromExercises } from "@/lib/program/coverageAudit";

const pickExercises = (ids: string[]) =>
  ids
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is NonNullable<ReturnType<typeof exerciseById>> =>
      Boolean(exercise)
    );

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
