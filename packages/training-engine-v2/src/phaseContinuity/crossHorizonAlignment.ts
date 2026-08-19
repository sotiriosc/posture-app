import type {
  ProductionPhaseContinuityMetricTrace,
  ProductionPhaseCrossHorizonAlignmentEntry,
  ProductionPhaseCrossHorizonAlignmentResult,
  ProductionPhaseProgramContinuityClassification,
  ProductionPhaseTransitionEntityMapping,
} from "./contracts";
import type {
  ProductionPhaseProgramEntitySummary,
  ProductionPhaseProgramSnapshot,
} from "./programSnapshot";

function classify(
  current: ProductionPhaseProgramEntitySummary,
  proposed: ProductionPhaseProgramEntitySummary,
): ProductionPhaseProgramContinuityClassification {
  if (current.entityId === proposed.entityId &&
      current.semanticResponsibilityKey === proposed.semanticResponsibilityKey) return "preserved_exact";
  if (current.kind === "prescription" && current.exerciseId === proposed.exerciseId) {
    return "preserved_same_identity_modified_prescription";
  }
  if (current.kind === "sequence_step" && current.exerciseId === proposed.exerciseId &&
      current.sequenceIndex !== proposed.sequenceIndex) return "preserved_same_assignment_resequenced";
  if (current.kind === "assignment" && current.exerciseId === proposed.exerciseId &&
      current.sessionId !== proposed.sessionId) return "preserved_reallocated_across_session";
  return current.semanticResponsibilityKey === proposed.semanticResponsibilityKey ?
    "preserved_exact" : "unexplained_change";
}

export function alignProductionPhaseProgramSnapshots(input: {
  readonly current: ProductionPhaseProgramSnapshot;
  readonly proposed: ProductionPhaseProgramSnapshot;
  readonly explicitMappings: readonly ProductionPhaseTransitionEntityMapping[];
}): ProductionPhaseCrossHorizonAlignmentResult {
  const current = input.current.entities;
  const proposed = input.proposed.entities;
  const byId = new Map(proposed.map((entry) => [`${entry.kind}:${entry.entityId}`, entry]));
  const mappings = new Map(input.explicitMappings.map((entry) => [
    `${entry.entityKind}:${entry.currentEntityId}`, `${entry.entityKind}:${entry.proposedEntityId}`,
  ]));
  const matched = new Set<string>();
  const entries: ProductionPhaseCrossHorizonAlignmentEntry[] = [];
  let ambiguityCount = 0;
  let invalidCount = 0;
  for (const candidate of current) {
    const key = `${candidate.kind}:${candidate.entityId}`;
    const explicitTargetKey = mappings.get(key);
    const mapped = explicitTargetKey ? byId.get(explicitTargetKey) : undefined;
    const exact = byId.get(key);
    const semantic = proposed.filter((entry) => entry.kind === candidate.kind &&
      entry.semanticResponsibilityKey === candidate.semanticResponsibilityKey &&
      !matched.has(`${entry.kind}:${entry.entityId}`));
    if (explicitTargetKey && !mapped) {
      invalidCount += 1;
      entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: candidate.entityId,
        proposedEntityId: null, status: "ambiguous_alignment", continuityClassification: "ambiguous_alignment",
        reasonCode: "EXPLICIT_CROSS_HORIZON_MAPPING_TARGET_MISSING" }));
      continue;
    }
    const target = mapped ?? exact ?? (semantic.length === 1 ? semantic[0] : undefined);
    if (!target && semantic.length > 1) {
      ambiguityCount += 1;
      entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: candidate.entityId,
        proposedEntityId: null, status: "ambiguous_alignment",
        continuityClassification: "ambiguous_alignment", reasonCode: "MULTIPLE_SEMANTIC_CROSS_HORIZON_MATCHES" }));
      continue;
    }
    if (!target) {
      entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: candidate.entityId,
        proposedEntityId: null, status: "intentionally_unmatched",
        continuityClassification: "intentionally_unmatched", reasonCode: "NO_CROSS_HORIZON_MATCH" }));
      continue;
    }
    const targetKey = `${target.kind}:${target.entityId}`;
    if (matched.has(targetKey) && targetKey !== key) {
      invalidCount += 1;
      entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: candidate.entityId,
        proposedEntityId: target.entityId, status: "ambiguous_alignment",
        continuityClassification: "ambiguous_alignment", reasonCode: "PROPOSED_ENTITY_MAPPED_MORE_THAN_ONCE" }));
      continue;
    }
    matched.add(targetKey);
    entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: candidate.entityId,
      proposedEntityId: target.entityId, status: mapped ? "explicit_cross_horizon_mapping" : exact ?
        "exact_lineage_match" : "semantic_responsibility_match",
      continuityClassification: classify(candidate, target), reasonCode: mapped ?
        "EXPLICIT_TRANSITION_PROPOSAL_MAPPING" : exact ? "STABLE_ENTITY_LINEAGE" :
          "UNIQUE_SEMANTIC_RESPONSIBILITY" }));
  }
  for (const candidate of proposed) {
    const key = `${candidate.kind}:${candidate.entityId}`;
    if (!matched.has(key)) entries.push(Object.freeze({ entityKind: candidate.kind, currentEntityId: null,
      proposedEntityId: candidate.entityId, status: "intentionally_unmatched",
      continuityClassification: "intentionally_unmatched", reasonCode: "NEW_OR_UNMAPPED_PROPOSED_ENTITY" }));
  }
  const status = invalidCount > 0 ? "invalid_alignment" : ambiguityCount > 0 ?
    "ambiguous_alignment" : "aligned";
  return Object.freeze({ status, entries: Object.freeze(entries), ambiguityCount, invalidCount,
    reasonCodes: Object.freeze(status === "aligned" ? ["CROSS_HORIZON_ALIGNMENT_VALID"] :
      [status === "ambiguous_alignment" ? "PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS" :
        "PHASE_PROGRAM_ALIGNMENT_INVALID"]) });
}

function rate(current: readonly string[], proposed: readonly string[]): number {
  if (current.length === 0) return 1;
  const remaining = [...proposed];
  let count = 0;
  for (const value of current) {
    const index = remaining.indexOf(value);
    if (index >= 0) { count += 1; remaining.splice(index, 1); }
  }
  return Number((count / current.length).toFixed(6));
}

function keys(snapshot: ProductionPhaseProgramSnapshot, kind: ProductionPhaseProgramEntitySummary["kind"]):
readonly string[] {
  return snapshot.entities.filter((entry) => entry.kind === kind)
    .map((entry) => entry.semanticResponsibilityKey);
}

function sectionKeys(snapshot: ProductionPhaseProgramSnapshot, section: string): readonly string[] {
  return snapshot.entities.filter((entry) => entry.kind === "assignment" && entry.section === section)
    .map((entry) => entry.semanticResponsibilityKey);
}

function exerciseIds(snapshot: ProductionPhaseProgramSnapshot): readonly string[] {
  return snapshot.entities.filter((entry) => entry.kind === "assignment" && entry.exerciseId)
    .map((entry) => entry.exerciseId as string);
}

function prescriptionFieldKeys(snapshot: ProductionPhaseProgramSnapshot,
  field: "repetitionSemanticKeys" | "tempoSemanticKeys"): readonly string[] {
  return snapshot.entities.filter((entry) => entry.kind === "prescription")
    .flatMap((entry) => entry[field] ?? []);
}

export function measureProductionPhaseContinuity(input: {
  readonly current: ProductionPhaseProgramSnapshot;
  readonly proposed: ProductionPhaseProgramSnapshot;
  readonly alignment: ProductionPhaseCrossHorizonAlignmentResult;
  readonly phaseOwnedChangeCount: number;
  readonly nonPhaseOwnedChangeCount: number;
  readonly replacementConsiderationCount?: number;
}): ProductionPhaseContinuityMetricTrace {
  const prescriptions = keys(input.current, "prescription");
  const samePrescriptions = rate(prescriptions, keys(input.proposed, "prescription"));
  return Object.freeze({
    frameworkRetentionRate: input.current.planningHorizonId === input.proposed.planningHorizonId &&
      input.current.weeklyIntentId === input.proposed.weeklyIntentId &&
      input.current.weekAllocationPlanId === input.proposed.weekAllocationPlanId ? 1 : 0,
    objectiveRetentionRate: rate(keys(input.current, "weekly_objective"), keys(input.proposed, "weekly_objective")),
    sessionPurposeRetentionRate: rate(keys(input.current, "session"), keys(input.proposed, "session")),
    anchorRetentionRate: rate(sectionKeys(input.current, "main"), sectionKeys(input.proposed, "main")),
    exerciseIdentityRetentionRate: rate(exerciseIds(input.current), exerciseIds(input.proposed)),
    samePrescriptionRate: samePrescriptions,
    sameRepRate: rate(prescriptionFieldKeys(input.current, "repetitionSemanticKeys"),
      prescriptionFieldKeys(input.proposed, "repetitionSemanticKeys")),
    sameTempoRate: rate(prescriptionFieldKeys(input.current, "tempoSemanticKeys"),
      prescriptionFieldKeys(input.proposed, "tempoSemanticKeys")),
    sameSequenceRate: rate(keys(input.current, "sequence_step"), keys(input.proposed, "sequence_step")),
    warmupRetentionRate: rate(sectionKeys(input.current, "warmup"), sectionKeys(input.proposed, "warmup")),
    activationRetentionRate: rate(sectionKeys(input.current, "activation"), sectionKeys(input.proposed, "activation")),
    localChangeRate: prescriptions.length === 0 ? 0 : Number((input.phaseOwnedChangeCount /
      prescriptions.length).toFixed(6)),
    replacementConsiderationRate: prescriptions.length === 0 ? 0 : Number(((input.replacementConsiderationCount ?? 0) /
      prescriptions.length).toFixed(6)),
    unexplainedChangeCount: input.alignment.entries.filter((entry) =>
      entry.continuityClassification === "unexplained_change").length,
    phaseOwnedChangeCount: input.phaseOwnedChangeCount,
    nonPhaseOwnedChangeCount: input.nonPhaseOwnedChangeCount,
  });
}
