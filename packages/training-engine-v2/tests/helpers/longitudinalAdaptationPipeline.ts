import type { PhaseId } from "../../src/domain/phase";
import type { ProgressionAxis } from "../../src/domain/progression";
import {
  exactBreathCycles,
  exactCount,
  exactMetres,
  exactSeconds,
  exactSteps,
  type ExerciseDose,
  type ExerciseDoseMode,
} from "../../src/prescription/dose";
import {
  evaluatePhaseContinuity,
  type ProductionPhaseContinuityResult,
  type ProductionPhaseProgramSnapshot,
} from "../../src/phaseContinuity";
import {
  LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
  LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  type CompletedExposureOutcomeLedger,
  type CompletedExposureOutcomeLedgerEntry,
  type LongitudinalAdaptationActionDirective,
  type LongitudinalAdaptationApplicationCandidate,
  type LongitudinalAdaptationGate16Input,
  type LongitudinalAdaptationStateRevision,
  type LongitudinalAdaptationTarget,
  type LongitudinalHoldoutDescriptor,
  type LongitudinalOutcomeSignal,
  type LongitudinalOutcomeSourceRecord,
  type LongitudinalState,
} from "../../src/longitudinalAdaptation/designContracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5 } from "../cagt/effectiveAuthorityRegistryV5";
import {
  deriveLongitudinalStateId,
  deriveLongitudinalStateRevisionId,
  deriveLongitudinalThreadId,
} from "../cagt/longitudinalAdaptationEvidence";
import { runLongitudinalAdaptationGate16 } from "../cagt/longitudinalAdaptationGate16";
import { digest } from "../cagt/signatures";
import { adaptGate15InputToProduction } from "./productionPhaseContinuityAdapter";
import { buildPhaseContinuityGate15Input } from "./phaseContinuityPipeline";

export const LONGITUDINAL_EVALUATION_TIME = "2026-08-14T18:00:00-04:00" as const;
const WINDOW_START = "2026-07-01T00:00:00-04:00";

const phaseCache = new Map<PhaseId, {
  readonly snapshot: ProductionPhaseProgramSnapshot;
  readonly result: ProductionPhaseContinuityResult;
  readonly safety: LongitudinalAdaptationGate16Input["trainingSafetyTrace"];
}>();

function phaseTruth(phaseId: PhaseId) {
  const cached = phaseCache.get(phaseId);
  if (cached) return cached;
  const design = buildPhaseContinuityGate15Input({
    caseId: `longitudinal-current-${phaseId}`,
    currentPhaseId: phaseId,
    targetPhaseId: phaseId,
    transitionKind: "stay",
    evidenceMode: "missing",
    evaluationTime: LONGITUDINAL_EVALUATION_TIME,
  });
  const input = adaptGate15InputToProduction(design);
  const value = Object.freeze({ snapshot: input.currentProgramSnapshot,
    result: evaluatePhaseContinuity(input), safety: input.trainingSafetyTrace });
  phaseCache.set(phaseId, value);
  return value;
}

function actualDose(mode: ExerciseDoseMode): ExerciseDose {
  switch (mode) {
    case "repetition_sets":
      return Object.freeze({ mode, sets: exactCount(3), repetitions: exactCount(8) });
    case "timed_hold":
      return Object.freeze({ mode, sets: exactCount(3), duration: exactSeconds(30) });
    case "breath_cycles":
      return Object.freeze({ mode, rounds: exactCount(3), breathCycles: exactBreathCycles(5) });
    case "distance_carry":
      return Object.freeze({ mode, trips: exactCount(3), distancePerTrip: exactMetres(20),
        gaitControlStandard: "observed-controlled" });
    case "timed_carry":
      return Object.freeze({ mode, trips: exactCount(3), durationPerTrip: exactSeconds(30),
        gaitControlStandard: "observed-controlled" });
    case "step_march":
      return Object.freeze({ mode, stationary: true, sets: exactCount(3), steps: exactSteps(20),
        marchControlStandard: "observed-controlled" });
    case "step_sets":
      return Object.freeze({ mode, sets: exactCount(3), steps: exactSteps(8),
        stepCountInterpretation: "observed-total-steps" });
  }
}

function signals(mode: string): readonly LongitudinalOutcomeSignal[] {
  const values: Readonly<Record<string, readonly LongitudinalOutcomeSignal[]>> = {
    productive: ["productive_completion", "appropriate_challenge", "target_met", "quality_met",
      "tolerated_response", "recovery_adequate"],
    isolated: ["first_completed_exposure", "isolated_success", "target_met", "quality_met",
      "tolerated_response"],
    mixed: ["target_partially_met", "mixed_evidence", "recovery_unknown"],
    progress: ["repeated_success", "target_met", "quality_met", "tolerated_response",
      "recovery_adequate", "progression_ready"],
    progress_conflict: ["repeated_success", "target_met", "quality_met", "tolerated_response",
      "recovery_adequate", "progression_ready"],
    modify: ["limited_response", "target_partially_met", "prescription_review_attempted"],
    regress: ["repeated_target_failure", "target_failed", "quality_not_met"],
    replacement: ["repeated_adverse_response", "replacement_consideration",
      "prescription_review_attempted"],
    successful_reexposure: ["adverse_response", "successful_reexposure", "productive_completion",
      "tolerated_response"],
    rotation: ["plateau", "rotation_preference", "equivalent_candidate_pool"],
    week_review: ["adherence_constraint", "week_reallocation_aggregate"],
    deload_review: ["recovery_concern", "deload_review_aggregate"],
    phase_review: ["phase_review_requested"],
    safety: ["safety_block", "external_review_required"],
  };
  return Object.freeze([...(values[mode] ?? values.productive)]);
}

function isRepeated(mode: string): boolean {
  return ["progress", "progress_conflict", "regress", "replacement", "rotation", "week_review",
    "deload_review", "successful_reexposure"].includes(mode);
}

function axisForMode(mode: ExerciseDoseMode): ProgressionAxis {
  if (mode === "repetition_sets") return "load";
  if (mode === "timed_hold" || mode === "timed_carry") return "duration";
  if (mode === "breath_cycles") return "breath_cycles";
  if (mode === "distance_carry") return "distance";
  return "steps";
}

function stateForMode(mode: string): LongitudinalState {
  const values: Readonly<Record<string, LongitudinalState>> = {
    productive: "stable_appropriate_challenge", isolated: "first_or_isolated_success",
    mixed: "mixed_or_conflicting", progress: "repeated_success", progress_conflict: "repeated_success",
    modify: "exact_realization_limited", regress: "repeated_target_failure",
    replacement: "adverse_across_related_realizations", successful_reexposure: "successful_reexposure",
    rotation: "stable_but_plateaued", week_review: "adherence_constraint",
    deload_review: "recovery_concern", phase_review: "productive_continuity", safety: "safety_blocked",
  };
  return values[mode] ?? "productive_continuity";
}

function ledgerEntry(input: {
  readonly descriptor: LongitudinalHoldoutDescriptor;
  readonly snapshot: ProductionPhaseProgramSnapshot;
  readonly target: LongitudinalAdaptationTarget;
  readonly index: number;
}): CompletedExposureOutcomeLedgerEntry {
  const prescription = input.snapshot.finalPrescriptionRefs[0];
  const sequence = input.snapshot.finalSequenceRefs[0];
  if (!prescription || !sequence) throw new Error("LONGITUDINAL_UPSTREAM_REFS_REQUIRED");
  const suffix = `${input.descriptor.scenarioId}:${input.index + 1}`;
  const performanceId = `performance:${suffix}`;
  const responseId = `response:${suffix}`;
  return Object.freeze({ outcomeEntryId: `outcome:${suffix}`, athleteId: input.snapshot.athleteId,
    sourceExposureEventId: `exposure:${suffix}`, originalAssignmentId: input.target.assignmentId ?? `assignment:${suffix}`,
    originalExerciseId: input.descriptor.exerciseId, realizedExerciseId: input.descriptor.exerciseId,
    prescriptionId: prescription.prescriptionId, finalPrescriptionRevisionId: prescription.revisionId,
    sequencePlanId: sequence.sequencePlanId, finalSequenceRevisionId: sequence.revisionId,
    plannedDoseReference: `planned-dose:${prescription.prescriptionId}`, actualPerformanceRecordId: performanceId,
    completionStatus: input.descriptor.evidenceMode === "regress" ? "target_not_met" : "completed_as_planned",
    actualDose: actualDose(input.descriptor.doseMode), actualDoseSource: "independently_observed",
    actualTiming: Object.freeze({ timingControlObservationCriterionIds: Object.freeze([`timing:${suffix}`]),
      prescribedTempoAssumedActual: false as const, prescribedDurationAssumedActual: false as const }),
    actualTimingSource: "independently_observed", qualityObservations: Object.freeze([Object.freeze({
      criterionId: `quality:${suffix}`, result: input.descriptor.evidenceMode === "regress" ? "not_met" : "met",
      source: "coach_observation", provenance: Object.freeze({ source: "synthetic_contract_fixture",
        sourceRef: `Gate16:${suffix}` }) })]), substitutionRecords: Object.freeze([]),
    realizedStressExposureIds: Object.freeze([`stress:${suffix}`]),
    responseObservationIds: Object.freeze([responseId]), recoveryEvidenceIds: Object.freeze([`recovery:${suffix}`]),
    recoveryStatus: input.descriptor.evidenceMode === "deload_review" ? "recovery_concern" :
      input.descriptor.evidenceMode === "mixed" ? "unknown" : "recovered_as_expected",
    sessionId: `session:${input.descriptor.scenarioId}:${input.index + 1}`,
    opportunityId: `opportunity:${suffix}`, reservationId: `reservation:${suffix}`,
    occurredAt: `2026-08-${String(8 + input.index).padStart(2, "0")}T10:00:00-04:00`,
    sourceAuthority: "test_design_explicit_source",
    provenance: Object.freeze(["Gate16:explicit-completed-outcome-not-runtime-ingestion"]) });
}

function sourceRecords(input: {
  readonly descriptor: LongitudinalHoldoutDescriptor;
  readonly entries: readonly CompletedExposureOutcomeLedgerEntry[];
  readonly target: LongitudinalAdaptationTarget;
}): readonly LongitudinalOutcomeSourceRecord[] {
  const allSignals = signals(input.descriptor.evidenceMode);
  return Object.freeze(input.entries.flatMap((entry, index) => {
    const related = input.descriptor.mutationKind.startsWith("accepted_related_");
    const identityOnly = input.descriptor.mutationKind === "accepted_identity_history";
    const realization = identityOnly ? null : Object.freeze({ exerciseId: input.descriptor.exerciseId,
      prescriptionId: entry.prescriptionId, assignmentId: input.target.assignmentId,
      doseMode: input.descriptor.doseMode, equipmentIds: Object.freeze([]), side: input.target.side,
      supportKey: input.target.supportKey, rangeKey: input.target.rangeKey, loadKey: input.target.loadKey,
      ...(input.descriptor.mutationKind === "accepted_related_side" ? { side: "left" as const } : {}),
      ...(input.descriptor.mutationKind === "accepted_related_support" ? { supportKey: "support:historical" } : {}),
      ...(input.descriptor.mutationKind === "accepted_related_range" ? { rangeKey: "range:historical" } : {}),
      ...(input.descriptor.mutationKind === "accepted_related_load" ? { loadKey: "load:historical" } : {}) });
    const common = { athleteId: entry.athleteId, targetId: input.target.targetId,
      sourceExposureEventId: entry.sourceExposureEventId, sessionId: entry.sessionId, occurredAt: entry.occurredAt,
      realization, applicability: identityOnly ? "EXERCISE_IDENTITY_HISTORY" as const :
        related ? "RELATED_REALIZATION_EVIDENCE" as const : "EXACT_REALIZATION_EVIDENCE" as const,
      reviewedAggregateSourceEventIds: Object.freeze(input.entries.map((value) => value.sourceExposureEventId)),
      provenance: Object.freeze(["Gate16:explicit-source-owner-adapter"]) };
    return [Object.freeze({ ...common, sourceRecordId: entry.actualPerformanceRecordId!,
      owner: "exercise_performance_record" as const, sourceAuthority: "test_design_explicit_source" as const,
      signals: allSignals }), Object.freeze({ ...common, sourceRecordId: entry.responseObservationIds[0],
      owner: "training_response_receiver" as const, sourceAuthority: "production_owner_trace" as const,
      signals: index === input.entries.length - 1 ? allSignals : Object.freeze([]) })];
  }));
}

function targetFor(input: {
  readonly descriptor: LongitudinalHoldoutDescriptor;
  readonly snapshot: ProductionPhaseProgramSnapshot;
}): LongitudinalAdaptationTarget {
  const assignment = input.snapshot.entities.find((entry) => entry.kind === "assignment" && entry.exerciseId) ?? null;
  const prescription = input.snapshot.finalPrescriptionRefs[0];
  const axis = input.descriptor.progressionAxis ?? axisForMode(input.descriptor.doseMode);
  const conflict = input.descriptor.evidenceMode === "progress_conflict";
  const alternateAxis: ProgressionAxis = axis === "load" ? "reps" : "sets";
  return Object.freeze({ targetId: `target:${input.descriptor.scenarioId}`, targetScope: "exact_realization",
    athleteId: input.snapshot.athleteId, activeNeedIds: Object.freeze([`need:${input.descriptor.scenarioId}`]),
    activeObjectiveIds: Object.freeze([`objective:${input.descriptor.scenarioId}`]),
    exerciseId: input.descriptor.exerciseId, assignmentId: assignment?.entityId ?? `assignment:${input.descriptor.scenarioId}`,
    prescriptionId: prescription?.prescriptionId ?? null, side: "bilateral", supportKey: "support:current",
    rangeKey: "range:current", loadKey: "load:current", doseMode: input.descriptor.doseMode,
    sessionId: assignment?.sessionId ?? `session:${input.descriptor.scenarioId}`,
    currentProgramSnapshotId: input.snapshot.snapshotId, currentPhaseId: input.descriptor.phaseId,
    currentPhaseStateId: input.snapshot.phaseStateId, active: true,
    exerciseLegal: !/exercise_illegal/.test(input.descriptor.mutationKind),
    productiveAnchor: input.descriptor.evidenceMode !== "rotation", rotationEligible: input.descriptor.evidenceMode === "rotation",
    equivalentCandidatePoolAvailable: input.descriptor.evidenceMode === "rotation",
    legalProgressionAxes: Object.freeze(conflict ? [axis, alternateAxis] : [axis]),
    supportedProgressionAxes: Object.freeze(conflict ? [axis, alternateAxis] : [axis]),
    phasePreferredProgressionAxes: Object.freeze([]), availableProgressionAxes:
      Object.freeze(conflict ? [axis, alternateAxis] : [axis]),
    legalRegressionAxes: Object.freeze([axis]), supportedRegressionAxes: Object.freeze([axis]),
    implicatedPrescriptionDimensions: Object.freeze([axis]),
    requiredFuturePolicyRefs: Object.freeze(["PRODUCTION_PRESCRIPTION_COMPILER@1.0.0",
      "PRESCRIPTION_POLICY_V1@1.0.0", "WEEK_POLICY_V1@1.0.0"]),
    provenance: Object.freeze(["Gate16:target-owner-explicit"]) });
}

function applicationCandidate(input: LongitudinalAdaptationGate16Input, directive: LongitudinalAdaptationActionDirective,
  mutationKind: string): LongitudinalAdaptationApplicationCandidate {
  const scopeExceeded = /scope_exceeded|phase_mutation_applied|keep_with_unrelated_change/.test(mutationKind);
  const erased = /action_erased|replacement_direct_swap/.test(mutationKind);
  const directReplacement = /replacement_direct_swap/.test(mutationKind);
  const isReopen = directive.action.includes("reopen_candidate_selection");
  return Object.freeze({ applicationCandidateId: `application:${input.decisionAttemptId}`,
    authorizedDirective: directive, currentProgramSnapshot: input.currentProgramSnapshot,
    proposedProgramSnapshot: input.currentProgramSnapshot, explicitEntityMappings: Object.freeze([]),
    claimedAppliedDimensions: Object.freeze(directReplacement ? ["selected_exercise_identity"] :
      erased ? [] : directive.selectedAxis ? [directive.selectedAxis] : []),
    changedTargetIds: Object.freeze(scopeExceeded ? [directive.targetId, "unrelated-target"] : [directive.targetId]),
    applicationOwner: directive.downstreamApplicationOwner, applicationState: "proposed_for_validation",
    actionPersisted: !erased, candidateSelectionReopened: isReopen && !erased,
    phaseMutationClaimed: /phase_mutation/.test(mutationKind), weekReallocationClaimed: false,
    provenance: Object.freeze(["Gate16:test-only-application-candidate"]) });
}

function mutateInput(input: LongitudinalAdaptationGate16Input, mutationKind: string): LongitudinalAdaptationGate16Input {
  if (mutationKind === "none" || /action_erased|action_scope_exceeded|phase_mutation_applied|keep_with_unrelated_change|replacement_direct_swap/.test(mutationKind)) return input;
  const draft = structuredClone(input) as LongitudinalAdaptationGate16Input;
  const entries = draft.completedExposureLedger.entries as CompletedExposureOutcomeLedgerEntry[];
  const records = draft.outcomeSourceSnapshot.sourceRecords as LongitudinalOutcomeSourceRecord[];
  if (mutationKind === "upstream_failure") (draft.upstreamGateStates as { gate: string; state: "PASS" | "FAIL_STOP" }[])[0].state = "FAIL_STOP";
  else if (mutationKind === "duplicate_source_event" || mutationKind === "copied_record_as_repeated" ||
      /event_per_(?:response|muscle|set)/.test(mutationKind)) {
    if (entries[1]) (entries[1] as { sourceExposureEventId: string }).sourceExposureEventId = entries[0].sourceExposureEventId;
  } else if (mutationKind === "duplicate_outcome_entry") {
    if (entries[1]) (entries[1] as { outcomeEntryId: string }).outcomeEntryId = entries[0].outcomeEntryId;
  } else if (mutationKind === "planned_dose_as_actual") {
    (entries[0] as { actualDoseSource: "planned_copy_invalid" }).actualDoseSource = "planned_copy_invalid";
  } else if (mutationKind === "prescribed_tempo_as_actual" || mutationKind === "planned_duration_as_actual") {
    (entries[0] as { actualTimingSource: "planned_copy_invalid" }).actualTimingSource = "planned_copy_invalid";
  } else if (mutationKind === "future_dated_evidence") {
    (entries[0] as { occurredAt: string }).occurredAt = "2027-01-01T10:00:00-05:00";
  } else if (mutationKind === "stale_evidence") {
    (entries[0] as { occurredAt: string }).occurredAt = "2025-01-01T10:00:00-05:00";
  } else if (mutationKind === "wrong_side_evidence") {
    (records[0].realization as { side: "left" }).side = "left";
  } else if (mutationKind === "wrong_support_context") {
    (records[0].realization as { supportKey: string }).supportKey = "support:wrong";
  } else if (mutationKind === "wrong_prescription_revision") {
    (entries[0] as { finalPrescriptionRevisionId: string }).finalPrescriptionRevisionId = "wrong-revision";
  } else if (mutationKind === "wrong_sequence_revision") {
    (entries[0] as { finalSequenceRevisionId: string }).finalSequenceRevisionId = "wrong-revision";
  } else if (mutationKind === "orphan_performance") {
    (entries[0] as { actualPerformanceRecordId: string }).actualPerformanceRecordId = "orphan-performance";
  } else if (mutationKind === "orphan_response") {
    (entries[0].responseObservationIds as string[])[0] = "orphan-response";
  }
  return draft;
}

export function buildLongitudinalAdaptationInput(
  descriptor: LongitudinalHoldoutDescriptor,
): LongitudinalAdaptationGate16Input {
  const phase = phaseTruth(descriptor.phaseId);
  const target = targetFor({ descriptor, snapshot: phase.snapshot });
  const repetitionMutation = /duplicate_source_event|duplicate_outcome_entry|copied_record_as_repeated|event_per_(?:response|muscle|set)/
    .test(descriptor.mutationKind);
  const count = isRepeated(descriptor.evidenceMode) || repetitionMutation ?
    Math.max(2, descriptor.opportunityCount) : 1;
  const entries = Object.freeze(Array.from({ length: count }, (_, index) =>
    ledgerEntry({ descriptor, snapshot: phase.snapshot, target, index })));
  const records = sourceRecords({ descriptor, entries, target });
  const outcomeSnapshot = Object.freeze({ contractReference: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    snapshotId: `outcome-snapshot:${descriptor.scenarioId}`,
    snapshotRevisionId: digest({ descriptor: descriptor.scenarioId, records }), athleteId: phase.snapshot.athleteId,
    sourceRecords: records, unresolvedSourceOwners: Object.freeze([]), evaluationTime: LONGITUDINAL_EVALUATION_TIME,
    provenance: Object.freeze(["LONGITUDINAL_OUTCOME_SOURCE_CONTRACT:test-design-adapter"]) });
  const ledger: CompletedExposureOutcomeLedger = Object.freeze({ ledgerId: `ledger:${descriptor.scenarioId}`,
    athleteId: phase.snapshot.athleteId, expectedSourceExposureEventIds:
      Object.freeze(entries.map((entry) => entry.sourceExposureEventId)), entries,
    evaluationTime: LONGITUDINAL_EVALUATION_TIME,
    provenance: Object.freeze(["Gate16:completed-outcome-ledger"]) });
  const window = Object.freeze({ windowId: `window:${descriptor.scenarioId}`, targetId: target.targetId,
    startsAt: WINDOW_START, endsAt: "2026-08-14T17:00:00-04:00", evaluationTime: LONGITUDINAL_EVALUATION_TIME,
    includedOutcomeEntryIds: Object.freeze(entries.map((entry) => entry.outcomeEntryId)),
    excludedOutcomeEntries: Object.freeze([]), requiredSourceOwners: descriptor.mutationKind ===
      "unsupported_source_gap" ? Object.freeze(["exercise_performance_record" as const,
        "training_response_receiver" as const, "recovery_summary" as const]) :
      Object.freeze(["exercise_performance_record" as const, "training_response_receiver" as const]),
    recencyApplicabilityState: "current" as const, distinctSourceEventCount: entries.length,
    distinctSessionCount: entries.length, distinctPrescriptionRealizationCount: 1,
    reviewedAggregateSourceEventIds: Object.freeze(entries.map((entry) => entry.sourceExposureEventId)),
    provenance: Object.freeze(["Gate16:bounded-evidence-window"]) });
  const threadBase = { athleteId: phase.snapshot.athleteId, targetScope: target.targetScope,
    activeNeedIds: target.activeNeedIds, activeObjectiveIds: target.activeObjectiveIds,
    exerciseId: target.exerciseId, assignmentId: target.assignmentId, prescriptionLineageId: target.prescriptionId,
    side: target.side, phaseCycleId: phase.snapshot.phaseStateId };
  const threadIdentity = Object.freeze({ ...threadBase, threadId: deriveLongitudinalThreadId(threadBase),
    createdAt: "2026-07-01T00:00:00-04:00", owner: "test_design_adapter" as const,
    provenance: Object.freeze(["Gate16:stable-thread-identity"]) });
  const stateIdentity = Object.freeze({ stateId: deriveLongitudinalStateId({ athleteId: target.athleteId,
    threadId: threadIdentity.threadId }), threadId: threadIdentity.threadId, athleteId: target.athleteId,
    createdAt: threadIdentity.createdAt, provenance: Object.freeze(["Gate16:stable-state-identity"]) });
  const decisionAttemptId = `decision-attempt:${descriptor.scenarioId}`;
  const revisionBase = { stateIdentity, basedOnRevisionId: null, evidenceWindowId: window.windowId,
    currentState: stateForMode(descriptor.evidenceMode),
    currentAuthorizedOrPendingAction: descriptor.expectedAction ?? "no_action_insufficient_evidence" as const,
    evaluationTime: LONGITUDINAL_EVALUATION_TIME, decisionAttemptId };
  const currentStateRevision: LongitudinalAdaptationStateRevision = Object.freeze({ ...revisionBase,
    revisionId: deriveLongitudinalStateRevisionId(revisionBase), finalForDecision: true,
    provenance: Object.freeze(["Gate16:immutable-state-revision"]) });
  let input: LongitudinalAdaptationGate16Input = Object.freeze({
    contractReference: LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5,
    policy: LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
    outcomeSourceContract: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE, outcomeSourceSnapshot: outcomeSnapshot,
    completedExposureLedger: ledger, target, threadIdentity, evidenceWindow: window,
    stateRevisionLedger: Object.freeze({ stateId: stateIdentity.stateId,
      revisions: Object.freeze([currentStateRevision]), finalRevisionId: currentStateRevision.revisionId,
      finalizedHistoricalRevisionIds: Object.freeze([]) }), currentStateRevision,
    currentProgramSnapshot: phase.snapshot, currentPhaseContinuityResult: phase.result,
    upstreamGateStates: Object.freeze(Array.from({ length: 16 }, (_, index) => Object.freeze({
      gate: `gate_${index}`, state: "PASS" as const }))), trainingSafetyTrace: phase.safety,
    trainingResponseReceiverTraces: Object.freeze([]), progressionReadinessTraces: Object.freeze([]),
    normalizedRecoverySummaryRecordIds: Object.freeze(records.filter((record) => record.owner === "recovery_summary")
      .map((record) => record.sourceRecordId)), normalizedAdherenceSummaryRecordIds:
      Object.freeze(records.filter((record) => record.owner === "adherence_summary").map((record) => record.sourceRecordId)),
    optionalApplicationCandidate: null, evaluationTime: LONGITUDINAL_EVALUATION_TIME, decisionAttemptId,
    priorDecisionRevisionContext: null, runShadowDiagnosticsAfterFailure: true });
  input = mutateInput(input, descriptor.mutationKind);
  if (/action_erased|action_scope_exceeded|phase_mutation_applied|keep_with_unrelated_change|replacement_direct_swap/.test(descriptor.mutationKind)) {
    const first = runLongitudinalAdaptationGate16(input);
    if (first.actionDirective) input = Object.freeze({ ...input,
      optionalApplicationCandidate: applicationCandidate(input, first.actionDirective, descriptor.mutationKind) });
  }
  return input;
}
