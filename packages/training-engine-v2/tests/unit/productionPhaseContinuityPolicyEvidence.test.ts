import { describe, expect, it } from "vitest";
import {
  PHASE_CONTINUITY_POLICY_V1_REFERENCE,
  PRODUCTION_PHASE_1_TO_2_CRITERIA,
  PRODUCTION_PHASE_2_TO_3_CRITERIA,
  PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
  evaluatePhaseContinuity,
  type ProductionPhaseContinuityInput,
  type ProductionPhaseContinuityPolicy,
} from "../../src/phaseContinuity";
import { buildPhaseContinuityControlledInput } from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";

type DeepMutable<T> = T extends readonly (infer U)[] ? DeepMutable<U>[] :
  T extends object ? { -readonly [K in keyof T]: DeepMutable<T[K]> } : T;

function input(index = 15): DeepMutable<ProductionPhaseContinuityInput> {
  return structuredClone(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index))) as
    DeepMutable<ProductionPhaseContinuityInput>;
}

describe("production Phase Continuity policy and evidence", () => {
  it("graduates the exact five criteria for each adjacent transition", () => {
    expect(PRODUCTION_PHASE_1_TO_2_CRITERIA.map((entry) => entry.criterionId)).toEqual([
      "p1-p2-repeatable-execution", "p1-p2-tolerated-exposure", "p1-p2-program-coherence",
      "p1-p2-no-unresolved-blocker", "p1-p2-evidence-sufficiency",
    ]);
    expect(PRODUCTION_PHASE_2_TO_3_CRITERIA).toHaveLength(5);
    expect([...PRODUCTION_PHASE_1_TO_2_CRITERIA, ...PRODUCTION_PHASE_2_TO_3_CRITERIA]
      .every((entry) => entry.reviewer === "phase_continuity_policy_owner" &&
        entry.reviewStatus === "owner_accepted")).toBe(true);
  });

  it("requires explicit policy injection", () => {
    const missing = input();
    missing.policy = null;
    expect(evaluatePhaseContinuity(missing).status).toBe("phase_continuity_policy_required");

    const unknown = input();
    unknown.policy = PHASE_CONTINUITY_POLICY_V1_REFERENCE;
    unknown.availablePolicies = [];
    expect(evaluatePhaseContinuity(unknown).status).toBe("phase_continuity_policy_unavailable");

    const conflict = input();
    conflict.policy = PHASE_CONTINUITY_POLICY_V1_REFERENCE;
    conflict.availablePolicies = structuredClone([PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
      { ...PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
        philosophy: ["CONFLICTING_EQUAL_AUTHORITY_POLICY"] }]) as
      DeepMutable<ProductionPhaseContinuityPolicy>[];
    expect(evaluatePhaseContinuity(conflict as never).status).toBe("phase_continuity_policy_conflict");
  });

  it("holds when required completed evidence is missing", () => {
    const result = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(16)));
    expect(result.status).toBe("hold_current_phase_pending_evidence");
    expect(result.decisionAuthorized).toBe(false);
  });

  it("rejects self-asserted repeated evidence with one source", () => {
    const mutated = input();
    const record = mutated.criterionEvidenceRecords.find((entry) =>
      entry.repeatedEvidenceState === "repeated_consistent_evidence");
    expect(record).toBeDefined();
    if (!record) return;
    record.sourceRecordRefs = [record.sourceRecordRefs[0]];
    record.distinctExposureIds = [record.distinctExposureIds[0]];
    record.distinctSessionIds = [record.distinctSessionIds[0]];
    const result = evaluatePhaseContinuity(mutated);
    expect(result.status).toBe("transition_not_authorized");
    expect(result.firstFailingStage).toBe("15.3_evidence_truth");
    expect(result.evidenceSufficiencyTrace).toContain("REPEATED_EVIDENCE_DISTINCT_SOURCE_BASIS_REQUIRED");
  });

  it("does not let planned program truth impersonate completed evidence", () => {
    const mutated = input();
    const record = mutated.criterionEvidenceRecords[0];
    record.sourceOwner = "planned_program_truth";
    const source = mutated.evidenceSnapshot?.sourceRecords.find((entry) =>
      record.sourceRecordRefs.includes(entry.sourceRecordId));
    if (source) source.owner = "planned_program_truth";
    const result = evaluatePhaseContinuity(mutated);
    expect(result.status).toBe("transition_not_authorized");
    expect(result.evidenceSufficiencyTrace).toContain("PLANNED_PROGRAM_TRUTH_USED_AS_COMPLETED_EVIDENCE");
  });

  it("maps conflict, blocker, and Safety authority distinctly", () => {
    expect(evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(24))).status)
      .toBe("transition_evidence_conflict");
    expect(evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(20))).status)
      .toBe("hold_current_phase_due_blocker");
    expect(evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(21))).status)
      .toBe("transition_blocked_by_training_safety");
  });
});
