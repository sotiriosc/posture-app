import { uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionLongitudinalAdaptationResult } from "./contracts";
import { validateProductionLongitudinalDecisionRevisionLedger } from "./identities";

export function validateProductionLongitudinalAdaptationResult(
  result: ProductionLongitudinalAdaptationResult,
): readonly string[] {
  const reasons: string[] = [];
  reasons.push(...validateProductionLongitudinalDecisionRevisionLedger(result.decisionRevisionLedger));
  if (result.programMutationApplied || result.prescriptionMutationApplied || result.exerciseReplacementApplied ||
      result.rotationApplied || result.deloadApplied || result.weekReallocationApplied || result.phaseMutationApplied ||
      !result.applicationOwnerRequired) reasons.push("LONGITUDINAL_DECISION_APPLICATION_BOUNDARY_VIOLATED");
  const failureIndex = result.firstFailingSubgate ? result.subgateTrace.findIndex((entry) =>
    entry.subgate === result.firstFailingSubgate) : -1;
  if (failureIndex >= 0 && result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
    reasons.push("LONGITUDINAL_DOWNSTREAM_RESCUE_ACCEPTED");
  }
  if (result.actionDirective?.action.includes("replacement") &&
      result.actionDirective.implicatedPrescriptionDimensions.includes("unresolved_other")) {
    reasons.push("PRODUCTION_LONGITUDINAL_SELECTED_REPLACEMENT_IDENTITY");
  }
  return Object.freeze(uniqueSorted(reasons));
}
