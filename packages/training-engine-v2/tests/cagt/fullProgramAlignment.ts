import { digest } from "./signatures";
import type {
  FullPrescribedProgramCounterfactualContract,
  FullPrescribedProgramSnapshot,
  FullProgramEntityAlignment,
  FullProgramEntityAlignmentEntry,
  FullProgramEntityKind,
} from "./fullProgramContracts";

interface AlignableEntity {
  readonly id: string;
  readonly semanticKey: string;
}

const sorted = (values: readonly string[]): readonly string[] => [...values].sort();

function objectiveKey(snapshot: FullPrescribedProgramSnapshot, objectiveId: string): string {
  const objective = snapshot.normalizedWeekSourceSnapshot.objectives.find((entry) => entry.objectiveId === objectiveId);
  return objective ? digest({ purpose: objective.purpose, target: objective.target, priority: objective.priority,
    priorityOrder: objective.priorityOrder }) : `unknown:${objectiveId}`;
}

function orderByOpportunity(snapshot: FullPrescribedProgramSnapshot): ReadonlyMap<string, number> {
  return new Map(snapshot.normalizedWeekSourceSnapshot.opportunities.map((entry) => [entry.opportunityId, entry.order]));
}

function entities(snapshot: FullPrescribedProgramSnapshot, kind: FullProgramEntityKind): readonly AlignableEntity[] {
  const orders = orderByOpportunity(snapshot);
  if (kind === "weekly_objective") return snapshot.normalizedWeekSourceSnapshot.objectives.map((objective) => ({
    id: objective.objectiveId,
    semanticKey: digest({ purpose: objective.purpose, target: objective.target, priority: objective.priority,
      priorityOrder: objective.priorityOrder }),
  }));
  if (kind === "opportunity") return snapshot.normalizedWeekSourceSnapshot.opportunities.map((opportunity) => ({
    id: opportunity.opportunityId,
    semanticKey: digest({ order: opportunity.order, availabilityState: opportunity.availabilityState,
      executionState: opportunity.executionState, availableMinutes: opportunity.availableMinutes }),
  }));
  if (kind === "reservation") return snapshot.normalizedWeekSourceSnapshot.reservations.map((reservation) => ({
    id: reservation.reservationId,
    semanticKey: digest({ opportunityOrder: orders.get(reservation.opportunityId) ?? -1,
      objectives: sorted(reservation.allocatedObjectiveIds.map((id) => objectiveKey(snapshot, id))),
      expectedSessionGoal: reservation.expectedSessionGoal }),
  }));
  if (kind === "session") return snapshot.reservationArtifacts.map((artifact) => ({
    id: artifact.sessionIntent.id,
    semanticKey: digest({ opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
      primaryGoal: artifact.sessionIntent.primaryGoal, structuralCapacity: artifact.sessionIntent.structuralCapacity,
      needs: artifact.sessionIntent.needs.map((need) => ({ section: need.section, priority: need.priority,
        priorityOrder: need.priorityOrder, selection: need.selection })) }),
  }));
  if (kind === "session_need") return snapshot.reservationArtifacts.flatMap((artifact) =>
    artifact.sessionIntent.needs.map((need) => ({
      id: need.id,
      semanticKey: digest({ opportunityOrder: orders.get(artifact.opportunityId) ?? -1, section: need.section,
        priority: need.priority, priorityOrder: need.priorityOrder, selection: need.selection,
        objectives: sorted((need.plannerProvenance?.objectiveIds ?? []).map((id) => objectiveKey(snapshot, id))) }),
    })));
  if (kind === "assignment") return snapshot.reservationArtifacts.flatMap((artifact) =>
    artifact.sessionSkeleton.assignments.map((assignment) => ({
      id: assignment.routinePrescriptionHandoffId,
      semanticKey: digest({ opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
        exerciseId: assignment.exerciseId, section: assignment.section, role: assignment.role,
        satisfiedNeedCount: assignment.satisfiedNeedIds.length }),
    })));
  if (kind === "source_event") return snapshot.postPrescriptionWeekValidationResult.sourceExposureLedger.map((event) => ({
    id: event.sourceExposureEventId,
    semanticKey: digest({ opportunityOrder: orders.get(event.opportunityId) ?? -1, exerciseId: event.exerciseId,
      section: event.section, role: event.role, objectives: sorted(event.weeklyObjectiveIds.map((id) =>
        objectiveKey(snapshot, id))) }),
  }));
  if (kind === "prescription_plan") return snapshot.reservationArtifacts.flatMap((artifact) =>
    artifact.prescriptionCompilation.plans.map((plan) => ({
      id: plan.prescriptionId,
      semanticKey: digest({ opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
        exerciseId: plan.exerciseId, blockPurposes: plan.doseBlocks.map((block) => block.purpose) }),
    })));
  return snapshot.reservationArtifacts.flatMap((artifact) => artifact.finalSequencePlan.steps.map((step) => ({
    id: `${artifact.finalSequencePlan.sequencePlanId}:${step.assignmentId}`,
    semanticKey: digest({ opportunityOrder: orders.get(artifact.opportunityId) ?? -1,
      sequenceIndex: step.sequenceIndex, exerciseId: step.exerciseId, section: step.section, role: step.role }),
  })));
}

const ENTITY_KINDS: readonly FullProgramEntityKind[] = Object.freeze([
  "weekly_objective", "opportunity", "reservation", "session", "session_need", "assignment", "source_event",
  "prescription_plan", "sequence_step",
]);

function alignEntityKind(input: {
  readonly kind: FullProgramEntityKind;
  readonly baseline: readonly AlignableEntity[];
  readonly counterfactual: readonly AlignableEntity[];
  readonly contract: FullPrescribedProgramCounterfactualContract;
}): readonly FullProgramEntityAlignmentEntry[] {
  const entries: FullProgramEntityAlignmentEntry[] = [];
  const usedBaseline = new Set<string>();
  const usedCounterfactual = new Set<string>();
  const counterById = new Map(input.counterfactual.map((entry) => [entry.id, entry]));
  for (const baseline of input.baseline) {
    const exact = counterById.get(baseline.id);
    if (!exact) continue;
    entries.push({ entityKind: input.kind, baselineId: baseline.id, counterfactualId: exact.id,
      status: "exact_lineage_match", semanticResponsibilitySignature: baseline.semanticKey,
      reasonCode: "EXACT_LINEAGE_MATCH" });
    usedBaseline.add(baseline.id);
    usedCounterfactual.add(exact.id);
  }
  for (const mapping of input.contract.explicitEntityMappings.filter((entry) => entry.entityKind === input.kind)) {
    if (usedBaseline.has(mapping.baselineId) || usedCounterfactual.has(mapping.counterfactualId)) continue;
    const baseline = input.baseline.find((entry) => entry.id === mapping.baselineId);
    const counterfactual = input.counterfactual.find((entry) => entry.id === mapping.counterfactualId);
    if (!baseline || !counterfactual) {
      entries.push({ entityKind: input.kind, baselineId: baseline?.id ?? mapping.baselineId,
        counterfactualId: counterfactual?.id ?? mapping.counterfactualId, status: "invalid_alignment",
        semanticResponsibilitySignature: null, reasonCode: "EXPLICIT_MAPPING_ENTITY_MISSING" });
      continue;
    }
    entries.push({ entityKind: input.kind, baselineId: baseline.id, counterfactualId: counterfactual.id,
      status: "explicit_cross_snapshot_mapping", semanticResponsibilitySignature: baseline.semanticKey,
      reasonCode: "EXPLICIT_CROSS_SNAPSHOT_MAPPING" });
    usedBaseline.add(baseline.id);
    usedCounterfactual.add(counterfactual.id);
  }
  const remainingBaseline = input.baseline.filter((entry) => !usedBaseline.has(entry.id));
  const remainingCounterfactual = input.counterfactual.filter((entry) => !usedCounterfactual.has(entry.id));
  const keys = sorted([...new Set([...remainingBaseline.map((entry) => entry.semanticKey),
    ...remainingCounterfactual.map((entry) => entry.semanticKey)])]);
  for (const key of keys) {
    const left = remainingBaseline.filter((entry) => entry.semanticKey === key);
    const right = remainingCounterfactual.filter((entry) => entry.semanticKey === key);
    if (left.length === 1 && right.length === 1) {
      entries.push({ entityKind: input.kind, baselineId: left[0].id, counterfactualId: right[0].id,
        status: "semantic_equivalent_match", semanticResponsibilitySignature: key,
        reasonCode: "SEMANTIC_EQUIVALENT_MATCH" });
      continue;
    }
    if (left.length > 0 && right.length > 0) {
      for (const entry of left) entries.push({ entityKind: input.kind, baselineId: entry.id, counterfactualId: null,
        status: "ambiguous_alignment", semanticResponsibilitySignature: key, reasonCode: "PROGRAM_ALIGNMENT_AMBIGUOUS" });
      for (const entry of right) entries.push({ entityKind: input.kind, baselineId: null, counterfactualId: entry.id,
        status: "ambiguous_alignment", semanticResponsibilitySignature: key, reasonCode: "PROGRAM_ALIGNMENT_AMBIGUOUS" });
      continue;
    }
    for (const entry of left) entries.push({ entityKind: input.kind, baselineId: entry.id, counterfactualId: null,
      status: "intentionally_unmatched_baseline", semanticResponsibilitySignature: key,
      reasonCode: "LEGITIMATE_BASELINE_ONLY_STRUCTURE" });
    for (const entry of right) entries.push({ entityKind: input.kind, baselineId: null, counterfactualId: entry.id,
      status: "intentionally_unmatched_counterfactual", semanticResponsibilitySignature: key,
      reasonCode: "LEGITIMATE_COUNTERFACTUAL_ONLY_STRUCTURE" });
  }
  return entries;
}

export function alignFullPrescribedPrograms(input: {
  readonly baseline: FullPrescribedProgramSnapshot;
  readonly counterfactual: FullPrescribedProgramSnapshot;
  readonly contract: FullPrescribedProgramCounterfactualContract;
}): FullProgramEntityAlignment {
  const entries = Object.freeze(ENTITY_KINDS.flatMap((kind) => alignEntityKind({
    kind,
    baseline: entities(input.baseline, kind),
    counterfactual: entities(input.counterfactual, kind),
    contract: input.contract,
  })));
  const ambiguousRequiredEntityCount = entries.filter((entry) => entry.status === "ambiguous_alignment").length;
  const invalidEntityCount = entries.filter((entry) => entry.status === "invalid_alignment").length;
  const unmatchedBaselineCount = entries.filter((entry) => entry.status === "intentionally_unmatched_baseline").length;
  const unmatchedCounterfactualCount = entries.filter((entry) =>
    entry.status === "intentionally_unmatched_counterfactual").length;
  const status = invalidEntityCount > 0 ? "invalid_alignment" : ambiguousRequiredEntityCount > 0
    ? "ambiguous_alignment" : "aligned";
  return Object.freeze({
    status,
    entries,
    ambiguousRequiredEntityCount,
    invalidEntityCount,
    unmatchedBaselineCount,
    unmatchedCounterfactualCount,
    reasonCodes: Object.freeze(status === "aligned" ? ["PROGRAM_ALIGNMENT_EXPLICIT_OR_SEMANTIC"] :
      status === "ambiguous_alignment" ? ["PROGRAM_ALIGNMENT_AMBIGUOUS"] : ["PROGRAM_ALIGNMENT_INVALID"]),
  });
}
