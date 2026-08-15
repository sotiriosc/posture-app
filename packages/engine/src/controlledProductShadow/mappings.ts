import { REFERENCE_EXERCISES, stableId } from "@praxis/training-engine-v2";
import type { LogPrefs, Program } from "../types";
import { PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER_REFERENCE,
  PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP_REFERENCE, type ControlledProductShadowMappingBundle,
  type ProductEquipmentMapping, type ProductExerciseIdentityMapEntry, type ProductExerciseIdentityRegistry,
  type ProductExperienceMapping, type ProductGoalMapping, type ProductOrderedCycleHorizon,
  type ProductPainMapping, type ProductTrainingIntentMapping } from "./contracts";

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export function mapProductGoal(questionnaire: Record<string, unknown> | null): ProductGoalMapping {
  const goal = stringField(questionnaire?.goals);
  if (goal === "Improve posture") return Object.freeze({ productGoal: goal,
    primaryGoal: "posture_and_movement_quality", secondaryGoals: Object.freeze([]),
    programmingContexts: Object.freeze([]), status: "mapped", reasonCodes: Object.freeze([]) });
  if (goal === "Reduce pain") return Object.freeze({ productGoal: goal,
    primaryGoal: "posture_and_movement_quality", secondaryGoals: Object.freeze([]),
    programmingContexts: Object.freeze(["pain_aware_return"] as const), status: "mapped",
    reasonCodes: Object.freeze(["PAIN_AWARE_RETURN_CONTEXT_NON_DIAGNOSTIC"]) });
  if (goal === "General fitness") return Object.freeze({ productGoal: goal, primaryGoal: "general_fitness",
    secondaryGoals: Object.freeze([]), programmingContexts: Object.freeze([]), status: "mapped",
    reasonCodes: Object.freeze([]) });
  if (goal === "Athletic performance") return Object.freeze({ productGoal: goal, primaryGoal: null,
    secondaryGoals: Object.freeze([]), programmingContexts: Object.freeze([]), status: "under_specified",
    reasonCodes: Object.freeze(["PRODUCT_OUTCOME_GOAL_UNDER_SPECIFIED"]) });
  return Object.freeze({ productGoal: goal, primaryGoal: null, secondaryGoals: Object.freeze([]),
    programmingContexts: Object.freeze([]), status: "mapping_required",
    reasonCodes: Object.freeze(["PRODUCT_OUTCOME_GOAL_MAPPING_REQUIRED"]) });
}

export function mapProductTrainingIntent(questionnaire: Record<string, unknown> | null):
ProductTrainingIntentMapping {
  const intent = stringField(questionnaire?.trainingIntent);
  if (intent === "build") return Object.freeze({ productTrainingIntent: intent, context: "developmental",
    status: "mapped", reasonCodes: Object.freeze([]) });
  if (intent === "maintain") return Object.freeze({ productTrainingIntent: intent, context: null,
    status: "policy_required", reasonCodes: Object.freeze(["PRODUCT_MAINTENANCE_POLICY_REQUIRED"]) });
  if (intent === "rehab") return Object.freeze({ productTrainingIntent: intent, context: "pain_aware_return",
    status: "mapped", reasonCodes: Object.freeze(["REHAB_CONTEXT_NON_DIAGNOSTIC"]) });
  return Object.freeze({ productTrainingIntent: intent, context: null, status: "mapping_required",
    reasonCodes: Object.freeze(["PRODUCT_TRAINING_INTENT_MAPPING_REQUIRED"]) });
}

export function mapProductPain(questionnaire: Record<string, unknown> | null): ProductPainMapping {
  return Object.freeze({ regions: Object.freeze(stringArray(questionnaire?.painAreas).map((value) =>
    value.trim().toLowerCase()).filter(Boolean).sort()), source: "structured_product_questionnaire",
    diagnostic: false, severity: null, movementIntolerance: null, laterality: null });
}

export function mapProductExperience(questionnaire: Record<string, unknown> | null): ProductExperienceMapping {
  const value = stringField(questionnaire?.experience);
  const mapped = value === "Beginner" ? "beginner" : value === "Intermediate" ? "intermediate" :
    value === "Advanced" ? "advanced" : null;
  return Object.freeze({ productExperience: value, v2Experience: mapped,
    status: mapped ? "mapped" : "mapping_required" });
}

export function mapProductEquipment(questionnaire: Record<string, unknown> | null): ProductEquipmentMapping {
  const productEquipment = [...new Set(stringArray(questionnaire?.equipment).map((value) => value.trim().toLowerCase()))]
    .filter(Boolean).sort();
  const known = new Set<string>(["bodyweight"]);
  const unknown = new Set<string>();
  for (const value of productEquipment) {
    if (value === "none") continue;
    if (value === "dumbbells") known.add("dumbbells");
    else if (value === "bands") unknown.add("band_type_and_anchor");
    else if (value === "gym") unknown.add("product_gym_capability_bundle_required");
    else unknown.add(`unknown_product_equipment:${value}`);
  }
  const status = productEquipment.length === 0 ? "mapping_required" : unknown.size ? "mapping_incomplete" : "mapped";
  return Object.freeze({ productEquipment: Object.freeze(productEquipment), knownCapabilities:
    Object.freeze([...known].sort()), unknownCapabilities: Object.freeze([...unknown].sort()), status,
    provenance: Object.freeze(["product-equipment:explicit-selections-only", "no-band-anchor-inference",
      "no-dumbbell-bench-inference", "no-universal-gym-inference"]) });
}

export function createProductOrderedCycleHorizon(input: {
  readonly athleteId: string;
  readonly daysPerWeek: unknown;
  readonly equipment: ProductEquipmentMapping;
  readonly productStateRevision: string;
}): ProductOrderedCycleHorizon | null {
  const days = Number(input.daysPerWeek);
  if (![3, 4, 5].includes(days)) return null;
  const horizonId = stableId("product-ordered-cycle-horizon", { athleteId: input.athleteId, days });
  const opportunities = Object.freeze(Array.from({ length: days }, (_, index) => Object.freeze({
    opportunityId: stableId("product-ordered-cycle-opportunity", { horizonId, order: index + 1 }),
    order: index + 1, confirmationState: "product_confirmed" as const, expectedMinutes: null,
    date: null, weekday: null, expectedEquipmentState: input.equipment.status === "mapped" ? "mapped" as const :
      "unknown" as const })));
  return Object.freeze({ adapter: PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER_REFERENCE, horizonId,
    horizonRevisionId: stableId("product-ordered-cycle-horizon-revision", { horizonId,
      productStateRevision: input.productStateRevision, opportunityIds: opportunities.map((entry) => entry.opportunityId) }),
    boundary: Object.freeze({ kind: "ordered_cycle", cycleRef: `product-cycle:${input.productStateRevision}`,
      startOrder: 1, endOrder: days }), opportunities,
    unresolvedRequirements: Object.freeze(["PRODUCT_SESSION_AVAILABILITY_REQUIRED"]) });
}

export function createProductExerciseIdentityRegistry(
  productExerciseIds: readonly string[],
): ProductExerciseIdentityRegistry {
  const v2Ids = new Set(REFERENCE_EXERCISES.map((entry) => entry.id));
  const entries: ProductExerciseIdentityMapEntry[] = [...new Set(productExerciseIds)].sort().map((id) =>
    Object.freeze({ productExerciseId: id, v2ExerciseId: v2Ids.has(id) ? id : null,
      classification: v2Ids.has(id) ? "exact_same_canonical_id" as const : "legacy_only_no_v2_identity" as const,
      ownerReviewed: v2Ids.has(id) }));
  return Object.freeze({ reference: PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP_REFERENCE,
    entries: Object.freeze(entries) });
}

export function mapProductAssessment(assessment: Record<string, unknown> | null): readonly {
  readonly signalId: string; readonly confidence: number | null; readonly region: string | null;
  readonly action: string | null; readonly reviewState: string | null }[] {
  const signals = Array.isArray(assessment?.signals) ? assessment.signals : [];
  return Object.freeze(signals.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry, index) => Object.freeze({ signalId: stringField(entry.id) ?? `product-assessment-signal-${index + 1}`,
      confidence: typeof entry.confidence === "number" ? entry.confidence : null,
      region: stringField(entry.region), action: stringField(entry.action), reviewState: stringField(entry.reviewState) })));
}

export function mapProductPreferences(prefs: LogPrefs | null) {
  const liked: string[] = [];
  const disliked: string[] = [];
  for (const [id, feedback] of Object.entries(prefs?.feedbackByExercise ?? {})) {
    if (feedback.rating === "easy") liked.push(id);
    if (feedback.rating === "pain") disliked.push(id);
  }
  return Object.freeze({ preferredExerciseIds: Object.freeze(liked.sort()),
    painMarkedExerciseIds: Object.freeze(disliked.sort()), substitutionSourceIds:
      Object.freeze(Object.keys(prefs?.substitutionByExercise ?? {}).sort()),
    materialExclusionAuthority: false as const });
}

export function buildControlledProductShadowMappingBundle(input: {
  readonly athleteId: string;
  readonly questionnaire: Record<string, unknown> | null;
  readonly assessment: Record<string, unknown> | null;
  readonly prefs: LogPrefs | null;
  readonly productStateRevision: string;
}): ControlledProductShadowMappingBundle {
  const goal = mapProductGoal(input.questionnaire);
  const trainingIntent = mapProductTrainingIntent(input.questionnaire);
  const pain = mapProductPain(input.questionnaire);
  const experience = mapProductExperience(input.questionnaire);
  const equipment = mapProductEquipment(input.questionnaire);
  const assessment = mapProductAssessment(input.assessment);
  const preferences = mapProductPreferences(input.prefs);
  const horizon = createProductOrderedCycleHorizon({ athleteId: input.athleteId,
    daysPerWeek: input.questionnaire?.daysPerWeek, equipment,
    productStateRevision: input.productStateRevision });
  const unresolvedRequirements = [...goal.reasonCodes, ...trainingIntent.reasonCodes,
    ...(experience.status === "mapping_required" ? ["PRODUCT_EXPERIENCE_MAPPING_REQUIRED"] : []),
    ...equipment.unknownCapabilities, ...(horizon ? horizon.unresolvedRequirements : ["PRODUCT_DAYS_PER_WEEK_REQUIRED"]),
    ...(assessment.length === 0 ? ["PRODUCT_ASSESSMENT_ABSENT_OR_UNMAPPED"] : [])];
  const semantic = { goal, trainingIntent, pain, experience, equipment, horizon,
    assessment, preferences, unresolvedRequirements: [...new Set(unresolvedRequirements)].sort() };
  return Object.freeze({ goal, trainingIntent, pain, experience, equipment, assessment, preferences, horizon,
    unresolvedRequirements: Object.freeze(semantic.unresolvedRequirements),
    mappingFingerprint: stableId("controlled-product-shadow-mapping", semantic) });
}

export function collectProductExerciseIds(program: Program | null, prefs: LogPrefs | null): readonly string[] {
  return Object.freeze([...new Set([...(program?.week.flatMap((day) => day.routine.map((item) => item.exerciseId)) ?? []),
    ...Object.keys(prefs?.feedbackByExercise ?? {}), ...Object.keys(prefs?.substitutionByExercise ?? {}),
    ...Object.values(prefs?.substitutionByExercise ?? {})])].sort());
}
