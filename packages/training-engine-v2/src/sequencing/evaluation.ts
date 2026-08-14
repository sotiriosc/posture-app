import type {
  ProductionSequencingAssignmentFact,
  ProductionSequencingTransitionFact,
} from "./contracts";

export type FinalSequencingEvaluationValue = number | string;
export type FinalSequencingEvaluationVector = readonly FinalSequencingEvaluationValue[];

const PRIORITY = { required: 0, preferred: 1, optional: 2 } as const;
const CONTINUITY = { anchor: 0, stable_supporting: 1, rotation_eligible: 2, none: 3 } as const;

function minimumPriority(fact: ProductionSequencingAssignmentFact): number {
  return Math.min(...fact.needPriorities.map((priority) => PRIORITY[priority]), 9);
}

function minimumPlannerOrder(fact: ProductionSequencingAssignmentFact): number {
  return Math.min(...fact.plannerPriorityOrders, 999999);
}

function potentialInterferenceCount(
  left: ProductionSequencingAssignmentFact,
  right: ProductionSequencingAssignmentFact,
  transitionByPair: ReadonlyMap<string, ProductionSequencingTransitionFact>,
): number {
  return transitionByPair.get(`${left.assignmentId}\u0000${right.assignmentId}`)
    ?.interferenceObservations.filter((observation) =>
      observation.classification === "potential_interference" ||
      observation.classification === "reviewed_interference"
    ).length ?? 0;
}

function supportingDependencyFacts(
  fact: ProductionSequencingAssignmentFact,
  allFacts: readonly ProductionSequencingAssignmentFact[],
): readonly ProductionSequencingAssignmentFact[] {
  return allFacts.filter((candidate) => candidate.dependencyAssignmentIds.includes(fact.assignmentId));
}

function adjacentInterferenceVector(input: {
  readonly facts: readonly ProductionSequencingAssignmentFact[];
  readonly transitionByPair: ReadonlyMap<string, ProductionSequencingTransitionFact>;
}): readonly number[] {
  return input.facts.slice(1).map((fact, index) =>
    potentialInterferenceCount(input.facts[index], fact, input.transitionByPair)
  );
}

function adjacentSetupVector(input: {
  readonly facts: readonly ProductionSequencingAssignmentFact[];
  readonly transitionByPair: ReadonlyMap<string, ProductionSequencingTransitionFact>;
}): readonly number[] {
  return input.facts.slice(1).map((fact, index) => {
    const transition = input.transitionByPair.get(
      `${input.facts[index].assignmentId}\u0000${fact.assignmentId}`,
    );
    return transition?.setupRelationship === "same_setup" ? 0
      : transition?.setupRelationship === "compatible_setup" ? 1
        : transition?.setupRelationship === "unknown" ? 3 : 2;
  });
}

function sectionVector(input: {
  readonly sectionFacts: readonly ProductionSequencingAssignmentFact[];
  readonly allFacts: readonly ProductionSequencingAssignmentFact[];
  readonly transitionByPair: ReadonlyMap<string, ProductionSequencingTransitionFact>;
}): FinalSequencingEvaluationVector {
  const facts = input.sectionFacts;
  if (facts.length === 0) return [];
  const dependents = facts.map((fact) => supportingDependencyFacts(fact, input.allFacts));
  const setup = adjacentSetupVector({ facts, transitionByPair: input.transitionByPair });

  if (facts[0].section === "warmup") {
    return [
      ...facts.map(minimumPriority),
      ...dependents.map((entries) =>
        Math.min(...entries.flatMap((entry) => entry.plannerPriorityOrders), 999999)
      ),
      ...dependents.map((entries) => -entries.length),
      ...dependents.map((entries) => entries.length > 0 ? 0 : 1),
      ...facts.map((fact, index) => dependents[index].reduce(
        (total, dependent) => total + potentialInterferenceCount(fact, dependent, input.transitionByPair),
        0,
      )),
      ...adjacentInterferenceVector({ facts, transitionByPair: input.transitionByPair }),
      ...setup,
    ];
  }
  if (facts[0].section === "activation") {
    return [
      ...facts.map(minimumPriority),
      ...dependents.map((entries) =>
        Math.min(...entries.flatMap((entry) => entry.plannerPriorityOrders), 999999)
      ),
      ...dependents.map((entries) => -entries.length),
      ...facts.map((fact) => fact.localFatigue === "low" ? 0 : fact.localFatigue === "moderate" ? 1 : 2),
      ...setup,
    ];
  }
  if (facts[0].section === "main") {
    return [
      ...facts.map((fact) => fact.dominantPurposeRelationship === "dominant" ? 0 : 1),
      ...facts.map((fact) => fact.needPriorities.includes("required") ? 0 : 1),
      ...facts.map(minimumPlannerOrder),
      ...facts.map((fact) => fact.role === "primary_strength" ||
        (fact.role === "capacity" && fact.dominantPurposeRelationship === "dominant") ? 0 : 1),
      ...facts.map((fact) => fact.executionReadiness === "ready" ? 0 : 1),
      ...adjacentInterferenceVector({ facts, transitionByPair: input.transitionByPair }),
      ...facts.map((fact) => CONTINUITY[fact.continuityClassification]),
      ...setup,
    ];
  }
  if (facts[0].section === "accessory") {
    return [
      ...facts.map(minimumPriority),
      ...facts.map(minimumPlannerOrder),
      ...facts.map((fact) => fact.requiredDirectObjective ? 0 : 1),
      ...facts.map((fact) => fact.needPriorities.includes("preferred") ? 0 : 1),
      ...facts.map((fact) => fact.needPriorities.includes("optional") ? 1 : 0),
      ...adjacentInterferenceVector({ facts, transitionByPair: input.transitionByPair }),
      ...setup,
    ];
  }
  return [
    ...facts.map(minimumPriority),
    ...facts.map(minimumPlannerOrder),
    ...setup,
  ];
}

export function evaluateFinalSessionSequenceOrder(input: {
  readonly order: readonly ProductionSequencingAssignmentFact[];
  readonly possibleTransitions: readonly ProductionSequencingTransitionFact[];
}): FinalSequencingEvaluationVector {
  const transitionByPair = new Map(input.possibleTransitions.map((fact) => [
    `${fact.fromAssignmentId}\u0000${fact.toAssignmentId}`,
    fact,
  ]));
  const sections = ["warmup", "activation", "main", "accessory", "cooldown"] as const;
  const vector = sections.flatMap((section) => sectionVector({
    sectionFacts: input.order.filter((fact) => fact.section === section),
    allFacts: input.order,
    transitionByPair,
  }));
  const setupChangeCount = input.order.slice(1).filter((fact, index) => {
    const transition = transitionByPair.get(`${input.order[index].assignmentId}\u0000${fact.assignmentId}`);
    return transition && !["same_setup", "compatible_setup"].includes(transition.setupRelationship);
  }).length;
  const unknownTransitionBurden = input.order.slice(1).reduce((total, fact, index) => {
    const transition = transitionByPair.get(`${input.order[index].assignmentId}\u0000${fact.assignmentId}`);
    return total + (transition?.unknownTimingComponents.length ?? 0);
  }, 0);
  return [
    ...vector,
    setupChangeCount,
    unknownTransitionBurden,
    input.order.map((fact) => fact.assignmentId).join("|"),
  ];
}

export function compareFinalSequencingEvaluation(
  left: FinalSequencingEvaluationVector,
  right: FinalSequencingEvaluationVector,
): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    if (leftValue === rightValue) continue;
    if (typeof leftValue === "number" && typeof rightValue === "number") return leftValue - rightValue;
    return String(leftValue).localeCompare(String(rightValue));
  }
  return 0;
}
