type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type SessionDropoffReason =
  | "exit_button"
  | "pagehide"
  | "route_change"
  | "visibility_hidden";

export type SessionDropoffEvent = {
  id: string;
  at: string;
  sessionId: string;
  programId: string | null;
  dayIndex: number | null;
  exerciseId: string | null;
  exerciseIndex: number;
  totalExercises: number;
  progressPct: number;
  reason: SessionDropoffReason;
};

const STORAGE_KEY = "session_dropoff_telemetry";

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `drop-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const browserStorage = (): StorageLike | null => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
};

export const listSessionDropoffTelemetry = (storage?: StorageLike) => {
  const store = storage ?? browserStorage();
  if (!store) return [] as SessionDropoffEvent[];
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return [] as SessionDropoffEvent[];
  try {
    const parsed = JSON.parse(raw) as SessionDropoffEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSessionDropoffTelemetry = (
  event: Omit<SessionDropoffEvent, "id" | "at">,
  storage?: StorageLike
) => {
  const store = storage ?? browserStorage();
  if (!store) return null;
  const next: SessionDropoffEvent = {
    id: uuid(),
    at: new Date().toISOString(),
    ...event,
    progressPct: Math.max(0, Math.min(100, Math.round(event.progressPct))),
  };
  const current = listSessionDropoffTelemetry(store);
  const capped = [next, ...current].slice(0, 200);
  store.setItem(STORAGE_KEY, JSON.stringify(capped));
  return next;
};

export const clearSessionDropoffTelemetry = (storage?: StorageLike) => {
  const store = storage ?? browserStorage();
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify([]));
};
