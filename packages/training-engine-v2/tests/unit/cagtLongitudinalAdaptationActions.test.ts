import { describe, expect, it } from "vitest";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { buildLongitudinalAdaptationInput } from "../helpers/longitudinalAdaptationPipeline";

function action(name: string) {
  const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name);
  if (!descriptor) throw new Error(`MISSING_CONTROLLED_CHAIN:${name}`);
  return runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
}

describe("Gate 16 action policy", () => {
  it("implements keep, repeat, hold, and modification before replacement", () => {
    expect(action("productive_current_prescription").selectedPrimaryAction).toBe("keep_current");
    expect(action("first_successful_exposure").selectedPrimaryAction).toBe("repeat_for_confirmation");
    expect(action("mixed_exact_evidence").selectedPrimaryAction).toBe("hold_current_prescription");
    expect(action("one_adverse_realization").selectedPrimaryAction).toBe("prescription_modification_review");
    expect(action("repeated_adverse_exact_realizations").selectedPrimaryAction)
      .toBe("reopen_candidate_selection_for_replacement");
  });

  it("authorizes one legal axis and sends equal support to owner review", () => {
    expect(action("load_axis_legal").actionDirective).toMatchObject({
      action: "progress_prescription_axis", selectedAxis: "load", applicationApplied: false,
    });
    expect(action("repeated_target_failure").selectedPrimaryAction).toBe("regress_prescription_axis");
    expect(action("two_equal_axes_conflict")).toMatchObject({
      selectedPrimaryAction: "owner_review_required", status: "longitudinal_action_conflict",
    });
  });

  it("preserves successful re-exposure and bounds optional rotation", () => {
    expect(action("successful_reexposure").selectedPrimaryAction).toBe("keep_current");
    expect(action("optional_rotation_eligible_accessory").selectedPrimaryAction)
      .toBe("reopen_candidate_selection_for_bounded_rotation");
    expect(action("productive_anchor_rotation_mutation").selectedPrimaryAction).toBe("keep_current");
  });

  it("defers Week, deload, phase, and Safety actions to rightful owners", () => {
    expect(action("adherence_constraint").actionDirective?.downstreamApplicationOwner).toBe("week_owner");
    expect(action("multi_session_recovery_concern").selectedPrimaryAction).toBe("deload_review");
    expect(action("phase_review_request").actionDirective?.downstreamApplicationOwner)
      .toBe("phase_continuity_owner");
    expect(action("safety_block").actionDirective?.downstreamApplicationOwner).toBe("training_safety_owner");
  });
});
