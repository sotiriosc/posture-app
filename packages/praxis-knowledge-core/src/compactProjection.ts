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
  const patternFactId = entry.presentation.pattern[0];
  const cueFactId = entry.presentation.cues[0];
  if (!patternFactId || !cueFactId) {
    throw new Error(`KNOWLEDGE_COMPACT_PROJECTION_INCOMPLETE:${entry.exerciseId}`);
  }

  return Object.freeze({
    contract: COMPACT_FALLBACK_PROJECTION_CONTRACT,
    exerciseId: entry.exerciseId,
    summary: statement(entry, patternFactId),
    coachingFocus: Object.freeze([
      statement(entry, entry.presentation.focus),
      statement(entry, cueFactId),
    ]),
    sourceFactIds: Object.freeze([
      patternFactId,
      entry.presentation.focus,
      cueFactId,
    ]),
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
