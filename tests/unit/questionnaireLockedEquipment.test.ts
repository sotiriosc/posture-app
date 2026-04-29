/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

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

const baseQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

const buildProgram = (questionnaire: QuestionnaireData, programId: string) => ({
  id: programId,
  userId: null,
  createdAt: "2026-04-29T00:00:00.000Z",
  updatedAt: "2026-04-29T00:00:00.000Z",
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
});

describe("questionnaire locked equipment", () => {
  beforeEach(() => {
    localStorage.clear();

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

    mocks.loadTrainingSnapshot.mockResolvedValue(null);
    mocks.pushTrainingPatch.mockResolvedValue(undefined);
    mocks.uuid.mockReturnValue("program-locked-equipment");
    mocks.getProgram.mockResolvedValue(null);
    mocks.clearDraft.mockResolvedValue(undefined);
    mocks.buildSignalsFromLocalState.mockImplementation(
      async ({ questionnaire }: { questionnaire?: QuestionnaireData }) => ({
        questionnaire: questionnaire ?? baseQuestionnaire,
        history: {
          sessions: [],
          exerciseLogs: [],
          programProgress: null,
        },
        prefs: null,
        nowIso: "2026-04-29T00:00:00.000Z",
      })
    );
    mocks.generateProgram.mockImplementation(
      ({ nextProgramId, signals }: { nextProgramId: string; signals: { questionnaire: QuestionnaireData } }) => ({
        status: "generated",
        program: buildProgram(signals.questionnaire, nextProgramId),
        seed: "locked-equipment-test",
        debug: {},
      })
    );
    mocks.saveProgram.mockImplementation(async (program: unknown) => program);
    mocks.saveProgramProgress.mockImplementation(async (progress: unknown) => progress);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("normal mode still renders equipment options", () => {
    render(React.createElement(QuestionnaireForm));

    expect(screen.getByTestId("equipment-none")).toBeTruthy();
    expect(screen.getByTestId("equipment-bands")).toBeTruthy();
    expect(screen.queryByTestId("gym-equipment-profile")).toBeNull();
  });

  test("gym mode hides equipment checkboxes", () => {
    render(
      React.createElement(QuestionnaireForm, {
        buyerDemoMode: true,
        gymMode: true,
        lockedEquipment: ["gym"],
        lockedEquipmentLabel: "Configured gym floor equipment",
      })
    );

    expect(screen.queryByTestId("equipment-none")).toBeNull();
    expect(screen.queryByTestId("equipment-bands")).toBeNull();
    expect(screen.getByTestId("gym-equipment-profile").textContent).toContain(
      "This plan uses the configured equipment profile for this gym."
    );
    expect(screen.getByTestId("gym-equipment-profile").textContent).toContain(
      "Configured gym floor equipment"
    );
  });

  test("gym mode preserves locked equipment in submitted questionnaire data", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...baseQuestionnaire, equipment: ["none"] })
    );

    render(
      React.createElement(QuestionnaireForm, {
        gymMode: true,
        lockedEquipment: ["gym"],
        lockedEquipmentLabel: "Configured gym floor equipment",
      })
    );

    fireEvent.click(screen.getByTestId("generate-routine"));

    await waitFor(() => {
      expect(mocks.buildSignalsFromLocalState).toHaveBeenCalledTimes(1);
    });

    const signalsInput = mocks.buildSignalsFromLocalState.mock.calls[0]?.[0] as {
      questionnaire: QuestionnaireData;
    };
    expect(signalsInput.questionnaire.equipment).toEqual(["gym"]);

    const savedQuestionnaire = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}"
    ) as QuestionnaireData;
    expect(savedQuestionnaire.equipment).toEqual(["gym"]);
  });
});
