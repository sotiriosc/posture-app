import type { ProductionPostPrescriptionWeekValidationPolicy } from "./contracts";

export const POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_ID =
  "POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_VERSION = "1.0.0" as const;

const frequencyRules = Object.freeze([
  { purpose: "movement_development" as const, required: [1, 2, 3] as const, preferred: [0, 1, 2] as const, optional: [0, 1, 1] as const, sourceRuleId: "STRENGTH_S2_BALANCED" },
  { purpose: "muscle_development" as const, required: [1, 1, 2] as const, preferred: [0, 1, 2] as const, optional: [0, 1, 1] as const, sourceRuleId: "MUSCLE_H1_SINGLE_FLEXIBLE" },
  { purpose: "direct_action_development" as const, required: [1, 1, 1] as const, preferred: [0, 1, 1] as const, optional: [0, 1, 1] as const, sourceRuleId: "DIRECT_D1_ONCE" },
  { purpose: "assessment_priority_development" as const, required: [1, 1, 1] as const, preferred: [0, 1, 1] as const, optional: [0, 1, 1] as const, sourceRuleId: "ASSESSMENT_A1_SINGLE_CLUSTER" },
  { purpose: "capacity_development" as const, required: [1, 1, 1] as const, preferred: [0, 1, 1] as const, optional: [0, 1, 1] as const, sourceRuleId: "CAPACITY_C1_ONCE" },
  { purpose: "recovery_support" as const, required: [1, 1, 1] as const, preferred: [0, 1, 1] as const, optional: [0, 1, 1] as const, sourceRuleId: "RECOVERY_EXPLICIT_ONLY" },
]);

export const POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE:
ProductionPostPrescriptionWeekValidationPolicy = Object.freeze({
  policyId: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_ID,
  version: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_VERSION,
  state: "reviewed_not_activated",
  authority: "PRODUCTION_VALIDATION_POLICY",
  weekPolicyRef: Object.freeze({
    policyId: "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE",
    version: "1.0.0",
  }),
  frequencyRules,
  supportedPurposes: Object.freeze([
    "movement_development",
    "muscle_development",
    "direct_action_development",
    "assessment_priority_development",
    "capacity_development",
    "recovery_support",
  ] as const),
  unsupportedScopes: Object.freeze([
    "general_fitness_movement",
    "posture_movement_quality_frequency",
    "systemic_conditioning",
    "external_sport_load",
    "standalone_recovery_session_semantics",
    "phase_specific_weekly_overrides",
    "direct_secondary_numeric_dose_equivalence",
    "response_led_h2_distribution",
    "universal_recovery_spacing",
    "deload",
    "completed_exposure",
    "adaptation",
  ]),
  spacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING",
  h1Policy: "MUSCLE_H1_SINGLE_FLEXIBLE",
  h2Disposition: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE",
  automaticSelection: false,
  productionActivation: false,
  provenance: Object.freeze({
    source: "policy",
    sourceRef: "POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE@1.0.0",
  }),
});

export const POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION =
  Object.freeze({
    policyId: "POST_PRESCRIPTION_WEEK_VALIDATION_V1_CAUSAL_LEDGER_POLICY" as const,
    version: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.version,
    authority: "OWNER_SELECTED_DESIGN_EVIDENCE" as const,
    weekPolicyRef: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.weekPolicyRef,
    frequencyRules: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.frequencyRules,
    supportedPurposes: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.supportedPurposes,
    unsupportedScopes: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.unsupportedScopes,
    spacingPolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.spacingPolicy,
    h1Policy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.h1Policy,
    h2Disposition: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.h2Disposition,
    automaticSelection: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.automaticSelection,
    productionActivation: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.productionActivation,
    provenance: Object.freeze({
      source: "policy" as const,
      sourceRef: "POST_PRESCRIPTION_WEEK_VALIDATION_V1_CAUSAL_LEDGER_POLICY@1.0.0",
    }),
  });
