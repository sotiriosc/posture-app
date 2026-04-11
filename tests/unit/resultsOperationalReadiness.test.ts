/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PROGRAM_TEMPLATE_VERSION } from "@/lib/program";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import type { Program } from "@/lib/types";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

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
const buildQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3 as const,
  ...overrides,
});

const questionnaire = buildQuestionnaire();

const buildSavedProgram = (
  programId: string,
  options: {
    questionnaire?: QuestionnaireData;
    exerciseId?: string;
    daysPerWeek?: 3 | 4 | 5;
    weekLength?: number;
    questionnaireSignature?: string | null;
  } = {}
): Program => {
  const sourceQuestionnaire = options.questionnaire ?? questionnaire;
  const daysPerWeek = options.daysPerWeek ?? sourceQuestionnaire.daysPerWeek;
  const weekLength = options.weekLength ?? daysPerWeek;
  const signature =
    options.questionnaireSignature === null
      ? undefined
      : options.questionnaireSignature ?? buildQuestionnaireSignature(sourceQuestionnaire);
  return {
  id: programId,
  userId: null,
  createdAt: "2026-04-11T12:00:00.000Z",
  updatedAt: "2026-04-11T12:00:00.000Z",
  templateVersion: PROGRAM_TEMPLATE_VERSION,
  questionnaireSignature: signature,
  goalTrack: sourceQuestionnaire.goals,
  daysPerWeek,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Activation",
  cycleIndex: 1,
  weekIndex: 1,
  totalWeekIndex: 1,
  week: Array.from({ length: weekLength }, (_, index) => ({
    dayIndex: index,
    title: `Day ${index + 1}`,
    focusTags: ["upper"],
    routine: [
      {
        exerciseId: options.exerciseId ?? "band-row",
        section: "main",
        sets: 3,
        reps: "10-12",
        loadType: "weighted",
      },
    ],
  })),
  source: "local",
  deletedAt: null,
  };
};

const mockLiveGeneratedProgram = (program: Program) => {
  mocks.generateProgram.mockImplementation(
    (request: { phaseIndex?: number; nextProgramId?: string }) => {
      if (request.nextProgramId?.includes("progression-inspection-phase")) {
        const phaseIndex = request.phaseIndex ?? 1;
        return {
          status: "generated",
          program: {
            ...buildSavedProgram(request.nextProgramId, {
              questionnaire: {
                ...questionnaire,
                daysPerWeek: program.daysPerWeek,
              },
              daysPerWeek: program.daysPerWeek,
              weekLength: program.week.length,
              exerciseId: program.week[0]?.routine[0]?.exerciseId ?? "band-row",
            }),
            phaseIndex,
            phaseName: `Phase ${phaseIndex}`,
            totalWeekIndex: phaseIndex,
            week: program.week.map((day) => ({
              ...day,
              title: `Phase ${phaseIndex} ${day.title}`,
            })),
          },
          seed: "inspection-seed",
          debug: {
            mode: "weekly",
            seed: "inspection-seed",
            settingsHash: "settings-hash",
            target: {
              phaseIndex,
              cycleIndex: 1,
              weekIndex: 1,
              totalWeekIndex: phaseIndex,
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
        };
      }
      return {
        status: "generated",
        program,
        seed: "results-seed",
        debug: {
          mode: "weekly",
          seed: "results-seed",
          settingsHash: "settings-hash",
          target: {
            phaseIndex: program.phaseIndex ?? 1,
            cycleIndex: program.cycleIndex ?? 1,
            weekIndex: program.weekIndex ?? 1,
            totalWeekIndex: program.totalWeekIndex ?? 1,
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
      };
    }
  );
};

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
    mocks.buildSignalsFromLocalState.mockImplementation(async (params: {
      questionnaire: QuestionnaireData;
      nowIso?: string;
    }) => ({
      questionnaire: params.questionnaire,
      history: {
        sessions: [],
        exerciseLogs: [],
        programProgress: null,
      },
      prefs: null,
      nowIso: params.nowIso ?? "2026-04-11T12:00:00.000Z",
    }));
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

  test("first-time saved generation records truthful live initial metadata", async () => {
    const generatedProgram = buildSavedProgram("results-program");
    mocks.generateProgram.mockReturnValue({
      status: "generated",
      program: generatedProgram,
      seed: "results-seed",
      debug: {
        mode: "weekly",
        seed: "results-seed",
        settingsHash: "settings-hash",
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
    });

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledWith(generatedProgram);
    });

    const persistedState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}");
    expect(persistedState.activeProgramId).toBe("results-program");
    expect(persistedState.activeGenerationMode).toBe("live_initial");
    expect(persistedState.activeInitialVariationSeed).toBe("results-program");
    expect(mocks.generateProgram).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "weekly",
        nextProgramId: "results-program",
        initialVariationSeed: "results-program",
      })
    );
    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("Generation Mode: live_initial");
    expect(currentSnapshot).toContain("Initial Live Variation Slot: results-program");
    expect(currentSnapshot).toContain("FULL PROGRESSION SNAPSHOT");
    expect(currentSnapshot).toContain("PHASE 1:");
    expect(currentSnapshot).toContain("PHASE 2:");
    expect(currentSnapshot).toContain("PHASE 3:");
  });

  test.each([
    {
      label: "equipment changes",
      current: buildQuestionnaire({ equipment: ["bands"] }),
      saved: buildQuestionnaire({ equipment: ["dumbbells"] }),
      staleExerciseId: "dumbbell-rows",
    },
    {
      label: "experience changes",
      current: buildQuestionnaire({ experience: "Advanced" }),
      saved: buildQuestionnaire({ experience: "Beginner" }),
      staleExerciseId: "band-row",
    },
    {
      label: "pain areas change",
      current: buildQuestionnaire({ painAreas: ["Lower back"] }),
      saved: buildQuestionnaire({ painAreas: [] }),
      staleExerciseId: "band-row",
    },
  ])("rejects a saved active program when $label", async ({ current, saved, staleExerciseId }) => {
    const staleProgram = buildSavedProgram("stale-program", {
      questionnaire: saved,
      exerciseId: staleExerciseId,
    });
    const regeneratedProgram = buildSavedProgram("results-program", {
      questionnaire: current,
      exerciseId: "band-row",
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: staleProgram.id,
        programId: staleProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(saved),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(staleProgram);
    mockLiveGeneratedProgram(regeneratedProgram);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "results-program",
          questionnaireSignature: buildQuestionnaireSignature(current),
        })
      );
    });

    const liveGenerationCall = mocks.generateProgram.mock.calls.find(
      ([request]) => request.nextProgramId === "results-program"
    )?.[0];
    expect(liveGenerationCall).toEqual(
      expect.not.objectContaining({ currentProgram: staleProgram })
    );
    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("Program ID: results-program");
    expect(currentSnapshot).not.toContain("Program ID: stale-program");
  });

  test("5-day questionnaire never surfaces a 4-day saved live week as compatible", async () => {
    const savedQuestionnaire = buildQuestionnaire({
      equipment: ["dumbbells"],
      daysPerWeek: 4,
    });
    const currentQuestionnaire = buildQuestionnaire({
      equipment: ["bands"],
      daysPerWeek: 5,
    });
    const staleProgram = buildSavedProgram("stale-4-day-program", {
      questionnaire: savedQuestionnaire,
      daysPerWeek: 4,
      weekLength: 4,
      exerciseId: "dumbbell-rows",
    });
    const regeneratedProgram = buildSavedProgram("results-program", {
      questionnaire: currentQuestionnaire,
      daysPerWeek: 5,
      weekLength: 5,
      exerciseId: "band-row",
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentQuestionnaire));
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: staleProgram.id,
        programId: staleProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(savedQuestionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(staleProgram);
    mockLiveGeneratedProgram(regeneratedProgram);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "results-program",
          daysPerWeek: 5,
          week: expect.arrayContaining([
            expect.objectContaining({ dayIndex: 4 }),
          ]),
        })
      );
    });

    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("Days Per Week: 5");
    expect(currentSnapshot).toContain("Program ID: results-program");
    expect(currentSnapshot).toContain("Day 5: Day 5");
    expect(currentSnapshot).toContain("Routine: Band Row");
    expect(currentSnapshot).not.toContain("Program ID: stale-4-day-program");
    expect(currentSnapshot).not.toContain("Dumbbell Rows");
  });

  test("reopening a saved active program does not silently regenerate or reshuffle it", async () => {
    const savedProgram = buildSavedProgram("saved-program");
    const buildInspectionProgram = (phaseIndex: number): Program => ({
      ...buildSavedProgram(`saved-program-progression-inspection-phase-${phaseIndex}`),
      phaseIndex,
      phaseName: `Phase ${phaseIndex}`,
      totalWeekIndex: phaseIndex,
      week: savedProgram.week.map((day) => ({
        ...day,
        title: `Phase ${phaseIndex} ${day.title}`,
      })),
    });
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
    mocks.generateProgram.mockImplementation((request: { phaseIndex?: number; nextProgramId?: string }) => {
      if (request.nextProgramId?.includes("progression-inspection-phase")) {
        return {
          status: "generated",
          program: buildInspectionProgram(request.phaseIndex ?? 1),
          seed: "inspection-seed",
          debug: {
            mode: "weekly",
            seed: "inspection-seed",
            settingsHash: "settings-hash",
            target: {
              phaseIndex: request.phaseIndex ?? 1,
              cycleIndex: 1,
              weekIndex: 1,
              totalWeekIndex: request.phaseIndex ?? 1,
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
        };
      }
      return {
        status: "blocked",
        message: "No eligible weekly program found for this profile.",
      };
    });

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.getProgram).toHaveBeenCalledWith(savedProgram.id);
    });

    expect(mocks.generateProgram).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "weekly",
        nextProgramId: "saved-program-progression-inspection-phase-2",
        phaseIndex: 2,
      })
    );
    expect(mocks.generateProgram).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "weekly",
        nextProgramId: "saved-program-progression-inspection-phase-3",
        phaseIndex: 3,
      })
    );
    expect(screen.queryByText("Phase Preview (Reference)")).toBeNull();
    expect(screen.queryByTestId("program-reference-body")).toBeNull();
    expect(screen.getByText("Current Saved Program Snapshot")).toBeTruthy();
    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("CURRENT SAVED WEEK (LIVE PROGRAM SNAPSHOT)");
    expect(currentSnapshot).toContain("FULL PROGRESSION SNAPSHOT");
    expect(currentSnapshot).toContain("CURRENT SAVED PHASE");
    expect(currentSnapshot).toContain("GENERATED INSPECTION PHASE - NOT SAVED");
    expect(currentSnapshot).toContain("Program ID: saved-program");
    expect(currentSnapshot).toContain("Generation Mode: live_initial");
    expect(currentSnapshot).toContain("Initial Live Variation Slot: saved-program");
    expect(currentSnapshot).toContain("Day 1: Day 1");
    expect(currentSnapshot).toContain("Day 1: Phase 2 Day 1");
    expect(currentSnapshot).toContain("Day 1: Phase 3 Day 1");
    expect(currentSnapshot).toContain("Routine: Band Row");
    expect(currentSnapshot).not.toContain("DETERMINISTIC PHASE PREVIEW");

    fireEvent.click(screen.getByRole("button", { name: /Copy Full Progression Snapshot/i }));

    expect(mocks.writeText).toHaveBeenCalledTimes(1);
    const copiedText = mocks.writeText.mock.calls[0]?.[0] as string;
    expect(copiedText).toContain("CURRENT SAVED WEEK (LIVE PROGRAM SNAPSHOT)");
    expect(copiedText).toContain("Program ID: saved-program");
    expect(copiedText).toContain("FULL PROGRESSION SNAPSHOT");
    expect(copiedText).toContain("Day 1: Phase 2 Day 1");
    expect(copiedText).not.toContain("DETERMINISTIC PHASE PREVIEW");
    expect(screen.getByText("Week View")).toBeTruthy();
  });
});
