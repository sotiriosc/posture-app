import { describe, expect, it } from "vitest";
import { runPhaseContinuityGate15 } from "../cagt/phaseContinuityGate15";
import { buildPhaseContinuityGate15Input } from "../helpers/phaseContinuityPipeline";

describe("Gate 15 phase state and transition identity", () => {
  it("keeps stay legal indefinitely when training is safe", () => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "indefinite-stay",
      currentPhaseId: "phase_2", targetPhaseId: "phase_2", transitionKind: "stay",
      evidenceMode: "missing", weekInPhase: 52 }));
    expect(result.status).toBe("remain_current_phase");
    expect(result.currentPhaseStateRevisionId).toBeTruthy();
  });

  it("rejects non-adjacent advancement before evidence can rescue it", () => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "phase-skip",
      currentPhaseId: "phase_1", targetPhaseId: "phase_3", transitionKind: "adjacent_advancement",
      evidenceMode: "met" }));
    expect(result.firstFailingSubgate).toBe("15.2_phase_state_truth");
    expect(result.subgateTrace.slice(3).every((entry) => !entry.scored)).toBe(true);
  });

  it("routes backward movement and Phase 3 completion to review without deciding either", () => {
    const regression = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "regression-review",
      currentPhaseId: "phase_2", targetPhaseId: "phase_1", transitionKind: "regression_review",
      evidenceMode: "met" }));
    const cycle = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "cycle-review",
      currentPhaseId: "phase_3", targetPhaseId: "phase_3", transitionKind: "cycle_completion_review",
      evidenceMode: "met" }));
    expect(regression.status).toBe("phase_regression_review_required");
    expect(cycle.status).toBe("phase_cycle_completion_owner_review_required");
    expect(cycle.gate16DeferralTrace).toContain("deload-selection:GATE_16_OWNER_REQUIRED");
  });
});
