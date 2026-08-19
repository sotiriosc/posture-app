import { describe, expect, it } from "vitest";
import { runPrescriptionPolicyStress } from "../cagt/prescriptionPolicyTournament";

describe("CAGT Prescription numeric deterministic stress", () => {
  it("runs 10,000 policy/scenario combinations and audits 1,000 complete pipelines", () => {
    const stress = runPrescriptionPolicyStress();
    expect(stress.cases).toBe(10_000);
    expect(stress.completePipelines).toBe(1_000);
    expect(stress.failures).toEqual([]);
    expect(stress.digest).toBe("0759b782c093bd13066aa0fd2eb366784ad959163b131786b8edbf4337cff4a3");
    expect(stress.digest).toBe(stress.repeatedRunDigest);
  }, 30_000);

  it("keeps metamorphic invariants and no-rescue boundaries explicit", () => {
    const stress = runPrescriptionPolicyStress(1_000, 1_000);
    expect(stress).toEqual(expect.objectContaining({
      policyOrderPermutationStable: true,
      ruleOrderPermutationStable: true,
      blockOrderPermutationStable: true,
      sourceEvidencePermutationStable: true,
      catalogOrderPermutationStable: true,
      candidateOrderPermutationStable: true,
      proseMutationsInert: true,
      labelAndScenarioIdMutationsInert: true,
      revisionMutationsHandled: true,
      performanceBlockMutationsHandled: true,
      substitutionMutationsHandled: true,
      missingPolicyMutationsExplicit: true,
      conflictMutationsExplicit: true,
      preparatoryMiscreditMutationRejected: true,
      sourceEventDuplicationMutationRejected: true,
      tempoOnlyRescueMutationRejected: true,
      sameRepTempoConvergenceStable: true,
      searchDurationUnknownStatesExplicit: true,
      shadowDiagnosticsUnscored: true,
      repeatedRunDeterministic: true,
    }));
  }, 30_000);
});
