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
}): Program => ({
  id: params.id,
  userId: null,
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: "2026-02-15T00:00:00.000Z",
  templateVersion: 1,
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
  listSessions: vi.fn(async (limit = 20) => mocks.sessions.slice(0, limit)),
  loadPrefs: vi.fn(async () => mocks.prefs),
  nowIso: vi.fn(() => "2026-02-15T00:00:00.000Z"),
  saveExerciseLog: vi.fn(async (log: ExerciseLog) => {
    mocks.logs = [log, ...mocks.logs];
    return log;
  }),
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
    fireEvent.click(screen.getByLabelText("Set 1"));
    fireEvent.click(screen.getByLabelText("Set 2"));
    fireEvent.click(screen.getByRole("button", { name: "Pain / discomfort" }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "shoulder" },
    });

    fireEvent.click(screen.getByTestId("session-next"));

    await waitFor(() => {
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    expect(mocks.sessions.length).toBe(1);
    expect(mocks.logs.length).toBe(1);
    const [savedLog] = mocks.logs;
    expect(savedLog.exerciseId).toBe("dumbbell-rows");
    expect(savedLog.weight).toBe(55);
    expect(savedLog.reps).toBe(10);
    expect(savedLog.setsCompleted).toBe(2);
    expect(savedLog.rpe).toBe(8);
    expect(savedLog.felt).toBe("pain");
    expect(savedLog.painLocation).toBe("shoulder");

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
