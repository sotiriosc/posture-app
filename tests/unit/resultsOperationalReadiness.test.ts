/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PROGRAM_TEMPLATE_VERSION } from "@/lib/program";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import type { Program } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  loadTrainingSnapshot: vi.fn(),
  pushTrainingPatch: vi.fn(),
  buildEngineSignals: vi.fn(),
  buildSignalsFromLocalState: vi.fn(),
  generateProgram: vi.fn(),
  getProgramProgress: vi.fn(),
  getLatestProgram: vi.fn(),
  getProgram: vi.fn(),
  listSessions: vi.fn(),
  listExerciseLogsByExercise: vi.fn(),
  listExerciseLogsBySessionIds: vi.fn(),
  loadPrefs: vi.fn(),
  saveProgram: vi.fn(),
  saveProgramProgress: vi.fn(),
  uuid: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock("@/components/PhotoContext", () => ({
  usePhotoContext: () => ({ photos: {} }),
}));

vi.mock("@/lib/trainingSyncClient", () => ({
  loadTrainingSnapshot: mocks.loadTrainingSnapshot,
  pushTrainingPatch: mocks.pushTrainingPatch,
}));

vi.mock("@/lib/engine", () => ({
  buildEngineSignals: mocks.buildEngineSignals,
  buildSignalsFromLocalState: mocks.buildSignalsFromLocalState,
  generateProgram: mocks.generateProgram,
}));

vi.mock("@/lib/logStore", () => ({
  getProgramProgress: mocks.getProgramProgress,
  getLatestProgram: mocks.getLatestProgram,
  getProgram: mocks.getProgram,
  listSessions: mocks.listSessions,
  listExerciseLogsByExercise: mocks.listExerciseLogsByExercise,
  listExerciseLogsBySessionIds: mocks.listExerciseLogsBySessionIds,
  loadPrefs: mocks.loadPrefs,
  saveProgram: mocks.saveProgram,
  saveProgramProgress: mocks.saveProgramProgress,
  uuid: mocks.uuid,
}));

vi.mock("@/lib/poseAnalyzer", () => ({
  analyzeImagePose: vi.fn(),
  computeMetrics: vi.fn(),
  generateObservations: vi.fn(),
}));

vi.mock("@/lib/assessmentEngine", () => ({
  buildAssessmentReport: vi.fn(() => ({
    observations: [],
    priorities: [],
  })),
}));

vi.mock("@/lib/sessionDraftStore", () => ({
  clearDraftsByProgramId: vi.fn(async () => undefined),
}));

import ResultsRoutine from "@/components/ResultsRoutine";

const STORAGE_KEY = "posture_questionnaire";
const APP_STATE_KEY = "app_state_v1";
const questionnaire = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3 as const,
};

const buildSavedProgram = (programId: string): Program => ({
  id: programId,
  userId: null,
  createdAt: "2026-04-11T12:00:00.000Z",
  updatedAt: "2026-04-11T12:00:00.000Z",
  templateVersion: PROGRAM_TEMPLATE_VERSION,
  goalTrack: questionnaire.goals,
  daysPerWeek: questionnaire.daysPerWeek,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  cycleIndex: 1,
  weekIndex: 1,
  totalWeekIndex: 1,
  week: Array.from({ length: questionnaire.daysPerWeek }, (_, index) => ({
    dayIndex: index,
    title: `Day ${index + 1}`,
    focusTags: ["upper"],
    routine: [
      {
        exerciseId: "band-row",
        section: "main",
        sets: 3,
        reps: "10-12",
        loadType: "weighted",
      },
    ],
  })),
  source: "local",
  deletedAt: null,
});

describe("results operational readiness", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questionnaire));

    mocks.routerPush.mockReset();
    mocks.loadTrainingSnapshot.mockReset();
    mocks.pushTrainingPatch.mockReset();
    mocks.buildEngineSignals.mockReset();
    mocks.buildSignalsFromLocalState.mockReset();
    mocks.generateProgram.mockReset();
    mocks.getProgramProgress.mockReset();
    mocks.getLatestProgram.mockReset();
    mocks.getProgram.mockReset();
    mocks.listSessions.mockReset();
    mocks.listExerciseLogsByExercise.mockReset();
    mocks.listExerciseLogsBySessionIds.mockReset();
    mocks.loadPrefs.mockReset();
    mocks.saveProgram.mockReset();
    mocks.saveProgramProgress.mockReset();
    mocks.uuid.mockReset();
    mocks.writeText.mockReset();

    mocks.loadTrainingSnapshot.mockResolvedValue(null);
    mocks.pushTrainingPatch.mockResolvedValue(undefined);
    mocks.buildEngineSignals.mockImplementation((params: unknown) => params);
    mocks.buildSignalsFromLocalState.mockResolvedValue({
      questionnaire: {
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["bands"],
        daysPerWeek: 3,
      },
      history: {
        sessions: [],
        exerciseLogs: [],
        programProgress: null,
      },
      prefs: null,
      nowIso: "2026-04-11T12:00:00.000Z",
    });
    mocks.generateProgram.mockReturnValue({
      status: "blocked",
      message: "No eligible weekly program found for this profile.",
    });
    mocks.getProgramProgress.mockResolvedValue(null);
    mocks.getLatestProgram.mockResolvedValue(null);
    mocks.getProgram.mockResolvedValue(null);
    mocks.listSessions.mockResolvedValue([]);
    mocks.listExerciseLogsByExercise.mockResolvedValue([]);
    mocks.listExerciseLogsBySessionIds.mockResolvedValue([]);
    mocks.loadPrefs.mockResolvedValue({ schemaVersion: 2 });
    mocks.saveProgram.mockImplementation(async (program: unknown) => program);
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);
    mocks.uuid.mockReturnValue("results-program");
    mocks.writeText.mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: mocks.writeText,
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ enabled: false, authenticated: false, user: null }),
      }))
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("shows a recovery path instead of an indefinite loading state when generation returns no program", async () => {
    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(
        screen.getByText(/We couldn't generate your weekly program yet/i)
      ).toBeTruthy();
    });

    expect(screen.getByText(/No eligible weekly program found/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review questionnaire/i })).toBeTruthy();
    expect(screen.queryByText(/Loading your weekly program/i)).toBeNull();
    expect(mocks.generateProgram).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "weekly",
        nextProgramId: "results-program",
        initialVariationSeed: "results-program",
      })
    );
  });

  test("reopening a saved active program does not silently regenerate or reshuffle it", async () => {
    const savedProgram = buildSavedProgram("saved-program");
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        activeInitialVariationSeed: "saved-program",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(questionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.getProgram).toHaveBeenCalledWith(savedProgram.id);
    });

    expect(mocks.generateProgram).not.toHaveBeenCalled();
    expect(screen.getByText("Phase Preview (Reference)")).toBeTruthy();
    expect(screen.queryByTestId("program-reference-body")).toBeNull();
    expect(screen.getByText("Current Saved Week")).toBeTruthy();
    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("CURRENT SAVED WEEK (LIVE PROGRAM SNAPSHOT)");
    expect(currentSnapshot).toContain("Program ID: saved-program");
    expect(currentSnapshot).toContain("Generation Mode: live_initial");
    expect(currentSnapshot).toContain("Initial Live Variation Slot: saved-program");
    expect(currentSnapshot).toContain("Day 1: Day 1");
    expect(currentSnapshot).toContain("Routine: Band Row");
    expect(currentSnapshot).not.toContain("DETERMINISTIC PHASE PREVIEW");

    fireEvent.click(screen.getByRole("button", { name: /Copy Current Saved Week/i }));

    expect(mocks.writeText).toHaveBeenCalledTimes(1);
    const copiedText = mocks.writeText.mock.calls[0]?.[0] as string;
    expect(copiedText).toContain("CURRENT SAVED WEEK (LIVE PROGRAM SNAPSHOT)");
    expect(copiedText).toContain("Program ID: saved-program");
    expect(copiedText).not.toContain("DETERMINISTIC PHASE PREVIEW");
    expect(screen.getByText("Week View")).toBeTruthy();
  });
});
