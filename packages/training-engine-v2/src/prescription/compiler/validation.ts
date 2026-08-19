import type { ExercisePrescriptionKnowledgeProfile } from "../../domain/exercisePrescriptionKnowledge";
import { validateDose } from "../validation";
import {
  PRESCRIPTION_DURATION_INTERVAL_STATUSES,
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
  PRESCRIPTION_REQUIREMENT_TARGET_DIMENSIONS,
  type PrescriptionAssignmentCompilerInput,
  type PrescriptionDurationInterval,
  type PrescriptionExecutionRequirement,
  type PrescriptionRestInstruction,
  type PrescriptionSessionCompilationResult,
  type ProductionExercisePrescriptionPlan,
  type ProductionPrescriptionDoseBlock,
  type ProductionPrescriptionValidationFinding,
} from "./contracts";
import { validateProductionPrescriptionPolicy } from "./policyResolution";
import { validatePrescriptionRevisionLedger } from "./revisions";
import { explicitIsoTime } from "./utilities";

const finding = (
  code: string,
  targetId?: string,
): ProductionPrescriptionValidationFinding => ({ severity: "error", code, targetId });

export function validatePrescriptionCompilerInput(
  input: PrescriptionAssignmentCompilerInput,
): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  if (!input.executionAttemptId.trim()) findings.push(finding("MISSING_EXECUTION_ATTEMPT_ID"));
  if (!explicitIsoTime(input.evaluationTime)) findings.push(finding("INVALID_EVALUATION_TIME"));
  if (input.sessionIntent.id !== input.sessionSkeleton.sessionIntentId) findings.push(finding("INTENT_SKELETON_ID_MISMATCH"));
  if (input.sessionIntent.id !== input.handoff.sessionIntentId) findings.push(finding("INTENT_HANDOFF_ID_MISMATCH"));
  if (input.policy && "rules" in input.policy) {
    findings.push(...validateProductionPrescriptionPolicy(input.policy).map((code) => finding(code)));
  }
  findings.push(...input.executionRequirements.flatMap(validatePrescriptionExecutionRequirement));
  return findings;
}

export function validatePrescriptionExecutionRequirement(
  requirement: PrescriptionExecutionRequirement,
): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  if (!requirement.requirementId.trim()) findings.push(finding("MISSING_REQUIREMENT_ID"));
  if (!requirement.targetAssignmentHandoffId.trim()) findings.push(finding("MISSING_REQUIREMENT_TARGET_ASSIGNMENT"));
  if (!requirement.sourceRef.trim()) findings.push(finding("MISSING_REQUIREMENT_SOURCE_REF", requirement.requirementId));
  if (!PRESCRIPTION_REQUIREMENT_TARGET_DIMENSIONS.includes(requirement.targetDimension)) findings.push(finding("INVALID_REQUIREMENT_TARGET_DIMENSION", requirement.requirementId));
  if (requirement.resolutionState === "resolved" && !requirement.reviewedResolution) findings.push(finding("RESOLVED_REQUIREMENT_MISSING_REVIEWED_VALUE", requirement.requirementId));
  if (requirement.reviewedResolution && requirement.reviewedResolution.kind !== requirement.targetDimension) findings.push(finding("REQUIREMENT_RESOLUTION_DIMENSION_MISMATCH", requirement.requirementId));
  return findings;
}

export function validateProductionPrescriptionDoseBlocks(input: {
  readonly blocks: readonly ProductionPrescriptionDoseBlock[];
  readonly legalDoseModes: readonly string[];
}): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  const ids = input.blocks.map((block) => block.blockId);
  if (new Set(ids).size !== ids.length) findings.push(finding("DUPLICATE_PRESCRIPTION_BLOCK_ID"));
  const modes = new Set(input.blocks.map((block) => block.dose.mode));
  if (modes.size > 1) findings.push(finding("ILLEGAL_MIXED_DOSE_MODES"));
  for (const block of input.blocks) {
    if (!input.legalDoseModes.includes(block.dose.mode) && block.purpose !== "preparatory_acclimation") findings.push(finding("UNSUPPORTED_DOSE_MODE", block.blockId));
    if (!block.executionStandard.exerciseMechanicsIntent.trim()) findings.push(finding("MISSING_EXECUTION_STANDARD", block.blockId));
    if (block.purpose === "preparatory_acclimation" && block.contributionClassification !== "not_weekly_developmental_credit") findings.push(finding("PREPARATORY_BLOCK_MISCREDITED", block.blockId));
    findings.push(...validateDose(block.dose, block.executionStandard).filter((entry) => entry.severity === "error").map((entry) => finding(entry.code, block.blockId)));
  }
  const indexes = [...input.blocks].sort((left, right) => left.order.index - right.order.index).map((block) => block.order.index);
  if (indexes.some((index, position) => index !== position)) findings.push(finding("INVALID_BLOCK_ORDER"));
  if (hasBlockCycle(input.blocks)) findings.push(finding("CYCLIC_BLOCK_DEPENDENCY"));
  return findings;
}

export function validatePrescriptionRestInstructions(input: {
  readonly instructions: readonly PrescriptionRestInstruction[];
  readonly blocks: readonly ProductionPrescriptionDoseBlock[];
}): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  const placements = new Set([
    "between_sets", "between_preparatory_blocks", "before_developmental_block",
    "between_developmental_sets", "between_rounds", "between_trips",
    "between_sides", "after_block",
  ]);
  const blockIds = new Set(input.blocks.map((block) => block.blockId));
  const instructionIds = input.instructions.map((entry) => entry.restInstructionId);
  if (new Set(instructionIds).size !== instructionIds.length) findings.push(finding("DUPLICATE_REST_INSTRUCTION"));
  for (const instruction of input.instructions) {
    if (!placements.has(instruction.placement)) findings.push(finding("INVALID_PRESCRIPTION_REST_PLACEMENT", instruction.restInstructionId));
    for (const id of [instruction.appliesAfterBlockId, instruction.appliesBeforeBlockId, instruction.appliesWithinBlockId]) {
      if (id && !blockIds.has(id)) findings.push(finding("REST_REFERENCES_UNKNOWN_BLOCK", instruction.restInstructionId));
    }
    const finalBlock = input.blocks[input.blocks.length - 1];
    if (instruction.placement === "after_block" && instruction.appliesAfterBlockId === finalBlock?.blockId) findings.push(finding("REST_AFTER_FINAL_BLOCK_FORBIDDEN", instruction.restInstructionId));
  }
  return findings;
}

export function validatePrescriptionDurationInterval(
  interval: PrescriptionDurationInterval,
): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  if (interval.knownLowerBoundSeconds < 0) findings.push(finding("NEGATIVE_DURATION_LOWER_BOUND"));
  if (interval.knownUpperBoundSeconds !== null && interval.knownUpperBoundSeconds < interval.knownLowerBoundSeconds) findings.push(finding("INVALID_DURATION_INTERVAL"));
  if (interval.knownUpperBoundSeconds !== null && interval.unknownComponents.length > 0) findings.push(finding("FAKE_DURATION_BOUND_WITH_UNKNOWN_COMPONENT"));
  if (!PRESCRIPTION_DURATION_INTERVAL_STATUSES.includes(interval.status)) findings.push(finding("INVALID_DURATION_STATUS"));
  return findings;
}

export function validateProductionExercisePrescriptionPlan(
  plan: ProductionExercisePrescriptionPlan,
  knowledge: ExercisePrescriptionKnowledgeProfile,
): readonly ProductionPrescriptionValidationFinding[] {
  const findings = [
    ...validatePrescriptionRevisionLedger(plan.revisionLedger).map((code) => finding(code, plan.prescriptionId)),
    ...validateProductionPrescriptionDoseBlocks({
      blocks: plan.doseBlocks,
      legalDoseModes: [knowledge.primaryDoseMode, ...knowledge.legalAlternateDoseModes],
    }),
    ...validatePrescriptionRestInstructions({ instructions: plan.restInstructions, blocks: plan.doseBlocks }),
    ...validatePrescriptionDurationInterval(plan.durationInterval),
  ];
  if (!isSupportedCompilerContract(plan.compilerContract)) {
    findings.push(finding("UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT", plan.prescriptionId));
  }
  if (plan.prescriptionRevisionId !== plan.revisionLedger.finalRevisionId) findings.push(finding("PLAN_FINAL_REVISION_MISMATCH", plan.prescriptionId));
  if (plan.doseBlocks.length > 1 && plan.compatibilityProjection.projectedDose !== null) findings.push(finding("MULTI_BLOCK_PLAN_FLATTENED", plan.prescriptionId));
  return findings;
}

export function validatePrescriptionSessionCompilation(
  result: PrescriptionSessionCompilationResult,
): readonly ProductionPrescriptionValidationFinding[] {
  const findings: ProductionPrescriptionValidationFinding[] = [];
  if (!isSupportedCompilerContract(result.compilerContract)) {
    findings.push(finding("UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT", "session"));
  }
  for (const entry of result.assignmentResults) {
    if (!isSupportedCompilerContract(entry.compilerContract)) {
      findings.push(finding(
        "UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT",
        entry.handoffAssignment?.handoffId ?? "assignment",
      ));
    }
  }
  for (const plan of result.plans) {
    if (!isSupportedCompilerContract(plan.compilerContract)) {
      findings.push(finding("UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT", plan.prescriptionId));
    }
  }
  const assignmentIds = result.assignmentResults.flatMap((entry) => entry.handoffAssignment?.handoffId ?? []);
  const eventIds = result.sourceExposureEvents.map((entry) => entry.sourceExposureEventId);
  const prescriptionIds = result.plans.map((entry) => entry.prescriptionId);
  if (new Set(assignmentIds).size !== assignmentIds.length) findings.push(finding("DUPLICATE_ASSIGNMENT_RESULT"));
  if (new Set(eventIds).size !== eventIds.length) findings.push(finding("DUPLICATE_SOURCE_EXPOSURE_EVENT"));
  if (new Set(prescriptionIds).size !== prescriptionIds.length) findings.push(finding("DUPLICATE_PRESCRIPTION_ID"));
  const assignmentIdsFromResults = new Set(result.assignmentResults.flatMap((entry) => entry.handoffAssignment?.handoffId ?? []));
  if (result.plans.some((plan) => !assignmentIdsFromResults.has(plan.sourceExposureEvent.sessionAssignmentId))) findings.push(finding("POLICY_CREATED_ASSIGNMENT"));
  if (result.assignmentResults.some((entry) => entry.status === "compiled" && entry.plan === null)) findings.push(finding("POLICY_REMOVED_ASSIGNMENT"));
  for (const entry of result.assignmentResults) {
    const plan = entry.plan;
    if (!plan) continue;
    if (entry.handoffAssignment?.exerciseId !== plan.exerciseId || plan.sourceExposureEvent.currentPlannedExerciseId !== plan.sourceExposureEvent.originalSelectedExerciseId) findings.push(finding("SILENT_SUBSTITUTION", plan.prescriptionId));
    if (entry.assignment?.section === "main" && !plan.doseBlocks.some((block) => block.purpose === "developmental_work")) findings.push(finding("DEVELOPMENTAL_BLOCK_OMITTED", plan.prescriptionId));
    const hasExplicitLoad = plan.doseBlocks.some((block) => ["external_load", "machine_stack", "cable_stack", "band_tension"].includes(block.dose.load?.kind ?? ""));
    if (hasExplicitLoad && !["EXACT_PRIOR_LOAD_RETAINED", "REVIEWED_REQUIREMENT_APPLIED"].includes(entry.decisionTrace.loadTrace?.status ?? "")) findings.push(finding("EXACT_LOAD_WITHOUT_EVIDENCE", plan.prescriptionId));
    if (entry.decisionTrace.loadTrace?.automaticProgressionApplied !== false) findings.push(finding("AUTOMATIC_LOAD_PROGRESSION_FORBIDDEN", plan.prescriptionId));
  }
  if (result.completeSessionArgument.policyAddedStructure) findings.push(finding("POLICY_CREATED_ASSIGNMENT"));
  if (result.completeSessionArgument.policyRemovedStructure) findings.push(finding("POLICY_REMOVED_ASSIGNMENT"));
  if (!result.completeSessionArgument.finalDurationSequencingDependent) findings.push(finding("SESSION_DURATION_INCORRECTLY_FINAL"));
  return findings;
}

function isSupportedCompilerContract(value: {
  readonly contractId: string;
  readonly contractVersion: string;
} | null | undefined): boolean {
  return value?.contractId === PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId &&
    value?.contractVersion === PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion;
}

function hasBlockCycle(blocks: readonly ProductionPrescriptionDoseBlock[]): boolean {
  const byId = new Map(blocks.map((block) => [block.blockId, block]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependency of byId.get(id)?.order.dependsOnBlockIds ?? []) {
      if (visit(dependency)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return blocks.some((block) => visit(block.blockId));
}
