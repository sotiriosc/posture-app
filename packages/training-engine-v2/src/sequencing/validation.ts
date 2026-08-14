import type {
  FinalSequencingIntegrityTrace,
  FinalSessionSequencingValidationFinding,
  ProductionFinalSessionSequencePlan,
  ProductionFinalSessionSequencingInput,
  ProductionSequencingAssignmentFact,
} from "./contracts";
import { PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE } from "./contracts";
import { PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE } from "./policies";
import { validateSequencingPlanRevisionLedger } from "./planRevisions";
import { buildFinalSessionSequencePlanId } from "./planIdentity";
import { buildSequencedSessionDurationInterval } from "./durationInterval";
import { buildFinalSessionSequenceCompatibilityProjection } from "./compatibilityProjection";

function multisetDifferenceCount(left: readonly string[], right: readonly string[]): number {
  const remaining = [...right];
  let count = 0;
  for (const value of left) {
    const index = remaining.indexOf(value);
    if (index === -1) count += 1;
    else remaining.splice(index, 1);
  }
  return count;
}

export function deriveFinalSequencingIntegrityTrace(input: {
  readonly sequencingInput: ProductionFinalSessionSequencingInput;
  readonly assignmentFacts: readonly ProductionSequencingAssignmentFact[];
  readonly plan: Pick<
    ProductionFinalSessionSequencePlan,
    | "steps"
    | "sourceExposureEventIds"
    | "prescriptionIds"
    | "finalPrescriptionRevisionIds"
    | "transitionInstructions"
    | "duration"
  >;
}): FinalSequencingIntegrityTrace {
  const expectedIds = input.assignmentFacts.map((fact) => fact.assignmentId);
  const actualIds = input.plan.steps.map((step) => step.assignmentId);
  const duplicateAssignmentCount = actualIds.length - new Set(actualIds).size;
  const assignmentAdditionCount = multisetDifferenceCount(actualIds, expectedIds);
  const assignmentRemovalCount = multisetDifferenceCount(expectedIds, actualIds);
  const expectedById = new Map(input.assignmentFacts.map((fact) => [fact.assignmentId, fact]));
  const sourceEventRewriteCount = input.plan.steps.filter((step) =>
    expectedById.get(step.assignmentId)?.sourceExposureEventId !== step.sourceExposureEventId
  ).length + Math.max(input.plan.sourceExposureEventIds.length, input.plan.steps.length) -
    input.plan.sourceExposureEventIds.filter((id, index) => id === input.plan.steps[index]?.sourceExposureEventId).length;
  const prescriptionIdRewriteCount = input.plan.steps.filter((step) =>
    expectedById.get(step.assignmentId)?.prescriptionId !== step.prescriptionId
  ).length + Math.max(input.plan.prescriptionIds.length, input.plan.steps.length) -
    input.plan.prescriptionIds.filter((id, index) => id === input.plan.steps[index]?.prescriptionId).length;
  const prescriptionRevisionRewriteCount = input.plan.steps.filter((step) =>
    expectedById.get(step.assignmentId)?.finalPrescriptionRevisionId !== step.finalPrescriptionRevisionId
  ).length + Math.max(input.plan.finalPrescriptionRevisionIds.length, input.plan.steps.length) -
    input.plan.finalPrescriptionRevisionIds.filter((id, index) =>
      id === input.plan.steps[index]?.finalPrescriptionRevisionId
    ).length;
  const blockReorderCount = input.plan.steps.filter((step) => JSON.stringify(
    expectedById.get(step.assignmentId)?.orderedDoseBlockIds ?? []
  ) !== JSON.stringify(step.orderedDoseBlockIds)).length;
  const allStepBlockIds = input.plan.steps.flatMap((step) => step.orderedDoseBlockIds);
  const blockInterleavingCount = allStepBlockIds.length - new Set(allStepBlockIds).size;
  const position = new Map(input.plan.steps.map((step) => [step.assignmentId, step.sequenceIndex]));
  const dependencyViolationCount = input.plan.steps.reduce((count, step) => count +
    step.dependencyAssignmentIds.filter((dependencyId) =>
      (position.get(dependencyId) ?? Number.POSITIVE_INFINITY) >= step.sequenceIndex
    ).length, 0);
  const sectionIndex = new Map(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE.map((section, index) => [section, index]));
  const sectionViolationCount = input.plan.steps.slice(1).filter((step, index) =>
    (sectionIndex.get(input.plan.steps[index].section) ?? 99) > (sectionIndex.get(step.section) ?? -1)
  ).length;
  const mainPurposeLossCount = input.assignmentFacts.some((fact) => fact.dominantPurposeRelationship === "dominant") &&
    !input.plan.steps.some((step) => expectedById.get(step.assignmentId)?.dominantPurposeRelationship === "dominant") ? 1 : 0;
  const accessoryPurposeLossCount = input.assignmentFacts.some((fact) =>
    fact.section === "accessory" && fact.needPriorities.includes("required")
  ) && !input.plan.steps.some((step) => {
    const fact = expectedById.get(step.assignmentId);
    return fact?.section === "accessory" && fact.needPriorities.includes("required");
  }) ? 1 : 0;
  const policyCreatedStructureCount = assignmentAdditionCount;
  const restIds = new Set(input.assignmentFacts.flatMap((fact) => fact.withinExerciseRestInstructionIds));
  const restOverwriteCount = input.plan.transitionInstructions.filter((instruction) =>
    restIds.has(instruction.sourceTransitionFactId ?? "") || restIds.has(instruction.instructionId)
  ).length;
  const timingFactReuseCount = input.plan.duration.timingFactReuseCount;
  const fakeDurationCount = input.plan.transitionInstructions.filter((instruction) =>
    ["exact", "range"].includes(instruction.target.kind) && instruction.sourceTransitionFactId === null
  ).length + (input.plan.duration.noInventedTime === true ? 0 : 1);
  const counts = {
    assignmentAdditionCount,
    assignmentRemovalCount,
    duplicateAssignmentCount,
    sourceEventRewriteCount,
    prescriptionIdRewriteCount,
    prescriptionRevisionRewriteCount,
    blockReorderCount,
    blockInterleavingCount,
    dependencyViolationCount,
    sectionViolationCount,
    mainPurposeLossCount,
    accessoryPurposeLossCount,
    policyCreatedStructureCount,
    restOverwriteCount,
    timingFactReuseCount,
    fakeDurationCount,
  };
  return { ...counts, hardFailureCount: Object.values(counts).reduce((total, count) => total + count, 0) };
}

export function validateFinalSessionSequencePlan(input: {
  readonly sequencingInput: ProductionFinalSessionSequencingInput;
  readonly assignmentFacts: readonly ProductionSequencingAssignmentFact[];
  readonly plan: ProductionFinalSessionSequencePlan;
}): readonly FinalSessionSequencingValidationFinding[] {
  const findings: FinalSessionSequencingValidationFinding[] = [];
  const derived = deriveFinalSequencingIntegrityTrace({
    sequencingInput: input.sequencingInput,
    assignmentFacts: input.assignmentFacts,
    plan: input.plan,
  });
  if (JSON.stringify(derived) !== JSON.stringify(input.plan.integrity)) {
    findings.push({ severity: "error", code: "SEQUENCING_INTEGRITY_TRACE_NOT_DERIVED" });
  }
  const expectedDuration = buildSequencedSessionDurationInterval({
    prescriptionLowerBoundSeconds: input.sequencingInput.prescriptionSession.sessionDurationInterval.knownLowerBoundSeconds,
    prescriptionUpperBoundSeconds: input.sequencingInput.prescriptionSession.sessionDurationInterval.knownUpperBoundSeconds,
    prescriptionUnknownComponents: input.sequencingInput.prescriptionSession.sessionDurationInterval.unknownComponents,
    prescriptionIntervalRefs: input.assignmentFacts.map((fact) => fact.finalPrescriptionRevisionId),
    transitionInstructions: input.plan.transitionInstructions,
    availableMinutes: input.sequencingInput.availableMinutes,
  });
  if (JSON.stringify(expectedDuration) !== JSON.stringify(input.plan.duration)) {
    findings.push({ severity: "error", code: "SEQUENCE_DURATION_INTERVAL_NOT_DERIVED" });
  }
  const expectedCompatibility = buildFinalSessionSequenceCompatibilityProjection({
    steps: input.plan.steps,
    transitions: input.plan.consecutiveTransitionFacts,
    duration: input.plan.duration,
  });
  if (JSON.stringify(expectedCompatibility) !== JSON.stringify(input.plan.compatibilityProjection)) {
    findings.push({ severity: "error", code: "SEQUENCE_COMPATIBILITY_PROJECTION_NOT_DERIVED" });
  }
  if (
    input.plan.sequencingContract.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId ||
    input.plan.sequencingContract.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
  ) findings.push({ severity: "error", code: "UNSUPPORTED_SEQUENCING_CONTRACT_VERSION" });
  if (
    input.plan.sequencePlanId !== input.plan.revisionLedger.sequencePlanId ||
    input.plan.sequenceRevisionId !== input.plan.revisionLedger.finalRevisionId ||
    input.plan.executionAttemptId !== input.plan.revisionLedger.executionAttemptId
  ) findings.push({ severity: "error", code: "SEQUENCE_PLAN_REVISION_LEDGER_MISMATCH" });
  if (input.plan.sequencePlanId !== buildFinalSessionSequencePlanId({
    sequencingContract: input.plan.sequencingContract,
    sessionIntentId: input.plan.sessionIntentId,
    executionAttemptId: input.plan.executionAttemptId,
  })) findings.push({ severity: "error", code: "SEQUENCE_PLAN_ID_NOT_DERIVED" });
  findings.push(...validateSequencingPlanRevisionLedger(input.plan.revisionLedger).map((code) => ({
    severity: "error" as const,
    code,
  })));
  if (input.plan.steps.some((step, index) => step.sequenceIndex !== index)) {
    findings.push({ severity: "error", code: "INVALID_SEQUENCE_STEP_INDEX" });
  }
  const assignmentFactById = new Map(input.assignmentFacts.map((fact) => [fact.assignmentId, fact]));
  if (input.plan.steps.some((step) => {
    const fact = assignmentFactById.get(step.assignmentId);
    return !fact || step.exerciseId !== fact.exerciseId || step.section !== fact.section ||
      step.role !== fact.role || step.sourceExposureEventId !== fact.sourceExposureEventId ||
      step.prescriptionId !== fact.prescriptionId ||
      step.finalPrescriptionRevisionId !== fact.finalPrescriptionRevisionId ||
      JSON.stringify(step.orderedDoseBlockIds) !== JSON.stringify(fact.orderedDoseBlockIds) ||
      JSON.stringify(step.satisfiedNeedIds) !== JSON.stringify(fact.satisfiedNeedIds) ||
      JSON.stringify(step.dependencyAssignmentIds) !== JSON.stringify(fact.dependencyAssignmentIds) ||
      step.executionReadiness !== fact.executionReadiness ||
      step.sideOrder !== "SIDE_ORDER_NOT_PRESCRIBED";
  })) findings.push({ severity: "error", code: "SEQUENCE_STEP_ASSIGNMENT_FACT_MISMATCH" });
  if (input.plan.consecutiveTransitionFacts.length !== Math.max(0, input.plan.steps.length - 1) ||
    input.plan.consecutiveTransitionFacts.some((transition, index) =>
      transition.fromAssignmentId !== input.plan.steps[index]?.assignmentId ||
      transition.toAssignmentId !== input.plan.steps[index + 1]?.assignmentId
    )) findings.push({ severity: "error", code: "INVALID_CONSECUTIVE_TRANSITION_CHAIN" });
  if (new Set(input.plan.consecutiveTransitionFacts.map((transition) => transition.transitionFactId)).size !==
    input.plan.consecutiveTransitionFacts.length) {
    findings.push({ severity: "error", code: "DUPLICATE_CONSECUTIVE_TRANSITION_FACT" });
  }
  if (input.plan.consecutiveTransitionFacts.some((transition) =>
    transition.executionAttemptId !== input.plan.executionAttemptId ||
    transition.sequencingContract.contractId !== input.plan.sequencingContract.contractId ||
    transition.sequencingContract.contractVersion !== input.plan.sequencingContract.contractVersion
  )) findings.push({ severity: "error", code: "TRANSITION_FACT_PLAN_IDENTITY_MISMATCH" });
  const transitionIds = new Set(input.plan.consecutiveTransitionFacts.map((transition) => transition.transitionFactId));
  if (input.plan.transitionInstructions.some((instruction) => !transitionIds.has(instruction.transitionFactId))) {
    findings.push({ severity: "error", code: "TRANSITION_INSTRUCTION_REFERENCES_UNKNOWN_TRANSITION" });
  }
  if (new Set(input.plan.transitionInstructions.map((instruction) => instruction.instructionId)).size !==
    input.plan.transitionInstructions.length) {
    findings.push({ severity: "error", code: "DUPLICATE_TRANSITION_INSTRUCTION_ID" });
  }
  if (input.plan.transitionInstructions.some((instruction) =>
    instruction.countedInDurationExactlyOnce !== true ||
    instruction.sequencingContract.contractId !== input.plan.sequencingContract.contractId ||
    instruction.sequencingContract.contractVersion !== input.plan.sequencingContract.contractVersion
  )) findings.push({ severity: "error", code: "INVALID_TRANSITION_INSTRUCTION_CONTRACT" });
  const explicitTransitionFactsById = new Map(input.sequencingInput.explicitTransitionFacts.map((fact) => [
    fact.transitionFactId,
    fact,
  ]));
  if (input.plan.transitionInstructions.some((instruction) => {
    if (!instruction.sourceTransitionFactId) return false;
    const source = explicitTransitionFactsById.get(instruction.sourceTransitionFactId);
    const transition = input.plan.consecutiveTransitionFacts.find((candidate) =>
      candidate.transitionFactId === instruction.transitionFactId
    );
    const expectedType = instruction.type === "setup" ? "setup_duration"
      : instruction.type === "recovery" ? "inter_exercise_recovery"
        : instruction.type === "section_boundary" ? "section_boundary_duration" : null;
    return !source || !transition || source.factType !== expectedType ||
      source.fromAssignmentId !== transition.fromAssignmentId ||
      source.toAssignmentId !== transition.toAssignmentId;
  })) findings.push({ severity: "error", code: "TRANSITION_INSTRUCTION_SOURCE_FACT_MISMATCH" });
  for (const transition of input.plan.consecutiveTransitionFacts) {
    const instructions = input.plan.transitionInstructions.filter((instruction) =>
      instruction.transitionFactId === transition.transitionFactId
    );
    const expectedTypes = transition.sectionRelationship === "section_boundary"
      ? ["setup", "recovery", "section_boundary"]
      : ["setup", "recovery"];
    if (JSON.stringify(instructions.map((instruction) => instruction.type).sort()) !==
      JSON.stringify(expectedTypes.sort())) {
      findings.push({ severity: "error", code: "INVALID_TRANSITION_INSTRUCTION_COVERAGE" });
    }
  }
  const boundarySections = input.plan.sectionBoundaries.map((boundary) => boundary.section);
  if (JSON.stringify(boundarySections) !== JSON.stringify(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE)) {
    findings.push({ severity: "error", code: "INVALID_SEQUENCE_SECTION_BOUNDARIES" });
  }
  if (input.plan.sectionBoundaries.some((boundary) => {
    const positions = input.plan.steps
      .filter((step) => step.section === boundary.section)
      .map((step) => step.sequenceIndex);
    if (positions.length === 0) {
      return !boundary.empty || boundary.firstStepIndex !== null || boundary.lastStepIndex !== null ||
        boundary.priorAssignmentId !== null || boundary.nextAssignmentId !== null ||
        boundary.transitionFactId !== null;
    }
    const first = positions[0];
    const last = positions.at(-1)!;
    const prior = input.plan.steps[first - 1] ?? null;
    const next = input.plan.steps[last + 1] ?? null;
    const boundaryTransition = prior
      ? input.plan.consecutiveTransitionFacts.find((transition) =>
        transition.fromAssignmentId === prior.assignmentId &&
        transition.toAssignmentId === input.plan.steps[first].assignmentId
      ) ?? null
      : null;
    return boundary.empty || boundary.firstStepIndex !== first || boundary.lastStepIndex !== last ||
      boundary.priorAssignmentId !== (prior?.assignmentId ?? null) ||
      boundary.nextAssignmentId !== (next?.assignmentId ?? null) ||
      boundary.transitionFactId !== (boundaryTransition?.transitionFactId ?? null) ||
      JSON.stringify(boundary.unknownDurationComponents) !==
        JSON.stringify(boundaryTransition?.unknownTimingComponents ?? []);
  })) findings.push({ severity: "error", code: "SEQUENCE_SECTION_BOUNDARY_NOT_DERIVED" });
  const expectedAssignmentIds = input.assignmentFacts.map((fact) => fact.assignmentId).sort();
  const expectedDependencies = Object.fromEntries(input.assignmentFacts.map((fact) => [
    fact.assignmentId,
    fact.dependencyAssignmentIds,
  ]));
  const expectedBlocks = Object.fromEntries(input.plan.steps.map((step) => [
    step.assignmentId,
    step.orderedDoseBlockIds,
  ]));
  const expectedDominantIds = input.assignmentFacts
    .filter((fact) => fact.dominantPurposeRelationship === "dominant")
    .map((fact) => fact.assignmentId)
    .sort();
  const expectedSupportingIds = input.assignmentFacts
    .filter((fact) => fact.section === "warmup" || fact.section === "activation")
    .map((fact) => fact.assignmentId)
    .sort();
  const supportingWorkLossCount = expectedSupportingIds.filter((id) =>
    !input.plan.steps.some((step) => step.assignmentId === id)
  ).length;
  if (JSON.stringify(input.plan.assignmentPreservationTrace) !== JSON.stringify({
    expectedAssignmentIds,
    orderedAssignmentIds: input.plan.steps.map((step) => step.assignmentId),
    additionCount: derived.assignmentAdditionCount,
    removalCount: derived.assignmentRemovalCount,
    duplicateCount: derived.duplicateAssignmentCount,
  })) findings.push({ severity: "error", code: "ASSIGNMENT_PRESERVATION_TRACE_NOT_DERIVED" });
  if (JSON.stringify(input.plan.dependencyTrace) !== JSON.stringify({
    dependenciesByAssignmentId: expectedDependencies,
    violationCount: derived.dependencyViolationCount,
  })) findings.push({ severity: "error", code: "DEPENDENCY_TRACE_NOT_DERIVED" });
  if (JSON.stringify(input.plan.blockAtomicityTrace) !== JSON.stringify({
    orderedBlockIdsByAssignmentId: expectedBlocks,
    reorderCount: derived.blockReorderCount,
    interleavingCount: derived.blockInterleavingCount,
  })) findings.push({ severity: "error", code: "BLOCK_ATOMICITY_TRACE_NOT_DERIVED" });
  if (JSON.stringify(input.plan.purposePreservationTrace) !== JSON.stringify({
    dominantAssignmentIds: expectedDominantIds,
    preserved: derived.mainPurposeLossCount === 0,
    lossCount: derived.mainPurposeLossCount,
  })) findings.push({ severity: "error", code: "PURPOSE_PRESERVATION_TRACE_NOT_DERIVED" });
  if (JSON.stringify(input.plan.supportingWorkTrace) !== JSON.stringify({
    supportingAssignmentIds: expectedSupportingIds,
    preserved: supportingWorkLossCount === 0,
    lossCount: supportingWorkLossCount,
  })) findings.push({ severity: "error", code: "SUPPORTING_WORK_TRACE_NOT_DERIVED" });
  if (
    input.plan.purposePreserved !== input.plan.purposePreservationTrace.preserved ||
    input.plan.supportingWorkPreserved !== input.plan.supportingWorkTrace.preserved
  ) findings.push({ severity: "error", code: "SEQUENCE_PRESERVATION_SUMMARY_NOT_DERIVED" });
  for (const [key, value] of Object.entries(derived)) {
    if (key !== "hardFailureCount" && value !== 0) {
      findings.push({ severity: "error", code: `SEQUENCING_INTEGRITY_${key.toUpperCase()}` });
    }
  }
  if (!input.plan.search.optimalityProven || input.plan.search.limitReached) {
    findings.push({ severity: "error", code: "NONOPTIMAL_SEQUENCE_MARKED_EXECUTABLE" });
  }
  if (input.plan.status !== "sequenced_exact_optimal" || input.plan.executable !== true) {
    findings.push({ severity: "error", code: "INVALID_EXECUTABLE_SEQUENCE_STATUS" });
  }
  return findings;
}
