"use client";

import type { TrainingSnapshot } from "@/lib/trainingStateModel";

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
let syncStatus: TrainingSyncStatus = {
  state: "idle",
  lastAttemptAt: null,
  lastSyncedAt: null,
  lastError: null,
  authenticated: null,
};

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

export const loadTrainingSnapshotWithStatus =
  async (): Promise<TrainingSnapshotLoadResult> => {
    emitSyncStatus({
      state: "syncing",
      lastAttemptAt: Date.now(),
      lastError: null,
    });
    try {
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
        return {
          ok: true,
          authenticated: true,
          snapshot: payload.snapshot ?? null,
          error: null,
          status: response.status,
        };
      }
      if (response.ok && payload?.ok && payload.authenticated === false) {
        emitSyncStatus({
          state: "unauthenticated",
          authenticated: false,
          lastError: null,
        });
        return {
          ok: true,
          authenticated: false,
          snapshot: null,
          error: null,
          status: response.status,
        };
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
    } catch (error) {
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
    }
  };

export const loadTrainingSnapshot = async (): Promise<TrainingSnapshot | null> => {
  const result = await loadTrainingSnapshotWithStatus();
  return result.ok && result.authenticated ? result.snapshot : null;
};

export const pushTrainingPatchWithStatus = async (patch: TrainingSnapshot) => {
  emitSyncStatus({
    state: "syncing",
    lastAttemptAt: Date.now(),
    lastError: null,
  });
  try {
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
  } catch (error) {
    emitSyncStatus({
      state: "error",
      lastError:
        error instanceof Error ? error.message : "Training sync failed.",
    });
    return false;
  }
};

export const pushTrainingPatch = async (patch: TrainingSnapshot) => {
  return pushTrainingPatchWithStatus(patch);
};
