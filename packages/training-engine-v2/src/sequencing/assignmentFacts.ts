import type {
  FinalSessionSequencingValidationFinding,
  ProductionFinalSessionSequencingInput,
  ProductionSequencingAssignmentFact,
} from "./contracts";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { PrescriptionEquipmentRealization } from "../prescription/compiler/contracts";
import { validatePrescriptionRevisionLedger } from "../prescription/compiler/revisions";
import { PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE } from "./contracts";
import { finalSequencingDeterministicToken } from "./planIdentity";

export interface ProductionSequencingAssignmentFactBuildResult {
  readonly facts: readonly ProductionSequencingAssignmentFact[];
  readonly findings: readonly FinalSessionSequencingValidationFinding[];
}

const error = (code: string, targetId?: string): FinalSessionSequencingValidationFinding => ({
  severity: "error",
  code,
  targetId,
});

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function dominantAssignmentIds(input: ProductionFinalSessionSequencingInput): ReadonlySet<string> {
  const mainNeeds = input.intent.needs.filter((need) => need.section === "main");
  const active = mainNeeds.filter((need) => need.priority === "required");
  const considered = active.length > 0 ? active : mainNeeds.filter((need) => need.priority === "preferred");
  const fallback = considered.length > 0 ? considered : mainNeeds;
  const minimumOrder = Math.min(...fallback.map((need) => need.priorityOrder), Number.POSITIVE_INFINITY);
  const dominantNeedIds = new Set(fallback.filter((need) => need.priorityOrder === minimumOrder).map((need) => need.id));
  return new Set(input.skeleton.assignments
    .filter((assignment) => assignment.section === "main" &&
      assignment.satisfiedNeedIds.some((id) => dominantNeedIds.has(id)))
    .map((assignment) => assignment.routinePrescriptionHandoffId));
}

function loadingPotential(
  tags: readonly string[],
  dimensions: readonly string[],
): ProductionSequencingAssignmentFact["gripLoadingPotential"] {
  return tags.some((tag) => dimensions.includes(tag)) ? "high" : "unknown";
}

function loadingClassification(value: string): ProductionSequencingAssignmentFact["localFatigue"] {
  return value === "low" || value === "moderate" || value === "high" ? value : "unknown";
}

function canonicalEquipment(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    supportSurfaces: [...equipment.supportSurfaces].sort(),
    cables: { ...equipment.cables, availableHeights: [...equipment.cables.availableHeights].sort() },
    bands: {
      ...equipment.bands,
      types: [...equipment.bands.types].sort(),
      anchors: [...equipment.bands.anchors].sort((left, right) =>
        left.height.localeCompare(right.height) || left.stableFor.localeCompare(right.stableFor)
      ),
    },
    machines: {
      ...equipment.machines,
      availableMachineIds: [...equipment.machines.availableMachineIds].sort(),
    },
  };
}

function canonicalEquipmentRealization(realization: PrescriptionEquipmentRealization): unknown {
  return {
    status: realization.status,
    requirements: realization.requirementTraces.map((trace) => ({
      requestedCapabilities: [...trace.requestedCapabilities].sort(),
      availableCapabilities: [...trace.availableCapabilities].sort(),
      checks: trace.checks.map((check) => ({
        capability: check.capability,
        requirementKind: check.requirementKind,
        available: check.available,
      })).sort((left, right) =>
        left.capability.localeCompare(right.capability) ||
        left.requirementKind.localeCompare(right.requirementKind)
      ),
    })).sort((left, right) => finalSequencingDeterministicToken(left).localeCompare(
      finalSequencingDeterministicToken(right),
    )),
    missingCapabilityIds: [...realization.missingCapabilityIds].sort(),
  };
}

export function buildProductionSequencingAssignmentFacts(
  input: ProductionFinalSessionSequencingInput,
): ProductionSequencingAssignmentFactBuildResult {
  const findings: FinalSessionSequencingValidationFinding[] = [];
  const skeletonIds = input.skeleton.assignments.map((entry) => entry.routinePrescriptionHandoffId);
  const handoffIds = input.sequencingHandoff.assignments.map((entry) => entry.routinePrescriptionHandoffId);
  const prescriptionHandoffIds = input.prescriptionSession.assignmentResults.flatMap((entry) =>
    entry.handoffAssignment ? [entry.handoffAssignment.handoffId] : []
  );
  for (const id of duplicateValues(skeletonIds)) findings.push(error("DUPLICATE_SESSION_ASSIGNMENT", id));
  for (const id of duplicateValues(handoffIds)) findings.push(error("DUPLICATE_SEQUENCING_HANDOFF_ASSIGNMENT", id));
  for (const id of duplicateValues(prescriptionHandoffIds)) findings.push(error("DUPLICATE_PRESCRIPTION_ASSIGNMENT_RESULT", id));

  const skeletonById = new Map(input.skeleton.assignments.map((entry) => [entry.routinePrescriptionHandoffId, entry]));
  const handoffById = new Map(input.sequencingHandoff.assignments.map((entry) => [entry.routinePrescriptionHandoffId, entry]));
  const prescriptionResultById = new Map(input.prescriptionSession.assignmentResults.flatMap((entry) =>
    entry.handoffAssignment ? [[entry.handoffAssignment.handoffId, entry] as const] : []
  ));
  const planByAssignmentId = new Map(input.prescriptionSession.plans.map((plan) => [
    plan.sourceExposureEvent.sessionAssignmentId,
    plan,
  ]));
  const sourceEventByAssignmentId = new Map(input.prescriptionSession.sourceExposureEvents.map((event) => [
    event.sessionAssignmentId,
    event,
  ]));
  const compositionByExerciseId = new Map(input.compositionFacts.map((entry) => [entry.exerciseId, entry]));
  const dominantIds = dominantAssignmentIds(input);
  const equipmentRealizationIds = input.equipmentRealizations.map((entry) => entry.realizationId);
  for (const id of duplicateValues(equipmentRealizationIds)) {
    findings.push(error("DUPLICATE_EQUIPMENT_REALIZATION", id));
  }

  for (const id of duplicateValues(input.prescriptionSession.plans.map((plan) => plan.sourceExposureEvent.sessionAssignmentId))) {
    findings.push(error("DUPLICATE_PRESCRIPTION_PLAN_ASSIGNMENT_MAPPING", id));
  }
  for (const id of duplicateValues(input.prescriptionSession.sourceExposureEvents.map((event) => event.sessionAssignmentId))) {
    findings.push(error("DUPLICATE_SOURCE_EVENT_ASSIGNMENT_MAPPING", id));
  }
  for (const id of planByAssignmentId.keys()) {
    if (!skeletonById.has(id)) findings.push(error("EXTRA_PRESCRIPTION_PLAN", id));
  }
  for (const id of prescriptionResultById.keys()) {
    if (!skeletonById.has(id)) findings.push(error("EXTRA_PRESCRIPTION_ASSIGNMENT_RESULT", id));
  }

  const exerciseIds = input.skeleton.assignments.map((entry) => entry.exerciseId);
  for (const id of duplicateValues(exerciseIds)) findings.push(error("AMBIGUOUS_EXERCISE_IDENTITY_IN_SESSION", id));

  const facts: ProductionSequencingAssignmentFact[] = [];
  for (const assignmentId of [...skeletonIds].sort()) {
    const assignment = skeletonById.get(assignmentId)!;
    const handoff = handoffById.get(assignmentId);
    const result = prescriptionResultById.get(assignmentId);
    const plan = planByAssignmentId.get(assignmentId);
    const sourceEvent = sourceEventByAssignmentId.get(assignmentId);
    const composition = compositionByExerciseId.get(assignment.exerciseId);
    if (!handoff) findings.push(error("MISSING_SEQUENCING_HANDOFF_ASSIGNMENT", assignmentId));
    if (!result) findings.push(error("MISSING_PRESCRIPTION_ASSIGNMENT_RESULT", assignmentId));
    if (!sourceEvent) findings.push(error("MISSING_SOURCE_EXPOSURE_EVENT", assignmentId));
    if (!plan && result?.status === "compiled") findings.push(error("MISSING_EXECUTABLE_PRESCRIPTION_PLAN", assignmentId));
    if (!composition) findings.push(error("MISSING_COMPOSITION_FACT", assignmentId));
    if (!handoff || !result || !sourceEvent || !plan || !composition) continue;

    if (result.assignment?.routinePrescriptionHandoffId !== assignmentId) {
      findings.push(error("PRESCRIPTION_RESULT_WRONG_ASSIGNMENT_MAPPING", assignmentId));
    }
    if (result.sourceExposureEvent?.sessionAssignmentId !== assignmentId || sourceEvent.sessionAssignmentId !== assignmentId) {
      findings.push(error("SOURCE_EVENT_WRONG_ASSIGNMENT_MAPPING", assignmentId));
    }
    if (plan.sourceExposureEvent.sessionAssignmentId !== assignmentId) {
      findings.push(error("PRESCRIPTION_PLAN_WRONG_ASSIGNMENT_MAPPING", assignmentId));
    }
    if (finalSequencingDeterministicToken(result.plan) !== finalSequencingDeterministicToken(plan)) {
      findings.push(error("PRESCRIPTION_PLAN_RESULT_MISMATCH", assignmentId));
    }
    if (!result.revisionLedger ||
      finalSequencingDeterministicToken(result.revisionLedger) !==
        finalSequencingDeterministicToken(plan.revisionLedger)) {
      findings.push(error("PRESCRIPTION_REVISION_LEDGER_RESULT_MISMATCH", assignmentId));
    }
    for (const code of validatePrescriptionRevisionLedger(plan.revisionLedger)) {
      findings.push(error(`INVALID_PRESCRIPTION_REVISION_LEDGER:${code}`, assignmentId));
    }
    const semanticExerciseIds = [
      assignment.exerciseId,
      handoff.exerciseId,
      result.assignment?.exerciseId,
      result.handoffAssignment?.exerciseId,
      sourceEvent.exerciseId,
      plan.exerciseId,
      composition.exerciseId,
    ];
    if (semanticExerciseIds.some((id) => id !== assignment.exerciseId)) {
      findings.push(error("ASSIGNMENT_EXERCISE_IDENTITY_MISMATCH", assignmentId));
    }
    if (
      result.assignment?.section !== assignment.section ||
      result.assignment?.role !== assignment.role ||
      result.handoffAssignment?.section !== assignment.section ||
      result.handoffAssignment?.role !== assignment.role
    ) findings.push(error("ASSIGNMENT_SECTION_OR_ROLE_MISMATCH", assignmentId));
    if (
      plan.revisionLedger.executionAttemptId !== input.executionAttemptId ||
      plan.revisionLedger.sourceExposureEventId !== sourceEvent.sourceExposureEventId
    ) findings.push(error("PRESCRIPTION_EXECUTION_ATTEMPT_MISMATCH", assignmentId));
    if (plan.revisionLedger.finalRevisionId !== plan.prescriptionRevisionId) {
      findings.push(error("PRESCRIPTION_FINAL_REVISION_MISMATCH", assignmentId));
    }
    const blockIds = plan.doseBlocks.map((block) => block.blockId);
    if (new Set(blockIds).size !== blockIds.length) {
      findings.push(error("DUPLICATE_PRESCRIPTION_BLOCK_ID", assignmentId));
    }
    if (plan.doseBlocks.some((block, index) =>
      block.order.index !== index || block.order.dependsOnBlockIds.some((dependencyId) =>
        blockIds.indexOf(dependencyId) < 0 || blockIds.indexOf(dependencyId) >= index
      )
    )) findings.push(error("PRESCRIPTION_BLOCK_ORDER_INVALID", assignmentId));
    const restIds = plan.restInstructions.map((rest) => rest.restInstructionId);
    if (new Set(restIds).size !== restIds.length) {
      findings.push(error("DUPLICATE_PRESCRIPTION_REST_INSTRUCTION", assignmentId));
    }
    if (plan.restInstructions.some((rest) => [
      rest.appliesAfterBlockId,
      rest.appliesBeforeBlockId,
      rest.appliesWithinBlockId,
    ].some((blockId) => blockId !== undefined && !blockIds.includes(blockId)))) {
      findings.push(error("PRESCRIPTION_REST_REFERENCES_UNKNOWN_BLOCK", assignmentId));
    }

    const needs = assignment.satisfiedNeedIds.flatMap((id) => {
      const need = input.intent.needs.find((entry) => entry.id === id);
      return need ? [need] : [];
    });
    const incomingEdges = input.sequencingHandoff.orderingConstraints.filter((edge) =>
      edge.afterExerciseId === assignment.exerciseId
    );
    const dependencyAssignmentIds = incomingEdges.flatMap((edge) => {
      const dependency = input.skeleton.assignments.find((candidate) => candidate.exerciseId === edge.beforeExerciseId);
      return dependency ? [dependency.routinePrescriptionHandoffId] : [];
    });
    const unresolvedRequirementIds = [...new Set([
      ...assignment.executionBlockingPrescriptionRequirementIds,
      ...plan.unresolvedRequirementRefs,
    ])].sort();
    const allStressTags = [...composition.intrinsicStressTags, ...composition.potentialStressTags];
    const equipmentRealization = result.equipmentRealization;
    const matchingRealizations = input.equipmentRealizations.filter((entry) =>
      entry.realizationId === equipmentRealization?.realizationId
    );
    if (!equipmentRealization || matchingRealizations.length !== 1 ||
      finalSequencingDeterministicToken(matchingRealizations[0]) !== finalSequencingDeterministicToken(equipmentRealization)) {
      findings.push(error("EQUIPMENT_REALIZATION_MAPPING_MISMATCH", assignmentId));
    }
    if (equipmentRealization &&
      finalSequencingDeterministicToken(canonicalEquipment(equipmentRealization.equipment)) !==
      finalSequencingDeterministicToken(canonicalEquipment(input.currentEquipment))) {
      findings.push(error("CURRENT_EQUIPMENT_SNAPSHOT_MISMATCH", assignmentId));
    }

    facts.push(Object.freeze({
      sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
      assignmentId,
      exerciseId: assignment.exerciseId,
      section: assignment.section,
      role: assignment.role,
      sourceExposureEventId: sourceEvent.sourceExposureEventId,
      prescriptionId: plan.prescriptionId,
      finalPrescriptionRevisionId: plan.prescriptionRevisionId,
      orderedDoseBlockIds: plan.doseBlocks.map((block) => block.blockId),
      withinExerciseRestInstructionIds: plan.restInstructions.map((rest) => rest.restInstructionId),
      satisfiedNeedIds: [...assignment.satisfiedNeedIds].sort(),
      dependencyAssignmentIds: [...new Set(dependencyAssignmentIds)].sort(),
      dependencyIds: incomingEdges.flatMap((edge) => edge.dependencyIds).sort(),
      needPriorities: needs.map((need) => need.priority),
      plannerPriorityOrders: needs.map((need) => need.priorityOrder).sort((left, right) => left - right),
      requiredDirectObjective: needs.some((need) =>
        need.priority === "required" &&
        need.selection.requestedRole === assignment.role &&
        (
          need.selection.targetMovementRoles.length > 0 ||
          need.selection.targetActionFunctions.length > 0 ||
          need.selection.targetMuscles.length > 0 ||
          need.selection.targetBodyRegions.length > 0
        )
      ),
      dominantPurposeRelationship: dominantIds.has(assignmentId)
        ? "dominant"
        : assignment.section === "main" ? "supporting" : "none",
      continuityClassification: assignment.continuityClassification,
      executionReadiness: unresolvedRequirementIds.length === 0 ? "ready" : "unresolved",
      unresolvedRequirementIds,
      setupSignature: composition.setupSignature,
      supportSignature: composition.supportSignature,
      resistancePathSignature: composition.resistancePathSignature,
      equipmentRealizationId: equipmentRealization?.realizationId ?? "unknown",
      equipmentSignature: equipmentRealization
        ? finalSequencingDeterministicToken(canonicalEquipmentRealization(equipmentRealization))
        : "unknown",
      localFatigue: loadingClassification(composition.localFatigue),
      systemicFatigue: loadingClassification(composition.systemicFatigue),
      axialLoading: loadingClassification(composition.axialLoading),
      intrinsicStressFacts: [...composition.intrinsicStressTags].sort(),
      potentialStressFacts: [...composition.potentialStressTags].sort(),
      gripLoadingPotential: loadingPotential(allStressTags, ["grip_intensive", "grip_loading"]),
      trunkBracingPotential: loadingPotential(allStressTags, [
        "long_lever_core", "loaded_trunk_rotation", "lateral_trunk_loading", "loaded_spinal_flexion",
        "loaded_spinal_extension",
      ]),
      prescriptionEffortFacts: plan.doseBlocks.flatMap((block) =>
        block.dose.effort ? [block.dose.effort] : []
      ),
      prescriptionDurationInterval: plan.durationInterval,
      provenance: [
        { source: "prescription_contract" as const, sourceRef: `session-assignment:${assignmentId}` },
        { source: "prescription_contract" as const, sourceRef: `source-event:${sourceEvent.sourceExposureEventId}` },
        { source: "prescription_contract" as const, sourceRef: `prescription-revision:${plan.prescriptionRevisionId}` },
      ],
    }));
  }
  const expectedRealizationIds = new Set(input.prescriptionSession.assignmentResults.flatMap((entry) =>
    entry.equipmentRealization ? [entry.equipmentRealization.realizationId] : []
  ));
  for (const id of equipmentRealizationIds) {
    if (!expectedRealizationIds.has(id)) findings.push(error("EXTRA_EQUIPMENT_REALIZATION", id));
  }
  return { facts: facts.sort((left, right) => left.assignmentId.localeCompare(right.assignmentId)), findings };
}
