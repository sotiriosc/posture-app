import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationDownstreamValidation } from "./contracts";

export function createProductionAdaptationDownstreamValidation(input: Omit<
  ProductionAdaptationApplicationDownstreamValidation, "validationFingerprint" | "reasonCodes"
> & { readonly reasonCodes: readonly string[] }): ProductionAdaptationApplicationDownstreamValidation {
  const semantic = Object.freeze({ ...input, reasonCodes: Object.freeze(uniqueSorted(input.reasonCodes)) });
  return Object.freeze({ ...semantic,
    validationFingerprint: stableId("adaptation-application-downstream-validation", semantic) });
}

export function noChangeDownstreamValidation(): ProductionAdaptationApplicationDownstreamValidation {
  return createProductionAdaptationDownstreamValidation({ status: "not_required", gate13Status: "not_required",
    prescriptionValid: null, sequencingValid: null, weekValid: null, phaseSnapshotValid: null,
    reasonCodes: Object.freeze(["NO_CHANGE_REQUIRES_NO_DOWNSTREAM_REBUILD"]) });
}
