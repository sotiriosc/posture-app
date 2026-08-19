// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const harness = vi.hoisted(() => ({
  appState: null as null | Record<string, unknown>,
  remoteQuestionnaire: null as null | Record<string, unknown>,
  routerPush: vi.fn(),
  saveAppState: vi.fn(),
  pushTrainingPatch: vi.fn(),
  logTrainingSync: vi.fn(),
  clearDraft: vi.fn(),
  buildSignalsFromLocalState: vi.fn(),
  generateProgram: vi.fn(),
  getProgram: vi.fn(),
  saveProgram: vi.fn(),
  saveProgramProgress: vi.fn(),
  uuid: vi.fn(() => "test-program-id"),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: harness.routerPush }) }));
vi.mock("@/lib/equipment", () => ({
  normalizeEquipmentSelectionValues: (value: unknown) =>
    Array.isArray(value) ? value : ["gym"],
}));
vi.mock("@/lib/appState", () => ({
  loadAppState: () => harness.appState,
  saveAppState: harness.saveAppState,
}));
vi.mock("@/lib/questionnaireSignature", () => ({
  buildQuestionnaireSignature: (value: unknown) => JSON.stringify(value),
}));
vi.mock("@/lib/trainingSyncClient", () => ({
  loadTrainingSnapshot: async () =>
    harness.remoteQuestionnaire
      ? { questionnaire: harness.remoteQuestionnaire }
      : null,
  pushTrainingPatch: harness.pushTrainingPatch,
}));
vi.mock("@/lib/trainingSyncDebug", () => ({ logTrainingSync: harness.logTrainingSync }));
vi.mock("@/lib/sessionDraftStore", () => ({ clearDraft: harness.clearDraft }));
vi.mock("@/lib/engine", () => ({
  buildSignalsFromLocalState: harness.buildSignalsFromLocalState,
  generateProgram: harness.generateProgram,
}));
vi.mock("@/lib/logStore", () => ({
  getProgram: harness.getProgram,
  saveProgram: harness.saveProgram,
  saveProgramProgress: harness.saveProgramProgress,
  uuid: harness.uuid,
}));

import QuestionnaireForm from "../../src/components/QuestionnaireForm";
import InactiveProductGoalPreview from "../../src/components/questionnaire/InactiveProductGoalPreview";
import {
  GET_STRONGER_PREVIEW_INPUT,
  type InactiveProductGoalPreviewSelection,
} from "../../src/components/questionnaire/inactiveProductGoalContracts";

const legacyGoals = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

function optionValues(select: HTMLSelectElement) {
  return [...select.options].map((option) => option.value);
}

function previewSelect() {
  return screen.getByRole("combobox", { name: "Primary goal" }) as HTMLSelectElement;
}

function selectGetStronger() {
  const select = previewSelect();
  fireEvent.change(select, { target: { value: "get_stronger" } });
  return select;
}

function expectNoMutationCalls() {
  for (const spy of [
    harness.saveAppState,
    harness.pushTrainingPatch,
    harness.clearDraft,
    harness.buildSignalsFromLocalState,
    harness.generateProgram,
    harness.getProgram,
    harness.saveProgram,
    harness.saveProgramProgress,
    harness.routerPush,
  ]) {
    expect(spy).not.toHaveBeenCalled();
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.appState = null;
  harness.remoteQuestionnaire = null;
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("inactive Get stronger preview rendering", () => {
  test("ordinary QuestionnaireForm preserves the exact four legacy options and no preview DOM", () => {
    const { container } = render(<QuestionnaireForm />);
    const select = container.querySelector("select") as HTMLSelectElement;

    expect(optionValues(select)).toEqual(legacyGoals);
    expect(select.value).toBe("Improve posture");
    expect(container.querySelector("optgroup")).toBeNull();
    expect(screen.queryByText("Get stronger")).toBeNull();
    expect(screen.queryByTestId("primary-goal-select")).toBeNull();
    expect(screen.queryByTestId("inactive-goal-preview-panel")).toBeNull();
    expect(screen.queryByTestId("inactive-goal-preview-submit-alert")).toBeNull();
    expect(screen.getByTestId("generate-routine").textContent).toBe(
      "Build my Praxis plan"
    );
  });

  test("explicit wrapper appends one semantic internal-preview option", () => {
    render(<InactiveProductGoalPreview />);
    const select = previewSelect();

    expect(optionValues(select)).toEqual([...legacyGoals, "get_stronger"]);
    expect(select.querySelector("optgroup")?.label).toBe("Internal preview");
    expect(select.options[4].textContent).toBe("Get stronger");
    expect(select.labels).toHaveLength(1);
    expect(screen.queryByTestId("inactive-goal-preview-panel")).toBeNull();
  });

  test("invalid or unsupported preview input fails closed", () => {
    const invalid = {
      ...GET_STRONGER_PREVIEW_INPUT,
      contract: "INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT@2.0.0",
    } as unknown as typeof GET_STRONGER_PREVIEW_INPUT;
    const { container } = render(<QuestionnaireForm inactiveGoalPreview={invalid} />);

    expect(optionValues(container.querySelector("select") as HTMLSelectElement)).toEqual(
      legacyGoals
    );
    expect(container.querySelector("optgroup")).toBeNull();
    expect(screen.queryByText("Get stronger")).toBeNull();
  });

  test("selection exposes the deterministic record without storage or focus mutation", () => {
    const onSelection = vi.fn();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<InactiveProductGoalPreview onInactiveGoalPreviewSelectionChange={onSelection} />);
    const writesBeforeSelection = storageWrite.mock.calls.length;
    const select = previewSelect();
    select.focus();
    selectGetStronger();

    expect(document.activeElement).toBe(select);
    expect(previewSelect().value).toBe("get_stronger");
    expect(onSelection).toHaveBeenCalledWith({
      contract: "INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION@1.0.0",
      version: "1.0.0",
      optionId: "get_stronger",
      canonicalOutcome: "strength",
      availability: "future_inactive_internal",
      selected: true,
      source: "explicit_internal_preview",
      persisted: false,
      generationAllowed: false,
      ProductShadowAllowed: false,
      deliveredToUser: false,
      ProductMutationApplied: false,
    } satisfies InactiveProductGoalPreviewSelection);
    expect(storageWrite.mock.calls).toHaveLength(writesBeforeSelection);
    expect(localStorage.getItem("posture_questionnaire")).toBeNull();
    expectNoMutationCalls();

    const panel = screen.getByTestId("inactive-goal-preview-panel");
    expect(panel.textContent).toContain("INTERNAL PREVIEW");
    expect(panel.textContent).toContain("Get stronger");
    expect(panel.textContent).toContain(
      "This goal is being reviewed and is not available for plan generation yet."
    );
    expect(previewSelect().getAttribute("aria-describedby")).toBe(
      "inactive-goal-preview-helper"
    );
  });

  test("preview content keeps the bounded responsive layout contract at all target widths", () => {
    const { unmount } = render(<InactiveProductGoalPreview />);
    selectGetStronger();
    const panel = screen.getByTestId("inactive-goal-preview-panel");
    const form = screen.getByTestId("questionnaire-form");

    for (const [width, height] of [
      [320, 800],
      [360, 800],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1440, 900],
    ]) {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
      Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
      fireEvent(window, new Event("resize"));
      expect(previewSelect().className).toContain("w-full");
      expect(panel.className).not.toContain("fixed");
      expect(panel.textContent).toContain("not available for plan generation yet");
      expect(form.querySelectorAll("select")).toHaveLength(1);
      expect(screen.getByTestId("generate-routine")).not.toBeNull();
    }
    unmount();
  });
});

describe("inactive Get stronger fail-closed guards", () => {
  test.each([
    ["no existing Program", null],
    ["existing Program", { activeProgramId: "program-1", programVersion: 2 }],
    [
      "active session",
      { activeProgramId: "program-1", activeSessionId: "session-1", programVersion: 2 },
    ],
  ])("blocks submission with %s before every legacy effect", async (_name, state) => {
    harness.appState = state;
    const onResult = vi.fn();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<InactiveProductGoalPreview onInactiveGoalPreviewResult={onResult} />);
    selectGetStronger();
    const writesBeforeSubmit = storageWrite.mock.calls.length;
    fireEvent.click(screen.getByTestId("generate-routine"));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Get stronger is not available for plan generation yet. Your current profile and plan were not changed."
    );
    await waitFor(() => expect(document.activeElement).toBe(alert));
    expect(onResult).toHaveBeenCalledWith({
      contract: "INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT@1.0.0",
      version: "1.0.0",
      optionId: "get_stronger",
      canonicalOutcome: "strength",
      status: "future_submission_unavailable",
      reason: "INACTIVE_PRODUCT_GOAL_PREVIEW_ONLY",
      persistenceAttempted: false,
      generationAttempted: false,
      ProductShadowAttempted: false,
      navigationAttempted: false,
      activeSessionMutationAttempted: false,
      ProductMutationApplied: false,
      V2OutputReturned: false,
    });
    expect(storageWrite.mock.calls).toHaveLength(writesBeforeSubmit);
    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();
    expect(screen.queryByText(/active session is in progress/i)).toBeNull();
    expectNoMutationCalls();
  });

  test("a dirty legacy edit cannot pull preview submit into confirmation", async () => {
    localStorage.setItem(
      "posture_questionnaire",
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      })
    );
    harness.appState = {
      activeProgramId: "program-1",
      activeSessionId: "session-1",
      programVersion: 2,
    };
    render(<InactiveProductGoalPreview />);
    await waitFor(() => expect(screen.getByTestId("days-3")).not.toBeNull());
    fireEvent.click(screen.getByTestId("days-4"));
    selectGetStronger();
    fireEvent.click(screen.getByTestId("generate-routine"));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.queryByTestId("questionnaire-change-confirm-modal")).toBeNull();
    expect(screen.queryByText(/active session is in progress/i)).toBeNull();
    expectNoMutationCalls();
  });

  test("returning to a legacy option clears preview state and resumes exact legacy update", () => {
    const onSelection = vi.fn();
    render(<InactiveProductGoalPreview onInactiveGoalPreviewSelectionChange={onSelection} />);
    selectGetStronger();
    fireEvent.change(previewSelect(), { target: { value: "Reduce pain" } });

    expect(previewSelect().value).toBe("Reduce pain");
    expect(onSelection).toHaveBeenLastCalledWith(null);
    expect(screen.queryByTestId("inactive-goal-preview-panel")).toBeNull();
    expect(screen.queryByTestId("inactive-goal-preview-submit-alert")).toBeNull();
    expect(JSON.parse(localStorage.getItem("posture_questionnaire") ?? "{}")).toEqual({
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    });
  });

  test("removing and re-adding the explicit input clears the ephemeral selection", async () => {
    const { rerender } = render(
      <QuestionnaireForm inactiveGoalPreview={GET_STRONGER_PREVIEW_INPUT} />
    );
    selectGetStronger();
    expect(screen.getByTestId("inactive-goal-preview-panel")).not.toBeNull();

    rerender(<QuestionnaireForm />);
    expect(screen.queryByText("Get stronger")).toBeNull();
    expect(screen.queryByTestId("inactive-goal-preview-panel")).toBeNull();
    expect(screen.queryByTestId("inactive-goal-preview-submit-alert")).toBeNull();

    rerender(<QuestionnaireForm inactiveGoalPreview={GET_STRONGER_PREVIEW_INPUT} />);
    await waitFor(() => expect(previewSelect().value).toBe("Improve posture"));
    expect(screen.queryByTestId("inactive-goal-preview-panel")).toBeNull();
  });

  test("server hydration can write only legacy questionnaire data, never preview state", async () => {
    harness.remoteQuestionnaire = {
      goals: "Athletic performance",
      painAreas: ["Shoulders"],
      experience: "Advanced",
      equipment: ["dumbbells"],
      daysPerWeek: 4,
    };
    render(<InactiveProductGoalPreview />);
    selectGetStronger();

    await waitFor(() => {
      const stored = localStorage.getItem("posture_questionnaire");
      expect(stored).not.toBeNull();
      expect(stored).not.toContain("get_stronger");
      expect(stored).not.toContain("INACTIVE_PRODUCT_GOAL_PREVIEW");
    });
    expect(previewSelect().value).toBe("get_stronger");
    fireEvent.click(screen.getByTestId("generate-routine"));
    expect(await screen.findByRole("alert")).not.toBeNull();
    expectNoMutationCalls();
  });
});
