import { describe, expect, it } from "vitest";
import {
  evaluatePhaseContinuity,
  validatePhaseContinuityDecisionRevisionLedger,
  validatePhaseStateRevisionLedger,
  type ProductionPhaseContinuityInput,
} from "../../src/phaseContinuity";
import { buildPhaseContinuityControlledInput } from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";

type DeepMutable<T> = T extends readonly (infer U)[] ? DeepMutable<U>[] :
  T extends object ? { -readonly [K in keyof T]: DeepMutable<T[K]> } : T;

describe("production Phase Continuity identities and revisions", () => {
  it("keeps cycle, state, and decision identity stable across repeated evaluation", () => {
    const input = adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15));
    const first = evaluatePhaseContinuity(input);
    const second = evaluatePhaseContinuity(input);
    expect(second.decisionId).toBe(first.decisionId);
    expect(second.decisionRevisionId).toBe(first.decisionRevisionId);
    expect(validatePhaseStateRevisionLedger(input.phaseStateRevisionLedger)).toEqual([]);
    expect(validatePhaseContinuityDecisionRevisionLedger(first.decisionRevisionLedger)).toEqual([]);
  });

  it("rejects two final state revisions", () => {
    const input = structuredClone(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15))) as
      DeepMutable<ProductionPhaseContinuityInput>;
    input.phaseStateRevisionLedger.revisions.push({ ...input.phaseStateRevisionLedger.revisions[0],
      phaseStateRevisionId: "mutation:second-final" });
    expect(validatePhaseStateRevisionLedger(input.phaseStateRevisionLedger))
      .toContain("EXACTLY_ONE_FINAL_PHASE_STATE_REVISION_REQUIRED");
  });

  it("returns a candidate revision but does not rewrite historical state", () => {
    const input = adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15));
    const before = JSON.stringify(input.phaseStateRevisionLedger);
    const result = evaluatePhaseContinuity(input);
    expect(JSON.stringify(input.phaseStateRevisionLedger)).toBe(before);
    expect(result.proposedStateRevisionCandidate?.basedOnRevisionId)
      .toBe(input.currentPhaseStateRevision.phaseStateRevisionId);
    expect(result.stateMutationApplied).toBe(false);
  });
});
