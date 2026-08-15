import { uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionPrescriptionApplicationOwnerPort,
  ProductionAdaptationApplicationOwnerInvocation } from "./ownerPorts";

export const PRODUCTION_PRESCRIPTION_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_PRESCRIPTION_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

export type ProductionPrescriptionOwnerResolver = (
  invocation: ProductionAdaptationApplicationOwnerInvocation,
) => Promise<Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">> |
  Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">;

export function createProductionPrescriptionApplicationOwnerPort(
  resolver: ProductionPrescriptionOwnerResolver,
): ProductionPrescriptionApplicationOwnerPort {
  return Object.freeze({ owner: "prescription", contractReference: PRODUCTION_PRESCRIPTION_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(["progress_prescription_axis", "regress_prescription_axis",
      "prescription_modification_review"] as const),
    invoke: async (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const resolved = await resolver(invocation);
      const directive = invocation.input.directive;
      const reasons = [...resolved.reasonCodes];
      if ((directive.action === "progress_prescription_axis" || directive.action === "regress_prescription_axis") &&
          resolved.selectedAxis !== directive.selectedAxis) reasons.push("PRESCRIPTION_SELECTED_AXIS_NOT_PRESERVED");
      if (resolved.changedDimensions.some((dimension) =>
        !directive.implicatedPrescriptionDimensions.includes(dimension))) {
        reasons.push("PRESCRIPTION_APPLICATION_SCOPE_EXCEEDED");
      }
      const semantic = Object.freeze({ ...resolved, reasonCodes: Object.freeze(uniqueSorted(reasons)),
        ownerContract: PRODUCTION_PRESCRIPTION_APPLICATION_OWNER_CONTRACT_REFERENCE,
        owner: "prescription" as const, action: directive.action, targetId: directive.targetId,
        applicationApplied: false as const });
      return Object.freeze({ ...semantic,
        ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(semantic) });
    } });
}
