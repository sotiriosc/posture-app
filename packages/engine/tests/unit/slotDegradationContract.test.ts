/**
 * Slot Degradation Contract Tests (Phase 2c.2)
 *
 * Verifies the four-stage degradation contract when equipment + pain filtering
 * would otherwise empty a main slot:
 *   (a) Relax tier cap — fill the slot with any accessible exercise in the lane
 *   (b) Ladder-aware substitution — any rung of the same pattern the user can access
 *   (c) Corrective fallback — scap_health / hip_health / knee_health / core_health
 *   (d) Last-resort traced drop — slot removed, coachNote written, no silent drop
 *
 * The exact i=29 fuzz persona is included as a named test to prevent regression.
 */
import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

// ── Helper ─────────────────────────────────────────────────────────────────

const mainItems = (day: { routine: Array<{ section: string; exerciseId: string }> }) =>
  day.routine.filter((item) => item.section === "main");

const hasDegradationNote = (day: { degradationNotes?: string[] }) =>
  Array.isArray(day.degradationNotes) && day.degradationNotes.length > 0;

// ── i=29 Fuzz Persona ───────────────────────────────────────────────────────

describe("slot degradation contract", () => {
  /**
   * Exact replica of fuzz iteration i=29 that historically produced 4 mains
   * instead of 5 for an Advanced 3-day Back+Chest scenario. The degradation
   * contract must yield 5 mains (stages a/b/c) or 4 mains with a coachNote
   * (stage d). A silent count mismatch is a hard failure.
   */
  test("i=29 fuzz persona: Advanced / 3-day / Back+Chest fills or traces every slot", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      experience: "Advanced",
      painAreas: ["Upper back", "Shoulders", "Knees"],
      equipment: ["none", "dumbbells", "foam_roller"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(questionnaire, "fuzz-29", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
    });

    const backChestDay = program.week.find((d) => d.title === "Back + Chest");
    expect(backChestDay).toBeDefined();
    if (!backChestDay) return;

    const mains = mainItems(backChestDay);

    // Advanced / 3-day / Back+Chest expects 5 main slots.
    // Contract: count must equal 5 (stages a/b/c) OR be < 5 only if each
    // missing slot is documented via a coachNote (stage d).
    const expectedMainCount = 5;
    const shortfall = expectedMainCount - mains.length;

    if (shortfall > 0) {
      expect(
        hasDegradationNote(backChestDay),
        `Slot degradation contract violated: ${shortfall} slot(s) silently dropped. ` +
          `Expected ${expectedMainCount} mains or a traced drop via degradationNotes. ` +
          `Got ${mains.length} mains with no degradationNotes.`
      ).toBe(true);
      expect(backChestDay.degradationNotes!.length).toBeGreaterThanOrEqual(shortfall);
    } else {
      // All slots filled — verify the count is exactly right (no phantom extras).
      expect(mains.length).toBe(expectedMainCount);
    }

    // Uniqueness guard — no exercise should appear twice in the same day.
    const ids = backChestDay.routine.map((item) => item.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /**
   * Stage (a): Tier-cap relaxation
   *
   * With high pain (Shoulders + Knees) the tier ceiling drops to 1. All
   * dumbbell-based row exercises are tier 2+, so the primary path has no
   * candidates for the horizontal-pull slot. Stage (a) must relax the cap and
   * find a lower-tier exercise (e.g. prone-elbow-row, supine-elbow-drive-row)
   * or else proceed to stage (b/c/d). Either way, the slot must not be silently
   * dropped.
   */
  test("stage (a): slot is filled when tier cap is relaxed under high-pain scenario", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      experience: "Advanced",
      painAreas: ["Shoulders", "Knees"],
      equipment: ["none", "dumbbells"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(questionnaire, "degradation-stage-a", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
    });

    program.week.forEach((day) => {
      const mains = mainItems(day);
      expect(mains.length).toBeGreaterThan(0);

      const ids = day.routine.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  /**
   * Stage (b): Ladder-aware substitution
   *
   * With very restricted equipment (none only) and multiple pain areas, the
   * primary slot candidates may be exhausted. A bodyweight exercise from the
   * same movement pattern at any accessible rung must be substituted.
   */
  test("stage (b): ladder-aware substitution fills slot when equipment empties primary candidates", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      experience: "Beginner",
      painAreas: ["Lower back", "Hips"],
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(questionnaire, "degradation-stage-b", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
    });

    program.week.forEach((day) => {
      const mains = mainItems(day);
      expect(mains.length).toBeGreaterThan(0);

      const ids = day.routine.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  /**
   * Stage (c): Corrective fallback
   *
   * Exercises tagged with scap_health / hip_health / knee_health / core_health
   * serve as the corrective fallback when stages (a) and (b) are exhausted.
   * This test uses an extreme pain + equipment constraint to drive the generator
   * toward the corrective path.
   */
  test("stage (c): corrective fallback produces a valid day with no silent drops", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      experience: "Beginner",
      painAreas: ["Shoulders", "Knees", "Hips"],
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(questionnaire, "degradation-stage-c", {
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
    });

    program.week.forEach((day) => {
      const mains = mainItems(day);
      const ids = day.routine.map((item) => item.exerciseId);

      expect(mains.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  /**
   * Stage (d): Last-resort traced drop
   *
   * If the generator drops a slot as a last resort, it must:
   *   1. Not drop it silently — day.degradationNotes must be populated.
   *   2. Guarantee no duplicate exercise IDs.
   *
   * This test asserts that wherever fewer mains are returned than expected, a
   * degradationNote exists explaining the shortfall. The test intentionally does NOT
   * require stage (d) to be triggered (that would constrain the implementation),
   * only that IF a drop occurs it is always traced.
   */
  test("stage (d): any last-resort drop is documented via degradationNotes, never silent", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      experience: "Advanced",
      painAreas: ["Upper back", "Shoulders", "Knees"],
      equipment: ["none", "dumbbells", "foam_roller"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(questionnaire, "degradation-stage-d", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
    });

    const advancedBackChestExpected = 5;
    program.week.forEach((day) => {
      if (day.title === "Back + Chest") {
        const mains = mainItems(day);
        const shortfall = advancedBackChestExpected - mains.length;

        if (shortfall > 0) {
          expect(
            hasDegradationNote(day),
            `Silent drop detected on "${day.title}": expected ${advancedBackChestExpected} mains, ` +
              `got ${mains.length} with no degradationNotes.`
          ).toBe(true);
        }
      }

      const ids = day.routine.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
