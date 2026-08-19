import { describe, expect, it } from "vitest";
import { FULL_PROGRAM_GATE_14_SUBGATES } from "../cagt/fullProgramContracts";
import { FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST } from "../cagt/fullProgramCohorts";
import { validateFullPrescribedProgramCagtResult } from "../cagt/fullProgramGate14";
import { digest } from "../cagt/signatures";
import {
  buildFullProgramPairFixture,
  runFullProgramPairFixture,
  runFullProgramPhaseLongitudinalBoundary,
} from "../helpers/fullPrescribedProgramCagtLab";

describe("full prescribed-program CAGT Gate 14", () => {
  const resultFor = (category: typeof FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs[number]["category"]) => {
    const descriptor = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs.find((pair) => pair.category === category)!;
    return runFullProgramPairFixture(buildFullProgramPairFixture(descriptor));
  };

  it("classifies convergence, preserved adaptation, and every causal failure mode", () => {
    expect(resultFor("expected_convergence").finalClassification).toBe("PROGRAM_EXPECTED_CONVERGENCE");
    expect(resultFor("justified_convergence").finalClassification).toBe("PROGRAM_JUSTIFIED_CONVERGENCE");
    expect(resultFor("shared_framework_material_adaptation").finalClassification)
      .toBe("PROGRAM_MATERIAL_ADAPTATION_PRESERVED");
    expect(resultFor("under_adaptation_mutation").finalClassification)
      .toBe("PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT");
    expect(resultFor("over_adaptation_mutation").finalClassification).toBe("PROGRAM_OVER_ADAPTATION");
    expect(resultFor("wrong_layer_mutation").finalClassification).toBe("PROGRAM_WRONG_LAYER_EFFECT");
    expect(resultFor("adaptation_erasure_mutation").finalClassification)
      .toBe("MATERIAL_ADAPTATION_ERASED_DOWNSTREAM");
    expect(resultFor("cosmetic_only_mutation").finalClassification).toBe("PROGRAM_COSMETIC_ONLY_DIFFERENCE");
  });

  it("uses the exact fail-stop order and never scores downstream rescue", () => {
    const clean = resultFor("shared_framework_material_adaptation");
    expect(clean.subgateTrace.map((entry) => entry.subgate)).toEqual(FULL_PROGRAM_GATE_14_SUBGATES);
    expect(validateFullPrescribedProgramCagtResult(clean)).toEqual([]);
    const noRescue = resultFor("no_rescue_mutation");
    expect(noRescue.finalClassification).toBe("PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY");
    expect(noRescue.noRescueTrace).toMatchObject({ downstreamRescueAttempted: true,
      downstreamRescueAccepted: false });
    expect(noRescue.subgateTrace.filter((entry) => entry.state === "SHADOW_DIAGNOSTIC_ONLY")
      .every((entry) => !entry.scored)).toBe(true);
  });

  it("is a pure comparator and explicitly defers Gate 15 and Gate 16 facts", () => {
    const descriptor = FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs.find((pair) =>
      pair.category === "shared_framework_material_adaptation")!;
    const fixture = buildFullProgramPairFixture(descriptor);
    const before = digest([fixture.baselineSnapshot, fixture.counterfactualSnapshot]);
    runFullProgramPairFixture(fixture);
    expect(digest([fixture.baselineSnapshot, fixture.counterfactualSnapshot])).toBe(before);
    expect(runFullProgramPhaseLongitudinalBoundary()).toMatchObject({
      phaseClassification: "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15",
      longitudinalClassification: "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16",
      phaseDecisionMade: false,
      longitudinalDecisionMade: false,
      failureCount: 0,
    });
  });
});
