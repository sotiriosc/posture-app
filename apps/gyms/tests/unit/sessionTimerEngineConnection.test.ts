/** @vitest-environment jsdom */

import React from "react";
import {
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
import type { SessionDraft } from "@/lib/sessionDraftStore";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { generateWeeklyProgram } from "@/lib/program";
import { getEffectiveTimer } from "@/lib/timerRules";

const formatSeconds = (value: number) => {
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const mocks = vi.hoisted(() => ({
  searchParams: "programId=program-timer&dayIndex=0",
  programs: new Map<string, Program>(),
  sessions: [] as SessionRecord[],
  logs: [] as ExerciseLog[],
  prefs: {
    schemaVersion: 2,
    timerPrefs: { workSeconds: 55, restSeconds: 35 },
  } as LogPrefs,
  progressByProgramId: new Map<string, ProgramProgress>(),
  idCounter: 0,
  savedDrafts: [] as SessionDraft[],
  targetProgramId: "program-timer",
  targetDayIndex: 0,
}));

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
  saveDraft: vi.fn(async (draft: SessionDraft) => {
    mocks.savedDrafts = [...mocks.savedDrafts, draft];
    return draft;
  }),
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

const STORAGE_KEY = "posture_questionnaire";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 4,
};

describe("session timer/engine/store connection", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questionnaire));
    mocks.programs.clear();
    mocks.sessions = [];
    mocks.logs = [];
    mocks.savedDrafts = [];
    mocks.idCounter = 0;
    mocks.progressByProgramId.clear();
    mocks.prefs = {
      schemaVersion: 2,
      timerPrefs: { workSeconds: 55, restSeconds: 35 },
    };

    const seededProgram = generateWeeklyProgram(questionnaire, "program-timer", {
      seed: "session-timer-engine-connection-seed",
    });
    const preferredDayIndex = seededProgram.week.findIndex((day) => {
      const sections = new Set(day.routine.map((item) => item.section));
      return sections.has("main") && sections.has("accessory");
    });
    const dayIndex = preferredDayIndex >= 0 ? preferredDayIndex : 0;

    mocks.targetProgramId = seededProgram.id;
    mocks.targetDayIndex = dayIndex;
    mocks.searchParams = `programId=${seededProgram.id}&dayIndex=${dayIndex}`;
    mocks.programs.set(seededProgram.id, seededProgram);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test("seeded session uses timerRules presets for each routine item", async () => {
    const program = mocks.programs.get(mocks.targetProgramId);
    expect(program).toBeTruthy();
    if (!program) return;

    const day = program.week[mocks.targetDayIndex];
    const routine = day.routine;
    expect(routine.length).toBeGreaterThan(0);

    const observedExerciseIds = new Set<string>();
    const observedTimers = new Map<string, { workSeconds: number; restSeconds: number }>();

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

      const expectedTimer = getEffectiveTimer(item, mocks.prefs.timerPrefs);
      const timerLine = `${expectedTimer.workSeconds}s work • ${expectedTimer.restSeconds}s rest`;
      expect(screen.getByText(timerLine)).toBeTruthy();
      expect(
        screen.getByRole("button", {
          name: formatSeconds(expectedTimer.workSeconds),
        })
      ).toBeTruthy();

      expect(observedExerciseIds.has(item.exerciseId)).toBe(false);
      observedExerciseIds.add(item.exerciseId);
      observedTimers.set(item.exerciseId, expectedTimer);

      if (index < routine.length - 1) {
        fireEvent.click(screen.getByTestId("session-next"));
      }
    }

    const mainExerciseIds = routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const accessoryExerciseIds = routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId);
    expect(mainExerciseIds.length).toBeGreaterThan(0);
    expect(accessoryExerciseIds.length).toBeGreaterThan(0);
    mainExerciseIds.forEach((exerciseId) => {
      expect(observedTimers.has(exerciseId)).toBe(true);
    });
    accessoryExerciseIds.forEach((exerciseId) => {
      expect(observedTimers.has(exerciseId)).toBe(true);
    });

    expect(observedExerciseIds.size).toBe(routine.length);
  });
});
