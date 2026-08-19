import { deterministicToken, explicitIsoTime, sameSemanticValue } from "../prescription/compiler/utilities";
import {
  PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_CONTINUITY_SUBGATES,
  type ProductionPhaseContinuityDetailedClassification,
  type ProductionPhaseContinuityInput,
  type ProductionPhaseContinuityResult,
  type ProductionPhaseContinuityStatus,
  type ProductionPhaseContinuitySubgate,
  type ProductionPhaseContinuitySubgateTrace,
  type ProductionPhaseCriterionEvaluation,
  type ProductionPhaseProgramContinuityClassification,
} from "./contracts";
import { alignProductionPhaseProgramSnapshots, measureProductionPhaseContinuity } from "./crossHorizonAlignment";
import { evaluateProductionPhaseCriterion } from "./criterionEvaluation";
import {
  buildPhaseContinuityDecisionRevision,
  derivePhaseContinuityDecisionId,
  derivePhaseStateRevisionId,
} from "./identity";
import { resolvePhaseContinuityPolicy } from "./policies";
import { PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE } from "./sourceContracts";
import { classifyProductionPhaseTransition, PRODUCTION_PHASE_TRANSITION_GRAPH } from "./transitionGraph";
import { validateProductionPhaseContinuityContractAndInput,
  validateProductionPhaseProgramTruth } from "./validation";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function validatePhaseState(input: ProductionPhaseContinuityInput): readonly string[] {
  const reasons: string[] = [];
  const revision = input.currentPhaseStateRevision;
  const proposal = input.transitionProposal;
  if (revision.phaseStateIdentity.phaseCycleId !== input.phaseCycleIdentity.phaseCycleId ||
      revision.phaseStateIdentity.athleteId !== input.phaseCycleIdentity.athleteId ||
      revision.phaseStateIdentity.phaseStateId !== input.currentProgramSnapshot.phaseStateId) {
    reasons.push("PRODUCTION_PHASE_STATE_IDENTITY_INVALID");
  }
  if (revision.currentPhaseId !== input.currentProgramSnapshot.phaseId ||
      proposal.proposedTargetPhaseId !== input.proposedProgramSnapshot.phaseId ||
      !input.currentProgramSnapshot.phaseContextValid || !input.proposedProgramSnapshot.phaseContextValid) {
    reasons.push("PROGRAM_PHASE_CONTEXT_MISMATCH");
  }
  const phases = ["phase_1", "phase_2", "phase_3"] as const;
  if (!phases.includes(proposal.currentPhaseId) || !phases.includes(proposal.proposedTargetPhaseId)) {
    reasons.push("TARGET_PHASE_INVALID");
    return unique(reasons);
  }
  const graph = classifyProductionPhaseTransition(proposal.currentPhaseId, proposal.proposedTargetPhaseId);
  if (graph === "non_adjacent_not_authorized") {
    reasons.push(PRODUCTION_PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult);
  } else if (graph === "regression_review" && proposal.transitionKind !== "regression_review") {
    reasons.push("BACKWARD_TRANSITION_MUST_BE_REVIEW_ONLY");
  } else if (graph !== proposal.transitionKind && !(proposal.currentPhaseId === "phase_3" &&
      proposal.proposedTargetPhaseId === "phase_3" && proposal.transitionKind === "cycle_completion_review")) {
    reasons.push("PHASE_TRANSITION_KIND_MISMATCH");
  }
  return unique(reasons);
}

function definitionsForProposal(input: ProductionPhaseContinuityInput) {
  const ids = new Set(input.transitionProposal.criterionDefinitionIds);
  return input.criterionDefinitions.filter((entry) => ids.has(entry.criterionId));
}

function validateEvidenceTruth(input: ProductionPhaseContinuityInput): readonly string[] {
  const reasons: string[] = [];
  const snapshot = input.evidenceSnapshot;
  if (!snapshot) return Object.freeze(["PHASE_EVIDENCE_SOURCE_ADAPTER_REQUIRED"]);
  if (!sameSemanticValue(snapshot.evidenceContract, PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE)) {
    reasons.push("PHASE_EVIDENCE_SOURCE_CONTRACT_UNAVAILABLE");
  }
  if (snapshot.athleteId !== input.phaseCycleIdentity.athleteId ||
      snapshot.phaseCycleId !== input.phaseCycleIdentity.phaseCycleId ||
      snapshot.phaseStateRevisionId !== input.currentPhaseStateRevision.phaseStateRevisionId) {
    reasons.push("PHASE_EVIDENCE_SNAPSHOT_LINEAGE_INVALID");
  }
  if (!explicitIsoTime(snapshot.evaluationTime) || snapshot.evaluationTime !== input.evaluationTime) {
    reasons.push("PHASE_EVIDENCE_SNAPSHOT_TIME_INVALID");
  }
  const sourceIds = snapshot.sourceRecords.map((entry) => entry.sourceRecordId);
  const criterionIds = snapshot.criterionRecords.map((entry) => entry.evidenceRecordId);
  if (new Set(sourceIds).size !== sourceIds.length) reasons.push("DUPLICATE_PHASE_EVIDENCE_SOURCE_RECORD");
  if (new Set(criterionIds).size !== criterionIds.length) reasons.push("DUPLICATE_PHASE_CRITERION_EVIDENCE_RECORD");
  if (input.criterionEvidenceRecords.some((entry) => !criterionIds.includes(entry.evidenceRecordId))) {
    reasons.push("PHASE_CRITERION_RECORD_NOT_IN_EVIDENCE_SNAPSHOT");
  }
  const definitions = definitionsForProposal(input);
  if (input.transitionProposal.transitionKind === "adjacent_advancement" && definitions.length === 0) {
    reasons.push("PHASE_ADVANCEMENT_CRITERIA_REQUIRED");
  }
  if (new Set(definitions.map((entry) => entry.criterionId)).size !== definitions.length) {
    reasons.push("DUPLICATE_PHASE_CRITERION_DEFINITION");
  }
  for (const definition of definitions) {
    if (definition.currentPhaseId !== input.transitionProposal.currentPhaseId ||
        definition.targetPhaseId !== input.transitionProposal.proposedTargetPhaseId ||
        definition.reviewStatus !== "owner_accepted" || !definition.reviewer ||
        !explicitIsoTime(definition.reviewedAt) || definition.provenance.length === 0) {
      reasons.push(`PHASE_CRITERION_DEFINITION_INVALID:${definition.criterionId}`);
    }
  }
  if (input.transitionProposal.evidenceRecordIds.some((id) => !criterionIds.includes(id)) ||
      input.transitionProposal.blockerRecordIds.some((id) => !criterionIds.includes(id))) {
    reasons.push("PHASE_PROPOSAL_EVIDENCE_REFERENCE_MISSING");
  }
  return unique(reasons);
}

function disposition(input: ProductionPhaseContinuityInput,
  evaluations: readonly ProductionPhaseCriterionEvaluation[]): {
  readonly status: ProductionPhaseContinuityStatus;
  readonly classification: ProductionPhaseContinuityDetailedClassification;
  readonly blockers: readonly string[];
  readonly conflicts: readonly string[];
} {
  const proposal = input.transitionProposal;
  if (!input.trainingSafetyTrace.downstreamTrainingAllowed) return {
    status: "transition_blocked_by_training_safety", classification: "PHASE_HOLD_DUE_BLOCKER",
    blockers: input.trainingSafetyTrace.unresolvedSignalIds, conflicts: [],
  };
  const graph = classifyProductionPhaseTransition(proposal.currentPhaseId, proposal.proposedTargetPhaseId);
  if (graph === "non_adjacent_not_authorized") return {
    status: "transition_not_authorized", classification: "PHASE_ADVANCEMENT_NOT_AUTHORIZED",
    blockers: [PRODUCTION_PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult], conflicts: [],
  };
  if (graph === "regression_review" || proposal.transitionKind === "regression_review") return {
    status: "phase_regression_review_required", classification: "PHASE_REGRESSION_REVIEW_REQUIRED",
    blockers: [], conflicts: [],
  };
  if (proposal.currentPhaseId === "phase_3" && proposal.transitionKind === "cycle_completion_review") return {
    status: "phase_cycle_completion_owner_review_required",
    classification: "PHASE_CYCLE_COMPLETION_OWNER_REVIEW_REQUIRED", blockers: [], conflicts: [],
  };
  if (proposal.transitionKind === "stay") return { status: "remain_current_phase",
    classification: "PHASE_STAY_JUSTIFIED", blockers: [], conflicts: [] };
  const conflicts = evaluations.filter((entry) => entry.state === "conflict").map((entry) => entry.criterionId);
  if (conflicts.length > 0) return { status: "transition_evidence_conflict",
    classification: "PHASE_TRANSITION_EVIDENCE_CONFLICT", blockers: [], conflicts };
  const blockers = evaluations.filter((entry) => entry.state === "blocked").map((entry) => entry.criterionId);
  if (blockers.length > 0) return { status: "hold_current_phase_due_blocker",
    classification: "PHASE_HOLD_DUE_BLOCKER", blockers, conflicts: [] };
  if (evaluations.length === 0 || evaluations.some((entry) => entry.state !== "met")) return {
    status: "hold_current_phase_pending_evidence", classification: "PHASE_HOLD_PENDING_EVIDENCE",
    blockers: [], conflicts: [],
  };
  return { status: "advance_to_next_phase_authorized", classification: "PHASE_ADVANCEMENT_AUTHORIZED",
    blockers: [], conflicts: [] };
}

function traces(input: {
  readonly failure: ProductionPhaseContinuitySubgate | null;
  readonly upstreamFailure: boolean;
  readonly reasons: readonly string[];
  readonly shadow: boolean;
}): readonly ProductionPhaseContinuitySubgateTrace[] {
  const failureIndex = input.failure ? PRODUCTION_PHASE_CONTINUITY_SUBGATES.indexOf(input.failure) : -1;
  return Object.freeze(PRODUCTION_PHASE_CONTINUITY_SUBGATES.map((subgate, index) => {
    if (failureIndex < 0 || index < failureIndex) return Object.freeze({ subgate, state: "PASS" as const,
      scored: true, reasonCodes: Object.freeze(["PRODUCTION_PHASE_CONTINUITY_STAGE_PASSED"]) });
    if (index === failureIndex) return Object.freeze({ subgate,
      state: input.upstreamFailure ? "NOT_REACHED" as const : "FAIL_STOP" as const,
      scored: !input.upstreamFailure, reasonCodes: input.reasons });
    return Object.freeze({ subgate, state: input.shadow ? "SHADOW_DIAGNOSTIC_ONLY" as const : "NOT_REACHED" as const,
      scored: false, reasonCodes: Object.freeze([input.shadow ? "INVALID_EARLIER_STAGE_CONTEXT" :
        "EARLIER_PHASE_CONTINUITY_STAGE_FAILED"]) });
  }));
}

export function evaluatePhaseContinuity(input: ProductionPhaseContinuityInput): ProductionPhaseContinuityResult {
  const policyResolution = resolvePhaseContinuityPolicy({ policy: input.policy,
    availablePolicies: input.availablePolicies });
  const contractReasons = [...validateProductionPhaseContinuityContractAndInput(input)];
  if (policyResolution.status !== "resolved") contractReasons.push(...policyResolution.reasonCodes);
  const upstreamReasons = validateProductionPhaseProgramTruth(input);
  const stateReasons = validatePhaseState(input);
  const evidenceReasons = validateEvidenceTruth(input);
  const selected = new Set(input.transitionProposal.evidenceRecordIds);
  const evaluations = definitionsForProposal(input).map((definition) => evaluateProductionPhaseCriterion({
    kernelInput: input, definition, records: input.criterionEvidenceRecords.filter((record) =>
      record.criterionId === definition.criterionId && selected.has(record.evidenceRecordId)),
  }));
  const invalidEvaluationReasons = evaluations.filter((entry) => entry.state === "invalid")
    .flatMap((entry) => entry.reasonCodes);
  const decision = disposition(input, evaluations);
  const alignment = alignProductionPhaseProgramSnapshots({ current: input.currentProgramSnapshot,
    proposed: input.proposedProgramSnapshot,
    explicitMappings: input.transitionProposal.explicitEntityMappings });
  const material = input.transitionProposal.changedFacts.filter((entry) => entry.material);
  const programMaterial = material.filter((entry) => entry.dimension !== "phase_state");
  const phaseOwned = programMaterial.filter((entry) => entry.owner === "phase_policy").length;
  const nonPhaseOwned = programMaterial.length - phaseOwned;
  const metrics = measureProductionPhaseContinuity({ current: input.currentProgramSnapshot,
    proposed: input.proposedProgramSnapshot, alignment, phaseOwnedChangeCount: phaseOwned,
    nonPhaseOwnedChangeCount: nonPhaseOwned,
    replacementConsiderationCount: 0 });
  const phaseFrameworkChange = material.some((entry) => entry.owner === "phase_policy" &&
    entry.dimension === "program_framework");
  const excessiveRegeneration = phaseFrameworkChange || (phaseOwned > 0 && metrics.frameworkRetentionRate === 0) ||
    metrics.unexplainedChangeCount > Math.max(1, input.currentProgramSnapshot.entities.length / 2);
  const anchorDisplacement = material.some((entry) => entry.owner === "phase_policy" &&
    entry.dimension === "productive_anchor" && entry.reasonCode !== "productive_anchor_continuity");
  const wrongLayer = material.some((entry) => entry.owner === "phase_policy" && [
    "explicit_outcome_goal", "weekly_objective", "opportunity_schedule", "structural_capacity",
  ].includes(entry.dimension));
  const automatic = material.some((entry) => entry.dimension.startsWith("automatic_"));
  const supportViolation = material.some((entry) => entry.owner === "phase_policy" &&
    entry.dimension === "supporting_dependency" && entry.reasonCode !== "supporting_dependency_changed");

  let failure: ProductionPhaseContinuitySubgate | null = null;
  let reasons: readonly string[] = Object.freeze([]);
  let upstreamFailure = false;
  if (contractReasons.length > 0) { failure = "15.0_contract_and_input_truth"; reasons = unique(contractReasons); }
  else if (upstreamReasons.length > 0) { failure = "15.1_upstream_program_truth";
    reasons = upstreamReasons; upstreamFailure = true; }
  else if (stateReasons.length > 0) { failure = "15.2_phase_state_truth"; reasons = stateReasons; }
  else if (evidenceReasons.length > 0 || invalidEvaluationReasons.length > 0) {
    failure = "15.3_evidence_truth"; reasons = unique([...evidenceReasons, ...invalidEvaluationReasons]);
  } else if (alignment.status !== "aligned") {
    failure = "15.5_cross_horizon_alignment"; reasons = alignment.reasonCodes;
  } else if (excessiveRegeneration || anchorDisplacement) {
    failure = "15.6_stable_base_continuity";
    reasons = unique([...(excessiveRegeneration ? ["PHASE_PROGRAM_EXCESSIVE_REGENERATION"] : []),
      ...(anchorDisplacement ? ["PRODUCTIVE_ANCHOR_DISPLACED_SOLELY_BY_PHASE"] : [])]);
  } else if (wrongLayer || automatic) {
    failure = "15.7_local_phase_owned_change";
    reasons = unique([...(wrongLayer ? ["PHASE_WRONG_LAYER_EFFECT"] : []),
      ...(automatic ? ["GATE_16_ACTION_NOT_AUTHORIZED_BY_PHASE_CONTINUITY"] : [])]);
  } else if (supportViolation) {
    failure = "15.8_supporting_continuity"; reasons = Object.freeze(["PHASE_SUPPORTING_DEPENDENCY_VIOLATION"]);
  }

  let status = decision.status;
  const detailed: ProductionPhaseContinuityDetailedClassification[] = [
    failure && decision.classification === "PHASE_ADVANCEMENT_AUTHORIZED" ?
      "PHASE_ADVANCEMENT_NOT_AUTHORIZED" : decision.classification,
  ];
  if (failure === "15.0_contract_and_input_truth") {
    status = contractReasons.includes("UNSUPPORTED_PRODUCTION_PHASE_CONTINUITY_CONTRACT_VERSION") ?
      "unsupported_phase_continuity_contract" : policyResolution.status === "required" ?
        "phase_continuity_policy_required" : policyResolution.status === "unavailable" ?
          "phase_continuity_policy_unavailable" : policyResolution.status === "conflict" ?
            "phase_continuity_policy_conflict" : contractReasons.some((entry) =>
              entry.includes("DECISION_REVISION")) ? "invalid_decision_revision_context" :
                "current_phase_state_invalid";
  } else if (failure === "15.1_upstream_program_truth") {
    status = "upstream_program_invalid"; detailed.push("PHASE_UPSTREAM_FAILED_SHADOW_ONLY");
  } else if (failure === "15.2_phase_state_truth") {
    status = stateReasons.includes("TARGET_PHASE_INVALID") ? "target_phase_invalid" :
      stateReasons.includes(PRODUCTION_PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult) ?
        "transition_not_authorized" : "current_phase_state_invalid";
  } else if (failure === "15.3_evidence_truth") {
    status = !input.evidenceSnapshot ? "phase_evidence_source_required" :
      evidenceReasons.includes("PHASE_EVIDENCE_SOURCE_CONTRACT_UNAVAILABLE") ?
        "phase_evidence_source_unavailable" : "transition_not_authorized";
  } else if (failure === "15.5_cross_horizon_alignment") {
    status = "phase_program_alignment_ambiguous"; detailed.push("PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS");
  } else if (failure === "15.6_stable_base_continuity" || failure === "15.8_supporting_continuity") {
    status = "transition_not_authorized";
  } else if (failure === "15.7_local_phase_owned_change") {
    status = automatic && !wrongLayer ? "longitudinal_owner_required" : "transition_not_authorized";
  }
  if (excessiveRegeneration) detailed.push("PHASE_PROGRAM_EXCESSIVE_REGENERATION", "PHASE_CONTINUITY_OVER_ADAPTATION");
  else if (wrongLayer) detailed.push("PHASE_WRONG_LAYER_EFFECT");
  else if (phaseOwned > 0) detailed.push("PHASE_PROGRAM_LOCAL_CHANGE_JUSTIFIED");
  else detailed.push("PHASE_PROGRAM_CONTINUITY_PRESERVED");
  if (automatic) detailed.push("PHASE_DECISION_DEFERRED_TO_GATE_16");

  const policyReference = policyResolution.policy?.reference ?? null;
  const decisionId = derivePhaseContinuityDecisionId({
    kernelContract: `${PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE.contractId}@${PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE.contractVersion}`,
    athleteId: input.phaseCycleIdentity.athleteId, phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
    phaseStateId: input.currentPhaseStateRevision.phaseStateIdentity.phaseStateId,
    transitionProposalId: input.transitionProposal.proposalId, decisionAttemptId: input.decisionAttemptId,
  });
  const decisionRevision = buildPhaseContinuityDecisionRevision({ decisionId, policyRef: policyReference,
    evidenceSnapshotRevisionId: input.evidenceSnapshot?.evidenceSnapshotRevisionId ?? "unavailable",
    currentProgramSnapshotRevisionId: input.currentProgramSnapshot.snapshotRevisionId,
    proposedProgramSnapshotRevisionId: input.proposedProgramSnapshot.snapshotRevisionId,
    phaseStateRevisionId: input.currentPhaseStateRevision.phaseStateRevisionId,
    evaluationTime: input.evaluationTime,
    contentFingerprint: deterministicToken({ status, detailed: unique(detailed), failure, reasons }),
    priorContext: input.priorDecisionRevisionContext });
  const authorized = !failure && status === "advance_to_next_phase_authorized";
  const candidate = authorized ? Object.freeze({
    phaseStateIdentity: input.currentPhaseStateRevision.phaseStateIdentity,
    phaseStateRevisionId: derivePhaseStateRevisionId({
      phaseStateId: input.currentPhaseStateRevision.phaseStateIdentity.phaseStateId,
      basedOnRevisionId: input.currentPhaseStateRevision.phaseStateRevisionId,
      currentPhaseId: input.transitionProposal.proposedTargetPhaseId,
      evidenceSnapshotId: input.evidenceSnapshot?.evidenceSnapshotId ?? "unavailable",
      createdAt: input.evaluationTime, decisionAttemptId: input.decisionAttemptId,
    }),
    basedOnRevisionId: input.currentPhaseStateRevision.phaseStateRevisionId,
    currentPhaseId: input.transitionProposal.proposedTargetPhaseId, status: "current" as const,
    reasonCode: "authorized_transition_candidate" as const,
    evidenceSnapshotId: input.evidenceSnapshot?.evidenceSnapshotId ?? "unavailable",
    createdAt: input.evaluationTime, finalForDecision: false, decisionAttemptId: input.decisionAttemptId,
    weekInPhaseObservation: null, automaticAdvancementAuthority: false as const,
    provenance: Object.freeze([decisionRevision.revision.decisionRevisionId,
      "candidate-only:application-owner-required"]),
  }) : null;
  const subgateTrace = traces({ failure, upstreamFailure, reasons,
    shadow: input.runShadowDiagnosticsAfterFailure ?? true });
  const continuityClassifications = unique(alignment.entries.map((entry) =>
    entry.continuityClassification)) as readonly ProductionPhaseProgramContinuityClassification[];
  const noRescueAttempted = upstreamFailure && (input.transitionProposal.transitionKind === "adjacent_advancement" ||
    alignment.entries.some((entry) => entry.continuityClassification !== "preserved_exact"));
  return Object.freeze({ contractReference: PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
    policyReference, decisionId, decisionRevisionId: decisionRevision.revision.decisionRevisionId,
    decisionRevisionLedger: decisionRevision.ledger,
    phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
    currentPhaseStateId: input.currentPhaseStateRevision.phaseStateIdentity.phaseStateId,
    currentPhaseStateRevisionId: input.currentPhaseStateRevision.phaseStateRevisionId,
    transitionProposalId: input.transitionProposal.proposalId,
    currentProgramSnapshotId: input.currentProgramSnapshot.snapshotId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshot.snapshotRevisionId,
    proposedProgramSnapshotId: input.proposedProgramSnapshot.snapshotId,
    proposedProgramSnapshotRevisionId: input.proposedProgramSnapshot.snapshotRevisionId,
    status, detailedClassifications: unique(detailed) as readonly ProductionPhaseContinuityDetailedClassification[],
    criterionEvaluations: Object.freeze(evaluations),
    evidenceSufficiencyTrace: unique(evaluations.flatMap((entry) => entry.reasonCodes)),
    blockers: unique(decision.blockers), conflicts: unique(decision.conflicts),
    trainingSafetyTrace: input.trainingSafetyTrace,
    transitionEligibilityTrace: Object.freeze([`transition-kind:${input.transitionProposal.transitionKind}`,
      `current-phase:${input.transitionProposal.currentPhaseId}`,
      `target-phase:${input.transitionProposal.proposedTargetPhaseId}`, `status:${status}`,
      "week-in-phase:observational-only", "calendar:non-authoritative"]),
    crossHorizonAlignment: alignment, continuityClassifications,
    stableBaseTrace: Object.freeze([`framework-retention:${metrics.frameworkRetentionRate}`,
      `objective-retention:${metrics.objectiveRetentionRate}`,
      `session-purpose-retention:${metrics.sessionPurposeRetentionRate}`,
      `anchor-retention:${metrics.anchorRetentionRate}`,
      `unexplained-change-count:${metrics.unexplainedChangeCount}`]),
    anchorTrace: Object.freeze([`anchor-retention:${metrics.anchorRetentionRate}`,
      anchorDisplacement ? "PRODUCTIVE_ANCHOR_DISPLACEMENT_REJECTED" : "PRODUCTIVE_ANCHOR_CONTINUITY_VALID"]),
    prescriptionContinuityTrace: Object.freeze([`same-prescription-rate:${metrics.samePrescriptionRate}`,
      "automatic-progression:false", "same-prescription-across-phase:legal"]),
    warmupActivationTrace: Object.freeze([`warmup-retention:${metrics.warmupRetentionRate}`,
      `activation-retention:${metrics.activationRetentionRate}`, "supporting-work-owner:dependency"]),
    replacementTrace: Object.freeze(["replacement-selected:false", "prescription-review-precedes-replacement:true",
      "one-adverse-realization-authorizes-replacement:false", "successful-re-exposure-reduces-replacement-pressure:true"]),
    rotationTrace: Object.freeze(["automatic-rotation:false", "automatic-deload:false",
      "rotation-eligible:observational-only"]),
    phasePolicyTrace: Object.freeze([`phase-owned-change-count:${phaseOwned}`,
      `non-phase-owned-change-count:${nonPhaseOwned}`, "phase-suitability-automatic-replacement-effect:none"]),
    gate16DeferralTrace: Object.freeze(["progression-selection:GATE_16_OWNER_REQUIRED",
      "regression-selection:GATE_16_OWNER_REQUIRED", "rotation-selection:GATE_16_OWNER_REQUIRED",
      "replacement-selection:GATE_16_OWNER_REQUIRED", "deload-selection:GATE_16_OWNER_REQUIRED"]),
    metrics, noRescueTrace: Object.freeze({ upstreamFailureObserved: upstreamFailure,
      downstreamRescueAttempted: noRescueAttempted, downstreamRescueAccepted: false as const }),
    firstFailingStage: failure, subgateTrace,
    shadowDiagnostics: Object.freeze(failure ? ["LATER_PHASE_CONTINUITY_STAGES_UNSCORED"] : []),
    decisionTrace: Object.freeze([
      `contract:${input.contractReference.contractId}@${input.contractReference.contractVersion}`,
      `policy:${policyReference ? `${policyReference.policyId}@${policyReference.version}` : "unresolved"}`,
      `criteria:${evaluations.length}`, `classification:${unique(detailed).join(",")}`,
      "decision-application:separated", "hidden-clock:not-used", "randomness:not-used", "prose-authority:not-used",
    ]), proposedStateRevisionCandidate: candidate, decisionAuthorized: authorized,
    stateMutationApplied: false as const, applicationOwnerRequired: true as const,
    automaticProgressionCount: 0, automaticReplacementCount: 0, automaticRotationCount: 0,
    automaticDeloadCount: 0, genericPhaseWarmupCount: 0, genericPhaseActivationCount: 0,
    provenance: Object.freeze(["production-kernel:PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0",
      input.transitionProposal.proposalSource, input.transitionProposal.proposalId]) });
}
