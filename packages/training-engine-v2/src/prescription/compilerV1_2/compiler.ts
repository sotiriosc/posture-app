import { TRAINING_OUTCOME_GOALS } from "../../domain/sessionPlanningDirective";
import { compilePrescriptionAssignmentWithResolvedUseCase } from
  "../compiler/compilePrescriptionAssignment";
import { resolvePrescriptionRequirements } from "../compiler/requirementResolution";
import type { ExerciseDoseMode } from "../dose";
import type { PrescriptionPolicyRuleVariant } from "../policies";
import { validateProductionPrescriptionPolicyV2 } from "../policiesV2";
import { purposeEvidencePrescriptionHandoffFingerprint,
  purposeEvidenceSessionSkeletonFingerprint } from "../purposeResolution";
import { purposeFirstPrescriptionResolverV1_1 } from "../purposeResolutionV1_1";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION } from "../compilerV1_1";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_2,
  type PrescriptionAssignmentCompilationStatusV1_2,
  type PrescriptionAssignmentCompilerInputV1_2,
  type ProductionExercisePrescriptionPlanV1_2 } from "./contracts";
import { buildPrescriptionPurposeContributions } from "./purposeContribution";

function legalModes(input: PrescriptionAssignmentCompilerInputV1_2,
  exerciseId: string): readonly ExerciseDoseMode[] {
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === exerciseId);
  return knowledge ? [knowledge.primaryDoseMode, ...knowledge.legalAlternateDoseModes] : [];
}

function selectedMode(input: PrescriptionAssignmentCompilerInputV1_2,
  exerciseId: string, handoffId: string): ExerciseDoseMode | null {
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === exerciseId);
  const assignment = input.handoff.assignments.find((entry) => entry.handoffId === handoffId);
  if (!knowledge || !assignment) return null;
  const requirements = resolvePrescriptionRequirements({ assignment, requirements: input.executionRequirements });
  if (requirements.status !== "resolved") return knowledge.primaryDoseMode;
  const requested = requirements.values.dose_mode;
  const mode = requested?.kind === "dose_mode" ? requested.value : knowledge.primaryDoseMode;
  const annotation = knowledge.doseModeAnnotations.find((entry) => entry.mode === mode);
  return legalModes(input, exerciseId).includes(mode) && annotation?.reviewStatus === "accepted" &&
    annotation.status !== "unknown" ? mode : null;
}

function emptyDecisionTrace(input: PrescriptionAssignmentCompilerInputV1_2, reasons: readonly string[]) {
  return {
    trainingReadinessTrace: input.trainingReadiness,
    policyResolutionTrace: [], selectedRules: [], rejectedRules: [], overriddenRules: [],
    conflictTrace: [...reasons], legalModeTrace: [], blockStructureTrace: [], loadTrace: null,
    effortTrace: [], modifierTrace: [], timingTrace: [], restPlacementTrace: [], durationTrace: [],
    continuityTrace: [], unresolvedRequirementIds: [], finalReasonCodes: [...reasons],
  };
}

function noPlan(input: PrescriptionAssignmentCompilerInputV1_2,
  status: PrescriptionAssignmentCompilationStatusV1_2,
  reasons: readonly string[],
  purposeResolution: PrescriptionAssignmentCompilationResultV1_2["purposeResolution"] = null,
): PrescriptionAssignmentCompilationResultV1_2 {
  const handoffAssignment = input.handoff.assignments.find((entry) =>
    entry.handoffId === input.assignmentHandoffId) ?? null;
  const assignment = input.sessionSkeleton.assignments.find((entry) =>
    entry.routinePrescriptionHandoffId === input.assignmentHandoffId) ?? null;
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    status,
    purposeResolution,
    selectedPurpose: purposeResolution?.selectedPrimaryPurpose ?? null,
    selectedUseCase: purposeResolution?.selectedUseCase ?? null,
    purposeSourceLineage: purposeResolution?.sourceRequirementIds ?? [],
    noFallbackTrace: Object.freeze(["FALLBACK_APPLIED:false", ...reasons]),
    assignment, handoffAssignment, sourceExposureEvent: null, equipmentRealization: null,
    plan: null, revisionLedger: null, recompositionRequirement: null,
    decisionTrace: emptyDecisionTrace(input, reasons),
    compatibilityDisposition: PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
    fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}

function variant(input: PrescriptionAssignmentCompilerInputV1_2,
  useCase: NonNullable<PrescriptionAssignmentCompilationResultV1_2["selectedUseCase"]>):
PrescriptionPolicyRuleVariant | undefined {
  if (useCase === "secondary_hypertrophy" || useCase.endsWith("_accessory")) return "default";
  if (useCase === "movement_quality_main" || useCase === "muscular_endurance_main") {
    return input.context.reviewedRegression || input.context.returnAfterAbsence ||
      input.context.painAwareLoadToleranceRegressionPermitted ||
      input.sessionIntent.structuralCapacity === "condensed" ? "regression" : "standard";
  }
  return undefined;
}

export function compilePrescriptionAssignmentV1_2(
  input: PrescriptionAssignmentCompilerInputV1_2,
): PrescriptionAssignmentCompilationResultV1_2 {
  if (input.compilerContract.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE.contractId ||
      input.compilerContract.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE.contractVersion) {
    return noPlan(input, "unsupported_compiler_contract", ["UNSUPPORTED_COMPILER_CONTRACT"]);
  }
  if (input.trainingMode === "maintain") return noPlan(input,
    "maintenance_week_and_longitudinal_policy_required",
    ["MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED"]);
  if (input.trainingMode === "return_or_rebuild") return noPlan(input,
    "return_or_rebuild_realization_policy_required", ["RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED"]);
  if (!input.prescriptionPolicyV2) return noPlan(input, "prescription_policy_v2_required",
    ["PRESCRIPTION_POLICY_V2_REQUIRED"]);
  const policyIssues = validateProductionPrescriptionPolicyV2(input.prescriptionPolicyV2);
  if (policyIssues.length > 0) return noPlan(input, "prescription_policy_v2_invalid", policyIssues);
  if (!input.purposeEvidenceSnapshot || !input.purposeResolutionAttemptId.trim() ||
      input.purposeEvidenceSnapshot.purposeResolutionAttemptId !== input.purposeResolutionAttemptId) {
    return noPlan(input, "prescription_purpose_lineage_invalid", ["PURPOSE_EVIDENCE_LINEAGE_INVALID"]);
  }
  if (input.purposeEvidenceSnapshot.sessionSkeletonFingerprint !==
        purposeEvidenceSessionSkeletonFingerprint(input.sessionSkeleton) ||
      input.purposeEvidenceSnapshot.prescriptionHandoffFingerprint !==
        purposeEvidencePrescriptionHandoffFingerprint(input.handoff) ||
      Date.parse(input.purposeEvidenceSnapshot.evaluationTime) > Date.parse(input.evaluationTime)) {
    return noPlan(input, "prescription_purpose_lineage_invalid",
      ["PURPOSE_EVIDENCE_SNAPSHOT_STALE_OR_FUTURE"]);
  }
  const handoff = input.handoff.assignments.find((entry) => entry.handoffId === input.assignmentHandoffId);
  if (!handoff) return noPlan(input, "prescription_purpose_lineage_invalid",
    ["PURPOSE_ASSIGNMENT_HANDOFF_LINEAGE_INVALID"]);
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === handoff.exerciseId);
  const outcomeGoal = input.sessionIntent.outcomeGoal;
  if (!knowledge || !outcomeGoal || !TRAINING_OUTCOME_GOALS.includes(outcomeGoal)) {
    return noPlan(input, "prescription_purpose_lineage_invalid",
      [!knowledge ? "EXERCISE_KNOWLEDGE_NOT_FOUND" : "CANONICAL_OUTCOME_GOAL_REQUIRED"]);
  }
  const mode = selectedMode(input, handoff.exerciseId, handoff.handoffId);
  const purposeResolution = purposeFirstPrescriptionResolverV1_1({
    policy: input.purposeResolverPolicy,
    availablePolicies: input.availablePurposeResolverPolicies,
    snapshot: input.purposeEvidenceSnapshot,
    athleteId: input.athlete.id,
    sessionIntentId: input.sessionIntent.id,
    outcomeGoal,
    programmingContextModes: input.sessionIntent.programmingContextModes ?? [],
    assignmentHandoffId: input.assignmentHandoffId,
    assignmentNeedIds: handoff.satisfiedNeedIds,
    section: handoff.section,
    role: handoff.role,
    selectedDoseMode: mode,
    legalDoseModes: legalModes(input, handoff.exerciseId),
    exerciseKnowledgeRef: knowledge.profileId,
    equipmentTrace: [`EQUIPMENT_REALIZATION_CALLER_SUPPLIED:${input.currentEquipment.environment}`],
    context: input.context,
    requestedSystemicScope: input.requestedSystemicScope,
  });
  if (purposeResolution.status !== "purpose_resolved" || !purposeResolution.selectedUseCase) {
    const reason = purposeResolution.unresolvedPolicyRefs[0] ?? purposeResolution.conflicts[0] ??
      purposeResolution.status;
    const status = reason === "SYSTEMIC_CONDITIONING_POLICY_REQUIRED" ?
      "systemic_conditioning_policy_required" : reason === "POWER_DEVELOPMENT_POLICY_REQUIRED" ?
        "power_development_policy_required" : purposeResolution.status;
    return noPlan(input, status, [reason], purposeResolution);
  }
  const selectedVariant = variant(input, purposeResolution.selectedUseCase);
  const compatibility = compilePrescriptionAssignmentWithResolvedUseCase(
    input,
    purposeResolution.selectedUseCase,
    {
      policyOverride: input.prescriptionPolicyV2,
      variantOverride: selectedVariant,
      blockPurposeOverride: purposeResolution.selectedPrimaryPurpose === "movement_quality_development" ?
        ["technique_quality_work"] : undefined,
      policyTrace: [
        `PURPOSE_POLICY:${purposeResolution.resolverPolicy?.policyId}@${purposeResolution.resolverPolicy?.version}`,
        `PRESCRIPTION_POLICY:${input.prescriptionPolicyV2.policyId}@${input.prescriptionPolicyV2.version}`,
      ],
    },
  );
  const missingRule = compatibility.status === "unsupported_dose_mode" &&
    compatibility.decisionTrace.finalReasonCodes.some((entry) => entry.startsWith("NO_POLICY_RULE_FOR:"));
  if (!compatibility.plan) return noPlan(input,
    missingRule ? "prescription_policy_rule_unavailable" : compatibility.status,
    compatibility.decisionTrace.finalReasonCodes, purposeResolution);
  const contributions = buildPrescriptionPurposeContributions({
    blocks: compatibility.plan.doseBlocks,
    localPurpose: purposeResolution.selectedPrimaryPurpose,
    sourceObjectiveIds: purposeResolution.sourceObjectiveIds,
    crossGoalTrace: purposeResolution.goalRelationshipTrace.filter((entry) =>
      entry.endsWith(":cross_goal_support")),
  });
  const plan: ProductionExercisePrescriptionPlanV1_2 = Object.freeze({
    ...compatibility.plan,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    purposeContributions: contributions,
    rationaleReasonCodes: Object.freeze([...compatibility.plan.rationaleReasonCodes,
      "SUPPORTED_PURPOSE_POLICY_V2", "PURPOSE_CONTRIBUTION_RECORDED", "NO_BROAD_FALLBACK"]),
  });
  return Object.freeze({
    ...compatibility,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    status: "compiled",
    purposeResolution,
    selectedPurpose: purposeResolution.selectedPrimaryPurpose,
    selectedUseCase: purposeResolution.selectedUseCase,
    purposeSourceLineage: purposeResolution.sourceRequirementIds,
    noFallbackTrace: Object.freeze(["FALLBACK_APPLIED:false",
        `USE_CASE:${purposeResolution.selectedUseCase}`,
        `VARIANT:${selectedVariant ?? "V1_SHARED_RESOLUTION"}`]),
    plan,
    fallbackApplied: false,
    compatibilityDisposition: PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}
