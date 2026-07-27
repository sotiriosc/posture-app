/**
 * Device-level guide-card "seen" flags.
 *
 * Survives login/logout/account-switch wipes (restored in resetAppData).
 * Cleared only by explicit "Erase all local data". Not tied to userId.
 */
export const GUIDE_SEEN_STORAGE_KEY = "praxis_guide_seen";

/** Legacy key — migrate seenByPage once, then leave alone. */
const LEGACY_ONBOARDING_STORAGE_KEY = "onboarding_state_v1";

export type GuideSeenMap = Record<string, boolean>;

const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const sanitizeSeenMap = (value: unknown): GuideSeenMap => {
  if (typeof value !== "object" || value === null) return {};
  const next: GuideSeenMap = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === true) next[key] = true;
  }
  return next;
};

const readLegacySeenByPage = (): GuideSeenMap => {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(LEGACY_ONBOARDING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { seenByPage?: unknown };
    return sanitizeSeenMap(parsed?.seenByPage);
  } catch {
    return {};
  }
};

export const readDeviceGuideSeen = (): GuideSeenMap => {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(GUIDE_SEEN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      // Support legacy accidental string "true" → treat as empty (per-page map).
      if (parsed === true || parsed === "true") return {};
      return sanitizeSeenMap(parsed);
    }
    const legacy = readLegacySeenByPage();
    if (Object.keys(legacy).length > 0) {
      writeDeviceGuideSeen(legacy);
      return legacy;
    }
    return {};
  } catch {
    return {};
  }
};

export const writeDeviceGuideSeen = (seen: GuideSeenMap) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(GUIDE_SEEN_STORAGE_KEY, JSON.stringify(seen));
};

export const isDeviceGuideSeen = (key: string): boolean =>
  readDeviceGuideSeen()[key] === true;

export const markDeviceGuideSeen = (key: string) => {
  const seen = readDeviceGuideSeen();
  if (seen[key] === true) return;
  seen[key] = true;
  writeDeviceGuideSeen(seen);
};

/** Snapshot before account-isolation localStorage.clear(). */
export const snapshotDeviceGuideSeen = (): string | null => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(GUIDE_SEEN_STORAGE_KEY);
};

/** Restore after account-isolation wipe. */
export const restoreDeviceGuideSeen = (raw: string | null) => {
  if (!canUseStorage() || raw == null || raw === "") return;
  window.localStorage.setItem(GUIDE_SEEN_STORAGE_KEY, raw);
};
