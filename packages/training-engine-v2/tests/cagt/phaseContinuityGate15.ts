import {
  PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PHASE_CONTINUITY_POLICY_REFERENCE,
  PHASE_TRANSITION_GRAPH,
  type PhaseAdvancementCriterionDefinition,
  type PhaseCriterionEvidenceRecord,
  type PhaseEvidenceQuality,
} from "../../src/phaseContinuity/designContracts";
import { semanticallyEqual } from "./diff";
import { validateFullPrescribedProgramSnapshot } from "../helpers/fullPrescribedProgramPipeline";
import {
  validateEffectiveAuthorityRegistryV3,
} from "./effectiveAuthorityRegistryV3";
import {
  PHASE_CONTINUITY_GATE_15_SUBGATES,
  type PhaseContinuityDetailedClassification,
  type PhaseContinuityGate15Input,
  type PhaseContinuityGate15Result,
  type PhaseContinuityGate15Subgate,
  type PhaseContinuityGate15SubgateTrace,
  type PhaseContinuityStatus,
  type PhaseCriterionEvaluation,
  type PhaseProgramContinuityClassification,
} from "./phaseContinuityContracts";
import {
  alignPhaseContinuityHorizons,
  measurePhaseContinuity,
} from "./phaseContinuityAlignment";

const QUALITY_RANK: Readonly<Record<PhaseEvidenceQuality, number>> = Object.freeze({
  unknown: 0,
  planned_only: 1,
  structured_observation: 2,
  reviewed_structured: 3,
  validated_completed: 4,
});

function validExplicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function availableSourceRecordIds(input: PhaseContinuityGate15Input): ReadonlySet<string> {
  const values = [
    ...input.completedEvidenceFixtures.map((entry) => entry.recordId),
    ...input.trainingSafetyTrace.evidence.map((entry) => entry.signalId),
    ...input.trainingResponseReceiverTraces.flatMap((trace) => [
      `trace:response:${trace.exerciseId}:${trace.prescriptionId}`,
      ...trace.exactRealizationEvidence.map((entry) => entry.observationId),
      ...trace.relatedRealizationEvidence.map((entry) => entry.observationId),
      ...trace.exerciseIdentityHistory.map((entry) => entry.observationId),
    ]),
    ...input.progressionReadinessTraces.flatMap((trace) => [
      `trace:progression:${trace.exerciseId}:${trace.prescriptionId}`,
      ...trace.evidence.evidenceRecordIds,
    ]),
    input.currentProgramTruth.sourceRef,
    input.proposedProgramTruth.sourceRef,
    input.currentProgramSnapshot.snapshotId,
    input.proposedProgramSnapshot.snapshotId,
  ];
  return new Set(values);
}

function designFixtureAuthority(record: PhaseCriterionEvidenceRecord): boolean {
  return record.provenance.includes("TEST_DESIGN_FIXTURE_EXPLICIT_SOURCE_NOT_RUNTIME_INGESTION");
}

function validateEvidenceRecord(input: {
  readonly gateInput: PhaseContinuityGate15Input;
  readonly definition: PhaseAdvancementCriterionDefinition;
  readonly record: PhaseCriterionEvidenceRecord;
  readonly sourceRecordIds: ReadonlySet<string>;
}): readonly string[] {
  const reasons: string[] = [];
  const { gateInput, definition, record } = input;
  if (record.criterionId !== definition.criterionId) reasons.push("CRITERION_EVIDENCE_ID_MISMATCH");
  if (record.athleteId !== gateInput.phaseCycleIdentity.athleteId ||
      record.phaseCycleId !== gateInput.phaseCycleIdentity.phaseCycleId ||
      record.currentPhaseId !== definition.currentPhaseId) {
    reasons.push("CRITERION_EVIDENCE_LINEAGE_MISMATCH");
  }
  if (!definition.acceptedEvidenceSourceTypes.includes(record.sourceOwner)) {
    reasons.push("CRITERION_EVIDENCE_SOURCE_OWNER_NOT_ACCEPTED");
  }
  if (record.sourceOwner === "unknown") reasons.push("CRITERION_EVIDENCE_SOURCE_UNKNOWN");
  if (record.sourceRecordIds.length === 0 || record.sourceRecordIds.some((id) =>
    !input.sourceRecordIds.has(id)) && !designFixtureAuthority(record)) {
    reasons.push("CRITERION_EVIDENCE_SOURCE_RECORD_UNAVAILABLE");
  }
  if (QUALITY_RANK[record.evidenceQuality] < QUALITY_RANK[definition.requiredEvidenceQuality]) {
    reasons.push("CRITERION_EVIDENCE_QUALITY_INSUFFICIENT");
  }
  if (!validExplicitTime(record.occurredOrObservedInterval.startsAt) ||
      !validExplicitTime(record.occurredOrObservedInterval.endsAt) ||
      !validExplicitTime(record.appliesThrough)) {
    reasons.push("CRITERION_EVIDENCE_TIME_INVALID");
  }
  if (Date.parse(record.occurredOrObservedInterval.startsAt) >
      Date.parse(record.occurredOrObservedInterval.endsAt) ||
      Date.parse(record.appliesThrough) < Date.parse(gateInput.evaluationTime)) {
    reasons.push("CRITERION_EVIDENCE_INTERVAL_INVALID");
  }
  if (record.supportsTransition && record.contradictsTransition && record.uncertaintyState !== "conflicting") {
    reasons.push("CRITERION_EVIDENCE_CONTRADICTION_UNMARKED");
  }
  if (record.evidenceClassification === "supports_criterion" && !record.supportsTransition) {
    reasons.push("CRITERION_EVIDENCE_SUPPORT_FLAG_MISSING");
  }
  if (record.evidenceClassification === "contradicts_criterion" && !record.contradictsTransition) {
    reasons.push("CRITERION_EVIDENCE_CONTRADICTION_FLAG_MISSING");
  }
  if (record.sourceOwner === "planned_program_truth" &&
      definition.domain !== "active_objective_realization" && definition.domain !== "continuity_runway") {
    reasons.push("PLANNED_PROGRAM_TRUTH_USED_AS_COMPLETED_EVIDENCE");
  }
  return unique(reasons);
}

export function evaluatePhaseCriterion(input: {
  readonly gateInput: PhaseContinuityGate15Input;
  readonly definition: PhaseAdvancementCriterionDefinition;
  readonly records: readonly PhaseCriterionEvidenceRecord[];
}): PhaseCriterionEvaluation {
  const sourceRecordIds = availableSourceRecordIds(input.gateInput);
  const accepted: string[] = [];
  const rejected: string[] = [];
  const reasons: string[] = [];
  for (const record of input.records) {
    const recordReasons = validateEvidenceRecord({ gateInput: input.gateInput,
      definition: input.definition, record, sourceRecordIds });
    if (recordReasons.length === 0) accepted.push(record.evidenceRecordId);
    else {
      rejected.push(record.evidenceRecordId);
      reasons.push(...recordReasons);
    }
  }
  const validRecords = input.records.filter((record) => accepted.includes(record.evidenceRecordId));
  const conflict = validRecords.some((record) => record.evidenceClassification === "mixed_evidence" ||
    record.repeatedEvidenceState === "repeated_mixed_evidence" || record.uncertaintyState === "conflicting") ||
    (validRecords.some((record) => record.supportsTransition) &&
      validRecords.some((record) => record.contradictsTransition));
  const blocked = validRecords.some((record) => record.contradictsTransition ||
    input.definition.blockingEvidenceClasses.includes(record.evidenceClassification));
  const repeated = input.definition.repeatedEvidenceRequirement === "not_required" ||
    validRecords.some((record) => record.repeatedEvidenceState === "repeated_consistent_evidence");
  const support = validRecords.some((record) => record.evidenceClassification === "supports_criterion" &&
    record.supportsTransition);
  const insufficient = validRecords.length === 0 || !support || !repeated || validRecords.some((record) =>
    record.evidenceClassification === "insufficient_observation" ||
    record.evidenceClassification === "unknown" || record.repeatedEvidenceState === "insufficient_history" ||
    record.repeatedEvidenceState === "unknown");
  const state: PhaseCriterionEvaluation["state"] = conflict ? "conflict" : blocked ? "blocked" :
    insufficient ? "insufficient" : rejected.length > 0 && accepted.length === 0 ? "invalid" : "met";
  if (!repeated) reasons.push("REPEATED_EVIDENCE_REQUIREMENT_NOT_MET");
  if (!support) reasons.push("SUPPORTING_CRITERION_EVIDENCE_MISSING");
  if (conflict) reasons.push("EQUAL_AUTHORITY_EVIDENCE_CONFLICT");
  if (blocked) reasons.push("BLOCKING_CRITERION_EVIDENCE_ACTIVE");
  if (state === "met") reasons.push("CRITERION_MET_BY_TYPED_EVIDENCE");
  return Object.freeze({
    criterionId: input.definition.criterionId,
    state,
    acceptedEvidenceRecordIds: unique(accepted),
    rejectedEvidenceRecordIds: unique(rejected),
    reasonCodes: unique(reasons),
  });
}

function validateContractAndFixture(input: PhaseContinuityGate15Input): readonly string[] {
  const reasons: string[] = [...validateEffectiveAuthorityRegistryV3(input.authorityRegistry)];
  if (!semanticallyEqual(input.contractReference, PHASE_CONTINUITY_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PHASE_CONTINUITY_CONTRACT_VERSION");
  }
  if (!semanticallyEqual(input.policyReference, PHASE_CONTINUITY_POLICY_REFERENCE)) {
    reasons.push("UNSUPPORTED_PHASE_CONTINUITY_POLICY_VERSION");
  }
  const cycle = input.phaseCycleIdentity;
  const revision = input.currentPhaseStateRevision;
  const proposal = input.transitionProposal;
  if (!cycle.phaseCycleId.trim() || !cycle.athleteId.trim() || !cycle.sourceProgramLineageId.trim() ||
      !cycle.sourceHorizonLineageId.trim() || !cycle.sourceRef.trim() || !validExplicitTime(cycle.createdAt)) {
    reasons.push("PHASE_CYCLE_IDENTITY_INVALID");
  }
  if (cycle.athleteId !== input.currentProgramSnapshot.athleteId ||
      cycle.athleteId !== input.proposedProgramSnapshot.athleteId) {
    reasons.push("PHASE_CYCLE_PROGRAM_ATHLETE_MISMATCH");
  }
  if (proposal.phaseCycleId !== cycle.phaseCycleId || proposal.currentPhaseStateRevisionId !==
      revision.phaseStateRevisionId || proposal.currentPhaseId !== revision.currentPhaseId ||
      proposal.proposedNextProgramSnapshotId !== input.proposedProgramSnapshot.snapshotId) {
    reasons.push("PHASE_TRANSITION_PROPOSAL_LINEAGE_INVALID");
  }
  if (!validExplicitTime(input.evaluationTime) || proposal.evaluationTime !== input.evaluationTime) {
    reasons.push("PHASE_CONTINUITY_EVALUATION_TIME_INVALID");
  }
  const factIds = proposal.changedFacts.map((fact) => fact.factId);
  if (factIds.some((id) => !id.trim()) || new Set(factIds).size !== factIds.length ||
      proposal.changedFacts.some((fact) => !fact.sourceRef.trim())) {
    reasons.push("PHASE_TRANSITION_CHANGED_FACTS_INVALID");
  }
  return unique(reasons);
}

function validateUpstream(input: PhaseContinuityGate15Input): readonly string[] {
  const reasons = [
    ...validateFullPrescribedProgramSnapshot(input.currentProgramSnapshot),
    ...validateFullPrescribedProgramSnapshot(input.proposedProgramSnapshot),
  ];
  const upstreamFailure = [
    ...input.currentProgramSnapshot.upstreamGateResults,
    ...input.proposedProgramSnapshot.upstreamGateResults,
  ].find((entry) => entry.state === "FAIL_STOP");
  if (upstreamFailure) reasons.push(`UPSTREAM_GATE_FAILED:${upstreamFailure.gate}`);
  for (const truth of [input.currentProgramTruth, input.proposedProgramTruth]) {
    if (!truth.gate13Valid) reasons.push(`GATE_13_PROGRAM_TRUTH_INVALID:${truth.snapshotId}`);
    if (truth.completedEvidenceInferred !== false) reasons.push("PLANNED_PROGRAM_INFERRED_COMPLETION");
    if (!truth.sourceRef.trim()) reasons.push("GATE_14_PROGRAM_TRUTH_SOURCE_REQUIRED");
  }
  if (input.currentProgramTruth.snapshotId !== input.currentProgramSnapshot.snapshotId ||
      input.proposedProgramTruth.snapshotId !== input.proposedProgramSnapshot.snapshotId) {
    reasons.push("PLANNED_PROGRAM_TRUTH_SNAPSHOT_MISMATCH");
  }
  return unique(reasons);
}

function validatePhaseState(input: PhaseContinuityGate15Input): readonly string[] {
  const reasons: string[] = [];
  const revision = input.currentPhaseStateRevision;
  const identity = revision.phaseStateIdentity;
  if (!identity.phaseStateId.trim() || identity.phaseCycleId !== input.phaseCycleIdentity.phaseCycleId ||
      identity.athleteId !== input.phaseCycleIdentity.athleteId || !validExplicitTime(identity.createdAt)) {
    reasons.push("PRODUCTION_PHASE_STATE_IDENTITY_INVALID");
  }
  if (!revision.phaseStateRevisionId.trim() || !revision.reasonCode.trim() ||
      !revision.evidenceSnapshotRef.trim() || !validExplicitTime(revision.createdAt) ||
      revision.finalForDecision !== true || revision.automaticAdvancementAuthority !== false) {
    reasons.push("PHASE_STATE_REVISION_INVALID");
  }
  if (revision.weekInPhaseObservation !== null && (!Number.isInteger(revision.weekInPhaseObservation) ||
      revision.weekInPhaseObservation < 0)) {
    reasons.push("PHASE_WEEK_OBSERVATION_INVALID");
  }
  if (input.currentProgramSnapshot.sessionIntents.some((intent) =>
      intent.phaseIntent.id !== revision.currentPhaseId) ||
      input.currentProgramSnapshot.prescriptionSessionResults.some((result) => result.plans.some((plan) =>
        plan.phaseId !== revision.currentPhaseId))) {
    reasons.push("CURRENT_PROGRAM_PHASE_CONTEXT_MISMATCH");
  }
  if (input.proposedProgramSnapshot.sessionIntents.some((intent) =>
      intent.phaseIntent.id !== input.transitionProposal.proposedTargetPhaseId) ||
      input.proposedProgramSnapshot.prescriptionSessionResults.some((result) => result.plans.some((plan) =>
        plan.phaseId !== input.transitionProposal.proposedTargetPhaseId))) {
    reasons.push("PROPOSED_PROGRAM_PHASE_CONTEXT_MISMATCH");
  }
  const edge = `${revision.currentPhaseId}->${input.transitionProposal.proposedTargetPhaseId}`;
  const currentIndex = ["phase_1", "phase_2", "phase_3"].indexOf(revision.currentPhaseId);
  const targetIndex = ["phase_1", "phase_2", "phase_3"].indexOf(input.transitionProposal.proposedTargetPhaseId);
  if (targetIndex < 0) reasons.push("TARGET_PHASE_INVALID");
  else if (targetIndex > currentIndex + 1) reasons.push(PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult);
  else if (targetIndex < currentIndex && input.transitionProposal.transitionKind !== "regression_review") {
    reasons.push("BACKWARD_TRANSITION_MUST_BE_REVIEW_ONLY");
  } else if (targetIndex === currentIndex && !PHASE_TRANSITION_GRAPH.legalStayEdges.includes(edge as never)) {
    reasons.push("PHASE_STAY_EDGE_INVALID");
  } else if (targetIndex === currentIndex + 1 &&
      !PHASE_TRANSITION_GRAPH.legalAdjacentAdvancementEdges.includes(edge as never)) {
    reasons.push(PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult);
  }
  return unique(reasons);
}

function definitionsForProposal(input: PhaseContinuityGate15Input) {
  const requested = new Set(input.transitionProposal.criterionDefinitionIds);
  return input.criterionDefinitions.filter((definition) => requested.has(definition.criterionId));
}

function validateEvidenceDefinitions(input: PhaseContinuityGate15Input): readonly string[] {
  const reasons: string[] = [];
  const definitions = definitionsForProposal(input);
  const advancing = input.transitionProposal.transitionKind === "adjacent_advancement";
  if (advancing && definitions.length === 0) reasons.push("PHASE_ADVANCEMENT_CRITERIA_REQUIRED");
  const ids = definitions.map((definition) => definition.criterionId);
  if (new Set(ids).size !== ids.length) reasons.push("DUPLICATE_PHASE_CRITERION_DEFINITION");
  for (const definition of definitions) {
    if (definition.currentPhaseId !== input.transitionProposal.currentPhaseId ||
        definition.targetPhaseId !== input.transitionProposal.proposedTargetPhaseId ||
        definition.reviewStatus !== "owner_accepted" || definition.provenance.length === 0) {
      reasons.push(`PHASE_CRITERION_DEFINITION_INVALID:${definition.criterionId}`);
    }
  }
  const evidenceIds = input.criterionEvidenceRecords.map((record) => record.evidenceRecordId);
  if (new Set(evidenceIds).size !== evidenceIds.length) reasons.push("DUPLICATE_PHASE_CRITERION_EVIDENCE_RECORD");
  if (input.transitionProposal.evidenceRecordIds.some((id) => !evidenceIds.includes(id)) ||
      input.transitionProposal.blockingRecordIds.some((id) => !evidenceIds.includes(id))) {
    reasons.push("PHASE_PROPOSAL_EVIDENCE_REFERENCE_MISSING");
  }
  return unique(reasons);
}

function subgateTrace(input: {
  readonly failure: PhaseContinuityGate15Subgate | null;
  readonly upstreamFailure: boolean;
  readonly reasons: readonly string[];
  readonly shadow: boolean;
}): readonly PhaseContinuityGate15SubgateTrace[] {
  const failureIndex = input.failure ? PHASE_CONTINUITY_GATE_15_SUBGATES.indexOf(input.failure) : -1;
  return Object.freeze(PHASE_CONTINUITY_GATE_15_SUBGATES.map((subgate, index) => {
    if (failureIndex < 0 || index < failureIndex) return Object.freeze({ subgate, state: "PASS" as const,
      scored: true, reasonCodes: Object.freeze(["GATE_15_SUBGATE_PASSED"]) });
    if (index === failureIndex) return Object.freeze({ subgate,
      state: input.upstreamFailure ? "NOT_REACHED" as const : "FAIL_STOP" as const,
      scored: !input.upstreamFailure, reasonCodes: input.reasons });
    return Object.freeze({ subgate, state: input.shadow ? "SHADOW_DIAGNOSTIC_ONLY" as const : "NOT_REACHED" as const,
      scored: false, reasonCodes: Object.freeze([input.shadow ? "INVALID_EARLIER_GATE_CONTEXT" :
        "EARLIER_GATE_15_SUBGATE_FAILED"]) });
  }));
}

function transitionDisposition(input: PhaseContinuityGate15Input,
  evaluations: readonly PhaseCriterionEvaluation[]): {
    readonly status: PhaseContinuityStatus;
    readonly classification: PhaseContinuityDetailedClassification;
    readonly blockers: readonly string[];
    readonly conflicts: readonly string[];
  } {
  const proposal = input.transitionProposal;
  const currentIndex = ["phase_1", "phase_2", "phase_3"].indexOf(proposal.currentPhaseId);
  const targetIndex = ["phase_1", "phase_2", "phase_3"].indexOf(proposal.proposedTargetPhaseId);
  if (!input.trainingSafetyTrace.downstreamTrainingAllowed) return {
    status: "transition_blocked_by_training_safety", classification: "PHASE_HOLD_DUE_BLOCKER",
    blockers: input.trainingSafetyTrace.unresolvedSignalIds, conflicts: [],
  };
  if (targetIndex > currentIndex + 1) return {
    status: "transition_not_authorized", classification: "PHASE_ADVANCEMENT_NOT_AUTHORIZED",
    blockers: [PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult], conflicts: [],
  };
  if (targetIndex < currentIndex || proposal.transitionKind === "regression_review") return {
    status: "phase_regression_review_required", classification: "PHASE_REGRESSION_REVIEW_REQUIRED",
    blockers: [], conflicts: [],
  };
  if (proposal.currentPhaseId === "phase_3" && proposal.transitionKind === "cycle_completion_review") return {
    status: "phase_cycle_completion_owner_review_required",
    classification: "PHASE_CYCLE_COMPLETION_OWNER_REVIEW_REQUIRED", blockers: [], conflicts: [],
  };
  if (proposal.transitionKind === "stay") return {
    status: "remain_current_phase", classification: "PHASE_STAY_JUSTIFIED", blockers: [], conflicts: [],
  };
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

export function runPhaseContinuityGate15(
  input: PhaseContinuityGate15Input,
): PhaseContinuityGate15Result {
  const contractReasons = validateContractAndFixture(input);
  const upstreamReasons = validateUpstream(input);
  const stateReasons = validatePhaseState(input);
  const definitionReasons = validateEvidenceDefinitions(input);
  const selectedRecordIds = new Set(input.transitionProposal.evidenceRecordIds);
  const evaluations = definitionsForProposal(input).map((definition) => evaluatePhaseCriterion({
    gateInput: input,
    definition,
    records: input.criterionEvidenceRecords.filter((record) =>
      record.criterionId === definition.criterionId && selectedRecordIds.has(record.evidenceRecordId)),
  }));
  const disposition = transitionDisposition(input, evaluations);
  const alignment = alignPhaseContinuityHorizons({
    current: input.currentProgramSnapshot,
    proposed: input.proposedProgramSnapshot,
    explicitMappings: input.transitionProposal.explicitEntityMappings,
  });
  const materialFacts = input.transitionProposal.changedFacts.filter((fact) => fact.material);
  const programMaterialFacts = materialFacts.filter((fact) => fact.dimension !== "phase_state_identity");
  const phaseOwnedChangeCount = programMaterialFacts.filter((fact) => fact.factOwner === "phase_policy").length;
  const nonPhaseOwnedChangeCount = programMaterialFacts.length - phaseOwnedChangeCount;
  const metrics = measurePhaseContinuity({ current: input.currentProgramSnapshot,
    proposed: input.proposedProgramSnapshot, alignment, phaseOwnedChangeCount, nonPhaseOwnedChangeCount });
  const semanticDimensions = new Set(materialFacts.map((fact) => fact.dimension));
  const excessiveRegeneration = semanticDimensions.has("global_program_regeneration") ||
    (phaseOwnedChangeCount > 0 && metrics.frameworkRetentionRate === 0);
  const wrongLayer = semanticDimensions.has("phase_overrides_athlete_goal") ||
    semanticDimensions.has("phase_creates_session_need") || semanticDimensions.has("phase_creates_objective");
  const forbiddenAutomaticAction = [...semanticDimensions].some((dimension) => [
    "automatic_progression", "automatic_replacement", "automatic_rotation", "automatic_deload",
    "automatic_cycle_reset", "automatic_phase_regression",
  ].includes(dimension));
  const genericSupportingWork = semanticDimensions.has("generic_phase_warmup") ||
    semanticDimensions.has("generic_phase_activation");
  const anchorDisplacement = semanticDimensions.has("productive_anchor_displaced_solely_by_phase");

  let failure: PhaseContinuityGate15Subgate | null = null;
  let failureReasons: readonly string[] = Object.freeze([]);
  let upstreamFailure = false;
  if (contractReasons.length > 0) {
    failure = "15.0_contract_and_fixture_truth";
    failureReasons = contractReasons;
  } else if (upstreamReasons.length > 0) {
    failure = "15.1_upstream_validity";
    failureReasons = upstreamReasons;
    upstreamFailure = true;
  } else if (stateReasons.length > 0) {
    failure = "15.2_phase_state_truth";
    failureReasons = stateReasons;
  } else if (definitionReasons.length > 0 || evaluations.some((entry) => entry.state === "invalid")) {
    failure = "15.3_evidence_truth";
    failureReasons = unique([...definitionReasons, ...evaluations.flatMap((entry) => entry.state === "invalid" ?
      entry.reasonCodes : [])]);
  } else if (alignment.status !== "aligned") {
    failure = "15.5_cross_horizon_alignment";
    failureReasons = alignment.reasonCodes;
  } else if (excessiveRegeneration || anchorDisplacement) {
    failure = "15.6_stable_base_continuity";
    failureReasons = unique([
      ...(excessiveRegeneration ? ["PHASE_PROGRAM_EXCESSIVE_REGENERATION"] : []),
      ...(anchorDisplacement ? ["PRODUCTIVE_ANCHOR_DISPLACED_SOLELY_BY_PHASE"] : []),
    ]);
  } else if (wrongLayer || forbiddenAutomaticAction) {
    failure = "15.7_local_phase_owned_change";
    failureReasons = unique([
      ...(wrongLayer ? ["PHASE_WRONG_LAYER_EFFECT"] : []),
      ...(forbiddenAutomaticAction ? ["GATE_16_ACTION_NOT_AUTHORIZED_BY_GATE_15"] : []),
    ]);
  } else if (genericSupportingWork) {
    failure = "15.8_warmup_activation_and_supporting_continuity";
    failureReasons = Object.freeze(["GENERIC_PHASE_SUPPORTING_WORK_NOT_AUTHORIZED"]);
  }

  let status = disposition.status;
  const detailed: PhaseContinuityDetailedClassification[] = [
    failure && disposition.classification === "PHASE_ADVANCEMENT_AUTHORIZED" ?
      "PHASE_ADVANCEMENT_NOT_AUTHORIZED" : disposition.classification,
  ];
  if (failure === "15.0_contract_and_fixture_truth") {
    status = contractReasons.includes("UNSUPPORTED_PHASE_CONTINUITY_CONTRACT_VERSION") ?
      "unsupported_phase_continuity_contract" : "current_phase_state_invalid";
  } else if (failure === "15.1_upstream_validity") {
    status = "upstream_program_invalid";
    detailed.push("PHASE_UPSTREAM_FAILED_SHADOW_ONLY");
  } else if (failure === "15.2_phase_state_truth") {
    status = stateReasons.includes("TARGET_PHASE_INVALID") ? "target_phase_invalid" :
      stateReasons.includes(PHASE_TRANSITION_GRAPH.nonAdjacentAdvancementResult) ?
        "transition_not_authorized" : "current_phase_state_invalid";
  } else if (failure === "15.3_evidence_truth" || failure === "15.6_stable_base_continuity" ||
      failure === "15.8_warmup_activation_and_supporting_continuity") {
    status = "transition_not_authorized";
  } else if (failure === "15.5_cross_horizon_alignment") {
    status = "phase_program_alignment_ambiguous";
    detailed.push("PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS");
  } else if (failure === "15.7_local_phase_owned_change") {
    status = forbiddenAutomaticAction && !wrongLayer ? "longitudinal_owner_required" :
      "transition_not_authorized";
  }
  if (excessiveRegeneration) detailed.push("PHASE_PROGRAM_EXCESSIVE_REGENERATION");
  else if (wrongLayer) detailed.push("PHASE_WRONG_LAYER_EFFECT");
  else if (phaseOwnedChangeCount > 0) detailed.push("PHASE_PROGRAM_LOCAL_CHANGE_JUSTIFIED");
  else detailed.push("PHASE_PROGRAM_CONTINUITY_PRESERVED");
  if (forbiddenAutomaticAction) detailed.push("PHASE_DECISION_DEFERRED_TO_GATE_16");
  const continuityClassifications = unique(alignment.entries.map((entry) =>
    entry.continuityClassification)) as readonly PhaseProgramContinuityClassification[];
  const trace = subgateTrace({ failure, upstreamFailure, reasons: failureReasons,
    shadow: input.runShadowDiagnosticsAfterFailure ?? true });
  const noRescueAttempted = upstreamFailure && (input.transitionProposal.transitionKind === "adjacent_advancement" ||
    alignment.entries.some((entry) => entry.continuityClassification !== "preserved_exact"));

  return Object.freeze({
    contractReference: PHASE_CONTINUITY_CONTRACT_REFERENCE,
    authorityRegistryReference: input.authorityRegistry.reference,
    policyReference: input.policyReference,
    phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
    currentPhaseStateId: input.currentPhaseStateRevision.phaseStateIdentity.phaseStateId,
    currentPhaseStateRevisionId: input.currentPhaseStateRevision.phaseStateRevisionId,
    transitionProposalId: input.transitionProposal.proposalId,
    currentProgramSnapshotId: input.currentProgramSnapshot.snapshotId,
    proposedProgramSnapshotId: input.proposedProgramSnapshot.snapshotId,
    status,
    detailedClassifications: unique(detailed) as readonly PhaseContinuityDetailedClassification[],
    criterionEvaluations: Object.freeze(evaluations),
    evidenceSufficiencyTrace: unique(evaluations.flatMap((entry) => entry.reasonCodes)),
    blockers: unique(disposition.blockers),
    conflicts: unique(disposition.conflicts),
    trainingSafetyTrace: input.trainingSafetyTrace,
    transitionEligibilityTrace: Object.freeze([
      `transition-kind:${input.transitionProposal.transitionKind}`,
      `current-phase:${input.transitionProposal.currentPhaseId}`,
      `target-phase:${input.transitionProposal.proposedTargetPhaseId}`,
      `status:${status}`,
      "weekInPhase:observational-only",
    ]),
    crossHorizonAlignment: alignment,
    continuityClassifications,
    stableBaseTrace: Object.freeze([
      `framework-retention:${metrics.frameworkRetentionRate}`,
      `anchor-retention:${metrics.anchorRetentionRate}`,
      `unexplained-change-count:${metrics.unexplainedChangeCount}`,
    ]),
    anchorTrace: Object.freeze([
      `anchor-retention:${metrics.anchorRetentionRate}`,
      anchorDisplacement ? "PRODUCTIVE_ANCHOR_DISPLACEMENT_REJECTED" : "PRODUCTIVE_ANCHOR_CONTINUITY_VALID",
    ]),
    prescriptionContinuityTrace: Object.freeze([
      `same-prescription-rate:${metrics.samePrescriptionRate}`,
      "automatic-progression:false",
      "same-prescription-across-phase:legal",
    ]),
    warmupActivationTrace: Object.freeze([
      `warmup-retention:${metrics.warmupRetentionRate}`,
      `activation-retention:${metrics.activationRetentionRate}`,
      "supporting-work-owner:dependency",
    ]),
    replacementTrace: Object.freeze([
      "replacement-selected:false",
      "prescription-review-precedes-replacement:true",
      "one-adverse-realization-authorizes-replacement:false",
    ]),
    rotationTrace: Object.freeze(["automatic-rotation:false", "rotation-eligible:observational-only"]),
    phasePolicyTrace: Object.freeze([
      `phase-owned-change-count:${phaseOwnedChangeCount}`,
      "phase-suitability-automatic-replacement-effect:none",
    ]),
    gate16DeferralTrace: Object.freeze([
      "progression-selection:GATE_16_OWNER_REQUIRED",
      "regression-selection:GATE_16_OWNER_REQUIRED",
      "rotation-selection:GATE_16_OWNER_REQUIRED",
      "replacement-selection:GATE_16_OWNER_REQUIRED",
      "deload-selection:GATE_16_OWNER_REQUIRED",
    ]),
    metrics,
    noRescueTrace: Object.freeze({ upstreamFailureObserved: upstreamFailure,
      downstreamRescueAttempted: noRescueAttempted, downstreamRescueAccepted: false as const }),
    firstFailingSubgate: failure,
    subgateTrace: trace,
    shadowDiagnostics: Object.freeze(failure ? ["LATER_GATE_15_SUBGATES_UNSCORED"] : []),
    decisionTrace: Object.freeze([
      `contract:${input.contractReference.contractId}@${input.contractReference.version}`,
      `registry:${input.authorityRegistry.reference.registryId}@${input.authorityRegistry.reference.version}`,
      `policy:${input.policyReference.policyId}@${input.policyReference.version}`,
      `criteria:${evaluations.length}`,
      `classification:${unique(detailed).join(",")}`,
      "hidden-clock:not-used",
      "randomness:not-used",
      "prose-authority:not-used",
    ]),
    automaticProgressionCount: 0,
    automaticReplacementCount: 0,
    automaticRotationCount: 0,
    automaticDeloadCount: 0,
    genericPhaseWarmupCount: 0,
    genericPhaseActivationCount: 0,
    provenance: Object.freeze([
      "PHASE_CONTINUITY_GATE_15_TEST_DEVELOPER_TOOLING",
      input.transitionProposal.sourceRef,
    ]),
  });
}

export function validatePhaseContinuityGate15Result(
  result: PhaseContinuityGate15Result,
): readonly string[] {
  const reasons: string[] = [];
  if (!semanticallyEqual(result.contractReference, PHASE_CONTINUITY_CONTRACT_REFERENCE)) {
    reasons.push("PHASE_CONTINUITY_RESULT_CONTRACT_INVALID");
  }
  const first = result.subgateTrace.find((entry) => entry.state === "FAIL_STOP" || entry.state === "NOT_REACHED");
  if ((first?.subgate ?? null) !== result.firstFailingSubgate) reasons.push("PHASE_CONTINUITY_FIRST_FAILURE_INVALID");
  const failureIndex = result.firstFailingSubgate ?
    PHASE_CONTINUITY_GATE_15_SUBGATES.indexOf(result.firstFailingSubgate) : -1;
  if (failureIndex >= 0 && result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
    reasons.push("PHASE_CONTINUITY_DOWNSTREAM_SUBGATE_SCORED");
  }
  if (result.noRescueTrace.downstreamRescueAccepted !== false) reasons.push("PHASE_CONTINUITY_DOWNSTREAM_RESCUE_ACCEPTED");
  if (result.automaticProgressionCount + result.automaticReplacementCount + result.automaticRotationCount +
      result.automaticDeloadCount > 0) reasons.push("PHASE_CONTINUITY_GATE_16_ACTION_SELECTED");
  return unique(reasons);
}
