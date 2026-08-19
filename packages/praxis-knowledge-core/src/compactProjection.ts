import {
  COMPACT_FALLBACK_PROJECTION_CONTRACT,
  type ExerciseKnowledgeCompactFallback,
  type ExerciseKnowledgeEntry,
} from "./contracts";

function statement(entry: ExerciseKnowledgeEntry, factId: string): string {
  const fact = entry.facts.find((candidate) => candidate.id === factId);
  if (!fact) throw new Error(`KNOWLEDGE_FACT_REFERENCE_MISSING:${factId}`);
  return fact.compactInstruction ?? fact.canonicalStatement;
}

export function projectCompactFallback(
  entry: ExerciseKnowledgeEntry,
): ExerciseKnowledgeCompactFallback {
  const summaryFactId = entry.presentation.compactFallbackRefs?.summary ?? entry.presentation.pattern[0];
  const coachingFactIds = entry.presentation.compactFallbackRefs?.coachingFocus ?? [
    entry.presentation.focus,
    entry.presentation.cues[0],
  ].filter((value): value is string => Boolean(value));
  if (!summaryFactId || coachingFactIds.length === 0) {
    throw new Error(`KNOWLEDGE_COMPACT_PROJECTION_INCOMPLETE:${entry.exerciseId}`);
  }

  return Object.freeze({
    contract: COMPACT_FALLBACK_PROJECTION_CONTRACT,
    exerciseId: entry.exerciseId,
    summary: statement(entry, summaryFactId),
    coachingFocus: Object.freeze(coachingFactIds.map((factId) => statement(entry, factId))),
    sourceFactIds: Object.freeze([summaryFactId, ...coachingFactIds]),
  });
}

export function projectCompactFallbacks(
  entries: readonly ExerciseKnowledgeEntry[],
): readonly ExerciseKnowledgeCompactFallback[] {
  return Object.freeze(
    [...entries]
      .sort((left, right) => left.exerciseId.localeCompare(right.exerciseId))
      .map(projectCompactFallback),
  );
}
