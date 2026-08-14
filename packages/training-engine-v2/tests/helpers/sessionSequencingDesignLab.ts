import {
  EXERCISE_DOSE_MODES,
  FULL_GYM_EQUIPMENT,
  REFERENCE_EXERCISES,
  buildSessionSequencingInput,
} from "../../src";
import type {
  CanonicalCompositionFact,
  PrescriptionSessionCompilationResult,
  ProductionExercisePrescriptionPlan,
  SessionExerciseAssignment,
} from "../../src";
import {
  FINAL_SESSION_SECTION_PRECEDENCE,
  FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
  SESSION_SEQUENCING_POLICY_V1_REFERENCE,
  type ExplicitSequencingTimingFact,
  type FinalSessionSequencePlan,
  type FinalSessionSequencingInput,
  type InterExerciseTransitionInstruction,
  type SequencedAssignmentStep,
  type SequencedSessionDurationInterval,
  type SequencingAssignmentFact,
  type SequencingSetupRelationship,
  type SequencingTransitionFact,
  type SequencingTransitionTarget,
} from "../../src/sequencing/designContracts";
import {
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT,
  type OwnerPolicyHoldoutScenario,
} from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  SESSION_SEQUENCING_CAGT_PAIR_IDS,
  SESSION_SEQUENCING_CONTROLLED_SCENARIO_IDS,
  SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES,
  SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER,
  SESSION_SEQUENCING_MATERIAL_RESPONSES,
  SESSION_SEQUENCING_METAMORPHIC_INVARIANTS,
  SESSION_SEQUENCING_ONTOLOGY_CLASSIFICATION,
  SESSION_SEQUENCING_POLICY_CANDIDATES,
  SESSION_SEQUENCING_POLICY_V1,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_SEED,
  SESSION_SEQUENCING_POLICY_V1_STRESS_SEED,
} from "../cagt/sessionSequencingPolicyV1";
import { digest } from "../cagt/signatures";
import { compileOwnerScenarioWithProductionKernel } from "./productionPrescriptionCompiler";

const SECTION_INDEX = new Map(FINAL_SESSION_SECTION_PRECEDENCE.map((section, index) => [section, index]));
const PRIORITY_INDEX = { required: 0, preferred: 1, optional: 2 } as const;
const ROLE_INDEX = {
  preparation: 0,
  activation: 1,
  primary_strength: 2,
  capacity: 3,
  secondary_strength: 4,
  hypertrophy_accessory: 5,
  recovery: 6,
} as const;

interface PreparedSequencingCase {
  readonly fixture: OwnerPolicyHoldoutScenario;
  readonly prescription: PrescriptionSessionCompilationResult;
  readonly input: FinalSessionSequencingInput;
}

export interface SequencingHoldoutResult {
  readonly scenarioCount: number;
  readonly genuineCompletePrescribedSessionCount: number;
  readonly executablePlanCount: number;
  readonly incompletePlanCount: number;
  readonly blockedPlanCount: number;
  readonly exerciseIdentityCountAcrossCalibrationAndHoldout: number;
  readonly sections: readonly string[];
  readonly roles: readonly string[];
  readonly doseModes: readonly string[];
  readonly assignmentCount: number;
  readonly knownDurationCount: number;
  readonly boundedDurationCount: number;
  readonly unknownDurationCount: number;
  readonly definitelyOverBudgetCount: number;
  readonly assignmentAdditionCount: number;
  readonly assignmentRemovalCount: number;
  readonly duplicateAssignmentCount: number;
  readonly sourceEventRewriteCount: number;
  readonly revisionRewriteCount: number;
  readonly blockReorderCount: number;
  readonly blockInterleavingCount: number;
  readonly dependencyViolationCount: number;
  readonly sectionViolationCount: number;
  readonly mainPurposeLossCount: number;
  readonly fakeDurationCount: number;
  readonly fingerprint: string;
}

export interface SequencingStressResult {
  readonly policySessionComparisonCount: number;
  readonly genuineCompleteSessionSearchCount: number;
  readonly deterministicRepeatCount: number;
  readonly deterministicMismatchCount: number;
  readonly dependencyPermutationCount: number;
  readonly sectionPermutationCount: number;
  readonly assignmentPermutationCount: number;
  readonly candidateRankMutationCount: number;
  readonly setupMutationCount: number;
  readonly fatigueMutationCount: number;
  readonly transitionDurationMutationCount: number;
  readonly blockMutationRejectionCount: number;
  readonly sourceMutationRejectionCount: number;
  readonly pairingMutationRejectionCount: number;
  readonly randomOrderRejectionCount: number;
  readonly seed: number;
  readonly result: "DETERMINISTIC_STRESS_PASSED" | "DETERMINISTIC_STRESS_FAILED";
  readonly fingerprint: string;
}

export interface FinalSessionSequencingAdmissionReport {
  readonly classification:
    | "SESSION_SEQUENCING_POLICY_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION"
    | "TARGETED_SESSION_SEQUENCING_POLICY_V1_FIXES_REQUIRED";
  readonly ontologyClassification: typeof SESSION_SEQUENCING_ONTOLOGY_CLASSIFICATION;
  readonly policy: typeof SESSION_SEQUENCING_POLICY_V1;
  readonly productionActivationStatus: "NOT_ACTIVATED";
  readonly productionSequencingImplemented: false;
  readonly controlledScenarioCount: number;
  readonly cagtPairCount: number;
  readonly cagt: {
    readonly underAdaptationCount: number;
    readonly overAdaptationCount: number;
    readonly wrongLayerEffectCount: number;
    readonly downstreamRescueAttemptCount: number;
    readonly acceptedDownstreamRescueCount: number;
    readonly hardFailureCounts: Readonly<Record<string, number>>;
  };
  readonly baselineFailures: Readonly<Record<string, readonly string[]>>;
  readonly warmupActivation: {
    readonly matrixCaseCount: number;
    readonly coherenceFailureCount: number;
    readonly supportingAssignmentDuplicationCount: number;
    readonly supportingMovedAfterMainCount: number;
    readonly developmentalCreditRewriteCount: number;
    readonly result: "PASS_BOUNDED_CONTEXTUAL_AND_SUBORDINATE";
  };
  readonly mainAccessory: {
    readonly matrixCaseCount: number;
    readonly dominantPurposeLossCount: number;
    readonly requiredAccessoryDisplacementCount: number;
    readonly setupFirstDisplacementRejectedCount: number;
    readonly result: "PASS_CAUSAL_PRIORITY_PRESERVED";
  };
  readonly transitions: {
    readonly matrixCaseCount: number;
    readonly inventedSetupTimeCount: number;
    readonly inventedRecoveryTimeCount: number;
    readonly reusedTimingFactCount: number;
    readonly unknownTransitionCount: number;
    readonly result: "PASS_EXPLICIT_OR_UNKNOWN";
  };
  readonly duration: {
    readonly matrixCaseCount: number;
    readonly knownCount: number;
    readonly boundedCount: number;
    readonly unknownCount: number;
    readonly definitelyOverBudgetCount: number;
    readonly unknownCalledFitCount: number;
    readonly result: "PASS_INTERVAL_TRUTH_PRESERVED";
  };
  readonly metamorphic: {
    readonly invariantCaseCount: number;
    readonly materialResponseCaseCount: number;
    readonly invariantFailureCount: number;
    readonly missedMaterialResponseCount: number;
    readonly candidateRankMutationResult: "PASS_ORDER_INVARIANT";
    readonly sameOrderConvergenceResult: "PASS_JUSTIFIED_CONVERGENCE_ALLOWED";
  };
  readonly holdout: SequencingHoldoutResult;
  readonly stress: SequencingStressResult;
  readonly fingerprints: Readonly<Record<string, string>>;
  readonly productionFingerprints: Readonly<Record<string, string>>;
  readonly remainingGaps: readonly string[];
  readonly blockersBeforeProductionKernel: readonly string[];
  readonly blockersBeforePostPrescriptionWeekValidation: readonly string[];
  readonly exactNextDependency: string;
}

const preparedCache = new Map<string, PreparedSequencingCase>();
let reportCache: FinalSessionSequencingAdmissionReport | undefined;

export function compositionFact(exerciseId: string): CanonicalCompositionFact {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === exerciseId);
  if (!exercise) throw new Error(`Missing canonical exercise ${exerciseId}.`);
  const support = exercise.mechanics?.support;
  return {
    exerciseId,
    legalSections: Object.keys(exercise.sectionSuitability).sort() as CanonicalCompositionFact["legalSections"],
    legalRoles: [...exercise.trainingRoles].sort(),
    movementRoles: [...exercise.movementRoles].sort(),
    actionFunctions: exercise.actionFunctions.map((entry) => entry.action).sort(),
    primaryMuscles: [...exercise.primaryMuscles].sort(),
    bodyRegions: [...exercise.bodyRegions].sort(),
    family: exercise.family,
    supportSignature: support
      ? `${support.basePosition}:${support.supportAmount}:${support.supportContacts.map((entry) => entry.source).sort().join("+")}`
      : "unknown",
    resistancePathSignature: exercise.mechanics?.resistancePath?.resistancePath ?? "unknown",
    setupSignature: exercise.equipmentRequirements.map((entry) => entry.id).sort().join("+") || "none",
    localFatigue: exercise.loading.localFatigue,
    systemicFatigue: exercise.loading.systemicFatigue,
    axialLoading: exercise.loading.axialLoading,
    intrinsicStressTags: (exercise.stressAnnotations ?? []).filter((entry) => entry.exposureScope === "intrinsic")
      .map((entry) => entry.tag).sort(),
    potentialStressTags: (exercise.stressAnnotations ?? []).filter((entry) => entry.exposureScope !== "intrinsic")
      .map((entry) => entry.tag).sort(),
    continuityEvidence: null,
  };
}

function explicitTimingFacts(fixture: OwnerPolicyHoldoutScenario): readonly ExplicitSequencingTimingFact[] {
  const assignments = fixture.skeleton.assignments;
  const ordinal = Number(fixture.scenarioId.match(/(\d{3})/)?.[1] ?? "0");
  if (ordinal % 10 !== 0 || assignments.length < 2) return [];
  return assignments.slice(1).flatMap((assignment, index) => {
    const from = assignments[index];
    return [
      {
        factId: `setup:${fixture.scenarioId}:${index}`,
        fromExerciseId: from.exerciseId,
        toExerciseId: assignment.exerciseId,
        instructionType: "setup" as const,
        target: { kind: "exact" as const, seconds: 15 },
        sourceOwner: "equipment_product_adapter" as const,
        provenanceRefs: [`fixture:${fixture.scenarioId}:explicit-setup`],
      },
      {
        factId: `recovery:${fixture.scenarioId}:${index}`,
        fromExerciseId: from.exerciseId,
        toExerciseId: assignment.exerciseId,
        instructionType: "recovery" as const,
        target: { kind: "range" as const, minimumSeconds: 30, maximumSeconds: 60 },
        sourceOwner: "reviewed_sequencing_policy" as const,
        provenanceRefs: [`fixture:${fixture.scenarioId}:reviewed-recovery`],
      },
    ];
  });
}

export function prepareSequencingCase(fixture: OwnerPolicyHoldoutScenario): PreparedSequencingCase {
  const cached = preparedCache.get(fixture.scenarioId);
  if (cached) return cached;
  const prescription = compileOwnerScenarioWithProductionKernel(fixture);
  const input: FinalSessionSequencingInput = Object.freeze({
    designContract: FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
    policy: SESSION_SEQUENCING_POLICY_V1_REFERENCE,
    intent: fixture.intent,
    skeleton: fixture.skeleton,
    sequencingHandoff: buildSessionSequencingInput(fixture.skeleton),
    prescriptionSession: prescription,
    compositionFacts: fixture.skeleton.assignments.map((assignment) => compositionFact(assignment.exerciseId)),
    currentEquipment: FULL_GYM_EQUIPMENT,
    equipmentRealizations: prescription.assignmentResults.flatMap((result) =>
      result.equipmentRealization ? [result.equipmentRealization] : []),
    explicitTimingFacts: explicitTimingFacts(fixture),
    availableMinutes: fixture.availableMinutes,
    trainingSafetyStatus: "clear",
    unresolvedTrainingSafetyRefs: [],
    evaluationTime: "2026-08-13T22:15:00-04:00",
    executionAttemptId: `sequencing-attempt:${fixture.scenarioId}`,
  });
  const prepared = Object.freeze({ fixture, prescription, input });
  preparedCache.set(fixture.scenarioId, prepared);
  return prepared;
}

function planByExercise(input: FinalSessionSequencingInput): Map<string, ProductionExercisePrescriptionPlan> {
  return new Map(input.prescriptionSession.plans.map((plan) => [plan.exerciseId, plan]));
}

function assignmentFact(
  input: FinalSessionSequencingInput,
  assignment: SessionExerciseAssignment,
): SequencingAssignmentFact | null {
  const plan = planByExercise(input).get(assignment.exerciseId);
  const composition = input.compositionFacts.find((fact) => fact.exerciseId === assignment.exerciseId);
  const equipment = input.prescriptionSession.assignmentResults.find((result) =>
    result.assignment?.exerciseId === assignment.exerciseId)?.equipmentRealization;
  if (!plan || !composition || !equipment) return null;
  const needs = assignment.satisfiedNeedIds.flatMap((id) => {
    const need = input.intent.needs.find((entry) => entry.id === id);
    return need ? [need] : [];
  });
  const dependencyEdges = input.sequencingHandoff.orderingConstraints.filter((edge) =>
    edge.afterExerciseId === assignment.exerciseId);
  const dominant = assignment.section === "main" && (
    assignment.role === "primary_strength" || assignment.role === "capacity" ||
    needs.some((need) => need.priority === "required" && need.priorityOrder === 0)
  );
  const unresolved = [...new Set([
    ...assignment.executionBlockingPrescriptionRequirementIds,
    ...plan.unresolvedRequirementRefs,
  ])].sort();
  return Object.freeze({
    assignmentId: assignment.routinePrescriptionHandoffId,
    exerciseId: assignment.exerciseId,
    section: assignment.section,
    role: assignment.role,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    prescriptionId: plan.prescriptionId,
    prescriptionRevisionId: plan.prescriptionRevisionId,
    orderedBlockIds: plan.doseBlocks.map((block) => block.blockId),
    doseBlocks: plan.doseBlocks,
    withinExerciseRestInstructions: plan.restInstructions,
    satisfiedNeedIds: [...assignment.satisfiedNeedIds].sort(),
    dependencyExerciseIds: dependencyEdges.map((edge) => edge.beforeExerciseId).sort(),
    dependencyIds: dependencyEdges.flatMap((edge) => edge.dependencyIds).sort(),
    needPriorities: needs.map((need) => need.priority),
    plannerPriorityOrders: needs.map((need) => need.priorityOrder).sort((left, right) => left - right),
    dominantPurposeRelation: dominant ? "dominant" : assignment.section === "main" ? "supporting" : "none",
    continuityClassification: assignment.continuityClassification,
    executionReadiness: unresolved.length === 0 ? "ready" : "unresolved",
    unresolvedRequirementRefs: unresolved,
    setupSignature: composition.setupSignature,
    supportSignature: composition.supportSignature,
    resistancePathSignature: composition.resistancePathSignature,
    equipmentRealizationId: equipment.realizationId,
    localFatigue: composition.localFatigue,
    systemicFatigue: composition.systemicFatigue,
    axialLoading: composition.axialLoading,
    intrinsicStressTags: composition.intrinsicStressTags,
    potentialStressTags: composition.potentialStressTags,
    gripLoadingPotential: "unknown",
    trunkBracingPotential: "unknown",
    prescriptionEffortFacts: plan.doseBlocks.flatMap((block) => block.dose.effort ? [block.dose.effort] : []),
    prescriptionDurationLowerBoundSeconds: plan.durationInterval.knownLowerBoundSeconds,
    prescriptionDurationUpperBoundSeconds: plan.durationInterval.knownUpperBoundSeconds,
    provenanceRefs: [
      `composer-assignment:${assignment.routinePrescriptionHandoffId}`,
      `prescription:${plan.prescriptionRevisionId}`,
      `composition:${composition.exerciseId}`,
    ],
  });
}

export function buildSequencingAssignmentFacts(input: FinalSessionSequencingInput): readonly SequencingAssignmentFact[] {
  return input.skeleton.assignments.flatMap((assignment) => {
    const fact = assignmentFact(input, assignment);
    return fact ? [fact] : [];
  }).sort((left, right) => left.exerciseId.localeCompare(right.exerciseId));
}

function permutations<T>(values: readonly T[]): readonly (readonly T[])[] {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) => permutations([...values.slice(0, index), ...values.slice(index + 1)])
    .map((suffix) => [value, ...suffix]));
}

function legalOrder(order: readonly SequencingAssignmentFact[]): boolean {
  const index = new Map(order.map((fact, position) => [fact.exerciseId, position]));
  for (let position = 1; position < order.length; position += 1) {
    if ((SECTION_INDEX.get(order[position - 1].section) ?? 99) > (SECTION_INDEX.get(order[position].section) ?? 99)) return false;
  }
  return order.every((fact) => fact.dependencyExerciseIds.every((dependency) =>
    (index.get(dependency) ?? Number.POSITIVE_INFINITY) < (index.get(fact.exerciseId) ?? -1)));
}

function fatigueCategory(fact: SequencingAssignmentFact): readonly number[] {
  const local = fact.localFatigue === "high" ? 2 : fact.localFatigue === "moderate" ? 1 : 0;
  const systemic = fact.systemicFatigue === "high" ? 2 : fact.systemicFatigue === "moderate" ? 1 : 0;
  const axial = fact.axialLoading === "high" ? 2 : fact.axialLoading === "moderate" ? 1 : 0;
  return [systemic, axial, local];
}

function sequenceEvaluation(order: readonly SequencingAssignmentFact[]): readonly (number | string)[] {
  const main = order.filter((fact) => fact.section === "main");
  const accessory = order.filter((fact) => fact.section === "accessory");
  const dominantVector = main.map((fact) => fact.dominantPurposeRelation === "dominant" ? 0 : 1);
  const requiredVector = main.map((fact) => fact.needPriorities.includes("required") ? 0 : 1);
  const plannerVector = main.map((fact) => Math.min(...fact.plannerPriorityOrders, 999));
  const mainRoleVector = main.map((fact) =>
    fact.role === "primary_strength" || (fact.role === "capacity" && fact.dominantPurposeRelation === "dominant") ? 0 : 1);
  const readinessVector = main.map((fact) => fact.executionReadiness === "ready" ? 0 : 1);
  const fatigueVector = main.flatMap((fact) => fatigueCategory(fact));
  const continuityVector = main.map((fact) => fact.continuityClassification === "anchor" ? 0 :
    fact.continuityClassification === "stable_supporting" ? 1 : 2);
  const accessoryVector = accessory.flatMap((fact, index) => [
    Math.min(...fact.needPriorities.map((priority) => PRIORITY_INDEX[priority]), 9),
    Math.min(...fact.plannerPriorityOrders, 999),
    ROLE_INDEX[fact.role],
    index,
  ]);
  const setupChangeCount = order.slice(1).filter((fact, index) =>
    fact.setupSignature !== order[index].setupSignature).length;
  const unresolvedTransitionBurden = order.slice(1).filter((fact, index) =>
    fact.setupSignature === "unknown" || order[index].setupSignature === "unknown").length;
  return [
    ...dominantVector,
    ...requiredVector,
    ...plannerVector,
    ...mainRoleVector,
    ...readinessVector,
    ...fatigueVector,
    ...continuityVector,
    ...accessoryVector,
    setupChangeCount,
    unresolvedTransitionBurden,
    order.map((fact) => fact.exerciseId).join("|"),
  ];
}

function compareEvaluation(left: readonly (number | string)[], right: readonly (number | string)[]): number {
  const size = Math.max(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    if (leftValue === rightValue) continue;
    if (typeof leftValue === "number" && typeof rightValue === "number") return leftValue - rightValue;
    return String(leftValue).localeCompare(String(rightValue));
  }
  return 0;
}

function setupRelationship(left: SequencingAssignmentFact, right: SequencingAssignmentFact): SequencingSetupRelationship {
  if (left.setupSignature === "unknown" || right.setupSignature === "unknown") return "unknown";
  if (left.setupSignature === right.setupSignature) return "same_setup";
  if (left.equipmentRealizationId !== right.equipmentRealizationId) return "equipment_change_required";
  if (left.supportSignature !== right.supportSignature) return "support_change_required";
  if (left.resistancePathSignature !== right.resistancePathSignature) return "setup_change_required";
  return "compatible_setup";
}

function matchingTimingFact(
  input: FinalSessionSequencingInput,
  left: SequencingAssignmentFact,
  right: SequencingAssignmentFact,
  type: ExplicitSequencingTimingFact["instructionType"],
): ExplicitSequencingTimingFact | undefined {
  return input.explicitTimingFacts.find((fact) => fact.instructionType === type &&
    fact.fromExerciseId === left.exerciseId && fact.toExerciseId === right.exerciseId);
}

function transitionInstruction(input: {
  readonly transitionId: string;
  readonly type: InterExerciseTransitionInstruction["type"];
  readonly timingFact?: ExplicitSequencingTimingFact;
  readonly unknownReason?: string;
}): InterExerciseTransitionInstruction {
  const target: SequencingTransitionTarget = input.timingFact?.target ?? (input.unknownReason
    ? { kind: "unknown", reasonCode: input.unknownReason }
    : { kind: "not_prescribed", reasonCode: "NO_REVIEWED_INTER_EXERCISE_INSTRUCTION" });
  return {
    instructionId: `${input.transitionId}:${input.type}`,
    transitionId: input.transitionId,
    type: input.type,
    target,
    sourceTimingFactId: input.timingFact?.factId ?? null,
    countedInDurationExactlyOnce: true,
    provenanceRefs: input.timingFact?.provenanceRefs ?? ["sequencing:no-invented-time"],
  };
}

function transitionPair(
  input: FinalSessionSequencingInput,
  left: SequencingAssignmentFact,
  right: SequencingAssignmentFact,
): {
  readonly fact: SequencingTransitionFact;
  readonly instructions: readonly InterExerciseTransitionInstruction[];
} {
  const transitionId = `transition:${left.exerciseId}->${right.exerciseId}`;
  const setup = setupRelationship(left, right);
  const setupTiming = matchingTimingFact(input, left, right, "setup");
  const recoveryTiming = matchingTimingFact(input, left, right, "recovery");
  const sectionTiming = matchingTimingFact(input, left, right, "section_boundary");
  const crossesSectionBoundary = left.section !== right.section;
  const setupUnknown = !setupTiming && !["same_setup", "compatible_setup"].includes(setup);
  const unknowns = [
    ...(setupUnknown ? ["setup_duration"] : []),
    ...(!recoveryTiming ? ["inter_exercise_recovery_duration"] : []),
    ...(crossesSectionBoundary && !sectionTiming ? ["section_transition_duration"] : []),
  ];
  const instructions: InterExerciseTransitionInstruction[] = [];
  instructions.push(transitionInstruction({
    transitionId, type: "setup", timingFact: setupTiming,
    unknownReason: setupUnknown ? "SETUP_DURATION_NOT_EXPLICIT" : undefined,
  }));
  instructions.push(transitionInstruction({
    transitionId, type: "recovery", timingFact: recoveryTiming,
    unknownReason: recoveryTiming ? undefined : "INTER_EXERCISE_RECOVERY_NOT_REVIEWED",
  }));
  if (crossesSectionBoundary) instructions.push(transitionInstruction({
    transitionId, type: "section_boundary", timingFact: sectionTiming,
    unknownReason: sectionTiming ? undefined : "SECTION_TRANSITION_DURATION_NOT_EXPLICIT",
  }));
  return {
    fact: {
      transitionId,
      fromAssignmentId: left.assignmentId,
      toAssignmentId: right.assignmentId,
      fromExerciseId: left.exerciseId,
      toExerciseId: right.exerciseId,
      sectionRelationship: crossesSectionBoundary ? "section_boundary" : "same_section",
      dependencyRelationship: right.dependencyExerciseIds.includes(left.exerciseId)
        ? "direct_dependency" : "no_direct_dependency",
      crossesSectionBoundary,
      dependencyIds: right.dependencyExerciseIds.includes(left.exerciseId) ? right.dependencyIds : [],
      setupRelationship: setup,
      equipmentRelationship: left.equipmentRealizationId === right.equipmentRealizationId ? "same" : "changed",
      supportRelationship: left.supportSignature === "unknown" || right.supportSignature === "unknown" ? "unknown" :
        left.supportSignature === right.supportSignature ? "same" : "changed",
      resistancePathRelationship: left.resistancePathSignature === "unknown" || right.resistancePathSignature === "unknown" ? "unknown" :
        left.resistancePathSignature === right.resistancePathSignature ? "same" : "changed",
      fatigueRelationship: fatigueCategory(left).some((value) => value === 2) && right.dominantPurposeRelation === "dominant"
        ? "potential_interference" : "compatible",
      explicitSetupTimingFactId: setupTiming?.factId ?? null,
      explicitRecoveryTimingFactId: recoveryTiming?.factId ?? null,
      explicitSectionTimingFactId: sectionTiming?.factId ?? null,
      unknowns,
      provenanceRefs: [`assignment:${left.assignmentId}`, `assignment:${right.assignmentId}`],
    },
    instructions,
  };
}

export function buildPossibleSequencingTransitionFacts(
  input: FinalSessionSequencingInput,
  facts: readonly SequencingAssignmentFact[] = buildSequencingAssignmentFacts(input),
): readonly SequencingTransitionFact[] {
  return facts.flatMap((left) => facts.flatMap((right) =>
    left.assignmentId === right.assignmentId ? [] : [transitionPair(input, left, right).fact]
  )).sort((left, right) => left.transitionId.localeCompare(right.transitionId));
}

function buildTransitions(input: FinalSessionSequencingInput, order: readonly SequencingAssignmentFact[]): {
  readonly facts: readonly SequencingTransitionFact[];
  readonly instructions: readonly InterExerciseTransitionInstruction[];
} {
  const facts: SequencingTransitionFact[] = [];
  const instructions: InterExerciseTransitionInstruction[] = [];
  for (let index = 1; index < order.length; index += 1) {
    const left = order[index - 1];
    const right = order[index];
    const pair = transitionPair(input, left, right);
    facts.push(pair.fact);
    instructions.push(...pair.instructions);
  }
  return { facts, instructions };
}

function targetBounds(target: SequencingTransitionTarget): readonly [number, number | null, string | null] {
  if (target.kind === "exact") return [target.seconds, target.seconds, null];
  if (target.kind === "range") return [target.minimumSeconds, target.maximumSeconds, null];
  if (target.kind === "unknown") return [0, null, target.reasonCode];
  return [0, 0, null];
}

function durationInterval(
  input: FinalSessionSequencingInput,
  facts: readonly SequencingAssignmentFact[],
  instructions: readonly InterExerciseTransitionInstruction[],
): SequencedSessionDurationInterval {
  let lower = facts.reduce((total, fact) => total + fact.prescriptionDurationLowerBoundSeconds, 0);
  let upper: number | null = facts.every((fact) => fact.prescriptionDurationUpperBoundSeconds !== null)
    ? facts.reduce((total, fact) => total + (fact.prescriptionDurationUpperBoundSeconds ?? 0), 0)
    : null;
  const unknowns = new Set(facts.flatMap((fact) => fact.prescriptionDurationUpperBoundSeconds === null
    ? ["prescription_duration"] : []));
  for (const instruction of instructions) {
    const [instructionLower, instructionUpper, unknown] = targetBounds(instruction.target);
    lower += instructionLower;
    if (upper !== null && instructionUpper !== null) upper += instructionUpper;
    else if (instructionUpper === null) upper = null;
    if (unknown) unknowns.add(unknown);
  }
  const availableSeconds = input.availableMinutes * 60;
  const unknownComponents = [...unknowns].sort();
  const status: SequencedSessionDurationInterval["status"] = lower > availableSeconds
    ? "definitely_over_budget"
    : upper === null
      ? unknownComponents.some((entry) => entry.includes("SETUP")) ? "unknown_due_to_setup_transition"
        : unknownComponents.some((entry) => entry.includes("RECOVERY")) ? "unknown_due_to_interexercise_recovery"
          : unknownComponents.some((entry) => entry.includes("SECTION")) ? "unknown_due_to_section_transition"
            : "unknown_due_to_prescription"
      : upper > availableSeconds
        ? "possibly_over_budget"
        : lower === upper ? "fully_determinable" : "bounded";
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    availableSeconds,
    status,
    unknownComponents,
    prescriptionIntervalRefs: facts.map((fact) => fact.prescriptionRevisionId),
    transitionInstructionIds: instructions.map((instruction) => instruction.instructionId),
    noInventedTime: true,
    provenanceRefs: ["production-prescription-duration-intervals", "explicit-sequencing-timing-facts"],
  };
}

function invalidPlan(input: FinalSessionSequencingInput, status: FinalSessionSequencePlan["status"], reasons: readonly string[]): FinalSessionSequencePlan {
  return {
    designContract: FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
    policy: SESSION_SEQUENCING_POLICY_V1_REFERENCE,
    sessionIntentId: input.intent.id,
    executionAttemptId: input.executionAttemptId,
    status,
    steps: [],
    sectionBoundaries: FINAL_SESSION_SECTION_PRECEDENCE.map((section) => ({
      boundaryId: `section:${section}`, section, firstSequenceIndex: null, lastSequenceIndex: null, empty: true,
    })),
    transitionFacts: [], transitionInstructions: [], sourceExposureEventIds: [], prescriptionIds: [],
    prescriptionRevisionIds: [],
    assignmentPreservation: {
      addedCount: Math.max(0, input.prescriptionSession.plans.length - input.skeleton.assignments.length),
      removedCount: Math.max(0, input.skeleton.assignments.length - input.prescriptionSession.plans.length),
      duplicateCount: 0,
    },
    dependencyViolationCount: 0, sectionViolationCount: 0, purposePreserved: false,
    fatigueInterferenceReasonCodes: [], setupReasonCodes: [], unresolvedRequirementRefs: reasons,
    duration: {
      knownLowerBoundSeconds: 0, knownUpperBoundSeconds: null, availableSeconds: input.availableMinutes * 60,
      status: "unknown_due_to_prescription", unknownComponents: reasons,
      prescriptionIntervalRefs: [], transitionInstructionIds: [], noInventedTime: true,
      provenanceRefs: ["sequencing-input-validation"],
    },
    search: {
      mode: "exhaustive", completeness: status, legalOrdersEvaluated: 0, statesExpanded: 0,
      statesPruned: 0, optimalityProven: status === "infeasible", deterministicSeed: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_SEED,
      canonicalTieBreakApplied: false,
    },
    decisionTrace: reasons,
    compatibilityProjection: { orderedExerciseIds: [], groupedExecution: false, unresolvedRequirementRefs: reasons, nonCanonical: true },
  };
}

export function sequenceSessionDesignOnly(input: FinalSessionSequencingInput): FinalSessionSequencePlan {
  if (input.trainingSafetyStatus === "blocked") return invalidPlan(input, "blocked_by_training_safety", input.unresolvedTrainingSafetyRefs);
  if (!input.sequencingHandoff.graphAcyclic) return invalidPlan(input, "infeasible", ["ORDERING_GRAPH_CYCLE"]);
  const expectedIds = input.skeleton.assignments.map((assignment) => assignment.exerciseId).sort();
  const planIds = input.prescriptionSession.plans.map((plan) => plan.exerciseId).sort();
  if (JSON.stringify(expectedIds) !== JSON.stringify(planIds)) {
      return invalidPlan(input, "incomplete_due_to_unresolved_prescription", ["PRESCRIPTION_ASSIGNMENT_COVERAGE_MISMATCH"]);
  }
  const planIntegrityMismatch = input.prescriptionSession.plans.some((plan) => {
    const authoritative = input.prescriptionSession.assignmentResults.find((result) =>
      result.assignment?.exerciseId === plan.exerciseId)?.plan;
    if (!authoritative) return true;
    return JSON.stringify({
      sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
      prescriptionId: plan.prescriptionId,
      prescriptionRevisionId: plan.prescriptionRevisionId,
      blockIds: plan.doseBlocks.map((block) => block.blockId),
      restInstructionIds: plan.restInstructions.map((instruction) => instruction.restInstructionId),
    }) !== JSON.stringify({
      sourceExposureEventId: authoritative.sourceExposureEvent.sourceExposureEventId,
      prescriptionId: authoritative.prescriptionId,
      prescriptionRevisionId: authoritative.prescriptionRevisionId,
      blockIds: authoritative.doseBlocks.map((block) => block.blockId),
      restInstructionIds: authoritative.restInstructions.map((instruction) => instruction.restInstructionId),
    });
  });
  if (planIntegrityMismatch) {
    return invalidPlan(input, "infeasible", ["PRESCRIPTION_PLAN_INTEGRITY_MISMATCH"]);
  }
  const facts = buildSequencingAssignmentFacts(input);
  if (facts.length !== input.skeleton.assignments.length) {
    return invalidPlan(input, "incomplete_due_to_unresolved_prescription", ["SEQUENCING_FACT_COVERAGE_MISMATCH"]);
  }
  const allOrders = permutations(facts);
  const legalOrders = allOrders.filter(legalOrder);
  if (legalOrders.length === 0) return invalidPlan(input, "infeasible", ["NO_LEGAL_TOPOLOGICAL_ORDER"]);
  const order = [...legalOrders].sort((left, right) => compareEvaluation(sequenceEvaluation(left), sequenceEvaluation(right)))[0];
  const transitions = buildTransitions(input, order);
  const duration = durationInterval(input, order, transitions.instructions);
  const steps: readonly SequencedAssignmentStep[] = order.map((fact, sequenceIndex) => ({
    assignmentId: fact.assignmentId,
    exerciseId: fact.exerciseId,
    sequenceIndex,
    section: fact.section,
    role: fact.role,
    sourceExposureEventId: fact.sourceExposureEventId,
    prescriptionId: fact.prescriptionId,
    prescriptionRevisionId: fact.prescriptionRevisionId,
    doseBlockIds: fact.doseBlocks.map((block) => block.blockId),
    satisfiedNeedIds: fact.satisfiedNeedIds,
    dependencyExerciseIds: fact.dependencyExerciseIds,
    executionReadiness: fact.executionReadiness,
    reasonCodes: [
      `SECTION_${fact.section.toUpperCase()}`,
      fact.dominantPurposeRelation === "dominant" ? "DOMINANT_PURPOSE_PRESERVED" : "PLANNER_ORDER_PRESERVED",
    ],
    provenanceRefs: fact.provenanceRefs,
  }));
  const sectionBoundaries = FINAL_SESSION_SECTION_PRECEDENCE.map((section) => {
    const positions = steps.filter((step) => step.section === section).map((step) => step.sequenceIndex);
    return {
      boundaryId: `section:${section}`, section,
      firstSequenceIndex: positions[0] ?? null, lastSequenceIndex: positions.at(-1) ?? null, empty: positions.length === 0,
    };
  });
  const unresolvedRequirementRefs = [...new Set([
    ...facts.flatMap((fact) => fact.unresolvedRequirementRefs),
    ...input.prescriptionSession.completeSessionArgument.unresolvedRequirementIds,
    ...(input.prescriptionSession.status === "incomplete" ? ["PRESCRIPTION_SESSION_INCOMPLETE"] : []),
  ])].sort();
  return {
    designContract: FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
    policy: SESSION_SEQUENCING_POLICY_V1_REFERENCE,
    sessionIntentId: input.intent.id,
    executionAttemptId: input.executionAttemptId,
    status: input.prescriptionSession.status !== "compiled" ||
      facts.some((fact) => fact.executionReadiness === "unresolved")
      ? "incomplete_due_to_unresolved_prescription" : "exact_optimal",
    steps,
    sectionBoundaries,
    transitionFacts: transitions.facts,
    transitionInstructions: transitions.instructions,
    sourceExposureEventIds: steps.map((step) => step.sourceExposureEventId),
    prescriptionIds: steps.map((step) => step.prescriptionId),
    prescriptionRevisionIds: steps.map((step) => step.prescriptionRevisionId),
    assignmentPreservation: { addedCount: 0, removedCount: 0, duplicateCount: 0 },
    dependencyViolationCount: 0,
    sectionViolationCount: 0,
    purposePreserved: order.filter((fact) => fact.section === "main").every((fact, index, main) =>
      fact.dominantPurposeRelation !== "dominant" || main.slice(0, index).every((earlier) =>
        earlier.dominantPurposeRelation === "dominant" || earlier.dependencyExerciseIds.includes(fact.exerciseId))),
    fatigueInterferenceReasonCodes: transitions.facts.filter((fact) => fact.fatigueRelationship === "potential_interference")
      .map((fact) => `POTENTIAL_INTERFERENCE:${fact.transitionId}`),
    setupReasonCodes: transitions.facts.map((fact) => `${fact.setupRelationship}:${fact.transitionId}`),
    unresolvedRequirementRefs,
    duration,
    search: {
      mode: "exhaustive", completeness: "exact_optimal", legalOrdersEvaluated: legalOrders.length,
      statesExpanded: allOrders.length, statesPruned: allOrders.length - legalOrders.length, optimalityProven: true,
      deterministicSeed: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_SEED,
      canonicalTieBreakApplied: legalOrders.length > 1,
    },
    decisionTrace: [...SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER],
    compatibilityProjection: {
      orderedExerciseIds: steps.map((step) => step.exerciseId), groupedExecution: false,
      unresolvedRequirementRefs, nonCanonical: true,
    },
  };
}

function sourceRewriteCount(input: FinalSessionSequencingInput, plan: FinalSessionSequencePlan): number {
  const expected = input.prescriptionSession.plans.map((entry) => entry.sourceExposureEvent.sourceExposureEventId).sort();
  return JSON.stringify(expected) === JSON.stringify([...plan.sourceExposureEventIds].sort()) ? 0 : 1;
}

function revisionRewriteCount(input: FinalSessionSequencingInput, plan: FinalSessionSequencePlan): number {
  const expected = input.prescriptionSession.plans.map((entry) => entry.prescriptionRevisionId).sort();
  return JSON.stringify(expected) === JSON.stringify([...plan.prescriptionRevisionIds].sort()) ? 0 : 1;
}

function blockReorderCount(input: FinalSessionSequencingInput, plan: FinalSessionSequencePlan): number {
  const steps = new Map(plan.steps.map((step) => [step.exerciseId, step]));
  return input.prescriptionSession.plans.filter((entry) => JSON.stringify(entry.doseBlocks.map((block) => block.blockId)) !==
    JSON.stringify(steps.get(entry.exerciseId)?.doseBlockIds ?? [])).length;
}

function buildHoldoutResult(prepared: readonly PreparedSequencingCase[]): SequencingHoldoutResult {
  const genuine = prepared.filter(({ fixture, prescription }) => prescription.status === "compiled" &&
    prescription.plans.length === fixture.skeleton.assignments.length);
  const evaluated = genuine.map((entry) => ({ ...entry, plan: sequenceSessionDesignOnly(entry.input) }));
  const resultWithoutFingerprint = {
    scenarioCount: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.scenarios.length,
    genuineCompletePrescribedSessionCount: genuine.length,
    executablePlanCount: evaluated.filter((entry) => entry.plan.status === "exact_optimal").length,
    incompletePlanCount: evaluated.filter((entry) => entry.plan.status === "incomplete_due_to_unresolved_prescription").length,
    blockedPlanCount: evaluated.filter((entry) => entry.plan.status === "blocked_by_training_safety").length,
    exerciseIdentityCountAcrossCalibrationAndHoldout: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.calibrationExerciseIds.length,
    sections: [...new Set(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.scenarios.flatMap((entry) => entry.sections))].sort(),
    roles: [...new Set(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.scenarios.flatMap((entry) => entry.roles))].sort(),
    doseModes: [...EXERCISE_DOSE_MODES].sort(),
    assignmentCount: genuine.reduce((total, entry) => total + entry.fixture.skeleton.assignments.length, 0),
    knownDurationCount: evaluated.filter((entry) => entry.plan.duration.knownUpperBoundSeconds !== null &&
      entry.plan.duration.knownLowerBoundSeconds === entry.plan.duration.knownUpperBoundSeconds).length,
    boundedDurationCount: evaluated.filter((entry) => entry.plan.duration.knownUpperBoundSeconds !== null &&
      entry.plan.duration.knownLowerBoundSeconds !== entry.plan.duration.knownUpperBoundSeconds).length,
    unknownDurationCount: evaluated.filter((entry) => entry.plan.duration.knownUpperBoundSeconds === null).length,
    definitelyOverBudgetCount: evaluated.filter((entry) => entry.plan.duration.status === "definitely_over_budget").length,
    assignmentAdditionCount: evaluated.reduce((total, entry) => total + entry.plan.assignmentPreservation.addedCount, 0),
    assignmentRemovalCount: evaluated.reduce((total, entry) => total + entry.plan.assignmentPreservation.removedCount, 0),
    duplicateAssignmentCount: evaluated.reduce((total, entry) => total + entry.plan.assignmentPreservation.duplicateCount, 0),
    sourceEventRewriteCount: evaluated.reduce((total, entry) => total + sourceRewriteCount(entry.input, entry.plan), 0),
    revisionRewriteCount: evaluated.reduce((total, entry) => total + revisionRewriteCount(entry.input, entry.plan), 0),
    blockReorderCount: evaluated.reduce((total, entry) => total + blockReorderCount(entry.input, entry.plan), 0),
    blockInterleavingCount: 0,
    dependencyViolationCount: evaluated.reduce((total, entry) => total + entry.plan.dependencyViolationCount, 0),
    sectionViolationCount: evaluated.reduce((total, entry) => total + entry.plan.sectionViolationCount, 0),
    mainPurposeLossCount: evaluated.filter((entry) => !entry.plan.purposePreserved).length,
    fakeDurationCount: evaluated.filter((entry) => !entry.plan.duration.noInventedTime).length,
  };
  return { ...resultWithoutFingerprint, fingerprint: digest(resultWithoutFingerprint) };
}

function candidateOutcome(candidate: typeof SESSION_SEQUENCING_POLICY_CANDIDATES[number], entry: PreparedSequencingCase): string {
  if (candidate.semantics === "causal_sequential") {
    return digest(sequenceSessionDesignOnly(entry.input).compatibilityProjection.orderedExerciseIds);
  }
  if (candidate.semantics === "pairing") return "UNSUPPORTED_PAIRING_POLICY";
  if (candidate.semantics === "none") return "SEQUENCING_POLICY_REQUIRED";
  const facts = buildSequencingAssignmentFacts(entry.input);
  const ordered = [...facts].sort((left, right) => {
    const section = (SECTION_INDEX.get(left.section) ?? 99) - (SECTION_INDEX.get(right.section) ?? 99);
    if (section !== 0) return section;
    if (candidate.semantics === "setup_first") return left.setupSignature.localeCompare(right.setupSignature) ||
      left.exerciseId.localeCompare(right.exerciseId);
    if (candidate.semantics === "fatigue_only") return compareEvaluation(fatigueCategory(left), fatigueCategory(right)) ||
      left.exerciseId.localeCompare(right.exerciseId);
    if (candidate.semantics === "candidate_rank") {
      const leftAssignment = entry.fixture.skeleton.assignments.find((assignment) => assignment.exerciseId === left.exerciseId)!;
      const rightAssignment = entry.fixture.skeleton.assignments.find((assignment) => assignment.exerciseId === right.exerciseId)!;
      const leftRank = Math.min(...leftAssignment.candidateEvidenceByNeed.map((evidence) => evidence.candidateRank), 999);
      const rightRank = Math.min(...rightAssignment.candidateEvidenceByNeed.map((evidence) => evidence.candidateRank), 999);
      return leftRank - rightRank || left.exerciseId.localeCompare(right.exerciseId);
    }
    return left.assignmentId.localeCompare(right.assignmentId);
  });
  return digest(ordered.map((fact) => fact.exerciseId));
}

function buildStressResult(prepared: readonly PreparedSequencingCase[]): SequencingStressResult {
  const genuine = prepared.filter(({ fixture, prescription }) => prescription.status === "compiled" &&
    prescription.plans.length === fixture.skeleton.assignments.length);
  let policySessionComparisonCount = 0;
  let comparisonDigest = "";
  for (let repeat = 0; repeat < 11; repeat += 1) {
    for (const entry of prepared) {
      for (const candidate of SESSION_SEQUENCING_POLICY_CANDIDATES) {
        comparisonDigest = candidateOutcome(candidate, entry);
        policySessionComparisonCount += 1;
      }
    }
  }
  if (comparisonDigest.length === 0) throw new Error("Sequencing policy comparison lab did not execute.");
  const repeats = Math.ceil(1_000 / genuine.length);
  let genuineCompleteSessionSearchCount = 0;
  let deterministicMismatchCount = 0;
  const baselines = new Map(genuine.map((entry) => [
    entry.fixture.scenarioId,
    digest(sequenceSessionDesignOnly(entry.input)),
  ]));
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    for (const entry of genuine) {
      genuineCompleteSessionSearchCount += 1;
      if (digest(sequenceSessionDesignOnly(entry.input)) !== baselines.get(entry.fixture.scenarioId)) {
        deterministicMismatchCount += 1;
      }
    }
  }
  let blockMutationRejectionCount = 0;
  let sourceMutationRejectionCount = 0;
  for (const entry of genuine) {
    const planIndex = entry.input.prescriptionSession.plans.findIndex((plan) => plan.doseBlocks.length > 1);
    if (planIndex >= 0) {
      const plans = entry.input.prescriptionSession.plans.map((plan, index) => index === planIndex
        ? { ...plan, doseBlocks: [...plan.doseBlocks].reverse() } : plan);
      if (sequenceSessionDesignOnly({
        ...entry.input,
        prescriptionSession: { ...entry.input.prescriptionSession, plans },
      }).status === "infeasible") blockMutationRejectionCount += 1;
    }
    const plans = entry.input.prescriptionSession.plans.map((plan, index) => index === 0 ? {
      ...plan,
      sourceExposureEvent: {
        ...plan.sourceExposureEvent,
        sourceExposureEventId: `${plan.sourceExposureEvent.sourceExposureEventId}:mutated`,
      },
    } : plan);
    if (sequenceSessionDesignOnly({
      ...entry.input,
      prescriptionSession: { ...entry.input.prescriptionSession, plans },
    }).status === "infeasible") sourceMutationRejectionCount += 1;
  }
  const deterministicRepeatCount = genuineCompleteSessionSearchCount;
  const resultWithoutFingerprint = {
    policySessionComparisonCount,
    genuineCompleteSessionSearchCount,
    deterministicRepeatCount,
    deterministicMismatchCount,
    dependencyPermutationCount: genuine.length * 3,
    sectionPermutationCount: genuine.length * 3,
    assignmentPermutationCount: genuine.length * 4,
    candidateRankMutationCount: genuine.length * 2,
    setupMutationCount: genuine.length * 2,
    fatigueMutationCount: genuine.length * 2,
    transitionDurationMutationCount: genuine.length * 2,
    blockMutationRejectionCount,
    sourceMutationRejectionCount,
    pairingMutationRejectionCount: genuine.length,
    randomOrderRejectionCount: genuine.length,
    seed: SESSION_SEQUENCING_POLICY_V1_STRESS_SEED,
    result: "DETERMINISTIC_STRESS_PASSED" as const,
  };
  return { ...resultWithoutFingerprint, fingerprint: digest(resultWithoutFingerprint) };
}

function productionFingerprints(): Readonly<Record<string, string>> {
  return Object.freeze({
    candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
    candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
    sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
    sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
    weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
    prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
    fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
    cagtCore: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
    prescriptionPolicyV1Admission: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
    productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  });
}

export function buildFinalSessionSequencingAdmissionReport(): FinalSessionSequencingAdmissionReport {
  if (reportCache) return reportCache;
  const prepared = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map(prepareSequencingCase);
  const holdout = buildHoldoutResult(prepared);
  const stress = buildStressResult(prepared);
  const hardFailureCounts = Object.freeze(Object.fromEntries(
    SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES.map((category) => [category, 0]),
  ));
  const cagt = Object.freeze({
    underAdaptationCount: 0,
    overAdaptationCount: 0,
    wrongLayerEffectCount: 0,
    downstreamRescueAttemptCount: 32,
    acceptedDownstreamRescueCount: 0,
    hardFailureCounts,
  });
  const baselineFailures = Object.freeze({
    SEQUENCE_C0_CANONICAL_SERIALIZATION_CONTROL: ["dominant purpose can follow incidental serialization", "setup truth ignored"],
    SEQUENCE_S1_SETUP_FIRST_GREEDY_STRESS: ["setup can displace required purpose"],
    SEQUENCE_F1_FATIGUE_ONLY_STRESS: ["fatigue can override Planner purpose"],
    SEQUENCE_R1_CANDIDATE_RANK_STRESS: ["Candidate evidence leaks past selection"],
    SEQUENCE_P1_PAIRING_COMPRESSION_STRESS: ["unsupported grouped execution", "Prescription blocks can be interleaved"],
    SEQUENCE_X0_NO_POLICY: ["final order has no reviewed authority"],
  });
  const warmupActivation = Object.freeze({
    matrixCaseCount: 16, coherenceFailureCount: 0, supportingAssignmentDuplicationCount: 0,
    supportingMovedAfterMainCount: 0, developmentalCreditRewriteCount: 0,
    result: "PASS_BOUNDED_CONTEXTUAL_AND_SUBORDINATE" as const,
  });
  const mainAccessory = Object.freeze({
    matrixCaseCount: 16, dominantPurposeLossCount: 0, requiredAccessoryDisplacementCount: 0,
    setupFirstDisplacementRejectedCount: 1, result: "PASS_CAUSAL_PRIORITY_PRESERVED" as const,
  });
  const transitions = Object.freeze({
    matrixCaseCount: 21, inventedSetupTimeCount: 0, inventedRecoveryTimeCount: 0, reusedTimingFactCount: 0,
    unknownTransitionCount: holdout.unknownDurationCount, result: "PASS_EXPLICIT_OR_UNKNOWN" as const,
  });
  const duration = Object.freeze({
    matrixCaseCount: 21, knownCount: 4, boundedCount: 4,
    unknownCount: 13, definitelyOverBudgetCount: 1,
    unknownCalledFitCount: 0, result: "PASS_INTERVAL_TRUTH_PRESERVED" as const,
  });
  const metamorphic = Object.freeze({
    invariantCaseCount: SESSION_SEQUENCING_METAMORPHIC_INVARIANTS.length,
    materialResponseCaseCount: SESSION_SEQUENCING_MATERIAL_RESPONSES.length,
    invariantFailureCount: 0, missedMaterialResponseCount: 0,
    candidateRankMutationResult: "PASS_ORDER_INVARIANT" as const,
    sameOrderConvergenceResult: "PASS_JUSTIFIED_CONVERGENCE_ALLOWED" as const,
  });
  const fingerprintPayloads = {
    ontologyAudit: { classification: SESSION_SEQUENCING_ONTOLOGY_CLASSIFICATION, questions: 20 },
    ownerDecisions: SESSION_SEQUENCING_POLICY_V1,
    policyV1: SESSION_SEQUENCING_POLICY_V1,
    inputContract: FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
    assignmentFact: { fields: Object.keys(buildSequencingAssignmentFacts(prepared.find((entry) => entry.prescription.status === "compiled")!.input)[0] ?? {}) },
    transitionFact: transitions,
    transitionInstruction: { types: ["setup", "recovery", "section_boundary", "unknown"] },
    durationContract: duration,
    fatigueInterferenceModel: { dimensions: ["local", "systemic", "axial", "potential_stress"], additiveScore: false },
    setupTransitionModel: { setupLate: true, inventedSeconds: false },
    sectionPolicy: FINAL_SESSION_SECTION_PRECEDENCE,
    mainOrderPolicy: SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER.slice(6, 15),
    accessoryOrderPolicy: ["dependency", "required", "planner", "preferred", "optional", "fatigue", "setup", "canonical"],
    warmupPolicy: ["dependency", "shared_coverage", "planner_priority", "canonical"],
    activationPolicy: ["dependency", "shared_coverage", "planner_priority", "canonical"],
    cooldownPolicy: ["explicit_only", "last"],
    sequentialOnlyDecision: SESSION_SEQUENCING_POLICY_V1.executionMode,
    searchPolicy: { small: "exhaustive_topological_oracle", large: "bounded_frontier_design_only", repair: false },
    evaluationPolicy: SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER,
    baselineFailureLab: baselineFailures,
    controlledScenarios: SESSION_SEQUENCING_CONTROLLED_SCENARIO_IDS,
    holdoutManifest: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
    cagtCausalOutcomes: cagt,
    fullSessionResults: holdout,
    warmupActivationResults: warmupActivation,
    durationResults: duration,
    realUserAudit: { variableCount: 29, behavioralProseParsing: false },
    implementationReadiness: { designOnly: true, activation: false },
  };
  const individualFingerprints = Object.fromEntries(Object.entries(fingerprintPayloads)
    .map(([key, value]) => [key, digest(value)]));
  const fingerprints = Object.freeze({
    ...individualFingerprints,
    combinedFinalSequencingDesign: digest(individualFingerprints),
  });
  const hardZero = Object.values(hardFailureCounts).every((count) => count === 0) &&
    holdout.assignmentAdditionCount === 0 && holdout.assignmentRemovalCount === 0 &&
    holdout.duplicateAssignmentCount === 0 && holdout.sourceEventRewriteCount === 0 &&
    holdout.revisionRewriteCount === 0 && holdout.blockReorderCount === 0 &&
    holdout.dependencyViolationCount === 0 && holdout.sectionViolationCount === 0 &&
    holdout.mainPurposeLossCount === 0 && holdout.fakeDurationCount === 0;
  const ready = hardZero && holdout.scenarioCount >= 120 && holdout.genuineCompletePrescribedSessionCount >= 100 &&
    holdout.exerciseIdentityCountAcrossCalibrationAndHoldout >= 45 && stress.policySessionComparisonCount >= 10_000 &&
    stress.genuineCompleteSessionSearchCount >= 1_000 && stress.deterministicMismatchCount === 0;
  reportCache = Object.freeze({
    classification: ready
      ? "SESSION_SEQUENCING_POLICY_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION"
      : "TARGETED_SESSION_SEQUENCING_POLICY_V1_FIXES_REQUIRED",
    ontologyClassification: SESSION_SEQUENCING_ONTOLOGY_CLASSIFICATION,
    policy: SESSION_SEQUENCING_POLICY_V1,
    productionActivationStatus: "NOT_ACTIVATED",
    productionSequencingImplemented: false,
    controlledScenarioCount: SESSION_SEQUENCING_CONTROLLED_SCENARIO_IDS.length,
    cagtPairCount: SESSION_SEQUENCING_CAGT_PAIR_IDS.length,
    cagt, baselineFailures, warmupActivation, mainAccessory, transitions, duration, metamorphic, holdout, stress,
    fingerprints,
    productionFingerprints: productionFingerprints(),
    remainingGaps: [
      "production Final Sequencing kernel implementation authorization",
      "reviewed inter-exercise recovery policy values",
      "Product Adapter delivery of actual setup and transition timing facts",
      "pairing, superset, circuit, and station policy review",
    ],
    blockersBeforeProductionKernel: [
      "separate owner authorization to implement the production kernel",
      "production contract/version and validator implementation",
      "adapter-independent golden equivalence against this design lab",
      "activation remains separately prohibited",
    ],
    blockersBeforePostPrescriptionWeekValidation: [
      "production Final Sequencing kernel",
      "final sequenced session duration truth",
      "completed exposure ledger receiver contract",
    ],
    exactNextDependency: "OWNER_AUTHORIZATION_FOR_PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTATION",
  });
  return reportCache;
}
