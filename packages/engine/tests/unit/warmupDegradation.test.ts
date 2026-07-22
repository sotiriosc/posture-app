/**
 * Phase 3W — warmupDegradation.test.ts
 *
 * Verifies that filtering (pain contraindications, equipment constraints)
 * that empties a warmup block produces a traced fallback — never a silent
 * empty block.
 *
 * Contract: zero silent drops.  Every degradation path writes a
 * degradationNotes or warmupDecisionTrace entry.
 */

import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildFourBlockWarmup } from "@/lib/program/warmupPlanner";
import { deriveDayIntentFromProgramDay } from "@/lib/program/warmupPlanner";
import { generateWeeklyProgram } from "@/lib/program";
import type { ProgramDay } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const traceFor = (day: ProgramDay): string[] =>
  (day as typeof day & { warmupDecisionTrace?: string[] }).warmupDecisionTrace ?? [];

const warmupItemIds = (day: ProgramDay): string[] =>
  day.warmup?.items.map((i) => i.id) ?? [];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("warmupDegradation", () => {
  test("no block is silently empty for a standard program", () => {
    const program = generateWeeklyProgram(
      {
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["bands"],
        daysPerWeek: 3,
      },
      "degradation-standard",
      { phaseIndex: 1, seed: "degradation-standard" }
    );

    program.week.forEach((day) => {
      // Warmup must always be non-empty
      expect(
        (day.warmup?.items.length ?? 0) + (day.activation?.items.length ?? 0),
        `Day "${day.title}": warmup + activation combined should be non-empty`
      ).toBeGreaterThan(0);

      // Cooldown must always exist
      expect(
        day.cooldown?.items.length ?? 0,
        `Day "${day.title}": cooldown should not be empty`
      ).toBeGreaterThan(0);
    });
  });

  test("multi-pain program never produces a silently empty warmup block", () => {
    // Heavy pain filtering — the engine must still produce at least one
    // warmup item per day (degradation fallback, not silent empty).
    const program = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Lower back", "Knees"],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      "degradation-heavy-pain",
      { phaseIndex: 1, seed: "degradation-heavy-pain" }
    );

    program.week.forEach((day) => {
      const warmupCount = day.warmup?.items.length ?? 0;
      const activationCount = day.activation?.items.length ?? 0;
      const trace = traceFor(day);

      expect(
        warmupCount + activationCount,
        `Day "${day.title}": should have at least one warmup or activation item even with heavy pain filtering`
      ).toBeGreaterThan(0);

      // If filtering occurred, the trace should record it
      const traceStr = trace.join("\n");
      const hadDegradation =
        traceStr.includes("degraded") ||
        traceStr.includes("fallback") ||
        traceStr.includes("no eligible");
      // Either no filtering needed (no degradation trace) or filtering was
      // explicitly recorded (degradation trace present).  Both are valid.
      // The FORBIDDEN case is: warmupCount + activationCount === 0 without trace.
      if (warmupCount + activationCount > 0) {
        // Non-empty → passes
      } else {
        // Empty → must have a trace explaining why
        expect(
          hadDegradation,
          `Day "${day.title}": if warmup is empty, trace must record a degradation reason`
        ).toBe(true);
      }
    });
  });

  test("warmupDecisionTrace records fallback when MOBILIZE pool is empty", () => {
    // Directly call buildFourBlockWarmup with impossible patterns (no exercises
    // exist for the fictional pattern) to force MOBILIZE degradation.
    const day: ProgramDay = {
      dayIndex: 0,
      title: "Test Day",
      focusTags: [],
      routine: [
        // A mock main item whose exercise doesn't exist (triggers no-pattern fallback)
        { exerciseId: "nonexistent-exercise-id", section: "main", sets: [], positionInRoutine: 0 },
      ],
    };

    const dayIntent = deriveDayIntentFromProgramDay(day);

    // Use fictional patterns so MOBILIZE has no candidates
    const {
      rampBlock,
      mobilizeBlock,
      activateBlock,
      primeBlock,
      warmupDecisionTrace,
    } = buildFourBlockWarmup(dayIntent, ["core_stability"], new Set(["none"]), []);

    // Trace must be non-empty
    expect(warmupDecisionTrace.length).toBeGreaterThan(0);

    // MOBILIZE should either have items or the trace records why not
    const traceStr = warmupDecisionTrace.join("\n");
    const mobilizeTraced =
      traceStr.includes("MOBILIZE:") ||
      traceStr.includes("MOBILIZE (overlay)") ||
      traceStr.includes("MOBILIZE (protective");
    expect(
      mobilizeTraced,
      `MOBILIZE block should be mentioned in trace even if empty; trace: ${traceStr.slice(0, 200)}`
    ).toBe(true);
  });

  test("degradation fallback items are traceable (trace has human-readable reason)", () => {
    const program = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Lower back"],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      "degradation-trace-readable",
      { phaseIndex: 1, seed: "degradation-trace-readable" }
    );

    program.week.forEach((day) => {
      const trace = traceFor(day);
      const patterns = day.routine
        .filter((i) => i.section === "main")
        .map((i) => i.exerciseId);

      if (patterns.length > 0 && trace.length > 0) {
        // Every trace line should be human-readable (not empty, not just an ID)
        trace.forEach((line, lineIndex) => {
          expect(
            line.trim().length,
            `Day "${day.title}" trace line ${lineIndex} should be non-empty`
          ).toBeGreaterThan(0);
          // Trace lines should contain at least one colon (block: description format)
          expect(
            line.includes(":"),
            `Trace line "${line}" should follow "BLOCK: reason" format`
          ).toBe(true);
        });
      }
    });
  });

  test("no item from a contraindicated block appears in any day", () => {
    const shoulderKneePain: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Knees"],
      experience: "Intermediate",
      equipment: ["gym", "dumbbells", "bench"],
      daysPerWeek: 4,
    };

    const program = generateWeeklyProgram(
      shoulderKneePain,
      "degradation-no-contraindicated",
      { phaseIndex: 2, seed: "degradation-no-contraindicated" }
    );

    // Known shoulder-contraindicated warmup items
    const SHOULDER_BLOCKED = ["side-plank-reach", "incline-pushup-pattern"];
    // Known wrist-contraindicated items
    const WRIST_BLOCKED = ["scap-pushup-plus"];

    program.week.forEach((day) => {
      const allIds = [
        ...(day.warmup?.items.map((i) => i.id) ?? []),
        ...(day.activation?.items.map((i) => i.id) ?? []),
        ...((day as typeof day & { prime?: typeof day.warmup }).prime?.items.map((i) => i.id) ?? []),
      ];

      SHOULDER_BLOCKED.forEach((id) => {
        expect(
          allIds.includes(id),
          `Shoulder-contraindicated item "${id}" should not appear on day "${day.title}" with shoulder pain`
        ).toBe(false);
      });
    });
  });

  test("PRIME block skipped with trace when no d1–d2 rung is equipment-eligible", () => {
    // Use only "barbell" equipment — many d1 exercises need bands/none
    // but barbell-only exercises at d1 are rare → some patterns may skip PRIME.
    const program = generateWeeklyProgram(
      {
        goals: "Build strength",
        painAreas: [],
        experience: "Advanced",
        equipment: ["barbell"],
        daysPerWeek: 3,
      },
      "degradation-prime-skip",
      { phaseIndex: 2, seed: "degradation-prime-skip" }
    );

    program.week.forEach((day) => {
      const trace = traceFor(day);
      const traceStr = trace.join("\n");
      // If any PRIME skip occurred, it must be recorded
      if (traceStr.includes("no equipment-eligible d1") || traceStr.includes("no d1–d2 rung")) {
        // A skip was recorded — this is the correct behavior (no silent drop)
        expect(
          traceStr.includes("PRIME:"),
          `If PRIME was attempted it should appear in trace; trace snippet: ${traceStr.slice(0, 200)}`
        ).toBe(true);
      }
    });
  });
});
