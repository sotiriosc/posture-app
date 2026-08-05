/** @vitest-environment jsdom */

import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import DualModeTimer, {
  TIMER_SETUP_BUFFER_SEC,
  type DualModeTimerRuntimeState,
} from "@/components/DualModeTimer";

describe("DualModeTimer single-writer invariants", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T16:00:00.000Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("initializes prescribed work duration once including setup buffer", () => {
    render(
      React.createElement(DualModeTimer, {
        contextId: "s1|0|item-a|band-row|main",
        initialExerciseSeconds: 40,
        initialRestSeconds: 60,
      })
    );
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(40 + TIMER_SETUP_BUFFER_SEC)
    );
  });

  test("same-context parent echo cannot overwrite an active countdown", () => {
    const contextId = "s1|0|item-a|band-row|main";
    let latest: DualModeTimerRuntimeState | null = null;
    const onStateChange = vi.fn((state: DualModeTimerRuntimeState) => {
      latest = state;
    });

    const view = render(
      React.createElement(DualModeTimer, {
        contextId,
        initialExerciseSeconds: 30,
        initialRestSeconds: 45,
        onStateChange,
      })
    );

    fireEvent.click(screen.getByTestId("session-timer-face"));
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(30 + TIMER_SETUP_BUFFER_SEC)
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const afterOneSecond = screen.getByTestId("session-timer-digits").textContent;
    expect(afterOneSecond).toBe(format(30 + TIMER_SETUP_BUFFER_SEC - 1));
    expect(latest?.remainingSeconds).toBe(30 + TIMER_SETUP_BUFFER_SEC - 1);

    // Simulate parent feeding the emitted state back as persistedState (old bug).
    view.rerender(
      React.createElement(DualModeTimer, {
        contextId,
        initialExerciseSeconds: 30,
        initialRestSeconds: 45,
        persistedState: latest,
        onStateChange,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(30 + TIMER_SETUP_BUFFER_SEC - 2)
    );
  });

  test("context change initializes the new prescription once", () => {
    const view = render(
      React.createElement(DualModeTimer, {
        contextId: "s1|0|item-a|band-row|main",
        initialExerciseSeconds: 30,
        initialRestSeconds: 45,
      })
    );
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(30 + TIMER_SETUP_BUFFER_SEC)
    );

    view.rerender(
      React.createElement(DualModeTimer, {
        contextId: "s1|0|item-a|cable-row|main",
        initialExerciseSeconds: 60,
        initialRestSeconds: 45,
        // Stale runtime from the previous exercise context must be ignored.
        persistedState: {
          mode: "exercise",
          running: true,
          remainingSeconds: 12,
          exerciseSeconds: 30,
          restSeconds: 45,
          updatedAtMs: Date.now(),
          contextId: "s1|0|item-a|band-row|main",
        },
      })
    );

    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(60 + TIMER_SETUP_BUFFER_SEC)
    );
  });

  test("pause then resume preserves remaining and does not recalculate duration", () => {
    render(
      React.createElement(DualModeTimer, {
        contextId: "s1|0|item-a|band-row|main",
        initialExerciseSeconds: 30,
        initialRestSeconds: 45,
      })
    );
    fireEvent.click(screen.getByTestId("session-timer-face"));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const pausedAt = screen.getByTestId("session-timer-digits").textContent;
    fireEvent.click(screen.getByTestId("session-timer-face")); // pause
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(pausedAt);
    fireEvent.click(screen.getByTestId("session-timer-face")); // resume
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(30 + TIMER_SETUP_BUFFER_SEC - 3)
    );
  });

  test("reset returns to current prescribed duration for active mode", () => {
    render(
      React.createElement(DualModeTimer, {
        contextId: "s1|0|item-a|band-row|main",
        initialExerciseSeconds: 30,
        initialRestSeconds: 45,
      })
    );
    fireEvent.click(screen.getByTestId("session-timer-face"));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("session-timer-digits").textContent).toBe(
      format(30 + TIMER_SETUP_BUFFER_SEC)
    );
  });
});

const format = (seconds: number) => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
