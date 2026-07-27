import { describe, expect, test } from "vitest";
import {
  BASELINE_CONSISTENCY_COPY,
  BASELINE_METRIC_SESSION_FLOOR,
  BASELINE_PROGRESSION_SPEED_COPY,
  BASELINE_READINESS_COPY,
  gateReadinessConsistencyCopy,
  metricsHaveBaselineFloor,
} from "@/lib/baselineMetricCopy";

describe("baselineMetricCopy", () => {
  test("floor is 3 completed sessions", () => {
    expect(BASELINE_METRIC_SESSION_FLOOR).toBe(3);
    expect(metricsHaveBaselineFloor(0)).toBe(false);
    expect(metricsHaveBaselineFloor(2)).toBe(false);
    expect(metricsHaveBaselineFloor(3)).toBe(true);
  });

  test("below floor rewrites readiness, consistency, and progression-speed copy", () => {
    expect(
      gateReadinessConsistencyCopy("Training readiness: 40% (Caution)", 0)
    ).toBe(BASELINE_READINESS_COPY);
    expect(gateReadinessConsistencyCopy("Readiness 40%", 1)).toBe(
      BASELINE_READINESS_COPY
    );
    expect(gateReadinessConsistencyCopy("Consistency 0%", 0)).toBe(
      BASELINE_CONSISTENCY_COPY
    );
    expect(
      gateReadinessConsistencyCopy(
        "Readiness 40% and consistency 0% informed progression speed.",
        2
      )
    ).toBe(BASELINE_PROGRESSION_SPEED_COPY);
    expect(
      gateReadinessConsistencyCopy(
        "Consistency 0% with movement quality 55%.",
        0
      )
    ).toBe(BASELINE_CONSISTENCY_COPY);
    expect(
      gateReadinessConsistencyCopy("Consistency 0% • Completion 0%", 1)
    ).toBe(`${BASELINE_CONSISTENCY_COPY} • Completion 0%`);
  });

  test("at or above floor passes numeric copy through unchanged", () => {
    const readiness = "Training readiness: 72% (Good)";
    const consistency = "Consistency 68% • Completion 100%";
    const progression =
      "Readiness 72% and consistency 68% informed progression speed.";
    expect(gateReadinessConsistencyCopy(readiness, 3)).toBe(readiness);
    expect(gateReadinessConsistencyCopy(consistency, 5)).toBe(consistency);
    expect(gateReadinessConsistencyCopy(progression, 3)).toBe(progression);
  });

  test("unrelated copy is never rewritten", () => {
    const line = "Keep clean execution on this week's focus patterns.";
    expect(gateReadinessConsistencyCopy(line, 0)).toBe(line);
  });
});
