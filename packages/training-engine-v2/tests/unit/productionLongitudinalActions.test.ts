import { describe, expect, it } from "vitest";
import { evaluateLongitudinalAdaptation } from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

function result(name: string) {
  const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name)!;
  return evaluateLongitudinalAdaptation(buildProductionLongitudinalAdaptationInput(descriptor));
}

describe("production Longitudinal actions", () => {
  it("keeps, repeats, holds, modifies, progresses, and regresses deterministically", () => {
    expect(result("productive_current_prescription").selectedPrimaryAction).toBe("keep_current");
    expect(result("first_successful_exposure").selectedPrimaryAction).toBe("repeat_for_confirmation");
    expect(result("mixed_exact_evidence").selectedPrimaryAction).toBe("hold_current_prescription");
    expect(result("exact_limited_load").selectedPrimaryAction).toBe("prescription_modification_review");
    expect(result("load_axis_legal").actionDirective).toMatchObject({
      action: "progress_prescription_axis", selectedAxis: "load", applicationApplied: false,
    });
    expect(result("repeated_target_failure").selectedPrimaryAction).toBe("regress_prescription_axis");
  });

  it("uses owner review for equal axes and never progresses from isolated/calendar/phase evidence", () => {
    expect(result("two_equal_axes_conflict")).toMatchObject({ selectedPrimaryAction: "owner_review_required",
      status: "action_conflict" });
    expect(result("isolated_success_progression_mutation").selectedPrimaryAction).toBe("repeat_for_confirmation");
    expect(result("calendar_progression_mutation").selectedPrimaryAction).toBe("repeat_for_confirmation");
    expect(result("phase_only_progression_mutation").selectedPrimaryAction).toBe("repeat_for_confirmation");
  });

  it("defers Week, deload, Phase, and Safety to their rightful owners", () => {
    expect(result("adherence_constraint").actionDirective?.downstreamApplicationOwner).toBe("week");
    expect(result("multi_session_recovery_concern").actionDirective?.downstreamApplicationOwner).toBe("week");
    expect(result("phase_review_request").actionDirective?.downstreamApplicationOwner).toBe("phase_continuity");
    expect(result("safety_block").actionDirective?.downstreamApplicationOwner).toBe("training_safety");
  });
});
