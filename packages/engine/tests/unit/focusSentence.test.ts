import { describe, expect, test } from "vitest";
import {
  buildWeeklyFocusSentence,
  extractBetweenSessionsCue,
} from "@/lib/focusSentence";

describe("buildWeeklyFocusSentence", () => {
  test("Phase 6f, Commit 5.a regression: a bare tag duplicating one already in the bulleted list is dropped, not appended as a trailing 'and your X' clause", () => {
    const priorities = [
      "Primary focus patterns: balance and asymmetry control • breathing and ribcage control • squat pattern control",
      "Breathing And Ribcage Control",
      "Recovery cue: easy walk + mobility after sessions",
    ];

    const sentence = buildWeeklyFocusSentence(priorities);

    expect(sentence).toBe(
      "This week we're focused on your balance and asymmetry control • breathing and ribcage control • squat pattern control."
    );
    // Regression guard for the exact reported bug string.
    expect(sentence).not.toContain("and your breathing And Ribcage Control");
    expect(sentence).not.toMatch(/,\s*and your/i);
  });

  test("distinct focus areas are still joined naturally with 'and'", () => {
    const sentence = buildWeeklyFocusSentence([
      "Posture cue: stack ribs over pelvis",
      "Core bracing",
    ]);
    expect(sentence).toBe(
      "This week we're focused on your stack ribs over pelvis, and your core bracing."
    );
  });

  test("a single focus area produces a single-clause sentence with no trailing comma", () => {
    const sentence = buildWeeklyFocusSentence(["Posture cue: stack ribs over pelvis"]);
    expect(sentence).toBe("This week we're focused on your stack ribs over pelvis.");
  });

  test("recovery cue entries never leak into the focus sentence", () => {
    const sentence = buildWeeklyFocusSentence([
      "Posture cue: stack ribs over pelvis",
      "Recovery cue: easy walk + mobility after sessions",
    ]);
    expect(sentence).not.toContain("Recovery");
    expect(sentence).not.toContain("easy walk");
  });

  test("no priorities at all falls back to a generic phrase", () => {
    expect(buildWeeklyFocusSentence([])).toBe(
      "This week we're focused on your key movements."
    );
  });
});

describe("extractBetweenSessionsCue", () => {
  test("extracts and strips the recovery cue prefix when present", () => {
    expect(
      extractBetweenSessionsCue([
        "Posture cue: stack ribs over pelvis",
        "Recovery cue: easy walk + mobility after sessions",
      ])
    ).toBe("easy walk + mobility after sessions");
  });

  test("falls back to a generic recovery phrase when no recovery cue is present", () => {
    expect(extractBetweenSessionsCue(["Posture cue: stack ribs over pelvis"])).toBe(
      "keep it easy — walk, mobility work, sleep"
    );
  });
});
