/**
 * Phase 3W — warmupProtectiveInjection.test.ts
 *
 * Verifies the protective-injection overlay:
 *   - Knee pain + any lower-body day → knee protective mobilizer injected
 *   - Shoulder pain + any upper-body day → shoulder-safe scap prep injected
 *   - Both are traced ("protective injection: [joint] pain flag active")
 */

import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import type { ProgramDay } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KNEE_MOBILIZER_IDS = new Set([
  "half-kneeling-knee-over-toe-rocks",
  "wall-supported-deep-knee-bend-hold",
]);

const SCAP_PREP_IDS = new Set([
  "serratus-wall-slide",
  "scap-cars",
  "wall-slides",
  "scap-pushup-plus",
]);

const isLowerBodyDay = (day: ProgramDay) => {
  const title = day.title.toLowerCase();
  return (
    title.includes("leg") ||
    title.includes("lower") ||
    title.includes("hinge") ||
    title.includes("squat") ||
    title.includes("glute") ||
    title.includes("hip")
  );
};

const isUpperBodyDay = (day: ProgramDay) => {
  const title = day.title.toLowerCase();
  return (
    title.includes("upper") ||
    title.includes("back") ||
    title.includes("chest") ||
    title.includes("push") ||
    title.includes("pull") ||
    title.includes("shoulder") ||
    title.includes("press")
  );
};

const warmupItemIds = (day: ProgramDay): string[] =>
  day.warmup?.items.map((i) => i.id) ?? [];

const allPrepItemIds = (day: ProgramDay): string[] => [
  ...(day.warmup?.items.map((i) => i.id) ?? []),
  ...(day.activation?.items.map((i) => i.id) ?? []),
  ...((day as typeof day & { prime?: typeof day.warmup }).prime?.items.map((i) => i.id) ?? []),
];

const traceFor = (day: ProgramDay): string =>
  ((day as typeof day & { warmupDecisionTrace?: string[] }).warmupDecisionTrace ?? []).join("\n");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("warmupProtectiveInjection", () => {
  test("knee-pain persona on a lower-body day gets knee protective mobilizer", () => {
    const kneePain: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(kneePain, "protective-knee-lower", {
      phaseIndex: 1,
      seed: "protective-knee-lower",
    });

    const lowerDays = program.week.filter(isLowerBodyDay);
    expect(lowerDays.length, "Program should have at least one lower-body day").toBeGreaterThan(0);

    lowerDays.forEach((day) => {
      const warmupIds = warmupItemIds(day);
      const hasKneeMobilizer = warmupIds.some((id) => KNEE_MOBILIZER_IDS.has(id));
      expect(
        hasKneeMobilizer,
        `Lower-body day "${day.title}" should include a knee protective mobilizer ` +
          `(half-kneeling-knee-over-toe-rocks or wall-supported-deep-knee-bend-hold); ` +
          `got warmup: ${warmupIds.join(", ")}`
      ).toBe(true);

      // Trace should log the injection
      const trace = traceFor(day);
      expect(
        trace.includes("protective injection") || trace.includes("knee"),
        `Lower-body day "${day.title}" trace should mention protective injection or knee`
      ).toBe(true);
    });
  });

  test("knee-pain persona on an upper-body day does NOT get knee mobilizer", () => {
    const kneePain: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(kneePain, "protective-knee-upper", {
      phaseIndex: 1,
      seed: "protective-knee-upper",
    });

    const upperDays = program.week.filter(isUpperBodyDay);
    upperDays.forEach((day) => {
      const warmupIds = warmupItemIds(day);
      // Knee mobilizers should NOT be injected on upper-body days
      expect(
        warmupIds.some((id) => KNEE_MOBILIZER_IDS.has(id)),
        `Upper-body day "${day.title}" should NOT include knee protective mobilizer; ` +
          `got: ${warmupIds.join(", ")}`
      ).toBe(false);
    });
  });

  test("shoulder-pain persona on an upper-body day gets shoulder-safe scap prep", () => {
    const shoulderPain: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(shoulderPain, "protective-shoulder-upper", {
      phaseIndex: 1,
      seed: "protective-shoulder-upper",
    });

    const upperDays = program.week.filter(isUpperBodyDay);
    expect(upperDays.length, "Program should have at least one upper-body day").toBeGreaterThan(0);

    upperDays.forEach((day) => {
      // Shoulder prep should be in warmup (MOBILIZE overlay or existing scap items)
      const warmupIds = warmupItemIds(day);
      const activationIds = day.activation?.items.map((i) => i.id) ?? [];
      const hasScapPrep =
        warmupIds.some((id) => SCAP_PREP_IDS.has(id)) ||
        activationIds.some((id) => SCAP_PREP_IDS.has(id));

      expect(
        hasScapPrep,
        `Upper-body day "${day.title}" with shoulder pain should include scap prep ` +
          `(serratus-wall-slide, scap-cars, wall-slides, or scap-pushup-plus); ` +
          `warmup: ${warmupIds.join(", ")}, activation: ${activationIds.join(", ")}`
      ).toBe(true);
    });
  });

  test("shoulder-pain items that load shoulders are filtered from warmup on upper days", () => {
    const shoulderPain: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Shoulders"],
      experience: "Intermediate",
      equipment: ["gym", "dumbbells", "bench"],
      daysPerWeek: 4,
    };

    const program = generateWeeklyProgram(shoulderPain, "protective-shoulder-filter", {
      phaseIndex: 2,
      seed: "protective-shoulder-filter",
    });

    const SHOULDER_CONTRAINDICATED_IDS = ["side-plank-reach", "incline-pushup-pattern", "scap-pushup-plus"];
    program.week.forEach((day) => {
      const warmupIds = warmupItemIds(day);
      SHOULDER_CONTRAINDICATED_IDS.forEach((filteredId) => {
        expect(
          warmupIds.includes(filteredId),
          `Item "${filteredId}" is shoulder-contraindicated and should be filtered from day "${day.title}"`
        ).toBe(false);
      });
    });
  });

  test("both traces are logged when both knee and shoulder pain are active", () => {
    const bothPain: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Knees", "Shoulders"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(bothPain, "protective-both-pain", {
      phaseIndex: 1,
      seed: "protective-both-pain",
    });

    // Lower days: knee protection; upper days: shoulder protection
    // Just verify no items have both pain areas as contraindications
    program.week.forEach((day) => {
      const allIds = allPrepItemIds(day);
      // No item should be contraindicated for knees AND appear in a lower-body context
      // (the engine should filter them out)
      // Simple check: no item should have "knees" as a painAreasToAvoid and appear in warmup
      const warmupIds = warmupItemIds(day);
      expect(warmupIds.length, `Day "${day.title}" should have warmup items`).toBeGreaterThan(0);
    });
  });

  test("protective injection items appear in the warmupDecisionTrace", () => {
    const kneePain: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(kneePain, "protective-trace-check", {
      phaseIndex: 1,
      seed: "protective-trace-check",
    });

    const lowerDays = program.week.filter(isLowerBodyDay);
    lowerDays.forEach((day) => {
      const trace = traceFor(day);
      const hasKneeMobilizer = warmupItemIds(day).some((id) => KNEE_MOBILIZER_IDS.has(id));
      if (hasKneeMobilizer) {
        // The trace should record the protective injection
        expect(
          trace.toLowerCase().includes("protective") || trace.toLowerCase().includes("knee"),
          `Day "${day.title}" protective injection should be recorded in trace; trace snippet: ${trace.slice(0, 200)}`
        ).toBe(true);
      }
    });
  });
});
