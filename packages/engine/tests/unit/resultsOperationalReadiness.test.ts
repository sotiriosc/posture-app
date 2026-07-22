/** @vitest-environment jsdom */

import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PROGRAM_TEMPLATE_VERSION } from "@/lib/program";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import type { Program, ProgramProgress, SessionRecord } from "@/lib/types";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  loadTrainingSnapshot: vi.fn(),
  pushTrainingPatch: vi.fn(),
  getTrainingSyncStatus: vi.fn(),
  subscribeTrainingSyncStatus: vi.fn(),
  buildEngineSignals: vi.fn(),
  buildSignalsFromLocalState: vi.fn(),
  generateProgram: vi.fn(),
  getProgramProgress: vi.fn(),
  getLatestProgram: vi.fn(),
  getProgram: vi.fn(),
  listAllPrograms: vi.fn(),
  listSessions: vi.fn(),
  listExerciseLogsByExercise: vi.fn(),
  listExerciseLogsBySessionIds: vi.fn(),
  init: vi.fn(),
  loadPrefs: vi.fn(),
  savePrefs: vi.fn(),
  saveProgram: vi.fn(),
  saveProgramProgress: vi.fn(),
  clearDraftsByProgramId: vi.fn(),
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
  getTrainingSyncStatus: mocks.getTrainingSyncStatus,
  subscribeTrainingSyncStatus: mocks.subscribeTrainingSyncStatus,
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
  listAllPrograms: mocks.listAllPrograms,
  listSessions: mocks.listSessions,
  listExerciseLogsByExercise: mocks.listExerciseLogsByExercise,
  listExerciseLogsBySessionIds: mocks.listExerciseLogsBySessionIds,
  init: mocks.init,
  loadPrefs: mocks.loadPrefs,
  savePrefs: mocks.savePrefs,
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
  clearDraftsByProgramId: mocks.clearDraftsByProgramId,
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

const buildSession = (
  id: string,
  programId: string,
  dayIndex: number,
  completedAt: string | null
): SessionRecord => {
  const createdAt = `2026-04-12T0${dayIndex}:00:00.000Z`;
  return {
    id,
    userId: null,
    startedAt: createdAt,
    completedAt,
    createdAt,
    updatedAt: completedAt ?? createdAt,
    routineId: programId,
    durationSec: completedAt ? 1800 : null,
    notes: `dayIndex:${dayIndex}`,
    sessionFeedback: "moderate",
    source: "local",
    deletedAt: null,
  };
};

const buildProgress = (
  program: Program,
  overrides: Partial<ProgramProgress> = {}
): ProgramProgress => ({
  programId: program.id,
  lastCompletedDayIndex: null,
  nextDayIndex: 0,
  completedDayIndices: [],
  phaseIndex: program.phaseIndex ?? 1,
  phaseStartedAt: program.createdAt,
  cyclesCompletedInPhase: 0,
  daysPerWeek: program.daysPerWeek,
  weekIndex: program.weekIndex ?? 1,
  countedWeekKeys: [],
  updatedAt: "2026-04-12T12:00:00.000Z",
  ...overrides,
});

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

const buildMockGenerationResult = (program: Program, seed = "results-seed") => ({
  status: "generated" as const,
  program,
  seed,
  debug: {
    mode: "weekly",
    seed,
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
});

const buildSignalsPayload = () => ({
  questionnaire,
  history: {
    sessions: [],
    exerciseLogs: [],
    programProgress: null,
  },
  prefs: null,
  nowIso: "2026-04-11T12:00:00.000Z",
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
};

type SignalsPayload = ReturnType<typeof buildSignalsPayload>;
type Deferred<T> = ReturnType<typeof createDeferred<T>>;

describe("results operational readiness", () => {
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dateNowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-04-12T12:00:00.000Z").getTime());

    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questionnaire));

    mocks.routerPush.mockReset();
    mocks.loadTrainingSnapshot.mockReset();
    mocks.pushTrainingPatch.mockReset();
    mocks.getTrainingSyncStatus.mockReset();
    mocks.subscribeTrainingSyncStatus.mockReset();
    mocks.buildEngineSignals.mockReset();
    mocks.buildSignalsFromLocalState.mockReset();
    mocks.generateProgram.mockReset();
    mocks.getProgramProgress.mockReset();
    mocks.getLatestProgram.mockReset();
    mocks.getProgram.mockReset();
    mocks.listAllPrograms.mockReset();
    mocks.listSessions.mockReset();
    mocks.listExerciseLogsByExercise.mockReset();
    mocks.listExerciseLogsBySessionIds.mockReset();
    mocks.init.mockReset();
    mocks.loadPrefs.mockReset();
    mocks.savePrefs.mockReset();
    mocks.saveProgram.mockReset();
    mocks.saveProgramProgress.mockReset();
    mocks.clearDraftsByProgramId.mockReset();
    mocks.uuid.mockReset();
    mocks.writeText.mockReset();

    mocks.loadTrainingSnapshot.mockResolvedValue(null);
    mocks.pushTrainingPatch.mockResolvedValue(undefined);
    mocks.getTrainingSyncStatus.mockReturnValue({
      state: "idle",
      lastAttemptAt: null,
      lastSyncedAt: null,
      lastError: null,
      authenticated: null,
    });
    mocks.subscribeTrainingSyncStatus.mockReturnValue(() => undefined);
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
    mocks.listAllPrograms.mockResolvedValue([]);
    mocks.listSessions.mockResolvedValue([]);
    mocks.listExerciseLogsByExercise.mockResolvedValue([]);
    mocks.listExerciseLogsBySessionIds.mockResolvedValue([]);
    mocks.init.mockResolvedValue(undefined);
    mocks.loadPrefs.mockResolvedValue({ schemaVersion: 2 });
    mocks.savePrefs.mockImplementation(async (prefs: unknown) => prefs);
    mocks.saveProgram.mockImplementation(async (program: unknown) => program);
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);
    mocks.clearDraftsByProgramId.mockResolvedValue(undefined);
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
    dateNowSpy.mockRestore();
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("shows a recovery path instead of an indefinite loading state when generation returns no program", async () => {
    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(
        screen.getByText(/We couldn't build your weekly plan yet/i)
      ).toBeTruthy();
    });

    expect(screen.getByText(/No eligible weekly program found/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review profile/i })).toBeTruthy();
    expect(screen.queryByText(/Building your weekly plan/i)).toBeNull();
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

  test("surfaces cloud sync failures while keeping local progress usable", async () => {
    const generatedProgram = buildSavedProgram("results-program");
    mocks.getTrainingSyncStatus.mockReturnValue({
      state: "error",
      lastAttemptAt: Date.parse("2026-04-12T12:00:00.000Z"),
      lastSyncedAt: null,
      lastError: "Network unavailable",
      authenticated: true,
    });
    mocks.generateProgram.mockReturnValue(buildMockGenerationResult(generatedProgram));

    render(React.createElement(ResultsRoutine));

    expect(await screen.findByTestId("training-sync-status")).toBeTruthy();
    expect(screen.getByText(/Local progress is saved/i)).toBeTruthy();
    expect(screen.getByText(/retry automatically/i)).toBeTruthy();
  });

  test("assessment status makes questionnaire-only fallback explicit", async () => {
    const generatedProgram = buildSavedProgram("results-program");
    mocks.generateProgram.mockReturnValue(buildMockGenerationResult(generatedProgram));

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByTestId("current-saved-week-body")).toBeTruthy();
    });

    const status = screen.getByTestId("assessment-status-card").textContent ?? "";
    expect(status).toContain("Profile-based plan");
    expect(status).toContain("Praxis is currently using your movement profile answers only.");
    expect(status).toContain("No photos uploaded");
  });

  test("assessment status surfaces photo-derived report evidence", async () => {
    const generatedProgram = buildSavedProgram("results-program");
    mocks.loadTrainingSnapshot.mockResolvedValue({
      assessment: {
        observations: [
          {
            id: "pose-forward-head",
            evidence: ["View: side", "Scan: head position offset"],
          },
        ],
        priorities: ["pose-forward-head"],
        summary: "Photo-derived posture report.",
        disclaimers: [],
      },
    });
    mocks.generateProgram.mockReturnValue(buildMockGenerationResult(generatedProgram));

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByTestId("current-saved-week-body")).toBeTruthy();
    });

    const status = screen.getByTestId("assessment-status-card").textContent ?? "";
    expect(status).toContain("Photos informed this plan");
    expect(status).toContain("Plan informed by uploaded posture photos and questionnaire inputs.");
    expect(status).toContain("Views: Side");
  });

  test("repeated initial async loads only settle one active generated program", async () => {
    const deferredSignals: Array<Deferred<SignalsPayload>> = [];
    mocks.buildSignalsFromLocalState.mockImplementation(() => {
      const deferred = createDeferred<ReturnType<typeof buildSignalsPayload>>();
      deferredSignals.push(deferred);
      return deferred.promise;
    });
    mocks.uuid
      .mockReturnValueOnce("program-new")
      .mockReturnValueOnce("program-old");
    mocks.generateProgram.mockImplementation(
      (request: { nextProgramId?: string; phaseIndex?: number }) => {
        const programId = request.nextProgramId ?? "missing-id";
        return buildMockGenerationResult(
          buildSavedProgram(programId, {
            exerciseId: programId === "program-new" ? "band-row" : "band-pull-aparts",
          }),
          `${programId}-seed`
        );
      }
    );

    const firstRender = render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(1));
    firstRender.unmount();

    render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(2));
    deferredSignals[1].resolve(buildSignalsPayload());

    await waitFor(() => {
      expect(
        mocks.saveProgram.mock.calls.map(([program]) => (program as Program).id)
      ).toContain("program-new");
    });

    deferredSignals[0].resolve(buildSignalsPayload());
    await Promise.resolve();

    const savedProgramIds = mocks.saveProgram.mock.calls.map(
      ([program]) => (program as Program).id
    );
    expect(new Set(savedProgramIds)).toEqual(new Set(["program-new"]));
    const persistedState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}");
    expect(persistedState.activeProgramId).toBe("program-new");
    expect(screen.getByTestId("current-saved-week-body").textContent ?? "").toContain(
      "Program ID: program-new"
    );
  });

  test("stale initial generation result cannot overwrite a newer settled program", async () => {
    const deferredSignals: Array<Deferred<SignalsPayload>> = [];
    mocks.buildSignalsFromLocalState.mockImplementation(() => {
      const deferred = createDeferred<ReturnType<typeof buildSignalsPayload>>();
      deferredSignals.push(deferred);
      return deferred.promise;
    });
    mocks.uuid
      .mockReturnValueOnce("settled-program")
      .mockReturnValueOnce("stale-program");
    mocks.generateProgram.mockImplementation(
      (request: { nextProgramId?: string; phaseIndex?: number }) =>
        buildMockGenerationResult(
          buildSavedProgram(request.nextProgramId ?? "unknown-program"),
          `${request.nextProgramId}-seed`
        )
    );

    const firstRender = render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(1));
    firstRender.unmount();

    render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(2));
    deferredSignals[1].resolve(buildSignalsPayload());

    await waitFor(() => {
      expect(screen.getByTestId("current-saved-week-body").textContent ?? "").toContain(
        "Program ID: settled-program"
      );
    });

    deferredSignals[0].resolve(buildSignalsPayload());
    await Promise.resolve();

    expect(
      mocks.saveProgram.mock.calls.map(([program]) => (program as Program).id)
    ).not.toContain("stale-program");
    expect(
      mocks.saveProgram.mock.calls.map(([program]) => (program as Program).id)
    ).toContain("settled-program");
    const currentSnapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
    expect(currentSnapshot).toContain("Program ID: settled-program");
    expect(currentSnapshot).not.toContain("Program ID: stale-program");
  });

  test("reconcile does not regenerate immediately after a fresh compatible initial generation", async () => {
    const generatedProgram = buildSavedProgram("results-program");
    mocks.uuid
      .mockReturnValueOnce("results-program")
      .mockReturnValue("unexpected-reconcile-program");
    mocks.generateProgram.mockImplementation((request: { nextProgramId?: string }) => {
      if (request.nextProgramId?.includes("progression-inspection-phase")) {
        return buildMockGenerationResult(buildSavedProgram(request.nextProgramId), "inspection-seed");
      }
      return buildMockGenerationResult(generatedProgram);
    });

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledWith(
        expect.objectContaining({ id: "results-program" })
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("current-saved-week-body").textContent ?? "").toContain(
        "Program ID: results-program"
      );
    });

    const liveGenerationIds = mocks.generateProgram.mock.calls
      .map(([request]) => (request as { nextProgramId?: string }).nextProgramId)
      .filter((id) => id && !id.includes("progression-inspection-phase"));
    expect(liveGenerationIds).toEqual(["results-program"]);
    expect(
      new Set(mocks.saveProgram.mock.calls.map(([program]) => (program as Program).id))
    ).toEqual(new Set(["results-program"]));
  });

  test("snapshot metadata waits for the settled active program/app-state pair", async () => {
    const deferredSignals: Array<Deferred<SignalsPayload>> = [];
    mocks.buildSignalsFromLocalState.mockImplementation(() => {
      const deferred = createDeferred<ReturnType<typeof buildSignalsPayload>>();
      deferredSignals.push(deferred);
      return deferred.promise;
    });
    mocks.uuid.mockReturnValue("settled-snapshot-program");
    mocks.generateProgram.mockImplementation((request: { nextProgramId?: string }) =>
      buildMockGenerationResult(buildSavedProgram(request.nextProgramId ?? "settled-snapshot-program"))
    );

    render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(1));
    expect(screen.getByTestId("current-saved-week-loading-card")).toBeTruthy();
    const snapshotStatus = screen.getByRole("progressbar", {
      name: /Plan reference status/i,
    });
    expect(snapshotStatus).toBeTruthy();
    expect(snapshotStatus.getAttribute("aria-valuenow")).toBeNull();
    expect(screen.queryByTestId("current-saved-week-body")).toBeNull();

    deferredSignals[0].resolve(buildSignalsPayload());

    await waitFor(() => {
      const snapshot = screen.getByTestId("current-saved-week-body").textContent ?? "";
      expect(snapshot).toContain("Program ID: settled-snapshot-program");
      expect(snapshot).toContain("Generation Mode: live_initial");
      expect(snapshot).toContain("Initial Live Variation Slot: settled-snapshot-program");
    });
    expect(screen.queryByTestId("current-saved-week-loading-card")).toBeNull();
  });

  test("copy action captures the settled active program instead of an intermediate generation", async () => {
    const deferredSignals: Array<Deferred<SignalsPayload>> = [];
    mocks.buildSignalsFromLocalState.mockImplementation(() => {
      const deferred = createDeferred<ReturnType<typeof buildSignalsPayload>>();
      deferredSignals.push(deferred);
      return deferred.promise;
    });
    mocks.uuid
      .mockReturnValueOnce("settled-copy-program")
      .mockReturnValueOnce("intermediate-program");
    mocks.generateProgram.mockImplementation(
      (request: { nextProgramId?: string; phaseIndex?: number }) =>
        buildMockGenerationResult(
          buildSavedProgram(request.nextProgramId ?? "unknown-program"),
          `${request.nextProgramId}-seed`
        )
    );

    const firstRender = render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(1));
    firstRender.unmount();

    render(React.createElement(ResultsRoutine));
    await waitFor(() => expect(deferredSignals).toHaveLength(2));
    deferredSignals[1].resolve(buildSignalsPayload());

    await waitFor(() => {
      expect(screen.getByTestId("current-saved-week-body").textContent ?? "").toContain(
        "Program ID: settled-copy-program"
      );
    });
    deferredSignals[0].resolve(buildSignalsPayload());
    await Promise.resolve();

    fireEvent.click(screen.getByRole("button", { name: /Copy Full Progression Snapshot/i }));

    expect(mocks.writeText).toHaveBeenCalledTimes(1);
    const copiedText = mocks.writeText.mock.calls[0]?.[0] as string;
    expect(copiedText).toContain("Program ID: settled-copy-program");
    expect(copiedText).not.toContain("Program ID: intermediate-program");
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

  test("same-id metadata refresh keeps completed history, unlocks, and week indicators visible", async () => {
    const savedProgram = buildSavedProgram("metadata-refresh-program");
    const completedSession = buildSession(
      "completed-day-1",
      savedProgram.id,
      0,
      "2026-04-12T01:30:00.000Z"
    );
    const inProgressSession = buildSession(
      "in-progress-day-2",
      savedProgram.id,
      1,
      null
    );
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(questionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);
    mocks.getProgramProgress.mockResolvedValue(
      buildProgress(savedProgram, {
        nextDayIndex: 1,
        cyclesCompletedInPhase: 1,
      })
    );
    mocks.listSessions.mockResolvedValue([completedSession, inProgressSession]);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("1 completed / 3")).toBeTruthy();
    });
    expect(screen.getByText("1 in progress")).toBeTruthy();
    expect(screen.getByText("Full analysis unlocked")).toBeTruthy();
    expect(screen.getByText("1 workouts logged")).toBeTruthy();

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledWith(
        expect.objectContaining({
          id: savedProgram.id,
          nextWeekPlan: expect.any(Object),
        })
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mocks.listSessions).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1 completed / 3")).toBeTruthy();
    expect(screen.getByText("1 in progress")).toBeTruthy();
    expect(screen.getByText("Full analysis unlocked")).toBeTruthy();
    expect(screen.getByText("1 workouts logged")).toBeTruthy();

    const refresh = createDeferred<SessionRecord[]>();
    mocks.listSessions.mockImplementation(() => refresh.promise);
    window.dispatchEvent(new Event("focus"));
    expect(mocks.listSessions).toHaveBeenCalledTimes(2);
    expect(screen.getByText("1 completed / 3")).toBeTruthy();
    expect(screen.getByText("1 in progress")).toBeTruthy();
    refresh.resolve([completedSession, inProgressSession]);
    await act(async () => {
      await refresh.promise;
    });

    fireEvent.click(screen.getByText("History").closest("button")!);
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain(
      "Day 1"
    );
    fireEvent.click(screen.getByText("Progress").closest("button")!);
    expect(screen.getByText("Progress Summary")).toBeTruthy();
    fireEvent.click(screen.getByText("Insights").closest("button")!);
    expect(screen.queryByText(/unlocks with real use/i)).toBeNull();
  });

  test("dashboard focus and insight copy come from the saved program instead of legacy questionnaire routine state", async () => {
    const legacyQuestionnaire = buildQuestionnaire({
      goals: "Reduce pain",
      painAreas: ["Neck"],
      equipment: ["none"],
    });
    const savedProgram: Program = {
      ...buildSavedProgram("program-source-of-truth", {
        questionnaire: legacyQuestionnaire,
      }),
      phaseObjective: {
        title: "Engine phase objective",
        objective: "Engine objective builds durable control.",
        phaseFocus: "Engine phase focus",
        primaryPatterns: ["engine scapular control", "engine thoracic extension"],
        successMarkers: ["Engine marker stays smooth"],
        guardrail: "Engine guardrail",
        weekIntent: "Engine week intent from saved program",
        whyNow: "Engine why now",
        riskWatchouts: ["Engine watchout"],
        coachingPrompts: ["Engine coaching prompt: set the shoulder blade"],
        metrics: {
          readiness: 0.75,
          consistency: 0.8,
          painRisk: 0.2,
          asymmetry: 0.1,
        },
      },
    };
    const completedSession = buildSession(
      "program-source-session",
      savedProgram.id,
      0,
      "2026-04-12T01:30:00.000Z"
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyQuestionnaire));
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(legacyQuestionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);
    mocks.getProgramProgress.mockResolvedValue(
      buildProgress(savedProgram, {
        nextDayIndex: 1,
        cyclesCompletedInPhase: 1,
      })
    );
    mocks.listSessions.mockResolvedValue([completedSession]);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("Full analysis unlocked")).toBeTruthy();
    });

    const todayModeButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("Today"));
    expect(todayModeButton).toBeTruthy();
    fireEvent.click(todayModeButton!);
    const todayPanel = screen.getByTestId("today-mode-panel").textContent ?? "";
    expect(todayPanel).toContain("Engine Scapular Control");
    expect(document.body.textContent ?? "").toContain(
      "Engine week intent from saved program"
    );

    fireEvent.click(screen.getByText("Insights").closest("button")!);
    expect(document.body.textContent ?? "").toContain(
      "set the shoulder blade"
    );
    expect(document.body.textContent ?? "").toContain("Engine Thoracic Extension");
    expect(document.body.textContent ?? "").toContain(
      "Plan focus: Engine Scapular Control"
    );
    expect(document.body.textContent ?? "").not.toContain("Daily gentle mobility");
    expect(document.body.textContent ?? "").not.toContain(
      "Neck tension tends to show with screen-heavy days."
    );
  });

  test("backfills phase workout progress from completed current-phase sessions", async () => {
    // Fix for stale test (2c.4): canAdvancePhase uses `new Date().toISOString()` as its
    // default `nowIso` parameter. Without freezing the system clock the live date makes
    // daysSincePhaseStart >> minDays (30), so the days-gate passes and the UI shows
    // "Ready to advance" instead of the expected "Gate locked". Freeze to April 12, 2026
    // (one day after phaseStartedAt 2026-04-11) so only the workout gate matters.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-04-12T12:00:00.000Z"));
    try {
    const fourDayQuestionnaire = buildQuestionnaire({ daysPerWeek: 4 as const });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fourDayQuestionnaire));
    const savedProgram = buildSavedProgram("phase-workout-backfill-program", {
      questionnaire: fourDayQuestionnaire,
      daysPerWeek: 4,
    });
    const completedSessions = [0, 1, 2, 3].map((dayIndex) =>
      buildSession(
        `completed-day-${dayIndex + 1}`,
        savedProgram.id,
        dayIndex,
        `2026-04-12T0${dayIndex + 1}:30:00.000Z`
      )
    );

    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(fourDayQuestionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);
    mocks.getProgramProgress.mockResolvedValue(
      buildProgress(savedProgram, {
        daysPerWeek: 4,
        nextDayIndex: 0,
        cyclesCompletedInPhase: 1,
        workoutsCompletedInPhase: 1,
      })
    );
    mocks.listSessions.mockResolvedValue(completedSessions);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("4 completed / 4")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Progress").closest("button")!);
    expect(screen.queryByText("Phase progress")).toBeNull();
    await waitFor(() => {
      expect(screen.getAllByText("4/16 workouts in phase").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Sessions this phase").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Days in phase").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Keep going").length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(mocks.saveProgramProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: savedProgram.id,
          workoutsCompletedInPhase: 4,
        })
      );
    });
    } finally {
      vi.useRealTimers();
    }
  });

  test("week progress uses the current Monday-start calendar week", async () => {
    const dateNowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-04-12T12:00:00.000Z").getTime());
    try {
      const fourDayQuestionnaire = buildQuestionnaire({ daysPerWeek: 4 as const });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fourDayQuestionnaire));
      const savedProgram = buildSavedProgram("calendar-week-program", {
        questionnaire: fourDayQuestionnaire,
        daysPerWeek: 4,
      });
      const previousWeekSession = buildSession(
        "previous-week-day-1",
        savedProgram.id,
        0,
        "2026-04-05T12:00:00.000Z"
      );
      const currentWeekDay1 = buildSession(
        "current-week-day-1",
        savedProgram.id,
        0,
        "2026-04-06T12:00:00.000Z"
      );
      const currentWeekDay2 = buildSession(
        "current-week-day-2",
        savedProgram.id,
        1,
        "2026-04-10T12:00:00.000Z"
      );
      const currentWeekInProgress = buildSession(
        "current-week-in-progress",
        savedProgram.id,
        2,
        null
      );
      currentWeekInProgress.startedAt = "2026-04-11T12:00:00.000Z";
      currentWeekInProgress.createdAt = "2026-04-11T12:00:00.000Z";
      currentWeekInProgress.updatedAt = "2026-04-11T12:00:00.000Z";

      localStorage.setItem(
        APP_STATE_KEY,
        JSON.stringify({
          activeProgramId: savedProgram.id,
          programId: savedProgram.id,
          activeGenerationMode: "live_initial",
          selectedDay: 0,
          questionnaireSignature: buildQuestionnaireSignature(fourDayQuestionnaire),
          updatedAt: Date.now(),
        })
      );
      mocks.getProgram.mockResolvedValue(savedProgram);
      mocks.getProgramProgress.mockResolvedValue(
        buildProgress(savedProgram, {
          daysPerWeek: 4,
          nextDayIndex: 0,
          workoutsCompletedInPhase: 3,
        })
      );
      mocks.listSessions.mockResolvedValue([
        previousWeekSession,
        currentWeekDay1,
        currentWeekDay2,
        currentWeekInProgress,
      ]);

      render(React.createElement(ResultsRoutine));

      await waitFor(() => {
        expect(screen.getByText("2 completed / 4")).toBeTruthy();
      });
      expect(screen.getByText("1 in progress")).toBeTruthy();
      expect(screen.queryByText("3 completed / 4")).toBeNull();
      expect(screen.getByText("Week: 2/4 days")).toBeTruthy();
    } finally {
      dateNowSpy.mockRestore();
    }
  });

  test("history search can switch from current program to all history", async () => {
    const savedProgram = buildSavedProgram("current-history-program", {
      exerciseId: "band-row",
    });
    const legacyProgram: Program = {
      ...buildSavedProgram("legacy-history-program", {
        exerciseId: "plank",
      }),
      phaseName: "Legacy Phase",
      week: [
        {
          ...buildSavedProgram("legacy-history-program").week[0],
          title: "Legacy core day",
          routine: [
            {
              exerciseId: "plank",
              section: "main",
              sets: 2,
              reps: null,
              durationSec: 45,
              loadType: "timed",
            },
          ],
        },
      ],
    };
    const currentSession = buildSession(
      "current-history-session",
      savedProgram.id,
      0,
      "2026-04-12T01:30:00.000Z"
    );
    const legacySession = buildSession(
      "legacy-history-session",
      legacyProgram.id,
      0,
      "2026-04-09T01:30:00.000Z"
    );
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(questionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);
    mocks.getProgramProgress.mockResolvedValue(buildProgress(savedProgram));
    mocks.listSessions.mockResolvedValue([currentSession, legacySession]);
    mocks.listAllPrograms.mockResolvedValue([savedProgram, legacyProgram]);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("1 completed / 3")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("History").closest("button")!);
    await waitFor(() => {
      expect(mocks.listAllPrograms).toHaveBeenCalled();
    });

    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain("Day 1");
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").not.toContain("Plank");

    fireEvent.click(screen.getByTestId("history-scope-all"));
    fireEvent.change(screen.getByTestId("history-search-input"), {
      target: { value: "plank" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain("Plank");
    });
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain(
      "Legacy core day"
    );

    fireEvent.change(screen.getByTestId("history-search-input"), {
      target: { value: "not a session" },
    });
    expect(screen.getByText("No completed workouts match that search.")).toBeTruthy();
  });

  test("reset current progress preserves completed history and all-history access", async () => {
    const savedProgram = buildSavedProgram("reset-progress-program");
    const completedSession = buildSession(
      "reset-progress-session",
      savedProgram.id,
      0,
      "2026-04-12T01:30:00.000Z"
    );
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: savedProgram.id,
        programId: savedProgram.id,
        activeGenerationMode: "live_initial",
        selectedDay: 0,
        activeProgramBaselineAt: Date.parse(savedProgram.createdAt),
        questionnaireSignature: buildQuestionnaireSignature(questionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(savedProgram);
    mocks.getProgramProgress.mockResolvedValue(
      buildProgress(savedProgram, {
        nextDayIndex: 1,
        completedDayIndices: [0],
      })
    );
    mocks.listSessions.mockResolvedValue([completedSession]);
    mocks.listAllPrograms.mockResolvedValue([savedProgram]);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("1 completed / 3")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Billing / Account").closest("button")!);
    fireEvent.click(screen.getByTestId("reset-current-progress-trigger"));
    fireEvent.click(screen.getByTestId("reset-current-progress-confirm-button"));

    await waitFor(() => {
      expect(mocks.saveProgramProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: savedProgram.id,
          nextDayIndex: 0,
          completedDayIndices: [],
          cyclesCompletedInPhase: 0,
        })
      );
    });

    expect(mocks.clearDraftsByProgramId).toHaveBeenCalledWith(savedProgram.id);
    expect(screen.getByText("Current progress reset. Your workout history is still saved.")).toBeTruthy();
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain("Day 1");

    fireEvent.click(screen.getByTestId("history-scope-all"));
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain("Day 1");
  });

  test("a true new program id resets current progress while keeping all history", async () => {
    const oldProgram = buildSavedProgram("previous-program");
    const nextProgram = {
      ...buildSavedProgram("next-program"),
      phaseIndex: 2,
      phaseName: "Integration",
      totalWeekIndex: 2,
    };
    const oldSession = buildSession(
      "old-program-session",
      oldProgram.id,
      0,
      "2026-04-12T01:30:00.000Z"
    );
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        activeProgramId: nextProgram.id,
        programId: nextProgram.id,
        activeGenerationMode: "live_regeneration",
        selectedDay: 0,
        questionnaireSignature: buildQuestionnaireSignature(questionnaire),
        updatedAt: Date.now(),
      })
    );
    mocks.getProgram.mockResolvedValue(nextProgram);
    mocks.getProgramProgress.mockResolvedValue(buildProgress(nextProgram));
    mocks.listSessions.mockResolvedValue([oldSession]);

    render(React.createElement(ResultsRoutine));

    await waitFor(() => {
      expect(screen.getByText("0 completed / 3")).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("Full analysis unlocked")).toBeTruthy();
    });
    expect(screen.getByText("1 workouts logged")).toBeTruthy();
    fireEvent.click(screen.getByText("History").closest("button")!);
    expect(
      screen.getByText(
        "No completed workouts in this phase yet. Switch to All history to review earlier sessions."
      )
    ).toBeTruthy();
    fireEvent.click(screen.getByTestId("history-scope-all"));
    expect(screen.getByTestId("history-mode-panel").textContent ?? "").toContain("Day 1");
  });
});
