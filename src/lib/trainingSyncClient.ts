"use client";

import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

export type TrainingSnapshot = {
  questionnaire?: Record<string, unknown> | null;
  assessment?: Record<string, unknown> | null;
  prefs?: LogPrefs | null;
  programs?: Program[];
  programProgress?: ProgramProgress[];
  sessions?: SessionRecord[];
  exerciseLogs?: ExerciseLog[];
};

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

export const loadTrainingSnapshot = async (): Promise<TrainingSnapshot | null> => {
  try {
    const response = await fetchTrainingState({ method: "GET" });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; authenticated?: boolean; snapshot?: TrainingSnapshot | null }
      | null;
    if (!response.ok || !payload?.ok || !payload.authenticated) return null;
    return payload.snapshot ?? null;
  } catch {
    return null;
  }
};

export const pushTrainingPatch = async (patch: TrainingSnapshot) => {
  try {
    const response = await fetchTrainingState({
      method: "POST",
      body: JSON.stringify(patch),
    });
    return response.ok;
  } catch {
    return false;
  }
};
