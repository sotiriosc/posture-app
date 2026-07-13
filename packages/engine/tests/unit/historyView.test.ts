import { describe, expect, test } from "vitest";
import { formatHistorySchemaRow, getHistoryDeltaPills } from "@/lib/historyView";
import type { ExerciseLog } from "@/lib/types";

const baseLog = (overrides: Partial<ExerciseLog>): ExerciseLog => ({
  id: "log-1",
  userId: null,
  sessionId: "session-1",
  exerciseId: "dumbbell-rows",
  createdAt: "2026-02-12T00:00:00.000Z",
  updatedAt: "2026-02-12T00:00:00.000Z",
  loadType: "weighted",
  unit: "lb",
  weight: 50,
  reps: 8,
  repsBySet: null,
  setsPlanned: 2,
  setsCompleted: 2,
  durationSec: null,
  workSecondsUsed: 75,
  restSecondsUsed: 70,
  rpe: null,
  felt: "easy",
  notes: null,
  computedVolume: null,
  source: "local",
  deletedAt: null,
  ...overrides,
});

describe("historyView", () => {
  test("formats fixed schema row for weighted logs", () => {
    const row = formatHistorySchemaRow(baseLog({}));
    expect(row).toContain("2026-02-12");
    expect(row).toContain("50lb");
    expect(row).toContain("8 reps x 2 sets");
    expect(row).toContain("75s/70s");
    expect(row).toContain("easy");
  });

  test("formats fixed schema row for timed logs", () => {
    const row = formatHistorySchemaRow(
      baseLog({
        loadType: "timed",
        unit: null,
        weight: null,
        reps: null,
        durationSec: 60,
        workSecondsUsed: 60,
        restSecondsUsed: 30,
        felt: "moderate",
      })
    );
    expect(row).toContain("timed");
    expect(row).toContain("2 sets");
    expect(row).toContain("60s/30s");
    expect(row).toContain("moderate");
  });

  test("computes delta pills for weight and reps", () => {
    const prev = baseLog({ weight: 45, reps: 8 });
    const next = baseLog({ weight: 50, reps: 10 });
    const pills = getHistoryDeltaPills(next, prev);
    expect(pills).toContain("+5 lb wt");
    expect(pills).toContain("+2 reps");
  });
});
