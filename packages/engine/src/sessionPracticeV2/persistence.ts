import {
  SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
  explicitIsoTime,
  stableId,
  type SessionPracticeAttemptLifecycle,
  type SessionPracticeCompletionDisposition,
  type SessionPracticeOutcomeSourceLink,
  type SessionPracticeRealizationPlan,
  type SessionPracticeRequest,
  type SessionPracticeV2Draft,
} from "@praxis/training-engine-v2";
import type {
  AppendSessionPracticeRevisionResult,
  PersistedSessionPracticeRevision,
  SessionPracticePersistenceRepository,
} from "./contracts";

export function sessionPracticePersistenceSemanticFingerprint(input: Omit<
  PersistedSessionPracticeRevision,
  "semanticFingerprint"
>): string {
  return stableId("session-practice-persistence-semantic", input);
}

export function buildPersistedSessionPracticeRevision(input: {
  readonly basedOnPersistenceRevisionId: string | null;
  readonly athleteId: string;
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly request: SessionPracticeRequest;
  readonly plan: SessionPracticeRealizationPlan;
  readonly completion: SessionPracticeCompletionDisposition | null;
  readonly outcomeLink: SessionPracticeOutcomeSourceLink | null;
  readonly draft: SessionPracticeV2Draft | null;
  readonly sourceFingerprint: string;
  readonly planFingerprint: string;
  readonly createdAt: string;
  readonly evaluationTime: string;
}): PersistedSessionPracticeRevision {
  if (!explicitIsoTime(input.createdAt) || !explicitIsoTime(input.evaluationTime)) {
    throw new Error("SESSION_PRACTICE_PERSISTENCE_EXPLICIT_TIME_REQUIRED");
  }
  if (input.athleteId !== input.request.athleteId || input.lifecycle.attemptId !== input.request.attemptId ||
      input.plan.attemptId !== input.request.attemptId || input.plan.requestId !== input.request.requestId ||
      input.plan.sourceSessionRevisionId !== input.lifecycle.sourceSessionRevisionId) {
    throw new Error("SESSION_PRACTICE_PERSISTENCE_LINEAGE_CONFLICT");
  }
  const persistenceRevisionId = stableId("session-practice-persistence-revision", {
    basedOnPersistenceRevisionId: input.basedOnPersistenceRevisionId,
    athleteId: input.athleteId,
    attemptId: input.lifecycle.attemptId,
    requestId: input.request.requestId,
    realizationRevisionId: input.plan.realizationRevisionId,
    lifecycleState: input.lifecycle.state,
    completionDispositionId: input.completion?.dispositionId ?? null,
    draftUpdatedAt: input.draft?.updatedAt ?? null,
    createdAt: input.createdAt,
  });
  const semantic = Object.freeze({
    persistenceContract: SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
    persistenceRevisionId,
    basedOnPersistenceRevisionId: input.basedOnPersistenceRevisionId,
    athleteId: input.athleteId,
    attemptId: input.lifecycle.attemptId,
    requestId: input.request.requestId,
    realizationRevisionId: input.plan.realizationRevisionId,
    sourceSessionRevisionId: input.plan.sourceSessionRevisionId,
    finalForExecutionRevisionId: input.lifecycle.finalForExecutionRevisionId,
    lifecycle: input.lifecycle,
    request: input.request,
    plan: input.plan,
    completion: input.completion,
    outcomeLink: input.outcomeLink,
    draft: input.draft,
    contractVersions: Object.freeze([
      `${input.plan.bridgeContractReference.contractId}@${input.plan.bridgeContractReference.contractVersion}`,
      `${input.request.contractReference.contractId}@${input.request.contractReference.contractVersion}`,
      `${SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE.contractId}@${SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE.contractVersion}`,
    ]),
    sourceFingerprint: input.sourceFingerprint,
    planFingerprint: input.planFingerprint,
    createdAt: input.createdAt,
    evaluationTime: input.evaluationTime,
    currentProductWriteApplied: false as const,
    productActivationApplied: false as const,
  });
  return Object.freeze({ ...semantic, semanticFingerprint: sessionPracticePersistenceSemanticFingerprint(semantic) });
}

export function validatePersistedSessionPracticeRevision(
  revision: PersistedSessionPracticeRevision,
): readonly string[] {
  const reasons: string[] = [];
  if (revision.persistenceContract.contractId !== SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE.contractId ||
      revision.persistenceContract.contractVersion !== SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_SESSION_PRACTICE_PERSISTENCE_VERSION");
  }
  if (!explicitIsoTime(revision.createdAt) || !explicitIsoTime(revision.evaluationTime)) {
    reasons.push("SESSION_PRACTICE_PERSISTENCE_TIME_INVALID");
  }
  if (revision.currentProductWriteApplied || revision.productActivationApplied) {
    reasons.push("SESSION_PRACTICE_PRODUCT_WRITE_REJECTED");
  }
  if (revision.athleteId !== revision.request.athleteId || revision.attemptId !== revision.request.attemptId ||
      revision.attemptId !== revision.plan.attemptId || revision.requestId !== revision.plan.requestId ||
      revision.realizationRevisionId !== revision.plan.realizationRevisionId ||
      revision.sourceSessionRevisionId !== revision.plan.sourceSessionRevisionId) {
    reasons.push("SESSION_PRACTICE_PERSISTENCE_LINEAGE_CONFLICT");
  }
  const { semanticFingerprint, ...semantic } = revision;
  if (sessionPracticePersistenceSemanticFingerprint(semantic) !== semanticFingerprint) {
    reasons.push("SESSION_PRACTICE_PERSISTENCE_FINGERPRINT_INVALID");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function createInMemorySessionPracticePersistenceRepository(): SessionPracticePersistenceRepository {
  const records = new Map<string, PersistedSessionPracticeRevision>();
  const key = (athleteId: string, attemptId: string, revisionId: string) =>
    `${athleteId}:${attemptId}:${revisionId}`;
  const repository: SessionPracticePersistenceRepository = {
    appendRevision: async (revision): Promise<AppendSessionPracticeRevisionResult> => {
      const reasons = validatePersistedSessionPracticeRevision(revision);
      if (reasons.length) throw new Error(reasons.join(","));
      const recordKey = key(revision.athleteId, revision.attemptId, revision.persistenceRevisionId);
      const prior = records.get(recordKey);
      if (prior) return Object.freeze({ status: prior.semanticFingerprint === revision.semanticFingerprint ?
        "exact_retry" : "idempotency_conflict", persistenceRevisionId: revision.persistenceRevisionId,
      priorRevision: prior, mutationCount: 0, productWriteCount: 0 });
      if (revision.basedOnPersistenceRevisionId !== null &&
          !records.has(key(revision.athleteId, revision.attemptId, revision.basedOnPersistenceRevisionId))) {
        return Object.freeze({ status: "lineage_conflict", persistenceRevisionId: revision.persistenceRevisionId,
          priorRevision: null, mutationCount: 0, productWriteCount: 0 });
      }
      records.set(recordKey, revision);
      return Object.freeze({ status: "appended", persistenceRevisionId: revision.persistenceRevisionId,
        priorRevision: null, mutationCount: 0, productWriteCount: 0 });
    },
    readExactRevision: async (athleteId, attemptId, revisionId) =>
      records.get(key(athleteId, attemptId, revisionId)) ?? null,
    readAttemptRevisions: async (athleteId, attemptId) => Object.freeze([...records.values()]
      .filter((record) => record.athleteId === athleteId && record.attemptId === attemptId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt) ||
        left.persistenceRevisionId.localeCompare(right.persistenceRevisionId))),
  };
  return Object.freeze(repository);
}

export function buildSessionPracticeV2Draft(input: {
  readonly plan: SessionPracticeRealizationPlan;
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly currentPosition: SessionPracticeV2Draft["currentPosition"];
  readonly actualPerformanceState: Readonly<Record<string, unknown>>;
  readonly timers: SessionPracticeV2Draft["timers"];
  readonly substitutionReferences: readonly string[];
  readonly updatedAt: string;
}): SessionPracticeV2Draft {
  if (input.plan.status !== "realized" || !input.plan.finalForExecution || !input.plan.finalSequence ||
      input.lifecycle.finalForExecutionRevisionId !== input.plan.realizationRevisionId) {
    throw new Error("SESSION_PRACTICE_FINAL_FOR_EXECUTION_PLAN_REQUIRED_FOR_DRAFT");
  }
  if (!explicitIsoTime(input.updatedAt)) throw new Error("SESSION_PRACTICE_DRAFT_EXPLICIT_TIME_REQUIRED");
  return Object.freeze({
    contractReference: SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
    draftId: stableId("session-practice-v2-draft", {
      attemptId: input.plan.attemptId,
      realizationRevisionId: input.plan.realizationRevisionId,
    }),
    attemptId: input.plan.attemptId,
    selectedMode: input.plan.mode,
    requestId: input.plan.requestId,
    realizationRevisionId: input.plan.realizationRevisionId,
    finalForExecutionPlanReference: input.plan.finalSequence.sequenceRevisionId,
    sourceSessionRevisionId: input.plan.sourceSessionRevisionId,
    currentPosition: Object.freeze({ ...input.currentPosition }),
    actualPerformanceState: Object.freeze({ ...input.actualPerformanceState }),
    timers: Object.freeze(input.timers.map((timer) => Object.freeze({ ...timer }))),
    substitutionReferences: Object.freeze([...input.substitutionReferences]),
    updatedAt: input.updatedAt,
    attemptState: input.lifecycle.state,
  });
}
