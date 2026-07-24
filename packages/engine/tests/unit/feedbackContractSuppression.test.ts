/**
 * Phase 6f, Commit 5.c — session-adjustment prompt tone + self-adapting
 * suppression.
 *
 * Coverage:
 *  - buildContractPrompt: curious-not-judgmental tone for "incomplete";
 *    other reasons keep their direct phrasing.
 *  - shouldOfferIncompletePromptSuppression: fires only from the 2nd time on.
 *  - filterSuppressedContractTriggers: drops only "incomplete" triggers, and
 *    only when suppression is on; never touches pain/failed-difficulty.
 */

import { describe, expect, test } from "vitest";
import type { FeedbackContractTrigger } from "@/lib/program/feedbackContract";
import {
  buildContractPrompt,
  filterSuppressedContractTriggers,
  shouldOfferIncompletePromptSuppression,
} from "@/lib/program/feedbackContract";

describe("buildContractPrompt", () => {
  test("the 'incomplete' reason uses curious-not-judgmental phrasing, not an assumption of intent", () => {
    const prompt = buildContractPrompt("incomplete", "Machine Chest Press");
    expect(prompt).toBe(
      "I noticed you didn't fill in fields for Machine Chest Press last session. Did you skip it, or want to log it now?"
    );
    expect(prompt.toLowerCase()).not.toContain("did you skip this exercise?");
  });

  test("severe_pain keeps its direct phrasing", () => {
    expect(buildContractPrompt("severe_pain", "Barbell Squat")).toBe(
      "Last session, you reported pain on Barbell Squat. What would you like to do?"
    );
  });

  test("moderate_pain_consecutive keeps its direct phrasing", () => {
    expect(
      buildContractPrompt("moderate_pain_consecutive", "Romanian Deadlift")
    ).toBe(
      "Last session, you reported discomfort two sessions in a row on Romanian Deadlift. What would you like to do?"
    );
  });

  test("failed_difficulty keeps its direct phrasing", () => {
    expect(buildContractPrompt("failed_difficulty", "Pull-Up")).toBe(
      "Last session, the effort was maximal on Pull-Up. What would you like to do?"
    );
  });
});

describe("shouldOfferIncompletePromptSuppression", () => {
  test("does not offer suppression on the first firing", () => {
    expect(shouldOfferIncompletePromptSuppression(0)).toBe(false);
    expect(shouldOfferIncompletePromptSuppression(1)).toBe(false);
  });

  test("offers suppression from the second firing onward", () => {
    expect(shouldOfferIncompletePromptSuppression(2)).toBe(true);
    expect(shouldOfferIncompletePromptSuppression(3)).toBe(true);
    expect(shouldOfferIncompletePromptSuppression(50)).toBe(true);
  });
});

describe("filterSuppressedContractTriggers", () => {
  const triggers: FeedbackContractTrigger[] = [
    { exerciseId: "ex-pain", reason: "severe_pain", onProbation: false, atFloor: false },
    { exerciseId: "ex-incomplete", reason: "incomplete", onProbation: false, atFloor: false },
    {
      exerciseId: "ex-failed",
      reason: "failed_difficulty",
      onProbation: false,
      atFloor: false,
    },
  ];

  test("passes every trigger through unchanged when suppression is off", () => {
    expect(filterSuppressedContractTriggers(triggers, false)).toEqual(triggers);
  });

  test("drops only the 'incomplete' trigger when suppression is on", () => {
    const filtered = filterSuppressedContractTriggers(triggers, true);
    expect(filtered.map((t) => t.reason)).toEqual([
      "severe_pain",
      "failed_difficulty",
    ]);
  });

  test("pain and failed-difficulty triggers are never suppressed, even alongside an incomplete one", () => {
    const filtered = filterSuppressedContractTriggers(triggers, true);
    expect(filtered.some((t) => t.reason === "severe_pain")).toBe(true);
    expect(filtered.some((t) => t.reason === "failed_difficulty")).toBe(true);
  });

  test("returns an empty array, not a crash, when every trigger is 'incomplete' and suppressed", () => {
    const onlyIncomplete: FeedbackContractTrigger[] = [
      { exerciseId: "ex-1", reason: "incomplete", onProbation: false, atFloor: false },
    ];
    expect(filterSuppressedContractTriggers(onlyIncomplete, true)).toEqual([]);
  });
});
