import {
  PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE,
  createProductShadowMappingReadiness,
  stableId,
  type ControlledProductShadowGoalRealizationMappingBundleV1,
  type ProductAssessmentShadowMapping,
  type ProductPainContextShadowMapping,
  type ProductShadowMappingReadinessTraceEntry,
} from "@praxis/training-engine-v2";
import type { ProductGoalRealizationMappingInput } from "./contracts";
import { mapProductAvailabilityHorizon } from "./availabilityMapping";
import { mapProductEquipmentForRealization } from "./equipmentMapping";
import { mapProductExperienceForRealization, projectProductLegacyHistoryAuthority } from
  "./experienceHistoryMapping";
import { mapProductExerciseIdentities } from "./exerciseIdentityMapping";
import { mapProductGoalForGoalRealizationProfile } from "./goalMapping";
import { CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4 } from "./mappingProfile";
import { createProductGoalArchitectureShadowPlanningBrief } from "./planningBriefPolicy";
import { mapProductPreferenceContinuity } from "./preferenceContinuityMapping";
import { mapProductTrainingModeV2 } from "./trainingModeMapping";
import { projectProductAssessmentReportForShadow } from "../productAssessmentAdapter";

function strings(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function field(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapProductPainContextV2(
  questionnaire: Record<string, unknown> | null,
): ProductPainContextShadowMapping {
  return Object.freeze({ regions: Object.freeze([...new Set(strings(questionnaire?.painAreas)
    .map((value) => value.trim().toLowerCase()).filter(Boolean))].sort()),
  source: "structured_product_questionnaire", severity: null, laterality: null,
  movementIntolerance: null, diagnosis: null, primaryOutcomeCreated: false,
  materialSafetyBlockCreated: false });
}

export function mapProductAssessmentV2(
  assessment: Record<string, unknown> | null,
): ProductAssessmentShadowMapping {
  const rawSignals = Array.isArray(assessment?.signals) ? assessment.signals : [];
  const legacySignals = rawSignals.filter((entry): entry is Record<string, unknown> =>
    Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)).map((entry, index) => Object.freeze({
      signalId: field(entry.id) ?? `product-assessment-signal-${index + 1}`,
      confidence: typeof entry.confidence === "number" && Number.isFinite(entry.confidence) ? entry.confidence : null,
      region: field(entry.region), action: field(entry.action), reviewState: field(entry.reviewState),
    })).sort((left, right) => left.signalId.localeCompare(right.signalId));
  const signals = legacySignals.length || !Array.isArray(assessment?.observations)
    ? legacySignals
    : projectProductAssessmentReportForShadow({ assessment, sourceRevision: "product-shadow-goal-realization:assessment" });
  return Object.freeze({ signals: Object.freeze(signals), proseConsumptionCount: 0,
    genericCorrectiveCircuitCount: 0 });
}

function readinessTrace(input: {
  readonly goal: ReturnType<typeof mapProductGoalForGoalRealizationProfile>;
  readonly planningBrief: ReturnType<typeof createProductGoalArchitectureShadowPlanningBrief>;
  readonly mode: ReturnType<typeof mapProductTrainingModeV2>;
  readonly experience: ReturnType<typeof mapProductExperienceForRealization>;
  readonly history: ReturnType<typeof projectProductLegacyHistoryAuthority>;
  readonly equipment: ReturnType<typeof mapProductEquipmentForRealization>;
  readonly availability: ReturnType<typeof mapProductAvailabilityHorizon>;
  readonly identities: ReturnType<typeof mapProductExerciseIdentities>;
}): readonly ProductShadowMappingReadinessTraceEntry[] {
  const trace: ProductShadowMappingReadinessTraceEntry[] = [];
  if (input.goal.status === "conflict" || input.equipment.capability.status === "conflict") trace.push({
    order: 1, boundary: "contract_version", state: "mapping_conflict", material: true,
    reasonCodes: Object.freeze([...input.goal.followUpRequirements, "PRODUCT_MAPPING_CONFLICT"]),
  });
  if (!input.goal.primaryOutcome) trace.push({ order: 3, boundary: "primary_outcome",
    state: "primary_outcome_follow_up_required", material: true,
    reasonCodes: input.goal.followUpRequirements.length ? input.goal.followUpRequirements :
      Object.freeze(["PRODUCT_PRIMARY_OUTCOME_GOAL_REQUIRED"]) });
  if (input.goal.primaryOutcome === "general_fitness" && !input.planningBrief) trace.push({
    order: 7, boundary: "planning_brief", state: "purpose_bundle_follow_up_required", material: true,
    reasonCodes: input.goal.followUpRequirements,
  });
  if (input.mode.status === "policy_required" || input.mode.status === "mapping_required") trace.push({
    order: 6, boundary: "training_mode", state: "training_mode_policy_required", material: true,
    reasonCodes: input.mode.reasonCodes,
  });
  if (input.experience.status === "mapping_required") trace.push({ order: 8, boundary: "coarse_experience",
    state: "experience_context_incomplete", material: true,
    reasonCodes: Object.freeze(["PRODUCT_COARSE_EXPERIENCE_REQUIRED"]) });
  trace.push({ order: 9, boundary: "legacy_history_authority", state: "legacy_history_restricted",
    material: false, reasonCodes: input.history.missingLineage });
  if (input.equipment.capability.status !== "exact_capability_available") trace.push({
    order: 10, boundary: "equipment_capability", state: "equipment_capability_incomplete", material: true,
    reasonCodes: input.equipment.capability.explicitUnknowns.length ? input.equipment.capability.explicitUnknowns :
      Object.freeze(["PRODUCT_EQUIPMENT_CAPABILITY_REQUIRED"]),
  });
  if (!input.equipment.load.exactRealizationAvailable) trace.push({ order: 11,
    boundary: "equipment_load_realization", state: "equipment_realization_incomplete",
    material: !input.equipment.load.selfSelectedCalibrationAvailable,
    reasonCodes: input.equipment.load.exactUnknowns });
  if (input.availability.status !== "ordered_opportunities_with_minutes") trace.push({ order: 12,
    boundary: "availability_horizon", state: "availability_incomplete", material: true,
    reasonCodes: Object.freeze(input.availability.opportunityCount ? ["PRODUCT_SESSION_MINUTES_REQUIRED"] :
      ["PRODUCT_DAYS_PER_WEEK_REQUIRED"]),
  });
  const unresolvedIdentities = input.identities.entries.filter((entry) => !entry.v2ExerciseId);
  if (unresolvedIdentities.length) trace.push({ order: 14, boundary: "exercise_identity",
    state: "exercise_mapping_incomplete", material: true,
    reasonCodes: Object.freeze(unresolvedIdentities.map((entry) =>
      `PRODUCT_EXERCISE_IDENTITY_MAPPING_REQUIRED:${entry.productExerciseId}`).sort()) });
  if (!trace.some((entry) => entry.material)) trace.push({ order: 15, boundary: "final_readiness",
    state: input.equipment.load.selfSelectedCalibrationAvailable ?
      "complete_with_self_selected_calibration" : "complete_for_shadow_planning",
    material: false, reasonCodes: Object.freeze([]) });
  return Object.freeze(trace.map((entry) => Object.freeze(entry)));
}

export function buildControlledProductShadowGoalRealizationMappingBundleV1(
  input: ProductGoalRealizationMappingInput,
): ControlledProductShadowGoalRealizationMappingBundleV1 {
  if (input.fixtureExtensions && (input.fixtureExtensions.reference.contractId !==
      "PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS" ||
      input.fixtureExtensions.reference.contractVersion !== "1.0.0" ||
      input.fixtureExtensions.source !== "versioned_test_or_replay_fixture")) {
    throw new Error("PRODUCT_SHADOW_FIXTURE_EXTENSION_VERSION_REQUIRED");
  }
  const goalMapping = mapProductGoalForGoalRealizationProfile({ questionnaire: input.questionnaire,
    fixtureExtensions: input.fixtureExtensions });
  const trainingModeMapping = mapProductTrainingModeV2(input.questionnaire);
  const planningBrief = createProductGoalArchitectureShadowPlanningBrief({ goal: goalMapping,
    trainingMode: trainingModeMapping, fixtureExtensions: input.fixtureExtensions });
  const painContextMapping = mapProductPainContextV2(input.questionnaire);
  const experienceMapping = mapProductExperienceForRealization(input.questionnaire);
  const legacyHistoryProjection = projectProductLegacyHistoryAuthority({ programs: input.programs,
    sessions: input.sessions, exerciseLogs: input.exerciseLogs, activeProgramId: input.activeProgramId });
  const preferenceContinuityMapping = mapProductPreferenceContinuity({ preferences: input.preferences,
    exerciseLogs: input.exerciseLogs });
  const equipment = mapProductEquipmentForRealization({ questionnaire: input.questionnaire,
    fixtureExtensions: input.fixtureExtensions });
  const availabilityMapping = mapProductAvailabilityHorizon({ athleteId: input.athleteId,
    questionnaire: input.questionnaire, productStateRevision: input.productStateRevision,
    fixtureExtensions: input.fixtureExtensions });
  const assessmentMapping = mapProductAssessmentV2(input.assessment);
  const exerciseIdentityMapping = mapProductExerciseIdentities({ programs: input.programs,
    exerciseLogs: input.exerciseLogs, preferences: input.preferences,
    fixtureExtensions: input.fixtureExtensions });
  const readiness = createProductShadowMappingReadiness(readinessTrace({ goal: goalMapping, planningBrief,
    mode: trainingModeMapping, experience: experienceMapping, history: legacyHistoryProjection,
    equipment, availability: availabilityMapping, identities: exerciseIdentityMapping }));
  const unresolvedRequirements = Object.freeze([...new Set([
    ...readiness.unresolvedRequirements,
    ...goalMapping.followUpRequirements.filter((entry) => entry !== "PRODUCT_SECONDARY_GOAL_NOT_CAPTURED"),
  ])].sort());
  const semantic = Object.freeze({ bundleReference: PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE,
    mappingProfileReference: CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4.reference,
    goalMapping, planningBrief, trainingModeMapping, painContextMapping, experienceMapping,
    legacyHistoryProjection, equipmentCapabilityMapping: equipment.capability,
    equipmentLoadRealizationMapping: equipment.load, availabilityMapping, assessmentMapping,
    preferenceContinuityMapping, exerciseIdentityMapping, readiness, sourceFactReferences: Object.freeze([
      `product-state:${input.productStateRevision}`, `athlete:${input.athleteId}`,
      ...(input.fixtureExtensions ? ["fixture-extensions:1.0.0"] : []),
    ]), unresolvedRequirements, counterfactualOnly: true as const,
    provenance: Object.freeze(["authenticated-product-snapshot:structured-facts-only",
      "controlled-product-shadow-goal-realization:default-off", `evaluation-time:${input.evaluationTime}`]),
    rawProductPayloadIncluded: false as const });
  return Object.freeze({ ...semantic, mappingFingerprint:
    stableId("controlled-product-shadow-goal-realization-mapping-v1", semantic) });
}
