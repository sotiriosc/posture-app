import {
  buildTrainingReadinessTrace,
  type TrainingSafetyState,
} from "../../src/domain/trainingSafety";
import {
  THREE_PHASE_FOUNDATION,
  type PhaseId,
} from "../../src/domain/phase";
import {
  PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PHASE_CONTINUITY_POLICY_REFERENCE,
  PHASE_CONTINUITY_V1_CRITERIA,
  type PhaseAdvancementCriterionDefinition,
  type PhaseCriterionEvidenceRecord,
  type PhaseEvidenceQuality,
  type PhaseEvidenceSourceType,
  type PhaseRepeatedEvidenceState,
  type PhaseTransitionChangedFact,
  type PhaseTransitionEntityMapping,
} from "../../src/phaseContinuity/designContracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
} from "../cagt/effectiveAuthorityRegistryV2";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
} from "../cagt/effectiveAuthorityRegistryV3";
import {
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST,
} from "../cagt/fullProgramCohorts";
import type {
  FullPrescribedProgramCounterfactualContract,
  FullPrescribedProgramSnapshot,
} from "../cagt/fullProgramContracts";
import { runFullPrescribedProgramGate14 } from "../cagt/fullProgramGate14";
import type {
  CompletedPhaseEvidenceFixture,
  PhaseContinuityGate15Input,
  PlannedProgramTruthTrace,
} from "../cagt/phaseContinuityContracts";
import type {
  PhaseContinuityEvidenceMode,
  PhaseContinuityMutationKind,
} from "../cagt/phaseContinuityCohorts";
import { buildFullProgramPairFixture, fullProgramCleanSnapshots } from "./fullPrescribedProgramCagtLab";
import { cloneFrozenFullProgramSnapshot } from "./fullPrescribedProgramPipeline";

export const PHASE_CONTINUITY_EVALUATION_TIME = "2026-08-14T12:00:00-04:00" as const;
const EVIDENCE_START = "2026-07-01T09:00:00-04:00";
const EVIDENCE_END = "2026-08-13T20:00:00-04:00";

const snapshotsByPhase = new Map<PhaseId, readonly FullPrescribedProgramSnapshot[]>();

export function phaseContinuitySnapshotForPhase(
  phaseId: PhaseId,
  index = 0,
): FullPrescribedProgramSnapshot {
  let candidates = snapshotsByPhase.get(phaseId);
  if (!candidates) {
    candidates = Object.freeze(fullProgramCleanSnapshots().filter((snapshot) =>
      snapshot.sessionIntents.every((intent) => intent.phaseIntent.id === phaseId)));
    snapshotsByPhase.set(phaseId, candidates);
  }
  const snapshot = candidates[index % candidates.length];
  if (!snapshot) throw new Error(`PHASE_CONTINUITY_SNAPSHOT_UNAVAILABLE:${phaseId}`);
  return snapshot;
}

function phaseIntent(phaseId: PhaseId) {
  const intent = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === phaseId);
  if (!intent) throw new Error(`PHASE_INTENT_UNAVAILABLE:${phaseId}`);
  return intent;
}

function mutateNestedPhase(
  snapshot: FullPrescribedProgramSnapshot,
  targetPhaseId: PhaseId,
): void {
  const targetIntent = phaseIntent(targetPhaseId);
  for (const intent of snapshot.sessionIntents) {
    (intent as { phaseIntent: typeof targetIntent }).phaseIntent = targetIntent;
  }
  for (const result of snapshot.prescriptionSessionResults) {
    for (const plan of result.plans) (plan as { phaseId: PhaseId }).phaseId = targetPhaseId;
  }
  for (const artifact of snapshot.reservationArtifacts) {
    (artifact.sessionIntent as { phaseIntent: typeof targetIntent }).phaseIntent = targetIntent;
    for (const plan of artifact.prescriptionCompilation.plans) {
      (plan as { phaseId: PhaseId }).phaseId = targetPhaseId;
    }
  }
}

export function buildPhaseTransitionProgramSnapshot(input: {
  readonly current: FullPrescribedProgramSnapshot;
  readonly targetPhaseId: PhaseId;
  readonly suffix: string;
  readonly mutationKind?: PhaseContinuityMutationKind;
}): FullPrescribedProgramSnapshot {
  return cloneFrozenFullProgramSnapshot(input.current, (draft) => {
    (draft as { snapshotId: string }).snapshotId =
      `${input.current.snapshotId}:phase:${input.targetPhaseId}:${input.suffix}`;
    (draft as { snapshotRevisionId: string }).snapshotRevisionId =
      `${input.current.snapshotRevisionId}:phase:${input.targetPhaseId}:${input.suffix}`;
    (draft as unknown as { provenance: string[] }).provenance.push(
      "phase-continuity:explicit-cross-horizon-design-fixture",
    );
    mutateNestedPhase(draft, input.targetPhaseId);
    const mutation = input.mutationKind ?? "none";
    const topPlans = draft.prescriptionSessionResults.flatMap((result) => result.plans);
    const artifactPlans = draft.reservationArtifacts.flatMap((artifact) =>
      artifact.prescriptionCompilation.plans);
    const allPlans = [...topPlans, ...artifactPlans];
    const topAssignments = draft.sessionSkeletons.flatMap((skeleton) => skeleton.assignments);
    const artifactAssignments = draft.reservationArtifacts.flatMap((artifact) =>
      artifact.sessionSkeleton.assignments);
    const allAssignments = [...topAssignments, ...artifactAssignments];
    const topSteps = draft.finalSequencePlans.flatMap((plan) => plan.steps);
    const artifactSteps = draft.reservationArtifacts.flatMap((artifact) => artifact.finalSequencePlan.steps);
    const allSteps = [...topSteps, ...artifactSteps];

    if (mutation === "local_phase_prescription" || mutation === "structured_response_change") {
      for (const plan of [topPlans[0], artifactPlans[0]]) {
        if (plan) (plan as unknown as { requirementRefs: string[] }).requirementRefs.push(
          "phase-policy-local-review",
        );
      }
    }
    if (mutation === "global_program_regeneration") {
      for (const assignment of allAssignments) {
        (assignment as { exerciseId: string }).exerciseId = `regenerated-${assignment.exerciseId}`;
      }
      for (const plan of allPlans) {
        (plan as { exerciseId: string }).exerciseId = `regenerated-${plan.exerciseId}`;
        (plan.sourceExposureEvent as { currentPlannedExerciseId: string }).currentPlannedExerciseId = plan.exerciseId;
      }
      for (const step of allSteps) (step as { exerciseId: string }).exerciseId = `regenerated-${step.exerciseId}`;
    }
    if (mutation === "goal_override") {
      for (const intent of [...draft.sessionIntents,
        ...draft.reservationArtifacts.map((artifact) => artifact.sessionIntent)]) {
        (intent as { primaryGoal: "hypertrophy" }).primaryGoal = "hypertrophy";
        if ("outcomeGoal" in intent) (intent as { outcomeGoal: "hypertrophy" }).outcomeGoal = "hypertrophy";
      }
    }
    if (mutation === "week_policy_change") {
      for (const intent of [...draft.sessionIntents,
        ...draft.reservationArtifacts.map((artifact) => artifact.sessionIntent)]) {
        (intent as { primaryGoal: "hypertrophy" }).primaryGoal = "hypertrophy";
        if ("outcomeGoal" in intent) (intent as { outcomeGoal: "hypertrophy" }).outcomeGoal = "hypertrophy";
      }
    }
    if (mutation === "phase_creates_need") {
      for (const intent of [draft.sessionIntents[0], draft.reservationArtifacts[0]?.sessionIntent]) {
        const need = intent?.needs[0];
        if (need) (need as { explanation: string }).explanation =
          `${need.explanation}:phase-created-priority-muscle-need`;
      }
    }
    if (mutation === "automatic_progression") {
      for (const plan of allPlans) {
        const block = plan.doseBlocks.find((candidate) => candidate.dose.mode === "repetition_sets");
        if (block?.dose.mode === "repetition_sets" && block.dose.sets.kind === "exact") {
          (block.dose.sets as { value: number }).value += 1;
        }
      }
    }
    if (["automatic_replacement", "anchor_displacement", "equipment_local_change"].includes(mutation)) {
      const candidates = mutation === "equipment_local_change" ? allAssignments.slice(0, 2) :
        allAssignments.filter((assignment) => assignment.section === "main");
      for (const assignment of candidates) {
        (assignment as { exerciseId: string }).exerciseId = `${mutation}-${assignment.exerciseId}`;
      }
    }
    if (mutation === "generic_phase_warmup" || mutation === "generic_phase_activation") {
      const section = mutation === "generic_phase_warmup" ? "warmup" : "activation";
      const candidates = allAssignments.filter((assignment) => assignment.section === section);
      for (const assignment of candidates.length > 0 ? candidates : allAssignments.slice(0, 1)) {
        (assignment as { exerciseId: string }).exerciseId = `${mutation}-${assignment.exerciseId}`;
      }
    }
    if (mutation === "upstream_failure") {
      const result = draft.upstreamGateResults.find((entry) =>
        entry.gate === "gate_1_weekly_responsibility_truth");
      if (result) (result as { state: "FAIL_STOP" }).state = "FAIL_STOP";
    }
  });
}

const gate14TruthCache = new Map<string, PlannedProgramTruthTrace>();

export function buildPlannedProgramTruth(
  snapshot: FullPrescribedProgramSnapshot,
): PlannedProgramTruthTrace {
  const cacheKey = `${snapshot.snapshotId}:${snapshot.snapshotRevisionId}`;
  const cached = gate14TruthCache.get(cacheKey);
  if (cached) return cached;
  const template = buildFullProgramPairFixture(
    FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST.pairs[0],
  );
  const factId = `phase-program-truth:${snapshot.snapshotId}`;
  const contract: FullPrescribedProgramCounterfactualContract = Object.freeze({
    ...template.contract,
    id: `phase-program-truth-contract:${snapshot.snapshotId}`,
    authorityRegistryReference: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.reference,
    baselineSnapshotId: snapshot.snapshotId,
    counterfactualSnapshotId: snapshot.snapshotId,
    changedFactIds: Object.freeze([factId]),
    changedFactPaths: Object.freeze(["personFacts.signal"]),
    source: Object.freeze({ sourceType: "reviewed_test_contract" as const,
      sourceRef: `phase-continuity:gate14-self-truth:${snapshot.snapshotId}` }),
  });
  const result = runFullPrescribedProgramGate14({
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    contract,
    baselineSnapshot: snapshot,
    counterfactualSnapshot: snapshot,
    baselineFacts: Object.freeze({ personFacts: Object.freeze({ signal: "current" }) }),
    counterfactualFacts: Object.freeze({ personFacts: Object.freeze({ signal: factId }) }),
    runShadowDiagnosticsAfterFailure: true,
  });
  const gate13Valid = !snapshot.upstreamGateResults.some((entry) =>
    entry.gate === "gate_13_post_prescription_weekly_validation" && entry.state === "FAIL_STOP");
  const truth: PlannedProgramTruthTrace = Object.freeze({
    snapshotId: snapshot.snapshotId,
    gate13Valid,
    gate14Classification: result.finalClassification === "PROGRAM_EXPECTED_CONVERGENCE" ?
      "PROGRAM_EXPECTED_CONVERGENCE" : "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15",
    completedEvidenceInferred: false,
    sourceRef: `gate14:${result.finalClassification}:${contract.id}`,
  });
  gate14TruthCache.set(cacheKey, truth);
  return truth;
}

function acceptedSourceFor(definition: PhaseAdvancementCriterionDefinition): {
  readonly sourceOwner: PhaseEvidenceSourceType;
  readonly quality: PhaseEvidenceQuality;
} {
  const sourceOwner = definition.acceptedEvidenceSourceTypes[0];
  const quality = definition.requiredEvidenceQuality;
  return { sourceOwner, quality };
}

function evidenceRecord(input: {
  readonly definition: PhaseAdvancementCriterionDefinition;
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly index: number;
  readonly classification?: PhaseCriterionEvidenceRecord["evidenceClassification"];
  readonly repeated?: PhaseRepeatedEvidenceState;
  readonly sourceOwner?: PhaseEvidenceSourceType;
  readonly quality?: PhaseEvidenceQuality;
  readonly contradicts?: boolean;
}): PhaseCriterionEvidenceRecord {
  const source = acceptedSourceFor(input.definition);
  const classification = input.classification ?? "supports_criterion";
  const contradicts = input.contradicts ?? classification === "contradicts_criterion";
  return Object.freeze({
    evidenceRecordId: `phase-evidence:${input.definition.criterionId}:${input.index}`,
    criterionId: input.definition.criterionId,
    athleteId: input.athleteId,
    phaseCycleId: input.phaseCycleId,
    currentPhaseId: input.definition.currentPhaseId,
    sourceOwner: input.sourceOwner ?? source.sourceOwner,
    sourceRecordIds: Object.freeze([`design-source:${input.definition.criterionId}:${input.index}`]),
    evidenceQuality: input.quality ?? source.quality,
    evidenceClassification: classification,
    repeatedEvidenceState: input.repeated ?? (input.definition.repeatedEvidenceRequirement === "required" ?
      "repeated_consistent_evidence" : "isolated_observation"),
    occurredOrObservedInterval: Object.freeze({ startsAt: EVIDENCE_START, endsAt: EVIDENCE_END }),
    appliesThrough: PHASE_CONTINUITY_EVALUATION_TIME,
    supportsTransition: classification === "supports_criterion" || classification === "mixed_evidence",
    contradictsTransition: contradicts || classification === "mixed_evidence",
    uncertaintyState: classification === "mixed_evidence" ? "conflicting" : "none",
    provenance: Object.freeze([
      "TEST_DESIGN_FIXTURE_EXPLICIT_SOURCE_NOT_RUNTIME_INGESTION",
      `criterion:${input.definition.criterionId}`,
    ]),
  });
}

function evidenceFor(input: {
  readonly definitions: readonly PhaseAdvancementCriterionDefinition[];
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly mode: PhaseContinuityEvidenceMode;
}): readonly PhaseCriterionEvidenceRecord[] {
  if (input.definitions.length === 0) return Object.freeze([]);
  if (input.mode === "missing") return Object.freeze([]);
  if (input.mode === "planned_only") {
    return Object.freeze(input.definitions.filter((definition) => definition.domain === "active_objective_realization")
      .map((definition, index) => evidenceRecord({ definition, athleteId: input.athleteId,
        phaseCycleId: input.phaseCycleId, index })));
  }
  const records = input.definitions.map((definition, index) => evidenceRecord({
    definition,
    athleteId: input.athleteId,
    phaseCycleId: input.phaseCycleId,
    index,
    ...(input.mode === "isolated" && definition.repeatedEvidenceRequirement === "required" ?
      { repeated: "isolated_observation" as const } : {}),
  }));
  const target = input.definitions.findIndex((definition) =>
    definition.domain === "tolerance" || definition.domain === "recoverability" ||
    definition.domain === "unresolved_requirement_state");
  const index = target >= 0 ? target : 0;
  if (input.mode === "mixed") {
    records[index] = evidenceRecord({ definition: input.definitions[index], athleteId: input.athleteId,
      phaseCycleId: input.phaseCycleId, index, classification: "mixed_evidence",
      repeated: "repeated_mixed_evidence" });
  }
  if (input.mode === "blocker") {
    records[index] = evidenceRecord({ definition: input.definitions[index], athleteId: input.athleteId,
      phaseCycleId: input.phaseCycleId, index, classification: "contradicts_criterion", contradicts: true });
  }
  if (input.mode === "conflict") {
    records.push(evidenceRecord({ definition: input.definitions[index], athleteId: input.athleteId,
      phaseCycleId: input.phaseCycleId, index: input.definitions.length, classification: "contradicts_criterion",
      contradicts: true }));
  }
  return Object.freeze(records);
}

function safetyTrace(blocked: boolean) {
  const state: TrainingSafetyState = blocked ? {
    signals: [{
      signalId: "phase-continuity-safety-block",
      requestedReviewLevel: "review_required_before_ordinary_training",
      authority: {
        source: "coach",
        sourceRef: "phase-continuity-design-fixture:safety-block",
        evidenceBasis: ["Explicit typed design-fixture safety authority."],
        reportedBy: "phase-continuity-design-fixture",
        reportedAt: "2026-08-13T18:00:00-04:00",
      },
      resolution: { state: "unresolved" },
      notes: [],
    }],
  } : { signals: [] };
  return buildTrainingReadinessTrace({ trainingSafety: state });
}

function changedFacts(mutation: PhaseContinuityMutationKind,
  transitionKind: "stay" | "adjacent_advancement" | "regression_review" | "cycle_completion_review"):
readonly PhaseTransitionChangedFact[] {
  const values: PhaseTransitionChangedFact[] = [];
  if (transitionKind !== "stay") values.push({
    factId: "phase-state-transition-proposal",
    factOwner: "phase_policy",
    dimension: "phase_state_identity",
    material: true,
    sourceRef: "PhaseTransitionProposal:current-to-target",
  });
  const mapping: Partial<Record<PhaseContinuityMutationKind,
    readonly [PhaseTransitionChangedFact["factOwner"], string]>> = {
    local_phase_prescription: ["phase_policy", "prescription_policy_local_change"],
    global_program_regeneration: ["phase_policy", "global_program_regeneration"],
    goal_override: ["phase_policy", "phase_overrides_athlete_goal"],
    phase_creates_need: ["phase_policy", "phase_creates_session_need"],
    automatic_progression: ["longitudinal", "automatic_progression"],
    automatic_replacement: ["longitudinal", "automatic_replacement"],
    automatic_rotation: ["longitudinal", "automatic_rotation"],
    automatic_deload: ["longitudinal", "automatic_deload"],
    automatic_cycle_reset: ["longitudinal", "automatic_cycle_reset"],
    automatic_regression: ["longitudinal", "automatic_phase_regression"],
    generic_phase_warmup: ["phase_policy", "generic_phase_warmup"],
    generic_phase_activation: ["phase_policy", "generic_phase_activation"],
    anchor_displacement: ["phase_policy", "productive_anchor_displaced_solely_by_phase"],
    equipment_local_change: ["equipment", "current_equipment_local_change"],
    week_policy_change: ["explicit_goal_or_week_policy", "weekly_objective_change"],
    structured_response_change: ["structured_response_review", "prescription_review_local_change"],
  };
  const pair = mapping[mutation];
  if (pair) values.push({ factId: `semantic-change:${pair[1]}`, factOwner: pair[0], dimension: pair[1],
    material: true, sourceRef: `phase-continuity-design-fixture:${pair[1]}` });
  return Object.freeze(values);
}

function explicitMappings(input: {
  readonly mutationKind: PhaseContinuityMutationKind;
  readonly current: FullPrescribedProgramSnapshot;
  readonly proposed: FullPrescribedProgramSnapshot;
}): readonly PhaseTransitionEntityMapping[] {
  if (input.mutationKind !== "ambiguous_alignment") return Object.freeze([]);
  const currentAssignments = input.current.sessionSkeletons.flatMap((skeleton) => skeleton.assignments);
  const proposedAssignment = input.proposed.sessionSkeletons.flatMap((skeleton) => skeleton.assignments)[0];
  if (currentAssignments.length < 2 || !proposedAssignment) return Object.freeze([]);
  return Object.freeze(currentAssignments.slice(0, 2).map((assignment) => ({
    entityKind: "assignment" as const,
    currentEntityId: assignment.routinePrescriptionHandoffId,
    proposedEntityId: proposedAssignment.routinePrescriptionHandoffId,
    sourceRef: "phase-continuity-design-fixture:ambiguous-mapping",
  })));
}

export interface BuildPhaseContinuityInputOptions {
  readonly caseId: string;
  readonly snapshotIndex?: number;
  readonly currentPhaseId: PhaseId;
  readonly targetPhaseId: PhaseId;
  readonly transitionKind: "stay" | "adjacent_advancement" | "regression_review" | "cycle_completion_review";
  readonly evidenceMode?: PhaseContinuityEvidenceMode;
  readonly safetyBlock?: boolean;
  readonly mutationKind?: PhaseContinuityMutationKind;
  readonly weekInPhase?: number;
  readonly evaluationTime?: string;
  readonly currentProgramSnapshot?: FullPrescribedProgramSnapshot;
}

export function buildPhaseContinuityGate15Input(
  options: BuildPhaseContinuityInputOptions,
): PhaseContinuityGate15Input {
  const current = options.currentProgramSnapshot ??
    phaseContinuitySnapshotForPhase(options.currentPhaseId, options.snapshotIndex ?? 0);
  const mutationKind = options.mutationKind ?? "none";
  const proposed = options.transitionKind === "stay" && mutationKind === "none" ? current :
    buildPhaseTransitionProgramSnapshot({ current, targetPhaseId: options.targetPhaseId,
      suffix: options.caseId, mutationKind });
  const phaseCycleId = `phase-cycle:${current.athleteId}:${options.caseId}`;
  const definitions = options.transitionKind === "adjacent_advancement" ?
    PHASE_CONTINUITY_V1_CRITERIA.filter((definition) =>
      definition.currentPhaseId === options.currentPhaseId && definition.targetPhaseId === options.targetPhaseId) : [];
  const evidence = evidenceFor({ definitions, athleteId: current.athleteId, phaseCycleId,
    mode: options.evidenceMode ?? "met" });
  const completedEvidenceFixtures: readonly CompletedPhaseEvidenceFixture[] = Object.freeze(evidence
    .filter((record) => ["production_performance_summary", "completed_session_summary",
      "Product_adherence_source"].includes(record.sourceOwner))
    .map((record) => ({
      sourceType: record.sourceOwner as CompletedPhaseEvidenceFixture["sourceType"],
      recordId: record.sourceRecordIds[0],
      athleteId: current.athleteId,
      completed: true as const,
      occurredAt: EVIDENCE_END,
      authority: "TEST_DESIGN_FIXTURE_EXPLICIT_SOURCE_NOT_RUNTIME_INGESTION" as const,
      provenance: Object.freeze(["phase-continuity:typed-completed-evidence-fixture"]),
    })));
  const evaluationTime = options.evaluationTime ?? PHASE_CONTINUITY_EVALUATION_TIME;
  const cycleIdentity = Object.freeze({
    phaseCycleId,
    athleteId: current.athleteId,
    sourceProgramLineageId: current.weekAllocationPlanId,
    sourceHorizonLineageId: current.planningHorizonId,
    cycleStatus: options.transitionKind === "cycle_completion_review" ? "owner_review_required" as const :
      "active" as const,
    createdAt: "2026-07-01T08:00:00-04:00",
    owner: "design_fixture_owner" as const,
    sourceRef: `phase-continuity-design-fixture:${options.caseId}`,
    provenance: Object.freeze(["PHASE_CYCLE_IDENTITY_DESIGN_EVIDENCE"]),
  });
  const stateIdentity = Object.freeze({
    phaseStateId: `phase-state:${current.athleteId}:${phaseCycleId}`,
    phaseCycleId,
    athleteId: current.athleteId,
    createdAt: "2026-07-01T08:00:00-04:00",
    owner: "design_fixture_owner" as const,
    provenance: Object.freeze(["PRODUCTION_PHASE_STATE_IDENTITY_DESIGN_CONTRACT"]),
  });
  const revisionId = `phase-state-revision:${options.caseId}`;
  const proposalId = `phase-transition-proposal:${options.caseId}`;
  return Object.freeze({
    contractReference: PHASE_CONTINUITY_CONTRACT_REFERENCE,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
    policyReference: PHASE_CONTINUITY_POLICY_REFERENCE,
    phaseCycleIdentity: cycleIdentity,
    currentPhaseStateRevision: Object.freeze({
      phaseStateIdentity: stateIdentity,
      phaseStateRevisionId: revisionId,
      basedOnRevisionId: null,
      currentPhaseId: options.currentPhaseId,
      status: "current",
      reasonCode: "PHASE_STATE_CREATED_FROM_EXPLICIT_DESIGN_FIXTURE",
      evidenceSnapshotRef: current.snapshotRevisionId,
      createdAt: "2026-08-14T10:00:00-04:00",
      finalForDecision: true,
      weekInPhaseObservation: options.weekInPhase ?? 1,
      automaticAdvancementAuthority: false,
      provenance: Object.freeze(["PHASE_STATE_REVISION_IMMUTABLE_DESIGN_EVIDENCE"]),
    }),
    transitionProposal: Object.freeze({
      proposalId,
      phaseCycleId,
      currentPhaseStateRevisionId: revisionId,
      currentPhaseId: options.currentPhaseId,
      proposedTargetPhaseId: options.targetPhaseId,
      transitionKind: options.transitionKind,
      criterionDefinitionIds: Object.freeze(definitions.map((definition) => definition.criterionId)),
      evidenceRecordIds: Object.freeze(evidence.map((record) => record.evidenceRecordId)),
      blockingRecordIds: Object.freeze(evidence.filter((record) => record.contradictsTransition)
        .map((record) => record.evidenceRecordId)),
      proposedNextProgramSnapshotId: proposed.snapshotId,
      changedFacts: changedFacts(mutationKind, options.transitionKind),
      explicitEntityMappings: explicitMappings({ mutationKind, current, proposed }),
      reasonCodes: Object.freeze(["EXPLICIT_PHASE_TRANSITION_PROPOSAL_NOT_DECISION"]),
      owner: "design_fixture_owner",
      sourceRef: `phase-continuity-design-fixture:${options.caseId}`,
      evaluationTime,
      provenance: Object.freeze(["PHASE_TRANSITION_PROPOSAL_DESIGN_EVIDENCE"]),
    }),
    currentProgramSnapshot: current,
    proposedProgramSnapshot: proposed,
    currentProgramTruth: buildPlannedProgramTruth(current),
    proposedProgramTruth: buildPlannedProgramTruth(proposed),
    criterionDefinitions: Object.freeze(definitions),
    criterionEvidenceRecords: evidence,
    trainingSafetyTrace: safetyTrace(options.safetyBlock ?? false),
    trainingResponseReceiverTraces: Object.freeze([]),
    progressionReadinessTraces: Object.freeze([]),
    completedEvidenceFixtures,
    evaluationTime,
    runShadowDiagnosticsAfterFailure: true,
  });
}
