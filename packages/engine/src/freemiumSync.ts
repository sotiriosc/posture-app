/**
 * Phase 6j Commit 1 — persist / resolve the freemium first-week latch.
 * Uses LogPrefs (Phase 6e user-scoped via logStore) so the flag survives
 * sessions and logins on the same account.
 */

import { whenLocalOwnerReady } from "@/lib/accountIsolation";
import {
  deriveHasCompletedFirstWeek,
  normalizeSessionsPerWeek,
} from "@/lib/freemiumAccess";
import { listSessions, loadPrefs, savePrefs } from "@/lib/logStore";

const parseDayIndexFromNotes = (notes: string | null): number | null => {
  if (!notes) return null;
  const match = notes.match(/dayIndex:(\d+)/);
  if (!match) return null;
  const dayIndex = Number(match[1]);
  return Number.isFinite(dayIndex) ? dayIndex : null;
};

const readSessionsPerWeekFromQuestionnaire = (): number | null => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("posture_questionnaire");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { daysPerWeek?: unknown };
    const value = Number(parsed.daysPerWeek);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

/**
 * Derive whether the free first week is done; latch true into LogPrefs once.
 */
export const resolveHasCompletedFirstWeek = async (
  sessionsPerWeek?: number | null
): Promise<boolean> => {
  // Never read training state while an account-switch wipe is in flight.
  await whenLocalOwnerReady();

  const prefs = await loadPrefs();
  if (prefs.hasCompletedFirstWeek === true) return true;

  const target = normalizeSessionsPerWeek(
    sessionsPerWeek ?? readSessionsPerWeekFromQuestionnaire()
  );
  const sessions = await listSessions(500);
  const completedDayIndexes = sessions
    .filter((session) => Boolean(session.completedAt) && !session.deletedAt)
    .map((session) => parseDayIndexFromNotes(session.notes))
    .filter((dayIndex): dayIndex is number => dayIndex !== null);

  const done = deriveHasCompletedFirstWeek({
    completedDayIndexes,
    sessionsPerWeek: target,
    persistedFlag: prefs.hasCompletedFirstWeek,
  });

  if (done) {
    await savePrefs({ ...prefs, hasCompletedFirstWeek: true });
  }
  return done;
};
