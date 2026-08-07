/**
 * Phase 7B §6 — Real persistence round trip via sessionDraftStore + logStore prefs.
 */

/** @vitest-environment jsdom */

import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExerciseLog, LogPrefs, SessionRecord } from "@/lib/types";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type SessionDraft,
} from "@/lib/sessionDraftStore";
import {
  createSession,
  init,
  listExerciseLogsBySessionIds,
  loadPrefs,
  saveExerciseLog,
  savePrefs,
} from "@/lib/logStore";

vi.mock("@/lib/trainingSyncClient", () => ({
  loadTrainingSnapshot: vi.fn(async () => null),
  loadTrainingSnapshotWithStatus: vi.fn(async () => ({
    snapshot: null,
    status: "skipped",
  })),
  pushTrainingPatch: vi.fn(async () => undefined),
}));

const SESSION_ID = "p7b-persist-session";
const PROGRAM_ID = "p7b-persist-program";
const ITEM_ID = "day0-main-0";
const ORIGINAL_ID = "db-rdl";
const SWAP_ID = "db-hip-thrust";
const EASIER_ID = "hip-hinge-good-morning-bodyweight";

const baseDraft = (overrides: Partial<SessionDraft> = {}): SessionDraft => ({
  sessionId: SESSION_ID,
  programId: PROGRAM_ID,
  dayIndex: 0,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  entries: {
    completedSets: {},
    selectedSets: {},
    weightByExercise: {},
    repsByExercise: {},
    repsBySetByExercise: {},
    unitByExercise: {},
    notesByExercise: {},
    substitutionByItemId: {},
    feedbackByExercise: {},
  },
  updatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(async () => {
  await clearDraft();
  await init();
  await savePrefs({ schemaVersion: 2 });
});

describe("Phase 7B presentation persistence round trip", () => {
  it("persists pain swap through draft reload and keeps feedback history", async () => {
    // active exercise → discomfort → swap → write draft
    const draft = baseDraft({
      entries: {
        completedSets: { [ITEM_ID]: [false, false] },
        selectedSets: { [ITEM_ID]: 2 },
        weightByExercise: { [ORIGINAL_ID]: "40" },
        repsByExercise: { [ORIGINAL_ID]: "8" },
        repsBySetByExercise: {},
        unitByExercise: { [ORIGINAL_ID]: "lb" },
        notesByExercise: {},
        substitutionByItemId: { [ITEM_ID]: SWAP_ID },
        feedbackByExercise: {
          [ORIGINAL_ID]: {
            rating: "pain",
            painLocation: "lower back",
            notes: "sharp on hinge",
          },
        },
      },
    });
    await saveDraft(draft);

    // destroy/reload
    const reloaded = await loadDraft(SESSION_ID);
    expect(reloaded).toBeTruthy();
    expect(reloaded!.entries.substitutionByItemId?.[ITEM_ID]).toBe(SWAP_ID);
    expect(reloaded!.entries.feedbackByExercise[ORIGINAL_ID]?.rating).toBe(
      "pain"
    );

    // complete → feedback history readable
    const session: SessionRecord = {
      id: SESSION_ID,
      userId: null,
      routineId: PROGRAM_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationSec: 1800,
      notes: "dayIndex:0",
      source: "local",
      deletedAt: null,
    };
    await createSession(session);

    const log: ExerciseLog = {
      id: "log-swap-1",
      userId: null,
      sessionId: SESSION_ID,
      exerciseId: SWAP_ID,
      originalExerciseId: ORIGINAL_ID,
      substitutedExerciseId: SWAP_ID,
      programId: PROGRAM_ID,
      dayIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loadType: "weighted",
      unit: "lb",
      weight: 40,
      reps: 8,
      repsBySet: null,
      setsPlanned: 2,
      setsCompleted: 2,
      durationSec: null,
      rpe: null,
      felt: "pain",
      painLevel: "moderate",
      painLocation: "lower back",
      notes: "sharp on hinge",
      computedVolume: null,
      source: "local",
      deletedAt: null,
    };
    await saveExerciseLog(log);

    const history = await listExerciseLogsBySessionIds([SESSION_ID]);
    expect(history.some((h) => h.substitutedExerciseId === SWAP_ID)).toBe(true);
    expect(history.some((h) => h.felt === "pain")).toBe(true);
  });

  it("covers pain-only, easier variation, safe skip, refresh/resume", async () => {
    // pain report only
    await saveDraft(
      baseDraft({
        sessionId: "p7b-pain-only",
        entries: {
          ...baseDraft().entries,
          feedbackByExercise: {
            [ORIGINAL_ID]: { rating: "pain", painLocation: "hips", notes: null },
          },
        },
      })
    );
    const painOnly = await loadDraft("p7b-pain-only");
    expect(painOnly?.entries.feedbackByExercise[ORIGINAL_ID]?.rating).toBe(
      "pain"
    );
    expect(painOnly?.entries.substitutionByItemId?.[ITEM_ID]).toBeUndefined();

    // easier variation
    await saveDraft(
      baseDraft({
        sessionId: "p7b-easier",
        entries: {
          ...baseDraft().entries,
          substitutionByItemId: { [ITEM_ID]: EASIER_ID },
          feedbackByExercise: {
            [ORIGINAL_ID]: { rating: "hard", notes: "modified easier" },
          },
        },
      })
    );
    const easier = await loadDraft("p7b-easier");
    expect(easier?.entries.substitutionByItemId?.[ITEM_ID]).toBe(EASIER_ID);

    // safe skip — advance index, keep pain feedback
    await saveDraft(
      baseDraft({
        sessionId: "p7b-skip",
        currentExerciseIndex: 1,
        entries: {
          ...baseDraft().entries,
          feedbackByExercise: {
            [ORIGINAL_ID]: { rating: "pain", painLocation: "knees", notes: "skipped" },
          },
          completedSets: { [ITEM_ID]: [false, false] },
        },
      })
    );
    const skipped = await loadDraft("p7b-skip");
    expect(skipped?.currentExerciseIndex).toBe(1);
    expect(skipped?.entries.feedbackByExercise[ORIGINAL_ID]?.rating).toBe(
      "pain"
    );

    // refresh/resume — latest draft wins
    const resumed = await loadDraft();
    expect(resumed).toBeTruthy();
    expect(resumed!.sessionId).toBeTruthy();
  });

  it("personal block and unblock survive prefs storage round trip", async () => {
    const blocked: LogPrefs = {
      schemaVersion: 2,
      blockedExerciseIds: {
        [ORIGINAL_ID]: {
          reason: "personal_preference",
          blockedAt: { phase: "activation", sessionCount: 1 },
        },
      },
      contractStateByExercise: {
        [ORIGINAL_ID]: {
          deferred: true,
          probation: false,
          sacrificedAt: { phase: "activation", sessionCount: 1 },
          autoSacrificed: false,
        },
      },
    };
    await savePrefs(blocked);
    const loaded = await loadPrefs();
    expect(loaded.blockedExerciseIds?.[ORIGINAL_ID]?.reason).toBe(
      "personal_preference"
    );
    expect(loaded.contractStateByExercise?.[ORIGINAL_ID]?.deferred).toBe(true);

    // unblock/reset
    const cleared: LogPrefs = {
      ...loaded,
      blockedExerciseIds: {},
      contractStateByExercise: {
        ...(loaded.contractStateByExercise ?? {}),
        [ORIGINAL_ID]: {
          ...(loaded.contractStateByExercise?.[ORIGINAL_ID] ?? {
            deferred: false,
            probation: false,
            autoSacrificed: false,
          }),
          deferred: false,
        },
      },
    };
    await savePrefs(cleared);
    const after = await loadPrefs();
    expect(Object.keys(after.blockedExerciseIds ?? {})).not.toContain(
      ORIGINAL_ID
    );
    expect(after.contractStateByExercise?.[ORIGINAL_ID]?.deferred).toBe(false);
  });

  it("future-session feedback summary remains readable from stored logs", async () => {
    const sessionId = "p7b-future-feedback";
    await createSession({
      id: sessionId,
      userId: null,
      routineId: PROGRAM_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationSec: 1200,
      notes: "dayIndex:0",
      source: "local",
      deletedAt: null,
    });
    await saveExerciseLog({
      id: "log-future-1",
      userId: null,
      sessionId,
      exerciseId: ORIGINAL_ID,
      originalExerciseId: ORIGINAL_ID,
      substitutedExerciseId: null,
      programId: PROGRAM_ID,
      dayIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loadType: "weighted",
      unit: "lb",
      weight: 35,
      reps: 8,
      repsBySet: null,
      setsPlanned: 2,
      setsCompleted: 2,
      durationSec: null,
      rpe: 7,
      felt: "hard",
      painLevel: "mild",
      painLocation: "lower back",
      notes: "future adaptation input",
      computedVolume: null,
      source: "local",
      deletedAt: null,
    });
    const logs = await listExerciseLogsBySessionIds([sessionId]);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.painLevel).toBe("mild");
    expect(logs[0]?.notes).toContain("future adaptation");
  });
});
