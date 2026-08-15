import { sameSemanticValue } from "./canonical";
import {
  WEEK_POLICY_CONFLICT,
  WEEK_POLICY_REQUIRED,
  WEEK_POLICY_UNAVAILABLE,
  type ProductionWeekFrequencyRule,
  type ProductionWeekObjectiveFamily,
  type ProductionPlanningObjectivePriority,
  type ProductionWeekPolicy,
  type ProductionWeekPolicyInput,
  type ProductionWeekPolicyRegistry,
  type ProductionWeekPlanningFrequencyIntent,
} from "./contracts";

export const PRODUCTION_WEEK_POLICY_V1_REFERENCE = Object.freeze({
  policyId: "PRODUCTION_WEEK_POLICY_V1_CAUSAL_CORE",
  version: "1.0.0",
} as const);

export const HISTORICAL_WEEK_POLICY_V1_COMPATIBILITY_LABEL = "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE" as const;

function rule(
  family: ProductionWeekFrequencyRule["family"],
  priority: ProductionPlanningObjectivePriority,
  values: readonly [number, number, number],
  ruleId: string,
): ProductionWeekFrequencyRule {
  return Object.freeze({
    family,
    priority,
    ruleId,
    frequency: Object.freeze({
      minimumAllocatedSessions: values[0],
      targetAllocatedSessions: values[1],
      softMaximumAllocatedSessions: values[2],
      sourceRef: `${PRODUCTION_WEEK_POLICY_V1_REFERENCE.policyId}@${PRODUCTION_WEEK_POLICY_V1_REFERENCE.version}:${ruleId}`,
    }),
  });
}

export const PRODUCTION_WEEK_POLICY_V1: ProductionWeekPolicy = Object.freeze({
  reference: PRODUCTION_WEEK_POLICY_V1_REFERENCE,
  historicalCompatibilityLabels: Object.freeze([HISTORICAL_WEEK_POLICY_V1_COMPATIBILITY_LABEL]),
  frequencyRules: Object.freeze([
    rule("strength", "required", [1, 2, 3], "STRENGTH_S2_REQUIRED"),
    rule("strength", "preferred", [0, 1, 2], "STRENGTH_S2_PREFERRED"),
    rule("strength", "optional", [0, 1, 1], "STRENGTH_S2_OPTIONAL"),
    rule("muscle", "required", [1, 1, 2], "MUSCLE_H1_REQUIRED"),
    rule("muscle", "preferred", [0, 1, 2], "MUSCLE_H1_PREFERRED"),
    rule("muscle", "optional", [0, 1, 1], "MUSCLE_H1_OPTIONAL"),
    rule("direct", "required", [1, 1, 1], "DIRECT_D1_REQUIRED"),
    rule("direct", "preferred", [0, 1, 1], "DIRECT_D1_PREFERRED"),
    rule("direct", "optional", [0, 1, 1], "DIRECT_D1_OPTIONAL"),
    rule("assessment", "required", [1, 1, 1], "ASSESSMENT_A1_REQUIRED"),
    rule("assessment", "preferred", [0, 1, 1], "ASSESSMENT_A1_PREFERRED"),
    rule("capacity", "required", [1, 1, 1], "CAPACITY_C1_REQUIRED"),
    rule("capacity", "preferred", [0, 1, 1], "CAPACITY_C1_PREFERRED"),
    rule("capacity", "optional", [0, 1, 1], "CAPACITY_C1_OPTIONAL"),
  ]),
  participationState: "advisory_only_no_executable_frequency",
  spacingState: "SPACING_R0_PRESCRIPTION_PENDING",
  supportedScopes: Object.freeze([
    "major_strength_movement_development:S2",
    "muscle_development:H1",
    "direct_action_or_muscle_development:D1",
    "assessment_priority:A1",
    "supported_capacity:C1",
    "participation_advisory:P0",
    "spacing_prescription_pending:R0",
  ]),
  unsupportedScopes: Object.freeze([
    "general_fitness_movement_frequency",
    "posture_movement_quality_frequency",
    "systemic_conditioning",
    "external_load_receiver",
    "standalone_recovery_session_semantics",
    "phase_specific_frequency_or_volume_override",
    "direct_secondary_numeric_equivalence",
    "response_led_h2_muscle_distribution",
    "universal_recovery_spacing",
    "deload_construction",
    "completed_exposure_interpretation",
    "adaptation",
  ]),
  provenance: Object.freeze({
    owner: "weekly_intent_planner",
    sourceRefs: Object.freeze(["WEEK_POLICY_V1_OWNER_ADMISSION", "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE"]),
    ruleRefs: Object.freeze(["S2", "H1", "D1", "A1", "C1", "P0", "R0"]),
  }),
});

export const PRODUCTION_WEEK_POLICY_REGISTRY_V1: ProductionWeekPolicyRegistry = Object.freeze({
  policies: Object.freeze([PRODUCTION_WEEK_POLICY_V1]),
});

export type ProductionWeekPolicyResolution =
  | { readonly status: "resolved"; readonly policy: ProductionWeekPolicy; readonly reasonCode: null }
  | { readonly status: "required"; readonly policy: null; readonly reasonCode: typeof WEEK_POLICY_REQUIRED }
  | { readonly status: "unavailable"; readonly policy: null; readonly reasonCode: typeof WEEK_POLICY_UNAVAILABLE }
  | { readonly status: "conflict"; readonly policy: null; readonly reasonCode: typeof WEEK_POLICY_CONFLICT };

export function resolveProductionWeekPolicy(
  input: ProductionWeekPolicyInput,
  registry?: ProductionWeekPolicyRegistry,
): ProductionWeekPolicyResolution {
  if (input === null) return Object.freeze({ status: "required", policy: null, reasonCode: WEEK_POLICY_REQUIRED });
  if ("frequencyRules" in input) return Object.freeze({ status: "resolved", policy: input, reasonCode: null });
  const matches = (registry?.policies ?? []).filter((policy) => sameSemanticValue(policy.reference, input));
  if (matches.length === 0) return Object.freeze({ status: "unavailable", policy: null, reasonCode: WEEK_POLICY_UNAVAILABLE });
  if (matches.length > 1) return Object.freeze({ status: "conflict", policy: null, reasonCode: WEEK_POLICY_CONFLICT });
  return Object.freeze({ status: "resolved", policy: matches[0]!, reasonCode: null });
}

export function resolveProductionWeekFrequency(
  policy: ProductionWeekPolicy,
  family: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing">,
  priority: ProductionPlanningObjectivePriority,
): ProductionWeekPlanningFrequencyIntent | null {
  return policy.frequencyRules.find((rule) => rule.family === family && rule.priority === priority)?.frequency ?? null;
}

export function productionWeekPolicyCompatibilityProjection(): Readonly<Record<string, unknown>> {
  return Object.freeze({
    policyId: HISTORICAL_WEEK_POLICY_V1_COMPATIBILITY_LABEL,
    version: PRODUCTION_WEEK_POLICY_V1.reference.version,
    sourcePolicy: PRODUCTION_WEEK_POLICY_V1.reference,
    strength: Object.freeze({ required: [1, 2, 3], preferred: [0, 1, 2], optional: [0, 1, 1] }),
    muscle: Object.freeze({ required: [1, 1, 2], preferred: [0, 1, 2], optional: [0, 1, 1] }),
    direct: Object.freeze({ required: [1, 1, 1], preferred: [0, 1, 1], optional: [0, 1, 1] }),
    assessment: Object.freeze({ required: [1, 1, 1], preferred: [0, 1, 1] }),
    capacity: Object.freeze({ required: [1, 1, 1], preferred: [0, 1, 1], optional: [0, 1, 1] }),
    participation: "PARTICIPATION_P0_NONE",
    spacing: "SPACING_R0_PRESCRIPTION_PENDING",
  });
}
