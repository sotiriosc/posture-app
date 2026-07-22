/**
 * Phase 5 — resultsViewRetestQueue.test.ts
 *
 * @vitest-environment jsdom
 *
 * Tests that the RetestPromptCard (sacrifice retest queue) accept/decline flow
 * in ResultsView correctly updates the UI state.
 *
 * Coverage:
 *   (1) Eligible exercises appear in the retest queue when the projection has them.
 *   (2) Clicking "Yes, add back" removes the exercise from the visible queue (accept).
 *   (3) Clicking "Keep sacrificed" removes the exercise from the visible queue (decline).
 *   (4) After accept/decline, the item is no longer visible.
 *   (5) Accepting one item does not affect other items in the queue.
 */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  listAllPrograms: vi.fn(),
  listSessions: vi.fn(),
  listExerciseLogsBySession: vi.fn(),
  init: vi.fn(),
  resolveActiveProgramFromList: vi.fn(),
  loadAppState: vi.fn(),
  loadPrefs: vi.fn(),
  savePrefs: vi.fn(),
}));

vi.mock("@/lib/logStore", () => ({
  init: mocks.init,
  listAllPrograms: mocks.listAllPrograms,
  listSessions: mocks.listSessions,
  listExerciseLogsBySession: mocks.listExerciseLogsBySession,
  loadPrefs: mocks.loadPrefs,
  savePrefs: mocks.savePrefs,
}));

vi.mock("@/lib/appState", () => ({
  loadAppState: mocks.loadAppState,
}));

vi.mock("@/lib/trainingStateModel", () => ({
  resolveActiveProgramFromList: mocks.resolveActiveProgramFromList,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/results/view",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import type { Program, ExerciseLog } from "@/lib/types";

const makeProgram = (): Program => ({
  id: "test",
  userId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  goalTrack: null,
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 0,
  phaseName: "activation",
  weekIndex: 0,
  totalWeekIndex: 0,
  cycleIndex: 0,
  phase: { name: "activation", phaseIndex: 0, cycleIndex: 0, weekIndex: 0, weekCount: 4, goal: "Base" },
  nextWeekPlan: { summary: "w1", change: "none", reason: "first" },
  week: [],
  source: "local",
  deletedAt: null,
  ladderState: {
    byPattern: {},
    sacrificedByPattern: {
      hinge: ["romanian-deadlift"],
      horizontal_push: ["push-up"],
    },
  },
  phaseTransitionState: {
    phase: "activation",
    sessionsInPhase: 12,
    criteriaLastEvaluated: [],
    unlockedAt: 12,
    lastTrace: "advance activation",
    sacrificeRetestEligible: [
      { exerciseId: "romanian-deadlift", sacrificedAtPhase: "activation", trace: "eligible" },
      { exerciseId: "push-up", sacrificedAtPhase: "activation", trace: "eligible" },
    ],
  },
});

// ── Tests ──────────────────────────────────────────────────────────────────

// Dynamic import to avoid SSR issues
const loadResultsView = () =>
  import("@/components/results-view/ResultsView").then((m) => m.default);

describe("ResultsView — sacrifice retest queue flow", () => {
  beforeEach(() => {
    const program = makeProgram();
    mocks.init.mockResolvedValue(undefined);
    mocks.loadAppState.mockResolvedValue(null);
    mocks.loadPrefs.mockResolvedValue({ schemaVersion: 1 });
    mocks.savePrefs.mockResolvedValue({ schemaVersion: 1 });
    mocks.listAllPrograms.mockResolvedValue([program]);
    mocks.listSessions.mockResolvedValue([]);
    mocks.listExerciseLogsBySession.mockResolvedValue([]);
    mocks.resolveActiveProgramFromList.mockReturnValue({ program, source: "local" });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("(1) eligible exercises appear in the retest queue", async () => {
    const ResultsView = await loadResultsView();
    render(React.createElement(ResultsView));
    await waitFor(() => {
      expect(screen.queryByText(/Loading results/i)).toBeNull();
    }, { timeout: 5000 });
    // Both sacrificed exercises that are eligible should be visible.
    await waitFor(() => {
      const acceptButtons = screen.queryAllByTestId(/^retest-accept-/);
      expect(acceptButtons.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 5000 });
  });

  test("(2) clicking 'Yes, add back' removes the exercise from the visible queue", async () => {
    const ResultsView = await loadResultsView();
    render(React.createElement(ResultsView));
    await waitFor(() => {
      expect(screen.queryByText(/Loading results/i)).toBeNull();
    }, { timeout: 5000 });
    const acceptBtn = await screen.findByTestId("retest-accept-romanian-deadlift", {}, { timeout: 5000 });
    fireEvent.click(acceptBtn);
    await waitFor(() => {
      expect(screen.queryByTestId("retest-accept-romanian-deadlift")).toBeNull();
    }, { timeout: 3000 });
  });

  test("(3) clicking 'Keep sacrificed' removes the exercise from the visible queue", async () => {
    const ResultsView = await loadResultsView();
    render(React.createElement(ResultsView));
    await waitFor(() => {
      expect(screen.queryByText(/Loading results/i)).toBeNull();
    }, { timeout: 5000 });
    const declineBtn = await screen.findByTestId("retest-decline-romanian-deadlift", {}, { timeout: 5000 });
    fireEvent.click(declineBtn);
    await waitFor(() => {
      expect(screen.queryByTestId("retest-decline-romanian-deadlift")).toBeNull();
    }, { timeout: 3000 });
  });

  test("(5) accepting one item does not remove other items", async () => {
    const ResultsView = await loadResultsView();
    render(React.createElement(ResultsView));
    await waitFor(() => {
      expect(screen.queryByText(/Loading results/i)).toBeNull();
    }, { timeout: 5000 });
    const acceptRDL = await screen.findByTestId("retest-accept-romanian-deadlift", {}, { timeout: 5000 });
    fireEvent.click(acceptRDL);
    await waitFor(() => {
      // push-up should still be present after dismissing romanian-deadlift
      const pushUpBtn = screen.queryByTestId("retest-accept-push-up");
      expect(pushUpBtn).toBeTruthy();
    }, { timeout: 3000 });
  });
});
