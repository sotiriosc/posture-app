export type AppState = {
  lastRoute?: string;
  programId?: string;
  selectedDay?: number;
  activeSessionId?: string;
  updatedAt: number;
};

const STORAGE_KEY = "app_state_v1";

const isBrowser = () => typeof window !== "undefined";

export const loadAppState = (): AppState | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveAppState = (partial: Partial<AppState>) => {
  if (!isBrowser()) return null;
  const current = loadAppState() ?? { updatedAt: 0 };
  const next: AppState = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
  };
  Object.keys(next).forEach((key) => {
    if (next[key as keyof AppState] === undefined) {
      delete next[key as keyof AppState];
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearAppState = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
};
