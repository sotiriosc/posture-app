import { digest } from "./signatures";
import { buildFullProgramSignatureFamily } from "./fullProgramSignatures";
import type { FullPrescribedProgramSnapshot } from "./fullProgramContracts";
import type {
  PhaseTransitionEntityMapping,
} from "../../src/phaseContinuity/designContracts";
import type {
  PhaseContinuityMetricTrace,
  PhaseCrossHorizonAlignmentEntry,
  PhaseCrossHorizonAlignmentResult,
  PhaseProgramContinuityClassification,
} from "./phaseContinuityContracts";

interface AlignableEntity {
  readonly kind: PhaseTransitionEntityMapping["entityKind"];
  readonly id: string;
  readonly semanticKey: string;
  readonly exerciseId: string | null;
  readonly sessionId: string | null;
  readonly sequenceIndex: number | null;
}

const entityCache = new WeakMap<FullPrescribedProgramSnapshot, readonly AlignableEntity[]>();
const signatureCache = new WeakMap<FullPrescribedProgramSnapshot,
  ReturnType<typeof buildFullProgramSignatureFamily>>();

function stable(value: unknown): string {
  return digest(value);
}

function entities(snapshot: FullPrescribedProgramSnapshot): readonly AlignableEntity[] {
  const cached = entityCache.get(snapshot);
  if (cached) return cached;
  const values: AlignableEntity[] = [];
  for (const objective of snapshot.normalizedWeekSourceSnapshot.objectives) {
    values.push({
      kind: "weekly_objective",
      id: objective.objectiveId,
      semanticKey: stable({
        purpose: objective.purpose,
        target: objective.target,
        priority: objective.priority,
      }),
      exerciseId: null,
      sessionId: null,
      sequenceIndex: null,
    });
  }
  for (const opportunity of snapshot.normalizedWeekSourceSnapshot.opportunities) {
    values.push({
      kind: "opportunity",
      id: opportunity.opportunityId,
      semanticKey: stable({
        availabilityState: opportunity.availabilityState,
        availableMinutes: opportunity.availableMinutes,
        executionState: opportunity.executionState,
      }),
      exerciseId: null,
      sessionId: null,
      sequenceIndex: null,
    });
  }
  for (const reservation of snapshot.normalizedWeekSourceSnapshot.reservations) {
    values.push({
      kind: "reservation",
      id: reservation.reservationId,
      semanticKey: stable({
        objectiveIds: [...reservation.allocatedObjectiveIds].sort(),
        goal: reservation.expectedSessionGoal,
        availabilityState: reservation.availabilityState,
        executionState: reservation.executionState,
      }),
      exerciseId: null,
      sessionId: null,
      sequenceIndex: null,
    });
  }
  for (const intent of snapshot.sessionIntents) {
    const sessionKey = stable({
      kind: intent.kind,
      goal: intent.outcomeGoal ?? intent.primaryGoal,
      structuralCapacity: intent.structuralCapacity,
      needs: intent.needs.map((need) => ({
        section: need.section,
        priority: need.priority,
        selection: need.selection,
      })).sort((left, right) => stable(left).localeCompare(stable(right))),
    });
    values.push({ kind: "session", id: intent.id, semanticKey: sessionKey,
      exerciseId: null, sessionId: intent.id, sequenceIndex: null });
    for (const need of intent.needs) {
      values.push({
        kind: "session_need",
        id: need.id,
        semanticKey: stable({ section: need.section, priority: need.priority, selection: need.selection }),
        exerciseId: null,
        sessionId: intent.id,
        sequenceIndex: null,
      });
    }
  }
  for (const skeleton of snapshot.sessionSkeletons) {
    for (const assignment of skeleton.assignments) {
      values.push({
        kind: "assignment",
        id: assignment.routinePrescriptionHandoffId,
        semanticKey: stable({
          exerciseId: assignment.exerciseId,
          section: assignment.section,
          role: assignment.role,
          satisfiedNeedIds: [...assignment.satisfiedNeedIds].sort(),
        }),
        exerciseId: assignment.exerciseId,
        sessionId: skeleton.sessionIntentId,
        sequenceIndex: null,
      });
    }
  }
  for (const result of snapshot.prescriptionSessionResults) {
    for (const event of result.sourceExposureEvents) {
      values.push({
        kind: "source_event",
        id: event.sourceExposureEventId,
        semanticKey: stable({
          assignmentId: event.sessionAssignmentId,
          exerciseId: event.currentPlannedExerciseId,
          status: event.eventStatus,
        }),
        exerciseId: event.currentPlannedExerciseId,
        sessionId: event.sessionIntentId,
        sequenceIndex: null,
      });
    }
    for (const plan of result.plans) {
      values.push({
        kind: "prescription",
        id: plan.prescriptionId,
        semanticKey: stable({
          exerciseId: plan.exerciseId,
          doseBlocks: plan.doseBlocks,
          restInstructions: plan.restInstructions,
          requirements: plan.requirementRefs,
        }),
        exerciseId: plan.exerciseId,
        sessionId: plan.sourceExposureEvent.sessionIntentId,
        sequenceIndex: null,
      });
    }
  }
  for (const sequence of snapshot.finalSequencePlans) {
    for (const step of sequence.steps) {
      values.push({
        kind: "sequence_step",
        id: `${sequence.sequencePlanId}:${step.assignmentId}`,
        semanticKey: stable({
          assignmentId: step.assignmentId,
          exerciseId: step.exerciseId,
          section: step.section,
          role: step.role,
          doseBlockIds: step.orderedDoseBlockIds,
        }),
        exerciseId: step.exerciseId,
        sessionId: sequence.sessionIntentId,
        sequenceIndex: step.sequenceIndex,
      });
    }
  }
  const result = Object.freeze(values.sort((left, right) =>
    `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`)));
  entityCache.set(snapshot, result);
  return result;
}

function continuityClassification(
  current: AlignableEntity,
  proposed: AlignableEntity,
): PhaseProgramContinuityClassification {
  if (current.id === proposed.id && current.semanticKey === proposed.semanticKey) return "preserved_exact";
  if (current.kind === "prescription" && current.exerciseId === proposed.exerciseId) {
    return "preserved_same_identity_modified_prescription";
  }
  if (current.kind === "sequence_step" && current.exerciseId === proposed.exerciseId &&
      current.sequenceIndex !== proposed.sequenceIndex) {
    return "preserved_same_assignment_resequenced";
  }
  if (current.kind === "assignment" && current.exerciseId === proposed.exerciseId &&
      current.sessionId !== proposed.sessionId) {
    return "preserved_reallocated_across_session";
  }
  return current.semanticKey === proposed.semanticKey ? "preserved_exact" : "unexplained_change";
}

export function alignPhaseContinuityHorizons(input: {
  readonly current: FullPrescribedProgramSnapshot;
  readonly proposed: FullPrescribedProgramSnapshot;
  readonly explicitMappings: readonly PhaseTransitionEntityMapping[];
}): PhaseCrossHorizonAlignmentResult {
  const current = entities(input.current);
  const proposed = entities(input.proposed);
  const proposedById = new Map(proposed.map((entry) => [`${entry.kind}:${entry.id}`, entry]));
  const mappings = new Map(input.explicitMappings.map((entry) => [
    `${entry.entityKind}:${entry.currentEntityId}`,
    `${entry.entityKind}:${entry.proposedEntityId}`,
  ]));
  const matchedProposed = new Set<string>();
  const entries: PhaseCrossHorizonAlignmentEntry[] = [];
  let ambiguityCount = 0;
  let invalidCount = 0;

  for (const candidate of current) {
    const key = `${candidate.kind}:${candidate.id}`;
    const explicitTarget = mappings.get(key);
    const exact = proposedById.get(key);
    const mapped = explicitTarget ? proposedById.get(explicitTarget) : undefined;
    const semantic = proposed.filter((entry) =>
      entry.kind === candidate.kind && entry.semanticKey === candidate.semanticKey &&
      !matchedProposed.has(`${entry.kind}:${entry.id}`));
    const target = mapped ?? exact ?? (semantic.length === 1 ? semantic[0] : undefined);
    if (!target && semantic.length > 1) {
      ambiguityCount += 1;
      entries.push({
        entityKind: candidate.kind,
        currentEntityId: candidate.id,
        proposedEntityId: null,
        status: "ambiguous_alignment",
        continuityClassification: "ambiguous_alignment",
        reasonCode: "MULTIPLE_SEMANTIC_CROSS_HORIZON_MATCHES",
      });
      continue;
    }
    if (!target) {
      entries.push({
        entityKind: candidate.kind,
        currentEntityId: candidate.id,
        proposedEntityId: null,
        status: "intentionally_unmatched",
        continuityClassification: "intentionally_unmatched",
        reasonCode: "NO_CROSS_HORIZON_MATCH",
      });
      continue;
    }
    const targetKey = `${target.kind}:${target.id}`;
    if (matchedProposed.has(targetKey) && targetKey !== key) {
      invalidCount += 1;
      entries.push({
        entityKind: candidate.kind,
        currentEntityId: candidate.id,
        proposedEntityId: target.id,
        status: "ambiguous_alignment",
        continuityClassification: "ambiguous_alignment",
        reasonCode: "PROPOSED_ENTITY_MAPPED_MORE_THAN_ONCE",
      });
      continue;
    }
    matchedProposed.add(targetKey);
    entries.push({
      entityKind: candidate.kind,
      currentEntityId: candidate.id,
      proposedEntityId: target.id,
      status: mapped ? "explicit_cross_horizon_mapping" : exact ? "exact_lineage_match" :
        "semantic_responsibility_match",
      continuityClassification: continuityClassification(candidate, target),
      reasonCode: mapped ? "EXPLICIT_TRANSITION_PROPOSAL_MAPPING" : exact ? "STABLE_ENTITY_LINEAGE" :
        "UNIQUE_SEMANTIC_RESPONSIBILITY",
    });
  }
  for (const candidate of proposed) {
    const key = `${candidate.kind}:${candidate.id}`;
    if (!matchedProposed.has(key)) {
      entries.push({
        entityKind: candidate.kind,
        currentEntityId: null,
        proposedEntityId: candidate.id,
        status: "intentionally_unmatched",
        continuityClassification: "intentionally_unmatched",
        reasonCode: "NEW_OR_UNMAPPED_PROPOSED_ENTITY",
      });
    }
  }
  const status = invalidCount > 0 ? "invalid_alignment" : ambiguityCount > 0 ?
    "ambiguous_alignment" : "aligned";
  return Object.freeze({
    status,
    entries: Object.freeze(entries),
    ambiguityCount,
    invalidCount,
    reasonCodes: Object.freeze(status === "aligned" ? ["CROSS_HORIZON_ALIGNMENT_VALID"] :
      [status === "ambiguous_alignment" ? "PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS" :
        "PHASE_PROGRAM_ALIGNMENT_INVALID"]),
  });
}

function rate(currentValues: readonly string[], proposedValues: readonly string[]): number {
  if (currentValues.length === 0) return 1;
  const remaining = [...proposedValues];
  let matches = 0;
  for (const value of currentValues) {
    const index = remaining.indexOf(value);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }
  return Number((matches / currentValues.length).toFixed(6));
}

function valuesFor(snapshot: FullPrescribedProgramSnapshot, kind: AlignableEntity["kind"]): readonly string[] {
  return entities(snapshot).filter((entry) => entry.kind === kind).map((entry) => entry.semanticKey);
}

function assignmentsBySection(snapshot: FullPrescribedProgramSnapshot, section: "warmup" | "activation") {
  return snapshot.sessionSkeletons.flatMap((skeleton) => skeleton.assignments)
    .filter((assignment) => assignment.section === section)
    .map((assignment) => stable({ exerciseId: assignment.exerciseId, role: assignment.role,
      needIds: [...assignment.satisfiedNeedIds].sort() }));
}

function mainAnchors(snapshot: FullPrescribedProgramSnapshot): readonly string[] {
  return snapshot.sessionSkeletons.flatMap((skeleton) => skeleton.assignments)
    .filter((assignment) => assignment.section === "main")
    .map((assignment) => stable({ exerciseId: assignment.exerciseId, role: assignment.role,
      needIds: [...assignment.satisfiedNeedIds].sort() }));
}

function doseField(snapshot: FullPrescribedProgramSnapshot, field: "repetitions" | "tempo") {
  return snapshot.prescriptionSessionResults.flatMap((result) => result.plans)
    .flatMap((plan) => plan.doseBlocks.map((block) => {
      const value = field === "repetitions"
        ? block.dose.mode === "repetition_sets" ? block.dose.repetitions : null
        : "tempo" in block.dose ? block.dose.tempo : null;
      return stable({ exerciseId: plan.exerciseId, purpose: block.purpose, value });
    }));
}

export function measurePhaseContinuity(input: {
  readonly current: FullPrescribedProgramSnapshot;
  readonly proposed: FullPrescribedProgramSnapshot;
  readonly alignment: PhaseCrossHorizonAlignmentResult;
  readonly phaseOwnedChangeCount: number;
  readonly nonPhaseOwnedChangeCount: number;
  readonly replacementConsiderationCount?: number;
}): PhaseContinuityMetricTrace {
  let currentSignatures = signatureCache.get(input.current);
  if (!currentSignatures) {
    currentSignatures = buildFullProgramSignatureFamily(input.current);
    signatureCache.set(input.current, currentSignatures);
  }
  let proposedSignatures = signatureCache.get(input.proposed);
  if (!proposedSignatures) {
    proposedSignatures = buildFullProgramSignatureFamily(input.proposed);
    signatureCache.set(input.proposed, proposedSignatures);
  }
  const unexplainedChangeCount = input.alignment.entries.filter((entry) =>
    entry.continuityClassification === "unexplained_change").length;
  const prescriptionCount = valuesFor(input.current, "prescription").length;
  return Object.freeze({
    frameworkRetentionRate: currentSignatures.programFramework.fingerprint ===
      proposedSignatures.programFramework.fingerprint ? 1 : 0,
    objectiveRetentionRate: rate(valuesFor(input.current, "weekly_objective"),
      valuesFor(input.proposed, "weekly_objective")),
    sessionPurposeRetentionRate: rate(valuesFor(input.current, "session"), valuesFor(input.proposed, "session")),
    anchorRetentionRate: rate(mainAnchors(input.current), mainAnchors(input.proposed)),
    exerciseIdentityRetentionRate: rate(
      input.current.sessionSkeletons.flatMap((entry) => entry.assignments.map((assignment) => assignment.exerciseId)),
      input.proposed.sessionSkeletons.flatMap((entry) => entry.assignments.map((assignment) => assignment.exerciseId)),
    ),
    samePrescriptionRate: rate(valuesFor(input.current, "prescription"), valuesFor(input.proposed, "prescription")),
    sameRepRate: rate(doseField(input.current, "repetitions"), doseField(input.proposed, "repetitions")),
    sameTempoRate: rate(doseField(input.current, "tempo"), doseField(input.proposed, "tempo")),
    sameSequenceRate: rate(valuesFor(input.current, "sequence_step"), valuesFor(input.proposed, "sequence_step")),
    warmupRetentionRate: rate(assignmentsBySection(input.current, "warmup"),
      assignmentsBySection(input.proposed, "warmup")),
    activationRetentionRate: rate(assignmentsBySection(input.current, "activation"),
      assignmentsBySection(input.proposed, "activation")),
    localChangeRate: prescriptionCount === 0 ? 0 : Number((input.phaseOwnedChangeCount / prescriptionCount).toFixed(6)),
    replacementConsiderationRate: prescriptionCount === 0 ? 0 : Number(((input.replacementConsiderationCount ?? 0) /
      prescriptionCount).toFixed(6)),
    unexplainedChangeCount,
    phaseOwnedChangeCount: input.phaseOwnedChangeCount,
    nonPhaseOwnedChangeCount: input.nonPhaseOwnedChangeCount,
  });
}
