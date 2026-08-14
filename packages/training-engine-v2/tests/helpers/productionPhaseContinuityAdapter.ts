import type { PhaseId } from "../../src/domain/phase";
import { stableId } from "../../src/prescription/compiler/utilities";
import {
  PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
  PRODUCTION_PHASE_CONTINUITY_V1_CRITERIA,
  PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
  buildProductionPhaseProgramSnapshot,
  derivePhaseCycleId,
  derivePhaseStateId,
  derivePhaseStateRevisionId,
  type ProductionPhaseChangedFactDimension,
  type ProductionPhaseChangedFactOwner,
  type ProductionPhaseChangedFactReasonCode,
  type ProductionPhaseContinuityInput,
  type ProductionPhaseCriterionEvidenceRecord,
  type ProductionPhaseEvidenceOwner,
  type ProductionPhaseEvidenceSourceRecord,
  type ProductionPhaseProgramSnapshot,
  type ProductionPhaseTransitionChangedFact,
} from "../../src/phaseContinuity";
import type { PhaseTransitionChangedFact } from "../../src/phaseContinuity/designContracts";
import type { FullPrescribedProgramSnapshot } from "../cagt/fullProgramContracts";
import type { PhaseContinuityGate15Input } from "../cagt/phaseContinuityContracts";

function sourceOwner(owner: PhaseContinuityGate15Input["criterionEvidenceRecords"][number]["sourceOwner"]):
ProductionPhaseEvidenceOwner {
  const values: Record<typeof owner, ProductionPhaseEvidenceOwner> = {
    production_performance_summary: "performance_summary",
    completed_session_summary: "completed_session_summary",
    TrainingResponseReceiver: "training_response_receiver",
    ProgressionReadinessTrace: "progression_readiness",
    TrainingSafety: "training_safety",
    coach_review: "coach_review",
    clinician_restriction: "clinician_restriction",
    explicit_athlete_report: "athlete_report",
    Product_adherence_source: "product_adherence",
    planned_program_truth: "planned_program_truth",
    unknown: "unknown",
  };
  return values[owner];
}

function productionSnapshot(input: {
  readonly source: FullPrescribedProgramSnapshot;
  readonly phaseId: PhaseId;
  readonly phaseStateId: string;
  readonly phaseStateRevisionId: string;
  readonly basedOnRevisionId: string | null;
}): ProductionPhaseProgramSnapshot {
  const normalizedValidation = Object.freeze({
    ...input.source.postPrescriptionWeekValidationResult,
    athleteId: input.source.normalizedWeekSourceSnapshot.athleteId,
    sourceSnapshotId: input.source.normalizedWeekSourceSnapshot.sourceSnapshotId,
    sourceSnapshotRevisionId: input.source.normalizedWeekSourceSnapshot.sourceSnapshotRevisionId,
  });
  const built = buildProductionPhaseProgramSnapshot({
    weekSource: input.source.normalizedWeekSourceSnapshot,
    postPrescriptionWeekResult: normalizedValidation,
    sessionIntents: input.source.sessionIntents,
    sessionSkeletons: input.source.sessionSkeletons,
    prescriptionSessionResults: input.source.prescriptionSessionResults,
    finalSequencePlans: input.source.finalSequencePlans,
    phaseStateContext: { phaseId: input.phaseId, phaseStateId: input.phaseStateId,
      phaseStateRevisionId: input.phaseStateRevisionId },
    evaluationTime: input.source.evaluationTime,
    basedOnRevisionId: input.basedOnRevisionId,
    provenance: ["test-only-adapter:FullPrescribedProgramSnapshot->ProductionPhaseProgramSnapshot"],
  });
  const cumulativeUpstreamValid = input.source.upstreamGateResults.every((entry) => entry.state !== "FAIL_STOP");
  return Object.freeze({ ...built, gate13Valid: built.gate13Valid && cumulativeUpstreamValid });
}

function changedFact(fact: PhaseTransitionChangedFact): ProductionPhaseTransitionChangedFact {
  const mapping: Record<string, readonly [ProductionPhaseChangedFactOwner,
    ProductionPhaseChangedFactDimension, ProductionPhaseChangedFactReasonCode]> = {
    phase_state_identity: ["phase_policy", "phase_state", "phase_state_observation"],
    prescription_policy_local_change: ["phase_policy", "prescription_requirement",
      "explicit_phase_policy_applicability"],
    global_program_regeneration: ["phase_policy", "program_framework", "explicit_phase_policy_applicability"],
    phase_overrides_athlete_goal: ["phase_policy", "explicit_outcome_goal", "explicit_phase_policy_applicability"],
    phase_creates_session_need: ["phase_policy", "weekly_objective", "explicit_phase_policy_applicability"],
    automatic_progression: ["longitudinal", "automatic_progression", "automatic_action_prohibited"],
    automatic_replacement: ["longitudinal", "automatic_replacement", "automatic_action_prohibited"],
    automatic_rotation: ["longitudinal", "automatic_rotation", "automatic_action_prohibited"],
    automatic_deload: ["longitudinal", "automatic_deload", "automatic_action_prohibited"],
    automatic_cycle_reset: ["longitudinal", "automatic_cycle_reset", "automatic_action_prohibited"],
    automatic_phase_regression: ["longitudinal", "automatic_regression", "automatic_action_prohibited"],
    generic_phase_warmup: ["phase_policy", "supporting_dependency", "explicit_phase_policy_applicability"],
    generic_phase_activation: ["phase_policy", "supporting_dependency", "explicit_phase_policy_applicability"],
    productive_anchor_displaced_solely_by_phase: ["phase_policy", "productive_anchor",
      "explicit_phase_policy_applicability"],
    current_equipment_local_change: ["equipment", "equipment_realization", "equipment_changed"],
    weekly_objective_change: ["goal_or_week_owner", "weekly_objective", "weekly_objective_changed"],
    prescription_review_local_change: ["response_receiver", "structured_response", "structured_response_review"],
  };
  const fallbackOwner: ProductionPhaseChangedFactOwner = fact.factOwner === "phase_policy" ? "phase_policy" :
    fact.factOwner === "equipment" ? "equipment" : fact.factOwner === "training_safety" ? "training_safety" :
      fact.factOwner === "longitudinal" ? "longitudinal" : fact.factOwner === "presentation_only" ?
        "presentation" : fact.factOwner === "structured_response_review" ? "response_receiver" :
          "goal_or_week_owner";
  const [owner, dimension, reasonCode] = mapping[fact.dimension] ??
    [fallbackOwner, "presentation_only", "compatibility_projection"];
  return Object.freeze({ factId: fact.factId, owner, dimension, reasonCode,
    material: fact.material, sourceRef: fact.sourceRef });
}

function evidence(input: PhaseContinuityGate15Input, phaseStateRevisionId: string) {
  const sourceRecords: ProductionPhaseEvidenceSourceRecord[] = [];
  const criterionRecords: ProductionPhaseCriterionEvidenceRecord[] = [];
  for (const record of input.criterionEvidenceRecords) {
    const owner = sourceOwner(record.sourceOwner);
    const repeated = record.repeatedEvidenceState === "repeated_consistent_evidence";
    const count = repeated ? 2 : 1;
    const refs = Array.from({ length: count }, (_, index) =>
      `${record.sourceRecordIds[0] ?? record.evidenceRecordId}:observation:${index + 1}`);
    for (const [index, ref] of refs.entries()) sourceRecords.push(Object.freeze({
      sourceRecordId: ref, owner,
      sourceAuthority: owner === "planned_program_truth" ? "planned_program_validator" as const :
        ["performance_summary", "completed_session_summary", "product_adherence"].includes(owner) ?
          "caller_validated_summary" as const : "production_owner_validated" as const,
      occurredAt: record.occurredOrObservedInterval.endsAt,
      completedObservation: owner !== "planned_program_truth",
      provenance: Object.freeze([`compatibility-observation:${index + 1}`, record.evidenceRecordId]),
    }));
    criterionRecords.push(Object.freeze({
      evidenceContract: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
      evidenceRecordId: record.evidenceRecordId, criterionId: record.criterionId,
      athleteId: record.athleteId, phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
      phaseStateRevisionId, currentPhaseId: record.currentPhaseId, sourceOwner: owner,
      sourceRecordRefs: Object.freeze(refs),
      distinctExposureIds: Object.freeze(repeated ? refs.map((_, index) =>
        `completed-exposure:${record.evidenceRecordId}:${index + 1}`) : []),
      distinctSessionIds: Object.freeze(repeated ? refs.map((_, index) =>
        `completed-session:${record.evidenceRecordId}:${index + 1}`) : []),
      evidenceQuality: record.evidenceQuality,
      evidenceClassification: record.evidenceClassification,
      repeatedEvidenceState: record.repeatedEvidenceState,
      repeatedEvidenceBasis: repeated ? "reviewed_aggregate_multiple_observations" : "not_required",
      observedInterval: record.occurredOrObservedInterval,
      appliesThrough: record.appliesThrough,
      supportsTransition: record.supportsTransition,
      contradictsTransition: record.contradictsTransition,
      uncertaintyState: record.uncertaintyState,
      sourceAuthority: owner === "planned_program_truth" ? "planned_program_validator" :
        ["performance_summary", "completed_session_summary", "product_adherence"].includes(owner) ?
          "caller_validated_summary" : "production_owner_validated",
      reviewState: "accepted", provenance: Object.freeze([
        "test-only-compatibility-adapter:design-evidence->production-evidence",
        `design-record:${record.evidenceRecordId}`,
      ]),
    }));
  }
  for (const signal of input.trainingSafetyTrace.evidence) if (!sourceRecords.some((entry) =>
    entry.sourceRecordId === signal.signalId)) sourceRecords.push(Object.freeze({
      sourceRecordId: signal.signalId, owner: "training_safety",
      sourceAuthority: "production_owner_validated", occurredAt: signal.authority.reportedAt,
      completedObservation: true, provenance: Object.freeze([signal.authority.sourceRef]),
    }));
  const evidenceSnapshotId = stableId("production-phase-evidence", {
    athleteId: input.phaseCycleIdentity.athleteId,
    phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
    phaseStateRevisionId,
  });
  const evidenceSnapshotRevisionId = stableId("production-phase-evidence-revision", {
    evidenceSnapshotId, sourceIds: sourceRecords.map((entry) => entry.sourceRecordId).sort(),
    recordIds: criterionRecords.map((entry) => entry.evidenceRecordId).sort(),
    evaluationTime: input.evaluationTime,
  });
  return Object.freeze({
    snapshot: Object.freeze({ evidenceContract: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
      evidenceSnapshotId, evidenceSnapshotRevisionId,
      athleteId: input.phaseCycleIdentity.athleteId,
      phaseCycleId: input.phaseCycleIdentity.phaseCycleId,
      phaseStateRevisionId, sourceRecords: Object.freeze(sourceRecords),
      criterionRecords: Object.freeze(criterionRecords), unresolvedSourceOwners: Object.freeze([]),
      evaluationTime: input.evaluationTime,
      provenance: Object.freeze(["test-only-adapter:Gate15Evidence->ProductionPhaseEvidenceSnapshot"]) }),
    criterionRecords: Object.freeze(criterionRecords),
  });
}

export function adaptGate15InputToProduction(
  input: PhaseContinuityGate15Input,
): ProductionPhaseContinuityInput {
  const cycleId = derivePhaseCycleId({ athleteId: input.phaseCycleIdentity.athleteId,
    sourceProgramLineageId: input.phaseCycleIdentity.sourceProgramLineageId,
    sourceHorizonLineageId: input.phaseCycleIdentity.sourceHorizonLineageId });
  const stateId = derivePhaseStateId({ athleteId: input.phaseCycleIdentity.athleteId, phaseCycleId: cycleId });
  const decisionAttemptId = stableId("phase-decision-attempt", input.transitionProposal.proposalId);
  const provisionalEvidenceId = stableId("phase-evidence-lineage", {
    athleteId: input.phaseCycleIdentity.athleteId, cycleId, decisionAttemptId });
  const phaseStateRevisionId = derivePhaseStateRevisionId({ phaseStateId: stateId, basedOnRevisionId: null,
    currentPhaseId: input.currentPhaseStateRevision.currentPhaseId, evidenceSnapshotId: provisionalEvidenceId,
    createdAt: input.currentPhaseStateRevision.createdAt, decisionAttemptId });
  const evidenceResult = evidence(Object.freeze({ ...input,
    phaseCycleIdentity: Object.freeze({ ...input.phaseCycleIdentity, phaseCycleId: cycleId }) }),
    phaseStateRevisionId);
  const currentProgram = productionSnapshot({ source: input.currentProgramSnapshot,
    phaseId: input.currentPhaseStateRevision.currentPhaseId, phaseStateId: stateId,
    phaseStateRevisionId, basedOnRevisionId: null });
  const targetPhase = input.transitionProposal.proposedTargetPhaseId;
  const proposedProgram = productionSnapshot({ source: input.proposedProgramSnapshot,
    phaseId: targetPhase, phaseStateId: stateId, phaseStateRevisionId,
    basedOnRevisionId: currentProgram.snapshotRevisionId });
  const cycle = Object.freeze({ phaseCycleId: cycleId, athleteId: input.phaseCycleIdentity.athleteId,
    sourceProgramLineageId: input.phaseCycleIdentity.sourceProgramLineageId,
    sourceHorizonLineageId: input.phaseCycleIdentity.sourceHorizonLineageId,
    cycleStatus: input.phaseCycleIdentity.cycleStatus, createdAt: input.phaseCycleIdentity.createdAt,
    owner: "compatibility_adapter" as const, sourceRef: input.phaseCycleIdentity.sourceRef,
    provenance: Object.freeze(["test-only-adapter:PhaseCycleIdentity"]) });
  const identity = Object.freeze({ phaseStateId: stateId, phaseCycleId: cycleId,
    athleteId: input.phaseCycleIdentity.athleteId, createdAt: input.currentPhaseStateRevision.phaseStateIdentity.createdAt,
    owner: "compatibility_adapter" as const, provenance: Object.freeze(["test-only-adapter:PhaseStateIdentity"]) });
  const revision = Object.freeze({ phaseStateIdentity: identity, phaseStateRevisionId, basedOnRevisionId: null,
    currentPhaseId: input.currentPhaseStateRevision.currentPhaseId,
    status: input.currentPhaseStateRevision.status, reasonCode: "initial_state" as const,
    evidenceSnapshotId: provisionalEvidenceId, createdAt: input.currentPhaseStateRevision.createdAt,
    finalForDecision: true, decisionAttemptId,
    weekInPhaseObservation: input.currentPhaseStateRevision.weekInPhaseObservation,
    automaticAdvancementAuthority: false as const,
    provenance: Object.freeze(["test-only-adapter:ProductionPhaseStateRevision"]) });
  const definitions = PRODUCTION_PHASE_CONTINUITY_V1_CRITERIA.filter((entry) =>
    input.transitionProposal.criterionDefinitionIds.includes(entry.criterionId));
  return Object.freeze({
    contractReference: PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
    policy: PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
    evidenceSourceContract: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
    evidenceSnapshot: evidenceResult.snapshot,
    phaseCycleIdentity: cycle,
    phaseStateRevisionLedger: Object.freeze({ phaseStateId: stateId, revisions: Object.freeze([revision]),
      finalRevisionId: phaseStateRevisionId, finalizedHistoricalRevisionIds: Object.freeze([]) }),
    currentPhaseStateRevision: revision,
    transitionProposal: Object.freeze({ proposalId: input.transitionProposal.proposalId,
      phaseCycleId: cycleId, currentPhaseStateRevisionId: phaseStateRevisionId,
      currentPhaseId: input.transitionProposal.currentPhaseId,
      proposedTargetPhaseId: targetPhase,
      transitionKind: input.transitionProposal.transitionKind,
      criterionDefinitionIds: Object.freeze(definitions.map((entry) => entry.criterionId)),
      evidenceRecordIds: Object.freeze(evidenceResult.criterionRecords.map((entry) => entry.evidenceRecordId)),
      blockerRecordIds: Object.freeze(evidenceResult.criterionRecords.filter((entry) => entry.contradictsTransition)
        .map((entry) => entry.evidenceRecordId)),
      proposedProgramSnapshotId: proposedProgram.snapshotId,
      changedFacts: Object.freeze(input.transitionProposal.changedFacts.map(changedFact)),
      explicitEntityMappings: Object.freeze(input.transitionProposal.explicitEntityMappings.map((entry) =>
        Object.freeze({ entityKind: entry.entityKind, currentEntityId: entry.currentEntityId,
          proposedEntityId: entry.proposedEntityId, mappingKind: "explicit_mapping" as const,
          reasonCode: "compatibility_projection" as const, sourceRef: entry.sourceRef }))),
      proposalSource: "compatibility_adapter", evaluationTime: input.evaluationTime,
      provenance: Object.freeze(["test-only-adapter:PhaseTransitionProposal"]) }),
    currentProgramSnapshot: currentProgram,
    proposedProgramSnapshot: proposedProgram,
    criterionDefinitions: Object.freeze(definitions),
    criterionEvidenceRecords: evidenceResult.criterionRecords,
    trainingSafetyTrace: input.trainingSafetyTrace,
    evaluationTime: input.evaluationTime,
    decisionAttemptId,
    priorDecisionRevisionContext: null,
    runShadowDiagnosticsAfterFailure: input.runShadowDiagnosticsAfterFailure,
  });
}
