import { describe, expect, it } from "vitest";
import {
  evaluateLongitudinalAdaptation,
  validateProductionLongitudinalApplicationCandidate,
} from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

function input(name: string) {
  return buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name)!);
}

describe("production replacement, re-exposure, rotation, and application", () => {
  it("modifies before replacement and preserves successful re-exposure", () => {
    expect(evaluateLongitudinalAdaptation(input("one_adverse_realization")).selectedPrimaryAction)
      .toBe("prescription_modification_review");
    expect(evaluateLongitudinalAdaptation(input("repeated_adverse_exact_realizations")).actionDirective)
      .toMatchObject({ action: "reopen_candidate_selection_for_replacement",
        downstreamApplicationOwner: "candidate_intelligence_and_composer", applicationApplied: false });
    expect(evaluateLongitudinalAdaptation(input("successful_reexposure")).selectedPrimaryAction).toBe("keep_current");
  });

  it("permits bounded non-anchor rotation and protects productive anchors", () => {
    expect(evaluateLongitudinalAdaptation(input("optional_rotation_eligible_accessory")).selectedPrimaryAction)
      .toBe("reopen_candidate_selection_for_bounded_rotation");
    expect(evaluateLongitudinalAdaptation(input("productive_anchor_rotation_mutation")).selectedPrimaryAction)
      .toBe("keep_current");
  });

  it("hard-fails action erasure, scope excess, and wrong application owner", () => {
    expect(evaluateLongitudinalAdaptation(input("action_erased_downstream"))).toMatchObject({
      status: "application_invalid", firstFailingSubgate: "16.8_optional_application_validation",
    });
    expect(evaluateLongitudinalAdaptation(input("action_scope_exceeded"))).toMatchObject({
      status: "application_invalid", firstFailingSubgate: "16.8_optional_application_validation",
    });
    const wrong = structuredClone(input("action_erased_downstream").optionalApplicationCandidate!);
    (wrong as { applicationOwner: "week" }).applicationOwner = "week";
    expect(validateProductionLongitudinalApplicationCandidate(wrong)).toMatchObject({
      status: "wrong_application_owner", wrongOwnerCount: 1,
      reasonCodes: expect.arrayContaining(["LONGITUDINAL_WRONG_APPLICATION_OWNER"]),
    });
  });
});
