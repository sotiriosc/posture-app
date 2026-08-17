import {
  SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE,
  stableId,
} from "@praxis/training-engine-v2";
import type { PersistedSessionPracticeRevision, SessionPracticePersistenceRepository } from "./contracts";
import { validatePersistedSessionPracticeRevision } from "./persistence";

export interface SessionPracticeReplayResult {
  readonly status: "replayed_exact_version" | "revision_not_found" | "unsupported_version" | "invalid_revision";
  readonly revision: PersistedSessionPracticeRevision | null;
  readonly replayFingerprint: string | null;
  readonly latestFallbackApplied: false;
  readonly productWriteApplied: false;
  readonly reasonCodes: readonly string[];
}

export interface ResumeSessionPracticeV2DraftResult {
  readonly status: "resumed_exact_revision" | "stale_source_conflict" | "draft_unavailable" | "replay_failed";
  readonly revision: PersistedSessionPracticeRevision | null;
  readonly reasonCodes: readonly string[];
  readonly recomputedFromSource: false;
}

export async function resumeSessionPracticeV2Draft(input: {
  readonly repository: SessionPracticePersistenceRepository;
  readonly athleteId: string;
  readonly attemptId: string;
  readonly persistenceRevisionId: string;
  readonly currentSourceSessionRevisionId: string;
}): Promise<ResumeSessionPracticeV2DraftResult> {
  const replay = await replayExactSessionPracticeRevision({ repository: input.repository,
    athleteId: input.athleteId, attemptId: input.attemptId,
    persistenceRevisionId: input.persistenceRevisionId, expectedContractVersion: "1.0.0" });
  if (replay.status !== "replayed_exact_version" || !replay.revision) {
    return Object.freeze({ status: "replay_failed", revision: null,
      reasonCodes: replay.reasonCodes, recomputedFromSource: false });
  }
  if (!replay.revision.draft) return Object.freeze({ status: "draft_unavailable", revision: replay.revision,
    reasonCodes: Object.freeze(["SESSION_PRACTICE_V2_DRAFT_UNAVAILABLE"]), recomputedFromSource: false });
  if (replay.revision.sourceSessionRevisionId !== input.currentSourceSessionRevisionId) {
    return Object.freeze({ status: "stale_source_conflict", revision: replay.revision,
      reasonCodes: Object.freeze(["SESSION_PRACTICE_STALE_SOURCE_REVISION_REVIEW_REQUIRED"]),
      recomputedFromSource: false });
  }
  return Object.freeze({ status: "resumed_exact_revision", revision: replay.revision,
    reasonCodes: Object.freeze(["SESSION_PRACTICE_EXACT_DRAFT_RESTORED"]), recomputedFromSource: false });
}

export async function replayExactSessionPracticeRevision(input: {
  readonly repository: SessionPracticePersistenceRepository;
  readonly athleteId: string;
  readonly attemptId: string;
  readonly persistenceRevisionId: string;
  readonly expectedContractVersion: "1.0.0";
}): Promise<SessionPracticeReplayResult> {
  if (input.expectedContractVersion !== SESSION_PRACTICE_PERSISTENCE_CONTRACT_REFERENCE.contractVersion) {
    return Object.freeze({ status: "unsupported_version", revision: null, replayFingerprint: null,
      latestFallbackApplied: false, productWriteApplied: false,
      reasonCodes: Object.freeze(["UNSUPPORTED_SESSION_PRACTICE_REPLAY_VERSION"]) });
  }
  const revision = await input.repository.readExactRevision(input.athleteId, input.attemptId,
    input.persistenceRevisionId);
  if (!revision) return Object.freeze({ status: "revision_not_found", revision: null, replayFingerprint: null,
    latestFallbackApplied: false, productWriteApplied: false,
    reasonCodes: Object.freeze(["SESSION_PRACTICE_EXACT_REVISION_NOT_FOUND"]) });
  const reasons = validatePersistedSessionPracticeRevision(revision);
  if (reasons.length) return Object.freeze({ status: "invalid_revision", revision: null, replayFingerprint: null,
    latestFallbackApplied: false, productWriteApplied: false, reasonCodes: reasons });
  return Object.freeze({
    status: "replayed_exact_version",
    revision,
    replayFingerprint: stableId("session-practice-replay", {
      persistenceRevisionId: revision.persistenceRevisionId,
      semanticFingerprint: revision.semanticFingerprint,
      expectedContractVersion: input.expectedContractVersion,
    }),
    latestFallbackApplied: false,
    productWriteApplied: false,
    reasonCodes: Object.freeze(["SESSION_PRACTICE_EXACT_VERSION_REPLAYED"]),
  });
}
