import { describe, expect, it } from "vitest";
import {
  derivePostPrescriptionWeekValidationId,
  validatePostPrescriptionWeek,
  validatePostPrescriptionWeekValidationRevisionLedger,
} from "../../src";
import { buildProductionPostPrescriptionWeekBaseInput } from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week identity and revisions", () => {
  it("keeps validation identity stable across pre-execution revisions", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput();
    const reordered = { ...input, sessionBundles: [...input.sessionBundles].reverse() };
    expect(derivePostPrescriptionWeekValidationId(input)).toBe(derivePostPrescriptionWeekValidationId(reordered));
    expect(validatePostPrescriptionWeek(input).validationId).toBe(validatePostPrescriptionWeek(reordered).validationId);
  });

  it("appends an immutable revision with a new deterministic revision ID", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput();
    const initial = validatePostPrescriptionWeek(input);
    if (!initial.revisionLedger) throw new Error("INITIAL_VALIDATION_REVISION_REQUIRED");
    const initialSnapshot = structuredClone(initial.revisionLedger);
    const revised = validatePostPrescriptionWeek({
      ...input,
      evaluationTime: "2026-08-15T12:00:00Z",
      priorValidationRevisionContext: {
        ledger: initial.revisionLedger,
        reasonCode: "prescription_revision",
        changedFieldRefs: ["session:1:prescription-revision"],
      },
    });
    expect(revised.validationId).toBe(initial.validationId);
    expect(revised.validationRevisionId).not.toBe(initial.validationRevisionId);
    expect(initial.revisionLedger).toEqual(initialSnapshot);
    expect(revised.revisionLedger?.revisions).toHaveLength(2);
    expect(revised.revisionLedger?.finalRevisionId).toBe(revised.validationRevisionId);
    expect(validatePostPrescriptionWeekValidationRevisionLedger(revised.revisionLedger!)).toEqual([]);
  });

  it("rejects rewritten finalized historical revisions", () => {
    const initial = validatePostPrescriptionWeek(buildProductionPostPrescriptionWeekBaseInput());
    if (!initial.revisionLedger) throw new Error("INITIAL_VALIDATION_REVISION_REQUIRED");
    const reasons = validatePostPrescriptionWeekValidationRevisionLedger({
      ...initial.revisionLedger,
      finalizedHistoricalRevisionIds: [initial.revisionLedger.finalRevisionId],
      supersessions: [{
        supersededRevisionId: initial.revisionLedger.finalRevisionId,
        supersedingRevisionId: initial.revisionLedger.finalRevisionId,
        occurredAt: "2026-08-15T12:00:00Z",
        reasonCode: "coach_review",
      }],
    });
    expect(reasons).toContain("FINALIZED_HISTORICAL_VALIDATION_REVISION_IMMUTABLE");
  });
});
