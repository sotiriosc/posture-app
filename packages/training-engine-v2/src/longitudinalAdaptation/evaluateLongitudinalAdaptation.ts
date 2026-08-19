import { deterministicToken, explicitIsoTime, sameSemanticValue, uniqueSorted } from
  "../prescription/compiler/utilities";
import {
  PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  PRODUCTION_LONGITUDINAL_SUBGATES,
  type ProductionLongitudinalActionCandidate,
  type ProductionLongitudinalAdaptationActionDirective,
  type ProductionLongitudinalAdaptationInput,
  type ProductionLongitudinalAdaptationResult,
  type ProductionLongitudinalStatus,
  type ProductionLongitudinalSubgate,
  type ProductionLongitudinalSubgateTrace,
} from "./contracts";
import { validateProductionCompletedExposureLedger } from "./completedExposureLedger";
import {
  buildProductionLongitudinalEvidenceTrajectory,
  classifyProductionLongitudinalEvidenceApplicability,
  validateProductionLongitudinalEvidenceWindow,
  validateProductionRepeatedLongitudinalEvidence,
} from "./evidence";
import {
  buildProductionLongitudinalDecisionRevision,
  deriveProductionLongitudinalDecisionId,
  deriveProductionLongitudinalDirectiveId,
  validateProductionLongitudinalStateRevisionLedger,
  validateProductionLongitudinalThreadIdentity,
} from "./identities";
import {
  generateProductionLongitudinalActionCandidates,
  selectPrimaryProductionLongitudinalAction,
} from "./actionCandidates";
import { validateProductionLongitudinalApplicationCandidate } from "./applicationValidation";
import { resolveProductionLongitudinalAdaptationPolicy } from "./policies/policyResolution";
import { PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE } from "./sourceContracts";
import {
  activeProductionLongitudinalSourceRecords,
  validateProductionLongitudinalOutcomeSourceSnapshot,
} from "./sourceRevisions";

function contractReasons(input: ProductionLongitudinalAdaptationInput): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(input.contractReference, PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_VERSION");
  }
  if (!sameSemanticValue(input.outcomeSourceContract, PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE) ||
      !sameSemanticValue(input.outcomeSourceSnapshot.contractReference,
        PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION");
  }
  if (!explicitIsoTime(input.evaluationTime) || input.outcomeSourceSnapshot.evaluationTime !== input.evaluationTime ||
      input.completedExposureLedger.evaluationTime !== input.evaluationTime ||
      input.evidenceWindow.evaluationTime !== input.evaluationTime) reasons.push("LONGITUDINAL_EVALUATION_TIME_INVALID");
  if (!input.decisionAttemptId.trim()) reasons.push("LONGITUDINAL_DECISION_ATTEMPT_ID_REQUIRED");
  reasons.push(...validateProductionLongitudinalThreadIdentity(input.threadIdentity));
  reasons.push(...validateProductionLongitudinalStateRevisionLedger(input.stateRevisionLedger));
  if (input.currentStateRevision.revisionId !== input.stateRevisionLedger.finalRevisionId ||
      !input.currentStateRevision.finalForDecision ||
      input.currentStateRevision.decisionAttemptId !== input.decisionAttemptId ||
      input.currentStateRevision.stateIdentity.threadId !== input.threadIdentity.threadId ||
      input.target.athleteId !== input.threadIdentity.athleteId ||
      input.target.targetScope !== input.threadIdentity.targetScope) {
    reasons.push("LONGITUDINAL_THREAD_STATE_TARGET_LINEAGE_INVALID");
  }
  if (input.target.currentProgramSnapshotId !== input.currentProgramSnapshot.snapshotId ||
      input.target.currentProgramSnapshotRevisionId !== input.currentProgramSnapshot.snapshotRevisionId ||
      input.target.currentPhaseStateId !== input.currentProgramSnapshot.phaseStateId ||
      input.target.currentPhaseStateRevisionId !== input.currentProgramSnapshot.phaseStateRevisionId) {
    reasons.push("LONGITUDINAL_TARGET_PROGRAM_LINEAGE_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

function upstreamReasons(input: ProductionLongitudinalAdaptationInput): readonly string[] {
  const reasons: string[] = [];
  const authority = input.upstreamAuthority;
  const facts: readonly [boolean, string][] = [
    [authority.currentProgramTruthValid, "CURRENT_PROGRAM_TRUTH_INVALID"],
    [authority.sourceEventIntegrityValid, "SOURCE_EVENT_INTEGRITY_INVALID"],
    [authority.prescriptionValid, "PRESCRIPTION_AUTHORITY_INVALID"],
    [authority.sequenceValid, "SEQUENCE_AUTHORITY_INVALID"],
    [authority.weekValid, "WEEK_AUTHORITY_INVALID"],
    [authority.phaseContinuityValid, "PHASE_CONTINUITY_AUTHORITY_INVALID"],
    [authority.trainingSafetyValidated, "TRAINING_SAFETY_AUTHORITY_INVALID"],
  ];
  for (const [valid, reason] of facts) if (!valid) reasons.push(reason);
  reasons.push(...authority.unresolvedUpstreamBlockers.map((blocker) => `UNRESOLVED_UPSTREAM_BLOCKER:${blocker}`));
  if (!explicitIsoTime(authority.validatedAt) || Date.parse(authority.validatedAt) > Date.parse(input.evaluationTime)) {
    reasons.push("UPSTREAM_AUTHORITY_VALIDATION_TIME_INVALID");
  }
  if (input.currentProgramSnapshot.gate13Valid !== true || input.currentProgramSnapshot.phaseContextValid !== true) {
    reasons.push("CURRENT_PROGRAM_SNAPSHOT_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

function materialChangeSignals(signals: readonly string[]): boolean {
  const values = new Set(signals);
  return ["progression_ready", "repeated_target_failure", "repeated_adverse_response",
    "replacement_consideration", "week_reallocation_aggregate", "deload_review_aggregate"]
    .some((signal) => values.has(signal));
}

function subgateTraces(input: { readonly failure: ProductionLongitudinalSubgate | null;
  readonly reasons: readonly string[]; readonly upstreamFailure: boolean; readonly shadow: boolean }):
readonly ProductionLongitudinalSubgateTrace[] {
  const failureIndex = input.failure ? PRODUCTION_LONGITUDINAL_SUBGATES.indexOf(input.failure) : -1;
  return Object.freeze(PRODUCTION_LONGITUDINAL_SUBGATES.map((subgate, index) => {
    if (failureIndex < 0 || index < failureIndex) return Object.freeze({ subgate, state: "PASS" as const,
      scored: true, reasonCodes: Object.freeze(["PRODUCTION_LONGITUDINAL_SUBGATE_PASSED"]) });
    if (index === failureIndex) return Object.freeze({ subgate,
      state: input.upstreamFailure ? "NOT_REACHED" as const : "FAIL_STOP" as const,
      scored: !input.upstreamFailure, reasonCodes: input.reasons });
    return Object.freeze({ subgate,
      state: input.shadow ? "SHADOW_DIAGNOSTIC_ONLY" as const : "NOT_REACHED" as const,
      scored: false, reasonCodes: Object.freeze([input.shadow ? "INVALID_EARLIER_GATE_CONTEXT" :
        "EARLIER_PRODUCTION_LONGITUDINAL_SUBGATE_FAILED"]) });
  }));
}

function classification(action: ProductionLongitudinalActionCandidate["action"] | null): string {
  const values: Readonly<Record<ProductionLongitudinalActionCandidate["action"], string>> = {
    keep_current: "LONGITUDINAL_PRODUCTIVE_CONTINUITY_KEEP",
    repeat_for_confirmation: "LONGITUDINAL_REPEAT_FOR_CONFIRMATION",
    hold_current_prescription: "LONGITUDINAL_HOLD_MIXED_EVIDENCE",
    prescription_modification_review: "LONGITUDINAL_PRESCRIPTION_MODIFICATION_REVIEW",
    progress_prescription_axis: "LONGITUDINAL_PROGRESSION_AXIS_AUTHORIZED",
    regress_prescription_axis: "LONGITUDINAL_REGRESSION_AXIS_AUTHORIZED",
    reopen_candidate_selection_for_replacement: "LONGITUDINAL_REPLACEMENT_REVIEW_AUTHORIZED",
    reopen_candidate_selection_for_bounded_rotation: "LONGITUDINAL_ROTATION_REVIEW_AUTHORIZED",
    week_reallocation_review: "LONGITUDINAL_WEEK_REALLOCATION_REVIEW",
    deload_review: "LONGITUDINAL_DELOAD_REVIEW", phase_review: "LONGITUDINAL_PHASE_REVIEW",
    external_safety_review: "LONGITUDINAL_EXTERNAL_SAFETY_REVIEW",
    owner_review_required: "LONGITUDINAL_ACTION_CONFLICT",
    no_action_insufficient_evidence: "LONGITUDINAL_HOLD_INSUFFICIENT_EVIDENCE",
  };
  return action ? values[action] : "LONGITUDINAL_HOLD_INSUFFICIENT_EVIDENCE";
}

function statusFor(input: { readonly failure: ProductionLongitudinalSubgate | null;
  readonly failureKind: "contract" | "source" | "upstream" | "ledger" | "evidence" | "application" | null;
  readonly action: ProductionLongitudinalActionCandidate["action"] | null }): ProductionLongitudinalStatus {
  if (input.failureKind === "contract") return "contract_invalid";
  if (input.failureKind === "source") return "source_invalid";
  if (input.failureKind === "upstream") return "upstream_invalid";
  if (input.failureKind === "ledger") return "completed_ledger_invalid";
  if (input.failureKind === "evidence") return "evidence_invalid";
  if (input.failureKind === "application") return "application_invalid";
  if (input.action === "external_safety_review") return "safety_blocked";
  if (input.action === "owner_review_required") return "action_conflict";
  if (input.action === "hold_current_prescription") return "hold";
  if (!input.action || input.action === "no_action_insufficient_evidence") return "insufficient_evidence";
  if (["week_reallocation_review", "deload_review", "phase_review"].includes(input.action)) return "review_required";
  return "decision_authorized";
}

export function evaluateLongitudinalAdaptation(
  input: ProductionLongitudinalAdaptationInput,
): ProductionLongitudinalAdaptationResult {
  const policyResolution = resolveProductionLongitudinalAdaptationPolicy({ policy: input.policy,
    availablePolicies: input.availablePolicies });
  const contracts = [...contractReasons(input), ...policyResolution.status === "resolved" ? [] :
    policyResolution.reasonCodes];
  const sourceValidation = validateProductionLongitudinalOutcomeSourceSnapshot(input.outcomeSourceSnapshot);
  const upstream = upstreamReasons(input);
  const integrity = validateProductionCompletedExposureLedger({ ledger: input.completedExposureLedger,
    outcomeSnapshot: input.outcomeSourceSnapshot, currentProgramSnapshot: input.currentProgramSnapshot });
  const activeRecords = activeProductionLongitudinalSourceRecords(input.outcomeSourceSnapshot);
  const applicability = Object.freeze(activeRecords.map((record) =>
    classifyProductionLongitudinalEvidenceApplicability({ target: input.target, record })));
  const trajectory = buildProductionLongitudinalEvidenceTrajectory({ ledger: input.completedExposureLedger,
    outcomeSnapshot: input.outcomeSourceSnapshot, window: input.evidenceWindow, target: input.target });
  const evidenceReasons = [...validateProductionLongitudinalEvidenceWindow({ window: input.evidenceWindow,
    ledger: input.completedExposureLedger, outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target }),
    ...applicability.flatMap((entry) => entry.accepted ? [] : entry.reasonCodes),
    ...validateProductionRepeatedLongitudinalEvidence({ window: input.evidenceWindow,
      outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target,
      materialChangeClaimed: materialChangeSignals(trajectory.responseTrajectory) })];
  const policy = policyResolution.policy;
  const candidates = policy ? generateProductionLongitudinalActionCandidates({ target: input.target, trajectory,
    policy, safetyAllowed: input.trainingSafetyTrace.downstreamTrainingAllowed,
    progressionReviewReady: input.progressionReadinessTraces.some((trace) =>
      trace.exerciseId === input.target.exerciseId && trace.classification === "READY_FOR_PROGRESSION_REVIEW") }) :
    Object.freeze([]);
  const selected = policy ? selectPrimaryProductionLongitudinalAction({ candidates, policy }) : null;
  const candidateReasons = selected ? [] : ["NO_ELIGIBLE_LONGITUDINAL_ACTION"];
  const continuityReasons: string[] = [];
  if (!input.target.active || input.target.activeNeedIds.length === 0) {
    // Inactive targets resolve to insufficient evidence; they never authorize material change.
  } else if (input.target.targetScope === "exact_realization" && !input.target.exerciseId) {
    continuityReasons.push("EXACT_REALIZATION_TARGET_REQUIRES_EXERCISE_IDENTITY");
  }
  const application = validateProductionLongitudinalApplicationCandidate(input.optionalApplicationCandidate);

  let failure: ProductionLongitudinalSubgate | null = null;
  let failureKind: Parameters<typeof statusFor>[0]["failureKind"] = null;
  let reasons: readonly string[] = Object.freeze([]);
  let upstreamFailure = false;
  if (contracts.length) { failure = "16.0_contract_and_input_truth"; failureKind = "contract"; reasons = uniqueSorted(contracts); }
  else if (sourceValidation.reasonCodes.length) {
    failure = "16.3_evidence_applicability_and_chronology"; failureKind = "source";
    reasons = sourceValidation.reasonCodes;
  } else if (upstream.length) {
    failure = "16.1_upstream_authority"; failureKind = "upstream"; reasons = upstream; upstreamFailure = true;
  } else if (integrity.reasonCodes.length) {
    failure = "16.2_completed_outcome_ledger_integrity"; failureKind = "ledger"; reasons = integrity.reasonCodes;
  } else if (evidenceReasons.length) {
    failure = "16.3_evidence_applicability_and_chronology"; failureKind = "evidence";
    reasons = uniqueSorted(evidenceReasons);
  } else if (candidateReasons.length) {
    failure = "16.5_action_candidate_eligibility"; failureKind = "evidence"; reasons = candidateReasons;
  } else if (continuityReasons.length) {
    failure = "16.7_continuity_and_scope"; failureKind = "evidence"; reasons = uniqueSorted(continuityReasons);
  } else if (["action_erased", "action_scope_exceeded", "wrong_application_owner"].includes(application.status)) {
    failure = "16.8_optional_application_validation"; failureKind = "application"; reasons = application.reasonCodes;
  }

  const decisionId = deriveProductionLongitudinalDecisionId({ athleteId: input.target.athleteId,
    threadId: input.threadIdentity.threadId, evidenceWindowId: input.evidenceWindow.windowId,
    decisionAttemptId: input.decisionAttemptId });
  const decisionRevision = buildProductionLongitudinalDecisionRevision({ decisionId,
    outcomeSnapshotRevisionId: input.outcomeSourceSnapshot.snapshotRevisionId,
    evidenceWindowId: input.evidenceWindow.windowId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshot.snapshotRevisionId,
    phaseContinuityDecisionRevisionId: input.currentPhaseContinuityResult.decisionRevisionId,
    proposedApplicationSnapshotRevisionId: input.optionalApplicationCandidate?.proposedProgramSnapshot
      .snapshotRevisionId ?? null, stateRevisionId: input.currentStateRevision.revisionId,
    evaluationTime: input.evaluationTime,
    decisionContentFingerprint: deterministicToken({ action: selected?.action ?? null,
      axis: selected?.selectedAxis ?? null, failure, reasons }), priorContext: input.priorDecisionRevisionContext });
  const action = failure && failure !== "16.8_optional_application_validation" ? null : selected?.action ?? null;
  const decisionAuthorized = failure === null && action !== null &&
    !["owner_review_required", "no_action_insufficient_evidence"].includes(action);
  const directive: ProductionLongitudinalAdaptationActionDirective | null = action && selected ? Object.freeze({
    directiveId: deriveProductionLongitudinalDirectiveId({ decisionId,
      decisionRevisionId: decisionRevision.revision.decisionRevisionId, targetId: input.target.targetId,
      action, selectedAxis: selected.selectedAxis }), decisionId,
    decisionRevisionId: decisionRevision.revision.decisionRevisionId, targetId: input.target.targetId,
    targetScope: input.target.targetScope, action, selectedAxis: selected.selectedAxis,
    implicatedPrescriptionDimensions: input.target.implicatedPrescriptionDimensions,
    evidenceSourceRecordRevisions: trajectory.sourceRecordRevisions,
    sourceExposureEventIds: Object.freeze(uniqueSorted(input.completedExposureLedger.entries
      .map((entry) => entry.sourceExposureEventId))), reasonCodes: selected.reasonCodes,
    actionOwner: "longitudinal_adaptation", downstreamApplicationOwner: selected.applicationOwner,
    requiredFuturePolicyReferences: input.target.requiredFuturePolicyReferences,
    currentContinuityState: trajectory.currentState, unresolvedBlockers: selected.missingEvidence,
    reviewState: decisionAuthorized ? "authorized_unapplied" : action === "no_action_insufficient_evidence" ?
      "insufficient_evidence" : "review_required", decisionAuthorized, applicationApplied: false,
    provenance: Object.freeze(["production-longitudinal:decision-separate-from-application"]),
  }) : null;
  const detailed = [classification(action)];
  if (upstreamFailure) detailed.push("LONGITUDINAL_UPSTREAM_FAILED_SHADOW_ONLY");
  if (application.status === "action_erased") detailed.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  if (application.status === "action_scope_exceeded") detailed.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  if (application.status === "wrong_application_owner") detailed.push("LONGITUDINAL_WRONG_APPLICATION_OWNER");
  const trace = subgateTraces({ failure, reasons, upstreamFailure,
    shadow: Boolean(input.runShadowDiagnosticsAfterFailure) });
  return Object.freeze({ contractReference: PRODUCTION_LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    policyReference: policy?.reference ?? null,
    outcomeSourceReference: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    threadId: input.threadIdentity.threadId, stateId: input.currentStateRevision.stateIdentity.stateId,
    stateRevisionId: input.currentStateRevision.revisionId, decisionId,
    decisionRevisionId: decisionRevision.revision.decisionRevisionId, decisionRevisionLedger: decisionRevision.ledger,
    target: input.target, evidenceWindow: input.evidenceWindow, completedLedgerIntegrity: integrity,
    sourceRevisionTrace: sourceValidation.revisionTrace, evidenceApplicability: applicability, trajectory,
    currentStateClassification: trajectory.currentState, actionCandidates: candidates,
    selectedPrimaryAction: action, actionDirective: directive,
    detailedClassifications: Object.freeze(uniqueSorted(detailed)),
    blockers: failure ? reasons : selected?.missingEvidence ?? Object.freeze([]),
    conflicts: selected?.conflicts ?? Object.freeze([]), trainingSafetyTrace: input.trainingSafetyTrace,
    responseTrace: Object.freeze(input.trainingResponseReceiverTraces.map((value) =>
      `${value.exerciseId}:${value.continuityRecommendation}`)),
    progressionReadinessTrace: Object.freeze(input.progressionReadinessTraces.map((value) =>
      `${value.exerciseId}:${value.classification}:axis-selected=false`)),
    continuityTrace: Object.freeze(["local-before-global", "minimum-causally-sufficient-change",
      `productive-anchor:${input.target.productiveAnchor}`]),
    reexposureTrace: Object.freeze([`successful-reexposure:${trajectory.successfulReexposure}`]),
    replacementRotationTrace: Object.freeze(["replacement-identity-selected:false", "automatic-rotation:false"]),
    weekDeloadPhaseDeferralTrace: Object.freeze(["week-reallocation-applied:false", "deload-applied:false",
      "phase-mutation-applied:false"]), applicationValidation: application,
    firstFailingSubgate: failure, subgateTrace: trace,
    shadowDiagnostics: failure && input.runShadowDiagnosticsAfterFailure ?
      Object.freeze(["Production Longitudinal diagnostics are shadow-only after fail-stop"]) : Object.freeze([]),
    decisionTrace: Object.freeze([`state:${trajectory.currentState}`, `action:${action ?? "none"}`,
      `decision-authorized:${decisionAuthorized}`, "application-applied:false"]),
    status: statusFor({ failure, failureKind, action }), decisionAuthorized,
    programMutationApplied: false, prescriptionMutationApplied: false, exerciseReplacementApplied: false,
    rotationApplied: false, deloadApplied: false, weekReallocationApplied: false, phaseMutationApplied: false,
    applicationOwnerRequired: true,
    provenance: Object.freeze(["PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTED_NOT_ACTIVATED"]),
  });
}
