import { describe, expect, test } from "vitest";
import {
  formatSessionFeedbackSummary,
  sanitizeSessionFeedback,
} from "@/lib/sessionFeedback";
import type { SessionRecord } from "@/lib/types";

const oldSession: SessionRecord = {
  id: "old-session",
  userId: null,
  startedAt: "2026-02-15T00:00:00.000Z",
  completedAt: "2026-02-15T00:30:00.000Z",
  createdAt: "2026-02-15T00:00:00.000Z",
  updatedAt: "2026-02-15T00:30:00.000Z",
  routineId: "program-1",
  durationSec: 1800,
  notes: "dayIndex:0",
  sessionFeedback: null,
  sessionPainLocation: null,
  sessionFeedbackNotes: null,
  source: "local",
  deletedAt: null,
};

describe("session feedback", () => {
  test("old session records without feedback still read normally", () => {
    expect(oldSession.feedback).toBeUndefined();
    expect(formatSessionFeedbackSummary(oldSession.feedback)).toBeNull();
  });

  test("sanitizes bounded feedback values", () => {
    expect(
      sanitizeSessionFeedback({
        completed: "partial",
        difficultyRPE: 12.4,
        painBefore: -2,
        painAfter: 3.2,
        energy: 9,
        techniqueConfidence: 0,
        enjoyment: 7,
        timeAvailableNextSession: 999,
        notes: "  Felt okay.  ",
      })
    ).toEqual({
      completed: "partial",
      difficultyRPE: 10,
      painBefore: 0,
      painAfter: 3,
      energy: 5,
      techniqueConfidence: 1,
      enjoyment: 5,
      timeAvailableNextSession: 180,
      notes: "Felt okay.",
    });
  });

  test("formats compact summaries only when feedback exists", () => {
    expect(formatSessionFeedbackSummary(null)).toBeNull();
    expect(
      formatSessionFeedbackSummary({
        completed: "yes",
        difficultyRPE: 7,
        painBefore: 2,
        painAfter: 3,
        techniqueConfidence: 4,
      })
    ).toBe("Difficulty 7/10 • Pain 2 -> 3 • Confidence 4/5");
  });
});

