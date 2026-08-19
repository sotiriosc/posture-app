import type { BodyRegion, MovementRole, MuscleGroup } from "../domain/primitives";
import {
  PRODUCTION_LOADING_COMPLETENESS_STATES,
  type ProductionLoadingCompletenessState,
  type ProductionWeeklyExecutionRequirements,
} from "../domain/weeklyExecutionRequirements";
import type {
  ProductionExplicitWeeklyPriority,
  ProductionPlanningObjectivePriority,
  ProductionWeekObjectiveFamily,
  ProductionWeekObjectivePurpose,
  ProductionWeeklySelectionTarget,
} from "../weekPlanning/contracts";

export const PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID =
  "PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_V1" as const;
export const PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION = "1.0.0" as const;
export const PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE =
  `${PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID}@${PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION}` as const;

export const PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS = Object.freeze([
  "knee_dominant_squat",
  "hinge_hip_extension",
  "upper_push",
  "upper_pull",
] as const);

export type ProductGetStrongerDevelopFoundationKey =
  typeof PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS[number];

export const PRODUCT_GET_STRONGER_DEVELOP_RESPONSIBILITY_OWNERS = Object.freeze([
  "explicit_subgoal",
  "reviewed_assessment",
  "reviewed_nonredundant_whole_program_coverage",
  "continuity_or_response_evidence",
  "confirmed_loading_limitation",
  "confirmed_equipment_enabled_complementary_plane",
  "recognized_typed_product_fact",
] as const);

export type ProductGetStrongerDevelopResponsibilityOwner =
  typeof PRODUCT_GET_STRONGER_DEVELOP_RESPONSIBILITY_OWNERS[number];

export type ProductGetStrongerDevelopResponsibilityClassification =
  "conditional_required" | "preferred" | "optional";

export type ProductGetStrongerDevelopAdditionalResponsibilityKind =
  "unilateral" | "trunk_bracing" | "direct_muscle" | "assessment_development" |
  "loading_capacity" | "carry" | "isolated_muscle" | "additional_variation";

export interface ProductGetStrongerDevelopSeparatePlaneFact {
  readonly factId: string;
  readonly family: "upper_push" | "upper_pull";
  readonly requiredPlanes: readonly ["horizontal", "vertical"];
  readonly owner: ProductGetStrongerDevelopResponsibilityOwner;
  readonly evidenceRefs: readonly string[];
}

export interface ProductGetStrongerDevelopAdditionalResponsibilityFact {
  readonly factId: string;
  readonly kind: ProductGetStrongerDevelopAdditionalResponsibilityKind;
  readonly classification: ProductGetStrongerDevelopResponsibilityClassification;
  readonly owner: ProductGetStrongerDevelopResponsibilityOwner;
  readonly targetMovementRoles?: readonly MovementRole[];
  readonly targetMuscles?: readonly MuscleGroup[];
  readonly targetBodyRegions?: readonly BodyRegion[];
  readonly evidenceRefs: readonly string[];
}

export interface ProductGetStrongerDevelopLoadingEvidence {
  readonly evidenceId: string;
  readonly responsibilityKey: string;
  readonly state: ProductionLoadingCompletenessState;
  readonly sourceFactIds: readonly string[];
  readonly unresolvedCapabilityRef?: string;
}

export interface ProductGetStrongerDevelopWeeklyPolicyInput {
  readonly productLabel: "get_stronger";
  readonly trainingMode: "develop";
  readonly outcomeGoal: "strength";
  readonly sourceProductRevisionId: string;
  readonly goalFactId: string;
  readonly modeFactId: string;
  readonly experience: "beginner" | "intermediate" | "advanced";
  readonly experienceFactId: string;
  readonly availableOpportunityCount: number;
  readonly separatePlaneFacts: readonly ProductGetStrongerDevelopSeparatePlaneFact[];
  readonly additionalResponsibilityFacts: readonly ProductGetStrongerDevelopAdditionalResponsibilityFact[];
  readonly loadingEvidence: readonly ProductGetStrongerDevelopLoadingEvidence[];
}

export interface ProductGetStrongerDevelopResponsibilityTrace {
  readonly responsibilityKey: string;
  readonly foundationKey: ProductGetStrongerDevelopFoundationKey | null;
  readonly classification: "foundation_required" | ProductGetStrongerDevelopResponsibilityClassification;
  readonly priorityId: string;
  readonly owningFactId: string;
  readonly owningFactOwner: ProductGetStrongerDevelopResponsibilityOwner;
  readonly loadingCompletenessState: ProductionLoadingCompletenessState;
  readonly unresolvedCapabilityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface ProductGetStrongerDevelopWeeklyPolicyResult {
  readonly status: "resolved" | "invalid_input";
  readonly policyReference: {
    readonly policyId: typeof PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID;
    readonly version: typeof PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION;
    readonly reference: typeof PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE;
  };
  readonly priorities: readonly ProductionExplicitWeeklyPriority[];
  readonly responsibilityTraces: readonly ProductGetStrongerDevelopResponsibilityTrace[];
  readonly unresolvedCapabilityRefs: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly decisionTrace: readonly string[];
}

export const PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_V1 = Object.freeze({
  policyId: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID,
  version: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION,
  reference: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
  executionBoundary: "controlled_owner_only",
  foundations: PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS,
  frequency: Object.freeze({ minimumExposure: 1, targetExposure: 2, softMaximumExposure: 3 }),
  automaticPrimaryRotation: false,
  capacityCreatesResponsibility: false,
  productShadowChanged: false,
  legacyProductChanged: false,
} as const);

const POLICY_REFERENCE = Object.freeze({
  policyId: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID,
  version: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION,
  reference: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
});

const uniqueSorted = (values: readonly string[]): readonly string[] =>
  Object.freeze([...new Set(values)].sort());

function target(input: {
  readonly roles: readonly MovementRole[];
  readonly muscles: readonly MuscleGroup[];
  readonly regions: readonly BodyRegion[];
  readonly muscleRequirement?: ProductionWeeklySelectionTarget["muscleRequirement"];
}): ProductionWeeklySelectionTarget {
  return Object.freeze({
    targetMovementRoles: Object.freeze([...input.roles].sort()),
    targetActionFunctions: Object.freeze([]),
    targetMuscles: Object.freeze([...input.muscles].sort()),
    muscleRequirement: input.muscleRequirement ?? "any_meaningful_contributor",
    targetBodyRegions: Object.freeze([...input.regions].sort()),
  });
}

const FOUNDATION_DEFINITIONS: Readonly<Record<ProductGetStrongerDevelopFoundationKey, {
  readonly roles: readonly MovementRole[];
  readonly muscles: readonly MuscleGroup[];
  readonly regions: readonly BodyRegion[];
}>> = Object.freeze({
  knee_dominant_squat: Object.freeze({ roles: Object.freeze(["knee_dominant", "squat"] as const),
    muscles: Object.freeze(["glutes", "quads"] as const), regions: Object.freeze(["ankle", "hip", "knee"] as const) }),
  hinge_hip_extension: Object.freeze({ roles: Object.freeze(["hinge"] as const),
    muscles: Object.freeze(["glutes", "hamstrings"] as const), regions: Object.freeze(["hip", "lumbar_spine"] as const) }),
  upper_push: Object.freeze({ roles: Object.freeze(["horizontal_push", "vertical_push"] as const),
    muscles: Object.freeze(["chest", "front_delts", "triceps"] as const), regions: Object.freeze(["elbow", "shoulder"] as const) }),
  upper_pull: Object.freeze({ roles: Object.freeze(["horizontal_pull", "vertical_pull"] as const),
    muscles: Object.freeze(["lats", "mid_back", "upper_back"] as const), regions: Object.freeze(["shoulder", "thoracic_spine"] as const) }),
});

function loadingQuestion(responsibilityKey: string): string {
  return `OWNER_CONFIRM_${responsibilityKey.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}_LOADING_CAPABILITY`;
}

function executionRequirements(input: {
  readonly responsibilityKey: string;
  readonly sourceFactIds: readonly string[];
  readonly requiredPrescriptionPurpose: ProductionWeeklyExecutionRequirements["requiredPrescriptionPurpose"];
  readonly loadingEvidence: ProductGetStrongerDevelopLoadingEvidence | undefined;
  readonly advanced: boolean;
}): ProductionWeeklyExecutionRequirements {
  const state = input.loadingEvidence?.state ?? "unresolved";
  const unresolved = state === "unresolved" || state === "insufficient";
  const unresolvedCapabilityRefs = unresolved ? uniqueSorted([
    input.loadingEvidence?.unresolvedCapabilityRef ?? loadingQuestion(input.responsibilityKey),
  ]) : Object.freeze([]);
  return Object.freeze({
    developmentalCreditRequired: true,
    requiredPrescriptionPurpose: input.requiredPrescriptionPurpose,
    loadingSuitabilityRequired: true,
    calibrationStateRequired: state !== "confirmed",
    loadingCompletenessState: state,
    unresolvedCapabilityDisposition: unresolved ? "retained_blocks_approval" : "none",
    unresolvedCapabilityRefs,
    provenance: Object.freeze({
      policyRef: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
      sourceFactIds: uniqueSorted([...input.sourceFactIds,
        ...(input.loadingEvidence?.sourceFactIds ?? []),
        ...(input.loadingEvidence ? [input.loadingEvidence.evidenceId] : [])]),
      ruleRefs: Object.freeze([
        "DEVELOP_REQUIRES_DEVELOPMENTAL_CREDIT",
        "LOCAL_PRESCRIPTION_PURPOSE_MUST_BE_PRESERVED",
        "LOADING_SUITABILITY_REQUIRES_TYPED_TRUTH",
        state === "confirmed" ? "LOADING_CONFIRMED" :
          state === "bounded_initial_calibration" ? "BOUNDED_INITIAL_CALIBRATION_EXPLICIT" :
            "UNMET_LOADING_CAPABILITY_RETAINED_AND_BLOCKS_APPROVAL",
        ...(input.advanced ? ["ADVANCED_EXPERIENCE_DOES_NOT_PROVE_LOAD_HISTORY_OR_PREREQUISITES"] : []),
      ]),
    }),
  });
}

interface ResponsibilityDefinition {
  readonly responsibilityKey: string;
  readonly foundationKey: ProductGetStrongerDevelopFoundationKey | null;
  readonly classification: "foundation_required" | ProductGetStrongerDevelopResponsibilityClassification;
  readonly family: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing">;
  readonly purpose: ProductionWeekObjectivePurpose;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly selectionTarget: ProductionWeeklySelectionTarget;
  readonly owningFactId: string;
  readonly owningFactOwner: ProductGetStrongerDevelopResponsibilityOwner;
  readonly evidenceRefs: readonly string[];
  readonly requiredPrescriptionPurpose: ProductionWeeklyExecutionRequirements["requiredPrescriptionPurpose"];
}

function foundationDefinitions(input: ProductGetStrongerDevelopWeeklyPolicyInput): readonly ResponsibilityDefinition[] {
  const separatePush = input.separatePlaneFacts.find((fact) => fact.family === "upper_push");
  const separatePull = input.separatePlaneFacts.find((fact) => fact.family === "upper_pull");
  const baseEvidence = [input.sourceProductRevisionId, input.goalFactId, input.modeFactId];
  const broad = (foundationKey: ProductGetStrongerDevelopFoundationKey): ResponsibilityDefinition => ({
    responsibilityKey: `foundation:${foundationKey}`,
    foundationKey,
    classification: "foundation_required",
    family: "strength",
    purpose: "movement_development",
    priority: "required",
    selectionTarget: target(FOUNDATION_DEFINITIONS[foundationKey]),
    owningFactId: input.goalFactId,
    owningFactOwner: "recognized_typed_product_fact",
    evidenceRefs: uniqueSorted(baseEvidence),
    requiredPrescriptionPurpose: "strength_development",
  });
  const separate = (foundationKey: "upper_push" | "upper_pull",
    fact: ProductGetStrongerDevelopSeparatePlaneFact): readonly ResponsibilityDefinition[] => {
    const direction = foundationKey === "upper_push" ? "push" : "pull";
    const definition = FOUNDATION_DEFINITIONS[foundationKey];
    return Object.freeze((["horizontal", "vertical"] as const).map((plane) => ({
      responsibilityKey: `foundation:${foundationKey}:${plane}`,
      foundationKey,
      classification: "foundation_required" as const,
      family: "strength" as const,
      purpose: "movement_development" as const,
      priority: "required" as const,
      selectionTarget: target({ ...definition, roles: [`${plane}_${direction}` as MovementRole] }),
      owningFactId: fact.factId,
      owningFactOwner: fact.owner,
      evidenceRefs: uniqueSorted([...baseEvidence, fact.factId, ...fact.evidenceRefs]),
      requiredPrescriptionPurpose: "strength_development" as const,
    })));
  };
  return Object.freeze([
    broad("knee_dominant_squat"),
    broad("hinge_hip_extension"),
    ...(separatePush ? separate("upper_push", separatePush) : [broad("upper_push")]),
    ...(separatePull ? separate("upper_pull", separatePull) : [broad("upper_pull")]),
  ]);
}

function additionalTarget(fact: ProductGetStrongerDevelopAdditionalResponsibilityFact): {
  readonly family: ResponsibilityDefinition["family"];
  readonly purpose: ProductionWeekObjectivePurpose;
  readonly selectionTarget: ProductionWeeklySelectionTarget;
  readonly requiredPrescriptionPurpose: ProductionWeeklyExecutionRequirements["requiredPrescriptionPurpose"];
} | null {
  const regions = fact.targetBodyRegions ?? [];
  if (fact.kind === "unilateral") return { family: "strength", purpose: "movement_development",
    selectionTarget: target({ roles: ["single_leg"], muscles: ["glutes", "quads"], regions: ["hip", "knee"] }),
    requiredPrescriptionPurpose: "strength_development" };
  if (fact.kind === "trunk_bracing") return { family: "strength", purpose: "movement_development",
    selectionTarget: target({ roles: ["loaded_bracing"], muscles: ["trunk"], regions: ["lumbar_spine"] }),
    requiredPrescriptionPurpose: "strength_development" };
  if (fact.kind === "carry") return { family: "capacity", purpose: "capacity_development",
    selectionTarget: target({ roles: ["carry"], muscles: ["trunk"], regions: ["general"] }),
    requiredPrescriptionPurpose: "capacity_development" };
  if (fact.kind === "direct_muscle" || fact.kind === "isolated_muscle") {
    if (!fact.targetMuscles?.length) return null;
    return { family: "muscle", purpose: "muscle_development",
      selectionTarget: target({ roles: fact.targetMovementRoles ?? [], muscles: fact.targetMuscles,
        regions, muscleRequirement: fact.kind === "isolated_muscle" ? "primary_required" : "any_meaningful_contributor" }),
      requiredPrescriptionPurpose: "hypertrophy_development" };
  }
  if (fact.kind === "assessment_development") {
    if (!(fact.targetMovementRoles?.length || regions.length)) return null;
    return { family: "assessment", purpose: "assessment_priority_development",
      selectionTarget: target({ roles: fact.targetMovementRoles ?? [], muscles: fact.targetMuscles ?? [], regions }),
      requiredPrescriptionPurpose: "technique_or_control" };
  }
  if (fact.kind === "loading_capacity") {
    if (!fact.targetMovementRoles?.length) return null;
    return { family: "capacity", purpose: "capacity_development",
      selectionTarget: target({ roles: fact.targetMovementRoles, muscles: fact.targetMuscles ?? [], regions }),
      requiredPrescriptionPurpose: "capacity_development" };
  }
  if (fact.kind === "additional_variation") {
    if (!fact.targetMovementRoles?.length) return null;
    return { family: "strength", purpose: "movement_development",
      selectionTarget: target({ roles: fact.targetMovementRoles, muscles: fact.targetMuscles ?? [], regions }),
      requiredPrescriptionPurpose: "strength_development" };
  }
  return null;
}

function additionalDefinitions(input: ProductGetStrongerDevelopWeeklyPolicyInput): {
  readonly definitions: readonly ResponsibilityDefinition[];
  readonly reasons: readonly string[];
} {
  const reasons: string[] = [];
  const definitions = input.additionalResponsibilityFacts.flatMap((fact): readonly ResponsibilityDefinition[] => {
    if (fact.classification === "conditional_required" && ["carry", "isolated_muscle", "additional_variation"].includes(fact.kind)) {
      reasons.push(`CONDITIONAL_RESPONSIBILITY_KIND_UNSUPPORTED:${fact.factId}`);
      return [];
    }
    if (fact.classification === "optional" && !["carry", "isolated_muscle", "additional_variation"].includes(fact.kind)) {
      reasons.push(`OPTIONAL_RESPONSIBILITY_KIND_UNSUPPORTED:${fact.factId}`);
      return [];
    }
    const resolvedTarget = additionalTarget(fact);
    if (!resolvedTarget) {
      reasons.push(`RESPONSIBILITY_TARGET_REQUIRED:${fact.factId}`);
      return [];
    }
    return [{
      responsibilityKey: `${fact.classification}:${fact.kind}:${fact.factId}`,
      foundationKey: null,
      classification: fact.classification,
      family: resolvedTarget.family,
      purpose: resolvedTarget.purpose,
      priority: fact.classification === "conditional_required" ? "required" : fact.classification,
      selectionTarget: resolvedTarget.selectionTarget,
      owningFactId: fact.factId,
      owningFactOwner: fact.owner,
      evidenceRefs: uniqueSorted([input.sourceProductRevisionId, input.goalFactId, input.modeFactId,
        fact.factId, ...fact.evidenceRefs]),
      requiredPrescriptionPurpose: resolvedTarget.requiredPrescriptionPurpose,
    }];
  });
  return Object.freeze({ definitions: Object.freeze(definitions), reasons: uniqueSorted(reasons) });
}

function inputReasons(input: ProductGetStrongerDevelopWeeklyPolicyInput): readonly string[] {
  const reasons: string[] = [];
  if (input.productLabel !== "get_stronger" || input.trainingMode !== "develop" || input.outcomeGoal !== "strength") {
    reasons.push("GET_STRONGER_DEVELOP_POLICY_SCOPE_REQUIRED");
  }
  if (![input.sourceProductRevisionId, input.goalFactId, input.modeFactId, input.experienceFactId]
    .every((value) => value.trim())) reasons.push("GET_STRONGER_DEVELOP_SOURCE_FACTS_REQUIRED");
  if (!Number.isInteger(input.availableOpportunityCount) || input.availableOpportunityCount < 0) {
    reasons.push("AVAILABLE_OPPORTUNITY_COUNT_INVALID");
  }
  const factIds = [...input.separatePlaneFacts.map((fact) => fact.factId),
    ...input.additionalResponsibilityFacts.map((fact) => fact.factId)];
  if (new Set(factIds).size !== factIds.length || factIds.some((id) => !id.trim())) {
    reasons.push("TYPED_RESPONSIBILITY_FACT_ID_INVALID");
  }
  if (input.separatePlaneFacts.some((fact) => fact.requiredPlanes[0] !== "horizontal" ||
      fact.requiredPlanes[1] !== "vertical" || fact.evidenceRefs.length === 0 ||
      !PRODUCT_GET_STRONGER_DEVELOP_RESPONSIBILITY_OWNERS.includes(fact.owner))) {
    reasons.push("SEPARATE_PLANE_FACT_INVALID");
  }
  if (new Set(input.separatePlaneFacts.map((fact) => fact.family)).size !== input.separatePlaneFacts.length) {
    reasons.push("DUPLICATE_SEPARATE_PLANE_FACT");
  }
  if (input.additionalResponsibilityFacts.some((fact) => fact.evidenceRefs.length === 0 ||
      !PRODUCT_GET_STRONGER_DEVELOP_RESPONSIBILITY_OWNERS.includes(fact.owner))) {
    reasons.push("RESPONSIBILITY_OWNING_FACT_REQUIRED");
  }
  if (input.loadingEvidence.some((entry) => !entry.evidenceId.trim() || !entry.responsibilityKey.trim() ||
      entry.sourceFactIds.length === 0 || !PRODUCTION_LOADING_COMPLETENESS_STATES.includes(entry.state)) ||
      new Set(input.loadingEvidence.map((entry) => entry.responsibilityKey)).size !== input.loadingEvidence.length) {
    reasons.push("LOADING_EVIDENCE_INVALID");
  }
  return uniqueSorted(reasons);
}

function invalidResult(reasons: readonly string[]): ProductGetStrongerDevelopWeeklyPolicyResult {
  return Object.freeze({ status: "invalid_input", policyReference: POLICY_REFERENCE,
    priorities: Object.freeze([]), responsibilityTraces: Object.freeze([]),
    unresolvedCapabilityRefs: Object.freeze([]), reasonCodes: uniqueSorted(reasons),
    decisionTrace: Object.freeze(["POLICY_INPUT_REJECTED", ...uniqueSorted(reasons), "NO_WEEKLY_RESPONSIBILITY_OUTPUT"]) });
}

export function applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1(
  input: ProductGetStrongerDevelopWeeklyPolicyInput,
): ProductGetStrongerDevelopWeeklyPolicyResult {
  const reasons = inputReasons(input);
  const additions = additionalDefinitions(input);
  if (reasons.length || additions.reasons.length) return invalidResult([...reasons, ...additions.reasons]);
  const loadingByKey = new Map(input.loadingEvidence.map((entry) => [entry.responsibilityKey, entry]));
  const definitions = [...foundationDefinitions(input), ...additions.definitions];
  const priorities = definitions.map((definition, priorityOrder): ProductionExplicitWeeklyPriority => {
    const requirements = executionRequirements({ responsibilityKey: definition.responsibilityKey,
      sourceFactIds: [input.sourceProductRevisionId, input.goalFactId, input.modeFactId,
        input.experienceFactId, definition.owningFactId],
      requiredPrescriptionPurpose: definition.requiredPrescriptionPurpose,
      loadingEvidence: loadingByKey.get(definition.responsibilityKey), advanced: input.experience === "advanced" });
    return Object.freeze({
      priorityId: `product:get-stronger:develop:${definition.responsibilityKey}`,
      family: definition.family,
      purpose: definition.purpose,
      target: definition.selectionTarget,
      priority: definition.priority,
      priorityOrder,
      sourceEvidence: Object.freeze([Object.freeze({ sourceKind: "reviewed_policy" as const,
        sourceId: `${PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE}:${definition.responsibilityKey}`,
        evidenceRefs: definition.evidenceRefs })]),
      goalRelationships: Object.freeze([Object.freeze({ goal: "strength" as const,
        relationship: "primary_weekly_goal" as const, sourceEvidenceRefs: definition.evidenceRefs })]),
      ...(definition.family === "direct" ? { exactActionOwnership: "exact_action" as const } : {}),
      ...(definition.priority === "optional" ? { uniqueMarginalValueRef: definition.owningFactId } : {}),
      executionRequirements: requirements,
    });
  });
  const traces = definitions.map((definition, index): ProductGetStrongerDevelopResponsibilityTrace => {
    const requirements = priorities[index]!.executionRequirements!;
    return Object.freeze({ responsibilityKey: definition.responsibilityKey,
      foundationKey: definition.foundationKey, classification: definition.classification,
      priorityId: priorities[index]!.priorityId, owningFactId: definition.owningFactId,
      owningFactOwner: definition.owningFactOwner,
      loadingCompletenessState: requirements.loadingCompletenessState,
      unresolvedCapabilityRefs: requirements.unresolvedCapabilityRefs,
      evidenceRefs: definition.evidenceRefs });
  });
  const result: ProductGetStrongerDevelopWeeklyPolicyResult = Object.freeze({
    status: "resolved",
    policyReference: POLICY_REFERENCE,
    priorities: Object.freeze(priorities),
    responsibilityTraces: Object.freeze(traces),
    unresolvedCapabilityRefs: uniqueSorted(priorities.flatMap((priority) =>
      priority.executionRequirements?.unresolvedCapabilityRefs ?? [])),
    reasonCodes: Object.freeze([]),
    decisionTrace: Object.freeze([
      "MODEL_C_ADAPTIVE_FOUNDATIONS_PLUS_TYPED_CONDITIONALS",
      "FOUR_FOUNDATIONS_REQUIRED_WITH_BROAD_PUSH_PULL_OR_SEMANTICS",
      "TARGET_EXPOSURE_PURSUED_BY_WEEK_POLICY",
      "CAPACITY_PERMITS_BUT_NEVER_CREATES_RESPONSIBILITY",
      "STABLE_CANONICAL_PRIORITY_ORDER_NO_AUTOMATIC_CROSS_WEEK_ROTATION",
      input.experience === "advanced" ?
        "ADVANCED_DOES_NOT_FABRICATE_HISTORY_LOAD_OR_PREREQUISITES" : "NO_HISTORY_OR_PREREQUISITES_FABRICATED",
      `AVAILABLE_OPPORTUNITIES_INFORMATIONAL_ONLY:${input.availableOpportunityCount}`,
    ]),
  });
  const outputReasons = validateProductGetStrongerDevelopWeeklyResponsibilityPolicyResult(result);
  return outputReasons.length ? invalidResult(outputReasons) : result;
}

const FORBIDDEN_OUTPUT_KEYS = new Set([
  "exerciseid", "exerciseids", "sets", "repetitions", "reps", "load", "loads", "split", "splitname",
  "warmup", "cooldown", "duration", "durationestimate", "selectedequipment", "equipmentid", "novelty",
  "rotation", "rotationrule", "nextweekprimary", "prerequisiteids", "satisfiedprerequisiteids",
  "productshadowactivated", "legacyproductactivated", "productactivated",
]);

function forbiddenOutputPaths(value: unknown, path = "result"): readonly string[] {
  if (!value || typeof value !== "object") return Object.freeze([]);
  if (Array.isArray(value)) return Object.freeze(value.flatMap((entry, index) =>
    forbiddenOutputPaths(entry, `${path}[${index}]`)));
  return Object.freeze(Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => [
    ...(FORBIDDEN_OUTPUT_KEYS.has(key.toLowerCase()) ? [`FORBIDDEN_PRODUCT_POLICY_OUTPUT:${path}.${key}`] : []),
    ...forbiddenOutputPaths(entry, `${path}.${key}`),
  ]));
}

export function validateProductGetStrongerDevelopWeeklyResponsibilityPolicyResult(
  result: ProductGetStrongerDevelopWeeklyPolicyResult,
): readonly string[] {
  const reasons: string[] = [...forbiddenOutputPaths(result)];
  if (result.policyReference.reference !== PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE ||
      result.policyReference.policyId !== PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID ||
      result.policyReference.version !== PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION) {
    reasons.push("GET_STRONGER_DEVELOP_POLICY_REFERENCE_INVALID");
  }
  if (result.status !== "resolved") return uniqueSorted(reasons);
  if (result.priorities.length !== result.responsibilityTraces.length ||
      new Set(result.priorities.map((priority) => priority.priorityId)).size !== result.priorities.length ||
      new Set(result.responsibilityTraces.map((trace) => trace.priorityId)).size !==
        result.responsibilityTraces.length) {
    reasons.push("RESPONSIBILITY_TRACE_OR_IDENTITY_INVALID");
  }
  const tracesByFoundation = new Map(PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS.map((key) =>
    [key, result.responsibilityTraces.filter((trace) => trace.foundationKey === key)] as const));
  for (const key of ["knee_dominant_squat", "hinge_hip_extension"] as const) {
    const traces = tracesByFoundation.get(key) ?? [];
    if (traces.length !== 1) reasons.push(`FOUNDATION_REQUIRED:${key}`);
  }
  for (const key of ["upper_push", "upper_pull"] as const) {
    const traces = tracesByFoundation.get(key) ?? [];
    const keys = traces.map((trace) => trace.responsibilityKey).sort();
    const broad = keys.length === 1 && keys[0] === `foundation:${key}`;
    const separate = keys.length === 2 && keys[0] === `foundation:${key}:horizontal` &&
      keys[1] === `foundation:${key}:vertical` && new Set(traces.map((trace) => trace.owningFactId)).size === 1;
    if (!broad && !separate) reasons.push(`BROAD_OR_SEPARATE_FOUNDATION_INVALID:${key}`);
  }
  for (const trace of result.responsibilityTraces) {
    const priority = result.priorities.find((entry) => entry.priorityId === trace.priorityId);
    if (!priority || !priority.executionRequirements || priority.sourceEvidence.some((source) =>
      source.sourceKind !== "reviewed_policy") || priority.executionRequirements.provenance.policyRef !==
      PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE) {
      reasons.push(`PRODUCT_POLICY_PROVENANCE_REQUIRED:${trace.responsibilityKey}`);
      continue;
    }
    if (trace.loadingCompletenessState !== priority.executionRequirements.loadingCompletenessState ||
        JSON.stringify([...trace.unresolvedCapabilityRefs].sort()) !==
          JSON.stringify([...priority.executionRequirements.unresolvedCapabilityRefs].sort())) {
      reasons.push(`LOADING_TRACE_MISMATCH:${trace.responsibilityKey}`);
    }
    if (trace.foundationKey && priority.priority !== "required") {
      reasons.push(`FOUNDATION_MUST_REMAIN_REQUIRED:${trace.foundationKey}`);
    }
    if (!trace.foundationKey && (!trace.owningFactId.trim() ||
        !PRODUCT_GET_STRONGER_DEVELOP_RESPONSIBILITY_OWNERS.includes(trace.owningFactOwner))) {
      reasons.push(`NONFOUNDATION_OWNING_FACT_REQUIRED:${trace.responsibilityKey}`);
    }
    const roles = [...priority.target.targetMovementRoles].sort();
    if (trace.foundationKey === "knee_dominant_squat" &&
        JSON.stringify(roles) !== JSON.stringify(["knee_dominant", "squat"])) {
      reasons.push("FOUNDATION_TARGET_INVALID:knee_dominant_squat");
    }
    if (trace.foundationKey === "hinge_hip_extension" && JSON.stringify(roles) !== JSON.stringify(["hinge"])) {
      reasons.push("FOUNDATION_TARGET_INVALID:hinge_hip_extension");
    }
    if (trace.foundationKey === "upper_push") {
      const expected = trace.responsibilityKey.endsWith(":horizontal") ? ["horizontal_push"] :
        trace.responsibilityKey.endsWith(":vertical") ? ["vertical_push"] : ["horizontal_push", "vertical_push"];
      if (JSON.stringify(roles) !== JSON.stringify(expected)) reasons.push("FOUNDATION_TARGET_INVALID:upper_push");
    }
    if (trace.foundationKey === "upper_pull") {
      const expected = trace.responsibilityKey.endsWith(":horizontal") ? ["horizontal_pull"] :
        trace.responsibilityKey.endsWith(":vertical") ? ["vertical_pull"] : ["horizontal_pull", "vertical_pull"];
      if (JSON.stringify(roles) !== JSON.stringify(expected)) reasons.push("FOUNDATION_TARGET_INVALID:upper_pull");
    }
    if (!priority.executionRequirements.developmentalCreditRequired) {
      reasons.push(`DEVELOPMENTAL_CREDIT_REQUIRED:${trace.responsibilityKey}`);
    }
    const expectedPurpose = priority.family === "strength" ? "strength_development" :
      priority.family === "muscle" ? "hypertrophy_development" :
        priority.family === "direct" ? "direct_development" :
          priority.family === "capacity" ? "capacity_development" : "technique_or_control";
    if (priority.executionRequirements.requiredPrescriptionPurpose !== expectedPurpose) {
      reasons.push(`REQUIRED_PRESCRIPTION_PURPOSE_INVALID:${trace.responsibilityKey}`);
    }
    if (!priority.executionRequirements.loadingSuitabilityRequired ||
        priority.executionRequirements.calibrationStateRequired !==
          (priority.executionRequirements.loadingCompletenessState !== "confirmed")) {
      reasons.push(`LOADING_EXECUTION_REQUIREMENT_INVALID:${trace.responsibilityKey}`);
    }
    const unresolved = priority.executionRequirements.loadingCompletenessState === "unresolved" ||
      priority.executionRequirements.loadingCompletenessState === "insufficient";
    if (unresolved && (priority.executionRequirements.unresolvedCapabilityDisposition !==
      "retained_blocks_approval" || priority.executionRequirements.unresolvedCapabilityRefs.length === 0)) {
      reasons.push(`UNMET_REQUIRED_RESPONSIBILITY_HIDDEN:${trace.responsibilityKey}`);
    }
  }
  const expectedUnresolved = uniqueSorted(result.priorities.flatMap((priority) =>
    priority.executionRequirements?.unresolvedCapabilityRefs ?? []));
  if (JSON.stringify(expectedUnresolved) !== JSON.stringify([...result.unresolvedCapabilityRefs].sort())) {
    reasons.push("UNRESOLVED_CAPABILITY_AGGREGATE_INCOMPLETE");
  }
  return uniqueSorted(reasons);
}
