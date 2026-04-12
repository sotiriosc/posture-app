import { describe, expect, test } from "vitest";
import { canAdvancePhase } from "@/lib/phaseGating";
import {
  getPhaseReadyNoticeState,
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

  test("advancing remains blocked until both workout and day gates pass", () => {
    const missingWorkouts = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 11,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const missingDays = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const passed = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(missingWorkouts.ok).toBe(false);
    expect(missingDays.ok).toBe(false);
    expect(passed.ok).toBe(true);
  });

  test("phase 1 hides skip and disables upload/photos and phase move until gate passes", () => {
    const blockedGate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 11,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const ui = getPhaseControlUiState({
      phaseIndex: 1,
      gate: blockedGate,
    });
    expect(ui.showSkipPhaseOne).toBe(false);
    expect(ui.canMoveNextPhase).toBe(false);
    expect(ui.canUploadPhotos).toBe(false);
  });

  test("phase 2/3 hide skip control", () => {
    const blockedPhase2 = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-10T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const blockedPhase3 = canAdvancePhase(
      {
        phaseIndex: 3,
        phaseStartedAt: "2026-01-10T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        daysPerWeek: 3,
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
        workoutsCompletedInPhase: 24,
        daysPerWeek: 3,
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

  test("phase-ready notice appears only when a workout flips the gate", () => {
    const gate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(
      getPhaseReadyNoticeState({
        programId: "program-1",
        phaseIndex: 1,
        gate,
        previousWorkoutsCompletedInPhase: 11,
      })
    ).toMatchObject({
      shouldShow: true,
      nextPhaseIndex: 2,
    });

    expect(
      getPhaseReadyNoticeState({
        programId: "program-1",
        phaseIndex: 1,
        gate,
        previousWorkoutsCompletedInPhase: 12,
      }).shouldShow
    ).toBe(false);
    expect(
      getPhaseReadyNoticeState({
        programId: "program-1",
        phaseIndex: 1,
        gate,
        previousWorkoutsCompletedInPhase: 11,
        dismissed: true,
      }).shouldShow
    ).toBe(false);
  });

  test("dismissed phase-ready notice still leaves phase advance discoverable", () => {
    const gate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(
      getPhaseReadyNoticeState({
        programId: "program-1",
        phaseIndex: 1,
        gate,
        previousWorkoutsCompletedInPhase: 11,
        dismissed: true,
      }).shouldShow
    ).toBe(false);
    expect(
      getPhaseControlUiState({
        phaseIndex: 1,
        gate,
      }).canMoveNextPhase
    ).toBe(true);
  });
});
