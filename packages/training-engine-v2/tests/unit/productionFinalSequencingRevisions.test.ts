import { describe, expect, it } from "vitest";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  finalSequencingDeterministicToken,
  sequenceFinalSession,
  validateSequencingPlanRevisionLedger,
  type ProductionFinalSessionSequencingInput,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { prepareSequencingCase } from "../helpers/sessionSequencingDesignLab";
import { prepareProductionFinalSequencingInput } from "../helpers/productionFinalSequencingLab";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((candidate) =>
  prepareSequencingCase(candidate).prescription.status === "compiled" && candidate.skeleton.assignments.length >= 2
)!;

describe("production Final Session Sequencing revision identity", () => {
  it("preserves plan identity and creates immutable superseding revisions", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSession(base);
    expect(initial.status).toBe("sequenced_exact_optimal");
    const [left, right] = initial.plan!.steps;
    const revisedInput: ProductionFinalSessionSequencingInput = {
      ...base,
      evaluationTime: "2026-08-14T00:00:00-04:00",
      explicitTransitionFacts: [{
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: "revision:setup-duration",
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: base.executionAttemptId,
        factType: "setup_duration",
        sourceOwner: "coach_review",
        sourceRef: "revision:setup-duration",
        reviewState: "reviewed",
        target: { kind: "timing", value: { kind: "range", minimumSeconds: 10, maximumSeconds: 20 } },
        provenance: { source: "coach_review", sourceRef: "revision:setup-duration" },
      }],
      revisionContext: {
        ledger: initial.plan!.revisionLedger,
        reasonCode: "explicit_timing_fact_update",
        changedFieldRefs: ["explicitTransitionFacts:revision:setup-duration"],
      },
    };
    const revised = sequenceFinalSession(revisedInput);
    expect(revised.status).toBe("sequenced_exact_optimal");
    expect(revised.sequencePlanId).toBe(initial.sequencePlanId);
    expect(revised.sequenceRevisionId).not.toBe(initial.sequenceRevisionId);
    expect(revised.plan!.revisionLedger.revisions).toHaveLength(2);
    expect(revised.plan!.revisionLedger.supersessions).toEqual([{
      supersededRevisionId: initial.sequenceRevisionId,
      supersedingRevisionId: revised.sequenceRevisionId,
      occurredAt: revisedInput.evaluationTime,
      reasonCode: "explicit_timing_fact_update",
    }]);
    expect(revised.plan!.revisionLedger.revisions[0]).toEqual(initial.plan!.revisionLedger.revisions[0]);
    expect(validateSequencingPlanRevisionLedger(revised.plan!.revisionLedger)).toEqual([]);
  });

  it("rejects an attempt to supersede a completed Sequence revision", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSession(base);
    const completedLedger = {
      ...initial.plan!.revisionLedger,
      completedRevisionIds: [initial.sequenceRevisionId!],
    };
    const result = sequenceFinalSession({
      ...base,
      evaluationTime: "2026-08-14T00:01:00-04:00",
      revisionContext: {
        ledger: completedLedger,
        reasonCode: "coach_review",
        changedFieldRefs: ["coach_review"],
      },
    });
    expect(result.status).toBe("invalid_sequence_revision_context");
    expect(result.decisionTrace.finalReasonCodes).toContain("COMPLETED_SEQUENCE_REVISION_IMMUTABLE");
  });

  it("detects mutation of immutable revision content", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSession(base);
    const revision = initial.plan!.revisionLedger.revisions[0];
    const mutatedLedger = {
      ...initial.plan!.revisionLedger,
      revisions: [{
        ...revision,
        changedFieldRefs: ["silently-mutated-history"],
      }],
    };
    expect(validateSequencingPlanRevisionLedger(mutatedLedger)).toContain(
      "SEQUENCE_REVISION_CONTENT_FINGERPRINT_MISMATCH",
    );
    const result = sequenceFinalSession({
      ...base,
      evaluationTime: "2026-08-14T00:02:00-04:00",
      revisionContext: {
        ledger: mutatedLedger,
        reasonCode: "coach_review",
        changedFieldRefs: ["coach_review"],
      },
    });
    expect(result.status).toBe("invalid_sequence_revision_context");
    expect(result.decisionTrace.finalReasonCodes).toContain(
      "SEQUENCE_REVISION_CONTENT_FINGERPRINT_MISMATCH",
    );
  });

  it("rejects a fingerprint-valid but nonlinear revision chain", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSession(base);
    const [left, right] = initial.plan!.steps;
    const revised = sequenceFinalSession({
      ...base,
      evaluationTime: "2026-08-14T00:03:00-04:00",
      explicitTransitionFacts: [{
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: "revision:linear-chain",
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: base.executionAttemptId,
        factType: "setup_duration",
        sourceOwner: "coach_review",
        sourceRef: "revision:linear-chain",
        reviewState: "reviewed",
        target: { kind: "timing", value: { kind: "exact", seconds: 15 } },
        provenance: { source: "coach_review", sourceRef: "revision:linear-chain" },
      }],
      revisionContext: {
        ledger: initial.plan!.revisionLedger,
        reasonCode: "explicit_timing_fact_update",
        changedFieldRefs: ["revision:linear-chain"],
      },
    });
    const latest = revised.plan!.revisionLedger.revisions[1];
    const { revisionContentFingerprint, ...content } = latest;
    expect(revisionContentFingerprint).toMatch(/^[0-9a-f]{32}$/);
    const nonlinearContent = { ...content, basedOnRevisionId: null };
    const nonlinearLedger = {
      ...revised.plan!.revisionLedger,
      revisions: [
        revised.plan!.revisionLedger.revisions[0],
        {
          ...nonlinearContent,
          revisionContentFingerprint: finalSequencingDeterministicToken(nonlinearContent),
        },
      ],
    };
    expect(validateSequencingPlanRevisionLedger(nonlinearLedger)).toContain(
      "SEQUENCE_REVISION_CHAIN_NOT_LINEAR",
    );
  });
});
