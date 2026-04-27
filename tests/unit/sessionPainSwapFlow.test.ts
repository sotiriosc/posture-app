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
import type { SessionDraft } from "@/lib/sessionDraftStore";

const mocks = vi.hoisted(() => ({
  searchParams: "programId=program-swap&dayIndex=0",
  programs: new Map<string, Program>(),
  sessions: [] as SessionRecord[],
  logs: [] as ExerciseLog[],
  swapEvents: [] as ExerciseLog[],
  prefs: {
    schemaVersion: 2,
    timerPrefs: { workSeconds: 60, restSeconds: 60 },
  } as LogPrefs,
  progressByProgramId: new Map<string, ProgramProgress>(),
  idCounter: 0,
  latestDraft: null as SessionDraft | null,
}));

const makeProgram = (): Program => ({
  id: "program-swap",
  userId: null,
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: "2026-02-15T00:00:00.000Z",
  templateVersion: 1,
  goalTrack: "Improve posture",
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  week: [
    {
      dayIndex: 0,
      title: "Upper Pull + Thoracic Posture",
      focusTags: ["upper", "pull"],
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
  saveDraft: vi.fn(async (draft: SessionDraft) => {
    mocks.latestDraft = draft;
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
    mocks.logs.filter((log) => log.exerciseId === exerciseId)
  ),
  listAllPrograms: vi.fn(async () => Array.from(mocks.programs.values())),
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
    programId?: string | null;
    dayIndex?: number | null;
    loadType?: ExerciseLog["loadType"];
    timestamp?: string;
  }) => {
    const log: ExerciseLog & { painLevel?: string | null } = {
      id: `swap-${mocks.swapEvents.length + 1}`,
      userId: null,
      sessionId: params.sessionId,
      exerciseId: params.originalExerciseId,
      originalExerciseId: params.originalExerciseId,
      substitutedExerciseId: params.swappedExerciseId ?? null,
      programId: params.programId ?? null,
      dayIndex: params.dayIndex ?? null,
      createdAt: params.timestamp ?? "2026-02-15T00:00:00.000Z",
      updatedAt: params.timestamp ?? "2026-02-15T00:00:00.000Z",
      loadType: params.loadType ?? "bodyweight",
      unit: null,
      weight: null,
      reps: null,
      repsBySet: null,
      setsPlanned: null,
      setsCompleted: null,
      durationSec: null,
      workSecondsUsed: null,
      restSecondsUsed: null,
      rpe: null,
      felt: params.painLevel === "moderate" || params.painLevel === "severe" ? "pain" : "moderate",
      painLevel: params.painLevel,
      painLocation: null,
      feedbackNotes: "pain-trigger swap event",
      notes: null,
      computedVolume: null,
      source: "local",
      deletedAt: null,
    };
    mocks.swapEvents = [log, ...mocks.swapEvents];
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
  updateSession: vi.fn(async (session: SessionRecord) => session),
  uuid: vi.fn(() => {
    mocks.idCounter += 1;
    return `uuid-${mocks.idCounter}`;
  }),
}));

import SessionClient from "@/app/session/SessionClient";

const STORAGE_KEY = "posture_questionnaire";

describe("session pain-trigger swap flow", () => {
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

    mocks.searchParams = "programId=program-swap&dayIndex=0";
    mocks.programs.clear();
    mocks.sessions = [];
    mocks.logs = [];
    mocks.swapEvents = [];
    mocks.idCounter = 0;
    mocks.progressByProgramId.clear();
    mocks.latestDraft = null;
    mocks.prefs = {
      schemaVersion: 2,
      timerPrefs: { workSeconds: 60, restSeconds: 60 },
    };

    mocks.programs.set("program-swap", makeProgram());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("moderate pain report swaps exercise and persists swap event", async () => {
    render(React.createElement(SessionClient));

    await waitFor(() => {
      expect(screen.getByText(/Guided session/i)).toBeTruthy();
      expect(
        screen.getByTestId("current-exercise-id").getAttribute("data-exercise-id")
      ).toBe(
        "dumbbell-rows"
      );
    });

    fireEvent.click(screen.getByTestId("report-pain-trigger"));
    expect(screen.getByTestId("pain-report-modal")).toBeTruthy();

    fireEvent.click(screen.getByTestId("pain-level-moderate"));
    fireEvent.click(screen.getByTestId("pain-report-swap"));

    await waitFor(() => {
      const currentId = screen
        .getByTestId("current-exercise-id")
        .getAttribute("data-exercise-id");
      expect(currentId).toBeTruthy();
      expect(currentId).not.toBe("dumbbell-rows");
    });

    expect(mocks.swapEvents.length).toBe(1);
    const [swapEvent] = mocks.swapEvents;
    expect(swapEvent.originalExerciseId).toBe("dumbbell-rows");
    expect(swapEvent.substitutedExerciseId).toBeTruthy();
    expect(swapEvent.substitutedExerciseId).not.toBe("dumbbell-rows");
    expect((swapEvent as ExerciseLog & { painLevel?: string }).painLevel).toBe(
      "moderate"
    );

    const expectedDraftKey = "Upper Pull + Thoracic Posture-dumbbell-rows";
    expect(mocks.latestDraft?.entries.substitutionByItemId?.[expectedDraftKey]).toBe(
      swapEvent.substitutedExerciseId
    );
  });
});
