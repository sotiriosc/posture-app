import type {
  ProgramSelectionDebug,
  ProgramSelectionDecisionTrace,
} from "@/lib/types";

const mergeQuotaSelections = (
  base: ProgramSelectionDecisionTrace["selectedForQuota"],
  patch: ProgramSelectionDecisionTrace["selectedForQuota"]
) => {
  if (!patch?.length) return base;
  if (!base?.length) return patch;
  const mergedByCategory = new Map<string, { category: string; deficit: number; bonus: number }>();
  [...base, ...patch].forEach((entry) => {
    const current = mergedByCategory.get(entry.category);
    if (!current || entry.bonus > current.bonus) {
      mergedByCategory.set(entry.category, entry);
    }
  });
  return Array.from(mergedByCategory.values()).sort((left, right) => {
    if (right.bonus !== left.bonus) return right.bonus - left.bonus;
    return left.category.localeCompare(right.category);
  });
};

export const mergeDecisionTrace = (
  base?: ProgramSelectionDecisionTrace,
  patch?: ProgramSelectionDecisionTrace
): ProgramSelectionDecisionTrace | undefined => {
  if (!base) return patch;
  if (!patch) return base;
  return {
    selectedForQuota: mergeQuotaSelections(base.selectedForQuota, patch.selectedForQuota),
    noveltyPenaltyApplied:
      patch.noveltyPenaltyApplied ?? base.noveltyPenaltyApplied,
    environmentBonusOrPenalty:
      patch.environmentBonusOrPenalty ?? base.environmentBonusOrPenalty,
    slotRoleMatch: patch.slotRoleMatch ?? base.slotRoleMatch,
    tieBreakRank: patch.tieBreakRank ?? base.tieBreakRank,
    phaseFitBonusOrPenalty:
      patch.phaseFitBonusOrPenalty ?? base.phaseFitBonusOrPenalty,
    dayIdentityBonusOrPenalty:
      patch.dayIdentityBonusOrPenalty ?? base.dayIdentityBonusOrPenalty,
    fatigueOverlapPenalty:
      patch.fatigueOverlapPenalty ?? base.fatigueOverlapPenalty,
  };
};

export const withDecisionTrace = (
  debug: ProgramSelectionDebug | undefined,
  decisionTrace: ProgramSelectionDecisionTrace | undefined
): ProgramSelectionDebug | undefined => {
  if (!debug) return debug;
  const merged = mergeDecisionTrace(debug.decisionTrace, decisionTrace);
  if (!merged) return debug;
  return {
    ...debug,
    decisionTrace: merged,
  };
};
