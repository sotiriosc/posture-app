import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionPrescriptionDoseBlock } from "../prescription/compiler/contracts";
import type {
  ProductionFinalSessionSequencePlan,
  ProductionSequencedAssignmentStep,
  ProductionSequencingTransitionFact,
} from "../sequencing/contracts";
import type {
  SessionPracticeFinalSequence,
  SessionPracticePolicyContext,
  SessionPracticePrescriptionRevision,
  SessionPracticeRevisedPrescriptionPlan,
  SessionPracticeStructuralProjection,
} from "./contracts";

const SECTION_ORDER = Object.freeze(["warmup", "activation", "main", "accessory", "cooldown"] as const);

function applyRevision(
  context: SessionPracticePolicyContext,
  assignmentId: string,
  revision: SessionPracticePrescriptionRevision | undefined,
): SessionPracticeRevisedPrescriptionPlan {
  const sourceStep = context.source.finalSequence.steps.find((step) => step.assignmentId === assignmentId)!;
  const sourcePlan = context.source.prescriptions.find((plan) => plan.prescriptionId === sourceStep.prescriptionId)!;
  if (!revision) return sourcePlan;
  const changeByBlock = new Map(revision.doseChanges.map((change) => [change.blockId, change]));
  const omitted = new Set(revision.omittedBlockIds);
  const doseBlocks = sourcePlan.doseBlocks.filter((block) => !omitted.has(block.blockId)).map((block) => {
    const change = changeByBlock.get(block.blockId);
    return change?.newDose ? Object.freeze({ ...block, dose: change.newDose }) : block;
  });
  return Object.freeze({ ...sourcePlan, prescriptionRevisionId: revision.revisedPrescriptionRevisionId,
    doseBlocks: Object.freeze(doseBlocks) });
}

function topologicalOrder(input: {
  readonly source: ProductionFinalSessionSequencePlan;
  readonly retainedAssignmentIds: ReadonlySet<string>;
}): readonly string[] | null {
  const sourceIndex = new Map(input.source.steps.map((step, index) => [step.assignmentId, index]));
  const stepById = new Map(input.source.steps.map((step) => [step.assignmentId, step]));
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  for (const id of input.retainedAssignmentIds) {
    incoming.set(id, new Set());
    outgoing.set(id, new Set());
  }
  for (const step of input.source.steps.filter((candidate) => input.retainedAssignmentIds.has(candidate.assignmentId))) {
    for (const dependencyId of step.dependencyAssignmentIds.filter((id) => input.retainedAssignmentIds.has(id))) {
      incoming.get(step.assignmentId)!.add(dependencyId);
      outgoing.get(dependencyId)!.add(step.assignmentId);
    }
  }
  const retainedSteps = input.source.steps.filter((step) => input.retainedAssignmentIds.has(step.assignmentId));
  for (const left of retainedSteps) {
    for (const right of retainedSteps) {
      if (SECTION_ORDER.indexOf(left.section) < SECTION_ORDER.indexOf(right.section)) {
        incoming.get(right.assignmentId)!.add(left.assignmentId);
        outgoing.get(left.assignmentId)!.add(right.assignmentId);
      }
    }
  }
  const compare = (left: string, right: string) => {
    const leftStep = stepById.get(left)!;
    const rightStep = stepById.get(right)!;
    return SECTION_ORDER.indexOf(leftStep.section) - SECTION_ORDER.indexOf(rightStep.section) ||
      (sourceIndex.get(left) ?? 0) - (sourceIndex.get(right) ?? 0) || left.localeCompare(right);
  };
  const ready = [...input.retainedAssignmentIds].filter((id) => incoming.get(id)!.size === 0).sort(compare);
  const ordered: string[] = [];
  while (ready.length) {
    const next = ready.shift()!;
    ordered.push(next);
    for (const child of outgoing.get(next) ?? []) {
      incoming.get(child)!.delete(next);
      if (incoming.get(child)!.size === 0) {
        ready.push(child);
        ready.sort(compare);
      }
    }
  }
  return ordered.length === input.retainedAssignmentIds.size ? Object.freeze(ordered) : null;
}

function transitionFor(
  source: ProductionFinalSessionSequencePlan,
  fromAssignmentId: string,
  toAssignmentId: string,
): ProductionSequencingTransitionFact | null {
  return source.consecutiveTransitionFacts.find((fact) => fact.fromAssignmentId === fromAssignmentId &&
    fact.toAssignmentId === toAssignmentId) ?? null;
}

function deriveDuration(input: {
  readonly context: SessionPracticePolicyContext;
  readonly orderedAssignmentIds: readonly string[];
  readonly plans: readonly SessionPracticeRevisedPrescriptionPlan[];
  readonly revisions: readonly SessionPracticePrescriptionRevision[];
}) {
  let lower = input.plans.reduce((total, plan) => total + plan.durationInterval.knownLowerBoundSeconds, 0);
  let upper: number | null = input.plans.some((plan) => plan.durationInterval.knownUpperBoundSeconds === null) ? null :
    input.plans.reduce<number>((total, plan) => total + (plan.durationInterval.knownUpperBoundSeconds ?? 0), 0);
  const unknowns = input.plans.flatMap((plan) => plan.durationInterval.unknownComponents.map((component) =>
    `${plan.prescriptionId}:${component}`));
  if (input.revisions.some((revision) => revision.modifiedBlockIds.length > 0)) {
    upper = null;
    unknowns.push("practice-prescription-revision:duration-recompilation-required");
  }
  const transitionInstructionIds: string[] = [];
  for (let index = 1; index < input.orderedAssignmentIds.length; index += 1) {
    const from = input.orderedAssignmentIds[index - 1]!;
    const to = input.orderedAssignmentIds[index]!;
    const fact = transitionFor(input.context.source.finalSequence, from, to);
    if (!fact) {
      upper = null;
      unknowns.push(`transition:${from}:${to}:explicit-fact-required`);
      continue;
    }
    const instructions = input.context.source.finalSequence.transitionInstructions.filter((instruction) =>
      instruction.transitionFactId === fact.transitionFactId);
    if (instructions.length === 0) {
      upper = null;
      unknowns.push(`transition:${fact.transitionFactId}:instruction-required`);
    }
    for (const instruction of instructions) {
      transitionInstructionIds.push(instruction.instructionId);
      if (instruction.target.kind === "exact") {
        lower += instruction.target.seconds;
        if (upper !== null) upper += instruction.target.seconds;
      } else if (instruction.target.kind === "range") {
        lower += instruction.target.minimumSeconds;
        if (upper !== null) upper += instruction.target.maximumSeconds;
      } else if (instruction.target.kind === "unknown") {
        upper = null;
        unknowns.push(`transition:${fact.transitionFactId}:${instruction.target.reasonCode}`);
      }
    }
  }
  const availableSeconds = input.context.request.actualAvailableMinutes === null ?
    input.context.source.finalSequence.duration.availableSeconds : input.context.request.actualAvailableMinutes * 60;
  const status = lower > availableSeconds ? "definitely_over_budget" : upper === null ?
    "unknown_due_to_setup_transition" : upper > availableSeconds ? "possibly_over_budget" :
      lower === upper ? "fully_determinable" : "bounded";
  return Object.freeze({
    sequencingContract: input.context.source.finalSequence.sequencingContract,
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    availableSeconds,
    status,
    unknownComponents: Object.freeze(uniqueSorted(unknowns)),
    prescriptionIntervalRefs: Object.freeze(input.plans.map((plan) => plan.prescriptionRevisionId).sort()),
    transitionInstructionIds: Object.freeze(transitionInstructionIds),
    timingFactReuseCount: 0,
    noInventedTime: true as const,
    provenance: Object.freeze([]),
  });
}

export interface SequenceSessionPracticeProjectionResult {
  readonly status: "sequenced" | "infeasible";
  readonly sequence: SessionPracticeFinalSequence | null;
  readonly revisedPrescriptions: readonly SessionPracticeRevisedPrescriptionPlan[];
  readonly reasonCodes: readonly string[];
}

export function sequenceSessionPracticeProjection(input: {
  readonly context: SessionPracticePolicyContext;
  readonly projection: SessionPracticeStructuralProjection;
}): SequenceSessionPracticeProjectionResult {
  const retained = new Set(input.projection.assignments.filter((entry) => entry.state !== "omitted")
    .map((entry) => entry.assignmentId));
  if (retained.size === 0) return Object.freeze({ status: "infeasible", sequence: null,
    revisedPrescriptions: Object.freeze([]), reasonCodes: Object.freeze(["SESSION_PRACTICE_SEQUENCE_EMPTY"]) });
  const order = topologicalOrder({ source: input.context.source.finalSequence, retainedAssignmentIds: retained });
  if (!order) return Object.freeze({ status: "infeasible", sequence: null,
    revisedPrescriptions: Object.freeze([]), reasonCodes: Object.freeze(["SESSION_PRACTICE_DEPENDENCY_ORDER_INFEASIBLE"]) });
  const revisedPrescriptions = order.map((assignmentId) => applyRevision(input.context, assignmentId,
    input.projection.prescriptionRevisions.find((revision) => revision.assignmentId === assignmentId)));
  if (revisedPrescriptions.some((plan) => plan.doseBlocks.length === 0)) {
    return Object.freeze({ status: "infeasible", sequence: null, revisedPrescriptions: Object.freeze(revisedPrescriptions),
      reasonCodes: Object.freeze(["SESSION_PRACTICE_PRESCRIPTION_HAS_NO_RETAINED_BLOCK"]) });
  }
  const sourceStepById = new Map(input.context.source.finalSequence.steps.map((step) => [step.assignmentId, step]));
  const planByAssignmentId = new Map(order.map((assignmentId, index) => [assignmentId, revisedPrescriptions[index]!]));
  const steps = order.map((assignmentId, index): ProductionSequencedAssignmentStep => {
    const sourceStep = sourceStepById.get(assignmentId)!;
    const plan = planByAssignmentId.get(assignmentId)!;
    return Object.freeze({ ...sourceStep, sequenceIndex: index,
      finalPrescriptionRevisionId: plan.prescriptionRevisionId,
      orderedDoseBlockIds: Object.freeze([...plan.doseBlocks]
        .sort((left, right) => left.order.index - right.order.index).map((block) => block.blockId)),
      dependencyAssignmentIds: Object.freeze(sourceStep.dependencyAssignmentIds.filter((id) => retained.has(id))),
      reasonCodes: Object.freeze([...sourceStep.reasonCodes, "SESSION_PRACTICE_SEQUENCE_REBUILT"]),
    });
  });
  const duration = deriveDuration({ context: input.context, orderedAssignmentIds: order,
    plans: revisedPrescriptions, revisions: input.projection.prescriptionRevisions });
  const sequencePlanId = stableId("session-practice-sequence-plan", {
    sourceSequencePlanId: input.context.source.finalSequence.sequencePlanId,
    attemptId: input.context.request.attemptId,
    mode: input.projection.mode,
  });
  const sequenceRevisionId = stableId("session-practice-sequence-revision", {
    sequencePlanId,
    sourceSequenceRevisionId: input.context.source.finalSequence.sequenceRevisionId,
    assignmentIds: order,
    prescriptionRevisionIds: revisedPrescriptions.map((plan) => plan.prescriptionRevisionId),
  });
  const blockOrderPreserved = revisedPrescriptions.every((plan) => plan.doseBlocks.every((block, index, blocks) =>
    index === 0 || blocks[index - 1]!.order.index <= block.order.index));
  const sequence: SessionPracticeFinalSequence = Object.freeze({
    sequencePlanId,
    sequenceRevisionId,
    basedOnSourceSequenceRevisionId: input.context.source.finalSequence.sequenceRevisionId,
    steps: Object.freeze(steps),
    finalPrescriptionRevisionIds: Object.freeze(revisedPrescriptions.map((plan) => plan.prescriptionRevisionId)),
    duration,
    dependencyOrderPreserved: true,
    blockOrderPreserved,
    noPairing: true,
    recomputedFromExplicitFacts: true,
    reasonCodes: Object.freeze(["SESSION_PRACTICE_FINAL_SEQUENCE_REBUILT",
      duration.knownUpperBoundSeconds === null ? "UNKNOWN_DURATION_PRESERVED" : "EXPLICIT_DURATION_RECOMPUTED"]),
  });
  return Object.freeze({ status: "sequenced", sequence, revisedPrescriptions: Object.freeze(revisedPrescriptions),
    reasonCodes: Object.freeze(["SESSION_PRACTICE_SEQUENCE_VALID"]) });
}
