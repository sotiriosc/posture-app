export const PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_ID =
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1_LAYERED_PURPOSE_FIRST" as const;
export const PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_VERSION = "1.0.0" as const;
export const PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE =
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1_LAYERED_PURPOSE_FIRST@1.0.0" as const;
export const PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS =
  "OWNER_SELECTED_ARCHITECTURE_NOT_EXECUTABLE_POLICY" as const;

export const PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS = Object.freeze([
  "get_stronger",
  "build_muscle",
  "improve_fitness_and_stamina",
  "improve_posture_and_movement",
  "improve_athletic_performance",
] as const);
export type ProductGoalArchitectureProductLabel =
  typeof PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS[number];

export const PRODUCT_GOAL_ARCHITECTURE_PRIORITIES = Object.freeze([
  "primary", "secondary",
] as const);
export type ProductGoalArchitecturePriority =
  typeof PRODUCT_GOAL_ARCHITECTURE_PRIORITIES[number];

export const PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES = Object.freeze([
  "develop", "maintain", "return_or_rebuild",
] as const);
export type ProductGoalArchitectureTrainingMode =
  typeof PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES[number];

export const PRODUCT_GOAL_ARCHITECTURE_MAPPING_STATES = Object.freeze([
  "approved_direction_not_implemented",
  "exact_candidate_mapping",
  "structured_follow_up_required",
  "owner_policy_required",
  "future_owner_required",
  "intentionally_not_exposed",
  "unsupported",
] as const);
export type ProductGoalArchitectureMappingState =
  typeof PRODUCT_GOAL_ARCHITECTURE_MAPPING_STATES[number];

export const PRODUCT_GOAL_ARCHITECTURE_PURPOSE_POLICY_STATES = Object.freeze([
  "currently_supported",
  "future_policy_required",
  "context_only",
  "Product_follow_up_required",
  "body_composition_owner_required",
  "nutrition_owner_required",
] as const);
export type ProductGoalArchitecturePurposePolicyState =
  typeof PRODUCT_GOAL_ARCHITECTURE_PURPOSE_POLICY_STATES[number];

export const PRODUCT_GOAL_ARCHITECTURE_ACTIVATION_STATES = Object.freeze([
  "not_implemented",
  "shadow_only_future",
  "owner_account_future",
  "general_activation_future",
  "rejected",
] as const);
export type ProductGoalArchitectureActivationState =
  typeof PRODUCT_GOAL_ARCHITECTURE_ACTIVATION_STATES[number];

export const PRODUCT_GOAL_ARCHITECTURE_PURPOSE_FIRST_ORDER = Object.freeze([
  "weekly_objective",
  "session_need",
  "assignment_role",
  "section",
  "exercise_knowledge",
  "legal_dose_mode",
  "equipment_realization",
  "experience_familiarity_safety_response_context",
  "outcome_goal_as_bounded_context",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_PURPOSE_LANES = Object.freeze([
  "strength_development",
  "hypertrophy_development",
  "power_development",
  "muscular_endurance",
  "local_capacity",
  "systemic_conditioning",
  "movement_quality",
  "technique",
  "preparation",
  "activation",
  "recovery",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_CHUNKS = Object.freeze([
  "B1", "B2", "B3", "B4", "C", "D", "E", "F", "G", "H",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_CHUNK_STATES = Object.freeze([
  "completed_inert",
  "future_authorization_required",
  "future_owner_policy_required",
  "future_evidence_required",
  "future_default_off_only",
  "future_counterfactual_only",
  "future_owner_input_required",
  "separate_authorization_required",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH =
  "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md" as const;
export const PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT =
  "f72a901280feed39a5afced9e5f9b008d75776d01a5a2434e733a31526bd3457" as const;
export const PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY =
  "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTATION_AUTHORIZATION" as const;

export interface ProductGoalArchitectureLabelDirection {
  readonly label: ProductGoalArchitectureProductLabel;
  readonly displayDirection: string;
  readonly candidateOutcome: string | null;
  readonly mappingState: ProductGoalArchitectureMappingState;
  readonly currentProductOption: false;
  readonly runtimeMappingImplemented: false;
  readonly activationState: "not_implemented";
}

export interface ProductGoalArchitecturePolicyReference {
  readonly contractId: typeof PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_ID;
  readonly contractVersion: typeof PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_VERSION;
  readonly contractReference: typeof PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE;
}
