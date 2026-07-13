import { sanitizeSessionFeedback } from "@/lib/sessionFeedback";
import type { SessionFeedback, SessionFeedbackSignals } from "@/lib/types";

const flagNames = {
  painIncrease: "pain_increased",
  partialCompletion: "partial_completion",
  notCompleted: "not_completed",
  highEffort: "high_effort",
  lowConfidence: "low_technique_confidence",
  lowEnergy: "low_energy",
} as const;

const effortBandFromRpe = (
  rpe: number | undefined
): SessionFeedbackSignals["effortBand"] => {
  if (rpe === undefined) return undefined;
  if (rpe >= 8) return "high";
  if (rpe >= 5) return "moderate";
  return "low";
};

const oneToFiveBand = (
  value: number | undefined
): "low" | "moderate" | "high" | undefined => {
  if (value === undefined) return undefined;
  if (value <= 2) return "low";
  if (value >= 4) return "high";
  return "moderate";
};

const buildCoachSummary = (
  signals: Omit<SessionFeedbackSignals, "coachSummary">
) => {
  if (signals.painDelta !== undefined && signals.painDelta >= 2) {
    return "Pain increased during this session. Keep the next exposure conservative.";
  }
  if (signals.confidenceBand === "low") {
    return "Technique confidence was low. Repeating or simplifying the pattern may be better than adding load.";
  }
  if (signals.completed === "no") {
    return "This session was not completed. Keep the next exposure manageable before adding more.";
  }
  if (signals.completed === "partial") {
    return "This was a partial completion. Keep the next exposure manageable before adding more.";
  }
  if (signals.effortBand === "high") {
    return "Effort was high. Hold the next exposure steady unless recovery feels clearly solid.";
  }
  if (signals.energyBand === "low") {
    return "Energy was low. A steady repeat may fit better than adding load next time.";
  }
  if (signals.readinessHint === "progress") {
    return "You completed the session with stable symptoms. This supports maintaining or gently progressing next time.";
  }
  return "Feedback was steady. Maintain the next exposure and watch for changes.";
};

export const deriveSessionFeedbackSignals = (
  feedback: Partial<SessionFeedback> | null | undefined
): SessionFeedbackSignals | null => {
  const sanitized = sanitizeSessionFeedback(feedback);
  if (!sanitized) return null;

  const painDelta =
    sanitized.painBefore !== undefined && sanitized.painAfter !== undefined
      ? sanitized.painAfter - sanitized.painBefore
      : undefined;
  const effortBand = effortBandFromRpe(sanitized.difficultyRPE);
  const confidenceBand = oneToFiveBand(sanitized.techniqueConfidence);
  const energyBand = oneToFiveBand(sanitized.energy);
  const flags: string[] = [];

  if (painDelta !== undefined && painDelta >= 2) {
    flags.push(flagNames.painIncrease);
  }
  if (sanitized.completed === "partial") {
    flags.push(flagNames.partialCompletion);
  }
  if (sanitized.completed === "no") {
    flags.push(flagNames.notCompleted);
  }
  if (effortBand === "high") flags.push(flagNames.highEffort);
  if (confidenceBand === "low") flags.push(flagNames.lowConfidence);
  if (energyBand === "low") flags.push(flagNames.lowEnergy);

  const shouldRecover =
    sanitized.completed === "no" || (painDelta !== undefined && painDelta >= 3);
  const shouldReduce =
    shouldRecover ||
    sanitized.completed === "partial" ||
    (painDelta !== undefined && painDelta >= 2) ||
    confidenceBand === "low";
  const shouldProgress =
    sanitized.completed === "yes" &&
    painDelta !== undefined &&
    painDelta <= 1 &&
    effortBand === "moderate" &&
    confidenceBand !== undefined &&
    confidenceBand !== "low" &&
    energyBand !== undefined &&
    energyBand !== "low";

  const baseSignals: Omit<SessionFeedbackSignals, "coachSummary"> = {
    painDelta,
    completed: sanitized.completed,
    effortBand,
    confidenceBand,
    energyBand,
    readinessHint: shouldRecover
      ? "recover"
      : shouldReduce
      ? "reduce"
      : shouldProgress
      ? "progress"
      : "maintain",
    flags,
  };

  return {
    ...baseSignals,
    coachSummary: buildCoachSummary(baseSignals),
  };
};

const symptomPhrase = (painDelta: number | undefined) => {
  if (painDelta === undefined) return null;
  if (painDelta >= 2) return "symptoms increased";
  if (painDelta <= -2) return "symptoms eased";
  return "symptoms stable";
};

const confidencePhrase = (
  confidenceBand: SessionFeedbackSignals["confidenceBand"]
) => {
  if (!confidenceBand) return null;
  if (confidenceBand === "low") return "confidence low";
  if (confidenceBand === "moderate") return "confidence steady";
  return "confidence good";
};

export const formatSessionFeedbackCoachSummary = (
  feedback: Partial<SessionFeedback> | null | undefined
) => {
  const signals = deriveSessionFeedbackSignals(feedback);
  if (!signals) return null;

  const parts = [
    symptomPhrase(signals.painDelta),
    signals.effortBand ? `effort ${signals.effortBand}` : null,
    confidencePhrase(signals.confidenceBand),
    signals.energyBand === "low" ? "energy low" : null,
    signals.completed === "partial" ? "partial completion" : null,
    signals.completed === "no" ? "not completed" : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length
    ? `Coach read: ${parts.join(", ")}.`
    : "Coach read: check-in saved for next review.";
};
