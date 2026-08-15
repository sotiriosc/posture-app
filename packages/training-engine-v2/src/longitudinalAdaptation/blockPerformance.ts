import type { ExerciseDose } from "../prescription/dose";
import type {
  ExercisePerformanceRecord,
  ExercisePerformanceTimingObservation,
  ExerciseSubstitutionRecord,
  ExecutionQualityObservation,
} from "../prescription/performanceOutcome";
import { stableId, uniqueSorted } from "../prescription/compiler/utilities";

export const PRODUCTION_LONGITUDINAL_BLOCK_COMPLETION_STATUSES = Object.freeze([
  "completed_as_planned", "partially_completed", "omitted", "substituted", "additional_unplanned", "unknown",
] as const);
export type ProductionLongitudinalBlockCompletionStatus =
  typeof PRODUCTION_LONGITUDINAL_BLOCK_COMPLETION_STATUSES[number];

export interface ProductionLongitudinalPlannedBlockReference {
  readonly blockId: string;
  readonly purpose: "preparatory_acclimation" | "developmental_work" | "technique_quality_work" |
    "recovery_or_downregulation" | "unknown";
  readonly doseMode: ExerciseDose["mode"];
}

export interface ProductionPrescriptionBlockPerformanceResult {
  readonly blockResultId: string;
  readonly plannedBlockId: string | null;
  readonly performedBlockId: string;
  readonly sourceExposureEventId: string;
  readonly completionStatus: ProductionLongitudinalBlockCompletionStatus;
  readonly actualDose: ExerciseDose | null;
  readonly actualDoseSource: "independently_observed" | "not_observed" | "planned_copy_invalid";
  readonly actualTiming: ExercisePerformanceTimingObservation | null;
  readonly actualTimingSource: "independently_observed" | "not_observed" | "prescribed_copy_invalid";
  readonly qualityObservations: readonly ExecutionQualityObservation[];
  readonly substitution: ExerciseSubstitutionRecord | null;
  readonly provenance: readonly string[];
}

export interface ProductionExercisePerformanceBlockLinkage {
  readonly performanceRecordId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly plannedBlocks: readonly ProductionLongitudinalPlannedBlockReference[];
  readonly blockResults: readonly ProductionPrescriptionBlockPerformanceResult[];
  readonly omittedPlannedBlockIds: readonly string[];
  readonly additionalUnplannedBlockIds: readonly string[];
  readonly actualDoseAssumedFromPlan: false;
  readonly actualTimingAssumedFromPlan: false;
  readonly originalPlanImmutable: true;
  readonly authority: "block_level" | "legacy_one_block_projection" | "flattened_multi_block_invalid";
  readonly provenance: readonly string[];
}

export type ProductionLongitudinalEventCompletionState =
  | "completed_as_planned" | "completed_with_variation" | "partially_completed"
  | "substituted_and_completed" | "not_performed" | "outcome_unknown" | "invalid_block_linkage";

export interface ProductionLongitudinalBlockPerformanceValidation {
  readonly valid: boolean;
  readonly eventCompletionState: ProductionLongitudinalEventCompletionState;
  readonly orphanBlockResultCount: number;
  readonly plannedAsActualCount: number;
  readonly prescribedTimingAsActualCount: number;
  readonly multiBlockFlatteningCount: number;
  readonly reasonCodes: readonly string[];
}

export function deriveProductionBlockResultId(input: Pick<ProductionPrescriptionBlockPerformanceResult,
  "plannedBlockId" | "performedBlockId" | "sourceExposureEventId">): string {
  return stableId("production-block-performance", { plannedBlockId: input.plannedBlockId,
    performedBlockId: input.performedBlockId, sourceExposureEventId: input.sourceExposureEventId });
}

export function validateProductionExercisePerformanceBlockLinkage(
  linkage: ProductionExercisePerformanceBlockLinkage,
): ProductionLongitudinalBlockPerformanceValidation {
  const reasons: string[] = [];
  const planned = new Set(linkage.plannedBlocks.map((block) => block.blockId));
  const performed = new Set<string>();
  let orphanBlockResultCount = 0;
  let plannedAsActualCount = 0;
  let prescribedTimingAsActualCount = 0;
  for (const result of linkage.blockResults) {
    if (performed.has(result.performedBlockId)) reasons.push("DUPLICATE_PERFORMED_BLOCK_ID");
    performed.add(result.performedBlockId);
    if (result.sourceExposureEventId !== linkage.sourceExposureEventId) reasons.push("BLOCK_SOURCE_EVENT_MISMATCH");
    if (result.plannedBlockId !== null && !planned.has(result.plannedBlockId)) orphanBlockResultCount += 1;
    if (result.actualDoseSource === "planned_copy_invalid") plannedAsActualCount += 1;
    if (result.actualTimingSource === "prescribed_copy_invalid" ||
        result.actualTiming?.prescribedTempoAssumedActual !== false ||
        result.actualTiming?.prescribedDurationAssumedActual !== false) prescribedTimingAsActualCount += 1;
    if (result.blockResultId !== deriveProductionBlockResultId(result)) reasons.push("BLOCK_RESULT_ID_INVALID");
    if (result.actualDose && result.plannedBlockId) {
      const plannedBlock = linkage.plannedBlocks.find((block) => block.blockId === result.plannedBlockId);
      if (plannedBlock && result.actualDose.mode !== plannedBlock.doseMode) reasons.push("BLOCK_ACTUAL_DOSE_MODE_INVALID");
    }
  }
  const omitted = new Set(linkage.omittedPlannedBlockIds);
  if ([...omitted].some((id) => !planned.has(id))) reasons.push("OMITTED_BLOCK_NOT_PLANNED");
  const represented = new Set(linkage.blockResults.map((result) => result.plannedBlockId).filter((id): id is string => id !== null));
  if ([...planned].some((id) => !represented.has(id) && !omitted.has(id))) reasons.push("PLANNED_BLOCK_OUTCOME_MISSING");
  const additional = linkage.blockResults.filter((result) => result.completionStatus === "additional_unplanned")
    .map((result) => result.performedBlockId).sort();
  if (JSON.stringify(additional) !== JSON.stringify([...linkage.additionalUnplannedBlockIds].sort())) {
    reasons.push("ADDITIONAL_BLOCK_LINEAGE_INVALID");
  }
  if (linkage.actualDoseAssumedFromPlan !== false) plannedAsActualCount += 1;
  if (linkage.actualTimingAssumedFromPlan !== false) prescribedTimingAsActualCount += 1;
  const multiBlockFlatteningCount = linkage.plannedBlocks.length > 1 && linkage.authority !== "block_level" ? 1 : 0;
  if (linkage.authority === "legacy_one_block_projection" && linkage.plannedBlocks.length !== 1) {
    reasons.push("LONGITUDINAL_BLOCK_PERFORMANCE_REQUIRED");
  }
  if (multiBlockFlatteningCount) reasons.push("MULTI_BLOCK_PERFORMANCE_FLATTENING_PROHIBITED");
  if (orphanBlockResultCount) reasons.push("ORPHAN_BLOCK_PERFORMANCE_RESULT");
  if (plannedAsActualCount) reasons.push("PLANNED_DOSE_USED_AS_ACTUAL");
  if (prescribedTimingAsActualCount) reasons.push("PRESCRIBED_TIMING_USED_AS_ACTUAL");
  if (!linkage.originalPlanImmutable) reasons.push("ORIGINAL_PLAN_IMMUTABILITY_REQUIRED");

  const resultStatuses = linkage.blockResults.map((result) => result.completionStatus);
  const developmentalIds = new Set(linkage.plannedBlocks.filter((block) => block.purpose === "developmental_work")
    .map((block) => block.blockId));
  const developmentalOmitted = [...developmentalIds].some((id) => omitted.has(id));
  let eventCompletionState: ProductionLongitudinalEventCompletionState = "outcome_unknown";
  if (reasons.length) eventCompletionState = "invalid_block_linkage";
  else if (!linkage.blockResults.length || resultStatuses.every((status) => status === "unknown")) {
    eventCompletionState = "outcome_unknown";
  } else if (resultStatuses.every((status) => status === "omitted")) eventCompletionState = "not_performed";
  else if (resultStatuses.some((status) => status === "partially_completed") || developmentalOmitted) {
    eventCompletionState = "partially_completed";
  } else if (resultStatuses.some((status) => status === "substituted")) {
    eventCompletionState = "substituted_and_completed";
  } else if (linkage.omittedPlannedBlockIds.length || linkage.additionalUnplannedBlockIds.length) {
    eventCompletionState = "completed_with_variation";
  } else if (resultStatuses.every((status) => status === "completed_as_planned")) {
    eventCompletionState = "completed_as_planned";
  } else eventCompletionState = "completed_with_variation";
  return Object.freeze({ valid: reasons.length === 0, eventCompletionState, orphanBlockResultCount,
    plannedAsActualCount, prescribedTimingAsActualCount, multiBlockFlatteningCount,
    reasonCodes: Object.freeze(uniqueSorted(reasons)) });
}

export type ProductionLegacyPerformanceProjectionResult =
  | { readonly status: "projected"; readonly linkage: ProductionExercisePerformanceBlockLinkage }
  | { readonly status: "rejected"; readonly linkage: null; readonly reasonCode: string };

export function projectLegacyOneBlockPerformance(input: {
  readonly performance: ExercisePerformanceRecord;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly plannedBlocks: readonly ProductionLongitudinalPlannedBlockReference[];
}): ProductionLegacyPerformanceProjectionResult {
  if (input.plannedBlocks.length !== 1) return Object.freeze({ status: "rejected", linkage: null,
    reasonCode: "LONGITUDINAL_BLOCK_PERFORMANCE_REQUIRED" });
  const block = input.plannedBlocks[0];
  const statuses: Readonly<Record<ExercisePerformanceRecord["completionStatus"],
  ProductionLongitudinalBlockCompletionStatus>> = {
    completed_as_planned: "completed_as_planned", partially_completed: "partially_completed",
    target_not_met: "partially_completed", not_performed: "omitted", substituted: "substituted", unknown: "unknown",
  };
  if (input.performance.actualDose && input.performance.actualDose.mode !== block.doseMode) {
    return Object.freeze({ status: "rejected", linkage: null, reasonCode: "LEGACY_ACTUAL_DOSE_MODE_INVALID" });
  }
  const performedBlockId = `legacy:${block.blockId}`;
  const blockResult: ProductionPrescriptionBlockPerformanceResult = Object.freeze({
    blockResultId: deriveProductionBlockResultId({ plannedBlockId: block.blockId, performedBlockId,
      sourceExposureEventId: input.sourceExposureEventId }), plannedBlockId: block.blockId, performedBlockId,
    sourceExposureEventId: input.sourceExposureEventId, completionStatus: statuses[input.performance.completionStatus],
    actualDose: input.performance.actualDose ?? null,
    actualDoseSource: input.performance.actualDose ? "independently_observed" : "not_observed",
    actualTiming: input.performance.actualTiming ?? null,
    actualTimingSource: input.performance.actualTiming ? "independently_observed" : "not_observed",
    qualityObservations: input.performance.qualityObservations,
    substitution: input.performance.substitutions[0] ?? null,
    provenance: Object.freeze(["compatibility:ExercisePerformanceRecord:truthful-one-block-projection"]),
  });
  return Object.freeze({ status: "projected", linkage: Object.freeze({
    performanceRecordId: input.performance.performanceRecordId, prescriptionId: input.performance.prescriptionId,
    prescriptionRevisionId: input.prescriptionRevisionId, sourceExposureEventId: input.sourceExposureEventId,
    plannedBlocks: Object.freeze([...input.plannedBlocks]), blockResults: Object.freeze([blockResult]),
    omittedPlannedBlockIds: Object.freeze(input.performance.completionStatus === "not_performed" ? [block.blockId] : []),
    additionalUnplannedBlockIds: Object.freeze([]), actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false, originalPlanImmutable: true,
    authority: "legacy_one_block_projection",
    provenance: Object.freeze(["compatibility:ExercisePerformanceRecord:one-block-only"]),
  }) });
}
