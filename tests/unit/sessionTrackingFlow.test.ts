/** @vitest-environment jsdom */

import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";
import { PROGRAM_TEMPLATE_VERSION } from "@/lib/program";

const mocks = vi.hoisted(() => ({
  searchParams: "programId=program-strength&dayIndex=0",
  programs: new Map<string, Program>(),
  sessions: [] as SessionRecord[],
  logs: [] as ExerciseLog[],
  prefs: {
    schemaVersion: 2,
    timerPrefs: { workSeconds: 60, restSeconds: 60 },
    timerPrefsByExercise: {
      "dumbbell-rows": { workSeconds: 40, restSeconds: 20 },
      plank: { workSeconds: 45, restSeconds: 30 },
    },
  } as LogPrefs,
  progressByProgramId: new Map<string, ProgramProgress>(),
  idCounter: 0,
}));

const makeProgram = (params: {
  id: string;
  daysPerWeek: 3 | 4 | 5;
  dayTitle: string;
  routine: Program["week"][number]["routine"];
  templateVersion?: number;
  updatedAt?: string;
}): Program => ({
  id: params.id,
  userId: null,
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: params.updatedAt ?? "2026-02-15T00:00:00.000Z",
  templateVersion: params.templateVersion ?? PROGRAM_TEMPLATE_VERSION,
  goalTrack: "Improve posture",
  daysPerWeek: params.daysPerWeek,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  weekIndex: 1,
  totalWeekIndex: 1,
  cycleIndex: 1,
  week: [
    {
      dayIndex: 0,
      title: params.dayTitle,
      focusTags: ["upper", "back"],
      routine: params.routine,
    },
  ],
  source: "local",
  deletedAt: null,
});

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("@/lib/trainingSyncClient", () => ({
  loadTrainingSnapshot: vi.fn(async () => null),
}));

vi.mock("@/lib/telemetry", () => ({
  saveSessionDropoffTelemetry: vi.fn(),
}));

vi.mock("@/lib/sessionDraftStore", () => ({
  clearDraft: vi.fn(async () => undefined),
  loadDraft: vi.fn(async () => null),
  saveDraft: vi.fn(async (draft: unknown) => draft),
}));

vi.mock("@/lib/logStore", () => ({
  init: vi.fn(async () => undefined),
  createSession: vi.fn(async (session: SessionRecord) => {
    mocks.sessions = [session, ...mocks.sessions];
    return session;
  }),
  getProgram: vi.fn(async (programId: string) => mocks.programs.get(programId) ?? null),
  getProgramProgress: vi.fn(
    async (programId: string) => mocks.progressByProgramId.get(programId) ?? null
  ),
  listExerciseLogsByExerciseHistory: vi.fn(async (exerciseId: string) =>
    mocks.logs
      .filter((log) => log.exerciseId === exerciseId)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
  ),
  listExerciseLogsBySession: vi.fn(async (sessionId: string) =>
    mocks.logs.filter((log) => log.sessionId === sessionId)
  ),
  listAllPrograms: vi.fn(async () =>
    Array.from(mocks.programs.values()).sort((a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
    )
  ),
  listSessions: vi.fn(async (limit = 20) => mocks.sessions.slice(0, limit)),
  loadPrefs: vi.fn(async () => mocks.prefs),
  nowIso: vi.fn(() => "2026-02-15T00:00:00.000Z"),
  saveExerciseLog: vi.fn(async (log: ExerciseLog) => {
    mocks.logs = [log, ...mocks.logs];
    return log;
  }),
  saveExerciseSwapEvent: vi.fn(async (log: ExerciseLog) => log),
  savePrefs: vi.fn(async (prefs: LogPrefs) => {
    mocks.prefs = prefs;
    return prefs;
  }),
  saveProgramProgress: vi.fn(async (progress: ProgramProgress) => {
    mocks.progressByProgramId.set(progress.programId, progress);
    return progress;
  }),
  updateSession: vi.fn(async (session: SessionRecord) => {
    mocks.sessions = [session, ...mocks.sessions.filter((entry) => entry.id !== session.id)];
    return session;
  }),
  uuid: vi.fn(() => {
    mocks.idCounter += 1;
    return `uuid-${mocks.idCounter}`;
  }),
}));

import SessionClient from "@/app/session/SessionClient";
import ExerciseHistory from "@/components/ExerciseHistory";
import ProgressPage from "@/app/progress/page";
import DualModeTimer from "@/components/DualModeTimer";

const STORAGE_KEY = "posture_questionnaire";
const APP_STATE_KEY = "app_state_v1";

describe("session tracking integration flow", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells", "bands"],
        daysPerWeek: 3,
      })
    );
    mocks.searchParams = "programId=program-strength&dayIndex=0";
    mocks.programs.clear();
    mocks.sessions = [];
    mocks.logs = [];
    mocks.idCounter = 0;
    mocks.progressByProgramId.clear();
    mocks.prefs = {
      schemaVersion: 2,
      timerPrefs: { workSeconds: 60, restSeconds: 60 },
      timerPrefsByExercise: {
        "dumbbell-rows": { workSeconds: 40, restSeconds: 20 },
        plank: { workSeconds: 45, restSeconds: 30 },
      },
    };

    mocks.programs.set(
      "program-strength",
      makeProgram({
        id: "program-strength",
        daysPerWeek: 3,
        dayTitle: "Strength Day",
        routine: [
          {
            exerciseId: "dumbbell-rows",
            section: "main",
            sets: "2",
            reps: "8-10",
            durationSec: null,
            restSec: 60,
            loadType: "weighted",
          },
        ],
      })
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test("completes session, persists log fields, and surfaces data in history/progress", async () => {
    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText(/Guided session/i)).toBeTruthy();
      expect(screen.getByText(/dumbbell rows/i)).toBeTruthy();
    });

    fireEvent.change(screen.getByTestId("weight-input"), {
      target: { value: "55" },
    });
    fireEvent.change(screen.getByTestId("reps-input"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId("rpe-input"), {
      target: { value: "8" },
    });
    expect(screen.getByTestId("about-to-record-rpe").textContent).toContain("8");
    fireEvent.click(screen.getByLabelText("Set 1"));
    fireEvent.click(screen.getByLabelText("Set 2"));
    fireEvent.click(screen.getByTestId("report-pain-trigger"));
    fireEvent.click(screen.getByTestId("pain-level-moderate"));
    fireEvent.change(screen.getByTestId("pain-report-location"), {
      target: { value: "shoulder" },
    });
    fireEvent.change(screen.getByTestId("pain-report-notes"), {
      target: { value: "pinch on last reps" },
    });
    fireEvent.click(screen.getByTestId("pain-report-save"));
    await waitFor(() => {
      expect(screen.queryByTestId("pain-report-modal")).toBeNull();
    });

    fireEvent.click(screen.getByTestId("session-next"));

    await waitFor(() => {
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    expect(screen.queryByTestId("session-feedback-summary")).toBeNull();
    fireEvent.change(screen.getByTestId("session-feedback-difficulty"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByTestId("session-feedback-pain-before"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByTestId("session-feedback-pain-after"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByTestId("session-feedback-energy-4"));
    fireEvent.click(screen.getByTestId("session-feedback-confidence-4"));
    fireEvent.change(screen.getByTestId("session-feedback-notes"), {
      target: { value: "  Grip felt steady.  " },
    });
    fireEvent.click(screen.getByTestId("session-feedback-save"));

    await waitFor(() => {
      expect(screen.getByTestId("session-feedback-summary").textContent).toBe(
        "Difficulty 10/10 • Pain 2 -> 3 • Energy 4/5 • Confidence 4/5"
      );
    });
    expect(screen.getByTestId("adaptation-preview").textContent).toContain(
      "Next-time preview: keep this pattern steady."
    );
    expect(screen.getByTestId("adaptation-preview").textContent).toContain(
      "Preview only; no workout has been changed."
    );

    expect(mocks.sessions.length).toBe(1);
    expect(mocks.sessions[0].feedback).toEqual({
      completed: "yes",
      difficultyRPE: 10,
      painBefore: 2,
      painAfter: 3,
      energy: 4,
      techniqueConfidence: 4,
      notes: "Grip felt steady.",
    });
    expect(mocks.logs.length).toBe(1);
    const [savedLog] = mocks.logs;
    expect(savedLog.exerciseId).toBe("dumbbell-rows");
    expect(savedLog.weight).toBe(55);
    expect(savedLog.reps).toBe(10);
    expect(savedLog.setsCompleted).toBe(2);
    expect(savedLog.rpe).toBe(8);
    expect(savedLog.felt).toBe("pain");
    expect(savedLog.painLocation).toBe("shoulder");
    expect(savedLog.nextTimeGuidance).toBeTruthy();
    expect(
      mocks.progressByProgramId.get("program-strength")?.workoutsCompletedInPhase
    ).toBe(1);
    expect(
      mocks.progressByProgramId.get("program-strength")?.cyclesCompletedInPhase
    ).toBe(0);

    cleanup();
    mocks.searchParams = "programId=program-strength&dayIndex=0";
    render(React.createElement(SessionClient));
    await waitFor(() => {
      expect(screen.getByTestId("next-time-guidance")).toBeTruthy();
    });
    expect(screen.getByTestId("next-time-guidance").textContent).toContain("Next time:");

    cleanup();
    render(React.createElement(ExerciseHistory, { exerciseId: "dumbbell-rows" }));
    await waitFor(() => {
      expect(screen.getByText("History")).toBeTruthy();
    });
    expect(screen.getByText(/dumbbell rows/i)).toBeTruthy();
    expect(screen.getByText(/10 reps/i)).toBeTruthy();

    cleanup();
    render(React.createElement(ProgressPage));
    await waitFor(() => {
      expect(screen.getByText("Training insights")).toBeTruthy();
    });
    expect(screen.queryByText("No completed sessions yet.")).toBeNull();
    expect(screen.getByText("2026-02-15")).toBeTruthy();
    expect(
      screen.getByText("Coach read: symptoms stable, effort high, confidence good.")
    ).toBeTruthy();
    expect(screen.getByTestId("adaptation-preview").textContent).toContain(
      "Next-time preview: keep this pattern steady."
    );
    expect(screen.getByTestId("adaptation-preview").textContent).toContain(
      "Preview only; no workout has been changed."
    );
  });

  test("old completed sessions without feedback render history without a preview", async () => {
    mocks.sessions = [
      {
        id: "old-session",
        userId: null,
        startedAt: "2026-02-15T00:00:00.000Z",
        completedAt: "2026-02-15T00:30:00.000Z",
        createdAt: "2026-02-15T00:00:00.000Z",
        updatedAt: "2026-02-15T00:30:00.000Z",
        routineId: "program-strength",
        durationSec: 1800,
        notes: "dayIndex:0",
        sessionFeedback: null,
        sessionPainLocation: null,
        sessionFeedbackNotes: null,
        source: "local",
        deletedAt: null,
      },
    ];

    render(React.createElement(ProgressPage));

    await waitFor(() => {
      expect(screen.getByText("Training insights")).toBeTruthy();
    });
    expect(screen.getByText("2026-02-15")).toBeTruthy();
    expect(screen.queryByTestId("adaptation-preview")).toBeNull();
  });

  test("timed vs reps-based exercises show capability-specific timer/logging UI", async () => {
    mocks.programs.set(
      "program-timed",
      makeProgram({
        id: "program-timed",
        daysPerWeek: 3,
        dayTitle: "Timed Day",
        routine: [
          {
            exerciseId: "plank",
            section: "main",
            sets: "2",
            reps: null,
            durationSec: 45,
            restSec: 30,
            loadType: "timed",
          },
        ],
      })
    );
    mocks.searchParams = "programId=program-timed&dayIndex=0";

    render(React.createElement(SessionClient));
    await waitFor(() => {
      expect(screen.getByText(/Plank/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "0:45" })).toBeTruthy();
    });
    expect(screen.queryByTestId("reps-input")).toBeNull();

    cleanup();
    mocks.searchParams = "programId=program-strength&dayIndex=0";
    render(React.createElement(SessionClient));
    await waitFor(() => {
      expect(screen.getByText(/Dumbbell Rows/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "0:40" })).toBeTruthy();
    });
    expect(screen.getByTestId("reps-input")).toBeTruthy();
    expect(screen.getByRole("button", { name: "0:40" })).toBeTruthy();
  });

  test("direct session route loads the active generated program from app state", async () => {
    mocks.searchParams = "";
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        programId: "program-strength",
        activeProgramId: "program-strength",
        programVersion: 1,
        updatedAt: Date.now(),
      })
    );

    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText(/Guided session/i)).toBeTruthy();
      expect(screen.getByText(/dumbbell rows/i)).toBeTruthy();
    });

    expect(screen.getByTestId("current-exercise-id").dataset.exerciseId).toBe(
      "dumbbell-rows"
    );
  });

  test("direct session route recovers the latest compatible saved program", async () => {
    mocks.searchParams = "";
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: "missing-active-program",
        programId: "missing-legacy-program",
        updatedAt: Date.now(),
      })
    );
    mocks.programs.set(
      "program-newer-incompatible",
      makeProgram({
        id: "program-newer-incompatible",
        daysPerWeek: 4,
        dayTitle: "Incompatible Day",
        updatedAt: "2026-02-16T00:00:00.000Z",
        templateVersion: PROGRAM_TEMPLATE_VERSION,
        routine: [
          {
            exerciseId: "plank",
            section: "main",
            sets: "1",
            reps: null,
            durationSec: 30,
            restSec: 30,
            loadType: "timed",
          },
        ],
      })
    );
    mocks.programs.set(
      "program-compatible-latest",
      makeProgram({
        id: "program-compatible-latest",
        daysPerWeek: 3,
        dayTitle: "Recovered Program Day",
        updatedAt: "2026-02-15T12:00:00.000Z",
        templateVersion: PROGRAM_TEMPLATE_VERSION,
        routine: [
          {
            exerciseId: "band-row",
            section: "main",
            sets: "2",
            reps: "10-12",
            durationSec: null,
            restSec: 45,
            loadType: "assisted",
          },
        ],
      })
    );

    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getAllByText(/Recovered Program Day/i).length).toBeGreaterThan(0);
      expect(screen.getByTestId("current-exercise-id").dataset.exerciseId).toBe(
        "band-row"
      );
    });
  });

  test("direct session route does not generate a questionnaire-only routine when no program exists", async () => {
    mocks.searchParams = "";
    mocks.programs.clear();
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: "missing-active-program",
        programId: "missing-legacy-program",
        updatedAt: Date.now(),
      })
    );

    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText("No saved Praxis program found")).toBeTruthy();
    });
    expect(screen.queryByTestId("current-exercise-id")).toBeNull();
    expect(screen.getByRole("link", { name: "Back to results" })).toBeTruthy();
  });

  test("auto-advances focus through logging inputs once all sets are complete", async () => {
    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText(/Guided session/i)).toBeTruthy();
      expect(screen.getByText(/dumbbell rows/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText("Set 1"));
    fireEvent.click(screen.getByLabelText("Set 2"));

    await waitFor(() => {
      expect((document.activeElement as HTMLElement | null)?.id).toBe("weight-input");
    });

    fireEvent.change(screen.getByTestId("weight-input"), {
      target: { value: "55" },
    });
    fireEvent.blur(screen.getByTestId("weight-input"), { relatedTarget: null });
    await waitFor(() => {
      expect((document.activeElement as HTMLElement | null)?.id).toBe("reps-input");
    });

    fireEvent.change(screen.getByTestId("reps-input"), {
      target: { value: "10" },
    });
    fireEvent.blur(screen.getByTestId("reps-input"), { relatedTarget: null });
    await waitFor(() => {
      expect((document.activeElement as HTMLElement | null)?.id).toBe("rpe-input");
    });

    fireEvent.change(screen.getByTestId("rpe-input"), {
      target: { value: "8" },
    });
    fireEvent.blur(screen.getByTestId("rpe-input"), { relatedTarget: null });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Easy" }));
    });
  });

  test("timer start/pause/resume/reset does not auto-reset on pause", () => {
    vi.useFakeTimers();
    render(
      React.createElement(DualModeTimer, {
        initialExerciseSeconds: 40,
        initialRestSeconds: 20,
        defaultMode: "exercise",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "0:40" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("button", { name: "0:37" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "0:37" }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: "0:37" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "0:37" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("button", { name: "0:36" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "0:40" })).toBeTruthy();
    vi.useRealTimers();
  });
});
