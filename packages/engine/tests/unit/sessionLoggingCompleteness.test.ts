/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

const mocks = vi.hoisted(() => ({
  searchParams: "programId=program-complete&dayIndex=0",
  programs: new Map<string, Program>(),
  sessions: [] as SessionRecord[],
  logs: [] as ExerciseLog[],
  swapEventCalls: [] as Array<{
    sessionId: string;
    originalExerciseId: string;
    swappedExerciseId?: string | null;
    painLevel: "none" | "mild" | "moderate" | "severe";
  }>,
  prefs: {
    schemaVersion: 2,
    timerPrefs: { workSeconds: 60, restSeconds: 45 },
  } as LogPrefs,
  progressByProgramId: new Map<string, ProgramProgress>(),
  idCounter: 0,
}));

const makeProgram = (): Program => ({
  id: "program-complete",
  userId: null,
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: "2026-02-15T00:00:00.000Z",
  templateVersion: 1,
  goalTrack: "Improve posture",
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  weekIndex: 1,
  totalWeekIndex: 1,
  cycleIndex: 1,
  week: [
    {
      dayIndex: 0,
      title: "Integrated Day",
      focusTags: ["posture", "full-body"],
      routine: [
        {
          exerciseId: "bird-dog",
          section: "warmup",
          sets: "1",
          reps: "6-8",
          durationSec: null,
          restSec: 30,
          loadType: "bodyweight",
        },
        {
          exerciseId: "dead-bug",
          section: "activation",
          sets: "1",
          reps: "8-10",
          durationSec: null,
          restSec: 30,
          loadType: "bodyweight",
        },
        {
          exerciseId: "dumbbell-rows",
          section: "main",
          sets: "2",
          reps: "8-10",
          durationSec: null,
          restSec: 60,
          loadType: "weighted",
        },
        {
          exerciseId: "band-row",
          section: "accessory",
          sets: "2",
          reps: "10-12",
          durationSec: null,
          restSec: 45,
          loadType: "bodyweight",
        },
        {
          exerciseId: "hamstring-stretch",
          section: "cooldown",
          sets: "1",
          reps: null,
          durationSec: 30,
          restSec: 30,
          loadType: "timed",
        },
      ],
    },
  ],
  source: "local",
  deletedAt: null,
});

const parseMinSets = (value: string | number | null) => {
  if (typeof value === "number") return Math.max(1, value);
  const match = String(value ?? "").match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : 1;
};

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
  listAllPrograms: vi.fn(async () => Array.from(mocks.programs.values())),
  listSessions: vi.fn(async (limit = 20) => mocks.sessions.slice(0, limit)),
  listSessionsByProgramId: vi.fn(async (programId: string) =>
    mocks.sessions.filter((session) => session.routineId === programId)
  ),
  loadPrefs: vi.fn(async () => mocks.prefs),
  nowIso: vi.fn(() => "2026-02-15T00:00:00.000Z"),
  saveExerciseLog: vi.fn(async (log: ExerciseLog) => {
    mocks.logs = [log, ...mocks.logs];
    return log;
  }),
  saveExerciseSwapEvent: vi.fn(async (params: {
    sessionId: string;
    originalExerciseId: string;
    swappedExerciseId?: string | null;
    painLevel: "none" | "mild" | "moderate" | "severe";
  }) => {
    mocks.swapEventCalls = [...mocks.swapEventCalls, params];
    return null;
  }),
  savePrefs: vi.fn(async (prefs: LogPrefs) => {
    mocks.prefs = prefs;
    return prefs;
  }),
  saveProgramProgress: vi.fn(async (progress: ProgramProgress) => {
    mocks.progressByProgramId.set(progress.programId, progress);
    return progress;
  }),
  updateSession: vi.fn(async (session: SessionRecord) => session),
  uuid: vi.fn(() => {
    mocks.idCounter += 1;
    return `uuid-${mocks.idCounter}`;
  }),
}));

import SessionClient from "@/app/session/SessionClient";

const STORAGE_KEY = "posture_questionnaire";

describe("session logging completeness", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["gym"],
        daysPerWeek: 3,
      })
    );

    mocks.searchParams = "programId=program-complete&dayIndex=0";
    mocks.programs.clear();
    mocks.sessions = [];
    mocks.logs = [];
    mocks.swapEventCalls = [];
    mocks.idCounter = 0;
    mocks.progressByProgramId.clear();
    mocks.prefs = {
      schemaVersion: 2,
      timerPrefs: { workSeconds: 60, restSeconds: 45 },
    };

    mocks.programs.set("program-complete", makeProgram());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("captures complete per-section logs and keeps swap-event logging exclusive to actual swaps", async () => {
    const program = mocks.programs.get("program-complete");
    expect(program).toBeTruthy();
    if (!program) return;

    const routine = program.week[0].routine;
    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText(/Guided session/i)).toBeTruthy();
    });

    for (let index = 0; index < routine.length; index += 1) {
      const item = routine[index];
      await waitFor(() => {
        expect(
          screen.getByTestId("current-exercise-id").getAttribute("data-exercise-id")
        ).toBe(item.exerciseId);
      });

      if (screen.queryByTestId("weight-input")) {
        fireEvent.change(screen.getByTestId("weight-input"), {
          target: { value: "45" },
        });
      }
      if (screen.queryByTestId("reps-input")) {
        fireEvent.change(screen.getByTestId("reps-input"), {
          target: { value: "10" },
        });
      }
      fireEvent.change(screen.getByTestId("rpe-input"), {
        target: { value: "7" },
      });

      screen
        .getAllByRole("checkbox")
        .forEach((checkbox) => fireEvent.click(checkbox));

      if (item.section === "main") {
        fireEvent.click(screen.getByTestId("report-pain-trigger"));
        fireEvent.click(screen.getByTestId("pain-level-moderate"));
        fireEvent.change(screen.getByTestId("pain-report-location"), {
          target: { value: "shoulder" },
        });
        fireEvent.change(screen.getByTestId("pain-report-notes"), {
          target: { value: "sharp on top range" },
        });
        fireEvent.click(screen.getByTestId("pain-report-save"));
        await waitFor(() => {
          expect(screen.queryByTestId("pain-report-modal")).toBeNull();
        });
      }

      fireEvent.click(screen.getByTestId("session-next"));
    }

    await waitFor(() => {
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    expect(mocks.logs.length).toBe(routine.length);
    const logsByExercise = new Map(mocks.logs.map((log) => [log.exerciseId, log]));

    routine.forEach((item) => {
      const log = logsByExercise.get(item.exerciseId);
      expect(log).toBeTruthy();
      if (!log) return;

      expect(log.exerciseId).toBe(item.exerciseId);
      expect(log.section).toBe(item.section);
      expect(log.sessionId).toBeTruthy();
      expect(log.programId).toBe("program-complete");
      expect(log.dayIndex).toBe(0);
      expect(log.createdAt).toBe("2026-02-15T00:00:00.000Z");
      expect(log.updatedAt).toBe("2026-02-15T00:00:00.000Z");
      expect(log.nextTimeGuidance).toBeTruthy();

      const expectedMinSets = parseMinSets(item.sets);
      expect(log.setsPlanned).toBe(expectedMinSets);
      expect(log.setsCompleted).toBe(expectedMinSets);

      if (item.section === "main" || item.section === "accessory") {
        expect(log.reps).toBeTruthy();
      }
    });

    const mainLog = logsByExercise.get("dumbbell-rows");
    expect(mainLog?.felt).toBe("pain");
    expect(mainLog?.painLevel).toBe("moderate");
    expect(mainLog?.painLocation).toBe("shoulder");

    expect(mocks.swapEventCalls.length).toBe(0);
  });
});
