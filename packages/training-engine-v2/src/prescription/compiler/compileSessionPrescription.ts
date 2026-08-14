import type { SessionExerciseAssignment } from "../../sessionComposer/contracts";
import { compilePrescriptionAssignment } from "./compilePrescriptionAssignment";
import type {
  CompiledPrescriptionSessionArgumentTrace,
  PrescriptionAssignmentCompilationResult,
  PrescriptionDurationUnknownComponent,
  PrescriptionSessionCompilationResult,
  PrescriptionSessionCompilerInput,
  PrescriptionSupportingWorkAggregate,
  ProductionExercisePrescriptionPlan,
} from "./contracts";
import { combinePrescriptionDurationIntervals } from "./durationInterval";
import { numericBounds, uniqueSorted } from "./utilities";

export function compileSessionPrescription(
  input: PrescriptionSessionCompilerInput,
): PrescriptionSessionCompilationResult {
  const handoffIds = input.handoff.assignments.map((entry) => entry.handoffId);
  const assignmentHandoffIds = input.sessionSkeleton.assignments.map(
    (entry) => entry.routinePrescriptionHandoffId,
  );
  const inputErrors = validateSessionInput(input, handoffIds, assignmentHandoffIds);
  const orderedHandoffIds = input.sessionSkeleton.assignments.map(
    (assignment) => assignment.routinePrescriptionHandoffId,
  );
  const assignmentResults = orderedHandoffIds.map((assignmentHandoffId) => {
    const context = input.contextByHandoffId[assignmentHandoffId];
    if (!context) {
      return missingContextResult(input, assignmentHandoffId);
    }
    return compilePrescriptionAssignment({
      ...input,
      assignmentHandoffId,
      context,
      continuityEvidence: input.continuityEvidenceByHandoffId[assignmentHandoffId] ?? null,
      priorRealizationEvidence: input.priorRealizationEvidenceByHandoffId[assignmentHandoffId] ?? null,
      revisionContext: input.revisionContextByHandoffId[assignmentHandoffId] ?? null,
    });
  });
  const plans = assignmentResults.flatMap((result) => result.plan ? [result.plan] : []);
  const sourceExposureEvents = assignmentResults.flatMap((result) =>
    result.sourceExposureEvent ? [result.sourceExposureEvent] : []
  );
  const supportingWorkAggregate = buildSupportingWorkAggregate({ input, plans });
  const completeSessionArgument = buildCompleteSessionArgument({
    input,
    results: assignmentResults,
    plans,
    inputErrors,
    supporting: supportingWorkAggregate,
  });
  const sessionDurationInterval = combinePrescriptionDurationIntervals({
    intervals: plans.map((plan) => plan.durationInterval),
    availableSeconds: input.sessionIntent.availableMinutes * 60,
    includeSequencingUnknowns: true,
  });
  const status = inputErrors.length > 0
    ? "invalid_session_handoff" as const
    : assignmentResults.some((result) => result.status === "blocked_by_training_readiness")
      ? "blocked_by_training_readiness" as const
      : assignmentResults.every((result) => result.status === "compiled") &&
          completeSessionArgument.status === "coherent"
        ? "compiled" as const
        : "incomplete" as const;
  return {
    status,
    assignmentResults,
    plans,
    sourceExposureEvents,
    sessionDurationInterval,
    completeSessionArgument,
    supportingWorkAggregate,
    authority: "PRODUCTION_KERNEL_AUTHORITY",
  };
}

function validateSessionInput(
  input: PrescriptionSessionCompilerInput,
  handoffIds: readonly string[],
  assignmentHandoffIds: readonly string[],
): readonly string[] {
  const reasons: string[] = [];
  if (input.sessionIntent.id !== input.sessionSkeleton.sessionIntentId) reasons.push("SESSION_INTENT_SKELETON_ID_MISMATCH");
  if (input.sessionIntent.id !== input.handoff.sessionIntentId) reasons.push("SESSION_INTENT_HANDOFF_ID_MISMATCH");
  if (new Set(handoffIds).size !== handoffIds.length) reasons.push("DUPLICATE_HANDOFF_ASSIGNMENT");
  if (new Set(assignmentHandoffIds).size !== assignmentHandoffIds.length) reasons.push("DUPLICATE_SKELETON_ASSIGNMENT");
  const handoffSet = new Set(handoffIds);
  const assignmentSet = new Set(assignmentHandoffIds);
  if (assignmentHandoffIds.some((id) => !handoffSet.has(id))) reasons.push("MISSING_HANDOFF_ASSIGNMENT");
  if (handoffIds.some((id) => !assignmentSet.has(id))) reasons.push("POLICY_MAY_NOT_REMOVE_ASSIGNMENT");
  return uniqueSorted(reasons);
}

function missingContextResult(
  input: PrescriptionSessionCompilerInput,
  assignmentHandoffId: string,
): PrescriptionAssignmentCompilationResult {
  const assignment = input.sessionSkeleton.assignments.find((entry) =>
    entry.routinePrescriptionHandoffId === assignmentHandoffId
  ) ?? null;
  const handoffAssignment = input.handoff.assignments.find((entry) =>
    entry.handoffId === assignmentHandoffId
  ) ?? null;
  return {
    status: "invalid_source_exposure_context",
    assignment,
    handoffAssignment,
    sourceExposureEvent: null,
    equipmentRealization: null,
    plan: null,
    revisionLedger: null,
    recompositionRequirement: null,
    decisionTrace: {
      trainingReadinessTrace: input.trainingReadiness,
      policyResolutionTrace: [],
      selectedRules: [],
      rejectedRules: [],
      overriddenRules: [],
      conflictTrace: [],
      legalModeTrace: [],
      blockStructureTrace: [],
      loadTrace: null,
      effortTrace: [],
      modifierTrace: [],
      timingTrace: [],
      restPlacementTrace: [],
      durationTrace: [],
      continuityTrace: [],
      unresolvedRequirementIds: [],
      finalReasonCodes: ["MISSING_ASSIGNMENT_COMPILATION_CONTEXT"],
    },
    authority: "PRODUCTION_KERNEL_AUTHORITY",
  };
}

function buildSupportingWorkAggregate(input: {
  readonly input: PrescriptionSessionCompilerInput;
  readonly plans: readonly ProductionExercisePrescriptionPlan[];
}): PrescriptionSupportingWorkAggregate {
  const assignmentByHandoff = new Map(
    input.input.sessionSkeleton.assignments.map((entry) => [
      entry.routinePrescriptionHandoffId,
      entry,
    ]),
  );
  const supportingPlans = input.plans.filter((plan) => {
    const assignment = assignmentForPlan(plan, input.input.sessionSkeleton.assignments);
    return assignment?.section === "warmup" || assignment?.section === "activation";
  });
  const supportingTargets = supportingPlans.flatMap((plan) =>
    plan.doseBlocks.flatMap((block) => {
      const dose = block.dose;
      if (dose.mode === "breath_cycles") return [numericBounds(dose.rounds)];
      if (dose.mode === "distance_carry" || dose.mode === "timed_carry") return [numericBounds(dose.trips)];
      if ("sets" in dose) return [numericBounds(dose.sets)];
      return [];
    })
  ).filter((bounds): bounds is readonly [number, number] => bounds !== null);
  const dependencyUse = new Map<string, string[]>();
  const sharedSupportingAssignmentIds: string[] = [];
  for (const handoff of input.input.handoff.assignments.filter((entry) =>
    entry.section === "warmup" || entry.section === "activation"
  )) {
    const assignment = assignmentByHandoff.get(handoff.handoffId);
    if (!assignment) continue;
    const dependencies = input.input.sessionIntent.needs
      .filter((need) => assignment.satisfiedNeedIds.includes(need.id))
      .flatMap((need) => need.dependencies)
      .filter((dependency) =>
        dependency.targetNeedIds.some((id) =>
          input.input.sessionIntent.needs.some((need) => need.id === id)
        ) || dependency.targetExerciseIds.some((id) =>
          input.input.sessionSkeleton.assignments.some((entry) => entry.exerciseId === id)
        )
      );
    if (dependencies.length > 1 || dependencies.some((entry) => entry.targetNeedIds.length > 1)) {
      sharedSupportingAssignmentIds.push(handoff.handoffId);
    }
    for (const dependency of dependencies) {
      const existing = dependencyUse.get(dependency.dependencyId) ?? [];
      dependencyUse.set(dependency.dependencyId, [...existing, handoff.handoffId]);
    }
  }
  const duplicateDependencyIds = [...dependencyUse.entries()]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([id]) => id)
    .sort();
  const preparationDependenciesCovered = supportDependenciesCovered(
    input.input,
    "warmup",
  );
  const mainDevelopmentalBlockCount = input.plans.reduce((count, plan) => {
    const assignment = assignmentForPlan(plan, input.input.sessionSkeleton.assignments);
    return count + (assignment?.section === "main"
      ? plan.doseBlocks.filter((block) => block.purpose === "developmental_work").length
      : 0);
  }, 0);
  const orphanSupportingCount = ["warmup", "activation"].reduce(
    (count, section) => count + (supportDependenciesCovered(
      input.input,
      section as "warmup" | "activation",
    ) ? 0 : input.input.sessionSkeleton.assignments.filter((entry) => entry.section === section).length),
    0,
  );
  const missingRequired = requiredPreparationMissing(input.input) ? 1 : 0;
  const mainMissing = input.input.sessionSkeleton.assignments.some((entry) => entry.section === "main") &&
    mainDevelopmentalBlockCount === 0 ? 1 : 0;
  return {
    warmupAssignmentCount: input.input.sessionSkeleton.assignments.filter((entry) => entry.section === "warmup").length,
    activationAssignmentCount: input.input.sessionSkeleton.assignments.filter((entry) => entry.section === "activation").length,
    preparationBlockCount: supportingPlans.flatMap((plan) => plan.doseBlocks).filter((block) => block.purpose === "preparatory_acclimation" || block.purpose === "technique_quality_work").length,
    activationBlockCount: input.plans.filter((plan) => assignmentForPlan(plan, input.input.sessionSkeleton.assignments)?.section === "activation").flatMap((plan) => plan.doseBlocks).length,
    totalSupportingSetRoundTripRange: [
      supportingTargets.reduce((total, bounds) => total + bounds[0], 0),
      supportingTargets.reduce((total, bounds) => total + bounds[1], 0),
    ],
    unresolvedDurationComponents: uniqueSorted(
      supportingPlans.flatMap((plan) => plan.durationInterval.unknownComponents),
    ) as readonly PrescriptionDurationUnknownComponent[],
    mainDevelopmentalBlockCount,
    mainWorkRemainsPresent: mainDevelopmentalBlockCount > 0,
    preparationDependenciesCovered,
    duplicateDependencyIds,
    sharedSupportingAssignmentIds: uniqueSorted(sharedSupportingAssignmentIds),
    structuralContradictionCount: orphanSupportingCount + missingRequired + mainMissing,
  };
}

function buildCompleteSessionArgument(input: {
  readonly input: PrescriptionSessionCompilerInput;
  readonly results: readonly PrescriptionAssignmentCompilationResult[];
  readonly plans: readonly ProductionExercisePrescriptionPlan[];
  readonly inputErrors: readonly string[];
  readonly supporting: PrescriptionSupportingWorkAggregate;
}): CompiledPrescriptionSessionArgumentTrace {
  const assignments = input.input.sessionSkeleton.assignments;
  const assignmentIds = assignments.map((entry) => entry.routinePrescriptionHandoffId);
  const resultIds = input.results.flatMap((entry) => entry.handoffAssignment?.handoffId ?? []);
  const planIds = input.plans.map((plan) => plan.sourceExposureEvent.sessionAssignmentId);
  const eventIds = input.results.flatMap((entry) =>
    entry.sourceExposureEvent?.sourceExposureEventId ?? []
  );
  const everyPlanMaps = planIds.every((id) => assignmentIds.includes(id)) &&
    new Set(planIds).size === planIds.length;
  const everyAssignmentResult = assignments.every((assignment) =>
    resultIds.filter((id) => id === assignment.routinePrescriptionHandoffId).length === 1
  );
  const policyAdded = planIds.some((id) => !assignmentIds.includes(id));
  const policyRemoved = input.results.every((result) => result.status === "compiled") &&
    assignmentIds.some((id) => !planIds.includes(id));
  const duplicateAssignment = new Set(assignmentIds).size !== assignmentIds.length;
  const warmupCovered = supportDependenciesCovered(input.input, "warmup");
  const activationCovered = supportDependenciesCovered(input.input, "activation");
  const requiredPreparationRetained = !requiredPreparationMissing(input.input);
  const accessoriesRetained = assignments.filter((assignment) => assignment.section === "accessory")
    .every((assignment) => input.results.some((result) =>
      result.handoffAssignment?.handoffId === assignment.routinePrescriptionHandoffId
    ));
  const cooldownExplicit = input.plans
    .filter((plan) => assignmentForPlan(plan, assignments)?.section === "cooldown")
    .every((plan) => assignments.some((assignment) =>
      assignment.section === "cooldown" &&
      assignment.exerciseId === plan.exerciseId
    ));
  const unresolvedRequirementIds = uniqueSorted(input.results.flatMap((result) =>
    result.decisionTrace.unresolvedRequirementIds
  ));
  let status: CompiledPrescriptionSessionArgumentTrace["status"] = "coherent";
  if (input.inputErrors.length > 0) status = "invalid_session_handoff";
  else if (input.results.some((result) => result.status === "blocked_by_training_readiness")) status = "blocked_by_training_readiness";
  else if (duplicateAssignment) status = "incoherent_duplicate_assignment";
  else if (policyAdded || policyRemoved || !everyPlanMaps) status = "incoherent_policy_created_structure";
  else if (!warmupCovered || !activationCovered) status = "incoherent_orphan_preparation";
  else if (!requiredPreparationRetained) status = "incoherent_missing_required_preparation";
  else if (assignments.some((entry) => entry.section === "main") && !input.supporting.mainWorkRemainsPresent) status = "incoherent_main_purpose_lost";
  else if (!accessoriesRetained) status = "incoherent_accessory_purpose_lost";
  else if (unresolvedRequirementIds.length > 0 || input.results.some((result) => result.status !== "compiled")) status = "incomplete_due_to_unresolved_requirement";
  return {
    status,
    sessionExistsReasonCodes: ["AUTHORITATIVE_SESSION_INTENT", "VALID_SESSION_SKELETON_ASSIGNMENTS"],
    everyPlanMapsToOneSelectedAssignment: everyPlanMaps,
    everyAssignmentHasOneCompilationResult: everyAssignmentResult,
    warmupPlansServeActiveDependencies: warmupCovered,
    activationPlansServeActiveDependencies: activationCovered,
    requiredPreparationDependenciesRetained: requiredPreparationRetained,
    supportingWorkBoundedCollectively: input.supporting.structuralContradictionCount === 0,
    developmentalMainWorkPresent: input.supporting.mainWorkRemainsPresent,
    prescriptionErasedUpstreamPurpose: policyRemoved,
    accessoriesRetainAllocatedPurpose: accessoriesRetained,
    cooldownExplicitlyAllocatedOrAbsent: cooldownExplicit,
    policyAddedStructure: policyAdded,
    policyRemovedStructure: policyRemoved,
    sourceEventsUnique: new Set(eventIds).size === eventIds.length &&
      eventIds.length === input.results.filter((result) => result.sourceExposureEvent).length,
    unresolvedRequirementIds,
    finalDurationSequencingDependent: true,
    reasonCodes: uniqueSorted([
      ...input.inputErrors,
      ...(status === "coherent" ? ["COMPLETE_SESSION_ARGUMENT_COHERENT"] : [status.toUpperCase()]),
    ]),
  };
}

function supportDependenciesCovered(
  input: PrescriptionSessionCompilerInput,
  section: "warmup" | "activation",
): boolean {
  const supporting = input.sessionSkeleton.assignments.filter((entry) => entry.section === section);
  if (supporting.length === 0) return true;
  const activeNeedIds = new Set(input.sessionSkeleton.assignments.flatMap((entry) => entry.satisfiedNeedIds));
  const activeExerciseIds = new Set(input.sessionSkeleton.assignments.map((entry) => entry.exerciseId));
  return supporting.every((assignment) => {
    const needs = input.sessionIntent.needs.filter((need) =>
      assignment.satisfiedNeedIds.includes(need.id)
    );
    return needs.some((need) => need.dependencies.some((dependency) =>
      dependency.targetNeedIds.some((id) => activeNeedIds.has(id)) ||
      dependency.targetExerciseIds.some((id) => activeExerciseIds.has(id))
    )) || input.handoff.assignments.find((entry) =>
      entry.handoffId === assignment.routinePrescriptionHandoffId
    )?.orderingConstraints.length !== 0;
  });
}

function requiredPreparationMissing(input: PrescriptionSessionCompilerInput): boolean {
  const assignedNeedIds = new Set(input.sessionSkeleton.assignments.flatMap((entry) => entry.satisfiedNeedIds));
  return input.sessionIntent.needs.some((need) =>
    need.section === "warmup" && need.priority === "required" && !assignedNeedIds.has(need.id)
  );
}

function assignmentForPlan(
  plan: ProductionExercisePrescriptionPlan,
  assignments: readonly SessionExerciseAssignment[],
): SessionExerciseAssignment | null {
  return assignments.find((assignment) =>
    assignment.routinePrescriptionHandoffId === plan.sourceExposureEvent.sessionAssignmentId
  ) ?? null;
}
