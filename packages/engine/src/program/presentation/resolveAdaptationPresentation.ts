/**
 * Phase 7B — Plain-language adaptation presentation.
 * Internal enums remain sacrifice/test/modify; UI must use these labels.
 */

import type { FeedbackContractAction } from "@/lib/program/feedbackContract";
import type {
  AdaptationReason,
  FeedbackContractActionLabel,
  PresentationMessage,
} from "./presentationContractTypes";

const ADAPTATION_COPY: Record<AdaptationReason, string> = {
  assessmentFocus:
    "This warmup or support work emphasizes control identified in your assessment.",
  reportedPain:
    "This plan reduces demand in areas you reported as uncomfortable.",
  sessionDiscomfort:
    "This exercise was adjusted after discomfort you reported during a session.",
  equipmentCapability:
    "This exercise uses the equipment and setup you confirmed.",
  personalPreference:
    "This exercise stays out of your program until you reset the block.",
  progression:
    "This movement is held or advanced based on your recent comfortable control.",
  phaseChange: "Your phase focus updated while keeping what still works for you.",
  weeklyBalance:
    "This choice supports balanced weekly coverage across your training days.",
};

export const resolveAdaptationReasonMessage = (
  reason: AdaptationReason,
  overrideText?: string
): PresentationMessage => ({
  id: `adaptation.${reason}`,
  reason,
  text: overrideText?.trim() || ADAPTATION_COPY[reason],
  severity:
    reason === "reportedPain" || reason === "sessionDiscomfort"
      ? "caution"
      : "info",
});

export const FEEDBACK_CONTRACT_ACTION_LABELS: Record<
  FeedbackContractAction,
  FeedbackContractActionLabel
> = {
  sacrifice: {
    action: "sacrifice",
    label: "Skip for now",
    description: "Remove this exercise for now — Praxis can retest it later",
  },
  test: {
    action: "test",
    label: "Keep and retest",
    description: "Keep it in and try again this session",
  },
  modify: {
    action: "modify",
    label: "Make it easier",
    description: "Switch to an easier variation",
  },
  dismiss: {
    action: "dismiss",
    label: "Keep and retest",
    description: "Keep it in and try again this session",
  },
};

export const resolveFeedbackContractActionLabel = (
  action: FeedbackContractAction
): FeedbackContractActionLabel => FEEDBACK_CONTRACT_ACTION_LABELS[action];

/** Forbidden raw internal tokens in user-facing presentation strings. */
export const FORBIDDEN_INTERNAL_UI_TOKENS = [
  "sacrifice",
  "test",
  "modify",
  "dismiss",
  "hardFailure",
  "reasonCode",
  "GYM_",
  "DUMBBELL_",
  "BAND_",
  "BODYWEIGHT_",
  "MIXED_HOME_",
  "QUALITY_",
  "MATRIX_",
] as const;

export const containsForbiddenInternalUiLanguage = (text: string): boolean => {
  const lower = text.toLowerCase();
  // Allow the plain word "test" only inside "retest" phrases — block standalone labels.
  if (/\bsacrifice\b/.test(lower)) return true;
  if (/\bmodify\b/.test(lower)) return true;
  if (/(^|\s)test(\s|$)/.test(lower) && !/\bretest\b/.test(lower)) return true;
  if (/\breasoncode\b/.test(lower)) return true;
  if (/\bhardfailure\b/.test(lower)) return true;
  if (/\b(gym|dumbbell|band|bodyweight|mixed_home|quality|matrix)_[a-z0-9_]+\b/i.test(text)) {
    return true;
  }
  return false;
};

export const resolvePainAdaptationSummary = (params: {
  painAreas: string[];
}): PresentationMessage | null => {
  const areas = params.painAreas.map((a) => a.trim()).filter(Boolean);
  if (!areas.length) return null;
  const list =
    areas.length === 1
      ? areas[0]
      : `${areas.slice(0, -1).join(", ")} and ${areas[areas.length - 1]}`;
  return resolveAdaptationReasonMessage(
    "reportedPain",
    `Your plan accounts for discomfort you reported around ${list}.`
  );
};

export const resolveAssessmentFocusSummary = (params: {
  focusTags: string[];
  highConfidence: boolean;
}): PresentationMessage | null => {
  if (!params.highConfidence || !params.focusTags.length) return null;
  const focus = params.focusTags.slice(0, 2).join(" and ");
  return resolveAdaptationReasonMessage(
    "assessmentFocus",
    `Your program emphasizes ${focus} based on your assessment.`
  );
};

export const resolveNoValidSwapMessage = (): PresentationMessage => ({
  id: "adaptation.noValidSwap",
  reason: "sessionDiscomfort",
  text: "Praxis could not find a safe equivalent with your confirmed equipment and setup. You can skip this exercise safely or stop the session — your feedback is still saved.",
  severity: "safety",
});
