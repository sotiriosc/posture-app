import { uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveAdaptationApplicationOwnerResultFingerprint } from "./identities";
import type { ProductionAdaptationApplicationOwnerInvocation,
  ProductionCandidateComposerApplicationOwnerPort } from "./ownerPorts";

export const PRODUCTION_CANDIDATE_COMPOSER_APPLICATION_OWNER_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_CANDIDATE_COMPOSER_APPLICATION_OWNER_PORT", contractVersion: "1.0.0",
});

export type ProductionCandidateComposerOwnerResolver = (
  invocation: ProductionAdaptationApplicationOwnerInvocation,
) => Promise<Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">> |
  Omit<ProductionAdaptationApplicationOwnerResult, "owner" | "action" | "targetId" |
  "ownerContract" | "ownerResultFingerprint" | "applicationApplied">;

export function createProductionCandidateComposerApplicationOwnerPort(
  resolver: ProductionCandidateComposerOwnerResolver,
): ProductionCandidateComposerApplicationOwnerPort {
  return Object.freeze({ owner: "candidate_intelligence_and_composer",
    contractReference: PRODUCTION_CANDIDATE_COMPOSER_APPLICATION_OWNER_CONTRACT_REFERENCE,
    supportedActions: Object.freeze(["reopen_candidate_selection_for_replacement",
      "reopen_candidate_selection_for_bounded_rotation"] as const),
    invoke: async (invocation: ProductionAdaptationApplicationOwnerInvocation) => {
      const resolved = await resolver(invocation);
      const directive = invocation.input.directive;
      const reasons = [...resolved.reasonCodes];
      if (resolved.status === "candidate_selection_reopened_and_composed" && !resolved.candidateSelectionReopened) {
        reasons.push("CANDIDATE_SELECTION_REOPEN_NOT_REPRESENTED");
      }
      const semantic = Object.freeze({ ...resolved, reasonCodes: Object.freeze(uniqueSorted(reasons)),
        ownerContract: PRODUCTION_CANDIDATE_COMPOSER_APPLICATION_OWNER_CONTRACT_REFERENCE,
        owner: "candidate_intelligence_and_composer" as const, action: directive.action,
        targetId: directive.targetId, selectedAxis: null, applicationApplied: false as const });
      return Object.freeze({ ...semantic,
        ownerResultFingerprint: deriveAdaptationApplicationOwnerResultFingerprint(semantic) });
    } });
}
