import { TRAINING_OUTCOME_GOALS } from "../../domain/sessionPlanningDirective";
import { compilePrescriptionAssignmentWithResolvedUseCase } from
  "../compiler/compilePrescriptionAssignment";
import { resolvePrescriptionRequirements } from "../compiler/requirementResolution";
import type { ExerciseDoseMode } from "../dose";
import { purposeFirstPrescriptionResolverV1 } from "../purposeResolution/resolver";
import { purposeEvidencePrescriptionHandoffFingerprint,
  purposeEvidenceSessionSkeletonFingerprint } from "../purposeResolution/evidenceSnapshot";
import { PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  type ProductionPrescriptionPurposeResolutionResult } from "../purposeResolution/contracts";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_1,
  type PrescriptionAssignmentCompilerInputV1_1,
  type ProductionExercisePrescriptionPlanV1_1 } from "./contracts";

function legalModes(input: PrescriptionAssignmentCompilerInputV1_1,
  exerciseId: string): readonly ExerciseDoseMode[] {
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === exerciseId);
  return knowledge ? [knowledge.primaryDoseMode, ...knowledge.legalAlternateDoseModes] : [];
}

function selectedMode(input: PrescriptionAssignmentCompilerInputV1_1,
  assignment: NonNullable<PrescriptionAssignmentCompilationResultV1_1["handoffAssignment"]>):
ExerciseDoseMode | null {
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) => entry.exerciseId === assignment.exerciseId);
  if (!knowledge) return null;
  const requirements = resolvePrescriptionRequirements({ assignment, requirements: input.executionRequirements });
  if (requirements.status !== "resolved") return knowledge.primaryDoseMode;
  const requested = requirements.values.dose_mode;
  const mode = requested?.kind === "dose_mode" ? requested.value : knowledge.primaryDoseMode;
  const annotation = knowledge.doseModeAnnotations.find((entry) => entry.mode === mode);
  return legalModes(input, assignment.exerciseId).includes(mode) && annotation?.reviewStatus === "accepted" &&
    annotation.status !== "unknown" ? mode : null;
}

function emptyDecisionTrace(input: PrescriptionAssignmentCompilerInputV1_1, reasons: readonly string[]) {
  return {
    trainingReadinessTrace: input.trainingReadiness,
    policyResolutionTrace: [], selectedRules: [], rejectedRules: [], overriddenRules: [],
    conflictTrace: [...reasons], legalModeTrace: [], blockStructureTrace: [], loadTrace: null,
    effortTrace: [], modifierTrace: [], timingTrace: [], restPlacementTrace: [], durationTrace: [],
    continuityTrace: [], unresolvedRequirementIds: [], finalReasonCodes: [...reasons],
  };
}

function noPlan(input: PrescriptionAssignmentCompilerInputV1_1,
  purposeResolution: ProductionPrescriptionPurposeResolutionResult | null,
  status: PrescriptionAssignmentCompilationResultV1_1["status"],
  reasons: readonly string[]): PrescriptionAssignmentCompilationResultV1_1 {
  const handoffAssignment = input.handoff.assignments.find((entry) =>
    entry.handoffId === input.assignmentHandoffId) ?? null;
  const assignment = input.sessionSkeleton.assignments.find((entry) =>
    entry.routinePrescriptionHandoffId === input.assignmentHandoffId) ?? null;
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    status,
    purposeResolution,
    selectedPurpose: purposeResolution?.selectedPrimaryPurpose ?? null,
    selectedUseCase: purposeResolution?.selectedUseCase ?? null,
    purposeSourceLineage: purposeResolution?.sourceRequirementIds ?? [],
    noFallbackTrace: Object.freeze(["FALLBACK_APPLIED:false", ...reasons]),
    assignment,
    handoffAssignment,
    sourceExposureEvent: null,
    equipmentRealization: null,
    plan: null,
    revisionLedger: null,
    recompositionRequirement: null,
    decisionTrace: emptyDecisionTrace(input, reasons),
    compatibilityDisposition: PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
    fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}

export function compilePrescriptionAssignmentV1_1(
  input: PrescriptionAssignmentCompilerInputV1_1,
): PrescriptionAssignmentCompilationResultV1_1 {
  if (input.compilerContract.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE.contractId ||
      input.compilerContract.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE.contractVersion) {
    return noPlan(input, null, "unsupported_compiler_contract", ["UNSUPPORTED_COMPILER_CONTRACT"]);
  }
  if (!input.purposeEvidenceSnapshot) {
    return noPlan(input, null, "prescription_purpose_required",
      ["PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_REQUIRED"]);
  }
  if (!input.purposeResolutionAttemptId.trim() ||
      input.purposeEvidenceSnapshot.purposeResolutionAttemptId !== input.purposeResolutionAttemptId) {
    return noPlan(input, null, "prescription_purpose_lineage_invalid",
      ["PURPOSE_RESOLUTION_ATTEMPT_LINEAGE_INVALID"]);
  }
  if (input.purposeEvidenceSnapshot.sessionSkeletonFingerprint !==
        purposeEvidenceSessionSkeletonFingerprint(input.sessionSkeleton) ||
      input.purposeEvidenceSnapshot.prescriptionHandoffFingerprint !==
        purposeEvidencePrescriptionHandoffFingerprint(input.handoff) ||
      Date.parse(input.purposeEvidenceSnapshot.evaluationTime) > Date.parse(input.evaluationTime)) {
    return noPlan(input, null, "prescription_purpose_lineage_invalid",
      ["PURPOSE_EVIDENCE_SNAPSHOT_STALE_OR_FUTURE"]);
  }
  const handoffAssignment = input.handoff.assignments.find((entry) =>
    entry.handoffId === input.assignmentHandoffId);
  if (!handoffAssignment) return noPlan(input, null, "prescription_purpose_lineage_invalid",
    ["PURPOSE_ASSIGNMENT_HANDOFF_LINEAGE_INVALID"]);
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) =>
    entry.exerciseId === handoffAssignment.exerciseId);
  const outcomeGoal = input.sessionIntent.outcomeGoal;
  if (!knowledge || !outcomeGoal || !TRAINING_OUTCOME_GOALS.includes(outcomeGoal)) {
    return noPlan(input, null, "prescription_purpose_lineage_invalid",
      [!knowledge ? "EXERCISE_KNOWLEDGE_NOT_FOUND" : "CANONICAL_OUTCOME_GOAL_REQUIRED_AS_BOUNDED_CONTEXT"]);
  }
  const mode = selectedMode(input, handoffAssignment);
  const purposeResolution = purposeFirstPrescriptionResolverV1({
    policy: input.purposeResolverPolicy,
    availablePolicies: input.availablePurposeResolverPolicies,
    snapshot: input.purposeEvidenceSnapshot,
    athleteId: input.athlete.id,
    sessionIntentId: input.sessionIntent.id,
    outcomeGoal,
    programmingContextModes: input.sessionIntent.programmingContextModes ?? [],
    assignmentHandoffId: input.assignmentHandoffId,
    assignmentNeedIds: handoffAssignment.satisfiedNeedIds,
    section: handoffAssignment.section,
    role: handoffAssignment.role,
    selectedDoseMode: mode,
    legalDoseModes: legalModes(input, handoffAssignment.exerciseId),
    exerciseKnowledgeRef: knowledge.profileId,
    equipmentTrace: [`EQUIPMENT_REALIZATION_CALLER_SUPPLIED:${input.currentEquipment.environment}`],
    context: input.context,
  });
  if (purposeResolution.status !== "purpose_resolved" || !purposeResolution.selectedUseCase) {
    return noPlan(input, purposeResolution, purposeResolution.status,
      [purposeResolution.status, ...(purposeResolution.conflicts ?? [])]);
  }
  const compatibility = compilePrescriptionAssignmentWithResolvedUseCase(
    input,
    purposeResolution.selectedUseCase,
  );
  const missingRule = compatibility.status === "unsupported_dose_mode" &&
    compatibility.decisionTrace.finalReasonCodes.some((entry) => entry.startsWith("NO_POLICY_RULE_FOR:"));
  const status = missingRule ? "prescription_policy_rule_unavailable" :
    compatibility.status === "unsupported_dose_mode" ?
      "prescription_purpose_dose_mode_unsupported" : compatibility.status;
  const plan: ProductionExercisePrescriptionPlanV1_1 | null = compatibility.plan ? Object.freeze({
    ...compatibility.plan,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    rationaleReasonCodes: Object.freeze([...compatibility.plan.rationaleReasonCodes,
      "PURPOSE_FIRST_RESOLUTION", "NO_BROAD_FALLBACK"]),
  }) : null;
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    status,
    purposeResolution,
    selectedPurpose: purposeResolution.selectedPrimaryPurpose,
    selectedUseCase: purposeResolution.selectedUseCase,
    purposeSourceLineage: purposeResolution.sourceRequirementIds,
    noFallbackTrace: Object.freeze(["FALLBACK_APPLIED:false",
      `RESOLVER:${PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE}`,
      `USE_CASE:${purposeResolution.selectedUseCase}`]),
    assignment: compatibility.assignment,
    handoffAssignment: compatibility.handoffAssignment,
    sourceExposureEvent: compatibility.sourceExposureEvent,
    equipmentRealization: compatibility.equipmentRealization,
    plan,
    revisionLedger: compatibility.revisionLedger,
    recompositionRequirement: compatibility.recompositionRequirement,
    decisionTrace: Object.freeze({
      ...compatibility.decisionTrace,
      policyResolutionTrace: Object.freeze([
        `PURPOSE_POLICY:${purposeResolution.resolverPolicy?.policyId}@${purposeResolution.resolverPolicy?.version}`,
        ...compatibility.decisionTrace.policyResolutionTrace,
      ]),
      conflictTrace: purposeResolution.conflicts,
      finalReasonCodes: Object.freeze([
        ...compatibility.decisionTrace.finalReasonCodes,
        "PURPOSE_FIRST_RESOLUTION",
        "FALLBACK_APPLIED:false",
      ]),
    }),
    compatibilityDisposition: PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
    fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}
