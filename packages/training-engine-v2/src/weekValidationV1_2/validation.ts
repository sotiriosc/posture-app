import { validatePostPrescriptionWeekV1_1 } from "../weekValidationV1_1";
import { PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE,
  type ProductionPostPrescriptionWeekValidationInputV1_2,
  type ProductionPostPrescriptionWeekValidationResultV1_2 } from "./contracts";
import { evaluateRealizationContextEventsV1_2 } from "./evaluator";

const BASE_PASS = new Set([
  "validated_supported_purpose_scope",
]);

export function validatePostPrescriptionWeekV1_2(
  input: ProductionPostPrescriptionWeekValidationInputV1_2,
): ProductionPostPrescriptionWeekValidationResultV1_2 {
  const baseValidation = validatePostPrescriptionWeekV1_1(input.baseValidationInput);
  let trace = evaluateRealizationContextEventsV1_2(input.realizationContextEvents);
  const reasons: string[] = [...trace.reasonCodes];
  const contractValid = input.validatorContract.contractId ===
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE.contractId &&
    input.validatorContract.contractVersion ===
      PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE.contractVersion;
  for (const event of input.realizationContextEvents) {
    if (!baseValidation.baseValidation.sourceExposureLedger.some((entry) =>
      entry.sourceExposureEventId === event.sourceExposureEventId)) {
      reasons.push(`REALIZATION_SOURCE_EVENT_LINEAGE_INVALID:${event.sourceExposureEventId}`);
    }
  }
  if (!contractValid || !BASE_PASS.has(baseValidation.status)) {
    trace = Object.freeze({ ...trace, status: "base_validation_not_passed",
      reasonCodes: Object.freeze([...new Set([...reasons,
        !contractValid ? "VALIDATOR_V1_2_VERSION_CHAIN_INVALID" :
          "BASE_VALIDATION_NOT_PASSED"])].sort()) });
  } else if (reasons.length > trace.reasonCodes.length) {
    trace = Object.freeze({ ...trace, status: "invalid_context_realization",
      reasonCodes: Object.freeze([...new Set(reasons)].sort()) });
  }
  return Object.freeze({
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE,
    status: trace.status,
    baseValidation,
    realizationContextTrace: trace,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
    productionActivationStatus: "NOT_ACTIVATED",
  });
}
