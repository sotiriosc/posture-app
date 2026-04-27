/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import {
  COACHING_CHECK_IN_EXPLANATION,
  CoachingExplanationBlock,
  SessionCoachFeedbackCards,
  formatCoachReadBody,
  formatNextSessionRecommendationBody,
} from "@/components/session/CoachingGuidance";

describe("coaching guidance UI", () => {
  afterEach(() => {
    cleanup();
  });

  test("formats coach feedback without repeating internal labels", () => {
    expect(
      formatCoachReadBody("Coach read: symptoms stable, effort moderate.")
    ).toBe("Symptoms stable, effort moderate.");
    expect(
      formatNextSessionRecommendationBody(
        "Next session recommendation: repeat the pattern at a steady dose."
      )
    ).toBe("Repeat the pattern at a steady dose.");
  });

  test("renders compact cards and skips missing legacy fields", () => {
    render(
      React.createElement(SessionCoachFeedbackCards, {
        coachRead: "Coach read: symptoms stable, effort high, confidence good.",
        adaptationPreview: null,
        nextSessionRecommendation:
          "Next session recommendation: repeat the pattern at a steady dose.",
      })
    );

    expect(screen.getByTestId("coach-read-summary").textContent).toContain(
      "Symptoms stable, effort high, confidence good."
    );
    expect(screen.queryByTestId("adaptation-preview")).toBeNull();
    expect(screen.getByTestId("next-session-recommendation").textContent).toContain(
      "Repeat the pattern at a steady dose."
    );
  });

  test("renders the check-in explanation copy", () => {
    render(React.createElement(CoachingExplanationBlock));

    expect(screen.getByTestId("coaching-check-in-explanation").textContent).toBe(
      COACHING_CHECK_IN_EXPLANATION
    );
  });
});
