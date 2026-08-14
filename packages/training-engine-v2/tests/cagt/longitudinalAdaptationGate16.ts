import {
  LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
  LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  LONGITUDINAL_GATE_16_SUBGATES,
  LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  type LongitudinalAction,
  type LongitudinalAdaptationActionDirective,
  type LongitudinalAdaptationGate16Input,
  type LongitudinalAdaptationGate16Result,
  type LongitudinalDetailedClassification,
  type LongitudinalGate16Status,
  type LongitudinalGate16Subgate,
  type LongitudinalGate16SubgateTrace,
} from "../../src/longitudinalAdaptation/designContracts";
import { validateLongitudinalApplicationCandidate } from "./longitudinalAdaptationApplication";
import {
  classificationForAction,
  generateLongitudinalActionCandidates,
  selectPrimaryLongitudinalAction,
} from "./longitudinalAdaptationActions";
import {
  buildLongitudinalDecisionRevision,
  buildLongitudinalEvidenceTrajectory,
  classifyEvidenceApplicability,
  deriveLongitudinalDecisionId,
  validateCompletedExposureLedger,
  validateLongitudinalDecisionRevisionLedger,
  validateLongitudinalEvidenceWindow,
  validateLongitudinalStateRevisionLedger,
  validateLongitudinalThreadIdentity,
  validateRepeatedLongitudinalEvidence,
} from "./longitudinalAdaptationEvidence";
import { digest } from "./signatures";

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return Object.freeze([...new Set(values)].sort());
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function contractReasons(input: LongitudinalAdaptationGate16Input): readonly string[] {
  const reasons: string[] = [];
  if (!same(input.contractReference, LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_LONGITUDINAL_ADAPTATION_CONTRACT_VERSION");
  }
  if (input.authorityRegistry.reference.registryId !== "CAGT_EFFECTIVE_AUTHORITY_REGISTRY" ||
      input.authorityRegistry.reference.version !== "5.0.0" ||
      input.authorityRegistry.gates.gate_16_longitudinal_adaptation?.exactAuthority !==
        "LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE") reasons.push("CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V5_REQUIRED");
  if (!same(input.policy.reference, LONGITUDINAL_ADAPTATION_POLICY_REFERENCE) ||
      input.policy.state !== "OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION") {
    reasons.push("LONGITUDINAL_ADAPTATION_POLICY_V1_REQUIRED");
  }
  if (!same(input.outcomeSourceContract, LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE) ||
      !same(input.outcomeSourceSnapshot.contractReference, LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE)) {
    reasons.push("LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REQUIRED");
  }
  if (!explicitTime(input.evaluationTime) || input.outcomeSourceSnapshot.evaluationTime !== input.evaluationTime ||
      input.evidenceWindow.evaluationTime !== input.evaluationTime) reasons.push("LONGITUDINAL_EVALUATION_TIME_INVALID");
  if (!input.decisionAttemptId.trim()) reasons.push("LONGITUDINAL_DECISION_ATTEMPT_ID_REQUIRED");
  reasons.push(...validateLongitudinalThreadIdentity(input.threadIdentity));
  reasons.push(...validateLongitudinalStateRevisionLedger(input.stateRevisionLedger));
  if (input.currentStateRevision.revisionId !== input.stateRevisionLedger.finalRevisionId ||
      !input.currentStateRevision.finalForDecision ||
      input.currentStateRevision.decisionAttemptId !== input.decisionAttemptId ||
      input.currentStateRevision.stateIdentity.threadId !== input.threadIdentity.threadId ||
      input.target.athleteId !== input.threadIdentity.athleteId ||
      input.target.targetScope !== input.threadIdentity.targetScope) {
    reasons.push("LONGITUDINAL_THREAD_STATE_TARGET_LINEAGE_INVALID");
  }
  return unique(reasons);
}

function traces(input: { readonly failure: LongitudinalGate16Subgate | null;
  readonly upstreamFailure: boolean; readonly reasons: readonly string[]; readonly shadow: boolean }):
readonly LongitudinalGate16SubgateTrace[] {
  const failureIndex = input.failure ? LONGITUDINAL_GATE_16_SUBGATES.indexOf(input.failure) : -1;
  return Object.freeze(LONGITUDINAL_GATE_16_SUBGATES.map((subgate, index) => {
    if (failureIndex < 0 || index < failureIndex) return Object.freeze({ subgate, state: "PASS" as const,
      scored: true, reasonCodes: Object.freeze(["LONGITUDINAL_SUBGATE_PASSED"]) });
    if (index === failureIndex) return Object.freeze({ subgate,
      state: input.upstreamFailure ? "NOT_REACHED" as const : "FAIL_STOP" as const,
      scored: !input.upstreamFailure, reasonCodes: input.reasons });
    return Object.freeze({ subgate, state: input.shadow ? "SHADOW_DIAGNOSTIC_ONLY" as const : "NOT_REACHED" as const,
      scored: false, reasonCodes: Object.freeze([input.shadow ? "INVALID_EARLIER_GATE_CONTEXT" :
        "EARLIER_LONGITUDINAL_SUBGATE_FAILED"]) });
  }));
}

function ownerForAction(action: LongitudinalAction): LongitudinalAdaptationActionDirective["downstreamApplicationOwner"] {
  if (["progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review"]
    .includes(action)) return "prescription_compiler";
  if (["reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation"]
    .includes(action)) return "candidate_intelligence_and_composer";
  if (["week_reallocation_review", "deload_review"].includes(action)) return "week_owner";
  if (action === "phase_review") return "phase_continuity_owner";
  if (action === "external_safety_review") return "training_safety_owner";
  if (["owner_review_required", "no_action_insufficient_evidence"].includes(action)) return "human_owner_review";
  return "product_application";
}

function statusFor(input: { readonly action: LongitudinalAction | null;
  readonly failure: LongitudinalGate16Subgate | null }): LongitudinalGate16Status {
  if (input.failure === "16.0_contract_and_fixture_truth") return "longitudinal_contract_invalid";
  if (input.failure === "16.1_upstream_validity") return "longitudinal_upstream_invalid";
  if (input.failure === "16.2_completed_outcome_ledger_integrity") return "longitudinal_outcome_ledger_invalid";
  if (input.failure === "16.3_evidence_applicability_and_chronology") return "longitudinal_evidence_invalid";
  if (input.failure === "16.8_optional_application_validation") return "longitudinal_application_invalid";
  if (input.action === "external_safety_review") return "longitudinal_safety_blocked";
  if (input.action === "owner_review_required") return "longitudinal_action_conflict";
  if (input.action === "hold_current_prescription") return "longitudinal_hold";
  if (!input.action || input.action === "no_action_insufficient_evidence") return "longitudinal_insufficient_evidence";
  if (["week_reallocation_review", "deload_review", "phase_review"].includes(input.action)) {
    return "longitudinal_review_required";
  }
  return "longitudinal_decision_authorized";
}

function materialChangeSignals(signals: readonly string[]): boolean {
  const signalSet = new Set(signals);
  const materialSignals = ["progression_ready", "repeated_target_failure", "repeated_adverse_response",
    "replacement_consideration"] as const;
  return materialSignals.some((signal) => signalSet.has(signal));
}

export function runLongitudinalAdaptationGate16(
  input: LongitudinalAdaptationGate16Input,
): LongitudinalAdaptationGate16Result {
  const contracts = contractReasons(input);
  const upstream = input.upstreamGateStates.filter((entry) => entry.state === "FAIL_STOP")
    .map((entry) => `UPSTREAM_GATE_FAILED:${entry.gate}`);
  const integrity = validateCompletedExposureLedger({ ledger: input.completedExposureLedger,
    outcomeSnapshot: input.outcomeSourceSnapshot, currentProgramSnapshot: input.currentProgramSnapshot });
  const applicability = Object.freeze(input.outcomeSourceSnapshot.sourceRecords.map((record) =>
    classifyEvidenceApplicability({ target: input.target, record })));
  const trajectory = buildLongitudinalEvidenceTrajectory({ ledger: input.completedExposureLedger,
    outcomeSnapshot: input.outcomeSourceSnapshot, window: input.evidenceWindow });
  const evidenceReasons = [...validateLongitudinalEvidenceWindow({ window: input.evidenceWindow,
    ledger: input.completedExposureLedger, outcomeSnapshot: input.outcomeSourceSnapshot, target: input.target }),
  ...applicability.flatMap((entry) => entry.accepted ? [] : entry.reasonCodes),
  ...validateRepeatedLongitudinalEvidence({ window: input.evidenceWindow,
    outcomeSnapshot: input.outcomeSourceSnapshot,
    materialChangeClaimed: materialChangeSignals(trajectory.responseTrajectory) })];
  const candidates = generateLongitudinalActionCandidates({ target: input.target, trajectory,
    outcomeSnapshot: input.outcomeSourceSnapshot });
  const selected = selectPrimaryLongitudinalAction(candidates);
  const ownerReasons: string[] = [];
  if (!selected) ownerReasons.push("NO_ELIGIBLE_LONGITUDINAL_ACTION");
  if (selected && candidates.filter((entry) => entry.eligible && entry.targetId === selected.targetId &&
      entry.action !== selected.action && entry.action !== "keep_current" && entry.action !== "repeat_for_confirmation" &&
      entry.action !== "hold_current_prescription").length > 1 && selected.action !== "external_safety_review") {
    ownerReasons.push("MULTIPLE_PRIMARY_ACTIONS_FOR_ONE_TARGET");
  }
  const continuityReasons: string[] = [];
  if (!input.target.active || input.target.activeNeedIds.length === 0) continuityReasons.push("ACTIVE_TARGET_REQUIRED");
  if (input.target.currentProgramSnapshotId !== input.currentProgramSnapshot.snapshotId) {
    continuityReasons.push("LONGITUDINAL_TARGET_PROGRAM_LINEAGE_INVALID");
  }
  const application = validateLongitudinalApplicationCandidate(input.optionalApplicationCandidate);

  let failure: LongitudinalGate16Subgate | null = null;
  let reasons: readonly string[] = Object.freeze([]);
  let upstreamFailure = false;
  if (contracts.length) { failure = "16.0_contract_and_fixture_truth"; reasons = contracts; }
  else if (upstream.length) { failure = "16.1_upstream_validity"; reasons = unique(upstream); upstreamFailure = true; }
  else if (integrity.reasonCodes.length) {
    failure = "16.2_completed_outcome_ledger_integrity"; reasons = integrity.reasonCodes;
  } else if (evidenceReasons.length) {
    failure = "16.3_evidence_applicability_and_chronology"; reasons = unique(evidenceReasons);
  } else if (ownerReasons.includes("NO_ELIGIBLE_LONGITUDINAL_ACTION")) {
    failure = "16.5_action_candidate_eligibility"; reasons = unique(ownerReasons);
  } else if (ownerReasons.length) {
    failure = "16.6_action_selection_and_owner_boundary"; reasons = unique(ownerReasons);
  } else if (continuityReasons.length) {
    failure = "16.7_continuity_and_scope"; reasons = unique(continuityReasons);
  } else if (["action_erased", "action_scope_exceeded"].includes(application.status)) {
    failure = "16.8_optional_application_validation"; reasons = application.reasonCodes;
  }

  const decisionId = deriveLongitudinalDecisionId({ athleteId: input.target.athleteId,
    threadId: input.threadIdentity.threadId, evidenceWindowId: input.evidenceWindow.windowId,
    decisionAttemptId: input.decisionAttemptId });
  const decisionRevision = buildLongitudinalDecisionRevision({ decisionId,
    outcomeSnapshotRevisionId: input.outcomeSourceSnapshot.snapshotRevisionId,
    evidenceWindowId: input.evidenceWindow.windowId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshot.snapshotRevisionId,
    phaseContinuityDecisionRevisionId: input.currentPhaseContinuityResult.decisionRevisionId,
    proposedApplicationSnapshotRevisionId: input.optionalApplicationCandidate?.proposedProgramSnapshot
      .snapshotRevisionId ?? null,
    stateRevisionId: input.currentStateRevision.revisionId, evaluationTime: input.evaluationTime,
    contentFingerprint: digest({ selected: selected?.action ?? null, axis: selected?.selectedAxis ?? null,
      failure, reasons }), priorContext: input.priorDecisionRevisionContext });
  const action = failure && failure !== "16.8_optional_application_validation" ? null : selected?.action ?? null;
  const decisionAuthorized = failure === null && action !== null &&
    !["owner_review_required", "no_action_insufficient_evidence"]
    .includes(action);
  const directive: LongitudinalAdaptationActionDirective | null = action && selected ? Object.freeze({
    directiveId: digest({ decisionId, revisionId: decisionRevision.revision.decisionRevisionId,
      targetId: input.target.targetId, action, axis: selected.selectedAxis }), decisionId,
    decisionRevisionId: decisionRevision.revision.decisionRevisionId, targetId: input.target.targetId,
    targetScope: input.target.targetScope, action, selectedAxis: selected.selectedAxis,
    implicatedPrescriptionDimensions: input.target.implicatedPrescriptionDimensions,
    evidenceRecordIds: trajectory.sourceRecordIds,
    sourceExposureEventIds: unique(input.completedExposureLedger.entries.map((entry) => entry.sourceExposureEventId)),
    reasonCodes: selected.reasonCodes, actionOwner: "longitudinal_adaptation_owner",
    downstreamApplicationOwner: ownerForAction(action),
    requiredFuturePolicyReferences: input.target.requiredFuturePolicyRefs,
    currentContinuityState: trajectory.currentState, unresolvedBlockers: selected.missingEvidence,
    reviewState: decisionAuthorized ? "authorized_unapplied" : action === "no_action_insufficient_evidence" ?
      "insufficient_evidence" : "review_required", decisionAuthorized, applicationApplied: false,
    provenance: Object.freeze(["Gate16:decision-separate-from-application"]) }) : null;
  const detailed: LongitudinalDetailedClassification[] = [classificationForAction(action)];
  if (upstreamFailure) detailed.push("LONGITUDINAL_UPSTREAM_FAILED_SHADOW_ONLY");
  if (application.status === "action_erased") detailed.push("LONGITUDINAL_ACTION_ERASED_DOWNSTREAM");
  if (application.status === "action_scope_exceeded") detailed.push("LONGITUDINAL_ACTION_SCOPE_EXCEEDED");
  const subgateTrace = traces({ failure, upstreamFailure, reasons,
    shadow: Boolean(input.runShadowDiagnosticsAfterFailure) });
  return Object.freeze({ contractReference: LONGITUDINAL_ADAPTATION_CONTRACT_REFERENCE,
    authorityRegistryReference: input.authorityRegistry.reference,
    policyReference: LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
    outcomeSourceReference: LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
    threadId: input.threadIdentity.threadId, stateId: input.currentStateRevision.stateIdentity.stateId,
    stateRevisionId: input.currentStateRevision.revisionId, decisionId,
    decisionRevisionId: decisionRevision.revision.decisionRevisionId,
    decisionRevisionLedger: decisionRevision.ledger, target: input.target, evidenceWindow: input.evidenceWindow,
    completedLedgerIntegrity: integrity, evidenceApplicability: applicability, trajectory,
    currentStateClassification: trajectory.currentState, actionCandidates: candidates,
    selectedPrimaryAction: action, actionDirective: directive, detailedClassifications: unique(detailed),
    blockers: failure ? reasons : selected?.missingEvidence ?? Object.freeze([]),
    conflicts: selected?.conflicts ?? Object.freeze([]), trainingSafetyTrace: input.trainingSafetyTrace,
    responseTrace: Object.freeze(input.trainingResponseReceiverTraces.map((trace) =>
      `${trace.exerciseId}:${trace.continuityRecommendation}`)),
    progressionReadinessTrace: Object.freeze(input.progressionReadinessTraces.map((trace) =>
      `${trace.exerciseId}:${trace.classification}:axis-selected=false`)),
    continuityTrace: Object.freeze(["local-before-global", "minimum-causally-sufficient-change",
      `productive-anchor:${input.target.productiveAnchor}`]),
    reexposureTrace: Object.freeze([`successful-reexposure:${trajectory.successfulReexposure}`]),
    replacementRotationTrace: Object.freeze(["replacement-identity-selected:false", "automatic-rotation:false"]),
    ownerDeferralTrace: Object.freeze([`downstream-owner:${directive?.downstreamApplicationOwner ?? "none"}`]),
    applicationValidation: application, firstFailingSubgate: failure, subgateTrace,
    shadowDiagnostics: failure && input.runShadowDiagnosticsAfterFailure ?
      Object.freeze(["Gate16 diagnostics are shadow-only after fail-stop"]) : Object.freeze([]),
    decisionTrace: Object.freeze([`state:${trajectory.currentState}`, `action:${action ?? "none"}`,
      `decision-authorized:${decisionAuthorized}`, "program-mutation:false"]),
    status: statusFor({ action, failure }), decisionAuthorized,
    programMutationApplied: false, prescriptionMutationApplied: false, exerciseReplacementApplied: false,
    rotationApplied: false, deloadApplied: false, weekReallocationApplied: false, phaseMutationApplied: false,
    applicationOwnerRequired: true,
    provenance: Object.freeze(["LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME"]) });
}

export function validateLongitudinalAdaptationGate16Result(
  result: LongitudinalAdaptationGate16Result,
): readonly string[] {
  const reasons: string[] = [];
  reasons.push(...validateLongitudinalDecisionRevisionLedger(result.decisionRevisionLedger));
  if (result.programMutationApplied || result.prescriptionMutationApplied || result.exerciseReplacementApplied ||
      result.rotationApplied || result.deloadApplied || result.weekReallocationApplied || result.phaseMutationApplied ||
      !result.applicationOwnerRequired) reasons.push("LONGITUDINAL_DECISION_APPLICATION_BOUNDARY_VIOLATED");
  const failureIndex = result.firstFailingSubgate ? result.subgateTrace.findIndex((entry) =>
    entry.subgate === result.firstFailingSubgate) : -1;
  if (failureIndex >= 0 && result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
    reasons.push("LONGITUDINAL_DOWNSTREAM_RESCUE_ACCEPTED");
  }
  if (result.actionDirective?.action.includes("replacement") &&
      result.actionDirective.implicatedPrescriptionDimensions.includes("selected_exercise_identity")) {
    reasons.push("GATE_16_SELECTED_REPLACEMENT_IDENTITY");
  }
  return unique(reasons);
}
