import { describe, expect, it } from "vitest";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { buildLongitudinalAdaptationInput } from "../helpers/longitudinalAdaptationPipeline";

function application(name: string) {
  const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name);
  if (!descriptor) throw new Error(`MISSING_CONTROLLED_CHAIN:${name}`);
  return runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
}

describe("Gate 16 decision/application separation", () => {
  it("keeps every application mutation flag false", () => {
    const value = application("authorized_load_axis_reflected_locally");
    expect([value.programMutationApplied, value.prescriptionMutationApplied, value.exerciseReplacementApplied,
      value.rotationApplied, value.deloadApplied, value.weekReallocationApplied, value.phaseMutationApplied])
      .toEqual([false, false, false, false, false, false, false]);
    expect(value.applicationOwnerRequired).toBe(true);
  });

  it("preserves the directive while rejecting action erasure", () => {
    const value = application("action_erased_downstream");
    expect(value).toMatchObject({ selectedPrimaryAction: "progress_prescription_axis",
      status: "longitudinal_application_invalid", firstFailingSubgate: "16.8_optional_application_validation",
      decisionAuthorized: false });
    expect(value.applicationValidation.status).toBe("action_erased");
    expect(value.detailedClassifications).toContain("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  });

  it("rejects unrelated, phase, and direct replacement scope effects", () => {
    expect(application("action_scope_exceeded").applicationValidation.status).toBe("action_scope_exceeded");
    expect(application("phase_mutation_applied_by_gate16").status).toBe("longitudinal_application_invalid");
    expect(application("replacement_direct_swap_without_candidate_rerun").applicationValidation.status)
      .toBe("action_scope_exceeded");
  });
});
