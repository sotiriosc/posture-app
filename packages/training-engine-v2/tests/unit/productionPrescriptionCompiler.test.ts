import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  PRESCRIPTION_POLICY_V1,
  PRODUCTION_PRESCRIPTION_COMPILER_STATUS,
  buildTrainingReadinessTrace,
  compileSessionPrescription,
  type PrescriptionExecutionRequirement,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { buildProductionCompilerInputForOwnerScenario } from "../helpers/productionPrescriptionCompiler";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT[0];

describe("production Prescription Compiler assignment boundary", () => {
  it("is implemented, exported, and explicitly not activated", () => {
    expect(PRODUCTION_PRESCRIPTION_COMPILER_STATUS).toBe(
      "PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTED_NOT_ACTIVATED",
    );
    expect(PRESCRIPTION_POLICY_V1.activationAuthorized).toBe(false);
  });

  it("requires an explicit available policy and rejects equal conflicts", () => {
    const missing = compileSessionPrescription(
      buildProductionCompilerInputForOwnerScenario(fixture, { policy: null }),
    );
    const unknown = compileSessionPrescription(
      buildProductionCompilerInputForOwnerScenario(fixture, {
        policy: { policyId: "unknown", version: "0.0.0" },
      }),
    );
    const conflictPolicy = {
      ...PRESCRIPTION_POLICY_V1,
      conflicts: [{
        conflictId: "equal-conflict",
        leftRuleId: PRESCRIPTION_POLICY_V1.rules[0].ruleId,
        rightRuleId: PRESCRIPTION_POLICY_V1.rules[1].ruleId,
        authority: "equal" as const,
        resolution: "unresolved" as const,
        provenance: { source: "synthetic_contract_fixture" as const, sourceRef: "unit:equal-conflict" },
      }],
    };
    const conflict = compileSessionPrescription(
      buildProductionCompilerInputForOwnerScenario(fixture, { policy: conflictPolicy }),
    );
    expect(new Set(missing.assignmentResults.map((entry) => entry.status))).toEqual(
      new Set(["prescription_policy_required"]),
    );
    expect(new Set(unknown.assignmentResults.map((entry) => entry.status))).toEqual(
      new Set(["prescription_policy_unavailable"]),
    );
    expect(new Set(conflict.assignmentResults.map((entry) => entry.status))).toEqual(
      new Set(["prescription_policy_conflict"]),
    );
  });

  it("preserves unresolved and conflicting typed requirements", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const handoffId = base.handoff.assignments[0].handoffId;
    const unresolved: PrescriptionExecutionRequirement = {
      requirementId: "unit:unresolved-range",
      targetAssignmentHandoffId: handoffId,
      sourceOwner: "pain_response",
      sourceRef: "unit:unresolved-range",
      targetDimension: "range",
      requestedAction: "review_required",
      side: "left",
      reviewStatus: "needs_review",
      provenance: { source: "synthetic_contract_fixture", sourceRef: "unit:unresolved-range" },
      resolutionState: "unresolved",
    };
    const unresolvedResult = compileSessionPrescription({
      ...base,
      executionRequirements: [...base.executionRequirements, unresolved],
    });
    const conflictingResult = compileSessionPrescription({
      ...base,
      executionRequirements: [
        ...base.executionRequirements,
        { ...unresolved, resolutionState: "conflicting", reviewStatus: "accepted" },
      ],
    });
    expect(unresolvedResult.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )?.status).toBe("unresolved_execution_requirement");
    expect(conflictingResult.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )?.status).toBe("contradictory_prescription_requirements");
  });

  it("blocks before policy work when TrainingSafety disallows execution", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const blocked = compileSessionPrescription({
      ...base,
      trainingReadiness: buildTrainingReadinessTrace({
        trainingSafety: {
          signals: [{
            signalId: "unit:safety-block",
            requestedReviewLevel: "review_required_before_ordinary_training",
            authority: {
              source: "coach",
              sourceRef: "unit:safety-block",
              evidenceBasis: ["explicit controlled safety signal"],
              reportedBy: "unit-test",
              reportedAt: "2026-08-13T17:00:00-04:00",
            },
            resolution: { state: "unresolved" },
            notes: [],
          }],
        },
      }),
    });
    expect(blocked.status).toBe("blocked_by_training_readiness");
    expect(blocked.plans).toHaveLength(0);
    expect(blocked.assignmentResults.every((entry) =>
      entry.status === "blocked_by_training_readiness" &&
      entry.decisionTrace.policyResolutionTrace.length === 0
    )).toBe(true);
  });

  it("preserves the assignment and requests recomposition when equipment is unavailable", () => {
    const machineFixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
      entry.handoff.assignments.some((assignment) => assignment.exerciseId === "machine-chest-press")
    )!;
    const result = compileSessionPrescription({
      ...buildProductionCompilerInputForOwnerScenario(machineFixture),
      currentEquipment: BODYWEIGHT_EQUIPMENT,
    });
    const blocked = result.assignmentResults.find((entry) =>
      entry.handoffAssignment?.exerciseId === "machine-chest-press"
    )!;
    expect(blocked.status).toBe("current_equipment_realization_unavailable");
    expect(blocked.handoffAssignment?.exerciseId).toBe("machine-chest-press");
    expect(blocked.plan).toBeNull();
    expect(blocked.recompositionRequirement?.sourceOwner).toBe("equipment");
  });

  it("never applies automatic progression", () => {
    const result = compileSessionPrescription(
      buildProductionCompilerInputForOwnerScenario(fixture),
    );
    expect(result.assignmentResults.flatMap((entry) =>
      entry.decisionTrace.loadTrace ? [entry.decisionTrace.loadTrace] : []
    ).every((entry) => entry.automaticProgressionApplied === false)).toBe(true);
  });
});
