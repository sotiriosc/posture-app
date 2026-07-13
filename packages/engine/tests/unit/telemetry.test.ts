import { describe, expect, test } from "vitest";
import {
  clearSessionDropoffTelemetry,
  listSessionDropoffTelemetry,
  saveSessionDropoffTelemetry,
} from "@/lib/telemetry";

const memoryStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
};

describe("telemetry", () => {
  test("records and lists dropoff events", () => {
    const store = memoryStorage();
    const saved = saveSessionDropoffTelemetry(
      {
        sessionId: "s1",
        programId: "p1",
        dayIndex: 1,
        exerciseId: "dumbbell-rows",
        exerciseIndex: 2,
        totalExercises: 10,
        progressPct: 42.4,
        reason: "exit_button",
      },
      store
    );
    expect(saved).not.toBeNull();
    const items = listSessionDropoffTelemetry(store);
    expect(items).toHaveLength(1);
    expect(items[0]?.progressPct).toBe(42);
    expect(items[0]?.reason).toBe("exit_button");
  });

  test("clear removes all events", () => {
    const store = memoryStorage();
    saveSessionDropoffTelemetry(
      {
        sessionId: "s1",
        programId: null,
        dayIndex: null,
        exerciseId: null,
        exerciseIndex: 0,
        totalExercises: 6,
        progressPct: 10,
        reason: "pagehide",
      },
      store
    );
    clearSessionDropoffTelemetry(store);
    expect(listSessionDropoffTelemetry(store)).toEqual([]);
  });
});
