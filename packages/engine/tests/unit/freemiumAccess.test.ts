import { describe, expect, it } from "vitest";
import {
  canAccessWorkoutToday,
  deriveHasCompletedFirstWeek,
  normalizeSessionsPerWeek,
} from "@/lib/freemiumAccess";

describe("freemiumAccess (Phase 6j Commit 1 — Option B)", () => {
  it("normalizes sessions per week to 3/4/5", () => {
    expect(normalizeSessionsPerWeek(3)).toBe(3);
    expect(normalizeSessionsPerWeek(4)).toBe(4);
    expect(normalizeSessionsPerWeek(5)).toBe(5);
    expect(normalizeSessionsPerWeek(2)).toBe(3);
    expect(normalizeSessionsPerWeek(null)).toBe(3);
  });

  it("fresh free user: all days of week 1 accessible", () => {
    expect(
      canAccessWorkoutToday({
        isFreePlan: true,
        hasCompletedFirstWeek: false,
        dayIndex: 0,
      })
    ).toBe(true);
    expect(
      canAccessWorkoutToday({
        isFreePlan: true,
        hasCompletedFirstWeek: false,
        dayIndex: 2,
      })
    ).toBe(true);
  });

  it("free user after first week: Day 1 open, Days 2+ locked", () => {
    expect(
      canAccessWorkoutToday({
        isFreePlan: true,
        hasCompletedFirstWeek: true,
        dayIndex: 0,
      })
    ).toBe(true);
    expect(
      canAccessWorkoutToday({
        isFreePlan: true,
        hasCompletedFirstWeek: true,
        dayIndex: 1,
      })
    ).toBe(false);
  });

  it("Pro / non-free: all days always accessible", () => {
    expect(
      canAccessWorkoutToday({
        isFreePlan: false,
        hasCompletedFirstWeek: true,
        dayIndex: 3,
      })
    ).toBe(true);
  });

  it("downgrade from Pro to Free after first week locks Days 2+", () => {
    expect(
      canAccessWorkoutToday({
        isFreePlan: true,
        hasCompletedFirstWeek: true,
        dayIndex: 2,
      })
    ).toBe(false);
  });

  it("derives first-week complete from distinct day coverage", () => {
    expect(
      deriveHasCompletedFirstWeek({
        completedDayIndexes: [0, 1],
        sessionsPerWeek: 3,
      })
    ).toBe(false);
    expect(
      deriveHasCompletedFirstWeek({
        completedDayIndexes: [0, 1, 2],
        sessionsPerWeek: 3,
      })
    ).toBe(true);
    expect(
      deriveHasCompletedFirstWeek({
        completedDayIndexes: [0, 1, 2, 3],
        sessionsPerWeek: 4,
      })
    ).toBe(true);
  });

  it("persisted flag latches true across incomplete day sets", () => {
    expect(
      deriveHasCompletedFirstWeek({
        completedDayIndexes: [],
        sessionsPerWeek: 3,
        persistedFlag: true,
      })
    ).toBe(true);
  });
});
