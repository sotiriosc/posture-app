import type { EvidenceProvenance } from "../../prescription/types";
import type {
  ProductionWeekObjectivePriority,
  SupportedProductionWeekObjectivePurpose,
} from "../sourceContracts";

export interface PostPrescriptionWeekValidationPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface ProductionPostPrescriptionWeekFrequencyRule {
  readonly purpose: SupportedProductionWeekObjectivePurpose;
  readonly required: readonly [minimum: number, target: number, softMaximum: number];
  readonly preferred: readonly [minimum: number, target: number, softMaximum: number];
  readonly optional: readonly [minimum: number, target: number, softMaximum: number];
  readonly sourceRuleId: string;
}

export interface ProductionPostPrescriptionWeekValidationPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly state: "reviewed_not_activated";
  readonly authority: "PRODUCTION_VALIDATION_POLICY";
  readonly weekPolicyRef: PostPrescriptionWeekValidationPolicyReference;
  readonly frequencyRules: readonly ProductionPostPrescriptionWeekFrequencyRule[];
  readonly supportedPurposes: readonly SupportedProductionWeekObjectivePurpose[];
  readonly unsupportedScopes: readonly string[];
  readonly spacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING";
  readonly h1Policy: "MUSCLE_H1_SINGLE_FLEXIBLE";
  readonly h2Disposition: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE";
  readonly automaticSelection: false;
  readonly productionActivation: false;
  readonly provenance: EvidenceProvenance;
}

export type ExplicitPostPrescriptionWeekValidationPolicyInput =
  | ProductionPostPrescriptionWeekValidationPolicy
  | PostPrescriptionWeekValidationPolicyReference
  | null;

export function frequencyRuleForPriority(
  rule: ProductionPostPrescriptionWeekFrequencyRule,
  priority: ProductionWeekObjectivePriority,
): readonly [number, number, number] {
  return priority === "required" ? rule.required : priority === "preferred" ? rule.preferred : rule.optional;
}
