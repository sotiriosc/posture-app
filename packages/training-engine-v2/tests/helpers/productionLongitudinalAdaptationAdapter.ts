import type { ProgressionAxis } from "../../src/domain/progression";
import type {
  LongitudinalAdaptationGate16Input,
  LongitudinalOutcomeSourceOwner,
  LongitudinalRealizationContext,
} from "../../src/longitudinalAdaptation/designContracts";
import {
  PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
  PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  deriveProductionBlockResultId,
  deriveProductionLongitudinalSourceRecordId,
  deriveProductionLongitudinalSourceRecordRevisionId,
  deriveProductionLongitudinalSourceSnapshotRevisionId,
  deriveProductionLongitudinalStateId,
  deriveProductionLongitudinalStateRevisionId,
  deriveProductionLongitudinalThreadId,
  type ProductionCompletedExposureOutcomeLedgerEntry,
  type ProductionExercisePerformanceBlockLinkage,
  type ProductionLongitudinalAdaptationInput,
  type ProductionLongitudinalAdaptationTarget,
  type ProductionLongitudinalOutcomeSourceOwner,
  type ProductionLongitudinalOutcomeSourceRecord,
  type ProductionLongitudinalPrescriptionDimension,
  type ProductionLongitudinalRealizationContext,
} from "../../src/longitudinalAdaptation";

function owner(value: LongitudinalOutcomeSourceOwner): ProductionLongitudinalOutcomeSourceOwner {
  return value === "exercise_performance_record" ? "exercise_performance" : value;
}

function dimension(axis: ProgressionAxis): ProductionLongitudinalPrescriptionDimension {
  const mapping: Partial<Record<ProgressionAxis, ProductionLongitudinalPrescriptionDimension>> = {
    load: "load", reps: "repetitions", sets: "sets", trips: "trips", duration: "duration",
    distance: "distance", steps: "steps", breath_cycles: "breath_cycles", effort: "effort", range: "range",
    lever: "lever", tempo: "tempo", support_reduction: "support", rest_reduction: "rest",
  };
  return mapping[axis] ?? "unresolved_other";
}

function productionRealization(input: {
  readonly realization: LongitudinalRealizationContext | null;
  readonly plannedBlockIds: readonly string[];
  readonly actualBlockResultIds: readonly string[];
}): ProductionLongitudinalRealizationContext | null {
  const value = input.realization;
  if (!value) return null;
  return Object.freeze({ exerciseId: value.exerciseId, prescriptionLineageId: value.prescriptionId,
    assignmentLineageId: value.assignmentId, doseMode: value.doseMode,
    equipmentIds: Object.freeze([...value.equipmentIds]), supportKey: value.supportKey, rangeKey: value.rangeKey,
    leverKey: null, laterality: value.side === "bilateral" ? "bilateral" :
      value.side === "alternating" ? "alternating" : value.side ? "unilateral" : null,
    side: value.side, loadKey: value.loadKey, effortKey: null, tempoKey: null, restKey: null,
    plannedBlockIds: Object.freeze([...input.plannedBlockIds]),
    actualBlockResultIds: Object.freeze([...input.actualBlockResultIds]) });
}

function target(input: LongitudinalAdaptationGate16Input): ProductionLongitudinalAdaptationTarget {
  const value = input.target;
  const plannedBlockIds = Object.freeze([`planned-block:${value.prescriptionId ?? value.targetId}`]);
  return Object.freeze({ targetId: value.targetId, targetScope: value.targetScope, athleteId: value.athleteId,
    activeNeedIds: Object.freeze([...value.activeNeedIds]), activeObjectiveIds: Object.freeze([...value.activeObjectiveIds]),
    exerciseId: value.exerciseId, assignmentLineageId: value.assignmentId,
    prescriptionLineageId: value.prescriptionId, side: value.side,
    laterality: value.side === "bilateral" ? "bilateral" : value.side === "alternating" ? "alternating" :
      value.side ? "unilateral" : null,
    supportKey: value.supportKey, rangeKey: value.rangeKey, leverKey: null, loadKey: value.loadKey,
    effortKey: null, tempoKey: null, restKey: null, equipmentIds: Object.freeze([]), plannedBlockIds,
    doseMode: value.doseMode, sessionId: value.sessionId,
    currentProgramSnapshotId: input.currentProgramSnapshot.snapshotId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshot.snapshotRevisionId,
    currentPhaseId: value.currentPhaseId, currentPhaseStateId: input.currentProgramSnapshot.phaseStateId,
    currentPhaseStateRevisionId: input.currentProgramSnapshot.phaseStateRevisionId,
    active: value.active, exerciseLegal: value.exerciseLegal, productiveAnchor: value.productiveAnchor,
    rotationEligible: value.rotationEligible, equivalentCandidatePoolAvailable: value.equivalentCandidatePoolAvailable,
    legalProgressionAxes: Object.freeze([...value.legalProgressionAxes]),
    supportedProgressionAxes: Object.freeze([...value.supportedProgressionAxes]),
    phasePreferredProgressionAxes: Object.freeze([...value.phasePreferredProgressionAxes]),
    availableProgressionAxes: Object.freeze([...value.availableProgressionAxes]),
    legalRegressionAxes: Object.freeze([...value.legalRegressionAxes]),
    supportedRegressionAxes: Object.freeze([...value.supportedRegressionAxes]),
    implicatedPrescriptionDimensions: Object.freeze(value.implicatedPrescriptionDimensions.map((item) =>
      dimension(item as ProgressionAxis))), requiredFuturePolicyReferences: Object.freeze([...value.requiredFuturePolicyRefs]),
    provenance: Object.freeze(["test-only-adapter:Gate16Target->ProductionLongitudinalTarget"]) });
}

function blockLinkage(input: LongitudinalAdaptationGate16Input,
  entry: LongitudinalAdaptationGate16Input["completedExposureLedger"]["entries"][number],
  plannedBlockId: string): ProductionExercisePerformanceBlockLinkage | null {
  if (!entry.actualPerformanceRecordId && entry.completionStatus === "unknown") return null;
  const performedBlockId = `performed-block:${entry.sourceExposureEventId}`;
  const completionStatus = entry.completionStatus === "completed_as_planned" ? "completed_as_planned" as const :
    entry.completionStatus === "substituted" ? "substituted" as const :
    entry.completionStatus === "not_performed" ? "omitted" as const :
    entry.completionStatus === "unknown" ? "unknown" as const : "partially_completed" as const;
  const blockResultId = deriveProductionBlockResultId({ plannedBlockId, performedBlockId,
    sourceExposureEventId: entry.sourceExposureEventId });
  return Object.freeze({ performanceRecordId: entry.actualPerformanceRecordId ??
    `performance-unknown:${entry.sourceExposureEventId}`, prescriptionId: entry.prescriptionId,
    prescriptionRevisionId: entry.finalPrescriptionRevisionId, sourceExposureEventId: entry.sourceExposureEventId,
    plannedBlocks: Object.freeze([{ blockId: plannedBlockId, purpose: "developmental_work" as const,
      doseMode: entry.actualDose?.mode ?? input.target.doseMode ?? "repetition_sets" }]),
    blockResults: Object.freeze([Object.freeze({ blockResultId, plannedBlockId, performedBlockId,
      sourceExposureEventId: entry.sourceExposureEventId, completionStatus, actualDose: entry.actualDose,
      actualDoseSource: entry.actualDoseSource === "planned_copy_invalid" ? "planned_copy_invalid" as const :
        entry.actualDose ? "independently_observed" as const : "not_observed" as const,
      actualTiming: entry.actualTiming,
      actualTimingSource: entry.actualTimingSource === "planned_copy_invalid" ? "prescribed_copy_invalid" as const :
        entry.actualTiming ? "independently_observed" as const : "not_observed" as const,
      qualityObservations: entry.qualityObservations,
      substitution: entry.substitutionRecords[0] ?? null,
      provenance: Object.freeze(["test-only-adapter:Gate16ActualPerformance->BlockPerformance"]) })]),
    omittedPlannedBlockIds: Object.freeze(completionStatus === "omitted" ? [plannedBlockId] : []),
    additionalUnplannedBlockIds: Object.freeze([]), actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false, originalPlanImmutable: true, authority: "block_level",
    provenance: Object.freeze(["test-only-adapter:one-block-authoritative-performance"]) });
}

export function adaptGate16InputToProduction(
  input: LongitudinalAdaptationGate16Input,
): ProductionLongitudinalAdaptationInput {
  const productionTarget = target(input);
  const blockByEvent = new Map<string, ProductionExercisePerformanceBlockLinkage | null>();
  for (const entry of input.completedExposureLedger.entries) {
    blockByEvent.set(entry.sourceExposureEventId, blockLinkage(input, entry, productionTarget.plannedBlockIds[0]));
  }
  const sourceRecords: ProductionLongitudinalOutcomeSourceRecord[] = input.outcomeSourceSnapshot.sourceRecords
    .map((record) => {
      const linkage = record.sourceExposureEventId ? blockByEvent.get(record.sourceExposureEventId) : null;
      const actualBlockResultIds = linkage?.blockResults.map((result) => result.blockResultId) ?? [];
      const recordOwner = owner(record.owner);
      const sourceRecordId = deriveProductionLongitudinalSourceRecordId({ owner: recordOwner,
        upstreamSourceRecordIds: [record.sourceRecordId], athleteId: record.athleteId,
        sourceExposureEventId: record.sourceExposureEventId, sessionId: record.sessionId,
        observationKind: `${recordOwner}:normalized-outcome` });
      const content = { sourceRecordId, basedOnRevisionId: null, owner: recordOwner,
        upstreamSourceRecordIds: Object.freeze([record.sourceRecordId]), athleteId: record.athleteId,
        targetId: productionTarget.targetId, targetScope: productionTarget.targetScope,
        sourceExposureEventId: record.sourceExposureEventId, sessionId: record.sessionId,
        opportunityId: null, reservationId: null,
        realization: productionRealization({ realization: record.realization,
          plannedBlockIds: productionTarget.plannedBlockIds, actualBlockResultIds }),
        declaredApplicability: record.applicability,
        observedAt: record.occurredAt, recordedAt: input.evaluationTime, appliesThrough: input.evaluationTime,
        confidence: "high" as const, reviewState: "validated" as const, revisionState: "active" as const,
        finalForSourceRecord: true, signals: Object.freeze([...record.signals]),
        reviewedAggregateSourceEventIds: Object.freeze([...record.reviewedAggregateSourceEventIds]) };
      return Object.freeze({ ...content,
        sourceRecordRevisionId: deriveProductionLongitudinalSourceRecordRevisionId(content),
        provenance: Object.freeze(["test-only-adapter:Gate16Source->ProductionSourceRevision"]) });
    });
  const sourceSnapshotId = `production:${input.outcomeSourceSnapshot.snapshotId}`;
  const activeSourceRecordRevisionIds = Object.freeze(sourceRecords.map((record) => record.sourceRecordRevisionId));
  const sourceSnapshotContent = { snapshotId: sourceSnapshotId, basedOnRevisionId: null,
    sourceRecords: Object.freeze(sourceRecords), activeSourceRecordRevisionIds, evaluationTime: input.evaluationTime };
  const outcomeSourceSnapshot = Object.freeze({
    contractReference: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    ...sourceSnapshotContent,
    snapshotRevisionId: deriveProductionLongitudinalSourceSnapshotRevisionId(sourceSnapshotContent),
    athleteId: input.outcomeSourceSnapshot.athleteId,
    unresolvedSourceOwners: Object.freeze(input.outcomeSourceSnapshot.unresolvedSourceOwners.map(owner)),
    provenance: Object.freeze(["test-only-adapter:Gate16OutcomeSnapshot->ProductionOutcomeSnapshot"]),
  });
  const entries: readonly ProductionCompletedExposureOutcomeLedgerEntry[] = Object.freeze(
    input.completedExposureLedger.entries.map((entry) => {
      const linkage = blockByEvent.get(entry.sourceExposureEventId) ?? null;
      const eventCompletionState = entry.completionStatus === "completed_as_planned" ? "completed_as_planned" as const :
        entry.completionStatus === "substituted" ? "substituted_and_completed" as const :
        entry.completionStatus === "not_performed" ? "not_performed" as const :
        entry.completionStatus === "unknown" ? "outcome_unknown" as const : "partially_completed" as const;
      const sourceRecordRevisionIds = sourceRecords.filter((record) =>
        record.sourceExposureEventId === entry.sourceExposureEventId).map((record) => record.sourceRecordRevisionId);
      return Object.freeze({ outcomeEntryId: entry.outcomeEntryId, athleteId: entry.athleteId,
        sourceExposureEventId: entry.sourceExposureEventId, originalAssignmentId: entry.originalAssignmentId,
        originalExerciseId: entry.originalExerciseId, realizedExerciseId: entry.realizedExerciseId,
        prescriptionId: entry.prescriptionId, finalPrescriptionRevisionId: entry.finalPrescriptionRevisionId,
        sequencePlanId: entry.sequencePlanId, finalSequenceRevisionId: entry.finalSequenceRevisionId,
        plannedBlockIds: productionTarget.plannedBlockIds, blockPerformance: linkage, eventCompletionState,
        substitutionLineage: Object.freeze(entry.substitutionRecords.map((value) =>
          `${value.originalExerciseId}->${value.substitutedExerciseId}`)),
        realizedStressExposureIds: Object.freeze([...entry.realizedStressExposureIds]),
        responseObservationIds: Object.freeze([...entry.responseObservationIds]),
        recoveryEvidenceIds: Object.freeze([...entry.recoveryEvidenceIds]), recoveryStatus: entry.recoveryStatus,
        sessionId: entry.sessionId, opportunityId: entry.opportunityId, reservationId: entry.reservationId,
        occurredAt: entry.occurredAt, sourceRecordRevisionIds: Object.freeze(sourceRecordRevisionIds),
        sourceAuthority: "caller_validated_production_source",
        provenance: Object.freeze(["test-only-adapter:Gate16Ledger->ProductionCompletedLedger"]) });
    }));
  const threadSemantic = { athleteId: productionTarget.athleteId, targetScope: productionTarget.targetScope,
    activeNeedIds: productionTarget.activeNeedIds, activeObjectiveIds: productionTarget.activeObjectiveIds,
    exerciseId: productionTarget.exerciseId, assignmentLineageId: productionTarget.assignmentLineageId,
    prescriptionLineageId: productionTarget.prescriptionLineageId, side: productionTarget.side,
    phaseCycleId: input.threadIdentity.phaseCycleId };
  const threadId = deriveProductionLongitudinalThreadId(threadSemantic);
  const stateIdentity = Object.freeze({ stateId: deriveProductionLongitudinalStateId({ threadId,
    athleteId: productionTarget.athleteId }), threadId, athleteId: productionTarget.athleteId,
    createdAt: input.currentStateRevision.stateIdentity.createdAt,
    provenance: Object.freeze(["test-only-adapter:ProductionLongitudinalStateIdentity"]) });
  const stateSemantic = { stateIdentity, basedOnRevisionId: null, evidenceWindowId: input.evidenceWindow.windowId,
    currentState: input.currentStateRevision.currentState,
    currentAuthorizedOrPendingAction: input.currentStateRevision.currentAuthorizedOrPendingAction,
    evaluationTime: input.evaluationTime, decisionAttemptId: input.decisionAttemptId, finalForDecision: true };
  const stateRevision = Object.freeze({ ...stateSemantic,
    revisionId: deriveProductionLongitudinalStateRevisionId(stateSemantic),
    provenance: Object.freeze(["test-only-adapter:ProductionLongitudinalStateRevision"]) });
  const progressionReadinessTraces = input.progressionReadinessTraces.length ?
    input.progressionReadinessTraces : sourceRecords.some((record) => record.signals.includes("progression_ready")) ?
      Object.freeze([Object.freeze({ prescriptionId: productionTarget.prescriptionLineageId ?? "unknown",
        exerciseId: productionTarget.exerciseId ?? "unknown", classification: "READY_FOR_PROGRESSION_REVIEW" as const,
        blockers: Object.freeze([]), evidence: Object.freeze({
          prescriptionId: productionTarget.prescriptionLineageId ?? "unknown",
          exerciseId: productionTarget.exerciseId ?? "unknown", doseEvidence: "target_met" as const,
          executionQualityEvidence: "all_required_criteria_met" as const,
          painResponseEvidence: "no_unresolved_response_requirement" as const,
          recoveryEvidence: "recovered_as_expected" as const,
          continuityRunwayEvidence: Object.freeze(["progression_axes_remain_available" as const]),
          repeatedEvidence: "repeated_success" as const,
          evidenceRecordIds: Object.freeze(sourceRecords.map((record) => record.sourceRecordRevisionId)),
          notes: Object.freeze([]) }), selectedAxis: null, selectedTransition: null,
        automaticProgressionDecision: false as const })]) : Object.freeze([]);
  const applicationOwner = (value: string) => value === "prescription_compiler" ? "prescription" as const :
    value === "week_owner" ? "week" as const : value === "phase_continuity_owner" ? "phase_continuity" as const :
    value === "training_safety_owner" ? "training_safety" as const : value === "candidate_intelligence_and_composer" ?
      "candidate_intelligence_and_composer" as const : value === "human_owner_review" ? "human_owner_review" as const :
      "product_application" as const;
  const designApplication = input.optionalApplicationCandidate;
  const optionalApplicationCandidate = designApplication ? Object.freeze({
    applicationCandidateId: designApplication.applicationCandidateId,
    authorizedDirective: Object.freeze({ directiveId: designApplication.authorizedDirective.directiveId,
      decisionId: designApplication.authorizedDirective.decisionId,
      decisionRevisionId: designApplication.authorizedDirective.decisionRevisionId,
      targetId: designApplication.authorizedDirective.targetId,
      targetScope: designApplication.authorizedDirective.targetScope,
      action: designApplication.authorizedDirective.action,
      selectedAxis: designApplication.authorizedDirective.selectedAxis,
      implicatedPrescriptionDimensions: Object.freeze(designApplication.authorizedDirective
        .implicatedPrescriptionDimensions.map((item) => dimension(item as ProgressionAxis))),
      evidenceSourceRecordRevisions: Object.freeze(sourceRecords.map((record) => record.sourceRecordRevisionId)),
      sourceExposureEventIds: Object.freeze(entries.map((entry) => entry.sourceExposureEventId)),
      reasonCodes: designApplication.authorizedDirective.reasonCodes,
      actionOwner: "longitudinal_adaptation" as const,
      downstreamApplicationOwner: applicationOwner(designApplication.authorizedDirective.downstreamApplicationOwner),
      requiredFuturePolicyReferences: designApplication.authorizedDirective.requiredFuturePolicyReferences,
      currentContinuityState: designApplication.authorizedDirective.currentContinuityState,
      unresolvedBlockers: designApplication.authorizedDirective.unresolvedBlockers,
      reviewState: designApplication.authorizedDirective.reviewState,
      decisionAuthorized: designApplication.authorizedDirective.decisionAuthorized,
      applicationApplied: false as const,
      provenance: Object.freeze(["test-only-adapter:Gate16Directive->ProductionDirective"]) }),
    currentProgramSnapshot: designApplication.currentProgramSnapshot,
    proposedProgramSnapshot: designApplication.proposedProgramSnapshot,
    explicitEntityMappings: designApplication.explicitEntityMappings,
    claimedAppliedDimensions: Object.freeze(designApplication.claimedAppliedDimensions.map((item) =>
      item === "selected_exercise_identity" ? "unresolved_other" as const : dimension(item as ProgressionAxis))),
    changedTargetIds: designApplication.changedTargetIds,
    applicationOwner: applicationOwner(designApplication.applicationOwner),
    applicationState: designApplication.applicationState,
    actionPersisted: designApplication.actionPersisted,
    candidateSelectionReopened: designApplication.candidateSelectionReopened,
    phaseMutationClaimed: designApplication.phaseMutationClaimed,
    weekReallocationClaimed: designApplication.weekReallocationClaimed,
    provenance: Object.freeze(["test-only-adapter:Gate16Application->ProductionApplicationCandidate"]),
  }) : null;
  return Object.freeze({ contractReference: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    policy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED,
    outcomeSourceContract: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    outcomeSourceSnapshot,
    completedExposureLedger: Object.freeze({ ledgerId: `production:${input.completedExposureLedger.ledgerId}`,
      athleteId: input.completedExposureLedger.athleteId,
      expectedSourceExposureEventIds: Object.freeze([...input.completedExposureLedger.expectedSourceExposureEventIds]),
      entries, evaluationTime: input.evaluationTime,
      provenance: Object.freeze(["test-only-adapter:ProductionCompletedExposureLedger"]) }),
    target: productionTarget,
    threadIdentity: Object.freeze({ threadId, ...threadSemantic, createdAt: input.threadIdentity.createdAt,
      owner: "longitudinal_adaptation", provenance: Object.freeze(["test-only-adapter:ProductionThreadIdentity"]) }),
    evidenceWindow: Object.freeze({ windowId: input.evidenceWindow.windowId, targetId: productionTarget.targetId,
      startsAt: input.evidenceWindow.startsAt, endsAt: input.evidenceWindow.endsAt,
      evaluationTime: input.evidenceWindow.evaluationTime,
      includedOutcomeEntryIds: Object.freeze([...input.evidenceWindow.includedOutcomeEntryIds]),
      excludedOutcomeEntries: Object.freeze(input.evidenceWindow.excludedOutcomeEntries.map((entry) =>
        Object.freeze({ outcomeEntryId: entry.outcomeEntryId, reasonCode: "target_mismatch" as const }))),
      requiredSourceOwners: Object.freeze(input.evidenceWindow.requiredSourceOwners.map(owner)),
      recencyApplicabilityState: input.evidenceWindow.recencyApplicabilityState,
      distinctSourceEventCount: input.evidenceWindow.distinctSourceEventCount,
      distinctSessionCount: input.evidenceWindow.distinctSessionCount,
      distinctRealizationCount: input.evidenceWindow.distinctPrescriptionRealizationCount,
      reviewedAggregateSourceEventIds: Object.freeze([...input.evidenceWindow.reviewedAggregateSourceEventIds]),
      provenance: Object.freeze(["test-only-adapter:ProductionEvidenceWindow"]) }),
    stateRevisionLedger: Object.freeze({ stateId: stateIdentity.stateId, revisions: Object.freeze([stateRevision]),
      finalRevisionId: stateRevision.revisionId, finalizedHistoricalRevisionIds: Object.freeze([]) }),
    currentStateRevision: stateRevision,
    currentProgramSnapshot: input.currentProgramSnapshot,
    currentPhaseContinuityResult: input.currentPhaseContinuityResult,
    upstreamAuthority: Object.freeze({ snapshotId: `upstream:${input.decisionAttemptId}`,
      snapshotRevisionId: `upstream-revision:${input.decisionAttemptId}`,
      currentProgramTruthValid: input.upstreamGateStates.every((entry) => entry.state === "PASS"),
      sourceEventIntegrityValid: true, prescriptionValid: true, sequenceValid: true, weekValid: true,
      phaseContinuityValid: true, trainingSafetyValidated: true, unresolvedUpstreamBlockers: Object.freeze([]),
      validatedAt: input.evaluationTime, provenance: Object.freeze(["test-only-adapter:ProductionUpstreamAuthority"]) }),
    trainingSafetyTrace: input.trainingSafetyTrace,
    trainingResponseReceiverTraces: input.trainingResponseReceiverTraces,
    progressionReadinessTraces,
    normalizedRecoverySourceRevisionIds: Object.freeze(sourceRecords.filter((record) =>
      record.owner === "recovery_summary").map((record) => record.sourceRecordRevisionId)),
    normalizedAdherenceSourceRevisionIds: Object.freeze(sourceRecords.filter((record) =>
      record.owner === "adherence_summary").map((record) => record.sourceRecordRevisionId)),
    optionalApplicationCandidate, evaluationTime: input.evaluationTime,
    decisionAttemptId: input.decisionAttemptId, priorDecisionRevisionContext: null,
    runShadowDiagnosticsAfterFailure: input.runShadowDiagnosticsAfterFailure });
}
