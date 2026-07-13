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

export const pushTrainingPatch = async (patch: TrainingSnapshot) => {
  return pushTrainingPatchWithStatus(patch);
};
