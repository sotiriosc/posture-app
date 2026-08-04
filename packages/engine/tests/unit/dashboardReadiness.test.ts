import { describe, expect, test } from "vitest";
import {
  clampDisplayPercent,
  computeDashboardReadinessScore,
  formatTrainingReadinessChip,
  metric01ToDisplayPercent,
  readinessLabelFromScore,
} from "@/lib/dashboardReadiness";

const NOW = Date.parse("2026-08-04T16:00:00.000Z");

describe("dashboard readiness display invariant", () => {
  test("zero stays zero with Caution label", () => {
    expect(clampDisplayPercent(0)).toBe(0);
    expect(readinessLabelFromScore(0)).toBe("Caution");
    expect(formatTrainingReadinessChip(0)).toBe("Training readiness: 0% (Caution)");
  });

  test("mid-range maps to Good", () => {
    expect(clampDisplayPercent(62)).toBe(62);
    expect(readinessLabelFromScore(62)).toBe("Good");
    expect(formatTrainingReadinessChip(62)).toBe("Training readiness: 62% (Good)");
  });

  test("upper bound maps to High", () => {
    expect(clampDisplayPercent(100)).toBe(100);
    expect(readinessLabelFromScore(100)).toBe("High");
    expect(formatTrainingReadinessChip(100)).toBe("Training readiness: 100% (High)");
  });

  test("excessive penalties never produce a negative displayed score", () => {
    const score = computeDashboardReadinessScore({
      nowMs: NOW,
      completedSessions: [
        { completedAt: "2026-08-04T12:00:00.000Z" },
        { completedAt: "2026-08-03T12:00:00.000Z" },
        { completedAt: "2026-08-02T12:00:00.000Z" },
      ],
      recentLogs: [
        { createdAt: "2026-08-04T15:00:00.000Z", painLevel: "moderate", felt: "pain" },
      ],
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    // 75 -10 (recent <18h) -10 (≥2 sessions in 3d) -15 (pain today) = 40
    expect(score).toBe(40);
    expect(readinessLabelFromScore(score)).toBe("Caution");
  });

  test("missing/partial state falls back to base score without NaN", () => {
    const score = computeDashboardReadinessScore({
      nowMs: NOW,
      completedSessions: [{ completedAt: null, updatedAt: "not-a-date" }],
      recentLogs: [{ createdAt: undefined, painLevel: "none" }],
    });
    expect(score).toBe(75);
    expect(formatTrainingReadinessChip(score)).toContain("75%");
  });

  test("no values below 0 or above 100 from corrupt inputs", () => {
    expect(clampDisplayPercent(-31)).toBe(0);
    expect(clampDisplayPercent(-128)).toBe(0);
    expect(clampDisplayPercent(147)).toBe(100);
    expect(clampDisplayPercent(Number.NaN)).toBe(0);
    expect(metric01ToDisplayPercent(-0.31)).toBe(0);
    expect(metric01ToDisplayPercent(1.61)).toBe(100);
    expect(metric01ToDisplayPercent(undefined)).toBeNull();
  });

  test("label always agrees with the clamped score", () => {
    expect(readinessLabelFromScore(-40)).toBe("Caution");
    expect(readinessLabelFromScore(54.4)).toBe("Caution");
    expect(readinessLabelFromScore(55)).toBe("Good");
    expect(readinessLabelFromScore(79.4)).toBe("Good");
    expect(readinessLabelFromScore(80)).toBe("High");
    expect(readinessLabelFromScore(999)).toBe("High");
  });

  test("continue-session path returns fixed mid readiness", () => {
    expect(
      computeDashboardReadinessScore({
        nowMs: NOW,
        completedSessions: [],
        recentLogs: [],
        continueSession: true,
      })
    ).toBe(70);
  });
});
