import type { ExerciseDoseMode } from "../dose";
import type { PrescriptionPolicyUseCase } from "../policies";
import { uniqueSorted } from "../compiler/utilities";
import { PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  type ProductionPrescriptionPurposeRequirement,
  type ProductionPrescriptionPurposeResolutionResult,
  type PurposeFirstPrescriptionResolutionInput } from "./contracts";
import { resolvePrescriptionPurposeResolverPolicy } from "./policy";
import { validateProductionPrescriptionPurposeEvidenceSnapshot,
  validateProductionPrescriptionPurposeResolverPolicy } from "./validation";
import type { PrescriptionLocalPurpose, PrescriptionPurposeResolutionStatus } from "./vocabularies";

const priorityRank = { required: 0, preferred: 1, optional: 2 } as const;
const authorityRank = {
  primary_local_purpose: 0,
  secondary_local_purpose: 1,
  dependency_support: 2,
  cross_goal_support: 3,
  context_only: 4,
  unknown: 5,
} as const;

function baseResult(
  input: PurposeFirstPrescriptionResolutionInput,
  status: PrescriptionPurposeResolutionStatus,
  options: Partial<ProductionPrescriptionPurposeResolutionResult> & {
    readonly failedSubgate: string | null;
  },
): ProductionPrescriptionPurposeResolutionResult {
  const requirements = input.snapshot?.requirements.filter((entry) =>
    entry.targetAssignmentHandoffId === input.assignmentHandoffId) ?? [];
  return Object.freeze({
    resolverContract: PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
    resolverPolicy: options.resolverPolicy ?? null,
    status,
    failedSubgate: options.failedSubgate,
    assignmentHandoffId: input.assignmentHandoffId,
    selectedPrimaryPurpose: options.selectedPrimaryPurpose ?? null,
    supportingPurposes: options.supportingPurposes ?? Object.freeze([]),
    crossGoalPurposes: options.crossGoalPurposes ?? Object.freeze([]),
    selectedUseCase: options.selectedUseCase ?? null,
    section: input.section,
    role: input.role,
    selectedDoseMode: input.selectedDoseMode,
    sourceRequirementIds: options.sourceRequirementIds ?? Object.freeze(requirements.map((entry) =>
      entry.requirementId).sort()),
    sourceObjectiveIds: options.sourceObjectiveIds ?? Object.freeze(uniqueSorted(requirements.flatMap((entry) =>
      entry.sourceWeeklyObjectiveId ? [entry.sourceWeeklyObjectiveId] : []))),
    sourceNeedIds: options.sourceNeedIds ?? Object.freeze(uniqueSorted(requirements.flatMap((entry) =>
      entry.targetSessionNeedIds))),
    goalRelationshipTrace: options.goalRelationshipTrace ?? Object.freeze(requirements.flatMap((entry) =>
      entry.sourceGoalRelationships.map((relationship) =>
        `${entry.requirementId}:${relationship.goal}:${relationship.relationship}`)).sort()),
    structuralCompatibilityTrace: options.structuralCompatibilityTrace ?? Object.freeze([
      `SECTION:${input.section}`, `ROLE:${input.role}`,
    ]),
    exerciseKnowledgeTrace: options.exerciseKnowledgeTrace ?? Object.freeze([
      `KNOWLEDGE:${input.exerciseKnowledgeRef}`,
      ...input.legalDoseModes.map((mode) => `LEGAL_MODE:${mode}`),
    ]),
    equipmentTrace: options.equipmentTrace ?? input.equipmentTrace,
    contextTrace: options.contextTrace ?? Object.freeze([
      ...input.programmingContextModes.map((mode) => `PROGRAMMING_CONTEXT:${mode}`),
      `OUTCOME_GOAL_BOUNDED_CONTEXT:${input.outcomeGoal}`,
    ]),
    excludedRequirements: options.excludedRequirements ?? input.snapshot?.excludedRequirements ?? Object.freeze([]),
    conflicts: options.conflicts ?? Object.freeze([]),
    unresolvedPolicyRefs: options.unresolvedPolicyRefs ?? Object.freeze([]),
    fallbackApplied: false,
    provenance: options.provenance ?? Object.freeze({
      owner: "typed_dependency_owner",
      sourceRefs: Object.freeze([input.snapshot?.snapshotRevisionId ?? "snapshot:missing",
        input.assignmentHandoffId]),
      ruleRefs: Object.freeze(["G4_PURPOSE_FIRST", "G1_FAIL_CLOSED", "NO_BROAD_FALLBACK"]),
    }),
  });
}

function policyFailureStatus(status: "required" | "unavailable" | "conflict"):
PrescriptionPurposeResolutionStatus {
  if (status === "required") return "prescription_purpose_policy_required";
  if (status === "unavailable") return "prescription_purpose_policy_unavailable";
  return "prescription_purpose_policy_conflict";
}

function sortedRequirements(requirements: readonly ProductionPrescriptionPurposeRequirement[]) {
  return [...requirements].sort((left, right) =>
    authorityRank[left.purposeAuthority] - authorityRank[right.purposeAuthority] ||
    priorityRank[left.priority] - priorityRank[right.priority] ||
    left.priorityOrder - right.priorityOrder ||
    left.requirementId.localeCompare(right.requirementId));
}

function selectDrivingRequirement(requirements: readonly ProductionPrescriptionPurposeRequirement[]): {
  readonly selected: ProductionPrescriptionPurposeRequirement | null;
  readonly conflict: readonly ProductionPrescriptionPurposeRequirement[];
} {
  const candidates = sortedRequirements(requirements.filter((entry) =>
    entry.reviewState !== "unknown" && entry.reviewState !== "rejected" &&
    entry.localPurpose !== "unknown" &&
    (entry.purposeAuthority === "primary_local_purpose" ||
      entry.purposeAuthority === "secondary_local_purpose" ||
      entry.purposeAuthority === "dependency_support")));
  const first = candidates[0];
  if (!first) return { selected: null, conflict: [] };
  const tied = candidates.filter((entry) => authorityRank[entry.purposeAuthority] ===
      authorityRank[first.purposeAuthority] && priorityRank[entry.priority] === priorityRank[first.priority] &&
      entry.priorityOrder === first.priorityOrder);
  const uniquePurposes = new Set(tied.map((entry) => entry.localPurpose));
  return uniquePurposes.size > 1 ? { selected: null, conflict: tied } : { selected: first, conflict: [] };
}

function supportedUseCase(input: PurposeFirstPrescriptionResolutionInput,
  requirement: ProductionPrescriptionPurposeRequirement): {
  readonly useCase: PrescriptionPolicyUseCase | null;
  readonly status: PrescriptionPurposeResolutionStatus | null;
  readonly reason: string | null;
} {
  const purpose = requirement.localPurpose;
  const section = input.section;
  const role = input.role;
  const mode = input.selectedDoseMode as ExerciseDoseMode;
  if (purpose === "preparation") {
    if (section !== "warmup" || role !== "preparation") return { useCase: null,
      status: "prescription_purpose_role_section_conflict", reason: "PREPARATION_PLACEMENT_INVALID" };
    return { useCase: mode === "step_march" ? "supporting_stationary_march" : "preparation",
      status: null, reason: null };
  }
  if (purpose === "activation") {
    if (section !== "activation" || role !== "activation") return { useCase: null,
      status: "prescription_purpose_role_section_conflict", reason: "ACTIVATION_PLACEMENT_INVALID" };
    return { useCase: mode === "step_march" ? "supporting_stationary_march" : "activation",
      status: null, reason: null };
  }
  if (purpose === "recovery") {
    return section === "cooldown" && role === "recovery"
      ? { useCase: "recovery_cooldown", status: null, reason: null }
      : { useCase: null, status: "prescription_purpose_role_section_conflict",
        reason: "RECOVERY_PLACEMENT_INVALID" };
  }
  if (purpose === "strength_development") {
    if (mode !== "repetition_sets") return { useCase: null,
      status: "prescription_purpose_dose_mode_unsupported", reason: "STRENGTH_REPETITION_MODE_REQUIRED" };
    if (section === "main" && role === "primary_strength") return { useCase: "main_strength", status: null, reason: null };
    if ((section === "main" || section === "accessory") && role === "secondary_strength") {
      return { useCase: "secondary_strength", status: null, reason: null };
    }
    return { useCase: null, status: "prescription_purpose_role_section_conflict",
      reason: "STRENGTH_ROLE_SECTION_INCOMPATIBLE" };
  }
  if (purpose === "hypertrophy_development") {
    if (mode !== "repetition_sets") return { useCase: null,
      status: "prescription_purpose_dose_mode_unsupported", reason: "HYPERTROPHY_REPETITION_MODE_REQUIRED" };
    if (section === "main" && role === "primary_strength") return { useCase: "main_hypertrophy", status: null, reason: null };
    if (section === "accessory" && role === "hypertrophy_accessory") {
      return { useCase: "hypertrophy_accessory", status: null, reason: null };
    }
    if (role === "secondary_strength") return { useCase: null,
      status: "prescription_purpose_policy_required", reason: "SECONDARY_HYPERTROPHY_POLICY_REQUIRED" };
    return { useCase: null, status: "prescription_purpose_role_section_conflict",
      reason: "HYPERTROPHY_ROLE_SECTION_INCOMPATIBLE" };
  }
  if (purpose === "direct_development") {
    return section === "accessory" && role === "hypertrophy_accessory" && mode === "repetition_sets"
      ? { useCase: "direct_accessory", status: null, reason: null }
      : { useCase: null, status: "prescription_purpose_role_section_conflict",
        reason: "DIRECT_ACCESSORY_OWNERSHIP_REQUIRED" };
  }
  if (purpose === "capacity_development") {
    if (role !== "capacity" || (section !== "main" && section !== "accessory")) return { useCase: null,
      status: "prescription_purpose_role_section_conflict", reason: "CAPACITY_ROLE_SECTION_INCOMPATIBLE" };
    if (mode === "distance_carry" || mode === "timed_carry") {
      const expected = section === "main" ? "capacity_main" : "accessory";
      if (input.context.carryPurpose !== expected) return { useCase: null,
        status: "prescription_purpose_goal_relationship_conflict", reason: "CARRY_PURPOSE_CONTEXT_CONFLICT" };
      return { useCase: section === "main" ? "capacity_carry" : "accessory_carry", status: null, reason: null };
    }
    if (mode === "step_march") return { useCase: "developmental_stationary_march", status: null, reason: null };
    if (mode === "step_sets") return { useCase: "developmental_counted_steps", status: null, reason: null };
    if (mode === "timed_hold") return { useCase: "timed_hold", status: null, reason: null };
    return { useCase: null, status: "prescription_purpose_policy_required",
      reason: "CAPACITY_REALIZATION_POLICY_REQUIRED" };
  }
  if (purpose === "technique_or_control") {
    if (mode === "step_march" && (section === "warmup" || section === "activation")) {
      return { useCase: "supporting_stationary_march", status: null, reason: null };
    }
    if (mode === "step_sets" && (section === "warmup" || section === "activation")) {
      return { useCase: "supporting_counted_steps", status: null, reason: null };
    }
    if (mode === "timed_hold") return { useCase: "timed_hold", status: null, reason: null };
    if (mode === "breath_cycles") return { useCase: "breath_cycles", status: null, reason: null };
    return { useCase: null, status: "prescription_purpose_policy_required",
      reason: "TECHNIQUE_CONTROL_MODE_POLICY_REQUIRED" };
  }
  return { useCase: null, status: "prescription_purpose_policy_required",
    reason: `FUTURE_PURPOSE_POLICY_REQUIRED:${purpose}` };
}

export function purposeFirstPrescriptionResolverV1(
  input: PurposeFirstPrescriptionResolutionInput,
): ProductionPrescriptionPurposeResolutionResult {
  const policyResult = resolvePrescriptionPurposeResolverPolicy({
    policy: input.policy, availablePolicies: input.availablePolicies,
  });
  if (!policyResult.policy) return baseResult(input, policyFailureStatus(policyResult.status as
    "required" | "unavailable" | "conflict"), {
    failedSubgate: "P0_contract_and_resolver_policy_truth",
    conflicts: policyResult.status === "conflict" ? policyResult.trace : [],
    unresolvedPolicyRefs: policyResult.trace,
  });
  const policyIssues = validateProductionPrescriptionPurposeResolverPolicy(policyResult.policy);
  if (policyIssues.length > 0) return baseResult(input, "prescription_purpose_policy_unavailable", {
    failedSubgate: "P0_contract_and_resolver_policy_truth",
    resolverPolicy: { policyId: policyResult.policy.policyId, version: policyResult.policy.version },
    unresolvedPolicyRefs: policyIssues,
  });
  const policyRef = { policyId: policyResult.policy.policyId, version: policyResult.policy.version };
  if (!input.snapshot) return baseResult(input, "prescription_purpose_required", {
    failedSubgate: "P1_source_snapshot_and_lineage_truth", resolverPolicy: policyRef,
  });
  const snapshotIssues = validateProductionPrescriptionPurposeEvidenceSnapshot(input.snapshot);
  if (input.snapshot.athleteId !== input.athleteId || input.snapshot.sessionIntentId !== input.sessionIntentId ||
      input.snapshot.unresolvedLineage.length > 0 || snapshotIssues.length > 0 ||
      input.snapshot.sourceKind === "legacy_compatibility_restricted") {
    return baseResult(input, "prescription_purpose_lineage_invalid", {
      failedSubgate: "P1_source_snapshot_and_lineage_truth", resolverPolicy: policyRef,
      conflicts: uniqueSorted([...snapshotIssues, ...input.snapshot.unresolvedLineage,
        ...(input.snapshot.sourceKind === "legacy_compatibility_restricted" ?
          ["PRESCRIPTION_PURPOSE_LINEAGE_REQUIRED"] : [])]),
    });
  }
  const requirements = input.snapshot.requirements.filter((entry) =>
    entry.targetAssignmentHandoffId === input.assignmentHandoffId &&
    entry.targetSessionNeedIds.every((id) => input.assignmentNeedIds.includes(id)));
  const selection = selectDrivingRequirement(requirements);
  const supporting = uniqueSorted(requirements.filter((entry) =>
    entry.purposeAuthority === "secondary_local_purpose" || entry.purposeAuthority === "dependency_support")
    .map((entry) => entry.localPurpose)) as readonly PrescriptionLocalPurpose[];
  const crossGoal = uniqueSorted(requirements.filter((entry) =>
    entry.purposeAuthority === "cross_goal_support").map((entry) => entry.localPurpose)) as
    readonly PrescriptionLocalPurpose[];
  if (selection.conflict.length > 0) return baseResult(input, "prescription_purpose_conflict", {
    failedSubgate: "P2_primary_and_supporting_purpose_truth", resolverPolicy: policyRef,
    supportingPurposes: supporting, crossGoalPurposes: crossGoal,
    conflicts: selection.conflict.map((entry) =>
      `${entry.requirementId}:${entry.localPurpose}`).sort(),
  });
  if (!selection.selected) return baseResult(input, "prescription_purpose_required", {
    failedSubgate: "P2_primary_and_supporting_purpose_truth", resolverPolicy: policyRef,
    supportingPurposes: supporting, crossGoalPurposes: crossGoal,
  });
  if (selection.selected.section !== input.section || selection.selected.role !== input.role) {
    return baseResult(input, "prescription_purpose_role_section_conflict", {
      failedSubgate: "P3_section_and_role_compatibility", resolverPolicy: policyRef,
      selectedPrimaryPurpose: selection.selected.localPurpose,
      supportingPurposes: supporting, crossGoalPurposes: crossGoal,
      conflicts: [`REQUIREMENT_PLACEMENT:${selection.selected.section}:${selection.selected.role}`,
        `ASSIGNMENT_PLACEMENT:${input.section}:${input.role}`],
    });
  }
  const selectedGoalRelationships = selection.selected.sourceGoalRelationships;
  const goalRelationshipMatches = selectedGoalRelationships.some((entry) =>
    entry.goal === input.outcomeGoal);
  const authorityRelationshipMatches = selection.selected.purposeAuthority === "primary_local_purpose"
    ? selectedGoalRelationships.some((entry) => entry.relationship === "primary_weekly_goal")
    : selection.selected.purposeAuthority === "secondary_local_purpose"
      ? selectedGoalRelationships.some((entry) => entry.relationship === "secondary_weekly_goal")
      : true;
  if (!goalRelationshipMatches || !authorityRelationshipMatches) {
    return baseResult(input, "prescription_purpose_goal_relationship_conflict", {
      failedSubgate: "P5_equipment_context_and_goal_compatibility", resolverPolicy: policyRef,
      selectedPrimaryPurpose: selection.selected.localPurpose,
      supportingPurposes: supporting, crossGoalPurposes: crossGoal,
      conflicts: [!goalRelationshipMatches ? `OUTCOME_GOAL_RELATIONSHIP_MISSING:${input.outcomeGoal}` :
        `PURPOSE_AUTHORITY_RELATIONSHIP_INVALID:${selection.selected.purposeAuthority}`],
    });
  }
  if (!input.selectedDoseMode || !input.legalDoseModes.includes(input.selectedDoseMode)) {
    return baseResult(input, "prescription_purpose_dose_mode_unsupported", {
      failedSubgate: "P4_dose_mode_and_exercise_knowledge_legality", resolverPolicy: policyRef,
      selectedPrimaryPurpose: selection.selected.localPurpose,
      supportingPurposes: supporting, crossGoalPurposes: crossGoal,
    });
  }
  if (selection.selected.expectedDoseModeLane &&
      selection.selected.expectedDoseModeLane !== input.selectedDoseMode) {
    return baseResult(input, "prescription_purpose_dose_mode_unsupported", {
      failedSubgate: "P4_dose_mode_and_exercise_knowledge_legality", resolverPolicy: policyRef,
      selectedPrimaryPurpose: selection.selected.localPurpose,
      conflicts: [`EXPECTED_MODE:${selection.selected.expectedDoseModeLane}:ACTUAL:${input.selectedDoseMode}`],
    });
  }
  const mapping = supportedUseCase(input, selection.selected);
  if (!mapping.useCase) return baseResult(input, mapping.status ?? "prescription_purpose_policy_required", {
    failedSubgate: mapping.status === "prescription_purpose_role_section_conflict"
      ? "P3_section_and_role_compatibility"
      : mapping.status === "prescription_purpose_dose_mode_unsupported"
        ? "P4_dose_mode_and_exercise_knowledge_legality"
        : mapping.status === "prescription_purpose_goal_relationship_conflict"
          ? "P5_equipment_context_and_goal_compatibility"
          : "P6_supported_use_case_mapping",
    resolverPolicy: policyRef,
    selectedPrimaryPurpose: selection.selected.localPurpose,
    supportingPurposes: supporting,
    crossGoalPurposes: crossGoal,
    conflicts: mapping.reason ? [mapping.reason] : [],
    unresolvedPolicyRefs: mapping.status === "prescription_purpose_policy_required" && mapping.reason
      ? [mapping.reason] : [],
  });
  const admittedMapping = policyResult.policy.supportedMappings.some((entry) =>
    entry.localPurpose === selection.selected?.localPurpose && entry.sections.includes(input.section) &&
    entry.roles.includes(input.role) && entry.doseModes.includes(input.selectedDoseMode as ExerciseDoseMode) &&
    entry.useCases.includes(mapping.useCase as PrescriptionPolicyUseCase) &&
    (entry.authorityRequirement === "primary_or_secondary_local"
      ? selection.selected?.purposeAuthority === "primary_local_purpose" ||
        selection.selected?.purposeAuthority === "secondary_local_purpose"
      : entry.authorityRequirement === "dependency_support"
        ? selection.selected?.purposeAuthority === "dependency_support"
        : selection.selected?.purposeAuthority === "primary_local_purpose" ||
          selection.selected?.purposeAuthority === "secondary_local_purpose" ||
          selection.selected?.purposeAuthority === "dependency_support"));
  if (!admittedMapping) return baseResult(input, "prescription_purpose_policy_unavailable", {
    failedSubgate: "P6_supported_use_case_mapping",
    resolverPolicy: policyRef,
    selectedPrimaryPurpose: selection.selected.localPurpose,
    supportingPurposes: supporting,
    crossGoalPurposes: crossGoal,
    unresolvedPolicyRefs: [`PURPOSE_MAPPING_NOT_ADMITTED:${selection.selected.localPurpose}:${mapping.useCase}`],
  });
  return baseResult(input, "purpose_resolved", {
    failedSubgate: null,
    resolverPolicy: policyRef,
    selectedPrimaryPurpose: selection.selected.localPurpose,
    supportingPurposes: supporting.filter((entry) => entry !== selection.selected?.localPurpose),
    crossGoalPurposes: crossGoal,
    selectedUseCase: mapping.useCase,
    structuralCompatibilityTrace: [`SECTION:${input.section}`, `ROLE:${input.role}`,
      `PURPOSE:${selection.selected.localPurpose}`, `USE_CASE:${mapping.useCase}`],
  });
}
