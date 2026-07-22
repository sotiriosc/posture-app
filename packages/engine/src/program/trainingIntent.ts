/**
 * Phase 3.3 — Training Intent helpers
 *
 * Pure, stateless helpers consumed by:
 *   - computePatternLadderDecision (via ladderAdvancement.ts — actual gating)
 *   - UI: session screen and settings for phase-transition prompt
 *
 * Determinism: no Date.now(), all decisions from persisted state only.
 */

import type { LadderState } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrainingIntent = "build" | "maintain" | "rehab";

/**
 * A pattern that has met advancement criteria while in maintain mode and has
 * not yet received its phase-transition "Want to progress?" prompt.
 */
export type MaintainProgressionPrompt = {
  pattern: string;
  exerciseId: string;
  phaseIndex: number;
};

// ---------------------------------------------------------------------------
// Maintain prompt computation
// ---------------------------------------------------------------------------

/**
 * Given the current ladder state and the active phase, return the list of
 * patterns that should receive a one-time "Want to try progressing on X?"
 * prompt.
 *
 * Fires when:
 *   - trainingIntent === "maintain"
 *   - the pattern's lastDecisionTrace contains "advancement criteria met"
 *     (set by computePatternLadderDecision in maintain mode)
 *   - the prompt has NOT already been shown at the current phaseIndex
 *     (tracked in ladderState.maintainPromptShownAtPhase)
 *
 * Returns patterns in stable alphabetical order.
 */
export const computeMaintainPrompts = (params: {
  trainingIntent: TrainingIntent;
  ladderState: LadderState;
  phaseIndex: number;
}): MaintainProgressionPrompt[] => {
  const { trainingIntent, ladderState, phaseIndex } = params;
  if (trainingIntent !== "maintain") return [];

  const shownAt = ladderState.maintainPromptShownAtPhase ?? {};

  return Object.entries(ladderState.byPattern)
    .filter(([pattern, rungState]) => {
      // Only prompt for patterns whose last decision said "criteria met".
      if (!rungState.lastDecisionTrace.includes("advancement criteria met")) {
        return false;
      }
      // Only prompt once per phase.
      return (shownAt[pattern] ?? -1) < phaseIndex;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pattern, rungState]) => ({
      pattern,
      exerciseId: rungState.exerciseId,
      phaseIndex,
    }));
};

/**
 * Mark a maintain prompt as shown for the given patterns at the given phase.
 * Returns an updated ladderState.maintainPromptShownAtPhase map.
 */
export const markMaintainPromptsShown = (
  ladderState: LadderState,
  patterns: string[],
  phaseIndex: number
): LadderState => {
  if (patterns.length === 0) return ladderState;
  const shownAt = { ...(ladderState.maintainPromptShownAtPhase ?? {}) };
  patterns.forEach((p) => {
    shownAt[p] = phaseIndex;
  });
  return { ...ladderState, maintainPromptShownAtPhase: shownAt };
};

/**
 * Apply the user's "Yes, let's progress" response for a single pattern.
 * Sets progressionOverrideByPattern[pattern] = "build" so the next
 * computeLadderState call will advance that pattern.
 */
export const applyMaintainProgressionYes = (
  ladderState: LadderState,
  pattern: string
): LadderState => ({
  ...ladderState,
  progressionOverrideByPattern: {
    ...(ladderState.progressionOverrideByPattern ?? {}),
    [pattern]: "build",
  },
});

/**
 * Record the user's "Keep maintaining" response — no change to the ladder
 * state other than marking the prompt as shown (already handled by
 * markMaintainPromptsShown).  Returns the ladderState unchanged.
 */
export const applyMaintainProgressionNo = (
  ladderState: LadderState
): LadderState => ladderState;
