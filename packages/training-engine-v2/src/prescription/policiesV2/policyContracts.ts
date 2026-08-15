import type { ExerciseDoseMode } from "../dose";
import type { PrescriptionPolicyReference, PrescriptionPolicyRuleVariant,
  PrescriptionPolicyUseCase, ProductionPrescriptionPolicyRule } from "../policies";
import type { EvidenceProvenance, ISODateTimeString } from "../types";

export const PRESCRIPTION_POLICY_V2_REFERENCE = Object.freeze({
  policyId: "PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE",
  version: "2.0.0",
} as const);

export const PRESCRIPTION_POLICY_V2_STATUS =
  "PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE_IMPLEMENTED_NOT_ACTIVATED" as const;

export const PRESCRIPTION_POLICY_V2_NEW_USE_CASES = Object.freeze([
  "secondary_hypertrophy",
  "movement_quality_main",
  "movement_quality_accessory",
  "muscular_endurance_main",
  "muscular_endurance_accessory",
] as const);
export type PrescriptionPolicyUseCaseV2 = PrescriptionPolicyUseCase |
  typeof PRESCRIPTION_POLICY_V2_NEW_USE_CASES[number];

export interface PrescriptionPolicyApplicabilityV2 {
  readonly useCase: PrescriptionPolicyUseCaseV2;
  readonly doseMode: ExerciseDoseMode;
  readonly variant: PrescriptionPolicyRuleVariant;
}

export type ProductionPrescriptionPolicyRuleV2 = Omit<
  ProductionPrescriptionPolicyRule,
  "applicability"
> & { readonly applicability: PrescriptionPolicyApplicabilityV2 };

export interface ProductionPrescriptionPolicyV2 {
  readonly policyId: typeof PRESCRIPTION_POLICY_V2_REFERENCE.policyId;
  readonly version: typeof PRESCRIPTION_POLICY_V2_REFERENCE.version;
  readonly state: "reviewed_not_activated";
  readonly reviewer: string;
  readonly reviewedAt: ISODateTimeString;
  readonly philosophy: string;
  readonly specificityOrder: readonly string[];
  readonly inheritedPolicyReference: PrescriptionPolicyReference;
  readonly inheritedRuleCount: number;
  readonly rules: readonly ProductionPrescriptionPolicyRuleV2[];
  readonly conflicts: readonly never[];
  readonly provenance: EvidenceProvenance;
  readonly activationAuthorized: false;
}

export interface PurposeSpecificPolicyCandidate {
  readonly candidateId: "SH1" | "SH2" | "SH3" | "MQ1" | "MQ2" | "MQ3" |
    "ME1" | "ME2" | "ME3";
  readonly family: "secondary_hypertrophy" | "movement_quality" | "muscular_endurance";
  readonly ownerPreferred: boolean;
  readonly evidenceEnvelope: readonly string[];
  readonly consequenceBounds: readonly string[];
}
