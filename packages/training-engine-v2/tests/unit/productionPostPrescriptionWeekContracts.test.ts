import { describe, expect, it } from "vitest";
import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_CLASSIFICATION,
  PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CLASSIFICATION,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_STATUS,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  resolvePostPrescriptionWeekValidationPolicy,
  validateProductionPostPrescriptionWeekInput,
  validateProductionPostPrescriptionWeekPolicy,
  validateProductionPrescribedWeekSourceSnapshot,
} from "../../src";
import { buildPostPrescriptionWeekHoldoutInput, POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST } from "../cagt/postPrescriptionWeekValidationV1";
import { adaptPostPrescriptionWeekDesignInput } from "../helpers/postPrescriptionWeekDesignAdapter";
import { buildProductionPostPrescriptionWeekBaseInput } from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week contracts", () => {
  it("publishes versioned inactive production authority", () => {
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE).toEqual({
      contractId: "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL",
      contractVersion: "1.0.0",
    });
    expect(PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE).toEqual({
      contractId: "PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT",
      contractVersion: "1.0.0",
    });
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_CLASSIFICATION)
      .toBe("PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_READY");
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_STATUS)
      .toBe("PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED");
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CLASSIFICATION)
      .toBe("PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION");
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES).toHaveLength(22);
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY).toEqual({
      gate9: "PRODUCTION_KERNEL_AUTHORITY",
      gate10: "PRODUCTION_KERNEL_AUTHORITY",
      gate11: "FOUNDATION_AUTHORITY",
      gate12: "MIXED_PRODUCTION_AND_DESIGN_HORIZON_AUTHORITY",
      gate13: "PRODUCTION_KERNEL_AUTHORITY",
      gate14: "NOT_IMPLEMENTED",
      gate15: "NOT_IMPLEMENTED",
      gate16: "FOUNDATION_ONLY / NOT_IMPLEMENTED",
    });
  });

  it("keeps one inactive canonical policy and a frozen design projection", () => {
    expect(validateProductionPostPrescriptionWeekPolicy(
      POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    )).toEqual([]);
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE).toMatchObject({
      policyId: "POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE",
      version: "1.0.0",
      automaticSelection: false,
      productionActivation: false,
    });
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.frequencyRules)
      .toEqual(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.frequencyRules);
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.unsupportedScopes)
      .toEqual(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.unsupportedScopes);
  });

  it("requires explicit object or caller-supplied registry resolution", () => {
    const base = buildProductionPostPrescriptionWeekBaseInput();
    expect(resolvePostPrescriptionWeekValidationPolicy({ ...base, validationPolicy: null }).status).toBe("required");
    expect(resolvePostPrescriptionWeekValidationPolicy({
      ...base,
      validationPolicy: { policyId: "UNKNOWN", version: "1.0.0" },
      availableValidationPolicies: [],
    }).status).toBe("unavailable");
    expect(resolvePostPrescriptionWeekValidationPolicy({
      ...base,
      validationPolicy: {
        policyId: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.policyId,
        version: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.version,
      },
      availableValidationPolicies: [POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE],
    }).status).toBe("resolved");
  });

  it("validates the normalized source and complete production input without private Week contracts", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput();
    expect(validateProductionPrescribedWeekSourceSnapshot(input.weekSource)).toEqual([]);
    expect(validateProductionPostPrescriptionWeekInput(input)).toEqual([]);
    expect(input.weekSource.sourceAuthority).toBe("COMPATIBILITY_ADAPTER");
  });

  it("maps the frozen design source explicitly without creating Week facts", () => {
    const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.find((entry) => entry.mutation === "none");
    if (!scenario) throw new Error("CLEAN_HOLDOUT_SCENARIO_REQUIRED");
    const source = buildPostPrescriptionWeekHoldoutInput(scenario);
    const adapted = adaptPostPrescriptionWeekDesignInput(source);
    expect(adapted.status).toBe("adapted");
    if (adapted.status !== "adapted") return;
    expect(adapted.trace).toMatchObject({
      createdObjectiveCount: 0,
      createdReservationCount: 0,
      defaultPolicySelectionCount: 0,
      proseParseCount: 0,
      reasonCodes: [],
    });
    expect(adapted.productionInput.weekSource.objectives.map((objective) => objective.objectiveId))
      .toEqual(source.weeklyIntent.objectives.map((objective) => objective.id));
    expect(adapted.productionInput.weekSource.reservations.map((reservation) => reservation.reservationId))
      .toEqual(source.orderedReservations.map((reservation) => reservation.id));
  });
});
