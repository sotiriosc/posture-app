import { validateGoalLocalPurposeCompatibility } from "../../goalPurposePolicy";
import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  purposeFirstPrescriptionResolverV1 } from "../purposeResolution";
import type { ProductionPrescriptionPurposeRequirement } from "../purposeResolution";
import type { PrescriptionPolicyUseCaseV2 } from "../policiesV2";
import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
  type ProductionPrescriptionPurposeResolutionResultV1_1,
  type PurposeFirstPrescriptionResolutionInputV1_1 } from "./contracts";
import { resolvePrescriptionPurposeResolverPolicyV1_1 } from "./policy";
import { validatePrescriptionPurposeResolverPolicyV1_1 } from "./validation";

const authorityRank = { primary_local_purpose: 0, secondary_local_purpose: 1,
  dependency_support: 2, cross_goal_support: 3, context_only: 4, unknown: 5 } as const;
const priorityRank = { required: 0, preferred: 1, optional: 2 } as const;

function drivingRequirement(input: PurposeFirstPrescriptionResolutionInputV1_1,
  selectedPurpose: string | null): ProductionPrescriptionPurposeRequirement | null {
  return [...(input.snapshot?.requirements ?? [])].filter((entry) =>
    entry.targetAssignmentHandoffId === input.assignmentHandoffId &&
    entry.localPurpose === selectedPurpose &&
    (entry.purposeAuthority === "primary_local_purpose" ||
      entry.purposeAuthority === "secondary_local_purpose" ||
      entry.purposeAuthority === "dependency_support"))
    .sort((left, right) => authorityRank[left.purposeAuthority] - authorityRank[right.purposeAuthority] ||
      priorityRank[left.priority] - priorityRank[right.priority] ||
      left.priorityOrder - right.priorityOrder || left.requirementId.localeCompare(right.requirementId))[0] ?? null;
}

function newUseCase(input: PurposeFirstPrescriptionResolutionInputV1_1,
  purpose: string): { readonly useCase: PrescriptionPolicyUseCaseV2 | null; readonly reason: string | null } {
  if (input.selectedDoseMode !== "repetition_sets") return { useCase: null,
    reason: purpose === "movement_quality_development" ? "MOVEMENT_QUALITY_MODE_POLICY_REQUIRED" :
      "PURPOSE_REPETITION_SET_MODE_REQUIRED" };
  const main = input.section === "main" &&
    (input.role === "primary_strength" || input.role === "secondary_strength");
  const accessory = input.section === "accessory" && input.role === "hypertrophy_accessory";
  if (purpose === "hypertrophy_development" && input.role === "secondary_strength" &&
      (input.section === "main" || input.section === "accessory")) {
    return { useCase: "secondary_hypertrophy", reason: null };
  }
  if (purpose === "movement_quality_development") {
    return main ? { useCase: "movement_quality_main", reason: null } : accessory ?
      { useCase: "movement_quality_accessory", reason: null } :
      { useCase: null, reason: "MOVEMENT_QUALITY_ROLE_SECTION_INCOMPATIBLE" };
  }
  if (purpose === "muscular_endurance_development") {
    return main ? { useCase: "muscular_endurance_main", reason: null } : accessory ?
      { useCase: "muscular_endurance_accessory", reason: null } :
      { useCase: null, reason: "MUSCULAR_ENDURANCE_ROLE_SECTION_INCOMPATIBLE" };
  }
  return { useCase: null, reason: `PURPOSE_POLICY_REQUIRED:${purpose}` };
}

export function purposeFirstPrescriptionResolverV1_1(
  input: PurposeFirstPrescriptionResolutionInputV1_1,
): ProductionPrescriptionPurposeResolutionResultV1_1 {
  const policyResolution = resolvePrescriptionPurposeResolverPolicyV1_1({
    policy: input.policy, availablePolicies: input.availablePolicies,
  });
  if (!policyResolution.policy) {
    const status = policyResolution.status === "required" ? "prescription_purpose_policy_required" :
      policyResolution.status === "unavailable" ? "prescription_purpose_policy_unavailable" :
        "prescription_purpose_policy_conflict";
    return Object.freeze({
      ...purposeFirstPrescriptionResolverV1({ ...input,
        policy: policyResolution.status === "conflict" ? null : PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
        availablePolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1] }),
      status,
      failedSubgate: "P0_contract_and_resolver_policy_truth",
      resolverPolicy: null,
      selectedUseCase: null,
      unresolvedPolicyRefs: Object.freeze([`RESOLVER_POLICY_V1_1_${policyResolution.status.toUpperCase()}`]),
    });
  }
  const policyIssues = validatePrescriptionPurposeResolverPolicyV1_1(policyResolution.policy);
  if (policyIssues.length > 0) {
    return Object.freeze({
      ...purposeFirstPrescriptionResolverV1({ ...input, policy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
        availablePolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1] }),
      status: "prescription_purpose_policy_unavailable",
      failedSubgate: "P0_contract_and_resolver_policy_truth",
      resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
      selectedUseCase: null,
      unresolvedPolicyRefs: policyIssues,
    });
  }
  const baseline = purposeFirstPrescriptionResolverV1({
    ...input,
    policy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
    availablePolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1],
  });
  const selected = drivingRequirement(input, baseline.selectedPrimaryPurpose);
  if (baseline.selectedPrimaryPurpose === "power_development" ||
      baseline.selectedPrimaryPurpose === "systemic_conditioning_development") {
    const reason = baseline.selectedPrimaryPurpose === "power_development" ?
      "POWER_DEVELOPMENT_POLICY_REQUIRED" : "SYSTEMIC_CONDITIONING_POLICY_REQUIRED";
    return Object.freeze({ ...baseline,
      status: "prescription_purpose_policy_required",
      resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
      selectedUseCase: null,
      unresolvedPolicyRefs: Object.freeze([reason]),
      conflicts: Object.freeze([reason]),
    });
  }
  if (selected) {
    const relationship = selected.sourceGoalRelationships.find((entry) => entry.goal === input.outcomeGoal);
    const compatibility = validateGoalLocalPurposeCompatibility({
      outcomeGoal: input.outcomeGoal,
      localPurpose: selected.localPurpose,
      purposeAuthority: selected.purposeAuthority,
      goalRelationship: relationship?.relationship ?? "cross_goal_support",
      programmingContextModes: input.programmingContextModes,
      requestedSystemicScope: input.requestedSystemicScope ?? false,
    });
    if (compatibility.status !== "compatible") {
      return Object.freeze({ ...baseline,
        status: "prescription_purpose_goal_relationship_conflict",
        failedSubgate: "P5_equipment_context_and_goal_compatibility",
        resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
        selectedUseCase: null,
        conflicts: compatibility.reasonCodes,
      });
    }
  }
  if (baseline.status === "purpose_resolved") {
    return Object.freeze({ ...baseline,
      resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
      selectedUseCase: baseline.selectedUseCase,
    });
  }
  if (!baseline.selectedPrimaryPurpose || !selected ||
      baseline.status !== "prescription_purpose_policy_required") {
    return Object.freeze({ ...baseline,
      resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
      selectedUseCase: null,
    });
  }
  const mapping = newUseCase(input, baseline.selectedPrimaryPurpose);
  if (!mapping.useCase) return Object.freeze({ ...baseline,
    status: mapping.reason?.includes("ROLE_SECTION") ?
      "prescription_purpose_role_section_conflict" : "prescription_purpose_policy_required",
    resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
    selectedUseCase: null,
    conflicts: Object.freeze(mapping.reason ? [mapping.reason] : []),
    unresolvedPolicyRefs: Object.freeze(mapping.reason ? [mapping.reason] : []),
  });
  const admitted = policyResolution.policy.supportedMappings.some((entry) =>
    entry.localPurpose === baseline.selectedPrimaryPurpose && entry.sections.includes(input.section) &&
    entry.roles.includes(input.role) && entry.doseModes.includes(input.selectedDoseMode!) &&
    entry.useCases.includes(mapping.useCase!));
  return Object.freeze({ ...baseline,
    status: admitted ? "purpose_resolved" : "prescription_purpose_policy_unavailable",
    failedSubgate: admitted ? null : "P6_supported_use_case_mapping",
    resolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_REFERENCE,
    selectedUseCase: admitted ? mapping.useCase : null,
    fallbackApplied: false,
    structuralCompatibilityTrace: Object.freeze([
      `SECTION:${input.section}`, `ROLE:${input.role}`,
      `PURPOSE:${baseline.selectedPrimaryPurpose}`, `USE_CASE:${mapping.useCase}`,
    ]),
  });
}
