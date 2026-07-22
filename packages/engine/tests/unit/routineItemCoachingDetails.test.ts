/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import RoutineItemCoachingDetails from "@/components/RoutineItemCoachingDetails";

describe("RoutineItemCoachingDetails", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders a compact dose row and keeps rationale collapsed", () => {
    const { container } = render(
      React.createElement(RoutineItemCoachingDetails, {
        item: {
          prescription: {
            sets: 2,
            reps: "8-12",
            tempo: "3-1-2 controlled",
            restSeconds: 60,
            targetRPE: 6,
            stopRule: "Stop if pain increases.",
          },
          rationale: {
            whyThisExercise: "Chosen to balance pulling strength with your pressing work.",
            mainCue: "Pull with the elbows.",
            easierVersion: "Chest-supported row",
            harderVersion: "Single-arm row",
            stopIf: "Stop if pain increases.",
          },
        },
      })
    );

    expect(screen.getByText("2 sets")).toBeTruthy();
    expect(screen.getByText("8-12 reps")).toBeTruthy();
    expect(screen.getByText("3-1-2 controlled")).toBeTruthy();
    expect(screen.getByText("60s rest")).toBeTruthy();
    expect(screen.getByText("RPE 6")).toBeTruthy();
    expect(screen.getByText("Coach notes")).toBeTruthy();
    expect(screen.getByText("Why this:")).toBeTruthy();
    expect(
      container.querySelector('button[aria-expanded]')?.getAttribute("aria-expanded")
    ).toBe("false");
  });

  test("renders nothing when old routine items have no metadata or fallback", () => {
    const { container } = render(
      React.createElement(RoutineItemCoachingDetails, {
        item: {},
      })
    );

    expect(container.firstChild).toBeNull();
  });

  test("can render a legacy fallback dose without rationale details", () => {
    render(
      React.createElement(RoutineItemCoachingDetails, {
        item: {},
        fallbackDose: "2 x 8-10",
        showDetails: false,
      })
    );

    expect(screen.getByText("2 x 8-10")).toBeTruthy();
    expect(screen.queryByText("Coach notes")).toBeNull();
  });
});
