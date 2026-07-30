import type { Program, SessionRecord } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toTimestampMs = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const sessionCompletedAtMs = (session: SessionRecord) =>
  toTimestampMs(session.completedAt ?? session.startedAt ?? session.createdAt);

const dayBucket = (timestampMs: number) => Math.floor(timestampMs / DAY_MS);

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const metricAsPercent = (metric: number | null | undefined) =>
  typeof metric === "number" && Number.isFinite(metric)
    ? Math.round(clamp(metric, 0, 1) * 100)
    : null;

export function calculateTrainingConsistencyPercent({
  sessions,
  daysPerWeek,
  nowMs,
  lookbackDays = 28,
}: {
  sessions: SessionRecord[];
  daysPerWeek: number;
  nowMs: number;
  lookbackDays?: number;
}) {
  const targetPerWeek = Math.max(1, Math.round(daysPerWeek || 0));
  const completedTimestamps = sessions
    .map(sessionCompletedAtMs)
    .filter((timestamp): timestamp is number => timestamp !== null && timestamp <= nowMs)
    .sort((left, right) => left - right);

  if (!completedTimestamps.length) return null;

  const earliestSessionMs = completedTimestamps[0] ?? nowMs;
  const windowStartMs = Math.max(earliestSessionMs, nowMs - lookbackDays * DAY_MS);
  const uniqueTrainingDays = new Set(
    completedTimestamps
      .filter((timestamp) => timestamp >= windowStartMs && timestamp <= nowMs)
      .map(dayBucket)
  );

  if (!uniqueTrainingDays.size) return null;

  const trackedDays = Math.max(1, Math.ceil((nowMs - windowStartMs + 1) / DAY_MS));
  const expectedWorkouts = Math.max(1, Math.ceil(trackedDays / 7) * targetPerWeek);
  return clamp(Math.round((uniqueTrainingDays.size / expectedWorkouts) * 100), 0, 100);
}

export function calculateAssessmentMovementQualityPercent(
  assessmentHistory: Program["assessmentHistory"] | undefined
) {
  const baseline = assessmentHistory?.find((snapshot) => snapshot.status === "accepted");
  const latest = assessmentHistory
    ?.filter((snapshot) => snapshot.status !== "insufficient_confidence")
    .at(-1);

  if (!baseline || !latest || baseline === latest) return null;

  const scores = baseline.observations
    .map((baselineObservation) => {
      const latestObservation = latest.observations.find(
        (observation) => observation.focusTag === baselineObservation.focusTag
      );
      if (!latestObservation) return null;

      const thresholdGap = baselineObservation.measuredValue - baselineObservation.threshold;
      const denominator =
        Math.abs(thresholdGap) >= 0.01
          ? Math.abs(thresholdGap)
          : Math.max(Math.abs(baselineObservation.measuredValue), 0.01);
      const progressTowardThreshold =
        (baselineObservation.measuredValue - latestObservation.measuredValue) / denominator;
      return clamp(50 + progressTowardThreshold * 45, 25, 95);
    })
    .filter((score): score is number => score !== null);

  const score = average(scores);
  return score === null ? null : Math.round(score);
}

export function calculateFeedbackMovementQualityPercent(sessions: SessionRecord[]) {
  const orderedFeedback = sessions
    .filter((session) => session.completedAt && session.feedback)
    .sort(
      (left, right) =>
        (sessionCompletedAtMs(left) ?? 0) - (sessionCompletedAtMs(right) ?? 0)
    )
    .map((session) => session.feedback)
    .filter((feedback): feedback is NonNullable<SessionRecord["feedback"]> =>
      Boolean(feedback)
    );

  if (orderedFeedback.length < 2) return null;

  const splitIndex = Math.max(1, Math.floor(orderedFeedback.length / 2));
  const early = orderedFeedback.slice(0, splitIndex);
  const recent = orderedFeedback.slice(splitIndex);
  const numberValues = (
    entries: NonNullable<SessionRecord["feedback"]>[],
    key: "painAfter" | "techniqueConfidence" | "difficultyRPE"
  ) =>
    entries
      .map((entry) => entry[key])
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const earlyPainAfter = average(numberValues(early, "painAfter"));
  const recentPainAfter = average(numberValues(recent, "painAfter"));
  const earlyConfidence = average(numberValues(early, "techniqueConfidence"));
  const recentConfidence = average(numberValues(recent, "techniqueConfidence"));
  const recentRpe = average(numberValues(recent, "difficultyRPE"));
  const completionRate =
    recent.filter((entry) => entry.completed === "yes").length / Math.max(1, recent.length);

  const scores: Array<{ score: number; weight: number }> = [
    { score: completionRate * 100, weight: 0.2 },
  ];

  if (recentPainAfter !== null) {
    scores.push({ score: clamp(100 - recentPainAfter * 10, 0, 100), weight: 0.25 });
  }
  if (earlyPainAfter !== null && recentPainAfter !== null) {
    scores.push({
      score: clamp(50 + (earlyPainAfter - recentPainAfter) * 12, 0, 100),
      weight: 0.2,
    });
  }
  if (recentConfidence !== null) {
    scores.push({ score: clamp((recentConfidence / 5) * 100, 0, 100), weight: 0.2 });
  }
  if (earlyConfidence !== null && recentConfidence !== null) {
    scores.push({
      score: clamp(50 + (recentConfidence - earlyConfidence) * 18, 0, 100),
      weight: 0.15,
    });
  }
  if (recentRpe !== null) {
    scores.push({
      score: clamp(100 - Math.max(0, recentRpe - 6) * 12, 0, 100),
      weight: 0.1,
    });
  }

  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(
    scores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight
  );
}

export function calculateMovementQualityPercent({
  program,
  sessions,
  consistencyPercent,
}: {
  program: Program | null;
  sessions: SessionRecord[];
  consistencyPercent: number;
}) {
  const assessmentScore = calculateAssessmentMovementQualityPercent(
    program?.assessmentHistory
  );
  const feedbackScore = calculateFeedbackMovementQualityPercent(sessions);
  const liveScores: Array<{ score: number; weight: number }> = [];

  if (assessmentScore !== null) liveScores.push({ score: assessmentScore, weight: 0.55 });
  if (feedbackScore !== null) liveScores.push({ score: feedbackScore, weight: 0.3 });
  if (liveScores.length) {
    liveScores.push({ score: consistencyPercent, weight: 0.15 });
    const totalWeight = liveScores.reduce((sum, item) => sum + item.weight, 0);
    return clamp(
      Math.round(
        liveScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight
      ),
      0,
      100
    );
  }

  const readiness = metricAsPercent(program?.phaseObjective?.metrics?.readiness);
  const consistency = metricAsPercent(program?.phaseObjective?.metrics?.consistency);
  if (readiness !== null && consistency !== null) {
    return Math.round((readiness + consistency) / 2);
  }

  return Math.max(55, consistencyPercent - 5);
}

export function replaceConsistencyMetricText(text: string, consistencyPercent: number) {
  return text.replace(
    /(consistency\s*)\d+%/gi,
    (_, label: string) => `${label}${clamp(Math.round(consistencyPercent), 0, 100)}%`
  );
}
