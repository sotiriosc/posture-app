import { describe, expect, test } from "vitest";
import { canAdvancePhase } from "@/lib/phaseGating";
import {
  evaluateSkipPhaseOneAction,
  getPhaseControlUiState,
} from "@/lib/phaseControls";

describe("results routine phase controls", () => {
  test("phase 1 skip flow: open/cancel does nothing, confirm advances to phase 2", () => {
    const canceled = evaluateSkipPhaseOneAction({
      currentPhaseIndex: 1,
      confirmed: false,
    });
    expect(canceled.didAdvance).toBe(false);
    expect(canceled.nextPhaseIndex).toBe(1);

    const confirmed = evaluateSkipPhaseOneAction({
      currentPhaseIndex: 1,
      confirmed: true,
    });
    expect(confirmed.didAdvance).toBe(true);
    expect(confirmed.nextPhaseIndex).toBe(2);
  });

  test("advancing remains blocked until both cycle and day gates pass", () => {
    const missingCycles = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        cyclesCompletedInPhase: 1,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const missingDays = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        cyclesCompletedInPhase: 2,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const passed = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        cyclesCompletedInPhase: 2,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(missingCycles.ok).toBe(false);
    expect(missingDays.ok).toBe(false);
    expect(passed.ok).toBe(true);
  });

  test("phase 1 disables upload/photos and phase move until gate passes", () => {
    const blockedGate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        cyclesCompletedInPhase: 1,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const ui = getPhaseControlUiState({
      phaseIndex: 1,
      gate: blockedGate,
    });
    expect(ui.showSkipPhaseOne).toBe(true);
    expect(ui.canMoveNextPhase).toBe(false);
    expect(ui.canUploadPhotos).toBe(false);
  });

  test("phase 2/3 hide skip control", () => {
    const blockedPhase2 = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-10T00:00:00.000Z",
        cyclesCompletedInPhase: 1,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const blockedPhase3 = canAdvancePhase(
      {
        phaseIndex: 3,
        phaseStartedAt: "2026-01-10T00:00:00.000Z",
        cyclesCompletedInPhase: 1,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(
      getPhaseControlUiState({ phaseIndex: 2, gate: blockedPhase2 }).showSkipPhaseOne
    ).toBe(false);
    expect(
      getPhaseControlUiState({ phaseIndex: 3, gate: blockedPhase3 }).showSkipPhaseOne
    ).toBe(false);
  });

  test("phase 3 does not allow manual phase move even when gate passes", () => {
    const passedPhase3Gate = canAdvancePhase(
      {
        phaseIndex: 3,
        phaseStartedAt: "2025-10-01T00:00:00.000Z",
        cyclesCompletedInPhase: 8,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(passedPhase3Gate.ok).toBe(true);
    const ui = getPhaseControlUiState({
      phaseIndex: 3,
      gate: passedPhase3Gate,
    });
    expect(ui.canMoveNextPhase).toBe(false);
  });
});
