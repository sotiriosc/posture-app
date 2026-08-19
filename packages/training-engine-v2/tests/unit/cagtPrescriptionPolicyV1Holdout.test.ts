import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT,
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_FINGERPRINT,
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST,
  buildPrescriptionPolicyV1AdmissionReport,
} from "../cagt/prescriptionPolicyV1OwnerAdmission";

describe("CAGT Prescription Policy V1 owner holdout", () => {
  it("locks an independent owner-admission cohort before execution", () => {
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST.lockedBeforeExecution).toBe(true);
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST.independentlyLockedAfterV2Disclosure).toBe(true);
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST.tuningAfterInspectionPermitted).toBe(false);
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT).toHaveLength(132);
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((entry) => entry.handoff.assignments.length >= 2)).toHaveLength(121);
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_FINGERPRINT)
      .toBe("5c083fb746e9110238e8b0ab632401a3d5581c633156de510b11e6d387d692c6");
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.every((entry) =>
      entry.locked && entry.candidateSource === "production_session_intent_planner_candidate_intelligence_composer")).toBe(true);
  });

  it("covers the required production contexts and blinded stress surface", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(report.holdout.calibrationAndHoldoutExerciseIdentityCount).toBe(45);
    expect(report.holdout.sections).toEqual(["accessory", "activation", "cooldown", "main", "warmup"]);
    expect(report.holdout.roles).toEqual([
      "activation", "capacity", "hypertrophy_accessory", "preparation", "primary_strength", "recovery", "secondary_strength",
    ]);
    expect(report.holdout.doseModes).toEqual([
      "breath_cycles", "distance_carry", "repetition_sets", "step_march", "step_sets", "timed_carry", "timed_hold",
    ]);
    expect(report.holdout.goals).toHaveLength(5);
    expect(report.holdout.phases).toEqual(["phase_1", "phase_2", "phase_3"]);
    expect(report.holdout.equipmentContexts).toEqual(["bands", "bodyweight", "dumbbells", "full_gym", "mixed"]);
    expect(report.holdout.capacities).toEqual(["condensed", "expanded", "standard"]);
    expect(report.holdout.expectedNonCompilation).toEqual({ missingPolicy: 1, conflict: 1, unsupportedContext: 1 });
    expect(report.stress.blindedComparisonCount).toBe(10_032);
    expect(report.stress.candidateIdentityLeakCount).toBe(0);
    expect(report.stress.randomOutputCount).toBe(0);
    expect(Object.values(report.stress.mutationResults).every((result) => result === "PASS")).toBe(true);
  }, 60_000);
});
