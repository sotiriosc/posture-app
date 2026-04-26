import { describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildEngineSignals, generateProgram } from "@/lib/engine";
import { deriveUserTrainingState } from "@/lib/phases";
import {
  PROGRAM_TEMPLATE_VERSION,
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";
import { finalizeWeeklyProgramResult } from "@/lib/program/programFinalization";

const weekSignature = (week: ReturnType<typeof generateWeeklyProgram>["week"]) =>
  week
    .map((day) => day.routine.map((item) => `${item.section}:${item.exerciseId}`).join(","))
    .join("|");

const engineQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: ["Shoulders"],
  experience: "Intermediate",
  equipment: ["dumbbells", "bands"],
  daysPerWeek: 3,
};

const progressionQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("merge readiness anchors", () => {
  test("weekly generation through the engine stays anchored", () => {
    const signals = buildEngineSignals({
      questionnaire: engineQuestionnaire,
      prefs: {
        schemaVersion: 2,
        feedbackByExercise: {
          "band-row": {
            rating: "hard",
          },
        },
      },
      nowIso: "2026-04-09T12:00:00.000Z",
    });

    const result = generateProgram({
      mode: "weekly",
      signals,
      nextProgramId: "anchor-weekly",
      phaseIndex: 2,
      cycleIndex: 1,
      weekIndex: 1,
      totalWeekIndex: 1,
    });

    expect(result.status).toBe("generated");
    if (!("program" in result)) {
      throw new Error("Expected generated weekly result.");
    }

    expect(result.seed).toBe(
      "engine-v1|weekly|target:2:1:1:1|questionnaire:15hyeri|settings:w8rmy8|history:14wgysr"
    );
    expect(weekSignature(result.program.week)).toBe(
      "warmup:wall-slides,activation:band-pull-aparts,main:dumbbell-floor-press,main:split-stance-band-chest-press,main:dumbbell-rows,main:band-lat-pulldown-kneeling,accessory:band-rear-delt-fly,accessory:band-face-pull-high-anchor,cooldown:thread-the-needle|warmup:wall-slides,activation:band-pull-aparts,main:band-overhead-press,main:dumbbell-lateral-raise,main:band-rear-delt-fly,main:band-lateral-raise,accessory:db-triceps-extension,accessory:db-biceps-curl,accessory:farmers-carry,cooldown:thread-the-needle|warmup:cat-cow,activation:wall-angel-hold,main:goblet-squat,main:db-rdl,main:split-squat,main:band-rdl,accessory:side-plank-star,accessory:single-leg-calf-raise,cooldown:thread-the-needle"
    );
  });

  test("nextCycle anchor stays advanced with the same progressed week shape", () => {
    const current = generateWeeklyProgram(progressionQuestionnaire, "current-cycle", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "anchor-cycle",
    });

    const result = generateNextCycleProgram({
      currentProgram: current,
      questionnaire: progressionQuestionnaire,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 3,
      completedWeeksCount: 1,
      nextProgramId: "next-cycle",
      seed: "anchor-cycle",
    });

    expect(result.status).toBe("advanced");
    if (result.status !== "advanced") {
      throw new Error("Expected advanced next-cycle result.");
    }

    expect(result.program.phaseIndex).toBe(1);
    expect(result.program.weekIndex).toBe(2);
    expect(result.program.cycleIndex).toBe(2);
    expect(weekSignature(result.program.week)).toBe(
      "warmup:scapular-pushups,activation:ankle-mobility,main:pushup,main:supine-elbow-drive-row,main:prone-elbow-row,accessory:reverse-snow-angel,accessory:back-widow,cooldown:thoracic-rotation|warmup:prone-ytw,activation:thoracic-rotation,main:pike-pushup,main:prone-t-raise,main:reverse-snow-angel,accessory:bodyweight-triceps-extension,accessory:self-resisted-biceps-curl,accessory:contralateral-reach-march,cooldown:wall-slides|warmup:wall-slides,activation:thoracic-rotation,main:bodyweight-squat,main:single-leg-glute-bridge-hold,main:split-squat,accessory:side-plank,accessory:single-leg-calf-raise,cooldown:hip-flexor-stretch"
    );
  });

  test("nextPhase anchor stays advanced with the same phase-reset week shape", () => {
    const current = generateWeeklyProgram(progressionQuestionnaire, "current-phase", {
      phaseIndex: 1,
      weekIndex: 3,
      cycleIndex: 1,
      totalWeekIndex: 3,
      seed: "anchor-phase",
    });

    const result = generateNextPhaseProgram({
      currentProgram: current,
      questionnaire: progressionQuestionnaire,
      painFlag: false,
      complianceRate: 1,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "next-phase",
      seed: "anchor-phase",
    });

    expect(result.status).toBe("advanced");
    if (result.status !== "advanced") {
      throw new Error("Expected advanced next-phase result.");
    }

    expect(result.program.phaseIndex).toBe(2);
    expect(result.program.weekIndex).toBe(1);
    expect(result.program.cycleIndex).toBe(1);
    expect(weekSignature(result.program.week)).toBe(
      "warmup:thoracic-rotation,activation:prone-ytw,main:pushup,main:supine-elbow-drive-row,main:supine-lat-pulldown-isometric,accessory:reverse-snow-angel,accessory:back-widow,cooldown:side-lying-open-book|warmup:wall-slides,activation:wall-angel-hold,main:pike-pushup,main:prone-t-raise,main:reverse-snow-angel,accessory:bodyweight-triceps-extension,accessory:towel-biceps-curl-hold,accessory:contralateral-reach-march,cooldown:thread-the-needle|warmup:cat-cow,activation:wall-angel-hold,main:split-squat,main:single-leg-rdl,main:bodyweight-squat,accessory:side-plank,accessory:single-leg-calf-raise,cooldown:thread-the-needle"
    );
  });

  test("same deterministic state still yields the same week", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const run = () =>
      generateWeeklyProgram(questionnaire, "deterministic-anchor", {
        phaseIndex: 2,
        weekIndex: 2,
        cycleIndex: 2,
        totalWeekIndex: 5,
        seed: "anchor-deterministic",
        variation: {
          seed: "anchor-var",
          settingsHash: "anchor-settings",
          variationIndex: 3,
          useRecentMemory: false,
        },
      });

    const a = run();
    const b = run();

    expect(weekSignature(a.week)).toBe(weekSignature(b.week));
  });

  test("warning forwarding and observability seams stay intact", () => {
    const auditEntries: Array<{ reasons: string[] }> = [];
    const observed = generateWeeklyProgram(engineQuestionnaire, "observability-anchor", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "observability-seed",
      selectionAuditHook: (entry) => {
        auditEntries.push({
          reasons: entry.chosen.reasons,
        });
      },
    });

    expect(auditEntries.length).toBeGreaterThan(0);
    expect(auditEntries.some((entry) => entry.reasons.includes("[final_trace]"))).toBe(true);

    const pushWarnings = vi.fn();
    const trainingState = deriveUserTrainingState({
      phaseIndex: observed.phaseIndex ?? 2,
      complianceRate: 0,
      painFlag: false,
      fatigueFlag: false,
    });

    finalizeWeeklyProgramResult({
      pushWarnings,
      programId: observed.id,
      phaseName: observed.phaseName ?? null,
      createdAt: observed.createdAt,
      goalTrack: observed.goalTrack,
      daysPerWeek: observed.daysPerWeek,
      phaseIndex: observed.phaseIndex ?? 2,
      weekIndex: observed.weekIndex ?? 1,
      totalWeekIndex: observed.totalWeekIndex ?? 1,
      cycleIndex: observed.cycleIndex ?? 1,
      nextWeekPlan: observed.nextWeekPlan!,
      week: observed.week,
      questionnaire: engineQuestionnaire,
      trainingState,
      consistencyRate: 0,
      warnings: [
        {
          dayTitle: "Back + Chest",
          kind: "coverage",
          message: "Anchor warning forwarding check.",
        },
      ],
      templateVersion: PROGRAM_TEMPLATE_VERSION,
    });

    expect(pushWarnings).toHaveBeenCalledWith([
      {
        programId: observed.id,
        phaseName: observed.phaseName ?? "Phase 2: Hypertrophy & Capacity",
        dayTitle: "Back + Chest",
        kind: "coverage",
        message: "Anchor warning forwarding check.",
      },
    ]);
  });
});
