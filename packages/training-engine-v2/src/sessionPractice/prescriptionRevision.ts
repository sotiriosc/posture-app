import { stableId } from "../prescription/compiler/utilities";
import type { ProductionExercisePrescriptionPlan } from "../prescription/compiler/contracts";
import type { CountTarget, ExerciseDose } from "../prescription/dose";
import {
  SESSION_PRACTICE_PRESCRIPTION_REVISION_CONTRACT_REFERENCE,
  type SessionPracticeDoseFactChange,
  type SessionPracticePrescriptionRevision,
  type SessionPracticeRevisedPrescriptionPlan,
} from "./contracts";

type CountField = "sets" | "rounds" | "trips";

function countFieldForDose(dose: ExerciseDose): CountField | null {
  if (dose.mode === "repetition_sets" || dose.mode === "timed_hold" ||
      dose.mode === "step_sets") return "sets";
  if (dose.mode === "breath_cycles") return "rounds";
  if (dose.mode === "distance_carry" || dose.mode === "timed_carry") return "trips";
  if (dose.mode === "step_march" && dose.sets) return "sets";
  return null;
}

function targetForDose(dose: ExerciseDose, field: CountField): CountTarget | undefined {
  if (field === "sets" && "sets" in dose) return dose.sets;
  if (field === "rounds" && "rounds" in dose) return dose.rounds;
  if (field === "trips" && "trips" in dose) return dose.trips;
  return undefined;
}

function lowerTarget(target: CountTarget, admittedMinimum: number | undefined): CountTarget | null {
  if (target.kind === "range" && target.min < target.max && target.min >= 1) {
    return Object.freeze({ kind: "exact", value: target.min, unit: "count" });
  }
  if (target.kind === "exact" && admittedMinimum !== undefined && admittedMinimum >= 1 &&
      target.value > admittedMinimum) {
    return Object.freeze({ kind: "exact", value: Math.max(admittedMinimum, target.value - 1), unit: "count" });
  }
  return null;
}

function withCountTarget(dose: ExerciseDose, field: CountField, target: CountTarget): ExerciseDose {
  return Object.freeze({ ...dose, [field]: target }) as ExerciseDose;
}

export interface LowerPrescriptionDevelopmentalCountResult {
  readonly revisedPlan: SessionPracticeRevisedPrescriptionPlan | null;
  readonly revision: SessionPracticePrescriptionRevision | null;
  readonly reductionCount: number;
  readonly reasonCodes: readonly string[];
}

export function lowerPrescriptionDevelopmentalCount(input: {
  readonly plan: ProductionExercisePrescriptionPlan;
  readonly assignmentId: string;
  readonly attemptId: string;
  readonly realizationRevisionId: string;
  readonly admittedMinimumCountByBlockId: Readonly<Record<string, number>>;
  readonly policyReference: string;
  readonly createdAt: string;
}): LowerPrescriptionDevelopmentalCountResult {
  for (const block of [...input.plan.doseBlocks].sort((left, right) => left.order.index - right.order.index)) {
    if (block.purpose !== "developmental_work") continue;
    const field = countFieldForDose(block.dose);
    if (!field) continue;
    const oldTarget = targetForDose(block.dose, field);
    if (!oldTarget) continue;
    const newTarget = lowerTarget(oldTarget, input.admittedMinimumCountByBlockId[block.blockId]);
    if (!newTarget) continue;
    const oldMaximum = oldTarget.kind === "range" ? oldTarget.max : oldTarget.kind === "exact" ? oldTarget.value : 0;
    const newCount = newTarget.kind === "exact" ? newTarget.value : 0;
    const newDose = withCountTarget(block.dose, field, newTarget);
    const revisedPrescriptionRevisionId = stableId("session-practice-prescription-revision", {
      prescriptionId: input.plan.prescriptionId,
      basedOn: input.plan.prescriptionRevisionId,
      attemptId: input.attemptId,
      realizationRevisionId: input.realizationRevisionId,
      blockId: block.blockId,
      field,
      newTarget,
    });
    const doseChange: SessionPracticeDoseFactChange = Object.freeze({
      blockId: block.blockId,
      oldDose: block.dose,
      newDose,
      changedFieldRefs: Object.freeze([`doseBlocks.${block.blockId}.dose.${field}`]),
      unchangedFieldRefs: Object.freeze([
        "exerciseId", "sourceExposureEventId", "blockId", "blockOrder", "rest", "load", "effort",
        "repetitions", "tempo", "range", "support", "sideBehavior",
      ]),
    });
    const revisedBlocks = input.plan.doseBlocks.map((candidate) => candidate.blockId === block.blockId ?
      Object.freeze({ ...candidate, dose: newDose }) : candidate);
    const revisedPlan: SessionPracticeRevisedPrescriptionPlan = Object.freeze({
      ...input.plan,
      prescriptionRevisionId: revisedPrescriptionRevisionId,
      doseBlocks: Object.freeze(revisedBlocks),
    });
    const revision: SessionPracticePrescriptionRevision = Object.freeze({
      contractReference: SESSION_PRACTICE_PRESCRIPTION_REVISION_CONTRACT_REFERENCE,
      prescriptionId: input.plan.prescriptionId,
      originalPrescriptionRevisionId: input.plan.prescriptionRevisionId,
      revisedPrescriptionRevisionId,
      sourceExposureEventId: input.plan.sourceExposureEvent.sourceExposureEventId,
      assignmentId: input.assignmentId,
      basedOnRevisionId: input.plan.prescriptionRevisionId,
      policyReference: input.policyReference,
      modifiedBlockIds: Object.freeze([block.blockId]),
      omittedBlockIds: Object.freeze([]),
      doseChanges: Object.freeze([doseChange]),
      finalForExecution: true,
      createdAt: input.createdAt,
      provenance: Object.freeze(["prescription:existing-admitted-lower-bound", input.policyReference]),
    });
    return Object.freeze({ revisedPlan, revision, reductionCount: oldMaximum - newCount,
      reasonCodes: Object.freeze(["LOWER_DEVELOPMENTAL_COUNT_WITHIN_ADMITTED_BOUND"]) });
  }
  return Object.freeze({ revisedPlan: null, revision: null, reductionCount: 0,
    reasonCodes: Object.freeze(["NO_ADMITTED_LOWER_DEVELOPMENTAL_COUNT"]) });
}

export function retainPrescriptionBlocksForPractice(input: {
  readonly plan: ProductionExercisePrescriptionPlan;
  readonly assignmentId: string;
  readonly retainedBlockIds: readonly string[];
  readonly attemptId: string;
  readonly realizationRevisionId: string;
  readonly policyReference: string;
  readonly createdAt: string;
}): { readonly revisedPlan: SessionPracticeRevisedPrescriptionPlan; readonly revision: SessionPracticePrescriptionRevision | null } {
  const retained = new Set(input.retainedBlockIds);
  const omitted = input.plan.doseBlocks.filter((block) => !retained.has(block.blockId));
  if (omitted.length === 0) return Object.freeze({ revisedPlan: input.plan, revision: null });
  const revisedPrescriptionRevisionId = stableId("session-practice-prescription-revision", {
    prescriptionId: input.plan.prescriptionId,
    basedOn: input.plan.prescriptionRevisionId,
    attemptId: input.attemptId,
    realizationRevisionId: input.realizationRevisionId,
    retainedBlockIds: [...retained].sort(),
  });
  const revisedPlan = Object.freeze({ ...input.plan, prescriptionRevisionId: revisedPrescriptionRevisionId,
    doseBlocks: Object.freeze(input.plan.doseBlocks.filter((block) => retained.has(block.blockId))) });
  const revision: SessionPracticePrescriptionRevision = Object.freeze({
    contractReference: SESSION_PRACTICE_PRESCRIPTION_REVISION_CONTRACT_REFERENCE,
    prescriptionId: input.plan.prescriptionId,
    originalPrescriptionRevisionId: input.plan.prescriptionRevisionId,
    revisedPrescriptionRevisionId,
    sourceExposureEventId: input.plan.sourceExposureEvent.sourceExposureEventId,
    assignmentId: input.assignmentId,
    basedOnRevisionId: input.plan.prescriptionRevisionId,
    policyReference: input.policyReference,
    modifiedBlockIds: Object.freeze([]),
    omittedBlockIds: Object.freeze(omitted.map((block) => block.blockId).sort()),
    doseChanges: Object.freeze(omitted.map((block): SessionPracticeDoseFactChange => Object.freeze({
      blockId: block.blockId,
      oldDose: block.dose,
      newDose: null,
      changedFieldRefs: Object.freeze([`doseBlocks.${block.blockId}:omitted`]),
      unchangedFieldRefs: Object.freeze(["exerciseId", "sourceExposureEventId", "retainedBlockOrder", "retainedRest"]),
    }))),
    finalForExecution: true,
    createdAt: input.createdAt,
    provenance: Object.freeze(["prescription:explicit-block-retention", input.policyReference]),
  });
  return Object.freeze({ revisedPlan, revision });
}
