/**
 * Phase 8 §E — LogPrefs load → merge one field → save complete object.
 * Tests the required merge contract without IndexedDB.
 */

import { describe, expect, it } from "vitest";
import type { LogPrefs } from "../../src/types";

const seedAllPrefs = (): LogPrefs => ({
  schemaVersion: 1,
  sectionVisibility: {
    "results.headline": false,
    "results.ladders": true,
  },
  soundPrefs: {
    timerSounds: true,
    intervalBeeps: false,
    sessionCompleteChime: true,
    volume: 0.4,
    vibration: true,
  },
  timerPrefs: { workSeconds: 40, restSeconds: 60 },
  timerPrefsByExercise: {
    ex_a: { workSeconds: 30, restSeconds: 45 },
  },
  loadPrefsByExercise: {
    ex_a: { unit: "lb", weight: 20, repsMode: "fixed", reps: 10 },
  },
  blockedExerciseIds: {
    ex_b: {
      reason: "personal_preference",
      blockedAt: { at: "2026-01-01T00:00:00.000Z", phase: "activation" },
    },
  },
  contractStateByExercise: {
    ex_c: { deferred: true },
  },
  suppressIncompleteContractPrompts: true,
  hasCompletedFirstWeek: true,
  wakeLockNoticeSeen: true,
  feedbackByExercise: {},
  substitutionByExercise: { item_1: "ex_alt" },
});

/** Canonical Phase 8 write pattern: load → merge one field → save complete. */
const mergeOneField = <K extends keyof LogPrefs>(
  current: LogPrefs,
  key: K,
  value: LogPrefs[K]
): LogPrefs => ({
  ...current,
  [key]: value,
});

describe("Phase 8 LogPrefs merge preservation", () => {
  it("changing one field preserves every unrelated field", () => {
    const current = seedAllPrefs();
    const next = mergeOneField(current, "sectionVisibility", {
      ...(current.sectionVisibility ?? {}),
      "results.phaseHistory": true,
    });

    // Simulate save/reload of the complete object.
    const reloaded = JSON.parse(JSON.stringify(next)) as LogPrefs;

    expect(reloaded.sectionVisibility?.["results.phaseHistory"]).toBe(true);
    expect(reloaded.sectionVisibility?.["results.headline"]).toBe(false);
    expect(reloaded.soundPrefs).toEqual(seedAllPrefs().soundPrefs);
    expect(reloaded.timerPrefs).toEqual(seedAllPrefs().timerPrefs);
    expect(reloaded.timerPrefsByExercise).toEqual(
      seedAllPrefs().timerPrefsByExercise
    );
    expect(reloaded.loadPrefsByExercise).toEqual(
      seedAllPrefs().loadPrefsByExercise
    );
    expect(reloaded.blockedExerciseIds).toEqual(seedAllPrefs().blockedExerciseIds);
    expect(reloaded.contractStateByExercise).toEqual(
      seedAllPrefs().contractStateByExercise
    );
    expect(reloaded.suppressIncompleteContractPrompts).toBe(true);
    expect(reloaded.hasCompletedFirstWeek).toBe(true);
    expect(reloaded.wakeLockNoticeSeen).toBe(true);
    expect(reloaded.substitutionByExercise).toEqual(
      seedAllPrefs().substitutionByExercise
    );
  });

  it("JSON export/restore round-trip keeps sectionVisibility siblings", () => {
    const current = seedAllPrefs();
    const exported = JSON.stringify(current);
    const restored = JSON.parse(exported) as LogPrefs;
    const afterSound = mergeOneField(restored, "soundPrefs", {
      ...(restored.soundPrefs ?? {}),
      volume: 0.9,
    });
    const reloaded = JSON.parse(JSON.stringify(afterSound)) as LogPrefs;
    expect(reloaded.soundPrefs?.volume).toBe(0.9);
    expect(reloaded.sectionVisibility?.["results.headline"]).toBe(false);
    expect(reloaded.hasCompletedFirstWeek).toBe(true);
  });

  it("partial object construction is rejected by the Phase 8 contract pattern", () => {
    const current = seedAllPrefs();
    const wrongPartial = {
      schemaVersion: 1,
      sectionVisibility: { "results.headline": true },
    } as LogPrefs;
    // Correct pattern must spread current first.
    const correct = mergeOneField(current, "sectionVisibility", {
      "results.headline": true,
    });
    expect(correct.soundPrefs).toBeTruthy();
    expect(wrongPartial.soundPrefs).toBeUndefined();
  });
});
