import { describe, expect, it } from "vitest";
import { orchestrateProductionAdaptationApplication } from "../../src";
import { orchestrationDependencies, orchestrationInput, resolvedPrescriptionPort } from
  "../helpers/applicationOrchestrationFixtures";

describe("adaptation application orchestration owners", () => {
  it.each(["keep_current", "repeat_for_confirmation", "hold_current_prescription",
    "no_action_insufficient_evidence"] as const)("returns a truthful no-change shadow for %s", async (action) => {
    const result = await orchestrateProductionAdaptationApplication(orchestrationInput(action),
      orchestrationDependencies());
    expect(result.status).toBe("no_change_shadow_validated");
    expect(result.ownerResult?.changedTargetIds).toEqual([]);
    expect(result.shadowCandidate?.proposedProgramSnapshot?.snapshotRevisionId).toBe("program-revision-1");
    expect(result.applicationApplied).toBe(false);
  });

  it("preserves the selected axis and lets the Prescription owner supply exact realization", async () => {
    const ports = orchestrationDependencies().ownerPorts.map((port) =>
      port.owner === "prescription" ? resolvedPrescriptionPort() : port);
    const result = await orchestrateProductionAdaptationApplication(orchestrationInput("progress_prescription_axis"),
      { ...orchestrationDependencies(ports), downstreamValidationPort: { contractReference: {
        contractId: "PRODUCTION_DOWNSTREAM_VALIDATION", contractVersion: "1.0.0" }, validate: () => ({
          status: "validated", gate13Status: "passed", prescriptionValid: true, sequencingValid: true,
          weekValid: true, phaseSnapshotValid: true, reasonCodes: [], validationFingerprint: "gate13-valid-1" }) } });
    expect(result.status).toBe("shadow_candidate_validated");
    expect(result.ownerResult).toMatchObject({ selectedAxis: "load", changedDimensions: ["load"],
      applicationApplied: false });
    expect(result.longitudinalApplicationValidation?.status).toBe("valid_application_candidate");
  });

  it("routes deload to Week but keeps construction policy-required", async () => {
    const result = await orchestrateProductionAdaptationApplication(orchestrationInput("deload_review"),
      orchestrationDependencies());
    expect(result.status).toBe("pending_policy");
    expect(result.ownerResult).toMatchObject({ owner: "week", status: "week_deload_policy_required",
      proposedWeekPlan: null, applicationApplied: false });
  });

  it("suppresses a material owner call on Safety block", async () => {
    const input = orchestrationInput("progress_prescription_axis");
    const result = await orchestrateProductionAdaptationApplication({ ...input,
      preconditionSnapshot: { ...input.preconditionSnapshot, safetyAllowsMaterialOwnerCall: false } },
    orchestrationDependencies());
    expect(result.status).toBe("blocked_safety");
    expect(result.primaryOwnerInvocationCount).toBe(0);
  });
});
