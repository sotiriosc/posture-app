import { uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionPrescriptionDoseBlock } from "../prescription/compiler/contracts";
import {
  SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
  SESSION_PRACTICE_RECOVERY_POLICY_V1,
  type SessionPracticeAssignmentFacts,
  type SessionPracticeNeedCoverage,
  type SessionPracticePolicyContext,
  type SessionPracticeRecoveryContributionLane,
  type SessionPracticeStructuralProjection,
} from "./contracts";
import { pruneOrphanSessionPracticeDependencies } from "./dependencyPruning";
import { retainPrescriptionBlocksForPractice } from "./prescriptionRevision";
import { deriveSessionPracticeRealizationRevisionId } from "./request";
import {
  deriveSessionPracticeAssignmentFacts,
  validateSessionPracticeRequestAgainstSource,
  validateSessionPracticeSourceSnapshot,
} from "./validation";

function policyReference(): string {
  return `${SESSION_PRACTICE_RECOVERY_POLICY_V1.policyId}@${SESSION_PRACTICE_RECOVERY_POLICY_V1.version}`;
}

function recoveryLane(
  fact: SessionPracticeAssignmentFacts,
  block: ProductionPrescriptionDoseBlock,
): SessionPracticeRecoveryContributionLane | null {
  if (fact.assignment.section === "main" || block.purpose === "developmental_work" ||
      block.contributionClassification === "developmental_credit_candidate") return null;
  if (block.purpose === "recovery_or_downregulation" ||
      block.contributionClassification === "recovery_observation_only" ||
      fact.assignment.section === "cooldown" && block.contributionClassification === "not_weekly_developmental_credit") {
    return "recovery_support_only";
  }
  if (block.contributionClassification === "technique_quality_observation_only" &&
      block.purpose === "technique_quality_work") return "technique_control_observation_only";
  if (block.purpose === "preparatory_acclimation" && fact.independentlyActiveSupport &&
      fact.assignment.section === "warmup") return "preparation_support_only";
  if (block.purpose === "preparatory_acclimation" && fact.independentlyActiveSupport &&
      fact.assignment.section === "activation") return "activation_support_only";
  return null;
}

export function projectRecoverySessionPractice(
  context: SessionPracticePolicyContext,
): SessionPracticeStructuralProjection {
  const sourceReasons = [...validateSessionPracticeSourceSnapshot(context.source),
    ...validateSessionPracticeRequestAgainstSource({ request: context.request, source: context.source })];
  const safetyBlocked = !context.source.trainingReadiness.downstreamTrainingAllowed;
  const sourceIncomplete = sourceReasons.some((reason) => reason !== "SESSION_PRACTICE_BLOCKED_BY_TRAINING_SAFETY");
  if (safetyBlocked || sourceIncomplete) {
    const state = safetyBlocked ? "blocked_by_training_safety" : "blocked_by_source_session_incomplete";
    return Object.freeze({
      mode: "recovery",
      availability: Object.freeze({ contractReference: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
        mode: "recovery", state, reasonCodes: Object.freeze(uniqueSorted(sourceReasons)),
        sourceEvidenceRefs: Object.freeze([context.source.sourceSessionRevisionId]),
        materiality: Object.freeze({ assignmentOmissionCount: 0, developmentalCountReduction: 0,
          explicitLowerVariantCount: 0, materialReduction: false,
          reasonCodes: Object.freeze(["RECOVERY_SOURCE_NOT_ELIGIBLE"]) }), fallbackApplied: false }),
      assignments: Object.freeze([]), dependencies: Object.freeze([]), prescriptionRevisions: Object.freeze([]),
      needCoverage: Object.freeze([]), purposePreserved: false, requiredResponsibilitiesSatisfied: false,
      sourceEventsPreserved: false, developmentalCreditEligible: false,
      unresolvedRequirements: Object.freeze(uniqueSorted(sourceReasons)),
      weekResponsibilityConsequences: Object.freeze(["NO_WEEK_CREDIT"]),
      noFallbackTrace: Object.freeze([policyReference(), "NO_FALLBACK"]),
    });
  }

  const facts = deriveSessionPracticeAssignmentFacts(context.source);
  const retainedBlocksByAssignment = new Map<string, readonly string[]>();
  const lanesByAssignment = new Map<string, readonly SessionPracticeRecoveryContributionLane[]>();
  for (const fact of facts) {
    const eligible = fact.prescription.doseBlocks.map((block) => ({ block, lane: recoveryLane(fact, block) }))
      .filter((entry): entry is { readonly block: ProductionPrescriptionDoseBlock;
        readonly lane: SessionPracticeRecoveryContributionLane } => entry.lane !== null);
    if (eligible.length === 0) continue;
    retainedBlocksByAssignment.set(fact.assignmentId, Object.freeze(eligible.map((entry) => entry.block.blockId)));
    lanesByAssignment.set(fact.assignmentId, Object.freeze(eligible.map((entry) => entry.lane)));
  }

  const pruning = pruneOrphanSessionPracticeDependencies({
    facts,
    initiallyRetainedAssignmentIds: [...retainedBlocksByAssignment.keys()],
  });
  const retained = new Set(pruning.retainedAssignmentIds);
  const realizationRevisionId = deriveSessionPracticeRealizationRevisionId({
    attemptId: context.request.attemptId,
    requestId: context.request.requestId,
    sourceSessionRevisionId: context.source.sourceSessionRevisionId,
    mode: "recovery",
    basedOnRevisionId: null,
  });
  const revisions = facts.flatMap((fact) => {
    if (!retained.has(fact.assignmentId)) return [];
    const result = retainPrescriptionBlocksForPractice({
      plan: fact.prescription,
      assignmentId: fact.assignmentId,
      retainedBlockIds: retainedBlocksByAssignment.get(fact.assignmentId) ?? [],
      attemptId: context.request.attemptId,
      realizationRevisionId,
      policyReference: policyReference(),
      createdAt: context.createdAt,
    });
    return result.revision ? [result.revision] : [];
  });
  const available = retained.size > 0;
  const assignments = facts.map((fact) => {
    const isRetained = retained.has(fact.assignmentId);
    const retainedBlockIds = isRetained ? retainedBlocksByAssignment.get(fact.assignmentId) ?? [] : [];
    const allBlockIds = fact.prescription.doseBlocks.map((block) => block.blockId);
    const lanes = lanesByAssignment.get(fact.assignmentId) ?? [];
    const lane = lanes.includes("recovery_support_only") ? "recovery_support_only" :
      lanes.includes("technique_control_observation_only") ? "technique_control_observation_only" :
        lanes.includes("activation_support_only") ? "activation_support_only" :
          lanes.includes("preparation_support_only") ? "preparation_support_only" : null;
    return Object.freeze({
      contractReference: SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
      assignmentId: fact.assignmentId,
      exerciseId: fact.assignment.exerciseId,
      sourceExposureEventId: fact.prescription.sourceExposureEvent.sourceExposureEventId,
      state: !isRetained ? "omitted" as const : retainedBlockIds.length < allBlockIds.length ?
        "modified" as const : "retained" as const,
      priority: fact.priority,
      productiveRequiredAnchor: fact.productiveRequiredAnchor,
      retainedBlockIds: Object.freeze([...retainedBlockIds]),
      omittedBlockIds: Object.freeze(allBlockIds.filter((blockId) => !retainedBlockIds.includes(blockId))),
      reasonCodes: Object.freeze(isRetained ? [`RECOVERY_EXPLICIT_LANE:${lane}`] :
        [fact.assignment.section === "main" ? "RECOVERY_DEVELOPMENTAL_MAIN_EXCLUDED" :
          pruning.prunedAssignmentIds.includes(fact.assignmentId) ? "RECOVERY_ORPHAN_SUPPORT_PRUNED" :
            "RECOVERY_EXPLICIT_SUPPORT_OWNERSHIP_ABSENT"]),
      recoveryContributionLane: lane,
      performanceCreated: false as const,
    });
  });
  const needCoverage = context.source.intent.needs.map((need): SessionPracticeNeedCoverage => {
    const sourceAssignmentIds = context.source.skeleton.assignments.filter((assignment) =>
      assignment.satisfiedNeedIds.includes(need.id)).map((assignment) => assignment.routinePrescriptionHandoffId).sort();
    const retainedAssignmentIds = sourceAssignmentIds.filter((assignmentId) => retained.has(assignmentId));
    return Object.freeze({ needId: need.id, priority: need.priority,
      sourceAssignmentIds: Object.freeze(sourceAssignmentIds),
      retainedAssignmentIds: Object.freeze(retainedAssignmentIds),
      state: retainedAssignmentIds.length > 0 ? "preserved" : "omitted_pending_responsibility" });
  });

  return Object.freeze({
    mode: "recovery",
    availability: Object.freeze({
      contractReference: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
      mode: "recovery",
      state: available ? "available_with_pending_week_responsibility" :
        "unavailable_no_recovery_realization",
      reasonCodes: Object.freeze(available ? ["RECOVERY_EXPLICIT_SUPPORT_REALIZATION_AVAILABLE"] :
        ["RECOVERY_REALIZATION_UNAVAILABLE"]),
      sourceEvidenceRefs: Object.freeze([context.source.sourceSessionRevisionId,
        ...assignments.filter((entry) => entry.state !== "omitted").map((entry) => entry.sourceExposureEventId)]),
      materiality: Object.freeze({ assignmentOmissionCount: assignments.filter((entry) => entry.state === "omitted").length,
        developmentalCountReduction: facts.reduce((total, fact) => total + fact.prescription.doseBlocks
          .filter((block) => block.purpose === "developmental_work").length, 0),
        explicitLowerVariantCount: revisions.length,
        materialReduction: available,
        reasonCodes: Object.freeze(available ? ["ZERO_DEVELOPMENTAL_BLOCK_RECOVERY_REALIZATION"] :
          ["NO_EXPLICIT_RECOVERY_SUPPORT"]),
      }),
      fallbackApplied: false,
    }),
    assignments: Object.freeze(assignments),
    dependencies: pruning.dispositions,
    prescriptionRevisions: Object.freeze(revisions),
    needCoverage: Object.freeze(needCoverage),
    purposePreserved: available,
    requiredResponsibilitiesSatisfied: false,
    sourceEventsPreserved: new Set(assignments.filter((entry) => entry.state !== "omitted")
      .map((entry) => entry.sourceExposureEventId)).size === retained.size,
    developmentalCreditEligible: false,
    unresolvedRequirements: Object.freeze(available ? [] : ["RECOVERY_REALIZATION_UNAVAILABLE"]),
    weekResponsibilityConsequences: Object.freeze(available ?
      ["RECOVERY_SUPPORT_MAY_BE_OBSERVED", "ORIGINAL_DEVELOPMENTAL_RESPONSIBILITY_UNFULFILLED",
        "REMAINING_WEEK_REVIEW_REQUIRED"] : ["NO_WEEK_CREDIT"]),
    noFallbackTrace: Object.freeze([policyReference(), "NO_KEYWORD_PARSING", "NO_FALLBACK"]),
  });
}
