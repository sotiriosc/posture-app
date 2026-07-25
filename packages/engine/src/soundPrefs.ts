/**
 * Phase 6k Commit 3 — persisted sound preferences (LogPrefs.soundPrefs).
 */

export type SoundPrefs = {
  /** Master timer tones (start/finish). Default On. */
  timerSounds: boolean;
  /** Work↔rest transition beeps. Default On. */
  intervalBeeps: boolean;
  /** End-of-session chime. Default On. */
  sessionCompleteChime: boolean;
  /** 0–100. Default 70. */
  volume: number;
  /** Phase 6k Commit 4 — haptic fallback. Default On. */
  vibration: boolean;
};

export const DEFAULT_SOUND_PREFS: SoundPrefs = {
  timerSounds: true,
  intervalBeeps: true,
  sessionCompleteChime: true,
  volume: 70,
  vibration: true,
};

export const normalizeSoundPrefs = (
  value: Partial<SoundPrefs> | null | undefined
): SoundPrefs => {
  const volumeRaw = Number(value?.volume);
  const volume = Number.isFinite(volumeRaw)
    ? Math.min(100, Math.max(0, Math.round(volumeRaw)))
    : DEFAULT_SOUND_PREFS.volume;
  return {
    timerSounds: value?.timerSounds !== false,
    intervalBeeps: value?.intervalBeeps !== false,
    sessionCompleteChime: value?.sessionCompleteChime !== false,
    volume,
    vibration: value?.vibration !== false,
  };
};

export const soundGainFromVolume = (volume: number): number =>
  Math.min(1, Math.max(0, volume / 100));
