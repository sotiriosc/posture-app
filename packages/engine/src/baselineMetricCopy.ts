/**
 * Display-gating for readiness / consistency copy when a user has too few
 * completed sessions for those percentages to mean anything.
 *
 * Same principle as Progress Phase 6d statistical floors: below the floor,
 * show a baseline state instead of a near-zero score that reads as judgment.
 * Calculations are unchanged — this is copy/display only.
 */

export const BASELINE_METRIC_SESSION_FLOOR = 3;

export const BASELINE_READINESS_COPY = "Readiness: building your baseline";

export const BASELINE_CONSISTENCY_COPY =
  "Consistency: starts tracking after your first few sessions";

export const BASELINE_PROGRESSION_SPEED_COPY =
  "Your plan starts at a measured pace until we have a few sessions to learn from.";

export const metricsHaveBaselineFloor = (completedSessionCount: number) =>
  completedSessionCount >= BASELINE_METRIC_SESSION_FLOOR;

/** True when text is (or embeds) a readiness/consistency numeric signal. */
export const isReadinessOrConsistencyMetricText = (text: string) => {
  const t = text.trim();
  return (
    /Training readiness:\s*\d+%/i.test(t) ||
    /Readiness\s+\d+%/i.test(t) ||
    /Readiness is \d+%/i.test(t) ||
    /Consistency\s+\d+%/i.test(t)
  );
};

/**
 * Rewrite user-facing readiness/consistency numeric copy below the session
 * floor. Pass-through once the floor is met, or when the string is unrelated.
 */
export const gateReadinessConsistencyCopy = (
  text: string,
  completedSessionCount: number
): string => {
  if (metricsHaveBaselineFloor(completedSessionCount)) return text;

  const t = text.trim();

  if (
    /Readiness\s+\d+%\s+and\s+consistency\s+\d+/i.test(t) ||
    /Readiness is \d+%.*consistency\s+\d+%/i.test(t)
  ) {
    return BASELINE_PROGRESSION_SPEED_COPY;
  }

  if (
    /Training readiness:\s*\d+%/i.test(t) ||
    /^Readiness\s+\d+%/i.test(t) ||
    /^Readiness is \d+%/i.test(t)
  ) {
    return BASELINE_READINESS_COPY;
  }

  if (
    /^Consistency\s+\d+%\s*$/i.test(t) ||
    /Consistency\s+\d+%\s+with\s+movement quality/i.test(t)
  ) {
    return BASELINE_CONSISTENCY_COPY;
  }

  // "Consistency 0% • Completion …" — keep completion, swap the judgment score.
  if (/Consistency\s+\d+%/i.test(t)) {
    return t.replace(/Consistency\s+\d+%/i, BASELINE_CONSISTENCY_COPY);
  }

  return text;
};

export const gateReadinessConsistencyLines = (
  lines: string[],
  completedSessionCount: number
): string[] =>
  lines.map((line) => gateReadinessConsistencyCopy(line, completedSessionCount));
