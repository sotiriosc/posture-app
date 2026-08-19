import { describe, expect, it } from "vitest";
import { evaluatePhaseContinuity } from "../../src/phaseContinuity";
import { buildPhaseContinuityControlledInput } from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";

describe("production Phase Continuity alignment and stable base", () => {
  it("accepts the same complete program across an adjacent phase", () => {
    const result = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(27)));
    expect(result.status).toBe("advance_to_next_phase_authorized");
    expect(result.metrics.frameworkRetentionRate).toBe(1);
    expect(result.metrics.anchorRetentionRate).toBe(1);
    expect(result.prescriptionContinuityTrace).toContain("same-prescription-across-phase:legal");
  });

  it("accepts local phase-owned Prescription review without selecting dose", () => {
    const result = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(28)));
    expect(result.status).toBe("advance_to_next_phase_authorized");
    expect(result.detailedClassifications).toContain("PHASE_PROGRAM_LOCAL_CHANGE_JUSTIFIED");
    expect(result.automaticProgressionCount).toBe(0);
  });

  it("rejects ambiguity and global regeneration without guessing", () => {
    const ambiguous = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(79)));
    const regenerated = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(29)));
    expect(ambiguous.status).toBe("phase_program_alignment_ambiguous");
    expect(regenerated.status).toBe("transition_not_authorized");
    expect(regenerated.detailedClassifications).toContain("PHASE_PROGRAM_EXCESSIVE_REGENERATION");
  });

  it("attributes equipment and goal changes outside phase ownership", () => {
    const equipment = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(84)));
    const goal = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(61)));
    expect(equipment.metrics.nonPhaseOwnedChangeCount).toBeGreaterThan(0);
    expect(goal.metrics.nonPhaseOwnedChangeCount).toBeGreaterThan(0);
    expect(equipment.detailedClassifications).not.toContain("PHASE_WRONG_LAYER_EFFECT");
  });

  it("rejects generic phase warm-up and activation mutations", () => {
    for (const index of [73, 74, 75]) {
      const result = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index)));
      expect(result.firstFailingStage).toBe("15.8_supporting_continuity");
      expect(result.genericPhaseWarmupCount).toBe(0);
      expect(result.genericPhaseActivationCount).toBe(0);
    }
  });
});
