/**
 * Phase 6k Commit 4 — haptic patterns for timer / session events.
 * Respects device vibration capability; no-ops when unavailable.
 */

export type HapticEvent = "restEnding" | "setComplete" | "sessionComplete";

const PATTERNS: Record<HapticEvent, number | number[]> = {
  restEnding: 200,
  setComplete: 500,
  sessionComplete: [300, 100, 300],
};

export const vibrateForEvent = (
  event: HapticEvent,
  enabled = true
): boolean => {
  if (!enabled) return false;
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  try {
    return navigator.vibrate(PATTERNS[event]);
  } catch {
    return false;
  }
};
