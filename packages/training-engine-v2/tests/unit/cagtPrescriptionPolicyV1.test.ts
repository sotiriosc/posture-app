import { describe, expect, it } from "vitest";
import {
  EXPECTED_PRESCRIPTION_POLICY_V1_FINGERPRINTS,
  PRESCRIPTION_POLICY_V1_ID,
  PRESCRIPTION_POLICY_V1_OWNER_DECISION,
  PRESCRIPTION_POLICY_V1_PHILOSOPHY,
  PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1_STATE,
  PRESCRIPTION_POLICY_V1_VERSION,
  buildBlindedOwnerPolicyBundle,
  buildPrescriptionPolicyV1AdmissionReport,
} from "../cagt/prescriptionPolicyV1OwnerAdmission";

function dynamic(tags: readonly string[], family: "preparation" | "activation" | "main_strength" | "direct_accessory") {
  return buildBlindedOwnerPolicyBundle(tags).rulesByFamily[family].value.dynamic!;
}

describe("CAGT Prescription Policy V1 owner selection", () => {
  it("records an explicit owner decision without claiming CAGT selected the policy", () => {
    expect(PRESCRIPTION_POLICY_V1_ID).toBe("PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE");
    expect(PRESCRIPTION_POLICY_V1_VERSION).toBe("1.0.0");
    expect(PRESCRIPTION_POLICY_V1_STATE).toBe("OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION");
    expect(PRESCRIPTION_POLICY_V1_OWNER_DECISION.sourceType).toBe("owner_decision");
    expect(PRESCRIPTION_POLICY_V1_OWNER_DECISION.reviewerId).toBe("sotiriosc");
    expect(PRESCRIPTION_POLICY_V1_OWNER_DECISION.reviewedAt).toBe("2026-08-13T15:02:00-04:00");
    expect(PRESCRIPTION_POLICY_V1_OWNER_DECISION.cagtDidNotSelectPolicy).toBe(true);
    expect(PRESCRIPTION_POLICY_V1_OWNER_DECISION.productionActivationAuthorized).toBe(false);
    expect(PRESCRIPTION_POLICY_V1_PHILOSOPHY).toContain("smallest supporting dose");
  });

  it("selects bounded context-specific values without exposing owner identity to evaluation", () => {
    expect(dynamic(["intermediate"], "main_strength")).toMatchObject({
      sets: { kind: "exact", value: 3 },
      reps: { kind: "range", min: 3, max: 6 },
      effort: { kind: "rir", min: 1, max: 3 },
      rest: { kind: "range", min: 180, max: 300 },
    });
    expect(dynamic(["novice"], "main_strength")).toMatchObject({
      sets: { kind: "exact", value: 2 },
      effort: { kind: "rir", min: 2, max: 4 },
      rest: { kind: "range", min: 120, max: 240 },
    });
    expect(dynamic([], "preparation").sets).toMatchObject({ kind: "exact", value: 1 });
    expect(dynamic(["required_preparation_dependency"], "preparation").sets).toMatchObject({ kind: "exact", value: 2 });
    expect(dynamic([], "activation").sets).toMatchObject({ kind: "exact", value: 1 });
    expect(dynamic(["required_activation_dependency", "explicit_control_requirement", "low_fatigue_activation"], "activation").sets)
      .toMatchObject({ kind: "exact", value: 2 });
    expect(dynamic(["optional_direct_objective"], "direct_accessory").sets).toMatchObject({ kind: "exact", value: 1 });
    expect(dynamic(["required_direct_objective"], "direct_accessory").sets).toMatchObject({ kind: "exact", value: 2 });

    const serialized = JSON.stringify(buildBlindedOwnerPolicyBundle(["intermediate"]));
    expect(serialized).not.toContain(PRESCRIPTION_POLICY_V1_ID);
    expect(serialized).not.toContain("owner_decision");
    expect(serialized).not.toContain("sotiriosc");
  });

  it("freezes specificity, classification and policy fingerprints", () => {
    const report = buildPrescriptionPolicyV1AdmissionReport();

    expect(PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER).toHaveLength(13);
    expect(PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER[0]).toBe("TrainingSafety authority");
    expect(PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER.at(-1)).toBe("broad V1 default");
    expect(report.classification).toBe("PRESCRIPTION_POLICY_V1_READY_FOR_PRODUCTION_COMPILER_IMPLEMENTATION_AUTHORIZATION");
    expect(report.fingerprints).toEqual(EXPECTED_PRESCRIPTION_POLICY_V1_FINGERPRINTS);
    expect(report.productionBehaviorChanged).toBe(false);
    expect(report.productionPolicyActivated).toBe(false);
  }, 60_000);
});
