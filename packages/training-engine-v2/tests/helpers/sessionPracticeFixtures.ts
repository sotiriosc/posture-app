import {
  SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
  buildSessionPracticeRequest,
  deriveSessionPracticeAttemptId,
  type SessionPracticeModeV2,
  type SessionPracticePolicyContext,
  type SessionPracticeSourceSnapshot,
} from "../../src/sessionPractice";

const TIME = "2026-08-16T12:00:00.000Z";

function doseBlock(input: {
  readonly id: string;
  readonly eventId: string;
  readonly purpose: "preparatory_acclimation" | "developmental_work" | "recovery_or_downregulation";
  readonly sets: { readonly kind: "exact"; readonly value: number; readonly unit: "count" } |
    { readonly kind: "range"; readonly min: number; readonly max: number; readonly unit: "count" };
  readonly contribution: "not_weekly_developmental_credit" | "developmental_credit_candidate" |
    "recovery_observation_only";
}) {
  return {
    blockId: input.id,
    sourceExposureEventId: input.eventId,
    purpose: input.purpose,
    dose: { mode: "repetition_sets" as const, sets: input.sets,
      repetitions: { kind: "exact" as const, value: 8, unit: "count" as const } },
    executionStandard: {},
    restInstructions: [], policyRuleRefs: [], requirementRefs: [], unresolvedRequirementRefs: [],
    contributionClassification: input.contribution,
    order: { index: 0, dependsOnBlockIds: [] }, provenance: { source: "test", sourceRef: input.id },
  };
}

function prescription(input: {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly purpose: "preparatory_acclimation" | "developmental_work" | "recovery_or_downregulation";
  readonly sets: { readonly kind: "exact"; readonly value: number; readonly unit: "count" } |
    { readonly kind: "range"; readonly min: number; readonly max: number; readonly unit: "count" };
  readonly contribution: "not_weekly_developmental_credit" | "developmental_credit_candidate" |
    "recovery_observation_only";
}) {
  const eventId = `event-${input.assignmentId}`;
  const block = doseBlock({ id: `block-${input.assignmentId}`, eventId, purpose: input.purpose,
    sets: input.sets, contribution: input.contribution });
  return {
    compilerContract: { contractId: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL", contractVersion: "1.0.0" },
    prescriptionId: `rx-${input.assignmentId}`,
    prescriptionRevisionId: `rx-rev-${input.assignmentId}`,
    sourceExposureEvent: { sourceExposureEventId: eventId, sessionIntentId: "intent-1",
      sessionAssignmentId: input.assignmentId, exerciseId: input.exerciseId,
      originalSelectedExerciseId: input.exerciseId, currentPlannedExerciseId: input.exerciseId,
      eventStatus: "planned", prescriptionRevisionRefs: [], substitutionRefs: [],
      cancellationSupersessionState: { kind: "none" }, provenance: { source: "test", sourceRef: eventId } },
    exerciseId: input.exerciseId, phaseId: "phase-1", doseBlocks: [block], restInstructions: [],
    compatibilityProjection: { status: "single_uniform_dose_compatible", projectedDose: block.dose,
      preservedRestInstructionIds: [], unresolvedRequirementRefs: [], reasonCode: "TEST" },
    selectedPolicyRuleRefs: [], requirementRefs: [], unresolvedRequirementRefs: [],
    durationInterval: { knownLowerBoundSeconds: 60, knownUpperBoundSeconds: 90, unknownComponents: [],
      status: "bounded_before_sequencing", provenance: { source: "test", sourceRef: eventId } },
    executionStandardsByBlockId: {},
    revisionLedger: { prescriptionId: `rx-${input.assignmentId}`, sourceExposureEventId: eventId,
      executionAttemptId: "attempt-source", revisions: [], supersessions: [],
      finalRevisionId: `rx-rev-${input.assignmentId}`, completedRevisionIds: [] },
    rationaleReasonCodes: [], provenance: { source: "test", sourceRef: eventId },
  };
}

export function makeSessionPracticeSource(options: {
  readonly includeOptional?: boolean;
  readonly includeRecovery?: boolean;
  readonly mainSets?: "range" | "exact-min" | "exact-above-min";
  readonly safetyBlocked?: boolean;
  readonly sourceRevision?: string;
} = {}): SessionPracticeSourceSnapshot {
  const includeOptional = options.includeOptional ?? true;
  const includeRecovery = options.includeRecovery ?? true;
  const assignments = [
    { id: "prep", exerciseId: "cat-cow", section: "warmup", role: "preparation", needIds: ["need-prep"],
      continuity: "stable_supporting", marginal: ["REQUIRED_DEPENDENCY"] },
    { id: "main", exerciseId: "goblet-squat", section: "main", role: "primary_strength", needIds: ["need-main"],
      continuity: "anchor", marginal: ["DOMINANT_PURPOSE"] },
    ...(includeOptional ? [{ id: "accessory", exerciseId: "lateral-raise", section: "accessory",
      role: "hypertrophy_accessory", needIds: ["need-optional"], continuity: "rotation_eligible",
      marginal: ["LOWEST_OPTIONAL_MARGINAL_VALUE"] }] : []),
    ...(includeRecovery ? [{ id: "cooldown", exerciseId: "breathing-reset", section: "cooldown" as const,
      role: "recovery" as const, needIds: ["need-recovery"] as readonly string[], continuity: "none" as const,
      marginal: ["EXPLICIT_RECOVERY"] as readonly string[] }] : []),
  ] as const;
  const plans = assignments.map((assignment) => prescription({
    assignmentId: assignment.id,
    exerciseId: assignment.exerciseId,
    purpose: assignment.id === "prep" ? "preparatory_acclimation" : assignment.id === "cooldown" ?
      "recovery_or_downregulation" : "developmental_work",
    sets: assignment.id === "main" && options.mainSets === "range" ?
      { kind: "range", min: 2, max: 3, unit: "count" } :
      { kind: "exact", value: assignment.id === "main" && options.mainSets === "exact-above-min" ? 3 : 1,
        unit: "count" },
    contribution: assignment.id === "cooldown" ? "recovery_observation_only" :
      assignment.id === "prep" ? "not_weekly_developmental_credit" : "developmental_credit_candidate",
  }));
  const steps = assignments.map((assignment, index) => ({
    sequenceIndex: index, assignmentId: assignment.id, exerciseId: assignment.exerciseId,
    section: assignment.section, role: assignment.role,
    sourceExposureEventId: `event-${assignment.id}`, prescriptionId: `rx-${assignment.id}`,
    finalPrescriptionRevisionId: `rx-rev-${assignment.id}`, orderedDoseBlockIds: [`block-${assignment.id}`],
    satisfiedNeedIds: assignment.needIds,
    dependencyAssignmentIds: assignment.id === "main" ? ["prep"] : [], executionReadiness: "ready",
    sideOrder: "SIDE_ORDER_NOT_PRESCRIBED", reasonCodes: [], provenance: [],
  }));
  const eventIds = plans.map((plan) => plan.sourceExposureEvent.sourceExposureEventId);
  return {
    bridgeContractReference: SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
    sourceSessionId: "session-1", sourceSessionRevisionId: options.sourceRevision ?? "session-rev-1",
    sourceSessionFingerprint: "source-fingerprint-1", finalPrescribedSessionId: "prescribed-session-1",
    finalPrescribedSessionRevisionId: "prescribed-session-rev-1",
    intent: { id: "intent-1", athleteId: "athlete-1", kind: "ordinary_training",
      phaseIntent: {} as never, primaryGoal: "strength", needs: [
        { id: "need-prep", section: "warmup", priority: "required", priorityOrder: 0,
          standaloneAdmission: "shared_only", sourceEvidence: [{ sourceKind: "explicit_preparation_dependency",
            sourceId: "dependency-main", evidenceRefs: [] }], dependencies: [], reasonCode: "PREP", explanation: "",
          selection: {} as never },
        { id: "need-main", section: "main", priority: "required", priorityOrder: 1,
          standaloneAdmission: "admitted", sourceEvidence: [{ sourceKind: "session_primary_purpose",
            sourceId: "strength", evidenceRefs: [] }], dependencies: [], reasonCode: "MAIN", explanation: "",
          selection: {} as never },
        ...(includeOptional ? [{ id: "need-optional", section: "accessory" as const, priority: "optional" as const,
          priorityOrder: 2, standaloneAdmission: "admitted" as const,
          sourceEvidence: [{ sourceKind: "direct_muscle_priority" as const, sourceId: "optional", evidenceRefs: [] }],
          dependencies: [], reasonCode: "OPTIONAL", explanation: "", selection: {} as never }] : []),
        ...(includeRecovery ? [{ id: "need-recovery", section: "cooldown" as const, priority: "optional" as const, priorityOrder: 3,
          standaloneAdmission: "admitted", sourceEvidence: [{ sourceKind: "recovery_requirement",
            sourceId: "recovery", evidenceRefs: [] }], dependencies: [], reasonCode: "RECOVERY", explanation: "",
          selection: {} as never }] : []),
      ], structuralCapacity: "standard", availableMinutes: 45, assessmentContextRefs: [],
      painResponseContextRefs: [], fatigueContext: ["fresh"], continuityEvidence: { identities: [] },
      plannerSourceTrace: { plannerId: "planner", sourceRefs: [] }, unresolvedWeeklyContextRefs: [] },
    skeleton: { sessionIntentId: "intent-1", compositionStatus: "valid", executionReadiness: "executable_at_session_scope",
      sections: [], assignments: assignments.map((assignment) => ({ exerciseId: assignment.exerciseId,
        section: assignment.section, role: assignment.role, satisfiedNeedIds: assignment.needIds,
        candidateEvidenceByNeed: [], continuityClassification: assignment.continuity,
        continuityEvidenceRefs: [], unresolvedCandidateReviewIds: [],
        executionBlockingPrescriptionRequirementIds: [], routinePrescriptionHandoffId: assignment.id,
        bestExecutableFallbackExerciseId: null, marginalValueReasonCodes: assignment.marginal,
        futureSourceExposureCount: 1 })),
      needSatisfaction: [], orderingConstraints: [], evaluation: null, redundancy: [], concentration: [],
      search: { mode: "exhaustive", completeness: "exact_optimal", statesExpanded: 1, statesPruned: 0,
        pruningReasons: {}, frontierPeak: 1, limitReached: false, completeValidSkeletonFound: true,
        optimalityProven: true, expandedStateBudget: 100, retainedFrontierPerLayer: 10 },
      trace: { selectedReasonCodesByExercise: {}, omittedNeedReasonCodes: {}, excludedHighRankedCandidateIds: [],
        emptySectionReasonCodes: { warmup: null, activation: null, main: null, accessory: null, cooldown: null } },
      infeasibility: null },
    prescriptions: plans as never,
    finalSequence: { sequencePlanId: "sequence-1", sequenceRevisionId: "sequence-rev-1",
      executionAttemptId: "attempt-source", sessionIntentId: "intent-1", status: "sequenced_exact_optimal",
      executable: true, steps, finalPrescriptionRevisionIds: plans.map((plan) => plan.prescriptionRevisionId),
      sourceExposureEventIds: eventIds, prescriptionIds: plans.map((plan) => plan.prescriptionId),
      consecutiveTransitionFacts: [], transitionInstructions: [],
      duration: { knownLowerBoundSeconds: plans.length * 60, knownUpperBoundSeconds: plans.length * 90,
        availableSeconds: 2700, status: "bounded", unknownComponents: [], prescriptionIntervalRefs: [],
        transitionInstructionIds: [], timingFactReuseCount: 0, noInventedTime: true, provenance: [], },
      compatibilityProjection: { pairing: false },
    } as never,
    week: { programId: "program-1", programRevisionId: "program-rev-1", weekPlanId: "week-1",
      weekPlanRevisionId: "week-rev-1", reservationId: "reservation-1",
      reservationRevisionId: "reservation-rev-1", opportunityId: "opportunity-1",
      responsibilityIds: ["responsibility-strength", "responsibility-recovery"],
      requiredResponsibilityIds: ["responsibility-strength"] },
    gate13: { validationId: "gate13-1", validationRevisionId: "gate13-rev-1", state: "PASS",
      sourceExposureEventIds: eventIds },
    trainingReadiness: options.safetyBlocked ? { status: "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING",
      downstreamTrainingAllowed: false, reviewRequiredFirst: true, urgentExternalReviewRequired: false,
      unresolvedSignalIds: ["safety-1"], externallyResolvedSignalIds: [], evidence: [], reason: "blocked" } :
      { status: "TRAINING_ALLOWED", downstreamTrainingAllowed: true, reviewRequiredFirst: false,
        urgentExternalReviewRequired: false, unresolvedSignalIds: [], externallyResolvedSignalIds: [],
        evidence: [], reason: "allowed" },
    policyVersionRefs: ["prescription@1.0.0", "sequencing@1.0.0", "gate13@1.2.0"],
    admittedMinimumCountByBlockId: { "block-main": options.mainSets === "exact-above-min" ? 2 : 1 },
    currentEquipmentReference: "equipment-1", capturedAt: TIME,
  } as unknown as SessionPracticeSourceSnapshot;
}

export function makeSessionPracticeContext(
  mode: SessionPracticeModeV2,
  options: Parameters<typeof makeSessionPracticeSource>[0] = {},
): SessionPracticePolicyContext {
  const source = makeSessionPracticeSource(options);
  const attemptId = deriveSessionPracticeAttemptId({ athleteId: source.intent.athleteId,
    sourceSessionId: source.sourceSessionId, sourceSessionRevisionId: source.sourceSessionRevisionId,
    opportunityId: source.week.opportunityId, reservationId: source.week.reservationId, attemptOrdinal: 1 });
  return { source, request: buildSessionPracticeRequest({ source, athleteId: source.intent.athleteId,
    attemptId, mode, requestSource: "athlete_explicit", recommendationReference: null,
    selectedAt: TIME, evaluationTime: TIME, trainingSafetyReference: "safety-evaluation-1",
    actualAvailableMinutes: 45, provenance: ["test"], state: "counterfactual" }), createdAt: TIME };
}
