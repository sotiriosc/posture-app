import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  areTrainingRecordsEquivalent,
  resolveActiveProgramFromList,
  shouldUseRemoteTrainingRecord,
} from "@/lib/trainingStateModel";
import {
  getTrainingSyncStatus,
  loadTrainingSnapshotWithStatus,
  pushTrainingPatchWithStatus,
} from "@/lib/trainingSyncClient";
import type { AppState } from "@/lib/appState";
import type { Program, SessionRecord } from "@/lib/types";

const buildProgram = (
  id: string,
  updatedAt: string,
  deletedAt: string | null = null
): Program => ({
  id,
  userId: null,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt,
  goalTrack: "Improve posture",
  daysPerWeek: 4,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Phase 1",
  weekIndex: 1,
  cycleIndex: 1,
  totalWeekIndex: 1,
  week: [],
  source: "local",
  deletedAt,
});

const buildSession = (id: string): SessionRecord => ({
  id,
  userId: null,
  startedAt: "2026-04-05T12:00:00.000Z",
  completedAt: null,
  createdAt: "2026-04-05T12:00:00.000Z",
  updatedAt: "2026-04-05T12:00:00.000Z",
  routineId: "program-active",
  durationSec: null,
  notes: null,
  source: "local",
  deletedAt: null,
});

describe("training state source-of-truth flow", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("active program id wins over a newer latest program", () => {
    const active = buildProgram("program-active", "2026-04-02T00:00:00.000Z");
    const newer = buildProgram("program-newer", "2026-04-05T00:00:00.000Z");
    const appState: AppState = {
      activeProgramId: active.id,
      programId: newer.id,
      updatedAt: Date.parse("2026-04-05T00:00:00.000Z"),
    };

    const resolution = resolveActiveProgramFromList([newer, active], appState);

    expect(resolution.source).toBe("active");
    expect(resolution.programId).toBe(active.id);
    expect(resolution.program).toBe(active);
  });

  test("stale active program id falls back to the latest available program", () => {
    const older = buildProgram("program-old", "2026-04-02T00:00:00.000Z");
    const newer = buildProgram("program-new", "2026-04-06T00:00:00.000Z");
    const appState: AppState = {
      activeProgramId: "program-missing",
      updatedAt: Date.parse("2026-04-06T00:00:00.000Z"),
    };

    const resolution = resolveActiveProgramFromList([older, newer], appState);

    expect(resolution.source).toBe("latest");
    expect(resolution.programId).toBe(newer.id);
    expect(resolution.staleActiveProgramId).toBe("program-missing");
  });

  test("server hydration keeps newer local records and accepts newer remote records", () => {
    const local = { id: "session-1", updatedAt: "2026-04-05T12:00:00.000Z" };
    const staleRemote = {
      id: "session-1",
      updatedAt: "2026-04-05T11:00:00.000Z",
    };
    const newerRemote = {
      id: "session-1",
      updatedAt: "2026-04-05T13:00:00.000Z",
    };

    expect(shouldUseRemoteTrainingRecord(staleRemote, local)).toBe(false);
    expect(shouldUseRemoteTrainingRecord(newerRemote, local)).toBe(true);
    expect(
      shouldUseRemoteTrainingRecord(staleRemote, local, "2026-04-05T14:00:00.000Z")
    ).toBe(true);
  });

  test("snapshot load exposes sync failure status instead of silently swallowing it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({
          ok: false,
          authenticated: true,
          error: "snapshot down",
        }),
      }))
    );

    const result = await loadTrainingSnapshotWithStatus();

    expect(result.ok).toBe(false);
    expect(result.error).toBe("snapshot down");
    expect(getTrainingSyncStatus()).toMatchObject({
      state: "error",
      authenticated: true,
      lastError: "snapshot down",
    });
  });

  test("empty patches are skipped before network sync", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const pushed = await pushTrainingPatchWithStatus({ sessions: [] });

    expect(pushed).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("unauthenticated patch is not treated as a data-loss sync error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({ ok: false, error: "Not authenticated." }),
      }))
    );

    const pushed = await pushTrainingPatchWithStatus({
      sessions: [buildSession("session-unauth")],
    });

    expect(pushed).toBe(false);
    expect(getTrainingSyncStatus()).toMatchObject({
      state: "unauthenticated",
      authenticated: false,
      lastError: null,
    });
  });

  test("snapshot loads coalesce while one request is already in flight", async () => {
    const fetchMock = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            authenticated: true,
            snapshot: { sessions: [buildSession("session-1")] },
          }),
        }) as Response
    );
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      loadTrainingSnapshotWithStatus({ force: true }),
      loadTrainingSnapshotWithStatus(),
    ]);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("record equivalence can ignore timestamp-only churn", () => {
    const base = buildProgram("program-a", "2026-04-02T00:00:00.000Z");
    const timestampOnly = {
      ...base,
      updatedAt: "2026-04-03T00:00:00.000Z",
    };
    const changedCompletion = {
      ...timestampOnly,
      weekIndex: 2,
    };

    expect(
      areTrainingRecordsEquivalent(base, timestampOnly, { ignoreUpdatedAt: true })
    ).toBe(true);
    expect(
      areTrainingRecordsEquivalent(base, changedCompletion, { ignoreUpdatedAt: true })
    ).toBe(false);
  });
});
