import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import {
  auditWeeklyCoverage,
  buildWeeklyCoverageAuditWarnings,
} from "@/lib/program/coverageAudit";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

const gymQuestionnaire: QuestionnaireData = {
  goals: "Build strength",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 4,
};

const makeRoutineItem = (
  exerciseId: string,
  section: NonNullable<ProgramRoutineItem["section"]> = "main"
): ProgramRoutineItem => ({
  exerciseId,
  section,
  sets: "3",
  reps: "8-12",
  restSec: 90,
  loadType: exerciseById(exerciseId)?.loadType ?? "weighted",
});

describe("weekly coverage audit", () => {
  beforeEach(() => {
    clearProgramConstraintWarningBuffer();
  });

  test("normal gym week hits all must-hit primary patterns", () => {
    const program = generateWeeklyProgram(gymQuestionnaire, "coverage-audit-gym", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "coverage-audit-gym",
    });

    const audit = auditWeeklyCoverage(program.week);

    expect(audit.movementPatternsHit).toEqual([
      "push",
      "pull",
      "squat",
      "hinge",
      "core",
    ]);
    expect(audit.majorBodyRegionsHit).toEqual(["upper", "lower", "core"]);
    expect(audit.missingMustHitCategories).toEqual([]);
    expect(
      getProgramConstraintWarningBuffer().filter((warning) =>
        warning.message.startsWith("Weekly coverage audit")
      )
    ).toEqual([]);
  });

  test("constrained generated week surfaces missing coverage", () => {
    const constrainedWeek: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Upper Push Only",
        focusTags: ["upper", "push"],
        routine: [
          makeRoutineItem("dumbbell-bench-press"),
          makeRoutineItem("bodyweight-triceps-extension", "accessory"),
        ],
      },
      {
        dayIndex: 1,
        title: "Upper Pull Only",
        focusTags: ["upper", "pull"],
        routine: [
          makeRoutineItem("machine-lat-pulldown"),
          makeRoutineItem("cable-biceps-curl", "accessory"),
        ],
      },
    ];

    const audit = auditWeeklyCoverage(constrainedWeek);
    const warnings = buildWeeklyCoverageAuditWarnings(audit);

    expect(audit.movementPatternsHit).toEqual(["push", "pull"]);
    expect(audit.majorBodyRegionsHit).toEqual(["upper"]);
    expect(audit.missingMustHitCategories).toEqual([
      "movement:squat",
      "movement:hinge",
      "movement:core",
      "region:lower",
      "region:core",
    ]);
    expect(warnings).toEqual([
      {
        dayTitle: "Weekly Coverage",
        kind: "coverage",
        message:
          "Weekly coverage audit missing must-hit categories: movement:squat, movement:hinge, movement:core, region:lower, region:core.",
      },
    ]);
  });
});
