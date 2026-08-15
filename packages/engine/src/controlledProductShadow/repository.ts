import type { ControlledProductShadowRepository, ControlledProductShadowRunRecord,
  ControlledProductShadowTrigger } from "./contracts";

export function createInMemoryControlledProductShadowRepository(): ControlledProductShadowRepository {
  const admissions = new Map<string, { readonly fingerprint: string;
    readonly trigger: ControlledProductShadowTrigger; readonly acceptedAt: string }>();
  const runs = new Map<string, ControlledProductShadowRunRecord>();
  const admissionKey = (athleteId: string, idempotencyKey: string) => `${athleteId}:${idempotencyKey}`;
  const repository: ControlledProductShadowRepository = {
    admitTrigger: async (trigger, fingerprint, policy, acceptedAt) => {
      const key = admissionKey(trigger.athleteId, trigger.idempotencyKey);
      const prior = admissions.get(key);
      if (prior) return Object.freeze({ state: prior.fingerprint === fingerprint ? "exact_retry" :
        "idempotency_conflict", prior: [...runs.values()].find((run) => run.trigger.triggerId ===
          prior.trigger.triggerId && run.trigger.athleteId === trigger.athleteId) ?? null });
      const cutoff = Date.parse(acceptedAt) - policy.windowSeconds * 1000;
      const recent = [...admissions.values()].filter((entry) => entry.trigger.athleteId === trigger.athleteId &&
        Date.parse(entry.acceptedAt) >= cutoff).length;
      const pending = [...admissions.values()].filter((entry) => entry.trigger.athleteId === trigger.athleteId &&
        ![...runs.values()].some((run) => run.trigger.triggerId === entry.trigger.triggerId)).length;
      if (recent >= policy.acceptedTriggersPerWindow ||
          pending >= Math.min(policy.concurrentRunsPerAthlete, policy.maximumPendingRuns)) {
        return Object.freeze({ state: "resource_limit", prior: null });
      }
      admissions.set(key, Object.freeze({ fingerprint, trigger, acceptedAt }));
      return Object.freeze({ state: "accepted", prior: null });
    },
    persistRun: async (record) => {
      if (record.runRevision.applicationApplied || record.runRevision.productMutationApplied ||
          record.runRevision.deliveredToUser || record.runRevision.performed) {
        throw new Error("CONTROLLED_PRODUCT_SHADOW_APPLIED_STATE_REJECTED");
      }
      if (!runs.has(record.runRevision.runRevisionId)) runs.set(record.runRevision.runRevisionId, record);
    },
    readRun: async (athleteId, runRevisionId) => {
      const run = runs.get(runRevisionId);
      return run?.trigger.athleteId === athleteId ? run : null;
    },
    readByTrigger: async (athleteId, triggerId) => [...runs.values()].find((run) =>
      run.trigger.athleteId === athleteId && run.trigger.triggerId === triggerId) ?? null,
    findLatestRun: async (athleteId, anchorProgramId) => [...runs.values()].filter((run) =>
      run.trigger.athleteId === athleteId && run.trigger.anchorProgramId === anchorProgramId)
      .sort((left, right) => right.runRevision.evaluationTime.localeCompare(left.runRevision.evaluationTime))[0] ?? null,
    eraseByAthlete: async (athleteId) => {
      let count = 0;
      for (const [key, run] of runs) if (run.trigger.athleteId === athleteId) {
        runs.delete(key);
        count += 1;
      }
      for (const [key, admission] of admissions) if (admission.trigger.athleteId === athleteId) admissions.delete(key);
      return count;
    },
    purgeBeforeTime: async (cutoff) => {
      let count = 0;
      for (const [key, run] of runs) if (run.runRevision.evaluationTime < cutoff) {
        runs.delete(key);
        count += 1;
      }
      return count;
    },
  };
  return Object.freeze(repository);
}
