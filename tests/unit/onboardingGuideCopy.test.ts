/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import {
  ONBOARDING_STORAGE_KEY,
  onboardingGuides,
  type OnboardingGuide,
} from "@/components/onboarding/onboardingConfig";

const guideText = (guide: OnboardingGuide) =>
  guide.sections
    .flatMap((section) => {
      if (section.type === "text") return [section.text];
      return [section.title, ...section.items].filter(
        (value): value is string => Boolean(value)
      );
    })
    .join(" ");

describe("onboarding guide copy", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test("does not claim automatic plan changes", () => {
    const allCopy = Object.values(onboardingGuides).map(guideText).join(" ");

    expect(allCopy).not.toMatch(/Praxis (updates|adjusts) the plan automatically/i);
    expect(allCopy).toContain("Your saved plan is not changed automatically.");
  });

  test("home guide explains how Praxis builds the plan", () => {
    expect(guideText(onboardingGuides.home)).toContain(
      "Builds your plan from your goal, experience, equipment, pain areas, and training days."
    );
  });

  test("session guide mentions Today's Options and saved-plan boundaries", () => {
    const sessionCopy = guideText(onboardingGuides.session);

    expect(sessionCopy).toContain("Today’s Options");
    expect(sessionCopy).toContain("full, steady, reduced, simplified, or recovery");
    expect(sessionCopy).toContain("Today’s Options change only today’s session view");
    expect(sessionCopy).toContain("your saved plan is not changed automatically");
  });

  test("results guide explains Coach Notes and recommendations accurately", () => {
    const resultsCopy = guideText(onboardingGuides.results);

    expect(resultsCopy).toContain("Coach Notes");
    expect(resultsCopy).toContain("dose, cues, and why exercises were selected");
    expect(resultsCopy).toContain("Recommendations are advisory");
    expect(resultsCopy).toContain(
      "Praxis uses check-ins to suggest safer ways to approach the next session."
    );
  });

  test("existing guide button remains accessible and marks the page seen on close", async () => {
    render(React.createElement(OnboardingInfoButton, { onboardingKey: "session" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Open onboarding guide")).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText("Open onboarding guide"));
    expect(screen.getByRole("dialog", { name: "Onboarding guide" })).toBeTruthy();
    expect(screen.getByText("How to complete a corrective session")).toBeTruthy();

    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Onboarding guide" })).toBeNull();
    });

    expect(
      JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? "{}").seenByPage
        ?.session
    ).toBe(true);
  });
});
