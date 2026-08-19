import { describe, expect, it } from "vitest";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { buildLongitudinalAdaptationInput } from "../helpers/longitudinalAdaptationPipeline";

describe("Gate 16 mutations and no rescue", () => {
  it("matches every controlled mutation oracle", () => {
    for (const descriptor of LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS) {
      const value = runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
      expect(value.selectedPrimaryAction, descriptor.scenarioId).toBe(descriptor.expectedAction);
      expect(value.status, descriptor.scenarioId).toBe(descriptor.expectedStatus);
      expect(value.firstFailingSubgate, descriptor.scenarioId).toBe(descriptor.expectedFirstFailingSubgate);
    }
  });

  it("marks later stages unscored after an upstream fail-stop", () => {
    const descriptor = Object.freeze({ ...LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS[0],
      scenarioId: "explicit-no-rescue", mutationKind: "upstream_failure", expectedAction: null,
      expectedStatus: "longitudinal_upstream_invalid" as const,
      expectedFirstFailingSubgate: "16.1_upstream_validity" as const });
    const value = runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
    const failureIndex = value.subgateTrace.findIndex((entry) => entry.subgate === value.firstFailingSubgate);
    expect(value.subgateTrace.slice(failureIndex + 1).every((entry) => !entry.scored)).toBe(true);
    expect(value.shadowDiagnostics).toHaveLength(1);
    expect(value.selectedPrimaryAction).toBeNull();
  });

  it("rejects expanded completed-ledger mutation families structurally", () => {
    const base = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) =>
      entry.scenarioId === "productive_current_prescription")!;
    const cases = [
      ["planned_duration_as_actual", "PLANNED_PROGRAM_TRUTH_USED_AS_ACTUAL_OUTCOME"],
      ["wrong_sequence_revision", "WRONG_FINAL_SEQUENCE_REVISION"],
      ["orphan_performance", "ORPHAN_PERFORMANCE_RECORD"],
      ["event_per_response", "DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY"],
      ["event_per_muscle", "DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY"],
      ["event_per_set", "DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY"],
    ] as const;
    for (const [mutationKind, reason] of cases) {
      const descriptor = Object.freeze({ ...base, scenarioId: `mutation:${mutationKind}`,
        opportunityCount: 2 as const, mutationKind, expectedAction: null,
        expectedStatus: "longitudinal_outcome_ledger_invalid" as const,
        expectedFirstFailingSubgate: "16.2_completed_outcome_ledger_integrity" as const });
      const value = runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
      expect(value.firstFailingSubgate, mutationKind).toBe("16.2_completed_outcome_ledger_integrity");
      expect(value.blockers, mutationKind).toContain(reason);
    }
  });
});
