import { describe, expect, test } from "vitest";
import {
  buildSessionTimerContextId,
  calculatePrescribedTimerDuration,
  clampTimerRemaining,
  deriveRemainingFromEndsAt,
  isSameSessionTimerContext,
  isStaleSessionTimerUpdate,
  SESSION_TIMER_CALCULATION_VERSION,
} from "@/lib/sessionSetTimer";
import type { ProgramRoutineItem } from "@/lib/types";

const item = (overrides: Partial<ProgramRoutineItem> = {}): ProgramRoutineItem =>
  ({
    exerciseId: "band-row",
    section: "main",
    sets: 3,
    reps: "8-12",
    loadType: "bodyweight",
    ...overrides,
  }) as ProgramRoutineItem;

describe("session set timer domain", () => {
  test("context id is stable for same workout identity", () => {
    const left = buildSessionTimerContextId({
      sessionId: "s1",
      dayIndex: 0,
      itemId: "Day 1-band-row",
      exerciseId: "band-row",
      section: "main",
    });
    const right = buildSessionTimerContextId({
      sessionId: "s1",
      dayIndex: 0,
      itemId: "Day 1-band-row",
      exerciseId: "band-row",
      section: "main",
    });
    expect(left).toBe(right);
    expect(isSameSessionTimerContext(left, right)).toBe(true);
  });

  test("substitution changes context id", () => {
    const before = buildSessionTimerContextId({
      sessionId: "s1",
      dayIndex: 0,
      itemId: "Day 1-band-row",
      exerciseId: "band-row",
      section: "main",
    });
    const after = buildSessionTimerContextId({
      sessionId: "s1",
      dayIndex: 0,
      itemId: "Day 1-band-row",
      exerciseId: "cable-row",
      section: "main",
    });
    expect(before).not.toBe(after);
    expect(isStaleSessionTimerUpdate(after, before)).toBe(true);
  });

  test("prescribed duration is deterministic for fixed inputs", () => {
    const first = calculatePrescribedTimerDuration(item());
    const second = calculatePrescribedTimerDuration(item());
    expect(first).toEqual(second);
    expect(first.calculationVersion).toBe(SESSION_TIMER_CALCULATION_VERSION);
    expect(first.workSeconds).toBeGreaterThan(0);
    expect(first.restSeconds).toBeGreaterThan(0);
    expect(first.reasonCodes.length).toBeGreaterThan(0);
  });

  test("bounds helpers reject NaN and keep finite remaining", () => {
    expect(clampTimerRemaining(Number.NaN)).toBe(0);
    expect(clampTimerRemaining(12.9)).toBe(12);
    expect(clampTimerRemaining(-3)).toBe(-3);
    expect(deriveRemainingFromEndsAt(1_000, 2_500)).toBe(-1);
    expect(deriveRemainingFromEndsAt(null, 1_000)).toBeNull();
  });

  test("stale updates without context id are rejected when active context exists", () => {
    expect(isStaleSessionTimerUpdate("ctx-a", undefined)).toBe(true);
    expect(isStaleSessionTimerUpdate("ctx-a", "ctx-a")).toBe(false);
    expect(isStaleSessionTimerUpdate(null, "ctx-a")).toBe(false);
  });
});
