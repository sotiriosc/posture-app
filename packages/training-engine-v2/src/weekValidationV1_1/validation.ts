import { PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  validatePostPrescriptionWeek } from "../weekValidation";
import { PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
  type ProductionPostPrescriptionWeekValidationInputV1_1,
  type ProductionPostPrescriptionWeekValidationResultV1_1 } from "./contracts";
import { evaluatePurposeContributionsV1_1 } from "./evaluator";

const BASE_PASS_STATUSES = new Set([
  "validated_supported_scope",
  "validated_with_unresolved_dose_sufficiency",
  "validated_with_execution_feasibility_pending",
]);

export function validatePostPrescriptionWeekV1_1(
  input: ProductionPostPrescriptionWeekValidationInputV1_1,
): ProductionPostPrescriptionWeekValidationResultV1_1 {
  const baseInput = input.baseValidationInput;
  const baseValidation = validatePostPrescriptionWeek(baseInput);
  let trace = evaluatePurposeContributionsV1_1(input.purposeContributionEvents);
  const lineageReasons: string[] = [];
  for (const event of input.purposeContributionEvents) {
    const sourceEvent = baseValidation.sourceExposureLedger.find((entry) =>
      entry.sourceExposureEventId === event.sourceExposureEventId);
    if (!sourceEvent) {
      lineageReasons.push(`PURPOSE_SOURCE_EVENT_LINEAGE_INVALID:${event.sourceExposureEventId}`);
      continue;
    }
    if (!sourceEvent.blockPurposeViews.some((block) => block.blockId === event.blockId)) {
      lineageReasons.push(`PURPOSE_BLOCK_LINEAGE_INVALID:${event.blockId}`);
    }
    for (const objective of event.objectiveViews) {
      if (!sourceEvent.weeklyObjectiveIds.includes(objective.objectiveId)) {
        lineageReasons.push(`PURPOSE_OBJECTIVE_LINEAGE_INVALID:${objective.objectiveId}`);
      }
    }
  }
  if (lineageReasons.length > 0) {
    trace = Object.freeze({
      ...trace,
      status: "invalid_purpose_contribution",
      reasonCodes: Object.freeze([...new Set([...trace.reasonCodes, ...lineageReasons])].sort()),
    });
  }
  const contractValid = input.validatorContract.contractId ===
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE.contractId &&
    input.validatorContract.contractVersion ===
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE.contractVersion &&
    baseInput.validatorContract.contractId === PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE.contractId &&
    baseInput.validatorContract.contractVersion ===
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE.contractVersion;
  if (!contractValid || !BASE_PASS_STATUSES.has(baseValidation.status) ||
      baseValidation.gate13Trace.some((gate) => gate.state === "FAIL_STOP")) {
    trace = Object.freeze({
      ...trace,
      status: "base_validation_not_passed",
      reasonCodes: Object.freeze([...trace.reasonCodes,
        !contractValid ? "VALIDATOR_VERSION_CHAIN_INVALID" : "BASE_VALIDATION_NOT_PASSED"].sort()),
    });
  }
  return Object.freeze({
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
    status: trace.status,
    baseValidation,
    purposeContributionTrace: trace,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
    productionActivationStatus: "NOT_ACTIVATED",
  });
}
