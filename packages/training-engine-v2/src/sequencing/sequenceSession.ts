import {
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
} from "../prescription/compiler/contracts";
import { buildProductionSequencingAssignmentFacts } from "./assignmentFacts";
import { buildFinalSessionSequenceCompatibilityProjection } from "./compatibilityProjection";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  type FinalSequencingDecisionTrace,
  type FinalSessionSequencingValidationFinding,
  type ProductionFinalSessionSequencePlan,
  type ProductionFinalSessionSequencingInput,
  type ProductionFinalSessionSequencingResult,
  type ProductionFinalSessionSequencingStatus,
  type ProductionSequencedAssignmentStep,
  type ProductionSequencedSectionBoundary,
  type ProductionSequencingTransitionFact,
} from "./contracts";
import { buildProductionSequencingDependencyGraph } from "./dependencyGraph";
import { buildSequencedSessionDurationInterval } from "./durationInterval";
import { searchExactFinalSessionSequence } from "./exactSearch";
import { buildFinalSessionSequencePlanId } from "./planIdentity";
import { buildProductionFinalSequenceRevision } from "./planRevisions";
import {
  PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE,
  resolveFinalSessionSequencingPolicy,
} from "./policies";
import { resolveFinalSequencingSearchResourcePolicy } from "./searchPolicyResolution";
import {
  buildProductionSequencingTransitionFacts,
  resolveProductionSequencingTransitionInstructions,
} from "./transitionFacts";
import { validateFinalSessionSequencingInput } from "./validateInput";
import {
  deriveFinalSequencingIntegrityTrace,
  validateFinalSessionSequencePlan,
} from "./validation";

function emptyDecisionTrace(): FinalSequencingDecisionTrace {
  return {
    inputValidation: [],
    contractVersion: [],
    policyResolution: [],
    searchPolicyResolution: [],
    assignmentMapping: [],
    sourceEventPreservation: [],
    revisionPreservation: [],
    blockAtomicity: [],
    dependency: [],
    section: [],
    dominantPurpose: [],
    plannerPriority: [],
    warmupActivation: [],
    mainAccessory: [],
    interference: [],
    setupTransition: [],
    transitionFact: [],
    duration: [],
    unresolvedRequirement: [],
    search: [],
    compatibility: [],
    finalReasonCodes: [],
  };
}

function withTrace(
  trace: FinalSequencingDecisionTrace,
  changes: Partial<FinalSequencingDecisionTrace>,
): FinalSequencingDecisionTrace {
  return { ...trace, ...changes };
}

function result(input: {
  readonly status: ProductionFinalSessionSequencingStatus;
  readonly sequencePlanId: string;
  readonly policyRef: ProductionFinalSessionSequencingResult["policyRef"];
  readonly sequenceRevisionId?: string | null;
  readonly plan?: ProductionFinalSessionSequencePlan | null;
  readonly diagnosticBestOrder?: ProductionFinalSessionSequencingResult["diagnosticBestOrder"];
  readonly findings?: readonly FinalSessionSequencingValidationFinding[];
  readonly trace: FinalSequencingDecisionTrace;
}): ProductionFinalSessionSequencingResult {
  return {
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    status: input.status,
    policyRef: input.policyRef,
    sequencePlanId: input.sequencePlanId,
    sequenceRevisionId: input.sequenceRevisionId ?? null,
    plan: input.plan ?? null,
    diagnosticBestOrder: input.diagnosticBestOrder ?? null,
    findings: input.findings ?? [],
    decisionTrace: input.trace,
    authority: "PRODUCTION_KERNEL_AUTHORITY",
    productionActivationStatus: "NOT_ACTIVATED",
  };
}

function failure(input: {
  readonly status: ProductionFinalSessionSequencingStatus;
  readonly sequencePlanId: string;
  readonly policyRef: ProductionFinalSessionSequencingResult["policyRef"];
  readonly reasons: readonly string[];
  readonly trace: FinalSequencingDecisionTrace;
  readonly findings?: readonly FinalSessionSequencingValidationFinding[];
  readonly diagnosticBestOrder?: ProductionFinalSessionSequencingResult["diagnosticBestOrder"];
}): ProductionFinalSessionSequencingResult {
  return result({
    status: input.status,
    sequencePlanId: input.sequencePlanId,
    policyRef: input.policyRef,
    findings: input.findings,
    diagnosticBestOrder: input.diagnosticBestOrder,
    trace: withTrace(input.trace, { finalReasonCodes: input.reasons }),
  });
}

function sectionBoundaries(input: {
  readonly steps: readonly ProductionSequencedAssignmentStep[];
  readonly transitions: readonly ProductionSequencingTransitionFact[];
}): readonly ProductionSequencedSectionBoundary[] {
  const transitionByPair = new Map(input.transitions.map((transition) => [
    `${transition.fromAssignmentId}\u0000${transition.toAssignmentId}`,
    transition,
  ]));
  return PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE.map((section) => {
    const positions = input.steps.filter((step) => step.section === section).map((step) => step.sequenceIndex);
    if (positions.length === 0) {
      return {
        section,
        empty: true,
        firstStepIndex: null,
        lastStepIndex: null,
        priorAssignmentId: null,
        nextAssignmentId: null,
        transitionFactId: null,
        unknownDurationComponents: [],
        reasonCode: "SECTION_EXPLICITLY_EMPTY",
      };
    }
    const firstStepIndex = positions[0];
    const lastStepIndex = positions[positions.length - 1];
    const prior = input.steps[firstStepIndex - 1] ?? null;
    const next = input.steps[lastStepIndex + 1] ?? null;
    const boundaryTransition = prior
      ? transitionByPair.get(`${prior.assignmentId}\u0000${input.steps[firstStepIndex].assignmentId}`) ?? null
      : null;
    return {
      section,
      empty: false,
      firstStepIndex,
      lastStepIndex,
      priorAssignmentId: prior?.assignmentId ?? null,
      nextAssignmentId: next?.assignmentId ?? null,
      transitionFactId: boundaryTransition?.transitionFactId ?? null,
      unknownDurationComponents: boundaryTransition?.unknownTimingComponents ?? [],
      reasonCode: "SECTION_BOUNDARY_DERIVED_FROM_ORDERED_ASSIGNMENTS",
    };
  });
}

export function sequenceFinalSession(
  input: ProductionFinalSessionSequencingInput,
): ProductionFinalSessionSequencingResult {
  const planIdentityContract = input.sequencingContract?.contractId ===
      PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId &&
    input.sequencingContract?.contractVersion ===
      PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
    ? input.sequencingContract
    : PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE;
  const sequencePlanId = buildFinalSessionSequencePlanId({
    sequencingContract: planIdentityContract,
    sessionIntentId: input.intent?.id ?? "invalid-session-intent",
    executionAttemptId: input.executionAttemptId ?? "invalid-execution-attempt",
  });
  let trace = emptyDecisionTrace();
  if (
    input.sequencingContract?.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId ||
    input.sequencingContract?.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
  ) return failure({
    status: "unsupported_sequencing_contract_version",
    sequencePlanId,
    policyRef: null,
    reasons: ["UNSUPPORTED_SEQUENCING_CONTRACT_VERSION"],
    trace,
  });
  trace = withTrace(trace, {
    contractVersion: [`SEQUENCING_CONTRACT_SUPPORTED:${input.sequencingContract.contractId}@${input.sequencingContract.contractVersion}`],
  });
  const compilerContracts = [
    input.prescriptionSession.compilerContract,
    ...input.prescriptionSession.assignmentResults.map((entry) => entry.compilerContract),
    ...input.prescriptionSession.plans.map((entry) => entry.compilerContract),
  ];
  if (compilerContracts.some((contract) =>
    contract.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId ||
    contract.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion
  )) return failure({
    status: "unsupported_prescription_compiler_contract_version",
    sequencePlanId,
    policyRef: null,
    reasons: ["UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT_VERSION"],
    trace,
  });
  trace = withTrace(trace, {
    contractVersion: [
      ...trace.contractVersion,
      `PRESCRIPTION_COMPILER_CONTRACT_SUPPORTED:${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId}@${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion}`,
    ],
  });

  const policyResolution = resolveFinalSessionSequencingPolicy({
    policy: input.policy,
    availablePolicies: input.availablePolicies,
  });
  trace = withTrace(trace, { policyResolution: policyResolution.trace });
  if (!policyResolution.policy) return failure({
    status: policyResolution.status === "resolved" ? "sequencing_policy_unavailable" : policyResolution.status,
    sequencePlanId,
    policyRef: null,
    reasons: policyResolution.trace,
    trace,
  });
  const policyRef = {
    policyId: policyResolution.policy.policyId,
    version: policyResolution.policy.version,
  };
  const searchPolicyResolution = resolveFinalSequencingSearchResourcePolicy({
    policy: input.searchResourcePolicy,
    availablePolicies: input.availableSearchResourcePolicies,
  });
  trace = withTrace(trace, { searchPolicyResolution: searchPolicyResolution.trace });
  if (!searchPolicyResolution.policy) return failure({
    status: searchPolicyResolution.status === "resolved"
      ? "sequencing_search_policy_unavailable" : searchPolicyResolution.status,
    sequencePlanId,
    policyRef,
    reasons: searchPolicyResolution.trace,
    trace,
  });
  if (!input.trainingReadiness.downstreamTrainingAllowed) return failure({
    status: "blocked_by_training_readiness",
    sequencePlanId,
    policyRef,
    reasons: ["TRAINING_READINESS_BLOCKED", ...input.trainingReadiness.unresolvedSignalIds],
    trace,
  });

  const inputFindings = validateFinalSessionSequencingInput(input).filter((finding) =>
    !["UNSUPPORTED_SEQUENCING_CONTRACT_VERSION", "UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT_VERSION"]
      .includes(finding.code)
  );
  trace = withTrace(trace, { inputValidation: inputFindings.map((finding) => finding.code) });
  if (inputFindings.length > 0) {
    const handoffCodes = new Set([
      "INVALID_SESSION_HANDOFF",
      "SEQUENCING_HANDOFF_ASSIGNMENT_MISMATCH",
      "SEQUENCING_HANDOFF_DEPENDENCY_MISMATCH",
    ]);
    const cycle = inputFindings.some((finding) => finding.code === "ORDERING_DEPENDENCY_CYCLE");
    return failure({
      status: cycle ? "ordering_infeasible" :
        inputFindings.every((finding) => handoffCodes.has(finding.code))
          ? "invalid_session_handoff" : "invalid_session_input",
      sequencePlanId,
      policyRef,
      reasons: inputFindings.map((finding) => finding.code),
      findings: inputFindings,
      trace,
    });
  }
  if (
    input.prescriptionSession.status !== "compiled" ||
    input.prescriptionSession.assignmentResults.some((entry) => entry.plan === null || entry.status !== "compiled")
  ) return failure({
    status: "incomplete_due_to_unresolved_prescription",
    sequencePlanId,
    policyRef,
    reasons: [
      "PRESCRIPTION_SESSION_NOT_FULLY_COMPILED",
      ...input.prescriptionSession.completeSessionArgument.unresolvedRequirementIds,
    ],
    trace,
  });

  const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
  if (assignmentBuild.findings.length > 0 || assignmentBuild.facts.length !== input.skeleton.assignments.length) {
    return failure({
      status: "invalid_session_input",
      sequencePlanId,
      policyRef,
      reasons: assignmentBuild.findings.map((finding) => finding.code),
      findings: assignmentBuild.findings,
      trace,
    });
  }
  trace = withTrace(trace, {
    assignmentMapping: assignmentBuild.facts.map((fact) =>
      `ASSIGNMENT_IDENTITY_VALID:${fact.assignmentId}:${fact.sourceExposureEventId}:${fact.finalPrescriptionRevisionId}`
    ),
    sourceEventPreservation: assignmentBuild.facts.map((fact) =>
      `SOURCE_EVENT_PRESERVED:${fact.assignmentId}:${fact.sourceExposureEventId}`
    ),
    revisionPreservation: assignmentBuild.facts.map((fact) =>
      `PRESCRIPTION_REVISION_PRESERVED:${fact.assignmentId}:${fact.finalPrescriptionRevisionId}`
    ),
    blockAtomicity: assignmentBuild.facts.map((fact) =>
      `BLOCKS_ATOMIC:${fact.assignmentId}:${fact.orderedDoseBlockIds.join(",")}`
    ),
    dominantPurpose: assignmentBuild.facts.filter((fact) => fact.dominantPurposeRelationship === "dominant")
      .map((fact) => `DOMINANT_PURPOSE:${fact.assignmentId}`),
    plannerPriority: assignmentBuild.facts.flatMap((fact) => [
      `PLANNER_PRIORITY:${fact.assignmentId}:${fact.plannerPriorityOrders.join(",")}`,
      ...(fact.needPriorities.includes("required") ? [`REQUIRED_NEED:${fact.assignmentId}`] : []),
    ]),
  });
  if (assignmentBuild.facts.some((fact) => fact.executionReadiness === "unresolved")) {
    return failure({
      status: "incomplete_due_to_unresolved_prescription",
      sequencePlanId,
      policyRef,
      reasons: assignmentBuild.facts.flatMap((fact) => fact.unresolvedRequirementIds),
      trace,
    });
  }
  const graph = buildProductionSequencingDependencyGraph(assignmentBuild.facts);
  trace = withTrace(trace, {
    dependency: graph.findings.length === 0 ? ["DEPENDENCY_GRAPH_ACYCLIC"] : graph.findings.map((finding) => finding.code),
    section: ["SECTION_PRECEDENCE_HARD_AUTHORITY"],
  });
  if (!graph.acyclic || graph.findings.length > 0) return failure({
    status: "ordering_infeasible",
    sequencePlanId,
    policyRef,
    reasons: graph.findings.map((finding) => finding.code),
    findings: graph.findings,
    trace,
  });
  const transitionBuild = buildProductionSequencingTransitionFacts({
    sequencingInput: input,
    assignmentFacts: assignmentBuild.facts,
  });
  if (transitionBuild.findings.length > 0) {
    const conflict = transitionBuild.findings.some((finding) => finding.code === "SEQUENCING_TRANSITION_FACT_CONFLICT");
    return failure({
      status: conflict ? "transition_fact_conflict" : "invalid_session_input",
      sequencePlanId,
      policyRef,
      reasons: transitionBuild.findings.map((finding) => finding.code),
      findings: transitionBuild.findings,
      trace,
    });
  }
  const revisionBuild = buildProductionFinalSequenceRevision({
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    sequencePlanId,
    executionAttemptId: input.executionAttemptId,
    policyRef,
    assignments: assignmentBuild.facts,
    explicitTransitionFacts: input.explicitTransitionFacts,
    searchResourcePolicy: searchPolicyResolution.policy,
    evaluationTime: input.evaluationTime,
    revisionContext: input.revisionContext,
  });
  trace = withTrace(trace, { revisionPreservation: revisionBuild.errors });
  if (!revisionBuild.revision || !revisionBuild.ledger) return failure({
    status: "invalid_sequence_revision_context",
    sequencePlanId,
    policyRef,
    reasons: revisionBuild.errors,
    trace,
  });
  const search = searchExactFinalSessionSequence({
    facts: assignmentBuild.facts,
    graph,
    possibleTransitions: transitionBuild.facts,
    resourcePolicy: searchPolicyResolution.policy,
  });
  trace = withTrace(trace, {
    search: [
      `SEARCH_STATES_EXPANDED:${search.trace.statesExpanded}`,
      `SEARCH_COMPLETE_ORDERS:${search.trace.legalCompleteOrdersEvaluated}`,
      `SEARCH_OPTIMALITY_PROVEN:${search.trace.optimalityProven}`,
    ],
  });
  if (search.status !== "exact_optimal" || !search.order) return failure({
    status: search.status === "exact_optimal" ? "search_inconclusive" : search.status,
    sequencePlanId,
    policyRef,
    reasons: [search.status === "search_inconclusive" ? "RETURN_SEARCH_INCONCLUSIVE" : "NO_LEGAL_TOPOLOGICAL_ORDER"],
    diagnosticBestOrder: search.diagnosticBestOrder,
    trace,
  });

  const possibleTransitionByPair = new Map(transitionBuild.facts.map((transition) => [
    `${transition.fromAssignmentId}\u0000${transition.toAssignmentId}`,
    transition,
  ]));
  const consecutiveTransitions = search.order.slice(1).map((fact, index) =>
    possibleTransitionByPair.get(`${search.order![index].assignmentId}\u0000${fact.assignmentId}`)!
  );
  const transitionInstructions = consecutiveTransitions.flatMap((transition) =>
    resolveProductionSequencingTransitionInstructions({ sequencingInput: input, transition })
  );
  const duration = buildSequencedSessionDurationInterval({
    prescriptionLowerBoundSeconds: input.prescriptionSession.sessionDurationInterval.knownLowerBoundSeconds,
    prescriptionUpperBoundSeconds: input.prescriptionSession.sessionDurationInterval.knownUpperBoundSeconds,
    prescriptionUnknownComponents: input.prescriptionSession.sessionDurationInterval.unknownComponents,
    prescriptionIntervalRefs: assignmentBuild.facts.map((fact) => fact.finalPrescriptionRevisionId),
    transitionInstructions,
    availableMinutes: input.availableMinutes,
  });
  const steps: readonly ProductionSequencedAssignmentStep[] = search.order.map((fact, sequenceIndex) => ({
    sequenceIndex,
    assignmentId: fact.assignmentId,
    exerciseId: fact.exerciseId,
    section: fact.section,
    role: fact.role,
    sourceExposureEventId: fact.sourceExposureEventId,
    prescriptionId: fact.prescriptionId,
    finalPrescriptionRevisionId: fact.finalPrescriptionRevisionId,
    orderedDoseBlockIds: fact.orderedDoseBlockIds,
    satisfiedNeedIds: fact.satisfiedNeedIds,
    dependencyAssignmentIds: fact.dependencyAssignmentIds,
    executionReadiness: fact.executionReadiness,
    sideOrder: "SIDE_ORDER_NOT_PRESCRIBED",
    reasonCodes: [
      `SECTION_${fact.section.toUpperCase()}`,
      fact.dominantPurposeRelationship === "dominant"
        ? "DOMINANT_PURPOSE_PRESERVED" : "PLANNER_COMPOSER_PURPOSE_PRESERVED",
    ],
    provenance: fact.provenance,
  }));
  const unresolvedRequirementIds = [...new Set([
    ...assignmentBuild.facts.flatMap((fact) => fact.unresolvedRequirementIds),
    ...input.prescriptionSession.completeSessionArgument.unresolvedRequirementIds,
  ])].sort();
  const selectedAssignmentIds = new Set(steps.map((step) => step.assignmentId));
  const purposePreserved = assignmentBuild.facts
    .filter((fact) => fact.dominantPurposeRelationship === "dominant")
    .every((fact) => selectedAssignmentIds.has(fact.assignmentId));
  const supportingWorkPreserved = assignmentBuild.facts
    .filter((fact) => fact.section === "warmup" || fact.section === "activation")
    .every((fact) => selectedAssignmentIds.has(fact.assignmentId));
  const supportingWorkLossCount = assignmentBuild.facts
    .filter((fact) =>
      (fact.section === "warmup" || fact.section === "activation") &&
      !selectedAssignmentIds.has(fact.assignmentId)
    ).length;
  trace = withTrace(trace, {
    warmupActivation: steps.filter((step) => ["warmup", "activation"].includes(step.section))
      .map((step) => `ORDERED:${step.section}:${step.assignmentId}`),
    mainAccessory: steps.filter((step) => ["main", "accessory", "cooldown"].includes(step.section))
      .map((step) => `ORDERED:${step.section}:${step.assignmentId}`),
    interference: consecutiveTransitions.flatMap((transition) => transition.interferenceObservations)
      .filter((observation) => observation.classification !== "no_known_interference")
      .map((observation) => `${observation.classification}:${observation.observationId}`),
    setupTransition: consecutiveTransitions.map((transition) =>
      `${transition.setupRelationship}:${transition.transitionFactId}`
    ),
    transitionFact: transitionInstructions.map((instruction) =>
      `${instruction.type}:${instruction.target.kind}:${instruction.instructionId}`
    ),
    duration: [duration.status, ...duration.unknownComponents],
    unresolvedRequirement: unresolvedRequirementIds,
    revisionPreservation: [
      ...trace.revisionPreservation,
      `SEQUENCE_REVISION_CREATED:${revisionBuild.revision.sequenceRevisionId}`,
    ],
  });
  const boundaries = sectionBoundaries({ steps, transitions: consecutiveTransitions });
  const planCore: Omit<
    ProductionFinalSessionSequencePlan,
    "integrity" |
    "assignmentPreservationTrace" |
    "dependencyTrace" |
    "blockAtomicityTrace" |
    "purposePreservationTrace" |
    "supportingWorkTrace"
  > = {
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    policyRef,
    sequencePlanId,
    sequenceRevisionId: revisionBuild.revision.sequenceRevisionId,
    executionAttemptId: input.executionAttemptId,
    sessionIntentId: input.intent.id,
    status: "sequenced_exact_optimal",
    executable: true,
    steps,
    sectionBoundaries: boundaries,
    consecutiveTransitionFacts: consecutiveTransitions,
    transitionInstructions,
    sourceExposureEventIds: steps.map((step) => step.sourceExposureEventId),
    prescriptionIds: steps.map((step) => step.prescriptionId),
    finalPrescriptionRevisionIds: steps.map((step) => step.finalPrescriptionRevisionId),
    purposePreserved,
    supportingWorkPreserved,
    interferenceTrace: consecutiveTransitions.flatMap((transition) => transition.interferenceObservations),
    setupTransitionTrace: consecutiveTransitions.map((transition) =>
      `${transition.setupRelationship}:${transition.transitionFactId}`
    ),
    unresolvedRequirementIds,
    duration,
    search: search.trace,
    decisionTrace: trace,
    compatibilityProjection: buildFinalSessionSequenceCompatibilityProjection({
      steps,
      transitions: consecutiveTransitions,
      duration,
    }),
    revisionLedger: revisionBuild.ledger,
    provenance: [
      { source: "policy", sourceRef: `${policyRef.policyId}@${policyRef.version}` },
      { source: "prescription_contract", sourceRef: sequencePlanId },
    ],
  };
  const integrity = deriveFinalSequencingIntegrityTrace({
    sequencingInput: input,
    assignmentFacts: assignmentBuild.facts,
    plan: planCore,
  });
  trace = withTrace(trace, {
    blockAtomicity: [
      ...trace.blockAtomicity,
      ...Object.entries(integrity).map(([key, value]) => `${key}:${value}`),
    ],
    compatibility: ["NONCANONICAL_COMPATIBILITY_PROJECTION_CREATED", "SEQUENTIAL_EXECUTION", "PAIRING_FALSE"],
    finalReasonCodes: ["SEQUENCED_EXACT_OPTIMAL", "PRODUCTION_KERNEL_NOT_ACTIVATED"],
  });
  const plan: ProductionFinalSessionSequencePlan = {
    ...planCore,
    integrity,
    assignmentPreservationTrace: {
      expectedAssignmentIds: assignmentBuild.facts.map((fact) => fact.assignmentId).sort(),
      orderedAssignmentIds: steps.map((step) => step.assignmentId),
      additionCount: integrity.assignmentAdditionCount,
      removalCount: integrity.assignmentRemovalCount,
      duplicateCount: integrity.duplicateAssignmentCount,
    },
    dependencyTrace: {
      dependenciesByAssignmentId: Object.fromEntries(assignmentBuild.facts.map((fact) => [
        fact.assignmentId,
        fact.dependencyAssignmentIds,
      ])),
      violationCount: integrity.dependencyViolationCount,
    },
    blockAtomicityTrace: {
      orderedBlockIdsByAssignmentId: Object.fromEntries(steps.map((step) => [
        step.assignmentId,
        step.orderedDoseBlockIds,
      ])),
      reorderCount: integrity.blockReorderCount,
      interleavingCount: integrity.blockInterleavingCount,
    },
    purposePreservationTrace: {
      dominantAssignmentIds: assignmentBuild.facts
        .filter((fact) => fact.dominantPurposeRelationship === "dominant")
        .map((fact) => fact.assignmentId)
        .sort(),
      preserved: purposePreserved,
      lossCount: integrity.mainPurposeLossCount,
    },
    supportingWorkTrace: {
      supportingAssignmentIds: assignmentBuild.facts
        .filter((fact) => fact.section === "warmup" || fact.section === "activation")
        .map((fact) => fact.assignmentId)
        .sort(),
      preserved: supportingWorkPreserved,
      lossCount: supportingWorkLossCount,
    },
    decisionTrace: trace,
  };
  const planFindings = validateFinalSessionSequencePlan({
    sequencingInput: input,
    assignmentFacts: assignmentBuild.facts,
    plan,
  });
  if (planFindings.length > 0) return failure({
    status: "invalid_session_input",
    sequencePlanId,
    policyRef,
    reasons: planFindings.map((finding) => finding.code),
    findings: planFindings,
    trace,
  });
  return result({
    status: "sequenced_exact_optimal",
    sequencePlanId,
    sequenceRevisionId: revisionBuild.revision.sequenceRevisionId,
    policyRef,
    plan,
    trace,
  });
}
