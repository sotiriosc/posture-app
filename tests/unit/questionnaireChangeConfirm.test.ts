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

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  loadTrainingSnapshot: vi.fn(),
  pushTrainingPatch: vi.fn(),
  buildSignalsFromLocalState: vi.fn(),
  generateProgram: vi.fn(),
  saveProgram: vi.fn(),
  saveProgramProgress: vi.fn(),
  uuid: vi.fn(),
  clearDraft: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock("@/lib/trainingSyncClient", () => ({
  loadTrainingSnapshot: mocks.loadTrainingSnapshot,
  pushTrainingPatch: mocks.pushTrainingPatch,
}));

vi.mock("@/lib/engine", () => ({
  buildSignalsFromLocalState: mocks.buildSignalsFromLocalState,
  generateProgram: mocks.generateProgram,
}));

vi.mock("@/lib/logStore", () => ({
  saveProgram: mocks.saveProgram,
  saveProgramProgress: mocks.saveProgramProgress,
  uuid: mocks.uuid,
}));

vi.mock("@/lib/sessionDraftStore", () => ({
  clearDraft: mocks.clearDraft,
}));

import QuestionnaireForm from "@/components/QuestionnaireForm";

const STORAGE_KEY = "posture_questionnaire";
const APP_STATE_KEY = "app_state_v1";

const initialQuestionnaire = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3,
};

describe("questionnaire change confirmation flow", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestionnaire));
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        programId: "program-old",
        activeProgramId: "program-old",
        activeSessionId: "session-live",
        programVersion: 2,
        updatedAt: Date.now(),
      })
    );

    mocks.routerPush.mockReset();
    mocks.loadTrainingSnapshot.mockReset();
    mocks.pushTrainingPatch.mockReset();
    mocks.buildSignalsFromLocalState.mockReset();
    mocks.generateProgram.mockReset();
    mocks.saveProgram.mockReset();
    mocks.saveProgramProgress.mockReset();
    mocks.uuid.mockReset();
    mocks.clearDraft.mockReset();

    mocks.loadTrainingSnapshot.mockResolvedValue(null);
    mocks.pushTrainingPatch.mockResolvedValue(undefined);
    mocks.buildSignalsFromLocalState.mockImplementation(
      async ({ questionnaire }: { questionnaire?: typeof initialQuestionnaire }) => ({
        questionnaire: questionnaire ?? initialQuestionnaire,
        history: {
          sessions: [],
          exerciseLogs: [],
          programProgress: null,
        },
        prefs: null,
        nowIso: "2026-02-15T00:00:00.000Z",
      })
    );
    mocks.uuid.mockReturnValue("program-new");
    mocks.clearDraft.mockResolvedValue(undefined);
    mocks.generateProgram.mockImplementation(
      ({
        nextProgramId,
        signals,
      }: {
        nextProgramId: string;
        signals: { questionnaire: typeof initialQuestionnaire };
      }) => ({
        status: "generated",
        program: {
        id: nextProgramId,
        userId: null,
        createdAt: "2026-02-15T00:00:00.000Z",
        updatedAt: "2026-02-15T00:00:00.000Z",
        templateVersion: 1,
        goalTrack: signals.questionnaire.goals,
        daysPerWeek: signals.questionnaire.daysPerWeek,
        estimatedSessionMinutesRange: { min: 45, max: 60 },
        phaseIndex: 1,
        phaseName: "Activation",
        cycleIndex: 1,
        week: [],
        source: "local",
        deletedAt: null,
        },
        seed: "test-seed",
        debug: {
          mode: "weekly",
          seed: "test-seed",
          settingsHash: "settings",
          target: {
            phaseIndex: 1,
            cycleIndex: 1,
            weekIndex: 1,
            totalWeekIndex: 1,
          },
          progression: {
            complianceRate: 0,
            painFlag: false,
            fatigueFlag: false,
            completedSessionsCount: 0,
            completedWeeksCount: 0,
            recentLogCount: 0,
            recentSessionCount: 0,
          },
        },
      })
    );
    mocks.saveProgram.mockImplementation(async (program: unknown) => program);
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);

    render(React.createElement(QuestionnaireForm));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("confirmation appears on submit and cancel restores prior values", async () => {
    fireEvent.click(screen.getByTestId("days-4"));

    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();

    fireEvent.click(screen.getByTestId("generate-routine"));

    expect(screen.getByTestId("questionnaire-change-confirm-modal")).toBeTruthy();
    expect(screen.getByTestId("questionnaire-change-confirm-modal").textContent).toContain(
      "Your selection changed. Your workout will update."
    );

    fireEvent.click(screen.getByTestId("questionnaire-change-cancel"));

    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();
    expect(screen.getByTestId("days-3").className).toContain("bg-slate-900");

    const savedQuestionnaire = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as typeof initialQuestionnaire;
    expect(savedQuestionnaire.daysPerWeek).toBe(3);

    const appState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}") as {
      programId?: string;
    };
    expect(appState.programId).toBe("program-old");
    expect(mocks.saveProgram).not.toHaveBeenCalled();
  });

  test("confirm commits questionnaire and regenerates active program", async () => {
    fireEvent.click(screen.getByTestId("days-4"));
    fireEvent.click(screen.getByTestId("generate-routine"));
    fireEvent.click(screen.getByTestId("questionnaire-change-confirm"));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledTimes(1);
      expect(mocks.saveProgramProgress).toHaveBeenCalledTimes(1);
    });

    expect(mocks.clearDraft).toHaveBeenCalledWith("session-live");
    expect(mocks.routerPush).toHaveBeenCalledWith("/results");

    const appState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}") as {
      programId?: string;
      activeProgramId?: string;
      activeSessionId?: string;
      questionnaireSignature?: string;
    };
    expect(appState.programId).toBe("program-new");
    expect(appState.activeProgramId).toBe("program-new");
    expect(appState.activeSessionId).toBeUndefined();
    expect(typeof appState.questionnaireSignature).toBe("string");

    const savedQuestionnaire = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as typeof initialQuestionnaire;
    expect(savedQuestionnaire.daysPerWeek).toBe(4);
  });

  test("unchanged submit still regenerates to allow same-profile variety", async () => {
    fireEvent.click(screen.getByTestId("generate-routine"));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledTimes(1);
      expect(mocks.saveProgramProgress).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();
    expect(mocks.clearDraft).toHaveBeenCalledWith("session-live");
    expect(mocks.routerPush).toHaveBeenCalledWith("/results");
  });
});
