/**
 * Focused metamorphic assertions mirrored from fuzzIntegrityAudit (Phase 7B §8).
 */
import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
} from "@/lib/program";
import type { Program } from "@/lib/types";

const allIds = (program: Program) =>
  program.week.flatMap((d) => d.routine.map((i) => i.exerciseId));

const orderedSig = (program: Program) =>
  program.week
    .map((d) => `${d.title}:${d.routine.map((i) => i.exerciseId).join(",")}`)
    .join("|");

const daySig = (program: Program) => program.week.map((d) => d.title).join("|");

const gen = (q: QuestionnaireData, id: string, seed: string, phaseIndex = 1) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(q, id, { phaseIndex, seed, skipQualityGate: true });
};

describe("fuzz-integrity metamorphic named relationships", () => {
  test("experience: complexity/prescription effect with stable equipment truth", () => {
    const beforeQ: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    };
    const afterQ: QuestionnaireData = { ...beforeQ, experience: "Advanced" };
    const before = gen(beforeQ, "meta-exp-b", "fuzz-integrity-meta-experience");
    const after = gen(afterQ, "meta-exp-a", "fuzz-integrity-meta-experience");
    const afterEval = evaluateProgramQuality({
      program: after,
      questionnaire: afterQ,
    });
    expect(afterEval.hardFailures.some((f) => f.code.includes("ILLEGAL_EQUIPMENT"))).toBe(
      false
    );
    const beforeSets = before.week.reduce(
      (s, d) => s + d.routine.reduce((x, i) => x + (i.sets ?? 0), 0),
      0
    );
    const afterSets = after.week.reduce(
      (s, d) => s + d.routine.reduce((x, i) => x + (i.sets ?? 0), 0),
      0
    );
    const beforeRx = JSON.stringify(
      before.week.map((d) =>
        d.routine.map((i) => i.prescription?.progressionRule ?? i.reps ?? "")
      )
    );
    const afterRx = JSON.stringify(
      after.week.map((d) =>
        d.routine.map((i) => i.prescription?.progressionRule ?? i.reps ?? "")
      )
    );
    expect(
      afterSets >= beforeSets ||
        beforeRx !== afterRx ||
        orderedSig(before) !== orderedSig(after)
    ).toBe(true);
  });

  test("phase: stable day identity and intended change", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const before = gen(q, "meta-phase-b", "fuzz-integrity-meta-phase", 1);
    const after = gen(q, "meta-phase-a", "fuzz-integrity-meta-phase", 3);
    expect(daySig(before)).toBe(daySig(after));
    const exerciseChanged = orderedSig(before) !== orderedSig(after);
    const beforeRx = JSON.stringify(
      before.week.map((d) =>
        d.routine.map((i) => ({
          reps: i.reps,
          sets: i.sets,
          rule: i.prescription?.progressionRule ?? null,
        }))
      )
    );
    const afterRx = JSON.stringify(
      after.week.map((d) =>
        d.routine.map((i) => ({
          reps: i.reps,
          sets: i.sets,
          rule: i.prescription?.progressionRule ?? null,
        }))
      )
    );
    expect(exerciseChanged || beforeRx !== afterRx).toBe(true);
  });

  test("personal blocks: block actual baseline hinge and keep role when possible", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    };
    const before = gen(q, "meta-hinge-b", "fuzz-integrity-meta-block-hinge");
    const baselineHinge =
      allIds(before).find((id) =>
        (exerciseById(id)?.movementPattern ?? []).some((p) =>
          p.toLowerCase().includes("hinge")
        )
      ) ?? "db-rdl";
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const blocked = generateWeeklyProgram(q, "meta-hinge-a", {
      phaseIndex: 1,
      seed: "fuzz-integrity-meta-block-hinge",
      skipQualityGate: true,
      blockedExerciseIds: {
        [baselineHinge]: {
          reason: "personal_preference",
          blockedAt: { phase: "skill", sessionCount: 2 },
        },
      },
    });
    expect(allIds(blocked)).not.toContain(baselineHinge);
    const hasHinge = allIds(blocked).some((id) =>
      (exerciseById(id)?.movementPattern ?? []).some((p) =>
        p.toLowerCase().includes("hinge")
      )
    );
    const evalBlocked = evaluateProgramQuality({
      program: blocked,
      questionnaire: q,
      blockedExerciseIds: [baselineHinge],
    });
    expect(hasHinge || evalBlocked.capabilityLimitations.length > 0).toBe(true);
  });

  test("gym db-rdl block: hinge remains via legal alternative when possible", () => {
    const q: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const seed = "gym-fuzz-9e37e786";
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const blocked = generateWeeklyProgram(q, "gym-hinge-b", {
      phaseIndex: 1,
      seed,
      skipQualityGate: true,
      blockedExerciseIds: {
        "db-rdl": {
          reason: "personal_preference",
          blockedAt: { phase: "skill", sessionCount: 3 },
        },
      },
    });
    expect(allIds(blocked)).not.toContain("db-rdl");
    const evaluation = evaluateProgramQuality({
      program: blocked,
      questionnaire: q,
      blockedExerciseIds: ["db-rdl"],
    });
    const wrongTruth = evaluation.hardFailures.some(
      (f) =>
        f.code.includes("REQUIRED_ROLE_WRONG_TRUTH") ||
        f.code.includes("MISSING_TRUE_HINGE")
    );
    const mainHinges = blocked.week.flatMap((d) =>
      d.routine
        .filter((i) => i.section === "main")
        .filter((i) => {
          const slot = `${i.selectionDebug?.slotKind ?? ""} ${i.selectionDebug?.slotLane ?? ""}`.toLowerCase();
          return (
            slot.includes("hinge") ||
            (exerciseById(i.exerciseId)?.movementPattern ?? []).some((p) =>
              p.toLowerCase().includes("hinge")
            )
          );
        })
        .map((i) => i.exerciseId)
    );
    // Gym user blocking db-rdl should keep a legal true hinge (e.g. barbell RDL).
    expect(mainHinges.length).toBeGreaterThan(0);
    expect(wrongTruth).toBe(false);
    expect(evaluation.passed || evaluation.capabilityLimitations.length > 0).toBe(true);
  });
});
