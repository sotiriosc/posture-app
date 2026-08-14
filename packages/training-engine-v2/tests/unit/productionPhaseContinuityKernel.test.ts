import { describe, expect, it } from "vitest";
import { evaluatePhaseContinuity, type ProductionPhaseContinuityInput } from "../../src/phaseContinuity";
import { buildPhaseContinuityControlledInput } from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";

type DeepMutable<T> = T extends readonly (infer U)[] ? DeepMutable<U>[] :
  T extends object ? { -readonly [K in keyof T]: DeepMutable<T[K]> } : T;
const mutable = (value: ProductionPhaseContinuityInput): DeepMutable<ProductionPhaseContinuityInput> =>
  structuredClone(value) as DeepMutable<ProductionPhaseContinuityInput>;

describe("production Phase Continuity kernel", () => {
  it.each([
    [15, "advance_to_next_phase_authorized"],
    [33, "advance_to_next_phase_authorized"],
    [0, "remain_current_phase"],
    [49, "phase_cycle_completion_owner_review_required"],
    [59, "phase_regression_review_required"],
  ] as const)("evaluates controlled case %s as %s", (index, status) => {
    expect(evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index))).status)
      .toBe(status);
  });

  it("keeps calendar and week observations non-authoritative", () => {
    const week1 = adaptGate15InputToProduction(buildPhaseContinuityControlledInput(16));
    const week12 = mutable(week1);
    week12.currentPhaseStateRevision.weekInPhaseObservation = 12;
    week12.phaseStateRevisionLedger.revisions[0].weekInPhaseObservation = 12;
    week12.evaluationTime = "2027-08-14T12:00:00-04:00";
    week12.transitionProposal.evaluationTime = week12.evaluationTime;
    if (week12.evidenceSnapshot) {
      week12.evidenceSnapshot.evaluationTime = week12.evaluationTime;
      for (const record of week12.criterionEvidenceRecords) record.appliesThrough = week12.evaluationTime;
    }
    expect(evaluatePhaseContinuity(week1).status).toBe("hold_current_phase_pending_evidence");
    expect(evaluatePhaseContinuity(week12).status).not.toBe("advance_to_next_phase_authorized");
  });

  it("rejects non-adjacent advancement and never creates Phase 4", () => {
    const base = buildPhaseContinuityControlledInput(15);
    const source = Object.freeze({ ...base,
      transitionProposal: Object.freeze({ ...base.transitionProposal, proposedTargetPhaseId: "phase_3" as const }),
      proposedProgramSnapshot: buildPhaseContinuityControlledInput(33).proposedProgramSnapshot });
    const result = evaluatePhaseContinuity(adaptGate15InputToProduction(source));
    expect(result.status).toBe("transition_not_authorized");
    expect(result.decisionAuthorized).toBe(false);
  });

  it("defers automatic progression, replacement, rotation, and deload", () => {
    for (const index of [44, 52, 53, 60]) {
      const result = evaluatePhaseContinuity(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index)));
      expect(result.decisionAuthorized).toBe(false);
      expect(result.automaticProgressionCount + result.automaticReplacementCount +
        result.automaticRotationCount + result.automaticDeloadCount).toBe(0);
    }
  });
});
