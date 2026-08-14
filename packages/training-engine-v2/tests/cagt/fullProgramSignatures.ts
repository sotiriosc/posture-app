import type {
  FullPrescribedProgramSnapshot,
  FullProgramGate14DifferenceDimension,
  FullProgramSignature,
  FullProgramSignatureFamily,
  FullProgramStructuredDifference,
} from "./fullProgramContracts";
import {
  FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS,
  FULL_PROGRAM_NONMATERIAL_DIMENSIONS,
} from "./fullProgramContracts";
import type { CagtGateId } from "./contracts";
import { canonicalize, semanticallyEqual } from "./diff";
import { digest } from "./signatures";

const sorted = <T>(values: readonly T[], key: (value: T) => string = (value) => JSON.stringify(value)): readonly T[] =>
  [...values].sort((left, right) => key(left).localeCompare(key(right)));

function signature<T>(value: T): FullProgramSignature<T> {
  const normalized = canonicalize(value) as T;
  return Object.freeze({ value: normalized, fingerprint: digest(normalized) });
}

function objectiveSemantics(snapshot: FullPrescribedProgramSnapshot) {
  return sorted(snapshot.normalizedWeekSourceSnapshot.objectives.map((objective) => ({
    purpose: objective.purpose,
    target: objective.target,
    priority: objective.priority,
    priorityOrder: objective.priorityOrder,
    frequencyIntent: objective.frequencyIntent,
    dosePolicyState: objective.dosePolicyState,
    spacingState: objective.spacingState,
    goalRelationships: sorted(objective.goalRelationships, (relationship) =>
      `${relationship.goal}:${relationship.relationship}`),
  })), (objective) => `${objective.priorityOrder}:${objective.purpose}:${digest(objective.target)}`);
}

function opportunityOrder(snapshot: FullPrescribedProgramSnapshot): ReadonlyMap<string, number> {
  return new Map(snapshot.normalizedWeekSourceSnapshot.opportunities.map((opportunity) =>
    [opportunity.opportunityId, opportunity.order]));
}

function objectiveKey(snapshot: FullPrescribedProgramSnapshot, objectiveId: string): string {
  const objective = snapshot.normalizedWeekSourceSnapshot.objectives.find((entry) => entry.objectiveId === objectiveId);
  return objective ? `${objective.purpose}:${digest(objective.target)}:${objective.priority}` : `unknown:${objectiveId}`;
}

function reservationSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.normalizedWeekSourceSnapshot.reservations.map((reservation) => ({
    opportunityOrder: orders.get(reservation.opportunityId) ?? -1,
    objectiveResponsibilities: sorted(reservation.allocatedObjectiveIds.map((id) => objectiveKey(snapshot, id))),
    expectedSessionGoal: reservation.expectedSessionGoal,
    availabilityState: reservation.availabilityState,
    executionState: reservation.executionState,
    invalidationState: reservation.invalidationState,
  })), (reservation) => `${reservation.opportunityOrder}:${digest(reservation.objectiveResponsibilities)}`);
}

function needSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.reservationArtifacts.flatMap((artifact) => artifact.sessionIntent.needs.map((need) => ({
    opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
    section: need.section,
    priority: need.priority,
    priorityOrder: need.priorityOrder,
    standaloneAdmission: need.standaloneAdmission,
    selection: need.selection,
    objectiveResponsibilities: sorted((need.plannerProvenance?.objectiveIds ?? [])
      .map((id) => objectiveKey(snapshot, id))),
    dependencies: sorted(need.dependencies.map((dependency) => ({
      required: dependency.required,
      movementRoles: sorted(dependency.movementRoles),
      actionFunctions: sorted(dependency.actionFunctions),
      bodyRegions: sorted(dependency.bodyRegions),
      rangeRequirements: sorted(dependency.rangeRequirements ?? [], (range) =>
        `${range.bodyRegion}:${range.actionFunction ?? "none"}:${range.side ?? "none"}`),
    })), (dependency) => digest(dependency)),
  }))), (need) => `${need.opportunityOrder}:${need.priorityOrder}:${need.section}:${digest(need.selection)}`);
}

function assignmentSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.reservationArtifacts.flatMap((artifact) => artifact.sessionSkeleton.assignments.map((assignment) => ({
    opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
    exerciseId: assignment.exerciseId,
    section: assignment.section,
    role: assignment.role,
    continuityClassification: assignment.continuityClassification,
    needResponsibilities: sorted(assignment.satisfiedNeedIds.map((needId) => {
      const need = artifact.sessionIntent.needs.find((entry) => entry.id === needId);
      return need ? `${need.section}:${need.priority}:${digest(need.selection)}` : `unknown:${needId}`;
    })),
    candidateReviewRequired: assignment.unresolvedCandidateReviewIds.length > 0,
    prescriptionResolutionRequired: assignment.executionBlockingPrescriptionRequirementIds.length > 0,
  }))), (assignment) => `${assignment.opportunityOrder}:${assignment.section}:${assignment.role}:${assignment.exerciseId}`);
}

function prescriptionSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.reservationArtifacts.flatMap((artifact) => artifact.prescriptionCompilation.plans.map((plan) => ({
    opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
    exerciseId: plan.exerciseId,
    sourceEventLineage: plan.sourceExposureEvent.sessionAssignmentId,
    blocks: [...plan.doseBlocks].sort((left, right) => left.order.index - right.order.index).map((block) => ({
      purpose: block.purpose,
      contributionClassification: block.contributionClassification,
      dose: block.dose,
      order: block.order.index,
      dependencyCount: block.order.dependsOnBlockIds.length,
      unresolvedRequirementCount: block.unresolvedRequirementRefs.length,
    })),
    restInstructions: plan.restInstructions.map((rest) => ({
      placement: rest.placement,
      target: rest.target,
    })),
    duration: {
      lower: plan.durationInterval.knownLowerBoundSeconds,
      upper: plan.durationInterval.knownUpperBoundSeconds,
      status: plan.durationInterval.status,
      unknownKinds: sorted(plan.durationInterval.unknownComponents),
    },
    unresolvedRequirementCount: plan.unresolvedRequirementRefs.length,
  }))), (plan) => `${plan.opportunityOrder}:${plan.exerciseId}:${plan.sourceEventLineage}`);
}

function sequenceSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.reservationArtifacts.map((artifact) => ({
    opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
    steps: artifact.finalSequencePlan.steps.map((step) => ({
      index: step.sequenceIndex,
      exerciseId: step.exerciseId,
      section: step.section,
      role: step.role,
      doseBlockCount: step.orderedDoseBlockIds.length,
      dependencyCount: step.dependencyAssignmentIds.length,
      executionReadiness: step.executionReadiness,
    })),
    transitions: artifact.finalSequencePlan.consecutiveTransitionFacts.map((transition) => ({
      fromAssignmentId: transition.fromAssignmentId,
      toAssignmentId: transition.toAssignmentId,
      sectionRelationship: transition.sectionRelationship,
      dependencyRelationship: transition.dependencyRelationship,
      setupRelationship: transition.setupRelationship,
      equipmentRelationship: transition.equipmentRelationship,
      explicitTimingFactCount: transition.explicitTimingFactIds.length,
      unknownTimingComponentCount: transition.unknownTimingComponents.length,
    })),
    duration: {
      lower: artifact.finalSequencePlan.duration.knownLowerBoundSeconds,
      upper: artifact.finalSequencePlan.duration.knownUpperBoundSeconds,
      status: artifact.finalSequencePlan.duration.status,
      unknownKinds: sorted(artifact.finalSequencePlan.duration.unknownComponents),
    },
  })), (entry) => String(entry.opportunityOrder));
}

function ledgerSemantics(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return sorted(snapshot.postPrescriptionWeekValidationResult.sourceExposureLedger.map((event) => ({
    opportunityOrder: orders.get(event.opportunityId) ?? -1,
    exerciseId: event.exerciseId,
    section: event.section,
    role: event.role,
    objectiveResponsibilities: sorted(event.weeklyObjectiveIds.map((id) => objectiveKey(snapshot, id))),
    blockPurposes: event.blockPurposeViews.map((block) =>
      `${block.purpose}:${block.contributionClassification}:${block.doseMode}`),
    doseModes: event.doseLanes.map((lane) => lane.mode),
    muscles: sorted(event.muscleRelationshipViews.map((view) => `${view.muscle}:${view.relationship}`)),
    movementRoles: sorted(event.movementActionCapacityView.movementRoles),
    actionFunctions: sorted(event.movementActionCapacityView.actionFunctions),
    capacityLane: event.movementActionCapacityView.capacityLane,
    assessmentLane: event.movementActionCapacityView.assessmentLane,
    recoveryLane: event.movementActionCapacityView.recoveryLane,
    stress: sorted(event.stressExposureViews.map((view) =>
      `${view.stressTag}:${view.source}:${view.exposureScope}:${view.sideScope}:${view.resolutionState}`)),
    admissibility: event.sessionAdmissibilityState,
  })), (event) => `${event.opportunityOrder}:${event.section}:${event.role}:${event.exerciseId}`);
}

function frameworkValue(snapshot: FullPrescribedProgramSnapshot) {
  const orders = opportunityOrder(snapshot);
  return {
    opportunityCount: snapshot.normalizedWeekSourceSnapshot.opportunities.length,
    opportunityPattern: [...snapshot.normalizedWeekSourceSnapshot.opportunities]
      .sort((left, right) => left.order - right.order)
      .map((opportunity) => ({
        order: opportunity.order,
        availabilityState: opportunity.availabilityState,
        reservationCount: opportunity.reservationIds.length,
      })),
    prescribedSessionCount: snapshot.reservationArtifacts.length,
    dominantSessionResponsibilities: sorted(snapshot.normalizedWeekSourceSnapshot.reservations.map((reservation) => ({
      opportunityOrder: orders.get(reservation.opportunityId) ?? -1,
      priorities: sorted(reservation.allocatedObjectiveIds.map((id) => objectiveKey(snapshot, id))),
    })), (entry) => String(entry.opportunityOrder)),
    sectionOccupancy: sorted(snapshot.reservationArtifacts.map((artifact) => ({
      opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
      occupied: artifact.sessionSkeleton.sections.filter((section) => section.assignmentExerciseIds.length > 0)
        .map((section) => section.section),
    })), (entry) => String(entry.opportunityOrder)),
  };
}

export function buildFullProgramSignatureFamily(
  snapshot: FullPrescribedProgramSnapshot,
): FullProgramSignatureFamily {
  const objectives = objectiveSemantics(snapshot);
  const reservations = reservationSemantics(snapshot);
  const needs = needSemantics(snapshot);
  const assignments = assignmentSemantics(snapshot);
  const prescriptions = prescriptionSemantics(snapshot);
  const sequences = sequenceSemantics(snapshot);
  const ledger = ledgerSemantics(snapshot);
  const validation = snapshot.postPrescriptionWeekValidationResult;
  const supporting = assignments.filter((assignment) => ["preparation", "activation"].includes(assignment.role));
  const main = assignments.filter((assignment) => ["dominant_main", "capacity_main"].includes(assignment.role));
  const accessory = assignments.filter((assignment) => ["secondary_accessory", "direct_priority"].includes(assignment.role));
  const values = {
    horizon: {
      boundary: snapshot.normalizedWeekSourceSnapshot.horizonBoundary,
      opportunities: [...snapshot.normalizedWeekSourceSnapshot.opportunities]
        .sort((left, right) => left.order - right.order)
        .map((opportunity) => ({ order: opportunity.order, availabilityState: opportunity.availabilityState,
          executionState: opportunity.executionState, availableMinutes: opportunity.availableMinutes })),
    },
    programFramework: frameworkValue(snapshot),
    weeklyResponsibility: objectives,
    allocation: reservations.map((reservation) => ({ opportunityOrder: reservation.opportunityOrder,
      objectiveResponsibilities: reservation.objectiveResponsibilities })),
    reservation: reservations,
    sessionPurpose: snapshot.reservationArtifacts.map((artifact) => ({
      kind: artifact.sessionIntent.kind,
      primaryGoal: artifact.sessionIntent.primaryGoal,
      structuralCapacity: artifact.sessionIntent.structuralCapacity,
      availableMinutes: artifact.sessionIntent.availableMinutes,
    })),
    sessionNeed: needs,
    exerciseStructure: assignments,
    warmupActivation: supporting,
    mainWork: main,
    accessoryWork: accessory,
    sourceExposure: ledger.map((event) => ({ opportunityOrder: event.opportunityOrder, exerciseId: event.exerciseId,
      section: event.section, role: event.role, objectiveResponsibilities: event.objectiveResponsibilities })),
    prescriptionStructure: prescriptions,
    doseLane: ledger.map((event) => ({ exerciseId: event.exerciseId, blockPurposes: event.blockPurposes,
      doseModes: event.doseModes })),
    relationshipView: ledger.map((event) => ({ exerciseId: event.exerciseId, muscles: event.muscles,
      movementRoles: event.movementRoles, actionFunctions: event.actionFunctions, capacityLane: event.capacityLane,
      assessmentLane: event.assessmentLane, recoveryLane: event.recoveryLane })),
    sequence: sequences,
    durationFeasibility: {
      sessions: sequences.map((sequence) => ({ opportunityOrder: sequence.opportunityOrder, duration: sequence.duration })),
      week: validation.weeklyDurationView,
    },
    stressConcentration: {
      stress: ledger.map((event) => ({ exerciseId: event.exerciseId, stress: event.stress })),
      burden: validation.burdenVectors,
      concentration: validation.concentrationTraces,
    },
    spacing: validation.spacingTraces,
    unsupportedPolicy: { unsupportedScopes: sorted(validation.unsupportedScopes),
      unresolvedPolicies: sorted(validation.unresolvedPolicies) },
    gate13Realization: {
      status: validation.status,
      objectives: validation.objectiveRealizationTraces.map((trace) => ({
        purpose: trace.purpose,
        status: trace.status,
        prescribedFrequencyCount: trace.prescribedFrequencyCount,
        executablePrescribedFrequencyCount: trace.executablePrescribedFrequencyCount,
        minimumState: trace.minimumState,
        targetState: trace.targetState,
        softMaximumState: trace.softMaximumState,
        spacingState: trace.spacingState,
      })),
      completeWeekStatus: validation.completeWeekArgument.status,
    },
    completeAdaptiveProgram: {
      framework: frameworkValue(snapshot), objectives, reservations, needs, assignments, prescriptions, sequences, ledger,
      unsupportedScopes: sorted(validation.unsupportedScopes),
    },
  };
  return Object.freeze(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, signature(value)])) as
    unknown as FullProgramSignatureFamily);
}

type DimensionValues = Readonly<Record<FullProgramGate14DifferenceDimension, unknown>>;

export function buildFullProgramDimensionValues(
  signatures: FullProgramSignatureFamily,
): DimensionValues {
  const family = (key: keyof FullProgramSignatureFamily) => signatures[key].value;
  const values: DimensionValues = {
    program_horizon_structure: family("horizon"), prescribed_session_count: family("programFramework"),
    broad_session_framework: family("programFramework"), dominant_session_distribution: family("programFramework"),
    section_occupancy_pattern: family("programFramework"), final_weekly_objectives: family("weeklyResponsibility"),
    objective_priority_distribution: family("weeklyResponsibility"), objective_prescribed_frequency: family("gate13Realization"),
    objective_execution_feasibility: family("gate13Realization"), objective_realization_status: family("gate13Realization"),
    unsupported_policy_state: family("unsupportedPolicy"), session_responsibility_distribution: family("allocation"),
    session_need_distribution: family("sessionNeed"), selected_assignment_distribution: family("exerciseStructure"),
    exercise_identity_distribution: family("exerciseStructure"), anchor_distribution: family("exerciseStructure"),
    shared_coverage_distribution: family("exerciseStructure"), warmup_dependency_distribution: family("warmupActivation"),
    activation_dependency_distribution: family("warmupActivation"), main_work_distribution: family("mainWork"),
    accessory_distribution: family("accessoryWork"), cooldown_distribution: family("exerciseStructure"),
    source_event_distribution: family("sourceExposure"), dose_block_distribution: family("prescriptionStructure"),
    preparatory_block_distribution: family("prescriptionStructure"), developmental_block_distribution: family("prescriptionStructure"),
    technique_block_distribution: family("prescriptionStructure"), recovery_block_distribution: family("prescriptionStructure"),
    dose_mode_distribution: family("doseLane"), sets_distribution: family("prescriptionStructure"),
    reps_distribution: family("prescriptionStructure"), load_distribution: family("prescriptionStructure"),
    effort_distribution: family("prescriptionStructure"), range_distribution: family("prescriptionStructure"),
    support_distribution: family("prescriptionStructure"), side_distribution: family("prescriptionStructure"),
    tempo_distribution: family("prescriptionStructure"), rest_distribution: family("prescriptionStructure"),
    duration_distribution: family("durationFeasibility"), primary_muscle_distribution: family("relationshipView"),
    key_secondary_distribution: family("relationshipView"), direct_action_distribution: family("relationshipView"),
    movement_role_distribution: family("relationshipView"), capacity_lane_distribution: family("relationshipView"),
    assessment_lane_distribution: family("relationshipView"), recovery_lane_distribution: family("relationshipView"),
    final_sequence_distribution: family("sequence"), dependency_order_distribution: family("sequence"),
    transition_state_distribution: family("sequence"), duration_feasibility_distribution: family("durationFeasibility"),
    definitely_over_budget_distribution: family("durationFeasibility"), unknown_duration_distribution: family("durationFeasibility"),
    stress_exposure_distribution: family("stressConcentration"), burden_concentration_distribution: family("stressConcentration"),
    spacing_state_distribution: family("spacing"), program_label: null, split_label: null, scenario_id: null,
    display_order: null, explanation_prose: null, report_format: null,
  };
  return Object.freeze(values);
}

export function gateOwningFullProgramDimension(
  dimension: FullProgramGate14DifferenceDimension,
): CagtGateId {
  if (["program_label", "split_label", "scenario_id", "display_order", "explanation_prose", "report_format"].includes(dimension)) {
    return "gate_0_scenario_truth";
  }
  if (["final_weekly_objectives", "objective_priority_distribution", "objective_prescribed_frequency",
    "unsupported_policy_state"].includes(dimension)) return "gate_1_weekly_responsibility_truth";
  if (["program_horizon_structure", "prescribed_session_count", "broad_session_framework",
    "dominant_session_distribution", "section_occupancy_pattern", "session_responsibility_distribution"].includes(dimension)) {
    return "gate_2_whole_week_allocation_coverage";
  }
  if (["session_need_distribution", "warmup_dependency_distribution", "activation_dependency_distribution"].includes(dimension)) {
    return "gate_6_session_intent_truth";
  }
  if (["exercise_identity_distribution", "anchor_distribution", "shared_coverage_distribution"].includes(dimension)) {
    return "gate_7_candidate_intelligence_truth";
  }
  if (["selected_assignment_distribution", "main_work_distribution", "accessory_distribution",
    "cooldown_distribution"].includes(dimension)) return "gate_8_session_composition_truth";
  if (["source_event_distribution", "dose_block_distribution", "preparatory_block_distribution",
    "developmental_block_distribution", "technique_block_distribution", "recovery_block_distribution",
    "dose_mode_distribution", "sets_distribution", "reps_distribution", "load_distribution", "effort_distribution",
    "range_distribution", "support_distribution", "side_distribution", "tempo_distribution", "rest_distribution",
    "primary_muscle_distribution", "key_secondary_distribution", "direct_action_distribution",
    "movement_role_distribution", "capacity_lane_distribution", "assessment_lane_distribution",
    "recovery_lane_distribution"].includes(dimension)) return "gate_9_prescription_handoff_truth";
  if (["final_sequence_distribution", "dependency_order_distribution", "transition_state_distribution"].includes(dimension)) {
    return "gate_10_sequencing_duration_handoff_truth";
  }
  return "gate_13_post_prescription_weekly_validation";
}

export function diffFullProgramSignatures(
  baseline: FullProgramSignatureFamily,
  counterfactual: FullProgramSignatureFamily,
  observedNonmaterialDimensions: readonly FullProgramGate14DifferenceDimension[] = [],
): readonly FullProgramStructuredDifference[] {
  const left = buildFullProgramDimensionValues(baseline);
  const right = buildFullProgramDimensionValues(counterfactual);
  return Object.freeze(FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS.filter((dimension) =>
    observedNonmaterialDimensions.includes(dimension) || !semanticallyEqual(left[dimension], right[dimension]))
    .map((dimension) => Object.freeze({
      dimension,
      material: !FULL_PROGRAM_NONMATERIAL_DIMENSIONS.includes(dimension),
      earliestOwnerGate: gateOwningFullProgramDimension(dimension),
      baselineFingerprint: digest(left[dimension]),
      counterfactualFingerprint: digest(right[dimension]),
    })));
}
