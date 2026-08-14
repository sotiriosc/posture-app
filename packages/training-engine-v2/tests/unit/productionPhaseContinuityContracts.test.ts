import { describe, expect, it } from "vitest";
import {
  PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS,
  PRODUCTION_PHASE_CHANGED_FACT_OWNERS,
  PRODUCTION_PHASE_CONTINUITY_ACTIVATION_STATUS,
  PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_CONTINUITY_KERNEL_STATUS,
  PRODUCTION_PHASE_CONTINUITY_STATUSES,
  PRODUCTION_PHASE_EVIDENCE_OWNERS,
  PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
  PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_TRANSITION_GRAPH,
  evaluatePhaseContinuity,
  validateProductionPhaseContinuityContractAndInput,
  validateProductionPhaseContinuityResult,
} from "../../src/phaseContinuity";
import { buildPhaseContinuityControlledInput } from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";

describe("production Phase Continuity contracts", () => {
  it("exports versioned production contracts without activation", () => {
    expect(PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE).toEqual({
      contractId: "PRODUCTION_PHASE_CONTINUITY_KERNEL", contractVersion: "1.0.0",
    });
    expect(PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_PHASE_CONTINUITY_KERNEL_STATUS)
      .toBe("PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED");
    expect(PRODUCTION_PHASE_CONTINUITY_ACTIVATION_STATUS).toBe("NOT_ACTIVATED");
  });

  it("keeps status, continuity, owner, and dimension vocabularies closed", () => {
    expect(PRODUCTION_PHASE_CONTINUITY_STATUSES).toHaveLength(21);
    expect(PRODUCTION_PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS).toHaveLength(18);
    expect(PRODUCTION_PHASE_EVIDENCE_OWNERS).toEqual(expect.arrayContaining([
      "performance_summary", "completed_session_summary", "planned_program_truth", "unknown",
    ]));
    expect(PRODUCTION_PHASE_CHANGED_FACT_OWNERS).toHaveLength(12);
    expect(PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS).toContain("longitudinal_deferred");
  });

  it("preserves the exact transition graph", () => {
    expect(PRODUCTION_PHASE_TRANSITION_GRAPH.legalStayEdges).toHaveLength(3);
    expect(PRODUCTION_PHASE_TRANSITION_GRAPH.legalAdjacentAdvancementEdges)
      .toEqual(["phase_1->phase_2", "phase_2->phase_3"]);
    expect(PRODUCTION_PHASE_TRANSITION_GRAPH.automaticCycleReset).toBe(false);
  });

  it("rejects an unsupported kernel contract without accepting a future version", () => {
    const input = structuredClone(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15)));
    (input.contractReference as { contractVersion: string }).contractVersion = "2.0.0";
    const result = evaluatePhaseContinuity(input as never);
    expect(result.status).toBe("unsupported_phase_continuity_contract");
    expect(result.firstFailingStage).toBe("15.0_contract_and_input_truth");
  });

  it("returns an immutable, unapplied decision contract", () => {
    const input = adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15));
    const result = evaluatePhaseContinuity(input);
    expect(validateProductionPhaseContinuityContractAndInput(input)).toEqual([]);
    expect(validateProductionPhaseContinuityResult(result)).toEqual([]);
    expect(result.decisionAuthorized).toBe(true);
    expect(result.proposedStateRevisionCandidate).not.toBeNull();
    expect(result.stateMutationApplied).toBe(false);
    expect(result.applicationOwnerRequired).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });
});
