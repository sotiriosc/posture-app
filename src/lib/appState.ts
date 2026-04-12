export type AppState = {
  lastRoute?: string;
  programId?: string;
  activeProgramId?: string;
  activeProgramBaselineAt?: number;
  activeGenerationMode?: "live_initial" | "live_regeneration" | "reference_preview";
  activeInitialVariationSeed?: string;
  selectedDay?: number;
  activeSessionId?: string;
  programVersion?: number;
  activePhaseIndex?: number;
  activeCycleIndex?: number;
  questionnaireSignature?: string;
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
  const includesActiveProgramId = Object.prototype.hasOwnProperty.call(
    partial,
    "activeProgramId"
  );
  const includesActiveProgramBaselineAt = Object.prototype.hasOwnProperty.call(
    partial,
    "activeProgramBaselineAt"
  );
  const activeProgramChanged =
    includesActiveProgramId && partial.activeProgramId !== current.activeProgramId;
  const normalizedPartial: Partial<AppState> = {
    ...partial,
  };

  // Keep baseline aligned with active program switches even when callers only set id.
  if (activeProgramChanged && !includesActiveProgramBaselineAt) {
    normalizedPartial.activeProgramBaselineAt = partial.activeProgramId
      ? Date.now()
      : undefined;
  }

  const next: AppState = {
    ...current,
    ...normalizedPartial,
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
