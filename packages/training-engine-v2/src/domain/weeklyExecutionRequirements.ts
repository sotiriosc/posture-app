export const PRODUCTION_LOADING_COMPLETENESS_STATES = Object.freeze([
  "confirmed",
  "bounded_initial_calibration",
  "unresolved",
  "insufficient",
] as const);

export type ProductionLoadingCompletenessState =
  typeof PRODUCTION_LOADING_COMPLETENESS_STATES[number];

export const PRODUCTION_WEEKLY_REQUIRED_PRESCRIPTION_PURPOSES = Object.freeze([
  "strength_development",
  "hypertrophy_development",
  "direct_development",
  "capacity_development",
  "technique_or_control",
] as const);

export type ProductionWeeklyRequiredPrescriptionPurpose =
  typeof PRODUCTION_WEEKLY_REQUIRED_PRESCRIPTION_PURPOSES[number];

export interface ProductionWeeklyExecutionRequirements {
  readonly developmentalCreditRequired: boolean;
  readonly requiredPrescriptionPurpose: ProductionWeeklyRequiredPrescriptionPurpose;
  readonly loadingSuitabilityRequired: boolean;
  readonly calibrationStateRequired: boolean;
  readonly loadingCompletenessState: ProductionLoadingCompletenessState;
  readonly unresolvedCapabilityDisposition: "none" | "retained_blocks_approval";
  readonly unresolvedCapabilityRefs: readonly string[];
  readonly provenance: {
    readonly policyRef: string;
    readonly sourceFactIds: readonly string[];
    readonly ruleRefs: readonly string[];
  };
}

export function validateProductionWeeklyExecutionRequirements(
  requirements: ProductionWeeklyExecutionRequirements,
): readonly string[] {
  const reasons: string[] = [];
  if (!PRODUCTION_WEEKLY_REQUIRED_PRESCRIPTION_PURPOSES.includes(
    requirements.requiredPrescriptionPurpose,
  )) reasons.push("WEEKLY_EXECUTION_REQUIRED_PURPOSE_INVALID");
  if (!PRODUCTION_LOADING_COMPLETENESS_STATES.includes(requirements.loadingCompletenessState)) {
    reasons.push("WEEKLY_EXECUTION_LOADING_STATE_INVALID");
  }
  if (!requirements.provenance.policyRef.trim() || requirements.provenance.sourceFactIds.length === 0 ||
      requirements.provenance.ruleRefs.length === 0) {
    reasons.push("WEEKLY_EXECUTION_REQUIREMENTS_PROVENANCE_REQUIRED");
  }
  const unresolved = requirements.loadingCompletenessState === "unresolved" ||
    requirements.loadingCompletenessState === "insufficient";
  if (unresolved !== (requirements.unresolvedCapabilityDisposition === "retained_blocks_approval") ||
      unresolved !== (requirements.unresolvedCapabilityRefs.length > 0)) {
    reasons.push("WEEKLY_EXECUTION_UNRESOLVED_CAPABILITY_DISPOSITION_INVALID");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
