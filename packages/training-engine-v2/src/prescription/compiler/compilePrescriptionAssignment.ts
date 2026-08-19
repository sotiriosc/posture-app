import {
  evaluateEquipmentRequirement,
  type EquipmentRequirementTrace,
} from "../../domain/equipment";
import type { ExerciseDefinition } from "../../domain/exercise";
import type { ExercisePrescriptionKnowledgeProfile } from "../../domain/exercisePrescriptionKnowledge";
import type { SessionExerciseAssignment, SessionPrescriptionAssignmentHandoff } from "../../sessionComposer/contracts";
import type { ExerciseDose, ExerciseDoseMode, NumericTarget } from "../dose";
import type {
  BreathingCadencePrescription,
  EffortTarget,
  LeverPrescription,
  LocomotorCadencePrescription,
  RangePrescription,
  SupportPrescription,
  TempoPrescription,
} from "../executionStandard";
import type { LoadTarget } from "../load";
import type { PrescriptionPolicyRuleVariant, PrescriptionPolicyUseCase,
  ProductionPrescriptionPolicy, RejectedPrescriptionPolicyRuleTrace,
  ResolvedPrescriptionPolicyRuleTrace } from "../policies";
import type { PrescriptionPolicyUseCaseV2, ProductionPrescriptionPolicyRuleV2,
  ProductionPrescriptionPolicyV2 } from "../policiesV2";
import type { PrescriptionLaterality, PrescriptionSideBehavior } from "../types";
import { buildPrescriptionCompatibilityProjection } from "./compatibilityProjection";
import {
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResult,
  type PrescriptionAssignmentCompilerInput,
  type PrescriptionCompilationContextFacts,
  type PrescriptionEquipmentRealization,
  type PrescriptionExecutionRequirement,
  type OperationalDurationComponent,
  type PrescriptionOperationalExecutionTimingClass,
  type PrescriptionRestInstruction,
  type ProductionExercisePrescriptionPlan,
  type ProductionPrescriptionDecisionTrace,
  type ProductionPrescriptionDoseBlock,
  type PrescriptionDurationUnknownComponent,
  type ResolvedPrescriptionRequirementSet,
} from "./contracts";
import { buildPrescriptionDurationInterval } from "./durationInterval";
import {
  buildPrescriptionExecutionStandard,
  resolvePrescriptionTempo,
} from "./executionResolution";
import { resolvePrescriptionLoad } from "./loadResolution";
import { resolvePrescriptionPolicy } from "./policyResolution";
import { resolvePrescriptionRequirements } from "./requirementResolution";
import { buildPrescriptionRevisionLedger } from "./revisions";
import {
  buildPrescriptionId,
  buildSourceExposureEvent,
} from "./sourceExposure";
import {
  numericBounds,
  productionProvenance,
  sameSemanticValue,
  stableId,
  uniqueSorted,
} from "./utilities";

interface AssignmentContext {
  readonly assignment: SessionExerciseAssignment;
  readonly handoffAssignment: SessionPrescriptionAssignmentHandoff;
  readonly exercise: ExerciseDefinition;
  readonly knowledge: ExercisePrescriptionKnowledgeProfile;
}

interface ModifierValues {
  readonly range: RangePrescription;
  readonly support: SupportPrescription | null;
  readonly lever: LeverPrescription | null;
  readonly laterality: PrescriptionLaterality | null;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly effort: EffortTarget | null;
  readonly tempo: TempoPrescription | null;
  readonly cadence: LocomotorCadencePrescription | BreathingCadencePrescription | null;
  readonly load: LoadTarget | null;
}

export function compilePrescriptionAssignment(
  input: PrescriptionAssignmentCompilerInput,
): PrescriptionAssignmentCompilationResult {
  return compilePrescriptionAssignmentWithResolvedUseCase(input, null);
}

export interface ResolvedUseCaseCompilerOptions {
  readonly policyOverride?: ProductionPrescriptionPolicyV2;
  readonly variantOverride?: PrescriptionPolicyRuleVariant;
  readonly blockPurposeOverride?: readonly ProductionPrescriptionDoseBlock["purpose"][];
  readonly policyTrace?: readonly string[];
}

/** Internal shared numeric compiler core. A non-null use case bypasses the V1.0 compatibility resolver. */
export function compilePrescriptionAssignmentWithResolvedUseCase(
  input: PrescriptionAssignmentCompilerInput,
  resolvedUseCase: PrescriptionPolicyUseCaseV2 | null,
  options: ResolvedUseCaseCompilerOptions = {},
): PrescriptionAssignmentCompilationResult {
  const contextResult = resolveAssignmentContext(input);
  if (!contextResult.context) {
    return resultWithoutPlan(input, {
      status: "invalid_source_exposure_context",
      assignment: contextResult.assignment,
      handoffAssignment: contextResult.handoffAssignment,
      sourceExposureEvent: null,
      equipmentRealization: null,
      reasonCodes: contextResult.reasonCodes,
    });
  }
  const context = contextResult.context;
  const sourceEvent = buildSourceExposureEvent({
    sessionIntentId: input.sessionIntent.id,
    assignment: context.handoffAssignment,
    executionAttemptId: input.executionAttemptId,
  });

  if (!input.trainingReadiness.downstreamTrainingAllowed) {
    return resultWithoutPlan(input, {
      status: "blocked_by_training_readiness",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: ["TRAINING_READINESS_BLOCKS_EXECUTION"],
    });
  }

  const policyResolution = options.policyOverride ? {
    status: "resolved" as const,
    policy: options.policyOverride,
    trace: options.policyTrace ?? Object.freeze([
      `PRESCRIPTION_POLICY_RESOLVED:${options.policyOverride.policyId}@${options.policyOverride.version}`,
    ]),
  } : resolvePrescriptionPolicy({ policy: input.policy, availablePolicies: input.availablePolicies });
  if (!policyResolution.policy) {
    const unresolvedPolicyStatus = policyResolution.status === "resolved"
      ? "prescription_policy_unavailable" as const
      : policyResolution.status;
    return resultWithoutPlan(input, {
      status: unresolvedPolicyStatus,
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: policyResolution.trace,
      policyTrace: policyResolution.trace,
    });
  }
  const policy = policyResolution.policy;

  if (
    input.sessionSkeleton.executionReadiness === "candidate_review_required" ||
    input.sessionSkeleton.executionReadiness === "candidate_review_and_prescription_required" ||
    context.assignment.unresolvedCandidateReviewIds.length > 0
  ) {
    return resultWithoutPlan(input, {
      status: "candidate_recomposition_required",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: [
        "CANDIDATE_REVIEW_REMAINS_UPSTREAM",
        ...context.assignment.unresolvedCandidateReviewIds,
      ],
      policyTrace: policyResolution.trace,
    });
  }

  const requirements = resolvePrescriptionRequirements({
    assignment: context.handoffAssignment,
    requirements: input.executionRequirements,
  });
  if (requirements.status === "conflicting") {
    return resultWithoutPlan(input, {
      status: "contradictory_prescription_requirements",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: requirements.reasonCodes,
      requirements,
      policyTrace: policyResolution.trace,
    });
  }
  if (requirements.status === "unresolved") {
    return resultWithoutPlan(input, {
      status: "unresolved_execution_requirement",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: requirements.reasonCodes,
      requirements,
      policyTrace: policyResolution.trace,
    });
  }
  if (requirements.applicable.some((entry) => entry.requestedAction === "prohibit_realization")) {
    return resultWithoutPlan(input, {
      status: "candidate_recomposition_required",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization: null,
      reasonCodes: ["REVIEWED_PROHIBITION_REQUIRES_UPSTREAM_RECOMPOSITION"],
      requirements,
      policyTrace: policyResolution.trace,
    });
  }

  const equipmentRealization = buildEquipmentRealization({
    exercise: context.exercise,
    input,
  });
  if (equipmentRealization.status === "unavailable") {
    const recompositionRequirement = equipmentRecompositionRequirement(
      context.handoffAssignment,
      equipmentRealization,
    );
    const blocked = resultWithoutPlan(input, {
      status: "current_equipment_realization_unavailable",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization,
      reasonCodes: [
        "CURRENT_EQUIPMENT_REALIZATION_UNAVAILABLE",
        ...equipmentRealization.missingCapabilityIds,
      ],
      requirements,
      policyTrace: policyResolution.trace,
    });
    return { ...blocked, recompositionRequirement };
  }

  const selectedMode = resolveDoseMode(context.knowledge, requirements);
  if (!selectedMode) {
    return resultWithoutPlan(input, {
      status: "unsupported_dose_mode",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization,
      reasonCodes: ["UNSUPPORTED_DOSE_MODE"],
      requirements,
      policyTrace: policyResolution.trace,
    });
  }
  const useCase = resolvedUseCase ?? resolveUseCase(input, context, selectedMode);
  const variant = options.variantOverride ?? resolveRuleVariant(input, useCase);
  const selectedRule = findInternalPrescriptionPolicyDoseRule({
    policy,
    useCase,
    doseMode: selectedMode,
    variant,
  });
  if (!selectedRule) {
    return resultWithoutPlan(input, {
      status: "unsupported_dose_mode",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization,
      reasonCodes: [`NO_POLICY_RULE_FOR:${useCase}:${selectedMode}:${variant}`],
      requirements,
      policyTrace: policyResolution.trace,
    });
  }

  const modifiers = resolveModifierValues(requirements);
  const prescriptionId = buildPrescriptionId(sourceEvent.sourceExposureEventId);
  const ledgerResult = buildPrescriptionRevisionLedger({
    prescriptionId,
    sourceExposureEventId: sourceEvent.sourceExposureEventId,
    executionAttemptId: input.executionAttemptId,
    evaluationTime: input.evaluationTime,
    policyRef: { policyId: policy.policyId, version: policy.version },
    unresolvedRequirementRefs: [],
    revisionContext: input.revisionContext,
  });
  if (!ledgerResult.ledger) {
    return resultWithoutPlan(input, {
      status: "invalid_revision_context",
      ...context,
      sourceExposureEvent: sourceEvent,
      equipmentRealization,
      reasonCodes: ledgerResult.reasonCodes,
      requirements,
      policyTrace: policyResolution.trace,
    });
  }
  const ledger = ledgerResult.ledger;
  const revisionId = ledger.finalRevisionId;
  const eventWithRevisions = {
    ...sourceEvent,
    prescriptionRevisionRefs: ledger.revisions.map((revision) => ({
      prescriptionId,
      prescriptionRevisionId: revision.prescriptionRevisionId,
    })),
  };
  const blockPurposes = options.blockPurposeOverride ??
    resolveBlockPurposes(input.context, useCase, selectedMode);
  const blockRules = blockPurposes.map((purpose) =>
    purpose === "preparatory_acclimation"
      ? findInternalPrescriptionPolicyDoseRule({
        policy,
        useCase: "preparation",
        doseMode: "repetition_sets",
        variant: "default",
      }) ?? selectedRule
      : selectedRule
  );
  const blocksWithoutCrossRest = blockPurposes.map((purpose, index) =>
    buildBlock({
      input,
      context,
      requirements,
      sourceExposureEventId: sourceEvent.sourceExposureEventId,
      revisionId,
      purpose,
      index,
      priorPurpose: blockPurposes[index - 1] ?? null,
      rule: blockRules[index],
      selectedMode: purpose === "preparatory_acclimation" ? "repetition_sets" : selectedMode,
      modifiers,
      equipmentRealization,
    })
  );
  const invalidPrior = blocksWithoutCrossRest.some((entry) => entry.invalidPriorEvidence);
  if (invalidPrior) {
    return resultWithoutPlan(input, {
      status: "invalid_prior_realization_evidence",
      ...context,
      sourceExposureEvent: eventWithRevisions,
      equipmentRealization,
      reasonCodes: uniqueSorted(blocksWithoutCrossRest.flatMap((entry) =>
        entry.loadTrace.exactPriorRejectionReasonCodes
      )),
      requirements,
      policyTrace: policyResolution.trace,
    });
  }
  const baseBlocks = blocksWithoutCrossRest.map((entry) => entry.block);
  const crossBlockRest = buildCrossBlockRestInstructions(baseBlocks);
  const allRestInstructions = deduplicateRestInstructions([
    ...baseBlocks.flatMap((block) => block.restInstructions),
    ...crossBlockRest,
  ]);
  const blocks = baseBlocks.map((block) => ({
    ...block,
    restInstructions: allRestInstructions.filter((instruction) =>
      instruction.appliesWithinBlockId === block.blockId ||
      instruction.appliesAfterBlockId === block.blockId
    ),
  }));
  const interval = combineBlockDurationIntervals({
    blocks,
    assignment: context.assignment,
    availableSeconds: input.sessionIntent.availableMinutes * 60,
    operationalPolicy: input.operationalDurationPolicy ?? null,
  });
  const compatibilityProjection = buildPrescriptionCompatibilityProjection({
    blocks,
    restInstructions: allRestInstructions,
    unresolvedRequirementRefs: [],
  });
  const selectedRules = selectedRuleTraces(policy, uniqueRules(blockRules), input, context, selectedMode);
  const plan: ProductionExercisePrescriptionPlan = {
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEvent: eventWithRevisions,
    exerciseId: context.exercise.id,
    phaseId: context.handoffAssignment.phaseId as ProductionExercisePrescriptionPlan["phaseId"],
    doseBlocks: blocks,
    restInstructions: allRestInstructions,
    compatibilityProjection,
    selectedPolicyRuleRefs: selectedRules.map((trace) => trace.ruleId),
    requirementRefs: requirements.applicable.map((entry) => entry.requirementId).sort(),
    unresolvedRequirementRefs: [],
    durationInterval: interval,
    executionStandardsByBlockId: Object.fromEntries(
      blocks.map((block) => [block.blockId, block.executionStandard]),
    ),
    revisionLedger: ledger,
    rationaleReasonCodes: [
      "UPSTREAM_ASSIGNMENT_PRESERVED",
      "ONE_ASSIGNMENT_ONE_SOURCE_EVENT",
      "ORDERED_BLOCKS_ARE_CANONICAL",
      "NO_AUTOMATIC_PROGRESSION",
      "FINAL_DURATION_REQUIRES_SEQUENCING",
    ],
    provenance: productionProvenance(`prescription-compiler:plan:${revisionId}`),
  };
  const rejectedRules = rejectedRuleTraces(policy, uniqueRules(blockRules), useCase, selectedMode, variant);
  const loadTrace = blocksWithoutCrossRest.find((entry) =>
    entry.block.purpose === "developmental_work"
  )?.loadTrace ?? blocksWithoutCrossRest[0].loadTrace;
  return {
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
    status: "compiled",
    assignment: context.assignment,
    handoffAssignment: context.handoffAssignment,
    sourceExposureEvent: eventWithRevisions,
    equipmentRealization,
    plan,
    revisionLedger: ledger,
    recompositionRequirement: null,
    decisionTrace: {
      trainingReadinessTrace: input.trainingReadiness,
      policyResolutionTrace: policyResolution.trace,
      selectedRules,
      rejectedRules,
      overriddenRules: selectedRules.flatMap((trace) => trace.overriddenRuleIds),
      conflictTrace: [],
      legalModeTrace: [
        `SELECTED_MODE:${selectedMode}`,
        ...legalModes(context.knowledge).map((mode) => `LEGAL_MODE:${mode}`),
      ],
      blockStructureTrace: blocks.map((block) =>
        `${block.order.index}:${block.purpose}:${block.dose.mode}`
      ),
      loadTrace,
      effortTrace: blocks.map((block) =>
        `${block.blockId}:${block.dose.effort?.kind ?? "unknown"}`
      ),
      modifierTrace: requirements.applicable.map((entry) =>
        `${entry.targetDimension}:${entry.requirementId}`
      ),
      timingTrace: blocks.map((block) => `${block.blockId}:${tempoKind(block.dose)}`),
      restPlacementTrace: allRestInstructions.map((entry) =>
        `${entry.restInstructionId}:${entry.placement}`
      ),
      durationTrace: [interval.status, ...interval.unknownComponents],
      continuityTrace: continuityTrace(input),
      unresolvedRequirementIds: [],
      finalReasonCodes: ["PRESCRIPTION_COMPILED"],
    },
    authority: "PRODUCTION_KERNEL_AUTHORITY",
  };
}

function resolveAssignmentContext(input: PrescriptionAssignmentCompilerInput): {
  readonly context: AssignmentContext | null;
  readonly assignment: SessionExerciseAssignment | null;
  readonly handoffAssignment: SessionPrescriptionAssignmentHandoff | null;
  readonly reasonCodes: readonly string[];
} {
  const handoffAssignment = input.handoff.assignments.find((entry) =>
    entry.handoffId === input.assignmentHandoffId
  ) ?? null;
  const assignment = input.sessionSkeleton.assignments.find((entry) =>
    entry.routinePrescriptionHandoffId === input.assignmentHandoffId
  ) ?? null;
  const reasons: string[] = [];
  if (input.sessionIntent.id !== input.sessionSkeleton.sessionIntentId) reasons.push("INTENT_SKELETON_ID_MISMATCH");
  if (input.sessionIntent.id !== input.handoff.sessionIntentId) reasons.push("INTENT_HANDOFF_ID_MISMATCH");
  if (!handoffAssignment) reasons.push("HANDOFF_ASSIGNMENT_NOT_FOUND");
  if (!assignment) reasons.push("SKELETON_ASSIGNMENT_NOT_FOUND");
  if (!handoffAssignment || !assignment) {
    return { context: null, assignment, handoffAssignment, reasonCodes: reasons };
  }
  if (assignment.exerciseId !== handoffAssignment.exerciseId) reasons.push("ASSIGNMENT_EXERCISE_ID_MISMATCH");
  if (assignment.section !== handoffAssignment.section) reasons.push("ASSIGNMENT_SECTION_MISMATCH");
  if (assignment.role !== handoffAssignment.role) reasons.push("ASSIGNMENT_ROLE_MISMATCH");
  if (!sameSemanticValue([...assignment.satisfiedNeedIds].sort(), [...handoffAssignment.satisfiedNeedIds].sort())) reasons.push("ASSIGNMENT_SATISFIED_NEEDS_MISMATCH");
  if (handoffAssignment.phaseId !== input.sessionIntent.phaseIntent.id) reasons.push("ASSIGNMENT_PHASE_MISMATCH");
  if (handoffAssignment.sourceExposureEventExpected !== true) reasons.push("SOURCE_EXPOSURE_NOT_EXPECTED");
  const exercise = input.exerciseRegistry.find((entry) => entry.id === handoffAssignment.exerciseId) ?? null;
  const knowledge = input.exerciseKnowledgeRegistry.find((entry) =>
    entry.exerciseId === handoffAssignment.exerciseId
  ) ?? null;
  if (!exercise) reasons.push("CANONICAL_EXERCISE_NOT_FOUND");
  if (!knowledge) reasons.push("EXERCISE_KNOWLEDGE_NOT_FOUND");
  if (exercise && knowledge && (
    exercise.prescriptionKnowledge.profileId !== knowledge.profileId ||
    exercise.prescriptionKnowledge.primaryDoseMode !== knowledge.primaryDoseMode ||
    !sameSemanticValue(
      [...exercise.prescriptionKnowledge.legalAlternateDoseModes].sort(),
      [...knowledge.legalAlternateDoseModes].sort(),
    )
  )) reasons.push("EXERCISE_KNOWLEDGE_REGISTRY_MISMATCH");
  if (knowledge && !sameSemanticValue(
    [...handoffAssignment.timingKnowledge.legalDoseModes].sort(),
    [...legalModes(knowledge)].sort(),
  )) reasons.push("HANDOFF_KNOWLEDGE_LEGAL_MODE_MISMATCH");
  return reasons.length > 0 || !exercise || !knowledge
    ? { context: null, assignment, handoffAssignment, reasonCodes: uniqueSorted(reasons) }
    : {
      context: { assignment, handoffAssignment, exercise, knowledge },
      assignment,
      handoffAssignment,
      reasonCodes: [],
    };
}

function legalModes(knowledge: ExercisePrescriptionKnowledgeProfile): readonly ExerciseDoseMode[] {
  return uniqueSorted([
    knowledge.primaryDoseMode,
    ...knowledge.legalAlternateDoseModes,
  ]) as readonly ExerciseDoseMode[];
}

function resolveDoseMode(
  knowledge: ExercisePrescriptionKnowledgeProfile,
  requirements: ResolvedPrescriptionRequirementSet,
): ExerciseDoseMode | null {
  const requested = requirements.values.dose_mode;
  const mode = requested?.kind === "dose_mode" ? requested.value : knowledge.primaryDoseMode;
  const annotation = knowledge.doseModeAnnotations.find((entry) => entry.mode === mode);
  return legalModes(knowledge).includes(mode) &&
    annotation?.reviewStatus === "accepted" &&
    annotation.status !== "unknown"
    ? mode
    : null;
}

function resolveUseCase(
  input: PrescriptionAssignmentCompilerInput,
  context: AssignmentContext,
  mode: ExerciseDoseMode,
): PrescriptionPolicyUseCase {
  const section = context.handoffAssignment.section;
  const role = context.handoffAssignment.role;
  if ((section === "warmup" || role === "preparation") && mode === "step_march") return "supporting_stationary_march";
  if (section === "warmup" || role === "preparation") return "preparation";
  if ((section === "activation" || role === "activation") && mode === "step_march") return "supporting_stationary_march";
  if (section === "activation" || role === "activation") return "activation";
  if (section === "cooldown" || role === "recovery") return "recovery_cooldown";
  if (mode === "timed_hold") return "timed_hold";
  if (mode === "breath_cycles") return "breath_cycles";
  if (mode === "distance_carry" || mode === "timed_carry") {
    return input.context.carryPurpose === "capacity_main" ? "capacity_carry" : "accessory_carry";
  }
  if (mode === "step_march") return "developmental_stationary_march";
  if (mode === "step_sets") return "developmental_counted_steps";
  if (role === "secondary_strength") return "secondary_strength";
  if (section === "main") {
    const goal = input.sessionIntent.outcomeGoal ?? input.sessionIntent.primaryGoal;
    return goal === "hypertrophy" ? "main_hypertrophy" : "main_strength";
  }
  if (role === "hypertrophy_accessory" && !input.context.directObjectiveConfirmedUpstream) {
    return "hypertrophy_accessory";
  }
  return "direct_accessory";
}

function supportingEscalation(context: PrescriptionCompilationContextFacts): boolean {
  return context.requiredPreparationDependency ||
    context.familiarity === "unfamiliar" ||
    context.newEquipmentRealization ||
    context.reviewedRangeOrControlDependency ||
    context.sharedPreparationDependency ||
    context.successfulBoundedPriorPreparation;
}

function activationEscalation(context: PrescriptionCompilationContextFacts): boolean {
  return context.requiredActivationDependency &&
    context.explicitControlRequirement &&
    context.lowFatigueActivationSuitable &&
    !context.adverseActivationFatigueResponse &&
    context.mainWorkPreserved;
}

function regression(context: PrescriptionCompilationContextFacts): boolean {
  return context.familiarity === "unfamiliar" ||
    context.returnAfterAbsence ||
    context.painAwareLoadToleranceRegressionPermitted ||
    !context.reliablePriorPerformance ||
    context.reviewedRegression ||
    context.adverseResponseSupportsReducedDose;
}

function resolveRuleVariant(
  input: PrescriptionAssignmentCompilerInput,
  useCase: PrescriptionPolicyUseCaseV2,
): PrescriptionPolicyRuleVariant {
  const context = input.context;
  switch (useCase) {
    case "preparation":
      return supportingEscalation(context) ? "scoped_override" : "default";
    case "activation":
      return activationEscalation(context) ? "scoped_override" : "default";
    case "supporting_stationary_march": {
      const base = context.stationaryMarchRealization === "count" ? "count_realization" : "duration_realization";
      return supportingEscalation(context) || activationEscalation(context)
        ? `${base}_scoped_override` as PrescriptionPolicyRuleVariant
        : base;
    }
    case "main_strength":
    case "main_hypertrophy":
      return regression(context) ||
        input.athlete.experience === "novice" ||
        input.athlete.experience === "beginner" ||
        input.sessionIntent.structuralCapacity === "condensed"
        ? "regression"
        : "standard";
    case "secondary_strength":
      return context.secondaryObjectiveRequired &&
        context.secondaryWeeklyPriority &&
        context.secondaryCapacitySupported &&
        !context.secondaryHigherPriorityConflict &&
        context.secondaryNonRedundantUpstream
        ? "scoped_override"
        : "default";
    case "hypertrophy_accessory":
    case "direct_accessory":
      return context.accessoryPriority === "required" &&
        context.accessoryUniquePurposeActive &&
        context.accessoryCoherencePreserved &&
        !context.overlappingExposureRepresented &&
        !context.firstExposure &&
        !context.insufficientResponseHistory
        ? "required"
        : "preferred_optional";
    case "breath_cycles":
      return (
        context.requiredPreparationDependency ||
        context.allocatedRecoveryResponsibility ||
        context.successfulBreathResponse
      ) && context.sessionCapacityPreservesMainWork
        ? "scoped_override"
        : "default";
    case "developmental_stationary_march":
      return context.stationaryMarchRealization === "count"
        ? "count_realization"
        : "duration_realization";
    default:
      return "default";
  }
}

function resolveBlockPurposes(
  context: PrescriptionCompilationContextFacts,
  useCase: PrescriptionPolicyUseCaseV2,
  mode: ExerciseDoseMode,
): readonly ProductionPrescriptionDoseBlock["purpose"][] {
  if (useCase === "recovery_cooldown") return ["recovery_or_downregulation"];
  if (
    useCase === "preparation" ||
    useCase === "activation" ||
    useCase === "supporting_stationary_march" ||
    useCase === "supporting_counted_steps" ||
    useCase === "breath_cycles"
  ) return ["technique_quality_work"];
  const loadedMain = mode === "repetition_sets" && [
    "main_strength",
    "secondary_strength",
    "main_hypertrophy",
  ].includes(useCase);
  if (!loadedMain) return ["developmental_work"];
  const derived = context.reviewedAcclimationBlockCount ?? (
    context.familiarity === "known_productive" &&
    !context.newEquipmentRealization &&
    context.reliablePriorPerformance
      ? 0
      : 1
  );
  const count = Math.max(0, Math.min(2, derived));
  return [
    ...Array.from({ length: count }, () => "preparatory_acclimation" as const),
    "developmental_work",
  ];
}

function resolveModifierValues(
  requirements: ResolvedPrescriptionRequirementSet,
): ModifierValues {
  const rangeResolution = requirements.values.range;
  const supportResolution = requirements.values.support;
  const leverResolution = requirements.values.lever;
  const lateralityResolution = requirements.values.laterality;
  const sideResolution = requirements.values.side;
  const effortResolution = requirements.values.effort;
  const tempoResolution = requirements.values.tempo;
  const cadenceResolution = requirements.values.cadence;
  const loadResolution = requirements.values.load;
  const laterality = lateralityResolution?.kind === "laterality"
    ? lateralityResolution.value
    : sideResolution?.kind === "side"
      ? sideResolution.value === "left" || sideResolution.value === "right"
        ? { kind: "single_side" as const, side: sideResolution.value }
        : sideResolution.value === "bilateral"
          ? { kind: "bilateral" as const }
          : null
      : null;
  return {
    range: rangeResolution?.kind === "range"
      ? rangeResolution.value
      : { kind: "full_available" },
    support: supportResolution?.kind === "support" ? supportResolution.value : null,
    lever: leverResolution?.kind === "lever" ? leverResolution.value : null,
    laterality,
    sideBehavior: laterality
      ? { movementSide: laterality, sideRelationship: "independent" }
      : null,
    effort: effortResolution?.kind === "effort" ? effortResolution.value : null,
    tempo: tempoResolution?.kind === "tempo" ? tempoResolution.value : null,
    cadence: cadenceResolution?.kind === "cadence" ? cadenceResolution.value : null,
    load: loadResolution?.kind === "load" ? loadResolution.value : null,
  };
}

function buildEquipmentRealization(input: {
  readonly exercise: ExerciseDefinition;
  readonly input: PrescriptionAssignmentCompilerInput;
}): PrescriptionEquipmentRealization {
  const results = input.exercise.equipmentRequirements.map((requirement) =>
    evaluateEquipmentRequirement(input.input.currentEquipment, requirement)
  );
  const traces: readonly EquipmentRequirementTrace[] = results.map((entry) => entry.trace);
  const missingCapabilityIds = uniqueSorted(results.flatMap((entry) => entry.missingCapabilities));
  return {
    realizationId: stableId("equipment-realization", {
      exerciseId: input.exercise.id,
      equipment: input.input.currentEquipment,
      requirements: input.exercise.equipmentRequirements.map((entry) => entry.id).sort(),
    }),
    status: results.every((entry) => entry.satisfied) ? "available" : "unavailable",
    equipment: input.input.currentEquipment,
    requirementTraces: traces,
    missingCapabilityIds,
    evaluatedAt: input.input.evaluationTime,
  };
}

function equipmentRecompositionRequirement(
  assignment: SessionPrescriptionAssignmentHandoff,
  equipment: PrescriptionEquipmentRealization,
): PrescriptionExecutionRequirement {
  return {
    requirementId: `equipment-recomposition:${assignment.handoffId}`,
    targetAssignmentHandoffId: assignment.handoffId,
    sourceOwner: "equipment",
    sourceRef: equipment.realizationId,
    targetDimension: "unresolved_other",
    requestedAction: "review_required",
    side: null,
    reviewStatus: "needs_review",
    provenance: productionProvenance(`prescription-compiler:equipment-gap:${assignment.handoffId}`),
    resolutionState: "unresolved",
  };
}

function buildBlock(input: {
  readonly input: PrescriptionAssignmentCompilerInput;
  readonly context: AssignmentContext;
  readonly requirements: ResolvedPrescriptionRequirementSet;
  readonly sourceExposureEventId: string;
  readonly revisionId: string;
  readonly purpose: ProductionPrescriptionDoseBlock["purpose"];
  readonly index: number;
  readonly priorPurpose: ProductionPrescriptionDoseBlock["purpose"] | null;
  readonly rule: ProductionPrescriptionPolicyRuleV2;
  readonly selectedMode: ExerciseDoseMode;
  readonly modifiers: ModifierValues;
  readonly equipmentRealization: PrescriptionEquipmentRealization;
}): {
  readonly block: ProductionPrescriptionDoseBlock;
  readonly loadTrace: NonNullable<ProductionPrescriptionDecisionTrace["loadTrace"]>;
  readonly invalidPriorEvidence: boolean;
} {
  const blockId = stableId("prescription-block", {
    sourceExposureEventId: input.sourceExposureEventId,
    revisionId: input.revisionId,
    index: input.index,
    purpose: input.purpose,
  });
  const supportingWork = input.purpose !== "developmental_work";
  const effort = input.modifiers.effort ?? input.rule.value.effort;
  const tempo = resolvePrescriptionTempo({
    mode: input.selectedMode,
    supportingWork,
    context: input.input.context,
    reviewedTempo: input.modifiers.tempo,
    hasConflictingPainRequirement: false,
  });
  const doseWithoutLoad = doseFromRule({
    mode: input.selectedMode,
    rule: input.rule,
    effort,
    tempo,
    modifiers: input.modifiers,
    requirements: input.requirements,
  });
  const load = resolvePrescriptionLoad({
    exercise: input.context.exercise,
    mode: input.selectedMode,
    currentDoseWithoutLoad: doseWithoutLoad,
    effort,
    currentEquipmentRealization: input.equipmentRealization,
    sideBehavior: input.modifiers.sideBehavior,
    support: input.modifiers.support,
    range: input.modifiers.range,
    lever: input.modifiers.lever,
    priorEvidence: input.purpose === "developmental_work"
      ? input.input.priorRealizationEvidence
      : null,
    reviewedRequirementLoad: input.modifiers.load,
  });
  const dose = { ...doseWithoutLoad, load: load.trace.selectedLoad } as ExerciseDose;
  const withinRest = buildWithinBlockRestInstruction({
    blockId,
    mode: input.selectedMode,
    count: input.rule.value.count,
    ruleRest: input.rule.value.betweenUnitsRest,
    requirements: input.requirements,
    purpose: input.purpose,
  });
  const executionStandard = buildPrescriptionExecutionStandard({
    exercise: input.context.exercise,
    blockId,
    context: input.input.context,
    requirements: input.requirements.applicable,
    sideBehavior: input.modifiers.sideBehavior,
  });
  return {
    block: {
      blockId,
      sourceExposureEventId: input.sourceExposureEventId,
      purpose: input.purpose,
      dose: withinRest ? { ...dose, rest: withinRest.target } as ExerciseDose : dose,
      executionStandard,
      restInstructions: withinRest ? [withinRest] : [],
      policyRuleRefs: [input.rule.ruleId],
      requirementRefs: input.requirements.applicable.map((entry) => entry.requirementId).sort(),
      unresolvedRequirementRefs: [],
      contributionClassification: contribution(input.purpose),
      order: {
        index: input.index,
        dependsOnBlockIds: input.index === 0
          ? []
          : [stableId("prescription-block", {
            sourceExposureEventId: input.sourceExposureEventId,
            revisionId: input.revisionId,
            index: input.index - 1,
            purpose: input.priorPurpose,
          })],
      },
      provenance: productionProvenance(`prescription-compiler:block:${blockId}`),
    },
    loadTrace: load.trace,
    invalidPriorEvidence: load.invalidEvidence,
  };
}

function doseFromRule(input: {
  readonly mode: ExerciseDoseMode;
  readonly rule: ProductionPrescriptionPolicyRuleV2;
  readonly effort: EffortTarget;
  readonly tempo: TempoPrescription | undefined;
  readonly modifiers: ModifierValues;
  readonly requirements: ResolvedPrescriptionRequirementSet;
}): ExerciseDose {
  const value = input.rule.value;
  const durationRequirement = input.requirements.values.duration;
  const distanceRequirement = input.requirements.values.distance;
  const stepsRequirement = input.requirements.values.steps;
  const duration = durationRequirement?.kind === "duration"
    ? durationRequirement.value
    : value.duration;
  const distance = distanceRequirement?.kind === "distance"
    ? distanceRequirement.value
    : value.distance;
  const steps = stepsRequirement?.kind === "steps" ? stepsRequirement.value : value.steps;
  const base = {
    effort: input.effort,
    range: input.modifiers.range,
    ...(input.modifiers.support ? { support: input.modifiers.support } : {}),
    ...(input.modifiers.lever ? { lever: input.modifiers.lever } : {}),
    ...(input.modifiers.laterality ? { laterality: input.modifiers.laterality } : {}),
    ...(input.modifiers.sideBehavior ? { sideBehavior: input.modifiers.sideBehavior } : {}),
  };
  switch (input.mode) {
    case "repetition_sets":
      return {
        ...base,
        mode: "repetition_sets",
        sets: value.count,
        repetitions: value.repetitions ?? unknownTarget("count", "REPETITION_TARGET_UNAVAILABLE"),
        ...(value.perSide ? { perSide: true } : {}),
        ...(input.tempo ? { tempo: input.tempo } : {}),
      };
    case "timed_hold":
      return {
        ...base,
        mode: "timed_hold",
        sets: value.count,
        duration: duration ?? unknownTarget("seconds", "DURATION_TARGET_UNAVAILABLE"),
      };
    case "breath_cycles":
      return {
        ...base,
        mode: "breath_cycles",
        rounds: value.count,
        breathCycles: value.breathCycles ?? unknownTarget("breath_cycles", "BREATH_TARGET_UNAVAILABLE"),
        breathingCadence: isBreathingCadence(input.modifiers.cadence)
          ? input.modifiers.cadence
          : {
            kind: "not_prescribed",
            reason: "No explicit reviewed breathing cadence authority.",
            provenance: productionProvenance("prescription-compiler:breathing-cadence:not-prescribed"),
          },
      };
    case "distance_carry":
      return {
        ...base,
        mode: "distance_carry",
        trips: value.count,
        distancePerTrip: distance ?? unknownTarget("metres", "DISTANCE_TARGET_UNAVAILABLE"),
        locomotorCadence: isLocomotorCadence(input.modifiers.cadence)
          ? input.modifiers.cadence
          : {
            kind: "not_prescribed",
            reason: "No explicit reviewed locomotor pace authority.",
            provenance: productionProvenance("prescription-compiler:locomotor-cadence:not-prescribed"),
          },
        gaitControlStandard: "exercise-knowledge:preserve-carry-mechanics-intent",
      };
    case "timed_carry":
      return {
        ...base,
        mode: "timed_carry",
        trips: value.count,
        durationPerTrip: duration ?? unknownTarget("seconds", "DURATION_TARGET_UNAVAILABLE"),
        locomotorCadence: isLocomotorCadence(input.modifiers.cadence)
          ? input.modifiers.cadence
          : {
            kind: "not_prescribed",
            reason: "No explicit reviewed locomotor cadence authority.",
            provenance: productionProvenance("prescription-compiler:locomotor-cadence:not-prescribed"),
          },
        gaitControlStandard: "exercise-knowledge:preserve-carry-mechanics-intent",
      };
    case "step_march":
      return {
        ...base,
        mode: "step_march",
        stationary: true,
        sets: value.count,
        ...(duration ? { duration } : {}),
        ...(steps ? { steps } : {}),
        alternation: "alternating",
        ...(isLocomotorCadence(input.modifiers.cadence)
          ? { marchCadence: input.modifiers.cadence }
          : {}),
        marchControlStandard: "exercise-knowledge:preserve-stationary-march-mechanics-intent",
      };
    case "step_sets":
      return {
        ...base,
        mode: "step_sets",
        sets: value.count,
        steps: steps ?? unknownTarget("steps", "STEP_TARGET_UNAVAILABLE"),
        stepCountInterpretation: "exercise-knowledge:canonical-counted-step-interpretation",
        alternation: "alternating",
        ...(isLocomotorCadence(input.modifiers.cadence)
          ? { stepCadence: input.modifiers.cadence }
          : {}),
        ...(input.tempo ? { tempo: input.tempo } : {}),
      };
  }
}

function unknownTarget<Unit extends string>(
  unit: Unit,
  reason: string,
): NumericTarget<Unit> {
  return { kind: "unknown", reason, unit };
}

function isBreathingCadence(
  cadence: ModifierValues["cadence"],
): cadence is BreathingCadencePrescription {
  return cadence?.kind === "structured_breathing_cadence" ||
    cadence?.kind === "not_prescribed" ||
    cadence?.kind === "unknown";
}

function isLocomotorCadence(
  cadence: ModifierValues["cadence"],
): cadence is LocomotorCadencePrescription {
  return cadence?.kind === "locomotor_or_step_cadence" ||
    cadence?.kind === "not_prescribed" ||
    cadence?.kind === "unknown";
}

function buildWithinBlockRestInstruction(input: {
  readonly blockId: string;
  readonly mode: ExerciseDoseMode;
  readonly count: NumericTarget<"count">;
  readonly ruleRest: NumericTarget<"seconds"> | null;
  readonly requirements: ResolvedPrescriptionRequirementSet;
  readonly purpose: ProductionPrescriptionDoseBlock["purpose"];
}): PrescriptionRestInstruction | null {
  const count = numericBounds(input.count);
  const explicit = input.requirements.values.rest;
  const target = explicit?.kind === "rest" ? explicit.value : input.ruleRest;
  if (!target || !count || count[1] <= 1) return null;
  const placement = explicit?.kind === "rest"
    ? explicit.placement
    : input.mode === "breath_cycles"
      ? "between_rounds"
      : input.mode === "distance_carry" || input.mode === "timed_carry"
        ? "between_trips"
        : input.purpose === "developmental_work"
          ? "between_developmental_sets"
          : "between_sets";
  return {
    restInstructionId: stableId("prescription-rest", {
      blockId: input.blockId,
      placement,
      target,
    }),
    placement,
    target,
    appliesWithinBlockId: input.blockId,
    provenance: productionProvenance(`prescription-compiler:rest:${input.blockId}:${placement}`),
  };
}

function buildCrossBlockRestInstructions(
  blocks: readonly ProductionPrescriptionDoseBlock[],
): readonly PrescriptionRestInstruction[] {
  const instructions: PrescriptionRestInstruction[] = [];
  for (let index = 0; index < blocks.length - 1; index += 1) {
    const current = blocks[index];
    const next = blocks[index + 1];
    if (current.purpose === "preparatory_acclimation" && next.purpose === "preparatory_acclimation") {
      instructions.push(crossRest(current.blockId, next.blockId, "between_preparatory_blocks", [15, 45]));
    } else if (current.purpose === "preparatory_acclimation" && next.purpose === "developmental_work") {
      instructions.push(crossRest(current.blockId, next.blockId, "before_developmental_block", [60, 180]));
    }
  }
  return instructions;
}

function crossRest(
  after: string,
  before: string,
  placement: PrescriptionRestInstruction["placement"],
  bounds: readonly [number, number],
): PrescriptionRestInstruction {
  const target = { kind: "range" as const, min: bounds[0], max: bounds[1], unit: "seconds" as const };
  return {
    restInstructionId: stableId("prescription-rest", { after, before, placement, target }),
    placement,
    target,
    appliesAfterBlockId: after,
    appliesBeforeBlockId: before,
    provenance: productionProvenance(`prescription-compiler:rest:${after}:${before}`),
  };
}

function deduplicateRestInstructions(
  instructions: readonly PrescriptionRestInstruction[],
): readonly PrescriptionRestInstruction[] {
  return [...new Map(instructions.map((entry) => [entry.restInstructionId, entry])).values()];
}

function operationalTimingClass(
  block: ProductionPrescriptionDoseBlock,
  assignment: SessionExerciseAssignment,
): PrescriptionOperationalExecutionTimingClass | null {
  if (block.purpose === "preparatory_acclimation") return "lift_acclimation";
  if (block.purpose === "recovery_or_downregulation" || assignment.section === "cooldown") {
    return "cooldown_recovery";
  }
  if (block.purpose === "developmental_work") {
    return assignment.section === "main"
      ? "primary_developmental_strength"
      : "supporting_developmental";
  }
  if (block.purpose !== "technique_quality_work") return null;
  if (assignment.section === "warmup") return "dependency_preparation";
  if (assignment.section === "activation") return "activation_control";
  return "accessory_support";
}

function combineBlockDurationIntervals(input: {
  readonly blocks: readonly ProductionPrescriptionDoseBlock[];
  readonly assignment: SessionExerciseAssignment;
  readonly availableSeconds: number;
  readonly operationalPolicy: PrescriptionAssignmentCompilerInput["operationalDurationPolicy"];
}) {
  const intervals = input.blocks.map((block) => buildPrescriptionDurationInterval({
    dose: block.dose,
    restInstructions: block.restInstructions,
    availableSeconds: input.availableSeconds,
    operationalPolicy: input.operationalPolicy,
    executionTimingClass: operationalTimingClass(block, input.assignment),
    assignmentId: input.assignment.routinePrescriptionHandoffId,
    blockId: block.blockId,
  }));
  let lower = intervals.reduce((total, interval) => total + interval.knownLowerBoundSeconds, 0);
  let upper = intervals.every((interval) => interval.knownUpperBoundSeconds !== null)
    ? intervals.reduce((total, interval) => total + (interval.knownUpperBoundSeconds ?? 0), 0)
    : null;
  const includedComponents: OperationalDurationComponent[] = intervals.flatMap((interval) =>
    interval.includedComponents ?? []);
  const calibrationBlock = input.blocks.find((block) =>
    block.purpose === "developmental_work" && block.dose.load?.kind === "user_selected_by_effort");
  const calibrationClass = calibrationBlock
    ? operationalTimingClass(calibrationBlock, input.assignment)
    : null;
  const calibrationBound = calibrationClass
    ? input.operationalPolicy?.loadCalibration[calibrationClass]
    : null;
  if (calibrationBlock && calibrationBound) {
    lower += calibrationBound.lowerBoundSeconds;
    if (upper !== null) upper += calibrationBound.upperBoundSeconds;
    includedComponents.push(Object.freeze({
      componentId: stableId("prescription-duration-component", {
        kind: "load_calibration",
        assignmentId: input.assignment.routinePrescriptionHandoffId,
        blockId: calibrationBlock.blockId,
      }),
      owner: "prescription" as const,
      kind: "load_calibration" as const,
      lowerBoundSeconds: calibrationBound.lowerBoundSeconds,
      upperBoundSeconds: calibrationBound.upperBoundSeconds,
      policyRef: calibrationBound.policyRef,
      classification: calibrationBound.classification,
      sourceAssignmentId: input.assignment.routinePrescriptionHandoffId,
      sourceDoseBlockId: calibrationBlock.blockId,
      countedExactlyOnce: true as const,
      provenance: calibrationBound.provenance,
    }));
  }
  const unknownComponents = uniqueSorted(
    intervals.flatMap((interval) => interval.unknownComponents),
  ) as readonly PrescriptionDurationUnknownComponent[];
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    unknownComponents,
    status: lower > input.availableSeconds
      ? "definitely_over_budget" as const
      : upper !== null && upper > input.availableSeconds
        ? "possibly_over_budget" as const
        : intervals[0]?.status ?? "bounded_before_sequencing" as const,
    ...(input.operationalPolicy ? {
      includedComponents: Object.freeze(includedComponents),
      operationalPolicyRefs: uniqueSorted(includedComponents.map((entry) => entry.policyRef)),
    } : {}),
    provenance: productionProvenance("prescription-compiler:duration:assignment"),
  };
}

function contribution(
  purpose: ProductionPrescriptionDoseBlock["purpose"],
): ProductionPrescriptionDoseBlock["contributionClassification"] {
  if (purpose === "preparatory_acclimation") return "not_weekly_developmental_credit";
  if (purpose === "developmental_work") return "developmental_credit_candidate";
  if (purpose === "technique_quality_work") return "technique_quality_observation_only";
  if (purpose === "recovery_or_downregulation") return "recovery_observation_only";
  return "unknown_requires_review";
}

function selectedRuleTraces(
  policy: InternalProductionPrescriptionPolicy,
  rules: readonly ProductionPrescriptionPolicyRuleV2[],
  input: PrescriptionAssignmentCompilerInput,
  context: AssignmentContext,
  selectedMode: ExerciseDoseMode,
): readonly ResolvedPrescriptionPolicyRuleTrace[] {
  return rules.map((rule) => ({
    ruleId: rule.ruleId,
    policyRef: { policyId: policy.policyId, version: policy.version },
    applicabilityEvidence: [
      `section:${context.handoffAssignment.section}`,
      `role:${context.handoffAssignment.role}`,
      `doseMode:${selectedMode}`,
      `goal:${input.sessionIntent.outcomeGoal ?? input.sessionIntent.primaryGoal}`,
      ...input.context.provenanceRefs,
    ],
    specificityLevel: rule.specificityLevel,
    specificity: policy.specificityOrder.indexOf(rule.specificityLevel) + 1,
    overriddenRuleIds: rule.overrideOfRuleIds,
    resolvedDimension: "dose_and_rest",
    provenance: rule.provenance,
  }));
}

function rejectedRuleTraces(
  policy: InternalProductionPrescriptionPolicy,
  selected: readonly ProductionPrescriptionPolicyRuleV2[],
  useCase: PrescriptionPolicyUseCaseV2,
  mode: ExerciseDoseMode,
  variant: PrescriptionPolicyRuleVariant,
): readonly RejectedPrescriptionPolicyRuleTrace[] {
  const selectedIds = new Set(selected.map((entry) => entry.ruleId));
  return policy.rules.filter((rule) => !selectedIds.has(rule.ruleId)).map((rule) => ({
    ruleId: rule.ruleId,
    reasonCode: rule.applicability.useCase !== useCase
      ? "RULE_USE_CASE_NOT_APPLICABLE"
      : rule.applicability.doseMode !== mode
        ? "RULE_DOSE_MODE_NOT_APPLICABLE"
        : rule.applicability.variant !== variant
          ? "RULE_VARIANT_NOT_APPLICABLE"
          : "RULE_OVERRIDDEN_BY_HIGHER_SPECIFICITY",
    provenance: rule.provenance,
  }));
}

function uniqueRules(
  rules: readonly ProductionPrescriptionPolicyRuleV2[],
): readonly ProductionPrescriptionPolicyRuleV2[] {
  return [...new Map(rules.map((rule) => [rule.ruleId, rule])).values()];
}

type InternalProductionPrescriptionPolicy = ProductionPrescriptionPolicy | ProductionPrescriptionPolicyV2;

function findInternalPrescriptionPolicyDoseRule(input: {
  readonly policy: InternalProductionPrescriptionPolicy;
  readonly useCase: PrescriptionPolicyUseCaseV2;
  readonly doseMode: ExerciseDoseMode;
  readonly variant: PrescriptionPolicyRuleVariant;
}): ProductionPrescriptionPolicyRuleV2 | null {
  return input.policy.rules.find((candidate) =>
    candidate.applicability.useCase === input.useCase &&
    candidate.applicability.doseMode === input.doseMode &&
    candidate.applicability.variant === input.variant
  ) as ProductionPrescriptionPolicyRuleV2 | undefined ?? null;
}

function tempoKind(dose: ExerciseDose): string {
  return "tempo" in dose ? dose.tempo?.kind ?? "not_applicable" : "not_applicable";
}

function continuityTrace(input: PrescriptionAssignmentCompilerInput): readonly string[] {
  if (!input.continuityEvidence) return ["NO_CONTINUITY_EVIDENCE_NO_AUTOMATIC_CHANGE"];
  const evidence = input.continuityEvidence;
  if (evidence.adverseResponseRequiresPrescriptionReview) {
    return ["ADVERSE_RESPONSE_REQUIRES_PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT"];
  }
  if (
    evidence.legal && evidence.productive && evidence.tolerated &&
    evidence.assignmentCompatible && evidence.equipmentCompatible &&
    evidence.requirementCompatible
  ) return ["PRODUCTIVE_CONTINUITY_PRESERVED"];
  return ["CONTINUITY_NOT_APPLIED_AUTOMATICALLY"];
}

function resultWithoutPlan(
  input: PrescriptionAssignmentCompilerInput,
  options: {
    readonly status: Exclude<PrescriptionAssignmentCompilationResult["status"], "compiled">;
    readonly assignment: SessionExerciseAssignment | null;
    readonly handoffAssignment: SessionPrescriptionAssignmentHandoff | null;
    readonly sourceExposureEvent: PrescriptionAssignmentCompilationResult["sourceExposureEvent"];
    readonly equipmentRealization: PrescriptionEquipmentRealization | null;
    readonly reasonCodes: readonly string[];
    readonly requirements?: ResolvedPrescriptionRequirementSet;
    readonly policyTrace?: readonly string[];
  },
): PrescriptionAssignmentCompilationResult {
  const unresolved = options.requirements?.unresolved.map((entry) => entry.requirementId) ?? [];
  return {
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
    status: options.status,
    assignment: options.assignment,
    handoffAssignment: options.handoffAssignment,
    sourceExposureEvent: options.sourceExposureEvent,
    equipmentRealization: options.equipmentRealization,
    plan: null,
    revisionLedger: null,
    recompositionRequirement: null,
    decisionTrace: emptyDecisionTrace(input, options.reasonCodes, unresolved, options.policyTrace),
    authority: "PRODUCTION_KERNEL_AUTHORITY",
  };
}

function emptyDecisionTrace(
  input: PrescriptionAssignmentCompilerInput,
  reasonCodes: readonly string[],
  unresolvedRequirementIds: readonly string[],
  policyTrace: readonly string[] = [],
): ProductionPrescriptionDecisionTrace {
  return {
    trainingReadinessTrace: input.trainingReadiness,
    policyResolutionTrace: policyTrace,
    selectedRules: [],
    rejectedRules: [],
    overriddenRules: [],
    conflictTrace: reasonCodes.filter((reason) => reason.includes("CONFLICT")),
    legalModeTrace: [],
    blockStructureTrace: [],
    loadTrace: null,
    effortTrace: [],
    modifierTrace: [],
    timingTrace: [],
    restPlacementTrace: [],
    durationTrace: [],
    continuityTrace: continuityTrace(input),
    unresolvedRequirementIds: [...unresolvedRequirementIds].sort(),
    finalReasonCodes: uniqueSorted(reasonCodes),
  };
}
