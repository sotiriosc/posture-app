import { describe, expect, it } from "vitest";
import {
  deriveProductionLongitudinalSourceRecordRevisionId,
  deriveProductionLongitudinalSourceSnapshotRevisionId,
  validateProductionLongitudinalOutcomeSourceSnapshot,
  type ProductionLongitudinalOutcomeSourceRecord,
} from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from
  "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal outcome sources", () => {
  const input = buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[0]);

  it("validates caller-supplied production records and stable revisions", () => {
    expect(validateProductionLongitudinalOutcomeSourceSnapshot(input.outcomeSourceSnapshot).reasonCodes).toEqual([]);
    const first = input.outcomeSourceSnapshot.sourceRecords[0];
    const reordered = { ...first, upstreamSourceRecordIds: [...first.upstreamSourceRecordIds].reverse(),
      reviewedAggregateSourceEventIds: [...first.reviewedAggregateSourceEventIds].reverse() };
    const { sourceRecordRevisionId: _id, provenance: _provenance, ...content } = reordered;
    void [_id, _provenance];
    expect(deriveProductionLongitudinalSourceRecordRevisionId(content)).toBe(first.sourceRecordRevisionId);
  });

  it("rejects test authority, broken lineage, and multiple active finals", () => {
    const draft = structuredClone(input.outcomeSourceSnapshot);
    (draft.sourceRecords[0] as { owner: string }).owner = "test_design_explicit_source";
    expect(validateProductionLongitudinalOutcomeSourceSnapshot(draft).reasonCodes).toContain("SOURCE_OWNER_INVALID");
    const original = input.outcomeSourceSnapshot.sourceRecords[0];
    const { sourceRecordRevisionId: _revision, provenance: _sourceProvenance, ...base } = original;
    void [_revision, _sourceProvenance];
    const duplicateContent = { ...base, basedOnRevisionId: "missing-revision" };
    const duplicate: ProductionLongitudinalOutcomeSourceRecord = Object.freeze({ ...duplicateContent,
      sourceRecordRevisionId: deriveProductionLongitudinalSourceRecordRevisionId(duplicateContent),
      provenance: Object.freeze(["test:broken-source-lineage"]) });
    const records = Object.freeze([...input.outcomeSourceSnapshot.sourceRecords, duplicate]);
    const activeIds = Object.freeze([...input.outcomeSourceSnapshot.activeSourceRecordRevisionIds,
      duplicate.sourceRecordRevisionId]);
    const content = { snapshotId: input.outcomeSourceSnapshot.snapshotId,
      basedOnRevisionId: input.outcomeSourceSnapshot.basedOnRevisionId, sourceRecords: records,
      activeSourceRecordRevisionIds: activeIds, evaluationTime: input.evaluationTime };
    const snapshot = Object.freeze({ ...input.outcomeSourceSnapshot, ...content,
      snapshotRevisionId: deriveProductionLongitudinalSourceSnapshotRevisionId(content) });
    expect(validateProductionLongitudinalOutcomeSourceSnapshot(snapshot).reasonCodes).toEqual(expect.arrayContaining([
      "EXACTLY_ONE_ACTIVE_FINAL_SOURCE_REVISION_REQUIRED", "SOURCE_REVISION_BASED_ON_LINEAGE_INVALID",
    ]));
  });
});
