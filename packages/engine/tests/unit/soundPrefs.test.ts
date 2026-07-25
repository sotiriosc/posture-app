import { describe, expect, it } from "vitest";
import {
  DEFAULT_SOUND_PREFS,
  normalizeSoundPrefs,
  soundGainFromVolume,
} from "../../src/soundPrefs";

describe("soundPrefs (Phase 6k)", () => {
  it("defaults when empty", () => {
    expect(normalizeSoundPrefs(undefined)).toEqual(DEFAULT_SOUND_PREFS);
  });

  it("clamps volume and preserves toggles", () => {
    expect(
      normalizeSoundPrefs({
        timerSounds: false,
        intervalBeeps: false,
        sessionCompleteChime: true,
        volume: 140,
        vibration: false,
      })
    ).toEqual({
      timerSounds: false,
      intervalBeeps: false,
      sessionCompleteChime: true,
      volume: 100,
      vibration: false,
    });
  });

  it("maps volume to gain 0–1", () => {
    expect(soundGainFromVolume(70)).toBeCloseTo(0.7);
    expect(soundGainFromVolume(-10)).toBe(0);
    expect(soundGainFromVolume(200)).toBe(1);
  });
});
