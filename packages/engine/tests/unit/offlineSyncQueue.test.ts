import { afterEach, describe, expect, test, vi } from "vitest";
import {
  drainOfflineSyncQueue,
  getOfflineSyncQueueLength,
  pushTrainingPatch,
} from "@/lib/trainingSyncClient";

/**
 * Phase 6f, Commit 2 — offline mode for the current workout.
 *
 * `pushTrainingPatch` is what every local save path (logStore.ts) calls
 * after writing to IndexedDB. Before this queue existed, a patch that failed
 * to reach the server (offline, or a flaky basement connection) was dropped
 * silently — the local write always succeeded, but the server mirror never
 * did, and nothing ever retried once connectivity returned. These tests
 * exercise the queue directly against a fake localStorage/navigator, the
 * same pattern as accountIsolation.test.ts / resetAppData.test.ts.
 */

const installBrowserStubs = (initialOnline: boolean) => {
  const store = new Map<string, string>();
  vi.stubGlobal("window", { addEventListener: vi.fn(), dispatchEvent: vi.fn() });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
  });
  vi.stubGlobal("navigator", { onLine: initialOnline });
  return { store };
};

describe("offline sync queue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("a patch that fails on a network error is queued, then delivered once the network returns", async () => {
    installBrowserStubs(true);
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const delivered = await pushTrainingPatch({
      sessions: [
        {
          id: "session-offline-1",
          userId: null,
          startedAt: "2026-07-24T06:00:00.000Z",
          completedAt: "2026-07-24T06:30:00.000Z",
          createdAt: "2026-07-24T06:30:00.000Z",
          updatedAt: "2026-07-24T06:30:00.000Z",
          routineId: "program-active",
          durationSec: 1800,
          notes: null,
          source: "local",
          deletedAt: null,
        },
      ],
    });

    expect(delivered).toBe(false);
    expect(getOfflineSyncQueueLength()).toBe(1);

    await drainOfflineSyncQueue();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getOfflineSyncQueueLength()).toBe(0);
  });

  test("drainOfflineSyncQueue is a no-op while the browser reports offline", async () => {
    installBrowserStubs(false);
    const fetchMock = vi.fn().mockRejectedValue(new Error("network error"));
    vi.stubGlobal("fetch", fetchMock);

    await pushTrainingPatch({ prefs: { workSeconds: 45 } as never });
    expect(getOfflineSyncQueueLength()).toBe(1);

    fetchMock.mockClear();
    await drainOfflineSyncQueue();

    // navigator.onLine is false, so drain must not even attempt a fetch.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getOfflineSyncQueueLength()).toBe(1);
  });

  test("an unauthenticated (401) failure is not queued for retry", async () => {
    installBrowserStubs(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({ ok: false, error: "Not authenticated." }),
      }))
    );

    const delivered = await pushTrainingPatch({
      prefs: { workSeconds: 45 } as never,
    });

    expect(delivered).toBe(false);
    expect(getOfflineSyncQueueLength()).toBe(0);
  });
});
