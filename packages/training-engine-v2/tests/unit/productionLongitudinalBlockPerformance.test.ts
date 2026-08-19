import { describe, expect, it } from "vitest";
import {
  projectLegacyOneBlockPerformance,
  validateProductionExercisePerformanceBlockLinkage,
} from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from
  "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal block Performance", () => {
  const input = buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[0]);
  const linkage = input.completedExposureLedger.entries[0].blockPerformance!;

  it("derives event completion from authoritative block truth", () => {
    expect(validateProductionExercisePerformanceBlockLinkage(linkage)).toMatchObject({
      valid: true, eventCompletionState: "completed_as_planned", orphanBlockResultCount: 0,
      plannedAsActualCount: 0, prescribedTimingAsActualCount: 0, multiBlockFlatteningCount: 0,
    });
    const flattened = Object.freeze({ ...linkage,
      plannedBlocks: Object.freeze([...linkage.plannedBlocks,
        Object.freeze({ ...linkage.plannedBlocks[0], blockId: "second-block" })]),
      authority: "legacy_one_block_projection" as const });
    expect(validateProductionExercisePerformanceBlockLinkage(flattened).reasonCodes).toEqual(expect.arrayContaining([
      "LONGITUDINAL_BLOCK_PERFORMANCE_REQUIRED", "MULTI_BLOCK_PERFORMANCE_FLATTENING_PROHIBITED",
    ]));
  });

  it("projects legacy Performance only for one-block plans", () => {
    const first = linkage.blockResults[0];
    const performance = Object.freeze({ performanceRecordId: linkage.performanceRecordId,
      prescriptionId: linkage.prescriptionId, exerciseId: input.target.exerciseId!, occurredAt: input.evaluationTime,
      completionStatus: "completed_as_planned" as const, actualDose: first.actualDose ?? undefined,
      actualTiming: first.actualTiming ?? undefined, qualityObservations: first.qualityObservations,
      unresolvedPainResponseEvidenceIds: Object.freeze([]), trainingResponseObservationIds: Object.freeze([]),
      recoveryEvidenceIds: Object.freeze([]), recoveryStatus: "recovered_as_expected" as const,
      substitutions: Object.freeze([]), notes: Object.freeze([]),
      provenance: Object.freeze({ source: "prescription_contract" as const, sourceRef: "test:legacy-performance" }) });
    expect(projectLegacyOneBlockPerformance({ performance, prescriptionRevisionId: linkage.prescriptionRevisionId,
      sourceExposureEventId: linkage.sourceExposureEventId, plannedBlocks: linkage.plannedBlocks }).status)
      .toBe("projected");
    expect(projectLegacyOneBlockPerformance({ performance, prescriptionRevisionId: linkage.prescriptionRevisionId,
      sourceExposureEventId: linkage.sourceExposureEventId,
      plannedBlocks: Object.freeze([...linkage.plannedBlocks,
        Object.freeze({ ...linkage.plannedBlocks[0], blockId: "second-block" })]) }))
      .toMatchObject({ status: "rejected", reasonCode: "LONGITUDINAL_BLOCK_PERFORMANCE_REQUIRED" });
  });
});
