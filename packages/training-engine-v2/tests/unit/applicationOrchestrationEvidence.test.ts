import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES } from "../../src";
import { ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST,
  APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS, APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT,
  APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS, APPLICATION_ORCHESTRATION_MUTATIONS,
  APPLICATION_ORCHESTRATION_SUBGATE_ORDER, runApplicationOrchestrationEvidenceStress,
  summarizeApplicationOrchestrationHoldout } from "../cagt/applicationOrchestrationEvidence";

describe("application orchestration CAGT V10 evidence", () => {
  it("freezes controlled, fixed-shell, and holdout matrices before execution", () => {
    expect(APPLICATION_ORCHESTRATION_CONTROLLED_SCENARIOS.length).toBeGreaterThanOrEqual(220);
    expect(APPLICATION_ORCHESTRATION_FIXED_SHELL_COHORT.length).toBeGreaterThanOrEqual(50);
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_V1_HOLDOUT_MANIFEST.frozenBeforeExecution).toBe(true);
    const summary = summarizeApplicationOrchestrationHoldout();
    expect(summary).toMatchObject({ scenarioCount: 420, genuineFinalDirectiveCount: 320,
      prescriptionOwnerCases: 100, candidateComposerCases: 70, weekOwnerCases: 60,
      phaseSafetyCases: 40, noChangeHumanCases: 60, staleConflictConfirmationCases: 70,
      persistenceReplayCases: 50, doseModeCoverage: 7, sectionCoverage: 5, phaseCoverage: 3,
      opportunityHorizonCoverage: 6, failures: [] });
    expect(summary.downstreamRebuildCases).toBeGreaterThanOrEqual(50);
    expect(summary.exerciseCoverage).toBe(REFERENCE_EXERCISES.length);
  });

  it("covers semantic mutation and metamorphic dimensions", () => {
    expect(APPLICATION_ORCHESTRATION_MUTATIONS.length).toBeGreaterThanOrEqual(80);
    expect(APPLICATION_ORCHESTRATION_METAMORPHIC_INVARIANTS).toHaveLength(16);
    expect(APPLICATION_ORCHESTRATION_SUBGATE_ORDER).toHaveLength(11);
  });

  it("runs deterministic minimum stress counts", () => {
    const stress = runApplicationOrchestrationEvidenceStress();
    expect(stress.failures).toEqual([]);
    expect(stress).toMatchObject({ preconditionEvaluations: 10_000, routingEvaluations: 10_000,
      ownerResultValidations: 10_000, localityValidations: 10_000, shadowCandidateBuilds: 5_000,
      persistenceTransactions: 1_000, concurrentIdempotentPairs: 1_000, replayComparisons: 1_000,
      repeatedRunsDeterministic: true });
    expect(runApplicationOrchestrationEvidenceStress().fingerprint).toBe(stress.fingerprint);
  }, 120_000);
});
