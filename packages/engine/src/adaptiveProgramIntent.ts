import { isAdaptiveProgrammingEnabled } from "@/lib/adaptiveProgramConfig";
import { deriveNextSessionRecommendation } from "@/lib/nextSessionRecommendation";
import {
  deriveSessionAdaptationPreview,
  deriveSessionAdaptationPreviewFromFeedback,
} from "@/lib/sessionAdaptationPreview";
import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
import type {
  AdaptiveProgramIntent,
  NextSessionRecommendation,
  SessionAdaptationPreview,
  SessionFeedbackSignals,
  SessionRecord,
} from "@/lib/types";

type AdaptiveProgramIntentInput = {
  recommendation?: NextSessionRecommendation | null;
  signals?: SessionFeedbackSignals | null;
  preview?: SessionAdaptationPreview | null;
  latestSession?: Pick<SessionRecord, "feedback"> | null;
  enabled?: boolean;
};

const unique = (items: string[]) => Array.from(new Set(items));

const hasFlag = (signals: SessionFeedbackSignals | null, flag: string) =>
  Boolean(signals?.flags.includes(flag));

const emptyIntent = (enabled: boolean): AdaptiveProgramIntent => ({
  enabled,
  mode: "none",
  source: "session_feedback",
  reasons: [],
  constraints: [],
  suggestedGeneratorEffects: [],
});

const buildReasons = (params: {
  recommendation: NextSessionRecommendation | null;
  signals: SessionFeedbackSignals | null;
  preview: SessionAdaptationPreview | null;
}) => {
  const { recommendation, signals, preview } = params;
  const reasons: string[] = [];

  if (signals?.painDelta !== undefined && signals.painDelta >= 2) {
    reasons.push("Symptoms increased in recent session feedback.");
  }
  if (hasFlag(signals, "pain_increased")) {
    reasons.push("Recent feedback flagged increased symptoms.");
  }
  if (signals?.confidenceBand === "low") {
    reasons.push("Technique confidence was low.");
  }
  if (signals?.effortBand === "high") {
    reasons.push("Effort was high.");
  }
  if (signals?.completed === "partial") {
    reasons.push("The recent session was partially completed.");
  } else if (signals?.completed === "no") {
    reasons.push("The recent session was not completed.");
  }
  if (preview?.coachMessage) {
    reasons.push(preview.coachMessage);
  }
  reasons.push(...(recommendation?.reasons ?? []));

  return unique(reasons);
};

const modeFromInputs = (params: {
  recommendation: NextSessionRecommendation | null;
  signals: SessionFeedbackSignals | null;
  preview: SessionAdaptationPreview | null;
}): AdaptiveProgramIntent["mode"] => {
  const { recommendation, signals, preview } = params;
  const painIncreased =
    (signals?.painDelta ?? 0) >= 2 || hasFlag(signals, "pain_increased");

  if ((signals?.completed === "partial" || signals?.completed === "no") && !painIncreased) {
    return "reduce";
  }

  if (recommendation?.mode === "recover") return "recover";
  if (preview?.suggestedAction === "recovery_session") return "recover";
  if ((signals?.painDelta ?? 0) >= 3) return "recover";

  if (recommendation?.mode === "reduce") return "reduce";
  if (preview?.suggestedAction === "reduce_dose") return "reduce";
  if ((signals?.painDelta ?? 0) >= 2 || hasFlag(signals, "pain_increased")) {
    return "reduce";
  }

  if (recommendation?.mode === "simplify") return "simplify";
  if (preview?.suggestedAction === "simplify_pattern") return "simplify";
  if (signals?.confidenceBand === "low") return "simplify";

  if (preview?.suggestedAction === "gently_progress") return "gently_progress";
  if (recommendation?.mode === "normal" && signals?.readinessHint === "progress") {
    return "gently_progress";
  }

  if (
    recommendation?.mode === "repeat" ||
    signals?.effortBand === "high" ||
    signals?.completed === "partial" ||
    signals?.completed === "no"
  ) {
    return "hold";
  }

  return "none";
};

const constraintsForMode = (
  mode: AdaptiveProgramIntent["mode"]
): string[] => {
  if (mode === "reduce" || mode === "recover") {
    return [
      "Keep intensity conservative.",
      "Avoid adding load.",
      "Prefer an easier pattern if applied later.",
    ];
  }
  if (mode === "simplify") {
    return [
      "Reduce complexity.",
      "Repeat cues.",
      "Favor simpler pattern exposure.",
    ];
  }
  if (mode === "gently_progress") {
    return [
      "Small progression only.",
      "Keep familiar pattern.",
      "Do not progress if warm-up feels off.",
    ];
  }
  return [];
};

const generatorEffectsForMode = (
  mode: AdaptiveProgramIntent["mode"]
): string[] => {
  if (mode === "reduce") {
    return [
      "Future pass may bias toward lower dose.",
      "Future pass may prefer easier loaded variations.",
    ];
  }
  if (mode === "recover") {
    return [
      "Future pass may bias toward recovery-oriented exposure.",
      "Future pass may suppress load progression.",
    ];
  }
  if (mode === "simplify") {
    return [
      "Future pass may prefer simpler movement patterns.",
      "Future pass may repeat cue-focused exposures.",
    ];
  }
  if (mode === "gently_progress") {
    return [
      "Future pass may allow a small progression.",
      "Future pass should keep the movement pattern familiar.",
    ];
  }
  return [];
};

export const deriveAdaptiveProgramIntent = ({
  recommendation,
  signals,
  preview,
  latestSession,
  enabled = isAdaptiveProgrammingEnabled(),
}: AdaptiveProgramIntentInput): AdaptiveProgramIntent => {
  const resolvedSignals =
    signals ?? deriveSessionFeedbackSignals(latestSession?.feedback ?? null);
  const resolvedPreview =
    preview ??
    deriveSessionAdaptationPreview(resolvedSignals) ??
    deriveSessionAdaptationPreviewFromFeedback(latestSession?.feedback ?? null);
  const resolvedRecommendation =
    recommendation ??
    deriveNextSessionRecommendation({
      preview: resolvedPreview,
      signals: resolvedSignals,
      latestSession: latestSession
        ? { id: "", feedback: latestSession.feedback ?? null }
        : null,
    });

  if (!resolvedSignals && !resolvedPreview && !resolvedRecommendation) {
    return emptyIntent(enabled);
  }

  const mode = modeFromInputs({
    recommendation: resolvedRecommendation,
    signals: resolvedSignals,
    preview: resolvedPreview,
  });

  return {
    enabled,
    mode,
    source: "session_feedback",
    reasons: buildReasons({
      recommendation: resolvedRecommendation,
      signals: resolvedSignals,
      preview: resolvedPreview,
    }),
    constraints: constraintsForMode(mode),
    suggestedGeneratorEffects: generatorEffectsForMode(mode),
  };
};

export const deriveAdaptiveProgramIntentFromSession = (
  latestSession: Pick<SessionRecord, "feedback"> | null | undefined,
  options: { enabled?: boolean } = {}
) =>
  deriveAdaptiveProgramIntent({
    latestSession,
    enabled: options.enabled,
  });

export const formatAdaptiveProgramIntent = (
  intent: AdaptiveProgramIntent | null | undefined
) => {
  if (!intent || intent.mode === "none") return null;
  const labelByMode: Record<AdaptiveProgramIntent["mode"], string> = {
    none: "none",
    hold: "hold steady",
    reduce: "reduce dose",
    simplify: "simplify pattern",
    recover: "recover",
    gently_progress: "gentle progress",
  };
  return `Adaptive intent: ${labelByMode[intent.mode]}; not applied.`;
};
