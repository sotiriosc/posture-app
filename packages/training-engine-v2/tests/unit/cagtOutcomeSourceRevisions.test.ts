import { describe, expect, it } from "vitest";
import {
  OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT,
  deriveOutcomeSourceImmutableContentFingerprint,
  deriveOutcomeSourceRecordRevisionId,
  evaluateOutcomeSourceIdempotency,
  outcomeSourcesAreDuplicates,
  selectActiveOutcomeSourceRevision,
  type NormalizedOutcomeSourceRecord,
} from "../../src/outcomeSources/designContracts";
import { buildBaselineOutcomeSourceFixture } from "../helpers/outcomeSourceDesignLab";

describe("outcome source idempotency and immutable revisions", () => {
  it("returns the prior idempotency result on exact retry and conflicts on payload change", () => {
    const prior = { idempotencyKey: "key", sourceNativeIdentity: "native", normalizedSemanticIdentity: "semantic",
      payloadChecksum: "one", priorIngestionResult: "result-1", retryCount: 0,
      firstSeenTime: "2026-08-14T15:00:00.000Z", lastSeenTime: "2026-08-14T15:00:00.000Z" };
    expect(evaluateOutcomeSourceIdempotency({ ...prior, retryCount: 1 }, prior)).toEqual({
      state: "exact_retry", ingestionResult: "result-1", createsRevision: false, reasonCode: null,
    });
    expect(evaluateOutcomeSourceIdempotency({ ...prior, payloadChecksum: "two" }, prior)).toMatchObject({
      state: "conflict", createsRevision: false, reasonCode: "OUTCOME_SOURCE_IDEMPOTENCY_PAYLOAD_CONFLICT",
    });
  });

  it("does not deduplicate distinct identical-valued source events", () => {
    const left = buildBaselineOutcomeSourceFixture();
    const right = buildBaselineOutcomeSourceFixture({ sourceNativeRecordId: "native-2",
      sourceExposureEventId: "source-exposure-2" });
    expect(outcomeSourcesAreDuplicates(left.envelope, left.envelope)).toBe(true);
    expect(outcomeSourcesAreDuplicates(left.envelope, right.envelope)).toBe(false);
  });

  it("rejects equal-authority conflicting active revisions instead of selecting by array order", () => {
    const fixture = buildBaselineOutcomeSourceFixture();
    const base = fixture.record;
    const semantic = { ...base, basedOnRevisionId: base.sourceRecordRevisionId,
      structuredFacts: [{ ...base.structuredFacts[0], value: [9, 9, 9] }],
      correctionReason: "conflicting_correction", changedStructuredPaths: ["structuredFacts.0.value"],
      correctionOwner: "athlete", correctionTime: base.ingestionTime,
      sourceRecordRevisionId: undefined, provenance: undefined };
    delete (semantic as { sourceRecordRevisionId?: unknown }).sourceRecordRevisionId;
    delete (semantic as { provenance?: unknown }).provenance;
    const conflict = { ...semantic, sourceRecordRevisionId: deriveOutcomeSourceRecordRevisionId(semantic),
      provenance: ["test:conflicting-active"] } as NormalizedOutcomeSourceRecord;
    const ledger = { sourceRecordId: base.sourceRecordId,
      revisions: [{ sourceRecordId: base.sourceRecordId, revision: base,
        immutableContentFingerprint: deriveOutcomeSourceImmutableContentFingerprint(base) },
      { sourceRecordId: base.sourceRecordId, revision: conflict,
        immutableContentFingerprint: deriveOutcomeSourceImmutableContentFingerprint(conflict) }],
      activeFinalRevisionId: null, provenance: ["test:conflict-ledger"] };
    const forward = selectActiveOutcomeSourceRevision(ledger, "2026-08-14T16:00:00.000Z");
    const reverse = selectActiveOutcomeSourceRevision({ ...ledger, revisions: [...ledger.revisions].reverse() },
      "2026-08-14T16:00:00.000Z");
    expect(forward.active).toBeNull();
    expect(forward.reasonCodes).toContain(OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT);
    expect(reverse).toEqual(forward);
  });
});
