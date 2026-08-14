import { describe, expect, it } from "vitest";
import {
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST,
} from "../cagt/sessionSequencingPolicyV1";
import { buildFinalSessionSequencingAdmissionReport } from "../helpers/sessionSequencingDesignLab";

describe("Final Session Sequencing V1 locked holdout", () => {
  it("was locked before execution and satisfies the required breadth", () => {
    const report = buildFinalSessionSequencingAdmissionReport();
    expect(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.lockedBeforeExecution).toBe(true);
    expect(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.policyTuningAfterInspectionPermitted).toBe(false);
    expect(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
    expect(report.holdout.scenarioCount).toBeGreaterThanOrEqual(120);
    expect(report.holdout.genuineCompletePrescribedSessionCount).toBeGreaterThanOrEqual(100);
    expect(report.holdout.exerciseIdentityCountAcrossCalibrationAndHoldout).toBeGreaterThanOrEqual(45);
    expect(report.holdout.sections).toEqual(["accessory", "activation", "cooldown", "main", "warmup"]);
    expect(report.holdout.roles).toEqual(expect.arrayContaining([
      "preparation", "activation", "primary_strength", "secondary_strength",
      "hypertrophy_accessory", "capacity", "recovery",
    ]));
    expect(report.holdout.doseModes).toHaveLength(7);
  });

  it("preserves all hard identities and structural constraints at zero", () => {
    const holdout = buildFinalSessionSequencingAdmissionReport().holdout;
    expect({
      additions: holdout.assignmentAdditionCount,
      removals: holdout.assignmentRemovalCount,
      duplicates: holdout.duplicateAssignmentCount,
      sourceRewrites: holdout.sourceEventRewriteCount,
      revisionRewrites: holdout.revisionRewriteCount,
      blockReorders: holdout.blockReorderCount,
      blockInterleaving: holdout.blockInterleavingCount,
      dependencies: holdout.dependencyViolationCount,
      sections: holdout.sectionViolationCount,
      purposeLoss: holdout.mainPurposeLossCount,
      fakeDuration: holdout.fakeDurationCount,
    }).toEqual({
      additions: 0, removals: 0, duplicates: 0, sourceRewrites: 0, revisionRewrites: 0,
      blockReorders: 0, blockInterleaving: 0, dependencies: 0, sections: 0, purposeLoss: 0, fakeDuration: 0,
    });
  });
});
