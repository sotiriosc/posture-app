import type { ExerciseDoseMode, NumericTarget } from "../dose";
import type { EffortTarget } from "../executionStandard";
import type { EvidenceProvenance, ISODateTimeString } from "../types";

export const PRESCRIPTION_POLICY_SPECIFICITY_ORDER = [
  "training_safety_authority",
  "hard_contraindication_and_explicit_restriction",
  "exercise_knowledge_legality",
  "unresolved_pain_or_response_requirement",
  "assignment_section_and_role",
  "selected_dose_mode",
  "explicit_session_goal",
  "current_equipment_realization",
  "continuity_or_prior_prescription",
  "experience_and_familiarity",
  "structural_capacity",
  "phase_applicability",
  "broad_v1_default",
] as const;

export type PrescriptionPolicySpecificityLevel =
  (typeof PRESCRIPTION_POLICY_SPECIFICITY_ORDER)[number];

export interface PrescriptionPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export type PrescriptionPolicyUseCase =
  | "preparation"
  | "activation"
  | "main_strength"
  | "secondary_strength"
  | "main_hypertrophy"
  | "hypertrophy_accessory"
  | "direct_accessory"
  | "timed_hold"
  | "breath_cycles"
  | "capacity_carry"
  | "accessory_carry"
  | "supporting_stationary_march"
  | "developmental_stationary_march"
  | "supporting_counted_steps"
  | "developmental_counted_steps"
  | "recovery_cooldown";

export type PrescriptionPolicyRuleVariant =
  | "default"
  | "standard"
  | "regression"
  | "scoped_override"
  | "required"
  | "preferred_optional"
  | "count_realization"
  | "duration_realization"
  | "count_realization_scoped_override"
  | "duration_realization_scoped_override";

export type PrescriptionPolicyCountUnit = "sets" | "rounds" | "trips";

export interface PrescriptionPolicyDoseRuleValue {
  readonly unit: PrescriptionPolicyCountUnit;
  readonly count: NumericTarget<"count">;
  readonly repetitions?: NumericTarget<"count">;
  readonly duration?: NumericTarget<"seconds">;
  readonly breathCycles?: NumericTarget<"breath_cycles">;
  readonly distance?: NumericTarget<"metres">;
  readonly steps?: NumericTarget<"steps">;
  readonly effort: EffortTarget;
  readonly betweenUnitsRest: NumericTarget<"seconds"> | null;
  readonly perSide?: boolean;
}

export interface PrescriptionPolicyApplicability {
  readonly useCase: PrescriptionPolicyUseCase;
  readonly doseMode: ExerciseDoseMode;
  readonly variant: PrescriptionPolicyRuleVariant;
}

export interface ProductionPrescriptionPolicyRule {
  readonly ruleId: string;
  readonly kind: "dose_rule";
  readonly specificityLevel: PrescriptionPolicySpecificityLevel;
  readonly applicability: PrescriptionPolicyApplicability;
  readonly value: PrescriptionPolicyDoseRuleValue;
  readonly overrideOfRuleIds: readonly string[];
  readonly conflictsWithRuleIds: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export interface ProductionPrescriptionPolicyConflict {
  readonly conflictId: string;
  readonly leftRuleId: string;
  readonly rightRuleId: string;
  readonly authority: "equal" | "ordered";
  readonly resolution: "unresolved" | "left_overrides" | "right_overrides";
  readonly provenance: EvidenceProvenance;
}

export interface ProductionPrescriptionPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly state: "reviewed_not_activated";
  readonly reviewer: string;
  readonly reviewedAt: ISODateTimeString;
  readonly philosophy: string;
  readonly specificityOrder: readonly PrescriptionPolicySpecificityLevel[];
  readonly rules: readonly ProductionPrescriptionPolicyRule[];
  readonly conflicts: readonly ProductionPrescriptionPolicyConflict[];
  readonly provenance: EvidenceProvenance;
  readonly activationAuthorized: false;
}

export interface ResolvedPrescriptionPolicyRuleTrace {
  readonly ruleId: string;
  readonly policyRef: PrescriptionPolicyReference;
  readonly applicabilityEvidence: readonly string[];
  readonly specificityLevel: PrescriptionPolicySpecificityLevel;
  readonly specificity: number;
  readonly overriddenRuleIds: readonly string[];
  readonly resolvedDimension: string;
  readonly provenance: EvidenceProvenance;
}

export interface RejectedPrescriptionPolicyRuleTrace {
  readonly ruleId: string;
  readonly reasonCode:
    | "RULE_USE_CASE_NOT_APPLICABLE"
    | "RULE_DOSE_MODE_NOT_APPLICABLE"
    | "RULE_VARIANT_NOT_APPLICABLE"
    | "RULE_OVERRIDDEN_BY_HIGHER_SPECIFICITY"
    | "RULE_CONFLICT_UNRESOLVED";
  readonly provenance: EvidenceProvenance;
}
