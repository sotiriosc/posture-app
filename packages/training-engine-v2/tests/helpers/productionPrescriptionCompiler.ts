import {
  FULL_GYM_EQUIPMENT,
  NO_TRAINING_SAFETY_SIGNALS,
  PRESCRIPTION_POLICY_V1,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildTrainingReadinessTrace,
  compileSessionPrescription,
  type AthleteProfile,
  type ExerciseDoseMode,
  type ExerciseDefinition,
  type PrescriptionCompilationContextFacts,
  type PrescriptionExecutionRequirement,
  type PrescriptionSessionCompilationResult,
  type PrescriptionSessionCompilerInput,
  type PriorPrescriptionRealizationEvidence,
  type ProductionPrescriptionPolicy,
  type SessionPrescriptionAssignmentHandoff,
  type SessionIntent,
  type SessionPrescriptionHandoff,
  type SessionSection,
  type SessionSkeleton,
  type TrainingRole,
} from "../../src";
import type { OwnerPolicyHoldoutScenario } from "../cagt/prescriptionPolicyV1OwnerAdmission";

export const PRODUCTION_PRESCRIPTION_COMPILER_TEST_TIME =
  "2026-08-13T18:00:00-04:00" as const;

export function buildProductionCompilerInputForOwnerScenario(
  fixture: OwnerPolicyHoldoutScenario,
  options: {
    readonly policy?: PrescriptionSessionCompilerInput["policy"];
    readonly priorByHandoffId?: Readonly<Record<string, PriorPrescriptionRealizationEvidence | null>>;
    readonly executionAttemptId?: string;
  } = {},
): PrescriptionSessionCompilerInput {
  const policy = options.policy !== undefined
    ? options.policy
    : fixture.expectedResolution === "missing_policy"
      ? null
      : fixture.expectedResolution === "conflict"
        ? conflictingPolicy()
        : fixture.expectedResolution === "unsupported_context"
          ? { policyId: "UNKNOWN_POLICY", version: "0.0.0" }
          : PRESCRIPTION_POLICY_V1;
  return {
    sessionIntent: fixture.intent,
    sessionSkeleton: fixture.skeleton,
    handoff: fixture.handoff,
    athlete: athleteFor(fixture),
    exerciseRegistry: REFERENCE_EXERCISES,
    exerciseKnowledgeRegistry: REFERENCE_EXERCISES.map((exercise) => exercise.prescriptionKnowledge),
    currentEquipment: FULL_GYM_EQUIPMENT,
    trainingReadiness: buildTrainingReadinessTrace({
      trainingSafety: NO_TRAINING_SAFETY_SIGNALS,
    }),
    executionRequirements: fixture.handoff.assignments.flatMap((assignment) =>
      requirementsFor(assignment, fixture.contextTags)
    ),
    contextByHandoffId: Object.fromEntries(fixture.handoff.assignments.map((assignment) => [
      assignment.handoffId,
      contextFor(fixture, assignment),
    ])),
    continuityEvidenceByHandoffId: Object.fromEntries(fixture.handoff.assignments.map((assignment) => [
      assignment.handoffId,
      fixture.contextTags.includes("productive_continuity") ? {
        exerciseId: assignment.exerciseId,
        legal: true,
        productive: true,
        tolerated: true,
        assignmentCompatible: true,
        equipmentCompatible: true,
        requirementCompatible: true,
        successfulReExposure: fixture.contextTags.includes("successful_reexposure"),
        adverseResponseRequiresPrescriptionReview: fixture.contextTags.includes("adverse_response"),
        sourceRefs: [`owner-holdout:${fixture.scenarioId}:continuity`],
      } : null,
    ])),
    priorRealizationEvidenceByHandoffId: options.priorByHandoffId ?? Object.fromEntries(
      fixture.handoff.assignments.map((assignment) => [assignment.handoffId, null]),
    ),
    completedPerformanceReferences: [],
    responseReceiverEvidence: [],
    executionAttemptId: options.executionAttemptId ?? `execution-attempt:${fixture.scenarioId}`,
    evaluationTime: PRODUCTION_PRESCRIPTION_COMPILER_TEST_TIME,
    policy,
    availablePolicies: [PRESCRIPTION_POLICY_V1],
    revisionContextByHandoffId: Object.fromEntries(
      fixture.handoff.assignments.map((assignment) => [assignment.handoffId, null]),
    ),
  };
}

export function compileOwnerScenarioWithProductionKernel(
  fixture: OwnerPolicyHoldoutScenario,
): PrescriptionSessionCompilationResult {
  return compileSessionPrescription(buildProductionCompilerInputForOwnerScenario(fixture));
}

export function buildExactPriorEvidence(input: {
  readonly result: PrescriptionSessionCompilationResult;
  readonly handoffId: string;
}): PriorPrescriptionRealizationEvidence {
  const assignment = input.result.assignmentResults.find((entry) =>
    entry.handoffAssignment?.handoffId === input.handoffId
  );
  const plan = assignment?.plan;
  const equipment = assignment?.equipmentRealization;
  const block = plan?.doseBlocks.find((entry) => entry.purpose === "developmental_work") ??
    plan?.doseBlocks[0];
  if (!plan || !equipment || !block) {
    throw new Error(`Cannot build prior evidence for ${input.handoffId}.`);
  }
  const actualLoad = {
    kind: "external_load" as const,
    target: { kind: "exact" as const, value: 12, unit: "kg" as const },
    application: "single_implement" as const,
  };
  return {
    exerciseId: plan.exerciseId,
    prescriptionId: plan.prescriptionId,
    prescriptionRevisionId: plan.prescriptionRevisionId,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    doseMode: block.dose.mode,
    plannedDose: block.dose,
    equipmentRealization: equipment,
    sideBehavior: block.dose.sideBehavior ?? null,
    support: block.dose.support ?? null,
    range: block.dose.range ?? null,
    lever: block.dose.lever ?? null,
    plannedLoad: block.dose.load ?? null,
    observedActualLoad: actualLoad,
    plannedEffort: block.dose.effort ?? null,
    actualPerformanceRef: `performance:${input.handoffId}:prior`,
    responseReceiverTrace: null,
    completed: true,
    productivelyTolerated: true,
    occurredAt: "2026-08-10T10:00:00-04:00",
    exactIncrementStillAvailable: true,
    unresolvedLoadRestriction: false,
    progressionAssumed: false,
    provenance: {
      source: "synthetic_contract_fixture",
      sourceRef: `production-compiler-test:prior:${input.handoffId}`,
    },
  };
}

export function buildCatalogCompilerInput(
  exercise: ExerciseDefinition,
  options: {
    readonly requestedMode?: ExerciseDoseMode;
    readonly policy?: PrescriptionSessionCompilerInput["policy"];
  } = {},
): PrescriptionSessionCompilerInput {
  const role = catalogRole(exercise);
  const section = sectionForRole(role);
  const intent = catalogIntent(exercise, role, section);
  const handoffId = `catalog:${exercise.id}:handoff`;
  const assignment = catalogHandoffAssignment(exercise, role, section, handoffId);
  const skeleton = catalogSkeleton(exercise, role, section, handoffId, intent.id);
  const handoff: SessionPrescriptionHandoff = {
    sessionIntentId: intent.id,
    assignments: [assignment],
  };
  const requestedMode = options.requestedMode;
  const requirements: readonly PrescriptionExecutionRequirement[] = requestedMode
    ? [{
      requirementId: `catalog:${exercise.id}:dose-mode`,
      targetAssignmentHandoffId: handoffId,
      sourceOwner: "exercise_knowledge",
      sourceRef: exercise.prescriptionKnowledge.profileId,
      targetDimension: "dose_mode",
      requestedAction: "apply_reviewed_resolution",
      side: null,
      reviewStatus: "accepted",
      provenance: { source: "synthetic_contract_fixture", sourceRef: `catalog:${exercise.id}:mode` },
      resolutionState: "resolved",
      reviewedResolution: { kind: "dose_mode", value: requestedMode },
    }]
    : [];
  const context = catalogContext(exercise, role, section);
  return {
    sessionIntent: intent,
    sessionSkeleton: skeleton,
    handoff,
    athlete: {
      id: `catalog:${exercise.id}:athlete`,
      label: "Catalog coverage athlete",
      experience: "intermediate",
      primaryGoal: "strength",
      secondaryGoals: [],
      preferences: { preferredExerciseIds: [], dislikedExerciseIds: [], varietyPreference: "low", notes: [] },
      availability: { daysPerWeek: 3, minutesPerSession: 45, preferredTrainingDays: [] },
    },
    exerciseRegistry: REFERENCE_EXERCISES,
    exerciseKnowledgeRegistry: REFERENCE_EXERCISES.map((entry) => entry.prescriptionKnowledge),
    currentEquipment: FULL_GYM_EQUIPMENT,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: NO_TRAINING_SAFETY_SIGNALS }),
    executionRequirements: requirements,
    contextByHandoffId: { [handoffId]: context },
    continuityEvidenceByHandoffId: { [handoffId]: null },
    priorRealizationEvidenceByHandoffId: { [handoffId]: null },
    completedPerformanceReferences: [],
    responseReceiverEvidence: [],
    executionAttemptId: `catalog:${exercise.id}:attempt`,
    evaluationTime: PRODUCTION_PRESCRIPTION_COMPILER_TEST_TIME,
    policy: options.policy ?? PRESCRIPTION_POLICY_V1,
    availablePolicies: [PRESCRIPTION_POLICY_V1],
    revisionContextByHandoffId: { [handoffId]: null },
  };
}

function catalogRole(exercise: ExerciseDefinition): TrainingRole {
  if (exercise.prescriptionKnowledge.primaryDoseMode === "breath_cycles") return "recovery";
  if (exercise.prescriptionKnowledge.primaryDoseMode === "distance_carry") return "capacity";
  if (exercise.prescriptionKnowledge.primaryDoseMode === "step_march") return "capacity";
  if (exercise.prescriptionKnowledge.primaryDoseMode === "timed_hold") return "hypertrophy_accessory";
  if (exercise.prescriptionKnowledge.primaryDoseMode === "step_sets") {
    return exercise.trainingRoles.includes("activation") ? "activation" : "capacity";
  }
  return exercise.trainingRoles.includes("primary_strength")
    ? "primary_strength"
    : exercise.trainingRoles.includes("secondary_strength")
      ? "secondary_strength"
      : exercise.trainingRoles.includes("activation")
        ? "activation"
        : exercise.trainingRoles.includes("preparation")
          ? "preparation"
          : exercise.trainingRoles.includes("hypertrophy_accessory")
            ? "hypertrophy_accessory"
            : exercise.trainingRoles[0] ?? "hypertrophy_accessory";
}

function sectionForRole(role: TrainingRole): SessionSection {
  if (role === "preparation") return "warmup";
  if (role === "activation") return "activation";
  if (role === "recovery") return "cooldown";
  if (role === "primary_strength" || role === "secondary_strength") return "main";
  return "accessory";
}

function catalogIntent(
  exercise: ExerciseDefinition,
  role: TrainingRole,
  section: SessionSection,
): SessionIntent {
  const needId = `catalog:${exercise.id}:need`;
  return {
    id: `catalog:${exercise.id}:intent`,
    athleteId: `catalog:${exercise.id}:athlete`,
    kind: "ordinary_training",
    phaseIntent: THREE_PHASE_FOUNDATION[1],
    primaryGoal: role === "recovery" || role === "preparation" || role === "activation"
      ? "posture_and_movement_quality"
      : "strength",
    outcomeGoal: role === "recovery" || role === "preparation" || role === "activation"
      ? "posture_and_movement_quality"
      : "strength",
    needs: [{
      id: needId,
      section,
      priority: "required",
      priorityOrder: 0,
      standaloneAdmission: "admitted",
      sourceEvidence: [{ sourceKind: "session_primary_purpose", sourceId: `${needId}:source`, evidenceRefs: [`${needId}:evidence`] }],
      dependencies: [],
      reasonCode: "CATALOG_PRIMARY_MODE_COVERAGE",
      explanation: "Controlled catalog coverage need.",
      selection: {
        requestedRole: role,
        targetMovementRoles: exercise.movementRoles,
        targetActionFunctions: exercise.actionFunctions.map((entry) => entry.action),
        targetMuscles: exercise.primaryMuscles,
        muscleRequirement: "any_meaningful_contributor",
        targetBodyRegions: exercise.bodyRegions,
      },
    }],
    structuralCapacity: "standard",
    availableMinutes: 45,
    assessmentContextRefs: [],
    painResponseContextRefs: [],
    fatigueContext: ["fresh"],
    continuityEvidence: { identities: [] },
    plannerSourceTrace: { plannerId: "catalog-coverage", sourceRefs: ["catalog-coverage"] },
    unresolvedWeeklyContextRefs: ["week-not-implemented"],
  };
}

function catalogHandoffAssignment(
  exercise: ExerciseDefinition,
  role: TrainingRole,
  section: SessionSection,
  handoffId: string,
): SessionPrescriptionAssignmentHandoff {
  const knowledge = exercise.prescriptionKnowledge;
  return {
    handoffId,
    exerciseId: exercise.id,
    phaseId: THREE_PHASE_FOUNDATION[1].id,
    section,
    role,
    satisfiedNeedIds: [`catalog:${exercise.id}:need`],
    continuityEvidenceRefs: [],
    requiredPrescriptionResolutionIds: [],
    potentialStressTags: exercise.cautionStressTags,
    explicitRequirementRefs: [],
    knownRequirements: {
      sideRequirements: [], supportRequirementIds: [], rangeRequirementIds: [],
      loadRequirementIds: [], leverRequirementIds: [], durationRequirementIds: [],
      distanceRequirementIds: [], stepRequirementIds: [], unclassifiedRequirementIds: [],
    },
    timingKnowledge: {
      authority: "HANDOFF_ONLY",
      doseModeKnowledge: knowledge.doseModeAnnotations.map(({ mode, status, reviewStatus, notes }) => ({ mode, status, reviewStatus, notes })),
      primaryDoseMode: knowledge.primaryDoseMode,
      legalDoseModes: [knowledge.primaryDoseMode, ...knowledge.legalAlternateDoseModes],
      tempoCapability: knowledge.repetitionTempo,
      durationCapability: knowledge.duration,
      breathingCadenceCapability: knowledge.breathingCadence,
      locomotorCadenceCapability: knowledge.locomotorCadence,
      unresolvedTimingRequirementIds: [],
      timingPolicyRequirement: "PRESCRIPTION_POLICY_REQUIRED",
      timingProvenanceRefs: knowledge.provenance.map((entry) => entry.sourceRef),
    },
    orderingConstraints: [],
    sourceExposureEventExpected: true,
  };
}

function catalogSkeleton(
  exercise: ExerciseDefinition,
  role: TrainingRole,
  section: SessionSection,
  handoffId: string,
  intentId: string,
): SessionSkeleton {
  const assignment = {
    exerciseId: exercise.id,
    section,
    role,
    satisfiedNeedIds: [`catalog:${exercise.id}:need`],
    candidateEvidenceByNeed: [{ needId: `catalog:${exercise.id}:need`, requestId: `catalog:${exercise.id}:request`, candidateRank: 1, candidateExerciseId: exercise.id, painReadiness: "clear" }],
    continuityClassification: "none" as const,
    continuityEvidenceRefs: [],
    unresolvedCandidateReviewIds: [],
    executionBlockingPrescriptionRequirementIds: [],
    routinePrescriptionHandoffId: handoffId,
    bestExecutableFallbackExerciseId: null,
    marginalValueReasonCodes: ["CATALOG_COVERAGE"],
    futureSourceExposureCount: 1 as const,
  };
  return {
    sessionIntentId: intentId,
    compositionStatus: "valid",
    executionReadiness: "executable_at_session_scope",
    sections: (["warmup", "activation", "main", "accessory", "cooldown"] as const).map((candidate) => ({
      section: candidate,
      assignmentExerciseIds: candidate === section ? [exercise.id] : [],
      emptyReasonCode: candidate === section ? null : "NO_ALLOCATED_ASSIGNMENT",
    })),
    assignments: [assignment],
    needSatisfaction: [{ needId: `catalog:${exercise.id}:need`, covered: true, exerciseId: exercise.id, coverageKind: "standalone", reasonCode: "CATALOG_COVERAGE" }],
    orderingConstraints: [],
    evaluation: null,
    redundancy: [],
    concentration: [],
    search: {
      mode: "exhaustive", completeness: "exact_optimal", statesExpanded: 1,
      statesPruned: 0, pruningReasons: {}, frontierPeak: 1, limitReached: false,
      completeValidSkeletonFound: true, optimalityProven: true,
      expandedStateBudget: 1, retainedFrontierPerLayer: 1,
    },
    trace: {
      selectedReasonCodesByExercise: { [exercise.id]: ["CATALOG_COVERAGE"] },
      omittedNeedReasonCodes: {}, excludedHighRankedCandidateIds: [],
      emptySectionReasonCodes: Object.fromEntries(
        (["warmup", "activation", "main", "accessory", "cooldown"] as const).map((candidate) => [candidate, candidate === section ? null : "NO_ALLOCATED_ASSIGNMENT"]),
      ) as Record<SessionSection, string | null>,
    },
    infeasibility: null,
  };
}

function catalogContext(
  exercise: ExerciseDefinition,
  role: TrainingRole,
  section: SessionSection,
): PrescriptionCompilationContextFacts {
  return {
    familiarity: "known_productive", returnAfterAbsence: false,
    painAwareLoadToleranceRegressionPermitted: false, reliablePriorPerformance: true,
    reviewedRegression: false, adverseResponseSupportsReducedDose: false,
    newEquipmentRealization: false, requiredPreparationDependency: false,
    reviewedRangeOrControlDependency: false, sharedPreparationDependency: false,
    successfulBoundedPriorPreparation: false, requiredActivationDependency: false,
    explicitControlRequirement: false, lowFatigueActivationSuitable: true,
    adverseActivationFatigueResponse: false, mainWorkPreserved: true,
    secondaryObjectiveRequired: role === "secondary_strength", secondaryWeeklyPriority: false,
    secondaryCapacitySupported: true, secondaryHigherPriorityConflict: false,
    secondaryNonRedundantUpstream: true, accessoryPriority: "required",
    accessoryUniquePurposeActive: true, accessoryCoherencePreserved: true,
    overlappingExposureRepresented: false, firstExposure: false,
    insufficientResponseHistory: false, directObjectiveConfirmedUpstream: section === "accessory" && role !== "capacity",
    allocatedRecoveryResponsibility: role === "recovery", successfulBreathResponse: false,
    sessionCapacityPreservesMainWork: true, carryPurpose: "capacity_main",
    stationaryMarchRealization: "count", reviewedAcclimationBlockCount: 0,
    requestedTempoIntent: "natural", explicitPowerObjective: null,
    powerIntentPermittedByExerciseKnowledge: false, assessmentPriorityIds: [],
    alignmentPriorityIds: [], provenanceRefs: [`catalog:${exercise.id}:typed-context`],
  };
}

function athleteFor(fixture: OwnerPolicyHoldoutScenario): AthleteProfile {
  return {
    id: `athlete:${fixture.scenarioId}`,
    label: "Production compiler controlled athlete",
    experience: fixture.experience,
    primaryGoal: fixture.intent.primaryGoal,
    secondaryGoals: [],
    preferences: {
      preferredExerciseIds: [],
      dislikedExerciseIds: [],
      varietyPreference: "low",
      notes: [],
    },
    availability: {
      daysPerWeek: 3,
      minutesPerSession: fixture.intent.availableMinutes,
      preferredTrainingDays: [],
    },
  };
}

function contextFor(
  fixture: OwnerPolicyHoldoutScenario,
  assignment: SessionPrescriptionAssignmentHandoff,
): PrescriptionCompilationContextFacts {
  const tags = fixture.contextTags;
  return {
    familiarity: tags.includes("unfamiliar_selected_task") ? "unfamiliar" : tags.includes("known_productive_task") ? "known_productive" : "unknown",
    returnAfterAbsence: tags.includes("return_after_absence"),
    painAwareLoadToleranceRegressionPermitted: tags.includes("pain_aware_unresolved_load_tolerance"),
    reliablePriorPerformance: !tags.includes("no_reliable_prior_performance"),
    reviewedRegression: tags.includes("explicit_regression"),
    adverseResponseSupportsReducedDose: tags.includes("adverse_response"),
    newEquipmentRealization: tags.includes("new_equipment_realization"),
    requiredPreparationDependency: tags.includes("required_preparation_dependency"),
    reviewedRangeOrControlDependency: tags.includes("reviewed_range_control_dependency"),
    sharedPreparationDependency: tags.includes("shared_preparation_dependency"),
    successfulBoundedPriorPreparation: tags.includes("successful_bounded_preparation"),
    requiredActivationDependency: tags.includes("required_activation_dependency"),
    explicitControlRequirement: tags.includes("explicit_control_requirement"),
    lowFatigueActivationSuitable: tags.includes("low_fatigue_activation"),
    adverseActivationFatigueResponse: tags.includes("unnecessary_activation_fatigue"),
    mainWorkPreserved: true,
    secondaryObjectiveRequired: assignment.role === "secondary_strength" && tags.includes("secondary_required_priority"),
    secondaryWeeklyPriority: tags.includes("secondary_three_set_override"),
    secondaryCapacitySupported: fixture.capacity !== "condensed",
    secondaryHigherPriorityConflict: false,
    secondaryNonRedundantUpstream: true,
    accessoryPriority: tags.includes("required_direct_objective") || tags.includes("required_accessory_objective") ? "required" : "optional",
    accessoryUniquePurposeActive: true,
    accessoryCoherencePreserved: true,
    overlappingExposureRepresented: false,
    firstExposure: false,
    insufficientResponseHistory: false,
    directObjectiveConfirmedUpstream: tags.includes("required_direct_objective") || tags.includes("optional_direct_objective"),
    allocatedRecoveryResponsibility: tags.includes("allocated_recovery_responsibility"),
    successfulBreathResponse: tags.includes("successful_breath_response"),
    sessionCapacityPreservesMainWork: true,
    carryPurpose: tags.includes("capacity_main") ? "capacity_main" : "accessory",
    stationaryMarchRealization: tags.includes("stationary_march_duration") ? "duration" : "count",
    reviewedAcclimationBlockCount: tags.includes("ramp_up_2") ? 2 : tags.includes("ramp_up_1") ? 1 : tags.includes("ramp_up_0") ? 0 : null,
    requestedTempoIntent: tags.includes("controlled_execution") ? "controlled" : "natural",
    explicitPowerObjective: tags.includes("power_intent") ? "explosive_intent" : null,
    powerIntentPermittedByExerciseKnowledge: tags.includes("power_intent"),
    assessmentPriorityIds: [],
    alignmentPriorityIds: [],
    provenanceRefs: [`owner-holdout:${fixture.scenarioId}:typed-context`],
  };
}

function requirementsFor(
  assignment: SessionPrescriptionAssignmentHandoff,
  tags: readonly string[],
): readonly PrescriptionExecutionRequirement[] {
  const requirements: PrescriptionExecutionRequirement[] = [];
  const add = (
    id: string,
    targetDimension: PrescriptionExecutionRequirement["targetDimension"],
    reviewedResolution: PrescriptionExecutionRequirement["reviewedResolution"],
  ): void => {
    requirements.push({
      requirementId: id,
      targetAssignmentHandoffId: assignment.handoffId,
      sourceOwner: "coach_review",
      sourceRef: `owner-holdout:${assignment.handoffId}:${id}`,
      targetDimension,
      requestedAction: "apply_reviewed_resolution",
      side: null,
      reviewStatus: "accepted",
      provenance: {
        source: "synthetic_contract_fixture",
        sourceRef: `owner-holdout:${assignment.handoffId}:${id}`,
      },
      resolutionState: "resolved",
      ...(reviewedResolution ? { reviewedResolution } : {}),
    });
  };
  for (const entry of assignment.knownRequirements.sideRequirements) {
    add(entry.requirementId, "side", { kind: "side", value: entry.side });
  }
  for (const id of assignment.knownRequirements.supportRequirementIds) {
    add(id, "support", { kind: "support", value: { level: "light_touch", surface: "wall" } });
  }
  for (const id of assignment.knownRequirements.rangeRequirementIds) {
    add(id, "range", { kind: "range", value: { kind: "intentionally_partial", description: "Reviewed structured range requirement." } });
  }
  for (const id of assignment.knownRequirements.leverRequirementIds) {
    add(id, "lever", { kind: "lever", value: { state: "shortened_regressed" } });
  }
  for (const id of assignment.knownRequirements.loadRequirementIds) {
    requirements.push({
      requirementId: id,
      targetAssignmentHandoffId: assignment.handoffId,
      sourceOwner: "training_response_receiver",
      sourceRef: `owner-holdout:${assignment.handoffId}:${id}`,
      targetDimension: "load",
      requestedAction: "preserve_current_realization",
      side: null,
      reviewStatus: "accepted",
      provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-holdout:${id}` },
      resolutionState: "outside_prescription_ownership",
    });
  }
  for (const id of [
    ...assignment.knownRequirements.durationRequirementIds,
    ...assignment.knownRequirements.distanceRequirementIds,
    ...assignment.knownRequirements.stepRequirementIds,
    ...assignment.knownRequirements.unclassifiedRequirementIds,
    ...assignment.requiredPrescriptionResolutionIds,
  ]) {
    add(id, "unresolved_other", { kind: "unresolved_other", reasonCode: "CONTROLLED_FIXTURE_REVIEWED" });
  }
  const mode = requestedMode(tags, assignment);
  if (mode) {
    add(`dose-mode:${assignment.handoffId}`, "dose_mode", { kind: "dose_mode", value: mode });
  }
  return requirements;
}

function requestedMode(
  tags: readonly string[],
  assignment: SessionPrescriptionAssignmentHandoff,
): ExerciseDoseMode | null {
  const legal = assignment.timingKnowledge.legalDoseModes;
  for (const [tag, mode] of [
    ["timed_carry", "timed_carry"],
    ["distance_carry", "distance_carry"],
    ["timed_hold", "timed_hold"],
    ["breath_cycles", "breath_cycles"],
    ["step_march", "step_march"],
    ["step_sets", "step_sets"],
  ] as const) {
    if (tags.includes(tag) && legal.includes(mode)) return mode;
  }
  return null;
}

function conflictingPolicy(): ProductionPrescriptionPolicy {
  const first = PRESCRIPTION_POLICY_V1.rules[0];
  const second = PRESCRIPTION_POLICY_V1.rules[1];
  return {
    ...PRESCRIPTION_POLICY_V1,
    conflicts: [{
      conflictId: "controlled-equal-conflict",
      leftRuleId: first.ruleId,
      rightRuleId: second.ruleId,
      authority: "equal",
      resolution: "unresolved",
      provenance: { source: "synthetic_contract_fixture", sourceRef: "production-compiler-test:equal-conflict" },
    }],
  };
}
