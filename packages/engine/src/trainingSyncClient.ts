"use client";

import type { TrainingSnapshot } from "@/lib/trainingStateModel";
import { stableTrainingStringify } from "@/lib/trainingStateModel";
import { logTrainingSync } from "@/lib/trainingSyncDebug";

export type { TrainingSnapshot } from "@/lib/trainingStateModel";

export type TrainingSyncState =
  | "idle"
  | "syncing"
  | "synced"
  | "unauthenticated"
  | "error";

export type TrainingSyncStatus = {
  state: TrainingSyncState;
  lastAttemptAt: number | null;
  lastSyncedAt: number | null;
  lastError: string | null;
  authenticated: boolean | null;
};

export type TrainingSnapshotLoadResult = {
  ok: boolean;
  authenticated: boolean;
  snapshot: TrainingSnapshot | null;
  error: string | null;
  status: number | null;
};

const listeners = new Set<() => void>();
const SNAPSHOT_LOAD_CACHE_MS = 5_000;
const PATCH_DEDUPE_WINDOW_MS = 4_000;
let syncStatus: TrainingSyncStatus = {
  state: "idle",
  lastAttemptAt: null,
  lastSyncedAt: null,
  lastError: null,
  authenticated: null,
};
let snapshotLoadPromise: Promise<TrainingSnapshotLoadResult> | null = null;
let lastSnapshotLoad:
  | { loadedAt: number; result: TrainingSnapshotLoadResult }
  | null = null;
const inFlightPatchBySignature = new Map<string, Promise<boolean>>();
let lastSuccessfulPatchSignature: string | null = null;
let lastSuccessfulPatchAt = 0;

const emitSyncStatus = (partial: Partial<TrainingSyncStatus>) => {
  syncStatus = {
    ...syncStatus,
    ...partial,
  };
  listeners.forEach((listener) => listener());
};

export const getTrainingSyncStatus = () => syncStatus;

export const subscribeTrainingSyncStatus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const statusMessageFromPayload = (
  payload: { error?: string } | null,
  fallback: string
) => payload?.error || fallback;

const fetchTrainingState = async (init?: RequestInit) => {
  const response = await fetch("/api/training/state", {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return response;
};

const patchHasPayload = (patch: TrainingSnapshot) =>
  Object.prototype.hasOwnProperty.call(patch, "questionnaire") ||
  Object.prototype.hasOwnProperty.call(patch, "assessment") ||
  Object.prototype.hasOwnProperty.call(patch, "prefs") ||
  Boolean(patch.programs?.length) ||
  Boolean(patch.programProgress?.length) ||
  Boolean(patch.sessions?.length) ||
  Boolean(patch.exerciseLogs?.length);

const summarizePatch = (patch: TrainingSnapshot) => ({
  questionnaire: Object.prototype.hasOwnProperty.call(patch, "questionnaire"),
  assessment: Object.prototype.hasOwnProperty.call(patch, "assessment"),
  prefs: Object.prototype.hasOwnProperty.call(patch, "prefs"),
  programs: patch.programs?.length ?? 0,
  programProgress: patch.programProgress?.length ?? 0,
  sessions: patch.sessions?.length ?? 0,
  exerciseLogs: patch.exerciseLogs?.length ?? 0,
});

const invalidateSnapshotCache = () => {
  lastSnapshotLoad = null;
};

export const loadTrainingSnapshotWithStatus =
  async (options: { force?: boolean } = {}): Promise<TrainingSnapshotLoadResult> => {
    const now = Date.now();
    if (
      !options.force &&
      lastSnapshotLoad &&
      now - lastSnapshotLoad.loadedAt < SNAPSHOT_LOAD_CACHE_MS
    ) {
      logTrainingSync("training-sync", "snapshot cache hit");
      return lastSnapshotLoad.result;
    }
    if (!options.force && snapshotLoadPromise) {
      logTrainingSync("training-sync", "snapshot request joined");
      return snapshotLoadPromise;
    }

    emitSyncStatus({
      state: "syncing",
      lastAttemptAt: now,
      lastError: null,
    });
    snapshotLoadPromise = (async () => {
      const response = await fetchTrainingState({ method: "GET" });
      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            authenticated?: boolean;
            snapshot?: TrainingSnapshot | null;
            error?: string;
          }
        | null;
      if (response.ok && payload?.ok && payload.authenticated) {
        emitSyncStatus({
          state: "synced",
          authenticated: true,
          lastSyncedAt: Date.now(),
          lastError: null,
        });
        const result = {
          ok: true,
          authenticated: true,
          snapshot: payload.snapshot ?? null,
          error: null,
          status: response.status,
        };
        lastSnapshotLoad = { loadedAt: Date.now(), result };
        return result;
      }
      if (response.ok && payload?.ok && payload.authenticated === false) {
        emitSyncStatus({
          state: "unauthenticated",
          authenticated: false,
          lastError: null,
        });
        const result = {
          ok: true,
          authenticated: false,
          snapshot: null,
          error: null,
          status: response.status,
        };
        lastSnapshotLoad = { loadedAt: Date.now(), result };
        return result;
      }
      const error = statusMessageFromPayload(
        payload,
        "Training snapshot unavailable."
      );
      emitSyncStatus({
        state: "error",
        authenticated: payload?.authenticated ?? null,
        lastError: error,
      });
      return {
        ok: false,
        authenticated: Boolean(payload?.authenticated),
        snapshot: null,
        error,
        status: response.status,
      };
    })()
      .catch((error) => {
      const message =
        error instanceof Error ? error.message : "Training sync failed.";
      emitSyncStatus({
        state: "error",
        lastError: message,
      });
      return {
        ok: false,
        authenticated: false,
        snapshot: null,
        error: message,
        status: null,
      };
      })
      .finally(() => {
        snapshotLoadPromise = null;
      });

    return snapshotLoadPromise;
  };

export const loadTrainingSnapshot = async (): Promise<TrainingSnapshot | null> => {
  const result = await loadTrainingSnapshotWithStatus();
  return result.ok && result.authenticated ? result.snapshot : null;
};

export const pushTrainingPatchWithStatus = async (patch: TrainingSnapshot) => {
  if (!patchHasPayload(patch)) {
    logTrainingSync("training-sync", "skipped empty patch");
    return true;
  }
  const patchSignature = stableTrainingStringify(patch);
  const existingPatch = inFlightPatchBySignature.get(patchSignature);
  if (existingPatch) {
    logTrainingSync("training-sync", "joined duplicate in-flight patch", summarizePatch(patch));
    return existingPatch;
  }
  const now = Date.now();
  if (
    lastSuccessfulPatchSignature === patchSignature &&
    now - lastSuccessfulPatchAt < PATCH_DEDUPE_WINDOW_MS
  ) {
    logTrainingSync("training-sync", "skipped recent duplicate patch", summarizePatch(patch));
    return true;
  }

  emitSyncStatus({
    state: "syncing",
    lastAttemptAt: now,
    lastError: null,
  });
  const pushPromise = (async () => {
    const response = await fetchTrainingState({
      method: "POST",
      body: JSON.stringify(patch),
    });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; authenticated?: boolean; error?: string }
      | null;
    if (response.ok && payload?.ok) {
      emitSyncStatus({
        state: "synced",
        authenticated: true,
        lastSyncedAt: Date.now(),
        lastError: null,
      });
      lastSuccessfulPatchSignature = patchSignature;
      lastSuccessfulPatchAt = Date.now();
      invalidateSnapshotCache();
      logTrainingSync("training-sync", "patch pushed", summarizePatch(patch));
      return true;
    }
    if (response.status === 401) {
      emitSyncStatus({
        state: "unauthenticated",
        authenticated: false,
        lastError: null,
      });
      return false;
    }
    emitSyncStatus({
      state: "error",
      authenticated: payload?.authenticated ?? null,
      lastError: statusMessageFromPayload(payload, "Training sync failed."),
    });
    return false;
  })()
    .catch((error) => {
    emitSyncStatus({
      state: "error",
      lastError:
        error instanceof Error ? error.message : "Training sync failed.",
    });
    return false;
    })
    .finally(() => {
      inFlightPatchBySignature.delete(patchSignature);
    });

  inFlightPatchBySignature.set(patchSignature, pushPromise);
  return pushPromise;
};

// ---------------------------------------------------------------------------
// Phase 6f, Commit 2 — offline sync queue.
//
// `pushTrainingPatchWithStatus` above is fire-and-forget: on failure it sets
// `state: "error"` and returns `false`, but nothing ever retries. Every write
// path already calls it after every local save (logStore.ts's
// `saveTrainingRecordIfChanged`), which means session/program data written
// while offline was silently never synced once the network returned — the
// local IndexedDB write always succeeded (training works fully offline
// already), only the mirror-to-server step was being dropped on the floor.
//
// This wraps the exported `pushTrainingPatch` (the function every save path
// calls) so a patch that fails for a genuine connectivity/server reason is
// queued in localStorage and retried — in order, with backoff — until it
// succeeds or the queue is cleared by logout/erase (same `localStorage`
// wipe as every other local key; see accountIsolation.ts / resetAppData.ts).
// A 401 (unauthenticated) is NOT queued: there is no session to sync to, and
// retrying will only ever fail the same way regardless of connectivity.
// ---------------------------------------------------------------------------

const OFFLINE_QUEUE_KEY = "praxis_offline_sync_queue";
const MAX_QUEUE_ENTRIES = 50;
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000, 60_000];

type QueuedPatch = {
  id: string;
  patch: TrainingSnapshot;
  queuedAt: number;
  attempts: number;
};

const offlineQueueListeners = new Set<() => void>();

const readOfflineQueue = (): QueuedPatch[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedPatch[]) : [];
  } catch {
    return [];
  }
};

const writeOfflineQueue = (queue: QueuedPatch[]) => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(queue.slice(-MAX_QUEUE_ENTRIES))
    );
  } catch {
    // Best-effort only — a full/blocked localStorage must never crash a save.
  }
  offlineQueueListeners.forEach((listener) => listener());
};

/** Subscribe to offline-queue length changes (for an "N unsynced" UI, if ever needed). */
export const subscribeOfflineSyncQueue = (listener: () => void) => {
  offlineQueueListeners.add(listener);
  return () => {
    offlineQueueListeners.delete(listener);
  };
};

export const getOfflineSyncQueueLength = () => readOfflineQueue().length;

let drainTimer: ReturnType<typeof setTimeout> | null = null;
let draining = false;

const scheduleOfflineQueueDrain = (delayMs: number) => {
  if (typeof window === "undefined") return;
  if (drainTimer) clearTimeout(drainTimer);
  drainTimer = setTimeout(() => {
    drainTimer = null;
    void drainOfflineSyncQueue();
  }, delayMs);
};

const enqueueOfflinePatch = (patch: TrainingSnapshot) => {
  const queue = readOfflineQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    patch,
    queuedAt: Date.now(),
    attempts: 0,
  });
  writeOfflineQueue(queue);
  logTrainingSync("training-sync", "queued patch for offline retry", summarizePatch(patch));
};

/**
 * Drains the offline queue in order (oldest first) — order matters because
 * later patches (e.g. a later `programProgress` write) can depend on an
 * earlier one having landed server-side first. Stops at the first failure
 * so nothing is skipped/reordered, and reschedules with backoff.
 */
export const drainOfflineSyncQueue = async (): Promise<void> => {
  if (draining) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  if (readOfflineQueue().length === 0) return;

  draining = true;
  try {
    for (;;) {
      const queue = readOfflineQueue();
      const next = queue[0];
      if (!next) break;

      const ok = await pushTrainingPatchWithStatus(next.patch);
      const latestQueue = readOfflineQueue();
      if (ok) {
        writeOfflineQueue(latestQueue.filter((entry) => entry.id !== next.id));
        continue;
      }

      const status = getTrainingSyncStatus();
      if (status.state === "unauthenticated") {
        // No account to sync to (signed out mid-queue) — drop rather than
        // retry forever against a session that will never authenticate.
        writeOfflineQueue(latestQueue.filter((entry) => entry.id !== next.id));
        continue;
      }

      const attempts = next.attempts + 1;
      writeOfflineQueue(
        latestQueue.map((entry) =>
          entry.id === next.id ? { ...entry, attempts } : entry
        )
      );
      const delay = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)];
      scheduleOfflineQueueDrain(delay);
      break;
    }
  } finally {
    draining = false;
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void drainOfflineSyncQueue();
  });
  // Pick up anything queued from a prior page load (e.g. the tab was closed
  // while offline) once this module first evaluates.
  scheduleOfflineQueueDrain(0);
}

export const pushTrainingPatch = async (patch: TrainingSnapshot) => {
  const ok = await pushTrainingPatchWithStatus(patch);
  if (ok) return true;
  if (getTrainingSyncStatus().state !== "unauthenticated") {
    enqueueOfflinePatch(patch);
  }
  return false;
};
