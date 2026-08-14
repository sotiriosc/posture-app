import { describe, expect, it } from "vitest";
import { runPhaseContinuityGate15 } from "../cagt/phaseContinuityGate15";
import { buildPhaseContinuityGate15Input } from "../helpers/phaseContinuityPipeline";

describe("Gate 15 cross-horizon alignment and stable base", () => {
  it("allows a complete program to stay stable across an adjacent phase", () => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "stable-program",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "met" }));
    expect(result.crossHorizonAlignment.status).toBe("aligned");
    expect(result.metrics.frameworkRetentionRate).toBe(1);
    expect(result.metrics.anchorRetentionRate).toBe(1);
    expect(result.metrics.samePrescriptionRate).toBe(1);
  });

  it("rejects ambiguous alignment and global regeneration at their first owner subgates", () => {
    const ambiguous = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "ambiguous",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "met", mutationKind: "ambiguous_alignment" }));
    const regenerated = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "regenerated",
      currentPhaseId: "phase_1", targetPhaseId: "phase_2", transitionKind: "adjacent_advancement",
      evidenceMode: "met", mutationKind: "global_program_regeneration" }));
    expect(ambiguous.status).toBe("phase_program_alignment_ambiguous");
    expect(ambiguous.firstFailingSubgate).toBe("15.5_cross_horizon_alignment");
    expect(regenerated.firstFailingSubgate).toBe("15.6_stable_base_continuity");
    expect(regenerated.detailedClassifications).toContain("PHASE_PROGRAM_EXCESSIVE_REGENERATION");
  });

  it("permits a local reviewed prescription change without selecting progression", () => {
    const result = runPhaseContinuityGate15(buildPhaseContinuityGate15Input({ caseId: "local-change",
      currentPhaseId: "phase_2", targetPhaseId: "phase_3", transitionKind: "adjacent_advancement",
      evidenceMode: "met", mutationKind: "local_phase_prescription" }));
    expect(result.detailedClassifications).toContain("PHASE_PROGRAM_LOCAL_CHANGE_JUSTIFIED");
    expect(result.automaticProgressionCount).toBe(0);
    expect(result.automaticReplacementCount).toBe(0);
  });
});
