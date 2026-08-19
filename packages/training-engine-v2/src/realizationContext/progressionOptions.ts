import type { ProgressionAxis } from "../domain/progression";
import { PRODUCTION_LONGITUDINAL_LEGAL_AXES_BY_DOSE_MODE } from
  "../longitudinalAdaptation/policies/longitudinalAdaptationPolicyV1";
import {
  PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
  type EquipmentLoadRealizationResult,
  type ProgressionAxisRealizationOption,
  type ProgressionAxisRealizationOptions,
} from "./contracts";

export function buildProgressionAxisRealizationOptions(input: {
  readonly exerciseId: string;
  readonly doseMode: keyof typeof PRODUCTION_LONGITUDINAL_LEGAL_AXES_BY_DOSE_MODE;
  readonly equipment: EquipmentLoadRealizationResult;
  readonly blockedAxes: readonly ProgressionAxis[];
  readonly policyDependentAxes?: readonly ProgressionAxis[];
}): ProgressionAxisRealizationOptions {
  const legalAxes = PRODUCTION_LONGITUDINAL_LEGAL_AXES_BY_DOSE_MODE[input.doseMode];
  const policyDependent = new Set<ProgressionAxis>([
    "sets",
    ...(input.policyDependentAxes ?? []),
  ]);
  const blocked = new Set(input.blockedAxes);
  const options: ProgressionAxisRealizationOption[] = legalAxes.map((axis) => {
    if (blocked.has(axis)) return Object.freeze({ axis, state: "blocked" as const,
      nextExactLoad: null, reasonCodes: Object.freeze(["CALLER_REPORTED_AXIS_BLOCKED"]) });
    if (axis === "load") {
      if (input.equipment.nextExactLoad !== null) return Object.freeze({ axis,
        state: "currently_realizable" as const, nextExactLoad: input.equipment.nextExactLoad,
        reasonCodes: Object.freeze(["EXACT_NEXT_INCREMENT_AVAILABLE"]) });
      return Object.freeze({ axis, state: "equipment_dependent" as const, nextExactLoad: null,
        reasonCodes: Object.freeze(["EXACT_NEXT_INCREMENT_UNAVAILABLE"]) });
    }
    if (policyDependent.has(axis)) return Object.freeze({ axis,
      state: "policy_dependent" as const, nextExactLoad: null,
      reasonCodes: Object.freeze([axis === "sets" ?
        "WEEK_AND_LONGITUDINAL_SET_AUTHORITY_REQUIRED" : "EXPLICIT_FUTURE_POLICY_REQUIRED"]) });
    return Object.freeze({ axis, state: "currently_realizable" as const, nextExactLoad: null,
      reasonCodes: Object.freeze(["REALIZATION_CAN_SUPPORT_AXIS_NO_ACTION_AUTHORIZED"]) });
  });
  return Object.freeze({
    contractReference: PROGRESSION_AXIS_REALIZATION_OPTIONS_CONTRACT_REFERENCE,
    exerciseId: input.exerciseId,
    doseMode: input.doseMode,
    legalAxes,
    options: Object.freeze(options),
    selectedAxis: null,
    progressionAuthorized: false,
    numericActionApplied: false,
    longitudinalActionOwnerRequired: true,
  });
}
