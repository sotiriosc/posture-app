import {
  deriveWeekPlanningHorizonId,
  deriveWeekPlanningHorizonRevisionId,
  deriveWeekSourceSnapshotId,
  deriveWeekSourceSnapshotRevisionId,
  explicitIsoTime,
  uniqueSorted,
  validateProductionWeekPlanningSourceSnapshot,
} from "./canonical";
import {
  PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
  type ProductionProfileWeekDefaults,
  type ProductionWeekPlanningBoundary,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeekProvenance,
  type ProductionWeekPlanningSourceAuthority,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeekUnresolvedContext,
} from "./contracts";

export interface BuildProductionWeekPlanningSourceSnapshotInput {
  readonly athleteId: string;
  readonly planningBoundary: ProductionWeekPlanningBoundary;
  readonly horizonLineageAttemptId: string;
  readonly opportunities: readonly ProductionWeekTrainingOpportunity[];
  readonly evaluationTime: string;
  readonly timezone?: string;
  readonly profileDefaults?: ProductionProfileWeekDefaults;
  readonly priorHorizonRevisionId?: string | null;
  readonly unresolvedContext: readonly ProductionWeekUnresolvedContext[];
  readonly sourceAuthority: ProductionWeekPlanningSourceAuthority;
  readonly provenance: ProductionWeekProvenance;
}

export type BuildProductionWeekPlanningSourceSnapshotResult =
  | { readonly status: "source_snapshot_built"; readonly snapshot: ProductionWeekPlanningSourceSnapshot; readonly reasonCodes: readonly string[] }
  | { readonly status: "invalid_source_snapshot" | "current_week_availability_required";
      readonly snapshot: null; readonly reasonCodes: readonly string[] };

const CONFIRMED_STATES = new Set(["user_confirmed", "coach_confirmed", "product_confirmed"]);

export function isConfirmedProductionTrainingOpportunity(opportunity: ProductionWeekTrainingOpportunity): boolean {
  return opportunity.availabilityStatus === "available" && opportunity.completionStatus === "not_started" &&
    CONFIRMED_STATES.has(opportunity.confirmationState);
}

export function buildProductionWeekPlanningSourceSnapshot(
  input: BuildProductionWeekPlanningSourceSnapshotInput,
): BuildProductionWeekPlanningSourceSnapshotResult {
  const basicReasons: string[] = [];
  if (!input.athleteId.trim() || !input.horizonLineageAttemptId.trim()) basicReasons.push("WEEK_SOURCE_ID_REQUIRED");
  if (!explicitIsoTime(input.evaluationTime)) basicReasons.push("WEEK_SOURCE_EVALUATION_TIME_INVALID");
  if (input.opportunities.length === 0) basicReasons.push("WEEK_SOURCE_OPPORTUNITIES_REQUIRED");
  if (basicReasons.length > 0) {
    return Object.freeze({ status: "invalid_source_snapshot", snapshot: null, reasonCodes: uniqueSorted(basicReasons) });
  }

  const ordered = Object.freeze([...input.opportunities]
    .sort((left, right) => left.order - right.order || left.opportunityId.localeCompare(right.opportunityId)));
  const horizonId = deriveWeekPlanningHorizonId({ athleteId: input.athleteId,
    boundary: input.planningBoundary, lineageAttemptId: input.horizonLineageAttemptId });
  const horizonRevisionId = deriveWeekPlanningHorizonRevisionId({
    horizonId,
    opportunities: ordered,
    unresolvedContextIds: input.unresolvedContext.map((entry) => entry.observationId),
    evaluationTime: input.evaluationTime,
    basedOnRevisionId: input.priorHorizonRevisionId ?? null,
  });
  const sourceSnapshotId = deriveWeekSourceSnapshotId({ athleteId: input.athleteId, planningHorizonId: horizonId });
  const base = {
    sourceContract: PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
    sourceSnapshotId,
    athleteId: input.athleteId,
    planningHorizonId: horizonId,
    horizonRevisionId,
    planningBoundary: input.planningBoundary,
    evaluationTime: input.evaluationTime,
    ...(input.timezone ? { timezone: input.timezone } : {}),
    opportunities: ordered,
    ...(input.profileDefaults ? { profileDefaults: input.profileDefaults } : {}),
    priorHorizonRevisionId: input.priorHorizonRevisionId ?? null,
    unresolvedContext: Object.freeze([...input.unresolvedContext]
      .sort((left, right) => left.observationId.localeCompare(right.observationId))),
    sourceAuthority: input.sourceAuthority,
  };
  const snapshot: ProductionWeekPlanningSourceSnapshot = Object.freeze({
    ...base,
    sourceSnapshotRevisionId: deriveWeekSourceSnapshotRevisionId(base),
    provenance: input.provenance,
  });
  const reasons = validateProductionWeekPlanningSourceSnapshot(snapshot);
  if (reasons.length > 0) return Object.freeze({ status: "invalid_source_snapshot", snapshot: null, reasonCodes: reasons });
  if (!snapshot.opportunities.some(isConfirmedProductionTrainingOpportunity)) {
    return Object.freeze({ status: "current_week_availability_required", snapshot: null,
      reasonCodes: Object.freeze(["CURRENT_WEEK_AVAILABILITY_REQUIRED"]) });
  }
  return Object.freeze({ status: "source_snapshot_built", snapshot, reasonCodes: Object.freeze([]) });
}

export function decideProductionOpportunityIdentity(input: {
  readonly previous: ProductionWeekTrainingOpportunity | null;
  readonly proposed: Omit<ProductionWeekTrainingOpportunity, "opportunityId" | "opportunityRevisionId">;
  readonly materiallyReplacedWindow: boolean;
  readonly nextOpportunityId: string;
}): { readonly opportunityId: string; readonly decision: "identity_retained" | "new_identity_required";
  readonly reason: "same_intended_window" | "material_window_change" | "cancelled_and_replaced" | "new_opportunity" } {
  if (input.previous === null) return Object.freeze({ opportunityId: input.nextOpportunityId,
    decision: "new_identity_required", reason: "new_opportunity" });
  if (input.materiallyReplacedWindow || input.previous.completionStatus === "cancelled") {
    return Object.freeze({ opportunityId: input.nextOpportunityId, decision: "new_identity_required",
      reason: input.previous.completionStatus === "cancelled" ? "cancelled_and_replaced" : "material_window_change" });
  }
  return Object.freeze({ opportunityId: input.previous.opportunityId, decision: "identity_retained", reason: "same_intended_window" });
}
