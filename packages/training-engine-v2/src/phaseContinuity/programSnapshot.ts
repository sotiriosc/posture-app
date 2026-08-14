import type { PhaseId } from "../domain/phase";
import type { SessionIntent } from "../domain/session";
import type { PrescriptionSessionCompilationResult } from "../prescription/compiler/contracts";
import { stableId } from "../prescription/compiler/utilities";
import type { ProductionFinalSessionSequencePlan } from "../sequencing/contracts";
import type { SessionSkeleton } from "../sessionComposer/contracts";
import type { ProductionPostPrescriptionWeekValidationResult } from "../weekValidation/contracts";
import type { PrescribedWeekSourceSnapshot } from "../weekValidation/sourceContracts";

export const PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_ID =
  "PRODUCTION_PHASE_PROGRAM_SNAPSHOT" as const;
export const PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE = Object.freeze({
  contractId: PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_ID,
  contractVersion: PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_VERSION,
});
export type ProductionPhaseProgramSnapshotContractReference =
  typeof PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE;

export type ProductionPhaseSnapshotEntityKind =
  | "weekly_objective" | "opportunity" | "reservation" | "session" | "session_need"
  | "assignment" | "source_event" | "prescription" | "sequence_step";

export interface ProductionPhaseProgramEntitySummary {
  readonly kind: ProductionPhaseSnapshotEntityKind;
  readonly entityId: string;
  readonly semanticResponsibilityKey: string;
  readonly sessionId: string | null;
  readonly exerciseId: string | null;
  readonly sequenceIndex: number | null;
  readonly section: string | null;
  readonly active: boolean;
  readonly sourceRefs: readonly string[];
  readonly repetitionSemanticKeys?: readonly string[];
  readonly tempoSemanticKeys?: readonly string[];
}

export interface ProductionPhaseProductiveAnchorSummary {
  readonly exerciseId: string;
  readonly activeNeedIds: readonly string[];
  readonly classification: "anchor" | "stable_supporting" | "rotation_eligible";
  readonly productive: boolean;
  readonly equipmentLost: boolean;
  readonly explicitlyBlocked: boolean;
  readonly repeatedAdverseEvidence: boolean;
  readonly sourceRefs: readonly string[];
}

export interface ProductionPhaseSupportingContinuitySummary {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly section: "warmup" | "activation";
  readonly dependencyIds: readonly string[];
  readonly required: boolean;
}

export interface ProductionPhaseProgramSnapshot {
  readonly snapshotContract: ProductionPhaseProgramSnapshotContractReference;
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly weeklyIntentId: string;
  readonly weekAllocationPlanId: string;
  readonly phaseId: PhaseId;
  readonly phaseStateId: string;
  readonly phaseStateRevisionId: string;
  readonly phaseContextValid: boolean;
  readonly sourceSnapshotId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly postPrescriptionWeekValidationId: string;
  readonly postPrescriptionWeekValidationRevisionId: string;
  readonly finalValidationStatus: string;
  readonly gate13Valid: boolean;
  readonly entities: readonly ProductionPhaseProgramEntitySummary[];
  readonly productiveAnchors: readonly ProductionPhaseProductiveAnchorSummary[];
  readonly supportingContinuity: readonly ProductionPhaseSupportingContinuitySummary[];
  readonly finalPrescriptionRefs: readonly { readonly prescriptionId: string; readonly revisionId: string }[];
  readonly finalSequenceRefs: readonly { readonly sequencePlanId: string; readonly revisionId: string }[];
  readonly unresolvedPolicies: readonly string[];
  readonly executionFeasibilityState: "executable" | "pending" | "invalid";
  readonly completedEvidenceInferred: false;
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface BuildProductionPhaseProgramSnapshotInput {
  readonly weekSource: PrescribedWeekSourceSnapshot;
  readonly postPrescriptionWeekResult: ProductionPostPrescriptionWeekValidationResult;
  readonly sessionIntents: readonly SessionIntent[];
  readonly sessionSkeletons: readonly SessionSkeleton[];
  readonly prescriptionSessionResults: readonly PrescriptionSessionCompilationResult[];
  readonly finalSequencePlans: readonly ProductionFinalSessionSequencePlan[];
  readonly phaseStateContext: {
    readonly phaseId: PhaseId;
    readonly phaseStateId: string;
    readonly phaseStateRevisionId: string;
  };
  readonly evaluationTime: string;
  readonly basedOnRevisionId: string | null;
  readonly provenance: readonly string[];
}

export function deriveProductionPhaseProgramSnapshotId(input: Pick<ProductionPhaseProgramSnapshot,
  "athleteId" | "planningHorizonId" | "weeklyIntentId" | "weekAllocationPlanId" | "phaseStateId">): string {
  return stableId("production-phase-program", { athleteId: input.athleteId,
    planningHorizonId: input.planningHorizonId, weeklyIntentId: input.weeklyIntentId,
    weekAllocationPlanId: input.weekAllocationPlanId, phaseStateId: input.phaseStateId });
}

export function deriveProductionPhaseProgramSnapshotRevisionId(input: Pick<ProductionPhaseProgramSnapshot,
  "snapshotId" | "sourceSnapshotRevisionId" | "postPrescriptionWeekValidationRevisionId"
  | "finalPrescriptionRefs" | "finalSequenceRefs" | "phaseStateRevisionId" | "evaluationTime"
  | "basedOnRevisionId" | "entities" | "productiveAnchors" | "supportingContinuity" | "phaseId"
  | "phaseContextValid">): string {
  return stableId("production-phase-program-revision", {
    snapshotId: input.snapshotId,
    sourceSnapshotRevisionId: input.sourceSnapshotRevisionId,
    validationRevisionId: input.postPrescriptionWeekValidationRevisionId,
    prescriptionRevisionIds: input.finalPrescriptionRefs.map((value) => value.revisionId).sort(),
    sequenceRevisionIds: input.finalSequenceRefs.map((value) => value.revisionId).sort(),
    entitySemanticKeys: input.entities.map((value) =>
      `${value.kind}:${value.entityId}:${value.semanticResponsibilityKey}`).sort(),
    anchorState: [...input.productiveAnchors].sort((left, right) =>
      left.exerciseId.localeCompare(right.exerciseId)),
    supportingState: [...input.supportingContinuity].sort((left, right) =>
      left.assignmentId.localeCompare(right.assignmentId)),
    phaseId: input.phaseId,
    phaseContextValid: input.phaseContextValid,
    phaseStateRevisionId: input.phaseStateRevisionId,
    evaluationTime: input.evaluationTime,
    basedOnRevisionId: input.basedOnRevisionId,
  });
}

function frozenSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function entity(input: Omit<ProductionPhaseProgramEntitySummary, "semanticResponsibilityKey"> & {
  readonly semantics: unknown;
}): ProductionPhaseProgramEntitySummary {
  const { semantics, ...rest } = input;
  return Object.freeze({ ...rest, sourceRefs: frozenSorted(rest.sourceRefs),
    semanticResponsibilityKey: stableId("phase-semantic", semantics) });
}

export function buildProductionPhaseProgramSnapshot(
  input: BuildProductionPhaseProgramSnapshotInput,
): ProductionPhaseProgramSnapshot {
  const { weekSource, postPrescriptionWeekResult: validation } = input;
  const entities: ProductionPhaseProgramEntitySummary[] = [];
  for (const value of weekSource.objectives) entities.push(entity({ kind: "weekly_objective",
    entityId: value.objectiveId, sessionId: null, exerciseId: null, sequenceIndex: null, section: null,
    active: true, sourceRefs: value.sourceEvidenceRefs,
    semantics: { purpose: value.purpose, target: value.target, priority: value.priority } }));
  for (const value of weekSource.opportunities) entities.push(entity({ kind: "opportunity",
    entityId: value.opportunityId, sessionId: null, exerciseId: null, sequenceIndex: null, section: null,
    active: value.availabilityState !== "unavailable",
    sourceRefs: value.reservationIds,
    semantics: { availableMinutes: value.availableMinutes, availabilityState: value.availabilityState,
      executionState: value.executionState } }));
  for (const value of weekSource.reservations) entities.push(entity({ kind: "reservation",
    entityId: value.reservationId, sessionId: null, exerciseId: null, sequenceIndex: null, section: null,
    active: value.invalidationState === "active", sourceRefs: value.responsibilityEvidenceRefs,
    semantics: { objectives: frozenSorted(value.allocatedObjectiveIds), goal: value.expectedSessionGoal,
      availabilityState: value.availabilityState, executionState: value.executionState } }));
  for (const intent of input.sessionIntents) {
    entities.push(entity({ kind: "session", entityId: intent.id, sessionId: intent.id, exerciseId: null,
      sequenceIndex: null, section: null, active: true, sourceRefs: intent.plannerSourceTrace.sourceRefs,
      semantics: { kind: intent.kind, goal: intent.outcomeGoal ?? intent.primaryGoal,
        structuralCapacity: intent.structuralCapacity, needs: intent.needs.map((need) => need.id).sort() } }));
    for (const need of intent.needs) entities.push(entity({ kind: "session_need", entityId: need.id,
      sessionId: intent.id, exerciseId: null, sequenceIndex: null, section: need.section, active: true,
      sourceRefs: need.sourceEvidence.flatMap((source) => source.evidenceRefs),
      semantics: { section: need.section, priority: need.priority, selection: need.selection,
        dependencies: need.dependencies } }));
  }
  const productiveAnchors: ProductionPhaseProductiveAnchorSummary[] = [];
  for (const intent of input.sessionIntents) for (const anchor of intent.continuityEvidence.identities) {
    productiveAnchors.push(Object.freeze({ exerciseId: anchor.exerciseId,
      activeNeedIds: frozenSorted(anchor.previouslyServedNeedIds), classification: anchor.observationalClassification,
      productive: anchor.productive, equipmentLost: anchor.equipmentLost,
      explicitlyBlocked: anchor.explicitlyBlocked, repeatedAdverseEvidence: anchor.repeatedAdverseEvidence,
      sourceRefs: frozenSorted(anchor.sourceEvidenceRefs ?? anchor.responseReceiverTraceRefs) }));
  }
  const supporting: ProductionPhaseSupportingContinuitySummary[] = [];
  for (const skeleton of input.sessionSkeletons) for (const assignment of skeleton.assignments) {
    entities.push(entity({ kind: "assignment", entityId: assignment.routinePrescriptionHandoffId,
      sessionId: skeleton.sessionIntentId, exerciseId: assignment.exerciseId, sequenceIndex: null,
      section: assignment.section, active: true, sourceRefs: assignment.continuityEvidenceRefs,
      semantics: { exerciseId: assignment.exerciseId, section: assignment.section, role: assignment.role,
        needIds: frozenSorted(assignment.satisfiedNeedIds) } }));
    if (assignment.section === "warmup" || assignment.section === "activation") {
      supporting.push(Object.freeze({ assignmentId: assignment.routinePrescriptionHandoffId,
        exerciseId: assignment.exerciseId, section: assignment.section,
        dependencyIds: frozenSorted(assignment.continuityEvidenceRefs), required: true }));
    }
  }
  const prescriptionRefs: { prescriptionId: string; revisionId: string }[] = [];
  for (const result of input.prescriptionSessionResults) {
    for (const event of result.sourceExposureEvents) entities.push(entity({ kind: "source_event",
      entityId: event.sourceExposureEventId, sessionId: event.sessionIntentId,
      exerciseId: event.currentPlannedExerciseId, sequenceIndex: null, section: null, active: true,
      sourceRefs: [event.sessionAssignmentId], semantics: { assignmentId: event.sessionAssignmentId,
        exerciseId: event.currentPlannedExerciseId, status: event.eventStatus } }));
    for (const plan of result.plans) {
      prescriptionRefs.push(Object.freeze({ prescriptionId: plan.prescriptionId,
        revisionId: plan.prescriptionRevisionId }));
      entities.push(entity({ kind: "prescription", entityId: plan.prescriptionId,
        sessionId: plan.sourceExposureEvent.sessionIntentId, exerciseId: plan.exerciseId, sequenceIndex: null,
        section: null, active: true, sourceRefs: [plan.sourceExposureEvent.sourceExposureEventId],
        repetitionSemanticKeys: plan.doseBlocks.map((block) => stableId("phase-repetition", {
          exerciseId: plan.exerciseId, purpose: block.purpose,
          value: block.dose.mode === "repetition_sets" ? block.dose.repetitions : null })),
        tempoSemanticKeys: plan.doseBlocks.map((block) => stableId("phase-tempo", {
          exerciseId: plan.exerciseId, purpose: block.purpose,
          value: "tempo" in block.dose ? block.dose.tempo : null })),
        semantics: { exerciseId: plan.exerciseId, doseBlocks: plan.doseBlocks,
          restInstructions: plan.restInstructions, requirements: plan.requirementRefs } }));
    }
  }
  const sequenceRefs: { sequencePlanId: string; revisionId: string }[] = [];
  for (const sequence of input.finalSequencePlans) {
    sequenceRefs.push(Object.freeze({ sequencePlanId: sequence.sequencePlanId,
      revisionId: sequence.sequenceRevisionId }));
    for (const step of sequence.steps) entities.push(entity({ kind: "sequence_step",
      entityId: `${sequence.sequencePlanId}:${step.assignmentId}`, sessionId: sequence.sessionIntentId,
      exerciseId: step.exerciseId, sequenceIndex: step.sequenceIndex, section: step.section, active: true,
      sourceRefs: [step.sourceExposureEventId, step.prescriptionId], semantics: { assignmentId: step.assignmentId,
        exerciseId: step.exerciseId, section: step.section, role: step.role,
        doseBlockIds: step.orderedDoseBlockIds } }));
  }
  const stableIdentity = { athleteId: weekSource.athleteId, planningHorizonId: weekSource.planningHorizonId,
    weeklyIntentId: weekSource.weeklyIntentId, weekAllocationPlanId: weekSource.weekAllocationPlanId,
    phaseStateId: input.phaseStateContext.phaseStateId };
  const snapshotId = deriveProductionPhaseProgramSnapshotId(stableIdentity);
  const phaseContextValid = input.sessionIntents.every((intent) =>
    intent.phaseIntent.id === input.phaseStateContext.phaseId) &&
    input.prescriptionSessionResults.every((result) => result.plans.every((plan) =>
      plan.phaseId === input.phaseStateContext.phaseId));
  const gate13Valid = validation.gate13Trace.every((trace) => trace.state !== "FAIL_STOP") &&
    validation.status.startsWith("validated_") && validation.athleteId === weekSource.athleteId &&
    validation.sourceSnapshotId === weekSource.sourceSnapshotId &&
    validation.sourceSnapshotRevisionId === weekSource.sourceSnapshotRevisionId;
  const snapshotWithoutRevision: Omit<ProductionPhaseProgramSnapshot, "snapshotRevisionId"> = {
    snapshotContract: PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotId,
    basedOnRevisionId: input.basedOnRevisionId, athleteId: weekSource.athleteId,
    planningHorizonId: weekSource.planningHorizonId, weeklyIntentId: weekSource.weeklyIntentId,
    weekAllocationPlanId: weekSource.weekAllocationPlanId, phaseId: input.phaseStateContext.phaseId,
    phaseStateId: input.phaseStateContext.phaseStateId,
    phaseStateRevisionId: input.phaseStateContext.phaseStateRevisionId,
    phaseContextValid,
    sourceSnapshotId: weekSource.sourceSnapshotId, sourceSnapshotRevisionId: weekSource.sourceSnapshotRevisionId,
    postPrescriptionWeekValidationId: validation.validationId,
    postPrescriptionWeekValidationRevisionId: validation.validationRevisionId,
    finalValidationStatus: validation.status, gate13Valid,
    entities: Object.freeze(entities.sort((a, b) => `${a.kind}:${a.entityId}`.localeCompare(`${b.kind}:${b.entityId}`))),
    productiveAnchors: Object.freeze(productiveAnchors.sort((a, b) => a.exerciseId.localeCompare(b.exerciseId))),
    supportingContinuity: Object.freeze(supporting.sort((a, b) => a.assignmentId.localeCompare(b.assignmentId))),
    finalPrescriptionRefs: Object.freeze(prescriptionRefs.sort((a, b) => a.prescriptionId.localeCompare(b.prescriptionId))),
    finalSequenceRefs: Object.freeze(sequenceRefs.sort((a, b) => a.sequencePlanId.localeCompare(b.sequencePlanId))),
    unresolvedPolicies: frozenSorted([...weekSource.unresolvedPolicyRefs, ...validation.unresolvedPolicies]),
    executionFeasibilityState: !gate13Valid ? "invalid" : validation.status.includes("pending") ? "pending" : "executable",
    completedEvidenceInferred: false, evaluationTime: input.evaluationTime,
    provenance: frozenSorted([...input.provenance, "production-builder:buildProductionPhaseProgramSnapshot"]) };
  return Object.freeze({ ...snapshotWithoutRevision,
    snapshotRevisionId: deriveProductionPhaseProgramSnapshotRevisionId(snapshotWithoutRevision) });
}
