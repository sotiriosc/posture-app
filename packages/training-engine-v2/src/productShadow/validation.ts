import { explicitIsoTime, sameSemanticValue, uniqueSorted } from "../prescription/compiler/utilities";
import { CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE, CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES,
  CONTROLLED_PRODUCT_SHADOW_RUN_TYPES, type ControlledProductShadowRunRevision } from "./contracts";
import { deriveControlledProductShadowRunRevisionId } from "./identities";

export function validateControlledProductShadowRunRevision(
  revision: ControlledProductShadowRunRevision,
): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(revision.shadowContract, CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE)) {
    reasons.push("UNSUPPORTED_CONTROLLED_PRODUCT_SHADOW_RUN_CONTRACT");
  }
  if (!CONTROLLED_PRODUCT_SHADOW_RUN_TYPES.includes(revision.runType)) reasons.push("INVALID_SHADOW_RUN_TYPE");
  if (!CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES.includes(revision.status)) reasons.push("INVALID_SHADOW_RUN_STATUS");
  if (!revision.runId || !revision.athleteId || !revision.productSnapshotRevisionId || !revision.triggerRevisionId) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_RUN_LINEAGE_REQUIRED");
  }
  if (!explicitIsoTime(revision.evaluationTime)) reasons.push("CONTROLLED_PRODUCT_SHADOW_EVALUATION_TIME_INVALID");
  if (revision.runRevisionId === revision.basedOnRunRevisionId) reasons.push("SHADOW_RUN_REVISION_SELF_REFERENCE");
  if (revision.productMutationApplied || revision.applicationApplied || revision.deliveredToUser || revision.performed) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_APPLIED_OR_DELIVERED_STATE_REJECTED");
  }
  const { runRevisionId: _revision, provenance: _provenance, ...semantic } = revision;
  void [_revision, _provenance];
  if (revision.runRevisionId !== deriveControlledProductShadowRunRevisionId(semantic)) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_RUN_REVISION_ID_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}
