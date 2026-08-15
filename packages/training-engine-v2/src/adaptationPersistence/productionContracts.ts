import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import { PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE } from "../outcomeSources/productionContracts";
import type { AdaptationApplicationOwner, AdaptationApplicationState,
  AdaptationDirectiveApplicationRequest } from "./designContracts";

export interface PersistedCompletedExposureLedgerRevision {
  readonly persistenceContractReference: typeof PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE;
  readonly ledgerId: string;
  readonly ledgerRevisionId: string;
  readonly basedOnLedgerRevisionId: string | null;
  readonly athleteId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly entryIds: readonly string[];
  readonly payload: Readonly<Record<string, unknown>>;
  readonly evaluatedAt: string;
  readonly provenance: readonly string[];
}

export interface PersistedLongitudinalStateRevision {
  readonly persistenceContractReference: typeof PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE;
  readonly stateId: string;
  readonly stateRevisionId: string;
  readonly basedOnStateRevisionId: string | null;
  readonly decisionAttemptId: string;
  readonly athleteId: string;
  readonly targetId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly programSnapshotRevisionId: string;
  readonly phaseResultRevisionId: string;
  readonly evidenceWindowId: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly state: string;
  readonly finalForDecisionAttempt: boolean;
  readonly evaluatedAt: string;
  readonly provenance: readonly string[];
}

export interface PersistedLongitudinalDecisionRevision {
  readonly persistenceContractReference: typeof PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly basedOnDecisionRevisionId: string | null;
  readonly decisionAttemptId: string;
  readonly stateRevisionId: string;
  readonly athleteId: string;
  readonly targetId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly programSnapshotRevisionId: string;
  readonly phaseResultRevisionId: string;
  readonly evidenceWindowId: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly action: string;
  readonly applicationOwner: AdaptationApplicationOwner;
  readonly authorizationState: "authorized" | "restricted" | "revoked" | "pending" | "unknown";
  readonly applicationState: Exclude<AdaptationApplicationState, "applied">;
  readonly finalForDecisionAttempt: boolean;
  readonly evaluatedAt: string;
  readonly provenance: readonly string[];
}

export interface PersistedActionDirective {
  readonly persistenceContractReference: typeof PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE;
  readonly directiveId: string;
  readonly directiveRevisionId: string;
  readonly basedOnDirectiveRevisionId: string | null;
  readonly decisionId: string;
  readonly decisionRevisionId: string;
  readonly athleteId: string;
  readonly targetId: string;
  readonly targetScope: string;
  readonly sourceSnapshotRevisionId: string;
  readonly programSnapshotRevisionId: string;
  readonly action: string;
  readonly requestedDimensions: readonly string[];
  readonly applicationOwner: AdaptationApplicationOwner;
  readonly applicationState: Exclude<AdaptationApplicationState, "applied">;
  readonly createdAt: string;
  readonly provenance: readonly string[];
}

export interface PersistedAdaptationApplicationAttempt {
  readonly persistenceContractReference: typeof PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE;
  readonly attemptId: string;
  readonly requestId: string;
  readonly athleteId: string;
  readonly principalId: string;
  readonly directiveRevisionId: string;
  readonly rightfulOwner: AdaptationApplicationOwner;
  readonly preconditionResult: Readonly<Record<string, unknown>>;
  readonly confirmationState: "required" | "confirmed" | "not_required" | "unknown";
  readonly result: Exclude<AdaptationApplicationState, "applied">;
  readonly beforeReferences: readonly string[];
  readonly afterReferences: readonly string[];
  readonly rollbackReference: string | null;
  readonly attemptedAt: string;
  readonly provenance: readonly string[];
}

export interface ProductionAdaptationDecisionBundle {
  readonly completedLedger: PersistedCompletedExposureLedgerRevision;
  readonly state: PersistedLongitudinalStateRevision;
  readonly decision: PersistedLongitudinalDecisionRevision;
  readonly directive: PersistedActionDirective | null;
}

export function validateProductionAdaptationDecisionBundle(
  bundle: ProductionAdaptationDecisionBundle,
): readonly string[] {
  const reasons: string[] = [];
  const records = [bundle.completedLedger, bundle.state, bundle.decision, bundle.directive].filter(Boolean) as
    readonly { readonly athleteId: string; readonly sourceSnapshotRevisionId: string }[];
  if (records.some((record) => record.athleteId !== bundle.decision.athleteId)) reasons.push("ADAPTATION_PERSISTENCE_ATHLETE_MISMATCH");
  if (records.some((record) => record.sourceSnapshotRevisionId !== bundle.decision.sourceSnapshotRevisionId)) {
    reasons.push("ADAPTATION_PERSISTENCE_SOURCE_SNAPSHOT_MISMATCH");
  }
  if (bundle.state.decisionAttemptId !== bundle.decision.decisionAttemptId ||
      bundle.decision.stateRevisionId !== bundle.state.stateRevisionId) reasons.push("ADAPTATION_PERSISTENCE_DECISION_LINEAGE_INVALID");
  if (bundle.directive && (bundle.directive.decisionId !== bundle.decision.decisionId ||
      bundle.directive.decisionRevisionId !== bundle.decision.decisionRevisionId)) {
    reasons.push("ADAPTATION_PERSISTENCE_DIRECTIVE_LINEAGE_INVALID");
  }
  if ([bundle.completedLedger.evaluatedAt, bundle.state.evaluatedAt, bundle.decision.evaluatedAt,
    bundle.directive?.createdAt].filter(Boolean).some((value) => !explicitIsoTime(value!))) {
    reasons.push("ADAPTATION_PERSISTENCE_TIME_INVALID");
  }
  if (bundle.decision.applicationState === ("applied" as AdaptationApplicationState) ||
      bundle.directive?.applicationState === ("applied" as AdaptationApplicationState)) {
    reasons.push("ADAPTATION_APPLICATION_NOT_AUTHORIZED");
  }
  return uniqueSorted(reasons);
}

export function derivePersistedApplicationRequestRevisionId(request: AdaptationDirectiveApplicationRequest): string {
  return stableId("persisted-adaptation-application-request", request);
}

export function validatePersistedAdaptationApplicationAttempt(
  attempt: PersistedAdaptationApplicationAttempt,
): readonly string[] {
  const reasons: string[] = [];
  if (!attempt.attemptId.trim() || !attempt.requestId.trim() || !attempt.athleteId.trim() ||
      !attempt.principalId.trim() || !attempt.directiveRevisionId.trim()) reasons.push("APPLICATION_ATTEMPT_LINEAGE_REQUIRED");
  if (!explicitIsoTime(attempt.attemptedAt)) reasons.push("APPLICATION_ATTEMPT_TIME_INVALID");
  if (attempt.result === ("applied" as AdaptationApplicationState)) reasons.push("ADAPTATION_APPLICATION_NOT_AUTHORIZED");
  return uniqueSorted(reasons);
}
