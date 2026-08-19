import { describe, expect, it } from "vitest";
import { runWeekPolicyTournamentStress } from "../cagt/weekPolicyTournamentStress";

describe("CAGT numeric policy deterministic stress", () => {
  it("runs 10,000 policy/scenario combinations and audits 1,000 complete pipelines", () => {
    const stress = runWeekPolicyTournamentStress();
    expect(stress.policyScenarioCases).toBe(10_000);
    expect(stress.completeReservationToSessionPipelines).toBe(1_000);
    expect(stress.availableCompletePipelines).toBeGreaterThanOrEqual(1_000);
    expect(stress.failures).toEqual([]);
    expect(stress.digest).toBe(stress.repeatedRunDigest);
  }, 30_000);

  it("keeps all declared metamorphic invariants and no-rescue semantics", () => {
    const stress = runWeekPolicyTournamentStress(1_000, 1_000);
    expect(stress).toEqual(expect.objectContaining({
      invalidBandGate0Failures: true, priorityMinimumGate0Failures: true,
      policyOrderPermutationStable: true, objectiveOrderPermutationStable: true,
      opportunityOrderPermutationStable: true, catalogOrderPermutationStable: true,
      sourceEvidencePermutationStable: true, proseMutationInert: true, scenarioIdMutationInert: true,
      shadowDiagnosticUnscored: true, searchInconclusiveNotConvergence: true,
      noPolicyControlFailsBeforeDownstream: true, productionActivation: false,
    }));
  });
});
