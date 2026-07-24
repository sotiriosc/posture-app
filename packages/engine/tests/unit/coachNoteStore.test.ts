import { afterEach, describe, expect, test, vi } from "vitest";
import {
  COACH_NOTE_STORAGE_KEY,
  clearCoachNoteHistory,
  shouldShowCoachNote,
} from "@/lib/coachNoteStore";

/**
 * Phase 6f, Commit 4 — "never repeat identically two days in a row."
 * Same fake-localStorage pattern as subscriptionStore.test.ts.
 */
const installLocalStorageStub = () => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
  });
  return store;
};

const day = (n: number) => new Date(2026, 0, n);

describe("shouldShowCoachNote", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a null/empty note is never shown", () => {
    installLocalStorageStub();
    expect(shouldShowCoachNote(null, day(1))).toBe(false);
    expect(shouldShowCoachNote(undefined, day(1))).toBe(false);
    expect(shouldShowCoachNote("", day(1))).toBe(false);
  });

  test("the first note ever evaluated is shown", () => {
    installLocalStorageStub();
    expect(shouldShowCoachNote("Next best action: Complete Day 1.", day(1))).toBe(true);
  });

  test("re-evaluating the same note on the same day stays visible", () => {
    installLocalStorageStub();
    const note = "Next best action: Complete Day 1.";
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
  });

  test("an identical note on the very next day is suppressed (never nag)", () => {
    installLocalStorageStub();
    const note = "Next best action: Complete Day 1.";
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
    expect(shouldShowCoachNote(note, day(2))).toBe(false);
  });

  test("a suppressed note stays suppressed as long as it stays identical", () => {
    installLocalStorageStub();
    const note = "Next best action: Complete Day 1.";
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
    expect(shouldShowCoachNote(note, day(2))).toBe(false);
    expect(shouldShowCoachNote(note, day(3))).toBe(false);
  });

  test("a changed note on a new day is shown again", () => {
    installLocalStorageStub();
    expect(shouldShowCoachNote("Next best action: Complete Day 1.", day(1))).toBe(true);
    expect(
      shouldShowCoachNote("Next best action: Take today off. Recovery is the work.", day(2))
    ).toBe(true);
  });

  test("a note that changes back reappears (comparison is only against the last evaluated day)", () => {
    installLocalStorageStub();
    expect(shouldShowCoachNote("A", day(1))).toBe(true);
    expect(shouldShowCoachNote("B", day(2))).toBe(true);
    expect(shouldShowCoachNote("A", day(3))).toBe(true);
  });

  test("calling twice back-to-back for the same day (e.g. React Strict Mode double-invoking an effect) does not flip a freshly-suppressed note back to visible", () => {
    installLocalStorageStub();
    const note = "Next best action: Complete Day 1.";
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
    // Day 2: first call suppresses and persists that decision.
    expect(shouldShowCoachNote(note, day(2))).toBe(false);
    // A second call the same day must replay the same decision, not
    // recompute from scratch (which would now see "already updated to
    // today" and incorrectly show it).
    expect(shouldShowCoachNote(note, day(2))).toBe(false);
  });

  test("clearCoachNoteHistory resets the suppression state", () => {
    const store = installLocalStorageStub();
    const note = "Next best action: Complete Day 1.";
    expect(shouldShowCoachNote(note, day(1))).toBe(true);
    expect(store.has(COACH_NOTE_STORAGE_KEY)).toBe(true);
    clearCoachNoteHistory();
    expect(store.has(COACH_NOTE_STORAGE_KEY)).toBe(false);
    expect(shouldShowCoachNote(note, day(2))).toBe(true);
  });

  test("malformed JSON is treated as no history rather than throwing", () => {
    const store = installLocalStorageStub();
    store.set(COACH_NOTE_STORAGE_KEY, "{not json");
    expect(shouldShowCoachNote("Next best action: Complete Day 1.", day(1))).toBe(true);
  });
});
