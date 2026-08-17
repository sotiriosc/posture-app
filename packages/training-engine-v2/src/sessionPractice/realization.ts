import { stableId } from "../prescription/compiler/utilities";
import type { ExerciseDose, NumericTarget } from "../prescription/dose";
import type { ProductionExercisePrescriptionPlan } from "../prescription/compiler/contracts";
import {
  PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE,
  SESSION_PRACTICE_FULL_POLICY_V1,
  SESSION_PRACTICE_LIGHTER_POLICY_V1,
  SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
  SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE,
  SESSION_PRACTICE_RECOVERY_POLICY_V1,
  type SessionPracticeBurdenDifference,
  type SessionPracticeBurdenVector,
  type SessionPracticeFinalSequence,
  type SessionPracticePolicyContext,
  type SessionPracticeRealizationPlan,
  type SessionPracticeStructuralProjection,
} from "./contracts";
import { evaluateSessionPracticeOption } from "./availability";
import { deriveSessionPracticeAssignmentFacts } from "./validation";
import { deriveSessionPracticeRealizationRevisionId } from "./request";

function targetMaximum(target: NumericTarget<string> | undefined): number | null {
  if (!target || target.kind === "unknown" || target.kind === "not_prescribed") return null;
  return target.kind === "exact" ? target.value : target.max;
}

function developmentalCount(dose: ExerciseDose): number | null {
  if (dose.mode === "repetition_sets" || dose.mode === "timed_hold" || dose.mode === "step_sets") {
    return targetMaximum(dose.sets);
  }
  if (dose.mode === "breath_cycles") return targetMaximum(dose.rounds);
  if (dose.mode === "distance_carry" || dose.mode === "timed_carry") return targetMaximum(dose.trips);
  if (dose.mode === "step_march") return targetMaximum(dose.sets);
  return null;
}

function sumTargets(targets: readonly (NumericTarget<string> | undefined)[]): readonly [number, number | null] {
  let lower = 0;
  let upper: number | null = 0;
  for (const target of targets) {
    if (!target || target.kind === "unknown" || target.kind === "not_prescribed") {
      upper = null;
      continue;
    }
    lower += target.kind === "exact" ? target.value : target.min;
    if (upper !== null) upper += target.kind === "exact" ? target.value : target.max;
  }
  return [lower, upper];
}

function burdenVector(input: {
  readonly context: SessionPracticePolicyContext;
  readonly projection: SessionPracticeStructuralProjection | null;
  readonly finalSequence: SessionPracticeFinalSequence | null;
}): SessionPracticeBurdenVector {
  const facts = deriveSessionPracticeAssignmentFacts(input.context.source);
  const included = input.projection === null ? facts : facts.filter((fact) =>
    input.projection!.assignments.some((entry) => entry.assignmentId === fact.assignmentId && entry.state !== "omitted"));
  const dispositionById = new Map(input.projection?.assignments.map((entry) => [entry.assignmentId, entry]) ?? []);
  const blocks = included.flatMap((fact) => {
    const disposition = dispositionById.get(fact.assignmentId);
    return fact.prescription.doseBlocks.filter((block) => !disposition || disposition.retainedBlockIds.includes(block.blockId));
  });
  const developmentCounts = blocks.filter((block) => block.purpose === "developmental_work")
    .map((block) => developmentalCount(block.dose));
  const developmentalCountTotal = developmentCounts.some((value) => value === null) ? null :
    developmentCounts.reduce<number>((total, value) => total + (value ?? 0), 0);
  const plans = included.map((fact) => fact.prescription);
  const workIntervals = plans.map((plan) => plan.durationInterval);
  const workLower = workIntervals.reduce((total, interval) => total + interval.knownLowerBoundSeconds, 0);
  const workUpper = workIntervals.some((interval) => interval.knownUpperBoundSeconds === null) ? null :
    workIntervals.reduce<number>((total, interval) => total + (interval.knownUpperBoundSeconds ?? 0), 0);
  const restTargets = plans.flatMap((plan) => plan.restInstructions.map((instruction) => instruction.target));
  const rest = sumTargets(restTargets);
  const duration = input.finalSequence?.duration ?? input.context.source.finalSequence.duration;
  return Object.freeze({
    assignmentCount: included.length,
    optionalAssignmentCount: included.filter((fact) => fact.priority === "optional").length,
    preferredAssignmentCount: included.filter((fact) => fact.priority === "preferred").length,
    developmentalBlockCount: blocks.filter((block) => block.purpose === "developmental_work").length,
    developmentalCount: developmentalCountTotal,
    preparatoryBlockCount: blocks.filter((block) => block.purpose === "preparatory_acclimation").length,
    sourceEventCount: new Set(included.map((fact) => fact.prescription.sourceExposureEvent.sourceExposureEventId)).size,
    prescribedWorkIntervalSeconds: Object.freeze([workLower, workUpper] as const),
    restIntervalSeconds: rest,
    durationIntervalSeconds: Object.freeze([
      duration.knownLowerBoundSeconds,
      duration.knownUpperBoundSeconds,
    ] as const),
    setupTransitionCount: input.finalSequence?.steps.length ? input.finalSequence.steps.length - 1 :
      Math.max(0, included.length - 1),
    stressConcentrationObservationCount: 0,
    unresolvedDuration: duration.knownUpperBoundSeconds === null || duration.unknownComponents.length > 0,
  });
}

function policyReference(projection: SessionPracticeStructuralProjection): string {
  const policy = projection.mode === "full" ? SESSION_PRACTICE_FULL_POLICY_V1 :
    projection.mode === "lighter" ? SESSION_PRACTICE_LIGHTER_POLICY_V1 : SESSION_PRACTICE_RECOVERY_POLICY_V1;
  return `${policy.policyId}@${policy.version}`;
}

export function wrapFullSourceSequence(context: SessionPracticePolicyContext): SessionPracticeFinalSequence {
  const source = context.source.finalSequence;
  return Object.freeze({
    sequencePlanId: source.sequencePlanId,
    sequenceRevisionId: source.sequenceRevisionId,
    basedOnSourceSequenceRevisionId: source.sequenceRevisionId,
    steps: source.steps,
    finalPrescriptionRevisionIds: source.finalPrescriptionRevisionIds,
    duration: source.duration,
    dependencyOrderPreserved: true,
    blockOrderPreserved: true,
    noPairing: true,
    recomputedFromExplicitFacts: false,
    reasonCodes: Object.freeze(["FULL_EXACT_SEQUENCE_PASS_THROUGH"]),
  });
}

export function assembleSessionPracticeRealizationPlan(input: {
  readonly context: SessionPracticePolicyContext;
  readonly projection: SessionPracticeStructuralProjection;
  readonly finalSequence: SessionPracticeFinalSequence | null;
  readonly basedOnRealizationRevisionId?: string | null;
}): SessionPracticeRealizationPlan {
  const available = input.projection.availability.state === "available" ||
    input.projection.availability.state === "available_with_pending_week_responsibility";
  const realizationRevisionId = deriveSessionPracticeRealizationRevisionId({
    attemptId: input.context.request.attemptId,
    requestId: input.context.request.requestId,
    sourceSessionRevisionId: input.context.source.sourceSessionRevisionId,
    mode: input.projection.mode,
    basedOnRevisionId: input.basedOnRealizationRevisionId ?? null,
  });
  const sourceBurden = burdenVector({ context: input.context, projection: null,
    finalSequence: wrapFullSourceSequence(input.context) });
  const realizedBurden = burdenVector({ context: input.context, projection: input.projection,
    finalSequence: input.finalSequence });
  const burdenDifference: SessionPracticeBurdenDifference = Object.freeze({
    source: sourceBurden,
    realized: realizedBurden,
    materiality: input.projection.availability.materiality,
    universalBurdenScore: null,
  });
  const sequenceReady = input.projection.mode === "full" || input.finalSequence !== null;
  const status = !available ? input.projection.availability.state === "conflict" ? "conflict" :
    input.projection.availability.state.startsWith("blocked") ? "blocked" : "unavailable" :
    sequenceReady ? "realized" : "conflict";
  return Object.freeze({
    contractReference: SESSION_PRACTICE_REALIZATION_PLAN_CONTRACT_REFERENCE,
    bridgeContractReference: SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
    realizerContractReference: PRODUCTION_SESSION_PRACTICE_REALIZER_KERNEL_CONTRACT_REFERENCE,
    policyReference: policyReference(input.projection),
    mode: input.projection.mode,
    status,
    sourceSessionId: input.context.source.sourceSessionId,
    sourceSessionRevisionId: input.context.source.sourceSessionRevisionId,
    attemptId: input.context.request.attemptId,
    requestId: input.context.request.requestId,
    realizationRevisionId,
    finalForExecution: status === "realized",
    assignments: input.projection.assignments,
    dependencies: input.projection.dependencies,
    anchors: Object.freeze(input.projection.assignments.filter((entry) => entry.productiveRequiredAnchor)
      .map((entry) => Object.freeze({ assignmentId: entry.assignmentId, preserved: entry.state !== "omitted" }))),
    needCoverage: input.projection.needCoverage,
    purposePreserved: input.projection.purposePreserved,
    sourceEventsPreserved: input.projection.sourceEventsPreserved,
    prescriptionRevisions: input.projection.prescriptionRevisions,
    finalSequence: input.projection.mode === "full" ? wrapFullSourceSequence(input.context) : input.finalSequence,
    duration: input.projection.mode === "full" ? input.context.source.finalSequence.duration :
      input.finalSequence?.duration ?? null,
    burdenDifference,
    availability: input.projection.availability,
    unresolvedRequirements: Object.freeze([...input.projection.unresolvedRequirements,
      ...available && !sequenceReady ? ["SESSION_PRACTICE_FINAL_SEQUENCING_REQUIRED"] : []]),
    weekResponsibilityConsequences: input.projection.weekResponsibilityConsequences,
    completionCreditPolicy: status !== "realized" ? "none" : input.projection.mode === "full" ?
      "normal_gate13_and_outcome_truth" : input.projection.mode === "lighter" ?
        "required_realized_evidence_only" : "recovery_support_only_original_responsibility_unfulfilled",
    noFallbackTrace: input.projection.noFallbackTrace,
    provenance: Object.freeze([input.context.source.sourceSessionRevisionId,
      input.context.source.finalSequence.sequenceRevisionId, policyReference(input.projection)]),
  });
}

export function realizeSessionPractice(
  context: SessionPracticePolicyContext,
): SessionPracticeRealizationPlan {
  const projection = evaluateSessionPracticeOption(context);
  return assembleSessionPracticeRealizationPlan({
    context,
    projection,
    finalSequence: projection.mode === "full" ? wrapFullSourceSequence(context) : null,
  });
}

export function prescriptionPlanForAssignment(
  plans: readonly ProductionExercisePrescriptionPlan[],
  prescriptionId: string,
): ProductionExercisePrescriptionPlan | null {
  return plans.find((plan) => plan.prescriptionId === prescriptionId) ?? null;
}

export function fingerprintSessionPracticeRealizationPlan(plan: SessionPracticeRealizationPlan): string {
  return stableId("session-practice-realization-plan", plan);
}
