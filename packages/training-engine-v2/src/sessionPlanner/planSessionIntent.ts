import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { SessionFatigueSignal, SessionNeed } from "../domain/session";
import type {
  PlannerAvailabilityTrace,
  PlannerContextOwnershipFinding,
  PlannerValidationFinding,
  SessionIntentPlannerDecisionTrace,
  SessionIntentPlannerInput,
  SessionIntentPlanningResult,
  SessionIntentPlanningStatus,
} from "./contracts";
import { deriveSessionContinuityEvidence } from "./continuityEvidence";
import { derivePreparationNeeds } from "./derivePreparationNeeds";
import { mergeEquivalentNeeds } from "./mergeNeeds";
import { normalizeAllocatedObjectives } from "./normalizeObjectives";
import { validateSessionAllocationDirective } from "./validateDirective";

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function allPainRefs(state: PainAndInjuryState): readonly string[] {
  return unique([
    ...state.historicalInjuries.map((entry) => entry.id),
    ...state.historicalSensitivities.map((entry) => entry.id),
    ...state.currentDiscomforts.map((entry) => entry.id),
    ...state.moderatePain.map((entry) => entry.id),
    ...state.acuteSeverePain.map((entry) => entry.id),
    ...state.hardContraindications.map((entry) => entry.id),
    ...state.personalExerciseBlocks.map((entry) => entry.id),
  ]);
}

function painRefsForNeed(state: PainAndInjuryState, need: SessionNeed): readonly string[] {
  const regions = need.selection.targetBodyRegions;
  if (regions.length === 0) return [];
  return unique([
    ...state.historicalInjuries.filter((entry) => regions.includes(entry.region)).map((entry) => entry.id),
    ...state.historicalSensitivities.filter((entry) => regions.includes(entry.region)).map((entry) => entry.id),
    ...state.currentDiscomforts.filter((entry) => regions.includes(entry.region)).map((entry) => entry.id),
    ...state.moderatePain.filter((entry) => regions.includes(entry.region)).map((entry) => entry.id),
    ...state.acuteSeverePain.filter((entry) => regions.includes(entry.region)).map((entry) => entry.id),
    ...state.hardContraindications.filter((entry) => entry.region && regions.includes(entry.region)).map((entry) => entry.id),
  ]);
}

function fatigueSignals(input: SessionIntentPlannerInput): readonly SessionFatigueSignal[] {
  const signals: SessionFatigueSignal[] = [];
  if (input.history.fatigueState.overall === "low") signals.push("fresh");
  if (input.history.fatigueState.overall === "moderate" || input.history.fatigueState.overall === "high") {
    signals.push("systemic_fatigue");
  }
  if (Object.values(input.history.fatigueState.byMovementRole).some((value) => value === "high")) {
    signals.push("local_fatigue");
  }
  return unique(signals);
}

function decisionTrace(input: SessionIntentPlannerInput): SessionIntentPlannerDecisionTrace {
  return {
    plannerId: "session_intent_planner_v1",
    directiveId: input.directive?.id ?? null,
    evaluationAsOf: input.evaluationAsOf,
    rulesApplied: [
      "explicit_allocation_required",
      "fixed_objective_kind_mapping",
      "typed_causal_preparation_need_derivation",
      "assessment_structured_relevance_enrichment",
      "equivalent_need_truth_merge",
      "active_need_continuity_derivation",
      "pain_context_never_creates_needs",
      "fatigue_never_erases_allocation",
    ],
    factsConsumed: [
      "SessionAllocationDirective.allocatedObjectives",
      "AllocatedSessionObjective.preparationDependencies",
      "SessionAllocationDirective.outcomeGoal",
      "SessionAllocationDirective.programmingContextModes",
      "currentSessionAvailability",
      "currentEquipment",
      "AssessmentState.signals",
      "PainAndInjuryState",
      "TrainingSafetyState",
      "TrainingHistory.exerciseHistory",
      "TrainingResponseHistory.observations",
    ],
    inertProseFields: [
      "AllocatedSessionObjective.explanation",
      "AssessmentSignal.description",
      "PhaseIntent.name",
      "PhaseIntent.developedQualities",
    ],
    phaseContextOnlyFields: [
      "PhaseIntent.primaryGoal",
      "PhaseIntent.priorityMuscles",
      "PhaseIntent.capabilityExpectation",
      "PhaseIntent.progressionIntent",
      "PhaseIntent.advancementCriteria",
    ],
    legacyFieldsIgnored: [
      "WeeklyIntent.movementPriority",
      "WeeklyIntent.musclePriority",
      "WeeklyIntent.directMuscleVolume",
      "SessionKind legacy goal values",
    ],
  };
}

function contextOwnership(input: SessionIntentPlannerInput): readonly PlannerContextOwnershipFinding[] {
  return [
    { factId: "session_outcome_goal", canonicalOwner: "session_allocation_directive", receiver: "session_intent_planner", consequence: "selects Candidate goal context", duplicateConsumption: false },
    { factId: "programming_context_modes", canonicalOwner: "session_allocation_directive", receiver: "session_intent_planner", consequence: "preserved as context without becoming a goal", duplicateConsumption: false },
    { factId: "current_session_availability", canonicalOwner: input.directive?.currentSessionAvailability ? "session_allocation_directive" : "athlete_profile_default", receiver: "session_intent_planner", consequence: "sets capacity and duration handoff only", duplicateConsumption: false },
    { factId: "current_session_equipment", canonicalOwner: "current_equipment_snapshot", receiver: "candidate_and_continuity", consequence: "gates candidates and classifies continuity equipment loss", duplicateConsumption: false },
    { factId: "assessment_enrichment", canonicalOwner: "assessment_state", receiver: "session_intent_planner", consequence: "may add one dependent preferred need per relevant structured cluster", duplicateConsumption: false },
    { factId: "preparation_dependencies", canonicalOwner: "session_allocation_directive", receiver: "session_intent_planner", consequence: "may add a typed shared or assignment-local preparation need without selecting an exercise identity", duplicateConsumption: false },
    { factId: "pain_and_training_safety", canonicalOwner: "pain_and_safety_domains", receiver: "planner_candidate_and_readiness", consequence: "may suppress derived preparation and gate candidates or readiness but never creates session needs", duplicateConsumption: false },
    { factId: "schedule_and_missed_sessions", canonicalOwner: "future_week_composer", receiver: "trace_only", consequence: "cannot mutate a session allocation", duplicateConsumption: false },
  ];
}

function emptyResult(input: SessionIntentPlannerInput, status: SessionIntentPlanningStatus,
  validationFindings: readonly PlannerValidationFinding[] = []): SessionIntentPlanningResult {
  return {
    status,
    trainingReadiness: buildTrainingReadinessTrace({
      trainingSafety: input.trainingSafety,
      acuteSeverePain: input.painAndInjury.acuteSeverePain,
    }),
    sessionIntent: null,
    includedNeedTraces: [],
    omittedObjectiveTraces: [],
    mergedNeedTraces: [],
    assessmentEnrichmentTraces: [],
    preparationNeedTraces: [],
    continuityTraces: [],
    contextOwnershipFindings: contextOwnership(input),
    unresolvedContextFindings: (input.directive?.unresolvedContextObservations ?? []).map((observation) => ({
      observation,
      code: "UNOWNED_CONTEXT_REQUIRES_REVIEW",
    })),
    validationFindings,
    availabilityTrace: null,
    decisionTrace: decisionTrace(input),
  };
}

function statusForErrors(findings: readonly PlannerValidationFinding[]): SessionIntentPlanningStatus {
  const codes = findings.filter((finding) => finding.severity === "error").map((finding) => finding.code);
  if (codes.some((code) => code.includes("contradictory") || code.startsWith("duplicate_"))) {
    return "contradictory_directive";
  }
  if (codes.some((code) => code.startsWith("unsupported_"))) return "unsupported_context";
  return "under_specified";
}

export function planSessionIntent(input: SessionIntentPlannerInput): SessionIntentPlanningResult {
  if (!input.directive) return emptyResult(input, "requires_week_or_explicit_session_allocation");
  const directive = input.directive;
  const validationFindings = [...validateSessionAllocationDirective(input)];
  if (input.currentEquipment.provenance === "unknown" || !input.currentEquipment.sourceRef.trim()) {
    validationFindings.push({ severity: "error", code: "under_specified_current_equipment", sourceId: directive.id,
      owner: "session_intent_planner", message: "A provenance-bearing current-session equipment snapshot is required." });
  }
  if (directive.currentSessionAvailability?.availableMinutes === null ||
      directive.currentSessionAvailability?.provenance === "unknown") {
    validationFindings.push({ severity: "error", code: "under_specified_current_availability", sourceId: directive.id,
      owner: "session_intent_planner", message: "Current-session availability must resolve to explicit minutes and provenance." });
  }
  if (directive.weekReallocationEvidenceRefs.length > 0) {
    return emptyResult(input, "requires_week_reallocation", validationFindings);
  }
  if (directive.unresolvedContextObservations.some((observation) => observation.blocksPlanning)) {
    return emptyResult(input, "unsupported_context", validationFindings);
  }
  if (validationFindings.some((finding) => finding.severity === "error")) {
    return emptyResult(input, statusForErrors(validationFindings), validationFindings);
  }

  const availability = directive.currentSessionAvailability ?? {
    availableMinutes: input.athlete.availability.minutesPerSession,
    structuralCapacity: "standard" as const,
    provenance: "profile_default" as const,
    sourceRef: `AthleteProfile:${input.athlete.id}:availability.minutesPerSession`,
  };
  const availabilityTrace: PlannerAvailabilityTrace = {
    availableMinutes: availability.availableMinutes!,
    structuralCapacity: availability.structuralCapacity,
    provenance: availability.provenance,
    sourceRef: availability.sourceRef,
    profileDefaultUsed: !directive.currentSessionAvailability,
  };
  const objectiveResult = normalizeAllocatedObjectives({
    directiveId: directive.id,
    objectives: directive.allocatedObjectives,
    capacity: availability.structuralCapacity,
  });
  const preparation = derivePreparationNeeds({
    assessment: input.assessment,
    activeNeeds: objectiveResult.needs,
    explicitDependencies: objectiveResult.preparationDependencies,
    athlete: input.athlete,
    painAndInjury: input.painAndInjury,
    trainingSafety: input.trainingSafety,
    equipment: input.currentEquipment.capabilities,
    history: input.history,
    availableMinutes: availability.availableMinutes!,
    capacity: availability.structuralCapacity,
    directiveId: directive.id,
  });
  const painAnnotated = [...objectiveResult.needs, ...preparation.needs].map((entry) => ({
    ...entry,
    need: { ...entry.need, relevantPainResponseRequirementRefs: painRefsForNeed(input.painAndInjury, entry.need) },
  }));
  const merged = mergeEquivalentNeeds(painAnnotated);
  const continuity = deriveSessionContinuityEvidence({
    activeNeeds: merged.needs,
    history: input.history,
    responses: input.trainingResponseHistory,
    equipment: input.currentEquipment.capabilities,
    painAndInjury: input.painAndInjury,
  });
  const unresolvedContextFindings = directive.unresolvedContextObservations.map((observation) => ({
    observation,
    code: "UNOWNED_CONTEXT_REQUIRES_REVIEW" as const,
  }));
  return {
    status: "planned",
    trainingReadiness: buildTrainingReadinessTrace({
      trainingSafety: input.trainingSafety,
      acuteSeverePain: input.painAndInjury.acuteSeverePain,
    }),
    sessionIntent: {
      id: `${directive.id}:session-intent`,
      athleteId: input.athlete.id,
      kind: "ordinary_training",
      phaseIntent: input.phaseIntent,
      primaryGoal: directive.outcomeGoal!,
      outcomeGoal: directive.outcomeGoal!,
      programmingContextModes: [...directive.programmingContextModes].sort(),
      needs: merged.needs,
      structuralCapacity: availability.structuralCapacity,
      availableMinutes: availability.availableMinutes!,
      assessmentContextRefs: input.assessment.signals.map((signal) => signal.id).sort(),
      painResponseContextRefs: allPainRefs(input.painAndInjury),
      fatigueContext: fatigueSignals(input),
      continuityEvidence: continuity.evidence,
      plannerSourceTrace: {
        plannerId: "session_intent_planner_v1",
        sourceRefs: unique([directive.id, directive.sourceTrace.owner, ...directive.sourceTrace.sourceRefs]),
      },
      unresolvedWeeklyContextRefs: unique([
        ...directive.unresolvedWeeklyContextRefs,
        ...directive.neighboringSessionContextRefs,
      ]),
    },
    includedNeedTraces: objectiveResult.traces,
    omittedObjectiveTraces: [],
    mergedNeedTraces: merged.traces,
    assessmentEnrichmentTraces: preparation.assessmentTraces,
    preparationNeedTraces: preparation.traces,
    continuityTraces: continuity.traces,
    contextOwnershipFindings: contextOwnership(input),
    unresolvedContextFindings,
    validationFindings,
    availabilityTrace,
    decisionTrace: decisionTrace(input),
  };
}
