import {
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
} from "../prescription/compiler/contracts";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  type ExplicitProductionSequencingTransitionFact,
  type FinalSessionSequencingValidationFinding,
  type ProductionFinalSessionSequencingInput,
} from "./contracts";
import { buildProductionSequencingAssignmentFacts } from "./assignmentFacts";
import { buildProductionSequencingDependencyGraph } from "./dependencyGraph";
import { PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE } from "./policies";
import { orderingGraphAcyclic } from "../sessionComposer/validity";
import { validateSessionIntent } from "../sessionComposer/candidatePools";

const error = (code: string, targetId?: string): FinalSessionSequencingValidationFinding => ({
  severity: "error",
  code,
  targetId,
});

function explicitIsoTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function transitionTargetValid(fact: ExplicitProductionSequencingTransitionFact): boolean {
  if (fact.factType === "setup_relationship") return fact.target.kind === "setup_relationship";
  if (["equipment_relationship", "support_relationship", "resistance_path_relationship"].includes(fact.factType)) {
    return fact.target.kind === "relationship";
  }
  if (fact.factType === "location_relationship") return fact.target.kind === "location_relationship";
  if (fact.factType === "interference") {
    return fact.target.kind === "interference" &&
      fact.target.value.basis.length > 0 &&
      fact.target.value.affectedActiveNeedIds.every((id) => id.trim().length > 0);
  }
  if (["setup_duration", "inter_exercise_recovery", "section_boundary_duration"].includes(fact.factType)) {
    if (fact.target.kind !== "timing") return false;
    const value = fact.target.value;
    if (value.kind === "exact") return Number.isFinite(value.seconds) && value.seconds >= 0;
    if (value.kind === "range") {
      return Number.isFinite(value.minimumSeconds) && Number.isFinite(value.maximumSeconds) &&
        value.minimumSeconds >= 0 && value.maximumSeconds >= value.minimumSeconds;
    }
    return value.reasonCode.trim().length > 0;
  }
  return fact.factType === "unknown_transition_component" && fact.target.kind === "unknown_component";
}

export function validateFinalSessionSequencingInput(
  input: ProductionFinalSessionSequencingInput,
): readonly FinalSessionSequencingValidationFinding[] {
  const findings: FinalSessionSequencingValidationFinding[] = [];
  if (
    input.sequencingContract?.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId ||
    input.sequencingContract?.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
  ) findings.push(error("UNSUPPORTED_SEQUENCING_CONTRACT_VERSION"));
  const compilerContracts = [
    input.prescriptionSession.compilerContract,
    ...input.prescriptionSession.assignmentResults.map((entry) => entry.compilerContract),
    ...input.prescriptionSession.plans.map((entry) => entry.compilerContract),
  ];
  if (compilerContracts.some((contract) =>
    contract?.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId ||
    contract?.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion
  )) findings.push(error("UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT_VERSION"));
  if (!input.executionAttemptId?.trim()) findings.push(error("MISSING_EXECUTION_ATTEMPT_ID"));
  if (!explicitIsoTime(input.evaluationTime)) findings.push(error("INVALID_EVALUATION_TIME"));
  if (!Number.isFinite(input.availableMinutes) || input.availableMinutes <= 0) {
    findings.push(error("INVALID_AVAILABLE_SESSION_MINUTES"));
  }
  findings.push(...validateSessionIntent(input.intent).map((code) =>
    error(`INVALID_SESSION_INTENT:${code}`)
  ));
  if (input.intent.id !== input.skeleton.sessionIntentId) findings.push(error("SESSION_INTENT_SKELETON_ID_MISMATCH"));
  if (input.intent.availableMinutes !== input.availableMinutes) findings.push(error("SESSION_AVAILABLE_MINUTES_MISMATCH"));
  if (input.skeleton.compositionStatus === "infeasible" || input.skeleton.compositionStatus === "search_inconclusive") {
    findings.push(error("INVALID_SESSION_SKELETON_STATUS"));
  }
  const skeletonAssignmentIds = input.skeleton.assignments.map((entry) => entry.routinePrescriptionHandoffId);
  if (new Set(skeletonAssignmentIds).size !== skeletonAssignmentIds.length) {
    findings.push(error("DUPLICATE_SESSION_ASSIGNMENT"));
  }
  const knownNeedIds = new Set(input.intent.needs.map((need) => need.id));
  if (input.skeleton.assignments.some((assignment) =>
    assignment.satisfiedNeedIds.length === 0 ||
    assignment.satisfiedNeedIds.some((needId) => !knownNeedIds.has(needId))
  )) findings.push(error("INVALID_SESSION_SKELETON_NEED_COVERAGE"));
  const assignmentByExerciseId = new Map(input.skeleton.assignments.map((assignment) => [
    assignment.exerciseId,
    assignment,
  ]));
  const sectionIndex = new Map(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE.map((section, index) => [section, index]));
  if (input.skeleton.orderingConstraints.some((edge) => {
    const before = assignmentByExerciseId.get(edge.beforeExerciseId);
    const after = assignmentByExerciseId.get(edge.afterExerciseId);
    return !before || !after ||
      (sectionIndex.get(before.section) ?? 99) > (sectionIndex.get(after.section) ?? -1);
  })) findings.push(error("INVALID_SESSION_SKELETON_ORDERING_CONSTRAINT"));
  if (!orderingGraphAcyclic(input.skeleton.orderingConstraints)) {
    findings.push(error("ORDERING_DEPENDENCY_CYCLE"));
  }
  if (!sameSet(
    input.skeleton.assignments.map((entry) => entry.routinePrescriptionHandoffId),
    input.sequencingHandoff.assignments.map((entry) => entry.routinePrescriptionHandoffId),
  )) findings.push(error("SEQUENCING_HANDOFF_ASSIGNMENT_MISMATCH"));
  if (JSON.stringify(input.sequencingHandoff.fixedSectionPrecedence) !==
    JSON.stringify(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE)) {
    findings.push(error("INVALID_SECTION_PRECEDENCE"));
  }
  if (input.sequencingHandoff.assignments.some((handoff) => {
    const assignment = input.skeleton.assignments.find((entry) =>
      entry.routinePrescriptionHandoffId === handoff.routinePrescriptionHandoffId
    );
    return !assignment || assignment.exerciseId !== handoff.exerciseId ||
      assignment.section !== handoff.section || assignment.role !== handoff.role;
  })) findings.push(error("INVALID_SESSION_HANDOFF"));
  if (!sameSet(
    input.skeleton.orderingConstraints.map((edge) => `${edge.beforeExerciseId}>${edge.afterExerciseId}:${[...edge.dependencyIds].sort().join(",")}`),
    input.sequencingHandoff.orderingConstraints.map((edge) => `${edge.beforeExerciseId}>${edge.afterExerciseId}:${[...edge.dependencyIds].sort().join(",")}`),
  )) findings.push(error("SEQUENCING_HANDOFF_DEPENDENCY_MISMATCH"));
  if (!input.sequencingHandoff.graphAcyclic) findings.push(error("ORDERING_DEPENDENCY_CYCLE"));
  if (input.prescriptionSession.sourceExposureEvents.some((event) => event.sessionIntentId !== input.intent.id)) {
    findings.push(error("PRESCRIPTION_SESSION_INTENT_MISMATCH"));
  }
  const compositionIds = input.compositionFacts.map((entry) => entry.exerciseId);
  if (new Set(compositionIds).size !== compositionIds.length) findings.push(error("DUPLICATE_COMPOSITION_FACT"));
  if (input.explicitTransitionFacts.some((fact) => !transitionTargetValid(fact))) {
    findings.push(error("INVALID_SEQUENCING_TRANSITION_FACT_TARGET"));
  }

  if (input.prescriptionSession.status === "compiled") {
    const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
    findings.push(...assignmentBuild.findings);
    if (assignmentBuild.facts.length === input.skeleton.assignments.length) {
      findings.push(...buildProductionSequencingDependencyGraph(assignmentBuild.facts).findings);
    }
  }
  return findings;
}
