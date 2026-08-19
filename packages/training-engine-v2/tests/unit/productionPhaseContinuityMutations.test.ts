import { describe, expect, it } from "vitest";
import {
  evaluatePhaseContinuity,
  validateProductionPhaseContinuityContractAndInput,
  type ProductionPhaseContinuityInput,
} from "../../src/phaseContinuity";
import {
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
} from "../cagt/phaseContinuityCohorts";
import {
  buildPhaseContinuityControlledInput,
  buildPhaseContinuityHoldoutInput,
} from "../helpers/phaseContinuityDesignLab";
import { adaptGate15InputToProduction } from "../helpers/productionPhaseContinuityAdapter";
import { runProductionPhaseContinuityGoldenEquivalence } from "../helpers/productionPhaseContinuityLab";

type DeepMutable<T> = T extends readonly (infer U)[] ? DeepMutable<U>[] :
  T extends object ? { -readonly [K in keyof T]: DeepMutable<T[K]> } : T;
const base = () => structuredClone(adaptGate15InputToProduction(buildPhaseContinuityControlledInput(15))) as
  DeepMutable<ProductionPhaseContinuityInput>;

function semantic(result: ReturnType<typeof evaluatePhaseContinuity>) {
  return JSON.stringify({ status: result.status, detailed: [...result.detailedClassifications].sort(),
    criteria: result.criterionEvaluations.map((entry) => [entry.criterionId, entry.state]),
    metrics: result.metrics, automatic: [result.automaticProgressionCount, result.automaticReplacementCount,
      result.automaticRotationCount, result.automaticDeloadCount] });
}

describe("production Phase Continuity mutations and metamorphic behavior", () => {
  it("runs every admitted semantic mutation through the production kernel", () => {
    const golden = runProductionPhaseContinuityGoldenEquivalence();
    const mutationRows = golden.rows.filter((entry) => entry.caseId.startsWith("controlled:"));
    expect(mutationRows).toHaveLength(85);
    expect(mutationRows.filter((entry) => entry.unexplainedDifference)).toEqual([]);
    expect(mutationRows.filter((entry) => entry.stateMutationApplied)).toEqual([]);
  });

  it("rejects arbitrary dimensions and prose-derived owners as contract truth", () => {
    const dimension = base();
    dimension.transitionProposal.changedFacts[0].dimension = "reason-text-guessed-dimension" as never;
    expect(validateProductionPhaseContinuityContractAndInput(dimension))
      .toContain("PHASE_TRANSITION_CHANGED_FACT_INVALID");
    const owner = base();
    owner.transitionProposal.changedFacts[0].owner = "because the prose says phase" as never;
    expect(validateProductionPhaseContinuityContractAndInput(owner))
      .toContain("PHASE_TRANSITION_CHANGED_FACT_INVALID");
  });

  it("rejects unavailable and unknown source records", () => {
    const unavailable = base();
    unavailable.criterionEvidenceRecords[0].sourceRecordRefs = ["missing-source-record"];
    expect(evaluatePhaseContinuity(unavailable).firstFailingStage).toBe("15.3_evidence_truth");
    const unknown = base();
    unknown.criterionEvidenceRecords[0].sourceOwner = "unknown";
    expect(evaluatePhaseContinuity(unknown).status).toBe("transition_not_authorized");
  });

  it("rejects stale evidence and duplicated records pretending to repeat", () => {
    const stale = base();
    stale.criterionEvidenceRecords[0].appliesThrough = "2026-08-13T12:00:00-04:00";
    expect(evaluatePhaseContinuity(stale).firstFailingStage).toBe("15.3_evidence_truth");
    const duplicate = base();
    const record = duplicate.criterionEvidenceRecords.find((entry) =>
      entry.repeatedEvidenceState === "repeated_consistent_evidence");
    expect(record).toBeDefined();
    if (!record) return;
    record.sourceRecordRefs = [record.sourceRecordRefs[0], record.sourceRecordRefs[0]];
    record.distinctExposureIds = [record.distinctExposureIds[0], record.distinctExposureIds[0]];
    record.distinctSessionIds = [record.distinctSessionIds[0], record.distinctSessionIds[0]];
    expect(evaluatePhaseContinuity(duplicate).firstFailingStage).toBe("15.3_evidence_truth");
  });

  it("preserves no-downstream-rescue for 1,000 deterministic mutations", () => {
    const descriptor = PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST.pairs.find((entry) =>
      entry.category === "no_rescue_mutation");
    expect(descriptor).toBeDefined();
    if (!descriptor) return;
    const input = adaptGate15InputToProduction(buildPhaseContinuityHoldoutInput(descriptor));
    for (let index = 0; index < 1_000; index += 1) {
      const result = evaluatePhaseContinuity(input);
      expect(result.status).toBe("upstream_program_invalid");
      expect(result.noRescueTrace.downstreamRescueAccepted).toBe(false);
    }
  });

  it("is invariant to ordering, nonsemantic provenance, and week observation", () => {
    const canonical = base();
    const expected = semantic(evaluatePhaseContinuity(canonical));
    const variants = [
      (() => { const value = base(); value.criterionEvidenceRecords.reverse();
        if (value.evidenceSnapshot) value.evidenceSnapshot.criterionRecords.reverse(); return value; })(),
      (() => { const value = base(); value.currentProgramSnapshot.entities.reverse();
        value.proposedProgramSnapshot.entities.reverse(); return value; })(),
      (() => { const value = base(); value.transitionProposal.changedFacts.reverse(); return value; })(),
      (() => { const value = base(); value.currentPhaseStateRevision.weekInPhaseObservation = 99;
        value.phaseStateRevisionLedger.revisions[0].weekInPhaseObservation = 99; return value; })(),
      (() => { const value = base(); value.transitionProposal.provenance.reverse(); return value; })(),
    ];
    expect(variants.map((value) => semantic(evaluatePhaseContinuity(value))))
      .toEqual(Array.from({ length: variants.length }, () => expected));
  });

  it("responds materially to typed evidence, Safety, equipment, objective, and program revisions", () => {
    const cases = [16, 20, 21, 24, 29, 61, 62, 68, 79];
    const baseline = semantic(evaluatePhaseContinuity(base()));
    expect(cases.map((index) => semantic(evaluatePhaseContinuity(
      adaptGate15InputToProduction(buildPhaseContinuityControlledInput(index))))
    ).filter((value) => value !== baseline).length).toBe(cases.length);
  });
});
