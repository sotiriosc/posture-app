import {
  deriveSessionAdaptationPreview,
  deriveSessionAdaptationPreviewFromFeedback,
} from "@/lib/sessionAdaptationPreview";
import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
import type {
  NextSessionRecommendation,
  SessionAdaptationPreview,
  SessionFeedback,
  SessionFeedbackSignals,
  SessionRecord,
} from "@/lib/types";

type RecommendationInput = {
  preview?: SessionAdaptationPreview | null;
  signals?: SessionFeedbackSignals | null;
  latestSession?: Pick<SessionRecord, "id" | "feedback"> | null;
};

const hasFlag = (signals: SessionFeedbackSignals | null, flag: string) =>
  Boolean(signals?.flags.includes(flag));

const unique = (items: string[]) => Array.from(new Set(items));

const addSignalReasons = (
  reasons: string[],
  signals: SessionFeedbackSignals | null
) => {
  if (!signals) return reasons;

  if ((signals.painDelta ?? 0) >= 2 || hasFlag(signals, "pain_increased")) {
    reasons.unshift(
      "Symptoms increased during the last session, so the next exposure should stay conservative."
    );
  }

  if (signals.confidenceBand === "low") {
    reasons.push(
      "Technique confidence was low, so repeating cues or simplifying the pattern may help."
    );
  }

  if (signals.effortBand === "high") {
    reasons.push("Effort was high, so holding dose is favored before adding more.");
  }

  if (signals.completed === "partial") {
    reasons.push(
      "The last session was partially completed, so the next exposure should feel manageable."
    );
  } else if (signals.completed === "no") {
    reasons.push(
      "The last session was not completed, so the next exposure should feel manageable."
    );
  }

  return unique(reasons);
};

const priorityForRepeat = (signals: SessionFeedbackSignals | null) =>
  signals?.effortBand === "high" ||
  signals?.completed === "partial" ||
  signals?.completed === "no"
    ? "medium"
    : "low";

const priorityForReduce = (signals: SessionFeedbackSignals | null) =>
  (signals?.painDelta ?? 0) >= 2 || hasFlag(signals, "pain_increased")
    ? "high"
    : "medium";

const buildRecommendation = (params: {
  preview: SessionAdaptationPreview;
  signals: SessionFeedbackSignals | null;
  sourceSessionId?: string;
}): NextSessionRecommendation => {
  const { preview, signals, sourceSessionId } = params;
  const baseReasons = addSignalReasons([...preview.reasons], signals);

  const byAction: Record<
    SessionAdaptationPreview["suggestedAction"],
    Omit<NextSessionRecommendation, "reasons" | "sourceSessionId">
  > = {
    gently_progress: {
      mode: "normal",
      priority: "low",
      message:
        "Gentle progression may be reasonable next session if the warm-up feels steady.",
      suggestedAdjustments: [
        "Keep the pattern familiar.",
        "Use only a small increase in load, reps, or time if the session starts well.",
      ],
    },
    repeat: {
      mode: "repeat",
      priority: priorityForRepeat(signals),
      message:
        "Repeating this pattern at a steady dose is the clearest next-session option.",
      suggestedAdjustments: [
        "Hold load, volume, and tempo steady.",
        "Repeat the same cues before adding more.",
      ],
    },
    reduce_dose: {
      mode: "reduce",
      priority: priorityForReduce(signals),
      message:
        "Reducing the next exposure is the clearest advisory recommendation.",
      suggestedAdjustments: [
        "Lower load, reps, sets, or work time.",
        "Use an easier variation or slower tempo.",
      ],
    },
    simplify_pattern: {
      mode: "simplify",
      priority: "medium",
      message:
        "Simplifying the pattern is favored before progressing the next session.",
      suggestedAdjustments: [
        "Repeat the main cues.",
        "Lower load or choose a simpler pattern variation.",
      ],
    },
    recovery_session: {
      mode: "recover",
      priority: "high",
      message:
        "A recovery-oriented or very conservative exposure is favored next session.",
      suggestedAdjustments: [
        "Keep intensity low and ranges comfortable.",
        "Favor easy movement quality over added load or volume.",
      ],
    },
  };

  const recommendation = byAction[preview.suggestedAction];

  return {
    ...recommendation,
    reasons: baseReasons,
    ...(sourceSessionId ? { sourceSessionId } : {}),
  };
};

export const deriveNextSessionRecommendation = ({
  preview,
  signals,
  latestSession,
}: RecommendationInput): NextSessionRecommendation | null => {
  const resolvedSignals =
    signals ?? deriveSessionFeedbackSignals(latestSession?.feedback ?? null);
  const resolvedPreview =
    preview ??
    deriveSessionAdaptationPreview(resolvedSignals) ??
    deriveSessionAdaptationPreviewFromFeedback(latestSession?.feedback ?? null);

  if (!resolvedPreview) return null;

  return buildRecommendation({
    preview: resolvedPreview,
    signals: resolvedSignals,
    sourceSessionId: latestSession?.id,
  });
};

export const deriveNextSessionRecommendationFromFeedback = (
  feedback: Partial<SessionFeedback> | null | undefined,
  latestSession?: Pick<SessionRecord, "id"> | null
) =>
  deriveNextSessionRecommendation({
    latestSession: latestSession
      ? { id: latestSession.id, feedback: feedback ?? null }
      : null,
    signals: deriveSessionFeedbackSignals(feedback),
  });

export const deriveNextSessionRecommendationFromSession = (
  latestSession: Pick<SessionRecord, "id" | "feedback"> | null | undefined
) => deriveNextSessionRecommendation({ latestSession });

export const formatNextSessionRecommendation = (
  recommendation: NextSessionRecommendation | null | undefined
) => {
  if (!recommendation) return null;

  // Phase 6d, Commit 6 — this used to be paired in the UI with
  // sessionAdaptationPreview's "Next-time preview: ..." sentence plus its own
  // "Recommendation only; your plan has not been changed." disclaimer. Both
  // sentences were derived from the same underlying signal and said nearly
  // the same thing twice, each with its own near-duplicate disclaimer. This
  // is now the single sentence rendered post-session — the "we'll" framing
  // plus the trailing "adjust based on how it goes" clause carries the
  // tentativeness the disclaimers used to spell out.
  const labelByMode: Record<NextSessionRecommendation["mode"], string> = {
    normal:
      "Next session: we'll keep going as planned — a small step up is optional. Your plan will adjust based on how it goes.",
    repeat:
      "Next session: we'll repeat this movement at a steady pace. Your plan will adjust based on how it goes.",
    reduce:
      "Next session: we'll ease off with a lighter dose or an easier variation. Your plan will adjust based on how it goes.",
    simplify:
      "Next session: we'll simplify this movement before adding anything back. Your plan will adjust based on how it goes.",
    recover:
      "Next session: we'll keep things easy and recovery-focused. Your plan will adjust based on how it goes.",
  };

  return labelByMode[recommendation.mode];
};

export const formatNextSessionRecommendationFromFeedback = (
  feedback: Partial<SessionFeedback> | null | undefined,
  latestSession?: Pick<SessionRecord, "id"> | null
) =>
  formatNextSessionRecommendation(
    deriveNextSessionRecommendationFromFeedback(feedback, latestSession)
  );

export const formatNextSessionRecommendationFromSession = (
  latestSession: Pick<SessionRecord, "id" | "feedback"> | null | undefined
) =>
  formatNextSessionRecommendation(
    deriveNextSessionRecommendationFromSession(latestSession)
  );
