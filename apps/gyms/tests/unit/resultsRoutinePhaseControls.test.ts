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

  test("advancing passes when either workout or day gate is satisfied", () => {
    const blocked = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 11,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const passedByWorkouts = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    const passedByDays = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );

    expect(blocked.ok).toBe(false);
    expect(passedByWorkouts.ok).toBe(true);
    expect(passedByWorkouts.satisfiedBy).toBe("workouts");
    expect(passedByDays.ok).toBe(true);
    expect(passedByDays.satisfiedBy).toBe("days");
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

  test("phase-ready notice appears when a workout flips the OR gate", () => {
    const gate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(gate.satisfiedBy).toBe("workouts");

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

  test("day-only gate pass enables the persistent move action without replaying workout notice", () => {
    const gate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(gate.ok).toBe(true);
    expect(gate.satisfiedBy).toBe("days");
    expect(
      getPhaseControlUiState({
        phaseIndex: 1,
        gate,
      }).canMoveNextPhase
    ).toBe(true);
    expect(
      getPhaseReadyNoticeState({
        programId: "program-1",
        phaseIndex: 1,
        gate,
        previousWorkoutsCompletedInPhase: 0,
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
