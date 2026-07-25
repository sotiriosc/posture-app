/**
 * Phase 6k — Web Audio helpers for timer / session tones.
 * Safe no-ops when AudioContext is unavailable.
 */

import { soundGainFromVolume } from "./soundPrefs";

const closeLater = (context: AudioContext, ms: number) => {
  setTimeout(() => {
    void context.close().catch(() => undefined);
  }, ms);
};

export const playSessionCompleteChime = (volume = 70): void => {
  if (typeof window === "undefined") return;
  try {
    const context = new AudioContext();
    const now = context.currentTime;
    const gainScale = soundGainFromVolume(volume) * 0.1;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.12;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainScale, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    closeLater(context, 900);
  } catch {
    // no-op
  }
};
