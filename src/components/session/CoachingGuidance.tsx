import type { ReactNode } from "react";

export const COACHING_CHECK_IN_EXPLANATION =
  "Praxis uses your check-ins to suggest safer ways to approach the next session. It will not change your plan unless you choose a session option.";

type Tone = "dark" | "light";

type CoachGuidanceCardProps = {
  title: string;
  body: string;
  footnote?: string;
  testId?: string;
  tone?: Tone;
};

type SessionCoachFeedbackCardsProps = {
  coachRead?: string | null;
  adaptationPreview?: string | null;
  nextSessionRecommendation?: string | null;
  tone?: Tone;
  className?: string;
};

type CoachingExplanationBlockProps = {
  tone?: Tone;
  className?: string;
  children?: ReactNode;
};

const toneClasses: Record<
  Tone,
  {
    card: string;
    title: string;
    body: string;
    footnote: string;
    explanation: string;
  }
> = {
  dark: {
    card: "border-slate-500/25 bg-slate-950/42",
    title: "text-slate-400",
    body: "text-slate-100",
    footnote: "text-slate-400",
    explanation: "border-slate-500/25 bg-slate-950/35 text-slate-300",
  },
  light: {
    card: "border-slate-200 bg-white",
    title: "text-slate-500",
    body: "text-slate-700",
    footnote: "text-slate-500",
    explanation: "border-slate-200 bg-white text-slate-600",
  },
};

const stripLabel = (value: string, label: string) => {
  const trimmed = value.trim();
  const prefix = `${label}:`;
  if (!trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed;
  }

  const withoutLabel = trimmed.slice(prefix.length).trim();
  return withoutLabel
    ? withoutLabel.charAt(0).toUpperCase() + withoutLabel.slice(1)
    : trimmed;
};

export const formatCoachReadBody = (value: string) =>
  stripLabel(value, "Coach read");

export const formatNextSessionRecommendationBody = (value: string) =>
  stripLabel(value, "Next session recommendation");

export const formatAdaptationPreviewBody = (value: string) =>
  stripLabel(value, "Next-time preview");

export function CoachGuidanceCard({
  title,
  body,
  footnote,
  testId,
  tone = "light",
}: CoachGuidanceCardProps) {
  const classes = toneClasses[tone];

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${classes.card}`}
      data-testid={testId}
    >
      <p className={`text-[11px] font-semibold uppercase ${classes.title}`}>
        {title}
      </p>
      <p className={`mt-1 text-xs font-semibold leading-5 ${classes.body}`}>
        {body}
      </p>
      {footnote ? (
        <p className={`mt-1 text-[11px] leading-4 ${classes.footnote}`}>
          {footnote}
        </p>
      ) : null}
    </div>
  );
}

export function CoachingExplanationBlock({
  tone = "light",
  className = "",
  children,
}: CoachingExplanationBlockProps) {
  const classes = toneClasses[tone];

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs leading-5 ${classes.explanation} ${className}`}
      data-testid="coaching-check-in-explanation"
    >
      {children ?? COACHING_CHECK_IN_EXPLANATION}
    </div>
  );
}

export function SessionCoachFeedbackCards({
  coachRead,
  adaptationPreview,
  nextSessionRecommendation,
  tone = "light",
  className = "",
}: SessionCoachFeedbackCardsProps) {
  if (!coachRead && !adaptationPreview && !nextSessionRecommendation) {
    return null;
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      {coachRead ? (
        <CoachGuidanceCard
          title="Coach read"
          body={formatCoachReadBody(coachRead)}
          testId="coach-read-summary"
          tone={tone}
        />
      ) : null}
      {adaptationPreview ? (
        <CoachGuidanceCard
          title="Next-time preview"
          body={formatAdaptationPreviewBody(adaptationPreview)}
          footnote="Preview only; no workout has been changed."
          testId="adaptation-preview"
          tone={tone}
        />
      ) : null}
      {nextSessionRecommendation ? (
        <CoachGuidanceCard
          title="Next session recommendation"
          body={formatNextSessionRecommendationBody(nextSessionRecommendation)}
          footnote="Recommendation only; your plan has not been changed."
          testId="next-session-recommendation"
          tone={tone}
        />
      ) : null}
    </div>
  );
}
