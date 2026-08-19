import {
  FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID,
  FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  buildSessionSequencingInput,
  compileSessionPrescription,
  SESSION_SEQUENCING_POLICY_V1,
  sequenceFinalSession,
  type ExplicitProductionSequencingTransitionFact,
  type FinalSequencingSearchResourcePolicy,
  type ProductionFinalSessionSequencingInput,
  type ProductionFinalSessionSequencingResult,
  type ExerciseDefinition,
} from "../../src";
import type { OwnerPolicyHoldoutScenario } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { buildCatalogCompilerInput } from "./productionPrescriptionCompiler";
import { compositionFact, prepareSequencingCase, sequenceSessionDesignOnly } from "./sessionSequencingDesignLab";

export const PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY: FinalSequencingSearchResourcePolicy = Object.freeze({
  policyId: FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID,
  version: FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION,
  mode: "exact_only",
  maximumStatesExpanded: 1_000_000,
  maximumLegalCompleteOrdersEvaluated: 1_000_000,
  onLimit: "RETURN_SEARCH_INCONCLUSIVE",
  provenance: { source: "synthetic_contract_fixture" as const, sourceRef: "production-final-sequencing:test-search-policy" },
});

export const CLEAR_TRAINING_READINESS = Object.freeze({
  status: "TRAINING_ALLOWED" as const,
  downstreamTrainingAllowed: true,
  reviewRequiredFirst: false,
  urgentExternalReviewRequired: false,
  unresolvedSignalIds: [],
  externallyResolvedSignalIds: [],
  evidence: [],
  reason: "No unresolved training-safety authority blocks ordinary training.",
});

function productionTransitionFacts(input: ReturnType<typeof prepareSequencingCase>): readonly ExplicitProductionSequencingTransitionFact[] {
  const assignmentIdByExerciseId = new Map(input.input.skeleton.assignments.map((assignment) => [
    assignment.exerciseId,
    assignment.routinePrescriptionHandoffId,
  ]));
  const executionAttemptId = input.prescription.plans[0]?.revisionLedger.executionAttemptId ??
    input.prescription.assignmentResults.find((entry) => entry.revisionLedger)?.revisionLedger?.executionAttemptId ??
    `execution-attempt:${input.fixture.scenarioId}`;
  return input.input.explicitTimingFacts.flatMap((fact) => {
    const fromAssignmentId = fact.fromExerciseId ? assignmentIdByExerciseId.get(fact.fromExerciseId) : undefined;
    const toAssignmentId = fact.toExerciseId ? assignmentIdByExerciseId.get(fact.toExerciseId) : undefined;
    if (!fromAssignmentId || !toAssignmentId) return [];
    return [{
      sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
      transitionFactId: fact.factId,
      fromAssignmentId,
      toAssignmentId,
      executionAttemptId,
      factType: fact.instructionType === "recovery"
        ? "inter_exercise_recovery" as const
        : fact.instructionType === "section_boundary"
          ? "section_boundary_duration" as const
          : "setup_duration" as const,
      sourceOwner: fact.sourceOwner,
      sourceRef: fact.provenanceRefs[0] ?? fact.factId,
      reviewState: "reviewed" as const,
      target: { kind: "timing" as const, value: fact.target },
      provenance: {
        source: "synthetic_contract_fixture" as const,
        sourceRef: fact.provenanceRefs[0] ?? fact.factId,
      },
    }];
  });
}

export function prepareProductionFinalSequencingInput(
  fixture: OwnerPolicyHoldoutScenario,
): ProductionFinalSessionSequencingInput {
  const prepared = prepareSequencingCase(fixture);
  const executionAttemptId = prepared.prescription.plans[0]?.revisionLedger.executionAttemptId ??
    prepared.prescription.assignmentResults.find((entry) => entry.revisionLedger)?.revisionLedger?.executionAttemptId ??
    `execution-attempt:${fixture.scenarioId}`;
  return Object.freeze({
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    policy: SESSION_SEQUENCING_POLICY_V1,
    intent: prepared.input.intent,
    skeleton: prepared.input.skeleton,
    sequencingHandoff: prepared.input.sequencingHandoff,
    prescriptionSession: prepared.input.prescriptionSession,
    compositionFacts: prepared.input.compositionFacts,
    currentEquipment: prepared.input.currentEquipment,
    equipmentRealizations: prepared.input.equipmentRealizations,
    explicitTransitionFacts: productionTransitionFacts(prepared),
    availableMinutes: prepared.input.availableMinutes,
    trainingReadiness: CLEAR_TRAINING_READINESS,
    executionAttemptId,
    evaluationTime: prepared.input.evaluationTime,
    searchResourcePolicy: PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
    revisionContext: null,
  });
}

export function runProductionFinalSequencing(
  fixture: OwnerPolicyHoldoutScenario,
): ProductionFinalSessionSequencingResult {
  return sequenceFinalSession(prepareProductionFinalSequencingInput(fixture));
}

export function prepareCatalogProductionFinalSequencingInput(
  exercise: ExerciseDefinition,
): ProductionFinalSessionSequencingInput {
  const compilerInput = buildCatalogCompilerInput(exercise);
  const prescriptionSession = compileSessionPrescription(compilerInput);
  return {
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    policy: SESSION_SEQUENCING_POLICY_V1,
    intent: compilerInput.sessionIntent,
    skeleton: compilerInput.sessionSkeleton,
    sequencingHandoff: buildSessionSequencingInput(compilerInput.sessionSkeleton),
    prescriptionSession,
    compositionFacts: compilerInput.sessionSkeleton.assignments.map((assignment) =>
      compositionFact(assignment.exerciseId)
    ),
    currentEquipment: compilerInput.currentEquipment,
    equipmentRealizations: prescriptionSession.assignmentResults.flatMap((entry) =>
      entry.equipmentRealization ? [entry.equipmentRealization] : []
    ),
    explicitTransitionFacts: [],
    availableMinutes: compilerInput.sessionIntent.availableMinutes,
    trainingReadiness: compilerInput.trainingReadiness,
    executionAttemptId: compilerInput.executionAttemptId,
    evaluationTime: compilerInput.evaluationTime,
    searchResourcePolicy: PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
    revisionContext: null,
  };
}

export function normalizedGoldenSemantics(fixture: OwnerPolicyHoldoutScenario): {
  readonly design: ReturnType<typeof normalizeDesign>;
  readonly production: ReturnType<typeof normalizeProduction> | null;
} {
  const prepared = prepareSequencingCase(fixture);
  const design = sequenceSessionDesignOnly(prepared.input);
  const production = runProductionFinalSequencing(fixture);
  return {
    design: normalizeDesign(design),
    production: production.plan ? normalizeProduction(production.plan) : null,
  };
}

function normalizeDesign(plan: ReturnType<typeof sequenceSessionDesignOnly>) {
  return {
    orderedExerciseIds: plan.compatibilityProjection.orderedExerciseIds,
    sections: plan.steps.map((step) => step.section),
    sectionBoundaries: plan.sectionBoundaries.map((boundary) => ({
      section: boundary.section,
      empty: boundary.empty,
      firstStepIndex: boundary.firstSequenceIndex,
      lastStepIndex: boundary.lastSequenceIndex,
    })),
    dependencyViolationCount: plan.dependencyViolationCount,
    purposePreserved: plan.purposePreserved,
    sourceExposureEventIds: [...plan.sourceExposureEventIds].sort(),
    prescriptionRevisionIds: [...plan.prescriptionRevisionIds].sort(),
    blockIdsByExercise: Object.fromEntries(plan.steps.map((step) => [step.exerciseId, step.doseBlockIds])),
    setupRelationships: plan.transitionFacts.map((fact) => normalizeSetupRelationship(fact.setupRelationship)),
    interferenceClassifications: plan.transitionFacts.map((fact) => fact.fatigueRelationship),
    transitionInstructionTypes: plan.transitionInstructions.map((instruction) => instruction.type),
    durationLowerBoundSeconds: plan.duration.knownLowerBoundSeconds,
    durationUpperBoundKnown: plan.duration.knownUpperBoundSeconds !== null,
    unresolvedRequirementRefs: plan.unresolvedRequirementRefs,
  };
}

function normalizeProduction(plan: NonNullable<ProductionFinalSessionSequencingResult["plan"]>) {
  const dominantAssignmentIds = new Set(plan.steps
    .filter((step) => step.reasonCodes.includes("DOMINANT_PURPOSE_PRESERVED"))
    .map((step) => step.assignmentId));
  return {
    orderedExerciseIds: plan.compatibilityProjection.orderedExerciseIds,
    sections: plan.steps.map((step) => step.section),
    sectionBoundaries: plan.sectionBoundaries.map((boundary) => ({
      section: boundary.section,
      empty: boundary.empty,
      firstStepIndex: boundary.firstStepIndex,
      lastStepIndex: boundary.lastStepIndex,
    })),
    dependencyViolationCount: plan.integrity.dependencyViolationCount,
    purposePreserved: plan.purposePreserved,
    sourceExposureEventIds: [...plan.sourceExposureEventIds].sort(),
    prescriptionRevisionIds: [...plan.finalPrescriptionRevisionIds].sort(),
    blockIdsByExercise: Object.fromEntries(plan.steps.map((step) => [step.exerciseId, step.orderedDoseBlockIds])),
    setupRelationships: plan.consecutiveTransitionFacts.map((fact) => normalizeSetupRelationship(fact.setupRelationship)),
    interferenceClassifications: plan.consecutiveTransitionFacts.map((fact) =>
      dominantAssignmentIds.has(fact.toAssignmentId) &&
      fact.interferenceObservations.some((observation) =>
        ["potential_interference", "reviewed_interference"].includes(observation.classification) &&
        observation.basis.some((basis) => basis.endsWith(":high"))
      ) ? "potential_interference" : "compatible"
    ),
    transitionInstructionTypes: plan.transitionInstructions.map((instruction) => instruction.type),
    durationLowerBoundSeconds: plan.duration.knownLowerBoundSeconds,
    durationUpperBoundKnown: plan.duration.knownUpperBoundSeconds !== null,
    unresolvedRequirementRefs: plan.unresolvedRequirementIds,
  };
}

function normalizeSetupRelationship(value: string): string {
  return ["same_setup", "compatible_setup", "unknown"].includes(value)
    ? value
    : "setup_change_required";
}
