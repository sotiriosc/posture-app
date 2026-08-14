import { describe, expect, it } from "vitest";
import { runPhaseContinuityGate15 } from "../cagt/phaseContinuityGate15";
import { buildPhaseContinuityGate15Input } from "../helpers/phaseContinuityPipeline";

describe("Gate 15 typed advancement evidence", () => {
  it.each([
    ["phase_1", "phase_2"],
    ["phase_2", "phase_3"],
  ] as const)("authorizes %s to %s only when every typed criterion is met", (current, target) => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({
      caseId: `criteria-met:${current}:${target}`,
      currentPhaseId: current,
      targetPhaseId: target,
      transitionKind: "adjacent_advancement",
      evidenceMode: "met",
    }));
    expect(result.status).toBe("advance_to_next_phase_authorized");
    expect(result.criterionEvaluations).toHaveLength(5);
    expect(result.criterionEvaluations.every((entry) => entry.state === "met")).toBe(true);
  });

  it.each([
    ["missing", "hold_current_phase_pending_evidence"],
    ["planned_only", "hold_current_phase_pending_evidence"],
    ["isolated", "hold_current_phase_pending_evidence"],
    ["mixed", "transition_evidence_conflict"],
    ["conflict", "transition_evidence_conflict"],
    ["blocker", "hold_current_phase_due_blocker"],
  ] as const)("maps %s evidence without inventing completion", (evidenceMode, status) => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({
      caseId: `criteria:${evidenceMode}`,
      currentPhaseId: "phase_2",
      targetPhaseId: "phase_3",
      transitionKind: "adjacent_advancement",
      evidenceMode,
    }));
    expect(result.status).toBe(status);
  });

  it("keeps week count observational and gives safety independent veto authority", () => {
    const week1 = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "week-1",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "missing", weekInPhase: 1 }));
    const week12 = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "week-12",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "missing", weekInPhase: 12 }));
    const safety = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "safety",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "met", safetyBlock: true }));
    expect(week1.status).toBe("hold_current_phase_pending_evidence");
    expect(week12.status).toBe(week1.status);
    expect(safety.status).toBe("transition_blocked_by_training_safety");
  });
});
