import { describe, expect, it } from "vitest";
import {
  auditPrescriptionRestPlacement,
  buildCandidateEvaluationInputs,
  buildPrescriptionTournamentV2HoldoutManifest,
  compileFullSession,
  runH1H2CompiledSublab,
} from "../cagt/prescriptionTournamentEvaluatorHardening";

describe("CAGT Prescription duration truth", () => {
  it("uses duration intervals and unknown components instead of fake duration constants", () => {
    const balanced = buildCandidateEvaluationInputs()
      .find((entry) => entry.manifestIdentity.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
    const results = buildPrescriptionTournamentV2HoldoutManifest()
      .filter((fixture) => fixture.handoff.assignments.length >= 2)
      .slice(0, 20)
      .map((fixture) => compileFullSession({ bundle: balanced.bundle, fixture }));

    expect(results.every((result) =>
      result.sessionDurationInterval.status === "unknown_due_to_sequencing" &&
      result.sessionDurationInterval.knownLowerBoundSeconds === null &&
      result.sessionDurationInterval.knownUpperBoundSeconds === null &&
      result.sessionDurationInterval.unknownComponents.includes("unknown_due_to_sequencing"))).toBe(true);
    expect(results.flatMap((result) => result.durationIntervals)
      .some((interval) => interval.unknownComponents.includes("unknown_due_to_repetition_tempo")))
      .toBe(true);
  });

  it("creates a rest-placement ontology before any rest duration use", () => {
    const audit = auditPrescriptionRestPlacement();

    expect(audit.currentDoseRestField).toBe("AMBIGUOUS_WITHOUT_PLACEMENT_CONTRACT");
    expect(audit.designOnlyContractRequired).toBe(true);
    expect(audit.finding).toBe("REST_PLACEMENT_CONTRACT_CREATED_BEFORE_DURATION_USE");
    expect(audit.placementsByMode).toEqual(expect.objectContaining({
      repetition_sets: "between_sets",
      breath_cycles: "between_rounds",
      distance_carry: "between_trips",
      timed_carry: "between_trips",
      step_march: "between_sets",
      step_sets: "between_sets",
    }));
  });

  it("keeps H1 and H2 distribution prescription-and-response dependent", () => {
    const h1h2 = runH1H2CompiledSublab();

    expect(h1h2.result).toBe("PRESCRIPTION_AND_RESPONSE_DEPENDENT");
    expect(h1h2.preparatoryExcluded).toBe(true);
    expect(h1h2.additiveErrorMutation).toBe("FAIL_PREPARATORY_OR_DISTRIBUTED_VOLUME_DOUBLE_COUNT");
    expect(h1h2.sessionDurationIntervals).toContain("unknown_due_to_sequencing");
  });
});
