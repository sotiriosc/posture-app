/**
 * Phase 6L Commit 2 — Google Form wiring for /feedback.
 *
 * Configure these NEXT_PUBLIC_* vars in Vercel (and locally) so responses
 * land in Sotirios's Google Sheet. No Praxis DB storage.
 *
 * How to get entry IDs: open the live Google Form → Inspect a field →
 * look for `name="entry.123456789"`.
 */

export type FeedbackFormConfig = {
  actionUrl: string;
  entries: {
    working: string;
    frustrating: string;
    better: string;
    email: string;
    rating: string;
  };
};

export const readFeedbackFormConfig = (): FeedbackFormConfig | null => {
  const actionUrl = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_FORM_ACTION?.trim();
  const working = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_ENTRY_WORKING?.trim();
  const frustrating =
    process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_ENTRY_FRUSTRATING?.trim();
  const better = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_ENTRY_BETTER?.trim();
  const email = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_ENTRY_EMAIL?.trim();
  const rating = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_ENTRY_RATING?.trim();

  if (!actionUrl || !working || !frustrating || !better || !email || !rating) {
    return null;
  }

  return {
    actionUrl,
    entries: { working, frustrating, better, email, rating },
  };
};

export const FEEDBACK_PROMPT_DISMISSED_KEY = "praxis_feedback_prompt_dismissed";
export const FEEDBACK_PROMPT_MIN_SESSIONS = 5;
