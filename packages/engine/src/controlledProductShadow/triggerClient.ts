"use client";

import { CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE } from "@praxis/training-engine-v2";
import type { TrainingSnapshot } from "../trainingStateModel";
import { stableTrainingStringify } from "../trainingStateModel";
import type { ControlledProductShadowChangedCategory, ControlledProductShadowClientTrigger,
  ControlledProductShadowTriggerKind } from "./contracts";

function deterministicClientHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function changedCategories(patch: TrainingSnapshot): readonly ControlledProductShadowChangedCategory[] {
  const categories: ControlledProductShadowChangedCategory[] = [];
  if (Object.prototype.hasOwnProperty.call(patch, "questionnaire")) categories.push("questionnaire");
  if (Object.prototype.hasOwnProperty.call(patch, "assessment")) categories.push("assessment");
  if (Object.prototype.hasOwnProperty.call(patch, "prefs")) categories.push("preferences");
  if (patch.programs?.length) categories.push("program");
  if (patch.programProgress?.length) categories.push("program_progress");
  if (patch.sessions?.length) categories.push("session");
  if (patch.exerciseLogs?.length) categories.push("exercise_log");
  return Object.freeze(categories);
}

function triggerKind(categories: readonly ControlledProductShadowChangedCategory[]): ControlledProductShadowTriggerKind {
  if (categories.length === 0) return "not_shadow_relevant";
  if (categories.length > 1) return "product_mixed_state_changed";
  if (categories[0] === "program") return "product_program_changed";
  if (categories[0] === "program_progress") return "product_program_progress_changed";
  if (categories[0] === "session") return "product_session_completed";
  if (categories[0] === "exercise_log" || categories[0] === "preferences") {
    return "product_outcome_evidence_changed";
  }
  return "product_questionnaire_or_assessment_changed";
}

export function buildControlledProductShadowClientTrigger(input: {
  readonly patch: TrainingSnapshot;
  readonly patchSemanticFingerprint?: string;
  readonly operationalTime: string;
}): ControlledProductShadowClientTrigger {
  const semantic = stableTrainingStringify(input.patch);
  const fingerprint = input.patchSemanticFingerprint ?? `product-patch:${deterministicClientHash(semantic)}`;
  const categories = changedCategories(input.patch);
  const changedEntityIds = [...(input.patch.programs ?? []).map((entry) => entry.id),
    ...(input.patch.programProgress ?? []).map((entry) => entry.programId),
    ...(input.patch.sessions ?? []).map((entry) => entry.id),
    ...(input.patch.exerciseLogs ?? []).map((entry) => entry.id)].filter(Boolean).sort();
  const clientOperationId = `product-sync:${deterministicClientHash(stableTrainingStringify({
    fingerprint, categories, changedEntityIds }))}`;
  return Object.freeze({ triggerContract: CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE,
    triggerKind: triggerKind(categories), appSurface: "server_resolved", productPatchSemanticFingerprint: fingerprint,
    changedEntityCategories: categories, changedEntityIds: Object.freeze(changedEntityIds),
    anchorProgramId: input.patch.programs?.[0]?.id ?? input.patch.programProgress?.[0]?.programId ?? null,
    anchorSessionId: input.patch.sessions?.[0]?.id ?? input.patch.exerciseLogs?.[0]?.sessionId ?? null,
    anchorLogIds: Object.freeze((input.patch.exerciseLogs ?? []).map((entry) => entry.id).sort()),
    clientOperationId, clientObservedOperationalTime: input.operationalTime,
    provenance: Object.freeze(["training-sync:successful-authenticated-server-patch"]) });
}

export function notifyControlledProductShadowAfterSuccessfulSync(input: {
  readonly patch: TrainingSnapshot;
  readonly patchSemanticFingerprint?: string;
  readonly operationalTime?: string;
}): void {
  if (process.env.NEXT_PUBLIC_PRAXIS_V2_SHADOW_TRIGGER_ENABLED !== "true") return;
  const trigger = buildControlledProductShadowClientTrigger({ patch: input.patch,
    patchSemanticFingerprint: input.patchSemanticFingerprint,
    operationalTime: input.operationalTime ?? new Date().toISOString() });
  if (trigger.triggerKind === "not_shadow_relevant") return;
  void fetch("/api/training/v2-shadow", { method: "POST", cache: "no-store", credentials: "include",
    keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify(trigger) }).catch(() => undefined);
}
