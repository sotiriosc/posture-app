/**
 * Phase 6f, Commit 4 — daily "Next best action" coach note on the dashboard.
 *
 * The three coach notes (Biggest win / Biggest risk / Next best action)
 * already exist and are always computed from real state (see
 * ResultsRoutine.tsx's `coachAction`) — they only fail to reach the user
 * daily because they're bundled behind the Insights panel, which unlocks
 * after a full week. This module does not generate the note (that stays a
 * UI-layer concern, computed from state ResultsRoutine already has); it
 * only implements the "never repeat identically two days in a row" rule so
 * the same static advice doesn't nag a user who hasn't acted on it yet.
 *
 * Rule: a note is suppressed on day N only if it is byte-identical to the
 * note last actually evaluated on a *different*, earlier day. Once
 * suppressed, it stays suppressed on every subsequent day the note remains
 * unchanged — it reappears only once the underlying advice actually
 * changes (e.g. the user finally logs a session, or a new day's plan
 * differs). This is a deliberate design choice: "never nag" means don't
 * keep repeating the same line forever, not "show it every other day."
 */

export const COACH_NOTE_STORAGE_KEY = "praxis_coach_note_v1";

type StoredCoachNote = {
  /** Calendar day (device-local, YYYY-MM-DD) this note was last evaluated on. */
  date: string;
  note: string;
  /**
   * Whether the note was actually shown on `date`. Once a day's decision is
   * made it is locked in and replayed verbatim for any further calls that
   * same day (e.g. React 18 Strict Mode double-invoking effects in dev, or
   * a re-render) — recomputing per-call instead would let the very act of
   * evaluating twice flip a freshly-suppressed note back to visible.
   */
  shown: boolean;
};

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const readStoredCoachNote = (): StoredCoachNote | null => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(COACH_NOTE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCoachNote> | null;
    if (
      !parsed ||
      typeof parsed.date !== "string" ||
      typeof parsed.note !== "string" ||
      typeof parsed.shown !== "boolean"
    ) {
      return null;
    }
    return { date: parsed.date, note: parsed.note, shown: parsed.shown };
  } catch {
    return null;
  }
};

const writeStoredCoachNote = (record: StoredCoachNote): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(COACH_NOTE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Best-effort only — a full/blocked localStorage must never crash a render.
  }
};

/**
 * Decide whether `note` should be shown today, and record today's
 * evaluation so tomorrow's call can compare against it. Call once per
 * mount/note-change; the result is stable for the rest of the calendar day
 * (repeated calls on the same day with the same note keep returning the
 * same answer rather than flapping).
 */
export const shouldShowCoachNote = (
  note: string | null | undefined,
  now: Date = new Date()
): boolean => {
  if (!note) return false;

  const today = toDateKey(now);
  const stored = readStoredCoachNote();

  if (stored && stored.date === today) {
    return stored.shown;
  }

  const isRepeatOfLastEvaluatedNote = stored?.note === note;
  const shown = !isRepeatOfLastEvaluatedNote;
  writeStoredCoachNote({ date: today, note, shown });
  return shown;
};

export const clearCoachNoteHistory = (): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(COACH_NOTE_STORAGE_KEY);
  } catch {
    // Best-effort only.
  }
};
