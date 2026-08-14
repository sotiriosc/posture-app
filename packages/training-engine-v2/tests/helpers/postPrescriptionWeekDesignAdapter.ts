import { stableId } from "../../src/prescription/compiler/utilities";
import type { EvidenceProvenance } from "../../src/prescription/types";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  type ProductionPostPrescriptionWeekSessionBundle,
  type ProductionPostPrescriptionWeekValidationInput,
} from "../../src/weekValidation/contracts";
import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
} from "../../src/weekValidation/policies/postPrescriptionWeekValidationPolicyV1";
import {
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  type PrescribedWeekSourceSnapshot,
  type ProductionWeekObjectiveSnapshot,
  type ProductionWeekOpportunitySnapshot,
  type ProductionWeekReservationSnapshot,
} from "../../src/weekValidation/sourceContracts";
import type { WeekFactProvenance } from "../../src/weekComposer/designContracts";
import type { PostPrescriptionWeekValidationInput } from "../../src/weekValidation/designContracts";

export const POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_ID =
  "POST_PRESCRIPTION_WEEK_DESIGN_TO_PRODUCTION_SOURCE_ADAPTER" as const;
export const POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_VERSION = "1.0.0" as const;

export interface PostPrescriptionWeekDesignAdapterTrace {
  readonly adapterId: typeof POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_ID;
  readonly adapterVersion: typeof POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_VERSION;
  readonly sourceContract: string;
  readonly mappedObjectiveCount: number;
  readonly mappedReservationCount: number;
  readonly mappedOpportunityCount: number;
  readonly mappedSessionBundleCount: number;
  readonly createdObjectiveCount: 0;
  readonly createdReservationCount: 0;
  readonly defaultPolicySelectionCount: 0;
  readonly proseParseCount: 0;
  readonly reasonCodes: readonly string[];
}

export type PostPrescriptionWeekDesignAdapterResult =
  | {
      readonly status: "adapted";
      readonly productionInput: ProductionPostPrescriptionWeekValidationInput;
      readonly trace: PostPrescriptionWeekDesignAdapterTrace;
    }
  | {
      readonly status: "rejected";
      readonly productionInput: null;
      readonly trace: PostPrescriptionWeekDesignAdapterTrace;
    };

function provenance(value: WeekFactProvenance, field: string): EvidenceProvenance {
  return {
    source: value.sourceType === "non_production_fixture" ? "synthetic_contract_fixture" : "prescription_contract",
    sourceRef: value.sourceRef,
    notes: `compatibility-adapted:${field}:${value.truthState}:${value.reviewStatus}`,
  };
}

function opportunityState(value: string): ProductionWeekOpportunitySnapshot["availabilityState"] {
  if (value === "available" || value === "completed") return "available";
  if (value === "cancelled") return "unavailable";
  return "unknown";
}

function executionState(value: string): ProductionWeekOpportunitySnapshot["executionState"] {
  if (value === "completed") return "performed";
  if (value === "cancelled" || value === "missed") return "cancelled";
  if (value === "not_started") return "not_started";
  return "unknown";
}

function boundary(input: PostPrescriptionWeekValidationInput): PrescribedWeekSourceSnapshot["horizonBoundary"] {
  const value = input.planningHorizon.boundary;
  if (value.kind === "explicit_date_range") {
    return {
      startsAt: `${value.startDate}T00:00:00Z`,
      endsAt: `${value.endDate}T23:59:59Z`,
      timezone: input.planningHorizon.timezone ?? null,
    };
  }
  return { startsAt: null, endsAt: null, timezone: input.planningHorizon.timezone ?? null };
}

function objective(input: PostPrescriptionWeekValidationInput, index: number): ProductionWeekObjectiveSnapshot | null {
  const value = input.weeklyIntent.objectives[index];
  if (!value.frequencyIntent || value.sourceEvidence.length === 0) return null;
  return {
    objectiveId: value.id,
    purpose: value.purpose,
    target: value.selectionTarget,
    priority: value.priority,
    priorityOrder: value.priorityOrder,
    goalRelationships: value.goalRelationships,
    frequencyIntent: {
      minimumAllocatedSessions: value.frequencyIntent.minimumAllocatedSessions,
      targetAllocatedSessions: value.frequencyIntent.targetAllocatedSessions,
      softMaximumAllocatedSessions: value.frequencyIntent.softMaximumAllocatedSessions,
      sourceRef: value.frequencyIntent.sourceRef,
      provenance: [provenance(value.frequencyIntent.provenance, `objective:${value.id}:frequency`)],
    },
    supportedPolicyRef: input.weekPolicyRef,
    dosePolicyState: value.dosePolicyReference.state === "explicit_reviewed_target"
      ? "explicit_reviewed_target"
      : value.dosePolicyReference.state === "not_applicable"
        ? "not_applicable" : "prescribed_dose_target_not_defined",
    spacingState: "SPACING_R0_PRESCRIPTION_PENDING",
    sourceEvidenceRefs: value.sourceEvidence.flatMap((evidence) => evidence.evidenceRefs),
    provenance: value.sourceEvidence.map((evidence) => provenance(evidence.provenance, `objective:${value.id}`)),
  };
}

function reservation(value: PostPrescriptionWeekValidationInput["orderedReservations"][number]):
ProductionWeekReservationSnapshot {
  return {
    reservationId: value.id,
    opportunityId: value.opportunityId,
    allocatedObjectiveIds: value.allocatedObjectives.map((entry) => entry.weeklyObjectiveId),
    expectedSessionGoal: value.sessionOutcomeGoal,
    responsibilityEvidenceRefs: value.weeklyObjectiveSourceRefs,
    availabilityState: value.expectedAvailability.availableMinutes === null ? "unknown" : "available",
    executionState: value.status === "completed_immutable" ? "performed"
      : value.status === "cancelled_requires_reallocation" || value.status === "missed_requires_reallocation"
        ? "cancelled" : "not_started",
    invalidationState: value.status === "cancelled_requires_reallocation" ? "cancelled" : "active",
    provenance: [{
      source: "synthetic_contract_fixture",
      sourceRef: value.sourceTrace.sourceRefs[0] ?? `reservation:${value.id}`,
      notes: "compatibility-adapted:reservation",
    }],
  };
}

function sessionBundle(
  input: PostPrescriptionWeekValidationInput,
  artifact: PostPrescriptionWeekValidationInput["sessionArtifacts"][number],
): ProductionPostPrescriptionWeekSessionBundle | null {
  const reservationValue = input.orderedReservations.find((entry) => entry.id === artifact.reservationId);
  if (!reservationValue) return null;
  const executionAttemptId = artifact.sequencingResult?.plan?.executionAttemptId ??
    artifact.prescriptionCompilation?.plans[0]?.revisionLedger.executionAttemptId ?? null;
  if (!executionAttemptId || !artifact.sessionIntent.id || artifact.sessionSkeleton.sessionIntentId !== artifact.sessionIntent.id) {
    return null;
  }
  return {
    reservationId: reservationValue.id,
    opportunityId: reservationValue.opportunityId,
    sessionIntentId: artifact.sessionIntent.id,
    executionAttemptId,
    sessionIntent: artifact.sessionIntent,
    sessionSkeleton: artifact.sessionSkeleton,
    prescriptionCompilation: artifact.prescriptionCompilation,
    sequencingResult: artifact.sequencingResult,
    expectedArtifactState: reservationValue.status === "cancelled_requires_reallocation" ? "cancelled" : "expected",
    provenance: [{
      source: "synthetic_contract_fixture",
      sourceRef: `${POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_ID}:${artifact.reservationId}`,
    }],
  };
}

export function adaptPostPrescriptionWeekDesignInput(
  input: PostPrescriptionWeekValidationInput,
): PostPrescriptionWeekDesignAdapterResult {
  const reasons: string[] = [];
  const objectives = input.weeklyIntent.objectives.map((_, index) => objective(input, index));
  if (objectives.some((value) => value === null)) reasons.push("DESIGN_OBJECTIVE_IDENTITY_OR_PROVENANCE_REQUIRED");
  const normalizedObjectives = objectives.filter((value): value is ProductionWeekObjectiveSnapshot => value !== null);
  const reservations = input.orderedReservations.map(reservation);
  const opportunities: readonly ProductionWeekOpportunitySnapshot[] = input.planningHorizon.opportunities.map((value) => ({
    opportunityId: value.id,
    order: value.order,
    calendarDateTime: value.calendarDateRef ?? null,
    availableMinutes: value.expectedAvailability.availableMinutes,
    availabilityState: opportunityState(value.availabilityStatus),
    executionState: executionState(value.completionStatus),
    reservationIds: reservations.filter((entry) => entry.opportunityId === value.id).map((entry) => entry.reservationId),
    provenance: [provenance(value.provenance, `opportunity:${value.id}`)],
  }));
  const bundles = input.sessionArtifacts.map((artifact) => sessionBundle(input, artifact));
  if (bundles.some((value) => value === null)) reasons.push("DESIGN_SESSION_BUNDLE_IDENTITY_REQUIRED");
  const normalizedBundles = bundles.filter((value): value is ProductionPostPrescriptionWeekSessionBundle => value !== null);
  const allocationTraces = reservations.flatMap((reservationValue) => reservationValue.allocatedObjectiveIds.map((objectiveId) => {
    const bundle = normalizedBundles.find((entry) => entry.reservationId === reservationValue.reservationId);
    const sessionNeedIds = bundle?.sessionIntent?.needs.filter((need) =>
      need.plannerProvenance?.objectiveIds.includes(objectiveId)).map((need) => need.id) ?? [];
    const artifact = input.sessionArtifacts.find((entry) => entry.reservationId === reservationValue.reservationId);
    return {
      allocationTraceId: stableId("production-week-allocation-trace", {
        objectiveId,
        reservationId: reservationValue.reservationId,
        opportunityId: reservationValue.opportunityId,
        sessionNeedIds,
      }),
      objectiveId,
      reservationId: reservationValue.reservationId,
      opportunityId: reservationValue.opportunityId,
      sessionDirectiveId: artifact?.materializedDirective?.id ?? null,
      sessionNeedIds,
      sourceEvidenceRefs: reservationValue.responsibilityEvidenceRefs,
      provenance: reservationValue.provenance,
    };
  }));
  if (allocationTraces.some((trace) =>
    (normalizedBundles.some((bundle) => bundle.reservationId === trace.reservationId) && trace.sessionNeedIds.length === 0) ||
    trace.sourceEvidenceRefs.length === 0)) {
    reasons.push("DESIGN_OBJECTIVE_SESSION_NEED_TRACE_REQUIRED");
  }
  const snapshotBase = {
    sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
    sourceAuthority: "COMPATIBILITY_ADAPTER" as const,
    athleteId: input.athleteId,
    planningHorizonId: input.planningHorizon.id,
    weeklyIntentId: input.weeklyIntent.id,
    weekAllocationPlanId: stableId("week-allocation-plan", {
      weeklyIntentId: input.weekAllocationPlan.weeklyIntentId,
      reservationIds: reservations.map((entry) => entry.reservationId).sort(),
    }),
    horizonBoundary: boundary(input),
    opportunities,
    objectives: normalizedObjectives,
    reservations,
    allocationTraces,
    unsupportedScopes: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.unsupportedScopes,
    unresolvedPolicyRefs: sortedPolicyRefs(input),
    evaluationTime: input.evaluationTime,
    provenance: [{
      source: "synthetic_contract_fixture" as const,
      sourceRef: `${POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_ID}@${POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_VERSION}`,
    }],
  };
  const sourceSnapshotId = stableId("prescribed-week-source", {
    athleteId: snapshotBase.athleteId,
    planningHorizonId: snapshotBase.planningHorizonId,
    weeklyIntentId: snapshotBase.weeklyIntentId,
    weekAllocationPlanId: snapshotBase.weekAllocationPlanId,
  });
  const sourceSnapshotRevisionId = stableId("prescribed-week-source-revision", snapshotBase);
  const trace: PostPrescriptionWeekDesignAdapterTrace = {
    adapterId: POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_ID,
    adapterVersion: POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER_VERSION,
    sourceContract: `${PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE.contractId}@${PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE.contractVersion}`,
    mappedObjectiveCount: normalizedObjectives.length,
    mappedReservationCount: reservations.length,
    mappedOpportunityCount: opportunities.length,
    mappedSessionBundleCount: normalizedBundles.length,
    createdObjectiveCount: 0,
    createdReservationCount: 0,
    defaultPolicySelectionCount: 0,
    proseParseCount: 0,
    reasonCodes: [...new Set(reasons)].sort(),
  };
  if (reasons.length > 0) return { status: "rejected", productionInput: null, trace };
  const weekSource: PrescribedWeekSourceSnapshot = {
    ...snapshotBase,
    sourceSnapshotId,
    sourceSnapshotRevisionId,
  };
  return {
    status: "adapted",
    productionInput: {
      validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
      validationPolicy: input.validationPolicy === null
        ? null : POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
      weekSource,
      sessionBundles: normalizedBundles,
      exerciseRegistry: input.exerciseRegistry,
      evaluationTime: input.evaluationTime,
      upstreamGateState: "PASS",
      priorValidationRevisionContext: null,
    },
    trace,
  };
}

function sortedPolicyRefs(input: PostPrescriptionWeekValidationInput): readonly string[] {
  return [...new Set([
    ...input.weeklyIntent.policyReferences,
    ...input.weekAllocationPlan.unresolvedPrescriptionRequirements,
    ...input.weeklyIntent.objectives.flatMap((objective) => [
      objective.unresolvedPolicyState,
      ...objective.recoverySpacingRequirementRefs,
    ]),
  ])].sort();
}
