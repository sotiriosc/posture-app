import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionAdaptationApplicationOwnerInvocation,
  ProductionPhaseContinuityApplicationOwnerPort } from "./ownerPorts";

export const PRODUCTION_PHASE_CONTINUITY_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_PHASE_CONTINUITY_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

export function createProductionPhaseContinuityApplicationOwnerPort(resolver: (
  invocation: ProductionAdaptationApplicationOwnerInvocation,
) => Promise<Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">> |
  Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">,
): ProductionPhaseContinuityApplicationOwnerPort {
  return Object.freeze({ owner: "phase_continuity",
    contractReference: PRODUCTION_PHASE_CONTINUITY_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(["phase_review"] as const),
    invoke: async (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const resolved = await resolver(invocation);
      const semantic = Object.freeze({ ...resolved,
        ownerContract: PRODUCTION_PHASE_CONTINUITY_APPLICATION_OWNER_CONTRACT_REFERENCE,
        owner: "phase_continuity" as const, action: invocation.input.directive.action,
        targetId: invocation.input.directive.targetId, selectedAxis: null, phaseReviewClaimed: true,
        applicationApplied: false as const });
      return Object.freeze({ ...semantic,
        ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(semantic) });
    } });
}
