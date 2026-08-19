import { productionLongitudinalApplicationOwner } from "../longitudinalAdaptation/actionCandidates";
import { validateProductionLongitudinalApplicationCandidate } from "../longitudinalAdaptation/applicationValidation";
import { sameSemanticValue, uniqueSorted } from "../prescription/compiler/utilities";
import { createProductionAdaptationDownstreamValidation, noChangeDownstreamValidation } from "./downstreamValidation";
import type { ProductionAdaptationApplicationOrchestrationInput,
  ProductionAdaptationApplicationOrchestrationResult, ProductionAdaptationApplicationOrchestrationRevision,
  ProductionAdaptationApplicationOrchestrationStatus, ProductionAdaptationApplicationOwnerResult } from "./contracts";
import { deriveProductionAdaptationApplicationOrchestrationId,
  deriveProductionAdaptationApplicationOrchestrationRevisionId } from "./identities";
import { localityTraceValid, validateProductionAdaptationApplicationLocality } from "./locality";
import type { ProductionAdaptationApplicationOrchestrationDependencies,
  ProductionAdaptationApplicationOwnerPortFamily } from "./ownerPorts";
import { resolveProductionAdaptationApplicationOwner,
  validateProductionAdaptationApplicationOwnerRegistry } from "./ownerRegistry";
import { ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1,
  ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1 } from "./policy";
import { evaluateProductionAdaptationApplicationPreconditions,
  validateProductionAdaptationApplicationOrchestrationRequest } from "./preconditions";
import { buildProductionAdaptationApplicationShadowCandidate } from "./shadowCandidate";
import { projectShadowCandidateForLongitudinalValidation,
  validateProductionAdaptationApplicationOwnerResult } from "./validation";

function preconditionStatus(state: ReturnType<typeof evaluateProductionAdaptationApplicationPreconditions>["state"]):
ProductionAdaptationApplicationOrchestrationStatus {
  if (state === "blocked_safety") return "blocked_safety";
  if (state === "blocked_conflict") return "blocked_conflict";
  if (state === "blocked_stale") return "blocked_stale";
  if (state === "directive_not_final") return "directive_invalid";
  if (state === "decision_not_final") return "decision_invalid";
  if (state === "target_inactive") return "target_inactive";
  if (state === "owner_unavailable") return "owner_unavailable";
  if (state === "pending_policy") return "pending_policy";
  if (state === "pending_confirmation") return "pending_confirmation";
  if (state === "idempotent_prior_result") return "idempotent_prior_result";
  return "invalid_orchestration_revision_context";
}

function revision(input: ProductionAdaptationApplicationOrchestrationInput,
  ownerResult: ProductionAdaptationApplicationOwnerResult | null,
  validationFingerprint: string | null,
  persistenceState: ProductionAdaptationApplicationOrchestrationRevision["persistenceState"] = "not_requested",
): ProductionAdaptationApplicationOrchestrationRevision {
  const request = input.request;
  const orchestrationId = deriveProductionAdaptationApplicationOrchestrationId({ requestId: request.requestId,
    directiveRevisionId: request.directiveRevisionId, rightfulOwner: request.requestedOwner,
    targetId: request.targetId, orchestrationAttemptId: request.orchestrationAttemptId });
  const values = { orchestrationId, ownerResultFingerprint: ownerResult?.ownerResultFingerprint ?? null,
    proposedProgramRevisionId: ownerResult?.proposedProgramSnapshot?.snapshotRevisionId ?? null,
    validationFingerprint, persistenceState, evaluationTime: request.evaluationTime,
    basedOnOrchestrationRevisionId: null };
  return Object.freeze({ ...values,
    orchestrationRevisionId: deriveProductionAdaptationApplicationOrchestrationRevisionId(values),
    finalForOrchestrationAttempt: true, requestId: request.requestId, requestRevisionId: request.requestRevisionId,
    owner: request.requestedOwner });
}

function stopped(input: ProductionAdaptationApplicationOrchestrationInput,
  preconditions: ReturnType<typeof evaluateProductionAdaptationApplicationPreconditions>,
  status: ProductionAdaptationApplicationOrchestrationStatus,
  reasons: readonly string[],
): ProductionAdaptationApplicationOrchestrationResult {
  return Object.freeze({ status, request: input.request, preconditions, ownerResult: null, shadowCandidate: null,
    longitudinalApplicationValidation: null, orchestrationRevision: revision(input, null, null),
    reasonCodes: Object.freeze(uniqueSorted(reasons)), primaryOwnerInvocationCount: 0,
    supportingOwnerInvocationCount: 0, applicationApplied: false, productMutationApplied: false,
    provenance: Object.freeze(["application-orchestration:fail-stop-unapplied"]) });
}

function ownerPendingStatus(result: ProductionAdaptationApplicationOwnerResult):
ProductionAdaptationApplicationOrchestrationStatus | null {
  if (result.status === "human_review_required") return "pending_human_review";
  if (["prescription_policy_required", "prescription_policy_conflict", "week_reallocation_policy_required",
    "week_deload_policy_required"].includes(result.status)) return "pending_policy";
  if (result.status === "external_safety_review_required" || result.status === "week_reallocation_blocked") {
    return "blocked_safety";
  }
  if (["prescription_resolution_required", "axis_not_realizable", "candidate_review_required",
    "no_legal_equivalent_candidate", "composer_infeasible", "search_inconclusive"].includes(result.status)) {
    return "pending_human_review";
  }
  if (result.status === "current_prescription_stale") return "blocked_stale";
  if (result.status === "target_inactive") return "target_inactive";
  if (result.status === "owner_input_invalid") return "owner_result_invalid";
  return null;
}

function findPort(dependencies: ProductionAdaptationApplicationOrchestrationDependencies,
  owner: string, action: string): ProductionAdaptationApplicationOwnerPortFamily | null {
  const matches = dependencies.ownerPorts.filter((port) => port.owner === owner &&
    port.supportedActions.includes(action as never));
  return matches.length === 1 ? matches[0]! : null;
}

export async function orchestrateProductionAdaptationApplication(
  input: ProductionAdaptationApplicationOrchestrationInput,
  dependencies: ProductionAdaptationApplicationOrchestrationDependencies,
): Promise<ProductionAdaptationApplicationOrchestrationResult> {
  const requestReasons = [...validateProductionAdaptationApplicationOrchestrationRequest(input.request),
    ...validateProductionAdaptationApplicationOwnerRegistry(dependencies.ownerRegistry)];
  if (!sameSemanticValue(dependencies.orchestrationPolicy.reference,
    ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1.reference)) {
    requestReasons.push("ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_UNAVAILABLE");
  }
  if (!sameSemanticValue(dependencies.confirmationPolicy.reference,
    ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1.reference)) {
    requestReasons.push("ADAPTATION_APPLICATION_CONFIRMATION_POLICY_UNAVAILABLE");
  }
  if (input.directive.directiveId !== input.request.directiveId || input.directive.decisionId !==
      input.request.longitudinalDecisionId || input.directive.decisionRevisionId !==
      input.request.longitudinalDecisionRevisionId || input.directive.targetId !== input.request.targetId) {
    requestReasons.push("ADAPTATION_APPLICATION_DIRECTIVE_REQUEST_LINEAGE_MISMATCH");
  }
  const rightfulOwner = productionLongitudinalApplicationOwner(input.directive.action);
  const route = resolveProductionAdaptationApplicationOwner(dependencies.ownerRegistry, input.directive.action);
  requestReasons.push(...route.reasonCodes);
  if (rightfulOwner !== input.directive.downstreamApplicationOwner || rightfulOwner !== input.request.requestedOwner ||
      route.entry?.owner !== rightfulOwner) requestReasons.push("ADAPTATION_APPLICATION_WRONG_OWNER");
  if (route.entry && !sameSemanticValue(route.entry.ownerContract, input.request.ownerPortReference)) {
    requestReasons.push("ADAPTATION_APPLICATION_OWNER_VERSION_UNAVAILABLE");
  }
  const port = findPort(dependencies, input.request.requestedOwner, input.directive.action);
  if (!port) requestReasons.push("ADAPTATION_APPLICATION_OWNER_PORT_REQUIRED");
  else if (!sameSemanticValue(port.contractReference, input.request.ownerPortReference)) {
    requestReasons.push("ADAPTATION_APPLICATION_OWNER_VERSION_UNAVAILABLE");
  }
  const safetyExemptSnapshot = input.directive.action === "external_safety_review" ?
    Object.freeze({ ...input.preconditionSnapshot, safetyAllowsMaterialOwnerCall: true }) : input.preconditionSnapshot;
  const preconditions = evaluateProductionAdaptationApplicationPreconditions({ request: input.request,
    snapshot: safetyExemptSnapshot, requestReasonCodes: uniqueSorted(requestReasons) });
  if (!preconditions.satisfied) {
    const unsupported = requestReasons.includes("UNSUPPORTED_ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_VERSION");
    return stopped(input, preconditions, unsupported ? "unsupported_orchestration_contract" :
      preconditionStatus(preconditions.state), preconditions.reasonCodes);
  }
  if (input.request.mode === "validate_only") return stopped(input, preconditions,
    "downstream_rebuild_required", ["VALIDATE_ONLY_COMPLETED_WITHOUT_OWNER_INVOCATION"]);
  const ownerResult = await port!.invoke({ input, explicitOwnerPolicyReferences:
    dependencies.explicitOwnerPolicyReferences, ownerInput: dependencies.ownerInputs[input.request.requestedOwner] ?? {} });
  const ownerReasons = validateProductionAdaptationApplicationOwnerResult({ orchestrationInput: input,
    ownerResult, port: port! });
  if (ownerReasons.length) {
    return Object.freeze({ ...stopped(input, preconditions, "owner_result_invalid", ownerReasons), ownerResult,
      orchestrationRevision: revision(input, ownerResult, null), primaryOwnerInvocationCount: 1 as const });
  }

  let supportingOwnerInvocationCount = 0;
  let proposedProgram = ownerResult.proposedProgramSnapshot;
  const proposedWeekPlan = ownerResult.proposedWeekPlan;
  let rebuildIncomplete = false;
  if (!proposedProgram && ownerResult.changedTargetIds.length && ownerResult.owner !== "week") {
    if (!dependencies.affectedSessionRebuildPort) rebuildIncomplete = true;
    else {
      const rebuilt = await dependencies.affectedSessionRebuildPort.rebuild({ orchestrationInput: input,
        ownerResult, evaluationTime: input.request.evaluationTime });
      supportingOwnerInvocationCount += 1;
      proposedProgram = rebuilt.proposedProgramSnapshot;
      rebuildIncomplete = rebuilt.status !== "rebuilt" || proposedProgram === null;
    }
  }
  if (ownerResult.owner === "week" && proposedWeekPlan && !proposedProgram) {
    if (!dependencies.weekPlanProgramRebuildPort) rebuildIncomplete = true;
    else {
      const rebuilt = await dependencies.weekPlanProgramRebuildPort.rebuild({ orchestrationInput: input,
        revisedWeekPlan: proposedWeekPlan, evaluationTime: input.request.evaluationTime });
      supportingOwnerInvocationCount += 1;
      proposedProgram = rebuilt.proposedProgramSnapshot;
      rebuildIncomplete = rebuilt.status !== "rebuilt" || proposedProgram === null;
    }
  }

  const noChange = ownerResult.changedTargetIds.length === 0 && ownerResult.changedDimensions.length === 0 &&
    !ownerResult.weekReallocationClaimed && !ownerResult.phaseReviewClaimed;
  let downstream = noChange ? noChangeDownstreamValidation() :
    createProductionAdaptationDownstreamValidation({ status: rebuildIncomplete ? "incomplete" : "failed",
      gate13Status: rebuildIncomplete ? "incomplete" : "failed", prescriptionValid: null, sequencingValid: null,
      weekValid: null, phaseSnapshotValid: null,
      reasonCodes: [rebuildIncomplete ? "DOWNSTREAM_REBUILD_REQUIRED" : "DOWNSTREAM_VALIDATION_PORT_REQUIRED"] });
  if (!rebuildIncomplete && dependencies.downstreamValidationPort &&
      (proposedProgram !== null || ownerResult.phaseReviewClaimed)) {
    downstream = await dependencies.downstreamValidationPort.validate({ orchestrationInput: input, ownerResult,
      proposedProgramSnapshot: proposedProgram, proposedWeekPlan, evaluationTime: input.request.evaluationTime });
    supportingOwnerInvocationCount += 1;
  }
  const locality = dependencies.localityValidationPort ? dependencies.localityValidationPort.validate({
    orchestrationInput: input, ownerResult, proposedProgramSnapshot: proposedProgram, proposedWeekPlan }) :
    validateProductionAdaptationApplicationLocality({ orchestrationInput: input, ownerResult,
      proposedProgramSnapshot: proposedProgram, proposedWeekPlan });
  const complete = downstream.status === "validated" || downstream.status === "not_required";
  const longitudinalCandidate = projectShadowCandidateForLongitudinalValidation({ orchestrationInput: input,
    ownerResult: Object.freeze({ ...ownerResult, proposedProgramSnapshot: proposedProgram }),
    proposedProgramSnapshot: proposedProgram, completeForValidation: complete });
  const longitudinalValidation = validateProductionLongitudinalApplicationCandidate(longitudinalCandidate);
  const shadowCandidate = buildProductionAdaptationApplicationShadowCandidate({ orchestrationInput: input,
    ownerResult: Object.freeze({ ...ownerResult, proposedProgramSnapshot: proposedProgram }), proposedProgramSnapshot:
      proposedProgram, proposedWeekPlan, downstreamValidation: downstream, localityTrace: locality });
  const pending = ownerPendingStatus(ownerResult);
  let status: ProductionAdaptationApplicationOrchestrationStatus = pending ?? (noChange ?
    "no_change_shadow_validated" : "shadow_candidate_validated");
  const reasons = [...ownerResult.reasonCodes, ...downstream.reasonCodes, ...locality.reasonCodes,
    ...longitudinalValidation.reasonCodes];
  if (!pending && rebuildIncomplete) status = "downstream_rebuild_required";
  else if (!pending && !complete) status = "downstream_validation_failed";
  else if (!pending && (!localityTraceValid(locality) ||
      !["valid_application_candidate", "valid_unapplied"].includes(longitudinalValidation.status))) {
    status = "application_scope_invalid";
  }
  return Object.freeze({ status, request: input.request, preconditions, ownerResult,
    shadowCandidate, longitudinalApplicationValidation: longitudinalValidation,
    orchestrationRevision: revision(input, ownerResult, downstream.validationFingerprint),
    reasonCodes: Object.freeze(uniqueSorted(reasons)), primaryOwnerInvocationCount: 1,
    supportingOwnerInvocationCount, applicationApplied: false, productMutationApplied: false,
    provenance: Object.freeze(["application-orchestration:explicit-unapplied-shadow-v1"]) });
}
