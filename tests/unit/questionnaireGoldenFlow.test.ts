/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

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

const initialQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3,
};

const buildMockProgram = (questionnaire: QuestionnaireData, programId: string) => {
  const dayMain =
    questionnaire.daysPerWeek === 3
      ? ["seed-main-3-a", "seed-main-3-b"]
      : questionnaire.daysPerWeek === 4
      ? ["seed-main-4-a", "seed-main-4-b"]
      : ["seed-main-5-a", "seed-main-5-b"];

  return {
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
    week: [
      {
        dayIndex: 0,
        title: "Golden Day",
        focusTags: ["upper"],
        routine: [
          { exerciseId: "warmup-a", section: "warmup" },
          { exerciseId: "activation-a", section: "activation" },
          { exerciseId: dayMain[0], section: "main" },
          { exerciseId: dayMain[1], section: "main" },
          { exerciseId: "accessory-a", section: "accessory" },
        ],
      },
    ],
    source: "local",
    deletedAt: null,
  };
};

const fingerprintProgram = (program: ReturnType<typeof buildMockProgram>) =>
  program.week
    .map((day) => {
      const main = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId)
        .join(",");
      return `${day.title}:${main}`;
    })
    .join("|");

describe("questionnaire golden flow", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestionnaire));
    localStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        programId: "program-old",
        activeProgramId: "program-old",
        activeSessionId: "session-live",
        programVersion: 8,
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
    mocks.clearDraft.mockResolvedValue(undefined);
    mocks.uuid.mockReturnValue("program-golden-new");
    mocks.generateWeeklyProgram.mockImplementation(
      (questionnaire: QuestionnaireData, programId: string) =>
        buildMockProgram(questionnaire, programId)
    );
    mocks.saveProgram.mockImplementation(async (program: unknown) => program);
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("cancel keeps current program; confirm regenerates and commits", async () => {
    render(React.createElement(QuestionnaireForm));

    const baselineFingerprint = fingerprintProgram(
      buildMockProgram(initialQuestionnaire, "program-old")
    );

    fireEvent.click(screen.getByTestId("days-4"));
    fireEvent.click(screen.getByTestId("generate-routine"));
    expect(screen.getByTestId("questionnaire-change-confirm-modal")).toBeTruthy();

    fireEvent.click(screen.getByTestId("questionnaire-change-cancel"));
    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();

    const canceledQuestionnaire = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as QuestionnaireData;
    expect(canceledQuestionnaire.daysPerWeek).toBe(3);

    const canceledState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}") as {
      programId?: string;
    };
    expect(canceledState.programId).toBe("program-old");
    expect(mocks.saveProgram).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("days-4"));
    fireEvent.click(screen.getByTestId("generate-routine"));
    fireEvent.click(screen.getByTestId("questionnaire-change-confirm"));

    await waitFor(() => {
      expect(mocks.saveProgram).toHaveBeenCalledTimes(1);
      expect(mocks.saveProgramProgress).toHaveBeenCalledTimes(1);
    });

    const savedProgram = mocks.saveProgram.mock.calls[0]?.[0] as ReturnType<
      typeof buildMockProgram
    >;
    const nextFingerprint = fingerprintProgram(savedProgram);
    expect(
      savedProgram.id !== "program-old" || nextFingerprint !== baselineFingerprint
    ).toBe(true);

    expect(savedProgram.id).toBe("program-golden-new");
    expect(mocks.clearDraft).toHaveBeenCalledWith("session-live");
    expect(mocks.routerPush).toHaveBeenCalledWith("/results");

    const confirmedQuestionnaire = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as QuestionnaireData;
    expect(confirmedQuestionnaire.daysPerWeek).toBe(4);

    const confirmedState = JSON.parse(localStorage.getItem(APP_STATE_KEY) ?? "{}") as {
      programId?: string;
      activeProgramId?: string;
      activeSessionId?: string;
    };
    expect(confirmedState.programId).toBe("program-golden-new");
    expect(confirmedState.activeProgramId).toBe("program-golden-new");
    expect(confirmedState.activeSessionId).toBeUndefined();
  });
});
