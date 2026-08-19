import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT,
  PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST,
  runPrescriptionEvaluatorStress,
  runSpacingCompiledSublab,
} from "../cagt/prescriptionTournamentEvaluatorHardening";

describe("CAGT Prescription policy V2 holdout", () => {
  it("freezes the locked V2 holdout manifest independently of the disclosed V1 regression cohort", () => {
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.lockedBeforeExecution).toBe(true);
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios).toHaveLength(100);
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios
      .filter((entry) => entry.assignmentCount >= 2)).toHaveLength(83);
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT)
      .toBe("9d208d6f97364f1d4586cf1f107c027176448438d4999c9542201b1cd7572cfa");
    expect(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
  });

  it("runs blinded V2 stress without identity leaks or downstream rescue", () => {
    const stress = runPrescriptionEvaluatorStress(10_000, 1_000, 1_000);

    expect(stress.blindedCandidateScenarioComparisons).toBe(10_000);
    expect(stress.fullSessionPrescriptionCompilations).toBe(1_000);
    expect(stress.independentPerformanceComparisons).toBe(1_000);
    expect(stress.failures).toEqual([]);
    expect(stress.digest).toBe("d23d2ad26aa534ed657b7efda28396579b9e3fea0511a3d848800ae7e3a15d0a");
    expect(stress.repeatedRunDigest).toBe(stress.digest);
  }, 60_000);

  it("keeps spacing unresolved without actual opportunity timestamps and response evidence", () => {
    const spacing = runSpacingCompiledSublab();

    expect(spacing.result).toBe("PRESCRIPTION_AND_RESPONSE_DEPENDENT");
    expect(spacing.timestampBasis).toBe("ACTUAL_OPPORTUNITY_TIMESTAMPS");
    expect(spacing.universalRecoverySpacingApproved).toBe(false);
    expect(spacing.findings).toContain("unknown duration intervals block fixed recovery-hour approval");
  });
});
