import { describe, expect, it } from "vitest";
import {
  classifyProductionLongitudinalEvidenceApplicability,
  validateProductionCompletedExposureLedger,
  validateProductionLongitudinalEvidenceWindow,
  validateProductionRepeatedLongitudinalEvidence,
} from "../../src/longitudinalAdaptation";
import {
  LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS,
  LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS,
} from "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production completed ledger and evidence", () => {
  const input = buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[30]);

  it("reports observed counts instead of assumed zeros", () => {
    expect(validateProductionCompletedExposureLedger({ ledger: input.completedExposureLedger,
      outcomeSnapshot: input.outcomeSourceSnapshot, currentProgramSnapshot: input.currentProgramSnapshot }))
      .toMatchObject({ expectedPlannedEventCount: 1, observedOutcomeEventCount: 1, completedEventCount: 1,
        partialEventCount: 0, notPerformedEventCount: 0, substitutedEventCount: 0, unknownOutcomeCount: 0,
        duplicateOutcomeEntryCount: 0, missingOutcomeLinkCount: 0, orphanPerformanceRecordCount: 0,
        orphanResponseRecordCount: 0, orphanBlockResultCount: 0, wrongPrescriptionRevisionCount: 0,
        wrongSequenceRevisionCount: 0, plannedAsActualCount: 0, prescribedTimingAsActualCount: 0,
        multiBlockFlatteningCount: 0, reasonCodes: [] });
  });

  it("classifies exact, related, then identity history with explicit differences", () => {
    const record = input.outcomeSourceSnapshot.sourceRecords[0];
    expect(classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record }))
      .toMatchObject({ applicability: "EXACT_REALIZATION_EVIDENCE", differences: [], accepted: true });
    const related = structuredClone(record);
    (related.realization as { side: string }).side = "left";
    (related as { declaredApplicability: "RELATED_REALIZATION_EVIDENCE" }).declaredApplicability =
      "RELATED_REALIZATION_EVIDENCE";
    expect(classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record: related }))
      .toMatchObject({ applicability: "RELATED_REALIZATION_EVIDENCE", differences: ["side"], accepted: true });
    const identity = Object.freeze({ ...record, realization: null,
      declaredApplicability: "EXERCISE_IDENTITY_HISTORY" as const });
    expect(classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record: identity }))
      .toMatchObject({ applicability: "EXERCISE_IDENTITY_HISTORY", accepted: true });
  });

  it("rejects future windows and duplicated lineage as repetition", () => {
    const future = structuredClone(input.evidenceWindow);
    (future as { endsAt: string }).endsAt = "2027-01-01T00:00:00-05:00";
    expect(validateProductionLongitudinalEvidenceWindow({ window: future, ledger: input.completedExposureLedger,
      outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target }))
      .toContain("LONGITUDINAL_EVIDENCE_WINDOW_INVALID");
    expect(validateProductionRepeatedLongitudinalEvidence({ window: input.evidenceWindow,
      outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target, materialChangeClaimed: true }))
      .toContain("LONGITUDINAL_REPEATED_EVIDENCE_DISTINCT_SOURCE_EVENT_REQUIRED");
  });

  it("fails planned-as-actual and source-event duplication mutations", () => {
    for (const name of ["planned_dose_as_actual", "duplicate_source_event"]) {
      const descriptor = LONGITUDINAL_CONTROLLED_CHAIN_DESCRIPTORS.find((entry) => entry.scenarioId === name)!;
      const mutated = buildProductionLongitudinalAdaptationInput(descriptor);
      expect(validateProductionCompletedExposureLedger({ ledger: mutated.completedExposureLedger,
        outcomeSnapshot: mutated.outcomeSourceSnapshot, currentProgramSnapshot: mutated.currentProgramSnapshot })
        .reasonCodes.length).toBeGreaterThan(0);
    }
  });
});
