import { describe, expect, it } from "vitest";
import { LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS } from "../cagt/longitudinalAdaptationCohorts";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { buildLongitudinalAdaptationInput } from "../helpers/longitudinalAdaptationPipeline";

function result(name: string) {
  const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name);
  if (!descriptor) throw new Error(`MISSING_CONTROLLED_CHAIN:${name}`);
  return runLongitudinalAdaptationGate16(buildLongitudinalAdaptationInput(descriptor));
}

describe("Gate 16 completed evidence truth", () => {
  it("keeps planned and actual dose/timing independent", () => {
    expect(result("planned_dose_as_actual")).toMatchObject({
      status: "longitudinal_outcome_ledger_invalid",
      firstFailingSubgate: "16.2_completed_outcome_ledger_integrity",
      selectedPrimaryAction: null,
    });
    expect(result("prescribed_tempo_as_actual").blockers)
      .toContain("PLANNED_PROGRAM_TRUTH_USED_AS_ACTUAL_OUTCOME");
  });

  it("rejects duplicate, copied, orphaned, stale, and wrong-context evidence", () => {
    expect(result("duplicate_source_event").blockers).toContain("DUPLICATE_COMPLETED_EXPOSURE_OUTCOME_ENTRY");
    expect(result("copied_record_as_repeated").firstFailingSubgate)
      .toBe("16.2_completed_outcome_ledger_integrity");
    expect(result("orphan_response").blockers).toContain("ORPHAN_RESPONSE_RECORD");
    expect(result("stale_evidence").blockers).toContain("FUTURE_OR_OUT_OF_WINDOW_EVIDENCE");
    expect(result("wrong_side_evidence").blockers).toContain("LONGITUDINAL_EVIDENCE_APPLICABILITY_MISMATCH");
    expect(result("wrong_support_context").status).toBe("longitudinal_evidence_invalid");
  });

  it("orders exact completed evidence into an explicit trajectory", () => {
    const value = result("repeated_success_appropriate_challenge");
    expect(value.completedLedgerIntegrity.reasonCodes).toEqual([]);
    expect(value.evidenceApplicability.every((entry) => entry.accepted &&
      entry.applicability === "EXACT_REALIZATION_EVIDENCE")).toBe(true);
    expect(value.trajectory.orderedOutcomeEntryIds).toHaveLength(1);
    expect(value.currentStateClassification).toBe("stable_appropriate_challenge");
  });

  it("does not let weaker identity history override current exact evidence", () => {
    const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) =>
      entry.scenarioId === "productive_current_prescription")!;
    const draft = structuredClone(buildLongitudinalAdaptationInput(descriptor));
    const exact = draft.outcomeSourceSnapshot.sourceRecords[0];
    (draft.outcomeSourceSnapshot.sourceRecords as unknown[]).push({ ...exact,
      sourceRecordId: "weaker-identity-adverse-history", sourceExposureEventId: null,
      realization: null, applicability: "EXERCISE_IDENTITY_HISTORY",
      signals: ["repeated_adverse_response", "replacement_consideration", "prescription_review_attempted"] });
    const value = runLongitudinalAdaptationGate16(draft);
    expect(value.evidenceApplicability.at(-1)).toMatchObject({
      applicability: "EXERCISE_IDENTITY_HISTORY", accepted: true,
    });
    expect(value.trajectory.currentStrongestApplicableEvidence).toBe("EXACT_REALIZATION_EVIDENCE");
    expect(value.selectedPrimaryAction).toBe("keep_current");
  });
});
