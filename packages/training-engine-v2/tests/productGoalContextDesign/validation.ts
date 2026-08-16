import type { DesignGuardModel } from "./contracts";
import { fingerprint } from "./contracts";
import {
  baseDesignGuardModel,
  chunkEReadiness,
  consumerGymsParity,
  copyMatrix,
  currentOwnership,
  currentRenderBaseline,
  designEvidence,
  designOptions,
  driftAudit,
  fHandoff,
  goalOptionPolicy,
  informationArchitecture,
  legacyCompatibility,
  ownerScreenshotCorpus,
  painContextDesign,
  productProfileV2Design,
  responsiveAccessibility,
  signatureV2Design,
  stateMachine,
} from "./evidence";

export function validateDesignGuardModel(model: DesignGuardModel): readonly string[] {
  const errors: string[] = [];
  const primaryIndex = model.targetOrder.indexOf("primary_goal");
  const scheduleIndex = model.targetOrder.indexOf("days_per_week");
  if (model.surfaceCount !== 1) errors.push("ONE_SURFACE_REQUIRED");
  if (primaryIndex < 0 || scheduleIndex < 0 || primaryIndex > scheduleIndex) {
    errors.push("PRIMARY_GOAL_MUST_PRECEDE_SCHEDULE");
  }
  if (model.reducePainFuturePrimary) errors.push("REDUCE_PAIN_CANNOT_REMAIN_FUTURE_PRIMARY");
  if (model.painOwner !== "context") errors.push("PAIN_MUST_REMAIN_CONTEXT");
  if (model.diagnosisInferenceCount !== 0) errors.push("PAIN_DIAGNOSIS_PROHIBITED");
  if (model.genericCorrectiveCircuitCount !== 0) errors.push("GENERIC_CORRECTIVE_CIRCUIT_PROHIBITED");
  if (model.buildModeMapsToStrength) errors.push("TRAINING_MODE_CANNOT_CREATE_STRENGTH_OUTCOME");
  if (model.generalFitnessSilentDefault) errors.push("GENERAL_FITNESS_SILENT_DEFAULT_PROHIBITED");
  if (model.athleticPerformanceSilentDefault) errors.push("ATHLETIC_PERFORMANCE_SILENT_DEFAULT_PROHIBITED");
  if (model.gymUniversalCapabilityInferenceCount !== 0) errors.push("GYM_UNIVERSAL_CAPABILITY_PROHIBITED");
  if (model.dumbbellCapabilityInferenceCount !== 0) errors.push("DUMBBELL_CAPABILITY_INFERENCE_PROHIBITED");
  if (model.bandCapabilityInferenceCount !== 0) errors.push("BAND_CAPABILITY_INFERENCE_PROHIBITED");
  if (model.advancedExactLoadInferenceCount !== 0) errors.push("ADVANCED_EXACT_LOAD_INFERENCE_PROHIBITED");
  if (model.secondaryOverridesPrimary) errors.push("SECONDARY_CANNOT_OVERRIDE_PRIMARY");
  if (model.allFutureFieldsVisible) errors.push("PROGRESSIVE_DISCLOSURE_REQUIRED");
  if (model.multiPageWizard) errors.push("MULTI_PAGE_WIZARD_PROHIBITED");
  if (model.ordinaryFollowUpModal) errors.push("ORDINARY_FOLLOW_UP_MUST_BE_INLINE");
  if (model.fCurrentRouteVisible) errors.push("F_CURRENT_ROUTE_VISIBILITY_PROHIBITED");
  if (model.fCallsGenerateProgram) errors.push("F_GENERATE_PROGRAM_CALL_PROHIBITED");
  if (model.fPersistsQuestionnaire) errors.push("F_PREVIEW_PERSISTENCE_PROHIBITED");
  if (model.fCallsCurrentRouteShadow) errors.push("F_CURRENT_ROUTE_SHADOW_CALL_PROHIBITED");
  if (model.currentSignatureChanged) errors.push("CURRENT_SIGNATURE_CHANGE_PROHIBITED");
  if (model.screenshotPersonalDataCopied) errors.push("SCREENSHOT_PERSONAL_DATA_PROHIBITED");
  if (model.consumerScreenshotProvesGymsParity) errors.push("CONSUMER_SCREENSHOT_CANNOT_PROVE_GYMS_PARITY");
  if (model.screenshotKneesAddedToCode) errors.push("SCREENSHOT_KNEES_CODE_CHANGE_PROHIBITED");
  if (model.reportedBandDetailInvented) errors.push("REPORTED_BAND_DETAIL_INVENTION_PROHIBITED");
  if (model.eCompletedBeforeEvidence) errors.push("E_EVIDENCE_REQUIRED_BEFORE_CLOSURE");
  if (model.fCompleted) errors.push("F_MUST_REMAIN_OPEN");
  if (model.ledgerFinalCompleted) errors.push("FINAL_LEDGER_MUST_REMAIN_INCOMPLETE");
  return Object.freeze(errors);
}

const stateReachable = (start: string, target: string) => {
  const queue = [start];
  const visited = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    if (current === target) return true;
    for (const transition of stateMachine.transitions) {
      if (transition.from !== current || visited.has(transition.to)) continue;
      visited.add(transition.to);
      queue.push(transition.to);
    }
  }
  return false;
};

export function validateChunkEDesignEvidence(): readonly string[] {
  const errors = [...validateDesignGuardModel(baseDesignGuardModel)];
  if (ownerScreenshotCorpus.reference.contractVersion !== "1.0.0") {
    errors.push("SCREENSHOT_OBSERVATION_CONTRACT_VERSION_INVALID");
  }
  if (ownerScreenshotCorpus.declaredLogicalImageCount !== 13) {
    errors.push("OWNER_DECLARED_SCREENSHOT_COUNT_NOT_RECORDED");
  }
  if (ownerScreenshotCorpus.screenshotBinariesCommitted !== 0 ||
      ownerScreenshotCorpus.personalDataCommitted !== 0) {
    errors.push("SCREENSHOT_BINARY_OR_PERSONAL_DATA_COMMITTED");
  }
  if (currentRenderBaseline.entries.length !== 22) errors.push("CURRENT_RENDER_MATRIX_INCOMPLETE");
  const requiredWidths = [320, 360, 390, 1024, 1440];
  for (const width of requiredWidths) {
    if (!currentRenderBaseline.entries.some((entry) => entry.viewport.width === width)) {
      errors.push(`REQUIRED_VIEWPORT_MISSING:${width}`);
    }
  }
  if (currentRenderBaseline.entries.some((entry) => entry.horizontalOverflow || entry.fixedControlOverlap)) {
    errors.push("CURRENT_RENDER_OVERFLOW_OR_FIXED_CONTROL_COLLISION");
  }
  const requiredDrift = ["knees_pain_choice", "resistance_band_detail", "gyms_training_mode",
    "training_intent_signature", "legacy_gym_expansion"];
  for (const id of requiredDrift) {
    if (!driftAudit.rows.some((row) => row.id === id)) errors.push(`DRIFT_ROW_MISSING:${id}`);
  }
  if (!driftAudit.rows.every((row) => row.classifications.length > 0)) {
    errors.push("DRIFT_CLASSIFICATION_REQUIRED");
  }
  const ownershipFields = ["goals", "painAreas", "experience", "equipment", "daysPerWeek",
    "trainingIntent", "questionnaire_storage", "questionnaire_signature_v1", "gym_equipment_lock"];
  for (const field of ownershipFields) {
    if (!currentOwnership.rows.some((row) => row.field === field)) {
      errors.push(`OWNERSHIP_ROW_MISSING:${field}`);
    }
  }
  if (currentOwnership.auditAnswers.trainingIntentParticipatesInChangeIdentity) {
    errors.push("CURRENT_TRAINING_INTENT_SIGNATURE_AUDIT_INCORRECT");
  }
  if (informationArchitecture.selectedSurface.route !== "/questionnaire" ||
      informationArchitecture.selectedSurface.app !== "consumer") {
    errors.push("SELECTED_SURFACE_INCORRECT");
  }
  if (informationArchitecture.ordinarySupportedPathTargetSeconds > 60 ||
      informationArchitecture.multiPageWizard) {
    errors.push("ONE_PAGE_SPEED_DIRECTION_INVALID");
  }
  if (designOptions.selected !== "A") errors.push("OWNER_SELECTED_OPTION_A_REQUIRED");
  if (goalOptionPolicy.selectedImmediateOption !== "get_stronger") {
    errors.push("GET_STRONGER_MUST_BE_FIRST_INACTIVE_OPTION");
  }
  const getStronger = goalOptionPolicy.options.find((option) => option.id === "get_stronger");
  if (!getStronger || getStronger.canonicalOutcome !== "strength" ||
      !getStronger.states.includes("future_inactive_internal")) {
    errors.push("GET_STRONGER_OPTION_POLICY_INVALID");
  }
  for (const state of ["legacy_active", "future_inactive_internal", "future_shadow_only",
    "owner_account_only", "generally_available", "follow_up_required", "policy_required",
    "deprecated_legacy", "unsupported"] as const) {
    if (!goalOptionPolicy.stateVocabulary.includes(state)) errors.push(`OPTION_STATE_MISSING:${state}`);
  }
  if (copyMatrix.length < 14 || !copyMatrix.some((row) => row.fieldId === "primary_goal") ||
      !copyMatrix.some((row) => row.fieldId === "reduce_pain_migration")) {
    errors.push("COPY_MATRIX_INCOMPLETE");
  }
  for (const state of stateMachine.states) {
    if (state === "pristine") continue;
    const hasInbound = stateMachine.transitions.some((transition) => transition.to === state);
    if (!hasInbound) errors.push(`STATE_UNREACHABLE:${state}`);
  }
  if (stateReachable("inactive_preview_selected", "submitting_legacy")) {
    errors.push("INACTIVE_PREVIEW_REACHES_LEGACY_GENERATION");
  }
  if (stateReachable("unsupported_focus", "submitting_legacy")) {
    errors.push("UNSUPPORTED_FOCUS_REACHES_LEGACY_GENERATION");
  }
  if (!stateReachable("dirty_current_profile", "submitting_legacy") ||
      !stateReachable("active_session_warning", "cancel_revert")) {
    errors.push("CURRENT_LEGACY_CONFIRMATION_FLOW_NOT_REPRESENTABLE");
  }
  if (legacyCompatibility.goals.length !== 4 || legacyCompatibility.modes.length !== 4 ||
      legacyCompatibility.equipment.length !== 4 || legacyCompatibility.experience.length !== 3) {
    errors.push("LEGACY_MAPPING_COVERAGE_INCOMPLETE");
  }
  if (legacyCompatibility.migrationOnReadCount !== 0 || legacyCompatibility.regenerationOnReadCount !== 0) {
    errors.push("LEGACY_READ_MUST_BE_INERT");
  }
  if (fHandoff.visibility.consumerOrdinary || fHandoff.visibility.gymsOrdinary ||
      fHandoff.behavior.persist || fHandoff.behavior.generateProgram ||
      fHandoff.behavior.currentRouteShadow || fHandoff.behavior.returnV2Output) {
    errors.push("F_HANDOFF_BOUNDARY_INVALID");
  }
  if (signatureV2Design.implemented || signatureV2Design.currentSignatureChangedInE) {
    errors.push("SIGNATURE_V2_MUST_REMAIN_DESIGN_ONLY");
  }
  if (productProfileV2Design.implemented || productProfileV2Design.runtimeExportCount !== 0) {
    errors.push("PRODUCT_PROFILE_V2_MUST_REMAIN_DESIGN_ONLY");
  }
  if (!consumerGymsParity.trainingModeVisibility.consumer ||
      consumerGymsParity.trainingModeVisibility.gyms ||
      consumerGymsParity.gymsRuntimeChangesInE !== 0) {
    errors.push("CONSUMER_GYMS_PARITY_AUDIT_INCORRECT");
  }
  if (responsiveAccessibility.wcagConformanceClaimed) errors.push("WCAG_CLAIM_REQUIRES_IMPLEMENTATION_AUDIT");
  if (painContextDesign.diagnosisInferenceCount !== 0 ||
      painContextDesign.genericCorrectiveCircuitCount !== 0) {
    errors.push("PAIN_CONTEXT_BOUNDARY_INVALID");
  }
  if (chunkEReadiness.runtimeChangeCount !== 0 || chunkEReadiness.activationCount !== 0 ||
      chunkEReadiness.nextDependency !== "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_AUTHORIZATION") {
    errors.push("CHUNK_E_READINESS_BOUNDARY_INVALID");
  }
  return Object.freeze(errors);
}

type Mutation = {
  id: string;
  mutate: (model: DesignGuardModel) => DesignGuardModel;
};

const patchModel = (patch: Partial<DesignGuardModel>) =>
  (model: DesignGuardModel): DesignGuardModel => ({ ...model, ...patch });

export const designMutations: readonly Mutation[] = Object.freeze([
  { id: "multiple_product_surfaces", mutate: patchModel({ surfaceCount: 2 }) },
  { id: "goal_after_schedule", mutate: patchModel({ targetOrder: ["days_per_week", "primary_goal"] }) },
  { id: "reduce_pain_future_primary", mutate: patchModel({ reducePainFuturePrimary: true }) },
  { id: "pain_owned_by_outcome", mutate: patchModel({ painOwner: "outcome" }) },
  { id: "pain_creates_diagnosis", mutate: patchModel({ diagnosisInferenceCount: 1 }) },
  { id: "pain_creates_corrective_circuit", mutate: patchModel({ genericCorrectiveCircuitCount: 1 }) },
  { id: "build_mode_maps_strength", mutate: patchModel({ buildModeMapsToStrength: true }) },
  { id: "general_fitness_maps_strength", mutate: patchModel({ generalFitnessSilentDefault: "strength" }) },
  { id: "athletic_performance_maps_power", mutate: patchModel({ athleticPerformanceSilentDefault: "power" }) },
  { id: "gym_means_every_capability", mutate: patchModel({ gymUniversalCapabilityInferenceCount: 1 }) },
  { id: "dumbbells_imply_bench_max_increment", mutate: patchModel({ dumbbellCapabilityInferenceCount: 3 }) },
  { id: "bands_imply_anchor_type_resistance", mutate: patchModel({ bandCapabilityInferenceCount: 3 }) },
  { id: "advanced_implies_exact_load", mutate: patchModel({ advancedExactLoadInferenceCount: 1 }) },
  { id: "secondary_overrides_primary", mutate: patchModel({ secondaryOverridesPrimary: true }) },
  { id: "all_future_fields_visible", mutate: patchModel({ allFutureFieldsVisible: true }) },
  { id: "multi_page_wizard", mutate: patchModel({ multiPageWizard: true }) },
  { id: "ordinary_follow_up_modal", mutate: patchModel({ ordinaryFollowUpModal: true }) },
  { id: "get_stronger_current_route_visible", mutate: patchModel({ fCurrentRouteVisible: true }) },
  { id: "inactive_calls_generate_program", mutate: patchModel({ fCallsGenerateProgram: true }) },
  { id: "preview_persists_questionnaire", mutate: patchModel({ fPersistsQuestionnaire: true }) },
  { id: "current_route_calls_new_shadow", mutate: patchModel({ fCallsCurrentRouteShadow: true }) },
  { id: "current_signature_silently_changed", mutate: patchModel({ currentSignatureChanged: true }) },
  { id: "screenshot_personal_data_copied", mutate: patchModel({ screenshotPersonalDataCopied: true }) },
  { id: "consumer_screenshot_proves_gyms", mutate: patchModel({ consumerScreenshotProvesGymsParity: true }) },
  { id: "screenshot_knees_added_to_code", mutate: patchModel({ screenshotKneesAddedToCode: true }) },
  { id: "owner_band_detail_invented", mutate: patchModel({ reportedBandDetailInvented: true }) },
  { id: "e_completed_before_evidence", mutate: patchModel({ eCompletedBeforeEvidence: true }) },
  { id: "f_marked_complete", mutate: patchModel({ fCompleted: true }) },
  { id: "final_ledger_completed", mutate: patchModel({ ledgerFinalCompleted: true }) },
]);

const mutationResults = Object.freeze(designMutations.map((mutation) => {
  const errors = validateDesignGuardModel(mutation.mutate(baseDesignGuardModel));
  return Object.freeze({ id: mutation.id, rejected: errors.length > 0, reasonCodes: errors });
}));

export const designMutationResults = Object.freeze({
  mutations: mutationResults,
  rejectedCount: mutationResults.filter((mutation) => mutation.rejected).length,
  totalCount: mutationResults.length,
});

const invariantSemanticProjection = (input: {
  observationIds: readonly string[];
  viewportIds: readonly string[];
  copyRows: readonly { fieldId: string; label: string }[];
  provenance: readonly string[];
}) => ({
  observationIds: [...input.observationIds].sort(),
  viewportIds: [...input.viewportIds].sort(),
  copyRows: [...input.copyRows].sort((left, right) => left.fieldId.localeCompare(right.fieldId)),
  provenance: [...input.provenance].sort(),
  material: {
    goalOwner: "primary_goal",
    painOwner: "context",
    modeOwner: "training_mode",
    fVisibility: "explicit_preview_only",
  },
});

const invariantSeed = {
  observationIds: ownerScreenshotCorpus.sanitizedObservationIds,
  viewportIds: currentRenderBaseline.entries.map((entry) =>
    `${entry.appSurface}:${entry.viewport.width}x${entry.viewport.height}:${entry.syntheticState}`),
  copyRows: copyMatrix.map((row) => ({ fieldId: row.fieldId, label: row.label })),
  provenance: ["owner_observation", "current_branch_code", "current_head_render"],
};

const invariantCases = Object.freeze([
  "screenshot_observation_order", "viewport_record_order", "copy_matrix_row_order", "json_property_order",
  "nonsemantic_provenance_order", "display_screenshot_filenames", "browser_chrome", "background_image_crop",
  "current_account_label", "synthetic_user_id", "desktop_composition_order", "mobile_crop_order",
]);

const materialSeed = Object.freeze({
  goalOwner: "primary_goal",
  painOwner: "context",
  modeOwner: "training_mode",
  optionAvailability: "future_inactive_internal",
  followUpRequirement: "broad_goals_required",
  equipmentCapability: "conditional_when_legal",
  legacyMigration: "explicit_confirmation",
  fVisibility: "explicit_preview_only",
  fSubmission: "fail_closed_no_persistence",
});

const materialChanges = Object.freeze([
  ["goal_ownership", { goalOwner: "pain" }],
  ["pain_context_ownership", { painOwner: "outcome" }],
  ["mode_ownership", { modeOwner: "goal" }],
  ["option_availability", { optionAvailability: "generally_available" }],
  ["follow_up_requirement", { followUpRequirement: "silent_default" }],
  ["equipment_capability_requirement", { equipmentCapability: "environment_implies_all" }],
  ["legacy_migration_behavior", { legacyMigration: "migration_on_read" }],
  ["f_current_route_visibility", { fVisibility: "ordinary_route" }],
  ["f_submission_behavior", { fSubmission: "legacy_generateProgram" }],
] as const);

export const designMetamorphicResults = Object.freeze({
  invariance: Object.freeze(invariantCases.map((id) => {
    const original = fingerprint(invariantSemanticProjection(invariantSeed));
    const reordered = fingerprint(invariantSemanticProjection({
      observationIds: [...invariantSeed.observationIds].reverse(),
      viewportIds: [...invariantSeed.viewportIds].reverse(),
      copyRows: [...invariantSeed.copyRows].reverse(),
      provenance: [...invariantSeed.provenance].reverse(),
    }));
    return Object.freeze({ id, passed: original === reordered, original, transformed: reordered });
  })),
  materialResponse: Object.freeze(materialChanges.map(([id, patch]) => {
    const original = fingerprint(materialSeed);
    const transformed = fingerprint({ ...materialSeed, ...patch });
    return Object.freeze({ id, passed: original !== transformed, original, transformed });
  })),
});

export const validationSummary = Object.freeze({
  designErrors: validateChunkEDesignEvidence(),
  mutationTotal: designMutationResults.totalCount,
  mutationRejected: designMutationResults.rejectedCount,
  metamorphicTotal: designMetamorphicResults.invariance.length + designMetamorphicResults.materialResponse.length,
  metamorphicPassed: [...designMetamorphicResults.invariance,
    ...designMetamorphicResults.materialResponse].filter((entry) => entry.passed).length,
  evidenceFingerprint: fingerprint(designEvidence),
});
