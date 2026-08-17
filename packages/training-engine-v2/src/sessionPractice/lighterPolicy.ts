import { uniqueSorted } from "../prescription/compiler/utilities";
import {
  SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_LIGHTER_POLICY_V1,
  SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
  type SessionPracticeAssignmentFacts,
  type SessionPracticeNeedCoverage,
  type SessionPracticePolicyContext,
  type SessionPracticePrescriptionRevision,
  type SessionPracticeStructuralProjection,
} from "./contracts";
import { pruneOrphanSessionPracticeDependencies } from "./dependencyPruning";
import { lowerPrescriptionDevelopmentalCount } from "./prescriptionRevision";
import { deriveSessionPracticeRealizationRevisionId } from "./request";
import {
  deriveSessionPracticeAssignmentFacts,
  validateSessionPracticeRequestAgainstSource,
  validateSessionPracticeSourceSnapshot,
} from "./validation";

function policyReference(): string {
  return `${SESSION_PRACTICE_LIGHTER_POLICY_V1.policyId}@${SESSION_PRACTICE_LIGHTER_POLICY_V1.version}`;
}

function omissionOrder(left: SessionPracticeAssignmentFacts, right: SessionPracticeAssignmentFacts): number {
  const leftTrace = [...left.assignment.marginalValueReasonCodes].sort().join("|");
  const rightTrace = [...right.assignment.marginalValueReasonCodes].sort().join("|");
  return `${leftTrace}:${left.assignmentId}`.localeCompare(`${rightTrace}:${right.assignmentId}`);
}

function requiredDependentRetainsCandidate(
  candidate: SessionPracticeAssignmentFacts,
  facts: readonly SessionPracticeAssignmentFacts[],
  retained: ReadonlySet<string>,
): boolean {
  return candidate.dependentAssignmentIds.some((dependentId) => {
    const dependent = facts.find((fact) => fact.assignmentId === dependentId);
    return retained.has(dependentId) && dependent?.priority === "required";
  });
}

function mayOmit(
  candidate: SessionPracticeAssignmentFacts,
  facts: readonly SessionPracticeAssignmentFacts[],
  retained: ReadonlySet<string>,
): boolean {
  return candidate.uniqueActiveNeedIds.length === 0 && !candidate.productiveRequiredAnchor &&
    candidate.assignment.role !== "primary_strength" &&
    !requiredDependentRetainsCandidate(candidate, facts, retained);
}

function needCoverageFor(
  context: SessionPracticePolicyContext,
  retained: ReadonlySet<string>,
): readonly SessionPracticeNeedCoverage[] {
  return Object.freeze(context.source.intent.needs.map((need): SessionPracticeNeedCoverage => {
    const sourceAssignmentIds = context.source.skeleton.assignments
      .filter((assignment) => assignment.satisfiedNeedIds.includes(need.id))
      .map((assignment) => assignment.routinePrescriptionHandoffId).sort();
    const retainedAssignmentIds = sourceAssignmentIds.filter((id) => retained.has(id));
    return Object.freeze({
      needId: need.id,
      priority: need.priority,
      sourceAssignmentIds: Object.freeze(sourceAssignmentIds),
      retainedAssignmentIds: Object.freeze(retainedAssignmentIds),
      state: retainedAssignmentIds.length > 0 ? "preserved" : "omitted_pending_responsibility",
    });
  }));
}

export function projectLighterSessionPractice(
  context: SessionPracticePolicyContext,
): SessionPracticeStructuralProjection {
  const sourceReasons = [...validateSessionPracticeSourceSnapshot(context.source),
    ...validateSessionPracticeRequestAgainstSource({ request: context.request, source: context.source })];
  const safetyBlocked = !context.source.trainingReadiness.downstreamTrainingAllowed;
  const sourceIncomplete = sourceReasons.some((reason) => reason !== "SESSION_PRACTICE_BLOCKED_BY_TRAINING_SAFETY");
  if (safetyBlocked || sourceIncomplete) {
    const state = safetyBlocked ? "blocked_by_training_safety" : "blocked_by_source_session_incomplete";
    return Object.freeze({
      mode: "lighter",
      availability: Object.freeze({ contractReference: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
        mode: "lighter", state, reasonCodes: Object.freeze(uniqueSorted(sourceReasons)),
        sourceEvidenceRefs: Object.freeze([context.source.sourceSessionRevisionId]),
        materiality: Object.freeze({ assignmentOmissionCount: 0, developmentalCountReduction: 0,
          explicitLowerVariantCount: 0, materialReduction: false,
          reasonCodes: Object.freeze(["LIGHTER_SOURCE_NOT_ELIGIBLE"]) }), fallbackApplied: false }),
      assignments: Object.freeze([]), dependencies: Object.freeze([]), prescriptionRevisions: Object.freeze([]),
      needCoverage: Object.freeze([]), purposePreserved: false, requiredResponsibilitiesSatisfied: false,
      sourceEventsPreserved: false, developmentalCreditEligible: false,
      unresolvedRequirements: Object.freeze(uniqueSorted(sourceReasons)),
      weekResponsibilityConsequences: Object.freeze(["NO_WEEK_CREDIT"]),
      noFallbackTrace: Object.freeze([policyReference(), "NO_FALLBACK"]),
    });
  }

  const facts = deriveSessionPracticeAssignmentFacts(context.source);
  const retained = new Set(facts.map((fact) => fact.assignmentId));
  const omissionReasons = new Map<string, string[]>();
  const omit = (fact: SessionPracticeAssignmentFacts, reason: string): void => {
    retained.delete(fact.assignmentId);
    omissionReasons.set(fact.assignmentId, [...(omissionReasons.get(fact.assignmentId) ?? []), reason]);
  };

  // L1: a valid Composer should not emit these, but compatibility sources expose and remove them.
  for (const fact of facts.filter((candidate) => candidate.priority === "optional" &&
    candidate.assignment.satisfiedNeedIds.length === 0).sort(omissionOrder)) {
    if (mayOmit(fact, facts, retained)) omit(fact, "L1_ZERO_VALUE_OPTIONAL_OMITTED_INTEGRITY_FINDING");
  }

  // L2: omit optional positive-value work only when no unique active need or hard dependency is lost.
  for (const fact of facts.filter((candidate) => retained.has(candidate.assignmentId) &&
    candidate.priority === "optional").sort(omissionOrder)) {
    if (mayOmit(fact, facts, retained)) omit(fact, "L2_OPTIONAL_LOWEST_TRUTHFUL_MARGINAL_VALUE_OMITTED");
  }

  // L3: preferred non-anchor supporting work is the final structural omission lane.
  for (const fact of facts.filter((candidate) => retained.has(candidate.assignmentId) &&
    candidate.priority === "preferred" && !candidate.productiveRequiredAnchor &&
    candidate.assignment.role !== "primary_strength").sort(omissionOrder)) {
    if (mayOmit(fact, facts, retained)) omit(fact, "L3_PREFERRED_NON_ANCHOR_SUPPORT_OMITTED");
  }

  const pruning = pruneOrphanSessionPracticeDependencies({
    facts,
    initiallyRetainedAssignmentIds: [...retained],
  });
  pruning.prunedAssignmentIds.forEach((assignmentId) => {
    retained.delete(assignmentId);
    omissionReasons.set(assignmentId, [...(omissionReasons.get(assignmentId) ?? []),
      "ORPHAN_PREPARATION_OR_ACTIVATION_PRUNED"]);
  });

  const realizationRevisionId = deriveSessionPracticeRealizationRevisionId({
    attemptId: context.request.attemptId,
    requestId: context.request.requestId,
    sourceSessionRevisionId: context.source.sourceSessionRevisionId,
    mode: "lighter",
    basedOnRevisionId: null,
  });
  const revisions: SessionPracticePrescriptionRevision[] = [];
  let developmentalCountReduction = 0;
  let modifiedAssignmentId: string | null = null;

  // L4 then L5: dose revision occurs only if structure alone produced no material reduction.
  if (omissionReasons.size === 0) {
    const lowerPriority = facts.filter((fact) => retained.has(fact.assignmentId) &&
      !fact.productiveRequiredAnchor).sort((left, right) => {
        const rank = (fact: SessionPracticeAssignmentFacts) => fact.priority === "optional" ? 0 :
          fact.priority === "preferred" ? 1 : fact.assignment.section === "accessory" ? 2 : 3;
        return rank(left) - rank(right) || left.assignmentId.localeCompare(right.assignmentId);
      });
    const primaryAnchors = facts.filter((fact) => retained.has(fact.assignmentId) &&
      fact.productiveRequiredAnchor).sort((left, right) => left.assignmentId.localeCompare(right.assignmentId));
    for (const fact of [...lowerPriority, ...primaryAnchors]) {
      const result = lowerPrescriptionDevelopmentalCount({
        plan: fact.prescription,
        assignmentId: fact.assignmentId,
        attemptId: context.request.attemptId,
        realizationRevisionId,
        admittedMinimumCountByBlockId: context.source.admittedMinimumCountByBlockId,
        policyReference: policyReference(),
        createdAt: context.createdAt,
      });
      if (!result.revision) continue;
      revisions.push(result.revision);
      developmentalCountReduction += result.reductionCount;
      modifiedAssignmentId = fact.assignmentId;
      break;
    }
  }

  const materialReduction = omissionReasons.size > 0 || developmentalCountReduction > 0;
  const needCoverage = needCoverageFor(context, retained);
  const requiredResponsibilitiesSatisfied = needCoverage
    .filter((coverage) => coverage.priority === "required")
    .every((coverage) => coverage.state === "preserved") && pruning.requiredDependencyViolationIds.length === 0;
  const anchorsPreserved = facts.filter((fact) => fact.productiveRequiredAnchor)
    .every((fact) => retained.has(fact.assignmentId));
  const purposePreserved = requiredResponsibilitiesSatisfied && anchorsPreserved;
  const available = materialReduction && purposePreserved;

  const assignments = facts.map((fact) => {
    const isRetained = retained.has(fact.assignmentId);
    const revision = revisions.find((candidate) => candidate.assignmentId === fact.assignmentId);
    return Object.freeze({
      contractReference: SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
      assignmentId: fact.assignmentId,
      exerciseId: fact.assignment.exerciseId,
      sourceExposureEventId: fact.prescription.sourceExposureEvent.sourceExposureEventId,
      state: !isRetained ? "omitted" as const : revision ? "modified" as const : "retained" as const,
      priority: fact.priority,
      productiveRequiredAnchor: fact.productiveRequiredAnchor,
      retainedBlockIds: Object.freeze(isRetained ? fact.prescription.doseBlocks.map((block) => block.blockId) : []),
      omittedBlockIds: Object.freeze(isRetained ? [] : fact.prescription.doseBlocks.map((block) => block.blockId)),
      reasonCodes: Object.freeze(!isRetained ? omissionReasons.get(fact.assignmentId) ?? ["LIGHTER_POLICY_OMITTED"] :
        revision ? [fact.productiveRequiredAnchor ? "L5_PRIMARY_ANCHOR_DOSE_REDUCED_LAST_RESORT" :
          "L4_LOWER_PRIORITY_DEVELOPMENTAL_DOSE_REVISED"] : ["L0_PROTECTED_OR_RETAINED"]),
      recoveryContributionLane: null,
      performanceCreated: false as const,
    });
  });
  const availabilityState = available ? requiredResponsibilitiesSatisfied ? "available" :
    "available_with_pending_week_responsibility" : "unavailable_no_material_reduction";
  const materialityReasons = materialReduction ? [omissionReasons.size > 0 ?
    "STRUCTURAL_OMISSION_MATERIAL" : "ADMITTED_LOWER_DEVELOPMENTAL_COUNT_MATERIAL"] :
    ["LIGHTER_REALIZATION_UNAVAILABLE"];

  return Object.freeze({
    mode: "lighter",
    availability: Object.freeze({
      contractReference: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
      mode: "lighter",
      state: availabilityState,
      reasonCodes: Object.freeze(available ? ["LIGHTER_VALID_PURPOSE_PRESERVING_REALIZATION"] :
        ["LIGHTER_REALIZATION_UNAVAILABLE"]),
      sourceEvidenceRefs: Object.freeze([context.source.sourceSessionRevisionId,
        context.source.finalSequence.sequenceRevisionId]),
      materiality: Object.freeze({
        assignmentOmissionCount: omissionReasons.size,
        developmentalCountReduction,
        explicitLowerVariantCount: revisions.length,
        materialReduction,
        reasonCodes: Object.freeze(materialityReasons),
      }),
      fallbackApplied: false,
    }),
    assignments: Object.freeze(assignments),
    dependencies: pruning.dispositions,
    prescriptionRevisions: Object.freeze(revisions),
    needCoverage,
    purposePreserved,
    requiredResponsibilitiesSatisfied,
    sourceEventsPreserved: new Set(assignments.filter((entry) => entry.state !== "omitted")
      .map((entry) => entry.sourceExposureEventId)).size === retained.size,
    developmentalCreditEligible: available,
    unresolvedRequirements: Object.freeze(available ? [] : [materialReduction ?
      "LIGHTER_PROTECTED_PURPOSE_VIOLATION" : "LIGHTER_REALIZATION_UNAVAILABLE"]),
    weekResponsibilityConsequences: Object.freeze(requiredResponsibilitiesSatisfied ?
      ["REALIZED_REQUIRED_RESPONSIBILITIES_REQUIRE_GATE_13_AND_PERFORMANCE"] :
      ["UNFULFILLED_RESPONSIBILITY_REMAINS_EXPLICIT", "REMAINING_WEEK_REVIEW_REQUIRED"]),
    noFallbackTrace: Object.freeze([policyReference(), modifiedAssignmentId ?
      "PRESCRIPTION_REVISION_USED" : "STRUCTURAL_POLICY_USED", "NO_FALLBACK"]),
  });
}
