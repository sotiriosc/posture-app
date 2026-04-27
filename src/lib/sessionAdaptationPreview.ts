import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
import type {
  SessionAdaptationPreview,
  SessionFeedback,
  SessionFeedbackSignals,
} from "@/lib/types";

const hasFlag = (signals: SessionFeedbackSignals, flag: string) =>
  signals.flags.includes(flag);

const resolveReadinessHint = (
  signals: SessionFeedbackSignals
): SessionAdaptationPreview["readinessHint"] =>
  signals.readinessHint ?? "maintain";

const canGentlyProgress = (signals: SessionFeedbackSignals) => {
  const painStable =
    signals.painDelta !== undefined && signals.painDelta <= 1;
  const confidenceOkay =
    signals.confidenceBand !== undefined && signals.confidenceBand !== "low";
  const energyOkay =
    signals.energyBand !== undefined && signals.energyBand !== "low";

  return (
    resolveReadinessHint(signals) === "progress" &&
    signals.completed === "yes" &&
    painStable &&
    signals.effortBand === "moderate" &&
    confidenceOkay &&
    energyOkay
  );
};

const reasonsForSignals = (signals: SessionFeedbackSignals) => {
  const reasons: string[] = [];

  if (signals.painDelta !== undefined && signals.painDelta >= 2) {
    reasons.push("Symptoms increased during this session.");
  } else if (signals.painDelta !== undefined && signals.painDelta <= 1) {
    reasons.push("Symptoms stayed steady during this session.");
  }

  if (signals.completed === "yes") {
    reasons.push("The session was completed.");
  } else if (signals.completed === "partial") {
    reasons.push("The session was partially completed.");
  } else if (signals.completed === "no") {
    reasons.push("The session was not completed.");
  }

  if (signals.effortBand === "moderate") {
    reasons.push("Effort landed in a moderate range.");
  } else if (signals.effortBand === "high") {
    reasons.push("Effort was high.");
  }

  if (signals.confidenceBand === "low") {
    reasons.push("Technique confidence was low.");
  }

  if (signals.energyBand === "low") {
    reasons.push("Energy was low.");
  }

  return reasons.length
    ? reasons
    : ["Feedback points toward holding the current pattern steady."];
};

const previewForAction = (
  signals: SessionFeedbackSignals,
  suggestedAction: SessionAdaptationPreview["suggestedAction"]
): SessionAdaptationPreview => {
  const readinessHint = resolveReadinessHint(signals);
  const reasons = reasonsForSignals(signals);

  const coachMessageByAction: Record<
    SessionAdaptationPreview["suggestedAction"],
    string
  > = {
    gently_progress:
      "Next time, Praxis would consider a gentle progression while keeping the pattern familiar.",
    repeat:
      "Next time, Praxis would likely keep this pattern steady instead of adding load.",
    reduce_dose:
      "Next time, Praxis would consider reducing dose or choosing an easier exposure.",
    simplify_pattern:
      "Because confidence was low, Praxis would favor repeating or simplifying this pattern.",
    recovery_session:
      "Next time, Praxis would consider a recovery-oriented session or very conservative exposure.",
  };

  return {
    readinessHint,
    suggestedAction,
    reasons,
    coachMessage: coachMessageByAction[suggestedAction],
  };
};

export const deriveSessionAdaptationPreview = (
  signals: SessionFeedbackSignals | null | undefined
): SessionAdaptationPreview | null => {
  if (!signals) return null;

  const readinessHint = resolveReadinessHint(signals);
  const painIncreased =
    (signals.painDelta !== undefined && signals.painDelta >= 2) ||
    hasFlag(signals, "pain_increased");

  if (readinessHint === "recover" || (signals.painDelta ?? 0) >= 3) {
    return previewForAction(signals, "recovery_session");
  }

  if (painIncreased) {
    return previewForAction(signals, "reduce_dose");
  }

  if (signals.confidenceBand === "low" || hasFlag(signals, "low_technique_confidence")) {
    return previewForAction(signals, "simplify_pattern");
  }

  if (readinessHint === "reduce") {
    return previewForAction(signals, "reduce_dose");
  }

  if (signals.effortBand === "high" || hasFlag(signals, "high_effort")) {
    return previewForAction(signals, "repeat");
  }

  if (canGentlyProgress(signals)) {
    return previewForAction(signals, "gently_progress");
  }

  return previewForAction(signals, "repeat");
};

export const deriveSessionAdaptationPreviewFromFeedback = (
  feedback: Partial<SessionFeedback> | null | undefined
) => deriveSessionAdaptationPreview(deriveSessionFeedbackSignals(feedback));

export const formatSessionAdaptationPreview = (
  preview: SessionAdaptationPreview | null | undefined
) => {
  if (!preview) return null;

  const labelByAction: Record<SessionAdaptationPreview["suggestedAction"], string> = {
    gently_progress:
      "Next-time preview: gently progress while keeping the pattern familiar.",
    repeat: "Next-time preview: keep this pattern steady.",
    reduce_dose: "Next-time preview: reduce dose or simplify this pattern.",
    simplify_pattern: "Next-time preview: repeat or simplify this pattern.",
    recovery_session:
      "Next-time preview: use a recovery-oriented or very conservative exposure.",
  };

  return labelByAction[preview.suggestedAction];
};

export const formatSessionAdaptationPreviewFromFeedback = (
  feedback: Partial<SessionFeedback> | null | undefined
) =>
  formatSessionAdaptationPreview(
    deriveSessionAdaptationPreviewFromFeedback(feedback)
  );
