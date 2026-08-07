import { describe, expect, it } from "vitest";
import { exerciseById } from "@/lib/exercises";
import { collectReleaseCriticalExerciseIds } from "@/lib/coaching/releaseCriticalExercises";
import { getExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingRegistry";
import {
  auditReleaseCriticalCoaching,
  validateExerciseCoachingContent,
} from "@/lib/coaching/validateExerciseCoaching";
import {
  resolveExerciseCoachingViewModel,
  resolvePrimaryCue,
} from "@/lib/coaching/resolveExerciseCoaching";
import { resolveExerciseDemoStatus } from "@/lib/coaching/exerciseDemoPolicy";
import { containsInternalCodeLeak, containsPlaceholderCopy } from "@/lib/coaching/synthesizeExerciseCoaching";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";

describe("Phase 6 exercise coaching completeness", () => {
  it("derives a non-empty release-critical set spanning the active catalog majority", () => {
    const { releaseCritical, catalogOnly, deprecated } =
      collectReleaseCriticalExerciseIds({ includeGenerated: false });
    expect(releaseCritical.length).toBeGreaterThan(80);
    expect(deprecated).toContain("cable-upright-row");
    expect(releaseCritical).not.toContain("cable-upright-row");
    expect(catalogOnly.length).toBeGreaterThan(0);
  });

  it("has 100% complete coaching for release-critical exercises", () => {
    const audit = auditReleaseCriticalCoaching();
    expect(audit.missingRegistry).toEqual([]);
    expect(audit.failures).toEqual([]);
    expect(audit.completenessPct).toBe(100);
  });

  it("resolves canonical primary cue from the registry", () => {
    const cue = resolvePrimaryCue({
      exerciseId: "goblet-squat",
      rationaleCue: "legacy rationale cue",
      catalogCue: "legacy catalog cue",
    });
    const content = getExerciseCoachingContent("goblet-squat");
    expect(content).toBeTruthy();
    expect(cue).toBe(content!.primaryCue);
  });

  it("keeps progression and regression references valid when present", () => {
    const content = getExerciseCoachingContent("pushup");
    expect(content).toBeTruthy();
    if (content?.progressionId) {
      expect(exerciseById(content.progressionId)?.deprecated).not.toBe(true);
    }
    if (content?.regressionId) {
      expect(exerciseById(content.regressionId)?.deprecated).not.toBe(true);
    }
    expect(validateExerciseCoachingContent(content!).map((f) => f.code)).not.toContain(
      "INVALID_PROGRESSION_REF"
    );
  });

  it("marks missing videos as planned or notRequired — never available without URL", () => {
    const content = getExerciseCoachingContent("band-lat-pulldown");
    const exercise = exerciseById("band-lat-pulldown")!;
    const status = resolveExerciseDemoStatus({
      exercise,
      demoRequirement: content!.demoRequirement,
    });
    expect(status === "planned" || status === "notRequired").toBe(true);
    expect(exercise.videoUrl).toBeFalsy();
  });

  it("filters high-anchor setup copy for no-anchor capabilities", () => {
    const withAnchor = resolveExerciseCoachingViewModel({
      exerciseId: "band-lat-pulldown",
      capabilities: { bandSetupLane: "long_with_anchor" },
    });
    const noAnchor = resolveExerciseCoachingViewModel({
      exerciseId: "band-lat-pulldown",
      capabilities: { bandSetupLane: "long_no_anchor" },
    });
    expect(withAnchor?.setupSteps.some((s) => /anchor|door/i.test(s))).toBe(true);
    expect(noAnchor?.setupSteps.some((s) => /fixed anchor|door/i.test(s))).toBe(false);
    expect(noAnchor?.capabilityNote).toBeTruthy();
  });

  it("exposes a guidance href and progression target on the view model", () => {
    const hingeId =
      ["dumbbell-rdl", "db-rdl", "romanian-deadlift", "single-leg-rdl"].find(
        (id) => exerciseById(id)
      ) ?? "goblet-squat";
    const vm = resolveExerciseCoachingViewModel({
      exerciseId: hingeId,
      item: {
        exerciseId: hingeId,
        sets: 3,
        reps: "8-12",
        durationSec: null,
        restSec: 90,
        loadType: "weighted",
        section: "main",
        prescription: {
          sets: 3,
          reps: "8-12",
          restSeconds: 90,
          progressionRule: "Add one clean rep per set before increasing load.",
        },
        rationale: {
          whyThisExercise: "Today’s primary strength pattern.",
        },
      },
    });
    expect(vm?.guidanceHref).toBe(`/exercise/${hingeId}`);
    expect(vm?.progression?.nextTarget).toMatch(/rep|load|Progress/i);
    expect(vm?.whySelected).toMatch(/primary|strength|pattern/i);
    expect(vm?.demo.status).not.toBe("available");
  });

  it("does not leak placeholders or internal codes in release-critical content", () => {
    const { releaseCritical } = collectReleaseCriticalExerciseIds({
      includeGenerated: false,
    });
    for (const id of releaseCritical.slice(0, 80)) {
      const content = getExerciseCoachingContent(id)!;
      const blob = [
        content.shortPurpose,
        content.primaryCue,
        ...content.setupSteps,
        ...content.executionSteps,
        content.commonMistake,
        content.correction,
        ...content.stopSignals,
      ].join(" ");
      expect(containsPlaceholderCopy(blob)).toBe(false);
      expect(containsInternalCodeLeak(blob)).toBe(false);
    }
  });

  it("connects generated program items through the coaching resolver", () => {
    clearProgramVariationHistory();
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        experience: "Intermediate",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
        painAreas: [],
      },
      "phase6-coaching-integration",
      { phaseIndex: 1, seed: "phase6-1" }
    );
    const main = program.week[0]?.routine.find((item) => item.section === "main");
    expect(main).toBeTruthy();
    const vm = resolveExerciseCoachingViewModel({
      exerciseId: main!.exerciseId,
      item: main!,
    });
    expect(vm?.setupSteps.length).toBeGreaterThan(0);
    expect(vm?.executionSteps.length).toBeGreaterThan(0);
    expect(vm?.primaryCue.length).toBeGreaterThan(0);
    expect(vm?.guidanceHref).toContain(main!.exerciseId);
  });

  it("keeps consumer/gym canonical cue parity for representative IDs", () => {
    for (const id of [
      "goblet-squat",
      "band-lat-pulldown",
      "pushup",
      "goblet-squat",
      "split-stance-row",
    ]) {
      const a = resolveExerciseCoachingViewModel({ exerciseId: id });
      const b = resolveExerciseCoachingViewModel({ exerciseId: id });
      expect(a?.primaryCue).toBe(b?.primaryCue);
      expect(a?.purpose).toBe(b?.purpose);
      expect(a?.demo.status).toBe(b?.demo.status);
    }
  });
});
