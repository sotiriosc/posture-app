import { stableId } from "@praxis/training-engine-v2";
import { CONTROLLED_PRODUCT_SHADOW_CHANGED_CATEGORIES, CONTROLLED_PRODUCT_SHADOW_TRIGGER_KINDS,
  type ControlledProductShadowAppSurface, type ControlledProductShadowClientTrigger,
  type ControlledProductShadowTrigger } from "./contracts";

export function validateControlledProductShadowClientTrigger(
  trigger: ControlledProductShadowClientTrigger,
): readonly string[] {
  const reasons: string[] = [];
  const value = trigger as unknown as Record<string, unknown>;
  const contract = value.triggerContract && typeof value.triggerContract === "object" ?
    value.triggerContract as Record<string, unknown> : null;
  if (contract?.contractId !== "CONTROLLED_PRODUCT_SHADOW_TRIGGER" ||
      contract.contractVersion !== "1.0.0") reasons.push("UNSUPPORTED_CONTROLLED_PRODUCT_SHADOW_TRIGGER");
  if (typeof value.triggerKind !== "string" ||
      !CONTROLLED_PRODUCT_SHADOW_TRIGGER_KINDS.includes(value.triggerKind as never)) {
    reasons.push("INVALID_SHADOW_TRIGGER_KIND");
  }
  if (typeof value.productPatchSemanticFingerprint !== "string" || !value.productPatchSemanticFingerprint ||
      typeof value.clientOperationId !== "string" || !value.clientOperationId) {
    reasons.push("SHADOW_TRIGGER_IDENTITY_REQUIRED");
  }
  if (typeof value.clientObservedOperationalTime !== "string" ||
      !Number.isFinite(Date.parse(value.clientObservedOperationalTime))) reasons.push("SHADOW_TRIGGER_TIME_INVALID");
  const categories = Array.isArray(value.changedEntityCategories) ? value.changedEntityCategories : null;
  const changedIds = Array.isArray(value.changedEntityIds) ? value.changedEntityIds : null;
  const anchorLogIds = Array.isArray(value.anchorLogIds) ? value.anchorLogIds : null;
  if (!categories || categories.some((category) => typeof category !== "string" ||
      !CONTROLLED_PRODUCT_SHADOW_CHANGED_CATEGORIES.includes(category as never))) {
    reasons.push("SHADOW_TRIGGER_CATEGORY_INVALID");
  }
  if (!changedIds || changedIds.some((entry) => typeof entry !== "string") ||
      !anchorLogIds || anchorLogIds.some((entry) => typeof entry !== "string") ||
      (changedIds?.length ?? 101) > 100 || (anchorLogIds?.length ?? 51) > 50) {
    reasons.push("SHADOW_TRIGGER_TOO_LARGE");
  }
  if (!([null, "string"] as const).includes(value.anchorProgramId === null ? null :
      typeof value.anchorProgramId as "string") ||
      !([null, "string"] as const).includes(value.anchorSessionId === null ? null :
        typeof value.anchorSessionId as "string")) reasons.push("SHADOW_TRIGGER_ANCHOR_INVALID");
  if (value.appSurface !== "server_resolved") reasons.push("SHADOW_TRIGGER_APP_SURFACE_INVALID");
  if (!Array.isArray(value.provenance) || value.provenance.some((entry) => typeof entry !== "string")) {
    reasons.push("SHADOW_TRIGGER_PROVENANCE_INVALID");
  }
  const serialized = JSON.stringify(trigger);
  for (const forbidden of ["questionnaire", "assessment", "preferences", "painAreas", "programs", "sessions",
    "exerciseLogs", "notes", "email", "authToken", "expectedResult", "v2Input"]) {
    if (Object.prototype.hasOwnProperty.call(value, forbidden)) {
      reasons.push(`SHADOW_TRIGGER_FORBIDDEN_FIELD:${forbidden}`);
    }
  }
  const allowed = new Set(["triggerContract", "triggerKind", "appSurface", "productPatchSemanticFingerprint",
    "changedEntityCategories", "changedEntityIds", "anchorProgramId", "anchorSessionId", "anchorLogIds",
    "clientOperationId", "clientObservedOperationalTime", "provenance"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) reasons.push("SHADOW_TRIGGER_UNKNOWN_FIELD");
  if (serialized.length > 16_384) reasons.push("SHADOW_TRIGGER_BODY_LIMIT_EXCEEDED");
  return Object.freeze([...new Set(reasons)].sort());
}

export function createControlledProductShadowTrigger(input: {
  readonly clientTrigger: ControlledProductShadowClientTrigger;
  readonly athleteId: string;
  readonly appSurface: ControlledProductShadowAppSurface;
}): ControlledProductShadowTrigger {
  const identity = { appSurface: input.appSurface, athleteId: input.athleteId,
    triggerKind: input.clientTrigger.triggerKind,
    productPatchSemanticFingerprint: input.clientTrigger.productPatchSemanticFingerprint,
    anchorProgramId: input.clientTrigger.anchorProgramId, anchorSessionId: input.clientTrigger.anchorSessionId,
    anchorLogIds: [...input.clientTrigger.anchorLogIds].sort(), clientOperationId: input.clientTrigger.clientOperationId };
  const triggerId = stableId("controlled-product-shadow-trigger", identity);
  const revisionSemantic = { triggerId, changedEntityCategories:
    [...input.clientTrigger.changedEntityCategories].sort(), changedEntityIds: [...input.clientTrigger.changedEntityIds].sort(),
    clientObservedOperationalTime: input.clientTrigger.clientObservedOperationalTime };
  return Object.freeze({ ...input.clientTrigger, appSurface: input.appSurface, athleteId: input.athleteId,
    triggerId, triggerRevisionId: stableId("controlled-product-shadow-trigger-revision", revisionSemantic),
    idempotencyKey: stableId("controlled-product-shadow-trigger-idempotency", { athleteId: input.athleteId,
      appSurface: input.appSurface, clientOperationId: input.clientTrigger.clientOperationId }), changedEntityCategories:
      Object.freeze([...input.clientTrigger.changedEntityCategories].sort()),
    changedEntityIds: Object.freeze([...input.clientTrigger.changedEntityIds].sort()),
    anchorLogIds: Object.freeze([...input.clientTrigger.anchorLogIds].sort()) });
}

export function controlledProductShadowTriggerSemanticFingerprint(trigger: ControlledProductShadowTrigger): string {
  const { provenance: _provenance, ...semantic } = trigger;
  void _provenance;
  return stableId("controlled-product-shadow-trigger-semantic", semantic);
}
