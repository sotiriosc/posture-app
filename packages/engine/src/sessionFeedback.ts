import type { SessionFeedback } from "@/lib/types";

const COMPLETION_LABELS: Record<NonNullable<SessionFeedback["completed"]>, string> = {
  yes: "Completed",
  partial: "Partial",
  no: "Not completed",
};

const asBoundedInteger = (
  value: unknown,
  min: number,
  max: number
): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const asCompleted = (
  value: unknown
): SessionFeedback["completed"] | undefined => {
  return value === "yes" || value === "partial" || value === "no"
    ? value
    : undefined;
};

const asNotes = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 500) : undefined;
};

export const sanitizeSessionFeedback = (
  feedback: Partial<SessionFeedback> | null | undefined
): SessionFeedback | null => {
  if (!feedback || typeof feedback !== "object") return null;

  const sanitized: SessionFeedback = {};
  const completed = asCompleted(feedback.completed);
  const difficultyRPE = asBoundedInteger(feedback.difficultyRPE, 1, 10);
  const painBefore = asBoundedInteger(feedback.painBefore, 0, 10);
  const painAfter = asBoundedInteger(feedback.painAfter, 0, 10);
  const energy = asBoundedInteger(feedback.energy, 1, 5);
  const techniqueConfidence = asBoundedInteger(
    feedback.techniqueConfidence,
    1,
    5
  );
  const enjoyment = asBoundedInteger(feedback.enjoyment, 1, 5);
  const timeAvailableNextSession = asBoundedInteger(
    feedback.timeAvailableNextSession,
    5,
    180
  );
  const notes = asNotes(feedback.notes);

  if (completed) sanitized.completed = completed;
  if (difficultyRPE !== undefined) sanitized.difficultyRPE = difficultyRPE;
  if (painBefore !== undefined) sanitized.painBefore = painBefore;
  if (painAfter !== undefined) sanitized.painAfter = painAfter;
  if (energy !== undefined) sanitized.energy = energy;
  if (techniqueConfidence !== undefined) {
    sanitized.techniqueConfidence = techniqueConfidence;
  }
  if (enjoyment !== undefined) sanitized.enjoyment = enjoyment;
  if (timeAvailableNextSession !== undefined) {
    sanitized.timeAvailableNextSession = timeAvailableNextSession;
  }
  if (notes) sanitized.notes = notes;

  return Object.keys(sanitized).length ? sanitized : null;
};

export const formatSessionFeedbackSummary = (
  feedback: SessionFeedback | null | undefined
) => {
  const sanitized = sanitizeSessionFeedback(feedback);
  if (!sanitized) return null;

  const parts: string[] = [];
  if (sanitized.completed && sanitized.completed !== "yes") {
    parts.push(COMPLETION_LABELS[sanitized.completed]);
  }
  if (sanitized.difficultyRPE !== undefined) {
    parts.push(`Difficulty ${sanitized.difficultyRPE}/10`);
  }
  if (
    sanitized.painBefore !== undefined ||
    sanitized.painAfter !== undefined
  ) {
    parts.push(
      `Pain ${sanitized.painBefore ?? "-"} -> ${sanitized.painAfter ?? "-"}`
    );
  }
  if (sanitized.energy !== undefined) {
    parts.push(`Energy ${sanitized.energy}/5`);
  }
  if (sanitized.techniqueConfidence !== undefined) {
    parts.push(`Confidence ${sanitized.techniqueConfidence}/5`);
  }

  return parts.length ? parts.join(" • ") : null;
};

