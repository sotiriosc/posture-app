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
  generateWeeklyProgram: vi.fn(),
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

vi.mock("@/lib/program", () => ({
  generateWeeklyProgram: mocks.generateWeeklyProgram,
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
    mocks.generateWeeklyProgram.mockReset();
    mocks.saveProgram.mockReset();
    mocks.saveProgramProgress.mockReset();
    mocks.uuid.mockReset();
    mocks.clearDraft.mockReset();

    mocks.loadTrainingSnapshot.mockResolvedValue(null);
    mocks.pushTrainingPatch.mockResolvedValue(undefined);
    mocks.uuid.mockReturnValue("program-new");
    mocks.clearDraft.mockResolvedValue(undefined);
    mocks.generateWeeklyProgram.mockImplementation(
      (questionnaire: typeof initialQuestionnaire, programId: string) => ({
        id: programId,
        userId: null,
        createdAt: "2026-02-15T00:00:00.000Z",
        updatedAt: "2026-02-15T00:00:00.000Z",
        templateVersion: 1,
        goalTrack: questionnaire.goals,
        daysPerWeek: questionnaire.daysPerWeek,
        estimatedSessionMinutesRange: { min: 45, max: 60 },
        phaseIndex: 1,
        phaseName: "Activation",
        cycleIndex: 1,
        week: [],
        source: "local",
        deletedAt: null,
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
