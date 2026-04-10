/** @vitest-environment jsdom */

import React, { useEffect, useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { loadAppState } from "@/lib/appState";
import type { Program } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  loadTrainingSnapshot: vi.fn(),
  pushTrainingPatch: vi.fn(),
  buildSignalsFromLocalState: vi.fn(),
  generateProgram: vi.fn(),
  saveProgram: vi.fn(),
  saveProgramProgress: vi.fn(),
  getProgram: vi.fn(),
  uuid: vi.fn(),
  clearDraft: vi.fn(),
  programsById: new Map<string, Program>(),
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
  getProgram: mocks.getProgram,
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

const buildProgram = (programId: string, daysPerWeek: 3 | 4 | 5): Program => ({
  id: programId,
  userId: null,
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: "2026-02-15T00:00:00.000Z",
  templateVersion: 1,
  goalTrack: initialQuestionnaire.goals,
  daysPerWeek,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  week: Array.from({ length: daysPerWeek }).map((_, index) => ({
    dayIndex: index,
    title: `Day ${index + 1}`,
    focusTags: ["upper"],
    routine: [],
  })),
  source: "local",
  deletedAt: null,
});

const ProgramDashboardProbe = () => {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      const state = loadAppState();
      const programId = state?.activeProgramId ?? state?.programId;
      if (!programId) {
        setDays(null);
        return;
      }
      const program = await mocks.getProgram(programId);
      setDays(program?.daysPerWeek ?? null);
    };
    void hydrate();
  }, []);

  return React.createElement(
    "div",
    { "data-testid": "program-days-probe" },
    days ?? "none"
  );
};

describe("questionnaire -> confirm -> program view connection", () => {
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
    mocks.getProgram.mockReset();
    mocks.uuid.mockReset();
    mocks.clearDraft.mockReset();
    mocks.programsById.clear();

    mocks.programsById.set("program-old", buildProgram("program-old", 3));

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
        program: buildProgram(
          nextProgramId,
          signals.questionnaire.daysPerWeek as 3 | 4 | 5
        ),
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
    mocks.saveProgram.mockImplementation(async (program: Program) => {
      mocks.programsById.set(program.id, program);
      return program;
    });
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);
    mocks.getProgram.mockImplementation(
      async (programId: string) => mocks.programsById.get(programId) ?? null
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("cancel keeps old program; confirm updates dashboard program and clears active session", async () => {
    render(React.createElement(QuestionnaireForm));

    fireEvent.click(screen.getByTestId("days-4"));
    fireEvent.click(screen.getByTestId("generate-routine"));
    expect(screen.getByTestId("questionnaire-change-confirm-modal")).toBeTruthy();
    fireEvent.click(screen.getByTestId("questionnaire-change-cancel"));

    cleanup();
    render(React.createElement(ProgramDashboardProbe));
    await waitFor(() => {
      expect(screen.getByTestId("program-days-probe").textContent).toBe("3");
    });

    cleanup();
    render(React.createElement(QuestionnaireForm));
    fireEvent.click(screen.getByTestId("days-4"));
    fireEvent.click(screen.getByTestId("generate-routine"));
    fireEvent.click(screen.getByTestId("questionnaire-change-confirm"));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledTimes(1);
      expect(mocks.saveProgramProgress).toHaveBeenCalledTimes(1);
      expect(mocks.routerPush).toHaveBeenCalledWith("/results");
    });

    cleanup();
    render(React.createElement(ProgramDashboardProbe));
    await waitFor(() => {
      expect(screen.getByTestId("program-days-probe").textContent).toBe("4");
    });

    const appState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}") as {
      activeSessionId?: string;
      activeProgramId?: string;
      lastRoute?: string;
    };
    expect(appState.activeSessionId).toBeUndefined();
    expect(appState.activeProgramId).toBe("program-new");
    expect(appState.lastRoute).toBe("/results");
  });
});
