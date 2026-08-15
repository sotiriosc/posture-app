import type { ExerciseDoseMode } from "../dose";
import type { PrescriptionPolicyUseCaseV2 } from "../policiesV2";
import type { PurposeFirstPrescriptionResolutionInput,
  ProductionPrescriptionPurposeResolutionResult } from "../purposeResolution";
import type { PrescriptionLocalPurpose } from "../purposeResolution/vocabularies";
import type { SessionSection, TrainingRole } from "../../domain/session";

export const PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE = Object.freeze({
  policyId: "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_SUPPORTED_CORE",
  version: "1.1.0",
} as const);

export interface PrescriptionPurposeSupportedMappingV1_1 {
  readonly mappingId: string;
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly sections: readonly SessionSection[];
  readonly roles: readonly TrainingRole[];
  readonly doseModes: readonly ExerciseDoseMode[];
  readonly useCases: readonly PrescriptionPolicyUseCaseV2[];
}

export interface ProductionPrescriptionPurposeResolverPolicyV1_1 {
  readonly reference: typeof PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE;
  readonly state: "OWNER_SELECTED_RESOLUTION_POLICY_IMPLEMENTED_NOT_ACTIVATED";
  readonly inheritedPolicyReference: { readonly policyId: string; readonly version: string };
  readonly inheritedMappings: readonly PrescriptionPurposeSupportedMappingV1_1[];
  readonly addedMappings: readonly PrescriptionPurposeSupportedMappingV1_1[];
  readonly supportedMappings: readonly PrescriptionPurposeSupportedMappingV1_1[];
  readonly unsupportedPurposes: readonly PrescriptionLocalPurpose[];
  readonly noBroadFallback: true;
  readonly goalCreatesPurpose: false;
  readonly activationAuthorized: false;
}

export type ExplicitPrescriptionPurposeResolverPolicyV1_1Input =
  | ProductionPrescriptionPurposeResolverPolicyV1_1
  | typeof PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE
  | null;

export interface PurposeFirstPrescriptionResolutionInputV1_1 extends Omit<
  PurposeFirstPrescriptionResolutionInput,
  "policy" | "availablePolicies"
> {
  readonly policy: ExplicitPrescriptionPurposeResolverPolicyV1_1Input;
  readonly availablePolicies?: readonly ProductionPrescriptionPurposeResolverPolicyV1_1[];
  readonly requestedSystemicScope?: boolean;
}

export type ProductionPrescriptionPurposeResolutionResultV1_1 = Omit<
  ProductionPrescriptionPurposeResolutionResult,
  "resolverPolicy" | "selectedUseCase"
> & {
  readonly resolverPolicy: typeof PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE | null;
  readonly selectedUseCase: PrescriptionPolicyUseCaseV2 | null;
};
